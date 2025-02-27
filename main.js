import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import * as CANNON from 'cannon-es';
import * as Papa from 'papaparse';
import * as Swiper from 'swiper';

THREE.Cache.enabled = true;

// Constants
const GRAVITY = -50;
const DESPAWN_HEIGHT = -1000;
const TEXT_INSTANCE_COUNT = 20;

let container, camera, scene, renderer, group, world, font;
let materials = new THREE.MeshPhongMaterial({ color: 0xffffff });
const textInstances = [];

// Initialize application
//loadProjectData();

init();


function setupScene() {
    container = document.createElement('div');
    document.body.appendChild(container);
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1500);
    camera.position.set(0, 400, 700);
    camera.lookAt(0, 100, 0);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 200, 100).normalize();
    scene.add(light);

    group = new THREE.Group();
    scene.add(group);
}

function setupRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);
    renderer.setAnimationLoop(animate);
}

async function init() {
    const projectDescriptions = await loadProjectData(); // Load and get project data
    setupOverlay(projectDescriptions); // Set up the overlay with project data
    setupScene(); // Now that data is ready, set up the scene
    setupRenderer(); // Set up the renderer
    setupPhysics(); // Set up physics
    loadFont(); // Load the font for text
}

async function loadProjectData() {
    try {
        const response = await fetch('data.csv');
        const csvText = await response.text();
        const parsedData = Papa.parse(csvText, { header: true });

        const projectDescriptions = parsedData.data.map(row => ({
            title: row.title,
            description: row.description,
            images: row.images ? row.images.split(',') : [],
            year: parseInt(row.year, 10) || 0 // Ensure year is a number
        })).sort((a, b) => b.year - a.year); // Sort projects by year, most recent first

        return projectDescriptions; // Return the sorted project data
    } catch (error) {
        console.error('Error loading CSV:', error);
        return []; // Return an empty array in case of an error
    }
}

function setupOverlay(projectDescriptions) {
    const overlay = createOverlay();
    document.body.appendChild(overlay);

    const projectsContainer = createProjectsContainer(projectDescriptions);
    overlay.appendChild(projectsContainer);

    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 3000);
}


function createOverlay() {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    overlay.innerHTML = `
        <div id="title">
            <p id="overlay">I'm a <b>Fullstack Interactive Developer</b> & <b>Creative Technologist</b>, crafting immersive experiences and interactive visuals that hopefully bring a bit of fun and joy in people's life <b>:)</b></p>
        </div>`;


    // Footer
    const footer = document.createElement('footer');
    footer.innerHTML = `
        <p>inquiries: <a href="mailto:sam@stremblay.cc">sam@stremblay.cc</a></p>`;
    document.body.appendChild(footer);

    return overlay;
}

function createProjectsContainer(projectDescriptions) {
    const projectsContainer = document.createElement('div');
    projectsContainer.classList.add('projects');

    projectDescriptions.forEach((project) => {
        const projectElement = createProjectElement(project);
        projectsContainer.appendChild(projectElement);
    });

    return projectsContainer;
}

function createProjectElement(project) {
    const projectElement = document.createElement('div');
    projectElement.classList.add('project');
    projectElement.style.backgroundImage = `url('${project.images[0]}')`;

    const overlayText = document.createElement('div');
    overlayText.classList.add('overlay');
    overlayText.innerHTML = `<b>${project.title}</b>`;
    projectElement.appendChild(overlayText);

    projectElement.addEventListener('click', () => showProjectBlock(project));

    return projectElement;
}

function showProjectBlock(projectData) {
    const projectBlock = document.createElement('div');
    projectBlock.classList.add('project-block');

    const titleElement = document.createElement('h2');
    titleElement.textContent = projectData.title;

    const descriptionElement = document.createElement('p');
    descriptionElement.innerHTML = projectData.description;

    const imageContainer = createImageContainer(projectData.images);
    const closeButton = createCloseButton(projectBlock);

    // Aligning items in a column
    projectBlock.appendChild(titleElement);
    projectBlock.appendChild(closeButton);

    projectBlock.appendChild(descriptionElement);
    projectBlock.appendChild(imageContainer);

    document.body.appendChild(projectBlock);
}


function createImageContainer(images) {
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('image-container');

    images.forEach(imageUrl => {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.classList.add('responsive-img');
        imageContainer.appendChild(img);
    });

    return imageContainer;
}

function createCloseButton(projectBlock) {
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.classList.add('close-button');
    closeButton.addEventListener('click', () => {
        document.body.removeChild(projectBlock);
    });

    return closeButton;
}

function setupPhysics() {
    world = new CANNON.World();
    world.gravity.set(0, GRAVITY, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
}

function loadFont() {
    const loader = new FontLoader();
    loader.load('fonts/helvetiker_regular.typeface.json', function (response) {
        font = response;
        sprinkleText(TEXT_INSTANCE_COUNT);
    });
}

function sprinkleText(count) {
    for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 500;
        const y = 300 + Math.random() * 300;
        const z = (Math.random() - 0.5) * 500;

        createTextInstance("Sam Tremblay", x, y, z, 20, 1);
    }
}
function createTextInstance(text, x, y, z, size, depth) {
    const textGeo = new TextGeometry(text, {
        font: font,
        size: size,
        depth: depth,
        bevelEnabled: true,
        bevelThickness: 1,
        bevelSize: 0.5
    });

    textGeo.computeBoundingBox();
    textGeo.center(); // Center the text geometry

    const centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);

    const textMesh = new THREE.Mesh(textGeo, materials);
    textMesh.position.set(x + centerOffset, y, z);
    textMesh.scale.z = 0.2;
    group.add(textMesh);

    const textBody = new CANNON.Body({
        mass: 2,
        shape: new CANNON.Box(new CANNON.Vec3(size / 2, depth / 2, 5)),
        position: new CANNON.Vec3(x, y, z),
        material: new CANNON.Material()
    });

    textBody.velocity.set(Math.random() * 10 - 5, -10, Math.random() * 10 - 5);
    textBody.angularVelocity.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);

    world.addBody(textBody);
    textInstances.push({ textMesh, textBody, initialPosition: { x, y, z } }); // Store the initial position
}

function animate() {
    world.step(1 / 60);

    for (let i = textInstances.length - 1; i >= 0; i--) {
        const { textMesh, textBody, initialPosition } = textInstances[i];

        textMesh.position.copy(textBody.position);
        textMesh.quaternion.copy(textBody.quaternion);

        // Check if the text body is below the despawn height
        if (textBody.position.y < DESPAWN_HEIGHT) {
            group.remove(textMesh);
            world.removeBody(textBody);
            // Reset to initial position
            //Shit is too distracting...
           // textBody.position.set(initialPosition.x, initialPosition.y, initialPosition.z);
        //textBody.velocity.set(Math.random() * 10 - 5, -10, Math.random() * 10 - 5); // Reset velocity if needed
        }
    }

    renderer.render(scene, camera);
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

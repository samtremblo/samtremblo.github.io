import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import * as CANNON from 'cannon-es';
import { marked } from 'marked';
import * as Swiper from 'swiper';

THREE.Cache.enabled = true;

// Constants
const GRAVITY = -50;
const DESPAWN_HEIGHT = -1000;
const TEXT_INSTANCE_COUNT = 20;

let container, camera, scene, renderer, group, world, font;
let materials = new THREE.MeshPhongMaterial({ color: 0xffffff });
const textInstances = [];
let projectsData = [];

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
    projectsData = await loadProjectData(); // Load and get project data
    setupOverlay(projectsData); // Set up the overlay with project data
    setupScene(); // Now that data is ready, set up the scene
    setupRenderer(); // Set up the renderer
    setupPhysics(); // Set up physics
    loadFont(); // Load the font for text
    
    // Handle initial URL routing
    handleInitialRoute();
    
    // Listen for browser back/forward navigation
    window.addEventListener('popstate', handlePopState);
}

async function loadProjectData() {
    try {
        const response = await fetch('data.json');
        const projectData = await response.json();

        // Process markdown in descriptions and sort by year
        const projectDescriptions = projectData
            .map(project => ({
                ...project,
                description: marked(project.description),
                year: parseInt(project.year, 10) || 0
            }))
            .sort((a, b) => b.year - a.year);

        return projectDescriptions;
    } catch (error) {
        console.error('Error loading project data:', error);
        return [];
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
    overlayText.innerHTML = `
        <div class="project-info">
            <h3>${project.title}</h3>
            <span class="project-year">${project.year}</span>
            ${project.client ? `<span class="project-client">${project.client}</span>` : ''}
        </div>
    `;
    projectElement.appendChild(overlayText);

    projectElement.addEventListener('click', () => {
        showProjectBlock(project);
        updateURL(project.id);
    });

    return projectElement;
}

function showProjectBlock(projectData) {
    // Close any existing project block first
    const existingBlock = document.querySelector('.project-block');
    if (existingBlock) {
        // Clean up keyboard listener if it exists
        if (existingBlock.keyHandler) {
            document.removeEventListener('keydown', existingBlock.keyHandler);
        }
        document.body.removeChild(existingBlock);
    }
    
    const projectBlock = document.createElement('div');
    projectBlock.classList.add('project-block');

    const headerElement = document.createElement('div');
    headerElement.classList.add('project-header');
    headerElement.innerHTML = `
        <h2>${projectData.title}</h2>
        <div class="project-meta">
            <span class="project-year">${projectData.year}</span>
            ${projectData.client ? `<span class="project-client">${projectData.client}</span>` : ''}
            ${projectData.tags ? `<div class="project-tags">${projectData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
        </div>
    `;

    const descriptionElement = document.createElement('div');
    descriptionElement.classList.add('project-description');
    descriptionElement.innerHTML = projectData.description;

    const imageContainer = createImageContainer(projectData.images);
    const closeButton = createCloseButton(projectBlock);

    projectBlock.appendChild(headerElement);
    projectBlock.appendChild(closeButton);
    projectBlock.appendChild(descriptionElement);
    projectBlock.appendChild(imageContainer);

    document.body.appendChild(projectBlock);
    
    // Add keyboard support for closing with Escape key
    const handleKeyPress = (event) => {
        if (event.key === 'Escape') {
            document.body.removeChild(projectBlock);
            clearURL();
            document.removeEventListener('keydown', handleKeyPress);
        }
    };
    projectBlock.keyHandler = handleKeyPress; // Store reference for cleanup
    document.addEventListener('keydown', handleKeyPress);
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
        clearURL();
        // Remove any active keyboard listeners
        document.removeEventListener('keydown', projectBlock.keyHandler);
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

// URL routing functions
function updateURL(projectId) {
    const newURL = `${window.location.origin}${window.location.pathname}#${projectId}`;
    window.history.pushState({ projectId }, '', newURL);
}

function clearURL() {
    const newURL = `${window.location.origin}${window.location.pathname}`;
    window.history.pushState({}, '', newURL);
}

function getProjectIdFromURL() {
    return window.location.hash.slice(1); // Remove the # symbol
}

function handleInitialRoute() {
    const projectId = getProjectIdFromURL();
    if (projectId) {
        const project = projectsData.find(p => p.id === projectId);
        if (project) {
            showProjectBlock(project);
        }
    }
}

function handlePopState(event) {
    const projectId = getProjectIdFromURL();
    
    // Close any open project blocks
    const existingBlock = document.querySelector('.project-block');
    if (existingBlock) {
        // Clean up keyboard listener if it exists
        if (existingBlock.keyHandler) {
            document.removeEventListener('keydown', existingBlock.keyHandler);
        }
        document.body.removeChild(existingBlock);
    }
    
    // Open project if ID is present in URL
    if (projectId) {
        const project = projectsData.find(p => p.id === projectId);
        if (project) {
            showProjectBlock(project);
        }
    }
}

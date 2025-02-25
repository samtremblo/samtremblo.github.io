import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import * as CANNON from 'cannon-es';

THREE.Cache.enabled = true;

let container, camera, scene, renderer, group, world, font;
let materials = new THREE.MeshPhongMaterial({ color: 0xffffff });

const gravity = -50;
const textInstances = []; // Store text meshes & bodies
const despawnHeight = -1000; // Threshold for removing text

init();
setupOverlay();

function init() {
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

    loadFont();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);
    setupPhysics();
    renderer.setAnimationLoop(animate);
}

function setupOverlay() {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.background = 'rgba(0, 0, 0, 0.5)';
    overlay.style.backdropFilter = 'blur(10px)';
    overlay.style.color = 'white';
    overlay.style.fontSize = '24px';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 1s ease-in-out';
    overlay.innerHTML = '<p>Sam Tremblay</p>';
    document.body.appendChild(overlay);


    // Load external HTML file
    fetch('overlay.html')
        .then(response => response.text())
        .then(html => {
            overlay.innerHTML = html; // Insert HTML content
            setTimeout(() => { overlay.style.opacity = '1'; }, 3200);
        })
        .catch(error => console.error('Error loading overlay:', error));
}

function setupPhysics() {
    world = new CANNON.World();
    world.gravity.set(0, gravity, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
}

function loadFont() {
    const loader = new FontLoader();
    loader.load('fonts/helvetiker_regular.typeface.json', function (response) {
        font = response;
        sprinkleText(20); // Create 10 small "Sam Tremblay" texts
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
    textMesh.scale.z = .2;
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
    textInstances.push({ textMesh, textBody });
}

function animate() {
    world.step(1 / 60);

    for (let i = textInstances.length - 1; i >= 0; i--) {
        const { textMesh, textBody } = textInstances[i];

        textMesh.position.copy(textBody.position);
        textMesh.quaternion.copy(textBody.quaternion);

        if (textBody.position.y < despawnHeight) {
            group.remove(textMesh);
            world.removeBody(textBody);
            textInstances.splice(i, 1); // Remove from array
        }
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

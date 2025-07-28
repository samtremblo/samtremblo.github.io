import { marked } from 'marked';

let projectsData = [];

// Initialize application
init();

async function init() {
    projectsData = await loadProjectData();
    setupProjects(projectsData);
    setupModal();
    setupTypewriter();
    setupWoodstockToggle();
    setupFullscreenImages();
    setupConsoleEasterEgg();
    
    // Handle initial URL routing
    handleInitialRoute();
    
    // Listen for browser back/forward navigation
    window.addEventListener('popstate', handlePopState);
}

async function loadProjectData() {
    try {
        const response = await fetch('./data.json');
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

function setupProjects(projectDescriptions) {
    const projectsContainer = document.getElementById('projects-container');
    
    projectDescriptions.forEach((project) => {
        const projectCard = createProjectCard(project);
        projectsContainer.appendChild(projectCard);
    });
}

function createProjectCard(project) {
    const projectCard = document.createElement('div');
    projectCard.classList.add('project-card');
    
    // Add random wobble animation
    const wobbleAnimations = ['subtle-wobble-1', 'subtle-wobble-2', 'subtle-wobble-3', 'subtle-wobble-4', 'subtle-wobble-5'];
    const randomWobble = wobbleAnimations[Math.floor(Math.random() * wobbleAnimations.length)];
    const randomDuration = 7 + Math.random() * 4; // Between 7-11 seconds
    const randomDelay = Math.random() * 2; // 0-2 second delay
    
    projectCard.style.animation = `${randomWobble} ${randomDuration}s ease-in-out infinite`;
    projectCard.style.animationDelay = `${randomDelay}s`;
    
    // Store wobble info for Woodstock mode
    projectCard.setAttribute('data-wobble', randomWobble);
    projectCard.style.setProperty('--wobble-duration', `${randomDuration}s`);
    projectCard.style.setProperty('--wobble-delay', `${randomDelay}s`);
    
    const projectHeader = document.createElement('div');
    projectHeader.classList.add('project-header');
    
    const projectTitle = document.createElement('h3');
    projectTitle.classList.add('project-title');
    projectTitle.textContent = project.title;
    
    const projectYear = document.createElement('span');
    projectYear.classList.add('project-year');
    projectYear.textContent = project.year;
    
    projectHeader.appendChild(projectTitle);
    projectHeader.appendChild(projectYear);
    
    if (project.client) {
        const projectClient = document.createElement('div');
        projectClient.classList.add('project-client');
        projectClient.textContent = project.client;
        projectCard.appendChild(projectClient);
    }
    
    const projectDescription = document.createElement('div');
    projectDescription.classList.add('project-description');
    // Get first paragraph or truncate description
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = project.description;
    const firstP = tempDiv.querySelector('p');
    const shortDesc = firstP ? firstP.textContent : tempDiv.textContent;
    projectDescription.textContent = shortDesc.length > 120 ? 
        shortDesc.substring(0, 120) + '...' : shortDesc;
    
    if (project.images && project.images.length > 0) {
        const thumbnail = document.createElement('img');
        thumbnail.classList.add('project-thumbnail');
        thumbnail.src = project.images[0];
        thumbnail.alt = project.title;
        projectCard.appendChild(thumbnail);
    }
    
    projectCard.appendChild(projectHeader);
    projectCard.appendChild(projectDescription);
    
    projectCard.addEventListener('click', () => {
        showProjectModal(project);
        updateURL(project.id);
    });
    
    // Store original project data for game reset
    projectCard._originalProject = project;
    
    // Add unique identifier for game collision detection
    projectCard.setAttribute('data-project-id', project.id || project.title);
    
    return projectCard;
}

function setupModal() {
    const modal = document.getElementById('project-modal');
    const closeBtn = modal.querySelector('.close');
    
    closeBtn.addEventListener('click', () => {
        closeModal();
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
}

function showProjectModal(projectData) {
    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-body');
    const modalHeader = modal.querySelector('.modal-header');
    
    // Update header title
    let modalTitle = modalHeader.querySelector('.modal-title');
    if (!modalTitle) {
        modalTitle = document.createElement('h1');
        modalTitle.classList.add('modal-title');
        modalHeader.insertBefore(modalTitle, modalHeader.firstChild);
    }
    modalTitle.textContent = `$ cat projects/${projectData.title.toLowerCase().replace(/\s+/g, '-')}`;
    
    const title = document.createElement('h2');
    title.classList.add('modal-project-title');
    title.textContent = projectData.title;
    
    const meta = document.createElement('div');
    meta.classList.add('modal-project-meta');
    
    const year = document.createElement('span');
    year.classList.add('modal-project-year');
    year.textContent = projectData.year;
    meta.appendChild(year);
    
    if (projectData.client) {
        const client = document.createElement('span');
        client.classList.add('modal-project-client');
        client.textContent = projectData.client;
        meta.appendChild(client);
    }
    
    const description = document.createElement('div');
    description.classList.add('modal-project-description');
    description.innerHTML = projectData.description;
    
    const imagesContainer = document.createElement('div');
    imagesContainer.classList.add('modal-images');
    
    if (projectData.images && projectData.images.length > 0) {
        projectData.images.forEach(imageUrl => {
            const img = document.createElement('img');
            img.classList.add('modal-image');
            img.src = imageUrl;
            img.alt = projectData.title;
            img.addEventListener('click', () => showFullscreenImage(imageUrl, projectData.title));
            imagesContainer.appendChild(img);
        });
    }
    
    modalBody.innerHTML = '';
    modalBody.appendChild(title);
    modalBody.appendChild(meta);
    modalBody.appendChild(description);
    modalBody.appendChild(imagesContainer);
    
    modal.style.display = 'block';
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('project-modal');
    modal.style.display = 'none';
    
    // Restore body scrolling when modal closes
    document.body.style.overflow = '';
    
    clearURL();
}

function setupTypewriter() {
    const typewriterLines = [
        { element: '$ whoami', delay: 300 },
        { element: 'Fullstack Interactive Developer & Creative Technologist', delay: 600, isResponse: true },
        { element: '$ mission', delay: 1200 },
        { element: 'Crafting immersive experiences and interactive visuals that bring joy :)', delay: 1500, isResponse: true }
    ];
    
    const typewriterContainer = document.querySelector('.typewriter');
    const lines = typewriterContainer.querySelectorAll('p');
    
    // Hide all lines initially
    lines.forEach(line => {
        line.style.opacity = '1';
    });
    
   
    // Show the blinking cursor much sooner
    setTimeout(() => {
        const cursor = document.querySelector('.blinking-cursor');
        if (cursor) {
            cursor.style.opacity = '1';
        }
    }, 2500);
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
            showProjectModal(project);
        }
    }
}

function handlePopState(event) {
    const projectId = getProjectIdFromURL();
    
    // Close any open modals
    const modal = document.getElementById('project-modal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
        // Restore body scrolling
        document.body.style.overflow = '';
    }
    
    // Open project if ID is present in URL
    if (projectId) {
        const project = projectsData.find(p => p.id === projectId);
        if (project) {
            showProjectModal(project);
        }
    }
}

// Woodstock Mode Toggle functionality
function setupWoodstockToggle() {
    const toggleButton = document.getElementById('woodstock-toggle');
    
    // Check for saved Woodstock mode state
    const savedWoodstockMode = localStorage.getItem('woodstock-mode') === 'true';
    if (savedWoodstockMode) {
        document.body.classList.add('woodstock-mode');
        toggleButton.textContent = 'W';
        toggleButton.title = 'Exit Woodstock Mode';
    } else {
        toggleButton.title = 'Enter Woodstock Mode';
    }
    
    toggleButton.addEventListener('click', () => {
        const isWoodstockMode = document.body.classList.toggle('woodstock-mode');
        
        // Update button text and tooltip
        if (isWoodstockMode) {
            toggleButton.textContent = 'W';
            toggleButton.title = 'Exit Woodstock Mode';
        } else {
            toggleButton.textContent = 'W';
            toggleButton.title = 'Enter Woodstock Mode';
        }
        
        // Save state to localStorage
        localStorage.setItem('woodstock-mode', isWoodstockMode.toString());
        
        // Add a fun shake effect when toggling
        toggleButton.style.animation = 'none';
        setTimeout(() => {
            toggleButton.style.animation = '';
        }, 10);
    });
}

// Fullscreen image functionality
function setupFullscreenImages() {
    const fullscreenOverlay = document.getElementById('fullscreen-overlay');
    const fullscreenClose = document.querySelector('.fullscreen-close');
    
    // Close fullscreen when clicking close button
    fullscreenClose.addEventListener('click', closeFullscreenImage);
    
    // Close fullscreen when clicking overlay (but not the image)
    fullscreenOverlay.addEventListener('click', (e) => {
        if (e.target === fullscreenOverlay) {
            closeFullscreenImage();
        }
    });
    
    // Close fullscreen with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && fullscreenOverlay.style.display === 'flex') {
            closeFullscreenImage();
        }
    });
}

function showFullscreenImage(imageSrc, altText) {
    const fullscreenOverlay = document.getElementById('fullscreen-overlay');
    const fullscreenImage = document.getElementById('fullscreen-image');
    
    fullscreenImage.src = imageSrc;
    fullscreenImage.alt = altText;
    fullscreenOverlay.style.display = 'flex';
    
    // Prevent body scrolling when fullscreen is open
    document.body.style.overflow = 'hidden';
}

function closeFullscreenImage() {
    const fullscreenOverlay = document.getElementById('fullscreen-overlay');
    fullscreenOverlay.style.display = 'none';
    
    // Restore body scrolling
    document.body.style.overflow = '';
}

// Console Easter Egg functionality
let commandBuffer = '';
let commandTimeout = null;
let temporaryWoodstockTimeout = null;
let consoleVisible = false;

function setupConsoleEasterEgg() {
    const consoleInputLine = document.querySelector('.console-input-line');
    const consolePrompt = document.querySelector('.console-prompt');
    const consoleInput = document.getElementById('console-input');
    const consoleHistory = document.getElementById('console-history');
    
    document.addEventListener('keydown', (e) => {
        // Only capture when not in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Show console prompt on first keystroke
        if (!consoleVisible) {
            showConsole();
        }
        
        // Clear timeout if user is actively typing
        if (commandTimeout) {
            clearTimeout(commandTimeout);
        }
        
        // Handle Enter key
        if (e.key === 'Enter') {
            if (commandBuffer.trim() !== '') {
                addCommandToHistory(`sam@portfolio:~$ ${commandBuffer}`);
                processCommand(commandBuffer.toLowerCase().trim());
            }
            commandBuffer = '';
            updateConsoleDisplay();
            
            // Hide prompt after command execution, but keep cursor
            setTimeout(() => {
                hideConsolePrompt();
            }, 4000);
            return;
        }
        
        // Handle Backspace
        if (e.key === 'Backspace') {
            commandBuffer = commandBuffer.slice(0, -1);
            updateConsoleDisplay();
            return;
        }
        
        // Add character to buffer if it's a printable character
        if (e.key.length === 1 && /[a-zA-Z0-9\s\-_]/.test(e.key)) {
            commandBuffer += e.key.toLowerCase();
            updateConsoleDisplay();
            
            // Hide prompt after inactivity, but keep cursor
            commandTimeout = setTimeout(() => {
                commandBuffer = '';
                updateConsoleDisplay();
                hideConsolePrompt();
            }, 6000);
        }
    });
    
    function showConsole() {
        consolePrompt.classList.add('active');
        consoleVisible = true;
    }
    
    function hideConsolePrompt() {
        consolePrompt.classList.remove('active');
        consoleVisible = false;
    }
    
    function updateConsoleDisplay() {
        consoleInput.textContent = commandBuffer;
    }
    
    function addCommandToHistory(text, className = '') {
        const line = document.createElement('div');
        line.className = `console-line ${className}`;
        line.textContent = text;
        consoleHistory.appendChild(line);
        
        // Auto-scroll to bottom
        consoleHistory.scrollTop = consoleHistory.scrollHeight;
    }
    
    // Make these functions available to processCommand
    window.addCommandToHistory = addCommandToHistory;
}

function processCommand(command) {
    if (command === 'whoami') {
        window.addCommandToHistory('Fullstack Interactive Developer & Creative Technologist', 'response');
    } else if (command === 'woodstock') {
        window.addCommandToHistory('mode activated', 'response');
        activateTemporaryWoodstock();
    } else if (command === 'mirror') {
        const isMirrored = document.body.classList.toggle('mirror-mode');
        if (isMirrored) {
            window.addCommandToHistory('mirror on', 'response');
        } else {
            window.addCommandToHistory('mirror off', 'response');
        }
    } else if (command === 'flip') {
        const isFlipped = document.body.classList.toggle('flip-mode');
        if (isFlipped) {
            window.addCommandToHistory('flip on', 'response');
        } else {
            window.addCommandToHistory('flip off', 'response');
        }
    } else if (command === 'game') {
        window.addCommandToHistory('game started - use arrow keys to move, space to shoot', 'response');
        startGame();
    } else if (command === 'help') {
        window.addCommandToHistory('commands:', 'response');
        window.addCommandToHistory('  whoami', 'response');
        window.addCommandToHistory('  woodstock', 'response');
        window.addCommandToHistory('  mirror', 'response');
        window.addCommandToHistory('  flip', 'response');
        window.addCommandToHistory('  game', 'response');
        window.addCommandToHistory('  help', 'response');
        window.addCommandToHistory('  clear', 'response');
    } else if (command === 'clear') {
        setTimeout(() => {
            const history = document.getElementById('console-history');
            history.innerHTML = '';
        }, 100);
        return;
    } else if (command === '') {
        // Empty command, do nothing
        return;
    } else {
        window.addCommandToHistory(`command not found: ${command}`, 'error');
        window.addCommandToHistory('type help', 'response');
    }
}

function activateTemporaryWoodstock() {
    const wasWoodstockActive = document.body.classList.contains('woodstock-mode');
    const toggleButton = document.getElementById('woodstock-toggle');
    
    // Clear any existing temporary timeout
    if (temporaryWoodstockTimeout) {
        clearTimeout(temporaryWoodstockTimeout);
    }
    
    // Activate Woodstock mode
    document.body.classList.add('woodstock-mode');
    if (toggleButton) {
        toggleButton.textContent = 'W';
        toggleButton.title = 'Exit Woodstock Mode (Temporary)';
    }
    
    // Add temporary indicator to the page
    showTemporaryModeIndicator();
    
    temporaryWoodstockTimeout = setTimeout(() => {
        if (!wasWoodstockActive) {
            document.body.classList.remove('woodstock-mode');
            if (toggleButton) {
                toggleButton.textContent = 'W';
                toggleButton.title = 'Enter Woodstock Mode';
            }
        }
        temporaryWoodstockTimeout = null;
    }, 15000);
}

function showTemporaryModeIndicator() {
    // Create a temporary message
    const indicator = document.createElement('div');
    indicator.textContent = 'temporary mode';
    indicator.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #ff6b9d, #4ecdc4, #ffeaa7);
        color: #000;
        padding: 10px 20px;
        border-radius: 20px;
        font-family: 'IBM Plex Mono', monospace;
        font-weight: bold;
        font-size: 14px;
        z-index: 4000;
        animation: temp-indicator-pulse 1s ease-in-out;
        box-shadow: 0 0 20px rgba(255, 107, 157, 0.8);
    `;
    
    document.body.appendChild(indicator);
    
    // Remove indicator after 2 seconds
    setTimeout(() => {
        if (indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }, 2000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes temp-indicator-pulse {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    
    @keyframes screen-shake {
        0%, 100% { transform: translate(0, 0); }
        10% { transform: translate(-2px, -1px); }
        20% { transform: translate(2px, 1px); }
        30% { transform: translate(-1px, 2px); }
        40% { transform: translate(1px, -2px); }
        50% { transform: translate(-2px, 1px); }
        60% { transform: translate(2px, -1px); }
        70% { transform: translate(-1px, -2px); }
        80% { transform: translate(1px, 2px); }
        90% { transform: translate(-2px, -1px); }
    }
    
    @keyframes impact-flash {
        0% { 
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        50% { 
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0.8;
        }
        100% { 
            transform: translate(-50%, -50%) scale(3);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Game functionality
let gameActive = false;
let spaceship = null;
let bullets = [];
let gameKeyHandler = null;
let keys = {};
let spaceshipAngle = 0;
let spaceshipX = 0;
let spaceshipY = 0;
let spaceshipVx = 0;
let spaceshipVy = 0;
let gameElapsedTime = 0;
let gameTimer = 30;
let gameInterval = null;
let gameStartTime = 0;
let hitProjects = new Set();
let gameUI = null;

function startGame() {
    if (gameActive) return;
    
    gameActive = true;
    gameElapsedTime = 0;
    gameTimer = 30;
    gameStartTime = Date.now();
    hitProjects.clear();
    
    // Hide footer during game
    const footer = document.querySelector('footer');
    if (footer) {
        footer.style.display = 'none';
    }
    
    // Reset all project cards to their original state
    resetAllProjects();
    
    createSpaceship();
    createGameUI();
    setupGameControls();
    startGameTimer();
    gameLoop();
}

function resetAllProjects() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        // Reset visual styling
        card.style.opacity = '';
        card.style.filter = '';
        card.style.border = '';
        card.style.background = '';
        card.style.minHeight = '';
        card.style.height = '';
        
        // Restore original content if it was destroyed
        if (card._originalProject) {
            const project = card._originalProject;
            
            const title = card.querySelector('.project-title');
            const year = card.querySelector('.project-year');
            const client = card.querySelector('.project-client');
            const description = card.querySelector('.project-description');
            const thumbnail = card.querySelector('.project-thumbnail');
            
            // Restore original content
            if (title) {
                title.textContent = project.title;
                title.style.color = '';
                title.style.textShadow = '';
            }
            if (year) {
                year.textContent = project.year;
            }
            if (client) {
                if (project.client) {
                    client.textContent = project.client;
                    client.style.display = 'block';
                } else {
                    client.style.display = 'none';
                }
            }
            if (description) {
                // Get first paragraph or truncate description
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = project.description;
                const firstP = tempDiv.querySelector('p');
                const shortDesc = firstP ? firstP.textContent : tempDiv.textContent;
                description.textContent = shortDesc.length > 120 ? 
                    shortDesc.substring(0, 120) + '...' : shortDesc;
            }
            if (thumbnail && project.images && project.images.length > 0) {
                thumbnail.src = project.images[0];
                thumbnail.alt = project.title;
                thumbnail.style.opacity = '';
            }
        }
    });
}

function createGameUI() {
    gameUI = document.createElement('div');
    gameUI.id = 'game-ui';
    gameUI.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 18px;
        color: #00ff00;
        z-index: 5001;
        user-select: none;
        pointer-events: none;
        text-shadow: 0 0 10px #00ff00;
        background: rgba(0, 0, 0, 0.7);
        padding: 15px;
        border-radius: 8px;
        border: 2px solid #00ff00;
    `;
    
    updateGameUI();
    document.body.appendChild(gameUI);
}

function updateGameUI() {
    if (gameUI) {
        // Calculate elapsed time
        gameElapsedTime = ((Date.now() - gameStartTime) / 1000);
        const elapsedDisplay = gameElapsedTime.toFixed(1);
        
        gameUI.innerHTML = `
            <div>TIME: ${elapsedDisplay}s</div>
            <div>REMAINING: ${gameTimer}s</div>
            <div>TARGETS: ${hitProjects.size}/${projectsData.length}</div>
            <div style="font-size: 12px; margin-top: 5px;">ESC to quit</div>
        `;
    }
}

function startGameTimer() {
    gameInterval = setInterval(() => {
        gameTimer--;
        updateGameUI();
        
        if (gameTimer <= 0) {
            endGame();
        }
    }, 1000);
}

function createSpaceship() {
    spaceship = document.createElement('div');
    spaceship.id = 'spaceship';
    spaceship.innerHTML = '▲';
    spaceship.style.cssText = `
        position: fixed;
        font-size: 24px;
        color: #00ff00;
        z-index: 5000;
        user-select: none;
        pointer-events: none;
        text-shadow: 0 0 10px #00ff00;
        transition: none;
    `;
    
    // Initialize position
    spaceshipX = window.innerWidth / 2;
    spaceshipY = window.innerHeight - 100;
    updateSpaceshipPosition();
    
    document.body.appendChild(spaceship);
}

function updateSpaceshipPosition() {
    spaceship.style.left = spaceshipX + 'px';
    spaceship.style.top = spaceshipY + 'px';
    spaceship.style.transform = `translate(-50%, -50%) rotate(${spaceshipAngle}deg)`;
}

function setupGameControls() {
    const keyDownHandler = (e) => {
        if (!gameActive) return;
        keys[e.key] = true;
        
        if (e.key === ' ') {
            e.preventDefault();
            shoot();
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            endGame();
        }
    };
    
    const keyUpHandler = (e) => {
        if (!gameActive) return;
        keys[e.key] = false;
    };
    
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
    
    // Store both handlers for cleanup
    gameKeyHandler = { keyDownHandler, keyUpHandler };
}

function shoot() {
    const bullet = document.createElement('div');
    bullet.innerHTML = '•';
    
    // Calculate bullet direction based on spaceship angle
    const angleRad = (spaceshipAngle - 90) * Math.PI / 180; // -90 because ship points up by default
    const bulletSpeed = 15;
    const bulletVx = Math.cos(angleRad) * bulletSpeed;
    const bulletVy = Math.sin(angleRad) * bulletSpeed;
    
    bullet.style.cssText = `
        position: fixed;
        left: ${spaceshipX}px;
        top: ${spaceshipY}px;
        font-size: 16px;
        color: #ffff00;
        z-index: 4999;
        user-select: none;
        pointer-events: none;
        text-shadow: 0 0 5px #ffff00;
        transform: translate(-50%, -50%);
    `;
    
    bullet.vx = bulletVx;
    bullet.vy = bulletVy;
    bullet.x = spaceshipX;
    bullet.y = spaceshipY;
    
    document.body.appendChild(bullet);
    bullets.push(bullet);
}

function gameLoop() {
    if (!gameActive) return;
    
    // Handle spaceship movement
    const rotationSpeed = 3;
    const acceleration = 0.3;
    const friction = 0.95;
    const maxSpeed = 8;
    
    if (keys['ArrowLeft']) {
        spaceshipAngle -= rotationSpeed;
    }
    if (keys['ArrowRight']) {
        spaceshipAngle += rotationSpeed;
    }
    if (keys['ArrowUp']) {
        const angleRad = (spaceshipAngle - 90) * Math.PI / 180;
        spaceshipVx += Math.cos(angleRad) * acceleration;
        spaceshipVy += Math.sin(angleRad) * acceleration;
    }
    if (keys['ArrowDown']) {
        spaceshipVx *= 0.9;
        spaceshipVy *= 0.9;
    }
    
    // Apply friction and speed limit
    spaceshipVx *= friction;
    spaceshipVy *= friction;
    const speed = Math.sqrt(spaceshipVx * spaceshipVx + spaceshipVy * spaceshipVy);
    if (speed > maxSpeed) {
        spaceshipVx = (spaceshipVx / speed) * maxSpeed;
        spaceshipVy = (spaceshipVy / speed) * maxSpeed;
    }
    
    // Update position with boundary checking
    spaceshipX += spaceshipVx;
    spaceshipY += spaceshipVy;
    
    spaceshipX = Math.max(20, Math.min(window.innerWidth - 20, spaceshipX));
    spaceshipY = Math.max(20, Math.min(window.innerHeight - 120, spaceshipY));
    
    updateSpaceshipPosition();
    
    // Move bullets
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        
        bullet.style.left = bullet.x + 'px';
        bullet.style.top = bullet.y + 'px';
        
        // Remove bullets that are off screen
        if (bullet.x < 0 || bullet.x > window.innerWidth || 
            bullet.y < 0 || bullet.y > window.innerHeight) {
            bullet.remove();
            bullets.splice(index, 1);
            return;
        }
        
        // Check collision with project cards
        const bulletRect = bullet.getBoundingClientRect();
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            const cardRect = card.getBoundingClientRect();
            if (bulletRect.left < cardRect.right && 
                bulletRect.right > cardRect.left && 
                bulletRect.top < cardRect.bottom && 
                bulletRect.bottom > cardRect.top) {
                
                // Get project identifier from data attribute
                const projectId = card.getAttribute('data-project-id');
                
                // Only hit if this project hasn't been hit yet
                if (!hitProjects.has(projectId) && projectId) {
                    hitProjects.add(projectId);
                    updateGameUI();
                    
                    // Hit! Break the tile
                    breakTile(card);
                    
                    // Check if all projects have been hit
                    if (hitProjects.size >= projectsData.length) {
                        // All targets destroyed! End game immediately
                        setTimeout(() => {
                            endGame();
                        }, 500);
                    }
                    
                    // Remove bullet only if we hit a valid target
                    bullet.remove();
                    bullets.splice(index, 1);
                }
                // If project was already hit, bullet passes through (no removal)
            }
        });
    });
    
    requestAnimationFrame(gameLoop);
}

function breakTile(card) {
    // Store original position and properties
    const rect = card.getBoundingClientRect();
    
    // Create screen shake effect
    document.body.style.animation = 'screen-shake 0.3s ease-out';
    setTimeout(() => {
        document.body.style.animation = '';
    }, 300);
    
    // Create white impact flash
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        left: ${rect.left + rect.width/2}px;
        top: ${rect.top + rect.height/2}px;
        width: 100px;
        height: 100px;
        background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%);
        border-radius: 50%;
        z-index: 4999;
        pointer-events: none;
        transform: translate(-50%, -50%) scale(0);
        animation: impact-flash 0.4s ease-out;
    `;
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 400);
    
    // Extract and explode the content with white particles
    explodeCardContent(card, rect);
    
    // Clear the card content but keep the frame and height
    const title = card.querySelector('.project-title');
    const year = card.querySelector('.project-year');
    const client = card.querySelector('.project-client');
    const description = card.querySelector('.project-description');
    const thumbnail = card.querySelector('.project-thumbnail');
    
    // Store original height before clearing content
    const originalHeight = card.offsetHeight;
    
    if (title) title.innerHTML = '&nbsp;'; // Invisible space to maintain height
    if (year) year.innerHTML = '&nbsp;';
    if (client) client.innerHTML = '&nbsp;';
    if (description) description.innerHTML = '&nbsp;';
    if (thumbnail) thumbnail.style.opacity = '0';
    
    // Force maintain the original height
    card.style.minHeight = originalHeight + 'px';
    card.style.height = originalHeight + 'px';
    
    // Add destroyed card styling with white theme
    card.style.opacity = '0.4';
    card.style.filter = 'grayscale(1) brightness(1.5)';
    card.style.border = '2px solid rgba(255, 255, 255, 0.3)';
    card.style.background = 'rgba(255, 255, 255, 0.1)';
}

function explodeCardContent(card, rect) {
    // Extract content from the card
    const title = card.querySelector('.project-title')?.textContent || '';
    const year = card.querySelector('.project-year')?.textContent || '';
    const client = card.querySelector('.project-client')?.textContent || '';
    const description = card.querySelector('.project-description')?.textContent || '';
    
    // Create particles from the content
    const particles = [title, year, client, ...description.split(' ').slice(0, 8)].filter(Boolean);
    
    particles.forEach((text, index) => {
        if (!text.trim()) return;
        
        const particle = document.createElement('div');
        particle.textContent = text;
        particle.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width/2}px;
            top: ${rect.top + rect.height/2}px;
            font-size: ${10 + Math.random() * 10}px;
            color: #ffffff;
            z-index: 4998;
            user-select: none;
            pointer-events: none;
            font-weight: bold;
            text-shadow: 0 0 10px #ffffff;
            transform: translate(-50%, -50%);
        `;
        
        document.body.appendChild(particle);
        
        // Animate particle explosion with physics
        const angle = (index / particles.length) * Math.PI * 2;
        const baseSpeed = 150 + Math.random() * 100;
        let vx = Math.cos(angle) * baseSpeed * 0.02;
        let vy = Math.sin(angle) * baseSpeed * 0.02;
        
        let x = rect.left + rect.width/2;
        let y = rect.top + rect.height/2;
        let opacity = 1;
        let scale = 1;
        const gravity = 0.3;
        const friction = 0.98;
        
        const animateParticle = () => {
            // Apply gravity
            vy += gravity;
            
            // Update position
            x += vx;
            y += vy;
            
            // Apply friction
            vx *= friction;
            vy *= friction;
            
            // Fade and scale
            opacity -= 0.015;
            scale += 0.02;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.opacity = opacity;
            particle.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${scale * 180}deg)`;
            
            // Bounce off bottom
            if (y > window.innerHeight - 20 && vy > 0) {
                vy *= -0.6;
                y = window.innerHeight - 20;
            }
            
            // Bounce off sides
            if ((x < 20 && vx < 0) || (x > window.innerWidth - 20 && vx > 0)) {
                vx *= -0.6;
            }
            
            if (opacity > 0 && y < window.innerHeight + 100) {
                requestAnimationFrame(animateParticle);
            } else {
                particle.remove();
            }
        };
        
        requestAnimationFrame(animateParticle);
    });
}


function endGame() {
    gameActive = false;
    
    // Clear timer
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    
    // Remove game elements
    if (spaceship) {
        spaceship.remove();
        spaceship = null;
    }
    
    if (gameUI) {
        gameUI.remove();
        gameUI = null;
    }
    
    bullets.forEach(bullet => bullet.remove());
    bullets = [];
    
    if (gameKeyHandler) {
        document.removeEventListener('keydown', gameKeyHandler.keyDownHandler);
        document.removeEventListener('keyup', gameKeyHandler.keyUpHandler);
        gameKeyHandler = null;
    }
    
    // Clear keys state
    keys = {};
    
    // Show footer again
    const footer = document.querySelector('footer');
    if (footer) {
        footer.style.display = '';
    }
    
    // Show final results
    const totalProjects = projectsData.length;
    const hitCount = hitProjects.size;
    const finalTime = ((Date.now() - gameStartTime) / 1000).toFixed(1);
    
    if (hitCount >= totalProjects) {
        window.addCommandToHistory(`ALL TARGETS DESTROYED IN ${finalTime}s!`, 'response');
        window.addCommandToHistory(`amazing speed! try to beat your record`, 'response');
    } else {
        window.addCommandToHistory(`game ended - time: ${finalTime}s`, 'response');
        window.addCommandToHistory(`targets destroyed: ${hitCount}/${totalProjects}`, 'response');
    }
    
    // Reset all projects back to original state
    resetAllProjects();
}

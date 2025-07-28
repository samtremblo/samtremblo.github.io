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
    } else if (command === 'help') {
        window.addCommandToHistory('commands:', 'response');
        window.addCommandToHistory('  whoami', 'response');
        window.addCommandToHistory('  woodstock', 'response');
        window.addCommandToHistory('  mirror', 'response');
        window.addCommandToHistory('  flip', 'response');
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

// Add CSS for the temporary indicator animation
const style = document.createElement('style');
style.textContent = `
    @keyframes temp-indicator-pulse {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
`;
document.head.appendChild(style);

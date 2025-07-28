import { marked } from 'marked';

let projectsData = [];

// Initialize application
init();

async function init() {
    projectsData = await loadProjectData();
    setupProjects(projectsData);
    setupModal();
    setupTypewriter();
    
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
            imagesContainer.appendChild(img);
        });
    }
    
    modalBody.innerHTML = '';
    modalBody.appendChild(title);
    modalBody.appendChild(meta);
    modalBody.appendChild(description);
    modalBody.appendChild(imagesContainer);
    
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('project-modal');
    modal.style.display = 'none';
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
    }
    
    // Open project if ID is present in URL
    if (projectId) {
        const project = projectsData.find(p => p.id === projectId);
        if (project) {
            showProjectModal(project);
        }
    }
}

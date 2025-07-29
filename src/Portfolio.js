import { marked } from 'marked';
import { ProjectCard } from './ProjectCard.js';
import { BookCard } from './BookCard.js';
import { Modal } from './Modal.js';
import { Console } from './Console.js';
import { Game } from './Game.js';

// Main Portfolio Application Class
export class Portfolio {
    constructor() {
        this.projectsData = [];
        this.booksData = [];
        this.modal = null;
        this.console = null;
        this.game = null;
        this.init();
    }

    async init() {
        this.projectsData = await this.loadProjectData();
        this.booksData = await this.loadBooksData();
        
        // Initialize modal first, before creating project cards
        this.modal = new Modal();
        this.console = new Console();
        this.game = new Game(this.projectsData);
        
        // Now create project cards with modal reference
        this.setupProjects();
        this.setupBooks();
        this.setupTabs();
        
        this.setupTypewriter();
        this.setupWoodstockToggle();
        this.setupFullscreenImages();
        
        this.handleInitialRoute();
        window.addEventListener('popstate', (event) => this.handlePopState(event));
    }

    async loadProjectData() {
        try {
            const response = await fetch('./data.json');
            const projectData = await response.json();

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

    async loadBooksData() {
        try {
            const response = await fetch('./books.json');
            const booksData = await response.json();

            return booksData.sort((a, b) => a.category.localeCompare(b.category));
        } catch (error) {
            console.error('Error loading books data:', error);
            return [];
        }
    }

    setupProjects() {
        const projectsContainer = document.getElementById('projects-container');
        this.projectsData.forEach((project) => {
            const projectCard = new ProjectCard(project, this.modal);
            projectsContainer.appendChild(projectCard.element);
        });
    }

    setupBooks() {
        const booksContainer = document.getElementById('books-container');
        this.booksData.forEach((book) => {
            const bookCard = new BookCard(book);
            booksContainer.appendChild(bookCard.element);
        });
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Remove active class from all buttons and content
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
            });
        });
    }

    setupTypewriter() {
        setTimeout(() => {
            const cursor = document.querySelector('.blinking-cursor');
            if (cursor) {
                cursor.style.opacity = '1';
            }
        }, 2500);
    }

    setupWoodstockToggle() {
        const toggleButton = document.getElementById('woodstock-toggle');
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
            
            if (isWoodstockMode) {
                toggleButton.textContent = 'W';
                toggleButton.title = 'Exit Woodstock Mode';
            } else {
                toggleButton.textContent = 'W';
                toggleButton.title = 'Enter Woodstock Mode';
            }
            
            localStorage.setItem('woodstock-mode', isWoodstockMode.toString());
            
            toggleButton.style.animation = 'none';
            setTimeout(() => {
                toggleButton.style.animation = '';
            }, 10);
        });
    }

    setupFullscreenImages() {
        const fullscreenOverlay = document.getElementById('fullscreen-overlay');
        const fullscreenClose = document.querySelector('.fullscreen-close');
        
        fullscreenClose.addEventListener('click', () => this.closeFullscreenImage());
        
        fullscreenOverlay.addEventListener('click', (e) => {
            if (e.target === fullscreenOverlay) {
                this.closeFullscreenImage();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && fullscreenOverlay.style.display === 'flex') {
                this.closeFullscreenImage();
            }
        });
    }

    showFullscreenImage(imageSrc, altText) {
        const fullscreenOverlay = document.getElementById('fullscreen-overlay');
        const fullscreenImage = document.getElementById('fullscreen-image');
        
        fullscreenImage.src = imageSrc;
        fullscreenImage.alt = altText;
        fullscreenOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeFullscreenImage() {
        const fullscreenOverlay = document.getElementById('fullscreen-overlay');
        fullscreenOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    updateURL(projectId) {
        const newURL = `${window.location.origin}${window.location.pathname}#${projectId}`;
        window.history.pushState({ projectId }, '', newURL);
    }

    clearURL() {
        const newURL = `${window.location.origin}${window.location.pathname}`;
        window.history.pushState({}, '', newURL);
    }

    getProjectIdFromURL() {
        return window.location.hash.slice(1);
    }

    handleInitialRoute() {
        const projectId = this.getProjectIdFromURL();
        if (projectId) {
            const project = this.projectsData.find(p => p.id === projectId);
            if (project) {
                this.modal.show(project);
            }
        }
    }

    handlePopState(event) {
        const projectId = this.getProjectIdFromURL();
        
        this.modal.close();
        
        if (projectId) {
            const project = this.projectsData.find(p => p.id === projectId);
            if (project) {
                this.modal.show(project);
            }
        }
    }
}
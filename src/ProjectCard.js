// Project Card Class
export class ProjectCard {
    constructor(project, modal) {
        this.project = project;
        this.modal = modal;
        this.element = this.createElement();
    }

    createElement() {
        const projectCard = document.createElement('div');
        projectCard.classList.add('project-card');
        
        // Add random wobble animation
        const wobbleAnimations = ['subtle-wobble-1', 'subtle-wobble-2', 'subtle-wobble-3', 'subtle-wobble-4', 'subtle-wobble-5'];
        const randomWobble = wobbleAnimations[Math.floor(Math.random() * wobbleAnimations.length)];
        const randomDuration = 7 + Math.random() * 4;
        const randomDelay = Math.random() * 2;
        
        projectCard.style.animation = `${randomWobble} ${randomDuration}s ease-in-out infinite`;
        projectCard.style.animationDelay = `${randomDelay}s`;
        
        projectCard.setAttribute('data-wobble', randomWobble);
        projectCard.style.setProperty('--wobble-duration', `${randomDuration}s`);
        projectCard.style.setProperty('--wobble-delay', `${randomDelay}s`);
        
        const projectHeader = this.createHeader();
        const projectDescription = this.createDescription();
        
        if (this.project.client) {
            const projectClient = document.createElement('div');
            projectClient.classList.add('project-client');
            projectClient.textContent = this.project.client;
            projectCard.appendChild(projectClient);
        }
        
        if (this.project.images && this.project.images.length > 0) {
            const thumbnail = this.createThumbnail();
            projectCard.appendChild(thumbnail);
        }
        
        projectCard.appendChild(projectHeader);
        projectCard.appendChild(projectDescription);
        
        projectCard.addEventListener('click', () => {
            this.modal.show(this.project);
            // Access portfolio through global reference
            if (window.portfolio) {
                window.portfolio.updateURL(this.project.id);
            }
        });
        
        // Store data for game
        projectCard._originalProject = this.project;
        projectCard.setAttribute('data-project-id', this.project.id || this.project.title);
        
        return projectCard;
    }

    createHeader() {
        const projectHeader = document.createElement('div');
        projectHeader.classList.add('project-header');
        
        const projectTitle = document.createElement('h3');
        projectTitle.classList.add('project-title');
        projectTitle.textContent = this.project.title;
        
        const projectYear = document.createElement('span');
        projectYear.classList.add('project-year');
        projectYear.textContent = this.project.year;
        
        projectHeader.appendChild(projectTitle);
        projectHeader.appendChild(projectYear);
        
        return projectHeader;
    }

    createDescription() {
        const projectDescription = document.createElement('div');
        projectDescription.classList.add('project-description');
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.project.description;
        const firstP = tempDiv.querySelector('p');
        const shortDesc = firstP ? firstP.textContent : tempDiv.textContent;
        projectDescription.textContent = shortDesc.length > 120 ? 
            shortDesc.substring(0, 120) + '...' : shortDesc;
        
        return projectDescription;
    }

    createThumbnail() {
        const thumbnail = document.createElement('img');
        thumbnail.classList.add('project-thumbnail');
        thumbnail.src = this.project.images[0];
        thumbnail.alt = this.project.title;
        return thumbnail;
    }
}
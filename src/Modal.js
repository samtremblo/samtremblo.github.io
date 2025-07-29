// Modal Class
export class Modal {
    constructor() {
        this.modal = document.getElementById('project-modal');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const closeBtn = this.modal.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            this.close();
        });
        
        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.close();
            }
        });
        
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.modal.style.display === 'block') {
                this.close();
            }
        });
    }

    show(projectData) {
        const modalBody = document.getElementById('modal-body');
        const modalHeader = this.modal.querySelector('.modal-header');
        
        let modalTitle = modalHeader.querySelector('.modal-title');
        if (!modalTitle) {
            modalTitle = document.createElement('h1');
            modalTitle.classList.add('modal-title');
            modalHeader.insertBefore(modalTitle, modalHeader.firstChild);
        }
        modalTitle.textContent = `$ cat projects/${projectData.title.toLowerCase().replace(/\s+/g, '-')}`;
        
        const title = this.createTitle(projectData);
        const meta = this.createMeta(projectData);
        const description = this.createDescription(projectData);
        const imagesContainer = this.createImagesContainer(projectData);
        
        modalBody.innerHTML = '';
        modalBody.appendChild(title);
        modalBody.appendChild(meta);
        modalBody.appendChild(description);
        modalBody.appendChild(imagesContainer);
        
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    createTitle(projectData) {
        const title = document.createElement('h2');
        title.classList.add('modal-project-title');
        title.textContent = projectData.title;
        return title;
    }

    createMeta(projectData) {
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
        
        return meta;
    }

    createDescription(projectData) {
        const description = document.createElement('div');
        description.classList.add('modal-project-description');
        description.innerHTML = projectData.description;
        return description;
    }

    createImagesContainer(projectData) {
        const imagesContainer = document.createElement('div');
        imagesContainer.classList.add('modal-images');
        
        if (projectData.images && projectData.images.length > 0) {
            projectData.images.forEach(imageUrl => {
                const img = document.createElement('img');
                img.classList.add('modal-image');
                img.src = imageUrl;
                img.alt = projectData.title;
                img.addEventListener('click', () => {
                    // Access portfolio through global reference
                    if (window.portfolio) {
                        window.portfolio.showFullscreenImage(imageUrl, projectData.title);
                    }
                });
                imagesContainer.appendChild(img);
            });
        }
        
        return imagesContainer;
    }

    close() {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
        // Access portfolio through global reference
        if (window.portfolio) {
            window.portfolio.clearURL();
        }
    }
}
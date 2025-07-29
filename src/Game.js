// Game Class
export class Game {
    constructor(projectsData) {
        this.projectsData = projectsData;
        this.active = false;
        this.spaceship = null;
        this.bullets = [];
        this.keyHandler = null;
        this.keys = {};
        this.spaceshipAngle = 0;
        this.spaceshipX = 0;
        this.spaceshipY = 0;
        this.spaceshipVx = 0;
        this.spaceshipVy = 0;
        this.elapsedTime = 0;
        this.timer = 30;
        this.interval = null;
        this.startTime = 0;
        this.hitProjects = new Set();
        this.ui = null;
        
        this.initializeStyles();
    }

    initializeStyles() {
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
    }

    start() {
        if (this.active) return;
        
        this.active = true;
        this.elapsedTime = 0;
        this.timer = 30;
        this.startTime = Date.now();
        this.hitProjects.clear();
        
        this.hideFooter();
        this.resetAllProjects();
        this.createSpaceship();
        this.createUI();
        this.setupControls();
        this.startTimer();
        this.gameLoop();
    }

    hideFooter() {
        const footer = document.querySelector('.fixed-footer');
        if (footer) {
            footer.style.setProperty('display', 'none', 'important');
            footer.style.visibility = 'hidden';
            footer.style.opacity = '0';
        }
    }

    showFooter() {
        const footer = document.querySelector('.fixed-footer');
        if (footer) {
            footer.style.removeProperty('display');
            footer.style.visibility = '';
            footer.style.opacity = '';
        }
    }

    resetAllProjects() {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            card.style.opacity = '';
            card.style.filter = '';
            card.style.border = '';
            card.style.background = '';
            card.style.minHeight = '';
            card.style.height = '';
            
            if (card._originalProject) {
                const project = card._originalProject;
                
                const title = card.querySelector('.project-title');
                const year = card.querySelector('.project-year');
                const client = card.querySelector('.project-client');
                const description = card.querySelector('.project-description');
                const thumbnail = card.querySelector('.project-thumbnail');
                
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

    createSpaceship() {
        this.spaceship = document.createElement('div');
        this.spaceship.id = 'spaceship';
        this.spaceship.innerHTML = '▲';
        this.spaceship.style.cssText = `
            position: fixed;
            font-size: 24px;
            color: #00ff00;
            z-index: 5000;
            user-select: none;
            pointer-events: none;
            text-shadow: 0 0 10px #00ff00;
            transition: none;
        `;
        
        this.spaceshipX = window.innerWidth / 2;
        this.spaceshipY = window.innerHeight - 100;
        this.updateSpaceshipPosition();
        
        document.body.appendChild(this.spaceship);
    }

    updateSpaceshipPosition() {
        this.spaceship.style.left = this.spaceshipX + 'px';
        this.spaceship.style.top = this.spaceshipY + 'px';
        this.spaceship.style.transform = `translate(-50%, -50%) rotate(${this.spaceshipAngle}deg)`;
    }

    createUI() {
        this.ui = document.createElement('div');
        this.ui.id = 'game-ui';
        this.ui.style.cssText = `
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
        
        this.updateUI();
        document.body.appendChild(this.ui);
    }

    updateUI() {
        if (this.ui) {
            this.elapsedTime = ((Date.now() - this.startTime) / 1000);
            const elapsedDisplay = this.elapsedTime.toFixed(1);
            
            this.ui.innerHTML = `
                <div>TIME: ${elapsedDisplay}s</div>
                <div>REMAINING: ${this.timer}s</div>
                <div>TARGETS: ${this.hitProjects.size}/${this.projectsData.length}</div>
                <div style="font-size: 12px; margin-top: 5px;">ESC to quit</div>
            `;
        }
    }

    startTimer() {
        this.interval = setInterval(() => {
            this.timer--;
            this.updateUI();
            
            if (this.timer <= 0) {
                this.end();
            }
        }, 1000);
    }

    setupControls() {
        const keyDownHandler = (e) => {
            if (!this.active) return;
            this.keys[e.key] = true;
            
            if (e.key === ' ') {
                e.preventDefault();
                this.shoot();
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                this.end();
            }
        };
        
        const keyUpHandler = (e) => {
            if (!this.active) return;
            this.keys[e.key] = false;
        };
        
        document.addEventListener('keydown', keyDownHandler);
        document.addEventListener('keyup', keyUpHandler);
        
        this.keyHandler = { keyDownHandler, keyUpHandler };
    }

    shoot() {
        const bullet = document.createElement('div');
        bullet.innerHTML = '•';
        
        const angleRad = (this.spaceshipAngle - 90) * Math.PI / 180;
        const bulletSpeed = 15;
        const bulletVx = Math.cos(angleRad) * bulletSpeed;
        const bulletVy = Math.sin(angleRad) * bulletSpeed;
        
        bullet.style.cssText = `
            position: fixed;
            left: ${this.spaceshipX}px;
            top: ${this.spaceshipY}px;
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
        bullet.x = this.spaceshipX;
        bullet.y = this.spaceshipY;
        
        document.body.appendChild(bullet);
        this.bullets.push(bullet);
    }

    gameLoop() {
        if (!this.active) return;
        
        this.handleSpaceshipMovement();
        this.updateBullets();
        
        requestAnimationFrame(() => this.gameLoop());
    }

    handleSpaceshipMovement() {
        const rotationSpeed = 3;
        const acceleration = 0.3;
        const friction = 0.95;
        const maxSpeed = 8;
        
        if (this.keys['ArrowLeft']) {
            this.spaceshipAngle -= rotationSpeed;
        }
        if (this.keys['ArrowRight']) {
            this.spaceshipAngle += rotationSpeed;
        }
        if (this.keys['ArrowUp']) {
            const angleRad = (this.spaceshipAngle - 90) * Math.PI / 180;
            this.spaceshipVx += Math.cos(angleRad) * acceleration;
            this.spaceshipVy += Math.sin(angleRad) * acceleration;
        }
        if (this.keys['ArrowDown']) {
            this.spaceshipVx *= 0.9;
            this.spaceshipVy *= 0.9;
        }
        
        this.spaceshipVx *= friction;
        this.spaceshipVy *= friction;
        const speed = Math.sqrt(this.spaceshipVx * this.spaceshipVx + this.spaceshipVy * this.spaceshipVy);
        if (speed > maxSpeed) {
            this.spaceshipVx = (this.spaceshipVx / speed) * maxSpeed;
            this.spaceshipVy = (this.spaceshipVy / speed) * maxSpeed;
        }
        
        this.spaceshipX += this.spaceshipVx;
        this.spaceshipY += this.spaceshipVy;
        
        this.spaceshipX = Math.max(20, Math.min(window.innerWidth - 20, this.spaceshipX));
        this.spaceshipY = Math.max(20, Math.min(window.innerHeight - 120, this.spaceshipY));
        
        this.updateSpaceshipPosition();
    }

    updateBullets() {
        this.bullets.forEach((bullet, index) => {
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            
            bullet.style.left = bullet.x + 'px';
            bullet.style.top = bullet.y + 'px';
            
            if (bullet.x < 0 || bullet.x > window.innerWidth || 
                bullet.y < 0 || bullet.y > window.innerHeight) {
                bullet.remove();
                this.bullets.splice(index, 1);
                return;
            }
            
            this.checkCollisions(bullet, index);
        });
    }

    checkCollisions(bullet, bulletIndex) {
        const bulletRect = bullet.getBoundingClientRect();
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            const cardRect = card.getBoundingClientRect();
            if (bulletRect.left < cardRect.right && 
                bulletRect.right > cardRect.left && 
                bulletRect.top < cardRect.bottom && 
                bulletRect.bottom > cardRect.top) {
                
                const projectId = card.getAttribute('data-project-id');
                
                if (!this.hitProjects.has(projectId) && projectId) {
                    this.hitProjects.add(projectId);
                    this.updateUI();
                    
                    this.breakTile(card);
                    
                    if (this.hitProjects.size >= this.projectsData.length) {
                        setTimeout(() => {
                            this.end();
                        }, 500);
                    }
                    
                    bullet.remove();
                    this.bullets.splice(bulletIndex, 1);
                }
            }
        });
    }

    breakTile(card) {
        const rect = card.getBoundingClientRect();
        
        document.body.style.animation = 'screen-shake 0.3s ease-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 300);
        
        this.createImpactFlash(rect);
        this.explodeCardContent(card, rect);
        this.clearCardContent(card);
    }

    createImpactFlash(rect) {
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
    }

    explodeCardContent(card, rect) {
        const title = card.querySelector('.project-title')?.textContent || '';
        const year = card.querySelector('.project-year')?.textContent || '';
        const client = card.querySelector('.project-client')?.textContent || '';
        const description = card.querySelector('.project-description')?.textContent || '';
        
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
            this.animateParticle(particle, rect, index, particles.length);
        });
    }

    animateParticle(particle, rect, index, totalParticles) {
        const angle = (index / totalParticles) * Math.PI * 2;
        const baseSpeed = 150 + Math.random() * 100;
        let vx = Math.cos(angle) * baseSpeed * 0.02;
        let vy = Math.sin(angle) * baseSpeed * 0.02;
        
        let x = rect.left + rect.width/2;
        let y = rect.top + rect.height/2;
        let opacity = 1;
        let scale = 1;
        const gravity = 0.3;
        const friction = 0.98;
        
        const animate = () => {
            vy += gravity;
            x += vx;
            y += vy;
            vx *= friction;
            vy *= friction;
            opacity -= 0.015;
            scale += 0.02;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.opacity = opacity;
            particle.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${scale * 180}deg)`;
            
            if (y > window.innerHeight - 20 && vy > 0) {
                vy *= -0.6;
                y = window.innerHeight - 20;
            }
            
            if ((x < 20 && vx < 0) || (x > window.innerWidth - 20 && vx > 0)) {
                vx *= -0.6;
            }
            
            if (opacity > 0 && y < window.innerHeight + 100) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };
        
        requestAnimationFrame(animate);
    }

    clearCardContent(card) {
        const title = card.querySelector('.project-title');
        const year = card.querySelector('.project-year');
        const client = card.querySelector('.project-client');
        const description = card.querySelector('.project-description');
        const thumbnail = card.querySelector('.project-thumbnail');
        
        const originalHeight = card.offsetHeight;
        
        if (title) title.innerHTML = '&nbsp;';
        if (year) year.innerHTML = '&nbsp;';
        if (client) client.innerHTML = '&nbsp;';
        if (description) description.innerHTML = '&nbsp;';
        if (thumbnail) thumbnail.style.opacity = '0';
        
        card.style.minHeight = originalHeight + 'px';
        card.style.height = originalHeight + 'px';
        card.style.opacity = '0.4';
        card.style.filter = 'grayscale(1) brightness(1.5)';
        card.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        card.style.background = 'rgba(255, 255, 255, 0.1)';
    }

    end() {
        this.active = false;
        
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        
        if (this.spaceship) {
            this.spaceship.remove();
            this.spaceship = null;
        }
        
        if (this.ui) {
            this.ui.remove();
            this.ui = null;
        }
        
        this.bullets.forEach(bullet => bullet.remove());
        this.bullets = [];
        
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler.keyDownHandler);
            document.removeEventListener('keyup', this.keyHandler.keyUpHandler);
            this.keyHandler = null;
        }
        
        this.keys = {};
        this.showFooter();
        
        const totalProjects = this.projectsData.length;
        const hitCount = this.hitProjects.size;
        const finalTime = ((Date.now() - this.startTime) / 1000).toFixed(1);
        
        if (hitCount >= totalProjects) {
            window.addCommandToHistory(`ALL TARGETS DESTROYED IN ${finalTime}s!`, 'response');
            window.addCommandToHistory(`amazing speed! try to beat your record`, 'response');
        } else {
            window.addCommandToHistory(`game ended - time: ${finalTime}s`, 'response');
            window.addCommandToHistory(`targets destroyed: ${hitCount}/${totalProjects}`, 'response');
        }
        
        this.resetAllProjects();
    }
}
// Console Easter Egg Class
export class Console {
    constructor() {
        this.commandBuffer = '';
        this.commandTimeout = null;
        this.temporaryWoodstockTimeout = null;
        this.consoleVisible = false;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            if (!this.consoleVisible) {
                this.showConsole();
            }
            
            if (this.commandTimeout) {
                clearTimeout(this.commandTimeout);
            }
            
            if (e.key === 'Enter') {
                if (this.commandBuffer.trim() !== '') {
                    this.addCommandToHistory(`sam@portfolio:~$ ${this.commandBuffer}`);
                    this.processCommand(this.commandBuffer.toLowerCase().trim());
                }
                this.commandBuffer = '';
                this.updateConsoleDisplay();
                
                setTimeout(() => {
                    this.hideConsolePrompt();
                }, 4000);
                return;
            }
            
            if (e.key === 'Backspace') {
                this.commandBuffer = this.commandBuffer.slice(0, -1);
                this.updateConsoleDisplay();
                return;
            }
            
            if (e.key.length === 1 && /[a-zA-Z0-9\s\-_]/.test(e.key)) {
                this.commandBuffer += e.key.toLowerCase();
                this.updateConsoleDisplay();
                
                this.commandTimeout = setTimeout(() => {
                    this.commandBuffer = '';
                    this.updateConsoleDisplay();
                    this.hideConsolePrompt();
                }, 6000);
            }
        });
        
        // Store reference for command processing
        window.addCommandToHistory = (text, className = '') => this.addCommandToHistory(text, className);
    }

    showConsole() {
        const consolePrompt = document.querySelector('.console-prompt');
        consolePrompt.classList.add('active');
        this.consoleVisible = true;
    }
    
    hideConsolePrompt() {
        const consolePrompt = document.querySelector('.console-prompt');
        consolePrompt.classList.remove('active');
        this.consoleVisible = false;
    }
    
    updateConsoleDisplay() {
        const consoleInput = document.getElementById('console-input');
        consoleInput.textContent = this.commandBuffer;
    }
    
    addCommandToHistory(text, className = '') {
        const consoleHistory = document.getElementById('console-history');
        const line = document.createElement('div');
        line.className = `console-line ${className}`;
        line.textContent = text;
        consoleHistory.appendChild(line);
        consoleHistory.scrollTop = consoleHistory.scrollHeight;
    }

    processCommand(command) {
        if (command === 'whoami') {
            this.addCommandToHistory('Fullstack Interactive Developer & Creative Technologist', 'response');
        } else if (command === 'woodstock') {
            this.addCommandToHistory('mode activated', 'response');
            this.activateTemporaryWoodstock();
        } else if (command === 'mirror') {
            const isMirrored = document.body.classList.toggle('mirror-mode');
            this.addCommandToHistory(isMirrored ? 'mirror on' : 'mirror off', 'response');
        } else if (command === 'flip') {
            const isFlipped = document.body.classList.toggle('flip-mode');
            this.addCommandToHistory(isFlipped ? 'flip on' : 'flip off', 'response');
        } else if (command === 'game') {
            this.addCommandToHistory('game started - use arrow keys to move, space to shoot', 'response');
            // Access portfolio through global reference
            if (window.portfolio && window.portfolio.game) {
                window.portfolio.game.start();
            }
        } else if (command === 'pink') {
            const isPinkMode = document.body.classList.toggle('pink-mode');
            if (isPinkMode) {
                this.addCommandToHistory('pink mode activated', 'response');
                this.deactivateHeartMode(); // Deactivate heart mode if active
                this.activatePinkMode();
            } else {
                this.addCommandToHistory('pink mode deactivated', 'response');
                this.deactivatePinkMode();
            }
        } else if (command === 'heart' || command === 'hearts') {
            const isHeartMode = document.body.classList.toggle('heart-mode');
            if (isHeartMode) {
                this.addCommandToHistory('heart mode activated', 'response');
                this.deactivatePinkMode(); // Deactivate pink mode if active
                this.activateHeartMode();
            } else {
                this.addCommandToHistory('heart mode deactivated', 'response');
                this.deactivateHeartMode();
            }
        } else if (command === 'help') {
            this.addCommandToHistory('commands:', 'response');
            this.addCommandToHistory('  whoami', 'response');
            this.addCommandToHistory('  woodstock', 'response');
            this.addCommandToHistory('  mirror', 'response');
            this.addCommandToHistory('  flip', 'response');
            this.addCommandToHistory('  pink', 'response');
            this.addCommandToHistory('  heart', 'response');
            this.addCommandToHistory('  game', 'response');
            this.addCommandToHistory('  help', 'response');
            this.addCommandToHistory('  clear', 'response');
        } else if (command === 'clear') {
            setTimeout(() => {
                const history = document.getElementById('console-history');
                history.innerHTML = '';
            }, 100);
            return;
        } else if (command === '') {
            return;
        } else {
            this.addCommandToHistory(`command not found: ${command}`, 'error');
            this.addCommandToHistory('type help', 'response');
        }
    }

    activateTemporaryWoodstock() {
        const wasWoodstockActive = document.body.classList.contains('woodstock-mode');
        const toggleButton = document.getElementById('woodstock-toggle');
        
        if (this.temporaryWoodstockTimeout) {
            clearTimeout(this.temporaryWoodstockTimeout);
        }
        
        document.body.classList.add('woodstock-mode');
        if (toggleButton) {
            toggleButton.textContent = 'W';
            toggleButton.title = 'Exit Woodstock Mode (Temporary)';
        }
        
        this.showTemporaryModeIndicator();
        
        this.temporaryWoodstockTimeout = setTimeout(() => {
            if (!wasWoodstockActive) {
                document.body.classList.remove('woodstock-mode');
                if (toggleButton) {
                    toggleButton.textContent = 'W';
                    toggleButton.title = 'Enter Woodstock Mode';
                }
            }
            this.temporaryWoodstockTimeout = null;
        }, 15000);
    }

    showTemporaryModeIndicator() {
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
        
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 2000);
    }

    activatePinkMode() {
        // Use local pink gif with tiling
        document.body.style.backgroundImage = `url("./public/img/pink.gif")`;
        document.body.style.backgroundSize = 'auto';
        document.body.style.backgroundPosition = 'top left';
        document.body.style.backgroundRepeat = 'repeat';
        document.body.style.backgroundAttachment = 'fixed';
        
        // Add pink overlay for aesthetic
        this.createPinkOverlay();
    }

    deactivatePinkMode() {
        // Remove pink-mode class
        document.body.classList.remove('pink-mode');
        
        document.body.style.backgroundImage = '';
        document.body.style.backgroundSize = '';
        document.body.style.backgroundPosition = '';
        document.body.style.backgroundRepeat = '';
        document.body.style.backgroundAttachment = '';
        
        // Remove pink overlay
        this.removePinkOverlay();
    }

    activateHeartMode() {
        // Use local hearts gif with tiling
        document.body.style.backgroundImage = `url("./public/img/hearts.gif")`;
        document.body.style.backgroundSize = 'auto';
        document.body.style.backgroundPosition = 'top left';
        document.body.style.backgroundRepeat = 'repeat';
        document.body.style.backgroundAttachment = 'fixed';
        
        // Add heart overlay for aesthetic
        this.createHeartOverlay();
    }

    deactivateHeartMode() {
        // Remove heart-mode class
        document.body.classList.remove('heart-mode');
        
        document.body.style.backgroundImage = '';
        document.body.style.backgroundSize = '';
        document.body.style.backgroundPosition = '';
        document.body.style.backgroundRepeat = '';
        document.body.style.backgroundAttachment = '';
        
        // Remove heart overlay
        this.removeHeartOverlay();
    }

    createPinkOverlay() {
        // Remove existing overlay if present
        this.removePinkOverlay();
        
        const overlay = document.createElement('div');
        overlay.id = 'pink-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, 
                rgba(255, 192, 203, 0.1) 0%, 
                rgba(255, 20, 147, 0.05) 50%, 
                rgba(255, 105, 180, 0.1) 100%);
            pointer-events: none;
            z-index: -1;
            animation: pink-pulse 3s ease-in-out infinite alternate;
        `;
        
        document.body.appendChild(overlay);
        
        // Add pink pulse animation
        if (!document.getElementById('pink-style')) {
            const pinkStyle = document.createElement('style');
            pinkStyle.id = 'pink-style';
            pinkStyle.textContent = `
                @keyframes pink-pulse {
                    0% { opacity: 0.3; }
                    100% { opacity: 0.7; }
                }
                
                .pink-mode {
                    filter: hue-rotate(315deg) saturate(1.2) brightness(1.1);
                }
            `;
            document.head.appendChild(pinkStyle);
        }
    }

    removePinkOverlay() {
        const overlay = document.getElementById('pink-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        const pinkStyle = document.getElementById('pink-style');
        if (pinkStyle) {
            pinkStyle.remove();
        }
    }

    createHeartOverlay() {
        // Remove existing overlay if present
        this.removeHeartOverlay();
        
        const overlay = document.createElement('div');
        overlay.id = 'heart-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, 
                rgba(255, 182, 193, 0.1) 0%, 
                rgba(220, 20, 60, 0.05) 50%, 
                rgba(255, 69, 85, 0.1) 100%);
            pointer-events: none;
            z-index: -1;
            animation: heart-pulse 2.5s ease-in-out infinite alternate;
        `;
        
        document.body.appendChild(overlay);
        
        // Add heart pulse animation
        if (!document.getElementById('heart-style')) {
            const heartStyle = document.createElement('style');
            heartStyle.id = 'heart-style';
            heartStyle.textContent = `
                @keyframes heart-pulse {
                    0% { opacity: 0.2; }
                    100% { opacity: 0.6; }
                }
                
                .heart-mode {
                    filter: hue-rotate(345deg) saturate(1.3) brightness(1.05);
                }
            `;
            document.head.appendChild(heartStyle);
        }
    }

    removeHeartOverlay() {
        const overlay = document.getElementById('heart-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        const heartStyle = document.getElementById('heart-style');
        if (heartStyle) {
            heartStyle.remove();
        }
    }
}
import { Portfolio } from './Portfolio.js';

// Initialize the application
let portfolio;

document.addEventListener('DOMContentLoaded', () => {
    portfolio = new Portfolio();
    // Make portfolio available globally for cross-class communication
    window.portfolio = portfolio;
});

// Export for global access if needed
window.Portfolio = Portfolio;
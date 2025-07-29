// Book Card Component
export class BookCard {
    constructor(book) {
        this.book = book;
        this.element = this.createElement();
    }

    createElement() {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <div class="book-content">
                <h3 class="book-title">${this.book.title}</h3>
                <p class="book-author">by ${this.book.author}</p>
                <p class="book-category">${this.book.category} • ${this.book.year}</p>
                <p class="book-description">${this.book.description}</p>
                <div class="book-tags">
                    ${this.book.tags.map(tag => `<span class="book-tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;

        return card;
    }
}
// entities.js

export class Letter {
    constructor(symbol, row, col) {
        this.symbol = (symbol || '').toUpperCase();
        this.row = row;
        this.col = col;
        this.state = 'empty'; // empty | typing | correct | present | absent
    }
}

export class Player {
    constructor(name = 'Local Player', maxRows = 6, wordSize = 5) {
        this.name = name;
        this.maxRows = maxRows;
        this.wordSize = wordSize;

        this.currentRow = 0;
        this.currentCol = 0;

        this.wins = 0;
        this.losses = 0;

        this.grid = this.createGrid();
    }

    createGrid() {
        const grid = [];
        for (let i = 0; i < this.maxRows; i++) {
            const row = [];
            for (let j = 0; j < this.wordSize; j++) {
                row.push(new Letter('', i, j));
            }
            grid.push(row);
        }
        return grid;
    }

    regenerateGrid() {
        this.grid = this.createGrid();
        this.currentRow = 0;
        this.currentCol = 0;
    }

    addLetter(char) {
        if (this.currentCol >= this.wordSize) return false;

        const letter = this.grid[this.currentRow][this.currentCol];
        letter.symbol = char.toUpperCase();
        letter.state = 'typing';

        this.currentCol += 1;
        return true;
    }

    removeLetter() {
        if (this.currentCol === 0) return false;

        this.currentCol--;

        const letter = this.grid[this.currentRow][this.currentCol];
        letter.symbol = '';
        letter.state = 'empty';

        return true;
    }

    isRowComplete() {
        return this.currentCol === this.wordSize;
    }

    currentWord() {
        return this.grid[this.currentRow].map(l => l.symbol).join('');
    }

    validateRow(states) {
        this.grid[this.currentRow].forEach((letter, idx) => {
            letter.state = states[idx];
        });
        this.currentRow += 1;
        this.currentCol = 0;
    }
}

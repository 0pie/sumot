import { Player } from './entities.js';

let WORD_SIZE = 5;
const MAX_ROWS = 6;

let WORD_LIST = [];
let WORD_SET = new Set();
let SECRET_WORD = null;

const gridElement = document.getElementById('grid');
const keyboardElement = document.getElementById('keyboard');
const errorElement = document.getElementById('error');
const shareElement = document.getElementById('share');
const newGameElement = document.getElementById('newgame');
const debugElement = document.getElementById('debug-word');

let player = null;
let gameOver = false;
let GAME_NUMBER = 0;

async function initGame() {
    const response = await fetch('../assets/words_clean.json');
    const data = await response.json();
    GAME_NUMBER = await window.sumot.incrementGameNumber();  


    WORD_SIZE = Math.floor(Math.random() * 8) + 3;
    WORD_LIST = data[String(WORD_SIZE)] || [];

    WORD_LIST = WORD_LIST
        .map(w => w.trim().toLowerCase())
        .filter(w => w.length === WORD_SIZE);

    WORD_SET = new Set(WORD_LIST);
    SECRET_WORD = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];

    player = new Player('Local Player', MAX_ROWS, WORD_SIZE);
    player.regenerateGrid();

    buildGrid();
    refreshGrid();

    if (debugElement) {
        debugElement.textContent = `DEBUG: ${SECRET_WORD}`;
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    await initGame();
    buildKeyboard();
    refreshGrid();
});

function buildGrid() {
    gridElement.innerHTML = '';

    for (let i = 0; i < MAX_ROWS; i++) {
        const row = document.createElement('div');
        row.classList.add('row');

        for (let j = 0; j < WORD_SIZE; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.id = `cell-${i}-${j}`;

            const span = document.createElement('span');
            span.classList.add('letter');
            cell.appendChild(span);

            row.appendChild(cell);
        }

        gridElement.appendChild(row);
    }
}

const KEYBOARD_ROWS = [
    'AZERTYUIOP'.split(''),
    'QSDFGHJKLM'.split(''),
    ['ENTER', ...'WXCVBN'.split(''), '⌫']
];

function buildKeyboard() {
    keyboardElement.innerHTML = '';

    KEYBOARD_ROWS.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('keyboard-row');

        row.forEach(key => {
            const btn = document.createElement('button');
            btn.setAttribute('data-v-4db6fa13', '');
            btn.id = 'key';
            btn.classList.add('key');

            if (key === 'ENTER' || key === '⌫') btn.classList.add('big');

            btn.textContent = key.length === 1 ? key : (key === 'ENTER' ? 'Entrer' : '⌫');

            btn.addEventListener('click', () => handleVirtualKey(key));
            rowDiv.appendChild(btn);
        });

        keyboardElement.appendChild(rowDiv);
    });
}

let errorTimeout = null;

function showError(message) {
    errorElement.style.display = 'block';
    errorElement.textContent = message;

    if (errorTimeout) clearTimeout(errorTimeout);
    errorTimeout = setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

function refreshGrid() {
    for (let i = 0; i < MAX_ROWS; i++) {
        for (let j = 0; j < WORD_SIZE; j++) {
            const letter = player.grid[i][j];
            const cell = document.getElementById(`cell-${i}-${j}`);
            if (!cell) continue;

            const span = cell.querySelector('.letter');
            span.textContent = letter.symbol;

            cell.className = 'cell';

            if (letter.symbol !== '') cell.classList.add('has-letter');

            if (letter.state === 'correct') cell.classList.add('correct', 'validated');
            else if (letter.state === 'present') cell.classList.add('partial', 'validated');
            else if (letter.state === 'absent') cell.classList.add('incorrect', 'validated');
        }
    }
}

function evaluateWord(word) {
    const states = Array(WORD_SIZE).fill('absent');
    const secret = SECRET_WORD.split('');

    for (let i = 0; i < WORD_SIZE; i++) {
        if (word[i] === secret[i]) {
            states[i] = 'correct';
            secret[i] = null;
        }
    }

    for (let i = 0; i < WORD_SIZE; i++) {
        if (states[i] === 'correct') continue;
        const idx = secret.indexOf(word[i]);
        if (idx !== -1) {
            states[i] = 'present';
            secret[idx] = null;
        }
    }

    return states;
}

function updateKeyboard(word, states) {
    const keys = keyboardElement.querySelectorAll('#key');

    for (let i = 0; i < word.length; i++) {
        const letter = word[i].toUpperCase();
        const state = states[i];

        keys.forEach(btn => {
            if (btn.textContent.toUpperCase() !== letter) return;

            const hasGreen = btn.classList.contains('correct');
            const hasYellow = btn.classList.contains('partial');

            if (state === 'correct') {
                btn.classList.remove('partial', 'incorrect');
                btn.classList.add('correct');
            } else if (state === 'present') {
                if (!hasGreen) {
                    btn.classList.remove('incorrect');
                    btn.classList.add('partial');
                }
            } else if (state === 'absent') {
                if (!hasGreen && !hasYellow) {
                    btn.classList.add('incorrect');
                }
            }
        });
    }
}

function submitAttempt() {
    if (gameOver) return;

    if (!player.isRowComplete()) {
        showError('Incomplete word');
        return;
    }

    const word = player.currentWord().toLowerCase();

    if (!WORD_SET.has(word)) {
        showError('Invalid word');

        const row = gridElement.children[player.currentRow];
        row.classList.remove('shake');
        void row.offsetWidth;
        row.classList.add('shake');

        return;
    }

    const rowIndex = player.currentRow;
    const states = evaluateWord(word);

    player.validateRow(states);
    animateRow(rowIndex, states);

    setTimeout(() => updateKeyboard(word, states), WORD_SIZE * 250 + 100);

    if (word === SECRET_WORD) {
        gameOver = true;
        player.wins++;
        showShareButton();
        showNewGameButton();

        return;
    }

    if (player.currentRow >= MAX_ROWS) {
        gameOver = true;
        player.losses++;
        showError(`Lost: ${SECRET_WORD}`);
        showNewGameButton();
    }
}

function handleLetterInput(letter) {
    if (gameOver) return;
    if (player.addLetter(letter)) refreshGrid();
}

function handleBackspace() {
    if (gameOver) return;
    if (player.removeLetter()) refreshGrid();
}

function handleVirtualKey(key) {
    if (key === 'ENTER') submitAttempt();
    else if (key === '⌫') handleBackspace();
    else if (/^[A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸ]$/i.test(key)) {
        handleLetterInput(key.toUpperCase());
    }
}

function animateRow(rowIndex, states) {
    const row = gridElement.children[rowIndex];

    for (let i = 0; i < WORD_SIZE; i++) {
        const cell = row.children[i];

        setTimeout(() => {
            cell.classList.add('flip');

            setTimeout(() => {
                cell.classList.remove('flip');

                if (states[i] === 'correct') cell.classList.add('correct');
                else if (states[i] === 'present') cell.classList.add('partial');
                else cell.classList.add('incorrect');

            }, 150);
        }, i * 250);
    }
}

function buildEmojiGrid() {
    let lines = [];

    for (let r = 0; r < player.currentRow; r++) {
        let row = "";
        for (let c = 0; c < WORD_SIZE; c++) {
            const cell = player.grid[r][c];
            if (cell.state === "correct") row += "🟩";
            else if (cell.state === "present") row += "🟨";
            else row += "⬛";
        }
        lines.push(row);
    }

    return lines.join("\n");
}

function showShareButton() {
    shareElement.classList.remove("hidden");
    shareElement.innerHTML = `
        <button id="share-btn">Partager</button>
    `;

    document.getElementById("share-btn").onclick = () => {
        const tries = player.currentRow;
        const emoji = buildEmojiGrid();

        const text = `Sumot (@0pie) #${GAME_NUMBER} ${tries}/6\n\n${emoji}`;

        window.sumot.copyText(text);

        alert("Résultat copié !");
    };
}

async function newGame() {
    gameOver = false;

    shareElement.classList.add("hidden");
    newGameElement.classList.add("hidden");

    await initGame();
    buildKeyboard();
    refreshGrid();
}

function showNewGameButton() {
    newGameElement.classList.remove("hidden");
    newGameElement.innerHTML = `
        <button id="newgame-btn">Nouvelle partie</button>
    `;

    document.getElementById("newgame-btn").onclick = () => {
        newGame();
    };
}

window.addEventListener('keydown', (e) => {
    if (gameOver) return;

    if (e.key === 'Enter') {
        e.preventDefault();
        submitAttempt();
    } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
    } else {
        const letter = e.key.toUpperCase();
        if (/^[A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸ]$/.test(letter)) {
            e.preventDefault();
            handleLetterInput(letter);
        }
    }
});

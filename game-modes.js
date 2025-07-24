// Game modes management
let currentGameMode = null;
let timerInterval = null;
let remainingTime = 300; // 5 minutes in seconds
let challengeWord = null;

// Menu navigation functions
function showMainMenu() {
    document.getElementById('main-menu').style.display = 'flex';
    document.getElementById('friends-menu').style.display = 'none';
    document.getElementById('create-challenge-form').style.display = 'none';
    document.getElementById('join-challenge-form').style.display = 'none';
    document.getElementById('game').style.display = 'none';
    document.querySelector('nav').style.display = 'none';
}

function showFriendsMenu() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('friends-menu').style.display = 'flex';
    document.getElementById('create-challenge-form').style.display = 'none';
    document.getElementById('join-challenge-form').style.display = 'none';
}

function showCreateChallenge() {
    document.getElementById('friends-menu').style.display = 'none';
    document.getElementById('create-challenge-form').style.display = 'flex';
}

function showJoinChallenge() {
    document.getElementById('friends-menu').style.display = 'none';
    document.getElementById('join-challenge-form').style.display = 'flex';
}

function startGame(mode, word = null) {
    currentGameMode = mode;
    
    // Hide menus
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('friends-menu').style.display = 'none';
    document.getElementById('create-challenge-form').style.display = 'none';
    document.getElementById('join-challenge-form').style.display = 'none';
    
    // Show game
    document.getElementById('game').style.display = 'block';
    document.querySelector('nav').style.display = 'flex';
    
    // Update title based on mode
    const titleElement = document.getElementById('game-mode-title');
    switch(mode) {
        case 'zen':
            titleElement.textContent = 'Skydle - Zen Mode';
            document.getElementById('timer-display').style.display = 'none';
            break;
        case 'timer':
            titleElement.textContent = 'Skydle - Timer Mode';
            document.getElementById('timer-display').style.display = 'block';
            startTimer();
            break;
        case 'friends':
            titleElement.textContent = 'Skydle - Friends Challenge';
            document.getElementById('timer-display').style.display = 'none';
            challengeWord = word;
            break;
    }
    
    // Initialize game with the appropriate word
    if (window.initializeGame) {
        window.initializeGame(word);
    }
}

function startTimer() {
    remainingTime = 300; // Reset to 5 minutes
    updateTimerDisplay();
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(() => {
        remainingTime--;
        updateTimerDisplay();
        
        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            endTimerGame();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timer-display').textContent = display;
}

function endTimerGame() {
    alert('Time\'s up! Game Over!');
    showMainMenu();
}

async function generateChallengeCode() {
    const word = document.getElementById('challenge-word').value.toUpperCase();
    
    if (word.length !== 5 || !/^[A-Z]+$/.test(word)) {
        alert('Please enter a valid 5-letter word');
        return;
    }
    
    // Check if it's a valid word using the wordle.js function
    if (window.isWordInWordList && !window.isWordInWordList(word.toLowerCase())) {
        alert('Word not in dictionary. Please enter a valid English word.');
        return;
    }
    
    // Simple encoding - in production, use proper encryption
    const code = btoa(word).substring(0, 6).toUpperCase();
    
    document.getElementById('challenge-code').textContent = code;
    document.getElementById('code-display').style.display = 'block';
    
    // Store the mapping temporarily (in production, use a backend)
    localStorage.setItem(`challenge_${code}`, word);
}

function copyCode() {
    const code = document.getElementById('challenge-code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        alert('Code copied to clipboard!');
    });
}

function joinChallengeWithCode() {
    const code = document.getElementById('challenge-code-input').value.toUpperCase();
    
    if (code.length !== 6) {
        alert('Please enter a valid 6-character code');
        return;
    }
    
    // Retrieve the word (in production, fetch from backend)
    const word = localStorage.getItem(`challenge_${code}`);
    
    if (!word) {
        alert('Invalid challenge code');
        return;
    }
    
    startGame('friends', word);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Main menu buttons - Only handle friends mode now, zen and timer have separate pages
    document.querySelectorAll('.menu-btn[data-mode]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.currentTarget.getAttribute('data-mode');
            if (mode === 'friends') {
                showFriendsMenu();
            }
        });
    });
    
    // Friends menu buttons
    document.getElementById('create-challenge')?.addEventListener('click', showCreateChallenge);
    document.getElementById('join-challenge')?.addEventListener('click', showJoinChallenge);
    
    // Challenge forms
    document.getElementById('generate-code')?.addEventListener('click', generateChallengeCode);
    document.getElementById('start-challenge')?.addEventListener('click', joinChallengeWithCode);
    
    // Menu button in nav
    document.getElementById('menu-button')?.addEventListener('click', () => {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        showMainMenu();
    });
});

// Export functions for use in other files
window.currentGameMode = currentGameMode;
window.challengeWord = challengeWord;
window.showMainMenu = showMainMenu;
window.showFriendsMenu = showFriendsMenu;
window.copyCode = copyCode;
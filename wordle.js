const testWordList = [
    "apple",
    "alley",
    "paper",
    "melon",
    "zebra",
    "books",
    "cheap",
];

window.wordList = {valid: [], playable: []};

const rating = {
    unknown: 0,
    absent: 1,
    present: 2,
    correct: 3,
};

function startGame(round) {
    // 8. load or start the game
    let {
        attemptCount,
        userAttempts,
        highlightedRows,
        keyboard,
        answer,
        status,
    } = loadOrStartGame();

    // 6. stop game if user reached maximum rounds or status is failure or success
    while (attemptCount <= round && status === "in-progress") {
        let currentGuess = prompt("Guess a five letter word: ");
        // 1. Check if word is in word list
        if (isInputCorrect(currentGuess)) {
            // 2. absent (grey), present (yellow), correct (green)
            const highlightedCharacters = getCharactersHighlight(
                currentGuess,
                answer
            );
            highlightedRows.push(highlightedCharacters);
            // 3. highlight keyboard
            keyboard = updateKeyboardHighlights(
                keyboard,
                currentGuess,
                highlightedCharacters
            );
            // 4. update status
            status = updateGameStatus(
                currentGuess,
                answer,
                attemptCount,
                round - 1
            );
            // 5. Update attempt count
            attemptCount = attemptCount + 1;
            // 6. save game
            saveGame({
                attemptCount,
                userAttempts,
                highlightedRows,
                keyboard,
                status,
            });
        } else {
            retry(currentGuess);
        }
    }
    if (status === "success") {
        alert("Congratulations");
    } else {
        alert(`The word is ${answer}`);
    }
}

function isInputCorrect(word) {
    return window.wordList.playable.includes(word) || window.wordList.valid.includes(word);
}

function retry(word) {
    alert(`${word} is not in word list`);
}

function getCharactersHighlight(word, answer) {
    // 1. split word into characters
    const charactersArray = word.split("");
    const result = [];

    // 2. check order of characters
    charactersArray.forEach((character, index) => {
        if (character === answer[index]) {
            // 2a. correct = index of word equal index of answer
            result.push("correct");
        } else if (answer.includes(character)) {
            // 2b. present = if not correct, character is part of answer
            result.push("present");
        } else {
            // 2c. absent = else, it must be absent
            result.push("absent");
        }
    });

    return result;
}

function getKeyboard() {
    const alphabets = "abcdefghijklmnopqrstuvwxyz".split("");
    const entries = [];
    for (const alphabet of alphabets) {
        entries.push([alphabet, "unknown"]);
    }
    return Object.fromEntries(entries);
}

// Make function available globally
window.getKeyboard = getKeyboard;

function updateKeyboardHighlights(
    keyboard,
    currentGuess,
    highlightedCharacter
) {
    // 5a. use currentGuess ("apple") highlightedCharacters (["correct", "present"...])
    // 5b. compare keyboard["a"] with "correct",
    // if keyboard status < "correct", update keyboard
    const newKeyboard = Object.assign({}, keyboard);

    for (let i = 0; i < highlightedCharacter.length; i++) {
        const character = currentGuess[i]; // R
        const nextStatus = highlightedCharacter[i]; // absent
        const nextRating = rating[nextStatus]; // 1
        const previousStatus = newKeyboard[character]; // unknown
        const previousRating = rating[previousStatus]; // 0

        if (nextRating > previousRating) {
            newKeyboard[character] = nextStatus;
        }
    }

    return newKeyboard;
}

function updateGameStatus(currentGuess, answer, attemptCount, round) {
    if (currentGuess === answer) {
        return "success";
    }
    if (attemptCount === round) {
        return "failure";
    }
    return "in-progress";
}

function saveGame(gameState) {
    // Use different localStorage keys for different game modes
    const gameMode = window.currentGameMode || 'default';
    const storageKey = `HSAKA_WORDLE_${gameMode.toUpperCase()}`;
    console.log(`Saving game state for mode: ${gameMode}, key: ${storageKey}`);
    window.localStorage.setItem(storageKey, JSON.stringify(gameState));
}

function getTodaysAnswer() {
    // Use random word instead of date-based for more variety
    const randomIndex = Math.floor(Math.random() * wordList.playable.length);
    return wordList.playable[randomIndex];
}

function getRandomAnswer() {
    // Get a completely random word from the playable list
    const randomIndex = Math.floor(Math.random() * wordList.playable.length);
    return wordList.playable[randomIndex];
}

// Make function available globally
window.getRandomAnswer = getRandomAnswer;

// Function to clear keyboard state for the current game mode
function clearCurrentModeKeyboard() {
    const gameMode = window.currentGameMode || 'default';
    const storageKey = `HSAKA_WORDLE_${gameMode.toUpperCase()}`;
    console.log(`Clearing keyboard state for mode: ${gameMode}`);
    window.localStorage.removeItem(storageKey);
}

// Make function available globally
window.clearCurrentModeKeyboard = clearCurrentModeKeyboard;

function isToday(timestamp) {
    const today = new Date();
    const check = new Date(timestamp);
    return today.toDateString() === check.toDateString();
}

async function loadOrStartGame(debug) {
    console.log("Loading word list...");
    window.wordList = await fetch("./src/fixtures/words.json")
        .then(response => {
            console.log("Word list response:", response);
            return response.json();
        })
        .then(json => {
            console.log("Word list loaded:", json.valid.length, "valid words,", json.playable.length, "playable words");
            return json;
        })
        .catch(error => {
            console.error("Error loading word list:", error);
            return {valid: [], playable: []};
        });

    let answer;

    if (debug) {
        answer = testWordList[0];
    } else {
        answer = getTodaysAnswer();
    }
    console.log("Today's answer:", answer);
    
    // Use different localStorage keys for different game modes
    const gameMode = window.currentGameMode || 'default';
    const storageKey = `HSAKA_WORDLE_${gameMode.toUpperCase()}`;
    console.log(`Loading game state for mode: ${gameMode}, key: ${storageKey}`);
    
    const prevGame = JSON.parse(window.localStorage.getItem(storageKey));

    if (prevGame && isToday(prevGame.timestamp)) {
        console.log("Loading previous game state for mode:", gameMode);
        return {
            ...prevGame,
            answer,
        };
    }
    console.log("Starting new game");
    return {
        attemptCount: 0,
        userAttempts: [],
        highlightedRows: [],
        keyboard: getKeyboard(),
        answer,
        status: "in-progress",
    };
}

/** Game State (Student) */
const GameState = {
    attemptCount: 0,
    userAttempts: [],
    highlightedRows: [],
    keyboard: {}, // Will be initialized in loadOrStart
    answer: "apple", // Only used for debugging
    status: "in-progress",
    getAttemptCount() {
        return this.attemptCount;
    },
    incrementAttempt() {
        this.attemptCount += 1;
        return this.attemptCount;
    },
    getAnswer() {
        return this.answer;
    },
    getCurrentGuess() {
        let currentGuess = this.userAttempts[this.attemptCount] ?? "";
        return currentGuess;
    },
    getUserAttempt() {
        return this.userAttempts;
    },
    setUserAttempt(currentGuess) {
        this.userAttempts[this.attemptCount] = currentGuess;
        return this.userAttempts;
    },
    getHighlightedRows() {
        return this.highlightedRows;
    },
    setHighlightedRows(highlightedCharacters) {
        this.highlightedRows.push(highlightedCharacters);
        return this.highlightedRows;
    },
    getKeyboard() {
        return this.keyboard;
    },
    setKeyboard(keyboard) {
        this.keyboard = keyboard;
        return this.keyboard;
    },
    getStatus() {
        return this.status;
    },
    setStatus(status) {
        this.status = status;
        return this.status;
    },
    save() {
        saveGame({
            attemptCount: this.attemptCount,
            userAttempts: this.userAttempts,
            highlightedRows: this.highlightedRows,
            keyboard: this.keyboard,
            status: this.status,
            timestamp: new Date().getTime(),
        });
    },
    async loadOrStart(debug) {
        const {
            attemptCount,
            userAttempts,
            highlightedRows,
            keyboard,
            answer,
            status,
        } = await loadOrStartGame(debug);
        this.attemptCount = attemptCount;
        this.userAttempts = userAttempts;
        this.highlightedRows = highlightedRows;
        this.keyboard = keyboard;
        this.answer = answer;
        this.status = status;
    },
    async startWithWord(word) {
        // Start a fresh game with a specific word
        this.attemptCount = 0;
        this.userAttempts = [];
        this.highlightedRows = [];
        this.keyboard = {};
        this.answer = word.toLowerCase();
        this.status = "in-progress";
        
        // Load word list for validation (same as loadOrStartGame)
        console.log("Loading word list for friends challenge...");
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
        
        // Initialize keyboard with clean state
        if (window.getKeyboard) {
            this.keyboard = window.getKeyboard();
        } else {
            // Fallback initialization
            const keys = "qwertyuiopasdfghjklzxcvbnm".split("");
            this.keyboard = {};
            keys.forEach(key => {
                this.keyboard[key] = "unknown";
            });
        }
    },
};

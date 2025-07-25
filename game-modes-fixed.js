// Fixed Friends Challenge code generation and retrieval
// This uses a more reliable encoding method that doesn't require localStorage sharing

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
    
    // Encode the word directly into the code (no backend needed)
    // Use a simple reversible encoding
    const encoded = btoa(word).replace(/=/g, ''); // Remove padding
    // Take first 6 characters and add a checksum character
    const checksum = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 26;
    const checksumChar = String.fromCharCode(65 + checksum); // A-Z
    const code = (encoded.substring(0, 5) + checksumChar).toUpperCase();
    
    document.getElementById('challenge-code').textContent = code;
    document.getElementById('code-display').style.display = 'block';
    
    // Still store locally for the creator's reference
    localStorage.setItem(`challenge_${code}`, word);
    localStorage.setItem('last_created_code', code);
}

function joinChallengeWithCode() {
    const code = document.getElementById('challenge-code-input').value.toUpperCase();
    
    if (code.length !== 6) {
        alert('Please enter a valid 6-character code');
        return;
    }
    
    try {
        // Decode the word from the code itself
        const encodedPart = code.substring(0, 5);
        const checksumChar = code.substring(5, 6);
        
        // Try different padding options
        let decoded = null;
        for (let padding of ['', '=', '==']) {
            try {
                const testDecode = atob(encodedPart + padding);
                if (testDecode.length === 5 && /^[A-Z]+$/.test(testDecode)) {
                    // Verify checksum
                    const checksum = testDecode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 26;
                    const expectedChecksumChar = String.fromCharCode(65 + checksum);
                    
                    if (expectedChecksumChar === checksumChar) {
                        decoded = testDecode;
                        break;
                    }
                }
            } catch (e) {
                // Try next padding option
            }
        }
        
        if (!decoded) {
            alert('Invalid challenge code. Please check and try again.');
            return;
        }
        
        // Start game with decoded word
        startGame('friends', decoded.toLowerCase());
        
    } catch (error) {
        console.error('Error decoding challenge:', error);
        alert('Invalid challenge code format.');
    }
}
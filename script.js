let playerXImage = "";
let playerOImage = "";
let isPlayerXTurn = true; // Player X starts selecting
let turnO = true; // Player O starts the game
let isAIMode = false; // Track if playing against AI

const playerTurnText = document.getElementById("player-turn");
const modeSelection = document.querySelector(".mode-selection");
const gameSetup = document.querySelector(".game-setup");

// Mode selection handlers
document.getElementById("vs-friend").addEventListener("click", () => {
    isAIMode = false;
    modeSelection.classList.add("hide");
    gameSetup.classList.remove("hide");
});

document.getElementById("vs-ai").addEventListener("click", () => {
    isAIMode = true;
    modeSelection.classList.add("hide");
    gameSetup.classList.remove("hide");
});

// Helper function to get name from image path
const getNameFromImagePath = (imagePath) => {
    // Extract filename from path and remove extension
    const filename = imagePath.split('/').pop().split('.')[0];
    // Convert to uppercase and replace hyphens with spaces
    return filename.toUpperCase().replace(/-/g, ' ');
};

// Helper function to start the game
const startGame = () => {
    gameSetup.classList.add("hide");
    document.getElementById("select-header").classList.add("hide");
    document.querySelector("main").classList.remove("hide");
    enableBoxes();
};

// AI move function
const makeAIMove = () => {
    // Get all available boxes
    const availableBoxes = Array.from(boxes).filter(box => !box.disabled && box.innerHTML === "");
    
    if (availableBoxes.length > 0) {
        // Simple AI: randomly select an available box
        const randomIndex = Math.floor(Math.random() * availableBoxes.length);
        const selectedBox = availableBoxes[randomIndex];
        
        // Simulate AI click after a short delay
        setTimeout(() => {
            selectedBox.innerHTML = `<img src="${playerOImage}" alt="O">`;
            selectedBox.disabled = true;
            turnO = false;
            checkWinner();
        }, 500);
    }
};

// AI selection function
const makeAISelection = () => {
    // Get all available images
    const availableImages = Array.from(document.querySelectorAll('.selectable:not([disabled])'));
    
    if (availableImages.length > 0) {
        // Randomly select an image
        const randomIndex = Math.floor(Math.random() * availableImages.length);
        const selectedImage = availableImages[randomIndex];
        
        // Simulate AI selection after a delay
        setTimeout(() => {
            playerOImage = selectedImage.src;
            selectedImage.classList.add("selected");
            selectedImage.disabled = true;
            selectedImage.style.opacity = "0.3";
            playerTurnText.textContent = "Game Starting...";
            
            // Start game after selection
            setTimeout(startGame, 1000);
        }, 1000);
    }
};

// Selecting the images
document.querySelectorAll(".selectable").forEach(img => {
    img.addEventListener("click", function() {
        if (this.disabled) return; // Ignore if image is already selected
        
        if (isPlayerXTurn) {
            playerXImage = this.src;
            this.classList.add("selected");
            this.disabled = true;
            this.style.opacity = "0.3";
            isPlayerXTurn = false;
            
            if (isAIMode) {
                playerTurnText.textContent = "AI is choosing...";
                makeAISelection();
            } else {
                playerTurnText.textContent = "Player O - Choose your picture";
            }
        } else if (!isAIMode) {
            playerOImage = this.src;
            this.classList.add("selected");
            this.disabled = true;
            this.style.opacity = "0.3";
            playerTurnText.textContent = "Game Starting...";
            
            // Ensure turnO is set to false so X starts the game
            turnO = false;
            
            setTimeout(() => {
                startGame();
            }, 1000);
        }
    });
});

let boxes = document.querySelectorAll('.box');
let resetBtn = document.querySelector('#reset');
let newGameBtn = document.querySelector('#new-btn');
let msgContainer = document.querySelector('.msg-container');
let msg = document.querySelector('#msg');

const winPatterns = [
    [0, 1, 2], [0, 3, 6], [0, 4, 8], 
    [1, 4, 7], [2, 5, 8], [2, 4, 6], 
    [3, 4, 5], [6, 7, 8]
];

boxes.forEach((box) => {
    box.addEventListener('click', function() {
        if (box.disabled || box.innerHTML !== "") return;
        
        if (isAIMode) {
            // In AI mode, player is always X
            box.innerHTML = `<img src="${playerXImage}" alt="X">`;
            box.disabled = true;
            turnO = true;
            
            if (!checkWinner()) {
                makeAIMove();
            }
        } else {
            // Friend mode - alternate between X and O with correct images
            if (turnO) {
                box.innerHTML = `<img src="${playerOImage}" alt="O">`;
                turnO = false;
            } else {
                box.innerHTML = `<img src="${playerXImage}" alt="X">`;
                turnO = true;
            }
            box.disabled = true;
            checkWinner();
        }
    });
});

const enableBoxes = () => {
    for (let box of boxes) {
        box.disabled = false;
        box.innerHTML = "";
    }
};

const disableBoxes = () => {
    for (let box of boxes) {
        box.disabled = true;
    }
};

const showWinner = (winner) => {
    // Get the winner's image source
    const winnerImage = winner.includes(playerOImage) ? playerOImage : playerXImage;
    const winnerName = getNameFromImagePath(winnerImage);
    
    // Create winner display element
    const winnerDisplay = document.createElement('div');
    winnerDisplay.className = 'winner-display';
    winnerDisplay.innerHTML = `
        <img src="${winnerImage}" alt="Winner ${winnerName}">
    `;
    
    // Add to document
    document.body.appendChild(winnerDisplay);
    
    // Update message with AI context if applicable
    const winnerText = isAIMode && winner.includes(playerOImage) 
        ? "AI Wins!" 
        : `${winnerName} Wins!`;
    msg.innerText = `Congratulations, ${winnerText}`;
    msgContainer.classList.remove('hide');
    disableBoxes();
    
    // Remove winner display after animation
    setTimeout(() => {
        winnerDisplay.remove();
    }, 2000);
};

const checkWinner = () => {
    let hasWin = false;
    for (let pattern of winPatterns) {
        let pos1 = boxes[pattern[0]].innerHTML;
        let pos2 = boxes[pattern[1]].innerHTML;
        let pos3 = boxes[pattern[2]].innerHTML;

        if (pos1 !== "" && pos2 !== "" && pos3 !== "" && pos1 === pos2 && pos2 === pos3) {
            showWinner(pos1);
            hasWin = true;
            return true;
        }
    }

    if (!hasWin) {
        const allBoxes = [...boxes].every((box) => box.innerHTML !== "");
        if (allBoxes) {
            msgContainer.classList.remove('hide');
            msg.innerText = 'Match Drawn';
            return true;
        }
    }
    return false;
};

const resetGame = () => {
    turnO = true;
    isPlayerXTurn = true;
    enableBoxes();
    msgContainer.classList.add('hide');

    // Show mode selection screen
    modeSelection.classList.remove("hide");
    gameSetup.classList.add("hide");
    document.querySelector("main").classList.add("hide");

    // Reset player turn text
    playerTurnText.textContent = "Player X - Choose your picture";

    // Clear selections and reset image availability
    playerXImage = "";
    playerOImage = "";
    document.querySelectorAll(".selectable").forEach(img => {
        img.classList.remove("selected");
        img.style.opacity = "1";
        img.disabled = false;
    });
    
    // Remove any existing winner display
    const existingWinnerDisplay = document.querySelector('.winner-display');
    if (existingWinnerDisplay) {
        existingWinnerDisplay.remove();
    }
};

// Apply reset function to both buttons
newGameBtn.addEventListener('click', resetGame);
resetBtn.addEventListener('click', resetGame);

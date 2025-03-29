let playerTurn = true;
let computerMoveTimeout = 0;

const gameStatus = {
    MORE_MOVES_LEFT: 1,
    HUMAN_WINS: 2,
    COMPUTER_WINS: 3,
    DRAW_GAME: 4
};

window.addEventListener("DOMContentLoaded", domLoaded);

function domLoaded() {
    // Setup the click event for the "New game" button
    const newBtn = document.getElementById("newGameButton");
    newBtn.addEventListener("click", newGame);

    // Create click-event handlers for each game board button
    const buttons = getGameBoardButtons();
    for (let button of buttons) {
        button.addEventListener("click", function () {
            boardButtonClicked(button);
        });
    }

    // Clear the board
    newGame();
}

// Returns an array of 9 <button> elements that make up the game board. The first 3
// elements are the top row, the next 3 the middle row, and the last 3 the
// bottom row.
function getGameBoardButtons() {
    return document.querySelectorAll("#gameBoard > button");
}

function checkForWinner() {

    const buttons = getGameBoardButtons();

    // Ways to win
    const possibilities = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];

    // Check for a winner first
    for (let indices of possibilities) {
        if (buttons[indices[0]].innerHTML !== "" &&
            buttons[indices[0]].innerHTML === buttons[indices[1]].innerHTML &&
            buttons[indices[1]].innerHTML === buttons[indices[2]].innerHTML) {

            // Found a winner
            if (buttons[indices[0]].innerHTML === "X") {
                return gameStatus.HUMAN_WINS;
            } else {
                return gameStatus.COMPUTER_WINS;
            }
        }
    }

    // See if any more moves are left
    for (let button of buttons) {
        if (button.innerHTML !== "X" && button.innerHTML !== "O") {
            return gameStatus.MORE_MOVES_LEFT;
        }
    }

    // If no winner and no moves left, then it's a draw
    return gameStatus.DRAW_GAME;
}

function newGame() {
    // TODO: Complete the function

    clearTimeout();
    computerMoveTimeout = 0;
    playerTurn = true;
    document.getElementById("turnInfo").innerText = "Your turn";

    let buttons = getGameBoardButtons(); //document.getElementById("gameBoard");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].textContent = "";
        buttons[i].disabled = false;
        buttons[i].className = "";
    }


}

function boardButtonClicked(button) {
    // TODO: Complete the function

    if (!playerTurn)
        playerTurn = !playerTurn;

    if (playerTurn) {
        button.textContent = "X";
        button.className = "x";
        button.disabled = true;
        document.getElementById("turnInfo").innerText = "Computer's turn";

        //playerTurn = !playerTurn; //true;
        switchTurn();

    }
    //playerTurn = !playerTurn; //true;
}


function disableBoardButton() {
    let buttons = getGameBoardButtons(); //document.getElementById("gameBoard");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
    }


}

function switchTurn() {
    // TODO: Complete the function

    let status = checkForWinner();

    if (status == gameStatus.MORE_MOVES_LEFT) {

        if (playerTurn) {
            playerTurn = !playerTurn; //true;
            if (playerTurn) {
                document.getElementById("turnInfo").innerText = "Your turn";
            } else {
                document.getElementById("turnInfo").innerText = "Computer's turn";
            }
            computerMoveTimeout = setTimeout(makeComputerMove, 1000);

        }

    } else {

        playerTurn = false;
        disableBoardButton();

        if (status == gameStatus.HUMAN_WINS) {
            document.getElementById("turnInfo").innerText = "You win!";
        } else if (status == gameStatus.COMPUTER_WINS) {
            document.getElementById("turnInfo").innerText = "Computer wins!";
        } else if (status == gameStatus.DRAW_GAME) {
            document.getElementById("turnInfo").innerText = "Draw game";
        }
    }


}

function makeComputerMove() {
    // TODO: Complete the function

    let buttons = getGameBoardButtons(); //document.getElementById("gameBoard");
    let availableButtons = [];

    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].disabled == false) {
            availableButtons.push(i);   // get all buttons available

        }
    }


    const randomButton = buttons[availableButtons[Math.floor(Math.random() * availableButtons.length)]];

    randomButton.textContent = "O";
    randomButton.className = "o";
    randomButton.disabled = true;

    document.getElementById("turnInfo").innerText = "Your turn";

    switchTurn();

}

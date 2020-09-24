'use strict';

var MINE = '💣';
var FLAG = '🚩';
var EMPTY = '';
var HEART = '💖';
var gBoards = [];
var gNextId = 0;
var gCountMine = 0;
var gIsShown = false;
var gTime;
var gIsGameOn = true;
var gElCountMine = 0;
var gHeart = 3;


//The model
var gBoard = {};


//This is an object by which the board size is set (in this case: 4x4 board and how many mines to put)
var gLevel = {
    SIZE: 4,
    MINES: 2
};

var gGame = {
    isOn: false, //when true we let the user play
    shownCount: 0,//How many cells are shown
    markedCount: 0,//How many cells are marked (with a flag)
    secsPassed: 0//How many seconds passed
}

function toggleGame() {//start or restart the game
    stopTimer();

    var elBtn = document.querySelector('.play-btn');
    elBtn.innerText = '😃';
    initGame();
}


//This is called when page loads
function initGame() {
    stopTimer();

    gCountMine = gLevel.MINES;
    gElCountMine = document.querySelector('.gCurrNumber');
    gElCountMine.innerText = gCountMine;
    gBoards = buildBoard(gBoards);
    gHeart = 3;
    var elHeart = document.querySelector('.lifes');
    elHeart.innerText = '💖💖💖';
    renderBoard(gBoards);
    startTime();
}

//Game ends when all mines are marked, and all the other cells are shown
function gameOver() {
    stopTimer();
    var elBtn = document.querySelector('.play-btn');
    elBtn.innerText = '😵';
    console.log('game over');
    gHeart = 3;

}

// function victory() {//need flag before
//     stopTimer();
//     console.log('win');
// var elBtn = document.querySelector('.play-btn');
// elBtn.innerText = '🤩';
// // }

//get from the user the game board size
function choseSize(BoardSize) {
    var elLevel = BoardSize;
    switch (elLevel.innerText) {
        case 'Easy':
            gLevel.SIZE = 4,
                gLevel.MINES = 2
            break;
        case 'Hard':
            gLevel.SIZE = 8,
                gLevel.MINES = 12
            break;
        case 'Extreme!':
            gLevel.SIZE = 12,
                gLevel.MINES = 30
            break;
    }
}


//Builds the board Set mines at random locations Call setMinesNegsCount() Return the created board
function buildBoard(board) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currBoard = createBoard();
            board[i][j] = currBoard;
        }
    }
    var countMine = gLevel.MINES;
    while (countMine > 0) {
        i = randIdxMine();
        j = randIdxMine();
        board[i][j].isMine = true;
        countMine--;
    }
    var finalBoard = setMinesNegsCount(board);
    return finalBoard;
}

function createBoard() {
    return {
        id: gNextId++,
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
    };
}

//rand idx for MINE
function randIdxMine() {
    var i = getRandNum(0, gBoards.length - 1);
    return i;
}

function renderBoard(board) {
    var htmlStr = '';
    for (var i = 0; i < gLevel.SIZE; i++) {
        htmlStr += '<tr>';
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = board[i][j];
            htmlStr += '<td  id="' + cell.id + '" onclick="cellClicked(this, event)"></td>';
        }
    }
    htmlStr += '</tr>';
    var elTable = document.querySelector('.container');
    elTable.innerHTML = htmlStr;
}

// function whichButton(event, id){
// onmousedown="whichButton(event)" 
//     if(event.button === 2){
//         var elRightClick = getBoardById(elCell.id);
//         elRightClick.innerHTML = FLAG;
// gCountMine--
// gElCountMine.innerText = gCountMine;
//     } 
//     return;
// }

// when clicked reveals the cell
function cellClicked(elCell, ev) {
    
    var elBoard = getBoardById(elCell.id);
    elBoard.isShown = true;
    if (ev.button === 2) {
        elCell.innerText = FLAG;
    }
    else if (elBoard.isShown && elBoard.isMine && gHeart > 0) {
        elCell.innerText = MINE;
        gHeart--;
        gCountMine--;
        gElCountMine.innerText = gCountMine;
        if (gHeart === 2) {
            var elHeart = document.querySelector('.lifes');
            elHeart.innerText = '💖💖';
        }
        else if (gHeart === 1) {
            var elHeart = document.querySelector('.lifes');
            elHeart.innerText = '💖';
        }
        else {
            var elHeart = document.querySelector('.lifes');
            elHeart.innerText = '😭';
            for (var i = 0; i < gLevel.SIZE; i++) {
                for (var j = 0; j < gLevel.SIZE; j++) {
                    if (gBoards[i][j].isMine) {
                        var elMine = document.getElementById(gBoards[i][j].id);
                        elMine.innerText = MINE;
                    }
                }
            }


            gameOver();
        }

    }
    else if (elBoard.isShown && elBoard.isMine) {
        for (var i = 0; i < gLevel.SIZE; i++) {
            for (var j = 0; j < gLevel.SIZE; j++) {
                if (gBoards[i][j].isMine) {
                    var elMine = document.getElementById(gBoards[i][j].id);
                    elMine.innerText = MINE;
                }
            }

        }
        gameOver();
    }
    else if (elBoard.isShown) {
        elCell.innerText = elBoard.minesAroundCount;
    }
    else { elCell.innerText = ''; }

}

function getBoardById(id) {
    var idNum = Number(id);
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var board = gBoards[i][j];
            if (board.id === idNum) {
                return board;
            }
        }
    }
    return null;
}

// Count mines around each cell and set the cell's minesAroundCount.
function setMinesNegsCount(boardMine) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currCell = boardMine[i][j];

            if (i === 0 && j === 0) {//corner
                if (boardMine[i][j + 1].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i + 1][j + 1].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i + 1][j].isMine) {
                    currCell.minesAroundCount++;
                }
            }
            else if (i === 0 && j === gLevel.SIZE - 1) {//corner
                if (boardMine[i][j - 1].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i + 1][j - 1].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i + 1][j].isMine) {
                    currCell.minesAroundCount++;
                }
            }
            else if (i === gLevel.SIZE - 1 && j === 0) {//corner
                if (boardMine[i - 1][j].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i - 1][j + 1].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i][j + 1].isMine) {
                    currCell.minesAroundCount++;
                }
            }
            else if (i === gLevel.SIZE - 1 && j === gLevel.SIZE - 1) {//corner
                if (boardMine[i - 1][j].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i - 1][j - 1].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i - 1][j - 1].isMine) {
                    currCell.minesAroundCount++;
                }
            }
            else if (i === 0 && j !== 0 && j !== gLevel.SIZE - 1) {//first line
                if (boardMine[i + 1][j - 1].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i][j - 1].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i + 1][j].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i][j + 1].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i + 1][j + 1].isMine) {
                    currCell.minesAroundCount++;
                }
            }
            else if (i === gLevel.SIZE - 1 && j !== 0 && j !== gLevel.SIZE - 1) {//last line
                if (boardMine[i - 1][j - 1].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i][j - 1].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i - 1][j].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i][j + 1].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i - 1][j + 1].isMine) {
                    currCell.minesAroundCount++;
                }
            }

            else if (j === 0 && i !== 0 && i !== gLevel.SIZE - 1) {//side left
                if (boardMine[i - 1][j].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i + 1][j].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i - 1][j + 1].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i][j + 1].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i + 1][j + 1].isMine) {
                    currCell.minesAroundCount++;
                }
            }
            else if (j === gLevel.SIZE - 1 && i !== 0 && i !== gLevel.SIZE - 1) {//side rigth
                if (boardMine[i - 1][j].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i - 1][j - 1].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i][j - 1].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i + 1][j - 1].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i + 1][j].isMine) {
                    currCell.minesAroundCount++;
                }
            }

            else {
                if (boardMine[i][j + 1].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i][j - 1].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i - 1][j - 1].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i - 1][j].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i - 1][j + 1].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i + 1][j - 1].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i + 1][j].isMine) {
                    currCell.minesAroundCount++;
                }
                if (boardMine[i + 1][j + 1].isMine) {
                    currCell.minesAroundCount++;
                }
            }
        }
    }
    return boardMine;
}



//Called on right click to mark a cell with flag
// function cellMarked(eventKeyboard) {//flag
//     switch(eventKeyboard.code){
//         case 'ArrowUp':

//     }



// }




//When user clicks a cell with no mines around, we need to open not only that cell,
//  but also its neighbors. NOTE: start with a basic implementation
//   that only opens the non-mine 1st degree neighbors
function expandShown(board, elCell, i, j) {

}

//maximum & minimum inclusive 
function getRandNum(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function startTime() {
    // gGameToggle = true;
    var startTime = new Date();
    gTime = setInterval(function () {
        var currTime = new Date();
        var seconds = (currTime - startTime) / 1000;
        var elTimer = document.querySelector('.timer');
        elTimer.innerText = seconds;
    }, 100)
}
function stopTimer() {
    clearInterval(gTime);
}
'use strict';

var MINE = '💣';
var EMPTY = '';
var gBoards = [];
var gNextId = 0;
var gCountMine = 0;
var gIsShown = false;

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




//This is called when page loads
function initGame() {
    gCountMine = gLevel.MINES;
    gBoards = buildBoard(gBoards);
    renderBoard(gBoards);
}

//get from the user the game board size
function choseSize(BoardSize) {
    switch (BoardSize.innerText) {
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
            // console.log(board[i][j]);
        }
    }
    var finalBoard = setMinesNegsCount(board);
    return finalBoard;
}

function createBoard() {
    if (gCountMine > 0) {
        gCountMine--;
        return {
            id: gNextId++,
            minesAroundCount: 0,
            isShown: false,
            isMine: true,
            isMarked: false
        };
    }
    return {
        id: gNextId++,
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
    };
}

function renderBoard(board) {
    var htmlStr = '';
    for (var i = 0; i < gLevel.SIZE; i++) {
        htmlStr += '<tr>';
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = board[i][j];
            htmlStr += '<td  id="' + cell.id + '" onclick="cellClicked(this)"></td>';
        }
    }
    htmlStr += '</tr>';
    var elTable = document.querySelector('.container');
    elTable.innerHTML = htmlStr;
}

function cellClicked(elCell) {
    // <td id="1" onclick="cellClicked(this)"></td>

    var elBoard = getBoardById(elCell.id);
    elBoard.isShown = true;
    if (elBoard.isShown && elBoard.isMine) {
        elCell.innerText = MINE;
    }
    else if (elBoard.isShown) {
        elCell.innerText = elBoard.minesAroundCount;
    }
    else { elCell.innerText = ''; }

   
    console.log(elCell);
    console.log(elBoard.isShown);
    console.log(elBoard.isMine);
}

function getBoardById(id) {
    var idNum = Number(id);
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++){
        var board = gBoards[i][j];
        if (board.id === idNum){
             return board;}
    }}
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



//Called on right click to mark a cell (suspected to be a mine) Search the web (and implement)
// how to hide the context menu on right click
function cellMarked(elCell) {

}


//Game ends when all mines are marked, and all the other cells are shown
function checkGameOver() {

}

//When user clicks a cell with no mines around, we need to open not only that cell,
//  but also its neighbors. NOTE: start with a basic implementation
//   that only opens the non-mine 1st degree neighbors
function expandShown(board, elCell, i, j) {

}

//Render the board as a <table> to the page
// function renderBoard(board) {
//     var htmlStr = '';
//     for (var i = 0; i < gLevel.SIZE; i++) {
//         htmlStr += '<tr>';
//         for (var j = 0; j < gLevel.SIZE; j++) {
//             var cell = board[i][j];
//             if (cell.isShown && cell.isMine) {
//                 htmlStr += '<td  id="' + cell.id + '" onclick="cellClicked(this)">' + MINE + '</td>';
//             }
//             else if (cell.isShown) {
//                 htmlStr += '<td  id="' + cell.id + '" onclick="cellClicked(this)">' + cell.minesAroundCount + '</td>';
//             }
//             else { htmlStr += '<td  id="' + cell.id + '" onclick="cellClicked(this)"></td>'; }
//         }
//         htmlStr += '</tr>';
//     }
//     var elTable = document.querySelector('.container');
//     elTable.innerHTML = htmlStr;
// }
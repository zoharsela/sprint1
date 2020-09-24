'use strict';

document.addEventListener('contextmenu', event => event.preventDefault());

var MINE = '💣';
var FLAG = '🚩';
var EMPTY = '';
var HEART = '💖';
var LOSEHE = '😭';
var LOSE = '😵';
var START = '😃';
var CLUE = '💡';
var CLUEuse = '✳';
var gBoards = [];
var gNextId = 0;
var gCountMine = 0;
var gIsShown = false;
var gTime;
var gIsGameOn = true;
var gElCountMine = 0;
var gHeart = 2;
var gCountFlag = 0;
var gIsGameOver = false;
var gCountMineFalse = 0;
var gIsStartTimer;
var gHintClick = false;
var gHintTime;
var gCountHint = 3;
var timeHint;


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
    elBtn.innerText = START;
    initGame();
}


//This is called when page loads
function initGame() {
    stopTimer();
    gCountHint = 3;
    gNextId = 0;
    gIsGameOver = false;
    gCountMine = gLevel.MINES;
    gCountMineFalse = gCountMine;
    gElCountMine = document.querySelector('.gCurrNumber');
    gElCountMine.innerText = gCountMine;
    gBoards = buildBoard(gBoards);
    var elHeart = document.querySelector('.lifes');
    if (gHeart === 2) elHeart.innerText = HEART + HEART;
    else { elHeart.innerText = HEART + HEART + HEART; }
    renderBoard(gBoards);
    gIsStartTimer = true;
}

//Game ends when all mines are marked, and all the other cells are shown
function gameOver() {
    stopTimer();
    var elBtn = document.querySelector('.play-btn');
    elBtn.innerText = LOSE;
    console.log('game over');
    gIsGameOver = true;
}

function checkVictory() {//need flag before
    if (gCountMine === 0 || (gCountMine === 1 && gCountFlag === 1) || (gCountMine === 3 && gCountFlag === 0) || (gCountMine === 3 && gCountFlag === 0)) {
        stopTimer();
        console.log('win');
        var elBtn = document.querySelector('.play-btn');
        elBtn.innerText = '🤩';
        revealCells(gBoards);

    }
}

//get from the user the game board size
function choseSize(BoardSize) {
    var elLevel = BoardSize;
    switch (elLevel.innerText) {
        case 'Easy':
            gLevel.SIZE = 4,
                gLevel.MINES = 2
            gHeart = 2

            break;
        case 'Hard':
            gLevel.SIZE = 8,
                gLevel.MINES = 12
            gHeart = 3
            break;
        case 'Extreme!':
            gLevel.SIZE = 12,
                gLevel.MINES = 30
            gHeart = 3
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
    setMinesNegsCount(board);
    return board;
}

function createBoard() {
    return {
        id: gNextId++,
        minesAroundCount: 0,
        gIsShown: false,
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
            htmlStr += '<td  id="' + cell.id + '" onclick="cellClicked(this, ' + i + ', ' + j + ')"  onmousedown="whichButton(event, this)" ></td>';
        }
    }
    htmlStr += '</tr>';
    var elTable = document.querySelector('.container');
    elTable.innerHTML = htmlStr;
}

//right click flag
function whichButton(ev, elCell) {
    if (gIsStartTimer) {
        startTime();
        gIsStartTimer = !gIsStartTimer;
    }
    var elBoard = getBoardById(elCell.id);
    if (gIsGameOver) return;
    if (ev.button === 2) {
        if (elCell.innerText === FLAG) {
            elCell.innerText = '';
            return;
        }
        elCell.innerText = FLAG;
        if (elBoard.isMine) {
            gCountMine--;
            gElCountMine.innerText = gCountMine;
        }
        gCountFlag++;
        checkVictory();
    }
    return;
}


// when clicked reveals the cell
function cellClicked(elCell, i, j) {
    if (gIsStartTimer) {
        startTime();
        gIsStartTimer = !gIsStartTimer;
    }
    if (gHintClick) {
        revealNegs(gBoards, { i, j });
        timeHint = setInterval(coverNegs(gBoards, { i, j }), 10000);
        console.log(timeHint);
        gHintClick = !gHintClick;
        if (gHintClick === 2) {
            var elclues = document.querySelector('.clues');
            elclues.innerText = CLUE + CLUE;
        }if (gHintClick === 1) {
            var elclues = document.querySelector('.clues');
            elclues.innerText = CLUE;
        }else{
            var elclues = document.querySelector('.clues');
            elclues.innerText = '';
        }

    }
    if (gIsGameOver) return;
    if (elCell.innerText === FLAG) return;
    var elBoard = getBoardById(elCell.id);
    if (elBoard.gIsShown) return;

    if (!elBoard.gIsShown && elBoard.isMine && gHeart > 0) {
        elCell.innerText = MINE;
        gHeart--;
        gCountMine--;
        gElCountMine.innerText = gCountMine;
        if (gHeart === 2) {
            var elHeart = document.querySelector('.lifes');
            elHeart.innerText = HEART + HEART;
            elBoard.gIsShown = true;
        }
        else if (gHeart === 1) {
            var elHeart = document.querySelector('.lifes');
            elHeart.innerText = HEART;
            elBoard.gIsShown = true;
        }
        else {
            var elHeart = document.querySelector('.lifes');
            elHeart.innerText = LOSEHE;
            renderCell(gBoards[i][j].id, MINE)
            elBoard.gIsShown = true;

            gameOver();
        }

    }
    else if (!elBoard.gIsShown && elBoard.isMine) {
        renderCell(gBoards[i][j].id, MINE);
        elBoard.gIsShown = true;
        gameOver();
    }
    else if (!elBoard.gIsShown) {
        if (elBoard.minesAroundCount === 0) {
            elCell.style.backgroundColor = 'rgb(151, 146, 146)';
            revealNegs(gBoards, { i, j });
            elBoard.gIsShown = true;
            return;
        }
        else {
            renderCell(gBoards[i][j].id, elBoard.minesAroundCount);
            elBoard.gIsShown = true;
        }
    }
    return elCell;
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

function renderCell(id, value) {
    var elTd = document.getElementById(id);
    elTd.innerText = value;

}

function renderEmptyCell(id) {
    var elTd = document.getElementById(id);
    elTd.style.backgroundColor = 'rgb(151, 146, 146)';
}

function renderEmptyCellHint(id) {
    
    var elTd = document.getElementById(id);
    elTd.style.backgroundColor = 'rgb(68, 66, 66)';
    console.log('elTd.style.backgroundColor', elTd.style.backgroundColor);
}

function revealNegs(board, pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === pos.i && j === pos.j) continue;
            if (!board[i][j].isMine) {
                if (board[i][j].minesAroundCount === 0) {
                    board[i][j].gIsShown = true;
                    renderEmptyCell(board[i][j].id);
                }
                else {
                    board[i][j].gIsShown = true;
                    renderCell(board[i][j].id, board[i][j].minesAroundCount);
                }
            }
        }
    }
    return;
}

function coverNegs(board, pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === pos.i && j === pos.j) continue;
            if (board[i][j].gIsShown) {
                console.log(!board[i][j].gIsShown);
                renderEmptyCellHint(board[i][j].id);
            }
        }
    }
    clearInterval(timeHint);
}



//count mines arount cell
function countMinesNegs(pos) {
    var mineCounter = 0;
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue;
            if (i === pos.i && j === pos.j) continue;
            if (gBoards[i][j].isMine) {
                mineCounter++;
            }
        }
    }
    return mineCounter;
}

//set minesAroundCount value
function setMinesNegsCount(boardMine) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var mineCount = countMinesNegs({ i, j });
            boardMine[i][j].minesAroundCount = mineCount;
        }
    }
}

function hintGame(elHint) {
    gCountHint--;
    elHint.innerText = CLUEuse;
    gHintClick = true;
}

//at the end of the game
function revealCells(gBoards) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (!gBoards[i][j].gIsShown) {
                console.log(gBoards[i][j].id);
                var elCell = document.getElementById(gBoards[i][j].id);
                elCell.innerText = gBoards[i][j].minesAroundCount;
            }
        }
    }
}


//maximum & minimum inclusive 
function getRandNum(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function startTime() {
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
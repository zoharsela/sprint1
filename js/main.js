'use strict';

document.addEventListener('contextmenu', event => event.preventDefault());

var MINE = '💣';
var MINE_R = '❌';
var FLAG = '🚩';
var EMPTY = '';
var HEART = '💖';
var LOSEHE = '😭';
var LOSE = '😵';
var START = '😃';
var CLICK_MINE = '😲'
var CLUE = '💡';
var CLUEuse = '✳';
var gBoards = [];
var gNextId = 0;
var gTime;
var gElCountMine = 0;
var gHeart = 1;
var gIsStartTimer;
var gHintClick = false;
var gHintTime;
var gCountHint = 3;
var timeHint;
var gFirstClick;
var gBoardMine = [];



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
    gGame.shownCount = gLevel.SIZE ** 2;
    gBoardMine = [];
    gFirstClick = true;
    stopTimer();
    var ElStart = document.querySelector('.play-btn');
    ElStart.innerText = START;
    gCountHint = 3;
    gNextId = 0;
    gGame.isOn = true;
    gGame.markedCount = gLevel.MINES;
    gElCountMine = document.querySelector('.gCurrNumber');
    gElCountMine.innerText = gLevel.MINES;
    var elHeart = document.querySelector('.lifes');
    if (gHeart === 1) { elHeart.innerText = HEART; }
    else { elHeart.innerText = HEART + HEART + HEART; }
    gBoards = buildBoardFirst();
    renderBoard(gBoards);
    gIsStartTimer = true;
}

//Game ends when all mines are marked, and all the other cells are shown
function gameOver(board) {
    stopTimer();
    for (var i = 0; i < board.length; i++) {
        renderCell(board[i].id, MINE)
    }
    var elBtn = document.querySelector('.play-btn');
    elBtn.innerText = LOSE;
    console.log('game over');
    gGame.isOn = false;
}

function checkVictory() {
    if (!gFirstClick) {
        if ((gGame.markedCount === 1 && gGame.shownCount === 0) ||
            (gGame.markedCount === 2 && gGame.shownCount === 0) ||
            (gGame.markedCount === 0 && gGame.shownCount === 0) ||
            (gGame.markedCount === 9 && gGame.shownCount === 0) ||
            (gGame.markedCount === 27 && gGame.shownCount === 0) ||
            (gGame.markedCount === 12 && gGame.shownCount === 12) ||
            (gGame.markedCount === 30 && gGame.shownCount === 30)
        ) {
            console.log('gGame.markedCount', gGame.markedCount, 'gGame.shownCount', gGame.shownCount);
            stopTimer();
            console.log('win');
            var elBtn = document.querySelector('.play-btn');
            elBtn.innerText = '🤩';
            revealCells(gBoards);
            gGame.isOn = false;
        }
    }
}

//get from the user the game board size
function choseSize(BoardSize) {
    var elLevel = BoardSize;
    switch (elLevel.innerText) {
        case 'Easy':
            gLevel.SIZE = 4,
                gLevel.MINES = 2
            gHeart = 1
            initGame();
            break;
        case 'Hard':
            gLevel.SIZE = 8,
                gLevel.MINES = 12
            gHeart = 3
            initGame();
            break;
        case 'Extreme!':
            gLevel.SIZE = 12,
                gLevel.MINES = 30
            gHeart = 3
            initGame();
            break;
    }
}
function buildBoardFirst() {
    var boards = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        boards[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currBoard = createBoard();
            boards[i][j] = currBoard;
        }
    }
    return boards;
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

//Builds the board Set mines at random locations Call setMinesNegsCount() Return the created board
function buildBoard(clickedI, clickedJ) {
    console.log('clickedI, clickedJ', clickedI, clickedJ);
    var boards = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        boards[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currBoard = createBoard();
            boards[i][j] = currBoard;
        }
    }
    var mineLoc = [{}];
    var countMine = gLevel.MINES;
   
    var mineLocs = {
        mineLoc: [{
            locI: clickedI, locJ: clickedJ
        }
        ],
    };
    var count;
    while (countMine > 0) {
        console.log('countMine', countMine);
        count = 0;
        i = randIdxMine();
        j = randIdxMine();
        console.log('i, j', i, j);
        mineLoc.locI = i;
        mineLoc.locJ = j;
        mineLocs.mineLoc.push({ locI: i, locJ: j });
        console.log('mineLocs.mineLoc.length', mineLocs.mineLoc.length);

        for (var x = 0; x < mineLocs.mineLoc.length; x++) {
            console.log('gLevel.MINES', gLevel.MINES);
console.log(mineLocs.mineLoc[x].locI, mineLocs.mineLoc[x].locJ);
            if (i === mineLocs.mineLoc[x].locI && j === mineLocs.mineLoc[x].locI) {
                count++;
                console.log('count', count);
                console.log('10000000000000');
                continue;

                // console.log('boards[i][j].isMine', i, j);
            }

        }
        if (x === mineLocs.mineLoc.length && count === 0) {
            boards[i][j].isMine = true;
            gBoardMine.push(boards[i][j]);
            console.log('gBoardMine', gBoardMine);
            countMine--;
        }
    }

    // else if(){
    //     boards[i][j].isMine = true;
    //     gBoardMine.push(boards[i][j]);
    //     countMine--;
    //     // console.log('boards[i][j].isMine', i, j);
    // }

    console.log('mineLocs', mineLocs);
    setMinesNegsCount(boards);
    return boards;
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
    var z = getRandNum(0, gLevel.SIZE - 1);
    return z;
}

function renderBoard(board) {
    var htmlStr = '';
    for (var i = 0; i < gLevel.SIZE; i++) {
        htmlStr += '<tr>';
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = board[i][j];
            htmlStr += '<td  id="' + cell.id + '" onclick="cellClicked(this, ' + i + ', ' + j + ')"  onmousedown="rightButton(event, this)" ></td>';
        }
    }
    htmlStr += '</tr>';
    var elTable = document.querySelector('.container');
    elTable.innerHTML = htmlStr;
}

//right click flag
function rightButton(ev, elCell) {

    if (!gGame.isOn) return;
    var elBoard = getBoardById(elCell.id);
    // if (gIsStartTimer) {
    //     startTime();
    //     gIsStartTimer = !gIsStartTimer;
    // }
    if (ev.button === 2) {
        if (elCell.innerText === FLAG) {
            renderEmptyCell(elBoard.id);
            gGame.markedCount++;
            gGame.shownCount++;
            console.log('shownCount', gGame.shownCount);
            gElCountMine.innerText = gGame.markedCount;
            return;
        }
        else if (elBoard.isShown) return;
        else {
            renderCell(elBoard.id, FLAG)
            gGame.markedCount--;
            gGame.shownCount--;
            gElCountMine.innerText = gGame.markedCount;
            if (elBoard.isMine = true) {
                elBoard.isMarked = true;
            }
        }
        checkVictory();
    }
    return;
}


// when clicked reveals the cell
function cellClicked(elCell, i, j) {
    if (gIsStartTimer) {
        startTime();
        gIsStartTimer = false;
    }
    if (gFirstClick) {
        gNextId = 0;
        gFirstClick = false;
        gBoards = buildBoard(i, j);
        if (gBoards[i][j].minesAroundCount === 0) {
            renderEmptyCell(gBoards[i][j].id);
            revealNegs(gBoards, { i, j });
            return;
        }
        else {
            renderCell(gBoards[i][j].id, gBoards[i][j].minesAroundCount);
            return;
        }
    }
    if (!gGame.isOn) return;
    if (elCell.innerText === FLAG) return;
    if (gBoards[i][j].isShown) return;
    //   if (gHintClick) {
    //     revealNegs(gBoards, { i, j });
    //     timeHint = setInterval(coverNegs(gBoards, { i, j }), 10000);
    //     console.log(timeHint);
    //     gHintClick = !gHintClick;
    //     if (gHintClick === 2) {
    //         var elclues = document.querySelector('.clues');
    //         elclues.innerText = CLUE + CLUE;
    //     } if (gHintClick === 1) {
    //         var elclues = document.querySelector('.clues');
    //         elclues.innerText = CLUE;
    //     } else {
    //         var elclues = document.querySelector('.clues');
    //         elclues.innerText = '';
    //     }

    // }


    if (gBoards[i][j].isMine && gHeart >= 0) {
        console.log('gHeart', gHeart);
        gGame.markedCount--;
        gElCountMine.innerText = gGame.markedCount;
        gHeart--;
        if (gHeart === 2) {
            var elHeart = document.querySelector('.lifes');
            elHeart.innerText = HEART + HEART;
            alert(MINE);
            gGame.shownCount++;

        }
        else if (gHeart === 1) {
            var elHeart = document.querySelector('.lifes');
            elHeart.innerText = HEART;
            alert(MINE);
            gGame.shownCount++;

        }
        else if (gHeart === 0) {
            var elHeart = document.querySelector('.lifes');
            elHeart.innerText = 0;
            alert(MINE);
            gGame.shownCount++;
        }
        else {
            var elHeart = document.querySelector('.lifes');
            elHeart.innerText = LOSEHE;
            alert(MINE);
            gGame.shownCount++;
            gameOver(gBoardMine);
        }
    }
    else if (gBoards[i][j].isMine) {
        renderCell(gBoards[i][j].id, MINE);
        gBoards[i][j].isShown = true;
        gGame.shownCount--;
        console.log('shownCount', gGame.shownCount);
        gameOver(gBoardMine);
    }
    else if (gBoards[i][j].minesAroundCount === 0) {
        renderEmptyCell(gBoards[i][j].id);
        revealNegs(gBoards, { i, j });
        gBoards[i][j].isShown = true;
        checkVictory();
        return;
    }
    else {
        renderCell(gBoards[i][j].id, gBoards[i][j].minesAroundCount);
        gBoards[i][j].isShown = true;
        checkVictory();
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
    gGame.shownCount--;
    console.log('shownCount', gGame.shownCount);
    var elTd = document.getElementById(id);
    elTd.innerText = value;
    elTd.style.backgroundColor = 'rgb(151, 146, 146)';
    if (value === 1) {
        elTd.style.color = 'blue';
    }
    else if (value === 2) {
        elTd.style.color = 'green';
    }
    else if (value === 3) {
        elTd.style.color = 'red';
    }
    else {
        elTd.style.color = 'rgb(38, 38, 99)';
    }
    checkVictory();
}

function renderEmptyCell(id) {
    gGame.shownCount--;
    console.log('shownCount', gGame.shownCount);
    var elTd = document.getElementById(id);
    elTd.style.backgroundColor = 'rgb(151, 146, 146)';
    elTd.innerText = '';
    checkVictory();
}

function renderEmptyCellHint(id) {
    gGame.shownCount--;
    console.log('shownCount', gGame.shownCount);
    var elTd = document.getElementById(id);
    elTd.style.backgroundColor = 'rgb(151, 146, 146)';
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
                    board[i][j].isShown = true;
                    renderEmptyCell(board[i][j].id);
                }
                else {
                    board[i][j].isShown = true;
                    renderCell(board[i][j].id, board[i][j].minesAroundCount);
                }
            }
        }
    }
    checkVictory();
    return;
}

function coverNegs(board, pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === pos.i && j === pos.j) continue;
            if (board[i][j].isShown) {
                console.log(!board[i][j].isShown);
                renderEmptyCellHint(board[i][j].id);
            }
        }
    }
    clearInterval(timeHint);
}



//count mines arount cell
function countMinesNegs(board, pos) {
    // console.log('board, pos', board, pos);
    var mineCounter = 0;
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue;
            if (i === pos.i && j === pos.j) continue;
            // console.log('board[i][j].isMine', board[i][j].isMine);
            if (board[i][j].isMine) {
                mineCounter++;
            }
            else continue;
        }
    }
    return mineCounter;
}

//set minesAroundCount value
function setMinesNegsCount(boardMine) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var mineCount = countMinesNegs(boardMine, { i, j });
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
    var elCell;
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (!gBoards[i][j].isShown) {
                if (gBoards[i][j].isMarked) {
                    elCell = document.getElementById(gBoards[i][j].id);
                    elCell.innerText = MINE_R;
                }
                else if (gBoards[i][j].isMine) {
                    elCell = document.getElementById(gBoards[i][j].id);
                    elCell.innerText = MINE;
                }
                else {
                    elCell = document.getElementById(gBoards[i][j].id);
                    elCell.innerText = gBoards[i][j].minesAroundCount;
                }
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


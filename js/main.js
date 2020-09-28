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
var VICTORY = '🎉';
var HINT = '💡';
var HINTuse = '✳';
var gBoards = [];
var gNextId = 0;
var gTime;
var gElCountMine = 0;
var gHeart = 1;
var gIsStartTimer;
var gHintClick = false;
var gCountHint = 1;
var gFirstClick;
var gBoardMine = [];
var gSafe = 1;
var gReveal = [];
var gMarkedMineFlag = 0;
var revealEmptyCell = [{
    locI: 0,
    locJ: 0
}];


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
function initGame(start) {
    gMarkedMineFlag = 0;
    if (start && gLevel.SIZE === 4) {
        gSafe = 1;
        gHeart = 1;
        gCountHint = 1;
        gLevel.MINES = 2;
    }
    else {
        gSafe = 3;
        gHeart = 3;
        gCountHint = 3;
    }
    var elHintBack = document.getElementById('cluePic');
    elHintBack.style.background = 'red';
    var elSafeBack = document.getElementById('safePic');
    elSafeBack.style.background = 'red';
    gGame.shownCount = gLevel.SIZE ** 2;
    console.log('gGame.shownCount', gGame.shownCount);
    gBoardMine = [];
    gFirstClick = true;
    stopTimer();
    gElCountMine = document.querySelector('.timer');
    gElCountMine.innerText = '00:00';
    var elStart = document.querySelector('.play-btn');
    elStart.innerText = START;
    gNextId = 0;
    gGame.isOn = true;
    gGame.markedCount = gLevel.MINES;
    gElCountMine = document.querySelector('.gCurrNumber');
    gElCountMine.innerText = gLevel.MINES;
    var elHeart = document.querySelector('.lifes');
    var elHint = document.querySelector('.hints');
    var elSafe = document.querySelector('.safeClick');
    if (gHeart === 1) { elHeart.innerText = HEART; }
    else { elHeart.innerText = HEART + HEART + HEART; }
    if (gCountHint === 1) { elHint.innerText = HINT; }
    else { elHint.innerText = HINT + HINT + HINT; }
    if (gSafe === 1) { elSafe.innerText = '1'; }
    else { elSafe.innerText = '3'; }
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
    console.log('gGame.markedCount', gGame.markedCount, '\ngGame.shownCount', gGame.shownCount);
    if (gFirstClick === false && gHintClick === false) {
        if (gGame.markedCount === 0 && gGame.shownCount <= 0 && gMarkedMineFlag === gLevel.MINES) {
            console.log('gMarkedMineFlag', gMarkedMineFlag, 'gGame.shownCount', gGame.shownCount);
            stopTimer();
            console.log('win');
            var elBtn = document.querySelector('.play-btn');
            elBtn.innerText = VICTORY;
            revealCells(gBoardMine);
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
            gCountHint = 1
            gSafe = 1;
            initGame(true);
            break;
        case 'Hard':
            gLevel.SIZE = 8,
                gLevel.MINES = 12
            gHeart = 3
            gCountHint = 3
            gSafe = 3;
            initGame(false);
            break;
        case 'Extreme!':
            gLevel.SIZE = 12,
                gLevel.MINES = 30
            gHeart = 3
            gCountHint = 3
            gSafe = 3;
            initGame(false);
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

//Builds board with mines
function buildBoard(boards, clickedI, clickedJ) {
    var countMine = gLevel.MINES;
    var mineLoc = [{}];
    var mineLocs = {
        mineLoc: [{
            locI: clickedI, locJ: clickedJ
        }
        ],
    };
    var count;
    while (countMine > 0) {
        count = 0;
        var i = randIdxMine();
        var j = randIdxMine();
        mineLoc.locI = i;
        mineLoc.locJ = j;
        mineLocs.mineLoc.push({ locI: i, locJ: j });
        for (var x = 0; x < mineLocs.mineLoc.length; x++) {
            if (i === mineLocs.mineLoc[x].locI && j === mineLocs.mineLoc[x].locJ) {
                count++;
                continue;
            }
            else if (x === mineLocs.mineLoc.length - 2 && count === 0) {
                boards[i][j].isMine = true;
                gBoardMine.push(boards[i][j]);
                countMine--;

            }
        }
    }
    // console.log('mineLocs', mineLocs);
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
    console.log('elBoard', elBoard);
    // if (gIsStartTimer) {
    //     startTime();
    //     gIsStartTimer = !gIsStartTimer;
    // }
    if (ev.button === 2) {
        if (elCell.innerText === FLAG) {
            renderEmptyCellHint(elCell.id);
            gGame.markedCount++;
            gElCountMine.innerText = gGame.markedCount;
            elBoard.isShown = false;
            elBoard.isMarked = false;
            if (elBoard.isMine) {
                gMarkedMineFlag--;
            }
        }
        else if (elBoard.isShown) return;
        else {
            renderCell(elBoard.id, FLAG);
            gGame.markedCount--;
            gElCountMine.innerText = gGame.markedCount;
            elBoard.isShown = true;
            console.log('elBoard.isMine', elBoard.isMine);
            if (elBoard.isMine) {
                elBoard.isMarked =
                    console.log('22222'); true;
                gMarkedMineFlag++;
                console.log('markedMineFlag', gMarkedMineFlag);
                // console.log('gGame.markedCount', gGame.markedCount, '\ngGame.shownCount', gGame.shownCount);
                checkVictory();
            }
        }
    }
    console.log('markedMineFlag', gMarkedMineFlag);
    console.log('gGame.markedCount', gGame.markedCount, '\ngGame.shownCount', gGame.shownCount);
    return;
}

// when clicked reveals the cell
function cellClicked(elCell, i, j) {
    if (gIsStartTimer) {
        startTime();
        gIsStartTimer = false;
    }
    if (gFirstClick) {
        var elHintBack = document.getElementById('cluePic');
        elHintBack.style.background = 'green';
        var elSafeBack = document.getElementById('safePic');
        elSafeBack.style.background = 'green';
        gNextId = 0;
        gFirstClick = false;
        gBoards = buildBoard(gBoards, i, j);
        if (gBoards[i][j].minesAroundCount === 0) {
            gBoards[i][j].isShown = true;
            renderEmptyCell(gBoards[i][j].id);
            revealNegs(gBoards, { i, j });
            return;
        }
        else {
            gBoards[i][j].isShown = true;
            renderCell(gBoards[i][j].id, gBoards[i][j].minesAroundCount);
            return;
        }
    }
    if (!gGame.isOn) return;
    if (elCell.innerText === FLAG) return;
    if (gBoards[i][j].isShown) return;
    if (gHintClick && gBoards[i][j].isShown === false) {
        if (gBoards[i][j].isMine) {
            renderCell(gBoards[i][j].id, MINE);
        }
        else if (gBoards[i][j].minesAroundCount === 0) {
            renderEmptyCell(gBoards[i][j].id);
        }
        else { renderCell(gBoards[i][j].id, gBoards[i][j].minesAroundCount); }
        var gReveals = revealNegs(gBoards, { i, j });
        setTimeout(function () {
            renderEmptyCellHint(gBoards[i][j].id);
            gBoards[i][j].isShown = false;
            for (var x = 0; x < gReveals.length; x++) {
                if (gReveals[x].isShown) {
                    renderEmptyCellHint(gReveals[x].id);
                    gReveals[x].isShown = false;

                }
            }
        }, 1000);
        setTimeout(function () { gHintClick = false; }, 1000);
        if (gCountHint === 2) {
            var elclues = document.querySelector('.hints');
            elclues.innerText = HINT + HINT;
        } else if (gCountHint === 1) {
            var elclues = document.querySelector('.hints');
            elclues.innerText = HINT;
        } else {
            var elclues = document.querySelector('.hints');
            elclues.innerText = '0';
        }
        return;
    }
    if (gBoards[i][j].isMine && gHeart >= 0) {
        gElCountMine.innerText = gGame.markedCount;
        gHeart--;
        if (gHeart === 2) {
            var elHeart = document.querySelector('.lifes');
            elHeart.innerText = HEART + HEART;
            renderCell(gBoards[i][j].id, MINE);
            setTimeout(function () {
                renderEmptyCellHint(gBoards[i][j].id);
            }, 1000)
        }
        else if (gHeart === 1) {
            var elHeart = document.querySelector('.lifes');
            elHeart.innerText = HEART;
            renderCell(gBoards[i][j].id, MINE)
            setTimeout(function () {
                renderEmptyCellHint(gBoards[i][j].id);
            }, 1000)
        }
        else if (gHeart === 0) {
            var elHeart = document.querySelector('.lifes');
            elHeart.innerText = 0;
            renderCell(gBoards[i][j].id, MINE)
            setTimeout(function () {
                renderEmptyCellHint(gBoards[i][j].id);
            }, 1000)
        }
        else {
            var elHeart = document.querySelector('.lifes');
            elHeart.innerText = LOSEHE;
            gameOver(gBoardMine);
        }
        return;
    }
    else if (gBoards[i][j].isMine) {
        renderCell(gBoards[i][j].id, MINE);
        gBoards[i][j].isShown = true;
        gameOver(gBoardMine);
    }
    else if (gBoards[i][j].minesAroundCount === 0) {
        renderEmptyCell(gBoards[i][j].id);
        revealNegs(gBoards, { i, j });
        gBoards[i][j].isShown = true;
        return;
    }
    else {
        renderCell(gBoards[i][j].id, gBoards[i][j].minesAroundCount);
        gBoards[i][j].isShown = true;
        console.log('gGame.markedCount', gGame.markedCount, '\ngGame.shownCount', gGame.shownCount);
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
    console.log('gGame.shownCount', gGame.shownCount);
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
}

function renderEmptyCell(id) {
    gGame.shownCount--;
    var elTd = document.getElementById(id);
    elTd.style.backgroundColor = 'rgb(151, 146, 146)';
    elTd.innerText = '';
    console.log('gGame.markedCount', gGame.markedCount, '\ngGame.shownCount', gGame.shownCount);
    checkVictory();

}

function renderEmptyCellHint(id) {
    gGame.shownCount++;
    var elTd = document.getElementById(id);
    elTd.style.backgroundColor = 'rgb(68, 66, 66)';
    elTd.innerText = '';
}


function revealNegs(board, pos) {
    gReveal = [];
    // console.log('board, pos without first cell', board, pos);
    //    var revealEmptyCell = [{}];
    revealEmptyCell.locI = pos.i;
    revealEmptyCell.locJ = pos.j;
    console.log('locI, locJ', revealEmptyCell.locI, revealEmptyCell.locJ);
    // console.log('revealEmptyCells without first cell', revealEmptyCells);
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === pos.i && j === pos.j) continue;
            if (board[i][j].isMine === false && board[i][j].isShown === false) {
                if (board[i][j].minesAroundCount === 0) {
                    board[i][j].isShown = true;
                    renderEmptyCell(board[i][j].id);
                    console.log('i, j', i, j);
                    gReveal.push(board[i][j]);
                    var tempCell = board[i][j];
                    var q = i;
                    var p = j;
                    // revealEmptyCell.locI = i;
                    // revealEmptyCell.locJ = j;
                    // revealEmptyCells.revealEmptyCell.push({ locI: i, locJ: j });
                    revealEmptyCell.push({ locI: i, locJ: j });
                    console.log('revealEmptyCell', revealEmptyCell);
                }
                else {
                    board[i][j].isShown = true;
                    renderCell(board[i][j].id, board[i][j].minesAroundCount);
                    gReveal.push(board[i][j]);
                }
            }
            // else {
            //     continue;
            // }
        }
    }
    console.log('tempCell', tempCell);
    if (revealEmptyCell.length === 0 && gHintClick === false && tempCell.minesAroundCount === 0) {
        revealNegs(gBoards, { q, p });
        console.log('q, p', q, p);

        revealEmptyCell.locI = 0;
        revealEmptyCell.locJ = 0;
    }


    // console.log('revealEmptyCells without first cell', revealEmptyCells);
    // console.log('locI, locJ', revealEmptyCells.revealEmptyCell[0].locI, revealEmptyCells.revealEmptyCell[0].locJ);
    else if (revealEmptyCell.length > 0 && gHintClick === false) {
        revealEmptyCell.splice(0, 1);
        // console.log('locI, locJ', revealEmptyCells.revealEmptyCell[0].locI, revealEmptyCells.revealEmptyCell[0].locJ);
        console.log('revealEmptyCells without first cell', revealEmptyCell);
        i = revealEmptyCell[0].locI;
        j = revealEmptyCell[0].locJ;
        revealNegs(gBoards, { i, j });
        console.log('gBoards, { i, j }', gBoards, { i, j });
        // gGame.shownCount++;
        // revealEmptyCells.revealEmptyCell.splice(0);
    }
    // else if (revealEmptyCell.length === 0 && gHintClick === false && tempCell.minesAroundCount === 0) {
    //     revealNegs(gBoards, { q, p });
    //     console.log('q, p', q, p);

    //     revealEmptyCell.locI = 0;
    //     revealEmptyCell.locJ = 0;
    // }
    else if (revealEmptyCell.length === 0) {
        revealEmptyCell.locI = 0;
        revealEmptyCell.locJ = 0;
    }
    console.log('gGame.markedCount', gGame.markedCount, '\ngGame.shownCount', gGame.shownCount);
    checkVictory();
    return gReveal;
}

function safe(elCell) {
    if (gFirstClick) return;
    if (gSafe === 0) return;
    elCell.innerText = --gSafe;
    var i = randIdxMine();
    var j = randIdxMine();
    if (gBoards[i][j].isMine === false && gBoards[i][j].isShown === false) {
        if (gBoards[i][j].minesAroundCount === 0) {
            renderEmptyCell(gBoards[i][j].id);
        }
        else {
            renderCell(gBoards[i][j].id, gBoards[i][j].minesAroundCount);
        }
        setTimeout(function () {
            // gGame.shownCount++;
            // var elTd = document.getElementById(gBoards[i][j].id);
            renderEmptyCellHint(gBoards[i][j].id)
            // elTd.style.backgroundColor = 'rgb(68, 66, 66)';
            // elTd.innerText = '';
        }, 1000)
    }
    else if (gBoards[i][j].isMine || gBoards[i][j].isShown) {
        gSafe++;
        safe(elCell);
    }
}


//count mines arount cell
function countMinesNegs(board, pos) {
    var mineCounter = 0;
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue;
            if (i === pos.i && j === pos.j) continue;
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
    if (gHintClick === false && gFirstClick) {
        return;
    }
    else if (gCountHint === 0) {
        return;
    }
    else {
        gCountHint--;
        elHint.innerText = HINTuse;
        gHintClick = true;
    }
}

//at victory end of the game
function revealCells(board) {
    for (var i = 0; i < board.length; i++) {
        renderCell(board[i].id, MINE_R);
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
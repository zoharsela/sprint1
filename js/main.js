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
var VICTORY = '🤩';
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
    if (gHeart === 1) { elHeart.innerText = HEART; }
    else { elHeart.innerText = HEART + HEART + HEART; }
    if (gCountHint === 1) { elHint.innerText = HINT; }
    else { elHint.innerText = HINT + HINT + HINT; }
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
        if (gGame.markedCount === 0 && gGame.shownCount === 0) {
            console.log('gGame.markedCount', gGame.markedCount, 'gGame.shownCount', gGame.shownCount);
            stopTimer();
            console.log('win');
            var elBtn = document.querySelector('.play-btn');
            elBtn.innerText = VICTORY;
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
            gCountHint = 1
            initGame();
            break;
        case 'Hard':
            gLevel.SIZE = 8,
                gLevel.MINES = 12
            gHeart = 3
            gCountHint = 3
            initGame();
            break;
        case 'Extreme!':
            gLevel.SIZE = 12,
                gLevel.MINES = 30
            gHeart = 3
            gCountHint = 3
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
function buildBoard(boards, clickedI, clickedJ) {
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
        // console.log('countMine', countMine);
        count = 0;
        // console.log('count', count);
        var i = randIdxMine();
        var j = randIdxMine();
        // console.log('i, j', i, j);
        mineLoc.locI = i;
        mineLoc.locJ = j;
        mineLocs.mineLoc.push({ locI: i, locJ: j });
        // console.log('mineLocs.mineLoc.length', mineLocs.mineLoc.length);

        for (var x = 0; x < mineLocs.mineLoc.length; x++) {

            // console.log(mineLocs.mineLoc[x].locI, mineLocs.mineLoc[x].locJ);
            if (i === mineLocs.mineLoc[x].locI && j === mineLocs.mineLoc[x].locJ) {
                count++;
                // console.log('count', count);
                // console.log('10000000000000');
                continue;

                // console.log('boards[i][j].isMine', i, j);
            }

            else if (x === mineLocs.mineLoc.length - 2 && count === 0) {
                boards[i][j].isMine = true;
                gBoardMine.push(boards[i][j]);
                // console.log('gBoardMine', gBoardMine);
                countMine--;

            }
            // else { countMine--; }
            // console.log('x, mineLocs.mineLoc.length, count', x, mineLocs.mineLoc.length, count);
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
            elCell.innerText = '';
            elCell.style.backgroundColor = 'rgb(68, 66, 66)';
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
            console.log('shownCount', gGame.shownCount);
            console.log('gGame.markedCount', gGame.markedCount);
            gElCountMine.innerText = gGame.markedCount;
            if (elBoard.isMine) {
                elBoard.isMarked = true;
            }
        }
    }
    checkVictory();
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
        gBoards = buildBoard(gBoards, i, j);
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
      if (gHintClick && !gBoards[i][j].isShown) {
        gHintClick = false;
        revealNegs(gBoards, { i, j });
        setTimeout(function(){
            renderEmptyCellHint(gBoards[i][j].id);
            gBoards[i][j].isShown = false;
                for (var x = i - 1; x <= i + 1; x++) {
                    if (x < 0 || x >= gBoards.length) continue;
                    for (var y = j - 1; y <= j + 1; y++) {
                        if (y < 0 || y >= gBoards[i].length) continue;
                        if (y === i && x === j) continue;
                        if (gBoards[x][y].isShown) {
                            gBoards[x][y].isShown = false;
                            renderEmptyCellHint(gBoards[x][y].id)
        }}}}, 1000);
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

    }


    if (gBoards[i][j].isMine && gHeart >= 0) {
        console.log('gHeart', gHeart);
        gElCountMine.innerText = gGame.markedCount;
        gHeart--;
        if (gHeart === 2) {
            var elHeart = document.querySelector('.lifes');
            elHeart.innerText = HEART + HEART;
            renderCell(gBoards[i][j].id, MINE)
            setTimeout(function(){
                gGame.shownCount++;
                elCell.style.backgroundColor = 'rgb(68, 66, 66)';
                elCell.innerText = '';
            }, 1000)
            
            // alert(MINE);
        }
        else if (gHeart === 1) {
            var elHeart = document.querySelector('.lifes');
            elHeart.innerText = HEART;
            renderCell(gBoards[i][j].id, MINE)
            setTimeout(function(){
                gGame.shownCount++;
                elCell.style.backgroundColor = 'rgb(68, 66, 66)';
                elCell.innerText = '';
            }, 1000)
        }
        else if (gHeart === 0) {
            var elHeart = document.querySelector('.lifes');
            elHeart.innerText = 0;
            renderCell(gBoards[i][j].id, MINE)
            setTimeout(function(){
                gGame.shownCount++;
                elCell.style.backgroundColor = 'rgb(68, 66, 66)';
                elCell.innerText = '';
            }, 1000)
        }
        else {
            var elHeart = document.querySelector('.lifes');
            elHeart.innerText = LOSEHE;
            gameOver(gBoardMine);
        }
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
    var elTd = document.getElementById(id);
    elTd.style.backgroundColor = 'rgb(151, 146, 146)';
    elTd.innerText = '';
    checkVictory();
}

function renderEmptyCellHint(id) {
    gGame.shownCount++;
    var elTd = document.getElementById(id);
    elTd.style.backgroundColor = 'rgb(68, 66, 66)';
    elTd.innerText = '';
}

function revealNegs(board, pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === pos.i && j === pos.j) continue;
            if (!board[i][j].isMine && board[i][j].isShown === false) {
                if (board[i][j].minesAroundCount === 0) {
                    board[i][j].isShown = true;
                    renderEmptyCell(board[i][j].id);
                }
                else{
                    board[i][j].isShown = true;
                    renderCell(board[i][j].id, board[i][j].minesAroundCount);
                }
            }
        }
    }
    checkVictory();
    return;
}

//hint
// function coverNegs(board, pos) {
//     renderEmptyCellHint(board[pos.i][pos.j].id);
//     for (var i = pos.i - 1; i <= pos.i + 1; i++) {
//         if (i < 0 || i >= board.length) continue;
//         for (var j = pos.j - 1; j <= pos.j + 1; j++) {
//             if (j < 0 || j >= board[i].length) continue;
//             if (i === pos.i && j === pos.j) continue;
//             if (board[i][j].isShown) {
//                 board[i][j].isShown = false;
//                 renderEmptyCellHint(board[i][j].id);
//             }
//         }
//     }
//     // clearInterval(timeHint);
// }



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
    if(!gHintClick && gFirstClick){
        return;
    }
    else if(gCountHint === 0){
        return;
    }
    else{gCountHint--;
    elHint.innerText = HINTuse;
    gHintClick = true;}
}

//at the end of the game
function revealCells(gBoards) {
    // var elCell;
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (!gBoards[i][j].isShown) {
                if (gBoards[i][j].isMarked) {
                    renderCell(gBoards[i][j].id, MINE_R)
                    // elCell = document.getElementById(gBoards[i][j].id);
                    // elCell.innerText = MINE_R;
                }
                else if (gBoards[i][j].isMine) {
                    renderCell(gBoards[i][j].id, MINE)
                    // elCell = document.getElementById(gBoards[i][j].id);
                    // elCell.innerText = MINE;
                }
                else {
                    renderEmptyCell(gBoards[i][j].id)
                    // elCell = document.getElementById(gBoards[i][j].id);
                    // elCell.innerText = gBoards[i][j].minesAroundCount;
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


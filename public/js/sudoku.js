// __________________ Sudoku __________________

var size = 9;
var board = getBoardMatrix(size);
board = generateStartingBoard(board,10);

solveSudoku(0,0);

function getBoardMatrix(size){
    var board = new Array(size);
    for(var i = 0; i< size; i++) {
        board[i] = new Array(size);
    }
    for (var row = 0 ; row < size; row++){
        for (var col = 0 ; col < size; col++){
            board[row][col] = {
                number: undefined,
                start: false
            };
            console.log(board[row][col]);
        }
    }
    return board;
}

function generateStartingBoard(board, fillNumber){
    var size = board.length;
    console.log(board.length);

    for(var i = 0 ; i < fillNumber; i++){
        var tries = 0;
        do{
            var row = Math.round(Math.random()*(size-1));
            var col = Math.round(Math.random()*(size-1));
        } while(board[row][col].number != undefined);

        do{
            var number = Math.round(Math.random()*(size-1)) + 1;
            tries++;
            if(tries == 100){
                number = '-';
                console.log('a' + ' ' + row + ' ' + col);
                break;
            }
        } while(checkRowCollision(row,number) || checkColCollision(col,number) || checkGroupCollision(row,col,number));

        board[row][col] = {
            'number' : number,
            'start': true
        };
    }
    return board;
}


function solveSudoku(row,col){
    do{
        var nextRow = getNextRow(row,col);
        var nextCol = getNextCol(col);
    }while(board[nextRow][nextCol].start == true);

    for(var nr = 1; nr <= 9; nr++){
        var OK = Boolean(!checkColCollision(col,nr) && !checkRowCollision(row,nr) && !checkGroupCollision(row,col,nr));
        console.log(row + ' ' + col + ' ' + nr + ' ' + OK);
        if(OK){
            board[row][col].number = nr;
            var foundSolution = solveSudoku(nextRow,nextCol);
            if(foundSolution){
                return true;
            }
            if(nextCol == 8 && nextCol == 8){
                return true;
            }
        } else{
            console.log(row + ' ' + col + ' ' + nr + ' ' + OK);
        }
    }
    board[row][col] = '';
    return false;
}


function checkRowCollision(row,number){
    for(var i = 0; i < 8; i++){
        if(board[row][i].number == number) {
            return true;
        }
    }
    return false;
}

function checkColCollision(col,number){
    for(var i = 0; i < 8; i++){
        if(board[i][col].number == number) {
            return true;
        }
    }
    return false;
}

function checkGroupCollision(row,col,number){
    var colFrom = Math.floor(col/3) * 3;
    var rowFrom = Math.floor(row/3) * 3;
    var colTo = colFrom + 2;
    var rowTo = rowFrom + 2;

    for(var i = rowFrom ; i <= rowTo; i++){
        for(var j = colFrom ; j <= colTo; j++){
            if(board[i][j].number == number){
                return true;
            }
        }
    }
    return false;

}

function generateFullStartingBoard(board){
    for(var i = 0; i < board.length; i++){
        for(var j = 0; j < board[i].length; j++){
            board[i][j] = Math.round(Math.random()*8) + 1;
        }
    }
    return board;
}


/*
 procedure bt(c)
     if reject(P,c) then return
     if accept(P,c) then output(P,c)
     s ← first(P,c)
     while s ≠ Λ do
         bt(s)
         s ← next(P,s)
*/

function getNextRow(row,col){
    if(col < 8){
        return row;
    } else{
        if(row < 8){
            return row + 1;
        }
    }
}

function getNextCol(col){
    if(col < 8){
        return col + 1;
    } else{
        return 0;
    }
}
// __________________ Vue Components __________________

var Table = {
    template : "#table-template",
    props: ["header","rows", "showIndex"]
};

var Panel = {
    template: '#panel-template',
    props: ["title","subtitle"]
};

// __________________ Vue JS __________________

var vue = new Vue({
    el: '#app',

    data:{
        size:size,
        board:board
    },
    components:{
        'table-component': Table,
        'panel-component': Panel
    }
});

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}
//ctt-iv-0.0.0.1
//click tack toe -- script.ts
//transpile command:
//npx tsc --outFile dist/script-transpiled.js src/script.ts
var boardContainer = document.createElement('div');
boardContainer.className = 'board-container';
var buttons = [];
var activePlayer = "x";
var victor = "";
var boardDim = 3;
var boardSize = boardDim * boardDim;
var emptyTiles = boardSize;
var statusOfDisableExcessNoticesButton = "Disabled";
function displayActivePlayer() {
    document.getElementById("activePlayerHTML").innerHTML = activePlayer;
}
displayActivePlayer();
function toggleActivePlayer() {
    if (activePlayer == "x") {
        activePlayer = "o";
    }
    else {
        activePlayer = "x";
    }
    displayActivePlayer();
}
var rows = [];
for (var r = 0; r < boardDim; r++) {
    var row = document.createElement("div");
    row.className = 'board-row';
    var _loop_1 = function (c) {
        var i = r * boardDim + c;
        //now i is counting all numbers
        //create buttons
        var button = document.createElement('button');
        button.type = 'button';
        button.id = "b".concat(i);
        button.innerHTML = "<img id=\"b".concat(i, "i\" src=\"the_blank.png\" alt=\"alt text\">");
        //adding listener to button
        button.addEventListener('click', function () {
            console.log("Button ".concat(i, " was clicked!"));
            var image = document.getElementById("b".concat(i, "i"));
            //TODO: the / works in linux.  Test if it breaks in windows.
            if (image.src.split('/').pop() == "the_blank.png") {
                image.src = "the_".concat(activePlayer, ".png");
                toggleActivePlayer();
                emptyTiles -= 1;
                if (emptyTiles == 0) {
                    alert("GAME OVER");
                }
                else {
                    if (statusOfDisableExcessNoticesButton == "Enabled") {
                        alert("Next Player");
                        alert(emptyTiles);
                    }
                }
                checkIfVictorious();
                console.log(activePlayer); //at this point the activePlayer is actually the nextToPlay.
            }
        });
        row.appendChild(button);
    };
    //each row has buttons
    for (var c = 1; c <= boardDim; c++) {
        _loop_1(c);
    }
    rows.push(row);
}
//add the rows to the boardContainer and place <br> between them.
for (var i = 0; i < rows.length; i++) {
    boardContainer.appendChild(rows[i]);
    if (i < rows.length - 1) {
        boardContainer.appendChild(document.createElement('br'));
        boardContainer.appendChild(document.createElement('br'));
    }
}
document.body.appendChild(boardContainer);
document.getElementById("valueOfDisableExcessNoticesButtonHTML").innerHTML = statusOfDisableExcessNoticesButton;
function toggleExcessNotices() {
    if (statusOfDisableExcessNoticesButton == "Enabled") {
        statusOfDisableExcessNoticesButton = "Disabled";
        document.getElementById("valueOfDisableExcessNoticesButtonHTML").innerHTML = statusOfDisableExcessNoticesButton;
    }
    else {
        statusOfDisableExcessNoticesButton = "Enabled";
        document.getElementById("valueOfDisableExcessNoticesButtonHTML").innerHTML = statusOfDisableExcessNoticesButton;
    }
}
// Add disable excess notices event listener.
var disableExcessNoticesButton = document.getElementById("disableExcessNoticesButtonHTML");
disableExcessNoticesButton.addEventListener("click", function () {
    toggleExcessNotices();
});
function oppositePlayer() {
    if (activePlayer == "x") {
        return "o";
    }
    else {
        return "x";
    }
}
function checkArrays(arr1, arr2) {
    // console.log(`Array 1 contents: ${arr1}`)
    // console.log(`Array 2 contents: ${arr2}`)
    return arr1.every(function (val) { return arr2.includes(val); });
}
function triggerVictory() {
    console.log("I AM VICTORIOUS.  YEAH");
    alert("Player ".concat(oppositePlayer(), " Won!  Refresh the page to play again!"));
}
//here for reference only... not used. using generalized arrayLeadsToVictory instead.
function hardCodedArrayLeadsToVictory(theArray) {
    var victorious = false;
    var victoriousnessTests = [];
    console.log("This is the current array contents: ".concat(theArray));
    victoriousnessTests.push(checkArrays([1, 2, 3], theArray));
    victoriousnessTests.push(checkArrays([4, 5, 6], theArray));
    victoriousnessTests.push(checkArrays([7, 8, 9], theArray));
    victoriousnessTests.push(checkArrays([1, 4, 7], theArray));
    victoriousnessTests.push(checkArrays([2, 5, 8], theArray));
    victoriousnessTests.push(checkArrays([3, 6, 9], theArray));
    victoriousnessTests.push(checkArrays([1, 5.9], theArray));
    victoriousnessTests.push(checkArrays([3, 5, 7], theArray));
    victorious = checkArrays([true], victoriousnessTests);
    if (victorious) {
        triggerVictory();
        console.log(boardDim);
    }
}
function arrayLeadsToVictory(theArray) {
    var victorious = false;
    var victoriousnessTests = [];
    console.log("This is the current array contents: ".concat(theArray));
    for (var r = 0; r < boardDim; r++) {
        var currentAdditionHoriz = [];
        var currentAdditionVerti = [];
        var currentAdditionDiagTLBR = [];
        var currentAdditionDiagTRBL = [];
        for (var i = 0; i < boardDim; i++) {
            currentAdditionHoriz.push(r * boardDim + i + 1);
            currentAdditionVerti.push(r + i * boardDim + 1); //0+0+1   0+3+1   0+6+1...  1+0+1   1+3+1   1+6+1...etc      
        }
        console.log("Adding: ".concat(currentAdditionHoriz));
        console.log("Adding: ".concat(currentAdditionVerti));
        victoriousnessTests.push(checkArrays(currentAdditionHoriz, theArray));
        victoriousnessTests.push(checkArrays(currentAdditionVerti, theArray));
    }
    //diagonal victory checks
    var dNumsTL = [];
    var dNumsTR = [];
    for (var i = 0; i < boardDim; i++) {
        var counterTL = boardDim + 1;
        var startTL = 1;
        var counterTR = boardDim - 1;
        var startTR = boardDim;
        dNumsTL.push(i * counterTL + startTL);
        dNumsTR.push(i * counterTR + startTR);
    }
    console.log("Adding: ".concat(dNumsTL));
    console.log("Adding: ".concat(dNumsTR));
    victoriousnessTests.push(checkArrays(dNumsTR, theArray));
    victoriousnessTests.push(checkArrays(dNumsTL, theArray));
    victorious = checkArrays([true], victoriousnessTests);
    if (victorious) {
        triggerVictory();
    }
}
function checkIfVictorious() {
    console.log("The active player is: ".concat(activePlayer));
    console.log("Checking for victory.");
    var filledTiles = [];
    for (var i = 1; i <= boardSize; i++) {
        if (document.getElementById("b".concat(i, "i")).getAttribute("src") == "the_".concat(oppositePlayer(), ".png")) {
            filledTiles.push(i);
        }
    }
    console.log("The filled tiles are: ".concat(filledTiles));
    arrayLeadsToVictory(filledTiles);
}

//ctt-iv-0.0.0.1
//click tack toe -- script.ts
//transpile command:
//npx tsc --outFile dist/script-transpiled.js src/script.ts
const boardContainer: HTMLDivElement = document.createElement('div');
boardContainer.className = 'board-container';


const buttons: HTMLButtonElement[] = [];
let activePlayer = "x"
let victor = ""
let boardDim = 3
let boardSize = boardDim * boardDim
let emptyTiles = boardSize
let statusOfDisableExcessNoticesButton = "Disabled";

function displayActivePlayer() {
  document.getElementById("activePlayerHTML").innerHTML = activePlayer;
}

displayActivePlayer()

function toggleActivePlayer() {
  if (activePlayer == "x") {
    activePlayer = "o"
  } else {
    activePlayer = "x"
  }
  displayActivePlayer()
}

const rows: HTMLDivElement[] = [];

for (let r: number = 0; r<boardDim; r++) {
  const row: HTMLDivElement = document.createElement("div");
  row.className = 'board-row';

  //each row has buttons
  for (let c: number = 1; c<=boardDim; c++) {
    let i: number = r*boardDim + c;
    //now i is counting all numbers
    //create buttons
    const button: HTMLButtonElement = document.createElement('button');
    button.type = 'button';
    button.id = `b${i}`;
    button.innerHTML = `<img id="b${i}i" src="the_blank.png" alt="alt text">`;

    //adding listener to button
    button.addEventListener('click', () => {
      console.log(`Button ${i} was clicked!`);
      const image = document.getElementById(`b${i}i`) as HTMLImageElement;
      //TODO: the / works in linux.  Test if it breaks in windows.
      if (image.src.split('/').pop() == "the_blank.png") {
        image.src = `the_${activePlayer}.png`;

        toggleActivePlayer()
        emptyTiles -= 1;
        if(emptyTiles == 0) {
          alert("GAME OVER");
        } else {
          if (statusOfDisableExcessNoticesButton == "Enabled") {
            alert("Next Player");
            alert(emptyTiles);
          }
        }
        checkIfVictorious();
        console.log(activePlayer) //at this point the activePlayer is actually the nextToPlay.
      }
    });
    row.appendChild(button);
  }
  rows.push(row);
}

//add the rows to the boardContainer and place <br> between them.
for (let i: number = 0; i<rows.length; i++) {
  boardContainer.appendChild(rows[i]);
  if (i<rows.length -1) {
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
  } else {
    statusOfDisableExcessNoticesButton = "Enabled";
    document.getElementById("valueOfDisableExcessNoticesButtonHTML").innerHTML = statusOfDisableExcessNoticesButton;
  }
}

// Add disable excess notices event listener.
const disableExcessNoticesButton = document.getElementById("disableExcessNoticesButtonHTML");
disableExcessNoticesButton.addEventListener("click", () => {
  toggleExcessNotices();
})

function oppositePlayer() {
  if (activePlayer == "x") {
    return "o";
  } else {
    return "x";
  }
}

function checkArrays(arr1: any[], arr2: any[]) {
  // console.log(`Array 1 contents: ${arr1}`)
  // console.log(`Array 2 contents: ${arr2}`)
  return arr1.every(val => arr2.includes(val));
}


function triggerVictory() {
  console.log("I AM VICTORIOUS.  YEAH");
  alert(`Player ${oppositePlayer()} Won!  Refresh the page to play again!`);
}

//here for reference only... not used. using generalized arrayLeadsToVictory instead.
function hardCodedArrayLeadsToVictory(theArray) {
  let victorious = false;
  let victoriousnessTests = [];
  console.log(`This is the current array contents: ${theArray}`)
  victoriousnessTests.push(checkArrays([1,2,3], theArray))
  victoriousnessTests.push(checkArrays([4,5,6], theArray))
  victoriousnessTests.push(checkArrays([7,8,9], theArray))

  victoriousnessTests.push(checkArrays([1,4,7], theArray))
  victoriousnessTests.push(checkArrays([2,5,8], theArray))
  victoriousnessTests.push(checkArrays([3,6,9], theArray))

  victoriousnessTests.push(checkArrays([1,5.9], theArray))
  victoriousnessTests.push(checkArrays([3,5,7], theArray))
  victorious = checkArrays([true], victoriousnessTests);
  if (victorious) {
    triggerVictory();
    console.log(boardDim);
  }
}


function arrayLeadsToVictory(theArray) {
  let victorious = false;
  let victoriousnessTests = [];
  console.log(`This is the current array contents: ${theArray}`)

  for (let r=0; r<boardDim; r++) {
    let currentAdditionHoriz = [];
    let currentAdditionVerti = [];
    let currentAdditionDiagTLBR = [];
    let currentAdditionDiagTRBL = [];
    for (let i=0; i<boardDim; i++) {
      currentAdditionHoriz.push(r*boardDim + i + 1);
      currentAdditionVerti.push(r + i*boardDim + 1);//0+0+1   0+3+1   0+6+1...  1+0+1   1+3+1   1+6+1...etc      
    }
    console.log(`Adding: ${currentAdditionHoriz}`);
    console.log(`Adding: ${currentAdditionVerti}`);
    victoriousnessTests.push(checkArrays(currentAdditionHoriz, theArray));
    victoriousnessTests.push(checkArrays(currentAdditionVerti, theArray));
  }

  //diagonal victory checks
  let dNumsTL = [];
  let dNumsTR = [];
  for (let i=0; i<boardDim; i++) {
    let counterTL = boardDim + 1;
    let startTL = 1;

    let counterTR = boardDim - 1;
    let startTR = boardDim;

    dNumsTL.push(i*counterTL+startTL);
    dNumsTR.push(i*counterTR+startTR);
  }
  console.log(`Adding: ${dNumsTL}`);
  console.log(`Adding: ${dNumsTR}`);
  victoriousnessTests.push(checkArrays(dNumsTR, theArray));
  victoriousnessTests.push(checkArrays(dNumsTL, theArray));

  victorious = checkArrays([true], victoriousnessTests);
  if (victorious) {
    triggerVictory();
  }
}

function checkIfVictorious() {
  console.log(`The active player is: ${activePlayer}`)
  console.log("Checking for victory.")
  let filledTiles = [];
  for (let i = 1; i <= boardSize; i++) {
    if (document.getElementById(`b${i}i`).getAttribute("src") == `the_${oppositePlayer()}.png`) {
      filledTiles.push(i);
    }
  }
  console.log(`The filled tiles are: ${filledTiles}`)
  arrayLeadsToVictory(filledTiles);
}

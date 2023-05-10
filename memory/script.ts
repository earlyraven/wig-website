// NOTE:
// Currently displays well only at 60% zoom level.
const playArea = document.getElementById("playArea");
const board = document.createElement("div");
board.innerHTML = "";
board.id = "board";
playArea.appendChild(board);

const MATCH_SIZE = 2;
let boardSizeX = 5;
let boardSizeY = 4;
let boardSize = boardSizeX*boardSizeY;
let matchedCards = 0;
let victorious = false;
let flippedIndexes = [];
let currentIndexes = [];
const imageFolder = "./assets/images/";

// const theNewGameImage: HTMLImageElement = document.getElementById("newGameDisplayImage") as HTMLImageElement;

// Helper functions:
function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((value, index) => value === b[index]);
}

function ternary(condition, expression1, expression2) {
  return condition ? expression1 : expression2;
}

// Assumes the number passed an int and is >= 0.
// Returns a random int from 0 (inclusive) to n (exclusive)
function randInt(n: number): number {
  return Math.floor(Math.random() * n);
}

// Used my Cards to implement matches in a memory game (where images can be different)
//This implementation allows Flippables to match w/ each other even if they're imageFront image is different.
//It does so by checking if both cards share the same tokenMatchIDs array.
interface Flippable {
  active: boolean;
  tokenID: number;
  tokenMatchIDs: number[];

  imageBack: string;
  imageFront: string;
  imageDisplayed: string;
  position: number;
  isFlipped(): boolean;
  flip(): void;
}

class Card implements Flippable {
  constructor(
    public active: boolean = true,
    public tokenID: number,
    public tokenMatchIDs: number[] = [],
    public imageBack: string,
    public imageFront: string,
    public imageDisplayed: string = "",
    public position: number = null,
  ) {
    this.imageDisplayed = this.imageBack;
    this.position = this.tokenID;
  }
  setPosition(position: number): void {
    this.position = position;
  }

  deactivate(): void {
    this.active = false;
  }

  isFlipped(): boolean {
    return this.imageDisplayed === this.imageFront;
  }

  matchesWith(card: Card): boolean {
    return arraysEqual(this.tokenMatchIDs, card.tokenMatchIDs);
  }

  logMe(): void {
    console.log("Card Info:");
    console.log(this);
  }

  matchesThese(cards: Card[]): boolean {
    for (let i=0; i<cards.length; i++) {
      if (!this.matchesWith(cards[i])) {
        return false;
      }
    }
    return true;
  }

  updateDisplay(): void {
    const imageElement = document.getElementById(`b${this.position}i`) as HTMLImageElement;
    imageElement.src = cards[this.position].imageDisplayed;
  }

  flip(): void {
    if (this.imageDisplayed === this.imageBack) {
      this.imageDisplayed = this.imageFront;
    } else {
      this.imageDisplayed = this.imageBack;
    }
  }  
}

let cards: Card[] = [];
// UPGRADE_GENERALIZE this may need to change to allow for better generalization of matches.
// if, for example there are 3 or more cards that match with each other.
for (let i: number = 0; i<boardSize; i++) {
  const n: number = i+1;
  if (i<boardSize/2) {
    cards.push(new Card(
      undefined,
      n,
      [n, n+boardSize/2],
      `${imageFolder}card_back.png`,
      `${imageFolder}${n}.png`,
      undefined,
      undefined,
      )
    )
  } else {
    cards.push(new Card(
      undefined,
      n,
      [n-boardSize/2, n],
      `${imageFolder}card_back.png`,
      `${imageFolder}k${n-boardSize/2}.png`,
      // `${imageFolder}d${n-boardSize/2}.png`,
      undefined,
      undefined,
      )
    )
  }
}

function isVictorious(): boolean {
  return matchedCards == cards.length;
}

function shuffle(cards: Card[]): Card[] {
  this.cards = cards;
  let shuffled: Card[] = [];
  while(this.cards.length > 0) {
    // Randomly select a card and add it to the shuffled deck.
    // Since splice returns an array, the spread (...) operator is used to unpack it.
    shuffled.push(...this.cards.splice(randInt(this.cards.length), 1));
  }

  // Update the reference to it's position in the button array.
  for (let i=0; i<shuffled.length; i++) {
    shuffled[i].setPosition(i);
  }
  return shuffled;
}

function updateDisplay(index: number): void {
  const imageElement = document.getElementById(`b${index}i`) as HTMLImageElement;
  imageElement.src = cards[index].imageDisplayed;
}

let atLimit = false;
let lastGroupMatched = false;

function updateNewGameButtonImage(imagePath: string): void {
  const theNewGameImage: HTMLImageElement = document.getElementById("newGameDisplayImage") as HTMLImageElement;
  theNewGameImage.src = `${imageFolder}${imagePath}`
}

function triggerNewGameButton(): void {
  console.log("NEW GAME BUTTON WAS TRIGGERED.");
  console.log("For now, refresh the page to start a new game.");
  updateNewGameButtonImage("refresh_the_page.png");
}

function triggerVictory(): void {
  console.log("YIPPY YOU WON!!!");
  updateNewGameButtonImage("victory.png");
}

function attemptToFlip(index: number): void {
  if (isVictorious()) {
    triggerVictory();
  }
  if (atLimit) {
    let clearThese: Card[] = [];
    for (let i=0; i<currentIndexes.length; i++) {
      clearThese.push(cards[currentIndexes[i]]);
    }
    let remCards = clearThese.splice(1, clearThese.length - 1);
    clearThese = [...clearThese, ...remCards];
    let theyAreMatching = clearThese[0].matchesThese(remCards);

    if (theyAreMatching) {
      // TODO_NOTE:
      // Perhaps update later to add a way to show match.
      // Ex. green-ish tint, colored border, change the image etc.");
      // add to matched amount
      matchedCards += clearThese.length;
    } else {
      // flip them back and update display to show result.
      clearThese.forEach(object => object.flip());
      clearThese.forEach(object => object.updateDisplay());
    }
    currentIndexes = []; // Reset currentIndexes to empty array.
  }
  if (cards[index].active && !currentIndexes.includes(index) && currentIndexes.length < MATCH_SIZE) {
    cards[index].flip();
    updateDisplay(index);

    if (currentIndexes.includes(index)) {
      flippedIndexes.splice(flippedIndexes.indexOf(index), 1);
      currentIndexes.splice(currentIndexes.indexOf(index), 1);
    } else {
      flippedIndexes.push(index);
      currentIndexes.push(index);
    }
    if (cards[index].isFlipped()) {
      cards[index].active = false;
    }
  }

  // after flipping, check if the flipped cards is the size of MATCH_SIZE, if so,
  // check for matches, then clear flipped cards and unlock the cards (if applicable).
  atLimit = ternary(currentIndexes.length == MATCH_SIZE, true, false);
  if (atLimit) {
    let checkThese = [];
    for (let i=0; i<currentIndexes.length; i++) {
      if (i > 0) {
        checkThese.push(cards[currentIndexes[i]]);
      }
    }
    let matchFound = cards[currentIndexes[0]].matchesThese(checkThese);
    lastGroupMatched = ternary(matchFound, true, false);

    //do this regardless of match
    for (let i=0; i<currentIndexes.length; i++) {
      if (!matchFound) {
        cards[currentIndexes[i]].active = true;
      }
      flippedIndexes.splice(flippedIndexes.indexOf(currentIndexes[i]));
    }
    let lastAddition = currentIndexes.length;
    matchedCards += lastAddition;
    if (isVictorious()) {
      victorious = true;
      triggerVictory();
    } else {
      matchedCards -= lastAddition;
    }
  }
}
cards = shuffle([...cards]); // make a copy of the cards array then shuffle the copy

// Create the buttons.
for (let y: number = 0; y < boardSizeY; y++) {
  for (let x: number = 0; x < boardSizeX; x++) {
    let i: number = y * boardSizeX + x;
    const button: HTMLButtonElement = document.createElement('button');
    button.type = 'button';
    button.className = "grid-button";
    button.id = `b${i}`;
    button.innerHTML = `<img id="b${i}i" src="${imageFolder}card_back.png" alt="alt text">`;

    button.style.width = "100%";
    button.style.height = "0";
    button.style.paddingBottom = "100%";

    button.addEventListener('click', () => {
      if (!victorious) {
        attemptToFlip(i);
        button.innerHTML = `<img id="b${i}i" src="${cards[i].imageDisplayed}" alt="alt text">`
      }
    });
    board.appendChild(button);
  }
}

let keyShown = false; // used to indicate if memory match key is being shown.
function toggleKeyDisplay() {
  let theImage: HTMLImageElement = document.getElementById("keyDisplayImage") as HTMLImageElement;
  theImage.src = ternary(!keyShown, `${imageFolder}key.png`, `${imageFolder}keyUnlocker.png`); // toggle image
  keyShown = ternary(keyShown, false, true); // toggle keyShown.
}

// Create the keyButton
const menuArea = document.getElementById("menuArea");
const keyButton: HTMLButtonElement = document.createElement('keyButton') as HTMLButtonElement;
keyButton.type = 'button'
keyButton.className = 'key-button';
keyButton.id = 'keyButton';
keyButton.innerHTML = `<img id="keyDisplayImage" src="${imageFolder}keyUnlocker.png" alt="alt text">`;

// Add event listener for the keyButton.
keyButton.addEventListener('click', () => {
  toggleKeyDisplay();
})

// Add the keyButton to the menuArea.
menuArea.appendChild(keyButton);

// Create the newGameButton
const newGameButton: HTMLButtonElement = document.createElement('newGameButton') as HTMLButtonElement;
newGameButton.type = 'button'
newGameButton.className = 'new-game-button'
newGameButton.id = 'newGameButton';
newGameButton.innerHTML = `<img id="newGameDisplayImage" src="${imageFolder}new_game.png" alt="alt text">`;

// Add event listener for the newGameButton.
newGameButton.addEventListener('click', () => {
  triggerNewGameButton();
})

// Add the newGameButton to the menuArea.
menuArea.appendChild(newGameButton);

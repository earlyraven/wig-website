var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// NOTE:
// Currently displays well only at 60% zoom level.
var playArea = document.getElementById("playArea");
var board = document.createElement("div");
board.innerHTML = "";
board.id = "board";
playArea.appendChild(board);
var MATCH_SIZE = 2;
var boardSizeX = 5;
var boardSizeY = 4;
var boardSize = boardSizeX * boardSizeY;
var matchedCards = 0;
var victorious = false;
var flippedIndexes = [];
var currentIndexes = [];
var imageFolder = "./assets/images/";
// const theNewGameImage: HTMLImageElement = document.getElementById("newGameDisplayImage") as HTMLImageElement;
// Helper functions:
function arraysEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    return a.every(function (value, index) { return value === b[index]; });
}
function ternary(condition, expression1, expression2) {
    return condition ? expression1 : expression2;
}
// Assumes the number passed an int and is >= 0.
// Returns a random int from 0 (inclusive) to n (exclusive)
function randInt(n) {
    return Math.floor(Math.random() * n);
}
var Card = /** @class */ (function () {
    function Card(active, tokenID, tokenMatchIDs, imageBack, imageFront, imageDisplayed, position) {
        if (active === void 0) { active = true; }
        if (tokenMatchIDs === void 0) { tokenMatchIDs = []; }
        if (imageDisplayed === void 0) { imageDisplayed = ""; }
        if (position === void 0) { position = null; }
        this.active = active;
        this.tokenID = tokenID;
        this.tokenMatchIDs = tokenMatchIDs;
        this.imageBack = imageBack;
        this.imageFront = imageFront;
        this.imageDisplayed = imageDisplayed;
        this.position = position;
        this.imageDisplayed = this.imageBack;
        this.position = this.tokenID;
    }
    Card.prototype.setPosition = function (position) {
        this.position = position;
    };
    Card.prototype.deactivate = function () {
        this.active = false;
    };
    Card.prototype.isFlipped = function () {
        return this.imageDisplayed === this.imageFront;
    };
    Card.prototype.matchesWith = function (card) {
        return arraysEqual(this.tokenMatchIDs, card.tokenMatchIDs);
    };
    Card.prototype.logMe = function () {
        console.log("Card Info:");
        console.log(this);
    };
    Card.prototype.matchesThese = function (cards) {
        for (var i = 0; i < cards.length; i++) {
            if (!this.matchesWith(cards[i])) {
                return false;
            }
        }
        return true;
    };
    Card.prototype.updateDisplay = function () {
        var imageElement = document.getElementById("b".concat(this.position, "i"));
        imageElement.src = cards[this.position].imageDisplayed;
    };
    Card.prototype.flip = function () {
        if (this.imageDisplayed === this.imageBack) {
            this.imageDisplayed = this.imageFront;
        }
        else {
            this.imageDisplayed = this.imageBack;
        }
    };
    return Card;
}());
var cards = [];
// UPGRADE_GENERALIZE this may need to change to allow for better generalization of matches.
// if, for example there are 3 or more cards that match with each other.
for (var i = 0; i < boardSize; i++) {
    var n = i + 1;
    if (i < boardSize / 2) {
        cards.push(new Card(undefined, n, [n, n + boardSize / 2], "".concat(imageFolder, "card_back.png"), "".concat(imageFolder).concat(n, ".png"), undefined, undefined));
    }
    else {
        cards.push(new Card(undefined, n, [n - boardSize / 2, n], "".concat(imageFolder, "card_back.png"), "".concat(imageFolder, "k").concat(n - boardSize / 2, ".png"), 
        // `${imageFolder}d${n-boardSize/2}.png`,
        undefined, undefined));
    }
}
function isVictorious() {
    return matchedCards == cards.length;
}
function shuffle(cards) {
    this.cards = cards;
    var shuffled = [];
    while (this.cards.length > 0) {
        // Randomly select a card and add it to the shuffled deck.
        // Since splice returns an array, the spread (...) operator is used to unpack it.
        shuffled.push.apply(shuffled, this.cards.splice(randInt(this.cards.length), 1));
    }
    // Update the reference to it's position in the button array.
    for (var i = 0; i < shuffled.length; i++) {
        shuffled[i].setPosition(i);
    }
    return shuffled;
}
function updateDisplay(index) {
    var imageElement = document.getElementById("b".concat(index, "i"));
    imageElement.src = cards[index].imageDisplayed;
}
var atLimit = false;
var lastGroupMatched = false;
function updateNewGameButtonImage(imagePath) {
    var theNewGameImage = document.getElementById("newGameDisplayImage");
    theNewGameImage.src = "".concat(imageFolder).concat(imagePath);
}
function triggerNewGameButton() {
    console.log("NEW GAME BUTTON WAS TRIGGERED.");
    console.log("For now, refresh the page to start a new game.");
    updateNewGameButtonImage("refresh_the_page.png");
}
function triggerVictory() {
    console.log("YIPPY YOU WON!!!");
    updateNewGameButtonImage("victory.png");
}
function attemptToFlip(index) {
    if (isVictorious()) {
        triggerVictory();
    }
    if (atLimit) {
        var clearThese = [];
        for (var i = 0; i < currentIndexes.length; i++) {
            clearThese.push(cards[currentIndexes[i]]);
        }
        var remCards = clearThese.splice(1, clearThese.length - 1);
        clearThese = __spreadArray(__spreadArray([], clearThese, true), remCards, true);
        var theyAreMatching = clearThese[0].matchesThese(remCards);
        if (theyAreMatching) {
            // TODO_NOTE:
            // Perhaps update later to add a way to show match.
            // Ex. green-ish tint, colored border, change the image etc.");
            // add to matched amount
            matchedCards += clearThese.length;
        }
        else {
            // flip them back and update display to show result.
            clearThese.forEach(function (object) { return object.flip(); });
            clearThese.forEach(function (object) { return object.updateDisplay(); });
        }
        currentIndexes = []; // Reset currentIndexes to empty array.
    }
    if (cards[index].active && !currentIndexes.includes(index) && currentIndexes.length < MATCH_SIZE) {
        cards[index].flip();
        updateDisplay(index);
        if (currentIndexes.includes(index)) {
            flippedIndexes.splice(flippedIndexes.indexOf(index), 1);
            currentIndexes.splice(currentIndexes.indexOf(index), 1);
        }
        else {
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
        var checkThese = [];
        for (var i = 0; i < currentIndexes.length; i++) {
            if (i > 0) {
                checkThese.push(cards[currentIndexes[i]]);
            }
        }
        var matchFound = cards[currentIndexes[0]].matchesThese(checkThese);
        lastGroupMatched = ternary(matchFound, true, false);
        //do this regardless of match
        for (var i = 0; i < currentIndexes.length; i++) {
            if (!matchFound) {
                cards[currentIndexes[i]].active = true;
            }
            flippedIndexes.splice(flippedIndexes.indexOf(currentIndexes[i]));
        }
        var lastAddition = currentIndexes.length;
        matchedCards += lastAddition;
        if (isVictorious()) {
            victorious = true;
            triggerVictory();
        }
        else {
            matchedCards -= lastAddition;
        }
    }
}
cards = shuffle(__spreadArray([], cards, true)); // make a copy of the cards array then shuffle the copy
// Create the buttons.
for (var y = 0; y < boardSizeY; y++) {
    var _loop_1 = function (x) {
        var i = y * boardSizeX + x;
        var button = document.createElement('button');
        button.type = 'button';
        button.className = "grid-button";
        button.id = "b".concat(i);
        button.innerHTML = "<img id=\"b".concat(i, "i\" src=\"").concat(imageFolder, "card_back.png\" alt=\"alt text\">");
        button.style.width = "100%";
        button.style.height = "0";
        button.style.paddingBottom = "100%";
        button.addEventListener('click', function () {
            if (!victorious) {
                attemptToFlip(i);
                button.innerHTML = "<img id=\"b".concat(i, "i\" src=\"").concat(cards[i].imageDisplayed, "\" alt=\"alt text\">");
            }
        });
        board.appendChild(button);
    };
    for (var x = 0; x < boardSizeX; x++) {
        _loop_1(x);
    }
}
var keyShown = false; // used to indicate if memory match key is being shown.
function toggleKeyDisplay() {
    var theImage = document.getElementById("keyDisplayImage");
    theImage.src = ternary(!keyShown, "".concat(imageFolder, "key.png"), "".concat(imageFolder, "keyUnlocker.png")); // toggle image
    keyShown = ternary(keyShown, false, true); // toggle keyShown.
}
// Create the keyButton
var menuArea = document.getElementById("menuArea");
var keyButton = document.createElement('keyButton');
keyButton.type = 'button';
keyButton.className = 'key-button';
keyButton.id = 'keyButton';
keyButton.innerHTML = "<img id=\"keyDisplayImage\" src=\"".concat(imageFolder, "keyUnlocker.png\" alt=\"alt text\">");
// Add event listener for the keyButton.
keyButton.addEventListener('click', function () {
    toggleKeyDisplay();
});
// Add the keyButton to the menuArea.
menuArea.appendChild(keyButton);
// Create the newGameButton
var newGameButton = document.createElement('newGameButton');
newGameButton.type = 'button';
newGameButton.className = 'new-game-button';
newGameButton.id = 'newGameButton';
newGameButton.innerHTML = "<img id=\"newGameDisplayImage\" src=\"".concat(imageFolder, "new_game.png\" alt=\"alt text\">");
// Add event listener for the newGameButton.
newGameButton.addEventListener('click', function () {
    triggerNewGameButton();
});
// Add the newGameButton to the menuArea.
menuArea.appendChild(newGameButton);

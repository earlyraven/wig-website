var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// Global UI Settings (change this later) to be in it's own class perhaps
var uiSettingKeyShown = true;
var victoryShouldBeDisplayed = false;
var standardPadding = 10;
// Add these to a 'StageTracker' class in the future.
var gameStage = 1;
var finalStage = 5;
var pointGoal;
var startingTargets;
var stagePointGoals = [300, 700, 1200, 1800, 2500];
var stageStartingTargets = [
    [1, 2, 3, 4],
    [3, 4, 5, 6],
    [1, 3, 5, 7],
    [2, 4, 6, 8],
    [1, 2, 9, 10],
];
function setPointGoal() {
    // pointGoal = gameStage * 500 // Alternative simple scale approach.
    // pointGoal = gameStage * 200 + 100*gameStage // Alternative fixed increase scale approach.
    pointGoal = stagePointGoals[gameStage - 1];
}
function setStartingTargets() {
    startingTargets = stageStartingTargets[gameStage - 1];
}
/**
 * A class for managing the targets a player should aim to collect.
 */
var TargetTracker = /** @class */ (function () {
    function TargetTracker() {
        /**
         * An array holding the values of the active targets.
         * @type {number[]}
         */
        this.activeTargetValues = [];
        /**
         * A human-readable expression representing the active targets.
         * @type {string}
         */
        this.activeTargetExpression = "";
    }
    /**
     * Adds a target to the list of active targets.
     * @param {number} target - The value of the target to add.
     * @returns {void}
     */
    TargetTracker.prototype.addTarget = function (target) {
        this.activeTargetValues.push(target);
        this.updateActiveTargetExpression();
    };
    /**
     * Removes a target from the list of active targets.
     * @param {number} target - The value of the target to remove.
     * @returns {void}
     */
    TargetTracker.prototype.removeTarget = function (target) {
        var index = this.activeTargetValues.indexOf(target);
        if (index !== -1) {
            this.activeTargetValues.splice(index, 1);
            this.updateActiveTargetExpression();
        }
    };
    TargetTracker.prototype.changeTargetWith = function (removeValue, addValue) {
        this.removeTarget(removeValue);
        this.addTarget(addValue);
    };
    TargetTracker.prototype.sortTargets = function () {
        this.activeTargetValues.sort(function (a, b) { return a - b; });
    };
    TargetTracker.prototype.changeRandomTarget = function () {
        var selectedIndex = Math.floor(Math.random() * this.activeTargetValues.length);
        var replacementOptions = [];
        for (var i = 1; i <= 10; i++) {
            var valueIsUsed = this.activeTargetValues.includes(i);
            valueIsUsed ? console.log("Skipping: ".concat(i, ". It is used.")) : replacementOptions.push(i);
        }
        if (replacementOptions.length > 0) {
            var replacementIndex = Math.floor(Math.random() * replacementOptions.length);
            var removeValue = this.activeTargetValues[selectedIndex];
            var addValue = replacementOptions[replacementIndex];
            console.log("REMOVE: ", removeValue);
            console.log("ADD: ", addValue);
            this.changeTargetWith(removeValue, addValue);
        }
    };
    /**
     * Update the human-readable target expression based on the current active targets.
     * This method is for internal use and is automatically called when targets are added or removed.
     * @private
     * @returns {void}
     */
    TargetTracker.prototype.updateActiveTargetExpression = function () {
        this.activeTargetExpression = "Active Target: " + this.activeTargetValues.toString();
    };
    return TargetTracker;
}());
var Emoji = /** @class */ (function () {
    function Emoji(visual, unicode, shortName) {
        this.visual = visual;
        this.unicode = unicode;
        this.shortName = shortName;
    }
    return Emoji;
}());
var emojis = {
    hamburger: new Emoji("🍔", "1F354", "hamburger"),
    good: new Emoji("🤠", "1f920", "cowboy hat face"),
    bad: new Emoji("🤢", "1f922", "nauseated face"),
    goal: new Emoji("🥅", "1F945", "goal net"),
    stage: new Emoji("🗺️", "1F5FA", "world map"),
    // Add more supported emojis here
};
var GameEntity = /** @class */ (function () {
    function GameEntity() {
        this.width = 50;
        this.height = 50;
        this.posx = 100;
        this.posy = canvas_height - this.height;
    }
    GameEntity.prototype.draw = function () {
        ctx.fillStyle = "blue"; // Set entity color to blue
        ctx.fillRect(this.posx, this.posy, this.width, this.height);
    };
    return GameEntity;
}());
var BoxItem = /** @class */ (function (_super) {
    __extends(BoxItem, _super);
    function BoxItem(posx, posy, width, height, central_value) {
        var _this = 
        // constructor(posx: number, posy: number, width: number, height: number, central_value: number {
        _super.call(this) || this;
        _this.central_value = -1;
        _this.velx = 0;
        _this.vely = 1;
        _this.shouldDelete = false;
        _this.posx = posx;
        _this.posy = posy;
        _this.width = width;
        _this.height = height;
        _this.central_value = central_value;
        _this.current_image = "".concat(kanji_path, "d").concat(_this.central_value, ".png");
        _this.image = new Image();
        _this.image.src = _this.current_image;
        // satisfy CollectionPoint requirements:
        _this.collected = false;
        _this.relativeCollectionPointX = width / 2;
        _this.relativeCollectionPointY = height / 2;
        _this.collectionBoxX = 0;
        _this.collectionBoxY = 0;
        _this.collectionBoxW = 10;
        _this.collectionBoxH = 10;
        _this.ageInUpdates = 0;
        return _this;
    }
    BoxItem.prototype.collectWithCollectionBox = function (cx, cy, cw, ch) {
        // Check if the BoxItem is within the collection box
        var withinX = false;
        var withinY = false;
        if (cx < this.posx + this.relativeCollectionPointX && this.posx + this.relativeCollectionPointX < cx + cw) {
            withinX = true;
        }
        if (cy < this.posy + this.relativeCollectionPointY && this.posy + this.relativeCollectionPointY < cy + ch) {
            withinY = true;
        }
        this.collected = withinX && withinY;
        if (this.collected) {
            console.log("IM HERE:");
            console.log("Box item collected:", this);
            this.collected = true;
        }
    };
    /**
   * Checks if the box item overlaps with the player's rectangle.
   *
   * @param {Player} player - The player object.
   * @returns {void}
   */
    BoxItem.prototype.collectOnTouch = function (player) {
        var isOverlapping = this.isRectOverlapping(player.posx, player.posy, player.width, player.height);
        this.collected = isOverlapping;
        if (this.collected) {
            this.shouldDelete = true;
            // Perform additional actions or update game state as needed
            // player.targetTracker.changeRandomTarget();
        }
        player.collectBoxItem(this);
    };
    /**
     * Checks if the box item overlaps with the player's circle.
     *
     * @param {Player} player - The player object.
     * @returns {void}
     */
    BoxItem.prototype.collectWithPlayer = function (player) {
        var isOverlapping = this.isCircleOverlapping(player.posx + player.width / 2, player.posy + player.height / 2, player.width / 2);
        this.collected = isOverlapping;
        if (this.collected) {
            this.shouldDelete = true;
            // Perform additional actions or update game state as needed
        }
        player.collectBoxItem(this);
    };
    /**
     * Checks if the box item overlaps with a rectangle defined by the provided coordinates and dimensions.
     *
     * @param {number} x - The x-coordinate of the rectangle.
     * @param {number} y - The y-coordinate of the rectangle.
     * @param {number} width - The width of the rectangle.
     * @param {number} height - The height of the rectangle.
     * @returns {boolean} Whether the box item overlaps with the rectangle.
     */
    BoxItem.prototype.isRectOverlapping = function (x, y, width, height) {
        var boxItemLeft = this.posx;
        var boxItemRight = this.posx + this.width;
        var boxItemTop = this.posy;
        var boxItemBottom = this.posy + this.height;
        var overlapX = Math.max(0, Math.min(x + width, boxItemRight) - Math.max(x, boxItemLeft));
        var overlapY = Math.max(0, Math.min(y + height, boxItemBottom) - Math.max(y, boxItemTop));
        return overlapX > 0 && overlapY > 0;
    };
    /**
     * Checks if the box item overlaps with a circle defined by the provided center coordinates and radius.
     *
     * @param {number} centerX - The x-coordinate of the circle center.
     * @param {number} centerY - The y-coordinate of the circle center.
     * @param {number} radius - The radius of the circle.
     * @returns {boolean} Whether the box item overlaps with the circle.
     */
    BoxItem.prototype.isCircleOverlapping = function (centerX, centerY, radius) {
        var boxItemCenterX = this.posx + this.width / 2;
        var boxItemCenterY = this.posy + this.height / 2;
        var distance = Math.sqrt(Math.pow((centerX - boxItemCenterX), 2) +
            Math.pow((centerY - boxItemCenterY), 2));
        return distance <= radius;
    };
    BoxItem.prototype.move = function () {
        this.posx += this.velx;
        this.posy += this.vely;
        // Update collection box position based on BoxItem's position
        this.collectionBoxX = this.posx;
        this.collectionBoxY = this.posy;
        // Update collection box dimensions based on BoxItem's width and height
        this.collectionBoxW = this.width;
        this.collectionBoxH = this.height;
    };
    // This is just a debug helper: probably wont be needed.
    BoxItem.prototype.logCentralValue = function () {
        console.log(this.central_value);
    };
    BoxItem.prototype.draw = function () {
        ctx.drawImage(this.image, this.posx, this.posy, this.width, this.height);
    };
    BoxItem.prototype.updateAge = function () {
        // For now, just using update calls, may change to seconds later.
        this.ageInUpdates += 1;
    };
    BoxItem.prototype.update = function () {
        // this.logCentralValue();
        this.move();
        this.deletionCheck();
        this.draw();
        this.updateAge();
    };
    BoxItem.prototype.deletionCheck = function () {
        if (this.posy > canvas_height) {
            this.shouldDelete = true;
        }
    };
    BoxItem.prototype.createExplosionParticles = function () {
        console.log("FILLER: explosion particles for ".concat(this.constructor.name, " created here ").concat(this.posx, ", % ").concat(this.posy, "."));
        //TODO: Actually create the particles here instead of just logging a message.
    };
    return BoxItem;
}(GameEntity));
var BoxItemSpawner = /** @class */ (function () {
    function BoxItemSpawner(spawnInterval, minSize, maxSize, boxItemsArray) {
        var _this = this;
        this.spawnInterval = spawnInterval;
        this.minSize = minSize;
        this.maxSize = maxSize;
        this.boxItemsArray = boxItemsArray;
        this.central_value = -2;
        this.intervalId = window.setInterval(function () { return _this.spawnBoxItem(); }, this.spawnInterval);
        this.minSpawnInterval = 500;
        this.totalSpawned = 0;
        this.spawnedSinceAdjustment = 0;
        this.spawnsRequiredToAdjust = 10;
    }
    BoxItemSpawner.prototype.setSpawnInterval = function (newSpawnInterval) {
        var _this = this;
        this.spawnInterval = newSpawnInterval;
        clearInterval(this.intervalId);
        this.intervalId = window.setInterval(function () { return _this.spawnBoxItem(); }, this.spawnInterval);
    };
    BoxItemSpawner.prototype.adjustSpwanInterval = function (milliseconds) {
        this.setSpawnInterval(this.spawnInterval + milliseconds);
        if (this.spawnInterval < this.minSpawnInterval) {
            this.setSpawnInterval(this.minSpawnInterval);
        }
    };
    BoxItemSpawner.prototype.spawnBoxItem = function () {
        var width = Math.random() * (this.maxSize - this.minSize) + this.minSize;
        var height = width; // Assuming box items are square
        var posX = Math.random() * (canvas_width - this.maxSize);
        var posY = -height;
        var central_value = Math.ceil(Math.random() * 10);
        var boxItem = new BoxItem(posX, posY, width, height, central_value);
        this.boxItemsArray.push(boxItem);
        this.incrementSpawnCount();
        if (this.spawnedSinceAdjustment == this.spawnsRequiredToAdjust) {
            this.adjustSpwanInterval(-250);
            this.spawnedSinceAdjustment = 0;
            console.log("INFO:==> Spaawn interval updated.  New interval: ", this.spawnInterval);
        }
    };
    BoxItemSpawner.prototype.incrementSpawnCount = function () {
        this.totalSpawned += 1;
        this.spawnedSinceAdjustment += 1;
    };
    BoxItemSpawner.prototype.stopSpawning = function () {
        window.clearInterval(this.intervalId);
    };
    return BoxItemSpawner;
}());
var MoveKey;
(function (MoveKey) {
    MoveKey["Up"] = "ArrowUp";
    MoveKey["Left"] = "ArrowLeft";
    MoveKey["Right"] = "ArrowRight";
    MoveKey["Down"] = "ArrowDown";
})(MoveKey || (MoveKey = {}));
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player(targetTracker, input) {
        var _this = _super.call(this) || this;
        _this.velx = 0;
        _this.vely = 0;
        _this.score = 0;
        _this.goodCollected = 0;
        _this.badCollected = 0;
        _this.targetTracker = targetTracker;
        _this.input = input;
        _this.ageInUpdatesCollected = 0;
        _this.oldScore = 0;
        _this.scoreChangeOccurances = 0;
        _this.targetsWereChanged = false;
        _this.collectionsBeforeTargetChange = 5;
        return _this;
    }
    Player.prototype.collectBoxItem = function (boxItem) {
        if (this.oldScore !== this.score) {
            this.scoreChangeOccurances += 1;
        }
        if (this.scoreChangeOccurances % this.collectionsBeforeTargetChange == 0 && this.scoreChangeOccurances != 0) {
            if (!this.targetsWereChanged) {
                this.targetTracker.changeRandomTarget();
                this.targetsWereChanged = true;
            }
        }
        this.oldScore = this.score;
        if (this.scoreChangeOccurances % this.collectionsBeforeTargetChange == 1) {
            this.targetsWereChanged = false;
        }
        if (boxItem.collected) {
            console.log("INFO:==> Collected: ", boxItem.central_value, " with age of: ", boxItem.ageInUpdates);
            // Updating good/bad counts (matches and non-matches)
            var isMatching = void 0;
            isMatching = this.targetTracker.activeTargetValues.includes(boxItem.central_value);
            isMatching ? this.goodCollected += 1 : this.badCollected += 1;
            // Update score --> Gain points for a mtach, lose points otherwise.
            var scorePerMatch = 100;
            isMatching ? this.score += scorePerMatch : this.score -= scorePerMatch;
            this.ageInUpdatesCollected += boxItem.ageInUpdates;
            console.log("INFO:==> Score is now: ", this.score, "Total age collected: ", this.ageInUpdatesCollected);
        }
    };
    Player.prototype.move = function () {
        var maxSpeed = 5;
        this.velx = this.input.horizontalInput * maxSpeed;
        this.vely = this.input.verticalInput * maxSpeed;
        this.posx += this.velx;
        this.posy += this.vely;
        // Keep the player within the canvas bounds
        if (this.posx < 0) {
            this.posx = 0;
        }
        else if (this.posx + this.width > canvas_width) {
            this.posx = canvas_width - this.width;
        }
        if (this.posy < 0) {
            this.posy = 0;
        }
        else if (this.posy + this.height > canvas_height) {
            this.posy = canvas_height - this.height;
        }
    };
    Player.prototype.handleInput = function () {
        if (this.input.isKeyPressed(MoveKey.Left) || this.input.isKeyPressed(MoveKey.Right)) {
            this.input.horizontalInput = this.input.isKeyPressed(MoveKey.Left) ? -1 : 1;
        }
        else {
            this.input.horizontalInput = 0;
        }
        if (this.input.isKeyPressed(MoveKey.Up) || this.input.isKeyPressed(MoveKey.Down)) {
            this.input.verticalInput = this.input.isKeyPressed(MoveKey.Up) ? -1 : 1;
        }
        else {
            this.input.verticalInput = 0;
        }
    };
    Player.prototype.update = function () {
        this.handleInput();
        this.move();
        this.draw();
    };
    return Player;
}(GameEntity));
var PlayerInput = /** @class */ (function () {
    function PlayerInput() {
        this.keyState = {};
        this.setupInput();
        this.horizontalInput = 0;
        this.verticalInput = 0;
    }
    PlayerInput.prototype.setupInput = function () {
        var _this = this;
        window.addEventListener("keydown", function (event) {
            _this.keyState[event.key] = true;
        });
        window.addEventListener("keyup", function (event) {
            _this.keyState[event.key] = false;
        });
    };
    PlayerInput.prototype.isKeyPressed = function (key) {
        return this.keyState[key];
    };
    return PlayerInput;
}());
function drawScore(ctx) {
    ctx.font = "40px Arial";
    ctx.fillText("Score: ", standardPadding, 50);
    ctx.fillText(player.score.toString(), standardPadding, 100);
}
function drawStage(ctx) {
    ctx.font = "40px Arial";
    var stageText = "".concat(gameStage, " / ").concat(finalStage, " ").concat(emojis.stage.visual);
    var stageX = ctx.canvas.width - ctx.measureText(stageText).width - standardPadding;
    ctx.fillText("".concat(stageText), stageX, 50);
}
function drawPointGoal(ctx) {
    ctx.font = "40px Arial";
    var goalText = "".concat(pointGoal, " ").concat(emojis.goal.visual);
    var goalX = ctx.canvas.width - ctx.measureText(goalText).width - standardPadding;
    ctx.fillText("".concat(goalText), goalX, 100);
}
function numberToKanji(value) {
    // Font source:
    // https://zhidao.baidu.com/question/1242333478685809179.html
    // 一二三四五六七八九十
    var kanjiString = "一二三四五六七八九十";
    if (value <= 0 || value > kanjiString.length) {
        console.log("Unsupported entry provided:  ".concat(value, " could not be converted to kanji."));
    }
    return kanjiString.charAt(value - 1);
}
function drawTargetValues(ctx, player, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.show, show = _c === void 0 ? true : _c;
    if (show === true) {
        ctx.font = "40px Arial";
        var kanjiTargets = player.targetTracker.activeTargetValues.map(numberToKanji);
        ctx.fillText("[" + kanjiTargets + "]", standardPadding, 150);
    }
}
function drawTargetExpression(ctx, player) {
    ctx.font = "40px Arial";
    var activeTargetExpression = player.targetTracker.activeTargetValues.toString();
    // using 'Direct Hit' emoji (Unicode 6.0; 2010) in place of "Target(s)" for conciseness'
    ctx.fillText("🎯 " + activeTargetExpression, standardPadding, 200);
}
function drawGoodAndBadCount(ctx, player) {
    ctx.font = "40px Arial";
    var goodText = "".concat(emojis.good.visual, " ").concat(player.goodCollected);
    var badText = "".concat(player.badCollected, " ").concat(emojis.bad.visual);
    var goodTextX = standardPadding;
    var goodTextY = 580;
    ctx.fillText(goodText, goodTextX, goodTextY);
    var badTextX = ctx.canvas.width - ctx.measureText(badText).width - standardPadding;
    var badTextY = 580;
    ctx.fillText(badText, badTextX, badTextY);
}
// Set up the game canvas
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
var canvas_width = 500;
var canvas_height = 800;
canvas.width = canvas_width;
canvas.height = canvas_height;
// const project_root_folder_address = "./block_catcher/"
// const kanji_path = project_root_folder_address + "src/resources/images/kanji/";
var kanji_path = "./src/resources/images/kanji/";
if (!ctx) {
    throw new Error("Failed to get 2D rendering context for canvas");
}
//TODO: Improve the layout of these buttons and in doing so, avoid "magic number" position values.
//>>>>>> Start new game
// Adding a button to restart the game.
// Create a button element
var button = document.createElement('button');
button.textContent = 'Start New Game';
// Position the button at the top-left corner
button.style.position = 'absolute';
button.style.top = '10px';
button.style.left = '10px';
// Add event listener to the button
button.addEventListener('click', startNewGame);
// Append the button to the document body
document.body.appendChild(button);
//>>>>>>
function toggleKeyShown() {
    uiSettingKeyShown = uiSettingKeyShown ? false : true;
}
//>>>>>> Hide/Show Key
// Now make a button to show/hide symbols for targets
var symbolDisplayToggleButtonElement = document.createElement("button");
symbolDisplayToggleButtonElement.textContent = "Show/Hide Key";
symbolDisplayToggleButtonElement.style.position = "absolute";
symbolDisplayToggleButtonElement.style.top = "50px";
symbolDisplayToggleButtonElement.style.left = "10px";
// Add event listener to the button
symbolDisplayToggleButtonElement.addEventListener("click", toggleKeyShown);
// Append the button to the document body
document.body.appendChild(symbolDisplayToggleButtonElement);
//>>>>>>>
var player;
var box_items = [];
var spawner;
function explodeAllBoxItems() {
    box_items.forEach(function (item) { return item.createExplosionParticles(); });
    box_items = [];
}
// Game initialization function
function initializeGame() {
    console.log("Beginning stage ".concat(gameStage));
    var input = new PlayerInput();
    var targetTracker = new TargetTracker();
    setStartingTargets();
    startingTargets.forEach(targetTracker.addTarget, targetTracker);
    player = new Player(targetTracker, input);
    console.log(player.targetTracker);
    box_items = [];
    // box_items.push(new BoxItem(400, 200, 50, 50, 3));
    // box_items.push(new BoxItem(230, 400, 50, 50, 5));
    // Spawner to control spawning of Boxitems.
    // Starts with 2s interval, and size range as indicated.
    spawner = new BoxItemSpawner(2000, 30, 60, box_items);
    spawner.totalSpawned = box_items.length;
    setPointGoal();
    // Start the game loop
    startGameLoop();
}
// Game loop function
function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawScore(ctx);
    drawStage(ctx);
    drawPointGoal(ctx);
    drawTargetValues(ctx, player, { show: uiSettingKeyShown }); // 'show' parameter set in accordance with uiSettingKeyShown.
    drawTargetExpression(ctx, player);
    drawGoodAndBadCount(ctx, player);
    // Update game logic and render graphics
    // Update the player
    player.update();
    // Update the box items
    box_items.forEach(function (item) { return item.update(); });
    //Trigger box collection
    box_items.forEach(function (item) { return item.collectOnTouch(player); });
    //Re-sort targets
    player.targetTracker.sortTargets();
    // Delete any box items that went off-screen.
    // Traversing in reverse order to avoid index shifting.
    for (var i = box_items.length - 1; i >= 0; i--) {
        if (box_items[i].shouldDelete) {
            box_items.splice(i, 1);
        }
    }
    if (player.score >= pointGoal) {
        beginNextStage(spawner);
    }
}
var gameLoopId;
function startGameLoop() {
    cancelAnimationFrame(gameLoopId);
    gameLoopId = requestAnimationFrame(updateLoop);
}
// Define the fixed time step for the game (in milliseconds)
var fixedTimeStep = 16; // 60 frames per second (approximately)
var previousTime = performance.now();
var accumulatedTime = 0;
function updateLoop(currentTime) {
    var deltaTime = currentTime - previousTime;
    previousTime = currentTime;
    accumulatedTime += deltaTime;
    // Update the game logic in fixed time steps
    while (accumulatedTime >= fixedTimeStep) {
        gameLoop();
        accumulatedTime -= fixedTimeStep;
    }
    // Render the graphics
    // ...
    // Request the next frame
    gameLoopId = requestAnimationFrame(updateLoop);
}
// Call the initializeGame function to start the game
initializeGame();
function startNewGame() {
    removeVictoryMessage();
    gameStage = 1;
    initializeGame();
}
function beginNextStage(spawner) {
    if (gameStage === finalStage) {
        if (victoryShouldBeDisplayed === false) {
            triggerVictory(spawner);
        }
    }
    else {
        gameStage += 1;
        initializeGame();
    }
}
function displayVictoryMessage() {
    if (victoryShouldBeDisplayed === false) {
        // Create a splash message element
        var splashMessage = document.createElement("div");
        splashMessage.textContent = "Victory";
        splashMessage.style.position = "absolute";
        splashMessage.style.top = "50%";
        splashMessage.style.left = "50%";
        splashMessage.style.transform = "translate(-50%, -50%)";
        splashMessage.style.fontSize = "50px";
        splashMessage.style.fontWeight = "bold";
        splashMessage.style.color = "white";
        splashMessage.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.5)";
        splashMessage.id = "victory-message";
        document.body.appendChild(splashMessage);
        victoryShouldBeDisplayed = true;
    }
}
function removeVictoryMessage() {
    var splashMessage = document.getElementById("victory-message");
    if (splashMessage) {
        splashMessage.remove();
    }
    victoryShouldBeDisplayed = false;
}
function triggerVictory(spawner) {
    console.log("YOU WON!");
    // Stop the boxItems from updating further
    explodeAllBoxItems();
    // Stop the spawner
    spawner.stopSpawning();
    // Stop player movement
    player.input.horizontalInput = 0;
    player.input.verticalInput = 0;
    // Display a splash message at the center of the screen saying "Victory"
    displayVictoryMessage();
}

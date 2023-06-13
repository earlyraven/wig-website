// Global UI Settings (change this later) to be in it's own class perhaps
let uiSettingKeyShown = true;
let victoryShouldBeDisplayed = false;
let standardPadding = 10;

// Add these to a 'StageTracker' class in the future.
let gameStage = 1;
let finalStage = 5;
let pointGoal: number;
let startingTargets: number[];
let stagePointGoals: number[] = [300, 700, 1200, 1800, 2500];
let stageStartingTargets: number[][] = [
  [1,2,3,4],
  [3,4,5,6],
  [1,3,5,7],
  [2,4,6,8],
  [1,2,9,10],
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
class TargetTracker {
  /**
   * An array holding the values of the active targets.
   * @type {number[]}
   */
  activeTargetValues: number[] = [];

  /**
   * A human-readable expression representing the active targets.
   * @type {string}
   */
  activeTargetExpression: string = "";

  /**
   * Adds a target to the list of active targets.
   * @param {number} target - The value of the target to add.
   * @returns {void}
   */
  addTarget(target: number): void {
    this.activeTargetValues.push(target);
    this.updateActiveTargetExpression();
  }

  /**
   * Removes a target from the list of active targets.
   * @param {number} target - The value of the target to remove.
   * @returns {void}
   */
  removeTarget(target: number): void {
    const index = this.activeTargetValues.indexOf(target);
    if (index !== -1) {
      this.activeTargetValues.splice(index, 1);
      this.updateActiveTargetExpression();
    }
  }

  changeTargetWith(removeValue: number, addValue: number) {
    this.removeTarget(removeValue);
    this.addTarget(addValue);
  }

  sortTargets() {
    this.activeTargetValues.sort((a, b) => a - b);
  }

  changeRandomTarget() {
    let selectedIndex = Math.floor(Math.random() * this.activeTargetValues.length);
    let replacementOptions: number[] = [];
    
    for (let i = 1; i <= 10; i++) {
      let valueIsUsed = this.activeTargetValues.includes(i);
      valueIsUsed ? console.log(`Skipping: ${i}. It is used.`) : replacementOptions.push(i);
    }
    
    if (replacementOptions.length > 0) {
      let replacementIndex = Math.floor(Math.random() * replacementOptions.length);
      let removeValue = this.activeTargetValues[selectedIndex];
      let addValue = replacementOptions[replacementIndex];
      console.log("REMOVE: ", removeValue);
      console.log("ADD: ", addValue);
      this.changeTargetWith(removeValue, addValue);
    }
  }

  /**
   * Update the human-readable target expression based on the current active targets.
   * This method is for internal use and is automatically called when targets are added or removed.
   * @private
   * @returns {void}
   */
  private updateActiveTargetExpression(): void {
    this.activeTargetExpression = "Active Target: " + this.activeTargetValues.toString();
  }
}

class Emoji {
  constructor(
    public readonly visual: string,
    public readonly unicode: string,
    public readonly shortName: string
  ) {}
}

const emojis: Record<string, Emoji> = {
  hamburger: new Emoji("🍔", "1F354", "hamburger"),
  good: new Emoji("🤠", "1f920", "cowboy hat face"),
  bad: new Emoji("🤢", "1f922", "nauseated face"),
  goal: new Emoji("🥅", "1F945", "goal net"),
  stage: new Emoji("🗺️", "1F5FA", "world map"),
  // Add more supported emojis here
};

/**
 * Makes object have position properties.
 *
 * @property {number} posx - The X coordinate of the position.
 * @property {number} posy - The Y coordinate of the position.
 */
interface Positionable {
  posx: number;
  posy: number;
}

/**
 * Makes object have width and height properties.
 *
 * @property {number} width - The width of the object.
 * @property {number} height - The height of the object.
 */
interface HasWH {
  width: number;
  height: number;
}

/**
 * Makes object implement the required interfaces.
 *
 * Requires:
 * - `Positionable` interface for position properties.
 * - `HasWH` interface for width and height properties.
 */
interface HasRect extends Positionable, HasWH {
  // Just a container implementation
}

/**
 * Makes object be drawable.
 *
 * Requires:
 * - `HasRect` interface, which requires:
 *   - `Positionable` interface for position properties.
 *   - `HasWH` interface for width and height properties.
 */
interface Drawable extends HasRect {
  draw(): void;
}

/**
 * Represents an object that can be collected based on a collection point.
 *
 * Inherits from:
 * - `HasRect` interface, which requires:
 *   - `Positionable` interface for position properties.
 *   - `HasWH` interface for width and height properties.
 *
 * Extends with:
 * @property {boolean} collected - Indicates whether the point has been collected.
 * @property {number} relativeCollectionPointX - The relative X coordinate of the collection point within the collectable object.
 * @property {number} relativeCollectionPointY - The relative Y coordinate of the collection point within the collectable object.
 */

interface CollectablePoint extends HasRect {
  collected: boolean;
  relativeCollectionPointX: number;
  relativeCollectionPointY: number;
  collectionBoxX: number;
  collectionBoxY: number;
  collectionBoxW: number;
  collectionBoxH: number;


  //TODO: Perhaps delete this and just use collectWithPlayer instead.
  /**
   * Modifies the `collected` property based on whether the collection point is inside the collection rectangle.
   *
   * @param {number} cx - The X coordinate of the collection rectangle.
   * @param {number} cy - The Y coordinate of the collection rectangle.
   * @param {number} cw - The width of the collection rectangle.
   * @param {number} ch - The height of the collection rectangle.
   */
  collectWithCollectionBox(cx: number, cy: number, cw: number, ch: number): void;
  collectWithPlayer(player: Player): void;
  collectOnTouch(player: Player): void;
}

interface AutoDeletable {
  shouldDelete: boolean;
  deletionCheck(): void
}

interface Movable {
  velx: number;
  vely: number;
  move(): void;
}

interface HasCentralValue {
  central_value: number;
}

class GameEntity implements Drawable {
  posx: number;
  posy: number;
  width: number;
  height: number;

  constructor() {
    this.width = 50;
    this.height = 50;
    this.posx = 100;
    this.posy = canvas_height - this.height;
  }

  draw() {
    ctx.fillStyle = "blue"; // Set entity color to blue
    ctx.fillRect(this.posx, this.posy, this.width, this.height);
  }
}

class BoxItem extends GameEntity implements Drawable, AutoDeletable, Movable, HasCentralValue, CollectablePoint {
  current_image: string;
  image: HTMLImageElement;

  // implemenation stuff for CollectionPoint inteface
  collected: boolean;
  relativeCollectionPointX: number;
  relativeCollectionPointY: number;
  collectionBoxX: number;
  collectionBoxY: number;
  collectionBoxW: number;
  collectionBoxH: number;

  ageInUpdates: number;

  constructor(posx: number, posy: number, width: number, height: number, central_value: number) {
    // constructor(posx: number, posy: number, width: number, height: number, central_value: number {
    super();
    this.posx = posx;
    this.posy = posy;
    this.width = width;
    this.height = height;
    this.central_value = central_value;
    this.current_image = `${kanji_path}d${this.central_value}.png`;
    this.image = new Image();
    this.image.src = this.current_image;

    // satisfy CollectionPoint requirements:
    this.collected = false;
    this.relativeCollectionPointX = width / 2;
    this.relativeCollectionPointY = height / 2;
    this.collectionBoxX = 0;
    this.collectionBoxY = 0;
    this.collectionBoxW = 10;
    this.collectionBoxH = 10;

    this.ageInUpdates = 0;
    }

  collectWithCollectionBox(cx: number, cy: number, cw: number, ch: number): void {
    // Check if the BoxItem is within the collection box
    let withinX: boolean = false;
    let withinY: boolean = false;
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
  }

    /**
   * Checks if the box item overlaps with the player's rectangle.
   *
   * @param {Player} player - The player object.
   * @returns {void}
   */
  collectOnTouch(player: Player): void {
    const isOverlapping = this.isRectOverlapping(player.posx, player.posy, player.width, player.height);

    this.collected = isOverlapping;

    if (this.collected) {
      this.shouldDelete = true;
      // Perform additional actions or update game state as needed
      // player.targetTracker.changeRandomTarget();
    }

    player.collectBoxItem(this);
  }

  /**
   * Checks if the box item overlaps with the player's circle.
   *
   * @param {Player} player - The player object.
   * @returns {void}
   */
  collectWithPlayer(player: Player): void {
    const isOverlapping = this.isCircleOverlapping(
      player.posx + player.width / 2,
      player.posy + player.height / 2,
      player.width / 2
    );

    this.collected = isOverlapping;

    if (this.collected) {
      this.shouldDelete = true;
      // Perform additional actions or update game state as needed
    }

    player.collectBoxItem(this);
  }

  /**
   * Checks if the box item overlaps with a rectangle defined by the provided coordinates and dimensions.
   *
   * @param {number} x - The x-coordinate of the rectangle.
   * @param {number} y - The y-coordinate of the rectangle.
   * @param {number} width - The width of the rectangle.
   * @param {number} height - The height of the rectangle.
   * @returns {boolean} Whether the box item overlaps with the rectangle.
   */
  isRectOverlapping(x: number, y: number, width: number, height: number): boolean {
    const boxItemLeft = this.posx;
    const boxItemRight = this.posx + this.width;
    const boxItemTop = this.posy;
    const boxItemBottom = this.posy + this.height;

    const overlapX = Math.max(0, Math.min(x + width, boxItemRight) - Math.max(x, boxItemLeft));
    const overlapY = Math.max(0, Math.min(y + height, boxItemBottom) - Math.max(y, boxItemTop));

    return overlapX > 0 && overlapY > 0;
  }

  /**
   * Checks if the box item overlaps with a circle defined by the provided center coordinates and radius.
   *
   * @param {number} centerX - The x-coordinate of the circle center.
   * @param {number} centerY - The y-coordinate of the circle center.
   * @param {number} radius - The radius of the circle.
   * @returns {boolean} Whether the box item overlaps with the circle.
   */
  isCircleOverlapping(centerX: number, centerY: number, radius: number): boolean {
    const boxItemCenterX = this.posx + this.width / 2;
    const boxItemCenterY = this.posy + this.height / 2;

    const distance = Math.sqrt(
      (centerX - boxItemCenterX) ** 2 +
      (centerY - boxItemCenterY) ** 2
    );

    return distance <= radius;
  }
  
  central_value = -1;
  velx = 0;
  vely = 1;
  move() {
    this.posx += this.velx;
    this.posy += this.vely;
    
    // Update collection box position based on BoxItem's position
    this.collectionBoxX = this.posx;
    this.collectionBoxY = this.posy;

    // Update collection box dimensions based on BoxItem's width and height
    this.collectionBoxW = this.width;
    this.collectionBoxH = this.height;
  }

  // This is just a debug helper: probably wont be needed.
  logCentralValue() {
    console.log(this.central_value);
  }

  draw() {
    ctx.drawImage(this.image, this.posx, this.posy, this.width, this.height);    
  }

  updateAge() {
    // For now, just using update calls, may change to seconds later.
    this.ageInUpdates += 1;
  }

  update() {
    // this.logCentralValue();
    this.move();
    this.deletionCheck();
    this.draw();
    this.updateAge();
  }

  shouldDelete: boolean = false;

  deletionCheck() {
    if(this.posy > canvas_height) {
      this.shouldDelete = true;
    }
  }
  createExplosionParticles(): void {
    console.log(`FILLER: explosion particles for ${this.constructor.name} created here ${this.posx}, % ${this.posy}.`)
    //TODO: Actually create the particles here instead of just logging a message.
  }
}

class BoxItemSpawner {
  intervalId: number;
  spawnInterval: number;
  minSize: number;
  maxSize: number;
  boxItemsArray: BoxItem[];
  central_value: number;
  minSpawnInterval: number;
  totalSpawned: number;
  spawnedSinceAdjustment: number;
  spawnsRequiredToAdjust: number;

  constructor(spawnInterval: number, minSize: number, maxSize: number, boxItemsArray: BoxItem[]) {
    this.spawnInterval = spawnInterval;
    this.minSize = minSize;
    this.maxSize = maxSize;
    this.boxItemsArray = boxItemsArray;
    this.central_value = -2;
    this.intervalId = window.setInterval(() => this.spawnBoxItem(), this.spawnInterval);
    this.minSpawnInterval = 500;
    this.totalSpawned = 0;
    this.spawnedSinceAdjustment = 0;
    this.spawnsRequiredToAdjust = 10;
  }

  setSpawnInterval(newSpawnInterval: number) {
    this.spawnInterval = newSpawnInterval;
    clearInterval(this.intervalId);
    this.intervalId = window.setInterval(() => this.spawnBoxItem(), this.spawnInterval);
  }

  adjustSpwanInterval(milliseconds: number) {
    this.setSpawnInterval(this.spawnInterval + milliseconds)
    if (this.spawnInterval < this.minSpawnInterval) {
      this.setSpawnInterval(this.minSpawnInterval);
    }
  }

  spawnBoxItem() {
    const width = Math.random() * (this.maxSize - this.minSize) + this.minSize;
    const height = width; // Assuming box items are square
    const posX = Math.random() * (canvas_width - this.maxSize);
    const posY = -height;
    const central_value = Math.ceil(Math.random() * 10)
    const boxItem = new BoxItem(posX, posY, width, height, central_value);
    this.boxItemsArray.push(boxItem);
    this.incrementSpawnCount();
    if (this.spawnedSinceAdjustment == this.spawnsRequiredToAdjust) {
      this.adjustSpwanInterval(-250);
      this.spawnedSinceAdjustment = 0;
      console.log("INFO:==> Spaawn interval updated.  New interval: ", this.spawnInterval);
    }
  }

  incrementSpawnCount() {
    this.totalSpawned += 1;
    this.spawnedSinceAdjustment += 1;
  }

  stopSpawning() {
    window.clearInterval(this.intervalId);
  }
}

enum MoveKey {
  Up = "ArrowUp",
  Left = "ArrowLeft",
  Right = "ArrowRight",
  Down = "ArrowDown",
}

interface HasTargetTracker {
  targetTracker: TargetTracker;
}

interface HasControls {
  handleInput(): void;
}

class Player extends GameEntity implements Movable, HasTargetTracker, HasControls {
  velx: number;
  vely: number;
  score: number;
  goodCollected: number;
  badCollected: number;
  targetTracker: TargetTracker;
  input: PlayerInput;
  ageInUpdatesCollected: number;
  oldScore: number;
  scoreChangeOccurances: number;
  targetsWereChanged: boolean;
  collectionsBeforeTargetChange: number;

  constructor(targetTracker: TargetTracker, input: PlayerInput) {
    super();
    this.velx = 0;
    this.vely = 0;
    this.score = 0;
    this.goodCollected = 0;
    this.badCollected = 0;
    this.targetTracker = targetTracker;
    this.input = input;
    this.ageInUpdatesCollected = 0;
    this.oldScore = 0;
    this.scoreChangeOccurances = 0;
    this.targetsWereChanged = false;
    this.collectionsBeforeTargetChange = 5;
  }

  collectBoxItem(boxItem: BoxItem) {   
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
      let isMatching: boolean;
      isMatching = this.targetTracker.activeTargetValues.includes(boxItem.central_value);
      isMatching ? this.goodCollected += 1 : this.badCollected += 1;

      // Update score --> Gain points for a mtach, lose points otherwise.
      let scorePerMatch = 100;
      isMatching ? this.score += scorePerMatch : this.score -= scorePerMatch;
      this.ageInUpdatesCollected += boxItem.ageInUpdates;
      console.log("INFO:==> Score is now: ", this.score, "Total age collected: ", this.ageInUpdatesCollected);
    }
  }

  move() {
    const maxSpeed = 5;

    this.velx = this.input.horizontalInput * maxSpeed;
    this.vely = this.input.verticalInput * maxSpeed;

    this.posx += this.velx;
    this.posy += this.vely;

    // Keep the player within the canvas bounds
    if (this.posx < 0) {
      this.posx = 0;
    } else if (this.posx + this.width > canvas_width) {
      this.posx = canvas_width - this.width;
    }
    if (this.posy < 0) {
      this.posy = 0;
    } else if (this.posy + this.height > canvas_height) {
      this.posy = canvas_height - this.height;
    }
  }

  handleInput() {
    if (this.input.isKeyPressed(MoveKey.Left) || this.input.isKeyPressed(MoveKey.Right)) {
      this.input.horizontalInput = this.input.isKeyPressed(MoveKey.Left) ? -1 : 1;
    } else {
      this.input.horizontalInput = 0;
    }

    if (this.input.isKeyPressed(MoveKey.Up) || this.input.isKeyPressed(MoveKey.Down)) {
      this.input.verticalInput = this.input.isKeyPressed(MoveKey.Up) ? -1 : 1;
    } else {
      this.input.verticalInput = 0;
    }
  }

  update() {
    this.handleInput();
    this.move();
    this.draw();
  }
}

class PlayerInput {
  keyState: { [key: string]: boolean };
  horizontalInput: number;
  verticalInput: number;

  constructor() {
    this.keyState = {};
    this.setupInput();
    this.horizontalInput = 0;
    this.verticalInput = 0;
  }

  setupInput() {
    window.addEventListener("keydown", (event) => {
      this.keyState[event.key] = true;
    });

    window.addEventListener("keyup", (event) => {
      this.keyState[event.key] = false;
    });
  }

  isKeyPressed(key: MoveKey): boolean {
    return this.keyState[key];
  }
}

function drawScore(ctx: CanvasRenderingContext2D) {
  ctx.font = "40px Arial";
  ctx.fillText("Score: ", standardPadding, 50);
  ctx.fillText(player.score.toString(), standardPadding, 100);
}

function drawStage(ctx: CanvasRenderingContext2D) {
  ctx.font = "40px Arial";
  const stageText = `${gameStage} / ${finalStage} ${emojis.stage.visual}`
  const stageX = ctx.canvas.width - ctx.measureText(stageText).width - standardPadding;
  ctx.fillText(`${stageText}`, stageX, 50);
}

function drawPointGoal(ctx: CanvasRenderingContext2D) {
  ctx.font = "40px Arial";
  const goalText = `${pointGoal} ${emojis.goal.visual}`
  const goalX = ctx.canvas.width - ctx.measureText(goalText).width - standardPadding;
  ctx.fillText(`${goalText}`, goalX, 100);
}

function numberToKanji(value: number): string {
  // Font source:
  // https://zhidao.baidu.com/question/1242333478685809179.html
  // 一二三四五六七八九十
  let kanjiString = "一二三四五六七八九十";
  if (value <= 0 || value > kanjiString.length) {
    console.log(`Unsupported entry provided:  ${value} could not be converted to kanji.`)
  }
  return kanjiString.charAt(value - 1);
}

function drawTargetValues(ctx: CanvasRenderingContext2D, player: Player, { show = true }: { show?: boolean } = {}) {
  if (show === true) {
    ctx.font = "40px Arial";
    const kanjiTargets = player.targetTracker.activeTargetValues.map(numberToKanji);
    ctx.fillText("[" + kanjiTargets + "]", standardPadding, 150);
  }
}

function drawTargetExpression(ctx: CanvasRenderingContext2D, player: Player) {
  ctx.font = "40px Arial";
  let activeTargetExpression = player.targetTracker.activeTargetValues.toString();
  // using 'Direct Hit' emoji (Unicode 6.0; 2010) in place of "Target(s)" for conciseness'
  ctx.fillText("🎯 " + activeTargetExpression, standardPadding, 200);
}
function drawGoodAndBadCount(ctx: CanvasRenderingContext2D, player: Player) {
  ctx.font = "40px Arial";

  const goodText = `${emojis.good.visual} ${player.goodCollected}`
  const badText = `${player.badCollected} ${emojis.bad.visual}`

  const goodTextX = standardPadding;
  const goodTextY = 580;
  ctx.fillText(goodText, goodTextX, goodTextY);

  const badTextX = ctx.canvas.width - ctx.measureText(badText).width - standardPadding;
  const badTextY = 580;
  ctx.fillText(badText, badTextX, badTextY);
}
// Set up the game canvas
const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const canvas_width = 500;
const canvas_height = 800;
canvas.width = canvas_width;
canvas.height = canvas_height;
// const project_root_folder_address = "./block_catcher/"
// const kanji_path = project_root_folder_address + "src/resources/images/kanji/";
const kanji_path = "./src/resources/images/kanji/";

if (!ctx) {
  throw new Error("Failed to get 2D rendering context for canvas");
}

//TODO: Improve the layout of these buttons and in doing so, avoid "magic number" position values.
//>>>>>> Start new game
// Adding a button to restart the game.
// Create a button element
const button = document.createElement('button');
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
const symbolDisplayToggleButtonElement = document.createElement("button");
symbolDisplayToggleButtonElement.textContent = "Show/Hide Key";
symbolDisplayToggleButtonElement.style.position = "absolute";
symbolDisplayToggleButtonElement.style.top = "50px";
symbolDisplayToggleButtonElement.style.left = "10px";

// Add event listener to the button
symbolDisplayToggleButtonElement.addEventListener("click", toggleKeyShown);

// Append the button to the document body
document.body.appendChild(symbolDisplayToggleButtonElement);
//>>>>>>>

let player: Player;
let box_items: BoxItem[] = [];
let spawner: BoxItemSpawner;

function explodeAllBoxItems() {
  box_items.forEach((item) => item.createExplosionParticles());
  box_items = [];
}

// Game initialization function
function initializeGame() {
  console.log(`Beginning stage ${gameStage}`)
  const input = new PlayerInput();
  const targetTracker = new TargetTracker();

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
  box_items.forEach((item) => item.update());

  //Trigger box collection
  box_items.forEach((item) => item.collectOnTouch(player));

  //Re-sort targets
  player.targetTracker.sortTargets();        

  // Delete any box items that went off-screen.
  // Traversing in reverse order to avoid index shifting.
  for (let i = box_items.length - 1; i >= 0; i--) {
    if (box_items[i].shouldDelete) {
      box_items.splice(i, 1);
    }
  }
  if (player.score >= pointGoal) {
    beginNextStage(spawner);
  }
}

let gameLoopId: number;

function startGameLoop() {
  cancelAnimationFrame(gameLoopId);
  gameLoopId = requestAnimationFrame(updateLoop);
}

// Define the fixed time step for the game (in milliseconds)
const fixedTimeStep = 16; // 60 frames per second (approximately)

let previousTime = performance.now();
let accumulatedTime = 0;

function updateLoop(currentTime: number) {
  const deltaTime = currentTime - previousTime;
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

function beginNextStage(spawner: BoxItemSpawner) {
  if (gameStage === finalStage) {
    if (victoryShouldBeDisplayed === false) {
      triggerVictory(spawner);
    }
  } else {
    gameStage += 1;
    initializeGame();
  }
}

function displayVictoryMessage() {
  if (victoryShouldBeDisplayed === false) {
    // Create a splash message element
    const splashMessage = document.createElement("div");
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
  const splashMessage = document.getElementById("victory-message");
  if (splashMessage) {
    splashMessage.remove();
  }
  victoryShouldBeDisplayed = false;
}

function triggerVictory(spawner: BoxItemSpawner) {
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

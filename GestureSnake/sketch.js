// ==========================================
// SNAKE GAME + TEACHABLE MACHINE GESTURES
// ==========================================

// ---------------- GAME SETTINGS ----------------
let cameraX = 10;
let cameraY = 10;
let cameraW = 160;
let cameraH = 120;
let gridWidth = 30;
let gridHeight = 30;

let gameStarted = false;

let startingSegments = 10;

let xStart = 0;
let yStart = 15;

let startDirection = "right";
let direction = startDirection;

let segments = [];

let score = 0;
let highScore;

let fruit;


// ==========================================
// TEACHABLE MACHINE
// ==========================================

const MODEL_URL =
  "https://teachablemachine.withgoogle.com/models/29p3EY1di/";

// IMPORTANT:
// Do NOT call this variable "model"
// because p5.js already has a model() function.
let tmModel;

let webcam;

let currentGesture = "Loading...";
let confidence = 0;

let lastGesture = "";

// Prevent multiple predictions
// from running at the same time.
let isPredicting = false;

let gestureCooldown = 0;


// ==========================================
// SETUP
// ==========================================

function setup() {

  createCanvas(500, 500);

  frameRate(10);

  textAlign(CENTER, CENTER);
  textSize(2);

  highScore = getItem("high score");

  if (highScore === null) {
    highScore = 0;
  }

  // Load Teachable Machine
  loadGestureModel();

  describe(
    "A Snake game controlled using hand gestures."
  );
}


// ==========================================
// LOAD TEACHABLE MACHINE MODEL
// ==========================================

async function loadGestureModel() {

  try {

    console.log(
      "Loading Teachable Machine model..."
    );

    const modelURL =
      MODEL_URL + "model.json";

    const metadataURL =
      MODEL_URL + "metadata.json";


    // Load model
    tmModel = await tmImage.load(
      modelURL,
      metadataURL
    );

    console.log(
      "Teachable Machine model loaded!"
    );


    // Create webcam
    webcam = new tmImage.Webcam(
      160,
      120,
      true
    );


    await webcam.setup();

    await webcam.play();


    console.log(
      "Webcam started!"
    );

    currentGesture =
      "Show a gesture";


  } catch (error) {

    console.error(
      "Teachable Machine error:",
      error
    );

    currentGesture =
      "Camera Error";
  }
}


// ==========================================
// DRAW
// ==========================================

function draw() {
  background(0);

  // Run gesture recognition
  if (
    tmModel &&
    webcam &&
    webcam.canvas &&
    !isPredicting
  ) {
    predictGesture();
  }

  // ---------------- GAME ----------------

  push();

  scale(
    width / gridWidth,
    height / gridHeight
  );

  if (!gameStarted) {
    showStartScreen();
  } else {
    translate(0.5, 0.5);

    showFruit();
    showSegments();
    updateSegments();
    checkForCollision();
    checkForFruit();
  }

  pop();


  // ---------------- CAMERA PANEL ----------------

  drawCameraPanel();


  // ---------------- HUD ----------------

  drawGestureHUD();
}
function drawCameraPanel() {

  // Camera panel background
  noStroke();

  fill(15);

  rect(
    cameraX - 4,
    cameraY - 4,
    cameraW + 8,
    cameraH + 8,
    8
  );


  // Camera feed
  if (
    webcam &&
    webcam.canvas
  ) {

    image(
      webcam.canvas,
      cameraX,
      cameraY,
      cameraW,
      cameraH
    );

  } else {

    fill(40);

    rect(
      cameraX,
      cameraY,
      cameraW,
      cameraH,
      6
    );

    fill(255);

    textAlign(
      CENTER,
      CENTER
    );

    textSize(14);

    text(
      "Camera loading...",
      cameraX + cameraW / 2,
      cameraY + cameraH / 2
    );
  }


  // Camera border
  noFill();

  stroke(
    96,
    255,
    64
  );

  strokeWeight(2);

  rect(
    cameraX,
    cameraY,
    cameraW,
    cameraH,
    6
  );


  // Reset stroke
  strokeWeight(1);
}


function drawGestureHUD() {

  // Position beside camera
  let hudX = 185;
  let hudY = 15;


  // Gesture title
  noStroke();

  fill(255);

  textAlign(
    LEFT,
    TOP
  );

  textSize(14);

  text(
    "GESTURE",
    hudX,
    hudY
  );


  // Detected gesture
  textSize(22);

  fill(
    96,
    255,
    64
  );

  text(
    currentGesture,
    hudX,
    hudY + 22
  );


  // Confidence
  textSize(13);

  fill(255);

  text(
    "Confidence: " +
      (confidence * 100).toFixed(0) +
      "%",
    hudX,
    hudY + 52
  );


  // Current direction
  text(
    "Direction: " +
      direction.toUpperCase(),
    hudX,
    hudY + 75
  );


  // Score
  text(
    "Score: " +
      score,
    hudX,
    hudY + 98
  );
}


  // Scale game
  scale(
    width / gridWidth,
    height / gridHeight
  );


  if (!gameStarted) {

    showStartScreen();

  } else {

    translate(
      0.5,
      0.5
    );

    showFruit();

    showSegments();

    updateSegments();

    checkForCollision();

    checkForFruit();
  }


  // Reset canvas transformation
  resetMatrix();


  // ========================================
  // WEBCAM
  // ========================================

  if (
    webcam &&
    webcam.canvas
  ) {

    image(
      webcam.canvas,
      10,
      10,
      160,
      120
    );
  }


  // ========================================
  // HUD
  // ========================================

  fill(255);

  textAlign(
    LEFT,
    TOP
  );

  textSize(14);


  text(
    "Gesture: " +
      currentGesture,
    180,
    20
  );


  text(
    "Confidence: " +
      (confidence * 100).toFixed(0) +
      "%",
    180,
    42
  );


  text(
    "Score: " +
      score,
    180,
    64
  );



// ==========================================
// GESTURE PREDICTION
// ==========================================

async function predictGesture() {

  // Safety checks
  if (
    !tmModel ||
    !webcam ||
    !webcam.canvas ||
    isPredicting
  ) {

    return;
  }


  // Lock prediction
  isPredicting = true;


  try {

    // Update webcam
    webcam.update();


    // Get predictions
    const predictions =
      await tmModel.predict(
        webcam.canvas
      );


    // Find best prediction
    let bestPrediction =
      predictions[0];


    for (
      let i = 1;
      i < predictions.length;
      i++
    ) {

      if (
        predictions[i].probability >
        bestPrediction.probability
      ) {

        bestPrediction =
          predictions[i];
      }
    }


    // Store prediction
    currentGesture =
      bestPrediction.className;

    confidence =
      bestPrediction.probability;


    // ======================================
    // CONFIDENCE FILTER
    // ======================================

    // Ignore uncertain predictions
    if (
      confidence < 0.85
    ) {

      return;
    }


    // ======================================
    // COOLDOWN
    // ======================================

    if (
      frameCount -
      gestureCooldown < 5
    ) {

      return;
    }


    // Convert label to lowercase
    const gesture =
      currentGesture
        .toLowerCase()
        .trim();


    // Don't process the same gesture
    // over and over
    if (
      gesture === lastGesture
    ) {

      return;
    }


    // Process gesture
    handleGesture(
      gesture
    );


    lastGesture =
      gesture;

    gestureCooldown =
      frameCount;


  } catch (error) {

    console.error(
      "Prediction error:",
      error
    );


  } finally {

    // Allow next prediction
    isPredicting = false;
  }
}


// ==========================================
// HANDLE GESTURE
// ==========================================

function handleGesture(gesture) {

  console.log(
    "Detected gesture:",
    gesture
  );


  // LEFT
  if (
    gesture === "left"
  ) {

    if (
      direction !== "right"
    ) {

      direction = "left";
    }
  }


  // RIGHT
  else if (
    gesture === "right"
  ) {

    if (
      direction !== "left"
    ) {

      direction = "right";
    }
  }


  // UP
  else if (
    gesture === "up"
  ) {

    if (
      direction !== "down"
    ) {

      direction = "up";
    }
  }


  // DOWN
  else if (
    gesture === "down"
  ) {

    if (
      direction !== "up"
    ) {

      direction = "down";
    }
  }
}


// ==========================================
// START SCREEN
// ==========================================

function showStartScreen() {

  noStroke();

  fill(32);

  rect(
    2,
    gridHeight / 2 - 5,
    gridWidth - 4,
    10,
    2
  );


  fill(255);

  textAlign(
    CENTER,
    CENTER
  );

  textSize(2);


  text(
    "Click to play.\n" +
    "Use hand gestures to move.",
    gridWidth / 2,
    gridHeight / 2
  );
}


// ==========================================
// START GAME
// ==========================================

function mousePressed() {

  if (
    gameStarted === false
  ) {

    startGame();
  }
}


function startGame() {

  // Create fruit
  updateFruitCoordinates();


  // Clear snake
  segments = [];


  // Create starting snake
  for (
    let x = xStart;
    x <
    xStart + startingSegments;
    x++
  ) {

    let segmentPosition =
      createVector(
        x,
        yStart
      );


    segments.unshift(
      segmentPosition
    );
  }


  // Reset direction
  direction =
    startDirection;


  score = 0;

  gameStarted = true;


  // Reset gesture
  lastGesture = "";

  gestureCooldown =
    frameCount;
}


// ==========================================
// FRUIT
// ==========================================

function showFruit() {

  stroke(
    255,
    64,
    32
  );


  point(
    fruit.x,
    fruit.y
  );
}


// ==========================================
// SNAKE
// ==========================================

function showSegments() {

  noFill();

  stroke(
    96,
    255,
    64
  );


  beginShape();


  for (
    let segment of segments
  ) {

    vertex(
      segment.x,
      segment.y
    );
  }


  endShape();
}


// ==========================================
// UPDATE SNAKE
// ==========================================

function updateSegments() {

  // Remove tail
  segments.pop();


  // Copy head
  let head =
    segments[0].copy();


  // Add new head
  segments.unshift(
    head
  );


  // Move head
  switch (direction) {

    case "right":

      head.x++;

      break;


    case "left":

      head.x--;

      break;


    case "up":

      head.y--;

      break;


    case "down":

      head.y++;

      break;
  }
}


// ==========================================
// COLLISION
// ==========================================

function checkForCollision() {

  let head =
    segments[0];


  if (

    head.x >= gridWidth ||

    head.x < 0 ||

    head.y >= gridHeight ||

    head.y < 0 ||

    selfColliding()

  ) {

    gameOver();
  }
}


// ==========================================
// GAME OVER
// ==========================================

function gameOver() {

  noStroke();

  fill(32);


  rect(
    2,
    gridHeight / 2 - 5,
    gridWidth - 4,
    12,
    2
  );


  fill(255);


  highScore =
    max(
      score,
      highScore
    );


  storeItem(
    "high score",
    highScore
  );


  textAlign(
    CENTER,
    CENTER
  );


  textSize(2);


  text(
    `Game over!
Your score: ${score}
High score: ${highScore}
Click to play again.`,
    gridWidth / 2,
    gridHeight / 2
  );


  gameStarted = false;
}


// ==========================================
// SELF COLLISION
// ==========================================

function selfColliding() {

  let head =
    segments[0];


  let segmentsAfterHead =
    segments.slice(1);


  for (
    let segment of segmentsAfterHead
  ) {

    if (
      segment.equals(head)
    ) {

      return true;
    }
  }


  return false;
}


// ==========================================
// FRUIT COLLISION
// ==========================================

function checkForFruit() {

  let head =
    segments[0];


  if (
    head.equals(fruit)
  ) {

    score++;


    // Duplicate tail
    let tail =
      segments[
        segments.length - 1
      ];


    let newSegment =
      tail.copy();


    segments.push(
      newSegment
    );


    // New fruit
    updateFruitCoordinates();
  }
}


// ==========================================
// RANDOM FRUIT
// ==========================================

function updateFruitCoordinates() {

  let x =
    floor(
      random(gridWidth)
    );


  let y =
    floor(
      random(gridHeight)
    );


  fruit =
    createVector(
      x,
      y
    );
}


// ==========================================
// KEYBOARD BACKUP
// ==========================================

function keyPressed() {

  // LEFT
  if (
    keyCode === LEFT_ARROW &&
    direction !== "right"
  ) {

    direction = "left";
  }


  // RIGHT
  if (
    keyCode === RIGHT_ARROW &&
    direction !== "left"
  ) {

    direction = "right";
  }


  // UP
  if (
    keyCode === UP_ARROW &&
    direction !== "down"
  ) {

    direction = "up";
  }


  // DOWN
  if (
    keyCode === DOWN_ARROW &&
    direction !== "up"
  ) {

    direction = "down";
  }
}
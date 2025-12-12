// CS 30 Major Project
// Jiya Khalsa Bangar
// 17 November,Tuesday
//

// Sources:
// https://mediapipe.readthedocs.io/en/latest/solutions/hands.html (Mediappipe Library Download)
// https://www.w3schools.com/graphics/canvas_drawing.asp (creating a canvas syntax)
// https://www.youtube.com/watch?v=vfNHdVbE-l4 (Madipipe Library intro)
// https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/web_js (Hand Landmarks reference)


// Extra for Experts:
// - describe what you did to take this project "above and beyond"

// grabs elements by using this function which is used to call an already present HTML element
const video = document.getElementById("webcam");

//Webcam setup (looked up and not written by me)
navigator.mediaDevices.getUserMedia({ video: true })
  .then(function(stream) {
    video.srcObject = stream;
  })
  .catch(function(error) {
    console.log("Webcam error:", error);
  });

//canvas setup
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// I used these to help with sizing later
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// make circle
class Circle {
  constructor(x, y, color, radius) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = radius;
  }
  
  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); //makes the circle that the user will manipulate
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}

// creates letters
class LetterManager {
  constructor() {
    this.letters = [];
    //automatically adjusts radius based on the canvas size
    this.circleRadius = Math.min(canvasWidth, canvasHeight) / 4;
  }

  setLetters(list) {
    this.letters = list;
  }

  drawLetters(centerX, centerY) {
    let total = this.letters.length;
    if (total === 0) {
      return;
    }

    let angleStep = Math.PI * 2 / total;

    for (let i = 0; i < total; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * this.circleRadius;
      const y = centerY + Math.sin(angle) * this.circleRadius;

      ctx.font = "bold 26px Courier New";
      // Because we are presenting with the lights turned off I chose white
      ctx.fillStyle = "white";
      ctx.fillText(this.letters[i], x, y);
    }
  }
}

class App {
  constructor() {
    // creates a static circle on the left side of the canvas for display
    const padding = 215; // space from the right edge
    this.centerX = canvasWidth - padding;
    this.centerY = canvasHeight / 2;
    this.LetterManager = new LetterManager();
  }

  setLetters(list) {
    this.LetterManager.setLetters(list);
  }

  drawEverything() {
    //clears the canvas before drawing everything
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.LetterManager.drawLetters(this.centerX, this.centerY);
  }
}

// calling the app instance
let app = new App();

//added the letters to be covering the circle
app.setLetters([
  "A","B","C","D","E","F","G",
  "H","I","J","K","L","M","N",
  "O","P","Q","R","S","T","U",
  "V","W","X","Y","Z"
]);

function update() {
  app.drawEverything();
  // this is a function that runs just before the screen so that it helps before redrawing the screen which allows a smoother transition (meaning minimum to no glitch)
  requestAnimationFrame(update);
}

update();

// Load MediaPipe Hands model (not written by me(altered), basic set up, had to look up)
const model = window.handPoseDetection.SupportedModels.MediaPipeHands;
const detectorConfig = {
  runtime: "mediapipe",
  //URL where model files are hosted
  solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/hands",
  //only using 1 hand in tis project
  maxHands: 1,
  //gives full accurarcy vs. "lite" which is faster but less accurate
  modelType: "full",
};

// creating a detector
detector = window.handPoseDetection.createDetector(model, detectorConfig);

// Runs hand detection on current video frame
const hands = detector.estimateHands(video);

// Transforms hand landmarks to canvas coordinates
const handPositions = hands.map(hand);


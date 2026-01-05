// CS 30 Major Project
// Jiya Khalsa Bangar
// Hand Gesture Interface
// 17 November, Tuesday

// Sources:
// https://mediapipe.readthedocs.io/en/latest/solutions/hands.html (Mediappipe Library Download)
// https://www.w3schools.com/graphics/canvas_drawing.asp (creating a canvas syntax)
// https://www.youtube.com/watch?v=vfNHdVbE-l4 (Madipipe Library intro)
// https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/web_js (Hand Landmarks reference)
// https://codepen.io/mediapipe-preview/pen/gOKBGPN (Hand Landmark Demos using HTML, CSS, and Javascript (specifically webcam))


// Extra for Experts:
// - describe what you did to take this project "above and beyond"

// grabs HTML elements using their id 
// grabs elements by using this function which is used to call an already present HTML element
const video = document.getElementById("webcam");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// I used these variables to help with sizing and scaling later
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// webcam setup (looked up and adapted, not written fully by me)
// this part allows the browser to ask permission to use the webcam
navigator.mediaDevices.getUserMedia({ video: true })
  .then(function (stream) {
    video.srcObject = stream;
  })
  .catch(function (error) {
    console.log("Webcam error:", error);
  });

// these variables store the hand detection results
// set to null(the variable exists but it's currrently empty therefore no value) because there are no hand results yet whern the program starts
let handResults = null;

// MediaPipe Hands setup
// this code loads the AI model that detects hands
// referenced from MediaPipe documentation and examples
const hands = new Hands({
  locateFile: function (file) {
    return "https://cdn.jsdelivr.net/npm/@mediapipe/hands/" + file;
  }
});

// setting options for the hand tracking
hands.setOptions({
  maxNumHands: 1,   // only track one hand 
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

// this function runs every time MediaPipe finds hands
hands.onResults(function (results) {
  handResults = results;
});

// helper function to check if the finger is extended or not (*** can change the format to just landmarks based on readability of the code ***)
function isFingerOpen(TipIndex, BaseIndex) {
  const TipY = landmarks[TipIndex].y;
  const BaseY = landmarks[BaseIndex].y;
  return TipY < BaseY;  // checks if finger is open
}

// camera helper (MediaPipe utility)
// this sends webcam frames to the hand detector
// referenced and simplified from MediaPipe examples (modified by me)
const camera = new Camera(video, {
  onFrame: async function () {
    await hands.send({ image: video });
  },
  width: canvasWidth,
  height: canvasHeight
});

// start the webcam + hand tracking
camera.start();

// CLASS: LetterManager (displays letters on the alphabet wheel)
// handles storing and drawing letters in a circle
class LetterManager {
  constructor() {
    this.letters = [];
    this.circleRadius = Math.min(canvasWidth, canvasHeight) / 4;
  }

  setLetters(list) {
    this.letters = list;
  }

  drawLetters(centerX, centerY) {
    let total = this.letters.length;
    if (total === 0) {
      // empty return because the function should stop running when there are no letters as it dosn't need to send back any values
      return;
    }

    let angleStep = Math.PI * 2 / total;

    for (let i = 0; i < total; i++) {
      let angle = i * angleStep - Math.PI / 2;
      let x = centerX + Math.cos(angle) * this.circleRadius;
      let y = centerY + Math.sin(angle) * this.circleRadius;

      ctx.font = "bold 26px Courier New";
      ctx.fillStyle = "white";
      ctx.fillText(this.letters[i], x, y);
    }
  }
}

// Class: App (alphabet wheel)
// controls where the alphabet wheel is drawn
class App {
  constructor() {
    const padding = 215; // space from right side
    this.centerX = canvasWidth - padding;
    this.centerY = canvasHeight / 2;
    this.letterManager = new LetterManager();
  }

  setLetters(list) {
    this.letterManager.setLetters(list);
  }

  drawEverything() {
    this.letterManager.drawLetters(this.centerX, this.centerY);
  }
}

// creates app and load alphabet
let app = new App();

// added the letters to be covering the circle
app.setLetters([
  "A","B","C","D","E","F","G",
  "H","I","J","K","L","M","N",
  "O","P","Q","R","S","T","U",
  "V","W","X","Y","Z"
]);


// requestAnimationFrame function is used for smooth animation and better refresh rate
function draw() {
  // draw the webcam image onto the canvas
  ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);

  // draw alphabet wheel
  app.drawEverything();

  // draw red dots where the hand landmarks are
  drawHandLandmarks();

  // keeps looping before the next screen refresh
  requestAnimationFrame(draw);
}

// draws hand landmarks as red circles via nested loops and arrays
function drawHandLandmarks() {
  // if no hands are detected, stop the function
  if (!handResults || !handResults.multiHandLandmarks) {
    return;
  }

  // fills red colored dots for the hand landmarks
  ctx.fillStyle = "red";

  // loop through each detected hand
  for (let i = 0; i < handResults.multiHandLandmarks.length; i++) {
    let hand = handResults.multiHandLandmarks[i];

    // loop through the 21 hand points
    for (let j = 0; j < hand.length; j++) {
      let x = hand[j].x * canvasWidth;
      let y = hand[j].y * canvasHeight;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// start drawing once the webcam has loaded
video.onloadeddata = function () {
  draw();
};

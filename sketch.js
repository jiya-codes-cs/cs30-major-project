// CS 30 Major Project
// Jiya Khalsa Bangar
// 17 November,Tuesday
//

// Sources:
// https://mediapipe.readthedocs.io/en/latest/solutions/hands.html (Mediappipe Library Download)
// https://www.w3schools.com/graphics/canvas_drawing.asp (creating a canvas syntax)
// https://www.youtube.com/watch?v=vfNHdVbE-l4 (Madipipe Library intro)
// https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/web_js (Hand Landmarks reference)
// https://codepen.io/mediapipe-preview/pen/gOKBGPN (Hand Landmark Demos using HTML, CSS, and Javascript (specifically webcam))


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


// these variables store the AI model and results
let handLandmarker = null;
let lastVideoTime = -1;
let handResults = null;

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
  ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight); // draw webcam onto canvas

  detectHands();        // detect hand landmarks
  app.drawEverything(); // draw alphabet circle
  drawHandPoints();     // draw hand on canvas

  // this is a function that runs just before the screen so that it helps before redrawing the screen which allows a smoother transition (meaning minimum to no glitch)
  requestAnimationFrame(update);
}

// variables declared
const FilesetResolver = window.FilesetResolver;
const HandLandmarker = window.HandLandmarker;

// load the MediaPipe hand model (not written by me, required library setup)
// MediaPipe requires a pre-trained model file to recognize hands. This code loads it before detection starts.
async function loadHandModel() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );

  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
    },
    runningMode: "VIDEO",
    numHands: 1
  });
}

// start loading the model
loadHandModel();

function detectHands() {
  if (handResults && handResults.landmarks) {
    console.log("Hand detected!");
  }
  if (handLandmarker === null) {
    return;
  }

  if (video.currentTime === lastVideoTime) {
    return;
  }

  lastVideoTime = video.currentTime;
  handResults = handLandmarker.detectForVideo(video, performance.now());
}

function drawHandPoints() {
  if (!handResults || !handResults.landmarks) {
    return;
  }

  ctx.fillStyle = "red";

  for (let i = 0; i < handResults.landmarks.length; i++) {
    let hand = handResults.landmarks[i];

    for (let j = 0; j < hand.length; j++) {
      let x = hand[j].x * canvasWidth;
      let y = hand[j].y * canvasHeight;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

video.onloadeddata = function () {
  update();
};

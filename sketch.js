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
let wheelRotation = 0; // this stores the current turn of the wheel

// MediaPipe Hands setup
// this code loads the AI model that detects hands
// referenced from MediaPipe documentation and examples
const hands = new Hands({
  locateFile: function (file) {
    return "https://cdn.jsdelivr.net/npm/@mediapipe/hands/" + file;
  }
});

// helper function to check if the finger is extended or not
function isFingerOpen(landmarks ,tipIndex, baseIndex) {
  // on computer small y means higher on the screen
  return landmarks[tipIndex].y < landmarks[baseIndex].y;  // checks if finger is open
}

// setting options for the hand tracking
hands.setOptions({
  maxNumHands: 1,     // only track one hand 
  modelComplexity: 0, // 0 is fast, 1 is balanced
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

// this function runs every time MediaPipe finds hands
hands.onResults(function (results) {
  handResults = results; // keeps the original line

  // checks if hand is on screen 
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];

    // identifies all fingers state 
    // we check the (tip coordinate) for accurate detection
    // added a small buffer to make the detection less vague
    const indexOpen = landmarks[8].y < landmarks[6].y - 0.02;      // index finger
    const middleOpen = landmarks[12].y < landmarks[10].y - 0.02;   // middle finger
    const ringOpen = landmarks[16].y < landmarks[14].y;;           // ring finger
    const pinkyOpen = landmarks[20].y < landmarks[18].y;;          // pinky finger

    // thumb is special in this case 
    // we will do a horizontal check to confirm that while index and middle are open it is open too
    const thumbOpen = Math.abs(landmarks[4].x - landmarks[2].x) > 0.08;

    // rotation speed that can be adjusted (decrease by 0.01 to go slower)
    let rotationSpeed = 0.02;

    // Now we assign actions if certain fingers are open
    if (indexOpen && thumbOpen && !middleOpen && !ringOpen && !pinkyOpen) {
      // rotation from A to M (use -= to rotate counter-clockwise)
      wheelRotation -= rotationSpeed;
    }
    else if (indexOpen && middleOpen && thumbOpen && !ringOpen && !pinkyOpen) {
      // rotation from N to Z (use += to rotate clock wise)
      wheelRotation += rotationSpeed;
    }
    // else {
    //   console.log("Checking Hand...");
    // }
  }
});

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

    // this will help us find out how far away do the letters have to sit from the wheel
    let radius = 200;

    let angleStep = Math.PI * 2 / total;

    for (let i = 0; i < total; i++) {
      // adding wheel rotation here to make the letters move
      let angle = i * angleStep - Math.PI / 2 + wheelRotation;

      let x = centerX + Math.cos(angle) * radius;
      let y = centerY + Math.sin(angle) * radius;

      ctx.font = "bold 35px Arial";
      ctx.shadowColor = "black";
      ctx.shadowBlur = 7;
      ctx.fillStyle = "white";

      // aligned text so it's not "stuck" in the center
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      //draw
      ctx.fillText(this.letters[i], x, y);

      // finds which letter is at the top (-Math.PI * 2)
      let normalizedRotation = wheelRotation % (Math.PI * 2);
      let index = Math.round(-normalizedRotation / angleStep) % total;

      // draw it exactly at centerX, centerY
      ctx.fillText(selectedLetter, centerX, centerY);

      // reset shadow so it doesn't affect other drawings (like red dots)
      ctx.shadowBlur = 0;
    }
  }
}

// Class: App (alphabet wheel)
// controls where the alphabet wheel is drawn
class App {
  constructor() {
    // centering the wheel on the right hand side of the screen
    this.centerX = 750;
    this.centerY = 375; // exactly half of 750 height
    this.letterManager = new LetterManager();
    // reasonable size set for letters
    this.letterManager.circleRadius = 200;
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
  
  // draw only if the landmarks exist
  if (handResults && handResults.multiHandLandmarks) {
    // draw red dots where the hand landmarks are
    drawHandLandmarks();
  }

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
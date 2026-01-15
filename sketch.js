// CS 30 Major Project
// Jiya Khalsa Bangar
// Hand Gesture Interface
// 17 November, Tuesday

// Sources:
// https://mediapipe.readthedocs.io/en/latest/solutions/hands.html (Mediappipe Library Download)
// https://www.w3schools.com/graphics/canvas_drawing.asp (creating a canvas syntax and ctx info)
// https://www.youtube.com/watch?v=vfNHdVbE-l4 (Madipipe Library intro)
// https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/web_js (Hand Landmarks reference)
// https://codepen.io/mediapipe-preview/pen/gOKBGPN (Hand Landmark Demos using HTML, CSS, and Javascript (specifically webcam))
// https://github.com/LintangWisesa/MediaPipe-in-JavaScript/tree/master/js (Mediapipe-in-JavaScript Repo)
// https://github.com/collidingScopes/shape-creator-tutorial/blob/main/main.js (ctx-style-writing Repo)
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects (working-with-objects JS MDN Reference)

// Extra for Experts:
// - help (button) and tutorial (me doing the thing)
// - Implement a multi sensory feedback system by creating a vibration effect when a new letter is selected (Haptic Jiggle Algorithm)

// grabs HTML elements using their id 
// grabs elements by using this function which is used to call an already present HTML element
const video = document.getElementById("webcam");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// I used these variables to help with sizing and scaling later
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

const ROTATION_SPEED = 0.02;    // how fast the wheeel rotates
const PINCH_THRESHOLD = 0.05;   // how close the fingers must be in order to be considered as a "pinch"
const JIGGLE_START = 15;        // at what energy the jiggle starts with 
const JIGGLE_DECAY = 0.8;       // how fast the jiggle slows down by 80%
const MENU_X = 50;              // position of the color menu tab
const MENU_Y = 50;
const MENU_SIZE = 50;
const HOVER_TIME_NEEDED = 2000; // 2 seconds in milliseconds
const MAIN_FONT = "bold 250px Courier";
const WHEEL_FONT = "bold 30px Courier";
const LOCKED_LETTER_FONT = "bold 50px Courier";


// set to null (the variable exists but it's currrently empty therefore no value) because there are no hand results yet whern the program starts
let handResults = null; // this variables store the hand detection results
let wheelRotation = 0; // this stores the current turn of the wheel

let lockedLetter = ""; // this will store the letter we pinched (selected)
let wheelColor = "yellow";
let showColorMenu = false; // keeps track of the drop down box (open/closed)

let hoverStartTime = 0;
let hoveringIndex = -1; // stores which specific squares we're hovering over
let jiggleAmount = 0; // stores how much the letter is shaking currently

// we chose -1 as the starting point because an array can never be a negative index 
// since our A letter is at index 0 we would avoid to start the index from there to play the sound as we only want it to play when it's rotated 
let lastSelectedIndex = -1; // this tracks when the letter actually changes

// Game Logic
let targetWord = "CAKE";
let guessedLetters = ["", "", "", ""]; // stores correct hint like ["C", "", "", "E"]
let feedbackColor = "yellow";
let gameMessage = "Pinch to guess the letter!";


// webcam setup (looked up and adapted, not written fully by me)
// referenced from Mediapipe-in-JavaScript Repo
// this part allows the browser to ask permission to use the webcam
async function setupWebcam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } 
  catch (error) {
    console.log("Webcam error:", error);
  }
}

// calls the function to start it
setupWebcam();

// this will hold our 20 pastel colors (ordered like this in code for better view)
let pastelColors = [
  "lightpink", "lightsalmon", "lemonchiffon", "lightgreen", "paleturquoise",
  "lightblue", "thistle", "mistirose", "lavender", "honeydew",
  "peachpuff", "powderblue", "lightcyan", "bisque", "azure",
  "lightgray", "pink", "wheat", "aquamarine", "cornsilk"
]; 

const ALPHABET = [
  "A","B","C","D","E","F","G",
  "H","I","J","K","L","M","N",
  "O","P","Q","R","S","T","U",
  "V","W","X","Y","Z"
];

// defining the audio file
const gearSound = new Audio("gear-click.mp3");
gearSound.volume = 0.5; 

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
  // on computer the smaller the y value the higher it is on the screen
  return landmarks[tipIndex].y < landmarks[baseIndex].y;  // checks if finger is open
}

// setting options for the hand tracking used objects for better readability of code
// referenced from working-with-objects JS MDN Reference
let mySettings = {
  maxNumHands: 1,     // only track one hand 
  modelComplexity: 0, // 0 is fast, 1 is balanced
  minDetectionConfidence: 0.9,
  minTrackingConfidence: 0.7
};

hands.setOptions(mySettings);

// this function runs every time MediaPipe finds hands
function handleHandResults (results) {
  handResults = results; // keeps the original line

  // checks if hand is on screen 
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];

    // identifies all fingers state 
    // we check the (tip coordinate) for accurate detection
    // added a small buffer to make the detection less vague
    const indexOpen = landmarks[8].y < landmarks[6].y - ROTATION_SPEED;      // index finger
    const middleOpen = landmarks[12].y < landmarks[10].y - ROTATION_SPEED;   // middle finger
    const ringOpen = landmarks[16].y < landmarks[9].y;;                      // ring finger
    const pinkyOpen = landmarks[20].y < landmarks[9].y;;                     // pinky finger

    // thumb is special in this case 
    // we will do a horizontal check to confirm that while index and middle are open it is open too
    const thumbOpen = Math.abs(landmarks[4].x - landmarks[2].x) > 0.08;

    // pinch detection (locking the letter)
    // we do this by checking how far is index tip (4) is from index tip (8)
    let dx = landmarks[4].x - landmarks[8].x;
    let dy = landmarks[4].y - landmarks[8].y; 

    // uses pythagorean theorem to find the total distance between thumb and index finger in pixels
    // asked ai for a couple suggestions (logic without code) on how to implement this and it came up with pythagorean theorem
    let distance = Math.sqrt(dx * dx + dy * dy);

    // Now we assign actions if certain fingers are open
    if (indexOpen && thumbOpen && !middleOpen && !ringOpen && !pinkyOpen) {
      // rotation from A to M (use -= to rotate counter-clockwise)
      wheelRotation -= ROTATION_SPEED;
    }
    else if (indexOpen && middleOpen && thumbOpen && !ringOpen && !pinkyOpen) {
      // rotation from N to Z (use += to rotate clock wise)
      wheelRotation += ROTATION_SPEED;
    }
    
    // pinch fingers logic
    // here, if the distance is less than 0.05 then it means that the fingers are touching "pinching"
    if (distance < PINCH_THRESHOLD) {
      if (!isPinching) {
        isPinching = true;
        // first we will find which letter is at the top
        let total = 26; // total letters
        let angleStep = Math.PI * 2 / total;
  
        // we take the rotation and then divide by the gap size
        // this tells us how many spaces the wheel has turned
        // Math.round turns this into a whole number (like 4 intead of 4.29)
        // % total makes sure the number stays between 0 - 25 (cause remember we start from 0 not 1 in comp sci)
        let index = Math.round (-wheelRotation / angleStep) % total;
  
        // here, if you spin the wheel backwards we will end up with a negative number
        // since an array can't have a negative number we add that total to (26) to fix it
        // for example: -1 becomes letter 25 which is alphabet Z
        if (index < 0) {
          index += total;
        }
        
        // now, we look at that letter in our list
        lockedLetter = app.letterManager.letters[index];
  
        console.log("Locked Letter: " + lockedLetter);
  
        if (targetWord.includes(lockedLetter)) {
          feedbackColor = "lime"; // turns green for correct
          // fills the blanks in our guessedLetters Array 
          for (let i = 0; i < targetWord.length; i++) {
            if (targetWord[i] === lockedLetter) {
              guessedLetters[i] = lockedLetter;
            }
          }
          gameMessage = "Correct!"; // displays message when we are correct
        }
        else {
          feedbackColor = "red"; // turns red for wrong letter guessed
          gameMessage = "Try again...";
        }
      }
    }
    else {

      isPinching = false; // resets when you open your fingers

      // this cleans the rotation so it's not too huge (mod function keeps the values between 0 - 360)
      // prevents the code from lagging or breaking after you've spun it
      wheelRotation = wheelRotation % (Math.PI * 2);
    }

    // color picker logic
    const fingerX = landmarks[8].x * canvasWidth;
    const fingerY = landmarks[8].y * canvasHeight;

    // checks if finger is hovering over the menu box ( which is at the top left - 50, 50, size 50)
    if (fingerX > MENU_X && fingerX < MENU_X + MENU_SIZE && fingerY > MENU_Y && fingerY < MENU_Y + MENU_SIZE) {
      showColorMenu = true;
    }

    // here we can select the colors uinside the drop down menu
    if (showColorMenu) {
      let foundHover = false;

      // we will write a loop to create a grid of 20 squares
      for (let i = 0; i < pastelColors.length; i++) {
        let column = i % 5;
        let row = Math.floor(i / 5);
        let x = 50 + column * 45; // matching the grid that's in draw()
        let y = 110 + row * 45;

        // Check if index finger is inside this tiny square
        if (fingerX > x && fingerX < x + 40 && fingerY > y && fingerY < y + 40) {
          foundHover = true;

          if (hoveringIndex !== i) {
            // just started hovering over a new square
            hoveringIndex = i;
            hoverStartTime = Date.now(); // records the exact millisecond we started (searched up what feature to use)
          }
          else {
          // we have been hovering over over the same square (Check if 2 seconds (2000 ms) has passed)
            if (Date.now() - hoverStartTime > HOVER_TIME_NEEDED) {
              wheelColor = pastelColors[i]; // here we update to the new color now
              showColorMenu = false; // closes menu after selection
            }
          }
        }  
      }
      // if we aren't touching any square we reset the hover data
      if (!foundHover) {
        hoveringIndex = -1;
        hoverStartTime = 0;
      } 
    }
  }
}

// built in mediapipe callback function 
// referenced from Mediapipe-in-JavaScript Repo
hands.onResults(handleHandResults);

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
      // empty return because the function should stop running when there are no letters as it doesn't need to send back any values
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

      // referenced from ctx-style-writing Repo
      ctx.font = WHEEL_FONT;
      // FUN FACT: default fillStyle is black
      ctx.fillStyle = "white"; // we changed the color to white here

      // aligned text so it's not "stuck" in the center
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      //draw
      ctx.fillText(this.letters[i], x, y);

    }
    // the letter that's closest from the top gets selected
    // this math calculates the index based on rotation
    // finds which letter is at the top (-Math.PI * 2)
    let index = Math.round(-wheelRotation / angleStep) % total;

    // handles negative results from the mod function
    if (index < 0) {
      index += total;
    }

    // only plays the sound if the index has changed (meaning the wheel has moves and a new letter has been generated)
      
    // checks if the current letter is different from the one that we saw
    if (index !== lastSelectedIndex) {
      // rewind the sound from the very beginning
      gearSound.currentTime = 0;
      gearSound.play();

      // every time the gear clicks we set the jiggle to be 15 pixels
      jiggleAmount = JIGGLE_START;
        
      // stps the sound from playing again until the wheel moves to a new letter
      lastSelectedIndex = index;
    }

    let selectedLetter = this.letters[index];

    // calculate a random shake based on our jiggle variable
    // we will use Math.random as it gives a randonm number between 0-1
    // we center it by subtracting it by 0.5
    let shakeX = (Math.random() - 0.5) * jiggleAmount;
    let shakeY = (Math.random() - 0.5) * jiggleAmount;

    // this draws the selected letter in the middle 
    // referenced from ctx-style-writing Repo
    ctx.font = MAIN_FONT;
    ctx.fillStyle = wheelColor;

    // draw it exactly at centerX, centerY while adding shakeX and shakeY
    ctx.fillText(selectedLetter, centerX + shakeX, centerY + shakeY);

    // remeber we have to slow down the jiggle so it slows eventually
    if (jiggleAmount > 0) {
      // used exponential decay math to create physical vibration effect whenever a new letter is selected 
      jiggleAmount *= JIGGLE_DECAY; // reduces the jiggle by 20% each frame
    }

    if (jiggleAmount < 0.1) {
      jiggleAmount = 0; // if it's too small just set it to 0
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
app.setLetters(ALPHABET);


// requestAnimationFrame function is used for smooth animation and better refresh rate
function draw() {
  // clears the canvas before drawing anything
  ctx.clearRect(0 ,0 , canvasWidth, canvasHeight);
  ctx.save();

  // draw the webcam image onto the canvas
  ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);

  // draw alphabet wheel
  app.drawEverything();
  
  // draw only if the landmarks exist
  if (handResults && handResults.multiHandLandmarks) {
    // draw red dots where the hand landmarks are
    drawHandLandmarks();
  }

  // referenced from ctx-style-writing Repo
  // display the locked letter
  ctx.font = LOCKED_LETTER_FONT;

  // makes it look different and we know that this letter is the one we have selected
  ctx.fillStyle = "yellow"; 
  ctx.textAlign = "left";
 
  // draws the text on the top left corner
  ctx.fillText("Selected: " + lockedLetter, 600, 650);

  //displays the main button to open the menu
  ctx.fillStyle = "white";
  ctx.fillRect(MENU_X, MENU_Y, MENU_SIZE, MENU_SIZE);
  ctx.font = "15px Courier";
  ctx.fillStyle = "black";
  ctx.fillText("COLOR", MENU_X + 2, MENU_Y + 30);

  if (showColorMenu) {
    // draws 20 tiny squares
    for (let i = 0; i < pastelColors.length; i++) {
      let column = i % 5;
      let row = Math.floor(i/ 5);
      let x = 50 + column * 45; 
      let y = 110 + row * 45;

      // referenced from ctx-style-writing Repo
      ctx.fillStyle = pastelColors[i];
      ctx.fillRect(x, y, 40, 40);

      // draws a white border if we're hovering
      if (hoveringIndex === i) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, 40, 40);

        // show a loading bar for the 2 second wait
        // Date.now() is a special JS function that we can use to get the currrent time in milliseconds and we can subtract that from the start
        let progress = (Date.now() - hoverStartTime) / 2000;

        // alpha value addded at the end for a bit of transparency
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)"; 
        ctx.fillRect(x, y + 35, 40 * progress, 5);

      }
    }
  }

  ctx.fontStyle = "white";
  ctx.font = "bold 40px Courier";
  ctx.textAlign = "center";

  // draws 4 slots _ _ _ _
  for (let i = 0; i < 4; i++) {
    let xLocation = 190 + i * 60;

    // if the letter isn't guessed we just show an underscore
    let displayCharacter;

    if (guessedLetters[i] === "") {
      // if the slot is empty, show an underscore
      displayCharacter = "_";
    }
    else {
      displayCharacter = guessedLetters[i]; 
    }

    ctx.fillStyle = "white";
    ctx.fillText(displayCharacter, xLocation, 480);
  }

  // we make the clue box
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.fillRect(150, 520, 260, 120);
  ctx.fillStyle = "white";
  ctx.font = "20px Courier";
  ctx.fillText("CLUE: Sweet Dessert", 280, 580);

  // keeps looping before the next screen refresh
  requestAnimationFrame(draw);
}

// draws hand landmarks as red circles via nested loops and arrays
function drawHandLandmarks() {
  // if no hands are detected, stop the function
  if (!handResults || !handResults.multiHandLandmarks) {
    return;
  }

  // referenced from ctx-style-writing Repo
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
// don't write it as draw() bacause we want it to draw after the video is ready
video.onloadeddata = draw; 

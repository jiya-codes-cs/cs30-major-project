// CS 30 Major Project
// Jiya Khalsa Bangar
// 17 November,Tuesday
//

// Sources:
// https://mediapipe.readthedocs.io/en/latest/solutions/hands.html
// https://www.w3schools.com/graphics/canvas_drawing.asp
// https://www.youtube.com/watch?v=vfNHdVbE-l4


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
    let i = 0;

    for (let i = 0; i < total; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * this.circleRadius;
      const y = centerY + Math.sin(angle) * this.circleRadius;

      ctx.font = "bold 26px Courier New";
      ctx.fillStyle = "red";
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.LetterManager.drawLetters(this.centerX, this.centerY);
  }
}

// calling the app instance
let app = new App();


app.setLetters([
  "A","B","C","D","E","F","G",
  "H","I","J","K","L","M","N",
  "O","P","Q","R","S","T","U",
  "V","W","X","Y","Z"
]);


// this is a function that runs just before the screen so that it helps before redrawing the screen which allows a smoother transition  
function update() {
  app.drawEverything();
  requestAnimationFrame(update);
}

update();


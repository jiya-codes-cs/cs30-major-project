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
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// make circle

class Circle {
  constructor(x, y, color, radius) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = radius;
  }
  
  draw(ctx, canvasWidth, canvasHeight) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight); // clears the screen before drawing anything
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); //makes the circle that the user will manipulate
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}

// 
class LetterManager {
  constructor() {
    this.letters = [];
    this.circleRadius = 140;
  }

  setLetters(list) {
    this.letters = list;
  }

  drawLetters(centerX, centerY) {
    let total = this.letters.length;
    let angleStep = Math.PI * 2 / total;

    let i = 0;
    while(i < total) {
      let angle = i * angleStep - Math.PI / 2;

      let x = centerX + Math.cos(angle) * this.circleRadius;
      let y = centerY + Math.sin(angle) * this.circleRadius;

      ctx.font = "20px Arial";
      ctx.fillStyle = "black";
      ctx.fillText(this.letters[i], x, y);
 
      i = i + 1;
    }
  }
}

class App {
  constructor() {
    this.circle = new Circle(canvasWidth / 2, canvasHeight / 2, 40, "red");
    this.LetterManager = new LetterManager();
  }

  setTargetPosition(newX, newY) {
    this.circle.x = newX;
    this.circle.y = newY;
  }

  setLetters(list) {
    this.LetterManager.setLetters(list);
  }

  drawEverything() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.circle.draw();

    this.LetterManager.drawLetters(this.circle.x, this.circle.y);
  }
}

//
let app = new App();

//
canvas.onmousemove = handleMouseMove;

// used this fucntion for size and position of an HTML element relative to the browser's current visible screen 
function handleMouseMove() {
  let rect = canvas.getBoundingClientRect();
  let mouseX = window.clientX - rect.left;
  let mouseY = window.clientY - rect.top;
 
  app.setTargetPosition(mouseX, mouseY);
}

// Demo check
canvas.onclick = handleClick;
 
function handleClick() {
  app.setLetters([
    "A", "B", "C", "D", "E", "F", "G",
    "H", "I", "J", "K", "L", "M", "N",
    "O", "P", "Q", "R", "S", "T", "U",
    "V", "W", "X", "Y", "Z"
  ]);
}

// this is a function that runs just before the screen so that it helps before redrawing the screen which allows a smoother transition  
function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  circle(mouseX, mouseY, 20);
}


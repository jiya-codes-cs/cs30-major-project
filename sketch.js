// CS 30 Major Project
// Jiya Khalsa Bangar
// 17 November,Tuesday
//

// Sources:
// https://mediapipe.readthedocs.io/en/latest/solutions/hands.html
//https://www.w3schools.com/graphics/canvas_drawing.asp


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
    ctx.arc(this.x, this,this.y, this.radius, Math.PI * 2); //makes the circle that the user will manipulate
    ctx.fill(this.color);
    ctx.closePath();
  }
}

// 


function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  circle(mouseX, mouseY, 20);
}


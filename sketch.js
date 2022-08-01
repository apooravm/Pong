let allPaddles = [];
let paddle1;
let paddle2;

let widthPaddle = 15;
let heightPaddle = 100;

let allBalls = [];
let initBall;

let ballDistanceFromLeft;
let ballDistanceFromRight;

let force;

// let G = 100;

// let allBoxes = [];
// let initBox;

/*
Ideas:
Scrap acceleration/velocity from paddles and implement the object-movement 
*/

// ----------------
let allThings = [];
let tempThing;
let maxThings = 100;
let minWallDist = 0;
let wallMass = 999;
let wallU1 = 1;
let negAccVal = -1;
let G = 100;
let velRetardingRate = 1;

let AttractionX;
let AttractionY;

let targetPos;
// ----------------

function drawLinesInTheMiddle(lineLength, minDist) {
  let currDist = 10;
  stroke(255);
  while (currDist < height) {
    line(width/2, currDist, width/2, currDist+lineLength);
    currDist += lineLength + minDist;
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  paddle1 = new Paddle(0.02*width, height/2, widthPaddle, heightPaddle);
  paddle2 = new Paddle(0.98*width, height/2, widthPaddle, heightPaddle);
  allPaddles.push(paddle1);
  allPaddles.push(paddle2);

  for (let i = 0; i < 1; i++) {
    initBall = new Ball(random(width), random(height), 10);
    allBalls.push(initBall);
    
  }
}

function draw() {
  background(51);
  drawLinesInTheMiddle(10, 10);

  ballDistanceFromLeft = 1 - initBall.y/width; //gives range b/w 0-1, 0 if the distance is max
  ballDistanceFromRight = width - initBall.y;
  
  for (let currentPaddle of allPaddles) {
    currentPaddle.display();
    currentPaddle.update();
  }
  // allPaddles[0].x = mouseX;
  // allPaddles[0].y = initBall.y - 20;
  // allPaddles[1].y = initBall.y - 20;

  for (let ball of allBalls) {
    // ball.applyForce(0, 0.1);
    // let dist = p5.
    // ball.applyForce((G/((ball.x-mouseX)**2)), (G/((ball.y-mouseY)**2)));
    let pos = createVector(ball.x, ball.y);
    let force = p5.Vector.sub(createVector(mouseX, mouseY), pos);
    // let force = p5.Vector.sub(createVector(0, 0), pos);
    let distSq = force.magSq();
    let strength = G / (constrain(distSq, 20, 10));
    force.setMag(strength);
    // ball.applyForce(force);

    ball.bounceOffWall();
    ball.update();
    ball.draw();
    ball.checkBallxRectCollision();
  }

}


class Paddle
{
  constructor(x, y, width, height)
  {
    this.width = width;
    this.height = height;
    this.x = x-(this.width/2);
    this.y = y-(this.height/2);

    this.isLeftpaddle = true;

    this.acceleration = createVector(0, 0);
    this.velocity = createVector(0, 0);
    this.maxVelocity = 100;
  }

  display() {
    strokeWeight(1);
    stroke(255);
    noFill();
    rect(this.x, this.y, this.width, this.height);
  }

  updatePos(newX, newY)
  {
    this.x = newX-(this.width/2);
    this.y = newY-(this.height/2);
  }

  update()
  {
    this.movement();
    // this.updatePos(mouseX, mouseY);
    this.velocity.add(this.acceleration);
    this.velocity.limit(abs(this.y - initBall.y));
    this.acceleration.mult(0);

    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }

  movement()
  {
    // this.acceleration.y = 1 * initBall.y - this.y;
    if (initBall.x - this.x < 200) {
      this.y = initBall.y;
    }
    
    // force = p5.Vector.sub(createVector(initBall.x, initBall.y), this.x, this.y);
    // let force = p5.Vector.sub(createVector(mouseX, mouseY), pos);
    // this.velocity.x += force.x;
    // this.velocity.y += force.y;

  }
}

// class Ball
// {
//   constructor(x, y, diameter)
//   {
//     this.x = x;
//     this.y = y;
//     this.diameter = diameter;
//   }

//   display()
//   {
//     circle(this.x, this.y, this.diameter);
//   }

//   update()
//   {
//     this.x = mouseX;
//     this.y = mouseY;
//   }


// }

class Ball
{
  constructor(x, y, radius)
  {
    this.x = x;
    this.y = y;
    this.accelerationRange = 20;
    this.acceleration = createVector(random(-1*this.accelerationRange, this.accelerationRange), random(-1*this.accelerationRange, this.accelerationRange));
    this.velocity = createVector(0, 0);
    this.maxVelocity = 100;
    // this.radius = random(5, 10);
    this.radius = radius;
    // this.radius = 5;
    this.isPoint = false;
    this.mass = 1;
    this.tempVelocity = this.velocity;
    this.isStuckToWallX = false;
    this.isStuckToWallY = false;
    this.isCollidingWithBall = false;
  }

  update()
  {
    this.checkIfOutOfBounds();
    this.velocity = this.tempVelocity;
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxVelocity);
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.velocity.mult(velRetardingRate);
    this.acceleration.mult(0);
  }

  applyForce(force)
  {
    // this.acceleration.x += constrain(force.x, 0, 1000);
    // this.acceleration.y += constrain(force.y, 0, 1000);
    this.velocity.x += constrain(force.x, -100, 100);
    this.velocity.y += constrain(force.y, -100, 100);
  }

  getV2(m1=wallMass, u1=wallU1, m2, u2)
  {
    // let m1 = wallMass;
    // let u1 = wallU1;
    return (((m2-m1)/(m1+m2))*u2) + (((2*m1)/(m1+m2))*u1)
  }

  bounceOffWall()
  {
    // X axis collision detection not needed
    //-----------------------------------------------
    // if (this.x+this.radius + minWallDist > width || this.x-this.radius - minWallDist < 0) {
    //   if (!this.isStuckToWallX) {
    //     this.velocity.x *= negAccVal;
    //     this.isStuckToWallX = true; 
    //   }
    //   // this.velocity.x = this.getV2(this.mass, this.velocity.x);
    // }
    // else {
    //   this.isStuckToWallX = false;
    // }
    if (this.y+this.radius + minWallDist > height || this.y-this.radius - minWallDist < 0) {
      if (!this.isStuckToWallY) {
        this.velocity.y *= negAccVal;
        this.isStuckToWallY = true; 
      }
      // this.velocity.y = this.getV2(this.mass, this.velocity.y);
    }
    else
    {
      this.isStuckToWallY = false;
    }
  }

  bounceOffBall(otherM1, otherU1)
  {
    this.tempVelocity.x = this.getV2(otherM1, otherU1.x, this.velocity.x, this.mass);
    this.tempVelocity.y = this.getV2(otherM1, otherU1.y, this.velocity.y, this.mass);
  }

  draw()
  {
    noFill();
    strokeWeight(1);
    stroke(255);
    if (!this.isPoint) {
      circle(this.x, this.y, this.radius*2); //takes diameter not radius!!!
    } else
    {
      // strokeWeight(this.radius);
      strokeWeight(2);
      point(this.x, this.y);
    }
    
  }

  checkBallxRectCollision()
  {
    for (let currentRect of allPaddles) {
      // if (this.x+this.radius + minWallDist > currentRect.x && 
      //     this.x-this.radius - minWallDist < currentRect.x + currentRect.width) {
      //   // if (!this.isStuckToWallX) {
      //   //   this.velocity.x *= negAccVal;
      //   //   this.isStuckToWallX = true; 
      //   // }
      //   this.velocity.x *= negAccVal;
      //   // this.velocity.x = this.getV2(this.mass, this.velocity.x);
      // }
      // if (this.y+this.radius + minWallDist > currentRect.y &&
      //     this.y-this.radius - minWallDist < currentRect.y + currentRect.height) {
      //   this.velocity.y *= negAccVal;
      // }
      if (this.x+this.radius + minWallDist > currentRect.x && 
        this.x-this.radius - minWallDist < currentRect.x + currentRect.width &&
        this.y+this.radius + minWallDist > currentRect.y &&
        this.y-this.radius - minWallDist < currentRect.y + currentRect.height)
        {
          this.velocity.x *= negAccVal;
          // this.velocity.y *= negAccVal;
        }
    }
  }
  checkIfOutOfBounds()
  {
    if (this.x > width + 30 || this.x < 0 - 30) {
      this.x = width/2;
      this.acceleration = createVector(random(-1*this.accelerationRange, this.accelerationRange), random(-1*this.accelerationRange, this.accelerationRange));
      this.velocity.mult(0);
    }
  }
}

class simpleBox
{
  constructor(x, y, width, height)
  {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  showBox()
  {
    stroke(255);
    noFill();
    rect(this.x, this.y, this.width, this.height);
  }
}
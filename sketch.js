let p1;
let allPaddles = [];
let allBalls = [];

let score_LEFT = 0;
let score_RIGHT = 0;

function setup() {
  createCanvas(800, 400);
  allPaddles.push(new Paddle(0.05*width, 0.5*height));
  allPaddles.push(new Paddle(0.95*width, 0.5*height));

  allBalls.push(new Ball(width/2, height/2));
}

function draw() {
  background(51);
  drawMiddleLine();

  displaySCORES();

  for (let paddle of allPaddles) {
    paddle.show();
    paddle.update(mouseY);
  }

  for (let ball of allBalls) {
    ball.collision(false, true, allPaddles);
    ball.update();
    ball.show();
  }
}

function displaySCORES() {
  textSize(16);
  text(`${score_LEFT}`, 0.25*width, 0.1*height);
  text(`${score_RIGHT}`, 0.75*width, 0.1*height);
}

function drawMiddleLine(val=10, skip=20) {
  // val = line length
  // skip = height to be skipped
  stroke(255);
  let startingVal = -10;
  let xVal = 0.5*width;
  strokeWeight(0.2);

  while (startingVal <= height + 10) {
    line(xVal, startingVal, xVal, startingVal + val);
    startingVal += val + skip;
  }
}

class Ball
{
  constructor(x, y)
  {
    this.x = x;
    this.y = y;
    this.radius = 10;
    this.prev_X = this.x;

    this.velocity = createVector(0, 0);
    this.MAX_velocity = 50;
    this.NEG_SCALING_val = -1;

    this.scale_VAL = 10;

    // range b/w 0-1
    // scalable
    this.accerelation = createVector(this.scale_VAL*random(0.4, 1), this.scale_VAL*random(0.4, 1));
    // this.velocity = createVector(this.accerelation.x, this.accerelation.y);
    this.velocity = createVector(0, 0);

    this.isStuckToWallY = false;
    this.isStuckToWallX = false;
    this.isStuckToPaddle = false;

    this.MIN_wallDist = 0;
  }

  update()
  {
    this.prev_X = this.x;
    this.velocity.add(this.accerelation);
    this.accerelation.mult(0);

    this.velocity.limit(this.MAX_velocity);
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }

  show()
  {
    noFill();
    strokeWeight(1);
    circle(this.x, this.y, this.radius*2);
  }

  initAcceleration(rightSide)
  {
    // Returns a y value, either positive or negative in a certain range
    let get_YVAL;
    if (random() < 0.5) {
       // Negative Y
       get_YVAL =  -1 * random(0.4, 1);
    } else 
    {
      // Positive Y
      get_YVAL = random(0.4, 1);
    }

    //Right side collision
    if (rightSide) {
      this.velocity.x *= this.NEG_SCALING_val;
      // this.velocity.mult(-1);
      this.velocity = createVector(this.scale_VAL*random(0.4, 1.1)*(-1), this.scale_VAL * get_YVAL);
    } else {
      //Left Side collision
      this.velocity.x *= this.NEG_SCALING_val;
      // this.velocity.mult(-1);
      this.velocity = createVector(this.scale_VAL*random(0.4, 1.1), this.scale_VAL * get_YVAL);
    }
  }

  randomizeVelocity()
  {
    let get_YVAL;
    if (random() < 0.5) {
       // Negative Y
       get_YVAL =  -1 * random(0.4, 1);
    } else 
    {
      // Positive Y
      get_YVAL = random(0.4, 1);
    }

    let get_XVAL;
    if (random() < 0.5) {
       // Negative Y
       get_XVAL =  -1 * random(0.4, 1);
    } else 
    {
      // Positive Y
      get_XVAL = random(0.4, 1);
    }
    this.velocity = createVector(this.scale_VAL * get_XVAL, this.scale_VAL * get_YVAL);
  }

  collision(X_val=true, paddleYN=false, paddles=false)
  {
    if (X_val) {
      //Right Side Collision
      if (this.x + this.radius + this.MIN_wallDist > width && !this.isStuckToWallX) {
        this.initAcceleration(true);
        this.isStuckToWallX = true;
      }
      //Left Side Collision
      else if (this.x - this.radius - this.MIN_wallDist < 0 && !this.isStuckToWallX) {
        this.initAcceleration(false);
        this.isStuckToWallX = true;
      } else {
        this.isStuckToWallX = false;
      }
    } else {
      if (this.x > width + 40) {
        score_LEFT += 1;
        this.x = width/2;
        this.y = height/2;
        this.randomizeVelocity();

      } else if (this.x < 0 - 40) {
        score_RIGHT += 1;
        this.x = width/2;
        this.y = height/2;
        this.randomizeVelocity();
      }
    }

    if ((this.y + this.radius + this.MIN_wallDist > height || 
        this.y - this.radius - this.MIN_wallDist < 0) && !this.isStuckToWallY) {
          // Flips the y from positive => negative or vice versa
          this.velocity.y *= this.NEG_SCALING_val;
          this.isStuckToWallY = true;
    } else {
      this.isStuckToWallY = false;
    }

    if (paddleYN) {
      for (let paddle of paddles) {
        //Check if ball overlaps paddle
        if (this.x + this.radius + this.MIN_wallDist > paddle.x - paddle.width/2 &&
            this.x - this.radius - this.MIN_wallDist < paddle.x + paddle.width/2 &&
            this.y + this.radius + this.MIN_wallDist > paddle.y - paddle.height/2 &&
            this.y - this.radius - this.MIN_wallDist < paddle.y + paddle.height/2 &&
            !this.isStuckToPaddle) {
          if (this.x - this.prev_X >= 0) {
            // Moving to the right/ hitting from the Right Side
            this.initAcceleration(true);
          } else {
            // hitting from the Left Side
            this.initAcceleration(false);
          }
          this.isStuckToPaddle = true;
        } 
        else {
          this.isStuckToPaddle = false;
        }
      }
    }
  }
}

class Paddle
{
  constructor(x, y)
  {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 100;
    this.colour = [random(255), random(255), random(255)];
  }

  update(msY)
  {
    this.y = msY;
  }

  show()
  {
    fill(this.colour[0], this.colour[1], this.colour[2]);
    strokeWeight(0.1);
    rect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
  }
}
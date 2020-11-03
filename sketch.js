// Webcam Piano TEMPLATE
var camera;
var prevImg;
var currImg;
var diffImg;
var grid;
var threshold = 0.073;

function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(1);
    camera = createCapture(VIDEO);
    camera.hide();
    grid = new Grid(640, 480);
}

function draw() {


    background(120);

    createImage();
    image(camera, 0, 0);
    camera.loadPixels();

    var smallW = camera.width / 4;
    var smallH = camera.height / 4;


    //CURRENT CAMERA - BLUR/BLACK AND WHITE

    currImg = createImage(smallW, smallH);
    currImg.copy(camera, 0, 0, camera.width, camera.height, 0, 0, smallW, smallH); // save current frame
    
    currImg.filter('gray');
    currImg.filter(BLUR, 3);
    
    //OBTAINING THE DATA FROM THE CAMERA FOR GRID APPLICATION
    
    diffImg = createImage(smallW, smallH);
    diffImg.copy(currImg, 0, 0, currImg.width, currImg.height, 0, 0, smallW, smallH); 

    if (typeof prevImg !== 'undefined') {

        currImg.loadPixels();
        prevImg.loadPixels();
        diffImg.loadPixels();
        
        ///////CALCULATING THE DIFFERENCE BETWEEN PIXELS

        for (var x = 0; x < currImg.width; x += 1) {
            for (var y = 0; y < currImg.height; y += 1) {

                // MAGIC HAPPENS HERE

                var index = (x + y * currImg.width) * 4;

                var red1 = currImg.pixels[index + 0]
                var red2 = prevImg.pixels[index + 0]

                var diffvalue = abs(red1 - red2);

                diffImg.pixels[index + 0] = diffvalue;
                diffImg.pixels[index + 1] = diffvalue;
                diffImg.pixels[index + 2] = diffvalue;
                diffImg.pixels[index + 3] = 255;

            }
        }

        diffImg.updatePixels();
    }

    // 0.09 - the value for threshold which gives us the best sensetivity
    
    diffImg.filter('threshold',0.09);
    
 
    prevImg = createImage(currImg.width, currImg.height)
    prevImg.copy(currImg, 0, 0, currImg.width, currImg.height, 0, 0, smallW, smallH);
    
    //DRAWING THE FILTERS SEPARATELY NEXCT OT THE MAIN CAMERA WINDOW

    image(currImg, 640, 0);

    image(diffImg, 640, 100);
    
    
    //UPDATING THE PIXELS WITH THE CONTENTS FROM GRID FUNCTION BELOW

    grid.update(diffImg);
      
};

   //CHANGING THE MODE OF THE THRESHOLD BY CLICKING THE MOUSE 

function mousePressed() {

    threshold = map(mouseX, 0, currImg.width,0.5,0.9);

};

////////////////////THE GRID////////////////

var Grid = function (_w, _h) {
    this.diffImg = 0;
    this.noteWidth = 40;
    this.worldWidth = _w;
    this.worldHeight = _h;
    this.numOfNotesX = int(this.worldWidth / this.noteWidth);
    this.numOfNotesY = int(this.worldHeight / this.noteWidth);
    this.arrayLength = this.numOfNotesX * this.numOfNotesY;
    this.noteStates = [];
    this.noteStates = new Array(this.arrayLength).fill(0);
    this.colorArray = [];
    console.log(this);
    console.log(_w, _h);

    // set the original colors of the notes
    for (var i = 0; i < this.arrayLength; i++) {
        //ADDED RANDOMNESS TO THE COLOURS 
        this.colorArray.push(color(random(255), random(50), 122, 150));


    };

    this.update = function (_img) {
        this.diffImg = _img;
        this.diffImg.loadPixels();
        for (var x = 0; x < this.diffImg.width; x += 1) {
            for (var y = 0; y < this.diffImg.height; y += 1) {
                var index = (x + (y * this.diffImg.width)) * 4;
                var state = diffImg.pixels[index + 0];
                if (state == 255) {
                    var screenX = map(x, 0, this.diffImg.width, 0, this.worldWidth);
                    var screenY = map(y, 0, this.diffImg.height, 0, this.worldHeight);
                    var noteIndexX = int(screenX / this.noteWidth);
                    var noteIndexY = int(screenY / this.noteWidth);
                    var noteIndex = noteIndexX + noteIndexY * this.numOfNotesX;
                    this.noteStates[noteIndex] = 1;
                }
            }
        }

        //this is what "ages" the notes so that as time goes by things can change.
        for (var i = 0; i < this.arrayLength; i++) {
            this.noteStates[i] -= 0.4;
            this.noteStates[i] = constrain(this.noteStates[i], 0, 1);
        }

        this.draw();
    };

    // this is where each note is drawn
    // use can use the noteStates variable to affect the notes as time goes by
    // after that region has been activated
    this.draw = function () {
        push();
        noStroke();
        for (var x = 0; x < this.numOfNotesX; x++) {
            for (var y = 0; y < this.numOfNotesY; y++) {
                var posX = this.noteWidth / 4 + x * this.noteWidth;
                var posY = this.noteWidth / 4 + y * this.noteWidth;
                var noteIndex = x + (y * this.numOfNotesX);
                if (this.noteStates[noteIndex] > 0) {
                    fill(this.colorArray[noteIndex]);
                    rect(posX, posY, this.noteWidth, this.noteWidth);
                }
            }
        }
        pop();
    }
};

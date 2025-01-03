
var platforms = [];
var doodler;
var blackhole;
var paused = false;
var score = 0;
var isOver = false;
var isBlackholed = false;
var stepSize;
var isMobile;
var cell;




const sound = {
    blackhole: null,
    jump: null,
    spring: null,
    fragile: null,
    falling: null,
};

function preload() {
    const isLocalHost =
        location.hostname === "localhost" || location.hostname === "127.0.0.1";
    const baseUrl = isLocalHost
        ? ".."
        : "https://takosenpai2687.github.io/doodle-jump";
    Doodler.leftImage = loadImage(baseUrl + "/assets/img/doodler_left.png");
    Doodler.rightImage = loadImage(baseUrl + "/assets/img/doodler_right.png");
    Platform.springImage = loadImage(baseUrl + "/assets/img/spring.png");
    Blackhole.blackholeImg = loadImage(baseUrl + "/assets/img/hole.png");
    soundFormats("mp3", "wav");
    sound.blackhole = loadSound(baseUrl + "/assets/sound/blackhole.mp3");
    sound.jump = loadSound(baseUrl + "/assets/sound/jump.wav");
    sound.spring = loadSound(baseUrl + "/assets/sound/spring.mp3");
    sound.fragile = loadSound(baseUrl + "/assets/sound/fragile.mp3");
    sound.falling = loadSound(baseUrl + "/assets/sound/falling.mp3");
    sound.fragile.setVolume(0.25); 
    sound.blackhole.setVolume(0.25);
    sound.spring.setVolume(0.5);
    sound.jump.setVolume(0.4);
    backgroundImage = loadImage(baseUrl + "/assets/img/background.png");
    mynerveFont = loadFont(baseUrl + "/assets/fonts/Mynerve-Regular.ttf");
}


function setup() {
    frameRate(config.FPS);
    createCanvas(windowWidth, windowHeight);
    windowResized();
    generatePlatforms();
    doodler = new Doodler(
        platforms[platforms.length - 2].x,
        platforms[platforms.length - 2].y - Doodler.h / 2 - Platform.h / 2
    );
}

function draw() {
    drawBackground();
    blackhole && blackhole.render();
    platforms.forEach((plat) => {
        plat.render();
        if (
            plat.springed &&
            doodler.vy > 0 &&
            checkCollision(doodler, {
                x: plat.x + plat.springX,
                y: plat.y + plat.springY,
                w: Platform.springW,
                h: Platform.springH,
            })
        ) {
            sound.spring.play();
            doodler.vy = -Doodler.superJumpForce;
        }
        if (
            plat.type !== Platform.platformTypes.INVISIBLE &&
            doodler.vy > 0 &&
            checkCollision(doodler, plat)
        ) {
            doodler.vy = -Doodler.jumpForce;

            if (plat.type === Platform.platformTypes.FRAGILE) {
                plat.type = Platform.platformTypes.INVISIBLE;
                plat.springed = false;
                sound.fragile.play();
            } else {
                sound.jump.play();
            }
        }
        if (plat.type === Platform.platformTypes.MOVING && !paused) {
            plat.update();
        }
    });
    drawScore();
    if (!isOver) {
        doodler.render();
        doodler.update();
        if (doodler.y >= height) {
            isOver = true;
            doodler.vx = 0;
            doodler.vy = 0;
            sound.falling.play();
        } else if (
            blackhole &&
            dist(doodler.x, doodler.y, blackhole.x, blackhole.y) <
                Blackhole.ROCHE_LIMIT
        ) {
            isOver = true;
            doodler.vx = 0;
            doodler.vy = 0;
            doodler.x = blackhole.x;
            doodler.y = blackhole.y;
            isBlackholed = true;
            sound.blackhole.play();
        }
        if (blackhole && blackhole.y > height) {
            blackhole = null;
        }
        if (doodler.y <= config.THRESHOLD && doodler.vy < 0) {

            blackhole && (blackhole.y -= doodler.vy);
            updatePlatforms();
        }
    } else {
        drawDead();
    }
}


function updatePlatforms() {
    platforms.forEach((plat, i) => {
        plat.y -= doodler.vy;
        score++;

        if (plat.y > height) {
            if (
                plat.type !== Platform.platformTypes.FRAGILE &&
                plat.type !== Platform.platformTypes.INVISIBLE
            ) {
                
                let x = Platform.w / 2 + (width - Platform.w) * Math.random();

                let y = plat.y - (config.STEPS + 1) * stepSize;
                let type = Platform.platformTypes.getRandomType();
                let springed = Math.random() < config.SPRINGED_CHANCE;
                platforms.splice(i, 1);
                platforms.push(new Platform(x, y, type, springed));
    
                if (type === Platform.platformTypes.FRAGILE) {

                    x = (x + width / 3) % width;
                    type = Platform.platformTypes.STABLE;
            
                    springed = Math.random() < config.SPRINGED_CHANCE;
      
                    platforms.push(new Platform(x, y, type, springed));
                }

                else if (
                    !blackhole &&
                    Math.random() < config.BLACKHOLE_CHANCE
                ) {
                    blackhole = new Blackhole((x + width / 2) % width, y);
                }
            } else {

                platforms.splice(i, 1);
            }
        }
    });
}


function keyPressed() {
    if (isOver) return;
    if (
        (keyCode === LEFT_ARROW || keyCode === 65) &&
        doodler.vx !== -Doodler.speed
    ) {
        doodler.vx = -Doodler.speed;
        doodler.direction = Doodler.Direction.LEFT;
    } else if (
        (keyCode === RIGHT_ARROW || keyCode === 68) &&
        doodler.vx !== Doodler.speed
    ) {
        doodler.vx = Doodler.speed;
        doodler.direction = Doodler.Direction.RIGHT;
    }
}


function keyReleased() {
    if (
        !keyIsDown(LEFT_ARROW) &&
        !keyIsDown(RIGHT_ARROW) &&
        !keyIsDown(65) &&
        !keyIsDown(68) &&
        doodler.vx != 0
    ) {
        doodler.vx = 0;
    }
}

function touchStarted() {
    if (mouseX < width / 2 && doodler.vx !== -Doodler.speed) {
        doodler.vx = -Doodler.speed;
        doodler.direction = Doodler.Direction.LEFT;
    } else if (mouseX >= width / 2 && doodler.vx !== Doodler.speed) {
        doodler.vx = Doodler.speed;
        doodler.direction = Doodler.Direction.RIGHT;
    }
}

function touchMoved() {
    touchStarted();
}


function touchEnded() {
    if (doodler.vx != 0) {
        doodler.vx = 0;
    }
}


function windowResized() {
    stepSize = windowHeight / config.STEPS;
    isMobile = window.matchMedia("only screen and (max-width: 768px)").matches;
    if (!isMobile) {
        resizeCanvas((windowHeight * 9) / 16, windowHeight);
    }
    cell = windowHeight / 30;


    if (height > 0) {
        const REF_HEIGHT = 1289;
        const heightRatio = height / REF_HEIGHT;
 
        Doodler.jumpForce *= heightRatio;
        Doodler.superJumpForce *= heightRatio;
        config.GRAVITY *= heightRatio;
        config.MAX_FALLING_SPEED *= heightRatio;
  
        Doodler.h *= heightRatio;
        Platform.h *= heightRatio;
        Platform.springH *= heightRatio;
    }
    if (width > 0) {
        const REF_WIDTH = 725;
        const widthRatio = width / REF_WIDTH;
      
        Doodler.speed *= widthRatio;
       
        Doodler.w *= widthRatio;
        Platform.w *= widthRatio;
        Platform.springW *= widthRatio;
    }
}


function drawBackground() {

    image(backgroundImage, 0, 0, width, height);
}

function drawScore() {
    const fontSize = 24;
    const scoreStr = `POINTS: ${score.toLocaleString()}`;
    const strWidth = textWidth(scoreStr);
    let margin = 10;
    textSize(fontSize);
    textStyle(NORMAL);
    textAlign(LEFT);
    fill(60);
    noStroke();
    textFont(mynerveFont);
    text(scoreStr, width - strWidth - margin, margin + fontSize);

    textStyle(ITALIC);
    fill(3, 26, 125);
    textAlign(CENTER);
    text("adazilla.net", width / 2, height - margin);

}

/**

 * @param {Doodler} doodler
 * @param {Platform | any} platform
 * @returns {Boolean} isColliding
 */
function checkCollision(doodler, platform) {
    if (isOver) return false;
    return (
        doodler.x - Doodler.w / 4 < platform.x + Platform.w / 2 && // right edge
        doodler.x + Doodler.w / 4 > platform.x - Platform.w / 2 && // left edge
        doodler.y + Doodler.h / 2 > platform.y - Platform.h / 2 && // top edge
        doodler.y + Doodler.h / 2 < platform.y // bottom edge
    );
}


function generatePlatforms() {
    stepSize = Math.floor(height / config.STEPS);
    for (let y = height; y > 0; y -= stepSize) {
        const x = Platform.w / 2 + (width - Platform.w) * Math.random();
        let type = Platform.platformTypes.getRandomType();
        while (type === Platform.platformTypes.FRAGILE) {
            type = Platform.platformTypes.getRandomType();
        }
        const springed = Math.random() < config.SPRINGED_CHANCE;
        platforms.push(new Platform(x, y, type, springed));
    }
}


function drawDead() {
    if (!platforms.length && !blackhole) {
        textAlign(CENTER);
        text("Game Over!", width / 2, height / 2 - 20);

    } else if (!isBlackholed) {
   
        doodler.render();
        for (let i = platforms.length - 1; i >= 0; i--) {
            platforms[i].y -= Doodler.jumpForce;
            if (platforms[i].y < 0) {
                platforms.splice(i, 1);
            }
        }
        if (blackhole) {
            blackhole.y -= Doodler.jumpForce;
            if (blackhole.y < 0) {
                blackhole = null;
            }
        }
    } else {

        doodler.render();
        Doodler.w -= 0.5;
        Doodler.h -= 0.5;
        if (Doodler.w < 0 || Doodler.h < 0) {
            platforms = [];
            blackhole = null;
        }
    }
}

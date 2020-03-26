
function down(){
    if(b.update(stat) == 1){
        pressedKeys[DOWN_BUTTON] = [0, 0]
    }
    // area = [... empty]
    // b.drawInto(area)
}

function side(dx){
    k = LEFT_BUTTON
    if(dx == 1) k = RIGHT_BUTTON
    if(b.side(stat, dx) == 1){
        pressedKeys[k] = [0, 0]
    }
    // area = [... empty]
    // b.drawInto(area)
}

function rotateBlock(){
    if(b.rotate(stat) == 1){
        if(b.side(stat, -1) == 1){
            if(b.side(stat, 1) == 0){
                if(b.rotate(stat) == 1){
                    b.side(stat, -1)
                }
            }
        }
        else if(b.rotate(stat) == 1){
            b.side(stat, 1)
        }
    }
    // area = [... empty]
    // b.drawInto(area)
}

function execute(c){
    if(c == "Resume"){
        paused = false
    }
    else if(c == "New Game"){

    }
}

let keyCodes;
let areaW = 10;
let areaH = 20;
let blockW = 30;
let isMobile = false;
let deviceW = document.body.offsetWidth;
if(deviceW < 660){
    isMobile = true;
    blockW = Math.round(deviceW/22);
}
let w = blockW*areaW;
let h = blockW*areaH;
let xOffset = blockW*6;
let yOffset = 0;
if(isMobile) yOffset = 10*blockW;
let stat, empty;
let b, ghostBlock, nextBlock;
let changeSpeed = 200;
let tetri = [];
let selected = 0;
let selections = ["Resume", "New Game"];
let frames, gameOver, paused, lines, score, gameSpeed, level;
let buttonsPressed = [false, false, false];
DOWN_BUTTON = 0; LEFT_BUTTON = 1; RIGHT_BUTTON = 2; UP_BUTTON = 3;
let downButton = new Button(0, blockW); let leftButton = new Button(1, blockW);
let rightButton = new Button(2, blockW); let upButton = new Button(3, blockW);
let buttons = [downButton, leftButton, rightButton, upButton]
let buttonsOn = true;

function initialize(){
    frames = 0
    gameOver = false;
    paused = false;
    lines = 0;
    score = 0;
    level = 0;
    gameSpeed = 50;
    stat = []
    empty = []
    for (let i = 0; i < areaW; i++){
        tmp = [];
        for (let j = 0; j < areaH; j++){
            tmp.push(0);
        }
        empty.push(tmp);
    }
    // #Za blockove koji su sleteli
    stat = [... empty];
}

function setup(){
    initialize()
    createCanvas(w+2*xOffset, h+yOffset);
    if(isMobile){
        upButton.x = width/2-upButton.w/2; upButton.y = areaH*blockW+upButton.h/2;
        downButton.x = width/2-downButton.w/2; downButton.y = areaH*blockW+5*downButton.h/2;
        leftButton.x = width/2-3*upButton.w/2; leftButton.y = areaH*blockW+3*upButton.h/2;
        rightButton.x = width/2+upButton.w/2; rightButton.y = areaH*blockW+3*upButton.h/2;
    }
    textFont('Helvetica');
    textSize(2/3*blockW);
    b = new Block("T");
    ghost = new Block(b.type);
    nextBlock = new Block(b.nextBlockType);
    keyCodes = [DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, UP_ARROW];
}


function keyPressed(){
    if(!gameOver){
        if(keyCode === 27){
            paused = !paused;
        }
        if(!paused){
            if(keyCode === DOWN_ARROW){
                down()
                pressedKeys[DOWN_BUTTON][0] = frames
            }
            else if(keyCode === LEFT_ARROW){
                side(-1);
                pressedKeys[LEFT_BUTTON][0] = frames
            }   
            else if(keyCode === RIGHT_ARROW){
                side(1);
                pressedKeys[RIGHT_BUTTON][0] = frames
            }
            else if(keyCode === UP_ARROW){
                rotateBlock();
            }
        }
        else{
            if(keyCode === UP_ARROW){
                selected--;
            }
            else if(keyCode == DOWN_ARROW){
                selected++;
            }
            else if(keyCode === 13){
                execute(selections[selected]);
            }
        }
    }
    else{
        if(keyCode == 32){
            initialize()
        }
    }
}
function touchStarted(){
    for(let i = 0; i < buttons.length; i++){
        if(buttons[i].pressing(mouseX, mouseY)){
            keyCode = keyCodes[buttons[i].code];
            keyPressed()
            if(buttons[i].code != 3) buttonsPressed[buttons[i].code] = true;
        }
    }
}
function touchEnded(e){
    e.preventDefault();
    buttonsPressed = [false, false, false];
}

function isKeyDown(code){
    if(!isMobile) return keyIsDown(keyCodes[code]);
    return buttonsPressed[code]
}


function draw(){          
    
    level = Math.floor(lines/10);
    gameSpeed = speeds[Math.min(level, 29)]

    if(!paused && !gameOver){
        for (let i = 0; i<3; i++){
            if (isKeyDown(i)){
                if(frames - pressedKeys[i][0] > 10 && pressedKeys[i][0] != 0){
                    pressedKeys[i][1] += 1;
                    if(pressedKeys[i][1] % 2 == 0){
                        if(i == DOWN_BUTTON){
                            score += 1;
                            down();
                        } 
                        else if(i == RIGHT_BUTTON) side(1);
                        else if(i == LEFT_BUTTON) side(-1);
                    }
                }
            }
            else{
                pressedKeys[i] = [0, 0];
            }
        }
        
        
        // Main loop ---------------------------------------------------------
        if(!gameOver){
            frames += 1;
            if(frames % gameSpeed == 0){
                down();
            }
            
            tetri=[];
            for (let j = 0; j < areaH; j++){
                s = 0;
                for (let i = 0; i < areaW; i++){
                    if(stat[i][j] > 0) s+=1;
                }
                //print(s)
                if(s == areaW) tetri[j] = 1;
                else tetri[j] = 0;
            }
            
            s = tetri.reduce((a,b) => a+b, 0);
            lines += s
            if(s == 1){
                score += 40*(level+1);
            }
            else if(s == 2){
                score += 100*(level+1);
            }
            else if(s == 3){
                score += 300*(level+1);
            }
            else if(s == 4){
                score += 1200*(level+1);
            }

            for (let i = 0; i<tetri.length; i++){
                if(tetri[i] == 1){
                    for (let j = 0; j < areaW; j++){
                        stat[j].splice(i,1);
                        stat[j] = concat([0], stat[j])
                    }
                }
            }
            //Sum
            for (let j = 0; j < s; j++){
                for (let i = 0; i < areaW; i++){
                }
            }

            //Check Game over
            for (let i = 0; i < areaW; i++){
                if(stat[i][0] > 0){
                    gameOver = true;
                }
            }
        }

    }
    // #Crtanje ------------------------------------------------------
    background(255, 255, 255);
        

    ghost.map = b.map;
    ghost.color = (200, 200, 200);
    ghost.x = b.x;
    ghost.y = b.y;
    ghost.rot = b.rot;
    ghost.type = b.type;
    ghost.goToBottom(stat);
    for (let i = 0; i < 4; i++){
        for (let j = 0; j < 4; j++){
            if(ghost.getMap(i, j) == 1){
                fill(ghost.color);
                rect(xOffset+(ghost.x+i)*blockW, (ghost.y+j)*blockW, blockW, blockW);
            }
        }
    }

    
    for (let i = 0; i < 4; i++){
        for (let j = 0; j < 4; j++){
            if(b.getMap(i,j) > 0){
                fill(b.color);
                rect(xOffset+(b.x+i)*blockW, (b.y+j)*blockW, blockW, blockW);
            }
        }
    }
    for (let i = 0; i < areaW; i++){
        for (let j = 0; j < areaH; j++){
            if(stat[i][j] > 0){
                fill(colors[stat[i][j]-1]);
                //if(tetri[j] == 1) fill(255, 255, 255);
                rect(xOffset+i*blockW, j*blockW, blockW, blockW);
            }
        }
    }
            
    // #Next block
    nextBlock.type = b.nextBlockType;
    nextBlock.map = tipovi[nextBlock.type];
    nextBlock.color = colors[typeColor[nextBlock.type]-1];
    nextBlock.x = 1
    for (let i = 0; i < 4; i++){
        for (let j = 0; j < 4; j++){
            if(nextBlock.getMap(i, j) == 1){
                fill(nextBlock.color);
                rect(xOffset+w+(nextBlock.x+i)*blockW, 4*blockW+(nextBlock.y+j)*blockW, blockW, blockW);
            }
        }
    }
    noFill();
    stroke(171, 171, 171);
    rect(xOffset+w+blockW, 4*blockW, 4*blockW, 4*blockW);
    noStroke();

    //Score
    fill(0)
    textAlign(LEFT)
    text('Score: '+score, blockW, 4*blockW);
    text('Lines: '+lines, blockW, 6*blockW);
    text('Level: '+level, blockW, 8*blockW);

    downButton.draw()
    leftButton.draw()
    rightButton.draw()
    upButton.draw()
    
    // #Grid lines
    stroke(171, 171, 171);
    noFill();
    for (let i = 0; i < areaW+1; i++){
        line(xOffset+i*blockW, 0, xOffset+i*blockW, h);
    }
    for (let i = 0; i < areaH+1; i++){
        line(xOffset, i*blockW, xOffset+w, i*blockW);
    }
    noStroke();

    // #Pause menu
    if(paused){
        fill(94, 94, 94, 200);
        rect(xOffset+3/2*blockW, (6+1/2)*blockW, 2*blockW, 8*blockW)
        rect(xOffset+(10-3/2-2)*blockW, (6+1/2)*blockW, 2*blockW, 8*blockW)
    
    }

    if(gameOver){
        fill(94, 94, 94, 200);
        rect(xOffset-2*blockW, 6*blockW, blockW*(areaW+4), 8*blockW);
        fill(255);
        textAlign(CENTER);
        text("Game Over, Press space to play again", xOffset+areaW/2*blockW, areaH*blockW/2);
    }


}
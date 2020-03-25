
function down(){
    if(b.update(stat) == 1){
        pressedKeys["Down"] = [0, 0]
    }
    // area = [... empty]
    // b.drawInto(area)
}

function side(dx){
    k = "Left"
    if(dx == 1) k = "Right"
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
let stat, empty;
let b, ghostBlock, nextBlock;
let changeSpeed = 200;
let tetri = [];
let selected = 0;
let selections = ["Resume", "New Game"];
let frames, gameOver, paused, lines, score, gameSpeed, level;

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
    createCanvas(w+2*xOffset, h+yOffset)
    textFont('Helvetica');
    textSize(20);
    b = new Block("T");
    ghost = new Block(b.type);
    nextBlock = new Block(b.nextBlockType);
    keyCodes = {"Down": DOWN_ARROW,"Left": LEFT_ARROW,"Right": RIGHT_ARROW};

    // #Makes the area 2d array
    
}


function keyPressed(){
    if(!gameOver){
        if(keyCode === 27){
            paused = !paused;
        }
        if(!paused){
            if(keyCode === DOWN_ARROW){
                down()
                pressedKeys["Down"][0] = frames
            }
            else if(keyCode === LEFT_ARROW){
                side(-1);
                pressedKeys["Left"][0] = frames
            }
            else if(keyCode === RIGHT_ARROW){
                side(1);
                pressedKeys["Right"][0] = frames
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


function draw(){          
    
    level = Math.floor(lines/10);
    gameSpeed = speeds[Math.min(level, 29)]

    if(!paused && !gameOver){
        for (i in pressedKeys){
            if (keyIsDown(keyCodes[i])){
                if(frames - pressedKeys[i][0] > 10 && pressedKeys[i][0] != 0){
                    pressedKeys[i][1] += 1;
                    if(pressedKeys[i][1] % 2 == 0){
                        if(i == "Down"){
                            score += 1
                            down();
                        } 
                        else if(i == "Right") side(1);
                        else if(i == "Left") side(-1);
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
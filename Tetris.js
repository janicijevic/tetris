let areaW = 10;
let areaH = 20;
let blockW = 30;
let isMobile = false;
let deviceW = document.body.offsetWidth;
if(deviceW < 700){
    isMobile = true
}
if(deviceW < blockW*22){
    blockW = Math.round(deviceW/22);
}
let w, h, xOffset, yOffset;
calculate();

function calculate(){
    w = blockW*areaW;
    h = blockW*areaH;
    xOffset = blockW*4;
    yOffset = 0;
    if(isMobile) yOffset = 10*blockW;
}

class Tetris{
    static seed = 7389214;
    static numOfInstances = 0;

    static getNextBlock(s){
        return slova[Math.round(Tetris.random(s)*(slova.length - 1))];
    }

    static random(s){
        var x = Math.sin(s) * 10000;
        return x - Math.floor(x);
    }

    constructor(xOff, lOff, rOff, keys = [DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, UP_ARROW]){
        this.xOff = xOff;
        this.lOff = lOff;
        this.rOff = rOff;
        this.b = new Block();
        this.ghost = new Block(this.b.type);
        this.nextBlock = new Block(this.b.nextBlockType);
        this.keyCodes = keys
        this.id = Tetris.numOfInstances++;
    }


    initialize(keys){
        //              Down, left, right, up
        //this.keyCodes = [DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, UP_ARROW];
        //this.keyCodes = [83, 65, 68, 87] //WASD
        this.buttonsPressed = [false, false, false];
        this.gameSpeed = 50;
        this.lines = 0;
        this.score = 0;
        this.level = 0;
        this.stat = [];
        this.empty = [];
        this.gameOver = false;
        this.winner = false;
        for (let i = 0; i < areaW; i++){
            let tmp = [];
            for (let j = 0; j < areaH; j++){
                tmp.push(0);
            }
            this.empty.push(tmp);
        }
        // Za blockove koji su sleteli
        this.stat = [... this.empty];
        //Novi blokovi
        this.b = new Block();
        this.ghost = new Block(this.b.type);
        this.nextBlock = new Block(this.b.nextBlockType);
    }

    isKeyDown(b, i){
        if(this.gameOver) return
        if(keyIsDown(this.keyCodes[i])) this.buttonsPressed[i] = true;
        if (this.buttonsPressed[i]){
            // socket.emit("setButtonsPressed", {buttonsPressed: tetris[0].buttonsPressed, roomCode: roomCode})
            let t = 10;
            if(isMobile) t = 30;
            if(frameCount - b.pressed[0] > t && b.pressed[0] != 0){
                b.pressed[1] += 1;
                if(b.pressed[1] % 2 == 0){
                    if(i == DOWN_BUTTON){
                        this.score += 1;
                        this.down();
                    } 
                    else if(i == RIGHT_BUTTON) this.side(1);
                    else if(i == LEFT_BUTTON) this.side(-1);
                }
            }
        }
        else{
            b.pressed = [0, 0];
        }
        
    }

    update(){
        if(this.id == 0 && mode == ONLINE)
            socket.emit("update", {tetris: this, roomCode: roomCode})
        
        if(this.gameOver) return
        if(this.id == 1 && mode == ONLINE) return
        //Update variables and move block
        this.level = Math.floor(this.lines/10);
        this.gameSpeed = speeds[Math.min(this.level, 29)]
        
        if(frameCount % this.gameSpeed == 0){
            this.down();
        }
        //Counting Tetris
        this.tetri=[];
        for (let j = 0; j < areaH; j++){
            let s = 0;
            for (let i = 0; i < areaW; i++){
                if(this.stat[i][j] > 0) s+=1;
            }
            if(s == areaW) this.tetri[j] = 1;
            else this.tetri[j] = 0;
        }
        //Add to score
        let s = this.tetri.reduce((a,b) => a+b, 0);
        this.lines += s
        if(s == 1){
            this.score += 40*(this.level+1);
        }
        else if(s == 2){
            this.score += 100*(this.level+1);
        }
        else if(s == 3){
            this.score += 300*(this.level+1);
        }
        else if(s == 4){
            this.score += 1200*(this.level+1);
        }
        //Remove tetris
        for (let i = 0; i<this.tetri.length; i++){
            if(this.tetri[i] == 1){
                for (let j = 0; j < areaW; j++){
                    this.stat[j].splice(i,1);
                    this.stat[j] = concat([0], this.stat[j])
                }
            }
        }

        //Check Game over
        for (let i = 0; i < areaW; i++){
            if(this.stat[i][0] > 0){
                this.gameOver = true;
            }
        }
    }
    

    draw(){
        if(mode == SINGLE) this.lOff = this.rOff = blockW*6

        //Ghost
        this.ghost.map = this.b.map;
        this.ghost.color = (200, 200, 200);
        this.ghost.x = this.b.x;
        this.ghost.y = this.b.y;
        this.ghost.rot = this.b.rot;
        this.ghost.type = this.b.type;
        this.ghost.goToBottom(this.stat);
        for (let i = 0; i < 4; i++){
            for (let j = 0; j < 4; j++){
                if(this.ghost.getMap(i, j) == 1){
                    fill(this.ghost.color);
                    rect(this.lOff+this.xOff+(this.ghost.x+i)*blockW, (this.ghost.y+j)*blockW, blockW, blockW);
                }
            }
        }
        

        //Block
        for (let i = 0; i < 4; i++){
            for (let j = 0; j < 4; j++){
                if(this.b.getMap(i,j) > 0){
                    fill(this.b.color);
                    rect(this.lOff+this.xOff+(this.b.x+i)*blockW, (this.b.y+j)*blockW, blockW, blockW);
                }
            }
        }
        //Static
        for (let i = 0; i < areaW; i++){
            for (let j = 0; j < areaH; j++){
                if(this.stat[i][j] > 0){
                    fill(colors[this.stat[i][j]-1]);
                    rect(this.lOff+this.xOff+i*blockW, j*blockW, blockW, blockW);
                }
            }
        }
     
        // Next block
        this.nextBlock.type = this.b.nextBlockType;
        this.nextBlock.map = tipovi[this.nextBlock.type];
        this.nextBlock.color = colors[typeColor[this.nextBlock.type]-1];
        this.nextBlock.x = 0
        if(this.nextBlock.type == "J") this.nextBlock.y = 1;
        else this.nextBlock.y = 0;
        let leftOffset = this.xOff;
        let topOffset = 2*blockW;
        if(this.lOff == 0) leftOffset = this.xOff+w
        if(mode == SINGLE) {
            leftOffset = 7*blockW+w
            topOffset = 2*blockW
            
        }
        for (let i = 0; i < 4; i++){
            for (let j = 0; j < 4; j++){
                if(this.nextBlock.getMap(i, j) == 1){
                    fill(this.nextBlock.color);
                    rect(leftOffset+(this.nextBlock.x+i)*blockW, topOffset+(this.nextBlock.y+j)*blockW, blockW, blockW);
                }
            }
        }
        noFill();
        stroke(171, 171, 171);
        rect(leftOffset, topOffset, 4*blockW, 4*blockW);
        noStroke();

        // #Grid lines
        stroke(171, 171, 171);
        noFill();
        for (let i = 0; i < areaW+1; i++){
            line(this.lOff+this.xOff+i*blockW, 0, this.lOff+this.xOff+i*blockW, h);
        }
        for (let i = 0; i < areaH+1; i++){
            line(this.lOff+this.xOff, i*blockW, this.lOff+this.xOff+w, i*blockW);
        }
        noStroke();

        if(this.gameOver){
            push()
                noFill()
                stroke(170);
                strokeWeight(5);
                rect(this.xOff+this.lOff, 0, w, h);
                noStroke();
                fill(170, 200);
                rect(this.xOff+this.lOff+3*blockW/2, h/2-3*blockW, 7*blockW, 6*blockW)
                fill(0);
                textAlign(CENTER);
                text("Game over", this.xOff+this.lOff+w/2, h/2)
                if(this.winner){
                    text("Winner", this.xOff+this.lOff+w/2, h/2-blockW)
                }
            pop();
        }

    }

    down(){
        if(this.gameOver) return
        if(this.b.update(this.stat) == 1){
            buttons[DOWN_BUTTON+this.id*4].pressed = [0, 0]
        }
    }
    side(dx){
        if(this.gameOver) return
        let k = LEFT_BUTTON
        if(dx == 1) k = RIGHT_BUTTON
        if(this.b.side(this.stat, dx) == 1){
            buttons[k+this.id*4].pressed = [0, 0]
        }
    }
    rotateBlock(){
        if(this.gameOver) return
        if(this.b.rotate(this.stat) == 1){
            if(this.b.side(this.stat, -1) == 1){
                if(this.b.side(this.stat, 1) == 0){
                    if(this.b.rotate(this.stat) == 1){
                        this.b.side(this.stat, -1)
                    }
                }
            }
            else if(this.b.rotate(this.stat) == 1){
                this.b.side(this.stat, 1)
            }
        }
    }

    keyPressed(code){
        if(this.gameOver) return
        let i = this.keyCodes.indexOf(code);
        if(i == -1) return;
        //send buttons
        if(recievedButton == true){
            recievedButton = false;
        }
        else if(mode == ONLINE){
            // console.log("buttonPress");
            // socket.emit("buttonPress", {keyCode: i, roomCode: roomCode})
            // socket.emit("setButtonsPressed", {buttonsPressed: tetris[0].buttonsPressed, roomCode: roomCode})
        }
        if(i === DOWN_BUTTON){
            this.down()
            buttons[i+this.id*4].pressed[0] = frameCount
        }
        else if(i === LEFT_BUTTON){
            this.side(-1);
            buttons[i+this.id*4].pressed[0] = frameCount
        }   
        else if(i === RIGHT_BUTTON){
            this.side(1);
            buttons[i+this.id*4].pressed[0] = frameCount
        }
        else if(i === UP_BUTTON){
            this.rotateBlock();
        }
    }

    keyReleased(){
        let i = this.keyCodes.indexOf(keyCode);
        if(i == -1) return false;
        if(i < this.buttonsPressed.length){
            this.buttonsPressed[i] = false;
        }
        // socket.emit("setButtonsPressed", {buttonsPressed: tetris[0].buttonsPressed, roomCode: roomCode})
        return true;
    }

}
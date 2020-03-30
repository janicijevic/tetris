function modulo(a,n) {
    return ((a%n)+n)%n;
};

let speeds= [48, 43, 38, 33, 28, 23, 18, 13, 8, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1]  


let tipovi = {
    "I": "0000000011110000",
    "J": "0000100011100000",
    "L": "0000000101110000",
    "O": "0000001100110000",
    "S": "0000001101100000",
    "T": "0000001001110000",
    "Z": "0000011000110000"
};

let typeColor = {
    "I": 1,
    "J": 2,
    "L": 3,
    "O": 4,
    "S": 5,
    "T": 6,
    "Z": 7
};

let colors = [[0, 225, 255], [0, 38, 255], [255, 166, 0], [255, 255, 0], [77, 255, 0], [183, 0, 255], [255, 0, 0]];

let slova = ["I","J","L","O","S","T","Z"];

let starty = 0;

class Block{
    constructor(tip){
        this.seed = Tetris.seed;
        this.type = Tetris.getNextBlock(this.seed++)
        if(tip != undefined) this.type = tip
        this.initialize()
    }

    initialize(){
        this.map = tipovi[this.type];
        this.nextBlockType = Tetris.getNextBlock(this.seed++);
        this.color = colors[typeColor[this.type]-1];
        this.x = 3;
        this.y = starty;
        this.rot = 0;
    }

    reset(stat){
        this.type = this.nextBlockType;
        this.initialize()


        if(this.collision(stat))
            this.y -= 1;
            if(this.collision(stat))
                this.y -= 1;
    }


    collision(stat){
        for (let i = 0; i<4; i++){
            for (let j = 0; j < 4; j++){
                if(this.getMap(i,j) == 1){
                    // #Out of bounds
                    if(this.x+i < 0 || this.x+i >= stat.length || this.y+j >= stat[0].length){
                        return true;
                    }
                    // #On top of another block
                    if (stat[this.x+i][this.y+j] > 0){
                        return true;
                    }
                }
            }
        }
        return false;
    }


    update(stat, dy=1){
        // #Move to next pos
        this.y += dy;
        // #Go back if collided
        if(this.collision(stat)){
            this.y -= dy;
            // #Put block in stat
            if(dy == 1){
                for (let i = 0; i<4; i++){
                    for (let j = 0; j < 4; j++){
                        if(this.getMap(i, j) == 1){
                            stat[this.x+i][this.y+j] = typeColor[this.type];
                        }
                    }
                }
                // #Make new block
                this.reset(stat);
            }
            return 1;
        }
        return 0;
    }


    side(stat, d){
        // #Move
        this.x += d;
        // #Go back if collided
        if(this.collision(stat)){
            this.x -= d;
            return 1;
        }
        return 0;
    }


    rotate(stat){
        if(this.map == tipovi["O"]) return 0;
        
        this.rot += 1;
        this.rot = modulo(this.rot, 4);
        if(this.collision(stat)){
            this.rot -= 1;
            this.rot = modulo(this.rot, 4);
            return 1;
        }
        return 0;
    }


    getMap(j, i){
        // #j pa i zbog jbg
        if(this.rot == 0)
            // # Right side up
            return int(this.map[j*4+i])
        else if(this.rot == 1)
            // # u desno rotirano
            return int(this.map[i*4+3-j])
        else if(this.rot == 2)
            // # Upside down
            return int(this.map[(3-j)*4+3-i])
        else if(this.rot == 3)
            // # u levo
            return int(this.map[(3-i)*4+j])
    }

    goToBottom(stat){
        for(let i = 0; i<stat[0].length; i++){
            this.y += 1
            if(this.collision(stat)) break;
        }
        this.y -= 1;
    }
}

class Button{
    constructor(w = blockW*3, h = blockW*3, name = "MoveButton", x=-200, y=-200){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.text = name;
        this.color = 170;
        this.active = true;
        this.textColor = 0
        this.pressed = [0,0]
    }

    setPos(x, y){
        this.x = x; this.y = y;
    }

    pressing(x, y){
        let buff = 2;
        return x >= this.x-buff && x <= this.x+this.w+buff && y > this.y-buff && y < this.y+this.h+buff;
    }

    press(index){
        if(!this.active) return
        switch(this.text){
            case "Singleplayer": 
                mode = SINGLE;
                resizeGame();
                state = states.PLAYING;
                initializeGame();
            break;
            case "Local vs": 
                mode = DOUBLE;
                resizeGame();
                state = states.PLAYING;
                initializeGame();
            break;
            case "Online": 
                if(roomCode != "" || roomCode != undefined)
                connecting = true;
                socket.emit("connectToRoom", {roomCode: roomCode, seed: Tetris.seed})
            break;
            case "New Game": 
                state = states.PLAYING;
                initializeGame();
            break;
            case "Resume": state = states.PLAYING;
            break;
            case "Back to Menu": state = states.MENU.START;
            break;
            default:
                for(let i = 0; i<tetris.length; i++){
                    let j = index-4*i;
                    if(j >= 0 && j < 4) keyCode = tetris[i].keyCodes[j];
                    if(j >= 0 && j < 3) tetris[i].buttonsPressed[j] = true;
                }
                //Pause
                if(index == buttons.length-1)keyCode = 27;
                keyPressed()
        
        }
    }

    draw(bold = false){
            if(this.text == "PauseButton"){
                fill(this.color);
                rect(this.x, this.y, this.w/3, this.h);
                rect(this.x+this.w/3+this.w/3, this.y, this.w/3, this.h);
            }
            else{
                fill(this.color);
                if(!this.active) fill(70);
                rect(this.x, this.y, this.w, this.h);
                fill(this.textColor);
                if(!this.active) fill(150);
                if(this.text != "MoveButton"){
                    if(bold) {
                        push();
                            stroke(0)
                            strokeWeight(5);
                            noFill();
                            rect(this.x, this.y, this.w, this.h);
                        pop();
                    }
                    textAlign(CENTER);
                    text(this.text, this.x+this.w/2, this.y+this.h/2+textSize()/3);
                    textAlign(LEFT);
                }
            }
        
    }
}
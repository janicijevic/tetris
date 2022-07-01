
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
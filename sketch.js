
/*
TODO:
-Add menu when starting game
-Resize canvas based on how many tetris instances there are
-implement online multiplayer either through socket.io or WebRtc peer to peer communication

*/
let socket;

let frames;
let p1keys = [83, 65, 68, 87];
let p2keys = [40, 37, 39, 38];
let DOWN_BUTTON = 0; let LEFT_BUTTON = 1; let RIGHT_BUTTON = 2; let UP_BUTTON = 3;
let buttons = [];
let menuButtons = [];
let textBox;
let menuColor = 170;
let menuChange = 1;
let tetris = []
let states = {
    MENU : {
        START : 0, PAUSE : 1, GAMEOVER : 2
    }, 
    PLAYING: 3
}
let SINGLE = 0; let DOUBLE = 2; let ONLINE = 3; let NONE = 4
let mode = SINGLE;
let MENU = 0; let PLAYINGSINGLE = 1; let PLAYINGDOUBLE = 2; let PAUSED = 2; let GAMEOVER = 3;
let state;
let selected = -1;
let xOff;
let roomCode = "";
let connecting = false;
let cancelButton;
let connectMessage;
let recievedButton = false
let connected = false;
let quitting = false;
let gameOverText = "";

function resizeGame(){
    console.log("resizing")
    if(mode == SINGLE){
        if(isMobile){
            blockW = Math.round(deviceW/22);
        }
        
        calculate()
        resizeCanvas(blockW*12+w, height);
    }
    else{
        if(isMobile){
            blockW = Math.round(deviceW/28);
        }
        calculate()
        resizeCanvas(blockW*28, height);
    }
    initializeButtons();

}


function initializeButtons(){
    menuButtons[states.MENU.START] = [new Button(blockW*6, blockW*3/2, "Singleplayer"), new Button(blockW*6, blockW*3/2, "Local vs"),
                                      new Button(blockW*6, blockW*3/2, "Online")];
    menuButtons[states.MENU.PAUSE] = [new Button(blockW*6, blockW*3/2, "Resume"), new Button(blockW*6, blockW*3/2, "Back to Menu")];
    menuButtons[states.MENU.GAMEOVER] = [new Button(blockW*6, blockW*3/2, "New Game"), new Button(blockW*6, blockW*3/2, "Back to Menu")];

    //Set button positions
    for(let s = 0; s < menuButtons.length; s++){
        for(let i = 0; i<menuButtons[s].length; i++){
            menuButtons[s][i].setPos(width/2-menuButtons[s][i].w/2, height-10*blockW+i*blockW*3);
        }
    }
    cancelButton = new Button(blockW*6, blockW*3/2, "Cancel")
    cancelButton.setPos(width/2-cancelButton.w/2, height/2+blockW)
    if(isMobile){
        buttons[3].setPos(width/2-buttons[3].w/2, areaH*blockW+blockW);
        buttons[0].setPos(width/2-buttons[0].w/2, buttons[3].y+buttons[3].h*2);
        buttons[1].setPos(width/2-3*buttons[3].w/2, buttons[3].y+buttons[3].h);
        buttons[2].setPos(width/2+buttons[3].w/2, buttons[3].y+buttons[3].h);
    }

    if(isMobile) menuButtons[states.MENU.START][1].active = false;
}


function initializeGame(){
    textSize(2/3*blockW);
    buttons = []
    tetris = []
    Tetris.numOfInstances = 0;
    tetris[0] = new Tetris(0, 0, xOffset);//[83, 65, 68, 87]
    buttons.push(new Button(), new Button(), new Button(), new Button());
    if(mode == DOUBLE || mode == ONLINE){
        tetris[1] = new Tetris(w+xOffset, xOffset, 0, mode == ONLINE? [1, 1, 1, 1]:p1keys);
        buttons.push(new Button(), new Button(), new Button(), new Button());
    }
    else xOff = blockW*12+w;
    if(mode != ONLINE) buttons.push(new Button(blockW*3/2, blockW*3/2, "PauseButton", blockW/2, 0)); //Pause button
    frames = 0;
    state = states.PLAYING;
    //Init tetrises
    if(mode != ONLINE)Tetris.seed = Math.random()*10000
    for(let i = 0; i< tetris.length; i++) tetris[i].initialize();
    initializeButtons()
}


function setup(){
    //Declare and initialize tetris and its buttons
    xOff = w+xOffset
    textBox = createInput();
    textBox.elt.placeholder = "Room name"
    textBox.input(()=>{
        roomCode = textBox.value();
    })
    initializeGame()
    state = states.MENU.START;
    createCanvas(tetris.length*xOff, h+yOffset);
    textFont('Lucida Console');
    initializeButtons();
    // socket = io.connect("http://localhost:3000");
    socket = io.connect('http://petris-online.herokuapp.com')
    socket.on('connect', () =>{
        console.log("Successfully connected to server");
        menuButtons[states.MENU.START][2].active = true;
        textBox.elt.disabled = false;
        connected = true;
    });
    socket.on("disconnectMessage", data =>{
        gameOverText = "Disconnected";
        state = states.MENU.GAMEOVER;
        quitting = false;
    })
    socket.on('connectFeedback', data =>{
        connectMessage = data.msg;
    });
    socket.on('startGame', msg =>{
        state = states.PLAYING;
        mode = ONLINE
        resizeGame()
        Tetris.seed = msg.seed;
        initializeGame();

        console.log(Tetris.seed)
        connecting = false;
    })
    socket.on("buttonPress", data =>{
        recievedButton = true;
        console.log("recieved", data);
        keyCode = tetris[1].keyCodes[data.keyCode];
        keyPressed();
    })
    socket.on("setButtonsPressed", data =>{
        tetris[1].buttonsPressed = data.buttonsPressed;
    })
    socket.on("update", data =>{
        tetris[1].b.x = data.tetris.b.x;
        tetris[1].b.y = data.tetris.b.y;
        tetris[1].b.rot = data.tetris.b.rot;
        tetris[1].b.color = data.tetris.b.color;
        tetris[1].b.type = data.tetris.b.type;
        tetris[1].b.map = data.tetris.b.map;
        tetris[1].stat = data.tetris.stat;
        tetris[1].score = data.tetris.score;
        tetris[1].lines = data.tetris.lines;
        tetris[1].levels = data.tetris.levels;
        tetris[1].gameOver = data.tetris.gameOver;
        tetris[1].winner = data.tetris.winner;
    })
}

function disconnect(){
    socket.emit("disconnectMessage", {roomCode: roomCode})
}

function keyPressed(){
    // socket.emit("setButtonsPressed", {buttonsPressed: tetris[0].buttonsPressed, roomCode: roomCode})
    if(state == states.PLAYING){
        if(keyCode == 27 && mode != ONLINE) state = states.MENU.PAUSE;
        if(keyCode == 27 && mode == ONLINE) quitting = !quitting;
        for(let i = 0; i< tetris.length; i++) tetris[i].keyPressed(keyCode);
        
        if(keyCode == 13){
            if(tetris.length == 1 && tetris[0].gameOver) tetris[0].winner = true;
            for(let i = 0; i<tetris.length; i++){
                if(tetris[i].winner) state = states.MENU.GAMEOVER;
            }
        }
    }
    else if(state == states.MENU.START || state == states.MENU.PAUSE || state == states.MENU.GAMEOVER){
        //Arrow key selection of menu buttons
        if(keyCode == UP_ARROW){
            selected -= 1;
            selected = modulo(selected, menuButtons[state].length);
        }
        if(keyCode == DOWN_ARROW){
            selected += 1;
            selected = modulo(selected, menuButtons[state].length);
        }
        if(keyCode == RETURN){
            console.log(selected)
            if(selected != -1) menuButtons[state][selected].press();
        }
    }
}


function keyReleased(){
    if(state == states.PLAYING){
        for(let i = 0; i< tetris.length; i++) tetris[i].keyReleased()
    }
}

function touchStarted(){
    if(state == states.MENU.START || state == states.MENU.PAUSE || state == states.MENU.GAMEOVER){
        if(connecting){
            if(cancelButton.pressing(mouseX, mouseY)) {
                connecting = false
                disconnect();
            }
            return;
        }

        for(let i = 0; i<menuButtons[state].length; i++){
            if(menuButtons[state][i].pressing(mouseX, mouseY) && menuButtons[state][i].active){
                menuButtons[state][i].press()
                return
            }
        }
    }
    else if(state == states.PLAYING){
        if(quitting){
            if(cancelButton.pressing(mouseX, mouseY)){
                quitting = false;
                disconnect();
                state = states.MENU.GAMEOVER;
            }
            return;
        }
        //If someone won end the game
        if(tetris.length == 1 && tetris[0].gameOver) tetris[0].winner = true;
        for(let i = 0; i<tetris.length; i++){
            if(tetris[i].winner && mouseY < h) {
                state = states.MENU.GAMEOVER;
                disconnect();
            }
        }
        for(let i = 0; i < buttons.length; i++){
            if(buttons[i].pressing(mouseX, mouseY)){
                buttons[i].press(i)
                return;
            }
        }
    }
    else{
        if(mouseY < areaH*blockW){
            if(state == states.MENU.GAMEOVER) initializeGame();
            else if(state == states.MENU.PAUSE) {
                if(buttons[buttons.length-1].pressing(mouseX, mouseY)){
                    state = states.PLAYING;
                }
            }
        }
    }
}
function touchEnded(e){
    e.preventDefault();
    for(let i = 0; i< tetris.length; i++) tetris[i].buttonsPressed = [false, false, false];
    // socket.emit("setButtonsPressed", {buttonsPressed: tetris[0].buttonsPressed, roomCode: roomCode})
}


function renderPage(txt, tSize){
    background(menuColor, 0, 0);
    //Change color
    if(menuColor > 255) menuChange = -1;
    else if(menuColor < 0) menuChange = 1;
    menuColor += menuChange;
    //Display Buttons
    for(let i = 0; i < menuButtons[state].length; i++){
        let bold = false;
        if(menuButtons[state][i].pressing(mouseX, mouseY)) selected = i;
        if(connecting) selected = -1
        if(selected == i) bold = true;
        menuButtons[state][i].color = [255-menuColor, 0, menuColor]
        menuButtons[state][i].textColor = menuColor;
        if(menuButtons[state][i].text == "Online"){
            textBox.show();
            textBox.size(menuButtons[state][i].w, menuButtons[state][i].h/2);
            textBox.position(menuButtons[state][i].x, menuButtons[state][i].y+menuButtons[state][i].h+2)
            textBox.elt.style.backgroundColor = rgbToHex(menuButtons[state][i].color)
            textBox.elt.style.color = rgbToHex([menuColor, menuColor, menuColor])
        }
        menuButtons[state][i].draw(bold);
    }
    //Display Text
    push()
        textAlign(CENTER);
        textSize(tSize);
        stroke(0)
        strokeWeight(5);
        fill(255-menuColor, 0, 0);
        text(txt, width/2, height/4);
    pop();
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex([r, g, b]) {
return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function draw(){      


    if(state == states.MENU.START){
        renderPage("TETRIS", width/5)
        if(connecting){
            push()
            fill(100, 100, 100, 200);
            rect(width/4, height/3, width/2, height/3);
            fill(255);
            textAlign(CENTER)
            if(connectMessage == undefined)connectMessage = "Connecting";
            text(connectMessage, width/2, height/2)
            pop()
            let bold = false;
            if(cancelButton.pressing(mouseX, mouseY)) bold = true;
            cancelButton.draw(bold)
            textBox.elt.disabled = true
        }
        //Disable online buttons
        if(!connected){
            menuButtons[states.MENU.START][2].active = false;
            textBox.elt.disabled = true;
        }
        else{
            textBox.elt.disabled = false;
        }

    }    
    else{
        textBox.hide();
    }
    // Pause menu
    if(state == states.MENU.PAUSE){
        renderPage("Paused", width/8);
    }
    //Game over screen
    if(state == states.MENU.GAMEOVER){
        if(gameOverText != "Disconnected")gameOverText = "Game Over \n";
        if(mode == ONLINE){
            if(tetris[0].winner){
                gameOverText+= "You won"
            }
            else if(tetris[1].winner) gameOverText+= "You lost";
        }
        renderPage(gameOverText, width/15);
    }
    else if(state == states.PLAYING){
        for (let j = 0; j<3; j++){
            for(let i = 0; i< tetris.length; i++) tetris[i].isKeyDown(buttons[j+4*i], j)
        }
        
        // Main loop ---------------------------------------------------------
        frames++;
        for(let i = 0; i< tetris.length; i++) tetris[i].update(frames);


        // #Crtanje ------------------------------------------------------
        background(255, 255, 255);
        
        for(let i = 0; i< tetris.length; i++) {
            tetris[i].draw();
        }
        for(let i = 0; i<buttons.length; i++){
            buttons[i].draw();
        }
        
        //Score
        fill(0)
        if(tetris.length == 2){
            textAlign(CENTER);
            let lSpace, rSpace;
            text(getCenteredString(tetris[0].score, "|Score|", tetris[1].score), width/2, 8*blockW);
            text(getCenteredString(tetris[0].lines, "|Lines|", tetris[1].lines), width/2, 10*blockW);
            text(getCenteredString(tetris[0].level, "|Level|", tetris[1].level), width/2, 12*blockW);
        }
        else{
            textAlign(LEFT);
            text('Score:'+tetris[0].score, blockW/2, 4*blockW);
            text('Lines:'+tetris[0].lines, blockW/2, 6*blockW);
            text('Level:'+tetris[0].level, blockW/2, 8*blockW);
        }

        if(quitting){
            push()
            fill(100, 100, 100, 200);
            rect(width/4, height/3, width/2, height/3);
            fill(255);
            textAlign(CENTER)
            text('Quit?', width/2, height/2)
            pop()
            let bold = false;
            if(cancelButton.pressing(mouseX, mouseY)) bold = true;
            cancelButton.text = "Yes"
            cancelButton.draw(bold)
        }
        else{
            cancelButton.text = "Cancel"
        }

        //Check if both tetrises have finished
        let s = 0;
        for(let i = 0; i<tetris.length; i++){
            if(tetris[i].gameOver) s++
        }
        if(s > 1){
            if(tetris[0].score > tetris[1].score) tetris[0].winner = true;
            else if(tetris[1].score > tetris[0].score) tetris[1].winner = true;
        }
    }
 
}

function getCenteredString(ln, t, rn){
    lLen = ln.toString().length;
    rLen = rn.toString().length;
    rSpace = lSpace = ''
    if(rLen > lLen) lSpace = ' '.repeat(rLen-lLen)
    else rSpace = ' '.repeat(lLen-rLen)
    return ln+lSpace+t+rSpace+rn
}
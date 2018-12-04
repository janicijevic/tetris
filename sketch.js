let scale = 20;
let grid;
let c = 0;
let speed = 10;
let currentBlock = -1;

let blockTypes = {
    0: [['0000', '1111'], 2],
    1: [['1000', '1110'], 4],
    2: [['0010', '1110'], 4],
    3: [['1100', '1100'], 1],
    4: [['0110', '1100'], 2],
    5: [['0100', '1110'], 4],
    6: [['1100', '0110'], 2]
}

function setup() {
    createCanvas(600, 600);
    grid = [];
    for(let i = 0; i < width/2/scale; i++){
        let tmp = [];
        for(let j = 0; j < height/scale; j++){
            tmp.push(2);
        }
        grid.push(tmp);
    }
    new Block();
    
    //Configuring buttons
    down = document.getElementById("down");
    left = document.getElementById("left");
    right = document.getElementById("right");
    down.onclick = function(){
        keyCode = DOWN_ARROW;
        keyPressed();
    }
    left.onclick = function(){
        keyCode = LEFT_ARROW;
        keyPressed();
    }
    right.onclick = function(){
        keyCode = RIGHT_ARROW;
        keyPressed();
    }

}

function draw() {
    c++;
    
    background(50);
    drawGrid();

    // frame rate according to c
    if (c >= speed){
        Block.updateAll();
        c = 0;
    }

    
}

function mousePressed(){
    //two = new Block();
}

function keyPressed(){
    let block = Block.blocks[currentBlock];
    if(block.active){
        if (keyCode == LEFT_ARROW){
            if(block.x-1 >= 0){
                block.setBlock(0);
                block.x-=1;
                block.setBlock(1);
            }
        }
        if (keyCode == RIGHT_ARROW){
            if(block.x+4 < width/2/scale){
                block.setBlock(0);
                block.x+=1;
                block.setBlock(1);
            }
        }
        if (keyCode == DOWN_ARROW){
            speed = 1;
        }
        if(keyCode == UP_ARROW){
            block.rotate();
        }
    }
}

function drawGrid(){
    // Draws the tetris grid
    noFill();
    stroke(255);
    for(let i = 0; i < grid.length; i++){
        for(let j = 0; j < grid[i].length; j++){
            (grid[i][j] == 0) ? noFill() : fill(255);
            if (grid[i][j] == 2){
                fill(255, 0, 0);
            }
            rect(i*scale+width/4, j*scale, scale, scale)
        }
    }
}

class Block{
    
    
    constructor(){
        Block.blocks.push(this);
        // x and y for grid
        this.x = floor(random(10));
        this.y = -2;
        // type of block used to get layers from blockTypes object
        this.type = floor(random(7));
        this.top = blockTypes[this.type][0][0];
        this.bottom = blockTypes[this.type][0][1];
        this.active = true;
        this.variations = blockTypes[this.type][1];
        this.rotation = 0;
        currentBlock+=1;
    }

    static updateAll(){
        for(let i = 0; i < Block.blocks.length; i++){
            Block.blocks[i].update();
        }
    }

    update(){
        if(this.isNextClear()){
            this.setBlock(0);
            this.y += 1;
            this.setBlock(1);
        }
    }

    isNextClear(){
        if(this.y+2>=height/scale){
            this.hitGround()
            return false;
        }
        
        for(let i = 0; i<4; i++){
            if (this.bottom[i] == 0){
                if (grid[this.x+i][this.y+1] == 1 ){
                    this.hitGround()
                    return false;
                }
            }else if (grid[this.x+i][this.y+2] == 1){
                this.hitGround()
                return false;
            }
        }
        return true;
    }
    setBlock(n){
        for (let i = 0; i<4; i++){
            if (this.top[i] == 1){
                grid[this.x+i][this.y] = 1*n;
            }
            if (this.bottom[i] == 1){
                grid[this.x+i][this.y+1] = 1*n;
            }
            //grid[this.x+i][this.y+1] = n*this.bottom[i];
        }
    }
    
    hitGround(){
        if (this.active){
            this.active = false;
            speed = 10;
            new Block();
            if(this.y<=1){
                document.querySelector('.para').innerHTML = "You Lost";
                noLoop();
            }
        } 
    }

    rotate(){
        this.rotation++;
        this.rotation %= this.variations;
        if(this.rotation == 1){
            this.left = this.top;
            this.right = this.bottom;
        }else if(this.rotation == 0){
            this.top = this.left;
            this.bottom = this.right;
        }
    }

}

Block.blocks = [];

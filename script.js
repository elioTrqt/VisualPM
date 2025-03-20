// Create an SVG container
const svg = d3.select('#display')
.append('svg')
.attr('width', 2000)
.attr('height', 500);

const speed = 1;


function GraphicList(x, y, w){
    this.content = [];
    this.group = svg.append('g');
    this.x = x;
    this.y = y;
    this.width = w;

    this.current_x = x;
    this.current_y = y;

    this.set_pos = function (x, y, w) {
        this.cells.x_init = x;
        this.cells.y_init = y;
        this.cells.width = w;
    };

    this.init = function (T) {
        this.group.selectAll("*").remove();
        this.content = T;
        let current_x = this.x;
        for (let i=0; i < this.content.length; i++){
            this.group.append('rect')
                .attr('x', current_x)
                .attr('y', this.y)
                .attr('width', this.width) 
                .attr('height', this.width)
                .attr('fill', 'white')
                .attr('stroke', 'black')
                .attr('id', `cell_${i}`);

            this.group.append("text")
                .attr("x", current_x + 24)
                .attr("y", this.y + 27.5)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle") 
                .attr("fill", "black") 
                .attr("font-size", "25px")
                .text(this.content[i])
                .attr('id', `text_${i}`);
            
            current_x += this.width;
        }
    };

    this.move_to = function (x_to, y_to){ 
        this.group.transition()
            .duration(Math.sqrt(Math.pow(this.current_x - x_to, 2) + Math.pow(this.current_y - y_to, 2)) / speed)
            .attr("transform", `translate(${x_to - this.x}, ${y_to - this.y})`);
        this.current_x = x_to;
        this.current_y = y_to;
    }

    this.shift = function (d){
        const dest = this.current_x + d * this.width;
        this.group.transition()
            .duration(x / speed)
            .attr("transform", `translate(${dest - this.x}, ${this.current_y - this.y})`);
        this.current_x = dest;
    }

    this.set_color = function (i, color){
        this.group.select(`#cell_${i-1}`).attr('fill', color);
    }

    this.reset_color = function (){
        for(let i=0; i < this.content.length; i++){
            this.group.select(`#cell_${i}`).attr('fill', 'white');
        }
    }

    this.set = function (i, value){
        this.group.select(`#text_${i-1}`).text(value);
        this.content[i-1] = value;
    }

    this.get = function (i){
        return this.content[i-1];
    }
}


function RechercheNaive(P, T){
    this.P = P;
    this.T = T;
    this.m = this.P.content.length;
    this.n = this.T.content.length;

    this.pos = 1;
    this.i = 1;

    this.state = 'check';

    this.next = function(){
        if (this.state == 'check'){
            if (this.P.get(this.i) == this.T.get(this.pos + this.i - 1)){
                this.P.set_color(this.i, 'green');
                this.T.set_color(this.pos + this.i - 1, 'green');
                this.i++;
                if (this.i == this.m + 1){
                    console.log(`TROUVÉ : Occurence à la position ${this.pos}`);
                    if (this.pos + 1 > this.n - this.m + 1){
                        console.log('FINI');
                        this.state = 'done';
                    } else {
                        this.state = 'move';
                    }
                }
            }
            else {
                this.P.set_color(this.i, 'red');
                this.T.set_color(this.pos + this.i - 1, 'red');
                if (this.pos + 1 > this.n - this.m + 1){
                    console.log('FINI');
                    this.state = 'done';
                } else {
                    this.state = 'move';
                }
            }
        }
        else if (this.state == 'move'){
            this.P.reset_color();
            this.T.reset_color();
            this.pos++;
            this.i = 1;
            this.P.shift(1);
            this.state = 'check';
        }
    }

    this.reset = function (){
        this.P.reset_color();
        this.T.reset_color();
        this.P.move_to(this.P.x, this.P.y);
        
        this.pos = 1;
        this.i = 1;
    
        this.state = 'check';
    }
}

function MPTable(x, y, w, pattern){
    this.x = x;
    this.y = y;
    this.width = w;

    this.current_x = x;
    this.current_y = y;

    this.indices = new GraphicList(x, y, w);
    this.P = new GraphicList(x, y+w, w);
    this.bord = new GraphicList(x, y+2*w, w);
    this.mp = new GraphicList(x, y+3*w, w);

    this.indices.init(Array.from({ length: pattern.length + 1 }, (_, index) => index+1));
    this.P.init(pattern.concat([""]));
    this.bord.init(Array(pattern.length + 1).fill(""));
    this.mp.init(Array(pattern.length + 1).fill(""));

    this.m = this.P.content.length - 1;
    this.state = 'bord';
    this.indices.set_color(1, 'grey');
    this.i = 1;
    this.j = -1;

    this.colorBords = function (b){
        this.P.reset_color();
        for (let k = 1; k <= b; k++){
            this.P.set_color(k, 'green');
            this.P.set_color(this.i-k+1, 'green');
        }
    }

    this.next = function (){
        if (this.state == 'bord'){
            this.nextBord();
        }
        else if (this.state == 'trans'){
            this.P.reset_color();
            this.indices.reset_color();
            this.indices.set_color(1, 'grey');
            this.i = 0;
            this.j = 0;
            this.state = 'mp';
        }
        else if (this.state == 'mp'){
            this.nextMP();
        }
        else if (this.state == 'done'){
            this.P.reset_color();
            this.indices.reset_color();
        }
    }

    this.nextMP = function(){
        if (this.i==0){
            this.mp.set(1, 0);
            if (this.i == this.m){
                console.log('done')
                this.state = 'done';
            } else {
                this.i++;
            }
            return;
        }

        this.indices.reset_color();
        this.indices.set_color(this.i + 1, 'grey');

        while(this.j > 0 && this.P.get(this.i) != this.P.get(this.j)){
            this.j = this.mp.get(this.j);
        }
        this.j++;
        this.mp.set(this.i + 1, this.j);

        this.P.reset_color();
        this.P.set_color(this.j, 'green');
        if (this.i == this.m){
            console.log('done')
            this.state = 'done';
        } else {
            this.i++;
        }
    }

    this.nextBord = function(){
        this.indices.reset_color();
        this.indices.set_color(this.i, 'grey');
        while(this.j >= 0 && this.P.get(this.i) != this.P.get(this.j + 1)){
            this.j = this.j > 0 ? this.bord.get(this.j) : -1;
        }
        this.P.reset_color();
        this.bord.set(this.i, this.j + 1);
        this.colorBords(this.j + 1);
        if (this.i == this.m){
            this.state = 'trans';
        } else {
            this.j = this.bord.get(this.i)
            this.i++;
        }
    }

    this.get = function (i) {
        return this.mp.get(i);
    }
}


function MPSearch(P, T, table){
    this.P = P;
    this.T = T;
    this.m = this.P.content.length;
    this.n = this.T.content.length;
    this.MP = table;

    this.table_done = false;
    this.state = 'check';
    this.i = 1;
    this.j = 1;

    this.nextSearch = function (){
        if (this.state == 'check'){
            if (this.P.get(this.i) != this.T.get(this.j)){
                this.P.set_color(this.i, 'red');
                this.T.set_color(this.j, 'red');
                this.state = 'move';
            } else {
                this.P.set_color(this.i, 'green');
                this.T.set_color(this.j, 'green');
                this.i++;
                this.j++;
                if (this.i == this.m + 1){
                    console.log(`TROUVÉ : Occurence à la position ${this.j - this.i + 1}`);
                    this.state = 'move';
                }
                if (this.j > this.n){
                    console.log('FINI');
                    this.state = 'done';
                }
            }
        }
        else if (this.state == 'move'){
            for (let i = this.MP.get(this.i); i <= this.m; i++){
                this.P.set_color(i, 'white');
                this.T.set_color(this.j-i, 'white');
            }
            this.T.set_color(this.j, 'white');
            this.P.shift(this.i - this.MP.get(this.i));
            this.i = this.MP.get(this.i);
            this.state = 'check';
            if (this.i == 0){
                this.i++;
                this.j++;
                if (this.j > this.n){
                    console.log('FINI');
                    this.state = 'done';
                }
            }
        }
    }

    this.computeTable = function () {
        while(this.MP.state != 'done'){
            this.MP.next();
        }
        this.MP.next();
    }
}


var pattern = new GraphicList(100, 200, 50);
pattern.init("abacaba".split(""));

var text = new GraphicList(100, 100, 50);
text.init("ababacabacbabbabacababbabacaba".split(""));

var rn = new RechercheNaive(pattern, text);
var mp = new MPTable(100, 300, 50, pattern.content);
var mps = new MPSearch(pattern, text, mp);
mps.computeTable();

function next_step(){
    mps.nextSearch();
}

function reset_alg(){
    rn.reset();
}
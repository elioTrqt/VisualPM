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

    this.current_x = x;
    this.current_y = y;

    this.width = w;
    this.set_pos = function (x, y, w) {
        this.cells.x_init = x;
        this.cells.y_init = y;
        this.cells.width = w;
    };

    this.init = function (T) {
        this.group.selectAll("*").remove();
        this.content = T.split("");
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
                .text(this.content[i]);
            
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


var pattern = new GraphicList(100, 200, 50);
pattern.init("aba");

var text = new GraphicList(100, 100, 50);
text.init("ababbab");

var rn = new RechercheNaive(pattern, text);

function next_step(){
    rn.next();
}

function reset_alg(){
    rn.reset();
}
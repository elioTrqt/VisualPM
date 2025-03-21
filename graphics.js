// Create an SVG container
const svg = d3.select('#display')
.append('svg')
.attr('width', 2000)
.attr('height', 800);

const speed = 1;


function GraphicList(x, y, w, pattern=[]){
    this.content = pattern;
    this.arrow = svg.append('g');
    this.group = svg.append('g');
    this.x = x;
    this.y = y;
    this.width = w;

    this.current_x = x;
    this.current_y = y;

    this.set_pattern = function (T) {
        this.group.selectAll("*").remove();
        this.content = T;
        let x = this.x;
        for (let i=0; i < this.content.length; i++){
            this.group.append('rect')
                .attr('x', x)
                .attr('y', this.y)
                .attr('width', this.width) 
                .attr('height', this.width)
                .attr('fill', 'white')
                .attr('stroke', 'black')
                .attr('id', `cell_${i}`);

            this.group.append("text")
                .attr("x", x + 24)
                .attr("y", this.y + 27.5)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle") 
                .attr("fill", "black") 
                .attr("font-size", "25px")
                .text(this.content[i])
                .attr('id', `text_${i}`);
            
            x += this.width;
        }
    };

    this.set_pattern(pattern);

    this.empty = function (){
        this.reset_color();
        this.set_pattern(Array(this.content.length).fill(""));
    }

    this.set = function (i, value){
        if (i-1 < this.content.length){
            this.group.select(`#text_${i-1}`).text(value);
            this.content[i-1] = value;
        }
    }

    this.get = function (i){
        if (i-1 < this.content.length){
            return this.content[i-1];
        }
        else{
            return null;
        }
    }

    this.move_to = function (x_to, y_to){ 
        this.group.transition()
            .duration(Math.sqrt(Math.pow(this.current_x - x_to, 2) + Math.pow(this.current_y - y_to, 2)) / speed)
            .attr("transform", `translate(${x_to - this.x}, ${y_to - this.y})`);
        this.current_x = x_to;
        this.current_y = y_to;
    }

    this.shift = function (d){
        this.arrow.selectAll("*").remove();
        const dest = this.current_x + d * this.width;
        this.move_to(dest, this.current_y);
    }

    this.set_arrow = function (from, to, color) {
        this.arrow.selectAll("*").remove();

        const len = this.width * (to - from);
        const x1 = this.current_x + this.width * from - this.width / 2;
        const x2 = x1 + len - 25;
        const y1 = this.current_y + 1.5 * this.width;

        this.arrow.append("line")
            .attr("x1", x1 + 1.5)
            .attr("y1", y1 - 0.5 * this.width)
            .attr("x2", x1 + 1.5)
            .attr("y2", y1)
            .attr("stroke", color)
            .attr("stroke-width", 3);

        this.arrow.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y1)
            .attr("stroke", color)
            .attr("stroke-width", 3);

        this.arrow.append("path")
            .attr("d", `M${x1 + len - 25}, ${y1 - 25 / 2}
                        L${x1 + len}, ${y1}
                        L${x1 + len - 25}, ${y1 + 25 / 2}`)
            .attr("fill", color);
    }

    this.reset_arrow = function (){
        this.arrow.selectAll("*").remove();
    }

    this.set_color = function (i, color){
        this.group.select(`#cell_${i-1}`).attr('fill', color);
    }

    this.reset_color = function (){
        for(let i=0; i < this.content.length; i++){
            this.group.select(`#cell_${i}`).attr('fill', 'white');
        }
    }

    this.reset = function(){
        this.reset_color();
        this.reset_arrow();
        this.move_to(this.x, this.y);
    }

    this.clean = function (){
        this.group.remove();
        this.arrow.remove();
    }
}
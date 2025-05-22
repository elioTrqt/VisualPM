// @ts-ignore
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export type D3selec<T extends SVGGraphicsElement> = d3.Selection<T, unknown, null | HTMLElement, undefined>;

export class Vector {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(other: Vector): Vector {
        return new Vector(this.x + other.x, this.y + other.y);
    }
    sub(other: Vector): Vector {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    len(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.x, 2));
    }
};

export class Graphic {
    readonly group: D3selec<SVGGElement>;     // Root
    readonly pos: Vector;   // initial postion
    trans: Vector;          // translation
    speed: number;

    constructor(parent: D3selec<SVGGraphicsElement>, pos: Vector, anim_speed: number){
        this.pos = pos;
        this.trans = new Vector(0, 0);
        this.group = parent.append("g");
        this.speed = anim_speed;
    }

    get_pos(): Vector {
        return this.pos.add(this.trans);
    }

    set_pos(dest: Vector, anim?: number): void {
        let t : Vector = dest.sub(this.get_pos());
        this.translate(t, anim?anim:this.speed);
    }

    reset_pos(): void {
        this.set_pos(this.pos);
    }

    translate(t: Vector, anim?: number): void {
        this.trans = this.trans.add(t);
        this.group.transition()
            .duration(anim?anim:this.speed * t.len())
            .attr("transform", `translate(${this.trans.x}, ${this.trans.y})`);
    }

    clear(): void {
        this.group.selectAll("*").remove();
    }

    remove(): void {
        this.group.remove();
    }

    set_speed(s: number){
        this.speed = s;
    }
}


export class GraphicList extends Graphic {
    values: Array<string | number | null>;
    cell_width: number;

    constructor(parent: D3selec<SVGGraphicsElement>, pos: Vector, anim_speed: number, w: number, vals: Array<string | number> | number = 0){
        super(parent, pos, anim_speed);
        this.cell_width = w;

        if (typeof vals !== "number"){
            this.values = vals;
        } else {
            this.values = new Array(vals).fill(null);
        }

        this.draw();
    };

    draw() : void {
        this.clear();
        let cur_x = this.pos.x;
        for (let i=0; i < this.values.length; i++){
            this.group.append('rect')
                .attr('x', cur_x)
                .attr('y', this.pos.y)
                .attr('width', this.cell_width) 
                .attr('height', this.cell_width)
                .attr('fill', 'white')
                .attr('stroke', 'black')
                .attr('id', `cell_${i}`);

            this.group.append("text")
                .attr("x", cur_x + 24)
                .attr("y", this.pos.y + 27.5)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle") 
                .attr("fill", "black") 
                .attr("font-size", "25px")
                .text(this.values[i]===null?'':`${this.values[i]}`)
                .attr('id', `text_${i}`);
            
            cur_x += this.cell_width;
        }
    }

    get(i: number, off: number = 1) : string | number | null{
        return this.values[i-off];
    }

    set_value(i: number, val: string | number | null, off: number = 1) : void {
        if (i - off  < this.values.length){
            this.values[i-off] = val;
            this.group.select(`#text_${i-off}`).text(val===null?'':`${val}`);
        }
    }

    set_values(val: Array<string | number | null>): void {
        this.values = val;
        this.draw();
    }

    fill_values(val: string | number | null): void {
        this.set_values(new Array(this.values.length).fill(val));
    }

    set_color(i: number, val: string, off: number = 1): void {
        if (i - off < this.values.length){
            this.group.select(`#cell_${i-off}`).attr('fill', val);
        }
    }

    set_colors(cols: Array<string>): void {
        for (let i=0; i < cols.length; i++){
            this.set_color(i, cols[i]);
        }
    }

    fill_color(val: string): void {
        for (let i = 0; i < this.values.length; i++){
            this.set_color(i, val, 0);
        }
    }

    shift(d: number, anim?: number): void {
        this.translate(new Vector(d*this.cell_width, 0), anim?anim:this.speed);
    }

    set_shift(d: number, anim?: number): void {
        this.set_pos(this.pos.add(new Vector(d*this.cell_width, 0)), anim?anim:this.speed);
    }

    /*
    h and v are horizontal and vertical offset, by default middle of the cell is given
    h = 1 mean right, h= -1 mean left, and v= 1 or -1 mean bot and top respectively
    0 mean center for h or v
    */
    get_cell_pos(i: number, h: number, v: number, offset: number = 1): Vector {
        const center = this.pos.add(new Vector((i-offset+0.5)*this.cell_width, 0.5*this.cell_width));
        return center.add(new Vector(0.5*h*this.cell_width, 0.5*v*this.cell_width));
    }
}


export class Arrow extends Graphic{
    line: D3selec<SVGLineElement>;
    //marker: d3.Selection<SVGMarkerElement, unknown, null, undefined>;
    start: Vector;
    end: Vector;
    start_trans: Vector;
    end_trans: Vector;
  
    constructor(parent: D3selec<SVGGraphicsElement>, start: Vector, end: Vector, anim_speed: number, color: string) {
        super(parent, start, anim_speed);
        this.start = start;
        this.end = end;
        this.start_trans = new Vector(0, 0);
        this.end_trans = new Vector(0, 0);
        
        // Define the marker for the arrowhead
        this.group
            .append("defs")
            .append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 8)
            .attr("refY", 5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto-start-reverse")
            .append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 z")
            .attr("fill", color)
            .attr("stroke", color);
    
        // Create the line representing the arrow
        this.line = this.group
            .append("line")
            .attr("stroke", color)
            .attr("stroke-width", 2)
            .attr("x1", this.start.x)
            .attr("x2", this.end.x)
            .attr("y1", this.start.y)
            .attr("y2", this.end.y)
            .attr("marker-end", "url(#arrowhead)");
    }

    translate_start(t: Vector, anim?: number): void {
        this.start = this.start.add(t);
        this.update(anim?anim:this.speed * t.len());
    }

    translate_end(t: Vector, anim?: number): void {
        this.end = this.end.add(t);
        this.update(anim?anim:this.speed * t.len());
    }
;
    set_start(t: Vector, anim?: number): void {
        const duration = anim?anim:this.speed * this.start.sub(t).len();
        this.start = t;
        this.update(duration);
    }

    set_end(t: Vector, anim?: number): void {
        const duration = anim?anim:this.speed * this.end.sub(t).len();
        this.end = t;
        this.update(duration);
    } 

    update(duration: number): void {
        this.line.transition()
            .duration(duration)
            .attr("x1", this.start.x) 
            .attr("y1", this.start.y)
            .attr("x2", this.end.x) 
            .attr("y2", this.end.y);
    }
}
// @ts-ignore
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { Vector } from "./vector.js";

export type D3selec<T extends SVGGraphicsElement> = d3.Selection<T, unknown, null | HTMLElement, undefined>;

export class Graphic {
    readonly pos: Vector;   // initial postion
    trans: Vector;          // translation
    readonly group: D3selec<SVGGElement>;     // Root

    constructor(parent: D3selec<SVGGraphicsElement>, pos: Vector){
        this.pos = pos;
        this.trans = new Vector(0, 0);
        this.group = parent.append("g");
    }

    get_pos(): Vector {
        return this.pos.add(this.trans);
    }

    set_pos(dest: Vector): void {
        let t : Vector = dest.sub(this.get_pos());
        this.translate(t);
    }

    reset_pos(): void {
        this.set_pos(this.pos);
    }

    translate(t: Vector, speed: number = 0): void {
        this.trans = this.trans.add(t);
        this.group.transition()
            .duration(speed * t.len())
            .attr("transform", `translate(${this.trans.x}, ${this.trans.y})`);
    }

    clear(): void {
        this.group.selectAll("*").remove();
    }

    remove(): void {
        this.group.remove();
    }
}


export class GraphicList extends Graphic {
    values: Array<string | number | null>;
    cell_width: number;
    anim_speed = 1;

    constructor(parent: D3selec<SVGGraphicsElement>, pos: Vector, w: number, vals: Array<string | number> | number = 0){
        super(parent, pos);
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

    set(i: number, val: string | number | null, off: number = 1) : void {
        if (i - off  < this.values.length){
            this.values[i-off] = val;
            this.group.select(`#text_${i-off}`).text(val===null?'':`${val}`);
        }
    }

    set_values(val: Array<string | number | null>): void {
        this.values = val;
        this.draw();
    }

    fill(val: string | number | null): void {
        for (let i = 0; i < this.values.length; i++){
            this.set(i, val, 0);
        }
    }

    set_color(i: number, val: string, off: number = 1): void {
        if (i - off < this.values.length){
            this.group.select(`#cell_${i-off}`).attr('fill', val);
        }
    }

    fill_color(val: string): void {
        for (let i = 0; i < this.values.length; i++){
            this.set_color(i, val, 0);
        }
    }

    shift(d: number): void {
        this.translate(new Vector(d*this.cell_width, 0), this.anim_speed);
    }
}


export class Arrow extends Graphic{
    line: D3selec<SVGLineElement>;
    //marker: d3.Selection<SVGMarkerElement, unknown, null, undefined>;
    start: Vector;
    end: Vector;
    start_trans: Vector;
    end_trans: Vector;
  
    constructor(parent: D3selec<SVGGraphicsElement>, start: Vector, end: Vector, color: string) {
        super(parent, start);
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

    translate_start(t: Vector, speed: number = 0): void {
        this.start = this.start.add(t);
        this.update(speed * t.len());
    }

    translate_end(t: Vector, speed: number = 0): void {
        this.end = this.end.add(t);
        this.update(speed * t.len());
    }
;
    set_start(t: Vector, speed: number = 0): void {
        const duration = speed * this.start.sub(t).len();
        this.start = t;
        this.update(duration);
    }

    set_end(t: Vector, speed: number = 0): void {
        const duration = speed * this.end.sub(t).len();
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

export interface Dynamic {
    done: boolean;

    next(): void;
    skip(): void;
    reset(): void;
}


export class DynamicSection {
    container: HTMLElement;
    menu: HTMLDivElement;
    content: Dynamic;

    constructor(container: HTMLElement, content: Dynamic, title: string){
        this.content = content;
        this.container = container;

        this.menu = document.createElement('div');
        this.menu.style.padding = '10px';
        this.menu.classList.add('row-cols-auto');
        this.menu.style.paddingLeft = `125px`;
        this.menu.style.paddingBottom = '20px';
        this.container.insertBefore(this.menu, this.container.firstChild);

        if (title != ""){
            const head = document.createElement('h3');
            head.innerHTML = title;
            head.style.paddingLeft = `125px`;
            head.style.paddingBottom = '10px';
            this.container.insertBefore(head, this.container.firstChild);
        }
        
        this.build_menu();
    }

    build_menu(): void {
        const next_button = document.createElement('button');
        next_button.innerHTML = 'Next';
        next_button.classList.add('btn');
        next_button.classList.add('btn-outline-primary');
        next_button.classList.add('dyn-menu-btn');
        next_button.type = 'button';
        next_button.addEventListener('click', this.content.next.bind(this.content));
        this.menu.appendChild(next_button);

        const skip_button = document.createElement('button');
        skip_button.innerHTML = 'Skip';
        skip_button.classList.add('btn');
        skip_button.classList.add('btn-outline-primary');
        skip_button.classList.add('dyn-menu-btn');
        skip_button.type = 'button';
        skip_button.addEventListener('click', this.content.skip.bind(this.content));
        this.menu.appendChild(skip_button);

        const reset_button = document.createElement('button');
        reset_button.innerHTML = 'Reset';
        reset_button.classList.add('btn');
        reset_button.classList.add('btn-outline-primary');
        reset_button.classList.add('dyn-menu-btn');
        reset_button.type = 'button';
        reset_button.addEventListener('click', this.content.reset.bind(this.content));
        this.menu.appendChild(reset_button);
    }
}

export class SlidingWindow extends Graphic {
    text: GraphicList;
    pattern: GraphicList;
    arrow?: Arrow;

    constructor(parent: D3selec<SVGGraphicsElement>, pos: Vector, w: number, text: string, pattern: string) {
        super(parent, pos);
        this.text = new GraphicList(this.group, pos, w, text.split(""));
        this.pattern = new GraphicList(this.group, pos.add(new Vector(0, 2*w)), w, pattern.split(""));
    }

    equals(i: number, j: number): boolean {
        if (this.pattern.get(i) == this.text.get(j)){
            this.pattern.set_color(i, 'green');
            this.text.set_color(j, 'green');
            this.display_shift(i, j, 'green');
            return true;
        } else {
            this.pattern.set_color(i, 'red');
            this.text.set_color(j, 'red');
            this.display_shift(i, j, 'red');
            return false;
        }
    }

    shift(i: number): void {
        this.pattern.shift(i);
        this.arrow?.translate_start(new Vector(i*this.pattern.cell_width, 0), 1);
    }

    display_shift(from: number, to: number, color: string = 'black'): void {
        this.arrow?.remove();
        const start = new Vector(this.pattern.get_pos().x + (from - 0.5) * this.pattern.cell_width, this.pattern.get_pos().y);
        const end = new Vector(this.text.get_pos().x + (to - 0.5) * this.text.cell_width, this.text.get_pos().y + this.text.cell_width);
        this.arrow = new Arrow(this.group, start, end, color);
    }

    reset(): void {
        this.arrow?.remove();
        this.pattern.reset_pos();
        this.pattern.fill_color('white');
        this.text.fill_color('white');
    }
}

// @ts-ignore
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { D3selec, Graphic, GraphicList, Arrow, Dynamic, DynamicSection, SlidingWindow} from "./graphics.js";
import { Vector } from "./vector.js"

/* 
class BordList extends GraphicList implements Dynamic {
    step: number;
    done: boolean;
    data: Array<number>;
    pattern: GraphicList;
    index: GraphicList;
    
    constructor(parent: D3selec<SVGGraphicsElement>, pos: Vector, w: number, pattern: GraphicList, index: GraphicList) {
        super(parent, pos, w, new Array(pattern.values.length).fill(null));
        this.step = 0;
        this.done = false;
        this.pattern = pattern;
        this.index = index;
        this.data = new Array(pattern.values.length + 1);
        this.data[0] = -1;
        const m = pattern.values.length;
        for (let i=1; i <= m; i++){
            let j = this.data[i-1];
            while (j>=0 && pattern.get(i) != pattern.get(j+1)){
                j = this.data[j];
            }
            this.data[i] = j + 1;
        }
    }

    next(): void {
        this.pattern.fill_color('white');
        this.index.fill_color('white');
        if (!this.done){
            this.step++;
            this.done = this.step > (this.data.length - 1);
            if (!this.done) {
                this.set(this.step, this.data[this.step]);
                for (let i = 1; i <= this.data[this.step]; i++){
                    this.pattern.set_color(i, 'green');
                }
                this.index.set_color(this.step, 'grey');
            }
        }
    }

    skip(): void {
        while(!this.done){
            this.next();
        }
    }

    reset(): void {
        this.pattern.fill_color('white');
        this.index.fill_color('white');
        this.fill(null);
        this.step = 0;
        this.done = false;
    }
}

class MPList extends GraphicList implements Dynamic {
    step: number;
    done: boolean;
    data: Array<number>;
    pattern: GraphicList;
    index: GraphicList;
    knuth: boolean;
    
    constructor(parent: D3selec<SVGGraphicsElement>, pos: Vector, w: number, pattern: GraphicList, index: GraphicList, knuth: boolean = false) {
        super(parent, pos, w, new Array(pattern.values.length + 1).fill(null));
        this.step = 0;
        this.done = false;
        this.pattern = pattern;
        this.index = index;
        this.knuth = knuth;
        this.data = new Array(pattern.values.length + 2);

        const m = pattern.values.length;
        let j = 0;
        this.data[1] = 0;
        for (let i=1; i <= m; i++){
            while (j>0 && pattern.get(i) != pattern.get(j)){
                j = this.data[j];
            }
            j++;
            if (!this.knuth || i == m || pattern.get(i+1) != pattern.get(j)){
                this.data[i + 1] = j;
            }
            else {
                this.data[i + 1] = this.data[j];
            }
        }
    }

    next(): void {
        this.pattern.fill_color('white');
        this.index.fill_color('white');
        if (!this.done){
            this.step++;
            this.done = this.step > (this.data.length - 1);
            if (!this.done) {
                this.set(this.step, this.data[this.step]);
                this.pattern.set_color(this.data[this.step], 'green');
                this.index.set_color(this.step, 'grey');
            }
        }
    }

    skip(): void {
        while(!this.done){
            this.next();
        }
    }

    reset(): void {
        this.pattern.fill_color('white');
        this.index.fill_color('white');
        this.fill(null);
        this.step = 0;
        this.done = false;
    }
}

class MPTable extends Graphic {
    pattern: GraphicList;
    index: GraphicList;
    bord: BordList;
    mp: MPList;
    done: boolean;

    constructor(parent: D3selec<SVGGraphicsElement>, pos: Vector, w: number, pattern: string, knuth: boolean = false){
        super(parent, pos);
        const offset_pos = pos.add(new Vector(100, 0));
        this.index = new GraphicList(this.group, offset_pos, w, Array.from({ length: pattern.length + 1}, (_, index) => index + 1));
        this.pattern = new GraphicList(this.group, offset_pos.add(new Vector(0, w)), w, pattern.split(""));
        this.bord = new BordList(this.group, offset_pos.add(new Vector(0, 2*w)), w, this.pattern, this.index);
        this.mp = new MPList(this.group, offset_pos.add(new Vector(0, 3*w)), w, this.pattern, this.index, knuth);
        this.done = false;


        this.group.append('text')
            .attr('x', offset_pos.x - 10)
            .attr('y', offset_pos.y + 0.5*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text('i');

        this.group.append('text')
            .attr('x', offset_pos.x - 10)
            .attr('y', offset_pos.y + 1.5*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text('P[ i ]');

        this.group.append('text')
            .attr('x', offset_pos.x - 10)
            .attr('y', offset_pos.y + 2.5*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text('Bord[ i ]');


        this.group.append('text')
            .attr('x', offset_pos.x - 10)
            .attr('y', offset_pos.y + 3.5*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text(`${knuth ? 'K': ''}MP_next[ i ]`);
    }

    next(): void {
        if (!this.bord.done){
            this.bord.next();
        }
        else if (!this.mp.done){
            this.mp.next();
        }
    }

    next_list(): void {
        if (!this.bord.done){
            this.bord.skip();
        }
        else if (!this.mp.done){
            this.mp.skip();
        }
    }

    skip(): void {
        this.bord.skip();
        this.mp.skip();
    }

    reset(): void {
        this.bord.reset();
        this.mp.reset();
    }

    static get_canvas_size(pattern: string): Vector {
        return new Vector(150 + (pattern.length + 1) * 50, 250);
    }
}

export class AlgMP implements Dynamic {
    mp_table: MPTable;
    sw: SlidingWindow;
    container: HTMLElement;

    m: number;
    n: number;
    i: number;
    p = 1;
    done = false;
    state = 'check';

    constructor(container: HTMLElement, pattern: string, text: string, improved: boolean){
        this.container = container;
        this.m = pattern.length;
        this.n = text.length;
        this.i = this.m;

        // Sliding window
        const sw_div = document.createElement('div');
        sw_div.classList.add('row-cols-auto');
        sw_div.style.paddingLeft = '100px';
        sw_div.style.overflowX = 'auto';
        this.container.appendChild(sw_div);

        const sw_svg = d3.select(sw_div).append('svg')
            .attr('width', 50*(text.length + pattern.length) + 50)
            .attr('height', 200)
            .append('g');
        this.sw = new SlidingWindow(sw_svg, new Vector(25, 25), 50, text, pattern);

        // Rule
        const hr = document.createElement('hr');
        this.container.appendChild(hr);
        
        // Tables
        const tables_div = document.createElement('div');
        tables_div.classList.add('row');
        this.container.appendChild(tables_div);

        // MP Table
        const mp_div = document.createElement('div');
        mp_div.classList.add('col-auto');
        mp_div.style.overflowX = 'auto';
        mp_div.style.marginRight = '20px';
        mp_div.style.marginTop = '20px';
        tables_div.appendChild(mp_div);

        const mp_canvas_size = MPTable.get_canvas_size(pattern);
        const mp_svg = d3.select(mp_div)
            .append('svg')
            .attr('width', mp_canvas_size.x)
            .attr('height', mp_canvas_size.y)
            .append('g');
        this.mp_table = new MPTable(mp_svg, new Vector(25, 25), 50, pattern, improved);
        const mp_section = new DynamicSection(mp_div, this.mp_table, "Table MP");
    }

    next(): void {
        if (!this.mp_table.done){
            this.mp_table.next();
        }
        else if (!this.done) {
            this.nextSearch();
        }
    }

    nextSearch(): void {
        if (this.state == 'check'){
            if (this.i == this.m){
                this.sw.pattern.fill_color('white');
                this.sw.text.fill_color('white');
                this.d_table.d.fill_color('white');
                this.d_table.index.fill_color('white');
                this.r_table.reset_color();
            }
            if (this.sw.equals(this.i, this.p + this.i - 1)){
                this.i--;
                if (this.i == 0){
                    console.log(`TROUVÉ : Occurence à la position ${this.p}`);
                    this.state = 'move';
                    this.sw.display_shift(this.i, this.p + this.i - 1 + this.d_table.get_shift(1));
                    this.d_table.d.set_color(1, 'blue');
                    this.d_table.index.set_color(1, 'blue');
                }
            }
            else {
                const shift_d = this.d_table.get_shift(this.i);
                this.d_table.d.set_color(this.i, 'blue');
                this.d_table.index.set_color(this.i, 'blue');
                const shift_r = this.r_table.get_shift(`${this.sw.text.get(this.p + this.i - 1)}`, this.i, 'blue');
                console.log(`shift by suff : ${shift_d}; shift by mvs : ${shift_r};`);
                this.state = 'move';
                this.sw.display_shift(this.i, this.p + this.i - 1 + Math.max(shift_d, shift_r), 'blue');
            }
        }
        else if (this.state == 'move'){
            if (this.i == 0){
                const shift_d = this.d_table.get_shift(1)!;
                this.p += shift_d;
                this.colorShiftD(this.i, this.p);
                this.sw.shift(shift_d);
            }
            else {
                const shift_d = this.d_table.get_shift(this.i);
                const shift_r = this.r_table.get_shift(`${this.sw.text.get(this.p + this.i - 1)}`, this.i, 'blue');
                this.sw.shift(Math.max(shift_d, shift_r));
                if (shift_d >= shift_r){
                    this.colorShiftD(this.i, this.p);
                    this.r_table.reset_color();
                } else {
                    this.colorShiftR(this.i - shift_r, this.p + this.m - 1);
                    this.d_table.d.fill_color('white');
                    this.d_table.index.fill_color('white');
                }
                this.p += Math.max(shift_d, shift_r);
            }
            this.i = this.m;
            if (this.p <= this.n - this.m + 1){
                this.state = 'check';
            } else {
                this.state = 'done';
                console.log('DONE');
                this.done = true;
            }

        }
    }

    skip(): void {
        while (!this.done) {
            this.next();
        }
    }

    reset(): void {
        this.mp_table.reset();
        this.sw.reset();

        this.i = this.m;
        this.p = 1;
        this.done = false;
        this.state = 'check';

        this.d_table.d.fill_color('white');
        this.d_table.index.fill_color('white');
        this.r_table.reset_color();
    }

    colorShiftR(i: number, p: number): void {
        this.sw.pattern.fill_color('white');
        this.sw.text.fill_color('white');
        this.sw.pattern.set_color(i, 'green');
        this.sw.text.set_color(p, 'green');
    }

    colorShiftD(i: number, p: number): void {
        this.sw.pattern.fill_color('white');
        this.sw.text.fill_color('white');
        const shift = this.d_table.get_shift(this.i);
        let end = this.m - shift;
        let begin = end - this.d_table.suff.get(end) + 1;
        for (let k = begin; k <= end; k++){
            this.sw.pattern.set_color(k, 'green');
            this.sw.text.set_color(p + shift + k - 1, 'green');
        }
    }
}
    */
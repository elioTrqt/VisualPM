// @ts-ignore
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { D3selec, Graphic, GraphicList, Arrow, Dynamic, DynamicSection, SlidingWindow} from "./graphics.js";
import { Vector } from "./vector.js"

class SuffList extends GraphicList implements Dynamic {
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

        const m = pattern.values.length;
        this.data[m] = m;
        let g = m;
        let f = 0;
        for (let i=m-1; i >= 1; i--){
            if (i > g && this.data[i+m-f] != i - g){
                this.data[i] = Math.min(this.data[i+m-f], i - g);
            }
            else {
                f = i;
                g = Math.min(g, i);
                while (g > 0 && pattern.get(g) == pattern.get(g+m-f)){
                    g = g-1;
                }
                this.data[i] = f-g;
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
                for(let i=0; i < this.data[this.step]; i++){
                    this.pattern.set_color(this.step-i, 'green');
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

    get(i: number): number{
        return this.data[i];
    }
}

class DList extends GraphicList implements Dynamic {
    step: number;
    done: boolean;
    data: Array<number>;
    data_from: Array<number>;
    data_case: Array<number>;
    pattern: GraphicList;
    index: GraphicList;
    suff: SuffList;
    
    constructor(parent: D3selec<SVGGraphicsElement>, pos: Vector, w: number, pattern: GraphicList, index: GraphicList, suff: SuffList) {
        super(parent, pos, w, new Array(pattern.values.length).fill(null));
        this.step = 0;
        this.done = false;
        this.pattern = pattern;
        this.index = index;
        this.suff = suff;
        this.data = new Array(pattern.values.length + 1);
        this.data_from = new Array(pattern.values.length + 1);
        this.data_case = new Array(pattern.values.length + 1);

        const m = pattern.values.length;
        let i = 1;
        for (let j=1; j <= m; j++){
            this.data[j] = m;
        }
        for (let j = m-1; j >= 0; j--){
            if (j==0 || suff.data[j] == j){
                while(i <= m - j){
                    this.data[i] = m - j;
                    this.data_from[i] = j;
                    this.data_case[i] = 2;
                    i++;
                }
            }
        }
        for (let j=1; j <= m; j++){
            this.data[m-suff.data[j]] = m - j;
            this.data_from[m-suff.data[j]] = j;
            this.data_case[m-suff.data[j]] = 1;
        }
    }

    next(): void {
        this.suff.fill_color('white');
        this.index.fill_color('white');
        if (!this.done){
            this.step++;
            this.done = this.step > (this.data.length - 1);
            if (!this.done) {
                this.set(this.step, this.data[this.step]);
                this.suff.set_color(this.data_from[this.step], 'green');
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
        this.suff.fill_color('white');
        this.index.fill_color('white');
        this.fill(null);
        this.step = 0;
        this.done = false;
    }

    get(i: number): number{
        return this.data[i];
    }
}


class DTable extends Graphic {
    pattern: GraphicList;
    index: GraphicList;
    suff: SuffList;
    d: DList;
    done: boolean;

    constructor(parent: D3selec<SVGGraphicsElement>, pos: Vector, w: number, pattern: string){
        super(parent, pos);
        const offset_pos = pos.add(new Vector(100, 0));
        this.index = new GraphicList(this.group, offset_pos, w, Array.from({ length: pattern.length}, (_, index) => index + 1));
        this.pattern = new GraphicList(this.group, offset_pos.add(new Vector(0, w)), w, pattern.split(""));
        this.suff = new SuffList(this.group, offset_pos.add(new Vector(0, 2*w)), w, this.pattern, this.index);
        this.d = new DList(this.group, offset_pos.add(new Vector(0, 3*w)), w, this.pattern, this.index, this.suff);
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
            .text('Suff[ i ]');


        this.group.append('text')
            .attr('x', offset_pos.x - 10)
            .attr('y', offset_pos.y + 3.5*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text(`D[ i ]`);
    }

    next(): void {
        if (!this.suff.done){
            this.suff.next();
        }
        else if (!this.d.done){
            this.d.next();
            this.done = this.d.done;
        }
    }

    next_list(): void {
        if (!this.suff.done){
            this.suff.skip();
        }
        else if (!this.d.done){
            this.d.skip();
            this.done = true;
        }
    }

    skip(): void {
        this.suff.skip();
        this.d.skip();
        this.done = true;
    }

    reset(): void {
        this.suff.reset();
        this.d.reset();
        this.done = false;
    }

    get_shift(i: number): number {
        return this.d.get(i);
    }

    static get_canvas_size(pattern: string): Vector {
        return new Vector(150 + pattern.length * 50, 250);
    }
}


class RTable extends Graphic {
    pattern: GraphicList;
    index: GraphicList;
    improved: boolean;
    symbs: Map<string, GraphicList>;
    values: Map<string, GraphicList>;
    data: Map<string, Array<number>>;
    step: number;
    done: boolean;

    constructor(parent: D3selec<SVGGraphicsElement>, pos: Vector, w: number, pattern: string, improved: boolean = false){
        super(parent, pos);
        const offset_pos = pos.add(new Vector(100, 0));
        this.index = new GraphicList(this.group, offset_pos, w, Array.from({ length: pattern.length}, (_, index) => index + 1));
        this.pattern = new GraphicList(this.group, offset_pos.add(new Vector(0, w)), w, pattern.split(""));
        this.improved = improved;
        this.symbs = new Map<string, GraphicList>;
        this.values = new Map<string, GraphicList>;
        this.data = new Map<string, Array<number>>;
        this.step = 0;
        this.done = false;

        let y_offset = 3.5*w;
        for (let i=0; i < pattern.length; i++){
            if (!this.data.has(pattern[i])){
                this.data.set(pattern[i], [0]);
                this.symbs.set(pattern[i], new GraphicList(this.group, offset_pos.add(new Vector(0, y_offset)), w, [pattern[i]]));
                this.values.set(pattern[i], new GraphicList(this.group, offset_pos.add(new Vector(1.5*w, y_offset)), w, [0]));
                y_offset += w;
            }
        }
        this.data.set('...', [0]);
        this.symbs.set('...' , new GraphicList(this.group, offset_pos.add(new Vector(0, y_offset)), w, ['...']));
        this.values.set('...' , new GraphicList(this.group, offset_pos.add(new Vector(1.5*w, y_offset)), w, [0]));

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
            .attr('x', offset_pos.x + 0.5 * w)
            .attr('y', offset_pos.y + 3.2*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'bottom')
            .text('a');

        this.group.append('text')
            .attr('x', offset_pos.x + 2 * w)
            .attr('y', offset_pos.y + 3.2*w)
            .attr("font-size", "20px")
            .attr('text-anchor', improved ? 'left' : 'middle')
            .attr('dominant-baseline', 'bottom')
            .text(improved ? 'Positions de a' : 'R[ a ]');
        
    }

    next(): void {
        this.reset_color();
        if (!this.done){
            this.step++;
            this.done = this.step > this.pattern.values.length;
            if (!this.done){
                this.index.set_color(this.step, 'grey');
                this.pattern.set_color(this.step, 'grey');
                let c = `${this.pattern.get(this.step)}`;
                if (this.improved){
                    this.data.get(c)?.push(this.step);
                    let new_values = this.data.get(c);
                    new_values = new_values?new_values:[];
                    this.values.get(c)?.set_values(new_values);
                    this.values.get(c)?.set_color(new_values.length, 'green');
                    this.symbs.get(c)?.set_color(1, 'green');
                } else {
                    this.data.set(c, [this.step]);
                    this.values.get(c)?.set(1, this.step);
                    this.values.get(c)?.set_color(1, 'green');
                    this.symbs.get(c)?.set_color(1, 'green');
                }
            }
        }
    }

    skip(): void {
        while(!this.done){
            this.next();
        }
    }

    reset(): void {
        this.done = false;
        this.step = 0;
        for (let c of this.data.keys()){
            this.data.set(c, [0]);
            this.values.get(c)?.set_values([0]);
        }
        this.reset_color();
    }

    reset_color(): void {
        this.index.fill_color('white');
        this.pattern.fill_color('white');
        for (let c of this.data.keys()){
            this.symbs.get(c)?.fill_color('white');
            this.values.get(c)?.fill_color('white');
        }
    }

    static get_canvas_size(pattern: string, improved: boolean, width: number): Vector {
        const chars = ['...'];
        const freqs = new Map;
        freqs.set('...', 1);
        for (let char of pattern) {
            if(!chars.includes(char)){
                chars.push(char);
                freqs.set(char, 2);
            }
            freqs.set(char, freqs.get(char) + 1);
        }
        let maxFreq = 1;
        for (let c of chars){
            maxFreq = freqs.get(c) > maxFreq ? freqs.get(c) : maxFreq;
        }
        
        const x = Math.max(width * pattern.length, 0.5*width + maxFreq * width) + 150;
        const y = 3.5*width + chars.length * width + 50;

        return new Vector(x, y);
    }

    get_shift(c: string, i: number, color: string = 'white'): number {
        if (!this.data.has(c)){
            this.symbs.get('...')!.set_color(1, color);
            this.values.get('...')!.set_color(1, color);
            return i;
        }
        if (!this.improved){
            this.symbs.get(c)!.set_color(1, color);
            this.values.get(c)!.set_color(1, color);
            return Math.max(1, i - this.data.get(c)![0]);
        } else {
            this.symbs.get(c)!.set_color(1, color);
            let rightest = 0;
            for (let r=0; r < this.data.get(c)!.length; r++){
                if (this.data.get(c)![r] >= i) break;
                this.values.get(c)!.fill_color('white');
                this.values.get(c)!.set_color(r, color, 0);
                rightest = this.data.get(c)![r];
            }
            return i - rightest;
        }
    }
}

export class AlgBM implements Dynamic {
    d_table: DTable;
    r_table: RTable;
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

        // D Table
        const d_div = document.createElement('div');
        d_div.classList.add('col-auto');
        d_div.style.overflowX = 'auto';
        d_div.style.marginRight = '20px';
        d_div.style.marginTop = '20px';
        tables_div.appendChild(d_div);

        const d_canvas_size = DTable.get_canvas_size(pattern);
        const d_svg = d3.select(d_div)
            .append('svg')
            .attr('width', d_canvas_size.x)
            .attr('height', d_canvas_size.y)
            .append('g');
        this.d_table = new DTable(d_svg, new Vector(25, 25), 50, pattern);
        const d_section = new DynamicSection(d_div, this.d_table, "Bon suffixe (table D)");

        // R Table
        const r_div = document.createElement('div');
        r_div.classList.add('col-auto');
        r_div.style.overflowX = 'auto';
        r_div.style.marginRight = '20px';
        r_div.style.marginTop = '20px';
        tables_div.appendChild(r_div);

        const r_canvas_size = RTable.get_canvas_size(pattern, improved, 50);
        const r_svg = d3.select(r_div)
            .append('svg')
            .attr('width', r_canvas_size.x)
            .attr('height', r_canvas_size.y)
            .append('g');
        this.r_table = new RTable(r_svg, new Vector(25, 25), 50, pattern, improved);
        const r_section = new DynamicSection(r_div, this.r_table, "Mauvais caractère (table R)");
    }

    next(): void {
        if (!this.d_table.done){
            this.d_table.next();
        }
        else if (!this.r_table.done){
            this.r_table.next();
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
        this.d_table.reset();
        this.r_table.reset();
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
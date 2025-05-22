// @ts-ignore
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { D3selec, Graphic, GraphicList, Arrow, Dynamic, DynamicSection, SlidingWindow} from "./graphics.js";
import { Vector } from "./vector.js"





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
            .attr('width', 50*(text.length + pattern.length + 1))
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
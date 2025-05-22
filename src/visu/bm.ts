import { GraphicDict, GraphicList, Vector, D3selec } from "../graphics.js";
import { init_decal, init_suff, init_right } from "../algs/bm.js";
import { DynamicSection } from "./dynamic.js";


export class DTable extends DynamicSection {
    index: GraphicList;
    pattern: GraphicList;
    suff: GraphicList;
    decal: GraphicList;

    suff_vals: number[];
    decal_vals: number[];

    constructor(pattern: string, w: number){
        super(new Vector(25, 25), DTable.get_size(pattern, w), 0);

        const suff_data = init_suff(pattern);
        this.suff_vals = suff_data.data;
        this.steps = suff_data.steps;
        console.log(`Suff/Decal : computed suff ${this.suff_vals}`);

        const decal_data = init_decal(pattern, this.suff_vals);
        this.decal_vals = decal_data.data;
        this.steps = this.steps.concat(decal_data.steps);
        console.log(`Suff/Decal : computed decal ${this.decal_vals}`);

        const offset_pos = new Vector(80, 25);
        this.index = new GraphicList(this.group, offset_pos, 0, w, Array.from({ length: pattern.length}, (_, index) => index + 1));
        this.pattern = new GraphicList(this.group, offset_pos.add(new Vector(0, w)), 0, w, pattern.split(""));
        this.suff = new GraphicList(this.group, offset_pos.add(new Vector(0, 2*w)), 0, w, Array(pattern.length).fill(""));
        this.decal = new GraphicList(this.group, offset_pos.add(new Vector(0, 3*w)), 0, w, Array(pattern.length).fill(""));

        this.append_text('i', offset_pos.x - 10, offset_pos.y + .5*w);
        this.append_text('P[ i ]', offset_pos.x - 10, offset_pos.y + 1.5*w);
        this.append_text('Suff[ i ]', offset_pos.x - 10, offset_pos.y + 2.5*w);
        this.append_text(`D[ i ]`, offset_pos.x - 10, offset_pos.y + 3.5*w);
    }

    append_text(text: string, x: number, y: number): void {
        this.group.append('text')
            .attr('x', x)
            .attr('y', y)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text(text);
    }

    skip(): void {
        console.log("Suff/Decal Table : skip");
        for (let att of ["index", "pattern", "suff", "decal"]) this[att as keyof DTable].fill_color("white");
        this.suff.set_values(this.suff_vals.slice(1));
        this.decal.set_values(this.decal_vals.slice(1));
        this.current_msg = "";
        this.current_step = this.steps.length;
    }

    reset(): void {
        console.log("Suff/Decal Table : reset");
        for (let att of ["index", "pattern", "suff", "decal"]) this[att as keyof DTable].fill_color("white");
        for (let att of ["suff", "decal"]) this[att as keyof DTable].fill_values("");
        this.current_msg = "";
        this.current_step = -1;
    }

    static get_size(pattern: string, w: number): Vector {
        return new Vector(100 + pattern.length * w, 5*w);
    }
}

export class RTable extends DynamicSection {
    index: GraphicList;
    pattern: GraphicList;
    table: GraphicDict;

    improved: boolean;
    right_vals: Map<string, Array<number>>;

    constructor(pattern: string, improved: boolean, w: number){
        super(new Vector(25, 25), RTable.get_size(pattern, improved, w), 0);
        this.improved = improved;

        const offset_pos = new Vector(80, 25);
        this.index = new GraphicList(this.group, offset_pos, 0, w, Array.from({ length: pattern.length}, (_, index) => index + 1));
        this.pattern = new GraphicList(this.group, offset_pos.add(new Vector(0, w)), 0, w, pattern.split(""));
        this.table = new GraphicDict(this.group, offset_pos.add(new Vector(0, w*3.5)), w, pattern);
        
        const right_data = init_right(pattern, improved);
        this.right_vals = right_data.data;
        this.steps = right_data.steps;

        this.append_text('i', offset_pos.x - 10, offset_pos.y + 0.5*w, 'middle', 'end');
        this.append_text('P[ i ]', offset_pos.x - 10, offset_pos.y + 1.5*w, 'middle', 'end');
        this.append_text('a', offset_pos.x + 0.5 * w, offset_pos.y + 3.2*w, 'bottom', 'middle');
        this.append_text(improved ? 'Positions de a' : 'R[ a ]', offset_pos.x + 1.5 * w, offset_pos.y + 3.2*w, 'bottom', improved ? 'left' : 'middle');
        
    }

    append_text(text: string, x: number, y: number, baseline: string, anchor: string): void {
        this.group.append('text').attr('x', x).attr('y', y).attr("font-size", "20px")
            .attr('text-anchor', anchor).attr('dominant-baseline', baseline).text(text);
    }

    skip(): void {
        for (let att of ["index", "pattern", "table"]) this[att as keyof RTable].fill_color("white");
        this.table.fill(this.right_vals);
        super.skip()
    }

    reset(): void {
        for (let att of ["index", "pattern", "table"]) this[att as keyof RTable].fill_color("white");
        this.table.empty()
        super.reset();
    }

    static get_size(pattern: string, improved: boolean, width: number): Vector {
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
}
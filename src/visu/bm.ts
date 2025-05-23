// @ts-ignore
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

import { Graphic, GraphicDict, GraphicList, Vector, D3selec } from "../graphics.js";
import { init_decal, init_suff, init_right } from "../algs/bm.js";
import { Updatable, DomElement, methodCall } from "../types.js";
import { AlgSection } from "./alg.js";
import { DynamicCanvas } from "./dynamic.js";


class DTable extends DynamicCanvas {
    index: GraphicList;
    pattern: GraphicList;
    suff: GraphicList;
    decal: GraphicList;

    suff_vals: number[];
    decal_vals: number[];

    constructor(pattern: string, w: number, suff: number[], decal: number[]){
        super(new Vector(0, 0), DTable.get_size(pattern, w), 0);
        this.container.id = 'dtable-graphic';
        this.suff_vals = suff;
        this.decal_vals = decal;

        const offset_pos = new Vector(80, 25);
        this.index = new GraphicList(this.group, offset_pos, 0, w, Array.from({ length: pattern.length}, (_, index) => index + 1));
        this.pattern = new GraphicList(this.group, offset_pos.add(new Vector(0, w)), 0, w, pattern.split(""));
        this.suff = new GraphicList(this.group, offset_pos.add(new Vector(0, 2*w)), 0, w, Array(pattern.length).fill(""));
        this.decal = new GraphicList(this.group, offset_pos.add(new Vector(0, 3*w)), 0, w, Array(pattern.length).fill(""));

        this.append_text('i', offset_pos.x - 10, offset_pos.y + .5*w, 'middle', 'end');
        this.append_text('P[ i ]', offset_pos.x - 10, offset_pos.y + 1.5*w, 'middle', 'end');
        this.append_text('Suff[ i ]', offset_pos.x - 10, offset_pos.y + 2.5*w, 'middle', 'end');
        this.append_text(`D[ i ]`, offset_pos.x - 10, offset_pos.y + 3.5*w, 'middle', 'end');
    }

    skip(): void {
        console.log("skip D");
        this.index.fill_color("white");
        this.pattern.fill_color("white");
        this.suff.fill_color("white");
        this.decal.fill_color("white");
        this.suff.set_values(this.suff_vals);
        this.decal.set_values(this.decal_vals);
    }

    reset(): void {
        console.log("reset D");
        this.index.fill_color("white");
        this.pattern.fill_color("white");
        this.suff.fill_color("white");
        this.decal.fill_color("white");
        this.suff.fill_values("");
        this.decal.fill_values("");
    }

    static get_size(pattern: string, w: number): Vector {
        return new Vector(100 + pattern.length * w, 5*w);
    }
}

class RTable extends DynamicCanvas {
    index: GraphicList;
    pattern: GraphicList;
    table: GraphicDict;

    improved: boolean;
    right_vals: Map<string, Array<number>>;

    constructor(pattern: string, improved: boolean, w: number, right: Map<string, Array<number>>){
        super(new Vector(0, 0), RTable.get_size(pattern, improved, w), 0);
        this.container.id = 'rtable-graphic';
        this.improved = improved;
        this.right_vals = right;

        const offset_pos = new Vector(80, 25);
        this.index = new GraphicList(this.group, offset_pos, 0, w, Array.from({ length: pattern.length}, (_, index) => index + 1));
        this.pattern = new GraphicList(this.group, offset_pos.add(new Vector(0, w)), 0, w, pattern.split(""));
        this.table = new GraphicDict(this.group, offset_pos.add(new Vector(0, w*3.5)), w, pattern);

        this.append_text('i', offset_pos.x - 10, offset_pos.y + 0.5*w, 'middle', 'end');
        this.append_text('P[ i ]', offset_pos.x - 10, offset_pos.y + 1.5*w, 'middle', 'end');
        this.append_text('a', offset_pos.x + 0.5 * w, offset_pos.y + 3.2*w, 'bottom', 'middle');
        this.append_text(improved ? 'Positions de a' : 'R[ a ]', offset_pos.x + 1.5 * w, offset_pos.y + 3.2*w, 'bottom', improved ? 'left' : 'middle');
        
    }

    skip(): void {
        this.index.fill_color("white");
        this.pattern.fill_color("white");
        this.table.fill_color("white");
        this.table.fill(this.right_vals);
    }

    reset(): void {
        this.index.fill_color("white");
        this.pattern.fill_color("white");
        this.table.fill_color("white");
        this.table.empty()
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
        
        let x = (Math.max(pattern.length, 2) + 2) * width;
        if (improved) x = Math.max(x, (2 + maxFreq) * width);
        const y = (4.5 + chars.length) * width;

        return new Vector(x, y);
    }
}

export class DSection extends AlgSection {
    constructor(pattern: string){
        const suff = init_suff(pattern);
        const decal = init_decal(pattern, suff.data);
        const dtable = new DTable(pattern, 50, suff.data.splice(1), decal.data.splice(1));
        super(dtable, "Tables Suff & D (bon suffixe) :", "some help", suff.steps.concat(decal.steps));
    }
}

export class RSection extends AlgSection {
    constructor(pattern: string, improved: boolean){
        const right = init_right(pattern, improved);
        const rtable = new RTable(pattern, improved, 50, right.data);
        super(rtable, "Table R (mauvais caractère) :", "some help", right.steps);
    }
}
// @ts-ignore
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { Graphic, GraphicDict, GraphicList, Vector } from "../graphics.js";
import { init_decal, init_suff, init_right } from "../algs/bm.js";
import { AlgSection } from "./alg.js";
class DTable extends Graphic {
    container;
    index;
    pattern;
    suff;
    decal;
    suff_vals;
    decal_vals;
    constructor(pattern, w, suff, decal) {
        const container = document.createElement('svg');
        container.classList.add('dyn-graphic-container');
        container.id = 'dtable-graphic';
        const pos = new Vector(0, 0);
        const size = DTable.get_size(pattern, w);
        const svg = d3.select(container)
            .append('svg')
            .attr('width', size.x)
            .attr('height', size.y)
            .append('g');
        super(svg, pos, 0);
        this.container = container;
        this.suff_vals = suff;
        this.decal_vals = decal;
        const offset_pos = new Vector(80, 25);
        this.index = new GraphicList(this.group, offset_pos, 0, w, Array.from({ length: pattern.length }, (_, index) => index + 1));
        this.pattern = new GraphicList(this.group, offset_pos.add(new Vector(0, w)), 0, w, pattern.split(""));
        this.suff = new GraphicList(this.group, offset_pos.add(new Vector(0, 2 * w)), 0, w, Array(pattern.length).fill(""));
        this.decal = new GraphicList(this.group, offset_pos.add(new Vector(0, 3 * w)), 0, w, Array(pattern.length).fill(""));
        this.append_text('i', offset_pos.x - 10, offset_pos.y + .5 * w);
        this.append_text('P[ i ]', offset_pos.x - 10, offset_pos.y + 1.5 * w);
        this.append_text('Suff[ i ]', offset_pos.x - 10, offset_pos.y + 2.5 * w);
        this.append_text(`D[ i ]`, offset_pos.x - 10, offset_pos.y + 3.5 * w);
    }
    append_text(text, x, y) {
        this.group.append('text')
            .attr('x', x)
            .attr('y', y)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text(text);
    }
    update(todo) {
        for (let t of todo)
            this[t.object][t.method](...t.args);
    }
    skip() {
        console.log("skip D");
        this.index.fill_color("white");
        this.pattern.fill_color("white");
        this.suff.fill_color("white");
        this.decal.fill_color("white");
        this.suff.set_values(this.suff_vals);
        this.decal.set_values(this.decal_vals);
    }
    reset() {
        console.log("reset D");
        this.index.fill_color("white");
        this.pattern.fill_color("white");
        this.suff.fill_color("white");
        this.decal.fill_color("white");
        this.suff.fill_values("");
        this.decal.fill_values("");
    }
    static get_size(pattern, w) {
        return new Vector(100 + pattern.length * w, 5 * w);
    }
}
class RTable extends Graphic {
    container;
    index;
    pattern;
    table;
    improved;
    right_vals;
    constructor(pattern, improved, w, right) {
        const container = document.createElement('svg');
        container.classList.add('dyn-graphic-container');
        container.id = 'rtable-graphic';
        const pos = new Vector(0, 0);
        const size = RTable.get_size(pattern, improved, w);
        const svg = d3.select(container)
            .append('svg')
            .attr('width', size.x)
            .attr('height', size.y)
            .append('g');
        super(svg, pos, 0);
        this.container = container;
        this.improved = improved;
        this.right_vals = right;
        const offset_pos = new Vector(80, 25);
        this.index = new GraphicList(this.group, offset_pos, 0, w, Array.from({ length: pattern.length }, (_, index) => index + 1));
        this.pattern = new GraphicList(this.group, offset_pos.add(new Vector(0, w)), 0, w, pattern.split(""));
        this.table = new GraphicDict(this.group, offset_pos.add(new Vector(0, w * 3.5)), w, pattern);
        this.append_text('i', offset_pos.x - 10, offset_pos.y + 0.5 * w, 'middle', 'end');
        this.append_text('P[ i ]', offset_pos.x - 10, offset_pos.y + 1.5 * w, 'middle', 'end');
        this.append_text('a', offset_pos.x + 0.5 * w, offset_pos.y + 3.2 * w, 'bottom', 'middle');
        this.append_text(improved ? 'Positions de a' : 'R[ a ]', offset_pos.x + 1.5 * w, offset_pos.y + 3.2 * w, 'bottom', improved ? 'left' : 'middle');
    }
    append_text(text, x, y, baseline, anchor) {
        this.group.append('text').attr('x', x).attr('y', y).attr("font-size", "20px")
            .attr('text-anchor', anchor).attr('dominant-baseline', baseline).text(text);
    }
    update(todo) {
        for (let t of todo)
            this[t.object][t.method](...t.args);
    }
    skip() {
        this.index.fill_color("white");
        this.pattern.fill_color("white");
        this.table.fill_color("white");
        this.table.fill(this.right_vals);
    }
    reset() {
        this.index.fill_color("white");
        this.pattern.fill_color("white");
        this.table.fill_color("white");
        this.table.empty();
    }
    static get_size(pattern, improved, width) {
        const chars = ['...'];
        const freqs = new Map;
        freqs.set('...', 1);
        for (let char of pattern) {
            if (!chars.includes(char)) {
                chars.push(char);
                freqs.set(char, 2);
            }
            freqs.set(char, freqs.get(char) + 1);
        }
        let maxFreq = 1;
        for (let c of chars) {
            maxFreq = freqs.get(c) > maxFreq ? freqs.get(c) : maxFreq;
        }
        let x = (Math.max(pattern.length, 2) + 2) * width;
        if (improved)
            x = Math.max(x, (2 + maxFreq) * width);
        const y = (4.5 + chars.length) * width;
        return new Vector(x, y);
    }
}
export class DSection extends AlgSection {
    constructor(pattern) {
        const suff = init_suff(pattern);
        const decal = init_decal(pattern, suff.data);
        const dtable = new DTable(pattern, 50, suff.data.splice(1), decal.data.splice(1));
        super(dtable, "Tables Suff & D (bon suffixe) :", "some help", suff.steps.concat(decal.steps));
    }
}
export class RSection extends AlgSection {
    constructor(pattern, improved) {
        const right = init_right(pattern, improved);
        const rtable = new RTable(pattern, improved, 50, right.data);
        super(rtable, "Table R (mauvais caractère) :", "some help", right.steps);
    }
}

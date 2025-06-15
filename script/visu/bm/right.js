import { AlgSection } from "../sections.js";
import { Canvas, GraphicDict, GraphicList, Vector } from "../../graphics.js";
import { init_right } from "../../algs/bm.js";
export class dictRowUpdate {
    id = "";
    color = [];
    append = [];
    update = [];
}
export class RTableState {
    index_color = [];
    pattern_color = [];
    rows = [];
}
class RTable extends Canvas {
    index;
    pattern;
    table;
    improved;
    right_vals;
    constructor(pattern, improved, w, right) {
        super(RTable.get_size(pattern, improved, w));
        this.container.id = 'rtable-graphic';
        this.improved = improved;
        this.right_vals = right;
        const sigma = [...new Set(pattern)].sort();
        sigma.push('...');
        const offset_pos = new Vector(80, 25);
        this.index = new GraphicList(this.group, offset_pos, w, Array.from({ length: pattern.length }, (_, index) => index + 1), 0);
        this.pattern = new GraphicList(this.group, offset_pos.add(new Vector(0, w)), w, pattern.split(""), 0);
        this.table = new GraphicDict(this.group, offset_pos.add(new Vector(0, w * 3.5)), w, sigma);
        this.append_text('i', offset_pos.x - 10, offset_pos.y + 0.5 * w, 'middle', 'end');
        this.append_text('P[ i ]', offset_pos.x - 10, offset_pos.y + 1.5 * w, 'middle', 'end');
        this.append_text('a', offset_pos.x + 0.5 * w, offset_pos.y + 3.2 * w, 'bottom', 'middle');
        this.append_text(improved ? 'Positions de a' : 'R[ a ]', offset_pos.x + 1.5 * w, offset_pos.y + 3.2 * w, 'bottom', improved ? 'left' : 'middle');
    }
    update(state) {
        this.clear_color();
        for (let c of state.index_color) {
            this.index.set_color(c[0], c[1]);
        }
        for (let c of state.pattern_color) {
            this.pattern.set_color(c[0], c[1]);
        }
        for (let row of state.rows) {
            for (let v of row.append)
                this.table.append_to_row(row.id, v);
            for (let u of row.update)
                this.table.set(row.id, u.pos, u.new);
            for (let c of row.color)
                this.table.set_color(row.id, c[0], c[1]);
        }
    }
    reverse_update(state, prev_state) {
        for (let row of state.rows) {
            for (let u of row.update)
                this.table.set(row.id, u.pos, u.prev);
            for (let _ of row.append)
                this.table.pop_last(row.id);
        }
        this.clear_color();
        if (!prev_state)
            return;
        for (let c of prev_state.index_color) {
            this.index.set_color(c[0], c[1]);
        }
        for (let c of prev_state.pattern_color) {
            this.pattern.set_color(c[0], c[1]);
        }
        for (let row of prev_state.rows) {
            for (let c of row.color)
                this.table.set_color(row.id, c[0], c[1]);
        }
    }
    skip() {
        this.clear_color();
        this.table.set_data(this.right_vals);
    }
    reset() {
        this.clear_color();
        this.table.fill_data_with([]);
    }
    clear_color() {
        this.index.fill_data_color_with("white");
        this.pattern.fill_data_color_with("white");
        this.table.fill_data_color_with("white");
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
export class RSection extends AlgSection {
    constructor(pattern, improved) {
        const right = init_right(pattern, improved);
        const rtable = new RTable(pattern, improved, 50, right.values);
        super("Table R (mauvais caractère) :", "some help", rtable, right.steps);
    }
}

import { Graphic, GraphicList } from "./graphics.js";
import { Vector } from "./vector.js";
class BordList extends GraphicList {
    step;
    done;
    data;
    pattern;
    index;
    constructor(parent, pos, w, pattern, index) {
        super(parent, pos, w, new Array(pattern.values.length).fill(null));
        this.step = 0;
        this.done = false;
        this.pattern = pattern;
        this.index = index;
        this.data = new Array(pattern.values.length + 1);
        this.data[0] = -1;
        const m = pattern.values.length;
        for (let i = 1; i <= m; i++) {
            let j = this.data[i - 1];
            while (j >= 0 && pattern.get(i) != pattern.get(j + 1)) {
                j = this.data[j];
            }
            this.data[i] = j + 1;
        }
    }
    next() {
        this.pattern.fill_color('white');
        this.index.fill_color('white');
        if (!this.done) {
            this.step++;
            this.done = this.step > (this.data.length - 1);
            if (!this.done) {
                this.set(this.step, this.data[this.step]);
                for (let i = 1; i <= this.data[this.step]; i++) {
                    this.pattern.set_color(i, 'green');
                }
                this.index.set_color(this.step, 'grey');
            }
        }
    }
    skip() {
        while (!this.done) {
            this.next();
        }
    }
    reset() {
        this.pattern.fill_color('white');
        this.index.fill_color('white');
        this.fill(null);
        this.step = 0;
        this.done = false;
    }
}
class MPList extends GraphicList {
    step;
    done;
    data;
    pattern;
    index;
    knuth;
    constructor(parent, pos, w, pattern, index, knuth = false) {
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
        for (let i = 1; i <= m; i++) {
            while (j > 0 && pattern.get(i) != pattern.get(j)) {
                j = this.data[j];
            }
            j++;
            if (!this.knuth || i == m || pattern.get(i + 1) != pattern.get(j)) {
                this.data[i + 1] = j;
            }
            else {
                this.data[i + 1] = this.data[j];
            }
        }
    }
    next() {
        this.pattern.fill_color('white');
        this.index.fill_color('white');
        if (!this.done) {
            this.step++;
            this.done = this.step > (this.data.length - 1);
            if (!this.done) {
                this.set(this.step, this.data[this.step]);
                this.pattern.set_color(this.data[this.step], 'green');
                this.index.set_color(this.step, 'grey');
            }
        }
    }
    skip() {
        while (!this.done) {
            this.next();
        }
    }
    reset() {
        this.pattern.fill_color('white');
        this.index.fill_color('white');
        this.fill(null);
        this.step = 0;
        this.done = false;
    }
}
class MPTable extends Graphic {
    pattern;
    index;
    bord;
    mp;
    done;
    constructor(parent, pos, w, pattern, knuth = false) {
        super(parent, pos);
        const offset_pos = pos.add(new Vector(100, 0));
        this.index = new GraphicList(this.group, offset_pos, w, Array.from({ length: pattern.length + 1 }, (_, index) => index + 1));
        this.pattern = new GraphicList(this.group, offset_pos.add(new Vector(0, w)), w, pattern.split(""));
        this.bord = new BordList(this.group, offset_pos.add(new Vector(0, 2 * w)), w, this.pattern, this.index);
        this.mp = new MPList(this.group, offset_pos.add(new Vector(0, 3 * w)), w, this.pattern, this.index, knuth);
        this.done = false;
        this.group.append('text')
            .attr('x', offset_pos.x - 10)
            .attr('y', offset_pos.y + 0.5 * w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text('i');
        this.group.append('text')
            .attr('x', offset_pos.x - 10)
            .attr('y', offset_pos.y + 1.5 * w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text('P[ i ]');
        this.group.append('text')
            .attr('x', offset_pos.x - 10)
            .attr('y', offset_pos.y + 2.5 * w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text('Bord[ i ]');
        this.group.append('text')
            .attr('x', offset_pos.x - 10)
            .attr('y', offset_pos.y + 3.5 * w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text(`${knuth ? 'K' : ''}MP_next[ i ]`);
    }
    next() {
        if (!this.bord.done) {
            this.bord.next();
        }
        else if (!this.mp.done) {
            this.mp.next();
        }
    }
    next_list() {
        if (!this.bord.done) {
            this.bord.skip();
        }
        else if (!this.mp.done) {
            this.mp.skip();
        }
    }
    skip() {
        this.bord.skip();
        this.mp.skip();
    }
    reset() {
        this.bord.reset();
        this.mp.reset();
    }
}

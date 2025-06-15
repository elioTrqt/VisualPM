// @ts-ignore
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
export class Vector {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }
    sub(other) {
        return new Vector(this.x - other.x, this.y - other.y);
    }
    len() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.x, 2));
    }
}
;
export class Canvas {
    container;
    svg;
    group;
    constructor(size) {
        this.container = document.createElement('div');
        this.container.classList.add("canvas-container");
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', size.x)
            .attr('height', size.y);
        this.group = this.svg.append('g');
    }
    ;
    append_text(text, x, y, baseline, anchor, fontsize = 20) {
        this.group.append('text')
            .attr('x', x)
            .attr('y', y)
            .attr("font-size", `${fontsize}px`)
            .attr('text-anchor', anchor)
            .attr('dominant-baseline', baseline)
            .text(text);
    }
    clear() {
        this.group.selectAll("*").remove();
    }
}
export class Graphic {
    group; // Root
    pos; // initial postion
    trans; // translation
    speed;
    constructor(parent, pos, anim_speed) {
        this.pos = pos;
        this.trans = new Vector(0, 0);
        this.group = parent.append("g");
        this.speed = anim_speed;
    }
    // return current position, including translation
    get_pos() {
        return this.pos.add(this.trans);
    }
    // move to a given position (actually compute translate and apply translate())
    set_pos(dest, anim) {
        let t = dest.sub(this.get_pos());
        this.translate(t, anim ? anim : this.speed);
    }
    // move the group in the direction of <t>
    translate(t, anim) {
        this.trans = this.trans.add(t);
        this.group.transition()
            .duration(anim ? anim : this.speed * t.len())
            .attr("transform", `translate(${this.trans.x}, ${this.trans.y})`);
    }
    // move back to the original position
    reset_pos() {
        this.set_pos(this.pos);
    }
    // show / hide the group
    set_display(state) {
        this.group.style("display", state ? null : "none");
    }
    // change animation speed
    set_speed(s) {
        this.speed = s;
    }
    // remove the content of the group element
    clear() {
        this.group.selectAll("*").remove();
    }
    // remove the group element from the dom
    remove() {
        this.group.remove();
    }
}
export class GraphicList extends Graphic {
    data;
    cell_width;
    constructor(parent, pos, w, vals, anim_speed) {
        super(parent, pos, anim_speed);
        this.cell_width = w;
        this.data = vals;
        this.draw();
    }
    ;
    draw() {
        this.clear();
        let cur_x = this.pos.x;
        for (let i = 0; i < this.data.length; i++) {
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
                .text(this.data[i] !== null ? `${this.data[i]}` : ``)
                .attr('id', `text_${i}`);
            cur_x += this.cell_width;
        }
    }
    // ACCESS CONTENT
    get(index, off = 1) {
        if (index - off < this.data.length) {
            return this.data[index - off];
        }
        console.log("WARNING: a value outside of graphicList range is being accessed");
        return undefined;
    }
    get_data() {
        return this.data;
    }
    // MODIFY CONTENT
    set(index, val, off = 1) {
        if (index - off < this.data.length) {
            this.data[index - off] = val;
            this.group.select(`#text_${index - off}`).text(val !== null ? `${val}` : ``);
        }
        else {
            console.log("WARNING: a value outside of graphicList range is being set");
        }
    }
    set_data(val) {
        this.data = val;
        this.draw();
    }
    fill_data_with(val, size) {
        this.set_data(new Array(size ? size : this.data.length).fill(val));
    }
    append(val) {
        this.data.push(val);
        this.draw();
    }
    pop(index, off = 1) {
        if (index - off < this.data.length) {
            this.data.splice(index - off, 1);
            this.draw();
        }
        else {
            console.log("WARNING: a value outside of graphicList range is being removed");
        }
    }
    // COLORS
    set_color(index, col, off = 1) {
        if (index - off < this.data.length) {
            this.group.select(`#cell_${index - off}`).attr('fill', col);
        }
        else {
            console.log("WARNING: a color outside of graphicList range is being modified");
        }
    }
    set_data_color(cols) {
        for (let i = 0; i < cols.length; i++) {
            this.set_color(i, cols[i]);
        }
    }
    fill_data_color_with(col) {
        for (let i = 0; i < this.data.length; i++) {
            this.set_color(i, col, 0);
        }
    }
    // MOVEMENT
    shift(d, anim) {
        this.translate(new Vector(d * this.cell_width, 0), anim ? anim : this.speed);
    }
    set_shift(d, anim) {
        this.set_pos(this.pos.add(new Vector(d * this.cell_width, 0)), anim ? anim : this.speed);
    }
    // ABSOLUTE CELL POSITION (for placing arrows)
    get_cell_pos(i, h_align, v_align, off = 1) {
        const cell = i - off;
        if (cell < 0 || cell >= this.data.length) {
            console.log("WARNING: a cell position outside of range is accessed");
            return null;
        }
        let h_off, v_off;
        switch (h_align) {
            case "left":
                h_off = 0;
                break;
            case "middle":
                h_off = 0.5;
                break;
            case "right":
                h_off = 1;
                break;
            default:
                console.log(`WARNING: value ${h_align} is not allowed use 'left', 'middle' or 'right' (defaulting to 'middle')`);
                h_off = 0.5;
                break;
        }
        switch (v_align) {
            case "top":
                v_off = 0;
                break;
            case "middle":
                v_off = 0.5;
                break;
            case "bot":
                v_off = 1;
                break;
            default:
                console.log(`WARNING: value ${v_align} is not allowed use 'top', 'middle' or 'bot' (defaulting to 'middle')`);
                v_off = 0.5;
                break;
        }
        return this.pos.add(new Vector((cell + h_off) * this.cell_width, v_off * this.cell_width));
    }
}
export class GraphicDict extends Graphic {
    data;
    constructor(parent, pos, w, sigma) {
        super(parent, pos, 0);
        this.data = new Map();
        let offset_pos = pos;
        for (let s of sigma) {
            this.data.set(s, new GraphicList(this.group, offset_pos, w, [s], 0));
            offset_pos = offset_pos.add(new Vector(0, w));
        }
    }
    // set the value of an existing cell 
    set(c, index, v) {
        this.data.get(c).set(index, v, 0);
    }
    // set the values of an existing row 
    set_row(c, vals) {
        const total_values = [c];
        this.data.get(c).set_data(total_values.concat(vals));
    }
    // set the values for the whole dict (rows must exist)
    set_data(map) {
        for (let c of map.keys()) {
            this.set_row(c, map.get(c));
        }
    }
    // set each existing row with default values
    fill_data_with(vals) {
        for (let c of this.data.keys()) {
            this.set_row(c, vals);
        }
    }
    // change the color of a given cell
    set_color(c, index, col) {
        this.data.get(c).set_color(index, col, 0);
    }
    // fill every row with the same color
    fill_data_color_with(col) {
        for (let c of this.data.keys()) {
            this.data.get(c).fill_data_color_with(col);
        }
    }
    // append a cell to the end of an existing row
    append_to_row(c, v) {
        this.data.get(c).append(v);
    }
    // remove an existing cell
    pop(c, index) {
        this.data.get(c).pop(index, 0);
    }
    // remove an existing cell with given value
    pop_last(c) {
        this.pop(c, this.data.get(c).get_data().length - 1);
    }
}
export class Arrow extends Graphic {
    line;
    start;
    end;
    start_trans;
    end_trans;
    constructor(parent, start, end, anim_speed, color) {
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
    translate_start(t, anim) {
        this.start = this.start.add(t);
        this.update(anim ? anim : this.speed * t.len());
    }
    translate_end(t, anim) {
        this.end = this.end.add(t);
        this.update(anim ? anim : this.speed * t.len());
    }
    ;
    set_start(t, anim) {
        const duration = anim ? anim : this.speed * this.start.sub(t).len();
        this.start = t;
        this.update(duration);
    }
    set_end(t, anim) {
        const duration = anim ? anim : this.speed * this.end.sub(t).len();
        this.end = t;
        this.update(duration);
    }
    update(duration) {
        this.line.transition()
            .duration(duration)
            .attr("x1", this.start.x)
            .attr("y1", this.start.y)
            .attr("x2", this.end.x)
            .attr("y2", this.end.y);
    }
}

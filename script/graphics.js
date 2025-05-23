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
    get_pos() {
        return this.pos.add(this.trans);
    }
    set_pos(dest, anim) {
        let t = dest.sub(this.get_pos());
        this.translate(t, anim ? anim : this.speed);
    }
    reset_pos() {
        this.set_pos(this.pos);
    }
    translate(t, anim) {
        this.trans = this.trans.add(t);
        this.group.transition()
            .duration(anim ? anim : this.speed * t.len())
            .attr("transform", `translate(${this.trans.x}, ${this.trans.y})`);
    }
    display(state) {
        this.group.style("display", state ? null : "none");
    }
    clear() {
        this.group.selectAll("*").remove();
    }
    remove() {
        this.group.remove();
    }
    set_speed(s) {
        this.speed = s;
    }
}
export class GraphicList extends Graphic {
    values;
    cell_width;
    constructor(parent, pos, anim_speed, w, vals = 0) {
        super(parent, pos, anim_speed);
        this.cell_width = w;
        if (typeof vals !== "number") {
            this.values = vals;
        }
        else {
            this.values = new Array(vals).fill(null);
        }
        this.draw();
    }
    ;
    draw() {
        this.clear();
        let cur_x = this.pos.x;
        for (let i = 0; i < this.values.length; i++) {
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
                .text(this.values[i] === null ? '' : `${this.values[i]}`)
                .attr('id', `text_${i}`);
            cur_x += this.cell_width;
        }
    }
    get(i, off = 1) {
        return this.values[i - off];
    }
    set_value(i, val, off = 1) {
        if (i - off < this.values.length) {
            this.values[i - off] = val;
            this.group.select(`#text_${i - off}`).text(val === null ? '' : `${val}`);
        }
    }
    set_values(val) {
        this.values = val;
        this.draw();
    }
    append(val) {
        this.values.push(val);
        this.draw();
    }
    pop() {
        this.values.pop();
        this.draw();
    }
    fill_values(val) {
        this.set_values(new Array(this.values.length).fill(val));
    }
    set_color(i, val, off = 1) {
        if (i - off < this.values.length) {
            this.group.select(`#cell_${i - off}`).attr('fill', val);
        }
    }
    set_colors(cols) {
        for (let i = 0; i < cols.length; i++) {
            this.set_color(i, cols[i]);
        }
    }
    fill_color(val) {
        for (let i = 0; i < this.values.length; i++) {
            this.set_color(i, val, 0);
        }
    }
    shift(d, anim) {
        this.translate(new Vector(d * this.cell_width, 0), anim ? anim : this.speed);
    }
    set_shift(d, anim) {
        this.set_pos(this.pos.add(new Vector(d * this.cell_width, 0)), anim ? anim : this.speed);
    }
    /*
    h and v are horizontal and vertical offset, by default middle of the cell is given
    h = 1 mean right, h= -1 mean left, and v= 1 or -1 mean bot and top respectively
    0 mean center for h or v
    */
    get_cell_pos(i, h, v, offset = 1) {
        const center = this.pos.add(new Vector((i - offset + 0.5) * this.cell_width, 0.5 * this.cell_width));
        return center.add(new Vector(0.5 * h * this.cell_width, 0.5 * v * this.cell_width));
    }
}
export class GraphicDict extends Graphic {
    content;
    constructor(parent, pos, w, pattern) {
        super(parent, pos, 0);
        this.content = new Map();
        const sigma = [...new Set(pattern)].sort();
        sigma.push('...');
        let offset_pos = pos;
        for (let c of sigma) {
            this.content.set(c, new GraphicList(this.group, offset_pos, 0, w, [c, ""]));
            offset_pos = offset_pos.add(new Vector(0, w));
        }
    }
    set_value(c, i, v) {
        this.content.get(c).set_value(i, v, 0);
    }
    set_values(c, vals) {
        const total_values = [c];
        this.content.get(c).set_values(total_values.concat(vals));
    }
    set_color(c, i, v) {
        this.content.get(c).set_color(i, v, 0);
    }
    fill_color(v) {
        for (let c of this.content.keys()) {
            this.content.get(c).fill_color(v);
        }
    }
    append(c, v) {
        this.content.get(c).append(v);
    }
    pop(c) {
        this.content.get(c).pop();
    }
    fill(map) {
        for (let c of map.keys()) {
            let data = [c];
            data = data.concat(map.get(c));
            this.content.get(c).set_values(data);
        }
        this.content.get('...').set_values(['...', 0]);
    }
    empty() {
        for (let c of this.content.keys()) {
            this.content.get(c).set_values([c, ""]);
        }
    }
}
export class Arrow extends Graphic {
    line;
    //marker: d3.Selection<SVGMarkerElement, unknown, null, undefined>;
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

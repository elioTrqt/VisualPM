import { Vector } from "./vector.js";
export class Graphic {
    pos; // initial postion
    trans; // translation
    group; // Root
    constructor(parent, pos) {
        this.pos = pos;
        this.trans = new Vector(0, 0);
        this.group = parent.append("g");
    }
    get_pos() {
        return this.pos.add(this.trans);
    }
    set_pos(dest) {
        let t = dest.sub(this.get_pos());
        this.translate(t);
    }
    reset_pos() {
        this.set_pos(this.pos);
    }
    translate(t, speed = 0) {
        this.trans = this.trans.add(t);
        this.group.transition()
            .duration(speed * t.len())
            .attr("transform", `translate(${this.trans.x}, ${this.trans.y})`);
    }
    clear() {
        this.group.selectAll("*").remove();
    }
    remove() {
        this.group.remove();
    }
}
export class GraphicList extends Graphic {
    values;
    cell_width;
    anim_speed = 1;
    constructor(parent, pos, w, vals = 0) {
        super(parent, pos);
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
    set(i, val, off = 1) {
        if (i - off < this.values.length) {
            this.values[i - off] = val;
            this.group.select(`#text_${i - off}`).text(val === null ? '' : `${val}`);
        }
    }
    set_values(val) {
        this.values = val;
        this.draw();
    }
    fill(val) {
        for (let i = 0; i < this.values.length; i++) {
            this.set(i, val, 0);
        }
    }
    set_color(i, val, off = 1) {
        if (i - off < this.values.length) {
            this.group.select(`#cell_${i - off}`).attr('fill', val);
        }
    }
    fill_color(val) {
        for (let i = 0; i < this.values.length; i++) {
            this.set_color(i, val, 0);
        }
    }
    shift(d) {
        this.translate(new Vector(d * this.cell_width, 0), this.anim_speed);
    }
}
export class Arrow extends Graphic {
    line;
    //marker: d3.Selection<SVGMarkerElement, unknown, null, undefined>;
    start;
    end;
    start_trans;
    end_trans;
    constructor(parent, start, end, color) {
        super(parent, start);
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
    translate_start(t, speed = 0) {
        this.start = this.start.add(t);
        this.update(speed * t.len());
    }
    translate_end(t, speed = 0) {
        this.end = this.end.add(t);
        this.update(speed * t.len());
    }
    ;
    set_start(t, speed = 0) {
        const duration = speed * this.start.sub(t).len();
        this.start = t;
        this.update(duration);
    }
    set_end(t, speed = 0) {
        const duration = speed * this.end.sub(t).len();
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
export class DynamicSection {
    container;
    menu;
    content;
    constructor(container, content, title) {
        this.content = content;
        this.container = container;
        this.menu = document.createElement('div');
        this.menu.style.padding = '10px';
        this.menu.classList.add('row-cols-auto');
        this.menu.style.paddingLeft = `125px`;
        this.menu.style.paddingBottom = '20px';
        this.container.insertBefore(this.menu, this.container.firstChild);
        if (title != "") {
            const head = document.createElement('h3');
            head.innerHTML = title;
            head.style.paddingLeft = `125px`;
            head.style.paddingBottom = '10px';
            this.container.insertBefore(head, this.container.firstChild);
        }
        this.build_menu();
    }
    build_menu() {
        const next_button = document.createElement('button');
        next_button.innerHTML = 'Next';
        next_button.classList.add('btn');
        next_button.classList.add('btn-outline-primary');
        next_button.classList.add('dyn-menu-btn');
        next_button.type = 'button';
        next_button.addEventListener('click', this.content.next.bind(this.content));
        this.menu.appendChild(next_button);
        const skip_button = document.createElement('button');
        skip_button.innerHTML = 'Skip';
        skip_button.classList.add('btn');
        skip_button.classList.add('btn-outline-primary');
        skip_button.classList.add('dyn-menu-btn');
        skip_button.type = 'button';
        skip_button.addEventListener('click', this.content.skip.bind(this.content));
        this.menu.appendChild(skip_button);
        const reset_button = document.createElement('button');
        reset_button.innerHTML = 'Reset';
        reset_button.classList.add('btn');
        reset_button.classList.add('btn-outline-primary');
        reset_button.classList.add('dyn-menu-btn');
        reset_button.type = 'button';
        reset_button.addEventListener('click', this.content.reset.bind(this.content));
        this.menu.appendChild(reset_button);
    }
}
export class SlidingWindow extends Graphic {
    text;
    pattern;
    arrow;
    constructor(parent, pos, w, text, pattern) {
        super(parent, pos);
        this.text = new GraphicList(this.group, pos, w, text.split(""));
        this.pattern = new GraphicList(this.group, pos.add(new Vector(0, 2 * w)), w, pattern.split(""));
    }
    equals(i, j) {
        if (this.pattern.get(i) == this.text.get(j)) {
            this.pattern.set_color(i, 'green');
            this.text.set_color(j, 'green');
            this.display_shift(i, j, 'green');
            return true;
        }
        else {
            this.pattern.set_color(i, 'red');
            this.text.set_color(j, 'red');
            this.display_shift(i, j, 'red');
            return false;
        }
    }
    shift(i) {
        this.pattern.shift(i);
        this.arrow?.translate_start(new Vector(i * this.pattern.cell_width, 0), 1);
    }
    display_shift(from, to, color = 'black') {
        this.arrow?.remove();
        const start = new Vector(this.pattern.get_pos().x + (from - 0.5) * this.pattern.cell_width, this.pattern.get_pos().y);
        const end = new Vector(this.text.get_pos().x + (to - 0.5) * this.text.cell_width, this.text.get_pos().y + this.text.cell_width);
        this.arrow = new Arrow(this.group, start, end, color);
    }
    reset() {
        this.arrow?.remove();
        this.pattern.reset_pos();
        this.pattern.fill_color('white');
        this.text.fill_color('white');
    }
}

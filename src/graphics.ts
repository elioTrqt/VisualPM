// @ts-ignore
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { DomElement } from "./types.js";

export type D3selec<T extends SVGGraphicsElement> = d3.Selection<T, unknown, null | HTMLElement, undefined>;

export class Vector {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	add(other: Vector): Vector {
		return new Vector(this.x + other.x, this.y + other.y);
	}
	sub(other: Vector): Vector {
		return new Vector(this.x - other.x, this.y - other.y);
	}

	len(): number {
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.x, 2));
	}
};

export class Canvas implements DomElement {
	readonly container: HTMLElement;
	readonly svg: D3selec<SVGElement>;
	readonly group: D3selec<SVGGElement>;

	constructor(size: Vector) {
		this.container = document.createElement('div');
		this.container.classList.add("canvas-container");

		this.svg = d3.select(this.container)
			.append('svg')
			.attr('width', size.x)
			.attr('height', size.y);

		this.group = this.svg.append('g');
	};

	append_text(text: string, x: number, y: number, baseline: string, anchor: string, fontsize: number = 20): void {
		this.group.append('text')
			.attr('x', x)
			.attr('y', y)
			.attr("font-size", `${fontsize}px`)
			.attr('text-anchor', anchor)
			.attr('dominant-baseline', baseline)
			.text(text);
	}

	clear(): void {
		this.group.selectAll("*").remove();
	}
}

export class Graphic {
	readonly group: D3selec<SVGGElement>;     // Root
	readonly pos: Vector;   // initial postion
	trans: Vector;          // translation
	speed: number;

	constructor(parent: D3selec<SVGGElement>, pos: Vector, anim_speed: number) {
		this.pos = pos;
		this.trans = new Vector(0, 0);
		this.group = parent.append("g");
		this.speed = anim_speed;
	}

	// return current position, including translation
	get_pos(): Vector {
		return this.pos.add(this.trans);
	}

	// move to a given position (actually compute translate and apply translate())
	set_pos(dest: Vector, anim?: number): void {
		let t: Vector = dest.sub(this.get_pos());
		this.translate(t, anim ? anim : this.speed);
	}

	// move the group in the direction of <t>
	translate(t: Vector, anim?: number): void {
		this.trans = this.trans.add(t);
		this.group.transition()
			.duration(anim ? anim : this.speed * t.len())
			.attr("transform", `translate(${this.trans.x}, ${this.trans.y})`);
	}

	// move back to the original position
	reset_pos(): void {
		this.set_pos(this.pos);
	}

	// show / hide the group
	set_display(state: boolean): void {
		this.group.style("display", state ? null : "none");
	}

	// change animation speed
	set_speed(s: number) {
		this.speed = s;
	}

	// remove the content of the group element
	clear(): void {
		this.group.selectAll("*").remove();
	}

	// remove the group element from the dom
	remove(): void {
		this.group.remove();
	}
}


export class GraphicList<T> extends Graphic {
	data: Array<T | null>;
	cell_width: number;

	constructor(parent: D3selec<SVGGElement>, pos: Vector, w: number, vals: Array<T | null>, anim_speed: number) {
		super(parent, pos, anim_speed);
		this.cell_width = w;
		this.data = vals;
		this.draw();
	};

	draw(): void {
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

	get(index: number, off: number = 1): T | null | undefined {
		if (index - off < this.data.length) {
			return this.data[index - off];
		}
		console.log("WARNING: a value outside of graphicList range is being accessed");
		return undefined;
	}

	get_data(): Array<T | null> {
		return this.data;
	}

	// MODIFY CONTENT

	set(index: number, val: T | null, off: number = 1): void {
		if (index - off < this.data.length) {
			this.data[index - off] = val;
			this.group.select(`#text_${index - off}`).text(val !== null ? `${val}` : ``);
		} else {
			console.log("WARNING: a value outside of graphicList range is being set");
		}
	}

	set_data(val: Array<T | null>): void {
		this.data = val;
		this.draw();
	}

	fill_data_with(val: T | null, size?: number): void {
		this.set_data(new Array(size ? size : this.data.length).fill(val));
	}

	append(val: T | null): void {
		this.data.push(val);
		this.draw();
	}

	pop(index: number, off: number = 1): void {
		if (index - off < this.data.length) {
			this.data.splice(index - off, 1);
			this.draw();
		} else {
			console.log("WARNING: a value outside of graphicList range is being removed");
		}
	}

	// COLORS

	set_color(index: number, col: string, off: number = 1): void {
		if (index - off < this.data.length) {
			this.group.select(`#cell_${index - off}`).attr('fill', col);
		} else {
			console.log("WARNING: a color outside of graphicList range is being modified");
		}
	}

	set_data_color(cols: string[]): void {
		for (let i = 0; i < cols.length; i++) {
			this.set_color(i, cols[i]);
		}
	}

	fill_data_color_with(col: string): void {
		for (let i = 0; i < this.data.length; i++) {
			this.set_color(i, col, 0);
		}
	}

	// MOVEMENT

	shift(d: number, anim?: number): void {
		this.translate(new Vector(d * this.cell_width, 0), anim ? anim : this.speed);
	}

	set_shift(d: number, anim?: number): void {
		this.set_pos(this.pos.add(new Vector(d * this.cell_width, 0)), anim ? anim : this.speed);
	}

	// ABSOLUTE CELL POSITION (for placing arrows)

	get_cell_pos(i: number, h_align: string, v_align: string, off: number = 1): Vector | null {
		const cell = i - off;

		if (cell < 0 || cell >= this.data.length) {
			console.log("WARNING: a cell position outside of range is accessed");
			return null;
		}

		let h_off: number, v_off: number;
		switch (h_align) {
			case "left": h_off = 0; break;
			case "middle": h_off = 0.5; break;
			case "right": h_off = 1; break;
			default:
				console.log(`WARNING: value ${h_align} is not allowed use 'left', 'middle' or 'right' (defaulting to 'middle')`);
				h_off = 0.5;
				break;
		}
		switch (v_align) {
			case "top": v_off = 0; break;
			case "middle": v_off = 0.5; break;
			case "bot": v_off = 1; break;
			default:
				console.log(`WARNING: value ${v_align} is not allowed use 'top', 'middle' or 'bot' (defaulting to 'middle')`);
				v_off = 0.5;
				break;
		}

		return this.pos.add(new Vector((cell + h_off) * this.cell_width, v_off * this.cell_width));
	}
}

export class GraphicDict<S, T> extends Graphic {
	data: Map<S, GraphicList<S | T>>;

	constructor(parent: D3selec<SVGGElement>, pos: Vector, w: number, sigma: S[]) {
		super(parent, pos, 0);
		this.data = new Map<S, GraphicList<S | T>>();

		let offset_pos = pos;
		for (let s of sigma) {
			this.data.set(s, new GraphicList<S | T>(this.group, offset_pos, w, [s], 0));
			offset_pos = offset_pos.add(new Vector(0, w));
		}
	}

	// set the value of an existing cell 
	set(c: S, index: number, v: T | null): void {
		this.data.get(c)!.set(index, v, 0);
	}

	// set the values of an existing row 
	set_row(c: S, vals: Array<T | null>): void {
		const total_values: Array<S | T | null> = [c];
		this.data.get(c)!.set_data(total_values.concat(vals));
	}

	// set the values for the whole dict (rows must exist)
	set_data(map: Map<S, Array<T | null>>): void {
		for (let c of map.keys()) {
			this.set_row(c, map.get(c)!);
		}
	}

	// set each existing row with default values
	fill_data_with(vals: Array<T | null>): void {
		for (let c of this.data.keys()) {
			this.set_row(c, vals);
		}
	}

	// change the color of a given cell
	set_color(c: S, index: number, col: string): void {
		this.data.get(c)!.set_color(index, col, 0);
	}

	// fill every row with the same color
	fill_data_color_with(col: string): void {
		for (let c of this.data.keys()) {
			this.data.get(c)!.fill_data_color_with(col);
		}
	}

	// append a cell to the end of an existing row
	append_to_row(c: S, v: T | null): void {
		this.data.get(c)!.append(v);
	}

	// remove an existing cell
	pop(c: S, index: number): void {
		this.data.get(c)!.pop(index, 0);
	}

	// remove an existing cell with given value
	pop_last(c: S): void {
		this.pop(c, this.data.get(c)!.get_data().length - 1);
	}

}


export class Arrow extends Graphic {
	line: D3selec<SVGLineElement>;
	start: Vector;
	end: Vector;
	start_trans: Vector;
	end_trans: Vector;

	constructor(parent: D3selec<SVGGElement>, start: Vector, end: Vector, anim_speed: number, color: string) {
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

	translate_start(t: Vector, anim?: number): void {
		this.start = this.start.add(t);
		this.update(anim ? anim : this.speed * t.len());
	}

	translate_end(t: Vector, anim?: number): void {
		this.end = this.end.add(t);
		this.update(anim ? anim : this.speed * t.len());
	}

	set_start(t: Vector, anim?: number): void {
		const duration = anim ? anim : this.speed * this.start.sub(t).len();
		this.start = t;
		this.update(duration);
	}

	set_end(t: Vector, anim?: number): void {
		const duration = anim ? anim : this.speed * this.end.sub(t).len();
		this.end = t;
		this.update(duration);
	}

	set_color(c: string) {
		this.line.attr("stroke", c);
	}

	update(duration: number): void {
		this.line.transition()
			.duration(duration)
			.attr("x1", this.start.x)
			.attr("y1", this.start.y)
			.attr("x2", this.end.x)
			.attr("y2", this.end.y);
	}
}

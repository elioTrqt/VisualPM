import { Canvas, GraphicDict, GraphicList, Vector } from "../../graphics.js";
import { init_right } from "../../algs/bm.js";
import { AlgSection, IUpdatable } from "../dynamic.js";


export class dictRowUpdate {
	id: string = "";
	color: Array<[number, string]> = [];
	append: Array<number | null> = [];
	update: Array<{ pos: number, prev: number | null, new: number | null }> = [];
}

export class RTableState {
	index_color: Array<[number, string]> = [];
	pattern_color: Array<[number, string]> = [];
	rows: Array<dictRowUpdate> = [];
}

export type RSectionState = {
	data: RTableState,
	message: string,
}

class RTable extends Canvas implements IUpdatable {
	index: GraphicList<number>;
	pattern: GraphicList<string>;
	table: GraphicDict<string, number>;

	improved: boolean;
	right_vals: Map<string, Array<number>>;

	constructor(pattern: string, improved: boolean, w: number, right: Map<string, Array<number>>) {
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

	update(state: RTableState): void {
		this.clear_color();

		for (let c of state.index_color) {
			this.index.set_color(c[0], c[1]);
		}
		for (let c of state.pattern_color) {
			this.pattern.set_color(c[0], c[1]);
		}

		for (let row of state.rows) {
			for (let v of row.append) this.table.append_to_row(row.id, v);
			for (let u of row.update) this.table.set(row.id, u.pos, u.new);
			for (let c of row.color) this.table.set_color(row.id, c[0], c[1]);
		}
	}

	reverse_update(state: RTableState): void {
		this.clear_color();

		for (let row of state.rows) {
			for (let u of row.update) this.table.set(row.id, u.pos, u.prev);
			for (let v of row.append) this.table.pop_last(row.id);
		}
	}

	skip(): void {
		this.clear_color();
		this.table.set_data(this.right_vals);
	}

	reset(): void {
		this.clear_color();
		this.table.fill_data_with([]);
	}

	clear_color(): void {
		this.index.fill_data_color_with("white");
		this.pattern.fill_data_color_with("white");
		this.table.fill_data_color_with("white");
	}

	static get_size(pattern: string, improved: boolean, width: number): Vector {
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
		if (improved) x = Math.max(x, (2 + maxFreq) * width);
		const y = (4.5 + chars.length) * width;

		return new Vector(x, y);
	}
}


export class RSection extends AlgSection {
	constructor(pattern: string, improved: boolean) {
		const right = init_right(pattern, improved);
		const rtable = new RTable(pattern, improved, 50, right.data);
		super("Table R (mauvais caractère) :", "some help", rtable, right.steps);
	}
}

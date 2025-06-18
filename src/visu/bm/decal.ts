import { AlgSection } from "../sections.js";
import { IUpdatable } from "../../types.js";
import { Canvas, GraphicList, Vector } from "../../graphics.js";
import { init_decal, init_suff } from "../../algs/bm.js";

export class listUpdate {
	color: Array<[number, string]> = [];
	update: Array<{ pos: number, prev: number | null, new: number | null }> = [];
}

export class DTableState {
	index_color: Array<[number, string]> = [];
	pattern_color: Array<[number, string]> = [];
	suff = new listUpdate();
	decal = new listUpdate();
}

export type DSectionState = {
	data: DTableState,
	message: string,
}

class DTable extends Canvas implements IUpdatable {
	index: GraphicList<number>;
	pattern: GraphicList<string>;
	suff: GraphicList<number>;
	decal: GraphicList<number>;

	suff_vals: number[];
	decal_vals: number[];

	constructor(pattern: string, w: number, suff: number[], decal: number[]) {
		super(DTable.get_size(pattern, w));
		this.container.id = 'dtable-graphic-container';
		this.suff_vals = suff;
		this.decal_vals = decal;

		const offset_pos = new Vector(80, 25);
		this.index = new GraphicList(this.group, offset_pos, w, Array.from({ length: pattern.length }, (_, index) => index + 1), 0);
		this.pattern = new GraphicList(this.group, offset_pos.add(new Vector(0, w)), w, pattern.split(""), 0);
		this.suff = new GraphicList(this.group, offset_pos.add(new Vector(0, 2 * w)), w, Array(pattern.length).fill(null), 0);
		this.decal = new GraphicList(this.group, offset_pos.add(new Vector(0, 3 * w)), w, Array(pattern.length).fill(null), 0);

		this.append_text('i', offset_pos.x - 10, offset_pos.y + .5 * w, 'middle', 'end');
		this.append_text('P[ i ]', offset_pos.x - 10, offset_pos.y + 1.5 * w, 'middle', 'end');
		this.append_text('Suff[ i ]', offset_pos.x - 10, offset_pos.y + 2.5 * w, 'middle', 'end');
		this.append_text(`D[ i ]`, offset_pos.x - 10, offset_pos.y + 3.5 * w, 'middle', 'end');
	}

	update(state: DTableState): void {
		for (let u of state.suff.update) {
			this.suff.set(u.pos, u.new);
		}
		for (let u of state.decal.update) {
			this.decal.set(u.pos, u.new);
		}

		this.clear_color();
		for (let c of state.index_color) {
			this.index.set_color(c[0], c[1]);
		}
		for (let c of state.pattern_color) {
			this.pattern.set_color(c[0], c[1]);
		}
		for (let c of state.suff.color) {
			this.suff.set_color(c[0], c[1]);
		}
		for (let c of state.decal.color) {
			this.decal.set_color(c[0], c[1]);
		}
	}

	reverse_update(state: DTableState, prev_state?: DTableState): void {
		for (let u of state.suff.update) {
			this.suff.set(u.pos, u.prev);
		}
		for (let u of state.decal.update) {
			this.decal.set(u.pos, u.prev);
		}
		this.clear_color();

		if (!prev_state) return;

		for (let c of prev_state.index_color) {
			this.index.set_color(c[0], c[1]);
		}
		for (let c of prev_state.pattern_color) {
			this.pattern.set_color(c[0], c[1]);
		}
		for (let c of prev_state.suff.color) {
			this.suff.set_color(c[0], c[1]);
		}
		for (let c of prev_state.decal.color) {
			this.decal.set_color(c[0], c[1]);
		}
	}

	reset(): void {
		this.clear_color();
		this.suff.fill_data_with(null);
		this.decal.fill_data_with(null);
	}

	clear_color(): void {
		this.index.fill_data_color_with("white");
		this.pattern.fill_data_color_with("white");
		this.suff.fill_data_color_with("white");
		this.decal.fill_data_color_with("white");
	}

	static get_size(pattern: string, w: number): Vector {
		return new Vector(100 + pattern.length * w, 5 * w);
	}
}


export class DSection extends AlgSection {
	suffvalues: number[];
	dvalues: number[];
	skip_update: DSectionState;

	constructor(pattern: string) {
		const suff = init_suff(pattern);
		const decal = init_decal(pattern, suff.values);
		const dtable = new DTable(pattern, 50, suff.values.splice(1), decal.values.splice(1));
		super("Tables Suff & D (bon suffixe) :", "some help", dtable, suff.steps.concat(decal.steps));

		this.suffvalues = suff.values.splice(1);
		this.dvalues = decal.values.splice(1);

		this.skip_update = { message: "", data: new DTableState() };
		const suff_updt = this.suffvalues.map((v, i) => ({
			pos: i + 1,
			prev: null,
			new: v,
		}));
		const d_updt = this.dvalues.map((v, i) => ({
			pos: i + 1,
			prev: null,
			new: v,
		}));
		this.skip_update.data.suff = { color: [], update: suff_updt };
		this.skip_update.data.decal = { color: [], update: d_updt };
	}

	skip(): void {
		this.data.reset();
		this.update(this.skip_update);
		super.skip();
	}
}

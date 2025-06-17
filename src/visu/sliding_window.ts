import { IUpdatable } from "../types.js";
import { Canvas, GraphicList, Vector, Arrow } from "../graphics.js";

export class patternUpdate {
	color: Array<[number, string]> = [];
	pos?: { prev: number, new: number };
}

type arrowPosInfo = {
	prev: {
		aln_to: string,
		pos: number
	},
	new: {
		aln_to: string,
		pos: number
	}
};

export class arrowUpdate {
	display: boolean = false;
	color: string = "black";
	start?: arrowPosInfo;
	end?: arrowPosInfo;
	anim: boolean = false;
}

export class SWState {
	text_color: Array<[number, string]> = [];
	pattern: patternUpdate = new patternUpdate();
	arrow: arrowUpdate = new arrowUpdate();
}

export type SWSectionState = {
	data: SWState,
	message: string,
}

export class SlidingWindow extends Canvas implements IUpdatable {
	text: GraphicList<string>;
	pattern: GraphicList<string>;
	arrow: Arrow;
	speed: number;

	constructor(text: string, pattern: string, w: number, anim_speed: number) {
		super(SlidingWindow.get_size(text, pattern, w));
		this.container.id = "sw-graphic";
		this.speed = anim_speed;

		const offset_pos = new Vector(w, w);
		this.text = new GraphicList(this.group, offset_pos, w, text.split(""), anim_speed);
		this.pattern = new GraphicList(this.group, offset_pos.add(new Vector(0, 2 * w)), w, pattern.split(""), anim_speed);
		this.arrow = new Arrow(this.group, new Vector(0, 0), new Vector(0, 0), anim_speed, "black");
		this.arrow.set_display(false);
	};

	update(state: SWState): void {
		this.clear_color();

		if (state.pattern.pos) this.pattern.set_shift(state.pattern.pos.new);

		for (let c of state.pattern.color)
			this.pattern.set_color(c[0], c[1]);
		for (let c of state.text_color)
			this.text.set_color(c[0], c[1]);

		this.arrow.set_display(state.arrow.display);
		this.arrow.set_color(state.arrow.color);
		if (state.arrow.start) {
			const abs_pos = this.get_arrow_abs(state.arrow.start, false);
			this.arrow.set_start(abs_pos, state.arrow.anim ? this.speed : 0);
		}
		if (state.arrow.end) {
			const abs_pos = this.get_arrow_abs(state.arrow.end, false);
			this.arrow.set_end(abs_pos, state.arrow.anim ? this.speed : 0);
		}
	}

	reverse_update(state: any, prev_state?: any): void {
		this.clear_color();

		if (state.pattern.pos) this.pattern.set_shift(state.pattern.pos.prev);

		for (let c of prev_state.pattern.color)
			this.pattern.set_color(c[0], c[1]);
		for (let c of prev_state.text_color)
			this.text.set_color(c[0], c[1]);

		this.arrow.set_display(prev_state.arrow.display);
		this.arrow.set_color(prev_state.arrow.color);
		if (state.arrow.start) {
			const abs_pos = this.get_arrow_abs(state.arrow.start, true);
			this.arrow.set_start(abs_pos, state.arrow.anim ? this.speed : 0);
		}
		if (state.arrow.end) {
			const abs_pos = this.get_arrow_abs(state.arrow.end, true);
			this.arrow.set_end(abs_pos, state.arrow.anim ? this.speed : 0);
		}
	}

	get_arrow_abs(data: arrowPosInfo, reverse: boolean): Vector {
		if (!reverse) {
			switch (data.new.aln_to) {
				case "pattern": return this.pattern.get_cell_pos(data.new.pos, "middle", "top")!;
				case "text": return this.text.get_cell_pos(data.new.pos, "middle", "bot")!;
				default: console.log(`WARNING: aln_to ${data.new.aln_to} not supported in sliding window`);
					return new Vector(0, 0);
			}
		} else {
			switch (data.prev.aln_to) {
				case "pattern": return this.pattern.get_cell_pos(data.prev.pos, "middle", "top")!;
				case "text": return this.text.get_cell_pos(data.prev.pos, "middle", "bot")!;
				default: console.log(`WARNING: aln_to ${data.prev.aln_to} not supported in sliding window`);
					return new Vector(0, 0);
			}
		}
	}

	skip(): void {
		// TODO: Refactor BM so that only the section have to handle skip() and reset()
		console.log("skip sliding window not implemented");
	}

	reset(): void {
		// TODO: Refactor BM so that only the section have to handle skip() and reset()
		console.log("reset sliding window not implementd: to be refactored");
	}

	clear_color(): void {
		this.text.fill_data_color_with("white");
		this.pattern.fill_data_color_with("white");
		this.arrow.set_color("black");
		this.arrow.set_display(false);
	}

	static get_size(text: string, pattern: string, w: number): Vector {
		return new Vector((text.length + pattern.length + 2) * w, 4 * w);
	}
};


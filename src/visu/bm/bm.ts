// import { init_bm_search } from "../../algs/bm.js";
import { RSection, RSectionState } from "./right.js";
import { DSection, DSectionState } from "./decal.js";
import { SWSection, SWSectionState } from "../sliding_window.js";
import { DomElement, IDynamic } from "../../types.js";
import { AlgSection } from "../sections.js";


export type BMState = {
	right: RSectionState;
	decal: DSectionState;
	sw: SWSectionState;
	comp: number;
	found: number;
};

class BMAlg implements IDynamic, DomElement {
	container: HTMLDivElement;

	rsec: RSection;
	dsec: DSection;
	sw: SWSection;

	current_step: number = 0;
	steps: BMState[];

	constructor(text: string, pattern: string, improved: boolean) {
		this.container = document.createElement('div');
		this.container.classList.add('main-alg-container');
		this.container.classList.add('bm-alg-container');

		this.dsec = new DSection(pattern);
		this.rsec = new RSection(pattern, improved);
		this.steps = []; // init_bm(this.dsec.dvalues, this.rsec.rvalues, improved);
		this.sw = new SWSection(text, pattern, `Boyer Moore Search ${improved ? '+' : ''}`, 'this describe the algorithm', this.steps[this.steps.length - 1].sw);
	}

	next(): boolean {
		if (this.current_step >= this.steps.length)
			return false;
		if (!this.rsec.is_done()) this.rsec.skip();
		if (!this.dsec.is_done()) this.dsec.skip();

		this.rsec.update(this.steps[this.current_step].right);
		this.dsec.update(this.steps[this.current_step].decal);
		this.sw.update(this.steps[this.current_step].sw);

		return this.current_step < this.steps.length;
	}

	prev(): boolean {
		if (this.current_step <= 0) {
			return false;
		}
		if (!this.rsec.is_done()) this.rsec.skip();
		if (!this.dsec.is_done()) this.dsec.skip();
		this.current_step--;
		this.rsec.reverse_update(this.steps[this.current_step].right, this.steps[this.current_step - 1]?.right);
		this.dsec.reverse_update(this.steps[this.current_step].decal, this.steps[this.current_step - 1]?.decal);
		this.sw.reverse_update(this.steps[this.current_step].sw, this.steps[this.current_step - 1]?.sw);
		return this.current_step > 0;
	}

	skip(): void {
		this.rsec.skip();
		this.dsec.skip();
		this.sw.skip();
	}

	reset(): void {
		this.rsec.reset();
		this.dsec.reset();
		this.sw.reset();
	}

	is_done(): boolean {
		return this.current_step >= this.steps.length;
	}

	is_started(): boolean {
		return this.current_step > 0;
	}
};

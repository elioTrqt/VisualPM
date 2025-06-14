// @ts-ignore
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

import { DomElement } from "../types.js";
import { Message } from "./alg.js"
import { Graphic, GraphicDict, GraphicList, Vector, D3selec } from "../graphics.js";
import { Header } from "./alg.js";

export interface IUpdatable {
	update(state: any): void;
	reverse_update(state: any): void;
	skip(): void;
	reset(): void;
}

export interface IDynamic {
	next(): boolean;
	prev(): boolean;
	skip(): void;
	reset(): void;
	is_done(): boolean;
	is_started(): boolean;
}

export type AlgStep = {
	data: any,
	message: string,
}

export class AlgSection implements IDynamic, IUpdatable, DomElement {
	container: HTMLDivElement;

	header: Header;
	menu: DynamicMenu;
	data: IUpdatable & DomElement;
	message: Message;

	current_step: number = 0;
	steps: AlgStep[] = [];

	constructor(title: string, help: string, data: IUpdatable & DomElement, steps: AlgStep[]) {
		this.container = document.createElement('div');
		this.container.classList.add("alg-section");

		this.header = new Header(title, help);
		this.menu = new DynamicMenu(this);
		this.data = data;
		this.message = new Message();

		for (let c of [this.header, this.menu, this.data, this.message])
			this.container.appendChild(c.container);
	}

	update(step: AlgStep) {
		if (!this.is_done()) this.skip();
		this.data.update(step.data);
		this.message.update(step.message);
	}

	reverse_update(state: any): void {
		if (!this.is_done()) this.skip();
		this.data.reverse_update(state.data);
		this.message.update("");
	}

	next(): boolean {
		if (this.current_step >= this.steps.length) {
			return false;
		}
		this.data.update(this.steps[this.current_step].data);
		this.message.update(this.steps[this.current_step].message);
		this.current_step++;
		return this.current_step < this.steps.length;
	}

	prev(): boolean {
		if (this.current_step <= 0) {
			return false;
		}
		this.current_step--;
		this.data.reverse_update(this.steps[this.current_step]);
		if (this.current_step > 0) {
			this.data.update(this.steps[this.current_step - 1].data);
			this.message.update(this.steps[this.current_step - 1].message);
		} else {
			this.message.update("");
		}
		return this.current_step > 0;
	}

	skip(): void {
		this.data.skip();
		this.message.update("");
		this.current_step = this.steps.length;
	}

	reset(): void {
		this.data.reset();
		this.message.update("");
		this.current_step = -1;
	}

	is_done(): boolean {
		return this.current_step >= this.steps.length;
	}

	is_started(): boolean {
		return this.current_step > 0;
	}
}


export class DynamicMenu implements DomElement {
	container: HTMLDivElement;

	bind: IDynamic;

	next: HTMLButtonElement;
	prev: HTMLButtonElement;
	reset: HTMLButtonElement;
	skip: HTMLButtonElement;

	constructor(to_bind: IDynamic) {
		this.bind = to_bind;

		this.container = document.createElement('div');
		this.container.classList.add("dynamic-menu");

		this.prev = document.createElement('button');
		this.prev.innerHTML = '<i class="fa-solid fa-backward-step"></i>';
		this.prev.classList.add('btn');
		this.prev.classList.add('btn-outline-dark');
		this.prev.classList.add('prev');
		this.prev.addEventListener('click', () => this.step("prev"));
		this.container.appendChild(this.prev);

		this.next = document.createElement('button');
		this.next.innerHTML = '<i class="fa-solid fa-forward-step"></i>';
		this.next.classList.add('btn');
		this.next.classList.add('btn-outline-dark');
		this.next.classList.add('next');
		this.next.addEventListener('click', () => this.step("next"));
		this.container.appendChild(this.next);

		this.skip = document.createElement('button');
		this.skip.innerHTML = '<i class="fa-solid fa-forward-fast"></i>';
		this.skip.classList.add('btn');
		this.skip.classList.add('btn-outline-dark');
		this.skip.classList.add('skip');
		this.skip.addEventListener('click', () => this.step("skip"));
		this.container.appendChild(this.skip);

		this.reset = document.createElement('button');
		this.reset.innerHTML = '<i class="fa-solid fa-rotate-left"></i>';
		this.reset.classList.add('btn');
		this.reset.classList.add('btn-outline-dark');
		this.reset.classList.add('reset');
		this.reset.addEventListener('click', () => this.step("reset"));
		this.container.appendChild(this.reset);

		this.update();
	}

	step(to_do: string): void {
		switch (to_do) {
			case "prev": this.bind.prev(); break;
			case "next": this.bind.next(); break;
			case "skip": this.bind.skip(); break;
			case "reset": this.bind.reset(); break;
		}
		this.update();
	}

	update(): void {
		if (this.bind.is_done()) {
			this.next.setAttribute('disabled', 'true');
			this.skip.setAttribute('disabled', 'true');
		} else {
			this.next.removeAttribute('disabled');
			this.skip.removeAttribute('disabled');
		}

		if (!this.bind.is_started()) {
			this.prev.setAttribute('disabled', 'true');
			this.reset.setAttribute('disabled', 'true');
		} else {
			this.prev.removeAttribute('disabled');
			this.reset.removeAttribute('disabled');
		}
	}
}


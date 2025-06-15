import { DomElement, IDynamic } from "../types.js";

export class Message implements DomElement {
	container: HTMLDivElement;
	current_msg: string = "";

	constructor() {
		this.container = document.createElement('div');
		this.container.classList.add('alert');
		this.container.classList.add('alert-success');
		this.container.classList.add('step-help')
		this.container.setAttribute('role', 'alert');

		this.update(this.current_msg);
	}

	update(msg: string): void {
		this.current_msg = msg;
		this.container.innerHTML = msg;
		if (msg == "") {
			this.container.style.display = "None";
		} else {
			this.container.style.removeProperty("display");
		}
	}
}

export class Counter implements DomElement {
	container: HTMLDivElement;
	total: number;

	constructor(total: number) {
		this.container = document.createElement('div');
		this.container.classList.add("comparaison-count-container");
		this.total = total;
		this.update(0);
	}

	update(n: number): void {
		this.container.innerHTML = `Nombre de comparaison : ${n}`;
	}
}

export class Header implements DomElement {
	container: HTMLDivElement;

	title: string;
	help_content: string;
	help_modal_content: HTMLElement = document.getElementById("help-modal-content")!;
	help_modal_title: HTMLElement = document.getElementById("help-modal-title")!;

	constructor(title: string, help: string) {
		this.title = title;
		this.help_content = help;

		this.container = document.createElement('div');
		this.container.classList.add('section-header');

		const title_element = document.createElement('h2');
		title_element.classList.add('section-title');
		title_element.innerHTML = title;
		this.container.appendChild(title_element);

		const help_button = document.createElement('button');
		help_button.setAttribute("type", "button");
		help_button.setAttribute("data-bs-toggle", "modal");
		help_button.setAttribute("data-bs-target", "#helpModal");
		help_button.innerHTML = '<i class="fa-regular fa-circle-question"></i>';
		help_button.classList.add('btn');
		help_button.classList.add('section-help');
		help_button.addEventListener('click', () => this.show_help());
		this.container.appendChild(help_button);
	}

	show_help(): void {
		this.help_modal_title.innerHTML = this.title;
		this.help_modal_content.innerHTML = this.help_content;
		console.log(this.help_content);
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
		// if (this.bind.is_done()) {
		// 	this.next.setAttribute('disabled', 'true');
		// 	this.skip.setAttribute('disabled', 'true');
		// } else {
		// 	this.next.removeAttribute('disabled');
		// 	this.skip.removeAttribute('disabled');
		// }
		//
		// if (!this.bind.is_started()) {
		// 	this.prev.setAttribute('disabled', 'true');
		// 	this.reset.setAttribute('disabled', 'true');
		// } else {
		// 	this.prev.removeAttribute('disabled');
		// 	this.reset.removeAttribute('disabled');
		// }
	}
}


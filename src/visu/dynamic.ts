// @ts-ignore
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

import { Graphic, Vector } from "../graphics.js";
import { Update } from "../types.js";

export interface Dynamic {
    next(): boolean;
    prev(): boolean;
    skip(): void;
    reset(): void;
    is_done(): boolean;
    is_started(): boolean;
}

export class DynamicSection extends Graphic implements Dynamic {
    container: HTMLDivElement;
    current_step: number = -1;
    current_msg: string = "";
    steps: Update[] = [];

    constructor(pos: Vector, size: Vector, anim_speed: number){
        const container = document.createElement('div');
        container.classList.add('dyn-section-container');
        const svg = d3.select(container)
            .append('svg')
            .attr('width', size.x)
            .attr('height', size.y)
            .append('g');
        super(svg, pos, anim_speed);
        this.container = container;
    }

    next(): boolean {
        if (this.current_step >= this.steps.length){
            return false;
        }
        
        if (this.current_step == this.steps.length - 1){
            this.skip();
            return false;
        }

        for (let c of this.steps[this.current_step + 1].front){
            this[c.object as keyof DynamicSection][c.method](...c.args);
        }
        this.current_msg = this.steps[this.current_step + 1].message;

        this.current_step++;
        return true;
    }

    prev(): boolean {
        if (this.current_step == -1){
            return false;
        }

        if (this.current_step == 0){
            this.reset();
            return false;
        }
        
        if (this.current_step < this.steps.length){
            for (let c of this.steps[this.current_step].back){
                this[c.object as keyof DynamicSection][c.method](...c.args);
            }
        }
        for (let c of this.steps[this.current_step - 1].front){
            this[c.object as keyof DynamicSection][c.method](...c.args);
        }
        this.current_msg = this.steps[this.current_step - 1].message;

        this.current_step--;
        return true;
    }

    skip(): void {
        this.current_msg = "";
        this.current_step = this.steps.length;
    }

    reset(): void {
        this.current_msg = "";
        this.current_step = -1;
    }

    is_done(): boolean {
        return this.current_step >= this.steps.length;
    }

    is_started(): boolean {
        return this.current_step > -1;
    }

    get_current_message(): string {
        return this.current_msg;
    }
}


export class DynamicMenu {
    bind: DynamicSection;
    message_callback: Function;

    next: HTMLButtonElement;
    prev: HTMLButtonElement;
    reset: HTMLButtonElement;
    skip: HTMLButtonElement;
    container: HTMLDivElement;

    constructor(parent: HTMLElement, to_bind: DynamicSection, callback: Function){
        this.bind = to_bind;
        this.message_callback = callback;

        this.container = document.createElement('div');
        this.container.classList.add("dynamic-menu");
        parent.appendChild(this.container);

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
    }

    step(to_do:string): void{
        this.bind[to_do as keyof Dynamic]();
        this.update();
    }

    update(): void{
        if (this.bind.is_done()){
            this.next.setAttribute('disabled', 'true');
            this.skip.setAttribute('disabled', 'true');
        } else {    
            this.next.removeAttribute('disabled');
            this.skip.removeAttribute('disabled');
        }

        if (!this.bind.is_started()){
            this.prev.setAttribute('disabled', 'true');
            this.reset.setAttribute('disabled', 'true');
        } else {
            this.prev.removeAttribute('disabled');
            this.reset.removeAttribute('disabled');
        }
        this.message_callback(this.bind.get_current_message());
    }
}
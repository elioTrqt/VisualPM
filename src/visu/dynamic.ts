// @ts-ignore
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

import { DomElement, Updatable, Update, methodCall } from "../types.js";
import { Message } from "./alg.js"
import { Graphic, GraphicDict, GraphicList, Vector, D3selec } from "../graphics.js";
import { AlgSection } from "./alg.js";

export class Dynamic {
    current_step: number = -1;
    steps: Update[] = [];

    send_front_update(update: Update): void {}
    send_back_update(update: Update): void {}

    next(): boolean {
        if (this.current_step >= this.steps.length){
            return false;
        }
        
        if (this.current_step == this.steps.length - 1){
            this.skip();
            return false;
        }

        this.send_front_update(this.steps[this.current_step]);

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
        
        this.send_back_update(this.steps[this.current_step]);

        this.current_step--;
        return true;
    }

    skip(): void {
        this.current_step = this.steps.length;
    }

    reset(): void {
        this.current_step = -1;
    }

    is_done(): boolean {
        return this.current_step >= this.steps.length;
    }

    is_started(): boolean {
        return this.current_step > -1;
    }
}

export class DynamicSection extends Dynamic{
    canvas: Updatable & DomElement;
    message: Message;

    constructor(canvas: Updatable & DomElement, message: Message){
        super();
        this.canvas = canvas;
        this.message = message;
    }

    send_front_update(update: Update): void{
        this.canvas.update(this.steps[this.current_step + 1].front);
        this.message.update(this.steps[this.current_step + 1].message);
    }
    send_back_update(update: Update): void{
        let to_send = this.current_step < this.steps.length ? this.steps[this.current_step].back : [];
        to_send = to_send.concat(this.steps[this.current_step - 1].front);
        this.canvas.update(to_send);
        this.message.update(this.steps[this.current_step - 1].message);
    }

    skip(): void {
        this.canvas.skip();
        this.message.update("");
        super.skip();
    }

    reset(): void {
        this.canvas.reset();
        this.message.update("");
        super.reset();
    }
}

export class DynamicMenu implements DomElement {
    container: HTMLDivElement;

    bind: Dynamic;

    next: HTMLButtonElement;
    prev: HTMLButtonElement;
    reset: HTMLButtonElement;
    skip: HTMLButtonElement;

    constructor(to_bind: Dynamic){
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

    step(to_do:string): void{
        switch(to_do){
            case "prev": this.bind.prev(); break;
            case "next": this.bind.next(); break;
            case "skip": this.bind.skip(); break;
            case "reset": this.bind.reset(); break;
        }
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
    }
}

export abstract class DynamicCanvas extends Graphic implements Updatable, DomElement {
    container: HTMLElement;

    constructor(pos: Vector, size: Vector, anim_speed: number){
        const container = document.createElement('svg');
        container.classList.add('dyn-graphic-container');

        const svg = d3.select(container)
            .append('svg')
            .attr('width', size.x)
            .attr('height', size.y)
            .append('g');

        super(svg, pos, 0);
        this.container = container;
    }

    append_text(text: string, x: number, y: number, baseline: string, anchor: string): void {
        this.group.append('text')
            .attr('x', x)
            .attr('y', y)
            .attr("font-size", "20px")
            .attr('text-anchor', anchor)
            .attr('dominant-baseline', baseline)
            .text(text);
    }

    update(todo: methodCall[]): void {
        for (let t of todo) 
            this[t.object as keyof DynamicCanvas][t.method](...t.args);
    }

    abstract skip(): void;
    abstract reset(): void;
}
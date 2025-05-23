// @ts-ignore
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { Graphic } from "../graphics.js";
export class Dynamic {
    current_step = -1;
    steps = [];
    send_front_update(update) { }
    send_back_update(update) { }
    next() {
        if (this.current_step >= this.steps.length) {
            return false;
        }
        if (this.current_step == this.steps.length - 1) {
            this.skip();
            return false;
        }
        this.send_front_update(this.steps[this.current_step]);
        this.current_step++;
        return true;
    }
    prev() {
        if (this.current_step == -1) {
            return false;
        }
        if (this.current_step == 0) {
            this.reset();
            return false;
        }
        this.send_back_update(this.steps[this.current_step]);
        this.current_step--;
        return true;
    }
    skip() {
        this.current_step = this.steps.length;
    }
    reset() {
        this.current_step = -1;
    }
    is_done() {
        return this.current_step >= this.steps.length;
    }
    is_started() {
        return this.current_step > -1;
    }
}
export class DynamicSection extends Dynamic {
    canvas;
    message;
    constructor(canvas, message) {
        super();
        this.canvas = canvas;
        this.message = message;
    }
    send_front_update(update) {
        this.canvas.update(this.steps[this.current_step + 1].front);
        this.message.update(this.steps[this.current_step + 1].message);
    }
    send_back_update(update) {
        let to_send = this.current_step < this.steps.length ? this.steps[this.current_step].back : [];
        to_send = to_send.concat(this.steps[this.current_step - 1].front);
        this.canvas.update(to_send);
        this.message.update(this.steps[this.current_step - 1].message);
    }
    skip() {
        this.canvas.skip();
        this.message.update("");
        super.skip();
    }
    reset() {
        this.canvas.reset();
        this.message.update("");
        super.reset();
    }
}
export class DynamicMenu {
    container;
    bind;
    next;
    prev;
    reset;
    skip;
    constructor(to_bind) {
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
    step(to_do) {
        switch (to_do) {
            case "prev":
                this.bind.prev();
                break;
            case "next":
                this.bind.next();
                break;
            case "skip":
                this.bind.skip();
                break;
            case "reset":
                this.bind.reset();
                break;
        }
        this.update();
    }
    update() {
        if (this.bind.is_done()) {
            this.next.setAttribute('disabled', 'true');
            this.skip.setAttribute('disabled', 'true');
        }
        else {
            this.next.removeAttribute('disabled');
            this.skip.removeAttribute('disabled');
        }
        if (!this.bind.is_started()) {
            this.prev.setAttribute('disabled', 'true');
            this.reset.setAttribute('disabled', 'true');
        }
        else {
            this.prev.removeAttribute('disabled');
            this.reset.removeAttribute('disabled');
        }
    }
}
export class DynamicCanvas extends Graphic {
    container;
    constructor(pos, size, anim_speed) {
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
    append_text(text, x, y, baseline, anchor) {
        this.group.append('text')
            .attr('x', x)
            .attr('y', y)
            .attr("font-size", "20px")
            .attr('text-anchor', anchor)
            .attr('dominant-baseline', baseline)
            .text(text);
    }
    update(todo) {
        for (let t of todo)
            this[t.object][t.method](...t.args);
    }
}

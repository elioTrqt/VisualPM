import { Message, Header, DynamicMenu } from "./components.js";
export class AlgSection {
    container;
    header;
    menu;
    data;
    message;
    current_step = 0;
    steps = [];
    constructor(title, help, data, steps) {
        this.container = document.createElement('div');
        this.container.classList.add("alg-section");
        this.header = new Header(title, help);
        this.menu = new DynamicMenu(this);
        this.data = data;
        this.message = new Message();
        this.steps = steps;
        console.log("steps: ");
        console.log(this.steps);
        for (let c of [this.header, this.menu, this.data, this.message])
            this.container.appendChild(c.container);
    }
    update(step) {
        if (!this.is_done())
            this.skip();
        this.data.update(step.data);
        this.message.update(step.message);
    }
    reverse_update(state) {
        if (!this.is_done())
            this.skip();
        this.data.reverse_update(state.data);
        this.message.update("");
    }
    next() {
        if (this.current_step >= this.steps.length) {
            return false;
        }
        this.data.update(this.steps[this.current_step].data);
        this.message.update(this.steps[this.current_step].message);
        this.current_step++;
        return this.current_step < this.steps.length;
    }
    prev() {
        if (this.current_step <= 0) {
            return false;
        }
        this.current_step--;
        if (this.current_step > 0) {
            this.data.reverse_update(this.steps[this.current_step].data, this.steps[this.current_step - 1].data);
            this.message.update(this.steps[this.current_step - 1].message);
        }
        else {
            this.data.reverse_update(this.steps[this.current_step].data);
            this.message.update("");
        }
        return this.current_step > 0;
    }
    skip() {
        this.data.skip();
        this.message.update("");
        this.current_step = this.steps.length;
    }
    reset() {
        this.data.reset();
        this.message.update("");
        this.current_step = 0;
    }
    is_done() {
        return this.current_step >= this.steps.length;
    }
    is_started() {
        return this.current_step > 0;
    }
}

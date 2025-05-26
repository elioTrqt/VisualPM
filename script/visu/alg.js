import { Dynamic, DynamicMenu, DynamicSection } from "./dynamic.js";
import { append_to } from "../types.js";
export class Message {
    container;
    current_msg = "";
    constructor() {
        this.container = document.createElement('div');
        this.container.classList.add('alert');
        this.container.classList.add('alert-success');
        this.container.classList.add('step-help');
        this.container.setAttribute('role', 'alert');
        this.update(this.current_msg);
    }
    update(msg) {
        this.current_msg = msg;
        this.container.innerHTML = msg;
        if (msg == "") {
            this.container.style.display = "None";
        }
        else {
            this.container.style.removeProperty("display");
        }
    }
}
class Counter {
    container;
    total;
    constructor(total) {
        this.container = document.createElement('div');
        this.container.classList.add("comparaison-count-container");
        this.total = total;
        this.update(0);
    }
    update(n) {
        this.container.innerHTML = `Nombre de comparaison : ${n}`;
    }
}
export class Header {
    container;
    title;
    help_content;
    help_modal_content = document.getElementById("help-modal-content");
    help_modal_title = document.getElementById("help-modal-title");
    constructor(title, help) {
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
    show_help() {
        this.help_modal_title.innerHTML = this.title;
        this.help_modal_content.innerHTML = this.help_content;
        console.log(this.help_content);
    }
}
export class AlgSection {
    container;
    header;
    menu;
    dynamic;
    content;
    message;
    constructor(content, title, help, steps = []) {
        this.container = document.createElement('div');
        this.container.classList.add("alg-section");
        this.header = new Header(title, help);
        this.content = content;
        this.message = new Message();
        this.dynamic = new DynamicSection(this.content, this.message);
        this.dynamic.steps = steps;
        this.menu = new DynamicMenu(this.dynamic);
        for (let c of [this.header, this.menu, this.content, this.message])
            append_to(this, c);
    }
}
export class Alg extends Dynamic {
    container;
    steps = [];
    sections = [];
    constructor() {
        super();
        this.container = document.createElement('div');
        this.container.classList.add('alg-container');
    }
    send_front_update() {
        for (let sec of this.sections) {
            const section = this[sec];
            if (!section.dynamic.is_done()) {
                section.dynamic.skip();
            }
            section.content.update(this.steps[this.current_step + 1].get(sec).front);
            section.message.update(this.steps[this.current_step + 1].get(sec).message);
        }
    }
    send_back_update() {
        for (let sec of this.sections) {
            const section = this[sec];
            if (!section.dynamic.is_done()) {
                section.dynamic.skip();
            }
            let to_send = this.current_step < this.steps.length ? this.steps[this.current_step].get(sec).back : [];
            to_send = to_send.concat(this.steps[this.current_step - 1].get(sec).front);
            section.content.update(to_send);
            section.message.update(this.steps[this.current_step - 1].get(sec).message);
        }
    }
    skip() {
        for (let sec of this.sections) {
            const section = this[sec];
            section.dynamic.skip();
        }
    }
    reset() {
        for (let sec of this.sections) {
            const section = this[sec];
            section.dynamic.reset();
        }
    }
}
export class PMAlg extends Alg {
    title;
    help;
    text;
    pattern;
    occurences = new Map(); // occurences found at a given step
    counts = [];
    counter;
    constructor(text, pattern, title, help) {
        super();
        this.container.classList.add("pm-alg-container");
        this.sections.push("counter");
        this.text = text;
        this.pattern = pattern;
        this.title = title;
        this.help = help;
        this.counter = new Counter(0);
    }
    send_front_update() {
        super.send_front_update();
        this.counter.update(this.counts[this.current_step]);
        // TODO 
        if (this.occurences.has(this.current_step)) {
            console.log(`found new ${this.occurences.get(this.current_step)}`);
        }
    }
    send_back_update() {
        super.send_back_update();
        this.counter.update(this.counts[this.current_step]);
        // TODO 
        if (this.occurences.has(this.current_step)) {
            console.log(`found new ${this.occurences.get(this.current_step)}`);
        }
    }
}

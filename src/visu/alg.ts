import { Dynamic, DynamicMenu, DynamicSection, IDynamic } from "./dynamic.js";
import { methodCall, DomElement, Updatable, append_to, Update } from "../types.js";
import { SWSection } from "./sliding_window.js";

export class Message implements DomElement {
    container: HTMLDivElement;
    current_msg: string =  "";

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
        if (msg == ""){
            this.container.style.display = "None";
        } else {
            this.container.style.removeProperty("display");
        }
    }
}

class Counter implements DomElement {
    container: HTMLDivElement;
    total: number;

    constructor(total: number){
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

    constructor(title: string, help: string){
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

export class AlgSection implements DomElement {
    container: HTMLDivElement;

    header: Header;
    menu: DynamicMenu;
    dynamic: DynamicSection;
    content: Updatable & DomElement;
    message: Message;

    constructor(content: Updatable & DomElement, title: string, help: string, steps: Update[] = []){
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

export class Alg extends Dynamic implements DomElement {
    container: HTMLDivElement;
    steps: Array<Map<string, Update>> = [];
    sections: string[] = [];

    constructor(){
        super();
        this.container = document.createElement('div');
        this.container.classList.add('alg-container');
    }

    send_front_update(): void {
        for (let sec of this.sections){
            const section = this[sec as keyof Alg] as unknown as AlgSection;
            if (!section.dynamic.is_done()){
                section.dynamic.skip();
            }
            section.content.update(this.steps[this.current_step + 1].get(sec)!.front);
            section.message.update(this.steps[this.current_step + 1].get(sec)!.message);
        }
    }

    send_back_update(): void {
        for (let sec of this.sections){
            const section = this[sec as keyof Alg] as unknown as AlgSection;
            if (!section.dynamic.is_done()){
                section.dynamic.skip();
            }
            let to_send = this.current_step < this.steps.length ? this.steps[this.current_step].get(sec)!.back : [];
            to_send = to_send.concat(this.steps[this.current_step - 1].get(sec)!.front);
            section.content.update(to_send);
            section.message.update(this.steps[this.current_step - 1].get(sec)!.message);
        }   
    }

    skip(): void {
        for (let sec of this.sections){
            const section = this[sec as keyof Alg] as unknown as AlgSection;
            section.dynamic.skip()
        }
    }

    reset(): void {
        for (let sec of this.sections){
            const section = this[sec as keyof Alg] as unknown as AlgSection;
            section.dynamic.reset()
        }
    }
}


export class PMAlg extends Alg {
    title: string;
    help: string;
    text: string;
    pattern: string;

    occurences: Map<number, number[]> = new Map(); // occurences found at a given step
    counts: number[] = [];
    counter: Counter;

    constructor(text: string, pattern: string, title: string, help: string){
        super();
        this.container.classList.add("pm-alg-container");
        this.sections.push("counter");

        this.text = text; this.pattern = pattern;
        this.title = title; this.help = help;
        this.counter = new Counter(0);
    }

    send_front_update(): void {
        super.send_front_update();
        this.counter.update(this.counts[this.current_step]);
        // TODO 
        if (this.occurences.has(this.current_step)){
            console.log(`found new ${this.occurences.get(this.current_step)}`);
        }
    }

    send_back_update(): void {
        super.send_back_update();
        this.counter.update(this.counts[this.current_step]);
        // TODO 
        if (this.occurences.has(this.current_step)){
            console.log(`found new ${this.occurences.get(this.current_step)}`);
        }
    }
}
import { DynamicMenu, DynamicSection } from "./dynamic.js";
import { methodCall, AlgUpdate, DomElement, Updatable, append_to, Update } from "../types.js";

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


class MainAlg {
}
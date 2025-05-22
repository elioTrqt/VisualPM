import { DynamicMenu } from "./dynamic.js";
export class AlgSection {
    container;
    title;
    help;
    dynamic_obj;
    menu;
    message;
    constructor(parent, dyn, title, help) {
        this.title = title;
        this.help = help;
        this.dynamic_obj = dyn;
        this.container = document.createElement('div');
        this.container.classList.add("alg-section");
        parent.appendChild(this.container);
        const title_div = document.createElement('div');
        title_div.classList.add('section-title-container');
        this.container.appendChild(title_div);
        const title_element = document.createElement('h2');
        title_element.classList.add('section-title');
        title_element.innerHTML = this.title;
        title_div.appendChild(title_element);
        const help_button = document.createElement('button');
        help_button.innerHTML = '<i class="fa-regular fa-circle-question"></i>';
        help_button.classList.add('btn');
        help_button.classList.add('section-help');
        help_button.addEventListener('click', () => this.show_help());
        title_div.appendChild(help_button);
        this.menu = new DynamicMenu(this.container, this.dynamic_obj, this.update_msg.bind(this));
        this.container.appendChild(dyn.container);
        this.message = document.createElement('div');
        this.message.classList.add('alert');
        this.message.classList.add('alert-success');
        this.message.classList.add('step-help');
        this.message.setAttribute('role', 'alert');
        this.container.appendChild(this.message);
        this.menu.update();
    }
    update_msg(msg) {
        this.message.innerHTML = msg;
        if (msg == "") {
            this.message.style.display = "None";
        }
        else {
            this.message.style.removeProperty("display");
        }
    }
    show_help() {
        // TODO
        console.log(this.help);
    }
}

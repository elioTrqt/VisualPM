import { GraphicList, Arrow, Vector } from "../graphics.js";
import { append_to } from "../types.js";
import { AlgSection } from "./alg.js";
import { DynamicCanvas } from "./dynamic.js";
export class SlidingWindow extends DynamicCanvas {
    text;
    pattern;
    arrow;
    constructor(text, pattern, w, anim_speed) {
        super(new Vector(0, 0), SlidingWindow.get_size(text, pattern, w), anim_speed);
        this.container.id = "sw-graphic";
        const offset_pos = new Vector(w, w);
        this.text = new GraphicList(this.group, offset_pos, anim_speed, w, text.split(""));
        this.pattern = new GraphicList(this.group, offset_pos.add(new Vector(0, 2 * w)), anim_speed, w, pattern.split(""));
        this.arrow = new Arrow(this.group, new Vector(0, 0), new Vector(0, 0), this.speed, "black");
        this.arrow.display(false);
    }
    ;
    skip() {
        // TODO
        console.log("skip sliding window not implemented");
    }
    reset() {
        this.text.fill_color("white");
        this.pattern.fill_color("white");
        this.arrow.display(false);
        this.pattern.reset_pos();
    }
    set_speed(s) {
        this.speed = s;
        this.text.set_speed(s);
        this.pattern.set_speed(s);
        this.arrow?.set_speed(s);
    }
    static get_size(text, pattern, w) {
        return new Vector((text.length + pattern.length + 2) * w, 4 * w);
    }
}
;
export class SWSection extends AlgSection {
    constructor(alg, text, pattern, anim_speed) {
        const sw = new SlidingWindow(text, pattern, 50, anim_speed);
        super(sw, alg.title, alg.help);
        this.menu.bind = alg;
        append_to(this.header, alg.counter);
    }
}

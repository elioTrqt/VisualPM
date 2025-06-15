"use strict";
// import { D3selec, Graphic, GraphicList, Arrow, Vector} from "../graphics.js";
// import { Updatable, DomElement, methodCall, append_to } from "../types.js";
// import { AlgSection, PMAlg } from "./alg.js";
// import { DynamicCanvas, Dynamic } from "./dynamic.js";
//
//
// export class SlidingWindow extends DynamicCanvas {
//     text: GraphicList;
//     pattern: GraphicList;
//     arrow: Arrow;
//
//     constructor(text: string, pattern: string, w: number, anim_speed: number){
//         super(new Vector(0, 0), SlidingWindow.get_size(text, pattern, w), anim_speed);
//         this.container.id = "sw-graphic";
//
//         const offset_pos = new Vector(w, w);
//         this.text = new GraphicList(this.group, offset_pos, anim_speed, w, text.split(""));
//         this.pattern = new GraphicList(this.group, offset_pos.add(new Vector(0, 2*w)), anim_speed, w, pattern.split(""));
//         this.arrow = new Arrow(this.group, new Vector(0, 0), new Vector(0, 0), this.speed, "black");
//         this.arrow.display(false);
//     };
//
//     skip(): void {
//         // TODO
//         console.log("skip sliding window not implemented");
//     }
//
//     reset(): void {
//         this.text.fill_color("white");
//         this.pattern.fill_color("white");
//         this.arrow.display(false);
//         this.pattern.reset_pos();
//     }
//
//     set_speed(s: number): void{
//         this.speed = s;
//         this.text.set_speed(s);
//         this.pattern.set_speed(s);
//         this.arrow?.set_speed(s);
//     }
//
//     static get_size(text: string, pattern: string, w: number): Vector {
//         return new Vector((text.length + pattern.length + 2)*w, 4*w);
//     }
// };
//
// export class SWSection extends AlgSection {
//     constructor(alg: PMAlg, text:string, pattern: string, anim_speed: number){
//         const sw = new SlidingWindow(text, pattern, 50, anim_speed);
//         super(sw, alg.title, alg.help);
//         this.menu.bind = alg;
//         append_to(this.header, alg.counter);
//     }
// }

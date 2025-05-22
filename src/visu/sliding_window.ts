import { D3selec, Graphic, GraphicList, Arrow, Vector} from "../graphics.js";
import { SlidingStep } from "../types.js";


export class SlidingWindow extends Graphic {
    text: GraphicList;
    pattern: GraphicList;
    arrow?: Arrow;
    current_step: SlidingStep;

    constructor(parent: D3selec<SVGGraphicsElement>, pos: Vector, anim_speed: number, w: number, text: string, pattern: string){
        super(parent, pos, anim_speed);
        this.text = new GraphicList(this.group, pos, anim_speed, w, text.split(""));
        this.pattern = new GraphicList(this.group, pos.add(new Vector(0, 2*w)), anim_speed, w, pattern.split(""));

        this.current_step = {
            text: {
                color: Array(text.length).fill("white"),
                position: 0,
                anim: false,
            },
            pattern: {
                color: Array(pattern.length).fill("white"),
                position: 0,
                anim: false,
            },
        };

        this.update(this.current_step);
    };

    update(step: SlidingStep): void {
        if (step.text){
            this.text.set_colors(step.text!.color);
            this.text.set_shift(step.text!.position, step.text!.anim ? this.text.speed : 0);
        }
        if (step.pattern){
            this.pattern.set_colors(step.pattern!.color);
            this.pattern.set_shift(step.pattern!.position, step.pattern!.anim ? this.pattern.speed : 0);
        }
        if (step.arrow){
            if (this.arrow){ 
                // Move the arrow
                this.arrow!.set_start(this.pattern.get_cell_pos(step.arrow!.position.start, 0, -1), step.arrow!.anim ? this.arrow.speed : 0);
                this.arrow!.set_end(this.text.get_cell_pos(step.arrow!.position.end, 0, 1), step.arrow!.anim ? this.arrow.speed : 0);
            } else { 
                // Create the arrow
                this.arrow = new Arrow(
                    this.group, 
                    this.pattern.get_cell_pos(step.arrow!.position.start, 0, -1), 
                    this.text.get_cell_pos(step.arrow!.position.end, 0, 1), 
                    this.speed, 
                    step.arrow!.color);
            }
        } else { 
            // Hide the arrow
            this.arrow?.remove();
        }
    }

    set_speed(s: number): void{
        this.speed = s;
        this.text.set_speed(s);
        this.pattern.set_speed(s);
        this.arrow?.set_speed(s);
    }
};
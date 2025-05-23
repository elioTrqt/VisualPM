export {};
/*
export class SlidingWindow extends DynamicSection {
    text: GraphicList;
    pattern: GraphicList;
    arrow: Arrow;

    constructor(text: string, pattern: string, w: number, anim_speed: number){
        super(new Vector(0, 0), SlidingWindow.get_size(text, pattern, w), anim_speed);

        const pos = new Vector(w, w);
        this.text = new GraphicList(this.group, pos, anim_speed, w, text.split(""));
        this.pattern = new GraphicList(this.group, pos.add(new Vector(0, 2*w)), anim_speed, w, pattern.split(""));
        this.arrow = new Arrow(this.group, new Vector(0, 0), new Vector(0, 0), this.speed, "black");
        this.arrow.display(false);
    };

    set_speed(s: number): void{
        this.speed = s;
        this.text.set_speed(s);
        this.pattern.set_speed(s);
        this.arrow?.set_speed(s);
    }

    static get_size(text: string, pattern: string, w: number): Vector {
        return new Vector((text.length + pattern.length + 2)*w, 4*w);
    }
};
*/ 

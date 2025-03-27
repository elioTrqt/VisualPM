type D3selec<T extends SVGGraphicsElement> = d3.Selection<T, unknown, null | HTMLElement, undefined>;

class Vector {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(other: Vector): Vector {
        return new Vector(this.x + other.x, this.y + other.y);
    }
    sub(other: Vector): Vector {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    len(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.x, 2));
    }
};


class Graphic {
    readonly pos: Vector;   // initial postion
    trans: Vector;          // translation
    readonly group: D3selec<SVGGElement>;     // Root

    constructor(parent: D3selec<SVGGraphicsElement>, pos: Vector){
        this.pos = pos;
        this.trans = new Vector(0, 0);
        this.group = parent.append("g");
    }

    get_pos(): Vector {
        return this.pos.add(this.trans);
    }

    set_pos(dest: Vector): void {
        let t : Vector = dest.sub(this.get_pos());
        this.translate(t);
    }

    reset_pos(): void {
        this.set_pos(this.pos);
    }

    translate(t: Vector, speed: number = 0): void {
        this.trans = this.trans.add(t);
        this.group.transition()
            .duration(speed * t.len())
            .attr("transform", `translate(${this.trans.x}, ${this.trans.y})`);
    }

    clear(): void {
        this.group.selectAll("*").remove();
    }

    remove(): void {
        this.group.remove();
    }
}


class GraphicList extends Graphic {
    values: Array<string | number | null>;
    cell_width: number;
    anim_speed = 1;

    constructor(parent: D3selec<SVGGraphicsElement>, pos: Vector, w: number, vals: Array<string | number> | number = 0){
        super(parent, pos);
        this.cell_width = w;
        if (typeof vals !== "number"){
            this.values = vals;
        } else {
            this.values = new Array(vals).fill(null);
        }

        this.draw();
    };

    draw() : void {
        this.clear();
        let cur_x = this.pos.x;
        for (let i=0; i < this.values.length; i++){
            this.group.append('rect')
                .attr('x', cur_x)
                .attr('y', this.pos.y)
                .attr('width', this.cell_width) 
                .attr('height', this.cell_width)
                .attr('fill', 'white')
                .attr('stroke', 'black')
                .attr('id', `cell_${i}`);

            this.group.append("text")
                .attr("x", cur_x + 24)
                .attr("y", this.pos.y + 27.5)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle") 
                .attr("fill", "black") 
                .attr("font-size", "25px")
                .text(this.values[i]===null?'':`${this.values[i]}`)
                .attr('id', `text_${i}`);
            
            cur_x += this.cell_width;
        }
    }

    get(i: number, off: number = 1) : string | number | null{
        return this.values[i-off];
    }

    set(i: number, val: string | number | null, off: number = 1) : void {
        if (i - off  < this.values.length){
            this.values[i-off] = val;
            this.group.select(`#text_${i-off}`).text(val===null?'':`${val}`);
        }
    }

    set_values(val: Array<string | number | null>): void {
        this.values = val;
        this.draw();
    }

    fill(val: string | number | null): void {
        for (let i = 0; i < this.values.length; i++){
            this.set(i, val, 0);
        }
    }

    set_color(i: number, val: string, off: number = 1): void {
        if (i - off < this.values.length){
            this.group.select(`#cell_${i-off}`).attr('fill', val);
        }
    }

    fill_color(val: string): void {
        for (let i = 0; i < this.values.length; i++){
            this.set_color(i, val, 0);
        }
    }

    shift(d: number): void {
        this.translate(new Vector(d*this.cell_width, 0), this.anim_speed);
    }
}


class Arrow extends Graphic{
    line: D3selec<SVGLineElement>;
    //marker: d3.Selection<SVGMarkerElement, unknown, null, undefined>;
    start: Vector;
    end: Vector;
    start_trans: Vector;
    end_trans: Vector;
  
    constructor(parent: D3selec<SVGGraphicsElement>, start: Vector, end: Vector, color: string) {
        super(parent, start);
        this.start = start;
        this.end = end;
        this.start_trans = new Vector(0, 0);
        this.end_trans = new Vector(0, 0);
        
        // Define the marker for the arrowhead
        this.group
            .append("defs")
            .append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 8)
            .attr("refY", 5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto-start-reverse")
            .append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 z")
            .attr("fill", color)
            .attr("stroke", color);
    
        // Create the line representing the arrow
        this.line = this.group
            .append("line")
            .attr("stroke", color)
            .attr("stroke-width", 2)
            .attr("x1", this.start.x)
            .attr("x2", this.end.x)
            .attr("y1", this.start.y)
            .attr("y2", this.end.y)
            .attr("marker-end", "url(#arrowhead)");
    }

    translate_start(t: Vector, speed: number = 0): void {
        this.start = this.start.add(t);
        this.update(speed * t.len());
    }

    translate_end(t: Vector, speed: number = 0): void {
        this.end = this.end.add(t);
        this.update(speed * t.len());
    }
;
    set_start(t: Vector, speed: number = 0): void {
        const duration = speed * this.start.sub(t).len();
        this.start = t;
        this.update(duration);
    }

    set_end(t: Vector, speed: number = 0): void {
        const duration = speed * this.end.sub(t).len();
        this.end = t;
        this.update(duration);
    } 

    update(duration: number): void {
        this.line.transition()
            .duration(duration)
            .attr("x1", this.start.x) 
            .attr("y1", this.start.y)
            .attr("x2", this.end.x) 
            .attr("y2", this.end.y);
    }
}

interface Dynamic {
    done: boolean;

    next(): void;
    skip(): void;
    reset(): void;
}


class DynamicSection {
    container: HTMLElement;
    menu: HTMLDivElement;
    content: Dynamic;

    constructor(container: HTMLElement, content: Dynamic, title: string){
        this.content = content;
        this.container = container;

        this.menu = document.createElement('div');
        this.menu.style.padding = '10px';
        this.menu.classList.add('row-cols-auto');
        this.menu.style.paddingLeft = `125px`;
        this.menu.style.paddingBottom = '20px';
        this.container.insertBefore(this.menu, this.container.firstChild);

        if (title != ""){
            const head = document.createElement('h3');
            head.innerHTML = title;
            head.style.paddingLeft = `125px`;
            head.style.paddingBottom = '10px';
            this.container.insertBefore(head, this.container.firstChild);
        }
        
        this.build_menu();
    }

    build_menu(): void {
        const next_button = document.createElement('button');
        next_button.innerHTML = 'Next';
        next_button.classList.add('btn');
        next_button.classList.add('btn-outline-primary');
        next_button.classList.add('dyn-menu-btn');
        next_button.type = 'button';
        next_button.addEventListener('click', this.content.next.bind(this.content));
        this.menu.appendChild(next_button);

        const skip_button = document.createElement('button');
        skip_button.innerHTML = 'Skip';
        skip_button.classList.add('btn');
        skip_button.classList.add('btn-outline-primary');
        skip_button.classList.add('dyn-menu-btn');
        skip_button.type = 'button';
        skip_button.addEventListener('click', this.content.skip.bind(this.content));
        this.menu.appendChild(skip_button);

        const reset_button = document.createElement('button');
        reset_button.innerHTML = 'Reset';
        reset_button.classList.add('btn');
        reset_button.classList.add('btn-outline-primary');
        reset_button.classList.add('dyn-menu-btn');
        reset_button.type = 'button';
        reset_button.addEventListener('click', this.content.reset.bind(this.content));
        this.menu.appendChild(reset_button);
    }
}


class BordList extends GraphicList implements Dynamic {
    step: number;
    done: boolean;
    data: Array<number>;
    pattern: GraphicList;
    index: GraphicList;
    
    constructor(parent: D3selec<SVGGraphicsElement>, pos: Vector, w: number, pattern: GraphicList, index: GraphicList) {
        super(parent, pos, w, new Array(pattern.values.length).fill(null));
        this.step = 0;
        this.done = false;
        this.pattern = pattern;
        this.index = index;
        this.data = new Array(pattern.values.length + 1);
        this.data[0] = -1;
        const m = pattern.values.length;
        for (let i=1; i <= m; i++){
            let j = this.data[i-1];
            while (j>=0 && pattern.get(i) != pattern.get(j+1)){
                j = this.data[j];
            }
            this.data[i] = j + 1;
        }
    }

    next(): void {
        this.pattern.fill_color('white');
        this.index.fill_color('white');
        if (!this.done){
            this.step++;
            this.done = this.step > (this.data.length - 1);
            if (!this.done) {
                this.set(this.step, this.data[this.step]);
                for (let i = 1; i <= this.data[this.step]; i++){
                    this.pattern.set_color(i, 'green');
                }
                this.index.set_color(this.step, 'grey');
            }
        }
    }

    skip(): void {
        while(!this.done){
            this.next();
        }
    }

    reset(): void {
        this.pattern.fill_color('white');
        this.index.fill_color('white');
        this.fill(null);
        this.step = 0;
        this.done = false;
    }
}

class MPList extends GraphicList implements Dynamic {
    step: number;
    done: boolean;
    data: Array<number>;
    pattern: GraphicList;
    index: GraphicList;
    knuth: boolean;
    
    constructor(parent: D3selec<SVGGraphicsElement>, pos: Vector, w: number, pattern: GraphicList, index: GraphicList, knuth: boolean = false) {
        super(parent, pos, w, new Array(pattern.values.length + 1).fill(null));
        this.step = 0;
        this.done = false;
        this.pattern = pattern;
        this.index = index;
        this.knuth = knuth;
        this.data = new Array(pattern.values.length + 2);

        const m = pattern.values.length;
        let j = 0;
        this.data[1] = 0;
        for (let i=1; i <= m; i++){
            while (j>0 && pattern.get(i) != pattern.get(j)){
                j = this.data[j];
            }
            j++;
            if (!this.knuth || i == m || pattern.get(i+1) != pattern.get(j)){
                this.data[i + 1] = j;
            }
            else {
                this.data[i + 1] = this.data[j];
            }
        }
    }

    next(): void {
        this.pattern.fill_color('white');
        this.index.fill_color('white');
        if (!this.done){
            this.step++;
            this.done = this.step > (this.data.length - 1);
            if (!this.done) {
                this.set(this.step, this.data[this.step]);
                this.pattern.set_color(this.data[this.step], 'green');
                this.index.set_color(this.step, 'grey');
            }
        }
    }

    skip(): void {
        while(!this.done){
            this.next();
        }
    }

    reset(): void {
        this.pattern.fill_color('white');
        this.index.fill_color('white');
        this.fill(null);
        this.step = 0;
        this.done = false;
    }
}

class MPTable extends Graphic {
    pattern: GraphicList;
    index: GraphicList;
    bord: BordList;
    mp: MPList;
    done: boolean;

    constructor(parent: D3selec<SVGGraphicsElement>, pos: Vector, w: number, pattern: string, knuth: boolean = false){
        super(parent, pos);
        const offset_pos = pos.add(new Vector(100, 0));
        this.index = new GraphicList(this.group, offset_pos, w, Array.from({ length: pattern.length + 1}, (_, index) => index + 1));
        this.pattern = new GraphicList(this.group, offset_pos.add(new Vector(0, w)), w, pattern.split(""));
        this.bord = new BordList(this.group, offset_pos.add(new Vector(0, 2*w)), w, this.pattern, this.index);
        this.mp = new MPList(this.group, offset_pos.add(new Vector(0, 3*w)), w, this.pattern, this.index, knuth);
        this.done = false;


        this.group.append('text')
            .attr('x', offset_pos.x - 10)
            .attr('y', offset_pos.y + 0.5*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text('i');

        this.group.append('text')
            .attr('x', offset_pos.x - 10)
            .attr('y', offset_pos.y + 1.5*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text('P[ i ]');

        this.group.append('text')
            .attr('x', offset_pos.x - 10)
            .attr('y', offset_pos.y + 2.5*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text('Bord[ i ]');


        this.group.append('text')
            .attr('x', offset_pos.x - 10)
            .attr('y', offset_pos.y + 3.5*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text(`${knuth ? 'K': ''}MP_next[ i ]`);
    }

    next(): void {
        if (!this.bord.done){
            this.bord.next();
        }
        else if (!this.mp.done){
            this.mp.next();
        }
    }

    next_list(): void {
        if (!this.bord.done){
            this.bord.skip();
        }
        else if (!this.mp.done){
            this.mp.skip();
        }
    }

    skip(): void {
        this.bord.skip();
        this.mp.skip();
    }

    reset(): void {
        this.bord.reset();
        this.mp.reset();
    }
}


class SuffList extends GraphicList implements Dynamic {
    step: number;
    done: boolean;
    data: Array<number>;
    pattern: GraphicList;
    index: GraphicList;
    
    constructor(parent: D3selec<SVGGraphicsElement>, pos: Vector, w: number, pattern: GraphicList, index: GraphicList) {
        super(parent, pos, w, new Array(pattern.values.length).fill(null));
        this.step = 0;
        this.done = false;
        this.pattern = pattern;
        this.index = index;
        this.data = new Array(pattern.values.length + 1);

        const m = pattern.values.length;
        this.data[m] = m;
        let g = m;
        let f = 0;
        for (let i=m-1; i >= 1; i--){
            if (i > g && this.data[i+m-f] != i - g){
                this.data[i] = Math.min(this.data[i+m-f], i - g);
            }
            else {
                f = i;
                g = Math.min(g, i);
                while (g > 0 && pattern.get(g) == pattern.get(g+m-f)){
                    g = g-1;
                }
                this.data[i] = f-g;
            }
        }
    }

    next(): void {
        this.pattern.fill_color('white');
        this.index.fill_color('white');
        if (!this.done){
            this.step++;
            this.done = this.step > (this.data.length - 1);
            if (!this.done) {
                this.set(this.step, this.data[this.step]);
                for(let i=0; i < this.data[this.step]; i++){
                    this.pattern.set_color(this.step-i, 'green');
                }
                this.index.set_color(this.step, 'grey');
            }
        }
    }

    skip(): void {
        while(!this.done){
            this.next();
        }
    }

    reset(): void {
        this.pattern.fill_color('white');
        this.index.fill_color('white');
        this.fill(null);
        this.step = 0;
        this.done = false;
    }

    get(i: number): number{
        return this.data[i];
    }
}

class DList extends GraphicList implements Dynamic {
    step: number;
    done: boolean;
    data: Array<number>;
    data_from: Array<number>;
    data_case: Array<number>;
    pattern: GraphicList;
    index: GraphicList;
    suff: SuffList;
    
    constructor(parent: D3selec<SVGGraphicsElement>, pos: Vector, w: number, pattern: GraphicList, index: GraphicList, suff: SuffList) {
        super(parent, pos, w, new Array(pattern.values.length).fill(null));
        this.step = 0;
        this.done = false;
        this.pattern = pattern;
        this.index = index;
        this.suff = suff;
        this.data = new Array(pattern.values.length + 1);
        this.data_from = new Array(pattern.values.length + 1);
        this.data_case = new Array(pattern.values.length + 1);

        const m = pattern.values.length;
        let i = 1;
        for (let j=1; j <= m; j++){
            this.data[j] = m;
        }
        for (let j = m-1; j >= 0; j--){
            if (j==0 || suff.data[j] == j){
                while(i <= m - j){
                    this.data[i] = m - j;
                    this.data_from[i] = j;
                    this.data_case[i] = 2;
                    i++;
                }
            }
        }
        for (let j=1; j <= m; j++){
            this.data[m-suff.data[j]] = m - j;
            this.data_from[m-suff.data[j]] = j;
            this.data_case[m-suff.data[j]] = 1;
        }
    }

    next(): void {
        this.suff.fill_color('white');
        this.index.fill_color('white');
        if (!this.done){
            this.step++;
            this.done = this.step > (this.data.length - 1);
            if (!this.done) {
                this.set(this.step, this.data[this.step]);
                this.suff.set_color(this.data_from[this.step], 'green');
                this.index.set_color(this.step, 'grey');
            }
        }
    }

    skip(): void {
        while(!this.done){
            this.next();
        }
    }

    reset(): void {
        this.suff.fill_color('white');
        this.index.fill_color('white');
        this.fill(null);
        this.step = 0;
        this.done = false;
    }

    get(i: number): number{
        return this.data[i];
    }
}


class DTable extends Graphic {
    pattern: GraphicList;
    index: GraphicList;
    suff: SuffList;
    d: DList;
    done: boolean;

    constructor(parent: D3selec<SVGGraphicsElement>, pos: Vector, w: number, pattern: string){
        super(parent, pos);
        const offset_pos = pos.add(new Vector(100, 0));
        this.index = new GraphicList(this.group, offset_pos, w, Array.from({ length: pattern.length}, (_, index) => index + 1));
        this.pattern = new GraphicList(this.group, offset_pos.add(new Vector(0, w)), w, pattern.split(""));
        this.suff = new SuffList(this.group, offset_pos.add(new Vector(0, 2*w)), w, this.pattern, this.index);
        this.d = new DList(this.group, offset_pos.add(new Vector(0, 3*w)), w, this.pattern, this.index, this.suff);
        this.done = false;


        this.group.append('text')
            .attr('x', offset_pos.x - 10)
            .attr('y', offset_pos.y + 0.5*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text('i');

        this.group.append('text')
            .attr('x', offset_pos.x - 10)
            .attr('y', offset_pos.y + 1.5*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text('P[ i ]');

        this.group.append('text')
            .attr('x', offset_pos.x - 10)
            .attr('y', offset_pos.y + 2.5*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text('Suff[ i ]');


        this.group.append('text')
            .attr('x', offset_pos.x - 10)
            .attr('y', offset_pos.y + 3.5*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text(`D[ i ]`);
    }

    next(): void {
        if (!this.suff.done){
            this.suff.next();
        }
        else if (!this.d.done){
            this.d.next();
            this.done = this.d.done;
        }
    }

    next_list(): void {
        if (!this.suff.done){
            this.suff.skip();
        }
        else if (!this.d.done){
            this.d.skip();
            this.done = true;
        }
    }

    skip(): void {
        this.suff.skip();
        this.d.skip();
        this.done = true;
    }

    reset(): void {
        this.suff.reset();
        this.d.reset();
        this.done = false;
    }

    get_shift(i: number): number {
        return this.d.get(i);
    }

    static get_canvas_size(pattern: string): Vector {
        return new Vector(150 + pattern.length * 50, 250);
    }
}


class RTable extends Graphic {
    pattern: GraphicList;
    index: GraphicList;
    improved: boolean;
    symbs: Map<string, GraphicList>;
    values: Map<string, GraphicList>;
    data: Map<string, Array<number>>;
    step: number;
    done: boolean;

    constructor(parent: D3selec<SVGGraphicsElement>, pos: Vector, w: number, pattern: string, improved: boolean = false){
        super(parent, pos);
        const offset_pos = pos.add(new Vector(100, 0));
        this.index = new GraphicList(this.group, offset_pos, w, Array.from({ length: pattern.length}, (_, index) => index + 1));
        this.pattern = new GraphicList(this.group, offset_pos.add(new Vector(0, w)), w, pattern.split(""));
        this.improved = improved;
        this.symbs = new Map<string, GraphicList>;
        this.values = new Map<string, GraphicList>;
        this.data = new Map<string, Array<number>>;
        this.step = 0;
        this.done = false;

        let y_offset = 3.5*w;
        for (let i=0; i < pattern.length; i++){
            if (!this.data.has(pattern[i])){
                this.data.set(pattern[i], [0]);
                this.symbs.set(pattern[i], new GraphicList(this.group, offset_pos.add(new Vector(0, y_offset)), w, [pattern[i]]));
                this.values.set(pattern[i], new GraphicList(this.group, offset_pos.add(new Vector(1.5*w, y_offset)), w, [0]));
                y_offset += w;
            }
        }
        this.data.set('...', [0]);
        this.symbs.set('...' , new GraphicList(this.group, offset_pos.add(new Vector(0, y_offset)), w, ['...']));
        this.values.set('...' , new GraphicList(this.group, offset_pos.add(new Vector(1.5*w, y_offset)), w, [0]));

        this.group.append('text')
            .attr('x', offset_pos.x - 10)
            .attr('y', offset_pos.y + 0.5*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text('i');

        this.group.append('text')
            .attr('x', offset_pos.x - 10)
            .attr('y', offset_pos.y + 1.5*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text('P[ i ]');

        this.group.append('text')
            .attr('x', offset_pos.x + 0.5 * w)
            .attr('y', offset_pos.y + 3.2*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'bottom')
            .text('a');

        this.group.append('text')
            .attr('x', offset_pos.x + 2 * w)
            .attr('y', offset_pos.y + 3.2*w)
            .attr("font-size", "20px")
            .attr('text-anchor', improved ? 'left' : 'middle')
            .attr('dominant-baseline', 'bottom')
            .text(improved ? 'Positions de a' : 'R[ a ]');
        
    }

    next(): void {
        this.reset_color();
        if (!this.done){
            this.step++;
            this.done = this.step > this.pattern.values.length;
            if (!this.done){
                this.index.set_color(this.step, 'grey');
                this.pattern.set_color(this.step, 'grey');
                let c = `${this.pattern.get(this.step)}`;
                if (this.improved){
                    this.data.get(c)?.push(this.step);
                    let new_values = this.data.get(c);
                    new_values = new_values?new_values:[];
                    this.values.get(c)?.set_values(new_values);
                    this.values.get(c)?.set_color(new_values.length, 'green');
                    this.symbs.get(c)?.set_color(1, 'green');
                } else {
                    this.data.set(c, [this.step]);
                    this.values.get(c)?.set(1, this.step);
                    this.values.get(c)?.set_color(1, 'green');
                    this.symbs.get(c)?.set_color(1, 'green');
                }
            }
        }
    }

    skip(): void {
        while(!this.done){
            this.next();
        }
    }

    reset(): void {
        this.done = false;
        this.step = 0;
        for (let c of this.data.keys()){
            this.data.set(c, [0]);
            this.values.get(c)?.set_values([0]);
        }
        this.reset_color();
    }

    reset_color(): void {
        this.index.fill_color('white');
        this.pattern.fill_color('white');
        for (let c of this.data.keys()){
            this.symbs.get(c)?.fill_color('white');
            this.values.get(c)?.fill_color('white');
        }
    }

    static get_canvas_size(pattern: string, improved: boolean, width: number): Vector {
        const chars = ['...'];
        const freqs = new Map;
        freqs.set('...', 1);
        for (let char of pattern) {
            if(!chars.includes(char)){
                chars.push(char);
                freqs.set(char, 2);
            }
            freqs.set(char, freqs.get(char) + 1);
        }
        let maxFreq = 1;
        for (let c of chars){
            maxFreq = freqs.get(c) > maxFreq ? freqs.get(c) : maxFreq;
        }
        
        const x = Math.max(width * pattern.length, 0.5*width + maxFreq * width) + 150;
        const y = 3.5*width + chars.length * width + 50;

        return new Vector(x, y);
    }

    get_shift(c: string, i: number, color: string = 'white'): number {
        if (!this.data.has(c)){
            this.symbs.get('...')!.set_color(1, color);
            this.values.get('...')!.set_color(1, color);
            return i;
        }
        if (!this.improved){
            this.symbs.get(c)!.set_color(1, color);
            this.values.get(c)!.set_color(1, color);
            return Math.max(1, i - this.data.get(c)![0]);
        } else {
            this.symbs.get(c)!.set_color(1, color);
            let rightest = 0;
            for (let r=0; r < this.data.get(c)!.length; r++){
                if (this.data.get(c)![r] >= i) break;
                this.values.get(c)!.fill_color('white');
                this.values.get(c)!.set_color(r, color, 0);
                rightest = this.data.get(c)![r];
            }
            return i - rightest;
        }
    }
}



class SlidingWindow extends Graphic {
    text: GraphicList;
    pattern: GraphicList;
    arrow?: Arrow;

    constructor(parent: D3selec<SVGGraphicsElement>, pos: Vector, w: number, text: string, pattern: string) {
        super(parent, pos);
        this.text = new GraphicList(this.group, pos, w, text.split(""));
        this.pattern = new GraphicList(this.group, pos.add(new Vector(0, 2*w)), w, pattern.split(""));
    }

    equals(i: number, j: number): boolean {
        if (this.pattern.get(i) == this.text.get(j)){
            this.pattern.set_color(i, 'green');
            this.text.set_color(j, 'green');
            this.display_shift(i, j, 'green');
            return true;
        } else {
            this.pattern.set_color(i, 'red');
            this.text.set_color(j, 'red');
            this.display_shift(i, j, 'red');
            return false;
        }
    }

    shift(i: number): void {
        this.pattern.shift(i);
        this.arrow?.translate_start(new Vector(i*this.pattern.cell_width, 0), 1);
    }

    display_shift(from: number, to: number, color: string = 'black'): void {
        this.arrow?.remove();
        const start = new Vector(this.pattern.get_pos().x + (from - 0.5) * this.pattern.cell_width, this.pattern.get_pos().y);
        const end = new Vector(this.text.get_pos().x + (to - 0.5) * this.text.cell_width, this.text.get_pos().y + this.text.cell_width);
        this.arrow = new Arrow(this.group, start, end, color);
    }

    reset(): void {
        this.arrow?.remove();
        this.pattern.reset_pos();
        this.pattern.fill_color('white');
        this.text.fill_color('white');
    }
}


class AlgBM implements Dynamic {
    d_table: DTable;
    r_table: RTable;
    sw: SlidingWindow;
    container: HTMLElement;

    m: number;
    n: number;
    i: number;
    p = 1;
    done = false;
    state = 'check';

    constructor(container: HTMLElement, pattern: string, text: string, improved: boolean){
        this.container = container;
        this.m = pattern.length;
        this.n = text.length;
        this.i = this.m;

        // Sliding window
        const sw_div = document.createElement('div');
        sw_div.classList.add('row-cols-auto');
        sw_div.style.paddingLeft = '100px';
        sw_div.style.overflowX = 'auto';
        this.container.appendChild(sw_div);

        const sw_svg = d3.select(sw_div).append('svg')
            .attr('width', 50*(text.length + pattern.length) + 50)
            .attr('height', 200)
            .append('g');
        this.sw = new SlidingWindow(sw_svg, new Vector(25, 25), 50, text, pattern);

        // Rule
        const hr = document.createElement('hr');
        this.container.appendChild(hr);
        
        // Tables
        const tables_div = document.createElement('div');
        tables_div.classList.add('row');
        this.container.appendChild(tables_div);

        // D Table
        const d_div = document.createElement('div');
        d_div.classList.add('col-auto');
        d_div.style.overflowX = 'auto';
        d_div.style.marginRight = '20px';
        d_div.style.marginTop = '20px';
        tables_div.appendChild(d_div);

        const d_canvas_size = DTable.get_canvas_size(pattern);
        const d_svg = d3.select(d_div)
            .append('svg')
            .attr('width', d_canvas_size.x)
            .attr('height', d_canvas_size.y)
            .append('g');
        this.d_table = new DTable(d_svg, new Vector(25, 25), 50, pattern);
        const d_section = new DynamicSection(d_div, this.d_table, "Bon suffixe (table D)");

        // R Table
        const r_div = document.createElement('div');
        r_div.classList.add('col-auto');
        r_div.style.overflowX = 'auto';
        r_div.style.marginRight = '20px';
        r_div.style.marginTop = '20px';
        tables_div.appendChild(r_div);

        const r_canvas_size = RTable.get_canvas_size(pattern, improved, 50);
        const r_svg = d3.select(r_div)
            .append('svg')
            .attr('width', r_canvas_size.x)
            .attr('height', r_canvas_size.y)
            .append('g');
        this.r_table = new RTable(r_svg, new Vector(25, 25), 50, pattern, improved);
        const r_section = new DynamicSection(r_div, this.r_table, "Mauvais caractère (table R)");
    }

    next(): void {
        if (!this.d_table.done){
            this.d_table.next();
        }
        else if (!this.r_table.done){
            this.r_table.next();
        }
        else if (!this.done) {
            this.nextSearch();
        }
    }

    nextSearch(): void {
        if (this.state == 'check'){
            if (this.i == this.m){
                this.sw.pattern.fill_color('white');
                this.sw.text.fill_color('white');
                this.d_table.d.fill_color('white');
                this.d_table.index.fill_color('white');
                this.r_table.reset_color();
            }
            if (this.sw.equals(this.i, this.p + this.i - 1)){
                this.i--;
                if (this.i == 0){
                    console.log(`TROUVÉ : Occurence à la position ${this.p}`);
                    this.state = 'move';
                    this.sw.display_shift(this.i, this.p + this.i - 1 + this.d_table.get_shift(1));
                    this.d_table.d.set_color(1, 'blue');
                    this.d_table.index.set_color(1, 'blue');
                }
            }
            else {
                const shift_d = this.d_table.get_shift(this.i);
                this.d_table.d.set_color(this.i, 'blue');
                this.d_table.index.set_color(this.i, 'blue');
                const shift_r = this.r_table.get_shift(`${this.sw.text.get(this.p + this.i - 1)}`, this.i, 'blue');
                console.log(`shift by suff : ${shift_d}; shift by mvs : ${shift_r};`);
                this.state = 'move';
                this.sw.display_shift(this.i, this.p + this.i - 1 + Math.max(shift_d, shift_r), 'blue');
            }
        }
        else if (this.state == 'move'){
            if (this.i == 0){
                const shift_d = this.d_table.get_shift(1)!;
                this.p += shift_d;
                this.colorShiftD(this.i, this.p);
                this.sw.shift(shift_d);
            }
            else {
                const shift_d = this.d_table.get_shift(this.i);
                const shift_r = this.r_table.get_shift(`${this.sw.text.get(this.p + this.i - 1)}`, this.i, 'blue');
                this.sw.shift(Math.max(shift_d, shift_r));
                if (shift_d >= shift_r){
                    this.colorShiftD(this.i, this.p);
                    this.r_table.reset_color();
                } else {
                    this.colorShiftR(this.i - shift_r, this.p + this.m - 1);
                    this.d_table.d.fill_color('white');
                    this.d_table.index.fill_color('white');
                }
                this.p += Math.max(shift_d, shift_r);
            }
            this.i = this.m;
            if (this.p <= this.n - this.m + 1){
                this.state = 'check';
            } else {
                this.state = 'done';
                console.log('DONE');
                this.done = true;
            }

        }
    }

    skip(): void {
        while (!this.done) {
            this.next();
        }
    }

    reset(): void {
        this.d_table.reset();
        this.r_table.reset();
        this.sw.reset();

        this.i = this.m;
        this.p = 1;
        this.done = false;
        this.state = 'check';

        this.d_table.d.fill_color('white');
        this.d_table.index.fill_color('white');
        this.r_table.reset_color();
    }

    colorShiftR(i: number, p: number): void {
        this.sw.pattern.fill_color('white');
        this.sw.text.fill_color('white');
        this.sw.pattern.set_color(i, 'green');
        this.sw.text.set_color(p, 'green');
    }

    colorShiftD(i: number, p: number): void {
        this.sw.pattern.fill_color('white');
        this.sw.text.fill_color('white');
        const shift = this.d_table.get_shift(this.i);
        let end = this.m - shift;
        let begin = end - this.d_table.suff.get(end) + 1;
        for (let k = begin; k <= end; k++){
            this.sw.pattern.set_color(k, 'green');
            this.sw.text.set_color(p + shift + k - 1, 'green');
        }
    }
}

const display_div = document.getElementById('display')!;
//const alg_div = document.createElement('div');
//alg_div.style.maxWidth = '100%';
//alg_div.style.width = '100%';
//display_div.appendChil
const alg = new AlgBM(display_div, 'xabacaba', 'abbbabaaccabacabbabacabaab', true);
const dyn_alg = new DynamicSection(display_div, alg, "Boyer Moore");
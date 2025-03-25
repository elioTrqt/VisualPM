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

interface DynamicList {
    step: number;
    done: boolean;

    next(): void;
    skip(): void;
    reset(): void;
}

class BordList extends GraphicList implements DynamicList {
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

class MPList extends GraphicList implements DynamicList {
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
        this.index = new GraphicList(this.group, pos, w, Array.from({ length: pattern.length + 1}, (_, index) => index + 1));
        this.pattern = new GraphicList(this.group, pos.add(new Vector(0, w)), w, pattern.split(""));
        this.bord = new BordList(this.group, pos.add(new Vector(0, 2*w)), w, this.pattern, this.index);
        this.mp = new MPList(this.group, pos.add(new Vector(0, 3*w)), w, this.pattern, this.index, knuth);
        this.done = false;


        this.group.append('text')
            .attr('x', pos.x - 10)
            .attr('y', pos.y + 0.5*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text('i');

        this.group.append('text')
            .attr('x', pos.x - 10)
            .attr('y', pos.y + 1.5*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text('P[ i ]');

        this.group.append('text')
            .attr('x', pos.x - 10)
            .attr('y', pos.y + 2.5*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text('Bord[ i ]');


        this.group.append('text')
            .attr('x', pos.x - 10)
            .attr('y', pos.y + 3.5*w)
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


class SuffList extends GraphicList implements DynamicList {
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
}

class DList extends GraphicList implements DynamicList {
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
}


class DTable extends Graphic {
    pattern: GraphicList;
    index: GraphicList;
    suff: SuffList;
    d: DList;
    done: boolean;

    constructor(parent: D3selec<SVGGraphicsElement>, pos: Vector, w: number, pattern: string){
        super(parent, pos);
        this.index = new GraphicList(this.group, pos, w, Array.from({ length: pattern.length}, (_, index) => index + 1));
        this.pattern = new GraphicList(this.group, pos.add(new Vector(0, w)), w, pattern.split(""));
        this.suff = new SuffList(this.group, pos.add(new Vector(0, 2*w)), w, this.pattern, this.index);
        this.d = new DList(this.group, pos.add(new Vector(0, 3*w)), w, this.pattern, this.index, this.suff);
        this.done = false;


        this.group.append('text')
            .attr('x', pos.x - 10)
            .attr('y', pos.y + 0.5*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text('i');

        this.group.append('text')
            .attr('x', pos.x - 10)
            .attr('y', pos.y + 1.5*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text('P[ i ]');

        this.group.append('text')
            .attr('x', pos.x - 10)
            .attr('y', pos.y + 2.5*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text('Suff[ i ]');


        this.group.append('text')
            .attr('x', pos.x - 10)
            .attr('y', pos.y + 3.5*w)
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
        }
    }

    next_list(): void {
        if (!this.suff.done){
            this.suff.skip();
        }
        else if (!this.d.done){
            this.d.skip();
        }
    }

    skip(): void {
        this.suff.skip();
        this.d.skip();
    }

    reset(): void {
        this.suff.reset();
        this.d.reset();
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
        this.index = new GraphicList(this.group, pos, w, Array.from({ length: pattern.length}, (_, index) => index + 1));
        this.pattern = new GraphicList(this.group, pos.add(new Vector(0, w)), w, pattern.split(""));
        this.improved = improved;
        this.symbs = new Map<string, GraphicList>;
        this.values = new Map<string, GraphicList>;
        this.data = new Map<string, Array<number>>;
        this.step = 0;
        this.done = false;

        let y_offset = 4*w;
        for (let i=0; i < pattern.length; i++){
            if (!this.data.has(pattern[i])){
                this.data.set(pattern[i], [0]);
                this.symbs.set(pattern[i], new GraphicList(this.group, pos.add(new Vector(0, y_offset)), w, [pattern[i]]));
                this.values.set(pattern[i], new GraphicList(this.group, pos.add(new Vector(1.5*w, y_offset)), w, [0]));
                y_offset += w;
            }
        }
        this.data.set('...', [0]);
        this.symbs.set('...' , new GraphicList(this.group, pos.add(new Vector(0, y_offset)), w, ['...']));
        this.values.set('...' , new GraphicList(this.group, pos.add(new Vector(1.5*w, y_offset)), w, [0]));

        this.group.append('text')
            .attr('x', pos.x - 10)
            .attr('y', pos.y + 0.5*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text('i');

        this.group.append('text')
            .attr('x', pos.x - 10)
            .attr('y', pos.y + 1.5*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text('P[ i ]');

        this.group.append('text')
            .attr('x', pos.x + 0.5 * w)
            .attr('y', pos.y + 3.7*w)
            .attr("font-size", "20px")
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'bottom')
            .text('a');

        this.group.append('text')
            .attr('x', pos.x + 2 * w)
            .attr('y', pos.y + 3.7*w)
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
}


const svg = d3.select('#display')
.append('svg')
.attr('width', 2000)
.attr('height', 800).append('g');


const l = new MPTable(svg, new Vector(200, 100), 50, "abacaba", false);
//const l = new DTable(svg, new Vector(200, 100), 50, "abacaba");
//const l = new RTable(svg, new Vector(200, 100), 50, "abacaba", true);
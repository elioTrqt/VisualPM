/*
Pattern and Text position are given in number of cell shift from their original position
Arrow start and end are given as the pattern and text cells respectively
This allow outside components to be agnostic of the SlidingWindows components absolute size and positions
*/
export type SlidingStep = {
    text?: {
        position: number,
        color: Array<string>,
        anim: boolean,
    },
    pattern?: {
        position: number,
        color: Array<string>,
        anim: boolean,
    },
    arrow?: {
        position: {
            start: number,
            end: number
        },
        color: string,
        anim: boolean
    },
};

// Call the method "method" of attribute "object", with args "args"
export class methodCall {
    object: string;
    method: string;
    args: any[];
    constructor(obj: string, method: string, args: any[]){
        this.object = obj;
        this.method = method;
        this.args = args;
    }
}

export type Update = {
    front: methodCall[],
    back: methodCall[],
    message: string,
}

export type AlgUpdate = Map<string, Update>;

export type alg_result<T> = {
    data: T,
    steps: Array<Update>
};

export type suff_result = alg_result<Array<number>>;
export type right_result = alg_result<Map<string, Array<number>>>;
export type bm_result = alg_result<Array<number>>;

export interface Updatable {
    update(todo: methodCall[]): void;
    skip(): void;
    reset(): void;
}

export interface DomElement {
    container: HTMLElement;
}

export function append_to(parent: DomElement, child: DomElement){
    parent.container.appendChild(child.container);
}
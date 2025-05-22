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

export class methodCall {
    object: string;
    method: string;
    args: any[];
    constructor(objec: string, method: string, args: any[]){
        this.object = objec;
        this.method = method;
        this.args = args;
    }
}

export type Update = {
    front: methodCall[],
    back: methodCall[],
    message: string,
}

export type alg_result<T> = {
    data: T,
    steps: Array<Update>
};

export type suff_result = alg_result<Array<number>>;
export type right_result = alg_result<Map<string, Array<number>>>;
export type bm_result = alg_result<Array<number>>;
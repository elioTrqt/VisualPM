// @ts-ignore
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { D3selec, Graphic, GraphicList, Arrow, Dynamic, DynamicSection, SlidingWindow} from "./graphics.js";
import { Vector } from "./vector.js";
import { AlgBM } from "./bm.js";

const display_div = document.getElementById('display')!;

var current_text: string = "banaabbbabaaccabacabbabacabaabnas";
var current_pattern: string = "abacaba";
var current_alg: string = "bm";
var alg_section: DynamicSection;

const alg = new AlgBM(display_div, current_pattern, current_text, false);
alg_section = new DynamicSection(display_div, alg, "Boyer Moore");

function switch_alg(alg: string): void{
    console.log(`switching from ${current_alg} to ${alg}`);
    display_div.innerHTML = "";
    current_alg = alg;

    switch(alg){
        case "naive":
            // TODO
            break;
        case "mp":
            // TODO
            break;
        case "bm":
            const alg_bm = new AlgBM(display_div, current_pattern, current_text, false);
            alg_section = new DynamicSection(display_div, alg_bm, "Boyer Moore");
            break;
        case "bm+":
            const alg_bmplus = new AlgBM(display_div, current_pattern, current_text, true);
            alg_section = new DynamicSection(display_div, alg_bmplus, "Boyer Moore (+)");
            break;
        case "sufftree":
            // TODO
            break;
    }

}
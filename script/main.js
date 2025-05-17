import { DynamicSection } from "./graphics.js";
import { AlgBM } from "./bm.js";
const display_div = document.getElementById('display');
//const alg_div = document.createElement('div');
//alg_div.style.maxWidth = '100%';
//alg_div.style.width = '100%';
//display_div.appendChil
const alg = new AlgBM(display_div, 'xabacaba', 'abbbabaaccabacabbabacabaab', true);
const dyn_alg = new DynamicSection(display_div, alg, "Boyer Moore");

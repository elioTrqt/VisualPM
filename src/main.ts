import { AlgSection } from "./visu/alg.js";
import { DTable, RTable } from "./visu/bm.js";

const d_div = document.createElement('div');
d_div.classList.add('col-auto');
d_div.style.overflowX = 'auto';
d_div.style.marginRight = '20px';
d_div.style.marginTop = '20px';
document.getElementById("display")!.appendChild(d_div);

//const d_table = new DTable("ABACABACABA", 50);
const r_table = new RTable("ABACABBBBACABA", false, 50);
const section = new AlgSection(d_div, r_table, "Table R (mauvais caractère) :", "this should help");
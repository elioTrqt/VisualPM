import { DSection, RSection } from "./visu/bm.js";
import { SWSection } from "./visu/sliding_window.js";
import { PMAlg } from "./visu/alg.js";


const display = document.getElementById("display")!;

const d = new DSection("ABACABACABA");
const r = new RSection("BBBBBBBBBB", false);
display.appendChild(d.container);
display.appendChild(r.container);

const alg = new PMAlg();
const sw = new SWSection(alg, "ABBABAABACCABABACBACBABBACBABACABACABABBACABACABACC", "ABACABACABA", 1);
display.appendChild(sw.container);
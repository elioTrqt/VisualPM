import { DSection } from "./visu/bm/decal.js";
import { RSection } from "./visu/bm/right.js";

const display = document.getElementById("display")!;

// const r = new RSection("ABACABACABA", false);
// display.appendChild(r.container);
const d = new DSection("ABACABACABA");
display.appendChild(d.container);

// const alg = new PMAlg("ABBABAABACCABABACBACBABBACBABACABACABABBACABACABACC", "ABACABACABA", "Boyer Moore", "something not yet helpfull");
// const sw = new SWSection(alg, "ABBABAABACCABABACBACBABBACBABACABACABABBACABACABACC", "ABACABACABA", 1);
// display.appendChild(sw.container);

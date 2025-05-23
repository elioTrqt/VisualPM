import { DSection, RSection } from "./visu/bm.js";


const display = document.getElementById("display")!;

const d = new DSection("ABACABACABA");
const r = new RSection("BBBBBBBBBB", false);
display.appendChild(d.container);
display.appendChild(r.container);
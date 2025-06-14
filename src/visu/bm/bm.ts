// import { init_bm_search } from "../../algs/bm.js";
import { RSectionState } from "./right.js";
import { DSectionState } from "./decal.js";


export type BMState = {
	// sw: SWSectionState;
	right: RSectionState;
	decal: DSectionState;
}

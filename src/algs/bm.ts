import { RSectionState, RTableState, dictRowUpdate } from "../visu/bm/right.js"
import { DSectionState, DTableState } from "../visu/bm/decal.js"
import { BMState } from "../visu/bm/bm.js"


type suff_result = {
	values: number[],
	steps: DSectionState[],
};

// TODO: actual suff algorithm trace with explanations
export function init_suff(pattern: string): suff_result {
	const m = pattern.length;
	const suff = new Array<number>(m + 1);

	// Compute Suff
	suff[m] = m;
	let g: number = m;
	let f: number;
	for (let i = m - 1; i >= 1; i--) {
		if (i > g && suff[i + m - f!] != i - g) {
			suff[i] = Math.min(suff[i + m - f!], i - g);
		}
		else {
			f = i;
			g = Math.min(g, i);
			while (g > 0 && pattern[g - 1] == pattern[g + m - f - 1]) {
				g--;
			}
			suff[i] = f - g;
		}
	}

	// Compute Steps
	// INFO: this are the intuitive reasoning for computing suffs and not the algorithm process
	const steps: DSectionState[] = [];

	for (let i = 1; i <= m; i++) {

		const state = new DTableState();

		state.index_color.push([i, 'grey']);
		state.suff.color.push([i, 'grey']);
		for (let j = i; j > i - suff[i]; j--)
			state.pattern_color.push([j, 'green']);

		state.suff.update.push({ pos: i, prev: null, new: suff[i] });

		const msg = `
			Le plus grand suffixe de P[1...${i}] (='${pattern.slice(0, i)}') qui est aussi suffixe de P 
			est '${pattern.slice(i - suff[i], i)}', de taille ${i - (i - suff[i])} ;
			<br/>Donc Suff[${i}] = ${i - (i - suff[i])};
		`;

		steps.push({ data: state, message: msg });
	}

	steps.push({ data: new DTableState(), message: `Table Suff complète !` });
	return { values: suff, steps: steps };
}

export function init_decal(pattern: string, suff: number[]): suff_result {
	const m = pattern.length;
	const decal = new Array<number>(m + 1);
	const steps: DSectionState[] = [];

	// INIT
	let i = 1;
	const state = new DTableState();
	for (let j = 1; j <= m; j++) {
		decal[j] = m;
		state.decal.update.push({ pos: j, prev: null, new: m });
	}
	steps.push({ data: state, message: `Initialisation à |P| = ${m}.` });

	// INFO: Case 2: bord max
	for (let j = m - 1; j >= 0; j--) {
		if (j == 0 || suff[j] == j) {
			while (i <= m - j) {
				const msg = `
					Règle 2 : plus grand bord<br/>
					En cas d'échec à la position i = ${i}, on à déjà reconu le suffixe u = P[${i + 1}...${m}] = ${pattern.slice(i, m)}, de taille |u| = ${m - i} ;<br/>
					On cherche la plus grande position j <= |u| tel que Suff[j] = j, c'est la position de fin de b : le plus grand bord de P de taille |b| <= |u| ; <br/>
					On a alors j = ${j} car ${j} <= ${m - i} et Suff[${j}] = ${suff[j]}, avec b = ${pattern.slice(0, j)} le bord correspondant ; <br/>
					Enfin le décalage est donné par D[${i}] = |P| - j = ${m - j} 
					qui correspond au décalage qui permet de décaler l'occurence préfixe de b "à la place de" son occurence suffixe ;
				`;

				const state = new DTableState();
				state.index_color.push([i, 'grey']);
				state.decal.color.push([i, 'grey']);
				state.suff.color.push([j, 'green']);
				for (let k = j; k >= 1; k--)
					state.pattern_color.push([k, 'green']);

				state.decal.update.push({ pos: i, prev: decal[i], new: m - j });

				steps.push({ data: state, message: msg });

				decal[i] = m - j;
				i++;
			}
		}
	}

	// INFO: Case 1: bon suffixe
	// TODO: Not sure how to adapt the message to be accurate with both intuition and algorithm process
	const not_updated = decal.slice();
	const updated = new Array<number | null>(m + 1).fill(null);
	for (let j = 1; j <= m; j++) {
		decal[m - suff[j]] = m - j;
		updated[m - suff[j]] = m - j;
	}

	for (let i = 1; i <= m; i++) {
		let msg = `
			Règle 1 : bon suffixe<br/>
			En cas d'échec à la position i = ${i}, on à déjà reconu le suffixe u = P[${i + 1}...${m}] = ${pattern.slice(i, m)}, de taille |u| = ${m - i} ;<br/>
			On cherche u' une autre occurence de u dans P (la plus à droite), tel que le caractère qui la précède soit différent du caractère qui précède u, 
			c'est à dire le caractère d'échec P[${i}] = ${pattern[i - 1]} ; <br/>
			Si u' existe, sa présence se traduit par la plus grande position j tel que Suff[j] = |u| = ${m - i} ;<br/>
		`;

		const state = new DTableState();

		state.index_color.push([i, 'grey']);
		state.decal.color.push([i, 'grey']);

		if (updated[i] != null) {
			const j = m - updated[i]!;
			msg += `On trouve j = ${j} avec Suff[${j}] = ${suff[j]}; <br/>
            Alors le décalage est donné par D[${i}] = m - j = ${updated[i]} qui correspond au décalage qui permet de décaler u' "à la place de" u.`;

			state.decal.color.push([i, 'green']);
			state.suff.color.push([j, 'green']);
			for (let k = j; k > j - suff[j]; k--)
				state.pattern_color.push([k, 'green']);

			state.decal.update.push({ pos: i, prev: not_updated[i], new: updated[i] });
		}
		else {
			msg += `Dans P il n'existe aucun position j tel que Suff[j] = ${m - i} alors on s'en tient à la règle 2 (plus grand bord)`;
			state.decal.color.push([i, 'grey']);
		}
		steps.push({ data: state, message: msg });
	}

	steps.push({ data: new DTableState(), message: `Table D complète !` });

	return { values: decal, steps: steps };
}


type right_result = {
	values: Map<string, number[]>,
	steps: RSectionState[],
};

export function init_right(pattern: string, improved: boolean): right_result {
	const right = new Map<string, number[]>();
	const steps: RSectionState[] = [];

	const sigma = [...new Set(pattern)].sort();
	sigma.push('...');

	const first_state = new RTableState();
	const first_msg = `
		On initialise R[a] avec ${improved ? "un vecteur contenant 0" : "un entier à 0"} 
		pour tout a dans l'alphabet Sigma = {${sigma.join(',')}}.
	`;

	for (let c of sigma) {
		right.set(c, [0]);
		const update = new dictRowUpdate();
		update.id = c;
		update.append = [0];
		first_state.rows.push(update);
	}
	steps.push({ data: first_state, message: first_msg });

	for (let i = 1; i <= pattern.length; i++) {
		const state = new RTableState();
		state.index_color.push([i, 'grey']);
		state.pattern_color.push([i, 'grey']);

		let msg = `
			Une nouvelle occurence de '${pattern[i - 1]}'${improved ? "" : ", plus à droite que la précédente,"} 
			est trouvé à la position ${i} ;<br/>
		`;

		if (improved) {
			msg += `On rajoute ${i} au vecteur R[${pattern[i - 1]}] ;`;
			state.rows.push({ id: pattern[i - 1], append: [i], color: [[0, "grey"], [right.get(pattern[i - 1])!.length + 1, "grey"]], update: [] });
			right.get(pattern[i - 1])!.push(i);
		}
		else {
			msg += `On met à jour R tel que R[${pattern[i - 1]}] = ${i} ;`;
			state.rows.push({
				id: pattern[i - 1], append: [], color: [[0, "grey"], [1, "grey"]],
				update: [{ pos: 1, prev: right.get(pattern[i - 1])![0], new: i }]
			});
			right.set(pattern[i - 1], [i]);
		}

		steps.push({ data: state, message: msg });
	}

	steps.push({ data: new RTableState(), message: `Table R complète !` });
	return { values: right, steps: steps };
}


// export function init_bm_search(text: string, pattern: string, right: Map<string, number[]>, decal: number[]) {
//
// 	const occurences = new Map<number, number[]>();
// 	const count = 0;
//
// 	console.log("starting BM search");
// 	console.log("decal = ", decal);
// 	console.log("right = ", right);
//
// 	let pos = 1;
// 	let n = text.length; let m = pattern.length;
// 	let i = m;
//
// 	while (pos <= n - m + 1) {
// 		i = m;
// 		while (i > 0 && pattern[i] == text[pos + i - 1])
// 			i--;
//
// 		if (i == 0) {
// 			console.log("P found at pos ", pos);
// 			pos = pos + decal[1]
// 		} else {
// 			pos = pos + Math.max(decal[i], i - right[pos + i - 1]);
// 		}
// 	}
//
// }

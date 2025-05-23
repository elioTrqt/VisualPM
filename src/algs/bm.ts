
import { suff_result, Update, methodCall, right_result } from "../types.js"

export function init_suff(pattern: string): suff_result {
    const m = pattern.length;
    const suff = new Array<number>(m + 1);

    // Compute Suff
    suff[m] = m;    
    let g: number = m;
    let f: number;
    for (let i = m-1; i >= 1; i--){
        if (i > g && suff[i+m-f!] != i-g){
            suff[i] = Math.min(suff[i+m-f!], i-g);
        }
        else {
            f = i;
            g = Math.min(g, i);
            while(g > 0 && pattern[g-1] == pattern[g+m-f-1]){
                g--;
            }
            suff[i] = f-g;
        }
    }

    // Compute Steps
    const steps = new Array<Update>();

    for (let i=1; i <= m; i++){
        const front = new Array<methodCall>();
        const backward = new Array<methodCall>();

        for (let att of ["index", "suff", "pattern"]) 
            front.push(new methodCall(att, "fill_color", ["white"]));

        front.push(new methodCall("index", "set_color", [i, "grey"]));
        front.push(new methodCall("suff", "set_color", [i, "grey"]));
        for (let j=i; j > i - suff[i]; j--)
            front.push(new methodCall("pattern", "set_color", [j, "green"]));

        front.push(new methodCall("suff", "set_value", [i, suff[i]]));
        backward.push(new methodCall("suff", "set_value", [i, ""]));

        const msg = `Le plus grand suffixe de P[1...${i}] (='${pattern.slice(0, i)}') qui est aussi suffixe de P est '${pattern.slice(i - suff[i], i)}', de taille ${i - (i - suff[i])} ;
            <br/>Donc Suff[${i}] = ${i - (i - suff[i])};`;
        steps.push(new Update(front, backward, msg));
    }

    const last_step = new Update([], [], `Table Suff complète !`);
    for (let att of ["index", "suff", "pattern", "decal"]) 
        last_step.front.push(new methodCall(att, "fill_color", ["white"]));
    steps.push(last_step);

    return {data:suff, steps:steps};
}

export function init_decal(pattern: string, suff: number[]): suff_result {
    const m = pattern.length;
    const decal = new Array<number>(m+1);
    const steps = new Array<Update>();

    let i = 1;
    steps.push(new Update([], [], `Initialisation à |P| = ${m}.`));
    for (let j=1; j <= m; j++){
        decal[j] = m;
        steps[0].front.push(new methodCall("decal", "set_value", [j, m]));
        steps[0].back.push(new methodCall("decal", "set_value", [j, ""]));
    }
    for (let j = m-1; j >= 0; j--){
        if (j==0 || suff[j] == j){
            while(i <= m - j){
                const msg = `Règle 2 : plus grand bord<br/>
                    En cas d'échec à la position i = ${i}, on à déjà reconu le suffixe u = P[${i+1}...${m}] = ${pattern.slice(i, m)}, de taille |u| = ${m - i} ;<br/>
                    On cherche la plus grande position j <= |u| tel que Suff[j] = j, c'est la position de fin de b : le plus grand bord de P de taille |b| <= |u| ; <br/>
                    On a alors j = ${j} car ${j} <= ${m - i} et Suff[${j}] = ${suff[j]}, avec b = ${pattern.slice(0, j)} le bord correspondant ; <br/>
                    Enfin le décalage est donné par D[${i}] = |P| - j = ${m-j} 
                    qui correspond au décalage qui permet de décaler l'occurence préfixe de b "à la place de" son occurence suffixe ;`;

                const step = new Update([], [], msg);

                for (let att of ["decal", "index", "pattern", "suff"]) 
                    step.front.push(new methodCall(att, "fill_color", ["white"]));
                step.front.push(new methodCall("index", "set_color", [i, "grey"]));
                step.front.push(new methodCall("decal", "set_color", [i, "grey"]));
                step.front.push(new methodCall("suff", "set_color", [j, "green"]));
                for (let k=j; k >= 1; k--) 
                    step.front.push(new methodCall("pattern", "set_color", [k, "green"]));

                step.front.push(new methodCall("decal", "set_value", [i, m-j]));
                step.back.push(new methodCall("decal", "set_value", [i, decal[i]]));

                steps.push(step);

                decal[i] = m - j;
                i++;
            }
        }
    }
    const not_updated = decal.slice();
    const updated = new Array<number | null>(m + 1).fill(null);
    for (let j=1; j <= m; j++){
        decal[m-suff[j]] = m - j;
        updated[m-suff[j]] = m - j;
    }

    for (let i=1; i <= m; i++){
        let msg = `Règle 1 : bon suffixe<br/>
            En cas d'échec à la position i = ${i}, on à déjà reconu le suffixe u = P[${i+1}...${m}] = ${pattern.slice(i, m)}, de taille |u| = ${m - i} ;<br/>
            On cherche u' une autre occurence de u dans P (la plus à droite), tel que le caractère qui la précède soit différent du caractère qui précède u, c'est à dire le caractère d'échec P[${i}] = ${pattern[i-1]} ; <br/>
            Si u' existe, sa présence se traduit par la plus grande position j tel que Suff[j] = |u| = ${m - i} ;<br/>`;

        const step = new Update([], [], msg);

        for (let att of ["decal", "index", "pattern", "suff"]) 
            step.front.push(new methodCall(att, "fill_color", ["white"]));

        step.front.push(new methodCall("index", "set_color", [i, "grey"]));
        step.front.push(new methodCall("decal", "set_color", [i, "grey"]));
        
        if (updated[i] != null){
            const j = m - updated[i]!;
            step.message += `On trouve j = ${j} avec Suff[${j}] = ${suff[j]}; <br/>
            Alors le décalage est donné par D[${i}] = m - j = ${updated[i]} qui correspond au décalage qui permet de décaler u' "à la place de" u.`;

            step.front.push(new methodCall("decal", "set_color", [i, "green"]));
            step.front.push(new methodCall("suff", "set_color", [j, "green"]));
            for (let k=j; k > j - suff[j]; k--) 
                step.front.push(new methodCall("pattern", "set_color", [k, "green"]));

            step.front.push(new methodCall("decal", "set_value", [i, updated[i]]));
            step.back.push(new methodCall("decal", "set_value", [i, not_updated[i]]));
        } else {
            step.message += `Dans P il n'existe aucun position j tel que Suff[j] = ${m - i} alors on s'en tient à la règle 1 (plus grand bord)`;

            step.front.push(new methodCall("decal", "set_color", [i, "grey"]));
        }
        steps.push(step);
    }

    const last_step = new Update([], [], `Table D complète !`);
    for (let att of ["decal", "index", "pattern", "suff"]) 
        last_step.front.push(new methodCall(att, "fill_color", ["white"]));
    steps.push(last_step);

    return {data:decal, steps:steps};
}

export function init_right(pattern: string, improved: boolean): right_result {
    const right = new Map<string, number[]>();
    const steps: Update[] = [];

    const sigma = [...new Set(pattern)].sort();
    sigma.push('...');

    const first_step = new Update();
    first_step.message = `On initialise R[a] avec ${improved ? "un vecteur contenant 0" : "un entier à 0"} pour tout a dans l'alphabet Sigma = {${sigma.join(',')}}.`;

    for (let c of sigma) {
        right.set(c, [0]);
        first_step.front.push(new methodCall("table", "set_value", [c, 1, 0]));
        first_step.back.push(new methodCall("table", "set_value", [c, 1, ""]));
    }
    steps.push(first_step);

    let to_revert: methodCall[] = [];

    for (let i=1; i <= pattern.length; i++){
        const step = new Update();
        step.front.push(new methodCall("index", "set_color", [i, "grey"]));
        step.front.push(new methodCall("pattern", "set_color", [i, "green"]));
        step.front = to_revert.concat(step.front);
        step.back.push(new methodCall("index", "set_color", [i, "white"]));
        step.back.push(new methodCall("pattern", "set_color", [i, "white"]));
        step.back.push(new methodCall("table", "set_color", [pattern[i-1], 0, "white"]));
        to_revert = step.back.slice();
        step.message = `Une nouvelle occurence de '${pattern[i-1]}'${improved ? "" : ", plus à droite que la précédente,"} est trouvé à la position ${i} ;<br/>`;
        if (improved){
            step.message += `On rajoute ${i} au vecteur R[${pattern[i-1]}] ;`;
            step.front.push(new methodCall("table", "set_values", [pattern[i-1], right.get(pattern[i-1])!.concat([i])]));
            step.front.push(new methodCall("table", "set_color", [pattern[i-1], right.get(pattern[i-1])!.length + 1, "grey"]));
            step.back.push(new methodCall("table", "set_values", [pattern[i-1], right.get(pattern[i-1])!.slice()]));
            step.back.push(new methodCall("table", "set_color", [pattern[i-1], right.get(pattern[i-1])!.length + 1, "white"]));
            to_revert.push(new methodCall("table", "set_color", [pattern[i-1], right.get(pattern[i-1])!.length + 1, "white"]));
            right.get(pattern[i-1])!.push(i);
        } else {
            step.message += `On met à jour R tel que R[${pattern[i-1]}] = ${i} ;`;
            step.front.push(new methodCall("table", "set_value", [pattern[i-1], 1, i]));
            step.front.push(new methodCall("table", "set_color", [pattern[i-1], 1, "grey"]));
            step.back.push(new methodCall("table", "set_value", [pattern[i-1], 1, right.get(pattern[i-1])![0]]));
            step.back.push(new methodCall("table", "set_color", [pattern[i-1], 1, "white"]));
            to_revert.push(new methodCall("table", "set_color", [pattern[i-1], 1, "white"]))
            right.set(pattern[i-1], [i]);
        }
        step.front.push(new methodCall("table", "set_color", [pattern[i-1], 0, "green"]));
        steps.push(step);
    }

    const last_step = new Update();
    last_step.front.push(new methodCall("index", "fill_color", ["white"]));
    last_step.front.push(new methodCall("pattern", "fill_color", ["white"]));
    last_step.front.push(new methodCall("table", "fill_color", ["white"]));
    last_step.message = "Table R complète !";
    steps.push(last_step);

    return {data:right, steps: steps};
}
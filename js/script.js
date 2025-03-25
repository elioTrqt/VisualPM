var pattern = new GraphicList(100, 200, 50);
pattern.set_pattern("abacaba".split(""));

var text = new GraphicList(100, 100, 50);
text.set_pattern("ababacabacabaccbabbabacababbabacaba".split(""));

var current_alg = new RechercheNaive(pattern, text);

function setAlgo(a){
    console.log(a);
    current_alg.clean();
    if(a == 'naive'){
        current_alg = new RechercheNaive(pattern, text);
    }
    else if(a == 'mp'){
        current_alg = new MPSearch(pattern, text, false);
    }
    else if(a == 'kmp'){
        current_alg = new MPSearch(pattern, text, true);
    }
    else if(a == 'bm'){
        current_alg = new BMSearch(pattern, text);
    }
}

function next_step(){
    current_alg.next();
}

function auto(){
    current_alg.fill_table();
}

function reset_alg(){
    current_alg.reset();
}

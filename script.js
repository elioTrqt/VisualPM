var pattern = new GraphicList(100, 200, 50);
pattern.init("abacaba".split(""));

var text = new GraphicList(100, 100, 50);
text.init("ababacabacabaccbabbabacababbabacaba".split(""));

var current_alg = new RechercheNaive(pattern, text);

function setAlgo(a){
    console.log(a);
    current_alg.destroy();
    if(a == 'naive'){
        current_alg = new RechercheNaive(pattern, text);
    }
    else if(a == 'mp'){
        current_alg = new MPSearch(pattern, text, false);
    }
    else if(a == 'kmp'){
        current_alg = new MPSearch(pattern, text, true);
    }
}

function next_step(){
    current_alg.next();
}

function auto(){
    current_alg.fill();
}

function reset_alg(){
    current_alg.reset();
}

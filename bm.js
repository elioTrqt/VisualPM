function Suff(I, Suff, P){
    this.I = I;
    this.Suff = Suff;
    this.P = P;

    this.m = this.P.content.length;
    this.values = Array(this.m + 1);
    this.done = false;
    this.i = 0;
    
    this.process = function (){
        this.values[this.m] = this.m;
        let g = this.m;
        let f;
        for (let i = this.m - 1; i >= 1; i--){
            if (i > g && this.values[i+this.m-f] != i - g){
                this.values[i] = Math.min(this.values[i+this.m-f], i - g);
            }
            else {
                f = i;
                g = Math.min(g, i);
                while (g > 0 && this.P.get(g) == this.P.get(g+this.m-f)){
                    g = g-1;
                }
                this.values[i] = f-g;
            }
        }
    }
    this.process();

    this.colorSuff = function (i){
        this.P.reset_color();
        for(let k=0; k < this.values[i]; k++){
            this.P.set_color(i-k, 'green');
        }
    }

    this.next = function(){
        if (this.done){
            this.I.reset_color();
            this.P.reset_color();
            return false;
        }
        else {
            this.I.reset_color();
            this.i++;
            this.Suff.set(this.i, this.values[this.i]);
            this.colorSuff(this.i);
            this.I.set_color(this.i, 'grey');
            if (this.i == this.m){
                this.done = true;
            }
            return true;
        }
    }

    this.fill = function(){
        while (!this.done){
            this.next();
        }
        this.next();
    }

    this.reset = function(){
        this.I.reset();
        this.P.reset();
        this.Suff.empty();
        this.i = 0;
        this.done = false;
    }

    this.get = function (i) {
        return this.values[i];
    }
}

function Dec(I, D, P, Suff){
    this.I = I;
    this.D = D;
    this.Suff = Suff;
    this.P = P;

    this.m = this.P.content.length;
    this.values = Array(this.m + 1);
    this.value_from = Array(this.m + 1);
    this.value_case = Array(this.m + 1);
    this.done = false;
    this.i = 0;
    
    this.process = function (){
        for (let j=1; j <= this.m; j++){
            this.values[j] = this.m;
        }
        let i = 1;
        for (let j = this.m-1; j >= 0; j--){
            if (j==0 || this.Suff.get(j) == j){
                while (i <= this.m-j){
                    this.value_from[i] = j;
                    this.value_case[i] = 'case2';
                    this.values[i] = this.m - j;
                    i++;
                }
            }
        }
        for (let j=1; j <= this.m - 1; j++){
            this.value_from[this.m - this.Suff.get(j)] = j;
            this.value_case[this.m - this.Suff.get(j)] = 'case1';
            this.values[this.m - this.Suff.get(j)] = this.m - j;
        }
    }
    this.process();

    this.colorDec = function (i){
        this.P.reset_color();
        let j = this.value_from[i];
        this.Suff.colorSuff(j);
        console.log(this.value_case[i]);
    }

    this.next = function(){
        if (this.done){
            this.I.reset_color();
            this.P.reset_color();
            return false;
        }
        else {
            this.I.reset_color();
            this.i++;
            this.D.set(this.i, this.values[this.i]);
            this.colorDec(this.i);
            this.I.set_color(this.i, 'grey');
            if (this.i == this.m){
                this.done = true;
            }
            return true;
        }
    }

    this.fill = function(){
        while (!this.done){
            this.next();
        }
        this.next();
    }

    this.reset = function(){
        this.I.reset();
        this.P.reset();
        this.D.empty();
        this.i = 0;
        this.done = false;
    }

    this.get = function (i) {
        return this.values[i];
    }
}


function SuffTable(x, y, w, pattern){
    this.x = x;
    this.y = y;
    this.width = w;

    this.current_x = x;
    this.current_y = y;

    this.state = 'suff';
    this.done = false;

    this.I = new GraphicList(this.x, this.y, this.width, Array.from({ length: pattern.length }, (_, index) => index+1));
    this.P = new GraphicList(this.x, this.y + this.width, this.width, pattern);

    this.Suff_tab = new GraphicList(this.x, this.y + 2 * this.width, this.width, Array(pattern.length).fill(""));
    this.Suff = new Suff(this.I, this.Suff_tab, this.P);

    this.Dec_tab = new GraphicList(this.x, this.y + 3 * this.width, this.width, Array(pattern.length).fill(""));
    this.D = new Dec(this.I, this.Dec_tab, this.P, this.Suff);

    this.next = function(){
        if (this.state == 'suff'){
            if (this.Suff.done){
                this.state = 'dec';
            }
            this.Suff.next();
        }
        else if (this.state == 'dec'){
            if (this.D.done){
                this.state = 'done';
            }
            this.D.next();
        }
    }

    this.fill = function(){
        this.Suff.fill();
        this.done = true;
    }

    this.reset = function(){
        this.I.reset();
        this.P.reset();
        this.Suff.reset();
        this.D.reset();
        this.state = 'suff';
        this.done = false;
    }

    this.get = function(i) {
        return this.MP.get(i);
    }

    this.clean = function (){
        this.I.clean();
        this.P.clean();
        this.Suff_tab.clean();
        this.Dec_tab.clean();
    }
}


function BMSearch(P, T){
    this.P = P;
    this.T = T;
    this.m = this.P.content.length;
    this.n = this.T.content.length;
    this.SuffTable = new SuffTable(100, 300, 50, this.P.content);

    this.state = 'check';
    this.i = 1;
    this.j = 1;

    this.next = function () {
        if (!this.SuffTable.done){
            this.SuffTable.next();
        }
        else {
            this.nextSearch();
        }
    }

    this.nextSearch = function (){
        if (this.state == 'check'){
            if (this.P.get(this.i) != this.T.get(this.j)){
                this.P.set_color(this.i, 'red');
                this.T.set_color(this.j, 'red');
                this.P.set_arrow(this.MPNext.get(this.i), this.i, 'blue');
                this.MPNext.MP_tab.set_color(this.i, 'blue');
                this.state = 'move';
            } else {
                this.P.set_color(this.i, 'green');
                this.T.set_color(this.j, 'green');
                this.i++;
                this.j++;
                if (this.i == this.m + 1){
                    console.log(`TROUVÉ : Occurence à la position ${this.j - this.i + 1}`);
                    this.P.set_arrow(this.MPNext.get(this.i), this.i, 'blue');
                    this.MPNext.MP_tab.set_color(this.i, 'blue');
                    this.state = 'move';
                }
                if (this.j > this.n){
                    console.log('FINI');
                    this.state = 'done';
                    this.MPNext.MP_tab.reset_color();
                    this.P.reset_arrow();
                }
            }
        }
        else if (this.state == 'move'){
            this.MPNext.MP_tab.reset_color();
            for (let i = this.MPNext.get(this.i); i <= this.m; i++){
                this.P.set_color(i, 'white');
                this.T.set_color(this.j-i, 'white');
            }
            this.T.set_color(this.j, 'white');
            this.P.shift(this.i - this.MPNext.get(this.i));
            this.i = this.MPNext.get(this.i);
            this.state = 'check';
            if (this.i == 0){
                this.i++;
                this.j++;
                if (this.j > this.n){
                    console.log('FINI');
                    this.state = 'done';
                }
            }
        }
    }

    this.fill_table = function (){
        this.SuffTable.fill();
    }

    this.reset = function (){
        this.P.reset();
        this.T.reset();
        this.SuffTable.reset();
        this.i = 1;
        this.j = 1;
        this.state = 'check';
    }

    this.clean = function (){
        this.reset();
        this.SuffTable.clean();
    }
}
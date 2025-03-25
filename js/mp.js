function Bord(I, B, P){
    this.I = I;
    this.B = B;
    this.P = P;

    this.m = this.P.content.length;
    this.values = Array(this.m + 1);
    this.done = false;
    this.i = 0;
    
    this.process = function (){
        this.values[0] = -1;
        for (let i=1; i<=this.m; i++){
            let j = this.values[i-1];
            while (j>=0 && this.P.get(i) != this.P.get(j+1)){
                j = this.values[j];
            }
            this.values[i] = j + 1;
        }
    }
    this.process();

    this.colorBords = function (i){
        this.P.reset_color();
        for (let k = 1; k <= this.values[i]; k++){
            this.P.set_color(k, 'green');
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
            this.B.set(this.i, this.values[this.i]);
            this.colorBords(this.i);
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
        this.B.empty();
        this.i = 0;
        this.done = false;
    }

    this.get = function (i) {
        return this.values[i];
    }
}

function MPNext(I, MP_tab, P, k){
    this.I = I;
    this.MP_tab = MP_tab;
    this.P = P;
    this.k = k;

    this.m = this.P.content.length;
    this.values = Array(this.m + 2);
    this.done = false;
    this.i = 0;

    this.process = function (){
        this.values[1] = 0;
        let j = 0;
        for (let i = 1; i <= this.m; i++){
            while (j > 0 && this.P.get(i) != this.P.get(j)){
                j = this.values[j];
            }
            j++;
            if (!this.k || this.i == this.m || this.P.get(i+1) != this.P.get(j)){
                this.values[i + 1] = j;
            }
            else {
                this.values[i + 1] = this.values[j];
            }
        }
    }
    this.process();

    this.next = function(){
        if (this.done){
            this.I.reset_color();
            this.P.reset_color();
            return false;
        }
        else {
            this.I.reset_color();
            this.i++;
            this.MP_tab.set(this.i, this.values[this.i]);
            this.P.reset_color();
            this.P.set_color(this.values[this.i], 'green');
            this.I.set_color(this.i, 'grey');
            if (this.i == this.m + 1){
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
        this.MP_tab.empty();
        this.i = 0;
        this.j = 0;
        this.done = false;
    }

    this.get = function(i){
        return this.values[i];
    }
}

function MPTable(x, y, w, pattern, k){
    this.x = x;
    this.y = y;
    this.width = w;
    this.k = k;

    this.current_x = x;
    this.current_y = y;

    this.state = 'bord';
    this.done = false;

    this.I = new GraphicList(this.x, this.y, this.width, Array.from({ length: pattern.length + 1 }, (_, index) => index+1));
    this.P = new GraphicList(this.x, this.y + this.width, this.width, pattern);

    this.B_tab = new GraphicList(this.x, this.y + 2 * this.width, this.width, Array(pattern.length).fill(""));
    this.B = new Bord(this.I, this.B_tab, this.P);

    this.MP_tab = new GraphicList(this.x, this.y + 3 * this.width, this.width, Array(pattern.length + 1).fill(""));
    this.MP = new MPNext(this.I, this.MP_tab, this.P, this.k);

    this.next = function(){
        if (this.state == 'bord'){
            if (this.B.done){
                this.state = 'mp';
            }
            this.B.next();
        }
        else if (this.state == 'mp'){
            if (this.MP.done){
                this.state = 'done';
                this.done = true;
            }
            this.MP.next();
        }
    }

    this.fill = function(){
        this.B.fill();
        this.MP.fill();
        this.done = true;
    }

    this.reset = function(){
        this.I.reset();
        this.P.reset();
        this.B.reset();
        this.MP.reset();
        this.state = 'bord';
        this.done = false;
    }

    this.get = function(i) {
        return this.MP.get(i);
    }

    this.clean = function (){
        this.I.clean();
        this.P.clean();
        this.B_tab.clean();
        this.MP_tab.clean();
    }
}


function MPSearch(P, T, k){
    this.P = P;
    this.T = T;
    this.m = this.P.content.length;
    this.n = this.T.content.length;
    this.MPNext = new MPTable(100, 300, 50, this.P.content, k);

    this.state = 'check';
    this.i = 1;
    this.j = 1;

    this.next = function () {
        if (!this.MPNext.done){
            this.MPNext.next();
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
        this.MPNext.fill();
    }

    this.reset = function (){
        this.P.reset();
        this.T.reset();
        this.MPNext.reset();
        this.i = 1;
        this.j = 1;
        this.state = 'check';
    }

    this.clean = function (){
        this.reset();
        this.MPNext.clean();
    }
}
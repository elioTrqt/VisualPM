function R(I, R, Sig, P){
    this.I = I;
    this.Sig = Sig;
    this.R = R;
    this.P = P;

    this.m = this.P.content.length;
    this.values = new Map();
    this.sigma = [];
    this.done = false;
    this.i = 0;
    
    this.process = function (){
        for (let i = 1; i <= this.m; i++){
            this.values.set(this.P.get(i), 0);
        }
        this.sigma = Array.from(this.values.keys());
        this.Sig.set_pattern(Array.from(this.values.keys()));
        this.R.set_pattern(Array.from(this.values.values()));
    }
    this.process();

    this.next = function(){
        this.I.reset_color();
        this.P.reset_color();
        this.Sig.reset_color();
        if (this.done){
            return false;
        }
        else {
            this.i++;
            this.values.set(this.P.get(this.i), this.i);
            this.R.set(this.sigma.indexOf(this.P.get(this.i)) + 1, this.values.get(this.P.get(this.i)));

            this.Sig.set_color(this.sigma.indexOf(this.P.get(this.i)) + 1, 'green')
            this.P.set_color(this.i, 'grey');
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
        this.Sig.reset();
        this.R.empty();

        this.values = new Map();
        this.sigma = [];
        this.i = 0;
        this.done = false;

        this.process();
    }

    this.get = function (c) {
        return this.values.has(c) ? this.values.get(c) : 0;
    }
}


function MvsTable(x, y, w, pattern){
    this.x = x;
    this.y = y;
    this.width = w;

    this.current_x = x;
    this.current_y = y;

    this.done = false;

    this.I = new GraphicList(this.x, this.y, this.width, Array.from({ length: pattern.length }, (_, index) => index+1));
    this.P = new GraphicList(this.x, this.y + this.width, this.width, pattern);

    this.R_tab = new GraphicList(this.x, this.y + 4 * this.width, this.width, []);
    this.Sig = new GraphicList(this.x, this.y + 3 * this.width, this.width, []);
    this.R = new R(this.I, this.R_tab, this.Sig, this.P);

    this.next = function(){
        if (!this.R.done){
            this.R.next();
        }
    }

    this.fill = function(){
        this.R.fill();
        this.done = true;
    }

    this.reset = function(){
        this.I.reset();
        this.P.reset();
        this.R.reset();
        this.done = false;
    }

    this.get = function(c) {
        return this.R.get(c);
    }

    this.clean = function (){
        this.I.clean();
        this.P.clean();
        this.R_tab.clean();
        this.Sig.clean();
    }
}
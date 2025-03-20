function RechercheNaive(P, T){
    this.P = P;
    this.T = T;
    this.m = this.P.content.length;
    this.n = this.T.content.length;

    this.pos = 1;
    this.i = 1;

    this.state = 'check';

    this.next = function(){
        if (this.state == 'check'){
            if (this.P.get(this.i) == this.T.get(this.pos + this.i - 1)){
                this.P.set_color(this.i, 'green');
                this.T.set_color(this.pos + this.i - 1, 'green');
                this.i++;
                if (this.i == this.m + 1){
                    console.log(`TROUVÉ : Occurence à la position ${this.pos}`);
                    if (this.pos + 1 > this.n - this.m + 1){
                        console.log('FINI');
                        this.state = 'done';
                    } else {
                        this.state = 'move';
                    }
                }
            }
            else {
                this.P.set_color(this.i, 'red');
                this.T.set_color(this.pos + this.i - 1, 'red');
                this.P.set_arrow(1, 2);
                if (this.pos + 1 > this.n - this.m + 1){
                    console.log('FINI');
                    this.state = 'done';
                } else {
                    this.state = 'move';
                }
            }
        }
        else if (this.state == 'move'){
            this.P.reset_color();
            this.T.reset_color();
            this.pos++;
            this.i = 1;
            this.P.shift(1);
            this.state = 'check';
        }
    }

    this.reset = function (){
        this.P.reset_color();
        this.T.reset_color();
        this.P.move_to(this.P.x, this.P.y);
        
        this.pos = 1;
        this.i = 1;
    
        this.state = 'check';
    }

    this.destroy = function(){
        this.reset();
    }
}
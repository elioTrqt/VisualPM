export class Vector {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }
    sub(other) {
        return new Vector(this.x - other.x, this.y - other.y);
    }
    len() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.x, 2));
    }
}
;

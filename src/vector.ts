export class Vector {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(other: Vector): Vector {
        return new Vector(this.x + other.x, this.y + other.y);
    }
    sub(other: Vector): Vector {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    len(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.x, 2));
    }
};
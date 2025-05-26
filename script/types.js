// Call the method "method" of attribute "object", with args "args"
export class methodCall {
    object;
    method;
    args;
    constructor(obj, method, args) {
        this.object = obj;
        this.method = method;
        this.args = args;
    }
}
export class algMethodCall extends methodCall {
    section;
    constructor(sec, obj, method, args) {
        super(obj, method, args);
        this.section = sec;
    }
}
export class Update {
    front;
    back;
    message;
    constructor(front, back, message) {
        this.front = front ? front : [];
        this.back = back ? back : [];
        this.message = message ? message : "";
    }
}
export function append_to(parent, child) {
    parent.container.appendChild(child.container);
}

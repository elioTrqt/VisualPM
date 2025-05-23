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

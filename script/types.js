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
export function append_to(parent, child) {
    parent.container.appendChild(child.container);
}

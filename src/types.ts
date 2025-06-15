// interface for objects updatables by sending states
export interface IUpdatable {
	update(state: any): void;
	reverse_update(state: any, prev_state?: any): void;
	skip(): void;
	reset(): void;
}

// interface for dynamic object that hold a sequence of ordered step
export interface IDynamic {
	next(): boolean;
	prev(): boolean;
	skip(): void;
	reset(): void;
	is_done(): boolean;
	is_started(): boolean;
}

export interface DomElement {
	container: HTMLElement;
}


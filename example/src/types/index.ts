export interface UserForm {
    name: string;
    email: string;
    age: number;
    address: {
        street: string;
        city: string;
    };
}

export interface CounterState {
    count: number;
    message: string;
}

export type TabType =
    | "zero-config"
    | "pure-zero"
    | "traditional"
    | "state"
    | "examples"
    | "autocleanup"
    | "field-test"
    | "render-test"
    | "mui-checkbox"
    | "array-length";

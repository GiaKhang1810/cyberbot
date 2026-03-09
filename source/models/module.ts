export interface Meta {
    name: string;
    description: string;
}

export interface Module {
    meta: Meta;
}

export interface RequireDynamic {
    default: Module;
}
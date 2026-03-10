import type { ApplicationCommandOptionData } from 'discord.js';

export interface Meta {
    name: string;
    description: string;
    options: ApplicationCommandOptionData[]
}

export interface Module {
    meta: Meta;
}

export interface RequireDynamic {
    default: Module;
}
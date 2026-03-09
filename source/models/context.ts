import type { Client, Collection } from 'discord.js';
import type { Module } from './module.js';

export type ReadyClient = Client<true>;
export type ModuleCollection = Collection<string, Module>;

export interface Context {
    id: string;
    username: string;
    client: ReadyClient;
    modules: ModuleCollection;
}
import type { Client, Collection } from 'discord.js';
import type { CyberModule } from './module.js';

export interface CyberContext {
    id: string;
    username: string;
    client: Client<true>;
    modules: Collection<string, CyberModule>;
}
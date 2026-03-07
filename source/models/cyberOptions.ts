import type { GatewayIntentBits } from 'discord.js';

export interface CyberOptions {
    token: string;
    clientID: string;
    intents: GatewayIntentBits[],
    adminID: string[],
    publicChannel: string[],
    timezone: string;
}
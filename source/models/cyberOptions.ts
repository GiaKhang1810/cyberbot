import type { GatewayIntentBits } from 'discord.js';

interface System {
    strict: boolean;
    timezone: string;
    locale: string;
}

interface Bot {
    token: string;
    clientID: string;
    intents: GatewayIntentBits[];
    adminID: string[];
    publicChannel: string[];
}

export interface CyberOptions {
    system: System;
    bot: Bot;
}
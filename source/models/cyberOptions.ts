import type { GatewayIntentBits } from 'discord.js';

export interface System {
    debug: boolean;
    timezone: string;
    locale: string;
}

export interface Guild {
    id: string;
    channel: string[];
}

export interface Bot {
    token: string;
    clientID: string;
    intents: GatewayIntentBits[];
    adminID: string[];
    guild: Guild[];
}

export interface CyberOptions {
    system: System;
    bot: Bot;
}
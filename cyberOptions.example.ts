import { GatewayIntentBits } from 'discord.js';
import type { CyberOptions } from './source/models/cyberOptions.js';

export const cyberOptions: CyberOptions = {
    token: '',
    clientID: '',
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    adminID: [],
    publicChannel: [],
    timezone: 'Asia/Ho_Chi_Minh'
}
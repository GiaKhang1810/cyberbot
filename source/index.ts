import { Client, Collection, type ClientOptions } from 'discord.js';

import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { CyberModule } from './models/module.js';
import type { CyberContext } from './models/context.js';

import { cyberOptions } from '../cyberOptions.js';

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename);

async function builtinModule(): Promise<Collection<string, CyberModule>> {
    const moduleDirPath = join(__dirname, 'modules');
    const collection = new Collection<string, CyberModule>();
    const moduleList = readdirSync(moduleDirPath).filter(/\.(js|ts)$/.test);
    const dynamic: Promise<CyberModule>[] = [];

    for (let module of moduleList) {
        const modulePath = join(moduleDirPath, module);

        dynamic
            .push(
                import(modulePath).then(run => run.default)
            );
    }

    const moduleDynamic = await Promise.all(dynamic);

    for (let module of moduleDynamic)
        collection.set(module.options.name, module);

    return collection;
}

async function clientReady(client: Client<true>): Promise<void> {
    const modules = await builtinModule();
    const context: CyberContext = {
        id: client.user.id,
        username: client.user.username,
        client,
        modules
    }
}

async function main(): Promise<void> {
    try {
        if (!cyberOptions.token.length) {
            process.exit(1);
        }

        const clientOptions: ClientOptions = {
            intents: cyberOptions.intents,
            presence: {
                status: 'online'
            }
        }
        const client = new Client(clientOptions);
        client.once('clientReady', clientReady);

        await client.login(cyberOptions.token);
    } catch (error: unknown) {
        console.error(error);
        process.exit(1);
    }
}

main();
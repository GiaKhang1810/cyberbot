import { Client, Collection, type ClientOptions } from 'discord.js';

import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Module, RequireDynamic } from './models/module.js';
import type { ModuleCollection, Context, ReadyClient } from './models/context.js';

import { cout } from './utility/cout.js';

import { cyberOptions } from '../cyberOptions.js';

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename);

async function builtinModule(): Promise<ModuleCollection> {
    const moduleDirPath = join(__dirname, 'modules');
    const moduleList = readdirSync(moduleDirPath)
        .filter(
            (f: string): boolean => /\.(js|ts)$/.test(f)
        );

    const modules = await Promise.allSettled<Module>(
        moduleList.map(async (name: string): Promise<Module> => {
            const modulePath = join(moduleDirPath, name)

            try {
                const run: RequireDynamic = await import(modulePath);
                return run.default;
            } catch (error: unknown) {
                const moreDetailed = new Error('Unable to load');
                moreDetailed.name = name;

                if (error instanceof Error)
                    moreDetailed.message = error.message;

                if (cyberOptions.system.strict) 
                    cout.error('Module', error);
                else 
                    cout.error('Module', 'Unable to load ' + name + ' module');

                throw moreDetailed;
            }
        })
    );

    const collection = new Collection<string, Module>();

    for (let module of modules) {
        if (module.status !== 'fulfilled')
            continue;

        collection.set(module.value.meta.name, module.value);
    }

    cout.info('Module', 'Successfully loaded ' + collection.size + ' modules(s)');
    return collection;
}

async function clientReady(client: ReadyClient): Promise<void> {
    const id = client.user.id;
    const username = client.user.username;

    cout.info('ID', id);
    cout.info('Username', username);

    const modules = await builtinModule();

    const context: Context = {
        id,
        username,
        client,
        modules
    }
}

try {
    if (!cyberOptions.bot.token.length) {
        cout.warn('Bot', 'Token not found for login.');
        process.exit(0);
    }

    const clientOptions: ClientOptions = {
        intents: cyberOptions.bot.intents.length ? cyberOptions.bot.intents : [0],
        presence: {
            status: 'online'
        }
    }

    const client = new Client(clientOptions);

    client.once('clientReady', clientReady);
    client.login(cyberOptions.bot.token);
} catch (error: unknown) {
    if (cyberOptions.system.strict) 
        cout.error('System', error);
    else {
        if (error instanceof Error)
            cout.error('System', error.message);
        else
            cout.error('System', 'Enable strict for more details.');
    }

    process.exit(1);
}
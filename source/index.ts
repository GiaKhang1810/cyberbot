import { Client, Collection, type ClientOptions } from 'discord.js';

import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Module, RequireDynamic } from './models/module.js';
import type { ModuleCollection, Context, ReadyClient } from './models/context.js';

import { cout } from './utility/cout.js';

import { cyberOptions } from '../cyberOptions.js';

const __filename = fileURLToPath(import.meta.url);
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
                const moreDetailed = new Error('Unable to load ' + name + ' module', {
                    cause: error
                });

                moreDetailed.name = name;
                cout.error('Module', moreDetailed);

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

    cout.info('Module', 'Successfully loaded ' + collection.size + ' module(s)');
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
    cout.newLine();

    if (!cyberOptions.bot.token.length) {
        cout.warn('Bot', 'Missing token.');
        process.exit(1);
    }

    const clientOptions: ClientOptions = {
        intents: cyberOptions.bot.intents.length ? cyberOptions.bot.intents : [0],
        presence: {
            status: 'online'
        }
    }

    const client = new Client(clientOptions);

    client.once('clientReady', clientReady);
    process.exit(1)
    client.login(cyberOptions.bot.token);
} catch (error: unknown) {
    cout.error('System', error);
    process.exit(2);
}
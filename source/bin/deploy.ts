import { REST, Routes } from 'discord.js';

import { join, dirname } from 'node:path';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import type { Guild } from '../models/cyberOptions.js';
import type { Meta, Module, RequireDynamic } from '../models/module.js';

import { cout } from '../utility/cout.js';

import { cyberOptions } from '../../cyberOptions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function builtinModule(): Promise<Meta[]> {
    const moduleDirPath = join(__dirname, '..', 'modules');
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
                const moreDetailed = new Error('Unable to deploy ' + name + ' module', {
                    cause: error
                });
                moreDetailed.name = name;

                cout.error('Module', moreDetailed);
                throw moreDetailed;
            }
        })
    );

    const collection: Meta[] = [];

    for (let module of modules) {
        if (module.status !== 'fulfilled')
            continue;

        collection.push(module.value.meta);
    }

    return collection;
}

async function deployment(): Promise<void> {
    cout.newLine();

    try {
        if (!cyberOptions.bot.clientID.length) {
            cout.warn('Deploy', 'Missing clientID.');
            process.exit(1);
        }

        if (!cyberOptions.bot.token.length) {
            cout.warn('Deploy', 'Missing token.');
            process.exit(1);
        }

        const collection = await builtinModule();
        const rest = new REST({ version: '10' });
        const deployGuild = cyberOptions.bot.guild
            .filter(
                (g: Guild): boolean => !!g.id.trim().length
            )
            .map(
                (g: Guild): string => g.id
            );

        rest.setToken(cyberOptions.bot.token);
        cout.info('Deploy', 'Started refreshing application (/) module(s)');

        if (deployGuild.length) {
            for (const id of deployGuild) {
                try {
                    await rest.put(
                        Routes.applicationGuildCommands(
                            cyberOptions.bot.clientID,
                            id
                        ),
                        { body: collection }
                    );

                    cout.info(
                        'Deploy',
                        'Successfully reloaded ' + collection.length + ' application (/) command(s) for guild ' + id
                    );
                } catch (error: unknown) {
                    const moreDetails = new Error('Failed to deploy application (/) commands for guild ' + id, {
                        cause: error
                    });
                    moreDetails.name = 'GUILD_' + id;
                    cout.error('Deploy', moreDetails);
                }
            }

            return;
        }

        cout.warn('Deploy', 'No guild was specified. Deploying application (/) module(s) globally.');

        await rest.put(
            Routes.applicationCommands(cyberOptions.bot.clientID), { body: collection }
        );

        cout.info('Module', 'Successfully reloaded application (/) module(s): ' + collection.length);
    } catch (error: unknown) {
        cout.error('Deploy', error);
        process.exit(1);
    } finally {
        cout.newLine();
    }
}

void deployment();
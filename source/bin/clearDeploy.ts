import { REST, Routes } from 'discord.js';

import { cout } from '../utility/cout.js';

import { cyberOptions } from '../../cyberOptions.js';

interface Module {
    id: string;
    name: string;
}

if (!cyberOptions.bot.clientID.length) {
    cout.warn('Deploy', 'Missing clientID.');
    process.exit(1);
}

if (!cyberOptions.bot.token.length) {
    cout.warn('Deploy', 'Missing token.');
    process.exit(1);
}

const clientID = cyberOptions.bot.clientID;
const token = cyberOptions.bot.token;

function readArg(name: String): string[] {
    const prefix = '--' + name + '=';
    const arg = process.argv.slice(2)
        .find(
            (v: string): boolean => v.startsWith(prefix)
        );

    if (!arg)
        return [];

    return arg
        .slice(prefix.length)
        .split(',')
        .map(
            (v: string): string => v.trim()
        )
        .filter(Boolean);
}

function scopeLabel(guild?: string): string {
    return guild ? 'GUILD_' + guild : 'global';
}

async function getModules(rest: REST, guild?: string): Promise<Module[]> {
    const path = guild
        ? Routes.applicationGuildCommands(clientID, guild)
        : Routes.applicationCommands(clientID);

    return await rest.get(path) as Module[];
}

async function clearAll(rest: REST, guild?: string): Promise<void> {
    const path = guild
        ? Routes.applicationGuildCommands(clientID, guild)
        : Routes.applicationCommands(clientID);

    await rest.put(path, {
        body: []
    });
}

async function clearSome(rest: REST, modules: string[], guild?: string): Promise<void> {
    const moduleDeployed = await getModules(rest, guild);
    const target = moduleDeployed.filter(
        (m: Module): boolean => modules.includes(m.name)
    );

    if (!target.length) {
        cout.warn('ClearDeploy', 'No matching module(s) found in ' + scopeLabel(guild));
        return;
    }

    await Promise.all(
        target.map(
            (m: Module): Promise<unknown> => {
                const path = guild
                    ? Routes.applicationGuildCommand(
                        clientID,
                        guild,
                        m.id
                    )
                    : Routes.applicationCommand(
                        clientID,
                        m.id
                    )

                return rest.delete(path);
            }
        )
    );

    cout.info('ClearDeploy', 'Removed ' + target.length + ' module(s) from ' + scopeLabel(guild) + ': ' + target.join(', '));
}

async function clearDeploy(): Promise<void> {
    cout.newLine();

    try {
        const guilds = readArg('guilds');
        const modules = readArg('modules');

        const rest = new REST({ version: '10' });
        rest.setToken(token);

        if (!guilds.length) {
            if (!modules.length) {
                cout.warn('ClearDeploy', 'No guild-id provided. Clearing all global module(s)');
                await clearAll(rest);
                cout.info('ClearDeploy', 'Cleared all global module(s)');
                return;
            }

            cout.warn('ClearDeploy', 'No guild-id provided. Removing selected global module(s): ' + modules.join(', '));
            await clearSome(rest, modules);
            return;
        }

        for (const guild of guilds) {
            if (!modules.length) {
                cout.warn('ClearDeploy', 'Clearing all module(s) for guild ' + guild);
                await clearAll(rest, guild)
                cout.info('ClearDeploy', 'Cleared all module(s) for guild ' + guild);
                continue;
            }

            cout.warn('ClearDeploy', 'Removing selected module(s) for guild ' + guild + ': ' + modules.join(', '));
            await clearSome(rest, modules, guild);
        }
    } catch (error: unknown) {
        cout.error('Deploy', error);
        process.exit(1);
    } finally {
        cout.newLine();
    }
}

void clearDeploy();
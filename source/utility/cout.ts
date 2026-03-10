import { default as moment } from 'moment-timezone';
import { chalk, type ChalkColor } from './chalk.js';

import { cyberOptions } from '../../cyberOptions.js';

export type CoutLevel =
    | 'info'
    | 'warn'
    | 'error'

export interface CoutOptions {
    json?: boolean;
    timezone?: string;
    locale?: string;
}

export interface CoutPayLoad {
    level: CoutLevel;
    head: string;
    message: unknown;
    date: string;
    timestamp: string;
}

export class Cout {
    public json: boolean;
    public timezone: string;
    public locale: string;

    private parseTZ(timezone?: string): string {
        if (!timezone)
            return (cyberOptions.system.timezone.length && moment.tz.zone(cyberOptions.system.timezone) ?
                cyberOptions.system.timezone : 'Asia/Ho_Chi_Minh');

        return (
            moment.tz.zone(timezone) ?
                timezone : cyberOptions.system.timezone.length && moment.tz.zone(cyberOptions.system.timezone) ?
                    cyberOptions.system.timezone : 'Asia/Ho_Chi_Minh'
        );
    }

    private createPayLoad(level: CoutLevel, message: unknown, head: string): CoutPayLoad {
        const now = moment().tz(this.timezone).locale(this.locale)

        return {
            level,
            head,
            message: this.normalizeMessage(message),
            date: now.format('HH:mm:ss DD/MM/YYYY'),
            timestamp: now.toISOString()
        }
    }

    private normalizeMessage(message: unknown): unknown {
        if (message instanceof Error) {
            if (this.json)
                return {
                    name: message.name,
                    message: message.message,
                    stack: message.stack,
                    cause: this.normalizeMessage(message.cause)
                }

            return message.name + ': ' + message.message;
        }

        return message;
    }

    private stringifyMessage(message: unknown): string {
        const normalized = this.normalizeMessage(message)

        if (typeof normalized === 'string')
            return normalized;

        try {
            return JSON.stringify(normalized, null, 4);
        } catch {
            return String(normalized);
        }
    }

    private write(level: CoutLevel, message: unknown, head: string): void {
        let colorLevel: ChalkColor;
        const payload = this.createPayLoad(level, message, head);

        switch (level) {
            case 'error':
                colorLevel = 'red';
                break;
            case 'warn':
                colorLevel = 'yellow';
                break;
            default:
                colorLevel = 'green';
                break;
        }

        if (this.json) {
            console.log(
                chalk.bold().fg(colorLevel).text(level.toUpperCase()) + ' ' + JSON.stringify(payload, null, 4)
            );
        } else {
            const body = this.stringifyMessage(message);

            console.log(
                chalk.fg('cyan').text(payload.date) + ' ' + chalk.fg(colorLevel).text(head) + ' ' + body
            );
        }
    }

    public constructor(options?: CoutOptions) {
        this.json = options?.json ?? cyberOptions.system.debug;
        this.timezone = this.parseTZ(options?.timezone);
        this.locale = options?.locale ? options.locale : cyberOptions.system.locale.length ? cyberOptions.system.locale : 'vi-VN';

        moment.locale(this.locale);
    }

    public extend(options?: CoutOptions): Cout {
        return new Cout({
            json: options?.json ?? this.json,
            timezone: options?.timezone ?? this.timezone,
            locale: options?.locale ?? this.locale
        });
    }

    public setJson(json: boolean): this {
        this.json = json;

        return this;
    }

    public setTZ(timezone: string): this {
        this.timezone = this.parseTZ(timezone);

        return this;
    }

    public setLocale(locale: string): this {
        this.locale = locale;
        moment.locale(locale);

        return this;
    }

    public info(head: string, message: unknown): void {
        this.write('info', message, head);
    }

    public warn(head: string, message: unknown): void {
        this.write('warn', message, head);
    }

    public error(head: string, message: unknown): void {
        this.write('error', message, head);
    }

    public newLine(lent: number = (process.stdout.columns / 2)): void {
        console.log(
            chalk.fg('blue').text('='.repeat(lent))
        );
    }
}

export const cout = new Cout();
export type ChalkColor =
    | 'black'
    | 'red'
    | 'green'
    | 'yellow'
    | 'blue'
    | 'purple'
    | 'cyan'
    | 'white'

type LIST_COLOR = Record<ChalkColor, number>;

const ESC = '\x1b'
const RESET_CODE = 0;

const FG: LIST_COLOR = {
    black: 30,
    red: 31,
    green: 32,
    yellow: 33,
    blue: 34,
    purple: 35,
    cyan: 36,
    white: 37
}

const FG_BRIGHT: LIST_COLOR = {
    black: 90,
    red: 91,
    green: 92,
    yellow: 93,
    blue: 94,
    purple: 95,
    cyan: 96,
    white: 97
}

const BG: LIST_COLOR = {
    black: 40,
    red: 41,
    green: 42,
    yellow: 43,
    blue: 44,
    purple: 45,
    cyan: 46,
    white: 47
}

const BG_BRIGHT: LIST_COLOR = {
    black: 100,
    red: 101,
    green: 102,
    yellow: 103,
    blue: 104,
    purple: 105,
    cyan: 106,
    white: 107
}

const STYLE = {
    bold: 1,
    underline: 4
}

export class Chalk {
    private readonly codes: number[];

    public constructor(codes: number[] = []) {
        this.codes = codes;
    }

    private clone(...codes: number[]): Chalk {
        return new Chalk([...this.codes, ...codes]);
    }

    private toAnsi(codes: number[]): string {
        return ESC + '[' + codes.join(';') + 'm';
    }

    public reset(): Chalk {
        return new Chalk();
    }

    public style(...codes: number[]): Chalk {
        return this.clone(...codes);
    }

    public bold(): Chalk {
        return this.clone(STYLE.bold);
    }

    public underline(): Chalk {
        return this.clone(STYLE.underline);
    }

    public fg(color: ChalkColor): Chalk {
        return this.clone(FG[color]);
    }

    public fgBright(color: ChalkColor): Chalk {
        return this.clone(FG_BRIGHT[color]);
    }

    public bg(color: ChalkColor): Chalk {
        return this.clone(BG[color]);
    }

    public bgBright(color: ChalkColor): Chalk {
        return this.clone(BG_BRIGHT[color]);
    }

    public text(value: unknown): string {
        const content = String(value);

        if (this.codes.length === 0) 
            return content;

        return this.toAnsi(this.codes) + content + this.toAnsi([RESET_CODE]);
    }

    public apply(value: unknown): string {
        return this.text(value);
    }

    public join(values: unknown[], separator: string = ' '): string {
        return values.map(value => this.text(value)).join(separator);
    }

    public lines(...values: unknown[]): string {
        return values.map(value => this.text(value)).join('\n');
    }

    public strip(value: string): string {
        return value.replace(/\x1b\[[0-9;]*m/g, '');
    }
}

export const chalk = new Chalk();
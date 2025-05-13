export let bankValue: number = 1000;
export let currentBet: number = 0;
export let wager: number = 5;
export let lastWager: number = 0;

export interface Bet {
    amt: number;
    type: string;
    odds: number;
    numbers: string;
}

export let bet: Bet[] = [];
export let numbersBet: number[] = [];
export let previousNumbers: number[] = [];

export const numRed: number[] = [
    1, 3, 5, 7, 9, 12, 14, 16, 18,
    19, 21, 23, 25, 27, 30, 32, 34, 36
];

export const wheelnumbersAC: number[] = [
    0, 26, 3, 35, 12, 28, 7, 29, 18,
    22, 9, 31, 14, 20, 1, 33, 16, 24,
    5, 10, 23, 8, 30, 11, 36, 13, 27,
    6, 34, 17, 25, 2, 21, 4, 19, 15, 32
];

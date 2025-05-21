import { Injectable } from '@angular/core';
import { BettingBoardCell } from './betting-board.model';
import { RouletteResult } from '../../interfaces/IRoulette-Net-Resultat';


@Injectable({ providedIn: 'root' })
export class RouletteNetLogic {
  bankValue = 1000;
  currentBet = 0;
  wager = 5;
  lastWager = 0;
  bet: { amt: number; type: string; odds: number; numbers: string }[] = [];
  numbersBet: number[] = [];
  previousNumbers: number[] = [];

  numRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  wheelnumbersAC = [0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 
    14, 20, 1, 33, 16, 24, 5, 10, 23, 8, 30, 11, 36, 13, 27, 6,
    34, 17, 25, 2, 21, 4, 19, 15, 32];

  resetGame() {
    this.bankValue = 1000;
    this.currentBet = 0;
    this.wager = 5;
    this.bet = [];
    this.numbersBet = [];
    this.previousNumbers = [];
  }

  clearBet() {
    this.bet = [];
    this.numbersBet = [];
  }

  setBet(cell: BettingBoardCell) {
    this.lastWager = this.wager;
    this.wager = (this.bankValue < this.wager) ? this.bankValue : this.wager;
    if (this.wager > 0) {
      this.bankValue -= this.wager;
      this.currentBet += this.wager;
      // Vérifier si la mise existe déjà
      const n = cell.numbers.join(', ');
      const t = cell.type;
      const o = cell.odds;
      let found = false;
      for (let b of this.bet) {
        if (b.numbers === n && b.type === t) {
          b.amt += this.wager;
          found = true;
          break;
        }
      }
      if (!found) {
        this.bet.push({ amt: this.wager, type: t, odds: o, numbers: n });
      }
      // Ajouter les numéros à numbersBet
      for (let num of cell.numbers) {
        if (!this.numbersBet.includes(num)) {
          this.numbersBet.push(num);
        }
      }
    }
  }

  removeBet(cell: BettingBoardCell) {
    this.wager = (this.wager === 0) ? 100 : this.wager;
    const n = cell.numbers.join(', ');
    const t = cell.type;
    for (let b of this.bet) {
      if (b.numbers === n && b.type === t) {
        if (b.amt !== 0) {
          this.wager = (b.amt > this.wager) ? this.wager : b.amt;
          b.amt -= this.wager;
          this.bankValue += this.wager;
          this.currentBet -= this.wager;
        }
      }
    }
    // Nettoyer les bets à 0
    this.bet = this.bet.filter(b => b.amt > 0);
    if (this.currentBet === 0) {
      // Optionnel : logique pour désactiver le bouton spin
    }
  }

  async spin(): Promise<RouletteResult> {
    try {
        const response = await fetch('/api/roulette/spin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to spin the roulette');
        }

        const result = await response.json();
        return result as RouletteResult;
    } catch (error) {
        console.error('Error spinning the roulette:', error);
        throw error;
    }
  }

  win(winningSpin: number): { winValue: number; betTotal: number; payout: number } {
    let winValue = 0;
    let betTotal = 0;
    for (let b of this.bet) {
      const numArray = b.numbers.split(',').map(Number);
      if (numArray.includes(winningSpin)) {
        this.bankValue += (b.odds * b.amt) + b.amt;
        winValue += b.odds * b.amt;
        betTotal += b.amt;
      }
    }
    return { winValue, betTotal, payout: winValue + betTotal };
  }

  getNumberColor(number: number): 'red' | 'black' | 'green' {
    const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    if (number === 0) return 'green';
    return RED_NUMBERS.includes(number) ? 'red' : 'black';
  }
} 
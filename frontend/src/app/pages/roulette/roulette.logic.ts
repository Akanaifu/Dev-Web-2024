import { Database, ref, get, child, set } from '@angular/fire/database';
import { NewGameService } from './new-game.service';

export class RouletteLogic {
    private db: Database;
    private newGameService: NewGameService;

    private bet: number ;
    private solde: number;

    private currentBet=0;

    private numberRed=[1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    private numberBlack=[2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
    private numberGreen=[0];
    private numberMatrix = [0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5, 10, 23, 8, 30, 11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32];

    constructor(db: Database, newGameService: NewGameService, bet: number,solde:number) {
        this.db = db;
        this.newGameService = newGameService;
        this.bet = bet;
        this.solde = solde;
    }

    

    getBet(): number {
        return this.bet;
    } 

    setBet(bet: number): void {
        this.bet = bet;
    }

    getSolde(): number {
        return this.solde;
    }
    
    setSolde(solde: number): void {
        this.solde = solde;
    }

    getCurrentBet(): number {
        return this.currentBet;
    }

    setCurrentBet(currentBet: number): void {
        this.currentBet = currentBet;
    }


}
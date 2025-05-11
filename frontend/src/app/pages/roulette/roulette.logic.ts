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
    private numberMatrix = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

    
    private startAngles = 0;
    private arc=Math.PI/(this.numberMatrix.length/2);
    

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
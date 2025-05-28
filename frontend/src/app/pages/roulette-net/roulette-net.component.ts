import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IRouletteWheelSection } from '../../interfaces/roulette-wheel.interface';
import { IBettingBoardCell } from '../../interfaces/betting-board.interface';
import { RouletteNetLogic } from './roulette-net-logic';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-roulette-net',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './roulette-net.component.html',
    styleUrls: ['./roulette-net.component.css'],
})
export class RouletteNetComponent implements OnInit {
    // Données d'affichage (plateau, roue)
    wheelSections: IRouletteWheelSection[] = [];
    outsideBets: IBettingBoardCell[] = [];
    numberBoardRows: IBettingBoardCell[][] = [];
    zeroCell!: IBettingBoardCell;
    columnBets: IBettingBoardCell[] = [];
    dozenBets: IBettingBoardCell[] = [];
    evenOddRedBlack: IBettingBoardCell[] = [];
    splitBets: IBettingBoardCell[] = [];
    cornerBets: IBettingBoardCell[] = [];
    streetBets: IBettingBoardCell[] = [];
    doubleStreetBets: IBettingBoardCell[] = [];
    
    columnLabels = ['2 à 1', '2 à 1', '2 à 1'];
    dozenLabels = ['1 à 12', '13 à 24', '25 à 36'];
    evenOddLabels = ['EVEN', 'RED', 'BLACK', 'ODD'];
    topLabels = ['1 à 18', '19 à 36'];

    // Utiliser les propriétés du service pour les jetons
    get chipValues() { return this.game.chipValues; }
    get chipColors() { return this.game.chipColors; }
    get selectedChipIndex() { return this.game.selectedChipIndex; }

    // Animation de la roue et de la bille
    ballRotation : number = 0;
    
    // Utiliser la propriété isSpinning du service
    get isSpinning() { return this.game.isSpinning; }
    set isSpinning(value: boolean) { this.game.isSpinning = value; }
    
    resultMessage: string | null = null;
    
    private BASE_URL = 'http://localhost:3000';

    constructor(
        public game: RouletteNetLogic,
        private http: HttpClient
    ) { }

    // Accès à l'état du jeu via le service
    get currentBet() { return this.game.currentBet; }
    get wager() { return this.game.wager; }
    get bet() { return this.game.bet; }
    get numbersBet() { return this.game.numbersBet; }
    get previousNumbers() { return this.game.previousNumbers; }
    get numRed() { return this.game.numRed; }

    ngOnInit(): void {//prepare le plateau de jeu
        this.prepareWheelSections();
        this.loadBettingBoard();
    }

    prepareWheelSections() { // Prépare les sections de la roue
        const numbers = this.game.getWheelNumbers();
        this.wheelSections = numbers.map((num, i) => {
            let color: 'red' | 'black' | 'green' = 'black';
            let backgroundColor = this.game.getSectionColor(num);
            return {
                number: num,
                color,
                angle: i * 9.73,
                backgroundColor
            };
        });
    }
    
    // Chargement du tableau de mise depuis l'API
    loadBettingBoard() {
        this.http.get<any>(`${this.BASE_URL}/api/roulette-odds/betting-board`).subscribe({
            next: (data) => {
                this.outsideBets = data.outsideBets;
                this.numberBoardRows = data.numberBoardRows;
                this.zeroCell = data.zeroCell;
                this.columnBets = data.columnBets;
                this.dozenBets = data.dozenBets;
                this.evenOddRedBlack = data.evenOddRedBlack;
                this.splitBets = data.splitBets;
                this.cornerBets = data.cornerBets;
                this.streetBets = data.streetBets;
                this.doubleStreetBets = data.doubleStreetBets;
            },
            error: (error) => {
                console.error('Erreur lors du chargement du tableau de mise:', error);
                // Fallback à la méthode locale en cas d'échec
            }
        });
    }
    

    removeBet(event: Event, cell: IBettingBoardCell) {// Supprimer une mise
        event.preventDefault();
        if (this.isSpinning) return; // Prevent bet removal when spinning
        this.game.removeBet(cell);
    }

    resetGame() {// Réinitialiser le jeu
        if (this.isSpinning) return; // Prevent reset when spinning
        this.game.resetGame();
    }
    
    async spin() {// Lancer la roue
        if (this.isSpinning) return;
        this.isSpinning = true;

        try {
            const result = await this.game.spin();
            // Animation de la bille
            this.ballRotation = 0;
            const numbers = this.game.getWheelNumbers();
            const index = numbers.indexOf(result.number);
            const baseAngle = 360 - index * 9.73;
            const extraTurns = 5 * 360;
            const targetBall = -baseAngle - extraTurns * 1.2;
            const duration = 5000;
            const initialBall = this.ballRotation;
            const start = performance.now();
            
            const animate = (now: number) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                this.ballRotation = initialBall + (targetBall - initialBall) * progress;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Animation terminée
                    this.resultMessage = `Le numéro gagnant est ${result.number} ${result.color}`;
                    
                    // Mettre à jour les résultats précédents
                    this.game.previousNumbers.unshift(result.number);
                    if (this.game.previousNumbers.length > 10) {
                        this.game.previousNumbers.pop();
                    }
                    
                    // Calculer les gains
                    const winResult = this.game.win(result.number);
                    
                    // Afficher les gains
                    winResult.then(result => {
                        if (result.winValue > 0) {
                            this.resultMessage += ` - Vous avez gagné ${result.payout}!`;
                        } else {
                            this.resultMessage += ` - Vous avez perdu ${this.game.currentBet}`;
                        }
                        console.error('Error during spin:', winResult);
                    this.game.currentBet = 0;
                    this.game.bet = [];
                    this.game.numbersBet = [];
                    
                    // Reset spinning state à allow new bets
                    this.isSpinning = false;
                    });  
                }
            };
            
            requestAnimationFrame(animate);
        } catch (error) {
            console.error('Error during spin:', error);
            this.resultMessage = 'Une erreur est survenue';
            this.isSpinning = false; // Make sure à reset on error too
        }
    }

    selectChip(index: number) {// Sélectionner une mise
        this.game.selectChip(index);
    }

    // Méthodes d'affichage qui délèguent au service
    getBetForCell(cell: IBettingBoardCell) {
        return this.game.getBetForCell(cell);
    }

    getChipColorClass(amount: number): string {
        return this.game.getChipColorClass(amount);
    }

    // Méthodes UI qui délèguent au service
    setBet(cell: IBettingBoardCell) {
        if (this.isSpinning) return; // Prevent betting when spinning
        this.game.setBet(cell);
    }
}




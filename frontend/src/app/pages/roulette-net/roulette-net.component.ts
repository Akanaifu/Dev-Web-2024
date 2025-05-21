import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouletteWheelSection } from './roulette-wheel.model';
import { BettingBoardCell } from './betting-board.model';
import { RouletteNetLogic } from './roulette-net-logic';

@Component({
    selector: 'app-roulette-net',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './roulette-net.component.html',
    styleUrls: ['./roulette-net.component.css'],
})
export class RouletteNetComponent implements OnInit {
    // Données d'affichage (plateau, roue)
    wheelSections: RouletteWheelSection[] = [];
    outsideBets: BettingBoardCell[] = [];
    numberBoardRows: BettingBoardCell[][] = [];
    zeroCell!: BettingBoardCell;
    columnBets: BettingBoardCell[] = [];
    dozenBets: BettingBoardCell[] = [];
    evenOddRedBlack: BettingBoardCell[] = [];
    splitBets: BettingBoardCell[] = [];
    cornerBets: BettingBoardCell[] = [];
    streetBets: BettingBoardCell[] = [];
    doubleStreetBets: BettingBoardCell[] = [];
    
    columnLabels = ['2 to 1', '2 to 1', '2 to 1'];
    dozenLabels = ['1 to 12', '13 to 24', '25 to 36'];
    evenOddLabels = ['EVEN', 'RED', 'BLACK', 'ODD'];
    topLabels = ['1 to 18', '19 to 36'];
    chipValues = [1, 5, 10, 100, 'clear'];
    chipColors = ['red', 'blue', 'orange', 'gold', 'clearBet'];
    selectedChipIndex = 1; // Par défaut, 5 est actif

    // Animation de la roue et de la bille
    ballRotation : number = 0;
    isSpinning : boolean = false;
    resultMessage: string | null = null;

    constructor(public game: RouletteNetLogic) { }

    // Accès à l'état du jeu via le service
    get bankValue() { return this.game.bankValue; }
    get currentBet() { return this.game.currentBet; }
    get wager() { return this.game.wager; }
    get bet() { return this.game.bet; }
    get numbersBet() { return this.game.numbersBet; }
    get previousNumbers() { return this.game.previousNumbers; }
    get numRed() { return this.game.numRed; }

    ngOnInit(): void {//prepare le plateau de jeu
        this.prepareWheelSections();
        this.prepareBettingBoard();
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

    prepareBettingBoard() {// Prépare le tableau de mise
        this.outsideBets = [
            { label: '1 to 18', numbers: Array.from({length: 18}, (_, i) => i + 1), type: 'outside_low', odds: 1 },
            { label: '19 to 36', numbers: Array.from({length: 18}, (_, i) => i + 19), type: 'outside_high', odds: 1 }
        ];

        // Plateau principal (3 colonnes x 12 lignes), [1,2,3] en haut, [34,35,36] en bas
        this.numberBoardRows = [];
        for (let row = 0; row < 12; row++) {
            const line: BettingBoardCell[] = [];
            for (let col = 0; col < 3; col++) {
                const num = row * 3 + col + 1;
                line.push({
                    label: num.toString(),
                    numbers: [num],
                    type: 'inside_whole',
                    odds: 35
                });
            }
            this.numberBoardRows.push(line);
        }
        this.zeroCell = { label: '0', numbers: [0], type: 'zero', odds: 35 };

        // Colonnes (2 to 1)
        this.columnBets = [
            { label: '2 to 1', numbers: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36], type: 'outside_column', odds: 2 },
            { label: '2 to 1', numbers: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35], type: 'outside_column', odds: 2 },
            { label: '2 to 1', numbers: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34], type: 'outside_column', odds: 2 }
        ];

        // Douzaines
        this.dozenBets = [
            { label: '1 to 12', numbers: Array.from({length: 12}, (_, i) => i + 1), type: 'outside_dozen', odds: 2 },
            { label: '13 to 24', numbers: Array.from({length: 12}, (_, i) => i + 13), type: 'outside_dozen', odds: 2 },
            { label: '25 to 36', numbers: Array.from({length: 12}, (_, i) => i + 25), type: 'outside_dozen', odds: 2 }
        ];

        // Even/Odd, Red/Black
        this.evenOddRedBlack = [
            { label: 'EVEN', numbers: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36], type: 'outside_oerb', odds: 1 },
            { label: 'RED', numbers: this.numRed, type: 'outside_oerb', odds: 1 },
            { label: 'BLACK', numbers: this.numberBoardRows.flat().filter(nb => !this.numRed.includes(nb.numbers[0]) && nb.numbers[0] !== 0).map(nb => nb.numbers[0]), type: 'outside_oerb', odds: 1 },
            { label: 'ODD', numbers: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35], type: 'outside_oerb', odds: 1 }
        ];

        // Splits (cases entre 2 numéros)
        this.splitBets = [];
        for (let row = 0; row < 12; row++) {
            for (let col = 1; col <= 3; col++) {
                const n = row * 3 + col;
                // Split horizontal (ex: 1-2, 2-3)
                if (col < 3) {
                    this.splitBets.push({
                        label: `${n}-${n+1}`,
                        numbers: [n, n+1],
                        type: 'split',
                        odds: 17
                    });
                }
                // Split vertical (ex: 1-4, 2-5, 3-6)
                if (row < 11) {
                    this.splitBets.push({
                        label: `${n}-${n+3}`,
                        numbers: [n, n+3],
                        type: 'split',
                        odds: 17
                    });
                }
            }
        }

        // Corners (cases entre 4 numéros)
        this.cornerBets = [];
        for (let row = 0; row < 11; row++) {
            for (let col = 1; col <= 2; col++) {
                const n = row * 3 + col;
                this.cornerBets.push({
                    label: `${n},${n+1},${n+3},${n+4}`,
                    numbers: [n, n+1, n+3, n+4],
                    type: 'corner',
                    odds: 8
                });
            }
        }

        // Streets (lignes de 3 numéros)
        this.streetBets = [];
        for (let row = 0; row < 12; row++) {
            const n = row * 3 + 1;
            this.streetBets.push({
                label: `${n},${n+1},${n+2}`,
                numbers: [n, n+1, n+2],
                type: 'street',
                odds: 11
            });
        }

        // Double streets (lignes de 6 numéros)
        this.doubleStreetBets = [];
        for (let row = 0; row < 11; row++) {
            const n = row * 3 + 1;
            this.doubleStreetBets.push({
                label: `${n},${n+1},${n+2},${n+3},${n+4},${n+5}`,
                numbers: [n, n+1, n+2, n+3, n+4, n+5],
                type: 'double_street',
                odds: 5
            });
        }
    }



    removeBet(event: Event, cell: BettingBoardCell) {// Supprimer une mise
        event.preventDefault();
        this.game.removeBet(cell);
    }

    resetGame() {// Réinitialiser le jeu
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
                    this.isSpinning = false;
                    // Calcul du gain
                    const winResult = this.game.win(result.number);
                    // Affichage du résultat/gain
                    let msg = `Numéro gagnant : ${result.number} (${result.color})`;
                    if (winResult.winValue > 0) {
                        msg += ` — Vous gagnez ${winResult.payout} !`;
                    } else {
                        msg += ` — Perdu !`;
                    }
                    this.resultMessage = msg;
                    setTimeout(() => { this.resultMessage = null; }, 5000);
                    this.game.currentBet = 0;
                    // Vide les mises pour faire disparaître les jetons
                    this.game.bet = [];
                }
            };

            requestAnimationFrame(animate);
        } catch (error) {
            console.error('Error during spin:', error);
            this.isSpinning = false;
            this.resultMessage = "Erreur lors du spin. Veuillez réessayer.";
            setTimeout(() => { this.resultMessage = null; }, 5000);
        }
    }

    selectChip(index: number) {// Sélectionner une mise
        if (index !== 4) {
            this.selectedChipIndex = index;
            this.game.wager = Number(this.chipValues[index]);
        } else {
            // clear
            this.game.bankValue += this.game.currentBet;
            this.game.currentBet = 0;
            this.game.clearBet();
        }
    }

    // Méthodes d'affichage qui délèguent au service
    getBetForCell(cell: BettingBoardCell) {
        return this.game.getBetForCell(cell);
    }

    getChipColorClass(amount: number): string {
        return this.game.getChipColorClass(amount);
    }

    // Méthodes UI qui délèguent au service
    setBet(cell: BettingBoardCell) {
        this.game.setBet(cell);
    }
}




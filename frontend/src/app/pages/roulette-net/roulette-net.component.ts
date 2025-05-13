import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouletteWheelSection } from './roulette-wheel.model';
import { BettingBoardCell } from './betting-board.model';
import { RouletteGameService } from './roulette-game.service';

@Component({
    selector: 'app-roulette-net',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './roulette-net.component.html',
    styleUrls: ['./roulette-net.component.css']
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
    numRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    columnLabels = ['2 to 1', '2 to 1', '2 to 1'];
    dozenLabels = ['1 to 12', '13 to 24', '25 to 36'];
    evenOddLabels = ['EVEN', 'RED', 'BLACK', 'ODD'];
    topLabels = ['1 to 18', '19 to 36'];

    // Accès à l'état du jeu via le service
    get bankValue() { return this.game.bankValue; }
    get currentBet() { return this.game.currentBet; }
    get wager() { return this.game.wager; }
    get bet() { return this.game.bet; }
    get numbersBet() { return this.game.numbersBet; }
    get previousNumbers() { return this.game.previousNumbers; }

    constructor(public game: RouletteGameService) { }

    ngOnInit(): void {
        this.prepareWheelSections();
        this.prepareBettingBoard();
    }

    prepareWheelSections() {
        const numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
        this.wheelSections = numbers.map((num, i) => {
            let color: 'red' | 'black' | 'green' = 'black';
            let backgroundColor = '#000';
            if (num === 0) { color = 'green'; backgroundColor = '#016D29'; }
            else if (this.numRed.includes(num)) { color = 'red'; backgroundColor = '#E0080B'; }
            return {
                number: num,
                color,
                angle: i * 9.73,
                backgroundColor
            };
        });
    }

    prepareBettingBoard() {
        // Outside bets (1-18, 19-36)
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
            this.numberBoardRows.push(line); // ligne du haut en premier
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

    // Méthodes UI qui délèguent au service
    setBet(cell: BettingBoardCell) {
        this.game.setBet(cell);
    }

    removeBet(event: Event, cell: BettingBoardCell) {
        event.preventDefault();
        this.game.removeBet(cell);
    }

    resetGame() {
        this.game.resetGame();
    }
    
    spin() {
        const winningSpin = this.game.spin();
        // Gérer l'affichage du résultat, animation, etc. (à compléter)
        const result = this.game.win(winningSpin);
        // Gérer l'affichage du gain, etc. (à compléter)
    }

    // Autres méthodes à migrer...

    // Ajouté pour le template HTML
    getWheelNumbers(): number[] {
        // Ordre des numéros sur la roue européenne
        return [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
    }

    getSectionColor(number: number): string {
        if (number === 0) return '#016D29'; // vert
        if (this.numRed.includes(number)) return '#E0080B'; // rouge
        return '#000'; // noir
    }
}


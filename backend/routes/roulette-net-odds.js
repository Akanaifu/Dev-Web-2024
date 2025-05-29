const express = require("express");
const router = express.Router();

// Numéros rouges de la roulette
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

// Fonction qui prépare le tableau de mise
function prepareBettingBoard() {
    const result = {};
    
    // Outside bets (1-18, 19-36)
    result.outsideBets = [
        { label: '1 à 18', numbers: Array.from({length: 18}, (_, i) => i + 1), type: 'outside_low', odds: 1 },
        { label: '19 à 36', numbers: Array.from({length: 18}, (_, i) => i + 19), type: 'outside_high', odds: 1 }
    ];

    // Plateau principal (3 colonnes x 12 lignes), [1,2,3] en haut, [34,35,36] en bas
    result.numberBoardRows = [];
    for (let row = 0; row < 12; row++) {
        const line = [];
        for (let col = 0; col < 3; col++) {
            const num = row * 3 + col + 1;
            line.push({
                label: num.toString(),
                numbers: [num],
                type: 'inside_whole',
                odds: 35
            });
        }
        result.numberBoardRows.push(line);
    }
    result.zeroCell = { label: '0', numbers: [0], type: 'zero', odds: 35 };

    // Colonnes (2 à 1)
    result.columnBets = [
        { label: '2 à 1', numbers: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36], type: 'outside_column', odds: 2 },
        { label: '2 à 1', numbers: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35], type: 'outside_column', odds: 2 },
        { label: '2 à 1', numbers: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34], type: 'outside_column', odds: 2 }
    ];

    // Douzaines
    result.dozenBets = [
        { label: '1 à 12', numbers: Array.from({length: 12}, (_, i) => i + 1), type: 'outside_dozen', odds: 2 },
        { label: '13 à 24', numbers: Array.from({length: 12}, (_, i) => i + 13), type: 'outside_dozen', odds: 2 },
        { label: '25 à 36', numbers: Array.from({length: 12}, (_, i) => i + 25), type: 'outside_dozen', odds: 2 }
    ];

    // Even/Odd, Red/Black
    const allNumbers = result.numberBoardRows.flat();
    result.evenOddRedBlack = [
        { label: 'EVEN', numbers: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36], type: 'outside_oerb', odds: 1 },
        { label: 'RED', numbers: RED_NUMBERS, type: 'outside_oerb', odds: 1 },
        { label: 'BLACK', numbers: allNumbers.filter(nb => !RED_NUMBERS.includes(nb.numbers[0]) && nb.numbers[0] !== 0).map(nb => nb.numbers[0]), type: 'outside_oerb', odds: 1 },
        { label: 'ODD', numbers: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35], type: 'outside_oerb', odds: 1 }
    ];

    // Splits (cases entre 2 numéros)
    result.splitBets = [];
    for (let row = 0; row < 12; row++) {
        for (let col = 1; col <= 3; col++) {
            const n = row * 3 + col;
            // Split horizontal (ex: 1-2, 2-3)
            if (col < 3) {
                result.splitBets.push({
                    label: `${n}-${n+1}`,
                    numbers: [n, n+1],
                    type: 'split',
                    odds: 17
                });
            }
            // Split vertical (ex: 1-4, 2-5, 3-6)
            if (row < 11) {
                result.splitBets.push({
                    label: `${n}-${n+3}`,
                    numbers: [n, n+3],
                    type: 'split',
                    odds: 17
                });
            }
        }
    }

    // Corners (cases entre 4 numéros)
    result.cornerBets = [];
    for (let row = 0; row < 11; row++) {
        for (let col = 1; col <= 2; col++) {
            const n = row * 3 + col;
            result.cornerBets.push({
                label: `${n},${n+1},${n+3},${n+4}`,
                numbers: [n, n+1, n+3, n+4],
                type: 'corner',
                odds: 8
            });
        }
    }

    // Streets (lignes de 3 numéros)
    result.streetBets = [];
    for (let row = 0; row < 12; row++) {
        const n = row * 3 + 1;
        result.streetBets.push({
            label: `${n},${n+1},${n+2}`,
            numbers: [n, n+1, n+2],
            type: 'street',
            odds: 11
        });
    }

    // Double streets (lignes de 6 numéros)
    result.doubleStreetBets = [];
    for (let row = 0; row < 11; row++) {
        const n = row * 3 + 1;
        result.doubleStreetBets.push({
            label: `${n},${n+1},${n+2},${n+3},${n+4},${n+5}`,
            numbers: [n, n+1, n+2, n+3, n+4, n+5],
            type: 'double_street',
            odds: 5
        });
    }

    return result;
}

// Endpoint pour récupérer le plateau de mise
router.get('/betting-board', (req, res) => {
    const bettingBoard = prepareBettingBoard();
    res.json(bettingBoard);
});

module.exports = {
    router,
    prepareBettingBoard // Exporter la fonction pour l'utiliser ailleurs si nécessaire
}; 
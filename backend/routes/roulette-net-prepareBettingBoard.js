const express = require("express");
const router = express.Router();

// Configuration des numéros rouges selon les règles standard de la roulette européenne
// Cette constante définit la répartition des couleurs sur la roue de roulette
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

/**
 * Génère la configuration complète du plateau de roulette avec tous les types de mises possibles.
 * Cette fonction crée dynamiquement toutes les zones de mise avec leurs cotes respectives.
 */
function prepareBettingBoard() {
    const result = {};
    
    // Configuration des mises externes simples (1-18, 19-36) avec cote 2:1
    // Ces paris couvrent chacun 18 numéros et offrent un gain égal à la mise
    result.outsideBets = [
        { label: '1 à 18', numbers: Array.from({length: 18}, (_, i) => i + 1), type: 'outside_low', odds: 2 },
        { label: '19 à 36', numbers: Array.from({length: 18}, (_, i) => i + 19), type: 'outside_high', odds: 2 }
    ];

    // Construction du plateau principal en grille 3x12 représentant les numéros 1 à 36
    // Chaque cellule correspond à un numéro unique avec une mise pleine (cote 36:1)
    result.numberBoardRows = [];
    for (let row = 0; row < 12; row++) {
        const line = [];
        for (let col = 0; col < 3; col++) {
            const num = row * 3 + col + 1;
            line.push({
                label: num.toString(),
                numbers: [num],
                type: 'inside_whole',
                odds: 36
            });
        }
        result.numberBoardRows.push(line);
    }
    
    // Cellule spéciale pour le zéro avec les mêmes caractéristiques qu'un numéro plein
    // Le zéro est traité séparément car il a une position particulière sur le plateau
    result.zeroCell = { label: '0', numbers: [0], type: 'zero', odds: 36 };

    // Configuration des colonnes (2 à 1) - chaque colonne contient 12 numéros avec cote 3:1
    // Les colonnes suivent la disposition verticale du plateau de roulette
    result.columnBets = [
        { label: '2 à 1', numbers: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36], type: 'outside_column', odds: 3 },
        { label: '2 à 1', numbers: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35], type: 'outside_column', odds: 3 },
        { label: '2 à 1', numbers: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34], type: 'outside_column', odds: 3 }
    ];

    // Configuration des douzaines (1-12, 13-24, 25-36) avec cote 3:1
    // Chaque douzaine couvre 12 numéros consécutifs et offre un gain de 2 fois la mise
    result.dozenBets = [
        { label: '1 à 12', numbers: Array.from({length: 12}, (_, i) => i + 1), type: 'outside_dozen', odds: 3 },
        { label: '13 à 24', numbers: Array.from({length: 12}, (_, i) => i + 13), type: 'outside_dozen', odds: 3 },
        { label: '25 à 36', numbers: Array.from({length: 12}, (_, i) => i + 25), type: 'outside_dozen', odds: 3 }
    ];

    // Configuration des paris sur les chances simples (pair/impair, rouge/noir)
    // Ces mises couvrent 18 numéros chacune et paient à égalité (cote 2:1)
    const allNumbers = result.numberBoardRows.flat();
    result.evenOddRedBlack = [
        { label: 'EVEN', numbers: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36], type: 'outside_oerb', odds: 2 },
        { label: 'RED', numbers: RED_NUMBERS, type: 'outside_oerb', odds: 2 },
        { label: 'BLACK', numbers: allNumbers.filter(nb => !RED_NUMBERS.includes(nb.numbers[0]) && nb.numbers[0] !== 0).map(nb => nb.numbers[0]), type: 'outside_oerb', odds: 2 },
        { label: 'ODD', numbers: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35], type: 'outside_oerb', odds: 2 }
    ];

    // Génération automatique des mises à cheval (split) entre numéros adjacents
    // Ces paris couvrent 2 numéros avec une cote de 18:1
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
                    odds: 18
                });
            }
            // Split vertical (ex: 1-4, 2-5, 3-6)
            if (row < 11) {
                result.splitBets.push({
                    label: `${n}-${n+3}`,
                    numbers: [n, n+3],
                    type: 'split',
                    odds: 18
                });
            }
        }
    }

    // Génération des carrés (corner bets) couvrant 4 numéros adjacents
    // Ces mises offrent une cote de 9:1 et sont placées aux intersections du plateau
    result.cornerBets = [];
    for (let row = 0; row < 11; row++) {
        for (let col = 1; col <= 2; col++) {
            const n = row * 3 + col;
            result.cornerBets.push({
                label: `${n},${n+1},${n+3},${n+4}`,
                numbers: [n, n+1, n+3, n+4],
                type: 'corner',
                odds: 9
            });
        }
    }

    // Configuration des transversales (street) couvrant une ligne de 3 numéros
    // Ces mises horizontales offrent une cote de 12:1
    result.streetBets = [];
    for (let row = 0; row < 12; row++) {
        const n = row * 3 + 1;
        result.streetBets.push({
            label: `${n},${n+1},${n+2}`,
            numbers: [n, n+1, n+2],
            type: 'street',
            odds: 12
        });
    }

    // Configuration des sixains (double street) couvrant 2 lignes de 3 numéros
    // Ces mises couvrent 6 numéros consécutifs avec une cote de 6:1
    result.doubleStreetBets = [];
    for (let row = 0; row < 11; row++) {
        const n = row * 3 + 1;
        result.doubleStreetBets.push({
            label: `${n},${n+1},${n+2},${n+3},${n+4},${n+5}`,
            numbers: [n, n+1, n+2, n+3, n+4, n+5],
            type: 'double_street',
            odds: 6
        });
    }

    return result;
}

/**
 * Endpoint API qui retourne la configuration complète du plateau de roulette.
 * Cette route permet au frontend de récupérer toutes les zones de mise disponibles.
 */
router.get('/betting-board', (req, res) => {
    const bettingBoard = prepareBettingBoard();
    res.json(bettingBoard);
});

module.exports = {
    router,
    prepareBettingBoard // Exporter la fonction pour l'utiliser ailleurs si nécessaire
}; 
const express = require("express");
const router = express.Router();
const db = require("../config/dbConfig");
const { updateUserSolde } = require("./update_solde");

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

function getNumberColor(number) {// Retourner la couleur du numéro
    if (number === 0) return 'green';
    return RED_NUMBERS.includes(number) ? 'red' : 'black';
}

// Fonction win() déplacée depuis le frontend
function win(winningSpin, bets, solde, winValue = 0, payout = 0, betTotal = 0) {// Calculer les gains
    let newsolde = solde;
    let betLose = 0;
    const winColor = getNumberColor(winningSpin);
    const isEven = winningSpin !== 0 && winningSpin % 2 === 0;
    
    // Définir les colonnes
    const firstColumn = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
    const secondColumn = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
    const thirdColumn = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
    
    for (let b of bets) {
        const numArray = b.numbers.split(',').map(Number);
        let isWin = false;
        
        // Vérification directe par numéro
        if (numArray.includes(winningSpin)) {
            isWin = true;
        } 
        // Vérification par label (pour les paris spéciaux)
        else if (b.label) {
            if (b.label === 'RED' && winColor === 'red') isWin = true;
            else if (b.label === 'BLACK' && winColor === 'black') isWin = true;
            else if (b.label === 'EVEN' && isEven) isWin = true;
            else if (b.label === 'ODD' && !isEven && winningSpin !== 0) isWin = true;
            else if (b.label === '1 à 18' && winningSpin >= 1 && winningSpin <= 18) isWin = true;
            else if (b.label === '19 à 36' && winningSpin >= 19 && winningSpin <= 36) isWin = true;
            else if (b.label === '1 à 12' && winningSpin >= 1 && winningSpin <= 12) isWin = true;
            else if (b.label === '13 à 24' && winningSpin >= 13 && winningSpin <= 24) isWin = true;
            else if (b.label === '25 à 36' && winningSpin >= 25 && winningSpin <= 36) isWin = true;
            // Colonnes (2 à 1)
            else if (b.label === '2 à 1' && b.type === 'outside_column') {
                // Vérifier dans quelle colonne se trouve le numéro gagnant
                if (firstColumn.includes(winningSpin) && numArray.every(n => firstColumn.includes(n))) isWin = true;
                else if (secondColumn.includes(winningSpin) && numArray.every(n => secondColumn.includes(n))) isWin = true; 
                else if (thirdColumn.includes(winningSpin) && numArray.every(n => thirdColumn.includes(n))) isWin = true;
            }
        }
        
        if (isWin) {
            winValue += b.odds * b.amt;
        }else{
            betLose += b.amt;
        }
        betTotal += b.amt;
    }
    payout = winValue - betLose;
    newsolde += payout;
    return { 
        winValue: winValue, 
        payout: payout,
        newsolde: newsolde,
        betTotal: betTotal
    };
}

router.post('/spin', (req, res) => { //Renvoie un numéro aléatoire entre 0 et 36
    const number = Math.floor(Math.random() * 37); // 0-36
    const color = getNumberColor(number);
    
    res.json({ number, color });
});

// Nouvel endpoint pour calculer les gains
router.post('/win', (req, res) => {
    const { winningSpin, bets, solde } = req.body;
    const userId = req.body.userId;
    
    if (winningSpin === undefined || !Array.isArray(bets) || solde === undefined) {
        return res.status(400).json({ 
            message: "Données invalides. Veuillez fournir un numéro gagnant, des mises et la valeur de la banque." 
        });
    }
    
    // Appel de win avec les paramètres initialisés à 0
    const result = win(winningSpin, bets, solde, 0, 0);
    
    // Si l'utilisateur est connecté, mettre à jour son solde dans la base de données
    if (userId) {
        updateUserSolde(userId, result.newsolde)
            .catch(err => {
                console.error("Échec de la mise à jour du solde:", err);
            });
    }
    
    res.json(result);
});

module.exports = router;
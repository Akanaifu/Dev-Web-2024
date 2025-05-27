const express = require("express");
const router = express.Router();
const db = require("../config/dbConfig");

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

function getNumberColor(number) {// Retourner la couleur du numéro
    if (number === 0) return 'green';
    return RED_NUMBERS.includes(number) ? 'red' : 'black';
}

// Fonction win() déplacée depuis le frontend
function win(winningSpin, bets, solde) {// Calculer les gains
    let winValue;
    let betTotal;
    let newsolde = solde;
    
    for (let b of bets) {
        const numArray = b.numbers.split(',').map(Number);
        if (numArray.includes(winningSpin)) {
            newsolde += (b.odds * b.amt) + b.amt;
            winValue += b.odds * b.amt;
            betTotal += b.amt;
        }
    }
    
    return { 
        winValue, 
        betTotal, 
        payout: winValue + betTotal,
        newsolde 
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
    
    const result = win(winningSpin, bets, solde);
    
    // Si l'utilisateur est connecté, mettre à jour son solde dans la base de données
    if (userId) {
        db.query(
            "UPDATE user SET solde = ? WHERE user_id = ?",
            [result.newsolde, userId],
            (err, dbResult) => {
                if (err) {
                    console.error("Erreur lors de la mise à jour du solde:", err);
                    // On continue quand même pour renvoyer le résultat
                }
                console.log(`Solde mis à jour pour l'utilisateur ${userId}: ${result.newsolde}`);
            }
        );
    }
    
    res.json(result);
});

module.exports = router;
const express = require("express");
const router = express.Router();
const db = require("../config/dbConfig");

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

function getNumberColor(number) {// Retourner la couleur du numéro
    if (number === 0) return 'green';
    return RED_NUMBERS.includes(number) ? 'red' : 'black';
}

// Fonction win() déplacée depuis le frontend
async function win(winningSpin, bets, solde, userId, winValue = 0, payout = 0, betTotal = 0) {// Calculer les gains
    console.log(`[WIN CALCULATION] 🎰 Début du calcul des gains pour l'utilisateur ${userId}`);
    console.log(`[WIN CALCULATION] Numéro gagnant: ${winningSpin}, Solde initial: ${solde}`);
    console.log(`[WIN CALCULATION] Nombre de mises: ${bets.length}`);
    
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
            const gain = b.odds * b.amt;
            winValue += gain;
            console.log(`[WIN CALCULATION] ✅ Mise gagnante: ${b.label || b.numbers} - Mise: ${b.amt}, Gain: ${gain}`);
        }else{
            betLose += b.amt;
            console.log(`[WIN CALCULATION] ❌ Mise perdante: ${b.label || b.numbers} - Mise perdue: ${b.amt}`);
        }
        betTotal += b.amt;
    }
    payout = winValue - betLose;
    newsolde += payout;
    
    console.log(`[WIN CALCULATION] 📊 Résumé des gains:`);
    console.log(`[WIN CALCULATION] - Total des gains: ${winValue}`);
    console.log(`[WIN CALCULATION] - Total des pertes: ${betLose}`);
    console.log(`[WIN CALCULATION] - Total des mises: ${betTotal}`);
    console.log(`[WIN CALCULATION] - Payout net: ${payout}`);
    console.log(`[WIN CALCULATION] - Nouveau solde calculé: ${solde} → ${newsolde}`);
    console.log(`[WIN CALCULATION] 🔧 DEBUG: Après calculs, avant mise à jour en base`);
    
    // Mettre à jour le solde en base de données
    console.log(`[WIN CALCULATION] 🔍 Vérification userId pour mise à jour en base: ${userId} (type: ${typeof userId})`);
    if (userId) {
        try {
            console.log(`[WIN CALCULATION] 🔄 Mise à jour du solde en base de données...`);
            const [result] = await db.query(
                "UPDATE user SET solde = ? WHERE user_id = ?",
                [newsolde, userId]
            );
            console.log(`[WIN CALCULATION] 📊 Résultat de la requête UPDATE:`, result);
            console.log(`[WIN CALCULATION] ✅ Solde mis à jour en base de données pour l'utilisateur ${userId}: ${newsolde}`);
        } catch (err) {
            console.error(`[WIN CALCULATION] ❌ Erreur lors de la mise à jour du solde en base:`, err);
        }
    } else {
        console.log(`[WIN CALCULATION] ⚠️ Pas de userId fourni, pas de mise à jour en base de données`);
    }
    
    console.log(`[WIN CALCULATION] 🏁 Fin de la fonction win, return des résultats`);
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
router.post('/win', async (req, res) => {
    const { winningSpin, bets, solde } = req.body;
    const userId = req.body.userId;
    
    console.log(`[ROULETTE WIN] 🎯 Nouvelle demande de calcul de gains`);
    console.log(`[ROULETTE WIN] UserId: ${userId}, Numéro gagnant: ${winningSpin}, Solde: ${solde}`);
    
    if (winningSpin === undefined || !Array.isArray(bets) || solde === undefined) {
        console.log(`[ROULETTE WIN] ❌ Données invalides reçues`);
        return res.status(400).json({ 
            message: "Données invalides. Veuillez fournir un numéro gagnant, des mises et la valeur de la banque." 
        });
    }
    
    try {
        // Appel de win avec les paramètres initialisés à 0 et en passant userId
        const result = await win(winningSpin, bets, solde, userId, 0, 0, 0);
        
        console.log(`[ROULETTE WIN] ✅ Calcul terminé, envoi de la réponse:`, result);
        res.json(result);
    } catch (error) {
        console.error(`[ROULETTE WIN] ❌ Erreur lors du calcul des gains:`, error);
        res.status(500).json({ 
            message: "Erreur lors du calcul des gains" 
        });
    }
});

module.exports = router;
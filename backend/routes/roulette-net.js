const express = require("express");
const router = express.Router();
const db = require("../config/dbConfig");

// Configuration des numéros rouges selon les règles standard de la roulette européenne
// Cette constante détermine la couleur de chaque numéro pour les calculs de gains sur les paris couleur
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

/**
 * Détermine la couleur d'un numéro selon les règles de la roulette européenne.
 * Cette fonction est utilisée pour valider les paris sur rouge/noir lors du calcul des gains.
 */
function getNumberColor(number) {
    if (number === 0) return 'green';
    return RED_NUMBERS.includes(number) ? 'red' : 'black';
}

/**
 * Fonction principale de calcul des gains et pertes pour un spin de roulette.
 * Cette logique métier centralise tous les calculs et met à jour directement la base de données.
 */
async function win(winningSpin, bets, solde, userId, winValue = 0, payout = 0, betTotal = 0) {
    // Logs d'initialisation pour tracer le début de chaque calcul de gains
    // Ces console.log permettent de suivre précisément chaque session de jeu et d'identifier les problèmes
    console.log(`[WIN CALCULATION] 🎰 Début du calcul des gains pour l'utilisateur ${userId}`);
    console.log(`[WIN CALCULATION] Numéro gagnant: ${winningSpin}, Solde initial: ${solde}`);
    console.log(`[WIN CALCULATION] Nombre de mises: ${bets.length}`);
    
    let newsolde = solde;
    let betLose = 0;
    const winColor = getNumberColor(winningSpin);
    const isEven = winningSpin !== 0 && winningSpin % 2 === 0;
    
    // Définition des colonnes pour les paris '2 à 1' selon la disposition du plateau
    // Ces tableaux permettent de vérifier si un numéro appartient à une colonne spécifique
    const firstColumn = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
    const secondColumn = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
    const thirdColumn = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
    
    // Boucle de traitement de chaque mise pour déterminer les gains ou pertes
    // Chaque pari est évalué individuellement selon ses propres règles de gain
    for (let b of bets) {
        const numArray = b.numbers.split(',').map(Number);
        let isWin = false;
        
        // Vérification directe si le numéro gagnant fait partie des numéros misés
        // Cette condition couvre les mises pleines, à cheval, carrés, transversales, etc.
        if (numArray.includes(winningSpin)) {
            isWin = true;
        } 
        // Évaluation des paris spéciaux basés sur les propriétés du numéro (couleur, parité, plage)
        // Ces conditions gèrent tous les paris externes comme rouge/noir, pair/impair, douzaines, etc.
        else if (b.label) {
            if (b.label === 'RED' && winColor === 'red') {isWin = true;}
            else if (b.label === 'BLACK' && winColor === 'black') {isWin = true;}
            else if (b.label === 'EVEN' && isEven) {isWin = true;}
            else if (b.label === 'ODD' && !isEven && winningSpin !== 0) {isWin = true;}
            else if (b.label === '1 à 18' && winningSpin >= 1 && winningSpin <= 18) {isWin = true;}
            else if (b.label === '19 à 36' && winningSpin >= 19 && winningSpin <= 36) {isWin = true;}
            else if (b.label === '1 à 12' && winningSpin >= 1 && winningSpin <= 12) {isWin = true;}
            else if (b.label === '13 à 24' && winningSpin >= 13 && winningSpin <= 24) {isWin = true;}
            else if (b.label === '25 à 36' && winningSpin >= 25 && winningSpin <= 36) {isWin = true;}
            // Traitement spécial des colonnes qui nécessite une vérification d'appartenance
            // Les colonnes sont plus complexes car elles ne suivent pas une séquence numérique simple
            else if (b.label === '2 à 1' && b.type === 'outside_column') {
                // Double vérification défensive pour les paris de colonnes :
                // 1. firstColumn.includes(winningSpin) : Le numéro gagnant est-il dans cette colonne ?
                // 2. numArray.every(n => firstColumn.includes(n)) : Le pari porte-t-il vraiment sur cette colonne ?
                // Note: Logiquement, si (1) est false, (2) ne sera pas évalué grâce au court-circuit (&&)
                // Cette double vérification protège contre les données corrompues et valide l'intégrité du pari
                if (firstColumn.includes(winningSpin) && numArray.every(n => firstColumn.includes(n))) {isWin = true;
                    console.log(`firstColumn : [ROULETTE WIN] 💰 Mise gagnante: ${b.label} - Mise: ${b.amt}, Gain: ${b.odds * b.amt}`);
                }
                else if (secondColumn.includes(winningSpin) && numArray.every(n => secondColumn.includes(n))) {isWin = true;
                    console.log(`secondColumn : [ROULETTE WIN] 💰 Mise gagnante: ${b.label} - Mise: ${b.amt}, Gain: ${b.odds * b.amt}`);
                } 
                else if (thirdColumn.includes(winningSpin) && numArray.every(n => thirdColumn.includes(n))) {isWin = true;
                    console.log(`thirdColumn : [ROULETTE WIN] 💰 Mise gagnante: ${b.label} - Mise: ${b.amt}, Gain: ${b.odds * b.amt}`);
                }
            }
        }
        
        // Calcul et logging des gains ou pertes pour chaque mise
        // Les logs détaillés permettent de vérifier la justesse de chaque calcul
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
    
    // Calcul final du résultat net et du nouveau solde
    // Le payout représente le gain net (gains - pertes) qui s'ajoute au solde initial
    payout = winValue - betLose;
    newsolde += payout;
    
    // Logs de résumé pour vérifier la cohérence des calculs
    // Ces informations permettent de valider que tous les montants sont corrects
    console.log(`[WIN CALCULATION] 📊 Résumé des gains:`);
    console.log(`[WIN CALCULATION] - Total des gains: ${winValue}`);
    console.log(`[WIN CALCULATION] - Total des pertes: ${betLose}`);
    console.log(`[WIN CALCULATION] - Total des mises: ${betTotal}`);
    console.log(`[WIN CALCULATION] - Payout net: ${payout}`);
    console.log(`[WIN CALCULATION] - Nouveau solde calculé: ${solde} → ${newsolde}`);
    console.log(`[WIN CALCULATION] ✅ Calculs terminés, pas de mise à jour en base (sera fait par update_solde)`);
    
    // Retour des résultats structurés pour le frontend
    // Ces valeurs permettent au client d'afficher les résultats et de mettre à jour l'interface
    return { 
        winValue: winValue, 
        payout: payout,
        newsolde: newsolde,
        betTotal: betTotal
    };
}

/**
 * Endpoint pour générer un numéro aléatoire de roulette (0-36).
 * Cette route simule le lancement de la roulette avec un générateur de nombres aléatoires côté serveur.
 */
router.post('/spin', (req, res) => {
    const number = Math.floor(Math.random() * 37); // 0-36
    const color = getNumberColor(number);
    
    res.json({ number, color });
});

/**
 * Endpoint principal pour calculer les gains d'un spin de roulette.
 * Cette route reçoit les mises du frontend, vérifie la cohérence du solde et calcule les gains.
 */
router.post('/win', async (req, res) => {
    const { winningSpin, bets, solde } = req.body;
    const userId = req.body.userId;
    
    // Logs d'entrée pour tracer chaque demande de calcul de gains
    // Ces informations permettent de diagnostiquer les problèmes de communication frontend/backend
    console.log(`[ROULETTE WIN] 🎯 Nouvelle demande de calcul de gains`);
    console.log(`[ROULETTE WIN] UserId: ${userId}, Numéro gagnant: ${winningSpin}, Solde reçu du frontend: ${solde}`);
    
    // Récupération du solde réel de la base de données
    let soldeReel = null;
    if (userId) {
        try {
            const [rows] = await db.query("SELECT solde FROM user WHERE user_id = ?", [userId]);
            if (rows.length > 0) {
                soldeReel = rows[0].solde;
                console.log(`[ROULETTE WIN] 💰 Solde réel en base de données: ${soldeReel}`);
                console.log(`[ROULETTE WIN] ⚠️ Différence: Frontend(${solde}) vs Base(${soldeReel}) = ${solde - soldeReel}`);
                
                // Toujours utiliser le solde de la base de données
                console.log(`[ROULETTE WIN] 🔄 Utilisation du solde de la base de données pour les calculs: ${soldeReel}`);
            } else {
                console.log(`[ROULETTE WIN] ❌ Utilisateur non trouvé dans la base de données`);
                return res.status(404).json({ 
                    message: "Utilisateur non trouvé" 
                });
            }
        } catch (err) {
            console.log(`[ROULETTE WIN] ❌ Erreur lors de la vérification du solde en base:`, err);
            return res.status(500).json({ 
                message: "Erreur lors de la récupération du solde" 
            });
        }
    } else {
        console.log(`[ROULETTE WIN] ❌ Aucun userId fourni`);
        return res.status(400).json({ 
            message: "ID utilisateur requis" 
        });
    }
    
    // Validation des données d'entrée pour éviter les erreurs de calcul
    // Ces vérifications garantissent que tous les paramètres nécessaires sont présents et valides
    if (winningSpin === undefined || !Array.isArray(bets) || soldeReel === null) {
        console.log(`[ROULETTE WIN] ❌ Données invalides reçues`);
        return res.status(400).json({ 
            message: "Données invalides. Veuillez fournir un numéro gagnant et des mises." 
        });
    }
    
    try {
        // Appel de la fonction de calcul avec le solde réel de la base de données
        // Cette étape centralise toute la logique de jeu et retourne les résultats structurés
        console.log(`[ROULETTE WIN] 📤 Envoi du solde à la fonction win(): ${soldeReel}`);
        const result = await win(winningSpin, bets, soldeReel, userId, 0, 0, 0);
        
        console.log(`[ROULETTE WIN] ✅ Calculs terminés, nouveau solde calculé: ${result.newsolde}`);
        
        // Mise à jour du solde en base de données via la logique centralisée
        console.log(`[ROULETTE WIN] 🔄 Mise à jour du solde via la logique centralisée...`);
        try {
            console.log(`[ROULETTE WIN] 📝 Exécution: UPDATE user SET solde = ${result.newsolde} WHERE user_id = ${userId}`);
            
            // Utilisation d'une connexion dédiée avec transaction explicite
            const connection = await db.getConnection();
            try {
                // Début de transaction explicite
                await connection.beginTransaction();
                console.log(`[ROULETTE WIN] 🔄 Transaction démarrée`);
                
                const updateResult = await connection.query(
                    "UPDATE user SET solde = ? WHERE user_id = ?",
                    [result.newsolde, userId]
                );
                
                console.log(`[ROULETTE WIN] 📊 Résultat UPDATE:`, updateResult[0]);
                console.log(`[ROULETTE WIN] 📊 Lignes affectées: ${updateResult[0].affectedRows}`);
                console.log(`[ROULETTE WIN] 📊 Lignes changées: ${updateResult[0].changedRows}`);
                
                // COMMIT explicite
                await connection.commit();
                console.log(`[ROULETTE WIN] ✅ Transaction commitée`);
                console.log(`[ROULETTE WIN] ✅ Solde mis à jour avec succès: ${soldeReel} → ${result.newsolde}`);
                
                // Vérification avec la MÊME connexion après COMMIT
                const [verificationRows] = await connection.query("SELECT solde FROM user WHERE user_id = ?", [userId]);
                if (verificationRows.length > 0) {
                    const soldeLuApresUpdate = verificationRows[0].solde;
                    console.log(`[ROULETTE WIN] 🔍 Vérification avec même connexion: ${soldeLuApresUpdate}`);
                    if (soldeLuApresUpdate !== result.newsolde) {
                        console.error(`[ROULETTE WIN] ❌ ERREUR MÊME CONNEXION : Base: ${soldeLuApresUpdate}, Attendu: ${result.newsolde}`);
                    } else {
                        console.log(`[ROULETTE WIN] ✅ Vérification OK avec même connexion : Solde correctement sauvegardé`);
                    }
                }
            } catch (updateError) {
                // ROLLBACK en cas d'erreur
                await connection.rollback();
                console.error(`[ROULETTE WIN] ❌ Erreur UPDATE, transaction rollback:`, updateError);
                throw updateError;
            } finally {
                connection.release();
            }
            
            // Vérification supplémentaire avec une NOUVELLE connexion
            const [verificationRows2] = await db.query("SELECT solde FROM user WHERE user_id = ?", [userId]);
            if (verificationRows2.length > 0) {
                const soldeLuApresUpdate2 = verificationRows2[0].solde;
                console.log(`[ROULETTE WIN] 🔍 Vérification avec nouvelle connexion: ${soldeLuApresUpdate2}`);
                if (soldeLuApresUpdate2 !== result.newsolde) {
                    console.error(`[ROULETTE WIN] ❌ ERREUR NOUVELLE CONNEXION : Base: ${soldeLuApresUpdate2}, Attendu: ${result.newsolde}`);
                } else {
                    console.log(`[ROULETTE WIN] ✅ Vérification OK avec nouvelle connexion`);
                }
            }
        } catch (updateError) {
            console.error(`[ROULETTE WIN] ❌ Erreur lors de la mise à jour du solde:`, updateError);
            return res.status(500).json({ 
                message: "Erreur lors de la mise à jour du solde" 
            });
        }
        
        console.log(`[ROULETTE WIN] ✅ Calcul terminé, envoi de la réponse:`, result);
        res.json(result);
    } catch (error) {
        // Gestion d'erreur avec logging détaillé pour faciliter le débogage
        // Ces informations sont cruciales pour identifier les problèmes de logique ou de base de données
        console.error(`[ROULETTE WIN] ❌ Erreur lors du calcul des gains:`, error);
        res.status(500).json({ 
            message: "Erreur lors du calcul des gains" 
        });
    }
});

/**
 * Route de test pour diagnostiquer les problèmes de mise à jour du solde.
 * Cette route permet de tester directement les UPDATE sans la complexité du jeu de roulette.
 */
router.post('/test-update', async (req, res) => {
    const { userId, newSolde } = req.body;
    
    console.log(`[TEST UPDATE] 🧪 Test de mise à jour directe`);
    console.log(`[TEST UPDATE] UserId: ${userId}, Nouveau solde: ${newSolde}`);
    
    if (!userId || newSolde === undefined) {
        return res.status(400).json({ message: "userId et newSolde requis" });
    }
    
    try {
        // 1. Lecture du solde actuel
        const [beforeRows] = await db.query("SELECT solde FROM user WHERE user_id = ?", [userId]);
        const soldeBefore = beforeRows.length > 0 ? beforeRows[0].solde : null;
        console.log(`[TEST UPDATE] 📖 Solde avant mise à jour: ${soldeBefore}`);
        
        // 2. Utilisation d'une connexion dédiée avec transaction explicite
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            console.log(`[TEST UPDATE] 🔄 Transaction démarrée`);
            
            // 3. UPDATE
            const [updateResult] = await connection.query(
                "UPDATE user SET solde = ? WHERE user_id = ?",
                [newSolde, userId]
            );
            
            console.log(`[TEST UPDATE] 📊 UPDATE Result:`, updateResult);
            console.log(`[TEST UPDATE] 📊 affectedRows: ${updateResult.affectedRows}, changedRows: ${updateResult.changedRows}`);
            
            // 4. COMMIT explicite
            await connection.commit();
            console.log(`[TEST UPDATE] ✅ Transaction commitée`);
            
            // 5. Vérification avec même connexion
            const [sameConnRows] = await connection.query("SELECT solde FROM user WHERE user_id = ?", [userId]);
            const soldeSameConn = sameConnRows.length > 0 ? sameConnRows[0].solde : null;
            console.log(`[TEST UPDATE] 🔍 Solde avec même connexion: ${soldeSameConn}`);
            
            // 6. Attendre un peu pour s'assurer de la persistence
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // 7. Vérification avec nouvelle connexion après délai
            const [newConnRows] = await connection.query("SELECT solde FROM user WHERE user_id = ?", [userId]);
            const soldeNewConn = newConnRows.length > 0 ? newConnRows[0].solde : null;
            console.log(`[TEST UPDATE] 🔍 Solde avec même connexion après délai: ${soldeNewConn}`);
            
        } finally {
            connection.release();
        }
        
        // 8. Vérification finale avec pool
        const [finalRows] = await db.query("SELECT solde FROM user WHERE user_id = ?", [userId]);
        const soldeFinal = finalRows.length > 0 ? finalRows[0].solde : null;
        console.log(`[TEST UPDATE] 🔍 Solde final avec pool: ${soldeFinal}`);
        
        res.json({
            success: true,
            soldeBefore,
            soldeExpected: newSolde,
            soldeFinal,
            status: soldeFinal === newSolde ? 'OK' : 'ERREUR'
        });
        
    } catch (error) {
        console.error(`[TEST UPDATE] ❌ Erreur:`, error);
        res.status(500).json({ message: "Erreur lors du test" });
    }
});

module.exports = router;
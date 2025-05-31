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
    // console.log(`[WIN CALCULATION] 🎰 Début du calcul des gains pour l'utilisateur ${userId}`);
    // console.log(`[WIN CALCULATION] Numéro gagnant: ${winningSpin}, Solde initial: ${solde}`);
    // console.log(`[WIN CALCULATION] Nombre de mises: ${bets.length}`);
    
    let newsolde = solde;
    let betLose = 0;
     let winValueDisplay=0;
    let payoutDisplay=0;
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
                    // console.log(`firstColumn : [ROULETTE WIN] 💰 Mise gagnante: ${b.label} - Mise: ${b.amt}, Gain: ${b.odds * b.amt}`);
                }
                else if (secondColumn.includes(winningSpin) && numArray.every(n => secondColumn.includes(n))) {isWin = true;
                    // console.log(`secondColumn : [ROULETTE WIN] 💰 Mise gagnante: ${b.label} - Mise: ${b.amt}, Gain: ${b.odds * b.amt}`);
                } 
                else if (thirdColumn.includes(winningSpin) && numArray.every(n => thirdColumn.includes(n))) {isWin = true;
                    // console.log(`thirdColumn : [ROULETTE WIN] 💰 Mise gagnante: ${b.label} - Mise: ${b.amt}, Gain: ${b.odds * b.amt}`);
                }
            }
        }
        
        // Calcul et logging des gains ou pertes pour chaque mise
        // Les logs détaillés permettent de vérifier la justesse de chaque calcul
        if (isWin) {
            // Mise gagnante : calcul du gain net
            // Le gain est calculé comme (cote - 1) * montant de la mise
            // Car le solde de la base n'est pas mis à jour ici, donc on fait la cote - 1
            // Exemple : pour une cote de 36, le gain est de 35 fois la mise
            const gain = (b.odds-1) * b.amt;
            winValue += gain;
            winValueDisplay+=b.odds * b.amt;
            // console.log(`[WIN CALCULATION] ✅ Mise gagnante: ${b.label || b.numbers} - Mise: ${b.amt}, Gain: ${gain}`);
        }else{
            betLose += b.amt;
            // console.log(`[WIN CALCULATION] ❌ Mise perdante: ${b.label || b.numbers} - Mise perdue: ${b.amt}`);
        }
        betTotal += b.amt;
    }
    
    // Calcul final du résultat net et du nouveau solde
    // Le payout représente le gain net (gains - pertes) qui s'ajoute au solde initial
    payout = winValue - betLose;
    payoutDisplay = winValueDisplay - betLose;
    newsolde += payout;
    
    
    // Logs de résumé pour vérifier la cohérence des calculs
    // Ces informations permettent de valider que tous les montants sont corrects
    // console.log(`[WIN CALCULATION] 📊 Résumé des gains:`);
    // console.log(`[WIN CALCULATION] - Total des gains: ${winValue}`);
    // console.log(`[WIN CALCULATION] - Total des pertes: ${betLose}`);
    // console.log(`[WIN CALCULATION] - Total des mises: ${betTotal}`);
    // console.log(`[WIN CALCULATION] - Payout net: ${payout}`);
    // console.log(`[WIN CALCULATION] - Payout afficher: ${payoutDisplay}`);
    // console.log(`[WIN CALCULATION] - Nouveau solde calculé: ${solde} → ${newsolde}`);
    // console.log(`[WIN CALCULATION] ✅ Calculs terminés, pas de mise à jour en base (sera fait par update_solde)`);
    if (betLose!=0){
        payoutDisplay = payout;
    }
    // Retour des résultats structurés pour le frontend
    // Ces valeurs permettent au client d'afficher les résultats et de mettre à jour l'interface
    return { 
        winValue: winValue, 
        payout: payoutDisplay,
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
    const { winningSpin, bets, solde, gameSessionId } = req.body;
    const userId = req.body.userId;
    
    // Logs d'entrée pour tracer chaque demande de calcul de gains
    // Ces informations permettent de diagnostiquer les problèmes de communication frontend/backend
    // console.log(`[ROULETTE WIN] 🎯 Nouvelle demande de calcul de gains`);
    // console.log(`[ROULETTE WIN] UserId: ${userId}, Numéro gagnant: ${winningSpin}, Solde reçu du frontend: ${solde}`);
    
    // Récupération du solde réel de la base de données
    let soldeReel = null;
    if (userId) {
        try {
            const [rows] = await db.query("SELECT solde FROM user WHERE user_id = ?", [userId]);
            if (rows.length > 0) {
                soldeReel = rows[0].solde;
                // console.log(`[ROULETTE WIN] 💰 Solde réel en base de données: ${soldeReel}`);
                // console.log(`[ROULETTE WIN] ⚠️ Différence: Frontend(${solde}) vs Base(${soldeReel}) = ${solde - soldeReel}`);
                
                // Toujours utiliser le solde de la base de données
                // console.log(`[ROULETTE WIN] 🔄 Utilisation du solde de la base de données pour les calculs: ${soldeReel}`);
            } else {
                // console.log(`[ROULETTE WIN] ❌ Utilisateur non trouvé dans la base de données`);
                return res.status(404).json({ 
                    message: "Utilisateur non trouvé" 
                });
            }
        } catch (err) {
            // Ce console.log() sert au fichier test
            // console.log(`[ROULETTE WIN] ❌ Erreur lors de la vérification du solde en base:`, err);
            return res.status(500).json({ 
                message: "Erreur lors de la récupération du solde" 
            });
        }
    } else {
        // console.log(`[ROULETTE WIN] ❌ Aucun userId fourni`);
        return res.status(400).json({ 
            message: "ID utilisateur requis" 
        });
    }
    
    // Validation des données d'entrée pour éviter les erreurs de calcul
    // Ces vérifications garantissent que tous les paramètres nécessaires sont présents et valides
    if (winningSpin === undefined || !Array.isArray(bets) || soldeReel === null) {
        // console.log(`[ROULETTE WIN] ❌ Données invalides reçues`);
        return res.status(400).json({ 
            message: "Données invalides. Veuillez fournir un numéro gagnant et des mises." 
        });
    }
    
    try {
        // ===== NOUVELLE LOGIQUE : ENREGISTREMENT DES MISES =====
        
        // Enregistrement de toutes les mises dans la base de données
        if (bets.length > 0) {
            console.log(`[ROULETTE WIN] 📝 Enregistrement de ${bets.length} mises en base de données`);
            
            const connection = await db.getConnection();
            try {
                await connection.beginTransaction();
                
                for (const bet of bets) {
                    // Déterminer le statut de la mise (gagnante ou perdante)
                    const isWin = await determineBetResult(winningSpin, bet);
                    const betStatus = isWin ? 'won' : 'lost';
                    
                    // Formater la combinaison pour affichage
                    const combinaison = bet.label || bet.numbers;
                    
                    // Utiliser gameSessionId du frontend ou générer un ID par défaut
                    const sessionId = gameSessionId || `RO-${Date.now()}`;
                    
                    await connection.query(`
                        INSERT INTO bet (user_id, game_session_id, amount, bet_status, combinaison, created_at)
                        VALUES (?, ?, ?, ?, ?, NOW())
                    `, [userId, sessionId, bet.amt, betStatus, combinaison]);
                    
                    console.log(`[ROULETTE WIN] ✅ Mise enregistrée: ${combinaison} - ${bet.amt}€ - ${betStatus}`);
                }
                
                await connection.commit();
                console.log(`[ROULETTE WIN] 🎯 Toutes les mises ont été enregistrées avec succès`);
                
            } catch (betError) {
                await connection.rollback();
                console.error(`[ROULETTE WIN] ❌ Erreur lors de l'enregistrement des mises:`, betError);
                // Ne pas bloquer le jeu pour une erreur d'enregistrement
            } finally {
                connection.release();
            }
        }
        
        // Appel de la fonction de calcul avec le solde réel de la base de données
        // Cette étape centralise toute la logique de jeu et retourne les résultats structurés
        // console.log(`[ROULETTE WIN] 📤 Envoi du solde à la fonction win(): ${soldeReel}`);
        const result = await win(winningSpin, bets, soldeReel, userId, 0, 0, 0);
        
        // console.log(`[ROULETTE WIN] ✅ Calculs terminés, nouveau solde calculé: ${result.newsolde}`);
        
        // Mise à jour du solde en base de données via la logique centralisée
        // console.log(`[ROULETTE WIN] 🔄 Mise à jour du solde via la logique centralisée...`);
        try {
            // console.log(`[ROULETTE WIN] 📝 Exécution: UPDATE user SET solde = ${result.newsolde} WHERE user_id = ${userId}`);
            
            // Utilisation d'une connexion dédiée avec transaction explicite
            const connection = await db.getConnection();
            try {
                // Début de transaction explicite
                await connection.beginTransaction();
                // console.log(`[ROULETTE WIN] 🔄 Transaction démarrée`);
                
                const updateResult = await connection.query(
                    "UPDATE user SET solde = ? WHERE user_id = ?",
                    [result.newsolde, userId]
                );
                
                // console.log(`[ROULETTE WIN] 📊 Résultat UPDATE:`, updateResult[0]);
                // console.log(`[ROULETTE WIN] 📊 Lignes affectées: ${updateResult[0].affectedRows}`);
                // console.log(`[ROULETTE WIN] 📊 Lignes changées: ${updateResult[0].changedRows}`);
                
                // COMMIT explicite
                await connection.commit();
                // console.log(`[ROULETTE WIN] ✅ Transaction commitée`);
                // console.log(`[ROULETTE WIN] ✅ Solde mis à jour avec succès: ${soldeReel} → ${result.newsolde}`);
                
                // Vérification avec la MÊME connexion après COMMIT
                const [verificationRows] = await connection.query("SELECT solde FROM user WHERE user_id = ?", [userId]);
                if (verificationRows.length > 0) {
                    const soldeLuApresUpdate = verificationRows[0].solde;
                    // console.log(`[ROULETTE WIN] 🔍 Vérification avec même connexion: ${soldeLuApresUpdate}`);
                    if (soldeLuApresUpdate !== result.newsolde) {
                        // console.error(`[ROULETTE WIN] ❌ ERREUR MÊME CONNEXION : Base: ${soldeLuApresUpdate}, Attendu: ${result.newsolde}`);
                    } else {
                        // console.log(`[ROULETTE WIN] ✅ Vérification OK avec même connexion : Solde correctement sauvegardé`);
                    }
                }
            } catch (updateError) {
                // ROLLBACK en cas d'erreur
                await connection.rollback();
                // console.error(`[ROULETTE WIN] ❌ Erreur UPDATE, transaction rollback:`, updateError);
                throw updateError;
            } finally {
                connection.release();
            }
            
            // Vérification supplémentaire avec une NOUVELLE connexion
            const [verificationRows2] = await db.query("SELECT solde FROM user WHERE user_id = ?", [userId]);
            if (verificationRows2.length > 0) {
                const soldeLuApresUpdate2 = verificationRows2[0].solde;
                // Ce console.log() sert au fichier test
                // console.log(`[ROULETTE WIN] 🔍 Vérification avec nouvelle connexion: ${soldeLuApresUpdate2}`);
                if (soldeLuApresUpdate2 !== result.newsolde) {
                    // Ce console.log() sert au fichier test
                    // console.error(`[ROULETTE WIN] ❌ ERREUR NOUVELLE CONNEXION : Base: ${soldeLuApresUpdate2}, Attendu: ${result.newsolde}`);
                } else {
                    // Ce console.log() sert au fichier test
                    // console.log(`[ROULETTE WIN] ✅ Vérification OK avec nouvelle connexion`);
                }
            }
        } catch (updateError) {
            // Ce console.log() sert au fichier test
            // console.error(`[ROULETTE WIN] ❌ Erreur lors de la mise à jour du solde:`, updateError);
            return res.status(500).json({ 
                message: "Erreur lors de la mise à jour du solde" 
            });
        }  
        // Mise à jour des statistiques après une partie réussie
        try {
            // Appel de l'endpoint stats pour mettre à jour les statistiques de roulette
            // console.log(`[ROULETTE WIN] 📊 Appel de updateStats...`);
            await updateStats(userId, result.payout);
            // console.log(`[ROULETTE WIN] ✅ Statistiques mises à jour avec succès`);
        } catch (statsError) {
            // Les erreurs de stats ne doivent pas empêcher le jeu de continuer
            console.error(`[ROULETTE WIN] ⚠️ Erreur lors de la mise à jour des statistiques (non bloquante):`, statsError.message);
        }
        
        // Ce console.log() sert au fichier test
        // console.log(`[ROULETTE WIN] ✅ Calcul terminé, envoi de la réponse:`, result);
        res.json(result);
    } catch (error) {
        // Gestion d'erreur avec logging détaillé pour faciliter le débogage
        // Ces informations sont cruciales pour identifier les problèmes de logique ou de base de données
        // console.error(`[ROULETTE WIN] ❌ Erreur lors du calcul des gains:`, error);
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
    
    // console.log(`[TEST UPDATE] 🧪 Test de mise à jour directe`);
    // console.log(`[TEST UPDATE] UserId: ${userId}, Nouveau solde: ${newSolde}`);
    
    if (!userId || newSolde === undefined) {
        return res.status(400).json({ message: "userId et newSolde requis" });
    }
    
    try {
        // 1. Lecture du solde actuel
        const [beforeRows] = await db.query("SELECT solde FROM user WHERE user_id = ?", [userId]);
        const soldeBefore = beforeRows.length > 0 ? beforeRows[0].solde : null;
        // console.log(`[TEST UPDATE] 📖 Solde avant mise à jour: ${soldeBefore}`);
        
        // 2. Utilisation d'une connexion dédiée avec transaction explicite
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            // console.log(`[TEST UPDATE] 🔄 Transaction démarrée`);
            
            // 3. UPDATE
            const [updateResult] = await connection.query(
                "UPDATE user SET solde = ? WHERE user_id = ?",
                [newSolde, userId]
            );
            
            // console.log(`[TEST UPDATE] 📊 UPDATE Result:`, updateResult);
            // console.log(`[TEST UPDATE] 📊 affectedRows: ${updateResult.affectedRows}, changedRows: ${updateResult.changedRows}`);
            
            // 4. COMMIT explicite
            await connection.commit();
            // console.log(`[TEST UPDATE] ✅ Transaction commitée`);
            
            // 5. Vérification avec même connexion
            const [sameConnRows] = await connection.query("SELECT solde FROM user WHERE user_id = ?", [userId]);
            const soldeSameConn = sameConnRows.length > 0 ? sameConnRows[0].solde : null;
            // console.log(`[TEST UPDATE] 🔍 Solde avec même connexion: ${soldeSameConn}`);
            
            // 6. Attendre un peu pour s'assurer de la persistence
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // 7. Vérification avec nouvelle connexion après délai
            const [newConnRows] = await connection.query("SELECT solde FROM user WHERE user_id = ?", [userId]);
            const soldeNewConn = newConnRows.length > 0 ? newConnRows[0].solde : null;
            // console.log(`[TEST UPDATE] 🔍 Solde avec même connexion après délai: ${soldeNewConn}`);
            
        } finally {
            connection.release();
        }
        
        // 8. Vérification finale avec pool
        const [finalRows] = await db.query("SELECT solde FROM user WHERE user_id = ?", [userId]);
        const soldeFinal = finalRows.length > 0 ? finalRows[0].solde : null;
        // console.log(`[TEST UPDATE] 🔍 Solde final avec pool: ${soldeFinal}`);
        
        res.json({
            success: true,
            soldeBefore,
            soldeExpected: newSolde,
            soldeFinal,
            status: soldeFinal === newSolde ? 'OK' : 'ERREUR'
        });
        
    } catch (error) {
        // console.error(`[TEST UPDATE] ❌ Erreur:`, error);
        res.status(500).json({ message: "Erreur lors du test" });
    }
});

/**
 * Fonction pour mettre à jour les statistiques de roulette
 * Cette fonction est appelée après chaque partie pour enregistrer les résultats
 */
async function updateStats(userId, payout) {
    // console.log(`[ROULETTE STATS] 🎯 Début mise à jour stats roulette (fonction directe)`);
    // console.log(`[ROULETTE STATS] UserId: ${userId}, Payout: ${payout}`);
    
    try {
        // Détermine si c'est une victoire (payout positif)
        const isWin = payout > 0;
        // console.log(`[ROULETTE STATS] 🎲 Résultat: ${isWin ? 'VICTOIRE' : 'DÉFAITE'} (payout: ${payout})`);
        
        // Vérifie s'il existe déjà des statistiques pour cet utilisateur aujourd'hui
        // console.log(`[ROULETTE STATS] 🔍 Recherche stats existantes pour aujourd'hui...`);
        const [existingStats] = await db.query(
            `SELECT * FROM stats WHERE user_id = ? AND timestamp LIKE CONCAT(CURDATE(), '%')`,
            [userId]
        );
        
        // console.log(`[ROULETTE STATS] 📊 Stats trouvées: ${existingStats.length} entrées`);
        
        if (existingStats.length > 0) {
            // Met à jour les statistiques existantes pour aujourd'hui
            const currentStats = existingStats[0];
            const newNumGames = currentStats.num_games + 1;
            const newNumWins = currentStats.num_wins + (isWin ? 1 : 0);
            
            // console.log(`[ROULETTE STATS] 🔄 UPDATE - Anciens: ${currentStats.num_games} parties, ${currentStats.num_wins} victoires`);
            // console.log(`[ROULETTE STATS] 🔄 UPDATE - Nouveaux: ${newNumGames} parties, ${newNumWins} victoires`);
            
            await db.query(
                `UPDATE stats SET num_games = ?, num_wins = ?, timestamp = NOW() 
                 WHERE stat_id = ?`,
                [newNumGames, newNumWins, currentStats.stat_id]
            );
            
            // console.log(`[ROULETTE STATS] ✅ UPDATE réussi pour stat_id: ${currentStats.stat_id}`);
        } else {
            // Crée une nouvelle entrée de statistiques
            // console.log(`[ROULETTE STATS] 🆕 INSERT - Première partie du jour`);
            // console.log(`[ROULETTE STATS] 🆕 INSERT - 1 partie, ${isWin ? 1 : 0} victoire`);
            
            await db.query(
                `INSERT INTO stats (user_id, num_games, num_wins, timestamp) 
                 VALUES (?, 1, ?, NOW())`,
                [userId, isWin ? 1 : 0]
            );
            
            // console.log(`[ROULETTE STATS] ✅ INSERT réussi pour user_id: ${userId}`);
        }
        
        // console.log(`[ROULETTE STATS] 🎉 Stats mises à jour avec succès !`);
        
        return {
            success: true,
            game_played: 1,
            game_won: isWin ? 1 : 0,
            payout: payout
        };
        
    } catch (error) {
        console.error(`[ROULETTE STATS] ❌ Erreur lors de la mise à jour des statistiques:`, error);
        throw error;
    }
}

/**
 * Fonction auxiliaire pour déterminer si une mise est gagnante
 */
async function determineBetResult(winningSpin, bet) {
    const numArray = bet.numbers.split(',').map(Number);
    const winColor = getNumberColor(winningSpin);
    const isEven = winningSpin !== 0 && winningSpin % 2 === 0;
    
    // Définition des colonnes pour les paris '2 à 1' selon la disposition du plateau
    const firstColumn = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
    const secondColumn = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
    const thirdColumn = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
    
    // Vérification directe si le numéro gagnant fait partie des numéros misés
    if (numArray.includes(winningSpin)) {
        return true;
    } 
    // Évaluation des paris spéciaux basés sur les propriétés du numéro
    else if (bet.label) {
        if (bet.label === 'RED' && winColor === 'red') return true;
        if (bet.label === 'BLACK' && winColor === 'black') return true;
        if (bet.label === 'EVEN' && isEven) return true;
        if (bet.label === 'ODD' && !isEven && winningSpin !== 0) return true;
        if (bet.label === '1 à 18' && winningSpin >= 1 && winningSpin <= 18) return true;
        if (bet.label === '19 à 36' && winningSpin >= 19 && winningSpin <= 36) return true;
        if (bet.label === '1 à 12' && winningSpin >= 1 && winningSpin <= 12) return true;
        if (bet.label === '13 à 24' && winningSpin >= 13 && winningSpin <= 24) return true;
        if (bet.label === '25 à 36' && winningSpin >= 25 && winningSpin <= 36) return true;
        // Traitement spécial des colonnes
        if (bet.label === '2 à 1' && bet.type === 'outside_column') {
            if (firstColumn.includes(winningSpin) && numArray.every(n => firstColumn.includes(n))) return true;
            if (secondColumn.includes(winningSpin) && numArray.every(n => secondColumn.includes(n))) return true;
            if (thirdColumn.includes(winningSpin) && numArray.every(n => thirdColumn.includes(n))) return true;
        }
    }
    
    return false;
}

module.exports = router;
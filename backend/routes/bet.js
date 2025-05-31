const express = require("express");
const router = express.Router();
const db = require("../config/dbConfig");

/**
 * Récupère toutes les mises avec les informations des utilisateurs
 * JOIN entre les tables bet et user pour récupérer les pseudos
 */
router.get('/with-users', async (req, res) => {
    try {
        console.log('[BET API] 📊 Récupération de toutes les mises avec utilisateurs');
        
        const [rows] = await db.query(`
            SELECT 
                b.bet_id,
                b.user_id,
                u.pseudo,
                b.game_session_id,
                b.amount,
                b.bet_status,
                b.combinaison,
                b.created_at
            FROM bet b
            LEFT JOIN user u ON b.user_id = u.user_id
            ORDER BY b.created_at DESC
            LIMIT 100
        `);
        
        console.log(`[BET API] ✅ ${rows.length} mises récupérées`);
        res.json(rows);
    } catch (error) {
        console.error('[BET API] ❌ Erreur lors de la récupération des mises:', error);
        res.status(500).json({ message: "Erreur lors de la récupération des mises" });
    }
});

/**
 * Récupère les mises pour une session de jeu spécifique
 */
router.get('/session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        console.log(`[BET API] 🎮 Récupération des mises pour la session: ${sessionId}`);
        
        const [rows] = await db.query(`
            SELECT 
                b.bet_id,
                b.user_id,
                u.pseudo,
                b.game_session_id,
                b.amount,
                b.bet_status,
                b.combinaison,
                b.created_at
            FROM bet b
            LEFT JOIN user u ON b.user_id = u.user_id
            WHERE b.game_session_id = ?
            ORDER BY b.created_at DESC
        `, [sessionId]);
        
        console.log(`[BET API] ✅ ${rows.length} mises trouvées pour la session ${sessionId}`);
        res.json(rows);
    } catch (error) {
        console.error('[BET API] ❌ Erreur lors de la récupération des mises par session:', error);
        res.status(500).json({ message: "Erreur lors de la récupération des mises" });
    }
});

/**
 * Récupère les mises d'un utilisateur spécifique
 */
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(`[BET API] 👤 Récupération des mises pour l'utilisateur: ${userId}`);
        
        const [rows] = await db.query(`
            SELECT 
                b.bet_id,
                b.user_id,
                u.pseudo,
                b.game_session_id,
                b.amount,
                b.bet_status,
                b.combinaison,
                b.created_at
            FROM bet b
            LEFT JOIN user u ON b.user_id = u.user_id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
            LIMIT 50
        `, [userId]);
        
        console.log(`[BET API] ✅ ${rows.length} mises trouvées pour l'utilisateur ${userId}`);
        res.json(rows);
    } catch (error) {
        console.error('[BET API] ❌ Erreur lors de la récupération des mises par utilisateur:', error);
        res.status(500).json({ message: "Erreur lors de la récupération des mises" });
    }
});

/**
 * Enregistre une nouvelle mise dans la base de données
 */
router.post('/', async (req, res) => {
    try {
        const { user_id, game_session_id, amount, bet_status, combinaison } = req.body;
        
        console.log('[BET API] 💰 Enregistrement d\'une nouvelle mise:', {
            user_id, game_session_id, amount, bet_status, combinaison
        });
        
        // Validation des données
        if (!user_id || !game_session_id || amount === undefined || !bet_status || !combinaison) {
            return res.status(400).json({ 
                message: "Tous les champs sont requis: user_id, game_session_id, amount, bet_status, combinaison" 
            });
        }
        
        const [result] = await db.query(`
            INSERT INTO bet (user_id, game_session_id, amount, bet_status, combinaison, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        `, [user_id, game_session_id, amount, bet_status, combinaison]);
        
        console.log(`[BET API] ✅ Mise enregistrée avec l'ID: ${result.insertId}`);
        
        res.status(201).json({
            message: "Mise enregistrée avec succès",
            bet_id: result.insertId,
            data: { user_id, game_session_id, amount, bet_status, combinaison }
        });
        
    } catch (error) {
        console.error('[BET API] ❌ Erreur lors de l\'enregistrement de la mise:', error);
        res.status(500).json({ message: "Erreur lors de l'enregistrement de la mise" });
    }
});

/**
 * Enregistre plusieurs mises en une seule transaction
 * Utilisé pour enregistrer toutes les mises d'un spin de roulette
 */
router.post('/batch', async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        const { bets } = req.body;
        
        if (!Array.isArray(bets) || bets.length === 0) {
            return res.status(400).json({ 
                message: "Un tableau de mises est requis" 
            });
        }
        
        console.log(`[BET API] 📦 Enregistrement en lot de ${bets.length} mises`);
        
        await connection.beginTransaction();
        
        const insertedBets = [];
        
        for (const bet of bets) {
            const { user_id, game_session_id, amount, bet_status, combinaison } = bet;
            
            // Validation de chaque mise
            if (!user_id || !game_session_id || amount === undefined || !bet_status || !combinaison) {
                throw new Error(`Données invalides pour la mise: ${JSON.stringify(bet)}`);
            }
            
            const [result] = await connection.query(`
                INSERT INTO bet (user_id, game_session_id, amount, bet_status, combinaison, created_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            `, [user_id, game_session_id, amount, bet_status, combinaison]);
            
            insertedBets.push({
                bet_id: result.insertId,
                ...bet
            });
        }
        
        await connection.commit();
        
        console.log(`[BET API] ✅ ${insertedBets.length} mises enregistrées avec succès`);
        
        res.status(201).json({
            message: `${insertedBets.length} mises enregistrées avec succès`,
            bets: insertedBets
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('[BET API] ❌ Erreur lors de l\'enregistrement en lot:', error);
        res.status(500).json({ message: "Erreur lors de l'enregistrement des mises" });
    } finally {
        connection.release();
    }
});

module.exports = router; 
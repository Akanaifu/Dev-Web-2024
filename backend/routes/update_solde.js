const db = require("../config/dbConfig");

/**
 * Met à jour le solde d'un utilisateur dans la base de données
 * 
 * @param {number} userId - ID de l'utilisateur
 * @param {number} newSolde - Nouveau solde à enregistrer
 * @returns {Promise} - Promise qui se résout lorsque la mise à jour est terminée
 */
function updateUserSolde(userId, newSolde) {
    return new Promise((resolve, reject) => {
        if (!userId) {
            return resolve(false); // Aucune mise à jour si pas d'utilisateur
        }

        // Validation: s'assurer que newSolde est un nombre valide
        if (isNaN(newSolde) || !isFinite(newSolde)) {
            console.error("Erreur: tentative de mise à jour du solde avec une valeur non numérique:", newSolde);
            return resolve(false);
        }

        db.query(
        "UPDATE user SET solde = ? WHERE user_id = ?",
            [newSolde, userId],
            (err, dbResult) => {
                if (err) {
                    console.error("Erreur lors de la mise à jour du solde:", err);
                    return reject(err);
                }
                console.log(`Solde mis à jour pour l'utilisateur ${userId}: ${newSolde}`);
                resolve(true);
            }
        );
    });
}

module.exports = { updateUserSolde };

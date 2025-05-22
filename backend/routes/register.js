const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const db = require("../config/dbConfig");

// Route pour l'inscription d'un nouvel utilisateur
router.post('/', async (req, res) => {
  const { username, firstName, lastName, email, password } = req.body;
  
  try {
    // Vérifier si l'utilisateur existe déjà (email ou username)
    const [existingUsers] = await db.query('SELECT * FROM User WHERE email = ? OR username = ?', [email, username]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email ou ce nom d\'utilisateur existe déjà' });
    }
    
    // Hasher le mot de passe avec bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Générer un username si non fourni
    const finalUsername = username || `${lastName}_temp`; // Username temporaire si non fourni
    
    // Insérer le nouvel utilisateur avec mot de passe hashé
    const [result] = await db.query(
      'INSERT INTO User (username, name, firstname, email, password, solde, birthdate) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [finalUsername, lastName, firstName, email, hashedPassword, 0, new Date()]
    );
    
    // Si on a utilisé un nom d'utilisateur temporaire, mettre à jour avec l'ID
    if (!username) {
      await db.query(
        'UPDATE User SET username = ? WHERE user_id = ?',
        [`${lastName}_${result.insertId}`, result.insertId]
      );
    }
    
    res.status(201).json({ 
      message: 'Utilisateur créé avec succès',
      userId: result.insertId
    });
    
  } catch (err) {
    console.error('Erreur lors de l\'inscription:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
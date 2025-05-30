const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const NodeClam = require('clamscan');
const path = require('path');
const fs = require('fs');
const db = require('../config/dbConfig');
const router = express.Router();
const upload = multer({ dest: 'tmp/' });


router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
  const userId = req.body.userId;
  if (!req.file || !userId) return res.status(400).send({ error: 'Missing file or userId' });

  try {
    // Chemin de sortie final
    const outputPath = path.join(__dirname, '../assets', `${userId}.png`);

    // Redimensionnement et conversion en PNG
    await sharp(req.file.path)
      .resize(128, 128)
      .png()
      .toFile(outputPath);

    // Scan antivirus
    // Il faut installer ClamAV et le configurer pour que NodeClam puisse l'utiliser.
    
    // Via sudo apt install clamav

    // const clamscan = await new NodeClam().init({
    //   removeInfected: true,
    //   clamscan: {
    //     path: '/usr/bin/clamscan',
    //     active: true,
    //   },
    //   preference: 'clamscan'
    // });
    // const { isInfected } = await clamscan.isInfected(outputPath);
    // if (isInfected) {
    //   fs.unlinkSync(outputPath);
    //   return res.status(400).send({ error: 'Virus detected in file' });
    // }

    // Supprime le fichier temporaire
    fs.unlinkSync(req.file.path);

    // Met à jour la colonne avatar dans la table User
    await db.execute(
      'UPDATE User SET avatar = ? WHERE user_id = ?',
      [`${userId}.png`, userId]
    );

    res.send({ message: 'Avatar uploaded and updated successfully' });
  } catch (error) {
    console.error('Erreur lors du traitement de l\'avatar :', error);
    res.status(500).send({ error: 'Erreur lors du traitement de l\'avatar' });
  }
});


// http://localhost:3000/avatar/1

router.get('/:id', (req, res) => {
  let filePath = path.join(__dirname, '../assets/', `${req.params.id}.png`);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, '../assets/', 'default.png');
  }
  res.sendFile(filePath);
});

module.exports = router;

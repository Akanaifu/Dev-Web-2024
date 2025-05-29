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
  console.log("caca boudin");
  if (!req.file || !userId) return res.status(400).send({ error: 'Missing file or userId' });

  // Redimensionnement et conversion PNG
  const outputPath = path.join(__dirname, '../assets', `${userId}.png`);
  await sharp(req.file.path)
    .resize(128, 128)
    .png()
    .toFile(outputPath);

  // Scan antivirus
  const clamscan = await new NodeClam().init({ removeInfected: true });
  const { isInfected } = await clamscan.isInfected(outputPath);
  if (isInfected) {
    fs.unlinkSync(outputPath);
    return res.status(400).send({ error: 'Virus detected in file' });
  }

  fs.unlinkSync(req.file.path);

  // Update DB
  await db.execute('UPDATE User SET avatar = ? WHERE user_id = ?', [`${userId}.png`, userId]);

  res.send({ message: 'Avatar uploaded' });
});


// http://localhost:3000/avatar/1

router.get('/:id', (req, res) => {
  console.log('Route avatar appelée', req.params.id);
  let filePath = path.join(__dirname, '../assets/', `${req.params.id}.png`);
  console.log('Recherche avatar:', filePath, 'Existe:', fs.existsSync(filePath));
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, '../assets/', 'default.png');
  }
  res.sendFile(filePath);
});

module.exports = router;

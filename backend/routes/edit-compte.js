const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const db = require("../config/dbConfig");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const FileType = require("file-type");

// Modification des infos utilisateur (hors avatar)
router.put("/edit-compte", async (req, res) => {
  const { userId, username, email, password } = req.body;

  try {
    let query = "UPDATE User SET username = ?, email = ?";
    const params = [username, email];

    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      query += ", password = ?";
      params.push(hashedPassword);
    }

    query += " WHERE user_id = ?";
    params.push(userId);

    await db.execute(query, params);
    res.status(200).send({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send({ error: "Failed to update user" });
  }
});

// Configure Multer storage pour le dossier avatar
const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "avatar"),
  filename: (req, file, cb) => {
    // Nom du fichier : userId_timestamp.ext
    const userId = req.body.userId || "unknown";
    cb(null, `${userId}_${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// Route d'upload d'avatar
router.post("/avatar", upload.single("file"), async (req, res) => {
  const { userId } = req.body;
  if (!req.file || !userId) {
    return res.status(400).json({ message: "No file or userId provided" });
  }

  // Vérification du type MIME et taille max (ex: 2Mo)
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 2 * 1024 * 1024; // 2 Mo

  const fileType = await FileType.fromBuffer(req.file.buffer || fs.readFileSync(req.file.path));
  if (!fileType || !allowedTypes.includes(fileType.mime)) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: "Type de fichier non autorisé" });
  }
  if (req.file.size > maxSize) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: "Fichier trop volumineux" });
  }

  // Scan antivirus basique (ex: pas de .exe, .js, etc.)
  const forbiddenExt = ['.exe', '.js', '.bat', '.sh'];
  if (forbiddenExt.includes(path.extname(req.file.originalname).toLowerCase())) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: "Extension de fichier interdite" });
  }

  // Redimensionnement avec sharp
  const resizedPath = req.file.path.replace(/(\.[\w\d_-]+)$/i, '_small$1');
  try {
    await sharp(req.file.path)
      .resize(128, 128)
      .toFile(resizedPath);

    // Remplace l'original par la version redimensionnée
    fs.unlinkSync(req.file.path);
    fs.renameSync(resizedPath, req.file.path);

    const avatarFileName = path.basename(req.file.path);
    await db.execute("UPDATE User SET avatarUrl = ? WHERE user_id = ?", [avatarFileName, userId]);
    res.json({
      message: "Avatar uploaded and resized successfully",
      avatarUrl: avatarFileName,
    });
  } catch (error) {
    console.error("Error processing avatar:", error);
    fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "Failed to process avatar" });
  }
});

// Route pour servir un avatar
router.get('/avatar/:filname', (req, res) => {
  const { filename } = req.params;
  const imagePath = path.join(__dirname, '..', 'avatar', filename);

  if (!fs.existsSync(imagePath)) {
    return res.status(404).send('Image not found');
  }

  res.sendFile(imagePath);
});

module.exports = router;

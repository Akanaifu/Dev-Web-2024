const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const db = require("../config/dbConfig");

router.put("/edit-compte", async (req, res) => {
  const { userId, username, email, password } = req.body;

  try {
    let query = "UPDATE User SET username = ?, email = ?";
    const params = [username, email];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
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

module.exports = router;

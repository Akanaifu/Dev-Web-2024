const express = require("express");
const router = express.Router();
const db = require("../config/dbConfig");

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

function getNumberColor(number) {
    if (number === 0) return 'green';
    return RED_NUMBERS.includes(number) ? 'red' : 'black';
}

router.post('/spin', (req, res) => {
    const number = Math.floor(Math.random() * 37); // 0-36
    const color = getNumberColor(number);
    
    res.json({ number, color });
});

module.exports = router;
const db = require('../../config/dbConfig');

async function getAllRows(tableName) {
    const [rows] = await db.query(`SELECT * FROM ??`, [tableName]);
    return rows;
}

async function insertRow(tableName, data) {
    const [result] = await db.query(`INSERT INTO ?? SET ?`, [tableName, data]);
    return result.insertId;
}

async function updateRow(tableName, data, id) {
    const [result] = await db.query(`UPDATE ?? SET ? WHERE id = ?`, [tableName, data, id]);
    return result.affectedRows;
}

async function deleteRow(tableName, id) {
    const [result] = await db.query(`DELETE FROM ?? WHERE id = ?`, [tableName, id]);
    return result.affectedRows;
}

module.exports = {
    getAllRows,
    insertRow,
    updateRow,
    deleteRow
};

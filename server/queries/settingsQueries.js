// queries/settingsQueries.js
const db = require("../DB/dbSingleton");

// there is only ever one settings row (id = 1)
function getVatPercent(cb) {
  const conn = db.getConnection();
  conn.query(`SELECT vat_percent FROM settings WHERE id = 1`, cb);
}

// updates the global VAT rate and keeps every course's stored vat_percent in
// sync, since the financial reporting queries read vat_percent off each
// course row rather than a shared rate
function updateVatPercent(vatPercent, cb) {
  const conn = db.getConnection();

  conn.query(
    `UPDATE settings SET vat_percent = ? WHERE id = 1`,
    [vatPercent],
    (err) => {
      if (err) return cb(err);
      conn.query(`UPDATE courses SET vat_percent = ?`, [vatPercent], cb);
    },
  );
}

module.exports = { getVatPercent, updateVatPercent };

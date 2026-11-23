const pool = require("./pool");

async function getAllMessages() {
  const { rows } = await pool.query(
    `SELECT u.username, m.text, m.date, m.id
    FROM users u JOIN messages m ON u.id = m.user_id
    ORDER BY m.date;`,
  );
  return rows;
}

async function addMessage(userId, text) {
  const { rows } = await pool.query(
    `INSERT INTO messages (user_id, text) 
    VALUES ($1, $2) RETURNING id`,
    [userId, text],
  );

  if (rows.length === 0) {
    throw new Error("Unable to post message.");
  }

  return rows[0].id;
}

async function deleteMessage(messageId) {
  const { rowCount } = await pool.query(`DELETE FROM messages WHERE id = $1`, [
    messageId,
  ]);
  return rowCount;
}

async function findUser(username) {
  const { rows } = await pool.query(
    `SELECT * 
    FROM users
    WHERE username = $1`,
    [username],
  );

  return rows[0];
}

async function addUser(data) {
  const { rows } = await pool.query(
    `INSERT INTO users (username, password, first_name, surname, member, admin)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id`,
    [data.username, data.password, data.first_name, data.surname, false, false],
  );

  if (rows.length === 0) {
    throw new Error("Unable to add user.");
  }

  return rows[0].id;
}

async function setMember(user_id) {
  await pool.query(`UPDATE users SET member = true WHERE id = $1`, [user_id]);
}

async function setAdmin(user_id) {
  await pool.query(`UPDATE users SET admin = true WHERE id = $1`, [user_id]);
}

module.exports = {
  getAllMessages,
  addMessage,
  deleteMessage,
  findUser,
  addUser,
  setMember,
  setAdmin,
};

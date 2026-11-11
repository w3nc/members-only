const pool = require("./pool");

// Every database question the app asks is written here, in one place.
// The $1, $2... marks keep user input separate from the SQL text (this stops SQL injection).

async function createUser({ firstName, lastName, email, passwordHash }) {
  const { rows } = await pool.query(
    "INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id",
    [firstName, lastName, email, passwordHash]
  );
  return rows[0];
}

// Used at log-in: includes the password hash so it can be checked
async function findUserByEmail(email) {
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return rows[0];
}

// Used for every request after log-in: never includes the password hash
async function findUserById(id) {
  const { rows } = await pool.query(
    "SELECT id, first_name, last_name, email, is_member, is_admin FROM users WHERE id = $1",
    [id]
  );
  return rows[0];
}

async function makeMember(id, isAdmin) {
  await pool.query(
    "UPDATE users SET is_member = TRUE, is_admin = is_admin OR $2 WHERE id = $1",
    [id, isAdmin]
  );
}

async function getMessages() {
  const { rows } = await pool.query(`
    SELECT m.id, m.title, m.text, m.created_at, u.first_name, u.last_name
    FROM messages m
    JOIN users u ON u.id = m.user_id
    ORDER BY m.created_at DESC
  `);
  return rows;
}

async function createMessage({ userId, title, text }) {
  await pool.query(
    "INSERT INTO messages (user_id, title, text) VALUES ($1, $2, $3)",
    [userId, title, text]
  );
}

async function deleteMessage(id) {
  await pool.query("DELETE FROM messages WHERE id = $1", [id]);
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  makeMember,
  getMessages,
  createMessage,
  deleteMessage,
};

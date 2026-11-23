const pool = require("./pool");

const SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  surname TEXT NOT NULL,
  member BOOLEAN NOT NULL DEFAULT FALSE,
  admin BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO users (username, password, first_name, surname, member, admin)
VALUES
  ('happybvnny', 12345678, 'Harry', 'Trowbridge', FALSE, FALSE),
  ('lulegit', 12345678, 'Lucy', 'Leggett', TRUE, TRUE),
  ('mr_magoo', 12345678, 'Marvin', 'Magoo', TRUE, TRUE)
ON CONFLICT (username) DO NOTHING;

CREATE TABLE IF NOT EXISTS messages (
  id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id INT NOT NULL REFERENCES users(id),
  text TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO messages (user_id, text)
SELECT u.id, m.text
FROM (VALUES
  ('happybvnny', 'Thanks for joining the club!'),
  ('lulegit', 'First admin in the club :))))'),
  ('mr_magoo', 'Omg how do you get admin rights??')
) AS m(username, text)
JOIN users u ON u.username = m.username
WHERE NOT EXISTS (SELECT 1 FROM messages);
`;

async function seed() {
  const client = await pool.connect();
  try {
    await client.query(SQL);
    const { rows } = await client.query("SELECT version()");
    console.log("Seeded. Postgres:", rows[0].version);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();

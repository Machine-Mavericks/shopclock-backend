import { Pool } from "pg";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER, LOGGER } from "./constants";

const pool = new Pool({
  user: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
});

export async function verifyConnection():  Promise<void> {
  try {
    const client = await pool.connect();
    LOGGER.info("Connected to ProgreSQL database");
    client.release();
  } catch (error) {
    LOGGER.error(`Error connected to the database\n${error}`);
  }
}

export async function initDatabase(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        student_id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS punch_codes (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL UNIQUE,
        secret VARCHAR(64) NOT NULL UNIQUE,

        CONSTRAINT fk_punch_codes_student
          FOREIGN KEY (student_id)
          REFERENCES students(student_id)
          ON DELETE CASCADE
      );  
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL,
        time_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        time_out TIMESTAMPTZ,

        CONSTRAINT fk_sessions_student
          FOREIGN KEY (student_id)
          REFERENCES students(student_id)
          ON DELETE CASCADE
      );
    `);

    await client.query("COMMIT");
    
    LOGGER.info("Database initialized");
  } catch (error) {
    await client.query("ROLLBACK");

    LOGGER.error(`Error initializing database\n${error}`);
  } finally {
    client.release();
  }
}
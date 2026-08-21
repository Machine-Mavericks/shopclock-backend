import { Pool } from "pg";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER, LOGGER } from "./constants";
import { dirxml, error } from "node:console";

export interface Student {
  id: number;
  fullName: string;
  secret: string;
}

export interface Session {
  id: number;
  studentId: number;
  timeIn: number;
  timeOut: number | null;
}

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
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        secret VARCHAR(32) NOT NULL UNIQUE
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL,
        time_in BIGINT NOT NULL,
        time_out BIGINT,

        CONSTRAINT fk_sessions_student
          FOREIGN KEY (student_id)
          REFERENCES students(id)
          ON DELETE CASCADE
      );
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS one_open_session_per_student
      ON sessions (student_id)
      WHERE time_out IS NULL;  
    `)

    await client.query("COMMIT");
    
    LOGGER.info("Database initialized");
  } catch (error) {
    await client.query("ROLLBACK");

    LOGGER.error(`Error initializing database\n${error}`);
  } finally {
    client.release();
  }
}

export async function getStudent(secret: string): Promise<Student | null>;
export async function getStudent(id: number): Promise<Student | null>;

export async function getStudent(value: number | string): Promise<Student | null> {
  const client = await pool.connect();

  if (typeof value === "number") {
    try {
      const result = await client.query(`
        SELECT * FROM students WHERE id = $1
      `, [value]);

      const student = result.rows[0];

      return {
        id: student.id,
        fullName: student.full_name,
        secret: student.secret,
      };
    } catch (error) {
      LOGGER.error(`${DATABASE_QUERY_ERROR}\n${error}`);
      return null
    } finally {
      client.release();
    }
  } else {
    try {
      const result = await client.query(`
        SELECT * FROM students WHERE secret = $1;
      `, [value]);

      const student = result.rows[0];

      return {
        id: student.id,
        fullName: student.full_name,
        secret: student.secret
      };
    } catch (error) {
      LOGGER.error(`${DATABASE_QUERY_ERROR}\n${error}`);
      return null;
    } finally {
      client.release();
    }
  }
}

export async function isPunchedIn(student: Student): Promise<boolean | null> {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT * FROM sessions 
      WHERE student_id = $1 
        AND time_out IS NULL;  
    `, [student.id]);

    if (result.rowCount === 0) {
      return false;
    } else { 
      return true;
    }
  } catch {
    LOGGER.error(`${DATABASE_QUERY_ERROR}\n${error}`);
    return null;
  } finally {
    client.release();
  }
}

export async function createStudent(fullName: string, secret: string): Promise<Student | null> {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      INSERT INTO students (full_name, secret)
      VALUES ($1, $2)
      RETURNING id, full_name, secret;
    `, [fullName, secret]);

    const student = result.rows[0];

    return {
      id: student.id,
      fullName: student.full_name,
      secret: student.secret,
    };
  } catch (error) {
    LOGGER.error(`${DATABASE_QUERY_ERROR}\n${error}`);
    return null;
  } finally {
    client.release();
  }
}

export async function handlePunch(student: Student): Promise<Session | null> {
  const client = await pool.connect();

  const isPunched = await isPunchedIn(student);

  try {
    var result;
    if (isPunched) {
      result = await client.query(`
        UPDATE sessions
        SET time_out = $2
        WHERE student_id = $1 AND time_out IS NULL
        RETURNING id, student_id, time_in, time_out;  
      `, [student.id, Date.now()]);
    } else {
      result = await client.query(`
        INSERT INTO sessions (student_id, time_in)
        VALUES ($1, $2)
        RETURNING id, student_id, time_in, time_out;
      `, [student.id, Date.now()]);
    }

    const session = result.rows[0];

    return {
      id: session.id,
      studentId: session.student_id,
      timeIn: session.time_in,
      timeOut: session.time_out,
    };
  } catch (error) {
    LOGGER.error(`${DATABASE_QUERY_ERROR}\n${error}`);
    return null;
  } finally {
    client.release();
  }
}

export async function getSessions(student: Student): Promise<Session[] | null> {
  const client = await pool.connect();

  try {
    // ORDER BY time_in DESC makes it to the order is newest first
    const result = await client.query(`
      SELECT * from sessions
      WHERE student_id = $1
      ORDER BY time_in DESC;
    `, [student.id]);

    return result.rows.map((row) => ({
      id: row.id,
      studentId: row.student_id,
      timeIn: row.time_in,
      timeOut: row.time_out,
    }));
  } catch (error) {
    LOGGER.error(`${DATABASE_QUERY_ERROR}\n${error}`);
    return null;
  } finally {
    client.release();
  }
}

export const DATABASE_QUERY_ERROR = "Database query error";
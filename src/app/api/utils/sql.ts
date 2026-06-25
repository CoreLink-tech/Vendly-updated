import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Tagged template literal SQL helper
type SqlValue = string | number | boolean | null | undefined;

async function sql(strings: TemplateStringsArray, ...values: SqlValue[]): Promise<any[]>;
async function sql(query: string, values?: SqlValue[]): Promise<any[]>;
async function sql(stringsOrQuery: TemplateStringsArray | string, ...rest: any[]): Promise<any[]> {
  if (typeof stringsOrQuery === 'string') {
    const result = await pool.query(stringsOrQuery, rest[0] || []);
    return result.rows;
  }
  // Tagged template literal
  const strings = stringsOrQuery;
  const values = rest;
  let query = '';
  strings.forEach((str, i) => {
    query += str;
    if (i < values.length) query += `$${i + 1}`;
  });
  const result = await pool.query(query, values);
  return result.rows;
}

// Transaction support
sql.transaction = async (queries: Promise<any[]>[]): Promise<any[][]> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const results = await Promise.all(queries);
    await client.query('COMMIT');
    return results;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

sql.query = sql;

export default sql;

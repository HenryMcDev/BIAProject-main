import mysql from 'mysql2/promise';

/**
 * Criação da conexão com banco de dados MySQL utilizando pool de conexões
 * com suporte as Promises nativas do mysql2 (async/await)
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bia_db',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;

import mysql from 'mysql2/promise';

// Configuração do pool de conexões com o banco de dados MySQL
const pool = mysql.createPool({
  host: '187.77.56.239',          // Host externo da VPS
  port: 3306,                     // Porta padrão do MySQL
  user: 'biamysql',               // Usuário do banco de dados
  password: 'Colombo115@',        // Senha de acesso
  database: 'automacao_whatsapp', // Nome do banco de dados
  waitForConnections: true,       // Aguarda por conexões disponíveis no pool
  connectionLimit: 10,            // Limite máximo de conexões simultâneas
  queueLimit: 0,                  // Sem limite para a fila de espera de conexões
  enableKeepAlive: true,          // Habilita o keep-alive para manter a conexão ativa (estabilidade da VPS)
  keepAliveInitialDelay: 10000    // Delay inicial de 10 segundos (10000ms) para o keep-alive
});

// Teste imediato da conexão ao inicializar o arquivo
async function testConnection() {
  try {
    // Obtém uma conexão do pool e executa uma query simples para verificar a conectividade
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release(); // Libera a conexão de volta para o pool
    
    // Confirmação de acesso bem-sucedido
    console.log('✅ Acesso à VPS confirmado: Conexão com o banco de dados estabelecida com sucesso!');
  } catch (error) {
    // Exibe o erro detalhado caso a conexão falhe
    console.error('❌ Erro ao conectar com o banco de dados na VPS:', error);
  }
}

// Executa a função de teste
testConnection();

// Exporta o pool de conexões como padrão para ser utilizado em outras partes do projeto
export default pool;

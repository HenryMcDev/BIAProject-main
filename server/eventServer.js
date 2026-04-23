import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import pool from './config/db.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware to parse auth token and extract user ID
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const userId = socket.handshake.auth.userId;

  if (userId) {
    // In a real application, you would parse the Supabase JWT token here to securely extract the user ID
    // For now, we trust the userId passed by the client or in token metadata
    socket.userId = userId;
    next();
  } else {
    next(new Error("Invalid authentication"));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  // Join the user to a private room using their user ID
  socket.join(socket.userId);

  // Escuta envio do console do vendedor
  socket.on('send_response', async (payload) => {
    try {
      console.log(`Sending response via socket from user: ${socket.userId}`);
      
      const { telefone_cliente, conteudo, remetente, idUsuarioLogado, setorUsuario } = payload;
      const tCliente = telefone_cliente || payload.id;
      
      // 1. Salvar no MySQL com role: 'vendedor'
      const query = `
        INSERT INTO mensagens (telefone_cliente, remetente, conteudo, data_envio, usuario_id, role) 
        VALUES (?, ?, ?, NOW(), ?, 'vendedor')
      `;
      // Note: We use dynamic values if present
      await pool.execute(query, [
        tCliente, 
        remetente || 'BIA', 
        conteudo || payload.message, 
        idUsuarioLogado || socket.userId
      ]);

      // 2. Realizar POST para a EvolutionAPI (ou Webhook n8n falback)
      const outgoingUrl = process.env.EVOLUTION_API_URL || process.env.VITE_N8N_WEBHOOK_URL || 'https://automacao-n8n.dczbc9.easypanel.host/webhook/chatinterface';
      
      const outgoingPayload = {
         ...payload,
         role: 'vendedor'
      };

      try {
        const response = await fetch(outgoingUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(outgoingPayload)
        });
        if (!response.ok) {
           console.error(`Error sending to Evolution API. Status: ${response.status}`);
        }
      } catch (err) {
        console.error('Network error reaching Evolution API:', err);
      }

      // 3. Confirmar o envio via socket para o remetente (auto feedback)
      socket.emit('message_sent', {
         ...payload,
         sent_status: 'success',
         data_envio: new Date().toISOString()
      });

    } catch (dbError) {
      console.error('Error saving send_response in MySQL:', dbError);
      socket.emit('message_error', {
         error: 'Failed to process message',
         originalPayload: payload
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

// Webhook endpoint to receive events from n8n/EvolutionAPI
app.post('/webhook/events', async (req, res) => {
  const { ownerId, payload, type } = req.body;

  if (!ownerId || !type) {
    return res.status(400).json({ error: 'Missing ownerId or type' });
  }

  try {
    if (type === 'new_message') {
      const { telefone_cliente, conteudo, remetente, usuario_id, role, message, name, id } = payload;
      
      // 1. Salvar a mensagem no MySQL
      const query = `
        INSERT INTO mensagens (telefone_cliente, remetente, conteudo, data_envio, usuario_id, role)
        VALUES (?, ?, ?, NOW(), ?, ?)
      `;
      const msgRole = role || 'cliente';
      await pool.execute(query, [
         telefone_cliente || id, 
         remetente || name || 'Cliente', 
         conteudo || message || '', 
         usuario_id || ownerId || null, 
         msgRole
      ]);

      // 2. Disparar io.to(telefone).emit('new_message') após success do INSERT
      console.log(`Emitting 'new_message' to user room: ${ownerId}`);
      io.to(ownerId).emit('new_message', payload);
    } else {
      // Eventos genéricos, como status_update (ex: status leads Quente/Morno/Frio)
      console.log(`Emitting '${type}' to user room: ${ownerId}`);
      io.to(ownerId).emit(type, payload);
    }

    res.status(200).json({ success: true, message: 'Event dispatched successfully and saved to DB' });
  } catch (error) {
    console.error('Error handling webhook events:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Rota de teste para consultar as mensagens no banco de dados
app.get('/api/teste-mensagens', async (req, res) => {
  try {
    const [linhas] = await pool.query('SELECT id, telefone_cliente, conteudo, data_envio, remetente FROM mensagens ORDER BY data_envio DESC LIMIT 50');
    res.json(linhas);
  } catch (erro) {
    console.error('Erro ao buscar mensagens:', erro);
    res.status(500).json({ erro: 'Falha ao conectar na VPS', detalhes: erro.message });
  }
});

server.listen(port, () => {
  console.log(`Event Server listening on port ${port}`);
});

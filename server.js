const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Armazenar mensagens (em produção, use um banco de dados)
let messages = [];
let connectedUsers = new Map();

// Gerar QR Code
app.get('/qr-code', async (req, res) => {
  try {
    // Usar a URL atual do servidor para o QR Code
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const baseUrl = `${protocol}://${host}`;
    
    const qrCodeDataUrl = await QRCode.toDataURL(`${baseUrl}/participate`);
    res.json({ qrCode: qrCodeDataUrl });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar QR Code' });
  }
});

// Rota para obter mensagens
app.get('/messages', (req, res) => {
    res.json(messages.slice(-50)); // Últimas 50 mensagens
});

// Rota para o dashboard do streamer
app.get('/dashboard', (req, res) => {
    res.sendFile(__dirname + '/public/dashboard.html');
});

// Rota para participantes
app.get('/participate', (req, res) => {
    res.sendFile(__dirname + '/public/participate.html');
});

// Socket.IO events
io.on('connection', (socket) => {
    console.log('Usuário conectado:', socket.id);

    // Enviar mensagens existentes para novos usuários
    socket.emit('previous-messages', messages.slice(-20));

    // Usuário enviou uma mensagem
    socket.on('send-message', (data) => {
        const message = {
            id: uuidv4(),
            text: data.text,
            username: data.username || 'Anônimo',
            timestamp: new Date().toISOString(),
            userId: socket.id
        };

        messages.push(message);

        // Manter apenas as últimas 100 mensagens
        if (messages.length > 100) {
            messages = messages.slice(-100);
        }

        // Broadcast para todos os usuários
        io.emit('new-message', message);

        console.log(`Mensagem de ${message.username}: ${message.text}`);
    });

    // Usuário se identificou
    socket.on('set-username', (username) => {
        connectedUsers.set(socket.id, username);
        socket.emit('username-set', username);
    });

    // Usuário desconectou
    socket.on('disconnect', () => {
        console.log('Usuário desconectado:', socket.id);
        connectedUsers.delete(socket.id);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 QR Code disponível em: http://localhost:${PORT}/qr-code`);
    console.log(`🎮 Dashboard do streamer: http://localhost:${PORT}/dashboard`);
    console.log(`👥 Página dos participantes: http://localhost:${PORT}/participate`);
}); 
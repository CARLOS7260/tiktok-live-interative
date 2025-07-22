const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

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

// Sistema 4D - Dados avançados
const liveData = {
    messages: [],
    participants: new Map(),
    effects: [],
    gamification: {
        points: new Map(),
        levels: new Map(),
        achievements: new Map(),
        leaderboard: []
    },
    virtualWorld: {
        objects: [],
        weather: 'sunny',
        time: 'day',
        environment: 'forest'
    },
    aiAssistant: {
        active: true,
        personality: 'energetic',
        responses: []
    },
    holographicEffects: [],
    soundEffects: [],
    particleSystems: []
};

// Sistema de Gamificação Avançada
const achievements = {
    'first_message': { name: 'Primeiro Contato', points: 100, icon: '🌟' },
    'message_streak': { name: 'Comunicador Ativo', points: 200, icon: '🔥' },
    'effect_master': { name: 'Mestre dos Efeitos', points: 300, icon: '✨' },
    'social_butterfly': { name: 'Borboleta Social', points: 400, icon: '🦋' },
    'creative_genius': { name: 'Gênio Criativo', points: 500, icon: '🧠' }
};

// Efeitos 4D Disponíveis - REVOLUCIONÁRIOS!
const availableEffects = {
    // EFEITOS BÁSICOS
    'rainbow_trail': { name: '🌈 Trilha Arco-íris', cost: 50, duration: 10 },
    'fire_aura': { name: '🔥 Aura de Fogo', cost: 100, duration: 15 },
    'ice_crystal': { name: '❄️ Cristal de Gelo', cost: 75, duration: 12 },
    'electric_spark': { name: '⚡ Faísca Elétrica', cost: 80, duration: 8 },
    'cosmic_dust': { name: '✨ Pó Cósmico', cost: 120, duration: 20 },
    'hologram_avatar': { name: '👤 Avatar Holográfico', cost: 200, duration: 30 },
    'sound_wave': { name: '🎵 Onda Sonora', cost: 60, duration: 10 },
    'time_warp': { name: '⏰ Dobra Temporal', cost: 300, duration: 25 },

    // EFEITOS REVOLUCIONÁRIOS - NUNCA VISTOS!
    'reality_shift': { name: '🌌 Mudança de Realidade', cost: 200, duration: 20 },
    'mind_control': { name: '🧠 Controle Mental', cost: 300, duration: 25 },
    'dimension_portal': { name: '🌀 Portal Dimensional', cost: 250, duration: 30 },
    'quantum_entanglement': { name: '⚛️ Emaranhamento Quântico', cost: 400, duration: 40 },
    'neural_link': { name: '🔗 Conexão Neural', cost: 350, duration: 35 },
    'holographic_touch': { name: '👆 Toque Holográfico', cost: 180, duration: 15 },
    'sound_visualization': { name: '🎼 Visualização Sonora', cost: 120, duration: 18 },
    'emotion_wave': { name: '💫 Onda Emocional', cost: 160, duration: 22 },
    'time_reversal': { name: '⏪ Reversão Temporal', cost: 500, duration: 50 },
    'reality_merge': { name: '🔄 Fusão de Realidades', cost: 600, duration: 60 },
    'consciousness_expansion': { name: '🧘 Expansão da Consciência', cost: 450, duration: 45 },
    'quantum_teleport': { name: '🚀 Teletransporte Quântico', cost: 700, duration: 70 },
    'neural_sync': { name: '🧬 Sincronização Neural', cost: 550, duration: 55 },
    'dream_walker': { name: '💭 Caminhante dos Sonhos', cost: 380, duration: 38 },
    'reality_glitch': { name: '📱 Glitch da Realidade', cost: 220, duration: 28 },
    'cosmic_consciousness': { name: '🌠 Consciência Cósmica', cost: 800, duration: 80 }
};

// Sistema de IA Assistente
const aiPersonalities = {
    energetic: {
        responses: [
            "🚀 UAU! Que energia incrível!",
            "⚡ Vocês estão arrasando!",
            "🎉 Isso é pura magia digital!",
            "🌟 Vocês são estrelas brilhantes!",
            "🔥 Fogo no parquinho digital!"
        ]
    },
    mystical: {
        responses: [
            "🔮 O futuro da interação está aqui...",
            "✨ Magia digital em ação!",
            "🌙 A lua digital sorri para vocês...",
            "🦋 Borboletas virtuais dançam...",
            "🌌 O cosmos digital responde..."
        ]
    },
    friendly: {
        responses: [
            "😊 Que momento especial!",
            "🤗 Vocês são demais!",
            "💖 Amor digital em ação!",
            "🎈 Festa virtual incrível!",
            "🌈 Arco-íris de conexões!"
        ]
    }
};

// Rotas principais
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Sistema 4D Revolucionário Ativo!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/participate', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'participate.html'));
});

// QR Code dinâmico
app.get('/qr-code', async (req, res) => {
    try {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.headers['x-forwarded-host'] || req.get('host');
        const baseUrl = `${protocol}://${host}`;

        const qrCodeDataUrl = await QRCode.toDataURL(`${baseUrl}/participate`);
        res.json({ qrCode: qrCodeDataUrl });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao gerar QR Code' });
    }
});

// API para dados da live
app.get('/api/live-data', (req, res) => {
    res.json({
        participants: liveData.participants.size,
        messages: liveData.messages.length,
        effects: liveData.effects.length,
        leaderboard: liveData.gamification.leaderboard.slice(0, 10),
        virtualWorld: liveData.virtualWorld,
        aiAssistant: liveData.aiAssistant
    });
});

// Sistema de Socket.IO 4D
io.on('connection', (socket) => {
    console.log('Usuário conectado:', socket.id);

    // Adicionar participante
    liveData.participants.set(socket.id, {
        id: socket.id,
        name: 'Anônimo',
        points: 500, // Pontos iniciais para testar efeitos
        level: 1,
        achievements: [],
        effects: [],
        joinTime: Date.now()
    });

    // Enviar dados iniciais
    socket.emit('welcome', {
        id: socket.id,
        availableEffects,
        achievements,
        virtualWorld: liveData.virtualWorld,
        aiAssistant: liveData.aiAssistant
    });

    // Atualizar lista de participantes
    io.emit('participants_update', Array.from(liveData.participants.values()));

    // Receber nome do participante
    socket.on('set_name', (data) => {
        const participant = liveData.participants.get(socket.id);
        if (participant) {
            participant.name = data.name;
            liveData.participants.set(socket.id, participant);

            // Conceder achievement
            if (!participant.achievements.includes('first_message')) {
                participant.achievements.push('first_message');
                participant.points += achievements.first_message.points;
                socket.emit('achievement_unlocked', achievements.first_message);
            }

            io.emit('participants_update', Array.from(liveData.participants.values()));
        }
    });

    // Sistema de mensagens 4D
    socket.on('send_message', (data) => {
        const participant = liveData.participants.get(socket.id);
        if (participant) {
            const message = {
                id: uuidv4(),
                userId: socket.id,
                userName: participant.name,
                text: data.text,
                timestamp: Date.now(),
                effects: data.effects || [],
                type: data.type || 'normal',
                reactions: [],
                holographic: data.holographic || false,
                soundEffect: data.soundEffect || null
            };

            // Adicionar efeitos visuais
            if (data.effects && data.effects.length > 0) {
                liveData.effects.push({
                    id: uuidv4(),
                    userId: socket.id,
                    userName: participant.name,
                    effects: data.effects,
                    timestamp: Date.now()
                });
            }

            // Sistema de pontos
            participant.points += 10;
            if (data.effects && data.effects.length > 0) {
                participant.points += data.effects.length * 5;
            }

            // Verificar achievements
            if (participant.points >= 1000 && !participant.achievements.includes('creative_genius')) {
                participant.achievements.push('creative_genius');
                participant.points += achievements.creative_genius.points;
                socket.emit('achievement_unlocked', achievements.creative_genius);
            }

            liveData.messages.push(message);
            liveData.participants.set(socket.id, participant);

            // Atualizar leaderboard
            updateLeaderboard();

            // Enviar mensagem com efeitos
            io.emit('new_message', message);

            // Resposta da IA
            if (liveData.aiAssistant.active && Math.random() < 0.3) {
                const personality = aiPersonalities[liveData.aiAssistant.personality];
                const response = personality.responses[Math.floor(Math.random() * personality.responses.length)];

                setTimeout(() => {
                    io.emit('ai_response', {
                        text: response,
                        personality: liveData.aiAssistant.personality,
                        timestamp: Date.now()
                    });
                }, 1000 + Math.random() * 2000);
            }
        }
    });

    // Sistema de efeitos 4D
    socket.on('activate_effect', (data) => {
        const participant = liveData.participants.get(socket.id);
        if (participant && availableEffects[data.effect]) {
            const effect = availableEffects[data.effect];

            if (participant.points >= effect.cost) {
                participant.points -= effect.cost;
                participant.effects.push({
                    name: data.effect,
                    duration: effect.duration,
                    startTime: Date.now()
                });

                liveData.participants.set(socket.id, participant);

                // Enviar efeito para todos
                io.emit('effect_activated', {
                    userId: socket.id,
                    userName: participant.name,
                    effect: data.effect,
                    duration: effect.duration
                });

                // Achievement para mestre dos efeitos
                if (participant.effects.length >= 5 && !participant.achievements.includes('effect_master')) {
                    participant.achievements.push('effect_master');
                    participant.points += achievements.effect_master.points;
                    socket.emit('achievement_unlocked', achievements.effect_master);
                }
            } else {
                socket.emit('insufficient_points', { required: effect.cost, current: participant.points });
            }
        }
    });

    // Sistema de reações holográficas
    socket.on('holographic_reaction', (data) => {
        const participant = liveData.participants.get(socket.id);
        if (participant) {
            liveData.holographicEffects.push({
                id: uuidv4(),
                userId: socket.id,
                userName: participant.name,
                type: data.type,
                position: data.position,
                timestamp: Date.now()
            });

            io.emit('holographic_effect', {
                userId: socket.id,
                userName: participant.name,
                type: data.type,
                position: data.position
            });
        }
    });

    // Controle do mundo virtual
    socket.on('change_environment', (data) => {
        if (data.environment && ['forest', 'ocean', 'space', 'city', 'desert'].includes(data.environment)) {
            liveData.virtualWorld.environment = data.environment;
            io.emit('environment_changed', liveData.virtualWorld);
        }
    });

    // Sistema de sons 3D
    socket.on('play_sound', (data) => {
        liveData.soundEffects.push({
            id: uuidv4(),
            userId: socket.id,
            userName: liveData.participants.get(socket.id)?.name || 'Anônimo',
            sound: data.sound,
            volume: data.volume || 1,
            timestamp: Date.now()
        });

        io.emit('sound_effect', {
            userId: socket.id,
            sound: data.sound,
            volume: data.volume || 1
        });
    });

    // Sistema de partículas
    socket.on('create_particles', (data) => {
        liveData.particleSystems.push({
            id: uuidv4(),
            userId: socket.id,
            userName: liveData.participants.get(socket.id)?.name || 'Anônimo',
            type: data.type,
            position: data.position,
            count: data.count || 50,
            timestamp: Date.now()
        });

        io.emit('particle_effect', {
            userId: socket.id,
            type: data.type,
            position: data.position,
            count: data.count || 50
        });
    });

    // Sistema de votação 4D
    socket.on('vote', (data) => {
        const participant = liveData.participants.get(socket.id);
        if (participant) {
            // Sistema de votação com efeitos visuais
            io.emit('vote_cast', {
                userId: socket.id,
                userName: participant.name,
                option: data.option,
                effect: data.effect || 'sparkle'
            });
        }
    });

    // Desconexão
    socket.on('disconnect', () => {
        console.log('Usuário desconectado:', socket.id);
        liveData.participants.delete(socket.id);
        io.emit('participants_update', Array.from(liveData.participants.values()));
    });
});

// Função para atualizar leaderboard
function updateLeaderboard() {
    const participants = Array.from(liveData.participants.values());
    participants.sort((a, b) => b.points - a.points);
    liveData.gamification.leaderboard = participants.slice(0, 20);
}

// Limpar mensagens antigas (manter apenas últimas 100)
setInterval(() => {
    if (liveData.messages.length > 100) {
        liveData.messages = liveData.messages.slice(-100);
    }

    // Limpar efeitos expirados
    liveData.effects = liveData.effects.filter(effect =>
        Date.now() - effect.timestamp < 60000
    );

    // Limpar efeitos holográficos antigos
    liveData.holographicEffects = liveData.holographicEffects.filter(effect =>
        Date.now() - effect.timestamp < 30000
    );
}, 30000);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log('🚀 Servidor 4D rodando na porta', PORT);
    console.log('📱 QR Code disponível em: http://localhost:' + PORT + '/qr-code');
    console.log('🎮 Dashboard do streamer: http://localhost:' + PORT + '/dashboard');
    console.log('👥 Página dos participantes: http://localhost:' + PORT + '/participate');
    console.log('🌟 SISTEMA 4D REVOLUCIONÁRIO ATIVO! 🌟');
}); 

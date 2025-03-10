import { useMultiFileAuthState, makeWASocket, DisconnectReason } from '@whiskeysockets/baileys';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBEbCNqWNymwL0M0vljckMxpYy56A8-aJU";
const BOT_NUMBER = '554520311657@s.whatsapp.net';

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

async function getAIResponse(message) {
  try {
    console.log(`${COLORS.cyan}🤖 Enviando mensagem para API do Gemini...${COLORS.reset}`);

    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: message }] }]
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.data || !response.data.candidates || !response.data.candidates[0]?.content?.parts[0]?.text) {
      return "Erro ao gerar resposta.";
    }

    console.log(`${COLORS.green}✅ Resposta da IA recebida com sucesso.${COLORS.reset}`);
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error(`${COLORS.red}❌ Erro na API do Gemini:${COLORS.reset}`, error.response?.data || error);
    return "Erro ao gerar resposta.";
  }
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");

  console.log(`${COLORS.magenta}🚀 Iniciando o bot...${COLORS.reset}`);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(`${COLORS.cyan}📲 Escaneie o QR Code para autenticar.${COLORS.reset}`);
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      console.log(`${COLORS.yellow}⚠️ Conexão perdida. Tentando reconectar...${COLORS.reset}`);
      if (shouldReconnect) {
        startBot();
      } else {
        console.log(`${COLORS.red}❌ Logout detectado. Apague a pasta 'auth_info' e reinicie o bot.${COLORS.reset}`);
      }
    }

    if (connection === "open") {
      console.log(`${COLORS.green}✅ Bot conectado ao WhatsApp!${COLORS.reset}`);
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || !msg.key.remoteJid) return;

    const sender = msg.key.remoteJid;
    const isBotMessage = msg.key.fromMe;
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption;

    if (text && !isBotMessage && sender.endsWith('@s.whatsapp.net')) {
      console.log(`${COLORS.cyan}📩 Mensagem recebida de ${sender}:${COLORS.reset} ${text}`);

      const response = await getAIResponse(text);

      await sock.sendMessage(sender, { text: response }, { quoted: msg });
      console.log(`${COLORS.green}✅ Resposta enviada para ${sender}${COLORS.reset}`);
    }
  });
}

startBot();

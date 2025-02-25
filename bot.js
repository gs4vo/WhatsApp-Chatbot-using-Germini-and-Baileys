import { useMultiFileAuthState, makeWASocket, DisconnectReason } from '@whiskeysockets/baileys';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBEbCNqWNymwL0M0vljckMxpYy56A8-aJU";
const BOT_NUMBER = '554520311657@s.whatsapp.net';

async function getAIResponse(message) {
  try {
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: message }] }]
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.data || !response.data.candidates || !response.data.candidates[0]?.content?.parts[0]?.text) {
      return "Erro ao gerar resposta.";
    }

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Erro na API do Gemini:", error.response?.data || error);
    return "Erro ao gerar resposta.";
  }
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("📲 Escaneie o QR Code para autenticar.");
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      console.log(`⚠️ Conexão perdida. Tentando reconectar...`);
      if (shouldReconnect) {
        startBot();
      } else {
        console.log("❌ Logout detectado. Apague a pasta 'auth_info' e reinicie o bot.");
      }
    }

    if (connection === "open") {
      console.log("✅ Bot conectado ao WhatsApp!");
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
      console.log(`📩 Mensagem recebida de ${sender}:`, text);

      const response = await getAIResponse(text);

      await sock.sendMessage(sender, { text: response }, { quoted: msg });
      console.log(`✅ Resposta enviada para ${sender}`);
    }
  });
}

startBot();

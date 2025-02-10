import { useMultiFileAuthState, makeWASocket } from '@whiskeysockets/baileys';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const LLAMA_API_URL = "http://localhost:11434/api/generate";
const BOT_NUMBER = '554520311675@s.whatsapp.net';

async function getAIResponse(message) {
  try {
    const response = await axios.post(LLAMA_API_URL, {
      model: "llama3",
      prompt: message,
      stream: false,
    });

    if (!response.data || !response.data.response) {
      return "Erro ao gerar resposta.";
    }

    return response.data.response;
  } catch (error) {
    console.error("Erro na API do Llama:", error.response?.data || error);
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

  if (!sock.authState.creds.registered) {
    const phoneNumber = BOT_NUMBER;
    console.log({ phoneNumber });

    await sock.waitForConnectionUpdate((update) => !!update.qr);

    console.log("Requesting pairing code...");
    const code = await sock.requestPairingCode(phoneNumber);
    console.log(`Pairing code: ${code}`);
  }

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

  console.log("🤖 Bot conectado! Escaneie o QR Code para autenticar.");
}

startBot();
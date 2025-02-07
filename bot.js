import { useMultiFileAuthState, makeWASocket } from '@whiskeysockets/baileys';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";
const BOT_NUMBER = '5545920009707';

async function getAIResponse(message) {
  try {
    const response = await axios.post(
      DEEPSEEK_URL,
      {
        model: "deepseek-chat",
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Erro na API do DeepSeek:", error.response?.data || error);
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
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption;

    if (text) {
      console.log(`📩 Mensagem recebida de ${sender}:`, text);
      const response = await getAIResponse(text);
      await sock.sendMessage(sender, { text: response });
      console.log(`✅ Resposta enviada para ${sender}`);
    }
  });

  console.log("🤖 Bot conectado! Escaneie o QR Code para autenticar.");
}

startBot();

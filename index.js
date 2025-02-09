import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

app.post("/ia", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Campo 'text' é obrigatório" });
    }

    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3",
      prompt: text,
      stream: false,
    });

    if (!response.data || !response.data.response) {
      return res.status(500).json({ error: "Resposta inválida da IA" });
    }

    res.json({ message: response.data.response });
  } catch (error) {
    console.error("Erro na requisição:", error.message);
    res.status(500).json({ error: "Erro ao processar a solicitação" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

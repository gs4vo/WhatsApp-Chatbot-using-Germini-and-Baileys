# WhatsApp AI Bot - DeepSeek Integration
Este projeto implementa um bot para WhatsApp que responde automaticamente às mensagens recebidas usando a API do DeepSeek. O bot é construído usando a biblioteca @whiskeysockets/baileys para interagir com o WhatsApp e axios para fazer requisições à API do DeepSeek.

Requisitos
Antes de rodar o projeto, certifique-se de ter os seguintes itens instalados:

Node.js (recomendado versão 16 ou superior)
npm (gerenciador de pacotes do Node.js)
Uma conta do DeepSeek para obter a chave da API
Passos para rodar o projeto
1. Clone o repositório
Se ainda não tiver o repositório, clone-o usando o seguinte comando:

git clone [https://seu-repositorio.git](https://github.com/gs4vo/WhatsApp-Chatbot-using-DeepSeek-and-Baileys.git)

2. Instale as dependências
Navegue até o diretório do projeto e instale as dependências necessárias:

cd nome-do-repositorio
npm install

3. Configure o arquivo .env
Crie um arquivo .env na raiz do projeto e adicione a sua chave da API do DeepSeek. O conteúdo do arquivo .env deve ser:

DEEPSEEK_API_KEY=Sua_Chave_De_API_Aqui

4. Autenticação e auth_info
O bot precisa salvar as credenciais para poder funcionar corretamente. Na primeira execução, ele criará um arquivo de autenticação chamado auth_info, que será usado para manter a sessão entre as execuções. Certifique-se de sempre manter este arquivo na pasta do projeto para evitar a necessidade de reautenticação.

Se o arquivo auth_info não estiver presente ou for deletado, o bot pedirá para você escanear o QR Code novamente. Para garantir que o bot use as credenciais salvas, sempre certifique-se de que o arquivo auth_info esteja presente antes de rodar o código.

5. Alteração do número do bot
No código, o número do bot está configurado como '5545920009707' (Brasil). Se você estiver usando outro número, altere a constante BOT_NUMBER para o número desejado no formato internacional. Exemplo:

const BOT_NUMBER = '5551999999999'; // Substitua pelo número do seu bot

6. Execute o código
Após garantir que o arquivo auth_info está na pasta do projeto e que as configurações estão corretas, execute o bot com o seguinte comando:

npm start
Se o auth_info não estiver presente ou expirado, o bot irá gerar um novo QR Code. Escaneie o código com o WhatsApp para autenticar o bot.

7. Interaja com o bot
Após autenticar o bot, envie mensagens para o número configurado e o bot responderá automaticamente com uma mensagem gerada pela API do DeepSeek.

Como funciona
Autenticação: O bot usa o número do WhatsApp configurado para se conectar à conta. Se o bot não estiver autenticado, ele irá gerar um QR Code para que você possa escanear e autenticar a conta.
Respostas automáticas: Sempre que o bot receber uma mensagem, ele fará uma requisição para a API do DeepSeek para gerar uma resposta com base no conteúdo da mensagem.
Resposta ao usuário: A resposta gerada pela API será enviada de volta para o usuário que enviou a mensagem.

Contribuição
Se você deseja contribuir para este projeto, fique à vontade para abrir um pull request com melhorias ou correções.

Licença
Este projeto está licenciado sob a MIT License - veja o arquivo LICENSE para mais detalhes.

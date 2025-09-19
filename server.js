const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const logFile = path.join(__dirname, 'locations.json');

// NOVO: Configuração do CORS para permitir o seu domínio do GitHub Pages
const corsOptions = {
  origin: 'https://calefi018.github.io',
  optionsSuccessStatus: 200 // Para navegadores antigos
};
app.use(cors(corsOptions));

// Middleware para processar JSON
app.use(express.json());

// Rota para a URL principal (confirma que o servidor está no ar)
app.get('/', (req, res) => {
    res.send('O servidor de backend para o sistema de rastreamento está no ar!');
});

// Rota para receber a localização
app.post('/api/location', (req, res) => {
    const { latitude, longitude, prosseguiu } = req.body;
    const timestamp = new Date().toISOString();
    const data = { timestamp, latitude, longitude, prosseguiu };

    fs.appendFile(logFile, JSON.stringify(data) + '\n', (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao salvar localização.');
        }
        res.status(200).send('Localização salva com sucesso!');
    });
});

// Rota para o painel de administração (servir o HTML)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Rota para buscar os dados de localização
app.get('/api/locations', (req, res) => {
    if (!fs.existsSync(logFile)) {
        return res.json([]);
    }
    fs.readFile(logFile, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao ler dados de localização.');
        }
        const lines = data.trim().split('\n');
        const locations = lines.map(line => JSON.parse(line));
        res.json(locations);
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

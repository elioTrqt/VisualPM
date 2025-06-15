const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '', 'index.html'));
});

app.get('/script.js', (req, res) => {
	res.sendFile(path.join(__dirname, 'script', 'main.js'))
});

app.use(express.static(path.join(__dirname, 'script')));

app.get('/style.css', (req, res) => {
	res.sendFile(path.join(__dirname, '', 'style.css'))
});

server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});

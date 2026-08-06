// frontend/set-env.js
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'src', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const apiUrl = process.env.API_URL || 'http://localhost:5000';
html = html.replace(/__API_URL__/g, apiUrl);
fs.writeFileSync(indexPath, html, 'utf8');
console.log('Injected API_URL:', apiUrl);
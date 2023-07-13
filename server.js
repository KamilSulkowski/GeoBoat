const express = require('express');
const cors = require('cors')
const app = express();

//server CORS
app.use(cors())

// Server port
const HTTP_PORT = 8081
// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});

// Udostępnianie plików statycznych z folderu public
app.use(express.static('public'));

// Ustawienie endpointu dla głównej strony
app.get('/game', (req, res) => {
    res.sendFile('index.html');
});

app.use(function(req, res){
    res.status(404);
});

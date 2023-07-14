const express = require('express');
const cors = require('cors')
const app = express();
const db = require('./database');

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

app.get('/data', (req, res) => {
    let sql = "SELECT * FROM odpowiedz";
    let params = [];

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(401).json({"error":err.message});
            return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
    });
});


app.use(function(req, res){
    res.status(404);
});

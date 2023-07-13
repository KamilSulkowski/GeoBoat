// Create express app
const express = require("express")
const cors = require('cors')
const app = express()
const db = require("../../test2/database.js");
const path = require('path');
//server CORS
app.use(cors())

// Server port
const HTTP_PORT = 8080
// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});
// Statyczne pliki z gry Phaser
app.use('/game', express.static(path.join(__dirname, '../GeoBoat')));

app.get('/game', function (req, res) {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/baza', (req, res) => {
    let sql = "select * from user";
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

app.get('/baza2', (req, res) => {
    let sql = "SELECT * FROM pytania";
    let add = "INSERT INTO pytania (tresc) VALUES ('test') ";
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

const express = require('express');
const cors = require('cors')
const app = express();
const db = require('./database');
const fs = require('fs');
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use(cors())

// Port serwera
const HTTP_PORT = 8081
// Start serwera
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});

// Udostępnianie plików statycznych z folderu public
app.use(express.static('public'));

// Ustawienie endpointu dla głównej strony
app.get('/game', (req, res) => {
    res.sendFile('index.html');
});

app.get('/data/regiony', (req, res) => {
    let sql = "SELECT * FROM region";
    let params = [];

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(401).json({"error":err.message});
        }
        else {
            const regiony = JSON.stringify(rows);
            fs.writeFile('./public/json_files/regiony.json', regiony, (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.json(rows);
                }
            });
        }
    });
});

app.get('/data/kategorie', (req, res) => {
    let sql = "SELECT * FROM kategoria";
    let params = [];

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(401).json({"error":err.message});
        }
        else {
            const kategorie = JSON.stringify(rows);
            fs.writeFile('./public/json_files/kategorie.json', kategorie, (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.json(rows);
                }
            });
        }
    });
});

app.get('/data/pytania', (req, res) => {
    let sql = "SELECT * FROM pytanie";

    db.all(sql, (err, rows) => {
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

app.get('/data/odpowiedzi', (req, res) => {
    let sql = "SELECT * FROM odpowiedz";

    db.all(sql, (err, rows) => {
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

app.get('/data/uzytkownicy', (req, res) => {
    let sql = "SELECT * FROM uzytkownik";

    db.all(sql, (err, rows) => {
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

app.get('/data/wynik', (req, res) => {
    let sql = "SELECT * FROM wynik";

    db.all(sql, (err, rows) => {
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

app.post('/data/region/insert', (req, res) => {

    const region = {
        nazwa: req.body.nazwa
    };

    let sql = "INSERT INTO region (nazwa) VALUES (?)";

    db.run(sql, [region.nazwa], function (err) {
        if (err) {
            console.error(err);
            res.status(500).send('Error');
        } else {
            res.status(200).send('Dane zapisane poprawnie');
        }
    });
});

app.use(function(req, res){
    res.status(404);
});

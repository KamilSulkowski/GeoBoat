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

app.get('/dane/regiony', (req, res) => {
    let sql = "SELECT * FROM region";

    db.all(sql,  (err, rows) => {
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

app.get('/dane/kategorie', (req, res) => {
    let sql = "SELECT * FROM kategoria";

    db.all(sql,   (err, rows) => {
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

app.get('/dane/pytania', (req, res) => {
    let sql = "SELECT * FROM pytanie";

    db.all(sql, (err, rows) => {
        if (err) {
            res.status(401).json({"error":err.message});
        }
        else {
            const pytania = JSON.stringify(rows);
            fs.writeFile('./public/json_files/pytania.json', pytania, (err) => {
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

app.get('/dane/odpowiedzi', (req, res) => {
    let sql = "SELECT * FROM odpowiedz";

    db.all(sql, (err, rows) => {
        if (err) {
            res.status(401).json({"error":err.message});
        }
        else {
            const odpowiedzi = JSON.stringify(rows);
            fs.writeFile('./public/json_files/odpowiedzi.json', odpowiedzi, (err) => {
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

app.get('/dane/uzytkownicy', (req, res) => {
    let sql = "SELECT * FROM uzytkownik";

    db.all(sql, (err, rows) => {
        if (err) {
            res.status(401).json({"error":err.message});
        }
        else {
            const pytania = JSON.stringify(rows);
            fs.writeFile('./public/json_files/uzytkownicy.json', pytania, (err) => {
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

app.get('/dane/wynik', (req, res) => {
    let sql = "SELECT * FROM wynik";

    db.all(sql, (err, rows) => {
        if (err) {
            res.status(401).json({"error":err.message});
        }
        else {
            const wynik = JSON.stringify(rows);
            fs.writeFile('./public/json_files/wynik.json', wynik, (err) => {
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

// app.get('/dane/konkretneodpowiedzi', (req, res) => {
//     const customParam = 1;
//     const sql = "SELECT * FROM odpowiedz WHERE idPytania = :abc";
//
//     db.all(sql, { abc: customParam }, (err, rows) => {
//         if (err) {
//             res.status(401).json({"error":err.message});
//         }
//         else {
//             const odpowiedzi = JSON.stringify(rows);
//             fs.writeFile('./public/json_files/odpowiedzi.json', odpowiedzi, (err) => {
//                 if (err) {
//                     console.error(err);
//                     res.status(500).send('Internal Server Error');
//                 } else {
//                     res.json(rows);
//                 }
//             });
//         }
//     });
// });

//Zapisywanie wyniku quizu gracza (zmiana pojedynczego rekordu)
app.post('/dane/zapiswyniku', (req, res) => {

    const wynik = {
        punktyZdobyte: req.body.punktyZdobyte,
        punktyDoZdobycia: req.body.punktyDoZdobycia,
        zdobyteXP: req.body.zdobyteXP,
        czas: req.body.czas
    };

    let sql = "UPDATE wynik SET punktyZdobyte = ?, punktyDoZdobycia = ?, zdobyteXP = ?, czasLaczny = ? WHERE id = 1";

    db.run(sql, [wynik.punktyZdobyte, wynik.punktyDoZdobycia, wynik.zdobyteXP, wynik.czas], function (err) {
        if (err) {
            console.error(err);
            res.status(500).send('Error');
        } else {
            res.status(200).send('Dane zapisano poprawnie');
        }
    });
});

//Blokowanie pytania
app.post('/dane/blokadaPytania', (req, res) => {

    const pytanie = {
        idPytania: req.body.idPytania
    };

    let sql = "UPDATE pytanie SET czyZablokowane = 1 WHERE id = ?";

    db.run(sql, [pytanie.idPytania], function (err) {
        if (err) {
            console.error(err);
            res.status(500).send('Error');
        } else {
            res.status(200).send('Dane zapisano poprawnie');
        }
    });
});

//Odblokowanie pytania
app.post('/dane/odblokowaniePytania', (req, res) => {

    const pytanie = {
        idPytania: req.body.idPytania
    };

    let sql = "UPDATE pytanie SET czyZablokowane = 0 WHERE id = ?";

    db.run(sql, [pytanie.idPytania], function (err) {
        if (err) {
            console.error(err);
            res.status(500).send('Error');
        } else {
            res.status(200).send('Dane zapisano poprawnie');
        }
    });
});

// Zapis parametrów gracza
app.post('/dane/aktualizacjaUzytkownika', (req, res) => {

    const data = {
        punktyXP: req.body.punktyXP,
        poziom: req.body.poziom,
        wytrzymaloscLodzi: req.body.wytrzymaloscLodzi,
        maxPredkoscLodzi: req.body.maxPredkoscLodzi,
        czyGlebokieWodyDostepne: req.body.czyGlebokieWodyDostepne,
        id: req.body.id
    };

    let sql = "UPDATE uzytkownik SET punktyXP = ?, poziom = ?, wytrzymaloscLodzi = ?, maxPredkoscLodzi = ?, czyGlebokieWodyDostepne = ? WHERE id = ?";

    db.run(sql, [data.punktyXP, data.poziom, data.wytrzymaloscLodzi, data.maxPredkoscLodzi, data.czyGlebokieWodyDostepne, data.id], function (err) {
        if (err) {
            console.error(err);
            res.status(500).send('Error');
        } else {
            res.status(200).send('Dane zapisano poprawnie');
        }
    });
});

app.use(function(req, res){
    res.status(404);
});
import {setWynik, setOdp, zablokujPytanie, odblokujPytanie} from '../data_access/data_access.js';

export default class Quiz extends Phaser.Scene {
    preload(){
        this.load.json('regiony', '../json_files/regiony.json');
        this.load.json('kategorie', '../json_files/kategorie.json');
        this.load.json('pytania', '../json_files/pytania.json');
        this.load.json('odpowiedzi', '../json_files/odpowiedzi.json');
        this.load.json('odpowiedz_uzytkownika', '../json_files/odpowiedz_uzytkownika.json');
        this.load.json('uzytkownicy', '../json_files/uzytkownicy.json');
        this.load.json('wynik', '../json_files/wynik.json');
    }

    constructor() {
        super('quiz');

    }
    create() {
        let wybranaKategoria = 3 //polityka

        // Dane z bazy do użytku
        const regiony = this.cache.json.get('regiony');
        const kategorie = this.cache.json.get('kategorie');
        const pytania = this.cache.json.get('pytania');
        const odpowiedzi = this.cache.json.get('odpowiedzi');
        const uzytkownicy = this.cache.json.get('uzytkownicy');
        let odpowiedz_uzytkownika = this.cache.json.get('odpowiedz_uzytkownika');
        let wynik = this.cache.json.get('wynik');

        // Odświeżanie danych w JSONach
        function odswiez() {
            fetch('/dane/wynik')
                .then(response => response.text())
                .catch(error => {
                    console.error('Error:', error);
                });
            fetch('/dane/pytania')
                .then(response => response.text())
                .catch(error => {
                    console.error('Error:', error);
                });
        }

        // Pobranie dostępnych pytań z bazy
        let j = 0;
        let dostepnePytania = [];
        for(j in pytania) {
            if (pytania[j].idKategorii === wybranaKategoria) {
                dostepnePytania.push(j);
            }
        }

        // Wyświetlenie pytania z odpowiedniej kategorii
        this.add.rectangle(800, 150, 800, 100, 0xdce775);
        this.add.text(600, 140,  pytania[dostepnePytania[0]].tresc, { fontFamily: 'Arial', fontSize: 24, color: '#000000' });

        // Pobranie dostępnych odpowiedzi
        let i = 0;
        let dostepneOdpowiedzi = [];
        for(i in odpowiedzi) {
            if (odpowiedzi[i].idPytania === 1) {
                dostepneOdpowiedzi.push(i);
            }
        }   // można zaimplementować losowaną kolejność

        // Rysowanie prostokątów
        const odpowiedz1 = this.add.rectangle(800, 350, 600, 90, 0xf2ab34);
        const odpowiedz2 = this.add.rectangle(800, 450, 600, 90, 0xf2ab34);
        const odpowiedz3 = this.add.rectangle(800, 550, 600, 90, 0xf2ab34);
        const odpowiedz4 = this.add.rectangle(800, 650, 600, 90, 0xf2ab34);
        odpowiedz1.setInteractive();
        odpowiedz2.setInteractive();
        odpowiedz3.setInteractive();
        odpowiedz4.setInteractive();
        odpowiedz1.on('pointerdown', odp1fun.bind(this));
        odpowiedz2.on('pointerdown', odp2fun.bind(this));
        odpowiedz3.on('pointerdown', odp3fun.bind(this));
        odpowiedz4.on('pointerdown', odp4fun.bind(this));

        // Wyświetlanie odpowiedzi
        const text1 = this.add.text(550, 340, odpowiedzi[dostepneOdpowiedzi[0]].tresc, {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#000000'
        });
        text1.czyPoprawna = odpowiedzi[dostepneOdpowiedzi[0]].czyPoprawna;
        const text2 = this.add.text(550, 440, odpowiedzi[dostepneOdpowiedzi[1]].tresc, {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#000000'
        });
        text2.czyPoprawna = odpowiedzi[dostepneOdpowiedzi[1]].czyPoprawna;
        const text3 = this.add.text(550, 540, odpowiedzi[dostepneOdpowiedzi[2]].tresc, {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#000000'
        });
        text3.czyPoprawna = odpowiedzi[dostepneOdpowiedzi[2]].czyPoprawna;
        const text4 = this.add.text(550, 640, odpowiedzi[dostepneOdpowiedzi[3]].tresc, {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#000000'
        });
        text4.czyPoprawna = odpowiedzi[dostepneOdpowiedzi[3]].czyPoprawna;

        // for(i in odp) {
        //     this.add.text(550, 340 + 100 * i, odpowiedzi[i].tresc, {
        //         fontFamily: 'Arial',
        //         fontSize: 24,
        //         color: '#000000'
        //     });
        // }

        // Zmienne do obsługi odpowiedzi
        let wybranoOdpowiedz = 0;   //nie wybrano odpowiedzi
        let wyborGracza = 2;    //brak

        // Przycisk zatwierdzania
        const zatwierdzanie = this.add.rectangle(1300, 400, 200, 100, 0xdceddd);
        this.add.text(1250, 400,  'zatwierdź', { fontFamily: 'Arial', fontSize: 24, color: '#000000' });
        zatwierdzanie.setInteractive();
        zatwierdzanie.on('pointerdown', zatwierdzaniefun.bind(this));

        // Funkcja zatwierdzania
        function zatwierdzaniefun() {
            if (wybranoOdpowiedz === 0) {
                this.add.text(1250, 600,  'Nie wybrano odpowiedzi!', { fontFamily: 'Arial', fontSize: 24, color: '#ff0000' });
            }
            else {
                if (wyborGracza === 0) {
                    this.add.text(1250, 700, 'Błędna odpowiedź!', { fontFamily: 'Arial', fontSize: 24, color: '#ff0000' });
                }
                else {
                    this.add.text(1250, 500, 'Poprawna odpowiedź!', { fontFamily: 'Arial', fontSize: 24, color: '#ff0000' });
                    setWynik(parseInt(wynik[0].punktyZdobyte) + 1, 99, 99, 99);
                    zablokujPytanie(1);
                    odswiez();
                }
            }
        }

        // Obsługa przycisków
        function odp1fun() {
            odpowiedz1.setFillStyle(0xd4aa0);
            odpowiedz2.setFillStyle(0xf2ab34);
            odpowiedz3.setFillStyle(0xf2ab34);
            odpowiedz4.setFillStyle(0xf2ab34);
            wybranoOdpowiedz = 1;
            wyborGracza = text1.czyPoprawna;
        }
        function odp2fun() {
            odpowiedz1.setFillStyle(0xf2ab34);
            odpowiedz2.setFillStyle(0xd4aa0);
            odpowiedz3.setFillStyle(0xf2ab34);
            odpowiedz4.setFillStyle(0xf2ab34);
            wybranoOdpowiedz = 1;
            wyborGracza = text2.czyPoprawna;
        }
        function odp3fun() {
            odpowiedz1.setFillStyle(0xf2ab34);
            odpowiedz2.setFillStyle(0xf2ab34);
            odpowiedz3.setFillStyle(0xd4aa0);
            odpowiedz4.setFillStyle(0xf2ab34);
            wybranoOdpowiedz = 1;
            wyborGracza = text3.czyPoprawna;
        }
        function odp4fun() {
            odpowiedz1.setFillStyle(0xf2ab34);
            odpowiedz2.setFillStyle(0xf2ab34);
            odpowiedz3.setFillStyle(0xf2ab34);
            odpowiedz4.setFillStyle(0xd4aa0);
            wybranoOdpowiedz = 1;
            wyborGracza = text4.czyPoprawna;
        }

        // this.gameScene = this.scene.get('quiz');
        // // Pobranie wysokości/długości sceny
        // this.bw = this.cameras.main.width; // width main kamery
        // this.bh = this.cameras.main.height;// height main kamery
        //
        // this.menu = this.add.image(this.bw-48, this.bh-(this.bh-48), "menuCog")
        // this.menu.setInteractive();
        // this.input.keyboard.on('keydown-Enter', this.toggleModal, this);
    }

    update() {

    }

    // // Menu - modal
    // toggleModal() {
    //     if (this.menuOpen) {
    //         this.closeModal();
    //     } else {
    //         this.showModal();
    //     }
    // }
    // showModal() {
    //     const modalWidth = 500;
    //     const modalHeight = 500;
    //     const modalX = (this.bw - modalWidth) / 2;
    //     const modalY = (this.bh - modalHeight) / 2;
    //
    //     console.log("Modal")
    //     this.menuOpen = true;
    //     this.modal = this.add.graphics();
    //     this.modal.fillStyle(0xffffff, 0.95);
    //     this.modal.fillRoundedRect(modalX, modalY, modalWidth, modalHeight, 25);
    //
    //     this.menuText = this.add.text(modalX + modalWidth / 2, modalY + 20, 'Opcje', { fontFamily: 'Arial', fontSize: '24px', color: '#000000' });
    //     this.menuText.setOrigin(0.5);
    // }
    // closeModal() {
    //     if (this.menuOpen) {
    //         this.modal.clear();
    //         if (this.menuText) {
    //             this.menuText.destroy();
    //         }
    //         this.menuOpen = false;
    //     }
    // }
}
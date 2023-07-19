export default class UI extends Phaser.Scene {

    constructor() {
        super('ui');
        this.HP = 3; //Zmienna do sprawdzania stanu życia łodzi
        this.menuOpen = false;
        this.profileOpen = false;
        this.quizOpen = false;
        this.fillSpeedValue = 0;
        this.speedDecreaseRate = 0.1;
    }
    create() {
        this.gameScene = this.scene.get('game');
        // Pobranie wysokości/długości sceny
        this.bw = this.cameras.main.width; // width main kamery
        this.bh = this.cameras.main.height;// height main kamery

        // HUD
        this.hpBar = this.add.sprite(this.bw-(this.bw-90), this.bh-(this.bh-58), "menuBar")
        this.userBar = this.add.sprite(this.bw*0.5, this.bh-(this.bh-44), "menuLongBar")
        this.rightBar = this.add.sprite(this.bw-90, this.bh-(this.bh-58), "menuBar")


        // Kontener na UI życia gracza (3 serca)
        this.hearts = this.add.group({
            classType: Phaser.GameObjects.Image
        })
        this.hearts.createMultiple({
            key: "fullHeart",
            setXY:{
                x: this.bw-(this.bw-47),
                y: this.bh-(this.bh-36),
                stepX: 42
            },
            quantity: 3
        })
        this.heartsArray = this.hearts.getChildren();
        
        // Stan (tekst pod hp)
        this.stateText = this.add.text(this.bw-(this.bw-32), this.bh-(this.bh-56), 'W pełni sprawna')
        .setScale(1)
        .setColor('#ffffff')
        .setStyle({fontFamily: "Arial"});

        // Tekst o użytkowniku i regionie
        this.userText = this.add.text(this.bw*0.5-49, this.bh-(this.bh-24), 'Giga Ryba')
        .setScale(1)
        .setFontSize(20)
        .setColor('#ffffff')
        .setStyle({fontFamily: "Arial"});
        this.regionText = this.add.text(this.bw*0.5-48, this.bh-(this.bh-58), 'Region: Jamajka')
        .setScale(1)
        .setFontSize(12)
        .setColor('#ffffff')
        .setStyle({fontFamily: "Arial"});

        // Kompas
        const compassH = this.add.image(this.bw-128, this.bh-(this.bh-48), "compassHead")
        this.compassA = this.add.image(this.bw-128, this.bh-(this.bh-48), "compassArrow")

        // Zębatka (menu - modal)
        this.menu = this.add.image(this.bw-48, this.bh-(this.bh-48), "menuCog")
        this.menu.setInteractive();
        this.menu.on('pointerdown', this.toggleModal, this);
        this.input.keyboard.on('keydown-ESC', this.toggleModal, this);

        // Ranking
        this.rankMenu = this.add.image(this.bw*0.5+100, this.bh-(this.bh-48), "rankBadge")

        // Ikona użytkownika
        this.profilePic = this.add.image(this.bw*0.5-100, this.bh-(this.bh-48), "profilePic")
        this.profilePic.setInteractive();
        this.profilePic.on('pointerdown', this.toggleProfil, this);
        this.input.keyboard.on('keydown-P', this.toggleProfil, this);

        // Expbar
        this.fillExpBar = this.add.graphics();
        this.ExpBar = this.add.graphics();
        this.ExpBar.fillStyle(0x222222, 0.3);
        this.ExpBar.fillRect(this.bw-(this.bw-22), this.bh-(this.bh-84), this.bw-(this.bw-140), this.bh-(this.bh-28));
        this.expText = this.add.text(this.bw-(this.bw-65), this.bh-(this.bh-92), 'Poziom 1')
        .setScale(1)
        .setFontSize(14)
        .setColor('#ffffff')
        .setStyle({fontFamily: "Georgia"});

        // Speedbar
        this.fillSpeedBar = this.add.graphics();
        this.fillSpeedBar.fillStyle(0x7dff45, 1)
        this.SpeedBar = this.add.graphics();
        this.SpeedBar.fillStyle(0x222222, 0.3);
        this.SpeedBar.fillRect(this.bw-158, this.bh-(this.bh-84), this.bw-(this.bw-140), this.bh-(this.bh-28));
        this.speedText = this.add.text(this.bw-115, this.bh-(this.bh-92), '0 / Mph')
        .setScale(1)
        .setFontSize(14)
        .setColor('#ffffff')
        .setStyle({fontFamily: "Georgia"});

        // Identyfikator zniszczonej łodzi
        this.wrench = this.add.image(this.gameScene.boat.x, this.gameScene.boat.y, "fixWrench")
        this.wrench.setVisible(false);
        this.wrench.scale=0.3

    }
    // Obracanie strzałką kompasu
    setCompassArrowAngle(angle){
        this.compassA.angle = angle;
    }

    update(time, delta) {
        this.menu.angle += 2*this.gameScene.boatSpeed;
        // Update paska szybkości
        this.updateSpeedBar();

        // Update tekstu stanu łodzi
        if(this.HP === 0){
            // Klucz naprawy (anim)
            this.wrench.setVisible(true);
            this.wrench.angle += delta/3;
        }else{
            this.wrench.setVisible(false);
        }

        // Update tekstu pod HP
        if(this.HP != 3){
            this.stateText.setText("Naprawa za: " + Math.floor(((this.gameScene.shipRepairTime - this.gameScene.shipCooldown)/1000)));
        }else{
            this.stateText.setText("W pełni sprawna.");
        }
    }

        // Update serduszek życia
        setHeartState(collision){
            this.gameScene.shipCooldown = 0;
            this.gameScene.shipDamaged = true;
            this.HP -= 1;
            const temp = this.heartsArray[this.HP];
            temp.setTexture('emptyHeart'); 
            if(this.HP < 1){
                this.gameScene.shipWrecked()
            }
            
        }
        // Odnowienie serduszek życia w czasie
        recoverHeart(){
            const temp = this.heartsArray[this.HP];
            temp.setTexture('fullHeart');
            this.HP += 1;
        }
        // Update paska szybkości
        updateSpeedBar(){
            this.fillSpeedBar.clear();
            if(this.gameScene.boatSpeed > 0){
                this.fillSpeedValue = 32 * this.gameScene.boatSpeed
                this.fillSpeedBar.fillStyle(0x7dff45, 1)
            }else if(this.gameScene.boatSpeed < 0){
                this.fillSpeedValue = 5 * this.gameScene.boatSpeed
                this.fillSpeedBar.fillStyle(0xff4564, 1)
            }
            this.fillSpeedBar.fillRect(this.bw-153, this.bh-(this.bh-88), this.fillSpeedValue, this.bh-(this.bh-20));
            this.speedText.setText(8*(Math.round(this.gameScene.boatSpeed * 10)/10) + " / Mph");
        }
        //-------MENU MODAL-------
        toggleModal() {
            if (this.menuOpen) {
              this.closeModal();
            } else {
              this.showModal();
            }
        }
        showModal() {
            const modalWidth = 500;
            const modalHeight = 500;
            const modalX = (this.bw - modalWidth) / 2;
            const modalY = (this.bh - modalHeight) / 2;

            console.log("Modal");
            this.menuOpen = true;
            this.modal = this.add.graphics();
            this.modal.fillStyle(0xffffff, 0.95);
            this.modal.fillRoundedRect(modalX, modalY, modalWidth, modalHeight, 25);

            this.menuText = this.add.text(modalX + modalWidth / 2, modalY + 20, 'Opcje', {
                fontFamily: 'Arial',
                fontSize: '24px',
                fill: '#000000'
            });
            this.menuText.setOrigin(0.5);
        }
            closeModal() {
            if (this.menuOpen) {
                this.modal.clear();
                if (this.menuText) {
                    this.menuText.destroy();
                }
                this.menuOpen = false;
            }
        }

    //-------PROFIL MODAL-------
    toggleProfil() {
        if (this.profileOpen) {
            this.closeProfil();
        } else {
            this.showProfil();
        }
    }

    showProfil() {
        const modalWidth = 500;
        const modalHeight = 500;
        const modalX = (this.bw - modalWidth) / 2;
        const modalY = (this.bh - modalHeight) / 2;

        this.profileOpen = true;
        this.profilModal = this.add.graphics();
        this.profilModal.fillStyle(0xffffff, 0.95);
        this.profilModal.fillRoundedRect(modalX, modalY, modalWidth, modalHeight, 25);

        // Dodanie kwadratu po lewej górnej stronie
        const squareSize = 150;
        this.profilModal.fillStyle(0xcccccc, 2); // Kolor kwadratu (szary)
        this.profilModal.fillRoundedRect(modalX+20, modalY+60, squareSize, squareSize);

        // Dodanie obrazu nałożonego na kwadrat
        this.profilePic = this.add.image(modalX+95, modalY+135, "profilePic");
        this.profilePic.setScale(2)
        this.profilePic.setDisplaySize(squareSize, squareSize)

        // Dodanie linii pod napisem "Profil"
        this.profilModal.fillStyle(0xCFB53B, 1); // Kolor linii (złoty)
        this.profilModal.fillRect(modalX, modalY + 50, modalWidth,3);

        // Dodanie linii nad tabelą
        this.profilModal.fillStyle(0xCFB53B, 1); // Kolor linii (złoty)
        this.profilModal.fillRect(modalX, modalY + 230, modalWidth,3);

        //Dodanie prostokąta w którym będzie nazwa użytkownika
        const rectWidth = 300;
        const rectHeight = 40;
        this.profilModal.fillStyle(0xcccccc, 2); // Kolor prostokąta (szary)
        this.profilModal.fillRoundedRect(modalX+185, modalY+60, rectWidth, rectHeight);

        //Dodanie prostokąta w którym będzie nazwa regionu
        this.profilModal.fillStyle(0xcccccc, 2); // Kolor prostokąta (szary)
        this.profilModal.fillRoundedRect(modalX+185, modalY+110, rectWidth, rectHeight);

        //Dodanie prostokąta w którym będzie poziom użytkownika
        this.profilModal.fillStyle(0xcccccc, 2); // Kolor prostokąta (szary)
        this.profilModal.fillRoundedRect(modalX+185, modalY+160, rectWidth, rectHeight);

        this.createTable()

        // Tekst "Profil"
        this.profilText = this.add.text(modalX + modalWidth / 2, modalY + 20, 'Profil', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: '#000000'
        });
        this.profilText.setOrigin(0.5);

        // Tekst "Nazwa użytkownika"
        this.userText = this.add.text((modalX + modalWidth / 2), modalY + 70, 'Nazwa użytkownika', {
            fontFamily: 'Arial',
            fontSize: '18px',
            fill: '#000000'
        });
        this.profilText.setOrigin(0.5);

        // Tekst "Region"
        this.regionText = this.add.text(modalX + modalWidth / 2, modalY + 120, 'Region', {
            fontFamily: 'Arial',
            fontSize: '18px',
            fill: '#000000'
        });
        // Tekst "Poziom"
        this.lvlText = this.add.text(modalX + modalWidth / 2, modalY + 170, 'Poziom', {
            fontFamily: 'Arial',
            fontSize: '18px',
            fill: '#000000'
        });
    }
    closeProfil() {
        if (this.profileOpen) {
            this.profilModal.clear();
            if (this.profilText) {
                this.profilText.destroy();
            }
            if (this.profilePic) {
                this.profilePic.destroy();
            }
            if (this.tableContainer) {
                this.tableContainer.destroy();
            }
            if (this.userText) {
                this.userText.destroy();
            }
            if (this.regionText) {
                this.regionText.destroy();
            }
            if (this.lvlText) {
                this.lvlText.destroy();
            }
            this.profileOpen = false;
        }
    }

    createTable() {
        const tableX = ((this.bw - 500) / 2)+30; // Pozycja X tabeli
        const tableY = ((this.bh - 500) / 2)+230; // Pozycja Y tabeli
        const cellWidth = 150; // Szerokość komórki tabeli
        const cellHeight = 50; // Wysokość komórki tabeli
        const numRows = 5; // Liczba wierszy w tabeli
        const numCols = 3; // Liczba kolumn w tabeli

        // Tworzenie kontenera na tabelę
        this.tableContainer = this.add.container(tableX, tableY);

        // Tworzenie tła tabeli
        const tableBackground = this.add.graphics();
        tableBackground.fillStyle(0xffffff);
        tableBackground.fillRect(0, 0, cellWidth * numCols, cellHeight * numRows);
        tableBackground.lineStyle(2, 0xCFB53B);
        tableBackground.strokeRect(0, 0, cellWidth * numCols, cellHeight * numRows);
        this.tableContainer.add(tableBackground);

        // Tworzenie komórek tabeli
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                const cell = this.add.graphics();
                cell.fillStyle(0xcccccc);
                cell.fillRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
                cell.lineStyle(2, 0xCFB53B);
                cell.strokeRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
                this.tableContainer.add(cell);

                const cellText = this.add.text(col * cellWidth + cellWidth / 2, row * cellHeight + cellHeight / 2, `Row ${row + 1}, Col ${col + 1}`, {
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    fill: '#000000'
                });
                cellText.setOrigin(0.5);
                this.tableContainer.add(cellText);
            }
        }
    }
        //-------QUIZ MODAL-------
    toggleQuiz(){
        if (this.quizOpen) {
            this.closeQuiz();
          } else {
            this.showQuiz();
          }
    }

    showQuiz(){
        const modalWidth = 800;
        const modalHeight = 600;
        const modalX = (this.bw - modalWidth) / 2;
        const modalY = (this.bh - modalHeight) / 2;

        this.quizOpen = true;
        this.modal = this.add.graphics();
        this.modal.fillStyle(0xffffff, 0.95);
        this.modal.fillRoundedRect(modalX, modalY, modalWidth, modalHeight, 25);

        //Tytuł
        this.menuText = this.add.text(modalX + modalWidth / 2, modalY + 20, 'Quiz', { fontFamily: 'Arial', fontSize: '24px', fill: '#000000' });
        this.menuText.setOrigin(0.5);

        // Linia oddzielająca
        const LineSep = new Phaser.Geom.Line(modalX, modalY + 50, modalX + modalWidth, modalY + 50);
        this.modal.lineStyle(2, 0x000000);
        this.modal.strokeLineShape(LineSep);

        // Postać co będzie se ruszać ustami jak pytanie będzie lecieć
        this.quizCharacterImage = this.add.image(modalX + 110, modalY + 150, 'QTPH');
        this.quizCharacterImage.setScale(0.75); // Adjust the scale of the image as needed

        //---------------------------------------

        // Treść pytania
        this.quizQuestionTextContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.';
        this.quizQuestionText = this.add.text(modalX + modalWidth / 2 + 380, modalY + 235, this.quizQuestionTextContent,
        { fontFamily: 'Arial', fontSize: '24px', fill: '#000000', wordWrap: { width: 580, useAdvancedWrap: true }});
        this.quizQuestionText.setOrigin(1);
        this.quizQuestionText.setBackgroundColor('#f0f0f0');

        // Linia oddzielająca
        const LineSep2 = new Phaser.Geom.Line(modalX, modalY + 250, modalX + modalWidth, modalY + 250);
        this.modal.lineStyle(2, 0x000000);
        this.modal.strokeLineShape(LineSep2);

        // Odpowiedzi
        const answerTexts = [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
        ];

        const fontSize = '22px';
        const textColor = '#000000';
        const wordWrapWidth = 760;
        const backgroundColor = '#f0f0f0';
        
        const yOffset = 300;
        const yOffsetIncrement = 60;

        this.quizAnswerTexts = [];

        for (let i = 0; i < answerTexts.length; i++) {
            this.quizAnswerText = this.add.text(modalX + modalWidth / 2, modalY + yOffset + yOffsetIncrement * i, answerTexts[i], {
                fontFamily: 'Arial',
                fontSize: fontSize,
                fill: textColor,
                wordWrap: { width: wordWrapWidth, useAdvancedWrap: true }

            });
            this.quizAnswerText.setOrigin(0.5);
            this.quizAnswerText.setBackgroundColor(backgroundColor);
            this.quizAnswerText.setInteractive({ useHandCursor: true });
            this.quizAnswerText.on('pointerdown', () => {
                handleAnswerClick(i);
            });
            this.quizAnswerTexts.push(this.quizAnswerText);
        }

        const handleAnswerClick = (index) => {
            for (let i = 0; i < this.quizAnswerTexts.length; i++) {
                this.quizAnswerTexts[i].setBackgroundColor(backgroundColor);
            }
            this.quizAnswerTexts[index].setBackgroundColor('#aaffaa');
            this.selectedAnswerIndex = index; // Zapamiętanie indeksu wybranej odpowiedzi
            this.submitButton.visible = true;
        };
        
        //Przycisk odpowiedzi
        this.submitButton = this.add.text(modalX + modalWidth / 2 + 290, modalY + modalHeight - 50, 'Submit', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#007bff',
            padding: {
                x: 20,
                y: 10,
            },
        });
        this.submitButton.setOrigin(0.5);
        this.submitButton.setInteractive({ useHandCursor: true });
        this.submitButton.visible = false;

        this.submitButton.on('pointerdown', () => {
            console.log('Selected answer index:', this.selectedAnswerIndex);
        });

    }

    closeQuiz(){
        if (this.quizOpen) {
            this.modal.clear();
            if (this.menuText) {
                this.menuText.destroy();
                this.quizCharacterImage.destroy();
                this.quizQuestionText.destroy();
                for (this.quizAnswerText of this.quizAnswerTexts) {
                    this.quizAnswerText.destroy();
                }
                if(this.submitButton){
                    this.submitButton.destroy();
                }
              }
            this.quizOpen = false;
            // this.quizAnswerButtons = [];
        }
    }

}
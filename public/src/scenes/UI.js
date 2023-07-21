import {showQuiz, closeQuiz} from "./Quiz.js";

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
    preload() {
        this.load.json('pytania', '../json_files/pytania.json');
        this.load.json('odpowiedzi', '../json_files/odpowiedzi.json');
    }
    create() {
        this.gameScene = this.scene.get('worldMap');
        // Pobranie wysokości/długości sceny
        this.bw = this.cameras.main.width; // width main kamery
        this.bh = this.cameras.main.height;// height main kamery

        // HUD
        this.hpBar = this.add.sprite(this.bw-(this.bw-90), this.bh-(this.bh-60), "menuBar")
        this.hpBar.scale = 1.7;
        this.userBar = this.add.sprite(this.bw*0.5, this.bh-(this.bh-46), "menuLongBar")
        this.userBar.scale = 1.7;
        this.rightBar = this.add.sprite(this.bw-90, this.bh-(this.bh-60), "menuBar")
        this.rightBar.scale = 1.7;



        // Kontener na UI życia gracza (3 serca)
        this.hearts = this.add.group({
            classType: Phaser.GameObjects.Image
        })
        this.hearts.createMultiple({
            key: "fullHeart",
            setXY:{
                x: this.bw-(this.bw-47),
                y: this.bh-(this.bh-20),
                stepX: 43
            },
            quantity: 3
        })
        this.heartsArray = this.hearts.getChildren();
        
        // Stan (tekst pod hp)
        this.stateText = this.add.text(this.bw-(this.bw-30), this.bh-(this.bh-50), 'W pełni sprawna')
        .setScale(1)
        .setColor('#ffffff')
        .setStyle({fontFamily: "Arial"});

        // Tekst o użytkowniku i regionie
        this.userText = this.add.text(this.bw*0.5-49, this.bh-(this.bh-12), 'Giga Ryba')
        .setScale(1)
        .setFontSize(20)
        .setColor('#ffffff')
        .setStyle({fontFamily: "Arial"});
        this.regionText = this.add.text(this.bw*0.5-48, this.bh-(this.bh-52), 'Region: Jamajka')
        .setScale(1)
        .setFontSize(12)
        .setColor('#ffffff')
        .setStyle({fontFamily: "Arial"});

        // Kompas
        this.compassH = this.add.image(this.bw-126, this.bh-(this.bh-38), "compassHead")
        this.compassA = this.add.image(this.bw-126, this.bh-(this.bh-38), "compassArrow")
        this.compassH.scale = 0.5;

        // Zębatka (menu - modal)
        this.menu = this.add.image(this.bw-54, this.bh-(this.bh-38), "menuCog")
        this.menu.setInteractive();
        this.menu.on('pointerdown', this.toggleModal, this);
        this.input.keyboard.on('keydown-ESC', this.toggleModal, this);

        // Ranking
        this.rankBorder = this.add.image(this.bw*0.5+100, this.bh-(this.bh-40), "profileBorder")
        this.rankMenu = this.add.image(this.bw*0.5+100, this.bh-(this.bh-40), "rankBadge")


        // Ikona użytkownika
        this.profileBorder = this.add.image(this.bw*0.5-100, this.bh-(this.bh-40), "profileBorder")
        this.profilePic = this.add.image(this.bw*0.5-100, this.bh-(this.bh-40), "profilePic")
        this.profilePic.setInteractive();
        this.profilePic.on('pointerdown', this.toggleProfil, this);
        this.input.keyboard.on('keydown-P', this.toggleProfil, this);

        // Expbar
        this.fillExpBar = this.add.graphics();
        this.ExpBar = this.add.graphics();
        this.ExpBar.fillStyle(0x222222, 0.3);
        this.ExpBar.fillRect(this.bw-(this.bw-20), this.bh-(this.bh-84), this.bw-(this.bw-140), this.bh-(this.bh-28));
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
        this.SpeedBar.fillRect(this.bw-160, this.bh-(this.bh-84), this.bw-(this.bw-140), this.bh-(this.bh-28));
        this.speedText = this.add.text(this.bw-115, this.bh-(this.bh-92), '0 / Mph')
        .setScale(1)
        .setFontSize(14)
        .setColor('#ffffff')
        .setStyle({fontFamily: "Georgia"});

        // Identyfikator zniszczonej łodzi
        this.hammer = this.add.sprite(this.gameScene.boat.x, this.gameScene.boat.y, "repairAnim")
        this.anims.create({
            key: 'hammerAnimation',
            frames: this.anims.generateFrameNumbers('repairAnim', { start: 0, end: 3 }),
            frameRate: 10, 
            repeat: -1 
        });
        this.hammer.play('hammerAnimation');
        this.hammer.setVisible(false);
        this.hammer.scale=1

    }
    // Obracanie strzałką kompasu
    setCompassArrowAngle(angle){
        //this.compassA.angle = angle;
    }

    update(time, delta) {
        this.menu.angle += 2*this.gameScene.boatSpeed;
        // Update paska szybkości
        this.updateSpeedBar();

        // Update tekstu stanu łodzi
        if(this.HP === 0){
            this.hammer.setVisible(true);
        }else{
            this.hammer.setVisible(false);
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
                this.speedText.setText(8*(Math.round(this.gameScene.boatSpeed * 10)/10) + " / Mph");
            }else if(this.gameScene.boatSpeed < 0){
                this.fillSpeedValue = 5 * this.gameScene.boatSpeed
                this.fillSpeedBar.fillStyle(0xff4564, 1)
                this.speedText.setText(8*(Math.round(-this.gameScene.boatSpeed * 10)/10) + " / Mph");
            }
            this.fillSpeedBar.fillRect(this.bw-155, this.bh-(this.bh-88), this.fillSpeedValue, this.bh-(this.bh-20));
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

    toggleQuiz(){
        if (this.quizOpen) {
            console.log("quiz close")
            closeQuiz.call(this);
        } else {
            console.log("quiz open")
            showQuiz.call(this);
        }
    }
}
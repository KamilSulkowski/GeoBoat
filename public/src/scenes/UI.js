import {startQuiz, closeQuiz} from "./Quiz.js";
import {updateLocation} from '../data_access/data_access.js';

export default class UI extends Phaser.Scene {
    constructor() {
        super('ui');
        this.menuOpen = false;
        this.profileOpen = false;
        this.quizOpen = false;
        this.rankingOpen = false;
        this.mapOpen = false;
        this.scrollIsMoving = false;
        this.fillSpeedValue = 0;
        this.speedDecreaseRate = 0.1;
        this.rankingFlag = false;
        this.scrollHeight = 130;
        this.leftScrollScrolled = false;
        this.rightScrollScrolled = false;
        this.regionText = null;
    }
    preload() {
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
    }

    create(data) {
        this.gameScene = this.scene.get('worldMap');
        this.sceneJam = this.scene.get('Jamajka');
        this.sceneHav = this.scene.get('Havana');
        this.scenePan = this.scene.get('Panama');

        this.userName = data.login;
        console.log("UserName: ", this.userName);

        this.userData = data.userData;
        console.log(this.userData);

        this.scene = this.scene.get('game');
        console.log('hp: ', this.scene.HP);
        console.log('x: ', this.scene.boatRespawnX);
        console.log('y: ', this.scene.boatRespawnY);

        // Pobranie wysokości/długości sceny
        this.bw = this.cameras.main.width; // width main kamery
        this.bh = this.cameras.main.height;// height main kamery

        // Rozwijane scrolle z menu
        this.leftScroll = this.add.sprite(this.bw-(this.bw-90), this.bh-(this.bh-70), "scrollMenuInputs")
        this.rightScroll = this.add.sprite(this.bw-90, this.bh-(this.bh-70), "scrollMenuMovement")
        this.leftScroll.scale = 0.8;
        this.rightScroll.scale = 0.8;
        this.leftScroll.setInteractive();
        this.leftScroll.on('pointerdown', this.onLeftScrollClick, this);
        this.rightScroll.setInteractive();
        this.rightScroll.on('pointerdown', this.onRightScrollClick, this);

        //this.middleScroll = this.add.sprite(this.bw*0.5, this.bh-(this.bh-100), "scrollMenuMiddle")
        //this.middleScroll.scale = 1.75;
        
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
        this.stateText = this.add.text(this.bw-(this.bw-90), this.bh-(this.bh-58), 'Fully repaired')
        .setOrigin(0.5)
        .setScale(1)
        .setColor('#ffffff')
        .setStyle({fontFamily: "CustomFont"});

        // Tekst o użytkowniku i regionie
        this.userText = this.add.text(this.bw*0.5, this.bh-(this.bh-26), 'Giga Ryba')
        .setOrigin(0.5)
        .setScale(1)
        .setFontSize(18)
        .setColor('#ffffff')
        .setStyle({fontFamily: "CustomFont"});
        this.regionTextProfil = this.add.text(this.bw * 0.5, this.bh - (this.bh - 58), 'Region: ', {
            fontFamily: 'CustomFont',
            fontSize: '13px',
            color: '#ffffff'
        }).setOrigin(0.5).setScale(1);

        // Mapa
        this.scrollMap = this.add.image(this.bw-126, this.bh-(this.bh-38), "scrollMapUI")
        this.scrollMap.scale = 1;
        this.input.keyboard.on('keydown-M', this.toggleMap, this);

        // Ster
        this.menu = this.add.image(this.bw-54, this.bh-(this.bh-38), "menuCog")

        // Ranking
        this.rankBorder = this.add.image(this.bw*0.5+100, this.bh-(this.bh-40), "profileBorder")
        this.rankMenu = this.add.image(this.bw*0.5+100, this.bh-(this.bh-40), "rankBadge")
        this.rankMenu.setInteractive();
        this.rankMenu.on('pointerdown', this.toggleRanking, this);
        this.input.keyboard.on('keydown-R', this.toggleRanking, this);

        //Współrzędne (kamera gracza)
        this.coords = this.add.text(this.bw*0.95, this.bh*0.825, 'Lat - ' + this.gameScene.boat.x + ' Long - ' + this.gameScene.boat.y)
        .setOrigin(0.5)
        .setScale(1)
        .setFontSize(14)
        .setColor('#ffffff')
        .setStyle({fontFamily: "CustomFont"});
        this.coords.setVisible(false);

        // Ikona użytkownika
        this.profileBorder = this.add.image(this.bw*0.5-100, this.bh-(this.bh-40), "profileBorder")
        this.profilePic = this.add.image(this.bw*0.5-100, this.bh-(this.bh-40), "tadeuszMiniProfil")
        this.profilePic.setInteractive();
        this.profilePic.on('pointerdown', this.toggleProfil, this);
        this.input.keyboard.on('keydown-P', this.toggleProfil, this);

        // Expbar
        this.fillExpBar = this.add.graphics();
        this.ExpBar = this.add.graphics();
        this.ExpBar.fillStyle(0x222222, 0.3);
        this.ExpBar.fillRect(this.bw-(this.bw-20), this.bh-(this.bh-84), this.bw-(this.bw-140), this.bh-(this.bh-28));
        this.expText = this.add.text(this.bw-(this.bw-90), this.bh-(this.bh-98), 'Level 1')
        .setOrigin(0.5)
        .setScale(1)
        .setFontSize(14)
        .setColor('#ffffff')
        .setStyle({fontFamily: "CustomFont"});

        // Speedbar
        this.fillSpeedBar = this.add.graphics();
        this.fillSpeedBar.fillStyle(0x7dff45, 1)
        this.SpeedBar = this.add.graphics();
        this.SpeedBar.fillStyle(0x222222, 0.3);
        this.SpeedBar.fillRect(this.bw-160, this.bh-(this.bh-84), this.bw-(this.bw-140), this.bh-(this.bh-28));
        this.speedText = this.add.text(this.bw-90, this.bh-(this.bh-98), '0 / Mph')
        .setOrigin(0.5)
        .setScale(1)
        .setFontSize(14)
        .setColor('#ffffff')
        .setStyle({fontFamily: "CustomFont"});

        this.boatRepairAnimation();
    }

    onLeftScrollClick() {
        if(!this.scrollIsMoving){
            this.scrollIsMoving = true;
            if(this.leftScrollScrolled){
                this.tweens.add({
                    targets: this.leftScroll,
                    y: this.leftScroll.y - this.scrollHeight,
                    duration: 400,
                    ease: 'Power1',
                    onComplete: () => { this.scrollIsMoving = false; }
                });
                this.leftScrollScrolled = false;
            }else{
                this.tweens.add({
                    targets: this.leftScroll,
                    y: this.leftScroll.y + this.scrollHeight,
                    duration: 400,
                    ease: 'Power1',
                    onComplete: () => { this.scrollIsMoving = false; }
                });
                this.leftScrollScrolled = true;
            }
        }
    }
    
    onRightScrollClick() {
        if(!this.scrollIsMoving){
            this.scrollIsMoving = true;
            if(this.rightScrollScrolled){
                this.tweens.add({
                    targets: this.rightScroll,
                    y: this.rightScroll.y - this.scrollHeight,
                    duration: 400,
                    ease: 'Power1',
                    onComplete: () => { this.scrollIsMoving = false; }
                });
                this.rightScrollScrolled = false;
            }else{
                this.tweens.add({
                    targets: this.rightScroll,
                    y: this.rightScroll.y + this.scrollHeight,
                    duration: 400,
                    ease: 'Power1',
                    onComplete: () => { this.scrollIsMoving = false; }
                });
                this.rightScrollScrolled = true;
            }
        }
    }

    boatRepairAnimation(){
        // Identyfikator zniszczonej łodzi
        this.boatRepair = this.add.sprite(this.bw*0.5, this.bh*0.5, "repairAnim")
        this.anims.create({
            key: 'hammerAnimation',
            frames: this.anims.generateFrameNumbers('repairAnim', { start: 0, end: 3 }),
            frameRate: 10, 
            repeat: -1 
        });
        this.boatRepair.play('hammerAnimation');
        this.boatRepair.setVisible(true);
        this.boatRepair.scale=1
    }

    update(time, delta) {
        this.menu.angle += this.scene.currentBoatSpeed / 300;
        // Update paska szybkości
        this.updateSpeedBar();
        this.coords.setText('Lat - ' + this.gameScene.boat.x + ' Long - ' + this.gameScene.boat.y);
        this.regionTextProfil.text = 'Region: ' + this.scene.currentMap;
        try {
            this.regionText.text = 'Region: ' + this.scene.currentMap;
        } catch (error) {
            //console.log("256 - UI -> tu jest błąd ale jednocześnie wszystko działa");
        }


        //Wyświetlanie nazwy i poziomu gracza
        if (this.userData) {
            this.user = this.userData.find((row) => row.nazwa === this.userName);
            this.userText.setText(this.userName);
            this.expText.setText('Level ' + this.user.poziom);
        }

        //Pobieranie położenia gracza
        if (this.userData)
            updateLocation(Math.round(this.gameScene.boat.x), Math.round(this.gameScene.boat.y), this.user.id);

        // Update tekstu stanu łodzi
        if (this.scene.HP === 0) {
            this.boatRepair.setVisible(true);
        } else {
            this.boatRepair.setVisible(false);
        }

        this.coords.setText('Lat - ' + this.gameScene.boat.x + ' Long - ' + this.gameScene.boat.y)
        //this.regionText.setText('Region: ' + this.scene.currentMap)

        // Update tekstu pod HP
        if (this.scene.HP != 3) {
            this.stateText.setText("Repaired in: " + Math.floor(((this.scene.shipRepairTime - this.scene.shipCooldown) / 1000)) + "s");
        } else {
            this.stateText.setText("Fully repaired");
        }

    }

        // Update serduszek życia
        setHeartState(collision){
            this.scene.shipCooldown = 0;
            this.scene.shipDamaged = true;
            this.scene.HP -= 1;
            const temp = this.heartsArray[this.scene.HP];
            temp.setTexture('emptyHeart');
            if(this.scene.HP < 1){
                this.gameScene.shipWrecked()
            }

        }
        // Odnowienie serduszek życia w czasie
        recoverHeart(){
            const temp = this.heartsArray[this.scene.HP];
            temp.setTexture('fullHeart');
            this.scene.HP += 1;
        }
        // Update paska szybkości
        updateSpeedBar(){
            this.fillSpeedBar.clear();
            if(this.scene.currentBoatSpeed > 0){
                this.fillSpeedValue = this.scene.currentBoatSpeed/1.2
                this.fillSpeedBar.fillStyle(0x7dff45, 1)
                this.speedText.setText((Math.round(this.scene.currentBoatSpeed * 10)/10)/5 + " / Mph");
                this.fillSpeedBar.fillRect(this.bw-155, this.bh-(this.bh-88), this.fillSpeedValue, this.bh-(this.bh-20));
            }else if(this.scene.currentBoatSpeed < 0){
                this.fillSpeedValue = this.scene.currentBoatSpeed/1.2
                this.fillSpeedBar.fillStyle(0xff4564, 1)
                this.speedText.setText((Math.round(-this.scene.currentBoatSpeed * 10)/10)/5 + " / Mph");
                this.fillSpeedBar.fillRect(this.bw-155, this.bh-(this.bh-88), -this.fillSpeedValue, this.bh-(this.bh-20));
            }else{
                this.speedText.setText("0 / Mph");
            }

        }
    //-------RANKING MODAL-------
    toggleRanking() {
        if (this.rankingOpen) {
            this.closeRanking();
        } else {
            this.showRanking();
        }
    }
    showRanking() {
        const modalWidth = 500;
        const modalHeight = 500;
        const modalX = (this.bw - modalWidth) / 2;
        const modalY = (this.bh - modalHeight) / 2;
        const textColor = '#ffffff';

        this.rankingOpen = true;
        this.rankBackground = this.add.image(this.bw*0.5, this.bh*0.5, "modalBackground")
        this.modal = this.add.graphics();
        this.menuText = this.add.text(modalX + modalWidth / 2, modalY + 30, 'Ranking użytkowników', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: textColor
        });
        this.menuText.setOrigin(0.5);

    //    Przyciski zmiany rankingu
    this.buttonRank2 = this.add.sprite(modalX + modalWidth/2, modalY + 75, "buttonAnim")
    this.buttonRank2.scale = 1.75;
    this.rank2 = this.add.text(modalX + modalWidth/2, modalY + 73, 'Top 100', {
        fontFamily: 'Arial',
        fontSize: '18px',
        fill: '#ffffff',
        padding: {
            x: 20,
            y: 10,
        },
    });
    this.rank2.setOrigin(0.5);
    this.buttonRank2.setInteractive();
    this.buttonRank2.on('pointerdown', () => {
        if(this.rankingFlag){this.drawRanking();}
    });
    // Ranking właściwy (wyświetlanie pól o użytkownikach)
    this.drawRanking();
    }

    drawRanking(){
        const modalWidth = 500;
        const modalHeight = 500;
        const modalX = (this.bw - modalWidth) / 2;
        const modalY = (this.bh - modalHeight) / 2;

        // Przypisujemy info o graczach w arraya
        this.Players = [];
        let i = 0;
        for(;i < this.userData.length; i++) {
            this.Player =
                {
                    name: this.userData[i].nazwa,
                    XP: this.userData[i].punktyXP,
                    Level: this.userData[i].poziom,
                }
            this.Players.push(this.Player);
        }
        this.Players.sort((a, b) => b.XP - a.XP);

        // Rysowanie
        const fontSize = '18px';
        const textColor = '#ffffff';
        const yOffset = 150;
        const yOffsetIncrement = 30;

        this.PlayerInfoDump = []

        //
        this.displayPosition = this.add.text(modalX + 10, modalY + 120, "Rank: ", {
            fontFamily: 'Arial',
            fontSize: fontSize,
            fill: textColor,

        });
        this.displayPosition.setOrigin(0);
        this.displayPosition.setStroke(this.strokeColor, this.strokeThick);

        this.displayName = this.add.text(modalX + 90, modalY + 120, "Player name: ", {
            fontFamily: 'Arial',
            fontSize: fontSize,
            fill: textColor,

        });
        this.displayName.setOrigin(0);
        this.displayName.setStroke(this.strokeColor, this.strokeThick);

        this.displayXP = this.add.text(modalX + 300, modalY + 120, "XP gained: ", {
            fontFamily: 'Arial',
            fontSize: fontSize,
            fill: textColor,

        });
        this.displayXP.setOrigin(0);
        this.displayXP.setStroke(this.strokeColor, this.strokeThick);

        this.displayLevel = this.add.text(modalX + 410, modalY + 120, "Level: ", {
            fontFamily: 'Arial',
            fontSize: fontSize,
            fill: textColor,

        });
        this.displayLevel.setOrigin(0);
        this.displayLevel.setStroke(this.strokeColor, this.strokeThick);

        this.modal.fillStyle(0xffffff, 0.5);
        this.modal.fillRect(modalX+10, modalY + 145, modalWidth-20,1);

        this.strokeColor = '0x000000'
        this.strokeThick = 2

        ///////////////////////////////
        this.currentIndex = 0;
        // Slider
        this.totalUsers = this.Players.length
        this.slider = this.rexUI.add.slider({
            x: modalX + 480,
            y: modalY + 315,
            width: 20,
            height: 340,
            orientation: 'y',

            thumb: this.rexUI.add.roundRectangle(0, 0, 0, 100, 10, '0x000000'),

            valuechangeCallback: (value) => {
                const maxIndex = this.totalUsers - 10;
                this.currentIndex = Math.floor(value * maxIndex);
                this.drawUsersInRanking(this.currentIndex);
            },
            space: {
                top: 4,
                bottom: 4
            },
            input: 'drag', // 'drag'|'click'
        })
            .layout();
        this.drawUsersInRanking(this.currentIndex);
    }
    drawUsersInRanking(currentIndex){
        const modalWidth = 500;
        const modalHeight = 500;
        const modalX = (this.bw - modalWidth) / 2;
        const modalY = (this.bh - modalHeight) / 2;
        const fontSize = '18px';
        let textColor = '#ffffff';
        const yOffset = 150;
        const yOffsetIncrement = 30;
        let endingIndex = Math.min(currentIndex + 10, this.Players.length - 1);


        this.PlayerInfoDump.forEach((playerInfo) => playerInfo.destroy());
        this.PlayerInfoDump = [];
        for (let i = currentIndex; i < endingIndex; i++) {
            if (this.Players[i].name === this.user.nazwa)
                textColor = '#d84315'
            else
                textColor = '#ffffff'

            this.PlayerInfo = this.Players[i];
            let userOffset = i - currentIndex;

            this.playerPosition = this.add.text(modalX + 10, modalY + yOffset + yOffsetIncrement * userOffset, i+1, {
                fontFamily: 'Arial',
                fontSize: fontSize,
                fill: textColor,

            });
            this.playerPosition.setOrigin(0);
            this.playerPosition.setStroke(this.strokeColor, this.strokeThick);


            this.playerName = this.add.text(modalX + 90, modalY + yOffset + yOffsetIncrement * userOffset, this.PlayerInfo.name, {
                fontFamily: 'Arial',
                fontSize: fontSize,
                fill: textColor,

            });
            this.playerName.setOrigin(0);
            this.playerName.setStroke(this.strokeColor, this.strokeThick);

            this.playerXP = this.add.text(modalX + 300, modalY + yOffset + yOffsetIncrement * userOffset, this.PlayerInfo.XP, {
                fontFamily: 'Arial',
                fontSize: fontSize,
                fill: textColor,

            });
            this.playerXP.setOrigin(0);
            this.playerXP.setStroke(this.strokeColor, this.strokeThick);

            this.PlayerLevel = this.add.text(modalX + 410, modalY + yOffset + yOffsetIncrement * userOffset, this.PlayerInfo.Level, {
                fontFamily: 'Arial',
                fontSize: fontSize,
                fill: textColor,

            });
            this.PlayerLevel.setOrigin(0);
            this.PlayerLevel.setStroke(this.strokeColor, this.strokeThick);

            //  this.modal.fillStyle(0xffffff, 0.5);
            //  this.modal.fillRect(modalX+10, modalY + yOffset + yOffsetIncrement * i + 20, modalWidth-20,1);


            this.PlayerInfoDump.push(this.playerPosition);
            this.PlayerInfoDump.push(this.playerName);
            this.PlayerInfoDump.push(this.playerXP);
            this.PlayerInfoDump.push(this.PlayerLevel);

        }
    }
    closeRanking() {
        if (this.rankingOpen) {
            this.modal.clear();
            if (this.menuText) {
                this.menuText.destroy();
                this.rank2.destroy();
                this.buttonRank2.destroy();
                for (this.Player of this.PlayerInfoDump) {
                    this.Player.destroy();
                }
                this.displayName.destroy();
                this.displayXP.destroy();
                this.displayLevel.destroy();
                this.displayPosition.destroy();
                this.rankBackground.destroy();
                this.slider.destroy();
            }
            this.rankingOpen = false;
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
        this.profilBackground = this.add.image(this.bw*0.5, this.bh*0.5, "modalBackground")

        const squareSize = 150;

        // Dodanie obrazu nałożonego na kwadrat
        this.profilePic = this.add.image(modalX+130, modalY+130, "tadeuszProfil");
        this.profilePic.setScale(2)
        this.profilePic.setDisplaySize(squareSize, squareSize)

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

        // Tekst "Profil"
        this.profilText = this.add.text(modalX + modalWidth / 2, modalY + 30, 'Profil', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: '#ffffff'
        });
        this.profilText.setOrigin(0.5);

        // Tekst "Nazwa użytkownika"
        this.userText = this.add.text((modalX + modalWidth / 2), modalY + 70, this.userName, {
            fontFamily: 'Arial',
            fontSize: '18px',
            fill: '#ffffff'
        });
        this.profilText.setOrigin(0.5);

        // Tekst "Region"
        this.regionText = this.add.text(modalX + modalWidth / 2, modalY + 120, 'Region', {
            fontFamily: 'Arial',
            fontSize: '18px',
            fill: '#ffffff'
        });
        // Tekst "Poziom"
        this.lvlText = this.add.text(modalX + modalWidth / 2, modalY + 170, 'Poziom ' + this.user.poziom, {
            fontFamily: 'Arial',
            fontSize: '18px',
            fill: '#ffffff'
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
            this.profilBackground.destroy();
            this.profileOpen = false;
        }
    }

    toggleQuiz(regionID){
        if (this.quizOpen) {
            console.log("quiz close")
            closeQuiz.call(this);
        } else {
            console.log("quiz open")
            startQuiz.call(this, regionID);
        }
    }

    //-------MAP MODAL-------
    toggleMap() {
        if (this.mapOpen) {
            this.closeMap();
        } else {
            this.showMap();
        }
    }
    showMap() {

        this.mapOpen = true;
        this.anims.create({
            key: 'mapOpen',
            frames: this.anims.generateFrameNumbers('mapAnim', { start: 0, end: 4 }),
            frameRate: 30,
            repeat: 0
        });
        this.anims.create({
            key: 'mapClose',
            frames: this.anims.generateFrameNumbers('mapAnim', { start: 4, end: 0 }),
            frameRate: 60,
            repeat: 0
        });
        this.drawMap();

    }
    drawMap(){
        this.scrollMap = this.add.sprite(this.bw*0.5, this.bh*0.6, "scrollMap")
        this.scrollMap.scale = 4;

        this.scrollMap.play('mapOpen');
        this.scrollMap.scale=4;

        // Kompas
        this.compassH = this.add.image(this.bw*0.95, this.bh*0.9, "compassHead")
        this.compassA = this.add.image(this.bw*0.95, this.bh*0.9, "compassArrow")
        this.compassH.scale = 1;
        this.compassA.scale = 2;
        this.coords.setVisible(true);
    }
    closeMap() {
        this.scrollMap.play('mapClose');
        this.scrollMap.scale=4;
        if (this.mapOpen) {
            this.scrollMap.on('animationcomplete', () => {
                this.mapOpen = false;
                this.scrollMap.destroy();
                this.compassH.destroy();
                this.compassA.destroy();
                this.coords.setVisible(false);
            });
        }
    }

    // NAUKA - MODAL
    toggleLearning(regionFlag) {
        if (this.learnerOpen) {
            this.closeLearning();
        } else {
            this.showLearning(regionFlag);
        }
    }
    showLearning(regionFlag) {
        console.log(regionFlag)
        if(regionFlag = "Jamajka"){
            this.pirateText = [
                    {
                        Polityka: 'a1',
                        Kultura: '',
                        Kuchnia: '',
                    },
                    {
                        Polityka: 'a2',
                        Kultura: '',
                        Kuchnia: '',
                    },
                    {
                        Polityka: 'a3',
                        Kultura: '',
                        Kuchnia: '',
                    },
                    {
                        Polityka: 'a4',
                        Kultura: '',
                        Kuchnia: '',
                    },
                    {
                        Polityka: 'a5',
                        Kultura: '',
                        Kuchnia: '',
                    },
                    {
                        Polityka: 'a6',
                        Kultura: '',
                        Kuchnia: '',
                    },
                    {
                        Polityka: 'a7',
                        Kultura: '',
                        Kuchnia: '',
                    },
                    {
                        Polityka: 'a8',
                        Kultura: '',
                        Kuchnia: '',
                    },
                    {
                        Polityka: 'a9',
                        Kultura: '',
                        Kuchnia: '',
                    },
                    {
                        Polityka: 'a10',
                        Kultura: '',
                        Kuchnia: '',
                    },
                ]
        }else if(regionFlag = "Panama"){
            this.pirateText = [{}]

        }else if(regionFlag = "Havana"){
            this.pirateText = [{}]
        }

        this.modalWidth = 800;
        this.modalHeight = 600;
        this.modalX = (this.bw - this.modalWidth) / 2;
        this.modalY = (this.bh - this.modalHeight) / 2;

        this.learnerOpen = true;
        this.modal = this.add.graphics();
        this.modal.fillStyle(0xffffff, 0.95);
        this.modal.fillRoundedRect(this.modalX, this.modalY, this.modalWidth, this.modalHeight, 25);

        const squareSize = 150;
        this.teacherPic = this.add.image(this.modalX + this.modalWidth / 2, this.modalY+125, "profilePic");
        this.teacherPic.setScale(2)
        this.teacherPic.setDisplaySize(squareSize, squareSize)

        // Tekst tytułowy
        this.pirateTeacherText = this.add.text(this.modalX + this.modalWidth / 2, this.modalY + 30, 'Pirat Wiedzorozdawacz', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: '#000000'
        });
        this.pirateTeacherText.setOrigin(0.5);

        // Tekst górny
        this.pirateTeacherHelloText = this.add.text(this.modalX+30, this.modalY+210, '', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: '#000000',
            wordWrap: { width: 740, useAdvancedWrap: true }
        });
        this.pirateTeacherHelloText.setOrigin(0);

        // Tekst dolny
        this.pirateTeacherBottomText = this.add.text(this.modalX+30, this.modalY+350, 'Mogę Cię wiele nauczyć, ale ty wybierz czego chciałbyś się dzisiaj dowiedzieć!', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: '#000000',
            wordWrap: { width: 740, useAdvancedWrap: true }
        });
        this.pirateTeacherBottomText.setOrigin(0);

        if(regionFlag === "Jamajka"){
            this.pirateTeacherHelloText.setText('Ahoj szczurze lądowy! Znajdujesz się na Jamajce, to fantastyczne miejsce pełne egzotycznych przygód i barwnych kultur. Od zielonych dżungli po błękitne plaże, Jamajka zaprasza Cię do odkrycia jej sekretów i przeżycia niezapomnianych chwil!')
        }else if(regionFlag === "Panama"){
            this.pirateTeacherHelloText.setText('Ahoj szczurze lądowy! Znajdujesz się w Panamie, to fantastyczne miejsce pełne egzotycznych przygód i barwnych kultur. Od zielonych dżungli po błękitne plaże, Panama zaprasza Cię do odkrycia jej sekretów i przeżycia niezapomnianych chwil!')
        }else if(regionFlag === "Havana"){
            this.pirateTeacherHelloText.setText('Ahoj szczurze lądowy! Znajdujesz się na Kubie, to fantastyczne miejsce pełne egzotycznych przygód i barwnych kultur. Od zielonych dżungli po błękitne plaże, Havana zaprasza Cię do odkrycia jej sekretów i przeżycia niezapomnianych chwil!')
        }

        this.categoryButton1 = this.add.text(this.modalX + this.modalWidth / 2 - 150, this.modalY + this.modalHeight - 125, 'Polityka', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#007bff',
            padding: {
                x: 20,
                y: 10,
            },
        });
        this.categoryButton1.setOrigin(0.5);
        this.categoryButton1.setInteractive({ useHandCursor: true });
        this.categoryButton1.visible = true;
        this.categoryButton1.on('pointerdown', () => {
            this.categoryButton1.setBackgroundColor('#52a5ff');
            this.categoryButton2.setBackgroundColor('#007bff');
            this.categoryButton3.setBackgroundColor('#007bff');
            this.category = "Polityka"
            this.nextScreenButton.visible = true;
        })

        this.categoryButton2 = this.add.text(this.modalX + this.modalWidth / 2, this.modalY + this.modalHeight - 125, 'Kultura', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#007bff',
            padding: {
                x: 20,
                y: 10,
            },
        });
        this.categoryButton2.setOrigin(0.5);
        this.categoryButton2.setInteractive({ useHandCursor: true });
        this.categoryButton2.visible = true;
        this.categoryButton2.on('pointerdown', () => {
            this.categoryButton1.setBackgroundColor('#007bff');
            this.categoryButton2.setBackgroundColor('#52a5ff');
            this.categoryButton3.setBackgroundColor('#007bff');
            this.category = "Kultura"
            this.nextScreenButton.visible = true;
        })

        this.categoryButton3 = this.add.text(this.modalX + this.modalWidth / 2 + 150, this.modalY + this.modalHeight - 125, 'Kuchnia', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#007bff',
            padding: {
                x: 20,
                y: 10,
            },
        });
        this.categoryButton3.setOrigin(0.5);
        this.categoryButton3.setInteractive({ useHandCursor: true });
        this.categoryButton3.visible = true;
        this.categoryButton3.on('pointerdown', () => {
            this.categoryButton1.setBackgroundColor('#007bff');
            this.categoryButton2.setBackgroundColor('#007bff');
            this.categoryButton3.setBackgroundColor('#52a5ff');
            this.category = "Kuchnia"
            this.nextScreenButton.visible = true;
        })


        //Przejście dalej
        this.nextScreenButton = this.add.text(this.modalX + this.modalWidth / 2 + 303, this.modalY + this.modalHeight - 45, 'Dalej', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#007bff',
            padding: {
                x: 20,
                y: 10,
            },
        });
        this.nextScreenButton.setOrigin(0.5);
        this.nextScreenButton.setInteractive({ useHandCursor: true });
        this.nextScreenButton.visible = false;

        this.nextScreenButton.on('pointerdown', () => {
            if (this.learnerOpen) {
                this.nextScreenButton.destroy();
                this.categoryButton1.destroy();
                this.categoryButton2.destroy();
                this.categoryButton3.destroy();
                this.drawLearning(this.pirateText, this.category);
            }
        });
    }
    drawLearning(Content, Category){
        this.pirateTeacherText.setText(Category)
        this.textFromContent = []
        this.indexForContent = 0
        if(Category === "Polityka"){
            for(let i = 0; i < Content.length; i++){
                this.textFromContent.push(Content[i].Polityka);

                this.pirateTeacherHelloText.setText('A więc chcesz się dowiedzieć czegoś o polityce Jamajki?')
                this.pirateTeacherBottomText.setText('')
            }
        }else if(Category === "Kultura"){
            for(let i = 0; i < Content.length; i++){
                this.textFromContent.push(Content[i].Kultura);

                this.pirateTeacherHelloText.setText('A więc chcesz się dowiedzieć czegoś o kulturze Jamajki?')
                this.pirateTeacherBottomText.setText('')
            }
        }else if(Category === "Kuchnia"){
            for(let i = 0; i < Content.length; i++){
                this.textFromContent.push(Content[i].Kuchnia);

                this.pirateTeacherHelloText.setText('A więc chcesz się dowiedzieć czegoś o kuchni Jamajki?')
                this.pirateTeacherBottomText.setText('')
            }
        }

        //Przejście dalej
        this.nextToLearnButton = this.add.text(this.modalX + this.modalWidth / 2 + 303, this.modalY + this.modalHeight - 45, 'Dalej', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#007bff',
            padding: {
                x: 20,
                y: 10,
            },
        });
        this.nextToLearnButton.setOrigin(0.5);
        this.nextToLearnButton.setInteractive({ useHandCursor: true });
        this.nextToLearnButton.visible = true;

        this.nextToLearnButton.on('pointerdown', () => {
            if (this.learnerOpen && this.indexForContent != this.textFromContent.length && this.textFromContent[this.indexForContent] != '') {
                this.pirateTeacherHelloText.setText(this.textFromContent[this.indexForContent])
                this.indexForContent += 1
            }else if(this.learnerOpen){
                this.learnerOpen = false;
                this.modal.destroy();
                this.teacherPic.destroy();
                this.pirateTeacherText.destroy();
                this.pirateTeacherHelloText.destroy();
                this.pirateTeacherBottomText.destroy();
                this.nextToLearnButton.destroy();
            }
        });
    }
    closeLearning() {
        if (this.learnerOpen) {
            this.learnerOpen = false;
            this.modal.destroy();
            this.teacherPic.destroy();
            this.pirateTeacherText.destroy();
            this.pirateTeacherHelloText.destroy();
            this.pirateTeacherBottomText.destroy();
            this.nextScreenButton.destroy();
            if (this.categoryButton1){
                this.categoryButton1.destroy();
                this.categoryButton2.destroy();
                this.categoryButton3.destroy();
            }
            if (this.nextToLearnButton){
                this.nextToLearnButton.destroy();
            }
        }
    }
}
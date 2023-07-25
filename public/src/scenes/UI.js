import {startQuiz, closeQuiz} from "./Quiz.js";
import {fetchData} from '../data_access/data_access.js';

async function getUserData() {
    this.userData = await fetchData('dane/uzytkownicy').then((data) => this.userData = data);
    console.log(this.userData);
}

export default class UI extends Phaser.Scene {
    constructor() {
        super('ui');
        //this.HP = 3; //Zmienna do sprawdzania stanu życia łodzi
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
    }
    preload() {
    }

    async create() {
        this.gameScene = this.scene.get('worldMap');

        getUserData.call(this);
        console.log(this.userData);

        this.scene = this.scene.get('game');
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
        this.regionText = this.add.text(this.bw*0.5, this.bh-(this.bh-58), 'Region: ' + this.scene.currentMap)
        .setOrigin(0.5)
        .setScale(1)
        .setFontSize(13)
        .setColor('#ffffff')
        .setStyle({fontFamily: "CustomFont"});

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
        this.profilePic = this.add.image(this.bw*0.5-100, this.bh-(this.bh-40), "profilePic")
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

        
        // // Create a graphics object to act as the track of the slider
        // var trackGraphics = this.add.graphics();
        // trackGraphics.fillStyle(0x888888);
        // trackGraphics.fillRect(100, 200, 200, 10);

        // // Create a graphics object to act as the thumb of the slider
        // var thumbGraphics = this.add.graphics();
        // thumbGraphics.fillStyle(0xffffff);
        // thumbGraphics.fillRect(100, 195, 10, 20);

        // // Add slider behavior
        // var config = {
        //     orientation: 'x', // 'x' for horizontal, 'y' for vertical
        //     track: trackGraphics,
        //     thumb: thumbGraphics,
        //     inputLength: 200, // The length of the slider track (same as the width of the track)
        //     valuechangeCallback: function (value) {
        //         console.log('Slider value:', value);
        //     }
        // };

        // var slider = this.plugins.get('rexsliderplugin').add(thumbGraphics, config);

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
        this.boatRepair = this.add.sprite(this.scene.boatCurrentX, this.scene.boatCurrentY, "repairAnim")
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
        this.menu.angle += this.scene.currentBoatSpeed/300;
        // Update paska szybkości
        this.updateSpeedBar();
        console.log(this.HP)
        // Update tekstu stanu łodzi
        if(this.scene.HP === 0){
            this.boatRepair.setVisible(true);
        }else{
            this.boatRepair.setVisible(false);
        }

        this.coords.setText('Lat - ' + this.scene.boat.x + ' Long - ' + this.scene.boat.y)
        this.regionText.setText('Region: ' + this.scene.currentMap)

        // Update tekstu pod HP
        if(this.scene.HP != 3){
            this.stateText.setText("Repaired in: " + Math.floor(((this.scene.shipRepairTime - this.scene.shipCooldown)/1000))+ "s");
        }else{
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
        for(;i < 15; i++) {
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
        const maxVisiblePlayers = 10;
        // const container = this.add.container(modalX + 10, modalY + 120);
        // const totalContainerHeight = yOffsetIncrement * this.Players.length;
        // const visibleContainerHeight = yOffsetIncrement * maxVisiblePlayers;

        this.PlayerInfoDump = []

        // this.sliderTrack = this.add.graphics();
        // this.sliderTrack.fillStyle(0x000000, 0.2);
        // this.sliderTrack.fillRect(modalX + modalWidth - 20, modalY + 120, 10, modalHeight - 140);
        // this.sliderThumb = this.add.graphics();
        // this.sliderThumb.fillStyle(0xffffff);
        // this.sliderThumb.fillRect(modalX + modalWidth - 20, modalY + 120, 10, visibleContainerHeight);

        // const thumbSprite = this.add.rectangle(modalX + modalWidth - 20, modalY + 120, 10, visibleContainerHeight, 0x000000, 0);
        // thumbSprite.setInteractive();

        // this.add.existing(this.sliderTrack);
        // this.add.existing(this.sliderThumb);
        // this.add.existing(thumbSprite);
        // this.sliderThumb.setInteractive();
        // this.input.setDraggable(this.sliderThumb);
        // if (thumbSprite && thumbSprite.setInteractive) {
        //     this.input.setDraggable(thumbSprite);
        //     thumbSprite.on('drag', (pointer, dragX, dragY) => {
        //         const minY = modalY + 120;
        //         const maxY = modalY + modalHeight - visibleContainerHeight;
        //         const containerY = Phaser.Math.Clamp(dragY, minY, maxY);
        
        //         container.y = modalY + 120 - ((containerY - minY) * (totalContainerHeight - visibleContainerHeight)) / (modalHeight - 140);
        //     });
        // }

        // function updateContainerVisibility() {
        //     const containerY = container.y - modalY - 120;
        //     const startIndex = Math.floor((containerY / (totalContainerHeight - visibleContainerHeight)) * this.Players.length);
        //     const endIndex = Math.min(startIndex + maxVisiblePlayers, this.Players.length);
    
        //     for (let i = 0; i < this.PlayerInfoDump.length; i++) { //Players podmiana
        //         this.PlayerInfoDump[i].visible = i >= startIndex && i < endIndex;
        //     }
        // }
    
        // // Update the container visibility initially
        // updateContainerVisibility.call(this);

        // //this.sliderThumb.on('drag', updateContainerVisibility, this);

        // this.add.existing(container);

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

        for (let i = 0; i < this.Players.length; i++) {

            this.PlayerInfo = this.Players[i];

            this.playerPosition = this.add.text(modalX + 10, modalY + yOffset + yOffsetIncrement * i, i+1, {
                fontFamily: 'Arial',
                fontSize: fontSize,
                fill: textColor,

            });
            this.playerPosition.setOrigin(0);
            this.playerPosition.setStroke(this.strokeColor, this.strokeThick);


            this.playerName = this.add.text(modalX + 90, modalY + yOffset + yOffsetIncrement * i, this.PlayerInfo.name, {
                fontFamily: 'Arial',
                fontSize: fontSize,
                fill: textColor,

            });
            this.playerName.setOrigin(0);
            this.playerName.setStroke(this.strokeColor, this.strokeThick);

            this.playerXP = this.add.text(modalX + 300, modalY + yOffset + yOffsetIncrement * i, this.PlayerInfo.XP, {
                fontFamily: 'Arial',
                fontSize: fontSize,
                fill: textColor,

            });
            this.playerXP.setOrigin(0);
            this.playerXP.setStroke(this.strokeColor, this.strokeThick);

            this.PlayerLevel = this.add.text(modalX + 410, modalY + yOffset + yOffsetIncrement * i, this.PlayerInfo.Level, {
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
        // this.modal.fillStyle(0x000000, 0.2);
        // this.modal.fillRect(modalX+7, modalY+120, 486, 366);
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
                // this.sliderThumb.destroy();
                // this.sliderTrack.destroy();
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
        this.profilePic = this.add.image(modalX+95, modalY+130, "profilePic");
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
        this.userText = this.add.text((modalX + modalWidth / 2), modalY + 70, this.userData[0].nazwa, {
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
        this.lvlText = this.add.text(modalX + modalWidth / 2, modalY + 170, 'Poziom ' + this.userData[0].poziom, {
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

    toggleQuiz(){
        if (this.quizOpen) {
            console.log("quiz close")
            closeQuiz.call(this);
        } else {
            console.log("quiz open")
            startQuiz.call(this);
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
}
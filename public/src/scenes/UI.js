export default class UI extends Phaser.Scene {

    constructor() {
        super('ui');
        this.HP = 3; //Zmienna do sprawdzania stanu życia łodzi
        this.menuOpen = false;
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
        this.input.keyboard.on('keydown-ESC', this.toggleModal, this);
        // Ranking
        this.rankMenu = this.add.image(this.bw*0.5+100, this.bh-(this.bh-48), "rankBadge")

        // Ikona użytkownika
        this.profilePic = this.add.image(this.bw*0.5-100, this.bh-(this.bh-48), "profilePic")

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
        // Menu - modal
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

            this.menuText = this.add.text(modalX + modalWidth / 2, modalY + 20, 'Opcje', { fontFamily: 'Arial', fontSize: '24px', fill: '#000000' });
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

        // Quiz - modal
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
            this.quizTextContentAnswerA = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
            this.quizTextContentAnswerB = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
            this.quizTextContentAnswerC = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
            this.quizTextContentAnswerD = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

            this.quizAnswerTextA = this.add.text(modalX + modalWidth / 2, modalY + 300, this.quizTextContentAnswerA,
            { fontFamily: 'Arial', fontSize: '22px', fill: '#000000', wordWrap: { width: 760, useAdvancedWrap: true }});
            this.quizAnswerTextA.setOrigin(0.5);
            this.quizAnswerTextA.setBackgroundColor('#f0f0f0');

            this.quizAnswerTextB = this.add.text(modalX + modalWidth / 2, modalY + 380, this.quizTextContentAnswerB,
            { fontFamily: 'Arial', fontSize: '22px', fill: '#000000', wordWrap: { width: 760, useAdvancedWrap: true }});
            this.quizAnswerTextB.setOrigin(0.5);
            this.quizAnswerTextB.setBackgroundColor('#f0f0f0');
            
            this.quizAnswerTextC = this.add.text(modalX + modalWidth / 2, modalY + 460, this.quizTextContentAnswerC,
            { fontFamily: 'Arial', fontSize: '22px', fill: '#000000', wordWrap: { width: 760, useAdvancedWrap: true }});
            this.quizAnswerTextC.setOrigin(0.5);
            this.quizAnswerTextC.setBackgroundColor('#f0f0f0');

            this.quizAnswerTextD = this.add.text(modalX + modalWidth / 2, modalY + 540, this.quizTextContentAnswerD,
            { fontFamily: 'Arial', fontSize: '22px', fill: '#000000', wordWrap: { width: 760, useAdvancedWrap: true }});
            this.quizAnswerTextD.setOrigin(0.5);
            this.quizAnswerTextD.setBackgroundColor('#f0f0f0');

        }

        closeQuiz(){
            if (this.quizOpen) {
                this.modal.clear();
                if (this.menuText) {
                    this.menuText.destroy();
                    this.quizCharacterImage.destroy();
                    this.quizQuestionText.destroy();
                    this.quizAnswerTextA.destroy();
                    this.quizAnswerTextB.destroy();
                    this.quizAnswerTextC.destroy();
                    this.quizAnswerTextD.destroy();
                  }
                this.quizOpen = false;
            }
        }

}

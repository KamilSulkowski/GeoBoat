export default class UI extends Phaser.Scene {

    constructor() {
        super('ui');
        this.HP = 3; //Zmienna do sprawdzania stanu życia łodzi
        this.menuOpen = false;
        this.profileOpen = false;
    }
    create() {
        this.gameScene = this.scene.get('game');
        // Pobranie wysokości/długości sceny
        this.bw = this.cameras.main.width; // width main kamery
        this.bh = this.cameras.main.height;// height main kamery

        // HUD
        this.hpBar = this.add.sprite(this.bw-(this.bw-90), this.bh-(this.bh-44), "menuBar")
        this.userBar = this.add.sprite(this.bw*0.5, this.bh-(this.bh-44), "menuLongBar")
        this.rightBar = this.add.sprite(this.bw-90, this.bh-(this.bh-44), "menuBar")


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
        this.profilePic.setInteractive();
        this.input.keyboard.on('keydown-P', this.toggleProfil, this);

    }
    // Obracanie strzałką kompasu
    setCompassArrowAngle(angle){
        this.compassA.angle = angle;
    }

    update(time, delta) {
        this.menu.angle += delta / 25;

        // Update tekstu stanu łodzi
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
        //PROFIL
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

        console.log("Profile");
        this.profileOpen = true;
        this.profilmodal = this.add.graphics();
        this.profilmodal.fillStyle(0xffffff, 0.95);
        this.profilmodal.fillRoundedRect(modalX, modalY, modalWidth, modalHeight, 25);

        this.profilText = this.add.text(modalX + modalWidth / 2, modalY + 20, 'Profil', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: '#000000'
        });
        this.profilText.setOrigin(0.5);
    }
    closeProfil() {
        if (this.profileOpen) {
            this.profilmodal.clear();
            if (this.profilText) {
                this.profilText.destroy();
            }
            this.profileOpen = false;
        }
    }
}
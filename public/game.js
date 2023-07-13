
export default class Game extends Phaser.Scene {
    constructor() {
        super('game');
    }
    Preload(){

    }
    create(){
        // Ustawienie tła na czarne
        this.cameras.main.setBackgroundColor('#000000');

        // Dodanie tekstu "test" na środek ekranu
        const text = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'test', {
            fontSize: '48px',
            color: '#ffffff'
        });
        text.setOrigin(0.5);

        // Utworzenie animacji przesuwającej tekst po ekranie
        this.tweens.add({
            targets: text,
            x: { value: this.cameras.main.width, duration: 3000, ease: 'Power1' },
            yoyo: true,
            repeat: -1
        });

    }
    update(time, delta) {
        super.update(time, delta);
    }
}
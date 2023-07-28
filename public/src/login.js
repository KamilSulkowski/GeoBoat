import {getUserData} from './data_access/data_access.js';
export class Login extends Phaser.Scene {
    constructor() {
        super('login');
    }
    preload() {}
    async create() {
        const seagullSound = this.sound.add('seagulWorld', {loop: true, volume: 0.5});
        const background = this.sound.add('background', {loop: true, volume: 0.1 });

        background.play();
        seagullSound.play();
        //Pobranie bazy użytkowników
        await getUserData.call(this);
        console.log(this.userData);

        //this.backgroundColor = '#1bd0fe';
        this.background = this.add.image(0, 0, 'backgroundImage').setOrigin(0, 0);

        // Ustawienie skalowania obrazu tła na cały ekran
        const scaleX = window.innerWidth / this.background.width;
        const scaleY = window.innerHeight / this.background.height;
        this.background.setScale(scaleX, scaleY);

        const form = document.createElement('form')
        form.setAttribute('id', 'form')

        const inputElement = document.createElement('input');
        inputElement.setAttribute('type', 'text');
        inputElement.setAttribute('placeholder', 'Podaj swój login');
        inputElement.setAttribute('name', 'login');
        form.appendChild(inputElement)

        const submitButton = document.createElement('button');
        submitButton.setAttribute('type', 'submit');
        submitButton.innerText = 'Graj';
        form.appendChild(submitButton);
        this.add.dom(this.cameras.main.centerX-25, this.cameras.main.centerY, form);

        const formElement = document.getElementById('form');
        formElement.style.width = '300px';

        const inputFields = formElement.querySelectorAll('input');
        inputFields.forEach((input) => {
            input.style.width = '80%';
            input.style.padding = '10px';
        });

        const button = formElement.querySelectorAll('button');
        button.forEach((button) => {
            button.style.width = '88%';
            button.style.padding = '10px';
            button.style.backgroundColor = '#66ff66';
        });

        const scene = this.scene;
        const t = this.add;
        var userData = this.userData;

        form.addEventListener('submit', function(event) {
            event.preventDefault();

            const formData = new FormData(form);
            const login = formData.get('login');
            console.log('Login:', login);

            if (login === 'admin') {
                seagullSound.stop();
                form.remove();
                scene.stop('login');
                scene.run('ui', {login, userData});
                scene.run('game', {login, userData});
                scene.bringToTop('ui')
            }
            else {
                t.text(640, 450, 'Niepoprawny login!', {
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    fill: '#000000',
                });
                form.reset();
            }

        });
    this.add.image((this.cameras.main.centerX), (this.cameras.main.centerY-200), 'geoboatLogo');
    }
}
export class Login extends Phaser.Scene {
    constructor() {
        super('login');
    }
    preload() {}
    create() {
        this.backgroundColor = '#1bd0fe';
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
        this.add.dom(690, 500, form);

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

        form.addEventListener('submit', function(event) {
            event.preventDefault();

            const formData = new FormData(form);
            const login = formData.get('login');
            console.log('Login:', login);

            if (login === 'admin') {
                scene.stop('login');
                scene.start('worldMap');
                scene.run('ui');
                scene.bringToTop('ui')
            }
            else {
                t.text(660, 600, 'Niepoprawny login!', {
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    fill: '#000000',
                });
                form.reset();
            }

        });

        this.add.rectangle(560, 0, 5, 600, '#ffffff')
        this.add.rectangle(890, 0, 5, 600, '#ffffff')
        this.s = this.add.text(550, 300, 'Witaj w GeoBoat!', {
            fontFamily: 'Arial',
            fontSize: '40px',
            fill: '#ffffff',
            backgroundColor: '#802b00',
            padding: {
                x: 20,
                y: 10,
            },
        });
    }
}
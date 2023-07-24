import {setWynik, setOdp, zablokujPytanie, odblokujPytanie, fetchData, updateUser} from '../data_access/data_access.js';

export function startQuiz() {
    categorySelection.call(this);
}
async function categorySelection() {
    this.modalWidth = 800;
    this.modalHeight = 600;
    this.modalX = (this.bw - this.modalWidth) / 2;
    this.modalY = (this.bh - this.modalHeight) / 2;

    this.quizOpen = true;
    this.modal = this.add.graphics();
    this.modal.fillStyle(0xffffff, 0.95);
    this.modal.fillRoundedRect(this.modalX, this.modalY, this.modalWidth, this.modalHeight, 25);

    //Pobranie danych z bazy
    this.pytania = await fetchData('dane/pytania').then((data) => this.pytania = data);
    this.odpowiedzi = await fetchData('dane/odpowiedzi').then((data) => this.odpowiedzi = data);
    this.wynik = await fetchData('dane/wynik').then((data) => this.wynik = data);
    this.categoriesJSON = await fetchData('dane/kategorie').then((data) => this.categoriesJSON = data);

    let idRegionu = 1;  //Jamajka

    //Pobranie kategorii dla wybranego regionu
    this.categories = [];
    this.selectedCategories = [];
    let i = 0;
    for(i in this.categoriesJSON) {
        if (this.categoriesJSON[i].idKategorie === idRegionu) {
            this.categories.push(this.categoriesJSON[i].nazwa);
            let k = this.categoriesJSON[i].id;
            this.selectedCategories.push(k);
        }
    }
    console.log([this.selectedCategories]);

    //Wypisanie nazw kategorii
    const yOffset = 300;
    const yOffsetIncrement = 60;
    const wordWrapWidth = 760;
    this.categoriesTexts = [];
    for (let i = 0; i < this.categories.length; i++) {
        this.categoriesText = this.add.text(this.modalX + this.modalWidth / 2, this.modalY + yOffset + yOffsetIncrement * i, this.categories[i], {
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: '#000000',
            wordWrap: { width: wordWrapWidth, useAdvancedWrap: true }

        });
        this.categoriesText.setOrigin(0.5);
        this.categoriesText.setBackgroundColor('#f0f0f0');
        this.categoriesText.setInteractive({ useHandCursor: true });
        this.categoriesText.on('pointerdown', () => {
            handleAnswerClick(i);
        });
        this.categoriesTexts.push(this.categoriesText);
    }

    //Wybieranie kategorii
    const handleAnswerClick = (index) => {
        for (let i = 0; i < this.categoriesTexts.length; i++) {
            this.categoriesTexts[i].setBackgroundColor('#f0f0f0');
        }
        this.categoriesTexts[index].setBackgroundColor('#aaffaa');
        this.selectedAnswerIndex = index;
        this.categoryButton.visible = true;
    };

    //Przycisk zatwierdzania wyboru
    this.categoryButton = this.add.text(this.modalX + this.modalWidth / 2 + 303, this.modalY + this.modalHeight - 45, 'Zatwierdź', {
        fontFamily: 'Arial',
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#007bff',
        padding: {
            x: 20,
            y: 10,
        },
    });
    this.categoryButton.setOrigin(0.5);
    this.categoryButton.setInteractive({ useHandCursor: true });
    this.categoryButton.visible = false;
    this.categoryButton.on('pointerdown', () => {
        for (this.categoriesText of this.categoriesTexts) {
            this.categoriesText.destroy();
        }
        this.categoryButton.destroy();

        console.log([this.selectedAnswerIndex]);
        showQuiz.call(this, this.selectedCategories[this.selectedAnswerIndex]);
    });
}

function prepareQuiz(cat) {
    let selectedCategory = cat

    // Pobranie dostępnych pytań z bazy
    let j = 0;
    let dostepneP = [];
    for(j in this.pytania) {
        if (this.pytania[j].idKategorii === selectedCategory) {
            dostepneP.push(this.pytania[j].id);
        }
    }

    // Losowanie kolejności pytań
    let len = dostepneP.length;
    let dostepnePytania = [];
    for(let i = 0; i < len; i++) {
        let random = Math.floor(Math.random() * (len - i));
        console.log('random', random);
        let n = dostepneP[random];
        dostepneP.splice(random, 1);
        dostepnePytania.push(n);
    }

    // Pobranie dostępnych odpowiedzi
    let i = 0;
    let dostepneO = [];
    for(i in this.odpowiedzi) {
        if (dostepnePytania.includes(this.odpowiedzi[i].idPytania)) {
            dostepneO.push(this.odpowiedzi[i].id);
        }
    }

    // Losowanie kolejności odpowiedzi
    len = dostepneO.length;
    let dostepneOdpowiedzi = [];
    for(let i = 0; i < len; i++) {
        let random = Math.floor(Math.random() * (len - i));
        console.log('random', random);
        let n = dostepneO[random];
        dostepneO.splice(random, 1);
        dostepneOdpowiedzi.push(n);
    }

    console.log(dostepnePytania);
    console.log(dostepneOdpowiedzi);
    return {dostepnePytania, dostepneOdpowiedzi};
}

function showQuiz(categoryNumber){
    setWynik(0, 0, 0, 0);

    //Tytuł
    this.menuText = this.add.text(this.modalX + this.modalWidth / 2, this.modalY + 20, 'Quiz', { fontFamily: 'Arial', fontSize: '24px', fill: '#000000' });
    this.menuText.setOrigin(0.5);

    // Linia oddzielająca
    const LineSep = new Phaser.Geom.Line(this.modalX, this.modalY + 50, this.modalX + this.modalWidth, this.modalY + 50);
    this.modal.lineStyle(2, 0x000000);
    this.modal.strokeLineShape(LineSep);

    // Postać co będzie se ruszać ustami jak pytanie będzie lecieć
    this.quizCharacterImage = this.add.image(this.modalX + 110, this.modalY + 150, 'QTPH');
    this.quizCharacterImage.setScale(0.75);

    this.aktualnePytanie = 0;
    this.punktyZdobyte = 0;
    this.liczbaPytan = 10;

    const dostepne = prepareQuiz.call(this, categoryNumber);
    this.dostepnePytania = dostepne.dostepnePytania;
    this.dostepneOdpowiedzi = dostepne.dostepneOdpowiedzi;
    this.p = this.pytania.find((row) => row.id === this.dostepnePytania[0]);
    console.log(this.p);
    this.o = [];
    this.odp = [];
    for (let i = 0; i < this.dostepneOdpowiedzi.length; i++) {
        let f = this.odpowiedzi.find((row) => row.id === this.dostepneOdpowiedzi[i])
        this.o.push(f);
    }
    for (let i = 0; i < this.dostepneOdpowiedzi.length; i++) {
        if (this.o[i].idPytania === this.p.id)
            this.odp.push(this.o[i]);
    }

    if (this.dostepnePytania.length < 10)
        this.liczbaPytan = this.dostepnePytania.length;
    drawQuestionAndAnswers.call(this);
}
function drawQuestionAndAnswers(){
    // Nowe pytanie
    newQuestion.call(this);

    // Treść pytania
    const tempQuestion = this.QnA[0]

    this.quizQuestionTextContent = tempQuestion.question
    this.quizQuestionText = this.add.text(this.modalX + this.modalWidth / 2 + 380, this.modalY + 235, this.quizQuestionTextContent,
        { fontFamily: 'Arial', fontSize: '24px', fill: '#000000', wordWrap: { width: 580, useAdvancedWrap: true }});
    this.quizQuestionText.setOrigin(1);
    this.quizQuestionText.setBackgroundColor('#f0f0f0');

    // Linia oddzielająca
    const LineSep2 = new Phaser.Geom.Line(this.modalX, this.modalY + 250, this.modalX + this.modalWidth, this.modalY + 250);
    this.modal.lineStyle(2, 0x000000);
    this.modal.strokeLineShape(LineSep2);

    // Odpowiedzi
    const answerTexts = tempQuestion.answers

    const fontSize = '22px';
    const textColor = '#000000';
    const wordWrapWidth = 760;
    const backgroundColor = '#f0f0f0';

    const yOffset = 300;
    const yOffsetIncrement = 60;

    this.quizAnswerTexts = [];

    for (let i = 0; i < answerTexts.length; i++) {
        this.quizAnswerText = this.add.text(this.modalX + this.modalWidth / 2, this.modalY + yOffset + yOffsetIncrement * i, answerTexts[i], {
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

    // Liczba pytań
    this.QuestionNumberDisplayedContent = (this.aktualnePytanie) + " / " + (this.liczbaPytan)
    console.log(this.QuestionNumberDisplayedContent)
    this.QuestionNumberDisplayed = this.add.text(this.modalX + this.modalWidth / 2 - 340, this.modalY + this.modalHeight - 45, this.QuestionNumberDisplayedContent, {
        fontFamily: 'Arial',
        fontSize: '24px',
        fill: '#000000',
        padding: {
            x: 20,
            y: 10,
        },
    });
    this.QuestionNumberDisplayed.setOrigin(0.5);

    //Przycisk odpowiedzi
    this.submitButton = this.add.text(this.modalX + this.modalWidth / 2 + 303, this.modalY + this.modalHeight - 45, 'Zatwierdź', {
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
        if (parseInt(this.selectedAnswerIndex) === parseInt(this.correctIndex))
            this.punktyZdobyte += 1;
        if(this.submitButton)
            this.submitButton.destroy();

        console.log('Selected answer index:', this.selectedAnswerIndex);
        console.log('Punkty zdobyte: ', this.punktyZdobyte);
        showResult.call(this);
    });
}

function newQuestion() {
    // Nowe pytanie i nowe odpowiedzi
    this.p = this.pytania.find((row) => row.id === this.dostepnePytania[this.aktualnePytanie]);
    console.log(this.p);
    this.aktualnePytanie += 1;
    this.odp = [];
    for (let i = 0; i < this.dostepneOdpowiedzi.length; i++) {
        if (this.o[i].idPytania === this.p.id)
            this.odp.push(this.o[i]);
    }

    this.QnA = [
        {
            question: this.p.tresc,
            answers: [
                this.odp[0].tresc,
                this.odp[1].tresc,
                this.odp[2].tresc,
                this.odp[3].tresc,
            ],
        },
        // Przypisujemy pytanie do question, odpowiedzi do answers
    ];

    // Ustawianie zdjęcia
    if (this.p.obraz !== null) {
        this.questionImage = this.add.image(this.modalX + this.modalWidth / 2, this.modalY + 140, this.p.obraz)
        this.questionImage.setScale(0.25)
    }

    // Ustawienie indeksu poprawnej odpowiedzi
    let h = 0;
    this.correctIndex = 0;
    for (h in this.odp) {
        if (this.odp[h].czyPoprawna === 1)
            this.correctIndex = h;
    }
    console.log('Correct index:', this.correctIndex);
}

function showResult() {
    let information;
    if (parseInt(this.selectedAnswerIndex) === parseInt(this.correctIndex))
        information = 'Poprawna odpowiedź';
    else {
        information = 'Błędna odpowiedź';
    }

    this.correctionText = this.add.text(this.modalX + this.modalWidth / 2 + 180, this.modalY + 555, information,
        { fontFamily: 'Arial', fontSize: '24px', fill: '#000000', wordWrap: { width: 580, useAdvancedWrap: true }});
    this.correctionText.setOrigin(1);

    //Przejście dalej
    this.nextQuestionButton = this.add.text(this.modalX + this.modalWidth / 2 + 303, this.modalY + this.modalHeight - 45, 'Dalej', {
        fontFamily: 'Arial',
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#007bff',
        padding: {
            x: 20,
            y: 10,
        },
    });
    this.nextQuestionButton.setOrigin(0.5);
    this.nextQuestionButton.setInteractive({ useHandCursor: true });
    this.nextQuestionButton.visible = true;

    this.nextQuestionButton.on('pointerdown', () => {
    if(this.aktualnePytanie === this.liczbaPytan) {
        if (this.menuText) {
            this.menuText.destroy();
            this.quizCharacterImage.destroy();
            this.quizQuestionText.destroy();
            if(this.questionImage)
                this.questionImage.destroy();
            for (this.quizAnswerText of this.quizAnswerTexts) {
                this.quizAnswerText.destroy();
            }
            this.QuestionNumberDisplayed.destroy();
            if(this.nextQuestionButton)
                this.nextQuestionButton.destroy();
        }
        this.correctionText.destroy();

        showEndScreen.call(this);
    }
    else {
        this.quizQuestionText.destroy();
        this.correctionText.destroy();
        for (this.quizAnswerText of this.quizAnswerTexts) {
            this.quizAnswerText.destroy();
        }
        if (this.questionImage)
            this.questionImage.destroy();
        if (this.nextQuestionButton)
            this.nextQuestionButton.destroy();
        this.QuestionNumberDisplayed.destroy();

        drawQuestionAndAnswers.call(this);
    }
    });
}
function showEndScreen() {
    // Gratulacje
    let header = 'Gratulacje, quiz ukończony'

    this.endText = this.add.text(this.modalX + this.modalWidth / 2 + 380, this.modalY + 235, header,
        { fontFamily: 'Arial', fontSize: '24px', fill: '#000000', wordWrap: { width: 580, useAdvancedWrap: true }});
    this.endText.setOrigin(1);

    this.submitButton.visible = true;

    // Wynik
    let points = "Wynik: \n " + (this.punktyZdobyte) + " / " + (this.liczbaPytan)
    this.points = this.add.text(this.modalWidth / 2 + 50, this.modalHeight / 2 + 50, points, {
        fontFamily: 'Arial',
        fontSize: '50px',
        fill: '#000000',
        padding: {
            x: 20,
            y: 10,
        },
    });

    //Zakończ
    this.submitButton = this.add.text(this.modalX + this.modalWidth / 2, this.modalY + this.modalHeight - 45, 'Zakończ', {
        fontFamily: 'Arial',
        fontSize: '40px',
        fill: '#ffffff',
        backgroundColor: '#007bff',
        padding: {
            x: 20,
            y: 10,
        },
    });
    this.submitButton.setOrigin(0.5);
    this.submitButton.setInteractive({ useHandCursor: true });

    this.submitButton.on('pointerdown', () => {
        this.quizQuestionText.destroy();
        for (this.quizAnswerText of this.quizAnswerTexts) {
            this.quizAnswerText.destroy();
        }
        if(this.submitButton){
            this.submitButton.destroy();
        }
        this.QuestionNumberDisplayed.destroy();

        setWynik(this.punktyZdobyte, this.liczbaPytan, 0, 0);

        this.modal.clear();
        if (this.menuText) {
            this.menuText.destroy();
            this.quizQuestionText.destroy();
            this.points.destroy();
            this.endText.destroy();
            if(this.submitButton){
                this.submitButton.destroy();
            }
            this.quizAnswerText.destroy();
            this.quizOpen = false;
        }

        console.log('Selected answer index:', this.selectedAnswerIndex);
        console.log('Punkty zdobyte!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!: ', this.punktyZdobyte);
    });
}
function updateDatabase() {
    console.log('Prawidlowa:', this.selectedAnswerIndex);
    console.log('Wybrano:', this.correctIndex);
    if (parseInt(this.selectedAnswerIndex) === parseInt(this.correctIndex)) {
        console.log('thdgfbsgrsbbgs:', this.wynik[0].punktyZdobyte);
        setWynik(parseInt(this.wynik[0].punktyZdobyte) + 1, 0, 0, 0);
        fetch('/dane/wynik')
            .then((response) => response.json())
            .then((data) => {
                let x = data;
                console.log(x);
            })
            .catch((error) => console.error('Error', error));
        console.log("Poprawna odpowiedz");
        zablokujPytanie(this.p.id);
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
}

export function closeQuiz(){
    if (this.quizOpen) {
        this.modal.clear();
        if (this.menuText) {
            this.menuText.destroy();
            this.quizQuestionText.destroy();
            for (this.quizAnswerText of this.quizAnswerTexts) {
                this.quizAnswerText.destroy();
            }
            if(this.questionImage)
                this.questionImage.destroy();
            if(this.submitButton){
                this.submitButton.destroy();
            }
            this.points.destroy();
            this.QuestionNumberDisplayed.destroy();
            this.quizCharacterImage.destroy();
            this.quizQuestionText.destroy();


        }
        for (this.categoriesText of this.categoriesTexts) {
            this.categoriesText.destroy();
        }
        this.categoryButton.destroy();
        this.quizOpen = false;
    }
}
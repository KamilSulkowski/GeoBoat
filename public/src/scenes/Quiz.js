import {setScore, lockQuestion, unlockQuestion, fetchData, updateUser} from '../data_access/data_access.js';

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
    this.questions = await fetchData('dane/pytania').then((data) => this.questions = data);
    this.answers = await fetchData('dane/odpowiedzi').then((data) => this.answers = data);
    this.score = await fetchData('dane/wynik').then((data) => this.score = data);
    this.categoriesJSON = await fetchData('dane/kategorie').then((data) => this.categoriesJSON = data);
    this.userData =  await fetchData('dane/uzytkownicy').then((data) => this.userData = data);

    let regionId = 1;  //Jamajka

    //Pobranie kategorii dla wybranego regionu
    this.categories = [];
    this.selectedCategories = [];
    let i = 0;
    for(i in this.categoriesJSON) {
        if (this.categoriesJSON[i].idKategorie === regionId) {
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

function prepareQuiz(selectedCategory) {
    setScore(0, 0, 0, 0);

    // Pobranie dostępnych pytań z bazy
    let j = 0;
    let baseQuestions = [];
    for(j in this.questions) {
        if (this.questions[j].idKategorii === selectedCategory) {
            baseQuestions.push(this.questions[j].id);
        }
    }

    // Losowanie kolejności pytań
    let len = baseQuestions.length;
    let availableQuestions = [];
    for(let i = 0; i < len; i++) {
        let random = Math.floor(Math.random() * (len - i));
        console.log('random', random);
        let n = baseQuestions[random];
        baseQuestions.splice(random, 1);
        availableQuestions.push(n);
    }

    // Pobranie dostępnych odpowiedzi
    let i = 0;
    let baseAnswers = [];
    for(i in this.answers) {
        if (availableQuestions.includes(this.answers[i].idPytania)) {
            baseAnswers.push(this.answers[i].id);
        }
    }

    // Losowanie kolejności odpowiedzi
    len = baseAnswers.length;
    let availableAnswers = [];
    for(let i = 0; i < len; i++) {
        let random = Math.floor(Math.random() * (len - i));
        console.log('random', random);
        let n = baseAnswers[random];
        baseAnswers.splice(random, 1);
        availableAnswers.push(n);
    }

    console.log(availableQuestions);
    console.log(availableAnswers);
    return {availableQuestions: availableQuestions, availableAnswers: availableAnswers};
}

function showQuiz(categoryNumber){
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

    this.currentQuestion = 0;
    this.scoredPoints = 0;
    this.earnedXP = 0;
    this.XPerQuestion = 5;      // Ilość zdobytego XP za poprawną odpowiedź
    this.numberOfQuestions = 10;

    const available = prepareQuiz.call(this, categoryNumber);
    this.availableQuestions = available.availableQuestions;
    this.availableAnswers = available.availableAnswers;
    this.p = this.questions.find((row) => row.id === this.availableQuestions[0]);
    console.log(this.p);
    this.o = [];
    this.odp = [];
    for (let i = 0; i < this.availableAnswers.length; i++) {
        let f = this.answers.find((row) => row.id === this.availableAnswers[i])
        this.o.push(f);
    }
    for (let i = 0; i < this.availableAnswers.length; i++) {
        if (this.o[i].idPytania === this.p.id)
            this.odp.push(this.o[i]);
    }

    if (this.availableQuestions.length < 10)
        this.numberOfQuestions = this.availableQuestions.length;
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
    this.QuestionNumberDisplayedContent = (this.currentQuestion) + " / " + (this.numberOfQuestions)
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
            this.scoredPoints += 1;
        if(this.submitButton)
            this.submitButton.destroy();

        console.log('Selected answer index:', this.selectedAnswerIndex);
        console.log('Punkty zdobyte: ', this.scoredPoints);
        showResult.call(this);
    });
}

function newQuestion() {
    // Nowe pytanie i nowe odpowiedzi
    this.p = this.questions.find((row) => row.id === this.availableQuestions[this.currentQuestion]);
    console.log(this.p);
    this.currentQuestion += 1;
    this.odp = [];
    for (let i = 0; i < this.availableAnswers.length; i++) {
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
    if (parseInt(this.selectedAnswerIndex) === parseInt(this.correctIndex)) {
        information = 'Poprawna odpowiedź';
        if (this.p.czyZablokowane === 0) {
            this.earnedXP += this.XPerQuestion;
            lockQuestion(this.p.id);
        }
    }
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
        if(this.currentQuestion === this.numberOfQuestions) {
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
    let points = "Wynik: \n " + (this.scoredPoints) + " / " + (this.numberOfQuestions)
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

        setScore(this.scoredPoints, this.numberOfQuestions, this.earnedXP, 0);
        updateUser(this.userData[0].punktyXP + this.earnedXP, this.userData[0].poziom, this.userData[0].wytrzymaloscLodzi,
            this.userData[0].maxPredkoscLodzi, 1);

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
        console.log('Punkty zdobyte!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!: ', this.scoredPoints);
    });
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
import {setScore, lockQuestion, unlockQuestion, fetchData, updateUser} from '../data_access/data_access.js';

export function startQuiz(regionID) {
    console.log(this.user.punktyXP);
    categorySelection.call(this, regionID);
}
async function categorySelection(regionID) {
    this.modalWidth = 800;
    this.modalHeight = 600;
    this.modalX = (this.bw - this.modalWidth) / 2;
    this.modalY = (this.bh - this.modalHeight) / 2;

    this.quizOpen = true;
    this.quizBackground = this.add.image(this.bw*0.5, this.bh*0.5, "modalBackgroundBig")
    this.modal = this.add.graphics();

    //Pobranie danych z bazy
    this.questions = await fetchData('dane/pytania').then((data) => this.questions = data);
    this.answers = await fetchData('dane/odpowiedzi').then((data) => this.answers = data);
    this.categoriesJSON = await fetchData('dane/kategorie').then((data) => this.categoriesJSON = data);
    //console.log(this.userData);
    let regionId = regionID;  //REGION

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
    //console.log([this.selectedCategories]);

    //Wypisanie nazw kategorii
    const yOffset = 250;
    const yOffsetIncrement = 60;
    const wordWrapWidth = 760;
    this.categoriesTexts = [];
    this.buttons = [];
    for (let i = 0; i < this.categories.length; i++) {
        this.button = this.add.sprite(this.modalX + this.modalWidth / 2, this.modalY + yOffset + yOffsetIncrement * i, "buttonAnim")
        this.button.scale = 1.75;
        this.categoriesText = this.add.text(this.modalX + this.modalWidth / 2, this.modalY + yOffset + yOffsetIncrement * i -5, this.categories[i], {
            fontFamily: 'ModalFont',
            fontSize: '24px',
            fill: '#ffffff',
            padding: {
                x: 20,
                y: 10,
            },
            wordWrap: { width: wordWrapWidth, useAdvancedWrap: true }

        });
        this.categoriesText.setOrigin(0.5);
        this.categoriesText.setInteractive({ useHandCursor: true });
        this.categoriesText.on('pointerdown', () => {
            handleAnswerClick(i);
        });
        this.categoriesTexts.push(this.categoriesText);
        this.buttons.push(this.button);
    }






    //Wybieranie kategorii
    const handleAnswerClick = (index) => {
        for (let i = 0; i < this.categoriesTexts.length; i++) {
            this.categoriesTexts[i].setColor('#ffffff');
        }
        this.categoriesTexts[index].setColor('#52a5ff');
        this.selectedAnswerIndex = index;
        this.categoryButton.visible = true;
        this.categoryButtonSprite.visible = true;
    };

    //Przycisk zatwierdzania wyboru
    this.categoryButtonSprite = this.add.sprite(this.modalX + this.modalWidth / 2 + 303, this.modalY + this.modalHeight - 45, "buttonAnim")
    this.categoryButtonSprite.scale = 1.75;
    this.categoryButtonSprite.visible = false;
    this.categoryButton = this.add.text(this.modalX + this.modalWidth / 2 + 303, this.modalY + this.modalHeight - 48, 'Zatwierdź', {
        fontFamily: 'ModalFont',
        fontSize: '24px',
        fill: '#ffffff',
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
        this.categoryButtonSprite.destroy();
        for(this.buttonDestroyer of this.buttons){
            this.buttonDestroyer.destroy();
        }

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
    this.menuText = this.add.text(this.modalX + this.modalWidth / 2, this.modalY + 20, 'Quiz', { fontFamily: 'ModalFont', fontSize: '24px', fill: '#000000' });
    this.menuText.setOrigin(0.5);

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
        { fontFamily: 'ModalFont', fontSize: '24px', fill: '#ffffff', wordWrap: { width: 580, useAdvancedWrap: true }});
    this.quizQuestionText.setOrigin(1);

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
            fontFamily: 'ModalFont',
            fontSize: fontSize,
            fill: textColor,
            wordWrap: { width: wordWrapWidth, useAdvancedWrap: true }

        });
        this.quizAnswerText.setOrigin(0.5);
        this.quizAnswerText.setColor(backgroundColor);
        this.quizAnswerText.setInteractive({ useHandCursor: true });
        this.quizAnswerText.on('pointerdown', () => {
            handleAnswerClick(i);
        });
        this.quizAnswerTexts.push(this.quizAnswerText);
    }

    const handleAnswerClick = (index) => {
        for (let i = 0; i < this.quizAnswerTexts.length; i++) {
            this.quizAnswerTexts[i].setColor(backgroundColor);
        }
        this.quizAnswerTexts[index].setColor('#aaffaa');
        this.selectedAnswerIndex = index; // Zapamiętanie indeksu wybranej odpowiedzi
        this.submitButton.visible = true;
        this.submitButtonnSprite.visible = true;
    };

    // Liczba pytań
    this.QuestionNumberDisplayedContent = (this.currentQuestion) + " / " + (this.numberOfQuestions)
    console.log(this.QuestionNumberDisplayedContent)
    this.QuestionNumberDisplayed = this.add.text(this.modalX + this.modalWidth / 2 - 340, this.modalY + this.modalHeight - 45, this.QuestionNumberDisplayedContent, {
        fontFamily: 'ModalFont',
        fontSize: '24px',
        fill: '#000000',
        padding: {
            x: 20,
            y: 10,
        },
    });
    this.QuestionNumberDisplayed.setOrigin(0.5);

    //Przycisk odpowiedzi
    this.submitButtonnSprite = this.add.sprite(this.modalX + this.modalWidth / 2 + 303, this.modalY + this.modalHeight - 45, "buttonAnim")
    this.submitButtonnSprite.scale = 1.75;
    this.submitButtonnSprite.visible = false;
    this.submitButton = this.add.text(this.modalX + this.modalWidth / 2 + 303, this.modalY + this.modalHeight - 48, 'Zatwierdź', {
        fontFamily: 'ModalFont',
        fontSize: '24px',
        fill: '#ffffff',
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
            this.submitButtonnSprite.destroy();

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
        this.questionImage.setScale(0.3)
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

    this.correctionText = this.add.text(this.modalX + this.modalWidth / 2 + 180,  this.modalY + this.modalHeight - 30, information,
        { fontFamily: 'ModalFont', fontSize: '24px', fill: '#000000', wordWrap: { width: 580, useAdvancedWrap: true }});
    this.correctionText.setOrigin(1);

    //Przejście dalej
    this.nextQuestionButtonSprite = this.add.sprite(this.modalX + this.modalWidth / 2 + 303, this.modalY + this.modalHeight - 45, "buttonAnim")
    this.nextQuestionButtonSprite.scale = 1.75;
    this.nextQuestionButtonSprite.visible = true;
    this.nextQuestionButton = this.add.text(this.modalX + this.modalWidth / 2 + 303, this.modalY + this.modalHeight - 48, 'Dalej', {
        fontFamily: 'ModalFont',
        fontSize: '24px',
        fill: '#ffffff',
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
                    this.nextQuestionButtonSprite.destroy();
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
                this.nextQuestionButtonSprite.destroy();
            this.QuestionNumberDisplayed.destroy();

            drawQuestionAndAnswers.call(this);
        }
    });
}
async function showEndScreen() {
    var i = 0;
    var water = 0;
    //Czy zdobyto nowy poziom
    if (50 * this.user.poziom <= this.user.punktyXP + this.earnedXP)
        i = 1
    //Czy głębokie wody będą dostępne
    if (this.user.poziom > 1)
        water = 1

    // if (this.user.poziom >= 2) {
    //     this.worldMapScene = this.scene.get('worldMap');
    //     this.worldMapScene.deepwaterIsClosed = false;
    // }

    //Ekran nowego poziomu
    //////////////////////////

    //Zapis do bazy i aktualizacja danych
    setScore(this.scoredPoints, this.numberOfQuestions, this.earnedXP, 0);
    console.log('zdobytexp: ', this.earnedXP);
    updateUser(this.user.punktyXP + this.earnedXP, this.user.poziom + i, this.user.wytrzymaloscLodzi,
        this.user.maxPredkoscLodzi, water, this.user.id);
    this.userData = await fetchData('dane/uzytkownicy').then((data) => this.userData = data);
    console.log('nowy stan: ', this.user.punktyXP);

    // Gratulacje
    let header = 'Gratulacje, quiz ukończony'

    this.endText = this.add.text(this.modalX + this.modalWidth / 2 + 380, this.modalY + 235, header,
        { fontFamily: 'ModalFont', fontSize: '24px', fill: '#ffffff', wordWrap: { width: 580, useAdvancedWrap: true }});
    this.endText.setOrigin(1);

    this.submitButton.visible = true;

    // Wynik
    let points = "Wynik: " + (this.scoredPoints) + " / " + (this.numberOfQuestions)
    this.points = this.add.text(this.modalX + this.modalWidth / 2 - 170, this.modalY+ 250, points, {
        fontFamily: 'ModalFont',
        fontSize: '50px',
        fill: '#ffffff',
        padding: {
            x: 20,
            y: 10,
        },
    });

    //Zakończ
    this.submitButtonSprite = this.add.sprite(this.modalX + this.modalWidth / 2, this.modalY + this.modalHeight - 70, "buttonAnim")
    this.submitButtonSprite.scale = 2;
    this.submitButtonSprite.visible = true;
    this.submitButton = this.add.text(this.modalX + this.modalWidth / 2, this.modalY + this.modalHeight - 72, 'Zakończ', {
        fontFamily: 'ModalFont',
        fontSize: '40px',
        fill: '#ffffff',
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
            this.submitButtonnSprite.destroy();
            this.submitButtonSprite.destroy();
        }
        this.QuestionNumberDisplayed.destroy();

        this.modal.clear();
        if (this.menuText) {
            this.menuText.destroy();
            this.quizQuestionText.destroy();
            this.points.destroy();
            this.endText.destroy();
            if(this.submitButton){
                this.submitButton.destroy();
                this.submitButtonnSprite.destroy();
                this.submitButtonSprite.destroy();
            }
            this.quizAnswerText.destroy();
            this.quizOpen = false;
        }
        this.quizBackground.destroy();

        if (i === 1) {
            const lvlupSound = this.sound.add('lvlup', {loop: false, volume: 0.5});
            lvlupSound.play();
            this.scroll = this.physics.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, "scrollLvl");
            this.anims.create({
                key: 'scrollAnimation',
                frames: this.anims.generateFrameNumbers('scrollLvl', { start: 0, end: 5 }),
                frameRate: 7,
            });
            this.scroll.play('scrollAnimation');
            setTimeout(() => {
                this.scroll.destroy();
            }, 2000);

        }
        console.log("lvlUp: ", i);
        console.log('Selected answer index:', this.selectedAnswerIndex);
        console.log('Punkty zdobyte!: ', this.scoredPoints);
    });
}

export function closeQuiz(){
    if (this.quizOpen) {
        this.modal.clear();
        if (this.menuText) {
            this.menuText.destroy();
            if(this.quizQuestionText){
                this.quizQuestionText.destroy();
            }
            if(this.answerTexts !== null){
                for (this.quizAnswerText of this.quizAnswerTexts) {
                    this.quizAnswerText.destroy();
                }
            }
            if(this.questionImage)
                this.questionImage.destroy();
            if(this.submitButton){
                this.submitButton.destroy();
                this.submitButtonnSprite.destroy();
            }
            if(this.submitButtonSprite){
                this.submitButtonSprite.destroy();
            }
            if(this.points){
                this.points.destroy();
            }
            if(this.QuestionNumberDisplayed){
                this.QuestionNumberDisplayed.destroy();
            }
            if(this.quizCharacterImage){
                this.quizCharacterImage.destroy();
            }
            if(this.quizQuestionText){
                this.quizQuestionText.destroy();
            }


        }
        if(this.buttons){
            if(this.buttons.length > 0){
                for(this.buttonDestroyer of this.buttons){
                    this.buttonDestroyer.destroy();
                }
            }
        }
        if(this.correctionText){
            this.correctionText.destroy();
        }
        if(this.nextQuestionButton){
            this.nextQuestionButton.destroy();
            this.nextQuestionButtonSprite.destroy();
        }
        if(this.quizBackground){
            this.quizBackground.destroy();
        }
        for (this.categoriesText of this.categoriesTexts) {
            this.categoriesText.destroy();
        }
        this.categoryButton.destroy();
        this.categoryButtonSprite.destroy();
        this.quizOpen = false;
    }
}
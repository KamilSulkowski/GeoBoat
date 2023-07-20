//-------QUIZ MODAL-------

function prepareQuiz(kategoria) {
    let wybranaKategoria = kategoria //polityka

    const pytania = this.cache.json.get('pytania');
    const odpowiedzi = this.cache.json.get('odpowiedzi');

    // Pobranie dostępnych pytań z bazy
    let j = 0;
    let dostepnePytania = [];
    for(j in pytania) {
        if (pytania[j].idKategorii === wybranaKategoria) {
            dostepnePytania.push(pytania[j].id);
        }
    }

    // Pobranie dostępnych odpowiedzi
    let i = 0;
    let dostepneOdpowiedzi = [];
    for(i in odpowiedzi) {
        if (dostepnePytania.includes(odpowiedzi[i].idPytania)) {
            dostepneOdpowiedzi.push(odpowiedzi[i].id);
        }
    }   // można zaimplementować losowaną kolejność

    console.log(dostepnePytania);
    console.log(dostepneOdpowiedzi);
    return {dostepnePytania, dostepneOdpowiedzi};
}

export function showQuiz(){
    console.log("xd");
    this.load.json('pytania', '../json_files/pytania.json');
    this.load.json('odpowiedzi', '../json_files/odpowiedzi.json');
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

    //---------------------------------------
    const pytania = this.cache.json.get('pytania');
    const odpowiedzi = this.cache.json.get('odpowiedzi');

    // fetch('/dane/odpowiedzi')
    //     .then((response) => response.json())
    //     .then((data) => {
    //         qwerty = data;
    //         console.log(qwerty);
    //     })
    //     .catch((error) => console.error('Error', error));

    const dostepne = prepareQuiz.call(this, 3);
    const dostepnePytania = dostepne.dostepnePytania;
    const dostepneOdpowiedzi = dostepne.dostepneOdpowiedzi;
    const p = pytania.find((row) => row.id === 1);
    console.log(p);
    const odp = [];
    for (let h = 1; h < dostepneOdpowiedzi.length + 1; h++) {
        odp.push(odpowiedzi.find((row) => row.id === h));
    }

    this.aktualnePytanie = 1;
    this.liczbaPytan = 10;
    this.QnA = [
        {
            question: p.tresc,
            answers: [
                odp[0].tresc,
                odp[1].tresc,
                odp[2].tresc,
                odp[3].tresc,
            ],
        },
        // Tutaj z bazy przypisujemy pytanie do question, odpowiedzi do answers
    ];
    let h = 0;
    let correctIndex = 0;
    for (h in odp) {
        if (odp[h].czyPoprawna === 1)
            correctIndex = h;
    }
    console.log(correctIndex);
    drawQuestionAndAnswers.call(this, correctIndex);
}
function drawQuestionAndAnswers(correctIndex){
    const modalWidth = 800;
    const modalHeight = 600;
    const modalX = (this.bw - modalWidth) / 2;
    const modalY = (this.bh - modalHeight) / 2;

    // Treść pytania
    const tempQuestion = this.QnA[0]    // <--

    this.quizQuestionTextContent = tempQuestion.question
    this.quizQuestionText = this.add.text(modalX + modalWidth / 2 + 380, modalY + 235, this.quizQuestionTextContent,
        { fontFamily: 'Arial', fontSize: '24px', fill: '#000000', wordWrap: { width: 580, useAdvancedWrap: true }});
    this.quizQuestionText.setOrigin(1);
    this.quizQuestionText.setBackgroundColor('#f0f0f0');

    // Linia oddzielająca
    const LineSep2 = new Phaser.Geom.Line(modalX, modalY + 250, modalX + modalWidth, modalY + 250);
    this.modal.lineStyle(2, 0x000000);
    this.modal.strokeLineShape(LineSep2);

    // Odpowiedzi
    const answerTexts = tempQuestion.answers    // <--

    const fontSize = '22px';
    const textColor = '#000000';
    const wordWrapWidth = 760;
    const backgroundColor = '#f0f0f0';

    const yOffset = 300;
    const yOffsetIncrement = 60;

    this.quizAnswerTexts = [];

    for (let i = 0; i < answerTexts.length; i++) {
        this.quizAnswerText = this.add.text(modalX + modalWidth / 2, modalY + yOffset + yOffsetIncrement * i, answerTexts[i], {
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
    this.QuestionNumberDisplayed = this.add.text(modalX + modalWidth / 2 - 340, modalY + modalHeight - 45, this.QuestionNumberDisplayedContent, {
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
    this.submitButton = this.add.text(modalX + modalWidth / 2 + 303, modalY + modalHeight - 45, 'Zatwierdź', {
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
        if(this.aktualnePytanie != this.liczbaPytan){
            this.quizQuestionText.destroy();
            for (this.quizAnswerText of this.quizAnswerTexts) {
                this.quizAnswerText.destroy();
            }
            if(this.submitButton){
                this.submitButton.destroy();
            }
            this.QuestionNumberDisplayed.destroy();
            this.aktualnePytanie += 1;
            drawQuestionAndAnswers.call(this);

        }else if(this.aktualnePytanie === this.liczbaPytan){
            this.modal.clear();
            if (this.menuText) {
                this.menuText.destroy();
                this.quizCharacterImage.destroy();
                this.quizQuestionText.destroy();
                for (this.quizAnswerText of this.quizAnswerTexts) {
                    this.quizAnswerText.destroy();
                }
                if(this.submitButton){
                    this.submitButton.destroy();
                }
                this.QuestionNumberDisplayed.destroy();
                this.quizOpen = false;
            }
        }
        console.log('Selected answer index:', this.selectedAnswerIndex);
    });
}

export function closeQuiz(){
    if (this.quizOpen) {
        this.modal.clear();
        if (this.menuText) {
            this.menuText.destroy();
            this.quizCharacterImage.destroy();
            this.quizQuestionText.destroy();
            for (this.quizAnswerText of this.quizAnswerTexts) {
                this.quizAnswerText.destroy();
            }
            if(this.submitButton){
                this.submitButton.destroy();
            }
            this.QuestionNumberDisplayed.destroy();
        }
        this.quizOpen = false;
        // this.quizAnswerButtons = [];
    }
}
const test = [
    {
        question: "Old meg az egyenletet: 3x+2 = 6x-4",
        answers: [1, 2, 3, 4],
        correct: 1
    },
    {
        question: "Háromszög két szöge: 30°, 80°; akkor mekkora a harmadik szöge?",
        answers: [10, 30, 70, 100],
        correct: 2
    },
    {
        question: "Melyik szám van közelebb π-hez?",
        answers: [0.5645, 4.432562, 8.17621, 2.6534213],
        correct: 3
    }
];


function allQuestions(category, maxQuestion){
    let questions = [];

    for (let index = 0; index < maxQuestion; index++) {
        questions.push(generateQuestions(category));
    }
    
    return questions;
}

function generateQuestions(category) {

    switch (category) {
        case "algb": return genAlgbQuestion();   //algebra
        
        case "geom":     //geometria
            
            break;
        
        case "func":     //függvények
            
            break;
        
        case "sets":     //halmazok
            
            break;
        
        case "komb":     //kombinatorika
            
            break;
        
        case "prob":     //valőszínűségszámítás
            
            break;
    
        default:
            break;
    }

    return {};
}


// Algeberai kérdések generálása
function genAlgbQuestion() {
    const random = Math.random();

    const a = 1 + Math.round(10 * Math.random());
    const b = 1 + Math.round(10 * Math.random());
    const c = 1 + Math.round(10 * Math.random());
    const d = 1 + Math.round(10 * Math.random());

    let x = 0;
    let egyenlet = "";

    if (random < 0.25) {
        x = (c-b)/a;
        egyenlet = `${a}x+${b}=${c}`;
    } else if (random < 0.5) {
        x = (d-b)/(a-c);
        egyenlet = `${a}x+${b}=${c}x+${d}`;
    } else if (random < 0.75) {
        x = (c+b)/a;
        egyenlet = `${a}x-${b}=${c}`;
    } else {
        x = (d-b)/(a-c);
        egyenlet = `${a}x+${b}=${c}x-${d}`;
    }

    const question = "Old meg az egyenletet x-re:\n" + egyenlet;
    let answers = [x];
    for (let i = 0; i < 3; i++) {
        answers.push(1 + (10 * Math.random()));
    }

    // LISTA ELEMEINEK FELCSERÉLÉSE RANDOM
    for (let i = answers.length - 1; i > 0; i--) {
        // Véletlen index kiválasztása
        const j = Math.floor(Math.random() * (i + 1));
        
        // Elemeinek felcserélése
        [answers[i], answers[j]] = [answers[j], answers[i]];
    }


    return {
        question: question,
        answers: answers,
        correct: answers.indexOf(x)
    }
}






//module.exports = test;
module.exports = allQuestions;
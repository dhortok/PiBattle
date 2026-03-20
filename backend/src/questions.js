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
        case "algb":     //algebra
            
            break;
        
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


module.exports = test;
// module.exports = allQuestions;
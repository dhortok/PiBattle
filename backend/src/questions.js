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


function randomizeAnswers(answers) {
    // LISTA ELEMEINEK FELCSERÉLÉSE RANDOM
    for (let i = answers.length - 1; i > 0; i--) {
        // Véletlen index kiválasztása
        const j = Math.floor(Math.random() * (i + 1));
        
        // Elemeinek felcserélése
        [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    return answers;
}




function randomBetween(min, max, integer = false) {
    if (integer) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
      return Math.random() * (max - min) + min;
    }
}


function lnko(x, y) {
    if(x == y) return x;
    if(y < x) {[x, y] = [y, x];}
    while(0 < x){
        [x, y] = [y % x, x];
    }
    return y;
}


function allQuestions(category, maxQuestion){
    let questions = [];

    for (let index = 0; index < maxQuestion; index++) {
        questions.push(generateQuestions(category));
    }
    
    return questions;
}

function generateQuestions(category) {

    switch (category) {
        case "algb": return genAlgbQuestion(); //algebra
        
        case "geom": return genGeomQuestion(); //geometria
        
        case "func":     //függvények
            
            break;
        
        case "sets":     //halmazok
            
            break;
        
        case "komb":     //kombinatorika
            
            break;
        
        case "prob": return genProbQuestion(); //valőszínűségszámítás
    
        default:
            break;
    }

    return {};
}

// ----------------------------- //
// Algeberai kérdések generálása //
// ------------------------------//
function genAlgbQuestion() {
    const random = Math.random();

    const a = randomBetween(1, 10, true);
    const b = randomBetween(1, 10, true);
    const c = randomBetween(1, 10, true);
    const d = randomBetween(1, 10, true);

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
        answers.push(randomBetween(1, 10));
    }

    answers = randomizeAnswers(answers);

    return {
        question: question,
        answers: answers,
        correct: answers.indexOf(x)
    }
}


// ------------------------------ //
// Geometriai kérdések generálása //
// ------------------------------ //
function genGeomQuestion() {
    
    // Jelenleg csak derékszögű háromszögek
    // random változók
    const k = randomBetween(1, 3, true);
    const m = randomBetween(2, 7, true);
    let n = 1;
    do {
        n = randomBetween(1, m-1, true);
    } while (m % 2 == n % 2 && lnko(m, n) != 1)

    // Háromszög oldalai
    const a = 2*k*m*n;
    const b = k*(m**2 - n**2);
    const c = k*(m**2 + n**2);
    
    const question = "Mekkora a derékszögű háromszög átlója, ha a két befogója: " + a + ", és " + b + "?";
    let answers = [c];
    for (let i = 0; i < 3; i++) {
        answers.push(randomBetween(Math.floor(c/2), c*2, true));
    }

    answers = randomizeAnswers(answers);

    return {
        question: question,
        answers: answers,
        correct: answers.indexOf(c)
    }
}


// -------------------------------- //
// Valósztínűségi kérdés generálása //
// -------------------------------- //
function genProbQuestion() {
    const szinGolyok = {
        piros: "🔴",
        narancs: "🟠",
        sarga: "🟡",
        zold: "🟢",
        kek: "🔵",
        lila: "🟣",
        barna: "🟤",
        fekete: "⚫",
        feher: "⚪"
    };
    let zsak = {};
    let osszGolyo = 0;

    // Kiválasztjuk a színeket
    let kivalaszSzinek = randomizeAnswers(Object.keys(szinGolyok)).slice(0, 2);

    // Betesszük a golyókat
    kivalaszSzinek.forEach(szin => {
        let golyoBE = randomBetween(2, 10, true);
        zsak[szin] = golyoBE;
        osszGolyo += golyoBE;
    });

    // Melyik golyót kérdezzük
    let kerdezettSzin = kivalaszSzinek[0];

    // Kiszámoljuk a valszínűségeket
    let helyesValasz = `${zsak[kerdezettSzin]}/${osszGolyo} (${(zsak[kerdezettSzin] / osszGolyo) * 100}%)`;

    let answers = [helyesValasz];

    // Hozzáadunk random válaszokat
    for (let i = 0; i < 3; i++) {
        let rngOssz = randomBetween(2, 10, true);
        let rngVal = randomBetween(1, rngOssz, true);
        answers.push(`${rngVal}/${rngOssz} (${(rngVal / rngOssz) * 100}%)`);
    }
    
    answers = randomizeAnswers(answers);

    // Megcsináljuk quizesen
    let question = `Egy zsákba beteszünk ${zsak[kivalaszSzinek[0]]}db ${kivalaszSzinek[0]} és ${zsak[kivalaszSzinek[1]]}db ${kivalaszSzinek[1]} golyót. 
    Mennyi a valószínűsége, hogy az első golyó színe: ${szinGolyok[kerdezettSzin]}?`;

    return {
        question: question,
        answers: answers,
        correct: answers.indexOf(helyesValasz)
    }
}


//module.exports = test;
module.exports = allQuestions;
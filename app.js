// --- Globális változók (DOM elemek) ---
const temaListScreen = document.getElementById("tema-list");
const temeDiv = document.getElementById("teme");
const questionScreen = document.getElementById("question-screen");
const questionDiv = document.getElementById("question"); 
const answersDiv = document.getElementById("answers");
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");
const mainTitle = document.querySelector('h1'); 
const finalTestBtn = document.getElementById("finalTestBtn"); 
const progressDiv = document.getElementById("progress"); 

// 🟢 MODÁL ELEMEK
const resultModal = document.getElementById("resultModal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalCloseBtn = document.getElementById("modalCloseBtn"); 


let questions = []; 
let currentQuestions = [];
let currentIndex = 0;
let answered = false;

let correctCount = 0;
let totalAsked = 0;

const originalTitle = "Cultura Managerială – Program de învățare";


// --- SEGÉDFÜGGVÉNYEK ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[i], array[j]];
    }
}

function getRandomQuestions(sourceArray, count) {
    shuffleArray(sourceArray);
    return sourceArray.slice(0, count);
}

// 🟢 FUNKCIÓ: Modál megjelenítése (Eredmény)
function showResultModal() {
    modalTitle.textContent = "Felicitări!"; 
    modalBody.innerHTML = `
        Ai parcurs toate întrebările din acest capitol!<br>
        Ai răspuns corect la <strong>${correctCount}</strong> din <strong>${totalAsked}</strong> întrebări.
    `;
    resultModal.style.display = 'flex'; // Modál megjelenítése középen
}

// 🟢 FUNKCIÓ: Modál bezárása
modalCloseBtn.onclick = () => {
    resultModal.style.display = 'none'; // Modál elrejtése
    backBtn.click(); // Vissza a fejezetekhez
}


// --- TÉMÁK LISTÁZÁSA ---
function renderTemaList() {
    mainTitle.textContent = originalTitle;
    temeDiv.innerHTML = "";
    
    if (questions.length === 0) {
        temeDiv.textContent = "A kérdések betöltése sikertelen. Ellenőrizze a hálózati kapcsolatot vagy a JSON fájlt.";
        finalTestBtn.style.display = 'none'; 
        return;
    }
    
    finalTestBtn.style.display = 'block'; 

    let fejezetek = [...new Set(questions.map(q => q.fejezet_cim))];

    // Sorszámozott fejezet gombok létrehozása
    fejezetek.forEach((f, index) => {
        const btn = document.createElement("button");
        btn.textContent = `${index + 1}. ${f}`; 
        
        btn.classList.add('tema-button');
        btn.onclick = () => selectTema(f);
        temeDiv.appendChild(btn);
    });
}

// --- VÉGSŐ TESZT INDÍTÁSA ---
finalTestBtn.onclick = () => {
    const finalTestQuestions = getRandomQuestions(questions, 30);
    currentQuestions = finalTestQuestions;
    
    mainTitle.textContent = "Test Final: 30 întrebări";
    correctCount = 0;
    totalAsked = 0;
    nextBtn.disabled = true; 
    currentIndex = 0;
    showQuestionScreen();
    loadQuestion();
};


// --- TÉMA KIVÁLASZTÁS ---
function selectTema(fejezet) {
    mainTitle.textContent = fejezet;
    
    correctCount = 0;
    totalAsked = 0;
    nextBtn.disabled = true; 
    
    currentQuestions = questions.filter(q => q.fejezet_cim === fejezet);
    shuffleArray(currentQuestions);
    currentIndex = 0;
    showQuestionScreen();
    loadQuestion();
}


// --- KÉRDÉS KÉPERNYŐ MEGJELENÍTÉSE és VISSZA A TÉMÁKHOZ ---
function showQuestionScreen() {
    temaListScreen.style.display = "none";
    questionScreen.style.display = "block";
}

backBtn.onclick = () => {
    questionScreen.style.display = "none";
    temaListScreen.style.display = "block";
    mainTitle.textContent = originalTitle; 
    renderTemaList();
}


// --- KÉRDÉS BETÖLTÉSE ---
function loadQuestion() {
    answered = false;
    nextBtn.disabled = true;
    answersDiv.innerHTML = ""; 

    const q = currentQuestions[currentIndex];
    
    // Számláló beállítása az új, esztétikus progressDiv elemben
    const progressText = `Întrebarea ${currentIndex + 1} din ${currentQuestions.length}`;
    progressDiv.textContent = progressText; 
    
    // Kérdés szövege
    questionDiv.textContent = `${q.id}. ${q.kerdes}`; 

    q.valaszok.forEach((answer, index) => {
        const btn = document.createElement("button");
        btn.textContent = answer;
        
        btn.removeAttribute('style'); 

        btn.onclick = () => checkAnswer(btn, index, q.helyes); 
        answersDiv.appendChild(btn);
    });
}

// --- ELLENŐRZÉS ---
function checkAnswer(button, index, correctIndex) {
    if (answered) return;
    answered = true;
    
    totalAsked++;
    if (index === correctIndex) {
        correctCount++;
    }

    const buttons = answersDiv.querySelectorAll("button");

    buttons.forEach((btn, i) => {
        btn.disabled = true;
        
        btn.removeAttribute('style'); 
        
        if (i === correctIndex) {
            btn.classList.add("correct");
            btn.textContent += " ✔";
        } else if (i === index) {
            btn.classList.add("wrong");
            btn.textContent += " ✖";
        }
    });

    nextBtn.disabled = false;
}

// --- KÖVETKEZŐ KÉRDÉS ---
nextBtn.onclick = () => {
    currentIndex++;
    if (currentIndex >= currentQuestions.length) {
        // Lecseréltük az alert()-et a custom modálra
        showResultModal();
        return;
    }
    loadQuestion();
};


// --- JSON ADATOK BETÖLTÉSE ---
async function initializeApp() {
    try {
        const response = await fetch('kerdesek.json');
        
        if (!response.ok) {
            throw new Error(`HTTP hiba: ${response.status}. A fájl betöltése sikertelen.`);
        }
        
        questions = await response.json(); 
        console.log("Kérdések sikeresen betöltve:", questions.length);
        renderTemaList(); 

    } catch (error) {
        console.error("Hiba a kérdések betöltésekor:", error);
        temeDiv.innerHTML = `Eroare la încărcarea datelor: ${error.message}<br>
                             Pentru testare, töltsd fel a GitHub Pages-re.`;
    }
}

// --- ALKALMAZÁS INDÍTÁSA ---
initializeApp();

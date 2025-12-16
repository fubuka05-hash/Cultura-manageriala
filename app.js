// --- Globális változók (DOM elemek) ---
const temaListScreen = document.getElementById("tema-list");
const temeDiv = document.getElementById("teme");
const questionScreen = document.getElementById("question-screen");
const questionDiv = document.getElementById("question");
const answersDiv = document.getElementById("answers");
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");

// 🟢 ÚJ DOM ELEM A FŐ CÍM (H1) ELÉRÉSÉHEZ
const mainTitle = document.querySelector('h1'); 

let questions = []; 
let currentQuestions = [];
let currentIndex = 0;
let answered = false;

let correctCount = 0;
let totalAsked = 0;

// Eredeti fő cím szövege, amit visszaállítunk
const originalTitle = "Cultura Managerială – Program de învățare";


// --- SEGÉDFÜGGVÉNYEK ---

// Tömb keverés
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// --- TÉMÁK LISTÁZÁSA (Kezdőképernyő) ---
function renderTemaList() {
    // 🟢 1. Cél: Fő cím visszaállítása a főoldalon
    mainTitle.textContent = originalTitle;
    
    temeDiv.innerHTML = "";
    if (questions.length === 0) {
        temeDiv.textContent = "A kérdések betöltése sikertelen. Ellenőrizze a hálózati kapcsolatot vagy a JSON fájlt.";
        return;
    }
    
    let fejezetek = [...new Set(questions.map(q => q.fejezet_cim))];

    // 🟢 2. Cél: Fejezetek sorszámozása (1., 2., 3., ...)
    fejezetek.forEach((f, index) => {
        const btn = document.createElement("button");
        // Hozzáadjuk a sorszámot a címhez
        btn.textContent = `${index + 1}. ${f}`; 
        
        btn.classList.add('tema-button');
        btn.onclick = () => selectTema(f);
        temeDiv.appendChild(btn);
    });
}


// --- TÉMA KIVÁLASZTÁS ÉS INDÍTÁS ---
function selectTema(fejezet) {
    // 🟢 1. Cél: Fejezet címének beállítása a kvíz képernyőn
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

// --- KÉRDÉS KÉPERNYŐ MEGJELENÍTÉSE ---
function showQuestionScreen() {
    temaListScreen.style.display = "none";
    questionScreen.style.display = "block";
}

// --- VISSZA A TÉMÁKHOZ ---
backBtn.onclick = () => {
    questionScreen.style.display = "none";
    temaListScreen.style.display = "block";
    
    // 🟢 1. Cél: Fő cím visszaállítása a főoldalon
    mainTitle.textContent = originalTitle; 
    
    renderTemaList();
}

// --- KÉRDÉS BETÖLTÉSE ---
function loadQuestion() {
    answered = false;
    nextBtn.disabled = true;
    answersDiv.innerHTML = ""; 

    const q = currentQuestions[currentIndex];
    
    // A kérdés számozása most: "Kérdés ID. Kérdés szövege"
    questionDiv.textContent = `${q.id}. ${q.kerdes}`; 

    q.valaszok.forEach((answer, index) => {
        const btn = document.createElement("button");
        btn.textContent = answer;
        
        btn.removeAttribute('style'); 

        btn.onclick = () => checkAnswer(btn, index, q.helyes); 
        answersDiv.appendChild(btn);
    });
}

// --- ELLENŐRZÉS (GOMB KATTINTÁS) ---
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
        alert(`Ai parcurs toate întrebările din acest capitol!\nAi răspuns corect la ${correctCount} din ${totalAsked} întrebări.`);
        
        backBtn.click(); 
        return;
    }
    loadQuestion();
};


// --- JSON ADATOK BETÖLTÉSE ASZINKRON ---
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

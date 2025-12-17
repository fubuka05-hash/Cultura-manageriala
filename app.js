// --- Globális változók (DOM elemek) ---
const temaListScreen = document.getElementById("tema-list");
const temeDiv = document.getElementById("teme");
const questionScreen = document.getElementById("question-screen");
const questionDiv = document.getElementById("question");
const answersDiv = document.getElementById("answers");
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");
const mainTitle = document.querySelector('h1'); 

// 🟢 ÚJ DOM ELEM A VÉGSŐ TESZT GOMBOZ
const finalTestBtn = document.getElementById("finalTestBtn"); 

let questions = []; 
let currentQuestions = [];
let currentIndex = 0;
let answered = false;

let correctCount = 0;
let totalAsked = 0;

const originalTitle = "Cultura Managerială – Program de învățare";


// --- SEGÉDFÜGGVÉNYEK ---

// Tömb keverés
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 🟢 FUNKCIÓ: Random kérdések kiválasztása
function getRandomQuestions(sourceArray, count) {
    // 1. Keverjük meg az eredeti tömböt (hogy a mintavétel valóban véletlenszerű legyen)
    shuffleArray(sourceArray);
    // 2. Vegyük az első 'count' elemet
    return sourceArray.slice(0, count);
}


// --- TÉMÁK LISTÁZÁSA (Kezdőképernyő) ---
function renderTemaList() {
    mainTitle.textContent = originalTitle;
    temeDiv.innerHTML = "";
    
    if (questions.length === 0) {
        temeDiv.textContent = "A kérdések betöltése sikertelen. Ellenőrizze a hálózati kapcsolatot vagy a JSON fájlt.";
        // 🟢 Rejtjük a Teszt Gombot, ha az adatok sem töltődtek be
        finalTestBtn.style.display = 'none'; 
        return;
    }
    
    // 🟢 Megjelenítjük a Teszt Gombot, ha a kérdések betöltődtek
    finalTestBtn.style.display = 'block'; 

    let fejezetek = [...new Set(questions.map(q => q.fejezet_cim))];

    fejezetek.forEach((f, index) => {
        const btn = document.createElement("button");
        btn.textContent = `${index + 1}. ${f}`; 
        
        btn.classList.add('tema-button');
        btn.onclick = () => selectTema(f);
        temeDiv.appendChild(btn);
    });
}

// 🟢 ÚJ FUNKCIÓ: Végső teszt indítása
finalTestBtn.onclick = () => {
    // 1. Kijelöljük a véletlenszerű 30 kérdést
    const finalTestQuestions = getRandomQuestions(questions, 30);
    
    // 2. Inicializáljuk a kvízt a kiválasztott kérdésekkel
    currentQuestions = finalTestQuestions;
    
    // 3. Teszt indítása (logika megegyezik a selectTema-val, de fix címmel)
    mainTitle.textContent = "Test Final: 30 întrebări";
    correctCount = 0;
    totalAsked = 0;
    nextBtn.disabled = true; 
    currentIndex = 0;
    showQuestionScreen();
    loadQuestion();
};


// --- TÉMA KIVÁLASZTÁS ÉS INDÍTÁS ---
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


// --- KÉRDÉS KÉPERNYŐ MEGJELENÍTÉSE és VISSZA A TÉMÁKHOZ (Változatlan, de a backBtn visszateszi a főcímet) ---
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


// --- KÉRDÉS BETÖLTÉSE (Változatlan) ---
function loadQuestion() {
    answered = false;
    nextBtn.disabled = true;
    answersDiv.innerHTML = ""; 

    const q = currentQuestions[currentIndex];
    
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

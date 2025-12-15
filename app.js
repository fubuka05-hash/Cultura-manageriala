// --- Globális változók (DOM elemek) ---
const temaListScreen = document.getElementById("tema-list");
const temeDiv = document.getElementById("teme");
const questionScreen = document.getElementById("question-screen");
const questionDiv = document.getElementById("question");
const answersDiv = document.getElementById("answers");
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");

let questions = []; 
let currentQuestions = [];
let currentIndex = 0;
let answered = false;

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
    temeDiv.innerHTML = "";
    if (questions.length === 0) {
        temeDiv.textContent = "A kérdések betöltése sikertelen. Ellenőrizze a hálózati kapcsolatot vagy a JSON fájlt.";
        return;
    }
    
    let fejezetek = [...new Set(questions.map(q => q.fejezet_cim))];

    fejezetek.forEach(f => {
        const btn = document.createElement("button");
        btn.textContent = f;
        btn.classList.add('tema-button');
        btn.onclick = () => selectTema(f);
        temeDiv.appendChild(btn);
    });
}


// --- TÉMA KIVÁLASZTÁS ÉS INDÍTÁS ---
function selectTema(fejezet) {
    // FONTOS: Visszaállítjuk a Next gombot, ha a felhasználó többször futtat egy fejezetet
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
    renderTemaList();
}

// --- KÉRDÉS BETÖLTÉSE ---
function loadQuestion() {
    answered = false;
    nextBtn.disabled = true;
    answersDiv.innerHTML = ""; 

    const q = currentQuestions[currentIndex];
    
    // Feltételezzük, hogy a JSON kulcsok q.id, q.kerdes stb. (kisbetűs)
    questionDiv.textContent = `${q.id}. ${q.kerdes}`; 

    q.valaszok.forEach((answer, index) => {
        const btn = document.createElement("button");
        btn.textContent = answer;
        
        // FONTOS: Töröljük a korábbi inline stílusokat (ha lennének)
        btn.removeAttribute('style'); 

        btn.onclick = () => checkAnswer(btn, index, q.helyes); 
        answersDiv.appendChild(btn);
    });
}

// --- ELLENŐRZÉS (GOMB KATTINTÁS) ---
function checkAnswer(button, index, correctIndex) {
    if (answered) return;
    answered = true;

    const buttons = answersDiv.querySelectorAll("button");

    buttons.forEach((btn, i) => {
        btn.disabled = true;
        
        // Kényszerítsük az alapértelmezett háttérszín törlését 
        // (bár a CSS !important-nak ezt kezelnie kellene)
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
        alert("Ai parcurs toate întrebările din acest capitol!");
        backBtn.click(); 
        return;
    }
    loadQuestion();
};


// --- JSON ADATOK BETÖLTÉSE ASZINKRON (A webes működés kulcsa) ---
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

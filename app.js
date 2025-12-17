// ... (A többi globális változó)
const answersDiv = document.getElementById("answers");
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");
const mainTitle = document.querySelector('h1'); 
const finalTestBtn = document.getElementById("finalTestBtn"); 

// 🟢 ÚJ DOM ELEM A PROGRESSZ SZÁMLÁLÓHOZ
const progressDiv = document.getElementById("progress"); 

// ... (A többi kód változatlan) ...

// --- KÉRDÉS BETÖLTÉSE ---
function loadQuestion() {
    answered = false;
    nextBtn.disabled = true;
    answersDiv.innerHTML = ""; 

    const q = currentQuestions[currentIndex];
    
    // 🟢 VÁLTOZÁS ITT: Progress számláló beállítása az új elemben
    const progressText = `Întrebarea ${currentIndex + 1} din ${currentQuestions.length}`;
    progressDiv.textContent = progressText; 
    
    // 🟢 VÁLTOZÁS ITT: A kérdés már NEM TARTALMAZZA a számlálót
    questionDiv.textContent = `${q.id}. ${q.kerdes}`; 

    q.valaszok.forEach((answer, index) => {
        const btn = document.createElement("button");
        btn.textContent = answer;
        
        btn.removeAttribute('style'); 

        btn.onclick = () => checkAnswer(btn, index, q.helyes); 
        answersDiv.appendChild(btn);
    });
}
// ... (A többi kód változatlan) ...

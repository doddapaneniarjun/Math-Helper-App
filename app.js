/* ===================================
   CONFIG
=================================== */
const PROBLEMS_PER_LESSON = 15; // change to 10/20/etc.

/* ===================================
   PROGRESS (localStorage)
=================================== */
const LS_KEY = "mathProgress";
function saveProgress(bookTitle, lessonTitle, question) {
  const data = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  data[bookTitle] = data[bookTitle] || {};
  data[bookTitle][lessonTitle] = data[bookTitle][lessonTitle] || [];
  if (!data[bookTitle][lessonTitle].includes(question)) {
    data[bookTitle][lessonTitle].push(question);
  }
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}
function loadProgress(bookTitle, lessonTitle) {
  const data = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  return (data[bookTitle] && data[bookTitle][lessonTitle]) ? data[bookTitle][lessonTitle] : [];
}
function clearProgress() {
  localStorage.removeItem(LS_KEY);
  updateProgressUI();
}

/* ===================================
   HELPERS
=================================== */
const QA = (q, a) => ({ question: q, answer: a });
function normalizeAnswer(s) {
  if (s == null) return "";
  let t = s.toString().trim();
  if (t.charAt(0) === "$") t = t.slice(1);
  t = t.replace(/\s+/g, ""); // remove internal spaces
  if (/^-?\d+(\.\d+)?$/.test(t)) return String(Number(t));
  return t;
}
function rint(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }
const gcd = (a,b)=>b?gcd(b,a%b):a;

/* ===================================
   PROBLEM GENERATORS
=================================== */
const Gen = {
  numbers_place_value() {
    const n = rint(1000, 9999);
    const thousands = Math.floor(n/1000)*1000;
    const hundreds  = Math.floor((n%1000)/100)*100;
    const tens      = Math.floor((n%100)/10)*10;
    const ones      = n%10;
    return QA(`Write ${n} in expanded form.`, `${thousands}+${hundreds}+${tens}+${ones}`);
  },
  add_sub() {
    if (Math.random()<0.5){ const a=rint(100,999), b=rint(100,999); return QA(`${a} + ${b} =`, String(a+b)); }
    const a=rint(200,999), b=rint(100,a-1); return QA(`${a} - ${b} =`, String(a-b));
  },
  multiplication(){ const a=rint(2,12), b=rint(2,12); return QA(`${a} × ${b} =`, String(a*b)); },
  division(){ const b=rint(2,12), q=rint(2,12), a=b*q; return QA(`${a} ÷ ${b} =`, String(q)); },
  fractions_eq_compare(){
    if (Math.random()<0.5){ const k=rint(2,5), n=rint(1,4), d=rint(n+1,6); return QA(`Simplify ${n*k}/${d*k}`, `${n}/${d}`); }
    const d=rint(2,10), n1=rint(1,d-1), n2=rint(1,d-1);
    const num=n1+n2, den=d, G=gcd(num,den); return QA(`${n1}/${d} + ${n2}/${d} =`, `${num/G}/${den/G}`);
  },
  fractions_ops(){
    const kind=rint(1,4);
    if (kind===1){ const n1=rint(1,9), d=rint(2,9), n2=rint(1,9); const num=n1+n2, G=gcd(num,d); return QA(`${n1}/${d} + ${n2}/${d} =`, `${num/G}/${d/G}`);}
    if (kind===2){ const n1=rint(1,9), d=rint(2,9), n2=rint(1,9); const num=n1-n2; const sign=num<0?"-":""; const G=gcd(Math.abs(num),d); return QA(`${n1}/${d} − ${n2}/${d} =`, `${sign}${Math.abs(num)/G}/${d/G}`);}
    if (kind===3){ const n=rint(1,9), d=rint(2,9), k=rint(2,12); const num=n*k, G=gcd(num,d); return QA(`${n}/${d} × ${k} =`, `${num/G}/${d/G}`);}
    const n=rint(1,9), d=rint(2,9), k=rint(2,12); const a=n, b=d*k, G=gcd(a,b); return QA(`${n}/${d} ÷ ${k} =`, `${a/G}/${b/G}`);
  },
  decimals(){ const a=rint(1,9)/10, b=rint(1,9)/10; const sum=(a+b).toFixed(1).replace(/\.0$/,""); return QA(`${a} + ${b} =`, sum); },
  measurement(){
    const kind = ["cm","g","ml"][rint(0,2)];
    if (kind==="cm"){ const cm=rint(50,900); return QA(`${cm} cm = ? m`, String(cm/100));}
    if (kind==="g"){ const g=rint(100,5000); return QA(`${g} g = ? kg`, String(g/1000));}
    const ml=rint(100,3000); return QA(`${ml} mL = ? L`, String(ml/1000));
  },
  time(){
    const h=rint(1,11), m=rint(0,59), add=rint(5,55);
    const mm=m+add, nh=(h+Math.floor(mm/60))%12||12, nm=mm%60;
    const pad=x=>String(x).padStart(2,"0");
    return QA(`${h}:${pad(m)} + ${add} min = ?`, `${nh}:${pad(nm)}`);
  },
  money(){
    const a=(rint(50,999)/100).toFixed(2), b=(rint(50,999)/100).toFixed(2);
    const sum=(parseFloat(a)+parseFloat(b)).toFixed(2);
    return QA(`$${a} + $${b} =`, String(parseFloat(sum)));
  },
  geometry(){ const a=rint(2,12), b=rint(2,12); return QA(`Perimeter of ${a}×${b} rectangle =`, String(2*(a+b))); },
  area_perimeter(){ const a=rint(2,12), b=rint(2,12); return QA(`Area of ${a}×${b} rectangle =`, String(a*b)); },
  data_stats(){
    const a=rint(1,10), b=rint(1,10), c=rint(1,10);
    const mean=(a+b+c)/3; return QA(`Mean of ${a},${b},${c} =`, String(mean));
  },
  algebra_linear(){
    const A=rint(2,9), B=rint(1,9), X=rint(1,9), C=A*X+B;
    return QA(`${A}x + ${B} = ${C}, x =`, String(X));
  },
  algebra_quadratic(){
    const r1=rint(1,9), r2=rint(1,9);
    const b=-(r1+r2), c=r1*r2;
    return QA(`Solve x² ${b>=0?"+":"−"} ${Math.abs(b)}x ${c>=0?"+":"−"} ${Math.abs(c)} = 0 (smaller root)`, String(Math.min(r1,r2)));
  },
  exponents(){ const a=rint(2,5), b=rint(2,5); return QA(`${a}^${b} =`, String(a**b)); },
  ratio_rate(){ const d=rint(2,9), t=rint(1,5); return QA(`${d*20} km in ${t} h = ? km/h`, String((d*20)/t)); },
  counting_probability(){ return QA(`P(rolling a 6 on a die)`, "1/6"); },
  number_theory(){
    const n=rint(10,100); const m=rint(2,10)*rint(2,10); const g=gcd(n,m);
    return QA(`gcd(${n}, ${m}) =`, String(g));
  },
  word_problems(){ const p=rint(2,5), e=rint(3,12); return QA(`${p} packs with ${e} items each. Total =`, String(p*e)); }
};

/* ===================================
   BOOK CATALOG (all books)
=================================== */
const CATALOG = [
  // … [unchanged books above] …

  { title:"AoPS — Number Theory", lessons:[
    {title:"Divisibility & Primes", summary:"Prime factorization.", topicKeys:["number_theory"]},
    {title:"GCD & LCM", summary:"Euclid algorithm.", topicKeys:["number_theory"]},
    {title:"Congruences (intro)", summary:"Mod arithmetic.", topicKeys:["number_theory"]},
    {title:"Linear Diophantine", summary:"ax+by=c.", topicKeys:["number_theory"]},
    {title:"Digits & Bases", summary:"Base b problems.", topicKeys:["number_theory","numbers_place_value"]},
    {title:"Arithmetic Functions", summary:"τ, σ, φ (lite).", topicKeys:["number_theory"]},
    {title:"Quadratic Residues (lite)", summary:"Squares mod n.", topicKeys:["number_theory"]},
    {title:"Orders & Cycles", summary:"Patterns.", topicKeys:["number_theory"]},  // ✅ fixed here
    {title:"Inequalities (NT tricks)", summary:"Bounds.", topicKeys:["number_theory"]},
    {title:"Mixed NT Problems", summary:"AMC/AIME style.", topicKeys:["number_theory"]}
  ]},

  // … [Khan book, etc. remain unchanged] …
];

/* ===================================
   BUILD BOOKS
=================================== */
function buildPracticeForLesson(topicKeys, count) {
  const items = [];
  const seen = new Set();
  let guard = 0;
  while (items.length < count && guard++ < count*50) {
    const key = topicKeys[rint(0, topicKeys.length-1)];
    const gen = Gen[key] || Gen.word_problems;
    let p = gen();
    while (seen.has(p.question)) p = gen();
    seen.add(p.question);
    items.push(p);
  }
  return items;
}
function buildBooksFromCatalog() {
  return CATALOG.map(book => ({
    title: book.title,
    lessons: book.lessons.map(lesson => ({
      title: lesson.title,
      summary: lesson.summary,
      examples: [],
      practice: buildPracticeForLesson(lesson.topicKeys, PROBLEMS_PER_LESSON)
    }))
  }));
}
const books = buildBooksFromCatalog();

/* ===================================
   ELEMENTS
=================================== */
const topicsList = document.getElementById("topics-list");
const booksList = document.getElementById("books-list");
const bookContent = document.getElementById("book-content");
const bookTitleEl = document.getElementById("book-title");
const lessonsList = document.getElementById("lessons-list");
const lessonContent = document.getElementById("lesson-content");
const lessonTitleEl = document.getElementById("lesson-title");
const lessonSummaryEl = document.getElementById("lesson-summary");
const lessonExamplesEl = document.getElementById("lesson-examples");
const lessonPracticeEl = document.getElementById("lesson-practice");

// Modal
const modal = document.getElementById("problem-modal");
const problemText = modal.querySelector(".problem-text");
const answerInput = modal.querySelector(".answer-input");
const feedback = modal.querySelector(".feedback");
const nextBtn = modal.querySelector(".next-problem"); // acts like Enter
const closeBtn = document.getElementById("close-btn");
if (nextBtn) nextBtn.textContent = "Enter";

/* Inject Clear Progress */
(function insertClearButton() {
  const tabs = document.querySelector(".tabs");
  if (!tabs) return;
  const btn = document.createElement("button");
  btn.textContent = "Clear Progress";
  btn.style.marginLeft = "10px";
  btn.onclick = clearProgress;
  tabs.appendChild(btn);
})();

/* ===================================
   STATE
=================================== */
let currentProblems = [];
let currentIndex = 0;
let currentContext = { bookTitle: null, lessonTitle: null };

/* ===================================
   RENDER: Topics (inline Enter)
=================================== */
function renderTopics() {
  topicsList.innerHTML = "";
  books.forEach((book) => {
    book.lessons.forEach((lesson) => {
      const card = document.createElement("div");
      card.className = "topic-card";

      const header = document.createElement("h3");
      header.textContent = `${book.title} - ${lesson.title}`;

      const content = document.createElement("div");
      content.className = "topic-content hidden";
      header.onclick = () => content.classList.toggle("hidden");

      content.innerHTML = `
        <p>${lesson.summary}</p>
        <strong>Practice (inline):</strong>
        <ul class="practice-list"></ul>
      `;

      const practiceList = content.querySelector(".practice-list");
      const done = loadProgress(book.title, lesson.title);

      lesson.practice.forEach((p) => {
        const li = document.createElement("li");
        li.className = "practice-item";
        li.innerHTML = `
          <span class="q">${done.includes(p.question) ? `${p.question} ✅` : p.question}</span>
          <input class="inline-answer" placeholder="Answer" ${done.includes(p.question) ? "disabled" : ""}/>
          <button class="inline-enter" ${done.includes(p.question) ? "disabled" : ""}>Enter</button>
          <span class="inline-feedback"></span>
        `;

        const input = li.querySelector(".inline-answer");
        const btn = li.querySelector(".inline-enter");
        const fb  = li.querySelector(".inline-feedback");
        const qSpan = li.querySelector(".q");

        const submit = () => {
          const user = normalizeAnswer(input.value);
          const correct = normalizeAnswer(p.answer);
          if (user === correct) {
            fb.textContent = "✅ Correct!";
            fb.style.color = "green";
            saveProgress(book.title, lesson.title, p.question);
            qSpan.textContent = p.question + " ✅";
            input.disabled = true;
            btn.disabled = true;
            updateProgressUI();
          } else {
            fb.textContent = `❌ Wrong. Correct: ${p.answer}`;
            fb.style.color = "red";
          }
        };

        btn.addEventListener("click", submit);
        input.addEventListener("keydown", (e)=>{ if (e.key === "Enter") submit(); });

        practiceList.appendChild(li);
      });

      card.append(header, content);
      topicsList.appendChild(card);
    });
  });
}

/* ===================================
   RENDER: Books
=================================== */
function renderBooks() {
  booksList.innerHTML = "";
  books.forEach((book, index) => {
    const btn = document.createElement("button");
    btn.textContent = book.title;
    btn.onclick = () => showBook(index);
    booksList.appendChild(btn);
  });
}
function showBook(index) {
  booksList.classList.add("hidden");
  bookContent.classList.remove("hidden");
  lessonContent.classList.add("hidden");

  const book = books[index];
  bookTitleEl.textContent = book.title;

  lessonsList.innerHTML = "";
  book.lessons.forEach((lesson, li) => {
    const btn = document.createElement("button");
    btn.textContent = lesson.title;
    btn.onclick = () => showLesson(index, li);
    lessonsList.appendChild(btn);
  });
}
function showLesson(bi, li) {
  const book = books[bi];
  const lesson = book.lessons[li];
  currentContext = { bookTitle: book.title, lessonTitle: lesson.title };

  lessonContent.classList.remove("hidden");
  lessonTitleEl.textContent = lesson.title;
  lessonSummaryEl.textContent = lesson.summary;

  // Examples (optional hook)
  lessonExamplesEl.innerHTML = "";

  // Practice (open modal flow)
  lessonPracticeEl.innerHTML = "";
  const done = loadProgress(book.title, lesson.title);
  lesson.practice.forEach((p, pi) => {
    const btn = document.createElement("button");
    btn.textContent = done.includes(p.question) ? `${p.question} ✅` : p.question;
    btn.onclick = () => {
      currentProblems = lesson.practice;
      currentIndex = pi;
      showCurrentProblem();
      modal.classList.add("active");
    };
    lessonPracticeEl.appendChild(btn);
  });
}

/* ===================================
   MODAL + ANSWER CHECK
=================================== */
function showCurrentProblem() {
  const cur = currentProblems[currentIndex];
  problemText.textContent = cur.question;
  answerInput.value = "";
  feedback.textContent = "";
}
function checkAnswer(goNext = false) {
  const cur = currentProblems[currentIndex];
  const correct = normalizeAnswer(cur.answer);
  const user = normalizeAnswer(answerInput.value);

  if (user === correct) {
    feedback.textContent = "✅ Correct!";
    feedback.style.color = "green";
    saveProgress(currentContext.bookTitle, currentContext.lessonTitle, cur.question);
    updateProgressUI();
  } else {
    feedback.textContent = `❌ Wrong. Correct: ${cur.answer}`;
    feedback.style.color = "red";
  }

  if (goNext) {
    setTimeout(() => {
      if (currentIndex === currentProblems.length - 1) {
        modal.classList.remove("active");
      } else {
        currentIndex += 1;
        showCurrentProblem();
      }
    }, 900);
  }
}
const nextBtnEl = document.querySelector(".next-problem");
if (nextBtnEl) nextBtnEl.onclick = () => checkAnswer(true);
if (closeBtn) closeBtn.onclick = () => modal.classList.remove("active");
answerInput.addEventListener("keydown", (e) => { if (e.key === "Enter") checkAnswer(true); });

/* ===================================
   PROGRESS UI SYNC
=================================== */
function updateProgressUI() {
  // Topics inline rows:
  document.querySelectorAll(".topic-card").forEach(card => {
    const header = card.querySelector("h3");
    if (!header) return;
    const headerText = header.textContent || "";
    const dash = headerText.lastIndexOf(" - ");
    if (dash === -1) return;

    const bookTitle = headerText.slice(0, dash);
    const lessonTitle = headerText.slice(dash + 3);
    const done = loadProgress(bookTitle, lessonTitle);

    card.querySelectorAll(".practice-list li").forEach(li => {
      const qSpan = li.querySelector(".q");
      const input = li.querySelector(".inline-answer");
      const btn = li.querySelector(".inline-enter");
      if (!qSpan) return;
      const q = qSpan.textContent.replace(" ✅", "");
      const completed = done.includes(q);
      qSpan.textContent = completed ? `${q} ✅` : q;
      if (completed) {
        if (input) input.disabled = true;
        if (btn) btn.disabled = true;
      }
    });
  });

  // Books lesson buttons:
  if (currentContext.bookTitle && currentContext.lessonTitle) {
    const done = loadProgress(currentContext.bookTitle, currentContext.lessonTitle);
    Array.from(lessonPracticeEl.children).forEach(btn => {
      const q = btn.textContent.replace(" ✅", "");
      btn.textContent = done.includes(q) ? `${q} ✅` : q;
    });
  }
}

/* ===================================
   NAV + INIT
=================================== */
document.getElementById("back-to-books").onclick = () => {
  bookContent.classList.add("hidden");
  booksList.classList.remove("hidden");
  lessonContent.classList.add("hidden");
};
document.getElementById("back-to-lessons").onclick = () => {
  lessonContent.classList.add("hidden");
};
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
    document.getElementById(btn.dataset.tab).classList.add("active");
  };
});

renderTopics();
renderBooks();
updateProgressUI();

/* ===================================
   CONFIG
=================================== */
const CHUNK_SIZE = 5;               // how many problems to render per chunk in Topics
const PROBLEMS_PER_LESSON = 15;     // total problems per lesson

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
  t = t.replace(/\s+/g, ""); // remove spaces
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
   CATALOG (BASE)
=================================== */
const CATALOG = [
  { title:"Singapore Math — Primary 1", lessons:[
    {title:"Counting & Comparing", summary:"Count to 100 and compare numbers.", topicKeys:["numbers_place_value","add_sub"]},
    {title:"Number Bonds", summary:"Make 10s and 20s.", topicKeys:["add_sub"]},
    {title:"Add within 20", summary:"Fluency up to 20.", topicKeys:["add_sub"]},
    {title:"Subtract within 20", summary:"Fluency up to 20.", topicKeys:["add_sub"]},
    {title:"Place Value (2-digit)", summary:"Tens and ones.", topicKeys:["numbers_place_value"]},
    {title:"Add within 100", summary:"Two-digit addition.", topicKeys:["add_sub"]},
    {title:"Subtract within 100", summary:"Two-digit subtraction.", topicKeys:["add_sub"]},
    {title:"Time Basics", summary:"Read hour & half-hour.", topicKeys:["time"]},
    {title:"Money (Coins)", summary:"Count US coins.", topicKeys:["money"]},
    {title:"Measurement Intro", summary:"Compare length/weight.", topicKeys:["measurement"]}
  ]},
  { title:"Singapore Math — Primary 2", lessons:[
    {title:"Place Value (3-digit)", summary:"Hundreds, tens, ones.", topicKeys:["numbers_place_value"]},
    {title:"Add/Sub within 1000", summary:"Regrouping.", topicKeys:["add_sub"]},
    {title:"Times Tables (2–5)", summary:"Foundational multiplication.", topicKeys:["multiplication"]},
    {title:"Times Tables (6–9)", summary:"Memorize/use.", topicKeys:["multiplication"]},
    {title:"Division Facts", summary:"Related to ×.", topicKeys:["division"]},
    {title:"Fractions Intro", summary:"Halves/thirds/quarters.", topicKeys:["fractions_eq_compare"]},
    {title:"Measurement 2", summary:"Length/weight/capacity.", topicKeys:["measurement"]},
    {title:"Time & Elapsed", summary:"Add/subtract minutes.", topicKeys:["time"]},
    {title:"Money Word Problems", summary:"Totals & change.", topicKeys:["money","word_problems"]},
    {title:"Geometry Intro", summary:"Polygons, right angles.", topicKeys:["geometry"]}
  ]},
  { title:"Singapore Math — Primary 3", lessons:[
    {title:"Place Value (4-digit)", summary:"Thousands to ones.", topicKeys:["numbers_place_value"]},
    {title:"Add/Sub (4-digit)", summary:"Regrouping practice.", topicKeys:["add_sub"]},
    {title:"Multiplication (2-digit×1-digit)", summary:"Algorithm.", topicKeys:["multiplication"]},
    {title:"Division (2-digit÷1-digit)", summary:"Long division intro.", topicKeys:["division"]},
    {title:"Fractions (Add/Sub)", summary:"Common denominators.", topicKeys:["fractions_eq_compare"]},
    {title:"Fractions (Mul/Div)", summary:"By whole numbers.", topicKeys:["fractions_ops"]},
    {title:"Decimals (Add/Sub)", summary:"Tenths/hundredths.", topicKeys:["decimals"]},
    {title:"Area & Perimeter", summary:"Rectangles.", topicKeys:["area_perimeter"]},
    {title:"Data & Graphs", summary:"Mean/median/mode.", topicKeys:["data_stats"]},
    {title:"Word Problems", summary:"Multi-step.", topicKeys:["word_problems","add_sub"]}
  ]},
  { title:"Singapore Math — Primary 4", lessons:[
    {title:"Place Value (to 100k)", summary:"Larger numbers.", topicKeys:["numbers_place_value"]},
    {title:"Whole Number Ops", summary:"All four operations.", topicKeys:["add_sub","multiplication","division"]},
    {title:"Factors & Multiples", summary:"Prime/composite/LCM.", topicKeys:["number_theory","multiplication"]},
    {title:"Fractions (All Ops)", summary:"+,−,×,÷ on fractions.", topicKeys:["fractions_ops"]},
    {title:"Decimals (All Ops)", summary:"+,−,×,÷ decimals.", topicKeys:["decimals"]},
    {title:"Angles & Triangles", summary:"Geometry basics.", topicKeys:["geometry"]},
    {title:"Area of Composite", summary:"Combine shapes.", topicKeys:["area_perimeter"]},
    {title:"Perimeter & Area", summary:"Mixed practice.", topicKeys:["area_perimeter"]},
    {title:"Data Handling", summary:"Charts/tables.", topicKeys:["data_stats"]},
    {title:"Word Problems 4", summary:"Multi-step.", topicKeys:["word_problems"]}
  ]},
  { title:"Singapore Math — Primary 5", lessons:[
    {title:"Whole Numbers & Decimals", summary:"Place value/ops.", topicKeys:["numbers_place_value","decimals","add_sub"]},
    {title:"Fractions (Advanced)", summary:"Complex fractions.", topicKeys:["fractions_ops"]},
    {title:"Ratio & Rate", summary:"Proportional reasoning.", topicKeys:["ratio_rate"]},
    {title:"Percentage", summary:"Percent problems.", topicKeys:["decimals"]},
    {title:"Measurement & Conversion", summary:"Units & conversion.", topicKeys:["measurement"]},
    {title:"Area of Parallelogram/Triangle", summary:"Area formulas.", topicKeys:["area_perimeter"]},
    {title:"Volume & Nets", summary:"3D shapes.", topicKeys:["geometry"]},
    {title:"Average & Data", summary:"Statistics basics.", topicKeys:["data_stats"]},
    {title:"Geometry Angles", summary:"Intersecting lines.", topicKeys:["geometry"]},
    {title:"Challenging Word Problems", summary:"Heuristics.", topicKeys:["word_problems","ratio_rate"]}
  ]},
  { title:"Singapore Math — Primary 6", lessons:[
    {title:"Numbers & Algebra", summary:"Expressions & ops.", topicKeys:["algebra_linear","add_sub"]},
    {title:"Ratio & Percent (Advanced)", summary:"Compound percent.", topicKeys:["ratio_rate","decimals"]},
    {title:"Fractions & Decimals (Advanced)", summary:"All operations.", topicKeys:["fractions_ops","decimals"]},
    {title:"Speed/Distance/Time", summary:"Rates & units.", topicKeys:["ratio_rate","time"]},
    {title:"Circles", summary:"Circumference/area.", topicKeys:["geometry","area_perimeter"]},
    {title:"Angles & Polygons", summary:"Interior/exterior.", topicKeys:["geometry"]},
    {title:"Nets & Volume (Prisms)", summary:"3D reasoning.", topicKeys:["geometry"]},
    {title:"Statistics", summary:"Mean/median/mode.", topicKeys:["data_stats"]},
    {title:"Challenging Word Problems 6", summary:"Multi-step mix.", topicKeys:["word_problems","algebra_linear"]},
    {title:"PSLE Mixed Review", summary:"Capstone review.", topicKeys:["numbers_place_value","fractions_ops","decimals","ratio_rate","geometry"]}
  ]},
  { title:"AoPS — Prealgebra", lessons:[
    {title:"Arithmetic Properties", summary:"Assoc/commut/distrib.", topicKeys:["add_sub","multiplication","exponents"]},
    {title:"Integers & Absolute Value", summary:"Negatives & |x|.", topicKeys:["add_sub"]},
    {title:"Fractions (All Ops)", summary:"+,−,×,÷.", topicKeys:["fractions_ops"]},
    {title:"Decimals & Percents", summary:"Convert & compute.", topicKeys:["decimals"]},
    {title:"Ratios & Proportions", summary:"Proportional solve.", topicKeys:["ratio_rate"]},
    {title:"Exponents & Roots", summary:"Powers/square roots.", topicKeys:["exponents"]},
    {title:"Intro Algebra", summary:"Solve 1–2 step.", topicKeys:["algebra_linear"]},
    {title:"Geometry Basics", summary:"Angles, perimeter.", topicKeys:["geometry","area_perimeter"]},
    {title:"Counting & Probability", summary:"Simple P/counting.", topicKeys:["counting_probability"]},
    {title:"Number Theory Intro", summary:"Divisibility/gcd.", topicKeys:["number_theory"]}
  ]},
  { title:"AoPS — Algebra", lessons:[
    {title:"Linear Equations", summary:"Solve & graph.", topicKeys:["algebra_linear"]},
    {title:"Systems of Equations", summary:"Elimination/subst.", topicKeys:["algebra_linear"]},
    {title:"Quadratics 1", summary:"Roots/factoring.", topicKeys:["algebra_quadratic"]},
    {title:"Quadratics 2", summary:"Completing square.", topicKeys:["algebra_quadratic"]},
    {title:"Exponents & Radicals", summary:"Rules & simplify.", topicKeys:["exponents"]},
    {title:"Polynomials", summary:"Add/multiply/factor.", topicKeys:["exponents"]},
    {title:"Rational Expressions", summary:"Simplify/solve.", topicKeys:["fractions_ops","algebra_linear"]},
    {title:"Inequalities", summary:"One-var & systems.", topicKeys:["algebra_linear"]},
    {title:"Functions", summary:"Notation & eval.", topicKeys:["algebra_linear","exponents"]},
    {title:"Word Problems (Algebra)", summary:"Translate/solve.", topicKeys:["algebra_linear","word_problems"]}
  ]},
  { title:"AoPS — Geometry", lessons:[
    {title:"Angles & Lines", summary:"Parallel/transversal.", topicKeys:["geometry"]},
    {title:"Triangles", summary:"Congruence/similarity.", topicKeys:["geometry"]},
    {title:"Quadrilaterals", summary:"Properties.", topicKeys:["geometry"]},
    {title:"Circles", summary:"Arcs/chords/angles.", topicKeys:["geometry"]},
    {title:"Area", summary:"Polygons & circles.", topicKeys:["area_perimeter"]},
    {title:"Coordinate Geo 1", summary:"Distance/slope.", topicKeys:["algebra_linear","geometry"]},
    {title:"Coordinate Geo 2", summary:"Midpoint/equations.", topicKeys:["algebra_linear","geometry"]},
    {title:"Transformations", summary:"Reflections/rot.", topicKeys:["geometry"]},
    {title:"3D Geometry", summary:"Nets/surface/volume.", topicKeys:["geometry"]},
    {title:"Challenging Geo Problems", summary:"Olympiad-style.", topicKeys:["geometry","word_problems"]}
  ]},
  { title:"AoPS — Counting & Probability", lessons:[
    {title:"Counting Basics", summary:"Additive/multiplicative.", topicKeys:["counting_probability"]},
    {title:"Permutations", summary:"Ordered counting.", topicKeys:["counting_probability"]},
    {title:"Combinations", summary:"Unordered counting.", topicKeys:["counting_probability"]},
    {title:"Binomial Coefficients", summary:"nCk properties.", topicKeys:["counting_probability"]},
    {title:"Probability Basics", summary:"Sample spaces.", topicKeys:["counting_probability"]},
    {title:"Conditional Probability", summary:"Given events.", topicKeys:["counting_probability"]},
    {title:"Expected Value", summary:"Averages in prob.", topicKeys:["counting_probability"]},
    {title:"Advanced Counting", summary:"Inclusion–exclusion.", topicKeys:["counting_probability"]},
    {title:"Distributions (intro)", summary:"Simple cases.", topicKeys:["counting_probability"]},
    {title:"Mixed AMC-style Problems", summary:"Challenge set.", topicKeys:["counting_probability"]}
  ]},
  { title:"AoPS — Number Theory", lessons:[
    {title:"Divisibility & Primes", summary:"Prime factorization.", topicKeys:["number_theory"]},
    {title:"GCD & LCM", summary:"Euclid algorithm.", topicKeys:["number_theory"]},
    {title:"Congruences (intro)", summary:"Mod arithmetic.", topicKeys:["number_theory"]},
    {title:"Linear Diophantine", summary:"ax+by=c.", topicKeys:["number_theory"]},
    {title:"Digits & Bases", summary:"Base b problems.", topicKeys:["number_theory","numbers_place_value"]},
    {title:"Arithmetic Functions", summary:"τ, σ, φ (lite).", topicKeys:["number_theory"]},
    {title:"Quadratic Residues (lite)", summary:"Squares mod n.", topicKeys:["number_theory"]},
    {title:"Orders & Cycles", summary:"Patterns.", topicKeys:["number_theory"]},
    {title:"Inequalities (NT tricks)", summary:"Bounds.", topicKeys:["number_theory"]},
    {title:"Mixed NT Problems", summary:"AMC/AIME style.", topicKeys:["number_theory"]}
  ]},
  { title:"Khan Academy — Arithmetic", lessons:[
    {title:"Whole-Number Addition", summary:"Add within 1000.", topicKeys:["add_sub"]},
    {title:"Whole-Number Subtraction", summary:"Borrowing.", topicKeys:["add_sub"]},
    {title:"Multiplication Facts", summary:"Fluency.", topicKeys:["multiplication"]},
    {title:"Division Facts", summary:"Related to ×.", topicKeys:["division"]},
    {title:"Fractions (Intro)", summary:"Parts of a whole.", topicKeys:["fractions_eq_compare"]},
    {title:"Fractions (Ops)", summary:"+,−,×,÷.", topicKeys:["fractions_ops"]},
    {title:"Decimals", summary:"Tenths/hundredths.", topicKeys:["decimals"]},
    {title:"Measurement & Time", summary:"Convert & compute.", topicKeys:["measurement","time"]},
    {title:"Geometry Basics", summary:"Angles/perimeter.", topicKeys:["geometry","area_perimeter"]},
    {title:"Word Problems", summary:"1–2 step.", topicKeys:["word_problems"]}
  ]}
];

/* ===================================
   EXTRA 5 TOPICS appended to EVERY book
=================================== */
const EXTRA_TOPICS = [
  {title:"Fractions & Decimals Mixed", summary:"Simplify, compare, convert, and compute.", topicKeys:["fractions_ops","decimals"]},
  {title:"Ratios & Proportions", summary:"Solve missing values with proportions.", topicKeys:["ratio_rate","word_problems"]},
  {title:"Geometry Essentials", summary:"Area, perimeter, angles, triangles & circles.", topicKeys:["geometry","area_perimeter"]},
  {title:"Intro to Algebra", summary:"Solve for x; evaluate expressions.", topicKeys:["algebra_linear","exponents"]},
  {title:"Word Problems & Reasoning", summary:"Multi-step, real-world situations.", topicKeys:["word_problems","add_sub","ratio_rate"]}
];
CATALOG.forEach(b => {
  EXTRA_TOPICS.forEach(t => b.lessons.push({...t}));
});

/* Build books; generate practice lazily */
const books = CATALOG.map(b => ({ title: b.title, lessons: b.lessons.map(l => ({...l, practice: null})) }));

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
const nextBtn = modal.querySelector(".next-problem");
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
   PRACTICE GENERATION (LAZY)
=================================== */
function buildPracticeForLesson(topicKeys, count) {
  const items = [];
  const seen = new Set();
  let guard = 0;
  while (items.length < count && guard++ < count*40) {
    const key = topicKeys[rint(0, topicKeys.length-1)];
    const gen = Gen[key] || Gen.word_problems;
    let p = gen();
    while (seen.has(p.question)) p = gen();
    seen.add(p.question);
    items.push(p);
  }
  return items;
}
function ensureLessonPractice(bi, li) {
  const lesson = books[bi].lessons[li];
  if (!lesson.practice || !Array.isArray(lesson.practice)) {
    lesson.practice = buildPracticeForLesson(lesson.topicKeys, PROBLEMS_PER_LESSON);
  }
  return lesson.practice;
}

/* ===================================
   RENDER: Topics (lazy, chunked)
=================================== */
function renderTopics() {
  topicsList.innerHTML = "";
  books.forEach((book, bi) => {
    book.lessons.forEach((lesson, li) => {
      const card = document.createElement("div");
      card.className = "topic-card";

      const header = document.createElement("h3");
      header.textContent = `${book.title} - ${lesson.title}`;

      const content = document.createElement("div");
      content.className = "topic-content hidden";

      content.innerHTML = `
        <p>${lesson.summary}</p>
        <strong>Practice:</strong>
        <ul class="practice-list"></ul>
        <div class="more-row"></div>
      `;

      let rendered = 0;
      header.onclick = () => {
        content.classList.toggle("hidden");
        if (!content.classList.contains("hidden") && rendered === 0) {
          const practice = ensureLessonPractice(bi, li);
          renderPracticeChunk(book.title, lesson.title, practice, content, rendered, CHUNK_SIZE);
          rendered += CHUNK_SIZE;
          addLoadMoreIfNeeded(book.title, lesson.title, practice, content, () => {
            renderPracticeChunk(book.title, lesson.title, practice, content, rendered, CHUNK_SIZE);
            rendered += CHUNK_SIZE;
          });
        }
      };

      card.append(header, content);
      topicsList.appendChild(card);
    });
  });
}

function renderPracticeChunk(bookTitle, lessonTitle, practice, container, start, size) {
  const ul = container.querySelector(".practice-list");
  const done = loadProgress(bookTitle, lessonTitle);
  const end = Math.min(start + size, practice.length);
  for (let i = start; i < end; i++) {
    const p = practice[i];
    const li = document.createElement("li");
    li.className = "practice-item";
    const completed = done.includes(p.question);
    li.innerHTML = `
      <span class="q">${completed ? `${p.question} ✅` : p.question}</span>
      <input class="inline-answer" placeholder="Answer" ${completed ? "disabled" : ""}/>
      <button class="inline-enter" ${completed ? "disabled" : ""}>Enter</button>
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
        saveProgress(bookTitle, lessonTitle, p.question);
        qSpan.textContent = p.question + " ✅";
        input.disabled = true;
        btn.disabled = true;
        updateProgressUI();
      } else {
        fb.textContent = '❌ Try again';
        fb.style.color = "red";
        if (input) { input.focus(); input.select && input.select(); }
      }
    };

    btn.addEventListener("click", submit);
    input.addEventListener("keydown", (e)=>{ if (e.key === "Enter") submit(); });

    ul.appendChild(li);
  }
}

function addLoadMoreIfNeeded(bookTitle, lessonTitle, practice, container, onMore) {
  const moreRow = container.querySelector(".more-row");
  moreRow.innerHTML = "";
  const ul = container.querySelector(".practice-list");
  if (ul.children.length < practice.length) {
    const moreBtn = document.createElement("button");
    moreBtn.textContent = "Show 5 more";
    moreBtn.onclick = () => {
      onMore();
      if (ul.children.length >= practice.length) {
        moreRow.innerHTML = "";
      }
    };
    moreRow.appendChild(moreBtn);
  }
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

  const practice = ensureLessonPractice(bi, li);

  lessonContent.classList.remove("hidden");
  lessonTitleEl.textContent = lesson.title;
  lessonSummaryEl.textContent = lesson.summary;
  lessonExamplesEl.innerHTML = "";

  lessonPracticeEl.innerHTML = "";
  const done = loadProgress(book.title, lesson.title);
  practice.forEach((p, pi) => {
    const btn = document.createElement("button");
    btn.textContent = done.includes(p.question) ? `${p.question} ✅` : p.question;
    btn.onclick = () => {
      currentProblems = practice;
      currentIndex = pi;
      showCurrentProblem();
      modal.classList.remove("hidden");
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
    feedback.textContent = '❌ Try again';
    feedback.style.color = "red";
    if (answerInput) { answerInput.focus(); answerInput.select && answerInput.select(); }
  }

  if (goNext && user === correct) {
    setTimeout(() => {
      if (currentIndex === currentProblems.length - 1) {
        modal.classList.remove("active");
      } else {
        currentIndex += 1;
        showCurrentProblem();
      }
    }, 700);
  }
}
if (nextBtn) nextBtn.onclick = () => checkAnswer(true);
if (closeBtn) closeBtn.onclick = () => { modal.classList.remove("active"); modal.classList.add("hidden"); };
answerInput.addEventListener("keydown", (e) => { if (e.key === "Enter") checkAnswer(true); });

/* ===================================
   PROGRESS UI SYNC
=================================== */
function updateProgressUI() {
  // Topics inline (update completed marks, disable inputs)
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

  // Books lesson buttons
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
// ---- Math Surfer Badge Logic (robust) ----
window.addEventListener('DOMContentLoaded', function () {
  // If your script tag is in <head>, this guarantees the DOM exists.
  const facts = [
    "sin²x + cos²x = 1",
    "e^{iπ} + 1 = 0",
    "Area of circle = πr²",
    "Derivative of sin x = cos x",
    "∑_{k=1}^{n} k = n(n+1)/2",
    "Golden ratio φ ≈ 1.618",
    "Pythagoras: a² + b² = c²",
    "ln(e) = 1",
    "d/dx (x^n) = n·x^{n-1}"
  ];

  const factPill = document.getElementById("math-surfer-fact");
  const factEl   = document.getElementById("math-fact");
  const homeLink = document.getElementById("math-surfer-home");

  // If HTML wasn't pasted, bail gracefully.
  if (!factPill || !factEl || !homeLink) return;

  // Initialize fact text
  let idx = Math.floor(Math.random() * facts.length);
  factEl.textContent = facts[idx];

  // Cycle facts on pill click (and never trigger navigation)
  factPill.addEventListener("click", function (e) {
    e.stopPropagation();
    e.preventDefault(); // just in case it sits over the link
    idx = (idx + 1) % facts.length;
    factEl.textContent = facts[idx];
  });

  // Make sure "Home" always works even if something blocks the anchor
  homeLink.addEventListener("click", function (e) {
    // If your homepage path is different, change here:
    // options you can try depending on your setup:
    // window.location.href = "/";                  // site root
    // window.location.href = "/Math-Helper-App/"; // GitHub Pages subdir
    // window.location.href = "./index.html";      // same-folder file
    // For now we respect the anchor's href:
    // (keep preventDefault off so normal link works)
  }, { capture: true });

  // Gentle shimmer along the wave text
  const waveText = document.querySelector(".wave-text textPath");
  if (waveText) {
    let offset = 10;
    setInterval(() => {
      offset += 0.3;
      if (offset > 40) offset = 10;
      waveText.setAttribute("startOffset", offset + "%");
    }, 60);
  }
/* ========= ENRICHMENT TAB ========= */
// Hard question bank (curated). Each q has {q, ans}. 5 are drawn per chapter.
const ENRICH_BANK = {
  "Algebra 1": {
    "Quadratics": [
      { q: "Solve 3x² − 5x − 2 = 0.", ans: "x = 2 or x = −1/3." },
      { q: "Vertex and axis of y = −2(x + 3)² + 5.", ans: "Vertex (−3, 5), axis x = −3, opens down." },
      { q: "For x² + kx + 12 to have a repeated root, find k.", ans: "Discriminant 0 ⇒ k² − 48 = 0 ⇒ k = ±4√3." },
      { q: "Minimum of f(x)=x² − 4x + 7.", ans: "Complete square: (x−2)² + 3 ⇒ min value 3 at x = 2." },
      { q: "Monic quadratic with roots 1 ± 2i.", ans: "x² − 2x + 5 = 0." },
      { q: "Sum/product of roots of 5x² − 9x + 2.", ans: "Sum = 9/5, product = 2/5." },
      { q: "If x² − 6x + c has one root 4, find c and the other root.", ans: "Plug x=4 ⇒ 16 − 24 + c=0 ⇒ c=8; other root = 2." }
    ],
    "Systems": [
      { q: "Solve { 2x + 3y = 7, 5x − 2y = −4 }.", ans: "x = −2/19, y = 47/19." },
      { q: "Solve linear–quadratic: { y = x² − 5x + 6, 2y + x = 10 }.", ans: "Substitute y ⇒ 2(x² − 5x + 6) + x = 10 ⇒ 2x² − 9x + 2 = 0 ⇒ x = (9 ± √(81 − 16))/4 = (9 ± √65)/4; y = 10 − x)/2." },
      { q: "Solve { 3x − y = 11, x + 2y = −1 }.", ans: "x = 7/5, y = −6/5." },
      { q: "Solve { y = 2x + 1, y = −x + 7 }.", ans: "2x + 1 = −x + 7 ⇒ x = 2, y = 5." },
      { q: "Solve { x − y = 5, 4x + y = 13 }.", ans: "x = 3, y = −2." }
    ],
    "Exponents & Radicals": [
      { q: "Simplify (27x⁶y³)^(1/3).", ans: "3x²y." },
      { q: "Solve 2^(x+1) = 5·2^(x−2).", ans: "2^(x+1)/2^(x−2) = 5 ⇒ 2³ = 5 ⇒ contradiction; No real x. (If intended 2^(x+1) = 5·2^(x−2) ⇒ 2³ = 5 ⇒ false.)" },
      { q: "Solve √(x+5) − √(x−3) = 1.", ans: "Isolate and square ⇒ x = 5." },
      { q: "Rationalize 5/(2−√3).", ans: "Multiply conj ⇒ (5(2+√3))/(4−3) = 10 + 5√3." },
      { q: "Simplify (a^(3/2) · a^(−1/2)) / a^(1/3).", ans: "a^(1) / a^(1/3) = a^(2/3)." }
    ]
  },

  "Geometry": {
    "Similarity": [
      { q: "In △ABC ~ △DEF with AB:DE = 3:5 and AC = 12, find DF if AC:DF = 3:5.", ans: "DF = 20." },
      { q: "Two similar triangles have perimeters 18 and 30. A side is 9 in the larger; its match in the smaller?", ans: "Scale 18/30 = 3/5 ⇒ 9·(3/5) = 27/5." },
      { q: "Right triangle legs 7, 24. Altitude from right angle to hypotenuse?", ans: "h = (leg1·leg2)/hyp ⇒ hyp=25 ⇒ h = 168/25." },
      { q: "In △ABC, angle A=30°, angle B=50°. Angle C? Median from C equals? (tricky)", ans: "Angle C=100°. Median doesn’t equal special length unless isosceles; no direct equality implied." },
      { q: "Sides in ratio 2:3:4. Perimeter 81. Find sides.", ans: "Sum ratio 9 ⇒ scale 9 ⇒ sides 18, 27, 36." }
    ],
    "Circles": [
      { q: "Chord 10 in a circle; distance from center 4. Radius?", ans: "Use right triangle: r² = 5² + 4² ⇒ r = √41." },
      { q: "Central angle 72°. Arc length with r=9?", ans: "s = (72/360)·2π·9 = (1/5)·18π = 18π/5." },
      { q: "Two tangents from external point are 13 and 13; distance between tangent points is 10. Radius?", ans: "Right kite ⇒ half-chord 5, tangent length 13 ⇒ r = 12." },
      { q: "Inscribed angle intercepts arc 110°. Angle measure?", ans: "Half of arc ⇒ 55°." },
      { q: "Area difference between circle r and inscribed square?", ans: "πr² − 2r² = r²(π − 2)." }
    ],
    "Coordinate Geometry": [
      { q: "Line through (3,1) and (−5,5). Slope & equation.", ans: "m = (5−1)/(−5−3) = 4/−8 = −1/2. Eq: y − 1 = −(1/2)(x − 3)." },
      { q: "Circle with diameter endpoints (−2,4) and (6,−2). Equation?", ans: "Center (2,1), r = √[(8)²+(−6)²]/2 = 5. Eq: (x−2)² + (y−1)² = 25." },
      { q: "Distance from (7,−1) to line 3x−4y−12=0.", ans: " |3·7−4(−1)−12|/√(3²+ (−4)²) = |21+4−12|/5 = 13/5." },
      { q: "Intersection of y=2x−3 and y=−x+6.", ans: "2x−3 = −x+6 ⇒ x=3, y=3." },
      { q: "Midpoint between (a,b) and (c,d).", ans: "((a+c)/2, (b+d)/2)." }
    ]
  },

  "Algebra 2 & Trig": {
    "Polynomials": [
      { q: "If f(x)=x³−4x²+ax−12 has x=3 as root, find a and remaining roots.", ans: "Plug 3 ⇒ 27−36+3a−12=0 ⇒ 3a−21=0 ⇒ a=7. Factor (x−3)(x²−x−4) ⇒ roots 3, 2, −2." },
      { q: "Divide (2x⁴−3x³+5x−7) by (x−2) (Remainder Theorem). Remainder?", ans: "f(2)=2·16 − 3·8 + 10 − 7 = 32 − 24 + 3 = 11." },
      { q: "End behavior of −5x⁵ + 2x³ − 7x.", ans: "Odd degree, neg leading: x→∞ ⇒ f→−∞; x→−∞ ⇒ f→∞." },
      { q: "If (x−1)² is a factor of x³+bx²+cx+d, condition on b,c,d.", ans: "f(1)=0 and f′(1)=0 ⇒ 1+b+c+d=0 and 3+2b+c=0." },
      { q: "Find real k so x=−1 is a double root of x³+kx²+3x−4.", ans: "f(−1)=−1+k−3−4=0 ⇒ k=8. Also f′(x)=3x²+2kx+3; f′(−1)=3−2k+3=0 ⇒ 6−2k=0 ⇒ k=3. No k satisfies both ⇒ impossible." }
    ],
    "Exponential & Log": [
      { q: "Solve 3·2^x = 5·3^x.", ans: "2^x / 3^x = 5/3 ⇒ (2/3)^x = 5/3 ⇒ x = log(5/3)/log(2/3) < 0." },
      { q: "Solve ln(x−1) + ln(x+3) = ln 8.", ans: "(x−1)(x+3)=8 ⇒ x²+2x−3=8 ⇒ x²+2x−11=0 ⇒ x = −1±√12 ⇒ valid: x= −1+2√3 (>1)." },
      { q: "Solve e^(2x) − 7e^x + 10 = 0.", ans: "Let t=e^x ⇒ t²−7t+10=0 ⇒ t=5 or 2 ⇒ x=ln5 or ln2." },
      { q: "Simplify log_a(b) · log_b(c) · log_c(a).", ans: "1 (change of base telescopes)." },
      { q: "Solve 2^(x+1) = 7 − 2^(1−x).", ans: "Let t=2^x>0 ⇒ 2t = 7 − (2/t) ⇒ 2t² − 7t + 2 = 0 ⇒ t = (7 ± √(49 − 16))/4 = (7 ± √33)/4 ⇒ x = log2((7 ± √33)/4)." }
    ],
    "Trig Identities": [
      { q: "Prove: (1 − cos2θ)/(1 + cos2θ) = tan²θ.", ans: "Use cos2θ=1−2sin²θ ⇒ LHS = (2sin²θ)/(2cos²θ) = tan²θ." },
      { q: "Solve on [0,2π): 2sinx + √3 = 0.", ans: "sin x = −√3/2 ⇒ x = 4π/3, 5π/3." },
      { q: "Solve: tanx·secx = 2, 0≤x<2π.", ans: "tanx·secx = (sinx/cosx)·(1/cosx) = sinx/cos²x ⇒ numeric solve ⇒ let u=cosx ⇒ sinx=±√(1−u²). Closed form messy; principal solutions near x≈ arcsin(2cos²x). (Use calculator: x≈1.107, 2.034, 4.249, 5.176 rad)" },
      { q: "Exact value: sin(75°).", ans: "sin(45+30)=sin45cos30+cos45sin30 = (√2/2)(√3/2)+(√2/2)(1/2) = (√6+√2)/4." },
      { q: "Verify: 1 + tan²x = sec²x.", ans: "Pythagorean identity: sin²+cos²=1 ⇒ divide by cos²." }
    ]
  },

  "Precalculus": {
    "Sequences & Series": [
      { q: "Sum of first n terms of geometric with a1=6, r=−1/2.", ans: "S_n = 6(1 − (−1/2)^n)/(1 − (−1/2)) = 4(1 − (−1/2)^n)/ (1.5)?? ⇒ Correct: denom = 1+1/2=3/2 ⇒ S_n = 6 · (1 − (−1/2)^n) / (3/2) = 4(1 − (−1/2)^n)." },
      { q: "Find n so arithmetic a1=5, d=3 has S_n = 406.", ans: "S_n = n/2(2·5 + (n−1)·3) = 406 ⇒  n(10 + 3n − 3) = 812 ⇒ 3n² + 7n − 812 = 0 ⇒ n=  (−7 + √(49 + 9744))/6 = (−7 + √9793)/6 ≈ 17." },
      { q: "Converges? ∑_{k=1}^∞ 7/(3^k). Value?", ans: "Yes, geometric r=1/3 ⇒ sum = 7·(1/(3−1))? Careful: a1=7/3 ⇒ S= (a1)/(1−r)= (7/3)/(2/3)=7/2." },
      { q: "nth term of sequence: 2, 5, 10, 17, 26,…", ans: "a_n = n² + 1." },
      { q: "Telescoping: ∑_{k=1}^n (1/(k(k+1))).", ans: "= 1 − 1/(n+1)." }
    ],
    "Complex Numbers": [
      { q: "Compute (2 − 3i)(4 + i).", ans: "8 + 2i − 12i − 3i² = 11 − 10i." },
      { q: "Write 1/(3 − 4i) in a + bi.", ans: "(3 + 4i)/25 = 3/25 + (4/25)i." },
      { q: "cis(θ)·cis(φ) equals?", ans: "cis(θ+φ) (De Moivre)." },
      { q: "|3 − 4i| and arg(3 − 4i).", ans: "|z|=5; arg ≈ −53.13° (or 306.87°)." },
      { q: "Solve z² = −16.", ans: "z = ±4i." }
    ],
    "Vectors & Parametrics": [
      { q: "If u=⟨3,−2⟩, v=⟨−1,4⟩, compute 2u − v.", ans: "⟨7, −8⟩." },
      { q: "Magnitude and direction of w=⟨6,8⟩.", ans: "|w|=10; θ ≈ 53.13°." },
      { q: "Parametric x=t²−1, y=2t+3. Eliminate t.", ans: "t = (y−3)/2 ⇒ x = ((y−3)/2)² − 1." },
      { q: "Dot product angle: u·v = |u||v|cosθ for u=⟨1,2⟩, v=⟨−2,1⟩. Find θ.", ans: "u·v= (1)(−2)+(2)(1)=0 ⇒ θ=90°." },
      { q: "Projection of a=⟨5,1⟩ on b=⟨2,2⟩.", ans: "((a·b)/|b|²) b = ((10+2)/8)⟨2,2⟩ = (12/8)⟨2,2⟩ = ⟨3,3⟩." }
    ]
  }
};

// UI wiring
(function () {
  const tabBtn = document.getElementById("tab-enrichment");
  const panel = document.getElementById("enrichment-panel");
  const bookSel = document.getElementById("enrich-book");
  const chapSel = document.getElementById("enrich-chapter");
  const genBtn  = document.getElementById("enrich-generate");
  const regBtn  = document.getElementById("enrich-regenerate");
  const togBtn  = document.getElementById("enrich-toggle-answers");
  const qList   = document.getElementById("enrich-questions");

  if (!tabBtn || !panel) return;

  // Show panel on click (basic tab behavior — hide others if you have them)
  tabBtn.addEventListener("click", () => {
    panel.hidden = false;
    // Optional: hide other panels in your app here.
    if (bookSel.options.length === 0) initSelectors();
  });

  function initSelectors() {
    // Populate book select
    const books = Object.keys(ENRICH_BANK);
    books.forEach(b => {
      const opt = document.createElement("option");
      opt.value = b; opt.textContent = b;
      bookSel.appendChild(opt);
    });
    // Populate chapter select for first book
    fillChapters(books[0]);

    bookSel.addEventListener("change", () => fillChapters(bookSel.value));
    chapSel.addEventListener("change", () => renderFive());
  }

  function fillChapters(book) {
    chapSel.innerHTML = "";
    const chapters = Object.keys(ENRICH_BANK[book]);
    chapters.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c; opt.textContent = c;
      chapSel.appendChild(opt);
    });
    renderFive();
  }

  function pickFive(arr) {
    // Shuffle copy and take first 5
    const pool = [...arr];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 5);
  }

  function renderFive() {
    const book = bookSel.value;
    const chap = chapSel.value;
    const bank = ENRICH_BANK[book]?.[chap] || [];
    const five = pickFive(bank);
    qList.innerHTML = "";
    five.forEach((item, idx) => {
      const li = document.createElement("li");
      const q = document.createElement("div"); q.className = "q"; q.textContent = item.q;
      const a = document.createElement("div"); a.className = "ans"; a.textContent = "Answer: " + item.ans;
      li.appendChild(q); li.appendChild(a);
      qList.appendChild(li);
    });
  }

  genBtn?.addEventListener("click", renderFive);
  regBtn?.addEventListener("click", renderFive);
  togBtn?.addEventListener("click", () => {
    const showing = qList.querySelector(".ans")?.style.display === "block";
    qList.querySelectorAll(".ans").forEach(el => el.style.display = showing ? "none" : "block");
    togBtn.textContent = showing ? "Show Answers" : "Hide Answers";
  });
})();

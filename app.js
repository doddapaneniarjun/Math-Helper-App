
// -------------------- BOOK DATA --------------------
// (Trimmed dataset for performance demo; expand similarly for more books)
const books = [
  {
    title: "Singapore Math — Primary Mathematics",
    lessons: [
      {
        title: "Numbers & Place Value",
        summary: "Understanding numbers and place values.",
        practice: [
          { question: "Write 4,562 in expanded form.", answer: "4000+500+60+2" },
          { question: "What is the value of 7 in 3,742?", answer: "700" },
          { question: "Write 5,031 in expanded form.", answer: "5000+0+30+1" },
          { question: "Value of 6 in 2,468?", answer: "60" },
          { question: "Write 9,205 in expanded form.", answer: "9000+200+0+5" }
        ]
      },
      {
        title: "Addition & Subtraction",
        summary: "Adding and subtracting numbers.",
        practice: [
          { question: "234 + 567 =", answer: "801" },
          { question: "5000 - 234 =", answer: "4766" },
          { question: "342 + 678 =", answer: "1020" },
          { question: "1000 - 467 =", answer: "533" },
          { question: "456 + 789 =", answer: "1245" }
        ]
      }
    ]
  },
  {
    title: "Art of Problem Solving — Prealgebra",
    lessons: [
      {
        title: "Integers",
        summary: "Learning about integers.",
        practice: [
          { question: "What is -7 + 12?", answer: "5" },
          { question: "What is -4 × 3?", answer: "-12" },
          { question: "What is 15 - (-8)?", answer: "23" },
          { question: "Simplify: -20 ÷ 4", answer: "-5" },
          { question: "What is the opposite of -13?", answer: "13" }
        ]
      },
      {
        title: "Fractions",
        summary: "Understanding fractions.",
        practice: [
          { question: "1/2 + 1/4 =", answer: "3/4" },
          { question: "3/5 - 1/5 =", answer: "2/5" },
          { question: "2/3 × 3/4 =", answer: "1/2" },
          { question: "4/7 ÷ 2/7 =", answer: "2" },
          { question: "Simplify 6/8.", answer: "3/4" }
        ]
      }
    ]
  }
];

// -------------------- ELEMENTS --------------------
const topicsList = document.getElementById("topics-list");
const booksList = document.getElementById("books-list");
const bookContent = document.getElementById("book-content");
const bookTitle = document.getElementById("book-title");
const lessonsList = document.getElementById("lessons-list");
const lessonContent = document.getElementById("lesson-content");
const lessonTitle = document.getElementById("lesson-title");
const lessonSummary = document.getElementById("lesson-summary");
const lessonPractice = document.getElementById("lesson-practice");
const modal = document.getElementById("problem-modal");
const problemText = modal.querySelector(".problem-text");
const answerInput = modal.querySelector(".answer-input");
const feedback = modal.querySelector(".feedback");
const nextBtn = modal.querySelector(".next-problem");
const closeBtn = document.getElementById("close-btn");

let currentProblems = [];
let currentIndex = 0;

// -------------------- LOCALSTORAGE --------------------
function saveProgress(bookTitle, lessonTitle, index, correct) {
  let progress = JSON.parse(localStorage.getItem("progress") || "{}");
  if (!progress[bookTitle]) progress[bookTitle] = {};
  if (!progress[bookTitle][lessonTitle]) progress[bookTitle][lessonTitle] = {};
  progress[bookTitle][lessonTitle][index] = correct;
  localStorage.setItem("progress", JSON.stringify(progress));
}

// -------------------- TOPICS --------------------
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
      header.onclick = () => content.classList.toggle("hidden");

      content.innerHTML = `<p>${lesson.summary}</p><strong>Practice:</strong><ul id="practice-${bi}-${li}"></ul>`;
      const practiceList = content.querySelector("ul");
      lesson.practice.forEach((p, pi) => {
        const liEl = document.createElement("li");
        liEl.className = "practice-item";
        liEl.textContent = p.question;
        liEl.onclick = () => openProblemModal(lesson.practice, pi, book.title, lesson.title);
        practiceList.appendChild(liEl);
      });

      card.append(header, content);
      topicsList.appendChild(card);
    });
  });
}

// -------------------- BOOKS --------------------
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
  bookTitle.textContent = books[index].title;
  lessonsList.innerHTML = "";
  books[index].lessons.forEach((lesson, li) => {
    const btn = document.createElement("button");
    btn.textContent = lesson.title;
    btn.onclick = () => showLesson(index, li);
    lessonsList.appendChild(btn);
  });
}

function showLesson(bi, li) {
  lessonContent.classList.remove("hidden");
  const lesson = books[bi].lessons[li];
  lessonTitle.textContent = lesson.title;
  lessonSummary.textContent = lesson.summary;
  lessonPractice.innerHTML = "";
  lesson.practice.forEach((p, pi) => {
    const btn = document.createElement("button");
    btn.textContent = p.question;
    btn.onclick = () => openProblemModal(lesson.practice, pi, books[bi].title, lesson.title);
    lessonPractice.appendChild(btn);
  });
}

// -------------------- MODAL --------------------
function openProblemModal(problems, index, bookTitle, lessonTitle) {
  currentProblems = problems;
  currentIndex = index;
  modal.dataset.book = bookTitle;
  modal.dataset.lesson = lessonTitle;
  showCurrentProblem();
  modal.classList.add("active");
  answerInput.focus();
}

function showCurrentProblem() {
  problemText.textContent = currentProblems[currentIndex].question;
  answerInput.value = "";
  feedback.textContent = "";
}

function checkAnswer() {
  const correct = currentProblems[currentIndex].answer.trim();
  if (answerInput.value.trim() === correct) {
    feedback.textContent = "✅ Correct!";
    feedback.style.color = "green";
    saveProgress(modal.dataset.book, modal.dataset.lesson, currentIndex, true);
  } else {
    feedback.textContent = `❌ Wrong. Correct: ${correct}`;
    feedback.style.color = "red";
    saveProgress(modal.dataset.book, modal.dataset.lesson, currentIndex, false);
  }
}

nextBtn.onclick = () => {
  checkAnswer();
  currentIndex = (currentIndex + 1) % currentProblems.length;
  showCurrentProblem();
};

answerInput.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    checkAnswer();
  }
});

closeBtn.onclick = () => modal.classList.remove("active");

// -------------------- BACK BUTTONS --------------------
document.getElementById("back-to-books").onclick = () => {
  bookContent.classList.add("hidden");
  booksList.classList.remove("hidden");
  lessonContent.classList.add("hidden");
};
document.getElementById("back-to-lessons").onclick = () => {
  lessonContent.classList.add("hidden");
};

// -------------------- TABS --------------------
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
    document.getElementById(btn.dataset.tab).classList.add("active");
  };
});

// -------------------- INIT --------------------
renderTopics();
renderBooks();

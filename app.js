// Example JS - you can expand books/lessons/problems

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
const submitAnswerBtn = document.getElementById("submit-answer");
const feedback = modal.querySelector(".feedback");
const nextBtn = modal.querySelector(".next-problem");
const closeBtn = document.getElementById("close-btn");

let currentProblems = [];
let currentIndex = 0;

// Simple book
const books = [
  {title:"Singapore Math — Primary Mathematics", lessons:[
    {title:"Numbers & Place Value", summary:"Understanding numbers and place values.", practice:[
      {question:"Write 4,562 in expanded form.", answer:"4000+500+60+2"},
      {question:"What is the value of the digit 7 in 3,742?", answer:"700"}
    ]}
  ]}
];

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
      header.onclick = ()=>content.classList.toggle("hidden");

      content.innerHTML = `<p>${lesson.summary}</p><strong>Practice:</strong><ul id="practice-${bi}-${li}"></ul>`;
      const practiceList = content.querySelector(`ul`);
      lesson.practice.forEach((p, pi)=>{
        const liEl = document.createElement("li");
        liEl.className = "practice-item";
        liEl.textContent = p.question;
        liEl.onclick = ()=>openProblemModal(lesson.practice, pi);
        practiceList.appendChild(liEl);
      });

      card.append(header, content);
      topicsList.appendChild(card);
    });
  });
}

function renderBooks() {
  booksList.innerHTML = "";
  books.forEach((book, index)=>{
    const btn = document.createElement("button");
    btn.textContent = book.title;
    btn.onclick = ()=>showBook(index);
    booksList.appendChild(btn);
  });
}

function showBook(index){
  booksList.classList.add("hidden");
  bookContent.classList.remove("hidden");
  bookTitle.textContent = books[index].title;
  lessonsList.innerHTML = "";
  books[index].lessons.forEach((lesson, li)=>{
    const btn = document.createElement("button");
    btn.textContent = lesson.title;
    btn.onclick = ()=>showLesson(index, li);
    lessonsList.appendChild(btn);
  });
}

function showLesson(bi, li){
  lessonContent.classList.remove("hidden");
  const lesson = books[bi].lessons[li];
  lessonTitle.textContent = lesson.title;
  lessonSummary.textContent = lesson.summary;
  lessonPractice.innerHTML = "";
  lesson.practice.forEach((p, pi)=>{
    const btn = document.createElement("button");
    btn.textContent = p.question;
    btn.onclick = ()=>openProblemModal(lesson.practice, pi);
    lessonPractice.appendChild(btn);
  });
}

function openProblemModal(problems, index){
  currentProblems = problems;
  currentIndex = index;
  showCurrentProblem();
  modal.classList.add("active");
}

function showCurrentProblem(){
  problemText.textContent = currentProblems[currentIndex].question;
  answerInput.value = "";
  feedback.textContent = "";
}

function checkAnswer(){
  const correct = currentProblems[currentIndex].answer.trim();
  if(answerInput.value.trim() === correct){
    feedback.textContent = "✅ Correct!";
    feedback.style.color = "green";
  } else {
    feedback.textContent = `❌ Wrong. Correct: ${correct}`;
    feedback.style.color = "red";
  }
}

submitAnswerBtn.onclick = checkAnswer;
nextBtn.onclick = ()=>{
  currentIndex = (currentIndex + 1) % currentProblems.length;
  showCurrentProblem();
};
closeBtn.onclick = ()=> modal.classList.remove("active");

document.querySelectorAll(".tab-btn").forEach(btn=>{
  btn.onclick = ()=>{
    document.querySelectorAll(".tab-content").forEach(t=>t.classList.remove("active"));
    document.getElementById(btn.dataset.tab).classList.add("active");
  };
});

renderTopics();
renderBooks();
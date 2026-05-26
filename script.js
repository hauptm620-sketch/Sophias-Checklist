document.addEventListener("DOMContentLoaded", init);

const STORAGE_KEY = "sophiasTodos";
const SWIPE_DELETE_THRESHOLD = -80;
const MAX_SWIPE = -100;
const DEFAULT_TODOS = [
  {text:"Kuscheltier", checked: false},
  {text:"Unterhosen", checked: false},
  {text:"T-Shirts", checked: false},
  {text:"Socken", checked: false},
  {text:"Hose ( kurz | lang )", checked: false},
  {text:"Pulli", checked: false},
  {text:"Kamm", checked: false},
  {text:"Zahnbürste | Zahnpasta", checked: false},
  {text:"Toniebox | Ladekabel | Figuren", checked: false},
  {text:"Haargummi | Haarreif | Haarspange", checked: false},
  {text:"Deo", checked: false},
  {text:"UNO", checked: false},
  {text:"Labello", checked: false},
  {text:"Spielzeug", checked: false}
];

let todos = [];

const elements = {
  input: null,
  addButton: null,
  list: null,
};

function init() {
  cacheDOMElements();
  loadTodos();
  bindEvents();
  renderTodos();
}

function cacheDOMElements() {
  elements.input = document.getElementById("todo-input");
  elements.addButton = document.getElementById("add-btn");
  elements.list = document.getElementById("todo-list");
}

function bindEvents() {
  elements.addButton.addEventListener("click", addTodo);

  elements.input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addTodo();
    }
  });
}

function loadTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const costomTodos = saved ? JSON.parse(saved) : [];
    todos = [...DEFAULT_TODOS, ...customTodos];
    /*todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];*/
  } catch {
    todos = [...DEFAULT_TODOS];
  }
}

function saveTodos() {
  const customTodos = todos.filter(todo => !DEFAULT_TODOS.some(defaultTodo => defaultTodo.text === todo.text));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customTodos));
}

function addTodo() {
  const text = elements.input.value.trim();

  if (!text) return;

  todos.push({
    text,
    checked: false,
  });

  elements.input.value = "";

  saveTodos();
  renderTodos();
}

function toggleTodo(index) {
  todos[index].checked = !todos[index].checked;

  saveTodos();
  renderTodos();
}

function deleteTodo(index) {
  todos.splice(index, 1);

  saveTodos();
  renderTodos();
}

function renderTodos() {
  elements.list.innerHTML = "";

  todos.forEach((todo, index) => {
    const todoElement = createTodoElement(todo, index);
    elements.list.appendChild(todoElement);
  });
}

function createTodoElement(todo, index) {
  const li = document.createElement("li");

  li.className = `todo-item ${todo.checked ? "checked" : ""}`;

  li.innerHTML = `
    <span class="todo-text">${todo.text}</span>

    <button class="check-btn">
      <img 
        src="img/pineapple.png" 
        alt="Check"
        class="pineapple-icon"
      >
    </button>
  `;

  setupCheckButton(li, index);
  setupSwipeEvents(li, index);

  return li;
}

function setupCheckButton(li, index) {
  const button = li.querySelector(".check-btn");

  button.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleTodo(index);
  });
}

function setupSwipeEvents(li, index) {
  let startX = null;
  let currentX = null;

  li.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
      currentX = startX;
    },
    { passive: true }
  );

  li.addEventListener(
    "touchmove",
    (e) => {
      if (startX === null) return;

      currentX = e.touches[0].clientX;

      const diffX = currentX - startX;

      if (diffX < 0) {
        li.style.transform = `translateX(${Math.max(diffX, MAX_SWIPE)}px)`;
      }
    },
    { passive: true }
  );

  li.addEventListener("touchend", () => {
    if (startX === null || currentX === null) return;

    const diffX = currentX - startX;

    if (diffX < SWIPE_DELETE_THRESHOLD) {
      animateDelete(li, index);
    } else {
      li.style.transform = "translateX(0)";
    }

    startX = null;
    currentX = null;
  });
}

function animateDelete(li, index) {
  li.style.transform = "translateX(-100%)";
  li.style.opacity = "0";

  setTimeout(() => {
    deleteTodo(index);
  }, 300);
}
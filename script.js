// ==========================================
// 1. ИНИЦИАЛИЗАЦИЯ И АВТОЗАГРУЗКА БАЗЫ ЛЮДЕЙ
// ==========================================
// Пытаемся сразу достать сохраненную базу людей из памяти браузера
let staffDatabase = JSON.parse(localStorage.getItem('my_staff_base')) || {};
let allNames = Object.keys(staffDatabase);
const datalist = document.getElementById('employees-list');

// --- МАППИНГ: соответствие JSON-ключей ячейкам таблицы ---
const jsonToGridMap = {
  "br1-crystals": { category: "Кристаллы", brigadeCol: 1 },
  "br1-mechanics": { category: "Механики", brigadeCol: 1 },
  "br1-operators": { category: "Операторы", brigadeCol: 1 },
  "br1-masters": { category: "Мастера", brigadeCol: 1 },
  "br1-senior": { category: "Старшие", brigadeCol: 1 },

  "br2-crystals": { category: "Кристаллы", brigadeCol: 2 },
  "br2-mechanics": { category: "Механики", brigadeCol: 2 },
  "br2-operators": { category: "Операторы", brigadeCol: 2 },
  "br2-masters": { category: "Мастера", brigadeCol: 2 },
  "br2-senior": { category: "Старшие", brigadeCol: 2 },

  "br3-crystals": { category: "Кристаллы", brigadeCol: 3 },
  "br3-mechanics": { category: "Механики", brigadeCol: 3 },
  "br3-operators": { category: "Операторы", brigadeCol: 3 },
  "br3-masters": { category: "Мастера", brigadeCol: 3 },
  "br3-senior": { category: "Старшие", brigadeCol: 3 },

  "br4-crystals": { category: "Кристаллы", brigadeCol: 4 },
  "br4-mechanics": { category: "Механики", brigadeCol: 4 },
  "br4-operators": { category: "Операторы", brigadeCol: 4 },
  "br4-masters": { category: "Мастера", brigadeCol: 4 },
  "br4-senior": { category: "Старшие", brigadeCol: 4 }
};

// Поиск ключа маппинга по категории и номеру бригады
function getJsonKey(category, brigadeCol) {
  for (const [key, value] of Object.entries(jsonToGridMap)) {
    if (value.category === category && value.brigadeCol === brigadeCol) {
      return key;
    }
  }
  return null;
}

// ==========================================
// 2. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ТАБЛИЦЫ
// ==========================================

function clearRowData(row) {
  const cells = row.cells;
  cells[2].textContent = ""; // ID
  cells[3].textContent = ""; // Роль
  cells[4].textContent = ""; // Дата
}

function fillRowData(row, info) {
  const cells = row.cells;
  cells[2].textContent = info.id || "";
  cells[3].textContent = info.role || "";
  cells[4].textContent = info.date || "";
}

function updateDatalist() {
  if (!datalist) return;
  datalist.innerHTML = "";
  allNames.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    datalist.appendChild(option);
  });
}

function handleInput(e) {
  if (!e.target.classList.contains('emp-input')) return;
  const input = e.target;
  const val = input.value.trim();
  const row = input.closest('tr');
  if (!row) return;

  if (staffDatabase[val]) {
    fillRowData(row, staffDatabase[val]);
  } else {
    clearRowData(row);
  }
}

// Навешиваем слушатели на таблицу
const table = document.querySelector('table');
if (table) {
  table.addEventListener('input', handleInput);
  table.addEventListener('change', handleInput); // Для отслеживания выбора мышкой
}

// ==========================================
// 3. ОБРАБОТКА ЗАГРУЗКИ ВАШЕГО ФАЙЛА (people.json)
// ==========================================
const staffFileInp = document.getElementById('staff-file-input');
if (staffFileInp) {
  staffFileInp.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        staffDatabase = JSON.parse(evt.target.result);
        allNames = Object.keys(staffDatabase);
        
        // Намертво сохраняем эту базу людей в память браузера
        localStorage.setItem('my_staff_base', JSON.stringify(staffDatabase));
        
        updateDatalist();
        alert('База сотрудников успешно загружена и сохранена в память!');
        forceSaveToLocalStorage(); // Сразу обновляем состояние памяти
      } catch (err) {
        alert('Ошибка: Файл имеет неверный формат JSON.');
      }
    };
    reader.readAsText(file);
  });
}

// ==========================================
// 4. ЛОГИКА ЗАГРУЗКИ / СОХРАНЕНИЯ РАСПИСАНИЯ
// ==========================================

function saveSchedule() {
  const data = {};
  for (const key of Object.keys(jsonToGridMap)) {
    data[key] = [];
  }

  const rows = document.querySelectorAll('table tbody tr');
  let currentCategory = "";

  rows.forEach(row => {
    const catCell = row.querySelector('.category-cell');
    if (catCell) {
      currentCategory = catCell.textContent.trim();
    }
    if (!currentCategory) return;

    const inputs = row.querySelectorAll('.emp-input');
    inputs.forEach((input, index) => {
      const brigadeCol = index + 1;
      const name = input.value.trim();
      if (name) {
        const key = getJsonKey(currentCategory, brigadeCol);
        if (key) {
          data[key].push(name);
        }
      }
    });
  });
  return data;
}

function loadSchedule(data) {
  if (!data) return;
  const rows = document.querySelectorAll('table tbody tr');
  let currentCategory = "";

  // Очищаем инпуты и ячейки перед загрузкой
  document.querySelectorAll('.emp-input').forEach(inp => inp.value = "");
  rows.forEach(row => { if(!row.querySelector('.category-cell')) clearRowData(row); });

  const counters = {};
  for (const key of Object.keys(jsonToGridMap)) {
    counters[key] = 0;
  }

  rows.forEach(row => {
    const catCell = row.querySelector('.category-cell');
    if (catCell) {
      currentCategory = catCell.textContent.trim();
    }
    if (!currentCategory) return;

    const inputs = row.querySelectorAll('.emp-input');
    inputs.forEach((input, index) => {
      const brigadeCol = index + 1;
      const key = getJsonKey(currentCategory, brigadeCol);
      if (key && data[key]) {
        const list = data[key];
        const currentIdx = counters[key];
        if (currentIdx < list.length) {
          const name = list[currentIdx];
          input.value = name;
          if (staffDatabase[name]) {
            fillRowData(row, staffDatabase[name]);
          }
          counters[key]++;
        }
      }
    });
  });
}

// Ручное скачивание файла schedule.json
const btnSave = document.getElementById('btn-save');
if (btnSave) {
  btnSave.addEventListener('click', () => {
    const data = saveSchedule();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedule.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

// Ручная загрузка файла расписания через кнопку «Загрузить»
const btnLoad = document.getElementById('btn-load');
if (btnLoad) {
  btnLoad.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = JSON.parse(evt.target.result);
          loadSchedule(data);
          forceSaveToLocalStorage(); // Запоминаем загруженное расписание
        } catch (err) {
          alert('Ошибка чтения файла расписания');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });
}

// ==========================================
// 5. АВТОМАТИЧЕСКОЕ ПЕРЕОПРЕДЕЛЕНИЕ И ПАМЯТЬ
// ==========================================

// Принудительное сохранение текущей таблицы в память браузера
function forceSaveToLocalStorage() {
  const currentSchedule = saveSchedule();
  localStorage.setItem('my_current_schedule', JSON.stringify(currentSchedule));
}

// Отслеживаем любые изменения на странице для мгновенного сохранения
document.addEventListener('input', forceSaveToLocalStorage);
document.addEventListener('change', forceSaveToLocalStorage);

// При первом запуске страницы восстанавливаем и базу людей, и расставленное расписание
updateDatalist();

const savedSchedule = localStorage.getItem('my_current_schedule');
if (savedSchedule) {
  // Небольшая задержка, чтобы HTML-таблица точно успела построиться в браузере
  setTimeout(() => {
    loadSchedule(JSON.parse(savedSchedule));
  }, 100);
}

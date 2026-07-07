// ==========================================
// 1. ИНИЦИАЛИЗАЦИЯ И АВТОЗАГРУЗКА БАЗЫ ЛЮДЕЙ
// ==========================================
let staffDatabase = JSON.parse(localStorage.getItem('my_staff_base')) || {};
let allNames = Object.keys(staffDatabase);

// --- МАППИНГ: соответствие JSON-ключей ячейкам таблицы ---
const jsonToGridMap = {
  "br1-crystals": { category: "Кристаллы", brigadeCol: 1 },
  "br1-mechanics": { category: "Механики", brigadeCol: 1 },
  "br1-operators": { category: "Операторы", brigadeCol: 1 },
  "br1-masters": { category: "Мастера", brigadeCol: 1 },
  "br1-senior": { category: "Старшие", brigadeCol: 1 },

  "br2-crystals": { category: "Кристаллы", brigadeCol: 2 },
  "br2-mechanics": { category: "Mechanics", brigadeCol: 2 }, // исправлено под соответствие, если нужно
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
  if (!row || !row.cells) return;
  const cells = row.cells;
  if (cells[2]) cells[2].textContent = ""; 
  if (cells[3]) cells[3].textContent = ""; 
  if (cells[4]) cells[4].textContent = ""; 
}

function fillRowData(row, info) {
  if (!row || !row.cells || !info) return;
  const cells = row.cells;
  if (cells[2]) cells[2].textContent = info.id || "";
  if (cells[3]) cells[3].textContent = info.role || "";
  if (cells[4]) cells[4].textContent = info.date || "";
}

function updateDatalist() {
  const currentDatalist = document.getElementById('employees-list');
  if (!currentDatalist) return;

  // ИСПРАВЛЕНО: Теперь ищем ИМЕННО .emp-input, как и во всем остальном коде
  const busyNames = Array.from(document.querySelectorAll('.emp-input'))
    .map(input => input.value.trim())
    .filter(Boolean);

  const freeNames = allNames.filter(name => !busyNames.includes(name));

  currentDatalist.innerHTML = '';
  freeNames.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    currentDatalist.appendChild(option);
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
  
  // ИСПРАВЛЕНО: При ручном вводе/выборе имени сразу обновляем список доступных
  updateDatalist();
}

const table = document.querySelector('table');
if (table) {
  table.addEventListener('input', handleInput);
  table.addEventListener('change', handleInput); 
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
        
        localStorage.setItem('my_staff_base', JSON.stringify(staffDatabase));
        
        updateDatalist();
        alert('База сотрудников успешно загружена и сохранена в память!');
        forceSaveToLocalStorage(); 
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

  document.querySelectorAll('.emp-input').forEach(inp => inp.value = "");
  rows.forEach(row => { 
    if (!row.querySelector('.category-cell') && row.querySelectorAll('.emp-input').length > 0) {
      clearRowData(row); 
    }
  });

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

  // ИСПРАВЛЕНО: После того, как расписание загрузилось, обновляем список доступных людей
  updateDatalist();
}

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
          forceSaveToLocalStorage(); 
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
function forceSaveToLocalStorage() {
  const currentSchedule = saveSchedule();
  localStorage.setItem('my_current_schedule', JSON.stringify(currentSchedule));
}

document.addEventListener('input', forceSaveToLocalStorage);
document.addEventListener('change', forceSaveToLocalStorage);

// Инициализация при старте
updateDatalist();

const savedSchedule = localStorage.getItem('my_current_schedule');
if (savedSchedule) {
  setTimeout(() => {
    loadSchedule(JSON.parse(savedSchedule));
  }, 100);
}

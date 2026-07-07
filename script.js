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

// Очистка ячеек внутри строки конкретного сотрудника
function clearRowData(row) {
  if (!row) return;
  const idCell = row.querySelector('.col-id');
  const roleCell = row.querySelector('.col-role');
  const dateCell = row.querySelector('.col-date');
  
  if (idCell) idCell.textContent = "";
  if (roleCell) roleCell.textContent = "";
  if (dateCell) dateCell.textContent = "";
}

// Заполнение ячеек внутри строки конкретного сотрудника
function fillRowData(row, info) {
  if (!row || !info) return;
  const idCell = row.querySelector('.col-id');
  const roleCell = row.querySelector('.col-role');
  const dateCell = row.querySelector('.col-date');
  
  if (idCell) idCell.textContent = info.id || "";
  if (roleCell) roleCell.textContent = info.role || "";
  if (dateCell) dateCell.textContent = info.date || "";
}

function updateDatalist() {
  const currentDatalist = document.getElementById('employees-list');
  if (!currentDatalist) return;

  // Собираем имена по вашему реальному классу select-input
  const busyNames = Array.from(document.querySelectorAll('.select-input'))
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
  if (!e.target.classList.contains('select-input')) return;
  const input = e.target;
  const val = input.value.trim();
  const row = input.closest('tr'); // Ищет строку именно этого сотрудника
  if (!row) return;

  if (staffDatabase[val]) {
    fillRowData(row, staffDatabase[val]);
  } else {
    clearRowData(row);
  }
  
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

  const categoryRows = document.querySelectorAll('table > tbody > tr.category-row');

  categoryRows.forEach(row => {
    const catCell = row.querySelector('.row-title');
    if (!catCell) return;
    const currentCategory = catCell.textContent.trim();

    // Находим все ячейки бригад (td) в этой строке категории
    const brigadeCells = row.querySelectorAll('tr.category-row > td:not(.row-title)');
    
    brigadeCells.forEach((cell, index) => {
      const brigadeCol = index + 1;
      const inputs = cell.querySelectorAll('.select-input');
      
      inputs.forEach(input => {
        const name = input.value.trim();
        if (name) {
          const key = getJsonKey(currentCategory, brigadeCol);
          if (key) {
            data[key].push(name);
          }
        }
      });
    });
  });
  return data;
}

function loadSchedule(data) {
  if (!data) return;
  const categoryRows = document.querySelectorAll('table > tbody > tr.category-row');

  // Предварительная очистка всех инпутов и данных сотрудников
  document.querySelectorAll('.select-input').forEach(inp => inp.value = "");
  document.querySelectorAll('.emp-table tr').forEach(row => clearRowData(row));

  const counters = {};
  for (const key of Object.keys(jsonToGridMap)) {
    counters[key] = 0;
  }

  categoryRows.forEach(row => {
    const catCell = row.querySelector('.row-title');
    if (!catCell) return;
    const currentCategory = catCell.textContent.trim();

    const brigadeCells = row.querySelectorAll('tr.category-row > td:not(.row-title)');
    
    brigadeCells.forEach((cell, index) => {
      const brigadeCol = index + 1;
      const key = getJsonKey(currentCategory, brigadeCol);
      if (!key || !data[key]) return;

      const list = data[key];
      const inputs = cell.querySelectorAll('.select-input');

      inputs.forEach(input => {
        const currentIdx = counters[key];
        if (currentIdx < list.length) {
          const name = list[currentIdx];
          input.value = name;
          
          const empRow = input.closest('tr');
          if (empRow && staffDatabase[name]) {
            fillRowData(empRow, staffDatabase[name]);
          }
          counters[key]++;
        }
      });
    });
  });

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

// Инициализация при старте страницы
updateDatalist();

const savedSchedule = localStorage.getItem('my_current_schedule');
if (savedSchedule) {
  setTimeout(() => {
    loadSchedule(JSON.parse(savedSchedule));
  }, 100);
}

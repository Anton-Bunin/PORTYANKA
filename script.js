// ==========================================
// 1. ИНИЦИАЛИЗАЦИЯ И АВТОЗАГРУЗКА БАЗЫ ЛЮДЕЙ
// ==========================================
let staffDatabase = JSON.parse(localStorage.getItem('my_staff_base')) || {};
let allNames = Object.keys(staffDatabase);

// --- МАППИНГ: соответствие JSON-ключей ячейкам таблицы ---
const jsonToGridMap = {
  // === БРИГАДА 1 ===
  "br1-senior": { category: "Старший", brigadeCol: 1 },
  "br1-crystals": { category: "Кристаллы", brigadeCol: 1 },
  "br1-fiter": { category: "Фильтра", brigadeCol: 1 },
  "br1-regeneration": { category: "Регенерация", brigadeCol: 1 },
  "br1-compressor": { category: "Машинисты ЦК", brigadeCol: 1 },
  "br1-pump": { category: "Насосы", brigadeCol: 1 },
  "br1-vakation": { category: "Отпуска", brigadeCol: 1 },
  "br1-sickleave": { category: "Больничный", brigadeCol: 1 },

  // === БРИГАДА 2 ===
  "br2-senior": { category: "Старший", brigadeCol: 2 },
  "br2-crystals": { category: "Кристаллы", brigadeCol: 2 },
  "br2-fiter": { category: "Фильтра", brigadeCol: 2 },
  "br2-regeneration": { category: "Регенерация", brigadeCol: 2 },
  "br2-compressor": { category: "Машинисты ЦК", brigadeCol: 2 },
  "br2-pump": { category: "Насосы", brigadeCol: 2 },
  "br2-vakation": { category: "Отпуска", brigadeCol: 2 },
  "br2-sickleave": { category: "Больничный", brigadeCol: 2 },

  // === БРИГАДА 3 ===
  "br3-senior": { category: "Старший", brigadeCol: 3 },
  "br3-crystals": { category: "Кристаллы", brigadeCol: 3 },
  "br3-fiter": { category: "Фильтра", brigadeCol: 3 },
  "br3-regeneration": { category: "Регенерация", brigadeCol: 3 },
  "br3-compressor": { category: "Машинисты ЦК", brigadeCol: 3 },
  "br3-pump": { category: "Насосы", brigadeCol: 3 },
  "br3-vakation": { category: "Отпуска", brigadeCol: 3 },
  "br3-sickleave": { category: "Больничный", brigadeCol: 3 },

  // === БРИГАДА 4 ===
  "br4-senior": { category: "Старший", brigadeCol: 4 }, // Проверьте, в HTML "Старший" или "Старшие" для Бр4. На скрипте вроде везде "Старший"
  "br4-crystals": { category: "Кристаллы", brigadeCol: 4 },
  "br4-fiter": { category: "Фильтра", brigadeCol: 4 },
  "br4-regeneration": { category: "Регенерация", brigadeCol: 4 },
  "br4-compressor": { category: "Машинисты ЦК", brigadeCol: 4 },
  "br4-pump": { category: "Насосы", brigadeCol: 4 },
  "br4-vakation": { category: "Отпуска", brigadeCol: 4 },
  "br4-sickleave": { category: "Больничный", brigadeCol: 4 }
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
        // 1. Находим абсолютно ВСЕ инпуты выбора сотрудников на странице
        const allInputs = document.querySelectorAll('table .select-input');      
        allInputs.forEach(input => {
            const name = input.value.trim();
            if (!name) return; // Если ячейка пустая, пропускаем её      
            // 2. Поднимаемся к строке сотрудника <tr>
            const empRow = input.closest('tr');
            if (!empRow) return;      
            // 3. Поднимаемся выше — к главной строке категории (родителю вложенной таблицы)
            const mainRow = empRow.closest('.category-row, .sub-header');
            if (!mainRow) return;      
            // 4. Достаем название категории («Старший», «Кристаллы» и т.д.)
            const catCell = mainRow.querySelector('.row-title');
            if (!catCell) return;
            const currentCategory = catCell.textContent.trim();      
            // 5. Определяем номер бригады (какой по счету идет td внутри главной строки)
            const parentTd = input.closest('table').closest('td');
            if (!parentTd) return;          
            // Получаем индекс td среди всех соседей и прибавляем 1 (так как индекс с 0)
            const brigadeCol = Array.from(mainRow.children).indexOf(parentTd);      
            if (brigadeCol > 0) { // Проверяем, что это не колонка с названием
              const key = getJsonKey(currentCategory, brigadeCol);
              if (key) {
                data[key].push(name); // Записываем имя в нужный ключ смены
              }
            }
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

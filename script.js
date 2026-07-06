// База сотрудников изначально пустая (загрузится из сети)
let staffDatabase = {};
let allNames = [];
const datalist = document.getElementById('employees-list');

// --- МАППИНГ: как ключи JSON соответствуют строкам и колонкам на странице ---
		// Формат: "ключ-из-json": { category: "название категории слева", brigadeCol: номер колонки бригады (1–4) }
		const jsonToGridMap = {
		  "br1-crystals":   { category: "Кристаллы",      brigadeCol: 1 },
		  "br2-crystals":   { category: "Кристаллы",      brigadeCol: 2 },
		  "br3-crystals":   { category: "Кристаллы",      brigadeCol: 3 },
		  "br4-crystals":   { category: "Кристаллы",      brigadeCol: 4 },
		  "br1-filters":    { category: "Фильтра",        brigadeCol: 1 },
		  "br2-filters":    { category: "Фильтра",        brigadeCol: 2 },
		  "br3-filters":    { category: "Фильтра",        brigadeCol: 3 },
		  "br4-filters":    { category: "Фильтра",        brigadeCol: 4 },
		  "br1-regen":      { category: "Регенерация",    brigadeCol: 1 },
		  "br2-regen":      { category: "Регенерация",    brigadeCol: 2 },
		  "br3-regen":      { category: "Регенерация",    brigadeCol: 3 },
		  "br4-regen":      { category: "Регенерация",    brigadeCol: 4 },
		  "br1-cc-drivers": { category: "Машинисты ЦК",   brigadeCol: 1 },
		  "br2-cc-drivers": { category: "Машинисты ЦК",   brigadeCol: 2 },
		  "br3-cc-drivers": { category: "Машинисты ЦК",   brigadeCol: 3 },
		  "br4-cc-drivers": { category: "Машинисты ЦК",   brigadeCol: 4 }
		};
function clearRowData(row) {
    		  const idCell = row.querySelector('.col-id');
    		  const roleCell = row.querySelector('.col-role');
    		  const dateCell = row.querySelector('.col-date');
    		  if (idCell) idCell.textContent = '';
    		  if (roleCell) roleCell.textContent = '';
    		  if (dateCell) dateCell.textContent = '';
		}

		function fillRowData(row, name) {
    		  const employee = staffDatabase[name];
    		  if (!employee) {
    			clearRowData(row);
    			return;
    		  }
    		  const idCell = row.querySelector('.col-id');
    		  const roleCell = row.querySelector('.col-role');
    		  const dateCell = row.querySelector('.col-date');
    		  if (idCell) idCell.textContent = employee.id;
    		  if (roleCell) roleCell.textContent = employee.role;
    		  if (dateCell) dateCell.textContent = employee.date;
		}

		function updateDatalist() {
    		  if (!datalist) return;
    		  const busyNames = Array.from(document.querySelectorAll('.select-input'))
    			.map(input => input.value.trim())
    			.filter(Boolean);
    		  const freeNames = allNames.filter(name => !busyNames.includes(name));
    		  datalist.innerHTML = '';
    		  freeNames.forEach(name => {
    			const option = document.createElement('option');
    			option.value = name;
    			datalist.appendChild(option);
    		  });
		}

		function handleInput(event) {
    		  const input = event.target;
    		  if (!input.classList.contains('select-input')) return;
    
    		  const row = input.closest('tr');
    		  if (!row) return;
    
    		  const enteredName = input.value.trim();
    
    		  if (!enteredName) {
      			clearRowData(row);
      			updateDatalist();
      			return;
    		  }
    
    		  if (staffDatabase[enteredName]) {
      			fillRowData(row, enteredName);
      		  } else {
      			clearRowData(row);
    		  }
    
    		  updateDatalist();
		}

		document.addEventListener('input', handleInput);

		// Инициализация при загрузке
		document.querySelectorAll('.select-input').forEach(input => {
		  if (input.value.trim() !== "") {
			handleInput({ target: input });
		  }
		});
		updateDatalist();

// --- ЛОГИКА ЗАГРУЗКИ БАЗЫ (из локальной сети) ---
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
        updateDatalist();
        alert('База сотрудников обновлена!');
      } catch (err) { alert('Ошибка JSON базы'); }
    };
    reader.readAsText(file);
  });

    // ==========================================
		// ЛОГИКА ЗАГРУЗКИ И СОХРАНЕНИЯ
		// ==========================================

		const btnLoad = document.getElementById('btn-load');
		const btnSave = document.getElementById('btn-save');

		if (btnLoad) {
		  btnLoad.addEventListener('click', async () => {
			try {
			  // Здесь указываем путь к файлу на твоём ресурсе
			  const response = await fetch('schedule.json');
			  if (!response.ok) throw new Error('Не удалось загрузить файл');
			  const data = await response.json();
			  loadSchedule(data);
			  alert('Расписание загружено!');
			} catch (e) {
			  console.error(e);
			  alert('Ошибка при загрузке: ' + e.message);
			}
		  });
		}

		if (btnSave) {
		  btnSave.addEventListener('click', () => {
			// Спрашиваем имя файла у пользователя
			let fileName = prompt('Введите имя файла для сохранения:', 'schedule');
			
			// Если пользователь нажал "Отмена", прекращаем работу
			if (fileName === null) return; 
			
			// Если ввели пустоту, ставим имя по умолчанию
			fileName = fileName.trim() || 'schedule';
			
			const data = saveSchedule();
			const jsonString = JSON.stringify(data, null, 2);
			const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
			const url = URL.createObjectURL(blob);
			
			const a = document.createElement('a');
			a.href = url;
			a.download = `${fileName}.json`; // Используем введенное имя
			
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		  });
		}

		// Загрузка: расставляем сотрудников по ячейкам
		function loadSchedule(data) {
    		  // Очищаем все инпуты перед загрузкой, чтобы не было дублей
    		  document.querySelectorAll('.select-input').forEach(inp => {
    			inp.value = '';
    			clearRowData(inp.closest('tr'));
    		  });
    		  updateDatalist();

		  // Проходим по всем ключам JSON
		  for (const key in data) {
      			const mapping = jsonToGridMap[key];
      			if (!mapping) continue; // неизвестный ключ — пропускаем
      
      			const categoryName = mapping.category;
      			const brigadeCol = mapping.brigadeCol; // 1..4
      
      			// Находим строку категории
      			const rows = Array.from(document.querySelectorAll('.category-row'));
      			let categoryRow = null;
      			for (const r of rows) {
      			  const title = r.querySelector('.row-title')?.textContent?.trim();
      			  if (title === categoryName) {
      				categoryRow = r;
      				break;
      			  }
      			}
      			if (!categoryRow) continue;
      
      			// В каждой категории есть ячейки по бригадам: td:nth-child(2), (3), (4), (5)
      			const cells = categoryRow.querySelectorAll('td');
      			const targetCell = cells[brigadeCol]; // brigadeCol 1..4 → индекс 1..4 (0-based, поэтому [brigadeCol])
      			if (!targetCell) continue;
      
      			// Внутри ячейки — таблица .emp-table (или .empST-table для старших)
      			// Для простоты считаем, что используем .emp-table и заполняем строки сверху вниз
      			const innerTable = targetCell.querySelector('.emp-table') || targetCell.querySelector('.empST-table');
      			if (!innerTable) continue;
      
      			const employees = data[key] || [];
      			const inputs = Array.from(innerTable.querySelectorAll('input.select-input'));
      
      			// Заполняем столько строк, сколько есть в массиве (но не больше, чем есть инпутов)
      			employees.forEach((name, idx) => {
      			  if (idx < inputs.length) {
      				inputs[idx].value = name;
      				handleInput({ target: inputs[idx] }); // вызовет автозаполнение ID/роли/даты
      			  }
      			});
      		  }
		}

		// Сохранение: собираем данные со страницы в JSON
		function saveSchedule() {
    		  const result = {};
    
    		  const rows = Array.from(document.querySelectorAll('.category-row'));
    		  rows.forEach(row => {
    			const categoryName = row.querySelector('.row-title')?.textContent?.trim();
    			if (!categoryName) return;
    
    			const cells = row.querySelectorAll('td');
    			// ячейки бригад — это индексы 1,2,3,4 (соответствует бригадам 1–4)
    			for (let brigadeCol = 1; brigadeCol <= 4; brigadeCol++) {
    			  const cell = cells[brigadeCol];
    			  if (!cell) continue;
    
    			  const innerTable = cell.querySelector('.emp-table') || cell.querySelector('.empST-table');
    			  if (!innerTable) continue;
    
    			  const inputs = innerTable.querySelectorAll('input.select-input');
    			  const names = Array.from(inputs)
    				.map(inp => inp.value.trim())
    				.filter(Boolean); // только непустые значения
    
    			  if (names.length === 0) continue;
    
    			  // Ищем ключ JSON по категории и бригаде
    			  const key = getJsonKey(categoryName, brigadeCol);
    			  if (key) {
    				result[key] = names;
    			  }
    			}
    		  });
    
    		  return result;
		}

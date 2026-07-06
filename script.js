// Переменная для хранения базы сотрудников
let staffDatabase = {};

// 1. Обработчик для загрузки базы сотрудников из локальной сети
const staffFileInp = document.getElementById('staffFile');
if (staffFileInp) {
  staffFileInp.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        staffDatabase = JSON.parse(evt.target.result);
        alert('База сотрудников успешно загружена!');
        console.log('Загруженные данные:', staffDatabase);
        // Здесь можно вызвать функцию для перерисовки интерфейса, если нужно
      } catch (err) {
        alert('Ошибка: Файл имеет неверный формат JSON.');
      }
    };
    reader.readAsText(file);
  });
}

// 2. Обработчик для сохранения расписания (наш исходный код, адаптированный под GitHub)
const btnSave = document.getElementById('btnSave');
if (btnSave) {
  btnSave.addEventListener('click', () => {
    // Проверка, есть ли функция saveSchedule в вашем проекте
    if (typeof saveSchedule !== 'function') {
      alert('Ошибка: Функция saveSchedule() не найдена в коде.');
      return;
    }

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
    
    alert('Расписание отправлено в "Загрузки". Перенесите его в нужную папку.');
  });
}

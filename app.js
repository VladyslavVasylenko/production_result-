// Словник перекладів для 3 мов
const i18n = {
    uk: {
        addEntry: "Внесення даних",
        selectDate: "Виберіть дату:",
        enterPercentage: "Відсоток виробітку (%):",
        saveBtn: "Зберегти дані",
        stats: "Статистика за місяць",
        selectMonth: "Обрати місяць:",
        monthlyAverage: "Середній показатель за місяць",
        calendarView: "Візуальний календар змін",
        historyTable: "Список змін за місяць",
        tableDate: "Дата",
        tableValue: "Виробіток",
        tableAction: "Дія",
        deleteBtn: "Видалити",
        mon: "Пн", tue: "Вт", wed: "Ср", thu: "Чт", fri: "Пт", sat: "Сб", sun: "Нд"
    },
    cs: {
        addEntry: "Zadávání dat",
        selectDate: "Vyberte datum:",
        enterPercentage: "Procento výroby (%):",
        saveBtn: "Uložit data",
        stats: "Statistika za měsíc",
        selectMonth: "Vybrat měsíc:",
        monthlyAverage: "Průměrná produkce za měsíc",
        calendarView: "Vizuální kalendář směn",
        historyTable: "Seznam směn za měsíc",
        tableDate: "Datum",
        tableValue: "Výroba",
        tableAction: "Akce",
        deleteBtn: "Smazat",
        mon: "Po", tue: "Út", wed: "St", thu: "Čt", fri: "Pá", sat: "So", sun: "Ne"
    },
    en: {
        addEntry: "Data Entry",
        selectDate: "Select Date:",
        enterPercentage: "Production Percentage (%):",
        saveBtn: "Save Data",
        stats: "Monthly Statistics",
        selectMonth: "Select Month:",
        monthlyAverage: "Monthly Average Efficiency",
        calendarView: "Visual Shift Calendar",
        historyTable: "Shift List for the Month",
        tableDate: "Date",
        tableValue: "Output",
        tableAction: "Action",
        deleteBtn: "Delete",
        mon: "Mo", tue: "Tu", wed: "We", thu: "Th", fri: "Fr", sat: "Sa", sun: "Su"
    }
};

// Завантаження бази даних або створення порожньої
let productionLogs = JSON.parse(localStorage.getItem('productionLogs')) || [];

// Встановлення поточного місяця та сьогоднішнього дня при першому запуску
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    document.getElementById('dateInput').value = today.toISOString().split('T')[0];
    
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('monthFilter').value = currentMonthStr;

    changeLanguage(); // Застосувати мову за замовчуванням
});

// Функція зміни мови інтерфейсу
function changeLanguage() {
    const lang = document.getElementById('langSelector').value;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang][key]) {
            el.innerText = i18n[lang][key];
        }
    });
    renderAll();
}

// Загальна функція перемальовки інтерфейсу
function renderAll() {
    const selectedMonth = document.getElementById('monthFilter').value; // Формат "YYYY-MM"
    if (!selectedMonth) return;

    const [year, month] = selectedMonth.split('-').map(Number);
    
    // Фільтруємо логи для обраного місяця
    const monthlyData = productionLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate.getFullYear() === year && (logDate.getMonth() + 1) === month;
    });

    renderCalendar(year, month, monthlyData);
    renderTable(monthlyData);
    calculateAverage(monthlyData);
}

// Побудова інтерактивного календаря
function renderCalendar(year, month, monthlyData) {
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';

    // Дні тижня у JS починаються з Неділі (0), перетворимо на Європейський (Пн-Нд)
    const firstDayIndex = new Date(year, month - 1, 1).getDay();
    const shiftFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const totalDays = new Date(year, month, 0).getDate();

    // Додаємо порожні комірки для вирівнювання першого дня тижня
    for (let i = 0; i < shiftFirstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        grid.appendChild(emptyCell);
    }

    // Додаємо картки для кожного дня місяця
    for (let day = 1; day <= totalDays; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dayCell.onclick = () => document.getElementById('dateInput').value = dateStr;

        const dayNumSpan = document.createElement('span');
        dayNumSpan.className = 'day-number';
        dayNumSpan.innerText = day;
        dayCell.appendChild(dayNumSpan);

        // Шукаємо чи є дані на цей день
        const logForDay = monthlyData.find(log => log.date === dateStr);
        if (logForDay) {
            dayCell.classList.add('has-data');
            const valSpan = document.createElement('span');
            valSpan.className = 'day-value ';
            
            const pct = parseFloat(logForDay.percentage);
            valSpan.innerText = `${pct}%`;
            
            // Колірна індикація (під ваші особисті рекорди)
            if (pct >= 115) valSpan.className += 'val-high';
            else if (pct >= 100) valSpan.className += 'val-normal';
            else valSpan.className += 'val-low';

            dayCell.appendChild(valSpan);
        }

        grid.appendChild(dayCell);
    }
}

// Рендеринг таблиці під календарем
function renderTable(monthlyData) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    const lang = document.getElementById('langSelector').value;

    // Сортуємо від новіших до старіших
    monthlyData.sort((a, b) => new Date(b.date) - new Date(a.date));

    monthlyData.forEach(log => {
        const row = document.createElement('tr');

        // Локальний формат дати
        const formattedDate = new Date(log.date).toLocaleDateString(lang === 'cs' ? 'cs-CZ' : (lang === 'en' ? 'en-US' : 'uk-UA'));
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td><span class="badge bg-dark border border-secondary text-info fs-6">${log.percentage}%</span></td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteLog('${log.date}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Розрахунок середнього показника
function calculateAverage(monthlyData) {
    const display = document.getElementById('averageDisplay');
    if (monthlyData.length === 0) {
        display.innerText = "0.00%";
        return;
    }

    const total = monthlyData.reduce((sum, item) => sum + parseFloat(item.percentage), 0);
    const avg = (total / monthlyData.length).toFixed(2);
    display.innerText = `${avg}%`;
}

// Додавання або оновлення запису
function saveData() {
    const date = document.getElementById('dateInput').value;
    const percentage = document.getElementById('percentageInput').value;

    if (!date || !percentage) {
        alert('Заповніть будь ласка всі поля! / Vyplňte prosím všechna pole!');
        return;
    }

    // Якщо запис на цю дату є — оновлюємо його, якщо ні — додаємо новий
    const existingIndex = productionLogs.findIndex(log => log.date === date);
    if (existingIndex !== -1) {
        productionLogs[existingIndex].percentage = parseFloat(percentage).toFixed(2);
    } else {
        productionLogs.push({ date, percentage: parseFloat(percentage).toFixed(2) });
    }

    localStorage.setItem('productionLogs', JSON.stringify(productionLogs));
    document.getElementById('percentageInput').value = '';
    renderAll();
}

// Видалення запису
function deleteLog(date) {
    productionLogs = productionLogs.filter(log => log.date !== date);
    localStorage.setItem('productionLogs', JSON.stringify(productionLogs));
    renderAll();
}

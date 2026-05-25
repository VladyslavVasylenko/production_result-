const i18n = {
    uk: {
        addEntry: "Внесення даних", selectDate: "Виберіть дату:", enterPercentage: "Відсоток виробітку (%):",
        saveBtn: "Зберегти дані", stats: "Статистика за місяць", selectMonth: "Обрати місяць:",
        monthlyAverage: "Середній виробіток", calendarView: "Візуальний календар змін",
        historyTable: "Список змін за місяць", tableDate: "Дата", tableValue: "Виробіток",
        tableAction: "Дія", tableShift: "Зміна", shiftType: "Тип зміни:",
        shiftR: "🌅 Ранішня (R)", shiftO: "☀️ Післяобідня (O)", shiftN: "🌃 Нічна (N)", shiftV: "🏖️ Вихідний (V)",
        totalShifts: "Всього змін", dayShifts: "Ранні (R)", afternoonShifts: "Післяобідні (O)", nightShifts: "Нічні (N)",
        mon: "Пн", tue: "Вт", wed: "Ср", thu: "Чт", fri: "Пт", sat: "Сб", sun: "Нд"
    },
    cs: {
        addEntry: "Zadávání dat", selectDate: "Vyberte datum:", enterPercentage: "Procento výroby (%):",
        saveBtn: "Uložit data", stats: "Statistika za měsíc", selectMonth: "Vybrat měsíc:",
        monthlyAverage: "Průměrná produkce", calendarView: "Vizuální kalendář směn",
        historyTable: "Seznam směn za měsíc", tableDate: "Datum", tableValue: "Výroba",
        tableAction: "Akce", tableShift: "Směna", shiftType: "Typ směny:",
        shiftR: "🌅 Ranní (R)", shiftO: "☀️ Odpolední (O)", shiftN: "🌃 Noční (N)", shiftV: "🏖️ Volno (V)",
        totalShifts: "Celkem směn", dayShifts: "Ranních (R)", afternoonShifts: "Odpoledních (O)", nightShifts: "Nočních (N)",
        mon: "Po", tue: "Út", wed: "St", thu: "Čt", fri: "Pá", sat: "So", sun: "Ne"
    },
    en: {
        addEntry: "Data Entry", selectDate: "Select Date:", enterPercentage: "Production Percentage (%):",
        saveBtn: "Save Data", stats: "Monthly Statistics", selectMonth: "Select Month:",
        monthlyAverage: "Monthly Average", calendarView: "Visual Shift Calendar",
        historyTable: "Shift List for the Month", tableDate: "Date", tableValue: "Output",
        tableAction: "Action", tableShift: "Shift", shiftType: "Shift Type:",
        shiftR: "🌅 Morning (R)", shiftO: "☀️ Afternoon (O)", shiftN: "Night (N)", shiftV: "🏖️ Day Off (V)",
        totalShifts: "Total Shifts", dayShifts: "Morning (R)", afternoonShifts: "Afternoon (O)", nightShifts: "Night (N)",
        mon: "Mo", tue: "Tu", wed: "We", thu: "Th", fri: "Fr", sat: "Sa", sun: "Su"
    }
};

let productionLogs = JSON.parse(localStorage.getItem('productionLogs')) || [];

document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    document.getElementById('dateInput').value = today.toISOString().split('T')[0];
    
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('monthFilter').value = currentMonthStr;

    changeLanguage();
});

function changeLanguage() {
    const lang = document.getElementById('langSelector').value;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang][key]) el.innerText = i18n[lang][key];
    });
    renderAll();
}

function renderAll() {
    const selectedMonth = document.getElementById('monthFilter').value;
    if (!selectedMonth) return;

    const [year, month] = selectedMonth.split('-').map(Number);
    
    const monthlyData = productionLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate.getFullYear() === year && (logDate.getMonth() + 1) === month;
    });

    renderCalendar(year, month, monthlyData);
    renderTable(monthlyData);
    calculateStatistics(monthlyData);
}

function renderCalendar(year, month, monthlyData) {
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';

    let firstDayIndex = new Date(year, month - 1, 1).getDay();
    const shiftFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const totalDays = new Date(year, month, 0).getDate();

    for (let i = 0; i < shiftFirstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        grid.appendChild(emptyCell);
    }

    for (let day = 1; day <= totalDays; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        dayCell.onclick = () => {
            document.getElementById('dateInput').value = dateStr;
            const existing = monthlyData.find(l => l.date === dateStr);
            if (existing) {
                const pct = parseFloat(existing.percentage);
                document.getElementById('percentageInput').value = (existing.percentage !== null && pct > 0) ? existing.percentage : '';
                document.getElementById('shiftTypeInput').value = existing.shiftType || 'R';
            } else {
                document.getElementById('percentageInput').value = '';
                document.getElementById('shiftTypeInput').value = 'R';
            }
        };

        const dayNumSpan = document.createElement('span');
        dayNumSpan.className = 'day-number';
        dayNumSpan.innerText = day;
        dayCell.appendChild(dayNumSpan);

        const logForDay = monthlyData.find(log => log.date === dateStr);
        if (logForDay) {
            dayCell.classList.add('has-data');
            
            if (logForDay.shiftType) {
                const shiftBadge = document.createElement('span');
                shiftBadge.className = `day-shift-badge badge-${logForDay.shiftType}`;
                shiftBadge.innerText = logForDay.shiftType;
                dayCell.appendChild(shiftBadge);
            }

            if (logForDay.percentage !== null && logForDay.shiftType !== 'V') {
                const pct = parseFloat(logForDay.percentage);
                if (pct > 0) {
                    const valSpan = document.createElement('span');
                    valSpan.className = 'day-value';
                    valSpan.innerText = `${Math.round(pct)}%`;
                    
                    if (pct >= 115) valSpan.classList.add('val-high');
                    else if (pct >= 100) valSpan.classList.add('val-normal');
                    else valSpan.classList.add('val-low');

                    dayCell.appendChild(valSpan);
                }
            }
        }
        grid.appendChild(dayCell);
    }
}

function renderTable(monthlyData) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    const lang = document.getElementById('langSelector').value;

    monthlyData.sort((a, b) => new Date(b.date) - new Date(a.date));

    monthlyData.forEach(log => {
        const row = document.createElement('tr');
        const formattedDate = new Date(log.date).toLocaleDateString(lang === 'cs' ? 'cs-CZ' : (lang === 'en' ? 'en-US' : 'uk-UA'), {day: '2-digit', month: '2-digit'});
        
        const shiftLabel = log.shiftType === 'R' ? '🌅 R' : (log.shiftType === 'O' ? '☀️ O' : (log.shiftType === 'N' ? '🌃 N' : '🏖️ V'));
        const pct = parseFloat(log.percentage);
        const pctLabel = (log.shiftType === 'V' || log.percentage === null || pct === 0) ? '-' : `${log.percentage}%`;

        row.innerHTML = `
            <td>${formattedDate}</td>
            <td><span class="small fw-bold">${shiftLabel}</span></td>
            <td><span class="badge bg-dark border border-secondary text-info">${pctLabel}</span></td>
            <td>
                <button class="btn btn-sm p-0 px-1 btn-outline-danger" onclick="deleteLog('${log.date}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function calculateStatistics(monthlyData) {
    // Головне виправлення: ВИХІДНІ (V) повністю виключаються з розрахунку середнього відсотка
    const workingLogs = monthlyData.filter(log => log.shiftType !== 'V' && log.percentage !== null && parseFloat(log.percentage) > 0);
    const avgDisplay = document.getElementById('averageDisplay');
    
    if (workingLogs.length === 0) {
        avgDisplay.innerText = "0.00%";
    } else {
        const totalPct = workingLogs.reduce((sum, item) => sum + parseFloat(item.percentage), 0);
        avgDisplay.innerText = `${(totalPct / workingLogs.length).toFixed(2)}%`;
    }

    // Рахуємо кількість відпрацьованих робочих змін для лічильників
    const totalShifts = monthlyData.filter(log => ['R', 'O', 'N'].includes(log.shiftType)).length;
    const dayShifts = monthlyData.filter(log => log.shiftType === 'R').length;
    const afternoonShifts = monthlyData.filter(log => log.shiftType === 'O').length;
    const nightShifts = monthlyData.filter(log => log.shiftType === 'N').length;

    document.getElementById('totalShiftsDisplay').innerText = totalShifts;
    document.getElementById('dayShiftsDisplay').innerText = dayShifts;
    document.getElementById('afternoonShiftsDisplay').innerText = afternoonShifts;
    document.getElementById('nightShiftsDisplay').innerText = nightShifts;
}

function saveData() {
    const date = document.getElementById('dateInput').value;
    const percentage = document.getElementById('percentageInput').value;
    const shiftType = document.getElementById('shiftTypeInput').value;

    if (!date) return;
    
    let pctValue = null;
    // Якщо зміна робоча (не V) і введено число — зберігаємо його
    if (shiftType !== 'V' && percentage && percentage.trim() !== '') {
        pctValue = parseFloat(percentage).toFixed(2);
    }
    // Якщо це вихідний (V), то pctValue автоматично залишається null (чистим)

    const existingIndex = productionLogs.findIndex(log => log.date === date);
    if (existingIndex !== -1) {
        productionLogs[existingIndex].percentage = pctValue;
        productionLogs[existingIndex].shiftType = shiftType;
    } else {
        productionLogs.push({ date, percentage: pctValue, shiftType });
    }

    localStorage.setItem('productionLogs', JSON.stringify(productionLogs));
    document.getElementById('percentageInput').value = '';
    renderAll();
}

function deleteLog(date) {
    productionLogs = productionLogs.filter(log => log.date !== date);
    localStorage.setItem('productionLogs', JSON.stringify(productionLogs));
    renderAll();
}

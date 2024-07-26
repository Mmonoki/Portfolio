// JavaScriptファイル: ketuatu.js

document.addEventListener('DOMContentLoaded', displayRecords);
document.getElementById('bloodPressureForm').addEventListener('submit', saveRecord);
document.getElementById('downloadExcel').addEventListener('click', downloadExcel);
document.getElementById('showInstructions').addEventListener('click', showInstructions);

const editModal = document.getElementById('editModal');
const instructionsModal = document.getElementById('instructionsModal');
const closeModalBtns = document.getElementsByClassName('close-btn');
const editForm = document.getElementById('editForm');

// モーダルを閉じるボタンのイベントリスナー
for (let i = 0; i < closeModalBtns.length; i++) {
    closeModalBtns[i].onclick = function() {
        closeModals();
    };
}

window.onclick = function(event) {
    if (event.target === editModal || event.target === instructionsModal) {
        closeModals();
    }
};

editForm.addEventListener('submit', saveEditRecord);

function displayRecords() {
    const records = getRecords();
    const tbody = document.querySelector('#recordsTable tbody');
    tbody.innerHTML = '';

    records.forEach((record, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.date}</td>
            <td>${record.systolic}</td>
            <td>${record.diastolic}</td>
            <td><button class="edit-btn" onclick="openEditModal(${index})">編集</button></td>
            <td><button class="delete-btn" onclick="confirmDeleteRecord(${index})">削除</button></td>
        `;
        tbody.appendChild(row);
    });

    displayChart(records);
}

function getRecords() {
    return JSON.parse(localStorage.getItem('bloodPressureRecords')) || [];
}

function saveRecord(event) {
    event.preventDefault();

    const date = document.getElementById('date').value;
    const systolic = document.getElementById('systolic').value;
    const diastolic = document.getElementById('diastolic').value;

    const newRecord = { date, systolic, diastolic };
    const records = getRecords();

    records.push(newRecord);

    localStorage.setItem('bloodPressureRecords', JSON.stringify(records));

    document.getElementById('bloodPressureForm').reset();
    displayRecords();
}

function deleteRecord(index) {
    const records = getRecords();
    records.splice(index, 1);
    localStorage.setItem('bloodPressureRecords', JSON.stringify(records));
    displayRecords();
}

function confirmDeleteRecord(index) {
    if (confirm('本当に削除しますか？')) {
        deleteRecord(index);
    }
}

let editingIndex = null;

function openEditModal(index) {
    const records = getRecords();
    const record = records[index];

    document.getElementById('editDate').value = record.date;
    document.getElementById('editSystolic').value = record.systolic;
    document.getElementById('editDiastolic').value = record.diastolic;

    editingIndex = index;
    editModal.style.display = 'block';
}

function saveEditRecord(event) {
    event.preventDefault();

    const date = document.getElementById('editDate').value;
    const systolic = document.getElementById('editSystolic').value;
    const diastolic = document.getElementById('editDiastolic').value;

    const updatedRecord = { date, systolic, diastolic };
    const records = getRecords();

    if (editingIndex !== null) {
        records[editingIndex] = updatedRecord;
        editingIndex = null;
    }

    localStorage.setItem('bloodPressureRecords', JSON.stringify(records));

    editModal.style.display = 'none';
    displayRecords();
}

function displayChart(records) {
    const ctx = document.getElementById('bloodPressureChart').getContext('2d');

    const dates = records.map(record => record.date);
    const systolicValues = records.map(record => record.systolic);
    const diastolicValues = records.map(record => record.diastolic);

    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: '収縮期血圧 (上)',
                    data: systolicValues,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: false
                },
                {
                    label: '拡張期血圧 (下)',
                    data: diastolicValues,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: '日付'
                    },
                    type: 'time',
                    time: {
                        unit: 'day',
                        tooltipFormat: 'yyyy/MM/dd',
                        displayFormats: {
                            day: 'yyyy/MM/dd'
                        }
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: '血圧 (mmHg)'
                    },
                    suggestedMin: 0,
                    suggestedMax: 200
                }
            }
        }
    });
}

// Excel形式でデータをダウンロード
function downloadExcel() {
    const records = getRecords();
    const worksheet = XLSX.utils.json_to_sheet(records);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '血圧データ');
    XLSX.writeFile(workbook, '血圧データ.xlsx');
}

// 取説モーダルを表示
function showInstructions() {
    instructionsModal.style.display = 'block';
}

// モーダルを閉じる
function closeModals() {
    editModal.style.display = 'none';
    instructionsModal.style.display = 'none';
}

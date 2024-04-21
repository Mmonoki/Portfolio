document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form');
  const preview = document.getElementById('preview');
  const monthSelect = document.getElementById('month');
  const dayInput = document.getElementById('day');
  const searchBtn = document.getElementById('search');
  const imageInput = document.getElementById('image');
  const imagePreview = document.getElementById('image-preview');
  const h1 = document.querySelector('h1');
  const commentTextarea = document.getElementById('comment');
  const startDictationBtn = document.getElementById('startDictation');
  let entries = JSON.parse(localStorage.getItem('entries')) || [];

  // h1タグのアニメーション
  setTimeout(() => {
    h1.classList.add('show');
  }, 100);

  // 保存されているエントリーをロード
  displayEntries(entries);

  // 写真のプレビュー機能
  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        imagePreview.src = imageUrl;
        imagePreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  // 音声入力ボタンのクリックイベント
  startDictationBtn.addEventListener('click', () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.lang = 'ja-JP';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        commentTextarea.value += transcript;
      };

      recognition.start();
    } else {
      alert('音声入力はサポートされていません。');
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const date = document.getElementById('date').value;
    const comment = document.getElementById('comment').value;
    const image = imageInput.files[0];

    if (date && comment) {
      let imageUrl = '';
      if (image) {
        const reader = new FileReader();
        reader.onload = (event) => {
          imageUrl = event.target.result;
          saveEntry(date, comment, imageUrl);
        };
        reader.readAsDataURL(image);
      } else {
        saveEntry(date, comment, imageUrl);
      }
    } else {
      alert('日付とコメントを入力してください。');
    }
  });

  searchBtn.addEventListener('click', () => {
    const selectedMonth = monthSelect.value;
    const selectedDay = dayInput.value;

    // プレビューをクリア
    preview.innerHTML = '';

    let filteredEntries = entries;

    if (selectedMonth) {
      filteredEntries = filteredEntries.filter(entry => {
        const entryMonth = new Date(entry.date).getMonth() + 1;
        return entryMonth.toString() === selectedMonth;
      });
    }

    if (selectedDay) {
      filteredEntries = filteredEntries.filter(entry => {
        return entry.date === selectedDay;
      });
    }

    // フィルタリングされたエントリーを表示
    displayEntries(filteredEntries);
  });

  function saveEntry(date, comment, imageUrl) {
    const entry = {
      date: date,
      comment: comment,
      imageUrl: imageUrl
    };

    entries.push(entry);

    // ローカルストレージに保存
    localStorage.setItem('entries', JSON.stringify(entries));

    displayEntries(entries);

    // フォームとプレビューをリセット
    form.reset();
    imagePreview.src = '';
    imagePreview.style.display = 'none';
  }

  function displayEntries(entriesArray) {
    // 一旦全てのエントリーを削除
    preview.innerHTML = '';

    // 日付が新しい順にソート
    entriesArray.sort((a, b) => new Date(b.date) - new Date(a.date));

    // ソートされたエントリーを表示
    entriesArray.forEach(entry => {
      const entryDiv = document.createElement('div');
      entryDiv.classList.add('entry');

      const entryDate = document.createElement('p');
      entryDate.innerText = entry.date;
      entryDiv.appendChild(entryDate);

      const entryComment = document.createElement('p');
      entryComment.innerText = entry.comment;
      entryDiv.appendChild(entryComment);

      if (entry.imageUrl) {
        const entryImage = document.createElement('img');
        entryImage.src = entry.imageUrl;
        entryImage.style.maxWidth = '100%';
        entryImage.style.height = 'auto';
        entryImage.style.marginTop = '15px';
        entryImage.style.borderRadius = '8px';
        entryDiv.appendChild(entryImage);
      }

      // 削除ボタンの追加
      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('delete-btn');
      deleteBtn.innerText = '削除';
      deleteBtn.addEventListener('click', () => {
        if (confirm('削除しますか？')) { // 確認アラート
          deleteEntry(entry);
          entryDiv.remove();
        }
      });
      entryDiv.appendChild(deleteBtn);

      preview.appendChild(entryDiv);
    });
  }

  function deleteEntry(entry) {
    entries = entries.filter(e => e.date !== entry.date || e.comment !== entry.comment || e.imageUrl !== entry.imageUrl);
    localStorage.setItem('entries', JSON.stringify(entries));
  }

  function populateDays(month) {
    const daysInput = document.getElementById('day');
    daysInput.value = '';  // 日付入力をクリア

    const daysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();
    const daysOptions = [];
    for (let i = 1; i <= daysInMonth; i++) {
      daysOptions.push(`${new Date().getFullYear()}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
    }
    daysOptions.unshift('');  // 全てのオプションを追加
    daysInput.innerHTML = daysOptions.map(day => `<option value="${day}">${String(day).split('-')[2]}</option>`).join('');
  }

  monthSelect.addEventListener('change', (e) => {
    populateDays(e.target.value);
  });

  populateDays(new Date().getMonth() + 1);
});
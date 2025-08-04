//  預設關閉區塊 (a) - 但排除需要預設打開的
window.onload = function () {
  for (var i = 1; i <= 9; i++) {
    const element = document.getElementById("a" + i);
    if (element) {
      // 排除 a1 和 a8，讓它們保持 showPage 設定的狀態
      if (i !== 1 && i !== 8) {
        element.style.display = 'none';
      }
    }
  }
}

function showhidediv(id) {
  try {
    var sbtitle = document.getElementById(id);
    if (!sbtitle) return;
    
    // 取得當前的顯示狀態（需要檢查計算後的樣式）
    const currentDisplay = window.getComputedStyle(sbtitle).display;
    
    // 先關閉所有其他區塊
    for (var i = 1; i <= 9; i++) {
      const element = document.getElementById("a" + i);
      if (element && id !== "a" + i) {
        element.style.display = 'none';
      }
    }
    
    // 切換目標區塊的顯示狀態
    if (currentDisplay === 'block') {
      sbtitle.style.display = 'none';
    } else {
      sbtitle.style.display = 'block';
    }
  } catch (e) { 
    console.error('showhidediv error:', e);
  }
}

function getLessonIdFromFilename() {
  const path = window.location.pathname;
  const file = path.substring(path.lastIndexOf('/') + 1);
  return file.split('.')[0]; // 例如 "L1.html" → "L1"
}

function getBlockContainer(blockId) {
  return document.getElementById('block' + blockId.replace('a', ''));
}

function loadContentFromJSON(jsonPath, lessonId) {
  fetch(jsonPath)
    .then(res => res.json())
    .then(data => {
      const filtered = data.filter(item => item.lesson === lessonId);
      
      filtered.forEach(item => {
        let target;

        if (item.type === 'audio' || item.type === 'button') {
          target = document.getElementById(item.block);
        } else if (item.type === 'link') {
          target = null;
        } else {
          target = getBlockContainer(item.block);
        }

        if (!target && item.type !== 'link') return;

        // ✅ 插入按鈕
        if (item.type === 'button') {
          const btn = document.createElement('button');
          btn.className = 'bt';
          btn.type = 'button';
          btn.textContent = item.label;
          btn.onclick = () => window.open(item.src, '_blank');
          target.appendChild(btn);
        }

        // ✅ 插入音檔
        if (item.type === 'audio') {
          const container = document.createElement('div');
          container.classList.add('audio-block');

          const p = document.createElement('p');
          p.textContent = item.label;

          const status = document.createElement('p');
          status.textContent = '🎧 音檔載入中...';
          status.className = 'loading';
          status.style.color = 'gray';

          const audio = document.createElement('audio');
          audio.controls = true;
          audio.preload = 'auto';
          audio.style.display = 'none';

          const source = document.createElement('source');
          source.src = item.src;
          source.type = 'audio/mpeg';
          audio.appendChild(source);

          // ✅ 成功載入
          audio.addEventListener('canplaythrough', () => {
            status.style.display = 'none';
            audio.style.display = 'block';
          });

          // ❌ 失敗載入
          audio.addEventListener('error', () => {
            status.textContent = '❌ 無法載入音檔';
            status.style.color = 'red';
          });

          container.appendChild(p);
          container.appendChild(status);
          container.appendChild(audio);
          target.appendChild(container);
        }

        // ✅ section 連結
        if (item.type === 'link') {
          const block = getBlockContainer(item.block);
          const section = block?.querySelector('section h1, section p');
          if (section) {
            section.onclick = () => window.open(item.src, '_blank');
            section.style.cursor = 'pointer';
          }
        }
      });

      // 重新初始化音檔控制（如果你有這個）
      if (typeof window.reinitAudioControl === 'function') {
        setTimeout(() => {
          window.reinitAudioControl();
        }, 300);
      }
    })
    .catch(err => {
      console.error('❌ 無法讀取 JSON:', err);
    });
}


// ⏬ 頁面載入後執行：從檔名抓課次，讀取對應資料
window.addEventListener('DOMContentLoaded', () => {
  const lesson = getLessonIdFromFilename(); // e.g. "L1"
  loadContentFromJSON('buttons.json', lesson);
});
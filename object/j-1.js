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

function loadContentFromCSV(csvPath, lessonId) {
  Papa.parse(csvPath, {
    download: true,
    header: true,
    complete: function (results) {
      const data = results.data;
      const filtered = data.filter(item => item.lesson === lessonId);

      const audioMap = {}; // 儲存所有區塊的音檔清單

      filtered.forEach(item => {
        let target;

        // 處理音檔資料，不立即插入 DOM
        if (item.type === 'audio') {
          if (!audioMap[item.block]) {
            audioMap[item.block] = [];
          }
          audioMap[item.block].push({ label: item.label, src: item.src_or_url });
          return;
        }

        // 其餘類型正常插入
        if (item.type === 'button') {
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
          btn.onclick = () => window.open(item.src_or_url, '_blank');
          target.appendChild(btn);
        }

        // ✅ 插入超連結
        if (item.type === 'link') {
          const block = getBlockContainer(item.block);
          const section = block?.querySelector('section h1, section p');
          if (section) {
            section.onclick = () => window.open(item.src_or_url, '_blank');
            section.style.cursor = 'pointer';
          }
        }
      });

      // ✅ 延後處理所有 audioMap 音檔（單一播放器 + 假播放條）
      Object.keys(audioMap).forEach(blockId => {
        const target = document.getElementById(blockId);
        const audioList = audioMap[blockId];
        if (!target || !audioList || audioList.length === 0) return;

        const trigger = document.createElement('div');
        trigger.className = 'fake-audio';
        trigger.innerHTML = `
          <div class="play-icon"></div>
          <span>點擊播放 ${audioList.length} 段音檔</span>
        `;

        const nowPlaying = document.createElement('p');
        nowPlaying.textContent = '';
        nowPlaying.style.fontSize = '0.95em';
        nowPlaying.style.color = '#666';

        trigger.onclick = () => {
          const audio = document.createElement('audio');
          audio.controls = true;
          audio.preload = 'auto';
          const source = document.createElement('source');
          source.type = 'audio/mpeg';
          audio.appendChild(source);

          let current = 0;
          const playNext = () => {
            if (current >= audioList.length) return;
            const item = audioList[current];
            nowPlaying.textContent = `▶ 正在播放：${item.label}`;
            source.src = item.src;
            audio.load();
            audio.play();
            current++;
          };

          audio.onended = playNext;
          playNext();

          trigger.replaceWith(audio);
        };

        target.appendChild(trigger);
        target.appendChild(nowPlaying);
      });

      console.log('✅ CSV 音檔載入完成');
    },
    error: function (error) {
      console.error('CSV 載入錯誤:', error);
    }
  });
}


// ⏬ 頁面載入後執行：從檔名抓課次，讀取對應資料
window.addEventListener('DOMContentLoaded', () => {
  const lesson = getLessonIdFromFilename();
  loadContentFromCSV('buttons.csv', lesson);
});
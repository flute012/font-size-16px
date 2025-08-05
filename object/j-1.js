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

      filtered.forEach(item => {
        let target;
        
        // 根據類型決定插入位置
        if (item.type === 'audio') {
          // 音檔插入到 aX 區塊中
          target = document.getElementById(item.block);
        } else if (item.type === 'button') {
          // 按鈕插入到 aX 區塊中（不是 blockX）
          target = document.getElementById(item.block);
        } else if (item.type === 'link') {
          // 連結處理不需要 target，直接處理 section
          target = null;
        } else {
          // 其他類型插入到 blockX 中
          target = getBlockContainer(item.block);
        }

        if (!target && item.type !== 'link') return;

        // ✅ 1. 插入按鈕（插入到 aX 區塊中）
        if (item.type === 'button') {
          const btn = document.createElement('button');
          btn.className = 'bt';
          btn.type = 'button';
          btn.textContent = item.label;
          btn.onclick = () => window.open(item.src_or_url, '_blank');
          target.appendChild(btn);
        }

        // ✅ 2. 插入音檔區塊：p + audio + source
        if (item.type === 'audio') {
          console.log('🔊 加入音檔：', item.label, item.src_or_url); 
          const p = document.createElement('p');
          p.textContent = item.label;

          const audio = document.createElement('audio');
            audio.controls = true;
            audio.preload = 'none';
          
          const mp3Path = item.src_or_url.split('|').map(s => s.trim())[0]; // ✅ 取第一個音檔（mp3）
          
          if (mp3Path) {
            const sourceMp3 = document.createElement('source');
            sourceMp3.src = mp3Path;
            sourceMp3.type = 'audio/mpeg';
            audio.appendChild(sourceMp3);
          }

            audio.onerror = () => {
              const warn = document.createElement('p');
              warn.textContent = '⚠️ 音檔載入失敗';
              audio.parentNode?.appendChild(warn);
            };
          
            const target = document.getElementById(item.block);
            if (target) {
              target.appendChild(p);
              target.appendChild(audio);
              target.appendChild(fallback);
            }
          }


        // ✅ 3. 插入連結到 section（讓整個 section 變成可點擊連結）
        if (item.type === 'link') {
          const block = getBlockContainer(item.block);
          const section = block?.querySelector('section h1, section p');
          
          if (section) {
            // 將 onclick 事件加到 section 標題上
            section.onclick = () => window.open(item.src_or_url, '_blank');
            section.style.cursor = 'pointer'; // 加入游標提示
          }
        }
        
      });
      
      console.log('CSV 載入完成，重新初始化音檔控制');
      
      // 延遲重新初始化，確保所有 DOM 元素都已插入
      setTimeout(() => {
        if (typeof window.reinitAudioControl === 'function') {
          window.reinitAudioControl();
        }
      }, 500);
    },
    error: function(error) {
      console.error('資料載入錯誤:', error);
    }
  });
}

// ⏬ 頁面載入後執行：從檔名抓課次，讀取對應資料
window.addEventListener('DOMContentLoaded', () => {
  const lesson = getLessonIdFromFilename();
  loadContentFromCSV('buttons.csv', lesson);

});


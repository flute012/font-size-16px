// 創建假播放器 (iOS 專用)
function createFakeAudioPlayer(label, audioElement) {
  const fakePlayer = document.createElement('div');
  fakePlayer.className = 'fake-audio-player';
  
  // 播放按鈕
  const playButton = document.createElement('button');
  playButton.className = 'fake-play-button';
  
  // 進度條
  const progressBar = document.createElement('div');
  progressBar.className = 'fake-progress-bar';
  
  // 提示文字
  const hint = document.createElement('span');
  hint.className = 'fake-player-hint';
  hint.textContent = '點擊播放';
  
  fakePlayer.appendChild(playButton);
  fakePlayer.appendChild(progressBar);
  fakePlayer.appendChild(hint);
  
  // 點擊事件：啟用真實播放器
  fakePlayer.addEventListener('click', function() {
    console.log('iOS: 啟用真實播放器');
    
    // 隱藏假播放器
    fakePlayer.classList.add('hidden');
    
    // 顯示真實播放器
    audioElement.style.display = 'block';
    audioElement.classList.remove('replaced');
    
    // 載入並播放音檔
    audioElement.load();
    audioElement.play().catch(error => {
      console.error('iOS 播放失敗:', error);
    });
    
    // 重新初始化音檔控制
    setTimeout(() => {
      if (typeof window.reinitAudioControl === 'function') {
        window.reinitAudioControl();
      }
    }, 300);
  });
  
  return fakePlayer;
}

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
    
    // 如果是要打開區塊
    if (currentDisplay === 'none') {
      sbtitle.style.display = 'block';
      
      // 檢查是否有音檔需要預載（iPad 特殊處理）
      const audioElements = sbtitle.querySelectorAll('audio');
      if (audioElements.length > 0) {
        console.log(`區塊 ${id} 打開，找到 ${audioElements.length} 個音檔`);
        
        // 對 iPad/iOS 進行特殊處理
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
          console.log('檢測到 iOS 設備，預載音檔');
          audioElements.forEach((audio, index) => {
            // 強制載入音檔 metadata
            audio.load();
            
            // 設定預載完成監聽器
            audio.addEventListener('loadedmetadata', function() {
              console.log(`iOS 音檔 ${index + 1} 預載完成`);
            }, { once: true });
            
            // 避免音檔載入時觸發額外的事件
            audio.addEventListener('loadstart', function(e) {
              e.stopPropagation();
            }, { once: true });
          });
        }
        
        // 延遲重新初始化音檔控制，確保音檔已載入
        setTimeout(() => {
          if (typeof window.reinitAudioControl === 'function') {
            window.reinitAudioControl();
          }
        }, 300);
      }
    } else {
      // 關閉區塊
      sbtitle.style.display = 'none';
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

        // ✅ 2. 插入音檔區塊：p + audio + source (iOS 特殊處理)
        if (item.type === 'audio') {
          console.log('🔊 加入音檔：', item.label, item.src_or_url); 
          const p = document.createElement('p');
          p.textContent = item.label;

          const audio = document.createElement('audio');
          audio.controls = true;
          audio.preload = 'auto';

          const source = document.createElement('source');
          source.src = item.src_or_url;
          source.type = 'audio/mpeg';
          audio.appendChild(source);

          // 檢測是否為 iOS 設備
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          
          if (isIOS) {
            // iOS：先創建假播放器
            const fakePlayer = createFakeAudioPlayer(item.label, audio);
            target.appendChild(p);
            target.appendChild(fakePlayer);
            target.appendChild(audio);
            
            // 隱藏真實的 audio 元素
            audio.classList.add('replaced');
            audio.style.display = 'none';
          } else {
            // 非 iOS：正常顯示
            target.appendChild(p);
            target.appendChild(audio);
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
      console.error('CSV 載入錯誤:', error);
    }
  });
}

// ⏬ 頁面載入後執行：從檔名抓課次，讀取對應資料
window.addEventListener('DOMContentLoaded', () => {
  const lesson = getLessonIdFromFilename();
  loadContentFromCSV('buttons.csv', lesson);
});

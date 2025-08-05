// iOS Safari 音檔自動播放解決方案
// 使用 playsinline + muted 實現媒體自動播放

// 修正後的 loadContentFromCSV 函數
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
          target = document.getElementById(item.block);
        } else if (item.type === 'button') {
          target = document.getElementById(item.block);
        } else if (item.type === 'link') {
          target = null;
        } else {
          target = getBlockContainer(item.block);
        }

        if (!target && item.type !== 'link') return;

        // 插入按鈕
        if (item.type === 'button') {
          const btn = document.createElement('button');
          btn.className = 'bt';
          btn.type = 'button';
          btn.textContent = item.label;
          btn.onclick = () => window.open(item.src_or_url, '_blank');
          target.appendChild(btn);
        }

        // 插入音檔區塊 - iOS 優化版
        if (item.type === 'audio') {
          console.log('🔊 加入音檔：', item.label, item.src_or_url); 
          
          const audioContainer = document.createElement('div');
          audioContainer.className = 'audio-container';
          
          // 音檔標題
          const titleP = document.createElement('p');
          titleP.className = 'audio-title';
          titleP.textContent = item.label;
          audioContainer.appendChild(titleP);
          
          // 創建音檔元素
          const audio = document.createElement('audio');
          audio.controls = true;
          audio.preload = 'metadata';
          
          // iOS Safari 優化設定
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          if (isIOS) {
            audio.setAttribute('playsinline', ''); // 允許內聯播放
            audio.muted = true; // 初始靜音以允許自動播放
            console.log('iOS 設定：playsinline + muted');
          }

          const source = document.createElement('source');
          source.src = item.src_or_url;
          source.type = 'audio/mpeg';
          audio.appendChild(source);
          
          // 如果是 iOS，添加取消靜音的控制
          if (isIOS) {
            const unmuteButton = document.createElement('button');
            unmuteButton.className = 'unmute-button';
            unmuteButton.textContent = '🔊 點擊開啟聲音';
            unmuteButton.onclick = function() {
              enableAudioForIOS();
              this.style.display = 'none';
            };
            audioContainer.appendChild(unmuteButton);
          }
          
          audioContainer.appendChild(audio);
          target.appendChild(audioContainer);
        }

        // 插入連結
        if (item.type === 'link') {
          const block = getBlockContainer(item.block);
          const section = block?.querySelector('section h1, section p');
          
          if (section) {
            section.onclick = () => window.open(item.src_or_url, '_blank');
            section.style.cursor = 'pointer';
          }
        }
      });
      
      console.log('CSV 載入完成，重新初始化音檔控制');
      
      // 延遲重新初始化，確保所有 DOM 元素都已插入
      setTimeout(() => {
        if (typeof window.reinitAudioControl === 'function') {
          window.reinitAudioControl();
        }
        
        // iOS 專用：預載音檔
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
          preloadAudioForIOS();
        }
      }, 500);
    },
    error: function(error) {
      console.error('CSV 載入錯誤:', error);
    }
  });
}

// iOS 音檔預載函數
function preloadAudioForIOS() {
  console.log('iOS: 開始預載音檔');
  const audioElements = document.querySelectorAll('audio');
  
  audioElements.forEach((audio, index) => {
    // 載入音檔 metadata
    audio.load();
    
    // 監聽載入事件
    audio.addEventListener('loadedmetadata', function() {
      console.log(`iOS 音檔 ${index + 1} 預載完成`);
    }, { once: true });
    
    // 監聽載入錯誤
    audio.addEventListener('error', function(e) {
      console.error(`iOS 音檔 ${index + 1} 載入錯誤:`, e);
    }, { once: true });
  });
}

// 啟用 iOS 音檔聲音
function enableAudioForIOS() {
  console.log('iOS: 啟用所有音檔聲音');
  const audioElements = document.querySelectorAll('audio');
  
  // 透過使用者互動來取消所有音檔的靜音
  audioElements.forEach((audio, index) => {
    audio.muted = false;
    console.log(`音檔 ${index + 1} 已取消靜音`);
  });
  
  // 隱藏所有取消靜音按鈕
  const unmuteButtons = document.querySelectorAll('.unmute-button');
  unmuteButtons.forEach(button => {
    button.style.display = 'none';
  });
  
  // 標記已啟用聲音
  window.iosAudioEnabled = true;
}

// 全域函數：手動啟用音檔（供外部調用）
function enableAllAudio() {
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    enableAudioForIOS();
  }
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
  
  // iOS 使用者互動監聽
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    // 監聽第一次使用者互動，自動啟用音檔
    function enableOnFirstInteraction() {
      if (!window.iosAudioEnabled) {
        console.log('iOS: 偵測到使用者互動，準備啟用音檔');
        // 延遲執行，避免過早觸發
        setTimeout(() => {
          const audioElements = document.querySelectorAll('audio');
          if (audioElements.length > 0 && !window.iosAudioEnabled) {
            console.log('iOS: 自動啟用音檔聲音');
            enableAudioForIOS();
          }
        }, 1000);
      }
      // 移除監聽器
      document.removeEventListener('touchstart', enableOnFirstInteraction);
      document.removeEventListener('click', enableOnFirstInteraction);
    }
    
    document.addEventListener('touchstart', enableOnFirstInteraction, { once: true });
    document.addEventListener('click', enableOnFirstInteraction, { once: true });
  }
}

function showhidediv(id) {
  try {
    var sbtitle = document.getElementById(id);
    if (!sbtitle) return;
    
    // 取得當前的顯示狀態
    const currentDisplay = window.getComputedStyle(sbtitle).display;
    
    // 先暫停所有正在播放的音檔
    const allAudios = document.querySelectorAll('audio');
    allAudios.forEach(audio => {
      if (!audio.paused) {
        audio.pause();
      }
    });
    
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
      console.log(`區塊 ${id} 已打開`);
      
      // 檢查是否有音檔需要預載（iOS 特殊處理）
      const audioElements = sbtitle.querySelectorAll('audio');
      if (audioElements.length > 0) {
        console.log(`區塊 ${id} 打開，找到 ${audioElements.length} 個音檔`);
        
        // 對 iOS 進行特殊處理
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
          console.log('檢測到 iOS 設備，預載音檔');
          audioElements.forEach((audio, index) => {
            // 確保 iOS 設定正確
            if (!audio.hasAttribute('playsinline')) {
              audio.setAttribute('playsinline', '');
            }
            if (!window.iosAudioEnabled && !audio.muted) {
              audio.muted = true;
            }
            
            // 強制載入音檔 metadata
            audio.load();
            
            // 設定預載完成監聽器
            audio.addEventListener('loadedmetadata', function() {
              console.log(`iOS 音檔 ${index + 1} 預載完成`);
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
  return file.split('.')[0];
}

function getBlockContainer(blockId) {
  return document.getElementById('block' + blockId.replace('a', ''));
}

// 初始化全域變數
window.iosAudioEnabled = false;

// 暴露全域函數
window.enableAllAudio = enableAllAudio;

// ⏬ 頁面載入後執行
window.addEventListener('DOMContentLoaded', () => {
  const lesson = getLessonIdFromFilename();
  loadContentFromCSV('buttons.csv', lesson);
});

// 創建假播放器 (iOS 專用) - 修正版
function createFakeAudioPlayer(label, audioElement) {
  const fakePlayer = document.createElement('div');
  fakePlayer.className = 'fake-audio-player';
  
  // 播放按鈕
  const playButton = document.createElement('button');
  playButton.className = 'fake-play-button';
  playButton.innerHTML = '▶️'; // 播放圖示
  
  // 進度條容器
  const progressContainer = document.createElement('div');
  progressContainer.className = 'fake-progress-container';
  
  const progressBar = document.createElement('div');
  progressBar.className = 'fake-progress-bar';
  
  const progressFill = document.createElement('div');
  progressFill.className = 'fake-progress-fill';
  progressBar.appendChild(progressFill);
  progressContainer.appendChild(progressBar);
  
  // 音檔標題
  const title = document.createElement('span');
  title.className = 'fake-player-title';
  title.textContent = label;
  
  // 狀態提示
  const status = document.createElement('span');
  status.className = 'fake-player-status';
  status.textContent = '載入中...';
  
  fakePlayer.appendChild(playButton);
  fakePlayer.appendChild(title);
  fakePlayer.appendChild(progressContainer);
  fakePlayer.appendChild(status);
  
  // 儲存相關元素的參考
  fakePlayer._audioElement = audioElement;
  fakePlayer._playButton = playButton;
  fakePlayer._progressFill = progressFill;
  fakePlayer._status = status;
  fakePlayer._isLoaded = false;
  fakePlayer._label = label;
  
  // 開始檢測音檔載入狀態
  checkAudioLoadStatus(fakePlayer);
  
  // 點擊事件：切換到真實播放器
  fakePlayer.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!fakePlayer._isLoaded) {
      console.log('音檔尚未載入完成，請稍候');
      return;
    }
    
    console.log('iOS: 切換到真實播放器 -', label);
    
    // 切換到真實播放器模式
    switchToRealAudioPlayers();
    
    // 開始播放這個音檔
    audioElement.play().then(() => {
      console.log('開始播放:', label);
    }).catch(error => {
      console.error('播放失敗:', error);
    });
  });
  
  return fakePlayer;
}

// 檢測音檔載入狀態
function checkAudioLoadStatus(fakePlayer) {
  const audioElement = fakePlayer._audioElement;
  const status = fakePlayer._status;
  
  // 設定載入事件監聽器
  audioElement.addEventListener('loadstart', function() {
    console.log('開始載入音檔:', fakePlayer._label);
    status.textContent = '載入中...';
    status.className = 'fake-player-status loading';
  });
  
  audioElement.addEventListener('loadedmetadata', function() {
    console.log('音檔 metadata 載入完成:', fakePlayer._label);
    status.textContent = '準備中...';
  });
  
  audioElement.addEventListener('canplay', function() {
    console.log('音檔可以播放:', fakePlayer._label);
    fakePlayer._isLoaded = true;
    status.textContent = '點擊播放';
    status.className = 'fake-player-status ready';
    fakePlayer.classList.add('ready');
  });
  
  audioElement.addEventListener('canplaythrough', function() {
    console.log('音檔完全載入:', fakePlayer._label);
    fakePlayer._isLoaded = true;
    status.textContent = '點擊播放';
    status.className = 'fake-player-status ready';
    fakePlayer.classList.add('ready');
  });
  
  audioElement.addEventListener('error', function(e) {
    console.error('音檔載入錯誤:', fakePlayer._label, e);
    status.textContent = '載入失敗';
    status.className = 'fake-player-status error';
    fakePlayer.classList.add('error');
    fakePlayer._playButton.innerHTML = '❌';
  });
  
  // 開始載入音檔
  audioElement.load();
  
  // 備用檢查：如果 3 秒後還沒載入完成，再次嘗試
  setTimeout(() => {
    if (!fakePlayer._isLoaded && audioElement.readyState >= 3) {
      console.log('備用檢查：音檔實際已可播放');
      fakePlayer._isLoaded = true;
      status.textContent = '點擊播放';
      status.className = 'fake-player-status ready';
      fakePlayer.classList.add('ready');
    }
  }, 3000);
}

// 切換到真實播放器模式
function switchToRealAudioPlayers() {
  console.log('=== 切換到真實播放器模式 ===');
  
  // 找到所有假播放器和對應的真實播放器
  const fakePlayers = document.querySelectorAll('.fake-audio-player');
  
  fakePlayers.forEach(fakePlayer => {
    const audioElement = fakePlayer._audioElement;
    const container = fakePlayer.parentNode;
    
    // 隱藏假播放器
    fakePlayer.style.display = 'none';
    
    // 顯示真實播放器
    audioElement.style.display = 'block';
    audioElement.classList.remove('ios-hidden');
    
    // 添加音檔標題（如果還沒有的話）
    if (!container.querySelector('.audio-title')) {
      const titleP = document.createElement('p');
      titleP.className = 'audio-title';
      titleP.textContent = fakePlayer._label;
      container.insertBefore(titleP, audioElement);
    }
    
    console.log('顯示真實播放器:', fakePlayer._label);
  });
  
  // 重新初始化音檔控制
  setTimeout(() => {
    if (typeof window.reinitAudioControl === 'function') {
      window.reinitAudioControl();
    }
  }, 300);
  
  // 標記已切換到真實播放器
  window.iosAudioSwitched = true;
}

// 修正後的 loadContentFromCSV 函數中的音檔處理部分
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

        // 插入音檔區塊 - 修正版
        if (item.type === 'audio') {
          console.log('🔊 加入音檔：', item.label, item.src_or_url); 
          
          const audioContainer = document.createElement('div');
          audioContainer.className = 'audio-container';
          
          const audio = document.createElement('audio');
          audio.controls = true;
          audio.preload = 'metadata';

          const source = document.createElement('source');
          source.src = item.src_or_url;
          source.type = 'audio/mpeg';
          audio.appendChild(source);

          // 檢測是否為 iOS 設備且尚未切換到真實播放器
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          
          if (isIOS && !window.iosAudioSwitched) {
            // iOS：創建假播放器
            const fakePlayer = createFakeAudioPlayer(item.label, audio);
            audioContainer.appendChild(fakePlayer);
            audioContainer.appendChild(audio);
            
            // 隱藏真實的 audio 元素
            audio.style.display = 'none';
            audio.classList.add('ios-hidden');
          } else {
            // 非 iOS 或已切換：顯示標題和正常播放器
            const p = document.createElement('p');
            p.className = 'audio-title';
            p.textContent = item.label;
            audioContainer.appendChild(p);
            audioContainer.appendChild(audio);
          }
          
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
      
      console.log('CSV 載入完成');
    },
    error: function(error) {
      console.error('CSV 載入錯誤:', error);
    }
  });
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
      
      // 如果區塊中有音檔且尚未切換到真實播放器，重新檢查載入狀態
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS && !window.iosAudioSwitched) {
        const fakePlayers = sbtitle.querySelectorAll('.fake-audio-player');
        fakePlayers.forEach(fakePlayer => {
          if (!fakePlayer._isLoaded) {
            checkAudioLoadStatus(fakePlayer);
          }
        });
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
window.iosAudioSwitched = false;

// ⏬ 頁面載入後執行
window.addEventListener('DOMContentLoaded', () => {
  const lesson = getLessonIdFromFilename();
  loadContentFromCSV('buttons.csv', lesson);
});

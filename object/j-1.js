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
  status.textContent = '點擊播放';
  
  fakePlayer.appendChild(playButton);
  fakePlayer.appendChild(title);
  fakePlayer.appendChild(progressContainer);
  fakePlayer.appendChild(status);
  
  // 儲存相關元素的參考
  fakePlayer._audioElement = audioElement;
  fakePlayer._playButton = playButton;
  fakePlayer._progressFill = progressFill;
  fakePlayer._status = status;
  fakePlayer._isActivated = false;
  fakePlayer._isPlaying = false;
  
  // 點擊事件：啟用真實播放器
  fakePlayer.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('iOS: 啟用音檔 -', label);
    
    // 暫停所有其他正在播放的音檔
    document.querySelectorAll('.fake-audio-player').forEach(otherPlayer => {
      if (otherPlayer !== fakePlayer && otherPlayer._isPlaying) {
        stopFakePlayer(otherPlayer);
      }
    });
    
    if (!fakePlayer._isActivated) {
      // 第一次啟用
      activateFakePlayer(fakePlayer);
    } else if (fakePlayer._isPlaying) {
      // 已在播放，暫停
      pauseFakePlayer(fakePlayer);
    } else {
      // 已啟用但暫停，繼續播放
      resumeFakePlayer(fakePlayer);
    }
  });
  
  return fakePlayer;
}

// 啟用假播放器
function activateFakePlayer(fakePlayer) {
  const audioElement = fakePlayer._audioElement;
  
  fakePlayer._status.textContent = '載入中...';
  fakePlayer._playButton.innerHTML = '⏸️';
  
  // 載入並播放音檔
  audioElement.load();
  
  const playPromise = audioElement.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      console.log('iOS 音檔開始播放');
      fakePlayer._isActivated = true;
      fakePlayer._isPlaying = true;
      fakePlayer._status.textContent = '播放中';
      fakePlayer.classList.add('playing');
      
      // 開始更新進度條
      updateFakePlayerProgress(fakePlayer);
      
    }).catch(error => {
      console.error('iOS 播放失敗:', error);
      fakePlayer._status.textContent = '播放失敗';
      fakePlayer._playButton.innerHTML = '▶️';
    });
  }
  
  // 設定音檔事件監聽器
  setupAudioEventListeners(fakePlayer);
}

// 暫停假播放器
function pauseFakePlayer(fakePlayer) {
  const audioElement = fakePlayer._audioElement;
  audioElement.pause();
  
  fakePlayer._isPlaying = false;
  fakePlayer._playButton.innerHTML = '▶️';
  fakePlayer._status.textContent = '已暫停';
  fakePlayer.classList.remove('playing');
}

// 恢復播放假播放器
function resumeFakePlayer(fakePlayer) {
  const audioElement = fakePlayer._audioElement;
  
  const playPromise = audioElement.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      fakePlayer._isPlaying = true;
      fakePlayer._playButton.innerHTML = '⏸️';
      fakePlayer._status.textContent = '播放中';
      fakePlayer.classList.add('playing');
      updateFakePlayerProgress(fakePlayer);
    }).catch(error => {
      console.error('恢復播放失敗:', error);
    });
  }
}

// 停止假播放器
function stopFakePlayer(fakePlayer) {
  const audioElement = fakePlayer._audioElement;
  audioElement.pause();
  audioElement.currentTime = 0;
  
  fakePlayer._isPlaying = false;
  fakePlayer._playButton.innerHTML = '▶️';
  fakePlayer._status.textContent = '已停止';
  fakePlayer.classList.remove('playing');
  fakePlayer._progressFill.style.width = '0%';
}

// 設定音檔事件監聽器
function setupAudioEventListeners(fakePlayer) {
  const audioElement = fakePlayer._audioElement;
  
  // 播放結束事件
  audioElement.addEventListener('ended', function() {
    console.log('音檔播放完畢');
    fakePlayer._isPlaying = false;
    fakePlayer._playButton.innerHTML = '▶️';
    fakePlayer._status.textContent = '播放完畢';
    fakePlayer.classList.remove('playing');
    fakePlayer._progressFill.style.width = '100%';
    
    // 自動播放下一個音檔
    setTimeout(() => {
      playNextAudio(fakePlayer);
    }, 500);
  });
  
  // 錯誤事件
  audioElement.addEventListener('error', function(e) {
    console.error('音檔錯誤:', e);
    fakePlayer._status.textContent = '播放錯誤';
    fakePlayer._playButton.innerHTML = '❌';
  });
  
  // 時間更新事件
  audioElement.addEventListener('timeupdate', function() {
    if (fakePlayer._isPlaying) {
      updateFakePlayerProgress(fakePlayer);
    }
  });
}

// 更新假播放器進度條
function updateFakePlayerProgress(fakePlayer) {
  const audioElement = fakePlayer._audioElement;
  
  if (audioElement.duration && audioElement.currentTime) {
    const progress = (audioElement.currentTime / audioElement.duration) * 100;
    fakePlayer._progressFill.style.width = `${progress}%`;
    
    // 更新時間顯示
    const currentMin = Math.floor(audioElement.currentTime / 60);
    const currentSec = Math.floor(audioElement.currentTime % 60);
    const totalMin = Math.floor(audioElement.duration / 60);
    const totalSec = Math.floor(audioElement.duration % 60);
    
    fakePlayer._status.textContent = 
      `${currentMin}:${currentSec.toString().padStart(2, '0')} / ${totalMin}:${totalSec.toString().padStart(2, '0')}`;
  }
  
  // 如果還在播放，繼續更新
  if (fakePlayer._isPlaying && !audioElement.paused) {
    requestAnimationFrame(() => updateFakePlayerProgress(fakePlayer));
  }
}

// 播放下一個音檔
function playNextAudio(currentFakePlayer) {
  const allFakePlayers = Array.from(document.querySelectorAll('.fake-audio-player'));
  const currentIndex = allFakePlayers.indexOf(currentFakePlayer);
  
  if (currentIndex < allFakePlayers.length - 1) {
    const nextPlayer = allFakePlayers[currentIndex + 1];
    console.log('自動播放下一個音檔');
    
    // 模擬點擊下一個播放器
    setTimeout(() => {
      nextPlayer.click();
    }, 200);
  } else {
    console.log('所有音檔播放完畢');
  }
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

          // 檢測是否為 iOS 設備
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          
          if (isIOS) {
            // iOS：創建假播放器
            const fakePlayer = createFakeAudioPlayer(item.label, audio);
            audioContainer.appendChild(fakePlayer);
            audioContainer.appendChild(audio);
            
            // 隱藏真實的 audio 元素
            audio.style.display = 'none';
            audio.classList.add('ios-hidden');
          } else {
            // 非 iOS：顯示標題和正常播放器
            const p = document.createElement('p');
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
    
    // 先關閉所有其他區塊
    for (var i = 1; i <= 9; i++) {
      const element = document.getElementById("a" + i);
      if (element && id !== "a" + i) {
        element.style.display = 'none';
        
        // 暫停該區塊中所有正在播放的假播放器
        const fakePlayers = element.querySelectorAll('.fake-audio-player');
        fakePlayers.forEach(player => {
          if (player._isPlaying) {
            pauseFakePlayer(player);
          }
        });
      }
    }
    
    // 如果是要打開區塊
    if (currentDisplay === 'none') {
      sbtitle.style.display = 'block';
      console.log(`區塊 ${id} 已打開`);
    } else {
      // 關閉區塊
      sbtitle.style.display = 'none';
      
      // 暫停該區塊中所有正在播放的假播放器
      const fakePlayers = sbtitle.querySelectorAll('.fake-audio-player');
      fakePlayers.forEach(player => {
        if (player._isPlaying) {
          pauseFakePlayer(player);
        }
      });
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

// ⏬ 頁面載入後執行
window.addEventListener('DOMContentLoaded', () => {
  const lesson = getLessonIdFromFilename();
  loadContentFromCSV('buttons.csv', lesson);
});

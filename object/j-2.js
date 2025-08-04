function showPage(page) {
  if (page >= 5) {
    page = 1;
  }

  // 清除所有導航的 current 類別
  for (let i = 1; i <= 4; i++) {
    const nav = document.getElementById(`nav${i}`);
    if (nav) nav.classList.remove('current');
  }

  // 隱藏所有區塊
  for (let i = 1; i <= 9; i++) {
    const block = document.getElementById(`block${i}`);
    if (block) block.style.display = 'none';
  }
  
  // 隱藏所有 a 區塊，但不包括 a1（因為 a1 在 page 1 需要顯示）
  for (let i = 2; i <= 9; i++) {
    const aBlock = document.getElementById(`a${i}`);
    if (aBlock) aBlock.style.display = 'none';
  }

  if (page === 1) {
    const nav1 = document.getElementById('nav1');
    const block1 = document.getElementById('block1');
    const a1 = document.getElementById('a1');
    
    if (nav1) nav1.classList.add('current');
    if (block1) block1.style.display = 'block';
    if (a1) {
      a1.style.display = 'block';
      console.log('a1 設為顯示:', a1.style.display);
    }

  } else if (page === 2) {
    const nav2 = document.getElementById('nav2');
    const block2 = document.getElementById('block2');
    const block3 = document.getElementById('block3');
    const block4 = document.getElementById('block4');
    const block5 = document.getElementById('block5');
    
    if (nav2) nav2.classList.add('current');
    if (block2) block2.style.display = 'block';
    if (block3) block3.style.display = 'block';
    if (block4) block4.style.display = 'block';
    if (block5) block5.style.display = 'block';
    
    // 設定預設打開的 aX 區塊（例如讓 a4 和 a5 預設打開）
    const a4 = document.getElementById('a4');
    const a5 = document.getElementById('a5');
    if (a4) a4.style.display = 'block';
    if (a5) a5.style.display = 'block';
    
    // a2, a3 保持預設收起，需要手動點擊 section 才會打開

  } else if (page === 3) {
    const nav3 = document.getElementById('nav3');
    const block6 = document.getElementById('block6');
    const block7 = document.getElementById('block7');
    
    if (nav3) nav3.classList.add('current');
    if (block6) block6.style.display = 'block';
    if (block7) block7.style.display = 'block';

  } else if (page === 4) {
    const nav4 = document.getElementById('nav4');
    const block8 = document.getElementById('block8');
    const a8 = document.getElementById('a8');
    
    if (nav4) nav4.classList.add('current');
    if (block8) block8.style.display = 'block';
    if (a8) {
      a8.style.display = 'block';
      console.log('a8 設為顯示:', a8.style.display);
    }
    
    // 注意：移除了 block9，因為 HTML 中沒有這個元素
  }
}

const urlParams = new URLSearchParams(window.location.search);
const page = parseInt(urlParams.get('page')) || 1;
showPage(page);

// 音檔播放控制：預載 + 智慧播放控制
let audioTracking = {
  elements: [],
  currentPlaying: null,
  initialized: false
};

function initAudioControl() {
  console.log('=== 初始化音檔控制 ===');
  
  // 重新掃描所有音檔元素
  const audioElements = document.querySelectorAll('audio');
  audioTracking.elements = Array.from(audioElements);
  
  console.log(`找到 ${audioTracking.elements.length} 個音檔元素`);
  
  if (audioTracking.elements.length === 0) {
    setTimeout(initAudioControl, 1500);
    return;
  }
  
  // 清除之前的事件監聽器（避免重複綁定）
  audioTracking.elements.forEach((audio, index) => {
    // 創建新的音檔元素來替換（清除舊事件）
    audio.replaceWith(audio.cloneNode(true));
    audioTracking.elements[index] = document.querySelectorAll('audio')[index];
  });
  
  // 為每個音檔設定事件監聽器
  audioTracking.elements.forEach((audio, index) => {
    // 預載音檔
    audio.preload = 'auto';
    
    console.log(`設定音檔 ${index + 1}:`, audio.querySelector('source')?.src);
    
    // 播放事件
    audio.addEventListener('play', function() {
      console.log(`🎵 開始播放音檔 ${index + 1}`);
      audioTracking.currentPlaying = index;
      
      // 暫停所有其他音檔
      audioTracking.elements.forEach((otherAudio, otherIndex) => {
        if (otherIndex !== index && !otherAudio.paused) {
          console.log(`⏸️ 暫停音檔 ${otherIndex + 1}`);
          otherAudio.pause();
        }
      });
    });

    // 結束事件
    audio.addEventListener('ended', function() {
      console.log(`✅ 音檔 ${index + 1} 播放完畢`);
      
      // 播放下一個音檔
      if (index < audioTracking.elements.length - 1) {
        const nextIndex = index + 1;
        const nextAudio = audioTracking.elements[nextIndex];
        console.log(`🔄 自動播放下一個音檔 ${nextIndex + 1}`);
        
        // 使用 setTimeout 確保事件處理完成
        setTimeout(() => {
          nextAudio.play().catch(error => {
            console.error('自動播放失敗:', error);
          });
        }, 100);
      } else {
        console.log('🏁 所有音檔播放完畢');
        audioTracking.currentPlaying = null;
      }
    });

    // 暫停事件
    audio.addEventListener('pause', function() {
      if (!audio.ended && audioTracking.currentPlaying === index) {
        console.log(`⏸️ 音檔 ${index + 1} 被暫停`);
      }
    });
    
    // 錯誤處理
    audio.addEventListener('error', function(e) {
      console.error(`❌ 音檔 ${index + 1} 錯誤:`, e);
    });
    
    // 載入完成
    audio.addEventListener('loadeddata', function() {
      console.log(`✅ 音檔 ${index + 1} 載入完成`);
    });
  });
  
  audioTracking.initialized = true;
  console.log('=== 音檔控制初始化完成 ===');
}

// 強制重新初始化函數
function forceReinitAudio() {
  console.log('強制重新初始化音檔控制');
  audioTracking.initialized = false;
  initAudioControl();
}

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', initAudioControl);

// 全域函數供外部呼叫
window.reinitAudioControl = forceReinitAudio;

window.audioTracking = audioTracking; // 供除錯使用


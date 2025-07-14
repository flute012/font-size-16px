
//   音檔播放
const audioElements = document.querySelectorAll('audio');
audioElements.forEach((audio, index) => {
  audio.addEventListener('play', () => {
    // Pause all other audio elements
    audioElements.forEach(otherAudio => {
      if (otherAudio !== audio) {
        otherAudio.pause();
      }
    });
  });

  audio.addEventListener('ended', () => {
    // Play the next audio element if it exists
    if (index < audioElements.length - 1) {
      audioElements[index + 1].play();
    }
  });
});

$(document).ready(function () {
  // 捲軸偵測距離頂部超過 50 才顯示按鈕

  $(window).scroll(function () {
    if ($(window).scrollTop() > 75) {
      if ($(".back-top").hasClass("hide")) {
        $(".back-top").toggleClass("hide");
      }
    } else {
      $(".back-top").addClass("hide");
    }
  });

  // 點擊按鈕回頂部
  $(".back-top").on("click", function (event) {
    $("html, body").animate(
      {
        scrollTop: 0
      },
      400 // 回頂部時間為 400 毫秒
    );
  });
});

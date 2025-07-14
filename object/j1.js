
    function showhidediv(id) {
      try {
        var sbtitle = document.getElementById(id);
        for (i = 1; i <= 3; i++) {
          if (id == "a" + i) {
            if (sbtitle.style.display == 'block') {
              sbtitle.style.display = 'none';
            }
            else {
              sbtitle.style.display = 'block';
            }
          }
          else {
            document.getElementById("a" + i).style.display = 'none';
          }
        }
      } catch (e) { }
    }


document.addEventListener("DOMContentLoaded", function () {

    const backElements = document.querySelectorAll('.back');
  backElements.forEach(element => {
      element.addEventListener('click', goBack);
  });

    function goBack() {
          window.history.back();
    }
});
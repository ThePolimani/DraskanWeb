const animatedItems = document.querySelectorAll('.animated');
const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
        if (entry.isIntersecting) {
            const element = entry.target;
            const animationClass = element.getAttribute('data-animation');
            element.classList.add(animationClass);
            element.classList.remove('hidden');
        }
    });
}, { threshold: 0.1 });

  animatedItems.forEach(function (item) {
      item.classList.add('hidden');
      observer.observe(item);
  });
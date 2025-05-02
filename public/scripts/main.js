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

  document.addEventListener('DOMContentLoaded', function() {
    // Sélectionner tous les éléments avec la classe "animatedList"
    const animatedLists = document.querySelectorAll('.animatedList');
    
    // Parcourir chaque liste
    animatedLists.forEach(list => {
        // Sélectionner tous les enfants directs (si vous voulez seulement les enfants directs)
        // const children = list.children;
        
        // Ou sélectionner tous les descendants (selon votre besoin)
        const children = list.querySelectorAll('*');
        
        // Parcourir chaque enfant avec son index
        Array.from(children).forEach((child, index) => {
            // Appliquer le délai d'animation
            child.style.animationDelay = `${index * 0.1}s`;
        });
    });
});
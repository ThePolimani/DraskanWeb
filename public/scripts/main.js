const animatedItems = document.querySelectorAll('.animated');
const animatedListItems = document.querySelectorAll('.animatedList > *'); // Sélectionne tous les enfants directs

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
        if (entry.isIntersecting) {
            const element = entry.target;
            const animationClass = element.getAttribute('data-animation');
            
            if (animationClass) {
                element.classList.add(animationClass);
            }
            
            element.classList.remove('hidden');
        }
    });
}, { threshold: 0.1 });

// Gestion des éléments .animated
animatedItems.forEach(function (item) {
    item.classList.add('hidden');
    observer.observe(item);
});

// Gestion des éléments .animatedList et leurs enfants
document.addEventListener('DOMContentLoaded', function() {
    const animatedLists = document.querySelectorAll('.animatedList');
    
    animatedLists.forEach(list => {
        // Masquer la liste parente
        list.classList.add('hidden');
        
        // Sélectionner tous les enfants (directs ou non selon votre besoin)
        const children = list.querySelectorAll('*');
        
        Array.from(children).forEach((child, index) => {
            // Masquer chaque enfant
            child.classList.add('hidden');
            
            // Appliquer le délai d'animation
            child.style.animationDelay = `${index * 0.1}s`;
            
            // Observer chaque enfant
            observer.observe(child);
        });
        
        // Observer aussi la liste parente si nécessaire
        observer.observe(list);
    });
});

let defaultTranslations = {}; // Stock anglais
let currentTranslations = {}; // Stock langue actuelle

async function fetchTranslations(lang) {
  const res = await fetch(`public/locales/${lang}.json`);
  const translations = await res.json();
  return translations;
}

async function loadLanguage(lang) {

  if (!defaultTranslations.fr) {
    defaultTranslations = await fetchTranslations('fr');
  }

  if (lang === 'fr') {
    currentTranslations = defaultTranslations;
  } else {
    currentTranslations = await fetchTranslations(lang);
  }

  // Mettre à jour l'attribut lang de la balise html
  document.documentElement.lang = lang;
  
  updateTexts();
}

function updateTexts() {
  for (const key in defaultTranslations) {
    const element = document.getElementById(key);
    if (element) {
      element.textContent = currentTranslations[key] || defaultTranslations[key] || `[${key}]`;
    }
  }
}

function switchLanguage(lang) {
  loadLanguage(lang);
}

document.addEventListener("DOMContentLoaded", function() {
    const userLang = navigator.language.startsWith('en') ? 'en' : 'fr';
    loadLanguage(userLang);
});
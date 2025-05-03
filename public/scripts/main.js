
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

// Fonction pour initialiser les animations
function initAnimations() {
    // Elements .animated simples
    document.querySelectorAll('.animated').forEach(item => {
        item.classList.add('hidden');
        observer.observe(item);
    });

    // Elements dans .animatedList
    document.querySelectorAll('.animatedList > *').forEach((child, index) => {
        child.classList.add('hidden');
        child.classList.add('animated'); // On leur ajoute la classe animated
        child.style.animationDelay = `${index * 0.1}s`;
        observer.observe(child);
    });
}

// Lancer l'initialisation
document.addEventListener('DOMContentLoaded', initAnimations);

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
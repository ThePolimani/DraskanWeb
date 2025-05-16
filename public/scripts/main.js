
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const element = entry.target;

            // Trouver l'animation à appliquer (priorité à l'élément)
            const animation = element.dataset.animation || 
                             element.closest('.animatedList')?.dataset.animation;
            
            if (animation) {
                element.classList.add(animation);
                element.classList.remove('hidden');
            }
        }
    });
}, { threshold: 0.1 });

function initAnimations() {

    // 1. Traiter d'abord tous les éléments avec data-animation explicite
    document.querySelectorAll('[data-animation]').forEach(el => {
        if (!el.closest('.animatedList')) { // Exclure ceux dans les listes
            el.classList.add('hidden', 'animated');
            observer.observe(el);
        }
    });

    // 2. Traiter les animatedList
    document.querySelectorAll('.animatedList').forEach(list => {
        const listAnimation = list.dataset.animation;
        const onlyLeaves = list.hasAttribute('data-leaf-only');
        const delayStep = parseFloat(list.dataset.delayStep) || 0.1;
        const startDelay = parseFloat(list.dataset.startDelay) || 0;
        let index = 0;

        // Fonction pour déterminer si un élément doit être animé
        function shouldAnimate(element) {
            if (element.classList.contains('no-animation')) return false;
            if (onlyLeaves && element.children.length > 0) return false;
            return true;
        }

        // Collecter tous les éléments à animer
        const elementsToAnimate = [];
        
        // a) Les enfants directs
        Array.from(list.children).forEach(child => {
            if (shouldAnimate(child)) {
                elementsToAnimate.push(child);
            } else if (onlyLeaves) {
                // b) Pour leaf-only, explorer les enfants des non-feuilles
                child.querySelectorAll('*').forEach(descendant => {
                    if (descendant.children.length === 0 && shouldAnimate(descendant)) {
                        elementsToAnimate.push(descendant);
                    }
                });
            }
        });

        // Configurer et observer les éléments
        elementsToAnimate.forEach((el, i=) > {
            el.classList.add('hidden', 'animated');
            el.style.animationDelay = `${startDelay + (i * delayStep)}s`;
            observer.observe(el);
        });
    });
}

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
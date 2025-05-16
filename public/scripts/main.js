const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const element = entry.target;

            // On ignore les éléments avec no-animation
            if (element.classList.contains('no-animation')) return;

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
    let globalIndex = 0;
    
    document.querySelectorAll('.animatedList').forEach(list => {
        const listAnimation = list.dataset.animation;
        const onlyLeaves = list.hasAttribute('data-leaf-only');
        const shouldResetDelay = list.hasAttribute('data-reset-delay');
        const delayStep = parseFloat(list.dataset.delayStep) || 0.1;
        const startDelay = parseFloat(list.dataset.startDelay) || 0;
        let localIndex = 0;

        // Fonction pour déterminer si un élément doit être animé (version simplifiée)
        function shouldAnimate(element) {
            if (element.classList.contains('no-animation')) return false;
            if (onlyLeaves && element.children.length > 0) return false;
            return true;
        }

        // Collecter tous les éléments à animer (version optimisée du nouveau code)
        const elementsToAnimate = [];
        
        if (onlyLeaves) {
            // Mode leaf-only: on prend uniquement les éléments sans enfants
            list.querySelectorAll('*').forEach(el => {
                if (el.children.length === 0 && shouldAnimate(el)) {
                    elementsToAnimate.push(el);
                }
            });
        } else {
            // Mode normal: on prend les enfants directs
            Array.from(list.children).forEach(child => {
                if (shouldAnimate(child)) {
                    elementsToAnimate.push(child);
                }
            });
        }

        // Configurer et observer les éléments
        elementsToAnimate.forEach(el => {
            el.classList.add('hidden', 'animated');
            
            // Calcul du délai avec gestion de shouldResetDelay
            const currentIndex = shouldResetDelay ? localIndex : globalIndex;
            el.style.animationDelay = `${startDelay + (currentIndex * delayStep)}s`;
            
            observer.observe(el);
            
            localIndex++;
            if (!shouldResetDelay) globalIndex++;
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
const observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
      if (entry.isIntersecting) {
          const element = entry.target;
          
          // On ignore les éléments avec no-animation
          if (element.classList.contains('no-animation')) return;
          
          // Priorité à l'animation de l'élément lui-même
          let animationClass = element.getAttribute('data-animation');
          
          // Si pas d'animation définie, on regarde chez le parent .animatedList
          if (!animationClass && element.closest('.animatedList')) {
              const parentList = element.closest('.animatedList');
              animationClass = parentList.getAttribute('data-animation');
          }
          
          if (animationClass) {
              element.classList.add(animationClass);
          }
          
          element.classList.remove('hidden');
      }
  });
}, { threshold: 0.1 });

function initAnimations() {
  // Elements .animated simples (qui ne sont pas dans une animatedList)
  document.querySelectorAll('.animated:not(.animatedList *)').forEach(item => {
      if (item.classList.contains('no-animation')) return;
      item.classList.add('hidden');
      observer.observe(item);
  });

  let globalIndex = 0;
  
  document.querySelectorAll('.animatedList').forEach(list => {
      const shouldResetDelay = list.hasAttribute('data-reset-delay');
      const includeNested = list.hasAttribute('data-include-nested');
      const onlyLeafNodes = list.hasAttribute('data-leaf-only');
      const baseDelay = parseFloat(list.getAttribute('data-delay-step')) || 0.1;
      const startDelay = parseFloat(list.getAttribute('data-start-delay')) || 0;
      
      // Sélection des enfants selon les options
      let children;
      if (onlyLeafNodes) {
          // Pour data-leaf-only, on prend tous les éléments sans enfants OU avec seulement du texte
          children = Array.from(list.querySelectorAll('*')).filter(el => 
              (el.childElementCount === 0 || 
               (el.childElementCount === 1 && el.firstElementChild.nodeType === Node.TEXT_NODE)) &&
              (includeNested || el.parentElement === list)
          );
      } else {
          children = includeNested ? 
              Array.from(list.querySelectorAll('*')).filter(el => 
                  el.closest('.animatedList') === list || el.parentElement === list) : 
              Array.from(list.children);
      }
      
      let localIndex = 0;
      
      children.forEach(child => {
          // On ignore si no-animation ou si dans une sous-liste (sauf si includeNested)
          if (child.classList.contains('no-animation') || 
              (!includeNested && child.closest('.animatedList') !== list)) return;
          
          child.classList.add('hidden');
          child.classList.add('animated');
          
          // Calcul du délai
          const currentIndex = shouldResetDelay ? localIndex : globalIndex;
          child.style.animationDelay = `${startDelay + (currentIndex * baseDelay)}s`;
          
          observer.observe(child);
          
          localIndex++;
          globalIndex++;
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
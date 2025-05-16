const observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
      if (entry.isIntersecting) {
          const element = entry.target;
          
          if (element.classList.contains('no-animation')) return;
          
          // L'élément a sa propre animation -> on l'utilise
          if (element.hasAttribute('data-animation')) {
              element.classList.add(element.getAttribute('data-animation'));
          }
          // Sinon, on cherche dans les parents .animatedList
          else {
              const parentList = element.closest('.animatedList');
              if (parentList && parentList.hasAttribute('data-animation')) {
                  element.classList.add(parentList.getAttribute('data-animation'));
              }
          }
          
          element.classList.remove('hidden');
      }
  });
}, { threshold: 0.1 });

function isLeafNode(element) {
  // Un noeud feuille est soit:
  // 1. Un élément sans enfants
  // 2. Un élément avec uniquement des noeuds texte
  if (element.childElementCount === 0) return true;
  
  const children = element.childNodes;
  for (let i = 0; i < children.length; i++) {
      if (children[i].nodeType === Node.ELEMENT_NODE) {
          return false;
      }
  }
  return true;
}

function initAnimations() {
  // Elements .animated simples (hors des animatedList)
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
      
      let children = [];
      
      if (onlyLeafNodes) {
          // Pour data-leaf-only, on prend les feuilles
          const allElements = list.querySelectorAll('*');
          allElements.forEach(el => {
              if ((includeNested || el.parentElement === list) && isLeafNode(el)) {
                  children.push(el);
              }
          });
          
          // On ajoute aussi les enfants directs qui sont des noeuds texte
          Array.from(list.childNodes).forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE && isLeafNode(node)) {
                  children.push(node);
              }
          });
      } else {
          children = includeNested ? 
              Array.from(list.querySelectorAll('*')).filter(el => 
                  el.closest('.animatedList') === list) : 
              Array.from(list.children);
      }
      
      // Suppression des doublons
      children = [...new Set(children)];
      
      let localIndex = 0;
      
      children.forEach(child => {
          if (child.classList && 
              !child.classList.contains('no-animation') && 
              (!child.closest('.animatedList') || includeNested || child.closest('.animatedList') === list)) {
              
              child.classList.add('hidden');
              child.classList.add('animated');
              
              const currentIndex = shouldResetDelay ? localIndex : globalIndex;
              child.style.animationDelay = `${startDelay + (currentIndex * baseDelay)}s`;
              
              observer.observe(child);
              
              localIndex++;
              globalIndex++;
          }
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
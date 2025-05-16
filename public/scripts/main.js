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
            // On arrête d'observer l'élément une fois qu'il est visible
            observer.unobserve(element);
        }
    });
}, { threshold: 0.1 });

function initAnimations() {
    // 1. Traiter d'abord tous les éléments avec data-animation explicite (hors animatedList)
    document.querySelectorAll('[data-animation]:not(.animatedList [data-animation])').forEach(el => {
        if (el.closest('.animatedList')) return; // S'assurer qu'il n'est pas DANS une liste mais sans data-animation propre à la liste

        el.classList.add('hidden', 'animated');
        if (el.classList.contains('no-delay')) {
            el.style.animationDelay = '0s';
        } else if (el.dataset.startDelay) {
            const delay = parseFloat(el.dataset.startDelay);
            if (!isNaN(delay)) {
                el.style.animationDelay = `${delay}s`;
            }
        }
        observer.observe(el);
    });

    // 2. Traiter les animatedList
    let globalDelayOffset = 0; // Offset de délai global qui s'accumule

    document.querySelectorAll('.animatedList').forEach(list => {
        const listAnimation = list.dataset.animation; // Peut être utilisé si les enfants n'ont pas leur propre data-animation
        const onlyLeaves = list.hasAttribute('data-leaf-only');
        const shouldResetGlobalDelay = list.hasAttribute('data-reset-delay');

        let currentListBaseDelay = parseFloat(list.dataset.startDelay) || 0;
        const delayStep = parseFloat(list.dataset.delayStep) || 0.1;

        if (shouldResetGlobalDelay) {
            globalDelayOffset = 0;
        }

        let listCumulativeDelayAdjustment = 0; // Ajustement de délai spécifique à cette liste
        let localIndex = 0;

        function shouldAnimate(element) {
            if (element.classList.contains('no-animation')) return false;
            if (onlyLeaves) {
                // Un "leaf" est un élément qui n'a pas d'enfants ou dont tous les enfants sont 'no-animation'
                let hasAnimatableChildren = false;
                for (const child of element.children) {
                    if (!child.classList.contains('no-animation')) { // On ne considère pas les enfants 'no-animation' comme bloquant le parent.
                        // Si l'enfant a lui-même une data-animation, il sera traité, donc le parent n'est pas une feuille.
                        // Ou si l'enfant est un candidat potentiel (pas no-animation).
                        hasAnimatableChildren = true;
                        break;
                    }
                }
                if (hasAnimatableChildren) return false;
            }
            return true;
        }

        const elementsToAnimate = [];
        if (onlyLeaves) {
            const collectLeaves = (element) => {
                let isLeaf = true;
                // Vérifier si certains enfants sont eux-mêmes des candidats à l'animation
                // Si un enfant est un candidat, alors l'élément actuel n'est pas une feuille.
                for (const child of element.children) {
                    if (!child.classList.contains('no-animation') && child.matches('[data-animation], .animatedList *')) { // Critère plus précis
                         // Si l'enfant est lui-même une 'animatedList', on ne le considère pas comme bloquant son parent leaf,
                         // car la liste enfant gérera ses propres animations.
                        if(!child.classList.contains('animatedList')) {
                            isLeaf = false;
                            collectLeaves(child); // Continuer à chercher des feuilles plus profondes
                        }
                    }
                }
                if (isLeaf && shouldAnimate(element) && !elementsToAnimate.includes(element)) {
                     // S'assurer que l'élément lui-même n'est pas une animatedList (sauf si la liste est vide)
                    if (!(element.classList.contains('animatedList') && element.children.length > 0) ) {
                       if (element.matches(list.tagName === 'UL' || list.tagName === 'OL' ? 'li' : '*')) { // Si la liste est UL/OL, on ne prend que les LI
                            elementsToAnimate.push(element);
                        } else if (list.tagName !== 'UL' && list.tagName !== 'OL') {
                            elementsToAnimate.push(element);
                        }
                    }
                }
            };
            // Pour le mode leaf-only, on itère sur les enfants directs et on descend récursivement
            Array.from(list.children).forEach(child => collectLeaves(child));

        } else { // Mode normal: enfants directs
            Array.from(list.children).forEach(child => {
                if (shouldAnimate(child)) {
                    elementsToAnimate.push(child);
                }
            });
        }


        elementsToAnimate.forEach(el => {
            el.classList.add('hidden', 'animated');

            let elementSpecificDelay = 0;
            const elSpecificDelayAttr = el.dataset.startDelay;

            if (elSpecificDelayAttr !== undefined) {
                const parsedDelay = parseFloat(elSpecificDelayAttr);
                if (!isNaN(parsedDelay)) {
                    elementSpecificDelay = parsedDelay;
                }
            }

            let finalDelay = 0;
            if (el.classList.contains('no-delay')) {
                finalDelay = 0;
                // 'no-delay' n'affecte pas le calcul du délai global pour les éléments suivants.
                // Le globalDelayOffset et listCumulativeDelayAdjustment ne sont pas modifiés par 'no-delay'.
            } else {
                // Le délai de base pour cette liste + le global offset accumulé + le pas * l'index local + l'ajustement cumulé dans la liste
                finalDelay = currentListBaseDelay + globalDelayOffset + (localIndex * delayStep) + listCumulativeDelayAdjustment + elementSpecificDelay;

                
                if (elementSpecificDelay > 0) { // On ajoute seulement si c'est un délai positif
                    listCumulativeDelayAdjustment += elementSpecificDelay;
                    if (!shouldResetGlobalDelay) { 
                    }
                }
            }

            el.style.animationDelay = `${Math.max(0, finalDelay)}s`; // Empêche les délais négatifs

            if (!el.classList.contains('no-delay')) { // Seulement incrémenter l'index si ce n'est pas un no-delay
                localIndex++;
            }
            observer.observe(el);
        });

        // Mettre à jour le globalDelayOffset pour la prochaine liste
        if (!shouldResetGlobalDelay) {
            if (localIndex > 0) { // S'il y a eu des éléments avec délai
                 globalDelayOffset += (currentListBaseDelay + (localIndex * delayStep) + listCumulativeDelayAdjustment) - (currentListBaseDelay + globalDelayOffset);
                 // Simplification : globalDelayOffset += (localIndex * delayStep) + listCumulativeDelayAdjustment;
            }
             globalDelayOffset += currentListBaseDelay + (localIndex > 0 ? (localIndex -1) * delayStep : 0) + listCumulativeDelayAdjustment;

        }
        // Mise à jour finale du globalDelayOffset après avoir traité la liste:
        // Il contient déjà le délai *avant* cette liste (sauf si reset).
        // On ajoute le délai introduit par les éléments de cette liste.
        globalDelayOffset += currentListBaseDelay; // Le startDelay de la liste s'ajoute au global
        if (elementsToAnimate.filter(el => !el.classList.contains('no-delay')).length > 0) {
            // Nombre d'éléments qui ont effectivement un délai progressif
            const progressingElementsCount = elementsToAnimate.filter(el => !el.classList.contains('no-delay')).length;
            globalDelayOffset += (progressingElementsCount * delayStep);
        }
        globalDelayOffset += listCumulativeDelayAdjustment;

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
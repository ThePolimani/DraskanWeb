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

    const panierButton = document.getElementById('panier');
    const panierPopup = document.getElementById('panierPopup');
    const closepanier = document.getElementById('closepanier');
    const panierItems = document.getElementById('panierItems');
    const panierTotalEl = document.getElementById('panierTotal'); // Renommé pour clarté
    const checkoutBtn = document.getElementById('checkoutBtn');
    const addTopanierButtons = document.querySelectorAll('.add-to-panier');
    const carouselContainer = document.getElementById('carousel');
    
    // Charger le panier depuis localStorage
    let panier = JSON.parse(localStorage.getItem('panier')) || [];
    let lastAddedItemId = null; // Pour l'animation du nouvel item
    let priceAnimationFrameId = null; // Pour l'animation du prix

    // Ouvrir/fermer le panier
    panierButton.addEventListener('click', function(e) {
        e.stopPropagation();
        panierPopup.classList.toggle('open');
        if (panierPopup.classList.contains('open')) {
            lastAddedItemId = null;
            updatepanierDisplay();
        }
    });
    
    closepanier.addEventListener('click', function(e) {
        e.stopPropagation(); // Empêche l'événement de remonter
        panierPopup.classList.remove('open');
    });

    // Fermer le panier quand on clique en dehors
    document.addEventListener('click', function(e) {
        // Ne pas fermer si on clique sur un bouton "Ajouter au panier"
        const isAddToCartButton = e.target.classList.contains('add-to-panier') || 
                                 e.target.closest('.add-to-panier');
        
        if (panierPopup.classList.contains('open') && 
            !panierPopup.contains(e.target) && 
            e.target !== panierButton &&
            !isAddToCartButton) {
            panierPopup.classList.remove('open');
        }
    });

    panierPopup.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Ajouter un produit au panier
    function addTopanier(id, name, price) {
        const existingItem = panier.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
            lastAddedItemId = null;
        } else {
            panier.push({ id, name, price, quantity: 1 });
            lastAddedItemId = id;
        }
        
        savepanier();
        updatepanierDisplay();
        
        // Ouvrir le panier sans déclencher la fermeture
        requestAnimationFrame(() => {
            panierPopup.classList.add('open');
        });
    }

    if (carouselContainer) {
        carouselContainer.addEventListener('click', function(event) {
        // Vérifie si l'élément cliqué (event.target) a la classe "add-to-panier"
        if (event.target.classList.contains('add-to-panier')) {
            const button = event.target;
            const id = button.getAttribute('data-id');
            const name = button.getAttribute('data-name');
            const price = parseFloat(button.getAttribute('data-price'));
            
            button.classList.add('added');
            setTimeout(() => {
                button.classList.remove('added');
            }, 500);
            
            addTopanier(id, name, price);
          
        }
      });
    }
    
    // Passer la commande
    checkoutBtn.addEventListener('click', function() {
        if (panier.length > 0) {
            window.location.href = '/paiement';
            savepanier();
            updatepanierDisplay();
        }
    });
    
    // Fonction pour ajouter un article au panier
    function addTopanier(id, name, price) {
        const existingItem = panier.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
            lastAddedItemId = null; // Ce n'est pas un nouvel item dans la liste
        } else {
            panier.push({ id, name, price, quantity: 1 });
            lastAddedItemId = id; // Marquer cet item comme nouveau pour l'animation
        }
        
        savepanier();
        updatepanierDisplay();
        
        // Afficher le panier quand on ajoute un produit, s'il n'est pas déjà ouvert
        if (!panierPopup.classList.contains('open')) {
           panierPopup.classList.add('open');
        }
    }
    
    // Fonction pour sauvegarder le panier dans localStorage
    function savepanier() {
        localStorage.setItem('panier', JSON.stringify(panier));
        updatePanierCount();
    }
    
    // Fonction pour mettre à jour l'affichage du panier
    function updatepanierDisplay() {
        if (panier.length === 0) {
            panierItems.innerHTML = '<p>Votre panier est vide</p>';
            updateTotalPriceAnimated(0);
            lastAddedItemId = null; 
            updatePanierCount(); // Assurer que le compteur est à jour
            return;
        }

        updateCheckoutButton();
        
        panierItems.innerHTML = ''; // Vider les items actuels
        panier.forEach(item => { // Pas besoin de l'index ici pour l'animation
            const itemElement = document.createElement('div');
            itemElement.className = 'panier-item';
            if (item.id === lastAddedItemId) {
                itemElement.classList.add('new-item-animation');
                itemElement.addEventListener('animationend', () => {
                    itemElement.classList.remove('new-item-animation');
                }, { once: true });
            }
            itemElement.innerHTML = `
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>${item.price.toFixed(2)}€</p>
                </div>
                <div class="item-actions">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span class="item-quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    <button class="remove-item" data-id="${item.id}">Supprimer</button>
                </div>
            `;
            panierItems.appendChild(itemElement);
        });
        
        // Réinitialiser après le rendu, pour que la prochaine mise à jour ne ré-anime pas
        if (lastAddedItemId) {
            lastAddedItemId = null;
        }
        // Ajouter les événements pour les nouveaux boutons
        attachItemEventListeners();
        
        updateTotalPriceAnimated(getpanierTotal());
        updatePanierCount();
    }
    function attachItemEventListeners() {
        document.querySelectorAll('.quantity-btn.minus').forEach(button => {
            button.addEventListener('click', function() {
                const id = button.getAttribute('data-id');
                decreaseQuantity(id);
            });
        });
        
        document.querySelectorAll('.quantity-btn.plus').forEach(button => {
            button.addEventListener('click', function() {
                const id = button.getAttribute('data-id');
                increaseQuantity(id);
            });
        });
        
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const id = button.getAttribute('data-id');
                removeFrompanier(id);
                updateCheckoutButton();
            });
        });
    }
    
    // Fonction pour animer la mise à jour du prix total
    function updateTotalPriceAnimated(newTotalValue) {
        const currentTotalText = panierTotalEl.textContent.replace('€', '').trim();
        let currentTotal = parseFloat(currentTotalText) || 0;
        const targetTotal = parseFloat(newTotalValue);
        if (Math.abs(currentTotal - targetTotal) < 0.01) { // Si la différence est négligeable
            panierTotalEl.textContent = targetTotal.toFixed(2);
            return;
        }
        if (priceAnimationFrameId) {
            cancelAnimationFrame(priceAnimationFrameId);
        }
        const duration = 300; // ms
        const startTime = performance.now();
        function animate(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            const animatedValue = currentTotal + (targetTotal - currentTotal) * progress;
            panierTotalEl.textContent = animatedValue.toFixed(2);
            if (progress < 1) {
                priceAnimationFrameId = requestAnimationFrame(animate);
            } else {
                panierTotalEl.textContent = targetTotal.toFixed(2); // Assurer la valeur finale exacte
                priceAnimationFrameId = null;
            }
        }
        priceAnimationFrameId = requestAnimationFrame(animate);
    }

    function updateCheckoutButton() {
        if (panier.length > 0) {
            checkoutBtn.disabled = false;
        } else {
            checkoutBtn.disabled = true;
        }
    }
    
    // Fonctions pour modifier la quantité
    function increaseQuantity(id) {
        const item = panier.find(item => item.id === id);
        if (item) {
            item.quantity += 1;
            savepanier();
            lastAddedItemId = null; // Pas un nouvel ajout, donc pas d'animation d'item
            updatepanierDisplay();
        }
    }
    
    function decreaseQuantity(id) {
        const item = panier.find(item => item.id === id);
        if (item) {
            if (item.quantity > 1) { // Ne décrémenter que si > 1
                item.quantity -= 1;
                savepanier();
                lastAddedItemId = null; // Pas un nouvel ajout
                updatepanierDisplay();
            }
            // Si la quantité est 1, ne rien faire (on ne supprime plus ici)
        }
    }
    
    function removeFrompanier(id) {
        panier = panier.filter(item => item.id !== id);
        savepanier();
        lastAddedItemId = null; // Pas un nouvel ajout
        updatepanierDisplay();
    }
    
    // Calculer le total du panier
    function getpanierTotal() {
        return panier.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    // Mettre à jour le compteur du panier
    function updatePanierCount() {
        const count = panier.reduce((total, item) => total + item.quantity, 0);

        if (panierButton) {
            const panierImg = panierButton.querySelector('img');
        
            if (panierImg) {
                let imageNumber = count > 9 ? '9plus' : count;
                panierImg.src = `public/images/panier/panier-${imageNumber}.png`;

                // Animation (facultative)
                panierImg.classList.add('panier-pulse');
                setTimeout(() => {
                    panierImg.classList.remove('panier-pulse');
                }, 300);
            }
        }
    }
    
    // Initialiser l'affichage au chargement
    updatePanierCount();
    updateCheckoutButton();
});
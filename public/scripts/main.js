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
            if (onlyLeaves) { // 'onlyLeaves' est vrai si data-leaf-only est présent
                let hasAnimatableChildren = false;
                for (const child of element.children) {
                    // Si l'enfant est un <br>, on l'ignore pour cette vérification
                    if (child.tagName === 'BR') { // ou child.tagName.toUpperCase() === 'BR' pour être sûr
                        continue;
                    }
                    // Si l'enfant n'est PAS un <br> ET qu'il n'a PAS 'no-animation',
                    // alors le parent a un enfant "actif" et ne doit pas être animé comme feuille.
                    if (!child.classList.contains('no-animation')) {
                        hasAnimatableChildren = true;
                        break; 
                    }
                }
                // Si hasAnimatableChildren est vrai, cela signifie que 'element' a des enfants (autres que <br> ou no-animation)
                // qui devraient être animés ou qui le rendent non-feuille.
                // Donc, 'element' lui-même ne doit pas être animé.
                if (hasAnimatableChildren) {
                    return false;
                }
            }
            return true;
        }

        const elementsToAnimate = [];
        if (onlyLeaves) {
            const collectLeaves = (element) => {
                if (element.tagName === 'BR') {
                    return;
                }
                let isLeaf = true;
                // Vérifier si certains enfants sont eux-mêmes des candidats à l'animation
                // Si un enfant est un candidat, alors l'élément actuel n'est pas une feuille.
                for (const child of element.children) {
                    if (child.tagName === 'BR') {
                        continue;
                    }
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

let defaultTranslations = {}; // Stock français par défaut
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
  // Mettre à jour l'attribut lang de la balise html
  document.documentElement.setAttribute('lang', lang);
}

document.addEventListener("DOMContentLoaded", function() {
    const userLang = navigator.language.startsWith('en') ? 'en' : 'fr';
    loadLanguage(userLang); // Assurez-vous que cette fonction est définie ailleurs si besoin
    document.documentElement.setAttribute('lang', userLang);

    const panierButton = document.getElementById('panier');
    const panierPopup = document.getElementById('panierPopup');
    const closepanier = document.getElementById('closepanier');
    const panierItems = document.getElementById('panierItems');
    const panierTotalEl = document.getElementById('panierTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    // Les boutons .add-to-panier seront gérés dynamiquement après récupération des produits
    const carouselContainer = document.getElementById('carousel');

    let panier = JSON.parse(localStorage.getItem('panier')) || [];
    let lastAddedItemId = null;
    let priceAnimationFrameId = null;
    let productsWithStock = {}; // Pour stocker les infos des produits, y compris le stock

    // --- NOUVEAU : Fonction pour récupérer les produits et leurs stocks ---
    async function initializeStore() {
        try {
            const response = await fetch('app/api/get_produits.php'); // Chemin vers votre API
            if (!response.ok) {
                throw new Error(`Erreur HTTP ! statut: ${response.status}`);
            }
            const productsFromServer = await response.json();
            productsFromServer.forEach(p => {
                productsWithStock[p.id] = {
                    stock: p.stock,
                    name: p.nom,
                    // Convertir le prix en nombre, enlevant le symbole € et gérant la virgule/point
                    price: parseFloat(p.prix.replace('€', '').trim().replace(',', '.')),
                    img: p.img
                };
            });
            updateAllAddToCartButtonsVisuals(); // Mettre à jour l'état initial des boutons d'ajout
            updatepanierDisplay(); // Rafraîchir l'affichage du panier avec les infos de stock
        } catch (error) {
            console.error("Impossible de charger les produits:", error);
            panierItems.innerHTML = "<p>Erreur lors du chargement des produits. Veuillez réessayer.</p>";
        }
    }

    // Ouvrir/fermer le panier
    panierButton.addEventListener('click', function(e) {
        e.stopPropagation();
        panierPopup.classList.toggle('open');
        if (panierPopup.classList.contains('open')) {
            lastAddedItemId = null; // Réinitialiser pour l'animation
            updatepanierDisplay(); // Mettre à jour l'affichage en ouvrant
        }
    });

    const menuButton = document.getElementById('mobile-menu-button');
    const menuIcon = document.getElementById('menu-icon');
    const headerContent = document.getElementById('header-content');
    
    menuButton.addEventListener('click', function() {
        headerContent.classList.toggle('active');
        menuIcon.classList.toggle('active');
    });
    
    // Fermer le menu quand on clique sur un lien (optionnel)
    const navLinks = document.querySelectorAll('header nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            headerContent.classList.remove('active');
            menuIcon.classList.remove('active');
        });
    });

    closepanier.addEventListener('click', function(e) {
        e.stopPropagation();
        panierPopup.classList.remove('open');
    });

    document.addEventListener('click', function(e) {
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

    // --- MODIFIÉ : Ajouter un produit au panier (avec vérification de stock) ---
    function addTopanier(id) { // Plus besoin de name, price ici, on les prendra de productsWithStock
        const productInfo = productsWithStock[id];
        if (!productInfo) {
            console.error(`Information de stock pour le produit ID ${id} non trouvée.`);
            alert("Produit non trouvé ou informations manquantes.");
            return;
        }

        const stock = productInfo.stock;
        const existingItem = panier.find(item => item.id === id);
        const currentQuantityInCart = existingItem ? existingItem.quantity : 0;

        if (currentQuantityInCart < stock) {
            if (existingItem) {
                existingItem.quantity += 1;
                lastAddedItemId = null;
            } else {
                panier.push({
                    id,
                    name: productInfo.name,
                    price: productInfo.price, // Utiliser le prix numérique
                    quantity: 1,
                    img: productInfo.img // Assumant que vous voulez stocker l'image aussi
                });
                lastAddedItemId = id;
            }
            savepanier();
            updatepanierDisplay();

            if (!panierPopup.classList.contains('open')) {
                requestAnimationFrame(() => {
                    panierPopup.classList.add('open');
                });
            }
        } else {
            alert("Quantité maximale en stock atteinte pour ce produit.");
            // La mise à jour visuelle du bouton sera gérée par updateAllAddToCartButtonsVisuals et updatepanierDisplay
        }
        updateAllAddToCartButtonsVisuals(); // Mettre à jour l'état des boutons après ajout
    }

    // Gestion des clics sur les boutons "add-to-panier" (par exemple dans un carrousel)
    if (carouselContainer) {
        carouselContainer.addEventListener('click', function(event) {
            if (event.target.classList.contains('add-to-panier')) {
                const button = event.target;
                const id = button.getAttribute('data-id');

                if (!productsWithStock[id]) {
                    console.error("Info produit non chargée pour ID:", id);
                    alert("Erreur : information produit non disponible.");
                    return;
                }

                // Vérifier si le bouton est désactivé (signifiant stock épuisé ou limite atteinte)
                if (button.disabled) {
                    // Optionnel : feedback visuel (ex: secouer le bouton, tooltip)
                    return;
                }

                button.classList.add('added');
                setTimeout(() => {
                    button.classList.remove('added');
                }, 500);

                addTopanier(id); // Appeler avec l'ID seulement
            }
        });
    }

    checkoutBtn.addEventListener('click', function() {
        if (panier.length > 0) {
            window.location.href = '/paiement'; // Assurez-vous que cette route est correcte
            // Le panier est sauvegardé à chaque modification, pas besoin ici spécifiquement
        }
    });

    function savepanier() {
        localStorage.setItem('panier', JSON.stringify(panier));
        updatePanierCount();
    }

    // --- MODIFIÉ : Mettre à jour l'affichage du panier (avec gestion des stocks pour les boutons +) ---
    function updatepanierDisplay() {
        if (Object.keys(productsWithStock).length === 0 && panier.length > 0) {
             // Si les produits ne sont pas encore chargés mais qu'il y a un panier sauvegardé,
             // il vaut mieux attendre initializeStore ou afficher un message.
             // Pour l'instant, on laisse la logique continuer, mais c'est un point d'attention.
        }

        if (panier.length === 0) {
            panierItems.innerHTML = '<p>Votre panier est vide</p>';
            updateTotalPriceAnimated(0);
            lastAddedItemId = null;
            updatePanierCount();
            updateCheckoutButton();
            updateAllAddToCartButtonsVisuals(); // Mettre à jour les boutons de la page principale
            return;
        }

        updateCheckoutButton();
        panierItems.innerHTML = '';
        panier.forEach(item => {
            const productInfo = productsWithStock[item.id];
            const stock = productInfo ? productInfo.stock : 0; // Stock disponible pour cet item
            // S'assurer que le prix de l'item dans le panier est bien un nombre
            const itemPrice = typeof item.price === 'string' ? parseFloat(item.price.replace('€', '').trim().replace(',', '.')) : item.price;


            const itemElement = document.createElement('div');
            itemElement.className = 'panier-item';
            if (item.id === lastAddedItemId) {
                itemElement.classList.add('new-item-animation');
                itemElement.addEventListener('animationend', () => {
                    itemElement.classList.remove('new-item-animation');
                }, { once: true });
            }

            const plusButtonDisabled = item.quantity >= stock ? 'disabled' : '';
            // Ajout d'une classe pour styler spécifiquement le bouton désactivé à cause du stock
            const plusButtonClass = item.quantity >= stock ? 'quantity-btn plus disabled-stock' : 'quantity-btn plus';

            itemElement.innerHTML = `
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>${itemPrice.toFixed(2)}€</p>
                </div>
                <div class="item-actions">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span class="item-quantity">${item.quantity}</span>
                    <button class="${plusButtonClass}" data-id="${item.id}" ${plusButtonDisabled}>+</button>
                    <button class="remove-item" data-id="${item.id}">Supprimer</button>
                </div>
            `;
            panierItems.appendChild(itemElement);
        });

        if (lastAddedItemId) {
            lastAddedItemId = null;
        }
        attachItemEventListeners();
        updateTotalPriceAnimated(getpanierTotal());
        updatePanierCount();
        updateAllAddToCartButtonsVisuals(); // Mettre à jour les boutons de la page principale
    }

    function attachItemEventListeners() {
        document.querySelectorAll('.quantity-btn.minus').forEach(button => {
            button.onclick = function() { // Remplacer addEventListener par onclick pour éviter doublons
                const id = this.getAttribute('data-id');
                decreaseQuantity(id);
            };
        });

        document.querySelectorAll('.quantity-btn.plus').forEach(button => {
            button.onclick = function() { // Idem
                if (this.disabled) return; // Ne rien faire si le bouton est désactivé
                const id = this.getAttribute('data-id');
                increaseQuantity(id);
            };
        });

        document.querySelectorAll('.remove-item').forEach(button => {
            button.onclick = function() { // Idem
                const id = this.getAttribute('data-id');
                removeFrompanier(id);
                // updateCheckoutButton(); // Déjà appelé dans updatepanierDisplay
            };
        });
    }

    function updateTotalPriceAnimated(newTotalValue) {
        const currentTotalText = panierTotalEl.textContent.replace('€', '').trim().replace(',', '.');
        let currentTotal = parseFloat(currentTotalText) || 0;
        const targetTotal = parseFloat(newTotalValue);

        if (isNaN(currentTotal)) currentTotal = 0; // S'assurer que currentTotal est un nombre
        if (isNaN(targetTotal)) { // Si newTotalValue n'est pas un nombre, ne pas animer.
             panierTotalEl.textContent = "0.00"; // ou une valeur par défaut
             return;
        }

        if (Math.abs(currentTotal - targetTotal) < 0.01) {
            panierTotalEl.textContent = targetTotal.toFixed(2);
            return;
        }
        if (priceAnimationFrameId) {
            cancelAnimationFrame(priceAnimationFrameId);
        }
        const duration = 300;
        const startTime = performance.now();

        function animate(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const animatedValue = currentTotal + (targetTotal - currentTotal) * progress;
            panierTotalEl.textContent = animatedValue.toFixed(2);
            if (progress < 1) {
                priceAnimationFrameId = requestAnimationFrame(animate);
            } else {
                panierTotalEl.textContent = targetTotal.toFixed(2);
                priceAnimationFrameId = null;
            }
        }
        priceAnimationFrameId = requestAnimationFrame(animate);
    }

    function updateCheckoutButton() {
        checkoutBtn.disabled = panier.length === 0;
    }

    // --- MODIFIÉ : Augmenter la quantité (avec vérification de stock) ---
    function increaseQuantity(id) {
        const item = panier.find(item => item.id === id);
        const productInfo = productsWithStock[id];

        if (item && productInfo) {
            const stock = productInfo.stock;
            if (item.quantity < stock) {
                item.quantity += 1;
                savepanier();
                lastAddedItemId = null;
                updatepanierDisplay();
            } else {
                alert("Quantité maximale en stock atteinte pour ce produit.");
                // Le bouton + sera désactivé par updatepanierDisplay
            }
        }
    }

    function decreaseQuantity(id) {
        const item = panier.find(item => item.id === id);
        if (item) {
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                // Si la quantité est 1, décrémenter revient à supprimer l'article
                // Ou vous pouvez choisir de ne rien faire et laisser l'utilisateur utiliser "Supprimer"
                panier = panier.filter(cartItem => cartItem.id !== id);
            }
            savepanier();
            lastAddedItemId = null;
            updatepanierDisplay(); // Rafraîchit et réactive le bouton + si nécessaire
        }
    }

    function removeFrompanier(id) {
        panier = panier.filter(item => item.id !== id);
        savepanier();
        lastAddedItemId = null;
        updatepanierDisplay(); // Rafraîchit et met à jour l'état des boutons
    }

    function getpanierTotal() {
        return panier.reduce((total, item) => {
            // S'assurer que item.price est un nombre pour le calcul
            const price = typeof item.price === 'string' ? parseFloat(item.price.replace('€', '').trim().replace(',', '.')) : item.price;
            return total + (price * item.quantity);
        }, 0);
    }

    function updatePanierCount() {
        const count = panier.reduce((total, item) => total + item.quantity, 0);
        if (panierButton) {
            const panierImg = panierButton.querySelector('img');
            if (panierImg) {
                let imageNumber = count > 9 ? '9plus' : count;
                panierImg.src = `public/images/panier/panier-${imageNumber}.png`; // Adaptez le chemin si nécessaire
                panierImg.classList.add('panier-pulse');
                setTimeout(() => {
                    panierImg.classList.remove('panier-pulse');
                }, 300);
            }
        }
    }

    // --- NOUVEAU : Mettre à jour l'état visuel de TOUS les boutons "Ajouter au panier" sur la page ---
    function updateAllAddToCartButtonsVisuals() {
        const allPageButtons = document.querySelectorAll('.add-to-panier');
        allPageButtons.forEach(button => {
            const id = button.getAttribute('data-id');
            const productInfo = productsWithStock[id];

            if (productInfo) {
                const stock = productInfo.stock;
                const itemInCart = panier.find(item => item.id === id);
                const quantityInCart = itemInCart ? itemInCart.quantity : 0;

                if (quantityInCart >= stock || stock === 0) {
                    button.disabled = true;
                    button.style.backgroundColor = 'grey'; // Couleur de fond pour indiquer l'indisponibilité
                    button.textContent = stock === 0 ? 'Stock épuisé' : 'Stock max atteint';
                } else {
                    button.disabled = false;
                    button.style.backgroundColor = ''; // Réinitialiser la couleur de fond
                    button.textContent = 'Ajouter au panier'; // Texte original du bouton
                }
            }
        });
    }

    // Initialisation du magasin (chargement des produits et mise à jour de l'UI)
    initializeStore();
    // Les appels initiaux à updatePanierCount et updateCheckoutButton sont maintenant gérés dans initializeStore -> updatepanierDisplay
});
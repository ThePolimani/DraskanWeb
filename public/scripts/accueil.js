document.addEventListener('DOMContentLoaded', function() {
    const carouselContainer = document.getElementById('carouselContainer');
    const carousel = document.getElementById('carousel');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    let productsOriginal = [];
    let productWidth = 0; 
    
    let clonesToPrepend = [];
    let clonesToAppend = [];

    let currentXOffset = 0;
    const autoScrollSpeed = 0.25; 
    let isHovering = false;
    let isTransitioningCard = false;
    let animationFrameId;

    function createProductElement(product) {
        const div = document.createElement('div');
        div.classList.add('product');
        div.classList.add('fadeIn');
        div.dataset.id = product.id;
        div.innerHTML = `
            <h3 class="product-title">${product.nom}</h3>
            <img src="${product.img}" alt="${product.nom}" class="product-image">
            <p class="product-price">${product.prix}</p>
            <button class="add-to-panier btn" data-id="${product.id}" data-name="${product.nom}" data-price="${product.prix}">Ajouter au panier</button>
        `;
        return div;
    }

    function displayMessage(message, type = 'loading') {
        carousel.innerHTML = `<div class="${type}-message">${message}</div>`;
        prevBtn.disabled = true;
        nextBtn.disabled = true;
    }

    function setupCarousel(fetchedProductData) { // Prend les données récupérées en argument
        carousel.innerHTML = ''; 
        productsOriginal = fetchedProductData.map(createProductElement);
        
        if (productsOriginal.length === 0) {
            displayMessage("Aucun produit à afficher.", "error");
            return;
        }

        productsOriginal.forEach(p => carousel.appendChild(p));

        const firstProduct = carousel.querySelector('.product');
        if (!firstProduct) { // Ne devrait pas arriver si productsOriginal.length > 0
            displayMessage("Erreur lors de la création des éléments du carrousel.", "error");
            return;
        }

        const style = getComputedStyle(firstProduct);
        productWidth = firstProduct.offsetWidth + parseInt(style.marginLeft) + parseInt(style.marginRight);

        if (productWidth === 0) {
            console.warn("Product width is 0, carousel might not work correctly. Recalculating...");
             // Essayer de forcer un reflow pour obtenir la largeur
            void carousel.offsetWidth;
            productWidth = firstProduct.offsetWidth + parseInt(style.marginLeft) + parseInt(style.marginRight);
            if(productWidth === 0) {
                displayMessage("Impossible de calculer la largeur des produits.", "error");
                return;
            }
        }

        const containerWidth = carouselContainer.offsetWidth;
        const visibleProducts = Math.max(1, Math.floor(containerWidth / productWidth));
        const numClones = Math.max(productsOriginal.length, visibleProducts + 3); 

        clonesToAppend = productsOriginal.slice(0, numClones).map(p => p.cloneNode(true));
        clonesToPrepend = productsOriginal.slice(-numClones).map(p => p.cloneNode(true));

        clonesToPrepend.forEach(clone => carousel.insertBefore(clone, carousel.firstChild));
        clonesToAppend.forEach(clone => carousel.appendChild(clone));
        
        currentXOffset = -(clonesToPrepend.length * productWidth);
        carousel.style.transform = `translateX(${currentXOffset}px)`;
        carousel.style.transition = 'none'; 

        prevBtn.disabled = false;
        nextBtn.disabled = false;
    }

    function autoScrollLoop() {
        if (isHovering || isTransitioningCard || productsOriginal.length === 0 || productWidth === 0) {
            if (!isTransitioningCard) animationFrameId = requestAnimationFrame(autoScrollLoop);
            return;
        }
        
        currentXOffset -= autoScrollSpeed;
        const totalWidthOfOriginals = productsOriginal.length * productWidth;
        const startOffsetPrependClones = -(clonesToPrepend.length * productWidth);
        if (currentXOffset <= startOffsetPrependClones - totalWidthOfOriginals) {
            currentXOffset += totalWidthOfOriginals;
        }
        else if (currentXOffset >= startOffsetPrependClones) {
             currentXOffset -= totalWidthOfOriginals;
        }
        carousel.style.transform = `translateX(${currentXOffset}px)`;
        carousel.style.transition = 'none'; 
        animationFrameId = requestAnimationFrame(autoScrollLoop);
    }

    function startAutoScroll() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId); 
        autoScrollLoop();
    }

    function stopAutoScroll() {
        cancelAnimationFrame(animationFrameId);
    }

    function moveOneCard(direction) { 
        if (isTransitioningCard || productsOriginal.length === 0 || productWidth === 0) return;
        isTransitioningCard = true;
        stopAutoScroll();
        const targetX = currentXOffset - (direction * productWidth);
        carousel.style.transition = 'transform 0.5s ease-in-out';
        carousel.style.transform = `translateX(${targetX}px)`;
        const onTransitionEnd = () => {
            carousel.removeEventListener('transitionend', onTransitionEnd);
            const finalTransformStyle = window.getComputedStyle(carousel).transform;
            let newCurrentX = targetX; 
            if (finalTransformStyle && finalTransformStyle !== 'none') {
                const matrix = new DOMMatrixReadOnly(finalTransformStyle);
                newCurrentX = matrix.e; 
            }
            currentXOffset = newCurrentX;
            const totalWidthOfOriginals = productsOriginal.length * productWidth;
            const startOffsetPrependClones = -(clonesToPrepend.length * productWidth);
            let didWrap = false;
            if (direction === 1) { 
                if (currentXOffset <= startOffsetPrependClones - totalWidthOfOriginals) {
                    currentXOffset += totalWidthOfOriginals;
                    didWrap = true;
                }
            } else { 
                 if (currentXOffset >= startOffsetPrependClones) {
                    currentXOffset -= totalWidthOfOriginals;
                    didWrap = true;
                }
            }
            if (didWrap) {
                carousel.style.transition = 'none'; 
                carousel.style.transform = `translateX(${currentXOffset}px)`;
            }
            isTransitioningCard = false;
            if (!isHovering) {
                setTimeout(() => {
                    if (!isHovering && !isTransitioningCard) { 
                        startAutoScroll();
                    }
                }, 300); 
            }
        };
        carousel.addEventListener('transitionend', onTransitionEnd);
    }

    carouselContainer.addEventListener('mouseenter', () => {
        isHovering = true;
        stopAutoScroll();
    });

    carouselContainer.addEventListener('mouseleave', () => {
        isHovering = false;
        if (!isTransitioningCard) {
            startAutoScroll();
        }
    });

    nextBtn.addEventListener('click', () => moveOneCard(1));
    prevBtn.addEventListener('click', () => moveOneCard(-1));
    
    async function fetchProductsAndInit() {
        displayMessage("Chargement des produits...");
        try {
            const response = await fetch('app/api/get_produits.php');
            if (!response.ok) {
                // Essayer de lire le message d'erreur JSON du corps de la réponse
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    // Si le corps n'est pas JSON ou est vide
                    errorData = { error: `Erreur HTTP ${response.status} - ${response.statusText}` };
                }
                throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
            }
            const fetchedProductData = await response.json();
            
            if (fetchedProductData && fetchedProductData.length > 0) {
                setupCarousel(fetchedProductData); // Passer les données à setupCarousel
                if (productsOriginal.length > 0 && productWidth > 0) {
                     startAutoScroll();
                }
            } else if (fetchedProductData && fetchedProductData.length === 0) {
                displayMessage("Aucun produit trouvé.", "error");
            } else { // Cas où la réponse est ok mais le JSON est malformé ou non un tableau
                 displayMessage("Données des produits invalides reçues du serveur.", "error");
            }

        } catch (error) {
            console.error("Erreur lors de la récupération des produits:", error);
            displayMessage(`Erreur lors du chargement: ${error.message}`, "error");
        }
    }
    
    window.addEventListener('load', fetchProductsAndInit);
    window.addEventListener('resize', () => {
        // Gérer le redimensionnement : pourrait simplement rappeler fetchProductsAndInit
        // ou une version plus optimisée qui ne refait pas le fetch si les données sont déjà là.
        // Pour la simplicité, on arrête l'animation et on réinitialise avec les données existantes si possible,
        // ou on refait tout si productWidth devient invalide.
        stopAutoScroll();
        if (productsOriginal.length > 0) {
            setupCarousel(productsOriginal.map(el => { // Recréer les données sources à partir des éléments DOM n'est pas idéal
                                                        // Il vaut mieux stocker les données brutes récupérées une fois.
                                                        // Simplification : on assume que les données sont toujours là ou on les re-fetch.
                                                        // Pour une meilleure robustesse, stocker les données JSON initiales.
                return { // Ceci est une tentative de recréer les données. Mieux vaut stocker le fetchedProductData
                    id: el.dataset.id,
                    nom: el.querySelector('.product-title').textContent,
                    prix: el.querySelector('.product-price').textContent,
                    img: el.querySelector('.product-image').src
                };
            }));
            if (productsOriginal.length > 0 && productWidth > 0) {
                startAutoScroll();
            }
        } else {
            fetchProductsAndInit(); // Si pas de produits, refaire le fetch
        }
    });
});
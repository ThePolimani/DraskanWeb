document.addEventListener('DOMContentLoaded', function() {

const produitContainer = document.querySelector('.produits-container');
const produitInfoContainer = document.querySelector('.produit-detail');

if (produitContainer) {
    produitContainer.addEventListener('click', function(event) {
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

if (produitInfoContainer) {
    produitInfoContainer.addEventListener('click', function(event) {
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
});
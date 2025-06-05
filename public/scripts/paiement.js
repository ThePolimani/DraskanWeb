document.addEventListener('DOMContentLoaded', async function() {
    const paymentForm = document.getElementById('paymentForm');
    const finalPayBtn = document.getElementById('finalPayBtn');
    const customerForm = document.getElementById('customerForm');

    // 1. Charger les stocks produits depuis l'API
    let productsWithStock = {};
    try {
        const response = await fetch('app/api/get_produits.php');
        if (!response.ok) throw new Error('Erreur lors du chargement des stocks');
        const products = await response.json();
        products.forEach(p => {
            productsWithStock[p.id] = {
                stock: p.stock,
                name: p.nom,
                price: parseFloat(p.prix.replace('€', '').trim().replace(',', '.')),
            };
        });
    } catch (e) {
        alert("Erreur lors du chargement des stocks produits.");
        // Optionnel : désactiver tous les boutons + ici
    }

    // Si le panier est vide au chargement de la page de paiement,
    // on pourrait rediriger l'utilisateur ou afficher un message plus proéminent.
    const currentCart = JSON.parse(localStorage.getItem('panier')) || [];
    if (currentCart.length === 0) {
        document.getElementById('panierItems').innerHTML = '<p>Votre panier est vide. Vous allez être redirigé vers l\'accueil.</p>';
        finalPayBtn.disabled = true; // Désactiver le bouton payer
        // Optionnel : rediriger après un délai
        // setTimeout(() => {
        //     window.location.href = '/'; // ou vers la page des produits
        // }, 3000);
    } else {
        // Afficher dynamiquement les articles du panier
        const panierItems = document.getElementById('paiementPanierItems');
        panierItems.innerHTML = '';
        let total = 0;
        const taxeRate = 0.20; // 20% de TVA par exemple
        const taxe = total * taxeRate;
        const totalTTC = total + taxe;
        currentCart.forEach(item => {
            const productInfo = productsWithStock[item.id] || { stock: 0 };
            const stock = productInfo.stock;
            const plusButtonDisabled = item.quantity >= stock ? 'disabled' : '';
            const plusButtonClass = item.quantity >= stock ? 'quantity-btn plus disabled-stock' : 'quantity-btn plus';
            const itemPrice = typeof item.price === 'string' ? parseFloat(item.price.replace('€', '').trim().replace(',', '.')) : item.price;
            const itemTotal = itemPrice * item.quantity;
            total += itemTotal;
            const div = document.createElement('div');
            div.className = 'panier-item';
            div.innerHTML = `
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
            panierItems.appendChild(div);
        });
        document.getElementById('panierTotal').textContent = total.toFixed(2);
        document.getElementById('panierTaxe').textContent = taxe.toFixed(2);
        document.getElementById('panierTotalTTC').textContent = totalTTC.toFixed(2);

        // Ajout des event listeners pour les boutons +, -, supprimer
        document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const item = currentCart.find(i => i.id == id);
                const stock = productsWithStock[id]?.stock || 0;
                if (item && item.quantity < stock) {
                    item.quantity += 1;
                    localStorage.setItem('panier', JSON.stringify(currentCart));
                    updatepanierDisplay();
                }
            });
        });
        document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const item = currentCart.find(i => i.id == id);
                if (item && item.quantity > 1) {
                    item.quantity -= 1;
                    localStorage.setItem('panier', JSON.stringify(currentCart));
                    updatepanierDisplay();
                }
            });
        });
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const idx = currentCart.findIndex(i => i.id == id);
                if (idx !== -1) {
                    currentCart.splice(idx, 1);
                    localStorage.setItem('panier', JSON.stringify(currentCart));
                    updatepanierDisplay();
                }
            });
        });
    }


    if (paymentForm) {
        paymentForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Empêche la soumission standard du formulaire

            // Valider le formulaire client d'abord
            if (!customerForm.checkValidity()) {
                customerForm.reportValidity(); // Affiche les messages d'erreur HTML5
                alert("Veuillez remplir tous les champs d'information client requis.");
                return;
            }

            // Valider le formulaire de paiement
            if (!paymentForm.checkValidity()) {
                paymentForm.reportValidity();
                alert("Veuillez vérifier les informations de paiement.");
                return;
            }

            // Récupérer les données du client
            const customerData = {
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                postalCode: document.getElementById('postalCode').value,
                country: document.getElementById('country').value,
            };

            // Récupérer les données de paiement (simplifié)
            const paymentData = {
                cardName: document.getElementById('cardName').value,
                // Ne jamais envoyer le numéro de carte complet et CVV directement comme ça à un vrai backend
                // Utiliser des solutions comme Stripe Elements qui tokenisent les données.
                // Pour cette démo, on fait semblant.
            };

            const orderData = {
                customer: customerData,
                payment: paymentData, // Attention à la sécurité ici pour une vraie app
                cart: JSON.parse(localStorage.getItem('panier')) || [],
                totalAmount: parseFloat(document.getElementById('panierTotal').textContent)
            };

            console.log("Données de la commande à envoyer au backend :", orderData);
            alert('Paiement simulé réussi ! Merci pour votre commande.');

            // Ici, tu enverrais 'orderData' à ton backend (par ex. via fetch)
            // fetch('/api/process-payment', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(orderData)
            // })
            // .then(response => response.json())
            // .then(data => {
            //     if (data.success) {
            //         alert('Paiement réussi ! Merci pour votre commande.');
            //         localStorage.removeItem('panier'); // Vider le panier
            //         // Mettre à jour l'affichage pour montrer un panier vide et peut-être un message de succès
            //         updatepanierDisplay(); // Qui devrait afficher "panier vide"
                   //  document.getElementById('panierTotal').textContent = "0.00"; // Assurer
            //         // Rediriger vers une page de confirmation
            //         // window.location.href = '/confirmation-commande?orderId=' + data.orderId;
            //     } else {
            //         alert('Erreur de paiement: ' + data.message);
            //     }
            // })
            // .catch(error => {
            //     console.error('Erreur lors de la soumission du paiement:', error);
            //     alert('Une erreur est survenue lors du traitement de votre paiement.');
            // });

            // Pour la démo, on vide juste le panier et on met à jour l'affichage
            localStorage.removeItem('panier');
            // Il faut s'assurer que la variable 'panier' dans ton script JS global est aussi vidée
            // et que l'affichage est mis à jour. La manière la plus simple est de recharger
            // les fonctions qui dépendent de 'panier'.
            // Si ton script-panier.js est bien fait, appeler initializeStore ou updatepanierDisplay
            // devrait suffire.
            // Forcer la mise à jour de la variable globale `panier` si elle est utilisée directement
            // par d'autres fonctions après ce point dans ton script principal.
            if (typeof panier !== 'undefined' && Array.isArray(panier)) {
                 panier.length = 0; // Vide le tableau 'panier' en mémoire
            }

            if (typeof updatepanierDisplay === 'function') {
                 updatepanierDisplay();
            } else {
                // Fallback si updatepanierDisplay n'est pas directement appelable ici
                document.getElementById('panierItems').innerHTML = '<p>Votre panier a été vidé. Merci pour votre commande!</p>';
                document.getElementById('panierTotal').textContent = "0.00";
            }
            
            finalPayBtn.disabled = true;
            finalPayBtn.textContent = "Commande effectuée";
        });
    }

    function updatepanierDisplay() {
        const currentCart = JSON.parse(localStorage.getItem('panier')) || [];
        const panierItems = document.getElementById('paiementPanierItems');
        panierItems.innerHTML = '';
        let total = 0;
        const taxeRate = 0.20;
        currentCart.forEach(item => {
            const productInfo = productsWithStock[item.id] || { stock: 0 };
            const stock = productInfo.stock;
            const plusButtonDisabled = item.quantity >= stock ? 'disabled' : '';
            const plusButtonClass = item.quantity >= stock ? 'quantity-btn plus disabled-stock' : 'quantity-btn plus';
            const itemPrice = typeof item.price === 'string' ? parseFloat(item.price.replace('€', '').trim().replace(',', '.')) : item.price;
            const itemTotal = itemPrice * item.quantity;
            total += itemTotal;
            const div = document.createElement('div');
            div.className = 'panier-item';
            div.innerHTML = `
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
            panierItems.appendChild(div);
        });
        const taxe = total * taxeRate;
        const totalTTC = total + taxe;
        document.getElementById('panierTotal').textContent = total.toFixed(2);
        document.getElementById('panierTaxe').textContent = taxe.toFixed(2);
        document.getElementById('panierTotalTTC').textContent = totalTTC.toFixed(2);

        // Réattache les listeners
        document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const item = currentCart.find(i => i.id == id);
                const stock = productsWithStock[id]?.stock || 0;
                if (item && item.quantity < stock) {
                    item.quantity += 1;
                    localStorage.setItem('panier', JSON.stringify(currentCart));
                    updatepanierDisplay();
                }
            });
        });
        document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const item = currentCart.find(i => i.id == id);
                if (item && item.quantity > 1) {
                    item.quantity -= 1;
                    localStorage.setItem('panier', JSON.stringify(currentCart));
                    updatepanierDisplay();
                }
            });
        });
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const idx = currentCart.findIndex(i => i.id == id);
                if (idx !== -1) {
                    currentCart.splice(idx, 1);
                    localStorage.setItem('panier', JSON.stringify(currentCart));
                    updatepanierDisplay();
                }
            });
        });
    }
});

<main>
    <div class="payment-container">
        <h1>Page de Paiement</h1>

        <section class="order-summary">
            <h2>Récapitulatif de votre commande</h2>
            <div id="paiementPanierItems">
                <p>Chargement du panier...</p>
            </div>
            <div class="total-section">
                Sous-total : <span id="panierTotal">0.00</span>€<br>
                Taxe (20%) : <span id="panierTaxe">0.00</span>€<br>
                <strong>Total TTC : <span id="panierTotalTTC">0.00</span>€</strong>
            </div>
        </section>

        <section class="customer-info">
            <h2>Vos informations</h2>
            <form id="customerForm">
                <div class="payment-form-grid">
                    <div class="form-group">
                        <label for="fullName">Nom complet</label>
                        <input type="text" id="fullName" name="fullName" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="address">Adresse de livraison</label>
                    <input type="text" id="address" name="address" required>
                </div>
                <div class="payment-form-grid">
                    <div class="form-group">
                        <label for="city">Ville</label>
                        <input type="text" id="city" name="city" required>
                    </div>
                    <div class="form-group">
                        <label for="postalCode">Code Postal</label>
                        <input type="text" id="postalCode" name="postalCode" pattern="[0-9]{5}" title="Code postal à 5 chiffres" required>
                    </div>
                </div>
                 <div class="form-group">
                    <label for="country">Pays</label>
                    <input type="text" id="country" name="country" value="France" required>
                </div>
            </form>
        </section>

        <section class="payment-info">
            <h2>Informations de Paiement</h2>
            <form id="paymentForm">
                <div class="form-group">
                    <label for="cardName">Nom sur la carte</label>
                    <input type="text" id="cardName" name="cardName" placeholder="M. John Doe" required>
                </div>
                <div class="form-group">
                    <label for="cardNumber">Numéro de carte</label>
                    <input type="text" id="cardNumber" name="cardNumber" placeholder="0000 0000 0000 0000" pattern="\d{16}" title="Numéro de carte à 16 chiffres" required>
                </div>
                <div class="payment-form-grid">
                    <div class="form-group">
                        <label for="expiryDate">Date d'expiration (MM/AA)</label>
                        <input type="text" id="expiryDate" name="expiryDate" placeholder="MM/AA" pattern="(0[1-9]|1[0-2])\/\d{2}" title="Format MM/AA" required>
                    </div>
                    <div class="form-group">
                        <label for="cvv">CVV</label>
                        <input type="text" id="cvv" name="cvv" placeholder="123" pattern="\d{3,4}" title="CVV à 3 ou 4 chiffres" required>
                    </div>
                </div>
                <button type="submit" class="pay-button" id="finalPayBtn">Payer</button>
            </form>
        </section>
    </div>
</main>
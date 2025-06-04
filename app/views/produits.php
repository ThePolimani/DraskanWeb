<main>
    <div class="container">
        <?php if ($produitDetail): ?>
            <a href="/draskan/produits" class="back-link">← Retour à la liste des produits</a>
            
            <div class="produit-detail">
                <?php if (!empty($produitDetail['image_url'])): ?>
                    <img src="<?= htmlspecialchars($produitDetail['image_url']) ?>" alt="<?= htmlspecialchars($produitDetail['nom']) ?>" class="produit-detail-image">
                <?php endif; ?>
                
                <h1><?= htmlspecialchars($produitDetail['nom']) ?></h1>
                <p class="produit-prix"><?= number_format($produitDetail['prix'], 2, ',', ' ') ?> €</p>
                
                <?php if (!empty($produitDetail['categorie_nom'])): ?>
                    <p class="produit-categorie">Catégorie: <?= htmlspecialchars($produitDetail['categorie_nom']) ?></p>
                <?php endif; ?>
                
                <div class="produit-description">
                    <?= nl2br(htmlspecialchars($produitDetail['description'])) ?>
                </div>
                
                <div class="produit-details">
                    <strong>Volume:</strong> <?= htmlspecialchars($produitDetail['volume_ml']) ?> ml
                </div>
                
                <div class="produit-details">
                    <strong>Degré d'alcool:</strong> <?= htmlspecialchars($produitDetail['alcool_pct']) ?>%
                </div>
                
                <div class="produit-details">
                    <strong>Stock disponible:</strong> <?= htmlspecialchars($produitDetail['stock']) ?>
                </div>
            </div>
        <?php else: ?>
            <h1>Nos Produits</h1>
            
            <div class="filtres">
                <h2>Filtres</h2>
                <form method="get" action="">
                    <div class="filtre-group">
                        <label for="tri">Trier par:</label>
                        <select name="tri" id="tri">
                            <option value="">Date d'ajout (récent)</option>
                            <option value="prix_asc" <?= (!empty($_GET['tri']) && $_GET['tri'] == 'prix_asc') ? 'selected' : '' ?>>Prix (croissant)</option>
                            <option value="prix_desc" <?= (!empty($_GET['tri']) && $_GET['tri'] == 'prix_desc') ? 'selected' : '' ?>>Prix (décroissant)</option>
                            <option value="nom_asc" <?= (!empty($_GET['tri']) && $_GET['tri'] == 'nom_asc') ? 'selected' : '' ?>>Nom (A-Z)</option>
                            <option value="nom_desc" <?= (!empty($_GET['tri']) && $_GET['tri'] == 'nom_desc') ? 'selected' : '' ?>>Nom (Z-A)</option>
                            <option value="alcool_asc" <?= (!empty($_GET['tri']) && $_GET['tri'] == 'alcool_asc') ? 'selected' : '' ?>>Degré alcool (croissant)</option>
                            <option value="alcool_desc" <?= (!empty($_GET['tri']) && $_GET['tri'] == 'alcool_desc') ? 'selected' : '' ?>>Degré alcool (décroissant)</option>
                        </select>
                    </div>
                    
                    <div class="filtre-group">
                        <label for="categorie">Catégorie:</label>
                        <select name="categorie" id="categorie">
                            <option value="">Toutes les catégories</option>
                            <?php foreach ($categories as $categorie): ?>
                                <option value="<?= $categorie['id'] ?>" <?= (!empty($_GET['categorie']) && $_GET['categorie'] == $categorie['id']) ? 'selected' : '' ?>>
                                    <?= htmlspecialchars($categorie['nom']) ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    
                    <div class="filtre-group">
                        <label for="prix_min">Prix minimum (€):</label>
                        <input type="number" name="prix_min" id="prix_min" min="0" step="0.01" value="<?= !empty($_GET['prix_min']) ? htmlspecialchars($_GET['prix_min']) : '' ?>">
                    </div>
                    
                    <div class="filtre-group">
                        <label for="prix_max">Prix maximum (€):</label>
                        <input type="number" name="prix_max" id="prix_max" min="0" step="0.01" value="<?= !empty($_GET['prix_max']) ? htmlspecialchars($_GET['prix_max']) : '' ?>">
                    </div>
                    
                    <div class="filtre-group">
                        <label for="alcool_min">Degré d'alcool minimum (%):</label>
                        <input type="number" name="alcool_min" id="alcool_min" min="0" max="100" step="0.1" value="<?= !empty($_GET['alcool_min']) ? htmlspecialchars($_GET['alcool_min']) : '' ?>">
                    </div>
                    
                    <div class="filtre-group">
                        <label for="volume_min">Volume minimum (ml):</label>
                        <input type="number" name="volume_min" id="volume_min" min="0" value="<?= !empty($_GET['volume_min']) ? htmlspecialchars($_GET['volume_min']) : '' ?>">
                    </div>
                    
                    <button type="submit">Appliquer les filtres</button>
                    <?php if (!empty($_GET)): ?>
                        <a href="?" style="margin-left: 10px;">Réinitialiser</a>
                    <?php endif; ?>
                </form>
            </div>
            
            <div class="produits-container">
                <?php foreach ($produits as $produit): ?>
                    <a href="?id=<?= htmlspecialchars($produit['id']) ?>">
                        <div class="produit-card">
                            <?php if (!empty($produit['image_url'])): ?>
                                <img src="<?= htmlspecialchars($produit['image_url']) ?>" alt="<?= htmlspecialchars($produit['nom']) ?>" class="produit-image">
                            <?php else: ?>
                                <img src="placeholder-image.jpg" alt="Image non disponible" class="produit-image">
                            <?php endif; ?>
                            <div class="produit-info">
                                <h3 class="produit-nom"><?= htmlspecialchars($produit['nom']) ?></h3>
                                <p class="produit-prix"><?= number_format($produit['prix'], 2, ',', ' ') ?> €</p>
                                <?php if (!empty($produit['categorie_nom'])): ?>
                                    <p class="produit-categorie"><?= htmlspecialchars($produit['categorie_nom']) ?></p>
                                <?php endif; ?>
                            </div>
                        </div>
                    </a>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
</main>
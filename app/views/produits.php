<main>
    <h1>Nos Produits</h1>
    
    <div class="produits-container">
        <?php foreach ($produits as $produit): ?>
            <a href="produit.php?id=<?= htmlspecialchars($produit['id']) ?>">
                <div class="produit-card">
                    <?php if (!empty($produit['image_url'])): ?>
                        <img src="<?= htmlspecialchars($produit['image_url']) ?>" alt="<?= htmlspecialchars($produit['nom']) ?>" class="produit-image">
                    <?php else: ?>
                        <img src="placeholder-image.jpg" alt="Image non disponible" class="produit-image">
                    <?php endif; ?>
                    <div class="produit-info">
                        <h3 class="produit-nom"><?= htmlspecialchars($produit['nom']) ?></h3>
                        <p class="produit-prix"><?= number_format($produit['prix'], 2, ',', ' ') ?> €</p>
                    </div>
                </div>
            </a>
        <?php endforeach; ?>
    </div>
</main>
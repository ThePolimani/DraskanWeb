<main>
    <div class="partners animatedList" data-animation="fadeInUp" data-reset-delay data-delay-step="0.2">
        <?php foreach ($partenaires as $partenaire): ?>
        <div class="partner-card">
          <img src="<?= htmlspecialchars($partenaire['logo_url']) ?>" alt="Logo <?= htmlspecialchars($partenaire['nom']) ?>" class="partner-logo" />
          <h2><?= htmlspecialchars($partenaire['nom']) ?></h2>
          <?php if (!empty($partenaire['description'])): ?>
            <p><?= htmlspecialchars($partenaire['description']) ?></p>
          <?php endif; ?>
        </div>
        <?php endforeach; ?>
    </div>
  </main>
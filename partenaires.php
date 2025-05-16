<?php
require_once 'app/config.php';

try {
    $stmt = $pdo->query("SELECT * FROM partenaires");
    
    $partenaires = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    echo "Erreur lors de la récupération des partenaires : " . $e->getMessage();
    exit;
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Nos Partenaires</title>
  <link rel="stylesheet" href="public/styles/main.css">
  <link rel="stylesheet" href="public/styles/partenaires.css">
  <script src="public/scripts/main.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lancelot&display=swap" rel="stylesheet">
</head>
<body>
  <header>
    <h1>Nos Partenaires</h1>
  </header>

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

  <footer>
    <p>&copy; 2025 Tous droits réservés</p>
  </footer>
</body>
</html>
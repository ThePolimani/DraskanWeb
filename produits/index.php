<?php
$pageSpecificCSS = 'accueil.css'; // Changez cette variable selon la page
$pageSpecificJS = 'accueil.js'; // Changez cette variable selon la page

include_once '../app/views/common/header.php';

require_once '../app/config.php';

try {
    $stmt = $pdo->query("SELECT logo_url FROM partenaires");
    
    $partenaires = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    echo "Erreur lors de la récupération des partenaires : " . $e->getMessage();
    exit;
}

include_once '../app/views/produits.php';
include_once '../app/views/common/footer.php';
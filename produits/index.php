<?php
$pageSpecificCSS = 'produits.css'; // Changez cette variable selon la page
//$pageSpecificJS = 'accueil.js'; // Changez cette variable selon la page

include_once '../app/views/common/header.php';

require_once '../app/config.php';

try {
    $stmt = $pdo->query("SELECT id, nom, prix, image_url FROM produits ORDER BY date_ajout DESC");
    $produits = $stmt->fetchAll();
} catch (PDOException $e) {
    die("Erreur lors de la récupération des produits : " . $e->getMessage());
}

include_once '../app/views/produits.php';
include_once '../app/views/common/footer.php';
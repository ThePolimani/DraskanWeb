<?php
$pageSpecificCSS = 'mentions.css'; // Changez cette variable selon la page
$pageTitle = 'Mentions Légales'; // Changez cette variable selon la page

include_once 'app/views/common/header.php';

require_once 'app/config.php';

try {
    $stmt = $pdo->query("SELECT nom, site_url FROM partenaires");
    $partenaires = $stmt->fetchAll();
} catch (PDOException $e) {
    echo "<h2>Nos partenaires</h2><p>Impossible d'afficher les partenaires actuellement.</p>";
}

include_once 'app/views/mentions-legales.php';
include_once 'app/views/common/footer.php';
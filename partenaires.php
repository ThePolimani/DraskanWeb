<?php
$pageSpecificCSS = 'partenaires.css';
$pageTitle = 'Partenaires'; // Changez cette variable selon la page ("Draskan - " sera ajouté avant ce titre)

include_once 'app/views/common/header.php';
require_once 'app/config.php';

try {
    $stmt = $pdo->query("SELECT * FROM partenaires");
    
    $partenaires = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    echo "Erreur lors de la récupération des partenaires : " . $e->getMessage();
    exit;
}

include_once 'app/views/partenaires.php';
include_once 'app/views/common/footer.php';
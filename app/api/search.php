<?php
require_once 'app/config.php';

// Récupération des paramètres envoyés en GET
$mot_cle = isset($_GET['q']) ? trim($_GET['q']) : "";
$categorie = isset($_GET['categorie']) ? intval($_GET['categorie']) : null;
$format = isset($_GET['format']) ? intval($_GET['format']) : null;
$alcool_min = isset($_GET['alcool_min']) ? floatval($_GET['alcool_min']) : 0;
$alcool_max = isset($_GET['alcool_max']) ? floatval($_GET['alcool_max']) : 100;
$prix_min = isset($_GET['prix_min']) ? floatval($_GET['prix_min']) : 0;
$prix_max = isset($_GET['prix_max']) ? floatval($_GET['prix_max']) : 1000;
$volume_min = isset($_GET['volume_min']) ? intval($_GET['volume_min']) : 0;
$volume_max = isset($_GET['volume_max']) ? intval($_GET['volume_max']) : 10000;
$dispo = isset($_GET['dispo']) ? boolval($_GET['dispo']) : false; // 1 = en stock uniquement
$tri = isset($_GET['tri']) ? $_GET['tri'] : 'date_desc'; // Par défaut : tri par date d'ajout décroissante
$limit = 10;

// Construction de la requête SQL dynamique
$sql = "SELECT * FROM produits WHERE 1";

// Recherche partielle si un mot-clé est fourni
if (!empty($mot_cle)) {
    // Utilisation de LIKE pour rechercher une partie du texte
    $mot_cle_normalized = remove_accents($mot_cle); // Normaliser le mot-clé si besoin
    $sql .= " AND (nom LIKE :mot_cle OR description LIKE :mot_cle)";
}

// Ajout des filtres supplémentaires
if ($categorie !== null) {
    $sql .= " AND categorie_id = :categorie";
}
if ($format !== null) {
    $sql .= " AND format_id = :format";
}
$sql .= " AND alcool_pct BETWEEN :alcool_min AND :alcool_max";
$sql .= " AND prix BETWEEN :prix_min AND :prix_max";
$sql .= " AND volume_ml BETWEEN :volume_min AND :volume_max";

// Filtrer les produits en stock uniquement
if ($dispo) {
    $sql .= " AND stock > 0";
}

// 🔄 Gestion du tri
$triOptions = [
    'prix_asc' => "prix ASC",
    'prix_desc' => "prix DESC",
    'alcool_asc' => "alcool_pct ASC",
    'alcool_desc' => "alcool_pct DESC",
    'date_asc' => "date_ajout ASC",
    'date_desc' => "date_ajout DESC"
];
$sql .= " ORDER BY " . ($triOptions[$tri] ?? "date_ajout DESC");

// Limiter le nombre de résultats
$sql .= " LIMIT :limit";

// Exécution de la requête
$stmt = $pdo->prepare($sql);

// Liaison des paramètres
if (!empty($mot_cle)) {
    $stmt->bindValue(':mot_cle', "%$mot_cle_normalized%", PDO::PARAM_STR);
}
if ($categorie !== null) {
    $stmt->bindValue(':categorie', $categorie, PDO::PARAM_INT);
}
if ($format !== null) {
    $stmt->bindValue(':format', $format, PDO::PARAM_INT);
}
$stmt->bindValue(':alcool_min', $alcool_min);
$stmt->bindValue(':alcool_max', $alcool_max);
$stmt->bindValue(':prix_min', $prix_min);
$stmt->bindValue(':prix_max', $prix_max);
$stmt->bindValue(':volume_min', $volume_min, PDO::PARAM_INT);
$stmt->bindValue(':volume_max', $volume_max, PDO::PARAM_INT);
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);

$stmt->execute();
$resultats = $stmt->fetchAll();

// Renvoi des résultats en JSON
header('Content-Type: application/json');
echo json_encode($resultats);

// Fonction pour supprimer les accents
function remove_accents($string) {
    return iconv('UTF-8', 'ASCII//TRANSLIT', $string);
}
?>

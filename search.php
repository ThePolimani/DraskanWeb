<?php
// 🔌 Connexion à la base de données
$host = "vamrosr800.mysql.db"; // À adapter
$dbname = "vamrosr800";
$username = "vamrosr800";
$password = "SQLDBbiere64285";
$pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
]);

// 🔍 Récupération des paramètres envoyés en GET
$mot_cle = isset($_GET['q']) ? trim($_GET['q']) : "";
$categorie = isset($_GET['categorie']) ? intval($_GET['categorie']) : null;
$alcool_min = isset($_GET['alcool_min']) ? floatval($_GET['alcool_min']) : 0;
$alcool_max = isset($_GET['alcool_max']) ? floatval($_GET['alcool_max']) : 100;
$prix_min = isset($_GET['prix_min']) ? floatval($_GET['prix_min']) : 0;
$prix_max = isset($_GET['prix_max']) ? floatval($_GET['prix_max']) : 1000;
$limit = 10; // Nombre de résultats max

// 📌 Construction de la requête SQL dynamique
$sql = "SELECT * FROM produits WHERE 1";

// Recherche `FULLTEXT` si un mot-clé est fourni
if (!empty($mot_cle)) {
    $sql .= " AND MATCH(nom, description) AGAINST(:mot_cle IN NATURAL LANGUAGE MODE)";
}

// Ajout des filtres supplémentaires
if ($categorie !== null) {
    $sql .= " AND categorie_id = :categorie";
}
$sql .= " AND alcool_pct BETWEEN :alcool_min AND :alcool_max";
$sql .= " AND prix BETWEEN :prix_min AND :prix_max";

// Trier par pertinence si une recherche est faite
if (!empty($mot_cle)) {
    $sql .= " ORDER BY MATCH(nom, description) AGAINST(:mot_cle IN NATURAL LANGUAGE MODE) DESC";
}

// Limiter le nombre de résultats
$sql .= " LIMIT :limit";

// 📌 Exécution de la requête
$stmt = $pdo->prepare($sql);

// Liaison des paramètres
if (!empty($mot_cle)) {
    $stmt->bindValue(':mot_cle', $mot_cle);
}
if ($categorie !== null) {
    $stmt->bindValue(':categorie', $categorie, PDO::PARAM_INT);
}
$stmt->bindValue(':alcool_min', $alcool_min);
$stmt->bindValue(':alcool_max', $alcool_max);
$stmt->bindValue(':prix_min', $prix_min);
$stmt->bindValue(':prix_max', $prix_max);
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);

$stmt->execute();
$resultats = $stmt->fetchAll();

// 🔄 Renvoi des résultats en JSON
header('Content-Type: application/json');
echo json_encode($resultats);
?>

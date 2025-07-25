<?php
$pageSpecificCSS = 'produits.css';
$pageSpecificJS = 'produits.js';
$pageTitle = 'Produits'; 

include_once 'app/views/common/header.php';
require_once 'app/config.php';

try {
    $categories = $pdo->query("SELECT id, nom FROM categories ORDER BY nom")->fetchAll();
} catch (PDOException $e) {
    die("Erreur lors de la récupération des catégories : " . $e->getMessage());
}

// Gestion des filtres
$filters = [];
$params = [];
$sql = "SELECT p.id, p.nom, p.prix, p.image_url, p.description, p.volume_ml, p.alcool_pct, p.stock, c.nom AS categorie_nom 
        FROM produits p 
        LEFT JOIN categories c ON p.categorie_id = c.id 
        WHERE 1=1";

//Filtre par barre de recherche
if (!empty($_GET['recherche'])) {
    $recherche = trim($_GET['recherche']);
    // On cherche dans le nom OU la description du produit
    $filters[] = "(p.nom LIKE ? OR p.description LIKE ?)";
    $params[] = "%" . $recherche . "%";
    $params[] = "%" . $recherche . "%";
}

// Filtre par catégorie
if (!empty($_GET['categorie']) && is_numeric($_GET['categorie'])) {
    $filters[] = "p.categorie_id = ?";
    $params[] = $_GET['categorie'];
}

// Filtre par prix min
if (!empty($_GET['prix_min']) && is_numeric($_GET['prix_min'])) {
    $filters[] = "p.prix >= ?";
    $params[] = $_GET['prix_min'];
}

// Filtre par prix max
if (!empty($_GET['prix_max']) && is_numeric($_GET['prix_max'])) {
    $filters[] = "p.prix <= ?";
    $params[] = $_GET['prix_max'];
}

// Filtre par degré d'alcool min
if (!empty($_GET['alcool_min']) && is_numeric($_GET['alcool_min'])) {
    $filters[] = "p.alcool_pct >= ?";
    $params[] = $_GET['alcool_min'];
}

// Filtre par volume min
if (!empty($_GET['volume_min']) && is_numeric($_GET['volume_min'])) {
    $filters[] = "p.volume_ml >= ?";
    $params[] = $_GET['volume_min'];
}

// Application des filtres
if (!empty($filters)) {
    $sql .= " AND " . implode(" AND ", $filters);
}

// Tri des résultats
$orderBy = "p.date_ajout DESC";
if (!empty($_GET['tri'])) {
    switch ($_GET['tri']) {
        case 'prix_asc': $orderBy = "p.prix ASC"; break;
        case 'prix_desc': $orderBy = "p.prix DESC"; break;
        case 'nom_asc': $orderBy = "p.nom ASC"; break;
        case 'nom_desc': $orderBy = "p.nom DESC"; break;
        case 'alcool_asc': $orderBy = "p.alcool_pct ASC"; break;
        case 'alcool_desc': $orderBy = "p.alcool_pct DESC"; break;
    }
}
$sql .= " ORDER BY " . $orderBy;

// Récupération des produits filtrés
try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $produits = $stmt->fetchAll();
} catch (PDOException $e) {
    die("Erreur lors de la récupération des produits : " . $e->getMessage());
}

//Gestion du cas "aucun résultat"
$rechercheEffectueeSansResultat = false;
if (!empty($_GET['recherche']) && count($produits) === 0) {
    $rechercheEffectueeSansResultat = true;
    
    // On refait une requête pour afficher tous les produits
    try {
        // Note : Cette requête récupère TOUS les produits, sans filtres.
        // Vous pourriez aussi choisir de conserver les autres filtres (prix, catégorie...)
        // en reconstruisant la requête sans le filtre de recherche.
        $stmt = $pdo->query("SELECT p.id, p.nom, p.prix, p.image_url, c.nom AS categorie_nom FROM produits p LEFT JOIN categories c ON p.categorie_id = c.id ORDER BY p.date_ajout DESC");
        $produits = $stmt->fetchAll();
    } catch (PDOException $e) {
        die("Erreur lors de la récupération de la liste complète des produits : " . $e->getMessage());
    }
}


// Récupération du produit individuel si ID dans l'URL
$produitDetail = null;
if (!empty($_GET['id']) && is_numeric($_GET['id'])) {
    try {
        $stmt = $pdo->prepare("SELECT p.*, c.nom AS categorie_nom 
                               FROM produits p 
                               LEFT JOIN categories c ON p.categorie_id = c.id 
                               WHERE p.id = ?");
        $stmt->execute([$_GET['id']]);
        $produitDetail = $stmt->fetch();
    } catch (PDOException $e) {
        die("Erreur lors de la récupération du produit : " . $e->getMessage());
    }
}

include_once 'app/views/produits.php';
include_once 'app/views/common/footer.php';
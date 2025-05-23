<?php
// api/api_get_products.php

require_once '../config.php'; 

// Définir l'en-tête pour la réponse JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Permet les appels depuis n'importe quel domaine (pour le développement). Pour la production, restreignez-le.

try {
    // Préparer la requête SQL - AJOUT DE LA COLONNE 'stock'
    $sql = "SELECT id, nom, prix, image_url, stock FROM produits ORDER BY id ASC"; // Ou un autre ordre que vous préférez
    
    $stmt = $pdo->query($sql);
    
    $products = [];
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) { // Utiliser FETCH_ASSOC pour plus de clarté
        $formatted_price = number_format((float)$row['prix'], 2, '.', '') . ' €';

        $products[] = [
            'id' => (int)$row['id'],
            'nom' => $row['nom'],
            'prix' => $formatted_price, // Garder le prix comme un nombre pour les calculs JS
            'img' => $row['image_url'],  // Renommé 'img' pour correspondre à ce que le JS attend
            'stock' => (int)$row['stock']
        ];
    }
    
    echo json_encode($products);
    
} catch (PDOException $e) {
    http_response_code(500); // Erreur serveur
    echo json_encode(['error' => "Erreur de base de données : " . $e->getMessage()]);
}
?>
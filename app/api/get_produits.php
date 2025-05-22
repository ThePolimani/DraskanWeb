<?php
// api/api_get_products.php

// Inclure le fichier de configuration
require_once '../config.php'; 

// Définir l'en-tête pour la réponse JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Permet les appels depuis n'importe quel domaine (pour le développement). Pour la production, restreignez-le.

try {
    // Préparer la requête SQL
    $sql = "SELECT id, nom, prix, image_url FROM produits ORDER BY id ASC"; // Ou un autre ordre que vous préférez
    
    $stmt = $pdo->query($sql);
    
    $products = [];
    
    while ($row = $stmt->fetch()) {
        // Formater le prix pour inclure le symbole € et assurer deux décimales
        $formatted_price = number_format((float)$row['prix'], 2, '.', '') . ' €';

        $products[] = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'prix' => $formatted_price, // Prix formaté
            'img' => $row['image_url']   // Renommé 'img' pour correspondre à ce que le JS attend
        ];
    }
    
    echo json_encode($products);
    
} catch (PDOException $e) {
    http_response_code(500); // Erreur serveur
    echo json_encode(['error' => "Erreur de base de données : " . $e->getMessage()]);
}
?>
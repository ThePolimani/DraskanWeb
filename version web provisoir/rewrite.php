<?php
// Récupérer l'URL actuelle
$request_uri = $_SERVER['REQUEST_URI'];

// Convertir l'URL en minuscules
$lowercase_uri = strtolower($request_uri);

// Vérifier si l'URL est différente de la version en minuscules
if ($request_uri !== $lowercase_uri) {
    // Rediriger vers l'URL en minuscules
    header('Location: ' . $lowercase_uri, true, 301);
    exit;
}
?>

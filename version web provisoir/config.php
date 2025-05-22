<?php
$host = 'localhost';
$dbname = 'cdce5547_2025_draskan';
$username = 'cdce5547_admin_sql_draskan'; // Change selon ton setup
$password = 'MMI4ever@BDD'; // Change selon ton setup

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}
?>
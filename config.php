<?php
//define('DB_HOST', 'vamrosr800.mysql.db');
///define('DB_USER', 'vamrosr800');
//define('DB_PASS', 'SQLDBbiere64285');
//define('DB_NAME', 'vamrosr800');

$host = 'vamrosr800.mysql.db';
$dbname = 'vamrosr800';
$username = 'vamrosr800'; // Change selon ton setup
$password = 'SQLDBbiere64285'; // Change selon ton setup

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}
?>
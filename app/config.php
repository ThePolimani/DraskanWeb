<?php
$host = 'vamrosr800.mysql.db';
$dbname = 'vamrosr800';
$username = 'vamrosr800';
$password = 'SQLDBbiere64285';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}

define('ENCRYPTION_KEY', 'votre_cle_secrete_32_caracteres_123456');

// Fonction de chiffrement
function encryptEmail($email) {
    $method = 'aes-256-cbc';
    $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length($method));
    $encrypted = openssl_encrypt($email, $method, ENCRYPTION_KEY, 0, $iv);
    return base64_encode($iv . $encrypted);
}

// Fonction de déchiffrement
function decryptEmail($encryptedEmail) {
    $method = 'aes-256-cbc';
    $data = base64_decode($encryptedEmail);
    $iv = substr($data, 0, openssl_cipher_iv_length($method));
    $encrypted = substr($data, openssl_cipher_iv_length($method));
    return openssl_decrypt($encrypted, $method, ENCRYPTION_KEY, 0, $iv);
}

// Vérifie si un email (chiffré) est dans la liste de désinscription
function isUnsubscribed($email) {
    global $pdo;
    $encryptedEmail = encryptEmail($email);
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM unsub WHERE email = :encryptedEmail");
    $stmt->bindParam(':encryptedEmail', $encryptedEmail, PDO::PARAM_STR);
    $stmt->execute(); 
    return $stmt->fetchColumn() > 0;
}
?>
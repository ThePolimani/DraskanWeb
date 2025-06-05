<?php
require_once 'app/config.php';

$encryptedEmail = $_GET['e'] ?? null;

if (!$encryptedEmail) {
    die('Paramètre manquant');
}

try {
    $email = decryptEmail($encryptedEmail);
    
    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        die('Email invalide après déchiffrement');
    }

    global $pdo;
    
    // On vérifie avec l'email chiffré
    $stmt = $pdo->prepare("SELECT email FROM unsub WHERE email = :encryptedEmail");
    $stmt->bindParam(':encryptedEmail', $encryptedEmail);
    $stmt->execute();
    
    if ($stmt->fetch() === false) {
        // Ajoute à la liste de désinscription (email chiffré)
        $stmt = $pdo->prepare("INSERT INTO unsub (email, date_unsub) VALUES (:encryptedEmail, NOW())");
        $stmt->bindParam(':encryptedEmail', $encryptedEmail);
        $stmt->execute();
        $message = "Votre adresse email a été ajoutée à notre liste de désinscription.";
    } else {
        $message = "Votre adresse email était déjà dans notre liste de désinscription.";
    }
} catch(Exception $e) {
    die('Erreur: '.$e->getMessage());
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Désinscription confirmée</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2c3e50; }
        p { margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>Désinscription</h1>
    <p><?php echo htmlspecialchars($message); ?></p>
    <p>Pour toute demande de suppression complète de vos données, veuillez contacter l'administrateur du site.</p>
</body>
</html>
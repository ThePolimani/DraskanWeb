<?php
header('Content-Type: application/json');
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? null;

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email invalide']);
    exit;
}

if (isUnsubscribed($email)) {
    echo json_encode([
        'error' => 'Cet email a demandé à ne plus recevoir de messages',
        'blocked' => true
    ]);
    exit;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Inclure les fichiers de PHPMailer
require 'PHPMailer-master/src/Exception.php';
require 'PHPMailer-master/src/PHPMailer.php';
require 'PHPMailer-master/src/SMTP.php';

// Créer une instance de PHPMailer
$mail = new PHPMailer(true);

try {
    // Paramètres du serveur SMTP OVH
    $mail->isSMTP();
    $mail->Host = 'ssl0.ovh.net';
    $mail->SMTPAuth = true;
    $mail->Username = 'noreply@vamros.net';
    $mail->Password = 'NoReplyVE*1068711Vamros';
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;

    // Informations de l'expéditeur
    $mail->setFrom('noreply@vamros.net', 'Draskan');
    
    // Destinataire
    $mail->addAddress($email);

    // Contenu de l'e-mail
    $mail->isHTML(true);
    $mail->CharSet = 'UTF-8';
    $mail->Subject = 'Newsletter Draskan';
    $mail->Body = '
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Newsletter Draskan</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0 auto;
            padding: 20px;
            width: 100%;
        }
        .container {
            background-color: #e6cfad;
            border-radius: 12px;
            padding: 20px;
            width: 60%;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #69362d;
            padding-bottom: 10px;
        }
        .header img {
            width: 200px;
            height: auto;
        }
        h1 {
            margin: 0;
        }
        .content {
            padding: 20px 0;
        }
        .footer {
            font-size: 12px;
            color: #777;
            text-align: center;
            border-top: 2px solid #69362d;
            padding-top: 10px;
        }
        .unsubscribe {
            color: #f10000;
            font-size: 14px;
        }
        @media (max-width: 740px) {
            .container {
                width: 90%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Newsletter Draskan</h1>
            <img src="https://draskan.2025.mmibut1.org/public/images/draskan_texte_logo.png" alt="Logo Draskan">
        </div>

        <div class="content">
            <p>Ceci est une preuve de concept pour la newsletter de Draskan, démontrant la capacité à envoyer des emails depuis notre site web.</p>
            <p>Merci pour votre intérêt pour notre projet !</p>
            <p><strong>- L\'équipe Draskan</strong></p>
        </div>

        <div class="footer">
            <p class="unsubscribe">
                Vous avez déjà reçu cet email ? <a href="#">Ne plus recevoir cette communication</a>
            </p>
            <p>© 2025 Draskan - Tous droits réservés</p>
        </div>
    </div>
</body>
</html>
';
    $mail->AltBody = 'newsletter Draskan - Ceci est une preuve de concept pour la newsletter de Draskan.';

    // Envoyer l'e-mail
    $mail->send();
    echo json_encode([
        'success' => true,
        'message' => 'Email envoyé avec succès',
        'email' => $email
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Erreur lors de l\'envoi de l\'email',
        'email' => $email
    ]);
}
?>
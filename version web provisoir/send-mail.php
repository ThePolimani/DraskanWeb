<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Inclure le fichier de configuration
require_once 'app/config.php';

// Vérifier si la requête est une soumission de formulaire
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Récupérer l'email depuis le formulaire
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Adresse email invalide']);
        exit;
    }

    // Vérifier si l'email est dans la liste unsub
    try {
        if (isUnsubscribed($email)) {
            http_response_code(403);
            echo json_encode(['error' => 'Cet email est désinscrit et ne peut pas recevoir de messages']);
            exit;
        }

        require 'PHPMailer-master/src/Exception.php';
        require 'PHPMailer-master/src/PHPMailer.php';
        require 'PHPMailer-master/src/SMTP.php';

        $mail = new PHPMailer(true);

        $unsubscribeLink = 'https://vamros.net/draskan/unsubscribe?e=' . urlencode(encryptEmail($email));

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
                Vous ne souhaitez plus recevoir nos emails ? 
                <a href="'.$unsubscribeLink.'">Cliquez ici pour vous désinscrire</a>
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

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur de base de données: ' . $e->getMessage()]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur lors de l\'envoi de l\'email: ' . $e->getMessage()]);
    }
    exit;
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Envoi de Newsletter</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 500px;
            margin: 0 auto;
            padding: 20px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
        }
        input[type="email"] {
            width: 100%;
            padding: 8px;
            box-sizing: border-box;
        }
        button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 15px;
            border: none;
            cursor: pointer;
        }
        button:hover {
            background-color: #45a049;
        }
        #response {
            margin-top: 15px;
            padding: 10px;
            border-radius: 4px;
        }
        .success {
            background-color: #dff0d8;
            color: #3c763d;
        }
        .error {
            background-color: #f2dede;
            color: #a94442;
        }
    </style>
</head>
<body>
    <h1>Envoi de Newsletter</h1>
    <form id="emailForm">
        <div class="form-group">
            <label for="email">Adresse Email:</label>
            <input type="email" id="email" name="email" required>
        </div>
        <button type="submit">Envoyer</button>
    </form>
    <div id="response"></div>

    <p>page en développement, plus d'informations bientôt.</p>

    <script>
        document.getElementById('emailForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const responseDiv = document.getElementById('response');
            
            fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `email=${encodeURIComponent(email)}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    responseDiv.className = 'success';
                    responseDiv.textContent = data.message;
                } else {
                    responseDiv.className = 'error';
                    responseDiv.textContent = data.error || 'Une erreur est survenue';
                }
            })
            .catch(error => {
                responseDiv.className = 'error';
                responseDiv.textContent = 'Erreur lors de la communication avec le serveur';
            });
        });
    </script>
</body>
</html>
<?php
require 'config.php'; // Fichier de configuration contenant la connexion à la base de données

// Récupérer les catégories
$categories = $pdo->query("SELECT id, nom FROM categories")->fetchAll(PDO::FETCH_ASSOC);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nom = $_POST['nom'] ?? '';
    $description = $_POST['description'] ?? '';
    $prix = $_POST['prix'] ?? 0;
    $volume_ml = $_POST['volume_ml'] ?? 0;
    $alcool_pct = $_POST['alcool_pct'] ?? 0;
    $image_url = $_POST['image_url'] ?? '';
    $stock = $_POST['stock'] ?? 0;
    $categorie_id = $_POST['categorie_id'] ?? null;
    $format = $_POST['format'] ?? '';

    if ($nom && $prix > 0 && $volume_ml > 0 && $alcool_pct >= 0 && $categorie_id && $format) {
        $stmt = $pdo->prepare("INSERT INTO produits (nom, description, prix, volume_ml, alcool_pct, image_url, stock, categorie_id, format) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$nom, $description, $prix, $volume_ml, $alcool_pct, $image_url, $stock, $categorie_id, $format]);
        
        header("Location: " . $_SERVER['PHP_SELF'] . "?success=1");
        exit;
    } else {
        $error = "Veuillez remplir tous les champs obligatoires.";
    }
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ajouter une Bière</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        form { max-width: 400px; margin: auto; }
        input, select, textarea { display: block; width: 100%; margin-bottom: 10px; min-height: 30px; }
        button { background: #28a745; color: white; padding: 10px; border: none; cursor: pointer; }
        h2 { text-align: center; margin-top: 50px;}
        .message { color: green; text-align: center;}
        .error { color: red; }
    </style>
</head>
<body>
    <h2>Ajouter une Bière</h2>
    
    <?php if (isset($_GET['success'])) : ?>
        <p class="message">Bière ajoutée avec succès !</p>
    <?php endif; ?>
    
    <?php if (!empty($error)) : ?>
        <p class="error"><?= htmlspecialchars($error) ?></p>
    <?php endif; ?>
    
    <form method="post">
        <label>Nom :</label>
        <input type="text" name="nom" required>

        <label>Description :</label>
        <textarea name="description"></textarea>

        <label>Prix (€) :</label>
        <input type="number" name="prix" step="0.01" required>

        <label>Volume (ml) :</label>
        <input type="number" name="volume_ml" required>

        <label>Taux d'alcool (%) :</label>
        <input type="number" name="alcool_pct" step="0.1" required>

        <label>Image URL :</label>
        <input type="text" name="image_url">

        <label>Stock :</label>
        <input type="number" name="stock" required>

        <label>Catégorie :</label>
        <select name="categorie_id" required>
            <option value="">Sélectionner une catégorie</option>
            <?php foreach ($categories as $categorie) : ?>
                <option value="<?= $categorie['id'] ?>"><?= htmlspecialchars($categorie['nom']) ?></option>
            <?php endforeach; ?>
        </select>

        <label>Format :</label>
        <input type="text" name="format" required>

        <button type="submit">Ajouter</button>
    </form>
</body>
</html>

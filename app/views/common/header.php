<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <base href="<?= rtrim(dirname($_SERVER['SCRIPT_NAME']), '/') . '/' ?>"> <!-- Base URL dynamique pour les index -->
    <title>Draskan</title>
	<meta name="description" content="Draskan : La Nature au bout des lèvres. Voir la liste de nos produits.">
	<meta name="keywords" content="Bière, Draskan, alcool, Bière Viking">
	<link rel="icon" href="public/images/favicon.png" type="image/x-icon">
	<link rel="stylesheet" href="public/styles/verifage.css">
    <link rel="stylesheet" href="public/styles/main.css">
    <?php if (!empty($pageSpecificCSS)): ?>
        <link rel="stylesheet" href="public/styles/<?= $pageSpecificCSS ?>">
    <?php endif; ?>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Lancelot&display=swap" rel="stylesheet">
    <script src="public/scripts/verifage.js"></script>
    <script src="public/scripts/main.js"></script>
	<link rel="apple-touch-icon" href="/app-icon.png">
</head>
<body>
    <div id="ageVerificationModal">
        <div id="ageVerificationContent" class="animatedList" data-animation="fadeIn" data-delay-step="0.05">
            <h2>Vérification d'âge</h2>
            <p>Pour accéder à notre site, veuillez confirmer votre âge:</p>
            
            <label for="birthMonth">Mois de naissance:</label>
            <select id="birthMonth">
                <option value="">-- Sélectionnez --</option>
                <option value="0">Janvier</option>
                <option value="1">Février</option>
                <option value="2">Mars</option>
                <option value="3">Avril</option>
                <option value="4">Mai</option>
                <option value="5">Juin</option>
                <option value="6">Juillet</option>
                <option value="7">Août</option>
                <option value="8">Septembre</option>
                <option value="9">Octobre</option>
                <option value="10">Novembre</option>
                <option value="11">Décembre</option>
            </select>
            
            <label for="birthYear">Année de naissance:</label>
            <select id="birthYear">
                <option value="">-- Sélectionnez --</option>
                <!-- Les options seront générées par JavaScript -->
            </select>
            
            <div id="ageError" class="error"></div>
            <button id="confirmAge">Confirmer</button>
        </div>
    </div>

    <header class="animatedList" data-animation="fadeIn" data-reset-delay data-leaf-only>
        <a href=""><img src="public/images/draskan_texte_logo_blanc.png" alt="Logo Draskan" title="Accueil" id="logo_header"></a>
        <nav>
            <a href="produits.html" id="link_produits">Produits</a>
            <a href="partenaires.html" id="link_partenaires">Partenaires</a>
            <a href="contact.html" id="link_contact">Nous Contactez</a>
        </nav>
        <div id="tools">
            <input type="text" id="search" placeholder="Rechercher...">
            <button id="searchButton"><img src="public/images/icon-recherche.svg" alt=""></button>
            <a href="newsletter.html"><img src="public/images/icon-email.svg" alt="Newsletter" title="Newsletter" id="newsletter"></a>
            <button id="panier"><img src="public/images/icon_panier.png" alt="Panier" title="Panier"></button>
        </div>
    </header>
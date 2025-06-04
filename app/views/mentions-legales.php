<main class="animatedList" data-animation="fadeInLeftLess" data-reset-delay data-leaf-only data-delay-step="0.05">
    <h2>Mentions légales</h2>
    <h3>Éditeur du site</h3>
    <p>Le présent site est édité par :<br>
        Draskan<br>
        Nom du responsable : Mattéo Barbedette<br>
        Adresse : 36 Rue Georges Charpak, 77127 Lieusaint<br>
        Email : contact@draskan.fr<br>
        Numéro SIRET : 812 345 678 00129<br>
    </p>

    <h3>Hébergeur</h3>
    <p>Le site est hébergé par :<br>
        o2switch<br>
        222-224 Boulevard Gustave Flaubert<br>
        63000 Clermont-Ferrand - France<br>
        SAS au capital de 100 000 €<br>
        SIRET : 510 909 80700024<br>
        RCS Clermont-Ferrand<br>
        Téléphone : 04 44 44 60 40<br>
        Site : https://www.o2switch.fr<br>
    </p>

    <h3>Propriété intellectuelle</h3>
    <p>Le contenu du site Draskan (textes, images, graphismes, logo, etc.) est protégé par le droit d’auteur. Toute reproduction ou représentation, totale ou partielle, sans autorisation écrite est interdite.</p>

    <h3>Responsabilité</h3>
    <p>Les informations présentes sur le site sont fournies à titre indicatif. Bien que nous essayons de les maintenir à jour, nous ne garantissons pas leur exactitude ou leur exhaustivité.<br>
        La consommation d’alcool est interdite aux mineurs. En visitant ce site, vous certifiez avoir l’âge légal dans votre pays pour consommer de l’alcool.<br>
        L’abus d’alcool est dangereux pour la santé. À consommer avec modération.
    </p>

    <h3>Données personnelles</h3>
    <p>Nous ne collectons aucune donnée personnelle sans votre consentement.<br>
        Un système de newsletter est proposé :
        Lors de l’inscription, seul votre adresse e-mail est enregistrée.
        Cette adresse est utilisée uniquement pour envoyer un unique e-mail de démonstration (aucun envoi commercial ou régulier).
        Aucun suivi, aucune lecture ni exploitation des données n’est effectuée.
        Vous pouvez demander la suppression de votre e-mail à tout moment en nous contactant (voir section "Contact").
        Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d’un droit d’accès, de rectification et de suppression de vos données.
    </p>

    <h3>Cookies</h3>
    <p>Le site n’utilise aucun cookie de suivi ou de publicité.<br>
        Seul un cookie technique peut être utilisé pour éviter les inscriptions multiples à la newsletter (fonction cosmétique uniquement).
    </p>

    <h3>Contact</h3>
    <p>Pour toute question, demande ou signalement, vous pouvez nous écrire à :<br>
        contact@draskan.fr
    </p>

    <h3>Nos partenaires</h3>
    <p>Dans le cadre de notre développement, nous avons établi des partenariats avec d'autres marques ou projets.
        Ces partenariats ont pour but de renforcer la visibilité et la crédibilité mutuelle de nos activités.<br>
        Chaque partenaire dispose de son propre site internet ou espace de communication.
        Nous ne sommes pas responsables du contenu publié sur leurs plateformes, ni des éventuelles pratiques commerciales qu'ils appliquent.<br>
        Les noms de nos partenaires sont affichés ci-dessous et peuvent être mis à jour à tout moment selon les accords en cours.<br>
    </p>
    <?php
        if (count($partenaires) > 0) {
                echo "<div id=\"partenaires\">";
            foreach ($partenaires as $partenaire) {
                $nom = htmlspecialchars($partenaire['nom']);
                $url = htmlspecialchars($partenaire['site_url']);
                echo "<a href=\"$url\" target=\"_blank\" rel=\"noopener noreferrer\"><p>$nom</p></a>";
            }
            echo "</div>";
        } else {
            echo "<p>Aucun partenaire n'est enregistré pour le moment.</p>";
        }
    ?>
</main>
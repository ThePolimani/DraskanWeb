<main>
    <div id="accueil_1">
        <div class="animatedList" data-animation="fadeInLeft" >
            <h1>DRASKAN</h1>
            <a href="produits"><p>Afficher les produits</p></a>
        </div>
        <img src="public/images/bouteille_mockup.png" alt="Bouteille Draskan" class="animated no-select" data-animation="fadeInRight" data-start-delay="1">
    </div>
    <div id="accueil_2">
        <h2 class="animated" data-animation="fadeInLeft">Nos Produits :</h2>

        <div class="carousel-container" id="carouselContainer">
            <div class="carousel" id="carousel">
                <div class="loading-message">Chargement des produits...</div>
            </div>

            <div class="carousel-nav animated" data-animation="fadeIn" data-reset-delay>
                <button id="prevBtn" aria-label="Produit précédent" disabled>&#10094;</button>
                <button id="nextBtn" aria-label="Produit suivant" disabled>&#10095;</button>
            </div>
        </div>
    </div>
    
    <div id="accueil_3" class="animatedList" data-animation="fadeInLeft" data-reset-delay data-leaf-only>
        <h2>Notre histoire :</h2>
        <div>
            <p>Dans une contrée nordique balayée par les vents, les forêts profondes cachent un secret ancestral. Là, 
                entre les pins imposants, une clairière abrite une source d’eau pure, encadrée de menthe sauvage et de 
                citronniers rares. La légende raconte qu’un vent particulier, appelé Draskan, traverse ces bois, apportant 
                fraîcheur et énergie. Un groupe de Vikings, cherchant un breuvage à la hauteur de leur courage et de leurs 
                terres, s’arrêta dans cette clairière magique. Inspirés par l’arôme des pins, la vivacité du citron vert 
                et la fraîcheur éclatante de la menthe, ils brassèrent une bière unique. À chaque gorgée de Draskan, 
                c’est comme si l’on sentait ce vent nordique caresser la peau, éveillant les sens avec sa force et sa fraîcheur.
            </p>
            <img src="public/images/font_toneau.jpg" alt="Image de tonneau" aria-hidden="true" data-animation="fadeInRight" class="animated">
        </div>
    </div>
    <div id="accueil_4" class="animatedList" data-animation="fadeInLeft" data-reset-delay data-leaf-only>
        <h2>Nos Partenaires :</h2>
        <div class="partners">
            <?php foreach ($partenaires as $partenaire): ?>
            <div class="partner-card">
                <a href="partenaires"><img src="<?= htmlspecialchars($partenaire['logo_url']) ?>" alt="<?= htmlspecialchars($partenaire['nom']) ?>" class="partner-logo" /></a>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
    <div id="accueil_5" class="animatedList" data-animation="fadeInLeft" data-reset-delay data-leaf-only>
        
</main>
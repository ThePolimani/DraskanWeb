<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <base href="<?= rtrim(dirname($_SERVER['SCRIPT_NAME']), '/') . '/' ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bouteille 3D avec Three.js</title>
    <style>
        body { margin: 0; overflow: hidden; background-color: #f0f0f0; }
        #container3D {
            width: 100vw;
            height: 100vh;
            display: block;
        }
    </style>
</head>
<body>

    <div id="container3D"></div>

    <script type="importmap">
        {
            "imports": {
                "three": "https://unpkg.com/three@0.164.1/build/three.module.js",
                "three/addons/": "https://unpkg.com/three@0.164.1/examples/jsm/"
            }
        }
    </script>

    <script type="module">
        import * as THREE from 'three';
        import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // Optionnel, pour le contrôle manuel

        let scene, camera, renderer, bottleModel, controls;

        function init() {
            // 1. Scène
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xdddddd); // Couleur de fond

            // 2. Caméra
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 1.5, 4); // Ajustez ces valeurs en fonction de la taille de votre modèle

            // 3. Renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio); // Pour une meilleure qualité sur les écrans haute résolution
            document.getElementById('container3D').appendChild(renderer.domElement);

            // 4. Lumières
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Lumière ambiante douce
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // Lumière directionnelle plus forte
            directionalLight.position.set(5, 10, 7.5);
            scene.add(directionalLight);

            // 5. Chargement du modèle GLTF
            const loader = new GLTFLoader();
            loader.load(
                'blend.glb', // REMPLACEZ CECI par le chemin vers votre modèle
                function (gltf) {
                    bottleModel = gltf.scene;

                    // Optionnel : Ajuster la taille et la position du modèle si nécessaire
                    bottleModel.scale.set(15, 15, 15);
                    bottleModel.position.y = -10; // Pour centrer verticalement si le pivot est à la base

                    // Optionnel : Centrer le modèle (peut nécessiter des ajustements)
                    const box = new THREE.Box3().setFromObject(bottleModel);
                    const center = box.getCenter(new THREE.Vector3());
                    bottleModel.position.sub(center); // Centre le modèle à l'origine

                    scene.add(bottleModel);
                    animate(); // Démarrer l'animation une fois le modèle chargé
                },
                function (xhr) {
                    console.log((xhr.loaded / xhr.total * 100) + '% chargé');
                },
                function (error) {
                    console.error('Une erreur est survenue lors du chargement du modèle :', error);
                    // Afficher un message d'erreur à l'utilisateur ou un modèle de secours
                    const geometry = new THREE.BoxGeometry(1, 2, 0.5); // Cube de remplacement
                    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
                    const fallbackCube = new THREE.Mesh(geometry, material);
                    scene.add(fallbackCube);
                    bottleModel = fallbackCube; // Pour que l'animation fonctionne sur le cube
                    animate();
                }
            );

            // 6. Contrôles Orbit (Optionnel, pour interagir avec la souris)
             controls = new OrbitControls(camera, renderer.domElement);
             controls.enableDamping = true; // Effet de lissage
             controls.dampingFactor = 0.05;
             controls.screenSpacePanning = false;
             controls.minDistance = 2;
             controls.maxDistance = 10;
             controls.target.set(0, 0, 0); // Viser le centre de la scène ou du modèle

            // Gestion du redimensionnement de la fenêtre
            window.addEventListener('resize', onWindowResize, false);
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function animate() {
            requestAnimationFrame(animate);

            // Rotation de la bouteille
            if (bottleModel) {
                bottleModel.rotation.y += 0.005; // Ajustez la vitesse de rotation ici
            }

            // if (controls) { // Si vous utilisez OrbitControls
            //     controls.update();
            // }

            renderer.render(scene, camera);
        }

        // Lancer l'initialisation
        init();

    </script>
</body>
</html>
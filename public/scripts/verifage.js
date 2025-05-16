// Vérifie si la vérification d'âge a déjà été faite dans cette session
document.addEventListener('DOMContentLoaded', function() {
    if (!sessionStorage.getItem('ageVerified')) {
        showAgeVerification();
        document.body.style.overflow = "hidden";
    }
});

function showAgeVerification() {
    const modal = document.getElementById('ageVerificationModal');
    modal.style.display = 'flex';
    
    // Remplir les années (de l'année actuelle à 100 ans en arrière)
    const yearSelect = document.getElementById('birthYear');
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear; year >= currentYear - 100; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    
    // Gestion du bouton de confirmation
    document.getElementById('confirmAge').addEventListener('click', verifyAge);
}

function verifyAge() {
    const month = document.getElementById('birthMonth').value;
    const year = document.getElementById('birthYear').value;
    const errorElement = document.getElementById('ageError');
    
    // Validation
    if (!month || !year) {
        errorElement.textContent = 'Veuillez sélectionner le mois et l\'année';
        return;
    }
    
    // Calcul de l'âge
    const currentDate = new Date();
    const birthDate = new Date(year, month, 1);
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    
    // Ajuster si l'anniversaire n'est pas encore arrivé cette année
    if (currentDate.getMonth() < birthDate.getMonth()) {
        age--;
    }
    
    // Vérifier si l'utilisateur a au moins 18 ans
    if (age >= 18) {
        // Stocker en session pour ne pas redemander
        sessionStorage.setItem('ageVerified', 'true');
        document.getElementById('ageVerificationModal').style.display = 'none';
        document.body.style.overflow = "";
        location.reload();
    } else {
        errorElement.textContent = 'Désolé, vous devez avoir au moins 18 ans pour accéder à ce site.';
        // Redirection ou autre action pour les mineurs
        // window.location.href = "https://www.google.com";
    }
}
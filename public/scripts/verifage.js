document.addEventListener('DOMContentLoaded', function() {
    // 1. Bloquer les animations des sections principales
    document.querySelectorAll('header, main, footer').forEach(section => {
        section.classList.add('prevent-animations');
    });
    
    if (!sessionStorage.getItem('ageVerified')) {
        showAgeVerification();
        document.body.style.overflow = "hidden";
    } else {
        // Si déjà vérifié, on débloque tout
        removeAnimationBlock();
    }
});

function showAgeVerification() {
    const modal = document.getElementById('ageVerificationModal');
    modal.style.display = 'flex';
    
    // Remplir les années
    const yearSelect = document.getElementById('birthYear');
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear; year >= currentYear - 100; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    
    document.getElementById('confirmAge').addEventListener('click', verifyAge);
}

function removeAnimationBlock() {
    document.querySelectorAll('header, main, footer').forEach(section => {
        section.classList.remove('prevent-animations');
    });
}

function verifyAge() {
    const month = document.getElementById('birthMonth').value;
    const year = document.getElementById('birthYear').value;
    const errorElement = document.getElementById('ageError');
    
    if (!month || !year) {
        errorElement.textContent = 'Veuillez sélectionner le mois et l\'année';
        return;
    }
    
    const currentDate = new Date();
    const birthDate = new Date(year, month, 1);
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    
    if (currentDate.getMonth() < birthDate.getMonth()) {
        age--;
    }
    
    if (age >= 18) {
        sessionStorage.setItem('ageVerified', 'true');
        document.getElementById('ageVerificationModal').style.display = 'none';
        document.body.style.overflow = "";
        
        // Débloquer les animations
        removeAnimationBlock();
    } else {
        errorElement.textContent = 'Désolé, vous devez avoir au moins 18 ans pour accéder à ce site.';
    }
}
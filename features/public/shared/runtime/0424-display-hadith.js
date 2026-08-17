// Runtime slice from daawah.js: displayHadith.
function displayHadith(hadith, position, total) {
    const textElement = document.getElementById('hadithText');
    const referenceElement = document.getElementById('hadithReference');
    const translationElement = document.getElementById('hadithTranslation');
    const counterElement = document.getElementById('hadithCounter');
    const totalElement = document.getElementById('hadithTotal');

    if (!hadith) {
        if (textElement) textElement.textContent = 'No hadith has been added yet.';
        if (referenceElement) referenceElement.textContent = '';
        if (translationElement) translationElement.textContent = '';
        if (counterElement) counterElement.textContent = '0';
        if (totalElement) totalElement.textContent = '0';
        currentHadithIndex = 0;
        return;
    }

    if (textElement) {
        textElement.textContent = hadith.arabic || 'Hadith not found';
        textElement.style.animation = 'none';
        setTimeout(() => {
            textElement.style.animation = 'welcomeFadeInScale 0.6s ease-out';
        }, 10);
    }

    if (referenceElement) {
        referenceElement.textContent = hadith.reference || '';
    }

    if (translationElement) {
        translationElement.textContent = hadith.english ? `Translation: ${hadith.english}` : 'Translation not available';
    }

    if (counterElement) {
        counterElement.textContent = position;
    }

    if (totalElement) {
        totalElement.textContent = total;
    }

    currentHadithIndex = position - 1;
}

// Navigate to next hadith

let currentSection = 1;

function nextSection(section) {
    if (!validateSection(section)) return;

    document.getElementById(`section${section}`).classList.remove('active');
    document.getElementById(`section${section + 1}`).classList.add('active');

    currentSection++;
    updateProgress();
    scrollToTop();

    if (section === 5) showReview();
}

function previousSection(section) {
    document.getElementById(`section${section + 1}`).classList.remove('active');
    document.getElementById(`section${section}`).classList.add('active');

    currentSection--;
    updateProgress();
    scrollToTop();
}

function validateSection(section) {
    let valid = true;
    let firstInvalid = null;
    let inputs = document.querySelectorAll(`#section${section} input, #section${section} select`);

    inputs.forEach(input => {
        let errorDiv = document.getElementById(`error-${input.name}`);

        // Reset styles and errors first
        input.classList.remove('invalid');
        if (errorDiv) errorDiv.textContent = '';

        if (input.required && !input.checkValidity()) {
            if (errorDiv) errorDiv.textContent = input.title || 'This field is required';
            input.classList.add('invalid');

            if (!firstInvalid) firstInvalid = input;
            valid = false;
        }
    });

    // Scroll to first invalid field if any
    if (!valid && firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return valid;
}

function updateProgress() {
    const progress = document.getElementById('progress');
    progress.style.width = `${(currentSection / 6) * 100}%`;

    const stepIndicator = document.getElementById('stepIndicator');
    stepIndicator.textContent = `Step ${currentSection} of 6`;
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showReview() {
    const formData = new FormData(document.getElementById('wifeApplication'));
    let reviewHtml = '<ul style="list-style: none; padding-left: 0;">';

    formData.forEach((value, key) => {
        // Beautify key text
        let label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

        // Hide empty optional values
        if (value.trim() === '') value = '<em>(Not provided)</em>';

        reviewHtml += `<li style="margin-bottom: 8px;"><strong>${label}:</strong> ${value}</li>`;
    });

    reviewHtml += '</ul>';
    document.getElementById('reviewContent').innerHTML = reviewHtml;
}

document.getElementById('wifeApplication').addEventListener('submit', async function (e) {
    e.preventDefault();

    let flag = false;

    if (!validateSection(currentSection)) return;

    const formData = new FormData(this);
    let data = {};
    formData.forEach((value, key) => {
        data[key] = value;
        document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365 * 100}`; // 100 years
    });

    // Validate all sections before proceeding
    if (!flag){
        await generatePDF(data);
        flag = true;

    }
    

    // Show modal instead of alert
    const modal = document.getElementById('successModal');
    modal.style.display = 'block';

    function closeModal() {
        modal.style.display = 'none';
        // document.getElementById('wifeApplication').reset();
        
        location.reload(); // Cookies remain
    }

    document.getElementById('modalOk').onclick = closeModal;
    document.getElementById('closeModal').onclick = closeModal;

    
        if (event.target == modal) {
            closeModal();
        }
    
});

async function generatePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add a pink heart icon (unicode)
    doc.setFontSize(24);
    doc.setTextColor('#e91e63');
    doc.text('PP', 20, 20);

    // Title
    doc.setFontSize(22);
    doc.setTextColor('#c2185b');
    doc.setFont('helvetica', 'bold');
    doc.text('Future Wife Application Summary', 40, 25);

    // Draw a decorative line below title
    doc.setDrawColor('#e91e63');
    doc.setLineWidth(0.5);
    doc.line(20, 30, 190, 30);

    let y = 40;
    doc.setFontSize(14);
    doc.setTextColor('#444');
    doc.setFont('helvetica', 'normal');

    for (let key in data) {
        let label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        let text = `${label}: ${data[key] || '(Not provided)'}`;

        let splitText = doc.splitTextToSize(text, 170);
        doc.text(splitText, 20, y);
        y += splitText.length * 8 + 5;

        if (y > 280) {
            doc.addPage();
            y = 20;
        }
    }

    // Add a romantic closing message
    doc.setFontSize(16);
    doc.setTextColor('#e91e63');
    doc.setFont('helvetica', 'italic');
    doc.text('With love and best wishes for our future - PP', 20, y + 10);

    doc.save('Future_Wife_Application.pdf');
}

window.onload = () => {
    const form = document.getElementById('wifeApplication');
    const cookies = document.cookie.split('; ');

    cookies.forEach(cookie => {
        let [rawKey, rawValue] = cookie.split('=');
        let key = decodeURIComponent(rawKey.trim());
        let value = decodeURIComponent(rawValue);

        // Do not prefill signature or acceptasHusband
        if (key === 'signature' || key === 'acceptasHusband') return;

        let input = form.elements[key];
        if (input) 
            input.value = value;
    });

    // Remove signature and acceptasHusband cookies after reload
    document.cookie = 'signature=; path=/; max-age=0';
    document.cookie = 'acceptasHusband=; path=/; max-age=0';

    updateProgress();

    const firstInput = document.querySelector('#section1 input, #section1 select');
    if (firstInput) {
        firstInput.focus();
    }
};


document.addEventListener('DOMContentLoaded', function() {
        const dobInput = document.querySelector('input[name="dob"]');
        const ageInput = document.getElementById('age');
        if (dobInput && ageInput) {
            function calculateAge() {
                const dob = new Date(dobInput.value);
                if (!isNaN(dob.getTime())) {
                    const today = new Date();
                    let age = today.getFullYear() - dob.getFullYear();
                    const m = today.getMonth() - dob.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                        age--;
                    }
                    ageInput.value = age > 0 ? age : '';
                } else {
                    ageInput.value = '';
                }
            }
            dobInput.addEventListener('change', calculateAge);
            dobInput.addEventListener('input', calculateAge);
            // If dob is prefilled (from cookies), calculate age on load
            calculateAge();
        }
    });



    

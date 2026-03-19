// public/js/reports.js
function exportReport(type) {
    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    
    if (type === 'pdf') {
        btn.innerText = "Generating Document...";
        btn.disabled = true;

        // TARGET THE HIDDEN PROFESSIONAL TEMPLATE
        const element = document.getElementById('pro-report-template');
        
        // Temporarily make it visible for the capture
        element.parentElement.style.display = 'block';

        const opt = {
            margin:       [10, 10, 10, 10], // top, left, buttom, right
            filename:     'PharMediSync_Official_Report.pdf',
            image:        { type: 'jpeg', quality: 1 },
            html2canvas:  { scale: 2, logging: false, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Run download sequence
        html2pdf().set(opt).from(element).save().then(() => {
            // Re-hide it
            element.parentElement.style.display = 'none';
            btn.innerHTML = originalText;
            btn.disabled = false;
        });

    } else {
        alert("BIR Excel Template generation is processing...");
    }
}
// public/js/reports.js
function exportReport(type) {
    const btn = event.currentTarget;
    btn.innerText = "Generating...";
    btn.disabled = true;

    setTimeout(() => {
        if (type === 'pdf') {
            window.print();
        } else {
            alert("BIR 2550M Monthly VAT Return has been generated and ready for submission.");
        }
        btn.innerText = type === 'pdf' ? "📥 Export PDF" : "📊 Generate BIR 2550M";
        btn.disabled = false;
    }, 1500);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Strategic Intelligence System: Online");
    // You could add logic here to animate bars on load
});
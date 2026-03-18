document.addEventListener('DOMContentLoaded', () => {
    const switchers = [...document.querySelectorAll('.switcher')];

    switchers.forEach(item => {
        item.addEventListener('click', function () {
            // Reset all wrappers on the current page
            switchers.forEach(s => s.parentElement.classList.remove('is-active'));
            // Activate the clicked section
            this.parentElement.classList.add('is-active');
        });
    });
});
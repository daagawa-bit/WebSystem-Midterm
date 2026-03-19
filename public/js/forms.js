document.addEventListener('DOMContentLoaded', () => {
    const switchers = [...document.querySelectorAll('.switcher')];

    switchers.forEach(item => {
        item.addEventListener('click', function () {
            switchers.forEach(s => s.parentElement.classList.remove('is-active'));
            this.parentElement.classList.add('is-active');
        });
    });
});
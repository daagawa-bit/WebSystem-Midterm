// public/js/users-logic.js

/**
 * 1. Focus and Highlight the Form
 * Makes the system 'smarter' by visually guiding the admin
 */
function highlightForm() {
    const container = document.getElementById('userFormCard');
    
    // Smooth Scroll
    container.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Add CSS Animation Class
    container.classList.add('form-focus-pulse');
    
    // Remove class after animation ends (2 seconds)
    setTimeout(() => {
        container.classList.remove('form-focus-pulse');
    }, 2000);
}

/**
 * 2. Edit User Function
 */
function editUser(jsonStr) {
    const user = JSON.parse(jsonStr);
    const form = document.querySelector('#userFormCard form');
    const title = document.querySelector('#userFormCard .form-title');
    const submitBtn = document.getElementById('userSubmitBtn');
    const modeBadge = document.getElementById('formModeBadge');

    // Set action to the edit route
    form.action = '/users/edit/' + encodeURIComponent(user.email);

    // Populate fields
    form.querySelector('[name="name"]').value = user.name;
    form.querySelector('[name="email"]').value = user.email;
    form.querySelector('[name="email"]').readOnly = true;
    form.querySelector('[name="password"]').value = user.password;
    form.querySelector('[name="role"]').value = user.role;

    // Update UI
    title.innerHTML = "✏️ Modify Staff Member";
    modeBadge.innerHTML = "Modification Mode";
    modeBadge.className = "px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-black rounded-full uppercase italic";
    submitBtn.innerHTML = "Update User Account";
    
    highlightForm();
}

/**
 * 3. Reset to Create Mode
 */
function resetUserForm() {
    const form = document.querySelector('#userFormCard form');
    const title = document.querySelector('#userFormCard .form-title');
    const submitBtn = document.getElementById('userSubmitBtn');
    const modeBadge = document.getElementById('formModeBadge');

    form.action = '/users/add';
    form.reset();
    form.querySelector('[name="email"]').readOnly = false;
    
    title.innerHTML = "➕ Register New User";
    modeBadge.innerHTML = "Registration Mode";
    modeBadge.className = "px-3 py-1 bg-pharma-red-pale text-pharma-red text-[10px] font-black rounded-full uppercase italic";
    submitBtn.innerHTML = "Save Account";
    
    highlightForm();
}
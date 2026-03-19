function highlightForm() {
    const container = document.getElementById('userFormCard');
    
    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
    container.classList.add('form-focus-pulse');
    setTimeout(() => {
        container.classList.remove('form-focus-pulse');
    }, 2000);
}

function editUser(jsonStr) {
    const user = JSON.parse(jsonStr);
    const form = document.querySelector('#userFormCard form');
    const title = document.querySelector('#userFormCard .form-title');
    const submitBtn = document.getElementById('userSubmitBtn');
    const modeBadge = document.getElementById('formModeBadge');

    form.action = '/users/edit/' + encodeURIComponent(user.email);

    form.querySelector('[name="name"]').value = user.name;
    form.querySelector('[name="email"]').value = user.email;
    form.querySelector('[name="email"]').readOnly = true;
    form.querySelector('[name="password"]').value = user.password;
    form.querySelector('[name="role"]').value = user.role;

    title.innerHTML = "✏️ Modify Staff Member";
    modeBadge.innerHTML = "Modification Mode";
    modeBadge.className = "px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-black rounded-full uppercase italic";
    submitBtn.innerHTML = "Update User Account";
    
    highlightForm();
}

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
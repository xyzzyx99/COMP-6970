const form = document.getElementById('registration');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
        username: formData.get('username'),
        password: formData.get('password'),
        confirm_password: formData.get('confirm-password'),
        accessibility: formData.get('accessibility'),
    };


    if (data.password !== data.confirm_password) {
        alert("Passwords don't match");
        return;
    }


    const response = await fetch('/userCreation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    console.log(await response.text());
});

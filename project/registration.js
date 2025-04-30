const form = document.getElementById('registration');

document.getElementById('accessibility').addEventListener('change', function() {
    if (this.checked) {
        console.log('Accessibility is ON');
        //localStorage.setItem('accessibility', 'true');
        document.body.classList.add('large-font');
    } else {
        console.log('Accessibility is OFF');
       // localStorage.setItem('accessibility', 'false');
        document.body.classList.remove('large-font');
    }
});


form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const username = formData.get('username');
    const password = formData.get('password');
    const confirm_password = formData.get('confirm-password');
    const accessibility = formData.get('accessibility') ? 'on' : 'off';

    if (password !== confirm_password) {
        alert('Passwords don\'t match');
        return;
    }

    const response = await fetch('/userCreation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, accessibility })
    });

    if (response.status === 409) {
        alert('User exists!');
    } else if (response.ok) {
        alert('User registered successfully!');
        window.location.href = 'index.html';
    } else {
        alert('Registration failed!');
    }

    console.log(await response.text());
});

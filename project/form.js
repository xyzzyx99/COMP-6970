const form = document.getElementById('userForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
        username: formData.get('username'),
        email: formData.get('email')
    };

    const response = await fetch('/submitForm1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    console.log(await response.text());
});

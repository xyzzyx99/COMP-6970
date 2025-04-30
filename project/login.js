document.body.classList.add('large-font');

async function loadUsers() {
    const response = await fetch('/userRead');
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
    return xmlDoc;
}

async function checkLogin(usernameInput, passwordInput) {
    const xmlDoc = await loadUsers();

    const users = xmlDoc.getElementsByTagName('user');

    for (let user of users) {
        const username = user.getElementsByTagName('username')[0]?.textContent;
        const password = user.getElementsByTagName('password')[0]?.textContent;
        const accessibility = user.getElementsByTagName('accessibility')[0]?.textContent;

        if (username === usernameInput && password === passwordInput) {
            return true; // Found matching user
        }
    }

    return false; // No match
}

document.getElementById('login').addEventListener('submit', async (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const resultDiv = document.getElementById('result');

    const match = await checkLogin(usernameInput, passwordInput);

    if (match) {
        //window.location.href = 'success.html';

        localStorage.setItem('username', usernameInput);

        const username = localStorage.getItem('username');
        if (!username) return;

        try {
            const response = await fetch(`/userAccessibility?username=${encodeURIComponent(username)}`);
            const data = await response.json();

            let need_accessibility = 'false';

            if (data.accessibility === 'on') {
                document.body.classList.add('large-font');

                need_accessibility = 'true';

            }

            localStorage.setItem('accessibility', need_accessibility) ;

        } catch (err) {
            console.error('Failed to load accessibility setting:', err);
        }

        //const accessibility = localStorage.getItem('username');

        window.location.href = 'subjects.html';
        //resultDiv.innerHTML = `<p style="color: green;">Login successful!</p>`;
    } else {
        window.location.href = 'unsuccessful.html';
        //resultDiv.innerHTML = `<p style="color: red;">Login failed. Incorrect username or password.</p>`;
    }
});

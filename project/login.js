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
        window.location.href = 'success.html';
        //resultDiv.innerHTML = `<p style="color: green;">Login successful!</p>`;
    } else {
        window.location.href = 'unsuccessful.html';
        //resultDiv.innerHTML = `<p style="color: red;">Login failed. Incorrect username or password.</p>`;
    }
});

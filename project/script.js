function handleSubmit() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const username = document.getElementById('username').value;
    //const accessibility = document.getElementById('accessibility').value;


    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }


    const data = {
        username: username,
        password: password
//        accessibility: accessibility
    };

    // Send the data to the server
    const response = await fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        alert('Data submitted successfully!');
    } else {
        alert('Submission failed.');
    }







    // Create XML data
    const userData = {
        user: {
            username: username,
            password: password
        }
    };

    // Convert to XML and save
    const xml2js = require('xml2js');
    const builder = new xml2js.Builder();
    const xml = builder.buildObject(userData);

    // Using fetch to send data to server to save XML
    fetch('xml', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xml: xml })
    })
        .then(response => response.json())
        .then(data => {
            alert('Registration successful!');
            window.location.href = 'index.html';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Registration failed. Please try again.');
        });
}

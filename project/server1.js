const express = require('express');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js'); // npm install xml2js

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve public folder
app.use(express.static(path.join(__dirname, 'public')));

// Handle form submission
app.post('/submit', (req, res) => {
    const { username, password } = req.body;

    const builder = new xml2js.Builder();
    const obj = {
        user: {
            name: username,
            password: password
        }
    };

    const xml = builder.buildObject(obj);

    // Save to file
    fs.writeFile('user_data.xml', xml, (err) => {
        if (err) {
            console.error('Error saving XML:', err);
            res.status(500).send('Server Error');
            return;
        }
        console.log('Data saved to XML!');
        res.send('Data received and saved');
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

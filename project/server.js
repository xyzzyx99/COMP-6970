const express = require('express');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Handle Form 1
app.post('/userCreation', (req, res) => {
    const { username, password, accessibility } = req.body;
    const builder = new xml2js.Builder();
    const obj = { user: { username, password, accessibility } };
    const xml = builder.buildObject(obj);

    fs.writeFile('user_data.xml', xml, (err) => {
        if (err) return res.status(500).send('Error saving Form 1');
        res.send('Form 1 received!');
    });
});

// Handle Form 2
app.post('/submitForm2', (req, res) => {
    const { product, quantity } = req.body;
    const builder = new xml2js.Builder();
    const obj = { order: { product, quantity } };
    const xml = builder.buildObject(obj);

    fs.writeFile('form2_data.xml', xml, (err) => {
        if (err) return res.status(500).send('Error saving Form 2');
        res.send('Form 2 received!');
    });
});


app.get('/profile', (req, res) => {
    const parser = new xml2js.Parser();
    fs.readFile(path.join(__dirname, 'form1_data.xml'), (err, data) => {
//    fs.readFile(path.join('.', __dirname'', 'project/form1_data.xml'), (err, data) => {
        if (err) {
            console.error('Error reading XML:', err);
            return res.status(500).send('Error loading profile');
        }

        parser.parseString(data, (err, result) => {
            if (err) {
                console.error('Error parsing XML:', err);
                return res.status(500).send('Error parsing profile data');
            }

            // result is now a JS object
            const username = result.user.username[0];
            const email = result.user.email[0];

            // Generate simple HTML
            const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>User Profile</title>
        </head>
        <body>
          <h1>User Profile</h1>
          <p><strong>Name:</strong> ${username}</p>
          <p><strong>Email:</strong> ${email}</p>
          <a href="/">Back to Home</a>
        </body>
        </html>
      `;

            res.send(html);
        });
    });
});

app.get('/userRead', (req, res) => {
    res.sendFile(path.join(__dirname, 'user_data.xml'));
});



app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

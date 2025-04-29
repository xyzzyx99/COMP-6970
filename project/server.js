const express = require('express');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
//const multer = require('multer');

const app = express();
const PORT = 3000;

// Import your post routes
const postRoute = require('./routes/postRoute');

// Middleware to parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (like your HTML form)
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded images statically (optional, but useful)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount your postRoute router
app.use('/', postRoute);

//app.use(express.json());

app.use(express.json({ limit: '10mb' }));

// Increase limit for URL-encoded form data
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
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

app.use(express.text({ type: 'application/xml' }));
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // 'uploads' folder in your server directory
    },
    filename: (req, file, cb) => {
        // Save with original name or timestamped version to avoid collisions
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });


//const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

app.post('/createPost1', (req, res) => {
    const xmlData = req.body;
    // Save xmlData to a file
    fs.writeFile('submitted_content.xml', xmlData, (err) => {
        if (err) {
            console.error('Error saving file:', err);
            return res.status(500).send('Failed to save content.');
        }
        console.log('Content saved successfully.');
        res.send('Content saved.');
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

app.get('/subjects.xml', (req, res) => {
    res.sendFile(path.join(__dirname, 'subjects.xml'));
});

app.get('/posts.xml', (req, res) => {
    res.sendFile(path.join(__dirname, 'posts.xml'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

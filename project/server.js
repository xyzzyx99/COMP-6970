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

//const multer = require('multer');
//const upload = multer();

//const xmlPath = path.join(__dirname, 'user_data.xml');

// Handle Form 1
const parser = new xml2js.Parser({ explicitArray: false });

app.post('/userCreation', (req, res) => {
    const { username, password, accessibility } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password required.');
    }

    const xmlPath = path.join(__dirname, 'user_data.xml');
    const newUser = {
        username,
        password,
        accessibility,
        admin: "0"
    };

    fs.readFile(xmlPath, 'utf-8', (err, data) => {
        let usersXml = { Users: { user: [] } };

        if (!err && data.trim()) {
            parser.parseString(data, (parseErr, result) => {
                if (parseErr) {
                    console.error('Parse error:', parseErr);
                    return res.status(500).send('Failed to parse user XML.');
                }

                let users = result.Users?.user || [];

                // Normalize to array if single user
                if (!Array.isArray(users)) users = [users];

                // Check for duplicate
                if (users.some(u => u.username === username)) {
                    return res.status(409).send('User exists!');
                }

                users.push(newUser);
                const builder = new xml2js.Builder();
                const updatedXml = builder.buildObject({ Users: { user: users } });

                fs.writeFile(xmlPath, updatedXml, (writeErr) => {
                    if (writeErr) {
                        console.error('Write error:', writeErr);
                        return res.status(500).send('Failed to save user.');
                    }
                    res.send('User registered successfully!');
                });
            });
        } else {
            // File missing or empty: start fresh
            const builder = new xml2js.Builder();
            const updatedXml = builder.buildObject({ Users: { user: [newUser] } });

            fs.writeFile(xmlPath, updatedXml, (writeErr) => {
                if (writeErr) {
                    console.error('Write error:', writeErr);
                    return res.status(500).send('Failed to create user.');
                }
                res.send('User registered successfully!');
            });
        }
    });
});

const multer = require('multer');

app.use(express.text({ type: 'application/xml' }));

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


app.post('/createPost', upload.single('image'), async (req, res) => {
    try {
        const { title, textInput } = req.body;
        const subjectName = req.query.subjectName;
        const imageLocation = req.file ? `/uploads/${req.file.filename}` : '';

        // Read existing XML
        const xmlFile = fs.readFileSync('discussions.xml', 'utf-8');
        const parser = new xml2js.Parser({ explicitArray: false });
        const xmlDoc = await parser.parseStringPromise(xmlFile);

        // Find subject
        const subject = xmlDoc.courseDiscussions.subject.find(s => s.name === subjectName);
        if (!subject) {
            throw new Error('Subject not found');
        }

        // Create new topic with discussion
        const newTopic = {
            $: { title },
            thread: {
                discussion: {
                    timestamp: new Date().toISOString(),
                    username: 'anonymous', // Could be replaced with actual user system
                    content: textInput,
                    imageLocation
                }
            }
        };

        // Add topic to subject
        if (!subject.topic) {
            subject.topic = [];
        }
        if (!Array.isArray(subject.topic)) {
            subject.topic = [subject.topic];
        }
        subject.topic.push(newTopic);

        // Convert back to XML and save
        const builder = new xml2js.Builder();
        const newXml = builder.buildObject(xmlDoc);
        fs.writeFileSync('discussions.xml', newXml);

        res.redirect('/subjects.html');
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).send('Error creating post');
    }
});



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

app.get('/subjects', (req, res) => {
    const filePath = path.join(__dirname, 'subjects.xml');
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading subjects.xml:', err);
            return res.status(500).send('Failed to load subjects');
        }
        res.type('application/xml').send(data);
    });
});

app.get('/posts.xml', (req, res) => {
    res.sendFile(path.join(__dirname, 'posts.xml'));
});

app.get('/discussions', (req, res) => {
    try {
        const xmlPath = path.join(__dirname, 'discussions.xml');
        const xmlData = fs.readFileSync(xmlPath, 'utf8');
        res.header('Content-Type', 'application/xml');
        res.send(xmlData);
    } catch (error) {
        console.error('Error reading XML file:', error);
        res.status(500).send('Error reading discussions data');
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

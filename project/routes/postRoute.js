const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

const xmlFilePath = path.join(__dirname, '..', 'posts.xml'); // still posts.xml

router.post('/createPost', upload.single('image'), (req, res) => {
    try {
        const textInput = req.body.textInput; // <-- now reading textInput
        let imagePath = '';

        if (req.file) {
            imagePath = path.join('/uploads', req.file.filename);
        } else {
            imagePath = '';
        }

        const newPost = `  <post>
    <text>${textInput}</text>
    <image>${imagePath}</image>
  </post>\n`;

        let xmlContent = '';

        if (fs.existsSync(xmlFilePath)) {
            const currentContent = fs.readFileSync(xmlFilePath, 'utf-8');

            if (currentContent.includes('</posts>')) {
                xmlContent = currentContent.replace('</posts>', newPost + '</posts>');
            } else {
                xmlContent = `<posts>\n${newPost}</posts>`;
            }
        } else {
            xmlContent = `<posts>\n${newPost}</posts>`;
        }

        fs.writeFileSync(xmlFilePath, xmlContent);

        res.send('Post created successfully (with or without image)!');
    } catch (error) {
        console.error('Error during post creation:', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;

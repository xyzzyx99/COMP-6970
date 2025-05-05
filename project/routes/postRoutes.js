const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure multer to save files to /uploads folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB limit

// Handle POST /createPost
router.post('/createPost', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const imagePath = path.join('/uploads', req.file.filename);

        const xmlContent = `<post>
  <title>${req.body.title}</title>
  <image>${imagePath}</image>
</post>`;

        // Save or append to XML (for now overwrite, later can enhance)
        fs.writeFileSync('data.xml', xmlContent);

        res.send('Post created successfully!');
    } catch (error) {
        console.error('Error during post creation:', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;

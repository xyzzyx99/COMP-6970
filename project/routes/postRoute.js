const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

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

const xmlFilePath = path.join(__dirname, '..', 'discussions.xml'); // still posts.xml

router.post('/createPost', upload.single('image'), async (req, res) => {
    try {
        const { title, textInput } = req.body;
        const subjectName = req.query.subjectName;
        const imageLocation = req.file ? `/uploads/${req.file.filename}` : '';

        // Read and parse XML
        const xmlRaw = fs.readFileSync(xmlFilePath, 'utf-8');
        const parser = new xml2js.Parser({ explicitArray: false });
        const xmlObj = await parser.parseStringPromise(xmlRaw);

        const discussion = {
            timestamp: new Date().toISOString(),
            username: 'anonymous_user',
            content: textInput,
            imageLocation: imageLocation
        };

        let subjects = xmlObj.courseDiscussions.subject;
        if (!Array.isArray(subjects)) subjects = [subjects];

        const subject = subjects.find(s => s.$.name === subjectName);
        if (!subject) {
            throw new Error(`Subject "${subjectName}" not found.`);
        }

        // Normalize topic list
        if (!subject.topic) {
            subject.topic = [];
        } else if (!Array.isArray(subject.topic)) {
            subject.topic = [subject.topic];
        }

        // Check if topic already exists
        let topic = subject.topic.find(t => t.$.title === title);

        if (topic) {
            // Normalize discussion array
            if (!topic.thread) {
                topic.thread = { discussion: [] };
            } else if (!topic.thread.discussion) {
                topic.thread.discussion = [];
            } else if (!Array.isArray(topic.thread.discussion)) {
                topic.thread.discussion = [topic.thread.discussion];
            }

            topic.thread.discussion.push(discussion);
        } else {
            // Create new topic
            const newTopic = {
                $: { title },
                thread: {
                    discussion: [discussion]
                }
            };
            subject.topic.push(newTopic);
        }

        // Write back to XML
        const builder = new xml2js.Builder();
        const newXml = builder.buildObject(xmlObj);
        fs.writeFileSync(xmlFilePath, newXml, 'utf-8');

        //res.redirect(`/new_topic.html?subjectName=${encodeURIComponent(subjectName)}`);
        //res.redirect(`/view_topic.html?subjectName=${encodeURIComponent(subjectName)}`);
        res.redirect(`/view_topic.html?subjectName=${encodeURIComponent(subjectName)}&topicTitle=${encodeURIComponent(title)}`);

    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).send('Error creating post');
    }
});

router.post('/replyPost', upload.single('image'), async (req, res) => {
    try {
        const { textInput } = req.body;
        const subjectName = req.query.subjectName;
        const topicTitle = req.query.topicTitle;
        const imageLocation = req.file ? `/uploads/${req.file.filename}` : '';

        // Read and parse XML
        const xmlRaw = fs.readFileSync(xmlFilePath, 'utf-8');
        const parser = new xml2js.Parser({ explicitArray: false });
        const xmlObj = await parser.parseStringPromise(xmlRaw);

        const discussion = {
            timestamp: new Date().toISOString(),
            username: 'anonymous_user',
            content: textInput,
            imageLocation: imageLocation
        };

        let subjects = xmlObj.courseDiscussions.subject;
        if (!Array.isArray(subjects)) subjects = [subjects];

        const subject = subjects.find(s => s.$.name === subjectName);
        if (!subject) throw new Error(`Subject "${subjectName}" not found.`);

        if (!subject.topic) subject.topic = [];
        if (!Array.isArray(subject.topic)) subject.topic = [subject.topic];

        const topic = subject.topic.find(t => t.$.title === topicTitle);
        if (!topic) throw new Error(`Topic "${topicTitle}" not found under subject "${subjectName}".`);

        if (!topic.thread) topic.thread = { discussion: [] };
        else if (!topic.thread.discussion) topic.thread.discussion = [];
        else if (!Array.isArray(topic.thread.discussion)) topic.thread.discussion = [topic.thread.discussion];

        topic.thread.discussion.push(discussion);

        const builder = new xml2js.Builder();
        const newXml = builder.buildObject(xmlObj);
        fs.writeFileSync(xmlFilePath, newXml, 'utf-8');

        res.redirect(`/view_topic.html?subjectName=${encodeURIComponent(subjectName)}&topicTitle=${encodeURIComponent(topicTitle)}`);
        //res.redirect(`/topics_list.html?subjectName=${encodeURIComponent(subjectName)}`);
        //const returnTo = req.query.returnTo || `/new_topic.html?subjectName=${encodeURIComponent(subjectName)}`;
        // const returnTo = req.query.returnTo || showDiscussions(topicTitle, subjectName)
        //res.redirect(returnTo);
    } catch (error) {
        console.error('Error replying to post:', error);
        res.status(500).send('Error replying to post');
    }
});

module.exports = router;

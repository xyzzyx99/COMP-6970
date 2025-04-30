// Function to fetch and display discussions for a specific subject
async function loadSubjectDiscussions(subjectName) {
    try {
        // Fetch XML from backend
        const response = await fetch(`discussions`);
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");

        // Find the subject
        const subject = Array.from(xmlDoc.getElementsByTagName('subject'))
            .find(sub => sub.getAttribute('name') === subjectName);

        if (!subject) {
            throw new Error('Subject not found');
        }

        // Get all topics for the subject
        const topics = subject.getElementsByTagName('topic');

        // Create topics table HTML
        let topicsHtml = `
            <h2>${subjectName}</h2>
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Topic</th>
                        <th>Latest Post By</th>
                    </tr>
                </thead>
                <tbody>`;

        Array.from(topics).forEach(topic => {
            const title = topic.getAttribute('title');
            const discussions = topic.getElementsByTagName('discussion');
            const latestPost = discussions[discussions.length - 1];
            const latestUser = latestPost ? latestPost.getElementsByTagName('username')[0].textContent : 'No posts';

            topicsHtml += `
                <tr style="cursor:pointer;" onclick="showDiscussions('${title}', '${subjectName}')">
                    <td>${title}</td>
                    <td>${latestUser}</td>
                </tr>`;
        });

        topicsHtml += `
                </tbody>
            </table>`;

        // Replace page content
        document.body.innerHTML = '<div class="container mt-5" id="newContentContainer"></div>';
        const container = document.getElementById('newContentContainer');

        // Create buttons
        const backBtn = document.createElement('button');
        backBtn.className = 'btn btn-success';
        backBtn.textContent = 'Back to Subjects';
        backBtn.onclick = () => location.reload();

        const addTopicBtn = document.createElement('button');
        addTopicBtn.className = 'btn btn-success';
        addTopicBtn.textContent = 'Add New Topic';
        addTopicBtn.onclick = () => {
            alert(`Functionality to add a new topic under "${subjectName}" goes here.`);
        };

        // Put buttons in the same row
        const buttonRow = document.createElement('div');
        buttonRow.className = 'd-flex justify-content-between mb-3';

        const leftBtnWrapper = document.createElement('div');
        leftBtnWrapper.appendChild(backBtn);

        const rightBtnWrapper = document.createElement('div');
        rightBtnWrapper.appendChild(addTopicBtn);

        buttonRow.appendChild(leftBtnWrapper);
        buttonRow.appendChild(rightBtnWrapper);
        container.appendChild(buttonRow);

        // Add topic content
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = topicsHtml;
        container.appendChild(contentDiv);
    } catch (error) {
        console.error('Error loading discussions:', error);
        document.body.innerHTML = '<div class="alert alert-danger m-5">Error loading discussions</div>';
    }
}

// Function to show discussions for a specific topic
async function showDiscussions(topicTitle, subjectName) {
    try {
        const response = await fetch(`discussions`);
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");

        // Find the topic
        const topic = Array.from(xmlDoc.getElementsByTagName('topic'))
            .find(t => t.getAttribute('title') === topicTitle);

        if (!topic) {
            throw new Error('Topic not found');
        }

        // Get all discussions for the topic
        const discussions = Array.from(topic.getElementsByTagName('discussion'))
            .sort((a, b) => {
                const timeA = new Date(a.getElementsByTagName('timestamp')[0].textContent);
                const timeB = new Date(b.getElementsByTagName('timestamp')[0].textContent);
                return timeA - timeB;
            });

        // Create discussions table
        let discussionsHtml = `
            <h3>${topicTitle}</h3>
            <table class="table">
                <tbody>`;

        discussions.forEach((discussion) => {
            const timestamp = new Date(discussion.getElementsByTagName('timestamp')[0].textContent)
                .toLocaleString();
            const username = discussion.getElementsByTagName('username')[0].textContent;
            const content = discussion.getElementsByTagName('content')[0].textContent;
            const imageLocation = discussion.getElementsByTagName('imageLocation')[0]?.textContent || '';

            discussionsHtml += `
                <tr>
                    <td style="width: 200px">
                        <strong>${username}</strong><br>
                        <small class="text-muted">${timestamp}</small>
                    </td>
                    <td>
                        <p>${content}</p>
                        ${imageLocation ? `<img src="${imageLocation}" class="img-fluid" alt="Discussion image">` : ''}
                    </td>
                </tr>`;
        });

        discussionsHtml += `
                </tbody>
            </table>`;

        // Replace page content
        document.body.innerHTML = '<div class="container mt-5" id="discussionsContainer"></div>';
        const container = document.getElementById('discussionsContainer');

        // Create buttons
        const backBtn = document.createElement('button');
        backBtn.className = 'btn btn-success';
        backBtn.textContent = 'Back to Topics';
        backBtn.onclick = () => loadSubjectDiscussions(subjectName);

        const replyBtn = document.createElement('button');
        replyBtn.className = 'btn btn-success';
        replyBtn.textContent = 'Reply to Topic';
        replyBtn.onclick = () => {
            alert(`Reply form for topic "${topicTitle}" under subject "${subjectName}" goes here.`);
        };

        // Put buttons in the same row
        const buttonRow = document.createElement('div');
        buttonRow.className = 'd-flex justify-content-between mb-3';

        const leftBtnWrapper = document.createElement('div');
        leftBtnWrapper.appendChild(backBtn);

        const rightBtnWrapper = document.createElement('div');
        rightBtnWrapper.appendChild(replyBtn);

        buttonRow.appendChild(leftBtnWrapper);
        buttonRow.appendChild(rightBtnWrapper);
        container.appendChild(buttonRow);

        // Add discussion content
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = discussionsHtml;
        container.appendChild(contentDiv);
    } catch (error) {
        console.error('Error showing discussions:', error);
        document.body.innerHTML = '<div class="alert alert-danger m-5">Error loading discussions</div>';
    }
}

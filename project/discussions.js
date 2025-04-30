// Function to fetch and display discussions for a specific subject
async function loadSubjectDiscussions(subjectName) {
    try {
        // Fetch XML from backend
        const response = await fetch(`discussions`);
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        // Find the subject
        const subject = Array.from(xmlDoc.getElementsByTagName('subject'))
            .find(sub => sub.getAttribute('name') === subjectName);

        // ✅ Prepare the container
        document.body.innerHTML = '<div class="container mt-5" id="newContentContainer"></div>';
        const container = document.getElementById('newContentContainer');

        // ✅ Create buttons
        const backBtn = document.createElement('button');
        backBtn.className = 'btn btn-success';
        backBtn.textContent = 'Back to Subjects';
        backBtn.onclick = () => {
            window.location.href = 'subjects.html';
        };

        const addTopicBtn = document.createElement('button');
        addTopicBtn.className = 'btn btn-success';
        addTopicBtn.textContent = 'Add New Topic';
        addTopicBtn.onclick = () => {
            window.location.href = `new_topic.html?subjectName=${subjectName}`;
        };

        const buttonRow = document.createElement('div');
        buttonRow.className = 'd-flex justify-content-between mb-3';

        const leftBtnWrapper = document.createElement('div');
        leftBtnWrapper.appendChild(backBtn);
        const rightBtnWrapper = document.createElement('div');
        rightBtnWrapper.appendChild(addTopicBtn);

        buttonRow.appendChild(leftBtnWrapper);
        buttonRow.appendChild(rightBtnWrapper);
        container.appendChild(buttonRow);

        // ✅ Show subject header
        const header = document.createElement('h2');
        header.textContent = subjectName;
        container.appendChild(header);

        if (!subject) {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'alert alert-warning mt-3';
            errorMsg.textContent = 'No discussions yet.'; // Subject not found.';
            container.appendChild(errorMsg);
            return;
        }

        // Get all topics for the subject
        const topics = subject.getElementsByTagName('topic');

        // If no topics, show message instead of throwing
        if (!topics.length) {
            const noTopics = document.createElement('div');
            noTopics.className = 'alert alert-info mt-3';
            noTopics.textContent = 'No topics found under this subject.';
            container.appendChild(noTopics);
            return;
        }

        // ✅ Build topics table
        let topicsHtml = `
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

        topicsHtml += `</tbody></table>`;

        const tableWrapper = document.createElement('div');
        tableWrapper.innerHTML = topicsHtml;
        container.appendChild(tableWrapper);
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
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

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
//            window.location.href = `edit_post.html?topicTitle=${topicTitle}&returnTo=` + encodeURIComponent(window.location.pathname);
            window.location.href = `edit_post.html?subjectName=${subjectName}&topicTitle=${topicTitle}`;

            //alert(`Reply form for topic "${topicTitle}" under subject "${subjectName}" goes here.`);
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

/*function replyToForm() {
    //const userId = 42; // example parameter
    window.location.href = `edit_post.html?$topicTitle=${topicTitle}`;
}*/

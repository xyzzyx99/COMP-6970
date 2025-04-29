// Function to fetch and display discussions for a specific subject
async function loadSubjectDiscussions(subjectName) {
    try {

        // Clear the current page content
        /*document.body.innerHTML = '<div class="container mt-5"></div>';
        const container = document.querySelector('.container');
        
        // Add back button
        const backBtn = document.createElement('button');
        backBtn.className = 'btn btn-secondary mb-3';
        backBtn.textContent = 'Back to Subjects';
        backBtn.onclick = () => window.location.reload();
        container.appendChild(backBtn);*/

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
        
        // Create topics table
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
                <tr onclick="showDiscussions('${title}')">
                    <td>${title}</td>
                    <td>${latestUser}</td>
                </tr>`;
        });

        topicsHtml += `
                </tbody>
            </table>`;

        document.getElementById('topicsContainer').innerHTML = topicsHtml;
    } catch (error) {
        console.error('Error loading discussions:', error);
        document.getElementById('topicsContainer').innerHTML = 
            '<div class="alert alert-danger">Error loading discussions</div>';
    }
}

// Function to show discussions for a specific topic
async function showDiscussions(topicTitle) {
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
            <table class="table">
                <tbody>`;

        discussions.forEach((discussion, index) => {
            const timestamp = new Date(discussion.getElementsByTagName('timestamp')[0].textContent)
                .toLocaleString();
            const username = discussion.getElementsByTagName('username')[0].textContent;
            const content = discussion.getElementsByTagName('content')[0].textContent;
            const imageLocation = discussion.getElementsByTagName('imageLocation')[0].textContent;

            discussionsHtml += `
                <tr>
                    <td style="width: 200px">
                        <strong>${username}</strong><br>
                        <small class="text-muted">${timestamp}</small>
                    </td>
                    <td>
                        ${index === 0 ? `<h4>${topicTitle}</h4>` : ''}
                        <p>${content}</p>
                        ${imageLocation ? `<img src="${imageLocation}" class="img-fluid" alt="Discussion image">` : ''}
                    </td>
                </tr>`;
        });

        discussionsHtml += `
                </tbody>
            </table>`;

        document.getElementById('discussionsContainer').innerHTML = discussionsHtml;
    } catch (error) {
        console.error('Error showing discussions:', error);
        document.getElementById('discussionsContainer').innerHTML = 
            '<div class="alert alert-danger">Error loading discussions</div>';
    }
}

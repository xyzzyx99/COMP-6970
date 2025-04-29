//document.getElementById("submitButton").addEventListener("click", submitContent);


const form = document.getElementById('contentForm');

// First remove any previous classes
form.classList.remove('accessibility-large', 'accessibility-normal');

let accessibility = 'large'
//let accessibility = 'normal'

// Add based on accessibility setting
if (accessibility === 'large') {
    form.classList.add('accessibility-large');
} else {
    form.classList.add('accessibility-normal');
}

async function submitContent() {
    const text = document.getElementById('textInput').value;
    const imageFile = document.getElementById('imageInput').files[0];

    if (!text && !imageFile) {
        alert('Please provide text or upload an image.');
        return;
    }

    const reader = new FileReader();
    reader.onloadend = async function() {
        const imageBase64 = imageFile ? reader.result.split(',')[1] : '';

        const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n<content>\n  <text>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>\n  <image>${imageBase64}</image>\n</content>`;

        try {
            const response = await fetch('/createPost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/xml' },
                body: xmlContent
            });

            if (response.ok) {
                alert('Content submitted successfully!');
            } else {
                alert('Failed to submit content.');
            }
        } catch (error) {
            console.error('Error submitting content:', error);
            alert('Error submitting content.');
        }
    };

    if (imageFile) {
        reader.readAsDataURL(imageFile);
    } else {
        reader.onloadend();
    }
}

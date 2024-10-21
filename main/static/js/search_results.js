document.addEventListener('DOMContentLoaded', function() {
    const deleteButtons = document.querySelectorAll('.delete-file');

    
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    const csrftoken = getCookie('csrftoken');

    deleteButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const fileId = this.getAttribute('data-file-id');
            const fileElement = document.getElementById(`file-${fileId}`);
            
            fetch(this.href, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': csrftoken
                }
            }).then(response => {
                if (response.ok) {
                    fileElement.remove();
                    const fileList = document.getElementById('file-list');
                    if (fileList.children.length === 0) {
                        document.getElementById('no-results-message').textContent = 'No searches left';
                        document.getElementById('no-results-message').style.display = 'block';
                    }
                } else {
                    console.error('Failed to delete the file.');
                }
            }).catch(error => {
                console.error('Error:', error);
            });
        });
    });
});
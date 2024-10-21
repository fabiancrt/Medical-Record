document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const suggestionsList = document.getElementById('suggestions-list');

    searchInput.addEventListener('input', function() {
        const query = searchInput.value.trim();

        if (query.length > 0) {
            fetch(`/search_suggestions?q=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    suggestionsList.innerHTML = '';
                    if (data.suggestions.length > 0) {
                        data.suggestions.forEach(suggestion => {
                            const li = document.createElement('li');
                            li.className = 'list-group-item';
                            li.textContent = suggestion;
                            li.addEventListener('click', function() {
                                searchInput.value = suggestion;
                                suggestionsList.classList.add('d-none');
                            });
                            suggestionsList.appendChild(li);
                        });
                        suggestionsList.classList.remove('d-none');
                    } else {
                        suggestionsList.classList.add('d-none');
                    }
                });
        } else {
            suggestionsList.classList.add('d-none');
        }
    });

    document.addEventListener('click', function(event) {
        if (!event.target.closest('#search-form')) {
            suggestionsList.classList.add('d-none');
        }
    });
});
document.addEventListener('DOMContentLoaded', function () {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.add(savedTheme);
        if (savedTheme === 'dark-theme') {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        }
    } else {
        body.classList.add('light-theme');
    }

    themeToggle.addEventListener('click', function () {
        if (body.classList.contains('light-theme')) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
            localStorage.setItem('theme', 'dark-theme');
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
            localStorage.setItem('theme', 'light-theme');
        }
    });
});
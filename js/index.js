const searchForm = document.getElementById('github-form');
const searchInput = document.getElementById('search');
const userList = document.getElementById('user-list');
const reposList = document.getElementById('repos-list');

// GitHub API configuration
const API_URL = 'https://api.github.com';
const headers = {
  'Accept': 'application/vnd.github.v3+json'
};

// Clear lists
function clearLists() {
  userList.innerHTML = '';
  reposList.innerHTML = '';
}

// Display error message
function displayError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  userList.innerHTML = '';
  userList.appendChild(errorDiv);
}

// Create user list item
function createUserItem(user) {
  const li = document.createElement('li');
  li.className = 'user-item';
  li.innerHTML = `
    <img src="${user.avatar_url}" alt="${user.login}">
    <div>
      <h3>${user.login}</h3>
      <p>${user.type}</p>
      <a href="${user.html_url}" target="_blank">View Profile</a>
    </div>
  `;
  li.addEventListener('click', () => searchRepos(user.login));
  return li;
}

// Create repository list item
function createRepoItem(repo) {
  const li = document.createElement('li');
  li.className = 'repo-item';
  li.innerHTML = `
    <h4>${repo.name}</h4>
    <p>${repo.description || 'No description'}</p>
    <div>
      <span>⭐ ${repo.stargazers_count}</span>
      <span>🍴 ${repo.forks_count}</span>
    </div>
  `;
  return li;
}

// Search GitHub users
async function searchUsers(query) {
  try {
    const response = await fetch(`${API_URL}/search/users?q=${encodeURIComponent(query)}`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const data = await response.json();
    clearLists();
    
    if (data.items.length === 0) {
      displayError('No users found');
      return;
    }
    
    data.items.forEach(user => {
      userList.appendChild(createUserItem(user));
    });
  } catch (error) {
    displayError('Error searching users. Please try again.');
  }
}

// Search user repositories
async function searchRepos(username) {
  try {
    const response = await fetch(`${API_URL}/users/${username}/repos`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch repositories');
    }
    
    const repos = await response.json();
    clearLists();
    
    if (repos.length === 0) {
      displayError('No repositories found');
      return;
    }
    
    repos.forEach(repo => {
      reposList.appendChild(createRepoItem(repo));
    });
  } catch (error) {
    displayError('Error fetching repositories. Please try again.');
  }
}

// Form submission handler
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) {
    searchUsers(query);
  }
});

// Add a toggle for user/repo search
const searchToggle = document.createElement('div');
searchToggle.className = 'search-toggle';
searchToggle.innerHTML = `
  <label>
    <input type="radio" name="search-type" value="users" checked>
    Search Users
  </label>
  <label>
    <input type="radio" name="search-type" value="repos">
    Search Repos
  </label>
`;

searchForm.insertBefore(searchToggle, searchInput);

// Handle search type toggle
searchToggle.addEventListener('change', (e) => {
  const searchType = e.target.value;
  if (searchType === 'repos') {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        searchRepos(query);
      }
    });
  } else {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        searchUsers(query);
      }
    });
  }
});
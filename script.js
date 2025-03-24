const input = document.getElementById('input');
const skillInput = document.getElementById('skillInput');
const list = document.getElementById('list');
const repoList = document.getElementById('repoList');
const activityChartCtx = document.getElementById('activityChart').getContext('2d');

const getProfile = async () => {
    const username = input.value.trim();
    const userResponse = await fetch(`https://api.github.com/users/${username}`, { method: 'GET' });
    const userBody = await userResponse.json();

    if (userResponse.ok) {
        list.innerHTML = `
            <div id="profile">
                <img id="pic" src="${userBody.avatar_url}" alt="${userBody.name}">
                <div id="name">${userBody.name || 'No Name Provided'}</div>
                <div id="bio">${userBody.bio || 'No Bio Available'}</div>
                <div id="stats">
                    <div class="stat">
                        <span>Public Repos</span>
                        <span>${userBody.public_repos}</span>
                    </div>
                    <div class="stat">
                        <span>Followers</span>
                        <span>${userBody.followers}</span>
                    </div>
                    <div class="stat">
                        <span>Following</span>
                        <span>${userBody.following}</span>
                    </div>
                </div>
                <a href="${userBody.html_url}" target="_blank">View Profile on GitHub</a>
            </div>
        `;

        // Fetch repositories
        const reposResponse = await fetch(userBody.repos_url);
        const reposBody = await reposResponse.json();
        displayRepositories(reposBody);

        // Fetch activity data
        fetchActivityData(username);
    } else {
        list.innerHTML = `<div style="color: red;">User  not found. Please check the username.</div>`;
    }
}

const displayRepositories = (repos) => {
    repoList.innerHTML = '<h3>Repositories:</h3><ul>';
    repos.forEach(repo => {
        repoList.innerHTML += `<li><a href="${repo.html_url}" target="_blank">${repo.name}</a> - ${repo.description || 'No description'}</li>`;
    });
    repoList.innerHTML += '</ul>';
}

const checkSkill = async () => {
    const skill = skillInput.value.trim().toLowerCase();
    const reposResponse = await fetch(`https://api.github.com/users/${input.value.trim()}/repos`);
    const reposBody = await reposResponse.json();

    let skillFound = false;

    reposBody.forEach(repo => {
        const repoName = repo.name.toLowerCase();
        const repoDescription = (repo.description || '').toLowerCase();

       
        if (repoName.includes(skill) || repoDescription.includes(skill)) {
            skillFound = true;
        }
    });

    if (skillFound) {
        alert(`Skill "${skill}" is present in the repositories.`);
    } else {
        alert(`Skill "${skill}" is not found in the repositories.`);
    }
}

const fetchActivityData = async (username) => {
    const eventsResponse = await fetch(`https://api.github.com/users/${username}/events`);
    const eventsBody = await eventsResponse.json();

    const activityData = {};
    eventsBody.forEach(event => {
        const date = new Date(event.created_at).toLocaleDateString();
        activityData[date] = (activityData[date] || 0) + 1;
    });

    const labels = Object.keys(activityData);
    const data = Object.values(activityData);

    // Create the chart
    new Chart(activityChartCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Activity',
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Events'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}

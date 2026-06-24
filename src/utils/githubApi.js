export async function fetchGithubStats() {
    try {
        const userPromise = fetch('https://api.github.com/users/RAZAAli901', { headers: { 'Accept': 'application/vnd.github.v3+json' } });
        const reposPromise = fetch('https://api.github.com/users/RAZAAli901/repos?sort=updated', { headers: { 'Accept': 'application/vnd.github.v3+json' } });
        
        const [userRes, reposRes] = await Promise.all([userPromise, reposPromise]);

        if (!userRes.ok || !reposRes.ok) {
            throw new Error('API limit reached or user not found.');
        }

        const userData = await userRes.json();
        const reposData = await reposRes.json();

        return {
            username: userData.login,
            name: userData.name || userData.login,
            publicRepos: userData.public_repos,
            followers: userData.followers,
            following: userData.following,
            bio: userData.bio,
            repos: reposData.slice(0, 5).map(repo => ({
                name: repo.name,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                language: repo.language || 'N/A',
                url: repo.html_url
            }))
        };
    } catch (err) {
        console.warn('Using fallback github data due to API error/rate-limit:', err);
        // Fallback cached stats of Raza's actual repo
        return {
            username: "RAZAAli901",
            name: "Raza Ali Murtaza",
            publicRepos: 18,
            followers: 12,
            following: 15,
            bio: "AI/ML Engineer & Full-Stack Developer",
            repos: [
                { name: "Interactive-Terminal-Portfoil", stars: 1, forks: 0, language: "JavaScript", url: "https://github.com/RAZAAli901/Interactive-Terminal-Portfoil" },
                { name: "Enterprise-RAG-Pipeline", stars: 2, forks: 0, language: "Python", url: "https://github.com/RAZAAli901/Enterprise-RAG-Pipeline" },
                { name: "Typing-Speed-Tester", stars: 0, forks: 0, language: "C++", url: "https://github.com/RAZAAli901/Typing-Speed-Tester" }
            ]
        };
    }
}

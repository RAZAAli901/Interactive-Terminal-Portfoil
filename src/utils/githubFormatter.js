export function formatGithubStats(stats) {
    const lines = [
        "🤖 GitHub Profile Dashboard for @" + stats.username,
        "===========================================================",
        "👤 Name:      " + stats.name,
        "📝 Bio:       " + (stats.bio || "AI/ML Engineer & Full-Stack Developer"),
        "📊 Repos:     " + stats.publicRepos + "  |  Followers: " + stats.followers + "  |  Following: " + stats.following,
        "===========================================================",
        "📂 RECENT REPOSITORIES (Top " + stats.repos.length + "):",
        "-----------------------------------------------------------"
    ];

    stats.repos.forEach(repo => {
        const namePart = repo.name.padEnd(30, " ");
        const langPart = ("[" + repo.language + "]").padEnd(12, " ");
        const starsPart = ("⭐ " + repo.stars).padEnd(8, " ");
        const forksPart = "🍴 " + repo.forks;
        lines.push(`  ${namePart} ${langPart} ${starsPart} ${forksPart}`);
    });

    lines.push("===========================================================");
    lines.push("🔗 Profile Link: https://github.com/" + stats.username);
    return lines;
}

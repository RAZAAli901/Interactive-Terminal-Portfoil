import { skillsData } from './portfolioData';

export function renderSkillsChart() {
    const lines = [
        "🛠️ Raza's Technical Skills & Proficiency:",
        "===========================================================",
        ""
    ];

    skillsData.forEach(skill => {
        const namePart = skill.name.padEnd(16, " ");
        const barWidth = 20;
        const filledBlocks = Math.round((skill.level / 100) * barWidth);
        const emptyBlocks = barWidth - filledBlocks;
        
        const bar = "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);
        
        lines.push(`  ${namePart} [${bar}] ${skill.level}%`);
    });

    lines.push("");
    lines.push("===========================================================");
    return lines;
}

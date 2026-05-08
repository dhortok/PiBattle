const rankLevels = {
    0: "bronze1", 100: "bronze2", 200: "bronze3", 300: "bronze4", 400: "bronze5",
    500: "silver1", 650: "silver2", 800: "silver3",
    1000: "gold1", 1300: "gold2", 1600: "gold3",
    2000: "emerald1", 2500: "emerald2",
    3000: "diamond1", 4000: "diamond2",
    5000: "elite"
};

function rankCalculator(rank_xp) {
    let rankName = "bronze1";
    
    const thresholds = Object.keys(rankLevels).map(Number).sort((a, b) => a - b);
    
    for (const threshold of thresholds) {
        if (rank_xp >= threshold) {
            rankName = rankLevels[threshold];
        } else {
            break;
        }
    }

    const category = rankName.replace(/[0-9]/g, '');

    return {
        rankName: rankName,
        category: category
    };
}

// Ez a sor a kulcs: a modern JavaScript (Frontend) számára
export { rankCalculator };

// Ez a sor a Node.js (Backend) számára, ha még require-t használsz
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { rankCalculator };
}
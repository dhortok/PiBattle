function xp_to_levels(xp) {   
    // Ez egy egyszerű leveling up rendszer
    // Jelenleg csak tesz, később bonyolultabb lesz...
    const LEVEL_CAPACITY = 1000; // Később ez lehet egy függvény is
    const level = Math.trunc(xp / LEVEL_CAPACITY);
    const xpInCurrentLevel = xp % LEVEL_CAPACITY;
    
    return {
        level: level,
        xpInCurrentLevel: xpInCurrentLevel,
        nextLevelAt: LEVEL_CAPACITY, // A szint teljesítéséhez szükséges mennyiség
        progressPercentage: (xpInCurrentLevel / LEVEL_CAPACITY) * 100
    };
}

// Ez a sor a kulcs: a modern JavaScript (Frontend) számára
export { xp_to_levels };

// Ez a sor a Node.js (Backend) számára, ha még require-t használsz
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { xp_to_levels };
}
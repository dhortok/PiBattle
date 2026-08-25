const categories = {
    algb: "algebra",
    geom: "geometria",
    func: "függvények",
    sets: "halmazok",
    komb: "kombinatorika",
    prob: "valőszínűségszámítás"
};

// Ez a sor a kulcs: a modern JavaScript (Frontend) számára
export { categories };

// Ez a sor a Node.js (Backend) számára, ha még require-t használsz
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { categories };
}
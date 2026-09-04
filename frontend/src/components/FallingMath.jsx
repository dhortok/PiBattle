/* 
Ez a React komponens megcsinálja, hogy a háttérben matematikai szimbólumok essenek le
Szerintem nagyon jó lesz (remélem, mert amikor írom ezt, még nincs kész...)!
*/
const matekSzimbolumok = [
    // Alapműveletek és egyenlőségek
    "+", "-", "×", "*", "÷", "/", "=", "≠", "≈", "±",
  
    // Relációk és viszonyok
    "<", ">", "≤", "≥", "∝", "≡", "≅", "∼",
  
    // Gyökvonás, hatványozás, zárójelek
    "√",
  
    // Halmazelmélet és logika
    "∈", "∉", "⊂", "⊃", "⊆", "⊇", "∪", "∩", "∅", "∁",
    "∀", "∃", "∄", "∧", "∨",
  
    // Analízis és egyenletek
    "∞", "∑", "∏", "∫", "∮", "∂", "∇", "∆",
  
    // Szögek és geometria
    "∠", "∡", "∟", "°", "∥", "∦", "⊥",
  
    // Görög betűk (kisbetűk)
    "α", "β", "γ", "δ", "ε", "θ", "λ", "μ", "π", "σ", "τ", "φ", "ω",
  
    // Görög betűk (nagybetűk)
    "Γ", "Δ", "Θ", "Λ", "Ξ", "Π", "Σ", "Φ", "Ψ", "Ω",
  
    // Egyéb gyakori jelek
    "%", "‰", "!", "ƒ", "ℵ"
];

const pi = ["π"];


export default function FallingMath() {
    let symbolsOnScreen = [];
    
    /* EZ AZ ALAP (mindenféle matek szimbólum)
    for (let i = 0; i < 120; i++) {
        symbolsOnScreen.push({
            id: i,
            character: matekSzimbolumok[Math.floor(Math.random() * matekSzimbolumok.length)],
            size: Math.floor(6 + (Math.random() * 15)),
            speed: Math.floor(5 + (Math.random() * 15)),
            opacity: (0.15 + (Math.random() * 0.55)),
            posX: Math.floor(Math.random() * 100),
            delay: Math.floor((Math.random() * 10) - 10)
        })
    }
    */

    /* CSAK PI */
    for (let i = 0; i < 120; i++) {
        symbolsOnScreen.push({
            id: i,
            character: pi[Math.floor(Math.random() * pi.length)],
            size: Math.floor(6 + (Math.random() * 25)),
            speed: Math.floor(5 + (Math.random() * 15)),
            opacity: (0.15 + (Math.random() * 0.55)),
            posX: Math.floor(Math.random() * 100),
            delay: Math.floor((Math.random() * 10) - 10)
        })
    }


    return (
        <div className="falling-bg">
            {
                symbolsOnScreen.map((item) => (
                    <span 
                        key={item.id}
                        className="falling-char"
                        style={{
                            "--x": `${item.posX}%`,
                            "--size": `${item.size}px`,
                            "--opacity": item.opacity,
                            "--duration": `${item.speed}s`,
                            "--delay": `${item.delay}s`,
                        }}
                    >
                        {item.character}
                    </span>
                ))
            }
        </div>
    );
}
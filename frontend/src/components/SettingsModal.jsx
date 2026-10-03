import { useState } from "react";
import { categories } from "../../../common/categories";

export default function SettingsModal({ initialSettings, onSave, onClose }) {
    const [localSettings, setLocalSettings] = useState({ ...initialSettings });
    const categoryArray = Object.entries(categories);

    const handleSave = () => {
        onSave(localSettings);
    };

    const roundsPre = [3, 5, 10, 15, 20];
    const maxTimePre = [10, 20, 30, 45, 60];

    return (
        <div className="modal-overlay">
        <div className="modal-card">
            <h3>Játék Beállítások</h3>

            <div className="lobby-card-selector">
                <label><b>Játékmód:</b></label>
                <div className="lobby-card-inputs">
                    <input 
                        type="radio" 
                        name="gameMode" 
                        id="gameMode_default"
                        value="default"
                        checked={localSettings.gameMode == "default"}
                        onChange={(e) => setLocalSettings({ ...localSettings, gameMode: e.target.value })}
                        className="lobby-sr-only"
                    />
                    <label htmlFor="gameMode_default" className="lobby-card">Klasszikus</label>

                    <input 
                        type="radio" 
                        name="gameMode" 
                        id="gameMode_extrem"
                        value="extrem"
                        checked={localSettings.gameMode == "extrem"}
                        onChange={(e) => setLocalSettings({ ...localSettings, gameMode: e.target.value })}
                        className="lobby-sr-only"
                    />
                    <label htmlFor="gameMode_extrem" className="lobby-card extrem">🔥 EXTRÉM</label>
                    
                    <input 
                        type="radio" 
                        name="gameMode" 
                        id="gameMode_survival"
                        value="survival"
                        checked={localSettings.gameMode == "survival"}
                        onChange={(e) => setLocalSettings({ ...localSettings, gameMode: e.target.value })}
                        className="lobby-sr-only"
                    />
                    <label htmlFor="gameMode_survival" className="lobby-card survival">❤ Túlélő</label>
                </div>
            </div>

            {/*Max játékosszám*/}
            <div className="lobby-card-selector">
                <label><b>Max Játékos:</b></label>
                <div className="lobby-card-inputs">
                    <input
                        type="range"
                        min="2"
                        max="20"
                        value={localSettings.maxPlayer}
                        onChange={(e) => setLocalSettings({ ...localSettings, maxPlayer: Number(e.target.value) })}
                    />
                    <label>{localSettings.maxPlayer}</label>
                </div>
            </div>
            
            {/*Körök száma*/}
            <div className={`lobby-card-selector`}>
                <label><b>Körök:</b></label>
                <div className="lobby-card-inputs">
                    {localSettings.gameMode !== "survival" && (
                        <>
                            {/* Előre definiált körök */}
                            {roundsPre.map((item) => (
                                <div key={"round_" + item} className="radio-group">
                                    <input 
                                        type="radio" 
                                        name="rounds" 
                                        id={"round_" + item}
                                        value={item}
                                        checked={localSettings.rounds === item}
                                        onChange={(e) => setLocalSettings({ ...localSettings, rounds: Number(e.target.value) })}
                                        className="lobby-sr-only"
                                    />
                                    <label htmlFor={"round_" + item} className="lobby-card">{item}</label>
                                </div>
                            ))}

                            {/* Egyedi érték */}
                            <div className="radio-group">
                                <input 
                                    type="radio" 
                                    name="rounds" 
                                    id="round_custom"
                                    onChange={() => {
                                        if (roundsPre.includes(localSettings.rounds)) {
                                            setLocalSettings({ ...localSettings, rounds: 12 });
                                        }
                                    }}
                                    checked={!roundsPre.includes(localSettings.rounds)}
                                    className="lobby-sr-only"
                                />
                                <label htmlFor="round_custom" className="lobby-card custom-card">
                                    <input 
                                        type="number"
                                        min="3"
                                        max="20"
                                        placeholder="?"
                                        value={!roundsPre.includes(localSettings.rounds) ? localSettings.rounds : ""}
                                        onChange={(e) => {
                                            let val = parseInt(e.target.value, 10);
                                            val = val > 20 ? 20 : val;
                                            setLocalSettings({ 
                                            ...localSettings, 
                                            rounds: isNaN(val) ? "" : val 
                                            });
                                        }}
                                        className="custom-round-input"
                                    />
                                </label>
                            </div>
                        </>
                    )}
                    {localSettings.gameMode === "survival" && (
                        <label>Nem lehet megadni kört "Survival" módban!</label>
                    )}
                </div>
            </div>

            {/*Max idő válaszolásra*/}
            <div className="lobby-card-selector">
                <label><b>Idő (mp):</b></label>
                <div className="lobby-card-inputs">
                    <>
                        {/* Előre definiált körök */}
                        {maxTimePre.map((item) => (
                            <div key={"maxTime_" + item} className="radio-group">
                                <input 
                                    type="radio" 
                                    name="maxTime" 
                                    id={"maxTime_" + item}
                                    value={item * 1000}
                                    checked={localSettings.maxQuestionTime == (item * 1000)}
                                    onChange={(e) => setLocalSettings({ ...localSettings, maxQuestionTime: Number(e.target.value) })}
                                    className="lobby-sr-only"
                                />
                                <label htmlFor={"maxTime_" + item} className="lobby-card">{item}</label>
                            </div>
                        ))}
                        {/* Egyedi érték */}
                        <div className="radio-group">
                            <input 
                                type="radio" 
                                name="maxTime" 
                                id="maxTime_custom"
                                onChange={() => {
                                    if (maxTimePre.includes(localSettings.maxQuestionTime / 1000)) {
                                        setLocalSettings({ ...localSettings, maxQuestionTime: 90000 });
                                    }
                                }}
                                checked={!maxTimePre.includes(localSettings.maxQuestionTime / 1000)}
                                className="lobby-sr-only"
                            />
                            <label htmlFor="maxTime_custom" className="lobby-card custom-card">
                                <input 
                                    type="number"
                                    min="10"
                                    max="90"
                                    placeholder="?"
                                    value={!maxTimePre.includes(localSettings.maxQuestionTime / 1000) ? localSettings.maxQuestionTime / 1000 : ""}
                                    onChange={(e) => {
                                        let val = parseInt(e.target.value, 10);
                                        val = val > 90 ? 90 : val;
                                        setLocalSettings({ 
                                            ...localSettings, 
                                            maxQuestionTime: isNaN(val) ? "" : (val * 1000)
                                        });
                                    }}
                                    className="custom-round-input"
                                />
                            </label>
                        </div>
                    </>
                </div>
            </div>

            {/*Kategória*/}
            <div className="lobby-card-selector">
                <label><b>Kategória:</b></label>
                <div className="lobby-card-inputs">
                    <div key="random" className="radio-group">
                        <input
                            type="radio"
                            name="category"
                            id="random"
                            value="random"
                            checked={"random" === localSettings.category}
                            onChange={() => setLocalSettings({ ...localSettings, category: "random" })}
                            className="lobby-sr-only"
                        />
                        <label htmlFor="random" className="lobby-card">🔀 RANDOM</label>
                    </div>
                    {categoryArray.map(([key, value]) => (
                        <div key={key} className="radio-group">
                        <input
                            type="radio"
                            name="category"
                            id={key}
                            value={value}
                            checked={key === localSettings.category}
                            onChange={() => setLocalSettings({ ...localSettings, category: key })}
                            className="lobby-sr-only"
                        />
                        <label htmlFor={key} className="lobby-card">{value}</label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="modal-actions">
            <button className="btn btn-primary" onClick={handleSave}>Mentés</button>
            <button className="btn btn-outline" onClick={onClose}>Mégse</button>
            </div>
        </div>
        </div>
    );
}
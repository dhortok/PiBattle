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

            {/*Max játékosszám*/}
            <div className="lobby-card-selector">
                <label><b>Max Játékos:</b> {localSettings.maxPlayer}</label>
                <input
                    type="range"
                    min="2"
                    max="20"
                    value={localSettings.maxPlayer}
                    onChange={(e) => setLocalSettings({ ...localSettings, maxPlayer: Number(e.target.value) })}
                />
            </div>
            
            {/*Körök száma*/}
            <div className={`lobby-card-selector`}>
                <label><b>Körök:</b></label>
                {localSettings.gameMode !== "survival" && roundsPre.map((item) => (
                    <div key={"round_" + item} className="radio-group">
                        <input 
                            type="radio" 
                            name="rounds" 
                            id={"round_" + item}
                            value={item}
                            checked={localSettings.rounds == item}
                            onChange={(e) => setLocalSettings({ ...localSettings, rounds: Number(e.target.value) })}
                            className="lobby-sr-only"
                        />
                        <label htmlFor={"round_" + item} className="lobby-card">{item}</label>
                    </div>
                ))}
                {localSettings.gameMode === "survival" && (
                    <label>Nem lehet megadni kört "Survival" módban!</label>
                )}
            </div>

            {/*Max idő válaszolásra*/}
            <div className="lobby-card-selector">
                <label><b>Idő (mp):</b></label>
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
            </div>

            {/*Kategória*/}
            <div className="lobby-card-selector">
            <label><b>Kategória:</b></label>
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

            <div className="modal-actions">
            <button className="btn btn-primary" onClick={handleSave}>Mentés</button>
            <button className="btn btn-outline" onClick={onClose}>Mégse</button>
            </div>
        </div>
        </div>
    );
}
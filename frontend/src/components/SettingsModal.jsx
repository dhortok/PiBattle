import { useState } from "react";
import { categories } from "../../../common/categories";

export default function SettingsModal({ initialSettings, onSave, onClose }) {
    const [localSettings, setLocalSettings] = useState({ ...initialSettings });
    const categoryArray = Object.entries(categories);

    const handleSave = () => {
        onSave(localSettings);
    };

    return (
        <div className="modal-overlay">
        <div className="modal-card">
            <h3>Játék Beállítások</h3>

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
            <div className="lobby-card-selector">
                <label><b>Körök:</b></label>
                <input 
                    type="radio" 
                    name="rounds" 
                    id="round_3"
                    value={3}
                    checked={localSettings.rounds == 3}
                    onChange={(e) => setLocalSettings({ ...localSettings, rounds: Number(e.target.value) })}
                    className="lobby-sr-only"
                />
                <label htmlFor="round_3" className="lobby-card">3</label>

                <input 
                    type="radio" 
                    name="rounds" 
                    id="round_5"
                    value={5}
                    checked={localSettings.rounds == 5}
                    onChange={(e) => setLocalSettings({ ...localSettings, rounds: Number(e.target.value) })}
                    className="lobby-sr-only"
                />
                <label htmlFor="round_5" className="lobby-card">5</label>

                <input 
                    type="radio" 
                    name="rounds" 
                    id="round_10"
                    value={10}
                    checked={localSettings.rounds == 10}
                    onChange={(e) => setLocalSettings({ ...localSettings, rounds: Number(e.target.value) })}
                    className="lobby-sr-only"
                />
                <label htmlFor="round_10" className="lobby-card">10</label>

                <input 
                    type="radio" 
                    name="rounds" 
                    id="round_15"
                    value={15}
                    checked={localSettings.rounds == 15}
                    onChange={(e) => setLocalSettings({ ...localSettings, rounds: Number(e.target.value) })}
                    className="lobby-sr-only"
                />
                <label htmlFor="round_15" className="lobby-card">15</label>

                <input 
                    type="radio" 
                    name="rounds" 
                    id="round_20"
                    value={20}
                    checked={localSettings.rounds == 20}
                    onChange={(e) => setLocalSettings({ ...localSettings, rounds: Number(e.target.value) })}
                    className="lobby-sr-only"
                />
                <label htmlFor="round_20" className="lobby-card">20</label>
            </div>

            {/*Max idő válaszolásra*/}
            <div className="lobby-card-selector">
                <label><b>Idő (mp):</b></label>
                <input 
                    type="radio" 
                    name="maxTime" 
                    id="maxTime_10"
                    value={10000}
                    checked={localSettings.maxQuestionTime == 10000}
                    onChange={(e) => setLocalSettings({ ...localSettings, maxQuestionTime: Number(e.target.value) })}
                    className="lobby-sr-only"
                />
                <label htmlFor="maxTime_10" className="lobby-card">10</label>

                <input 
                    type="radio" 
                    name="maxTime" 
                    id="maxTime_20"
                    value={20000}
                    checked={localSettings.maxQuestionTime == 20000}
                    onChange={(e) => setLocalSettings({ ...localSettings, maxQuestionTime: Number(e.target.value) })}
                    className="lobby-sr-only"
                />
                <label htmlFor="maxTime_20" className="lobby-card">20</label>

                <input 
                    type="radio" 
                    name="maxTime" 
                    id="maxTime_30"
                    value={30000}
                    checked={localSettings.maxQuestionTime == 30000}
                    onChange={(e) => setLocalSettings({ ...localSettings, maxQuestionTime: Number(e.target.value) })}
                    className="lobby-sr-only"
                />
                <label htmlFor="maxTime_30" className="lobby-card">30</label>

                <input 
                    type="radio" 
                    name="maxTime" 
                    id="maxTime_45"
                    value={45000}
                    checked={localSettings.maxQuestionTime == 45000}
                    onChange={(e) => setLocalSettings({ ...localSettings, maxQuestionTime: Number(e.target.value) })}
                    className="lobby-sr-only"
                />
                <label htmlFor="maxTime_45" className="lobby-card">45</label>

                <input 
                    type="radio" 
                    name="maxTime" 
                    id="maxTime_60"
                    value={60000}
                    checked={localSettings.maxQuestionTime == 60000}
                    onChange={(e) => setLocalSettings({ ...localSettings, maxQuestionTime: Number(e.target.value) })}
                    className="lobby-sr-only"
                />
                <label htmlFor="maxTime_60" className="lobby-card">60</label>
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
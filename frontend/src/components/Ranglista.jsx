import { useEffect, useState } from "react";
import {rankCalculator} from "../../../common/rank.js"

export default function Ranglista({rankList}) {
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        const maxItem = Object.entries(rankList).length;

        const interval = setInterval(() => {
            setCurrentPage((prevPage) => (prevPage + 1) % maxItem);
            console.log(currentPage);
        }, 10000);
        
        return () => clearInterval(interval); 
    }, [rankList]);


    return (
        <div className="ranglista-table">
            {Object.entries(rankList).map(([category, list], i) => 
            i===currentPage && (
                <div key={i} className={`card ${category} fade-in`}>
                    <h4 className={`rang-category ${category}`}>{category}</h4>
                    {list.slice(0, 10).map((p, i) => (
                        <div key={i} className="ranglista-row">
                            <span className="ranglista-pos">{i+1}.</span>
                            <span className="ranglista-nev">&#128100; {p.username}</span>
                            <span className={`ranglista-badge rank-${rankCalculator(p.rang).category}`}>{rankCalculator(p.rang).rankName}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
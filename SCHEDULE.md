# Project Schedule
- 2026-03-01: Lobbirendszer
- 2026-03-08: Kérdésgenerátor pár témakörben
- 2026-03-15: Játékmenet alapjának megvalósítása
- 2026-03-22: Pontozási rendszer, egyéb játékmódok
- 2026-03-29: Adatbázis alapjai, felhasználókezelés
- 2026-04-05: Eredmények eltárolása, XP rendszer megvalósítása
- 2026-04-12: Rangsorolási rendszer 1
- 2026-04-19: Rangsorolási rendszer 2
- 2026-04-26: Frontend UI megvalósítása egyszerűen
- 2026-05-03: Tesztek
- 2026-05-10: Rendszer gyorsítása, biztonság felülvizsgálata
- 2026-05-17: Utolsó simítások

## Lobbirendszer
A valós idejű lobby rendszer kialakítása, ahol a játékosok szobát hozhatnak létre és csatlakozhatnak. A host beállíthatja a játékmódot, kérdések számát, időkorlátot és nehézséget.

## Kérdésgenerátor pár témakörben
Paraméterezett matematikai feladatgenerátor implementálása középiskolai témákban (pl. algebra). A rendszer automatikusan számolja a helyes választ és generál zavaró opciókat. Támogatja a fix és nehezedő nehézségi módot.

## Játékmenet alapjának megvalósítása
A teljes meccsfolyamat implementálása: kérdés kiosztás, időzítés, válasz fogadás és kiértékelés. A szerver kezeli a játék állapotát és biztosítja a szinkronizált élményt. Körönként frissülő eredménylista jelenik meg.

## Pontozási rendszer, egyéb játékmódok
Többféle pontozási mechanizmus bevezetése (időalapú, streak bónusz, büntetéses mód). Új játékmódok implementálása, például Survival és Time Attack. A pontszámítás teljesen szerveroldalon történik.

## Adatbázis alapjai, felhasználókezelés
Az adatbázis séma kialakítása felhasználók, meccsek és eredmények tárolására. Regisztráció és bejelentkezés. Alap profilkezelés és statisztika tárolás.

## Eredmények eltárolása, XP rendszer megvalósítása
A meccsek eredményeinek tartós mentése és XP alapú fejlődési rendszer bevezetése. Szintlépési mechanizmus és teljesítményhez kötött jutalmazás kialakítása. A játékos profilban megjelennek a statisztikák.

## Rangsorolási rendszer 1
Rangsorolás alapjai: rangpontok kiosztásának megvalósítása, ami másik játékoshoz képest osztja ki a pontokat. Ennek tárolása adatbázisba. Tierek megvalósítása (Bronz, Ezüst, Arany, stb.)

## Rangsorolási rendszer 2
Algoritmus programozása, mely a Rang mód esetén besorolja a  játékosokat a tier alapján. 

## Frontend UI megvalósítása egyszerűen
Reszponzív, letisztult felhasználói felület kialakítása a lobbyhoz, játékhoz és profilhoz. Mobilbarát elrendezés és egyszerű, játékos dizájn alkalmazása. Alap animációk és vizuális visszajelzések bevezetése.

## Tesztek
Funkcionális és multiplayer tesztelés különböző játékszituációkban. Edge case-ek és szinkronizációs hibák vizsgálata. Hibajavítás és stabilitás növelése.

## Rendszer gyorsítása, biztonság felülvizsgálata
Teljesítményoptimalizálás adatbázis- és WebSocket-szinten. Input validáció és alapvető biztonsági védelem (rate limiting, injection elleni védelem). Terheléses tesztelés.

## Utolsó simítások
UI finomhangolás, kisebb hibák javítása és felhasználói élmény javítása. Dokumentáció elkészítése és végső tesztelés. Felkészítés éles telepítésre.
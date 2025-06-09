# Webáruház alkalmazás specifikáció

## Tartalomjegyzék

1. [Bevezetés](#1-bevezetés)
2. [Célközönség](#2-célközönség)
3. [Funkcionális követelmények](#3-funkcionális-követelmények)
    1. [Felhasználói (vásárlói) felület](#31-felhasználói-vásárlói-felület)
        1. [Termékek böngészése](#311-termékek-böngészése)
        2. [Kosár kezelése](#312-kosár-kezelése)
        3. [Pénztár folyamat](#313-pénztár-folyamat)
    2. [Adminisztrációs felület](#32-adminisztrációs-felület)
        1. [Bejelentkezés](#321-bejelentkezés)
        2. [Rendelések kezelése](#322-rendelések-kezelése)
4. [Nem funkcionális követelmények](#4-nem-funkcionális-követelmények)
    1. [Felhasználhatóság](#41-felhasználhatóság)
    2. [Biztonság (alapvető)](#42-biztonság-alapvető)
    3. [Teljesítmény (alapvető)](#43-teljesítmény-alapvető)
5. [Adatmodell (magas szintű)](#5-adatmodell-magas-szintű)
6. [Felhasználói felület vázlatok (magas szintű)](#6-felhasználói-felület-vázlatok-magas-szintű)
    1. [Termékoldal (index.html)](#61-termékoldal-indexhtml)
    2. [Pénztár oldal (checkout.html)](#62-pénztár-oldal-checkouthtml)
    3. [Admin felület (admin.html)](#63-admin-felület-adminhtml)
7. [Technológiai verem](#7-technológiai-verem)

## 1. Bevezetés

Ez a dokumentum a "Webáruház" elnevezésű egyszerű e-kereskedelmi alkalmazás specifikációját tartalmazza. Az alkalmazás célja, hogy lehetővé tegye a felhasználók számára termékek böngészését, kosárba helyezését és megrendelését, valamint az adminisztrátorok számára a beérkezett rendelések kezelését.

## 2. Célközönség

* **Vásárlók:** Olyan felhasználók, akik online szeretnének termékeket vásárolni.
* **Adminisztrátorok:** Az áruház üzemeltetői, akik a rendeléseket és a termékeket (bár a termékkezelés jelenleg nem része a specifikációnak) kezelik.

## 3. Funkcionális követelmények

### 3.1. Felhasználói (vásárlói) felület

#### 3.1.1. Termékek böngészése

* **F-V1:** A rendszernek meg kell jelenítenie az elérhető termékeket a főoldalon.
* **F-V2:** Minden terméknél meg kell jeleníteni a nevét, képét (ha van), leírását (ha van) és árát.
* **F-V3:** A felhasználónak lehetősége kell legyen megadni a kívánt mennyiséget minden termékből.

#### 3.1.2. Kosár kezelése

* **F-V4:** A rendszernek dinamikusan kell frissítenie a kosár tartalmának végösszegét, ahogy a felhasználó módosítja a termékek mennyiségét.
* **F-V5:** A felhasználónak lehetősége kell legyen a kosár tartalmával a pénztár oldalra navigálni.
* **F-V6:** A kosár tartalmának és a végösszegnek át kell adódnia a pénztár oldalra.

#### 3.1.3. Pénztár folyamat

* **F-V7:** A pénztár oldalon meg kell jeleníteni a kosárban lévő termékek összegzését és a teljes fizetendő végösszeget.
* **F-V8:** A felhasználónak meg kell tudnia adni a szállítási adatait (teljes név, email cím, telefonszám, irányítószám, település, cím).
* **F-V9:** A rendszernek validálnia kell a megadott szállítási adatokat (pl. kötelező mezők, email formátum, irányítószám formátum).
* **F-V10:** Érvénytelen adatok esetén a rendszernek hibaüzenetet kell megjelenítenie.
* **F-V11:** A felhasználónak el kell tudnia küldeni a megrendelését.
* **F-V12:** Sikeres rendelésleadás után a rendszernek visszajelzést kell adnia a felhasználónak (pl. rendelési azonosító).
* **F-V13:** Sikeres rendelésleadás után a kosárnak ki kell ürülnie.
* **F-V14:** Ha a felhasználó üres kosárral érkezik a pénztár oldalra, a rendszernek erről tájékoztatnia kell, és nem engedélyezheti a rendelés leadását.

### 3.2. Adminisztrációs felület

#### 3.2.1. Bejelentkezés

* **F-A1:** Az adminisztrációs felületnek jelszóval védettnek kell lennie.
* **F-A2:** Az adminisztrátornak be kell tudnia jelentkezni felhasználónév és jelszó megadásával.
* **F-A3:** Sikertelen bejelentkezési kísérlet esetén a rendszernek hibaüzenetet kell adnia.
* **F-A4:** Sikeres bejelentkezés után az adminisztrátornak hozzá kell férnie a rendeléskezelő funkciókhoz.
* **F-A5:** Az adminisztrátornak ki kell tudnia jelentkezni a rendszerből.

#### 3.2.2. Rendelések kezelése

* **F-A6:** Az adminisztrátornak listázva kell látnia a beérkezett rendeléseket.
* **F-A7:** A rendelési listában meg kell jeleníteni a rendelés azonosítóját, a vevő nevét, email címét, szállítási címét, a megrendelés dátumát és a postázás állapotát/dátumát.
* **F-A8:** Az adminisztrátornak meg kell tudnia tekinteni egy adott rendelés részleteit (a rendelt tételeket, azok mennyiségét és árát).
* **F-A9:** Az adminisztrátornak lehetősége kell legyen egy rendelést "postázottnak" jelölni (aktuális dátummal).
* **F-A10:** Az adminisztrátornak lehetősége kell legyen egy rendelést törölni.

## 4. Nem funkcionális követelmények

### 4.1. Felhasználhatóság

* **NF-U1:** Az alkalmazásnak intuitív, könnyen kezelhető felülettel kell rendelkeznie mind a vásárlók, mind az adminisztrátorok számára.
* **NF-U2:** Az alkalmazásnak reszponzívnak kell lennie, hogy megfelelően jelenjen meg különböző képernyőméreteken (asztali, tablet, mobil).

### 4.2. Biztonság (alapvető)

* **NF-S1:** Az adminisztrátori jelszavakat hash-elve kell tárolni az adatbázisban.
* **NF-S2:** Az adminisztrátori felülethez való hozzáférést JWT (JSON Web Token) alapú authentikációval kell védeni.

### 4.3. Teljesítmény (alapvető)

* **NF-P1:** Az oldalaknak elfogadható sebességgel kell betöltődniük.
* **NF-P2:** Az adatbázis-lekérdezéseknek hatékonynak kell lenniük.

## 5. Adatmodell (magas szintű)

Az alkalmazás a következő fő entitásokat kezeli:

* **Termékek:** Név, leírás, ár, kép URL.
* **Rendelések:** Vevő adatai (név, email, telefon, cím), megrendelés dátuma, postázás dátuma.
* **Rendelési tételek:** Kapcsolat a rendelés és a termék között, tartalmazza a rendelt mennyiséget.
* **Admin felhasználók:** Felhasználónév, jelszó hash.

*(Részletes adatbázis séma a `docs/backend.md` dokumentációban található.)*

## 6. Felhasználói felület vázlatok (magas szintű)

### 6.1. Termékoldal (index.html)

* Fejléc: "Termékeink" cím.
* Fő tartalom: Termékkártyák rácsos elrendezésben. Minden kártya tartalmazza a termék képét, nevét, leírását, árát és egy mennyiség beviteli mezőt.
* Lábléc/Sticky elem: "Összesen: [Végösszeg] Ft" és egy "Megrendelés" gomb.

### 6.2. Pénztár oldal (checkout.html)

* Fejléc: "Pénztár" cím.
* Kétoszlopos elrendezés:
  * Jobb oldali oszlop: "Kosarad" összegzés (termékek listája, mennyiségek, részösszegek, teljes végösszeg).
  * Bal oldali oszlop: "Szállítási adatok" űrlap (név, email, telefon, irányítószám, település, cím).
* Űrlap alatt: "Megrendelés elküldése" gomb.

### 6.3. Admin felület (admin.html)

* Fejléc: "Admin felület - Rendelések" cím, "Kijelentkezés" gomb.
* Fő tartalom: "Beérkezett rendelések" táblázat.
  * Oszlopok: ID, Vevő neve, Email, Cím, Megrendelve, Postázva, Tételek (gomb), Műveletek (Postázás, Törlés gombok).
* Modális ablakok:
  * Bejelentkezési modal (ha nincs bejelentkezve).
  * Rendelési tételek megtekintésére szolgáló modal.

## 7. Alkalmazott technológiák

* **Frontend:**
  * HTML5
  * CSS3
  * Vanilla JavaScript (ES6+)
  * Bootstrap 5 (reszponzív design és komponensek)
* **Backend:**
  * Node.js
  * Express.js (web keretrendszer)
  * SQLite (adatbázis)
  * `better-sqlite3` (SQLite driver)
  * `bcrypt` (jelszó hash-elés)
  * `jsonwebtoken` (JWT token kezelés)
  * `cors` (Cross-Origin Resource Sharing)
  * `dotenv` (környezeti változók kezelése)
* **Adattárolás (kliensoldal):**
  * `localStorage` (kosár adatok átmeneti tárolása)
  * `sessionStorage` (admin token tárolása)

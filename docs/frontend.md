# Webáruház frontend fejlesztői dokumentáció

## Tartalomjegyzék

1. [Áttekintés](#1-áttekintés)
2. [Fájlstruktúra és technológiák](#2-fájlstruktúra-és-technológiák)
3. [Fő funkciók és komponensek](#3-fő-funkciók-és-komponensek)  
    3.1. [Termékoldal (`index.html`, `script.js`)](#31-termékoldal-indexhtml-scriptjs)  
    3.2. [Pénztár oldal (`checkout.html`, `checkout.js`)](#32-pénztár-oldal-checkouthtml-checkoutjs)  
    3.3. [Adminisztrációs felület (`admin.html`, `admin.js`)](#33-adminisztrációs-felület-adminhtml-adminjs)
4. [Kliensoldali adattárolás](#4-kliensoldali-adattárolás)
5. [Stílusok és külső könyvtárak](#5-stílusok-és-külső-könyvtárak)
6. [Tesztelés](#6-tesztelés)  
    6.1. [Manuális E2E tesztesetek](#61-manuális-e2e-tesztesetek)

## 1. Áttekintés

Ez a dokumentum a webáruház alkalmazás frontend részének technikai felépítését és működését ismerteti. A frontend HTML, CSS és vanilla JavaScript segítségével készült, a reszponzív megjelenésért és komponensekért a Bootstrap keretrendszer felel. A frontend három fő részből áll: a termékeket megjelenítő főoldal, a pénztár oldal és az adminisztrációs felület a rendelések kezelésére.

## 2. Fájlstruktúra és technológiák

A frontend fájljai a `public` mappában találhatók.

- **HTML fájlok:**
  - `index.html`: A webáruház főoldala, ahol a termékek listázódnak és a kosárba helyezhetők.
  - `checkout.html`: A pénztár oldal, ahol a felhasználó megadhatja szállítási adatait és véglegesítheti a rendelést.
  - `admin.html`: Az adminisztrációs felület a rendelések kezelésére.
- **JavaScript fájlok:**
  - `script.js`: Az `index.html` oldal logikáját tartalmazza (termékek lekérése, megjelenítése, kosárkezelés).
  - `checkout.js`: A `checkout.html` oldal logikáját kezeli (kosár megjelenítése, űrlap validáció, rendelés elküldése).
  - `admin.js`: Az `admin.html` oldal logikáját implementálja (bejelentkezés, rendelések listázása, műveletek).
- **CSS fájlok:**
  - `style.css`: Egyedi stílusdefiníciókat tartalmaz, amelyek kiegészítik a Bootstrap stílusait.
- **Technológiák:**
  - HTML5
  - CSS3
  - Vanilla JavaScript (ES6+)
  - Bootstrap 5.3

## 3. Fő funkciók és komponensek

### 3.1. Termékoldal (`index.html`, `script.js`)

- **Termékek dinamikus megjelenítése:**
  - A `script.js` a `/api/termekek` végpontról aszinkron módon (fetch) kéri le a termékadatokat.
  - A kapott adatokat Bootstrap kártyák formájában jeleníti meg a `termekek-kontener` div-ben.
  - Minden termékkártya tartalmazza a termék nevét, képét, leírását, árát és egy mennyiség beviteli mezőt.
- **Kosárkezelés:**
  - A felhasználó a mennyiség beviteli mezőkkel (`.mennyiseg-input`) állíthatja be a kívánt darabszámot.
  - A `handleMennyisegValtozas` függvény figyeli ezeknek a mezőknek a változását.
  - A `kosar` JavaScript objektum tárolja a kiválasztott termékek azonosítóját, mennyiségét és egyéb adatait (ár, név, kép, leírás).
- **Végösszeg számítása:**
  - A `kalkulalVegosszeg` függvény minden mennyiségváltozás után újraszámolja a kosárban lévő termékek összértékét.
  - A végösszeg a `vegosszeg` id-jú `<span>` elemben jelenik meg.
- **Navigáció a pénztárhoz:**
  - A "Megrendelés" gombra (`megrendeles-gomb`) kattintva a `script.js` összegyűjti a kosár tartalmát.
  - Kétféle formátumban menti a kosár adatait a `localStorage`-ba:
    - `kosarTartalmaAPinak`: Csak a `termek_id` és `mennyiseg` az API számára.
    - `kosarTartalmaCheckoutnak`: Több adat (név, ár, kép) a `checkout.html` oldalon való megjelenítéshez.
  - A `teljesVegosszeg` is mentésre kerül a `localStorage`-ba.
  - Ezután átirányítja a felhasználót a `checkout.html` oldalra.

### 3.2. Pénztár oldal (`checkout.html`, `checkout.js`)

- **Kosár összegzésének megjelenítése:**
  - A `checkout.js` betöltéskor kiolvassa a `localStorage`-ból a `kosarTartalmaCheckoutnak` és `teljesVegosszeg` adatokat.
  - Dinamikusan felépíti a "Kosarad" szekciót (`rendelt-tetelek-lista`), listázva a termékeket, azok mennyiségét és részösszegét.
  - Megjeleníti a teljes végösszeget (`checkout-vegosszeg`) és a kosárban lévő összes darabszámot (`kosar-darabszam`).
  - Ha a kosár üres (nincs adat a `localStorage`-ban), egy üzenetet jelenít meg, és elrejti a szállítási űrlapot.
- **Szállítási űrlap (`rendeles-urlap`):**
  - Bekéri a felhasználótól a szállítási adatokat (név, email, telefon, cím).
  - Bootstrap validációt használ (`needs-validation`, `novalidate` attribútumok, JavaScript `checkValidity()` metódus).
- **Űrlap validáció:**
  - A "Megrendelés elküldése" gombra kattintva az űrlap `submit` eseménye aktiválódik.
  - Az `event.preventDefault()` megakadályozza az alapértelmezett űrlapküldést.
  - A `this.checkValidity()` ellenőrzi az űrlapmezők érvényességét a HTML `required`, `pattern`, `type` attribútumok alapján.
  - Ha az űrlap érvénytelen, a `was-validated` osztály hozzáadódik az űrlaphoz, megjelenítve a Bootstrap hibaüzeneteit, és a feldolgozás leáll.
- **Rendelés elküldése:**
  - Ha az űrlap érvényes és a kosár nem üres:
    - A "Megrendelés elküldése" gomb letiltódik, és egy "Feldolgozás..." üzenet jelenik meg rajta.
    - Az űrlapadatok és a `kosarAPinak` (API-nak szánt kosáradatok) egy objektumba kerülnek.
    - Aszinkron `fetch` kérés indul a `/api/rendeles` POST végpontra a rendelési adatokkal.
    - Sikeres válasz (201 Created) esetén:
      - `alert` üzenet jelenik meg a sikeres rendelésről és a rendelési azonosítóról.
      - A `localStorage`-ból törlődnek a kosárra vonatkozó adatok (`kosarTartalmaAPinak`, `kosarTartalmaCheckoutnak`, `teljesVegosszeg`).
      - A felhasználó visszairányítódik az `index.html` oldalra.
    - Hiba esetén `alert` üzenet jelenik meg a hibáról, és a gomb visszaáll aktív állapotba.

### 3.3. Adminisztrációs felület (`admin.html`, `admin.js`)

- **Bejelentkezés:**
  - Az oldal betöltésekor az `initAdminPage` ellenőrzi, van-e érvényes `adminToken` a `sessionStorage`-ben.
  - Ha nincs token, egy Bootstrap modális ablak (`loginModal`) jelenik meg a bejelentkezési űrlappal (`adminLoginFormModal`).
  - A bejelentkezési űrlap elküldésekor a `/api/admin/login` POST végpontra küld kérést a felhasználónévvel és jelszóval.
  - Sikeres bejelentkezés esetén a kapott JWT token eltárolódik az `adminToken` változóban és a `sessionStorage`-ben, a modális ablak bezáródik, és a rendelések lekérése (`fetchRendelesek`) elindul.
  - Sikertelen bejelentkezés esetén hibaüzenet jelenik meg a modális ablakban.
- **Kijelentkezés:**
  - A "Kijelentkezés" gombra (`logoutButton`) kattintva törlődik az `adminToken` a `sessionStorage`-ből és a változóból, majd a felhasználó átirányítódik az `index.html` oldalra a `window.location.replace()` segítségével (hogy a "vissza" gomb ne hozza vissza az admin felületre).
- **Rendelések listázása:**
  - A `fetchRendelesek` függvény a `/api/admin/rendelesek` GET végpontról kéri le a rendeléseket, az `Authorization: Bearer <token>` fejlécet használva.
  - A `renderRendelesek` függvény dinamikusan felépíti a rendelések táblázatát (`rendelesekTablaBody`).
  - Minden sor tartalmazza a rendelés főbb adatait és gombokat a műveletekhez.
  - Token hiba (pl. 403) esetén a `handleAuthError` függvény kezeli a hibát (token törlése, bejelentkezési modal megjelenítése).
- **Rendelési tételek megtekintése:**
  - A "Tételek" gombra kattintva a `showTetelek(rendelesId)` függvény hívódik meg.
  - Lekéri az adott rendelés tételeit a `/api/admin/rendelesek/:id` GET végpontról.
  - A tételeket egy Bootstrap modális ablakban (`tetelekModal`) jeleníti meg egy táblázatban.
- **Postázás kezelése:**
  - A "Postázás" (kamion ikon) gombra kattintva a `handlePostazas(rendelesId)` függvény fut le.
  - Megerősítést kér a felhasználótól.
  - A `/api/admin/rendelesek/:id/postazas` PUT végpontra küld kérést az aktuális dátummal.
  - Sikeres frissítés után újratölti a rendelési listát (`fetchRendelesek`).
- **Rendelés törlése:**
  - A "Törlés" (kuka ikon) gombra kattintva a `handleTorles(rendelesId)` függvény aktiválódik.
  - Megerősítést kér a felhasználótól.
  - A `/api/admin/rendelesek/:id` DELETE végpontra küld kérést.
  - Sikeres törlés után újratölti a rendelési listát.

## 4. Kliensoldali adattárolás

- **`localStorage`:**
  - `kosarTartalmaAPinak`: A kosár tartalmát tárolja JSON stringként, az API számára szükséges formátumban. A `checkout.html` oldalról kerül elküldésre, majd sikeres rendelés után törlődik.
  - `kosarTartalmaCheckoutnak`: A kosár tartalmát tárolja JSON stringként, bővebb adatokkal a `checkout.html` oldalon való megjelenítéshez. Sikeres rendelés után törlődik.
  - `teljesVegosszeg`: A kosár aktuális végösszegét tárolja. Sikeres rendelés után törlődik.
- **`sessionStorage`:**
  - `adminToken`: Az adminisztrátor bejelentkezésekor kapott JWT tokent tárolja. A böngésző munkamenetének végéig (vagy kijelentkezésig) érvényes.

## 5. Stílusok és külső könyvtárak

- **Bootstrap 5.3:** A reszponzív dizájnért, a rácsrendszerért, az alapvető stílusokért és a komponensekért (kártyák, modális ablakok, gombok, űrlapok, táblázatok, spinnerek) felel. A CDN-ről van betöltve.
- **Bootstrap Icons 1.11.1:** Ikonokat biztosít az alkalmazáshoz (pl. kosár, kamion, kuka ikonok). A CDN-ről van betöltve.
- **`style.css`:** Egyedi CSS szabályokat tartalmaz, amelyek felülírják vagy kiegészítik a Bootstrap stílusait (pl. termékkép méretezése, sticky összesítő).

## 6. Tesztelés

A frontend funkcionalitásának ellenőrzésére end-to-end (E2E) tesztesetek lettek definiálva. Ezeket manuálisan vagy automatizált tesztelő eszközökkel (pl. Cypress, Playwright) lehet végrehajtani.

### 6.1. Manuális E2E tesztesetek

A következő fő felhasználói útvonalakat érdemes tesztelni:

1. **Sikeres vásárlási folyamat:**
    - Termékek kosárba helyezése az `index.html` oldalon.
    - Végösszeg helyes frissülése.
    - Navigáció a `checkout.html` oldalra.
    - Kosár tartalmának és végösszegének ellenőrzése a pénztár oldalon.
    - Szállítási adatok kitöltése.
    - Sikeres rendelés leadása.
    - Visszairányítás a főoldalra, kosár és `localStorage` ürítése.
2. **Pénztár űrlap validációja:**
    - Kötelező mezők üresen hagyása és hibajelzések ellenőrzése.
    - Érvénytelen formátumú adatok megadása (pl. email, irányítószám) és hibajelzések ellenőrzése.
    - Sikeres kitöltés után a rendelés elküldése.
3. **Üres kosár a pénztár oldalon:**
    - Közvetlen navigáció a `checkout.html`-re üres `localStorage` mellett.
    - Megfelelő üzenet megjelenítése és az űrlap elrejtése/letiltása.
4. **Admin felület - Bejelentkezés és kijelentkezés:**
    - `admin.html` megnyitása, bejelentkezési modal megjelenése.
    - Sikertelen bejelentkezési kísérlet (hibás adatok).
    - Sikeres bejelentkezés, rendelési táblázat megjelenése.
    - Sikeres kijelentkezés, átirányítás a főoldalra.
    - Visszanavigálási kísérlet az admin felületre kijelentkezés után (bejelentkezési modalnak kell megjelennie).
5. **Admin felület - Rendelések kezelése:**
    - Rendelési tételek megtekintése modális ablakban.
    - Rendelés postázottnak jelölése.
    - Rendelés törlése.
    - A lista megfelelő frissülése a műveletek után.

Ezek a tesztesetek lefedik az alkalmazás alapvető működését és a felhasználói interakciókat.

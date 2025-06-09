# Tesztesetek a webáruházhoz

## 1. Teszteset: Sikeres vásárlási folyamat

**Cél:** Ellenőrizni, hogy a felhasználó képes-e termékeket a kosárba helyezni, és sikeresen leadni egy rendelést.

**Előfeltételek:**

* A backend szerver fut.
* A `tesztadatok.sql` alapján vannak termékek az adatbázisban.

**Lépések:**

1. **Nyisd meg az `index.html` oldalt.**
   * _Elvárt eredmény:_ Az oldal betöltődik, a "Termékeink" fejléc látható. A termékek kártyái megjelennek a termék nevével, leírásával, árával és egy mennyiség beviteli mezővel. A "Végösszeg" kezdetben "0 Ft".
2. **Válassz ki egy terméket (pl. "Edényfogó kesztyű") és növeld a mennyiségét 2-re a beviteli mezővel.**
   * _Elvárt eredmény:_ A "Végösszeg" frissül a 2 db "Edényfogó kesztyű" árával (pl. 2 * 1990 = 3980 Ft).
3. **Válassz ki egy másik terméket (pl. "Kötény") és növeld a mennyiségét 1-re.**
   * _Elvárt eredmény:_ A "Végösszeg" tovább frissül, hozzáadva az 1 db "Kötény" árát (pl. 3980 + 2990 = 6970 Ft).
4. **Kattints a "Megrendelés" gombra.**
   * _Elvárt eredmény:_ A böngésző átirányít a `checkout.html` oldalra.
5. **A `checkout.html` oldalon ellenőrizd a "Kosarad" szekciót.**
   * _Elvárt eredmény:_ A kosárban lévő termékek (2 db "Edényfogó kesztyű", 1 db "Kötény") helyesen jelennek meg a mennyiségekkel és árakkal. A "Végösszeg" megegyezik az `index.html` oldalon látottal (pl. 6970 Ft). A kosár darabszáma "3".
6. **Töltsd ki a "Szállítási adatok" űrlapot érvényes adatokkal:**
   * Teljes név: Teszt Elek
   * Email cím: <teszt@elek.hu>
   * Telefonszám: +36301234567
   * Irányítószám: 1234
   * Település: Tesztváros
   * Cím: Teszt utca 1.
7. **Kattints a "Megrendelés elküldése" gombra.**
   * _Elvárt eredmény:_ A gomb letiltódik, és egy "Feldolgozás..." üzenet jelenik meg rajta (ha a spinner implementáció aktív és elég lassú a folyamat). Rövid idő után egy `alert` ablak jelenik meg "Sikeres megrendelés! Rendelés azonosító: X..." üzenettel.
8. **Kattints az "OK"-ra az `alert` ablakban.**
   * _Elvárt eredmény:_ A böngésző visszairányít az `index.html` oldalra. A "Végösszeg" ismét "0 Ft". A `localStorage` `kosarTartalmaAPinak`, `kosarTartalmaCheckoutnak`, `teljesVegosszeg` elemei törlődtek.

* * *

## 2. Teszteset: Pénztár űrlap validációja

**Cél:** Ellenőrizni, hogy a pénztár oldalon az űrlap validációja megfelelően működik-e.

**Előfeltételek:**

* Legalább egy termék a kosárban van (az 1. teszteset 1-4. lépései után).
* A felhasználó a `checkout.html` oldalon van.

**Lépések:**

1. **Hagyd üresen a "Teljes név" mezőt, és töltsd ki a többi mezőt érvényesen.**
2. **Kattints a "Megrendelés elküldése" gombra.**
   * _Elvárt eredmény:_ A "Teljes név" mező alatt megjelenik a "Kérjük, adja meg a teljes nevét." hibaüzenet. A rendelés nem kerül elküldésre. Az űrlap megkapja a `was-validated` osztályt.
3. **Adj meg egy érvénytelen email címet (pl. "teszt@elek"), és töltsd ki a többi mezőt érvényesen.**
4. **Kattints a "Megrendelés elküldése" gombra.**
   * _Elvárt eredmény:_ Az "Email cím" mező alatt megjelenik a "Kérjük, adjon meg egy érvényes email címet." hibaüzenet. A rendelés nem kerül elküldésre.
5. **Adj meg egy érvénytelen irányítószámot (pl. "abc" vagy "123"), és töltsd ki a többi mezőt érvényesen.**
6. **Kattints a "Megrendelés elküldése" gombra.**
   * _Elvárt eredmény:_ Az "Irányítószám" mező alatt megjelenik az "Érvényes irányítószám szükséges (4 számjegy)." hibaüzenet. A rendelés nem kerül elküldésre.
7. **Töltsd ki az összes mezőt helyesen, majd kattints a "Megrendelés elküldése" gombra.**
   * _Elvárt eredmény:_ A rendelés sikeresen elküldésre kerül (lásd 1. teszteset 7-8. lépései).

* * *

## 3. Teszteset: Üres kosár a pénztár oldalon

**Cél:** Ellenőrizni, hogy az alkalmazás megfelelően kezeli-e, ha a felhasználó üres kosárral (vagy `localStorage` adatok nélkül) próbál a pénztár oldalra navigálni.

**Előfeltételek:**

* A `localStorage` `kosarTartalmaCheckoutnak` és `teljesVegosszeg` elemei üresek vagy nem léteznek.

**Lépések:**

1. **Nyisd meg közvetlenül a `checkout.html` oldalt a böngészőben.**
   * _Elvárt eredmény:_ Az oldalon egy üzenet jelenik meg: "A kosarad üres. Kérjük, válassz termékeket a megrendeléshez." Egy "Vissza a termékekhez" gomb is látható, ami az `index.html`-re mutat. A szállítási űrlap nem látható vagy le van tiltva.

* * *

## 4. Teszteset: Admin felület - Sikeres bejelentkezés és kijelentkezés

**Cél:** Ellenőrizni az adminisztrátori bejelentkezési és kijelentkezési folyamatot.

**Előfeltételek:**

* A backend szerver fut.
* Létezik az `admin` felhasználó a `tesztadatok.sql` vagy a `.env` fájlban megadott jelszóval.

**Lépések:**

1. **Nyisd meg az `admin.html` oldalt.**
   * _Elvárt eredmény:_ Egy bejelentkezési modális ablak jelenik meg "Admin bejelentkezés" címmel. A háttérben a táblázat helyén egy üzenet látható, hogy bejelentkezés szükséges.
2. **A modális ablakban adj meg helytelen felhasználónevet vagy jelszót (pl. Felhasználónév: "admin", Jelszó: "rosszjelszo").**
3. **Kattints a "Bejelentkezés" gombra.**
   * _Elvárt eredmény:_ A modális ablakban hibaüzenet jelenik meg (pl. "Hiba: Bejelentkezési hiba: 403 - Hibás jelszó"). A felhasználó bejelentkezve marad a modális ablakban.
4. **Adj meg helyes felhasználónevet ("admin") és jelszót (a konfigurált jelszó).**
5. **Kattints a "Bejelentkezés" gombra.**
   * _Elvárt eredmény:_ A modális ablak eltűnik. A "Beérkezett rendelések" táblázat feltöltődik a rendelési adatokkal. A "Kijelentkezés" gomb látható a fejlécben.
6. **Kattints a "Kijelentkezés" gombra.**
   * _Elvárt eredmény:_ A böngésző átirányít az `index.html` oldalra. A `sessionStorage`-ből törlődik az `adminToken`.
7. **Próbálj meg visszanavigálni az `admin.html` oldalra (pl. böngésző "vissza" gombjával vagy URL beírásával).**
   * _Elvárt eredmény:_ Ismét a bejelentkezési modális ablak jelenik meg.

* * *

## 5. Teszteset: Admin felület - Rendelések kezelése

**Cél:** Ellenőrizni a rendelések megtekintését, postázását és törlését az admin felületen.

**Előfeltételek:**

* Sikeresen bejelentkezve az admin felületre (lásd 4. teszteset 1-5. lépései).
* Vannak rendelések a rendszerben.

**Lépések:**

1. **Keress egy rendelést a listában, és kattints a "Tételek" gombra.**
   * _Elvárt eredmény:_ Megjelenik egy modális ablak "Rendelés tételei (ID: X)" címmel, benne a kiválasztott rendeléshez tartozó termékek nevével, árával, mennyiségével és összesített árával.
2. **Zárd be a "Rendelés tételei" modális ablakot.**
3. **Keress egy olyan rendelést, ami még nincs postázva. Kattints a "Postázás" (kamion ikon) gombra ennél a rendelésnél.**
   * _Elvárt eredmény:_ Megjelenik egy `confirm` párbeszédablak, ami megerősítést kér.
4. **Kattints az "OK"-ra a `confirm` ablakban.**
   * _Elvárt eredmény:_ A rendelési lista frissül. A kiválasztott rendelés "Postázva" oszlopában megjelenik az aktuális dátum.
5. **Keress egy rendelést (lehet az előbb postázott, vagy egy másik) és kattints a "Törlés" (kuka ikon) gombra.**
   * _Elvárt eredmény:_ Megjelenik egy `confirm` párbeszédablak, ami megerősítést kér a törléshez.
6. **Kattints az "OK"-ra a `confirm` ablakban.**
   * _Elvárt eredmény:_ A rendelési lista frissül, és a törölt rendelés már nem szerepel benne.

* * *

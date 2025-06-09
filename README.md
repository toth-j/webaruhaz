# Webáruház

## Vizsgaremek (2025. május)

Az alkalmazás egy egyszerű webáruházat valósít meg. A felhasználók a kezdőlapon megtekinthetik a termékeket, és megadhatják, hogy melyikből hányat szeretnének rendelni. A következő lapon a rendelésnél meg kell adni a megrendelő adatait (név, telefon, email, irányítószám, település, cím), majd el lehet küldeni a rendelést. A fizetés az átvételkor utánvéttel történik.

A rendszer adminisztrátorai bejelentkezés után:

- megtekinthetik a rendeléseket és azok tételeit,
- jelezhetik a megrendelt áruk postázását,
- törölhetnek megrendeléseket.

Az adatokat egy adatbázisban kell tárolni, amelyet egy API-n keresztül lehet elérni. Az elkészített alkalmazás erről az API-ról tölti le és jeleníti meg az adatokat.

* * *

## Telepítés és futtatás

### Szükséges szoftverek

- Node.js (LTS verzió ajánlott)
- npm (Node.js-sel együtt települ)

### Konfiguráció

1. Klónozd a projekt repository-t.

2. Navigálj a projekt gyökérkönyvtárába.

3. Hozz létre egy `.env` fájlt a gyökérkönyvtárban a következő tartalommal (Cseréld le a `JWT_SECRET` értékét egy titkos kulcsra):

   ```plaintext
   PORT=3000
   SECRET=titkoskulcs
   DEFAULT_ADMIN_PASSWORD=Minad123
   ```

4. Telepítsd a függőségeket: `npm install`

5. Az alkalmazás automatikusan létrehozza az admin felhasználót.

### Indítás

- A szerver indítása: `npm start` vagy `node server.js`
- Az alkalmazás elérhető lesz a `http://localhost:3000` címen).

## Dokumentáció

- A specifikáció, valamint a frontend és a backend dokumentációja a [docs mappában](docs) található.

## Tesztelés

- A manuális teszteket a [tests mappában](tests) találod.

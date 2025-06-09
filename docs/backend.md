# Webáruház backend fejlesztői dokumentáció

## Tartalomjegyzék

- [1. Áttekintés](#1-áttekintés)
- [2. Az adatbázis leírása](#2-az-adatbázis-leírása)
  - [Táblák](#táblák)
  - [Alapértelmezett admin felhasználó](#alapértelmezett-admin-felhasználó)
- [3. API végpontok leírása](#3-api-végpontok-leírása)
  - [3.1. Nyilvános végpontok](#31-nyilvános-végpontok)
  - [3.2. Admin végpontok](#32-admin-végpontok)
- [4. Tesztelés](#4-tesztelés)
- [5. Környezeti változók](#5-környezeti-változók)

## 1. Áttekintés

Ez a dokumentum a webáruház alkalmazás backend rendszerének technikai részleteit írja le. A backend Node.js és Express.js keretrendszerrel készült, adatbázisként SQLite-ot használ a `better-sqlite3` könyvtáron keresztül.

## 2. Az adatbázis leírása

Az alkalmazás egy `webaruhaz.db` nevű SQLite adatbázist használ. Az adatbázis a szerver indításakor automatikusan inicializálódik, és a szükséges táblák létrehozásra kerülnek, ha még nem léteznek.

### Táblák

#### 2.1. `termekek`

A webáruházban elérhető termékeket tárolja.

| Oszlop      | Típus    | Leírás                                   | Megkötések                      |
| :---------- | :------- | :--------------------------------------- | :------------------------------ |
| `id`        | INTEGER  | Elsődleges kulcs, automatikusan növekszik | PRIMARY KEY AUTOINCREMENT       |
| `nev`       | TEXT     | A termék neve                            | NOT NULL                        |
| `leiras`    | TEXT     | A termék részletes leírása               |                                 |
| `ar`        | INTEGER  | A termék ára                             | NOT NULL                        |
| `kep_url`   | TEXT     | A termék képének elérési útvonala        |                                 |

#### 2.2. `rendelesek`

A vásárlói rendelések fejadatait tárolja.

| Oszlop         | Típus    | Leírás                                     | Megkötések                      |
| :------------- | :------- | :----------------------------------------- | :------------------------------ |
| `id`           | INTEGER  | Elsődleges kulcs, automatikusan növekszik   | PRIMARY KEY AUTOINCREMENT       |
| `nev`          | TEXT     | A megrendelő neve                          | NOT NULL                        |
| `telefon`      | TEXT     | A megrendelő telefonszáma                  | NOT NULL                        |
| `email`        | TEXT     | A megrendelő email címe                    | NOT NULL                        |
| `cim`          | TEXT     | A megrendelő címe (utca, házszám)          | NOT NULL                        |
| `iranyitoszam` | TEXT     | A megrendelő irányítószáma                 | NOT NULL                        |
| `telepules`    | TEXT     | A megrendelő települése                    | NOT NULL                        |
| `megrendelve`  | TEXT     | A rendelés leadásának időpontja            | DEFAULT CURRENT_TIMESTAMP       |
| `postazva`     | TEXT     | A rendelés postázásának dátuma (YYYY-MM-DD) |                                 |

#### 2.3. `rendeles_tetelek`

Az egyes rendelésekhez tartozó terméktételeket tárolja. Kapcsolótábla a `rendelesek` és `termekek` között.

| Oszlop        | Típus   | Leírás                                   | Megkötések                                       |
| :------------ | :------ | :--------------------------------------- | :----------------------------------------------- |
| `id`          | INTEGER | Elsődleges kulcs, automatikusan növekszik | PRIMARY KEY AUTOINCREMENT                        |
| `rendeles_id` | INTEGER | Külső kulcs a `rendelesek` tábla `id`-jére | NOT NULL, FOREIGN KEY (`rendelesek`.`id`) ON DELETE CASCADE |
| `termek_id`   | INTEGER | Külső kulcs a `termekek` tábla `id`-jére   | NOT NULL, FOREIGN KEY (`termekek`.`id`)          |
| `mennyiseg`   | INTEGER | A rendelt termék mennyisége              | NOT NULL                                         |

#### 2.4. `admin`

Az adminisztrátori felülethez hozzáféréssel rendelkező felhasználókat tárolja.

| Oszlop          | Típus   | Leírás                                   | Megkötések                      |
| :-------------- | :------ | :--------------------------------------- | :------------------------------ |
| `id`            | INTEGER | Elsődleges kulcs, automatikusan növekszik | PRIMARY KEY AUTOINCREMENT       |
| `felhasznalonev`| TEXT    | Az adminisztrátor felhasználóneve        | NOT NULL UNIQUE                 |
| `jelszo_hash`   | TEXT    | Az adminisztrátor jelszavának bcrypt hash-e | NOT NULL                        |

### Alapértelmezett admin felhasználó

A szerver indításakor, ha az `admin` tábla üres, automatikusan létrehozásra kerül egy alapértelmezett adminisztrátor:

- **Felhasználónév:** `admin`
- **Jelszó:** A `.env` fájlban megadott `DEFAULT_ADMIN_PASSWORD` értéke.

## 3. API végpontok leírása

Az API végpontok a `http://localhost:PORT/api/` útvonalon érhetők el, ahol a `PORT` alapértelmezetten `3000`.

### 3.1. Nyilvános végpontok

#### 3.1.1. Termékek listázása

- **Végpont:** `GET /api/termekek`
- **Leírás:** Visszaadja az összes elérhető terméket.
- **Authentikáció:** Nem szükséges.
- **Kérés Body:** Nincs.
- **Sikeres válasz:**
  - Kód: `200 OK`
  - Tartalom: JSON tömb a termékekkel.
        ```json
        [
          {
            "id": 1,
            "nev": "Edényfogó kesztyű",
            "leiras": "Hőálló pamut kesztyű főzéshez, sütéshez.",
            "ar": 1990,
            "kep_url": "/kepek/kesztyu.jpg"
          },
          // ...további termékek
        ]
        ```
- **Hiba esetén a válasz:**
  - Kód: `500 Internal Server Error`
  - Tartalom: `{ "error": "hibaüzenet" }`

#### 3.1.2. Új rendelés létrehozása

- **Végpont:** `POST /api/rendeles`
- **Leírás:** Új vásárlói rendelést hoz létre.
- **Authentikáció:** Nem szükséges.
- **Kérés Body:**

    ```json
    {
        "nev": "Teszt Elek",
        "email": "teszt@elek.hu",
        "telefon": "+36301234567",
        "iranyitoszam": "1234",
        "telepules": "Tesztváros",
        "cim": "Teszt utca 1.",
        "tetelek": [
            { "termek_id": 1, "mennyiseg": 2 },
            { "termek_id": 2, "mennyiseg": 1 }
        ]
    }
    ```

- **Sikeres válasz:**
  - Kód: `201 Created`
  - Tartalom:
        ```json
        {
            "siker": true,
            "rendelesId": 123 // Az újonnan létrehozott rendelés azonosítója
        }
        ```
- **Hiba esetén a válaszok:**
  - Kód: `400 Bad Request` (Hiányzó vagy érvénytelen adatok)
    - Tartalom: `{ "siker": false, "message": "Hiányzó vagy érvénytelen adatok a rendeléshez." }`
    - Tartalom: `{ "siker": false, "message": "Érvénytelen tételek a rendelésben." }`
  - Kód: `500 Internal Server Error`
    - Tartalom: `{ "siker": false, "message": "Szerverhiba történt a rendelés feldolgozása közben.", "error": "részletes hibaüzenet" }`

### 3.2. Admin végpontok

Az adminisztrátori végpontokhoz érvényes JWT token szükséges az `Authorization` HTTP fejlécben, `Bearer <token>` formátumban.

#### 3.2.1. Admin bejelentkezés

- **Végpont:** `POST /api/admin/login`
- **Leírás:** Adminisztrátor bejelentkeztetése, JWT token generálása.
- **Authentikáció:** Nem szükséges.
- **Kérés Body:**

    ```json
    {
        "felhasznalonev": "admin",
        "jelszo": "Minad123"
    }
    ```

- **Sikeres válasz:**
  - Kód: `200 OK`
  - Tartalom:
        ```json
        {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // JWT token
        }
        ```
- **Hiba esetén a válaszok:**
  - Kód: `403 Forbidden`
    - Tartalom (szöveg): `"Hibás felhasználónév"`
    - Tartalom (szöveg): `"Hibás jelszó"`
  - Kód: `500 Internal Server Error`
    - Tartalom: `{ "message": "Szerverhiba történt a bejelentkezés során.", "error": "részletes hibaüzenet" }`

#### 3.2.2. Összes rendelés listázása (admin)

- **Végpont:** `GET /api/admin/rendelesek`
- **Leírás:** Visszaadja az összes rendelést, a legfrissebbel kezdve.
- **Authentikáció:** Szükséges (Bearer token).
- **Kérés Body:** Nincs.
- **Sikeres válasz:**
  - Kód: `200 OK`
  - Tartalom: JSON tömb a rendelésekkel (lásd `rendelesek` tábla struktúrája).
- **Hiba esetén a válaszok:**
  - Kód: `403 Forbidden`
    - Tartalom (szöveg): `"Érvénytelen vagy hiányzó Bearer token."`
    - Tartalom (szöveg): `"Token verifikáció sikertelen, érvénytelen token."`
  - Kód: `500 Internal Server Error`

#### 3.2.3. Egy adott rendelés tételeinek lekérése (admin)

- **Végpont:** `GET /api/admin/rendelesek/:id`
- **Leírás:** Visszaadja egy adott azonosítójú rendeléshez tartozó tételeket.
- **Authentikáció:** Szükséges (Bearer token).
- **URL Paraméter:** `:id` - A rendelés azonosítója.
- **Kérés Body:** Nincs.
- **Sikeres válasz:**
  - Kód: `200 OK`
  - Tartalom: JSON tömb a rendelés tételeivel.
        ```json
        [
            { "nev": "Termék A", "ar": 1000, "mennyiseg": 2 },
            { "nev": "Termék B", "ar": 500, "mennyiseg": 1 }
        ]
        ```
        (Ha a rendelés létezik, de nincsenek tételei, üres tömböt ad vissza.)
- **Hiba esetén a válaszok:**
  - Kód: `403 Forbidden` (Token hiba)
  - Kód: `404 Not Found`
    - Tartalom: `{ "message": "A megadott azonosítóval nem található rendelés." }`
  - Kód: `500 Internal Server Error`

#### 3.2.4. Rendelés postázási dátumának frissítése (admin)

- **Végpont:** `PUT /api/admin/rendelesek/:id/postazas`
- **Leírás:** Frissíti egy adott rendelés postázási dátumát.
- **Authentikáció:** Szükséges (Bearer token).
- **URL Paraméter:** `:id` - A rendelés azonosítója.
- **Kérés Body:**

    ```json
    {
        "datum_postazas": "YYYY-MM-DD" // Pl. "2024-03-15"
    }
    ```

- **Sikeres válasz:**
  - Kód: `200 OK`
    - Tartalom:

        ```json
        {
            "modositott": 1 // Ha sikeres volt a frissítés (1 sor módosult)
        }
        ```

- **Hiba esetén a válaszok:**
  - Kód: `403 Forbidden` (Token hiba)
  - Kód: `409 Conflict`
    - Tartalom: `{ "message": "A rendelés már korábban postázásra került. A dátum nem módosítható." }`
  - Kód: `500 Internal Server Error`

#### 3.2.5. Rendelés törlése (admin)

- **Végpont:** `DELETE /api/admin/rendelesek/:id`
- **Leírás:** Töröl egy adott azonosítójú rendelést és a hozzá tartozó tételeket.
- **Authentikáció:** Szükséges (Bearer token).
- **URL Paraméter:** `:id` - A rendelés azonosítója.
- **Kérés Body:** Nincs.
- **Sikeres válasz:**
  - Kód: `200 OK`
  - Tartalom:
        ```json
        {
            "message": "A(z) <id> azonosítójú rendelés sikeresen törölve.",
            "torolve": 1
        }
        ```
- **Hiba esetén a válaszok:**
  - Kód: `403 Forbidden` (Token hiba)
  - Kód: `404 Not Found`
    - Tartalom: `{ "message": "A megadott azonosítóval nem található rendelés a törléshez." }`
  - Kód: `500 Internal Server Error`

## 4. Tesztelés

A backend API végpontjainak tesztelésére a Visual Studio Code **REST Client** kiterjesztését használjuk. A tesztesetek az `api_tests.http` fájlban találhatók a projekt gyökérkönyvtárában.

### Tesztek futtatása

1. Telepítsd a "REST Client" kiterjesztést a VS Code-ban.
2. Indítsd el a backend szervert (`node server.js`).
3. Nyisd meg az `api_tests.http` fájlt a VS Code-ban.
4. Minden egyes kérés (`###` blokk) felett megjelenik egy "Send Request" link. Kattints erre a linkre a kérés elküldéséhez.
5. A válasz a kérés mellett fog megjelenni.

### Tesztelt területek

- **Nyilvános végpontok:** Termékek listázása, új rendelés létrehozása (sikeres és hibás esetek).
- **Adminisztrátori bejelentkezés:** Sikeres és hibás felhasználónév/jelszó esetek.
- **Védett adminisztrátori végpontok:**
  - Rendelések listázása (érvényes és hiányzó/érvénytelen tokennel).
  - Egyedi rendelés tételeinek lekérése (létező és nem létező rendelés).
  - Postázási dátum frissítése.
  - Rendelés törlése (létező és nem létező rendelés).

Az `api_tests.http` fájl úgy van felépítve, hogy a sikeres admin bejelentkezés után kapott JWT tokent, valamint az újonnan létrehozott rendelés azonosítóját automatikusan felhasználja a későbbi, releváns kérésekben a REST Client kiterjesztés beépített képességeit használva (pl. `{{loginAdmin.response.body.token}}`).

## 5. Környezeti változók

Az alkalmazás a következő környezeti változókat használhatja (a `.env` fájlból olvassa be őket):

- `PORT`: A port, amin a szerver fut (alapértelmezett: `3000`).
- `JWT_SECRET`: A JWT tokenek aláírásához használt titkos kulcs (alapértelmezett: `'titkoskulcs'`).
- `DEFAULT_ADMIN_PASSWORD`: Az alapértelmezett admin felhasználó jelszava, ha az `admin` tábla üres (pl. `Minad123`).

Ajánlott egy `.env` fájlt létrehozni a projekt gyökérkönyvtárában ezekkel az értékekkel. A `.env` fájlt kihagyjuk a verziókezelésből.
Példa `.env` fájl:

```plaintext
PORT=3000
SECRET=titkoskulcs
DEFAULT_ADMIN_PASSWORD=Minad123
```

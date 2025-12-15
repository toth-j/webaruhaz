// backend/app.js
require('dotenv').config();
const express = require('express');
const DB = require('better-sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const db = new DB('./webaruhaz.db');
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || 'titkoskulcs';

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Adatbázis inicializálása: táblák létrehozása, ha nem léteznek
function initializeDatabase() {
  const createTablesSQL = `
  CREATE TABLE IF NOT EXISTS termekek (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nev TEXT NOT NULL,
      leiras TEXT,
      ar INTEGER NOT NULL,
      kep_url TEXT
  );
  CREATE TABLE IF NOT EXISTS rendelesek (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nev TEXT NOT NULL,
      telefon TEXT NOT NULL,
      email TEXT NOT NULL,
      cim TEXT NOT NULL,
      iranyitoszam TEXT NOT NULL,
      telepules TEXT NOT NULL,
      megrendelve TEXT DEFAULT CURRENT_TIMESTAMP,
      postazva TEXT
  );
  CREATE TABLE IF NOT EXISTS rendeles_tetelek (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rendeles_id INTEGER NOT NULL,
      termek_id INTEGER NOT NULL,
      mennyiseg INTEGER NOT NULL,
      FOREIGN KEY(rendeles_id) REFERENCES rendelesek(id) ON DELETE CASCADE,
      FOREIGN KEY(termek_id) REFERENCES termekek(id)
  );
  CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      felhasznalonev TEXT NOT NULL UNIQUE,
      jelszo_hash TEXT NOT NULL
  );`;
  db.exec(createTablesSQL);
}

// Alapértelmezett admin felhasználó létrehozása, ha az admin tábla üres
function ensureDefaultAdmin() {
  try {
    const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin').get().count;
    if (adminCount === 0) {
      const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD;
      const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
      db.prepare('INSERT INTO admin (felhasznalonev, jelszo_hash) VALUES (?, ?)')
        .run('admin', hashedPassword);
    }
  } catch (err) {
    console.error("Hiba az alapértelmezett admin felhasználó ellenőrzése/létrehozása közben:", err);
  }
}

// AUTH Middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Hiányzó vagy érvénytelen token.' });
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).send('Token verifikáció sikertelen, érvénytelen token.');
    req.admin = decoded;
    next();
  });
}

// ======== NYILVÁNOS VÉGPONTOK ========
// 1. végpont: Visszaadja az összes terméket.
app.get('/api/termekek', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM termekek').all();
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. végpont: Új rendelést hoz létre.
app.post('/api/rendeles', (req, res) => {
  // Adatok kiolvasása a req.body-ból a checkout.js által küldött kulcsok alapján
  const { nev, email, cim, iranyitoszam, telefon, telepules, tetelek } = req.body;

  // Alapvető szerveroldali validáció
  if (!nev || !email || !cim || !iranyitoszam || !telefon || !telepules || !tetelek || !Array.isArray(tetelek) || tetelek.length === 0) {
    return res.status(400).json({ siker: false, message: "Hiányzó vagy érvénytelen adatok a rendeléshez." });
  }
  for (const t of tetelek) {
    if (typeof t.termek_id !== 'number' || t.termek_id <= 0 || typeof t.mennyiseg !== 'number' || t.mennyiseg <= 0) {
      return res.status(400).json({ siker: false, message: "Érvénytelen tételek a rendelésben." });
    }
  }

  try {
    // Tranzakció használata
    const rendelesFelvitel = db.transaction(() => {
      const insertRendeles = db.prepare(`INSERT INTO rendelesek (nev, email, cim, iranyitoszam, telefon, telepules) VALUES (?, ?, ?, ?, ?, ?)`);
      const result = insertRendeles.run(nev, email, cim, iranyitoszam, telefon, telepules);
      const rendelesId = result.lastInsertRowid;

      const insertTetel = db.prepare(`INSERT INTO rendeles_tetelek (rendeles_id, termek_id, mennyiseg) VALUES (?, ?, ?)`);
      for (const t of tetelek) insertTetel.run(rendelesId, t.termek_id, t.mennyiseg);
      return rendelesId;
    });
    const rendelesId = rendelesFelvitel();
    res.status(201).json({ siker: true, rendelesId });
  } catch (err) {
    console.error("Hiba a rendelés feldolgozása közben:", err); // Részletes hiba a szerver konzolon
    res.status(500).json({ siker: false, message: "Szerverhiba történt a rendelés feldolgozása közben.", error: err.message });
  }
});

// ======== ADMIN VÉGPONTOK ========
// 3. végpont: Admin felhasználó bejelentkeztetése.
app.post('/api/admin/login', (req, res) => {
  const { felhasznalonev, jelszo } = req.body;
  try {
    const admin = db.prepare('SELECT * FROM admin WHERE felhasznalonev = ?').get(felhasznalonev);
    if (!admin) return res.status(403).send('Hibás felhasználónév');
    if (bcrypt.compareSync(jelszo, admin.jelszo_hash)) {
      const token = jwt.sign({ id: admin.id, felhasznalonev }, SECRET);
      res.status(200).json({ token });
    } else {
      return res.status(403).send('Hibás jelszó');
    }
  } catch (err) {
    console.error("Admin bejelentkezési hiba:", err);
    res.status(500).json({ message: "Szerverhiba történt a bejelentkezés során.", error: err.message });
  }
});

// 4. végpont: Visszaadja az összes rendelést (admin).
app.get('/api/admin/rendelesek', verifyToken, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM rendelesek ORDER BY megrendelve DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 5. végpont: Visszaadja egy adott rendelés tételeit (admin).
app.get('/api/admin/rendelesek/:id', verifyToken, (req, res) => {
  try {
    // Először ellenőrizzük, hogy létezik-e maga a rendelés
    const rendeles = db.prepare('SELECT id FROM rendelesek WHERE id = ?').get(req.params.id);
    if (!rendeles) {
      return res.status(404).json({ message: "A megadott azonosítóval nem található rendelés." });
    }

    const rows = db.prepare(`SELECT t.nev, t.ar, rt.mennyiseg 
      FROM rendeles_tetelek rt JOIN termekek t ON rt.termek_id = t.id WHERE rt.rendeles_id = ?`)
      .all(req.params.id);
    res.status(200).json(rows); // Ha a rendelés létezik, de nincsenek tételei, üres tömböt ad vissza
  } catch (err) {
    res.status(500).json(err);
  }
});

// 6. végpont: Frissíti egy rendelés postázási dátumát (admin).
app.put('/api/admin/rendelesek/:id/postazas', verifyToken, (req, res) => {
  const { datum_postazas } = req.body;
  try {
    // Ellenőrizzük, hogy a rendelés már postázva lett-e korábban
    const rendeles = db.prepare('SELECT postazva FROM rendelesek WHERE id = ?').get(req.params.id);
    if (rendeles.postazva) {
      return res.status(409).json({ message: "A rendelés már korábban postázásra került. A dátum nem módosítható." });
    }
    const result = db.prepare('UPDATE rendelesek SET postazva = ? WHERE id = ?')
      .run(datum_postazas, req.params.id);
    res.status(200).json({ modositott: result.changes });
  } catch (err) {
    res.status(500).json(err);
  }
});

// 7. végpont: Töröl egy rendelést és a hozzá tartozó tételeket (admin).
app.delete('/api/admin/rendelesek/:id', verifyToken, (req, res) => {
  const id = req.params.id;
  try {
    // Először ellenőrizzük, hogy létezik-e maga a rendelés
    const rendeles = db.prepare('SELECT id FROM rendelesek WHERE id = ?').get(id);
    if (!rendeles) {
      return res.status(404).json({ message: "A megadott azonosítóval nem található rendelés a törléshez." });
    }

    db.prepare('DELETE FROM rendeles_tetelek WHERE rendeles_id = ?').run(id);
    db.prepare('DELETE FROM rendelesek WHERE id = ?').run(id);
    res.status(200).json({ message: `A(z) ${id} azonosítójú rendelés sikeresen törölve.`, torolve: 1 });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Indítás
initializeDatabase(); // Adatbázis inicializálása
ensureDefaultAdmin(); // Alapértelmezett admin felhasználó biztosítása

app.listen(PORT, () => {
  console.log(`Backend fut a http://localhost:${PORT} címen`);
});

process.on('exit', () => {
    db.close();
    console.log('Adatbázis kapcsolat lezárva.');
});
process.on('SIGINT', () => process.exit());
process.on('SIGTERM', () => process.exit());

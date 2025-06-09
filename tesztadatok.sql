-- database: ./webaruhaz.db

-- termekek tábla
CREATE TABLE termekek (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nev TEXT NOT NULL,
    leiras TEXT,
    ar INTEGER NOT NULL,
    kep_url TEXT
);

-- rendelesek tábla
CREATE TABLE rendelesek (
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

-- rendeles_tetelek tábla
CREATE TABLE rendeles_tetelek (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rendeles_id INTEGER NOT NULL,
    termek_id INTEGER NOT NULL,
    mennyiseg INTEGER NOT NULL,
    FOREIGN KEY(rendeles_id) REFERENCES rendelesek(id) ON DELETE CASCADE,
    FOREIGN KEY(termek_id) REFERENCES termekek(id)
);

-- admin tábla
CREATE TABLE admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    felhasznalonev TEXT NOT NULL UNIQUE,
    jelszo_hash TEXT NOT NULL
);

INSERT INTO termekek (nev, leiras, ar, kep_url) VALUES
('Edényfogó kesztyű', 'Hőálló pamut kesztyű főzéshez, sütéshez.', 1990, '/kepek/kesztyu.jpg'),
('Kötény', 'Állítható méretű, mosógépben mosható kötény.', 2990, '/kepek/koteny.jpg'),
('Konyharuha', '100% pamut konyharuha, 2 db-os csomag.', 1490, '/kepek/konyharuha.jpg');

INSERT INTO rendelesek (nev, telefon, email, cim, iranyitoszam, telepules, megrendelve, postazva)
VALUES
('Kiss Anna', '+36304444444', 'anna.kiss@example.com', 'Petőfi utca 12.', '1111', 'Budapest', '2024-01-15 10:00:00', '2024-01-16'),
('Nagy Péter', '+36205555555', 'peter.nagy@example.com', 'Kossuth tér 5.', '4026', 'Debrecen', '2024-01-17 14:30:00', NULL);

-- Kiss Anna rendelése (id = 1)
INSERT INTO rendeles_tetelek (rendeles_id, termek_id, mennyiseg) VALUES
(1, 1, 2), -- 2 db edényfogó
(1, 3, 1); -- 1 db konyharuha

-- Nagy Péter rendelése (id = 2)
INSERT INTO rendeles_tetelek (rendeles_id, termek_id, mennyiseg) VALUES
(2, 2, 1), -- 1 db kötény
(2, 3, 3); -- 3 db konyharuha

-- Admin felhasználó: admin, Minad123
INSERT INTO admin (felhasznalonev, jelszo_hash)
VALUES ('admin', '$2b$10$eYdBVdXQwuF6UHQMjdFOpeO4ZT/KSwRQyAHxqjhGavGrbPFjDPS9G');

const termekekKontener = document.getElementById('termekek-kontener');
const vegosszegElem = document.getElementById('vegosszeg');
const megrendelesGomb = document.getElementById('megrendeles-gomb');

let kosar = {};
let termekAdatokTeljes = []; // Tárolja a fetchelt termékadatokat

// Termékek lekérése a backendről
async function fetchTermekek() {
    try {
        const response = await fetch('/api/termekek');
        if (!response.ok) {
            throw new Error(`HTTP hiba! Státusz: ${response.status}`);
        }
        termekAdatokTeljes = await response.json();
        renderTermekek(termekAdatokTeljes);
    } catch (error) {
        console.error("Hiba a termékek lekérése közben:", error);
        termekekKontener.innerHTML =
            `<div class="col-12"><p class="text-danger">Hiba történt a termékek betöltése közben.</p></div>`;
    }
}

// Termék kártyák renderelése Bootstrap stílusban
function renderTermekek(termekek) {
    termekekKontener.innerHTML = '';
    if (termekek.length === 0) {
        termekekKontener.innerHTML = `<div class="col-12"><p>Jelenleg nincsenek elérhető termékek.</p></div>`;
        return;
    }
    termekek.forEach(termek => {
        const columnDiv = document.createElement('div');
        columnDiv.className = 'col-md-6 col-lg-4 mb-4';

        const kepUrl = termek.kep_url || `https://placehold.co/300x200/png`;
        const leiras = termek.leiras || 'Nincs részletes leírás.';

        columnDiv.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <img src="${kepUrl}" class="card-img-top object-fit-contain" alt="${termek.nev}" style="height: 200px;">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${termek.nev}</h5>
                        <p class="card-text flex-grow-1" style="font-size: 0.9rem; color: #555;">${leiras}</p>
                        <p class="card-text fw-bold fs-5 text-primary">${termek.ar} Ft</p>
                        <div class="mt-auto input-group input-group-sm">
                            <span class="input-group-text">Db:</span>
                            <input type="number" class="form-control mennyiseg-input" value="0" min="0" 
                            data-termek-id="${termek.id}" data-termek-ar="${termek.ar}" data-termek-nev="${termek.nev}" 
                            data-termek-kep="${kepUrl}" data-termek-leiras="${leiras}" style="max-width: 75px;">
                        </div>
                    </div>
                </div>
            `;
        termekekKontener.appendChild(columnDiv);
    });

    // Eseménykezelők hozzáadása a mennyiség inputokhoz
    document.querySelectorAll('.mennyiseg-input').forEach(input => {
        input.addEventListener('input', handleMennyisegValtozas);
        input.addEventListener('change', handleMennyisegValtozas);
    });
}

function handleMennyisegValtozas(event) {
    const input = event.target;
    const termekId = parseInt(input.dataset.termekId);
    let mennyiseg = parseInt(input.value);

    if (isNaN(mennyiseg) || mennyiseg < 0) {
        mennyiseg = 0;
        input.value = 0;
    }

    const ar = parseFloat(input.dataset.termekAr);
    const nev = input.dataset.termekNev;
    const kep_url = input.dataset.termekKep;
    const leiras = input.dataset.termekLeiras;


    if (mennyiseg > 0) {
        kosar[termekId] = { mennyiseg, ar, nev, kep_url, leiras, termek_id: termekId };
    } else {
        delete kosar[termekId];
    }
    kalkulalVegosszeg();
}

function kalkulalVegosszeg() {
    let osszeg = 0;
    for (const termekId in kosar) {
        osszeg += kosar[termekId].ar * kosar[termekId].mennyiseg;
    }
    vegosszegElem.textContent = osszeg;
}

megrendelesGomb.addEventListener('click', () => {
    const tetelekAPinak = [];
    const tetelekCheckoutnak = [];

    for (const termekId in kosar) {
        if (kosar[termekId].mennyiseg > 0) {
            tetelekAPinak.push({
                termek_id: parseInt(termekId),
                mennyiseg: kosar[termekId].mennyiseg
            });
            tetelekCheckoutnak.push({ // Több adatot mentünk a checkout oldalnak a megjelenítéshez
                termek_id: parseInt(termekId),
                mennyiseg: kosar[termekId].mennyiseg,
                nev: kosar[termekId].nev,
                ar: kosar[termekId].ar,
                kep_url: kosar[termekId].kep_url
            });
        }
    }

    if (tetelekAPinak.length === 0) {
        alert("Kérjük, válasszon legalább egy terméket a megrendeléshez!");
        return;
    }

    localStorage.setItem('kosarTartalmaAPinak', JSON.stringify(tetelekAPinak));
    localStorage.setItem('kosarTartalmaCheckoutnak', JSON.stringify(tetelekCheckoutnak));
    localStorage.setItem('teljesVegosszeg', vegosszegElem.textContent);

    window.location.href = 'checkout.html'; 
});

fetchTermekek(); 
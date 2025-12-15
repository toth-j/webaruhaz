const kosarAPinak = JSON.parse(localStorage.getItem('kosarTartalmaAPinak'));
const kosarCheckoutnak = JSON.parse(localStorage.getItem('kosarTartalmaCheckoutnak'));
const teljesVegosszeg = localStorage.getItem('teljesVegosszeg');

const rendeltTetelekListaElem = document.getElementById('rendelt-tetelek-lista');
const checkoutVegosszegElem = document.getElementById('checkout-vegosszeg');
const kosarDarabszamElem = document.getElementById('kosar-darabszam');
const rendelesUrlap = document.getElementById('rendeles-urlap');
const rendelesElkuldeseGomb = document.getElementById('rendeles-elkuldese-gomb');

if (teljesVegosszeg) {
    checkoutVegosszegElem.textContent = `${teljesVegosszeg} Ft`;
}

let osszDarabszam = 0;
if (kosarCheckoutnak && kosarCheckoutnak.length > 0) {
    kosarCheckoutnak.forEach(tetel => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between lh-sm summary-item';

        const kepUrl = tetel.kep_url || `https://placehold.co/60x60/png`;

        listItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <img src="${kepUrl}" alt="${tetel.nev}" class="img-thumbnail me-2" style="width: 50px; height: 50px; object-fit: cover;">
                    <div>
                        <h6 class="my-0">${tetel.nev}</h6>
                        <small class="text-muted">Mennyiség: ${tetel.mennyiseg}</small>
                    </div>
                </div>
                <span class="text-muted">${tetel.ar * tetel.mennyiseg} Ft</span>
            `;
        rendeltTetelekListaElem.appendChild(listItem);
        osszDarabszam += tetel.mennyiseg;
    });
    kosarDarabszamElem.textContent = osszDarabszam;
} else {
    // Ha üres a kosár, visszairányítás vagy üzenet
    document.querySelector('main').innerHTML = `
            <div class="alert alert-warning text-center" role="alert">
                A kosarad üres. Kérjük, válassz termékeket a megrendeléshez.
                <br>
                <a href="index.html" class="btn btn-primary mt-3">Vissza a termékekhez</a>
            </div>`;
    if (rendelesUrlap) rendelesUrlap.style.display = 'none'; 
}

// Bootstrap validáció
rendelesUrlap.addEventListener('submit', async function (event) {
    event.preventDefault();
    this.classList.add('was-validated');

    if (!this.checkValidity()) return;

    if (!kosarAPinak || kosarAPinak.length === 0) {
        alert("A kosár üres, nem lehet megrendelést leadni.");
        rendelesElkuldeseGomb.disabled = false;
        rendelesElkuldeseGomb.innerHTML = 'Megrendelés elküldése';
        return;
    }

    rendelesElkuldeseGomb.disabled = true;
    rendelesElkuldeseGomb.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Feldolgozás...
        `;

    const data = {
        nev: this.elements.nev.value,
        email: this.elements.email.value,
        telefon: this.elements.telefon.value,
        iranyitoszam: this.elements.iranyitoszam.value,
        telepules: this.elements.telepules.value,
        cim: this.elements.cim.value,
        tetelek: kosarAPinak // Ezt a localStorage-ból vettük
    };

    try {
        const response = await fetch('/api/rendeles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        const result = await response.json();

        if (response.status === 201 && result.siker) {
            alert(`Sikeres megrendelés! Rendelés azonosító: ${result.rendelesId}\nKöszönjük vásárlását!`);
            localStorage.removeItem('kosarTartalmaAPinak');
            localStorage.removeItem('kosarTartalmaCheckoutnak');
            localStorage.removeItem('teljesVegosszeg');
            window.location.href = 'index.html'
        } else {
            alert(`Hiba a megrendelés során: ${result.message || 'Ismeretlen hiba.'}`);
            rendelesElkuldeseGomb.disabled = false;
            rendelesElkuldeseGomb.innerHTML = 'Megrendelés elküldése';
        }
    } catch (error) {
        console.error('Hiba a megrendelés elküldésekor:', error);
        alert('Hiba történt a szerverrel való kommunikáció során. Kérjük, próbálja újra később.');
        rendelesElkuldeseGomb.disabled = false;
        rendelesElkuldeseGomb.innerHTML = 'Megrendelés elküldése';
    }
});

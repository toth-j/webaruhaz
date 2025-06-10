const rendelesekTablaBody = document.getElementById('rendelesekTablaBody');
let adminToken = null; // Ezt a bejelentkezés után vagy a sessionStorage-ból töltjük fel

const tetelekModalElem = new bootstrap.Modal(document.getElementById('tetelekModal'));
const rendelesTetelekTablaBody = document.getElementById('rendelesTetelekTablaBody');
const tetelekModalRendelesIdElem = document.getElementById('tetelekModalRendelesId');

const loginModalElem = new bootstrap.Modal(document.getElementById('loginModal'));
const adminLoginFormModal = document.getElementById('adminLoginFormModal');
const modalFelhasznalonevInput = document.getElementById('modalFelhasznalonev');
const modalJelszoInput = document.getElementById('modalJelszo');
const loginModalErrorDiv = document.getElementById('loginModalError');

const logoutButton = document.getElementById('logoutButton');

logoutButton.addEventListener('click', () => {
  sessionStorage.removeItem('adminToken');
  adminToken = null;
  window.location.replace('index.html'); // replace() használata, hogy ne kerüljön a history-ba az admin oldal
});

adminLoginFormModal.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginModalErrorDiv.style.display = 'none';
  loginModalErrorDiv.textContent = '';

  const felhasznalonev = modalFelhasznalonevInput.value;
  const jelszo = modalJelszoInput.value;

  if (!felhasznalonev || !jelszo) {
    loginModalErrorDiv.textContent = 'Minden mező kitöltése kötelező.';
    loginModalErrorDiv.style.display = 'block';
    return;
  }

  const submitButton = adminLoginFormModal.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ felhasznalonev, jelszo })
    });
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Bejelentkezési hiba: ${response.status} - ${errorData}`);
    }
    const data = await response.json();
    if (data.token) {
      sessionStorage.setItem('adminToken', data.token);
      adminToken = data.token;
      loginModalElem.hide();
      fetchRendelesek();
    } else {
      throw new Error("Nem érkezett token a szerverről.");
    }
  } catch (error) {
    loginModalErrorDiv.textContent = `Hiba: ${error.message}`;
    loginModalErrorDiv.style.display = 'block';
  } finally {
    submitButton.disabled = false;
  }
});

async function fetchRendelesek() {
  if (!adminToken) {
    handleAuthError();
    return;
  }
  try {
    const response = await fetch('/api/admin/rendelesek', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (response.status === 403) { // Token hiba
      await handleAuthError();
      return;
    }
    if (!response.ok) throw new Error(`HTTP hiba! Státusz: ${response.status}`);
    const rendelesek = await response.json();
    renderRendelesek(rendelesek);
  } catch (error) {
    console.error("Hiba a rendelések lekérése közben:", error);
    rendelesekTablaBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Hiba történt a rendelések betöltése közben.</td></tr>`;
  }
}

async function handleAuthError() {
  sessionStorage.removeItem('adminToken');
  adminToken = null;
  loginModalElem.show();
  rendelesekTablaBody.innerHTML = `<tr><td colspan="8" class="text-center text-warning">Kérjük, jelentkezzen be a rendelések megtekintéséhez!</td></tr>`;
}

function renderRendelesek(rendelesek) {
  rendelesekTablaBody.innerHTML = '';
  if (rendelesek.length === 0) {
    rendelesekTablaBody.innerHTML = `<tr><td colspan="8" class="text-center">Nincsenek megjeleníthető rendelések.</td></tr>`;
    return;
  }
  rendelesek.forEach(r => {
    const sor = rendelesekTablaBody.insertRow();
    sor.insertCell().textContent = r.id;
    sor.insertCell().textContent = r.nev;
    sor.insertCell().textContent = r.email;
    sor.insertCell().textContent = `${r.iranyitoszam} ${r.telepules}, ${r.cim}`;
    sor.insertCell().textContent = r.megrendelve ? new Date(r.megrendelve).toLocaleDateString('hu-HU') : '-';

    sor.insertCell().textContent = r.postazva ? new Date(r.postazva).toLocaleDateString('hu-HU') : 'Nincs postázva';

    const tetelGombCella = sor.insertCell();
    const tetelGomb = document.createElement('button');
    tetelGomb.className = 'btn btn-sm btn-info';
    tetelGomb.innerHTML = '<i class="bi bi-list-ul"></i> Tételek';
    tetelGomb.onclick = () => showTetelek(r.id);
    tetelGombCella.appendChild(tetelGomb);

    const muveletekCella = sor.insertCell();
    muveletekCella.className = 'text-nowrap';

    const postazGomb = document.createElement('button');
    postazGomb.className = 'btn btn-sm btn-primary me-1';
    postazGomb.innerHTML = '<i class="bi bi-truck"></i>'; // Csak ikon
    postazGomb.title = "Postázás dátumának megadása";
    postazGomb.onclick = () => handlePostazas(r.id);
    muveletekCella.appendChild(postazGomb);

    if (r.postazva) {
      postazGomb.disabled = true;
      postazGomb.className = 'btn btn-sm btn-secondary me-1'; // Szürkébb gomb
    }

    const torolGomb = document.createElement('button');
    torolGomb.className = 'btn btn-sm btn-danger';
    torolGomb.innerHTML = '<i class="bi bi-trash"></i>'; // Csak ikon
    torolGomb.title = "Rendelés törlése";
    torolGomb.onclick = () => handleTorles(r.id);
    muveletekCella.appendChild(torolGomb);
  });
}

async function showTetelek(rendelesId) {
  tetelekModalRendelesIdElem.textContent = rendelesId;
  try {
    const response = await fetch(`/api/admin/rendelesek/${rendelesId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (response.status === 403) {
      await handleAuthError();
      return;
    }
    if (!response.ok) throw new Error('Tételek lekérése sikertelen');
    const tetelek = await response.json();
    rendelesTetelekTablaBody.innerHTML = '';
    if (tetelek.length === 0) {
      rendelesTetelekTablaBody.innerHTML = '<tr><td colspan="4" class="text-center">Nincsenek tételek ehhez a rendeléshez.</td></tr>';
    } else {
      tetelek.forEach(tetel => {
        const sor = rendelesTetelekTablaBody.insertRow();
        sor.insertCell().textContent = tetel.nev;
        sor.insertCell().textContent = `${tetel.ar} Ft`;
        sor.insertCell().textContent = tetel.mennyiseg;
        sor.insertCell().textContent = `${tetel.ar * tetel.mennyiseg} Ft`;
      });
    }
    tetelekModalElem.show();
  } catch (error) {
    console.error('Hiba a tételek lekérésekor:', error);
    alert('Hiba történt a rendelés tételeinek betöltése közben.');
  }
}

async function handlePostazas(rendelesId) {
  if (!confirm(`Biztosan mai nappal postázottnak jelöli a(z) ${rendelesId} azonosítójú rendelést?`)) {
    return;
  }
  const datum_postazas = new Date().toISOString().split('T')[0]; // Mai nap YYYY-MM-DD formátumban

  try {
    const response = await fetch(`/api/admin/rendelesek/${rendelesId}/postazas`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ datum_postazas }) // A backend 'datum_postazas'-t vár
    });
    if (response.status === 403) {
      await handleAuthError();
      return;
    }
    if (!response.ok) {
      throw new Error(`Postázás dátumának frissítése sikertelen. Státusz: ${response.status}`);
    }
    fetchRendelesek();
  } catch (error) {
    console.error("Hiba a postázás dátumának frissítésekor:", error);
    alert(`Hiba történt a postázás dátumának mentésekor: ${error.message}`);
  }
};

async function handleTorles(rendelesId) {
  if (!confirm(`Biztosan törölni szeretné a(z) ${rendelesId} azonosítójú rendelést? Ez a művelet nem vonható vissza.`)) {
    return;
  }
  try {
    const response = await fetch(`/api/admin/rendelesek/${rendelesId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (response.status === 403) {
      await handleAuthError();
      return;
    }
    if (!response.ok) throw new Error('Rendelés törlése sikertelen');
    fetchRendelesek();
  } catch (error) {
    console.error("Hiba a rendelés törlésekor:", error);
    alert('Hiba történt a rendelés törlésekor.');
  }
};

async function initAdminPage() {
  adminToken = sessionStorage.getItem('adminToken');
  if (!adminToken) {
    loginModalElem.show();
    rendelesekTablaBody.innerHTML = `<tr><td colspan="8" class="text-center text-info">Kérjük, jelentkezzen be az adatok megtekintéséhez.</td></tr>`;
  } else {
    fetchRendelesek();
  }
}

initAdminPage();

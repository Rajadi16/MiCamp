// ridepool-integration.js
// Combined, cleaned, ready-to-paste — handles geocode fallback, local history, robust booking
(function () {
  const API = window.MICAMP_API_BASE_URL || 'http://localhost:4000';
  const NOMINATIM = 'https://nominatim.openstreetmap.org/search?format=json&q=';
  const HISTORY_KEY = 'micamp_rides_history_v1';

  /* -------------------- helpers -------------------- */
  function loadCss(url) {
    if (document.querySelector(`link[href="${url}"]`)) return Promise.resolve();
    return new Promise((res, rej) => {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = url;
      l.onload = () => res();
      l.onerror = () => rej(new Error('Failed to load ' + url));
      document.head.appendChild(l);
    });
  }
  function loadScript(url) {
    if (document.querySelector(`script[src="${url}"]`)) return Promise.resolve();
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = url;
      s.defer = true;
      s.onload = () => res();
      s.onerror = () => rej(new Error('Failed to load ' + url));
      document.body.appendChild(s);
    });
  }
  function parseLatLng(s) {
    if (!s) return null;
    const parts = s.split(',').map(p => p.trim());
    if (parts.length !== 2) return null;
    const a = Number(parts[0]), b = Number(parts[1]);
    if (Number.isFinite(a) && Number.isFinite(b)) return { latitude: a, longitude: b };
    return null;
  }
  async function geocode(text) {
    const parsed = parseLatLng(text);
    if (parsed) return parsed;
    try {
      const res = await fetch(NOMINATIM + encodeURIComponent(text), { headers: { 'Accept': 'application/json' } });
      const json = await res.json();
      if (!Array.isArray(json) || json.length === 0) return null;
      return { latitude: Number(json[0].lat), longitude: Number(json[0].lon) };
    } catch (e) {
      console.warn('geocode failed', e);
      return null;
    }
  }
  function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  /* -------------------- local history -------------------- */
  function loadLocalHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('history load failed', e);
      return [];
    }
  }
  function saveLocalHistory(arr) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(arr || []));
    } catch (e) {
      console.warn('history save failed', e);
    }
  }
  function addToLocalHistory(ride) {
    const h = loadLocalHistory();
    if (!ride.id) ride.id = 'local-' + Date.now() + '-' + Math.floor(Math.random()*9999);
    ride._createdAt = new Date().toISOString();
    h.unshift(ride);
    saveLocalHistory(h.slice(0, 200));
  }

  /* -------------------- main init -------------------- */
  async function init() {
    try {
      await loadCss('https://unpkg.com/leaflet/dist/leaflet.css');
      await loadScript('https://unpkg.com/leaflet/dist/leaflet.js');
    } catch (e) {
      console.error('Failed to load Leaflet', e);
      return;
    }

    // Ensure map + UI containers exist
    if (!document.getElementById('micamp-ride-map')) {
      const insertionPoint = document.querySelector('.page-header') || document.querySelector('h1') || document.body;
      const wrapper = document.createElement('div');
      wrapper.innerHTML = `
        <div id="micamp-ride-map" style="height:420px;border-radius:8px;margin:16px 0;"></div>
        <div style="margin-top:8px;">
          <button id="micamp-search-nearby" class="btn btn-secondary">Search rides near map center</button>
          <label style="margin-left:10px;color:#666"><input id="micamp-show-history" type="checkbox"> Show history-only rides</label>
        </div>
        <div id="micamp-dynamic-rides" style="margin-top:12px;"></div>
      `;
      insertionPoint.parentNode.insertBefore(wrapper, insertionPoint.nextSibling);
    }

    const defaultCenter = [12.923492, 77.499733];
    const map = L.map('micamp-ride-map').setView(defaultCenter, 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '' }).addTo(map);

    let markers = [], polylines = [];

    function clearMarkers(){ markers.forEach(m=>map.removeLayer(m)); markers=[]; }
    function clearPolylines(){ polylines.forEach(p=>map.removeLayer(p)); polylines=[]; }

    function fitAndHighlight(poly){
      const latlngs = poly.getLatLngs();
      if(!latlngs || latlngs.length===0) return;
      map.fitBounds(L.latLngBounds(latlngs).pad(0.4));
      poly.setStyle({ color: '#ff4d4f', weight: 5 });
      setTimeout(()=> poly.setStyle({ color: '#3388ff', weight: 4 }), 800);
    }

    function formatLatLng(l){
      if(!l) return '';
      return `${Number(l.latitude).toFixed(5)}, ${Number(l.longitude).toFixed(5)}`;
    }

    /* Render rides (merge server + local history) */
    async function renderRides(serverRides){
      const list = document.getElementById('micamp-dynamic-rides');
      if(!list) return;
      list.innerHTML = '';
      clearMarkers();
      clearPolylines();

      const local = loadLocalHistory();
      const showHistory = document.getElementById('micamp-show-history')?.checked;
      const merged = Array.isArray(serverRides) ? serverRides.slice() : [];
      const serverIds = new Set(merged.map(r => r.id));
      local.forEach(lr => { if (!serverIds.has(lr.id)) { if (showHistory || lr.from || lr.to) merged.push(lr); }});

      if (merged.length === 0) {
        list.innerHTML = '<p style="color:#666">No rides found.</p>';
        return;
      }

      merged.forEach(r => {
        const fromLabel = r.fromText ? escapeHtml(r.fromText) : (r.from ? escapeHtml(formatLatLng(r.from)) : 'Unknown');
        const toLabel = r.toText ? escapeHtml(r.toText) : (r.to ? escapeHtml(formatLatLng(r.to)) : 'Unknown');
        const isLocalOnly = String(r.id || '').startsWith('local-');
        const seatsDisplay = (typeof r.seatsAvailable !== 'undefined') ? r.seatsAvailable : (r.seatsTotal ?? '—');

        const card = document.createElement('div');
        card.className = 'item-card';
        card.style.marginBottom = '12px';
        card.innerHTML = `
          <div class="ride-header" style="display:flex;justify-content:space-between;align-items:center">
            <div class="driver-info" style="display:flex;gap:10px;align-items:center">
              <div class="driver-avatar">👨‍🎓</div>
              <div>
                <h3 style="margin:0">${escapeHtml(r.driverId || 'Driver')} ${isLocalOnly ? '<small style="color:#888"> (Local)</small>' : ''}</h3>
                <p style="margin:0">⭐ ${r.rating ?? '4.8'}</p>
              </div>
            </div>
            <div class="seats-available" style="font-weight:600">${escapeHtml(String(seatsDisplay))} seats</div>
          </div>
          <div class="ride-details" style="margin-top:8px">
            <div class="route">
              <div class="route-point"><span class="route-icon">📍</span><div><strong>From:</strong> ${fromLabel}</div></div>
              <div class="route-line"></div>
              <div class="route-point"><span class="route-icon">📍</span><div><strong>To:</strong> ${toLabel}</div></div>
            </div>
            <div class="ride-meta" style="margin-top:8px">
              <p style="margin:0">${r.departTime ? '🕐 ' + new Date(r.departTime).toLocaleString() : ''}</p>
              <p style="margin:0">${escapeHtml(r.notes ?? '')}</p>
              <p style="margin:0">💰 ${escapeHtml(r.price ?? '—')}</p>
            </div>
          </div>
          <div style="margin-top:10px; display:flex; gap:8px;">
            <button class="btn btn-secondary btn-show-route">Show route</button>
            <button class="btn btn-primary btn-book">Book</button>
          </div>
        `;

        card.addEventListener('click', ev => {
          if (ev.target && (ev.target.tagName === 'BUTTON' || ev.target.closest('button'))) return;
          showRoute(r);
        });

        list.appendChild(card);

        // add marker if coords exist
        if (r.from && typeof r.from.latitude === 'number' && typeof r.from.longitude === 'number') {
          try {
            const m = L.marker([r.from.latitude, r.from.longitude]).addTo(map)
              .bindPopup(`<b>${escapeHtml(r.driverId || 'driver')}</b><br>${escapeHtml(String(seatsDisplay))} seats<br>From: ${fromLabel}`);
            markers.push(m);
            m.on('click', () => { m.openPopup(); showRoute(r); });
          } catch (err) {
            console.warn('marker add failed', err);
          }
        }

        const showBtn = card.querySelector('.btn-show-route');
        showBtn.addEventListener('click', e=>{ e.stopPropagation(); showRoute(r); });

        const bookBtn = card.querySelector('.btn-book');
        bookBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const userId = prompt('Enter your student id/email to book this ride');
          if (!userId) return;
          // attempt server booking; fallback to local optimistic booking
          try {
            const resp = await fetch(`${API}/api/rides/${encodeURIComponent(r.id)}/join`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId })
            });
            const text = await resp.text();
            let json;
            try { json = JSON.parse(text); } catch { json = { message: text }; }
            if (!resp.ok) {
              alert(json.message || `Booking failed (${resp.status})`);
              console.error('booking failed', resp.status, json);
              if (String(r.id || '').startsWith('local-')) {
                const hist = loadLocalHistory();
                const idx = hist.findIndex(x => x.id === r.id);
                if (idx !== -1 && typeof hist[idx].seatsAvailable === 'number' && hist[idx].seatsAvailable>0) {
                  hist[idx].seatsAvailable--;
                  saveLocalHistory(hist);
                  await loadAndRender();
                }
              }
              return;
            }
            alert('Booked successfully');
            if (json && typeof json.seatsAvailable !== 'undefined') {
              const hist = loadLocalHistory();
              const idx = hist.findIndex(x => x.id === r.id);
              if (idx !== -1) { hist[idx].seatsAvailable = json.seatsAvailable; saveLocalHistory(hist); }
            } else {
              const hist = loadLocalHistory();
              const idx = hist.findIndex(x => x.id === r.id);
              if (idx !== -1 && typeof hist[idx].seatsAvailable === 'number' && hist[idx].seatsAvailable>0) {
                hist[idx].seatsAvailable--;
                saveLocalHistory(hist);
              }
            }
            await loadAndRender();
            showRoute(r);
          } catch (err) {
            console.error('booking error', err);
            alert('Booking failed (network). Performed local booking if possible.');
            const hist = loadLocalHistory();
            const idx = hist.findIndex(x => x.id === r.id);
            if (idx !== -1 && typeof hist[idx].seatsAvailable === 'number' && hist[idx].seatsAvailable>0) {
              hist[idx].seatsAvailable--;
              saveLocalHistory(hist);
              await loadAndRender();
            }
          }
        });
      }); // end merged.forEach
    } // end renderRides

    function showRoute(r) {
      if (!r) return;
      clearPolylines();
      if (r.from && r.to && typeof r.from.latitude === 'number' && typeof r.to.latitude === 'number') {
        const latlngs = [[r.from.latitude, r.from.longitude],[r.to.latitude, r.to.longitude]];
        const poly = L.polyline(latlngs, { color: '#3388ff', weight: 4 }).addTo(map);
        polylines.push(poly);
        fitAndHighlight(poly);
      } else {
        alert('Route not available (no coordinates).');
      }
    }

    async function loadServerRides(radius = 3000) {
      try {
        const c = map.getCenter();
        const res = await fetch(`${API}/api/rides/nearby?lat=${c.lat}&lng=${c.lng}&radius=${radius}`);
        if (!res.ok) {
          console.warn('server rides fetch failed', res.status);
          return [];
        }
        const data = await res.json();
        return data.rides || data;
      } catch (e) {
        console.warn('loadServerRides error', e);
        return [];
      }
    }

    async function loadAndRender() {
      const serverRides = await loadServerRides(3000);
      await renderRides(serverRides);
    }

    // UI wiring
    document.getElementById('micamp-search-nearby')?.addEventListener('click', () => loadAndRender());
    document.getElementById('micamp-show-history')?.addEventListener('change', () => loadAndRender());
    Array.from(document.querySelectorAll('.action-buttons button')).forEach(b=>{
      if (/Find a Ride/i.test(b.textContent)) b.addEventListener('click', ()=> { map.setView(defaultCenter, 16); loadAndRender(); });
    });

    // Offer ride handling with geocode fallback and local history fallback
    const offerForm = document.querySelector('#offerRideModal form.report-form');
    if (offerForm) {
      offerForm.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const inputs = offerForm.querySelectorAll('input, select, textarea');
        const fromText = inputs[0]?.value?.trim();
        const toText   = inputs[1]?.value?.trim();
        const dateVal  = inputs[2]?.value || '';
        const timeVal  = inputs[3]?.value || '';
        const seatsVal = Number(inputs[4]?.value) || 1;
        const vehicleType = inputs[5]?.value || '';
        const vehicleNumber = inputs[6]?.value || '';
        const price = inputs[7]?.value || '';
        const notes = inputs[8]?.value || '';

        if (!fromText || !toText) return alert('Please enter From and To');

        let driverId = (offerForm.querySelector('input[name="driverId"]') || {}).value || '';
        if (!driverId) driverId = prompt('Enter your driver id (student id or email)');
        if (!driverId) return alert('Driver id required');

        let gFrom = await geocode(fromText);
        let gTo = await geocode(toText);

        if (!gFrom) {
          const ok = confirm('Could not geocode "From". Enter coordinates manually? (paste "lat,lng")');
          if (ok) {
            const manual = prompt('Enter From coords as "lat,lng" (e.g. 12.90223,77.51851)');
            const parsed = parseLatLng(manual || '');
            if (parsed) gFrom = parsed;
          }
        }
        if (!gTo) {
          const ok2 = confirm('Could not geocode "To". Enter coordinates manually? (paste "lat,lng")');
          if (ok2) {
            const manual = prompt('Enter To coords as "lat,lng" (e.g. 12.90240,77.51788)');
            const parsed = parseLatLng(manual || '');
            if (parsed) gTo = parsed;
          }
        }

        const departTime = (dateVal && timeVal) ? new Date(dateVal + 'T' + timeVal).toISOString() : undefined;
        const payload = {
          driverId,
          from: gFrom || null,
          to: gTo || null,
          fromText,
          toText,
          seatsTotal: seatsVal,
          seatsAvailable: seatsVal,
          departTime,
          notes: notes || (price ? `₹${price}` : '') || (vehicleType ? vehicleType + (vehicleNumber ? ' • ' + vehicleNumber : '') : undefined),
          price: price || undefined
        };

        try {
          const resp = await fetch(`${API}/api/rides`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const text = await resp.text();
          let json;
          try { json = JSON.parse(text); } catch { json = { message: text }; }
          if (!resp.ok) {
            alert('Server create failed: ' + (json.message || resp.status));
            const localRide = { ...payload };
            addToLocalHistory(localRide);
            await loadAndRender();
            document.getElementById('offerRideModal').style.display = 'none';
            return;
          }
          alert('Ride created successfully on server');
          document.getElementById('offerRideModal').style.display = 'none';
          const created = (json && (json.id || json.ride)) ? (json.ride || json) : null;
          if (created) addToLocalHistory(created); else addToLocalHistory(payload);
          await loadAndRender();
          if (created && created.from && created.to) showRoute(created);
        } catch (err) {
          console.warn('create request failed', err);
          addToLocalHistory(payload);
          alert('Could not reach backend — ride saved locally (history).');
          document.getElementById('offerRideModal').style.display = 'none';
          await loadAndRender();
        }
      });
    } else {
      console.warn('No offer form found: expected #offerRideModal form.report-form');
    }

    // initial load
    setTimeout(()=> loadAndRender(), 500);

    // expose for debugging
    window.loadAndRender = loadAndRender;
    window.addToLocalHistory = addToLocalHistory;
    window.loadLocalHistory = loadLocalHistory;
  } // end init

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();

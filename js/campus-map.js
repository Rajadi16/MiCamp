const API_BASE_URL = window.MICAMP_API_BASE_URL || 'http://localhost:4000';

const mapState = {
    config: null,
    map: null,
    markers: [],
    markerIndex: new Map(),
    liveMarkers: new Map(),
    userLocationWatcher: null,
};

const currentUser = (() => {
    try {
        const stored = JSON.parse(localStorage.getItem('micamp_user'));
        if (stored && stored.id) {
            return {
                id: stored.id,
                name: stored.name || stored.fullName || 'Micamp User',
            };
        }
    } catch (error) {
        console.warn('Unable to parse saved user profile', error);
    }
    return {
        id: `guest-${crypto.randomUUID?.() || Date.now()}`,
        name: 'Guest User',
    };
})();

async function bootstrapMapFeature() {
    const statusEl = document.querySelector('[data-map-status]');
    if (!statusEl) {
        console.error('Map status element not found');
        return;
    }

    try {
        statusEl.textContent = 'Syncing campus data...';
        statusEl.style.display = 'block';
        
        // Test backend connectivity first
        console.log('Connecting to backend at:', API_BASE_URL);
        const config = await fetchMapConfig();
        console.log('Map config received:', config);
        mapState.config = config;

        statusEl.textContent = 'Loading OpenStreetMap...';
        await waitForLeaflet();

        statusEl.textContent = 'Rendering campus map...';
        initMap(config);
        attachLocationCardHandlers(config);
        initSearch(config);
        setupLiveLocationChannels();
        statusEl.textContent = 'Live campus map ready';
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 2000);
    } catch (error) {
        console.error('Map initialization error:', error);
        if (statusEl) {
            let errorMsg = 'Unable to load map. ';
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMsg += 'Backend server not reachable. Make sure backend is running on ' + API_BASE_URL;
            } else if (error.message.includes('Leaflet')) {
                errorMsg += 'OpenStreetMap library failed to load. Check your internet connection.';
            } else if (error.message.includes('container')) {
                errorMsg += 'Map container not found.';
            } else {
                errorMsg += error.message || 'Please check your connection.';
            }
            statusEl.textContent = errorMsg;
            statusEl.classList.add('error');
            statusEl.style.display = 'block';
        }
    }
}

async function fetchMapConfig() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/map`);
        if (!res.ok) {
            throw new Error(`Failed to fetch map config: ${res.status} ${res.statusText}`);
        }
        return await res.json();
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Is the server running?`);
        }
        throw error;
    }
}

async function fetchSearchResults(query) {
    const params = new URLSearchParams();
    if (query) {
        params.set('q', query);
    }

    const res = await fetch(`${API_BASE_URL}/api/map/search?${params.toString()}`);
    if (!res.ok) {
        throw new Error('Failed to search campus locations');
    }
    return res.json();
}

function waitForLeaflet() {
    return new Promise((resolve, reject) => {
        if (window.L && window.L.map) {
            resolve();
            return;
        }

        // Check if Leaflet script is in the DOM
        const leafletScript = document.querySelector('script[src*="leaflet"]');
        if (!leafletScript) {
            reject(new Error('Leaflet script not found in page. Check if Leaflet CDN is loaded.'));
            return;
        }

        let attempts = 0;
        const maxAttempts = 100; // 10 seconds
        const checkInterval = setInterval(() => {
            attempts++;
            if (window.L && window.L.map) {
                clearInterval(checkInterval);
                resolve();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                reject(new Error('Leaflet library failed to load after 10 seconds. Check your internet connection.'));
            }
        }, 100);
    });
}

function initMap(config) {
    const mapEl = document.getElementById('campusMap');
    if (!mapEl) {
        throw new Error('Map container missing');
    }

    // Ensure container has dimensions
    if (mapEl.offsetHeight === 0 || mapEl.offsetWidth === 0) {
        console.warn('Map container has no dimensions, forcing layout');
        mapEl.style.height = '500px';
        mapEl.style.width = '100%';
    }

    if (!window.L || !window.L.map) {
        throw new Error('Leaflet library not loaded');
    }

    mapState.map = L.map('campusMap', {
        center: [config.campusCenter.lat, config.campusCenter.lng],
        zoom: config.defaultZoom,
        zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
    }).addTo(mapState.map);

    config.locations.forEach((location) => {
        const emojiIcon = L.divIcon({
            className: 'emoji-marker',
            html: `<div style="font-size: 24px; text-align: center; line-height: 1;">${location.icon}</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
        });

        const marker = L.marker([location.latitude, location.longitude], {
            icon: emojiIcon,
            title: location.name,
        }).addTo(mapState.map);

        const popupContent = `
            <div class="map-info-window">
                <h3>${location.icon} ${location.name}</h3>
                <p>${location.description}</p>
                <p class="tags">${location.tags.map((tag) => `#${tag}`).join(' ')}</p>
            </div>
        `;

        marker.bindPopup(popupContent);

        const record = { marker, location };
        mapState.markers.push(record);
        mapState.markerIndex.set(location.id, record);
    });
}

function attachLocationCardHandlers(config) {
    const buttons = document.querySelectorAll('[data-location-id]');
    buttons.forEach((button) => {
        const locationId = button.getAttribute('data-location-id');
        const target = config.locations.find((loc) => loc.id === locationId);
        if (!target) return;

        button.addEventListener('click', () => {
            focusOnLocation(target);
        });
    });
}

function initSearch(config) {
    const input = document.getElementById('locationSearch');
    const searchButton = document.getElementById('searchButton');
    const resultsEl = document.getElementById('searchResults');

    if (!input || !resultsEl) return;

    async function performSearch(event) {
        event?.preventDefault();
        const query = input.value.trim();

        try {
            resultsEl.innerHTML = `<div class="search-result">Searching for "${query || 'all'}"...</div>`;
            const { results } = await fetchSearchResults(query);

            highlightMarkers(results, query);
            renderSearchResults(results, resultsEl, query);

            if (results.length && query) {
                focusOnLocation(results[0]);
            }
        } catch (error) {
            console.error('Search error:', error);
            resultsEl.innerHTML = `<div class="search-result error">Unable to search right now. Please try again.</div>`;
        }
    }

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            performSearch(event);
        }
    });

    searchButton?.addEventListener('click', performSearch);

    renderSearchResults(config.locations.slice(0, 3), resultsEl, '');
}

function setupLiveLocationChannels() {
    if (!('geolocation' in navigator)) {
        console.warn('Geolocation not supported');
        return;
    }

    requestAndSendUserLocation().catch((error) => console.warn(error));
    setInterval(() => {
        requestAndSendUserLocation().catch((error) => console.warn(error));
    }, 20_000);
    subscribeToLiveUpdates();
}

function requestAndSendUserLocation() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const snapshot = {
                    userId: currentUser.id,
                    displayName: currentUser.name,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    updatedAt: new Date().toISOString(),
                };

                updateLiveMarker(snapshot);

                fetch(`${API_BASE_URL}/api/live-location`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: snapshot.userId,
                        displayName: snapshot.displayName,
                        latitude: snapshot.latitude,
                        longitude: snapshot.longitude,
                        accuracy: snapshot.accuracy,
                    }),
                }).catch((error) => console.error('Failed to publish location', error));

                resolve(snapshot);
            },
            (error) => {
                console.warn('Unable to fetch location', error);
                reject(error);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10_000,
                timeout: 10_000,
            },
        );
    });
}

function subscribeToLiveUpdates() {
    const eventSource = new EventSource(`${API_BASE_URL}/api/live-location/stream`);
    eventSource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (!Array.isArray(data.payload)) return;
            data.payload.forEach(updateLiveMarker);
        } catch (error) {
            console.error('Failed to parse live location payload', error);
        }
    };

    eventSource.onerror = (error) => {
        console.warn('Live location stream error', error);
        eventSource.close();
        setTimeout(subscribeToLiveUpdates, 5000);
    };
}

function updateLiveMarker(snapshot) {
    if (!mapState.map || !window.L) return;

    let marker = mapState.liveMarkers.get(snapshot.userId);
    if (!marker) {
        const isCurrentUser = snapshot.userId === currentUser.id;
        const color = isCurrentUser ? '#ff5722' : '#2962ff';

        marker = L.circleMarker([snapshot.latitude, snapshot.longitude], {
            radius: 8,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
        }).addTo(mapState.map);

        const popupContent = `
            <strong>${snapshot.displayName || snapshot.userId}</strong><br/>
            Updated ${new Date(snapshot.updatedAt).toLocaleTimeString()}
        `;
        marker.bindPopup(popupContent);

        mapState.liveMarkers.set(snapshot.userId, marker);
    } else {
        marker.setLatLng([snapshot.latitude, snapshot.longitude]);
    }
}

function highlightMarkers(results, query) {
    const ids = new Set(results.map((location) => location.id));
    const showAll = !query;

    mapState.markers.forEach(({ marker, location }) => {
        if (showAll || ids.has(location.id)) {
            if (!mapState.map.hasLayer(marker)) {
                marker.addTo(mapState.map);
            }
        } else if (mapState.map.hasLayer(marker)) {
            marker.remove();
        }
    });
}

function renderSearchResults(results, container, query) {
    if (!results.length) {
        container.innerHTML = `<div class="search-result">No locations found for "${query}".</div>`;
        return;
    }

    container.innerHTML = results
        .map(
            (location) => `
            <div class="search-result" data-location-id="${location.id}">
                <div class="search-result-content">
                    <h4>${location.icon} ${location.name}</h4>
                    <p>${location.description}</p>
                    <div class="search-result-tags">${location.tags.map((tag) => `#${tag}`).join(' ')}</div>
                </div>
                <div class="search-result-action">View →</div>
            </div>
        `,
        )
        .join('');

    container.querySelectorAll('[data-location-id]').forEach((card) => {
        card.addEventListener('click', () => {
            const locationId = card.getAttribute('data-location-id');
            const location =
                mapState.config?.locations.find((loc) => loc.id === locationId) ||
                results.find((loc) => loc.id === locationId);
            if (location) {
                focusOnLocation(location);
            }
        });
    });
}

function focusOnLocation(location) {
    if (!mapState.map || !location) return;

    mapState.map.flyTo([location.latitude, location.longitude], 18, { duration: 0.6 });
    const markerRecord = mapState.markerIndex.get(location.id);
    markerRecord?.marker.openPopup();
}

async function focusOnCurrentUser() {
    const statusEl = document.querySelector('[data-map-status]');
    if (!('geolocation' in navigator)) {
        if (statusEl) {
            statusEl.textContent = 'Geolocation is not supported on this device.';
            statusEl.classList.add('error');
            statusEl.style.display = 'block';
        }
        return;
    }

    const marker = mapState.liveMarkers.get(currentUser.id);
    if (marker && mapState.map) {
        mapState.map.flyTo(marker.getLatLng(), 18, { duration: 0.6 });
        marker.openPopup();
        return;
    }

    if (statusEl) {
        statusEl.textContent = 'Fetching your current location...';
        statusEl.style.display = 'block';
        statusEl.classList.remove('error');
    }

    try {
        const snapshot = await requestAndSendUserLocation();
        if (statusEl) {
            statusEl.style.display = 'none';
        }
        if (mapState.map) {
            mapState.map.flyTo([snapshot.latitude, snapshot.longitude], 18, { duration: 0.6 });
        }
    } catch (error) {
        if (statusEl) {
            statusEl.textContent =
                error.code === error.PERMISSION_DENIED
                    ? 'Location permission denied. Please allow location access.'
                    : 'Unable to get your location. Please try again.';
            statusEl.classList.add('error');
            statusEl.style.display = 'block';
        }
    }
}

function wireControls() {
    const locateBtn = document.getElementById('locateMeBtn');
    locateBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        focusOnCurrentUser();
    });
}

// Wait for both DOM and Leaflet to be ready
function initializeWhenReady() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                wireControls();
                bootstrapMapFeature();
            }, 100);
        });
    } else {
        setTimeout(() => {
            wireControls();
            bootstrapMapFeature();
        }, 100);
    }
}

initializeWhenReady();

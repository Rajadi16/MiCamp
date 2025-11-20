const API = window.MICAMP_API_BASE_URL || 'http://localhost:4000';
let map, markers=[];

function clearMarkers(){ markers.forEach(m=>map.removeLayer(m)); markers=[]; }

window.addEventListener('DOMContentLoaded', ()=>{
  map = L.map('map').setView([12.90074,77.51738],16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  document.getElementById('createRide').addEventListener('submit', async e=>{
    e.preventDefault();
    const driverId = document.getElementById('driverId').value;
    const from = document.getElementById('from').value.split(',').map(Number);
    const to = document.getElementById('to').value.split(',').map(Number);
    const seats = Number(document.getElementById('seats').value);

    const payload = {
      driverId,
      from:{ latitude:from[0], longitude:from[1] },
      to:{ latitude:to[0], longitude:to[1] },
      seatsTotal: seats
    };

    const res = await fetch(`${API}/api/rides`,{
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });
    if (!res.ok) {
      const txt = await res.text();
      alert('Create failed: '+txt);
      return;
    }
    alert('Ride created');
    loadNearby();
  });

  document.getElementById('searchNearby').addEventListener('click', loadNearby);

  loadNearby();
});

async function loadNearby(){
  const c = map.getCenter();
  const res = await fetch(`${API}/api/rides/nearby?lat=${c.lat}&lng=${c.lng}&radius=2000`);
  const json = await res.json();
  renderRides(json.rides);
}

function renderRides(rides){
  clearMarkers();
  const list = document.getElementById('ridesList');
  list.innerHTML='';
  rides.forEach(r=>{
    const div=document.createElement('div');
    div.innerHTML=`
      <b>Driver: ${r.driverId}</b><br>
      From: ${r.from.latitude}, ${r.from.longitude}<br>
      To: ${r.to.latitude}, ${r.to.longitude}<br>
      Seats: ${r.seatsAvailable}/${r.seatsTotal}
    `;
    const joinBtn=document.createElement('button');
    joinBtn.textContent='Join';
    joinBtn.onclick=async()=>{
      const userId=prompt('Enter your student ID');
      if(!userId) return;
      const res=await fetch(`${API}/api/rides/${r.id}/join`,{
        method:'PUT', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ userId })
      });
      if(!res.ok){ alert('Failed to join'); return; }
      alert('Joined');
      loadNearby();
    };
    div.appendChild(joinBtn);
    list.appendChild(div);

    markers.push(
      L.marker([r.from.latitude,r.from.longitude]).addTo(map)
       .bindPopup(`Driver: ${r.driverId}`)
    );
  });
}

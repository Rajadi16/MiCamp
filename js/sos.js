// SOS Page JavaScript

let sosTimer = null;
let sosProgress = 0;

// Start SOS
function startSOS() {
    const sosButton = document.getElementById('sosButton');
    const sosProgressBar = document.getElementById('sosProgress');

    sosProgressBar.classList.add('active');
    sosProgress = 0;

    sosTimer = setTimeout(() => {
        triggerSOS();
    }, 3000);
}

// Cancel SOS
function cancelSOS() {
    if (sosTimer) {
        clearTimeout(sosTimer);
        sosTimer = null;
    }

    const sosProgressBar = document.getElementById('sosProgress');
    sosProgressBar.classList.remove('active');
}

// Trigger SOS Alert
function triggerSOS() {
    // Get user location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };

                sendSOSAlert(location);
            },
            (error) => {
                console.error('Error getting location:', error);
                sendSOSAlert(null);
            }
        );
    } else {
        sendSOSAlert(null);
    }
}

// Send SOS Alert
function sendSOSAlert(location) {
    const alertData = {
        userId: getUserId(),
        timestamp: new Date().toISOString(),
        location: location,
        type: 'emergency'
    };

    console.log('SOS Alert Sent:', alertData);

    // In production, this would send to backend API
    // fetch('/api/sos/alert', { method: 'POST', body: JSON.stringify(alertData) })

    // Show confirmation modal
    document.getElementById('sosConfirmModal').style.display = 'block';

    // Play alert sound (if available)
    playAlertSound();

    // Vibrate device (if supported)
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
    }
}

// Cancel Alert
function cancelAlert() {
    if (confirm('Are you sure you want to cancel the emergency alert?')) {
        console.log('SOS Alert Cancelled');
        document.getElementById('sosConfirmModal').style.display = 'none';
        alert('Emergency alert has been cancelled.');
    }
}

// Get User ID
function getUserId() {
    const user = localStorage.getItem('micamp_user');
    if (user) {
        return JSON.parse(user).email || 'guest';
    }
    return 'guest';
}

// Play Alert Sound
function playAlertSound() {
    // In production, add actual alert sound file
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log('Audio not supported');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('sosConfirmModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

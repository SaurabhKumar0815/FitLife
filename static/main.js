let runningInterval = null;
let runningSeconds = 0;
let map = null;
let currentMarker = null;
let pathPolyline = null;
let pathCoordinates = [];
let lastPosition = null;
let totalDistance = 0;
let watchId = null;

let userData = {
    workouts: 0,
    calories: 0,
    streak: 0
};

let progressChart, weeklyChart;

function initCharts() {
    const ctx1 = document.getElementById('progressChart').getContext('2d');
    progressChart = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Workouts Completed',
                data: [2, 3, 1, 4, 2, 5, 3],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true }
            }
        }
    });

    const ctx2 = document.getElementById('weeklyChart').getContext('2d');
    weeklyChart = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Calories Burned',
                data: [1200, 1500, 1800, 2100],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(118, 75, 162, 0.8)',
                    'rgba(75, 172, 254, 0.8)',
                    'rgba(0, 242, 254, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true }
            }
        }
    });
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';

    if (sectionId === 'dashboard') {
        setTimeout(initCharts, 100);
        updateDashboard();
    } else if (sectionId === 'running') {
        setTimeout(initMap, 100);
    }
}

function updateDashboard() {
    document.getElementById('totalWorkouts').textContent = userData.workouts;
    document.getElementById('totalCalories').textContent = userData.calories;
    document.getElementById('currentStreak').textContent = userData.streak + ' days';

    const progress = Math.min((userData.workouts / 5) * 100, 100);
    document.getElementById('dailyProgress').style.width = progress + '%';
    document.getElementById('dailyProgress').textContent = Math.round(progress) + '%';
}

function calculateBMI() {
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);

    if (!height || !weight || height <= 0 || weight <= 0) {
        alert('Please enter valid height and weight!');
        return;
    }

    const heightM = height / 100;
    const bmi = (weight / (heightM * heightM)).toFixed(1);

    let status = '', className = '';
    if (bmi < 18.5) {
        status = 'Underweight';
        className = 'underweight';
    } else if (bmi >= 18.5 && bmi < 25) {
        status = 'Normal Weight';
        className = 'normal';
    } else if (bmi >= 25 && bmi < 30) {
        status = 'Overweight';
        className = 'overweight';
    } else {
        status = 'Obese';
        className = 'obese';
    }

    document.getElementById('bmiResult').innerHTML = `
                <div class="bmi-result ${className}">
                    <p>Your BMI: ${bmi}</p>
                    <p>Status: ${status}</p>
                </div>
            `;
            saveBMIData("User", height, weight, bmi, 0);

}

function calculateBMR() {
    const age = parseFloat(document.getElementById('bmrAge').value);
    const gender = document.getElementById('bmrGender').value;
    const weight = parseFloat(document.getElementById('bmrWeight').value);
    const height = parseFloat(document.getElementById('bmrHeight').value);

    if (!age || !weight || !height || age <= 0 || weight <= 0 || height <= 0) {
        alert('Sahi values enter karein!');
        return;
    }

    let bmr;
    if (gender === 'Male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    document.getElementById('bmrResult').innerHTML = `
                <div class="bmi-result normal" style="margin-top: 1rem;">
                    <p>🔥 Your BMR: ${Math.round(bmr)} calories/day</p>
                    <p style="font-size: 0.9rem; opacity: 0.9;">Ye aapki body rest mein burn karti hai</p>
                </div>
            `;
}

function calculateWaterIntake() {
    const weight = parseFloat(document.getElementById('wiWeight').value);
    const activity = parseFloat(document.getElementById('wiActivity').value);

    if (!weight || weight <= 0) {
        alert('Sahi weight enter karein!');
        return;
    }

    const waterML = weight * activity;
    const waterLiters = (waterML / 1000).toFixed(1);
    const glasses = Math.round(waterML / 250);

    document.getElementById('wiResult').innerHTML = `
                <div class="bmi-result normal" style="margin-top: 1rem;">
                    <p>💧 Daily Water: ${waterLiters} liters</p>
                    <p>Approx ${glasses} glasses (250ml each)</p>
                    <p style="font-size: 0.9rem; opacity: 0.9;">⏰ Reminder: Har 2 ghante mein paani piye!</p>
                </div>
            `;
}

function generateDietPlan() {
    const bmi = parseFloat(document.getElementById('dietBMI').value);
    const goal = document.getElementById('fitnessGoal').value;

    if (!bmi || bmi <= 0) {
        alert('Please enter a valid BMI!');
        return;
    }

    let plan = [];
    if (bmi < 18.5) {
        plan = ['High protein diet', 'Eggs, milk, nuts', 'Banana shakes', 'Whole grains', 'Lean meats'];
    } else if (bmi >= 18.5 && bmi < 25) {
        plan = ['Balanced diet', 'Fresh fruits & vegetables', 'Oats & pulses', 'Fish & chicken', 'Green tea'];
    } else if (bmi >= 25 && bmi < 30) {
        plan = ['Low-carb diet', 'Salads & greens', 'Boiled vegetables', 'Lean proteins', 'Green tea'];
    } else {
        plan = ['Low-calorie diet', 'Vegetable soups', 'Fresh fruits', 'Lean proteins', 'Lots of water'];
    }

    document.getElementById('dietResult').innerHTML = `
                <div class="diet-plan">
                    <h4>🎯 ${goal} Plan for BMI ${bmi}</h4>
                    <ul>
                        ${plan.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                    <p style="margin-top: 1rem; font-size: 0.9rem;">💡 Tip: Consult a nutritionist for personalized advice</p>
                </div>
            `;
}

function initMap() {
    if (map) return;

    // Initialize map
    map = L.map('map').setView([28.6139, 77.2090], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Get current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Center map on current location
            map.setView([lat, lng], 16);

            // Add marker with custom icon
            const runnerIcon = L.divIcon({
                html: '<div style="background: #667eea; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                className: 'custom-marker'
            });

            currentMarker = L.marker([lat, lng], { icon: runnerIcon }).addTo(map)
                .bindPopup('📍 You are here!')
                .openPopup();

            // Add accuracy circle
            const accuracy = position.coords.accuracy;
            L.circle([lat, lng], {
                radius: accuracy,
                color: '#667eea',
                fillColor: '#667eea',
                fillOpacity: 0.1,
                weight: 1
            }).addTo(map);

            updateGPSInfo(position);
        }, function (error) {
            console.error('GPS Error:', error);
            let errorMsg = 'GPS unavailable';
            if (error.code === 1) errorMsg = '🚫 GPS permission denied. Please allow location access.';
            if (error.code === 2) errorMsg = '📡 GPS signal unavailable. Try going outside.';
            if (error.code === 3) errorMsg = '⏱️ GPS timeout. Please try again.';
            alert(errorMsg);
            document.getElementById('currentLocation').textContent = errorMsg;
        });
    } else {
        alert('❌ GPS not supported on this device/browser');
    }
}

function updateGPSInfo(position) {
    const lat = position.coords.latitude.toFixed(6);
    const lng = position.coords.longitude.toFixed(6);
    const accuracy = position.coords.accuracy.toFixed(2);

    document.getElementById('latitude').textContent = lat;
    document.getElementById('longitude').textContent = lng;
    document.getElementById('gpsAccuracy').textContent = accuracy;
    document.getElementById('currentLocation').textContent = `${lat}, ${lng}`;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function startRunning() {
    if (runningInterval) return;

    if (!navigator.geolocation) {
        alert('GPS not supported on this device');
        return;
    }

    runningInterval = setInterval(() => {
        runningSeconds++;
        updateRunningDisplay();
    }, 1000);

    watchId = navigator.geolocation.watchPosition(function (position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (currentMarker) {
            currentMarker.setLatLng([lat, lng]);
        } else {
            currentMarker = L.marker([lat, lng]).addTo(map);
        }

        map.panTo([lat, lng]);

        pathCoordinates.push([lat, lng]);

        if (pathPolyline) {
            pathPolyline.setLatLngs(pathCoordinates);
        } else {
            pathPolyline = L.polyline(pathCoordinates, { color: '#667eea', weight: 4 }).addTo(map);
        }

        if (lastPosition) {
            const dist = calculateDistance(
                lastPosition.latitude,
                lastPosition.longitude,
                lat,
                lng
            );
            totalDistance += dist;
        }

        lastPosition = { latitude: lat, longitude: lng };
        updateGPSInfo(position);
    }, function (error) {
        console.error('GPS tracking error:', error);
    }, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    });

    document.querySelector('.running-tracker').classList.add('running-active');
}

function pauseRunning() {
    clearInterval(runningInterval);
    runningInterval = null;

    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    document.querySelector('.running-tracker').classList.remove('running-active');
}

function resetRunning() {
    clearInterval(runningInterval);
    runningInterval = null;
    runningSeconds = 0;
    totalDistance = 0;
    lastPosition = null;
    pathCoordinates = [];

    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    if (pathPolyline) {
        map.removeLayer(pathPolyline);
        pathPolyline = null;
    }

    updateRunningDisplay();
    document.querySelector('.running-tracker').classList.remove('running-active');
}

function updateRunningDisplay() {
    const minutes = Math.floor(runningSeconds / 60);
    const seconds = runningSeconds % 60;
    document.getElementById('runningTimer').textContent =
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Distance covered (in km)
    const distance = totalDistance.toFixed(2);

    // Pace calculation (minutes per km)
    const pace = totalDistance > 0 ? (runningSeconds / 60 / totalDistance).toFixed(2) : 0;

    // ✅ Calories calculation based on distance (62 kcal/km for ~70kg person)
    const calories = Math.round(totalDistance * 62);

    // Update the UI elements
    document.getElementById('runningDistance').textContent = distance + ' km';
    document.getElementById('runningPace').textContent = pace + ' /km';
    document.getElementById('runningCalories').textContent = calories + ' kcal';
}

function filterWorkouts() {
    const filter = document.getElementById('workoutFilter').value;
    const workouts = document.querySelectorAll('.workout-item');

    workouts.forEach(workout => {
        if (filter === 'all') {
            workout.style.display = 'block';
        } else {
            const categories = workout.getAttribute('data-category');
            if (categories && categories.includes(filter)) {
                workout.style.display = 'block';
            } else {
                workout.style.display = 'none';
            }
        }
    });
}

// Motivational Quotes
const motivationalQuotes = [
    { quote: "The only bad workout is the one that didn't happen.", author: "Unknown" },
    { quote: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
    { quote: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
    { quote: "The body achieves what the mind believes.", author: "Napoleon Hill" },
    { quote: "You don't have to be extreme, just consistent.", author: "Unknown" },
    { quote: "Sweat is fat crying.", author: "Unknown" },
    { quote: "Push yourself because no one else is going to do it for you.", author: "Unknown" },
    { quote: "Your only limit is you.", author: "Unknown" },
    { quote: "Strive for progress, not perfection.", author: "Unknown" },
    { quote: "Don't wish for it, work for it.", author: "Unknown" }
];

function getNewQuote() {
    const random = Math.floor(Math.random() * motivationalQuotes.length);
    const quote = motivationalQuotes[random];
    document.getElementById('motivationalQuote').textContent = `"${quote.quote}"`;
    document.getElementById('quoteAuthor').textContent = `- ${quote.author}`;
}

// Alarm Clock
let alarms = [];
let clockInterval = null;

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    document.getElementById('currentTime').textContent = `${hours}:${minutes}:${seconds}`;

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);

    // Check alarms
    alarms.forEach(alarm => {
        if (alarm.active && alarm.time === `${hours}:${minutes}`) {
            triggerAlarm(alarm);
        }
    });
}

function setAlarm() {
    const time = document.getElementById('alarmTime').value;
    const label = document.getElementById('alarmLabel').value || 'Workout Time!';
    const sound = document.getElementById('alarmSound').value;

    if (!time) {
        alert('Please select a time for the alarm!');
        return;
    }

    const alarm = {
        id: Date.now(),
        time: time,
        label: label,
        sound: sound,
        active: true
    };

    alarms.push(alarm);
    updateAlarmList();

    document.getElementById('alarmTime').value = '';
    alert(`✅ Alarm set for ${time} - ${label}`);
}

function updateAlarmList() {
    const container = document.getElementById('activeAlarms');

    if (alarms.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center; padding: 2rem;">No alarms set yet</p>';
        return;
    }

    container.innerHTML = alarms.map(alarm => `
                <div style="background: ${alarm.active ? 'var(--gradient)' : '#e2e8f0'}; color: ${alarm.active ? 'white' : '#666'}; padding: 1rem; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin-bottom: 0.3rem;">⏰ ${alarm.time}</h4>
                        <p style="opacity: 0.9; font-size: 0.9rem;">${alarm.label}</p>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="toggleAlarm(${alarm.id})" style="background: white; color: #667eea; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer; font-weight: 600;">
                            ${alarm.active ? '🔔 ON' : '🔕 OFF'}
                        </button>
                        <button onclick="deleteAlarm(${alarm.id})" style="background: #ef4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer; font-weight: 600;">
                            🗑️
                        </button>
                    </div>
                </div>
            `).join('');
}

function toggleAlarm(id) {
    const alarm = alarms.find(a => a.id === id);
    if (alarm) {
        alarm.active = !alarm.active;
        updateAlarmList();
    }
}

function deleteAlarm(id) {
    alarms = alarms.filter(a => a.id !== id);
    updateAlarmList();
}

function triggerAlarm(alarm) {
    alarm.active = false;
    updateAlarmList();

    const audio = new Audio();
   if (alarm.sound === "beep") {
      audio.src =
        "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";
    } else if (alarm.sound === "energetic") {
      audio.src =
        "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg";
    } else if (alarm.sound === "gentle") {
      audio.src = "https://actions.google.com/sounds/v1/alarms/wake_up.ogg";
    }

    // Play sound multiple times
    let playCount = 0;
    const playInterval = setInterval(() => {
        audio.play().catch(e => console.log('Audio play failed:', e));
        playCount++;
        if (playCount >= 5) clearInterval(playInterval);
    }, 1000);

    // Show alert
    setTimeout(() => {
        alert(`⏰ ALARM! ⏰\n\n${alarm.label}\n\nTime: ${alarm.time}\n\n💪 Get up and crush your workout!`);
    }, 100);
}

window.addEventListener('load', () => {
    showSection('home');
    userData.streak = Math.floor(Math.random() * 7) + 1;

    // Start clock
    clockInterval = setInterval(updateClock, 1000);
    updateClock();
});
function saveBMIData(name, height, weight, bmi, calories) {
    fetch('/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, height, weight, bmi, calories })
    })
    .then(res => res.json())
    .then(data => alert(data.message))
    .catch(err => console.error('Error:', err));
}

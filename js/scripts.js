let STATIONS = [];

let map = L.map("map").setView([7.132804, -73.1221], 15);
map.doubleClickZoom.disable();

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 17,
    minZoom: 12,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// STATIONS
async function setup() {
    // This function must be executed only once!

    // GET STATIONS INFO
    const response = await fetch(
        "https://raw.githubusercontent.com/Estacion-Meteorologica-UIS/thingspeak/main/stations.json"
    );
    const stationsfile = await response.json();

    for (let index = 0; index < stationsfile.stations.length; index++) {
        const station = stationsfile.stations[index];
        const id = station.channelID;
        const key = station.readAPIKey;

        // Get station info and last entry
        const response = await fetch(
            `https://api.thingspeak.com/channels/${id}/feeds.json?api_key=${key}&results=1` +
                "&timezone=America%2FBogota&status=true&round=2"
        );
        const data = await response.json();
        const { name, latitude, longitude } = data.channel;

        const icon = L.icon({
            iconUrl: "https://icons.getbootstrap.com/assets/icons/exclamation-triangle-fill.svg",
            iconSize: [38, 95],
        });
        const marker = L.marker([latitude, longitude], { icon: icon }).addTo(map).bindPopup(name);

        STATIONS.push({
            name: name,
            id: id,
            key: key,
            location: [latitude, longitude],
            last_feed: data.feeds[0],
            marker: marker,
        });
    }

    // Add stations to selector
    let options = "";
    for (let index = 0; index < STATIONS.length; index++) {
        options += `<option value="${index}">${STATIONS[index].name}</option>`;
    }
    document.getElementById("select-station").innerHTML = options;

    // Build Gauges
    buildGauges();
}

async function updateStationsStatus() {
    // This function gets the last feed
    for (let index = 0; index < STATIONS.length; index++) {
        const station = STATIONS[index];
        const response = await fetch(
            `https://api.thingspeak.com/channels/${station.id}/feeds.json?api_key=${station.key}&results=1` +
                "&timezone=America%2FBogota&status=true&round=2"
        );
        const data = await response.json();

        station.last_feed = data.feeds[0];
    }
}

function updateMap() {
    // TODO
    return;
}

function update() {
    updateStationsStatus();
    updateMap();
    updateGauges();
}

document.getElementById("select-station").addEventListener("change", function (e) {
    const index = e.target.value;
    let coords = STATIONS[index].location;
    map.setView(coords, 16, { animate: true, pan: { duration: 0.5 } });
    updateGauges();
});

setup();
setInterval(update, 6000); // Update Status every 60 Seconds

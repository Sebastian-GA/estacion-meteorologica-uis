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
    getTodayData();
    buildGauges();
}

async function updateLastFeed() {
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

// ---------------------------- Data Analysis ----------------------------

Array.prototype.max = function () {
    return Math.max.apply(null, this);
};

Array.prototype.min = function () {
    return Math.min.apply(null, this);
};

Array.prototype.avg = function () {
    return this.reduce(function (p, c, i, a) {
        return p + c / a.length;
    }, 0);
};

async function getDayData(day) {
    // Day date in YYYY-MM-DD format
    const dayData = [];
    for (let index = 0; index < STATIONS.length; index++) {
        const station = STATIONS[index];
        const response = await fetch(
            `https://api.thingspeak.com/channels/${station.id}/feeds.json?api_key=${station.key}` +
                `&timezone=America%2FBogota&round=2&start=${day}%2000:00:00&end=${day}%2023:59:59`
        );
        const data = await response.json();

        // Reformat data into arrays
        const fields = { field1: [], field2: [], field3: [], field4: [], field5: [] };
        const created_at = [];
        data.feeds.forEach((entry) => {
            created_at.push(entry.created_at);
            for (let i = 1; i <= 5; i++) {
                // If NaN value then add [] instead
                if (!isNaN(+entry[`field${i}`])) {
                    fields[`field${i}`].push(+entry[`field${i}`]);
                } else {
                    fields[`field${i}`].push([]);
                }
            }
        });
        // Data analysis
        dayData.push({ field1: {}, field2: {}, field3: {}, field4: {}, field5: {} });
        for (let i = 1; i <= 5; i++) {
            dayData[index][`field${i}`].avg = +fields[`field${i}`].avg().toFixed(2);
            dayData[index][`field${i}`].max = +fields[`field${i}`].max().toFixed(2);
            dayData[index][`field${i}`].min = +fields[`field${i}`].min().toFixed(2);
            // Include all day-feeds
            dayData[index][`field${i}`].feeds = fields[`field${i}`];
        }
        // Include all day-feeds
        dayData[index].created_at = created_at;
    }
    return dayData;
}

async function getTodayData() {
    // Get today date in YYYY-MM-DD format
    let today = new Date();
    const offset = today.getTimezoneOffset();
    today = new Date(today.getTime() - offset * 60 * 1000);
    today = today.toISOString().split("T")[0];

    const data = await getDayData(today);
    for (let index = 0; index < STATIONS.length; index++) {
        STATIONS[index].todayData = data[index];
    }
}

function updateMap() {
    // TODO
    return;
}

function update() {
    updateLastFeed();
    updateMap();
    updateGauges();
    getTodayData();
}

document.getElementById("select-station").addEventListener("change", function (e) {
    const index = e.target.value;
    let coords = STATIONS[index].location;
    map.setView(coords, 16, { animate: true, pan: { duration: 0.5 } });
    updateGauges();
});

setup();
setInterval(update, 60000); // Update Status every 60 Seconds

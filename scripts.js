let STATIONS = [];

let map = L.map("map").setView([7.1404, -73.1201], 15);
map.doubleClickZoom.disable();

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 17,
    minZoom: 12,
    attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// STATIONS
async function getStationsInfo() {
    // This function must be executed only once!
    const response = await fetch("./stations.json");
    const stationsfile = await response.json();

    for (let index = 0; index < stationsfile.stations.length; index++) {
        const station = stationsfile.stations[index];
        const id = station.channelID;
        const key = station.readAPIKey;

        // Get other properties of station
        const response = await fetch(
            `https://api.thingspeak.com/channels/${id}/feeds.json?api_key=${key}&results=1`
        );
        const data = await response.json();
        const { name, latitude, longitude, updated_at } = data.channel;

        const icon = L.icon({
            iconUrl:
                "https://icons.getbootstrap.com/assets/icons/exclamation-triangle-fill.svg",
            iconSize: [38, 95],
        });
        const marker = L.marker([latitude, longitude], { icon: icon })
            .addTo(map)
            .bindPopup(name);

        STATIONS.push({
            name: name,
            id: id,
            key: key,
            location: [latitude, longitude],
            updated_at: updated_at,
            last_feed: data.feeds[0],
            marker: marker,
        });
    }

    // Set options in the "select-station" selector
    let options = "";
    for (let index = 0; index < STATIONS.length; index++) {
        options += `<option value="${index}">${STATIONS[index].name}</option>`;
    }
    document.getElementById("select-station").innerHTML = options;
}

getStationsInfo();

async function updateStationsStatus() {
    // This function get the last feed (must be executed at least every minute)
    for (let index = 0; index < STATIONS.length; index++) {
        const station = STATIONS[index];
        const response = await fetch(
            `https://api.thingspeak.com/channels/${station.id}/feeds.json?api_key=${station.key}&results=1`
        );
        const data = await response.json();

        station.last_feed = data.feeds;
    }
}

document
    .getElementById("select-station")
    .addEventListener("change", function (e) {
        const index = e.target.value
        let coords = STATIONS[index].location;
        map.setView(coords);
        
        piopo.data.datasets[0].value = STATIONS[index].last_feed.field1;

        piopo.update();

    });

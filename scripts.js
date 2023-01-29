let STATIONS = [];
const url_api =
    "https://api.thingspeak.com/channels/{id}/feeds{format}?api_key={key}&results={x}";

// MAP SETUP
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
    const response = await fetch("./stations.json");
    const stationsfile = await response.json();

    stationsfile.stations.forEach((element) => {
        const id = element.channelID;
        const key = element.readAPIKey;

        // Get other properties of station
        const response = fetch(
            `https://api.thingspeak.com/channels/${id}/feeds.json?api_key=${key}&results=0`
        )
            .then((response) => {
                return response.json();
            })
            .then((data) => {
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
                    marker: marker,
                });
            });
    });
}

getStationsInfo();

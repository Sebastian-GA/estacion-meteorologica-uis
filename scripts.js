let STATIONS = [];
const url_api =
    "https://api.thingspeak.com/channels/{id}/feeds{format}?api_key={key}&results={x}";

// MAP SETUP
let map = L.map("map").setView([7.1404, -73.1201], 15);
map.doubleClickZoom.disable();

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 17,
    minZoom: 5,
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

        const response = fetch(
            // Get other properties of station
            `https://api.thingspeak.com/channels/${id}/feeds.json?api_key=${key}&results=0`
        )
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                STATIONS.push({
                    name: data.channel.name,
                    id: data.channel.id,
                    key: data.channel.key,
                    location: [data.channel.latitude, data.channel.longitude],
                    updated_at: data.channel.updated_at,
                });
            });
    });
}

getStationsInfo();

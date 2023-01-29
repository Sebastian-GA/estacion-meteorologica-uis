let stationsIDs = [];
let stationsKeys = [];

const readChannelRequest =
    "https://api.thingspeak.com/channels/{id}/feeds{format}?api_key={key}&results={x}";
const readStatusRequest =
    "https://api.thingspeak.com/channels/{id}/status.json?api_key={key}";

async function readStationsFile() {
    const response = await fetch("./stations.json");
    const stations = await response.json();

    stations.stations.forEach((element) => {
        stationsIDs.push(element.channelID);
        stationsKeys.push(element.readAPIKey);
    });
    return { stationsIDs, stationsKeys };
}

readStationsFile();

let map = L.map("map").setView([7.1404, -73.1201], 15);
map.doubleClickZoom.disable();

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 17,
    minZoom: 5,
    attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

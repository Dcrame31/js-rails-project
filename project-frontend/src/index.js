const BASE_URL = "http://localhost:3000"
const HIKES_URL = BASE_URL + '/hikes'
const LOCATIONS_URL = BASE_URL + '/locations'
const body = document.body
const list = document.getElementById("list")
const select = document.querySelector("select#location-dropdown")

document.addEventListener("DOMContentLoaded", () => {
    getHikes()
})


class Hike {
    constructor(name, distance, difficulty, elevation_gain, website, location_id) {
        this.name = name,
            this.distance = distance,
            this.difficulty = difficulty,
            this.elevation_gain = elevation_gain,
            this.website = website,
            this.location_id = location_id
    }



}

function formVisibility(status) {
    const form = document.getElementById("new-hike-form").style.display = status;
}

function homeButton(status) {
    document.getElementById("home").style.visibility = status;
}

function locationButton(status) {
    document.getElementById("locations").style.visibility = status;
}

function newHikeButton(status) {
    document.getElementById("new-hike").style.visibility = status;
}

function fetchLocations() {
    fetch(LOCATIONS_URL)
        .then(resp => resp.json())
        .then(populateLocationDropdown)
}

function populateLocationDropdown(data) {
    let sorted = sortLocation(data)
    for (let location of sorted) {
        let option = document.createElement('option')
        option.innerHTML = location.county
        option.value = location.id
        select.appendChild(option)
    }

    [].slice.call(select.options)
        .map(function (a) {
            if (this[a.innerText]) {
                select.removeChild(a);
            } else {
                this[a.innerText] = 1;
            }
        }, {});
}

function toggleDropdown() {
    fetchLocations()
}

function sortHike(obj) {
    return obj.sort(function (a, b) { return a.name > b.name ? 1 : -1 });
}

function sortLocation(obj) {
    return obj.sort(function (a, b) { return a.county > b.county ? 1 : -1 });
}

function listHike(hike) {
    return `<li>
            <a href="#" data-id="${hike.id}">${hike.name}</a>
            </li>`
}

function getList(url, callback1, callback2) {
    return fetch(url)
        .then(resp => resp.json())
        .then(obj => {
            // let list = document.querySelector('#list')
            let sorted = callback1(obj)
            list.innerHTML += sorted.map(entry => callback2(entry)).join('')

            // container.append(list)
            attachClickToLinks()
        })
}

function getHikes() {
    list.innerHTML = ""
    homeButton("hidden")
    locationButton("visible")
    newHikeButton("visible")
    formVisibility("none")
    // clearForm()
    return getList(HIKES_URL, sortHike, listHike)
}

function attachClickToLinks() {
    let hikes = document.querySelectorAll('li a')
    hikes.forEach(hike => {
        hike.addEventListener('click', showHike)
    })
    document.getElementById("new-hike").addEventListener('click', displayForm)
    document.getElementById("locations").addEventListener('click', getLocations)
    document.getElementById("home").addEventListener('click', getHikes)
    document.querySelector("form select#location-dropdown").addEventListener('click', toggleDropdown)
    document.querySelector("form").addEventListener("submit", createHike)
}

// function clearForm() {
//     let formDiv = document.getElementById("new-hike-form")
//     return formDiv.innerHTML = ""
// }

function displayForm() {
    list.innerHTML = ""
    homeButton("visible")
    locationButton("visible")
    newHikeButton("hidden")
    formVisibility("block")
    // document.querySelector('form').addEventListener('submit', createHike)
}

function createHike() {
    event.preventDefault()

    const newHike = new Hike(document.getElementById("name").value,
        document.getElementById('distance').value,
        document.getElementById('difficulty').value,
        document.getElementById('elevation_gain').value,
        document.getElementById('website').value,
        select.value
    )

    fetch(HIKES_URL, {
        method: "POST",
        body: JSON.stringify({
            "name": newHike.name,
            "difficulty": newHike.difficulty,
            "distance": newHike.distance,
            "elevation_gain": newHike.elevation_gain,
            "website": newHike.website,
            "location_id": newHike.location_id
        }),
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    })
        .then(resp => resp.json())
        .then(hike => {
            list.innerHTML += `<li>
            <a href="#" data-id="${hike.id}">${hike.name}</a>
            </li>`
        })
}

function showHike() {
    list.innerHTML = ""
    homeButton("visible")
    let id = event.target.dataset.id

    fetch(HIKES_URL + "/" + id)
        .then(resp => resp.json())
        .then(obj => {
            list.innerHTML = `<h1>${obj['name']}</h1 >
                <p>Difficulty: ${obj.difficulty}</p>
                <p>Distance: ${obj.distance} miles</p>
                <p>Elevation Gain: ${obj.elevation_gain} feet</p>
                <p>Location: ${obj.location.county} </p>
                <a href="${obj.website}" target="_blank">More info</a>
                    `
        })
}

function deleteHike() {

}

function getLocations() {
    list.innerHTML = ""
    homeButton("visible")
    locationButton("hidden")
    newHikeButton("visible")
    formVisibility("none")
    // clearForm()
    return getList(LOCATIONS_URL, sortLocation, listLocation)
}

function listLocation(location) {
    return `<li>
                        <a href="#" data-id="${location.id}">${location.county}</a>
                    </li>`
}

function showLocation() {

}

function createLocation() {

}

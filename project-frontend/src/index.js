const BASE_URL = "http://localhost:3000"
const HIKES_URL = BASE_URL + '/hikes'
const LOCATIONS_URL = BASE_URL + '/locations'
const body = document.body
const list = document.getElementById("list")

document.addEventListener("DOMContentLoaded", () => {
    getHikes()
})



function homeButton(status) {
    document.getElementById("home").style.visibility = status;
}

function locationButton(status) {
    document.getElementById("locations").style.visibility = status;
}

function newHikeButton(status) {
    document.getElementById("new-hike").style.visibility = status;
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
    clearForm()
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
}

function clearForm() {
    let formDiv = document.getElementById("new-hike-form")
    return formDiv.innerHTML = ""
}

function displayForm() {
    list.innerHTML = ""
    homeButton("visible")
    locationButton("visible")
    newHikeButton("hidden")
    let form = document.getElementById("new-hike-form")
    form.innerHTML += ` <form>
    <p><label>Name:</label><p>
    <input type="text" id="name">
    <p><label>Difficulty:</label></p>
    <input type="text" id="difficulty">
    <p><label>Distance:</label></p>
    <input type="text" id="distance">
    <p><label>Elevation Gain:</label></p>
    <input type="text" id="elevation_gain">
    <p><label>Website:</label></p>
    <input type="text" id="website">
    <p><input type="submit" value="Add Hike"></p>
    </form
    `
    document.querySelector('form').addEventListener('submit', createHike)
}

function createHike() {
    event.preventDefault()
    const hike = {
        name: document.getElementById("name").value,
        difficulty: document.getElementById('difficulty').value,
        distance: document.getElementById('distance').value,
        elevation_gain: document.getElementById('elevation_gain').value,
        location: document.getElementById('location').value,
        website: document.getElementById('website').value
    }
}

function showHike() {
    list.innerHTML = ""

}

function getLocations() {
    list.innerHTML = ""
    homeButton("visible")
    locationButton("hidden")
    newHikeButton("visible")
    clearForm()
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
// function listHikes(obj) {
//     let newHike = createHike();
//     let list = document.getElementById('list')
//     obj.forEach(hike => {
//         list += `<li>${hike.name}</li>`
//     })
//     return list;
// }
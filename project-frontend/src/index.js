const BASE_URL = "http://localhost:3000"
const HIKES_URL = BASE_URL + '/hikes'
const LOCATIONS_URL = BASE_URL + '/locations'
const container = document.body

document.addEventListener("DOMContentLoaded", () => {
    fetchHikes()
})

function createHike(hike) {
    container += `<div>
        <p>
            ${hike.name}
        </p>
        <p>
    </div>`

}

function fetchHikes() {
    return fetch(HIKES_URL)
        .then(resp => resp.json())
        .then(obj => {
            let list = document.getElementById('list')
            list.innerHTML += obj.map(hike =>
                `<li>
                <a href="#" data-id="${hike.id}">${hike.name}</a>
                </li>`
            )
            container.append(list)
        })
}

function fetchHike() {

}

// function listHikes(obj) {
//     let newHike = createHike();
//     let list = document.getElementById('list')
//     obj.forEach(hike => {
//         list += `<li>${hike.name}</li>`
//     })
//     return list;
// }
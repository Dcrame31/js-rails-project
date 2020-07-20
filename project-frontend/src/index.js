const BASE_URL = "http://localhost:3000"
const HIKES_URL = BASE_URL + '/hikes'
const LOCATIONS_URL = BASE_URL + '/locations'

document.addEventListener("DOMContentLoaded", () => {
    renderHomePage();
})


class Hike {
    constructor(name, distance, difficulty, elevation_gain, website, location_id) {
        this.name = name;
        this.distance = distance;
        this.difficulty = difficulty;
        this.elevation_gain = elevation_gain;
        this.website = website;
        this.location_id = location_id;
    }
}

class Location {
    constructor(county) {
        this.county = county
    }
}

function alphabeticalBy(value) {
    return (a, b) => a[value] > b[value] ? 1 : -1;
}


function sortHike(obj) {
    return obj.sort(function (a, b) { return a.name > b.name ? 1 : -1 });
}

function sortLocation(obj) {
    return obj.sort(function (a, b) { return a.county > b.county ? 1 : -1 });
}

// function listLocation(location) {
//     return `<li>
//                 <a href="#" data-id="${location.id}">${location.county}</a>
//             </li>`
// }

/* Helpers
------------------------------------------ */
function getId(id) {
    return document.getElementById(id);
}

function renderScreen(innerHTML) {
    getId('main').innerHTML = innerHTML;
}

function getValue(id) {
    return document.getElementById(id).value;
}

/* Render
------------------------------------------ */
async function renderForm(hike = {}) {
    const {
        difficulty = '',
        distance = 0,
        elevation_gain = 0,
        name = '',
        website = '',
    } = hike;

    const counties = await getCounties();
    const countyOptions = counties
        .sort(alphabeticalBy('county'))
        .map(({ county, id }) => {
            return `<option value="${id}">${county}</option>`
        })

    renderScreen(`
        <form id="new-hike-form">
            <p><label>Name:</label></p>
            <input type="text" id="name" value="${name}">

            <p><label>Difficulty:</label></p>
            <input type="text" id="difficulty" value="${difficulty}">

            <p><label>Distance:</label></p>
            <input type="number" id="distance" value="${distance}">

            <p><label>Elevation Gain:</label></p>
            <input type="number" id="elevation_gain" value="${elevation_gain}">

            <p><label>Location:</label></p>
            <select id="location-dropdown">
                <option value="" disabled selected>Select a location</option>
                ${countyOptions.join('')}
            </select>

            <p><label>Website:</label></p>
            <input type="text" id="website" value="${website}">

            <p><input id="submit" type="submit" value="Add Hike"></p>
        </form>
    `)
}

function renderFooter(config = {}) {
    const {
        displayHome = true,
        displayCreate = true,
    } = config;
    const footer = document.createElement('footer');

    const footerItems = [
        {
            name: 'Home',
            handler: renderHomePage,
            isVisible: displayHome
        },
        {
            name: 'Add New Hike',
            handler: renderCreatePage,
            isVisible: displayCreate
        },
    ].forEach(({ handler, isVisible, name }) => {
        if (!isVisible) {
            return;
        }

        const id = name.replace(' ', '-').toLowerCase();
        const anchor = document.createElement('a');

        anchor.className = "button"
        anchor.href = '#';
        anchor.innerText = name;
        anchor.addEventListener('click', handler);

        footer.appendChild(anchor);
    });

    getId('main').appendChild(footer);
}

async function renderHomePage() {
    const counties = await getCounties();
    const countyOptions = counties
        .sort(alphabeticalBy('county'))
        .map(({ county, id }) => {
            return `<option value="${id}">${county}</option>`
        })

    renderScreen(`
        <label for="location-dropdown">County:</label>
        <select id="location-dropdown" name="location-dropdown">
            <option value="" selected>All</option>
            ${countyOptions.join('')}
        </select>
        <ul id="list"></ul>
    `);

    const list = await getHikes();
    const $listElement = getId('list');
    const $dropDown = getId("location-dropdown")

    renderHikesList(list, $listElement, $dropDown.value)

    $dropDown.addEventListener(
        'change',
        (event) => renderHikesList(list, $listElement, event.target.value)
    );

    renderFooter({ displayHome: false });
}

function renderHikesList(list, $listElement, locationId) {
    $listElement.innerHTML = ""

    list
        .filter(({ location }) => {
            if (locationId === "") {
                return true
            } else {
                return location.id === Number(locationId)
            }
        })
        .sort(alphabeticalBy('name'))
        .forEach(({ name, id }) => {
            const listItem = document.createElement('li')
            // const anchor = document.createElement('a');

            listItem.innerText = name;
            listItem.dataset.id = id;
            // anchor.href = '#';
            listItem.addEventListener('click', (e) => {
                e.preventDefault();
                renderHikeSummaryPage(id)
            });

            // listItem.appendChild(anchor);

            $listElement.appendChild(listItem);
        });
}

async function renderEditPage(hike) {
    await renderForm(hike);

    getId('new-hike-form').addEventListener('submit', () => {
        const payload = {
            name: getValue('name'),
            difficulty: getValue("difficulty"),
            distance: Number(getValue('distance')),
            elevation_gain: Number(getValue('elevation_gain')),
            website: getValue("website"),
            location_id: Number(getValue('location-dropdown'))
        }

        updateHike(hike.id, payload)
            .then(renderHomePage)
            .catch(renderHomePage);
    });

    renderFooter({ displayCreate: false });
}

async function renderCreatePage() {
    await renderForm();

    getId('new-hike-form').addEventListener('submit', () => {
        const payload = {
            name: getValue('name'),
            difficulty: getValue("difficulty"),
            distance: Number(getValue('distance')),
            elevation_gain: Number(getValue('elevation_gain')),
            website: getValue("website"),
            location_id: Number(getValue('location-dropdown'))
        }

        createHike(payload)
            .then(renderHomePage)
            .catch(renderHomePage);
    });

    renderFooter({ displayCreate: false });
}

async function renderHikeSummaryPage(id) {
    const hike = await getHikeSummary(id);

    const {
        difficulty,
        distance,
        elevation_gain,
        location,
        name,
        website,
    } = hike;

    renderScreen(`
        <h1>${name}</h1>
        <p>Difficulty: ${difficulty}</p>
        <p>Distance: ${distance} miles</p>
        <p>Elevation Gain: ${elevation_gain} feet</p>
        <p>Location: ${location.county} </p>
        <a href="${website}" target="_blank">More info</a>
        <br>
        <br>
        <button id="delete" data-id="${id}">Delete</button>
        <button id="edit" data-id="${id}">Edit</button>
    `);

    getId('edit').addEventListener('click', () => {
        renderEditPage(hike);
    })
    getId('delete').addEventListener('click', () => {
        deleteHike(hike.id)
            .then(renderHomePage)
    })

    renderFooter();
}



/* Api calls
----------------------------------------------- */
async function getHikes() {
    return fetch(HIKES_URL).then(resp => resp.json())
}

async function getCounties() {
    return fetch(LOCATIONS_URL).then(resp => resp.json())
}

async function getHikeSummary(id) {
    return fetch(`${HIKES_URL}/${id}`).then(resp => resp.json())
}

async function createHike(body = {
    difficulty: '',
    distance: 0,
    elevation_gain: 0,
    location_id: null,
    name: '',
    website: ''
}) {
    return fetch(HIKES_URL, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    })
        .then(resp => resp.json())
}

async function updateHike(id, body = {
    difficulty: '',
    distance: 0,
    elevation_gain: 0,
    location_id: null,
    name: '',
    website: ''
}) {
    return fetch(`${HIKES_URL}/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(body)
    }).catch(error => alert(error.message))

}

async function deleteHike(id) {
    return fetch(`${HIKES_URL}/${id}`, {
        method: "DELETE",
    })
}
document.addEventListener("DOMContentLoaded", () => {
    new App();
})

class App {
    constructor() {
        this.renderHomePage()
    }

    async renderEditPage(hike) {
        await this.renderForm(hike.data);

        DomHelpers.getId('new-hike-form').addEventListener('submit', () => {
            const payload = {
                name: DomHelpers.getValue('name'),
                difficulty: DomHelpers.getValue("difficulty"),
                distance: Number(DomHelpers.getValue('distance')),
                elevation_gain: Number(DomHelpers.getValue('elevation_gain')),
                website: DomHelpers.getValue("website"),
                location_id: Number(DomHelpers.getValue('location-dropdown'))
            }

            hike.updateHike(payload)
                .finally(this.renderHomePage.bind(this))
        });

        this.renderFooter({ displayCreate: false });
    }

    async renderCreatePage() {
        await this.renderForm();

        DomHelpers.getId('new-hike-form').addEventListener('submit', () => {
            const payload = {
                name: DomHelpers.getValue('name'),
                difficulty: DomHelpers.getValue("difficulty"),
                distance: Number(DomHelpers.getValue('distance')),
                elevation_gain: Number(DomHelpers.getValue('elevation_gain')),
                website: DomHelpers.getValue("website"),
                location_id: Number(DomHelpers.getValue('location-dropdown'))
            }

            Api.createHike(payload)
                .then(this.renderHomePage.bind(this))
                .catch(this.renderHomePage.bind(this));
        });

        this.renderFooter({ displayCreate: false });
    }

    async renderHikeSummaryPage(id) {
        const hike = new Hike(id);

        await hike.init();

        DomHelpers.renderScreen(`
            <div id="hike-summary"></div>
            <br>
            <br>
            <button id="delete" data-id="${id}">Delete</button>
            <button id="edit" data-id="${id}">Edit</button>
        `);

        DomHelpers.appendToId('hike-summary', hike.$el);

        DomHelpers.getId('edit').addEventListener('click', () => {
            this.renderEditPage(hike);
        })

        DomHelpers.getId('delete').addEventListener('click', () => {
            Api.deleteHike(hike.id)
                .then(this.renderHomePage.bind(this))
        })

        this.renderFooter();
    }

    async renderHomePage() {
        const counties = await Api.getCounties();
        const countyOptions = counties
            .sort(DomHelpers.alphabeticalBy('county'))
            .map(({ county, id }) => {
                return `<option value="${id}">${county}</option>`
            })


        DomHelpers.renderScreen(`
            <label for="location-dropdown">County:</label>
            <select id="location-dropdown" name="location-dropdown">
                <option value="" selected>All</option>
                ${countyOptions.join('')}
            </select>
            <div id="list-container"><div/>
        `);

        const data = await Api.getHikes();
        const $dropDown = DomHelpers.getId("location-dropdown")

        this.renderHikesList(data);

        $dropDown.addEventListener(
            'change',
            (event) => this.renderHikesList(data, event.target.value)
        );

        this.renderFooter({ displayHome: false });
    }

    renderHikesList(data, locationId) {
        DomHelpers.clearById('list-container');

        const list = new List(data, locationId, this.renderHikeSummaryPage.bind(this));

        DomHelpers.appendToId('list-container', list.$el);
    }

    async renderForm(hike = {}) {
        const {
            difficulty = '',
            distance = 0,
            elevation_gain = 0,
            name = '',
            website = '',
        } = hike;

        const counties = await Api.getCounties();
        const countyOptions = counties
            .sort(DomHelpers.alphabeticalBy('county'))
            .map(({ county, id }) => {
                return `<option value="${id}">${county}</option>`
            })

        DomHelpers.renderScreen(`
            <form id="new-hike-form">
                <p><label>Name:</label></p>
                <input type="text" id="name" value="${name}">
    
                <p><label>Difficulty:</label></p>
                <input type="text" id="difficulty" value="${difficulty}">
    
                <p><label>Distance:</label></p>
                <input type="number" step="0.01" id="distance" value="${distance}">
    
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

    renderFooter(config = {}) {
        const {
            displayHome = true,
            displayCreate = true,
        } = config;
        const footer = document.createElement('footer');

        const footerItems = [
            {
                name: 'Home',
                handler: this.renderHomePage.bind(this),
                isVisible: displayHome
            },
            {
                name: 'Add New Hike',
                handler: this.renderCreatePage.bind(this),
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

        DomHelpers.getId('main').appendChild(footer);
    }
}


class Hike {
    id = null;
    data = {};
    $el = document.createElement('div');

    constructor(id) {
        this.id = id;
    }

    async init() {
        await this.getHikeData(this.id);

        this.renderHikeItem();
    }

    async getHikeData(id) {
        const data = await Api.getHikeSummary(id);

        this.data = data;
        this.renderHikeItem();
    }

    updateHike(body = {
        difficulty: '',
        distance: 0,
        elevation_gain: 0,
        location_id: null,
        name: '',
        website: ''
    }) {
        return Api.editHike(this.id, body);
    }

    deleteHike = (id) => {
        return Api.deleteHike(id);
    }

    renderHikeItem() {
        const {
            name, difficulty, distance, elevation_gain, location, website
        } = this.data;

        this.$el.innerHTML = `
            <h1>${name}</h1>
            <p>Difficulty: ${difficulty}</p>
            <p>Distance: ${distance} miles</p>
            <p>Elevation Gain: ${elevation_gain} feet</p>
            <p>Location: ${location.county} </p>
            <a href="${website}" target="_blank">More info</a> 
        `
    }
}

class List {
    $el = null;

    constructor(list, locationId, onListItemClick) {
        const filteredList = this.filterList(list, locationId);

        this.$el = this.renderList(filteredList, onListItemClick);
    }

    filterList(list, locationId) {
        return list
            .filter(({ location }) => {
                if (!locationId) {
                    return true
                } else {
                    return location.id === Number(locationId)
                }
            })
            .sort(DomHelpers.alphabeticalBy('name'))
    }

    renderList(list, onListItemClick) {
        const $listElement = document.createElement('ul');

        list.forEach(({ name, id }) => {

            $listElement.appendChild(
                this.renderListItem(name, id, onListItemClick)
            );
        });

        return $listElement;
    }

    renderListItem(name, id, onClick) {
        const $listItem = document.createElement('li');

        $listItem.innerText = name;
        $listItem.dataset.id = id;

        $listItem.addEventListener('click', (e) => {
            e.preventDefault();
            onClick(id);
        });

        return $listItem;
    }
}

class Api {
    static baseUrl = 'http://localhost:3000';
    static hikesEndpoint = '/hikes'
    static locationsEndpoint = '/locations'

    static createHike(body = {
        difficulty: '',
        distance: 0,
        elevation_gain: 0,
        location_id: null,
        name: '',
        website: ''
    }) {
        return fetch(`${this.baseUrl}${this.hikesEndpoint}`, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        })
            .then(resp => resp.json())

    }

    static getCounties() {
        return fetch(`${this.baseUrl}${this.locationsEndpoint}`).then(resp => resp.json())
    }

    static getHikes() {
        return fetch(`${this.baseUrl}${this.hikesEndpoint}`).then(resp => resp.json())
    }

    static getHikeSummary(id) {
        return fetch(`${this.baseUrl}${this.hikesEndpoint}/${id}`).then(resp => resp.json())
    }

    static deleteHike(id) {
        return fetch(`${this.baseUrl}${this.hikesEndpoint}/${id}`, { method: 'DELETE' }).then(res => res.text());
    }

    static editHike(id, body) {
        return fetch(`${this.baseUrl}${this.hikesEndpoint}/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(body)
        }).catch(error => alert(error.message))
    }

}


/* DomHelpers
------------------------------------------ */
class DomHelpers {
    static clearScreen() {
        document.body.innerHTML = '';
    }

    static appendToId(id, $el) {
        const $container = this.getId(id);

        if ($container) {
            $container.appendChild($el);
        }
    }

    static getId(id) {
        return document.getElementById(id);
    }

    static clearById(id) {
        const $container = this.getId(id);

        if ($container) {
            $container.innerHTML = '';
        }
    }

    static renderScreen(innerHTML) {
        this.getId('main').innerHTML = innerHTML;
    }

    static getValue(id) {
        return document.getElementById(id).value;
    }

    static alphabeticalBy = (value) => {
        return (a, b) => a[value] > b[value] ? 1 : -1;
    }
}

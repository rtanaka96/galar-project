// api links //
//const galarAPI = `galar.json`;
//live link
const galarAPI = `https://pokeapi.co/api/v2/generation/8/`;

// get necessary DOM elements //
const cardContainer = document.querySelector('#dex');
const card = document.querySelectorAll('.card');
const overlay = document.querySelector('.overlay');
let modal = document.querySelector('.modal');
const searchBar = document.querySelector('#search');
const filterMenu = document.querySelector('#filter');
const filterSelects = document.getElementsByClassName('filter');
const typeFilter = document.querySelector('#type');
const colorFilter = document.querySelector('#pokemoncolor');
const abilityFilter = document.querySelector('#ability');
const hint = document.querySelector('.hint');

// //declare variables
let pokemons = [];
let pulledPokes = [];

// set bg //
// let bgs = [];
// let bgSetting;
// // for (let i = 1; i < 6; i++) {
//     bgs.push('url("img/bg_scenery'+[i]+'.png")');
// }

// function getRandomBg(bgs) {
//     let i = 1;
//     do {
//         bgs.push("url('img/bg_scenery" + [i] + ".png')");
//         bgs.push("url('img/bg_pattern" + [i] + ".png')")
//         i++;
//     } while (i < 6);
//     let ran = bgs[Math.floor(Math.random() * bgs.length)];
//     if(ran.includes('scenery')) {
//         bgSetting = 'no-repeat center center fixed';
//         bgSize = 'cover';
//     } else {
//         bgSetting = 'repeat';
//         bgSize = 'contain';
//     }
//     document.body.style.background = ran + ' ' + bgSetting;
//     document.body.style.backgroundSize = bgSize;
//     console.log(ran);

// }

// getRandomBg(bgs);

//set random gradient bg
let colors = [
    '#ddd6f3, #faaca8',
    '#DAD299, #B0DAB9',
    '#5f2c82', '#49a09d',
    '#24C6DC, #514A9D',
    '#1CD8D2, #93EDC7',
    '#AA076B, #61045F',
    '#C9FFBF, #FFAFBD',
    '#B3FFAB, #12FFF7',
    '#FF4E50, #F9D423',
    '#A1FFCE, #FAFFD1',
    '#c0c0aa, #1cefff',
    '#34e89e, #0f3443',
    '#0f3443, #fffcdc',
    '#1c92d2, #f2fcfe',
    '#d53369, #cbad6d'
];
let random = colors[Math.floor(Math.random() * colors.length)];
let bg = `linear-gradient(to right, ${random})`;
document.body.style.backgroundImage = bg;

// fetch data from pokemon api // 
fetch(galarAPI)
    .then(res => res.json())
    .then(allpokemon => pullPokemon(allpokemon))
    .catch(err => console.log(err));

// store data // 
let pokeData = {
    'name': '',
    'number': '',
    'color': '',
    'flavortext': '',
    'genera': '',
    'sprite': '',
    'art': '',
    'types': '',
    'abilities': [],
    'height': '',
    'weight': '',
    'baseexp': '',
    'stats': [],
    'growth': '',
    'shape': ''
}
let storedPokeData = [];

// pull data from fetched data // 
async function extractMonData(mon) {
    //grab name and dex number
    let number = (mon.url).slice(-5);
    //console.log(mon);
    //get api urls to fetch data from
    basicURL = mon.url;
    detailedURL = `https://pokeapi.co/api/v2/pokemon${number}`;

    await Promise.all([
        fetch(basicURL)
            .then(response => response.json())
            .then(data => {
                //pull data for easier access
                pokeData.name = data.name;
                pokeData.number = data.pokedex_numbers[0].entry_number;
                pokeData.color = data.color.name;
                pokeData.shape = data.shape.name;
                pokeData.growth = data.growth_rate.name;

                //grab english only genus name
                data.genera.forEach(item => {
                    if (item.language.name == 'en') {
                        pokeData.genera = item.genus;
                    }
                });

                //grab english only flavor text
                data.flavor_text_entries.forEach(item => {
                    if (item.language.name == 'en') {
                        pokeData.flavortext = item.flavor_text;
                    }
                });
            }),
        fetch(detailedURL)
            .then(response => response.json())
            .then(data => {
                //pull data for easier access
                pokeData.sprite = data.sprites.front_default;
                pokeData.art = data.sprites.other["official-artwork"].front_default;
                let statArray = [];
                data.stats.forEach(function (stats) {
                    statArray.push(stats);
                });
                pokeData.stats = statArray;
                //grab all types
                let typeArray = [];
                data.types.forEach(function (type, index) {
                    typeArray.push(type.type.name);
                });
                pokeData.types = typeArray;
                // grab all abilities
                let abilityArray = [];
                data.abilities.forEach(ability => {
                    abilityArray.push(ability.ability);
                });
                pokeData.abilities = abilityArray;
                //grab misc data
                pokeData.height = data.height / 10 + 'm';
                pokeData.weight = data.weight / 10 + 'kg';
                pokeData.baseexp = data.base_experience;
            })

    ]);
    let clone = { ...pokeData }
    storedPokeData.push(clone);
    renderCard(pokeData);
    return storedPokeData;
}

//select data to fetch
function pullPokemon(mon) {
    pokemons = mon.pokemon_species;
    pulledPokes = mon.pokemon_species;
    mon = mon.pokemon_species;

    mon.forEach((mon) => {
        extractMonData(mon);
    });
}

//store pokemon data

//check that pokemon data is stored
let isStored = (storedPokeData.length === pulledPokes.length);

// create cards // 
function renderCard(data) {
    let typeContainer = document.createElement('div');
    typeContainer.className = 'types';

    //console.log(data);

    data.types.forEach(type => {
        let typeElem = `<span class="type ${type}">${type}</span>`;
        typeContainer.insertAdjacentHTML('beforeend', typeElem);
    });

    let card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<img src="${data.sprite}" alt="${data.name}">
    <div class="card-header">
        <h1>${data.name}</h1>
        <span class="dexnumber">${data.number}</span>
    </div>`;
    card.insertAdjacentElement('beforeEnd', typeContainer);
    card.insertAdjacentHTML('beforeend', `<div class="desc">
    <h2>${data.genera}</h2>
    <p>${data.flavortext}</p>
</div>`);

    cardContainer.insertAdjacentElement('beforeend', card);
}

// populate filter menus // 
//pull info to populate lists
function pullList(src) {
    let results = [];
    src.results.forEach(res => {
        //console.log(res.name);
        results.push(res.name);
    })
    return results;
}
//populate list
function fillList(item, cat) {
    let opt = document.createElement('option');
    let list = cat.replace(/\W/, '');
    let listElem = document.querySelector('#' + list);
    opt.value = item;
    opt.innerHTML = item.replace(/-/, ' ');
    listElem.appendChild(opt);
}
//filter categories
let filters = ['type', 'pokemon-color', 'ability'];
//grab options
filters.forEach(filter => {
    fetch(`https://pokeapi.co/api/v2/${filter}?limit=500`)
        .then(res => res.json())
        .then(item => {
            let list = pullList(item);
            list.forEach(item => fillList(item, filter));
        });
})
//add event listener to search bar
searchBar.addEventListener('keyup', function (e) {
    filterPokes(e);

});
//add event listener to filter categories
for (let i = 0; i < filterSelects.length; i++) {
    filterSelects[i].addEventListener('change', function (e) {
        filterPokes(e);
    });
}
//display matched results
function displayMatches(matches) {
    matches.forEach(match => {
        storedPokeData.forEach(poke => {
            if (poke.name === match.name) {
                //console.log('whoo');
                renderCard(poke);
            }
        })
    });
}
//filter pokemonz
function filterPokes(filter) {
    let query = filter.target.value.toLowerCase();
    let matches = [];

    //store current values of filters
    let currentType = typeFilter.value;
    let currentColor = colorFilter.value;
    let currentAbility = abilityFilter.value;

    let typePresent = !(currentType === 'default');
    let colorPresent = !(currentColor === 'default');
    let abilityPresent = !(currentAbility === 'default');
    let searchbarFilled = (searchBar.value);

    //if type is being selected check color and ability
    matches = storedPokeData.filter(poke => {
        let matchedColor = true;
        let matchedType = true;
        let matchedAbility = true;
        let matchedSearch = true;

        if (colorPresent) {
            matchedColor = poke.color === query || poke.color === currentColor;
        }

        if (typePresent) {
            matchedType = poke.types.some(type => type === query || type === currentType);
        }

        if (abilityPresent) {
            matchedAbility = poke.abilities.some(ability => {
                return ability.name === query || ability.name === currentAbility;
            });
        }

        if (searchbarFilled) {
            if (/\d/.test(query)) {
                matcSearch = poke.number.toString().includes(query.toString());
                hint.style.display = 'none';
            } else if (/[A-Za-z]+/.test(query)) {
                matchedSearch = poke.name.includes(query);
                hint.style.display = 'none';
            } else if (/[a-zA-Z]/.test(query) === false) {
                hint.textContent = 'Please enter a number or a name.';
                hint.style.display = 'block';
            }
        }

        return matchedColor && matchedType && matchedAbility && matchedSearch;
    });

    cardContainer.innerHTML = '';
    displayMatches(matches);
}

function displayModal(input) {
    overlay.classList.remove('hidden');
    document.body.classList.add('noscroll');
    let stats = [];

    let current = storedPokeData.filter(poke => poke.name === input);
    let statsData = current[0].stats;
    statsData.forEach(stat => {
        stats.push(stat.base_stat);
    });
    let barcolor;
    let color = current[0].color;
    switch (color) {
        case ('black'):
            barcolor = 'rgba(99, 98, 97, 0.2)';
            break;
        case ('green'):
            barcolor = 'rgba(117, 194, 66, 0.2)';
            break;
        case ('blue'):
            barcolor = 'rgba(103, 160, 199, 0.2)';
            break;
        case ('brown'):
            barcolor = 'rgba(120, 89, 52, 0.2)';
            break;
        case ('gray'):
            barcolor = 'rgba(209, 205, 207, 0.2)';
            break;
        case ('pink'):
            barcolor = 'rgba(245, 125, 193, 0.2)';
            break;
        case ('purple'):
            barcolor = 'rgba(189, 125, 245, 0.2)';
            break;
        case ('red'):
            barcolor = 'rgba(235, 101, 101, 0.2)';
            break;
        case ('white'):
            barcolor = 'rgba(245, 240, 240, 0.86)';
            break;
        case ('yellow'):
            barcolor = 'rgba(235, 192, 101, 0.2)';
            break;
    }

    overlay.style.backgroundColor = `${barcolor.replace(/\.\d+/, '.9')}`;

    let rgba;
    color != 'white' ? rgba = `${barcolor.replace(/\.\d+/, '.9')}` : rgba = '(0,0,0,0.8)';

    //console.log(rgba);

    let modalElem = ` 
        <div class="modal-header">
            <div class="modal-title">
                <h1>${current[0].name}</h1>
                <h2 style="color:${rgba}">${current[0].genera}</h2>
            </div>
            <div class="modal-img">
               <img src="${current[0].art}" alt="${current[0].name}">
            </div>
        </div>
        <div class="modal-body">
            <div class="modal-data">
                <div class="cell">
                    <span class="label">height</span>
                    <span class="data">${current[0].height}</span>
                </div>
                <div class="cell">
                    <span class="label">weight</span>
                    <span class="data">${current[0].weight}</span>
                </div>
                <div class="cell">
                    <span class="label">growth rate</span>
                    <span class="data">${current[0].growth}</span>
                </div>
                <div class="cell">
                    <span class="label">shape</span>
                    <span class="data">${current[0].shape}</span>
                </div>
            </div>
            <div class="modal-text">
                <p>${current[0].flavortext}</p>
            </div>
            <div class="modal-chart">
            </div>
        </div>`;
    modal.innerHTML = modalElem;
    modal.style.display = 'block';

    let canvas = document.createElement('canvas');
    canvas.id = 'myChart';
    document.querySelector('.modal-chart').insertAdjacentElement('beforeend', canvas);

    let chart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['hp', 'atk', 'def', 'sp.atk', 'sp.def', 'speed'],
            datasets: [{
                label: 'stats',
                data: stats,
                backgroundColor: barcolor,

                borderWidth: 1
            }]
        },
        options: {
            legend: {
                display: false
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontSize: 10
                    }
                }]
            }
        }
    });

    Chart.defaults.global.defaultFontFamily = 'Philosopher, serif';

}

function hideModal() {
    document.body.style.backgroundColor = bg;
    modal.style.display = 'none';
    overlay.classList.add('hidden');
    overlay.classList.remove('show');
    document.body.classList.remove('noscroll');
}

cardContainer.addEventListener('click', e => {
    if (e.target !== cardContainer) {
        const card = e.target.closest('.card');
        const name = card.getElementsByTagName('h1')[0].textContent;
        displayModal(name);
    }
});

overlay.addEventListener('click', e => {
    if (e.target !== modal || e.target.className === 'fas fa-window-close') {
        hideModal();
    }
});

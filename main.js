const width = 850;
const height = 550;
const yearSlider = document.getElementById('year-slider');
const worldTemp = document.getElementById('world-temp');
const yearSelect = document.getElementById('year-select');
const scroller = document.getElementById('scroller');
const yearProgress = document.getElementById('year-progress');
const yearIndicator = document.getElementById('year-indicator');
const NA = document.getElementById('NA');
const SA = document.getElementById('SA');
const AF = document.getElementById('AF');
const EU = document.getElementById('EU');
const AS = document.getElementById('AS');
const OC = document.getElementById('OC');
const temperatureLookup = {};

var year = 1961;
var scroll = 0;
var scrollMax = 0;
var offset = 0;

scroller.addEventListener("scroll", (event) => {
    scrollMax = scroller.scrollHeight - scroller.offsetHeight;
    console.log(scrollMax);
    scroll = scroller.scrollTop;
    offset = Math.ceil(scroll/(scrollMax/61));
    year = 1961 + offset;
    yearSelect.textContent = year;
    yearProgress.textContent = year;
    yearIndicator.value = (100*(offset/61));
    updateExistingMap();
});

// define color scale for both map and legend
const colorScale = d3.scaleSequential(d3.interpolateReds)
    .domain([0, 2.5]);

// array of color categories and labels
const colorCategories = [0, 0.5, 1, 1.5, 2, 2.5];
const labels = ['< 0.5', '0.5 - 1', '1 - 1.5', '1.5 - 2', '2 - 2.5', '> 2.5'];

const legend = d3.select('#legend');
legend.append('div').text("Legend");
legend.append('br');

// construct legend
for (let i = 0; i < colorCategories.length; i++) {
    const label = legend.append('div')
        .text(labels[i]);

    const colorBlock = legend.append('div')
        .style('background-color', colorScale(colorCategories[i]))
        .style('width', '50px')
        .style('height', '50px');

    legend.append('br');
}

const svg = d3.select('#map-container').append('svg')
    .attr('width', width)
    .attr('height', height);

const projection = d3.geoMercator()
    .scale(130)
    .translate([width / 2, height / 1.5]);

const path = d3.geoPath(projection);

const g = svg.append('g');

// async function to load temperature data
async function loadTemperatureData() {
    const tempData = await d3.csv("../tempData.csv");
    // console.log(tempData);
    return tempData;
}

// create map
function drawMap() {
    loadTemperatureData()
    .then(temperatureData => {
        // map continent name to temp in var
        temperatureData.forEach(entry => {
            if (entry.Year == year) {
                temperatureLookup[entry.Continent] = entry.Temp;
            }
        });

        // load map data
        map = d3.json('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
            .then(data => {
                // draw map
                g.selectAll('path')
                    .data(data.features)
                    .enter()
                    .append('path')
                    .attr('class', 'country')
                    .attr('d', path)
                    .style('fill', d => {
                        const continentName = d.properties.CONTINENT; // tie var to continents
                        const temperatureChange = temperatureLookup[continentName];
                        worldTemp.textContent = temperatureLookup["World"];
                        if (temperatureChange == undefined) {
                            return 'rgb(90, 161, 242)';
                        } else {
                            return d3.interpolateReds(temperatureChange / 2); // color in continent based on temp data
                        }
                    });
            });
    });
}

function updateExistingMap() {
    loadTemperatureData()
    .then(temperatureData => {
        // map continent name to temp in var
        temperatureData.forEach(entry => {
            if (entry.Year == year) {
                temperatureLookup[entry.Continent] = entry.Temp;

                // update temp of continents text
                if (entry.Continent == "North America") {
                    NA.textContent = entry.Temp;
                }
                else if (entry.Continent == "South America") {
                    SA.textContent = entry.Temp;
                }
                else if (entry.Continent == "Europe") {
                    EU.textContent = entry.Temp;
                }
                else if (entry.Continent == "Africa") {
                    AF.textContent = entry.Temp;
                }
                else if (entry.Continent == "Asia") {
                    AS.textContent = entry.Temp;
                }
                else if (entry.Continent == "Oceania") {
                    OC.textContent = entry.Temp;
                }
            }
        });

        // Select all existing country paths and update their fill color
        g.selectAll('.country')
            .transition()
            .duration(100)
            .style('fill', d => {
                const continentName = d.properties.CONTINENT; // tie var to continents
                const temperatureChange = temperatureLookup[continentName];
                worldTemp.textContent = temperatureLookup["World"];
                if (temperatureChange == undefined) {
                    return 'rgb(90, 161, 242)';
                } else {
                    return d3.interpolateReds(temperatureChange / 2); // color in continent based on temp data
                }
            });
    });
}

drawMap();

yearSlider.addEventListener('input', function() {
    yearDisplay.textContent = yearSlider.value;
    yearSelect.textContent = yearSlider.value;
    year = yearSlider.value;
    updateExistingMap();
});

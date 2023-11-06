const width = 700;
const height = 550;
const yearSlider = document.getElementById('year-slider');
const worldTemp = document.getElementById('world-temp');
const yearSelect = document.getElementById('year-select');
const scroller = document.getElementById('scroller');
const yearProgress = document.getElementById('year-progress');
const yearIndicator = document.getElementById('year-indicator');
const temperatureLookup = {};

var year = 1961;
var scroll = 0;
var scrollMax = 0;
var offset = 0;

scroller.addEventListener("scroll", (event) => {
    scrollMax = scroller.scrollHeight - scroller.offsetHeight;
    console.log(scrollMax);
    scroll = scroller.scrollTop;
    offset = Math.floor(scroll/(scrollMax/61));
    year = 1961 + offset;
    yearSelect.textContent = year;
    yearProgress.textContent = year;
    yearIndicator.value = (100*(offset/61));
    updateMap();
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

// save temp data to var
function updateMap() {
    loadTemperatureData()
    .then(temperatureData => {
        // map continent name to temp in var
        temperatureData.forEach(entry => {
            if (entry.Year == year) {
                temperatureLookup[entry.Continent] = entry.Temp;
            }
        });

        g.selectAll('.country')
            .remove()
            .transition()
            .duration(100);

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
                    // .transition()
                    // .duration(100)
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
    initialLoad = true;
}

updateMap();

yearSlider.addEventListener('input', function() {
    yearDisplay.textContent = yearSlider.value;
    yearSelect.textContent = yearSlider.value;
    year = yearSlider.value;
    updateMap();
});
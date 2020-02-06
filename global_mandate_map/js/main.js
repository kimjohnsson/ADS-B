/**
 * Copyright 2019 © by Kim Johnsson, VisCraft AB, Sweden (atm@viscraft.se).
 * Developed for SESAR Deployment Manager (SDM) in Brussels, Belgium.
 */

/**
 * get CSV file
 */
$(document).ready(() => {
    $.ajax({
        type: "GET",
        url: "/mandates.csv",
        dataType: "text",
        async: true,
        success: (data) => {
            csvToJson(data, drawMap)
        }
    });
});

/**
 * Convert CSV string to json
 */
function csvToJson(str, callback){
    let csvData = []

    let newRow = str.split("\n");
    for (let row of newRow){
        let arrayOfRow = []
        let allowedChar = row.replace(/, /g, "£@@@")
        let devideToObject = allowedChar.split(',');
        for(let objectString of devideToObject){
            arrayOfRow.push(objectString.replace(/£@@@/g, ", "))
        }
        csvData.push(arrayOfRow)
    }
    
    /**
     * assign string to object key
     */
    
    let objKeys = csvData.shift();
    
    let csvJson = []
    
    csvData.forEach((countryData) => {
        let countryDataObject = {}
        objKeys.forEach((key, index) =>{
            countryData.forEach((string, indexString) => {
                if(index === indexString){
                    countryDataObject[key] = string
                }
            })
        })
        csvJson.push(countryDataObject)
    })
    callback(csvJson)
}

/**
 * Tooltip for countries
 */
let lefletMap = document.getElementById('map');

function createTooltip(data){

    let tooltip = document.createElement('div');
    tooltip.id = 'tooltip',
    lefletMap.append(tooltip)

    let countryName = document.createElement('h1');
    countryName.innerHTML = data.name,
    tooltip.append(countryName)

    let countryVersion = document.createElement('p');
    countryVersion.innerHTML = 'Version: ' + data.version,
    tooltip.append(countryVersion)

    if(data.deadline){
        let countryDeadline = document.createElement('p');
        countryDeadline.innerHTML = 'Deadline: ' + data.deadline,
        tooltip.append(countryDeadline)
    }

    if(data.regref){
        let countryInfo = document.createElement('i');
        countryInfo.innerHTML = data.regref,
        tooltip.append(countryInfo)
    }

    if(data.rmk){
        let header = document.createElement('b');
        header.innerHTML = 'General information'
        tooltip.append(header)
    }

    if(data.rmk){
        let countryRmk = document.createElement('p');
        countryRmk.innerHTML = data.rmk,
        tooltip.append(countryRmk) 
    }

    if(data.url_a.length > 1 && data.url){
        let link = document.createElement('small');
        link.innerHTML = '(Click to access regulation and supplementary material)',
        tooltip.append(link)
    }else if(data.url){
        let link = document.createElement('small');
        link.innerHTML = '(Click to access regulation)',
        tooltip.append(link)
    }else if (data.url_a.length > 1){
        let link = document.createElement('small');
        link.innerHTML = '(Click to access supplementary material)',
        tooltip.append(link)
    }

    $(document).on('mousemove', function(e) {
        let xPos = e.pageX;
        let yPos = e.pageY;
        let height = tooltip.offsetHeight
        let width = tooltip.offsetWidth

        if(yPos -(height + 5) > 0){
            if(xPos -(width + 5) < 0){
                $('#tooltip').css({
                    'top': yPos - (height + 5),
                    'left': xPos + 5
                  });
            }else{
                $('#tooltip').css({
                    'top': yPos - (height + 5),
                    'left': xPos - (width + 5)
                  });
            }
        }else{
            if(xPos -(width + 5) < 0){
                $('#tooltip').css({
                    'top': yPos + 5,
                    'left': xPos + 5
                  });
            }else{
                $('#tooltip').css({
                    'top': yPos + 5,
                    'left': xPos - (width + 5)
                  });
            }
        }
    });
}

/**
 * remove tooltip
 */
function removeTooltip(){
    let tooltipRemove = document.getElementById('tooltip');
    tooltipRemove.remove();
}

/**
 * Draw map
 */
function drawMap(csvData){
    let csvCountryCode = []
    let euCountries = ["Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Rep.", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden", "United Kingdom"]
    let EEA = ["Norway", "Switzerland"]
    let myGeoJSONPath = '/json/medMap.json';
    let myCustomStyle = {
        fill: true,
        fillColor: '#d9d9d9',
        fillOpacity: 1,
        stroke: true,
        color: 'black',
        weight: 1,
        opacity: 0.5,
    }

    let version0 = {
        fill: true,
        fillColor: '#1aae54',
        fillOpacity: 1,
        stroke: true,
        color: 'black',
        weight: 1,
        opacity: 0.5,
    }

    let version2 = {
        fill: true,
        fillColor: '#4375c2',
        fillOpacity: 1,
        stroke: true,
        color: 'black',
        weight: 1,
        opacity: 0.5,
        
    }

    let onGoingStyle = {
        fill: true,
        fillColor: '#7f7f7f',
        fillOpacity: 1,
        stroke: true,
        color: 'black',
        weight: 1,
        opacity: 0.5,
        
    }

    bounds = new L.LatLngBounds(new L.LatLng(150, -295), new L.LatLng(-140, 290));

    csvData.forEach(country =>{
        csvCountryCode.push(country.code)
    })

    $.getJSON(myGeoJSONPath,function(data){
        let map = L.map('mapRender', {
            center: [20, 0],
            crs: L.CRS.Simple,
            zoomSnap: 0,
            zoomDelta: 0.5,
            zoom:1.5,
            minZoom: 1,
            maxZoom: 8,
            maxBounds: bounds,
            maxBoundsViscosity: 0.5
        });

        /**
         * EU Feature Groupe
         */
        let euCountriesGroup = new L.featureGroup()
        .on('mouseover', function () {
            csvData.forEach(country =>{
                if(country.code === 'EU'){
                    createTooltip(country)
                }
            })
            this.setStyle({
            'fillColor': '#0375c2',
            'opacity': '1',
            });
        })
        .on('mouseout', function () {
            removeTooltip()
            this.setStyle({
            'fillColor': '#4375c2',
            'opacity': '0.5',
            });
        })
        .on('click', function () {
            csvData.forEach(country =>{
                if(country.code === 'EU'){
                    if(country.url){
                        window.open(country.url, '_blank');
                    }
                    if(country.url_a.length > 1){
                        window.open(country.url_a, '_blank');
                    }
                }
            })
        });

        /**
         * EEA feature Groupe
         */
        let eeaCountrieGroup = new L.featureGroup()
        .on('mouseover', function () {
            csvData.forEach(country =>{
                if(country.code === 'EEA'){
                    createTooltip(country)
                }
            })
            this.setStyle({
            'fillColor': '#0375c2',
            'opacity': '1',
            });
        })
        .on('mouseout', function () {
            removeTooltip()
            this.setStyle({
            'fillColor': '#4375c2',
            'opacity': '0.5',
            });
        })
        .on('click', function () {
            csvData.forEach(country =>{
                if(country.code === 'EEA'){
                    if(country.url){
                        window.open(country.url, '_blank');
                    }
                    if(country.url_a.length > 1){
                        window.open(country.url_a, '_blank');
                    }
                }
            })
        });

        let version2Group = new L.featureGroup()
        let version01Group = new L.featureGroup()
        let onGoing = new L.featureGroup()

        let country = new L.GeoJSON(data, {
            style: myCustomStyle,
            onEachFeature(feature, layer) {

                if(feature.properties.name == 'Norway'){
                    let notEEA = layer._latlngs.splice(22,10)
                    notEEA.forEach(island => {
                        new L.polygon(island, myCustomStyle).addTo(map);
                    })
                }

                if(feature.properties.name == 'Spain'){
                    let canaryIslands = layer._latlngs.splice(0,7)
                    canaryIslands.forEach(island => {
                        new L.polygon(island, myCustomStyle).addTo(map);
                    })
                }

                if(feature.properties.name == 'Portugal'){
                    let azorerna = layer._latlngs.splice(1,7)
                    azorerna.forEach(island => {
                        new L.polygon(island, myCustomStyle).addTo(map);
                    })
                }

                if(feature.properties.name == 'France'){
                    let guyana = layer._latlngs.splice(0,7)
                    guyana.forEach(island => {
                        new L.polygon(island, myCustomStyle).addTo(map);
                    })
                }

                if(feature.properties.name == 'Netherlands'){
                    let atlantetn = layer._latlngs.splice(0,3)
                    atlantetn.forEach(island => {
                        new L.polygon(island, myCustomStyle).addTo(map);
                    })
                }

                euCountries.forEach(euCountry => {
                    if(feature.properties.name === euCountry){
                        euCountriesGroup.addLayer(layer).setStyle(version2);
                    }
                });

                EEA.forEach(eeaCountry => {
                    if(feature.properties.name === eeaCountry){
                        eeaCountrieGroup.addLayer(layer).setStyle(version2);
                    }
                });

                csvCountryCode.forEach(code => {
                    if(feature.properties.adm0_a3_us === code){
                        csvData.forEach(countryData => {
                            if(countryData.code === code){
                                if(countryData.version == 2){
                                    version2Group.addLayer(layer).setStyle(version2);    
                                    layer.on('mouseover', function () {
                                        createTooltip(countryData)
                                        this.setStyle({
                                            'fillColor': '#0375c2',
                                            'opacity': '1',
                                        });
                                    });
                                    layer.on('mouseout', function () {
                                        removeTooltip() 
                                        this.setStyle({
                                            'fillColor': '#4375c2',
                                            'opacity': '0.5',
                                        });
                                    });
                                    layer.on('click', function () {
                                        if(countryData.url){
                                            window.open(countryData.url, '_blank');
                                        }
                                        if(countryData.url_a.length > 1){
                                            window.open(countryData.url_a, '_blank');
                                        }
                                    });                            
                                }
                                if(countryData.version == 0 | countryData.version == 1){
                                    version01Group.addLayer(layer).setStyle(version0); 
                                    layer.on('mouseover', function () {
                                        createTooltip(countryData)
                                        this.setStyle({
                                        'fillColor': '#19b656',
                                        'opacity': '1',
                                        });
                                    });
                                    layer.on('mouseout', function () {
                                        removeTooltip()
                                        this.setStyle({
                                        'fillColor': '#1aae54',
                                        'opacity': '0.5',
                                        });
                                    });
                                    layer.on('click', function () {
                                        if(countryData.url){
                                            window.open(countryData.url, '_blank');
                                        }
                                        if(countryData.url_a.length > 1){
                                            window.open(countryData.url_a, '_blank');
                                        }
                                    });
                                }
                                if(countryData.version.match(/[a-zA-Z]/)){
                                    onGoing.addLayer(layer).setStyle(onGoingStyle); 
                                    layer.on('mouseover', function () {
                                        createTooltip(countryData)
                                        this.setStyle({
                                        'fillColor': '#959595',
                                        'opacity': '1',
                                        });
                                    });
                                    layer.on('mouseout', function () {
                                        removeTooltip()
                                        this.setStyle({
                                        'fillColor': '#7f7f7f',
                                        'opacity': '0.5',
                                        });
                                    });
                                    layer.on('click', function () {
                                        if(countryData.url){
                                            window.open(countryData.url, '_blank');
                                        }
                                        if(countryData.url_a.length > 1){
                                            window.open(countryData.url_a, '_blank');
                                        }
                                    });
                                }
                            }
                        })
                    }
                })
            }
        }).addTo(map);
    })
}

/**
 * Chart Key
 */
let chartKey = document.createElement('div');
chartKey.id = 'chartKey',
lefletMap.append(chartKey)

/**
 * Version 1
 */
let chartKeyDiv1 = document.createElement('div');
chartKeyDiv1.className = 'chartKeyList',
chartKey.append(chartKeyDiv1)

let chartKeyVersion1 = document.createElement('div');
chartKeyVersion1.className = 'chartKeyVersion',
chartKeyVersion1.style.backgroundColor = '#1aae54'
chartKeyDiv1.append(chartKeyVersion1)

let chartKeyText1 = document.createElement('p');
chartKeyText1.innerHTML = 'Version 0/1 mandated'
chartKeyDiv1.append(chartKeyText1)

/**
 * Version 2
 */
let chartKeyDiv2 = document.createElement('div');
chartKeyDiv2.className = 'chartKeyList',
chartKey.append(chartKeyDiv2)

let chartKeyVersion2 = document.createElement('div');
chartKeyVersion2.className = 'chartKeyVersion',
chartKeyVersion2.style.backgroundColor = '#4375c2'
chartKeyDiv2.append(chartKeyVersion2)

let chartKeyText2 = document.createElement('p');
chartKeyText2.innerHTML = 'Version 2 mandated'
chartKeyDiv2.append(chartKeyText2)

/**
 * Regulatory activity ongoing
 */
let chartKeyDiv3 = document.createElement('div');
chartKeyDiv3.className = 'chartKeyList',
chartKey.append(chartKeyDiv3)

let chartKeyVersion3 = document.createElement('div');
chartKeyVersion3.className = 'chartKeyVersion',
chartKeyVersion3.style.backgroundColor = '#7f7f7f'
chartKeyDiv3.append(chartKeyVersion3)

let chartKeyText3 = document.createElement('p');
chartKeyText3.innerHTML = 'Regulatory activity ongoing, specific mandate to home carriers'
chartKeyDiv3.append(chartKeyText3)
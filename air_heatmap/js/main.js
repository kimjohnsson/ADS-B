/**
 * Copyright 2019 © by Kim Johnsson, VisCraft AB, Sweden (atm@viscraft.se).
 * Developed for SESAR Deployment Manager (SDM) in Brussels, Belgium.
 */
let heatmap = document.querySelector('#heatMap');
let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]


$.getJSON('/json/config.json', function (config) {

    let sliderValue = 0

    /**
     * Load images and render to DOM
     */
    let imageDiv = document.createElement('div')
    imageDiv.id = 'heatMapImages'
    heatmap.append(imageDiv)

    config.images.forEach((jsonImage, index) => {
        let image = document.createElement('img')
        image.id = 'airHeatmap' + index
        image.className = 'heatmapImage'
        image.src = '/images/' + jsonImage
        if (index !== sliderValue) {
            image.style.display = 'none'
        }
        imageDiv.append(image)
    });

    let scalebar = document.createElement('img')
    scalebar.id = 'scalebar'
    scalebar.src = '/images/scalebar.png'
    imageDiv.append(scalebar)

    /**
     * Create slider component
     */
    let sliderDiv = document.createElement('div');
    sliderDiv.id = 'heatMapSlider'
    heatmap.append(sliderDiv);

    let startDate = document.createElement('label');
    let startYear = config.images[0].slice(0,4)
    let startMonth = Number(config.images[0].slice(4, 6))
    startDate.innerHTML = `${months[startMonth -1]}  ${startYear}`;
    sliderDiv.append(startDate);

    let input = document.createElement('div')
    input.id = 'sliderInput'
    sliderDiv.append(input)

    let slider = document.createElement('input')
    slider.type = 'range'
    slider.id = 'slider'
    slider.name = 'dates'
    slider.min = 0
    slider.max = config.images.length - 1
    slider.value = sliderValue
    input.append(slider)

    let arrow = document.createElement('div')
    arrow.id = 'tooltipArrow'
    input.append(arrow)

    let tooltip = document.createElement('span')
    tooltip.id = 'sliderTooltip'
    input.append(tooltip)

    let latestDate = document.createElement('label');
    let latestYear = config.images[config.images.length -1].slice(0,4)
    let latestMonth = Number(config.images[config.images.length -1].slice(4, 6))
    latestDate.innerHTML = `${months[latestMonth -1]}  ${latestYear}`;
    sliderDiv.append(latestDate);

    /**
     * Display right image and tooltip depending on slider postion
     */
    let hideTooltip
    slider.addEventListener("input", () => {

        /**
         * Display tooltip
         */
        tooltip.style.display = 'block'
        arrow.style.display = 'block'

        clearTimeout(hideTooltip)
        hideTooltip = setTimeout(() => {
            tooltip.style.display = 'none'
            arrow.style.display = 'none'
        }, 1000)

        let year = config.images[slider.value].slice(0,4)
        let month = Number(config.images[slider.value].slice(4, 6))

        let pos = slider.value / (config.images.length - 1)
        let thumbCorrect = 25 * (pos - 0.5) * -1
        let tooltipPos = Math.round( ( pos * slider.scrollWidth ) - 25/4 + thumbCorrect );

        tooltip.innerHTML = months[month-1] + ' ' + year
        tooltip.style.left = tooltipPos - (tooltip.offsetWidth / 2) + 9 + 'px'
        arrow.style.left = tooltipPos + 9 + 'px'


        /**
         * Display right image
         */
        let currentHeatmap = document.querySelector('#airHeatmap' + sliderValue)
        currentHeatmap.style.display = 'none'

        let displayImage = document.querySelector('#airHeatmap' + slider.value)
        displayImage.style.display = 'inline-block'

        sliderValue = slider.value
    });
});
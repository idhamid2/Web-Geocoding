// global variables to stores the values/data
var userMarker // variable used to save the marker location of user-input coordinates
var apiResult; // variable used to store the result after API response

var map = L.map('map').setView([49.41461, 8.681495], 13);

var tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const search = new GeoSearch.GeoSearchControl({
    provider: new GeoSearch.OpenStreetMapProvider(),
    showMarker: true, // optional: true|false  - default true
    showPopup: false, // optional: true|false  - default false
    marker: {
        // optional: L.Marker    - default L.Icon.Default
        icon: new L.Icon.Default(),
        draggable: false,
    },
    popupFormat: ({
        query,
        result
    }) => result.label, // optional: function    - default returns result label,
    resultFormat: ({
        result
    }) => result.label, // optional: function    - default returns result label
    maxMarkers: 1, // optional: number      - default 1
    retainZoomLevel: false, // optional: true|false  - default false
    animateZoom: true, // optional: true|false  - default true
    autoClose: false, // optional: true|false  - default false
    searchLabel: 'Enter address', // optional: string      - default 'Enter address'
    keepResult: false, // optional: true|false  - default false
    updateMap: true, // optional: true|false  - default true
});

map.addControl(search);

// adding the functionality what should be done after user search some address
map.on('geosearch/showlocation', function (e) {
    addressSearchData = e; // variable to store the coordinates of the searched address on the map
    showAddressTableData(addressSearchData);
});

// getting the latitude and longitude values of the user input
function getInputValue() {
    var userLatitude = document.getElementById("latitude").value;
    var userLongitude = document.getElementById("longitude").value;

    // checking input value that it is empty or not
    if (userLatitude.length < 1 && userLongitude.length < 1) {
        alert('Please entered the Latitude  and Longitude values')
    } else if (userLatitude.length < 1) {
        alert('Please entered the Latitude value')
    } else if (userLongitude.length < 1) {
        alert('Please entered the Longitude value')
    } else {
        getAPIdata(userLatitude, userLongitude);
    }

} // end of getInputValue function

// calling the Nominatim API to get the data
function getAPIdata(userLatitude, userLongitude) {
    var apiLink = "https://nominatim.openstreetmap.org/reverse?format=geojson&lat=" + userLatitude +
        "&lon=" + userLongitude;
    // console.log(apiLink);
    $.ajax({
        url: apiLink,
        type: "GET",
        success: function (result) {
            console.log(result);
            apiResult = result;
            if ((apiResult.hasOwnProperty('error'))) {
                alert("Unable to Geocode for the entered coordinates please try different with different coordinates");
            } else {
                showDataOnMap(userLatitude, userLongitude);
            }
        },
        error: function (error) {
            console.log(`Error is ${error}`);
            alert('The entered coordinates has no address. Please try again!')
        },
    });

} // end of getAPIdata function

// showing the API-Data on the Map with details on application
function showDataOnMap(userLatitude, userLongitude) {
    clearMapMarkers();
    userMarker = new L.Marker([userLatitude, userLongitude]);
    map.addLayer(userMarker);
    map.setView(new L.LatLng(userLatitude, userLongitude), 19);
    showCoordinatesTableData();

} // end of showDataOnMap function

// function to show the Nomintaim-API result in the form of table when user enters coordinates
function showCoordinatesTableData() {
    clearStuff();
    document.getElementById("coordinatesDeatilHeading").className = 'show';
    document.getElementById('coordinatesDeatilHeading').className = 'detailContainerDescrip';
    document.getElementById("tableDiv").className = 'show';

    table = document.getElementById("tbl").getElementsByTagName('tbody')[0];

    displayName = apiResult.features[0].properties.display_name;
    propertyType = apiResult.features[0].properties.addresstype;
    houseNumber = apiResult.features[0].properties.address.house_number;
    streetName = apiResult.features[0].properties.address.road;
    cityName = apiResult.features[0].properties.address.city;
    postalCode = apiResult.features[0].properties.address.postcode;
    stateName = apiResult.features[0].properties.address.state;
    countryName = apiResult.features[0].properties.address.country;

    propertyNames = ['OSM Name', 'Property Type', 'House Number', 'Street Name', 'Postal Code', 'City', 'State', 'Country'];
    propertyValues = [displayName, propertyType, houseNumber, streetName, cityName, postalCode, stateName, countryName];

    for (i = 0; i < propertyNames.length; i++) {
        row = table.insertRow();
        row.insertCell(0).innerHTML = propertyNames[i];
        row.insertCell(1).innerHTML = propertyValues[i];
    }
} // end of showCoordinatesTableData function


// function to show the Longitude and Latitude result in the form of table when user enters address on the map
function showAddressTableData(addressSearchData) {
    clearStuff();
    clearMapMarkers();

    document.getElementById("addressDeatilHeading").className = 'show';
    document.getElementById('addressDeatilHeading').className = 'detailContainerDescrip';
    document.getElementById("tableDiv").className = 'show';
    table = document.getElementById("tbl").getElementsByTagName('tbody')[0];

    latitudeValue = addressSearchData.location.y;
    longitudeValue = addressSearchData.location.x;
    addressValue = addressSearchData.location.label;
    propertyType = addressSearchData.location.raw.type

    propertyNames = ["Longitude", "Latitude", "Address", "Property Type"];
    propertyValues = [longitudeValue, latitudeValue, addressValue, propertyType];

    for (i = 0; i < propertyNames.length; i++) {
        row = table.insertRow();
        row.insertCell(0).innerHTML = propertyNames[i];
        row.insertCell(1).innerHTML = propertyValues[i];
    }
} // end of showAddressTableData function



// function to hide & reset the div,input and variables
function clearStuff() {
    document.getElementById("tbl").getElementsByTagName('tbody')[0].innerHTML = "";
    document.getElementById("tableDiv").className = 'hide';
    document.getElementById("coordinatesDeatilHeading").className = 'hide';
    document.getElementById("addressDeatilHeading").className = 'hide';
    document.getElementById("latitude").value = "";
    document.getElementById("longitude").value = "";
}

// function to remove the existing marker from the map
function clearMapMarkers() {
    if (map.hasLayer(userMarker)) {
        map.removeLayer(userMarker);
        console.log('Layer has been removed');
    }
}
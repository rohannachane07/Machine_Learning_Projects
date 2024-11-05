// Function to get selected BHK value
function getBHKValue() {
    const uiBHK = document.getElementsByName("bhk");
    for (let i = 0; i < uiBHK.length; i++) {
        if (uiBHK[i].checked) {
            return parseInt(uiBHK[i].value);
        }
    }
    return -1;
}

// Function to get selected bathroom value
function getBathValue() {
    const uiBathrooms = document.getElementsByName("bath");
    for (let i = 0; i < uiBathrooms.length; i++) {
        if (uiBathrooms[i].checked) {
            return parseInt(uiBathrooms[i].value);
        }
    }
    return -1;
}

// Function to estimate price when the button is clicked
async function onClickedEstimatePrice() {
    try {
        console.log('Estimate Price button clicked');
        
        const locationElement = document.getElementById('uiLocations');
        const totalSqftElement = document.getElementById('uiSqft');
        const floorsElement = document.getElementById('uiFloors');
        const csrfTokenInput = document.querySelector('input[name="csrfmiddlewaretoken"]');

        if (!csrfTokenInput) throw new Error("CSRF token input not found.");
        
        const csrfToken = csrfTokenInput.value;
        const number_of_floors = parseInt(floorsElement.value.trim(), 10);
        const location = locationElement.value;
        const total_sqft = parseFloat(totalSqftElement.value.trim());
        const bhk = getBHKValue();
        const bath = getBathValue();

        if (bhk === -1 || bath === -1 || !total_sqft || !location || !number_of_floors) {
            alert('Please complete all fields.');
            return;
        }

        const response = await fetch('/api/predict_home_price/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                location: location,
                total_sqft: total_sqft,
                bhk: bhk,
                bath: bath,
                number_of_floors: number_of_floors
            })
        });

        if (!response.ok) throw new Error('Server error occurred.');

        const result = await response.json();
        document.getElementById("uiEstimatedPrice").innerHTML = `<h2>₹${result.estimated_price.toLocaleString()} Lakh</h2>`;
    
    } catch (error) {
        console.error(error);
        alert(error.message || 'An unexpected error occurred.');
    }
}

// Load locations on page load
async function onPageLoad() {
    const url = "/api/get_location_names/";

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.locations) {
            const uiLocations = document.getElementById("uiLocations");
            uiLocations.innerHTML = '';
            data.locations.forEach(location => {
                const opt = new Option(location);
                uiLocations.add(opt);
            });
        }

    } catch (error) {
        console.error('Error fetching location names:', error);
    }
}

// Attach event listeners once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize location dropdown on page load
    onPageLoad();

    // Attach click event to the Estimate Price button
    const estimateButton = document.getElementById("estimatePriceBtn");
    if (estimateButton) {
        estimateButton.addEventListener("click", onClickedEstimatePrice);
    }
});

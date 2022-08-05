var historical_data = [];

let current_crypto = 
{
    code:   '',     // Crypto Code      (e.g. btc)
    id:     '',     // Short Crypto ID  (e.g. bitcoin)
    fid:    '',     // Full Crypto ID   (e.g. btc-bitcoin)
};

// Listening for a click for any element of the 'listView' class to get the selected cryptocurrency
document.addEventListener( 'click', (event) =>
{
    // Check that the click was for a crypto selection button
    if (event.target.className === 'listView')
    {
        let sel_crypto_el = event.target;

        // Update the current crypto object with the selected crypto's attributes
        current_crypto.code = sel_crypto_el.dataset.code;
        current_crypto.id = sel_crypto_el.dataset.name;
        current_crypto.fid = `${sel_crypto_el.dataset.code}-${sel_crypto_el.dataset.name}`;
        
        console.log(current_crypto);

        // Fetch crypto data, and generate data for this currency
        generate_data();
    }
})
let crypto_sel_buttons = document.querySelectorAll('.listView');

// Select data info containers
const current_info_container = document.querySelector('#current_info_container');
const history_info_container = document.querySelector('#history_info_container');
const additional_info_container = document.querySelector('#additional_info_container');

function generate_data () {
    const base_paprika_url = 'https://api.coinpaprika.com/v1/coins/'; // e.g. eth-ethereum, btc-bitcoin
    const base_gecko_value_url = 'https://api.coingecko.com/api/v3/'; // coins/list gives the list of supported cryptocurrencies
    // var coin_gecko_versus_url = 'https://api.coingecko.com/api/v3/simple/supported_vs_currencies';
    
    // Change the Paprika url to query for the currently selected cryptocurrency
    let ca_info_url = base_paprika_url + current_crypto.fid;
    
    // Get the additional information for the selected cryptocurrency
    get_api_data(ca_info_url, 'ADDITIONAL_INFO', null);

    // Define the url for current price of selected cryptocurrency
    const optional_q_parameters = '&include_24hr_change=true&include_last_updated_at=true';
    let curr_price_url = `${base_gecko_value_url}/simple/price?ids=${current_crypto.id}&vs_currencies=usd${optional_q_parameters}`

    // Get the current information for currently selected cryptocurrency
    get_api_data(curr_price_url, 'CURRENT_INFO', null);
    
    const number_of_time_points = 12;

    // Generate the historical data object and iterate for each time point (tp)
    for (var tp = 0 ; tp < number_of_time_points ; tp++) 
    {
        // Define historical data url
        let hd_url = `${base_gecko_value_url}coins/${current_crypto.id}/history?date=01-${tp + 1}-2017`;
        get_api_data(hd_url, 'HISTORICAL_DATA', tp);
    }
    
    console.log(historical_data);
    
    get_api_data(base_gecko_value_url + 'coins/list');
}

function get_api_data(requested_url, data_to_generate, iteration) 
{
fetch(requested_url)
    .then( (response) => 
    {
        // Log the requested url address
        console.log(`Data from: ${requested_url}`);
        console.log(response.status);

        // Check response status
        if (response.status >= 200 && response.status < 300)
            return response.json();

        else
        {
            const generic_no_api_msg = `<div class="failed_request">Sorry, but no data could be retrieved.</div>`;
            
            // Display a generic error message to the user for the appropriate section depending on what is being fetched
            switch (data_to_generate)
            {
                case 'ADDITIONAL_INFO': additional_info_container.innerHTML  = generic_no_api_msg;   break;
                case 'CURRENT_INFO':    current_info_container.innerHTML     = generic_no_api_msg;   break;
                case 'HISTORICAL_DATA': history_info_container.innerHTML     = generic_no_api_msg;   break;
            }

            throw Error(response.statusText);
        }
        
    })
    .then( (data) => {
    console.log(data);

    // Return relevant data based on current query
    switch (data_to_generate) 
    {
        case 'ADDITIONAL_INFO':
            let source_code_link;

            // Check whether or not this cryptocurrency is open source (includes link to source code)
            if (data.open_source)
                source_code_link = data.links.source_code[0];

            else
                source_code_link = '';

            let additional_info = 
            {
                name: data.name,
                description: data.description,
                website: data.links.website[0],
                source_code: source_code_link
            }

            console.log('Additional Info: ');
            console.log(additional_info);

            // Clear any data that may have been displayed previously to additional info
            clearContainer(additional_info_container);

            let crypto_heading = document.createElement("h1");
            crypto_heading.innerText = additional_info.name;

            let add_info_text = document.createElement("p");
            add_info_text.innerHTML = 
            `
                ${additional_info.description} <br>
                <h3>Links</h3>
                <a href="${additional_info.website}">${additional_info.website}</a> <br>
                <a href="${additional_info.source_code}">${additional_info.source_code}</a>
            `;

            // Append elements to additional info container
            additional_info_container.appendChild(crypto_heading);
            additional_info_container.appendChild(add_info_text);

            break;

        case 'CURRENT_INFO':
            let current_info = 
            {
                price: data[current_crypto.id].usd,
                change: data[current_crypto.id].usd_24h_change,
                updated: convertUnixTimestamp(data[current_crypto.id].last_updated_at)
            }

            console.log('Current Info: ');
            console.log(current_info);

            // Clear any data that may have been displayed previously to current info
            clearContainer(current_info_container);

            let crypto_symbol_heading = document.createElement("h1");
            crypto_symbol_heading.innerText = `${current_crypto.id.toUpperCase()}`;

            let change_status, change_sign;
            
            // Set the class for the percent change based on whether it is positive or negative
            if (current_info.change < 0)
            {
                change_status = 'negative_change';
                // It does not need a sign because it is a negative number and already has a '-' symbol
                change_sign = ''; 
            }
                

            else if (current_info.change > 0)
            {
                change_status = 'positive_change';
                // Indicate that the percent change is positive
                change_sign = '+'; 
            }
                
            else
            {
                change_status = 'no_change';
                // Even though there is no percent change, use the '+' symbol
                change_sign = '+'; 
            }
                

            let curr_info_text = document.createElement("p");
            curr_info_text.innerHTML = 
            `
                <h3>Price</h3>
                $${current_info.price.toLocaleString("en-US")} <br>
                <h3>Percent Change</h3>
                <div class="${change_status}">${change_sign}${current_info.change.toFixed(2)}%</div>
                <h3>Last Updated</h3>
                ${current_info.updated} <br>
            `;

            // Append elements to current info container
            current_info_container.appendChild(crypto_symbol_heading);
            current_info_container.appendChild(curr_info_text);

            break;

        case 'HISTORICAL_DATA':
            data_pt = data.market_data.current_price.usd;

            // Set this data point to whatever the global data point has been updated to since the API call
            historical_data[iteration] = data_pt;
            
            break;
    }

    return data;

    })
    .catch( (error) => 
    {
        // Log the error to the console
        console.log(error);
    });

    function convertUnixTimestamp (unix_timestamp)
    {
        // Get the date of this timestamp
        let ts_date = new Date (unix_timestamp * 1000); // 1000 is here to convert to milliseconds

        let month   =   ts_date.toLocaleString("en-US", {month: "numeric"});
        let day     =   ts_date.toLocaleString("en-US", {day: "numeric"});
        let year    =   ts_date.toLocaleString("en-US", {year: "numeric"});

        return `${month}/${day}/${year}`;
    }

    function clearContainer (container_el)
    {
        // Check that this container has children, and remove them if so
        if (container_el.childElementCount > 0)
        {
            var el_to_remove = container_el.lastElementChild;

            while (el_to_remove)
            {
                container_el.removeChild(el_to_remove);
                el_to_remove = container_el.lastElementChild;
            }
        }
    }
}

// for Modal pop-up

var btn = document.querySelector('#showModal');
var modalDlg = document.querySelector('#image-modal');
var imageModalCloseBtn = document.querySelector('#image-modal-close');
var imgModalCancel = document.getElementById('cancel');
var imgModalSave = document.getElementById('save');
var currTypeInputEl = $('#project-type-input');
var cryptoListingView = document.getElementById('divListCrypto');
var alltime = document.getElementById('alltime');
var year = document.getElementById('year');
var month = document.getElementById('month');
var week = document.getElementById('week');

// Dictionary object for associating a crypto's value with its code and name
crypto_options = {};

let crypto_select_menu = currTypeInputEl[0];

// For each cryptocurrency option, set their key value and their properties by value and data attributes respectively
for (var i = 0 ; i < crypto_select_menu.length ; i++)
{
    let crypto_desc = crypto_select_menu[i].value;
    let crypto_code = crypto_select_menu[i].dataset.code;
    let crypto_name = crypto_select_menu[i].dataset.name;
    
    crypto_options[crypto_desc] = { 'code': crypto_code , 'name': crypto_name };
}

// This function is to 'Add' button for modal pop-up

btn.addEventListener('click', function () {
    modalDlg.classList.add('is-active');
});

//  This is for modal window 'close' button

imageModalCloseBtn.addEventListener('click', function () {
    modalDlg.classList.remove('is-active');
});

//  This is for modal window 'close' button

imgModalCancel.addEventListener('click', function () {
    modalDlg.classList.remove('is-active');
})


//Add function to populate historical data over alltime
alltime.addEventListener('click', function() {

})

//Add function to populate historical data over a year
year.addEventListener('click', function() {

})

//Add function to populate historical data over a month
month.addEventListener('click', function() {

})

//Add function to populate historical data over a week
week.addEventListener('click', function() {

})


// This function is to save data in local storage

imgModalSave.addEventListener('click', function () {
    var currType = currTypeInputEl.val();
    var newCurrItem = [currType];
    var currencies = localStorage.getItem('cryptos');
    console.log("Currencies after local storaage::" + currencies);
    if (currencies != null && currencies.includes(currType)) {
        modalDlg.classList.remove('is-active');
    }
    else {
        var updatedArray = newCurrItem.concat(currencies);
        console.log("Currencies after concat updatedArray::" + updatedArray);
        localStorage.removeItem('cryptos');
        localStorage.setItem('cryptos', updatedArray);
        modalDlg.classList.remove('is-active');
        addItemToView(currType)
    }
})

// This function is to retrieve data from local storage

function setCryptoListing() {
    let selected_cryptos = localStorage.getItem('cryptos');
    if (selected_cryptos !== null)
    {
        var cryptoLists = localStorage.getItem('cryptos').split(",");

        cryptoLists.forEach(addItemToView);
    }
}

// This function is to view listing the coins

function addItemToView(element) {
    if (element != "") {
        console.log(element);
        var entry = document.createElement('div');
        entry.classList.add("listView");

        // Add data attributes for this crypto's entry code and name by using element as the key
        entry.dataset.code = crypto_options[element].code;
        entry.dataset.name = crypto_options[element].name;

        entry.append(element);
        cryptoListingView.appendChild(entry);
        cryptoListingView.appendChild(document.createElement('br'));
    }
}

setCryptoListing();

var historical_data = [];

let current_crypto = 
{
    fid: 'btc-bitcoin', // Full Crypto ID
    id:  'bitcoin'      // Short Crypto ID
};

// NOTE: The following code within the '***'s should be removed once static HTML is implemented. It is only for testing data display
/*******************************************************************/
const current_info_container = document.createElement("section");
current_info_container.className = 'current_info_container';
document.body.appendChild(current_info_container);

const history_info_container = document.createElement("section");
history_info_container.className = 'history_info_container';
document.body.appendChild(history_info_container);

const additional_info_container = document.createElement("section");
additional_info_container.className = 'additional_info_container';
document.body.appendChild(additional_info_container);
/*******************************************************************/

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
            let additional_info = 
            {
                name: data.name,
                description: data.description,
                website: data.links.website[0],
                source_code: data.links.source_code[0]
            }

            console.log('Additional Info: ');
            console.log(additional_info);

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

            let crypto_symbol_heading = document.createElement("h1");
            crypto_symbol_heading.innerText = current_crypto.id.toUpperCase();

            let change_status;

            // Set the class for the percent change based on whether it is positive or negative
            if (current_info.change < 0)
                change_status = 'negative_change';

            else if (current_info.change > 0)
                change_status = 'positive_change';

            else
                change_status = 'no_change';

            let curr_info_text = document.createElement("p");
            curr_info_text.innerHTML = 
            `
                <h3>Price</h3>
                $${current_info.price.toLocaleString("en-US")} <br>
                <h3>Percent Change</h3>
                <div class="${change_status}">${current_info.change.toFixed(2)}%</div> <br>
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
}

generate_data();

// for Modal pop-up

var btn = document.querySelector('#showModal');
var modalDlg = document.querySelector('#image-modal');
var imageModalCloseBtn = document.querySelector('#image-modal-close');
var imgModalCancel = document.getElementById('cancel');
var imgModalSave = document.getElementById('save');
var currTypeInputEl = $('#project-type-input');
var cryptoListingView = document.getElementById('divListCrypto');
// var olListingView = document.getElementById('olListCrypto');

btn.addEventListener('click', function () {
    modalDlg.classList.add('is-active');
});

imageModalCloseBtn.addEventListener('click', function () {
    modalDlg.classList.remove('is-active');
});

imgModalCancel.addEventListener('click', function () {
    modalDlg.classList.remove('is-active');
})

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

function setCryptoListing() {
    let selected_cryptos = localStorage.getItem('cryptos');
    if (selected_cryptos !== null)
    {
        var cryptoLists = localStorage.getItem('cryptos').split(",");

        cryptoLists.forEach(addItemToView);
    }
}

function addItemToView(element) {
    if (element != "") {
        console.log(element);
        var entry = document.createElement('div');
        entry.classList.add("listView");
        entry.append(element);
        cryptoListingView.appendChild(entry);
        cryptoListingView.appendChild(document.createElement('br'));
    }
}

setCryptoListing();


var historical_data = [];

function generate_data() {
    const base_paprika_url = 'https://api.coinpaprika.com/v1/coins/'; // e.g. eth-ethereum, btc-bitcoin
    const base_gecko_value_url = 'https://api.coingecko.com/api/v3/coins/'; // coins/list gives the list of supported cryptocurrencies
    // var coin_gecko_versus_url = 'https://api.coingecko.com/api/v3/simple/supported_vs_currencies';

    let current_crypto =
        {
            fid: 'btc-bitcoin', // Full Crypto ID
            id: 'bitcoin'      // Short Crypto ID
        };

    // Change the Paprika url to query for the currently selected cryptocurrency
    let ca_info_url = base_paprika_url + current_crypto.fid;

    // Generate the additional information for the selected cryptocurrency
    get_api_data(ca_info_url, 'ADDITIONAL_INFO', null);

    const number_of_time_points = 12;

    // Generate the historical data object and iterate for each time point (tp)
    for (var tp = 0; tp < number_of_time_points; tp++) {
        // Define historical data url
        let hd_url = `${base_gecko_value_url}${current_crypto.id}/history?date=01-${tp + 1}-2017`;
        get_api_data(hd_url, 'HISTORICAL_DATA', tp);
    }

    console.log(historical_data);

    // get_api_data(coin_gecko_versus_url);
}

function get_api_data(requested_url, data_to_generate, iteration) {
    API_DATA = fetch(requested_url)
        .then((response) => {
            // Log the requested url address
            console.log(`Data from: ${requested_url}`);

            return response.json();
        })
        .then((data) => {
            console.log(data);

            // Return relevant data based on current query
            switch (data_to_generate) {
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

                    break;

                case 'HISTORICAL_DATA':
                    data_pt = data.market_data.current_price.usd;

                    // Set this data point to whatever the global data point has been updated to since the API call
                    historical_data[iteration] = data_pt;

                    console.log(`Data Point ${iteration + 1}: `);
                    console.log(data_pt);

                    break;
            }

            return data;
        });

    return API_DATA;
}

generate_data();

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
    var cryptoLists = localStorage.getItem('cryptos').split(",");

    cryptoLists.forEach(addItemToView);
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
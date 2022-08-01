var coin_paprika_url = 'https://api.coinpaprika.com/v1/coins/btc-bitcoin'; // eth-ethereum
var coin_gecko_value_url = 'https://api.coingecko.com/api/v3/coins/bitcoin/history?date=30-12-2017'; // coins/list gives the list of supported cryptocurrencies
var coin_gecko_versus_url = 'https://api.coingecko.com/api/v3/simple/supported_vs_currencies';

function getApi(requested_url) {
    fetch(requested_url)
        .then((response) => {
            // Log the requested url address
            console.log(`Data from: ${requested_url}`);

            return response.json();
        })
        .then((data) => {
            console.log(data);
            if (requested_url === coin_paprika_url) {
                let additional_info =
                    {
                        name: data.name,
                        description: data.description,
                        website: data.links.website[0],
                        source_code: data.links.source_code[0]
                    }

                console.log('Additional Info: ');
                console.log(additional_info);
            }
            else if (requested_url === coin_gecko_value_url) {
                const number_of_time_points = 12;
                let historical_data = [];

                for (var i = 0; i < number_of_time_points; i++) {
                    historical_data[i] =
                        {
                            price: data.market_data.current_price.usd,
                        }
                }

                console.log('Historical Data: ');
                console.log(historical_data);
            }

        });
}

getApi(coin_paprika_url);

getApi(coin_gecko_value_url);

getApi(coin_gecko_versus_url);


var btn = document.querySelector('#showModal');
var modalDlg = document.querySelector('#image-modal');
var imageModalCloseBtn = document.querySelector('#image-modal-close');
var imgModalCancel = document.getElementById('cancel');
var imgModalSave = document.getElementById('save');
var currTypeInputEl = $('#project-type-input');

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
    var updatedArray = newCurrItem.concat(currencies);
    console.log("Currencies after concat updatedArray::" + updatedArray);
    localStorage.removeItem('cryptos');
    localStorage.setItem('cryptos', updatedArray);
    modalDlg.classList.remove('is-active');

})
var coin_paprika_url = 'https://api.coinpaprika.com/v1/coins/btc-bitcoin'; // eth-ethereum
var coin_gecko_value_url = 'https://api.coingecko.com/api/v3/coins/bitcoin/history?date=30-12-2017'; // coins/list gives the list of supported cryptocurrencies
var coin_gecko_versus_url = 'https://api.coingecko.com/api/v3/simple/supported_vs_currencies';

function getApi(requested_url) {
    fetch(requested_url)
      .then(function (response) {
        // Log the requested url address
        console.log(`Data from: ${requested_url}`)
        
        return response.json();
      })
      .then(function (data) {
        console.log(data);
      });
  }
  
  getApi(coin_paprika_url);
  
  getApi(coin_gecko_value_url);
  
  getApi(coin_gecko_versus_url);
function generate_data () {
    const base_paprika_url = 'https://api.coinpaprika.com/v1/coins/'; // e.g. eth-ethereum, btc-bitcoin
    const base_gecko_value_url = 'https://api.coingecko.com/api/v3/coins/'; // coins/list gives the list of supported cryptocurrencies
    // var coin_gecko_versus_url = 'https://api.coingecko.com/api/v3/simple/supported_vs_currencies';
    
    let current_crypto = 
    {
        fid: 'btc-bitcoin', // Full Crypto ID
        id:  'bitcoin'      // Short Crypto ID
    };
    
    // Change the Paprika url to query for the currently selected cryptocurrency
    let ca_info_url = base_paprika_url + current_crypto.fid;
    
    // Generate the additional information for the selected cryptocurrency
    get_api_data(ca_info_url, 'ADDITIONAL_INFO');
    
    // Generate the historical data object
    const number_of_time_points = 12;
    let historical_data = [];
    
    
    // Iterate for each time point (tp)
    for (var tp = 0 ; tp < number_of_time_points ; tp++) 
    {
        // Define historical data url
        let hd_url = `${base_gecko_value_url}${current_crypto.id}/history?date=01-${tp + 1}-2017`;
        historical_data[tp] = get_api_data(hd_url, 'HISTORICAL_DATA');
    }
    
    console.log(historical_data);
    
    // get_api_data(coin_gecko_versus_url);
}

function get_api_data(requested_url, data_to_generate) 
{
fetch(requested_url)
    .then( (response) => {
    // Log the requested url address
    console.log(`Data from: ${requested_url}`);
    
    return response.json();
    })
    .then( (data) => {
    console.log(data);
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

            return additional_info;

        case 'HISTORICAL_DATA':
            let data_pt = data.market_data.current_price.usd;
            console.log('Historical Data: ');
            console.log(data_pt);
            
            return data_pt;
    }
    
    });
}

generate_data();
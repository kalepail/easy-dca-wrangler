import { handleResponse } from './@js/utils'

export default function(symbol, notional) {
  return fetch('https://paper-api.alpaca.markets/v2/orders', {
    method: 'POST',
    headers: {
      'APCA-API-KEY-ID': APCA_PAPER_API_KEY_ID,
      'APCA-API-SECRET-KEY': APCA_PAPER_API_SECRET_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      symbol,
      notional,
      side: 'buy',
      type: 'market',
      time_in_force: 'day'
    })
  }).then(handleResponse)
}
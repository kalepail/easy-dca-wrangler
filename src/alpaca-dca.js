import moment from 'moment'

import { handleResponse } from './@js/utils'

// const sandboxBaseUrl = 'https://paper-api.alpaca.markets/v2'
// APCA_PAPER_API_KEY_ID
// APCA_PAPER_API_SECRET_KEY

const liveBaseUrl = 'https://api.alpaca.markets/v2'
// APCA_API_KEY_ID
// APCA_API_SECRET_KEY

export default async function(symbol, notional, event) {
  const { timestamp, is_open, next_open } = await fetch(`${liveBaseUrl}/clock`, {
    headers: {
      'APCA-API-KEY-ID': APCA_API_KEY_ID,
      'APCA-API-SECRET-KEY': APCA_API_SECRET_KEY,
    }
  }).then(handleResponse)

  if ( // Don't place orders if markets won't be open in the next 24 hrs
    !is_open
    && moment(next_open).diff(timestamp, 'hours', true) > 24
  ) throw `Not an open market day`

  if (event.type === 'scheduled')
    return fetch(`${liveBaseUrl}/orders`, {
      method: 'POST',
      headers: {
        'APCA-API-KEY-ID': APCA_API_KEY_ID,
        'APCA-API-SECRET-KEY': APCA_API_SECRET_KEY,
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
  
  else return {
    message: 'OK'
  }
}
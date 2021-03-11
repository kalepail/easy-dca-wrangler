import Bluebird from 'bluebird'
import { map as loMap } from 'lodash'

import { handleResponse, parseError } from './@js/utils'

async function handleFetch(event) {
  try {
    const handleScheduledResponse = await handleScheduled(event)

    return new Response(JSON.stringify(handleScheduledResponse), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    })
  }

  catch(err) {
    return parseError(err)
  }
}

function handleScheduled(event) {
  return STORE
  .list()
  .then(({keys}) => loMap(keys, 'name'))
  .then((pairs) => 
    Bluebird.mapSeries(pairs, (symbol_notional) => {
      const [
        symbol, 
        notional
      ] = symbol_notional.split(':')

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
    })
  )
}

addEventListener('fetch', (event) => event.respondWith(handleFetch(event)))
addEventListener('scheduled', (event) => event.waitUntil(handleScheduled(event)))
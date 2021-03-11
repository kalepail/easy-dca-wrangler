import Bluebird from 'bluebird'
import { map as loMap } from 'lodash'

import coinbaseDCA from './coinbase-dca'
import alpacaDCA from './alpaca-dca'

import { parseError } from './@js/utils'

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

      if (symbol.indexOf('-') === -1) // Alpaca
        return alpacaDCA(symbol, notional)

      else // Coinbase Pro
        return coinbaseDCA(event, symbol, notional)
    })
  )
}

addEventListener('fetch', (event) => event.respondWith(handleFetch(event)))
addEventListener('scheduled', (event) => event.waitUntil(handleScheduled(event)))
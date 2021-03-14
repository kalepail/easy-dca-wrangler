import Bluebird from 'bluebird'
import shajs from 'sha.js'

import alpacaDCA from './alpaca-dca'
import coinbaseDCA from './coinbase-dca'

import { handleMapSeriesError, parseError } from './@js/utils'

async function handleFetch(event) {
  try {
    if (
      event.request.method !== 'POST'
      || event.request.headers.get('X-GROOT') !== shajs('sha256').update(Buffer.from(GROOT_SECRET_KEY, 'base64')).digest('hex')
    ) throw `You are not Groot`

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
  .then(({keys}) => keys.map((key) => key.name))
  .then((pairs) => 
    Bluebird.mapSeries(pairs, (symbol_notional) =>
      new Promise((resolve) => {
        const [
          symbol, 
          notional
        ] = symbol_notional.split(':')

        setTimeout(async () => {
          let response

          // Alpaca
          if (symbol.indexOf('-') === -1)
            response = await alpacaDCA(symbol, notional, event).catch(handleMapSeriesError)
    
          // Coinbase Pro
          else
            response = await coinbaseDCA(symbol, notional, event).catch(handleMapSeriesError)

          resolve(response)
        }, 100)
      })
    )
  )
}

addEventListener('fetch', (event) => event.respondWith(handleFetch(event)))
addEventListener('scheduled', (event) => event.waitUntil(handleScheduled(event)))
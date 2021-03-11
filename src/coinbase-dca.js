import moment from 'moment'

import { handleResponse } from './@js/utils'

export default async function coinbaseDCA(event, product_id, funds) {
  const timestamp = moment.utc().subtract(30, 'seconds').format('X')
  const method = 'POST'
  const requestPath = '/orders'
  const body = JSON.stringify({
    type: 'market',
    side: 'buy',
    product_id,
    funds,
  })

  const dataArrayBuffer = Buffer.from(timestamp + method + requestPath + body)
  const keyBuffer = Buffer.from(CB_ACCESS_SECRET, 'base64')
  const keyArrayBuffer = await crypto.subtle.importKey('raw', keyBuffer, {name: 'HMAC', hash: 'SHA-256'}, false, ['sign'])
  const signatureArrayBuffer = await crypto.subtle.sign('HMAC', keyArrayBuffer, dataArrayBuffer)
  const signature = Buffer.from(signatureArrayBuffer).toString('base64')

  return fetch('https://api-public.sandbox.pro.coinbase.com/orders', {
    method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': event.request.headers.get('user-agent'),
      'CB-ACCESS-KEY': CB_ACCESS_KEY,
      'CB-ACCESS-SIGN': signature,
      'CB-ACCESS-TIMESTAMP': timestamp,
      'CB-ACCESS-PASSPHRASE': CB_ACCESS_PASSPHRASE,
    },
    body
  })
  .then(handleResponse)
}
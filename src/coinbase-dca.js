import { handleResponse } from './@js/utils'

// const sandboxBaseUrl = 'https://api-public.sandbox.pro.coinbase.com'
// CB_SANDBOX_ACCESS_SECRET
// CB_SANDBOX_ACCESS_KEY
// CB_SANDBOX_ACCESS_PASSPHRASE

const liveBaseUrl = 'https://api.pro.coinbase.com'
// CB_ACCESS_SECRET
// CB_ACCESS_KEY
// CB_ACCESS_PASSPHRASE

const headers = {
  'Accept': 'application/json',
  'User-Agent': 'easy-dca-wrangler',
}

export default async function coinbaseDCA(product_id, funds, event) {
  const { epoch } = await fetch(`${liveBaseUrl}/time`, { headers }).then(handleResponse)
  const method = 'POST'
  const requestPath = '/orders'
  const body = JSON.stringify({
    type: 'market',
    side: 'buy',
    product_id,
    funds,
  })

  const dataArrayBuffer = Buffer.from(epoch + method + requestPath + body)
  const keyBuffer = Buffer.from(CB_ACCESS_SECRET, 'base64')
  const keyArrayBuffer = await crypto.subtle.importKey('raw', keyBuffer, {name: 'HMAC', hash: 'SHA-256'}, false, ['sign'])
  const signatureArrayBuffer = await crypto.subtle.sign('HMAC', keyArrayBuffer, dataArrayBuffer)
  const signature = Buffer.from(signatureArrayBuffer).toString('base64')

  if (event.type === 'scheduled')
    return fetch(`${liveBaseUrl}/orders`, {
      method,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'CB-ACCESS-KEY': CB_ACCESS_KEY,
        'CB-ACCESS-SIGN': signature,
        'CB-ACCESS-TIMESTAMP': epoch,
        'CB-ACCESS-PASSPHRASE': CB_ACCESS_PASSPHRASE,
      },
      body
    }).then(handleResponse)
  
  else return {
    message: 'OK'
  }
}
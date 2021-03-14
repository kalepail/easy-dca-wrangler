const keypair = await crypto.subtle.importKey(
  'raw',
  Buffer.from(MASTER_ENCRYPTION_KEY, 'base64'),
  {
    name: 'AES-GCM',
    length: 256
  },
  false,
  ['encrypt', 'decrypt']
)

export async function generateKey() {
  const keypair = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  )

  const keypairExport = await crypto.subtle.exportKey('raw', keypair)

  return Buffer.from(keypairExport).toString('base64')
}

export async function encrypt(data) {
  const encoded = Buffer.from(data)
  const iv = crypto.getRandomValues(Buffer.alloc(16))
  const algorithm = {
    name: 'AES-GCM',
    iv
  }

  const ciphertext = await crypto.subtle.encrypt(algorithm, keypair, encoded)

  return {
    iv: Buffer.from(iv).toString('base64'),
    ciphertext: Buffer.from(ciphertext).toString('base64')
  }
}

export async function decrypt({iv, ciphertext}) {
  const algorithm = {
    name: 'AES-GCM',
    iv: Buffer.from(iv, 'base64')
  }

  const decrypted = await crypto.subtle.decrypt(
    algorithm, 
    keypair, 
    Buffer.from(ciphertext, 'base64')
  )

  return Buffer.from(decrypted).toString('utf8')
}
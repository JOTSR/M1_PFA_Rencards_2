import { Jwt } from '../server/deps.ts'
import { db } from '../server/db.ts'

import * as webPush from 'https://esm.sh/web-push?target=deno'

const vapid = {
    sub: Deno.env.get('VAPID_SUB')!,
    private: Deno.env.get('VAPID_PRIVATE')!,
    public: Deno.env.get('VAPID_PUBLIC')!
}

webPush.setVapidDetails(
    vapid.sub,
    vapid.public,
    vapid.private
)

// const salt = 'hcwD844KF'

export async function pushNotification(title: string, options: Record<string, unknown>) {
	// const keyPair = await crypto.subtle.generateKey(
	// 	{
	// 		name: 'ECDH',
	// 		namedCurve: 'P-256'
	// 	},
	// 	false,
	// 	['deriveKey']
	// )

    // const sharedSecret = await crypto.subtle.deriveKey(
    //     {
    //         name: 'ECDH',
    //         //public: keyPair.publicKey
    //     },
    //     keyPair.privateKey,
    //     {
    //         name: 'AES-GCM',
    //         length: 256
    //     },
    //     false,
    //     ['encrypt', 'decrypt']
    // )
	
	// const encrypted = await crypto.subtle.encrypt(
	// 	{ name: 'AES-GCM', iv: new TextEncoder().encode(salt) },
	// 	keyPair.privateKey,
	// 	new TextEncoder().encode(JSON.stringify({ title, ...options }))
	// )
	
    
	for(const { subscription } of await db.webPush.select<'subscription'>('*')) {
        // const clientPubKey = btoa(subscription.keys.p256dh)
        // const clientAuthSecret = btoa(subscription.keys.auth)

        webPush.sendNotification(subscription, JSON.stringify({ title, ...options }))
        
        // const authHeader = await Jwt.create(
        //     {
        //         alg: 'ES256',
        //         type: 'JWT'
        //     },
        //     {
        //         aud: new URL(subscription.endpoint).origin,
        //         exp: Math.floor((Date.now() / 1000) + (12 * 60 * 60)),
        //         sub: vapid.sub,
        //     },
        //     keyPair.privateKey
        // )

		// if (typeof subscription.endpoint === 'string') {
		// 	await fetch(subscription.endpoint, {
		// 		method: 'POST',
        //         headers: {
        //             'Encryption': `salt=${btoa(salt)}`,
        //             'Content-Encoding': 'aesgcm',
        //             'Content-Type': 'application/octet-stream',
        //             'Authorization': authHeader,
        //             'TTL': String(24 * 60 * 60),
        //             'Crypto-Key': `dh=${keyPair.publicKey},p256ecdsa=${btoa(vapid.public)}`,
        //         },
		// 		body: new Uint8Array(encrypted)
		// 	})
		// }
	} 
}

// await pushNotification(
// 	'Rφ le 25 à 12h30',
// 	{
// 		body: 'RDV au Rencards de la Physique le 25 à 12h30 au A9',
// 		tag: 'rappel',
// 		actions: [
// 			{
// 				action: 'go-to',
// 				title: `S'y rendre`
// 			},
// 			{
// 				action: 'save-calendar',
// 				title: 'Ajouter à mon agenda'
// 			}
// 		]
// 	}
// )

const webPush = require('web-push')
const fs = require('fs')
require('dotenv').config({path: '../.env'})

webPush.setVapidDetails(
    process.env.VAPID_SUB,
    process.env.VAPID_PUBLIC,
    process.env.VAPID_PRIVATE
)

function pushNotification(subscriptions: unknown[], payload: Record<string, unknown>) {    
    //@ts-ignore ok
    for (const { subscription } of subscriptions) {
        try {
            //@ts-ignore ok
            webPush.sendNotification(subscription, JSON.stringify(payload))
            console.log('sended')
        } catch (e) {
            console.error(`Push error: ${e}`)
        }
    }
}

const [subscriptions, payload] = process.argv
    .slice(2)
    .map(arg => JSON.parse(arg.replaceAll('%20', ' ')))

pushNotification(subscriptions, payload)
import { postgres } from './deps.ts'

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never
type LastOf<T> = UnionToIntersection<T extends unknown ? () => T : never> extends () => (infer R) ? R : never
type Push<T extends unknown[], V> = [...T, V]
type TuplifyUnion<T, L = LastOf<T>, N = [T] extends [never] ? true : false> = true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>

export type ContactForm = {
    id: number
    created_at: string
    first_name: string
    name: string
    email: string
    message: string
}

export type ConnectionLogs = {
    ip: string
    first_at?: string
    last_at: string
}

export type WebPush = {
    ip: string
    subscription: WebPushSubscription
}

type WebPushSubscription = {
    endpoint: string
    expirationTime: string
    keys: {
        p256dh: string
        auth: string
    }
}

class DB {
    #pool: postgres.Pool

    constructor(config: postgres.ClientOptions, pool = 3) {
        this.#pool = new postgres.Pool(config, pool)
    }

    contactForm = {
        insert: async ({first_name, name, email, message}: Omit<ContactForm, 'id' | 'created_at'>) => {
            const client = await this.#pool.connect()
            try {
                await client.queryObject/*sql*/`
                INSERT INTO contact_form (
                    first_name, name, email, message
                ) VALUES (
                    ${first_name}, ${name}, ${email}, ${message}
                )`
            } finally {
                client.release()
            }
        },
        select: async <T extends keyof ContactForm | '*'>(...fields: TuplifyUnion<keyof ContactForm> | ['*']) => {
            const client = await this.#pool.connect()
            let response
            try {
                response = await client.queryObject/*sql*/`
                SELECT ${fields.join(', ')} FROM contact_form`
            } finally {
                client.release()
            }
            if (fields[0] === '*') {
                return response.rows as ContactForm[]
            }
            //@ts-ignore prevent by previous line
            return response.rows as Pick<ContactForm, T>[]
        }
    }

    connectionLogs = {
        update: async ({ip, last_at}: ConnectionLogs) => {
            const client = await this.#pool.connect()
            try {
                await client.queryObject/*sql*/`
                INSERT INTO connection_logs (
                    ip, last_at
                ) VALUES (
                    ${ip}, ${last_at}
                ) ON CONFLICT (ip)
                DO UPDATE SET last_at = EXCLUDED.last_at`
            } finally {
                client.release()
            }
        },
        select: async <T extends keyof ConnectionLogs | '*'>(...fields: TuplifyUnion<keyof ConnectionLogs> | ['*']) => {
            const client = await this.#pool.connect()
            let response
            try {
                response = await client.queryObject/*sql*/`
                SELECT ${fields.join(', ')} FROM contact_form`
            } finally {
                client.release()
            }
            if (fields[0] === '*') {
                return response.rows as ConnectionLogs[]
            }
            //@ts-ignore prevent by previous line
            return response.rows as Pick<ConnectionLogs, T>[]
        }
    }

    webPush = {
        update: async ({ip, subscription}: WebPush) => {
            const client = await this.#pool.connect()
            try {
                await client.queryObject/*sql*/`
                INSERT INTO web_push (
                    ip, subscription
                ) VALUES (
                    ${ip}, ${subscription}
                ) ON CONFLICT (ip)
                DO UPDATE SET subscription = EXCLUDED.subscription`
            } finally {
                client.release()
            }
        },
        select:async <T extends keyof WebPush | '*'>(...fields: TuplifyUnion<keyof WebPush> | ['*']) => {
            const client = await this.#pool.connect()
            let response
            try {
                response = await client.queryObject/*sql*/`
                SELECT subscription FROM web_push`
                // SELECT ${fields.join(', ')} FROM web_push`
            } finally {
                client.release()
            }

            return response.rows as WebPushSubscription[]

            if (fields[0] === '*') {
                return response.rows as WebPush[]
            }
            //@ts-ignore prevent by previous line
            return response.rows as Pick<WebPush, T>[]
        }
    }

    close() {
        this.#pool.end()
    }
}

export const db = new DB({
    hostname: String(Deno.env.get('DB_HOSTNAME') ?? ''),
    database: String(Deno.env.get('DB_DATABASE') ?? ''),
    port: Number(Deno.env.get('DB_PORT') ?? ''),
    user: String(Deno.env.get('DB_USER') ?? ''),
    password: String(Deno.env.get('DB_PASSWORD') ?? '')
})
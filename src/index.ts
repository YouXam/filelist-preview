
export type Env = {
    ASSETS: Fetcher
}

import { svg } from './svg'
import { Resvg, initWasm } from "@resvg/resvg-wasm"
import wasm from "@resvg/resvg-wasm/index_bg.wasm"
import { Hono, MiddlewareHandler } from 'hono'
import { z } from 'zod'
import { Node } from './expand'
import { validator } from 'hono/validator'

const NodeSchema: z.ZodType<Node> = z.lazy(() => z.union([
    z.object({
        type: z.literal('folder'),
        name: z.string(),
        children: z.array(NodeSchema),
    }),
    z.object({
        type: z.literal('file'),
        name: z.string(),
    }),
]));

const Schema = z.object({
    files: z.array(NodeSchema),
    title: z.string().optional(),
    fontSize: z.number().optional(),
    height: z.number().optional(),
    width: z.number().optional(),
})

const valid = validator('json', (value, c) => {
    const parsed = Schema.safeParse(value)
    if (!parsed.success) {
      return c.json({ error: parsed.error.errors, success: false }, 400)
    }
    return parsed.data
})

type BodyType<T> = T extends MiddlewareHandler<any, string, infer R> ? R : never
export type ImageBodyType = BodyType<typeof valid>

const initWasmPromise = initWasm(wasm)

export default new Hono<{ Bindings: Env }>()
    .post('/svg', valid, async c => new Response(await svg(c), {
        headers: {
            "Content-Type": "image/svg+xml",
        },
    }))
    .post('/png', valid, async c => {
        await initWasmPromise
        const svgRes = await svg(c)
        const height = c.req.valid('json').height ?? 800
        const renderer = new Resvg(svgRes, {
            fitTo: {
                mode: 'height',
                value: height * 5
            },
        })
        const image = renderer.render()
        const pngBuffer = image.asPng()
        const response = new Response(pngBuffer, {
            headers: {
                "Content-Type": "image/png",
            },
        })
        return response
    })
    .all('*', async c => c.redirect("https://github.com/YouXam/filelist-preview"))

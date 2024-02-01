import fs from "node:fs"
import path from "node:path"
import { PNG } from "pngjs";
import puppeteer from "puppeteer";
import get_user_details from "../db/util/user";

const FREQUENCY_MAP_ORIGINAL: any = JSON.parse(fs.readFileSync(path.join(__dirname, 'scripts/frequency_map.json'), { encoding: 'utf-8' }))

function base64_to_hex(base_64: string): Buffer {
    return Buffer.from(base_64, "base64")
}

function get_base64_string(raw_src: string): string {
    return raw_src.split(',')[1]
}

function generate_pixel_frequency(base64_png_string: string) {
    const buffer = base64_to_hex(get_base64_string(base64_png_string))
    const png = PNG.sync.read(buffer)

    const frequencies: any = {}
    for (let i = 0; i < png.data.length; i += 4) {
        let pixel = `${png.data[i]},${png.data[i + 1]},${png.data[i + 2]}`

        if (!frequencies[pixel]) {
            frequencies[pixel] = 1
        } else {
            frequencies[pixel] += 1
        }
    }

    return frequencies
}

async function rip_ing() {
    const user = await get_user_details()

    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({ headless: false, slowMo: 300 });
    const page = await browser.newPage();

    await page.goto('https://www.ing.com.au/securebanking/');

    const numpad_srcs = await page.evaluate(() => {
        const numpad_imgs = Array.from(document.querySelectorAll('img.ing-keypad')) as HTMLImageElement[]
        return numpad_imgs.map(n => n.src)
    })

    // generate the frequency map for each undetermined image count the pixels in preparation for comparing
    const frequency_map = new Map<string, any>()
    for (const src of numpad_srcs) {
        const freq = generate_pixel_frequency(src)
        frequency_map.set(src, freq)
    }

    // determine which image maps to which
    const symbol_to_src_map = new Map<string, string>()
    for (const src of numpad_srcs) {
        // for now we're just going to compare the white pixels 255,255,255
        const pixel_counts: number = frequency_map.get(src)['255,255,255']
        let nearest_neighbour: Array<any> = [null, null] // (DIGIT/SYMBOLPAD, NUMPADSRC)
        let min = 9999999
        const loop = [...'0123456789'.split(''), 'back', 'cancel']
        for (const symbol of loop) {
            const difference = Math.abs(FREQUENCY_MAP_ORIGINAL[symbol]['255,255,255'] - pixel_counts)
            if (difference < min) {
                nearest_neighbour[0] = symbol
                nearest_neighbour[1] = src
                min = difference
            }
        }

        symbol_to_src_map.set(nearest_neighbour[0], nearest_neighbour[1])
    }
    // LOGIN
    await page.type('#cifField', user.ing_client_number)
    for (const code of user.ing_access_code.split('')) {
        await page.click(`img[src="${symbol_to_src_map.get(code)}"]`)
    }
    await page.click('#login-btn')
    // await browser.close()
}

rip_ing().then(() => console.log('done'))
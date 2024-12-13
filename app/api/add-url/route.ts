import { NextResponse } from 'next/server'
import { addUrl } from '../../../lib/url-store'

export async function POST(request: Request) {
    try {
        const { url, description } = await request.json()

        if (!url) {
            return NextResponse.json({ error: 'URL and description are required' }, { status: 400 })
        }

        const newUrl = addUrl(url, description)

        return NextResponse.json(newUrl)
    } catch (error) {
        console.error('Error in add-url:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

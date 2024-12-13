import { NextResponse } from 'next/server'
import { getUrls } from '../../../lib/url-store'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''

        const urls = getUrls()
        const filteredUrls = urls.filter(url =>
            url.url.toLowerCase().includes(search.toLowerCase()) ||
            url.description.toLowerCase().includes(search.toLowerCase())
        )

        return NextResponse.json(filteredUrls)
    } catch (error) {
        console.error('Error in get-urls:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}


import { NextResponse } from 'next/server'
import { modifyUrl } from '../../../lib/url-store'

export async function POST(request: Request) {
    try {
        const { id, url, description } = await request.json()

        if (!id || !url) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
        }

        const updatedUrl = modifyUrl(id, url, description)

        if (!updatedUrl) {
            return NextResponse.json({ error: 'URL not found' }, { status: 404 })
        }

        return NextResponse.json(updatedUrl)
    } catch (error) {
        console.error('Error in modify-url:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}


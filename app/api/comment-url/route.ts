import { NextResponse } from 'next/server'
import { updateUrl } from '../../../lib/url-store'

export async function POST(request: Request) {
    try {
        const { id, isCommented } = await request.json()

        if (!id || typeof isCommented !== 'boolean') {
            return NextResponse.json({ code: 1, error: 'Invalid input' }, { status: 400 })
        }

        const updatedUrl = updateUrl(id, isCommented)

        if (!updatedUrl) {
            return NextResponse.json({ code: 1, error: 'URL not found' }, { status: 404 })
        }

        return NextResponse.json({ code: 0, data: updatedUrl })
    } catch (error) {
        console.error('Error in comment-url:', error)
        return NextResponse.json({ code: 1, error: 'Internal server error' }, { status: 500 })
    }
}

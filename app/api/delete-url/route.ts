import { NextResponse } from 'next/server'
import { deleteUrl } from '../../../lib/url-store'

export async function POST(request: Request) {
    try {
        const { id } = await request.json()

        if (!id) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
        }

        const success = deleteUrl(id)

        if (!success) {
            return NextResponse.json({ error: 'URL not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error in delete-url:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}


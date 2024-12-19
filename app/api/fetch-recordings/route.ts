import { cachedConfig } from '../../../lib/api-store'

export async function GET() {
    try {

        const url = cachedConfig.url;

        if (!url) {
            return new Response(JSON.stringify({ error: 'URL not found in config' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Fetch data from the URL
        const response = await fetch(url);
        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching recordings:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch recordings' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}


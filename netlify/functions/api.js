const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
// For local testing, ensure these are set in your environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // path is something like /.netlify/functions/api/contact or /api/contact depending on redirect
    // We normalize to finding the last segment
    const path = event.path.replace('/.netlify/functions/api', '').replace('/api', '');

    try {
        // --- POST /contact ---
        if ((path === '/contact' || path === '/contact/') && event.httpMethod === 'POST') {
            const data = JSON.parse(event.body);

            // Validation
            if (!data.name || !data.email || !data.subject || !data.message) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'All fields are required.' })
                };
            }

            const { error } = await supabase
                .from('contact_logs')
                .insert([{
                    name: data.name,
                    email: data.email,
                    subject: data.subject,
                    message: data.message,
                    status: 'open'
                }]);

            if (error) throw error;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: 'Message sent successfully.' })
            };
        }

        // --- GET /logs ---
        if ((path === '/logs' || path === '/logs/') && event.httpMethod === 'GET') {
            const { data, error } = await supabase
                .from('contact_logs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(data)
            };
        }

        // --- PATCH /logs/:id/status ---
        // Regex to match /logs/123/status
        const statusMatch = path.match(/^\/logs\/(\d+)\/status$/);
        if (statusMatch && event.httpMethod === 'PATCH') {
            const id = statusMatch[1];
            const { status } = JSON.parse(event.body);

            if (!['open', 'closed'].includes(status)) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Invalid status. Must be "open" or "closed".' })
                };
            }

            const { error } = await supabase
                .from('contact_logs')
                .update({ status })
                .eq('id', id);

            if (error) throw error;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: 'Status updated successfully.' })
            };
        }

        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Not Found' })
        };

    } catch (error) {
        console.error('API Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
        };
    }
};

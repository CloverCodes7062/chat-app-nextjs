import { NextResponse } from "next/server";

export async function GET(req, res) {
    const basicAuth = Buffer.from(process.env.NEXT_PUBLIC_DYTE_ORGANIZATION_ID + ":" + process.env.NEXT_PUBLIC_DYTE_API_KEY).toString('base64');
    const meetingId = req.nextUrl.searchParams.get('meetingId');
    const participantName = req.nextUrl.searchParams.get('participantName');
    const participantId = req.nextUrl.searchParams.get('participantId');

    console.log(meetingId, participantName, participantId);

    try {
        const options = {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${basicAuth}`
            },
            body: JSON.stringify({
                name: participantName,
                preset_name: "group_call_participant",
                custom_participant_id: participantId
            })
        };
        
        const response = await fetch(`https://api.dyte.io/v2/meetings/${meetingId}/participants`, options);
        const data = await response.json();

        if (response.ok) {
            return new Response(JSON.stringify(data.data));
        } else {
            console.log('Error')
            return new Response('ERROR');
        }
    } catch (error) {
        return new Response('Internal Error');
    }
}

export const dynamic = 'force-dynamic';
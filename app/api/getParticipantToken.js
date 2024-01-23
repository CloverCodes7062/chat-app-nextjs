export default async function getParticipantToken(req, res) {
    if (req.method == 'POST') {
        const basicAuth = Buffer.from(process.env.NEXT_PUBLIC_DYTE_ORGANIZATION_ID + ":" + process.env.NEXT_PUBLIC_DYTE_API_KEY).toString('base64');
        const meetingId = req.body.meetingId;

        try {
            const options = {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${basicAuth}`
              },
              body: JSON.stringify({
                  name: "Mary Sue",
                  preset_name: "group_call_participant",
                  custom_participant_id: "string"
              })
            };
            
            const response = await fetch(`https://api.dyte.io/v2/meetings/${meetingId}/participants`, options);
            const data = await response.json();

            if (response.ok) {
                res.status(200).json(data);
            } else {
                res.status(response.status).json({ message: 'Error fetching participant token' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}
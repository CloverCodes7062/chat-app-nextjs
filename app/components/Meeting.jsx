'use client';
import React, { useEffect, useState } from "react";
import { DyteMeeting } from "@dytesdk/react-ui-kit";
import { useDyteClient, DyteProvider } from "@dytesdk/react-web-core";

export default function Meeting() {
    const [meeting, initMeeting] = useDyteClient();

    const [participantId, setParticipantId] = useState('');
    const [participantName, setParticipantName] = useState('');

    const meetingId = 'bbb1400d-b51a-4fc1-8ddf-44cd111bcade';
    const basicAuth = Buffer.from(process.env.NEXT_PUBLIC_DYTE_ORGANIZATION_ID + ":" + process.env.NEXT_PUBLIC_DYTE_API_KEY).toString('base64');

    const getParticipantToken = async () => {

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
              
              const response = await fetch(`https://api.dyte.io/v2/meetings/${meetingId}/participants`, options)
              const data = await response.json();

              return data;

        } catch (error) {
            console.error('Failed', error);
        }
    };

    const handleJoinMeeting = async () => {
        try {
            const response = await getParticipantToken();
            console.log(response);

            if (response.success) {
                console.log(response.data);
                const authToken = response.data.token;

                initMeeting({
                    authToken: authToken,
                    defaults: {
                        audio: false,
                        video: false,
                    },
                });
            }

        } catch (error) {
            console.log('Failed to joinMeeting', error);
        }
    }

    return (
        <>
            {meeting ? 
            (<div>
                <h1>Meeting Found</h1>
                <DyteMeeting mode="fill" meeting={meeting}/>
            </div>)
            : 
            (<div>
                <h1>Join a Dyte Meeting</h1>
                <input
                    type="text"
                    placeholder="Participant ID"
                    value={participantId}
                    onChange={(e) => setParticipantId(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Participant Name"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                />
                <button onClick={handleJoinMeeting}>Join Meeting</button>
            </div>)
            }
        </>
      );
}
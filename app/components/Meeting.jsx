'use client';
import React, { useEffect, useState } from "react";
import { DyteMeeting } from "@dytesdk/react-ui-kit";
import { useDyteClient, DyteProvider } from "@dytesdk/react-web-core";
import { v4 as uuidv4 } from 'uuid';

export default function Meeting({ meetingId }) {
    const [meeting, initMeeting] = useDyteClient();
    const [participantName, setParticipantName] = useState('');

    const basicAuth = Buffer.from(process.env.NEXT_PUBLIC_DYTE_ORGANIZATION_ID + ":" + process.env.NEXT_PUBLIC_DYTE_API_KEY).toString('base64');

    const handleJoinMeeting = async () => {
        if (meetingId) {
            try {
                const response = await fetch(`/api/getParticipantToken?meetingId=${meetingId}&participantName=${participantName}&participantId=${uuidv4()}`);
                const data = await response.json();
    
                if (response.ok) {
                    console.log(data);
                    const authToken = data.token;
    
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
                <h1>Join a Meeting</h1>
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
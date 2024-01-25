'use client';
import React, { useEffect, useRef, useState } from "react";
import { DyteGrid, DyteMeeting, DyteMicToggle } from "@dytesdk/react-ui-kit";
import { useDyteClient, DyteProvider } from "@dytesdk/react-web-core";
import { v4 as uuidv4 } from 'uuid';

export default function Meeting({ meetingId }) {
    const [meeting, initMeeting] = useDyteClient();
    const [participantName, setParticipantName] = useState('');

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
                            screenShare: {
                                displaySurface: 'window',
                            }
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
            (<DyteMeeting meeting={meeting}></DyteMeeting>)
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
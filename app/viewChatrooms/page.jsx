'use client';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ViewChatrooms() {
    const router = useRouter();
    const uuid = uuidv4();
    const [session, setSession] = useState(null);
    
    const [roomsAllowedIn, setRoomsAllowedIn] = useState([]);

    const [userCreatedChatroomName, setUserCreatedChatroomName] = useState('');

    const hasRan = useRef(false);

    useEffect(() => {
        const checkSession = async () => {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error checking session:', error);
            } 

            if (!data.session) {
                router.push('/login');
            }
            else {
                setSession(data.session);
            }
        };

        checkSession();
    }, [router]);

    useEffect(() => {
        if (session) {

            const getRoomsAllowedin = async () => {
                const response = await fetch(`/api/getRoomsAllowedIn?userId=${session.user.id}`);
                const chatrooms = await response.json();
                
                setRoomsAllowedIn(chatrooms);
                console.log('chatrooms', chatrooms);
            }

            const createRealTimeSubscription = async () => {
                console.log('createRealTime called');
                if (!hasRan.current) {
                    hasRan.current = true;
                    const channel = supabase
                    .channel('chatrooms_db_changes')
                    .on(
                        'postgres_changes',
                        {
                            event: '*',
                            schema: 'public',
                            table: 'chatrooms',
                        },
                        (payload) => {
                            if (payload.eventType == "INSERT") {
                                if (payload.new.users_allowed_in.includes(session.user.id)) {
                                    setRoomsAllowedIn(previousRooms => [...previousRooms, { room_id: payload.new.room_id, chatroom_name: payload.new.chatroom_name }])
                                }
                            }
                        }
                    )
                    .subscribe()

                    console.log('subscription created');
                }
            }

            getRoomsAllowedin();

            createRealTimeSubscription();
        }
    }, [session]);

    const createNewRoom = async (event) => {
        event.preventDefault();

        const response = await fetch(`/api/getMeetingId?userCreatedChatroomName=${userCreatedChatroomName}`);
        const data = await response.json();


        const isRoomCreated = await fetch(`/api/postCreateNewRoom`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                created_by: session.user.id,
                chatroom_name: userCreatedChatroomName,
                users_allowed_in: [session.user.id],
                meeting_id: data.id
            }),
        });

        const isRoomCreatedJSON = await isRoomCreated.json();

        console.log('isRoomCreatedJSON', isRoomCreatedJSON);

        setUserCreatedChatroomName('');

    };

    return (
        <>
            {session ? 
                <div style={{display: 'flex', justifyContent: 'center', flexDirection: 'column', minHeight: '100vh'}}>
                    <h1 style={{color: '#fff', margin: 'none', padding: 'none'}}>View Chatrooms Page</h1>
                    <div style={{marginTop: 'auto', marginBottom: 'auto'}}>
                    {roomsAllowedIn ? 
                        <ul style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '15px', textDecoration: 'none', listStyle: 'none', margin: 'none', padding: 'none'}}>
                            {roomsAllowedIn.map((roomAllowedIn) => {
                                return (
                                    <li key={roomAllowedIn.room_id} style={{display: 'flex', justifyContent: 'center', marginLeft: '-30px'}}>
                                        <Link href={`/chatroom/${roomAllowedIn.room_id}`}>
                                            <button>To {roomAllowedIn.chatroom_name}</button>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    : null}
                        <br/>
                        <br/>
                        <div>
                            <form onSubmit={(event) => createNewRoom(event)} style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '15px'}}>
                                <input
                                    value={userCreatedChatroomName}
                                    onChange={(e) => setUserCreatedChatroomName(e.target.value)}
                                    name="userCreatedChatroomName"
                                    placeholder='Enter a Chatroom Name'
                                    required
                                />
                                <button type='submit'>Create a Chatroom</button>
                            </form>
                            <br/>
                            <br/>
                            <div style={{display: 'flex', justifyContent: 'center'}}>
                                <Link href="/">
                                    <button>Back to Landing Page</button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            : null}
        </>
    );
}
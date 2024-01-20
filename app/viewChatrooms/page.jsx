'use client';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ViewChatrooms() {
    const router = useRouter();
    const uuid = uuidv4();
    const [session, setSession] = useState(null);
    
    const [displayName, setDisplayName] = useState('');
    const [roomsAllowedIn, setRoomsAllowedIn] = useState([]);
    const [roomsAllowedInObj, setRoomsAllowedInObj] = useState([]);

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
            console.log('session:', session);
            console.log('session.user.email', session.user.email);

            const getUserProfile = async () => {
                const { data: userProfile } = await supabase
                .from('profiles')
                .select()
                .eq('id', session.user.id)

                setDisplayName(userProfile[0].display_name);
                setRoomsAllowedIn(userProfile[0].rooms_allowed_in);
            }

            getUserProfile();
        }
    }, [session])

    useEffect(() => {
        if (roomsAllowedIn) {
            console.log('roomsAllowedIn', roomsAllowedIn);

            const updateRoomsAllowedInObj = async () => {
                for (const roomAllowedIn of roomsAllowedIn) {
                    console.log(roomAllowedIn.room_id);
                    console.log(roomAllowedIn.room_name)
                }
            };

            updateRoomsAllowedInObj();
        }
    }, [roomsAllowedIn])

    return (
        <>
            {session ? 
                <div>
                    <h1 style={{color: '#fff'}}>View Chatrooms Page</h1>
                    <p style={{fontSize: '16px', color: '#fff'}}>
                    Welcome {displayName} to the View Chatrooms Page
                    </p>
                    {roomsAllowedIn ? 
                        <ul>
                            {roomsAllowedIn.map((roomAllowedIn) => {
                                return (
                                    <li key={roomAllowedIn.room_id}>
                                        <Link href={`/chatroom/${roomAllowedIn.room_id}`}>
                                            <button>To {roomAllowedIn.room_name}</button>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    : null}
                    <Link href="/">
                        <button>Back to Landing Page</button>
                    </Link>
                </div>
            : null}
        </>
    );
}
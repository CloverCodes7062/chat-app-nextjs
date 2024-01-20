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

    const [userCreatedChatroomName, setUserCreatedChatroomName] = useState('');

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
            }

            const getRoomsAllowedin = async () => {
                const { data: chatrooms, error } = await supabase
                .from('chatrooms')
                .select('room_id, chatroom_name')
                .contains('users_allowed_in', [session.user.id])
                
                setRoomsAllowedIn(chatrooms);
                console.log('chatrooms', chatrooms);
            }

            getRoomsAllowedin();

            getUserProfile();
        }
    }, [session]);

    const createNewRoom = async () => {
        const { error } = await supabase
        .from('chatrooms')
        .insert({ created_by: session.user.id, chatroom_name: userCreatedChatroomName, users_allowed_in: [session.user.id] })

        if (error) {
            console.log('Error Inserting New Room', error);
        }
    };

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
                                            <button>To {roomAllowedIn.chatroom_name}</button>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    : null}
                    <Link href="/">
                        <button>Back to Landing Page</button>
                    </Link>
                    <form onSubmit={createNewRoom}>
                        <input
                            value={userCreatedChatroomName}
                            onChange={(e) => setUserCreatedChatroomName(e.target.value)}
                            name="userCreatedChatroomName"
                            placeholder='Enter a Chatroom Name'
                            required
                        />
                        <button type='submit'>Create a Chatroom</button>
                    </form>
                </div>
            : null}
        </>
    );
}
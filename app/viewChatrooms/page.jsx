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
                            <form onSubmit={createNewRoom} style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '15px'}}>
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
'use client';
import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function Chatroom({ params }) {
    const uuid = params.uuid;
    const router = useRouter();
    const [chatroomData, setChatroomData] = useState([]);
    const [chatroomName, setChatroomName] = useState('');

    const [session, setSession] = useState(null);

    const [allowedIn, setAllowedIn] = useState(false);

    const [displayName, setDisplayName] = useState('');

    const [messageInputValue, setMessageInputValue] = useState('');

    useEffect(() => {
        const checkSession = async () => {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error checking session:', error);
            } else {
                console.log('Session:', data.session);
            }

            if (!data.session) {
                router.push('/login');
            } else {
                setSession(data.session);
            }
        };

        checkSession();

    }, [router]);

    useEffect(() => {
        const checkAllowedIn = async () => {
            const { data: chatroom, error } = await supabase
            .from('chatrooms')
            .select('users_allowed_in')
            .eq('room_id', uuid)
            
            console.log('chatroom', chatroom);

            if (chatroom[0].users_allowed_in.includes(session.user.id)) {
                setAllowedIn(true);
            } else {
                router.push('/viewChatrooms')
            }
        };

        const getUserProfile = async () => {
            const { data: userProfile, error } = await supabase
            .from('profiles')
            .select()
            .eq('id', session.user.id)

            setDisplayName(userProfile[0].display_name);
            console.log('userProfile', userProfile);
        };

        const getRoomData = async () => {
            const { data: roomData, error } = await supabase
            .from('messages')
            .select()
            .eq('room_id', uuid)
            .order('created_at');

            setChatroomData(roomData);
            console.log('roomData', roomData);
        };

        if (session) {
            checkAllowedIn();
            getUserProfile();
            getRoomData();
        }
    }, [session]);

    const handleSentMessage = async (event) => {
        event.preventDefault();
        const content = event.target.message.value;
        const sent_by_name = displayName;
        const sender_uuid = session.user.id;
        const sent_by_email = session.user.email;

        console.log(sender_uuid, content, sent_by_email, sent_by_name);

        const { error } = await supabase
            .from('messages')
            .insert({ room_id: uuid, content: content, sent_by_name: sent_by_name, sender_uuid: sender_uuid, sent_by_email: sent_by_email })

        if (error) {
            console.log('Error Inserting Message', error);
        }

        setMessageInputValue('');

        const { data: messages } = await supabase
            .from('messages')
            .select()
            .eq('room_id', uuid)
            .order('created_at');

        setChatroomData(messages);
    };

    return (
        <>
            {(session && allowedIn) ? 
            <div>
                <h1 style={{color: '#fff'}}>Welcome to Chatroom {chatroomName}</h1> 
                <ul>
                    {chatroomData ? 
                        chatroomData.map((message) => {
                            return (
                                <li key={message.message_id}>
                                    <p style={{fontSize: '18px', color: '#fff'}}>{message.content}</p>
                                    <p style={{fontSize: '18px', color: '#fff'}}>{message.created_at}</p>
                                    <p style={{fontSize: '18px', color: '#fff'}}>{message.room_id}</p>
                                    <p style={{fontSize: '18px', color: '#fff'}}>{message.sender_uuid}</p>
                                    <p style={{fontSize: '18px', color: '#fff'}}>{message.sent_by_email}</p>
                                    <p style={{fontSize: '18px', color: '#fff'}}>{message.sent_by_name}</p>
                                </li>
                            );
                        })
                    : null
                    }
                </ul>
                <form onSubmit={handleSentMessage}>
                    <input
                        placeholder="Enter a message"
                        name="message"
                        value={messageInputValue}
                        onChange={(e) => setMessageInputValue(e.target.value)}
                        required
                    >
                    </input>
                    <button type="submit" >Send Message</button>
                </form>
                <Link href="/">
                    <button>To Landing Page</button>
                </Link>
            </div>
            : null
            }
        </>
    );
}
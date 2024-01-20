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
        const getChatroomData = async () => {
            const { data: messages } = await supabase
            .from(uuid)
            .select()
            .order('created_at');

            if (messages) {
                setChatroomData(messages);
                setChatroomName(messages[0].chatroom_name);
                console.log('messages', messages);
            }
        };

        const getUserProfile = async () => {
            const { data: userProfile } = await supabase
            .from('profiles')
            .select()
            .eq('id', session.user.id)

            setDisplayName(userProfile[0].display_name);

            if (!userProfile[0].rooms_allowed_in) {
                router.push('/viewChatrooms');
            } else {
                let userAllowedIn = false;

                await userProfile[0].rooms_allowed_in.forEach((roomAllowedIn) => {
                    console.log(roomAllowedIn);
                    if (roomAllowedIn.room_id == uuid) {
                        setAllowedIn(true);
                        userAllowedIn = true;
                    }
                })

                if (!userAllowedIn) {
                    router.push('/viewChatrooms');
                }
            }
        };

        if (session) {
            getChatroomData();
            getUserProfile();
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
            .from(uuid)
            .insert({ content: content, sent_by_name: sent_by_name, sender_uuid: sender_uuid, sent_by_email: sent_by_email })

        if (error) {
            console.log('Error Inserting Message', error);
        }

        setMessageInputValue('');

        const { data: messages } = await supabase
            .from(uuid)
            .select()
            .order('created_at');

        setChatroomData(messages);
    };

    return (
        <>
            {(session && allowedIn) ? 
            <div>
                <h1 style={{color: '#fff'}}>Welcome to Chatroom {chatroomName}</h1> 
                <ul>
                    {chatroomData.map((message) => {
                        return (
                        <li key={message.id}>
                            <p style={{fontSize: '16px', color: '#fff'}}>
                                {`
                                Message Sender: ${message.sent_by_name}, 
                                Message Sender Email: ${message.sent_by_email}, 
                                Message Content: ${message.content}, 
                                Message Id: ${message.id}, 
                                Message Created At: ${message.created_at}, 
                                Message UUID of Sender: ${message.sender_uuid}, 
                                Message Chatroom UUID : ${message.chatroom1_uuid}, 
                                Message Chatroom Name : ${message.chatroom_name}
                                `}
                            </p>
                        </li>
                        );
                    })}
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
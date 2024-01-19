'use client';
import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
export default function Chatroom({ params }) {
    const uuid = params.uuid;
    const router = useRouter();
    const [chatroomData, setChatroomData] = useState([]);
    const [session, setSession] = useState(null);
    
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
            .from('chatroom1_messages')
            .select()
            .order('created_at')

            setChatroomData(messages);
            console.log('posts', messages);
        }

        if (session) {
            getChatroomData();
        }
    }, [session])

    return (
        <>
            {session ? 
            <div>
                <h1 style={{color: '#fff'}}>Welcome to Chatroom {uuid}</h1> 
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
                                Message Chatroom UUID : ${message.chatroom1_uuid}
                                `}
                            </p>
                        </li>
                        );
                    })}
                </ul>
                <form>
                    <input
                        placeholder="Enter a message"
                        value={messageInputValue}
                        onChange={(e) => setMessageInputValue(e.target.value)}
                        required
                    >
                    </input>
                    <button type="submit" >Send Message</button>
                </form>
            </div>
            : null
            }
        </>
    );
}
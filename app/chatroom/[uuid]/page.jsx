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
    const [usersAllowedIn, setUsersAllowedIn] = useState([]);

    const [displayName, setDisplayName] = useState('');

    const [messageInputValue, setMessageInputValue] = useState('');

    const [userToInviteEmail, setUserToInviteEmail] = useState('');
    const [userToInviteId, setUserToInviteId] = useState('');

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
            .select('users_allowed_in, chatroom_name')
            .eq('room_id', uuid)
            
            console.log('chatroom', chatroom);

            if (chatroom[0].users_allowed_in.includes(session.user.id)) {
                setAllowedIn(true);
                setUsersAllowedIn(chatroom[0].users_allowed_in);
                setChatroomName(chatroom[0].chatroom_name);
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

    const handleInviteUser = async (event) => {
        event.preventDefault();

        const retrieveInvitedUsersProfile = async () => {
            const { data: invitedUsersProfile, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_email', userToInviteEmail);

            setUserToInviteId(invitedUsersProfile[0].id);
            console.log('invitedUsersProfile', invitedUsersProfile[0].id);
        };

        const inviteUserById = async () => {
            console.log('usersAllowedIn', usersAllowedIn);
            console.log('userToInviteId', userToInviteId);

            if (!(usersAllowedIn.includes(userToInviteId))) {
                const { error } = await supabase
                .from('chatrooms')
                .update({ users_allowed_in: [...usersAllowedIn, userToInviteId] })
                .eq('room_id', uuid)
                
                setUsersAllowedIn([...usersAllowedIn, userToInviteId]);
            } else {
                alert(`User Already Allowed In ${chatroomName}`);
            }
        };

        await retrieveInvitedUsersProfile();
        await inviteUserById();
    };

    return (
        <>
            {(session && allowedIn) ? 
            <div>
                <h1 style={{color: '#fff'}}>Welcome to {chatroomName}</h1> 
                <ul style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    {chatroomData ? 
                        chatroomData.map((message) => {
                            return (
                                <li key={message.message_id} style={{backgroundColor: 'black'}}>
                                    <p style={{fontSize: '18px', color: '#fff'}}>Message Content: {message.content}</p>
                                    <p style={{fontSize: '18px', color: '#fff'}}>Message Creation Date: {message.created_at}</p>
                                    <p style={{fontSize: '18px', color: '#fff'}}>Message Room Id: {message.room_id}</p>
                                    <p style={{fontSize: '18px', color: '#fff'}}>Message Sender UUID: {message.sender_uuid}</p>
                                    <p style={{fontSize: '18px', color: '#fff'}}>Message Sender's Email: {message.sent_by_email}</p>
                                    <p style={{fontSize: '18px', color: '#fff'}}>Message Sender's Name: {message.sent_by_name}</p>
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
                <form onSubmit={handleInviteUser}>
                    <input
                        placeholder="Enter a User's Email"
                        name="userToInvite"
                        type="email"
                        value={userToInviteEmail}
                        onChange={(e) => setUserToInviteEmail(e.target.value)}
                        required
                    />
                    <button type="submit">Invite User</button>
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
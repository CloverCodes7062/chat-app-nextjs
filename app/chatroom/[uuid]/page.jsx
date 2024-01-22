'use client';
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from '../[uuid]/userChatroom.module.css';

export default function Chatroom({ params }) {
    const uuid = params.uuid;
    const router = useRouter();
    const endOfMessagesRef = useRef(null);

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
            
            if (!chatroom) {
                router.push('/viewChatrooms');
            }

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

        const createRealTimeSubscription = async () => {
            console.log('createRealTime called');
            const channel = supabase
            .channel('messages_db_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                },
                (payload) => {
                    if ((payload.eventType == "INSERT") && (payload.new.room_id == uuid)) {
                        console.log("New Message Inserted Into DB adding to mainUl", payload.new);

                        setChatroomData(prevChatroomData => [...prevChatroomData, payload.new]);

                        if (endOfMessagesRef.current && session.user.email == payload.new.sent_by_email) {
                            console.log(session);
                            console.log(endOfMessagesRef);
                            setTimeout(() => {
                                endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                            }, 100);
                        }
                    }

                    if ((payload.eventType == "DELETE") && (payload.old.room_id == uuid)) {
                        console.log("Message Deleted From DB", payload.old.message_id);
                        
                        setChatroomData(prevChatroomData => prevChatroomData.map((message) => {
                            return (message.message_id == payload.old.message_id ? {...message, isDeleting: true} : message)
                        }));
                    }
                }
            )
            .subscribe()
        }

        if (session) {
            const runTheseIfSession = async () => {
                await checkAllowedIn();
                await getUserProfile();
                await getRoomData();
                await createRealTimeSubscription();
            }

            runTheseIfSession();
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
    };

    const handleInviteUser = async (event) => {
        event.preventDefault();

        const retrieveInvitedUsersProfile = async () => {
            const { data: invitedUsersProfile, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_email', userToInviteEmail);

            if (error) {
                console.error('User not found', error);
            } else {
                setUserToInviteId(invitedUsersProfile[0].id);
                console.log('invitedUsersProfile', invitedUsersProfile[0].id);
            }
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

    const handleDeleteChatMessage = async (event, message_id) => {
        event.preventDefault();
        
        console.log('Delete Message Button Clicked', message_id);

        const { error } = await supabase
        .from('messages')
        .delete()
        .eq('message_id', message_id)

        if (error) {
            console.log('Error deleting message from DB', error);
        } else {
            console.log('Message deleted from DB');
        }
    }

    const handleAnimationEnd = (event, message_id) => {
        const animationName = event.animationName;

        if (animationName == "fadeOut") {
            setChatroomData(prevChatroomData => prevChatroomData.filter(message => message.message_id !== message_id));
        }
    }

    return (
        <>
            {(session && allowedIn) ? 
            <div className={styles.mainSection}>
                <h1 style={{color: '#fff', textAlign: 'center', margin: '0', padding: '0', marginTop: '-15px'}}>Welcome to {chatroomName}</h1> 
                <ul className={styles.mainUl}>
                    {chatroomData.map((message) => {
                        return (
                            <li 
                            className={`animate__animated animate__fadeIn ${message.sent_by_email == session.user.email? `${styles.sentMessage} ${styles.chatMessage} ${message.isDeleting ? "animate__animated animate__fadeOut" : ""}` : `${styles.receivedMessage} ${styles.chatMessage} ${message.isDeleting ? "animate__animated animate__fadeOut" : ""}`}`}
                            onAnimationEnd={(event) => handleAnimationEnd(event, message.message_id)} 
                            key={message.message_id}>
                                {(message.sent_by_email == session.user.email) ? <button onClick={(event) => handleDeleteChatMessage(event, message.message_id)} style={{position: 'absolute', top: '10px', left: '10px', padding: '10px'}}>Delete</button> : null}
                                <p style={{fontSize: '18px', color: '#fff'}}>{message.sent_by_name}</p>
                                <p style={{fontSize: '18px', color: '#fff'}}>{message.content}</p>
                                <p style={{fontSize: '18px', color: '#fff', position: 'absolute', top: '20px', right: '20px'}}>{(new Date(message.created_at)).toLocaleString()}</p>
                            </li>
                        );
                    })}
                    <div ref={endOfMessagesRef} style={{ height: '1px', opacity: 0 }}></div>
                </ul>
                <div style={{marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '25px', alignItems: 'center'}}>
                    <form onSubmit={handleSentMessage} style={{display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center'}}>
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
                    <form onSubmit={handleInviteUser} style={{display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center'}}>
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
                </div>
                <div style={{maxHeight: 'fit-content', maxWidth: 'fit-content', marginLeft: 'auto', marginRight: 'auto'}}>
                    <Link href="/">
                        <button>To Landing Page</button>
                    </Link>
                </div>
            </div>
            : null
            }
        </>
    );
}
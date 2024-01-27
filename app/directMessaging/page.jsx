'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import styles from './directMessaging.module.css';

export default function DirectMessaging() {
    const [usersFriends, setUsersFriends] = useState([]);
    const [usersPendingFriendRequests, setUsersPendingFriendRequests] = useState([]);
    
    const [usersProfile, setUsersProfile] = useState(null);
    const [session, setSession] = useState(null);

    const [currentlyViewFriend, setCurrentlyViewFriend] = useState(null);
    const [currentlyViewFriendMessagesSentToAndFrom, setCurrentlyViewFriendMessagesSentToAndFrom] = useState([]);

    const [messageInputValue, setMessageInputValue] = useState('');

    const router = useRouter();

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

        const body = document.querySelector('body');
        body.style.overflowY = 'hidden';

        checkSession();

    }, [router]);

    useEffect(() => {
        const getUserProfile = async () => {
            const { data: currUsersProfile, error } = await supabase
            .from('profiles')
            .select()
            .eq('id', session.user.id);

            setUsersProfile(currUsersProfile[0]);

            setUsersFriends(currUsersProfile[0].friends);
            setUsersPendingFriendRequests(currUsersProfile[0].pending_friend_requests);
        };

        if (session) {
            const runTheseIfSession = async () => {
                await getUserProfile();
            }

            runTheseIfSession();
        }

    }, [session]);

    const handleFriendClicked = async ({ friendsEmail, friendsUuid, friendsName }) => {
        console.log('friend clicked', friendsUuid, friendsEmail, friendsName);
        setCurrentlyViewFriend({ friendsEmail, friendsUuid, friendsName });

        const getMessagesSentFromAndToCurrFriend = async () => {
            const rawSQL = `
            SELECT * FROM direct_messages
            WHERE 
                (sent_to_uuid = '${session.user.id}' AND sent_from_uuid = '${friendsUuid}')
                OR
                (sent_to_uuid = '${friendsUuid}' AND sent_from_uuid = '${session.user.id}')
            `;

            const { data: sentFromAndToCurrFriend, error } = await supabase
                .rpc('get_messages_between_users', { user_id: session.user.id, friend_id: friendsUuid })
                .order('created_at')
            
            
            console.log('sentFromAndToCurrFriend', sentFromAndToCurrFriend);

            setCurrentlyViewFriendMessagesSentToAndFrom(sentFromAndToCurrFriend);
        }

        await getMessagesSentFromAndToCurrFriend();
    };

    const handleSendMessage = async(event) => {
        event.preventDefault();

        console.log('Sent Msg Clicked', messageInputValue);

        const { error } = await supabase
        .from('direct_messages')
        .insert({ sent_from_uuid: session.user.id, sent_to_uuid: currentlyViewFriend.friendsUuid, message: messageInputValue })

        if (error) {
            console.log('Error Inserting Message', error);
        }

        console.log('Message Sent');
        setMessageInputValue('');
    };

    const handleDelMessageClick = async(event, messageId) => {
        event.preventDefault();
        console.log('Del Message Clicked', messageId);

        const { error } = await supabase
        .from('direct_messages')
        .delete()
        .eq('message_id', messageId)
    };

    return (
        <div style={{ width: '99dvw', height: '99dvh' }}>
            {usersFriends ?
            <div style={{ display: 'grid', gridTemplateColumns: '300px auto', width: '100%', height: '100%' }}>
                <div>
                    <h1>Friends</h1>
                    <ul>
                        {usersFriends.map((friend, index) => {
                            return (
                                <li key={index}>
                                    <p onClick={() => handleFriendClicked({ friendsEmail: friend.email, friendsUuid: friend.uuid, friendsName: friend.display_name })} style={{ cursor: 'pointer' }}>{friend.email}</p>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                {currentlyViewFriend ? 
                (<div style={{ display: 'grid', paddingLeft: '10px', gridTemplateRows: 'fit-content(100%) 1fr fit-content(100%)', overflow: 'hidden' }}>
                    <h1>{currentlyViewFriend.friendsName}</h1>
                    <ul style={{ overflowY: 'auto', maxHeight: '85vh', marginTop: 'auto', listStyle: 'none', padding: '0' }}>
                        {currentlyViewFriendMessagesSentToAndFrom.map((message, index) => {
                            return (
                                <li key={index} style={{ display: 'flex', alignItems: 'center', paddingLeft: '25px', paddingRight: '25px', position: 'relative' }} className={message.sent_from_uuid == session.user.id ? `${styles.chatMessage} ${styles.sentMessage}` : `${styles.chatMessage} ${styles.receivedMessage}`}>
                                    <div>
                                        <h3>{message.sent_from_uuid == session.user.id ? `${usersProfile.display_name}`: `${currentlyViewFriend.friendsName}`}</h3>
                                        <p>{message.message}</p>
                                    </div>
                                    <div style={{ top: '10px', right: '25px', position: 'absolute', display: 'flex', gap: '10px' }}>
                                        {message.sent_from_uuid == session.user.id ?
                                        <button className={styles.deleteMessageBtn} onClick={(event) => handleDelMessageClick(event, message.message_id)}>
                                            Delete
                                        </button>
                                        : null}
                                        <p style={{ padding: '0', margin: '0' }}>
                                            {(new Date(message.created_at)).toLocaleString()}
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    <form onSubmit={(event) => handleSendMessage(event)} style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                        <input 
                            placeholder="Enter a Message"
                            style={{ paddingRight: '50px' }}
                            value={messageInputValue}
                            onChange={(e) => setMessageInputValue(e.target.value)}
                            required
                        />
                        <button style={{
                            minWidth: 'unset',
                            padding: '10px',
                            position: 'absolute',
                            right: '0',
                            top: '0',
                            height: '100%',
                            border: 'none',
                            borderRadius: '15px',
                            background: 'none',
                            cursor: 'pointer',
                            width: 'fit-content',
                            backgroundColor: '#fff',
                            boxShadow: 'unset'
                        }}>
                            <FontAwesomeIcon icon={faPaperPlane} className={styles.sentMessageIcon} />
                        </button>
                    </form>
                </div>)
                : null}
            </div>
            : null}
            {/* usersPendingFriendRequests ? 
            <div>
                <h1>Pending Friend Requests</h1>
                <ul>
                    {usersPendingFriendRequests.map((pendingFriendRequest) => {
                        return (
                            <li>
                                <p style={{ cursor: 'pointer' }}>{pendingFriendRequest.email}</p>
                            </li>
                        );
                    })}
                </ul>
            </div>
            : null */}
        </div>
    );
}
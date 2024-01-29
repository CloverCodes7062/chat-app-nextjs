'use client';

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import styles from './directMessaging.module.css';

export default function DirectMessaging() {
    const [usersFriends, setUsersFriends] = useState([]);
    const [usersPendingFriendRequests, setUsersPendingFriendRequests] = useState([]);
    
    const [renderUsersFriends, setRenderUsersFriends] = useState(true);
    const [renderPendingFriends, setRenderPendingFriends] = useState(false);

    const [usersProfile, setUsersProfile] = useState(null);
    const [session, setSession] = useState(null);

    const [currentlyViewFriend, setCurrentlyViewFriend] = useState(null);
    const [currentlyViewFriendMessagesSentToAndFrom, setCurrentlyViewFriendMessagesSentToAndFrom] = useState([]);

    const [messageInputValue, setMessageInputValue] = useState('');

    const [friendRequestEmailValue, setFriendRequestEmailValue] = useState('');

    const endOfMessagesRef = useRef(null);

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
            const response = await fetch(`/api/getCurrUsersProfile?userId=${session.user.id}`);
            const currUsersProfile = await response.json();

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

    useEffect(() => {
        const createRealTimeSubscription = async () => {
            console.log('createRealTimeSubscription called');
            const channel = supabase
            .channel('direct_messages_db_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'direct_messages',
                },
                (payload) => {
                    console.log('payload', payload);

                    if (currentlyViewFriend) {
                        console.log('currentlyViewFriend', currentlyViewFriend);
                        
                        console.log('currentlyViewFriend.friendsUuid', currentlyViewFriend.friendsUuid);
                        if (payload.eventType == "INSERT" && payload.new.sent_from_uuid == session.user.id && payload.new.sent_to_uuid == currentlyViewFriend.friendsUuid) {
                            console.log("Detecting that you've sent a message");
                            setCurrentlyViewFriendMessagesSentToAndFrom(prevMessages => [...prevMessages, payload.new])

                            if (endOfMessagesRef.current) {
                                setTimeout(() => {
                                    endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                }, 100);
                            }
                        }

                        if (payload.eventType == "INSERT" && payload.new.sent_from_uuid == currentlyViewFriend.friendsUuid && payload.new.sent_to_uuid == session.user.id) {
                            console.log("Detecting that you've received a message");
                            setCurrentlyViewFriendMessagesSentToAndFrom(prevMessages => [...prevMessages, payload.new])
                        }

                        if (payload.eventType == "DELETE") {
                            console.log("Message Deleted From DB", payload.old.message_id);
                            
                            setCurrentlyViewFriendMessagesSentToAndFrom(prevMessages => prevMessages.map((message) => {
                                return (message.message_id == payload.old.message_id ? {...message, isDeleting: true} : message)
                            }));
                        }
                    }
                }
            )
            .subscribe()
        }

        if (currentlyViewFriend) {
            createRealTimeSubscription();
        }
    }, [currentlyViewFriend]);

    const handleFriendClicked = async ({ friendsEmail, friendsUuid, friendsName }) => {
        console.log('friend clicked', friendsUuid, friendsEmail, friendsName);
        setCurrentlyViewFriend({ friendsEmail, friendsUuid, friendsName });

        const getMessagesSentFromAndToCurrFriend = async () => {
            const response = await fetch(`/api/getDirectMessagesSentToAndFrom?userId=${session.user.id}&friendsUuid=${friendsUuid}`);
            const sentFromAndToCurrFriend = await response.json();

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

    
    const handleAnimationEnd = async (event, message_id) => {
        const animationName = event.animationName;

        if (animationName == "fadeOut") {
            setCurrentlyViewFriendMessagesSentToAndFrom(prevMessages => prevMessages.filter(message => message.message_id !== message_id));
        }
    }

    const handlePendingFriendHover = async (event) => {
        console.log('Pending Friend Hovered Over', event.target);
    }

    const handleAcceptFriendRequest = async ({ pendingFriendsUuid, pendingFriendsEmail, pendingFriendsDisplayName }) => {
        console.log('Accepting Friend Request', pendingFriendsUuid, pendingFriendsEmail, pendingFriendsDisplayName);

        console.log('usersProfile', usersProfile);

        const updateCurrentUsersFriends = async () => {
            const { data: currentFriends, error: currentFriendsError } = await supabase
            .from('profiles')
            .select('friends')
            .eq('id', session.user.id)
        
            if (currentFriendsError) {
                console.error(currentFriendsError);
            }
    
            console.log(currentFriends[0].friends);
            const updatedCurrentFriends = [...(currentFriends[0].friends || []), { display_name: pendingFriendsDisplayName, email: pendingFriendsEmail, uuid: pendingFriendsUuid }];
            console.log('updated currentFriends', updatedCurrentFriends);
    
            const { error: updateError } = await supabase
            .from('profiles')
            .update({ friends: updatedCurrentFriends })
            .eq('id', session.user.id);
    
            if (updateError) {
                console.error(updateError);
            }
        }

        const updateCurrentUsersPendingFriends = async () => {
            const { data: pendingFriends, error: pendingFriendsError } = await supabase
            .from('profiles')
            .select('pending_friend_requests')
            .eq('id', session.user.id)
    
            if (pendingFriendsError) {
                console.error(pendingFriendsError);
            }
    
            console.log(pendingFriends[0].pending_friend_requests);
            const updatedPendingFriends = pendingFriends[0].pending_friend_requests.filter(pendingFriend => pendingFriend.uuid != pendingFriendsUuid);
            console.log('updated pendingFriends', updatedPendingFriends);

            const { error: updateError } = await supabase
            .from('profiles')
            .update({ pending_friend_requests: updatedPendingFriends })
            .eq('id', session.user.id);
    
            if (updateError) {
                console.error(updateError);
            }
        }

        const updatePendingFriendRequestsFriends = async () => {
            const { data: pendingFriendRequestFriends, error: pendingFriendRequestError } = await supabase
            .from('profiles')
            .select('friends')
            .eq('id', pendingFriendsUuid)

            if (pendingFriendRequestError) {
                console.error(pendingFriendRequestError);
            }

            console.log(pendingFriendRequestFriends[0].friends);
            const updatedPendingFriendRequestFriends = [...(pendingFriendRequestFriends[0].friends || []), { display_name: usersProfile.display_name, email: session.user.email, uuid: session.user.id }];
            console.log('updated pendingFriendRequestFriends', updatedPendingFriendRequestFriends);

            const { error: updateError } = await supabase
            .from('profiles')
            .update({ friends: updatedPendingFriendRequestFriends })
            .eq('id', pendingFriendsUuid);
    
            if (updateError) {
                console.error(updateError);
            }
        }

        await updateCurrentUsersFriends();
        await updateCurrentUsersPendingFriends();
        await updatePendingFriendRequestsFriends();
    }

    const handleSendingFriendRequest = async (event) => {
        event.preventDefault();

        console.log('friendRequestEmailValue', friendRequestEmailValue);

        const { data: pendingFriends, error } = await supabase
        .from('profiles')
        .select('pending_friend_requests')
        .eq('user_email', friendRequestEmailValue)

        const updatedPendingFriends = [...(pendingFriends[0].pending_friend_requests || []), { display_name: usersProfile.display_name, email: session.user.email, uuid: session.user.id, profile_picture: usersProfile.profile_picture }];

        const { error: updateError } = await supabase
        .from('profiles')
        .update({ pending_friend_requests: updatedPendingFriends })
        .eq('user_email', friendRequestEmailValue);

        setFriendRequestEmailValue('');
    };

    return (
        <div style={{ width: '99dvw', height: '99dvh' }}>
            {(usersFriends || session) ?
            <div style={{ display: 'grid', gridTemplateColumns: '400px auto', width: '100%', height: '100%' }}>
                <div className={styles.section}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '20px' }}>
                        <h2 
                            className={styles.directMessagingH2}
                            onClick={() => setRenderUsersFriends(true)}
                        >
                            Friends
                        </h2>
                        <div style={{ width: '2px', height: '100%', borderRight: '2px solid rgba(255, 255, 255, .2)' }}/>
                        <h2 
                            className={styles.directMessagingH2}
                            onClick={() => setRenderUsersFriends(false)}
                        >
                            Pending Friend Requests
                        </h2>
                    </div>
                    <form onSubmit={(event) => handleSendingFriendRequest(event)} style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                        <input 
                            placeholder="Enter a User's Email"
                            style={{ width: '335px' }}
                            type="email"
                            value={friendRequestEmailValue}
                            onChange={(e) => setFriendRequestEmailValue(e.target.value)}
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
                    {renderUsersFriends ? 
                    <ul style={{ width: '100%', margin: 0, padding: 0, marginTop: '15px' }}>
                        {usersFriends ? usersFriends.map((friend, index) => {
                            return (
                                <li key={index} className={`${styles.listItem} ${styles.listItemNotFirst}`} onClick={() => handleFriendClicked({ friendsEmail: friend.email, friendsUuid: friend.uuid, friendsName: friend.display_name })} style={{ cursor: 'pointer', display: 'flex', gap: '20px' }} >
                                    <img src={friend.profile_picture} width={75} height={75} style={{ borderRadius: '50%' }}/>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <p style={{ width: 'fit-content', fontWeight: 'bold', fontSize: '20px', margin: 0, padding: 0 }}>
                                            {friend.display_name}
                                        </p>
                                    </div>
                                </li>
                            );
                        }) : null}
                    </ul>
                    : 
                    <ul>
                        {usersPendingFriendRequests ? usersPendingFriendRequests.map((pendingFriend, index) => {
                            return (
                                <li key={index} style={{ width: 'fit-content' }}>
                                    <p style={{ cursor: 'pointer', width: 'fit-content' }} onMouseEnter={(event) => handlePendingFriendHover(event)}>{pendingFriend.display_name}</p>
                                    <div>
                                        <button onClick={() => handleAcceptFriendRequest({ pendingFriendsUuid: pendingFriend.uuid, pendingFriendsEmail: pendingFriend.email, pendingFriendsDisplayName: pendingFriend.display_name })}>Accept</button>
                                        <button>Decline</button>
                                    </div>
                                </li>
                            );
                        }) : null}
                    </ul>
                    }
                </div>
                {currentlyViewFriend ? 
                (<div style={{ display: 'grid', paddingLeft: '10px', gridTemplateRows: 'fit-content(100%) 1fr fit-content(100%)', overflow: 'hidden' }}>
                    <h1>{currentlyViewFriend.friendsName}</h1>
                    <ul style={{ overflowY: 'auto', maxHeight: '85vh', marginTop: 'auto', listStyle: 'none', padding: '0' }}>
                        {currentlyViewFriendMessagesSentToAndFrom.map((message, index) => {
                            return (
                                <li key={index} style={{ display: 'flex', alignItems: 'center', paddingLeft: '25px', paddingRight: '25px', position: 'relative' }} className={message.sent_from_uuid == session.user.id ? `${message.isDeleting ? "animate__animated animate__fadeOut" : ""} animate__animated animate__fadeIn ${styles.chatMessage} ${styles.sentMessage}` : `${message.isDeleting ? "animate__animated animate__fadeOut" : ""} animate__animated animate__fadeIn ${styles.chatMessage} ${styles.receivedMessage}`} onAnimationEnd={(event) => handleAnimationEnd(event, message.message_id)}>
                                    <div>
                                        <h3>{message.sent_from_uuid == session.user.id ? `${usersProfile.display_name}`: `${currentlyViewFriend.friendsName}`}</h3>
                                        <p>{message.message}</p>
                                    </div>
                                    {message.sent_from_uuid == session.user.id ?
                                    <button className={styles.deleteMessageBtn} onClick={(event) => handleDelMessageClick(event, message.message_id)}>
                                        Delete
                                    </button>
                                    : null}
                                    <p style={{ padding: '0', margin: '0', position: 'absolute', top: '10px', right: '75px' }}>
                                        {(new Date(message.created_at)).toLocaleString()}
                                    </p>
                                </li>
                            );
                        })}
                        <div ref={endOfMessagesRef} style={{ height: '1px', opacity: 0 }}></div>
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
        </div>
    );
}
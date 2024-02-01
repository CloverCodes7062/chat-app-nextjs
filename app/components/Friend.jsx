import { supabase } from "@/supabaseClient";
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import styles from '../directMessaging/directMessaging.module.css';
import { useFriends } from "../layout";

export default function Friend({ friendUuid, session, usersProfile, renderOnlyFriendsChild }) {
    const [friendsProfile, setFriendsProfile] = useState(null);

    const [renderCurrentlyViewFriend, setRenderCurrentlyViewFriend] = useState(false);
    const [currentlyViewFriend, setCurrentlyViewFriend] = useState(null);

    const [currentlyViewFriendMessagesSentToAndFrom, setCurrentlyViewFriendMessagesSentToAndFrom] = useState([]);

    const [messageInputValue, setMessageInputValue] = useState('');

    const endOfMessagesRef = useRef(null);

    const { activeFriendUuid, setActiveFriend } = useFriends();

    console.log('activeFriendUuid', activeFriendUuid);

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

    const getFriendProfileFromUuid = async () => {
        const { data: profile, error } = await supabase
        .from('profiles')
        .select()
        .eq('id', friendUuid)

        if (error) {
            console.log(error);
        } else {
            console.log('profile[0]', profile[0]);
            setFriendsProfile(profile[0]);
        }
    };

    useEffect(() => {
        getFriendProfileFromUuid();
    }, []);


    const handleFriendClicked = async ({ friendsEmail, friendsUuid, friendsName }) => {
        console.log('friend clicked', friendsUuid, friendsEmail, friendsName);

        setActiveFriend(friendsUuid);
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

    return (
        <>
        {friendsProfile ?
            <>  
                {renderOnlyFriendsChild ?
                null
                :
                <li className={`${styles.listItem} ${styles.listItemNotFirst}`} onClick={() => handleFriendClicked({ friendsEmail: friendsProfile.user_email, friendsUuid: friendsProfile.id, friendsName: friendsProfile.display_name })} style={{ cursor: 'pointer', display: 'flex', gap: '20px' }} >
                    <img src={friendsProfile.profile_picture} width={75} height={75} style={{ borderRadius: '50%' }}/>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <p style={{ width: 'fit-content', fontWeight: 'bold', fontSize: '20px', margin: 0, padding: 0 }}>
                            {friendsProfile.display_name}
                        </p>
                    </div>
                </li>}
                { (activeFriendUuid === friendUuid && currentlyViewFriend) ? 
                    <div id="currentlyViewFriend" style={{ display: 'grid', paddingLeft: '10px', gridTemplateRows: 'fit-content(100%) 1fr fit-content(100%)', overflow: 'hidden', position: 'fixed', top: '2px', right: '25px', width: '76.5dvw', height: '98dvh' }}>
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
                    </div>
                    : null}
            </>
            : null}
        </>
    );
}
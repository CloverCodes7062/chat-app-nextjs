'use client';

import { useRouter } from "next/navigation";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import styles from './directMessaging.module.css';
import Friend from "../components/Friend";

export default function DirectMessaging() {
    const [usersFriends, setUsersFriends] = useState([]);
    const [usersPendingFriendRequests, setUsersPendingFriendRequests] = useState([]);

    const [renderOnlyFriendsChild, setRenderOnlyFriendsChild] = useState(false);

    const [usersProfile, setUsersProfile] = useState(null);
    const [session, setSession] = useState(null);

    const [friendRequestEmailValue, setFriendRequestEmailValue] = useState('');

    const [renderNoUserFound, setRenderNoUserFound] = useState(false);

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

        if (pendingFriends.length < 1) {
            console.log('Error while sending friend request', error);
            setRenderNoUserFound(true);

            setTimeout(() => {
                setRenderNoUserFound(false);
            }, 3000);
        } else {
            const updatedPendingFriends = [...(pendingFriends[0].pending_friend_requests || []), { display_name: usersProfile.display_name, email: session.user.email, uuid: session.user.id, profile_picture: usersProfile.profile_picture }];

            const { error: updateError } = await supabase
            .from('profiles')
            .update({ pending_friend_requests: updatedPendingFriends })
            .eq('user_email', friendRequestEmailValue);
        }

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
                            onClick={() => setRenderOnlyFriendsChild(false)}
                        >
                            Friends
                        </h2>
                        <div style={{ width: '2px', height: '100%', borderRight: '2px solid rgba(255, 255, 255, .2)' }}/>
                        <h2 
                            className={styles.directMessagingH2}
                            onClick={() => setRenderOnlyFriendsChild(true)}
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
                    {renderNoUserFound ? 
                    <p>No User Found With That Email</p>
                    : null}
                    {renderOnlyFriendsChild ?
                    <>
                        <ul style={{ width: '100%', margin: 0, padding: 0, marginTop: '15px' }}>
                            {usersFriends ? usersFriends.map((friend, index) => {
                                return (
                                    <Friend renderOnlyFriendsChild={renderOnlyFriendsChild} friendUuid={friend.uuid} session={session} usersProfile={usersProfile} key={index} />
                                );
                            }) : null}
                        </ul>
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
                    </>
                    :
                    <>
                        <ul style={{ width: '100%', margin: 0, padding: 0, marginTop: '15px' }}>
                            {usersFriends ? usersFriends.map((friend, index) => {
                                return (
                                    <Friend friendUuid={friend.uuid} session={session} usersProfile={usersProfile} key={index} />
                                );
                            }) : null}
                        </ul>
                    </>}
                </div>
            </div>
            : null}
        </div>
    );
}
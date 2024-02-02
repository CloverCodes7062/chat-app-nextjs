'use client';

import Link from 'next/link';
import "./globals.css";
import 'animate.css';
import styles from './landingPage.module.css';
import { createContext, useContext, useState } from 'react';

export const NavStyleContext = createContext();

const FriendsContext = createContext();

export const useFriends = () => useContext(FriendsContext);

const FriendsProvider = ({ children }) => {
    const [activeFriendUuid, setActiveFriendUuid] = useState(null);

    const setActiveFriend = (uuid) => {
        setActiveFriendUuid(uuid)
    }

    return (
        <FriendsContext.Provider value={{ activeFriendUuid, setActiveFriend }}>
            {children}
        </FriendsContext.Provider>
    );
}

export default function RootLayout({ children }) {
    const [renderNav, setRenderNav] = useState(false);
    const [navClass, setNavClass] = useState('animate__animated animate__fadeIn');
    const [navStyles, setNavStyles] = useState({ zIndex: '150', width: '300px', height: 'fit-content', position: 'absolute', top: '1vh', right: '3vw', display: 'flex', flexDirection: 'column', gap: '15px' });

    const handleMenuClick = async () => {
        if (renderNav) {
            setNavClass('animate__animated animate__fadeOutRight');
            setTimeout(() => {
                setRenderNav(false);
            }, 500);
        } else {
            setNavClass('animate__animated animate__fadeInRight');
            setRenderNav(true);
        }

        const body = document.querySelector('body');
        body.style.overflowX = 'hidden';

        setTimeout(() => {
            body.style.overflowX = 'auto';
        }, 500);
    };

    const navStyleValue = { navStyles, setNavStyles };
    return (
        <FriendsProvider>
            <NavStyleContext.Provider value={navStyleValue}>
                <html>
                    <body>
                        <p className={styles.navBarP} onClick={handleMenuClick}>&#9776;</p>
                        {renderNav ?
                        <nav className={navClass} style={navStyles}>
                            <a href='/signedOut' style={{ display: 'flex', justifyContent: 'center', width: '100%', maxWidth: 'unset', height: 'fit-content', position: 'relative', zIndex: 125 }}><button>Signout</button></a>
                            <a href='/viewChatrooms' style={{ display: 'flex', justifyContent: 'center', width: '100%', maxWidth: 'unset', height: 'fit-content', position: 'relative', zIndex: 125 }}><button>View Chatrooms</button></a>
                            <a href='/directMessaging' style={{ display: 'flex', justifyContent: 'center', width: '100%', maxWidth: 'unset', height: 'fit-content', position: 'relative', zIndex: 125 }}><button>Send a Direct Message</button></a>
                            <a href='/editProfile' style={{ display: 'flex', justifyContent: 'center', width: '100%', maxWidth: 'unset', height: 'fit-content', position: 'relative', zIndex: 125 }}><button>Edit Profile</button></a>
                        </nav>
                        : null}
                        {children}
                    </body>
                </html>
            </NavStyleContext.Provider>
        </FriendsProvider>
    );
}
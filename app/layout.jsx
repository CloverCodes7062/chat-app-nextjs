'use client';

import Link from 'next/link';
import "./globals.css";
import 'animate.css';
import styles from './landingPage.module.css';

import { useState } from 'react';

export default function RootLayout({ children }) {
    const [renderNav, setRenderNav] = useState(false);
    const [navClass, setNavClass] = useState('animate__animated animate__fadeIn');

    const handleMenuClick = async () => {
        if (renderNav) {
            setNavClass('animate__animated animate__fadeOut');
            setTimeout(() => {
                setRenderNav(false);
            }, 500);
        } else {
            setNavClass('animate__animated animate__fadeIn');
            setRenderNav(true);
        }
    };

    return (
        <html>
            <body>
                <p className={styles.navBarP} onClick={handleMenuClick}>&#9776;</p>
                {renderNav ?
                <nav className={navClass} style={{ width: 'fit-content', height: 'fit-content', position: 'absolute', top: '1vh', right: '3vw', display: 'flex', gap: '15px'}}>
                    <a href='/signedOut' style={{ width: 'fit-content', height: 'fit-content', marginLeft: 'auto', position: 'relative', zIndex: 125 }}><button>Signout</button></a>
                    <a href='/viewChatrooms' style={{ width: 'fit-content', height: 'fit-content', marginLeft: 'auto', position: 'relative', zIndex: 125 }}><button>View Chatrooms</button></a>
                    <a href='/directMessaging' style={{ width: 'fit-content', height: 'fit-content', marginLeft: 'auto', position: 'relative', zIndex: 125 }}><button>Send a Direct Message</button></a>
                    <a href='/editProfile' style={{ width: 'fit-content', height: 'fit-content', marginLeft: 'auto', position: 'relative', zIndex: 125 }}><button>Edit Profile</button></a>
                </nav>
                : null}
                {children}
            </body>
        </html>
    );
}
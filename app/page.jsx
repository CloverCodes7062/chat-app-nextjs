'use client';
import Link from 'next/link';
import { supabase } from '@/supabaseClient';
import styles from './landingPage.module.css';

export default function HomePage() {
    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.log('Error signing user out');
        } else {
            console.log('Signed out');
        }
    };

    const checkSession = async () => {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.log('Error checking session:', error);
        } else {
            console.log('Session:', data.session);
        }
    };

    const btnContainerStyles = { display: 'flex', flexDirection: 'column', 
                                gap: '20px', marginTop: 'auto', marginBottom: 'auto', 
                                justifyContent: 'center', alignItems: 'center' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '12.5px' }}>
            <div className={styles.horizontalNavBar}>
                <h1 style={{ margin: 0, marginLeft: '75px', color: '#fff', padding: 0, fontWeight: 'bolder' }}>Clover's Chat App</h1>
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%', height: '100%', position: 'absolute', gap: '50px' }}>
                    <Link href='/'>
                        <button>Home</button>
                    </Link>
                    <Link href='/home'>
                        <button>Home</button>
                    </Link>
                    <Link href='/home'>
                        <button>Home</button>
                    </Link>
                    <Link href='/home'>
                        <button>Home</button>
                    </Link>
                </div>
            </div>
            <div style={btnContainerStyles}>
                <Link href="/login">
                    <button>Login</button>
                </Link>
                <Link href="/register">
                    <button>Register</button>
                </Link>
                <Link href="/viewChatrooms">
                    <button>View Chatrooms</button>
                </Link>
                <button onClick={handleSignOut}>Sign Out</button>
                <button onClick={checkSession}>Check Session</button>  
            </div>
        </div>
    );
}
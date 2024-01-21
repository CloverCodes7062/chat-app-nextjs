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
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <h1 style={{ color: '#fff', textAlign: 'center' }}>Chat App Landing Page</h1>
            <div style={btnContainerStyles}>
                <Link href="/login">
                    <button className={styles.btn}>Login</button>
                </Link>
                <Link href="/register">
                    <button className={styles.btn}>Register</button>
                </Link>
                <Link href="/viewChatrooms">
                    <button className={styles.btn}>View Chatrooms</button>
                </Link>
                <button className={styles.btn} onClick={handleSignOut}>Sign Out</button>
                <button className={styles.btn} onClick={checkSession}>Check Session</button>  
            </div>
        </div>
    );
}
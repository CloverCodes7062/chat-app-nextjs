'use client';
import Link from 'next/link';
import { supabase } from '@/supabaseClient';

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

    return (
        <div>
            <h1>Placeholder Landing Page</h1>
            <p>
                Welcome to the placeholder landing page
            </p>
            <div style={{display: "flex", gap: "20px"}}>
                <Link href="/login">
                    <button>Login</button>
                </Link>
                <Link href="/register">
                    <button>Register</button>
                </Link>
                <button onClick={handleSignOut}>Sign Out</button>
                <button onClick={checkSession}>Check Session</button>
            </div>
        </div>
    );
}
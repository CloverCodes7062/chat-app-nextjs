'use client';
import Link from 'next/link';
import { supabase } from '@/supabaseClient';
import { useState } from 'react';
import { redirect, useRouter } from 'next/navigation';

export default function Login() {
    const [emailValue, setEmailValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('');
    const router = useRouter();
    
    const handleLogin = async (event) => {
        event.preventDefault();
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: event.target.email.value,
            password: event.target.password.value,
        
        });

        if (error) {
            console.error('Error logging in:', error);
        } else {
            console.log('User logged in:', data);
            router.push('/viewChatrooms');
        }

        setEmailValue('');
        setPasswordValue('');
    };

    return (
        <div>
            <h1>Placeholder Login Page</h1>
            <p>
                Welcome to the Placeholder Login Page
            </p>
            <form onSubmit={handleLogin}>
                <div className="input-box">
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Email"
                        value={emailValue}
                        onChange={(e) => {setEmailValue(e.target.value)}} 
                        required
                    />
                </div>
                <div className="input-box">
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Password" 
                        value={passwordValue}
                        onChange={(e) => {setPasswordValue(e.target.value)}}
                        required
                    />
                </div>
                <button type='submit'>Login</button>
            </form>
            <Link href="/">
                <button>Back to Landing Page</button>
            </Link>
        </div>
    );
}
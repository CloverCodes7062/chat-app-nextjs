'use client';
import Link from 'next/link';
import { supabase } from '@/supabaseClient';
import { useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import styles from './login.module.css';

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
        <div className={styles.section}>
            <form onSubmit={handleLogin} style={{ width: '100%', marginTop: 'auto', marginBottom: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1 style={{ textAlign: 'center' }}>Login</h1>
                <div className="input-box" style={{ marginBottom: '20px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Email"
                        value={emailValue}
                        onChange={(e) => {setEmailValue(e.target.value)}} 
                        required
                        style={{ width: '60%', fontSize: '16px', height: '25px' }}
                    />
                </div>
                <div className="input-box" style={{ marginBottom: '20px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Password" 
                        value={passwordValue}
                        onChange={(e) => {setPasswordValue(e.target.value)}}
                        required
                        style={{ width: '60%', fontSize: '16px', height: '25px' }}
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
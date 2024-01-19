'use client';
import Link from 'next/link';
import { supabase } from '@/supabaseClient';
import { useState } from 'react';
import { redirect, useRouter } from 'next/navigation';

export default function Register() {
    const [emailValue, setEmailValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('');
    const router = useRouter();

    const handleRegister = async (event) => {
        event.preventDefault();

        const { data, error } = await supabase.auth.signUp({
            email: emailValue,
            password: passwordValue,
        
        });

        if (error) {
            console.error('Error signing up:', error);
        } else {
            console.log('User signed up', data);
            router.push('/login');
        }

        setEmailValue('');
        setPasswordValue('');
    };

    return (
        <div>
            <h1>Placeholder Register Page</h1>
            <p>
                Welcome to the Placeholder Register Page
            </p>
            <form onSubmit={handleRegister}>
                <div className="input-box">
                    <input 
                        type="text" 
                        name="name" 
                        placeholder="Name" 
                        required
                    />
                </div>
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
                <button type='submit'>Register</button>
            </form>
            <Link href="/">
                <button>Back to Landing Page</button>
            </Link>
        </div>
    );
}
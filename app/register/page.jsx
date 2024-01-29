'use client';
import Link from 'next/link';
import { supabase } from '@/supabaseClient';
import { useState } from 'react';
import { redirect, useRouter } from 'next/navigation';

export default function Register() {
    const [emailValue, setEmailValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('');
    const [nameValue, setNameValue] = useState('');

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
            const createUserProfile = async () => {
                const { error } = await supabase
                .from('profiles')
                .insert({ id: data.user.id, display_name: nameValue, rooms_allowed_in: [{"room_id":"2d03c198-ce3a-43ec-9aab-043fa2a2fcc7","room_name":"chatroom1"}] })
    
                setNameValue('');
            };
            
            await createUserProfile();
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
                        value={nameValue}
                        onChange={(e) => {setNameValue(e.target.value)}} 
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
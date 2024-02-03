'use client';
import Link from 'next/link';
import { supabase } from '@/supabaseClient';
import { useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import styles from './register.module.css';

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
        }

        setEmailValue('');
        setPasswordValue('');
    };

    return (
        <div className={styles.section}>
            <form onSubmit={handleRegister} style={{ width: '100%', marginTop: 'auto', marginBottom: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1 style={{ textAlign: 'center' }}>Register</h1>
                <div className="input-box" style={{ marginBottom: '20px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <input 
                        type="text" 
                        name="name" 
                        placeholder="Name"
                        value={nameValue}
                        onChange={(e) => {setNameValue(e.target.value)}} 
                        required
                        style={{ width: '60%', fontSize: '16px', height: '25px' }}
                    />
                </div>
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
                <button type='submit'>Register</button>
            </form>
            <Link href="/">
                <button>Back to Landing Page</button>
            </Link>
        </div>
    );
}
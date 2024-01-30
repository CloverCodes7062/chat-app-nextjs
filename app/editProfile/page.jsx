'use client';
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from './editProfile.module.css';

export default function editProfile() {
    const router = useRouter();
    const [session, setSession] = useState(null);
    
    const [newDisplayName, setNewDisplayNameValue] = useState('');
    const [newEmail, setNewEmailValue] = useState('');
    const [newPassword, setNewPasswordValue] = useState('');

    const [newProfilePicture, setNewProfilePictureValue] = useState(null);

    useEffect(() => {
        const checkSession = async () => {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error checking session:', error);
            } else {
                console.log('Session:', data.session);
            }

            if (!data.session) {
                router.push('/login');
            } else {
                setSession(data.session);
            }
        };

        checkSession();

    }, [router]);

    const handleEditProfileFormSubmit = async (event) => {
        event.preventDefault();

        console.log(newDisplayName, newEmail, newPassword, newProfilePicture);
    };

    return(
        <>
        {session ? 
        <div style={{ display: 'grid', width: '100%', gridTemplateColumns: '500px 1fr 500px' }}>
            <div></div>
            <div className={styles.section}>
                <h1>View Profile</h1>
                <form className={styles.editProfileForm} onSubmit={(event) => handleEditProfileFormSubmit(event)}>
                    <input 
                        placeholder="Enter A New Display Name"
                        value={newDisplayName}
                        onChange={(e) => setNewDisplayNameValue(e.target.value)}
                    />
                    <input 
                        placeholder="Enter A New Email"
                        value={newEmail}
                        onChange={(e) => setNewEmailValue(e.target.value)}
                        type="email"
                    />
                    <input 
                        placeholder="Enter A Password"
                        value={newPassword}
                        onChange={(e) => setNewPasswordValue(e.target.value)}
                        type="password"
                    />
                    <input 
                        placeholder="Upload A New Profile Picture"
                        value={newProfilePicture}
                        onChange={(e) => setNewProfilePictureValue(e.target.value)}
                        type="file"
                    />
                    <button type="submit">Submit</button>
                </form>
            </div>
            <div></div>
        </div> 
        : null}
        </>
    );
}
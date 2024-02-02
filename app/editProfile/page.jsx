'use client';
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from './editProfile.module.css';

export default function EditProfile() {
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

        console.log(newDisplayName, newPassword, newProfilePicture);

        if (newPassword) {
            const { data, error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) {
                console.log('Error Updating Password,', error);
            }
        }

        if (newDisplayName) {
            const { error } = await supabase
            .from('profiles')
            .update({ display_name: newDisplayName })
            .eq('id', session.user.id)

            if (error) {
                console.log('Error Updating Display Name,', error);
            }
        }

        if (newProfilePicture) {
            console.log(newProfilePicture);

            const { data: updatingProfilePicture, error } = await supabase
            .storage
            .from('profilePictures')
            .upload(`${session.user.id}ProfilePicture`, newProfilePicture, {
                cacheControl: '3600',
                upsert: true
            })

            if (error) {
                console.log('Error changing profile picture,', error);
            }

            
            const { data: publicUrlForProfilePicture } = supabase
            .storage
            .from('profilePictures')
            .getPublicUrl(`${session.user.id}ProfilePicture`)

            console.log('publicUrlForProfilePicture', publicUrlForProfilePicture);

            const { error: updateError } = await supabase
            .from('profiles')
            .update({ profile_picture: publicUrlForProfilePicture.publicUrl })
            .eq('id', session.user.id);

            if (updateError) {
                console.log('Error updating profile picture,', updateError);
            }

        }
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
                        placeholder="Enter A Password"
                        value={newPassword}
                        onChange={(e) => setNewPasswordValue(e.target.value)}
                        type="password"
                    />
                    <input 
                        placeholder="Upload A New Profile Picture"
                        onChange={(e) => setNewProfilePictureValue(e.target.files[0])}
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
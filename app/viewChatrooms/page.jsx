'use client';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ViewChatrooms() {
    const router = useRouter();
    const uuid = uuidv4();
    const [session, setSession] = useState(null);

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

    return (
        <>
            {session ? 
                <div>
                    <h1>View Chatrooms Page</h1>
                    <p>
                    Welcome to the View Chatrooms Page
                    </p>
                    <Link href={`/chatroom/${uuid}`}>
                        <button>To Chatroom {uuid}</button>
                    </Link>
                    <Link href="/">
                        <button>Back to Landing Page</button>
                    </Link>
                </div>
            : null}
        </>
    );
}
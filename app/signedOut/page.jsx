'use client';

import { supabase } from "@/supabaseClient";
import { useState } from "react";

export default function() {
    const [session, setSession] = useState(null);
    const [hasSetSession, setHasSetSession] = useState(false);

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.log('Error signing user out');
        } else {
            console.log('Signed out');
            setSession(null);
            setHasSetSession(true)
        }
    };

    handleSignOut();

    return (
        <>
        {(!session && hasSetSession) ?
            <div>
                <h1>Successfully Signed Out</h1>
            </div>
        :
            null
        }
        </>
    );
}
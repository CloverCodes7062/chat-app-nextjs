'use client';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function Login() {
    return (
        <div>
            <h1>Placeholder Login Page</h1>
            <p>
                Welcome to the Placeholder Login Page
            </p>
            <button onClick={() => signIn('github')}>
                Sign In With GitHub
            </button>
            <Link href="/">
                <button>Back to Landing Page</button>
            </Link>
        </div>
    );
}
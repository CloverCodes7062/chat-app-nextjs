import Link from 'next/link';

export default function HomePage() {
    return (
        <div>
            <h1>Placeholder Landing Page</h1>
            <p>
                Welcome to the placeholder landing page
            </p>
            <div style={{display: "flex", gap: "20px"}}>
                <Link href="/login">
                    <button>Login</button>
                </Link>
                <Link href="/register">
                    <button>Register</button>
                </Link>
            </div>
        </div>
    );
}
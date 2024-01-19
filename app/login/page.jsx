import Link from 'next/link';

export default function Login() {
    return (
        <div>
            <h1>Placeholder Login Page</h1>
            <p>
                Welcome to the Placeholder Login Page
            </p>
            <button>
                Login
            </button>
            <Link href="/">
                <button>Back to Landing Page</button>
            </Link>
        </div>
    );
}
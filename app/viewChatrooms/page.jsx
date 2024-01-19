import Link from 'next/link';

export default function ViewChatrooms() {
    return (
        <div>
            <h1>View Chatrooms Page</h1>
            <p>
                Welcome to the View Chatrooms Page
            </p>
            <Link href="/">
                <button>Back to Landing Page</button>
            </Link>
        </div>
    );
}
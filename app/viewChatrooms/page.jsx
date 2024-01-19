import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';

export default function ViewChatrooms() {
    const uuid = uuidv4();
    
    return (
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
    );
}
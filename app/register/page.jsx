import Link from 'next/link';

export default function Register() {
    return (
        <div>
            <h1>Placeholder Register Page</h1>
            <p>
                Welcome to the Placeholder Register Page
            </p>
            <form>
                <div className="input-box">
                    <input 
                        type="text" 
                        name="name" 
                        placeholder="Name" 
                        required
                    />
                </div>
                <div className="input-box">
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Email" 
                        required
                    />
                </div>
                <div className="input-box">
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Password" 
                        required
                    />
                </div>
                <button>Register</button>
            </form>
            <Link href="/">
                <button>Back to Landing Page</button>
            </Link>
        </div>
    );
}
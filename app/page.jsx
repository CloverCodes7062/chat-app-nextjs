'use client';
import Link from 'next/link';
import { supabase } from '@/supabaseClient';
import styles from './landingPage.module.css';
import Image from 'next/image';

export default function HomePage() {
    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.log('Error signing user out');
        } else {
            console.log('Signed out');
        }
    };

    const checkSession = async () => {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.log('Error checking session:', error);
        } else {
            console.log('Session:', data.session);
        }
    };

    const btnContainerStyles = { display: 'flex', flexDirection: 'column', 
                                gap: '20px', marginTop: 'auto', marginBottom: 'auto', 
                                justifyContent: 'center', alignItems: 'center' };


    return (
        <div className={styles.mainDiv}>
            <div className={`${styles.heroSection} ${styles.section}`}>
                <h1>Welcome to Clover's Chat App!</h1>
                <p>The ultimate real-time chat experience.</p>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <Image width={846} height={413} src='/heroImage1.png' style={{ borderRadius: '15px' }}/>
                    <Image width={846} height={413} src='/heroImage2.png' style={{ borderRadius: '15px' }}/>
                </div>
                <br />
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginLeft: '25px'}}>
                    <Link href='/register'>
                        <button>Get Started</button>
                    </Link>
                    <Link href='https://stacymccarrell.com/' target='_blank'>
                        <button>Other Projects</button>
                    </Link>
                </div>
                
            </div>

            <div className={`${styles.featuresOverview} ${styles.section}`}>
                <h2>Features</h2>
                <ul>
                    <li>Real-Time Messaging</li>
                    <li>Voice & Video Calls</li>
                    <li>Screen Sharing</li>
                    <li>Create & Join Chat Rooms</li>
                    <li>Send Friend Requests</li>
                </ul>
            </div>

            <div className={`${styles.benefitsSection} ${styles.section}`}>
                <h2>Why Choose Clover's Chat App?</h2>
                <p>Connect instantly, share moments, and collaborate effectively.</p>
            </div>

            <div className={`${styles.testimonials} ${styles.section}`}>
                <h2>What Our Users Say</h2>
                <p>"I've never experienced a more seamless chat interaction!" - User A</p>
                <p>"The video call quality is exceptional!" - User B</p>
            </div>

            <div className={`${styles.aboutSection} ${styles.section}`}>
                <h2>About Us</h2>
                <p>Founded by a passionate, aspiring software developer</p>
            </div>

            <div className={`${styles.faqs} ${styles.section}`}>
                <h2>FAQs</h2>
                <p>How do I create a chat room? <br/> Simply click on the 'Create Room' button.</p>
                <p>Is voice and video call supported? <br/> Yes, we offer high-quality voice and video calling features.</p>
            </div>

            <div className={`${styles.footer} ${styles.section}`}>
                <p>Contact Us | Terms of Service | Privacy Policy</p>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '12.5px' }}>
            <div className={styles.horizontalNavBar}>
                <h1 style={{ margin: 0, marginLeft: '75px', color: '#fff', padding: 0, fontWeight: 'bolder' }}>Clover's Chat App</h1>
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%', height: '100%', position: 'absolute', gap: '50px' }}>
                    <Link href='/'>
                        <button>Home</button>
                    </Link>
                    <Link href='/'>
                        <button>Home</button>
                    </Link>
                    <Link href='/'>
                        <button>Home</button>
                    </Link>
                    <Link href='/'>
                        <button>Home</button>
                    </Link>
                </div>
            </div>
            <div style={btnContainerStyles}>
                <Link href="/login">
                    <button>Login</button>
                </Link>
                <Link href="/register">
                    <button>Register</button>
                </Link>
                <Link href="/viewChatrooms">
                    <button>View Chatrooms</button>
                </Link>
                <button onClick={handleSignOut}>Sign Out</button>
                <button onClick={checkSession}>Check Session</button>  
            </div>
        </div>
    );
}
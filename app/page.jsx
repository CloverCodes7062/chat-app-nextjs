'use client';
import Link from 'next/link';
import { supabase } from '@/supabaseClient';
import styles from './landingPage.module.css';
import Image from 'next/image';
import { useContext, useEffect, useRef } from 'react';
import 'animate.css';
import { NavStyleContext } from './layout';

export default function HomePage() {
    const sectionsRef = useRef([]);
    const { navStyles, setNavStyles } = useContext(NavStyleContext);
    
    useEffect(() => {
        const body = document.querySelector('body');
        body.style.overflowX = 'hidden';
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(`${styles.visible}`);
                }
            });
        }, { threshold: 0.1 });

        const sections = sectionsRef.current;

        if (sections) {
            sections.forEach((section) => observer.observe(section));
        }

        setNavStyles(prevStyles => {
            return {...prevStyles, flexDirection: 'unset', right: '30dvw'}
        });

    }, []);

    return (
        <div className={styles.mainDiv}>
            <div className={`${styles.heroSection} ${styles.section}`}>
                <h1>{`Welcome to Clover's Chat App!`}</h1>
                <p>{`The ultimate real-time chat experience.`}</p>
                <div className={styles.homeMainImgDiv}>
                    <img className={'animate__animated animate__fadeInLeft'} src='/heroImage1.png' />
                    <img className={'animate__animated animate__fadeInRight'} src='/heroImage2.png' />
                </div>
                <br />
                <div className={styles.getStartedDiv}>
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
                    <li>{`Real-Time Messaging`}</li>
                    <li>{`Voice & Video Calls`}</li>
                    <li>{`Screen Sharing`}</li>
                    <li>{`Create & Join Chat Rooms`}</li>
                    <li>{`Send Friend Requests`}</li>
                </ul>
            </div>

            <div ref={element => sectionsRef.current[0] = element} className={`${styles.benefitsSection} ${styles.section}`}>
                <h2>{`Why Choose Clover's Chat App?`}</h2>
                <p>{`Connect instantly, share moments, and collaborate effectively, with a user-friendly design to offer a seamless communication experience.`}</p>
            </div>

            <div ref={element => sectionsRef.current[1] = element} className={`${styles.testimonials} ${styles.section}`}>
                <h2>What Our Users Say</h2>
                <p>{`"I've never experienced a more seamless chat interaction!" - User A`}</p>
                <p>{`"The video call quality is exceptional, and screen sharing is a breeze!" - User B`}</p>
                <p>{`"Creating and joining chat rooms has never been easier. Highly recommend!" - User C`}</p>
            </div>

            <div ref={element => sectionsRef.current[2] = element} className={`${styles.aboutSection} ${styles.section}`}>
                <h2>About Us</h2>
                <p>{`Created by a passionate, aspiring software developer`}</p>
            </div>

            <div ref={element => sectionsRef.current[3] = element} className={`${styles.faqs} ${styles.section}`}>
                <h2>FAQs</h2>
                <p>How do I create a chat room? <br/>{` Simply click on the 'Create Room' button to start your own chat space.`}</p>
                <p>Is voice and video call supported? <br/>{` Yes, we offer high-quality voice and video calling features for comprehensive communication.`}</p>
                <p>Can I share my screen during calls? <br/>{` Absolutely! Our screen sharing is seamless and user-friendly.`}</p>
            </div>

            <div className={`${styles.footer} ${styles.section}`}>
                <p>{`Contact Us | Terms of Service | Privacy Policy`}</p>
            </div>
        </div>
    );
}
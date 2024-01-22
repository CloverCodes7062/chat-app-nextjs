import Link from 'next/link';
import "./globals.css";
import 'animate.css';

export default function RootLayout({ children}) {
    return (
        <html>
            <body>
                {children}
            </body>
        </html>
    );
}
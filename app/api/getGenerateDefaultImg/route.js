import { supabase } from "@/supabaseClient";
import { createCanvas } from "canvas";

export async function GET(req, res) {
    try {

        const initial = req.nextUrl.searchParams.get('initial');
    
        const width = 150;
        const height = 150;
    
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
    
        ctx.fillStyle = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        ctx.fillRect(0, 0, width, height);
    
        ctx.font = '62px Arial';
        ctx.fillStyle = 'white';
    
        const text = initial.toUpperCase();
        const textWidth = ctx.measureText(text).width;
        const x = (width - textWidth) / 2;
        const y = height / 2 + 20;
    
        ctx.fillText(text, x, y);
    
        const buffer = canvas.toBuffer('image/jpeg');

        return new Response(JSON.stringify({ buffer: buffer }));
    } catch (error) {
        console.log('Error', error);

        return new Response(JSON.stringify({ message: 'Internal Error Generating Default Img' }));
    }
}
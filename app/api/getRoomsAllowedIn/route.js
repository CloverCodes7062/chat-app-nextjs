import { supabase } from "@/supabaseClient";

export async function GET(req, res) {
    try {
        const userId = req.nextUrl.searchParams.get('userId');
        const { data: chatrooms, error } = await supabase
        .from('chatrooms')
        .select('room_id, chatroom_name')
        .contains('users_allowed_in', [userId])

        return new Response(JSON.stringify(chatrooms));
    } catch (error) {
        console.log('Error', error);

      return new Response('Internal Error checking Session');
    }
}

export const dynamic = 'force-dynamic';
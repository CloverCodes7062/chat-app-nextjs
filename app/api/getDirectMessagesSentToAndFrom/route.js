import { supabase } from "@/supabaseClient";

export async function GET(req, res) {
    try {
        const userId = req.nextUrl.searchParams.get('userId');
        const friendsUuid = req.nextUrl.searchParams.get('friendsUuid');

        const { data: sentFromAndToCurrFriend, error } = await supabase
        .rpc('get_messages_between_users', { user_id: userId, friend_id: friendsUuid })
        .order('created_at')
        
        return new Response(JSON.stringify(sentFromAndToCurrFriend));
    } catch (error) {
        console.log('Error', error);

      return new Response(JSON.stringify({ message: 'Internal Error Inserting New Room' }));
    }
}
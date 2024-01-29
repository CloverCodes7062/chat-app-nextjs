import { supabase } from "@/supabaseClient";

export async function POST(req, res) {
    const body = await req.json();
    console.log('body', body);
    
    try {
        const { error } = await supabase
        .from('chatrooms')
        .insert({ created_by: body.created_by, chatroom_name: body.chatroom_name, users_allowed_in: [body.created_by], meeting_id: body.meeting_id })

        if (error) {
            console.log('Error Inserting New Room', error);
        }

        return new Response(JSON.stringify({ message: 'Success' }));
    } catch (error) {
        console.log('Error', error);

      return new Response(JSON.stringify({ message: 'Internal Error Inserting New Room' }));
    }
}
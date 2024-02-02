import { supabase } from "@/supabaseClient";

export async function GET(req, res) {
    try {
        const userId = req.nextUrl.searchParams.get('userId');
        const { data: currUsersProfile, error } = await supabase
        .from('profiles')
        .select()
        .eq('id', userId);
        
        return new Response(JSON.stringify(currUsersProfile));
    } catch (error) {
        console.log('Error', error);

      return new Response(JSON.stringify({ message: 'Internal Error Inserting New Room' }));
    }
}

export const dynamic = 'force-dynamic';
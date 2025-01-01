import { supabase } from "../utils/supabaseClient.js";


export const pingSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles') // Specify your table name
        .select('id')
        .limit(1); // Limit to reduce load
      
      if (error) {
        console.error('Error pinging Supabase:', error);
      } else {
        console.log('Supabase ping successful at', new Date());
      }
    } catch (err) {
      console.error('Failed to ping Supabase:', err);
    }
  };
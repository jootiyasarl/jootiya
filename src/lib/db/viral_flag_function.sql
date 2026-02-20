-- Create a function to increment viral flags and handle ghost banning
CREATE OR REPLACE FUNCTION increment_viral_flag(target_user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.profiles
    SET viral_flag_count = COALESCE(viral_flag_count, 0) + 1,
        is_ghost_banned = CASE 
            WHEN COALESCE(viral_flag_count, 0) + 1 >= 3 THEN TRUE 
            ELSE is_ghost_banned 
        END
    WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

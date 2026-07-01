import { supabase } from '@/lib/supabase';

const FOUNDING_CAP = 100;

export async function GET() {
  const { count: used } = await supabase
    .from('activation_codes')
    .select('id', { count: 'exact', head: true })
    .eq('isFounding', true)
    .eq('status', 'used');

  const { count: reserved } = await supabase
    .from('activation_codes')
    .select('id', { count: 'exact', head: true })
    .eq('isFounding', true);

  const claimedSlots = reserved || 0;
  const activatedCount = used || 0;

  return Response.json({
    used: activatedCount,
    claimed: claimedSlots,
    total: FOUNDING_CAP,
    isOpen: claimedSlots < FOUNDING_CAP,
  });
}

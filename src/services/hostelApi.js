import { supabase, hasSupabaseConfig } from '../lib/supabaseClient';

export async function getCurrentUserProfile() {
  if (!supabase || !hasSupabaseConfig) {
    return null;
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return null;
  return data;
}

export async function placeOrderRpc(payload) {
  if (!supabase || !hasSupabaseConfig) {
    return { demo: true, payload };
  }

  const { data, error } = await supabase.rpc('place_order', payload);
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function transitionOrderStatusRpc(orderId, nextStatus) {
  if (!supabase || !hasSupabaseConfig) {
    return { demo: true, orderId, nextStatus };
  }

  const { error } = await supabase.rpc('transition_order_status', {
    p_order_id: orderId,
    p_next_status: nextStatus,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { ok: true };
}

export function subscribeToOrders(onChange) {
  if (!supabase || !hasSupabaseConfig) {
    return () => {};
  }

  const channel = supabase
    .channel('orders_realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      onChange,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

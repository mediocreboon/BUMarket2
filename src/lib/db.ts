import { supabase } from './supabase';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'buyer' | 'seller' | 'admin';
  verification_status: 'pending' | 'verified' | 'rejected';
  department?: string | null;
  phone?: string | null;
  created_at: string;
}

export interface DbProduct {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  stock: number;
  location: string | null;
  created_at: string;
  // joined fields (optional)
  seller_name?: string;
  seller_verified?: boolean;
}

export interface DbOrder {
  id: string;
  buyer_id: string;
  product_id: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  created_at: string;
  // optional joined fields
  product?: DbProduct;
  buyer?: Profile;
}

export interface DbNotification {
  id: string;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

type ProductInput = Pick<
  DbProduct,
  'seller_id' | 'title' | 'description' | 'price' | 'category' | 'image_url' | 'stock' | 'location'
>;

export type OrderStatus = 'pending' | 'confirmed' | 'completed';
export type PaymentMethod = 'buy_now' | 'cash_on_pickup';

function uniqueById<T extends { id: string }>(rows: T[]): T[] {
  return Array.from(new Map(rows.map((row) => [row.id, row])).values());
}

// ─── Profiles ───────────────────────────────────────────────────────────────
export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.error('[db] fetchProfile error:', error.message);
    return null;
  }
  return (data as Profile) || null;
}

export async function listProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[db] listProfiles error:', error.message);
    return [];
  }
  return (data || []) as Profile[];
}

type SignupRole = 'buyer' | 'seller';

/** Initial profile row on signup — role limited to buyer or seller. */
export async function createProfileOnSignup(profile: {
  id: string;
  email: string;
  full_name: string;
  role: SignupRole;
  department?: string | null;
  phone?: string | null;
}) {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      verification_status: 'verified',
      department: profile.department ?? null,
      phone: profile.phone ?? null,
    },
    { onConflict: 'id' }
  );
  if (error) console.error('[db] createProfileOnSignup error:', error.message);
  return !error;
}

/** Self-service profile edits — role and verification_status cannot be changed here. */
export async function updateProfileSelf(
  userId: string,
  patch: {
    full_name?: string;
    department?: string | null;
    phone?: string | null;
  }
) {
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: patch.full_name,
      department: patch.department,
      phone: patch.phone,
    })
    .eq('id', userId);
  if (error) console.error('[db] updateProfileSelf error:', error.message);
  return !error;
}

// ─── Products ───────────────────────────────────────────────────────────────
export async function listProducts(): Promise<DbProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, seller:profiles!products_seller_id_fkey(full_name, verification_status)')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[db] listProducts error:', error.message);
    throw new Error(error.message);
  }
  return (data || []).map((row: any) => ({
    ...row,
    seller_name: row.seller?.full_name,
    seller_verified: row.seller?.verification_status === 'verified',
  })) as DbProduct[];
}

export async function listProductsBySeller(sellerId: string): Promise<DbProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[db] listProductsBySeller error:', error.message);
    return [];
  }
  return (data || []) as DbProduct[];
}

export async function createProduct(input: ProductInput): Promise<DbProduct | null> {
  const { data, error } = await supabase.from('products').insert(input).select('*').single();
  if (error) {
    console.error('[db] createProduct error:', error.message);
    return null;
  }
  return data as DbProduct;
}

export async function updateProduct(id: string, patch: Partial<ProductInput>): Promise<boolean> {
  const { error } = await supabase.from('products').update(patch).eq('id', id);
  if (error) console.error('[db] updateProduct error:', error.message);
  return !error;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) console.error('[db] deleteProduct error:', error.message);
  return !error;
}

// ─── Storage (product images) ───────────────────────────────────────────────
export async function uploadProductImage(file: File, userId: string): Promise<string | null> {
  try {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('products').upload(path, file, {
      upsert: false,
      cacheControl: '3600',
      contentType: file.type || undefined,
    });
    if (error) {
      console.error('[db] uploadProductImage error:', error.message);
      return null;
    }
    const { data } = supabase.storage.from('products').getPublicUrl(path);
    return data.publicUrl;
  } catch (e: any) {
    console.error('[db] uploadProductImage exception:', e?.message);
    return null;
  }
}

// ─── Orders ─────────────────────────────────────────────────────────────────
export async function createOrder(input: {
  buyer_id: string;
  product_id: string;
  payment_method: PaymentMethod;
}): Promise<DbOrder | null> {
  const { data: rpcData, error: rpcError } = await supabase
    .rpc('create_order_with_inventory', {
      p_buyer_id: input.buyer_id,
      p_product_id: input.product_id,
      p_payment_method: input.payment_method,
    })
    .single();

  if (!rpcError) {
    return rpcData as DbOrder;
  }

  const code = (rpcError as any).code;
  if (code === 'P0001') {
    console.error('[db] createOrder transaction error:', rpcError.message);
    return null;
  }

  console.error('[db] createOrder rpc error:', rpcError.message);
  return null;
}

export async function listOrdersForBuyer(buyerId: string): Promise<DbOrder[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, product:products(*)')
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[db] listOrdersForBuyer error:', error.message);
    return [];
  }
  return uniqueById((data || []) as DbOrder[]);
}

export async function listOrdersForSeller(sellerId: string): Promise<DbOrder[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, product:products!inner(*), buyer:profiles!orders_buyer_id_fkey(full_name, email)')
    .eq('product.seller_id', sellerId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[db] listOrdersForSeller error:', error.message);
    return [];
  }
  return uniqueById((data || []) as DbOrder[]);
}

export async function listAllOrders(): Promise<DbOrder[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, product:products(*), buyer:profiles!orders_buyer_id_fkey(full_name, email)')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[db] listAllOrders error:', error.message);
    return [];
  }
  return uniqueById((data || []) as DbOrder[]);
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<boolean> {
  const { error: rpcError } = await supabase
    .rpc('update_order_status_with_inventory', {
      p_order_id: orderId,
      p_status: status,
    })
    .single();

  if (!rpcError) return true;

  const code = (rpcError as any).code;
  if (code === 'P0001') {
    console.error('[db] updateOrderStatus transaction error:', rpcError.message);
    return false;
  }

  console.error('[db] updateOrderStatus rpc error:', rpcError.message);
  return false;
}

// ─── Notifications ──────────────────────────────────────────────────────────
export async function createNotification(userId: string, message: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, message });
  if (error) console.error('[db] createNotification error:', error.message);
  return !error;
}

export async function listNotifications(userId: string): Promise<DbNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) {
    console.error('[db] listNotifications error:', error.message);
    return [];
  }
  return uniqueById((data || []) as DbNotification[]);
}

export async function markNotificationRead(id: string): Promise<boolean> {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  if (error) console.error('[db] markNotificationRead error:', error.message);
  return !error;
}

export async function markAllNotificationsRead(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) console.error('[db] markAllNotificationsRead error:', error.message);
  return !error;
}

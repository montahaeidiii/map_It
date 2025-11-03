import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vfqmqcillubgddsdzvlc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
});

// Database types
export interface Customer {
  customer_id: number;
  username: string;
  email: string;
  password_hash: string;
  package_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  admin_id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface Package {
  package_id: number;
  name: string;
  price: string;
  allowed_maps: number;
  priority: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Map {
  map_id: number;
  customer_id: number;
  name: string;
  description: string | null;
  center_lat: number;
  center_lng: number;
  zoom_level: number;
  code: string | null;
  created_at: string;
  updated_at: string;
}

export interface Zone {
  zone_id: number;
  map_id: number;
  name: string;
  description: string | null;
  coordinates: any; // JSON type
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  order_id: number;
  customer_id: number;
  package_id: number;
  status: string;
  amount: string;
  created_at: string;
  updated_at: string;
}

// Helper functions for authentication
export async function loginCustomer(username: string, password: string) {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('customer_id, username, email, package_id')
      .eq('username', username)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Customer not found');

    // Note: Password verification should be done server-side with bcrypt
    // For now, we'll use Supabase Auth or implement server-side verification
    
    return { success: true, customer: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function loginAdmin(username: string, password: string) {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('admin_id, username, email')
      .eq('username', username)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Admin not found');

    return { success: true, admin: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPackages() {
  try {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('active', true)
      .order('priority', { ascending: true });

    if (error) throw error;
    
    return { success: true, packages: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function registerCustomer(username: string, email: string, password: string, packageId: number) {
  try {
    // Note: Password should be hashed server-side
    // For now, we'll insert directly (not recommended for production)
    const { data, error } = await supabase
      .from('customers')
      .insert([
        {
          username,
          email,
          password_hash: password, // This should be hashed!
          package_id: packageId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    
    return { success: true, customer: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCustomerMaps(customerId: number) {
  try {
    const { data, error } = await supabase
      .from('maps')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { success: true, maps: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createMap(customerId: number, name: string, description: string, centerLat: number, centerLng: number, zoomLevel: number) {
  try {
    const { data, error } = await supabase
      .from('maps')
      .insert([
        {
          customer_id: customerId,
          name,
          description,
          center_lat: centerLat,
          center_lng: centerLng,
          zoom_level: zoomLevel,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    
    return { success: true, map: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getMapZones(mapId: number) {
  try {
    const { data, error } = await supabase
      .from('zones')
      .select('*')
      .eq('map_id', mapId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    return { success: true, zones: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createZone(mapId: number, name: string, description: string, coordinates: any, color: string) {
  try {
    const { data, error } = await supabase
      .from('zones')
      .insert([
        {
          map_id: mapId,
          name,
          description,
          coordinates,
          color,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    
    return { success: true, zone: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllMaps() {
  try {
    const { data, error } = await supabase
      .from('maps')
      .select('*, customers(username, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { success: true, maps: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllOrders() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, customers(username, email), packages(name, price)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { success: true, orders: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAdminStats() {
  try {
    // Get total customers
    const { count: totalCustomers, error: customersError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    if (customersError) throw customersError;

    // Get total maps
    const { count: totalMaps, error: mapsError } = await supabase
      .from('maps')
      .select('*', { count: 'exact', head: true });

    if (mapsError) throw mapsError;

    // Get total orders
    const { count: totalOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (ordersError) throw ordersError;

    // Get total revenue
    const { data: revenueData, error: revenueError } = await supabase
      .from('orders')
      .select('amount')
      .eq('status', 'completed');

    if (revenueError) throw revenueError;

    const totalRevenue = revenueData?.reduce((sum, order) => sum + parseFloat(order.amount || '0'), 0) || 0;

    return {
      success: true,
      stats: {
        totalCustomers,
        totalMaps,
        totalOrders,
        totalRevenue: totalRevenue.toFixed(2),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { signUp, verifyUser, supabaseAdmin } from "./auth.tsx";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-c2f27df0/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-c2f27df0/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const data = await signUp(email, password, name);
    
    // Add user to users table
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_user_id: data.user.id,
        email: email,
        name: name,
        subscription_plan: 'none',
        subscription_status: 'none'
      });

    if (dbError) {
      console.log('Error adding user to users table:', dbError);
      // Don't fail the signup if this fails, just log it
    }

    return c.json({ success: true, user: data });
  } catch (error) {
    console.log('Sign up error:', error);
    return c.json({ error: error.message }, 400);
  }
});

// Sign in endpoint
app.post("/make-server-c2f27df0/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Missing email or password' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return c.json({ error: error.message }, 401);
    }

    return c.json({ 
      success: true, 
      session: data.session,
      user: data.user 
    });
  } catch (error) {
    console.log('Sign in error:', error);
    return c.json({ error: error.message }, 400);
  }
});

// Upload receipt endpoint (requires authentication)
app.post("/make-server-c2f27df0/upload-receipt", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await verifyUser(accessToken);
    const { fileName, fileData, plan, amount } = await c.req.json();

    if (!fileName || !fileData || !plan || !amount) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Store receipt info in KV store
    const receiptId = crypto.randomUUID();
    const receiptKey = `receipt:${receiptId}`;
    
    await kv.set(receiptKey, {
      id: receiptId,
      userId: user.id,
      userEmail: user.email,
      fileName,
      fileData, // Base64 encoded file
      plan,
      amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    // Also store user's receipts list
    const userReceiptsKey = `user:${user.id}:receipts`;
    const existingReceipts = await kv.get(userReceiptsKey) || [];
    await kv.set(userReceiptsKey, [...existingReceipts, receiptId]);

    return c.json({ 
      success: true, 
      receiptId,
      message: 'Receipt uploaded successfully' 
    });
  } catch (error) {
    console.log('Upload receipt error:', error);
    return c.json({ error: error.message }, 400);
  }
});

// Get user's receipts (requires authentication)
app.get("/make-server-c2f27df0/receipts", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await verifyUser(accessToken);
    const userReceiptsKey = `user:${user.id}:receipts`;
    const receiptIds = await kv.get(userReceiptsKey) || [];

    const receipts = await Promise.all(
      receiptIds.map(async (id: string) => {
        const receipt = await kv.get(`receipt:${id}`);
        // Remove file data from response to reduce payload
        if (receipt) {
          const { fileData, ...receiptWithoutFile } = receipt;
          return receiptWithoutFile;
        }
        return null;
      })
    );

    return c.json({ 
      success: true, 
      receipts: receipts.filter(r => r !== null) 
    });
  } catch (error) {
    console.log('Get receipts error:', error);
    return c.json({ error: error.message }, 400);
  }
});

// Get current user info (requires authentication)
app.get("/make-server-c2f27df0/me", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await verifyUser(accessToken);
    return c.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.log('Get user error:', error);
    return c.json({ error: error.message }, 401);
  }
});

// Verify activation code endpoint (for ChatGPT Actions)
app.post("/make-server-c2f27df0/verify", async (c) => {
  try {
    const body = await c.req.json();
    const { code } = body;

    // Check if code is provided
    if (!code) {
      return c.json({ ok: false, reason: "missing_code" }, 400);
    }

    // Query subscriptions table using service_role key
    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .select('activation_code, status, plan, expires_at')
      .eq('activation_code', code)
      .single();

    // If no subscription found
    if (error || !subscription) {
      console.log('Subscription not found for code:', code, 'Error:', error?.message);
      return c.json({ ok: false, reason: "invalid_code" }, 404);
    }

    // Check if subscription is active
    if (subscription.status !== 'active') {
      console.log('Inactive subscription for code:', code, 'Status:', subscription.status);
      return c.json({ ok: false, reason: "inactive_subscription" }, 403);
    }

    // Return successful response with subscription details
    return c.json({
      ok: true,
      plan: subscription.plan,
      expires_at: subscription.expires_at
    });

  } catch (error) {
    console.log('Verify endpoint error:', error);
    return c.json({ 
      ok: false, 
      reason: "server_error",
      message: error.message 
    }, 500);
  }
});

// Admin: Get all subscriptions
app.get("/make-server-c2f27df0/admin/subscriptions", async (c) => {
  try {
    const { data: subscriptions, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Error fetching subscriptions:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, subscriptions });
  } catch (error) {
    console.log('Admin subscriptions error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Get all receipts
app.get("/make-server-c2f27df0/admin/receipts", async (c) => {
  try {
    const receiptKeys = await kv.getByPrefix('receipt:');
    const receipts = receiptKeys.map((item: any) => item.value);

    return c.json({ success: true, receipts });
  } catch (error) {
    console.log('Admin receipts error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Get all users
app.get("/make-server-c2f27df0/admin/users", async (c) => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Error fetching users:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, users });
  } catch (error) {
    console.log('Admin users error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Create subscription
app.post("/make-server-c2f27df0/admin/create-subscription", async (c) => {
  try {
    const { email, plan, duration } = await c.req.json();

    if (!plan || !duration) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Generate activation code
    const activationCode = `AC-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(duration));

    // Insert into subscriptions table
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        activation_code: activationCode,
        plan: plan,
        status: 'active',
        expires_at: expiresAt.toISOString(),
        user_email: email || null
      })
      .select()
      .single();

    if (error) {
      console.log('Error creating subscription:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      success: true, 
      subscription: data,
      activation_code: activationCode
    });
  } catch (error) {
    console.log('Create subscription error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Update receipt status
app.post("/make-server-c2f27df0/admin/update-receipt", async (c) => {
  try {
    const { receiptId, status } = await c.req.json();

    if (!receiptId || !status) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const receiptKey = `receipt:${receiptId}`;
    const receipt = await kv.get(receiptKey);

    if (!receipt) {
      return c.json({ error: 'Receipt not found' }, 404);
    }

    // Update receipt status
    await kv.set(receiptKey, {
      ...receipt,
      status: status,
      updatedAt: new Date().toISOString()
    });

    // If approved, create a subscription
    if (status === 'approved') {
      const activationCode = `AC-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Default 30 days

      await supabaseAdmin
        .from('subscriptions')
        .insert({
          activation_code: activationCode,
          plan: receipt.plan,
          status: 'active',
          expires_at: expiresAt.toISOString(),
          user_email: receipt.userEmail
        });

      // Store activation code with receipt
      await kv.set(receiptKey, {
        ...receipt,
        status: status,
        activationCode: activationCode,
        updatedAt: new Date().toISOString()
      });
    }

    return c.json({ success: true });
  } catch (error) {
    console.log('Update receipt error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Update user subscription
app.post("/make-server-c2f27df0/admin/update-user", async (c) => {
  try {
    const { userId, subscription_plan, subscription_status, activation_code } = await c.req.json();

    if (!userId) {
      return c.json({ error: 'Missing user ID' }, 400);
    }

    const updateData: any = {};
    if (subscription_plan) updateData.subscription_plan = subscription_plan;
    if (subscription_status) updateData.subscription_status = subscription_status;
    if (activation_code !== undefined) updateData.activation_code = activation_code;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.log('Error updating user:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, user: data });
  } catch (error) {
    console.log('Admin update user error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin Login
app.post("/make-server-c2f27df0/admin/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Missing email or password' }, 400);
    }

    // Use pgcrypto to verify password directly in database
    const { data: admin, error } = await supabaseAdmin
      .rpc('verify_admin_login', {
        admin_email: email,
        admin_password: password
      });

    if (error || !admin || admin.length === 0) {
      console.log('Admin login failed:', email, error);
      return c.json({ error: 'بيانات الدخول غير صحيحة' }, 401);
    }

    const adminData = Array.isArray(admin) ? admin[0] : admin;

    // Update last login
    await supabaseAdmin
      .from('admins')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', adminData.id);

    // Return admin info (without password)
    return c.json({
      success: true,
      admin: {
        id: adminData.id,
        email: adminData.email,
        name: adminData.name,
        role: adminData.role
      }
    });
  } catch (error) {
    console.log('Admin login error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Setup initial admins (one-time use)
app.post("/make-server-c2f27df0/admin/setup", async (c) => {
  try {
    const { secret_key } = await c.req.json();

    // Secret key for security (you can change this)
    if (secret_key !== 'SETUP_ADMINS_2026') {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if admins already exist
    const { data: existingAdmins } = await supabaseAdmin
      .from('admins')
      .select('email');

    if (existingAdmins && existingAdmins.length > 0) {
      return c.json({ error: 'Admins already set up' }, 400);
    }

    // Admin 1: as8543245@gmail.com - A1999anw#
    const hash1 = await bcrypt.hash('A1999anw#');
    
    // Admin 2: anwaralrawahi459@gmail.com - 6101999
    const hash2 = await bcrypt.hash('6101999');

    const adminsToInsert = [
      {
        email: 'as8543245@gmail.com',
        password_hash: hash1,
        name: 'المدير الأول',
        role: 'super_admin',
        is_active: true
      },
      {
        email: 'anwaralrawahi459@gmail.com',
        password_hash: hash2,
        name: 'المدير الثاني',
        role: 'admin',
        is_active: true
      }
    ];

    const { data, error } = await supabaseAdmin
      .from('admins')
      .insert(adminsToInsert)
      .select();

    if (error) {
      console.log('Error setting up admins:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      success: true, 
      message: 'Admins created successfully',
      admins: data.map(a => ({ email: a.email, name: a.name, role: a.role }))
    });
  } catch (error) {
    console.log('Admin setup error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Get all admins
app.get("/make-server-c2f27df0/admin/admins", async (c) => {
  try {
    const { data: admins, error } = await supabaseAdmin
      .from('admins')
      .select('id, email, name, role, is_active, created_at, last_login_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Error fetching admins:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, admins });
  } catch (error) {
    console.log('Get admins error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Create new admin
app.post("/make-server-c2f27df0/admin/create-admin", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password);

    const { data, error } = await supabaseAdmin
      .from('admins')
      .insert({
        email,
        password_hash: passwordHash,
        name,
        role: role || 'admin',
        is_active: true
      })
      .select('id, email, name, role, is_active')
      .single();

    if (error) {
      console.log('Error creating admin:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, admin: data });
  } catch (error) {
    console.log('Create admin error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Update admin status
app.post("/make-server-c2f27df0/admin/update-admin", async (c) => {
  try {
    const { adminId, is_active, role } = await c.req.json();

    if (!adminId) {
      return c.json({ error: 'Missing admin ID' }, 400);
    }

    const updateData: any = {};
    if (is_active !== undefined) updateData.is_active = is_active;
    if (role) updateData.role = role;

    const { data, error } = await supabaseAdmin
      .from('admins')
      .update(updateData)
      .eq('id', adminId)
      .select('id, email, name, role, is_active')
      .single();

    if (error) {
      console.log('Error updating admin:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, admin: data });
  } catch (error) {
    console.log('Update admin error:', error);
    return c.json({ error: error.message }, 500);
  }
});

Deno.serve(app.fetch);
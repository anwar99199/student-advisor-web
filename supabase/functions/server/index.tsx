import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { signUp, verifyUser, supabaseAdmin } from "./auth.tsx";
import { createClient } from 'jsr:@supabase/supabase-js@2';

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

Deno.serve(app.fetch);
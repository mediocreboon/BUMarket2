import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

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
app.get("/make-server-d3997a9b/health", (c) => {
  return c.json({ status: "ok" });
});

// ─── AUTH: SIGNUP ────────────────────────────────────────────────────────────
// Uses the Supabase Service Role key so we can auto-confirm the email address
// (no real email server needed in this prototype).
app.post("/make-server-d3997a9b/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const {
      email,
      password,
      fullName,
      studentId,
      role,         // 'buyer' | 'seller'
      department,
      phone,
      businessName,
      businessCategory,
      businessDescription,
    } = body;

    // Validate required fields
    if (!email || !password || !fullName || !studentId || !role || !department) {
      return c.json({ error: "Missing required fields." }, 400);
    }

    const supabase = createClient(
  // Use the name of the internal environment variables provided by Supabase
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! 
);

    // Create the user via admin API → email_confirm: true skips email verification
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm so no email server is needed
      user_metadata: {
        fullName,
        studentId,
        role,
        department,
        phone: phone || "",
        businessName: businessName || "",
        businessCategory: businessCategory || "",
        businessDescription: businessDescription || "",
      },
    });

    if (error) {
      console.log(`Signup error for ${email}: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    const userId = data.user.id;

    // Also persist profile in KV store for quick retrieval later
    const profile = {
      id: userId,
      fullName,
      studentId,
      role,
      department,
      phone: phone || "",
      businessName: businessName || "",
      businessCategory: businessCategory || "",
      businessDescription: businessDescription || "",
      email,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`profile:${userId}`, JSON.stringify(profile));
    console.log(`Signup successful for ${email} (role: ${role}, id: ${userId})`);

    return c.json({ success: true, userId });
  } catch (err) {
    console.log(`Unexpected signup error: ${err}`);
    return c.json({ error: "Internal server error during signup." }, 500);
  }
});

// ─── PROFILE: GET ────────────────────────────────────────────────────────────
// Returns the stored KV profile for an authenticated user.
app.get("/make-server-d3997a9b/profile", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) return c.json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: "Unauthorized" }, 401);

    const profileRaw = await kv.get(`profile:${user.id}`);
    if (!profileRaw) {
      // Fall back to user_metadata if KV is missing
      return c.json({ profile: user.user_metadata });
    }

    return c.json({ profile: JSON.parse(profileRaw as string) });
  } catch (err) {
    console.log(`Profile fetch error: ${err}`);
    return c.json({ error: "Internal server error fetching profile." }, 500);
  }
});

Deno.serve(app.fetch);

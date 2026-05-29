// Supabase Edge Function: send-push
// Deploy via: supabase functions deploy send-push
// Set secret: supabase secrets set VAPID_PRIVATE_KEY=A7lxS2NkmujFDnyOZGHrN1-R0q4iyYKLz8-SB5KBY4g
//             supabase secrets set VAPID_PUBLIC_KEY=BPhTWh2e3suh14Oe-C-kmVyn85ZLCVAX6GWPg9X2exNneL4RtwXKBH5kxhO8UFNqES3RDMBYdddax3t5I7DKvLA

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

webpush.setVapidDetails(
  "mailto:dux9000@gmail.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type" } });
  }

  try {
    const { player_id, title, body } = await req.json();

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get push subscription for this player
    const { data, error } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("player_id", player_id)
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ error: "No subscription found" }), { status: 404 });
    }

    const subscription = typeof data.subscription === "string"
      ? JSON.parse(data.subscription)
      : data.subscription;

    await webpush.sendNotification(subscription, JSON.stringify({ title, body, url: "https://coach.purepadel.dk" }));

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});

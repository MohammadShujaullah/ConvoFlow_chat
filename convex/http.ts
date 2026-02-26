import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Webhook } from "svix";

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{ id: string; email_address: string }>;
    primary_email_address_id?: string;
    first_name?: string | null;
    last_name?: string | null;
    username?: string | null;
    image_url?: string | null;
  };
};

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
    }

    const payload = await request.text();
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing webhook headers", { status: 400 });
    }

    let event: ClerkWebhookEvent;
    try {
      const wh = new Webhook(secret);
      event = wh.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as ClerkWebhookEvent;
    } catch (error) {
      return new Response("Invalid signature", { status: 400 });
    }

    if (event.type === "user.created" || event.type === "user.updated") {
      const data = event.data;
      const email =
        data.email_addresses?.find(
          (entry) => entry.id === data.primary_email_address_id
        )?.email_address || data.email_addresses?.[0]?.email_address || "";

      const name =
        [data.first_name, data.last_name].filter(Boolean).join(" ") ||
        data.username ||
        "User";

      await ctx.runMutation(api.users.upsertUser, {
        clerkId: data.id,
        name,
        email,
        imageUrl: data.image_url || undefined,
      });
    }

    if (event.type === "user.deleted") {
      await ctx.runMutation(api.users.deleteByClerkId, {
        clerkId: event.data.id,
      });
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;

// import stripe from 'stripe'
// import { NextResponse } from 'next/server'
// import { createOrder } from '@/lib/actions/order.actions'

// export async function POST(request: Request) {
//   const body = await request.text()

//   const sig = request.headers.get('stripe-signature') as string
//   const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

//   let event

//   try {
//     event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
//   } catch (err) {
//     return NextResponse.json({ message: 'Webhook error', error: err })
//   }

//   // Get the ID and type
//   const eventType = event.type

//   // CREATE
//   if (eventType === 'checkout.session.completed') {
//     const { id, amount_total, metadata } = event.data.object

//     const order = {
//       stripeId: id,
//       eventId: metadata?.eventId || '',
//       buyerId: metadata?.buyerId || '',
//       totalAmount: amount_total ? (amount_total / 100).toString() : '0',
//       createdAt: new Date(),
//     }

//     const newOrder = await createOrder(order)
//     return NextResponse.json({ message: 'OK', order: newOrder })
//   }

//   return new Response('', { status: 200 })
// }

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createOrder } from "@/lib/actions/order.actions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature") as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed.", err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      console.log("Session:", session);

      const order = {
        stripeId: session.id,
        eventId: session.metadata?.eventId || "",
        buyerId: session.metadata?.buyerId || "",
        totalAmount: session.amount_total
          ? (session.amount_total / 100).toString()
          : "0",
        createdAt: new Date(),
      };

      try {
        await createOrder(order);
      } catch (err) {
        console.error("Error creating order:", err);
        return NextResponse.json(
          { error: "Failed to create order" },
          { status: 500 }
        );
      }
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

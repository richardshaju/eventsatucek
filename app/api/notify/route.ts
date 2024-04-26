import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { Message, getMessaging } from 'firebase-admin/messaging';

/*
  SEND NOTIFICATIONS:
    Endpoint: /api/notify
    Method: POST
    Params: { Body -> FCM Token }
*/

!getApps().length ? initializeApp({credential: cert(JSON.parse(process.env.CREDS || ""))}) : getApp();

export async function POST(req: NextRequest) {

  const {title, body, image} = await req.json()
  const token = req.headers.get('X-TOKEN')

  if (!title ||  !body || !image || (token != process.env.TOKEN)) {
    return NextResponse.json(
      { msg: 'Unauthorized.' },
      { status: 400 }
    );
  }

  const message : Message = {
    notification: {
      title :title,
      body: body,
      imageUrl: image,
    },
    topic: "all"
  };
  // Subscribe the user corresponding to the registration token to the topic.
  return getMessaging().send(message)
  .then((response) => {
    // Response is a message ID string.
    console.log('Successfully sent message:', response);
    return NextResponse.json(
      { msg: response },
      { status: 200 }
    );
  })
  .catch((error) => {
    return NextResponse.json(
      { msg: 'Error.' },
      { status: 500 }
    );
    console.log('Error sending message:', error);
  });

}

import { NextResponse } from 'next/server';
import { PinataSDK } from 'pinata';

// Initialize Pinata SDK on the server side
const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT || '',
  pinataGateway: process.env.PINATA_GATEWAY || ''
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'uploadMetadata': {
        console.log('uploadMetadata');
        console.log(data);
        const { metadata, category } = data;

        try {
          // Try to create or get private group for metadata
          let groupId: string | undefined = undefined;
          try {
            const groups = await pinata.groups.private.list()
              .name(category)
              .limit(1);

            if (groups.groups && groups.groups.length > 0) {
              groupId = groups.groups[0].id;
            } else {
              const newGroup = await pinata.groups.private.create({
                name: category,
                isPublic: false
              });
              groupId = newGroup.id;
            }
          } catch (groupError) {
            console.warn('Error managing groups, uploading without group:', groupError);
            // Continue without group if group management fails
          }

          // Upload metadata as JSON (simplified - without vectorize for now)
          let uploadResponse;
          if (groupId) {
            uploadResponse = await pinata.upload.private.json(metadata)
              .name(`${category}-${Date.now()}.json`)
              .group(groupId);
          } else {
            // Fallback to public upload if group creation fails
            uploadResponse = await pinata.upload.public.json(metadata)
              .name(`${category}-${Date.now()}.json`);
          }

          return NextResponse.json({ cid: uploadResponse.cid });
        } catch (error) {
          console.error('Pinata upload error:', error);
          throw error;
        }
      }

      case 'uploadImage': {
        const { file, metadata } = data;

        try {
          // Convert base64 to buffer
          const base64Data = file.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');

          // Pinata SDK expects a File-like object, so we create one using Buffer
          // and add the necessary properties
          const fileToUpload = Object.assign(buffer, {
            name: metadata.name || 'event-image.jpg',
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          // Upload file with metadata
          const uploadResponse = await pinata.upload.public.file(fileToUpload as any)
            .name(metadata.name || 'event-image.jpg')
            .keyvalues({
              description: metadata.description || '',
              location: metadata.location || '',
              category: metadata.category || '',
              eventDate: metadata.eventDate?.toString() || '',
              price: metadata.price?.toString() || '',
              maxTickets: metadata.maxTickets?.toString() || ''
            });

          return NextResponse.json({ cid: uploadResponse.cid });
        } catch (error) {
          console.error('Pinata image upload error:', error);
          throw error;
        }
      }

      case 'getMetadata': {
        const { cid } = data;
        const response = await pinata.gateways.private.get(cid);
        return NextResponse.json(response.data);
      }

      case 'getImage': {
        const { cid } = data;
        const response = await pinata.gateways.public.get(cid);
        return NextResponse.json(response.data);
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Pinata API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process Pinata request';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', { errorMessage, errorStack });
    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
} 
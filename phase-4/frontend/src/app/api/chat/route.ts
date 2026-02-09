import { NextRequest, NextResponse } from 'next/server';

// Proxy to backend chat API with auth

export async function POST(req: NextRequest) {
  try {
    // Phase 4 Docker deployment: Use container name for internal networking
    const backendUrl = 'http://todo-backend:8000';
    const body = await req.text();

    // Forward all headers including Authorization/Cookie
    const headers = new Headers(req.headers);
    headers.set('Content-Type', 'application/json');

    const res = await fetch(`${backendUrl}/api/chat/`, {
      method: 'POST',
      headers,
      body,
    });

    // If the backend returns a 401, forward it to the frontend
    if (res.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Stream response for useChat (SSE compatible)
    if (!res.body) {
      return new NextResponse('No response body', { status: 500 });
    }

    const reader = res.body.getReader();
    const stream = new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        controller.enqueue(value);
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
  }
}

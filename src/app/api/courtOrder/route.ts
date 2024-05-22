let order: string = '1,2,3,4,5,6';

export async function GET(request: Request) {
  return new Response(order, { status: 200 });
}

export async function PUT(request: Request) {
  const body: {order: string} = await request.json();
  if (checkValidOrder(body.order)) {
    order = body.order;
    return new Response('OK', { status: 200 });
  } else {
    return new Response('Invalid order', { status: 400 });
  }
  
}

function checkValidOrder(order: string): boolean {
  return /^[1-6]{1}(,[1-6]){5}$/.test(order);
}
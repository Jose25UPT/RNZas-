// server/stripe-backend.js
// Backend local para Stripe — ejecutar con: node server/stripe-backend.js
const express = require('express');
const cors = require('cors');
const path = require('path');

// Cargar variables de entorno desde .env en la raíz del proyecto
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY no encontrada en .env');
  process.exit(1);
}

const stripe = require('stripe')(STRIPE_SECRET_KEY);
const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Stripe backend running' });
});

// Crear Stripe Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items, successUrl, cancelUrl } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'No hay productos' });
    }

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title || 'Producto',
        },
        unit_amount: Math.round(item.price * 100), // centavos
      },
      quantity: item.quantity || 1,
    }));

    console.log(`💳 Creando Checkout Session con ${items.length} producto(s)`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || 'https://shopfolio.app/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl || 'https://shopfolio.app/cancel',
    });

    console.log(`✅ Session creada: ${session.id}`);

    res.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Verificar estado de una sesión
app.get('/session-status/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    res.json({
      status: session.payment_status,
      customerEmail: session.customer_details?.email,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Página de éxito (el navegador redirige aquí tras pagar)
app.get('/success', (req, res) => {
  const sessionId = req.query.session_id || '';
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f0fdf4; }
        .card { text-align: center; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 400px; }
        h1 { color: #16a34a; font-size: 28px; }
        p { color: #666; font-size: 16px; line-height: 1.5; }
        .check { font-size: 64px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="check">✅</div>
        <h1>¡Pago Exitoso!</h1>
        <p>Tu pedido ha sido procesado correctamente.</p>
        <p style="color:#999; font-size:12px;">Puedes cerrar esta ventana y volver a la app.</p>
      </div>
    </body>
    </html>
  `);
});

// Página de cancelación
app.get('/cancel', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #fef2f2; }
        .card { text-align: center; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 400px; }
        h1 { color: #dc2626; font-size: 28px; }
        p { color: #666; font-size: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div style="font-size:64px">❌</div>
        <h1>Pago Cancelado</h1>
        <p>No se realizó ningún cobro. Puedes volver a intentarlo desde la app.</p>
      </div>
    </body>
    </html>
  `);
});

const PORT = 4242;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Stripe backend corriendo en http://localhost:${PORT}`);
  console.log(`📱 Desde tu dispositivo usa tu IP local, ej: http://192.168.x.x:${PORT}\n`);
});

// src/services/stripe.js
// Servicio Stripe compatible con Expo Go
// Usa Stripe Checkout Sessions (se abre en navegador, sin SDK nativo)

const STRIPE_BACKEND_URL = process.env.EXPO_PUBLIC_STRIPE_BACKEND_URL;

export const isStripeBackendConfigured = () => Boolean(STRIPE_BACKEND_URL);

/**
 * Crea una Stripe Checkout Session en el backend.
 * Devuelve { sessionId, url } — la app abre `url` en el navegador.
 */
export async function createCheckoutSession({ items }) {
  if (!STRIPE_BACKEND_URL) {
    throw new Error('Backend no configurado. Añade EXPO_PUBLIC_STRIPE_BACKEND_URL en .env');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${STRIPE_BACKEND_URL}/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items,
        successUrl: `${STRIPE_BACKEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${STRIPE_BACKEND_URL}/cancel`,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Error al crear la sesión de pago');
    }

    return response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`No se pudo conectar al backend. Verifica que el servidor esté corriendo.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Verifica el estado de una Checkout Session.
 */
export async function getSessionStatus(sessionId) {
  const response = await fetch(`${STRIPE_BACKEND_URL}/session-status/${sessionId}`);
  if (!response.ok) throw new Error('No se pudo verificar el estado del pago');
  return response.json();
}

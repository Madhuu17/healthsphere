import { Request, Response, Router } from 'express';

const router = Router();
const MAPS_KEY = process.env.GOOGLE_MAPS_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// ── Places Autocomplete Proxy ────────────────────────────────────────────────
// Proxies Google Places Autocomplete API to bypass CORS / referrer restrictions
router.get('/autocomplete', async (req: Request, res: Response): Promise<void> => {
  try {
    const { input } = req.query;
    if (!input || typeof input !== 'string') {
      res.status(400).json({ predictions: [], status: 'INVALID_REQUEST' });
      return;
    }

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&components=country:in&language=en&key=${MAPS_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('[PlacesProxy] Autocomplete error:', data.status, data.error_message);
    }

    res.json({
      predictions: (data.predictions || []).map((p: any) => ({
        place_id: p.place_id,
        description: p.description,
      })),
      status: data.status,
      error_message: data.error_message,
    });
  } catch (error: any) {
    console.error('[PlacesProxy] autocomplete error:', error.message);
    res.status(500).json({ predictions: [], status: 'ERROR', error_message: error.message });
  }
});

// ── Place Details Proxy (lat/lng) ────────────────────────────────────────────
router.get('/details', async (req: Request, res: Response): Promise<void> => {
  try {
    const { place_id } = req.query;
    if (!place_id || typeof place_id !== 'string') {
      res.status(400).json({ status: 'INVALID_REQUEST' });
      return;
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(place_id)}&fields=geometry,formatted_address&key=${MAPS_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('[PlacesProxy] Details error:', data.status, data.error_message);
    }

    res.json({
      status: data.status,
      lat: data.result?.geometry?.location?.lat,
      lng: data.result?.geometry?.location?.lng,
      formatted_address: data.result?.formatted_address,
      error_message: data.error_message,
    });
  } catch (error: any) {
    console.error('[PlacesProxy] details error:', error.message);
    res.status(500).json({ status: 'ERROR', error_message: error.message });
  }
});

export default router;

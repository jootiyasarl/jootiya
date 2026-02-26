import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  if (!city) {
    return NextResponse.json({ error: 'City is required' }, { status: 400 });
  }

  try {
    // We use a free prayer times API (aladhan.com)
    // You can later replace this with a more specific Moroccan one if needed
    const prayerRes = await fetch(
      `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=Morocco&method=3`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    const prayerData = await prayerRes.json();

    // We use Open-Meteo (free, no API key required for non-commercial/small use)
    // To get exact coordinates, we could geocode, but for now we'll use a simple approach or a fallback
    // For production, consider using a geocoding API or a fixed list of coordinates
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=33.5731&longitude=-7.5898&current_weather=true`, // Fallback to Casa coord if needed
      { next: { revalidate: 1800 } } // Cache for 30 mins
    );
    const weatherData = await weatherRes.json();

    return NextResponse.json({
      prayer: prayerData.data?.timings || null,
      weather: weatherData.current_weather || null
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

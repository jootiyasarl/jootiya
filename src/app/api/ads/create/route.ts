import { NextResponse } from "next/server";
import { createAd } from "@/app/dashboard/ads/create/actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      title,
      price,
      currency,
      city,
      neighborhood,
      categorySlug,
      phone,
      whatsapp,
      description,
      searchRadiusKm,
    } = body ?? {};

    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 },
      );
    }

    if (typeof city !== "string" || !city.trim()) {
      return NextResponse.json(
        { error: "City is required." },
        { status: 400 },
      );
    }

    const priceNumber = Number(price);
    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      return NextResponse.json(
        { error: "Enter a valid price greater than zero." },
        { status: 400 },
      );
    }

    const trimmedPhone =
      typeof phone === "string" && phone.trim() ? phone.trim() : "";
    const trimmedWhatsapp =
      typeof whatsapp === "string" && whatsapp.trim() ? whatsapp.trim() : "";

    if (!trimmedPhone && !trimmedWhatsapp) {
      return NextResponse.json(
        { error: "Please provide a phone number or WhatsApp." },
        { status: 400 },
      );
    }

    const result = await createAd({
      title: title.trim(),
      price: priceNumber,
      currency:
        typeof currency === "string" && currency.trim()
          ? currency.trim()
          : "MAD",
      city: city.trim(),
      neighborhood:
        typeof neighborhood === "string" && neighborhood.trim()
          ? neighborhood.trim()
          : null,
      description:
        typeof description === "string" && description.trim()
          ? description.trim()
          : null,
      searchRadiusKm:
        typeof searchRadiusKm === "number" &&
        Number.isFinite(searchRadiusKm) &&
        searchRadiusKm > 0
          ? searchRadiusKm
          : undefined,
      categorySlug:
        typeof categorySlug === "string" && categorySlug.trim()
          ? categorySlug.trim()
          : undefined,
      phone: trimmedPhone || undefined,
      whatsapp: trimmedWhatsapp || undefined,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create ad", error);

    return NextResponse.json(
      { error: error?.message ?? "Failed to create ad." },
      { status: 400 },
    );
  }
}

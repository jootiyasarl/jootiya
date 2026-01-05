import { NextResponse } from "next/server";
import { createAd } from "./actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      title,
      description,
      price,
      currency,
      city,
      neighborhood,
      latitude,
      longitude,
      searchRadiusKm,
      isWholesale,
      categorySlug,
      phone,
      whatsapp,
      wholesalePrice,
      minQuantity,
    } = body ?? {};

    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 },
      );
    }

    if (typeof description !== "string" || !description.trim()) {
      return NextResponse.json(
        { error: "Description is required." },
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

    const radiusNumber = Number(searchRadiusKm);
    const effectiveRadius =
      Number.isFinite(radiusNumber) && radiusNumber > 0
        ? radiusNumber
        : null;

    const result = await createAd({
      title: title.trim(),
      description: description.trim(),
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
      latitude:
        typeof latitude === "number" && Number.isFinite(latitude)
          ? latitude
          : null,
      longitude:
        typeof longitude === "number" && Number.isFinite(longitude)
          ? longitude
          : null,
      searchRadiusKm: effectiveRadius,
      isWholesale: Boolean(isWholesale),
      categorySlug:
        typeof categorySlug === "string" && categorySlug.trim()
          ? categorySlug.trim()
          : undefined,
      phone:
        typeof phone === "string" && phone.trim() ? phone.trim() : undefined,
      whatsapp:
        typeof whatsapp === "string" && whatsapp.trim()
          ? whatsapp.trim()
          : undefined,
      wholesalePrice:
        typeof wholesalePrice === "number" &&
        Number.isFinite(wholesalePrice) &&
        wholesalePrice > 0
          ? wholesalePrice
          : null,
      minQuantity:
        typeof minQuantity === "number" &&
        Number.isFinite(minQuantity) &&
        minQuantity > 0
          ? Math.floor(minQuantity)
          : null,
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

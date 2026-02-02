import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default async function AdPage({
  params,
}: {
  // Be flexible with param shape to handle any segment key in production
  params: Record<string, string | string[]>;
}) {
  const rawParams = params ?? {};

  let id: string | undefined;

  // Prefer explicit known keys first
  const possibleKeys = ["id", "adId", "ad_id", "slug"];
  for (const key of possibleKeys) {
    const value = rawParams[key];
    if (typeof value === "string" && value) {
      id = value;
      break;
    }
  }

  // Fallback: first non-empty string value in params
  if (!id) {
    const first = Object.values(rawParams).find(
      (value): value is string => typeof value === "string" && value.length > 0,
    );
    if (first) {
      id = first;
    }
  }

  if (!id) {
    return <div>Ad not found (id: undefined)</div>;
  }

  // Validate that the id is a proper UUID before querying Supabase
  const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id,
  );

  if (!isValidUuid) {
    return <div>Ad not found (id: {String(id)})</div>;
  }

  const { data, error } = await supabase
    .from("ads")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return <div>Ad not found</div>;
  }

  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
      <p>Price: {data.price}</p>
    </div>
  );
}

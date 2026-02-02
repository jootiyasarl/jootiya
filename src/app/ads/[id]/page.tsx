import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default async function AdPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;

  // Validate that the id is a proper UUID before querying Supabase
  const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id ?? "",
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

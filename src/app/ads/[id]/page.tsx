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

  const { data, error } = await supabase
    .from("ads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return <div>Ad not found (id: {id})</div>;
  }

  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
      <p>Price: {data.price}</p>
    </div>
  );
}

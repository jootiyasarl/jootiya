-- Enable the pgvector extension to work with embeddings
create extension if not exists vector;

-- Add a vector column to the ads table
-- text-embedding-3-small uses 1536 dimensions
alter table ads add column if not exists embedding vector(1536);

-- Create a function to search for ads using vector similarity
create or replace function match_ads (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  title text,
  description text,
  price numeric,
  city text,
  images text[],
  category_id uuid,
  slug text,
  status text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    ads.id,
    ads.title,
    ads.description,
    ads.price,
    ads.city,
    ads.images,
    ads.category_id,
    ads.slug,
    ads.status,
    1 - (ads.embedding <=> query_embedding) as similarity
  from ads
  where 1 - (ads.embedding <=> query_embedding) > match_threshold
    and ads.status = 'active'
  order by ads.embedding <=> query_embedding
  limit match_count;
end;
$$;

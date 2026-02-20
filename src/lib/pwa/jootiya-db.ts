import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface JootiyaDB extends DBSchema {
  ads: {
    key: string;
    value: any;
  };
  posts: {
    key: string;
    value: any;
  };
  metadata: {
    key: string;
    value: {
      lastUpdated: number;
    };
  };
}

const DB_NAME = 'JootiyaDB';
const DB_VERSION = 1;

export async function getDB(): Promise<IDBPDatabase<JootiyaDB>> {
  return openDB<JootiyaDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore('ads');
      db.createObjectStore('posts');
      db.createObjectStore('metadata');
    },
  });
}

export async function saveAds(ads: any[]) {
  const db = await getDB();
  const tx = db.transaction('ads', 'readwrite');
  await tx.store.clear();
  for (const ad of ads) {
    await tx.store.put(ad, ad.id);
  }
  await tx.done;
  await updateMetadata();
}

export async function savePosts(posts: any[]) {
  const db = await getDB();
  const tx = db.transaction('posts', 'readwrite');
  await tx.store.clear();
  for (const post of posts) {
    await tx.store.put(post, post.id || post.slug);
  }
  await tx.done;
  await updateMetadata();
}

export async function getCachedAds() {
  const db = await getDB();
  return db.getAll('ads');
}

export async function getCachedPosts() {
  const db = await getDB();
  return db.getAll('posts');
}

async function updateMetadata() {
  const db = await getDB();
  await db.put('metadata', { lastUpdated: Date.now() }, 'sync_info');
}

export async function getLastUpdated() {
  const db = await getDB();
  const info = await db.get('metadata', 'sync_info');
  return info?.lastUpdated || 0;
}

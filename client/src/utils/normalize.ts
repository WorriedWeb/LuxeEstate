// src/utils/normalize.ts

// Base shape for anything coming from MongoDB
export type WithMongoId = {
  _id?: string | { toString(): string };
  id?: string;
};

// Normalized output type (frontend-safe)
export type Normalized<T> = Omit<T, '_id' | 'id'> & {
  id: string;
};

// Normalize single entity
export function normalizeMongoEntity<T extends WithMongoId>(
  entity: T
): Normalized<T> {
  const { _id, id, ...rest } = entity;

  return {
    ...(rest as Omit<T, '_id' | 'id'>),
    id: id ?? _id?.toString() ?? '',
  };
}

// Normalize array of entities
export function normalizeMongoArray<T extends WithMongoId>(
  data: T[]
): Normalized<T>[] {
  return data.map(normalizeMongoEntity);
}

export function normalizeMongoObject<T>(doc: any): T {
  if (!doc) return doc;

  const { _id, ...rest } = doc;

  return {
    id: _id,
    ...rest
  } as T;
}

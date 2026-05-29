import { useCallback, useEffect, useRef, useState } from 'react';
import { listProducts, DbProduct } from '../../lib/db';
import { mergeProducts } from './productFeed';
import { Product } from './mockProducts';

export function useProducts(): {
  products: Product[];
  dbProducts: DbProduct[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const requestRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++requestRef.current;
    const isActive = () => mountedRef.current && requestId === requestRef.current;
    if (isActive()) {
      setIsLoading(true);
      setError(null);
    }
    try {
      const rows = await listProducts();
      if (isActive()) {
        setDbProducts(rows);
        setError(null);
      }
    } catch {
      if (isActive()) {
        setError('Unable to load products. Check your connection and try again.');
        setDbProducts([]);
      }
    } finally {
      if (isActive()) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  return {
    dbProducts,
    products: mergeProducts(dbProducts),
    isLoading,
    error,
    refresh,
  };
}

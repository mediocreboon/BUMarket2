import { useCallback, useEffect, useRef, useState } from 'react';
import { listProducts, DbProduct } from '../../lib/db';
import { mergeProducts } from './productFeed';
import { Product } from './mockProducts';

export function useProducts(): {
  products: Product[];
  dbProducts: DbProduct[];
  isLoading: boolean;
  refresh: () => Promise<void>;
} {
  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);
  const requestRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++requestRef.current;
    const isActive = () => mountedRef.current && requestId === requestRef.current;
    if (isActive()) setIsLoading(true);
    try {
      const rows = await listProducts();
      if (isActive()) setDbProducts(rows);
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
    refresh,
  };
}

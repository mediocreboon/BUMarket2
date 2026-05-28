import { useCallback, useEffect, useState } from 'react';
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

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const rows = await listProducts();
      setDbProducts(rows);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    dbProducts,
    products: mergeProducts(dbProducts),
    isLoading,
    refresh,
  };
}

/**
 * Hooks customizados para o projeto
 */

import { useState, useEffect } from 'react';
import { ApiResponse } from '@/types';

type FormValueMap = Record<string, unknown>;

/**
 * Hook para fazer requisições à API com carregamento e tratamento de erros
 */
export function useApi<T>(
  fetchFn: () => Promise<ApiResponse<T>>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve()
      .then(() => {
        if (!cancelled) {
          setLoading(true);
          setError(null);
        }

        return fetchFn();
      })
      .then((response) => {
        if (cancelled) {
          return;
        }

        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError(response.error || 'Erro ao carregar dados');
        }
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }

        setError('Erro de conexão');
        console.error('useApi error:', err);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetchFn]);

  return { data, loading, error };
}

/**
 * Hook para gerenciar estados de formulário
 */
export function useForm<T extends FormValueMap>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const reset = () => {
    setValues(initialValues);
    setTouched({});
    setErrors({});
  };

  const setFieldError = (field: string, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  return {
    values,
    setValues,
    touched,
    errors,
    setFieldError,
    handleChange,
    handleBlur,
    reset,
  };
}

/**
 * Hook para detecção de tamanho de tela (responsive)
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/**
 * Hook para modo escuro
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return (
      localStorage.getItem('darkMode') === 'true' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  const toggle = () => {
    setIsDark((prev) => {
      const newValue = !prev;
      localStorage.setItem('darkMode', String(newValue));
      return newValue;
    });
  };

  return { isDark, toggle };
}

/**
 * Hook para debounce de valores
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error writing to localStorage: ${key}`, error);
    }
  };

  return [storedValue, setValue] as const;
}

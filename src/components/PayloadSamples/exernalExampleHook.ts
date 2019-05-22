import { useEffect, useRef, useState } from 'react';
import { ExampleModel } from '../../services/models/Example';

export function useExternalExample(example: ExampleModel, mimeType: string) {
  const [, setIsLoading] = useState(true); // to trigger component reload

  const value = useRef<any>(undefined);
  const prevRef = useRef<ExampleModel | undefined>(undefined);

  if (prevRef.current !== example) {
    value.current = undefined;
  }

  prevRef.current = example;

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        value.current = await example.getExternalValue(mimeType);
      } catch (e) {
        value.current = e;
      }
      setIsLoading(false);
    };

    load();
  }, [example, mimeType]);

  return value.current;
}

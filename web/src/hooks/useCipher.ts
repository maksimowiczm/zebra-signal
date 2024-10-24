import { useEffect, useState } from "react";
import { useIndexedDB } from "./useIndexedDB.ts";

interface UseCipherResultBase {
  isLoading: boolean;
  key: CryptoKey | undefined;
  isError: boolean;
}

interface UseCipherLoading extends UseCipherResultBase {
  isLoading: true;
  key: undefined;
  isError: false;
}

interface UseCipherSuccess extends UseCipherResultBase {
  isLoading: false;
  key: CryptoKey;
  isError: false;
}

interface UseCipherError extends UseCipherResultBase {
  isLoading: false;
  key: undefined;
  isError: true;
}

export type UseCipherResult =
  | UseCipherLoading
  | UseCipherSuccess
  | UseCipherError;

export function useCipher(): UseCipherResult {
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [isError, setIsError] = useState(false);

  const {
    isLoading,
    db,
    isError: isDBError,
  } = useIndexedDB({
    databaseName: "cryptoDB",
    version: 1,
    onUpgradeNeeded: (ev) => {
      const db = (ev.target as IDBOpenDBRequest).result;
      db.createObjectStore("cryptoStore");
    },
  });

  // Fetch or create the key
  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isDBError) {
      setIsError(true);
      return;
    }

    const persistKey = (key: CryptoKey) => {
      const request = db!!
        .transaction("cryptoStore", "readwrite")
        .objectStore("cryptoStore")
        .put(key, "key");

      request.onerror = () => setIsError(true);
      request.onsuccess = () => setKey(key);
    };

    const request = db!!
      .transaction("cryptoStore", "readonly")
      .objectStore("cryptoStore")
      .get("key");

    request.onerror = () => setIsError(true);
    request.onsuccess = (ev: Event) => {
      const fetchedKey = (ev.target as IDBRequest).result;

      if (!fetchedKey) {
        window.crypto.subtle
          .generateKey({ name: "AES-GCM", length: 256 }, true, [
            "encrypt",
            "decrypt",
          ])
          .then((key) => persistKey(key))
          .catch(() => setIsError(true));
      }

      setKey(fetchedKey);
    };

    return () => {
      request.onerror = null;
      request.onsuccess = null;
    };
  }, [isLoading, isDBError]);

  if (isError) {
    return { isLoading: false, key: undefined, isError: true };
  }

  if (!key) {
    return { isLoading: true, key: undefined, isError: false };
  }

  return { isLoading: false, key, isError: false };
}

interface Cipher {
  iv: Uint8Array;
  encryptedData: ArrayBuffer;
}

export async function encryptData(
  key: CryptoKey,
  data: string,
): Promise<Cipher> {
  const encodedData = new TextEncoder().encode(data);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encodedData,
  );

  return { iv, encryptedData };
}

export async function decryptData(
  key: CryptoKey,
  { iv, encryptedData }: Cipher,
): Promise<string> {
  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encryptedData,
  );

  return new TextDecoder().decode(decryptedData);
}

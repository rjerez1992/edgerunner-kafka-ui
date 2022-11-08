import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() {}

   get = (key: string): any => {
    return window.store.get(key);
   }

   set = (key: string, value: any): void => {
    return window.store.set(key, value);
   }

   isSafeAvailable = () : Promise<boolean> => {
    return window.store.hasSafe();
   }

   safeSet = (value: string) : Promise<Buffer> => {
    return window.store.safeSet(value);
   }

   safeGet = (encryptedValue: Buffer) : Promise<string> => {
    return window.store.safeGet(encryptedValue);
   }
}

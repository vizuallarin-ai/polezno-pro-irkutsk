import type * as ymaps3 from "@yandex/ymaps3-types";

declare global {
  interface Window {
    ymaps3: typeof ymaps3;
  }
}

export {};

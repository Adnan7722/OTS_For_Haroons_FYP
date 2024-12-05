// src/service-worker.js
import { precacheAndRoute } from 'workbox-precaching';

self.__WB_MANIFEST = []; // This will be populated by Workbox during build

precacheAndRoute(self.__WB_MANIFEST);

// Add any additional caching strategies here if needed
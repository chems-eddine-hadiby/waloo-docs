# Waloo Performance & Egress Optimization Guide

This document outlines the architectural changes implemented to optimize the Waloo application for performance, scalability, and minimal Supabase storage egress.

## Architecture Overview
We have implemented a **multi-layered optimization strategy** that balances fast UI responsiveness with minimized network requests and efficient database utilization.

---

## 1. Data Layer Caching (React Query)
To reduce redundant network requests, we migrated from manual `useState`/`useEffect` fetching to **TanStack Query (React Query)**.

*   **How it works**: Every data-heavy screen now uses `useQuery` or `useInfiniteQuery`. 
*   **Benefits**:
    *   **Automatic Deduplication**: If multiple components request the same data simultaneously, only one network request is made.
    *   **Stale-While-Revalidate**: Screens show cached data instantly and fetch fresh data in the background.
    *   **Reduced Database Load**: Queries are only re-executed when `staleTime` expires or an explicit `refetch()` is called.

---

## 2. Media Layer Caching & Egress Reduction
Storage egress was previously driven by re-downloading images on every screen switch because each request generated a unique signed URL.

### A. Persistent Disk Caching
*   **Implementation**: Replaced React Native `Image` components with `expo-image` across all screens (Activity, Store Profile, Inventory, Marketplace).
*   **Impact**: Images are stored in native persistent disk cache. Once downloaded, they load from local storage on subsequent visits, resulting in **zero network egress** for repeat views.

### B. Stable URL Resolution
*   **Implementation**: Added `urlCache` (in `lib/profile.ts`) that persists signed URLs in memory for **23 hours**.
*   **Why**: By ensuring the same `uri` is passed to `expo-image`, the image library correctly maps the URL to the cached file on disk.

### C. Image Transformations
*   **Implementation**: Used `getOptimizedImageUrl` for all storage-backed images.
*   **Impact**: We now request specific image sizes (e.g., `width: 200` for avatars, `width: 600` for gallery) directly from Supabase, preventing the download of full-resolution 5MB+ source images when only a thumbnail is needed.

---

## 3. Server-Side Efficiency
To prevent overwhelming the database, we moved high-volume tasks from the client to the server:

*   **Cursor-Based Pagination**: Refactored transaction fetching to use a secure, cursor-based RPC (`rpc_get_transactions_page`). This ensures only the requested "page" of data is returned, preventing large query overheads.
*   **Automated Maintenance**: Used `pg_cron` to perform background cleanup (e.g., stale Chargily payments, expired items, no-shows). This moves heavy maintenance work off the user session and onto the database engine itself.

---

## Best Practices for Future Development

### When adding new screens:
1.  **Always use `useQuery`** for fetching data.
2.  **Always use `ExpoImage`** for displaying images from storage.
3.  **Always resolve images** via `getOptimizedImageUrl` (for items) or `resolveAvatarUrl` (for profiles).
4.  **Use `forceRefresh: true`** in image resolution functions **only** when you have just uploaded a new image to storage and need to bypass the 23-hour URL cache.
5.  **Use `refetch()`** from `useQuery` after performing mutations (e.g., deleting an item, updating a review) to ensure the UI stays in sync.

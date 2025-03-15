"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * A React hook that warns the user about unsaved changes when attempting to navigate away.
 *
 * @remarks
 * This hook intercepts several navigation events to prevent data loss:
 *
 * - Adds a "beforeunload" event listener that triggers the browser's confirmation dialog.
 * - Overrides router's push and replace methods to display a custom confirmation prompt before navigating.
 * - Listens to "click" events on anchor elements to intercept link clicks and prompt the user.
 * - Listens to the "popstate" event (triggered by browser back/forward buttons) to confirm navigation.
 *
 * When the user confirms navigation, the original navigation behavior proceeds. If the user cancels,
 * the navigation event is prevented.
 *
 * @param unsavedChanges - A boolean flag indicating whether there are unsaved changes that require confirmation.
 */

export const useWarnIfUnsavedChanges = (unsavedChanges: boolean) => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (unsavedChanges) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "";
      };

      const handleLinkClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const anchor = target.closest("a");
        
        if (anchor && !confirm("¿Salir sin guardar los cambios?")) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      };

      const originalPush = router.push;
      const originalReplace = router.replace;

      router.push = (...args: Parameters<typeof originalPush>) => {
        if (!confirm("¿Salir sin guardar los cambios?")) {
          return Promise.resolve();
        }
        return originalPush.apply(router, args);
      };

      router.replace = (...args: Parameters<typeof originalReplace>) => {
        if (!confirm("¿Salir sin guardar los cambios?")) {
          return Promise.resolve();
        }
        return originalReplace.apply(router, args);
      };

      const handlePopState = () => {
        if (!confirm("¿Salir sin guardar los cambios?")) {
          window.history.pushState(null, "", pathname);
        }
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      document.addEventListener("click", handleLinkClick, true);
      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        document.removeEventListener("click", handleLinkClick, true);
        window.removeEventListener("popstate", handlePopState);
      
        router.push = originalPush;
        router.replace = originalReplace;
      };
    }
  }, [unsavedChanges, router, pathname]);
};
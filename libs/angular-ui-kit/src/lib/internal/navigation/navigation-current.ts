import type { Router } from '@angular/router';
import type { NavigationItem } from '@lifecorner/angular-ui-kit/models';

/**
 * The side navigation's current-item rules (3.5, AS-16), moved out of
 * `lc-sidenav` unchanged (3.6, AS-18) so `lc-sidenav-placeholder` expands the
 * same groups before the sidenav has loaded.
 *
 * @internal
 */

/** The items sorted by `displayOrder`. */
export function sortNavigationItems(items: readonly NavigationItem[]): NavigationItem[] {
  return [...items].sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Every item rendered as a link, in display order (depth first): simple
 * items, the children of a group, the children of a section, and the
 * children of a section's sub-group. 3.47 (usm-x row 40): groups nest to any
 * depth, so a group's child with children is a group too (its children are
 * the links); up to three levels the list is the same as before.
 */
export function navigationLinks(sortedItems: readonly NavigationItem[]): NavigationItem[] {
  const links: NavigationItem[] = [];
  const collect = (item: NavigationItem): void => {
    if (isNavigationGroup(item)) for (const child of item.children ?? []) collect(child);
    else links.push(item);
  };
  for (const item of sortedItems) {
    if (item.isSection) for (const child of item.children ?? []) collect(child);
    else collect(item);
  }
  return links;
}

/** The items from the top level down to `target`'s parent (3.47), or null when `target` isn't in the tree. */
function ancestorsOf(items: readonly NavigationItem[], target: NavigationItem, path: NavigationItem[]): NavigationItem[] | null {
  for (const item of items) {
    if (item === target) return path;
    if (item.children?.length) {
      const found = ancestorsOf(item.children, target, [...path, item]);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Whether the item is a collapsible group: it has children, or (3.44) loads
 * them on demand (`hasChildren`), also while it has none yet.
 */
export function isNavigationGroup(item: NavigationItem): boolean {
  return !!item.children?.length || !!item.hasChildren;
}

/** The routes an item is current for (3.44): `route`, then `matchRoutes`. Action items have none. */
function routesOf(link: NavigationItem): string[] {
  if (link.kind === 'action') return [];
  return link.matchRoutes?.length ? [link.route, ...link.matchRoutes] : [link.route];
}

/** The router URL's path: primary outlet only, no query, fragment or matrix parameters. */
export function navigationPath(router: Pick<Router, 'parseUrl'>, url: string): string {
  const segments = router.parseUrl(url).root.children['primary']?.segments ?? [];
  return `/${segments.map((segment) => segment.path).join('/')}`;
}

/**
 * The one current link (or none). 3.44: the first link with `current` wins.
 * With `activeRoute` set: the first link whose route equals it. Without: the
 * router's path — the exact match wins, otherwise the longest link route the
 * path continues with a `/` (`/` matches only `/`); ties go to the first link
 * in display order. 3.44: a link's `matchRoutes` count as its routes, and
 * action items (`kind: 'action'`) are never matched by a route.
 */
export function currentNavigationItem(
  links: readonly NavigationItem[],
  activeRoute: string,
  path: string,
): NavigationItem | null {
  const flagged = links.find((link) => link.current);
  if (flagged) return flagged;
  if (activeRoute !== '') return links.find((link) => routesOf(link).includes(activeRoute)) ?? null;
  const exact = links.find((link) => routesOf(link).includes(path));
  if (exact) return exact;
  let best: NavigationItem | null = null;
  let bestLength = 0;
  for (const link of links) {
    for (const route of routesOf(link)) {
      if (!route || route === '/' || !path.startsWith(`${route}/`)) continue;
      if (!best || route.length > bestLength) {
        best = link;
        bestLength = route.length;
      }
    }
  }
  return best;
}

/**
 * Ids of the collapsible parents (top-level groups, section sub-groups) that
 * contain the current item. 3.47: every group above it, at any depth, top
 * down (sections are not groups).
 */
export function currentItemParents(items: readonly NavigationItem[], current: NavigationItem | null): string[] {
  if (!current) return [];
  return (ancestorsOf(items, current, []) ?? []).filter((item) => !item.isSection).map((item) => item.id);
}

export function setSidebarCookie(isOpen: boolean) {
  document.cookie = `sidebar:state=${isOpen}; path=/; max-age=${60 * 60 * 24 * 365}`;
}
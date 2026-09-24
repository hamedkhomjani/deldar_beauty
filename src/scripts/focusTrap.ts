/**
 * Shared keyboard focus trap for a single active dialog/drawer.
 *
 * Usage: in a container-level keydown handler:
 *   document.addEventListener('keydown', (e) => { trapTab(e, dialog); ... })
 *
 * Prevents Tab/Shift+Tab from leaving the dialog while it is open,
 * and wraps focus from the first to the last focusable control.
 */
export function trapTab(e: KeyboardEvent, container: Element | null): void {
  if (e.key !== 'Tab' || !container) return;

  const focusables = Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), summary, input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.offsetParent !== null || el === document.activeElement);

  // No visible focusable control: park focus on the dialog itself.
  if (focusables.length === 0) {
    e.preventDefault();
    (container as HTMLElement).focus();
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement as HTMLElement | null;
  const activeInside = active !== null && container.contains(active);

  if (!activeInside) {
    e.preventDefault();
    first.focus();
  } else if (e.shiftKey && active === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}
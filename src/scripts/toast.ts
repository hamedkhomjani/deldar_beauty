/**
 * Tiny toast notification helper (shared by cart.ts & booking.ts).
 * Renders a transient bottom-center pill; purely additive.
 */
export function showToast(message: string): void {
  let container = document.querySelector<HTMLElement>('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 2600);
}
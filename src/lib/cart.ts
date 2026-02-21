export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

export function saveCart(cart: CartItem[]) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  const existing = cart.find(p => p.productId === item.productId);

  if (existing) existing.quantity += item.quantity;
  else cart.push(item);

  saveCart(cart);
}

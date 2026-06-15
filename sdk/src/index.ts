/**
 * @vela/sdk — Client SDK for Vela Storefront
 *
 * Wraps Medusa JS SDK (commerce) and Vela Engine HTTP API (AI analytics).
 *
 * @example
 * ```ts
 * import { VelaSDK } from '@vela/sdk'
 *
 * const vela = new VelaSDK({
 *   baseUrl: 'https://api.myshop.com',
 *   publishableKey: 'pk_xxx',
 * })
 *
 * const products = await vela.products.list()
 * const cart = await vela.cart.create()
 * await vela.cart.addLineItem(cart.id, variantId, 2)
 * const order = await vela.checkout.complete(cart.id)
 *
 * const recs = await vela.ai.recommend(productId)
 * const insight = await vela.ai.customerLTV(email)
 * ```
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export interface VelaConfig {
  /** Medusa backend URL (e.g., https://api.myshop.com) */
  baseUrl: string
  /** Medusa publishable API key */
  publishableKey: string
  /** Vela Engine URL (defaults to baseUrl) */
  engineUrl?: string
}

export interface Product {
  id: string
  title: string
  handle: string
  description: string
  thumbnail: string
  images: { url: string; alt: string }[]
  variants: ProductVariant[]
  price: { amount: number; currency_code: string }
  categories: { id: string; name: string }[]
}

export interface ProductVariant {
  id: string
  title: string
  sku: string
  prices: { amount: number; currency_code: string }[]
  inventory_quantity: number
  options: { name: string; value: string }[]
}

export interface CartItem {
  id: string
  title: string
  quantity: number
  unit_price: number
  thumbnail: string
  variant_id: string
  product_id: string
}

export interface Cart {
  id: string
  items: CartItem[]
  subtotal: number
  shipping_total: number
  tax_total: number
  total: number
  region: { id: string; name: string; currency_code: string }
}

export interface ShippingOption {
  id: string
  name: string
  amount: number
}

export interface Customer {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  has_account: boolean
}

export interface Order {
  id: string
  display_id: string
  status: string
  fulfillment_status: string
  payment_status: string
  total: number
  currency_code: string
  items: CartItem[]
  created_at: string
}

export interface Recommendation {
  product_id: number
  title: string
  image_url: string
  price: string
  score: number
  reason: string
}

export interface CustomerInsight {
  email: string
  name: string
  predicted_ltv: number
  total_spent: number
  order_count: number
  churn_risk_score: number
  churn_risk_level: 'low' | 'medium' | 'high'
  confidence: 'low' | 'medium' | 'high'
  segment: string
  active_probability: number
  avg_order_value: number
  avg_order_interval_days: number
}

// ── SDK Client ─────────────────────────────────────────────────────────────────

export class VelaSDK {
  private baseUrl: string
  private publishableKey: string
  private engineUrl: string

  constructor(config: VelaConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '')
    this.publishableKey = config.publishableKey
    this.engineUrl = (config.engineUrl || config.baseUrl).replace(/\/$/, '')
  }

  private async fetch(path: string, options?: RequestInit): Promise<any> {
    const url = `${this.baseUrl}/store${path}`
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': this.publishableKey,
        ...options?.headers,
      },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(err.message || `HTTP ${res.status}`)
    }
    return res.json()
  }

  // ── Commerce: Products ──────────────────────────────────────────────────

  products = {
    list: async (params?: { limit?: number; offset?: number; category_id?: string }): Promise<{ products: Product[]; count: number }> => {
      const qs = new URLSearchParams()
      if (params?.limit) qs.set('limit', String(params.limit))
      if (params?.offset) qs.set('offset', String(params.offset))
      if (params?.category_id) qs.set('category_id', params.category_id)
      return this.fetch(`/products?${qs}`)
    },
    get: async (id: string): Promise<{ product: Product }> => {
      return this.fetch(`/products/${id}`)
    },
  }

  // ── Commerce: Cart ──────────────────────────────────────────────────────

  cart = {
    create: async (): Promise<{ cart: Cart }> => {
      return this.fetch('/carts', { method: 'POST', body: '{}' })
    },
    get: async (id: string): Promise<{ cart: Cart }> => {
      return this.fetch(`/carts/${id}`)
    },
    addLineItem: async (cartId: string, variantId: string, quantity: number = 1): Promise<{ cart: Cart }> => {
      return this.fetch(`/carts/${cartId}/line-items`, {
        method: 'POST',
        body: JSON.stringify({ variant_id: variantId, quantity }),
      })
    },
    setShippingAddress: async (cartId: string, address: {
      first_name: string; last_name: string
      address_1: string; address_2?: string
      city: string; country_code: string; postal_code: string
      phone?: string
    }): Promise<{ cart: Cart }> => {
      return this.fetch(`/carts/${cartId}`, {
        method: 'POST',
        body: JSON.stringify({ shipping_address: address }),
      })
    },
  }

  // ── Commerce: Shipping ──────────────────────────────────────────────────

  shipping = {
    getOptions: async (cartId: string): Promise<{ shipping_options: ShippingOption[] }> => {
      return this.fetch(`/shipping-options?cart_id=${cartId}`)
    },
    selectMethod: async (cartId: string, optionId: string): Promise<{ cart: Cart }> => {
      return this.fetch(`/carts/${cartId}/shipping-methods`, {
        method: 'POST',
        body: JSON.stringify({ option_id: optionId }),
      })
    },
  }

  // ── Commerce: Checkout ──────────────────────────────────────────────────

  checkout = {
    initializePayment: async (cartId: string): Promise<any> => {
      return this.fetch('/payment-collections', {
        method: 'POST',
        body: JSON.stringify({ cart_id: cartId }),
      })
    },
    complete: async (cartId: string): Promise<{ type: 'order'; order: Order }> => {
      return this.fetch(`/carts/${cartId}/complete`, { method: 'POST' })
    },
  }

  // ── Commerce: Orders ────────────────────────────────────────────────────

  orders = {
    list: async (params?: { limit?: number; offset?: number }): Promise<{ orders: Order[]; count: number }> => {
      const qs = new URLSearchParams()
      if (params?.limit) qs.set('limit', String(params.limit))
      if (params?.offset) qs.set('offset', String(params.offset))
      return this.fetch(`/orders?${qs}`)
    },
    get: async (id: string): Promise<{ order: Order }> => {
      return this.fetch(`/orders/${id}`)
    },
  }

  // ── Commerce: Customer ───────────────────────────────────────────────────

  customers = {
    login: async (email: string, password: string): Promise<{ token: string }> => {
      return this.fetch('/auth/customer/emailpass', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
    },
    register: async (data: { email: string; password: string; first_name: string; last_name: string }): Promise<{ customer: Customer; token: string }> => {
      return this.fetch('/customers', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    getMe: async (): Promise<{ customer: Customer }> => {
      return this.fetch('/customers/me')
    },
  }

  // ── AI: Vela Engine ──────────────────────────────────────────────────────

  ai = {
    /** Frequently Bought Together recommendations */
    recommend: async (productId: number, limit: number = 4): Promise<{ recommendations: Recommendation[] }> => {
      const res = await fetch(`${this.engineUrl}/api/recommendations/fbt?product_id=${productId}&limit=${limit}`)
      return res.json()
    },
    /** Trending products */
    trending: async (limit: number = 8): Promise<{ recommendations: Recommendation[] }> => {
      const res = await fetch(`${this.engineUrl}/api/recommendations/trending?limit=${limit}`)
      return res.json()
    },
    /** Customer LTV + churn prediction */
    customerLTV: async (email: string): Promise<{ insight: CustomerInsight }> => {
      const res = await fetch(`${this.engineUrl}/api/insights/customer?email=${encodeURIComponent(email)}`)
      return res.json()
    },
    /** AI sales agent chat (streaming) */
    chat: async (message: string, sessionId?: string): Promise<Response> => {
      return fetch(`${this.engineUrl}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, session_id: sessionId }),
      })
    },
  }
}

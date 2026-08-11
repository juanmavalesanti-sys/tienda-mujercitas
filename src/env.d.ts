/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user: { id: number; email: string; nombre: string; rol: 'admin' | 'cliente' } | null;
  }
}

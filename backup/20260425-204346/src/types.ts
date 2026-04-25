/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Tab = 'home' | 'stall' | 'business' | 'messages' | 'settings';

export interface ItemEntry {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface Notification {
  id: number;
  title: string;
  content: string;
  time: string;
  type: string;
}

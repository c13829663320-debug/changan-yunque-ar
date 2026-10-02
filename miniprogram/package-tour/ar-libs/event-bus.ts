/**
 * 轻量事件总线（AR 层内部解耦）
 * 组件 / libs 通过它通信，避免跨层直接引用；页面与各层各自创建实例或共享单例。
 */
import { AREventMap } from './types';

export type AREventName = keyof AREventMap;
export type AREventHandler<K extends AREventName> = (payload: AREventMap[K]) => void;

export class AREventBus {
  private handlers: { [K in AREventName]?: Array<AREventHandler<K>> } = {};

  on<K extends AREventName>(name: K, fn: AREventHandler<K>): this {
    const list = (this.handlers[name] ||= []) as Array<AREventHandler<K>>;
    list.push(fn);
    return this;
  }

  off<K extends AREventName>(name: K, fn: AREventHandler<K>): this {
    const list = this.handlers[name] as Array<AREventHandler<K>> | undefined;
    if (list) {
      const i = list.indexOf(fn);
      if (i >= 0) list.splice(i, 1);
    }
    return this;
  }

  emit<K extends AREventName>(name: K, payload: AREventMap[K]): void {
    const list = this.handlers[name] as Array<AREventHandler<K>> | undefined;
    if (list) {
      // 拷贝一份，回调中即使 off 也不影响本轮遍历
      for (const fn of list.slice()) {
        try {
          fn(payload);
        } catch (e) {
          // 单个监听器异常不影响其他监听器
          console.warn('[AR event] handler error:', name, e);
        }
      }
    }
  }

  clear(): void {
    this.handlers = {};
  }
}

/** 模块级共享单例（同一页面生命周期内可直接复用） */
export const arBus = new AREventBus();

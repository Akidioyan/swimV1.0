export function getOrCreateDeviceId() {
    // 1) 先看 localStorage 里是否已有
    let id = null;
    try {
        id = localStorage.getItem('deviceId');
    } catch (e) {
        console.warn('[device.js] Failed to read deviceId from localStorage:', e);
    }

    if (id) {
        return id;
    }

    // 2) 生成：优先用 crypto.randomUUID
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        id = crypto.randomUUID();
    } else {
        // 老浏览器 fallback，生成类 UUID 字符串
        id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    // 3) 持久化，下次直接用
    try {
        localStorage.setItem('deviceId', id);
    } catch (e) {
        console.warn('[device.js] Failed to persist deviceId to localStorage:', e);
        // 如果持久化失败，ID 仍然在当前会话中生成并返回
    }
    return id;
}
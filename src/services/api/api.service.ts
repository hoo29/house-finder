import rp from 'request-promise-native';

export const api = async (method: keyof typeof rp, url: string, options: rp.RequestPromiseOptions) =>
    (rp[method] as typeof rp)(url, options);

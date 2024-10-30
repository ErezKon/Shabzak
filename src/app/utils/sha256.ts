import * as sha512 from 'js-sha512';

export const encryptSHA = (value: string) => sha512.sha512(value);
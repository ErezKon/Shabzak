import * as CryptoJS from 'crypto-js'; 
import { environment } from '../../environments/environment';

const key = environment.key;

export const encryptAES = (message: string) => {
    return CryptoJS.AES.encrypt( message.trim(), key).toString();
}

export const decryptAES = (message: string) => {
    return CryptoJS.AES.decrypt( message.trim(), key).toString(CryptoJS.enc.Utf8);
}
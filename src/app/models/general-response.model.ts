export interface GeneralResponseBase {
    success: boolean;
    errorMessage?: string;
}
export interface GeneralResponse<T> extends GeneralResponseBase {
    value?: T;
}
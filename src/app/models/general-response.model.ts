export interface GeneralResponse<T> {
    success: boolean;
    errorMessage?: string;
    value?: T;
}
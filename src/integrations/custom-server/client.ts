import axios, { AxiosRequestConfig } from "axios";

interface ClientOptions {
 token?: string;
}

interface HttpOptions {
 onSuccess?: (data: any) => void;
 onError?: (error: any) => void;
 onLoading?: (loading: boolean) => void;
}

type clientProps = AxiosRequestConfig<any> & ClientOptions;
export type httpProps = HttpOptions & ClientOptions;

export class CustomServerClient {
 static async client({ token, ...options }: clientProps) {
  return await axios.request({
   ...options,
   headers: {
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
   }
  })
 }

 static async http({ onSuccess, onError, onLoading, ...options }: httpProps & AxiosRequestConfig<any>) {
  onLoading && onLoading(true);
  return await CustomServerClient.client(options).then((response) => {
   const data = response.data;

   onSuccess && onSuccess(data);
   return data;
  }).catch((error) => {
   const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';

   onError && onError(errorMessage);
   return errorMessage;
  }).finally(() => {
   onLoading && onLoading(false);
  })
 }
}

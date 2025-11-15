import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

/* interface NetRequestInterceptors<T = AxiosResponse> {
    requestInterceptor?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig,
    requestInterceptorCatch?: (error: any) => any,
    responseInterceptor?: <config: T) => T,
    responseInterceptorCatch?: (error: any) => any
} */

interface NetRequestInterceptors {
    requestInterceptor?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig,
    requestInterceptorCatch?: (error: any) => any,
    responseInterceptor?: <T = AxiosResponse>(config: T) => T,
    responseInterceptorCatch?: (error: any) => any
}

interface NetRequestConfig extends AxiosRequestConfig {
    interceptors?: NetRequestInterceptors,
    /*headers: {
        Accept: "AxiosHeaderValue",
        "Content-Length": "AxiosHeaderValue",
        "User-Agent": "AxiosHeaderValue",
        "Content-Encoding": "AxiosHeaderValue",
        Authorization: "AxiosHeaderValue",
        AxiosHeaders: axiosHeaders
    },*/
}

const mapErrorStatus = new Map([
    [400, '请求错误'],
    [401, '请重新登录'],
    [403, '拒绝访问'],
    [404, '请求地址有误'],
    [405, '请求方法未允许'],
    [408, '请求超时'],
    [500, '服务器内部错误'],
    [501, '服务未实现'],
    [502, '网络错误'],
    [503, '服务不可用'],
    [504, '网络超时'],
    [505, 'HTTP版本不受支持']
])

class CNetRequest {
    instance: AxiosInstance;
    interceptors?: NetRequestInterceptors;

    constructor(config: NetRequestConfig) {
        this.instance = axios.create(config);

        this.interceptors = config.interceptors;

        // interceptors for single instance
        this.instance.interceptors.request.use(
            this.interceptors?.requestInterceptor,
            this.interceptors?.requestInterceptorCatch
        )
        this.instance.interceptors.response.use(
            this.interceptors?.responseInterceptor,
            this.interceptors?.responseInterceptorCatch
        )

        // interceptors for all instance
        this.instance.interceptors.request.use((config) => {
            return config;
        }, err => {
            console.log("instance for all interceptor request fail");
            return err;
        })
        this.instance.interceptors.response.use((res) => {
            return res.data;
        }, err => {
            console.log("instance for all interceptor response fail");
            console.log(err.response.status);   // error code like 404
            return err;
        })
    }

    request<T = any>(config: NetRequestConfig): Promise<T> {
        return new Promise((resolve, reject) => {
            if (config.interceptors?.requestInterceptor) {
                config = config.interceptors.requestInterceptor(config as any);
            }
            this.instance.request<any, T, any>(config).then((res) => {
                if (config.interceptors?.responseInterceptor) {
                    res = config.interceptors.responseInterceptor<T>(res);
                }
                // console.log(res);
                resolve(res);
            }).catch(err => {
                reject(err);
                return err;
            })
            // .finally(() => {})
        })
    }

    get<T = any>(config: NetRequestConfig): Promise<T> {
        return this.request<T>({ ...config, method: 'GET' });
    }

    post<T = any>(config: NetRequestConfig): Promise<T> {
        return this.request<T>({ ...config, method: 'POST' });
    }

    delete<T = any>(config: NetRequestConfig): Promise<T> {
        return this.request<T>({ ...config, method: 'DELETE' });
    }

    patch<T = any>(config: NetRequestConfig): Promise<T> {
        return this.request<T>({ ...config, method: 'PATCH' });
    }
}

export default CNetRequest;
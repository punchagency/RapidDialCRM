import { CustomServerClient } from "./client";

interface EndpointParserProps {
  raw_endpoint?: string;
  params?: Record<string, string>;
  queryParams?: Record<string, string>;
}

class EndpointHelper {
  static parser({
    raw_endpoint,
    params = {},
    queryParams = {},
  }: EndpointParserProps) {
    if (!raw_endpoint) throw new Error("Endpoint is required");
    let [method, endpoint] = raw_endpoint.split(" ");

    let endpointWithValue = endpoint;
    Object.entries(params).forEach(([k, v]) => {
      endpointWithValue = endpointWithValue.replace(`:${k}`, v);
    });

    let queries = "";
    Object.entries(queryParams).forEach(([k, v], i) => {
      if (i === 0) {
        queries += `?${k}=${v}`;
      } else {
        queries += `&${k}=${v}`;
      }
    });

    return {
      endpoint: endpointWithValue + queries,
      method,
    };
  }
}

interface ApiResponse<T = any> {
  has_error: boolean;
  message: string;
  data?: T;
  [key: string]: any;
}

export class ApiPrep {
  // Get authorization token from localStorage
  private static getAuthToken(): string | null {
    try {
      const authData = localStorage.getItem("auth.user");
      if (authData) {
        const parsedData = JSON.parse(authData);
        return parsedData.access_token || parsedData.token || null;
      }
      // Fallback key
      const fallback = localStorage.getItem("auth_token");
      if (fallback) return fallback;
    } catch (error) {
      console.error("Error getting auth token:", error);
    }
    return null;
  }

  // Refresh token when it expires
  private static async refreshAuthToken(): Promise<string | null> {
    try {
      const authData = localStorage.getItem("auth.user");
      if (!authData) return null;

      const parsedData = JSON.parse(authData);
      const refreshToken = parsedData.refresh_token;

      if (!refreshToken) return null;

      // Note: Auth endpoints not yet implemented in backend
      // When auth is implemented, uncomment this:
      // const { data, error } = await this.makeRequest(API_ENDPOINTS.auth.refresh, { refresh_token: refreshToken });
      // if (error || !data) return null;
      // const updatedAuthData = { ...parsedData, access_token: data.access_token, refresh_token: data.refresh_token || refreshToken };
      // localStorage.setItem('auth.user', JSON.stringify(updatedAuthData));
      // return data.access_token;

      // For now, return null as auth is not implemented
      return null;
    } catch (error) {
      localStorage.removeItem("auth.user");
      console.error("Error refreshing token:", error);
      return null;
    }
  }

  // Generic method for making API calls
  static async makeRequest<T = any>(
    endpoint: string,
    data?: any,
    config?: Partial<EndpointParserProps>
  ): Promise<{
    data: T | null;
    error: string | null;
    loading: boolean;
    total?: number;
    [key: string]: any;
  }> {
    const { endpoint: parsedEndpoint, method } = EndpointHelper.parser({
      raw_endpoint: endpoint,
      params: config?.params,
      queryParams: config?.queryParams,
    });

    const url = import.meta.env.VITE_CUSTOM_SERVER_URL + parsedEndpoint;
    let token = this.getAuthToken();

    let response: {
      data: T | null;
      error: string | null;
      loading: boolean;
      total?: number;
      [key: string]: any;
    } = {
      data: null as T | null,
      error: null as string | null,
      loading: false,
    };

    // First attempt with current token
    await CustomServerClient.http({
      onSuccess: (data: ApiResponse<T>) => {
        // Handle backend response format: { has_error, message, data }
        if (data && typeof data === "object" && "has_error" in data) {
          if (data.has_error) {
            response.error = data.message || "An error occurred";
          } else {
            response.data = data.data !== undefined ? data.data : (data as T);
            // Preserve additional fields like total
            Object.keys(data).forEach((key) => {
              if (key !== "data" && key !== "has_error" && key !== "message") {
                response[key] = data[key];
              }
            });
          }
        } else {
          response.data = data as T;
        }
      },
      onError: async (error: string) => {
        // If we get a 401 and have a refresh token, try to refresh
        if (error?.includes("401") || error?.includes("Unauthorized")) {
          const newToken = await this.refreshAuthToken();
          if (newToken) {
            // Retry the request with the new token
            await CustomServerClient.http({
              onSuccess: (data: ApiResponse<T>) => {
                if (data && typeof data === "object" && "has_error" in data) {
                  if (data.has_error) {
                    response.error = data.message || "An error occurred";
                  } else {
                    response.data =
                      data.data !== undefined ? data.data : (data as T);
                    // Preserve additional fields
                    Object.keys(data).forEach((key) => {
                      if (
                        key !== "data" &&
                        key !== "has_error" &&
                        key !== "message"
                      ) {
                        response[key] = data[key];
                      }
                    });
                  }
                } else {
                  response.data = data as T;
                }
              },
              onError: (retryError: string) => {
                response.error = retryError;
              },
              onLoading: (loading: boolean) => {
                response.loading = loading;
              },
              url,
              method,
              data,
              token: newToken,
            });
            return;
          }
        }
        response.error = error;
      },
      onLoading: (loading: boolean) => {
        response.loading = loading;
      },
      url,
      method,
      data,
      token: token || undefined,
    });

    return response;
  }
}

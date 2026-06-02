import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AdminStats, ApproveRechargeInput, AuditLogList, AuthResponse, Banner, BannerInput, BannerUpdate, BlockInput, BulkVisibilityInput, Category, CategoryInput, CategoryUpdate, HealthStatus, ListAuditLogsParams, ListOrdersParams, ListRechargeRequestsParams, ListServicesParams, ListTransactionsParams, ListUsersParams, LoginInput, Order, OrderInput, OrderList, PaymentMethod, PaymentMethodInput, PaymentMethodUpdate, Provider, ProviderInput, ProviderUpdate, RechargeInput, RechargeRequest, RechargeRequestList, RegisterInput, Service, ServiceInput, ServiceList, ServiceUpdate, SiteSettings, SiteSettingsUpdate, SyncResult, TransactionList, UpdatedCount, User, UserList, UserUpdate, Wallet, WalletAdjustInput } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getRegisterUrl: () => string;
/**
 * @summary Register with phone and password
 */
export declare const register: (registerInput: RegisterInput, options?: RequestInit) => Promise<AuthResponse>;
export declare const getRegisterMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterInput>;
}, TContext>;
export type RegisterMutationResult = NonNullable<Awaited<ReturnType<typeof register>>>;
export type RegisterMutationBody = BodyType<RegisterInput>;
export type RegisterMutationError = ErrorType<void>;
/**
* @summary Register with phone and password
*/
export declare const useRegister: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterInput>;
}, TContext>;
export declare const getLoginUrl: () => string;
/**
 * @summary Login with phone and password
 */
export declare const login: (loginInput: LoginInput, options?: RequestInit) => Promise<AuthResponse>;
export declare const getLoginMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginInput>;
export type LoginMutationError = ErrorType<void>;
/**
* @summary Login with phone and password
*/
export declare const useLogin: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export declare const getLogoutUrl: () => string;
/**
 * @summary Logout current user
 */
export declare const logout: (options?: RequestInit) => Promise<void>;
export declare const getLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export type LogoutMutationResult = NonNullable<Awaited<ReturnType<typeof logout>>>;
export type LogoutMutationError = ErrorType<unknown>;
/**
* @summary Logout current user
*/
export declare const useLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export declare const getGetMeUrl: () => string;
/**
 * @summary Get current authenticated user
 */
export declare const getMe: (options?: RequestInit) => Promise<User>;
export declare const getGetMeQueryKey: () => readonly ["/api/auth/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<void>;
/**
 * @summary Get current authenticated user
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListUsersUrl: (params?: ListUsersParams) => string;
/**
 * @summary List all users
 */
export declare const listUsers: (params?: ListUsersParams, options?: RequestInit) => Promise<UserList>;
export declare const getListUsersQueryKey: (params?: ListUsersParams) => readonly ["/api/users", ...ListUsersParams[]];
export declare const getListUsersQueryOptions: <TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(params?: ListUsersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListUsersQueryResult = NonNullable<Awaited<ReturnType<typeof listUsers>>>;
export type ListUsersQueryError = ErrorType<unknown>;
/**
 * @summary List all users
 */
export declare function useListUsers<TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(params?: ListUsersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetUserUrl: (id: number) => string;
/**
 * @summary Get a user by ID
 */
export declare const getUser: (id: number, options?: RequestInit) => Promise<User>;
export declare const getGetUserQueryKey: (id: number) => readonly [`/api/users/${number}`];
export declare const getGetUserQueryOptions: <TData = Awaited<ReturnType<typeof getUser>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUserQueryResult = NonNullable<Awaited<ReturnType<typeof getUser>>>;
export type GetUserQueryError = ErrorType<unknown>;
/**
 * @summary Get a user by ID
 */
export declare function useGetUser<TData = Awaited<ReturnType<typeof getUser>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateUserUrl: (id: number) => string;
/**
 * @summary Update a user
 */
export declare const updateUser: (id: number, userUpdate: UserUpdate, options?: RequestInit) => Promise<User>;
export declare const getUpdateUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        id: number;
        data: BodyType<UserUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
    id: number;
    data: BodyType<UserUpdate>;
}, TContext>;
export type UpdateUserMutationResult = NonNullable<Awaited<ReturnType<typeof updateUser>>>;
export type UpdateUserMutationBody = BodyType<UserUpdate>;
export type UpdateUserMutationError = ErrorType<unknown>;
/**
* @summary Update a user
*/
export declare const useUpdateUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        id: number;
        data: BodyType<UserUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateUser>>, TError, {
    id: number;
    data: BodyType<UserUpdate>;
}, TContext>;
export declare const getBlockUserUrl: (id: number) => string;
/**
 * @summary Block or unblock a user
 */
export declare const blockUser: (id: number, blockInput: BlockInput, options?: RequestInit) => Promise<User>;
export declare const getBlockUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof blockUser>>, TError, {
        id: number;
        data: BodyType<BlockInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof blockUser>>, TError, {
    id: number;
    data: BodyType<BlockInput>;
}, TContext>;
export type BlockUserMutationResult = NonNullable<Awaited<ReturnType<typeof blockUser>>>;
export type BlockUserMutationBody = BodyType<BlockInput>;
export type BlockUserMutationError = ErrorType<unknown>;
/**
* @summary Block or unblock a user
*/
export declare const useBlockUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof blockUser>>, TError, {
        id: number;
        data: BodyType<BlockInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof blockUser>>, TError, {
    id: number;
    data: BodyType<BlockInput>;
}, TContext>;
export declare const getAdjustUserWalletUrl: (id: number) => string;
/**
 * @summary Adjust user wallet balance (admin only)
 */
export declare const adjustUserWallet: (id: number, walletAdjustInput: WalletAdjustInput, options?: RequestInit) => Promise<User>;
export declare const getAdjustUserWalletMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adjustUserWallet>>, TError, {
        id: number;
        data: BodyType<WalletAdjustInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adjustUserWallet>>, TError, {
    id: number;
    data: BodyType<WalletAdjustInput>;
}, TContext>;
export type AdjustUserWalletMutationResult = NonNullable<Awaited<ReturnType<typeof adjustUserWallet>>>;
export type AdjustUserWalletMutationBody = BodyType<WalletAdjustInput>;
export type AdjustUserWalletMutationError = ErrorType<unknown>;
/**
* @summary Adjust user wallet balance (admin only)
*/
export declare const useAdjustUserWallet: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adjustUserWallet>>, TError, {
        id: number;
        data: BodyType<WalletAdjustInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adjustUserWallet>>, TError, {
    id: number;
    data: BodyType<WalletAdjustInput>;
}, TContext>;
export declare const getListCategoriesUrl: () => string;
/**
 * @summary List all categories
 */
export declare const listCategories: (options?: RequestInit) => Promise<Category[]>;
export declare const getListCategoriesQueryKey: () => readonly ["/api/categories"];
export declare const getListCategoriesQueryOptions: <TData = Awaited<ReturnType<typeof listCategories>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCategoriesQueryResult = NonNullable<Awaited<ReturnType<typeof listCategories>>>;
export type ListCategoriesQueryError = ErrorType<unknown>;
/**
 * @summary List all categories
 */
export declare function useListCategories<TData = Awaited<ReturnType<typeof listCategories>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateCategoryUrl: () => string;
/**
 * @summary Create a category
 */
export declare const createCategory: (categoryInput: CategoryInput, options?: RequestInit) => Promise<Category>;
export declare const getCreateCategoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
        data: BodyType<CategoryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
    data: BodyType<CategoryInput>;
}, TContext>;
export type CreateCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof createCategory>>>;
export type CreateCategoryMutationBody = BodyType<CategoryInput>;
export type CreateCategoryMutationError = ErrorType<unknown>;
/**
* @summary Create a category
*/
export declare const useCreateCategory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
        data: BodyType<CategoryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCategory>>, TError, {
    data: BodyType<CategoryInput>;
}, TContext>;
export declare const getGetCategoryUrl: (id: number) => string;
/**
 * @summary Get a category by ID
 */
export declare const getCategory: (id: number, options?: RequestInit) => Promise<Category>;
export declare const getGetCategoryQueryKey: (id: number) => readonly [`/api/categories/${number}`];
export declare const getGetCategoryQueryOptions: <TData = Awaited<ReturnType<typeof getCategory>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCategory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCategory>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCategoryQueryResult = NonNullable<Awaited<ReturnType<typeof getCategory>>>;
export type GetCategoryQueryError = ErrorType<unknown>;
/**
 * @summary Get a category by ID
 */
export declare function useGetCategory<TData = Awaited<ReturnType<typeof getCategory>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCategory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateCategoryUrl: (id: number) => string;
/**
 * @summary Update a category
 */
export declare const updateCategory: (id: number, categoryUpdate: CategoryUpdate, options?: RequestInit) => Promise<Category>;
export declare const getUpdateCategoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCategory>>, TError, {
        id: number;
        data: BodyType<CategoryUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCategory>>, TError, {
    id: number;
    data: BodyType<CategoryUpdate>;
}, TContext>;
export type UpdateCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof updateCategory>>>;
export type UpdateCategoryMutationBody = BodyType<CategoryUpdate>;
export type UpdateCategoryMutationError = ErrorType<unknown>;
/**
* @summary Update a category
*/
export declare const useUpdateCategory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCategory>>, TError, {
        id: number;
        data: BodyType<CategoryUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCategory>>, TError, {
    id: number;
    data: BodyType<CategoryUpdate>;
}, TContext>;
export declare const getDeleteCategoryUrl: (id: number) => string;
/**
 * @summary Delete a category
 */
export declare const deleteCategory: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteCategoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCategory>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteCategory>>, TError, {
    id: number;
}, TContext>;
export type DeleteCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof deleteCategory>>>;
export type DeleteCategoryMutationError = ErrorType<unknown>;
/**
* @summary Delete a category
*/
export declare const useDeleteCategory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCategory>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteCategory>>, TError, {
    id: number;
}, TContext>;
export declare const getListServicesUrl: (params?: ListServicesParams) => string;
/**
 * @summary List services
 */
export declare const listServices: (params?: ListServicesParams, options?: RequestInit) => Promise<ServiceList>;
export declare const getListServicesQueryKey: (params?: ListServicesParams) => readonly ["/api/services", ...ListServicesParams[]];
export declare const getListServicesQueryOptions: <TData = Awaited<ReturnType<typeof listServices>>, TError = ErrorType<unknown>>(params?: ListServicesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listServices>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listServices>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListServicesQueryResult = NonNullable<Awaited<ReturnType<typeof listServices>>>;
export type ListServicesQueryError = ErrorType<unknown>;
/**
 * @summary List services
 */
export declare function useListServices<TData = Awaited<ReturnType<typeof listServices>>, TError = ErrorType<unknown>>(params?: ListServicesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listServices>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateServiceUrl: () => string;
/**
 * @summary Create a service manually
 */
export declare const createService: (serviceInput: ServiceInput, options?: RequestInit) => Promise<Service>;
export declare const getCreateServiceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createService>>, TError, {
        data: BodyType<ServiceInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createService>>, TError, {
    data: BodyType<ServiceInput>;
}, TContext>;
export type CreateServiceMutationResult = NonNullable<Awaited<ReturnType<typeof createService>>>;
export type CreateServiceMutationBody = BodyType<ServiceInput>;
export type CreateServiceMutationError = ErrorType<unknown>;
/**
* @summary Create a service manually
*/
export declare const useCreateService: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createService>>, TError, {
        data: BodyType<ServiceInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createService>>, TError, {
    data: BodyType<ServiceInput>;
}, TContext>;
export declare const getListFeaturedServicesUrl: () => string;
/**
 * @summary List featured/pinned services for homepage
 */
export declare const listFeaturedServices: (options?: RequestInit) => Promise<Service[]>;
export declare const getListFeaturedServicesQueryKey: () => readonly ["/api/services/featured"];
export declare const getListFeaturedServicesQueryOptions: <TData = Awaited<ReturnType<typeof listFeaturedServices>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listFeaturedServices>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listFeaturedServices>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListFeaturedServicesQueryResult = NonNullable<Awaited<ReturnType<typeof listFeaturedServices>>>;
export type ListFeaturedServicesQueryError = ErrorType<unknown>;
/**
 * @summary List featured/pinned services for homepage
 */
export declare function useListFeaturedServices<TData = Awaited<ReturnType<typeof listFeaturedServices>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listFeaturedServices>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetServiceUrl: (id: number) => string;
/**
 * @summary Get service by ID
 */
export declare const getService: (id: number, options?: RequestInit) => Promise<Service>;
export declare const getGetServiceQueryKey: (id: number) => readonly [`/api/services/${number}`];
export declare const getGetServiceQueryOptions: <TData = Awaited<ReturnType<typeof getService>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getService>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getService>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetServiceQueryResult = NonNullable<Awaited<ReturnType<typeof getService>>>;
export type GetServiceQueryError = ErrorType<unknown>;
/**
 * @summary Get service by ID
 */
export declare function useGetService<TData = Awaited<ReturnType<typeof getService>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getService>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateServiceUrl: (id: number) => string;
/**
 * @summary Update a service
 */
export declare const updateService: (id: number, serviceUpdate: ServiceUpdate, options?: RequestInit) => Promise<Service>;
export declare const getUpdateServiceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateService>>, TError, {
        id: number;
        data: BodyType<ServiceUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateService>>, TError, {
    id: number;
    data: BodyType<ServiceUpdate>;
}, TContext>;
export type UpdateServiceMutationResult = NonNullable<Awaited<ReturnType<typeof updateService>>>;
export type UpdateServiceMutationBody = BodyType<ServiceUpdate>;
export type UpdateServiceMutationError = ErrorType<unknown>;
/**
* @summary Update a service
*/
export declare const useUpdateService: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateService>>, TError, {
        id: number;
        data: BodyType<ServiceUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateService>>, TError, {
    id: number;
    data: BodyType<ServiceUpdate>;
}, TContext>;
export declare const getDeleteServiceUrl: (id: number) => string;
/**
 * @summary Delete a service
 */
export declare const deleteService: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteServiceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteService>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteService>>, TError, {
    id: number;
}, TContext>;
export type DeleteServiceMutationResult = NonNullable<Awaited<ReturnType<typeof deleteService>>>;
export type DeleteServiceMutationError = ErrorType<unknown>;
/**
* @summary Delete a service
*/
export declare const useDeleteService: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteService>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteService>>, TError, {
    id: number;
}, TContext>;
export declare const getListProvidersUrl: () => string;
/**
 * @summary List service providers
 */
export declare const listProviders: (options?: RequestInit) => Promise<Provider[]>;
export declare const getListProvidersQueryKey: () => readonly ["/api/providers"];
export declare const getListProvidersQueryOptions: <TData = Awaited<ReturnType<typeof listProviders>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProviders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listProviders>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListProvidersQueryResult = NonNullable<Awaited<ReturnType<typeof listProviders>>>;
export type ListProvidersQueryError = ErrorType<unknown>;
/**
 * @summary List service providers
 */
export declare function useListProviders<TData = Awaited<ReturnType<typeof listProviders>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProviders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateProviderUrl: () => string;
/**
 * @summary Add a new service provider
 */
export declare const createProvider: (providerInput: ProviderInput, options?: RequestInit) => Promise<Provider>;
export declare const getCreateProviderMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProvider>>, TError, {
        data: BodyType<ProviderInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createProvider>>, TError, {
    data: BodyType<ProviderInput>;
}, TContext>;
export type CreateProviderMutationResult = NonNullable<Awaited<ReturnType<typeof createProvider>>>;
export type CreateProviderMutationBody = BodyType<ProviderInput>;
export type CreateProviderMutationError = ErrorType<unknown>;
/**
* @summary Add a new service provider
*/
export declare const useCreateProvider: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProvider>>, TError, {
        data: BodyType<ProviderInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createProvider>>, TError, {
    data: BodyType<ProviderInput>;
}, TContext>;
export declare const getGetProviderUrl: (id: number) => string;
/**
 * @summary Get provider by ID
 */
export declare const getProvider: (id: number, options?: RequestInit) => Promise<Provider>;
export declare const getGetProviderQueryKey: (id: number) => readonly [`/api/providers/${number}`];
export declare const getGetProviderQueryOptions: <TData = Awaited<ReturnType<typeof getProvider>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProvider>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProvider>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProviderQueryResult = NonNullable<Awaited<ReturnType<typeof getProvider>>>;
export type GetProviderQueryError = ErrorType<unknown>;
/**
 * @summary Get provider by ID
 */
export declare function useGetProvider<TData = Awaited<ReturnType<typeof getProvider>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProvider>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateProviderUrl: (id: number) => string;
/**
 * @summary Update provider
 */
export declare const updateProvider: (id: number, providerUpdate: ProviderUpdate, options?: RequestInit) => Promise<Provider>;
export declare const getUpdateProviderMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProvider>>, TError, {
        id: number;
        data: BodyType<ProviderUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateProvider>>, TError, {
    id: number;
    data: BodyType<ProviderUpdate>;
}, TContext>;
export type UpdateProviderMutationResult = NonNullable<Awaited<ReturnType<typeof updateProvider>>>;
export type UpdateProviderMutationBody = BodyType<ProviderUpdate>;
export type UpdateProviderMutationError = ErrorType<unknown>;
/**
* @summary Update provider
*/
export declare const useUpdateProvider: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProvider>>, TError, {
        id: number;
        data: BodyType<ProviderUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateProvider>>, TError, {
    id: number;
    data: BodyType<ProviderUpdate>;
}, TContext>;
export declare const getDeleteProviderUrl: (id: number) => string;
/**
 * @summary Delete provider
 */
export declare const deleteProvider: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteProviderMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteProvider>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteProvider>>, TError, {
    id: number;
}, TContext>;
export type DeleteProviderMutationResult = NonNullable<Awaited<ReturnType<typeof deleteProvider>>>;
export type DeleteProviderMutationError = ErrorType<unknown>;
/**
* @summary Delete provider
*/
export declare const useDeleteProvider: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteProvider>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteProvider>>, TError, {
    id: number;
}, TContext>;
export declare const getListProviderServicesUrl: (id: number) => string;
/**
 * @summary List all services for a specific provider
 */
export declare const listProviderServices: (id: number, options?: RequestInit) => Promise<ServiceList>;
export declare const getListProviderServicesQueryKey: (id: number) => readonly [`/api/providers/${number}/services`];
export declare const getListProviderServicesQueryOptions: <TData = Awaited<ReturnType<typeof listProviderServices>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProviderServices>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listProviderServices>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListProviderServicesQueryResult = NonNullable<Awaited<ReturnType<typeof listProviderServices>>>;
export type ListProviderServicesQueryError = ErrorType<unknown>;
/**
 * @summary List all services for a specific provider
 */
export declare function useListProviderServices<TData = Awaited<ReturnType<typeof listProviderServices>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProviderServices>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateProviderServicesVisibilityUrl: (id: number) => string;
/**
 * @summary Bulk update visibility for provider services
 */
export declare const updateProviderServicesVisibility: (id: number, bulkVisibilityInput: BulkVisibilityInput, options?: RequestInit) => Promise<UpdatedCount>;
export declare const getUpdateProviderServicesVisibilityMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProviderServicesVisibility>>, TError, {
        id: number;
        data: BodyType<BulkVisibilityInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateProviderServicesVisibility>>, TError, {
    id: number;
    data: BodyType<BulkVisibilityInput>;
}, TContext>;
export type UpdateProviderServicesVisibilityMutationResult = NonNullable<Awaited<ReturnType<typeof updateProviderServicesVisibility>>>;
export type UpdateProviderServicesVisibilityMutationBody = BodyType<BulkVisibilityInput>;
export type UpdateProviderServicesVisibilityMutationError = ErrorType<unknown>;
/**
* @summary Bulk update visibility for provider services
*/
export declare const useUpdateProviderServicesVisibility: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProviderServicesVisibility>>, TError, {
        id: number;
        data: BodyType<BulkVisibilityInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateProviderServicesVisibility>>, TError, {
    id: number;
    data: BodyType<BulkVisibilityInput>;
}, TContext>;
export declare const getSyncProviderServicesUrl: (id: number) => string;
/**
 * @summary Sync services from provider API
 */
export declare const syncProviderServices: (id: number, options?: RequestInit) => Promise<SyncResult>;
export declare const getSyncProviderServicesMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof syncProviderServices>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof syncProviderServices>>, TError, {
    id: number;
}, TContext>;
export type SyncProviderServicesMutationResult = NonNullable<Awaited<ReturnType<typeof syncProviderServices>>>;
export type SyncProviderServicesMutationError = ErrorType<unknown>;
/**
* @summary Sync services from provider API
*/
export declare const useSyncProviderServices: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof syncProviderServices>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof syncProviderServices>>, TError, {
    id: number;
}, TContext>;
export declare const getGetWalletUrl: () => string;
/**
 * @summary Get current user wallet info
 */
export declare const getWallet: (options?: RequestInit) => Promise<Wallet>;
export declare const getGetWalletQueryKey: () => readonly ["/api/wallet"];
export declare const getGetWalletQueryOptions: <TData = Awaited<ReturnType<typeof getWallet>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWallet>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getWallet>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetWalletQueryResult = NonNullable<Awaited<ReturnType<typeof getWallet>>>;
export type GetWalletQueryError = ErrorType<unknown>;
/**
 * @summary Get current user wallet info
 */
export declare function useGetWallet<TData = Awaited<ReturnType<typeof getWallet>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWallet>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListTransactionsUrl: (params?: ListTransactionsParams) => string;
/**
 * @summary List wallet transactions
 */
export declare const listTransactions: (params?: ListTransactionsParams, options?: RequestInit) => Promise<TransactionList>;
export declare const getListTransactionsQueryKey: (params?: ListTransactionsParams) => readonly ["/api/wallet/transactions", ...ListTransactionsParams[]];
export declare const getListTransactionsQueryOptions: <TData = Awaited<ReturnType<typeof listTransactions>>, TError = ErrorType<unknown>>(params?: ListTransactionsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTransactions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listTransactions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListTransactionsQueryResult = NonNullable<Awaited<ReturnType<typeof listTransactions>>>;
export type ListTransactionsQueryError = ErrorType<unknown>;
/**
 * @summary List wallet transactions
 */
export declare function useListTransactions<TData = Awaited<ReturnType<typeof listTransactions>>, TError = ErrorType<unknown>>(params?: ListTransactionsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTransactions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getRequestRechargeUrl: () => string;
/**
 * @summary Request wallet recharge
 */
export declare const requestRecharge: (rechargeInput: RechargeInput, options?: RequestInit) => Promise<RechargeRequest>;
export declare const getRequestRechargeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof requestRecharge>>, TError, {
        data: BodyType<RechargeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof requestRecharge>>, TError, {
    data: BodyType<RechargeInput>;
}, TContext>;
export type RequestRechargeMutationResult = NonNullable<Awaited<ReturnType<typeof requestRecharge>>>;
export type RequestRechargeMutationBody = BodyType<RechargeInput>;
export type RequestRechargeMutationError = ErrorType<unknown>;
/**
* @summary Request wallet recharge
*/
export declare const useRequestRecharge: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof requestRecharge>>, TError, {
        data: BodyType<RechargeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof requestRecharge>>, TError, {
    data: BodyType<RechargeInput>;
}, TContext>;
export declare const getListRechargeRequestsUrl: (params?: ListRechargeRequestsParams) => string;
/**
 * @summary List all recharge requests (admin)
 */
export declare const listRechargeRequests: (params?: ListRechargeRequestsParams, options?: RequestInit) => Promise<RechargeRequestList>;
export declare const getListRechargeRequestsQueryKey: (params?: ListRechargeRequestsParams) => readonly ["/api/wallet/recharge-requests", ...ListRechargeRequestsParams[]];
export declare const getListRechargeRequestsQueryOptions: <TData = Awaited<ReturnType<typeof listRechargeRequests>>, TError = ErrorType<unknown>>(params?: ListRechargeRequestsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listRechargeRequests>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listRechargeRequests>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListRechargeRequestsQueryResult = NonNullable<Awaited<ReturnType<typeof listRechargeRequests>>>;
export type ListRechargeRequestsQueryError = ErrorType<unknown>;
/**
 * @summary List all recharge requests (admin)
 */
export declare function useListRechargeRequests<TData = Awaited<ReturnType<typeof listRechargeRequests>>, TError = ErrorType<unknown>>(params?: ListRechargeRequestsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listRechargeRequests>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getApproveRechargeUrl: (id: number) => string;
/**
 * @summary Approve recharge request
 */
export declare const approveRecharge: (id: number, approveRechargeInput: ApproveRechargeInput, options?: RequestInit) => Promise<RechargeRequest>;
export declare const getApproveRechargeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof approveRecharge>>, TError, {
        id: number;
        data: BodyType<ApproveRechargeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof approveRecharge>>, TError, {
    id: number;
    data: BodyType<ApproveRechargeInput>;
}, TContext>;
export type ApproveRechargeMutationResult = NonNullable<Awaited<ReturnType<typeof approveRecharge>>>;
export type ApproveRechargeMutationBody = BodyType<ApproveRechargeInput>;
export type ApproveRechargeMutationError = ErrorType<unknown>;
/**
* @summary Approve recharge request
*/
export declare const useApproveRecharge: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof approveRecharge>>, TError, {
        id: number;
        data: BodyType<ApproveRechargeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof approveRecharge>>, TError, {
    id: number;
    data: BodyType<ApproveRechargeInput>;
}, TContext>;
export declare const getRejectRechargeUrl: (id: number) => string;
/**
 * @summary Reject recharge request
 */
export declare const rejectRecharge: (id: number, options?: RequestInit) => Promise<RechargeRequest>;
export declare const getRejectRechargeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof rejectRecharge>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof rejectRecharge>>, TError, {
    id: number;
}, TContext>;
export type RejectRechargeMutationResult = NonNullable<Awaited<ReturnType<typeof rejectRecharge>>>;
export type RejectRechargeMutationError = ErrorType<unknown>;
/**
* @summary Reject recharge request
*/
export declare const useRejectRecharge: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof rejectRecharge>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof rejectRecharge>>, TError, {
    id: number;
}, TContext>;
export declare const getListOrdersUrl: (params?: ListOrdersParams) => string;
/**
 * @summary List orders (mine or all for admin)
 */
export declare const listOrders: (params?: ListOrdersParams, options?: RequestInit) => Promise<OrderList>;
export declare const getListOrdersQueryKey: (params?: ListOrdersParams) => readonly ["/api/orders", ...ListOrdersParams[]];
export declare const getListOrdersQueryOptions: <TData = Awaited<ReturnType<typeof listOrders>>, TError = ErrorType<unknown>>(params?: ListOrdersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listOrders>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListOrdersQueryResult = NonNullable<Awaited<ReturnType<typeof listOrders>>>;
export type ListOrdersQueryError = ErrorType<unknown>;
/**
 * @summary List orders (mine or all for admin)
 */
export declare function useListOrders<TData = Awaited<ReturnType<typeof listOrders>>, TError = ErrorType<unknown>>(params?: ListOrdersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateOrderUrl: () => string;
/**
 * @summary Place an order
 */
export declare const createOrder: (orderInput: OrderInput, options?: RequestInit) => Promise<Order>;
export declare const getCreateOrderMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOrder>>, TError, {
        data: BodyType<OrderInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createOrder>>, TError, {
    data: BodyType<OrderInput>;
}, TContext>;
export type CreateOrderMutationResult = NonNullable<Awaited<ReturnType<typeof createOrder>>>;
export type CreateOrderMutationBody = BodyType<OrderInput>;
export type CreateOrderMutationError = ErrorType<unknown>;
/**
* @summary Place an order
*/
export declare const useCreateOrder: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOrder>>, TError, {
        data: BodyType<OrderInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createOrder>>, TError, {
    data: BodyType<OrderInput>;
}, TContext>;
export declare const getGetOrderUrl: (id: number) => string;
/**
 * @summary Get order by ID
 */
export declare const getOrder: (id: number, options?: RequestInit) => Promise<Order>;
export declare const getGetOrderQueryKey: (id: number) => readonly [`/api/orders/${number}`];
export declare const getGetOrderQueryOptions: <TData = Awaited<ReturnType<typeof getOrder>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOrder>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getOrder>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetOrderQueryResult = NonNullable<Awaited<ReturnType<typeof getOrder>>>;
export type GetOrderQueryError = ErrorType<unknown>;
/**
 * @summary Get order by ID
 */
export declare function useGetOrder<TData = Awaited<ReturnType<typeof getOrder>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOrder>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListBannersUrl: () => string;
/**
 * @summary List banners
 */
export declare const listBanners: (options?: RequestInit) => Promise<Banner[]>;
export declare const getListBannersQueryKey: () => readonly ["/api/banners"];
export declare const getListBannersQueryOptions: <TData = Awaited<ReturnType<typeof listBanners>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listBanners>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listBanners>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListBannersQueryResult = NonNullable<Awaited<ReturnType<typeof listBanners>>>;
export type ListBannersQueryError = ErrorType<unknown>;
/**
 * @summary List banners
 */
export declare function useListBanners<TData = Awaited<ReturnType<typeof listBanners>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listBanners>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateBannerUrl: () => string;
/**
 * @summary Create banner
 */
export declare const createBanner: (bannerInput: BannerInput, options?: RequestInit) => Promise<Banner>;
export declare const getCreateBannerMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createBanner>>, TError, {
        data: BodyType<BannerInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createBanner>>, TError, {
    data: BodyType<BannerInput>;
}, TContext>;
export type CreateBannerMutationResult = NonNullable<Awaited<ReturnType<typeof createBanner>>>;
export type CreateBannerMutationBody = BodyType<BannerInput>;
export type CreateBannerMutationError = ErrorType<unknown>;
/**
* @summary Create banner
*/
export declare const useCreateBanner: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createBanner>>, TError, {
        data: BodyType<BannerInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createBanner>>, TError, {
    data: BodyType<BannerInput>;
}, TContext>;
export declare const getUpdateBannerUrl: (id: number) => string;
/**
 * @summary Update banner
 */
export declare const updateBanner: (id: number, bannerUpdate: BannerUpdate, options?: RequestInit) => Promise<Banner>;
export declare const getUpdateBannerMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateBanner>>, TError, {
        id: number;
        data: BodyType<BannerUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateBanner>>, TError, {
    id: number;
    data: BodyType<BannerUpdate>;
}, TContext>;
export type UpdateBannerMutationResult = NonNullable<Awaited<ReturnType<typeof updateBanner>>>;
export type UpdateBannerMutationBody = BodyType<BannerUpdate>;
export type UpdateBannerMutationError = ErrorType<unknown>;
/**
* @summary Update banner
*/
export declare const useUpdateBanner: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateBanner>>, TError, {
        id: number;
        data: BodyType<BannerUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateBanner>>, TError, {
    id: number;
    data: BodyType<BannerUpdate>;
}, TContext>;
export declare const getDeleteBannerUrl: (id: number) => string;
/**
 * @summary Delete banner
 */
export declare const deleteBanner: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteBannerMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteBanner>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteBanner>>, TError, {
    id: number;
}, TContext>;
export type DeleteBannerMutationResult = NonNullable<Awaited<ReturnType<typeof deleteBanner>>>;
export type DeleteBannerMutationError = ErrorType<unknown>;
/**
* @summary Delete banner
*/
export declare const useDeleteBanner: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteBanner>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteBanner>>, TError, {
    id: number;
}, TContext>;
export declare const getGetSettingsUrl: () => string;
/**
 * @summary Get site settings
 */
export declare const getSettings: (options?: RequestInit) => Promise<SiteSettings>;
export declare const getGetSettingsQueryKey: () => readonly ["/api/settings"];
export declare const getGetSettingsQueryOptions: <TData = Awaited<ReturnType<typeof getSettings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSettings>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSettingsQueryResult = NonNullable<Awaited<ReturnType<typeof getSettings>>>;
export type GetSettingsQueryError = ErrorType<unknown>;
/**
 * @summary Get site settings
 */
export declare function useGetSettings<TData = Awaited<ReturnType<typeof getSettings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateSettingsUrl: () => string;
/**
 * @summary Update site settings (super admin only)
 */
export declare const updateSettings: (siteSettingsUpdate: SiteSettingsUpdate, options?: RequestInit) => Promise<SiteSettings>;
export declare const getUpdateSettingsMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSettings>>, TError, {
        data: BodyType<SiteSettingsUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateSettings>>, TError, {
    data: BodyType<SiteSettingsUpdate>;
}, TContext>;
export type UpdateSettingsMutationResult = NonNullable<Awaited<ReturnType<typeof updateSettings>>>;
export type UpdateSettingsMutationBody = BodyType<SiteSettingsUpdate>;
export type UpdateSettingsMutationError = ErrorType<unknown>;
/**
* @summary Update site settings (super admin only)
*/
export declare const useUpdateSettings: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSettings>>, TError, {
        data: BodyType<SiteSettingsUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateSettings>>, TError, {
    data: BodyType<SiteSettingsUpdate>;
}, TContext>;
export declare const getGetAdminStatsUrl: () => string;
/**
 * @summary Admin dashboard stats
 */
export declare const getAdminStats: (options?: RequestInit) => Promise<AdminStats>;
export declare const getGetAdminStatsQueryKey: () => readonly ["/api/admin/stats"];
export declare const getGetAdminStatsQueryOptions: <TData = Awaited<ReturnType<typeof getAdminStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminStats>>>;
export type GetAdminStatsQueryError = ErrorType<unknown>;
/**
 * @summary Admin dashboard stats
 */
export declare function useGetAdminStats<TData = Awaited<ReturnType<typeof getAdminStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListAuditLogsUrl: (params?: ListAuditLogsParams) => string;
/**
 * @summary List audit log entries
 */
export declare const listAuditLogs: (params?: ListAuditLogsParams, options?: RequestInit) => Promise<AuditLogList>;
export declare const getListAuditLogsQueryKey: (params?: ListAuditLogsParams) => readonly ["/api/admin/audit-logs", ...ListAuditLogsParams[]];
export declare const getListAuditLogsQueryOptions: <TData = Awaited<ReturnType<typeof listAuditLogs>>, TError = ErrorType<unknown>>(params?: ListAuditLogsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAuditLogs>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAuditLogs>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAuditLogsQueryResult = NonNullable<Awaited<ReturnType<typeof listAuditLogs>>>;
export type ListAuditLogsQueryError = ErrorType<unknown>;
/**
 * @summary List audit log entries
 */
export declare function useListAuditLogs<TData = Awaited<ReturnType<typeof listAuditLogs>>, TError = ErrorType<unknown>>(params?: ListAuditLogsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAuditLogs>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListPaymentMethodsUrl: () => string;
/**
 * @summary List payment methods for recharge
 */
export declare const listPaymentMethods: (options?: RequestInit) => Promise<PaymentMethod[]>;
export declare const getListPaymentMethodsQueryKey: () => readonly ["/api/payment-methods"];
export declare const getListPaymentMethodsQueryOptions: <TData = Awaited<ReturnType<typeof listPaymentMethods>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPaymentMethods>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPaymentMethods>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPaymentMethodsQueryResult = NonNullable<Awaited<ReturnType<typeof listPaymentMethods>>>;
export type ListPaymentMethodsQueryError = ErrorType<unknown>;
/**
 * @summary List payment methods for recharge
 */
export declare function useListPaymentMethods<TData = Awaited<ReturnType<typeof listPaymentMethods>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPaymentMethods>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreatePaymentMethodUrl: () => string;
/**
 * @summary Create payment method (admin)
 */
export declare const createPaymentMethod: (paymentMethodInput: PaymentMethodInput, options?: RequestInit) => Promise<PaymentMethod>;
export declare const getCreatePaymentMethodMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPaymentMethod>>, TError, {
        data: BodyType<PaymentMethodInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createPaymentMethod>>, TError, {
    data: BodyType<PaymentMethodInput>;
}, TContext>;
export type CreatePaymentMethodMutationResult = NonNullable<Awaited<ReturnType<typeof createPaymentMethod>>>;
export type CreatePaymentMethodMutationBody = BodyType<PaymentMethodInput>;
export type CreatePaymentMethodMutationError = ErrorType<unknown>;
/**
* @summary Create payment method (admin)
*/
export declare const useCreatePaymentMethod: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPaymentMethod>>, TError, {
        data: BodyType<PaymentMethodInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createPaymentMethod>>, TError, {
    data: BodyType<PaymentMethodInput>;
}, TContext>;
export declare const getUpdatePaymentMethodUrl: (id: number) => string;
/**
 * @summary Update payment method
 */
export declare const updatePaymentMethod: (id: number, paymentMethodUpdate: PaymentMethodUpdate, options?: RequestInit) => Promise<PaymentMethod>;
export declare const getUpdatePaymentMethodMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePaymentMethod>>, TError, {
        id: number;
        data: BodyType<PaymentMethodUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updatePaymentMethod>>, TError, {
    id: number;
    data: BodyType<PaymentMethodUpdate>;
}, TContext>;
export type UpdatePaymentMethodMutationResult = NonNullable<Awaited<ReturnType<typeof updatePaymentMethod>>>;
export type UpdatePaymentMethodMutationBody = BodyType<PaymentMethodUpdate>;
export type UpdatePaymentMethodMutationError = ErrorType<unknown>;
/**
* @summary Update payment method
*/
export declare const useUpdatePaymentMethod: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePaymentMethod>>, TError, {
        id: number;
        data: BodyType<PaymentMethodUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updatePaymentMethod>>, TError, {
    id: number;
    data: BodyType<PaymentMethodUpdate>;
}, TContext>;
export declare const getDeletePaymentMethodUrl: (id: number) => string;
/**
 * @summary Delete payment method
 */
export declare const deletePaymentMethod: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeletePaymentMethodMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deletePaymentMethod>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deletePaymentMethod>>, TError, {
    id: number;
}, TContext>;
export type DeletePaymentMethodMutationResult = NonNullable<Awaited<ReturnType<typeof deletePaymentMethod>>>;
export type DeletePaymentMethodMutationError = ErrorType<unknown>;
/**
* @summary Delete payment method
*/
export declare const useDeletePaymentMethod: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deletePaymentMethod>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deletePaymentMethod>>, TError, {
    id: number;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map
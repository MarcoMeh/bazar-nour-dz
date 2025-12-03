/**
 * Centralized error messages in Arabic
 * Use these instead of hardcoding error messages throughout the app
 */

export const ERROR_MESSAGES = {
    // Authentication & Authorization
    AUTH: {
        INVALID_CREDENTIALS: "البريد الإلكتروني أو كلمة السر خاطئة",
        EMAIL_NOT_CONFIRMED: "يرجى تأكيد البريد الإلكتروني أولاً",
        UNAUTHORIZED: "غير مصرح لك بالدخول إلى هذه الصفحة",
        SESSION_EXPIRED: "انتهت جلستك، يرجى تسجيل الدخول مرة أخرى",
        PASSWORD_TOO_WEAK: "كلمة السر ضعيفة جداً",
        USER_NOT_FOUND: "المستخدم غير موجود",
        STORE_NOT_FOUND: "اسم المتجر غير موجود",
    },

    // Network & Server
    NETWORK: {
        GENERAL: "حدث خطأ في الاتصال بالسيرفر",
        TIMEOUT: "انتهت المهلة الزمنية، يرجى المحاولة مرة أخرى",
        OFFLINE: "لا يوجد اتصال بالإنترنت",
        SERVER_ERROR: "خطأ في السيرفر، يرجى المحاولة لاحقاً",
    },

    // Database Operations
    DATABASE: {
        FETCH_FAILED: "فشل تحميل البيانات",
        CREATE_FAILED: "فشل إنشاء السجل",
        UPDATE_FAILED: "فشل تحديث البيانات",
        DELETE_FAILED: "فشل حذف السجل",
    },

    // Validation
    VALIDATION: {
        REQUIRED_FIELDS: "يرجى ملء جميع الحقول المطلوبة",
        INVALID_EMAIL: "البريد الإلكتروني غير صحيح",
        INVALID_PHONE: "رقم الهاتف غير صحيح",
        PRICE_INVALID: "السعر يجب أن يكون رقماً صحيحاً",
    },

    // Products
    PRODUCTS: {
        FETCH_FAILED: "فشل تحميل المنتجات",
        CREATE_FAILED: "فشل إضافة المنتج",
        UPDATE_FAILED: "فشل تحديث المنتج",
        DELETE_FAILED: "فشل حذف المنتج",
        NOT_FOUND: "المنتج غير موجود",
        IMAGE_UPLOAD_FAILED: "فشل رفع صورة المنتج",
    },

    // Categories
    CATEGORIES: {
        FETCH_FAILED: "فشل تحميل الفئات",
        CREATE_FAILED: "فشل إضافة الفئة",
        UPDATE_FAILED: "فشل تحديث الفئة",
        DELETE_FAILED: "فشل حذف الفئة",
        NOT_FOUND: "الفئة غير موجودة",
    },

    // Orders
    ORDERS: {
        FETCH_FAILED: "فشل تحميل الطلبات",
        CREATE_FAILED: "فشل إنشاء الطلب",
        UPDATE_FAILED: "فشل تحديث الطلب",
        CANCEL_FAILED: "فشل إلغاء الطلب",
        NOT_FOUND: "الطلب غير موجود",
    },

    // Cart
    CART: {
        ADD_FAILED: "فشل إضافة المنتج إلى السلة",
        REMOVE_FAILED: "فشل إزالة المنتج من السلة",
        UPDATE_FAILED: "فشل تحديث كمية المنتج",
        EMPTY: "السلة فارغة",
    },

    // General
    GENERAL: {
        UNKNOWN: "حدث خطأ غير متوقع",
        TRY_AGAIN: "يرجى المحاولة مرة أخرى",
        CONTACT_SUPPORT: "إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني",
    },
};

export const SUCCESS_MESSAGES = {
    AUTH: {
        LOGIN_SUCCESS: "تم تسجيل الدخول بنجاح",
        LOGOUT_SUCCESS: "تم تسجيل الخروج بنجاح",
        PASSWORD_CHANGED: "تم تغيير كلمة السر بنجاح",
    },

    PRODUCTS: {
        CREATED: "تم إضافة المنتج بنجاح",
        UPDATED: "تم تحديث المنتج بنجاح",
        DELETED: "تم حذف المنتج بنجاح",
    },

    CATEGORIES: {
        CREATED: "تم إضافة الفئة بنجاح",
        UPDATED: "تم تحديث الفئة بنجاح",
        DELETED: "تم حذف الفئة بنجاح",
    },

    ORDERS: {
        CREATED: "تم إنشاء الطلب بنجاح",
        UPDATED: "تم تحديث الطلب بنجاح",
        CANCELLED: "تم إلغاء الطلب بنجاح",
    },

    GENERAL: {
        SAVED: "تم الحفظ بنجاح",
        UPDATED: "تم التحديث بنجاح",
        DELETED: "تم الحذف بنجاح",
    },
};

/**
 * Helper function to get a user-friendly error message from a Supabase error
 */
export const getErrorMessage = (error: any): string => {
    if (!error) return ERROR_MESSAGES.GENERAL.UNKNOWN;

    // Check for specific Supabase error codes
    if (error.code === "PGRST116") return ERROR_MESSAGES.DATABASE.FETCH_FAILED;
    if (error.code === "23505") return "هذا السجل موجود بالفعل";
    if (error.code === "23503") return "لا يمكن الحذف لوجود بيانات مرتبطة";

    // Check for network errors
    if (error.message?.includes("Failed to fetch")) return ERROR_MESSAGES.NETWORK.GENERAL;
    if (error.message?.includes("NetworkError")) return ERROR_MESSAGES.NETWORK.OFFLINE;

    // Return the error message if it exists, otherwise return unknown
    return error.message || ERROR_MESSAGES.GENERAL.UNKNOWN;
};

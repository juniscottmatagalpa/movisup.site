function getRequest(url, data, callback, errorCallback) {
    const user_token = getCache('user_token');
    $.ajax({
        url: url,
        type: 'GET',
        data: data,
        headers: {
            'Authorization': `Bearer ${user_token}`
        },
        success: function (data) {
            callback(data);
        },
        error: function (xhr, status, error) {
            console.error('Request error:', error);
            if (errorCallback) {
                errorCallback(xhr, status, error);
            }
        }
    });
}

function postRequest(url, data, callback, errorCallback) {
    const user_token = getCache('user_token');
    $.ajax({
        url: url,
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${user_token}`
        },
        success: function (data) {
            callback(data);
        },
        error: function (xhr, status, error) {
            console.error('Request error:', error);
            if (errorCallback) {
                errorCallback(xhr, status, error);
            }
        }
    });
}

function setCache(key, value, minutes = 0) {
    if (minutes > 0) {
        localStorage.setItem(`${window.site_config?.site_id}_${key}`, JSON.stringify({
            value: value,
            expires_at: Date.now() + minutes * 60 * 1000
        }));
    } else {
        localStorage.setItem(`${window.site_config?.site_id}_${key}`, JSON.stringify({
            value: value,
            expires_at: 0
        }));
    }
}

function getCache(key) {
    const item = localStorage.getItem(`${window.site_config?.site_id}_${key}`);
    if (!item) {
        return null;
    }
    const { value, expires_at } = JSON.parse(item);
    if (expires_at > 0 && Date.now() > expires_at) {
        localStorage.removeItem(`${window.site_config?.site_id}_${key}`);
        return null;
    }
    return value;
}

function deleteCache(key) {
    localStorage.removeItem(`${window.site_config?.site_id}_${key}`);
}

function showToast(message, type = false) {
    Swal.fire({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 2000,
        text: message,
        icon: type
    });
}

function getImageUrlToShow(imageUrl) {
    if (window.user_info.current_plan == 'free' && imageUrl.indexOf('deevid') != -1 && window.user_info.paid_credits == 0) {
        // 检查URL是否已经有参数
        imageUrl = imageUrl + '-freeimg';
    }
    return imageUrl;
}

/**
 * 通用缓存管理器
 * 支持根据 base_path 自动生成缓存键名，避免不同页面缓存冲突
 */
class CacheManager {
    constructor() {
        this.basePath = window.site_config?.base_path || '';
        this.prefix = window.site_config?.site_id || '';
    }

    /**
     * 生成缓存键名
     * @param {string} key - 缓存键
     * @returns {string} 完整的缓存键名
     */
    generateCacheKey(key) {
        return `${this.prefix}${this.basePath}_${key}`;
    }

    /**
     * 设置缓存
     * @param {string} key - 缓存键
     * @param {any} value - 缓存值
     * @param {number} expireHours - 过期时间（小时），默认24小时
     */
    set(key, value, expireHours = 24) {
        try {
            const cacheKey = this.generateCacheKey(key);
            const cacheData = {
                value: value,
                timestamp: Date.now(),
                expireTime: Date.now() + (expireHours * 60 * 60 * 1000)
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('缓存设置失败:', error);
        }
    }

    /**
     * 获取缓存
     * @param {string} key - 缓存键
     * @returns {any} 缓存值，如果不存在或已过期返回null
     */
    get(key) {
        try {
            const cacheKey = this.generateCacheKey(key);
            const cacheStr = localStorage.getItem(cacheKey);

            if (!cacheStr) {
                return null;
            }

            const cacheData = JSON.parse(cacheStr);

            // 检查是否过期
            if (Date.now() > cacheData.expireTime) {
                this.remove(key);
                return null;
            }

            return cacheData.value;
        } catch (error) {
            console.warn('缓存获取失败:', error);
            return null;
        }
    }

    /**
     * 删除缓存
     * @param {string} key - 缓存键
     */
    remove(key) {
        try {
            const cacheKey = this.generateCacheKey(key);
            localStorage.removeItem(cacheKey);
        } catch (error) {
            console.warn('缓存删除失败:', error);
        }
    }

    /**
     * 清除所有相关缓存
     */
    clearAll() {
        try {
            const prefix = `${this.prefix}${this.basePath}_`;
            const keysToRemove = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    keysToRemove.push(key);
                }
            }

            keysToRemove.forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.warn('清除缓存失败:', error);
        }
    }

    /**
     * 批量设置缓存
     * @param {Object} data - 键值对对象
     * @param {number} expireHours - 过期时间（小时）
     */
    setBatch(data, expireHours = 24) {
        Object.keys(data).forEach(key => {
            this.set(key, data[key], expireHours);
        });
    }

    /**
     * 批量获取缓存
     * @param {Array} keys - 缓存键数组
     * @returns {Object} 键值对对象
     */
    getBatch(keys) {
        const result = {};
        keys.forEach(key => {
            result[key] = this.get(key);
        });
        return result;
    }
}

// 创建全局缓存管理器实例
window.cacheManager = new CacheManager();


// UTM参数和ref参数处理工具
(function () {
    'use strict';

    // UTM参数列表
    const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    const REF_PARAM = 'ref';

    // 检查URL参数并缓存到localStorage
    function cacheUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const paramsToCache = {};

        // 检查UTM参数
        UTM_PARAMS.forEach(param => {
            const value = urlParams.get(param);
            if (value) {
                paramsToCache[param] = value;
            }
        });

        // 检查ref参数
        const refValue = urlParams.get(REF_PARAM);
        if (refValue) {
            paramsToCache[REF_PARAM] = refValue;
        }

        // 如果有参数需要缓存，则保存到localStorage
        if (Object.keys(paramsToCache).length > 0) {
            // 使用现有的setCache函数，缓存30天
            setCache('utm_params', paramsToCache, 30 * 24 * 60);
            console.log('Cached UTM/ref parameters:', paramsToCache);
        }
    }

    // 获取缓存的UTM参数
    function getCachedUtmParams() {
        const cachedParams = getCache('utm_params');
        return cachedParams || {};
    }

    // 清除缓存的UTM参数
    function clearCachedUtmParams() {
        deleteCache('utm_params');
    }

    // 页面加载时自动检查并缓存参数
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cacheUrlParams);
    } else {
        cacheUrlParams();
    }

    // 将函数暴露到全局作用域
    window.UtmTracker = {
        cacheUrlParams,
        getCachedUtmParams,
        clearCachedUtmParams
    };

})();

/**
 * 通用图片下载功能
 * 支持跨域图片下载，如果跨域失败则回退到直接下载
 * @param {string} imageUrl - 图片URL
 * @param {string} filename - 下载文件名（可选，默认为 generated-image-时间戳.png）
 */
function downloadImage(imageUrl, filename = null) {
    // 如果没有指定文件名，生成默认文件名
    if (!filename) {
        filename = 'generated-image-' + Date.now() + '.png';
    }

    // 创建一个隐藏的canvas来下载图片
    const img = new Image();
    img.crossOrigin = 'anonymous'; // 处理跨域问题

    img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 设置canvas尺寸为图片尺寸
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        // 在canvas上绘制图片
        ctx.drawImage(img, 0, 0);

        // 将canvas转换为blob并下载
        canvas.toBlob(function (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 清理URL对象
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 100);
        }, 'image/png');
    };

    img.onerror = function () {
        // 如果跨域或其他错误，回退到直接下载
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    img.src = imageUrl;
}

// 将下载函数暴露到全局作用域
window.downloadImage = downloadImage;

// 下载视频
window.downloadVideo = function (videoUrl) {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = 'generated-video.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        // 现代 API
        return navigator.clipboard.writeText(text);
    } else {
        // 回退方案
        let input = document.createElement("textarea");
        input.value = text;
        input.style.position = "fixed"; // 避免跳动
        document.body.appendChild(input);
        input.focus();
        input.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Copy failed', err);
        }
        document.body.removeChild(input);
        return Promise.resolve();
    }
}

window.mobileCheck = function () {
    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

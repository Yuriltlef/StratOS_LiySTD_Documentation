// const CACHE_NAME = 'theme-cache-v1';
// const urlsToCache = [
//   '/',
//   '/stylesheets/extra.css',
//   '/js/theme-loader.js'
// ];

// self.addEventListener('install', function(event) {
//   event.waitUntil(
//     caches.open(CACHE_NAME)
//       .then(function(cache) {
//         return cache.addAll(urlsToCache);
//       })
//   );
// });

// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(response) {
//         if (response) {
//           return response;
//         }
//         return fetch(event.request);
//       }
//     )
//   );
// });
const CACHE_NAME = 'theme-cache-v2'; // 更新版本号以强制更新缓存
const urlsToCache = [
  '/StratOS_LiySTD_Documentation/stylesheets/extra.css',
  '/StratOS_LiySTD_Documentation/js/theme-loader.js'
];

// 安装阶段：缓存资源
self.addEventListener('install', function(event) {
  // 跳过等待，直接激活新Service Worker
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
      .catch(function(error) {
        console.log('缓存添加失败:', error);
      })
  );
});

// 激活阶段：清理旧缓存
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          // 删除旧版本的缓存
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
    // 确保Service Worker立即接管页面
    .then(function() {
      return self.clients.claim();
    })
  );
});

// fetch事件：更安全的处理方式
self.addEventListener('fetch', function(event) {
  // 跳过非GET请求
  if (event.request.method !== 'GET') {
    return;
  }
  
  // 跳过浏览器扩展请求
  if (event.request.url.startsWith('chrome-extension:')) {
    return;
  }
  
  // 对于HTML文档，使用网络优先策略
  if (event.request.destination === 'document' || 
      event.request.headers.get('Accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(function(response) {
          // 检查是否有效响应
          if (response && response.status === 200) {
            // 可选：缓存HTML响应
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseClone);
              });
          }
          return response;
        })
        .catch(function() {
          // 网络请求失败时使用缓存
          return caches.match(event.request)
            .then(function(response) {
              return response || caches.match('/');
            });
        })
    );
    return;
  }
  
  // 对于其他资源（CSS、JS等），使用缓存优先策略
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // 返回缓存响应或获取网络响应
        return response || fetch(event.request)
          .then(function(networkResponse) {
            // 检查是否有效响应
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            
            // 将响应添加到缓存
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
            
            return networkResponse;
          })
          .catch(function(error) {
            console.log('获取资源失败:', error);
            // 可返回自定义离线页面或空响应
            return new Response('离线资源不可用', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});
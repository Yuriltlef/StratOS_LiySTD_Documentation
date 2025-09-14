// 立即设置主题，无需等待DOM完全加载
(function() {
  // 获取存储的主题偏好或使用系统偏好
  var saved = localStorage.getItem('md-prefers-color-scheme');
  var system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'slate' : 'default';
  var scheme = saved || system;
  
  // 立即设置主题
  document.documentElement.setAttribute('data-md-color-scheme', scheme);
  document.documentElement.setAttribute('data-md-color-primary', 'custom');
})();
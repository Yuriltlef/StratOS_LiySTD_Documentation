if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./StratOS_LiySTD_Documentation/sw.js').then(function(registration) {
      console.log('SW registered: ', registration);
    }).catch(function(registrationError) {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
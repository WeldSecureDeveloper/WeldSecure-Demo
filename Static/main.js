// main.js - global namespace + router bootstrap
(function () {
  window.Weld = window.Weld || { state: null, features: {}, route: null, autorun: false };

  Weld.render = function () {
    if (typeof window.renderApp === 'function') {
      renderApp();
      return;
    }
    if (!Weld.route || !Weld.features[Weld.route]) return;
    const root = document.getElementById('app') || document.body;
    root.innerHTML = '';
    Weld.features[Weld.route].render(root, Weld.state);
  };

  Weld.navigate = function (route) {
    if (typeof window.navigate === 'function') {
      navigate(route);
      return;
    }
    Weld.route = route;
    Weld.render();
  };

  function bootstrap() {
    const providedState = typeof window.state !== 'undefined' ? window.state : null;
    const restoredState = providedState || WeldState.loadState() || WeldState.initialState();
    if (!providedState) {
      window.state = restoredState;
    }
    if (!restoredState.meta) {
      restoredState.meta = {};
    }
    Weld.state = restoredState;
    const defaultRoute = restoredState.meta.route || 'landing';
    if (!restoredState.meta.route) {
      restoredState.meta.route = defaultRoute;
    }
    Weld.route = defaultRoute;
    Weld.autorun = true;
    Weld.render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

  window.addEventListener('hashchange', () => {
    const hashRoute = window.location.hash.replace('#', '');
    if (!hashRoute || !window.ROUTES || !window.ROUTES[hashRoute]) return;
    const requiresRole = window.ROUTES[hashRoute].requiresRole;
    if (requiresRole && typeof window.setRole === 'function') {
      setRole(requiresRole, hashRoute);
      return;
    }
    if (typeof window.navigate === 'function') {
      navigate(hashRoute);
    } else {
      Weld.route = hashRoute;
      Weld.render();
    }
  });
})();

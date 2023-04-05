(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // ../../../../node_modules/@rails/actioncable/src/adapters.js
  var adapters_default;
  var init_adapters = __esm({
    "../../../../node_modules/@rails/actioncable/src/adapters.js"() {
      adapters_default = {
        logger: self.console,
        WebSocket: self.WebSocket
      };
    }
  });

  // ../../../../node_modules/@rails/actioncable/src/logger.js
  var logger_default;
  var init_logger = __esm({
    "../../../../node_modules/@rails/actioncable/src/logger.js"() {
      init_adapters();
      logger_default = {
        log(...messages) {
          if (this.enabled) {
            messages.push(Date.now());
            adapters_default.logger.log("[ActionCable]", ...messages);
          }
        }
      };
    }
  });

  // ../../../../node_modules/@rails/actioncable/src/connection_monitor.js
  var now, secondsSince, ConnectionMonitor, connection_monitor_default;
  var init_connection_monitor = __esm({
    "../../../../node_modules/@rails/actioncable/src/connection_monitor.js"() {
      init_logger();
      now = () => (/* @__PURE__ */ new Date()).getTime();
      secondsSince = (time) => (now() - time) / 1e3;
      ConnectionMonitor = class {
        constructor(connection) {
          this.visibilityDidChange = this.visibilityDidChange.bind(this);
          this.connection = connection;
          this.reconnectAttempts = 0;
        }
        start() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            addEventListener("visibilitychange", this.visibilityDidChange);
            logger_default.log(`ConnectionMonitor started. stale threshold = ${this.constructor.staleThreshold} s`);
          }
        }
        stop() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            removeEventListener("visibilitychange", this.visibilityDidChange);
            logger_default.log("ConnectionMonitor stopped");
          }
        }
        isRunning() {
          return this.startedAt && !this.stoppedAt;
        }
        recordPing() {
          this.pingedAt = now();
        }
        recordConnect() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          logger_default.log("ConnectionMonitor recorded connect");
        }
        recordDisconnect() {
          this.disconnectedAt = now();
          logger_default.log("ConnectionMonitor recorded disconnect");
        }
        // Private
        startPolling() {
          this.stopPolling();
          this.poll();
        }
        stopPolling() {
          clearTimeout(this.pollTimeout);
        }
        poll() {
          this.pollTimeout = setTimeout(
            () => {
              this.reconnectIfStale();
              this.poll();
            },
            this.getPollInterval()
          );
        }
        getPollInterval() {
          const { staleThreshold, reconnectionBackoffRate } = this.constructor;
          const backoff = Math.pow(1 + reconnectionBackoffRate, Math.min(this.reconnectAttempts, 10));
          const jitterMax = this.reconnectAttempts === 0 ? 1 : reconnectionBackoffRate;
          const jitter = jitterMax * Math.random();
          return staleThreshold * 1e3 * backoff * (1 + jitter);
        }
        reconnectIfStale() {
          if (this.connectionIsStale()) {
            logger_default.log(`ConnectionMonitor detected stale connection. reconnectAttempts = ${this.reconnectAttempts}, time stale = ${secondsSince(this.refreshedAt)} s, stale threshold = ${this.constructor.staleThreshold} s`);
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              logger_default.log(`ConnectionMonitor skipping reopening recent disconnect. time disconnected = ${secondsSince(this.disconnectedAt)} s`);
            } else {
              logger_default.log("ConnectionMonitor reopening");
              this.connection.reopen();
            }
          }
        }
        get refreshedAt() {
          return this.pingedAt ? this.pingedAt : this.startedAt;
        }
        connectionIsStale() {
          return secondsSince(this.refreshedAt) > this.constructor.staleThreshold;
        }
        disconnectedRecently() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        }
        visibilityDidChange() {
          if (document.visibilityState === "visible") {
            setTimeout(
              () => {
                if (this.connectionIsStale() || !this.connection.isOpen()) {
                  logger_default.log(`ConnectionMonitor reopening stale connection on visibilitychange. visibilityState = ${document.visibilityState}`);
                  this.connection.reopen();
                }
              },
              200
            );
          }
        }
      };
      ConnectionMonitor.staleThreshold = 6;
      ConnectionMonitor.reconnectionBackoffRate = 0.15;
      connection_monitor_default = ConnectionMonitor;
    }
  });

  // ../../../../node_modules/@rails/actioncable/src/internal.js
  var internal_default;
  var init_internal = __esm({
    "../../../../node_modules/@rails/actioncable/src/internal.js"() {
      internal_default = {
        "message_types": {
          "welcome": "welcome",
          "disconnect": "disconnect",
          "ping": "ping",
          "confirmation": "confirm_subscription",
          "rejection": "reject_subscription"
        },
        "disconnect_reasons": {
          "unauthorized": "unauthorized",
          "invalid_request": "invalid_request",
          "server_restart": "server_restart"
        },
        "default_mount_path": "/cable",
        "protocols": [
          "actioncable-v1-json",
          "actioncable-unsupported"
        ]
      };
    }
  });

  // ../../../../node_modules/@rails/actioncable/src/connection.js
  var message_types, protocols, supportedProtocols, indexOf, Connection, connection_default;
  var init_connection = __esm({
    "../../../../node_modules/@rails/actioncable/src/connection.js"() {
      init_adapters();
      init_connection_monitor();
      init_internal();
      init_logger();
      ({ message_types, protocols } = internal_default);
      supportedProtocols = protocols.slice(0, protocols.length - 1);
      indexOf = [].indexOf;
      Connection = class {
        constructor(consumer2) {
          this.open = this.open.bind(this);
          this.consumer = consumer2;
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new connection_monitor_default(this);
          this.disconnected = true;
        }
        send(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        }
        open() {
          if (this.isActive()) {
            logger_default.log(`Attempted to open WebSocket, but existing socket is ${this.getState()}`);
            return false;
          } else {
            logger_default.log(`Opening WebSocket, current state is ${this.getState()}, subprotocols: ${protocols}`);
            if (this.webSocket) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new adapters_default.WebSocket(this.consumer.url, protocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        }
        close({ allowReconnect } = { allowReconnect: true }) {
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isOpen()) {
            return this.webSocket.close();
          }
        }
        reopen() {
          logger_default.log(`Reopening WebSocket, current state is ${this.getState()}`);
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error2) {
              logger_default.log("Failed to reopen WebSocket", error2);
            } finally {
              logger_default.log(`Reopening WebSocket in ${this.constructor.reopenDelay}ms`);
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        }
        getProtocol() {
          if (this.webSocket) {
            return this.webSocket.protocol;
          }
        }
        isOpen() {
          return this.isState("open");
        }
        isActive() {
          return this.isState("open", "connecting");
        }
        // Private
        isProtocolSupported() {
          return indexOf.call(supportedProtocols, this.getProtocol()) >= 0;
        }
        isState(...states) {
          return indexOf.call(states, this.getState()) >= 0;
        }
        getState() {
          if (this.webSocket) {
            for (let state in adapters_default.WebSocket) {
              if (adapters_default.WebSocket[state] === this.webSocket.readyState) {
                return state.toLowerCase();
              }
            }
          }
          return null;
        }
        installEventHandlers() {
          for (let eventName in this.events) {
            const handler = this.events[eventName].bind(this);
            this.webSocket[`on${eventName}`] = handler;
          }
        }
        uninstallEventHandlers() {
          for (let eventName in this.events) {
            this.webSocket[`on${eventName}`] = function() {
            };
          }
        }
      };
      Connection.reopenDelay = 500;
      Connection.prototype.events = {
        message(event) {
          if (!this.isProtocolSupported()) {
            return;
          }
          const { identifier, message, reason, reconnect, type } = JSON.parse(event.data);
          switch (type) {
            case message_types.welcome:
              this.monitor.recordConnect();
              return this.subscriptions.reload();
            case message_types.disconnect:
              logger_default.log(`Disconnecting. Reason: ${reason}`);
              return this.close({ allowReconnect: reconnect });
            case message_types.ping:
              return this.monitor.recordPing();
            case message_types.confirmation:
              this.subscriptions.confirmSubscription(identifier);
              return this.subscriptions.notify(identifier, "connected");
            case message_types.rejection:
              return this.subscriptions.reject(identifier);
            default:
              return this.subscriptions.notify(identifier, "received", message);
          }
        },
        open() {
          logger_default.log(`WebSocket onopen event, using '${this.getProtocol()}' subprotocol`);
          this.disconnected = false;
          if (!this.isProtocolSupported()) {
            logger_default.log("Protocol is unsupported. Stopping monitor and disconnecting.");
            return this.close({ allowReconnect: false });
          }
        },
        close(event) {
          logger_default.log("WebSocket onclose event");
          if (this.disconnected) {
            return;
          }
          this.disconnected = true;
          this.monitor.recordDisconnect();
          return this.subscriptions.notifyAll("disconnected", { willAttemptReconnect: this.monitor.isRunning() });
        },
        error() {
          logger_default.log("WebSocket onerror event");
        }
      };
      connection_default = Connection;
    }
  });

  // ../../../../node_modules/@rails/actioncable/src/subscription.js
  var extend, Subscription;
  var init_subscription = __esm({
    "../../../../node_modules/@rails/actioncable/src/subscription.js"() {
      extend = function(object, properties) {
        if (properties != null) {
          for (let key in properties) {
            const value = properties[key];
            object[key] = value;
          }
        }
        return object;
      };
      Subscription = class {
        constructor(consumer2, params = {}, mixin) {
          this.consumer = consumer2;
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }
        // Perform a channel action with the optional data passed as an attribute
        perform(action, data = {}) {
          data.action = action;
          return this.send(data);
        }
        send(data) {
          return this.consumer.send({ command: "message", identifier: this.identifier, data: JSON.stringify(data) });
        }
        unsubscribe() {
          return this.consumer.subscriptions.remove(this);
        }
      };
    }
  });

  // ../../../../node_modules/@rails/actioncable/src/subscription_guarantor.js
  var SubscriptionGuarantor, subscription_guarantor_default;
  var init_subscription_guarantor = __esm({
    "../../../../node_modules/@rails/actioncable/src/subscription_guarantor.js"() {
      init_logger();
      SubscriptionGuarantor = class {
        constructor(subscriptions) {
          this.subscriptions = subscriptions;
          this.pendingSubscriptions = [];
        }
        guarantee(subscription) {
          if (this.pendingSubscriptions.indexOf(subscription) == -1) {
            logger_default.log(`SubscriptionGuarantor guaranteeing ${subscription.identifier}`);
            this.pendingSubscriptions.push(subscription);
          } else {
            logger_default.log(`SubscriptionGuarantor already guaranteeing ${subscription.identifier}`);
          }
          this.startGuaranteeing();
        }
        forget(subscription) {
          logger_default.log(`SubscriptionGuarantor forgetting ${subscription.identifier}`);
          this.pendingSubscriptions = this.pendingSubscriptions.filter((s) => s !== subscription);
        }
        startGuaranteeing() {
          this.stopGuaranteeing();
          this.retrySubscribing();
        }
        stopGuaranteeing() {
          clearTimeout(this.retryTimeout);
        }
        retrySubscribing() {
          this.retryTimeout = setTimeout(
            () => {
              if (this.subscriptions && typeof this.subscriptions.subscribe === "function") {
                this.pendingSubscriptions.map((subscription) => {
                  logger_default.log(`SubscriptionGuarantor resubscribing ${subscription.identifier}`);
                  this.subscriptions.subscribe(subscription);
                });
              }
            },
            500
          );
        }
      };
      subscription_guarantor_default = SubscriptionGuarantor;
    }
  });

  // ../../../../node_modules/@rails/actioncable/src/subscriptions.js
  var Subscriptions;
  var init_subscriptions = __esm({
    "../../../../node_modules/@rails/actioncable/src/subscriptions.js"() {
      init_subscription();
      init_subscription_guarantor();
      init_logger();
      Subscriptions = class {
        constructor(consumer2) {
          this.consumer = consumer2;
          this.guarantor = new subscription_guarantor_default(this);
          this.subscriptions = [];
        }
        create(channelName, mixin) {
          const channel = channelName;
          const params = typeof channel === "object" ? channel : { channel };
          const subscription = new Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        }
        // Private
        add(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.subscribe(subscription);
          return subscription;
        }
        remove(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        }
        reject(identifier) {
          return this.findAll(identifier).map((subscription) => {
            this.forget(subscription);
            this.notify(subscription, "rejected");
            return subscription;
          });
        }
        forget(subscription) {
          this.guarantor.forget(subscription);
          this.subscriptions = this.subscriptions.filter((s) => s !== subscription);
          return subscription;
        }
        findAll(identifier) {
          return this.subscriptions.filter((s) => s.identifier === identifier);
        }
        reload() {
          return this.subscriptions.map((subscription) => this.subscribe(subscription));
        }
        notifyAll(callbackName, ...args) {
          return this.subscriptions.map((subscription) => this.notify(subscription, callbackName, ...args));
        }
        notify(subscription, callbackName, ...args) {
          let subscriptions;
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          return subscriptions.map((subscription2) => typeof subscription2[callbackName] === "function" ? subscription2[callbackName](...args) : void 0);
        }
        subscribe(subscription) {
          if (this.sendCommand(subscription, "subscribe")) {
            this.guarantor.guarantee(subscription);
          }
        }
        confirmSubscription(identifier) {
          logger_default.log(`Subscription confirmed ${identifier}`);
          this.findAll(identifier).map((subscription) => this.guarantor.forget(subscription));
        }
        sendCommand(subscription, command) {
          const { identifier } = subscription;
          return this.consumer.send({ command, identifier });
        }
      };
    }
  });

  // ../../../../node_modules/@rails/actioncable/src/consumer.js
  function createWebSocketURL(url) {
    if (typeof url === "function") {
      url = url();
    }
    if (url && !/^wss?:/i.test(url)) {
      const a = document.createElement("a");
      a.href = url;
      a.href = a.href;
      a.protocol = a.protocol.replace("http", "ws");
      return a.href;
    } else {
      return url;
    }
  }
  var Consumer;
  var init_consumer = __esm({
    "../../../../node_modules/@rails/actioncable/src/consumer.js"() {
      init_connection();
      init_subscriptions();
      Consumer = class {
        constructor(url) {
          this._url = url;
          this.subscriptions = new Subscriptions(this);
          this.connection = new connection_default(this);
        }
        get url() {
          return createWebSocketURL(this._url);
        }
        send(data) {
          return this.connection.send(data);
        }
        connect() {
          return this.connection.open();
        }
        disconnect() {
          return this.connection.close({ allowReconnect: false });
        }
        ensureActiveConnection() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        }
      };
    }
  });

  // ../../../../node_modules/@rails/actioncable/src/index.js
  var src_exports = {};
  __export(src_exports, {
    Connection: () => connection_default,
    ConnectionMonitor: () => connection_monitor_default,
    Consumer: () => Consumer,
    INTERNAL: () => internal_default,
    Subscription: () => Subscription,
    SubscriptionGuarantor: () => subscription_guarantor_default,
    Subscriptions: () => Subscriptions,
    adapters: () => adapters_default,
    createConsumer: () => createConsumer,
    createWebSocketURL: () => createWebSocketURL,
    getConfig: () => getConfig,
    logger: () => logger_default
  });
  function createConsumer(url = getConfig("url") || internal_default.default_mount_path) {
    return new Consumer(url);
  }
  function getConfig(name) {
    const element = document.head.querySelector(`meta[name='action-cable-${name}']`);
    if (element) {
      return element.getAttribute("content");
    }
  }
  var init_src = __esm({
    "../../../../node_modules/@rails/actioncable/src/index.js"() {
      init_connection();
      init_connection_monitor();
      init_consumer();
      init_internal();
      init_subscription();
      init_subscriptions();
      init_subscription_guarantor();
      init_adapters();
      init_logger();
    }
  });

  // controllers/reveal_controller.js
  var require_reveal_controller = __commonJS({
    "controllers/reveal_controller.js"() {
    }
  });

  // ../../../../node_modules/@hotwired/turbo/dist/turbo.es2017-esm.js
  (function() {
    if (window.Reflect === void 0 || window.customElements === void 0 || window.customElements.polyfillWrapFlushCallback) {
      return;
    }
    const BuiltInHTMLElement = HTMLElement;
    const wrapperForTheName = {
      HTMLElement: function HTMLElement2() {
        return Reflect.construct(BuiltInHTMLElement, [], this.constructor);
      }
    };
    window.HTMLElement = wrapperForTheName["HTMLElement"];
    HTMLElement.prototype = BuiltInHTMLElement.prototype;
    HTMLElement.prototype.constructor = HTMLElement;
    Object.setPrototypeOf(HTMLElement, BuiltInHTMLElement);
  })();
  (function(prototype) {
    if (typeof prototype.requestSubmit == "function")
      return;
    prototype.requestSubmit = function(submitter) {
      if (submitter) {
        validateSubmitter(submitter, this);
        submitter.click();
      } else {
        submitter = document.createElement("input");
        submitter.type = "submit";
        submitter.hidden = true;
        this.appendChild(submitter);
        submitter.click();
        this.removeChild(submitter);
      }
    };
    function validateSubmitter(submitter, form) {
      submitter instanceof HTMLElement || raise(TypeError, "parameter 1 is not of type 'HTMLElement'");
      submitter.type == "submit" || raise(TypeError, "The specified element is not a submit button");
      submitter.form == form || raise(DOMException, "The specified element is not owned by this form element", "NotFoundError");
    }
    function raise(errorConstructor, message, name) {
      throw new errorConstructor("Failed to execute 'requestSubmit' on 'HTMLFormElement': " + message + ".", name);
    }
  })(HTMLFormElement.prototype);
  var submittersByForm = /* @__PURE__ */ new WeakMap();
  function findSubmitterFromClickTarget(target) {
    const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
    const candidate = element ? element.closest("input, button") : null;
    return (candidate === null || candidate === void 0 ? void 0 : candidate.type) == "submit" ? candidate : null;
  }
  function clickCaptured(event) {
    const submitter = findSubmitterFromClickTarget(event.target);
    if (submitter && submitter.form) {
      submittersByForm.set(submitter.form, submitter);
    }
  }
  (function() {
    if ("submitter" in Event.prototype)
      return;
    let prototype = window.Event.prototype;
    if ("SubmitEvent" in window && /Apple Computer/.test(navigator.vendor)) {
      prototype = window.SubmitEvent.prototype;
    } else if ("SubmitEvent" in window) {
      return;
    }
    addEventListener("click", clickCaptured, true);
    Object.defineProperty(prototype, "submitter", {
      get() {
        if (this.type == "submit" && this.target instanceof HTMLFormElement) {
          return submittersByForm.get(this.target);
        }
      }
    });
  })();
  var FrameLoadingStyle;
  (function(FrameLoadingStyle2) {
    FrameLoadingStyle2["eager"] = "eager";
    FrameLoadingStyle2["lazy"] = "lazy";
  })(FrameLoadingStyle || (FrameLoadingStyle = {}));
  var FrameElement = class extends HTMLElement {
    static get observedAttributes() {
      return ["disabled", "complete", "loading", "src"];
    }
    constructor() {
      super();
      this.loaded = Promise.resolve();
      this.delegate = new FrameElement.delegateConstructor(this);
    }
    connectedCallback() {
      this.delegate.connect();
    }
    disconnectedCallback() {
      this.delegate.disconnect();
    }
    reload() {
      return this.delegate.sourceURLReloaded();
    }
    attributeChangedCallback(name) {
      if (name == "loading") {
        this.delegate.loadingStyleChanged();
      } else if (name == "complete") {
        this.delegate.completeChanged();
      } else if (name == "src") {
        this.delegate.sourceURLChanged();
      } else {
        this.delegate.disabledChanged();
      }
    }
    get src() {
      return this.getAttribute("src");
    }
    set src(value) {
      if (value) {
        this.setAttribute("src", value);
      } else {
        this.removeAttribute("src");
      }
    }
    get loading() {
      return frameLoadingStyleFromString(this.getAttribute("loading") || "");
    }
    set loading(value) {
      if (value) {
        this.setAttribute("loading", value);
      } else {
        this.removeAttribute("loading");
      }
    }
    get disabled() {
      return this.hasAttribute("disabled");
    }
    set disabled(value) {
      if (value) {
        this.setAttribute("disabled", "");
      } else {
        this.removeAttribute("disabled");
      }
    }
    get autoscroll() {
      return this.hasAttribute("autoscroll");
    }
    set autoscroll(value) {
      if (value) {
        this.setAttribute("autoscroll", "");
      } else {
        this.removeAttribute("autoscroll");
      }
    }
    get complete() {
      return !this.delegate.isLoading;
    }
    get isActive() {
      return this.ownerDocument === document && !this.isPreview;
    }
    get isPreview() {
      var _a, _b;
      return (_b = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.documentElement) === null || _b === void 0 ? void 0 : _b.hasAttribute("data-turbo-preview");
    }
  };
  function frameLoadingStyleFromString(style) {
    switch (style.toLowerCase()) {
      case "lazy":
        return FrameLoadingStyle.lazy;
      default:
        return FrameLoadingStyle.eager;
    }
  }
  function expandURL(locatable) {
    return new URL(locatable.toString(), document.baseURI);
  }
  function getAnchor(url) {
    let anchorMatch;
    if (url.hash) {
      return url.hash.slice(1);
    } else if (anchorMatch = url.href.match(/#(.*)$/)) {
      return anchorMatch[1];
    }
  }
  function getAction(form, submitter) {
    const action = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formaction")) || form.getAttribute("action") || form.action;
    return expandURL(action);
  }
  function getExtension(url) {
    return (getLastPathComponent(url).match(/\.[^.]*$/) || [])[0] || "";
  }
  function isHTML(url) {
    return !!getExtension(url).match(/^(?:|\.(?:htm|html|xhtml|php))$/);
  }
  function isPrefixedBy(baseURL, url) {
    const prefix = getPrefix(url);
    return baseURL.href === expandURL(prefix).href || baseURL.href.startsWith(prefix);
  }
  function locationIsVisitable(location2, rootLocation) {
    return isPrefixedBy(location2, rootLocation) && isHTML(location2);
  }
  function getRequestURL(url) {
    const anchor = getAnchor(url);
    return anchor != null ? url.href.slice(0, -(anchor.length + 1)) : url.href;
  }
  function toCacheKey(url) {
    return getRequestURL(url);
  }
  function urlsAreEqual(left, right) {
    return expandURL(left).href == expandURL(right).href;
  }
  function getPathComponents(url) {
    return url.pathname.split("/").slice(1);
  }
  function getLastPathComponent(url) {
    return getPathComponents(url).slice(-1)[0];
  }
  function getPrefix(url) {
    return addTrailingSlash(url.origin + url.pathname);
  }
  function addTrailingSlash(value) {
    return value.endsWith("/") ? value : value + "/";
  }
  var FetchResponse = class {
    constructor(response) {
      this.response = response;
    }
    get succeeded() {
      return this.response.ok;
    }
    get failed() {
      return !this.succeeded;
    }
    get clientError() {
      return this.statusCode >= 400 && this.statusCode <= 499;
    }
    get serverError() {
      return this.statusCode >= 500 && this.statusCode <= 599;
    }
    get redirected() {
      return this.response.redirected;
    }
    get location() {
      return expandURL(this.response.url);
    }
    get isHTML() {
      return this.contentType && this.contentType.match(/^(?:text\/([^\s;,]+\b)?html|application\/xhtml\+xml)\b/);
    }
    get statusCode() {
      return this.response.status;
    }
    get contentType() {
      return this.header("Content-Type");
    }
    get responseText() {
      return this.response.clone().text();
    }
    get responseHTML() {
      if (this.isHTML) {
        return this.response.clone().text();
      } else {
        return Promise.resolve(void 0);
      }
    }
    header(name) {
      return this.response.headers.get(name);
    }
  };
  function activateScriptElement(element) {
    if (element.getAttribute("data-turbo-eval") == "false") {
      return element;
    } else {
      const createdScriptElement = document.createElement("script");
      const cspNonce = getMetaContent("csp-nonce");
      if (cspNonce) {
        createdScriptElement.nonce = cspNonce;
      }
      createdScriptElement.textContent = element.textContent;
      createdScriptElement.async = false;
      copyElementAttributes(createdScriptElement, element);
      return createdScriptElement;
    }
  }
  function copyElementAttributes(destinationElement, sourceElement) {
    for (const { name, value } of sourceElement.attributes) {
      destinationElement.setAttribute(name, value);
    }
  }
  function createDocumentFragment(html) {
    const template = document.createElement("template");
    template.innerHTML = html;
    return template.content;
  }
  function dispatch(eventName, { target, cancelable, detail } = {}) {
    const event = new CustomEvent(eventName, {
      cancelable,
      bubbles: true,
      composed: true,
      detail
    });
    if (target && target.isConnected) {
      target.dispatchEvent(event);
    } else {
      document.documentElement.dispatchEvent(event);
    }
    return event;
  }
  function nextAnimationFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }
  function nextEventLoopTick() {
    return new Promise((resolve) => setTimeout(() => resolve(), 0));
  }
  function nextMicrotask() {
    return Promise.resolve();
  }
  function parseHTMLDocument(html = "") {
    return new DOMParser().parseFromString(html, "text/html");
  }
  function unindent(strings, ...values) {
    const lines = interpolate(strings, values).replace(/^\n/, "").split("\n");
    const match = lines[0].match(/^\s+/);
    const indent = match ? match[0].length : 0;
    return lines.map((line) => line.slice(indent)).join("\n");
  }
  function interpolate(strings, values) {
    return strings.reduce((result, string, i) => {
      const value = values[i] == void 0 ? "" : values[i];
      return result + string + value;
    }, "");
  }
  function uuid() {
    return Array.from({ length: 36 }).map((_, i) => {
      if (i == 8 || i == 13 || i == 18 || i == 23) {
        return "-";
      } else if (i == 14) {
        return "4";
      } else if (i == 19) {
        return (Math.floor(Math.random() * 4) + 8).toString(16);
      } else {
        return Math.floor(Math.random() * 15).toString(16);
      }
    }).join("");
  }
  function getAttribute(attributeName, ...elements) {
    for (const value of elements.map((element) => element === null || element === void 0 ? void 0 : element.getAttribute(attributeName))) {
      if (typeof value == "string")
        return value;
    }
    return null;
  }
  function hasAttribute(attributeName, ...elements) {
    return elements.some((element) => element && element.hasAttribute(attributeName));
  }
  function markAsBusy(...elements) {
    for (const element of elements) {
      if (element.localName == "turbo-frame") {
        element.setAttribute("busy", "");
      }
      element.setAttribute("aria-busy", "true");
    }
  }
  function clearBusyState(...elements) {
    for (const element of elements) {
      if (element.localName == "turbo-frame") {
        element.removeAttribute("busy");
      }
      element.removeAttribute("aria-busy");
    }
  }
  function waitForLoad(element, timeoutInMilliseconds = 2e3) {
    return new Promise((resolve) => {
      const onComplete = () => {
        element.removeEventListener("error", onComplete);
        element.removeEventListener("load", onComplete);
        resolve();
      };
      element.addEventListener("load", onComplete, { once: true });
      element.addEventListener("error", onComplete, { once: true });
      setTimeout(resolve, timeoutInMilliseconds);
    });
  }
  function getHistoryMethodForAction(action) {
    switch (action) {
      case "replace":
        return history.replaceState;
      case "advance":
      case "restore":
        return history.pushState;
    }
  }
  function isAction(action) {
    return action == "advance" || action == "replace" || action == "restore";
  }
  function getVisitAction(...elements) {
    const action = getAttribute("data-turbo-action", ...elements);
    return isAction(action) ? action : null;
  }
  function getMetaElement(name) {
    return document.querySelector(`meta[name="${name}"]`);
  }
  function getMetaContent(name) {
    const element = getMetaElement(name);
    return element && element.content;
  }
  function setMetaContent(name, content) {
    let element = getMetaElement(name);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute("name", name);
      document.head.appendChild(element);
    }
    element.setAttribute("content", content);
    return element;
  }
  function findClosestRecursively(element, selector) {
    var _a;
    if (element instanceof Element) {
      return element.closest(selector) || findClosestRecursively(element.assignedSlot || ((_a = element.getRootNode()) === null || _a === void 0 ? void 0 : _a.host), selector);
    }
  }
  var FetchMethod;
  (function(FetchMethod2) {
    FetchMethod2[FetchMethod2["get"] = 0] = "get";
    FetchMethod2[FetchMethod2["post"] = 1] = "post";
    FetchMethod2[FetchMethod2["put"] = 2] = "put";
    FetchMethod2[FetchMethod2["patch"] = 3] = "patch";
    FetchMethod2[FetchMethod2["delete"] = 4] = "delete";
  })(FetchMethod || (FetchMethod = {}));
  function fetchMethodFromString(method) {
    switch (method.toLowerCase()) {
      case "get":
        return FetchMethod.get;
      case "post":
        return FetchMethod.post;
      case "put":
        return FetchMethod.put;
      case "patch":
        return FetchMethod.patch;
      case "delete":
        return FetchMethod.delete;
    }
  }
  var FetchRequest = class {
    constructor(delegate, method, location2, body = new URLSearchParams(), target = null) {
      this.abortController = new AbortController();
      this.resolveRequestPromise = (_value) => {
      };
      this.delegate = delegate;
      this.method = method;
      this.headers = this.defaultHeaders;
      this.body = body;
      this.url = location2;
      this.target = target;
    }
    get location() {
      return this.url;
    }
    get params() {
      return this.url.searchParams;
    }
    get entries() {
      return this.body ? Array.from(this.body.entries()) : [];
    }
    cancel() {
      this.abortController.abort();
    }
    async perform() {
      const { fetchOptions } = this;
      this.delegate.prepareRequest(this);
      await this.allowRequestToBeIntercepted(fetchOptions);
      try {
        this.delegate.requestStarted(this);
        const response = await fetch(this.url.href, fetchOptions);
        return await this.receive(response);
      } catch (error2) {
        if (error2.name !== "AbortError") {
          if (this.willDelegateErrorHandling(error2)) {
            this.delegate.requestErrored(this, error2);
          }
          throw error2;
        }
      } finally {
        this.delegate.requestFinished(this);
      }
    }
    async receive(response) {
      const fetchResponse = new FetchResponse(response);
      const event = dispatch("turbo:before-fetch-response", {
        cancelable: true,
        detail: { fetchResponse },
        target: this.target
      });
      if (event.defaultPrevented) {
        this.delegate.requestPreventedHandlingResponse(this, fetchResponse);
      } else if (fetchResponse.succeeded) {
        this.delegate.requestSucceededWithResponse(this, fetchResponse);
      } else {
        this.delegate.requestFailedWithResponse(this, fetchResponse);
      }
      return fetchResponse;
    }
    get fetchOptions() {
      var _a;
      return {
        method: FetchMethod[this.method].toUpperCase(),
        credentials: "same-origin",
        headers: this.headers,
        redirect: "follow",
        body: this.isSafe ? null : this.body,
        signal: this.abortSignal,
        referrer: (_a = this.delegate.referrer) === null || _a === void 0 ? void 0 : _a.href
      };
    }
    get defaultHeaders() {
      return {
        Accept: "text/html, application/xhtml+xml"
      };
    }
    get isSafe() {
      return this.method === FetchMethod.get;
    }
    get abortSignal() {
      return this.abortController.signal;
    }
    acceptResponseType(mimeType) {
      this.headers["Accept"] = [mimeType, this.headers["Accept"]].join(", ");
    }
    async allowRequestToBeIntercepted(fetchOptions) {
      const requestInterception = new Promise((resolve) => this.resolveRequestPromise = resolve);
      const event = dispatch("turbo:before-fetch-request", {
        cancelable: true,
        detail: {
          fetchOptions,
          url: this.url,
          resume: this.resolveRequestPromise
        },
        target: this.target
      });
      if (event.defaultPrevented)
        await requestInterception;
    }
    willDelegateErrorHandling(error2) {
      const event = dispatch("turbo:fetch-request-error", {
        target: this.target,
        cancelable: true,
        detail: { request: this, error: error2 }
      });
      return !event.defaultPrevented;
    }
  };
  var AppearanceObserver = class {
    constructor(delegate, element) {
      this.started = false;
      this.intersect = (entries) => {
        const lastEntry = entries.slice(-1)[0];
        if (lastEntry === null || lastEntry === void 0 ? void 0 : lastEntry.isIntersecting) {
          this.delegate.elementAppearedInViewport(this.element);
        }
      };
      this.delegate = delegate;
      this.element = element;
      this.intersectionObserver = new IntersectionObserver(this.intersect);
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.intersectionObserver.observe(this.element);
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        this.intersectionObserver.unobserve(this.element);
      }
    }
  };
  var StreamMessage = class {
    static wrap(message) {
      if (typeof message == "string") {
        return new this(createDocumentFragment(message));
      } else {
        return message;
      }
    }
    constructor(fragment) {
      this.fragment = importStreamElements(fragment);
    }
  };
  StreamMessage.contentType = "text/vnd.turbo-stream.html";
  function importStreamElements(fragment) {
    for (const element of fragment.querySelectorAll("turbo-stream")) {
      const streamElement = document.importNode(element, true);
      for (const inertScriptElement of streamElement.templateElement.content.querySelectorAll("script")) {
        inertScriptElement.replaceWith(activateScriptElement(inertScriptElement));
      }
      element.replaceWith(streamElement);
    }
    return fragment;
  }
  var FormSubmissionState;
  (function(FormSubmissionState2) {
    FormSubmissionState2[FormSubmissionState2["initialized"] = 0] = "initialized";
    FormSubmissionState2[FormSubmissionState2["requesting"] = 1] = "requesting";
    FormSubmissionState2[FormSubmissionState2["waiting"] = 2] = "waiting";
    FormSubmissionState2[FormSubmissionState2["receiving"] = 3] = "receiving";
    FormSubmissionState2[FormSubmissionState2["stopping"] = 4] = "stopping";
    FormSubmissionState2[FormSubmissionState2["stopped"] = 5] = "stopped";
  })(FormSubmissionState || (FormSubmissionState = {}));
  var FormEnctype;
  (function(FormEnctype2) {
    FormEnctype2["urlEncoded"] = "application/x-www-form-urlencoded";
    FormEnctype2["multipart"] = "multipart/form-data";
    FormEnctype2["plain"] = "text/plain";
  })(FormEnctype || (FormEnctype = {}));
  function formEnctypeFromString(encoding) {
    switch (encoding.toLowerCase()) {
      case FormEnctype.multipart:
        return FormEnctype.multipart;
      case FormEnctype.plain:
        return FormEnctype.plain;
      default:
        return FormEnctype.urlEncoded;
    }
  }
  var FormSubmission = class {
    static confirmMethod(message, _element, _submitter) {
      return Promise.resolve(confirm(message));
    }
    constructor(delegate, formElement, submitter, mustRedirect = false) {
      this.state = FormSubmissionState.initialized;
      this.delegate = delegate;
      this.formElement = formElement;
      this.submitter = submitter;
      this.formData = buildFormData(formElement, submitter);
      this.location = expandURL(this.action);
      if (this.method == FetchMethod.get) {
        mergeFormDataEntries(this.location, [...this.body.entries()]);
      }
      this.fetchRequest = new FetchRequest(this, this.method, this.location, this.body, this.formElement);
      this.mustRedirect = mustRedirect;
    }
    get method() {
      var _a;
      const method = ((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("formmethod")) || this.formElement.getAttribute("method") || "";
      return fetchMethodFromString(method.toLowerCase()) || FetchMethod.get;
    }
    get action() {
      var _a;
      const formElementAction = typeof this.formElement.action === "string" ? this.formElement.action : null;
      if ((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.hasAttribute("formaction")) {
        return this.submitter.getAttribute("formaction") || "";
      } else {
        return this.formElement.getAttribute("action") || formElementAction || "";
      }
    }
    get body() {
      if (this.enctype == FormEnctype.urlEncoded || this.method == FetchMethod.get) {
        return new URLSearchParams(this.stringFormData);
      } else {
        return this.formData;
      }
    }
    get enctype() {
      var _a;
      return formEnctypeFromString(((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("formenctype")) || this.formElement.enctype);
    }
    get isSafe() {
      return this.fetchRequest.isSafe;
    }
    get stringFormData() {
      return [...this.formData].reduce((entries, [name, value]) => {
        return entries.concat(typeof value == "string" ? [[name, value]] : []);
      }, []);
    }
    async start() {
      const { initialized, requesting } = FormSubmissionState;
      const confirmationMessage = getAttribute("data-turbo-confirm", this.submitter, this.formElement);
      if (typeof confirmationMessage === "string") {
        const answer = await FormSubmission.confirmMethod(confirmationMessage, this.formElement, this.submitter);
        if (!answer) {
          return;
        }
      }
      if (this.state == initialized) {
        this.state = requesting;
        return this.fetchRequest.perform();
      }
    }
    stop() {
      const { stopping, stopped } = FormSubmissionState;
      if (this.state != stopping && this.state != stopped) {
        this.state = stopping;
        this.fetchRequest.cancel();
        return true;
      }
    }
    prepareRequest(request) {
      if (!request.isSafe) {
        const token = getCookieValue(getMetaContent("csrf-param")) || getMetaContent("csrf-token");
        if (token) {
          request.headers["X-CSRF-Token"] = token;
        }
      }
      if (this.requestAcceptsTurboStreamResponse(request)) {
        request.acceptResponseType(StreamMessage.contentType);
      }
    }
    requestStarted(_request) {
      var _a;
      this.state = FormSubmissionState.waiting;
      (_a = this.submitter) === null || _a === void 0 ? void 0 : _a.setAttribute("disabled", "");
      this.setSubmitsWith();
      dispatch("turbo:submit-start", {
        target: this.formElement,
        detail: { formSubmission: this }
      });
      this.delegate.formSubmissionStarted(this);
    }
    requestPreventedHandlingResponse(request, response) {
      this.result = { success: response.succeeded, fetchResponse: response };
    }
    requestSucceededWithResponse(request, response) {
      if (response.clientError || response.serverError) {
        this.delegate.formSubmissionFailedWithResponse(this, response);
      } else if (this.requestMustRedirect(request) && responseSucceededWithoutRedirect(response)) {
        const error2 = new Error("Form responses must redirect to another location");
        this.delegate.formSubmissionErrored(this, error2);
      } else {
        this.state = FormSubmissionState.receiving;
        this.result = { success: true, fetchResponse: response };
        this.delegate.formSubmissionSucceededWithResponse(this, response);
      }
    }
    requestFailedWithResponse(request, response) {
      this.result = { success: false, fetchResponse: response };
      this.delegate.formSubmissionFailedWithResponse(this, response);
    }
    requestErrored(request, error2) {
      this.result = { success: false, error: error2 };
      this.delegate.formSubmissionErrored(this, error2);
    }
    requestFinished(_request) {
      var _a;
      this.state = FormSubmissionState.stopped;
      (_a = this.submitter) === null || _a === void 0 ? void 0 : _a.removeAttribute("disabled");
      this.resetSubmitterText();
      dispatch("turbo:submit-end", {
        target: this.formElement,
        detail: Object.assign({ formSubmission: this }, this.result)
      });
      this.delegate.formSubmissionFinished(this);
    }
    setSubmitsWith() {
      if (!this.submitter || !this.submitsWith)
        return;
      if (this.submitter.matches("button")) {
        this.originalSubmitText = this.submitter.innerHTML;
        this.submitter.innerHTML = this.submitsWith;
      } else if (this.submitter.matches("input")) {
        const input = this.submitter;
        this.originalSubmitText = input.value;
        input.value = this.submitsWith;
      }
    }
    resetSubmitterText() {
      if (!this.submitter || !this.originalSubmitText)
        return;
      if (this.submitter.matches("button")) {
        this.submitter.innerHTML = this.originalSubmitText;
      } else if (this.submitter.matches("input")) {
        const input = this.submitter;
        input.value = this.originalSubmitText;
      }
    }
    requestMustRedirect(request) {
      return !request.isSafe && this.mustRedirect;
    }
    requestAcceptsTurboStreamResponse(request) {
      return !request.isSafe || hasAttribute("data-turbo-stream", this.submitter, this.formElement);
    }
    get submitsWith() {
      var _a;
      return (_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("data-turbo-submits-with");
    }
  };
  function buildFormData(formElement, submitter) {
    const formData = new FormData(formElement);
    const name = submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("name");
    const value = submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("value");
    if (name) {
      formData.append(name, value || "");
    }
    return formData;
  }
  function getCookieValue(cookieName) {
    if (cookieName != null) {
      const cookies = document.cookie ? document.cookie.split("; ") : [];
      const cookie = cookies.find((cookie2) => cookie2.startsWith(cookieName));
      if (cookie) {
        const value = cookie.split("=").slice(1).join("=");
        return value ? decodeURIComponent(value) : void 0;
      }
    }
  }
  function responseSucceededWithoutRedirect(response) {
    return response.statusCode == 200 && !response.redirected;
  }
  function mergeFormDataEntries(url, entries) {
    const searchParams = new URLSearchParams();
    for (const [name, value] of entries) {
      if (value instanceof File)
        continue;
      searchParams.append(name, value);
    }
    url.search = searchParams.toString();
    return url;
  }
  var Snapshot = class {
    constructor(element) {
      this.element = element;
    }
    get activeElement() {
      return this.element.ownerDocument.activeElement;
    }
    get children() {
      return [...this.element.children];
    }
    hasAnchor(anchor) {
      return this.getElementForAnchor(anchor) != null;
    }
    getElementForAnchor(anchor) {
      return anchor ? this.element.querySelector(`[id='${anchor}'], a[name='${anchor}']`) : null;
    }
    get isConnected() {
      return this.element.isConnected;
    }
    get firstAutofocusableElement() {
      const inertDisabledOrHidden = "[inert], :disabled, [hidden], details:not([open]), dialog:not([open])";
      for (const element of this.element.querySelectorAll("[autofocus]")) {
        if (element.closest(inertDisabledOrHidden) == null)
          return element;
        else
          continue;
      }
      return null;
    }
    get permanentElements() {
      return queryPermanentElementsAll(this.element);
    }
    getPermanentElementById(id) {
      return getPermanentElementById(this.element, id);
    }
    getPermanentElementMapForSnapshot(snapshot) {
      const permanentElementMap = {};
      for (const currentPermanentElement of this.permanentElements) {
        const { id } = currentPermanentElement;
        const newPermanentElement = snapshot.getPermanentElementById(id);
        if (newPermanentElement) {
          permanentElementMap[id] = [currentPermanentElement, newPermanentElement];
        }
      }
      return permanentElementMap;
    }
  };
  function getPermanentElementById(node, id) {
    return node.querySelector(`#${id}[data-turbo-permanent]`);
  }
  function queryPermanentElementsAll(node) {
    return node.querySelectorAll("[id][data-turbo-permanent]");
  }
  var FormSubmitObserver = class {
    constructor(delegate, eventTarget) {
      this.started = false;
      this.submitCaptured = () => {
        this.eventTarget.removeEventListener("submit", this.submitBubbled, false);
        this.eventTarget.addEventListener("submit", this.submitBubbled, false);
      };
      this.submitBubbled = (event) => {
        if (!event.defaultPrevented) {
          const form = event.target instanceof HTMLFormElement ? event.target : void 0;
          const submitter = event.submitter || void 0;
          if (form && submissionDoesNotDismissDialog(form, submitter) && submissionDoesNotTargetIFrame(form, submitter) && this.delegate.willSubmitForm(form, submitter)) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.delegate.formSubmitted(form, submitter);
          }
        }
      };
      this.delegate = delegate;
      this.eventTarget = eventTarget;
    }
    start() {
      if (!this.started) {
        this.eventTarget.addEventListener("submit", this.submitCaptured, true);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        this.eventTarget.removeEventListener("submit", this.submitCaptured, true);
        this.started = false;
      }
    }
  };
  function submissionDoesNotDismissDialog(form, submitter) {
    const method = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formmethod")) || form.getAttribute("method");
    return method != "dialog";
  }
  function submissionDoesNotTargetIFrame(form, submitter) {
    if ((submitter === null || submitter === void 0 ? void 0 : submitter.hasAttribute("formtarget")) || form.hasAttribute("target")) {
      const target = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formtarget")) || form.target;
      for (const element of document.getElementsByName(target)) {
        if (element instanceof HTMLIFrameElement)
          return false;
      }
      return true;
    } else {
      return true;
    }
  }
  var View = class {
    constructor(delegate, element) {
      this.resolveRenderPromise = (_value) => {
      };
      this.resolveInterceptionPromise = (_value) => {
      };
      this.delegate = delegate;
      this.element = element;
    }
    scrollToAnchor(anchor) {
      const element = this.snapshot.getElementForAnchor(anchor);
      if (element) {
        this.scrollToElement(element);
        this.focusElement(element);
      } else {
        this.scrollToPosition({ x: 0, y: 0 });
      }
    }
    scrollToAnchorFromLocation(location2) {
      this.scrollToAnchor(getAnchor(location2));
    }
    scrollToElement(element) {
      element.scrollIntoView();
    }
    focusElement(element) {
      if (element instanceof HTMLElement) {
        if (element.hasAttribute("tabindex")) {
          element.focus();
        } else {
          element.setAttribute("tabindex", "-1");
          element.focus();
          element.removeAttribute("tabindex");
        }
      }
    }
    scrollToPosition({ x, y }) {
      this.scrollRoot.scrollTo(x, y);
    }
    scrollToTop() {
      this.scrollToPosition({ x: 0, y: 0 });
    }
    get scrollRoot() {
      return window;
    }
    async render(renderer) {
      const { isPreview, shouldRender, newSnapshot: snapshot } = renderer;
      if (shouldRender) {
        try {
          this.renderPromise = new Promise((resolve) => this.resolveRenderPromise = resolve);
          this.renderer = renderer;
          await this.prepareToRenderSnapshot(renderer);
          const renderInterception = new Promise((resolve) => this.resolveInterceptionPromise = resolve);
          const options = { resume: this.resolveInterceptionPromise, render: this.renderer.renderElement };
          const immediateRender = this.delegate.allowsImmediateRender(snapshot, options);
          if (!immediateRender)
            await renderInterception;
          await this.renderSnapshot(renderer);
          this.delegate.viewRenderedSnapshot(snapshot, isPreview);
          this.delegate.preloadOnLoadLinksForView(this.element);
          this.finishRenderingSnapshot(renderer);
        } finally {
          delete this.renderer;
          this.resolveRenderPromise(void 0);
          delete this.renderPromise;
        }
      } else {
        this.invalidate(renderer.reloadReason);
      }
    }
    invalidate(reason) {
      this.delegate.viewInvalidated(reason);
    }
    async prepareToRenderSnapshot(renderer) {
      this.markAsPreview(renderer.isPreview);
      await renderer.prepareToRender();
    }
    markAsPreview(isPreview) {
      if (isPreview) {
        this.element.setAttribute("data-turbo-preview", "");
      } else {
        this.element.removeAttribute("data-turbo-preview");
      }
    }
    async renderSnapshot(renderer) {
      await renderer.render();
    }
    finishRenderingSnapshot(renderer) {
      renderer.finishRendering();
    }
  };
  var FrameView = class extends View {
    missing() {
      this.element.innerHTML = `<strong class="turbo-frame-error">Content missing</strong>`;
    }
    get snapshot() {
      return new Snapshot(this.element);
    }
  };
  var LinkInterceptor = class {
    constructor(delegate, element) {
      this.clickBubbled = (event) => {
        if (this.respondsToEventTarget(event.target)) {
          this.clickEvent = event;
        } else {
          delete this.clickEvent;
        }
      };
      this.linkClicked = (event) => {
        if (this.clickEvent && this.respondsToEventTarget(event.target) && event.target instanceof Element) {
          if (this.delegate.shouldInterceptLinkClick(event.target, event.detail.url, event.detail.originalEvent)) {
            this.clickEvent.preventDefault();
            event.preventDefault();
            this.delegate.linkClickIntercepted(event.target, event.detail.url, event.detail.originalEvent);
          }
        }
        delete this.clickEvent;
      };
      this.willVisit = (_event) => {
        delete this.clickEvent;
      };
      this.delegate = delegate;
      this.element = element;
    }
    start() {
      this.element.addEventListener("click", this.clickBubbled);
      document.addEventListener("turbo:click", this.linkClicked);
      document.addEventListener("turbo:before-visit", this.willVisit);
    }
    stop() {
      this.element.removeEventListener("click", this.clickBubbled);
      document.removeEventListener("turbo:click", this.linkClicked);
      document.removeEventListener("turbo:before-visit", this.willVisit);
    }
    respondsToEventTarget(target) {
      const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
      return element && element.closest("turbo-frame, html") == this.element;
    }
  };
  var LinkClickObserver = class {
    constructor(delegate, eventTarget) {
      this.started = false;
      this.clickCaptured = () => {
        this.eventTarget.removeEventListener("click", this.clickBubbled, false);
        this.eventTarget.addEventListener("click", this.clickBubbled, false);
      };
      this.clickBubbled = (event) => {
        if (event instanceof MouseEvent && this.clickEventIsSignificant(event)) {
          const target = event.composedPath && event.composedPath()[0] || event.target;
          const link = this.findLinkFromClickTarget(target);
          if (link && doesNotTargetIFrame(link)) {
            const location2 = this.getLocationForLink(link);
            if (this.delegate.willFollowLinkToLocation(link, location2, event)) {
              event.preventDefault();
              this.delegate.followedLinkToLocation(link, location2);
            }
          }
        }
      };
      this.delegate = delegate;
      this.eventTarget = eventTarget;
    }
    start() {
      if (!this.started) {
        this.eventTarget.addEventListener("click", this.clickCaptured, true);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        this.eventTarget.removeEventListener("click", this.clickCaptured, true);
        this.started = false;
      }
    }
    clickEventIsSignificant(event) {
      return !(event.target && event.target.isContentEditable || event.defaultPrevented || event.which > 1 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
    }
    findLinkFromClickTarget(target) {
      return findClosestRecursively(target, "a[href]:not([target^=_]):not([download])");
    }
    getLocationForLink(link) {
      return expandURL(link.getAttribute("href") || "");
    }
  };
  function doesNotTargetIFrame(anchor) {
    if (anchor.hasAttribute("target")) {
      for (const element of document.getElementsByName(anchor.target)) {
        if (element instanceof HTMLIFrameElement)
          return false;
      }
      return true;
    } else {
      return true;
    }
  }
  var FormLinkClickObserver = class {
    constructor(delegate, element) {
      this.delegate = delegate;
      this.linkInterceptor = new LinkClickObserver(this, element);
    }
    start() {
      this.linkInterceptor.start();
    }
    stop() {
      this.linkInterceptor.stop();
    }
    willFollowLinkToLocation(link, location2, originalEvent) {
      return this.delegate.willSubmitFormLinkToLocation(link, location2, originalEvent) && link.hasAttribute("data-turbo-method");
    }
    followedLinkToLocation(link, location2) {
      const form = document.createElement("form");
      const type = "hidden";
      for (const [name, value] of location2.searchParams) {
        form.append(Object.assign(document.createElement("input"), { type, name, value }));
      }
      const action = Object.assign(location2, { search: "" });
      form.setAttribute("data-turbo", "true");
      form.setAttribute("action", action.href);
      form.setAttribute("hidden", "");
      const method = link.getAttribute("data-turbo-method");
      if (method)
        form.setAttribute("method", method);
      const turboFrame = link.getAttribute("data-turbo-frame");
      if (turboFrame)
        form.setAttribute("data-turbo-frame", turboFrame);
      const turboAction = getVisitAction(link);
      if (turboAction)
        form.setAttribute("data-turbo-action", turboAction);
      const turboConfirm = link.getAttribute("data-turbo-confirm");
      if (turboConfirm)
        form.setAttribute("data-turbo-confirm", turboConfirm);
      const turboStream = link.hasAttribute("data-turbo-stream");
      if (turboStream)
        form.setAttribute("data-turbo-stream", "");
      this.delegate.submittedFormLinkToLocation(link, location2, form);
      document.body.appendChild(form);
      form.addEventListener("turbo:submit-end", () => form.remove(), { once: true });
      requestAnimationFrame(() => form.requestSubmit());
    }
  };
  var Bardo = class {
    static async preservingPermanentElements(delegate, permanentElementMap, callback) {
      const bardo = new this(delegate, permanentElementMap);
      bardo.enter();
      await callback();
      bardo.leave();
    }
    constructor(delegate, permanentElementMap) {
      this.delegate = delegate;
      this.permanentElementMap = permanentElementMap;
    }
    enter() {
      for (const id in this.permanentElementMap) {
        const [currentPermanentElement, newPermanentElement] = this.permanentElementMap[id];
        this.delegate.enteringBardo(currentPermanentElement, newPermanentElement);
        this.replaceNewPermanentElementWithPlaceholder(newPermanentElement);
      }
    }
    leave() {
      for (const id in this.permanentElementMap) {
        const [currentPermanentElement] = this.permanentElementMap[id];
        this.replaceCurrentPermanentElementWithClone(currentPermanentElement);
        this.replacePlaceholderWithPermanentElement(currentPermanentElement);
        this.delegate.leavingBardo(currentPermanentElement);
      }
    }
    replaceNewPermanentElementWithPlaceholder(permanentElement) {
      const placeholder = createPlaceholderForPermanentElement(permanentElement);
      permanentElement.replaceWith(placeholder);
    }
    replaceCurrentPermanentElementWithClone(permanentElement) {
      const clone2 = permanentElement.cloneNode(true);
      permanentElement.replaceWith(clone2);
    }
    replacePlaceholderWithPermanentElement(permanentElement) {
      const placeholder = this.getPlaceholderById(permanentElement.id);
      placeholder === null || placeholder === void 0 ? void 0 : placeholder.replaceWith(permanentElement);
    }
    getPlaceholderById(id) {
      return this.placeholders.find((element) => element.content == id);
    }
    get placeholders() {
      return [...document.querySelectorAll("meta[name=turbo-permanent-placeholder][content]")];
    }
  };
  function createPlaceholderForPermanentElement(permanentElement) {
    const element = document.createElement("meta");
    element.setAttribute("name", "turbo-permanent-placeholder");
    element.setAttribute("content", permanentElement.id);
    return element;
  }
  var Renderer = class {
    constructor(currentSnapshot, newSnapshot, renderElement, isPreview, willRender = true) {
      this.activeElement = null;
      this.currentSnapshot = currentSnapshot;
      this.newSnapshot = newSnapshot;
      this.isPreview = isPreview;
      this.willRender = willRender;
      this.renderElement = renderElement;
      this.promise = new Promise((resolve, reject) => this.resolvingFunctions = { resolve, reject });
    }
    get shouldRender() {
      return true;
    }
    get reloadReason() {
      return;
    }
    prepareToRender() {
      return;
    }
    finishRendering() {
      if (this.resolvingFunctions) {
        this.resolvingFunctions.resolve();
        delete this.resolvingFunctions;
      }
    }
    async preservingPermanentElements(callback) {
      await Bardo.preservingPermanentElements(this, this.permanentElementMap, callback);
    }
    focusFirstAutofocusableElement() {
      const element = this.connectedSnapshot.firstAutofocusableElement;
      if (elementIsFocusable(element)) {
        element.focus();
      }
    }
    enteringBardo(currentPermanentElement) {
      if (this.activeElement)
        return;
      if (currentPermanentElement.contains(this.currentSnapshot.activeElement)) {
        this.activeElement = this.currentSnapshot.activeElement;
      }
    }
    leavingBardo(currentPermanentElement) {
      if (currentPermanentElement.contains(this.activeElement) && this.activeElement instanceof HTMLElement) {
        this.activeElement.focus();
        this.activeElement = null;
      }
    }
    get connectedSnapshot() {
      return this.newSnapshot.isConnected ? this.newSnapshot : this.currentSnapshot;
    }
    get currentElement() {
      return this.currentSnapshot.element;
    }
    get newElement() {
      return this.newSnapshot.element;
    }
    get permanentElementMap() {
      return this.currentSnapshot.getPermanentElementMapForSnapshot(this.newSnapshot);
    }
  };
  function elementIsFocusable(element) {
    return element && typeof element.focus == "function";
  }
  var FrameRenderer = class extends Renderer {
    static renderElement(currentElement, newElement) {
      var _a;
      const destinationRange = document.createRange();
      destinationRange.selectNodeContents(currentElement);
      destinationRange.deleteContents();
      const frameElement = newElement;
      const sourceRange = (_a = frameElement.ownerDocument) === null || _a === void 0 ? void 0 : _a.createRange();
      if (sourceRange) {
        sourceRange.selectNodeContents(frameElement);
        currentElement.appendChild(sourceRange.extractContents());
      }
    }
    constructor(delegate, currentSnapshot, newSnapshot, renderElement, isPreview, willRender = true) {
      super(currentSnapshot, newSnapshot, renderElement, isPreview, willRender);
      this.delegate = delegate;
    }
    get shouldRender() {
      return true;
    }
    async render() {
      await nextAnimationFrame();
      this.preservingPermanentElements(() => {
        this.loadFrameElement();
      });
      this.scrollFrameIntoView();
      await nextAnimationFrame();
      this.focusFirstAutofocusableElement();
      await nextAnimationFrame();
      this.activateScriptElements();
    }
    loadFrameElement() {
      this.delegate.willRenderFrame(this.currentElement, this.newElement);
      this.renderElement(this.currentElement, this.newElement);
    }
    scrollFrameIntoView() {
      if (this.currentElement.autoscroll || this.newElement.autoscroll) {
        const element = this.currentElement.firstElementChild;
        const block = readScrollLogicalPosition(this.currentElement.getAttribute("data-autoscroll-block"), "end");
        const behavior = readScrollBehavior(this.currentElement.getAttribute("data-autoscroll-behavior"), "auto");
        if (element) {
          element.scrollIntoView({ block, behavior });
          return true;
        }
      }
      return false;
    }
    activateScriptElements() {
      for (const inertScriptElement of this.newScriptElements) {
        const activatedScriptElement = activateScriptElement(inertScriptElement);
        inertScriptElement.replaceWith(activatedScriptElement);
      }
    }
    get newScriptElements() {
      return this.currentElement.querySelectorAll("script");
    }
  };
  function readScrollLogicalPosition(value, defaultValue) {
    if (value == "end" || value == "start" || value == "center" || value == "nearest") {
      return value;
    } else {
      return defaultValue;
    }
  }
  function readScrollBehavior(value, defaultValue) {
    if (value == "auto" || value == "smooth") {
      return value;
    } else {
      return defaultValue;
    }
  }
  var ProgressBar = class {
    static get defaultCSS() {
      return unindent`
      .turbo-progress-bar {
        position: fixed;
        display: block;
        top: 0;
        left: 0;
        height: 3px;
        background: #0076ff;
        z-index: 2147483647;
        transition:
          width ${ProgressBar.animationDuration}ms ease-out,
          opacity ${ProgressBar.animationDuration / 2}ms ${ProgressBar.animationDuration / 2}ms ease-in;
        transform: translate3d(0, 0, 0);
      }
    `;
    }
    constructor() {
      this.hiding = false;
      this.value = 0;
      this.visible = false;
      this.trickle = () => {
        this.setValue(this.value + Math.random() / 100);
      };
      this.stylesheetElement = this.createStylesheetElement();
      this.progressElement = this.createProgressElement();
      this.installStylesheetElement();
      this.setValue(0);
    }
    show() {
      if (!this.visible) {
        this.visible = true;
        this.installProgressElement();
        this.startTrickling();
      }
    }
    hide() {
      if (this.visible && !this.hiding) {
        this.hiding = true;
        this.fadeProgressElement(() => {
          this.uninstallProgressElement();
          this.stopTrickling();
          this.visible = false;
          this.hiding = false;
        });
      }
    }
    setValue(value) {
      this.value = value;
      this.refresh();
    }
    installStylesheetElement() {
      document.head.insertBefore(this.stylesheetElement, document.head.firstChild);
    }
    installProgressElement() {
      this.progressElement.style.width = "0";
      this.progressElement.style.opacity = "1";
      document.documentElement.insertBefore(this.progressElement, document.body);
      this.refresh();
    }
    fadeProgressElement(callback) {
      this.progressElement.style.opacity = "0";
      setTimeout(callback, ProgressBar.animationDuration * 1.5);
    }
    uninstallProgressElement() {
      if (this.progressElement.parentNode) {
        document.documentElement.removeChild(this.progressElement);
      }
    }
    startTrickling() {
      if (!this.trickleInterval) {
        this.trickleInterval = window.setInterval(this.trickle, ProgressBar.animationDuration);
      }
    }
    stopTrickling() {
      window.clearInterval(this.trickleInterval);
      delete this.trickleInterval;
    }
    refresh() {
      requestAnimationFrame(() => {
        this.progressElement.style.width = `${10 + this.value * 90}%`;
      });
    }
    createStylesheetElement() {
      const element = document.createElement("style");
      element.type = "text/css";
      element.textContent = ProgressBar.defaultCSS;
      if (this.cspNonce) {
        element.nonce = this.cspNonce;
      }
      return element;
    }
    createProgressElement() {
      const element = document.createElement("div");
      element.className = "turbo-progress-bar";
      return element;
    }
    get cspNonce() {
      return getMetaContent("csp-nonce");
    }
  };
  ProgressBar.animationDuration = 300;
  var HeadSnapshot = class extends Snapshot {
    constructor() {
      super(...arguments);
      this.detailsByOuterHTML = this.children.filter((element) => !elementIsNoscript(element)).map((element) => elementWithoutNonce(element)).reduce((result, element) => {
        const { outerHTML } = element;
        const details = outerHTML in result ? result[outerHTML] : {
          type: elementType(element),
          tracked: elementIsTracked(element),
          elements: []
        };
        return Object.assign(Object.assign({}, result), { [outerHTML]: Object.assign(Object.assign({}, details), { elements: [...details.elements, element] }) });
      }, {});
    }
    get trackedElementSignature() {
      return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => this.detailsByOuterHTML[outerHTML].tracked).join("");
    }
    getScriptElementsNotInSnapshot(snapshot) {
      return this.getElementsMatchingTypeNotInSnapshot("script", snapshot);
    }
    getStylesheetElementsNotInSnapshot(snapshot) {
      return this.getElementsMatchingTypeNotInSnapshot("stylesheet", snapshot);
    }
    getElementsMatchingTypeNotInSnapshot(matchedType, snapshot) {
      return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => !(outerHTML in snapshot.detailsByOuterHTML)).map((outerHTML) => this.detailsByOuterHTML[outerHTML]).filter(({ type }) => type == matchedType).map(({ elements: [element] }) => element);
    }
    get provisionalElements() {
      return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
        const { type, tracked, elements } = this.detailsByOuterHTML[outerHTML];
        if (type == null && !tracked) {
          return [...result, ...elements];
        } else if (elements.length > 1) {
          return [...result, ...elements.slice(1)];
        } else {
          return result;
        }
      }, []);
    }
    getMetaValue(name) {
      const element = this.findMetaElementByName(name);
      return element ? element.getAttribute("content") : null;
    }
    findMetaElementByName(name) {
      return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
        const { elements: [element] } = this.detailsByOuterHTML[outerHTML];
        return elementIsMetaElementWithName(element, name) ? element : result;
      }, void 0);
    }
  };
  function elementType(element) {
    if (elementIsScript(element)) {
      return "script";
    } else if (elementIsStylesheet(element)) {
      return "stylesheet";
    }
  }
  function elementIsTracked(element) {
    return element.getAttribute("data-turbo-track") == "reload";
  }
  function elementIsScript(element) {
    const tagName = element.localName;
    return tagName == "script";
  }
  function elementIsNoscript(element) {
    const tagName = element.localName;
    return tagName == "noscript";
  }
  function elementIsStylesheet(element) {
    const tagName = element.localName;
    return tagName == "style" || tagName == "link" && element.getAttribute("rel") == "stylesheet";
  }
  function elementIsMetaElementWithName(element, name) {
    const tagName = element.localName;
    return tagName == "meta" && element.getAttribute("name") == name;
  }
  function elementWithoutNonce(element) {
    if (element.hasAttribute("nonce")) {
      element.setAttribute("nonce", "");
    }
    return element;
  }
  var PageSnapshot = class extends Snapshot {
    static fromHTMLString(html = "") {
      return this.fromDocument(parseHTMLDocument(html));
    }
    static fromElement(element) {
      return this.fromDocument(element.ownerDocument);
    }
    static fromDocument({ head, body }) {
      return new this(body, new HeadSnapshot(head));
    }
    constructor(element, headSnapshot) {
      super(element);
      this.headSnapshot = headSnapshot;
    }
    clone() {
      const clonedElement = this.element.cloneNode(true);
      const selectElements = this.element.querySelectorAll("select");
      const clonedSelectElements = clonedElement.querySelectorAll("select");
      for (const [index2, source] of selectElements.entries()) {
        const clone2 = clonedSelectElements[index2];
        for (const option2 of clone2.selectedOptions)
          option2.selected = false;
        for (const option2 of source.selectedOptions)
          clone2.options[option2.index].selected = true;
      }
      for (const clonedPasswordInput of clonedElement.querySelectorAll('input[type="password"]')) {
        clonedPasswordInput.value = "";
      }
      return new PageSnapshot(clonedElement, this.headSnapshot);
    }
    get headElement() {
      return this.headSnapshot.element;
    }
    get rootLocation() {
      var _a;
      const root = (_a = this.getSetting("root")) !== null && _a !== void 0 ? _a : "/";
      return expandURL(root);
    }
    get cacheControlValue() {
      return this.getSetting("cache-control");
    }
    get isPreviewable() {
      return this.cacheControlValue != "no-preview";
    }
    get isCacheable() {
      return this.cacheControlValue != "no-cache";
    }
    get isVisitable() {
      return this.getSetting("visit-control") != "reload";
    }
    getSetting(name) {
      return this.headSnapshot.getMetaValue(`turbo-${name}`);
    }
  };
  var TimingMetric;
  (function(TimingMetric2) {
    TimingMetric2["visitStart"] = "visitStart";
    TimingMetric2["requestStart"] = "requestStart";
    TimingMetric2["requestEnd"] = "requestEnd";
    TimingMetric2["visitEnd"] = "visitEnd";
  })(TimingMetric || (TimingMetric = {}));
  var VisitState;
  (function(VisitState2) {
    VisitState2["initialized"] = "initialized";
    VisitState2["started"] = "started";
    VisitState2["canceled"] = "canceled";
    VisitState2["failed"] = "failed";
    VisitState2["completed"] = "completed";
  })(VisitState || (VisitState = {}));
  var defaultOptions = {
    action: "advance",
    historyChanged: false,
    visitCachedSnapshot: () => {
    },
    willRender: true,
    updateHistory: true,
    shouldCacheSnapshot: true,
    acceptsStreamResponse: false
  };
  var SystemStatusCode;
  (function(SystemStatusCode2) {
    SystemStatusCode2[SystemStatusCode2["networkFailure"] = 0] = "networkFailure";
    SystemStatusCode2[SystemStatusCode2["timeoutFailure"] = -1] = "timeoutFailure";
    SystemStatusCode2[SystemStatusCode2["contentTypeMismatch"] = -2] = "contentTypeMismatch";
  })(SystemStatusCode || (SystemStatusCode = {}));
  var Visit = class {
    constructor(delegate, location2, restorationIdentifier, options = {}) {
      this.identifier = uuid();
      this.timingMetrics = {};
      this.followedRedirect = false;
      this.historyChanged = false;
      this.scrolled = false;
      this.shouldCacheSnapshot = true;
      this.acceptsStreamResponse = false;
      this.snapshotCached = false;
      this.state = VisitState.initialized;
      this.delegate = delegate;
      this.location = location2;
      this.restorationIdentifier = restorationIdentifier || uuid();
      const { action, historyChanged, referrer, snapshot, snapshotHTML, response, visitCachedSnapshot, willRender, updateHistory, shouldCacheSnapshot, acceptsStreamResponse } = Object.assign(Object.assign({}, defaultOptions), options);
      this.action = action;
      this.historyChanged = historyChanged;
      this.referrer = referrer;
      this.snapshot = snapshot;
      this.snapshotHTML = snapshotHTML;
      this.response = response;
      this.isSamePage = this.delegate.locationWithActionIsSamePage(this.location, this.action);
      this.visitCachedSnapshot = visitCachedSnapshot;
      this.willRender = willRender;
      this.updateHistory = updateHistory;
      this.scrolled = !willRender;
      this.shouldCacheSnapshot = shouldCacheSnapshot;
      this.acceptsStreamResponse = acceptsStreamResponse;
    }
    get adapter() {
      return this.delegate.adapter;
    }
    get view() {
      return this.delegate.view;
    }
    get history() {
      return this.delegate.history;
    }
    get restorationData() {
      return this.history.getRestorationDataForIdentifier(this.restorationIdentifier);
    }
    get silent() {
      return this.isSamePage;
    }
    start() {
      if (this.state == VisitState.initialized) {
        this.recordTimingMetric(TimingMetric.visitStart);
        this.state = VisitState.started;
        this.adapter.visitStarted(this);
        this.delegate.visitStarted(this);
      }
    }
    cancel() {
      if (this.state == VisitState.started) {
        if (this.request) {
          this.request.cancel();
        }
        this.cancelRender();
        this.state = VisitState.canceled;
      }
    }
    complete() {
      if (this.state == VisitState.started) {
        this.recordTimingMetric(TimingMetric.visitEnd);
        this.state = VisitState.completed;
        this.followRedirect();
        if (!this.followedRedirect) {
          this.adapter.visitCompleted(this);
          this.delegate.visitCompleted(this);
        }
      }
    }
    fail() {
      if (this.state == VisitState.started) {
        this.state = VisitState.failed;
        this.adapter.visitFailed(this);
      }
    }
    changeHistory() {
      var _a;
      if (!this.historyChanged && this.updateHistory) {
        const actionForHistory = this.location.href === ((_a = this.referrer) === null || _a === void 0 ? void 0 : _a.href) ? "replace" : this.action;
        const method = getHistoryMethodForAction(actionForHistory);
        this.history.update(method, this.location, this.restorationIdentifier);
        this.historyChanged = true;
      }
    }
    issueRequest() {
      if (this.hasPreloadedResponse()) {
        this.simulateRequest();
      } else if (this.shouldIssueRequest() && !this.request) {
        this.request = new FetchRequest(this, FetchMethod.get, this.location);
        this.request.perform();
      }
    }
    simulateRequest() {
      if (this.response) {
        this.startRequest();
        this.recordResponse();
        this.finishRequest();
      }
    }
    startRequest() {
      this.recordTimingMetric(TimingMetric.requestStart);
      this.adapter.visitRequestStarted(this);
    }
    recordResponse(response = this.response) {
      this.response = response;
      if (response) {
        const { statusCode } = response;
        if (isSuccessful(statusCode)) {
          this.adapter.visitRequestCompleted(this);
        } else {
          this.adapter.visitRequestFailedWithStatusCode(this, statusCode);
        }
      }
    }
    finishRequest() {
      this.recordTimingMetric(TimingMetric.requestEnd);
      this.adapter.visitRequestFinished(this);
    }
    loadResponse() {
      if (this.response) {
        const { statusCode, responseHTML } = this.response;
        this.render(async () => {
          if (this.shouldCacheSnapshot)
            this.cacheSnapshot();
          if (this.view.renderPromise)
            await this.view.renderPromise;
          if (isSuccessful(statusCode) && responseHTML != null) {
            await this.view.renderPage(PageSnapshot.fromHTMLString(responseHTML), false, this.willRender, this);
            this.performScroll();
            this.adapter.visitRendered(this);
            this.complete();
          } else {
            await this.view.renderError(PageSnapshot.fromHTMLString(responseHTML), this);
            this.adapter.visitRendered(this);
            this.fail();
          }
        });
      }
    }
    getCachedSnapshot() {
      const snapshot = this.view.getCachedSnapshotForLocation(this.location) || this.getPreloadedSnapshot();
      if (snapshot && (!getAnchor(this.location) || snapshot.hasAnchor(getAnchor(this.location)))) {
        if (this.action == "restore" || snapshot.isPreviewable) {
          return snapshot;
        }
      }
    }
    getPreloadedSnapshot() {
      if (this.snapshotHTML) {
        return PageSnapshot.fromHTMLString(this.snapshotHTML);
      }
    }
    hasCachedSnapshot() {
      return this.getCachedSnapshot() != null;
    }
    loadCachedSnapshot() {
      const snapshot = this.getCachedSnapshot();
      if (snapshot) {
        const isPreview = this.shouldIssueRequest();
        this.render(async () => {
          this.cacheSnapshot();
          if (this.isSamePage) {
            this.adapter.visitRendered(this);
          } else {
            if (this.view.renderPromise)
              await this.view.renderPromise;
            await this.view.renderPage(snapshot, isPreview, this.willRender, this);
            this.performScroll();
            this.adapter.visitRendered(this);
            if (!isPreview) {
              this.complete();
            }
          }
        });
      }
    }
    followRedirect() {
      var _a;
      if (this.redirectedToLocation && !this.followedRedirect && ((_a = this.response) === null || _a === void 0 ? void 0 : _a.redirected)) {
        this.adapter.visitProposedToLocation(this.redirectedToLocation, {
          action: "replace",
          response: this.response,
          shouldCacheSnapshot: false,
          willRender: false
        });
        this.followedRedirect = true;
      }
    }
    goToSamePageAnchor() {
      if (this.isSamePage) {
        this.render(async () => {
          this.cacheSnapshot();
          this.performScroll();
          this.changeHistory();
          this.adapter.visitRendered(this);
        });
      }
    }
    prepareRequest(request) {
      if (this.acceptsStreamResponse) {
        request.acceptResponseType(StreamMessage.contentType);
      }
    }
    requestStarted() {
      this.startRequest();
    }
    requestPreventedHandlingResponse(_request, _response) {
    }
    async requestSucceededWithResponse(request, response) {
      const responseHTML = await response.responseHTML;
      const { redirected, statusCode } = response;
      if (responseHTML == void 0) {
        this.recordResponse({
          statusCode: SystemStatusCode.contentTypeMismatch,
          redirected
        });
      } else {
        this.redirectedToLocation = response.redirected ? response.location : void 0;
        this.recordResponse({ statusCode, responseHTML, redirected });
      }
    }
    async requestFailedWithResponse(request, response) {
      const responseHTML = await response.responseHTML;
      const { redirected, statusCode } = response;
      if (responseHTML == void 0) {
        this.recordResponse({
          statusCode: SystemStatusCode.contentTypeMismatch,
          redirected
        });
      } else {
        this.recordResponse({ statusCode, responseHTML, redirected });
      }
    }
    requestErrored(_request, _error) {
      this.recordResponse({
        statusCode: SystemStatusCode.networkFailure,
        redirected: false
      });
    }
    requestFinished() {
      this.finishRequest();
    }
    performScroll() {
      if (!this.scrolled && !this.view.forceReloaded) {
        if (this.action == "restore") {
          this.scrollToRestoredPosition() || this.scrollToAnchor() || this.view.scrollToTop();
        } else {
          this.scrollToAnchor() || this.view.scrollToTop();
        }
        if (this.isSamePage) {
          this.delegate.visitScrolledToSamePageLocation(this.view.lastRenderedLocation, this.location);
        }
        this.scrolled = true;
      }
    }
    scrollToRestoredPosition() {
      const { scrollPosition } = this.restorationData;
      if (scrollPosition) {
        this.view.scrollToPosition(scrollPosition);
        return true;
      }
    }
    scrollToAnchor() {
      const anchor = getAnchor(this.location);
      if (anchor != null) {
        this.view.scrollToAnchor(anchor);
        return true;
      }
    }
    recordTimingMetric(metric) {
      this.timingMetrics[metric] = (/* @__PURE__ */ new Date()).getTime();
    }
    getTimingMetrics() {
      return Object.assign({}, this.timingMetrics);
    }
    getHistoryMethodForAction(action) {
      switch (action) {
        case "replace":
          return history.replaceState;
        case "advance":
        case "restore":
          return history.pushState;
      }
    }
    hasPreloadedResponse() {
      return typeof this.response == "object";
    }
    shouldIssueRequest() {
      if (this.isSamePage) {
        return false;
      } else if (this.action == "restore") {
        return !this.hasCachedSnapshot();
      } else {
        return this.willRender;
      }
    }
    cacheSnapshot() {
      if (!this.snapshotCached) {
        this.view.cacheSnapshot(this.snapshot).then((snapshot) => snapshot && this.visitCachedSnapshot(snapshot));
        this.snapshotCached = true;
      }
    }
    async render(callback) {
      this.cancelRender();
      await new Promise((resolve) => {
        this.frame = requestAnimationFrame(() => resolve());
      });
      await callback();
      delete this.frame;
    }
    cancelRender() {
      if (this.frame) {
        cancelAnimationFrame(this.frame);
        delete this.frame;
      }
    }
  };
  function isSuccessful(statusCode) {
    return statusCode >= 200 && statusCode < 300;
  }
  var BrowserAdapter = class {
    constructor(session2) {
      this.progressBar = new ProgressBar();
      this.showProgressBar = () => {
        this.progressBar.show();
      };
      this.session = session2;
    }
    visitProposedToLocation(location2, options) {
      this.navigator.startVisit(location2, (options === null || options === void 0 ? void 0 : options.restorationIdentifier) || uuid(), options);
    }
    visitStarted(visit2) {
      this.location = visit2.location;
      visit2.loadCachedSnapshot();
      visit2.issueRequest();
      visit2.goToSamePageAnchor();
    }
    visitRequestStarted(visit2) {
      this.progressBar.setValue(0);
      if (visit2.hasCachedSnapshot() || visit2.action != "restore") {
        this.showVisitProgressBarAfterDelay();
      } else {
        this.showProgressBar();
      }
    }
    visitRequestCompleted(visit2) {
      visit2.loadResponse();
    }
    visitRequestFailedWithStatusCode(visit2, statusCode) {
      switch (statusCode) {
        case SystemStatusCode.networkFailure:
        case SystemStatusCode.timeoutFailure:
        case SystemStatusCode.contentTypeMismatch:
          return this.reload({
            reason: "request_failed",
            context: {
              statusCode
            }
          });
        default:
          return visit2.loadResponse();
      }
    }
    visitRequestFinished(_visit) {
      this.progressBar.setValue(1);
      this.hideVisitProgressBar();
    }
    visitCompleted(_visit) {
    }
    pageInvalidated(reason) {
      this.reload(reason);
    }
    visitFailed(_visit) {
    }
    visitRendered(_visit) {
    }
    formSubmissionStarted(_formSubmission) {
      this.progressBar.setValue(0);
      this.showFormProgressBarAfterDelay();
    }
    formSubmissionFinished(_formSubmission) {
      this.progressBar.setValue(1);
      this.hideFormProgressBar();
    }
    showVisitProgressBarAfterDelay() {
      this.visitProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
    }
    hideVisitProgressBar() {
      this.progressBar.hide();
      if (this.visitProgressBarTimeout != null) {
        window.clearTimeout(this.visitProgressBarTimeout);
        delete this.visitProgressBarTimeout;
      }
    }
    showFormProgressBarAfterDelay() {
      if (this.formProgressBarTimeout == null) {
        this.formProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
      }
    }
    hideFormProgressBar() {
      this.progressBar.hide();
      if (this.formProgressBarTimeout != null) {
        window.clearTimeout(this.formProgressBarTimeout);
        delete this.formProgressBarTimeout;
      }
    }
    reload(reason) {
      var _a;
      dispatch("turbo:reload", { detail: reason });
      window.location.href = ((_a = this.location) === null || _a === void 0 ? void 0 : _a.toString()) || window.location.href;
    }
    get navigator() {
      return this.session.navigator;
    }
  };
  var CacheObserver = class {
    constructor() {
      this.selector = "[data-turbo-temporary]";
      this.deprecatedSelector = "[data-turbo-cache=false]";
      this.started = false;
      this.removeTemporaryElements = (_event) => {
        for (const element of this.temporaryElements) {
          element.remove();
        }
      };
    }
    start() {
      if (!this.started) {
        this.started = true;
        addEventListener("turbo:before-cache", this.removeTemporaryElements, false);
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        removeEventListener("turbo:before-cache", this.removeTemporaryElements, false);
      }
    }
    get temporaryElements() {
      return [...document.querySelectorAll(this.selector), ...this.temporaryElementsWithDeprecation];
    }
    get temporaryElementsWithDeprecation() {
      const elements = document.querySelectorAll(this.deprecatedSelector);
      if (elements.length) {
        console.warn(`The ${this.deprecatedSelector} selector is deprecated and will be removed in a future version. Use ${this.selector} instead.`);
      }
      return [...elements];
    }
  };
  var FrameRedirector = class {
    constructor(session2, element) {
      this.session = session2;
      this.element = element;
      this.linkInterceptor = new LinkInterceptor(this, element);
      this.formSubmitObserver = new FormSubmitObserver(this, element);
    }
    start() {
      this.linkInterceptor.start();
      this.formSubmitObserver.start();
    }
    stop() {
      this.linkInterceptor.stop();
      this.formSubmitObserver.stop();
    }
    shouldInterceptLinkClick(element, _location, _event) {
      return this.shouldRedirect(element);
    }
    linkClickIntercepted(element, url, event) {
      const frame = this.findFrameElement(element);
      if (frame) {
        frame.delegate.linkClickIntercepted(element, url, event);
      }
    }
    willSubmitForm(element, submitter) {
      return element.closest("turbo-frame") == null && this.shouldSubmit(element, submitter) && this.shouldRedirect(element, submitter);
    }
    formSubmitted(element, submitter) {
      const frame = this.findFrameElement(element, submitter);
      if (frame) {
        frame.delegate.formSubmitted(element, submitter);
      }
    }
    shouldSubmit(form, submitter) {
      var _a;
      const action = getAction(form, submitter);
      const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
      const rootLocation = expandURL((_a = meta === null || meta === void 0 ? void 0 : meta.content) !== null && _a !== void 0 ? _a : "/");
      return this.shouldRedirect(form, submitter) && locationIsVisitable(action, rootLocation);
    }
    shouldRedirect(element, submitter) {
      const isNavigatable = element instanceof HTMLFormElement ? this.session.submissionIsNavigatable(element, submitter) : this.session.elementIsNavigatable(element);
      if (isNavigatable) {
        const frame = this.findFrameElement(element, submitter);
        return frame ? frame != element.closest("turbo-frame") : false;
      } else {
        return false;
      }
    }
    findFrameElement(element, submitter) {
      const id = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("data-turbo-frame")) || element.getAttribute("data-turbo-frame");
      if (id && id != "_top") {
        const frame = this.element.querySelector(`#${id}:not([disabled])`);
        if (frame instanceof FrameElement) {
          return frame;
        }
      }
    }
  };
  var History = class {
    constructor(delegate) {
      this.restorationIdentifier = uuid();
      this.restorationData = {};
      this.started = false;
      this.pageLoaded = false;
      this.onPopState = (event) => {
        if (this.shouldHandlePopState()) {
          const { turbo } = event.state || {};
          if (turbo) {
            this.location = new URL(window.location.href);
            const { restorationIdentifier } = turbo;
            this.restorationIdentifier = restorationIdentifier;
            this.delegate.historyPoppedToLocationWithRestorationIdentifier(this.location, restorationIdentifier);
          }
        }
      };
      this.onPageLoad = async (_event) => {
        await nextMicrotask();
        this.pageLoaded = true;
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        addEventListener("popstate", this.onPopState, false);
        addEventListener("load", this.onPageLoad, false);
        this.started = true;
        this.replace(new URL(window.location.href));
      }
    }
    stop() {
      if (this.started) {
        removeEventListener("popstate", this.onPopState, false);
        removeEventListener("load", this.onPageLoad, false);
        this.started = false;
      }
    }
    push(location2, restorationIdentifier) {
      this.update(history.pushState, location2, restorationIdentifier);
    }
    replace(location2, restorationIdentifier) {
      this.update(history.replaceState, location2, restorationIdentifier);
    }
    update(method, location2, restorationIdentifier = uuid()) {
      const state = { turbo: { restorationIdentifier } };
      method.call(history, state, "", location2.href);
      this.location = location2;
      this.restorationIdentifier = restorationIdentifier;
    }
    getRestorationDataForIdentifier(restorationIdentifier) {
      return this.restorationData[restorationIdentifier] || {};
    }
    updateRestorationData(additionalData) {
      const { restorationIdentifier } = this;
      const restorationData = this.restorationData[restorationIdentifier];
      this.restorationData[restorationIdentifier] = Object.assign(Object.assign({}, restorationData), additionalData);
    }
    assumeControlOfScrollRestoration() {
      var _a;
      if (!this.previousScrollRestoration) {
        this.previousScrollRestoration = (_a = history.scrollRestoration) !== null && _a !== void 0 ? _a : "auto";
        history.scrollRestoration = "manual";
      }
    }
    relinquishControlOfScrollRestoration() {
      if (this.previousScrollRestoration) {
        history.scrollRestoration = this.previousScrollRestoration;
        delete this.previousScrollRestoration;
      }
    }
    shouldHandlePopState() {
      return this.pageIsLoaded();
    }
    pageIsLoaded() {
      return this.pageLoaded || document.readyState == "complete";
    }
  };
  var Navigator = class {
    constructor(delegate) {
      this.delegate = delegate;
    }
    proposeVisit(location2, options = {}) {
      if (this.delegate.allowsVisitingLocationWithAction(location2, options.action)) {
        if (locationIsVisitable(location2, this.view.snapshot.rootLocation)) {
          this.delegate.visitProposedToLocation(location2, options);
        } else {
          window.location.href = location2.toString();
        }
      }
    }
    startVisit(locatable, restorationIdentifier, options = {}) {
      this.stop();
      this.currentVisit = new Visit(this, expandURL(locatable), restorationIdentifier, Object.assign({ referrer: this.location }, options));
      this.currentVisit.start();
    }
    submitForm(form, submitter) {
      this.stop();
      this.formSubmission = new FormSubmission(this, form, submitter, true);
      this.formSubmission.start();
    }
    stop() {
      if (this.formSubmission) {
        this.formSubmission.stop();
        delete this.formSubmission;
      }
      if (this.currentVisit) {
        this.currentVisit.cancel();
        delete this.currentVisit;
      }
    }
    get adapter() {
      return this.delegate.adapter;
    }
    get view() {
      return this.delegate.view;
    }
    get history() {
      return this.delegate.history;
    }
    formSubmissionStarted(formSubmission) {
      if (typeof this.adapter.formSubmissionStarted === "function") {
        this.adapter.formSubmissionStarted(formSubmission);
      }
    }
    async formSubmissionSucceededWithResponse(formSubmission, fetchResponse) {
      if (formSubmission == this.formSubmission) {
        const responseHTML = await fetchResponse.responseHTML;
        if (responseHTML) {
          const shouldCacheSnapshot = formSubmission.isSafe;
          if (!shouldCacheSnapshot) {
            this.view.clearSnapshotCache();
          }
          const { statusCode, redirected } = fetchResponse;
          const action = this.getActionForFormSubmission(formSubmission);
          const visitOptions = {
            action,
            shouldCacheSnapshot,
            response: { statusCode, responseHTML, redirected }
          };
          this.proposeVisit(fetchResponse.location, visitOptions);
        }
      }
    }
    async formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
      const responseHTML = await fetchResponse.responseHTML;
      if (responseHTML) {
        const snapshot = PageSnapshot.fromHTMLString(responseHTML);
        if (fetchResponse.serverError) {
          await this.view.renderError(snapshot, this.currentVisit);
        } else {
          await this.view.renderPage(snapshot, false, true, this.currentVisit);
        }
        this.view.scrollToTop();
        this.view.clearSnapshotCache();
      }
    }
    formSubmissionErrored(formSubmission, error2) {
      console.error(error2);
    }
    formSubmissionFinished(formSubmission) {
      if (typeof this.adapter.formSubmissionFinished === "function") {
        this.adapter.formSubmissionFinished(formSubmission);
      }
    }
    visitStarted(visit2) {
      this.delegate.visitStarted(visit2);
    }
    visitCompleted(visit2) {
      this.delegate.visitCompleted(visit2);
    }
    locationWithActionIsSamePage(location2, action) {
      const anchor = getAnchor(location2);
      const currentAnchor = getAnchor(this.view.lastRenderedLocation);
      const isRestorationToTop = action === "restore" && typeof anchor === "undefined";
      return action !== "replace" && getRequestURL(location2) === getRequestURL(this.view.lastRenderedLocation) && (isRestorationToTop || anchor != null && anchor !== currentAnchor);
    }
    visitScrolledToSamePageLocation(oldURL, newURL) {
      this.delegate.visitScrolledToSamePageLocation(oldURL, newURL);
    }
    get location() {
      return this.history.location;
    }
    get restorationIdentifier() {
      return this.history.restorationIdentifier;
    }
    getActionForFormSubmission({ submitter, formElement }) {
      return getVisitAction(submitter, formElement) || "advance";
    }
  };
  var PageStage;
  (function(PageStage2) {
    PageStage2[PageStage2["initial"] = 0] = "initial";
    PageStage2[PageStage2["loading"] = 1] = "loading";
    PageStage2[PageStage2["interactive"] = 2] = "interactive";
    PageStage2[PageStage2["complete"] = 3] = "complete";
  })(PageStage || (PageStage = {}));
  var PageObserver = class {
    constructor(delegate) {
      this.stage = PageStage.initial;
      this.started = false;
      this.interpretReadyState = () => {
        const { readyState } = this;
        if (readyState == "interactive") {
          this.pageIsInteractive();
        } else if (readyState == "complete") {
          this.pageIsComplete();
        }
      };
      this.pageWillUnload = () => {
        this.delegate.pageWillUnload();
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        if (this.stage == PageStage.initial) {
          this.stage = PageStage.loading;
        }
        document.addEventListener("readystatechange", this.interpretReadyState, false);
        addEventListener("pagehide", this.pageWillUnload, false);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        document.removeEventListener("readystatechange", this.interpretReadyState, false);
        removeEventListener("pagehide", this.pageWillUnload, false);
        this.started = false;
      }
    }
    pageIsInteractive() {
      if (this.stage == PageStage.loading) {
        this.stage = PageStage.interactive;
        this.delegate.pageBecameInteractive();
      }
    }
    pageIsComplete() {
      this.pageIsInteractive();
      if (this.stage == PageStage.interactive) {
        this.stage = PageStage.complete;
        this.delegate.pageLoaded();
      }
    }
    get readyState() {
      return document.readyState;
    }
  };
  var ScrollObserver = class {
    constructor(delegate) {
      this.started = false;
      this.onScroll = () => {
        this.updatePosition({ x: window.pageXOffset, y: window.pageYOffset });
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        addEventListener("scroll", this.onScroll, false);
        this.onScroll();
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        removeEventListener("scroll", this.onScroll, false);
        this.started = false;
      }
    }
    updatePosition(position) {
      this.delegate.scrollPositionChanged(position);
    }
  };
  var StreamMessageRenderer = class {
    render({ fragment }) {
      Bardo.preservingPermanentElements(this, getPermanentElementMapForFragment(fragment), () => document.documentElement.appendChild(fragment));
    }
    enteringBardo(currentPermanentElement, newPermanentElement) {
      newPermanentElement.replaceWith(currentPermanentElement.cloneNode(true));
    }
    leavingBardo() {
    }
  };
  function getPermanentElementMapForFragment(fragment) {
    const permanentElementsInDocument = queryPermanentElementsAll(document.documentElement);
    const permanentElementMap = {};
    for (const permanentElementInDocument of permanentElementsInDocument) {
      const { id } = permanentElementInDocument;
      for (const streamElement of fragment.querySelectorAll("turbo-stream")) {
        const elementInStream = getPermanentElementById(streamElement.templateElement.content, id);
        if (elementInStream) {
          permanentElementMap[id] = [permanentElementInDocument, elementInStream];
        }
      }
    }
    return permanentElementMap;
  }
  var StreamObserver = class {
    constructor(delegate) {
      this.sources = /* @__PURE__ */ new Set();
      this.started = false;
      this.inspectFetchResponse = (event) => {
        const response = fetchResponseFromEvent(event);
        if (response && fetchResponseIsStream(response)) {
          event.preventDefault();
          this.receiveMessageResponse(response);
        }
      };
      this.receiveMessageEvent = (event) => {
        if (this.started && typeof event.data == "string") {
          this.receiveMessageHTML(event.data);
        }
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        this.started = true;
        addEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        removeEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
      }
    }
    connectStreamSource(source) {
      if (!this.streamSourceIsConnected(source)) {
        this.sources.add(source);
        source.addEventListener("message", this.receiveMessageEvent, false);
      }
    }
    disconnectStreamSource(source) {
      if (this.streamSourceIsConnected(source)) {
        this.sources.delete(source);
        source.removeEventListener("message", this.receiveMessageEvent, false);
      }
    }
    streamSourceIsConnected(source) {
      return this.sources.has(source);
    }
    async receiveMessageResponse(response) {
      const html = await response.responseHTML;
      if (html) {
        this.receiveMessageHTML(html);
      }
    }
    receiveMessageHTML(html) {
      this.delegate.receivedMessageFromStream(StreamMessage.wrap(html));
    }
  };
  function fetchResponseFromEvent(event) {
    var _a;
    const fetchResponse = (_a = event.detail) === null || _a === void 0 ? void 0 : _a.fetchResponse;
    if (fetchResponse instanceof FetchResponse) {
      return fetchResponse;
    }
  }
  function fetchResponseIsStream(response) {
    var _a;
    const contentType = (_a = response.contentType) !== null && _a !== void 0 ? _a : "";
    return contentType.startsWith(StreamMessage.contentType);
  }
  var ErrorRenderer = class extends Renderer {
    static renderElement(currentElement, newElement) {
      const { documentElement, body } = document;
      documentElement.replaceChild(newElement, body);
    }
    async render() {
      this.replaceHeadAndBody();
      this.activateScriptElements();
    }
    replaceHeadAndBody() {
      const { documentElement, head } = document;
      documentElement.replaceChild(this.newHead, head);
      this.renderElement(this.currentElement, this.newElement);
    }
    activateScriptElements() {
      for (const replaceableElement of this.scriptElements) {
        const parentNode = replaceableElement.parentNode;
        if (parentNode) {
          const element = activateScriptElement(replaceableElement);
          parentNode.replaceChild(element, replaceableElement);
        }
      }
    }
    get newHead() {
      return this.newSnapshot.headSnapshot.element;
    }
    get scriptElements() {
      return document.documentElement.querySelectorAll("script");
    }
  };
  var PageRenderer = class extends Renderer {
    static renderElement(currentElement, newElement) {
      if (document.body && newElement instanceof HTMLBodyElement) {
        document.body.replaceWith(newElement);
      } else {
        document.documentElement.appendChild(newElement);
      }
    }
    get shouldRender() {
      return this.newSnapshot.isVisitable && this.trackedElementsAreIdentical;
    }
    get reloadReason() {
      if (!this.newSnapshot.isVisitable) {
        return {
          reason: "turbo_visit_control_is_reload"
        };
      }
      if (!this.trackedElementsAreIdentical) {
        return {
          reason: "tracked_element_mismatch"
        };
      }
    }
    async prepareToRender() {
      await this.mergeHead();
    }
    async render() {
      if (this.willRender) {
        await this.replaceBody();
      }
    }
    finishRendering() {
      super.finishRendering();
      if (!this.isPreview) {
        this.focusFirstAutofocusableElement();
      }
    }
    get currentHeadSnapshot() {
      return this.currentSnapshot.headSnapshot;
    }
    get newHeadSnapshot() {
      return this.newSnapshot.headSnapshot;
    }
    get newElement() {
      return this.newSnapshot.element;
    }
    async mergeHead() {
      const mergedHeadElements = this.mergeProvisionalElements();
      const newStylesheetElements = this.copyNewHeadStylesheetElements();
      this.copyNewHeadScriptElements();
      await mergedHeadElements;
      await newStylesheetElements;
    }
    async replaceBody() {
      await this.preservingPermanentElements(async () => {
        this.activateNewBody();
        await this.assignNewBody();
      });
    }
    get trackedElementsAreIdentical() {
      return this.currentHeadSnapshot.trackedElementSignature == this.newHeadSnapshot.trackedElementSignature;
    }
    async copyNewHeadStylesheetElements() {
      const loadingElements = [];
      for (const element of this.newHeadStylesheetElements) {
        loadingElements.push(waitForLoad(element));
        document.head.appendChild(element);
      }
      await Promise.all(loadingElements);
    }
    copyNewHeadScriptElements() {
      for (const element of this.newHeadScriptElements) {
        document.head.appendChild(activateScriptElement(element));
      }
    }
    async mergeProvisionalElements() {
      const newHeadElements = [...this.newHeadProvisionalElements];
      for (const element of this.currentHeadProvisionalElements) {
        if (!this.isCurrentElementInElementList(element, newHeadElements)) {
          document.head.removeChild(element);
        }
      }
      for (const element of newHeadElements) {
        document.head.appendChild(element);
      }
    }
    isCurrentElementInElementList(element, elementList) {
      for (const [index2, newElement] of elementList.entries()) {
        if (element.tagName == "TITLE") {
          if (newElement.tagName != "TITLE") {
            continue;
          }
          if (element.innerHTML == newElement.innerHTML) {
            elementList.splice(index2, 1);
            return true;
          }
        }
        if (newElement.isEqualNode(element)) {
          elementList.splice(index2, 1);
          return true;
        }
      }
      return false;
    }
    removeCurrentHeadProvisionalElements() {
      for (const element of this.currentHeadProvisionalElements) {
        document.head.removeChild(element);
      }
    }
    copyNewHeadProvisionalElements() {
      for (const element of this.newHeadProvisionalElements) {
        document.head.appendChild(element);
      }
    }
    activateNewBody() {
      document.adoptNode(this.newElement);
      this.activateNewBodyScriptElements();
    }
    activateNewBodyScriptElements() {
      for (const inertScriptElement of this.newBodyScriptElements) {
        const activatedScriptElement = activateScriptElement(inertScriptElement);
        inertScriptElement.replaceWith(activatedScriptElement);
      }
    }
    async assignNewBody() {
      await this.renderElement(this.currentElement, this.newElement);
    }
    get newHeadStylesheetElements() {
      return this.newHeadSnapshot.getStylesheetElementsNotInSnapshot(this.currentHeadSnapshot);
    }
    get newHeadScriptElements() {
      return this.newHeadSnapshot.getScriptElementsNotInSnapshot(this.currentHeadSnapshot);
    }
    get currentHeadProvisionalElements() {
      return this.currentHeadSnapshot.provisionalElements;
    }
    get newHeadProvisionalElements() {
      return this.newHeadSnapshot.provisionalElements;
    }
    get newBodyScriptElements() {
      return this.newElement.querySelectorAll("script");
    }
  };
  var SnapshotCache = class {
    constructor(size) {
      this.keys = [];
      this.snapshots = {};
      this.size = size;
    }
    has(location2) {
      return toCacheKey(location2) in this.snapshots;
    }
    get(location2) {
      if (this.has(location2)) {
        const snapshot = this.read(location2);
        this.touch(location2);
        return snapshot;
      }
    }
    put(location2, snapshot) {
      this.write(location2, snapshot);
      this.touch(location2);
      return snapshot;
    }
    clear() {
      this.snapshots = {};
    }
    read(location2) {
      return this.snapshots[toCacheKey(location2)];
    }
    write(location2, snapshot) {
      this.snapshots[toCacheKey(location2)] = snapshot;
    }
    touch(location2) {
      const key = toCacheKey(location2);
      const index2 = this.keys.indexOf(key);
      if (index2 > -1)
        this.keys.splice(index2, 1);
      this.keys.unshift(key);
      this.trim();
    }
    trim() {
      for (const key of this.keys.splice(this.size)) {
        delete this.snapshots[key];
      }
    }
  };
  var PageView = class extends View {
    constructor() {
      super(...arguments);
      this.snapshotCache = new SnapshotCache(10);
      this.lastRenderedLocation = new URL(location.href);
      this.forceReloaded = false;
    }
    renderPage(snapshot, isPreview = false, willRender = true, visit2) {
      const renderer = new PageRenderer(this.snapshot, snapshot, PageRenderer.renderElement, isPreview, willRender);
      if (!renderer.shouldRender) {
        this.forceReloaded = true;
      } else {
        visit2 === null || visit2 === void 0 ? void 0 : visit2.changeHistory();
      }
      return this.render(renderer);
    }
    renderError(snapshot, visit2) {
      visit2 === null || visit2 === void 0 ? void 0 : visit2.changeHistory();
      const renderer = new ErrorRenderer(this.snapshot, snapshot, ErrorRenderer.renderElement, false);
      return this.render(renderer);
    }
    clearSnapshotCache() {
      this.snapshotCache.clear();
    }
    async cacheSnapshot(snapshot = this.snapshot) {
      if (snapshot.isCacheable) {
        this.delegate.viewWillCacheSnapshot();
        const { lastRenderedLocation: location2 } = this;
        await nextEventLoopTick();
        const cachedSnapshot = snapshot.clone();
        this.snapshotCache.put(location2, cachedSnapshot);
        return cachedSnapshot;
      }
    }
    getCachedSnapshotForLocation(location2) {
      return this.snapshotCache.get(location2);
    }
    get snapshot() {
      return PageSnapshot.fromElement(this.element);
    }
  };
  var Preloader = class {
    constructor(delegate) {
      this.selector = "a[data-turbo-preload]";
      this.delegate = delegate;
    }
    get snapshotCache() {
      return this.delegate.navigator.view.snapshotCache;
    }
    start() {
      if (document.readyState === "loading") {
        return document.addEventListener("DOMContentLoaded", () => {
          this.preloadOnLoadLinksForView(document.body);
        });
      } else {
        this.preloadOnLoadLinksForView(document.body);
      }
    }
    preloadOnLoadLinksForView(element) {
      for (const link of element.querySelectorAll(this.selector)) {
        this.preloadURL(link);
      }
    }
    async preloadURL(link) {
      const location2 = new URL(link.href);
      if (this.snapshotCache.has(location2)) {
        return;
      }
      try {
        const response = await fetch(location2.toString(), { headers: { "VND.PREFETCH": "true", Accept: "text/html" } });
        const responseText = await response.text();
        const snapshot = PageSnapshot.fromHTMLString(responseText);
        this.snapshotCache.put(location2, snapshot);
      } catch (_) {
      }
    }
  };
  var Session = class {
    constructor() {
      this.navigator = new Navigator(this);
      this.history = new History(this);
      this.preloader = new Preloader(this);
      this.view = new PageView(this, document.documentElement);
      this.adapter = new BrowserAdapter(this);
      this.pageObserver = new PageObserver(this);
      this.cacheObserver = new CacheObserver();
      this.linkClickObserver = new LinkClickObserver(this, window);
      this.formSubmitObserver = new FormSubmitObserver(this, document);
      this.scrollObserver = new ScrollObserver(this);
      this.streamObserver = new StreamObserver(this);
      this.formLinkClickObserver = new FormLinkClickObserver(this, document.documentElement);
      this.frameRedirector = new FrameRedirector(this, document.documentElement);
      this.streamMessageRenderer = new StreamMessageRenderer();
      this.drive = true;
      this.enabled = true;
      this.progressBarDelay = 500;
      this.started = false;
      this.formMode = "on";
    }
    start() {
      if (!this.started) {
        this.pageObserver.start();
        this.cacheObserver.start();
        this.formLinkClickObserver.start();
        this.linkClickObserver.start();
        this.formSubmitObserver.start();
        this.scrollObserver.start();
        this.streamObserver.start();
        this.frameRedirector.start();
        this.history.start();
        this.preloader.start();
        this.started = true;
        this.enabled = true;
      }
    }
    disable() {
      this.enabled = false;
    }
    stop() {
      if (this.started) {
        this.pageObserver.stop();
        this.cacheObserver.stop();
        this.formLinkClickObserver.stop();
        this.linkClickObserver.stop();
        this.formSubmitObserver.stop();
        this.scrollObserver.stop();
        this.streamObserver.stop();
        this.frameRedirector.stop();
        this.history.stop();
        this.started = false;
      }
    }
    registerAdapter(adapter) {
      this.adapter = adapter;
    }
    visit(location2, options = {}) {
      const frameElement = options.frame ? document.getElementById(options.frame) : null;
      if (frameElement instanceof FrameElement) {
        frameElement.src = location2.toString();
        frameElement.loaded;
      } else {
        this.navigator.proposeVisit(expandURL(location2), options);
      }
    }
    connectStreamSource(source) {
      this.streamObserver.connectStreamSource(source);
    }
    disconnectStreamSource(source) {
      this.streamObserver.disconnectStreamSource(source);
    }
    renderStreamMessage(message) {
      this.streamMessageRenderer.render(StreamMessage.wrap(message));
    }
    clearCache() {
      this.view.clearSnapshotCache();
    }
    setProgressBarDelay(delay) {
      this.progressBarDelay = delay;
    }
    setFormMode(mode) {
      this.formMode = mode;
    }
    get location() {
      return this.history.location;
    }
    get restorationIdentifier() {
      return this.history.restorationIdentifier;
    }
    historyPoppedToLocationWithRestorationIdentifier(location2, restorationIdentifier) {
      if (this.enabled) {
        this.navigator.startVisit(location2, restorationIdentifier, {
          action: "restore",
          historyChanged: true
        });
      } else {
        this.adapter.pageInvalidated({
          reason: "turbo_disabled"
        });
      }
    }
    scrollPositionChanged(position) {
      this.history.updateRestorationData({ scrollPosition: position });
    }
    willSubmitFormLinkToLocation(link, location2) {
      return this.elementIsNavigatable(link) && locationIsVisitable(location2, this.snapshot.rootLocation);
    }
    submittedFormLinkToLocation() {
    }
    willFollowLinkToLocation(link, location2, event) {
      return this.elementIsNavigatable(link) && locationIsVisitable(location2, this.snapshot.rootLocation) && this.applicationAllowsFollowingLinkToLocation(link, location2, event);
    }
    followedLinkToLocation(link, location2) {
      const action = this.getActionForLink(link);
      const acceptsStreamResponse = link.hasAttribute("data-turbo-stream");
      this.visit(location2.href, { action, acceptsStreamResponse });
    }
    allowsVisitingLocationWithAction(location2, action) {
      return this.locationWithActionIsSamePage(location2, action) || this.applicationAllowsVisitingLocation(location2);
    }
    visitProposedToLocation(location2, options) {
      extendURLWithDeprecatedProperties(location2);
      this.adapter.visitProposedToLocation(location2, options);
    }
    visitStarted(visit2) {
      if (!visit2.acceptsStreamResponse) {
        markAsBusy(document.documentElement);
      }
      extendURLWithDeprecatedProperties(visit2.location);
      if (!visit2.silent) {
        this.notifyApplicationAfterVisitingLocation(visit2.location, visit2.action);
      }
    }
    visitCompleted(visit2) {
      clearBusyState(document.documentElement);
      this.notifyApplicationAfterPageLoad(visit2.getTimingMetrics());
    }
    locationWithActionIsSamePage(location2, action) {
      return this.navigator.locationWithActionIsSamePage(location2, action);
    }
    visitScrolledToSamePageLocation(oldURL, newURL) {
      this.notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL);
    }
    willSubmitForm(form, submitter) {
      const action = getAction(form, submitter);
      return this.submissionIsNavigatable(form, submitter) && locationIsVisitable(expandURL(action), this.snapshot.rootLocation);
    }
    formSubmitted(form, submitter) {
      this.navigator.submitForm(form, submitter);
    }
    pageBecameInteractive() {
      this.view.lastRenderedLocation = this.location;
      this.notifyApplicationAfterPageLoad();
    }
    pageLoaded() {
      this.history.assumeControlOfScrollRestoration();
    }
    pageWillUnload() {
      this.history.relinquishControlOfScrollRestoration();
    }
    receivedMessageFromStream(message) {
      this.renderStreamMessage(message);
    }
    viewWillCacheSnapshot() {
      var _a;
      if (!((_a = this.navigator.currentVisit) === null || _a === void 0 ? void 0 : _a.silent)) {
        this.notifyApplicationBeforeCachingSnapshot();
      }
    }
    allowsImmediateRender({ element }, options) {
      const event = this.notifyApplicationBeforeRender(element, options);
      const { defaultPrevented, detail: { render } } = event;
      if (this.view.renderer && render) {
        this.view.renderer.renderElement = render;
      }
      return !defaultPrevented;
    }
    viewRenderedSnapshot(_snapshot, _isPreview) {
      this.view.lastRenderedLocation = this.history.location;
      this.notifyApplicationAfterRender();
    }
    preloadOnLoadLinksForView(element) {
      this.preloader.preloadOnLoadLinksForView(element);
    }
    viewInvalidated(reason) {
      this.adapter.pageInvalidated(reason);
    }
    frameLoaded(frame) {
      this.notifyApplicationAfterFrameLoad(frame);
    }
    frameRendered(fetchResponse, frame) {
      this.notifyApplicationAfterFrameRender(fetchResponse, frame);
    }
    applicationAllowsFollowingLinkToLocation(link, location2, ev) {
      const event = this.notifyApplicationAfterClickingLinkToLocation(link, location2, ev);
      return !event.defaultPrevented;
    }
    applicationAllowsVisitingLocation(location2) {
      const event = this.notifyApplicationBeforeVisitingLocation(location2);
      return !event.defaultPrevented;
    }
    notifyApplicationAfterClickingLinkToLocation(link, location2, event) {
      return dispatch("turbo:click", {
        target: link,
        detail: { url: location2.href, originalEvent: event },
        cancelable: true
      });
    }
    notifyApplicationBeforeVisitingLocation(location2) {
      return dispatch("turbo:before-visit", {
        detail: { url: location2.href },
        cancelable: true
      });
    }
    notifyApplicationAfterVisitingLocation(location2, action) {
      return dispatch("turbo:visit", { detail: { url: location2.href, action } });
    }
    notifyApplicationBeforeCachingSnapshot() {
      return dispatch("turbo:before-cache");
    }
    notifyApplicationBeforeRender(newBody, options) {
      return dispatch("turbo:before-render", {
        detail: Object.assign({ newBody }, options),
        cancelable: true
      });
    }
    notifyApplicationAfterRender() {
      return dispatch("turbo:render");
    }
    notifyApplicationAfterPageLoad(timing = {}) {
      return dispatch("turbo:load", {
        detail: { url: this.location.href, timing }
      });
    }
    notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL) {
      dispatchEvent(new HashChangeEvent("hashchange", {
        oldURL: oldURL.toString(),
        newURL: newURL.toString()
      }));
    }
    notifyApplicationAfterFrameLoad(frame) {
      return dispatch("turbo:frame-load", { target: frame });
    }
    notifyApplicationAfterFrameRender(fetchResponse, frame) {
      return dispatch("turbo:frame-render", {
        detail: { fetchResponse },
        target: frame,
        cancelable: true
      });
    }
    submissionIsNavigatable(form, submitter) {
      if (this.formMode == "off") {
        return false;
      } else {
        const submitterIsNavigatable = submitter ? this.elementIsNavigatable(submitter) : true;
        if (this.formMode == "optin") {
          return submitterIsNavigatable && form.closest('[data-turbo="true"]') != null;
        } else {
          return submitterIsNavigatable && this.elementIsNavigatable(form);
        }
      }
    }
    elementIsNavigatable(element) {
      const container = findClosestRecursively(element, "[data-turbo]");
      const withinFrame = findClosestRecursively(element, "turbo-frame");
      if (this.drive || withinFrame) {
        if (container) {
          return container.getAttribute("data-turbo") != "false";
        } else {
          return true;
        }
      } else {
        if (container) {
          return container.getAttribute("data-turbo") == "true";
        } else {
          return false;
        }
      }
    }
    getActionForLink(link) {
      return getVisitAction(link) || "advance";
    }
    get snapshot() {
      return this.view.snapshot;
    }
  };
  function extendURLWithDeprecatedProperties(url) {
    Object.defineProperties(url, deprecatedLocationPropertyDescriptors);
  }
  var deprecatedLocationPropertyDescriptors = {
    absoluteURL: {
      get() {
        return this.toString();
      }
    }
  };
  var Cache = class {
    constructor(session2) {
      this.session = session2;
    }
    clear() {
      this.session.clearCache();
    }
    resetCacheControl() {
      this.setCacheControl("");
    }
    exemptPageFromCache() {
      this.setCacheControl("no-cache");
    }
    exemptPageFromPreview() {
      this.setCacheControl("no-preview");
    }
    setCacheControl(value) {
      setMetaContent("turbo-cache-control", value);
    }
  };
  var StreamActions = {
    after() {
      this.targetElements.forEach((e) => {
        var _a;
        return (_a = e.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(this.templateContent, e.nextSibling);
      });
    },
    append() {
      this.removeDuplicateTargetChildren();
      this.targetElements.forEach((e) => e.append(this.templateContent));
    },
    before() {
      this.targetElements.forEach((e) => {
        var _a;
        return (_a = e.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(this.templateContent, e);
      });
    },
    prepend() {
      this.removeDuplicateTargetChildren();
      this.targetElements.forEach((e) => e.prepend(this.templateContent));
    },
    remove() {
      this.targetElements.forEach((e) => e.remove());
    },
    replace() {
      this.targetElements.forEach((e) => e.replaceWith(this.templateContent));
    },
    update() {
      this.targetElements.forEach((targetElement) => {
        targetElement.innerHTML = "";
        targetElement.append(this.templateContent);
      });
    }
  };
  var session = new Session();
  var cache = new Cache(session);
  var { navigator: navigator$1 } = session;
  function start() {
    session.start();
  }
  function registerAdapter(adapter) {
    session.registerAdapter(adapter);
  }
  function visit(location2, options) {
    session.visit(location2, options);
  }
  function connectStreamSource(source) {
    session.connectStreamSource(source);
  }
  function disconnectStreamSource(source) {
    session.disconnectStreamSource(source);
  }
  function renderStreamMessage(message) {
    session.renderStreamMessage(message);
  }
  function clearCache() {
    console.warn("Please replace `Turbo.clearCache()` with `Turbo.cache.clear()`. The top-level function is deprecated and will be removed in a future version of Turbo.`");
    session.clearCache();
  }
  function setProgressBarDelay(delay) {
    session.setProgressBarDelay(delay);
  }
  function setConfirmMethod(confirmMethod) {
    FormSubmission.confirmMethod = confirmMethod;
  }
  function setFormMode(mode) {
    session.setFormMode(mode);
  }
  var Turbo = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    navigator: navigator$1,
    session,
    cache,
    PageRenderer,
    PageSnapshot,
    FrameRenderer,
    start,
    registerAdapter,
    visit,
    connectStreamSource,
    disconnectStreamSource,
    renderStreamMessage,
    clearCache,
    setProgressBarDelay,
    setConfirmMethod,
    setFormMode,
    StreamActions
  });
  var TurboFrameMissingError = class extends Error {
  };
  var FrameController = class {
    constructor(element) {
      this.fetchResponseLoaded = (_fetchResponse) => {
      };
      this.currentFetchRequest = null;
      this.resolveVisitPromise = () => {
      };
      this.connected = false;
      this.hasBeenLoaded = false;
      this.ignoredAttributes = /* @__PURE__ */ new Set();
      this.action = null;
      this.visitCachedSnapshot = ({ element: element2 }) => {
        const frame = element2.querySelector("#" + this.element.id);
        if (frame && this.previousFrameElement) {
          frame.replaceChildren(...this.previousFrameElement.children);
        }
        delete this.previousFrameElement;
      };
      this.element = element;
      this.view = new FrameView(this, this.element);
      this.appearanceObserver = new AppearanceObserver(this, this.element);
      this.formLinkClickObserver = new FormLinkClickObserver(this, this.element);
      this.linkInterceptor = new LinkInterceptor(this, this.element);
      this.restorationIdentifier = uuid();
      this.formSubmitObserver = new FormSubmitObserver(this, this.element);
    }
    connect() {
      if (!this.connected) {
        this.connected = true;
        if (this.loadingStyle == FrameLoadingStyle.lazy) {
          this.appearanceObserver.start();
        } else {
          this.loadSourceURL();
        }
        this.formLinkClickObserver.start();
        this.linkInterceptor.start();
        this.formSubmitObserver.start();
      }
    }
    disconnect() {
      if (this.connected) {
        this.connected = false;
        this.appearanceObserver.stop();
        this.formLinkClickObserver.stop();
        this.linkInterceptor.stop();
        this.formSubmitObserver.stop();
      }
    }
    disabledChanged() {
      if (this.loadingStyle == FrameLoadingStyle.eager) {
        this.loadSourceURL();
      }
    }
    sourceURLChanged() {
      if (this.isIgnoringChangesTo("src"))
        return;
      if (this.element.isConnected) {
        this.complete = false;
      }
      if (this.loadingStyle == FrameLoadingStyle.eager || this.hasBeenLoaded) {
        this.loadSourceURL();
      }
    }
    sourceURLReloaded() {
      const { src } = this.element;
      this.ignoringChangesToAttribute("complete", () => {
        this.element.removeAttribute("complete");
      });
      this.element.src = null;
      this.element.src = src;
      return this.element.loaded;
    }
    completeChanged() {
      if (this.isIgnoringChangesTo("complete"))
        return;
      this.loadSourceURL();
    }
    loadingStyleChanged() {
      if (this.loadingStyle == FrameLoadingStyle.lazy) {
        this.appearanceObserver.start();
      } else {
        this.appearanceObserver.stop();
        this.loadSourceURL();
      }
    }
    async loadSourceURL() {
      if (this.enabled && this.isActive && !this.complete && this.sourceURL) {
        this.element.loaded = this.visit(expandURL(this.sourceURL));
        this.appearanceObserver.stop();
        await this.element.loaded;
        this.hasBeenLoaded = true;
      }
    }
    async loadResponse(fetchResponse) {
      if (fetchResponse.redirected || fetchResponse.succeeded && fetchResponse.isHTML) {
        this.sourceURL = fetchResponse.response.url;
      }
      try {
        const html = await fetchResponse.responseHTML;
        if (html) {
          const document2 = parseHTMLDocument(html);
          const pageSnapshot = PageSnapshot.fromDocument(document2);
          if (pageSnapshot.isVisitable) {
            await this.loadFrameResponse(fetchResponse, document2);
          } else {
            await this.handleUnvisitableFrameResponse(fetchResponse);
          }
        }
      } finally {
        this.fetchResponseLoaded = () => {
        };
      }
    }
    elementAppearedInViewport(element) {
      this.proposeVisitIfNavigatedWithAction(element, element);
      this.loadSourceURL();
    }
    willSubmitFormLinkToLocation(link) {
      return this.shouldInterceptNavigation(link);
    }
    submittedFormLinkToLocation(link, _location, form) {
      const frame = this.findFrameElement(link);
      if (frame)
        form.setAttribute("data-turbo-frame", frame.id);
    }
    shouldInterceptLinkClick(element, _location, _event) {
      return this.shouldInterceptNavigation(element);
    }
    linkClickIntercepted(element, location2) {
      this.navigateFrame(element, location2);
    }
    willSubmitForm(element, submitter) {
      return element.closest("turbo-frame") == this.element && this.shouldInterceptNavigation(element, submitter);
    }
    formSubmitted(element, submitter) {
      if (this.formSubmission) {
        this.formSubmission.stop();
      }
      this.formSubmission = new FormSubmission(this, element, submitter);
      const { fetchRequest } = this.formSubmission;
      this.prepareRequest(fetchRequest);
      this.formSubmission.start();
    }
    prepareRequest(request) {
      var _a;
      request.headers["Turbo-Frame"] = this.id;
      if ((_a = this.currentNavigationElement) === null || _a === void 0 ? void 0 : _a.hasAttribute("data-turbo-stream")) {
        request.acceptResponseType(StreamMessage.contentType);
      }
    }
    requestStarted(_request) {
      markAsBusy(this.element);
    }
    requestPreventedHandlingResponse(_request, _response) {
      this.resolveVisitPromise();
    }
    async requestSucceededWithResponse(request, response) {
      await this.loadResponse(response);
      this.resolveVisitPromise();
    }
    async requestFailedWithResponse(request, response) {
      await this.loadResponse(response);
      this.resolveVisitPromise();
    }
    requestErrored(request, error2) {
      console.error(error2);
      this.resolveVisitPromise();
    }
    requestFinished(_request) {
      clearBusyState(this.element);
    }
    formSubmissionStarted({ formElement }) {
      markAsBusy(formElement, this.findFrameElement(formElement));
    }
    formSubmissionSucceededWithResponse(formSubmission, response) {
      const frame = this.findFrameElement(formSubmission.formElement, formSubmission.submitter);
      frame.delegate.proposeVisitIfNavigatedWithAction(frame, formSubmission.formElement, formSubmission.submitter);
      frame.delegate.loadResponse(response);
      if (!formSubmission.isSafe) {
        session.clearCache();
      }
    }
    formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
      this.element.delegate.loadResponse(fetchResponse);
      session.clearCache();
    }
    formSubmissionErrored(formSubmission, error2) {
      console.error(error2);
    }
    formSubmissionFinished({ formElement }) {
      clearBusyState(formElement, this.findFrameElement(formElement));
    }
    allowsImmediateRender({ element: newFrame }, options) {
      const event = dispatch("turbo:before-frame-render", {
        target: this.element,
        detail: Object.assign({ newFrame }, options),
        cancelable: true
      });
      const { defaultPrevented, detail: { render } } = event;
      if (this.view.renderer && render) {
        this.view.renderer.renderElement = render;
      }
      return !defaultPrevented;
    }
    viewRenderedSnapshot(_snapshot, _isPreview) {
    }
    preloadOnLoadLinksForView(element) {
      session.preloadOnLoadLinksForView(element);
    }
    viewInvalidated() {
    }
    willRenderFrame(currentElement, _newElement) {
      this.previousFrameElement = currentElement.cloneNode(true);
    }
    async loadFrameResponse(fetchResponse, document2) {
      const newFrameElement = await this.extractForeignFrameElement(document2.body);
      if (newFrameElement) {
        const snapshot = new Snapshot(newFrameElement);
        const renderer = new FrameRenderer(this, this.view.snapshot, snapshot, FrameRenderer.renderElement, false, false);
        if (this.view.renderPromise)
          await this.view.renderPromise;
        this.changeHistory();
        await this.view.render(renderer);
        this.complete = true;
        session.frameRendered(fetchResponse, this.element);
        session.frameLoaded(this.element);
        this.fetchResponseLoaded(fetchResponse);
      } else if (this.willHandleFrameMissingFromResponse(fetchResponse)) {
        this.handleFrameMissingFromResponse(fetchResponse);
      }
    }
    async visit(url) {
      var _a;
      const request = new FetchRequest(this, FetchMethod.get, url, new URLSearchParams(), this.element);
      (_a = this.currentFetchRequest) === null || _a === void 0 ? void 0 : _a.cancel();
      this.currentFetchRequest = request;
      return new Promise((resolve) => {
        this.resolveVisitPromise = () => {
          this.resolveVisitPromise = () => {
          };
          this.currentFetchRequest = null;
          resolve();
        };
        request.perform();
      });
    }
    navigateFrame(element, url, submitter) {
      const frame = this.findFrameElement(element, submitter);
      frame.delegate.proposeVisitIfNavigatedWithAction(frame, element, submitter);
      this.withCurrentNavigationElement(element, () => {
        frame.src = url;
      });
    }
    proposeVisitIfNavigatedWithAction(frame, element, submitter) {
      this.action = getVisitAction(submitter, element, frame);
      if (this.action) {
        const pageSnapshot = PageSnapshot.fromElement(frame).clone();
        const { visitCachedSnapshot } = frame.delegate;
        frame.delegate.fetchResponseLoaded = (fetchResponse) => {
          if (frame.src) {
            const { statusCode, redirected } = fetchResponse;
            const responseHTML = frame.ownerDocument.documentElement.outerHTML;
            const response = { statusCode, redirected, responseHTML };
            const options = {
              response,
              visitCachedSnapshot,
              willRender: false,
              updateHistory: false,
              restorationIdentifier: this.restorationIdentifier,
              snapshot: pageSnapshot
            };
            if (this.action)
              options.action = this.action;
            session.visit(frame.src, options);
          }
        };
      }
    }
    changeHistory() {
      if (this.action) {
        const method = getHistoryMethodForAction(this.action);
        session.history.update(method, expandURL(this.element.src || ""), this.restorationIdentifier);
      }
    }
    async handleUnvisitableFrameResponse(fetchResponse) {
      console.warn(`The response (${fetchResponse.statusCode}) from <turbo-frame id="${this.element.id}"> is performing a full page visit due to turbo-visit-control.`);
      await this.visitResponse(fetchResponse.response);
    }
    willHandleFrameMissingFromResponse(fetchResponse) {
      this.element.setAttribute("complete", "");
      const response = fetchResponse.response;
      const visit2 = async (url, options = {}) => {
        if (url instanceof Response) {
          this.visitResponse(url);
        } else {
          session.visit(url, options);
        }
      };
      const event = dispatch("turbo:frame-missing", {
        target: this.element,
        detail: { response, visit: visit2 },
        cancelable: true
      });
      return !event.defaultPrevented;
    }
    handleFrameMissingFromResponse(fetchResponse) {
      this.view.missing();
      this.throwFrameMissingError(fetchResponse);
    }
    throwFrameMissingError(fetchResponse) {
      const message = `The response (${fetchResponse.statusCode}) did not contain the expected <turbo-frame id="${this.element.id}"> and will be ignored. To perform a full page visit instead, set turbo-visit-control to reload.`;
      throw new TurboFrameMissingError(message);
    }
    async visitResponse(response) {
      const wrapped = new FetchResponse(response);
      const responseHTML = await wrapped.responseHTML;
      const { location: location2, redirected, statusCode } = wrapped;
      return session.visit(location2, { response: { redirected, statusCode, responseHTML } });
    }
    findFrameElement(element, submitter) {
      var _a;
      const id = getAttribute("data-turbo-frame", submitter, element) || this.element.getAttribute("target");
      return (_a = getFrameElementById(id)) !== null && _a !== void 0 ? _a : this.element;
    }
    async extractForeignFrameElement(container) {
      let element;
      const id = CSS.escape(this.id);
      try {
        element = activateElement(container.querySelector(`turbo-frame#${id}`), this.sourceURL);
        if (element) {
          return element;
        }
        element = activateElement(container.querySelector(`turbo-frame[src][recurse~=${id}]`), this.sourceURL);
        if (element) {
          await element.loaded;
          return await this.extractForeignFrameElement(element);
        }
      } catch (error2) {
        console.error(error2);
        return new FrameElement();
      }
      return null;
    }
    formActionIsVisitable(form, submitter) {
      const action = getAction(form, submitter);
      return locationIsVisitable(expandURL(action), this.rootLocation);
    }
    shouldInterceptNavigation(element, submitter) {
      const id = getAttribute("data-turbo-frame", submitter, element) || this.element.getAttribute("target");
      if (element instanceof HTMLFormElement && !this.formActionIsVisitable(element, submitter)) {
        return false;
      }
      if (!this.enabled || id == "_top") {
        return false;
      }
      if (id) {
        const frameElement = getFrameElementById(id);
        if (frameElement) {
          return !frameElement.disabled;
        }
      }
      if (!session.elementIsNavigatable(element)) {
        return false;
      }
      if (submitter && !session.elementIsNavigatable(submitter)) {
        return false;
      }
      return true;
    }
    get id() {
      return this.element.id;
    }
    get enabled() {
      return !this.element.disabled;
    }
    get sourceURL() {
      if (this.element.src) {
        return this.element.src;
      }
    }
    set sourceURL(sourceURL) {
      this.ignoringChangesToAttribute("src", () => {
        this.element.src = sourceURL !== null && sourceURL !== void 0 ? sourceURL : null;
      });
    }
    get loadingStyle() {
      return this.element.loading;
    }
    get isLoading() {
      return this.formSubmission !== void 0 || this.resolveVisitPromise() !== void 0;
    }
    get complete() {
      return this.element.hasAttribute("complete");
    }
    set complete(value) {
      this.ignoringChangesToAttribute("complete", () => {
        if (value) {
          this.element.setAttribute("complete", "");
        } else {
          this.element.removeAttribute("complete");
        }
      });
    }
    get isActive() {
      return this.element.isActive && this.connected;
    }
    get rootLocation() {
      var _a;
      const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
      const root = (_a = meta === null || meta === void 0 ? void 0 : meta.content) !== null && _a !== void 0 ? _a : "/";
      return expandURL(root);
    }
    isIgnoringChangesTo(attributeName) {
      return this.ignoredAttributes.has(attributeName);
    }
    ignoringChangesToAttribute(attributeName, callback) {
      this.ignoredAttributes.add(attributeName);
      callback();
      this.ignoredAttributes.delete(attributeName);
    }
    withCurrentNavigationElement(element, callback) {
      this.currentNavigationElement = element;
      callback();
      delete this.currentNavigationElement;
    }
  };
  function getFrameElementById(id) {
    if (id != null) {
      const element = document.getElementById(id);
      if (element instanceof FrameElement) {
        return element;
      }
    }
  }
  function activateElement(element, currentURL) {
    if (element) {
      const src = element.getAttribute("src");
      if (src != null && currentURL != null && urlsAreEqual(src, currentURL)) {
        throw new Error(`Matching <turbo-frame id="${element.id}"> element has a source URL which references itself`);
      }
      if (element.ownerDocument !== document) {
        element = document.importNode(element, true);
      }
      if (element instanceof FrameElement) {
        element.connectedCallback();
        element.disconnectedCallback();
        return element;
      }
    }
  }
  var StreamElement = class extends HTMLElement {
    static async renderElement(newElement) {
      await newElement.performAction();
    }
    async connectedCallback() {
      try {
        await this.render();
      } catch (error2) {
        console.error(error2);
      } finally {
        this.disconnect();
      }
    }
    async render() {
      var _a;
      return (_a = this.renderPromise) !== null && _a !== void 0 ? _a : this.renderPromise = (async () => {
        const event = this.beforeRenderEvent;
        if (this.dispatchEvent(event)) {
          await nextAnimationFrame();
          await event.detail.render(this);
        }
      })();
    }
    disconnect() {
      try {
        this.remove();
      } catch (_a) {
      }
    }
    removeDuplicateTargetChildren() {
      this.duplicateChildren.forEach((c) => c.remove());
    }
    get duplicateChildren() {
      var _a;
      const existingChildren = this.targetElements.flatMap((e) => [...e.children]).filter((c) => !!c.id);
      const newChildrenIds = [...((_a = this.templateContent) === null || _a === void 0 ? void 0 : _a.children) || []].filter((c) => !!c.id).map((c) => c.id);
      return existingChildren.filter((c) => newChildrenIds.includes(c.id));
    }
    get performAction() {
      if (this.action) {
        const actionFunction = StreamActions[this.action];
        if (actionFunction) {
          return actionFunction;
        }
        this.raise("unknown action");
      }
      this.raise("action attribute is missing");
    }
    get targetElements() {
      if (this.target) {
        return this.targetElementsById;
      } else if (this.targets) {
        return this.targetElementsByQuery;
      } else {
        this.raise("target or targets attribute is missing");
      }
    }
    get templateContent() {
      return this.templateElement.content.cloneNode(true);
    }
    get templateElement() {
      if (this.firstElementChild === null) {
        const template = this.ownerDocument.createElement("template");
        this.appendChild(template);
        return template;
      } else if (this.firstElementChild instanceof HTMLTemplateElement) {
        return this.firstElementChild;
      }
      this.raise("first child element must be a <template> element");
    }
    get action() {
      return this.getAttribute("action");
    }
    get target() {
      return this.getAttribute("target");
    }
    get targets() {
      return this.getAttribute("targets");
    }
    raise(message) {
      throw new Error(`${this.description}: ${message}`);
    }
    get description() {
      var _a, _b;
      return (_b = ((_a = this.outerHTML.match(/<[^>]+>/)) !== null && _a !== void 0 ? _a : [])[0]) !== null && _b !== void 0 ? _b : "<turbo-stream>";
    }
    get beforeRenderEvent() {
      return new CustomEvent("turbo:before-stream-render", {
        bubbles: true,
        cancelable: true,
        detail: { newStream: this, render: StreamElement.renderElement }
      });
    }
    get targetElementsById() {
      var _a;
      const element = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.getElementById(this.target);
      if (element !== null) {
        return [element];
      } else {
        return [];
      }
    }
    get targetElementsByQuery() {
      var _a;
      const elements = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.querySelectorAll(this.targets);
      if (elements.length !== 0) {
        return Array.prototype.slice.call(elements);
      } else {
        return [];
      }
    }
  };
  var StreamSourceElement = class extends HTMLElement {
    constructor() {
      super(...arguments);
      this.streamSource = null;
    }
    connectedCallback() {
      this.streamSource = this.src.match(/^ws{1,2}:/) ? new WebSocket(this.src) : new EventSource(this.src);
      connectStreamSource(this.streamSource);
    }
    disconnectedCallback() {
      if (this.streamSource) {
        disconnectStreamSource(this.streamSource);
      }
    }
    get src() {
      return this.getAttribute("src") || "";
    }
  };
  FrameElement.delegateConstructor = FrameController;
  if (customElements.get("turbo-frame") === void 0) {
    customElements.define("turbo-frame", FrameElement);
  }
  if (customElements.get("turbo-stream") === void 0) {
    customElements.define("turbo-stream", StreamElement);
  }
  if (customElements.get("turbo-stream-source") === void 0) {
    customElements.define("turbo-stream-source", StreamSourceElement);
  }
  (() => {
    let element = document.currentScript;
    if (!element)
      return;
    if (element.hasAttribute("data-turbo-suppress-warning"))
      return;
    element = element.parentElement;
    while (element) {
      if (element == document.body) {
        return console.warn(unindent`
        You are loading Turbo from a <script> element inside the <body> element. This is probably not what you meant to do!

        Load your application’s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.

        For more information, see: https://turbo.hotwired.dev/handbook/building#working-with-script-elements

        ——
        Suppress this warning by adding a "data-turbo-suppress-warning" attribute to: %s
      `, element.outerHTML);
      }
      element = element.parentElement;
    }
  })();
  window.Turbo = Turbo;
  start();

  // ../../../../node_modules/@hotwired/turbo-rails/app/javascript/turbo/cable.js
  var consumer;
  async function getConsumer() {
    return consumer || setConsumer(createConsumer2().then(setConsumer));
  }
  function setConsumer(newConsumer) {
    return consumer = newConsumer;
  }
  async function createConsumer2() {
    const { createConsumer: createConsumer3 } = await Promise.resolve().then(() => (init_src(), src_exports));
    return createConsumer3();
  }
  async function subscribeTo(channel, mixin) {
    const { subscriptions } = await getConsumer();
    return subscriptions.create(channel, mixin);
  }

  // ../../../../node_modules/@hotwired/turbo-rails/app/javascript/turbo/snakeize.js
  function walk(obj) {
    if (!obj || typeof obj !== "object")
      return obj;
    if (obj instanceof Date || obj instanceof RegExp)
      return obj;
    if (Array.isArray(obj))
      return obj.map(walk);
    return Object.keys(obj).reduce(function(acc, key) {
      var camel = key[0].toLowerCase() + key.slice(1).replace(/([A-Z]+)/g, function(m, x) {
        return "_" + x.toLowerCase();
      });
      acc[camel] = walk(obj[key]);
      return acc;
    }, {});
  }

  // ../../../../node_modules/@hotwired/turbo-rails/app/javascript/turbo/cable_stream_source_element.js
  var TurboCableStreamSourceElement = class extends HTMLElement {
    async connectedCallback() {
      connectStreamSource(this);
      this.subscription = await subscribeTo(this.channel, {
        received: this.dispatchMessageEvent.bind(this),
        connected: this.subscriptionConnected.bind(this),
        disconnected: this.subscriptionDisconnected.bind(this)
      });
    }
    disconnectedCallback() {
      disconnectStreamSource(this);
      if (this.subscription)
        this.subscription.unsubscribe();
    }
    dispatchMessageEvent(data) {
      const event = new MessageEvent("message", { data });
      return this.dispatchEvent(event);
    }
    subscriptionConnected() {
      this.setAttribute("connected", "");
    }
    subscriptionDisconnected() {
      this.removeAttribute("connected");
    }
    get channel() {
      const channel = this.getAttribute("channel");
      const signed_stream_name = this.getAttribute("signed-stream-name");
      return { channel, signed_stream_name, ...walk({ ...this.dataset }) };
    }
  };
  if (customElements.get("turbo-cable-stream-source") === void 0) {
    customElements.define("turbo-cable-stream-source", TurboCableStreamSourceElement);
  }

  // ../../../../node_modules/@hotwired/turbo-rails/app/javascript/turbo/fetch_requests.js
  function encodeMethodIntoRequestBody(event) {
    if (event.target instanceof HTMLFormElement) {
      const { target: form, detail: { fetchOptions } } = event;
      form.addEventListener("turbo:submit-start", ({ detail: { formSubmission: { submitter } } }) => {
        const body = isBodyInit(fetchOptions.body) ? fetchOptions.body : new URLSearchParams();
        const method = determineFetchMethod(submitter, body, form);
        if (!/get/i.test(method)) {
          if (/post/i.test(method)) {
            body.delete("_method");
          } else {
            body.set("_method", method);
          }
          fetchOptions.method = "post";
        }
      }, { once: true });
    }
  }
  function determineFetchMethod(submitter, body, form) {
    const formMethod = determineFormMethod(submitter);
    const overrideMethod = body.get("_method");
    const method = form.getAttribute("method") || "get";
    if (typeof formMethod == "string") {
      return formMethod;
    } else if (typeof overrideMethod == "string") {
      return overrideMethod;
    } else {
      return method;
    }
  }
  function determineFormMethod(submitter) {
    if (submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement) {
      if (submitter.hasAttribute("formmethod")) {
        return submitter.formMethod;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
  function isBodyInit(body) {
    return body instanceof FormData || body instanceof URLSearchParams;
  }

  // ../../../../node_modules/@hotwired/turbo-rails/app/javascript/turbo/index.js
  addEventListener("turbo:before-fetch-request", encodeMethodIntoRequestBody);

  // libraries/trix@1.3.1.esm.js
  var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
  function createCommonjsModule(fn, basedir, module3) {
    return module3 = {
      path: basedir,
      exports: {},
      require: function(path, base) {
        return commonjsRequire(path, base === void 0 || base === null ? module3.path : base);
      }
    }, fn(module3, module3.exports), module3.exports;
  }
  function commonjsRequire() {
    throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
  }
  var trix = createCommonjsModule(function(module3) {
    (function() {
    }).call(commonjsGlobal), function() {
      var t;
      window.Set == null && (window.Set = t = function() {
        function t2() {
          this.clear();
        }
        return t2.prototype.clear = function() {
          return this.values = [];
        }, t2.prototype.has = function(t3) {
          return this.values.indexOf(t3) !== -1;
        }, t2.prototype.add = function(t3) {
          return this.has(t3) || this.values.push(t3), this;
        }, t2.prototype["delete"] = function(t3) {
          var e;
          return (e = this.values.indexOf(t3)) === -1 ? false : (this.values.splice(e, 1), true);
        }, t2.prototype.forEach = function() {
          var t3;
          return (t3 = this.values).forEach.apply(t3, arguments);
        }, t2;
      }());
    }.call(commonjsGlobal), function(t) {
      function e() {
      }
      function n(t2, e2) {
        return function() {
          t2.apply(e2, arguments);
        };
      }
      function i(t2) {
        if (typeof this != "object")
          throw new TypeError("Promises must be constructed via new");
        if (typeof t2 != "function")
          throw new TypeError("not a function");
        this._state = 0, this._handled = false, this._value = void 0, this._deferreds = [], c(t2, this);
      }
      function o(t2, e2) {
        for (; t2._state === 3; )
          t2 = t2._value;
        return t2._state === 0 ? void t2._deferreds.push(e2) : (t2._handled = true, void h(function() {
          var n2 = t2._state === 1 ? e2.onFulfilled : e2.onRejected;
          if (n2 === null)
            return void (t2._state === 1 ? r : s)(e2.promise, t2._value);
          var i2;
          try {
            i2 = n2(t2._value);
          } catch (o2) {
            return void s(e2.promise, o2);
          }
          r(e2.promise, i2);
        }));
      }
      function r(t2, e2) {
        try {
          if (e2 === t2)
            throw new TypeError("A promise cannot be resolved with itself.");
          if (e2 && (typeof e2 == "object" || typeof e2 == "function")) {
            var o2 = e2.then;
            if (e2 instanceof i)
              return t2._state = 3, t2._value = e2, void a(t2);
            if (typeof o2 == "function")
              return void c(n(o2, e2), t2);
          }
          t2._state = 1, t2._value = e2, a(t2);
        } catch (r2) {
          s(t2, r2);
        }
      }
      function s(t2, e2) {
        t2._state = 2, t2._value = e2, a(t2);
      }
      function a(t2) {
        t2._state === 2 && t2._deferreds.length === 0 && setTimeout(function() {
          t2._handled || p(t2._value);
        }, 1);
        for (var e2 = 0, n2 = t2._deferreds.length; n2 > e2; e2++)
          o(t2, t2._deferreds[e2]);
        t2._deferreds = null;
      }
      function u(t2, e2, n2) {
        this.onFulfilled = typeof t2 == "function" ? t2 : null, this.onRejected = typeof e2 == "function" ? e2 : null, this.promise = n2;
      }
      function c(t2, e2) {
        var n2 = false;
        try {
          t2(function(t3) {
            n2 || (n2 = true, r(e2, t3));
          }, function(t3) {
            n2 || (n2 = true, s(e2, t3));
          });
        } catch (i2) {
          if (n2)
            return;
          n2 = true, s(e2, i2);
        }
      }
      var l = setTimeout, h = typeof setImmediate == "function" && setImmediate || function(t2) {
        l(t2, 1);
      }, p = function(t2) {
        typeof console != "undefined" && console && console.warn("Possible Unhandled Promise Rejection:", t2);
      };
      i.prototype["catch"] = function(t2) {
        return this.then(null, t2);
      }, i.prototype.then = function(t2, n2) {
        var r2 = new i(e);
        return o(this, new u(t2, n2, r2)), r2;
      }, i.all = function(t2) {
        var e2 = Array.prototype.slice.call(t2);
        return new i(function(t3, n2) {
          function i2(r3, s2) {
            try {
              if (s2 && (typeof s2 == "object" || typeof s2 == "function")) {
                var a2 = s2.then;
                if (typeof a2 == "function")
                  return void a2.call(s2, function(t4) {
                    i2(r3, t4);
                  }, n2);
              }
              e2[r3] = s2, --o2 === 0 && t3(e2);
            } catch (u2) {
              n2(u2);
            }
          }
          if (e2.length === 0)
            return t3([]);
          for (var o2 = e2.length, r2 = 0; r2 < e2.length; r2++)
            i2(r2, e2[r2]);
        });
      }, i.resolve = function(t2) {
        return t2 && typeof t2 == "object" && t2.constructor === i ? t2 : new i(function(e2) {
          e2(t2);
        });
      }, i.reject = function(t2) {
        return new i(function(e2, n2) {
          n2(t2);
        });
      }, i.race = function(t2) {
        return new i(function(e2, n2) {
          for (var i2 = 0, o2 = t2.length; o2 > i2; i2++)
            t2[i2].then(e2, n2);
        });
      }, i._setImmediateFn = function(t2) {
        h = t2;
      }, i._setUnhandledRejectionFn = function(t2) {
        p = t2;
      }, module3.exports ? module3.exports = i : t.Promise || (t.Promise = i);
    }(commonjsGlobal), function() {
      var t = typeof window.customElements == "object", e = typeof document.registerElement == "function", n = t || e;
      n || (typeof WeakMap == "undefined" && !function() {
        var t2 = Object.defineProperty, e2 = Date.now() % 1e9, n2 = function() {
          this.name = "__st" + (1e9 * Math.random() >>> 0) + (e2++ + "__");
        };
        n2.prototype = { set: function(e3, n3) {
          var i = e3[this.name];
          return i && i[0] === e3 ? i[1] = n3 : t2(e3, this.name, { value: [e3, n3], writable: true }), this;
        }, get: function(t3) {
          var e3;
          return (e3 = t3[this.name]) && e3[0] === t3 ? e3[1] : void 0;
        }, delete: function(t3) {
          var e3 = t3[this.name];
          return e3 && e3[0] === t3 ? (e3[0] = e3[1] = void 0, true) : false;
        }, has: function(t3) {
          var e3 = t3[this.name];
          return e3 ? e3[0] === t3 : false;
        } }, window.WeakMap = n2;
      }(), function(t2) {
        function e2(t3) {
          A.push(t3), b || (b = true, g(i));
        }
        function n2(t3) {
          return window.ShadowDOMPolyfill && window.ShadowDOMPolyfill.wrapIfNeeded(t3) || t3;
        }
        function i() {
          b = false;
          var t3 = A;
          A = [], t3.sort(function(t4, e4) {
            return t4.uid_ - e4.uid_;
          });
          var e3 = false;
          t3.forEach(function(t4) {
            var n3 = t4.takeRecords();
            o(t4), n3.length && (t4.callback_(n3, t4), e3 = true);
          }), e3 && i();
        }
        function o(t3) {
          t3.nodes_.forEach(function(e3) {
            var n3 = m.get(e3);
            n3 && n3.forEach(function(e4) {
              e4.observer === t3 && e4.removeTransientObservers();
            });
          });
        }
        function r(t3, e3) {
          for (var n3 = t3; n3; n3 = n3.parentNode) {
            var i2 = m.get(n3);
            if (i2)
              for (var o2 = 0; o2 < i2.length; o2++) {
                var r2 = i2[o2], s2 = r2.options;
                if (n3 === t3 || s2.subtree) {
                  var a2 = e3(s2);
                  a2 && r2.enqueue(a2);
                }
              }
          }
        }
        function s(t3) {
          this.callback_ = t3, this.nodes_ = [], this.records_ = [], this.uid_ = ++C;
        }
        function a(t3, e3) {
          this.type = t3, this.target = e3, this.addedNodes = [], this.removedNodes = [], this.previousSibling = null, this.nextSibling = null, this.attributeName = null, this.attributeNamespace = null, this.oldValue = null;
        }
        function u(t3) {
          var e3 = new a(t3.type, t3.target);
          return e3.addedNodes = t3.addedNodes.slice(), e3.removedNodes = t3.removedNodes.slice(), e3.previousSibling = t3.previousSibling, e3.nextSibling = t3.nextSibling, e3.attributeName = t3.attributeName, e3.attributeNamespace = t3.attributeNamespace, e3.oldValue = t3.oldValue, e3;
        }
        function c(t3, e3) {
          return x = new a(t3, e3);
        }
        function l(t3) {
          return w ? w : (w = u(x), w.oldValue = t3, w);
        }
        function h() {
          x = w = void 0;
        }
        function p(t3) {
          return t3 === w || t3 === x;
        }
        function d(t3, e3) {
          return t3 === e3 ? t3 : w && p(t3) ? w : null;
        }
        function f(t3, e3, n3) {
          this.observer = t3, this.target = e3, this.options = n3, this.transientObservedNodes = [];
        }
        if (!t2.JsMutationObserver) {
          var g, m = /* @__PURE__ */ new WeakMap();
          if (/Trident|Edge/.test(navigator.userAgent))
            g = setTimeout;
          else if (window.setImmediate)
            g = window.setImmediate;
          else {
            var v = [], y = String(Math.random());
            window.addEventListener("message", function(t3) {
              if (t3.data === y) {
                var e3 = v;
                v = [], e3.forEach(function(t4) {
                  t4();
                });
              }
            }), g = function(t3) {
              v.push(t3), window.postMessage(y, "*");
            };
          }
          var b = false, A = [], C = 0;
          s.prototype = { observe: function(t3, e3) {
            if (t3 = n2(t3), !e3.childList && !e3.attributes && !e3.characterData || e3.attributeOldValue && !e3.attributes || e3.attributeFilter && e3.attributeFilter.length && !e3.attributes || e3.characterDataOldValue && !e3.characterData)
              throw new SyntaxError();
            var i2 = m.get(t3);
            i2 || m.set(t3, i2 = []);
            for (var o2, r2 = 0; r2 < i2.length; r2++)
              if (i2[r2].observer === this) {
                o2 = i2[r2], o2.removeListeners(), o2.options = e3;
                break;
              }
            o2 || (o2 = new f(this, t3, e3), i2.push(o2), this.nodes_.push(t3)), o2.addListeners();
          }, disconnect: function() {
            this.nodes_.forEach(function(t3) {
              for (var e3 = m.get(t3), n3 = 0; n3 < e3.length; n3++) {
                var i2 = e3[n3];
                if (i2.observer === this) {
                  i2.removeListeners(), e3.splice(n3, 1);
                  break;
                }
              }
            }, this), this.records_ = [];
          }, takeRecords: function() {
            var t3 = this.records_;
            return this.records_ = [], t3;
          } };
          var x, w;
          f.prototype = { enqueue: function(t3) {
            var n3 = this.observer.records_, i2 = n3.length;
            if (n3.length > 0) {
              var o2 = n3[i2 - 1], r2 = d(o2, t3);
              if (r2)
                return void (n3[i2 - 1] = r2);
            } else
              e2(this.observer);
            n3[i2] = t3;
          }, addListeners: function() {
            this.addListeners_(this.target);
          }, addListeners_: function(t3) {
            var e3 = this.options;
            e3.attributes && t3.addEventListener("DOMAttrModified", this, true), e3.characterData && t3.addEventListener("DOMCharacterDataModified", this, true), e3.childList && t3.addEventListener("DOMNodeInserted", this, true), (e3.childList || e3.subtree) && t3.addEventListener("DOMNodeRemoved", this, true);
          }, removeListeners: function() {
            this.removeListeners_(this.target);
          }, removeListeners_: function(t3) {
            var e3 = this.options;
            e3.attributes && t3.removeEventListener("DOMAttrModified", this, true), e3.characterData && t3.removeEventListener("DOMCharacterDataModified", this, true), e3.childList && t3.removeEventListener("DOMNodeInserted", this, true), (e3.childList || e3.subtree) && t3.removeEventListener("DOMNodeRemoved", this, true);
          }, addTransientObserver: function(t3) {
            if (t3 !== this.target) {
              this.addListeners_(t3), this.transientObservedNodes.push(t3);
              var e3 = m.get(t3);
              e3 || m.set(t3, e3 = []), e3.push(this);
            }
          }, removeTransientObservers: function() {
            var t3 = this.transientObservedNodes;
            this.transientObservedNodes = [], t3.forEach(function(t4) {
              this.removeListeners_(t4);
              for (var e3 = m.get(t4), n3 = 0; n3 < e3.length; n3++)
                if (e3[n3] === this) {
                  e3.splice(n3, 1);
                  break;
                }
            }, this);
          }, handleEvent: function(t3) {
            switch (t3.stopImmediatePropagation(), t3.type) {
              case "DOMAttrModified":
                var e3 = t3.attrName, n3 = t3.relatedNode.namespaceURI, i2 = t3.target, o2 = new c("attributes", i2);
                o2.attributeName = e3, o2.attributeNamespace = n3;
                var s2 = t3.attrChange === MutationEvent.ADDITION ? null : t3.prevValue;
                r(i2, function(t4) {
                  return !t4.attributes || t4.attributeFilter && t4.attributeFilter.length && t4.attributeFilter.indexOf(e3) === -1 && t4.attributeFilter.indexOf(n3) === -1 ? void 0 : t4.attributeOldValue ? l(s2) : o2;
                });
                break;
              case "DOMCharacterDataModified":
                var i2 = t3.target, o2 = c("characterData", i2), s2 = t3.prevValue;
                r(i2, function(t4) {
                  return t4.characterData ? t4.characterDataOldValue ? l(s2) : o2 : void 0;
                });
                break;
              case "DOMNodeRemoved":
                this.addTransientObserver(t3.target);
              case "DOMNodeInserted":
                var a2, u2, p2 = t3.target;
                t3.type === "DOMNodeInserted" ? (a2 = [p2], u2 = []) : (a2 = [], u2 = [p2]);
                var d2 = p2.previousSibling, f2 = p2.nextSibling, o2 = c("childList", t3.target.parentNode);
                o2.addedNodes = a2, o2.removedNodes = u2, o2.previousSibling = d2, o2.nextSibling = f2, r(t3.relatedNode, function(t4) {
                  return t4.childList ? o2 : void 0;
                });
            }
            h();
          } }, t2.JsMutationObserver = s, t2.MutationObserver || (t2.MutationObserver = s, s._isPolyfilled = true);
        }
      }(self), function() {
        if (!window.performance || !window.performance.now) {
          var t2 = Date.now();
          window.performance = { now: function() {
            return Date.now() - t2;
          } };
        }
        window.requestAnimationFrame || (window.requestAnimationFrame = function() {
          var t3 = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
          return t3 ? function(e3) {
            return t3(function() {
              e3(performance.now());
            });
          } : function(t4) {
            return window.setTimeout(t4, 1e3 / 60);
          };
        }()), window.cancelAnimationFrame || (window.cancelAnimationFrame = function() {
          return window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || function(t3) {
            clearTimeout(t3);
          };
        }());
        var e2 = function() {
          var t3 = document.createEvent("Event");
          return t3.initEvent("foo", true, true), t3.preventDefault(), t3.defaultPrevented;
        }();
        if (!e2) {
          var n2 = Event.prototype.preventDefault;
          Event.prototype.preventDefault = function() {
            this.cancelable && (n2.call(this), Object.defineProperty(this, "defaultPrevented", { get: function() {
              return true;
            }, configurable: true }));
          };
        }
        var i = /Trident/.test(navigator.userAgent);
        if ((!window.CustomEvent || i && typeof window.CustomEvent != "function") && (window.CustomEvent = function(t3, e3) {
          e3 = e3 || {};
          var n3 = document.createEvent("CustomEvent");
          return n3.initCustomEvent(t3, Boolean(e3.bubbles), Boolean(e3.cancelable), e3.detail), n3;
        }, window.CustomEvent.prototype = window.Event.prototype), !window.Event || i && typeof window.Event != "function") {
          var o = window.Event;
          window.Event = function(t3, e3) {
            e3 = e3 || {};
            var n3 = document.createEvent("Event");
            return n3.initEvent(t3, Boolean(e3.bubbles), Boolean(e3.cancelable)), n3;
          }, window.Event.prototype = o.prototype;
        }
      }(), window.CustomElements = window.CustomElements || { flags: {} }, function(t2) {
        var e2 = t2.flags, n2 = [], i = function(t3) {
          n2.push(t3);
        }, o = function() {
          n2.forEach(function(e3) {
            e3(t2);
          });
        };
        t2.addModule = i, t2.initializeModules = o, t2.hasNative = Boolean(document.registerElement), t2.isIE = /Trident/.test(navigator.userAgent), t2.useNative = !e2.register && t2.hasNative && !window.ShadowDOMPolyfill && (!window.HTMLImports || window.HTMLImports.useNative);
      }(window.CustomElements), window.CustomElements.addModule(function(t2) {
        function e2(t3, e3) {
          n2(t3, function(t4) {
            return e3(t4) ? true : void i(t4, e3);
          }), i(t3, e3);
        }
        function n2(t3, e3, i2) {
          var o2 = t3.firstElementChild;
          if (!o2)
            for (o2 = t3.firstChild; o2 && o2.nodeType !== Node.ELEMENT_NODE; )
              o2 = o2.nextSibling;
          for (; o2; )
            e3(o2, i2) !== true && n2(o2, e3, i2), o2 = o2.nextElementSibling;
          return null;
        }
        function i(t3, n3) {
          for (var i2 = t3.shadowRoot; i2; )
            e2(i2, n3), i2 = i2.olderShadowRoot;
        }
        function o(t3, e3) {
          r(t3, e3, []);
        }
        function r(t3, e3, n3) {
          if (t3 = window.wrap(t3), !(n3.indexOf(t3) >= 0)) {
            n3.push(t3);
            for (var i2, o2 = t3.querySelectorAll("link[rel=" + s + "]"), a = 0, u = o2.length; u > a && (i2 = o2[a]); a++)
              i2.import && r(i2.import, e3, n3);
            e3(t3);
          }
        }
        var s = window.HTMLImports ? window.HTMLImports.IMPORT_LINK_TYPE : "none";
        t2.forDocumentTree = o, t2.forSubtree = e2;
      }), window.CustomElements.addModule(function(t2) {
        function e2(t3, e3) {
          return n2(t3, e3) || i(t3, e3);
        }
        function n2(e3, n3) {
          return t2.upgrade(e3, n3) ? true : void (n3 && s(e3));
        }
        function i(t3, e3) {
          b(t3, function(t4) {
            return n2(t4, e3) ? true : void 0;
          });
        }
        function o(t3) {
          w.push(t3), x || (x = true, setTimeout(r));
        }
        function r() {
          x = false;
          for (var t3, e3 = w, n3 = 0, i2 = e3.length; i2 > n3 && (t3 = e3[n3]); n3++)
            t3();
          w = [];
        }
        function s(t3) {
          C ? o(function() {
            a(t3);
          }) : a(t3);
        }
        function a(t3) {
          t3.__upgraded__ && !t3.__attached && (t3.__attached = true, t3.attachedCallback && t3.attachedCallback());
        }
        function u(t3) {
          c(t3), b(t3, function(t4) {
            c(t4);
          });
        }
        function c(t3) {
          C ? o(function() {
            l(t3);
          }) : l(t3);
        }
        function l(t3) {
          t3.__upgraded__ && t3.__attached && (t3.__attached = false, t3.detachedCallback && t3.detachedCallback());
        }
        function h(t3) {
          for (var e3 = t3, n3 = window.wrap(document); e3; ) {
            if (e3 == n3)
              return true;
            e3 = e3.parentNode || e3.nodeType === Node.DOCUMENT_FRAGMENT_NODE && e3.host;
          }
        }
        function p(t3) {
          if (t3.shadowRoot && !t3.shadowRoot.__watched) {
            y.dom && console.log("watching shadow-root for: ", t3.localName);
            for (var e3 = t3.shadowRoot; e3; )
              g(e3), e3 = e3.olderShadowRoot;
          }
        }
        function d(t3, n3) {
          if (y.dom) {
            var i2 = n3[0];
            if (i2 && i2.type === "childList" && i2.addedNodes && i2.addedNodes) {
              for (var o2 = i2.addedNodes[0]; o2 && o2 !== document && !o2.host; )
                o2 = o2.parentNode;
              var r2 = o2 && (o2.URL || o2._URL || o2.host && o2.host.localName) || "";
              r2 = r2.split("/?").shift().split("/").pop();
            }
            console.group("mutations (%d) [%s]", n3.length, r2 || "");
          }
          var s2 = h(t3);
          n3.forEach(function(t4) {
            t4.type === "childList" && (E(t4.addedNodes, function(t5) {
              t5.localName && e2(t5, s2);
            }), E(t4.removedNodes, function(t5) {
              t5.localName && u(t5);
            }));
          }), y.dom && console.groupEnd();
        }
        function f(t3) {
          for (t3 = window.wrap(t3), t3 || (t3 = window.wrap(document)); t3.parentNode; )
            t3 = t3.parentNode;
          var e3 = t3.__observer;
          e3 && (d(t3, e3.takeRecords()), r());
        }
        function g(t3) {
          if (!t3.__observer) {
            var e3 = new MutationObserver(d.bind(this, t3));
            e3.observe(t3, { childList: true, subtree: true }), t3.__observer = e3;
          }
        }
        function m(t3) {
          t3 = window.wrap(t3), y.dom && console.group("upgradeDocument: ", t3.baseURI.split("/").pop());
          var n3 = t3 === window.wrap(document);
          e2(t3, n3), g(t3), y.dom && console.groupEnd();
        }
        function v(t3) {
          A(t3, m);
        }
        var y = t2.flags, b = t2.forSubtree, A = t2.forDocumentTree, C = window.MutationObserver._isPolyfilled && y["throttle-attached"];
        t2.hasPolyfillMutations = C, t2.hasThrottledAttached = C;
        var x = false, w = [], E = Array.prototype.forEach.call.bind(Array.prototype.forEach), S = Element.prototype.createShadowRoot;
        S && (Element.prototype.createShadowRoot = function() {
          var t3 = S.call(this);
          return window.CustomElements.watchShadow(this), t3;
        }), t2.watchShadow = p, t2.upgradeDocumentTree = v, t2.upgradeDocument = m, t2.upgradeSubtree = i, t2.upgradeAll = e2, t2.attached = s, t2.takeRecords = f;
      }), window.CustomElements.addModule(function(t2) {
        function e2(e3, i2) {
          if (e3.localName === "template" && window.HTMLTemplateElement && HTMLTemplateElement.decorate && HTMLTemplateElement.decorate(e3), !e3.__upgraded__ && e3.nodeType === Node.ELEMENT_NODE) {
            var o2 = e3.getAttribute("is"), r2 = t2.getRegisteredDefinition(e3.localName) || t2.getRegisteredDefinition(o2);
            if (r2 && (o2 && r2.tag == e3.localName || !o2 && !r2.extends))
              return n2(e3, r2, i2);
          }
        }
        function n2(e3, n3, o2) {
          return s.upgrade && console.group("upgrade:", e3.localName), n3.is && e3.setAttribute("is", n3.is), i(e3, n3), e3.__upgraded__ = true, r(e3), o2 && t2.attached(e3), t2.upgradeSubtree(e3, o2), s.upgrade && console.groupEnd(), e3;
        }
        function i(t3, e3) {
          Object.__proto__ ? t3.__proto__ = e3.prototype : (o(t3, e3.prototype, e3.native), t3.__proto__ = e3.prototype);
        }
        function o(t3, e3, n3) {
          for (var i2 = {}, o2 = e3; o2 !== n3 && o2 !== HTMLElement.prototype; ) {
            for (var r2, s2 = Object.getOwnPropertyNames(o2), a = 0; r2 = s2[a]; a++)
              i2[r2] || (Object.defineProperty(t3, r2, Object.getOwnPropertyDescriptor(o2, r2)), i2[r2] = 1);
            o2 = Object.getPrototypeOf(o2);
          }
        }
        function r(t3) {
          t3.createdCallback && t3.createdCallback();
        }
        var s = t2.flags;
        t2.upgrade = e2, t2.upgradeWithDefinition = n2, t2.implementPrototype = i;
      }), window.CustomElements.addModule(function(t2) {
        function e2(e3, i2) {
          var u2 = i2 || {};
          if (!e3)
            throw new Error("document.registerElement: first argument `name` must not be empty");
          if (e3.indexOf("-") < 0)
            throw new Error("document.registerElement: first argument ('name') must contain a dash ('-'). Argument provided was '" + String(e3) + "'.");
          if (o(e3))
            throw new Error("Failed to execute 'registerElement' on 'Document': Registration failed for type '" + String(e3) + "'. The type name is invalid.");
          if (c(e3))
            throw new Error("DuplicateDefinitionError: a type with name '" + String(e3) + "' is already registered");
          return u2.prototype || (u2.prototype = Object.create(HTMLElement.prototype)), u2.__name = e3.toLowerCase(), u2.extends && (u2.extends = u2.extends.toLowerCase()), u2.lifecycle = u2.lifecycle || {}, u2.ancestry = r(u2.extends), s(u2), a(u2), n2(u2.prototype), l(u2.__name, u2), u2.ctor = h(u2), u2.ctor.prototype = u2.prototype, u2.prototype.constructor = u2.ctor, t2.ready && m(document), u2.ctor;
        }
        function n2(t3) {
          if (!t3.setAttribute._polyfilled) {
            var e3 = t3.setAttribute;
            t3.setAttribute = function(t4, n4) {
              i.call(this, t4, n4, e3);
            };
            var n3 = t3.removeAttribute;
            t3.removeAttribute = function(t4) {
              i.call(this, t4, null, n3);
            }, t3.setAttribute._polyfilled = true;
          }
        }
        function i(t3, e3, n3) {
          t3 = t3.toLowerCase();
          var i2 = this.getAttribute(t3);
          n3.apply(this, arguments);
          var o2 = this.getAttribute(t3);
          this.attributeChangedCallback && o2 !== i2 && this.attributeChangedCallback(t3, i2, o2);
        }
        function o(t3) {
          for (var e3 = 0; e3 < C.length; e3++)
            if (t3 === C[e3])
              return true;
        }
        function r(t3) {
          var e3 = c(t3);
          return e3 ? r(e3.extends).concat([e3]) : [];
        }
        function s(t3) {
          for (var e3, n3 = t3.extends, i2 = 0; e3 = t3.ancestry[i2]; i2++)
            n3 = e3.is && e3.tag;
          t3.tag = n3 || t3.__name, n3 && (t3.is = t3.__name);
        }
        function a(t3) {
          if (!Object.__proto__) {
            var e3 = HTMLElement.prototype;
            if (t3.is) {
              var n3 = document.createElement(t3.tag);
              e3 = Object.getPrototypeOf(n3);
            }
            for (var i2, o2 = t3.prototype, r2 = false; o2; )
              o2 == e3 && (r2 = true), i2 = Object.getPrototypeOf(o2), i2 && (o2.__proto__ = i2), o2 = i2;
            r2 || console.warn(t3.tag + " prototype not found in prototype chain for " + t3.is), t3.native = e3;
          }
        }
        function u(t3) {
          return y(E(t3.tag), t3);
        }
        function c(t3) {
          return t3 ? x[t3.toLowerCase()] : void 0;
        }
        function l(t3, e3) {
          x[t3] = e3;
        }
        function h(t3) {
          return function() {
            return u(t3);
          };
        }
        function p(t3, e3, n3) {
          return t3 === w ? d(e3, n3) : S(t3, e3);
        }
        function d(t3, e3) {
          t3 && (t3 = t3.toLowerCase()), e3 && (e3 = e3.toLowerCase());
          var n3 = c(e3 || t3);
          if (n3) {
            if (t3 == n3.tag && e3 == n3.is)
              return new n3.ctor();
            if (!e3 && !n3.is)
              return new n3.ctor();
          }
          var i2;
          return e3 ? (i2 = d(t3), i2.setAttribute("is", e3), i2) : (i2 = E(t3), t3.indexOf("-") >= 0 && b(i2, HTMLElement), i2);
        }
        function f(t3, e3) {
          var n3 = t3[e3];
          t3[e3] = function() {
            var t4 = n3.apply(this, arguments);
            return v(t4), t4;
          };
        }
        var g, m = (t2.isIE, t2.upgradeDocumentTree), v = t2.upgradeAll, y = t2.upgradeWithDefinition, b = t2.implementPrototype, A = t2.useNative, C = ["annotation-xml", "color-profile", "font-face", "font-face-src", "font-face-uri", "font-face-format", "font-face-name", "missing-glyph"], x = {}, w = "http://www.w3.org/1999/xhtml", E = document.createElement.bind(document), S = document.createElementNS.bind(document);
        g = Object.__proto__ || A ? function(t3, e3) {
          return t3 instanceof e3;
        } : function(t3, e3) {
          if (t3 instanceof e3)
            return true;
          for (var n3 = t3; n3; ) {
            if (n3 === e3.prototype)
              return true;
            n3 = n3.__proto__;
          }
          return false;
        }, f(Node.prototype, "cloneNode"), f(document, "importNode"), document.registerElement = e2, document.createElement = d, document.createElementNS = p, t2.registry = x, t2.instanceof = g, t2.reservedTagList = C, t2.getRegisteredDefinition = c, document.register = document.registerElement;
      }), function(t2) {
        function e2() {
          r(window.wrap(document)), window.CustomElements.ready = true;
          var t3 = window.requestAnimationFrame || function(t4) {
            setTimeout(t4, 16);
          };
          t3(function() {
            setTimeout(function() {
              window.CustomElements.readyTime = Date.now(), window.HTMLImports && (window.CustomElements.elapsed = window.CustomElements.readyTime - window.HTMLImports.readyTime), document.dispatchEvent(new CustomEvent("WebComponentsReady", { bubbles: true }));
            });
          });
        }
        var n2 = t2.useNative, i = t2.initializeModules;
        if (t2.isIE, n2) {
          var o = function() {
          };
          t2.watchShadow = o, t2.upgrade = o, t2.upgradeAll = o, t2.upgradeDocumentTree = o, t2.upgradeSubtree = o, t2.takeRecords = o, t2.instanceof = function(t3, e3) {
            return t3 instanceof e3;
          };
        } else
          i();
        var r = t2.upgradeDocumentTree, s = t2.upgradeDocument;
        if (window.wrap || (window.ShadowDOMPolyfill ? (window.wrap = window.ShadowDOMPolyfill.wrapIfNeeded, window.unwrap = window.ShadowDOMPolyfill.unwrapIfNeeded) : window.wrap = window.unwrap = function(t3) {
          return t3;
        }), window.HTMLImports && (window.HTMLImports.__importsParsingHook = function(t3) {
          t3.import && s(wrap(t3.import));
        }), document.readyState === "complete" || t2.flags.eager)
          e2();
        else if (document.readyState !== "interactive" || window.attachEvent || window.HTMLImports && !window.HTMLImports.ready) {
          var a = window.HTMLImports && !window.HTMLImports.ready ? "HTMLImportsLoaded" : "DOMContentLoaded";
          window.addEventListener(a, e2);
        } else
          e2();
      }(window.CustomElements));
    }.call(commonjsGlobal), function() {
    }.call(commonjsGlobal), function() {
      var t = this;
      (function() {
        (function() {
          this.Trix = { VERSION: "1.3.1", ZERO_WIDTH_SPACE: "\uFEFF", NON_BREAKING_SPACE: "\xA0", OBJECT_REPLACEMENT_CHARACTER: "\uFFFC", browser: { composesExistingText: /Android.*Chrome/.test(navigator.userAgent), forcesObjectResizing: /Trident.*rv:11/.test(navigator.userAgent), supportsInputEvents: function() {
            var t2, e2, n, i;
            if (typeof InputEvent == "undefined")
              return false;
            for (i = ["data", "getTargetRanges", "inputType"], t2 = 0, e2 = i.length; e2 > t2; t2++)
              if (n = i[t2], !(n in InputEvent.prototype))
                return false;
            return true;
          }() }, config: {} };
        }).call(this);
      }).call(t);
      var e = t.Trix;
      (function() {
        (function() {
          e.BasicObject = function() {
            function t2() {
            }
            var e2, n, i;
            return t2.proxyMethod = function(t3) {
              var i2, o, r, s, a;
              return r = n(t3), i2 = r.name, s = r.toMethod, a = r.toProperty, o = r.optional, this.prototype[i2] = function() {
                var t4, n2;
                return t4 = s != null ? o ? typeof this[s] == "function" ? this[s]() : void 0 : this[s]() : a != null ? this[a] : void 0, o ? (n2 = t4 != null ? t4[i2] : void 0, n2 != null ? e2.call(n2, t4, arguments) : void 0) : (n2 = t4[i2], e2.call(n2, t4, arguments));
              };
            }, n = function(t3) {
              var e3, n2;
              if (!(n2 = t3.match(i)))
                throw new Error("can't parse @proxyMethod expression: " + t3);
              return e3 = { name: n2[4] }, n2[2] != null ? e3.toMethod = n2[1] : e3.toProperty = n2[1], n2[3] != null && (e3.optional = true), e3;
            }, e2 = Function.prototype.apply, i = /^(.+?)(\(\))?(\?)?\.(.+?)$/, t2;
          }();
        }).call(this), function() {
          var t2 = function(t3, e2) {
            function i() {
              this.constructor = t3;
            }
            for (var o in e2)
              n.call(e2, o) && (t3[o] = e2[o]);
            return i.prototype = e2.prototype, t3.prototype = new i(), t3.__super__ = e2.prototype, t3;
          }, n = {}.hasOwnProperty;
          e.Object = function(n2) {
            function i() {
              this.id = ++o;
            }
            var o;
            return t2(i, n2), o = 0, i.fromJSONString = function(t3) {
              return this.fromJSON(JSON.parse(t3));
            }, i.prototype.hasSameConstructorAs = function(t3) {
              return this.constructor === (t3 != null ? t3.constructor : void 0);
            }, i.prototype.isEqualTo = function(t3) {
              return this === t3;
            }, i.prototype.inspect = function() {
              var t3, e2, n3;
              return t3 = function() {
                var t4, i2, o2;
                i2 = (t4 = this.contentsForInspection()) != null ? t4 : {}, o2 = [];
                for (e2 in i2)
                  n3 = i2[e2], o2.push(e2 + "=" + n3);
                return o2;
              }.call(this), "#<" + this.constructor.name + ":" + this.id + (t3.length ? " " + t3.join(", ") : "") + ">";
            }, i.prototype.contentsForInspection = function() {
            }, i.prototype.toJSONString = function() {
              return JSON.stringify(this);
            }, i.prototype.toUTF16String = function() {
              return e.UTF16String.box(this);
            }, i.prototype.getCacheKey = function() {
              return this.id.toString();
            }, i;
          }(e.BasicObject);
        }.call(this), function() {
          e.extend = function(t2) {
            var e2, n;
            for (e2 in t2)
              n = t2[e2], this[e2] = n;
            return this;
          };
        }.call(this), function() {
          e.extend({ defer: function(t2) {
            return setTimeout(t2, 1);
          } });
        }.call(this), function() {
          var t2, n;
          e.extend({ normalizeSpaces: function(t3) {
            return t3.replace(RegExp("" + e.ZERO_WIDTH_SPACE, "g"), "").replace(RegExp("" + e.NON_BREAKING_SPACE, "g"), " ");
          }, normalizeNewlines: function(t3) {
            return t3.replace(/\r\n/g, "\n");
          }, breakableWhitespacePattern: RegExp("[^\\S" + e.NON_BREAKING_SPACE + "]"), squishBreakableWhitespace: function(t3) {
            return t3.replace(RegExp("" + e.breakableWhitespacePattern.source, "g"), " ").replace(/\ {2,}/g, " ");
          }, summarizeStringChange: function(t3, i) {
            var o, r, s, a;
            return t3 = e.UTF16String.box(t3), i = e.UTF16String.box(i), i.length < t3.length ? (r = n(t3, i), a = r[0], o = r[1]) : (s = n(i, t3), o = s[0], a = s[1]), { added: o, removed: a };
          } }), n = function(n2, i) {
            var o, r, s, a, u;
            return n2.isEqualTo(i) ? ["", ""] : (r = t2(n2, i), a = r.utf16String.length, s = a ? (u = r.offset, o = n2.codepoints.slice(0, u).concat(n2.codepoints.slice(u + a)), t2(i, e.UTF16String.fromCodepoints(o))) : t2(i, n2), [r.utf16String.toString(), s.utf16String.toString()]);
          }, t2 = function(t3, e2) {
            var n2, i, o;
            for (n2 = 0, i = t3.length, o = e2.length; i > n2 && t3.charAt(n2).isEqualTo(e2.charAt(n2)); )
              n2++;
            for (; i > n2 + 1 && t3.charAt(i - 1).isEqualTo(e2.charAt(o - 1)); )
              i--, o--;
            return { utf16String: t3.slice(n2, i), offset: n2 };
          };
        }.call(this), function() {
          e.extend({ copyObject: function(t2) {
            var e2, n, i;
            t2 == null && (t2 = {}), n = {};
            for (e2 in t2)
              i = t2[e2], n[e2] = i;
            return n;
          }, objectsAreEqual: function(t2, e2) {
            var n, i;
            if (t2 == null && (t2 = {}), e2 == null && (e2 = {}), Object.keys(t2).length !== Object.keys(e2).length)
              return false;
            for (n in t2)
              if (i = t2[n], i !== e2[n])
                return false;
            return true;
          } });
        }.call(this), function() {
          var t2 = [].slice;
          e.extend({ arraysAreEqual: function(t3, e2) {
            var n, i, o, r;
            if (t3 == null && (t3 = []), e2 == null && (e2 = []), t3.length !== e2.length)
              return false;
            for (i = n = 0, o = t3.length; o > n; i = ++n)
              if (r = t3[i], r !== e2[i])
                return false;
            return true;
          }, arrayStartsWith: function(t3, n) {
            return t3 == null && (t3 = []), n == null && (n = []), e.arraysAreEqual(t3.slice(0, n.length), n);
          }, spliceArray: function() {
            var e2, n, i;
            return n = arguments[0], e2 = 2 <= arguments.length ? t2.call(arguments, 1) : [], i = n.slice(0), i.splice.apply(i, e2), i;
          }, summarizeArrayChange: function(t3, e2) {
            var n, i, o, r, s, a, u, c, l, h, p;
            for (t3 == null && (t3 = []), e2 == null && (e2 = []), n = [], h = [], o = /* @__PURE__ */ new Set(), r = 0, u = t3.length; u > r; r++)
              p = t3[r], o.add(p);
            for (i = /* @__PURE__ */ new Set(), s = 0, c = e2.length; c > s; s++)
              p = e2[s], i.add(p), o.has(p) || n.push(p);
            for (a = 0, l = t3.length; l > a; a++)
              p = t3[a], i.has(p) || h.push(p);
            return { added: n, removed: h };
          } });
        }.call(this), function() {
          var t2, n, i, o;
          t2 = null, n = null, o = null, i = null, e.extend({ getAllAttributeNames: function() {
            return t2 != null ? t2 : t2 = e.getTextAttributeNames().concat(e.getBlockAttributeNames());
          }, getBlockConfig: function(t3) {
            return e.config.blockAttributes[t3];
          }, getBlockAttributeNames: function() {
            return n != null ? n : n = Object.keys(e.config.blockAttributes);
          }, getTextConfig: function(t3) {
            return e.config.textAttributes[t3];
          }, getTextAttributeNames: function() {
            return o != null ? o : o = Object.keys(e.config.textAttributes);
          }, getListAttributeNames: function() {
            var t3, n2;
            return i != null ? i : i = function() {
              var i2, o2;
              i2 = e.config.blockAttributes, o2 = [];
              for (t3 in i2)
                n2 = i2[t3].listAttribute, n2 != null && o2.push(n2);
              return o2;
            }();
          } });
        }.call(this), function() {
          var t2, n, i, o, r, s = [].indexOf || function(t3) {
            for (var e2 = 0, n2 = this.length; n2 > e2; e2++)
              if (e2 in this && this[e2] === t3)
                return e2;
            return -1;
          };
          t2 = document.documentElement, n = (i = (o = (r = t2.matchesSelector) != null ? r : t2.webkitMatchesSelector) != null ? o : t2.msMatchesSelector) != null ? i : t2.mozMatchesSelector, e.extend({ handleEvent: function(n2, i2) {
            var r2, s2, a, u, c, l, h, p, d, f, g;
            return h = i2 != null ? i2 : {}, c = h.onElement, u = h.matchingSelector, g = h.withCallback, a = h.inPhase, l = h.preventDefault, d = h.times, r2 = c != null ? c : t2, p = u, f = a === "capturing", s2 = function(t3) {
              var n3;
              return d != null && --d === 0 && s2.destroy(), n3 = e.findClosestElementFromNode(t3.target, { matchingSelector: p }), n3 != null && (g != null && g.call(n3, t3, n3), l) ? t3.preventDefault() : void 0;
            }, s2.destroy = function() {
              return r2.removeEventListener(n2, s2, f);
            }, r2.addEventListener(n2, s2, f), s2;
          }, handleEventOnce: function(t3, n2) {
            return n2 == null && (n2 = {}), n2.times = 1, e.handleEvent(t3, n2);
          }, triggerEvent: function(n2, i2) {
            var o2, r2, s2, a, u, c, l;
            return l = i2 != null ? i2 : {}, c = l.onElement, r2 = l.bubbles, s2 = l.cancelable, o2 = l.attributes, a = c != null ? c : t2, r2 = r2 !== false, s2 = s2 !== false, u = document.createEvent("Events"), u.initEvent(n2, r2, s2), o2 != null && e.extend.call(u, o2), a.dispatchEvent(u);
          }, elementMatchesSelector: function(t3, e2) {
            return (t3 != null ? t3.nodeType : void 0) === 1 ? n.call(t3, e2) : void 0;
          }, findClosestElementFromNode: function(t3, n2) {
            var i2, o2, r2;
            for (o2 = n2 != null ? n2 : {}, i2 = o2.matchingSelector, r2 = o2.untilNode; t3 != null && t3.nodeType !== Node.ELEMENT_NODE; )
              t3 = t3.parentNode;
            if (t3 != null) {
              if (i2 == null)
                return t3;
              if (t3.closest && r2 == null)
                return t3.closest(i2);
              for (; t3 && t3 !== r2; ) {
                if (e.elementMatchesSelector(t3, i2))
                  return t3;
                t3 = t3.parentNode;
              }
            }
          }, findInnerElement: function(t3) {
            for (; t3 != null ? t3.firstElementChild : void 0; )
              t3 = t3.firstElementChild;
            return t3;
          }, innerElementIsActive: function(t3) {
            return document.activeElement !== t3 && e.elementContainsNode(t3, document.activeElement);
          }, elementContainsNode: function(t3, e2) {
            if (t3 && e2)
              for (; e2; ) {
                if (e2 === t3)
                  return true;
                e2 = e2.parentNode;
              }
          }, findNodeFromContainerAndOffset: function(t3, e2) {
            var n2;
            if (t3)
              return t3.nodeType === Node.TEXT_NODE ? t3 : e2 === 0 ? (n2 = t3.firstChild) != null ? n2 : t3 : t3.childNodes.item(e2 - 1);
          }, findElementFromContainerAndOffset: function(t3, n2) {
            var i2;
            return i2 = e.findNodeFromContainerAndOffset(t3, n2), e.findClosestElementFromNode(i2);
          }, findChildIndexOfNode: function(t3) {
            var e2;
            if (t3 != null ? t3.parentNode : void 0) {
              for (e2 = 0; t3 = t3.previousSibling; )
                e2++;
              return e2;
            }
          }, removeNode: function(t3) {
            var e2;
            return t3 != null && (e2 = t3.parentNode) != null ? e2.removeChild(t3) : void 0;
          }, walkTree: function(t3, e2) {
            var n2, i2, o2, r2, s2;
            return o2 = e2 != null ? e2 : {}, i2 = o2.onlyNodesOfType, r2 = o2.usingFilter, n2 = o2.expandEntityReferences, s2 = function() {
              switch (i2) {
                case "element":
                  return NodeFilter.SHOW_ELEMENT;
                case "text":
                  return NodeFilter.SHOW_TEXT;
                case "comment":
                  return NodeFilter.SHOW_COMMENT;
                default:
                  return NodeFilter.SHOW_ALL;
              }
            }(), document.createTreeWalker(t3, s2, r2 != null ? r2 : null, n2 === true);
          }, tagName: function(t3) {
            var e2;
            return t3 != null && (e2 = t3.tagName) != null ? e2.toLowerCase() : void 0;
          }, makeElement: function(t3, e2) {
            var n2, i2, o2, r2, s2, a, u, c, l, h, p, d, f, g;
            if (e2 == null && (e2 = {}), typeof t3 == "object" ? (e2 = t3, t3 = e2.tagName) : e2 = { attributes: e2 }, o2 = document.createElement(t3), e2.editable != null && (e2.attributes == null && (e2.attributes = {}), e2.attributes.contenteditable = e2.editable), e2.attributes) {
              l = e2.attributes;
              for (a in l)
                g = l[a], o2.setAttribute(a, g);
            }
            if (e2.style) {
              h = e2.style;
              for (a in h)
                g = h[a], o2.style[a] = g;
            }
            if (e2.data) {
              p = e2.data;
              for (a in p)
                g = p[a], o2.dataset[a] = g;
            }
            if (e2.className)
              for (d = e2.className.split(" "), r2 = 0, u = d.length; u > r2; r2++)
                i2 = d[r2], o2.classList.add(i2);
            if (e2.textContent && (o2.textContent = e2.textContent), e2.childNodes)
              for (f = [].concat(e2.childNodes), s2 = 0, c = f.length; c > s2; s2++)
                n2 = f[s2], o2.appendChild(n2);
            return o2;
          }, getBlockTagNames: function() {
            var t3, n2;
            return e.blockTagNames != null ? e.blockTagNames : e.blockTagNames = function() {
              var i2, o2;
              i2 = e.config.blockAttributes, o2 = [];
              for (t3 in i2)
                n2 = i2[t3].tagName, n2 && o2.push(n2);
              return o2;
            }();
          }, nodeIsBlockContainer: function(t3) {
            return e.nodeIsBlockStartComment(t3 != null ? t3.firstChild : void 0);
          }, nodeProbablyIsBlockContainer: function(t3) {
            var n2, i2;
            return n2 = e.tagName(t3), s.call(e.getBlockTagNames(), n2) >= 0 && (i2 = e.tagName(t3.firstChild), s.call(e.getBlockTagNames(), i2) < 0);
          }, nodeIsBlockStart: function(t3, n2) {
            var i2;
            return i2 = (n2 != null ? n2 : { strict: true }).strict, i2 ? e.nodeIsBlockStartComment(t3) : e.nodeIsBlockStartComment(t3) || !e.nodeIsBlockStartComment(t3.firstChild) && e.nodeProbablyIsBlockContainer(t3);
          }, nodeIsBlockStartComment: function(t3) {
            return e.nodeIsCommentNode(t3) && (t3 != null ? t3.data : void 0) === "block";
          }, nodeIsCommentNode: function(t3) {
            return (t3 != null ? t3.nodeType : void 0) === Node.COMMENT_NODE;
          }, nodeIsCursorTarget: function(t3, n2) {
            var i2;
            return i2 = (n2 != null ? n2 : {}).name, t3 ? e.nodeIsTextNode(t3) ? t3.data === e.ZERO_WIDTH_SPACE ? i2 ? t3.parentNode.dataset.trixCursorTarget === i2 : true : void 0 : e.nodeIsCursorTarget(t3.firstChild) : void 0;
          }, nodeIsAttachmentElement: function(t3) {
            return e.elementMatchesSelector(t3, e.AttachmentView.attachmentSelector);
          }, nodeIsEmptyTextNode: function(t3) {
            return e.nodeIsTextNode(t3) && (t3 != null ? t3.data : void 0) === "";
          }, nodeIsTextNode: function(t3) {
            return (t3 != null ? t3.nodeType : void 0) === Node.TEXT_NODE;
          } });
        }.call(this), function() {
          var t2, n, i, o, r;
          t2 = e.copyObject, o = e.objectsAreEqual, e.extend({ normalizeRange: i = function(t3) {
            var e2;
            if (t3 != null)
              return Array.isArray(t3) || (t3 = [t3, t3]), [n(t3[0]), n((e2 = t3[1]) != null ? e2 : t3[0])];
          }, rangeIsCollapsed: function(t3) {
            var e2, n2, o2;
            if (t3 != null)
              return n2 = i(t3), o2 = n2[0], e2 = n2[1], r(o2, e2);
          }, rangesAreEqual: function(t3, e2) {
            var n2, o2, s, a, u, c;
            if (t3 != null && e2 != null)
              return s = i(t3), o2 = s[0], n2 = s[1], a = i(e2), c = a[0], u = a[1], r(o2, c) && r(n2, u);
          } }), n = function(e2) {
            return typeof e2 == "number" ? e2 : t2(e2);
          }, r = function(t3, e2) {
            return typeof t3 == "number" ? t3 === e2 : o(t3, e2);
          };
        }.call(this), function() {
          var t2, n, i, o, r, s, a;
          e.registerElement = function(t3, e2) {
            var n2, i2;
            return e2 == null && (e2 = {}), t3 = t3.toLowerCase(), e2 = a(e2), i2 = s(e2), (n2 = i2.defaultCSS) && (delete i2.defaultCSS, o(n2, t3)), r(t3, i2);
          }, o = function(t3, e2) {
            var n2;
            return n2 = i(e2), n2.textContent = t3.replace(/%t/g, e2);
          }, i = function(e2) {
            var n2, i2;
            return n2 = document.createElement("style"), n2.setAttribute("type", "text/css"), n2.setAttribute("data-tag-name", e2.toLowerCase()), (i2 = t2()) && n2.setAttribute("nonce", i2), document.head.insertBefore(n2, document.head.firstChild), n2;
          }, t2 = function() {
            var t3;
            return (t3 = n("trix-csp-nonce") || n("csp-nonce")) ? t3.getAttribute("content") : void 0;
          }, n = function(t3) {
            return document.head.querySelector("meta[name=" + t3 + "]");
          }, s = function(t3) {
            var e2, n2, i2;
            n2 = {};
            for (e2 in t3)
              i2 = t3[e2], n2[e2] = typeof i2 == "function" ? { value: i2 } : i2;
            return n2;
          }, a = function() {
            var t3;
            return t3 = function(t4) {
              var e2, n2, i2, o2, r2;
              for (e2 = {}, r2 = ["initialize", "connect", "disconnect"], n2 = 0, o2 = r2.length; o2 > n2; n2++)
                i2 = r2[n2], e2[i2] = t4[i2], delete t4[i2];
              return e2;
            }, window.customElements ? function(e2) {
              var n2, i2, o2, r2, s2;
              return s2 = t3(e2), o2 = s2.initialize, n2 = s2.connect, i2 = s2.disconnect, o2 && (r2 = n2, n2 = function() {
                return this.initialized || (this.initialized = true, o2.call(this)), r2 != null ? r2.call(this) : void 0;
              }), n2 && (e2.connectedCallback = n2), i2 && (e2.disconnectedCallback = i2), e2;
            } : function(e2) {
              var n2, i2, o2, r2;
              return r2 = t3(e2), o2 = r2.initialize, n2 = r2.connect, i2 = r2.disconnect, o2 && (e2.createdCallback = o2), n2 && (e2.attachedCallback = n2), i2 && (e2.detachedCallback = i2), e2;
            };
          }(), r = function() {
            return window.customElements ? function(t3, e2) {
              var n2;
              return n2 = function() {
                return typeof Reflect == "object" ? Reflect.construct(HTMLElement, [], n2) : HTMLElement.apply(this);
              }, Object.setPrototypeOf(n2.prototype, HTMLElement.prototype), Object.setPrototypeOf(n2, HTMLElement), Object.defineProperties(n2.prototype, e2), window.customElements.define(t3, n2), n2;
            } : function(t3, e2) {
              var n2, i2;
              return i2 = Object.create(HTMLElement.prototype, e2), n2 = document.registerElement(t3, { prototype: i2 }), Object.defineProperty(i2, "constructor", { value: n2 }), n2;
            };
          }();
        }.call(this), function() {
          var t2, n;
          e.extend({ getDOMSelection: function() {
            var t3;
            return t3 = window.getSelection(), t3.rangeCount > 0 ? t3 : void 0;
          }, getDOMRange: function() {
            var n2, i;
            return (n2 = (i = e.getDOMSelection()) != null ? i.getRangeAt(0) : void 0) && !t2(n2) ? n2 : void 0;
          }, setDOMRange: function(t3) {
            var n2;
            return n2 = window.getSelection(), n2.removeAllRanges(), n2.addRange(t3), e.selectionChangeObserver.update();
          } }), t2 = function(t3) {
            return n(t3.startContainer) || n(t3.endContainer);
          }, n = function(t3) {
            return !Object.getPrototypeOf(t3);
          };
        }.call(this), function() {
          var t2;
          t2 = { "application/x-trix-feature-detection": "test" }, e.extend({ dataTransferIsPlainText: function(t3) {
            var e2, n, i;
            return i = t3.getData("text/plain"), n = t3.getData("text/html"), i && n ? (e2 = new DOMParser().parseFromString(n, "text/html").body, e2.textContent === i ? !e2.querySelector("*") : void 0) : i != null ? i.length : void 0;
          }, dataTransferIsWritable: function(e2) {
            var n, i;
            if ((e2 != null ? e2.setData : void 0) != null) {
              for (n in t2)
                if (i = t2[n], !function() {
                  try {
                    return e2.setData(n, i), e2.getData(n) === i;
                  } catch (t3) {
                  }
                }())
                  return;
              return true;
            }
          }, keyEventIsKeyboardCommand: function() {
            return /Mac|^iP/.test(navigator.platform) ? function(t3) {
              return t3.metaKey;
            } : function(t3) {
              return t3.ctrlKey;
            };
          }() });
        }.call(this), function() {
          e.extend({ RTL_PATTERN: /[\u05BE\u05C0\u05C3\u05D0-\u05EA\u05F0-\u05F4\u061B\u061F\u0621-\u063A\u0640-\u064A\u066D\u0671-\u06B7\u06BA-\u06BE\u06C0-\u06CE\u06D0-\u06D5\u06E5\u06E6\u200F\u202B\u202E\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE72\uFE74\uFE76-\uFEFC]/, getDirection: function() {
            var t2, n, i, o;
            return n = e.makeElement("input", { dir: "auto", name: "x", dirName: "x.dir" }), t2 = e.makeElement("form"), t2.appendChild(n), i = function() {
              try {
                return new FormData(t2).has(n.dirName);
              } catch (e2) {
              }
            }(), o = function() {
              try {
                return n.matches(":dir(ltr),:dir(rtl)");
              } catch (t3) {
              }
            }(), i ? function(e2) {
              return n.value = e2, new FormData(t2).get(n.dirName);
            } : o ? function(t3) {
              return n.value = t3, n.matches(":dir(rtl)") ? "rtl" : "ltr";
            } : function(t3) {
              var n2;
              return n2 = t3.trim().charAt(0), e.RTL_PATTERN.test(n2) ? "rtl" : "ltr";
            };
          }() });
        }.call(this), function() {
        }.call(this), function() {
          var t2, n = function(t3, e2) {
            function n2() {
              this.constructor = t3;
            }
            for (var o in e2)
              i.call(e2, o) && (t3[o] = e2[o]);
            return n2.prototype = e2.prototype, t3.prototype = new n2(), t3.__super__ = e2.prototype, t3;
          }, i = {}.hasOwnProperty;
          t2 = e.arraysAreEqual, e.Hash = function(i2) {
            function o(t3) {
              t3 == null && (t3 = {}), this.values = s(t3), o.__super__.constructor.apply(this, arguments);
            }
            var r, s, a, u, c;
            return n(o, i2), o.fromCommonAttributesOfObjects = function(t3) {
              var e2, n2, i3, o2, s2, a2;
              if (t3 == null && (t3 = []), !t3.length)
                return new this();
              for (e2 = r(t3[0]), i3 = e2.getKeys(), a2 = t3.slice(1), n2 = 0, o2 = a2.length; o2 > n2; n2++)
                s2 = a2[n2], i3 = e2.getKeysCommonToHash(r(s2)), e2 = e2.slice(i3);
              return e2;
            }, o.box = function(t3) {
              return r(t3);
            }, o.prototype.add = function(t3, e2) {
              return this.merge(u(t3, e2));
            }, o.prototype.remove = function(t3) {
              return new e.Hash(s(this.values, t3));
            }, o.prototype.get = function(t3) {
              return this.values[t3];
            }, o.prototype.has = function(t3) {
              return t3 in this.values;
            }, o.prototype.merge = function(t3) {
              return new e.Hash(a(this.values, c(t3)));
            }, o.prototype.slice = function(t3) {
              var n2, i3, o2, r2;
              for (r2 = {}, n2 = 0, o2 = t3.length; o2 > n2; n2++)
                i3 = t3[n2], this.has(i3) && (r2[i3] = this.values[i3]);
              return new e.Hash(r2);
            }, o.prototype.getKeys = function() {
              return Object.keys(this.values);
            }, o.prototype.getKeysCommonToHash = function(t3) {
              var e2, n2, i3, o2, s2;
              for (t3 = r(t3), o2 = this.getKeys(), s2 = [], e2 = 0, i3 = o2.length; i3 > e2; e2++)
                n2 = o2[e2], this.values[n2] === t3.values[n2] && s2.push(n2);
              return s2;
            }, o.prototype.isEqualTo = function(e2) {
              return t2(this.toArray(), r(e2).toArray());
            }, o.prototype.isEmpty = function() {
              return this.getKeys().length === 0;
            }, o.prototype.toArray = function() {
              var t3, e2, n2;
              return (this.array != null ? this.array : this.array = function() {
                var i3;
                e2 = [], i3 = this.values;
                for (t3 in i3)
                  n2 = i3[t3], e2.push(t3, n2);
                return e2;
              }.call(this)).slice(0);
            }, o.prototype.toObject = function() {
              return s(this.values);
            }, o.prototype.toJSON = function() {
              return this.toObject();
            }, o.prototype.contentsForInspection = function() {
              return { values: JSON.stringify(this.values) };
            }, u = function(t3, e2) {
              var n2;
              return n2 = {}, n2[t3] = e2, n2;
            }, a = function(t3, e2) {
              var n2, i3, o2;
              i3 = s(t3);
              for (n2 in e2)
                o2 = e2[n2], i3[n2] = o2;
              return i3;
            }, s = function(t3, e2) {
              var n2, i3, o2, r2, s2;
              for (r2 = {}, s2 = Object.keys(t3).sort(), n2 = 0, o2 = s2.length; o2 > n2; n2++)
                i3 = s2[n2], i3 !== e2 && (r2[i3] = t3[i3]);
              return r2;
            }, r = function(t3) {
              return t3 instanceof e.Hash ? t3 : new e.Hash(t3);
            }, c = function(t3) {
              return t3 instanceof e.Hash ? t3.values : t3;
            }, o;
          }(e.Object);
        }.call(this), function() {
          e.ObjectGroup = function() {
            function t2(t3, e2) {
              var n, i;
              this.objects = t3 != null ? t3 : [], i = e2.depth, n = e2.asTree, n && (this.depth = i, this.objects = this.constructor.groupObjects(this.objects, { asTree: n, depth: this.depth + 1 }));
            }
            return t2.groupObjects = function(t3, e2) {
              var n, i, o, r, s, a, u, c, l;
              for (t3 == null && (t3 = []), l = e2 != null ? e2 : {}, o = l.depth, n = l.asTree, n && o == null && (o = 0), c = [], s = 0, a = t3.length; a > s; s++) {
                if (u = t3[s], r) {
                  if ((typeof u.canBeGrouped == "function" ? u.canBeGrouped(o) : void 0) && (typeof (i = r[r.length - 1]).canBeGroupedWith == "function" ? i.canBeGroupedWith(u, o) : void 0)) {
                    r.push(u);
                    continue;
                  }
                  c.push(new this(r, { depth: o, asTree: n })), r = null;
                }
                (typeof u.canBeGrouped == "function" ? u.canBeGrouped(o) : void 0) ? r = [u] : c.push(u);
              }
              return r && c.push(new this(r, { depth: o, asTree: n })), c;
            }, t2.prototype.getObjects = function() {
              return this.objects;
            }, t2.prototype.getDepth = function() {
              return this.depth;
            }, t2.prototype.getCacheKey = function() {
              var t3, e2, n, i, o;
              for (e2 = ["objectGroup"], o = this.getObjects(), t3 = 0, n = o.length; n > t3; t3++)
                i = o[t3], e2.push(i.getCacheKey());
              return e2.join("/");
            }, t2;
          }();
        }.call(this), function() {
          var t2 = function(t3, e2) {
            function i() {
              this.constructor = t3;
            }
            for (var o in e2)
              n.call(e2, o) && (t3[o] = e2[o]);
            return i.prototype = e2.prototype, t3.prototype = new i(), t3.__super__ = e2.prototype, t3;
          }, n = {}.hasOwnProperty;
          e.ObjectMap = function(e2) {
            function n2(t3) {
              var e3, n3, i, o, r;
              for (t3 == null && (t3 = []), this.objects = {}, i = 0, o = t3.length; o > i; i++)
                r = t3[i], n3 = JSON.stringify(r), (e3 = this.objects)[n3] == null && (e3[n3] = r);
            }
            return t2(n2, e2), n2.prototype.find = function(t3) {
              var e3;
              return e3 = JSON.stringify(t3), this.objects[e3];
            }, n2;
          }(e.BasicObject);
        }.call(this), function() {
          e.ElementStore = function() {
            function t2(t3) {
              this.reset(t3);
            }
            var e2;
            return t2.prototype.add = function(t3) {
              var n;
              return n = e2(t3), this.elements[n] = t3;
            }, t2.prototype.remove = function(t3) {
              var n, i;
              return n = e2(t3), (i = this.elements[n]) ? (delete this.elements[n], i) : void 0;
            }, t2.prototype.reset = function(t3) {
              var e3, n, i;
              for (t3 == null && (t3 = []), this.elements = {}, n = 0, i = t3.length; i > n; n++)
                e3 = t3[n], this.add(e3);
              return t3;
            }, e2 = function(t3) {
              return t3.dataset.trixStoreKey;
            }, t2;
          }();
        }.call(this), function() {
        }.call(this), function() {
          var t2 = function(t3, e2) {
            function i() {
              this.constructor = t3;
            }
            for (var o in e2)
              n.call(e2, o) && (t3[o] = e2[o]);
            return i.prototype = e2.prototype, t3.prototype = new i(), t3.__super__ = e2.prototype, t3;
          }, n = {}.hasOwnProperty;
          e.Operation = function(e2) {
            function n2() {
              return n2.__super__.constructor.apply(this, arguments);
            }
            return t2(n2, e2), n2.prototype.isPerforming = function() {
              return this.performing === true;
            }, n2.prototype.hasPerformed = function() {
              return this.performed === true;
            }, n2.prototype.hasSucceeded = function() {
              return this.performed && this.succeeded;
            }, n2.prototype.hasFailed = function() {
              return this.performed && !this.succeeded;
            }, n2.prototype.getPromise = function() {
              return this.promise != null ? this.promise : this.promise = new Promise(function(t3) {
                return function(e3, n3) {
                  return t3.performing = true, t3.perform(function(i, o) {
                    return t3.succeeded = i, t3.performing = false, t3.performed = true, t3.succeeded ? e3(o) : n3(o);
                  });
                };
              }(this));
            }, n2.prototype.perform = function(t3) {
              return t3(false);
            }, n2.prototype.release = function() {
              var t3;
              return (t3 = this.promise) != null && typeof t3.cancel == "function" && t3.cancel(), this.promise = null, this.performing = null, this.performed = null, this.succeeded = null;
            }, n2.proxyMethod("getPromise().then"), n2.proxyMethod("getPromise().catch"), n2;
          }(e.BasicObject);
        }.call(this), function() {
          var t2, n, i, o, r, s = function(t3, e2) {
            function n2() {
              this.constructor = t3;
            }
            for (var i2 in e2)
              a.call(e2, i2) && (t3[i2] = e2[i2]);
            return n2.prototype = e2.prototype, t3.prototype = new n2(), t3.__super__ = e2.prototype, t3;
          }, a = {}.hasOwnProperty;
          e.UTF16String = function(t3) {
            function e2(t4, e3) {
              this.ucs2String = t4, this.codepoints = e3, this.length = this.codepoints.length, this.ucs2Length = this.ucs2String.length;
            }
            return s(e2, t3), e2.box = function(t4) {
              return t4 == null && (t4 = ""), t4 instanceof this ? t4 : this.fromUCS2String(t4 != null ? t4.toString() : void 0);
            }, e2.fromUCS2String = function(t4) {
              return new this(t4, o(t4));
            }, e2.fromCodepoints = function(t4) {
              return new this(r(t4), t4);
            }, e2.prototype.offsetToUCS2Offset = function(t4) {
              return r(this.codepoints.slice(0, Math.max(0, t4))).length;
            }, e2.prototype.offsetFromUCS2Offset = function(t4) {
              return o(this.ucs2String.slice(0, Math.max(0, t4))).length;
            }, e2.prototype.slice = function() {
              var t4;
              return this.constructor.fromCodepoints((t4 = this.codepoints).slice.apply(t4, arguments));
            }, e2.prototype.charAt = function(t4) {
              return this.slice(t4, t4 + 1);
            }, e2.prototype.isEqualTo = function(t4) {
              return this.constructor.box(t4).ucs2String === this.ucs2String;
            }, e2.prototype.toJSON = function() {
              return this.ucs2String;
            }, e2.prototype.getCacheKey = function() {
              return this.ucs2String;
            }, e2.prototype.toString = function() {
              return this.ucs2String;
            }, e2;
          }(e.BasicObject), t2 = (typeof Array.from == "function" ? Array.from("\u{1F47C}").length : void 0) === 1, n = (typeof " ".codePointAt == "function" ? " ".codePointAt(0) : void 0) != null, i = (typeof String.fromCodePoint == "function" ? String.fromCodePoint(32, 128124) : void 0) === " \u{1F47C}", o = t2 && n ? function(t3) {
            return Array.from(t3).map(function(t4) {
              return t4.codePointAt(0);
            });
          } : function(t3) {
            var e2, n2, i2, o2, r2;
            for (o2 = [], e2 = 0, i2 = t3.length; i2 > e2; )
              r2 = t3.charCodeAt(e2++), r2 >= 55296 && 56319 >= r2 && i2 > e2 && (n2 = t3.charCodeAt(e2++), (64512 & n2) === 56320 ? r2 = ((1023 & r2) << 10) + (1023 & n2) + 65536 : e2--), o2.push(r2);
            return o2;
          }, r = i ? function(t3) {
            return String.fromCodePoint.apply(String, t3);
          } : function(t3) {
            var e2, n2, i2;
            return e2 = function() {
              var e3, o2, r2;
              for (r2 = [], e3 = 0, o2 = t3.length; o2 > e3; e3++)
                i2 = t3[e3], n2 = "", i2 > 65535 && (i2 -= 65536, n2 += String.fromCharCode(i2 >>> 10 & 1023 | 55296), i2 = 56320 | 1023 & i2), r2.push(n2 + String.fromCharCode(i2));
              return r2;
            }(), e2.join("");
          };
        }.call(this), function() {
        }.call(this), function() {
        }.call(this), function() {
          e.config.lang = { attachFiles: "Attach Files", bold: "Bold", bullets: "Bullets", byte: "Byte", bytes: "Bytes", captionPlaceholder: "Add a caption\u2026", code: "Code", heading1: "Heading", indent: "Increase Level", italic: "Italic", link: "Link", numbers: "Numbers", outdent: "Decrease Level", quote: "Quote", redo: "Redo", remove: "Remove", strike: "Strikethrough", undo: "Undo", unlink: "Unlink", url: "URL", urlPlaceholder: "Enter a URL\u2026", GB: "GB", KB: "KB", MB: "MB", PB: "PB", TB: "TB" };
        }.call(this), function() {
          e.config.css = { attachment: "attachment", attachmentCaption: "attachment__caption", attachmentCaptionEditor: "attachment__caption-editor", attachmentMetadata: "attachment__metadata", attachmentMetadataContainer: "attachment__metadata-container", attachmentName: "attachment__name", attachmentProgress: "attachment__progress", attachmentSize: "attachment__size", attachmentToolbar: "attachment__toolbar", attachmentGallery: "attachment-gallery" };
        }.call(this), function() {
          var t2;
          e.config.blockAttributes = t2 = { default: { tagName: "div", parse: false }, quote: { tagName: "blockquote", nestable: true }, heading1: { tagName: "h1", terminal: true, breakOnReturn: true, group: false }, code: { tagName: "pre", terminal: true, text: { plaintext: true } }, bulletList: { tagName: "ul", parse: false }, bullet: { tagName: "li", listAttribute: "bulletList", group: false, nestable: true, test: function(n) {
            return e.tagName(n.parentNode) === t2[this.listAttribute].tagName;
          } }, numberList: { tagName: "ol", parse: false }, number: { tagName: "li", listAttribute: "numberList", group: false, nestable: true, test: function(n) {
            return e.tagName(n.parentNode) === t2[this.listAttribute].tagName;
          } }, attachmentGallery: { tagName: "div", exclusive: true, terminal: true, parse: false, group: false } };
        }.call(this), function() {
          var t2, n;
          t2 = e.config.lang, n = [t2.bytes, t2.KB, t2.MB, t2.GB, t2.TB, t2.PB], e.config.fileSize = { prefix: "IEC", precision: 2, formatter: function(e2) {
            var i, o, r, s, a;
            switch (e2) {
              case 0:
                return "0 " + t2.bytes;
              case 1:
                return "1 " + t2.byte;
              default:
                return i = function() {
                  switch (this.prefix) {
                    case "SI":
                      return 1e3;
                    case "IEC":
                      return 1024;
                  }
                }.call(this), o = Math.floor(Math.log(e2) / Math.log(i)), r = e2 / Math.pow(i, o), s = r.toFixed(this.precision), a = s.replace(/0*$/, "").replace(/\.$/, ""), a + " " + n[o];
            }
          } };
        }.call(this), function() {
          e.config.textAttributes = { bold: { tagName: "strong", inheritable: true, parser: function(t2) {
            var e2;
            return e2 = window.getComputedStyle(t2), e2.fontWeight === "bold" || e2.fontWeight >= 600;
          } }, italic: { tagName: "em", inheritable: true, parser: function(t2) {
            var e2;
            return e2 = window.getComputedStyle(t2), e2.fontStyle === "italic";
          } }, href: { groupTagName: "a", parser: function(t2) {
            var n, i, o;
            return n = e.AttachmentView.attachmentSelector, o = "a:not(" + n + ")", (i = e.findClosestElementFromNode(t2, { matchingSelector: o })) ? i.getAttribute("href") : void 0;
          } }, strike: { tagName: "del", inheritable: true }, frozen: { style: { backgroundColor: "highlight" } } };
        }.call(this), function() {
          var t2, n, i, o, r;
          r = "[data-trix-serialize=false]", o = ["contenteditable", "data-trix-id", "data-trix-store-key", "data-trix-mutable", "data-trix-placeholder", "tabindex"], n = "data-trix-serialized-attributes", i = "[" + n + "]", t2 = new RegExp("<!--block-->", "g"), e.extend({ serializers: { "application/json": function(t3) {
            var n2;
            if (t3 instanceof e.Document)
              n2 = t3;
            else {
              if (!(t3 instanceof HTMLElement))
                throw new Error("unserializable object");
              n2 = e.Document.fromHTML(t3.innerHTML);
            }
            return n2.toSerializableDocument().toJSONString();
          }, "text/html": function(s) {
            var a, u, c, l, h, p, d, f, g, m, v, y, b, A, C, x, w;
            if (s instanceof e.Document)
              l = e.DocumentView.render(s);
            else {
              if (!(s instanceof HTMLElement))
                throw new Error("unserializable object");
              l = s.cloneNode(true);
            }
            for (A = l.querySelectorAll(r), h = 0, g = A.length; g > h; h++)
              c = A[h], e.removeNode(c);
            for (p = 0, m = o.length; m > p; p++)
              for (a = o[p], C = l.querySelectorAll("[" + a + "]"), d = 0, v = C.length; v > d; d++)
                c = C[d], c.removeAttribute(a);
            for (x = l.querySelectorAll(i), f = 0, y = x.length; y > f; f++) {
              c = x[f];
              try {
                u = JSON.parse(c.getAttribute(n)), c.removeAttribute(n);
                for (b in u)
                  w = u[b], c.setAttribute(b, w);
              } catch (E) {
              }
            }
            return l.innerHTML.replace(t2, "");
          } }, deserializers: { "application/json": function(t3) {
            return e.Document.fromJSONString(t3);
          }, "text/html": function(t3) {
            return e.Document.fromHTML(t3);
          } }, serializeToContentType: function(t3, n2) {
            var i2;
            if (i2 = e.serializers[n2])
              return i2(t3);
            throw new Error("unknown content type: " + n2);
          }, deserializeFromContentType: function(t3, n2) {
            var i2;
            if (i2 = e.deserializers[n2])
              return i2(t3);
            throw new Error("unknown content type: " + n2);
          } });
        }.call(this), function() {
          var t2;
          t2 = e.config.lang, e.config.toolbar = { getDefaultHTML: function() {
            return '<div class="trix-button-row">\n  <span class="trix-button-group trix-button-group--text-tools" data-trix-button-group="text-tools">\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-bold" data-trix-attribute="bold" data-trix-key="b" title="' + t2.bold + '" tabindex="-1">' + t2.bold + '</button>\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-italic" data-trix-attribute="italic" data-trix-key="i" title="' + t2.italic + '" tabindex="-1">' + t2.italic + '</button>\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-strike" data-trix-attribute="strike" title="' + t2.strike + '" tabindex="-1">' + t2.strike + '</button>\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-link" data-trix-attribute="href" data-trix-action="link" data-trix-key="k" title="' + t2.link + '" tabindex="-1">' + t2.link + '</button>\n  </span>\n\n  <span class="trix-button-group trix-button-group--block-tools" data-trix-button-group="block-tools">\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-heading-1" data-trix-attribute="heading1" title="' + t2.heading1 + '" tabindex="-1">' + t2.heading1 + '</button>\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-quote" data-trix-attribute="quote" title="' + t2.quote + '" tabindex="-1">' + t2.quote + '</button>\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-code" data-trix-attribute="code" title="' + t2.code + '" tabindex="-1">' + t2.code + '</button>\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-bullet-list" data-trix-attribute="bullet" title="' + t2.bullets + '" tabindex="-1">' + t2.bullets + '</button>\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-number-list" data-trix-attribute="number" title="' + t2.numbers + '" tabindex="-1">' + t2.numbers + '</button>\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-decrease-nesting-level" data-trix-action="decreaseNestingLevel" title="' + t2.outdent + '" tabindex="-1">' + t2.outdent + '</button>\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-increase-nesting-level" data-trix-action="increaseNestingLevel" title="' + t2.indent + '" tabindex="-1">' + t2.indent + '</button>\n  </span>\n\n  <span class="trix-button-group trix-button-group--file-tools" data-trix-button-group="file-tools">\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-attach" data-trix-action="attachFiles" title="' + t2.attachFiles + '" tabindex="-1">' + t2.attachFiles + '</button>\n  </span>\n\n  <span class="trix-button-group-spacer"></span>\n\n  <span class="trix-button-group trix-button-group--history-tools" data-trix-button-group="history-tools">\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-undo" data-trix-action="undo" data-trix-key="z" title="' + t2.undo + '" tabindex="-1">' + t2.undo + '</button>\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-redo" data-trix-action="redo" data-trix-key="shift+z" title="' + t2.redo + '" tabindex="-1">' + t2.redo + '</button>\n  </span>\n</div>\n\n<div class="trix-dialogs" data-trix-dialogs>\n  <div class="trix-dialog trix-dialog--link" data-trix-dialog="href" data-trix-dialog-attribute="href">\n    <div class="trix-dialog__link-fields">\n      <input type="url" name="href" class="trix-input trix-input--dialog" placeholder="' + t2.urlPlaceholder + '" aria-label="' + t2.url + '" required data-trix-input>\n      <div class="trix-button-group">\n        <input type="button" class="trix-button trix-button--dialog" value="' + t2.link + '" data-trix-method="setAttribute">\n        <input type="button" class="trix-button trix-button--dialog" value="' + t2.unlink + '" data-trix-method="removeAttribute">\n      </div>\n    </div>\n  </div>\n</div>';
          } };
        }.call(this), function() {
          e.config.undoInterval = 5e3;
        }.call(this), function() {
          e.config.attachments = { preview: { presentation: "gallery", caption: { name: true, size: true } }, file: { caption: { size: true } } };
        }.call(this), function() {
          e.config.keyNames = { 8: "backspace", 9: "tab", 13: "return", 27: "escape", 37: "left", 39: "right", 46: "delete", 68: "d", 72: "h", 79: "o" };
        }.call(this), function() {
          e.config.input = { level2Enabled: true, getLevel: function() {
            return this.level2Enabled && e.browser.supportsInputEvents ? 2 : 0;
          }, pickFiles: function(t2) {
            var n;
            return n = e.makeElement("input", { type: "file", multiple: true, hidden: true, id: this.fileInputId }), n.addEventListener("change", function() {
              return t2(n.files), e.removeNode(n);
            }), e.removeNode(document.getElementById(this.fileInputId)), document.body.appendChild(n), n.click();
          }, fileInputId: "trix-file-input-" + Date.now().toString(16) };
        }.call(this), function() {
        }.call(this), function() {
          e.registerElement("trix-toolbar", { defaultCSS: "%t {\n  display: block;\n}\n\n%t {\n  white-space: nowrap;\n}\n\n%t [data-trix-dialog] {\n  display: none;\n}\n\n%t [data-trix-dialog][data-trix-active] {\n  display: block;\n}\n\n%t [data-trix-dialog] [data-trix-validate]:invalid {\n  background-color: #ffdddd;\n}", initialize: function() {
            return this.innerHTML === "" ? this.innerHTML = e.config.toolbar.getDefaultHTML() : void 0;
          } });
        }.call(this), function() {
          var t2 = function(t3, e2) {
            function i2() {
              this.constructor = t3;
            }
            for (var o in e2)
              n.call(e2, o) && (t3[o] = e2[o]);
            return i2.prototype = e2.prototype, t3.prototype = new i2(), t3.__super__ = e2.prototype, t3;
          }, n = {}.hasOwnProperty, i = [].indexOf || function(t3) {
            for (var e2 = 0, n2 = this.length; n2 > e2; e2++)
              if (e2 in this && this[e2] === t3)
                return e2;
            return -1;
          };
          e.ObjectView = function(n2) {
            function o(t3, e2) {
              this.object = t3, this.options = e2 != null ? e2 : {}, this.childViews = [], this.rootView = this;
            }
            return t2(o, n2), o.prototype.getNodes = function() {
              var t3, e2, n3, i2, o2;
              for (this.nodes == null && (this.nodes = this.createNodes()), i2 = this.nodes, o2 = [], t3 = 0, e2 = i2.length; e2 > t3; t3++)
                n3 = i2[t3], o2.push(n3.cloneNode(true));
              return o2;
            }, o.prototype.invalidate = function() {
              var t3;
              return this.nodes = null, this.childViews = [], (t3 = this.parentView) != null ? t3.invalidate() : void 0;
            }, o.prototype.invalidateViewForObject = function(t3) {
              var e2;
              return (e2 = this.findViewForObject(t3)) != null ? e2.invalidate() : void 0;
            }, o.prototype.findOrCreateCachedChildView = function(t3, e2) {
              var n3;
              return (n3 = this.getCachedViewForObject(e2)) ? this.recordChildView(n3) : (n3 = this.createChildView.apply(this, arguments), this.cacheViewForObject(n3, e2)), n3;
            }, o.prototype.createChildView = function(t3, n3, i2) {
              var o2;
              return i2 == null && (i2 = {}), n3 instanceof e.ObjectGroup && (i2.viewClass = t3, t3 = e.ObjectGroupView), o2 = new t3(n3, i2), this.recordChildView(o2);
            }, o.prototype.recordChildView = function(t3) {
              return t3.parentView = this, t3.rootView = this.rootView, this.childViews.push(t3), t3;
            }, o.prototype.getAllChildViews = function() {
              var t3, e2, n3, i2, o2;
              for (o2 = [], i2 = this.childViews, e2 = 0, n3 = i2.length; n3 > e2; e2++)
                t3 = i2[e2], o2.push(t3), o2 = o2.concat(t3.getAllChildViews());
              return o2;
            }, o.prototype.findElement = function() {
              return this.findElementForObject(this.object);
            }, o.prototype.findElementForObject = function(t3) {
              var e2;
              return (e2 = t3 != null ? t3.id : void 0) ? this.rootView.element.querySelector("[data-trix-id='" + e2 + "']") : void 0;
            }, o.prototype.findViewForObject = function(t3) {
              var e2, n3, i2, o2;
              for (i2 = this.getAllChildViews(), e2 = 0, n3 = i2.length; n3 > e2; e2++)
                if (o2 = i2[e2], o2.object === t3)
                  return o2;
            }, o.prototype.getViewCache = function() {
              return this.rootView !== this ? this.rootView.getViewCache() : this.isViewCachingEnabled() ? this.viewCache != null ? this.viewCache : this.viewCache = {} : void 0;
            }, o.prototype.isViewCachingEnabled = function() {
              return this.shouldCacheViews !== false;
            }, o.prototype.enableViewCaching = function() {
              return this.shouldCacheViews = true;
            }, o.prototype.disableViewCaching = function() {
              return this.shouldCacheViews = false;
            }, o.prototype.getCachedViewForObject = function(t3) {
              var e2;
              return (e2 = this.getViewCache()) != null ? e2[t3.getCacheKey()] : void 0;
            }, o.prototype.cacheViewForObject = function(t3, e2) {
              var n3;
              return (n3 = this.getViewCache()) != null ? n3[e2.getCacheKey()] = t3 : void 0;
            }, o.prototype.garbageCollectCachedViews = function() {
              var t3, e2, n3, o2, r, s;
              if (t3 = this.getViewCache()) {
                s = this.getAllChildViews().concat(this), n3 = function() {
                  var t4, e3, n4;
                  for (n4 = [], t4 = 0, e3 = s.length; e3 > t4; t4++)
                    r = s[t4], n4.push(r.object.getCacheKey());
                  return n4;
                }(), o2 = [];
                for (e2 in t3)
                  i.call(n3, e2) < 0 && o2.push(delete t3[e2]);
                return o2;
              }
            }, o;
          }(e.BasicObject);
        }.call(this), function() {
          var t2 = function(t3, e2) {
            function i() {
              this.constructor = t3;
            }
            for (var o in e2)
              n.call(e2, o) && (t3[o] = e2[o]);
            return i.prototype = e2.prototype, t3.prototype = new i(), t3.__super__ = e2.prototype, t3;
          }, n = {}.hasOwnProperty;
          e.ObjectGroupView = function(e2) {
            function n2() {
              n2.__super__.constructor.apply(this, arguments), this.objectGroup = this.object, this.viewClass = this.options.viewClass, delete this.options.viewClass;
            }
            return t2(n2, e2), n2.prototype.getChildViews = function() {
              var t3, e3, n3, i;
              if (!this.childViews.length)
                for (i = this.objectGroup.getObjects(), t3 = 0, e3 = i.length; e3 > t3; t3++)
                  n3 = i[t3], this.findOrCreateCachedChildView(this.viewClass, n3, this.options);
              return this.childViews;
            }, n2.prototype.createNodes = function() {
              var t3, e3, n3, i, o, r, s, a, u;
              for (t3 = this.createContainerElement(), s = this.getChildViews(), e3 = 0, i = s.length; i > e3; e3++)
                for (u = s[e3], a = u.getNodes(), n3 = 0, o = a.length; o > n3; n3++)
                  r = a[n3], t3.appendChild(r);
              return [t3];
            }, n2.prototype.createContainerElement = function(t3) {
              return t3 == null && (t3 = this.objectGroup.getDepth()), this.getChildViews()[0].createContainerElement(t3);
            }, n2;
          }(e.ObjectView);
        }.call(this), function() {
          var t2 = function(t3, e2) {
            function i() {
              this.constructor = t3;
            }
            for (var o in e2)
              n.call(e2, o) && (t3[o] = e2[o]);
            return i.prototype = e2.prototype, t3.prototype = new i(), t3.__super__ = e2.prototype, t3;
          }, n = {}.hasOwnProperty;
          e.Controller = function(e2) {
            function n2() {
              return n2.__super__.constructor.apply(this, arguments);
            }
            return t2(n2, e2), n2;
          }(e.BasicObject);
        }.call(this), function() {
          var t2, n, i, o, r, s, a = function(t3, e2) {
            return function() {
              return t3.apply(e2, arguments);
            };
          }, u = function(t3, e2) {
            function n2() {
              this.constructor = t3;
            }
            for (var i2 in e2)
              c.call(e2, i2) && (t3[i2] = e2[i2]);
            return n2.prototype = e2.prototype, t3.prototype = new n2(), t3.__super__ = e2.prototype, t3;
          }, c = {}.hasOwnProperty, l = [].indexOf || function(t3) {
            for (var e2 = 0, n2 = this.length; n2 > e2; e2++)
              if (e2 in this && this[e2] === t3)
                return e2;
            return -1;
          };
          t2 = e.findClosestElementFromNode, i = e.nodeIsEmptyTextNode, n = e.nodeIsBlockStartComment, o = e.normalizeSpaces, r = e.summarizeStringChange, s = e.tagName, e.MutationObserver = function(e2) {
            function c2(t3) {
              this.element = t3, this.didMutate = a(this.didMutate, this), this.observer = new window.MutationObserver(this.didMutate), this.start();
            }
            var h, p, d, f;
            return u(c2, e2), p = "data-trix-mutable", d = "[" + p + "]", f = { attributes: true, childList: true, characterData: true, characterDataOldValue: true, subtree: true }, c2.prototype.start = function() {
              return this.reset(), this.observer.observe(this.element, f);
            }, c2.prototype.stop = function() {
              return this.observer.disconnect();
            }, c2.prototype.didMutate = function(t3) {
              var e3, n2;
              return (e3 = this.mutations).push.apply(e3, this.findSignificantMutations(t3)), this.mutations.length ? ((n2 = this.delegate) != null && typeof n2.elementDidMutate == "function" && n2.elementDidMutate(this.getMutationSummary()), this.reset()) : void 0;
            }, c2.prototype.reset = function() {
              return this.mutations = [];
            }, c2.prototype.findSignificantMutations = function(t3) {
              var e3, n2, i2, o2;
              for (o2 = [], e3 = 0, n2 = t3.length; n2 > e3; e3++)
                i2 = t3[e3], this.mutationIsSignificant(i2) && o2.push(i2);
              return o2;
            }, c2.prototype.mutationIsSignificant = function(t3) {
              var e3, n2, i2, o2;
              if (this.nodeIsMutable(t3.target))
                return false;
              for (o2 = this.nodesModifiedByMutation(t3), e3 = 0, n2 = o2.length; n2 > e3; e3++)
                if (i2 = o2[e3], this.nodeIsSignificant(i2))
                  return true;
              return false;
            }, c2.prototype.nodeIsSignificant = function(t3) {
              return t3 !== this.element && !this.nodeIsMutable(t3) && !i(t3);
            }, c2.prototype.nodeIsMutable = function(e3) {
              return t2(e3, { matchingSelector: d });
            }, c2.prototype.nodesModifiedByMutation = function(t3) {
              var e3;
              switch (e3 = [], t3.type) {
                case "attributes":
                  t3.attributeName !== p && e3.push(t3.target);
                  break;
                case "characterData":
                  e3.push(t3.target.parentNode), e3.push(t3.target);
                  break;
                case "childList":
                  e3.push.apply(e3, t3.addedNodes), e3.push.apply(e3, t3.removedNodes);
              }
              return e3;
            }, c2.prototype.getMutationSummary = function() {
              return this.getTextMutationSummary();
            }, c2.prototype.getTextMutationSummary = function() {
              var t3, e3, n2, i2, o2, r2, s2, a2, u2, c3, h2;
              for (a2 = this.getTextChangesFromCharacterData(), n2 = a2.additions, o2 = a2.deletions, h2 = this.getTextChangesFromChildList(), u2 = h2.additions, r2 = 0, s2 = u2.length; s2 > r2; r2++)
                e3 = u2[r2], l.call(n2, e3) < 0 && n2.push(e3);
              return o2.push.apply(o2, h2.deletions), c3 = {}, (t3 = n2.join("")) && (c3.textAdded = t3), (i2 = o2.join("")) && (c3.textDeleted = i2), c3;
            }, c2.prototype.getMutationsByType = function(t3) {
              var e3, n2, i2, o2, r2;
              for (o2 = this.mutations, r2 = [], e3 = 0, n2 = o2.length; n2 > e3; e3++)
                i2 = o2[e3], i2.type === t3 && r2.push(i2);
              return r2;
            }, c2.prototype.getTextChangesFromChildList = function() {
              var t3, e3, i2, r2, s2, a2, u2, c3, l2, p2, d2;
              for (t3 = [], u2 = [], a2 = this.getMutationsByType("childList"), e3 = 0, r2 = a2.length; r2 > e3; e3++)
                s2 = a2[e3], t3.push.apply(t3, s2.addedNodes), u2.push.apply(u2, s2.removedNodes);
              return c3 = t3.length === 0 && u2.length === 1 && n(u2[0]), c3 ? (p2 = [], d2 = ["\n"]) : (p2 = h(t3), d2 = h(u2)), { additions: function() {
                var t4, e4, n2;
                for (n2 = [], i2 = t4 = 0, e4 = p2.length; e4 > t4; i2 = ++t4)
                  l2 = p2[i2], l2 !== d2[i2] && n2.push(o(l2));
                return n2;
              }(), deletions: function() {
                var t4, e4, n2;
                for (n2 = [], i2 = t4 = 0, e4 = d2.length; e4 > t4; i2 = ++t4)
                  l2 = d2[i2], l2 !== p2[i2] && n2.push(o(l2));
                return n2;
              }() };
            }, c2.prototype.getTextChangesFromCharacterData = function() {
              var t3, e3, n2, i2, s2, a2, u2, c3;
              return e3 = this.getMutationsByType("characterData"), e3.length && (c3 = e3[0], n2 = e3[e3.length - 1], s2 = o(c3.oldValue), i2 = o(n2.target.data), a2 = r(s2, i2), t3 = a2.added, u2 = a2.removed), { additions: t3 ? [t3] : [], deletions: u2 ? [u2] : [] };
            }, h = function(t3) {
              var e3, n2, i2, o2;
              for (t3 == null && (t3 = []), o2 = [], e3 = 0, n2 = t3.length; n2 > e3; e3++)
                switch (i2 = t3[e3], i2.nodeType) {
                  case Node.TEXT_NODE:
                    o2.push(i2.data);
                    break;
                  case Node.ELEMENT_NODE:
                    s(i2) === "br" ? o2.push("\n") : o2.push.apply(o2, h(i2.childNodes));
                }
              return o2;
            }, c2;
          }(e.BasicObject);
        }.call(this), function() {
          var t2 = function(t3, e2) {
            function i() {
              this.constructor = t3;
            }
            for (var o in e2)
              n.call(e2, o) && (t3[o] = e2[o]);
            return i.prototype = e2.prototype, t3.prototype = new i(), t3.__super__ = e2.prototype, t3;
          }, n = {}.hasOwnProperty;
          e.FileVerificationOperation = function(e2) {
            function n2(t3) {
              this.file = t3;
            }
            return t2(n2, e2), n2.prototype.perform = function(t3) {
              var e3;
              return e3 = new FileReader(), e3.onerror = function() {
                return t3(false);
              }, e3.onload = function(n3) {
                return function() {
                  e3.onerror = null;
                  try {
                    e3.abort();
                  } catch (i) {
                  }
                  return t3(true, n3.file);
                };
              }(this), e3.readAsArrayBuffer(this.file);
            }, n2;
          }(e.Operation);
        }.call(this), function() {
          var t2, n, i = function(t3, e2) {
            function n2() {
              this.constructor = t3;
            }
            for (var i2 in e2)
              o.call(e2, i2) && (t3[i2] = e2[i2]);
            return n2.prototype = e2.prototype, t3.prototype = new n2(), t3.__super__ = e2.prototype, t3;
          }, o = {}.hasOwnProperty;
          t2 = e.handleEvent, n = e.innerElementIsActive, e.InputController = function(o2) {
            function r(n2) {
              var i2;
              this.element = n2, this.mutationObserver = new e.MutationObserver(this.element), this.mutationObserver.delegate = this;
              for (i2 in this.events)
                t2(i2, { onElement: this.element, withCallback: this.handlerFor(i2) });
            }
            return i(r, o2), r.prototype.events = {}, r.prototype.elementDidMutate = function() {
            }, r.prototype.editorWillSyncDocumentView = function() {
              return this.mutationObserver.stop();
            }, r.prototype.editorDidSyncDocumentView = function() {
              return this.mutationObserver.start();
            }, r.prototype.requestRender = function() {
              var t3;
              return (t3 = this.delegate) != null && typeof t3.inputControllerDidRequestRender == "function" ? t3.inputControllerDidRequestRender() : void 0;
            }, r.prototype.requestReparse = function() {
              var t3;
              return (t3 = this.delegate) != null && typeof t3.inputControllerDidRequestReparse == "function" && t3.inputControllerDidRequestReparse(), this.requestRender();
            }, r.prototype.attachFiles = function(t3) {
              var n2, i2;
              return i2 = function() {
                var i3, o3, r2;
                for (r2 = [], i3 = 0, o3 = t3.length; o3 > i3; i3++)
                  n2 = t3[i3], r2.push(new e.FileVerificationOperation(n2));
                return r2;
              }(), Promise.all(i2).then(function(t4) {
                return function(e2) {
                  return t4.handleInput(function() {
                    var t5, n3;
                    return (t5 = this.delegate) != null && t5.inputControllerWillAttachFiles(), (n3 = this.responder) != null && n3.insertFiles(e2), this.requestRender();
                  });
                };
              }(this));
            }, r.prototype.handlerFor = function(t3) {
              return function(e2) {
                return function(i2) {
                  return i2.defaultPrevented ? void 0 : e2.handleInput(function() {
                    return n(this.element) ? void 0 : (this.eventName = t3, this.events[t3].call(this, i2));
                  });
                };
              }(this);
            }, r.prototype.handleInput = function(t3) {
              var e2, n2;
              try {
                return (e2 = this.delegate) != null && e2.inputControllerWillHandleInput(), t3.call(this);
              } finally {
                (n2 = this.delegate) != null && n2.inputControllerDidHandleInput();
              }
            }, r.prototype.createLinkHTML = function(t3, e2) {
              var n2;
              return n2 = document.createElement("a"), n2.href = t3, n2.textContent = e2 != null ? e2 : t3, n2.outerHTML;
            }, r;
          }(e.BasicObject);
        }.call(this), function() {
          var t2, n, i, o, r, s, a, u, c, l, h, p, d, f = function(t3, e2) {
            function n2() {
              this.constructor = t3;
            }
            for (var i2 in e2)
              g.call(e2, i2) && (t3[i2] = e2[i2]);
            return n2.prototype = e2.prototype, t3.prototype = new n2(), t3.__super__ = e2.prototype, t3;
          }, g = {}.hasOwnProperty, m = [].indexOf || function(t3) {
            for (var e2 = 0, n2 = this.length; n2 > e2; e2++)
              if (e2 in this && this[e2] === t3)
                return e2;
            return -1;
          };
          c = e.makeElement, l = e.objectsAreEqual, d = e.tagName, n = e.browser, a = e.keyEventIsKeyboardCommand, o = e.dataTransferIsWritable, i = e.dataTransferIsPlainText, u = e.config.keyNames, e.Level0InputController = function(n2) {
            function s2() {
              s2.__super__.constructor.apply(this, arguments), this.resetInputSummary();
            }
            var d2;
            return f(s2, n2), d2 = 0, s2.prototype.setInputSummary = function(t3) {
              var e2, n3;
              t3 == null && (t3 = {}), this.inputSummary.eventName = this.eventName;
              for (e2 in t3)
                n3 = t3[e2], this.inputSummary[e2] = n3;
              return this.inputSummary;
            }, s2.prototype.resetInputSummary = function() {
              return this.inputSummary = {};
            }, s2.prototype.reset = function() {
              return this.resetInputSummary(), e.selectionChangeObserver.reset();
            }, s2.prototype.elementDidMutate = function(t3) {
              var e2;
              return this.isComposing() ? (e2 = this.delegate) != null && typeof e2.inputControllerDidAllowUnhandledInput == "function" ? e2.inputControllerDidAllowUnhandledInput() : void 0 : this.handleInput(function() {
                return this.mutationIsSignificant(t3) && (this.mutationIsExpected(t3) ? this.requestRender() : this.requestReparse()), this.reset();
              });
            }, s2.prototype.mutationIsExpected = function(t3) {
              var e2, n3, i2, o2, r2, s3, a2, u2, c2, l2;
              return a2 = t3.textAdded, u2 = t3.textDeleted, this.inputSummary.preferDocument ? true : (e2 = a2 != null ? a2 === this.inputSummary.textAdded : !this.inputSummary.textAdded, n3 = u2 != null ? this.inputSummary.didDelete : !this.inputSummary.didDelete, c2 = (a2 === "\n" || a2 === " \n") && !e2, l2 = u2 === "\n" && !n3, s3 = c2 && !l2 || l2 && !c2, s3 && (o2 = this.getSelectedRange()) && (i2 = c2 ? a2.replace(/\n$/, "").length || -1 : (a2 != null ? a2.length : void 0) || 1, (r2 = this.responder) != null ? r2.positionIsBlockBreak(o2[1] + i2) : void 0) ? true : e2 && n3);
            }, s2.prototype.mutationIsSignificant = function(t3) {
              var e2, n3, i2;
              return i2 = Object.keys(t3).length > 0, e2 = ((n3 = this.compositionInput) != null ? n3.getEndData() : void 0) === "", i2 || !e2;
            }, s2.prototype.events = { keydown: function(t3) {
              var n3, i2, o2, r2, s3, c2, l2, h2, p2;
              if (this.isComposing() || this.resetInputSummary(), this.inputSummary.didInput = true, r2 = u[t3.keyCode]) {
                for (i2 = this.keys, h2 = ["ctrl", "alt", "shift", "meta"], o2 = 0, c2 = h2.length; c2 > o2; o2++)
                  l2 = h2[o2], t3[l2 + "Key"] && (l2 === "ctrl" && (l2 = "control"), i2 = i2 != null ? i2[l2] : void 0);
                (i2 != null ? i2[r2] : void 0) != null && (this.setInputSummary({ keyName: r2 }), e.selectionChangeObserver.reset(), i2[r2].call(this, t3));
              }
              return a(t3) && (n3 = String.fromCharCode(t3.keyCode).toLowerCase()) && (s3 = function() {
                var e2, n4, i3, o3;
                for (i3 = ["alt", "shift"], o3 = [], e2 = 0, n4 = i3.length; n4 > e2; e2++)
                  l2 = i3[e2], t3[l2 + "Key"] && o3.push(l2);
                return o3;
              }(), s3.push(n3), (p2 = this.delegate) != null ? p2.inputControllerDidReceiveKeyboardCommand(s3) : void 0) ? t3.preventDefault() : void 0;
            }, keypress: function(t3) {
              var e2, n3, i2;
              if (this.inputSummary.eventName == null && !t3.metaKey && (!t3.ctrlKey || t3.altKey))
                return (i2 = p(t3)) ? ((e2 = this.delegate) != null && e2.inputControllerWillPerformTyping(), (n3 = this.responder) != null && n3.insertString(i2), this.setInputSummary({ textAdded: i2, didDelete: this.selectionIsExpanded() })) : void 0;
            }, textInput: function(t3) {
              var e2, n3, i2, o2;
              return e2 = t3.data, o2 = this.inputSummary.textAdded, o2 && o2 !== e2 && o2.toUpperCase() === e2 ? (n3 = this.getSelectedRange(), this.setSelectedRange([n3[0], n3[1] + o2.length]), (i2 = this.responder) != null && i2.insertString(e2), this.setInputSummary({ textAdded: e2 }), this.setSelectedRange(n3)) : void 0;
            }, dragenter: function(t3) {
              return t3.preventDefault();
            }, dragstart: function(t3) {
              var e2, n3;
              return n3 = t3.target, this.serializeSelectionToDataTransfer(t3.dataTransfer), this.draggedRange = this.getSelectedRange(), (e2 = this.delegate) != null && typeof e2.inputControllerDidStartDrag == "function" ? e2.inputControllerDidStartDrag() : void 0;
            }, dragover: function(t3) {
              var e2, n3;
              return !this.draggedRange && !this.canAcceptDataTransfer(t3.dataTransfer) || (t3.preventDefault(), e2 = { x: t3.clientX, y: t3.clientY }, l(e2, this.draggingPoint)) ? void 0 : (this.draggingPoint = e2, (n3 = this.delegate) != null && typeof n3.inputControllerDidReceiveDragOverPoint == "function" ? n3.inputControllerDidReceiveDragOverPoint(this.draggingPoint) : void 0);
            }, dragend: function() {
              var t3;
              return (t3 = this.delegate) != null && typeof t3.inputControllerDidCancelDrag == "function" && t3.inputControllerDidCancelDrag(), this.draggedRange = null, this.draggingPoint = null;
            }, drop: function(t3) {
              var n3, i2, o2, r2, s3, a2, u2, c2, l2;
              return t3.preventDefault(), o2 = (s3 = t3.dataTransfer) != null ? s3.files : void 0, r2 = { x: t3.clientX, y: t3.clientY }, (a2 = this.responder) != null && a2.setLocationRangeFromPointRange(r2), (o2 != null ? o2.length : void 0) ? this.attachFiles(o2) : this.draggedRange ? ((u2 = this.delegate) != null && u2.inputControllerWillMoveText(), (c2 = this.responder) != null && c2.moveTextFromRange(this.draggedRange), this.draggedRange = null, this.requestRender()) : (i2 = t3.dataTransfer.getData("application/x-trix-document")) && (n3 = e.Document.fromJSONString(i2), (l2 = this.responder) != null && l2.insertDocument(n3), this.requestRender()), this.draggedRange = null, this.draggingPoint = null;
            }, cut: function(t3) {
              var e2, n3;
              return ((e2 = this.responder) != null ? e2.selectionIsExpanded() : void 0) && (this.serializeSelectionToDataTransfer(t3.clipboardData) && t3.preventDefault(), (n3 = this.delegate) != null && n3.inputControllerWillCutText(), this.deleteInDirection("backward"), t3.defaultPrevented) ? this.requestRender() : void 0;
            }, copy: function(t3) {
              var e2;
              return ((e2 = this.responder) != null ? e2.selectionIsExpanded() : void 0) && this.serializeSelectionToDataTransfer(t3.clipboardData) ? t3.preventDefault() : void 0;
            }, paste: function(t3) {
              var n3, o2, s3, a2, u2, c2, l2, p2, f2, g2, v, y, b, A, C, x, w, E, S, R, k, D, L;
              return n3 = (p2 = t3.clipboardData) != null ? p2 : t3.testClipboardData, l2 = { clipboard: n3 }, n3 == null || h(t3) ? void this.getPastedHTMLUsingHiddenElement(function(t4) {
                return function(e2) {
                  var n4, i2, o3;
                  return l2.type = "text/html", l2.html = e2, (n4 = t4.delegate) != null && n4.inputControllerWillPaste(l2), (i2 = t4.responder) != null && i2.insertHTML(l2.html), t4.requestRender(), (o3 = t4.delegate) != null ? o3.inputControllerDidPaste(l2) : void 0;
                };
              }(this)) : ((a2 = n3.getData("URL")) ? (l2.type = "text/html", L = (c2 = n3.getData("public.url-name")) ? e.squishBreakableWhitespace(c2).trim() : a2, l2.html = this.createLinkHTML(a2, L), (f2 = this.delegate) != null && f2.inputControllerWillPaste(l2), this.setInputSummary({ textAdded: L, didDelete: this.selectionIsExpanded() }), (C = this.responder) != null && C.insertHTML(l2.html), this.requestRender(), (x = this.delegate) != null && x.inputControllerDidPaste(l2)) : i(n3) ? (l2.type = "text/plain", l2.string = n3.getData("text/plain"), (w = this.delegate) != null && w.inputControllerWillPaste(l2), this.setInputSummary({ textAdded: l2.string, didDelete: this.selectionIsExpanded() }), (E = this.responder) != null && E.insertString(l2.string), this.requestRender(), (S = this.delegate) != null && S.inputControllerDidPaste(l2)) : (u2 = n3.getData("text/html")) ? (l2.type = "text/html", l2.html = u2, (R = this.delegate) != null && R.inputControllerWillPaste(l2), (k = this.responder) != null && k.insertHTML(l2.html), this.requestRender(), (D = this.delegate) != null && D.inputControllerDidPaste(l2)) : m.call(n3.types, "Files") >= 0 && (s3 = (g2 = n3.items) != null && (v = g2[0]) != null && typeof v.getAsFile == "function" ? v.getAsFile() : void 0) && (!s3.name && (o2 = r(s3)) && (s3.name = "pasted-file-" + ++d2 + "." + o2), l2.type = "File", l2.file = s3, (y = this.delegate) != null && y.inputControllerWillAttachFiles(), (b = this.responder) != null && b.insertFile(l2.file), this.requestRender(), (A = this.delegate) != null && A.inputControllerDidPaste(l2)), t3.preventDefault());
            }, compositionstart: function(t3) {
              return this.getCompositionInput().start(t3.data);
            }, compositionupdate: function(t3) {
              return this.getCompositionInput().update(t3.data);
            }, compositionend: function(t3) {
              return this.getCompositionInput().end(t3.data);
            }, beforeinput: function() {
              return this.inputSummary.didInput = true;
            }, input: function(t3) {
              return this.inputSummary.didInput = true, t3.stopPropagation();
            } }, s2.prototype.keys = { backspace: function(t3) {
              var e2;
              return (e2 = this.delegate) != null && e2.inputControllerWillPerformTyping(), this.deleteInDirection("backward", t3);
            }, delete: function(t3) {
              var e2;
              return (e2 = this.delegate) != null && e2.inputControllerWillPerformTyping(), this.deleteInDirection("forward", t3);
            }, return: function() {
              var t3, e2;
              return this.setInputSummary({ preferDocument: true }), (t3 = this.delegate) != null && t3.inputControllerWillPerformTyping(), (e2 = this.responder) != null ? e2.insertLineBreak() : void 0;
            }, tab: function(t3) {
              var e2, n3;
              return ((e2 = this.responder) != null ? e2.canIncreaseNestingLevel() : void 0) ? ((n3 = this.responder) != null && n3.increaseNestingLevel(), this.requestRender(), t3.preventDefault()) : void 0;
            }, left: function(t3) {
              var e2;
              return this.selectionIsInCursorTarget() ? (t3.preventDefault(), (e2 = this.responder) != null ? e2.moveCursorInDirection("backward") : void 0) : void 0;
            }, right: function(t3) {
              var e2;
              return this.selectionIsInCursorTarget() ? (t3.preventDefault(), (e2 = this.responder) != null ? e2.moveCursorInDirection("forward") : void 0) : void 0;
            }, control: { d: function(t3) {
              var e2;
              return (e2 = this.delegate) != null && e2.inputControllerWillPerformTyping(), this.deleteInDirection("forward", t3);
            }, h: function(t3) {
              var e2;
              return (e2 = this.delegate) != null && e2.inputControllerWillPerformTyping(), this.deleteInDirection("backward", t3);
            }, o: function(t3) {
              var e2, n3;
              return t3.preventDefault(), (e2 = this.delegate) != null && e2.inputControllerWillPerformTyping(), (n3 = this.responder) != null && n3.insertString("\n", { updatePosition: false }), this.requestRender();
            } }, shift: { return: function(t3) {
              var e2, n3;
              return (e2 = this.delegate) != null && e2.inputControllerWillPerformTyping(), (n3 = this.responder) != null && n3.insertString("\n"), this.requestRender(), t3.preventDefault();
            }, tab: function(t3) {
              var e2, n3;
              return ((e2 = this.responder) != null ? e2.canDecreaseNestingLevel() : void 0) ? ((n3 = this.responder) != null && n3.decreaseNestingLevel(), this.requestRender(), t3.preventDefault()) : void 0;
            }, left: function(t3) {
              return this.selectionIsInCursorTarget() ? (t3.preventDefault(), this.expandSelectionInDirection("backward")) : void 0;
            }, right: function(t3) {
              return this.selectionIsInCursorTarget() ? (t3.preventDefault(), this.expandSelectionInDirection("forward")) : void 0;
            } }, alt: { backspace: function() {
              var t3;
              return this.setInputSummary({ preferDocument: false }), (t3 = this.delegate) != null ? t3.inputControllerWillPerformTyping() : void 0;
            } }, meta: { backspace: function() {
              var t3;
              return this.setInputSummary({ preferDocument: false }), (t3 = this.delegate) != null ? t3.inputControllerWillPerformTyping() : void 0;
            } } }, s2.prototype.getCompositionInput = function() {
              return this.isComposing() ? this.compositionInput : this.compositionInput = new t2(this);
            }, s2.prototype.isComposing = function() {
              return this.compositionInput != null && !this.compositionInput.isEnded();
            }, s2.prototype.deleteInDirection = function(t3, e2) {
              var n3;
              return ((n3 = this.responder) != null ? n3.deleteInDirection(t3) : void 0) !== false ? this.setInputSummary({ didDelete: true }) : e2 ? (e2.preventDefault(), this.requestRender()) : void 0;
            }, s2.prototype.serializeSelectionToDataTransfer = function(t3) {
              var n3, i2;
              if (o(t3))
                return n3 = (i2 = this.responder) != null ? i2.getSelectedDocument().toSerializableDocument() : void 0, t3.setData("application/x-trix-document", JSON.stringify(n3)), t3.setData("text/html", e.DocumentView.render(n3).innerHTML), t3.setData("text/plain", n3.toString().replace(/\n$/, "")), true;
            }, s2.prototype.canAcceptDataTransfer = function(t3) {
              var e2, n3, i2, o2, r2, s3;
              for (s3 = {}, o2 = (i2 = t3 != null ? t3.types : void 0) != null ? i2 : [], e2 = 0, n3 = o2.length; n3 > e2; e2++)
                r2 = o2[e2], s3[r2] = true;
              return s3.Files || s3["application/x-trix-document"] || s3["text/html"] || s3["text/plain"];
            }, s2.prototype.getPastedHTMLUsingHiddenElement = function(t3) {
              var n3, i2, o2;
              return i2 = this.getSelectedRange(), o2 = { position: "absolute", left: window.pageXOffset + "px", top: window.pageYOffset + "px", opacity: 0 }, n3 = c({ style: o2, tagName: "div", editable: true }), document.body.appendChild(n3), n3.focus(), requestAnimationFrame(function(o3) {
                return function() {
                  var r2;
                  return r2 = n3.innerHTML, e.removeNode(n3), o3.setSelectedRange(i2), t3(r2);
                };
              }(this));
            }, s2.proxyMethod("responder?.getSelectedRange"), s2.proxyMethod("responder?.setSelectedRange"), s2.proxyMethod("responder?.expandSelectionInDirection"), s2.proxyMethod("responder?.selectionIsInCursorTarget"), s2.proxyMethod("responder?.selectionIsExpanded"), s2;
          }(e.InputController), r = function(t3) {
            var e2, n2;
            return (e2 = t3.type) != null && (n2 = e2.match(/\/(\w+)$/)) != null ? n2[1] : void 0;
          }, s = (typeof " ".codePointAt == "function" ? " ".codePointAt(0) : void 0) != null, p = function(t3) {
            var n2;
            return t3.key && s && t3.key.codePointAt(0) === t3.keyCode ? t3.key : (t3.which === null ? n2 = t3.keyCode : t3.which !== 0 && t3.charCode !== 0 && (n2 = t3.charCode), n2 != null && u[n2] !== "escape" ? e.UTF16String.fromCodepoints([n2]).toString() : void 0);
          }, h = function(t3) {
            var e2, n2, i2, o2, r2, s2, a2, u2, c2, l2;
            if (u2 = t3.clipboardData) {
              if (m.call(u2.types, "text/html") >= 0) {
                for (c2 = u2.types, i2 = 0, s2 = c2.length; s2 > i2; i2++)
                  if (l2 = c2[i2], e2 = /^CorePasteboardFlavorType/.test(l2), n2 = /^dyn\./.test(l2) && u2.getData(l2), a2 = e2 || n2)
                    return true;
                return false;
              }
              return o2 = m.call(u2.types, "com.apple.webarchive") >= 0, r2 = m.call(u2.types, "com.apple.flat-rtfd") >= 0, o2 || r2;
            }
          }, t2 = function(t3) {
            function e2(t4) {
              var e3;
              this.inputController = t4, e3 = this.inputController, this.responder = e3.responder, this.delegate = e3.delegate, this.inputSummary = e3.inputSummary, this.data = {};
            }
            return f(e2, t3), e2.prototype.start = function(t4) {
              var e3, n2;
              return this.data.start = t4, this.isSignificant() ? (this.inputSummary.eventName === "keypress" && this.inputSummary.textAdded && (e3 = this.responder) != null && e3.deleteInDirection("left"), this.selectionIsExpanded() || (this.insertPlaceholder(), this.requestRender()), this.range = (n2 = this.responder) != null ? n2.getSelectedRange() : void 0) : void 0;
            }, e2.prototype.update = function(t4) {
              var e3;
              return this.data.update = t4, this.isSignificant() && (e3 = this.selectPlaceholder()) ? (this.forgetPlaceholder(), this.range = e3) : void 0;
            }, e2.prototype.end = function(t4) {
              var e3, n2, i2, o2;
              return this.data.end = t4, this.isSignificant() ? (this.forgetPlaceholder(), this.canApplyToDocument() ? (this.setInputSummary({ preferDocument: true, didInput: false }), (e3 = this.delegate) != null && e3.inputControllerWillPerformTyping(), (n2 = this.responder) != null && n2.setSelectedRange(this.range), (i2 = this.responder) != null && i2.insertString(this.data.end), (o2 = this.responder) != null ? o2.setSelectedRange(this.range[0] + this.data.end.length) : void 0) : this.data.start != null || this.data.update != null ? (this.requestReparse(), this.inputController.reset()) : void 0) : this.inputController.reset();
            }, e2.prototype.getEndData = function() {
              return this.data.end;
            }, e2.prototype.isEnded = function() {
              return this.getEndData() != null;
            }, e2.prototype.isSignificant = function() {
              return n.composesExistingText ? this.inputSummary.didInput : true;
            }, e2.prototype.canApplyToDocument = function() {
              var t4, e3;
              return ((t4 = this.data.start) != null ? t4.length : void 0) === 0 && ((e3 = this.data.end) != null ? e3.length : void 0) > 0 && this.range != null;
            }, e2.proxyMethod("inputController.setInputSummary"), e2.proxyMethod("inputController.requestRender"), e2.proxyMethod("inputController.requestReparse"), e2.proxyMethod("responder?.selectionIsExpanded"), e2.proxyMethod("responder?.insertPlaceholder"), e2.proxyMethod("responder?.selectPlaceholder"), e2.proxyMethod("responder?.forgetPlaceholder"), e2;
          }(e.BasicObject);
        }.call(this), function() {
          var t2, n, i, o = function(t3, e2) {
            return function() {
              return t3.apply(e2, arguments);
            };
          }, r = function(t3, e2) {
            function n2() {
              this.constructor = t3;
            }
            for (var i2 in e2)
              s.call(e2, i2) && (t3[i2] = e2[i2]);
            return n2.prototype = e2.prototype, t3.prototype = new n2(), t3.__super__ = e2.prototype, t3;
          }, s = {}.hasOwnProperty, a = [].indexOf || function(t3) {
            for (var e2 = 0, n2 = this.length; n2 > e2; e2++)
              if (e2 in this && this[e2] === t3)
                return e2;
            return -1;
          };
          t2 = e.dataTransferIsPlainText, n = e.keyEventIsKeyboardCommand, i = e.objectsAreEqual, e.Level2InputController = function(s2) {
            function u() {
              return this.render = o(this.render, this), u.__super__.constructor.apply(this, arguments);
            }
            var c, l, h, p, d, f;
            return r(u, s2), u.prototype.elementDidMutate = function() {
              var t3;
              return this.scheduledRender ? this.composing && (t3 = this.delegate) != null && typeof t3.inputControllerDidAllowUnhandledInput == "function" ? t3.inputControllerDidAllowUnhandledInput() : void 0 : this.reparse();
            }, u.prototype.scheduleRender = function() {
              return this.scheduledRender != null ? this.scheduledRender : this.scheduledRender = requestAnimationFrame(this.render);
            }, u.prototype.render = function() {
              var t3;
              return cancelAnimationFrame(this.scheduledRender), this.scheduledRender = null, this.composing || (t3 = this.delegate) != null && t3.render(), typeof this.afterRender == "function" && this.afterRender(), this.afterRender = null;
            }, u.prototype.reparse = function() {
              var t3;
              return (t3 = this.delegate) != null ? t3.reparse() : void 0;
            }, u.prototype.events = { keydown: function(t3) {
              var e2, i2, o2, r2;
              if (n(t3)) {
                if (e2 = l(t3), (r2 = this.delegate) != null ? r2.inputControllerDidReceiveKeyboardCommand(e2) : void 0)
                  return t3.preventDefault();
              } else if (o2 = t3.key, t3.altKey && (o2 += "+Alt"), t3.shiftKey && (o2 += "+Shift"), i2 = this.keys[o2])
                return this.withEvent(t3, i2);
            }, paste: function(t3) {
              var e2, n2, i2, o2, r2, s3, a2, u2, c2;
              return h(t3) ? (t3.preventDefault(), this.attachFiles(t3.clipboardData.files)) : p(t3) ? (t3.preventDefault(), n2 = { type: "text/plain", string: t3.clipboardData.getData("text/plain") }, (i2 = this.delegate) != null && i2.inputControllerWillPaste(n2), (o2 = this.responder) != null && o2.insertString(n2.string), this.render(), (r2 = this.delegate) != null ? r2.inputControllerDidPaste(n2) : void 0) : (e2 = (s3 = t3.clipboardData) != null ? s3.getData("URL") : void 0) ? (t3.preventDefault(), n2 = { type: "text/html", html: this.createLinkHTML(e2) }, (a2 = this.delegate) != null && a2.inputControllerWillPaste(n2), (u2 = this.responder) != null && u2.insertHTML(n2.html), this.render(), (c2 = this.delegate) != null ? c2.inputControllerDidPaste(n2) : void 0) : void 0;
            }, beforeinput: function(t3) {
              var e2;
              return (e2 = this.inputTypes[t3.inputType]) ? (this.withEvent(t3, e2), this.scheduleRender()) : void 0;
            }, input: function() {
              return e.selectionChangeObserver.reset();
            }, dragstart: function(t3) {
              var e2, n2;
              return ((e2 = this.responder) != null ? e2.selectionContainsAttachments() : void 0) ? (t3.dataTransfer.setData("application/x-trix-dragging", true), this.dragging = { range: (n2 = this.responder) != null ? n2.getSelectedRange() : void 0, point: d(t3) }) : void 0;
            }, dragenter: function(t3) {
              return c(t3) ? t3.preventDefault() : void 0;
            }, dragover: function(t3) {
              var e2, n2;
              if (this.dragging) {
                if (t3.preventDefault(), e2 = d(t3), !i(e2, this.dragging.point))
                  return this.dragging.point = e2, (n2 = this.responder) != null ? n2.setLocationRangeFromPointRange(e2) : void 0;
              } else if (c(t3))
                return t3.preventDefault();
            }, drop: function(t3) {
              var e2, n2, i2, o2;
              return this.dragging ? (t3.preventDefault(), (n2 = this.delegate) != null && n2.inputControllerWillMoveText(), (i2 = this.responder) != null && i2.moveTextFromRange(this.dragging.range), this.dragging = null, this.scheduleRender()) : c(t3) ? (t3.preventDefault(), e2 = d(t3), (o2 = this.responder) != null && o2.setLocationRangeFromPointRange(e2), this.attachFiles(t3.dataTransfer.files)) : void 0;
            }, dragend: function() {
              var t3;
              return this.dragging ? ((t3 = this.responder) != null && t3.setSelectedRange(this.dragging.range), this.dragging = null) : void 0;
            }, compositionend: function() {
              return this.composing ? (this.composing = false, this.scheduleRender()) : void 0;
            } }, u.prototype.keys = { ArrowLeft: function() {
              var t3, e2;
              return ((t3 = this.responder) != null ? t3.shouldManageMovingCursorInDirection("backward") : void 0) ? (this.event.preventDefault(), (e2 = this.responder) != null ? e2.moveCursorInDirection("backward") : void 0) : void 0;
            }, ArrowRight: function() {
              var t3, e2;
              return ((t3 = this.responder) != null ? t3.shouldManageMovingCursorInDirection("forward") : void 0) ? (this.event.preventDefault(), (e2 = this.responder) != null ? e2.moveCursorInDirection("forward") : void 0) : void 0;
            }, Backspace: function() {
              var t3, e2, n2;
              return ((t3 = this.responder) != null ? t3.shouldManageDeletingInDirection("backward") : void 0) ? (this.event.preventDefault(), (e2 = this.delegate) != null && e2.inputControllerWillPerformTyping(), (n2 = this.responder) != null && n2.deleteInDirection("backward"), this.render()) : void 0;
            }, Tab: function() {
              var t3, e2;
              return ((t3 = this.responder) != null ? t3.canIncreaseNestingLevel() : void 0) ? (this.event.preventDefault(), (e2 = this.responder) != null && e2.increaseNestingLevel(), this.render()) : void 0;
            }, "Tab+Shift": function() {
              var t3, e2;
              return ((t3 = this.responder) != null ? t3.canDecreaseNestingLevel() : void 0) ? (this.event.preventDefault(), (e2 = this.responder) != null && e2.decreaseNestingLevel(), this.render()) : void 0;
            } }, u.prototype.inputTypes = { deleteByComposition: function() {
              return this.deleteInDirection("backward", { recordUndoEntry: false });
            }, deleteByCut: function() {
              return this.deleteInDirection("backward");
            }, deleteByDrag: function() {
              return this.event.preventDefault(), this.withTargetDOMRange(function() {
                var t3;
                return this.deleteByDragRange = (t3 = this.responder) != null ? t3.getSelectedRange() : void 0;
              });
            }, deleteCompositionText: function() {
              return this.deleteInDirection("backward", { recordUndoEntry: false });
            }, deleteContent: function() {
              return this.deleteInDirection("backward");
            }, deleteContentBackward: function() {
              return this.deleteInDirection("backward");
            }, deleteContentForward: function() {
              return this.deleteInDirection("forward");
            }, deleteEntireSoftLine: function() {
              return this.deleteInDirection("forward");
            }, deleteHardLineBackward: function() {
              return this.deleteInDirection("backward");
            }, deleteHardLineForward: function() {
              return this.deleteInDirection("forward");
            }, deleteSoftLineBackward: function() {
              return this.deleteInDirection("backward");
            }, deleteSoftLineForward: function() {
              return this.deleteInDirection("forward");
            }, deleteWordBackward: function() {
              return this.deleteInDirection("backward");
            }, deleteWordForward: function() {
              return this.deleteInDirection("forward");
            }, formatBackColor: function() {
              return this.activateAttributeIfSupported("backgroundColor", this.event.data);
            }, formatBold: function() {
              return this.toggleAttributeIfSupported("bold");
            }, formatFontColor: function() {
              return this.activateAttributeIfSupported("color", this.event.data);
            }, formatFontName: function() {
              return this.activateAttributeIfSupported("font", this.event.data);
            }, formatIndent: function() {
              var t3;
              return ((t3 = this.responder) != null ? t3.canIncreaseNestingLevel() : void 0) ? this.withTargetDOMRange(function() {
                var t4;
                return (t4 = this.responder) != null ? t4.increaseNestingLevel() : void 0;
              }) : void 0;
            }, formatItalic: function() {
              return this.toggleAttributeIfSupported("italic");
            }, formatJustifyCenter: function() {
              return this.toggleAttributeIfSupported("justifyCenter");
            }, formatJustifyFull: function() {
              return this.toggleAttributeIfSupported("justifyFull");
            }, formatJustifyLeft: function() {
              return this.toggleAttributeIfSupported("justifyLeft");
            }, formatJustifyRight: function() {
              return this.toggleAttributeIfSupported("justifyRight");
            }, formatOutdent: function() {
              var t3;
              return ((t3 = this.responder) != null ? t3.canDecreaseNestingLevel() : void 0) ? this.withTargetDOMRange(function() {
                var t4;
                return (t4 = this.responder) != null ? t4.decreaseNestingLevel() : void 0;
              }) : void 0;
            }, formatRemove: function() {
              return this.withTargetDOMRange(function() {
                var t3, e2, n2, i2;
                i2 = [];
                for (t3 in (e2 = this.responder) != null ? e2.getCurrentAttributes() : void 0)
                  i2.push((n2 = this.responder) != null ? n2.removeCurrentAttribute(t3) : void 0);
                return i2;
              });
            }, formatSetBlockTextDirection: function() {
              return this.activateAttributeIfSupported("blockDir", this.event.data);
            }, formatSetInlineTextDirection: function() {
              return this.activateAttributeIfSupported("textDir", this.event.data);
            }, formatStrikeThrough: function() {
              return this.toggleAttributeIfSupported("strike");
            }, formatSubscript: function() {
              return this.toggleAttributeIfSupported("sub");
            }, formatSuperscript: function() {
              return this.toggleAttributeIfSupported("sup");
            }, formatUnderline: function() {
              return this.toggleAttributeIfSupported("underline");
            }, historyRedo: function() {
              var t3;
              return (t3 = this.delegate) != null ? t3.inputControllerWillPerformRedo() : void 0;
            }, historyUndo: function() {
              var t3;
              return (t3 = this.delegate) != null ? t3.inputControllerWillPerformUndo() : void 0;
            }, insertCompositionText: function() {
              return this.composing = true, this.insertString(this.event.data);
            }, insertFromComposition: function() {
              return this.composing = false, this.insertString(this.event.data);
            }, insertFromDrop: function() {
              var t3, e2;
              return (t3 = this.deleteByDragRange) ? (this.deleteByDragRange = null, (e2 = this.delegate) != null && e2.inputControllerWillMoveText(), this.withTargetDOMRange(function() {
                var e3;
                return (e3 = this.responder) != null ? e3.moveTextFromRange(t3) : void 0;
              })) : void 0;
            }, insertFromPaste: function() {
              var n2, i2, o2, r2, s3, a2, u2, c2, l2, h2, p2;
              return n2 = this.event.dataTransfer, s3 = { dataTransfer: n2 }, (i2 = n2.getData("URL")) ? (this.event.preventDefault(), s3.type = "text/html", p2 = (r2 = n2.getData("public.url-name")) ? e.squishBreakableWhitespace(r2).trim() : i2, s3.html = this.createLinkHTML(i2, p2), (a2 = this.delegate) != null && a2.inputControllerWillPaste(s3), this.withTargetDOMRange(function() {
                var t3;
                return (t3 = this.responder) != null ? t3.insertHTML(s3.html) : void 0;
              }), this.afterRender = function(t3) {
                return function() {
                  var e2;
                  return (e2 = t3.delegate) != null ? e2.inputControllerDidPaste(s3) : void 0;
                };
              }(this)) : t2(n2) ? (s3.type = "text/plain", s3.string = n2.getData("text/plain"), (u2 = this.delegate) != null && u2.inputControllerWillPaste(s3), this.withTargetDOMRange(function() {
                var t3;
                return (t3 = this.responder) != null ? t3.insertString(s3.string) : void 0;
              }), this.afterRender = function(t3) {
                return function() {
                  var e2;
                  return (e2 = t3.delegate) != null ? e2.inputControllerDidPaste(s3) : void 0;
                };
              }(this)) : (o2 = n2.getData("text/html")) ? (this.event.preventDefault(), s3.type = "text/html", s3.html = o2, (c2 = this.delegate) != null && c2.inputControllerWillPaste(s3), this.withTargetDOMRange(function() {
                var t3;
                return (t3 = this.responder) != null ? t3.insertHTML(s3.html) : void 0;
              }), this.afterRender = function(t3) {
                return function() {
                  var e2;
                  return (e2 = t3.delegate) != null ? e2.inputControllerDidPaste(s3) : void 0;
                };
              }(this)) : ((l2 = n2.files) != null ? l2.length : void 0) ? (s3.type = "File", s3.file = n2.files[0], (h2 = this.delegate) != null && h2.inputControllerWillPaste(s3), this.withTargetDOMRange(function() {
                var t3;
                return (t3 = this.responder) != null ? t3.insertFile(s3.file) : void 0;
              }), this.afterRender = function(t3) {
                return function() {
                  var e2;
                  return (e2 = t3.delegate) != null ? e2.inputControllerDidPaste(s3) : void 0;
                };
              }(this)) : void 0;
            }, insertFromYank: function() {
              return this.insertString(this.event.data);
            }, insertLineBreak: function() {
              return this.insertString("\n");
            }, insertLink: function() {
              return this.activateAttributeIfSupported("href", this.event.data);
            }, insertOrderedList: function() {
              return this.toggleAttributeIfSupported("number");
            }, insertParagraph: function() {
              var t3;
              return (t3 = this.delegate) != null && t3.inputControllerWillPerformTyping(), this.withTargetDOMRange(function() {
                var t4;
                return (t4 = this.responder) != null ? t4.insertLineBreak() : void 0;
              });
            }, insertReplacementText: function() {
              return this.insertString(this.event.dataTransfer.getData("text/plain"), { updatePosition: false });
            }, insertText: function() {
              var t3, e2;
              return this.insertString((t3 = this.event.data) != null ? t3 : (e2 = this.event.dataTransfer) != null ? e2.getData("text/plain") : void 0);
            }, insertTranspose: function() {
              return this.insertString(this.event.data);
            }, insertUnorderedList: function() {
              return this.toggleAttributeIfSupported("bullet");
            } }, u.prototype.insertString = function(t3, e2) {
              var n2;
              return t3 == null && (t3 = ""), (n2 = this.delegate) != null && n2.inputControllerWillPerformTyping(), this.withTargetDOMRange(function() {
                var n3;
                return (n3 = this.responder) != null ? n3.insertString(t3, e2) : void 0;
              });
            }, u.prototype.toggleAttributeIfSupported = function(t3) {
              var n2;
              return a.call(e.getAllAttributeNames(), t3) >= 0 ? ((n2 = this.delegate) != null && n2.inputControllerWillPerformFormatting(t3), this.withTargetDOMRange(function() {
                var e2;
                return (e2 = this.responder) != null ? e2.toggleCurrentAttribute(t3) : void 0;
              })) : void 0;
            }, u.prototype.activateAttributeIfSupported = function(t3, n2) {
              var i2;
              return a.call(e.getAllAttributeNames(), t3) >= 0 ? ((i2 = this.delegate) != null && i2.inputControllerWillPerformFormatting(t3), this.withTargetDOMRange(function() {
                var e2;
                return (e2 = this.responder) != null ? e2.setCurrentAttribute(t3, n2) : void 0;
              })) : void 0;
            }, u.prototype.deleteInDirection = function(t3, e2) {
              var n2, i2, o2, r2;
              return o2 = (e2 != null ? e2 : { recordUndoEntry: true }).recordUndoEntry, o2 && (r2 = this.delegate) != null && r2.inputControllerWillPerformTyping(), i2 = function(e3) {
                return function() {
                  var n3;
                  return (n3 = e3.responder) != null ? n3.deleteInDirection(t3) : void 0;
                };
              }(this), (n2 = this.getTargetDOMRange({ minLength: 2 })) ? this.withTargetDOMRange(n2, i2) : i2();
            }, u.prototype.withTargetDOMRange = function(t3, n2) {
              var i2;
              return typeof t3 == "function" && (n2 = t3, t3 = this.getTargetDOMRange()), t3 ? (i2 = this.responder) != null ? i2.withTargetDOMRange(t3, n2.bind(this)) : void 0 : (e.selectionChangeObserver.reset(), n2.call(this));
            }, u.prototype.getTargetDOMRange = function(t3) {
              var e2, n2, i2, o2;
              return i2 = (t3 != null ? t3 : { minLength: 0 }).minLength, (o2 = typeof (e2 = this.event).getTargetRanges == "function" ? e2.getTargetRanges() : void 0) && o2.length && (n2 = f(o2[0]), i2 === 0 || n2.toString().length >= i2) ? n2 : void 0;
            }, f = function(t3) {
              var e2;
              return e2 = document.createRange(), e2.setStart(t3.startContainer, t3.startOffset), e2.setEnd(t3.endContainer, t3.endOffset), e2;
            }, u.prototype.withEvent = function(t3, e2) {
              var n2;
              this.event = t3;
              try {
                n2 = e2.call(this);
              } finally {
                this.event = null;
              }
              return n2;
            }, c = function(t3) {
              var e2, n2;
              return a.call((e2 = (n2 = t3.dataTransfer) != null ? n2.types : void 0) != null ? e2 : [], "Files") >= 0;
            }, h = function(t3) {
              var e2;
              return (e2 = t3.clipboardData) ? a.call(e2.types, "Files") >= 0 && e2.types.length === 1 && e2.files.length >= 1 : void 0;
            }, p = function(t3) {
              var e2;
              return (e2 = t3.clipboardData) ? a.call(e2.types, "text/plain") >= 0 && e2.types.length === 1 : void 0;
            }, l = function(t3) {
              var e2;
              return e2 = [], t3.altKey && e2.push("alt"), t3.shiftKey && e2.push("shift"), e2.push(t3.key), e2;
            }, d = function(t3) {
              return { x: t3.clientX, y: t3.clientY };
            }, u;
          }(e.InputController);
        }.call(this), function() {
          var t2, n, i, o, r, s, a, u, c = function(t3, e2) {
            return function() {
              return t3.apply(e2, arguments);
            };
          }, l = function(t3, e2) {
            function n2() {
              this.constructor = t3;
            }
            for (var i2 in e2)
              h.call(e2, i2) && (t3[i2] = e2[i2]);
            return n2.prototype = e2.prototype, t3.prototype = new n2(), t3.__super__ = e2.prototype, t3;
          }, h = {}.hasOwnProperty;
          n = e.defer, i = e.handleEvent, s = e.makeElement, u = e.tagName, a = e.config, r = a.lang, t2 = a.css, o = a.keyNames, e.AttachmentEditorController = function(a2) {
            function h2(t3, e2, n2, i2) {
              this.attachmentPiece = t3, this.element = e2, this.container = n2, this.options = i2 != null ? i2 : {}, this.didBlurCaption = c(this.didBlurCaption, this), this.didChangeCaption = c(this.didChangeCaption, this), this.didInputCaption = c(this.didInputCaption, this), this.didKeyDownCaption = c(this.didKeyDownCaption, this), this.didClickActionButton = c(this.didClickActionButton, this), this.didClickToolbar = c(this.didClickToolbar, this), this.attachment = this.attachmentPiece.attachment, u(this.element) === "a" && (this.element = this.element.firstChild), this.install();
            }
            var p;
            return l(h2, a2), p = function(t3) {
              return function() {
                var e2;
                return e2 = t3.apply(this, arguments), e2["do"](), this.undos == null && (this.undos = []), this.undos.push(e2.undo);
              };
            }, h2.prototype.install = function() {
              return this.makeElementMutable(), this.addToolbar(), this.attachment.isPreviewable() ? this.installCaptionEditor() : void 0;
            }, h2.prototype.uninstall = function() {
              var t3, e2;
              for (this.savePendingCaption(); e2 = this.undos.pop(); )
                e2();
              return (t3 = this.delegate) != null ? t3.didUninstallAttachmentEditor(this) : void 0;
            }, h2.prototype.savePendingCaption = function() {
              var t3, e2, n2;
              return this.pendingCaption != null ? (t3 = this.pendingCaption, this.pendingCaption = null, t3 ? (e2 = this.delegate) != null && typeof e2.attachmentEditorDidRequestUpdatingAttributesForAttachment == "function" ? e2.attachmentEditorDidRequestUpdatingAttributesForAttachment({ caption: t3 }, this.attachment) : void 0 : (n2 = this.delegate) != null && typeof n2.attachmentEditorDidRequestRemovingAttributeForAttachment == "function" ? n2.attachmentEditorDidRequestRemovingAttributeForAttachment("caption", this.attachment) : void 0) : void 0;
            }, h2.prototype.makeElementMutable = p(function() {
              return { do: function(t3) {
                return function() {
                  return t3.element.dataset.trixMutable = true;
                };
              }(this), undo: function(t3) {
                return function() {
                  return delete t3.element.dataset.trixMutable;
                };
              }(this) };
            }), h2.prototype.addToolbar = p(function() {
              var n2;
              return n2 = s({ tagName: "div", className: t2.attachmentToolbar, data: { trixMutable: true }, childNodes: s({ tagName: "div", className: "trix-button-row", childNodes: s({ tagName: "span", className: "trix-button-group trix-button-group--actions", childNodes: s({ tagName: "button", className: "trix-button trix-button--remove", textContent: r.remove, attributes: { title: r.remove }, data: { trixAction: "remove" } }) }) }) }), this.attachment.isPreviewable() && n2.appendChild(s({ tagName: "div", className: t2.attachmentMetadataContainer, childNodes: s({ tagName: "span", className: t2.attachmentMetadata, childNodes: [s({ tagName: "span", className: t2.attachmentName, textContent: this.attachment.getFilename(), attributes: { title: this.attachment.getFilename() } }), s({ tagName: "span", className: t2.attachmentSize, textContent: this.attachment.getFormattedFilesize() })] }) })), i("click", { onElement: n2, withCallback: this.didClickToolbar }), i("click", { onElement: n2, matchingSelector: "[data-trix-action]", withCallback: this.didClickActionButton }), { do: function(t3) {
                return function() {
                  return t3.element.appendChild(n2);
                };
              }(this), undo: function() {
                return function() {
                  return e.removeNode(n2);
                };
              }() };
            }), h2.prototype.installCaptionEditor = p(function() {
              var o2, a3, u2, c2, l2;
              return c2 = s({ tagName: "textarea", className: t2.attachmentCaptionEditor, attributes: { placeholder: r.captionPlaceholder }, data: { trixMutable: true } }), c2.value = this.attachmentPiece.getCaption(), l2 = c2.cloneNode(), l2.classList.add("trix-autoresize-clone"), l2.tabIndex = -1, o2 = function() {
                return l2.value = c2.value, c2.style.height = l2.scrollHeight + "px";
              }, i("input", { onElement: c2, withCallback: o2 }), i("input", { onElement: c2, withCallback: this.didInputCaption }), i("keydown", { onElement: c2, withCallback: this.didKeyDownCaption }), i("change", { onElement: c2, withCallback: this.didChangeCaption }), i("blur", { onElement: c2, withCallback: this.didBlurCaption }), u2 = this.element.querySelector("figcaption"), a3 = u2.cloneNode(), { do: function(e2) {
                return function() {
                  return u2.style.display = "none", a3.appendChild(c2), a3.appendChild(l2), a3.classList.add(t2.attachmentCaption + "--editing"), u2.parentElement.insertBefore(a3, u2), o2(), e2.options.editCaption ? n(function() {
                    return c2.focus();
                  }) : void 0;
                };
              }(this), undo: function() {
                return e.removeNode(a3), u2.style.display = null;
              } };
            }), h2.prototype.didClickToolbar = function(t3) {
              return t3.preventDefault(), t3.stopPropagation();
            }, h2.prototype.didClickActionButton = function(t3) {
              var e2, n2;
              switch (e2 = t3.target.getAttribute("data-trix-action")) {
                case "remove":
                  return (n2 = this.delegate) != null ? n2.attachmentEditorDidRequestRemovalOfAttachment(this.attachment) : void 0;
              }
            }, h2.prototype.didKeyDownCaption = function(t3) {
              var e2;
              return o[t3.keyCode] === "return" ? (t3.preventDefault(), this.savePendingCaption(), (e2 = this.delegate) != null && typeof e2.attachmentEditorDidRequestDeselectingAttachment == "function" ? e2.attachmentEditorDidRequestDeselectingAttachment(this.attachment) : void 0) : void 0;
            }, h2.prototype.didInputCaption = function(t3) {
              return this.pendingCaption = t3.target.value.replace(/\s/g, " ").trim();
            }, h2.prototype.didChangeCaption = function() {
              return this.savePendingCaption();
            }, h2.prototype.didBlurCaption = function() {
              return this.savePendingCaption();
            }, h2;
          }(e.BasicObject);
        }.call(this), function() {
          var t2, n, i, o = function(t3, e2) {
            function n2() {
              this.constructor = t3;
            }
            for (var i2 in e2)
              r.call(e2, i2) && (t3[i2] = e2[i2]);
            return n2.prototype = e2.prototype, t3.prototype = new n2(), t3.__super__ = e2.prototype, t3;
          }, r = {}.hasOwnProperty;
          i = e.makeElement, t2 = e.config.css, e.AttachmentView = function(r2) {
            function s() {
              s.__super__.constructor.apply(this, arguments), this.attachment = this.object, this.attachment.uploadProgressDelegate = this, this.attachmentPiece = this.options.piece;
            }
            var a;
            return o(s, r2), s.attachmentSelector = "[data-trix-attachment]", s.prototype.createContentNodes = function() {
              return [];
            }, s.prototype.createNodes = function() {
              var e2, n2, o2, r3, s2, u, c;
              if (e2 = r3 = i({ tagName: "figure", className: this.getClassName(), data: this.getData(), editable: false }), (n2 = this.getHref()) && (r3 = i({ tagName: "a", editable: false, attributes: { href: n2, tabindex: -1 } }), e2.appendChild(r3)), this.attachment.hasContent())
                r3.innerHTML = this.attachment.getContent();
              else
                for (c = this.createContentNodes(), o2 = 0, s2 = c.length; s2 > o2; o2++)
                  u = c[o2], r3.appendChild(u);
              return r3.appendChild(this.createCaptionElement()), this.attachment.isPending() && (this.progressElement = i({ tagName: "progress", attributes: { class: t2.attachmentProgress, value: this.attachment.getUploadProgress(), max: 100 }, data: { trixMutable: true, trixStoreKey: ["progressElement", this.attachment.id].join("/") } }), e2.appendChild(this.progressElement)), [a("left"), e2, a("right")];
            }, s.prototype.createCaptionElement = function() {
              var e2, n2, o2, r3, s2, a2, u;
              return o2 = i({ tagName: "figcaption", className: t2.attachmentCaption }), (e2 = this.attachmentPiece.getCaption()) ? (o2.classList.add(t2.attachmentCaption + "--edited"), o2.textContent = e2) : (n2 = this.getCaptionConfig(), n2.name && (r3 = this.attachment.getFilename()), n2.size && (a2 = this.attachment.getFormattedFilesize()), r3 && (s2 = i({ tagName: "span", className: t2.attachmentName, textContent: r3 }), o2.appendChild(s2)), a2 && (r3 && o2.appendChild(document.createTextNode(" ")), u = i({ tagName: "span", className: t2.attachmentSize, textContent: a2 }), o2.appendChild(u))), o2;
            }, s.prototype.getClassName = function() {
              var e2, n2;
              return n2 = [t2.attachment, t2.attachment + "--" + this.attachment.getType()], (e2 = this.attachment.getExtension()) && n2.push(t2.attachment + "--" + e2), n2.join(" ");
            }, s.prototype.getData = function() {
              var t3, e2;
              return e2 = { trixAttachment: JSON.stringify(this.attachment), trixContentType: this.attachment.getContentType(), trixId: this.attachment.id }, t3 = this.attachmentPiece.attributes, t3.isEmpty() || (e2.trixAttributes = JSON.stringify(t3)), this.attachment.isPending() && (e2.trixSerialize = false), e2;
            }, s.prototype.getHref = function() {
              return n(this.attachment.getContent(), "a") ? void 0 : this.attachment.getHref();
            }, s.prototype.getCaptionConfig = function() {
              var t3, n2, i2;
              return i2 = this.attachment.getType(), t3 = e.copyObject((n2 = e.config.attachments[i2]) != null ? n2.caption : void 0), i2 === "file" && (t3.name = true), t3;
            }, s.prototype.findProgressElement = function() {
              var t3;
              return (t3 = this.findElement()) != null ? t3.querySelector("progress") : void 0;
            }, a = function(t3) {
              return i({ tagName: "span", textContent: e.ZERO_WIDTH_SPACE, data: { trixCursorTarget: t3, trixSerialize: false } });
            }, s.prototype.attachmentDidChangeUploadProgress = function() {
              var t3, e2;
              return e2 = this.attachment.getUploadProgress(), (t3 = this.findProgressElement()) != null ? t3.value = e2 : void 0;
            }, s;
          }(e.ObjectView), n = function(t3, e2) {
            var n2;
            return n2 = i("div"), n2.innerHTML = t3 != null ? t3 : "", n2.querySelector(e2);
          };
        }.call(this), function() {
          var t2, n = function(t3, e2) {
            function n2() {
              this.constructor = t3;
            }
            for (var o in e2)
              i.call(e2, o) && (t3[o] = e2[o]);
            return n2.prototype = e2.prototype, t3.prototype = new n2(), t3.__super__ = e2.prototype, t3;
          }, i = {}.hasOwnProperty;
          t2 = e.makeElement, e.PreviewableAttachmentView = function(i2) {
            function o() {
              o.__super__.constructor.apply(this, arguments), this.attachment.previewDelegate = this;
            }
            return n(o, i2), o.prototype.createContentNodes = function() {
              return this.image = t2({ tagName: "img", attributes: { src: "" }, data: { trixMutable: true } }), this.refresh(this.image), [this.image];
            }, o.prototype.createCaptionElement = function() {
              var t3;
              return t3 = o.__super__.createCaptionElement.apply(this, arguments), t3.textContent || t3.setAttribute("data-trix-placeholder", e.config.lang.captionPlaceholder), t3;
            }, o.prototype.refresh = function(t3) {
              var e2;
              return t3 == null && (t3 = (e2 = this.findElement()) != null ? e2.querySelector("img") : void 0), t3 ? this.updateAttributesForImage(t3) : void 0;
            }, o.prototype.updateAttributesForImage = function(t3) {
              var e2, n2, i3, o2, r, s;
              return r = this.attachment.getURL(), n2 = this.attachment.getPreviewURL(), t3.src = n2 || r, n2 === r ? t3.removeAttribute("data-trix-serialized-attributes") : (i3 = JSON.stringify({ src: r }), t3.setAttribute("data-trix-serialized-attributes", i3)), s = this.attachment.getWidth(), e2 = this.attachment.getHeight(), s != null && (t3.width = s), e2 != null && (t3.height = e2), o2 = ["imageElement", this.attachment.id, t3.src, t3.width, t3.height].join("/"), t3.dataset.trixStoreKey = o2;
            }, o.prototype.attachmentDidChangeAttributes = function() {
              return this.refresh(this.image), this.refresh();
            }, o;
          }(e.AttachmentView);
        }.call(this), function() {
          var t2, n, i, o = function(t3, e2) {
            function n2() {
              this.constructor = t3;
            }
            for (var i2 in e2)
              r.call(e2, i2) && (t3[i2] = e2[i2]);
            return n2.prototype = e2.prototype, t3.prototype = new n2(), t3.__super__ = e2.prototype, t3;
          }, r = {}.hasOwnProperty;
          i = e.makeElement, t2 = e.findInnerElement, n = e.getTextConfig, e.PieceView = function(r2) {
            function s() {
              var t3;
              s.__super__.constructor.apply(this, arguments), this.piece = this.object, this.attributes = this.piece.getAttributes(), t3 = this.options, this.textConfig = t3.textConfig, this.context = t3.context, this.piece.attachment ? this.attachment = this.piece.attachment : this.string = this.piece.toString();
            }
            var a;
            return o(s, r2), s.prototype.createNodes = function() {
              var e2, n2, i2, o2, r3, s2;
              if (s2 = this.attachment ? this.createAttachmentNodes() : this.createStringNodes(), e2 = this.createElement()) {
                for (i2 = t2(e2), n2 = 0, o2 = s2.length; o2 > n2; n2++)
                  r3 = s2[n2], i2.appendChild(r3);
                s2 = [e2];
              }
              return s2;
            }, s.prototype.createAttachmentNodes = function() {
              var t3, n2;
              return t3 = this.attachment.isPreviewable() ? e.PreviewableAttachmentView : e.AttachmentView, n2 = this.createChildView(t3, this.piece.attachment, { piece: this.piece }), n2.getNodes();
            }, s.prototype.createStringNodes = function() {
              var t3, e2, n2, o2, r3, s2, a2, u, c, l;
              if ((u = this.textConfig) != null ? u.plaintext : void 0)
                return [document.createTextNode(this.string)];
              for (a2 = [], c = this.string.split("\n"), n2 = e2 = 0, o2 = c.length; o2 > e2; n2 = ++e2)
                l = c[n2], n2 > 0 && (t3 = i("br"), a2.push(t3)), (r3 = l.length) && (s2 = document.createTextNode(this.preserveSpaces(l)), a2.push(s2));
              return a2;
            }, s.prototype.createElement = function() {
              var t3, e2, o2, r3, s2, a2, u, c, l;
              c = {}, a2 = this.attributes;
              for (r3 in a2)
                if (l = a2[r3], (t3 = n(r3)) && (t3.tagName && (s2 = i(t3.tagName), o2 ? (o2.appendChild(s2), o2 = s2) : e2 = o2 = s2), t3.styleProperty && (c[t3.styleProperty] = l), t3.style)) {
                  u = t3.style;
                  for (r3 in u)
                    l = u[r3], c[r3] = l;
                }
              if (Object.keys(c).length) {
                e2 == null && (e2 = i("span"));
                for (r3 in c)
                  l = c[r3], e2.style[r3] = l;
              }
              return e2;
            }, s.prototype.createContainerElement = function() {
              var t3, e2, o2, r3, s2;
              r3 = this.attributes;
              for (o2 in r3)
                if (s2 = r3[o2], (e2 = n(o2)) && e2.groupTagName)
                  return t3 = {}, t3[o2] = s2, i(e2.groupTagName, t3);
            }, a = e.NON_BREAKING_SPACE, s.prototype.preserveSpaces = function(t3) {
              return this.context.isLast && (t3 = t3.replace(/\ $/, a)), t3 = t3.replace(/(\S)\ {3}(\S)/g, "$1 " + a + " $2").replace(/\ {2}/g, a + " ").replace(/\ {2}/g, " " + a), (this.context.isFirst || this.context.followsWhitespace) && (t3 = t3.replace(/^\ /, a)), t3;
            }, s;
          }(e.ObjectView);
        }.call(this), function() {
          var t2 = function(t3, e2) {
            function i() {
              this.constructor = t3;
            }
            for (var o in e2)
              n.call(e2, o) && (t3[o] = e2[o]);
            return i.prototype = e2.prototype, t3.prototype = new i(), t3.__super__ = e2.prototype, t3;
          }, n = {}.hasOwnProperty;
          e.TextView = function(n2) {
            function i() {
              i.__super__.constructor.apply(this, arguments), this.text = this.object, this.textConfig = this.options.textConfig;
            }
            var o;
            return t2(i, n2), i.prototype.createNodes = function() {
              var t3, n3, i2, r, s, a, u, c, l, h;
              for (a = [], c = e.ObjectGroup.groupObjects(this.getPieces()), r = c.length - 1, i2 = n3 = 0, s = c.length; s > n3; i2 = ++n3)
                u = c[i2], t3 = {}, i2 === 0 && (t3.isFirst = true), i2 === r && (t3.isLast = true), o(l) && (t3.followsWhitespace = true), h = this.findOrCreateCachedChildView(e.PieceView, u, { textConfig: this.textConfig, context: t3 }), a.push.apply(a, h.getNodes()), l = u;
              return a;
            }, i.prototype.getPieces = function() {
              var t3, e2, n3, i2, o2;
              for (i2 = this.text.getPieces(), o2 = [], t3 = 0, e2 = i2.length; e2 > t3; t3++)
                n3 = i2[t3], n3.hasAttribute("blockBreak") || o2.push(n3);
              return o2;
            }, o = function(t3) {
              return /\s$/.test(t3 != null ? t3.toString() : void 0);
            }, i;
          }(e.ObjectView);
        }.call(this), function() {
          var t2, n, i, o = function(t3, e2) {
            function n2() {
              this.constructor = t3;
            }
            for (var i2 in e2)
              r.call(e2, i2) && (t3[i2] = e2[i2]);
            return n2.prototype = e2.prototype, t3.prototype = new n2(), t3.__super__ = e2.prototype, t3;
          }, r = {}.hasOwnProperty;
          i = e.makeElement, n = e.getBlockConfig, t2 = e.config.css, e.BlockView = function(r2) {
            function s() {
              s.__super__.constructor.apply(this, arguments), this.block = this.object, this.attributes = this.block.getAttributes();
            }
            return o(s, r2), s.prototype.createNodes = function() {
              var t3, o2, r3, s2, a, u, c, l, h, p, d;
              if (o2 = document.createComment("block"), c = [o2], this.block.isEmpty() ? c.push(i("br")) : (p = (l = n(this.block.getLastAttribute())) != null ? l.text : void 0, d = this.findOrCreateCachedChildView(e.TextView, this.block.text, { textConfig: p }), c.push.apply(c, d.getNodes()), this.shouldAddExtraNewlineElement() && c.push(i("br"))), this.attributes.length)
                return c;
              for (h = e.config.blockAttributes["default"].tagName, this.block.isRTL() && (t3 = { dir: "rtl" }), r3 = i({ tagName: h, attributes: t3 }), s2 = 0, a = c.length; a > s2; s2++)
                u = c[s2], r3.appendChild(u);
              return [r3];
            }, s.prototype.createContainerElement = function(e2) {
              var o2, r3, s2, a, u;
              return o2 = this.attributes[e2], u = n(o2).tagName, e2 === 0 && this.block.isRTL() && (r3 = { dir: "rtl" }), o2 === "attachmentGallery" && (a = this.block.getBlockBreakPosition(), s2 = t2.attachmentGallery + " " + t2.attachmentGallery + "--" + a), i({ tagName: u, className: s2, attributes: r3 });
            }, s.prototype.shouldAddExtraNewlineElement = function() {
              return /\n\n$/.test(this.block.toString());
            }, s;
          }(e.ObjectView);
        }.call(this), function() {
          var t2, n, i = function(t3, e2) {
            function n2() {
              this.constructor = t3;
            }
            for (var i2 in e2)
              o.call(e2, i2) && (t3[i2] = e2[i2]);
            return n2.prototype = e2.prototype, t3.prototype = new n2(), t3.__super__ = e2.prototype, t3;
          }, o = {}.hasOwnProperty;
          t2 = e.defer, n = e.makeElement, e.DocumentView = function(o2) {
            function r() {
              r.__super__.constructor.apply(this, arguments), this.element = this.options.element, this.elementStore = new e.ElementStore(), this.setDocument(this.object);
            }
            var s, a, u;
            return i(r, o2), r.render = function(t3) {
              var e2, i2;
              return e2 = n("div"), i2 = new this(t3, { element: e2 }), i2.render(), i2.sync(), e2;
            }, r.prototype.setDocument = function(t3) {
              return t3.isEqualTo(this.document) ? void 0 : this.document = this.object = t3;
            }, r.prototype.render = function() {
              var t3, i2, o3, r2, s2, a2, u2;
              if (this.childViews = [], this.shadowElement = n("div"), !this.document.isEmpty()) {
                for (s2 = e.ObjectGroup.groupObjects(this.document.getBlocks(), { asTree: true }), a2 = [], t3 = 0, i2 = s2.length; i2 > t3; t3++)
                  r2 = s2[t3], u2 = this.findOrCreateCachedChildView(e.BlockView, r2), a2.push(function() {
                    var t4, e2, n2, i3;
                    for (n2 = u2.getNodes(), i3 = [], t4 = 0, e2 = n2.length; e2 > t4; t4++)
                      o3 = n2[t4], i3.push(this.shadowElement.appendChild(o3));
                    return i3;
                  }.call(this));
                return a2;
              }
            }, r.prototype.isSynced = function() {
              return s(this.shadowElement, this.element);
            }, r.prototype.sync = function() {
              var t3;
              for (t3 = this.createDocumentFragmentForSync(); this.element.lastChild; )
                this.element.removeChild(this.element.lastChild);
              return this.element.appendChild(t3), this.didSync();
            }, r.prototype.didSync = function() {
              return this.elementStore.reset(a(this.element)), t2(function(t3) {
                return function() {
                  return t3.garbageCollectCachedViews();
                };
              }(this));
            }, r.prototype.createDocumentFragmentForSync = function() {
              var t3, e2, n2, i2, o3, r2, s2, u2, c, l;
              for (e2 = document.createDocumentFragment(), u2 = this.shadowElement.childNodes, n2 = 0, o3 = u2.length; o3 > n2; n2++)
                s2 = u2[n2], e2.appendChild(s2.cloneNode(true));
              for (c = a(e2), i2 = 0, r2 = c.length; r2 > i2; i2++)
                t3 = c[i2], (l = this.elementStore.remove(t3)) && t3.parentNode.replaceChild(l, t3);
              return e2;
            }, a = function(t3) {
              return t3.querySelectorAll("[data-trix-store-key]");
            }, s = function(t3, e2) {
              return u(t3.innerHTML) === u(e2.innerHTML);
            }, u = function(t3) {
              return t3.replace(/&nbsp;/g, " ");
            }, r;
          }(e.ObjectView);
        }.call(this), function() {
          var t2, n, i, o, r, s = function(t3, e2) {
            return function() {
              return t3.apply(e2, arguments);
            };
          }, a = function(t3, e2) {
            function n2() {
              this.constructor = t3;
            }
            for (var i2 in e2)
              u.call(e2, i2) && (t3[i2] = e2[i2]);
            return n2.prototype = e2.prototype, t3.prototype = new n2(), t3.__super__ = e2.prototype, t3;
          }, u = {}.hasOwnProperty;
          i = e.findClosestElementFromNode, o = e.handleEvent, r = e.innerElementIsActive, n = e.defer, t2 = e.AttachmentView.attachmentSelector, e.CompositionController = function(u2) {
            function c(n2, i2) {
              this.element = n2, this.composition = i2, this.didClickAttachment = s(this.didClickAttachment, this), this.didBlur = s(this.didBlur, this), this.didFocus = s(this.didFocus, this), this.documentView = new e.DocumentView(this.composition.document, { element: this.element }), o("focus", { onElement: this.element, withCallback: this.didFocus }), o("blur", { onElement: this.element, withCallback: this.didBlur }), o("click", { onElement: this.element, matchingSelector: "a[contenteditable=false]", preventDefault: true }), o("mousedown", { onElement: this.element, matchingSelector: t2, withCallback: this.didClickAttachment }), o("click", { onElement: this.element, matchingSelector: "a" + t2, preventDefault: true });
            }
            return a(c, u2), c.prototype.didFocus = function() {
              var t3, e2, n2;
              return t3 = function(t4) {
                return function() {
                  var e3;
                  return t4.focused ? void 0 : (t4.focused = true, (e3 = t4.delegate) != null && typeof e3.compositionControllerDidFocus == "function" ? e3.compositionControllerDidFocus() : void 0);
                };
              }(this), (e2 = (n2 = this.blurPromise) != null ? n2.then(t3) : void 0) != null ? e2 : t3();
            }, c.prototype.didBlur = function() {
              return this.blurPromise = new Promise(function(t3) {
                return function(e2) {
                  return n(function() {
                    var n2;
                    return r(t3.element) || (t3.focused = null, (n2 = t3.delegate) != null && typeof n2.compositionControllerDidBlur == "function" && n2.compositionControllerDidBlur()), t3.blurPromise = null, e2();
                  });
                };
              }(this));
            }, c.prototype.didClickAttachment = function(t3, e2) {
              var n2, o2, r2;
              return n2 = this.findAttachmentForElement(e2), o2 = i(t3.target, { matchingSelector: "figcaption" }) != null, (r2 = this.delegate) != null && typeof r2.compositionControllerDidSelectAttachment == "function" ? r2.compositionControllerDidSelectAttachment(n2, { editCaption: o2 }) : void 0;
            }, c.prototype.getSerializableElement = function() {
              return this.isEditingAttachment() ? this.documentView.shadowElement : this.element;
            }, c.prototype.render = function() {
              var t3, e2, n2;
              return this.revision !== this.composition.revision && (this.documentView.setDocument(this.composition.document), this.documentView.render(), this.revision = this.composition.revision), this.canSyncDocumentView() && !this.documentView.isSynced() && ((t3 = this.delegate) != null && typeof t3.compositionControllerWillSyncDocumentView == "function" && t3.compositionControllerWillSyncDocumentView(), this.documentView.sync(), (e2 = this.delegate) != null && typeof e2.compositionControllerDidSyncDocumentView == "function" && e2.compositionControllerDidSyncDocumentView()), (n2 = this.delegate) != null && typeof n2.compositionControllerDidRender == "function" ? n2.compositionControllerDidRender() : void 0;
            }, c.prototype.rerenderViewForObject = function(t3) {
              return this.invalidateViewForObject(t3), this.render();
            }, c.prototype.invalidateViewForObject = function(t3) {
              return this.documentView.invalidateViewForObject(t3);
            }, c.prototype.isViewCachingEnabled = function() {
              return this.documentView.isViewCachingEnabled();
            }, c.prototype.enableViewCaching = function() {
              return this.documentView.enableViewCaching();
            }, c.prototype.disableViewCaching = function() {
              return this.documentView.disableViewCaching();
            }, c.prototype.refreshViewCache = function() {
              return this.documentView.garbageCollectCachedViews();
            }, c.prototype.isEditingAttachment = function() {
              return this.attachmentEditor != null;
            }, c.prototype.installAttachmentEditorForAttachment = function(t3, n2) {
              var i2, o2, r2;
              if (((r2 = this.attachmentEditor) != null ? r2.attachment : void 0) !== t3 && (o2 = this.documentView.findElementForObject(t3)))
                return this.uninstallAttachmentEditor(), i2 = this.composition.document.getAttachmentPieceForAttachment(t3), this.attachmentEditor = new e.AttachmentEditorController(i2, o2, this.element, n2), this.attachmentEditor.delegate = this;
            }, c.prototype.uninstallAttachmentEditor = function() {
              var t3;
              return (t3 = this.attachmentEditor) != null ? t3.uninstall() : void 0;
            }, c.prototype.didUninstallAttachmentEditor = function() {
              return this.attachmentEditor = null, this.render();
            }, c.prototype.attachmentEditorDidRequestUpdatingAttributesForAttachment = function(t3, e2) {
              var n2;
              return (n2 = this.delegate) != null && typeof n2.compositionControllerWillUpdateAttachment == "function" && n2.compositionControllerWillUpdateAttachment(e2), this.composition.updateAttributesForAttachment(t3, e2);
            }, c.prototype.attachmentEditorDidRequestRemovingAttributeForAttachment = function(t3, e2) {
              var n2;
              return (n2 = this.delegate) != null && typeof n2.compositionControllerWillUpdateAttachment == "function" && n2.compositionControllerWillUpdateAttachment(e2), this.composition.removeAttributeForAttachment(t3, e2);
            }, c.prototype.attachmentEditorDidRequestRemovalOfAttachment = function(t3) {
              var e2;
              return (e2 = this.delegate) != null && typeof e2.compositionControllerDidRequestRemovalOfAttachment == "function" ? e2.compositionControllerDidRequestRemovalOfAttachment(t3) : void 0;
            }, c.prototype.attachmentEditorDidRequestDeselectingAttachment = function(t3) {
              var e2;
              return (e2 = this.delegate) != null && typeof e2.compositionControllerDidRequestDeselectingAttachment == "function" ? e2.compositionControllerDidRequestDeselectingAttachment(t3) : void 0;
            }, c.prototype.canSyncDocumentView = function() {
              return !this.isEditingAttachment();
            }, c.prototype.findAttachmentForElement = function(t3) {
              return this.composition.document.getAttachmentById(parseInt(t3.dataset.trixId, 10));
            }, c;
          }(e.BasicObject);
        }.call(this), function() {
          var t2, n, i, o = function(t3, e2) {
            return function() {
              return t3.apply(e2, arguments);
            };
          }, r = function(t3, e2) {
            function n2() {
              this.constructor = t3;
            }
            for (var i2 in e2)
              s.call(e2, i2) && (t3[i2] = e2[i2]);
            return n2.prototype = e2.prototype, t3.prototype = new n2(), t3.__super__ = e2.prototype, t3;
          }, s = {}.hasOwnProperty;
          n = e.handleEvent, i = e.triggerEvent, t2 = e.findClosestElementFromNode, e.ToolbarController = function(e2) {
            function s2(t3) {
              this.element = t3, this.didKeyDownDialogInput = o(this.didKeyDownDialogInput, this), this.didClickDialogButton = o(this.didClickDialogButton, this), this.didClickAttributeButton = o(this.didClickAttributeButton, this), this.didClickActionButton = o(this.didClickActionButton, this), this.attributes = {}, this.actions = {}, this.resetDialogInputs(), n("mousedown", { onElement: this.element, matchingSelector: a, withCallback: this.didClickActionButton }), n("mousedown", { onElement: this.element, matchingSelector: c, withCallback: this.didClickAttributeButton }), n("click", { onElement: this.element, matchingSelector: v, preventDefault: true }), n("click", { onElement: this.element, matchingSelector: l, withCallback: this.didClickDialogButton }), n("keydown", { onElement: this.element, matchingSelector: h, withCallback: this.didKeyDownDialogInput });
            }
            var a, u, c, l, h, p, d, f, g, m, v;
            return r(s2, e2), c = "[data-trix-attribute]", a = "[data-trix-action]", v = c + ", " + a, p = "[data-trix-dialog]", u = p + "[data-trix-active]", l = p + " [data-trix-method]", h = p + " [data-trix-input]", s2.prototype.didClickActionButton = function(t3, e3) {
              var n2, i2, o2;
              return (i2 = this.delegate) != null && i2.toolbarDidClickButton(), t3.preventDefault(), n2 = d(e3), this.getDialog(n2) ? this.toggleDialog(n2) : (o2 = this.delegate) != null ? o2.toolbarDidInvokeAction(n2) : void 0;
            }, s2.prototype.didClickAttributeButton = function(t3, e3) {
              var n2, i2, o2;
              return (i2 = this.delegate) != null && i2.toolbarDidClickButton(), t3.preventDefault(), n2 = f(e3), this.getDialog(n2) ? this.toggleDialog(n2) : (o2 = this.delegate) != null && o2.toolbarDidToggleAttribute(n2), this.refreshAttributeButtons();
            }, s2.prototype.didClickDialogButton = function(e3, n2) {
              var i2, o2;
              return i2 = t2(n2, { matchingSelector: p }), o2 = n2.getAttribute("data-trix-method"), this[o2].call(this, i2);
            }, s2.prototype.didKeyDownDialogInput = function(t3, e3) {
              var n2, i2;
              return t3.keyCode === 13 && (t3.preventDefault(), n2 = e3.getAttribute("name"), i2 = this.getDialog(n2), this.setAttribute(i2)), t3.keyCode === 27 ? (t3.preventDefault(), this.hideDialog()) : void 0;
            }, s2.prototype.updateActions = function(t3) {
              return this.actions = t3, this.refreshActionButtons();
            }, s2.prototype.refreshActionButtons = function() {
              return this.eachActionButton(function(t3) {
                return function(e3, n2) {
                  return e3.disabled = t3.actions[n2] === false;
                };
              }(this));
            }, s2.prototype.eachActionButton = function(t3) {
              var e3, n2, i2, o2, r2;
              for (o2 = this.element.querySelectorAll(a), r2 = [], n2 = 0, i2 = o2.length; i2 > n2; n2++)
                e3 = o2[n2], r2.push(t3(e3, d(e3)));
              return r2;
            }, s2.prototype.updateAttributes = function(t3) {
              return this.attributes = t3, this.refreshAttributeButtons();
            }, s2.prototype.refreshAttributeButtons = function() {
              return this.eachAttributeButton(function(t3) {
                return function(e3, n2) {
                  return e3.disabled = t3.attributes[n2] === false, t3.attributes[n2] || t3.dialogIsVisible(n2) ? (e3.setAttribute("data-trix-active", ""), e3.classList.add("trix-active")) : (e3.removeAttribute("data-trix-active"), e3.classList.remove("trix-active"));
                };
              }(this));
            }, s2.prototype.eachAttributeButton = function(t3) {
              var e3, n2, i2, o2, r2;
              for (o2 = this.element.querySelectorAll(c), r2 = [], n2 = 0, i2 = o2.length; i2 > n2; n2++)
                e3 = o2[n2], r2.push(t3(e3, f(e3)));
              return r2;
            }, s2.prototype.applyKeyboardCommand = function(t3) {
              var e3, n2, o2, r2, s3, a2, u2;
              for (s3 = JSON.stringify(t3.sort()), u2 = this.element.querySelectorAll("[data-trix-key]"), r2 = 0, a2 = u2.length; a2 > r2; r2++)
                if (e3 = u2[r2], o2 = e3.getAttribute("data-trix-key").split("+"), n2 = JSON.stringify(o2.sort()), n2 === s3)
                  return i("mousedown", { onElement: e3 }), true;
              return false;
            }, s2.prototype.dialogIsVisible = function(t3) {
              var e3;
              return (e3 = this.getDialog(t3)) ? e3.hasAttribute("data-trix-active") : void 0;
            }, s2.prototype.toggleDialog = function(t3) {
              return this.dialogIsVisible(t3) ? this.hideDialog() : this.showDialog(t3);
            }, s2.prototype.showDialog = function(t3) {
              var e3, n2, i2, o2, r2, s3, a2, u2, c2, l2;
              for (this.hideDialog(), (a2 = this.delegate) != null && a2.toolbarWillShowDialog(), i2 = this.getDialog(t3), i2.setAttribute("data-trix-active", ""), i2.classList.add("trix-active"), u2 = i2.querySelectorAll("input[disabled]"), o2 = 0, s3 = u2.length; s3 > o2; o2++)
                n2 = u2[o2], n2.removeAttribute("disabled");
              return (e3 = f(i2)) && (r2 = m(i2, t3)) && (r2.value = (c2 = this.attributes[e3]) != null ? c2 : "", r2.select()), (l2 = this.delegate) != null ? l2.toolbarDidShowDialog(t3) : void 0;
            }, s2.prototype.setAttribute = function(t3) {
              var e3, n2, i2;
              return e3 = f(t3), n2 = m(t3, e3), n2.willValidate && !n2.checkValidity() ? (n2.setAttribute("data-trix-validate", ""), n2.classList.add("trix-validate"), n2.focus()) : ((i2 = this.delegate) != null && i2.toolbarDidUpdateAttribute(e3, n2.value), this.hideDialog());
            }, s2.prototype.removeAttribute = function(t3) {
              var e3, n2;
              return e3 = f(t3), (n2 = this.delegate) != null && n2.toolbarDidRemoveAttribute(e3), this.hideDialog();
            }, s2.prototype.hideDialog = function() {
              var t3, e3;
              return (t3 = this.element.querySelector(u)) ? (t3.removeAttribute("data-trix-active"), t3.classList.remove("trix-active"), this.resetDialogInputs(), (e3 = this.delegate) != null ? e3.toolbarDidHideDialog(g(t3)) : void 0) : void 0;
            }, s2.prototype.resetDialogInputs = function() {
              var t3, e3, n2, i2, o2;
              for (i2 = this.element.querySelectorAll(h), o2 = [], t3 = 0, n2 = i2.length; n2 > t3; t3++)
                e3 = i2[t3], e3.setAttribute("disabled", "disabled"), e3.removeAttribute("data-trix-validate"), o2.push(e3.classList.remove("trix-validate"));
              return o2;
            }, s2.prototype.getDialog = function(t3) {
              return this.element.querySelector("[data-trix-dialog=" + t3 + "]");
            }, m = function(t3, e3) {
              return e3 == null && (e3 = f(t3)), t3.querySelector("[data-trix-input][name='" + e3 + "']");
            }, d = function(t3) {
              return t3.getAttribute("data-trix-action");
            }, f = function(t3) {
              var e3;
              return (e3 = t3.getAttribute("data-trix-attribute")) != null ? e3 : t3.getAttribute("data-trix-dialog-attribute");
            }, g = function(t3) {
              return t3.getAttribute("data-trix-dialog");
            }, s2;
          }(e.BasicObject);
        }.call(this), function() {
          var t2 = function(t3, e2) {
            function i() {
              this.constructor = t3;
            }
            for (var o in e2)
              n.call(e2, o) && (t3[o] = e2[o]);
            return i.prototype = e2.prototype, t3.prototype = new i(), t3.__super__ = e2.prototype, t3;
          }, n = {}.hasOwnProperty;
          e.ImagePreloadOperation = function(e2) {
            function n2(t3) {
              this.url = t3;
            }
            return t2(n2, e2), n2.prototype.perform = function(t3) {
              var e3;
              return e3 = new Image(), e3.onload = function(n3) {
                return function() {
                  return e3.width = n3.width = e3.naturalWidth, e3.height = n3.height = e3.naturalHeight, t3(true, e3);
                };
              }(this), e3.onerror = function() {
                return t3(false);
              }, e3.src = this.url;
            }, n2;
          }(e.Operation);
        }.call(this), function() {
          var t2 = function(t3, e2) {
            return function() {
              return t3.apply(e2, arguments);
            };
          }, n = function(t3, e2) {
            function n2() {
              this.constructor = t3;
            }
            for (var o in e2)
              i.call(e2, o) && (t3[o] = e2[o]);
            return n2.prototype = e2.prototype, t3.prototype = new n2(), t3.__super__ = e2.prototype, t3;
          }, i = {}.hasOwnProperty;
          e.Attachment = function(i2) {
            function o(n2) {
              n2 == null && (n2 = {}), this.releaseFile = t2(this.releaseFile, this), o.__super__.constructor.apply(this, arguments), this.attributes = e.Hash.box(n2), this.didChangeAttributes();
            }
            return n(o, i2), o.previewablePattern = /^image(\/(gif|png|jpe?g)|$)/, o.attachmentForFile = function(t3) {
              var e2, n2;
              return n2 = this.attributesForFile(t3), e2 = new this(n2), e2.setFile(t3), e2;
            }, o.attributesForFile = function(t3) {
              return new e.Hash({ filename: t3.name, filesize: t3.size, contentType: t3.type });
            }, o.fromJSON = function(t3) {
              return new this(t3);
            }, o.prototype.getAttribute = function(t3) {
              return this.attributes.get(t3);
            }, o.prototype.hasAttribute = function(t3) {
              return this.attributes.has(t3);
            }, o.prototype.getAttributes = function() {
              return this.attributes.toObject();
            }, o.prototype.setAttributes = function(t3) {
              var e2, n2, i3;
              return t3 == null && (t3 = {}), e2 = this.attributes.merge(t3), this.attributes.isEqualTo(e2) ? void 0 : (this.attributes = e2, this.didChangeAttributes(), (n2 = this.previewDelegate) != null && typeof n2.attachmentDidChangeAttributes == "function" && n2.attachmentDidChangeAttributes(this), (i3 = this.delegate) != null && typeof i3.attachmentDidChangeAttributes == "function" ? i3.attachmentDidChangeAttributes(this) : void 0);
            }, o.prototype.didChangeAttributes = function() {
              return this.isPreviewable() ? this.preloadURL() : void 0;
            }, o.prototype.isPending = function() {
              return this.file != null && !(this.getURL() || this.getHref());
            }, o.prototype.isPreviewable = function() {
              return this.attributes.has("previewable") ? this.attributes.get("previewable") : this.constructor.previewablePattern.test(this.getContentType());
            }, o.prototype.getType = function() {
              return this.hasContent() ? "content" : this.isPreviewable() ? "preview" : "file";
            }, o.prototype.getURL = function() {
              return this.attributes.get("url");
            }, o.prototype.getHref = function() {
              return this.attributes.get("href");
            }, o.prototype.getFilename = function() {
              var t3;
              return (t3 = this.attributes.get("filename")) != null ? t3 : "";
            }, o.prototype.getFilesize = function() {
              return this.attributes.get("filesize");
            }, o.prototype.getFormattedFilesize = function() {
              var t3;
              return t3 = this.attributes.get("filesize"), typeof t3 == "number" ? e.config.fileSize.formatter(t3) : "";
            }, o.prototype.getExtension = function() {
              var t3;
              return (t3 = this.getFilename().match(/\.(\w+)$/)) != null ? t3[1].toLowerCase() : void 0;
            }, o.prototype.getContentType = function() {
              return this.attributes.get("contentType");
            }, o.prototype.hasContent = function() {
              return this.attributes.has("content");
            }, o.prototype.getContent = function() {
              return this.attributes.get("content");
            }, o.prototype.getWidth = function() {
              return this.attributes.get("width");
            }, o.prototype.getHeight = function() {
              return this.attributes.get("height");
            }, o.prototype.getFile = function() {
              return this.file;
            }, o.prototype.setFile = function(t3) {
              return this.file = t3, this.isPreviewable() ? this.preloadFile() : void 0;
            }, o.prototype.releaseFile = function() {
              return this.releasePreloadedFile(), this.file = null;
            }, o.prototype.getUploadProgress = function() {
              var t3;
              return (t3 = this.uploadProgress) != null ? t3 : 0;
            }, o.prototype.setUploadProgress = function(t3) {
              var e2;
              return this.uploadProgress !== t3 ? (this.uploadProgress = t3, (e2 = this.uploadProgressDelegate) != null && typeof e2.attachmentDidChangeUploadProgress == "function" ? e2.attachmentDidChangeUploadProgress(this) : void 0) : void 0;
            }, o.prototype.toJSON = function() {
              return this.getAttributes();
            }, o.prototype.getCacheKey = function() {
              return [o.__super__.getCacheKey.apply(this, arguments), this.attributes.getCacheKey(), this.getPreviewURL()].join("/");
            }, o.prototype.getPreviewURL = function() {
              return this.previewURL || this.preloadingURL;
            }, o.prototype.setPreviewURL = function(t3) {
              var e2, n2;
              return t3 !== this.getPreviewURL() ? (this.previewURL = t3, (e2 = this.previewDelegate) != null && typeof e2.attachmentDidChangeAttributes == "function" && e2.attachmentDidChangeAttributes(this), (n2 = this.delegate) != null && typeof n2.attachmentDidChangePreviewURL == "function" ? n2.attachmentDidChangePreviewURL(this) : void 0) : void 0;
            }, o.prototype.preloadURL = function() {
              return this.preload(this.getURL(), this.releaseFile);
            }, o.prototype.preloadFile = function() {
              return this.file ? (this.fileObjectURL = URL.createObjectURL(this.file), this.preload(this.fileObjectURL)) : void 0;
            }, o.prototype.releasePreloadedFile = function() {
              return this.fileObjectURL ? (URL.revokeObjectURL(this.fileObjectURL), this.fileObjectURL = null) : void 0;
            }, o.prototype.preload = function(t3, n2) {
              var i3;
              return t3 && t3 !== this.getPreviewURL() ? (this.preloadingURL = t3, i3 = new e.ImagePreloadOperation(t3), i3.then(function(e2) {
                return function(i4) {
                  var o2, r;
                  return r = i4.width, o2 = i4.height, e2.getWidth() && e2.getHeight() || e2.setAttributes({ width: r, height: o2 }), e2.preloadingURL = null, e2.setPreviewURL(t3), typeof n2 == "function" ? n2() : void 0;
                };
              }(this))["catch"](function(t4) {
                return function() {
                  return t4.preloadingURL = null, typeof n2 == "function" ? n2() : void 0;
                };
              }(this))) : void 0;
            }, o;
          }(e.Object);
        }.call(this), function() {
          var t2 = function(t3, e2) {
            function i() {
              this.constructor = t3;
            }
            for (var o in e2)
              n.call(e2, o) && (t3[o] = e2[o]);
            return i.prototype = e2.prototype, t3.prototype = new i(), t3.__super__ = e2.prototype, t3;
          }, n = {}.hasOwnProperty;
          e.Piece = function(n2) {
            function i(t3, n3) {
              n3 == null && (n3 = {}), i.__super__.constructor.apply(this, arguments), this.attributes = e.Hash.box(n3);
            }
            return t2(i, n2), i.types = {}, i.registerType = function(t3, e2) {
              return e2.type = t3, this.types[t3] = e2;
            }, i.fromJSON = function(t3) {
              var e2;
              return (e2 = this.types[t3.type]) ? e2.fromJSON(t3) : void 0;
            }, i.prototype.copyWithAttributes = function(t3) {
              return new this.constructor(this.getValue(), t3);
            }, i.prototype.copyWithAdditionalAttributes = function(t3) {
              return this.copyWithAttributes(this.attributes.merge(t3));
            }, i.prototype.copyWithoutAttribute = function(t3) {
              return this.copyWithAttributes(this.attributes.remove(t3));
            }, i.prototype.copy = function() {
              return this.copyWithAttributes(this.attributes);
            }, i.prototype.getAttribute = function(t3) {
              return this.attributes.get(t3);
            }, i.prototype.getAttributesHash = function() {
              return this.attributes;
            }, i.prototype.getAttributes = function() {
              return this.attributes.toObject();
            }, i.prototype.getCommonAttributes = function() {
              var t3, e2, n3;
              return (n3 = pieceList.getPieceAtIndex(0)) ? (t3 = n3.attributes, e2 = t3.getKeys(), pieceList.eachPiece(function(n4) {
                return e2 = t3.getKeysCommonToHash(n4.attributes), t3 = t3.slice(e2);
              }), t3.toObject()) : {};
            }, i.prototype.hasAttribute = function(t3) {
              return this.attributes.has(t3);
            }, i.prototype.hasSameStringValueAsPiece = function(t3) {
              return t3 != null && this.toString() === t3.toString();
            }, i.prototype.hasSameAttributesAsPiece = function(t3) {
              return t3 != null && (this.attributes === t3.attributes || this.attributes.isEqualTo(t3.attributes));
            }, i.prototype.isBlockBreak = function() {
              return false;
            }, i.prototype.isEqualTo = function(t3) {
              return i.__super__.isEqualTo.apply(this, arguments) || this.hasSameConstructorAs(t3) && this.hasSameStringValueAsPiece(t3) && this.hasSameAttributesAsPiece(t3);
            }, i.prototype.isEmpty = function() {
              return this.length === 0;
            }, i.prototype.isSerializable = function() {
              return true;
            }, i.prototype.toJSON = function() {
              return { type: this.constructor.type, attributes: this.getAttributes() };
            }, i.prototype.contentsForInspection = function() {
              return { type: this.constructor.type, attributes: this.attributes.inspect() };
            }, i.prototype.canBeGrouped = function() {
              return this.hasAttribute("href");
            }, i.prototype.canBeGroupedWith = function(t3) {
              return this.getAttribute("href") === t3.getAttribute("href");
            }, i.prototype.getLength = function() {
              return this.length;
            }, i.prototype.canBeConsolidatedWith = function() {
              return false;
            }, i;
          }(e.Object);
        }.call(this), function() {
          var t2 = function(t3, e2) {
            function i() {
              this.constructor = t3;
            }
            for (var o in e2)
              n.call(e2, o) && (t3[o] = e2[o]);
            return i.prototype = e2.prototype, t3.prototype = new i(), t3.__super__ = e2.prototype, t3;
          }, n = {}.hasOwnProperty;
          e.Piece.registerType("attachment", e.AttachmentPiece = function(n2) {
            function i(t3) {
              this.attachment = t3, i.__super__.constructor.apply(this, arguments), this.length = 1, this.ensureAttachmentExclusivelyHasAttribute("href"), this.attachment.hasContent() || this.removeProhibitedAttributes();
            }
            return t2(i, n2), i.fromJSON = function(t3) {
              return new this(e.Attachment.fromJSON(t3.attachment), t3.attributes);
            }, i.permittedAttributes = ["caption", "presentation"], i.prototype.ensureAttachmentExclusivelyHasAttribute = function(t3) {
              return this.hasAttribute(t3) ? (this.attachment.hasAttribute(t3) || this.attachment.setAttributes(this.attributes.slice(t3)), this.attributes = this.attributes.remove(t3)) : void 0;
            }, i.prototype.removeProhibitedAttributes = function() {
              var t3;
              return t3 = this.attributes.slice(this.constructor.permittedAttributes), t3.isEqualTo(this.attributes) ? void 0 : this.attributes = t3;
            }, i.prototype.getValue = function() {
              return this.attachment;
            }, i.prototype.isSerializable = function() {
              return !this.attachment.isPending();
            }, i.prototype.getCaption = function() {
              var t3;
              return (t3 = this.attributes.get("caption")) != null ? t3 : "";
            }, i.prototype.isEqualTo = function(t3) {
              var e2;
              return i.__super__.isEqualTo.apply(this, arguments) && this.attachment.id === (t3 != null && (e2 = t3.attachment) != null ? e2.id : void 0);
            }, i.prototype.toString = function() {
              return e.OBJECT_REPLACEMENT_CHARACTER;
            }, i.prototype.toJSON = function() {
              var t3;
              return t3 = i.__super__.toJSON.apply(this, arguments), t3.attachment = this.attachment, t3;
            }, i.prototype.getCacheKey = function() {
              return [i.__super__.getCacheKey.apply(this, arguments), this.attachment.getCacheKey()].join("/");
            }, i.prototype.toConsole = function() {
              return JSON.stringify(this.toString());
            }, i;
          }(e.Piece));
        }.call(this), function() {
          var t2, n = function(t3, e2) {
            function n2() {
              this.constructor = t3;
            }
            for (var o in e2)
              i.call(e2, o) && (t3[o] = e2[o]);
            return n2.prototype = e2.prototype, t3.prototype = new n2(), t3.__super__ = e2.prototype, t3;
          }, i = {}.hasOwnProperty;
          t2 = e.normalizeNewlines, e.Piece.registerType("string", e.StringPiece = function(e2) {
            function i2(e3) {
              i2.__super__.constructor.apply(this, arguments), this.string = t2(e3), this.length = this.string.length;
            }
            return n(i2, e2), i2.fromJSON = function(t3) {
              return new this(t3.string, t3.attributes);
            }, i2.prototype.getValue = function() {
              return this.string;
            }, i2.prototype.toString = function() {
              return this.string.toString();
            }, i2.prototype.isBlockBreak = function() {
              return this.toString() === "\n" && this.getAttribute("blockBreak") === true;
            }, i2.prototype.toJSON = function() {
              var t3;
              return t3 = i2.__super__.toJSON.apply(this, arguments), t3.string = this.string, t3;
            }, i2.prototype.canBeConsolidatedWith = function(t3) {
              return t3 != null && this.hasSameConstructorAs(t3) && this.hasSameAttributesAsPiece(t3);
            }, i2.prototype.consolidateWith = function(t3) {
              return new this.constructor(this.toString() + t3.toString(), this.attributes);
            }, i2.prototype.splitAtOffset = function(t3) {
              var e3, n2;
              return t3 === 0 ? (e3 = null, n2 = this) : t3 === this.length ? (e3 = this, n2 = null) : (e3 = new this.constructor(this.string.slice(0, t3), this.attributes), n2 = new this.constructor(this.string.slice(t3), this.attributes)), [e3, n2];
            }, i2.prototype.toConsole = function() {
              var t3;
              return t3 = this.string, t3.length > 15 && (t3 = t3.slice(0, 14) + "\u2026"), JSON.stringify(t3.toString());
            }, i2;
          }(e.Piece));
        }.call(this), function() {
          var t2, n = function(t3, e2) {
            function n2() {
              this.constructor = t3;
            }
            for (var o2 in e2)
              i.call(e2, o2) && (t3[o2] = e2[o2]);
            return n2.prototype = e2.prototype, t3.prototype = new n2(), t3.__super__ = e2.prototype, t3;
          }, i = {}.hasOwnProperty, o = [].slice;
          t2 = e.spliceArray, e.SplittableList = function(e2) {
            function i2(t3) {
              t3 == null && (t3 = []), i2.__super__.constructor.apply(this, arguments), this.objects = t3.slice(0), this.length = this.objects.length;
            }
            var r, s, a;
            return n(i2, e2), i2.box = function(t3) {
              return t3 instanceof this ? t3 : new this(t3);
            }, i2.prototype.indexOf = function(t3) {
              return this.objects.indexOf(t3);
            }, i2.prototype.splice = function() {
              var e3;
              return e3 = 1 <= arguments.length ? o.call(arguments, 0) : [], new this.constructor(t2.apply(null, [this.objects].concat(o.call(e3))));
            }, i2.prototype.eachObject = function(t3) {
              var e3, n2, i3, o2, r2, s2;
              for (r2 = this.objects, s2 = [], n2 = e3 = 0, i3 = r2.length; i3 > e3; n2 = ++e3)
                o2 = r2[n2], s2.push(t3(o2, n2));
              return s2;
            }, i2.prototype.insertObjectAtIndex = function(t3, e3) {
              return this.splice(e3, 0, t3);
            }, i2.prototype.insertSplittableListAtIndex = function(t3, e3) {
              return this.splice.apply(this, [e3, 0].concat(o.call(t3.objects)));
            }, i2.prototype.insertSplittableListAtPosition = function(t3, e3) {
              var n2, i3, o2;
              return o2 = this.splitObjectAtPosition(e3), i3 = o2[0], n2 = o2[1], new this.constructor(i3).insertSplittableListAtIndex(t3, n2);
            }, i2.prototype.editObjectAtIndex = function(t3, e3) {
              return this.replaceObjectAtIndex(e3(this.objects[t3]), t3);
            }, i2.prototype.replaceObjectAtIndex = function(t3, e3) {
              return this.splice(e3, 1, t3);
            }, i2.prototype.removeObjectAtIndex = function(t3) {
              return this.splice(t3, 1);
            }, i2.prototype.getObjectAtIndex = function(t3) {
              return this.objects[t3];
            }, i2.prototype.getSplittableListInRange = function(t3) {
              var e3, n2, i3, o2;
              return i3 = this.splitObjectsAtRange(t3), n2 = i3[0], e3 = i3[1], o2 = i3[2], new this.constructor(n2.slice(e3, o2 + 1));
            }, i2.prototype.selectSplittableList = function(t3) {
              var e3, n2;
              return n2 = function() {
                var n3, i3, o2, r2;
                for (o2 = this.objects, r2 = [], n3 = 0, i3 = o2.length; i3 > n3; n3++)
                  e3 = o2[n3], t3(e3) && r2.push(e3);
                return r2;
              }.call(this), new this.constructor(n2);
            }, i2.prototype.removeObjectsInRange = function(t3) {
              var e3, n2, i3, o2;
              return i3 = this.splitObjectsAtRange(t3), n2 = i3[0], e3 = i3[1], o2 = i3[2], new this.constructor(n2).splice(e3, o2 - e3 + 1);
            }, i2.prototype.transformObjectsInRange = function(t3, e3) {
              var n2, i3, o2, r2, s2, a2, u;
              return s2 = this.splitObjectsAtRange(t3), r2 = s2[0], i3 = s2[1], a2 = s2[2], u = function() {
                var t4, s3, u2;
                for (u2 = [], n2 = t4 = 0, s3 = r2.length; s3 > t4; n2 = ++t4)
                  o2 = r2[n2], u2.push(n2 >= i3 && a2 >= n2 ? e3(o2) : o2);
                return u2;
              }(), new this.constructor(u);
            }, i2.prototype.splitObjectsAtRange = function(t3) {
              var e3, n2, i3, o2, s2, u;
              return o2 = this.splitObjectAtPosition(a(t3)), n2 = o2[0], e3 = o2[1], i3 = o2[2], s2 = new this.constructor(n2).splitObjectAtPosition(r(t3) + i3), n2 = s2[0], u = s2[1], [n2, e3, u - 1];
            }, i2.prototype.getObjectAtPosition = function(t3) {
              var e3, n2, i3;
              return i3 = this.findIndexAndOffsetAtPosition(t3), e3 = i3.index, n2 = i3.offset, this.objects[e3];
            }, i2.prototype.splitObjectAtPosition = function(t3) {
              var e3, n2, i3, o2, r2, s2, a2, u, c, l;
              return s2 = this.findIndexAndOffsetAtPosition(t3), e3 = s2.index, r2 = s2.offset, o2 = this.objects.slice(0), e3 != null ? r2 === 0 ? (c = e3, l = 0) : (i3 = this.getObjectAtIndex(e3), a2 = i3.splitAtOffset(r2), n2 = a2[0], u = a2[1], o2.splice(e3, 1, n2, u), c = e3 + 1, l = n2.getLength() - r2) : (c = o2.length, l = 0), [o2, c, l];
            }, i2.prototype.consolidate = function() {
              var t3, e3, n2, i3, o2, r2;
              for (i3 = [], o2 = this.objects[0], r2 = this.objects.slice(1), t3 = 0, e3 = r2.length; e3 > t3; t3++)
                n2 = r2[t3], (typeof o2.canBeConsolidatedWith == "function" ? o2.canBeConsolidatedWith(n2) : void 0) ? o2 = o2.consolidateWith(n2) : (i3.push(o2), o2 = n2);
              return o2 != null && i3.push(o2), new this.constructor(i3);
            }, i2.prototype.consolidateFromIndexToIndex = function(t3, e3) {
              var n2, i3, r2;
              return i3 = this.objects.slice(0), r2 = i3.slice(t3, e3 + 1), n2 = new this.constructor(r2).consolidate().toArray(), this.splice.apply(this, [t3, r2.length].concat(o.call(n2)));
            }, i2.prototype.findIndexAndOffsetAtPosition = function(t3) {
              var e3, n2, i3, o2, r2, s2, a2;
              for (e3 = 0, a2 = this.objects, i3 = n2 = 0, o2 = a2.length; o2 > n2; i3 = ++n2) {
                if (s2 = a2[i3], r2 = e3 + s2.getLength(), t3 >= e3 && r2 > t3)
                  return { index: i3, offset: t3 - e3 };
                e3 = r2;
              }
              return { index: null, offset: null };
            }, i2.prototype.findPositionAtIndexAndOffset = function(t3, e3) {
              var n2, i3, o2, r2, s2, a2;
              for (s2 = 0, a2 = this.objects, n2 = i3 = 0, o2 = a2.length; o2 > i3; n2 = ++i3)
                if (r2 = a2[n2], t3 > n2)
                  s2 += r2.getLength();
                else if (n2 === t3) {
                  s2 += e3;
                  break;
                }
              return s2;
            }, i2.prototype.getEndPosition = function() {
              var t3, e3;
              return this.endPosition != null ? this.endPosition : this.endPosition = function() {
                var n2, i3, o2;
                for (e3 = 0, o2 = this.objects, n2 = 0, i3 = o2.length; i3 > n2; n2++)
                  t3 = o2[n2], e3 += t3.getLength();
                return e3;
              }.call(this);
            }, i2.prototype.toString = function() {
              return this.objects.join("");
            }, i2.prototype.toArray = function() {
              return this.objects.slice(0);
            }, i2.prototype.toJSON = function() {
              return this.toArray();
            }, i2.prototype.isEqualTo = function(t3) {
              return i2.__super__.isEqualTo.apply(this, arguments) || s(this.objects, t3 != null ? t3.objects : void 0);
            }, s = function(t3, e3) {
              var n2, i3, o2, r2, s2;
              if (e3 == null && (e3 = []), t3.length !== e3.length)
                return false;
              for (s2 = true, i3 = n2 = 0, o2 = t3.length; o2 > n2; i3 = ++n2)
                r2 = t3[i3], s2 && !r2.isEqualTo(e3[i3]) && (s2 = false);
              return s2;
            }, i2.prototype.contentsForInspection = function() {
              var t3;
              return { objects: "[" + function() {
                var e3, n2, i3, o2;
                for (i3 = this.objects, o2 = [], e3 = 0, n2 = i3.length; n2 > e3; e3++)
                  t3 = i3[e3], o2.push(t3.inspect());
                return o2;
              }.call(this).join(", ") + "]" };
            }, a = function(t3) {
              return t3[0];
            }, r = function(t3) {
              return t3[1];
            }, i2;
          }(e.Object);
        }.call(this), function() {
          var t2 = function(t3, e2) {
            function i() {
              this.constructor = t3;
            }
            for (var o in e2)
              n.call(e2, o) && (t3[o] = e2[o]);
            return i.prototype = e2.prototype, t3.prototype = new i(), t3.__super__ = e2.prototype, t3;
          }, n = {}.hasOwnProperty;
          e.Text = function(n2) {
            function i(t3) {
              var n3;
              t3 == null && (t3 = []), i.__super__.constructor.apply(this, arguments), this.pieceList = new e.SplittableList(function() {
                var e2, i2, o;
                for (o = [], e2 = 0, i2 = t3.length; i2 > e2; e2++)
                  n3 = t3[e2], n3.isEmpty() || o.push(n3);
                return o;
              }());
            }
            return t2(i, n2), i.textForAttachmentWithAttributes = function(t3, n3) {
              var i2;
              return i2 = new e.AttachmentPiece(t3, n3), new this([i2]);
            }, i.textForStringWithAttributes = function(t3, n3) {
              var i2;
              return i2 = new e.StringPiece(t3, n3), new this([i2]);
            }, i.fromJSON = function(t3) {
              var n3, i2;
              return i2 = function() {
                var i3, o, r;
                for (r = [], i3 = 0, o = t3.length; o > i3; i3++)
                  n3 = t3[i3], r.push(e.Piece.fromJSON(n3));
                return r;
              }(), new this(i2);
            }, i.prototype.copy = function() {
              return this.copyWithPieceList(this.pieceList);
            }, i.prototype.copyWithPieceList = function(t3) {
              return new this.constructor(t3.consolidate().toArray());
            }, i.prototype.copyUsingObjectMap = function(t3) {
              var e2, n3;
              return n3 = function() {
                var n4, i2, o, r, s;
                for (o = this.getPieces(), s = [], n4 = 0, i2 = o.length; i2 > n4; n4++)
                  e2 = o[n4], s.push((r = t3.find(e2)) != null ? r : e2);
                return s;
              }.call(this), new this.constructor(n3);
            }, i.prototype.appendText = function(t3) {
              return this.insertTextAtPosition(t3, this.getLength());
            }, i.prototype.insertTextAtPosition = function(t3, e2) {
              return this.copyWithPieceList(this.pieceList.insertSplittableListAtPosition(t3.pieceList, e2));
            }, i.prototype.removeTextAtRange = function(t3) {
              return this.copyWithPieceList(this.pieceList.removeObjectsInRange(t3));
            }, i.prototype.replaceTextAtRange = function(t3, e2) {
              return this.removeTextAtRange(e2).insertTextAtPosition(t3, e2[0]);
            }, i.prototype.moveTextFromRangeToPosition = function(t3, e2) {
              var n3, i2;
              if (!(t3[0] <= e2 && e2 <= t3[1]))
                return i2 = this.getTextAtRange(t3), n3 = i2.getLength(), t3[0] < e2 && (e2 -= n3), this.removeTextAtRange(t3).insertTextAtPosition(i2, e2);
            }, i.prototype.addAttributeAtRange = function(t3, e2, n3) {
              var i2;
              return i2 = {}, i2[t3] = e2, this.addAttributesAtRange(i2, n3);
            }, i.prototype.addAttributesAtRange = function(t3, e2) {
              return this.copyWithPieceList(this.pieceList.transformObjectsInRange(e2, function(e3) {
                return e3.copyWithAdditionalAttributes(t3);
              }));
            }, i.prototype.removeAttributeAtRange = function(t3, e2) {
              return this.copyWithPieceList(this.pieceList.transformObjectsInRange(e2, function(e3) {
                return e3.copyWithoutAttribute(t3);
              }));
            }, i.prototype.setAttributesAtRange = function(t3, e2) {
              return this.copyWithPieceList(this.pieceList.transformObjectsInRange(e2, function(e3) {
                return e3.copyWithAttributes(t3);
              }));
            }, i.prototype.getAttributesAtPosition = function(t3) {
              var e2, n3;
              return (e2 = (n3 = this.pieceList.getObjectAtPosition(t3)) != null ? n3.getAttributes() : void 0) != null ? e2 : {};
            }, i.prototype.getCommonAttributes = function() {
              var t3, n3;
              return t3 = function() {
                var t4, e2, i2, o;
                for (i2 = this.pieceList.toArray(), o = [], t4 = 0, e2 = i2.length; e2 > t4; t4++)
                  n3 = i2[t4], o.push(n3.getAttributes());
                return o;
              }.call(this), e.Hash.fromCommonAttributesOfObjects(t3).toObject();
            }, i.prototype.getCommonAttributesAtRange = function(t3) {
              var e2;
              return (e2 = this.getTextAtRange(t3).getCommonAttributes()) != null ? e2 : {};
            }, i.prototype.getExpandedRangeForAttributeAtOffset = function(t3, e2) {
              var n3, i2, o;
              for (n3 = o = e2, i2 = this.getLength(); n3 > 0 && this.getCommonAttributesAtRange([n3 - 1, o])[t3]; )
                n3--;
              for (; i2 > o && this.getCommonAttributesAtRange([e2, o + 1])[t3]; )
                o++;
              return [n3, o];
            }, i.prototype.getTextAtRange = function(t3) {
              return this.copyWithPieceList(this.pieceList.getSplittableListInRange(t3));
            }, i.prototype.getStringAtRange = function(t3) {
              return this.pieceList.getSplittableListInRange(t3).toString();
            }, i.prototype.getStringAtPosition = function(t3) {
              return this.getStringAtRange([t3, t3 + 1]);
            }, i.prototype.startsWithString = function(t3) {
              return this.getStringAtRange([0, t3.length]) === t3;
            }, i.prototype.endsWithString = function(t3) {
              var e2;
              return e2 = this.getLength(), this.getStringAtRange([e2 - t3.length, e2]) === t3;
            }, i.prototype.getAttachmentPieces = function() {
              var t3, e2, n3, i2, o;
              for (i2 = this.pieceList.toArray(), o = [], t3 = 0, e2 = i2.length; e2 > t3; t3++)
                n3 = i2[t3], n3.attachment != null && o.push(n3);
              return o;
            }, i.prototype.getAttachments = function() {
              var t3, e2, n3, i2, o;
              for (i2 = this.getAttachmentPieces(), o = [], t3 = 0, e2 = i2.length; e2 > t3; t3++)
                n3 = i2[t3], o.push(n3.attachment);
              return o;
            }, i.prototype.getAttachmentAndPositionById = function(t3) {
              var e2, n3, i2, o, r, s;
              for (o = 0, r = this.pieceList.toArray(), e2 = 0, n3 = r.length; n3 > e2; e2++) {
                if (i2 = r[e2], ((s = i2.attachment) != null ? s.id : void 0) === t3)
                  return { attachment: i2.attachment, position: o };
                o += i2.length;
              }
              return { attachment: null, position: null };
            }, i.prototype.getAttachmentById = function(t3) {
              var e2, n3, i2;
              return i2 = this.getAttachmentAndPositionById(t3), e2 = i2.attachment, n3 = i2.position, e2;
            }, i.prototype.getRangeOfAttachment = function(t3) {
              var e2, n3;
              return n3 = this.getAttachmentAndPositionById(t3.id), t3 = n3.attachment, e2 = n3.position, t3 != null ? [e2, e2 + 1] : void 0;
            }, i.prototype.updateAttributesForAttachment = function(t3, e2) {
              var n3;
              return (n3 = this.getRangeOfAttachment(e2)) ? this.addAttributesAtRange(t3, n3) : this;
            }, i.prototype.getLength = function() {
              return this.pieceList.getEndPosition();
            }, i.prototype.isEmpty = function() {
              return this.getLength() === 0;
            }, i.prototype.isEqualTo = function(t3) {
              var e2;
              return i.__super__.isEqualTo.apply(this, arguments) || (t3 != null && (e2 = t3.pieceList) != null ? e2.isEqualTo(this.pieceList) : void 0);
            }, i.prototype.isBlockBreak = function() {
              return this.getLength() === 1 && this.pieceList.getObjectAtIndex(0).isBlockBreak();
            }, i.prototype.eachPiece = function(t3) {
              return this.pieceList.eachObject(t3);
            }, i.prototype.getPieces = function() {
              return this.pieceList.toArray();
            }, i.prototype.getPieceAtPosition = function(t3) {
              return this.pieceList.getObjectAtPosition(t3);
            }, i.prototype.contentsForInspection = function() {
              return { pieceList: this.pieceList.inspect() };
            }, i.prototype.toSerializableText = function() {
              var t3;
              return t3 = this.pieceList.selectSplittableList(function(t4) {
                return t4.isSerializable();
              }), this.copyWithPieceList(t3);
            }, i.prototype.toString = function() {
              return this.pieceList.toString();
            }, i.prototype.toJSON = function() {
              return this.pieceList.toJSON();
            }, i.prototype.toConsole = function() {
              var t3;
              return JSON.stringify(function() {
                var e2, n3, i2, o;
                for (i2 = this.pieceList.toArray(), o = [], e2 = 0, n3 = i2.length; n3 > e2; e2++)
                  t3 = i2[e2], o.push(JSON.parse(t3.toConsole()));
                return o;
              }.call(this));
            }, i.prototype.getDirection = function() {
              return e.getDirection(this.toString());
            }, i.prototype.isRTL = function() {
              return this.getDirection() === "rtl";
            }, i;
          }(e.Object);
        }.call(this), function() {
          var t2, n, i, o, r, s = function(t3, e2) {
            function n2() {
              this.constructor = t3;
            }
            for (var i2 in e2)
              a.call(e2, i2) && (t3[i2] = e2[i2]);
            return n2.prototype = e2.prototype, t3.prototype = new n2(), t3.__super__ = e2.prototype, t3;
          }, a = {}.hasOwnProperty, u = [].indexOf || function(t3) {
            for (var e2 = 0, n2 = this.length; n2 > e2; e2++)
              if (e2 in this && this[e2] === t3)
                return e2;
            return -1;
          }, c = [].slice;
          t2 = e.arraysAreEqual, r = e.spliceArray, i = e.getBlockConfig, n = e.getBlockAttributeNames, o = e.getListAttributeNames, e.Block = function(n2) {
            function a2(t3, n3) {
              t3 == null && (t3 = new e.Text()), n3 == null && (n3 = []), a2.__super__.constructor.apply(this, arguments), this.text = h(t3), this.attributes = n3;
            }
            var l, h, p, d, f, g, m, v, y;
            return s(a2, n2), a2.fromJSON = function(t3) {
              var n3;
              return n3 = e.Text.fromJSON(t3.text), new this(n3, t3.attributes);
            }, a2.prototype.isEmpty = function() {
              return this.text.isBlockBreak();
            }, a2.prototype.isEqualTo = function(e2) {
              return a2.__super__.isEqualTo.apply(this, arguments) || this.text.isEqualTo(e2 != null ? e2.text : void 0) && t2(this.attributes, e2 != null ? e2.attributes : void 0);
            }, a2.prototype.copyWithText = function(t3) {
              return new this.constructor(t3, this.attributes);
            }, a2.prototype.copyWithoutText = function() {
              return this.copyWithText(null);
            }, a2.prototype.copyWithAttributes = function(t3) {
              return new this.constructor(this.text, t3);
            }, a2.prototype.copyWithoutAttributes = function() {
              return this.copyWithAttributes(null);
            }, a2.prototype.copyUsingObjectMap = function(t3) {
              var e2;
              return this.copyWithText((e2 = t3.find(this.text)) ? e2 : this.text.copyUsingObjectMap(t3));
            }, a2.prototype.addAttribute = function(t3) {
              var e2;
              return e2 = this.attributes.concat(d(t3)), this.copyWithAttributes(e2);
            }, a2.prototype.removeAttribute = function(t3) {
              var e2, n3;
              return n3 = i(t3).listAttribute, e2 = g(g(this.attributes, t3), n3), this.copyWithAttributes(e2);
            }, a2.prototype.removeLastAttribute = function() {
              return this.removeAttribute(this.getLastAttribute());
            }, a2.prototype.getLastAttribute = function() {
              return f(this.attributes);
            }, a2.prototype.getAttributes = function() {
              return this.attributes.slice(0);
            }, a2.prototype.getAttributeLevel = function() {
              return this.attributes.length;
            }, a2.prototype.getAttributeAtLevel = function(t3) {
              return this.attributes[t3 - 1];
            }, a2.prototype.hasAttribute = function(t3) {
              return u.call(this.attributes, t3) >= 0;
            }, a2.prototype.hasAttributes = function() {
              return this.getAttributeLevel() > 0;
            }, a2.prototype.getLastNestableAttribute = function() {
              return f(this.getNestableAttributes());
            }, a2.prototype.getNestableAttributes = function() {
              var t3, e2, n3, o2, r2;
              for (o2 = this.attributes, r2 = [], e2 = 0, n3 = o2.length; n3 > e2; e2++)
                t3 = o2[e2], i(t3).nestable && r2.push(t3);
              return r2;
            }, a2.prototype.getNestingLevel = function() {
              return this.getNestableAttributes().length;
            }, a2.prototype.decreaseNestingLevel = function() {
              var t3;
              return (t3 = this.getLastNestableAttribute()) ? this.removeAttribute(t3) : this;
            }, a2.prototype.increaseNestingLevel = function() {
              var t3, e2, n3;
              return (t3 = this.getLastNestableAttribute()) ? (n3 = this.attributes.lastIndexOf(t3), e2 = r.apply(null, [this.attributes, n3 + 1, 0].concat(c.call(d(t3)))), this.copyWithAttributes(e2)) : this;
            }, a2.prototype.getListItemAttributes = function() {
              var t3, e2, n3, o2, r2;
              for (o2 = this.attributes, r2 = [], e2 = 0, n3 = o2.length; n3 > e2; e2++)
                t3 = o2[e2], i(t3).listAttribute && r2.push(t3);
              return r2;
            }, a2.prototype.isListItem = function() {
              var t3;
              return (t3 = i(this.getLastAttribute())) != null ? t3.listAttribute : void 0;
            }, a2.prototype.isTerminalBlock = function() {
              var t3;
              return (t3 = i(this.getLastAttribute())) != null ? t3.terminal : void 0;
            }, a2.prototype.breaksOnReturn = function() {
              var t3;
              return (t3 = i(this.getLastAttribute())) != null ? t3.breakOnReturn : void 0;
            }, a2.prototype.findLineBreakInDirectionFromPosition = function(t3, e2) {
              var n3, i2;
              return i2 = this.toString(), n3 = function() {
                switch (t3) {
                  case "forward":
                    return i2.indexOf("\n", e2);
                  case "backward":
                    return i2.slice(0, e2).lastIndexOf("\n");
                }
              }(), n3 !== -1 ? n3 : void 0;
            }, a2.prototype.contentsForInspection = function() {
              return { text: this.text.inspect(), attributes: this.attributes };
            }, a2.prototype.toString = function() {
              return this.text.toString();
            }, a2.prototype.toJSON = function() {
              return { text: this.text, attributes: this.attributes };
            }, a2.prototype.getDirection = function() {
              return this.text.getDirection();
            }, a2.prototype.isRTL = function() {
              return this.text.isRTL();
            }, a2.prototype.getLength = function() {
              return this.text.getLength();
            }, a2.prototype.canBeConsolidatedWith = function(t3) {
              return !this.hasAttributes() && !t3.hasAttributes() && this.getDirection() === t3.getDirection();
            }, a2.prototype.consolidateWith = function(t3) {
              var n3, i2;
              return n3 = e.Text.textForStringWithAttributes("\n"), i2 = this.getTextWithoutBlockBreak().appendText(n3), this.copyWithText(i2.appendText(t3.text));
            }, a2.prototype.splitAtOffset = function(t3) {
              var e2, n3;
              return t3 === 0 ? (e2 = null, n3 = this) : t3 === this.getLength() ? (e2 = this, n3 = null) : (e2 = this.copyWithText(this.text.getTextAtRange([0, t3])), n3 = this.copyWithText(this.text.getTextAtRange([t3, this.getLength()]))), [e2, n3];
            }, a2.prototype.getBlockBreakPosition = function() {
              return this.text.getLength() - 1;
            }, a2.prototype.getTextWithoutBlockBreak = function() {
              return m(this.text) ? this.text.getTextAtRange([0, this.getBlockBreakPosition()]) : this.text.copy();
            }, a2.prototype.canBeGrouped = function(t3) {
              return this.attributes[t3];
            }, a2.prototype.canBeGroupedWith = function(t3, e2) {
              var n3, r2, s2, a3;
              return s2 = t3.getAttributes(), r2 = s2[e2], n3 = this.attributes[e2], !(n3 !== r2 || i(n3).group === false && (a3 = s2[e2 + 1], u.call(o(), a3) < 0) || this.getDirection() !== t3.getDirection() && !t3.isEmpty());
            }, h = function(t3) {
              return t3 = y(t3), t3 = l(t3);
            }, y = function(t3) {
              var n3, i2, o2, r2, s2, a3;
              return r2 = false, a3 = t3.getPieces(), i2 = 2 <= a3.length ? c.call(a3, 0, n3 = a3.length - 1) : (n3 = 0, []), o2 = a3[n3++], o2 == null ? t3 : (i2 = function() {
                var t4, e2, n4;
                for (n4 = [], t4 = 0, e2 = i2.length; e2 > t4; t4++)
                  s2 = i2[t4], s2.isBlockBreak() ? (r2 = true, n4.push(v(s2))) : n4.push(s2);
                return n4;
              }(), r2 ? new e.Text(c.call(i2).concat([o2])) : t3);
            }, p = e.Text.textForStringWithAttributes("\n", { blockBreak: true }), l = function(t3) {
              return m(t3) ? t3 : t3.appendText(p);
            }, m = function(t3) {
              var e2, n3;
              return n3 = t3.getLength(), n3 === 0 ? false : (e2 = t3.getTextAtRange([n3 - 1, n3]), e2.isBlockBreak());
            }, v = function(t3) {
              return t3.copyWithoutAttribute("blockBreak");
            }, d = function(t3) {
              var e2;
              return e2 = i(t3).listAttribute, e2 != null ? [e2, t3] : [t3];
            }, f = function(t3) {
              return t3.slice(-1)[0];
            }, g = function(t3, e2) {
              var n3;
              return n3 = t3.lastIndexOf(e2), n3 === -1 ? t3 : r(t3, n3, 1);
            }, a2;
          }(e.Object);
        }.call(this), function() {
          var t2, n, i, o = function(t3, e2) {
            function n2() {
              this.constructor = t3;
            }
            for (var i2 in e2)
              r.call(e2, i2) && (t3[i2] = e2[i2]);
            return n2.prototype = e2.prototype, t3.prototype = new n2(), t3.__super__ = e2.prototype, t3;
          }, r = {}.hasOwnProperty, s = [].indexOf || function(t3) {
            for (var e2 = 0, n2 = this.length; n2 > e2; e2++)
              if (e2 in this && this[e2] === t3)
                return e2;
            return -1;
          }, a = [].slice;
          n = e.tagName, i = e.walkTree, t2 = e.nodeIsAttachmentElement, e.HTMLSanitizer = function(r2) {
            function u(t3, e2) {
              var n2;
              n2 = e2 != null ? e2 : {}, this.allowedAttributes = n2.allowedAttributes, this.forbiddenProtocols = n2.forbiddenProtocols, this.forbiddenElements = n2.forbiddenElements, this.allowedAttributes == null && (this.allowedAttributes = c), this.forbiddenProtocols == null && (this.forbiddenProtocols = h), this.forbiddenElements == null && (this.forbiddenElements = l), this.body = p(t3);
            }
            var c, l, h, p;
            return o(u, r2), c = "style href src width height class".split(" "), h = "javascript:".split(" "), l = "script iframe".split(" "), u.sanitize = function(t3, e2) {
              var n2;
              return n2 = new this(t3, e2), n2.sanitize(), n2;
            }, u.prototype.sanitize = function() {
              return this.sanitizeElements(), this.normalizeListElementNesting();
            }, u.prototype.getHTML = function() {
              return this.body.innerHTML;
            }, u.prototype.getBody = function() {
              return this.body;
            }, u.prototype.sanitizeElements = function() {
              var t3, n2, o2, r3, s2;
              for (s2 = i(this.body), r3 = []; s2.nextNode(); )
                switch (o2 = s2.currentNode, o2.nodeType) {
                  case Node.ELEMENT_NODE:
                    this.elementIsRemovable(o2) ? r3.push(o2) : this.sanitizeElement(o2);
                    break;
                  case Node.COMMENT_NODE:
                    r3.push(o2);
                }
              for (t3 = 0, n2 = r3.length; n2 > t3; t3++)
                o2 = r3[t3], e.removeNode(o2);
              return this.body;
            }, u.prototype.sanitizeElement = function(t3) {
              var e2, n2, i2, o2, r3;
              for (t3.hasAttribute("href") && (o2 = t3.protocol, s.call(this.forbiddenProtocols, o2) >= 0 && t3.removeAttribute("href")), r3 = a.call(t3.attributes), e2 = 0, n2 = r3.length; n2 > e2; e2++)
                i2 = r3[e2].name, s.call(this.allowedAttributes, i2) >= 0 || i2.indexOf("data-trix") === 0 || t3.removeAttribute(i2);
              return t3;
            }, u.prototype.normalizeListElementNesting = function() {
              var t3, e2, i2, o2, r3;
              for (r3 = a.call(this.body.querySelectorAll("ul,ol")), t3 = 0, e2 = r3.length; e2 > t3; t3++)
                i2 = r3[t3], (o2 = i2.previousElementSibling) && n(o2) === "li" && o2.appendChild(i2);
              return this.body;
            }, u.prototype.elementIsRemovable = function(t3) {
              return (t3 != null ? t3.nodeType : void 0) === Node.ELEMENT_NODE ? this.elementIsForbidden(t3) || this.elementIsntSerializable(t3) : void 0;
            }, u.prototype.elementIsForbidden = function(t3) {
              var e2;
              return e2 = n(t3), s.call(this.forbiddenElements, e2) >= 0;
            }, u.prototype.elementIsntSerializable = function(e2) {
              return e2.getAttribute("data-trix-serialize") === "false" && !t2(e2);
            }, p = function(t3) {
              var e2, n2, i2, o2, r3;
              for (t3 == null && (t3 = ""), t3 = t3.replace(/<\/html[^>]*>[^]*$/i, "</html>"), e2 = document.implementation.createHTMLDocument(""), e2.documentElement.innerHTML = t3, r3 = e2.head.querySelectorAll("style"), i2 = 0, o2 = r3.length; o2 > i2; i2++)
                n2 = r3[i2], e2.body.appendChild(n2);
              return e2.body;
            }, u;
          }(e.BasicObject);
        }.call(this), function() {
          var t2, n, i, o, r, s, a, u, c, l, h, p = function(t3, e2) {
            function n2() {
              this.constructor = t3;
            }
            for (var i2 in e2)
              d.call(e2, i2) && (t3[i2] = e2[i2]);
            return n2.prototype = e2.prototype, t3.prototype = new n2(), t3.__super__ = e2.prototype, t3;
          }, d = {}.hasOwnProperty, f = [].indexOf || function(t3) {
            for (var e2 = 0, n2 = this.length; n2 > e2; e2++)
              if (e2 in this && this[e2] === t3)
                return e2;
            return -1;
          };
          t2 = e.arraysAreEqual, s = e.makeElement, l = e.tagName, r = e.getBlockTagNames, h = e.walkTree, o = e.findClosestElementFromNode, i = e.elementContainsNode, a = e.nodeIsAttachmentElement, u = e.normalizeSpaces, n = e.breakableWhitespacePattern, c = e.squishBreakableWhitespace, e.HTMLParser = function(d2) {
            function g(t3, e2) {
              this.html = t3, this.referenceElement = (e2 != null ? e2 : {}).referenceElement, this.blocks = [], this.blockElements = [], this.processedElements = [];
            }
            var m, v, y, b, A, C, x, w, E, S, R, k;
            return p(g, d2), g.parse = function(t3, e2) {
              var n2;
              return n2 = new this(t3, e2), n2.parse(), n2;
            }, g.prototype.getDocument = function() {
              return e.Document.fromJSON(this.blocks);
            }, g.prototype.parse = function() {
              var t3, n2;
              try {
                for (this.createHiddenContainer(), t3 = e.HTMLSanitizer.sanitize(this.html).getHTML(), this.containerElement.innerHTML = t3, n2 = h(this.containerElement, { usingFilter: x }); n2.nextNode(); )
                  this.processNode(n2.currentNode);
                return this.translateBlockElementMarginsToNewlines();
              } finally {
                this.removeHiddenContainer();
              }
            }, g.prototype.createHiddenContainer = function() {
              return this.referenceElement ? (this.containerElement = this.referenceElement.cloneNode(false), this.containerElement.removeAttribute("id"), this.containerElement.setAttribute("data-trix-internal", ""), this.containerElement.style.display = "none", this.referenceElement.parentNode.insertBefore(this.containerElement, this.referenceElement.nextSibling)) : (this.containerElement = s({ tagName: "div", style: { display: "none" } }), document.body.appendChild(this.containerElement));
            }, g.prototype.removeHiddenContainer = function() {
              return e.removeNode(this.containerElement);
            }, x = function(t3) {
              return l(t3) === "style" ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
            }, g.prototype.processNode = function(t3) {
              switch (t3.nodeType) {
                case Node.TEXT_NODE:
                  if (!this.isInsignificantTextNode(t3))
                    return this.appendBlockForTextNode(t3), this.processTextNode(t3);
                  break;
                case Node.ELEMENT_NODE:
                  return this.appendBlockForElement(t3), this.processElement(t3);
              }
            }, g.prototype.appendBlockForTextNode = function(e2) {
              var n2, i2, o2;
              return i2 = e2.parentNode, i2 === this.currentBlockElement && this.isBlockElement(e2.previousSibling) ? this.appendStringWithAttributes("\n") : i2 !== this.containerElement && !this.isBlockElement(i2) || (n2 = this.getBlockAttributes(i2), t2(n2, (o2 = this.currentBlock) != null ? o2.attributes : void 0)) ? void 0 : (this.currentBlock = this.appendBlockForAttributesWithElement(n2, i2), this.currentBlockElement = i2);
            }, g.prototype.appendBlockForElement = function(e2) {
              var n2, o2, r2, s2;
              if (r2 = this.isBlockElement(e2), o2 = i(this.currentBlockElement, e2), r2 && !this.isBlockElement(e2.firstChild)) {
                if ((!this.isInsignificantTextNode(e2.firstChild) || !this.isBlockElement(e2.firstElementChild)) && (n2 = this.getBlockAttributes(e2), e2.firstChild))
                  return o2 && t2(n2, this.currentBlock.attributes) ? this.appendStringWithAttributes("\n") : (this.currentBlock = this.appendBlockForAttributesWithElement(n2, e2), this.currentBlockElement = e2);
              } else if (this.currentBlockElement && !o2 && !r2)
                return (s2 = this.findParentBlockElement(e2)) ? this.appendBlockForElement(s2) : (this.currentBlock = this.appendEmptyBlock(), this.currentBlockElement = null);
            }, g.prototype.findParentBlockElement = function(t3) {
              var e2;
              for (e2 = t3.parentElement; e2 && e2 !== this.containerElement; ) {
                if (this.isBlockElement(e2) && f.call(this.blockElements, e2) >= 0)
                  return e2;
                e2 = e2.parentElement;
              }
              return null;
            }, g.prototype.processTextNode = function(t3) {
              var e2, n2;
              return n2 = t3.data, v(t3.parentNode) || (n2 = c(n2), R((e2 = t3.previousSibling) != null ? e2.textContent : void 0) && (n2 = A(n2))), this.appendStringWithAttributes(n2, this.getTextAttributes(t3.parentNode));
            }, g.prototype.processElement = function(t3) {
              var e2, n2, i2, o2, r2;
              if (a(t3))
                return e2 = w(t3, "attachment"), Object.keys(e2).length && (o2 = this.getTextAttributes(t3), this.appendAttachmentWithAttributes(e2, o2), t3.innerHTML = ""), this.processedElements.push(t3);
              switch (l(t3)) {
                case "br":
                  return this.isExtraBR(t3) || this.isBlockElement(t3.nextSibling) || this.appendStringWithAttributes("\n", this.getTextAttributes(t3)), this.processedElements.push(t3);
                case "img":
                  e2 = { url: t3.getAttribute("src"), contentType: "image" }, i2 = b(t3);
                  for (n2 in i2)
                    r2 = i2[n2], e2[n2] = r2;
                  return this.appendAttachmentWithAttributes(e2, this.getTextAttributes(t3)), this.processedElements.push(t3);
                case "tr":
                  if (t3.parentNode.firstChild !== t3)
                    return this.appendStringWithAttributes("\n");
                  break;
                case "td":
                  if (t3.parentNode.firstChild !== t3)
                    return this.appendStringWithAttributes(" | ");
              }
            }, g.prototype.appendBlockForAttributesWithElement = function(t3, e2) {
              var n2;
              return this.blockElements.push(e2), n2 = m(t3), this.blocks.push(n2), n2;
            }, g.prototype.appendEmptyBlock = function() {
              return this.appendBlockForAttributesWithElement([], null);
            }, g.prototype.appendStringWithAttributes = function(t3, e2) {
              return this.appendPiece(S(t3, e2));
            }, g.prototype.appendAttachmentWithAttributes = function(t3, e2) {
              return this.appendPiece(E(t3, e2));
            }, g.prototype.appendPiece = function(t3) {
              return this.blocks.length === 0 && this.appendEmptyBlock(), this.blocks[this.blocks.length - 1].text.push(t3);
            }, g.prototype.appendStringToTextAtIndex = function(t3, e2) {
              var n2, i2;
              return i2 = this.blocks[e2].text, n2 = i2[i2.length - 1], (n2 != null ? n2.type : void 0) === "string" ? n2.string += t3 : i2.push(S(t3));
            }, g.prototype.prependStringToTextAtIndex = function(t3, e2) {
              var n2, i2;
              return i2 = this.blocks[e2].text, n2 = i2[0], (n2 != null ? n2.type : void 0) === "string" ? n2.string = t3 + n2.string : i2.unshift(S(t3));
            }, S = function(t3, e2) {
              var n2;
              return e2 == null && (e2 = {}), n2 = "string", t3 = u(t3), { string: t3, attributes: e2, type: n2 };
            }, E = function(t3, e2) {
              var n2;
              return e2 == null && (e2 = {}), n2 = "attachment", { attachment: t3, attributes: e2, type: n2 };
            }, m = function(t3) {
              var e2;
              return t3 == null && (t3 = {}), e2 = [], { text: e2, attributes: t3 };
            }, g.prototype.getTextAttributes = function(t3) {
              var n2, i2, r2, s2, u2, c2, l2, h2, p2, d3, f2, g2;
              r2 = {}, p2 = e.config.textAttributes;
              for (n2 in p2)
                if (u2 = p2[n2], u2.tagName && o(t3, { matchingSelector: u2.tagName, untilNode: this.containerElement }))
                  r2[n2] = true;
                else if (u2.parser) {
                  if (g2 = u2.parser(t3)) {
                    for (i2 = false, d3 = this.findBlockElementAncestors(t3), c2 = 0, h2 = d3.length; h2 > c2; c2++)
                      if (s2 = d3[c2], u2.parser(s2) === g2) {
                        i2 = true;
                        break;
                      }
                    i2 || (r2[n2] = g2);
                  }
                } else
                  u2.styleProperty && (g2 = t3.style[u2.styleProperty]) && (r2[n2] = g2);
              if (a(t3)) {
                f2 = w(t3, "attributes");
                for (l2 in f2)
                  g2 = f2[l2], r2[l2] = g2;
              }
              return r2;
            }, g.prototype.getBlockAttributes = function(t3) {
              var n2, i2, o2, r2;
              for (i2 = []; t3 && t3 !== this.containerElement; ) {
                r2 = e.config.blockAttributes;
                for (n2 in r2)
                  o2 = r2[n2], o2.parse !== false && l(t3) === o2.tagName && ((typeof o2.test == "function" ? o2.test(t3) : void 0) || !o2.test) && (i2.push(n2), o2.listAttribute && i2.push(o2.listAttribute));
                t3 = t3.parentNode;
              }
              return i2.reverse();
            }, g.prototype.findBlockElementAncestors = function(t3) {
              var e2, n2;
              for (e2 = []; t3 && t3 !== this.containerElement; )
                n2 = l(t3), f.call(r(), n2) >= 0 && e2.push(t3), t3 = t3.parentNode;
              return e2;
            }, w = function(t3, e2) {
              try {
                return JSON.parse(t3.getAttribute("data-trix-" + e2));
              } catch (n2) {
                return {};
              }
            }, b = function(t3) {
              var e2, n2, i2;
              return i2 = t3.getAttribute("width"), n2 = t3.getAttribute("height"), e2 = {}, i2 && (e2.width = parseInt(i2, 10)), n2 && (e2.height = parseInt(n2, 10)), e2;
            }, g.prototype.isBlockElement = function(t3) {
              var e2;
              if ((t3 != null ? t3.nodeType : void 0) === Node.ELEMENT_NODE && !a(t3) && !o(t3, { matchingSelector: "td", untilNode: this.containerElement }))
                return e2 = l(t3), f.call(r(), e2) >= 0 || window.getComputedStyle(t3).display === "block";
            }, g.prototype.isInsignificantTextNode = function(t3) {
              var e2, n2, i2;
              if ((t3 != null ? t3.nodeType : void 0) === Node.TEXT_NODE && k(t3.data) && (n2 = t3.parentNode, i2 = t3.previousSibling, e2 = t3.nextSibling, (!C(n2.previousSibling) || this.isBlockElement(n2.previousSibling)) && !v(n2)))
                return !i2 || this.isBlockElement(i2) || !e2 || this.isBlockElement(e2);
            }, g.prototype.isExtraBR = function(t3) {
              return l(t3) === "br" && this.isBlockElement(t3.parentNode) && t3.parentNode.lastChild === t3;
            }, v = function(t3) {
              var e2;
              return e2 = window.getComputedStyle(t3).whiteSpace, e2 === "pre" || e2 === "pre-wrap" || e2 === "pre-line";
            }, C = function(t3) {
              return t3 && !R(t3.textContent);
            }, g.prototype.translateBlockElementMarginsToNewlines = function() {
              var t3, e2, n2, i2, o2, r2, s2, a2;
              for (e2 = this.getMarginOfDefaultBlockElement(), s2 = this.blocks, a2 = [], i2 = n2 = 0, o2 = s2.length; o2 > n2; i2 = ++n2)
                t3 = s2[i2], (r2 = this.getMarginOfBlockElementAtIndex(i2)) && (r2.top > 2 * e2.top && this.prependStringToTextAtIndex("\n", i2), a2.push(r2.bottom > 2 * e2.bottom ? this.appendStringToTextAtIndex("\n", i2) : void 0));
              return a2;
            }, g.prototype.getMarginOfBlockElementAtIndex = function(t3) {
              var e2, n2;
              return !(e2 = this.blockElements[t3]) || !e2.textContent || (n2 = l(e2), f.call(r(), n2) >= 0 || f.call(this.processedElements, e2) >= 0) ? void 0 : y(e2);
            }, g.prototype.getMarginOfDefaultBlockElement = function() {
              var t3;
              return t3 = s(e.config.blockAttributes["default"].tagName), this.containerElement.appendChild(t3), y(t3);
            }, y = function(t3) {
              var e2;
              return e2 = window.getComputedStyle(t3), e2.display === "block" ? { top: parseInt(e2.marginTop), bottom: parseInt(e2.marginBottom) } : void 0;
            }, A = function(t3) {
              return t3.replace(RegExp("^" + n.source + "+"), "");
            }, k = function(t3) {
              return RegExp("^" + n.source + "*$").test(t3);
            }, R = function(t3) {
              return /\s$/.test(t3);
            }, g;
          }(e.BasicObject);
        }.call(this), function() {
          var t2, n, i, o, r = function(t3, e2) {
            function n2() {
              this.constructor = t3;
            }
            for (var i2 in e2)
              s.call(e2, i2) && (t3[i2] = e2[i2]);
            return n2.prototype = e2.prototype, t3.prototype = new n2(), t3.__super__ = e2.prototype, t3;
          }, s = {}.hasOwnProperty, a = [].slice, u = [].indexOf || function(t3) {
            for (var e2 = 0, n2 = this.length; n2 > e2; e2++)
              if (e2 in this && this[e2] === t3)
                return e2;
            return -1;
          };
          t2 = e.arraysAreEqual, i = e.normalizeRange, o = e.rangeIsCollapsed, n = e.getBlockConfig, e.Document = function(s2) {
            function c(t3) {
              t3 == null && (t3 = []), c.__super__.constructor.apply(this, arguments), t3.length === 0 && (t3 = [new e.Block()]), this.blockList = e.SplittableList.box(t3);
            }
            var l;
            return r(c, s2), c.fromJSON = function(t3) {
              var n2, i2;
              return i2 = function() {
                var i3, o2, r2;
                for (r2 = [], i3 = 0, o2 = t3.length; o2 > i3; i3++)
                  n2 = t3[i3], r2.push(e.Block.fromJSON(n2));
                return r2;
              }(), new this(i2);
            }, c.fromHTML = function(t3, n2) {
              return e.HTMLParser.parse(t3, n2).getDocument();
            }, c.fromString = function(t3, n2) {
              var i2;
              return i2 = e.Text.textForStringWithAttributes(t3, n2), new this([new e.Block(i2)]);
            }, c.prototype.isEmpty = function() {
              var t3;
              return this.blockList.length === 1 && (t3 = this.getBlockAtIndex(0), t3.isEmpty() && !t3.hasAttributes());
            }, c.prototype.copy = function(t3) {
              var e2;
              return t3 == null && (t3 = {}), e2 = t3.consolidateBlocks ? this.blockList.consolidate().toArray() : this.blockList.toArray(), new this.constructor(e2);
            }, c.prototype.copyUsingObjectsFromDocument = function(t3) {
              var n2;
              return n2 = new e.ObjectMap(t3.getObjects()), this.copyUsingObjectMap(n2);
            }, c.prototype.copyUsingObjectMap = function(t3) {
              var e2, n2, i2;
              return n2 = function() {
                var n3, o2, r2, s3;
                for (r2 = this.getBlocks(), s3 = [], n3 = 0, o2 = r2.length; o2 > n3; n3++)
                  e2 = r2[n3], s3.push((i2 = t3.find(e2)) ? i2 : e2.copyUsingObjectMap(t3));
                return s3;
              }.call(this), new this.constructor(n2);
            }, c.prototype.copyWithBaseBlockAttributes = function(t3) {
              var e2, n2, i2;
              return t3 == null && (t3 = []), i2 = function() {
                var i3, o2, r2, s3;
                for (r2 = this.getBlocks(), s3 = [], i3 = 0, o2 = r2.length; o2 > i3; i3++)
                  n2 = r2[i3], e2 = t3.concat(n2.getAttributes()), s3.push(n2.copyWithAttributes(e2));
                return s3;
              }.call(this), new this.constructor(i2);
            }, c.prototype.replaceBlock = function(t3, e2) {
              var n2;
              return n2 = this.blockList.indexOf(t3), n2 === -1 ? this : new this.constructor(this.blockList.replaceObjectAtIndex(e2, n2));
            }, c.prototype.insertDocumentAtRange = function(t3, e2) {
              var n2, r2, s3, a2, u2, c2, l2;
              return r2 = t3.blockList, u2 = (e2 = i(e2))[0], c2 = this.locationFromPosition(u2), s3 = c2.index, a2 = c2.offset, l2 = this, n2 = this.getBlockAtPosition(u2), o(e2) && n2.isEmpty() && !n2.hasAttributes() ? l2 = new this.constructor(l2.blockList.removeObjectAtIndex(s3)) : n2.getBlockBreakPosition() === a2 && u2++, l2 = l2.removeTextAtRange(e2), new this.constructor(l2.blockList.insertSplittableListAtPosition(r2, u2));
            }, c.prototype.mergeDocumentAtRange = function(e2, n2) {
              var o2, r2, s3, a2, u2, c2, l2, h, p, d, f, g;
              return f = (n2 = i(n2))[0], d = this.locationFromPosition(f), r2 = this.getBlockAtIndex(d.index).getAttributes(), o2 = e2.getBaseBlockAttributes(), g = r2.slice(-o2.length), t2(o2, g) ? (l2 = r2.slice(0, -o2.length), c2 = e2.copyWithBaseBlockAttributes(l2)) : c2 = e2.copy({ consolidateBlocks: true }).copyWithBaseBlockAttributes(r2), s3 = c2.getBlockCount(), a2 = c2.getBlockAtIndex(0), t2(r2, a2.getAttributes()) ? (u2 = a2.getTextWithoutBlockBreak(), p = this.insertTextAtRange(u2, n2), s3 > 1 && (c2 = new this.constructor(c2.getBlocks().slice(1)), h = f + u2.getLength(), p = p.insertDocumentAtRange(c2, h))) : p = this.insertDocumentAtRange(c2, n2), p;
            }, c.prototype.insertTextAtRange = function(t3, e2) {
              var n2, o2, r2, s3, a2;
              return a2 = (e2 = i(e2))[0], s3 = this.locationFromPosition(a2), o2 = s3.index, r2 = s3.offset, n2 = this.removeTextAtRange(e2), new this.constructor(n2.blockList.editObjectAtIndex(o2, function(e3) {
                return e3.copyWithText(e3.text.insertTextAtPosition(t3, r2));
              }));
            }, c.prototype.removeTextAtRange = function(t3) {
              var e2, n2, r2, s3, a2, u2, c2, l2, h, p, d, f, g, m, v, y, b, A, C, x, w;
              return p = t3 = i(t3), l2 = p[0], A = p[1], o(t3) ? this : (d = this.locationRangeFromRange(t3), u2 = d[0], y = d[1], a2 = u2.index, c2 = u2.offset, s3 = this.getBlockAtIndex(a2), v = y.index, b = y.offset, m = this.getBlockAtIndex(v), f = A - l2 === 1 && s3.getBlockBreakPosition() === c2 && m.getBlockBreakPosition() !== b && m.text.getStringAtPosition(b) === "\n", f ? r2 = this.blockList.editObjectAtIndex(v, function(t4) {
                return t4.copyWithText(t4.text.removeTextAtRange([b, b + 1]));
              }) : (h = s3.text.getTextAtRange([0, c2]), C = m.text.getTextAtRange([b, m.getLength()]), x = h.appendText(C), g = a2 !== v && c2 === 0, w = g && s3.getAttributeLevel() >= m.getAttributeLevel(), n2 = w ? m.copyWithText(x) : s3.copyWithText(x), e2 = v + 1 - a2, r2 = this.blockList.splice(a2, e2, n2)), new this.constructor(r2));
            }, c.prototype.moveTextFromRangeToPosition = function(t3, e2) {
              var n2, o2, r2, s3, u2, c2, l2, h, p, d;
              return c2 = t3 = i(t3), p = c2[0], r2 = c2[1], e2 >= p && r2 >= e2 ? this : (o2 = this.getDocumentAtRange(t3), h = this.removeTextAtRange(t3), u2 = e2 > p, u2 && (e2 -= o2.getLength()), l2 = o2.getBlocks(), s3 = l2[0], n2 = 2 <= l2.length ? a.call(l2, 1) : [], n2.length === 0 ? (d = s3.getTextWithoutBlockBreak(), u2 && (e2 += 1)) : d = s3.text, h = h.insertTextAtRange(d, e2), n2.length === 0 ? h : (o2 = new this.constructor(n2), e2 += d.getLength(), h.insertDocumentAtRange(o2, e2)));
            }, c.prototype.addAttributeAtRange = function(t3, e2, i2) {
              var o2;
              return o2 = this.blockList, this.eachBlockAtRange(i2, function(i3, r2, s3) {
                return o2 = o2.editObjectAtIndex(s3, function() {
                  return n(t3) ? i3.addAttribute(t3, e2) : r2[0] === r2[1] ? i3 : i3.copyWithText(i3.text.addAttributeAtRange(t3, e2, r2));
                });
              }), new this.constructor(o2);
            }, c.prototype.addAttribute = function(t3, e2) {
              var n2;
              return n2 = this.blockList, this.eachBlock(function(i2, o2) {
                return n2 = n2.editObjectAtIndex(o2, function() {
                  return i2.addAttribute(t3, e2);
                });
              }), new this.constructor(n2);
            }, c.prototype.removeAttributeAtRange = function(t3, e2) {
              var i2;
              return i2 = this.blockList, this.eachBlockAtRange(e2, function(e3, o2, r2) {
                return n(t3) ? i2 = i2.editObjectAtIndex(r2, function() {
                  return e3.removeAttribute(t3);
                }) : o2[0] !== o2[1] ? i2 = i2.editObjectAtIndex(r2, function() {
                  return e3.copyWithText(e3.text.removeAttributeAtRange(t3, o2));
                }) : void 0;
              }), new this.constructor(i2);
            }, c.prototype.updateAttributesForAttachment = function(t3, e2) {
              var n2, i2, o2, r2;
              return o2 = (i2 = this.getRangeOfAttachment(e2))[0], n2 = this.locationFromPosition(o2).index, r2 = this.getTextAtIndex(n2), new this.constructor(this.blockList.editObjectAtIndex(n2, function(n3) {
                return n3.copyWithText(r2.updateAttributesForAttachment(t3, e2));
              }));
            }, c.prototype.removeAttributeForAttachment = function(t3, e2) {
              var n2;
              return n2 = this.getRangeOfAttachment(e2), this.removeAttributeAtRange(t3, n2);
            }, c.prototype.insertBlockBreakAtRange = function(t3) {
              var n2, o2, r2, s3;
              return s3 = (t3 = i(t3))[0], r2 = this.locationFromPosition(s3).offset, o2 = this.removeTextAtRange(t3), r2 === 0 && (n2 = [new e.Block()]), new this.constructor(o2.blockList.insertSplittableListAtPosition(new e.SplittableList(n2), s3));
            }, c.prototype.applyBlockAttributeAtRange = function(t3, e2, i2) {
              var o2, r2, s3, a2;
              return s3 = this.expandRangeToLineBreaksAndSplitBlocks(i2), r2 = s3.document, i2 = s3.range, o2 = n(t3), o2.listAttribute ? (r2 = r2.removeLastListAttributeAtRange(i2, { exceptAttributeName: t3 }), a2 = r2.convertLineBreaksToBlockBreaksInRange(i2), r2 = a2.document, i2 = a2.range) : r2 = o2.exclusive ? r2.removeBlockAttributesAtRange(i2) : o2.terminal ? r2.removeLastTerminalAttributeAtRange(i2) : r2.consolidateBlocksAtRange(i2), r2.addAttributeAtRange(t3, e2, i2);
            }, c.prototype.removeLastListAttributeAtRange = function(t3, e2) {
              var i2;
              return e2 == null && (e2 = {}), i2 = this.blockList, this.eachBlockAtRange(t3, function(t4, o2, r2) {
                var s3;
                if ((s3 = t4.getLastAttribute()) && n(s3).listAttribute && s3 !== e2.exceptAttributeName)
                  return i2 = i2.editObjectAtIndex(r2, function() {
                    return t4.removeAttribute(s3);
                  });
              }), new this.constructor(i2);
            }, c.prototype.removeLastTerminalAttributeAtRange = function(t3) {
              var e2;
              return e2 = this.blockList, this.eachBlockAtRange(t3, function(t4, i2, o2) {
                var r2;
                if ((r2 = t4.getLastAttribute()) && n(r2).terminal)
                  return e2 = e2.editObjectAtIndex(o2, function() {
                    return t4.removeAttribute(r2);
                  });
              }), new this.constructor(e2);
            }, c.prototype.removeBlockAttributesAtRange = function(t3) {
              var e2;
              return e2 = this.blockList, this.eachBlockAtRange(t3, function(t4, n2, i2) {
                return t4.hasAttributes() ? e2 = e2.editObjectAtIndex(i2, function() {
                  return t4.copyWithoutAttributes();
                }) : void 0;
              }), new this.constructor(e2);
            }, c.prototype.expandRangeToLineBreaksAndSplitBlocks = function(t3) {
              var e2, n2, o2, r2, s3, a2, u2, c2, l2;
              return a2 = t3 = i(t3), l2 = a2[0], r2 = a2[1], c2 = this.locationFromPosition(l2), o2 = this.locationFromPosition(r2), e2 = this, u2 = e2.getBlockAtIndex(c2.index), (c2.offset = u2.findLineBreakInDirectionFromPosition("backward", c2.offset)) != null && (s3 = e2.positionFromLocation(c2), e2 = e2.insertBlockBreakAtRange([s3, s3 + 1]), o2.index += 1, o2.offset -= e2.getBlockAtIndex(c2.index).getLength(), c2.index += 1), c2.offset = 0, o2.offset === 0 && o2.index > c2.index ? (o2.index -= 1, o2.offset = e2.getBlockAtIndex(o2.index).getBlockBreakPosition()) : (n2 = e2.getBlockAtIndex(o2.index), n2.text.getStringAtRange([o2.offset - 1, o2.offset]) === "\n" ? o2.offset -= 1 : o2.offset = n2.findLineBreakInDirectionFromPosition("forward", o2.offset), o2.offset !== n2.getBlockBreakPosition() && (s3 = e2.positionFromLocation(o2), e2 = e2.insertBlockBreakAtRange([s3, s3 + 1]))), l2 = e2.positionFromLocation(c2), r2 = e2.positionFromLocation(o2), t3 = i([l2, r2]), { document: e2, range: t3 };
            }, c.prototype.convertLineBreaksToBlockBreaksInRange = function(t3) {
              var e2, n2, o2;
              return n2 = (t3 = i(t3))[0], o2 = this.getStringAtRange(t3).slice(0, -1), e2 = this, o2.replace(/.*?\n/g, function(t4) {
                return n2 += t4.length, e2 = e2.insertBlockBreakAtRange([n2 - 1, n2]);
              }), { document: e2, range: t3 };
            }, c.prototype.consolidateBlocksAtRange = function(t3) {
              var e2, n2, o2, r2, s3;
              return o2 = t3 = i(t3), s3 = o2[0], n2 = o2[1], r2 = this.locationFromPosition(s3).index, e2 = this.locationFromPosition(n2).index, new this.constructor(this.blockList.consolidateFromIndexToIndex(r2, e2));
            }, c.prototype.getDocumentAtRange = function(t3) {
              var e2;
              return t3 = i(t3), e2 = this.blockList.getSplittableListInRange(t3).toArray(), new this.constructor(e2);
            }, c.prototype.getStringAtRange = function(t3) {
              var e2, n2, o2;
              return o2 = t3 = i(t3), n2 = o2[o2.length - 1], n2 !== this.getLength() && (e2 = -1), this.getDocumentAtRange(t3).toString().slice(0, e2);
            }, c.prototype.getBlockAtIndex = function(t3) {
              return this.blockList.getObjectAtIndex(t3);
            }, c.prototype.getBlockAtPosition = function(t3) {
              var e2;
              return e2 = this.locationFromPosition(t3).index, this.getBlockAtIndex(e2);
            }, c.prototype.getTextAtIndex = function(t3) {
              var e2;
              return (e2 = this.getBlockAtIndex(t3)) != null ? e2.text : void 0;
            }, c.prototype.getTextAtPosition = function(t3) {
              var e2;
              return e2 = this.locationFromPosition(t3).index, this.getTextAtIndex(e2);
            }, c.prototype.getPieceAtPosition = function(t3) {
              var e2, n2, i2;
              return i2 = this.locationFromPosition(t3), e2 = i2.index, n2 = i2.offset, this.getTextAtIndex(e2).getPieceAtPosition(n2);
            }, c.prototype.getCharacterAtPosition = function(t3) {
              var e2, n2, i2;
              return i2 = this.locationFromPosition(t3), e2 = i2.index, n2 = i2.offset, this.getTextAtIndex(e2).getStringAtRange([n2, n2 + 1]);
            }, c.prototype.getLength = function() {
              return this.blockList.getEndPosition();
            }, c.prototype.getBlocks = function() {
              return this.blockList.toArray();
            }, c.prototype.getBlockCount = function() {
              return this.blockList.length;
            }, c.prototype.getEditCount = function() {
              return this.editCount;
            }, c.prototype.eachBlock = function(t3) {
              return this.blockList.eachObject(t3);
            }, c.prototype.eachBlockAtRange = function(t3, e2) {
              var n2, o2, r2, s3, a2, u2, c2, l2, h, p, d, f;
              if (u2 = t3 = i(t3), d = u2[0], r2 = u2[1], p = this.locationFromPosition(d), o2 = this.locationFromPosition(r2), p.index === o2.index)
                return n2 = this.getBlockAtIndex(p.index), f = [p.offset, o2.offset], e2(n2, f, p.index);
              for (h = [], a2 = s3 = c2 = p.index, l2 = o2.index; l2 >= c2 ? l2 >= s3 : s3 >= l2; a2 = l2 >= c2 ? ++s3 : --s3)
                (n2 = this.getBlockAtIndex(a2)) ? (f = function() {
                  switch (a2) {
                    case p.index:
                      return [p.offset, n2.text.getLength()];
                    case o2.index:
                      return [0, o2.offset];
                    default:
                      return [0, n2.text.getLength()];
                  }
                }(), h.push(e2(n2, f, a2))) : h.push(void 0);
              return h;
            }, c.prototype.getCommonAttributesAtRange = function(t3) {
              var n2, r2, s3;
              return r2 = (t3 = i(t3))[0], o(t3) ? this.getCommonAttributesAtPosition(r2) : (s3 = [], n2 = [], this.eachBlockAtRange(t3, function(t4, e2) {
                return e2[0] !== e2[1] ? (s3.push(t4.text.getCommonAttributesAtRange(e2)), n2.push(l(t4))) : void 0;
              }), e.Hash.fromCommonAttributesOfObjects(s3).merge(e.Hash.fromCommonAttributesOfObjects(n2)).toObject());
            }, c.prototype.getCommonAttributesAtPosition = function(t3) {
              var n2, i2, o2, r2, s3, a2, c2, h, p, d;
              if (p = this.locationFromPosition(t3), s3 = p.index, h = p.offset, o2 = this.getBlockAtIndex(s3), !o2)
                return {};
              r2 = l(o2), n2 = o2.text.getAttributesAtPosition(h), i2 = o2.text.getAttributesAtPosition(h - 1), a2 = function() {
                var t4, n3;
                t4 = e.config.textAttributes, n3 = [];
                for (c2 in t4)
                  d = t4[c2], d.inheritable && n3.push(c2);
                return n3;
              }();
              for (c2 in i2)
                d = i2[c2], (d === n2[c2] || u.call(a2, c2) >= 0) && (r2[c2] = d);
              return r2;
            }, c.prototype.getRangeOfCommonAttributeAtPosition = function(t3, e2) {
              var n2, o2, r2, s3, a2, u2, c2, l2, h;
              return a2 = this.locationFromPosition(e2), r2 = a2.index, s3 = a2.offset, h = this.getTextAtIndex(r2), u2 = h.getExpandedRangeForAttributeAtOffset(t3, s3), l2 = u2[0], o2 = u2[1], c2 = this.positionFromLocation({ index: r2, offset: l2 }), n2 = this.positionFromLocation({ index: r2, offset: o2 }), i([c2, n2]);
            }, c.prototype.getBaseBlockAttributes = function() {
              var t3, e2, n2, i2, o2, r2, s3;
              for (t3 = this.getBlockAtIndex(0).getAttributes(), n2 = i2 = 1, s3 = this.getBlockCount(); s3 >= 1 ? s3 > i2 : i2 > s3; n2 = s3 >= 1 ? ++i2 : --i2)
                e2 = this.getBlockAtIndex(n2).getAttributes(), r2 = Math.min(t3.length, e2.length), t3 = function() {
                  var n3, i3, s4;
                  for (s4 = [], o2 = n3 = 0, i3 = r2; (i3 >= 0 ? i3 > n3 : n3 > i3) && e2[o2] === t3[o2]; o2 = i3 >= 0 ? ++n3 : --n3)
                    s4.push(e2[o2]);
                  return s4;
                }();
              return t3;
            }, l = function(t3) {
              var e2, n2;
              return n2 = {}, (e2 = t3.getLastAttribute()) && (n2[e2] = true), n2;
            }, c.prototype.getAttachmentById = function(t3) {
              var e2, n2, i2, o2;
              for (o2 = this.getAttachments(), n2 = 0, i2 = o2.length; i2 > n2; n2++)
                if (e2 = o2[n2], e2.id === t3)
                  return e2;
            }, c.prototype.getAttachmentPieces = function() {
              var t3;
              return t3 = [], this.blockList.eachObject(function(e2) {
                var n2;
                return n2 = e2.text, t3 = t3.concat(n2.getAttachmentPieces());
              }), t3;
            }, c.prototype.getAttachments = function() {
              var t3, e2, n2, i2, o2;
              for (i2 = this.getAttachmentPieces(), o2 = [], t3 = 0, e2 = i2.length; e2 > t3; t3++)
                n2 = i2[t3], o2.push(n2.attachment);
              return o2;
            }, c.prototype.getRangeOfAttachment = function(t3) {
              var e2, n2, o2, r2, s3, a2, u2;
              for (r2 = 0, s3 = this.blockList.toArray(), n2 = e2 = 0, o2 = s3.length; o2 > e2; n2 = ++e2) {
                if (a2 = s3[n2].text, u2 = a2.getRangeOfAttachment(t3))
                  return i([r2 + u2[0], r2 + u2[1]]);
                r2 += a2.getLength();
              }
            }, c.prototype.getLocationRangeOfAttachment = function(t3) {
              var e2;
              return e2 = this.getRangeOfAttachment(t3), this.locationRangeFromRange(e2);
            }, c.prototype.getAttachmentPieceForAttachment = function(t3) {
              var e2, n2, i2, o2;
              for (o2 = this.getAttachmentPieces(), e2 = 0, n2 = o2.length; n2 > e2; e2++)
                if (i2 = o2[e2], i2.attachment === t3)
                  return i2;
            }, c.prototype.findRangesForBlockAttribute = function(t3) {
              var e2, n2, i2, o2, r2, s3, a2;
              for (r2 = 0, s3 = [], a2 = this.getBlocks(), n2 = 0, i2 = a2.length; i2 > n2; n2++)
                e2 = a2[n2], o2 = e2.getLength(), e2.hasAttribute(t3) && s3.push([r2, r2 + o2]), r2 += o2;
              return s3;
            }, c.prototype.findRangesForTextAttribute = function(t3, e2) {
              var n2, i2, o2, r2, s3, a2, u2, c2, l2, h;
              for (h = (e2 != null ? e2 : {}).withValue, a2 = 0, u2 = [], c2 = [], r2 = function(e3) {
                return h != null ? e3.getAttribute(t3) === h : e3.hasAttribute(t3);
              }, l2 = this.getPieces(), n2 = 0, i2 = l2.length; i2 > n2; n2++)
                s3 = l2[n2], o2 = s3.getLength(), r2(s3) && (u2[1] === a2 ? u2[1] = a2 + o2 : c2.push(u2 = [a2, a2 + o2])), a2 += o2;
              return c2;
            }, c.prototype.locationFromPosition = function(t3) {
              var e2, n2;
              return n2 = this.blockList.findIndexAndOffsetAtPosition(Math.max(0, t3)), n2.index != null ? n2 : (e2 = this.getBlocks(), { index: e2.length - 1, offset: e2[e2.length - 1].getLength() });
            }, c.prototype.positionFromLocation = function(t3) {
              return this.blockList.findPositionAtIndexAndOffset(t3.index, t3.offset);
            }, c.prototype.locationRangeFromPosition = function(t3) {
              return i(this.locationFromPosition(t3));
            }, c.prototype.locationRangeFromRange = function(t3) {
              var e2, n2, o2, r2;
              if (t3 = i(t3))
                return r2 = t3[0], n2 = t3[1], o2 = this.locationFromPosition(r2), e2 = this.locationFromPosition(n2), i([o2, e2]);
            }, c.prototype.rangeFromLocationRange = function(t3) {
              var e2, n2;
              return t3 = i(t3), e2 = this.positionFromLocation(t3[0]), o(t3) || (n2 = this.positionFromLocation(t3[1])), i([e2, n2]);
            }, c.prototype.isEqualTo = function(t3) {
              return this.blockList.isEqualTo(t3 != null ? t3.blockList : void 0);
            }, c.prototype.getTexts = function() {
              var t3, e2, n2, i2, o2;
              for (i2 = this.getBlocks(), o2 = [], e2 = 0, n2 = i2.length; n2 > e2; e2++)
                t3 = i2[e2], o2.push(t3.text);
              return o2;
            }, c.prototype.getPieces = function() {
              var t3, e2, n2, i2, o2;
              for (n2 = [], i2 = this.getTexts(), t3 = 0, e2 = i2.length; e2 > t3; t3++)
                o2 = i2[t3], n2.push.apply(n2, o2.getPieces());
              return n2;
            }, c.prototype.getObjects = function() {
              return this.getBlocks().concat(this.getTexts()).concat(this.getPieces());
            }, c.prototype.toSerializableDocument = function() {
              var t3;
              return t3 = [], this.blockList.eachObject(function(e2) {
                return t3.push(e2.copyWithText(e2.text.toSerializableText()));
              }), new this.constructor(t3);
            }, c.prototype.toString = function() {
              return this.blockList.toString();
            }, c.prototype.toJSON = function() {
              return this.blockList.toJSON();
            }, c.prototype.toConsole = function() {
              var t3;
              return JSON.stringify(function() {
                var e2, n2, i2, o2;
                for (i2 = this.blockList.toArray(), o2 = [], e2 = 0, n2 = i2.length; n2 > e2; e2++)
                  t3 = i2[e2], o2.push(JSON.parse(t3.text.toConsole()));
                return o2;
              }.call(this));
            }, c;
          }(e.Object);
        }.call(this), function() {
          e.LineBreakInsertion = function() {
            function t2(t3) {
              var e2;
              this.composition = t3, this.document = this.composition.document, e2 = this.composition.getSelectedRange(), this.startPosition = e2[0], this.endPosition = e2[1], this.startLocation = this.document.locationFromPosition(this.startPosition), this.endLocation = this.document.locationFromPosition(this.endPosition), this.block = this.document.getBlockAtIndex(this.endLocation.index), this.breaksOnReturn = this.block.breaksOnReturn(), this.previousCharacter = this.block.text.getStringAtPosition(this.endLocation.offset - 1), this.nextCharacter = this.block.text.getStringAtPosition(this.endLocation.offset);
            }
            return t2.prototype.shouldInsertBlockBreak = function() {
              return this.block.hasAttributes() && this.block.isListItem() && !this.block.isEmpty() ? this.startLocation.offset !== 0 : this.breaksOnReturn && this.nextCharacter !== "\n";
            }, t2.prototype.shouldBreakFormattedBlock = function() {
              return this.block.hasAttributes() && !this.block.isListItem() && (this.breaksOnReturn && this.nextCharacter === "\n" || this.previousCharacter === "\n");
            }, t2.prototype.shouldDecreaseListLevel = function() {
              return this.block.hasAttributes() && this.block.isListItem() && this.block.isEmpty();
            }, t2.prototype.shouldPrependListItem = function() {
              return this.block.isListItem() && this.startLocation.offset === 0 && !this.block.isEmpty();
            }, t2.prototype.shouldRemoveLastBlockAttribute = function() {
              return this.block.hasAttributes() && !this.block.isListItem() && this.block.isEmpty();
            }, t2;
          }();
        }.call(this), function() {
          var t2, n, i, o, r, s, a, u, c, l, h = function(t3, e2) {
            function n2() {
              this.constructor = t3;
            }
            for (var i2 in e2)
              p.call(e2, i2) && (t3[i2] = e2[i2]);
            return n2.prototype = e2.prototype, t3.prototype = new n2(), t3.__super__ = e2.prototype, t3;
          }, p = {}.hasOwnProperty;
          s = e.normalizeRange, c = e.rangesAreEqual, u = e.rangeIsCollapsed, a = e.objectsAreEqual, t2 = e.arrayStartsWith, l = e.summarizeArrayChange, i = e.getAllAttributeNames, o = e.getBlockConfig, r = e.getTextConfig, n = e.extend, e.Composition = function(p2) {
            function d() {
              this.document = new e.Document(), this.attachments = [], this.currentAttributes = {}, this.revision = 0;
            }
            var f;
            return h(d, p2), d.prototype.setDocument = function(t3) {
              var e2;
              return t3.isEqualTo(this.document) ? void 0 : (this.document = t3, this.refreshAttachments(), this.revision++, (e2 = this.delegate) != null && typeof e2.compositionDidChangeDocument == "function" ? e2.compositionDidChangeDocument(t3) : void 0);
            }, d.prototype.getSnapshot = function() {
              return { document: this.document, selectedRange: this.getSelectedRange() };
            }, d.prototype.loadSnapshot = function(t3) {
              var n2, i2, o2, r2;
              return n2 = t3.document, r2 = t3.selectedRange, (i2 = this.delegate) != null && typeof i2.compositionWillLoadSnapshot == "function" && i2.compositionWillLoadSnapshot(), this.setDocument(n2 != null ? n2 : new e.Document()), this.setSelection(r2 != null ? r2 : [0, 0]), (o2 = this.delegate) != null && typeof o2.compositionDidLoadSnapshot == "function" ? o2.compositionDidLoadSnapshot() : void 0;
            }, d.prototype.insertText = function(t3, e2) {
              var n2, i2, o2, r2;
              return r2 = (e2 != null ? e2 : { updatePosition: true }).updatePosition, i2 = this.getSelectedRange(), this.setDocument(this.document.insertTextAtRange(t3, i2)), o2 = i2[0], n2 = o2 + t3.getLength(), r2 && this.setSelection(n2), this.notifyDelegateOfInsertionAtRange([o2, n2]);
            }, d.prototype.insertBlock = function(t3) {
              var n2;
              return t3 == null && (t3 = new e.Block()), n2 = new e.Document([t3]), this.insertDocument(n2);
            }, d.prototype.insertDocument = function(t3) {
              var n2, i2, o2;
              return t3 == null && (t3 = new e.Document()), i2 = this.getSelectedRange(), this.setDocument(this.document.insertDocumentAtRange(t3, i2)), o2 = i2[0], n2 = o2 + t3.getLength(), this.setSelection(n2), this.notifyDelegateOfInsertionAtRange([o2, n2]);
            }, d.prototype.insertString = function(t3, n2) {
              var i2, o2;
              return i2 = this.getCurrentTextAttributes(), o2 = e.Text.textForStringWithAttributes(t3, i2), this.insertText(o2, n2);
            }, d.prototype.insertBlockBreak = function() {
              var t3, e2, n2;
              return e2 = this.getSelectedRange(), this.setDocument(this.document.insertBlockBreakAtRange(e2)), n2 = e2[0], t3 = n2 + 1, this.setSelection(t3), this.notifyDelegateOfInsertionAtRange([n2, t3]);
            }, d.prototype.insertLineBreak = function() {
              var t3, n2;
              return n2 = new e.LineBreakInsertion(this), n2.shouldDecreaseListLevel() ? (this.decreaseListLevel(), this.setSelection(n2.startPosition)) : n2.shouldPrependListItem() ? (t3 = new e.Document([n2.block.copyWithoutText()]), this.insertDocument(t3)) : n2.shouldInsertBlockBreak() ? this.insertBlockBreak() : n2.shouldRemoveLastBlockAttribute() ? this.removeLastBlockAttribute() : n2.shouldBreakFormattedBlock() ? this.breakFormattedBlock(n2) : this.insertString("\n");
            }, d.prototype.insertHTML = function(t3) {
              var n2, i2, o2, r2;
              return n2 = e.Document.fromHTML(t3), o2 = this.getSelectedRange(), this.setDocument(this.document.mergeDocumentAtRange(n2, o2)), r2 = o2[0], i2 = r2 + n2.getLength() - 1, this.setSelection(i2), this.notifyDelegateOfInsertionAtRange([r2, i2]);
            }, d.prototype.replaceHTML = function(t3) {
              var n2, i2, o2;
              return n2 = e.Document.fromHTML(t3).copyUsingObjectsFromDocument(this.document), i2 = this.getLocationRange({ strict: false }), o2 = this.document.rangeFromLocationRange(i2), this.setDocument(n2), this.setSelection(o2);
            }, d.prototype.insertFile = function(t3) {
              return this.insertFiles([t3]);
            }, d.prototype.insertFiles = function(t3) {
              var n2, i2, o2, r2, s2, a2;
              for (i2 = [], r2 = 0, s2 = t3.length; s2 > r2; r2++)
                o2 = t3[r2], ((a2 = this.delegate) != null ? a2.compositionShouldAcceptFile(o2) : void 0) && (n2 = e.Attachment.attachmentForFile(o2), i2.push(n2));
              return this.insertAttachments(i2);
            }, d.prototype.insertAttachment = function(t3) {
              return this.insertAttachments([t3]);
            }, d.prototype.insertAttachments = function(t3) {
              var n2, i2, o2, r2, s2, a2, u2, c2, l2;
              for (c2 = new e.Text(), r2 = 0, s2 = t3.length; s2 > r2; r2++)
                n2 = t3[r2], l2 = n2.getType(), a2 = (u2 = e.config.attachments[l2]) != null ? u2.presentation : void 0, o2 = this.getCurrentTextAttributes(), a2 && (o2.presentation = a2), i2 = e.Text.textForAttachmentWithAttributes(n2, o2), c2 = c2.appendText(i2);
              return this.insertText(c2);
            }, d.prototype.shouldManageDeletingInDirection = function(t3) {
              var e2;
              if (e2 = this.getLocationRange(), u(e2)) {
                if (t3 === "backward" && e2[0].offset === 0)
                  return true;
                if (this.shouldManageMovingCursorInDirection(t3))
                  return true;
              } else if (e2[0].index !== e2[1].index)
                return true;
              return false;
            }, d.prototype.deleteInDirection = function(t3, e2) {
              var n2, i2, o2, r2, s2, a2, c2, l2;
              return r2 = (e2 != null ? e2 : {}).length, s2 = this.getLocationRange(), a2 = this.getSelectedRange(), c2 = u(a2), c2 ? o2 = t3 === "backward" && s2[0].offset === 0 : l2 = s2[0].index !== s2[1].index, o2 && this.canDecreaseBlockAttributeLevel() && (i2 = this.getBlock(), i2.isListItem() ? this.decreaseListLevel() : this.decreaseBlockAttributeLevel(), this.setSelection(a2[0]), i2.isEmpty()) ? false : (c2 && (a2 = this.getExpandedRangeInDirection(t3, { length: r2 }), t3 === "backward" && (n2 = this.getAttachmentAtRange(a2))), n2 ? (this.editAttachment(n2), false) : (this.setDocument(this.document.removeTextAtRange(a2)), this.setSelection(a2[0]), o2 || l2 ? false : void 0));
            }, d.prototype.moveTextFromRange = function(t3) {
              var e2;
              return e2 = this.getSelectedRange()[0], this.setDocument(this.document.moveTextFromRangeToPosition(t3, e2)), this.setSelection(e2);
            }, d.prototype.removeAttachment = function(t3) {
              var e2;
              return (e2 = this.document.getRangeOfAttachment(t3)) ? (this.stopEditingAttachment(), this.setDocument(this.document.removeTextAtRange(e2)), this.setSelection(e2[0])) : void 0;
            }, d.prototype.removeLastBlockAttribute = function() {
              var t3, e2, n2, i2;
              return n2 = this.getSelectedRange(), i2 = n2[0], e2 = n2[1], t3 = this.document.getBlockAtPosition(e2), this.removeCurrentAttribute(t3.getLastAttribute()), this.setSelection(i2);
            }, f = " ", d.prototype.insertPlaceholder = function() {
              return this.placeholderPosition = this.getPosition(), this.insertString(f);
            }, d.prototype.selectPlaceholder = function() {
              return this.placeholderPosition != null ? (this.setSelectedRange([this.placeholderPosition, this.placeholderPosition + f.length]), this.getSelectedRange()) : void 0;
            }, d.prototype.forgetPlaceholder = function() {
              return this.placeholderPosition = null;
            }, d.prototype.hasCurrentAttribute = function(t3) {
              var e2;
              return e2 = this.currentAttributes[t3], e2 != null && e2 !== false;
            }, d.prototype.toggleCurrentAttribute = function(t3) {
              var e2;
              return (e2 = !this.currentAttributes[t3]) ? this.setCurrentAttribute(t3, e2) : this.removeCurrentAttribute(t3);
            }, d.prototype.canSetCurrentAttribute = function(t3) {
              return o(t3) ? this.canSetCurrentBlockAttribute(t3) : this.canSetCurrentTextAttribute(t3);
            }, d.prototype.canSetCurrentTextAttribute = function() {
              var t3, e2, n2, i2, o2;
              if (e2 = this.getSelectedDocument()) {
                for (o2 = e2.getAttachments(), n2 = 0, i2 = o2.length; i2 > n2; n2++)
                  if (t3 = o2[n2], !t3.hasContent())
                    return false;
                return true;
              }
            }, d.prototype.canSetCurrentBlockAttribute = function() {
              var t3;
              if (t3 = this.getBlock())
                return !t3.isTerminalBlock();
            }, d.prototype.setCurrentAttribute = function(t3, e2) {
              return o(t3) ? this.setBlockAttribute(t3, e2) : (this.setTextAttribute(t3, e2), this.currentAttributes[t3] = e2, this.notifyDelegateOfCurrentAttributesChange());
            }, d.prototype.setTextAttribute = function(t3, n2) {
              var i2, o2, r2, s2;
              if (o2 = this.getSelectedRange())
                return r2 = o2[0], i2 = o2[1], r2 !== i2 ? this.setDocument(this.document.addAttributeAtRange(t3, n2, o2)) : t3 === "href" ? (s2 = e.Text.textForStringWithAttributes(n2, { href: n2 }), this.insertText(s2)) : void 0;
            }, d.prototype.setBlockAttribute = function(t3, e2) {
              var n2, i2;
              if (i2 = this.getSelectedRange())
                return this.canSetCurrentAttribute(t3) ? (n2 = this.getBlock(), this.setDocument(this.document.applyBlockAttributeAtRange(t3, e2, i2)), this.setSelection(i2)) : void 0;
            }, d.prototype.removeCurrentAttribute = function(t3) {
              return o(t3) ? (this.removeBlockAttribute(t3), this.updateCurrentAttributes()) : (this.removeTextAttribute(t3), delete this.currentAttributes[t3], this.notifyDelegateOfCurrentAttributesChange());
            }, d.prototype.removeTextAttribute = function(t3) {
              var e2;
              if (e2 = this.getSelectedRange())
                return this.setDocument(this.document.removeAttributeAtRange(t3, e2));
            }, d.prototype.removeBlockAttribute = function(t3) {
              var e2;
              if (e2 = this.getSelectedRange())
                return this.setDocument(this.document.removeAttributeAtRange(t3, e2));
            }, d.prototype.canDecreaseNestingLevel = function() {
              var t3;
              return ((t3 = this.getBlock()) != null ? t3.getNestingLevel() : void 0) > 0;
            }, d.prototype.canIncreaseNestingLevel = function() {
              var e2, n2, i2;
              if (e2 = this.getBlock())
                return ((i2 = o(e2.getLastNestableAttribute())) != null ? i2.listAttribute : 0) ? (n2 = this.getPreviousBlock()) ? t2(n2.getListItemAttributes(), e2.getListItemAttributes()) : void 0 : e2.getNestingLevel() > 0;
            }, d.prototype.decreaseNestingLevel = function() {
              var t3;
              if (t3 = this.getBlock())
                return this.setDocument(this.document.replaceBlock(t3, t3.decreaseNestingLevel()));
            }, d.prototype.increaseNestingLevel = function() {
              var t3;
              if (t3 = this.getBlock())
                return this.setDocument(this.document.replaceBlock(t3, t3.increaseNestingLevel()));
            }, d.prototype.canDecreaseBlockAttributeLevel = function() {
              var t3;
              return ((t3 = this.getBlock()) != null ? t3.getAttributeLevel() : void 0) > 0;
            }, d.prototype.decreaseBlockAttributeLevel = function() {
              var t3, e2;
              return (t3 = (e2 = this.getBlock()) != null ? e2.getLastAttribute() : void 0) ? this.removeCurrentAttribute(t3) : void 0;
            }, d.prototype.decreaseListLevel = function() {
              var t3, e2, n2, i2, o2, r2;
              for (r2 = this.getSelectedRange()[0], o2 = this.document.locationFromPosition(r2).index, n2 = o2, t3 = this.getBlock().getAttributeLevel(); (e2 = this.document.getBlockAtIndex(n2 + 1)) && e2.isListItem() && e2.getAttributeLevel() > t3; )
                n2++;
              return r2 = this.document.positionFromLocation({ index: o2, offset: 0 }), i2 = this.document.positionFromLocation({ index: n2, offset: 0 }), this.setDocument(this.document.removeLastListAttributeAtRange([r2, i2]));
            }, d.prototype.updateCurrentAttributes = function() {
              var t3, e2, n2, o2, r2, s2;
              if (s2 = this.getSelectedRange({ ignoreLock: true })) {
                for (e2 = this.document.getCommonAttributesAtRange(s2), r2 = i(), n2 = 0, o2 = r2.length; o2 > n2; n2++)
                  t3 = r2[n2], e2[t3] || this.canSetCurrentAttribute(t3) || (e2[t3] = false);
                if (!a(e2, this.currentAttributes))
                  return this.currentAttributes = e2, this.notifyDelegateOfCurrentAttributesChange();
              }
            }, d.prototype.getCurrentAttributes = function() {
              return n.call({}, this.currentAttributes);
            }, d.prototype.getCurrentTextAttributes = function() {
              var t3, e2, n2, i2;
              t3 = {}, n2 = this.currentAttributes;
              for (e2 in n2)
                i2 = n2[e2], i2 !== false && r(e2) && (t3[e2] = i2);
              return t3;
            }, d.prototype.freezeSelection = function() {
              return this.setCurrentAttribute("frozen", true);
            }, d.prototype.thawSelection = function() {
              return this.removeCurrentAttribute("frozen");
            }, d.prototype.hasFrozenSelection = function() {
              return this.hasCurrentAttribute("frozen");
            }, d.proxyMethod("getSelectionManager().getPointRange"), d.proxyMethod("getSelectionManager().setLocationRangeFromPointRange"), d.proxyMethod("getSelectionManager().createLocationRangeFromDOMRange"), d.proxyMethod("getSelectionManager().locationIsCursorTarget"), d.proxyMethod("getSelectionManager().selectionIsExpanded"), d.proxyMethod("delegate?.getSelectionManager"), d.prototype.setSelection = function(t3) {
              var e2, n2;
              return e2 = this.document.locationRangeFromRange(t3), (n2 = this.delegate) != null ? n2.compositionDidRequestChangingSelectionToLocationRange(e2) : void 0;
            }, d.prototype.getSelectedRange = function() {
              var t3;
              return (t3 = this.getLocationRange()) ? this.document.rangeFromLocationRange(t3) : void 0;
            }, d.prototype.setSelectedRange = function(t3) {
              var e2;
              return e2 = this.document.locationRangeFromRange(t3), this.getSelectionManager().setLocationRange(e2);
            }, d.prototype.getPosition = function() {
              var t3;
              return (t3 = this.getLocationRange()) ? this.document.positionFromLocation(t3[0]) : void 0;
            }, d.prototype.getLocationRange = function(t3) {
              var e2, n2;
              return (e2 = (n2 = this.targetLocationRange) != null ? n2 : this.getSelectionManager().getLocationRange(t3)) != null ? e2 : s({ index: 0, offset: 0 });
            }, d.prototype.withTargetLocationRange = function(t3, e2) {
              var n2;
              this.targetLocationRange = t3;
              try {
                n2 = e2();
              } finally {
                this.targetLocationRange = null;
              }
              return n2;
            }, d.prototype.withTargetRange = function(t3, e2) {
              var n2;
              return n2 = this.document.locationRangeFromRange(t3), this.withTargetLocationRange(n2, e2);
            }, d.prototype.withTargetDOMRange = function(t3, e2) {
              var n2;
              return n2 = this.createLocationRangeFromDOMRange(t3, { strict: false }), this.withTargetLocationRange(n2, e2);
            }, d.prototype.getExpandedRangeInDirection = function(t3, e2) {
              var n2, i2, o2, r2;
              return i2 = (e2 != null ? e2 : {}).length, o2 = this.getSelectedRange(), r2 = o2[0], n2 = o2[1], t3 === "backward" ? i2 ? r2 -= i2 : r2 = this.translateUTF16PositionFromOffset(r2, -1) : i2 ? n2 += i2 : n2 = this.translateUTF16PositionFromOffset(n2, 1), s([r2, n2]);
            }, d.prototype.shouldManageMovingCursorInDirection = function(t3) {
              var e2;
              return this.editingAttachment ? true : (e2 = this.getExpandedRangeInDirection(t3), this.getAttachmentAtRange(e2) != null);
            }, d.prototype.moveCursorInDirection = function(t3) {
              var e2, n2, i2, o2;
              return this.editingAttachment ? i2 = this.document.getRangeOfAttachment(this.editingAttachment) : (o2 = this.getSelectedRange(), i2 = this.getExpandedRangeInDirection(t3), n2 = !c(o2, i2)), this.setSelectedRange(t3 === "backward" ? i2[0] : i2[1]), n2 && (e2 = this.getAttachmentAtRange(i2)) ? this.editAttachment(e2) : void 0;
            }, d.prototype.expandSelectionInDirection = function(t3, e2) {
              var n2, i2;
              return n2 = (e2 != null ? e2 : {}).length, i2 = this.getExpandedRangeInDirection(t3, { length: n2 }), this.setSelectedRange(i2);
            }, d.prototype.expandSelectionForEditing = function() {
              return this.hasCurrentAttribute("href") ? this.expandSelectionAroundCommonAttribute("href") : void 0;
            }, d.prototype.expandSelectionAroundCommonAttribute = function(t3) {
              var e2, n2;
              return e2 = this.getPosition(), n2 = this.document.getRangeOfCommonAttributeAtPosition(t3, e2), this.setSelectedRange(n2);
            }, d.prototype.selectionContainsAttachments = function() {
              var t3;
              return ((t3 = this.getSelectedAttachments()) != null ? t3.length : void 0) > 0;
            }, d.prototype.selectionIsInCursorTarget = function() {
              return this.editingAttachment || this.positionIsCursorTarget(this.getPosition());
            }, d.prototype.positionIsCursorTarget = function(t3) {
              var e2;
              return (e2 = this.document.locationFromPosition(t3)) ? this.locationIsCursorTarget(e2) : void 0;
            }, d.prototype.positionIsBlockBreak = function(t3) {
              var e2;
              return (e2 = this.document.getPieceAtPosition(t3)) != null ? e2.isBlockBreak() : void 0;
            }, d.prototype.getSelectedDocument = function() {
              var t3;
              return (t3 = this.getSelectedRange()) ? this.document.getDocumentAtRange(t3) : void 0;
            }, d.prototype.getSelectedAttachments = function() {
              var t3;
              return (t3 = this.getSelectedDocument()) != null ? t3.getAttachments() : void 0;
            }, d.prototype.getAttachments = function() {
              return this.attachments.slice(0);
            }, d.prototype.refreshAttachments = function() {
              var t3, e2, n2, i2, o2, r2, s2, a2, u2, c2, h2, p3;
              for (n2 = this.document.getAttachments(), a2 = l(this.attachments, n2), t3 = a2.added, h2 = a2.removed, this.attachments = n2, i2 = 0, r2 = h2.length; r2 > i2; i2++)
                e2 = h2[i2], e2.delegate = null, (u2 = this.delegate) != null && typeof u2.compositionDidRemoveAttachment == "function" && u2.compositionDidRemoveAttachment(e2);
              for (p3 = [], o2 = 0, s2 = t3.length; s2 > o2; o2++)
                e2 = t3[o2], e2.delegate = this, p3.push((c2 = this.delegate) != null && typeof c2.compositionDidAddAttachment == "function" ? c2.compositionDidAddAttachment(e2) : void 0);
              return p3;
            }, d.prototype.attachmentDidChangeAttributes = function(t3) {
              var e2;
              return this.revision++, (e2 = this.delegate) != null && typeof e2.compositionDidEditAttachment == "function" ? e2.compositionDidEditAttachment(t3) : void 0;
            }, d.prototype.attachmentDidChangePreviewURL = function(t3) {
              var e2;
              return this.revision++, (e2 = this.delegate) != null && typeof e2.compositionDidChangeAttachmentPreviewURL == "function" ? e2.compositionDidChangeAttachmentPreviewURL(t3) : void 0;
            }, d.prototype.editAttachment = function(t3, e2) {
              var n2;
              if (t3 !== this.editingAttachment)
                return this.stopEditingAttachment(), this.editingAttachment = t3, (n2 = this.delegate) != null && typeof n2.compositionDidStartEditingAttachment == "function" ? n2.compositionDidStartEditingAttachment(this.editingAttachment, e2) : void 0;
            }, d.prototype.stopEditingAttachment = function() {
              var t3;
              if (this.editingAttachment)
                return (t3 = this.delegate) != null && typeof t3.compositionDidStopEditingAttachment == "function" && t3.compositionDidStopEditingAttachment(this.editingAttachment), this.editingAttachment = null;
            }, d.prototype.updateAttributesForAttachment = function(t3, e2) {
              return this.setDocument(this.document.updateAttributesForAttachment(t3, e2));
            }, d.prototype.removeAttributeForAttachment = function(t3, e2) {
              return this.setDocument(this.document.removeAttributeForAttachment(t3, e2));
            }, d.prototype.breakFormattedBlock = function(t3) {
              var n2, i2, o2, r2, s2;
              return i2 = t3.document, n2 = t3.block, r2 = t3.startPosition, s2 = [r2 - 1, r2], n2.getBlockBreakPosition() === t3.startLocation.offset ? (n2.breaksOnReturn() && t3.nextCharacter === "\n" ? r2 += 1 : i2 = i2.removeTextAtRange(s2), s2 = [r2, r2]) : t3.nextCharacter === "\n" ? t3.previousCharacter === "\n" ? s2 = [r2 - 1, r2 + 1] : (s2 = [r2, r2 + 1], r2 += 1) : t3.startLocation.offset - 1 !== 0 && (r2 += 1), o2 = new e.Document([n2.removeLastAttribute().copyWithoutText()]), this.setDocument(i2.insertDocumentAtRange(o2, s2)), this.setSelection(r2);
            }, d.prototype.getPreviousBlock = function() {
              var t3, e2;
              return (e2 = this.getLocationRange()) && (t3 = e2[0].index, t3 > 0) ? this.document.getBlockAtIndex(t3 - 1) : void 0;
            }, d.prototype.getBlock = function() {
              var t3;
              return (t3 = this.getLocationRange()) ? this.document.getBlockAtIndex(t3[0].index) : void 0;
            }, d.prototype.getAttachmentAtRange = function(t3) {
              var n2;
              return n2 = this.document.getDocumentAtRange(t3), n2.toString() === e.OBJECT_REPLACEMENT_CHARACTER + "\n" ? n2.getAttachments()[0] : void 0;
            }, d.prototype.notifyDelegateOfCurrentAttributesChange = function() {
              var t3;
              return (t3 = this.delegate) != null && typeof t3.compositionDidChangeCurrentAttributes == "function" ? t3.compositionDidChangeCurrentAttributes(this.currentAttributes) : void 0;
            }, d.prototype.notifyDelegateOfInsertionAtRange = function(t3) {
              var e2;
              return (e2 = this.delegate) != null && typeof e2.compositionDidPerformInsertionAtRange == "function" ? e2.compositionDidPerformInsertionAtRange(t3) : void 0;
            }, d.prototype.translateUTF16PositionFromOffset = function(t3, e2) {
              var n2, i2;
              return i2 = this.document.toUTF16String(), n2 = i2.offsetFromUCS2Offset(t3), i2.offsetToUCS2Offset(n2 + e2);
            }, d;
          }(e.BasicObject);
        }.call(this), function() {
          var t2 = function(t3, e2) {
            function i() {
              this.constructor = t3;
            }
            for (var o in e2)
              n.call(e2, o) && (t3[o] = e2[o]);
            return i.prototype = e2.prototype, t3.prototype = new i(), t3.__super__ = e2.prototype, t3;
          }, n = {}.hasOwnProperty;
          e.UndoManager = function(e2) {
            function n2(t3) {
              this.composition = t3, this.undoEntries = [], this.redoEntries = [];
            }
            var i;
            return t2(n2, e2), n2.prototype.recordUndoEntry = function(t3, e3) {
              var n3, o, r, s, a;
              return s = e3 != null ? e3 : {}, o = s.context, n3 = s.consolidatable, r = this.undoEntries.slice(-1)[0], n3 && i(r, t3, o) ? void 0 : (a = this.createEntry({ description: t3, context: o }), this.undoEntries.push(a), this.redoEntries = []);
            }, n2.prototype.undo = function() {
              var t3, e3;
              return (e3 = this.undoEntries.pop()) ? (t3 = this.createEntry(e3), this.redoEntries.push(t3), this.composition.loadSnapshot(e3.snapshot)) : void 0;
            }, n2.prototype.redo = function() {
              var t3, e3;
              return (t3 = this.redoEntries.pop()) ? (e3 = this.createEntry(t3), this.undoEntries.push(e3), this.composition.loadSnapshot(t3.snapshot)) : void 0;
            }, n2.prototype.canUndo = function() {
              return this.undoEntries.length > 0;
            }, n2.prototype.canRedo = function() {
              return this.redoEntries.length > 0;
            }, n2.prototype.createEntry = function(t3) {
              var e3, n3, i2;
              return i2 = t3 != null ? t3 : {}, n3 = i2.description, e3 = i2.context, { description: n3 != null ? n3.toString() : void 0, context: JSON.stringify(e3), snapshot: this.composition.getSnapshot() };
            }, i = function(t3, e3, n3) {
              return (t3 != null ? t3.description : void 0) === (e3 != null ? e3.toString() : void 0) && (t3 != null ? t3.context : void 0) === JSON.stringify(n3);
            }, n2;
          }(e.BasicObject);
        }.call(this), function() {
          var t2;
          e.attachmentGalleryFilter = function(e2) {
            var n;
            return n = new t2(e2), n.perform(), n.getSnapshot();
          }, t2 = function() {
            function t3(t4) {
              this.document = t4.document, this.selectedRange = t4.selectedRange;
            }
            var e2, n, i;
            return e2 = "attachmentGallery", n = "presentation", i = "gallery", t3.prototype.perform = function() {
              return this.removeBlockAttribute(), this.applyBlockAttribute();
            }, t3.prototype.getSnapshot = function() {
              return { document: this.document, selectedRange: this.selectedRange };
            }, t3.prototype.removeBlockAttribute = function() {
              var t4, n2, i2, o, r;
              for (o = this.findRangesOfBlocks(), r = [], t4 = 0, n2 = o.length; n2 > t4; t4++)
                i2 = o[t4], r.push(this.document = this.document.removeAttributeAtRange(e2, i2));
              return r;
            }, t3.prototype.applyBlockAttribute = function() {
              var t4, n2, i2, o, r, s;
              for (i2 = 0, r = this.findRangesOfPieces(), s = [], t4 = 0, n2 = r.length; n2 > t4; t4++)
                o = r[t4], o[1] - o[0] > 1 && (o[0] += i2, o[1] += i2, this.document.getCharacterAtPosition(o[1]) !== "\n" && (this.document = this.document.insertBlockBreakAtRange(o[1]), o[1] < this.selectedRange[1] && this.moveSelectedRangeForward(), o[1]++, i2++), o[0] !== 0 && this.document.getCharacterAtPosition(o[0] - 1) !== "\n" && (this.document = this.document.insertBlockBreakAtRange(o[0]), o[0] < this.selectedRange[0] && this.moveSelectedRangeForward(), o[0]++, i2++), s.push(this.document = this.document.applyBlockAttributeAtRange(e2, true, o)));
              return s;
            }, t3.prototype.findRangesOfBlocks = function() {
              return this.document.findRangesForBlockAttribute(e2);
            }, t3.prototype.findRangesOfPieces = function() {
              return this.document.findRangesForTextAttribute(n, { withValue: i });
            }, t3.prototype.moveSelectedRangeForward = function() {
              return this.selectedRange[0] += 1, this.selectedRange[1] += 1;
            }, t3;
          }();
        }.call(this), function() {
          var t2 = function(t3, e2) {
            return function() {
              return t3.apply(e2, arguments);
            };
          };
          e.Editor = function() {
            function n(n2, o, r) {
              this.composition = n2, this.selectionManager = o, this.element = r, this.insertFiles = t2(this.insertFiles, this), this.undoManager = new e.UndoManager(this.composition), this.filters = i.slice(0);
            }
            var i;
            return i = [e.attachmentGalleryFilter], n.prototype.loadDocument = function(t3) {
              return this.loadSnapshot({ document: t3, selectedRange: [0, 0] });
            }, n.prototype.loadHTML = function(t3) {
              return t3 == null && (t3 = ""), this.loadDocument(e.Document.fromHTML(t3, { referenceElement: this.element }));
            }, n.prototype.loadJSON = function(t3) {
              var n2, i2;
              return n2 = t3.document, i2 = t3.selectedRange, n2 = e.Document.fromJSON(n2), this.loadSnapshot({ document: n2, selectedRange: i2 });
            }, n.prototype.loadSnapshot = function(t3) {
              return this.undoManager = new e.UndoManager(this.composition), this.composition.loadSnapshot(t3);
            }, n.prototype.getDocument = function() {
              return this.composition.document;
            }, n.prototype.getSelectedDocument = function() {
              return this.composition.getSelectedDocument();
            }, n.prototype.getSnapshot = function() {
              return this.composition.getSnapshot();
            }, n.prototype.toJSON = function() {
              return this.getSnapshot();
            }, n.prototype.deleteInDirection = function(t3) {
              return this.composition.deleteInDirection(t3);
            }, n.prototype.insertAttachment = function(t3) {
              return this.composition.insertAttachment(t3);
            }, n.prototype.insertAttachments = function(t3) {
              return this.composition.insertAttachments(t3);
            }, n.prototype.insertDocument = function(t3) {
              return this.composition.insertDocument(t3);
            }, n.prototype.insertFile = function(t3) {
              return this.composition.insertFile(t3);
            }, n.prototype.insertFiles = function(t3) {
              return this.composition.insertFiles(t3);
            }, n.prototype.insertHTML = function(t3) {
              return this.composition.insertHTML(t3);
            }, n.prototype.insertString = function(t3) {
              return this.composition.insertString(t3);
            }, n.prototype.insertText = function(t3) {
              return this.composition.insertText(t3);
            }, n.prototype.insertLineBreak = function() {
              return this.composition.insertLineBreak();
            }, n.prototype.getSelectedRange = function() {
              return this.composition.getSelectedRange();
            }, n.prototype.getPosition = function() {
              return this.composition.getPosition();
            }, n.prototype.getClientRectAtPosition = function(t3) {
              var e2;
              return e2 = this.getDocument().locationRangeFromRange([t3, t3 + 1]), this.selectionManager.getClientRectAtLocationRange(e2);
            }, n.prototype.expandSelectionInDirection = function(t3) {
              return this.composition.expandSelectionInDirection(t3);
            }, n.prototype.moveCursorInDirection = function(t3) {
              return this.composition.moveCursorInDirection(t3);
            }, n.prototype.setSelectedRange = function(t3) {
              return this.composition.setSelectedRange(t3);
            }, n.prototype.activateAttribute = function(t3, e2) {
              return e2 == null && (e2 = true), this.composition.setCurrentAttribute(t3, e2);
            }, n.prototype.attributeIsActive = function(t3) {
              return this.composition.hasCurrentAttribute(t3);
            }, n.prototype.canActivateAttribute = function(t3) {
              return this.composition.canSetCurrentAttribute(t3);
            }, n.prototype.deactivateAttribute = function(t3) {
              return this.composition.removeCurrentAttribute(t3);
            }, n.prototype.canDecreaseNestingLevel = function() {
              return this.composition.canDecreaseNestingLevel();
            }, n.prototype.canIncreaseNestingLevel = function() {
              return this.composition.canIncreaseNestingLevel();
            }, n.prototype.decreaseNestingLevel = function() {
              return this.canDecreaseNestingLevel() ? this.composition.decreaseNestingLevel() : void 0;
            }, n.prototype.increaseNestingLevel = function() {
              return this.canIncreaseNestingLevel() ? this.composition.increaseNestingLevel() : void 0;
            }, n.prototype.canRedo = function() {
              return this.undoManager.canRedo();
            }, n.prototype.canUndo = function() {
              return this.undoManager.canUndo();
            }, n.prototype.recordUndoEntry = function(t3, e2) {
              var n2, i2, o;
              return o = e2 != null ? e2 : {}, i2 = o.context, n2 = o.consolidatable, this.undoManager.recordUndoEntry(t3, { context: i2, consolidatable: n2 });
            }, n.prototype.redo = function() {
              return this.canRedo() ? this.undoManager.redo() : void 0;
            }, n.prototype.undo = function() {
              return this.canUndo() ? this.undoManager.undo() : void 0;
            }, n;
          }();
        }.call(this), function() {
          var t2 = function(t3, e2) {
            function i() {
              this.constructor = t3;
            }
            for (var o in e2)
              n.call(e2, o) && (t3[o] = e2[o]);
            return i.prototype = e2.prototype, t3.prototype = new i(), t3.__super__ = e2.prototype, t3;
          }, n = {}.hasOwnProperty;
          e.ManagedAttachment = function(e2) {
            function n2(t3, e3) {
              var n3;
              this.attachmentManager = t3, this.attachment = e3, n3 = this.attachment, this.id = n3.id, this.file = n3.file;
            }
            return t2(n2, e2), n2.prototype.remove = function() {
              return this.attachmentManager.requestRemovalOfAttachment(this.attachment);
            }, n2.proxyMethod("attachment.getAttribute"), n2.proxyMethod("attachment.hasAttribute"), n2.proxyMethod("attachment.setAttribute"), n2.proxyMethod("attachment.getAttributes"), n2.proxyMethod("attachment.setAttributes"), n2.proxyMethod("attachment.isPending"), n2.proxyMethod("attachment.isPreviewable"), n2.proxyMethod("attachment.getURL"), n2.proxyMethod("attachment.getHref"), n2.proxyMethod("attachment.getFilename"), n2.proxyMethod("attachment.getFilesize"), n2.proxyMethod("attachment.getFormattedFilesize"), n2.proxyMethod("attachment.getExtension"), n2.proxyMethod("attachment.getContentType"), n2.proxyMethod("attachment.getFile"), n2.proxyMethod("attachment.setFile"), n2.proxyMethod("attachment.releaseFile"), n2.proxyMethod("attachment.getUploadProgress"), n2.proxyMethod("attachment.setUploadProgress"), n2;
          }(e.BasicObject);
        }.call(this), function() {
          var t2 = function(t3, e2) {
            function i() {
              this.constructor = t3;
            }
            for (var o in e2)
              n.call(e2, o) && (t3[o] = e2[o]);
            return i.prototype = e2.prototype, t3.prototype = new i(), t3.__super__ = e2.prototype, t3;
          }, n = {}.hasOwnProperty;
          e.AttachmentManager = function(n2) {
            function i(t3) {
              var e2, n3, i2;
              for (t3 == null && (t3 = []), this.managedAttachments = {}, n3 = 0, i2 = t3.length; i2 > n3; n3++)
                e2 = t3[n3], this.manageAttachment(e2);
            }
            return t2(i, n2), i.prototype.getAttachments = function() {
              var t3, e2, n3, i2;
              n3 = this.managedAttachments, i2 = [];
              for (e2 in n3)
                t3 = n3[e2], i2.push(t3);
              return i2;
            }, i.prototype.manageAttachment = function(t3) {
              var n3, i2;
              return (n3 = this.managedAttachments)[i2 = t3.id] != null ? n3[i2] : n3[i2] = new e.ManagedAttachment(this, t3);
            }, i.prototype.attachmentIsManaged = function(t3) {
              return t3.id in this.managedAttachments;
            }, i.prototype.requestRemovalOfAttachment = function(t3) {
              var e2;
              return this.attachmentIsManaged(t3) && (e2 = this.delegate) != null && typeof e2.attachmentManagerDidRequestRemovalOfAttachment == "function" ? e2.attachmentManagerDidRequestRemovalOfAttachment(t3) : void 0;
            }, i.prototype.unmanageAttachment = function(t3) {
              var e2;
              return e2 = this.managedAttachments[t3.id], delete this.managedAttachments[t3.id], e2;
            }, i;
          }(e.BasicObject);
        }.call(this), function() {
          var t2, n, i, o, r, s, a, u, c, l, h;
          t2 = e.elementContainsNode, n = e.findChildIndexOfNode, r = e.nodeIsBlockStart, s = e.nodeIsBlockStartComment, o = e.nodeIsBlockContainer, a = e.nodeIsCursorTarget, u = e.nodeIsEmptyTextNode, c = e.nodeIsTextNode, i = e.nodeIsAttachmentElement, l = e.tagName, h = e.walkTree, e.LocationMapper = function() {
            function e2(t3) {
              this.element = t3;
            }
            var p, d, f, g;
            return e2.prototype.findLocationFromContainerAndOffset = function(e3, i2, o2) {
              var s2, u2, l2, p2, g2, m, v;
              for (m = (o2 != null ? o2 : { strict: true }).strict, u2 = 0, l2 = false, p2 = { index: 0, offset: 0 }, (s2 = this.findAttachmentElementParentForNode(e3)) && (e3 = s2.parentNode, i2 = n(s2)), v = h(this.element, { usingFilter: f }); v.nextNode(); ) {
                if (g2 = v.currentNode, g2 === e3 && c(e3)) {
                  a(g2) || (p2.offset += i2);
                  break;
                }
                if (g2.parentNode === e3) {
                  if (u2++ === i2)
                    break;
                } else if (!t2(e3, g2) && u2 > 0)
                  break;
                r(g2, { strict: m }) ? (l2 && p2.index++, p2.offset = 0, l2 = true) : p2.offset += d(g2);
              }
              return p2;
            }, e2.prototype.findContainerAndOffsetFromLocation = function(t3) {
              var e3, i2, s2, u2, l2;
              if (t3.index === 0 && t3.offset === 0) {
                for (e3 = this.element, u2 = 0; e3.firstChild; )
                  if (e3 = e3.firstChild, o(e3)) {
                    u2 = 1;
                    break;
                  }
                return [e3, u2];
              }
              if (l2 = this.findNodeAndOffsetFromLocation(t3), i2 = l2[0], s2 = l2[1], i2) {
                if (c(i2))
                  d(i2) === 0 ? (e3 = i2.parentNode.parentNode, u2 = n(i2.parentNode), a(i2, { name: "right" }) && u2++) : (e3 = i2, u2 = t3.offset - s2);
                else {
                  if (e3 = i2.parentNode, !r(i2.previousSibling) && !o(e3))
                    for (; i2 === e3.lastChild && (i2 = e3, e3 = e3.parentNode, !o(e3)); )
                      ;
                  u2 = n(i2), t3.offset !== 0 && u2++;
                }
                return [e3, u2];
              }
            }, e2.prototype.findNodeAndOffsetFromLocation = function(t3) {
              var e3, n2, i2, o2, r2, s2, u2, l2;
              for (u2 = 0, l2 = this.getSignificantNodesForIndex(t3.index), n2 = 0, i2 = l2.length; i2 > n2; n2++) {
                if (e3 = l2[n2], o2 = d(e3), t3.offset <= u2 + o2)
                  if (c(e3)) {
                    if (r2 = e3, s2 = u2, t3.offset === s2 && a(r2))
                      break;
                  } else
                    r2 || (r2 = e3, s2 = u2);
                if (u2 += o2, u2 > t3.offset)
                  break;
              }
              return [r2, s2];
            }, e2.prototype.findAttachmentElementParentForNode = function(t3) {
              for (; t3 && t3 !== this.element; ) {
                if (i(t3))
                  return t3;
                t3 = t3.parentNode;
              }
            }, e2.prototype.getSignificantNodesForIndex = function(t3) {
              var e3, n2, i2, o2, r2;
              for (i2 = [], r2 = h(this.element, { usingFilter: p }), o2 = false; r2.nextNode(); )
                if (n2 = r2.currentNode, s(n2)) {
                  if (typeof e3 != "undefined" && e3 !== null ? e3++ : e3 = 0, e3 === t3)
                    o2 = true;
                  else if (o2)
                    break;
                } else
                  o2 && i2.push(n2);
              return i2;
            }, d = function(t3) {
              var e3;
              return t3.nodeType === Node.TEXT_NODE ? a(t3) ? 0 : (e3 = t3.textContent, e3.length) : l(t3) === "br" || i(t3) ? 1 : 0;
            }, p = function(t3) {
              return g(t3) === NodeFilter.FILTER_ACCEPT ? f(t3) : NodeFilter.FILTER_REJECT;
            }, g = function(t3) {
              return u(t3) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
            }, f = function(t3) {
              return i(t3.parentNode) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
            }, e2;
          }();
        }.call(this), function() {
          var t2, n, i = [].slice;
          t2 = e.getDOMRange, n = e.setDOMRange, e.PointMapper = function() {
            function e2() {
            }
            return e2.prototype.createDOMRangeFromPoint = function(e3) {
              var i2, o, r, s, a, u, c, l;
              if (c = e3.x, l = e3.y, document.caretPositionFromPoint)
                return a = document.caretPositionFromPoint(c, l), r = a.offsetNode, o = a.offset, i2 = document.createRange(), i2.setStart(r, o), i2;
              if (document.caretRangeFromPoint)
                return document.caretRangeFromPoint(c, l);
              if (document.body.createTextRange) {
                s = t2();
                try {
                  u = document.body.createTextRange(), u.moveToPoint(c, l), u.select();
                } catch (h) {
                }
                return i2 = t2(), n(s), i2;
              }
            }, e2.prototype.getClientRectsForDOMRange = function(t3) {
              var e3, n2, o;
              return n2 = i.call(t3.getClientRects()), o = n2[0], e3 = n2[n2.length - 1], [o, e3];
            }, e2;
          }();
        }.call(this), function() {
          var t2, n = function(t3, e2) {
            return function() {
              return t3.apply(e2, arguments);
            };
          }, i = function(t3, e2) {
            function n2() {
              this.constructor = t3;
            }
            for (var i2 in e2)
              o.call(e2, i2) && (t3[i2] = e2[i2]);
            return n2.prototype = e2.prototype, t3.prototype = new n2(), t3.__super__ = e2.prototype, t3;
          }, o = {}.hasOwnProperty, r = [].indexOf || function(t3) {
            for (var e2 = 0, n2 = this.length; n2 > e2; e2++)
              if (e2 in this && this[e2] === t3)
                return e2;
            return -1;
          };
          t2 = e.getDOMRange, e.SelectionChangeObserver = function(e2) {
            function o2() {
              this.run = n(this.run, this), this.update = n(this.update, this), this.selectionManagers = [];
            }
            var s;
            return i(o2, e2), o2.prototype.start = function() {
              return this.started ? void 0 : (this.started = true, "onselectionchange" in document ? document.addEventListener("selectionchange", this.update, true) : this.run());
            }, o2.prototype.stop = function() {
              return this.started ? (this.started = false, document.removeEventListener("selectionchange", this.update, true)) : void 0;
            }, o2.prototype.registerSelectionManager = function(t3) {
              return r.call(this.selectionManagers, t3) < 0 ? (this.selectionManagers.push(t3), this.start()) : void 0;
            }, o2.prototype.unregisterSelectionManager = function(t3) {
              var e3;
              return this.selectionManagers = function() {
                var n2, i2, o3, r2;
                for (o3 = this.selectionManagers, r2 = [], n2 = 0, i2 = o3.length; i2 > n2; n2++)
                  e3 = o3[n2], e3 !== t3 && r2.push(e3);
                return r2;
              }.call(this), this.selectionManagers.length === 0 ? this.stop() : void 0;
            }, o2.prototype.notifySelectionManagersOfSelectionChange = function() {
              var t3, e3, n2, i2, o3;
              for (n2 = this.selectionManagers, i2 = [], t3 = 0, e3 = n2.length; e3 > t3; t3++)
                o3 = n2[t3], i2.push(o3.selectionDidChange());
              return i2;
            }, o2.prototype.update = function() {
              var e3;
              return e3 = t2(), s(e3, this.domRange) ? void 0 : (this.domRange = e3, this.notifySelectionManagersOfSelectionChange());
            }, o2.prototype.reset = function() {
              return this.domRange = null, this.update();
            }, o2.prototype.run = function() {
              return this.started ? (this.update(), requestAnimationFrame(this.run)) : void 0;
            }, s = function(t3, e3) {
              return (t3 != null ? t3.startContainer : void 0) === (e3 != null ? e3.startContainer : void 0) && (t3 != null ? t3.startOffset : void 0) === (e3 != null ? e3.startOffset : void 0) && (t3 != null ? t3.endContainer : void 0) === (e3 != null ? e3.endContainer : void 0) && (t3 != null ? t3.endOffset : void 0) === (e3 != null ? e3.endOffset : void 0);
            }, o2;
          }(e.BasicObject), e.selectionChangeObserver == null && (e.selectionChangeObserver = new e.SelectionChangeObserver());
        }.call(this), function() {
          var t2, n, i, o, r, s, a, u, c, l, h = function(t3, e2) {
            return function() {
              return t3.apply(e2, arguments);
            };
          }, p = function(t3, e2) {
            function n2() {
              this.constructor = t3;
            }
            for (var i2 in e2)
              d.call(e2, i2) && (t3[i2] = e2[i2]);
            return n2.prototype = e2.prototype, t3.prototype = new n2(), t3.__super__ = e2.prototype, t3;
          }, d = {}.hasOwnProperty;
          i = e.getDOMSelection, n = e.getDOMRange, l = e.setDOMRange, t2 = e.elementContainsNode, s = e.nodeIsCursorTarget, r = e.innerElementIsActive, o = e.handleEvent, a = e.normalizeRange, u = e.rangeIsCollapsed, c = e.rangesAreEqual, e.SelectionManager = function(d2) {
            function f(t3) {
              this.element = t3, this.selectionDidChange = h(this.selectionDidChange, this), this.didMouseDown = h(this.didMouseDown, this), this.locationMapper = new e.LocationMapper(this.element), this.pointMapper = new e.PointMapper(), this.lockCount = 0, o("mousedown", { onElement: this.element, withCallback: this.didMouseDown });
            }
            return p(f, d2), f.prototype.getLocationRange = function(t3) {
              var e2, i2;
              return t3 == null && (t3 = {}), e2 = t3.strict === false ? this.createLocationRangeFromDOMRange(n(), { strict: false }) : t3.ignoreLock ? this.currentLocationRange : (i2 = this.lockedLocationRange) != null ? i2 : this.currentLocationRange;
            }, f.prototype.setLocationRange = function(t3) {
              var e2;
              if (!this.lockedLocationRange)
                return t3 = a(t3), (e2 = this.createDOMRangeFromLocationRange(t3)) ? (l(e2), this.updateCurrentLocationRange(t3)) : void 0;
            }, f.prototype.setLocationRangeFromPointRange = function(t3) {
              var e2, n2;
              return t3 = a(t3), n2 = this.getLocationAtPoint(t3[0]), e2 = this.getLocationAtPoint(t3[1]), this.setLocationRange([n2, e2]);
            }, f.prototype.getClientRectAtLocationRange = function(t3) {
              var e2;
              return (e2 = this.createDOMRangeFromLocationRange(t3)) ? this.getClientRectsForDOMRange(e2)[1] : void 0;
            }, f.prototype.locationIsCursorTarget = function(t3) {
              var e2, n2, i2;
              return i2 = this.findNodeAndOffsetFromLocation(t3), e2 = i2[0], n2 = i2[1], s(e2);
            }, f.prototype.lock = function() {
              return this.lockCount++ === 0 ? (this.updateCurrentLocationRange(), this.lockedLocationRange = this.getLocationRange()) : void 0;
            }, f.prototype.unlock = function() {
              var t3;
              return --this.lockCount === 0 && (t3 = this.lockedLocationRange, this.lockedLocationRange = null, t3 != null) ? this.setLocationRange(t3) : void 0;
            }, f.prototype.clearSelection = function() {
              var t3;
              return (t3 = i()) != null ? t3.removeAllRanges() : void 0;
            }, f.prototype.selectionIsCollapsed = function() {
              var t3;
              return ((t3 = n()) != null ? t3.collapsed : void 0) === true;
            }, f.prototype.selectionIsExpanded = function() {
              return !this.selectionIsCollapsed();
            }, f.prototype.createLocationRangeFromDOMRange = function(t3, e2) {
              var n2, i2;
              if (t3 != null && this.domRangeWithinElement(t3) && (i2 = this.findLocationFromContainerAndOffset(t3.startContainer, t3.startOffset, e2)))
                return t3.collapsed || (n2 = this.findLocationFromContainerAndOffset(t3.endContainer, t3.endOffset, e2)), a([i2, n2]);
            }, f.proxyMethod("locationMapper.findLocationFromContainerAndOffset"), f.proxyMethod("locationMapper.findContainerAndOffsetFromLocation"), f.proxyMethod("locationMapper.findNodeAndOffsetFromLocation"), f.proxyMethod("pointMapper.createDOMRangeFromPoint"), f.proxyMethod("pointMapper.getClientRectsForDOMRange"), f.prototype.didMouseDown = function() {
              return this.pauseTemporarily();
            }, f.prototype.pauseTemporarily = function() {
              var e2, n2, i2, r2;
              return this.paused = true, n2 = function(e3) {
                return function() {
                  var n3, o2, s2;
                  for (e3.paused = false, clearTimeout(r2), o2 = 0, s2 = i2.length; s2 > o2; o2++)
                    n3 = i2[o2], n3.destroy();
                  return t2(document, e3.element) ? e3.selectionDidChange() : void 0;
                };
              }(this), r2 = setTimeout(n2, 200), i2 = function() {
                var t3, i3, r3, s2;
                for (r3 = ["mousemove", "keydown"], s2 = [], t3 = 0, i3 = r3.length; i3 > t3; t3++)
                  e2 = r3[t3], s2.push(o(e2, { onElement: document, withCallback: n2 }));
                return s2;
              }();
            }, f.prototype.selectionDidChange = function() {
              return this.paused || r(this.element) ? void 0 : this.updateCurrentLocationRange();
            }, f.prototype.updateCurrentLocationRange = function(t3) {
              var e2;
              return (t3 != null ? t3 : t3 = this.createLocationRangeFromDOMRange(n())) && !c(t3, this.currentLocationRange) ? (this.currentLocationRange = t3, (e2 = this.delegate) != null && typeof e2.locationRangeDidChange == "function" ? e2.locationRangeDidChange(this.currentLocationRange.slice(0)) : void 0) : void 0;
            }, f.prototype.createDOMRangeFromLocationRange = function(t3) {
              var e2, n2, i2, o2;
              return i2 = this.findContainerAndOffsetFromLocation(t3[0]), n2 = u(t3) ? i2 : (o2 = this.findContainerAndOffsetFromLocation(t3[1])) != null ? o2 : i2, i2 != null && n2 != null ? (e2 = document.createRange(), e2.setStart.apply(e2, i2), e2.setEnd.apply(e2, n2), e2) : void 0;
            }, f.prototype.getLocationAtPoint = function(t3) {
              var e2, n2;
              return (e2 = this.createDOMRangeFromPoint(t3)) && (n2 = this.createLocationRangeFromDOMRange(e2)) != null ? n2[0] : void 0;
            }, f.prototype.domRangeWithinElement = function(e2) {
              return e2.collapsed ? t2(this.element, e2.startContainer) : t2(this.element, e2.startContainer) && t2(this.element, e2.endContainer);
            }, f;
          }(e.BasicObject);
        }.call(this), function() {
          var t2, n, i, o, r = function(t3, e2) {
            function n2() {
              this.constructor = t3;
            }
            for (var i2 in e2)
              s.call(e2, i2) && (t3[i2] = e2[i2]);
            return n2.prototype = e2.prototype, t3.prototype = new n2(), t3.__super__ = e2.prototype, t3;
          }, s = {}.hasOwnProperty, a = [].slice;
          i = e.rangeIsCollapsed, o = e.rangesAreEqual, n = e.objectsAreEqual, t2 = e.getBlockConfig, e.EditorController = function(s2) {
            function u(t3) {
              var n2, i2;
              this.editorElement = t3.editorElement, n2 = t3.document, i2 = t3.html, this.selectionManager = new e.SelectionManager(this.editorElement), this.selectionManager.delegate = this, this.composition = new e.Composition(), this.composition.delegate = this, this.attachmentManager = new e.AttachmentManager(this.composition.getAttachments()), this.attachmentManager.delegate = this, this.inputController = new e["Level" + e.config.input.getLevel() + "InputController"](this.editorElement), this.inputController.delegate = this, this.inputController.responder = this.composition, this.compositionController = new e.CompositionController(this.editorElement, this.composition), this.compositionController.delegate = this, this.toolbarController = new e.ToolbarController(this.editorElement.toolbarElement), this.toolbarController.delegate = this, this.editor = new e.Editor(this.composition, this.selectionManager, this.editorElement), n2 != null ? this.editor.loadDocument(n2) : this.editor.loadHTML(i2);
            }
            var c;
            return r(u, s2), u.prototype.registerSelectionManager = function() {
              return e.selectionChangeObserver.registerSelectionManager(this.selectionManager);
            }, u.prototype.unregisterSelectionManager = function() {
              return e.selectionChangeObserver.unregisterSelectionManager(this.selectionManager);
            }, u.prototype.render = function() {
              return this.compositionController.render();
            }, u.prototype.reparse = function() {
              return this.composition.replaceHTML(this.editorElement.innerHTML);
            }, u.prototype.compositionDidChangeDocument = function() {
              return this.notifyEditorElement("document-change"), this.handlingInput ? void 0 : this.render();
            }, u.prototype.compositionDidChangeCurrentAttributes = function(t3) {
              return this.currentAttributes = t3, this.toolbarController.updateAttributes(this.currentAttributes), this.updateCurrentActions(), this.notifyEditorElement("attributes-change", { attributes: this.currentAttributes });
            }, u.prototype.compositionDidPerformInsertionAtRange = function(t3) {
              return this.pasting ? this.pastedRange = t3 : void 0;
            }, u.prototype.compositionShouldAcceptFile = function(t3) {
              return this.notifyEditorElement("file-accept", { file: t3 });
            }, u.prototype.compositionDidAddAttachment = function(t3) {
              var e2;
              return e2 = this.attachmentManager.manageAttachment(t3), this.notifyEditorElement("attachment-add", { attachment: e2 });
            }, u.prototype.compositionDidEditAttachment = function(t3) {
              var e2;
              return this.compositionController.rerenderViewForObject(t3), e2 = this.attachmentManager.manageAttachment(t3), this.notifyEditorElement("attachment-edit", { attachment: e2 }), this.notifyEditorElement("change");
            }, u.prototype.compositionDidChangeAttachmentPreviewURL = function(t3) {
              return this.compositionController.invalidateViewForObject(t3), this.notifyEditorElement("change");
            }, u.prototype.compositionDidRemoveAttachment = function(t3) {
              var e2;
              return e2 = this.attachmentManager.unmanageAttachment(t3), this.notifyEditorElement("attachment-remove", { attachment: e2 });
            }, u.prototype.compositionDidStartEditingAttachment = function(t3, e2) {
              return this.attachmentLocationRange = this.composition.document.getLocationRangeOfAttachment(t3), this.compositionController.installAttachmentEditorForAttachment(t3, e2), this.selectionManager.setLocationRange(this.attachmentLocationRange);
            }, u.prototype.compositionDidStopEditingAttachment = function() {
              return this.compositionController.uninstallAttachmentEditor(), this.attachmentLocationRange = null;
            }, u.prototype.compositionDidRequestChangingSelectionToLocationRange = function(t3) {
              return !this.loadingSnapshot || this.isFocused() ? (this.requestedLocationRange = t3, this.compositionRevisionWhenLocationRangeRequested = this.composition.revision, this.handlingInput ? void 0 : this.render()) : void 0;
            }, u.prototype.compositionWillLoadSnapshot = function() {
              return this.loadingSnapshot = true;
            }, u.prototype.compositionDidLoadSnapshot = function() {
              return this.compositionController.refreshViewCache(), this.render(), this.loadingSnapshot = false;
            }, u.prototype.getSelectionManager = function() {
              return this.selectionManager;
            }, u.proxyMethod("getSelectionManager().setLocationRange"), u.proxyMethod("getSelectionManager().getLocationRange"), u.prototype.attachmentManagerDidRequestRemovalOfAttachment = function(t3) {
              return this.removeAttachment(t3);
            }, u.prototype.compositionControllerWillSyncDocumentView = function() {
              return this.inputController.editorWillSyncDocumentView(), this.selectionManager.lock(), this.selectionManager.clearSelection();
            }, u.prototype.compositionControllerDidSyncDocumentView = function() {
              return this.inputController.editorDidSyncDocumentView(), this.selectionManager.unlock(), this.updateCurrentActions(), this.notifyEditorElement("sync");
            }, u.prototype.compositionControllerDidRender = function() {
              return this.requestedLocationRange != null && (this.compositionRevisionWhenLocationRangeRequested === this.composition.revision && this.selectionManager.setLocationRange(this.requestedLocationRange), this.requestedLocationRange = null, this.compositionRevisionWhenLocationRangeRequested = null), this.renderedCompositionRevision !== this.composition.revision && (this.runEditorFilters(), this.composition.updateCurrentAttributes(), this.notifyEditorElement("render")), this.renderedCompositionRevision = this.composition.revision;
            }, u.prototype.compositionControllerDidFocus = function() {
              return this.isFocusedInvisibly() && this.setLocationRange({ index: 0, offset: 0 }), this.toolbarController.hideDialog(), this.notifyEditorElement("focus");
            }, u.prototype.compositionControllerDidBlur = function() {
              return this.notifyEditorElement("blur");
            }, u.prototype.compositionControllerDidSelectAttachment = function(t3, e2) {
              return this.toolbarController.hideDialog(), this.composition.editAttachment(t3, e2);
            }, u.prototype.compositionControllerDidRequestDeselectingAttachment = function(t3) {
              var e2, n2;
              return e2 = (n2 = this.attachmentLocationRange) != null ? n2 : this.composition.document.getLocationRangeOfAttachment(t3), this.selectionManager.setLocationRange(e2[1]);
            }, u.prototype.compositionControllerWillUpdateAttachment = function(t3) {
              return this.editor.recordUndoEntry("Edit Attachment", { context: t3.id, consolidatable: true });
            }, u.prototype.compositionControllerDidRequestRemovalOfAttachment = function(t3) {
              return this.removeAttachment(t3);
            }, u.prototype.inputControllerWillHandleInput = function() {
              return this.handlingInput = true, this.requestedRender = false;
            }, u.prototype.inputControllerDidRequestRender = function() {
              return this.requestedRender = true;
            }, u.prototype.inputControllerDidHandleInput = function() {
              return this.handlingInput = false, this.requestedRender ? (this.requestedRender = false, this.render()) : void 0;
            }, u.prototype.inputControllerDidAllowUnhandledInput = function() {
              return this.notifyEditorElement("change");
            }, u.prototype.inputControllerDidRequestReparse = function() {
              return this.reparse();
            }, u.prototype.inputControllerWillPerformTyping = function() {
              return this.recordTypingUndoEntry();
            }, u.prototype.inputControllerWillPerformFormatting = function(t3) {
              return this.recordFormattingUndoEntry(t3);
            }, u.prototype.inputControllerWillCutText = function() {
              return this.editor.recordUndoEntry("Cut");
            }, u.prototype.inputControllerWillPaste = function(t3) {
              return this.editor.recordUndoEntry("Paste"), this.pasting = true, this.notifyEditorElement("before-paste", { paste: t3 });
            }, u.prototype.inputControllerDidPaste = function(t3) {
              return t3.range = this.pastedRange, this.pastedRange = null, this.pasting = null, this.notifyEditorElement("paste", { paste: t3 });
            }, u.prototype.inputControllerWillMoveText = function() {
              return this.editor.recordUndoEntry("Move");
            }, u.prototype.inputControllerWillAttachFiles = function() {
              return this.editor.recordUndoEntry("Drop Files");
            }, u.prototype.inputControllerWillPerformUndo = function() {
              return this.editor.undo();
            }, u.prototype.inputControllerWillPerformRedo = function() {
              return this.editor.redo();
            }, u.prototype.inputControllerDidReceiveKeyboardCommand = function(t3) {
              return this.toolbarController.applyKeyboardCommand(t3);
            }, u.prototype.inputControllerDidStartDrag = function() {
              return this.locationRangeBeforeDrag = this.selectionManager.getLocationRange();
            }, u.prototype.inputControllerDidReceiveDragOverPoint = function(t3) {
              return this.selectionManager.setLocationRangeFromPointRange(t3);
            }, u.prototype.inputControllerDidCancelDrag = function() {
              return this.selectionManager.setLocationRange(this.locationRangeBeforeDrag), this.locationRangeBeforeDrag = null;
            }, u.prototype.locationRangeDidChange = function(t3) {
              return this.composition.updateCurrentAttributes(), this.updateCurrentActions(), this.attachmentLocationRange && !o(this.attachmentLocationRange, t3) && this.composition.stopEditingAttachment(), this.notifyEditorElement("selection-change");
            }, u.prototype.toolbarDidClickButton = function() {
              return this.getLocationRange() ? void 0 : this.setLocationRange({ index: 0, offset: 0 });
            }, u.prototype.toolbarDidInvokeAction = function(t3) {
              return this.invokeAction(t3);
            }, u.prototype.toolbarDidToggleAttribute = function(t3) {
              return this.recordFormattingUndoEntry(t3), this.composition.toggleCurrentAttribute(t3), this.render(), this.selectionFrozen ? void 0 : this.editorElement.focus();
            }, u.prototype.toolbarDidUpdateAttribute = function(t3, e2) {
              return this.recordFormattingUndoEntry(t3), this.composition.setCurrentAttribute(t3, e2), this.render(), this.selectionFrozen ? void 0 : this.editorElement.focus();
            }, u.prototype.toolbarDidRemoveAttribute = function(t3) {
              return this.recordFormattingUndoEntry(t3), this.composition.removeCurrentAttribute(t3), this.render(), this.selectionFrozen ? void 0 : this.editorElement.focus();
            }, u.prototype.toolbarWillShowDialog = function() {
              return this.composition.expandSelectionForEditing(), this.freezeSelection();
            }, u.prototype.toolbarDidShowDialog = function(t3) {
              return this.notifyEditorElement("toolbar-dialog-show", { dialogName: t3 });
            }, u.prototype.toolbarDidHideDialog = function(t3) {
              return this.thawSelection(), this.editorElement.focus(), this.notifyEditorElement("toolbar-dialog-hide", { dialogName: t3 });
            }, u.prototype.freezeSelection = function() {
              return this.selectionFrozen ? void 0 : (this.selectionManager.lock(), this.composition.freezeSelection(), this.selectionFrozen = true, this.render());
            }, u.prototype.thawSelection = function() {
              return this.selectionFrozen ? (this.composition.thawSelection(), this.selectionManager.unlock(), this.selectionFrozen = false, this.render()) : void 0;
            }, u.prototype.actions = { undo: { test: function() {
              return this.editor.canUndo();
            }, perform: function() {
              return this.editor.undo();
            } }, redo: { test: function() {
              return this.editor.canRedo();
            }, perform: function() {
              return this.editor.redo();
            } }, link: { test: function() {
              return this.editor.canActivateAttribute("href");
            } }, increaseNestingLevel: { test: function() {
              return this.editor.canIncreaseNestingLevel();
            }, perform: function() {
              return this.editor.increaseNestingLevel() && this.render();
            } }, decreaseNestingLevel: { test: function() {
              return this.editor.canDecreaseNestingLevel();
            }, perform: function() {
              return this.editor.decreaseNestingLevel() && this.render();
            } }, attachFiles: { test: function() {
              return true;
            }, perform: function() {
              return e.config.input.pickFiles(this.editor.insertFiles);
            } } }, u.prototype.canInvokeAction = function(t3) {
              var e2, n2;
              return this.actionIsExternal(t3) ? true : !!((e2 = this.actions[t3]) != null && (n2 = e2.test) != null ? n2.call(this) : void 0);
            }, u.prototype.invokeAction = function(t3) {
              var e2, n2;
              return this.actionIsExternal(t3) ? this.notifyEditorElement("action-invoke", { actionName: t3 }) : (e2 = this.actions[t3]) != null && (n2 = e2.perform) != null ? n2.call(this) : void 0;
            }, u.prototype.actionIsExternal = function(t3) {
              return /^x-./.test(t3);
            }, u.prototype.getCurrentActions = function() {
              var t3, e2;
              e2 = {};
              for (t3 in this.actions)
                e2[t3] = this.canInvokeAction(t3);
              return e2;
            }, u.prototype.updateCurrentActions = function() {
              var t3;
              return t3 = this.getCurrentActions(), n(t3, this.currentActions) ? void 0 : (this.currentActions = t3, this.toolbarController.updateActions(this.currentActions), this.notifyEditorElement("actions-change", { actions: this.currentActions }));
            }, u.prototype.runEditorFilters = function() {
              var t3, e2, n2, i2, o2, r2, s3, a2;
              for (a2 = this.composition.getSnapshot(), o2 = this.editor.filters, n2 = 0, i2 = o2.length; i2 > n2; n2++)
                e2 = o2[n2], t3 = a2.document, s3 = a2.selectedRange, a2 = (r2 = e2.call(this.editor, a2)) != null ? r2 : {}, a2.document == null && (a2.document = t3), a2.selectedRange == null && (a2.selectedRange = s3);
              return c(a2, this.composition.getSnapshot()) ? void 0 : this.composition.loadSnapshot(a2);
            }, c = function(t3, e2) {
              return o(t3.selectedRange, e2.selectedRange) && t3.document.isEqualTo(e2.document);
            }, u.prototype.updateInputElement = function() {
              var t3, n2;
              return t3 = this.compositionController.getSerializableElement(), n2 = e.serializeToContentType(t3, "text/html"), this.editorElement.setInputElementValue(n2);
            }, u.prototype.notifyEditorElement = function(t3, e2) {
              switch (t3) {
                case "document-change":
                  this.documentChangedSinceLastRender = true;
                  break;
                case "render":
                  this.documentChangedSinceLastRender && (this.documentChangedSinceLastRender = false, this.notifyEditorElement("change"));
                  break;
                case "change":
                case "attachment-add":
                case "attachment-edit":
                case "attachment-remove":
                  this.updateInputElement();
              }
              return this.editorElement.notify(t3, e2);
            }, u.prototype.removeAttachment = function(t3) {
              return this.editor.recordUndoEntry("Delete Attachment"), this.composition.removeAttachment(t3), this.render();
            }, u.prototype.recordFormattingUndoEntry = function(e2) {
              var n2, o2;
              return n2 = t2(e2), o2 = this.selectionManager.getLocationRange(), n2 || !i(o2) ? this.editor.recordUndoEntry("Formatting", { context: this.getUndoContext(), consolidatable: true }) : void 0;
            }, u.prototype.recordTypingUndoEntry = function() {
              return this.editor.recordUndoEntry("Typing", { context: this.getUndoContext(this.currentAttributes), consolidatable: true });
            }, u.prototype.getUndoContext = function() {
              var t3;
              return t3 = 1 <= arguments.length ? a.call(arguments, 0) : [], [this.getLocationContext(), this.getTimeContext()].concat(a.call(t3));
            }, u.prototype.getLocationContext = function() {
              var t3;
              return t3 = this.selectionManager.getLocationRange(), i(t3) ? t3[0].index : t3;
            }, u.prototype.getTimeContext = function() {
              return e.config.undoInterval > 0 ? Math.floor((/* @__PURE__ */ new Date()).getTime() / e.config.undoInterval) : 0;
            }, u.prototype.isFocused = function() {
              var t3;
              return this.editorElement === ((t3 = this.editorElement.ownerDocument) != null ? t3.activeElement : void 0);
            }, u.prototype.isFocusedInvisibly = function() {
              return this.isFocused() && !this.getLocationRange();
            }, u;
          }(e.Controller);
        }.call(this), function() {
          var t2, n, i, o, r, s, a, u = [].indexOf || function(t3) {
            for (var e2 = 0, n2 = this.length; n2 > e2; e2++)
              if (e2 in this && this[e2] === t3)
                return e2;
            return -1;
          };
          n = e.browser, s = e.makeElement, a = e.triggerEvent, o = e.handleEvent, r = e.handleEventOnce, i = e.findClosestElementFromNode, t2 = e.AttachmentView.attachmentSelector, e.registerElement("trix-editor", function() {
            var c, l, h, p, d, f, g, m, v;
            return g = 0, l = function(t3) {
              return !document.querySelector(":focus") && t3.hasAttribute("autofocus") && document.querySelector("[autofocus]") === t3 ? t3.focus() : void 0;
            }, m = function(t3) {
              return t3.hasAttribute("contenteditable") ? void 0 : (t3.setAttribute("contenteditable", ""), r("focus", { onElement: t3, withCallback: function() {
                return h(t3);
              } }));
            }, h = function(t3) {
              return d(t3), v(t3);
            }, d = function(t3) {
              return (typeof document.queryCommandSupported == "function" ? document.queryCommandSupported("enableObjectResizing") : void 0) ? (document.execCommand("enableObjectResizing", false, false), o("mscontrolselect", { onElement: t3, preventDefault: true })) : void 0;
            }, v = function() {
              var t3;
              return (typeof document.queryCommandSupported == "function" ? document.queryCommandSupported("DefaultParagraphSeparator") : void 0) && (t3 = e.config.blockAttributes["default"].tagName, t3 === "div" || t3 === "p") ? document.execCommand("DefaultParagraphSeparator", false, t3) : void 0;
            }, c = function(t3) {
              return t3.hasAttribute("role") ? void 0 : t3.setAttribute("role", "textbox");
            }, f = function(t3) {
              var e2;
              if (!t3.hasAttribute("aria-label") && !t3.hasAttribute("aria-labelledby"))
                return (e2 = function() {
                  var e3, n2, i2;
                  return i2 = function() {
                    var n3, i3, o2, r2;
                    for (o2 = t3.labels, r2 = [], n3 = 0, i3 = o2.length; i3 > n3; n3++)
                      e3 = o2[n3], e3.contains(t3) || r2.push(e3.textContent);
                    return r2;
                  }(), (n2 = i2.join(" ")) ? t3.setAttribute("aria-label", n2) : t3.removeAttribute("aria-label");
                })(), o("focus", { onElement: t3, withCallback: e2 });
            }, p = function() {
              return n.forcesObjectResizing ? { display: "inline", width: "auto" } : { display: "inline-block", width: "1px" };
            }(), { defaultCSS: "%t {\n  display: block;\n}\n\n%t:empty:not(:focus)::before {\n  content: attr(placeholder);\n  color: graytext;\n  cursor: text;\n  pointer-events: none;\n}\n\n%t a[contenteditable=false] {\n  cursor: text;\n}\n\n%t img {\n  max-width: 100%;\n  height: auto;\n}\n\n%t " + t2 + " figcaption textarea {\n  resize: none;\n}\n\n%t " + t2 + " figcaption textarea.trix-autoresize-clone {\n  position: absolute;\n  left: -9999px;\n  max-height: 0px;\n}\n\n%t " + t2 + " figcaption[data-trix-placeholder]:empty::before {\n  content: attr(data-trix-placeholder);\n  color: graytext;\n}\n\n%t [data-trix-cursor-target] {\n  display: " + p.display + " !important;\n  width: " + p.width + " !important;\n  padding: 0 !important;\n  margin: 0 !important;\n  border: none !important;\n}\n\n%t [data-trix-cursor-target=left] {\n  vertical-align: top !important;\n  margin-left: -1px !important;\n}\n\n%t [data-trix-cursor-target=right] {\n  vertical-align: bottom !important;\n  margin-right: -1px !important;\n}", trixId: { get: function() {
              return this.hasAttribute("trix-id") ? this.getAttribute("trix-id") : (this.setAttribute("trix-id", ++g), this.trixId);
            } }, labels: { get: function() {
              var t3, e2, n2;
              return e2 = [], this.id && this.ownerDocument && e2.push.apply(e2, this.ownerDocument.querySelectorAll("label[for='" + this.id + "']")), (t3 = i(this, { matchingSelector: "label" })) && ((n2 = t3.control) === this || n2 === null) && e2.push(t3), e2;
            } }, toolbarElement: { get: function() {
              var t3, e2, n2;
              return this.hasAttribute("toolbar") ? (e2 = this.ownerDocument) != null ? e2.getElementById(this.getAttribute("toolbar")) : void 0 : this.parentNode ? (n2 = "trix-toolbar-" + this.trixId, this.setAttribute("toolbar", n2), t3 = s("trix-toolbar", { id: n2 }), this.parentNode.insertBefore(t3, this), t3) : void 0;
            } }, inputElement: { get: function() {
              var t3, e2, n2;
              return this.hasAttribute("input") ? (n2 = this.ownerDocument) != null ? n2.getElementById(this.getAttribute("input")) : void 0 : this.parentNode ? (e2 = "trix-input-" + this.trixId, this.setAttribute("input", e2), t3 = s("input", { type: "hidden", id: e2 }), this.parentNode.insertBefore(t3, this.nextElementSibling), t3) : void 0;
            } }, editor: { get: function() {
              var t3;
              return (t3 = this.editorController) != null ? t3.editor : void 0;
            } }, name: { get: function() {
              var t3;
              return (t3 = this.inputElement) != null ? t3.name : void 0;
            } }, value: { get: function() {
              var t3;
              return (t3 = this.inputElement) != null ? t3.value : void 0;
            }, set: function(t3) {
              var e2;
              return this.defaultValue = t3, (e2 = this.editor) != null ? e2.loadHTML(this.defaultValue) : void 0;
            } }, notify: function(t3, e2) {
              return this.editorController ? a("trix-" + t3, { onElement: this, attributes: e2 }) : void 0;
            }, setInputElementValue: function(t3) {
              var e2;
              return (e2 = this.inputElement) != null ? e2.value = t3 : void 0;
            }, initialize: function() {
              return this.hasAttribute("data-trix-internal") ? void 0 : (m(this), c(this), f(this));
            }, connect: function() {
              return this.hasAttribute("data-trix-internal") ? void 0 : (this.editorController || (a("trix-before-initialize", { onElement: this }), this.editorController = new e.EditorController({ editorElement: this, html: this.defaultValue = this.value }), requestAnimationFrame(function(t3) {
                return function() {
                  return a("trix-initialize", { onElement: t3 });
                };
              }(this))), this.editorController.registerSelectionManager(), this.registerResetListener(), this.registerClickListener(), l(this));
            }, disconnect: function() {
              var t3;
              return (t3 = this.editorController) != null && t3.unregisterSelectionManager(), this.unregisterResetListener(), this.unregisterClickListener();
            }, registerResetListener: function() {
              return this.resetListener = this.resetBubbled.bind(this), window.addEventListener("reset", this.resetListener, false);
            }, unregisterResetListener: function() {
              return window.removeEventListener("reset", this.resetListener, false);
            }, registerClickListener: function() {
              return this.clickListener = this.clickBubbled.bind(this), window.addEventListener("click", this.clickListener, false);
            }, unregisterClickListener: function() {
              return window.removeEventListener("click", this.clickListener, false);
            }, resetBubbled: function(t3) {
              var e2;
              if (!t3.defaultPrevented && t3.target === ((e2 = this.inputElement) != null ? e2.form : void 0))
                return this.reset();
            }, clickBubbled: function(t3) {
              var e2;
              if (!(t3.defaultPrevented || this.contains(t3.target) || !(e2 = i(t3.target, { matchingSelector: "label" })) || u.call(this.labels, e2) < 0))
                return this.focus();
            }, reset: function() {
              return this.value = this.defaultValue;
            } };
          }());
        }.call(this), function() {
        }.call(this);
      }).call(this), module3.exports ? module3.exports = e : false;
    }.call(commonjsGlobal);
  });

  // libraries/trix.js
  Trix.config.blockAttributes.heading2 = {
    tagName: "h2",
    terminal: true,
    breakOnReturn: true,
    group: false
  };
  Trix.config.blockAttributes.heading3 = {
    tagName: "h3",
    terminal: true,
    breakOnReturn: true,
    group: false
  };
  Trix.config.blockAttributes.heading4 = {
    tagName: "h4",
    terminal: true,
    breakOnReturn: true,
    group: false
  };

  // ../../../../node_modules/@hotwired/stimulus/dist/stimulus.js
  var EventListener = class {
    constructor(eventTarget, eventName, eventOptions) {
      this.eventTarget = eventTarget;
      this.eventName = eventName;
      this.eventOptions = eventOptions;
      this.unorderedBindings = /* @__PURE__ */ new Set();
    }
    connect() {
      this.eventTarget.addEventListener(this.eventName, this, this.eventOptions);
    }
    disconnect() {
      this.eventTarget.removeEventListener(this.eventName, this, this.eventOptions);
    }
    bindingConnected(binding) {
      this.unorderedBindings.add(binding);
    }
    bindingDisconnected(binding) {
      this.unorderedBindings.delete(binding);
    }
    handleEvent(event) {
      const extendedEvent = extendEvent(event);
      for (const binding of this.bindings) {
        if (extendedEvent.immediatePropagationStopped) {
          break;
        } else {
          binding.handleEvent(extendedEvent);
        }
      }
    }
    hasBindings() {
      return this.unorderedBindings.size > 0;
    }
    get bindings() {
      return Array.from(this.unorderedBindings).sort((left, right) => {
        const leftIndex = left.index, rightIndex = right.index;
        return leftIndex < rightIndex ? -1 : leftIndex > rightIndex ? 1 : 0;
      });
    }
  };
  function extendEvent(event) {
    if ("immediatePropagationStopped" in event) {
      return event;
    } else {
      const { stopImmediatePropagation } = event;
      return Object.assign(event, {
        immediatePropagationStopped: false,
        stopImmediatePropagation() {
          this.immediatePropagationStopped = true;
          stopImmediatePropagation.call(this);
        }
      });
    }
  }
  var Dispatcher = class {
    constructor(application2) {
      this.application = application2;
      this.eventListenerMaps = /* @__PURE__ */ new Map();
      this.started = false;
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.eventListeners.forEach((eventListener) => eventListener.connect());
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        this.eventListeners.forEach((eventListener) => eventListener.disconnect());
      }
    }
    get eventListeners() {
      return Array.from(this.eventListenerMaps.values()).reduce((listeners, map) => listeners.concat(Array.from(map.values())), []);
    }
    bindingConnected(binding) {
      this.fetchEventListenerForBinding(binding).bindingConnected(binding);
    }
    bindingDisconnected(binding, clearEventListeners = false) {
      this.fetchEventListenerForBinding(binding).bindingDisconnected(binding);
      if (clearEventListeners)
        this.clearEventListenersForBinding(binding);
    }
    handleError(error2, message, detail = {}) {
      this.application.handleError(error2, `Error ${message}`, detail);
    }
    clearEventListenersForBinding(binding) {
      const eventListener = this.fetchEventListenerForBinding(binding);
      if (!eventListener.hasBindings()) {
        eventListener.disconnect();
        this.removeMappedEventListenerFor(binding);
      }
    }
    removeMappedEventListenerFor(binding) {
      const { eventTarget, eventName, eventOptions } = binding;
      const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
      const cacheKey = this.cacheKey(eventName, eventOptions);
      eventListenerMap.delete(cacheKey);
      if (eventListenerMap.size == 0)
        this.eventListenerMaps.delete(eventTarget);
    }
    fetchEventListenerForBinding(binding) {
      const { eventTarget, eventName, eventOptions } = binding;
      return this.fetchEventListener(eventTarget, eventName, eventOptions);
    }
    fetchEventListener(eventTarget, eventName, eventOptions) {
      const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
      const cacheKey = this.cacheKey(eventName, eventOptions);
      let eventListener = eventListenerMap.get(cacheKey);
      if (!eventListener) {
        eventListener = this.createEventListener(eventTarget, eventName, eventOptions);
        eventListenerMap.set(cacheKey, eventListener);
      }
      return eventListener;
    }
    createEventListener(eventTarget, eventName, eventOptions) {
      const eventListener = new EventListener(eventTarget, eventName, eventOptions);
      if (this.started) {
        eventListener.connect();
      }
      return eventListener;
    }
    fetchEventListenerMapForEventTarget(eventTarget) {
      let eventListenerMap = this.eventListenerMaps.get(eventTarget);
      if (!eventListenerMap) {
        eventListenerMap = /* @__PURE__ */ new Map();
        this.eventListenerMaps.set(eventTarget, eventListenerMap);
      }
      return eventListenerMap;
    }
    cacheKey(eventName, eventOptions) {
      const parts = [eventName];
      Object.keys(eventOptions).sort().forEach((key) => {
        parts.push(`${eventOptions[key] ? "" : "!"}${key}`);
      });
      return parts.join(":");
    }
  };
  var defaultActionDescriptorFilters = {
    stop({ event, value }) {
      if (value)
        event.stopPropagation();
      return true;
    },
    prevent({ event, value }) {
      if (value)
        event.preventDefault();
      return true;
    },
    self({ event, value, element }) {
      if (value) {
        return element === event.target;
      } else {
        return true;
      }
    }
  };
  var descriptorPattern = /^(?:(.+?)(?:\.(.+?))?(?:@(window|document))?->)?(.+?)(?:#([^:]+?))(?::(.+))?$/;
  function parseActionDescriptorString(descriptorString) {
    const source = descriptorString.trim();
    const matches2 = source.match(descriptorPattern) || [];
    let eventName = matches2[1];
    let keyFilter = matches2[2];
    if (keyFilter && !["keydown", "keyup", "keypress"].includes(eventName)) {
      eventName += `.${keyFilter}`;
      keyFilter = "";
    }
    return {
      eventTarget: parseEventTarget(matches2[3]),
      eventName,
      eventOptions: matches2[6] ? parseEventOptions(matches2[6]) : {},
      identifier: matches2[4],
      methodName: matches2[5],
      keyFilter
    };
  }
  function parseEventTarget(eventTargetName) {
    if (eventTargetName == "window") {
      return window;
    } else if (eventTargetName == "document") {
      return document;
    }
  }
  function parseEventOptions(eventOptions) {
    return eventOptions.split(":").reduce((options, token) => Object.assign(options, { [token.replace(/^!/, "")]: !/^!/.test(token) }), {});
  }
  function stringifyEventTarget(eventTarget) {
    if (eventTarget == window) {
      return "window";
    } else if (eventTarget == document) {
      return "document";
    }
  }
  function camelize(value) {
    return value.replace(/(?:[_-])([a-z0-9])/g, (_, char) => char.toUpperCase());
  }
  function namespaceCamelize(value) {
    return camelize(value.replace(/--/g, "-").replace(/__/g, "_"));
  }
  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  function dasherize(value) {
    return value.replace(/([A-Z])/g, (_, char) => `-${char.toLowerCase()}`);
  }
  function tokenize(value) {
    return value.match(/[^\s]+/g) || [];
  }
  var Action = class {
    constructor(element, index2, descriptor, schema) {
      this.element = element;
      this.index = index2;
      this.eventTarget = descriptor.eventTarget || element;
      this.eventName = descriptor.eventName || getDefaultEventNameForElement(element) || error("missing event name");
      this.eventOptions = descriptor.eventOptions || {};
      this.identifier = descriptor.identifier || error("missing identifier");
      this.methodName = descriptor.methodName || error("missing method name");
      this.keyFilter = descriptor.keyFilter || "";
      this.schema = schema;
    }
    static forToken(token, schema) {
      return new this(token.element, token.index, parseActionDescriptorString(token.content), schema);
    }
    toString() {
      const eventFilter = this.keyFilter ? `.${this.keyFilter}` : "";
      const eventTarget = this.eventTargetName ? `@${this.eventTargetName}` : "";
      return `${this.eventName}${eventFilter}${eventTarget}->${this.identifier}#${this.methodName}`;
    }
    isFilterTarget(event) {
      if (!this.keyFilter) {
        return false;
      }
      const filteres = this.keyFilter.split("+");
      const modifiers = ["meta", "ctrl", "alt", "shift"];
      const [meta, ctrl, alt, shift] = modifiers.map((modifier) => filteres.includes(modifier));
      if (event.metaKey !== meta || event.ctrlKey !== ctrl || event.altKey !== alt || event.shiftKey !== shift) {
        return true;
      }
      const standardFilter = filteres.filter((key) => !modifiers.includes(key))[0];
      if (!standardFilter) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(this.keyMappings, standardFilter)) {
        error(`contains unknown key filter: ${this.keyFilter}`);
      }
      return this.keyMappings[standardFilter].toLowerCase() !== event.key.toLowerCase();
    }
    get params() {
      const params = {};
      const pattern = new RegExp(`^data-${this.identifier}-(.+)-param$`, "i");
      for (const { name, value } of Array.from(this.element.attributes)) {
        const match = name.match(pattern);
        const key = match && match[1];
        if (key) {
          params[camelize(key)] = typecast(value);
        }
      }
      return params;
    }
    get eventTargetName() {
      return stringifyEventTarget(this.eventTarget);
    }
    get keyMappings() {
      return this.schema.keyMappings;
    }
  };
  var defaultEventNames = {
    a: () => "click",
    button: () => "click",
    form: () => "submit",
    details: () => "toggle",
    input: (e) => e.getAttribute("type") == "submit" ? "click" : "input",
    select: () => "change",
    textarea: () => "input"
  };
  function getDefaultEventNameForElement(element) {
    const tagName = element.tagName.toLowerCase();
    if (tagName in defaultEventNames) {
      return defaultEventNames[tagName](element);
    }
  }
  function error(message) {
    throw new Error(message);
  }
  function typecast(value) {
    try {
      return JSON.parse(value);
    } catch (o_O) {
      return value;
    }
  }
  var Binding = class {
    constructor(context, action) {
      this.context = context;
      this.action = action;
    }
    get index() {
      return this.action.index;
    }
    get eventTarget() {
      return this.action.eventTarget;
    }
    get eventOptions() {
      return this.action.eventOptions;
    }
    get identifier() {
      return this.context.identifier;
    }
    handleEvent(event) {
      if (this.willBeInvokedByEvent(event) && this.applyEventModifiers(event)) {
        this.invokeWithEvent(event);
      }
    }
    get eventName() {
      return this.action.eventName;
    }
    get method() {
      const method = this.controller[this.methodName];
      if (typeof method == "function") {
        return method;
      }
      throw new Error(`Action "${this.action}" references undefined method "${this.methodName}"`);
    }
    applyEventModifiers(event) {
      const { element } = this.action;
      const { actionDescriptorFilters } = this.context.application;
      let passes = true;
      for (const [name, value] of Object.entries(this.eventOptions)) {
        if (name in actionDescriptorFilters) {
          const filter2 = actionDescriptorFilters[name];
          passes = passes && filter2({ name, value, event, element });
        } else {
          continue;
        }
      }
      return passes;
    }
    invokeWithEvent(event) {
      const { target, currentTarget } = event;
      try {
        const { params } = this.action;
        const actionEvent = Object.assign(event, { params });
        this.method.call(this.controller, actionEvent);
        this.context.logDebugActivity(this.methodName, { event, target, currentTarget, action: this.methodName });
      } catch (error2) {
        const { identifier, controller, element, index: index2 } = this;
        const detail = { identifier, controller, element, index: index2, event };
        this.context.handleError(error2, `invoking action "${this.action}"`, detail);
      }
    }
    willBeInvokedByEvent(event) {
      const eventTarget = event.target;
      if (event instanceof KeyboardEvent && this.action.isFilterTarget(event)) {
        return false;
      }
      if (this.element === eventTarget) {
        return true;
      } else if (eventTarget instanceof Element && this.element.contains(eventTarget)) {
        return this.scope.containsElement(eventTarget);
      } else {
        return this.scope.containsElement(this.action.element);
      }
    }
    get controller() {
      return this.context.controller;
    }
    get methodName() {
      return this.action.methodName;
    }
    get element() {
      return this.scope.element;
    }
    get scope() {
      return this.context.scope;
    }
  };
  var ElementObserver = class {
    constructor(element, delegate) {
      this.mutationObserverInit = { attributes: true, childList: true, subtree: true };
      this.element = element;
      this.started = false;
      this.delegate = delegate;
      this.elements = /* @__PURE__ */ new Set();
      this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.mutationObserver.observe(this.element, this.mutationObserverInit);
        this.refresh();
      }
    }
    pause(callback) {
      if (this.started) {
        this.mutationObserver.disconnect();
        this.started = false;
      }
      callback();
      if (!this.started) {
        this.mutationObserver.observe(this.element, this.mutationObserverInit);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        this.mutationObserver.takeRecords();
        this.mutationObserver.disconnect();
        this.started = false;
      }
    }
    refresh() {
      if (this.started) {
        const matches2 = new Set(this.matchElementsInTree());
        for (const element of Array.from(this.elements)) {
          if (!matches2.has(element)) {
            this.removeElement(element);
          }
        }
        for (const element of Array.from(matches2)) {
          this.addElement(element);
        }
      }
    }
    processMutations(mutations) {
      if (this.started) {
        for (const mutation of mutations) {
          this.processMutation(mutation);
        }
      }
    }
    processMutation(mutation) {
      if (mutation.type == "attributes") {
        this.processAttributeChange(mutation.target, mutation.attributeName);
      } else if (mutation.type == "childList") {
        this.processRemovedNodes(mutation.removedNodes);
        this.processAddedNodes(mutation.addedNodes);
      }
    }
    processAttributeChange(node, attributeName) {
      const element = node;
      if (this.elements.has(element)) {
        if (this.delegate.elementAttributeChanged && this.matchElement(element)) {
          this.delegate.elementAttributeChanged(element, attributeName);
        } else {
          this.removeElement(element);
        }
      } else if (this.matchElement(element)) {
        this.addElement(element);
      }
    }
    processRemovedNodes(nodes) {
      for (const node of Array.from(nodes)) {
        const element = this.elementFromNode(node);
        if (element) {
          this.processTree(element, this.removeElement);
        }
      }
    }
    processAddedNodes(nodes) {
      for (const node of Array.from(nodes)) {
        const element = this.elementFromNode(node);
        if (element && this.elementIsActive(element)) {
          this.processTree(element, this.addElement);
        }
      }
    }
    matchElement(element) {
      return this.delegate.matchElement(element);
    }
    matchElementsInTree(tree = this.element) {
      return this.delegate.matchElementsInTree(tree);
    }
    processTree(tree, processor) {
      for (const element of this.matchElementsInTree(tree)) {
        processor.call(this, element);
      }
    }
    elementFromNode(node) {
      if (node.nodeType == Node.ELEMENT_NODE) {
        return node;
      }
    }
    elementIsActive(element) {
      if (element.isConnected != this.element.isConnected) {
        return false;
      } else {
        return this.element.contains(element);
      }
    }
    addElement(element) {
      if (!this.elements.has(element)) {
        if (this.elementIsActive(element)) {
          this.elements.add(element);
          if (this.delegate.elementMatched) {
            this.delegate.elementMatched(element);
          }
        }
      }
    }
    removeElement(element) {
      if (this.elements.has(element)) {
        this.elements.delete(element);
        if (this.delegate.elementUnmatched) {
          this.delegate.elementUnmatched(element);
        }
      }
    }
  };
  var AttributeObserver = class {
    constructor(element, attributeName, delegate) {
      this.attributeName = attributeName;
      this.delegate = delegate;
      this.elementObserver = new ElementObserver(element, this);
    }
    get element() {
      return this.elementObserver.element;
    }
    get selector() {
      return `[${this.attributeName}]`;
    }
    start() {
      this.elementObserver.start();
    }
    pause(callback) {
      this.elementObserver.pause(callback);
    }
    stop() {
      this.elementObserver.stop();
    }
    refresh() {
      this.elementObserver.refresh();
    }
    get started() {
      return this.elementObserver.started;
    }
    matchElement(element) {
      return element.hasAttribute(this.attributeName);
    }
    matchElementsInTree(tree) {
      const match = this.matchElement(tree) ? [tree] : [];
      const matches2 = Array.from(tree.querySelectorAll(this.selector));
      return match.concat(matches2);
    }
    elementMatched(element) {
      if (this.delegate.elementMatchedAttribute) {
        this.delegate.elementMatchedAttribute(element, this.attributeName);
      }
    }
    elementUnmatched(element) {
      if (this.delegate.elementUnmatchedAttribute) {
        this.delegate.elementUnmatchedAttribute(element, this.attributeName);
      }
    }
    elementAttributeChanged(element, attributeName) {
      if (this.delegate.elementAttributeValueChanged && this.attributeName == attributeName) {
        this.delegate.elementAttributeValueChanged(element, attributeName);
      }
    }
  };
  function add(map, key, value) {
    fetch2(map, key).add(value);
  }
  function del(map, key, value) {
    fetch2(map, key).delete(value);
    prune(map, key);
  }
  function fetch2(map, key) {
    let values = map.get(key);
    if (!values) {
      values = /* @__PURE__ */ new Set();
      map.set(key, values);
    }
    return values;
  }
  function prune(map, key) {
    const values = map.get(key);
    if (values != null && values.size == 0) {
      map.delete(key);
    }
  }
  var Multimap = class {
    constructor() {
      this.valuesByKey = /* @__PURE__ */ new Map();
    }
    get keys() {
      return Array.from(this.valuesByKey.keys());
    }
    get values() {
      const sets = Array.from(this.valuesByKey.values());
      return sets.reduce((values, set) => values.concat(Array.from(set)), []);
    }
    get size() {
      const sets = Array.from(this.valuesByKey.values());
      return sets.reduce((size, set) => size + set.size, 0);
    }
    add(key, value) {
      add(this.valuesByKey, key, value);
    }
    delete(key, value) {
      del(this.valuesByKey, key, value);
    }
    has(key, value) {
      const values = this.valuesByKey.get(key);
      return values != null && values.has(value);
    }
    hasKey(key) {
      return this.valuesByKey.has(key);
    }
    hasValue(value) {
      const sets = Array.from(this.valuesByKey.values());
      return sets.some((set) => set.has(value));
    }
    getValuesForKey(key) {
      const values = this.valuesByKey.get(key);
      return values ? Array.from(values) : [];
    }
    getKeysForValue(value) {
      return Array.from(this.valuesByKey).filter(([_key, values]) => values.has(value)).map(([key, _values]) => key);
    }
  };
  var SelectorObserver = class {
    constructor(element, selector, delegate, details = {}) {
      this.selector = selector;
      this.details = details;
      this.elementObserver = new ElementObserver(element, this);
      this.delegate = delegate;
      this.matchesByElement = new Multimap();
    }
    get started() {
      return this.elementObserver.started;
    }
    start() {
      this.elementObserver.start();
    }
    pause(callback) {
      this.elementObserver.pause(callback);
    }
    stop() {
      this.elementObserver.stop();
    }
    refresh() {
      this.elementObserver.refresh();
    }
    get element() {
      return this.elementObserver.element;
    }
    matchElement(element) {
      const matches2 = element.matches(this.selector);
      if (this.delegate.selectorMatchElement) {
        return matches2 && this.delegate.selectorMatchElement(element, this.details);
      }
      return matches2;
    }
    matchElementsInTree(tree) {
      const match = this.matchElement(tree) ? [tree] : [];
      const matches2 = Array.from(tree.querySelectorAll(this.selector)).filter((match2) => this.matchElement(match2));
      return match.concat(matches2);
    }
    elementMatched(element) {
      this.selectorMatched(element);
    }
    elementUnmatched(element) {
      this.selectorUnmatched(element);
    }
    elementAttributeChanged(element, _attributeName) {
      const matches2 = this.matchElement(element);
      const matchedBefore = this.matchesByElement.has(this.selector, element);
      if (!matches2 && matchedBefore) {
        this.selectorUnmatched(element);
      }
    }
    selectorMatched(element) {
      if (this.delegate.selectorMatched) {
        this.delegate.selectorMatched(element, this.selector, this.details);
        this.matchesByElement.add(this.selector, element);
      }
    }
    selectorUnmatched(element) {
      this.delegate.selectorUnmatched(element, this.selector, this.details);
      this.matchesByElement.delete(this.selector, element);
    }
  };
  var StringMapObserver = class {
    constructor(element, delegate) {
      this.element = element;
      this.delegate = delegate;
      this.started = false;
      this.stringMap = /* @__PURE__ */ new Map();
      this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.mutationObserver.observe(this.element, { attributes: true, attributeOldValue: true });
        this.refresh();
      }
    }
    stop() {
      if (this.started) {
        this.mutationObserver.takeRecords();
        this.mutationObserver.disconnect();
        this.started = false;
      }
    }
    refresh() {
      if (this.started) {
        for (const attributeName of this.knownAttributeNames) {
          this.refreshAttribute(attributeName, null);
        }
      }
    }
    processMutations(mutations) {
      if (this.started) {
        for (const mutation of mutations) {
          this.processMutation(mutation);
        }
      }
    }
    processMutation(mutation) {
      const attributeName = mutation.attributeName;
      if (attributeName) {
        this.refreshAttribute(attributeName, mutation.oldValue);
      }
    }
    refreshAttribute(attributeName, oldValue) {
      const key = this.delegate.getStringMapKeyForAttribute(attributeName);
      if (key != null) {
        if (!this.stringMap.has(attributeName)) {
          this.stringMapKeyAdded(key, attributeName);
        }
        const value = this.element.getAttribute(attributeName);
        if (this.stringMap.get(attributeName) != value) {
          this.stringMapValueChanged(value, key, oldValue);
        }
        if (value == null) {
          const oldValue2 = this.stringMap.get(attributeName);
          this.stringMap.delete(attributeName);
          if (oldValue2)
            this.stringMapKeyRemoved(key, attributeName, oldValue2);
        } else {
          this.stringMap.set(attributeName, value);
        }
      }
    }
    stringMapKeyAdded(key, attributeName) {
      if (this.delegate.stringMapKeyAdded) {
        this.delegate.stringMapKeyAdded(key, attributeName);
      }
    }
    stringMapValueChanged(value, key, oldValue) {
      if (this.delegate.stringMapValueChanged) {
        this.delegate.stringMapValueChanged(value, key, oldValue);
      }
    }
    stringMapKeyRemoved(key, attributeName, oldValue) {
      if (this.delegate.stringMapKeyRemoved) {
        this.delegate.stringMapKeyRemoved(key, attributeName, oldValue);
      }
    }
    get knownAttributeNames() {
      return Array.from(new Set(this.currentAttributeNames.concat(this.recordedAttributeNames)));
    }
    get currentAttributeNames() {
      return Array.from(this.element.attributes).map((attribute) => attribute.name);
    }
    get recordedAttributeNames() {
      return Array.from(this.stringMap.keys());
    }
  };
  var TokenListObserver = class {
    constructor(element, attributeName, delegate) {
      this.attributeObserver = new AttributeObserver(element, attributeName, this);
      this.delegate = delegate;
      this.tokensByElement = new Multimap();
    }
    get started() {
      return this.attributeObserver.started;
    }
    start() {
      this.attributeObserver.start();
    }
    pause(callback) {
      this.attributeObserver.pause(callback);
    }
    stop() {
      this.attributeObserver.stop();
    }
    refresh() {
      this.attributeObserver.refresh();
    }
    get element() {
      return this.attributeObserver.element;
    }
    get attributeName() {
      return this.attributeObserver.attributeName;
    }
    elementMatchedAttribute(element) {
      this.tokensMatched(this.readTokensForElement(element));
    }
    elementAttributeValueChanged(element) {
      const [unmatchedTokens, matchedTokens] = this.refreshTokensForElement(element);
      this.tokensUnmatched(unmatchedTokens);
      this.tokensMatched(matchedTokens);
    }
    elementUnmatchedAttribute(element) {
      this.tokensUnmatched(this.tokensByElement.getValuesForKey(element));
    }
    tokensMatched(tokens) {
      tokens.forEach((token) => this.tokenMatched(token));
    }
    tokensUnmatched(tokens) {
      tokens.forEach((token) => this.tokenUnmatched(token));
    }
    tokenMatched(token) {
      this.delegate.tokenMatched(token);
      this.tokensByElement.add(token.element, token);
    }
    tokenUnmatched(token) {
      this.delegate.tokenUnmatched(token);
      this.tokensByElement.delete(token.element, token);
    }
    refreshTokensForElement(element) {
      const previousTokens = this.tokensByElement.getValuesForKey(element);
      const currentTokens = this.readTokensForElement(element);
      const firstDifferingIndex = zip(previousTokens, currentTokens).findIndex(([previousToken, currentToken]) => !tokensAreEqual(previousToken, currentToken));
      if (firstDifferingIndex == -1) {
        return [[], []];
      } else {
        return [previousTokens.slice(firstDifferingIndex), currentTokens.slice(firstDifferingIndex)];
      }
    }
    readTokensForElement(element) {
      const attributeName = this.attributeName;
      const tokenString = element.getAttribute(attributeName) || "";
      return parseTokenString(tokenString, element, attributeName);
    }
  };
  function parseTokenString(tokenString, element, attributeName) {
    return tokenString.trim().split(/\s+/).filter((content) => content.length).map((content, index2) => ({ element, attributeName, content, index: index2 }));
  }
  function zip(left, right) {
    const length = Math.max(left.length, right.length);
    return Array.from({ length }, (_, index2) => [left[index2], right[index2]]);
  }
  function tokensAreEqual(left, right) {
    return left && right && left.index == right.index && left.content == right.content;
  }
  var ValueListObserver = class {
    constructor(element, attributeName, delegate) {
      this.tokenListObserver = new TokenListObserver(element, attributeName, this);
      this.delegate = delegate;
      this.parseResultsByToken = /* @__PURE__ */ new WeakMap();
      this.valuesByTokenByElement = /* @__PURE__ */ new WeakMap();
    }
    get started() {
      return this.tokenListObserver.started;
    }
    start() {
      this.tokenListObserver.start();
    }
    stop() {
      this.tokenListObserver.stop();
    }
    refresh() {
      this.tokenListObserver.refresh();
    }
    get element() {
      return this.tokenListObserver.element;
    }
    get attributeName() {
      return this.tokenListObserver.attributeName;
    }
    tokenMatched(token) {
      const { element } = token;
      const { value } = this.fetchParseResultForToken(token);
      if (value) {
        this.fetchValuesByTokenForElement(element).set(token, value);
        this.delegate.elementMatchedValue(element, value);
      }
    }
    tokenUnmatched(token) {
      const { element } = token;
      const { value } = this.fetchParseResultForToken(token);
      if (value) {
        this.fetchValuesByTokenForElement(element).delete(token);
        this.delegate.elementUnmatchedValue(element, value);
      }
    }
    fetchParseResultForToken(token) {
      let parseResult = this.parseResultsByToken.get(token);
      if (!parseResult) {
        parseResult = this.parseToken(token);
        this.parseResultsByToken.set(token, parseResult);
      }
      return parseResult;
    }
    fetchValuesByTokenForElement(element) {
      let valuesByToken = this.valuesByTokenByElement.get(element);
      if (!valuesByToken) {
        valuesByToken = /* @__PURE__ */ new Map();
        this.valuesByTokenByElement.set(element, valuesByToken);
      }
      return valuesByToken;
    }
    parseToken(token) {
      try {
        const value = this.delegate.parseValueForToken(token);
        return { value };
      } catch (error2) {
        return { error: error2 };
      }
    }
  };
  var BindingObserver = class {
    constructor(context, delegate) {
      this.context = context;
      this.delegate = delegate;
      this.bindingsByAction = /* @__PURE__ */ new Map();
    }
    start() {
      if (!this.valueListObserver) {
        this.valueListObserver = new ValueListObserver(this.element, this.actionAttribute, this);
        this.valueListObserver.start();
      }
    }
    stop() {
      if (this.valueListObserver) {
        this.valueListObserver.stop();
        delete this.valueListObserver;
        this.disconnectAllActions();
      }
    }
    get element() {
      return this.context.element;
    }
    get identifier() {
      return this.context.identifier;
    }
    get actionAttribute() {
      return this.schema.actionAttribute;
    }
    get schema() {
      return this.context.schema;
    }
    get bindings() {
      return Array.from(this.bindingsByAction.values());
    }
    connectAction(action) {
      const binding = new Binding(this.context, action);
      this.bindingsByAction.set(action, binding);
      this.delegate.bindingConnected(binding);
    }
    disconnectAction(action) {
      const binding = this.bindingsByAction.get(action);
      if (binding) {
        this.bindingsByAction.delete(action);
        this.delegate.bindingDisconnected(binding);
      }
    }
    disconnectAllActions() {
      this.bindings.forEach((binding) => this.delegate.bindingDisconnected(binding, true));
      this.bindingsByAction.clear();
    }
    parseValueForToken(token) {
      const action = Action.forToken(token, this.schema);
      if (action.identifier == this.identifier) {
        return action;
      }
    }
    elementMatchedValue(element, action) {
      this.connectAction(action);
    }
    elementUnmatchedValue(element, action) {
      this.disconnectAction(action);
    }
  };
  var ValueObserver = class {
    constructor(context, receiver) {
      this.context = context;
      this.receiver = receiver;
      this.stringMapObserver = new StringMapObserver(this.element, this);
      this.valueDescriptorMap = this.controller.valueDescriptorMap;
    }
    start() {
      this.stringMapObserver.start();
      this.invokeChangedCallbacksForDefaultValues();
    }
    stop() {
      this.stringMapObserver.stop();
    }
    get element() {
      return this.context.element;
    }
    get controller() {
      return this.context.controller;
    }
    getStringMapKeyForAttribute(attributeName) {
      if (attributeName in this.valueDescriptorMap) {
        return this.valueDescriptorMap[attributeName].name;
      }
    }
    stringMapKeyAdded(key, attributeName) {
      const descriptor = this.valueDescriptorMap[attributeName];
      if (!this.hasValue(key)) {
        this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), descriptor.writer(descriptor.defaultValue));
      }
    }
    stringMapValueChanged(value, name, oldValue) {
      const descriptor = this.valueDescriptorNameMap[name];
      if (value === null)
        return;
      if (oldValue === null) {
        oldValue = descriptor.writer(descriptor.defaultValue);
      }
      this.invokeChangedCallback(name, value, oldValue);
    }
    stringMapKeyRemoved(key, attributeName, oldValue) {
      const descriptor = this.valueDescriptorNameMap[key];
      if (this.hasValue(key)) {
        this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), oldValue);
      } else {
        this.invokeChangedCallback(key, descriptor.writer(descriptor.defaultValue), oldValue);
      }
    }
    invokeChangedCallbacksForDefaultValues() {
      for (const { key, name, defaultValue, writer } of this.valueDescriptors) {
        if (defaultValue != void 0 && !this.controller.data.has(key)) {
          this.invokeChangedCallback(name, writer(defaultValue), void 0);
        }
      }
    }
    invokeChangedCallback(name, rawValue, rawOldValue) {
      const changedMethodName = `${name}Changed`;
      const changedMethod = this.receiver[changedMethodName];
      if (typeof changedMethod == "function") {
        const descriptor = this.valueDescriptorNameMap[name];
        try {
          const value = descriptor.reader(rawValue);
          let oldValue = rawOldValue;
          if (rawOldValue) {
            oldValue = descriptor.reader(rawOldValue);
          }
          changedMethod.call(this.receiver, value, oldValue);
        } catch (error2) {
          if (error2 instanceof TypeError) {
            error2.message = `Stimulus Value "${this.context.identifier}.${descriptor.name}" - ${error2.message}`;
          }
          throw error2;
        }
      }
    }
    get valueDescriptors() {
      const { valueDescriptorMap } = this;
      return Object.keys(valueDescriptorMap).map((key) => valueDescriptorMap[key]);
    }
    get valueDescriptorNameMap() {
      const descriptors = {};
      Object.keys(this.valueDescriptorMap).forEach((key) => {
        const descriptor = this.valueDescriptorMap[key];
        descriptors[descriptor.name] = descriptor;
      });
      return descriptors;
    }
    hasValue(attributeName) {
      const descriptor = this.valueDescriptorNameMap[attributeName];
      const hasMethodName = `has${capitalize(descriptor.name)}`;
      return this.receiver[hasMethodName];
    }
  };
  var TargetObserver = class {
    constructor(context, delegate) {
      this.context = context;
      this.delegate = delegate;
      this.targetsByName = new Multimap();
    }
    start() {
      if (!this.tokenListObserver) {
        this.tokenListObserver = new TokenListObserver(this.element, this.attributeName, this);
        this.tokenListObserver.start();
      }
    }
    stop() {
      if (this.tokenListObserver) {
        this.disconnectAllTargets();
        this.tokenListObserver.stop();
        delete this.tokenListObserver;
      }
    }
    tokenMatched({ element, content: name }) {
      if (this.scope.containsElement(element)) {
        this.connectTarget(element, name);
      }
    }
    tokenUnmatched({ element, content: name }) {
      this.disconnectTarget(element, name);
    }
    connectTarget(element, name) {
      var _a;
      if (!this.targetsByName.has(name, element)) {
        this.targetsByName.add(name, element);
        (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetConnected(element, name));
      }
    }
    disconnectTarget(element, name) {
      var _a;
      if (this.targetsByName.has(name, element)) {
        this.targetsByName.delete(name, element);
        (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetDisconnected(element, name));
      }
    }
    disconnectAllTargets() {
      for (const name of this.targetsByName.keys) {
        for (const element of this.targetsByName.getValuesForKey(name)) {
          this.disconnectTarget(element, name);
        }
      }
    }
    get attributeName() {
      return `data-${this.context.identifier}-target`;
    }
    get element() {
      return this.context.element;
    }
    get scope() {
      return this.context.scope;
    }
  };
  function readInheritableStaticArrayValues(constructor, propertyName) {
    const ancestors = getAncestorsForConstructor(constructor);
    return Array.from(ancestors.reduce((values, constructor2) => {
      getOwnStaticArrayValues(constructor2, propertyName).forEach((name) => values.add(name));
      return values;
    }, /* @__PURE__ */ new Set()));
  }
  function readInheritableStaticObjectPairs(constructor, propertyName) {
    const ancestors = getAncestorsForConstructor(constructor);
    return ancestors.reduce((pairs, constructor2) => {
      pairs.push(...getOwnStaticObjectPairs(constructor2, propertyName));
      return pairs;
    }, []);
  }
  function getAncestorsForConstructor(constructor) {
    const ancestors = [];
    while (constructor) {
      ancestors.push(constructor);
      constructor = Object.getPrototypeOf(constructor);
    }
    return ancestors.reverse();
  }
  function getOwnStaticArrayValues(constructor, propertyName) {
    const definition = constructor[propertyName];
    return Array.isArray(definition) ? definition : [];
  }
  function getOwnStaticObjectPairs(constructor, propertyName) {
    const definition = constructor[propertyName];
    return definition ? Object.keys(definition).map((key) => [key, definition[key]]) : [];
  }
  var OutletObserver = class {
    constructor(context, delegate) {
      this.context = context;
      this.delegate = delegate;
      this.outletsByName = new Multimap();
      this.outletElementsByName = new Multimap();
      this.selectorObserverMap = /* @__PURE__ */ new Map();
    }
    start() {
      if (this.selectorObserverMap.size === 0) {
        this.outletDefinitions.forEach((outletName) => {
          const selector = this.selector(outletName);
          const details = { outletName };
          if (selector) {
            this.selectorObserverMap.set(outletName, new SelectorObserver(document.body, selector, this, details));
          }
        });
        this.selectorObserverMap.forEach((observer) => observer.start());
      }
      this.dependentContexts.forEach((context) => context.refresh());
    }
    stop() {
      if (this.selectorObserverMap.size > 0) {
        this.disconnectAllOutlets();
        this.selectorObserverMap.forEach((observer) => observer.stop());
        this.selectorObserverMap.clear();
      }
    }
    refresh() {
      this.selectorObserverMap.forEach((observer) => observer.refresh());
    }
    selectorMatched(element, _selector, { outletName }) {
      const outlet = this.getOutlet(element, outletName);
      if (outlet) {
        this.connectOutlet(outlet, element, outletName);
      }
    }
    selectorUnmatched(element, _selector, { outletName }) {
      const outlet = this.getOutletFromMap(element, outletName);
      if (outlet) {
        this.disconnectOutlet(outlet, element, outletName);
      }
    }
    selectorMatchElement(element, { outletName }) {
      return this.hasOutlet(element, outletName) && element.matches(`[${this.context.application.schema.controllerAttribute}~=${outletName}]`);
    }
    connectOutlet(outlet, element, outletName) {
      var _a;
      if (!this.outletElementsByName.has(outletName, element)) {
        this.outletsByName.add(outletName, outlet);
        this.outletElementsByName.add(outletName, element);
        (_a = this.selectorObserverMap.get(outletName)) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.outletConnected(outlet, element, outletName));
      }
    }
    disconnectOutlet(outlet, element, outletName) {
      var _a;
      if (this.outletElementsByName.has(outletName, element)) {
        this.outletsByName.delete(outletName, outlet);
        this.outletElementsByName.delete(outletName, element);
        (_a = this.selectorObserverMap.get(outletName)) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.outletDisconnected(outlet, element, outletName));
      }
    }
    disconnectAllOutlets() {
      for (const outletName of this.outletElementsByName.keys) {
        for (const element of this.outletElementsByName.getValuesForKey(outletName)) {
          for (const outlet of this.outletsByName.getValuesForKey(outletName)) {
            this.disconnectOutlet(outlet, element, outletName);
          }
        }
      }
    }
    selector(outletName) {
      return this.scope.outlets.getSelectorForOutletName(outletName);
    }
    get outletDependencies() {
      const dependencies = new Multimap();
      this.router.modules.forEach((module3) => {
        const constructor = module3.definition.controllerConstructor;
        const outlets = readInheritableStaticArrayValues(constructor, "outlets");
        outlets.forEach((outlet) => dependencies.add(outlet, module3.identifier));
      });
      return dependencies;
    }
    get outletDefinitions() {
      return this.outletDependencies.getKeysForValue(this.identifier);
    }
    get dependentControllerIdentifiers() {
      return this.outletDependencies.getValuesForKey(this.identifier);
    }
    get dependentContexts() {
      const identifiers = this.dependentControllerIdentifiers;
      return this.router.contexts.filter((context) => identifiers.includes(context.identifier));
    }
    hasOutlet(element, outletName) {
      return !!this.getOutlet(element, outletName) || !!this.getOutletFromMap(element, outletName);
    }
    getOutlet(element, outletName) {
      return this.application.getControllerForElementAndIdentifier(element, outletName);
    }
    getOutletFromMap(element, outletName) {
      return this.outletsByName.getValuesForKey(outletName).find((outlet) => outlet.element === element);
    }
    get scope() {
      return this.context.scope;
    }
    get identifier() {
      return this.context.identifier;
    }
    get application() {
      return this.context.application;
    }
    get router() {
      return this.application.router;
    }
  };
  var Context = class {
    constructor(module3, scope) {
      this.logDebugActivity = (functionName, detail = {}) => {
        const { identifier, controller, element } = this;
        detail = Object.assign({ identifier, controller, element }, detail);
        this.application.logDebugActivity(this.identifier, functionName, detail);
      };
      this.module = module3;
      this.scope = scope;
      this.controller = new module3.controllerConstructor(this);
      this.bindingObserver = new BindingObserver(this, this.dispatcher);
      this.valueObserver = new ValueObserver(this, this.controller);
      this.targetObserver = new TargetObserver(this, this);
      this.outletObserver = new OutletObserver(this, this);
      try {
        this.controller.initialize();
        this.logDebugActivity("initialize");
      } catch (error2) {
        this.handleError(error2, "initializing controller");
      }
    }
    connect() {
      this.bindingObserver.start();
      this.valueObserver.start();
      this.targetObserver.start();
      this.outletObserver.start();
      try {
        this.controller.connect();
        this.logDebugActivity("connect");
      } catch (error2) {
        this.handleError(error2, "connecting controller");
      }
    }
    refresh() {
      this.outletObserver.refresh();
    }
    disconnect() {
      try {
        this.controller.disconnect();
        this.logDebugActivity("disconnect");
      } catch (error2) {
        this.handleError(error2, "disconnecting controller");
      }
      this.outletObserver.stop();
      this.targetObserver.stop();
      this.valueObserver.stop();
      this.bindingObserver.stop();
    }
    get application() {
      return this.module.application;
    }
    get identifier() {
      return this.module.identifier;
    }
    get schema() {
      return this.application.schema;
    }
    get dispatcher() {
      return this.application.dispatcher;
    }
    get element() {
      return this.scope.element;
    }
    get parentElement() {
      return this.element.parentElement;
    }
    handleError(error2, message, detail = {}) {
      const { identifier, controller, element } = this;
      detail = Object.assign({ identifier, controller, element }, detail);
      this.application.handleError(error2, `Error ${message}`, detail);
    }
    targetConnected(element, name) {
      this.invokeControllerMethod(`${name}TargetConnected`, element);
    }
    targetDisconnected(element, name) {
      this.invokeControllerMethod(`${name}TargetDisconnected`, element);
    }
    outletConnected(outlet, element, name) {
      this.invokeControllerMethod(`${namespaceCamelize(name)}OutletConnected`, outlet, element);
    }
    outletDisconnected(outlet, element, name) {
      this.invokeControllerMethod(`${namespaceCamelize(name)}OutletDisconnected`, outlet, element);
    }
    invokeControllerMethod(methodName, ...args) {
      const controller = this.controller;
      if (typeof controller[methodName] == "function") {
        controller[methodName](...args);
      }
    }
  };
  function bless(constructor) {
    return shadow(constructor, getBlessedProperties(constructor));
  }
  function shadow(constructor, properties) {
    const shadowConstructor = extend2(constructor);
    const shadowProperties = getShadowProperties(constructor.prototype, properties);
    Object.defineProperties(shadowConstructor.prototype, shadowProperties);
    return shadowConstructor;
  }
  function getBlessedProperties(constructor) {
    const blessings = readInheritableStaticArrayValues(constructor, "blessings");
    return blessings.reduce((blessedProperties, blessing) => {
      const properties = blessing(constructor);
      for (const key in properties) {
        const descriptor = blessedProperties[key] || {};
        blessedProperties[key] = Object.assign(descriptor, properties[key]);
      }
      return blessedProperties;
    }, {});
  }
  function getShadowProperties(prototype, properties) {
    return getOwnKeys(properties).reduce((shadowProperties, key) => {
      const descriptor = getShadowedDescriptor(prototype, properties, key);
      if (descriptor) {
        Object.assign(shadowProperties, { [key]: descriptor });
      }
      return shadowProperties;
    }, {});
  }
  function getShadowedDescriptor(prototype, properties, key) {
    const shadowingDescriptor = Object.getOwnPropertyDescriptor(prototype, key);
    const shadowedByValue = shadowingDescriptor && "value" in shadowingDescriptor;
    if (!shadowedByValue) {
      const descriptor = Object.getOwnPropertyDescriptor(properties, key).value;
      if (shadowingDescriptor) {
        descriptor.get = shadowingDescriptor.get || descriptor.get;
        descriptor.set = shadowingDescriptor.set || descriptor.set;
      }
      return descriptor;
    }
  }
  var getOwnKeys = (() => {
    if (typeof Object.getOwnPropertySymbols == "function") {
      return (object) => [...Object.getOwnPropertyNames(object), ...Object.getOwnPropertySymbols(object)];
    } else {
      return Object.getOwnPropertyNames;
    }
  })();
  var extend2 = (() => {
    function extendWithReflect(constructor) {
      function extended() {
        return Reflect.construct(constructor, arguments, new.target);
      }
      extended.prototype = Object.create(constructor.prototype, {
        constructor: { value: extended }
      });
      Reflect.setPrototypeOf(extended, constructor);
      return extended;
    }
    function testReflectExtension() {
      const a = function() {
        this.a.call(this);
      };
      const b = extendWithReflect(a);
      b.prototype.a = function() {
      };
      return new b();
    }
    try {
      testReflectExtension();
      return extendWithReflect;
    } catch (error2) {
      return (constructor) => class extended extends constructor {
      };
    }
  })();
  function blessDefinition(definition) {
    return {
      identifier: definition.identifier,
      controllerConstructor: bless(definition.controllerConstructor)
    };
  }
  var Module = class {
    constructor(application2, definition) {
      this.application = application2;
      this.definition = blessDefinition(definition);
      this.contextsByScope = /* @__PURE__ */ new WeakMap();
      this.connectedContexts = /* @__PURE__ */ new Set();
    }
    get identifier() {
      return this.definition.identifier;
    }
    get controllerConstructor() {
      return this.definition.controllerConstructor;
    }
    get contexts() {
      return Array.from(this.connectedContexts);
    }
    connectContextForScope(scope) {
      const context = this.fetchContextForScope(scope);
      this.connectedContexts.add(context);
      context.connect();
    }
    disconnectContextForScope(scope) {
      const context = this.contextsByScope.get(scope);
      if (context) {
        this.connectedContexts.delete(context);
        context.disconnect();
      }
    }
    fetchContextForScope(scope) {
      let context = this.contextsByScope.get(scope);
      if (!context) {
        context = new Context(this, scope);
        this.contextsByScope.set(scope, context);
      }
      return context;
    }
  };
  var ClassMap = class {
    constructor(scope) {
      this.scope = scope;
    }
    has(name) {
      return this.data.has(this.getDataKey(name));
    }
    get(name) {
      return this.getAll(name)[0];
    }
    getAll(name) {
      const tokenString = this.data.get(this.getDataKey(name)) || "";
      return tokenize(tokenString);
    }
    getAttributeName(name) {
      return this.data.getAttributeNameForKey(this.getDataKey(name));
    }
    getDataKey(name) {
      return `${name}-class`;
    }
    get data() {
      return this.scope.data;
    }
  };
  var DataMap = class {
    constructor(scope) {
      this.scope = scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get(key) {
      const name = this.getAttributeNameForKey(key);
      return this.element.getAttribute(name);
    }
    set(key, value) {
      const name = this.getAttributeNameForKey(key);
      this.element.setAttribute(name, value);
      return this.get(key);
    }
    has(key) {
      const name = this.getAttributeNameForKey(key);
      return this.element.hasAttribute(name);
    }
    delete(key) {
      if (this.has(key)) {
        const name = this.getAttributeNameForKey(key);
        this.element.removeAttribute(name);
        return true;
      } else {
        return false;
      }
    }
    getAttributeNameForKey(key) {
      return `data-${this.identifier}-${dasherize(key)}`;
    }
  };
  var Guide = class {
    constructor(logger) {
      this.warnedKeysByObject = /* @__PURE__ */ new WeakMap();
      this.logger = logger;
    }
    warn(object, key, message) {
      let warnedKeys = this.warnedKeysByObject.get(object);
      if (!warnedKeys) {
        warnedKeys = /* @__PURE__ */ new Set();
        this.warnedKeysByObject.set(object, warnedKeys);
      }
      if (!warnedKeys.has(key)) {
        warnedKeys.add(key);
        this.logger.warn(message, object);
      }
    }
  };
  function attributeValueContainsToken(attributeName, token) {
    return `[${attributeName}~="${token}"]`;
  }
  var TargetSet = class {
    constructor(scope) {
      this.scope = scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get schema() {
      return this.scope.schema;
    }
    has(targetName) {
      return this.find(targetName) != null;
    }
    find(...targetNames) {
      return targetNames.reduce((target, targetName) => target || this.findTarget(targetName) || this.findLegacyTarget(targetName), void 0);
    }
    findAll(...targetNames) {
      return targetNames.reduce((targets, targetName) => [
        ...targets,
        ...this.findAllTargets(targetName),
        ...this.findAllLegacyTargets(targetName)
      ], []);
    }
    findTarget(targetName) {
      const selector = this.getSelectorForTargetName(targetName);
      return this.scope.findElement(selector);
    }
    findAllTargets(targetName) {
      const selector = this.getSelectorForTargetName(targetName);
      return this.scope.findAllElements(selector);
    }
    getSelectorForTargetName(targetName) {
      const attributeName = this.schema.targetAttributeForScope(this.identifier);
      return attributeValueContainsToken(attributeName, targetName);
    }
    findLegacyTarget(targetName) {
      const selector = this.getLegacySelectorForTargetName(targetName);
      return this.deprecate(this.scope.findElement(selector), targetName);
    }
    findAllLegacyTargets(targetName) {
      const selector = this.getLegacySelectorForTargetName(targetName);
      return this.scope.findAllElements(selector).map((element) => this.deprecate(element, targetName));
    }
    getLegacySelectorForTargetName(targetName) {
      const targetDescriptor = `${this.identifier}.${targetName}`;
      return attributeValueContainsToken(this.schema.targetAttribute, targetDescriptor);
    }
    deprecate(element, targetName) {
      if (element) {
        const { identifier } = this;
        const attributeName = this.schema.targetAttribute;
        const revisedAttributeName = this.schema.targetAttributeForScope(identifier);
        this.guide.warn(element, `target:${targetName}`, `Please replace ${attributeName}="${identifier}.${targetName}" with ${revisedAttributeName}="${targetName}". The ${attributeName} attribute is deprecated and will be removed in a future version of Stimulus.`);
      }
      return element;
    }
    get guide() {
      return this.scope.guide;
    }
  };
  var OutletSet = class {
    constructor(scope, controllerElement) {
      this.scope = scope;
      this.controllerElement = controllerElement;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get schema() {
      return this.scope.schema;
    }
    has(outletName) {
      return this.find(outletName) != null;
    }
    find(...outletNames) {
      return outletNames.reduce((outlet, outletName) => outlet || this.findOutlet(outletName), void 0);
    }
    findAll(...outletNames) {
      return outletNames.reduce((outlets, outletName) => [...outlets, ...this.findAllOutlets(outletName)], []);
    }
    getSelectorForOutletName(outletName) {
      const attributeName = this.schema.outletAttributeForScope(this.identifier, outletName);
      return this.controllerElement.getAttribute(attributeName);
    }
    findOutlet(outletName) {
      const selector = this.getSelectorForOutletName(outletName);
      if (selector)
        return this.findElement(selector, outletName);
    }
    findAllOutlets(outletName) {
      const selector = this.getSelectorForOutletName(outletName);
      return selector ? this.findAllElements(selector, outletName) : [];
    }
    findElement(selector, outletName) {
      const elements = this.scope.queryElements(selector);
      return elements.filter((element) => this.matchesElement(element, selector, outletName))[0];
    }
    findAllElements(selector, outletName) {
      const elements = this.scope.queryElements(selector);
      return elements.filter((element) => this.matchesElement(element, selector, outletName));
    }
    matchesElement(element, selector, outletName) {
      const controllerAttribute = element.getAttribute(this.scope.schema.controllerAttribute) || "";
      return element.matches(selector) && controllerAttribute.split(" ").includes(outletName);
    }
  };
  var Scope = class {
    constructor(schema, element, identifier, logger) {
      this.targets = new TargetSet(this);
      this.classes = new ClassMap(this);
      this.data = new DataMap(this);
      this.containsElement = (element2) => {
        return element2.closest(this.controllerSelector) === this.element;
      };
      this.schema = schema;
      this.element = element;
      this.identifier = identifier;
      this.guide = new Guide(logger);
      this.outlets = new OutletSet(this.documentScope, element);
    }
    findElement(selector) {
      return this.element.matches(selector) ? this.element : this.queryElements(selector).find(this.containsElement);
    }
    findAllElements(selector) {
      return [
        ...this.element.matches(selector) ? [this.element] : [],
        ...this.queryElements(selector).filter(this.containsElement)
      ];
    }
    queryElements(selector) {
      return Array.from(this.element.querySelectorAll(selector));
    }
    get controllerSelector() {
      return attributeValueContainsToken(this.schema.controllerAttribute, this.identifier);
    }
    get isDocumentScope() {
      return this.element === document.documentElement;
    }
    get documentScope() {
      return this.isDocumentScope ? this : new Scope(this.schema, document.documentElement, this.identifier, this.guide.logger);
    }
  };
  var ScopeObserver = class {
    constructor(element, schema, delegate) {
      this.element = element;
      this.schema = schema;
      this.delegate = delegate;
      this.valueListObserver = new ValueListObserver(this.element, this.controllerAttribute, this);
      this.scopesByIdentifierByElement = /* @__PURE__ */ new WeakMap();
      this.scopeReferenceCounts = /* @__PURE__ */ new WeakMap();
    }
    start() {
      this.valueListObserver.start();
    }
    stop() {
      this.valueListObserver.stop();
    }
    get controllerAttribute() {
      return this.schema.controllerAttribute;
    }
    parseValueForToken(token) {
      const { element, content: identifier } = token;
      const scopesByIdentifier = this.fetchScopesByIdentifierForElement(element);
      let scope = scopesByIdentifier.get(identifier);
      if (!scope) {
        scope = this.delegate.createScopeForElementAndIdentifier(element, identifier);
        scopesByIdentifier.set(identifier, scope);
      }
      return scope;
    }
    elementMatchedValue(element, value) {
      const referenceCount = (this.scopeReferenceCounts.get(value) || 0) + 1;
      this.scopeReferenceCounts.set(value, referenceCount);
      if (referenceCount == 1) {
        this.delegate.scopeConnected(value);
      }
    }
    elementUnmatchedValue(element, value) {
      const referenceCount = this.scopeReferenceCounts.get(value);
      if (referenceCount) {
        this.scopeReferenceCounts.set(value, referenceCount - 1);
        if (referenceCount == 1) {
          this.delegate.scopeDisconnected(value);
        }
      }
    }
    fetchScopesByIdentifierForElement(element) {
      let scopesByIdentifier = this.scopesByIdentifierByElement.get(element);
      if (!scopesByIdentifier) {
        scopesByIdentifier = /* @__PURE__ */ new Map();
        this.scopesByIdentifierByElement.set(element, scopesByIdentifier);
      }
      return scopesByIdentifier;
    }
  };
  var Router = class {
    constructor(application2) {
      this.application = application2;
      this.scopeObserver = new ScopeObserver(this.element, this.schema, this);
      this.scopesByIdentifier = new Multimap();
      this.modulesByIdentifier = /* @__PURE__ */ new Map();
    }
    get element() {
      return this.application.element;
    }
    get schema() {
      return this.application.schema;
    }
    get logger() {
      return this.application.logger;
    }
    get controllerAttribute() {
      return this.schema.controllerAttribute;
    }
    get modules() {
      return Array.from(this.modulesByIdentifier.values());
    }
    get contexts() {
      return this.modules.reduce((contexts, module3) => contexts.concat(module3.contexts), []);
    }
    start() {
      this.scopeObserver.start();
    }
    stop() {
      this.scopeObserver.stop();
    }
    loadDefinition(definition) {
      this.unloadIdentifier(definition.identifier);
      const module3 = new Module(this.application, definition);
      this.connectModule(module3);
      const afterLoad = definition.controllerConstructor.afterLoad;
      if (afterLoad) {
        afterLoad(definition.identifier, this.application);
      }
    }
    unloadIdentifier(identifier) {
      const module3 = this.modulesByIdentifier.get(identifier);
      if (module3) {
        this.disconnectModule(module3);
      }
    }
    getContextForElementAndIdentifier(element, identifier) {
      const module3 = this.modulesByIdentifier.get(identifier);
      if (module3) {
        return module3.contexts.find((context) => context.element == element);
      }
    }
    handleError(error2, message, detail) {
      this.application.handleError(error2, message, detail);
    }
    createScopeForElementAndIdentifier(element, identifier) {
      return new Scope(this.schema, element, identifier, this.logger);
    }
    scopeConnected(scope) {
      this.scopesByIdentifier.add(scope.identifier, scope);
      const module3 = this.modulesByIdentifier.get(scope.identifier);
      if (module3) {
        module3.connectContextForScope(scope);
      }
    }
    scopeDisconnected(scope) {
      this.scopesByIdentifier.delete(scope.identifier, scope);
      const module3 = this.modulesByIdentifier.get(scope.identifier);
      if (module3) {
        module3.disconnectContextForScope(scope);
      }
    }
    connectModule(module3) {
      this.modulesByIdentifier.set(module3.identifier, module3);
      const scopes = this.scopesByIdentifier.getValuesForKey(module3.identifier);
      scopes.forEach((scope) => module3.connectContextForScope(scope));
    }
    disconnectModule(module3) {
      this.modulesByIdentifier.delete(module3.identifier);
      const scopes = this.scopesByIdentifier.getValuesForKey(module3.identifier);
      scopes.forEach((scope) => module3.disconnectContextForScope(scope));
    }
  };
  var defaultSchema = {
    controllerAttribute: "data-controller",
    actionAttribute: "data-action",
    targetAttribute: "data-target",
    targetAttributeForScope: (identifier) => `data-${identifier}-target`,
    outletAttributeForScope: (identifier, outlet) => `data-${identifier}-${outlet}-outlet`,
    keyMappings: Object.assign(Object.assign({ enter: "Enter", tab: "Tab", esc: "Escape", space: " ", up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", home: "Home", end: "End" }, objectFromEntries("abcdefghijklmnopqrstuvwxyz".split("").map((c) => [c, c]))), objectFromEntries("0123456789".split("").map((n) => [n, n])))
  };
  function objectFromEntries(array) {
    return array.reduce((memo, [k, v]) => Object.assign(Object.assign({}, memo), { [k]: v }), {});
  }
  var Application = class {
    constructor(element = document.documentElement, schema = defaultSchema) {
      this.logger = console;
      this.debug = false;
      this.logDebugActivity = (identifier, functionName, detail = {}) => {
        if (this.debug) {
          this.logFormattedMessage(identifier, functionName, detail);
        }
      };
      this.element = element;
      this.schema = schema;
      this.dispatcher = new Dispatcher(this);
      this.router = new Router(this);
      this.actionDescriptorFilters = Object.assign({}, defaultActionDescriptorFilters);
    }
    static start(element, schema) {
      const application2 = new this(element, schema);
      application2.start();
      return application2;
    }
    async start() {
      await domReady();
      this.logDebugActivity("application", "starting");
      this.dispatcher.start();
      this.router.start();
      this.logDebugActivity("application", "start");
    }
    stop() {
      this.logDebugActivity("application", "stopping");
      this.dispatcher.stop();
      this.router.stop();
      this.logDebugActivity("application", "stop");
    }
    register(identifier, controllerConstructor) {
      this.load({ identifier, controllerConstructor });
    }
    registerActionOption(name, filter2) {
      this.actionDescriptorFilters[name] = filter2;
    }
    load(head, ...rest) {
      const definitions = Array.isArray(head) ? head : [head, ...rest];
      definitions.forEach((definition) => {
        if (definition.controllerConstructor.shouldLoad) {
          this.router.loadDefinition(definition);
        }
      });
    }
    unload(head, ...rest) {
      const identifiers = Array.isArray(head) ? head : [head, ...rest];
      identifiers.forEach((identifier) => this.router.unloadIdentifier(identifier));
    }
    get controllers() {
      return this.router.contexts.map((context) => context.controller);
    }
    getControllerForElementAndIdentifier(element, identifier) {
      const context = this.router.getContextForElementAndIdentifier(element, identifier);
      return context ? context.controller : null;
    }
    handleError(error2, message, detail) {
      var _a;
      this.logger.error(`%s

%o

%o`, message, error2, detail);
      (_a = window.onerror) === null || _a === void 0 ? void 0 : _a.call(window, message, "", 0, 0, error2);
    }
    logFormattedMessage(identifier, functionName, detail = {}) {
      detail = Object.assign({ application: this }, detail);
      this.logger.groupCollapsed(`${identifier} #${functionName}`);
      this.logger.log("details:", Object.assign({}, detail));
      this.logger.groupEnd();
    }
  };
  function domReady() {
    return new Promise((resolve) => {
      if (document.readyState == "loading") {
        document.addEventListener("DOMContentLoaded", () => resolve());
      } else {
        resolve();
      }
    });
  }
  function ClassPropertiesBlessing(constructor) {
    const classes = readInheritableStaticArrayValues(constructor, "classes");
    return classes.reduce((properties, classDefinition) => {
      return Object.assign(properties, propertiesForClassDefinition(classDefinition));
    }, {});
  }
  function propertiesForClassDefinition(key) {
    return {
      [`${key}Class`]: {
        get() {
          const { classes } = this;
          if (classes.has(key)) {
            return classes.get(key);
          } else {
            const attribute = classes.getAttributeName(key);
            throw new Error(`Missing attribute "${attribute}"`);
          }
        }
      },
      [`${key}Classes`]: {
        get() {
          return this.classes.getAll(key);
        }
      },
      [`has${capitalize(key)}Class`]: {
        get() {
          return this.classes.has(key);
        }
      }
    };
  }
  function OutletPropertiesBlessing(constructor) {
    const outlets = readInheritableStaticArrayValues(constructor, "outlets");
    return outlets.reduce((properties, outletDefinition) => {
      return Object.assign(properties, propertiesForOutletDefinition(outletDefinition));
    }, {});
  }
  function propertiesForOutletDefinition(name) {
    const camelizedName = namespaceCamelize(name);
    return {
      [`${camelizedName}Outlet`]: {
        get() {
          const outlet = this.outlets.find(name);
          if (outlet) {
            const outletController = this.application.getControllerForElementAndIdentifier(outlet, name);
            if (outletController) {
              return outletController;
            } else {
              throw new Error(`Missing "data-controller=${name}" attribute on outlet element for "${this.identifier}" controller`);
            }
          }
          throw new Error(`Missing outlet element "${name}" for "${this.identifier}" controller`);
        }
      },
      [`${camelizedName}Outlets`]: {
        get() {
          const outlets = this.outlets.findAll(name);
          if (outlets.length > 0) {
            return outlets.map((outlet) => {
              const controller = this.application.getControllerForElementAndIdentifier(outlet, name);
              if (controller) {
                return controller;
              } else {
                console.warn(`The provided outlet element is missing the outlet controller "${name}" for "${this.identifier}"`, outlet);
              }
            }).filter((controller) => controller);
          }
          return [];
        }
      },
      [`${camelizedName}OutletElement`]: {
        get() {
          const outlet = this.outlets.find(name);
          if (outlet) {
            return outlet;
          } else {
            throw new Error(`Missing outlet element "${name}" for "${this.identifier}" controller`);
          }
        }
      },
      [`${camelizedName}OutletElements`]: {
        get() {
          return this.outlets.findAll(name);
        }
      },
      [`has${capitalize(camelizedName)}Outlet`]: {
        get() {
          return this.outlets.has(name);
        }
      }
    };
  }
  function TargetPropertiesBlessing(constructor) {
    const targets = readInheritableStaticArrayValues(constructor, "targets");
    return targets.reduce((properties, targetDefinition) => {
      return Object.assign(properties, propertiesForTargetDefinition(targetDefinition));
    }, {});
  }
  function propertiesForTargetDefinition(name) {
    return {
      [`${name}Target`]: {
        get() {
          const target = this.targets.find(name);
          if (target) {
            return target;
          } else {
            throw new Error(`Missing target element "${name}" for "${this.identifier}" controller`);
          }
        }
      },
      [`${name}Targets`]: {
        get() {
          return this.targets.findAll(name);
        }
      },
      [`has${capitalize(name)}Target`]: {
        get() {
          return this.targets.has(name);
        }
      }
    };
  }
  function ValuePropertiesBlessing(constructor) {
    const valueDefinitionPairs = readInheritableStaticObjectPairs(constructor, "values");
    const propertyDescriptorMap = {
      valueDescriptorMap: {
        get() {
          return valueDefinitionPairs.reduce((result, valueDefinitionPair) => {
            const valueDescriptor = parseValueDefinitionPair(valueDefinitionPair, this.identifier);
            const attributeName = this.data.getAttributeNameForKey(valueDescriptor.key);
            return Object.assign(result, { [attributeName]: valueDescriptor });
          }, {});
        }
      }
    };
    return valueDefinitionPairs.reduce((properties, valueDefinitionPair) => {
      return Object.assign(properties, propertiesForValueDefinitionPair(valueDefinitionPair));
    }, propertyDescriptorMap);
  }
  function propertiesForValueDefinitionPair(valueDefinitionPair, controller) {
    const definition = parseValueDefinitionPair(valueDefinitionPair, controller);
    const { key, name, reader: read, writer: write } = definition;
    return {
      [name]: {
        get() {
          const value = this.data.get(key);
          if (value !== null) {
            return read(value);
          } else {
            return definition.defaultValue;
          }
        },
        set(value) {
          if (value === void 0) {
            this.data.delete(key);
          } else {
            this.data.set(key, write(value));
          }
        }
      },
      [`has${capitalize(name)}`]: {
        get() {
          return this.data.has(key) || definition.hasCustomDefaultValue;
        }
      }
    };
  }
  function parseValueDefinitionPair([token, typeDefinition], controller) {
    return valueDescriptorForTokenAndTypeDefinition({
      controller,
      token,
      typeDefinition
    });
  }
  function parseValueTypeConstant(constant) {
    switch (constant) {
      case Array:
        return "array";
      case Boolean:
        return "boolean";
      case Number:
        return "number";
      case Object:
        return "object";
      case String:
        return "string";
    }
  }
  function parseValueTypeDefault(defaultValue) {
    switch (typeof defaultValue) {
      case "boolean":
        return "boolean";
      case "number":
        return "number";
      case "string":
        return "string";
    }
    if (Array.isArray(defaultValue))
      return "array";
    if (Object.prototype.toString.call(defaultValue) === "[object Object]")
      return "object";
  }
  function parseValueTypeObject(payload) {
    const typeFromObject = parseValueTypeConstant(payload.typeObject.type);
    if (!typeFromObject)
      return;
    const defaultValueType = parseValueTypeDefault(payload.typeObject.default);
    if (typeFromObject !== defaultValueType) {
      const propertyPath = payload.controller ? `${payload.controller}.${payload.token}` : payload.token;
      throw new Error(`The specified default value for the Stimulus Value "${propertyPath}" must match the defined type "${typeFromObject}". The provided default value of "${payload.typeObject.default}" is of type "${defaultValueType}".`);
    }
    return typeFromObject;
  }
  function parseValueTypeDefinition(payload) {
    const typeFromObject = parseValueTypeObject({
      controller: payload.controller,
      token: payload.token,
      typeObject: payload.typeDefinition
    });
    const typeFromDefaultValue = parseValueTypeDefault(payload.typeDefinition);
    const typeFromConstant = parseValueTypeConstant(payload.typeDefinition);
    const type = typeFromObject || typeFromDefaultValue || typeFromConstant;
    if (type)
      return type;
    const propertyPath = payload.controller ? `${payload.controller}.${payload.typeDefinition}` : payload.token;
    throw new Error(`Unknown value type "${propertyPath}" for "${payload.token}" value`);
  }
  function defaultValueForDefinition(typeDefinition) {
    const constant = parseValueTypeConstant(typeDefinition);
    if (constant)
      return defaultValuesByType[constant];
    const defaultValue = typeDefinition.default;
    if (defaultValue !== void 0)
      return defaultValue;
    return typeDefinition;
  }
  function valueDescriptorForTokenAndTypeDefinition(payload) {
    const key = `${dasherize(payload.token)}-value`;
    const type = parseValueTypeDefinition(payload);
    return {
      type,
      key,
      name: camelize(key),
      get defaultValue() {
        return defaultValueForDefinition(payload.typeDefinition);
      },
      get hasCustomDefaultValue() {
        return parseValueTypeDefault(payload.typeDefinition) !== void 0;
      },
      reader: readers[type],
      writer: writers[type] || writers.default
    };
  }
  var defaultValuesByType = {
    get array() {
      return [];
    },
    boolean: false,
    number: 0,
    get object() {
      return {};
    },
    string: ""
  };
  var readers = {
    array(value) {
      const array = JSON.parse(value);
      if (!Array.isArray(array)) {
        throw new TypeError(`expected value of type "array" but instead got value "${value}" of type "${parseValueTypeDefault(array)}"`);
      }
      return array;
    },
    boolean(value) {
      return !(value == "0" || String(value).toLowerCase() == "false");
    },
    number(value) {
      return Number(value);
    },
    object(value) {
      const object = JSON.parse(value);
      if (object === null || typeof object != "object" || Array.isArray(object)) {
        throw new TypeError(`expected value of type "object" but instead got value "${value}" of type "${parseValueTypeDefault(object)}"`);
      }
      return object;
    },
    string(value) {
      return value;
    }
  };
  var writers = {
    default: writeString,
    array: writeJSON,
    object: writeJSON
  };
  function writeJSON(value) {
    return JSON.stringify(value);
  }
  function writeString(value) {
    return `${value}`;
  }
  var Controller = class {
    constructor(context) {
      this.context = context;
    }
    static get shouldLoad() {
      return true;
    }
    static afterLoad(_identifier, _application) {
      return;
    }
    get application() {
      return this.context.application;
    }
    get scope() {
      return this.context.scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get targets() {
      return this.scope.targets;
    }
    get outlets() {
      return this.scope.outlets;
    }
    get classes() {
      return this.scope.classes;
    }
    get data() {
      return this.scope.data;
    }
    initialize() {
    }
    connect() {
    }
    disconnect() {
    }
    dispatch(eventName, { target = this.element, detail = {}, prefix = this.identifier, bubbles = true, cancelable = true } = {}) {
      const type = prefix ? `${prefix}:${eventName}` : eventName;
      const event = new CustomEvent(type, { detail, bubbles, cancelable });
      target.dispatchEvent(event);
      return event;
    }
  };
  Controller.blessings = [
    ClassPropertiesBlessing,
    TargetPropertiesBlessing,
    ValuePropertiesBlessing,
    OutletPropertiesBlessing
  ];
  Controller.targets = [];
  Controller.outlets = [];
  Controller.values = {};

  // controllers/application.js
  var application = Application.start();
  application.warnings = true;
  application.debug = false;
  window.Stimulus = application;

  // controllers/article_controller.js
  var article_controller_exports = {};
  __export(article_controller_exports, {
    default: () => article_controller_default
  });

  // libraries/highlight@10.5.0.js
  var hljs = function() {
    "use strict";
    function e(t2) {
      return t2 instanceof Map ? t2.clear = t2.delete = t2.set = () => {
        throw Error("map is read-only");
      } : t2 instanceof Set && (t2.add = t2.clear = t2.delete = () => {
        throw Error("set is read-only");
      }), Object.freeze(t2), Object.getOwnPropertyNames(t2).forEach((n2) => {
        var s2 = t2[n2];
        "object" != typeof s2 || Object.isFrozen(s2) || e(s2);
      }), t2;
    }
    var t = e, n = e;
    t.default = n;
    class s {
      constructor(e2) {
        void 0 === e2.data && (e2.data = {}), this.data = e2.data;
      }
      ignoreMatch() {
        this.ignore = true;
      }
    }
    function r(e2) {
      return e2.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
    }
    function a(e2, ...t2) {
      const n2 = /* @__PURE__ */ Object.create(null);
      for (const t3 in e2)
        n2[t3] = e2[t3];
      return t2.forEach((e3) => {
        for (const t3 in e3)
          n2[t3] = e3[t3];
      }), n2;
    }
    const i = (e2) => !!e2.kind;
    class o {
      constructor(e2, t2) {
        this.buffer = "", this.classPrefix = t2.classPrefix, e2.walk(this);
      }
      addText(e2) {
        this.buffer += r(e2);
      }
      openNode(e2) {
        if (!i(e2))
          return;
        let t2 = e2.kind;
        e2.sublanguage || (t2 = `${this.classPrefix}${t2}`), this.span(t2);
      }
      closeNode(e2) {
        i(e2) && (this.buffer += "</span>");
      }
      value() {
        return this.buffer;
      }
      span(e2) {
        this.buffer += `<span class="${e2}">`;
      }
    }
    class l {
      constructor() {
        this.rootNode = {
          children: []
        }, this.stack = [this.rootNode];
      }
      get top() {
        return this.stack[this.stack.length - 1];
      }
      get root() {
        return this.rootNode;
      }
      add(e2) {
        this.top.children.push(e2);
      }
      openNode(e2) {
        const t2 = { kind: e2, children: [] };
        this.add(t2), this.stack.push(t2);
      }
      closeNode() {
        if (this.stack.length > 1)
          return this.stack.pop();
      }
      closeAllNodes() {
        for (; this.closeNode(); )
          ;
      }
      toJSON() {
        return JSON.stringify(this.rootNode, null, 4);
      }
      walk(e2) {
        return this.constructor._walk(e2, this.rootNode);
      }
      static _walk(e2, t2) {
        return "string" == typeof t2 ? e2.addText(t2) : t2.children && (e2.openNode(t2), t2.children.forEach((t3) => this._walk(e2, t3)), e2.closeNode(t2)), e2;
      }
      static _collapse(e2) {
        "string" != typeof e2 && e2.children && (e2.children.every((e3) => "string" == typeof e3) ? e2.children = [e2.children.join("")] : e2.children.forEach((e3) => {
          l._collapse(e3);
        }));
      }
    }
    class c extends l {
      constructor(e2) {
        super(), this.options = e2;
      }
      addKeyword(e2, t2) {
        "" !== e2 && (this.openNode(t2), this.addText(e2), this.closeNode());
      }
      addText(e2) {
        "" !== e2 && this.add(e2);
      }
      addSublanguage(e2, t2) {
        const n2 = e2.root;
        n2.kind = t2, n2.sublanguage = true, this.add(n2);
      }
      toHTML() {
        return new o(this, this.options).value();
      }
      finalize() {
        return true;
      }
    }
    function u(e2) {
      return e2 ? "string" == typeof e2 ? e2 : e2.source : null;
    }
    const g = "[a-zA-Z]\\w*", d = "[a-zA-Z_]\\w*", h = "\\b\\d+(\\.\\d+)?", f = "(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)", p = "\\b(0b[01]+)", m = {
      begin: "\\\\[\\s\\S]",
      relevance: 0
    }, b = {
      className: "string",
      begin: "'",
      end: "'",
      illegal: "\\n",
      contains: [m]
    }, x = {
      className: "string",
      begin: '"',
      end: '"',
      illegal: "\\n",
      contains: [m]
    }, E = {
      begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
    }, v = (e2, t2, n2 = {}) => {
      const s2 = a({ className: "comment", begin: e2, end: t2, contains: [] }, n2);
      return s2.contains.push(E), s2.contains.push({
        className: "doctag",
        begin: "(?:TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):",
        relevance: 0
      }), s2;
    }, N = v("//", "$"), w = v("/\\*", "\\*/"), R = v("#", "$");
    var y = Object.freeze({
      __proto__: null,
      IDENT_RE: g,
      UNDERSCORE_IDENT_RE: d,
      NUMBER_RE: h,
      C_NUMBER_RE: f,
      BINARY_NUMBER_RE: p,
      RE_STARTERS_RE: "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~",
      SHEBANG: (e2 = {}) => {
        const t2 = /^#![ ]*\//;
        return e2.binary && (e2.begin = ((...e3) => e3.map((e4) => u(e4)).join(""))(t2, /.*\b/, e2.binary, /\b.*/)), a({ className: "meta", begin: t2, end: /$/, relevance: 0, "on:begin": (e3, t3) => {
          0 !== e3.index && t3.ignoreMatch();
        } }, e2);
      },
      BACKSLASH_ESCAPE: m,
      APOS_STRING_MODE: b,
      QUOTE_STRING_MODE: x,
      PHRASAL_WORDS_MODE: E,
      COMMENT: v,
      C_LINE_COMMENT_MODE: N,
      C_BLOCK_COMMENT_MODE: w,
      HASH_COMMENT_MODE: R,
      NUMBER_MODE: {
        className: "number",
        begin: h,
        relevance: 0
      },
      C_NUMBER_MODE: { className: "number", begin: f, relevance: 0 },
      BINARY_NUMBER_MODE: { className: "number", begin: p, relevance: 0 },
      CSS_NUMBER_MODE: {
        className: "number",
        begin: h + "(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",
        relevance: 0
      },
      REGEXP_MODE: { begin: /(?=\/[^/\n]*\/)/, contains: [{
        className: "regexp",
        begin: /\//,
        end: /\/[gimuy]*/,
        illegal: /\n/,
        contains: [m, {
          begin: /\[/,
          end: /\]/,
          relevance: 0,
          contains: [m]
        }]
      }] },
      TITLE_MODE: {
        className: "title",
        begin: g,
        relevance: 0
      },
      UNDERSCORE_TITLE_MODE: { className: "title", begin: d, relevance: 0 },
      METHOD_GUARD: {
        begin: "\\.\\s*[a-zA-Z_]\\w*",
        relevance: 0
      },
      END_SAME_AS_BEGIN: (e2) => Object.assign(e2, {
        "on:begin": (e3, t2) => {
          t2.data._beginMatch = e3[1];
        },
        "on:end": (e3, t2) => {
          t2.data._beginMatch !== e3[1] && t2.ignoreMatch();
        }
      })
    });
    function _(e2, t2) {
      "." === e2.input[e2.index - 1] && t2.ignoreMatch();
    }
    function k(e2, t2) {
      t2 && e2.beginKeywords && (e2.begin = "\\b(" + e2.beginKeywords.split(" ").join("|") + ")(?!\\.)(?=\\b|\\s)", e2.__beforeBegin = _, e2.keywords = e2.keywords || e2.beginKeywords, delete e2.beginKeywords);
    }
    function M(e2, t2) {
      Array.isArray(e2.illegal) && (e2.illegal = ((...e3) => "(" + e3.map((e4) => u(e4)).join("|") + ")")(...e2.illegal));
    }
    function O(e2, t2) {
      if (e2.match) {
        if (e2.begin || e2.end)
          throw Error("begin & end are not supported with match");
        e2.begin = e2.match, delete e2.match;
      }
    }
    function A(e2, t2) {
      void 0 === e2.relevance && (e2.relevance = 1);
    }
    const L = ["of", "and", "for", "in", "not", "or", "if", "then", "parent", "list", "value"];
    function B(e2, t2) {
      return t2 ? Number(t2) : ((e3) => L.includes(e3.toLowerCase()))(e2) ? 0 : 1;
    }
    function I(e2, { plugins: t2 }) {
      function n2(t3, n3) {
        return RegExp(u(t3), "m" + (e2.case_insensitive ? "i" : "") + (n3 ? "g" : ""));
      }
      class s2 {
        constructor() {
          this.matchIndexes = {}, this.regexes = [], this.matchAt = 1, this.position = 0;
        }
        addRule(e3, t3) {
          t3.position = this.position++, this.matchIndexes[this.matchAt] = t3, this.regexes.push([t3, e3]), this.matchAt += ((e4) => RegExp(e4.toString() + "|").exec("").length - 1)(e3) + 1;
        }
        compile() {
          0 === this.regexes.length && (this.exec = () => null);
          const e3 = this.regexes.map((e4) => e4[1]);
          this.matcherRe = n2(((e4, t3 = "|") => {
            const n3 = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;
            let s3 = 0, r3 = "";
            for (let a2 = 0; a2 < e4.length; a2++) {
              s3 += 1;
              const i2 = s3;
              let o2 = u(e4[a2]);
              for (a2 > 0 && (r3 += t3), r3 += "("; o2.length > 0; ) {
                const e5 = n3.exec(o2);
                if (null == e5) {
                  r3 += o2;
                  break;
                }
                r3 += o2.substring(0, e5.index), o2 = o2.substring(e5.index + e5[0].length), "\\" === e5[0][0] && e5[1] ? r3 += "\\" + (Number(e5[1]) + i2) : (r3 += e5[0], "(" === e5[0] && s3++);
              }
              r3 += ")";
            }
            return r3;
          })(e3), true), this.lastIndex = 0;
        }
        exec(e3) {
          this.matcherRe.lastIndex = this.lastIndex;
          const t3 = this.matcherRe.exec(e3);
          if (!t3)
            return null;
          const n3 = t3.findIndex((e4, t4) => t4 > 0 && void 0 !== e4), s3 = this.matchIndexes[n3];
          return t3.splice(0, n3), Object.assign(t3, s3);
        }
      }
      class r2 {
        constructor() {
          this.rules = [], this.multiRegexes = [], this.count = 0, this.lastIndex = 0, this.regexIndex = 0;
        }
        getMatcher(e3) {
          if (this.multiRegexes[e3])
            return this.multiRegexes[e3];
          const t3 = new s2();
          return this.rules.slice(e3).forEach(([e4, n3]) => t3.addRule(e4, n3)), t3.compile(), this.multiRegexes[e3] = t3, t3;
        }
        resumingScanAtSamePosition() {
          return 0 !== this.regexIndex;
        }
        considerAll() {
          this.regexIndex = 0;
        }
        addRule(e3, t3) {
          this.rules.push([e3, t3]), "begin" === t3.type && this.count++;
        }
        exec(e3) {
          const t3 = this.getMatcher(this.regexIndex);
          t3.lastIndex = this.lastIndex;
          let n3 = t3.exec(e3);
          if (this.resumingScanAtSamePosition())
            if (n3 && n3.index === this.lastIndex)
              ;
            else {
              const t4 = this.getMatcher(0);
              t4.lastIndex = this.lastIndex + 1, n3 = t4.exec(e3);
            }
          return n3 && (this.regexIndex += n3.position + 1, this.regexIndex === this.count && this.considerAll()), n3;
        }
      }
      if (e2.compilerExtensions || (e2.compilerExtensions = []), e2.contains && e2.contains.includes("self"))
        throw Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
      return e2.classNameAliases = a(e2.classNameAliases || {}), function t3(s3, i2) {
        const o2 = s3;
        if (s3.compiled)
          return o2;
        [O].forEach((e3) => e3(s3, i2)), e2.compilerExtensions.forEach((e3) => e3(s3, i2)), s3.__beforeBegin = null, [k, M, A].forEach((e3) => e3(s3, i2)), s3.compiled = true;
        let l2 = null;
        if ("object" == typeof s3.keywords && (l2 = s3.keywords.$pattern, delete s3.keywords.$pattern), s3.keywords && (s3.keywords = ((e3, t4) => {
          const n3 = {};
          return "string" == typeof e3 ? s4("keyword", e3) : Object.keys(e3).forEach((t5) => {
            s4(t5, e3[t5]);
          }), n3;
          function s4(e4, s5) {
            t4 && (s5 = s5.toLowerCase()), s5.split(" ").forEach((t5) => {
              const s6 = t5.split("|");
              n3[s6[0]] = [e4, B(s6[0], s6[1])];
            });
          }
        })(s3.keywords, e2.case_insensitive)), s3.lexemes && l2)
          throw Error("ERR: Prefer `keywords.$pattern` to `mode.lexemes`, BOTH are not allowed. (see mode reference) ");
        return l2 = l2 || s3.lexemes || /\w+/, o2.keywordPatternRe = n2(l2, true), i2 && (s3.begin || (s3.begin = /\B|\b/), o2.beginRe = n2(s3.begin), s3.endSameAsBegin && (s3.end = s3.begin), s3.end || s3.endsWithParent || (s3.end = /\B|\b/), s3.end && (o2.endRe = n2(s3.end)), o2.terminatorEnd = u(s3.end) || "", s3.endsWithParent && i2.terminatorEnd && (o2.terminatorEnd += (s3.end ? "|" : "") + i2.terminatorEnd)), s3.illegal && (o2.illegalRe = n2(s3.illegal)), s3.contains || (s3.contains = []), s3.contains = [].concat(...s3.contains.map((e3) => ((e4) => (e4.variants && !e4.cachedVariants && (e4.cachedVariants = e4.variants.map((t4) => a(e4, {
          variants: null
        }, t4))), e4.cachedVariants ? e4.cachedVariants : T(e4) ? a(e4, {
          starts: e4.starts ? a(e4.starts) : null
        }) : Object.isFrozen(e4) ? a(e4) : e4))("self" === e3 ? s3 : e3))), s3.contains.forEach((e3) => {
          t3(e3, o2);
        }), s3.starts && t3(s3.starts, i2), o2.matcher = ((e3) => {
          const t4 = new r2();
          return e3.contains.forEach((e4) => t4.addRule(e4.begin, {
            rule: e4,
            type: "begin"
          })), e3.terminatorEnd && t4.addRule(e3.terminatorEnd, {
            type: "end"
          }), e3.illegal && t4.addRule(e3.illegal, { type: "illegal" }), t4;
        })(o2), o2;
      }(e2);
    }
    function T(e2) {
      return !!e2 && (e2.endsWithParent || T(e2.starts));
    }
    function j(e2) {
      const t2 = {
        props: ["language", "code", "autodetect"],
        data: () => ({
          detectedLanguage: "",
          unknownLanguage: false
        }),
        computed: {
          className() {
            return this.unknownLanguage ? "" : "hljs " + this.detectedLanguage;
          },
          highlighted() {
            if (!this.autoDetect && !e2.getLanguage(this.language))
              return console.warn(`The language "${this.language}" you specified could not be found.`), this.unknownLanguage = true, r(this.code);
            let t3 = {};
            return this.autoDetect ? (t3 = e2.highlightAuto(this.code), this.detectedLanguage = t3.language) : (t3 = e2.highlight(this.language, this.code, this.ignoreIllegals), this.detectedLanguage = this.language), t3.value;
          },
          autoDetect() {
            return !(this.language && (e3 = this.autodetect, !e3 && "" !== e3));
            var e3;
          },
          ignoreIllegals: () => true
        },
        render(e3) {
          return e3("pre", {}, [e3("code", {
            class: this.className,
            domProps: { innerHTML: this.highlighted }
          })]);
        }
      };
      return {
        Component: t2,
        VuePlugin: { install(e3) {
          e3.component("highlightjs", t2);
        } }
      };
    }
    const S = {
      "after:highlightBlock": ({ block: e2, result: t2, text: n2 }) => {
        const s2 = D(e2);
        if (!s2.length)
          return;
        const a2 = document.createElement("div");
        a2.innerHTML = t2.value, t2.value = ((e3, t3, n3) => {
          let s3 = 0, a3 = "";
          const i2 = [];
          function o2() {
            return e3.length && t3.length ? e3[0].offset !== t3[0].offset ? e3[0].offset < t3[0].offset ? e3 : t3 : "start" === t3[0].event ? e3 : t3 : e3.length ? e3 : t3;
          }
          function l2(e4) {
            a3 += "<" + P(e4) + [].map.call(e4.attributes, function(e5) {
              return " " + e5.nodeName + '="' + r(e5.value) + '"';
            }).join("") + ">";
          }
          function c2(e4) {
            a3 += "</" + P(e4) + ">";
          }
          function u2(e4) {
            ("start" === e4.event ? l2 : c2)(e4.node);
          }
          for (; e3.length || t3.length; ) {
            let t4 = o2();
            if (a3 += r(n3.substring(s3, t4[0].offset)), s3 = t4[0].offset, t4 === e3) {
              i2.reverse().forEach(c2);
              do {
                u2(t4.splice(0, 1)[0]), t4 = o2();
              } while (t4 === e3 && t4.length && t4[0].offset === s3);
              i2.reverse().forEach(l2);
            } else
              "start" === t4[0].event ? i2.push(t4[0].node) : i2.pop(), u2(t4.splice(0, 1)[0]);
          }
          return a3 + r(n3.substr(s3));
        })(s2, D(a2), n2);
      }
    };
    function P(e2) {
      return e2.nodeName.toLowerCase();
    }
    function D(e2) {
      const t2 = [];
      return function e3(n2, s2) {
        for (let r2 = n2.firstChild; r2; r2 = r2.nextSibling)
          3 === r2.nodeType ? s2 += r2.nodeValue.length : 1 === r2.nodeType && (t2.push({
            event: "start",
            offset: s2,
            node: r2
          }), s2 = e3(r2, s2), P(r2).match(/br|hr|img|input/) || t2.push({
            event: "stop",
            offset: s2,
            node: r2
          }));
        return s2;
      }(e2, 0), t2;
    }
    const C = (e2) => {
      console.error(e2);
    }, H = (e2, ...t2) => {
      console.log("WARN: " + e2, ...t2);
    }, $ = (e2, t2) => {
      console.log(`Deprecated as of ${e2}. ${t2}`);
    }, U = r, z = a, K = Symbol("nomatch");
    return ((e2) => {
      const n2 = /* @__PURE__ */ Object.create(null), r2 = /* @__PURE__ */ Object.create(null), a2 = [];
      let i2 = true;
      const o2 = /(^(<[^>]+>|\t|)+|\n)/gm, l2 = "Could not find the language '{}', did you forget to load/include a language module?", u2 = {
        disableAutodetect: true,
        name: "Plain text",
        contains: []
      };
      let g2 = {
        noHighlightRe: /^(no-?highlight)$/i,
        languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
        classPrefix: "hljs-",
        tabReplace: null,
        useBR: false,
        languages: null,
        __emitter: c
      };
      function d2(e3) {
        return g2.noHighlightRe.test(e3);
      }
      function h2(e3, t2, n3, s2) {
        const r3 = { code: t2, language: e3 };
        _2("before:highlight", r3);
        const a3 = r3.result ? r3.result : f2(r3.language, r3.code, n3, s2);
        return a3.code = r3.code, _2("after:highlight", a3), a3;
      }
      function f2(e3, t2, r3, o3) {
        const c2 = t2;
        function u3(e4, t3) {
          const n3 = w3.case_insensitive ? t3[0].toLowerCase() : t3[0];
          return Object.prototype.hasOwnProperty.call(e4.keywords, n3) && e4.keywords[n3];
        }
        function d3() {
          null != _3.subLanguage ? (() => {
            if ("" === O2)
              return;
            let e4 = null;
            if ("string" == typeof _3.subLanguage) {
              if (!n2[_3.subLanguage])
                return void M2.addText(O2);
              e4 = f2(_3.subLanguage, O2, true, k2[_3.subLanguage]), k2[_3.subLanguage] = e4.top;
            } else
              e4 = p2(O2, _3.subLanguage.length ? _3.subLanguage : null);
            _3.relevance > 0 && (A2 += e4.relevance), M2.addSublanguage(e4.emitter, e4.language);
          })() : (() => {
            if (!_3.keywords)
              return void M2.addText(O2);
            let e4 = 0;
            _3.keywordPatternRe.lastIndex = 0;
            let t3 = _3.keywordPatternRe.exec(O2), n3 = "";
            for (; t3; ) {
              n3 += O2.substring(e4, t3.index);
              const s2 = u3(_3, t3);
              if (s2) {
                const [e5, r4] = s2;
                M2.addText(n3), n3 = "", A2 += r4;
                const a3 = w3.classNameAliases[e5] || e5;
                M2.addKeyword(t3[0], a3);
              } else
                n3 += t3[0];
              e4 = _3.keywordPatternRe.lastIndex, t3 = _3.keywordPatternRe.exec(O2);
            }
            n3 += O2.substr(e4), M2.addText(n3);
          })(), O2 = "";
        }
        function h3(e4) {
          return e4.className && M2.openNode(w3.classNameAliases[e4.className] || e4.className), _3 = Object.create(e4, { parent: { value: _3 } }), _3;
        }
        function m3(e4, t3, n3) {
          let r4 = ((e5, t4) => {
            const n4 = e5 && e5.exec(t4);
            return n4 && 0 === n4.index;
          })(e4.endRe, n3);
          if (r4) {
            if (e4["on:end"]) {
              const n4 = new s(e4);
              e4["on:end"](t3, n4), n4.ignore && (r4 = false);
            }
            if (r4) {
              for (; e4.endsParent && e4.parent; )
                e4 = e4.parent;
              return e4;
            }
          }
          if (e4.endsWithParent)
            return m3(e4.parent, t3, n3);
        }
        function b3(e4) {
          return 0 === _3.matcher.regexIndex ? (O2 += e4[0], 1) : (T2 = true, 0);
        }
        function x3(e4) {
          const t3 = e4[0], n3 = c2.substr(e4.index), s2 = m3(_3, e4, n3);
          if (!s2)
            return K;
          const r4 = _3;
          r4.skip ? O2 += t3 : (r4.returnEnd || r4.excludeEnd || (O2 += t3), d3(), r4.excludeEnd && (O2 = t3));
          do {
            _3.className && M2.closeNode(), _3.skip || _3.subLanguage || (A2 += _3.relevance), _3 = _3.parent;
          } while (_3 !== s2.parent);
          return s2.starts && (s2.endSameAsBegin && (s2.starts.endRe = s2.endRe), h3(s2.starts)), r4.returnEnd ? 0 : t3.length;
        }
        let E3 = {};
        function v3(t3, n3) {
          const a3 = n3 && n3[0];
          if (O2 += t3, null == a3)
            return d3(), 0;
          if ("begin" === E3.type && "end" === n3.type && E3.index === n3.index && "" === a3) {
            if (O2 += c2.slice(n3.index, n3.index + 1), !i2) {
              const t4 = Error("0 width match regex");
              throw t4.languageName = e3, t4.badRule = E3.rule, t4;
            }
            return 1;
          }
          if (E3 = n3, "begin" === n3.type)
            return function(e4) {
              const t4 = e4[0], n4 = e4.rule, r4 = new s(n4), a4 = [n4.__beforeBegin, n4["on:begin"]];
              for (const n5 of a4)
                if (n5 && (n5(e4, r4), r4.ignore))
                  return b3(t4);
              return n4 && n4.endSameAsBegin && (n4.endRe = RegExp(t4.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "m")), n4.skip ? O2 += t4 : (n4.excludeBegin && (O2 += t4), d3(), n4.returnBegin || n4.excludeBegin || (O2 = t4)), h3(n4), n4.returnBegin ? 0 : t4.length;
            }(n3);
          if ("illegal" === n3.type && !r3) {
            const e4 = Error('Illegal lexeme "' + a3 + '" for mode "' + (_3.className || "<unnamed>") + '"');
            throw e4.mode = _3, e4;
          }
          if ("end" === n3.type) {
            const e4 = x3(n3);
            if (e4 !== K)
              return e4;
          }
          if ("illegal" === n3.type && "" === a3)
            return 1;
          if (B2 > 1e5 && B2 > 3 * n3.index)
            throw Error("potential infinite loop, way more iterations than matches");
          return O2 += a3, a3.length;
        }
        const w3 = N2(e3);
        if (!w3)
          throw C(l2.replace("{}", e3)), Error('Unknown language: "' + e3 + '"');
        const R3 = I(w3, { plugins: a2 });
        let y2 = "", _3 = o3 || R3;
        const k2 = {}, M2 = new g2.__emitter(g2);
        (() => {
          const e4 = [];
          for (let t3 = _3; t3 !== w3; t3 = t3.parent)
            t3.className && e4.unshift(t3.className);
          e4.forEach((e5) => M2.openNode(e5));
        })();
        let O2 = "", A2 = 0, L2 = 0, B2 = 0, T2 = false;
        try {
          for (_3.matcher.considerAll(); ; ) {
            B2++, T2 ? T2 = false : _3.matcher.considerAll(), _3.matcher.lastIndex = L2;
            const e4 = _3.matcher.exec(c2);
            if (!e4)
              break;
            const t3 = v3(c2.substring(L2, e4.index), e4);
            L2 = e4.index + t3;
          }
          return v3(c2.substr(L2)), M2.closeAllNodes(), M2.finalize(), y2 = M2.toHTML(), {
            relevance: A2,
            value: y2,
            language: e3,
            illegal: false,
            emitter: M2,
            top: _3
          };
        } catch (t3) {
          if (t3.message && t3.message.includes("Illegal"))
            return {
              illegal: true,
              illegalBy: {
                msg: t3.message,
                context: c2.slice(L2 - 100, L2 + 100),
                mode: t3.mode
              },
              sofar: y2,
              relevance: 0,
              value: U(c2),
              emitter: M2
            };
          if (i2)
            return {
              illegal: false,
              relevance: 0,
              value: U(c2),
              emitter: M2,
              language: e3,
              top: _3,
              errorRaised: t3
            };
          throw t3;
        }
      }
      function p2(e3, t2) {
        t2 = t2 || g2.languages || Object.keys(n2);
        const s2 = ((e4) => {
          const t3 = {
            relevance: 0,
            emitter: new g2.__emitter(g2),
            value: U(e4),
            illegal: false,
            top: u2
          };
          return t3.emitter.addText(e4), t3;
        })(e3), r3 = t2.filter(N2).filter(R2).map((t3) => f2(t3, e3, false));
        r3.unshift(s2);
        const a3 = r3.sort((e4, t3) => {
          if (e4.relevance !== t3.relevance)
            return t3.relevance - e4.relevance;
          if (e4.language && t3.language) {
            if (N2(e4.language).supersetOf === t3.language)
              return 1;
            if (N2(t3.language).supersetOf === e4.language)
              return -1;
          }
          return 0;
        }), [i3, o3] = a3, l3 = i3;
        return l3.second_best = o3, l3;
      }
      const m2 = { "before:highlightBlock": ({ block: e3 }) => {
        g2.useBR && (e3.innerHTML = e3.innerHTML.replace(/\n/g, "").replace(/<br[ /]*>/g, "\n"));
      }, "after:highlightBlock": ({ result: e3 }) => {
        g2.useBR && (e3.value = e3.value.replace(/\n/g, "<br>"));
      } }, b2 = /^(<[^>]+>|\t)+/gm, x2 = {
        "after:highlightBlock": ({ result: e3 }) => {
          g2.tabReplace && (e3.value = e3.value.replace(b2, (e4) => e4.replace(/\t/g, g2.tabReplace)));
        }
      };
      function E2(e3) {
        let t2 = null;
        const n3 = ((e4) => {
          let t3 = e4.className + " ";
          t3 += e4.parentNode ? e4.parentNode.className : "";
          const n4 = g2.languageDetectRe.exec(t3);
          if (n4) {
            const t4 = N2(n4[1]);
            return t4 || (H(l2.replace("{}", n4[1])), H("Falling back to no-highlight mode for this block.", e4)), t4 ? n4[1] : "no-highlight";
          }
          return t3.split(/\s+/).find((e5) => d2(e5) || N2(e5));
        })(e3);
        if (d2(n3))
          return;
        _2("before:highlightBlock", { block: e3, language: n3 }), t2 = e3;
        const s2 = t2.textContent, a3 = n3 ? h2(n3, s2, true) : p2(s2);
        _2("after:highlightBlock", {
          block: e3,
          result: a3,
          text: s2
        }), e3.innerHTML = a3.value, ((e4, t3, n4) => {
          const s3 = t3 ? r2[t3] : n4;
          e4.classList.add("hljs"), s3 && e4.classList.add(s3);
        })(e3, n3, a3.language), e3.result = {
          language: a3.language,
          re: a3.relevance,
          relavance: a3.relevance
        }, a3.second_best && (e3.second_best = {
          language: a3.second_best.language,
          re: a3.second_best.relevance,
          relavance: a3.second_best.relevance
        });
      }
      const v2 = () => {
        v2.called || (v2.called = true, document.querySelectorAll("pre code").forEach(E2));
      };
      function N2(e3) {
        return e3 = (e3 || "").toLowerCase(), n2[e3] || n2[r2[e3]];
      }
      function w2(e3, { languageName: t2 }) {
        "string" == typeof e3 && (e3 = [e3]), e3.forEach((e4) => {
          r2[e4] = t2;
        });
      }
      function R2(e3) {
        const t2 = N2(e3);
        return t2 && !t2.disableAutodetect;
      }
      function _2(e3, t2) {
        const n3 = e3;
        a2.forEach((e4) => {
          e4[n3] && e4[n3](t2);
        });
      }
      Object.assign(e2, {
        highlight: h2,
        highlightAuto: p2,
        fixMarkup: (e3) => {
          return $("10.2.0", "fixMarkup will be removed entirely in v11.0"), $("10.2.0", "Please see https://github.com/highlightjs/highlight.js/issues/2534"), t2 = e3, g2.tabReplace || g2.useBR ? t2.replace(o2, (e4) => "\n" === e4 ? g2.useBR ? "<br>" : e4 : g2.tabReplace ? e4.replace(/\t/g, g2.tabReplace) : e4) : t2;
          var t2;
        },
        highlightBlock: E2,
        configure: (e3) => {
          e3.useBR && ($("10.3.0", "'useBR' will be removed entirely in v11.0"), $("10.3.0", "Please see https://github.com/highlightjs/highlight.js/issues/2559")), g2 = z(g2, e3);
        },
        initHighlighting: v2,
        initHighlightingOnLoad: () => {
          window.addEventListener("DOMContentLoaded", v2, false);
        },
        registerLanguage: (t2, s2) => {
          let r3 = null;
          try {
            r3 = s2(e2);
          } catch (e3) {
            if (C("Language definition for '{}' could not be registered.".replace("{}", t2)), !i2)
              throw e3;
            C(e3), r3 = u2;
          }
          r3.name || (r3.name = t2), n2[t2] = r3, r3.rawDefinition = s2.bind(null, e2), r3.aliases && w2(r3.aliases, {
            languageName: t2
          });
        },
        listLanguages: () => Object.keys(n2),
        getLanguage: N2,
        registerAliases: w2,
        requireLanguage: (e3) => {
          $("10.4.0", "requireLanguage will be removed entirely in v11."), $("10.4.0", "Please see https://github.com/highlightjs/highlight.js/pull/2844");
          const t2 = N2(e3);
          if (t2)
            return t2;
          throw Error("The '{}' language is required, but not loaded.".replace("{}", e3));
        },
        autoDetection: R2,
        inherit: z,
        addPlugin: (e3) => {
          a2.push(e3);
        },
        vuePlugin: j(e2).VuePlugin
      }), e2.debugMode = () => {
        i2 = false;
      }, e2.safeMode = () => {
        i2 = true;
      }, e2.versionString = "10.5.0";
      for (const e3 in y)
        "object" == typeof y[e3] && t(y[e3]);
      return Object.assign(e2, y), e2.addPlugin(m2), e2.addPlugin(S), e2.addPlugin(x2), e2;
    })({});
  }();
  "object" == typeof exports && "undefined" != typeof module && (module.exports = hljs);
  hljs.registerLanguage("http", (() => {
    "use strict";
    function e(...e2) {
      return e2.map((e3) => {
        return (n = e3) ? "string" == typeof n ? n : n.source : null;
        var n;
      }).join("");
    }
    return (n) => {
      const a = "HTTP/(2|1\\.[01])", s = [{
        className: "attribute",
        begin: e("^", /[A-Za-z][A-Za-z0-9-]*/, "(?=\\:\\s)"),
        starts: { contains: [{
          className: "punctuation",
          begin: /: /,
          relevance: 0,
          starts: { end: "$", relevance: 0 }
        }] }
      }, { begin: "\\n\\n", starts: { subLanguage: [], endsWithParent: true } }];
      return {
        name: "HTTP",
        aliases: ["https"],
        illegal: /\S/,
        contains: [{
          begin: "^(?=" + a + " \\d{3})",
          end: /$/,
          contains: [{ className: "meta", begin: a }, {
            className: "number",
            begin: "\\b\\d{3}\\b"
          }],
          starts: { end: /\b\B/, illegal: /\S/, contains: s }
        }, {
          begin: "(?=^[A-Z]+ (.*?) " + a + "$)",
          end: /$/,
          contains: [{
            className: "string",
            begin: " ",
            end: " ",
            excludeBegin: true,
            excludeEnd: true
          }, { className: "meta", begin: a }, {
            className: "keyword",
            begin: "[A-Z]+"
          }],
          starts: { end: /\b\B/, illegal: /\S/, contains: s }
        }]
      };
    };
  })());
  hljs.registerLanguage("scss", (() => {
    "use strict";
    return (e) => {
      var t = "@[a-z-]+", i = {
        className: "variable",
        begin: "(\\$[a-zA-Z-][a-zA-Z0-9_-]*)\\b"
      }, r = {
        className: "number",
        begin: "#[0-9A-Fa-f]+"
      };
      return e.CSS_NUMBER_MODE, e.QUOTE_STRING_MODE, e.APOS_STRING_MODE, e.C_BLOCK_COMMENT_MODE, {
        name: "SCSS",
        case_insensitive: true,
        illegal: "[=/|']",
        contains: [e.C_LINE_COMMENT_MODE, e.C_BLOCK_COMMENT_MODE, {
          className: "selector-id",
          begin: "#[A-Za-z0-9_-]+",
          relevance: 0
        }, {
          className: "selector-class",
          begin: "\\.[A-Za-z0-9_-]+",
          relevance: 0
        }, {
          className: "selector-attr",
          begin: "\\[",
          end: "\\]",
          illegal: "$"
        }, {
          className: "selector-tag",
          begin: "\\b(a|abbr|acronym|address|area|article|aside|audio|b|base|big|blockquote|body|br|button|canvas|caption|cite|code|col|colgroup|command|datalist|dd|del|details|dfn|div|dl|dt|em|embed|fieldset|figcaption|figure|footer|form|frame|frameset|(h[1-6])|head|header|hgroup|hr|html|i|iframe|img|input|ins|kbd|keygen|label|legend|li|link|map|mark|meta|meter|nav|noframes|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rp|rt|ruby|samp|script|section|select|small|span|strike|strong|style|sub|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|tt|ul|var|video)\\b",
          relevance: 0
        }, {
          className: "selector-pseudo",
          begin: ":(visited|valid|root|right|required|read-write|read-only|out-range|optional|only-of-type|only-child|nth-of-type|nth-last-of-type|nth-last-child|nth-child|not|link|left|last-of-type|last-child|lang|invalid|indeterminate|in-range|hover|focus|first-of-type|first-line|first-letter|first-child|first|enabled|empty|disabled|default|checked|before|after|active)"
        }, {
          className: "selector-pseudo",
          begin: "::(after|before|choices|first-letter|first-line|repeat-index|repeat-item|selection|value)"
        }, i, {
          className: "attribute",
          begin: "\\b(src|z-index|word-wrap|word-spacing|word-break|width|widows|white-space|visibility|vertical-align|unicode-bidi|transition-timing-function|transition-property|transition-duration|transition-delay|transition|transform-style|transform-origin|transform|top|text-underline-position|text-transform|text-shadow|text-rendering|text-overflow|text-indent|text-decoration-style|text-decoration-line|text-decoration-color|text-decoration|text-align-last|text-align|tab-size|table-layout|right|resize|quotes|position|pointer-events|perspective-origin|perspective|page-break-inside|page-break-before|page-break-after|padding-top|padding-right|padding-left|padding-bottom|padding|overflow-y|overflow-x|overflow-wrap|overflow|outline-width|outline-style|outline-offset|outline-color|outline|orphans|order|opacity|object-position|object-fit|normal|none|nav-up|nav-right|nav-left|nav-index|nav-down|min-width|min-height|max-width|max-height|mask|marks|margin-top|margin-right|margin-left|margin-bottom|margin|list-style-type|list-style-position|list-style-image|list-style|line-height|letter-spacing|left|justify-content|initial|inherit|ime-mode|image-orientation|image-resolution|image-rendering|icon|hyphens|height|font-weight|font-variant-ligatures|font-variant|font-style|font-stretch|font-size-adjust|font-size|font-language-override|font-kerning|font-feature-settings|font-family|font|float|flex-wrap|flex-shrink|flex-grow|flex-flow|flex-direction|flex-basis|flex|filter|empty-cells|display|direction|cursor|counter-reset|counter-increment|content|column-width|column-span|column-rule-width|column-rule-style|column-rule-color|column-rule|column-gap|column-fill|column-count|columns|color|clip-path|clip|clear|caption-side|break-inside|break-before|break-after|box-sizing|box-shadow|box-decoration-break|bottom|border-width|border-top-width|border-top-style|border-top-right-radius|border-top-left-radius|border-top-color|border-top|border-style|border-spacing|border-right-width|border-right-style|border-right-color|border-right|border-radius|border-left-width|border-left-style|border-left-color|border-left|border-image-width|border-image-source|border-image-slice|border-image-repeat|border-image-outset|border-image|border-color|border-collapse|border-bottom-width|border-bottom-style|border-bottom-right-radius|border-bottom-left-radius|border-bottom-color|border-bottom|border|background-size|background-repeat|background-position|background-origin|background-image|background-color|background-clip|background-attachment|background-blend-mode|background|backface-visibility|auto|animation-timing-function|animation-play-state|animation-name|animation-iteration-count|animation-fill-mode|animation-duration|animation-direction|animation-delay|animation|align-self|align-items|align-content)\\b",
          illegal: "[^\\s]"
        }, {
          begin: "\\b(whitespace|wait|w-resize|visible|vertical-text|vertical-ideographic|uppercase|upper-roman|upper-alpha|underline|transparent|top|thin|thick|text|text-top|text-bottom|tb-rl|table-header-group|table-footer-group|sw-resize|super|strict|static|square|solid|small-caps|separate|se-resize|scroll|s-resize|rtl|row-resize|ridge|right|repeat|repeat-y|repeat-x|relative|progress|pointer|overline|outside|outset|oblique|nowrap|not-allowed|normal|none|nw-resize|no-repeat|no-drop|newspaper|ne-resize|n-resize|move|middle|medium|ltr|lr-tb|lowercase|lower-roman|lower-alpha|loose|list-item|line|line-through|line-edge|lighter|left|keep-all|justify|italic|inter-word|inter-ideograph|inside|inset|inline|inline-block|inherit|inactive|ideograph-space|ideograph-parenthesis|ideograph-numeric|ideograph-alpha|horizontal|hidden|help|hand|groove|fixed|ellipsis|e-resize|double|dotted|distribute|distribute-space|distribute-letter|distribute-all-lines|disc|disabled|default|decimal|dashed|crosshair|collapse|col-resize|circle|char|center|capitalize|break-word|break-all|bottom|both|bolder|bold|block|bidi-override|below|baseline|auto|always|all-scroll|absolute|table|table-cell)\\b"
        }, {
          begin: ":",
          end: ";",
          contains: [i, r, e.CSS_NUMBER_MODE, e.QUOTE_STRING_MODE, e.APOS_STRING_MODE, {
            className: "meta",
            begin: "!important"
          }]
        }, {
          begin: "@(page|font-face)",
          lexemes: t,
          keywords: "@page @font-face"
        }, {
          begin: "@",
          end: "[{;]",
          returnBegin: true,
          keywords: "and or not only",
          contains: [{
            begin: t,
            className: "keyword"
          }, i, e.QUOTE_STRING_MODE, e.APOS_STRING_MODE, r, e.CSS_NUMBER_MODE]
        }]
      };
    };
  })());
  hljs.registerLanguage("plaintext", (() => {
    "use strict";
    return (t) => ({
      name: "Plain text",
      aliases: ["text", "txt"],
      disableAutodetect: true
    });
  })());
  hljs.registerLanguage("javascript", (() => {
    "use strict";
    const e = "[A-Za-z$_][0-9A-Za-z$_]*", n = ["as", "in", "of", "if", "for", "while", "finally", "var", "new", "function", "do", "return", "void", "else", "break", "catch", "instanceof", "with", "throw", "case", "default", "try", "switch", "continue", "typeof", "delete", "let", "yield", "const", "class", "debugger", "async", "await", "static", "import", "from", "export", "extends"], a = ["true", "false", "null", "undefined", "NaN", "Infinity"], s = [].concat(["setInterval", "setTimeout", "clearInterval", "clearTimeout", "require", "exports", "eval", "isFinite", "isNaN", "parseFloat", "parseInt", "decodeURI", "decodeURIComponent", "encodeURI", "encodeURIComponent", "escape", "unescape"], ["arguments", "this", "super", "console", "window", "document", "localStorage", "module", "global"], ["Intl", "DataView", "Number", "Math", "Date", "String", "RegExp", "Object", "Function", "Boolean", "Error", "Symbol", "Set", "Map", "WeakSet", "WeakMap", "Proxy", "Reflect", "JSON", "Promise", "Float64Array", "Int16Array", "Int32Array", "Int8Array", "Uint16Array", "Uint32Array", "Float32Array", "Array", "Uint8Array", "Uint8ClampedArray", "ArrayBuffer"], ["EvalError", "InternalError", "RangeError", "ReferenceError", "SyntaxError", "TypeError", "URIError"]);
    function r(e2) {
      return i("(?=", e2, ")");
    }
    function i(...e2) {
      return e2.map((e3) => {
        return (n2 = e3) ? "string" == typeof n2 ? n2 : n2.source : null;
        var n2;
      }).join("");
    }
    return (t) => {
      const c = e, o = {
        begin: /<[A-Za-z0-9\\._:-]+/,
        end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
        isTrulyOpeningTag: (e2, n2) => {
          const a2 = e2[0].length + e2.index, s2 = e2.input[a2];
          "<" !== s2 ? ">" === s2 && (((e3, { after: n3 }) => {
            const a3 = "</" + e3[0].slice(1);
            return -1 !== e3.input.indexOf(a3, n3);
          })(e2, {
            after: a2
          }) || n2.ignoreMatch()) : n2.ignoreMatch();
        }
      }, l = {
        $pattern: e,
        keyword: n.join(" "),
        literal: a.join(" "),
        built_in: s.join(" ")
      }, b = "\\.([0-9](_?[0-9])*)", g = "0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*", d = {
        className: "number",
        variants: [{
          begin: `(\\b(${g})((${b})|\\.)?|(${b}))[eE][+-]?([0-9](_?[0-9])*)\\b`
        }, {
          begin: `\\b(${g})\\b((${b})\\b|\\.)?|(${b})\\b`
        }, {
          begin: "\\b(0|[1-9](_?[0-9])*)n\\b"
        }, {
          begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b"
        }, {
          begin: "\\b0[bB][0-1](_?[0-1])*n?\\b"
        }, { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" }, {
          begin: "\\b0[0-7]+n?\\b"
        }],
        relevance: 0
      }, E = {
        className: "subst",
        begin: "\\$\\{",
        end: "\\}",
        keywords: l,
        contains: []
      }, u = { begin: "html`", end: "", starts: {
        end: "`",
        returnEnd: false,
        contains: [t.BACKSLASH_ESCAPE, E],
        subLanguage: "xml"
      } }, _ = {
        begin: "css`",
        end: "",
        starts: {
          end: "`",
          returnEnd: false,
          contains: [t.BACKSLASH_ESCAPE, E],
          subLanguage: "css"
        }
      }, m = {
        className: "string",
        begin: "`",
        end: "`",
        contains: [t.BACKSLASH_ESCAPE, E]
      }, N = {
        className: "comment",
        variants: [t.COMMENT(/\/\*\*(?!\/)/, "\\*/", {
          relevance: 0,
          contains: [{
            className: "doctag",
            begin: "@[A-Za-z]+",
            contains: [{
              className: "type",
              begin: "\\{",
              end: "\\}",
              relevance: 0
            }, {
              className: "variable",
              begin: c + "(?=\\s*(-)|$)",
              endsParent: true,
              relevance: 0
            }, { begin: /(?=[^\n])\s/, relevance: 0 }]
          }]
        }), t.C_BLOCK_COMMENT_MODE, t.C_LINE_COMMENT_MODE]
      }, y = [t.APOS_STRING_MODE, t.QUOTE_STRING_MODE, u, _, m, d, t.REGEXP_MODE];
      E.contains = y.concat({
        begin: /\{/,
        end: /\}/,
        keywords: l,
        contains: ["self"].concat(y)
      });
      const f = [].concat(N, E.contains), A = f.concat([{
        begin: /\(/,
        end: /\)/,
        keywords: l,
        contains: ["self"].concat(f)
      }]), p = {
        className: "params",
        begin: /\(/,
        end: /\)/,
        excludeBegin: true,
        excludeEnd: true,
        keywords: l,
        contains: A
      };
      return {
        name: "Javascript",
        aliases: ["js", "jsx", "mjs", "cjs"],
        keywords: l,
        exports: { PARAMS_CONTAINS: A },
        illegal: /#(?![$_A-z])/,
        contains: [t.SHEBANG({
          label: "shebang",
          binary: "node",
          relevance: 5
        }), {
          label: "use_strict",
          className: "meta",
          relevance: 10,
          begin: /^\s*['"]use (strict|asm)['"]/
        }, t.APOS_STRING_MODE, t.QUOTE_STRING_MODE, u, _, m, N, d, {
          begin: i(/[{,\n]\s*/, r(i(/(((\/\/.*$)|(\/\*(\*[^/]|[^*])*\*\/))\s*)*/, c + "\\s*:"))),
          relevance: 0,
          contains: [{ className: "attr", begin: c + r("\\s*:"), relevance: 0 }]
        }, {
          begin: "(" + t.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
          keywords: "return throw case",
          contains: [N, t.REGEXP_MODE, {
            className: "function",
            begin: "(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|" + t.UNDERSCORE_IDENT_RE + ")\\s*=>",
            returnBegin: true,
            end: "\\s*=>",
            contains: [{ className: "params", variants: [{
              begin: t.UNDERSCORE_IDENT_RE,
              relevance: 0
            }, {
              className: null,
              begin: /\(\s*\)/,
              skip: true
            }, { begin: /\(/, end: /\)/, excludeBegin: true, excludeEnd: true, keywords: l, contains: A }] }]
          }, { begin: /,/, relevance: 0 }, { className: "", begin: /\s/, end: /\s*/, skip: true }, {
            variants: [{ begin: "<>", end: "</>" }, {
              begin: o.begin,
              "on:begin": o.isTrulyOpeningTag,
              end: o.end
            }],
            subLanguage: "xml",
            contains: [{
              begin: o.begin,
              end: o.end,
              skip: true,
              contains: ["self"]
            }]
          }],
          relevance: 0
        }, {
          className: "function",
          beginKeywords: "function",
          end: /[{;]/,
          excludeEnd: true,
          keywords: l,
          contains: ["self", t.inherit(t.TITLE_MODE, { begin: c }), p],
          illegal: /%/
        }, {
          beginKeywords: "while if switch catch for"
        }, {
          className: "function",
          begin: t.UNDERSCORE_IDENT_RE + "\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",
          returnBegin: true,
          contains: [p, t.inherit(t.TITLE_MODE, { begin: c })]
        }, { variants: [{
          begin: "\\." + c
        }, { begin: "\\$" + c }], relevance: 0 }, {
          className: "class",
          beginKeywords: "class",
          end: /[{;=]/,
          excludeEnd: true,
          illegal: /[:"[\]]/,
          contains: [{
            beginKeywords: "extends"
          }, t.UNDERSCORE_TITLE_MODE]
        }, {
          begin: /\b(?=constructor)/,
          end: /[{;]/,
          excludeEnd: true,
          contains: [t.inherit(t.TITLE_MODE, { begin: c }), "self", p]
        }, {
          begin: "(get|set)\\s+(?=" + c + "\\()",
          end: /\{/,
          keywords: "get set",
          contains: [t.inherit(t.TITLE_MODE, { begin: c }), { begin: /\(\)/ }, p]
        }, { begin: /\$[(.]/ }]
      };
    };
  })());
  hljs.registerLanguage("xml", (() => {
    "use strict";
    function e(e2) {
      return e2 ? "string" == typeof e2 ? e2 : e2.source : null;
    }
    function n(e2) {
      return a("(?=", e2, ")");
    }
    function a(...n2) {
      return n2.map((n3) => e(n3)).join("");
    }
    function s(...n2) {
      return "(" + n2.map((n3) => e(n3)).join("|") + ")";
    }
    return (e2) => {
      const t = a(/[A-Z_]/, a("(", /[A-Z0-9_.-]+:/, ")?"), /[A-Z0-9_.-]*/), i = {
        className: "symbol",
        begin: /&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/
      }, r = {
        begin: /\s/,
        contains: [{ className: "meta-keyword", begin: /#?[a-z_][a-z1-9_-]+/, illegal: /\n/ }]
      }, c = e2.inherit(r, { begin: /\(/, end: /\)/ }), l = e2.inherit(e2.APOS_STRING_MODE, {
        className: "meta-string"
      }), g = e2.inherit(e2.QUOTE_STRING_MODE, {
        className: "meta-string"
      }), m = {
        endsWithParent: true,
        illegal: /</,
        relevance: 0,
        contains: [{ className: "attr", begin: /[A-Za-z0-9._:-]+/, relevance: 0 }, {
          begin: /=\s*/,
          relevance: 0,
          contains: [{ className: "string", endsParent: true, variants: [{
            begin: /"/,
            end: /"/,
            contains: [i]
          }, { begin: /'/, end: /'/, contains: [i] }, { begin: /[^\s"'=<>`]+/ }] }]
        }]
      };
      return {
        name: "HTML, XML",
        aliases: ["html", "xhtml", "rss", "atom", "xjb", "xsd", "xsl", "plist", "wsf", "svg"],
        case_insensitive: true,
        contains: [{
          className: "meta",
          begin: /<![a-z]/,
          end: />/,
          relevance: 10,
          contains: [r, g, l, c, { begin: /\[/, end: /\]/, contains: [{
            className: "meta",
            begin: /<![a-z]/,
            end: />/,
            contains: [r, c, g, l]
          }] }]
        }, e2.COMMENT(/<!--/, /-->/, {
          relevance: 10
        }), { begin: /<!\[CDATA\[/, end: /\]\]>/, relevance: 10 }, i, {
          className: "meta",
          begin: /<\?xml/,
          end: /\?>/,
          relevance: 10
        }, {
          className: "tag",
          begin: /<style(?=\s|>)/,
          end: />/,
          keywords: { name: "style" },
          contains: [m],
          starts: {
            end: /<\/style>/,
            returnEnd: true,
            subLanguage: ["css", "xml"]
          }
        }, {
          className: "tag",
          begin: /<script(?=\s|>)/,
          end: />/,
          keywords: { name: "script" },
          contains: [m],
          starts: {
            end: /<\/script>/,
            returnEnd: true,
            subLanguage: ["javascript", "handlebars", "xml"]
          }
        }, {
          className: "tag",
          begin: /<>|<\/>/
        }, {
          className: "tag",
          begin: a(/</, n(a(t, s(/\/>/, />/, /\s/)))),
          end: /\/?>/,
          contains: [{
            className: "name",
            begin: t,
            relevance: 0,
            starts: m
          }]
        }, {
          className: "tag",
          begin: a(/<\//, n(a(t, />/))),
          contains: [{ className: "name", begin: t, relevance: 0 }, { begin: />/, relevance: 0 }]
        }]
      };
    };
  })());
  hljs.registerLanguage("markdown", (() => {
    "use strict";
    function n(...n2) {
      return n2.map((n3) => {
        return (e = n3) ? "string" == typeof e ? e : e.source : null;
        var e;
      }).join("");
    }
    return (e) => {
      const a = {
        begin: /<\/?[A-Za-z_]/,
        end: ">",
        subLanguage: "xml",
        relevance: 0
      }, i = { variants: [{
        begin: /\[.+?\]\[.*?\]/,
        relevance: 0
      }, {
        begin: /\[.+?\]\(((data|javascript|mailto):|(?:http|ftp)s?:\/\/).*?\)/,
        relevance: 2
      }, {
        begin: n(/\[.+?\]\(/, /[A-Za-z][A-Za-z0-9+.-]*/, /:\/\/.*?\)/),
        relevance: 2
      }, { begin: /\[.+?\]\([./?&#].*?\)/, relevance: 1 }, {
        begin: /\[.+?\]\(.*?\)/,
        relevance: 0
      }], returnBegin: true, contains: [{
        className: "string",
        relevance: 0,
        begin: "\\[",
        end: "\\]",
        excludeBegin: true,
        returnEnd: true
      }, {
        className: "link",
        relevance: 0,
        begin: "\\]\\(",
        end: "\\)",
        excludeBegin: true,
        excludeEnd: true
      }, {
        className: "symbol",
        relevance: 0,
        begin: "\\]\\[",
        end: "\\]",
        excludeBegin: true,
        excludeEnd: true
      }] }, s = {
        className: "strong",
        contains: [],
        variants: [{ begin: /_{2}/, end: /_{2}/ }, { begin: /\*{2}/, end: /\*{2}/ }]
      }, c = {
        className: "emphasis",
        contains: [],
        variants: [{ begin: /\*(?!\*)/, end: /\*/ }, {
          begin: /_(?!_)/,
          end: /_/,
          relevance: 0
        }]
      };
      s.contains.push(c), c.contains.push(s);
      let t = [a, i];
      return s.contains = s.contains.concat(t), c.contains = c.contains.concat(t), t = t.concat(s, c), { name: "Markdown", aliases: ["md", "mkdown", "mkd"], contains: [{
        className: "section",
        variants: [{ begin: "^#{1,6}", end: "$", contains: t }, {
          begin: "(?=^.+?\\n[=-]{2,}$)",
          contains: [{ begin: "^[=-]*$" }, {
            begin: "^",
            end: "\\n",
            contains: t
          }]
        }]
      }, a, {
        className: "bullet",
        begin: "^[ 	]*([*+-]|(\\d+\\.))(?=\\s+)",
        end: "\\s+",
        excludeEnd: true
      }, s, c, {
        className: "quote",
        begin: "^>\\s+",
        contains: t,
        end: "$"
      }, { className: "code", variants: [{ begin: "(`{3,})[^`](.|\\n)*?\\1`*[ ]*" }, {
        begin: "(~{3,})[^~](.|\\n)*?\\1~*[ ]*"
      }, { begin: "```", end: "```+[ ]*$" }, {
        begin: "~~~",
        end: "~~~+[ ]*$"
      }, { begin: "`.+?`" }, {
        begin: "(?=^( {4}|\\t))",
        contains: [{ begin: "^( {4}|\\t)", end: "(\\n)$" }],
        relevance: 0
      }] }, {
        begin: "^[-\\*]{3,}",
        end: "$"
      }, i, { begin: /^\[[^\n]+\]:/, returnBegin: true, contains: [{
        className: "symbol",
        begin: /\[/,
        end: /\]/,
        excludeBegin: true,
        excludeEnd: true
      }, {
        className: "link",
        begin: /:\s*/,
        end: /$/,
        excludeBegin: true
      }] }] };
    };
  })());
  hljs.registerLanguage("ruby", (() => {
    "use strict";
    function e(...e2) {
      return e2.map((e3) => {
        return (n = e3) ? "string" == typeof n ? n : n.source : null;
        var n;
      }).join("");
    }
    return (n) => {
      var a, i = "([a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?)", s = {
        keyword: "and then defined module in return redo if BEGIN retry end for self when next until do begin unless END rescue else break undef not super class case require yield alias while ensure elsif or include attr_reader attr_writer attr_accessor __FILE__",
        built_in: "proc lambda",
        literal: "true false nil"
      }, r = {
        className: "doctag",
        begin: "@[A-Za-z]+"
      }, b = { begin: "#<", end: ">" }, t = [n.COMMENT("#", "$", {
        contains: [r]
      }), n.COMMENT("^=begin", "^=end", {
        contains: [r],
        relevance: 10
      }), n.COMMENT("^__END__", "\\n$")], c = {
        className: "subst",
        begin: /#\{/,
        end: /\}/,
        keywords: s
      }, d = { className: "string", contains: [n.BACKSLASH_ESCAPE, c], variants: [{
        begin: /'/,
        end: /'/
      }, { begin: /"/, end: /"/ }, { begin: /`/, end: /`/ }, {
        begin: /%[qQwWx]?\(/,
        end: /\)/
      }, { begin: /%[qQwWx]?\[/, end: /\]/ }, { begin: /%[qQwWx]?\{/, end: /\}/ }, {
        begin: /%[qQwWx]?</,
        end: />/
      }, { begin: /%[qQwWx]?\//, end: /\// }, {
        begin: /%[qQwWx]?%/,
        end: /%/
      }, { begin: /%[qQwWx]?-/, end: /-/ }, { begin: /%[qQwWx]?\|/, end: /\|/ }, {
        begin: /\B\?(\\\d{1,3}|\\x[A-Fa-f0-9]{1,2}|\\u[A-Fa-f0-9]{4}|\\?\S)\b/
      }, {
        begin: /<<[-~]?'?(\w+)\n(?:[^\n]*\n)*?\s*\1\b/,
        returnBegin: true,
        contains: [{
          begin: /<<[-~]?'?/
        }, n.END_SAME_AS_BEGIN({
          begin: /(\w+)/,
          end: /(\w+)/,
          contains: [n.BACKSLASH_ESCAPE, c]
        })]
      }] }, g = "[0-9](_?[0-9])*", l = {
        className: "number",
        relevance: 0,
        variants: [{
          begin: `\\b([1-9](_?[0-9])*|0)(\\.(${g}))?([eE][+-]?(${g})|r)?i?\\b`
        }, {
          begin: "\\b0[dD][0-9](_?[0-9])*r?i?\\b"
        }, {
          begin: "\\b0[bB][0-1](_?[0-1])*r?i?\\b"
        }, { begin: "\\b0[oO][0-7](_?[0-7])*r?i?\\b" }, {
          begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*r?i?\\b"
        }, {
          begin: "\\b0(_?[0-7])+r?i?\\b"
        }]
      }, o = {
        className: "params",
        begin: "\\(",
        end: "\\)",
        endsParent: true,
        keywords: s
      }, _ = [d, {
        className: "class",
        beginKeywords: "class module",
        end: "$|;",
        illegal: /=/,
        contains: [n.inherit(n.TITLE_MODE, {
          begin: "[A-Za-z_]\\w*(::\\w+)*(\\?|!)?"
        }), { begin: "<\\s*", contains: [{
          begin: "(" + n.IDENT_RE + "::)?" + n.IDENT_RE
        }] }].concat(t)
      }, {
        className: "function",
        begin: e(/def\s*/, (a = i + "\\s*(\\(|;|$)", e("(?=", a, ")"))),
        keywords: "def",
        end: "$|;",
        contains: [n.inherit(n.TITLE_MODE, { begin: i }), o].concat(t)
      }, {
        begin: n.IDENT_RE + "::"
      }, { className: "symbol", begin: n.UNDERSCORE_IDENT_RE + "(!|\\?)?:", relevance: 0 }, {
        className: "symbol",
        begin: ":(?!\\s)",
        contains: [d, { begin: i }],
        relevance: 0
      }, l, {
        className: "variable",
        begin: "(\\$\\W)|((\\$|@@?)(\\w+))(?=[^@$?])(?![A-Za-z])(?![@$?'])"
      }, {
        className: "params",
        begin: /\|/,
        end: /\|/,
        relevance: 0,
        keywords: s
      }, {
        begin: "(" + n.RE_STARTERS_RE + "|unless)\\s*",
        keywords: "unless",
        contains: [{
          className: "regexp",
          contains: [n.BACKSLASH_ESCAPE, c],
          illegal: /\n/,
          variants: [{
            begin: "/",
            end: "/[a-z]*"
          }, { begin: /%r\{/, end: /\}[a-z]*/ }, {
            begin: "%r\\(",
            end: "\\)[a-z]*"
          }, { begin: "%r!", end: "![a-z]*" }, { begin: "%r\\[", end: "\\][a-z]*" }]
        }].concat(b, t),
        relevance: 0
      }].concat(b, t);
      c.contains = _, o.contains = _;
      var E = [{
        begin: /^\s*=>/,
        starts: { end: "$", contains: _ }
      }, {
        className: "meta",
        begin: "^([>?]>|[\\w#]+\\(\\w+\\):\\d+:\\d+>|(\\w+-)?\\d+\\.\\d+\\.\\d+(p\\d+)?[^\\d][^>]+>)(?=[ ])",
        starts: { end: "$", contains: _ }
      }];
      return t.unshift(b), {
        name: "Ruby",
        aliases: ["rb", "gemspec", "podspec", "thor", "irb"],
        keywords: s,
        illegal: /\/\*/,
        contains: [n.SHEBANG({ binary: "ruby" })].concat(E).concat(t).concat(_)
      };
    };
  })());
  hljs.registerLanguage("css", (() => {
    "use strict";
    return (e) => {
      var n = "[a-zA-Z-][a-zA-Z0-9_-]*", a = {
        begin: /([*]\s?)?(?:[A-Z_.\-\\]+|--[a-zA-Z0-9_-]+)\s*(\/\*\*\/)?:/,
        returnBegin: true,
        end: ";",
        endsWithParent: true,
        contains: [{
          className: "attribute",
          begin: /\S/,
          end: ":",
          excludeEnd: true,
          starts: {
            endsWithParent: true,
            excludeEnd: true,
            contains: [{
              begin: /[\w-]+\(/,
              returnBegin: true,
              contains: [{
                className: "built_in",
                begin: /[\w-]+/
              }, {
                begin: /\(/,
                end: /\)/,
                contains: [e.APOS_STRING_MODE, e.QUOTE_STRING_MODE, e.CSS_NUMBER_MODE]
              }]
            }, e.CSS_NUMBER_MODE, e.QUOTE_STRING_MODE, e.APOS_STRING_MODE, e.C_BLOCK_COMMENT_MODE, {
              className: "number",
              begin: "#[0-9A-Fa-f]+"
            }, { className: "meta", begin: "!important" }]
          }
        }]
      };
      return {
        name: "CSS",
        case_insensitive: true,
        illegal: /[=|'\$]/,
        contains: [e.C_BLOCK_COMMENT_MODE, {
          className: "selector-id",
          begin: /#[A-Za-z0-9_-]+/
        }, { className: "selector-class", begin: "\\." + n }, {
          className: "selector-attr",
          begin: /\[/,
          end: /\]/,
          illegal: "$",
          contains: [e.APOS_STRING_MODE, e.QUOTE_STRING_MODE]
        }, {
          className: "selector-pseudo",
          begin: /:(:)?[a-zA-Z0-9_+()"'.-]+/
        }, {
          begin: "@(page|font-face)",
          lexemes: "@[a-z-]+",
          keywords: "@page @font-face"
        }, {
          begin: "@",
          end: "[{;]",
          illegal: /:/,
          returnBegin: true,
          contains: [{
            className: "keyword",
            begin: /@-?\w[\w]*(-\w+)*/
          }, {
            begin: /\s/,
            endsWithParent: true,
            excludeEnd: true,
            relevance: 0,
            keywords: "and or not only",
            contains: [{
              begin: /[a-z-]+:/,
              className: "attribute"
            }, e.APOS_STRING_MODE, e.QUOTE_STRING_MODE, e.CSS_NUMBER_MODE]
          }]
        }, { className: "selector-tag", begin: n, relevance: 0 }, {
          begin: /\{/,
          end: /\}/,
          illegal: /\S/,
          contains: [e.C_BLOCK_COMMENT_MODE, { begin: /;/ }, a]
        }]
      };
    };
  })());
  hljs.registerLanguage("json", (() => {
    "use strict";
    return (n) => {
      const e = {
        literal: "true false null"
      }, i = [n.C_LINE_COMMENT_MODE, n.C_BLOCK_COMMENT_MODE], a = [n.QUOTE_STRING_MODE, n.C_NUMBER_MODE], l = {
        end: ",",
        endsWithParent: true,
        excludeEnd: true,
        contains: a,
        keywords: e
      }, t = {
        begin: /\{/,
        end: /\}/,
        contains: [{
          className: "attr",
          begin: /"/,
          end: /"/,
          contains: [n.BACKSLASH_ESCAPE],
          illegal: "\\n"
        }, n.inherit(l, {
          begin: /:/
        })].concat(i),
        illegal: "\\S"
      }, s = {
        begin: "\\[",
        end: "\\]",
        contains: [n.inherit(l)],
        illegal: "\\S"
      };
      return a.push(t, s), i.forEach((n2) => {
        a.push(n2);
      }), {
        name: "JSON",
        contains: a,
        keywords: e,
        illegal: "\\S"
      };
    };
  })());
  hljs.registerLanguage("yaml", (() => {
    "use strict";
    return (e) => {
      var n = "true false yes no null", a = "[\\w#;/?:@&=+$,.~*'()[\\]]+", s = {
        className: "string",
        relevance: 0,
        variants: [{ begin: /'/, end: /'/ }, {
          begin: /"/,
          end: /"/
        }, { begin: /\S+/ }],
        contains: [e.BACKSLASH_ESCAPE, {
          className: "template-variable",
          variants: [{ begin: /\{\{/, end: /\}\}/ }, { begin: /%\{/, end: /\}/ }]
        }]
      }, i = e.inherit(s, {
        variants: [{ begin: /'/, end: /'/ }, { begin: /"/, end: /"/ }, { begin: /[^\s,{}[\]]+/ }]
      }), l = {
        end: ",",
        endsWithParent: true,
        excludeEnd: true,
        contains: [],
        keywords: n,
        relevance: 0
      }, t = {
        begin: /\{/,
        end: /\}/,
        contains: [l],
        illegal: "\\n",
        relevance: 0
      }, g = {
        begin: "\\[",
        end: "\\]",
        contains: [l],
        illegal: "\\n",
        relevance: 0
      }, b = [{
        className: "attr",
        variants: [{ begin: "\\w[\\w :\\/.-]*:(?=[ 	]|$)" }, {
          begin: '"\\w[\\w :\\/.-]*":(?=[ 	]|$)'
        }, {
          begin: "'\\w[\\w :\\/.-]*':(?=[ 	]|$)"
        }]
      }, { className: "meta", begin: "^---\\s*$", relevance: 10 }, {
        className: "string",
        begin: "[\\|>]([1-9]?[+-])?[ ]*\\n( +)[^ ][^\\n]*\\n(\\2[^\\n]+\\n?)*"
      }, {
        begin: "<%[%=-]?",
        end: "[%-]?%>",
        subLanguage: "ruby",
        excludeBegin: true,
        excludeEnd: true,
        relevance: 0
      }, { className: "type", begin: "!\\w+!" + a }, {
        className: "type",
        begin: "!<" + a + ">"
      }, { className: "type", begin: "!" + a }, {
        className: "type",
        begin: "!!" + a
      }, { className: "meta", begin: "&" + e.UNDERSCORE_IDENT_RE + "$" }, {
        className: "meta",
        begin: "\\*" + e.UNDERSCORE_IDENT_RE + "$"
      }, {
        className: "bullet",
        begin: "-(?=[ ]|$)",
        relevance: 0
      }, e.HASH_COMMENT_MODE, { beginKeywords: n, keywords: { literal: n } }, {
        className: "number",
        begin: "\\b[0-9]{4}(-[0-9][0-9]){0,2}([Tt \\t][0-9][0-9]?(:[0-9][0-9]){2})?(\\.[0-9]*)?([ \\t])*(Z|[-+][0-9][0-9]?(:[0-9][0-9])?)?\\b"
      }, { className: "number", begin: e.C_NUMBER_RE + "\\b", relevance: 0 }, t, g, s], r = [...b];
      return r.pop(), r.push(i), l.contains = r, {
        name: "YAML",
        case_insensitive: true,
        aliases: ["yml", "YAML"],
        contains: b
      };
    };
  })());
  hljs.registerLanguage("swift", (() => {
    "use strict";
    function e(e2) {
      return e2 ? "string" == typeof e2 ? e2 : e2.source : null;
    }
    function n(e2) {
      return i("(?=", e2, ")");
    }
    function i(...n2) {
      return n2.map((n3) => e(n3)).join("");
    }
    function a(...n2) {
      return "(" + n2.map((n3) => e(n3)).join("|") + ")";
    }
    const t = (e2) => i(/\b/, e2, /\w$/.test(e2) ? /\b/ : /\B/), u = ["Protocol", "Type"].map(t), s = ["init", "self"].map(t), r = ["Any", "Self"], o = ["associatedtype", /as\?/, /as!/, "as", "break", "case", "catch", "class", "continue", "convenience", "default", "defer", "deinit", "didSet", "do", "dynamic", "else", "enum", "extension", "fallthrough", "fileprivate(set)", "fileprivate", "final", "for", "func", "get", "guard", "if", "import", "indirect", "infix", /init\?/, /init!/, "inout", "internal(set)", "internal", "in", "is", "lazy", "let", "mutating", "nonmutating", "open(set)", "open", "operator", "optional", "override", "postfix", "precedencegroup", "prefix", "private(set)", "private", "protocol", "public(set)", "public", "repeat", "required", "rethrows", "return", "set", "some", "static", "struct", "subscript", "super", "switch", "throws", "throw", /try\?/, /try!/, "try", "typealias", "unowned(safe)", "unowned(unsafe)", "unowned", "var", "weak", "where", "while", "willSet"], l = ["false", "nil", "true"], c = ["#colorLiteral", "#column", "#dsohandle", "#else", "#elseif", "#endif", "#error", "#file", "#fileID", "#fileLiteral", "#filePath", "#function", "#if", "#imageLiteral", "#keyPath", "#line", "#selector", "#sourceLocation", "#warn_unqualified_access", "#warning"], b = ["abs", "all", "any", "assert", "assertionFailure", "debugPrint", "dump", "fatalError", "getVaList", "isKnownUniquelyReferenced", "max", "min", "numericCast", "pointwiseMax", "pointwiseMin", "precondition", "preconditionFailure", "print", "readLine", "repeatElement", "sequence", "stride", "swap", "swift_unboxFromSwiftValueWithType", "transcode", "type", "unsafeBitCast", "unsafeDowncast", "withExtendedLifetime", "withUnsafeMutablePointer", "withUnsafePointer", "withVaList", "withoutActuallyEscaping", "zip"], p = a(/[/=\-+!*%<>&|^~?]/, /[\u00A1-\u00A7]/, /[\u00A9\u00AB]/, /[\u00AC\u00AE]/, /[\u00B0\u00B1]/, /[\u00B6\u00BB\u00BF\u00D7\u00F7]/, /[\u2016-\u2017]/, /[\u2020-\u2027]/, /[\u2030-\u203E]/, /[\u2041-\u2053]/, /[\u2055-\u205E]/, /[\u2190-\u23FF]/, /[\u2500-\u2775]/, /[\u2794-\u2BFF]/, /[\u2E00-\u2E7F]/, /[\u3001-\u3003]/, /[\u3008-\u3020]/, /[\u3030]/), F = a(p, /[\u0300-\u036F]/, /[\u1DC0-\u1DFF]/, /[\u20D0-\u20FF]/, /[\uFE00-\uFE0F]/, /[\uFE20-\uFE2F]/), d = i(p, F, "*"), g = a(/[a-zA-Z_]/, /[\u00A8\u00AA\u00AD\u00AF\u00B2-\u00B5\u00B7-\u00BA]/, /[\u00BC-\u00BE\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]/, /[\u0100-\u02FF\u0370-\u167F\u1681-\u180D\u180F-\u1DBF]/, /[\u1E00-\u1FFF]/, /[\u200B-\u200D\u202A-\u202E\u203F-\u2040\u2054\u2060-\u206F]/, /[\u2070-\u20CF\u2100-\u218F\u2460-\u24FF\u2776-\u2793]/, /[\u2C00-\u2DFF\u2E80-\u2FFF]/, /[\u3004-\u3007\u3021-\u302F\u3031-\u303F\u3040-\uD7FF]/, /[\uF900-\uFD3D\uFD40-\uFDCF\uFDF0-\uFE1F\uFE30-\uFE44]/, /[\uFE47-\uFFFD]/), f = a(g, /\d/, /[\u0300-\u036F\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/), m = i(g, f, "*"), w = i(/[A-Z]/, f, "*"), E = ["autoclosure", i(/convention\(/, a("swift", "block", "c"), /\)/), "discardableResult", "dynamicCallable", "dynamicMemberLookup", "escaping", "frozen", "GKInspectable", "IBAction", "IBDesignable", "IBInspectable", "IBOutlet", "IBSegueAction", "inlinable", "main", "nonobjc", "NSApplicationMain", "NSCopying", "NSManaged", i(/objc\(/, m, /\)/), "objc", "objcMembers", "propertyWrapper", "requires_stored_property_inits", "testable", "UIApplicationMain", "unknown", "usableFromInline"], y = ["iOS", "iOSApplicationExtension", "macOS", "macOSApplicationExtension", "macCatalyst", "macCatalystApplicationExtension", "watchOS", "watchOSApplicationExtension", "tvOS", "tvOSApplicationExtension", "swift"];
    return (e2) => {
      const p2 = e2.COMMENT("/\\*", "\\*/", { contains: ["self"] }), g2 = {
        className: "keyword",
        begin: i(/\./, n(a(...u, ...s))),
        end: a(...u, ...s),
        excludeBegin: true
      }, A = {
        begin: i(/\./, a(...o)),
        relevance: 0
      }, C = o.filter((e3) => "string" == typeof e3).concat(["_|0"]), v = { variants: [{
        className: "keyword",
        begin: a(...o.filter((e3) => "string" != typeof e3).concat(r).map(t), ...s)
      }] }, _ = {
        $pattern: a(/\b\w+(\(\w+\))?/, /#\w+/),
        keyword: C.concat(c).join(" "),
        literal: l.join(" ")
      }, N = [g2, A, v], D = [{ begin: i(/\./, a(...b)), relevance: 0 }, {
        className: "built_in",
        begin: i(/\b/, a(...b), /(?=\()/)
      }], B = {
        begin: /->/,
        relevance: 0
      }, M = [B, { className: "operator", relevance: 0, variants: [{ begin: d }, {
        begin: `\\.(\\.|${F})+`
      }] }], h = "([0-9a-fA-F]_*)+", S = {
        className: "number",
        relevance: 0,
        variants: [{
          begin: "\\b(([0-9]_*)+)(\\.(([0-9]_*)+))?([eE][+-]?(([0-9]_*)+))?\\b"
        }, {
          begin: `\\b0x(${h})(\\.(${h}))?([pP][+-]?(([0-9]_*)+))?\\b`
        }, {
          begin: /\b0o([0-7]_*)+\b/
        }, { begin: /\b0b([01]_*)+\b/ }]
      }, O = (e3 = "") => ({
        className: "subst",
        variants: [{ begin: i(/\\/, e3, /[0\\tnr"']/) }, {
          begin: i(/\\/, e3, /u\{[0-9a-fA-F]{1,8}\}/)
        }]
      }), x = (e3 = "") => ({
        className: "subst",
        begin: i(/\\/, e3, /[\t ]*(?:[\r\n]|\r\n)/)
      }), k = (e3 = "") => ({
        className: "subst",
        label: "interpol",
        begin: i(/\\/, e3, /\(/),
        end: /\)/
      }), L = (e3 = "") => ({
        begin: i(e3, /"""/),
        end: i(/"""/, e3),
        contains: [O(e3), x(e3), k(e3)]
      }), I = (e3 = "") => ({
        begin: i(e3, /"/),
        end: i(/"/, e3),
        contains: [O(e3), k(e3)]
      }), $ = {
        className: "string",
        variants: [L(), L("#"), L("##"), L("###"), I(), I("#"), I("##"), I("###")]
      }, T = [{
        begin: i(/`/, m, /`/)
      }, { className: "variable", begin: /\$\d+/ }, {
        className: "variable",
        begin: `\\$${f}+`
      }], j = [{
        begin: /(@|#)available\(/,
        end: /\)/,
        keywords: {
          $pattern: /[@#]?\w+/,
          keyword: y.concat(["@available", "#available"]).join(" ")
        },
        contains: [...M, S, $]
      }, { className: "keyword", begin: i(/@/, a(...E)) }, {
        className: "meta",
        begin: i(/@/, m)
      }], K = { begin: n(/\b[A-Z]/), relevance: 0, contains: [{
        className: "type",
        begin: i(/(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)/, f, "+")
      }, { className: "type", begin: w, relevance: 0 }, { begin: /[?!]+/, relevance: 0 }, {
        begin: /\.\.\./,
        relevance: 0
      }, { begin: i(/\s+&\s+/, n(w)), relevance: 0 }] }, P = {
        begin: /</,
        end: />/,
        keywords: _,
        contains: [...N, ...j, B, K]
      };
      K.contains.push(P);
      for (const e3 of $.variants) {
        const n2 = e3.contains.find((e4) => "interpol" === e4.label);
        n2.keywords = _;
        const i2 = [...N, ...D, ...M, S, $, ...T];
        n2.contains = [...i2, {
          begin: /\(/,
          end: /\)/,
          contains: ["self", ...i2]
        }];
      }
      return {
        name: "Swift",
        keywords: _,
        contains: [e2.C_LINE_COMMENT_MODE, p2, {
          className: "function",
          beginKeywords: "func",
          end: /\{/,
          excludeEnd: true,
          contains: [e2.inherit(e2.TITLE_MODE, {
            begin: /[A-Za-z$_][0-9A-Za-z$_]*/
          }), { begin: /</, end: />/ }, {
            className: "params",
            begin: /\(/,
            end: /\)/,
            endsParent: true,
            keywords: _,
            contains: ["self", ...N, S, $, e2.C_BLOCK_COMMENT_MODE, { begin: ":" }],
            illegal: /["']/
          }],
          illegal: /\[|%/
        }, {
          className: "class",
          beginKeywords: "struct protocol class extension enum",
          end: "\\{",
          excludeEnd: true,
          keywords: _,
          contains: [e2.inherit(e2.TITLE_MODE, {
            begin: /[A-Za-z$_][\u00C0-\u02B80-9A-Za-z$_]*/
          }), ...N]
        }, {
          beginKeywords: "import",
          end: /$/,
          contains: [e2.C_LINE_COMMENT_MODE, p2],
          relevance: 0
        }, ...N, ...D, ...M, S, $, ...T, ...j, K]
      };
    };
  })());
  hljs.registerLanguage("sql", (() => {
    "use strict";
    function e(e2) {
      return e2 ? "string" == typeof e2 ? e2 : e2.source : null;
    }
    function r(...r2) {
      return r2.map((r3) => e(r3)).join("");
    }
    function t(...r2) {
      return "(" + r2.map((r3) => e(r3)).join("|") + ")";
    }
    return (e2) => {
      const n = e2.COMMENT("--", "$"), a = ["true", "false", "unknown"], i = ["bigint", "binary", "blob", "boolean", "char", "character", "clob", "date", "dec", "decfloat", "decimal", "float", "int", "integer", "interval", "nchar", "nclob", "national", "numeric", "real", "row", "smallint", "time", "timestamp", "varchar", "varying", "varbinary"], s = ["abs", "acos", "array_agg", "asin", "atan", "avg", "cast", "ceil", "ceiling", "coalesce", "corr", "cos", "cosh", "count", "covar_pop", "covar_samp", "cume_dist", "dense_rank", "deref", "element", "exp", "extract", "first_value", "floor", "json_array", "json_arrayagg", "json_exists", "json_object", "json_objectagg", "json_query", "json_table", "json_table_primitive", "json_value", "lag", "last_value", "lead", "listagg", "ln", "log", "log10", "lower", "max", "min", "mod", "nth_value", "ntile", "nullif", "percent_rank", "percentile_cont", "percentile_disc", "position", "position_regex", "power", "rank", "regr_avgx", "regr_avgy", "regr_count", "regr_intercept", "regr_r2", "regr_slope", "regr_sxx", "regr_sxy", "regr_syy", "row_number", "sin", "sinh", "sqrt", "stddev_pop", "stddev_samp", "substring", "substring_regex", "sum", "tan", "tanh", "translate", "translate_regex", "treat", "trim", "trim_array", "unnest", "upper", "value_of", "var_pop", "var_samp", "width_bucket"], o = ["create table", "insert into", "primary key", "foreign key", "not null", "alter table", "add constraint", "grouping sets", "on overflow", "character set", "respect nulls", "ignore nulls", "nulls first", "nulls last", "depth first", "breadth first"], c = s, l = ["abs", "acos", "all", "allocate", "alter", "and", "any", "are", "array", "array_agg", "array_max_cardinality", "as", "asensitive", "asin", "asymmetric", "at", "atan", "atomic", "authorization", "avg", "begin", "begin_frame", "begin_partition", "between", "bigint", "binary", "blob", "boolean", "both", "by", "call", "called", "cardinality", "cascaded", "case", "cast", "ceil", "ceiling", "char", "char_length", "character", "character_length", "check", "classifier", "clob", "close", "coalesce", "collate", "collect", "column", "commit", "condition", "connect", "constraint", "contains", "convert", "copy", "corr", "corresponding", "cos", "cosh", "count", "covar_pop", "covar_samp", "create", "cross", "cube", "cume_dist", "current", "current_catalog", "current_date", "current_default_transform_group", "current_path", "current_role", "current_row", "current_schema", "current_time", "current_timestamp", "current_path", "current_role", "current_transform_group_for_type", "current_user", "cursor", "cycle", "date", "day", "deallocate", "dec", "decimal", "decfloat", "declare", "default", "define", "delete", "dense_rank", "deref", "describe", "deterministic", "disconnect", "distinct", "double", "drop", "dynamic", "each", "element", "else", "empty", "end", "end_frame", "end_partition", "end-exec", "equals", "escape", "every", "except", "exec", "execute", "exists", "exp", "external", "extract", "false", "fetch", "filter", "first_value", "float", "floor", "for", "foreign", "frame_row", "free", "from", "full", "function", "fusion", "get", "global", "grant", "group", "grouping", "groups", "having", "hold", "hour", "identity", "in", "indicator", "initial", "inner", "inout", "insensitive", "insert", "int", "integer", "intersect", "intersection", "interval", "into", "is", "join", "json_array", "json_arrayagg", "json_exists", "json_object", "json_objectagg", "json_query", "json_table", "json_table_primitive", "json_value", "lag", "language", "large", "last_value", "lateral", "lead", "leading", "left", "like", "like_regex", "listagg", "ln", "local", "localtime", "localtimestamp", "log", "log10", "lower", "match", "match_number", "match_recognize", "matches", "max", "member", "merge", "method", "min", "minute", "mod", "modifies", "module", "month", "multiset", "national", "natural", "nchar", "nclob", "new", "no", "none", "normalize", "not", "nth_value", "ntile", "null", "nullif", "numeric", "octet_length", "occurrences_regex", "of", "offset", "old", "omit", "on", "one", "only", "open", "or", "order", "out", "outer", "over", "overlaps", "overlay", "parameter", "partition", "pattern", "per", "percent", "percent_rank", "percentile_cont", "percentile_disc", "period", "portion", "position", "position_regex", "power", "precedes", "precision", "prepare", "primary", "procedure", "ptf", "range", "rank", "reads", "real", "recursive", "ref", "references", "referencing", "regr_avgx", "regr_avgy", "regr_count", "regr_intercept", "regr_r2", "regr_slope", "regr_sxx", "regr_sxy", "regr_syy", "release", "result", "return", "returns", "revoke", "right", "rollback", "rollup", "row", "row_number", "rows", "running", "savepoint", "scope", "scroll", "search", "second", "seek", "select", "sensitive", "session_user", "set", "show", "similar", "sin", "sinh", "skip", "smallint", "some", "specific", "specifictype", "sql", "sqlexception", "sqlstate", "sqlwarning", "sqrt", "start", "static", "stddev_pop", "stddev_samp", "submultiset", "subset", "substring", "substring_regex", "succeeds", "sum", "symmetric", "system", "system_time", "system_user", "table", "tablesample", "tan", "tanh", "then", "time", "timestamp", "timezone_hour", "timezone_minute", "to", "trailing", "translate", "translate_regex", "translation", "treat", "trigger", "trim", "trim_array", "true", "truncate", "uescape", "union", "unique", "unknown", "unnest", "update   ", "upper", "user", "using", "value", "values", "value_of", "var_pop", "var_samp", "varbinary", "varchar", "varying", "versioning", "when", "whenever", "where", "width_bucket", "window", "with", "within", "without", "year", "add", "asc", "collation", "desc", "final", "first", "last", "view"].filter((e3) => !s.includes(e3)), u = {
        begin: r(/\b/, t(...c), /\s*\(/),
        keywords: { built_in: c.join(" ") }
      };
      return {
        name: "SQL",
        case_insensitive: true,
        illegal: /[{}]|<\//,
        keywords: {
          $pattern: /\b[\w\.]+/,
          keyword: ((e3, { exceptions: r2, when: t2 } = {}) => {
            const n2 = t2;
            return r2 = r2 || [], e3.map((e4) => e4.match(/\|\d+$/) || r2.includes(e4) ? e4 : n2(e4) ? e4 + "|0" : e4);
          })(l, { when: (e3) => e3.length < 3 }).join(" "),
          literal: a.join(" "),
          type: i.join(" "),
          built_in: "current_catalog current_date current_default_transform_group current_path current_role current_schema current_transform_group_for_type current_user session_user system_time system_user current_time localtime current_timestamp localtimestamp"
        },
        contains: [{ begin: t(...o), keywords: {
          $pattern: /[\w\.]+/,
          keyword: l.concat(o).join(" "),
          literal: a.join(" "),
          type: i.join(" ")
        } }, {
          className: "type",
          begin: t("double precision", "large object", "with timezone", "without timezone")
        }, u, { className: "variable", begin: /@[a-z0-9]+/ }, { className: "string", variants: [{
          begin: /'/,
          end: /'/,
          contains: [{ begin: /''/ }]
        }] }, { begin: /"/, end: /"/, contains: [{
          begin: /""/
        }] }, e2.C_NUMBER_MODE, e2.C_BLOCK_COMMENT_MODE, n, {
          className: "operator",
          begin: /[-+*/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?/,
          relevance: 0
        }]
      };
    };
  })());
  var highlight_10_5_0_default = hljs;

  // controllers/article_controller.js
  var article_controller_default = class extends Controller {
    connect() {
      this.element.querySelectorAll("pre").forEach(function(pre) {
        highlight_10_5_0_default.highlightBlock(pre);
      });
    }
  };

  // controllers/attachment_picker_controller.js
  var attachment_picker_controller_exports = {};
  __export(attachment_picker_controller_exports, {
    default: () => attachment_picker_controller_default
  });
  var attachment_picker_controller_default = class extends Controller {
    static get targets() {
      return ["signedBlobId", "filename"];
    }
    pick(event) {
      let select = event.currentTarget;
      let option2 = select.options[select.selectedIndex];
      this.signedBlobIdTarget.value = option2.dataset.signedBlobId || "";
      this.filenameTarget.value = option2.dataset.filename || "";
    }
  };

  // controllers/autofocus_controller.js
  var autofocus_controller_exports = {};
  __export(autofocus_controller_exports, {
    default: () => autofocus_controller_default
  });
  var autofocus_controller_default = class extends Controller {
    connect() {
      this.element.focus();
    }
  };

  // controllers/button_controller.js
  var button_controller_exports = {};
  __export(button_controller_exports, {
    default: () => button_controller_default
  });
  var button_controller_default = class extends Controller {
    connect() {
      this.element[this.identifier] = this;
    }
    doneLoading() {
      this.element.style.width = "auto";
      this.element.innerHTML = this.originalHTML;
    }
    loading() {
      this.element.style.width = `${this.element.offsetWidth}px`;
      this.originalHTML = this.element.innerHTML;
      this.element.innerHTML = `
			<svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
			${this.element.dataset.loadingMessage}
		`;
    }
    get originalHTML() {
      return this.original_html;
    }
    set originalHTML(html) {
      this.original_html = html;
    }
  };

  // controllers/confetti_controller.js
  var confetti_controller_exports = {};
  __export(confetti_controller_exports, {
    default: () => confetti_controller_default
  });

  // libraries/canvas-confetti@1.3.2.js
  var module2 = {};
  (function main(global2, module3, isWorker, workerSize) {
    var canUseWorker = !!(global2.Worker && global2.Blob && global2.Promise && global2.OffscreenCanvas && global2.OffscreenCanvasRenderingContext2D && global2.HTMLCanvasElement && global2.HTMLCanvasElement.prototype.transferControlToOffscreen && global2.URL && global2.URL.createObjectURL);
    function noop() {
    }
    function promise(func) {
      var ModulePromise = module3.exports.Promise;
      var Prom = ModulePromise !== void 0 ? ModulePromise : global2.Promise;
      if (typeof Prom === "function") {
        return new Prom(func);
      }
      func(noop, noop);
      return null;
    }
    var raf = function() {
      var TIME = Math.floor(1e3 / 60);
      var frame, cancel;
      var frames = {};
      var lastFrameTime = 0;
      if (typeof requestAnimationFrame === "function" && typeof cancelAnimationFrame === "function") {
        frame = function(cb) {
          var id = Math.random();
          frames[id] = requestAnimationFrame(function onFrame(time) {
            if (lastFrameTime === time || lastFrameTime + TIME - 1 < time) {
              lastFrameTime = time;
              delete frames[id];
              cb();
            } else {
              frames[id] = requestAnimationFrame(onFrame);
            }
          });
          return id;
        };
        cancel = function(id) {
          if (frames[id]) {
            cancelAnimationFrame(frames[id]);
          }
        };
      } else {
        frame = function(cb) {
          return setTimeout(cb, TIME);
        };
        cancel = function(timer) {
          return clearTimeout(timer);
        };
      }
      return { frame, cancel };
    }();
    var getWorker = function() {
      var worker;
      var prom;
      var resolves = {};
      function decorate(worker2) {
        function execute(options, callback) {
          worker2.postMessage({ options: options || {}, callback });
        }
        worker2.init = function initWorker(canvas) {
          var offscreen = canvas.transferControlToOffscreen();
          worker2.postMessage({ canvas: offscreen }, [offscreen]);
        };
        worker2.fire = function fireWorker(options, size, done) {
          if (prom) {
            execute(options, null);
            return prom;
          }
          var id = Math.random().toString(36).slice(2);
          prom = promise(function(resolve) {
            function workerDone(msg) {
              if (msg.data.callback !== id) {
                return;
              }
              delete resolves[id];
              worker2.removeEventListener("message", workerDone);
              prom = null;
              done();
              resolve();
            }
            worker2.addEventListener("message", workerDone);
            execute(options, id);
            resolves[id] = workerDone.bind(null, { data: { callback: id } });
          });
          return prom;
        };
        worker2.reset = function resetWorker() {
          worker2.postMessage({ reset: true });
          for (var id in resolves) {
            resolves[id]();
            delete resolves[id];
          }
        };
      }
      return function() {
        if (worker) {
          return worker;
        }
        if (!isWorker && canUseWorker) {
          var code3 = [
            "var CONFETTI, SIZE = {}, module = {};",
            "(" + main.toString() + ")(this, module, true, SIZE);",
            "onmessage = function(msg) {",
            "  if (msg.data.options) {",
            "    CONFETTI(msg.data.options).then(function () {",
            "      if (msg.data.callback) {",
            "        postMessage({ callback: msg.data.callback });",
            "      }",
            "    });",
            "  } else if (msg.data.reset) {",
            "    CONFETTI.reset();",
            "  } else if (msg.data.resize) {",
            "    SIZE.width = msg.data.resize.width;",
            "    SIZE.height = msg.data.resize.height;",
            "  } else if (msg.data.canvas) {",
            "    SIZE.width = msg.data.canvas.width;",
            "    SIZE.height = msg.data.canvas.height;",
            "    CONFETTI = module.exports.create(msg.data.canvas);",
            "  }",
            "}"
          ].join("\n");
          try {
            worker = new Worker(URL.createObjectURL(new Blob([code3])));
          } catch (e) {
            typeof console !== void 0 && typeof console.warn === "function" ? console.warn("\u{1F38A} Could not load worker", e) : null;
            return null;
          }
          decorate(worker);
        }
        return worker;
      };
    }();
    var defaults2 = {
      particleCount: 50,
      angle: 90,
      spread: 45,
      startVelocity: 45,
      decay: 0.9,
      gravity: 1,
      ticks: 200,
      x: 0.5,
      y: 0.5,
      shapes: ["square", "circle"],
      zIndex: 100,
      colors: [
        "#26ccff",
        "#a25afd",
        "#ff5e7e",
        "#88ff5a",
        "#fcff42",
        "#ffa62d",
        "#ff36ff"
      ],
      // probably should be true, but back-compat
      disableForReducedMotion: false,
      scalar: 1
    };
    function convert(val, transform) {
      return transform ? transform(val) : val;
    }
    function isOk(val) {
      return !(val === null || val === void 0);
    }
    function prop(options, name, transform) {
      return convert(
        options && isOk(options[name]) ? options[name] : defaults2[name],
        transform
      );
    }
    function onlyPositiveInt(number) {
      return number < 0 ? 0 : Math.floor(number);
    }
    function randomInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    }
    function toDecimal(str) {
      return parseInt(str, 16);
    }
    function hexToRgb(str) {
      var val = String(str).replace(/[^0-9a-f]/gi, "");
      if (val.length < 6) {
        val = val[0] + val[0] + val[1] + val[1] + val[2] + val[2];
      }
      return {
        r: toDecimal(val.substring(0, 2)),
        g: toDecimal(val.substring(2, 4)),
        b: toDecimal(val.substring(4, 6))
      };
    }
    function getOrigin(options) {
      var origin = prop(options, "origin", Object);
      origin.x = prop(origin, "x", Number);
      origin.y = prop(origin, "y", Number);
      return origin;
    }
    function setCanvasWindowSize(canvas) {
      canvas.width = document.documentElement.clientWidth;
      canvas.height = document.documentElement.clientHeight;
    }
    function setCanvasRectSize(canvas) {
      var rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    function getCanvas(zIndex) {
      var canvas = document.createElement("canvas");
      canvas.style.position = "fixed";
      canvas.style.top = "0px";
      canvas.style.left = "0px";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = zIndex;
      return canvas;
    }
    function ellipse(context, x, y, radiusX, radiusY, rotation, startAngle, endAngle, antiClockwise) {
      context.save();
      context.translate(x, y);
      context.rotate(rotation);
      context.scale(radiusX, radiusY);
      context.arc(0, 0, 1, startAngle, endAngle, antiClockwise);
      context.restore();
    }
    function randomPhysics(opts) {
      var radAngle = opts.angle * (Math.PI / 180);
      var radSpread = opts.spread * (Math.PI / 180);
      return {
        x: opts.x,
        y: opts.y,
        wobble: Math.random() * 10,
        velocity: opts.startVelocity * 0.5 + Math.random() * opts.startVelocity,
        angle2D: -radAngle + (0.5 * radSpread - Math.random() * radSpread),
        tiltAngle: Math.random() * Math.PI,
        color: hexToRgb(opts.color),
        shape: opts.shape,
        tick: 0,
        totalTicks: opts.ticks,
        decay: opts.decay,
        random: Math.random() + 5,
        tiltSin: 0,
        tiltCos: 0,
        wobbleX: 0,
        wobbleY: 0,
        gravity: opts.gravity * 3,
        ovalScalar: 0.6,
        scalar: opts.scalar
      };
    }
    function updateFetti(context, fetti) {
      fetti.x += Math.cos(fetti.angle2D) * fetti.velocity;
      fetti.y += Math.sin(fetti.angle2D) * fetti.velocity + fetti.gravity;
      fetti.wobble += 0.1;
      fetti.velocity *= fetti.decay;
      fetti.tiltAngle += 0.1;
      fetti.tiltSin = Math.sin(fetti.tiltAngle);
      fetti.tiltCos = Math.cos(fetti.tiltAngle);
      fetti.random = Math.random() + 5;
      fetti.wobbleX = fetti.x + 10 * fetti.scalar * Math.cos(fetti.wobble);
      fetti.wobbleY = fetti.y + 10 * fetti.scalar * Math.sin(fetti.wobble);
      var progress = fetti.tick++ / fetti.totalTicks;
      var x1 = fetti.x + fetti.random * fetti.tiltCos;
      var y1 = fetti.y + fetti.random * fetti.tiltSin;
      var x2 = fetti.wobbleX + fetti.random * fetti.tiltCos;
      var y2 = fetti.wobbleY + fetti.random * fetti.tiltSin;
      context.fillStyle = "rgba(" + fetti.color.r + ", " + fetti.color.g + ", " + fetti.color.b + ", " + (1 - progress) + ")";
      context.beginPath();
      if (fetti.shape === "circle") {
        context.ellipse ? context.ellipse(fetti.x, fetti.y, Math.abs(x2 - x1) * fetti.ovalScalar, Math.abs(y2 - y1) * fetti.ovalScalar, Math.PI / 10 * fetti.wobble, 0, 2 * Math.PI) : ellipse(context, fetti.x, fetti.y, Math.abs(x2 - x1) * fetti.ovalScalar, Math.abs(y2 - y1) * fetti.ovalScalar, Math.PI / 10 * fetti.wobble, 0, 2 * Math.PI);
      } else {
        context.moveTo(Math.floor(fetti.x), Math.floor(fetti.y));
        context.lineTo(Math.floor(fetti.wobbleX), Math.floor(y1));
        context.lineTo(Math.floor(x2), Math.floor(y2));
        context.lineTo(Math.floor(x1), Math.floor(fetti.wobbleY));
      }
      context.closePath();
      context.fill();
      return fetti.tick < fetti.totalTicks;
    }
    function animate(canvas, fettis, resizer, size, done) {
      var animatingFettis = fettis.slice();
      var context = canvas.getContext("2d");
      var animationFrame;
      var destroy2;
      var prom = promise(function(resolve) {
        function onDone() {
          animationFrame = destroy2 = null;
          context.clearRect(0, 0, size.width, size.height);
          done();
          resolve();
        }
        function update() {
          if (isWorker && !(size.width === workerSize.width && size.height === workerSize.height)) {
            size.width = canvas.width = workerSize.width;
            size.height = canvas.height = workerSize.height;
          }
          if (!size.width && !size.height) {
            resizer(canvas);
            size.width = canvas.width;
            size.height = canvas.height;
          }
          context.clearRect(0, 0, size.width, size.height);
          animatingFettis = animatingFettis.filter(function(fetti) {
            return updateFetti(context, fetti);
          });
          if (animatingFettis.length) {
            animationFrame = raf.frame(update);
          } else {
            onDone();
          }
        }
        animationFrame = raf.frame(update);
        destroy2 = onDone;
      });
      return {
        addFettis: function(fettis2) {
          animatingFettis = animatingFettis.concat(fettis2);
          return prom;
        },
        canvas,
        promise: prom,
        reset: function() {
          if (animationFrame) {
            raf.cancel(animationFrame);
          }
          if (destroy2) {
            destroy2();
          }
        }
      };
    }
    function confettiCannon(canvas, globalOpts) {
      var isLibCanvas = !canvas;
      var allowResize = !!prop(globalOpts || {}, "resize");
      var globalDisableForReducedMotion = prop(globalOpts, "disableForReducedMotion", Boolean);
      var shouldUseWorker = canUseWorker && !!prop(globalOpts || {}, "useWorker");
      var worker = shouldUseWorker ? getWorker() : null;
      var resizer = isLibCanvas ? setCanvasWindowSize : setCanvasRectSize;
      var initialized = canvas && worker ? !!canvas.__confetti_initialized : false;
      var preferLessMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion)").matches;
      var animationObj;
      function fireLocal(options, size, done) {
        var particleCount = prop(options, "particleCount", onlyPositiveInt);
        var angle = prop(options, "angle", Number);
        var spread = prop(options, "spread", Number);
        var startVelocity = prop(options, "startVelocity", Number);
        var decay = prop(options, "decay", Number);
        var gravity = prop(options, "gravity", Number);
        var colors = prop(options, "colors");
        var ticks = prop(options, "ticks", Number);
        var shapes = prop(options, "shapes");
        var scalar = prop(options, "scalar");
        var origin = getOrigin(options);
        var temp = particleCount;
        var fettis = [];
        var startX = canvas.width * origin.x;
        var startY = canvas.height * origin.y;
        while (temp--) {
          fettis.push(
            randomPhysics({
              x: startX,
              y: startY,
              angle,
              spread,
              startVelocity,
              color: colors[temp % colors.length],
              shape: shapes[randomInt(0, shapes.length)],
              ticks,
              decay,
              gravity,
              scalar
            })
          );
        }
        if (animationObj) {
          return animationObj.addFettis(fettis);
        }
        animationObj = animate(canvas, fettis, resizer, size, done);
        return animationObj.promise;
      }
      function fire(options) {
        var disableForReducedMotion = globalDisableForReducedMotion || prop(options, "disableForReducedMotion", Boolean);
        var zIndex = prop(options, "zIndex", Number);
        if (disableForReducedMotion && preferLessMotion) {
          return promise(function(resolve) {
            resolve();
          });
        }
        if (isLibCanvas && animationObj) {
          canvas = animationObj.canvas;
        } else if (isLibCanvas && !canvas) {
          canvas = getCanvas(zIndex);
          document.body.appendChild(canvas);
        }
        if (allowResize && !initialized) {
          resizer(canvas);
        }
        var size = {
          width: canvas.width,
          height: canvas.height
        };
        if (worker && !initialized) {
          worker.init(canvas);
        }
        initialized = true;
        if (worker) {
          canvas.__confetti_initialized = true;
        }
        function onResize() {
          if (worker) {
            var obj = {
              getBoundingClientRect: function() {
                if (!isLibCanvas) {
                  return canvas.getBoundingClientRect();
                }
              }
            };
            resizer(obj);
            worker.postMessage({
              resize: {
                width: obj.width,
                height: obj.height
              }
            });
            return;
          }
          size.width = size.height = null;
        }
        function done() {
          animationObj = null;
          if (allowResize) {
            global2.removeEventListener("resize", onResize);
          }
          if (isLibCanvas && canvas) {
            document.body.removeChild(canvas);
            canvas = null;
            initialized = false;
          }
        }
        if (allowResize) {
          global2.addEventListener("resize", onResize, false);
        }
        if (worker) {
          return worker.fire(options, size, done);
        }
        return fireLocal(options, size, done);
      }
      fire.reset = function() {
        if (worker) {
          worker.reset();
        }
        if (animationObj) {
          animationObj.reset();
        }
      };
      return fire;
    }
    module3.exports = confettiCannon(null, { useWorker: true, resize: true });
    module3.exports.create = confettiCannon;
  })(function() {
    if (typeof window !== "undefined") {
      return window;
    }
    if (typeof self !== "undefined") {
      return self;
    }
    return this;
  }(), module2, false);
  var canvas_confetti_1_3_2_default = module2.exports;
  var create = module2.exports.create;

  // controllers/confetti_controller.js
  var confetti_controller_default = class extends Controller {
    connect() {
      if (this.canvas == void 0)
        this.createCanvas();
      let canvas = this.canvas;
      this.confetti = canvas_confetti_1_3_2_default.create(canvas, { resize: true });
      this.fire(0.25, { spread: 26, startVelocity: 55 });
      this.fire(0.2, { spread: 60 });
      this.fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      this.fire(0.1, { speed: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      this.fire(0.1, { speed: 120, startVelocity: 45 });
      setTimeout(function() {
        document.body.removeChild(canvas);
      }, 5e3);
    }
    fire(particleRatio, options) {
      let count = 200;
      let defaults2 = { origin: { y: 0.7 } };
      this.confetti(Object.assign({}, defaults2, options, {
        particleCount: Math.floor(count * particleRatio)
      }));
    }
    createCanvas() {
      document.body.insertAdjacentHTML("beforeend", `<canvas id="confetti" class="fixed inset-0 w-full h-full pointer-events-none z-50"></canvas>`);
    }
    get canvas() {
      return document.querySelector("#confetti");
    }
  };

  // controllers/confirm_controller.js
  var confirm_controller_exports = {};
  __export(confirm_controller_exports, {
    default: () => confirm_controller_default
  });
  var confirm_controller_default = class extends Controller {
    connect() {
      this.element.addEventListener("submit", this.confirm.bind(this));
    }
    confirm(event) {
      event.stopPropagation();
      event.preventDefault();
      this.turboFrame.innerHTML = this.modalHTML;
    }
    get modalHTML() {
      return `<div class="modal" data-controller="modal shortcuts" data-action="keyup@document->shortcuts#confirmClick keyup@document->modal#escClose">
      <button type="button" class="cursor-default w-full h-full fixed inset-0 bg-gray-700 bg-opacity-25 animate__animated animate__fadeIn animate__faster" tabindex="-1" data-action="modal#close"></button>
      <div class="modal-window animate__animated animate__zoomIn animate__fadeIn animate__faster p-5 max-w-xs">
        <div class="text-center">
          ${this.message}
        </div>
        
        <div class="flex flex-row-reverse mt-3">
        
          ${this.formHTML}
          
          <button class="btn btn-gray mt-2 md:mt-0 md:w-1/2" data-action="modal#close">Cancel</button>
        </div>
      </div>
    </div>`;
    }
    get message() {
      return this.element.dataset.confirmMessage;
    }
    get formHTML() {
      let element = document.createRange().createContextualFragment(this.element.outerHTML);
      let form = element.querySelector("form");
      let button = element.querySelector('input[type="submit"], button[type="submit"]');
      form.removeAttribute("data-controller");
      form.dataset.turboFrame = "_top";
      form.dataset.action = "turbo:submit-end->modal#close";
      form.className = "mt-6 md:mt-0 md:w-1/2 md:ml-3";
      button.className = "btn btn-red w-full";
      button.dataset.shortcutsTarget = "confirm";
      button.innerText = "Delete";
      button.value = "Delete";
      let div = document.createElement("div");
      div.appendChild(form);
      return div.innerHTML;
    }
    get turboFrame() {
      return document.querySelector('turbo-frame[id="modal"]');
    }
  };

  // controllers/delegate_click_controller.js
  var delegate_click_controller_exports = {};
  __export(delegate_click_controller_exports, {
    default: () => delegate_click_controller_default
  });
  var delegate_click_controller_default = class extends Controller {
    click() {
      this.targetElement.click();
    }
    get targetElement() {
      return document.querySelector(this.element.dataset.delegateClickTarget);
    }
  };

  // controllers/embed_controller.js
  var embed_controller_exports = {};
  __export(embed_controller_exports, {
    default: () => embed_controller_default
  });
  var embed_controller_default = class extends Controller {
    static get targets() {
      return ["html"];
    }
    insertEmbeddable(event) {
      this.trixEditor.insertEmbeddable(event.detail.html);
    }
    get trixEditor() {
      return document.getElementById(this.element.dataset.trixTarget).trix;
    }
  };

  // controllers/embed_tag_controller.js
  var embed_tag_controller_exports = {};
  __export(embed_tag_controller_exports, {
    default: () => embed_tag_controller_default
  });
  var embed_tag_controller_default = class extends Controller {
    connect() {
      let event = new CustomEvent("embed-tag:embedded", this.eventOptions);
      this.element.dispatchEvent(event);
    }
    get eventOptions() {
      let clone2 = this.element.cloneNode(true);
      clone2.removeAttribute("data-controller");
      return { bubbles: true, detail: { html: clone2.outerHTML } };
    }
  };

  // controllers/exists_controller.js
  var exists_controller_exports = {};
  __export(exists_controller_exports, {
    default: () => exists_controller_default
  });
  var exists_controller_default = class extends Controller {
    connect() {
      const event = document.createEvent("CustomEvent");
      event.initCustomEvent("exists", true, true, null);
      this.element.dispatchEvent(event);
    }
  };

  // controllers/form_controller.js
  var form_controller_exports = {};
  __export(form_controller_exports, {
    default: () => form_controller_default
  });

  // libraries/debounce.js
  function debounce(func, wait, immediate) {
    var timeout, args, context, timestamp, result;
    if (null == wait)
      wait = 100;
    function later() {
      var last = Date.now() - timestamp;
      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    }
    ;
    var debounced = function() {
      context = this;
      args = arguments;
      timestamp = Date.now();
      var callNow = immediate && !timeout;
      if (!timeout)
        timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }
      return result;
    };
    debounced.clear = function() {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
    };
    debounced.flush = function() {
      if (timeout) {
        result = func.apply(context, args);
        context = args = null;
        clearTimeout(timeout);
        timeout = null;
      }
    };
    return debounced;
  }

  // libraries/form-request-submit-polyfill@2.0.0.js
  (function(prototype) {
    if (typeof prototype.requestSubmit == "function")
      return;
    prototype.requestSubmit = function(submitter) {
      if (submitter) {
        validateSubmitter(submitter, this);
        submitter.click();
      } else {
        submitter = document.createElement("input");
        submitter.type = "submit";
        submitter.hidden = true;
        this.appendChild(submitter);
        submitter.click();
        this.removeChild(submitter);
      }
    };
    function validateSubmitter(submitter, form) {
      submitter instanceof HTMLElement || raise(TypeError, "parameter 1 is not of type 'HTMLElement'");
      submitter.type == "submit" || raise(TypeError, "The specified element is not a submit button");
      submitter.form == form || raise(DOMException, "The specified element is not owned by this form element", "NotFoundError");
    }
    function raise(errorConstructor, message, name) {
      throw new errorConstructor("Failed to execute 'requestSubmit' on 'HTMLFormElement': " + message + ".", name);
    }
  })(HTMLFormElement.prototype);

  // controllers/form_controller.js
  var form_controller_default = class extends Controller {
    submitForm = debounce(function() {
      this.element.requestSubmit();
    }.bind(this), this.debounceTime);
    requestSubmit() {
      this.submitForm();
    }
    submit() {
      this.submitForm();
    }
    get debounceTime() {
      return this.element.dataset.debounceTime || 0;
    }
  };

  // controllers/hotkeys_controller.js
  var hotkeys_controller_exports = {};
  __export(hotkeys_controller_exports, {
    default: () => hotkeys_controller_default
  });

  // libraries/hotkeys@3.8.7.js
  var isff = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase().indexOf("firefox") > 0 : false;
  function addEvent(object, event, method) {
    if (object.addEventListener) {
      object.addEventListener(event, method, false);
    } else if (object.attachEvent) {
      object.attachEvent("on".concat(event), function() {
        method(window.event);
      });
    }
  }
  function getMods(modifier, key) {
    var mods = key.slice(0, key.length - 1);
    for (var i = 0; i < mods.length; i++) {
      mods[i] = modifier[mods[i].toLowerCase()];
    }
    return mods;
  }
  function getKeys(key) {
    if (typeof key !== "string")
      key = "";
    key = key.replace(/\s/g, "");
    var keys = key.split(",");
    var index2 = keys.lastIndexOf("");
    for (; index2 >= 0; ) {
      keys[index2 - 1] += ",";
      keys.splice(index2, 1);
      index2 = keys.lastIndexOf("");
    }
    return keys;
  }
  function compareArray(a1, a2) {
    var arr1 = a1.length >= a2.length ? a1 : a2;
    var arr2 = a1.length >= a2.length ? a2 : a1;
    var isIndex = true;
    for (var i = 0; i < arr1.length; i++) {
      if (arr2.indexOf(arr1[i]) === -1)
        isIndex = false;
    }
    return isIndex;
  }
  var _keyMap = {
    backspace: 8,
    tab: 9,
    clear: 12,
    enter: 13,
    return: 13,
    esc: 27,
    escape: 27,
    space: 32,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    del: 46,
    delete: 46,
    ins: 45,
    insert: 45,
    home: 36,
    end: 35,
    pageup: 33,
    pagedown: 34,
    capslock: 20,
    num_0: 96,
    num_1: 97,
    num_2: 98,
    num_3: 99,
    num_4: 100,
    num_5: 101,
    num_6: 102,
    num_7: 103,
    num_8: 104,
    num_9: 105,
    num_multiply: 106,
    num_add: 107,
    num_enter: 108,
    num_subtract: 109,
    num_decimal: 110,
    num_divide: 111,
    "\u21EA": 20,
    ",": 188,
    ".": 190,
    "/": 191,
    "`": 192,
    "-": isff ? 173 : 189,
    "=": isff ? 61 : 187,
    ";": isff ? 59 : 186,
    "'": 222,
    "[": 219,
    "]": 221,
    "\\": 220
  };
  var _modifier = {
    // shiftKey
    "\u21E7": 16,
    shift: 16,
    // altKey
    "\u2325": 18,
    alt: 18,
    option: 18,
    // ctrlKey
    "\u2303": 17,
    ctrl: 17,
    control: 17,
    // metaKey
    "\u2318": 91,
    cmd: 91,
    command: 91
  };
  var modifierMap = {
    16: "shiftKey",
    18: "altKey",
    17: "ctrlKey",
    91: "metaKey",
    shiftKey: 16,
    ctrlKey: 17,
    altKey: 18,
    metaKey: 91
  };
  var _mods = {
    16: false,
    18: false,
    17: false,
    91: false
  };
  var _handlers = {};
  for (k = 1; k < 20; k++) {
    _keyMap["f".concat(k)] = 111 + k;
  }
  var k;
  var _downKeys = [];
  var _scope = "all";
  var elementHasBindEvent = [];
  var code = function code2(x) {
    return _keyMap[x.toLowerCase()] || _modifier[x.toLowerCase()] || x.toUpperCase().charCodeAt(0);
  };
  function setScope(scope) {
    _scope = scope || "all";
  }
  function getScope() {
    return _scope || "all";
  }
  function getPressedKeyCodes() {
    return _downKeys.slice(0);
  }
  function filter(event) {
    var target = event.target || event.srcElement;
    var tagName = target.tagName;
    var flag = true;
    if (target.isContentEditable || (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") && !target.readOnly) {
      flag = false;
    }
    return flag;
  }
  function isPressed(keyCode) {
    if (typeof keyCode === "string") {
      keyCode = code(keyCode);
    }
    return _downKeys.indexOf(keyCode) !== -1;
  }
  function deleteScope(scope, newScope) {
    var handlers;
    var i;
    if (!scope)
      scope = getScope();
    for (var key in _handlers) {
      if (Object.prototype.hasOwnProperty.call(_handlers, key)) {
        handlers = _handlers[key];
        for (i = 0; i < handlers.length; ) {
          if (handlers[i].scope === scope)
            handlers.splice(i, 1);
          else
            i++;
        }
      }
    }
    if (getScope() === scope)
      setScope(newScope || "all");
  }
  function clearModifier(event) {
    var key = event.keyCode || event.which || event.charCode;
    var i = _downKeys.indexOf(key);
    if (i >= 0) {
      _downKeys.splice(i, 1);
    }
    if (event.key && event.key.toLowerCase() === "meta") {
      _downKeys.splice(0, _downKeys.length);
    }
    if (key === 93 || key === 224)
      key = 91;
    if (key in _mods) {
      _mods[key] = false;
      for (var k in _modifier) {
        if (_modifier[k] === key)
          hotkeys[k] = false;
      }
    }
  }
  function unbind(keysInfo) {
    if (!keysInfo) {
      Object.keys(_handlers).forEach(function(key) {
        return delete _handlers[key];
      });
    } else if (Array.isArray(keysInfo)) {
      keysInfo.forEach(function(info) {
        if (info.key)
          eachUnbind(info);
      });
    } else if (typeof keysInfo === "object") {
      if (keysInfo.key)
        eachUnbind(keysInfo);
    } else if (typeof keysInfo === "string") {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      var scope = args[0], method = args[1];
      if (typeof scope === "function") {
        method = scope;
        scope = "";
      }
      eachUnbind({
        key: keysInfo,
        scope,
        method,
        splitKey: "+"
      });
    }
  }
  var eachUnbind = function eachUnbind2(_ref) {
    var key = _ref.key, scope = _ref.scope, method = _ref.method, _ref$splitKey = _ref.splitKey, splitKey = _ref$splitKey === void 0 ? "+" : _ref$splitKey;
    var multipleKeys = getKeys(key);
    multipleKeys.forEach(function(originKey) {
      var unbindKeys = originKey.split(splitKey);
      var len = unbindKeys.length;
      var lastKey = unbindKeys[len - 1];
      var keyCode = lastKey === "*" ? "*" : code(lastKey);
      if (!_handlers[keyCode])
        return;
      if (!scope)
        scope = getScope();
      var mods = len > 1 ? getMods(_modifier, unbindKeys) : [];
      _handlers[keyCode] = _handlers[keyCode].map(function(record) {
        var isMatchingMethod = method ? record.method === method : true;
        if (isMatchingMethod && record.scope === scope && compareArray(record.mods, mods)) {
          return {};
        }
        return record;
      });
    });
  };
  function eventHandler(event, handler, scope) {
    var modifiersMatch;
    if (handler.scope === scope || handler.scope === "all") {
      modifiersMatch = handler.mods.length > 0;
      for (var y in _mods) {
        if (Object.prototype.hasOwnProperty.call(_mods, y)) {
          if (!_mods[y] && handler.mods.indexOf(+y) > -1 || _mods[y] && handler.mods.indexOf(+y) === -1) {
            modifiersMatch = false;
          }
        }
      }
      if (handler.mods.length === 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91] || modifiersMatch || handler.shortcut === "*") {
        if (handler.method(event, handler) === false) {
          if (event.preventDefault)
            event.preventDefault();
          else
            event.returnValue = false;
          if (event.stopPropagation)
            event.stopPropagation();
          if (event.cancelBubble)
            event.cancelBubble = true;
        }
      }
    }
  }
  function dispatch2(event) {
    var asterisk = _handlers["*"];
    var key = event.keyCode || event.which || event.charCode;
    if (!hotkeys.filter.call(this, event))
      return;
    if (key === 93 || key === 224)
      key = 91;
    if (_downKeys.indexOf(key) === -1 && key !== 229)
      _downKeys.push(key);
    ["ctrlKey", "altKey", "shiftKey", "metaKey"].forEach(function(keyName) {
      var keyNum = modifierMap[keyName];
      if (event[keyName] && _downKeys.indexOf(keyNum) === -1) {
        _downKeys.push(keyNum);
      } else if (!event[keyName] && _downKeys.indexOf(keyNum) > -1) {
        _downKeys.splice(_downKeys.indexOf(keyNum), 1);
      } else if (keyName === "metaKey" && event[keyName] && _downKeys.length === 3) {
        if (!(event.ctrlKey || event.shiftKey || event.altKey)) {
          _downKeys = _downKeys.slice(_downKeys.indexOf(keyNum));
        }
      }
    });
    if (key in _mods) {
      _mods[key] = true;
      for (var k in _modifier) {
        if (_modifier[k] === key)
          hotkeys[k] = true;
      }
      if (!asterisk)
        return;
    }
    for (var e in _mods) {
      if (Object.prototype.hasOwnProperty.call(_mods, e)) {
        _mods[e] = event[modifierMap[e]];
      }
    }
    if (event.getModifierState && !(event.altKey && !event.ctrlKey) && event.getModifierState("AltGraph")) {
      if (_downKeys.indexOf(17) === -1) {
        _downKeys.push(17);
      }
      if (_downKeys.indexOf(18) === -1) {
        _downKeys.push(18);
      }
      _mods[17] = true;
      _mods[18] = true;
    }
    var scope = getScope();
    if (asterisk) {
      for (var i = 0; i < asterisk.length; i++) {
        if (asterisk[i].scope === scope && (event.type === "keydown" && asterisk[i].keydown || event.type === "keyup" && asterisk[i].keyup)) {
          eventHandler(event, asterisk[i], scope);
        }
      }
    }
    if (!(key in _handlers))
      return;
    for (var _i = 0; _i < _handlers[key].length; _i++) {
      if (event.type === "keydown" && _handlers[key][_i].keydown || event.type === "keyup" && _handlers[key][_i].keyup) {
        if (_handlers[key][_i].key) {
          var record = _handlers[key][_i];
          var splitKey = record.splitKey;
          var keyShortcut = record.key.split(splitKey);
          var _downKeysCurrent = [];
          for (var a = 0; a < keyShortcut.length; a++) {
            _downKeysCurrent.push(code(keyShortcut[a]));
          }
          if (_downKeysCurrent.sort().join("") === _downKeys.sort().join("")) {
            eventHandler(event, record, scope);
          }
        }
      }
    }
  }
  function isElementBind(element) {
    return elementHasBindEvent.indexOf(element) > -1;
  }
  function hotkeys(key, option2, method) {
    _downKeys = [];
    var keys = getKeys(key);
    var mods = [];
    var scope = "all";
    var element = document;
    var i = 0;
    var keyup = false;
    var keydown = true;
    var splitKey = "+";
    if (method === void 0 && typeof option2 === "function") {
      method = option2;
    }
    if (Object.prototype.toString.call(option2) === "[object Object]") {
      if (option2.scope)
        scope = option2.scope;
      if (option2.element)
        element = option2.element;
      if (option2.keyup)
        keyup = option2.keyup;
      if (option2.keydown !== void 0)
        keydown = option2.keydown;
      if (typeof option2.splitKey === "string")
        splitKey = option2.splitKey;
    }
    if (typeof option2 === "string")
      scope = option2;
    for (; i < keys.length; i++) {
      key = keys[i].split(splitKey);
      mods = [];
      if (key.length > 1)
        mods = getMods(_modifier, key);
      key = key[key.length - 1];
      key = key === "*" ? "*" : code(key);
      if (!(key in _handlers))
        _handlers[key] = [];
      _handlers[key].push({
        keyup,
        keydown,
        scope,
        mods,
        shortcut: keys[i],
        method,
        key: keys[i],
        splitKey
      });
    }
    if (typeof element !== "undefined" && !isElementBind(element) && window) {
      elementHasBindEvent.push(element);
      addEvent(element, "keydown", function(e) {
        dispatch2(e);
      });
      addEvent(window, "focus", function() {
        _downKeys = [];
      });
      addEvent(element, "keyup", function(e) {
        dispatch2(e);
        clearModifier(e);
      });
    }
  }
  var _api = {
    setScope,
    getScope,
    deleteScope,
    getPressedKeyCodes,
    isPressed,
    filter,
    unbind
  };
  for (a in _api) {
    if (Object.prototype.hasOwnProperty.call(_api, a)) {
      hotkeys[a] = _api[a];
    }
  }
  var a;
  if (typeof window !== "undefined") {
    _hotkeys = window.hotkeys;
    hotkeys.noConflict = function(deep) {
      if (deep && window.hotkeys === hotkeys) {
        window.hotkeys = _hotkeys;
      }
      return hotkeys;
    };
    window.hotkeys = hotkeys;
  }
  var _hotkeys;
  var hotkeys_3_8_7_default = hotkeys;

  // controllers/hotkeys_controller.js
  var hotkeys_controller_default = class extends Controller {
    static get targets() {
      return ["button"];
    }
    connect() {
      hotkeys_3_8_7_default(this.element.dataset.hotkeys, this.handleHotkeys.bind(this));
      hotkeys_3_8_7_default.filter = (event) => true;
    }
    handleHotkeys(event, handler) {
      event.preventDefault();
      if (this.hasButtonTarget) {
        this.buttonTarget.click();
      }
    }
  };

  // controllers/image_collection_controller.js
  var image_collection_controller_exports = {};
  __export(image_collection_controller_exports, {
    default: () => image_collection_controller_default
  });

  // libraries/sortablejs@1.13.0.js
  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function(obj2) {
        return typeof obj2;
      };
    } else {
      _typeof = function(obj2) {
        return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
      };
    }
    return _typeof(obj);
  }
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _extends() {
    _extends = Object.assign || function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends.apply(this, arguments);
  }
  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);
      if (typeof Object.getOwnPropertySymbols === "function") {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }
      ownKeys.forEach(function(key) {
        _defineProperty(target, key, source[key]);
      });
    }
    return target;
  }
  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null)
      return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;
    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0)
        continue;
      target[key] = source[key];
    }
    return target;
  }
  function _objectWithoutProperties(source, excluded) {
    if (source == null)
      return {};
    var target = _objectWithoutPropertiesLoose(source, excluded);
    var key, i;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i = 0; i < sourceSymbolKeys.length; i++) {
        key = sourceSymbolKeys[i];
        if (excluded.indexOf(key) >= 0)
          continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key))
          continue;
        target[key] = source[key];
      }
    }
    return target;
  }
  var version = "1.13.0";
  function userAgent(pattern) {
    if (typeof window !== "undefined" && window.navigator) {
      return !!/* @__PURE__ */ navigator.userAgent.match(pattern);
    }
  }
  var IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
  var Edge = userAgent(/Edge/i);
  var FireFox = userAgent(/firefox/i);
  var Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);
  var IOS = userAgent(/iP(ad|od|hone)/i);
  var ChromeForAndroid = userAgent(/chrome/i) && userAgent(/android/i);
  var captureMode = {
    capture: false,
    passive: false
  };
  function on(el, event, fn) {
    el.addEventListener(event, fn, !IE11OrLess && captureMode);
  }
  function off(el, event, fn) {
    el.removeEventListener(event, fn, !IE11OrLess && captureMode);
  }
  function matches(el, selector) {
    if (!selector)
      return;
    selector[0] === ">" && (selector = selector.substring(1));
    if (el) {
      try {
        if (el.matches) {
          return el.matches(selector);
        } else if (el.msMatchesSelector) {
          return el.msMatchesSelector(selector);
        } else if (el.webkitMatchesSelector) {
          return el.webkitMatchesSelector(selector);
        }
      } catch (_) {
        return false;
      }
    }
    return false;
  }
  function getParentOrHost(el) {
    return el.host && el !== document && el.host.nodeType ? el.host : el.parentNode;
  }
  function closest(el, selector, ctx, includeCTX) {
    if (el) {
      ctx = ctx || document;
      do {
        if (selector != null && (selector[0] === ">" ? el.parentNode === ctx && matches(el, selector) : matches(el, selector)) || includeCTX && el === ctx) {
          return el;
        }
        if (el === ctx)
          break;
      } while (el = getParentOrHost(el));
    }
    return null;
  }
  var R_SPACE = /\s+/g;
  function toggleClass(el, name, state) {
    if (el && name) {
      if (el.classList) {
        el.classList[state ? "add" : "remove"](name);
      } else {
        var className = (" " + el.className + " ").replace(R_SPACE, " ").replace(" " + name + " ", " ");
        el.className = (className + (state ? " " + name : "")).replace(R_SPACE, " ");
      }
    }
  }
  function css(el, prop, val) {
    var style = el && el.style;
    if (style) {
      if (val === void 0) {
        if (document.defaultView && document.defaultView.getComputedStyle) {
          val = document.defaultView.getComputedStyle(el, "");
        } else if (el.currentStyle) {
          val = el.currentStyle;
        }
        return prop === void 0 ? val : val[prop];
      } else {
        if (!(prop in style) && prop.indexOf("webkit") === -1) {
          prop = "-webkit-" + prop;
        }
        style[prop] = val + (typeof val === "string" ? "" : "px");
      }
    }
  }
  function matrix(el, selfOnly) {
    var appliedTransforms = "";
    if (typeof el === "string") {
      appliedTransforms = el;
    } else {
      do {
        var transform = css(el, "transform");
        if (transform && transform !== "none") {
          appliedTransforms = transform + " " + appliedTransforms;
        }
      } while (!selfOnly && (el = el.parentNode));
    }
    var matrixFn = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
    return matrixFn && new matrixFn(appliedTransforms);
  }
  function find(ctx, tagName, iterator) {
    if (ctx) {
      var list = ctx.getElementsByTagName(tagName), i = 0, n = list.length;
      if (iterator) {
        for (; i < n; i++) {
          iterator(list[i], i);
        }
      }
      return list;
    }
    return [];
  }
  function getWindowScrollingElement() {
    var scrollingElement = document.scrollingElement;
    if (scrollingElement) {
      return scrollingElement;
    } else {
      return document.documentElement;
    }
  }
  function getRect(el, relativeToContainingBlock, relativeToNonStaticParent, undoScale, container) {
    if (!el.getBoundingClientRect && el !== window)
      return;
    var elRect, top, left, bottom, right, height, width;
    if (el !== window && el.parentNode && el !== getWindowScrollingElement()) {
      elRect = el.getBoundingClientRect();
      top = elRect.top;
      left = elRect.left;
      bottom = elRect.bottom;
      right = elRect.right;
      height = elRect.height;
      width = elRect.width;
    } else {
      top = 0;
      left = 0;
      bottom = window.innerHeight;
      right = window.innerWidth;
      height = window.innerHeight;
      width = window.innerWidth;
    }
    if ((relativeToContainingBlock || relativeToNonStaticParent) && el !== window) {
      container = container || el.parentNode;
      if (!IE11OrLess) {
        do {
          if (container && container.getBoundingClientRect && (css(container, "transform") !== "none" || relativeToNonStaticParent && css(container, "position") !== "static")) {
            var containerRect = container.getBoundingClientRect();
            top -= containerRect.top + parseInt(css(container, "border-top-width"));
            left -= containerRect.left + parseInt(css(container, "border-left-width"));
            bottom = top + elRect.height;
            right = left + elRect.width;
            break;
          }
        } while (container = container.parentNode);
      }
    }
    if (undoScale && el !== window) {
      var elMatrix = matrix(container || el), scaleX = elMatrix && elMatrix.a, scaleY = elMatrix && elMatrix.d;
      if (elMatrix) {
        top /= scaleY;
        left /= scaleX;
        width /= scaleX;
        height /= scaleY;
        bottom = top + height;
        right = left + width;
      }
    }
    return {
      top,
      left,
      bottom,
      right,
      width,
      height
    };
  }
  function isScrolledPast(el, elSide, parentSide) {
    var parent = getParentAutoScrollElement(el, true), elSideVal = getRect(el)[elSide];
    while (parent) {
      var parentSideVal = getRect(parent)[parentSide], visible = void 0;
      if (parentSide === "top" || parentSide === "left") {
        visible = elSideVal >= parentSideVal;
      } else {
        visible = elSideVal <= parentSideVal;
      }
      if (!visible)
        return parent;
      if (parent === getWindowScrollingElement())
        break;
      parent = getParentAutoScrollElement(parent, false);
    }
    return false;
  }
  function getChild(el, childNum, options) {
    var currentChild = 0, i = 0, children = el.children;
    while (i < children.length) {
      if (children[i].style.display !== "none" && children[i] !== Sortable.ghost && children[i] !== Sortable.dragged && closest(children[i], options.draggable, el, false)) {
        if (currentChild === childNum) {
          return children[i];
        }
        currentChild++;
      }
      i++;
    }
    return null;
  }
  function lastChild(el, selector) {
    var last = el.lastElementChild;
    while (last && (last === Sortable.ghost || css(last, "display") === "none" || selector && !matches(last, selector))) {
      last = last.previousElementSibling;
    }
    return last || null;
  }
  function index(el, selector) {
    var index2 = 0;
    if (!el || !el.parentNode) {
      return -1;
    }
    while (el = el.previousElementSibling) {
      if (el.nodeName.toUpperCase() !== "TEMPLATE" && el !== Sortable.clone && (!selector || matches(el, selector))) {
        index2++;
      }
    }
    return index2;
  }
  function getRelativeScrollOffset(el) {
    var offsetLeft = 0, offsetTop = 0, winScroller = getWindowScrollingElement();
    if (el) {
      do {
        var elMatrix = matrix(el), scaleX = elMatrix.a, scaleY = elMatrix.d;
        offsetLeft += el.scrollLeft * scaleX;
        offsetTop += el.scrollTop * scaleY;
      } while (el !== winScroller && (el = el.parentNode));
    }
    return [offsetLeft, offsetTop];
  }
  function indexOfObject(arr, obj) {
    for (var i in arr) {
      if (!arr.hasOwnProperty(i))
        continue;
      for (var key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] === arr[i][key])
          return Number(i);
      }
    }
    return -1;
  }
  function getParentAutoScrollElement(el, includeSelf) {
    if (!el || !el.getBoundingClientRect)
      return getWindowScrollingElement();
    var elem = el;
    var gotSelf = false;
    do {
      if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
        var elemCSS = css(elem);
        if (elem.clientWidth < elem.scrollWidth && (elemCSS.overflowX == "auto" || elemCSS.overflowX == "scroll") || elem.clientHeight < elem.scrollHeight && (elemCSS.overflowY == "auto" || elemCSS.overflowY == "scroll")) {
          if (!elem.getBoundingClientRect || elem === document.body)
            return getWindowScrollingElement();
          if (gotSelf || includeSelf)
            return elem;
          gotSelf = true;
        }
      }
    } while (elem = elem.parentNode);
    return getWindowScrollingElement();
  }
  function extend3(dst, src) {
    if (dst && src) {
      for (var key in src) {
        if (src.hasOwnProperty(key)) {
          dst[key] = src[key];
        }
      }
    }
    return dst;
  }
  function isRectEqual(rect1, rect2) {
    return Math.round(rect1.top) === Math.round(rect2.top) && Math.round(rect1.left) === Math.round(rect2.left) && Math.round(rect1.height) === Math.round(rect2.height) && Math.round(rect1.width) === Math.round(rect2.width);
  }
  var _throttleTimeout;
  function throttle(callback, ms) {
    return function() {
      if (!_throttleTimeout) {
        var args = arguments, _this = this;
        if (args.length === 1) {
          callback.call(_this, args[0]);
        } else {
          callback.apply(_this, args);
        }
        _throttleTimeout = setTimeout(function() {
          _throttleTimeout = void 0;
        }, ms);
      }
    };
  }
  function cancelThrottle() {
    clearTimeout(_throttleTimeout);
    _throttleTimeout = void 0;
  }
  function scrollBy(el, x, y) {
    el.scrollLeft += x;
    el.scrollTop += y;
  }
  function clone(el) {
    var Polymer = window.Polymer;
    var $ = window.jQuery || window.Zepto;
    if (Polymer && Polymer.dom) {
      return Polymer.dom(el).cloneNode(true);
    } else if ($) {
      return $(el).clone(true)[0];
    } else {
      return el.cloneNode(true);
    }
  }
  var expando = "Sortable" + (/* @__PURE__ */ new Date()).getTime();
  function AnimationStateManager() {
    var animationStates = [], animationCallbackId;
    return {
      captureAnimationState: function captureAnimationState() {
        animationStates = [];
        if (!this.options.animation)
          return;
        var children = [].slice.call(this.el.children);
        children.forEach(function(child) {
          if (css(child, "display") === "none" || child === Sortable.ghost)
            return;
          animationStates.push({
            target: child,
            rect: getRect(child)
          });
          var fromRect = _objectSpread({}, animationStates[animationStates.length - 1].rect);
          if (child.thisAnimationDuration) {
            var childMatrix = matrix(child, true);
            if (childMatrix) {
              fromRect.top -= childMatrix.f;
              fromRect.left -= childMatrix.e;
            }
          }
          child.fromRect = fromRect;
        });
      },
      addAnimationState: function addAnimationState(state) {
        animationStates.push(state);
      },
      removeAnimationState: function removeAnimationState(target) {
        animationStates.splice(indexOfObject(animationStates, {
          target
        }), 1);
      },
      animateAll: function animateAll(callback) {
        var _this = this;
        if (!this.options.animation) {
          clearTimeout(animationCallbackId);
          if (typeof callback === "function")
            callback();
          return;
        }
        var animating = false, animationTime = 0;
        animationStates.forEach(function(state) {
          var time = 0, target = state.target, fromRect = target.fromRect, toRect = getRect(target), prevFromRect = target.prevFromRect, prevToRect = target.prevToRect, animatingRect = state.rect, targetMatrix = matrix(target, true);
          if (targetMatrix) {
            toRect.top -= targetMatrix.f;
            toRect.left -= targetMatrix.e;
          }
          target.toRect = toRect;
          if (target.thisAnimationDuration) {
            if (isRectEqual(prevFromRect, toRect) && !isRectEqual(fromRect, toRect) && // Make sure animatingRect is on line between toRect & fromRect
            (animatingRect.top - toRect.top) / (animatingRect.left - toRect.left) === (fromRect.top - toRect.top) / (fromRect.left - toRect.left)) {
              time = calculateRealTime(animatingRect, prevFromRect, prevToRect, _this.options);
            }
          }
          if (!isRectEqual(toRect, fromRect)) {
            target.prevFromRect = fromRect;
            target.prevToRect = toRect;
            if (!time) {
              time = _this.options.animation;
            }
            _this.animate(target, animatingRect, toRect, time);
          }
          if (time) {
            animating = true;
            animationTime = Math.max(animationTime, time);
            clearTimeout(target.animationResetTimer);
            target.animationResetTimer = setTimeout(function() {
              target.animationTime = 0;
              target.prevFromRect = null;
              target.fromRect = null;
              target.prevToRect = null;
              target.thisAnimationDuration = null;
            }, time);
            target.thisAnimationDuration = time;
          }
        });
        clearTimeout(animationCallbackId);
        if (!animating) {
          if (typeof callback === "function")
            callback();
        } else {
          animationCallbackId = setTimeout(function() {
            if (typeof callback === "function")
              callback();
          }, animationTime);
        }
        animationStates = [];
      },
      animate: function animate(target, currentRect, toRect, duration) {
        if (duration) {
          css(target, "transition", "");
          css(target, "transform", "");
          var elMatrix = matrix(this.el), scaleX = elMatrix && elMatrix.a, scaleY = elMatrix && elMatrix.d, translateX = (currentRect.left - toRect.left) / (scaleX || 1), translateY = (currentRect.top - toRect.top) / (scaleY || 1);
          target.animatingX = !!translateX;
          target.animatingY = !!translateY;
          css(target, "transform", "translate3d(" + translateX + "px," + translateY + "px,0)");
          this.forRepaintDummy = repaint(target);
          css(target, "transition", "transform " + duration + "ms" + (this.options.easing ? " " + this.options.easing : ""));
          css(target, "transform", "translate3d(0,0,0)");
          typeof target.animated === "number" && clearTimeout(target.animated);
          target.animated = setTimeout(function() {
            css(target, "transition", "");
            css(target, "transform", "");
            target.animated = false;
            target.animatingX = false;
            target.animatingY = false;
          }, duration);
        }
      }
    };
  }
  function repaint(target) {
    return target.offsetWidth;
  }
  function calculateRealTime(animatingRect, fromRect, toRect, options) {
    return Math.sqrt(Math.pow(fromRect.top - animatingRect.top, 2) + Math.pow(fromRect.left - animatingRect.left, 2)) / Math.sqrt(Math.pow(fromRect.top - toRect.top, 2) + Math.pow(fromRect.left - toRect.left, 2)) * options.animation;
  }
  var plugins = [];
  var defaults = {
    initializeByDefault: true
  };
  var PluginManager = {
    mount: function mount(plugin) {
      for (var option2 in defaults) {
        if (defaults.hasOwnProperty(option2) && !(option2 in plugin)) {
          plugin[option2] = defaults[option2];
        }
      }
      plugins.forEach(function(p) {
        if (p.pluginName === plugin.pluginName) {
          throw "Sortable: Cannot mount plugin ".concat(plugin.pluginName, " more than once");
        }
      });
      plugins.push(plugin);
    },
    pluginEvent: function pluginEvent(eventName, sortable, evt) {
      var _this = this;
      this.eventCanceled = false;
      evt.cancel = function() {
        _this.eventCanceled = true;
      };
      var eventNameGlobal = eventName + "Global";
      plugins.forEach(function(plugin) {
        if (!sortable[plugin.pluginName])
          return;
        if (sortable[plugin.pluginName][eventNameGlobal]) {
          sortable[plugin.pluginName][eventNameGlobal](_objectSpread({
            sortable
          }, evt));
        }
        if (sortable.options[plugin.pluginName] && sortable[plugin.pluginName][eventName]) {
          sortable[plugin.pluginName][eventName](_objectSpread({
            sortable
          }, evt));
        }
      });
    },
    initializePlugins: function initializePlugins(sortable, el, defaults2, options) {
      plugins.forEach(function(plugin) {
        var pluginName = plugin.pluginName;
        if (!sortable.options[pluginName] && !plugin.initializeByDefault)
          return;
        var initialized = new plugin(sortable, el, sortable.options);
        initialized.sortable = sortable;
        initialized.options = sortable.options;
        sortable[pluginName] = initialized;
        _extends(defaults2, initialized.defaults);
      });
      for (var option2 in sortable.options) {
        if (!sortable.options.hasOwnProperty(option2))
          continue;
        var modified = this.modifyOption(sortable, option2, sortable.options[option2]);
        if (typeof modified !== "undefined") {
          sortable.options[option2] = modified;
        }
      }
    },
    getEventProperties: function getEventProperties(name, sortable) {
      var eventProperties = {};
      plugins.forEach(function(plugin) {
        if (typeof plugin.eventProperties !== "function")
          return;
        _extends(eventProperties, plugin.eventProperties.call(sortable[plugin.pluginName], name));
      });
      return eventProperties;
    },
    modifyOption: function modifyOption(sortable, name, value) {
      var modifiedValue;
      plugins.forEach(function(plugin) {
        if (!sortable[plugin.pluginName])
          return;
        if (plugin.optionListeners && typeof plugin.optionListeners[name] === "function") {
          modifiedValue = plugin.optionListeners[name].call(sortable[plugin.pluginName], value);
        }
      });
      return modifiedValue;
    }
  };
  function dispatchEvent2(_ref) {
    var sortable = _ref.sortable, rootEl2 = _ref.rootEl, name = _ref.name, targetEl = _ref.targetEl, cloneEl2 = _ref.cloneEl, toEl = _ref.toEl, fromEl = _ref.fromEl, oldIndex2 = _ref.oldIndex, newIndex2 = _ref.newIndex, oldDraggableIndex2 = _ref.oldDraggableIndex, newDraggableIndex2 = _ref.newDraggableIndex, originalEvent = _ref.originalEvent, putSortable2 = _ref.putSortable, extraEventProperties = _ref.extraEventProperties;
    sortable = sortable || rootEl2 && rootEl2[expando];
    if (!sortable)
      return;
    var evt, options = sortable.options, onName = "on" + name.charAt(0).toUpperCase() + name.substr(1);
    if (window.CustomEvent && !IE11OrLess && !Edge) {
      evt = new CustomEvent(name, {
        bubbles: true,
        cancelable: true
      });
    } else {
      evt = document.createEvent("Event");
      evt.initEvent(name, true, true);
    }
    evt.to = toEl || rootEl2;
    evt.from = fromEl || rootEl2;
    evt.item = targetEl || rootEl2;
    evt.clone = cloneEl2;
    evt.oldIndex = oldIndex2;
    evt.newIndex = newIndex2;
    evt.oldDraggableIndex = oldDraggableIndex2;
    evt.newDraggableIndex = newDraggableIndex2;
    evt.originalEvent = originalEvent;
    evt.pullMode = putSortable2 ? putSortable2.lastPutMode : void 0;
    var allEventProperties = _objectSpread({}, extraEventProperties, PluginManager.getEventProperties(name, sortable));
    for (var option2 in allEventProperties) {
      evt[option2] = allEventProperties[option2];
    }
    if (rootEl2) {
      rootEl2.dispatchEvent(evt);
    }
    if (options[onName]) {
      options[onName].call(sortable, evt);
    }
  }
  var pluginEvent2 = function pluginEvent3(eventName, sortable) {
    var _ref = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, originalEvent = _ref.evt, data = _objectWithoutProperties(_ref, ["evt"]);
    PluginManager.pluginEvent.bind(Sortable)(eventName, sortable, _objectSpread({
      dragEl,
      parentEl,
      ghostEl,
      rootEl,
      nextEl,
      lastDownEl,
      cloneEl,
      cloneHidden,
      dragStarted: moved,
      putSortable,
      activeSortable: Sortable.active,
      originalEvent,
      oldIndex,
      oldDraggableIndex,
      newIndex,
      newDraggableIndex,
      hideGhostForTarget: _hideGhostForTarget,
      unhideGhostForTarget: _unhideGhostForTarget,
      cloneNowHidden: function cloneNowHidden() {
        cloneHidden = true;
      },
      cloneNowShown: function cloneNowShown() {
        cloneHidden = false;
      },
      dispatchSortableEvent: function dispatchSortableEvent(name) {
        _dispatchEvent({
          sortable,
          name,
          originalEvent
        });
      }
    }, data));
  };
  function _dispatchEvent(info) {
    dispatchEvent2(_objectSpread({
      putSortable,
      cloneEl,
      targetEl: dragEl,
      rootEl,
      oldIndex,
      oldDraggableIndex,
      newIndex,
      newDraggableIndex
    }, info));
  }
  var dragEl;
  var parentEl;
  var ghostEl;
  var rootEl;
  var nextEl;
  var lastDownEl;
  var cloneEl;
  var cloneHidden;
  var oldIndex;
  var newIndex;
  var oldDraggableIndex;
  var newDraggableIndex;
  var activeGroup;
  var putSortable;
  var awaitingDragStarted = false;
  var ignoreNextClick = false;
  var sortables = [];
  var tapEvt;
  var touchEvt;
  var lastDx;
  var lastDy;
  var tapDistanceLeft;
  var tapDistanceTop;
  var moved;
  var lastTarget;
  var lastDirection;
  var pastFirstInvertThresh = false;
  var isCircumstantialInvert = false;
  var targetMoveDistance;
  var ghostRelativeParent;
  var ghostRelativeParentInitialScroll = [];
  var _silent = false;
  var savedInputChecked = [];
  var documentExists = typeof document !== "undefined";
  var PositionGhostAbsolutely = IOS;
  var CSSFloatProperty = Edge || IE11OrLess ? "cssFloat" : "float";
  var supportDraggable = documentExists && !ChromeForAndroid && !IOS && "draggable" in document.createElement("div");
  var supportCssPointerEvents = function() {
    if (!documentExists)
      return;
    if (IE11OrLess) {
      return false;
    }
    var el = document.createElement("x");
    el.style.cssText = "pointer-events:auto";
    return el.style.pointerEvents === "auto";
  }();
  var _detectDirection = function _detectDirection2(el, options) {
    var elCSS = css(el), elWidth = parseInt(elCSS.width) - parseInt(elCSS.paddingLeft) - parseInt(elCSS.paddingRight) - parseInt(elCSS.borderLeftWidth) - parseInt(elCSS.borderRightWidth), child1 = getChild(el, 0, options), child2 = getChild(el, 1, options), firstChildCSS = child1 && css(child1), secondChildCSS = child2 && css(child2), firstChildWidth = firstChildCSS && parseInt(firstChildCSS.marginLeft) + parseInt(firstChildCSS.marginRight) + getRect(child1).width, secondChildWidth = secondChildCSS && parseInt(secondChildCSS.marginLeft) + parseInt(secondChildCSS.marginRight) + getRect(child2).width;
    if (elCSS.display === "flex") {
      return elCSS.flexDirection === "column" || elCSS.flexDirection === "column-reverse" ? "vertical" : "horizontal";
    }
    if (elCSS.display === "grid") {
      return elCSS.gridTemplateColumns.split(" ").length <= 1 ? "vertical" : "horizontal";
    }
    if (child1 && firstChildCSS["float"] && firstChildCSS["float"] !== "none") {
      var touchingSideChild2 = firstChildCSS["float"] === "left" ? "left" : "right";
      return child2 && (secondChildCSS.clear === "both" || secondChildCSS.clear === touchingSideChild2) ? "vertical" : "horizontal";
    }
    return child1 && (firstChildCSS.display === "block" || firstChildCSS.display === "flex" || firstChildCSS.display === "table" || firstChildCSS.display === "grid" || firstChildWidth >= elWidth && elCSS[CSSFloatProperty] === "none" || child2 && elCSS[CSSFloatProperty] === "none" && firstChildWidth + secondChildWidth > elWidth) ? "vertical" : "horizontal";
  };
  var _dragElInRowColumn = function _dragElInRowColumn2(dragRect, targetRect, vertical) {
    var dragElS1Opp = vertical ? dragRect.left : dragRect.top, dragElS2Opp = vertical ? dragRect.right : dragRect.bottom, dragElOppLength = vertical ? dragRect.width : dragRect.height, targetS1Opp = vertical ? targetRect.left : targetRect.top, targetS2Opp = vertical ? targetRect.right : targetRect.bottom, targetOppLength = vertical ? targetRect.width : targetRect.height;
    return dragElS1Opp === targetS1Opp || dragElS2Opp === targetS2Opp || dragElS1Opp + dragElOppLength / 2 === targetS1Opp + targetOppLength / 2;
  };
  var _detectNearestEmptySortable = function _detectNearestEmptySortable2(x, y) {
    var ret;
    sortables.some(function(sortable) {
      if (lastChild(sortable))
        return;
      var rect = getRect(sortable), threshold = sortable[expando].options.emptyInsertThreshold, insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold, insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;
      if (threshold && insideHorizontally && insideVertically) {
        return ret = sortable;
      }
    });
    return ret;
  };
  var _prepareGroup = function _prepareGroup2(options) {
    function toFn(value, pull) {
      return function(to, from, dragEl2, evt) {
        var sameGroup = to.options.group.name && from.options.group.name && to.options.group.name === from.options.group.name;
        if (value == null && (pull || sameGroup)) {
          return true;
        } else if (value == null || value === false) {
          return false;
        } else if (pull && value === "clone") {
          return value;
        } else if (typeof value === "function") {
          return toFn(value(to, from, dragEl2, evt), pull)(to, from, dragEl2, evt);
        } else {
          var otherGroup = (pull ? to : from).options.group.name;
          return value === true || typeof value === "string" && value === otherGroup || value.join && value.indexOf(otherGroup) > -1;
        }
      };
    }
    var group = {};
    var originalGroup = options.group;
    if (!originalGroup || _typeof(originalGroup) != "object") {
      originalGroup = {
        name: originalGroup
      };
    }
    group.name = originalGroup.name;
    group.checkPull = toFn(originalGroup.pull, true);
    group.checkPut = toFn(originalGroup.put);
    group.revertClone = originalGroup.revertClone;
    options.group = group;
  };
  var _hideGhostForTarget = function _hideGhostForTarget2() {
    if (!supportCssPointerEvents && ghostEl) {
      css(ghostEl, "display", "none");
    }
  };
  var _unhideGhostForTarget = function _unhideGhostForTarget2() {
    if (!supportCssPointerEvents && ghostEl) {
      css(ghostEl, "display", "");
    }
  };
  if (documentExists) {
    document.addEventListener("click", function(evt) {
      if (ignoreNextClick) {
        evt.preventDefault();
        evt.stopPropagation && evt.stopPropagation();
        evt.stopImmediatePropagation && evt.stopImmediatePropagation();
        ignoreNextClick = false;
        return false;
      }
    }, true);
  }
  var nearestEmptyInsertDetectEvent = function nearestEmptyInsertDetectEvent2(evt) {
    if (dragEl) {
      evt = evt.touches ? evt.touches[0] : evt;
      var nearest = _detectNearestEmptySortable(evt.clientX, evt.clientY);
      if (nearest) {
        var event = {};
        for (var i in evt) {
          if (evt.hasOwnProperty(i)) {
            event[i] = evt[i];
          }
        }
        event.target = event.rootEl = nearest;
        event.preventDefault = void 0;
        event.stopPropagation = void 0;
        nearest[expando]._onDragOver(event);
      }
    }
  };
  var _checkOutsideTargetEl = function _checkOutsideTargetEl2(evt) {
    if (dragEl) {
      dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
    }
  };
  function Sortable(el, options) {
    if (!(el && el.nodeType && el.nodeType === 1)) {
      throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(el));
    }
    this.el = el;
    this.options = options = _extends({}, options);
    el[expando] = this;
    var defaults2 = {
      group: null,
      sort: true,
      disabled: false,
      store: null,
      handle: null,
      draggable: /^[uo]l$/i.test(el.nodeName) ? ">li" : ">*",
      swapThreshold: 1,
      // percentage; 0 <= x <= 1
      invertSwap: false,
      // invert always
      invertedSwapThreshold: null,
      // will be set to same as swapThreshold if default
      removeCloneOnHide: true,
      direction: function direction() {
        return _detectDirection(el, this.options);
      },
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      dragClass: "sortable-drag",
      ignore: "a, img",
      filter: null,
      preventOnFilter: true,
      animation: 0,
      easing: null,
      setData: function setData(dataTransfer, dragEl2) {
        dataTransfer.setData("Text", dragEl2.textContent);
      },
      dropBubble: false,
      dragoverBubble: false,
      dataIdAttr: "data-id",
      delay: 0,
      delayOnTouchOnly: false,
      touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
      forceFallback: false,
      fallbackClass: "sortable-fallback",
      fallbackOnBody: false,
      fallbackTolerance: 0,
      fallbackOffset: {
        x: 0,
        y: 0
      },
      supportPointer: Sortable.supportPointer !== false && "PointerEvent" in window && !Safari,
      emptyInsertThreshold: 5
    };
    PluginManager.initializePlugins(this, el, defaults2);
    for (var name in defaults2) {
      !(name in options) && (options[name] = defaults2[name]);
    }
    _prepareGroup(options);
    for (var fn in this) {
      if (fn.charAt(0) === "_" && typeof this[fn] === "function") {
        this[fn] = this[fn].bind(this);
      }
    }
    this.nativeDraggable = options.forceFallback ? false : supportDraggable;
    if (this.nativeDraggable) {
      this.options.touchStartThreshold = 1;
    }
    if (options.supportPointer) {
      on(el, "pointerdown", this._onTapStart);
    } else {
      on(el, "mousedown", this._onTapStart);
      on(el, "touchstart", this._onTapStart);
    }
    if (this.nativeDraggable) {
      on(el, "dragover", this);
      on(el, "dragenter", this);
    }
    sortables.push(this.el);
    options.store && options.store.get && this.sort(options.store.get(this) || []);
    _extends(this, AnimationStateManager());
  }
  Sortable.prototype = /** @lends Sortable.prototype */
  {
    constructor: Sortable,
    _isOutsideThisEl: function _isOutsideThisEl(target) {
      if (!this.el.contains(target) && target !== this.el) {
        lastTarget = null;
      }
    },
    _getDirection: function _getDirection(evt, target) {
      return typeof this.options.direction === "function" ? this.options.direction.call(this, evt, target, dragEl) : this.options.direction;
    },
    _onTapStart: function _onTapStart(evt) {
      if (!evt.cancelable)
        return;
      var _this = this, el = this.el, options = this.options, preventOnFilter = options.preventOnFilter, type = evt.type, touch = evt.touches && evt.touches[0] || evt.pointerType && evt.pointerType === "touch" && evt, target = (touch || evt).target, originalTarget = evt.target.shadowRoot && (evt.path && evt.path[0] || evt.composedPath && evt.composedPath()[0]) || target, filter2 = options.filter;
      _saveInputCheckedState(el);
      if (dragEl) {
        return;
      }
      if (/mousedown|pointerdown/.test(type) && evt.button !== 0 || options.disabled) {
        return;
      }
      if (originalTarget.isContentEditable) {
        return;
      }
      if (!this.nativeDraggable && Safari && target && target.tagName.toUpperCase() === "SELECT") {
        return;
      }
      target = closest(target, options.draggable, el, false);
      if (target && target.animated) {
        return;
      }
      if (lastDownEl === target) {
        return;
      }
      oldIndex = index(target);
      oldDraggableIndex = index(target, options.draggable);
      if (typeof filter2 === "function") {
        if (filter2.call(this, evt, target, this)) {
          _dispatchEvent({
            sortable: _this,
            rootEl: originalTarget,
            name: "filter",
            targetEl: target,
            toEl: el,
            fromEl: el
          });
          pluginEvent2("filter", _this, {
            evt
          });
          preventOnFilter && evt.cancelable && evt.preventDefault();
          return;
        }
      } else if (filter2) {
        filter2 = filter2.split(",").some(function(criteria) {
          criteria = closest(originalTarget, criteria.trim(), el, false);
          if (criteria) {
            _dispatchEvent({
              sortable: _this,
              rootEl: criteria,
              name: "filter",
              targetEl: target,
              fromEl: el,
              toEl: el
            });
            pluginEvent2("filter", _this, {
              evt
            });
            return true;
          }
        });
        if (filter2) {
          preventOnFilter && evt.cancelable && evt.preventDefault();
          return;
        }
      }
      if (options.handle && !closest(originalTarget, options.handle, el, false)) {
        return;
      }
      this._prepareDragStart(evt, touch, target);
    },
    _prepareDragStart: function _prepareDragStart(evt, touch, target) {
      var _this = this, el = _this.el, options = _this.options, ownerDocument = el.ownerDocument, dragStartFn;
      if (target && !dragEl && target.parentNode === el) {
        var dragRect = getRect(target);
        rootEl = el;
        dragEl = target;
        parentEl = dragEl.parentNode;
        nextEl = dragEl.nextSibling;
        lastDownEl = target;
        activeGroup = options.group;
        Sortable.dragged = dragEl;
        tapEvt = {
          target: dragEl,
          clientX: (touch || evt).clientX,
          clientY: (touch || evt).clientY
        };
        tapDistanceLeft = tapEvt.clientX - dragRect.left;
        tapDistanceTop = tapEvt.clientY - dragRect.top;
        this._lastX = (touch || evt).clientX;
        this._lastY = (touch || evt).clientY;
        dragEl.style["will-change"] = "all";
        dragStartFn = function dragStartFn2() {
          pluginEvent2("delayEnded", _this, {
            evt
          });
          if (Sortable.eventCanceled) {
            _this._onDrop();
            return;
          }
          _this._disableDelayedDragEvents();
          if (!FireFox && _this.nativeDraggable) {
            dragEl.draggable = true;
          }
          _this._triggerDragStart(evt, touch);
          _dispatchEvent({
            sortable: _this,
            name: "choose",
            originalEvent: evt
          });
          toggleClass(dragEl, options.chosenClass, true);
        };
        options.ignore.split(",").forEach(function(criteria) {
          find(dragEl, criteria.trim(), _disableDraggable);
        });
        on(ownerDocument, "dragover", nearestEmptyInsertDetectEvent);
        on(ownerDocument, "mousemove", nearestEmptyInsertDetectEvent);
        on(ownerDocument, "touchmove", nearestEmptyInsertDetectEvent);
        on(ownerDocument, "mouseup", _this._onDrop);
        on(ownerDocument, "touchend", _this._onDrop);
        on(ownerDocument, "touchcancel", _this._onDrop);
        if (FireFox && this.nativeDraggable) {
          this.options.touchStartThreshold = 4;
          dragEl.draggable = true;
        }
        pluginEvent2("delayStart", this, {
          evt
        });
        if (options.delay && (!options.delayOnTouchOnly || touch) && (!this.nativeDraggable || !(Edge || IE11OrLess))) {
          if (Sortable.eventCanceled) {
            this._onDrop();
            return;
          }
          on(ownerDocument, "mouseup", _this._disableDelayedDrag);
          on(ownerDocument, "touchend", _this._disableDelayedDrag);
          on(ownerDocument, "touchcancel", _this._disableDelayedDrag);
          on(ownerDocument, "mousemove", _this._delayedDragTouchMoveHandler);
          on(ownerDocument, "touchmove", _this._delayedDragTouchMoveHandler);
          options.supportPointer && on(ownerDocument, "pointermove", _this._delayedDragTouchMoveHandler);
          _this._dragStartTimer = setTimeout(dragStartFn, options.delay);
        } else {
          dragStartFn();
        }
      }
    },
    _delayedDragTouchMoveHandler: function _delayedDragTouchMoveHandler(e) {
      var touch = e.touches ? e.touches[0] : e;
      if (Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) >= Math.floor(this.options.touchStartThreshold / (this.nativeDraggable && window.devicePixelRatio || 1))) {
        this._disableDelayedDrag();
      }
    },
    _disableDelayedDrag: function _disableDelayedDrag() {
      dragEl && _disableDraggable(dragEl);
      clearTimeout(this._dragStartTimer);
      this._disableDelayedDragEvents();
    },
    _disableDelayedDragEvents: function _disableDelayedDragEvents() {
      var ownerDocument = this.el.ownerDocument;
      off(ownerDocument, "mouseup", this._disableDelayedDrag);
      off(ownerDocument, "touchend", this._disableDelayedDrag);
      off(ownerDocument, "touchcancel", this._disableDelayedDrag);
      off(ownerDocument, "mousemove", this._delayedDragTouchMoveHandler);
      off(ownerDocument, "touchmove", this._delayedDragTouchMoveHandler);
      off(ownerDocument, "pointermove", this._delayedDragTouchMoveHandler);
    },
    _triggerDragStart: function _triggerDragStart(evt, touch) {
      touch = touch || evt.pointerType == "touch" && evt;
      if (!this.nativeDraggable || touch) {
        if (this.options.supportPointer) {
          on(document, "pointermove", this._onTouchMove);
        } else if (touch) {
          on(document, "touchmove", this._onTouchMove);
        } else {
          on(document, "mousemove", this._onTouchMove);
        }
      } else {
        on(dragEl, "dragend", this);
        on(rootEl, "dragstart", this._onDragStart);
      }
      try {
        if (document.selection) {
          _nextTick(function() {
            document.selection.empty();
          });
        } else {
          window.getSelection().removeAllRanges();
        }
      } catch (err) {
      }
    },
    _dragStarted: function _dragStarted(fallback, evt) {
      awaitingDragStarted = false;
      if (rootEl && dragEl) {
        pluginEvent2("dragStarted", this, {
          evt
        });
        if (this.nativeDraggable) {
          on(document, "dragover", _checkOutsideTargetEl);
        }
        var options = this.options;
        !fallback && toggleClass(dragEl, options.dragClass, false);
        toggleClass(dragEl, options.ghostClass, true);
        Sortable.active = this;
        fallback && this._appendGhost();
        _dispatchEvent({
          sortable: this,
          name: "start",
          originalEvent: evt
        });
      } else {
        this._nulling();
      }
    },
    _emulateDragOver: function _emulateDragOver() {
      if (touchEvt) {
        this._lastX = touchEvt.clientX;
        this._lastY = touchEvt.clientY;
        _hideGhostForTarget();
        var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
        var parent = target;
        while (target && target.shadowRoot) {
          target = target.shadowRoot.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
          if (target === parent)
            break;
          parent = target;
        }
        dragEl.parentNode[expando]._isOutsideThisEl(target);
        if (parent) {
          do {
            if (parent[expando]) {
              var inserted = void 0;
              inserted = parent[expando]._onDragOver({
                clientX: touchEvt.clientX,
                clientY: touchEvt.clientY,
                target,
                rootEl: parent
              });
              if (inserted && !this.options.dragoverBubble) {
                break;
              }
            }
            target = parent;
          } while (parent = parent.parentNode);
        }
        _unhideGhostForTarget();
      }
    },
    _onTouchMove: function _onTouchMove(evt) {
      if (tapEvt) {
        var options = this.options, fallbackTolerance = options.fallbackTolerance, fallbackOffset = options.fallbackOffset, touch = evt.touches ? evt.touches[0] : evt, ghostMatrix = ghostEl && matrix(ghostEl, true), scaleX = ghostEl && ghostMatrix && ghostMatrix.a, scaleY = ghostEl && ghostMatrix && ghostMatrix.d, relativeScrollOffset = PositionGhostAbsolutely && ghostRelativeParent && getRelativeScrollOffset(ghostRelativeParent), dx = (touch.clientX - tapEvt.clientX + fallbackOffset.x) / (scaleX || 1) + (relativeScrollOffset ? relativeScrollOffset[0] - ghostRelativeParentInitialScroll[0] : 0) / (scaleX || 1), dy = (touch.clientY - tapEvt.clientY + fallbackOffset.y) / (scaleY || 1) + (relativeScrollOffset ? relativeScrollOffset[1] - ghostRelativeParentInitialScroll[1] : 0) / (scaleY || 1);
        if (!Sortable.active && !awaitingDragStarted) {
          if (fallbackTolerance && Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) < fallbackTolerance) {
            return;
          }
          this._onDragStart(evt, true);
        }
        if (ghostEl) {
          if (ghostMatrix) {
            ghostMatrix.e += dx - (lastDx || 0);
            ghostMatrix.f += dy - (lastDy || 0);
          } else {
            ghostMatrix = {
              a: 1,
              b: 0,
              c: 0,
              d: 1,
              e: dx,
              f: dy
            };
          }
          var cssMatrix = "matrix(".concat(ghostMatrix.a, ",").concat(ghostMatrix.b, ",").concat(ghostMatrix.c, ",").concat(ghostMatrix.d, ",").concat(ghostMatrix.e, ",").concat(ghostMatrix.f, ")");
          css(ghostEl, "webkitTransform", cssMatrix);
          css(ghostEl, "mozTransform", cssMatrix);
          css(ghostEl, "msTransform", cssMatrix);
          css(ghostEl, "transform", cssMatrix);
          lastDx = dx;
          lastDy = dy;
          touchEvt = touch;
        }
        evt.cancelable && evt.preventDefault();
      }
    },
    _appendGhost: function _appendGhost() {
      if (!ghostEl) {
        var container = this.options.fallbackOnBody ? document.body : rootEl, rect = getRect(dragEl, true, PositionGhostAbsolutely, true, container), options = this.options;
        if (PositionGhostAbsolutely) {
          ghostRelativeParent = container;
          while (css(ghostRelativeParent, "position") === "static" && css(ghostRelativeParent, "transform") === "none" && ghostRelativeParent !== document) {
            ghostRelativeParent = ghostRelativeParent.parentNode;
          }
          if (ghostRelativeParent !== document.body && ghostRelativeParent !== document.documentElement) {
            if (ghostRelativeParent === document)
              ghostRelativeParent = getWindowScrollingElement();
            rect.top += ghostRelativeParent.scrollTop;
            rect.left += ghostRelativeParent.scrollLeft;
          } else {
            ghostRelativeParent = getWindowScrollingElement();
          }
          ghostRelativeParentInitialScroll = getRelativeScrollOffset(ghostRelativeParent);
        }
        ghostEl = dragEl.cloneNode(true);
        toggleClass(ghostEl, options.ghostClass, false);
        toggleClass(ghostEl, options.fallbackClass, true);
        toggleClass(ghostEl, options.dragClass, true);
        css(ghostEl, "transition", "");
        css(ghostEl, "transform", "");
        css(ghostEl, "box-sizing", "border-box");
        css(ghostEl, "margin", 0);
        css(ghostEl, "top", rect.top);
        css(ghostEl, "left", rect.left);
        css(ghostEl, "width", rect.width);
        css(ghostEl, "height", rect.height);
        css(ghostEl, "opacity", "0.8");
        css(ghostEl, "position", PositionGhostAbsolutely ? "absolute" : "fixed");
        css(ghostEl, "zIndex", "100000");
        css(ghostEl, "pointerEvents", "none");
        Sortable.ghost = ghostEl;
        container.appendChild(ghostEl);
        css(ghostEl, "transform-origin", tapDistanceLeft / parseInt(ghostEl.style.width) * 100 + "% " + tapDistanceTop / parseInt(ghostEl.style.height) * 100 + "%");
      }
    },
    _onDragStart: function _onDragStart(evt, fallback) {
      var _this = this;
      var dataTransfer = evt.dataTransfer;
      var options = _this.options;
      pluginEvent2("dragStart", this, {
        evt
      });
      if (Sortable.eventCanceled) {
        this._onDrop();
        return;
      }
      pluginEvent2("setupClone", this);
      if (!Sortable.eventCanceled) {
        cloneEl = clone(dragEl);
        cloneEl.draggable = false;
        cloneEl.style["will-change"] = "";
        this._hideClone();
        toggleClass(cloneEl, this.options.chosenClass, false);
        Sortable.clone = cloneEl;
      }
      _this.cloneId = _nextTick(function() {
        pluginEvent2("clone", _this);
        if (Sortable.eventCanceled)
          return;
        if (!_this.options.removeCloneOnHide) {
          rootEl.insertBefore(cloneEl, dragEl);
        }
        _this._hideClone();
        _dispatchEvent({
          sortable: _this,
          name: "clone"
        });
      });
      !fallback && toggleClass(dragEl, options.dragClass, true);
      if (fallback) {
        ignoreNextClick = true;
        _this._loopId = setInterval(_this._emulateDragOver, 50);
      } else {
        off(document, "mouseup", _this._onDrop);
        off(document, "touchend", _this._onDrop);
        off(document, "touchcancel", _this._onDrop);
        if (dataTransfer) {
          dataTransfer.effectAllowed = "move";
          options.setData && options.setData.call(_this, dataTransfer, dragEl);
        }
        on(document, "drop", _this);
        css(dragEl, "transform", "translateZ(0)");
      }
      awaitingDragStarted = true;
      _this._dragStartId = _nextTick(_this._dragStarted.bind(_this, fallback, evt));
      on(document, "selectstart", _this);
      moved = true;
      if (Safari) {
        css(document.body, "user-select", "none");
      }
    },
    // Returns true - if no further action is needed (either inserted or another condition)
    _onDragOver: function _onDragOver(evt) {
      var el = this.el, target = evt.target, dragRect, targetRect, revert, options = this.options, group = options.group, activeSortable = Sortable.active, isOwner = activeGroup === group, canSort = options.sort, fromSortable = putSortable || activeSortable, vertical, _this = this, completedFired = false;
      if (_silent)
        return;
      function dragOverEvent(name, extra) {
        pluginEvent2(name, _this, _objectSpread({
          evt,
          isOwner,
          axis: vertical ? "vertical" : "horizontal",
          revert,
          dragRect,
          targetRect,
          canSort,
          fromSortable,
          target,
          completed,
          onMove: function onMove(target2, after2) {
            return _onMove(rootEl, el, dragEl, dragRect, target2, getRect(target2), evt, after2);
          },
          changed
        }, extra));
      }
      function capture() {
        dragOverEvent("dragOverAnimationCapture");
        _this.captureAnimationState();
        if (_this !== fromSortable) {
          fromSortable.captureAnimationState();
        }
      }
      function completed(insertion) {
        dragOverEvent("dragOverCompleted", {
          insertion
        });
        if (insertion) {
          if (isOwner) {
            activeSortable._hideClone();
          } else {
            activeSortable._showClone(_this);
          }
          if (_this !== fromSortable) {
            toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : activeSortable.options.ghostClass, false);
            toggleClass(dragEl, options.ghostClass, true);
          }
          if (putSortable !== _this && _this !== Sortable.active) {
            putSortable = _this;
          } else if (_this === Sortable.active && putSortable) {
            putSortable = null;
          }
          if (fromSortable === _this) {
            _this._ignoreWhileAnimating = target;
          }
          _this.animateAll(function() {
            dragOverEvent("dragOverAnimationComplete");
            _this._ignoreWhileAnimating = null;
          });
          if (_this !== fromSortable) {
            fromSortable.animateAll();
            fromSortable._ignoreWhileAnimating = null;
          }
        }
        if (target === dragEl && !dragEl.animated || target === el && !target.animated) {
          lastTarget = null;
        }
        if (!options.dragoverBubble && !evt.rootEl && target !== document) {
          dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
          !insertion && nearestEmptyInsertDetectEvent(evt);
        }
        !options.dragoverBubble && evt.stopPropagation && evt.stopPropagation();
        return completedFired = true;
      }
      function changed() {
        newIndex = index(dragEl);
        newDraggableIndex = index(dragEl, options.draggable);
        _dispatchEvent({
          sortable: _this,
          name: "change",
          toEl: el,
          newIndex,
          newDraggableIndex,
          originalEvent: evt
        });
      }
      if (evt.preventDefault !== void 0) {
        evt.cancelable && evt.preventDefault();
      }
      target = closest(target, options.draggable, el, true);
      dragOverEvent("dragOver");
      if (Sortable.eventCanceled)
        return completedFired;
      if (dragEl.contains(evt.target) || target.animated && target.animatingX && target.animatingY || _this._ignoreWhileAnimating === target) {
        return completed(false);
      }
      ignoreNextClick = false;
      if (activeSortable && !options.disabled && (isOwner ? canSort || (revert = !rootEl.contains(dragEl)) : putSortable === this || (this.lastPutMode = activeGroup.checkPull(this, activeSortable, dragEl, evt)) && group.checkPut(this, activeSortable, dragEl, evt))) {
        vertical = this._getDirection(evt, target) === "vertical";
        dragRect = getRect(dragEl);
        dragOverEvent("dragOverValid");
        if (Sortable.eventCanceled)
          return completedFired;
        if (revert) {
          parentEl = rootEl;
          capture();
          this._hideClone();
          dragOverEvent("revert");
          if (!Sortable.eventCanceled) {
            if (nextEl) {
              rootEl.insertBefore(dragEl, nextEl);
            } else {
              rootEl.appendChild(dragEl);
            }
          }
          return completed(true);
        }
        var elLastChild = lastChild(el, options.draggable);
        if (!elLastChild || _ghostIsLast(evt, vertical, this) && !elLastChild.animated) {
          if (elLastChild === dragEl) {
            return completed(false);
          }
          if (elLastChild && el === evt.target) {
            target = elLastChild;
          }
          if (target) {
            targetRect = getRect(target);
          }
          if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, !!target) !== false) {
            capture();
            el.appendChild(dragEl);
            parentEl = el;
            changed();
            return completed(true);
          }
        } else if (target.parentNode === el) {
          targetRect = getRect(target);
          var direction = 0, targetBeforeFirstSwap, differentLevel = dragEl.parentNode !== el, differentRowCol = !_dragElInRowColumn(dragEl.animated && dragEl.toRect || dragRect, target.animated && target.toRect || targetRect, vertical), side1 = vertical ? "top" : "left", scrolledPastTop = isScrolledPast(target, "top", "top") || isScrolledPast(dragEl, "top", "top"), scrollBefore = scrolledPastTop ? scrolledPastTop.scrollTop : void 0;
          if (lastTarget !== target) {
            targetBeforeFirstSwap = targetRect[side1];
            pastFirstInvertThresh = false;
            isCircumstantialInvert = !differentRowCol && options.invertSwap || differentLevel;
          }
          direction = _getSwapDirection(evt, target, targetRect, vertical, differentRowCol ? 1 : options.swapThreshold, options.invertedSwapThreshold == null ? options.swapThreshold : options.invertedSwapThreshold, isCircumstantialInvert, lastTarget === target);
          var sibling;
          if (direction !== 0) {
            var dragIndex = index(dragEl);
            do {
              dragIndex -= direction;
              sibling = parentEl.children[dragIndex];
            } while (sibling && (css(sibling, "display") === "none" || sibling === ghostEl));
          }
          if (direction === 0 || sibling === target) {
            return completed(false);
          }
          lastTarget = target;
          lastDirection = direction;
          var nextSibling = target.nextElementSibling, after = false;
          after = direction === 1;
          var moveVector = _onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, after);
          if (moveVector !== false) {
            if (moveVector === 1 || moveVector === -1) {
              after = moveVector === 1;
            }
            _silent = true;
            setTimeout(_unsilent, 30);
            capture();
            if (after && !nextSibling) {
              el.appendChild(dragEl);
            } else {
              target.parentNode.insertBefore(dragEl, after ? nextSibling : target);
            }
            if (scrolledPastTop) {
              scrollBy(scrolledPastTop, 0, scrollBefore - scrolledPastTop.scrollTop);
            }
            parentEl = dragEl.parentNode;
            if (targetBeforeFirstSwap !== void 0 && !isCircumstantialInvert) {
              targetMoveDistance = Math.abs(targetBeforeFirstSwap - getRect(target)[side1]);
            }
            changed();
            return completed(true);
          }
        }
        if (el.contains(dragEl)) {
          return completed(false);
        }
      }
      return false;
    },
    _ignoreWhileAnimating: null,
    _offMoveEvents: function _offMoveEvents() {
      off(document, "mousemove", this._onTouchMove);
      off(document, "touchmove", this._onTouchMove);
      off(document, "pointermove", this._onTouchMove);
      off(document, "dragover", nearestEmptyInsertDetectEvent);
      off(document, "mousemove", nearestEmptyInsertDetectEvent);
      off(document, "touchmove", nearestEmptyInsertDetectEvent);
    },
    _offUpEvents: function _offUpEvents() {
      var ownerDocument = this.el.ownerDocument;
      off(ownerDocument, "mouseup", this._onDrop);
      off(ownerDocument, "touchend", this._onDrop);
      off(ownerDocument, "pointerup", this._onDrop);
      off(ownerDocument, "touchcancel", this._onDrop);
      off(document, "selectstart", this);
    },
    _onDrop: function _onDrop(evt) {
      var el = this.el, options = this.options;
      newIndex = index(dragEl);
      newDraggableIndex = index(dragEl, options.draggable);
      pluginEvent2("drop", this, {
        evt
      });
      parentEl = dragEl && dragEl.parentNode;
      newIndex = index(dragEl);
      newDraggableIndex = index(dragEl, options.draggable);
      if (Sortable.eventCanceled) {
        this._nulling();
        return;
      }
      awaitingDragStarted = false;
      isCircumstantialInvert = false;
      pastFirstInvertThresh = false;
      clearInterval(this._loopId);
      clearTimeout(this._dragStartTimer);
      _cancelNextTick(this.cloneId);
      _cancelNextTick(this._dragStartId);
      if (this.nativeDraggable) {
        off(document, "drop", this);
        off(el, "dragstart", this._onDragStart);
      }
      this._offMoveEvents();
      this._offUpEvents();
      if (Safari) {
        css(document.body, "user-select", "");
      }
      css(dragEl, "transform", "");
      if (evt) {
        if (moved) {
          evt.cancelable && evt.preventDefault();
          !options.dropBubble && evt.stopPropagation();
        }
        ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);
        if (rootEl === parentEl || putSortable && putSortable.lastPutMode !== "clone") {
          cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
        }
        if (dragEl) {
          if (this.nativeDraggable) {
            off(dragEl, "dragend", this);
          }
          _disableDraggable(dragEl);
          dragEl.style["will-change"] = "";
          if (moved && !awaitingDragStarted) {
            toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : this.options.ghostClass, false);
          }
          toggleClass(dragEl, this.options.chosenClass, false);
          _dispatchEvent({
            sortable: this,
            name: "unchoose",
            toEl: parentEl,
            newIndex: null,
            newDraggableIndex: null,
            originalEvent: evt
          });
          if (rootEl !== parentEl) {
            if (newIndex >= 0) {
              _dispatchEvent({
                rootEl: parentEl,
                name: "add",
                toEl: parentEl,
                fromEl: rootEl,
                originalEvent: evt
              });
              _dispatchEvent({
                sortable: this,
                name: "remove",
                toEl: parentEl,
                originalEvent: evt
              });
              _dispatchEvent({
                rootEl: parentEl,
                name: "sort",
                toEl: parentEl,
                fromEl: rootEl,
                originalEvent: evt
              });
              _dispatchEvent({
                sortable: this,
                name: "sort",
                toEl: parentEl,
                originalEvent: evt
              });
            }
            putSortable && putSortable.save();
          } else {
            if (newIndex !== oldIndex) {
              if (newIndex >= 0) {
                _dispatchEvent({
                  sortable: this,
                  name: "update",
                  toEl: parentEl,
                  originalEvent: evt
                });
                _dispatchEvent({
                  sortable: this,
                  name: "sort",
                  toEl: parentEl,
                  originalEvent: evt
                });
              }
            }
          }
          if (Sortable.active) {
            if (newIndex == null || newIndex === -1) {
              newIndex = oldIndex;
              newDraggableIndex = oldDraggableIndex;
            }
            _dispatchEvent({
              sortable: this,
              name: "end",
              toEl: parentEl,
              originalEvent: evt
            });
            this.save();
          }
        }
      }
      this._nulling();
    },
    _nulling: function _nulling() {
      pluginEvent2("nulling", this);
      rootEl = dragEl = parentEl = ghostEl = nextEl = cloneEl = lastDownEl = cloneHidden = tapEvt = touchEvt = moved = newIndex = newDraggableIndex = oldIndex = oldDraggableIndex = lastTarget = lastDirection = putSortable = activeGroup = Sortable.dragged = Sortable.ghost = Sortable.clone = Sortable.active = null;
      savedInputChecked.forEach(function(el) {
        el.checked = true;
      });
      savedInputChecked.length = lastDx = lastDy = 0;
    },
    handleEvent: function handleEvent(evt) {
      switch (evt.type) {
        case "drop":
        case "dragend":
          this._onDrop(evt);
          break;
        case "dragenter":
        case "dragover":
          if (dragEl) {
            this._onDragOver(evt);
            _globalDragOver(evt);
          }
          break;
        case "selectstart":
          evt.preventDefault();
          break;
      }
    },
    /**
     * Serializes the item into an array of string.
     * @returns {String[]}
     */
    toArray: function toArray() {
      var order = [], el, children = this.el.children, i = 0, n = children.length, options = this.options;
      for (; i < n; i++) {
        el = children[i];
        if (closest(el, options.draggable, this.el, false)) {
          order.push(el.getAttribute(options.dataIdAttr) || _generateId(el));
        }
      }
      return order;
    },
    /**
     * Sorts the elements according to the array.
     * @param  {String[]}  order  order of the items
     */
    sort: function sort(order, useAnimation) {
      var items = {}, rootEl2 = this.el;
      this.toArray().forEach(function(id, i) {
        var el = rootEl2.children[i];
        if (closest(el, this.options.draggable, rootEl2, false)) {
          items[id] = el;
        }
      }, this);
      useAnimation && this.captureAnimationState();
      order.forEach(function(id) {
        if (items[id]) {
          rootEl2.removeChild(items[id]);
          rootEl2.appendChild(items[id]);
        }
      });
      useAnimation && this.animateAll();
    },
    /**
     * Save the current sorting
     */
    save: function save() {
      var store = this.options.store;
      store && store.set && store.set(this);
    },
    /**
     * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
     * @param   {HTMLElement}  el
     * @param   {String}       [selector]  default: `options.draggable`
     * @returns {HTMLElement|null}
     */
    closest: function closest$1(el, selector) {
      return closest(el, selector || this.options.draggable, this.el, false);
    },
    /**
     * Set/get option
     * @param   {string} name
     * @param   {*}      [value]
     * @returns {*}
     */
    option: function option(name, value) {
      var options = this.options;
      if (value === void 0) {
        return options[name];
      } else {
        var modifiedValue = PluginManager.modifyOption(this, name, value);
        if (typeof modifiedValue !== "undefined") {
          options[name] = modifiedValue;
        } else {
          options[name] = value;
        }
        if (name === "group") {
          _prepareGroup(options);
        }
      }
    },
    /**
     * Destroy
     */
    destroy: function destroy() {
      pluginEvent2("destroy", this);
      var el = this.el;
      el[expando] = null;
      off(el, "mousedown", this._onTapStart);
      off(el, "touchstart", this._onTapStart);
      off(el, "pointerdown", this._onTapStart);
      if (this.nativeDraggable) {
        off(el, "dragover", this);
        off(el, "dragenter", this);
      }
      Array.prototype.forEach.call(el.querySelectorAll("[draggable]"), function(el2) {
        el2.removeAttribute("draggable");
      });
      this._onDrop();
      this._disableDelayedDragEvents();
      sortables.splice(sortables.indexOf(this.el), 1);
      this.el = el = null;
    },
    _hideClone: function _hideClone() {
      if (!cloneHidden) {
        pluginEvent2("hideClone", this);
        if (Sortable.eventCanceled)
          return;
        css(cloneEl, "display", "none");
        if (this.options.removeCloneOnHide && cloneEl.parentNode) {
          cloneEl.parentNode.removeChild(cloneEl);
        }
        cloneHidden = true;
      }
    },
    _showClone: function _showClone(putSortable2) {
      if (putSortable2.lastPutMode !== "clone") {
        this._hideClone();
        return;
      }
      if (cloneHidden) {
        pluginEvent2("showClone", this);
        if (Sortable.eventCanceled)
          return;
        if (dragEl.parentNode == rootEl && !this.options.group.revertClone) {
          rootEl.insertBefore(cloneEl, dragEl);
        } else if (nextEl) {
          rootEl.insertBefore(cloneEl, nextEl);
        } else {
          rootEl.appendChild(cloneEl);
        }
        if (this.options.group.revertClone) {
          this.animate(dragEl, cloneEl);
        }
        css(cloneEl, "display", "");
        cloneHidden = false;
      }
    }
  };
  function _globalDragOver(evt) {
    if (evt.dataTransfer) {
      evt.dataTransfer.dropEffect = "move";
    }
    evt.cancelable && evt.preventDefault();
  }
  function _onMove(fromEl, toEl, dragEl2, dragRect, targetEl, targetRect, originalEvent, willInsertAfter) {
    var evt, sortable = fromEl[expando], onMoveFn = sortable.options.onMove, retVal;
    if (window.CustomEvent && !IE11OrLess && !Edge) {
      evt = new CustomEvent("move", {
        bubbles: true,
        cancelable: true
      });
    } else {
      evt = document.createEvent("Event");
      evt.initEvent("move", true, true);
    }
    evt.to = toEl;
    evt.from = fromEl;
    evt.dragged = dragEl2;
    evt.draggedRect = dragRect;
    evt.related = targetEl || toEl;
    evt.relatedRect = targetRect || getRect(toEl);
    evt.willInsertAfter = willInsertAfter;
    evt.originalEvent = originalEvent;
    fromEl.dispatchEvent(evt);
    if (onMoveFn) {
      retVal = onMoveFn.call(sortable, evt, originalEvent);
    }
    return retVal;
  }
  function _disableDraggable(el) {
    el.draggable = false;
  }
  function _unsilent() {
    _silent = false;
  }
  function _ghostIsLast(evt, vertical, sortable) {
    var rect = getRect(lastChild(sortable.el, sortable.options.draggable));
    var spacer = 10;
    return vertical ? evt.clientX > rect.right + spacer || evt.clientX <= rect.right && evt.clientY > rect.bottom && evt.clientX >= rect.left : evt.clientX > rect.right && evt.clientY > rect.top || evt.clientX <= rect.right && evt.clientY > rect.bottom + spacer;
  }
  function _getSwapDirection(evt, target, targetRect, vertical, swapThreshold, invertedSwapThreshold, invertSwap, isLastTarget) {
    var mouseOnAxis = vertical ? evt.clientY : evt.clientX, targetLength = vertical ? targetRect.height : targetRect.width, targetS1 = vertical ? targetRect.top : targetRect.left, targetS2 = vertical ? targetRect.bottom : targetRect.right, invert = false;
    if (!invertSwap) {
      if (isLastTarget && targetMoveDistance < targetLength * swapThreshold) {
        if (!pastFirstInvertThresh && (lastDirection === 1 ? mouseOnAxis > targetS1 + targetLength * invertedSwapThreshold / 2 : mouseOnAxis < targetS2 - targetLength * invertedSwapThreshold / 2)) {
          pastFirstInvertThresh = true;
        }
        if (!pastFirstInvertThresh) {
          if (lastDirection === 1 ? mouseOnAxis < targetS1 + targetMoveDistance : mouseOnAxis > targetS2 - targetMoveDistance) {
            return -lastDirection;
          }
        } else {
          invert = true;
        }
      } else {
        if (mouseOnAxis > targetS1 + targetLength * (1 - swapThreshold) / 2 && mouseOnAxis < targetS2 - targetLength * (1 - swapThreshold) / 2) {
          return _getInsertDirection(target);
        }
      }
    }
    invert = invert || invertSwap;
    if (invert) {
      if (mouseOnAxis < targetS1 + targetLength * invertedSwapThreshold / 2 || mouseOnAxis > targetS2 - targetLength * invertedSwapThreshold / 2) {
        return mouseOnAxis > targetS1 + targetLength / 2 ? 1 : -1;
      }
    }
    return 0;
  }
  function _getInsertDirection(target) {
    if (index(dragEl) < index(target)) {
      return 1;
    } else {
      return -1;
    }
  }
  function _generateId(el) {
    var str = el.tagName + el.className + el.src + el.href + el.textContent, i = str.length, sum = 0;
    while (i--) {
      sum += str.charCodeAt(i);
    }
    return sum.toString(36);
  }
  function _saveInputCheckedState(root) {
    savedInputChecked.length = 0;
    var inputs = root.getElementsByTagName("input");
    var idx = inputs.length;
    while (idx--) {
      var el = inputs[idx];
      el.checked && savedInputChecked.push(el);
    }
  }
  function _nextTick(fn) {
    return setTimeout(fn, 0);
  }
  function _cancelNextTick(id) {
    return clearTimeout(id);
  }
  if (documentExists) {
    on(document, "touchmove", function(evt) {
      if ((Sortable.active || awaitingDragStarted) && evt.cancelable) {
        evt.preventDefault();
      }
    });
  }
  Sortable.utils = {
    on,
    off,
    css,
    find,
    is: function is(el, selector) {
      return !!closest(el, selector, el, false);
    },
    extend: extend3,
    throttle,
    closest,
    toggleClass,
    clone,
    index,
    nextTick: _nextTick,
    cancelNextTick: _cancelNextTick,
    detectDirection: _detectDirection,
    getChild
  };
  Sortable.get = function(element) {
    return element[expando];
  };
  Sortable.mount = function() {
    for (var _len = arguments.length, plugins2 = new Array(_len), _key = 0; _key < _len; _key++) {
      plugins2[_key] = arguments[_key];
    }
    if (plugins2[0].constructor === Array)
      plugins2 = plugins2[0];
    plugins2.forEach(function(plugin) {
      if (!plugin.prototype || !plugin.prototype.constructor) {
        throw "Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(plugin));
      }
      if (plugin.utils)
        Sortable.utils = _objectSpread({}, Sortable.utils, plugin.utils);
      PluginManager.mount(plugin);
    });
  };
  Sortable.create = function(el, options) {
    return new Sortable(el, options);
  };
  Sortable.version = version;
  var autoScrolls = [];
  var scrollEl;
  var scrollRootEl;
  var scrolling = false;
  var lastAutoScrollX;
  var lastAutoScrollY;
  var touchEvt$1;
  var pointerElemChangedInterval;
  function AutoScrollPlugin() {
    function AutoScroll() {
      this.defaults = {
        scroll: true,
        scrollSensitivity: 30,
        scrollSpeed: 10,
        bubbleScroll: true
      };
      for (var fn in this) {
        if (fn.charAt(0) === "_" && typeof this[fn] === "function") {
          this[fn] = this[fn].bind(this);
        }
      }
    }
    AutoScroll.prototype = {
      dragStarted: function dragStarted(_ref) {
        var originalEvent = _ref.originalEvent;
        if (this.sortable.nativeDraggable) {
          on(document, "dragover", this._handleAutoScroll);
        } else {
          if (this.options.supportPointer) {
            on(document, "pointermove", this._handleFallbackAutoScroll);
          } else if (originalEvent.touches) {
            on(document, "touchmove", this._handleFallbackAutoScroll);
          } else {
            on(document, "mousemove", this._handleFallbackAutoScroll);
          }
        }
      },
      dragOverCompleted: function dragOverCompleted(_ref2) {
        var originalEvent = _ref2.originalEvent;
        if (!this.options.dragOverBubble && !originalEvent.rootEl) {
          this._handleAutoScroll(originalEvent);
        }
      },
      drop: function drop3() {
        if (this.sortable.nativeDraggable) {
          off(document, "dragover", this._handleAutoScroll);
        } else {
          off(document, "pointermove", this._handleFallbackAutoScroll);
          off(document, "touchmove", this._handleFallbackAutoScroll);
          off(document, "mousemove", this._handleFallbackAutoScroll);
        }
        clearPointerElemChangedInterval();
        clearAutoScrolls();
        cancelThrottle();
      },
      nulling: function nulling() {
        touchEvt$1 = scrollRootEl = scrollEl = scrolling = pointerElemChangedInterval = lastAutoScrollX = lastAutoScrollY = null;
        autoScrolls.length = 0;
      },
      _handleFallbackAutoScroll: function _handleFallbackAutoScroll(evt) {
        this._handleAutoScroll(evt, true);
      },
      _handleAutoScroll: function _handleAutoScroll(evt, fallback) {
        var _this = this;
        var x = (evt.touches ? evt.touches[0] : evt).clientX, y = (evt.touches ? evt.touches[0] : evt).clientY, elem = document.elementFromPoint(x, y);
        touchEvt$1 = evt;
        if (fallback || Edge || IE11OrLess || Safari) {
          autoScroll(evt, this.options, elem, fallback);
          var ogElemScroller = getParentAutoScrollElement(elem, true);
          if (scrolling && (!pointerElemChangedInterval || x !== lastAutoScrollX || y !== lastAutoScrollY)) {
            pointerElemChangedInterval && clearPointerElemChangedInterval();
            pointerElemChangedInterval = setInterval(function() {
              var newElem = getParentAutoScrollElement(document.elementFromPoint(x, y), true);
              if (newElem !== ogElemScroller) {
                ogElemScroller = newElem;
                clearAutoScrolls();
              }
              autoScroll(evt, _this.options, newElem, fallback);
            }, 10);
            lastAutoScrollX = x;
            lastAutoScrollY = y;
          }
        } else {
          if (!this.options.bubbleScroll || getParentAutoScrollElement(elem, true) === getWindowScrollingElement()) {
            clearAutoScrolls();
            return;
          }
          autoScroll(evt, this.options, getParentAutoScrollElement(elem, false), false);
        }
      }
    };
    return _extends(AutoScroll, {
      pluginName: "scroll",
      initializeByDefault: true
    });
  }
  function clearAutoScrolls() {
    autoScrolls.forEach(function(autoScroll2) {
      clearInterval(autoScroll2.pid);
    });
    autoScrolls = [];
  }
  function clearPointerElemChangedInterval() {
    clearInterval(pointerElemChangedInterval);
  }
  var autoScroll = throttle(function(evt, options, rootEl2, isFallback) {
    if (!options.scroll)
      return;
    var x = (evt.touches ? evt.touches[0] : evt).clientX, y = (evt.touches ? evt.touches[0] : evt).clientY, sens = options.scrollSensitivity, speed = options.scrollSpeed, winScroller = getWindowScrollingElement();
    var scrollThisInstance = false, scrollCustomFn;
    if (scrollRootEl !== rootEl2) {
      scrollRootEl = rootEl2;
      clearAutoScrolls();
      scrollEl = options.scroll;
      scrollCustomFn = options.scrollFn;
      if (scrollEl === true) {
        scrollEl = getParentAutoScrollElement(rootEl2, true);
      }
    }
    var layersOut = 0;
    var currentParent = scrollEl;
    do {
      var el = currentParent, rect = getRect(el), top = rect.top, bottom = rect.bottom, left = rect.left, right = rect.right, width = rect.width, height = rect.height, canScrollX = void 0, canScrollY = void 0, scrollWidth = el.scrollWidth, scrollHeight = el.scrollHeight, elCSS = css(el), scrollPosX = el.scrollLeft, scrollPosY = el.scrollTop;
      if (el === winScroller) {
        canScrollX = width < scrollWidth && (elCSS.overflowX === "auto" || elCSS.overflowX === "scroll" || elCSS.overflowX === "visible");
        canScrollY = height < scrollHeight && (elCSS.overflowY === "auto" || elCSS.overflowY === "scroll" || elCSS.overflowY === "visible");
      } else {
        canScrollX = width < scrollWidth && (elCSS.overflowX === "auto" || elCSS.overflowX === "scroll");
        canScrollY = height < scrollHeight && (elCSS.overflowY === "auto" || elCSS.overflowY === "scroll");
      }
      var vx = canScrollX && (Math.abs(right - x) <= sens && scrollPosX + width < scrollWidth) - (Math.abs(left - x) <= sens && !!scrollPosX);
      var vy = canScrollY && (Math.abs(bottom - y) <= sens && scrollPosY + height < scrollHeight) - (Math.abs(top - y) <= sens && !!scrollPosY);
      if (!autoScrolls[layersOut]) {
        for (var i = 0; i <= layersOut; i++) {
          if (!autoScrolls[i]) {
            autoScrolls[i] = {};
          }
        }
      }
      if (autoScrolls[layersOut].vx != vx || autoScrolls[layersOut].vy != vy || autoScrolls[layersOut].el !== el) {
        autoScrolls[layersOut].el = el;
        autoScrolls[layersOut].vx = vx;
        autoScrolls[layersOut].vy = vy;
        clearInterval(autoScrolls[layersOut].pid);
        if (vx != 0 || vy != 0) {
          scrollThisInstance = true;
          autoScrolls[layersOut].pid = setInterval(function() {
            if (isFallback && this.layer === 0) {
              Sortable.active._onTouchMove(touchEvt$1);
            }
            var scrollOffsetY = autoScrolls[this.layer].vy ? autoScrolls[this.layer].vy * speed : 0;
            var scrollOffsetX = autoScrolls[this.layer].vx ? autoScrolls[this.layer].vx * speed : 0;
            if (typeof scrollCustomFn === "function") {
              if (scrollCustomFn.call(Sortable.dragged.parentNode[expando], scrollOffsetX, scrollOffsetY, evt, touchEvt$1, autoScrolls[this.layer].el) !== "continue") {
                return;
              }
            }
            scrollBy(autoScrolls[this.layer].el, scrollOffsetX, scrollOffsetY);
          }.bind({
            layer: layersOut
          }), 24);
        }
      }
      layersOut++;
    } while (options.bubbleScroll && currentParent !== winScroller && (currentParent = getParentAutoScrollElement(currentParent, false)));
    scrolling = scrollThisInstance;
  }, 30);
  var drop = function drop2(_ref) {
    var originalEvent = _ref.originalEvent, putSortable2 = _ref.putSortable, dragEl2 = _ref.dragEl, activeSortable = _ref.activeSortable, dispatchSortableEvent = _ref.dispatchSortableEvent, hideGhostForTarget = _ref.hideGhostForTarget, unhideGhostForTarget = _ref.unhideGhostForTarget;
    if (!originalEvent)
      return;
    var toSortable = putSortable2 || activeSortable;
    hideGhostForTarget();
    var touch = originalEvent.changedTouches && originalEvent.changedTouches.length ? originalEvent.changedTouches[0] : originalEvent;
    var target = document.elementFromPoint(touch.clientX, touch.clientY);
    unhideGhostForTarget();
    if (toSortable && !toSortable.el.contains(target)) {
      dispatchSortableEvent("spill");
      this.onSpill({
        dragEl: dragEl2,
        putSortable: putSortable2
      });
    }
  };
  function Revert() {
  }
  Revert.prototype = {
    startIndex: null,
    dragStart: function dragStart(_ref2) {
      var oldDraggableIndex2 = _ref2.oldDraggableIndex;
      this.startIndex = oldDraggableIndex2;
    },
    onSpill: function onSpill(_ref3) {
      var dragEl2 = _ref3.dragEl, putSortable2 = _ref3.putSortable;
      this.sortable.captureAnimationState();
      if (putSortable2) {
        putSortable2.captureAnimationState();
      }
      var nextSibling = getChild(this.sortable.el, this.startIndex, this.options);
      if (nextSibling) {
        this.sortable.el.insertBefore(dragEl2, nextSibling);
      } else {
        this.sortable.el.appendChild(dragEl2);
      }
      this.sortable.animateAll();
      if (putSortable2) {
        putSortable2.animateAll();
      }
    },
    drop
  };
  _extends(Revert, {
    pluginName: "revertOnSpill"
  });
  function Remove() {
  }
  Remove.prototype = {
    onSpill: function onSpill2(_ref4) {
      var dragEl2 = _ref4.dragEl, putSortable2 = _ref4.putSortable;
      var parentSortable = putSortable2 || this.sortable;
      parentSortable.captureAnimationState();
      dragEl2.parentNode && dragEl2.parentNode.removeChild(dragEl2);
      parentSortable.animateAll();
    },
    drop
  };
  _extends(Remove, {
    pluginName: "removeOnSpill"
  });
  Sortable.mount(new AutoScrollPlugin());
  Sortable.mount(Remove, Revert);
  var sortablejs_1_13_0_default = Sortable;

  // controllers/image_collection_controller.js
  var image_collection_controller_default = class extends Controller {
    static get targets() {
      return ["collection", "fields"];
    }
    connect() {
      setTimeout(function() {
        this.sortable = sortablejs_1_13_0_default.create(this.collectionTarget, {
          animation: 150
        });
      }.bind(this), 250);
    }
    removeImage(event) {
      let id = event.currentTarget.dataset.id;
      let image = document.getElementById(id);
      image.parentElement.removeChild(image);
    }
    handleDone(event) {
      let html = this.element.dataset.fields;
      let range = document.createRange();
      range.selectNodeContents(document.body);
      let fragment = range.createContextualFragment(html);
      fragment.querySelector(`[data-media-picker-target="signedBlobId"]`).value = event.detail.signedBlobId;
      fragment.querySelector(`[data-media-picker-target="filename"]`).value = event.detail.filename;
      fragment.querySelector(`[data-media-picker-target="imageId"]`).value = event.detail.imageId;
      fragment.querySelector("img").src = event.detail.thumbnail;
      this.collectionTarget.appendChild(fragment);
    }
  };

  // controllers/image_fade_in_controller.js
  var image_fade_in_controller_exports = {};
  __export(image_fade_in_controller_exports, {
    default: () => image_fade_in_controller_default
  });
  var image_fade_in_controller_default = class extends Controller {
    connect() {
      if (!this.loaded) {
        this.element.classList.add("transition-opacity", "duration-500", "opacity-0");
        this.element.addEventListener("load", this.fadeIn.bind(this));
      }
    }
    fadeIn() {
      this.element.classList.remove("opacity-0");
    }
    get loaded() {
      return this.element.complete && this.element.naturalHeight !== 0;
    }
  };

  // controllers/infinite_scroll_controller.js
  var infinite_scroll_controller_exports = {};
  __export(infinite_scroll_controller_exports, {
    default: () => infinite_scroll_controller_default
  });
  var infinite_scroll_controller_default = class extends Controller {
    static get targets() {
      return ["button", "container"];
    }
    connect() {
      this.scrollElement.addEventListener("scroll", this.load.bind(this));
      this.load();
    }
    disconnect() {
      this.scrollElement.removeEventListener("scroll", this.load.bind(this));
    }
    load() {
      if (this.hasButtonTarget) {
        let top = this.buttonTarget.getBoundingClientRect().top;
        if (top < window.innerHeight + 500) {
          this.buttonTarget.click();
          this.buttonTarget.remove();
        }
      }
    }
    get scrollElement() {
      if (this.hasContainerTarget) {
        return this.containerTarget;
      } else {
        return document.getElementById("main");
      }
    }
  };

  // controllers/loading_button_controller.js
  var loading_button_controller_exports = {};
  __export(loading_button_controller_exports, {
    default: () => loading_button_controller_default
  });
  var loading_button_controller_default = class extends Controller {
    static get targets() {
      return ["button"];
    }
    connect() {
      this.element[this.identifier] = this;
    }
    doneLoading() {
      this.buttonTarget.style.width = "auto";
      this.buttonTarget.innerHTML = this.originalHTML;
    }
    loading() {
      this.buttonTarget.style.width = `${this.element.offsetWidth}px`;
      this.originalHTML = this.buttonTarget.innerHTML;
      this.buttonTarget.innerHTML = `
			<svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
			${this.element.dataset.loadingMessage}
		`;
    }
    get originalHTML() {
      return this.original_html;
    }
    set originalHTML(html) {
      this.original_html = html;
    }
  };

  // controllers/media_picker_controller.js
  var media_picker_controller_exports = {};
  __export(media_picker_controller_exports, {
    default: () => media_picker_controller_default
  });
  var media_picker_controller_default = class extends Controller {
    static get targets() {
      return ["filename", "signedBlobId", "imageId", "alt", "thumbnail", "clearButton"];
    }
    connect() {
      if (this.hasThumbnailTarget && this.thumbnailTarget.children.length == 0)
        this.hideThumbnail();
    }
    removeImage() {
      this.imageIdTarget.value = "";
      if (this.hasFilenameTarget)
        this.filenameTarget.value = "";
      if (this.hasSignedBlobIdTarget)
        this.signedBlobIdTarget.value = "";
      if (this.hasAltTarget)
        this.altTarget.value = "";
      this.hideThumbnail();
    }
    handleDone(event) {
      if (this.hasFilenameTarget)
        this.filenameTarget.value = event.detail.filename;
      if (this.hasSignedBlobIdTarget)
        this.signedBlobIdTarget.value = event.detail.signedBlobId;
      this.imageIdTarget.value = event.detail.imageId;
      this.setThumbnail(event.detail.thumbnail);
    }
    setThumbnail(imageSrc) {
      this.thumbnailTarget.innerHTML = `<img src="${imageSrc}" class="object-contain w-full h-36" />`;
      this.showThumbnail();
    }
    showThumbnail() {
      this.thumbnailTarget.classList.remove("hidden");
      this.clearButtonTarget.classList.remove("hidden");
    }
    hideThumbnail() {
      this.thumbnailTarget.classList.add("hidden");
      this.clearButtonTarget.classList.add("hidden");
    }
  };

  // controllers/media_picker_modal_controller.js
  var media_picker_modal_controller_exports = {};
  __export(media_picker_modal_controller_exports, {
    default: () => media_picker_modal_controller_default
  });
  var media_picker_modal_controller_default = class extends Controller {
    selectImage(event) {
      let image = event.currentTarget;
      this.image = image;
    }
    instantInsert(event) {
      this.confirm(event);
      this.element.closest(".modal").modal.close();
    }
    confirm(event) {
      let imageSelectedEvent = new CustomEvent("media-picker:done", { detail: this.imageData });
      this.target.dispatchEvent(imageSelectedEvent);
    }
    get target() {
      return document.getElementById(this.element.dataset.target);
    }
    get imageData() {
      return {
        filename: this.image.dataset.filename,
        signedBlobId: this.image.dataset.signedBlobId,
        imageId: this.image.dataset.imageId,
        embeddedUrl: this.image.dataset.embeddedUrl,
        thumbnail: this.image.dataset.thumbnail
      };
    }
  };

  // controllers/modal_controller.js
  var modal_controller_exports = {};
  __export(modal_controller_exports, {
    default: () => modal_controller_default
  });
  var modal_controller_default = class extends Controller {
    connect() {
      this.element[this.identifier] = this;
    }
    close() {
      this.element.remove();
      this.modalTurboFrame.src = null;
    }
    escClose(event) {
      if (event.key === "Escape")
        this.close();
    }
    get modalTurboFrame() {
      return document.querySelector("turbo-frame[id='modal']");
    }
  };

  // controllers/navigation_controller.js
  var navigation_controller_exports = {};
  __export(navigation_controller_exports, {
    default: () => navigation_controller_default
  });
  var navigation_controller_default = class extends Controller {
    static get targets() {
      return ["primary", "button", "navigation", "label"];
    }
    connect() {
      if (window.innerWidth < 768) {
        this.closeAllNavigations();
      }
    }
    toggleNavigation(navigation) {
      let ul = navigation.querySelector("ul");
      if (ul.classList.contains("translate-x-full")) {
        this.primaryTarget.classList.add("md:bg-opacity-50");
        this.labelTargets.forEach(function(label) {
          label.classList.add("-translate-x-2");
          this.switchClass(label, "opacity-100", "opacity-0");
        }.bind(this));
        this.switchClass(navigation.querySelector("ul"), "translate-x-full", "md:translate-x-20");
      } else {
        this.primaryTarget.classList.remove("md:bg-opacity-50");
        this.labelTargets.forEach(function(label) {
          label.classList.remove("-translate-x-2");
          this.switchClass(label, "opacity-0", "opacity-100");
        }.bind(this));
        this.switchClass(navigation.querySelector("ul"), "md:translate-x-20", "translate-x-full");
      }
    }
    toggle(event) {
      let button = event.currentTarget;
      let closed = button.nextElementSibling.classList.contains("translate-x-full");
      this.closeAllNavigations();
      if (closed) {
        this.switchClass(button, "opacity-50", "opacity-100");
        this.toggleNavigation(button.parentElement);
      }
    }
    closeAllNavigations() {
      this.buttonTargets.forEach(function(button) {
        this.switchClass(button, "opacity-100", "opacity-50");
      }.bind(this));
      this.backToFirstLevel();
    }
    backToFirstLevel() {
      this.navigationTargets.forEach(function(navigation) {
        this.switchClass(navigation.querySelector("ul"), "md:translate-x-20", "translate-x-full");
      }.bind(this));
      this.primaryTarget.classList.remove("md:bg-opacity-50");
      this.labelTargets.forEach(function(label) {
        label.classList.remove("-translate-x-2");
        this.switchClass(label, "opacity-0", "opacity-100");
      }.bind(this));
    }
    switchClass(element, from_class, to_class) {
      element.classList.remove(from_class);
      element.classList.add(to_class);
    }
    get activeItem() {
      return this.element.querySelector("[data-navigation-active]");
    }
    get activeNavigation() {
      return this.activeItem.closest(`[data-navigation-target*="navigation"]`);
    }
  };

  // controllers/page_collapse_controller.js
  var page_collapse_controller_exports = {};
  __export(page_collapse_controller_exports, {
    default: () => page_collapse_controller_default
  });
  var page_collapse_controller_default = class extends Controller {
    toggle(event) {
      this.childrenTarget.toggleAttribute("hidden");
      this.indicatorTarget.classList.toggle("rotate-90");
      if (this.collapsed)
        event.preventDefault();
    }
    get collapsed() {
      return this.childrenTarget.hidden;
    }
  };
  __publicField(page_collapse_controller_default, "targets", ["children", "indicator"]);

  // controllers/page_select_controller.js
  var page_select_controller_exports = {};
  __export(page_select_controller_exports, {
    default: () => page_select_controller_default
  });
  var page_select_controller_default = class extends Controller {
    static get targets() {
      return ["input", "label", "search"];
    }
    connect() {
      if (this.labelTarget.querySelector("turbo-frame") == void 0) {
        this.clear();
      }
    }
    select(event) {
      let button = event.currentTarget;
      this.inputTarget.value = button.dataset.id;
      this.labelTarget.innerText = button.dataset.title;
    }
    clear() {
      this.inputTarget.value = "";
      this.labelTarget.innerHTML = `
      <span class="text-gray-400">
        ${this.element.dataset.placeholder}
      </span>
    `;
    }
    autofocus() {
      setTimeout(function() {
        this.searchTarget.focus();
      }.bind(this), 100);
    }
  };

  // controllers/parent_pages_controller.js
  var parent_pages_controller_exports = {};
  __export(parent_pages_controller_exports, {
    default: () => parent_pages_controller_default
  });
  var parent_pages_controller_default = class extends Controller {
    static get targets() {
      return ["frame"];
    }
    update(event) {
      let select = event.currentTarget;
      let option2 = select.options[select.selectedIndex];
      let src = option2.dataset.parentPagesUrl;
      this.frameTarget.src = src;
    }
  };

  // controllers/repeater_controller.js
  var repeater_controller_exports = {};
  __export(repeater_controller_exports, {
    default: () => repeater_controller_default
  });
  var repeater_controller_default = class extends Controller {
    static get targets() {
      return ["list", "listItem", "content"];
    }
    connect() {
      this.sortable = sortablejs_1_13_0_default.create(this.listTarget, {
        handle: "button svg",
        dataIdAttr: "data-pane-id",
        onEnd: this.sort.bind(this),
        animation: 150
      });
    }
    sort(event) {
      let ids = this.sortable.toArray();
      this.panes.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)).map((node, index2) => {
        this.contentTarget.appendChild(node);
        const positionField = node.querySelector("[data-position]");
        if (positionField)
          positionField.value = index2;
      });
    }
    addFields(event) {
      let button = event.currentTarget;
      let childIndex = button.dataset.childIndex;
      let time = (/* @__PURE__ */ new Date()).getTime();
      let regex = new RegExp(childIndex, "g");
      let html = button.dataset.fields.replace(regex, time);
      this.listTarget.insertAdjacentHTML("beforeend", this.buttonHTML(time));
      this.contentTarget.insertAdjacentHTML("beforeend", html);
    }
    removeFields(event) {
      let id = event.currentTarget.dataset.id;
      let listItem = this.listItemTargets.find((listItem2) => listItem2.dataset.paneId == id);
      let sibling = listItem.previousElementSibling || listItem.nextElementSibling;
      let pane = document.getElementById(id);
      this.listTarget.removeChild(listItem);
      this.contentTarget.removeChild(pane);
      if (sibling)
        sibling.click();
    }
    buttonHTML(pane_id) {
      return `<button type="button" class="text-gray-600 rounded-md px-3 truncate text-sm font-medium flex items-center w-full h-10" data-controller="exists" data-action="tabs#show" data-tabs-target="button" data-repeater-target="listItem" data-pane-id="pane_${pane_id}">
      <svg class="w-4 h-4 mr-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M432 288H16c-8.8 0-16 7.2-16 16v16c0 8.8 7.2 16 16 16h416c8.8 0 16-7.2 16-16v-16c0-8.8-7.2-16-16-16zm0-112H16c-8.8 0-16 7.2-16 16v16c0 8.8 7.2 16 16 16h416c8.8 0 16-7.2 16-16v-16c0-8.8-7.2-16-16-16z"/></svg>
      ...
    </button>`;
    }
    get panes() {
      return [...this.contentTarget.children];
    }
  };

  // rails:/Users/sawhill/Documents/Spina/app/assets/javascripts/spina/controllers/**/*_controller.js
  var module24 = __toESM(require_reveal_controller());

  // controllers/select_placeholder_controller.js
  var select_placeholder_controller_exports = {};
  __export(select_placeholder_controller_exports, {
    default: () => select_placeholder_controller_default
  });
  var select_placeholder_controller_default = class extends Controller {
    connect() {
      this.update();
    }
    update() {
      if (this.hasValue) {
        this.element.classList.remove("text-gray-400");
        this.element.classList.add("text-gray-700");
      } else {
        this.element.classList.add("text-gray-400");
        this.element.classList.remove("text-gray-700");
      }
    }
    get hasValue() {
      return this.value.length > 0;
    }
    get value() {
      return this.element.value;
    }
  };

  // controllers/selectable_controller.js
  var selectable_controller_exports = {};
  __export(selectable_controller_exports, {
    default: () => selectable_controller_default
  });
  var selectable_controller_default = class extends Controller {
    static get targets() {
      return ["item"];
    }
    select(event) {
      let item = event.currentTarget.closest(`[data-selectable-target*="item"]`);
      this.itemTargets.forEach(function(item2) {
        this.deactivate(item2);
      }.bind(this));
      this.activate(item);
    }
    activate(item) {
      this.toggleClasses(item, true);
    }
    deactivate(item) {
      this.toggleClasses(item, false);
    }
    toggleClasses(item, force) {
      item.querySelectorAll(`[data-selected-class]`).forEach(function(element) {
        let selectedClasses = element.dataset.selectedClass;
        if (selectedClasses) {
          selectedClasses.split(" ").forEach(function(cssClass) {
            element.classList.toggle(cssClass, force);
          });
        }
        let deselectedClasses = element.dataset.deselectedClass;
        if (deselectedClasses) {
          deselectedClasses.split(" ").forEach(function(cssClass) {
            element.classList.toggle(cssClass, !force);
          });
        }
      });
    }
  };

  // controllers/shortcuts_controller.js
  var shortcuts_controller_exports = {};
  __export(shortcuts_controller_exports, {
    default: () => shortcuts_controller_default
  });
  var shortcuts_controller_default = class extends Controller {
    static get targets() {
      return ["confirm"];
    }
    connect() {
    }
    confirmClick(event) {
      if (event.key === "Enter")
        this.confirmTarget.click();
    }
  };

  // controllers/sortable_controller.js
  var sortable_controller_exports = {};
  __export(sortable_controller_exports, {
    default: () => sortable_controller_default
  });
  var sortable_controller_default = class extends Controller {
    static get targets() {
      return ["form", "list"];
    }
    connect() {
      this.sortable = sortablejs_1_13_0_default.create(this.listTarget, {
        handle: "[data-sortable-handle]",
        onEnd: this.saveSort.bind(this),
        animation: 150
      });
    }
    saveSort(event) {
      if (this.hasFormTarget) {
        this.prepareForm();
        this.formTarget.requestSubmit();
      }
    }
    prepareForm() {
      this.formTarget.innerHTML = "";
      this.orderedIds.forEach(function(id) {
        this.formTarget.insertAdjacentHTML("beforeend", `<input type="hidden" name="ids[]" value="${id}" />`);
      }.bind(this));
    }
    get orderedIds() {
      return this.sortable.toArray();
    }
  };

  // controllers/switch_controller.js
  var switch_controller_exports = {};
  __export(switch_controller_exports, {
    default: () => switch_controller_default
  });
  var switch_controller_default = class extends Controller {
    static get targets() {
      return ["knob", "container", "checkbox"];
    }
    connect() {
      this.renderKnob();
    }
    toggle() {
      this.checkboxTarget.checked = !this.checked;
      this.renderKnob();
    }
    renderKnob() {
      this.containerTarget.classList.toggle("bg-gray-200", !this.checked);
      this.containerTarget.classList.toggle("bg-green-500", this.checked);
      this.knobTarget.classList.toggle("translate-x-6", this.checked);
    }
    get checked() {
      return this.checkboxTarget.checked;
    }
  };

  // controllers/tabs_controller.js
  var tabs_controller_exports = {};
  __export(tabs_controller_exports, {
    default: () => tabs_controller_default
  });
  var tabs_controller_default = class extends Controller {
    static get targets() {
      return ["pane", "button"];
    }
    connect() {
      this.element[this.identifier] = this;
      this.hideAllPanes();
      this.deactiveAllButtons();
      let firstButton = this.buttonTargets[0];
      if (firstButton) {
        let firstPane = document.getElementById(firstButton.dataset.paneId);
        this.activateButton(firstButton);
        firstPane.hidden = false;
      }
    }
    added(event) {
      let button = event.target;
      let pane = document.getElementById(button.dataset.paneId);
      this.hideAllPanes();
      this.deactiveAllButtons();
      this.activateButton(button);
      pane.hidden = false;
    }
    show(event) {
      let activeButton = event.currentTarget;
      let activePane = document.getElementById(activeButton.dataset.paneId);
      this.deactiveAllButtons();
      this.hideAllPanes();
      this.activateButton(activeButton);
      activePane.hidden = false;
    }
    activateButton(button) {
      button.classList.add(...this.activeClasses);
      button.classList.remove(...this.inactiveClasses);
    }
    deactiveAllButtons() {
      this.buttonTargets.forEach(function(button) {
        button.classList.remove(...this.activeClasses);
        button.classList.add(...this.inactiveClasses);
      }.bind(this));
    }
    hideAllPanes() {
      this.paneTargets.forEach((pane) => pane.hidden = true);
    }
    get activeClasses() {
      return (this.element.dataset.tabsActive || "active").split(" ");
    }
    get inactiveClasses() {
      return (this.element.dataset.tabsInactive || "inactive").split(" ");
    }
  };

  // controllers/toggle_controller.js
  var toggle_controller_exports = {};
  __export(toggle_controller_exports, {
    default: () => toggle_controller_default
  });
  var toggle_controller_default = class extends Controller {
    static get targets() {
      return ["container"];
    }
    toggle() {
      this.containerTarget.classList.toggle("hidden");
    }
  };

  // controllers/trix_controller.js
  var trix_controller_exports = {};
  __export(trix_controller_exports, {
    default: () => trix_controller_default
  });
  var trix_controller_default = class extends Controller {
    static get targets() {
      return ["editor", "imageFields", "altField"];
    }
    connect() {
      this.element[this.identifier] = this;
      this.editorTarget.addEventListener("trix-selection-change", function(event) {
        if (this.mutableImageAttachment) {
          this.imageFieldsTarget.classList.remove("hidden");
          let position = this.mutableImageAttachment.querySelector("img").offsetTop + this.mutableImageAttachment.querySelector("img").offsetHeight;
          this.imageFieldsTarget.style.top = `${position}px`;
          this.altFieldTarget.value = this.currentAltText;
        } else {
          this.imageFieldsTarget.classList.add("hidden");
        }
      }.bind(this));
    }
    insertEmbeddable(html) {
      let embeddable = new Trix.Attachment({
        content: html,
        contentType: "application/vnd+spina.embed+html"
      });
      this.editor.insertAttachment(embeddable);
    }
    preventSubmission(event) {
      if (event.key === "Enter")
        event.preventDefault();
    }
    insertAttachment(event) {
      let attachment = new Trix.Attachment({ content: `<span class="trix-attachment-spina-image" data-label="Alt text">
      <img src="${event.detail.embeddedUrl}" />
    </span>`, contentType: "Spina::Image" });
      this.editor.insertAttachment(attachment);
    }
    setAltText(event) {
      let alt = event.currentTarget.value;
      let altLabel = alt;
      if (altLabel.trim().length == 0)
        altLabel = "Alt text";
      let content = this.trixAttachment.getContent();
      this.mutableImageAttachment.firstElementChild.dataset.label = altLabel;
      let fragment = this.fragmentFromHTML(content);
      fragment.firstElementChild.dataset.label = altLabel;
      fragment.querySelector("img").alt = alt;
      let div = document.createElement("div");
      div.appendChild(fragment);
      this.trixAttachment.setAttributes({ content: div.innerHTML });
    }
    preventDefault(event) {
      event.preventDefault();
    }
    getTrixAttachment(id) {
      let attachments = this.attachmentManager.getAttachments();
      return attachments.find((attachment) => attachment.id == id).attachment;
    }
    fragmentFromHTML(html) {
      let range = document.createRange();
      range.selectNodeContents(document.body);
      return range.createContextualFragment(html);
    }
    get currentAltText() {
      let fragment = this.fragmentFromHTML(this.trixAttachment.getContent());
      return fragment.querySelector("img").alt;
    }
    get trixAttachment() {
      return this.getTrixAttachment(this.mutableImageAttachment.dataset.trixId);
    }
    get mutableImageAttachment() {
      return this.element.querySelector(`figure[data-trix-mutable][data-trix-content-type="Spina::Image"]`);
    }
    get attachmentManager() {
      return this.editorTarget.editorController.attachmentManager;
    }
    get editor() {
      return this.editorTarget.editor;
    }
  };

  // controllers/unique_id_controller.js
  var unique_id_controller_exports = {};
  __export(unique_id_controller_exports, {
    default: () => unique_id_controller_default
  });
  var unique_id_controller_default = class extends Controller {
    connect() {
      this.replaceHTML();
    }
    replaceHTML() {
      let html = this.element.innerHTML;
      let uuid2 = this.generateUUID();
      let regex = new RegExp(this.id, "g");
      let replaced_html = html.replace(regex, uuid2);
      this.element.innerHTML = replaced_html;
      this.element.id = uuid2;
    }
    generateUUID() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
        return v.toString(16);
      });
    }
    get id() {
      return this.element.dataset.uniqueId;
    }
  };

  // rails:/Users/sawhill/Documents/Spina/app/assets/javascripts/spina/controllers/**/*_controller.js
  var modules = [{ name: "article", module: article_controller_exports, filename: "article_controller.js" }, { name: "attachment-picker", module: attachment_picker_controller_exports, filename: "attachment_picker_controller.js" }, { name: "autofocus", module: autofocus_controller_exports, filename: "autofocus_controller.js" }, { name: "button", module: button_controller_exports, filename: "button_controller.js" }, { name: "confetti", module: confetti_controller_exports, filename: "confetti_controller.js" }, { name: "confirm", module: confirm_controller_exports, filename: "confirm_controller.js" }, { name: "delegate-click", module: delegate_click_controller_exports, filename: "delegate_click_controller.js" }, { name: "embed", module: embed_controller_exports, filename: "embed_controller.js" }, { name: "embed-tag", module: embed_tag_controller_exports, filename: "embed_tag_controller.js" }, { name: "exists", module: exists_controller_exports, filename: "exists_controller.js" }, { name: "form", module: form_controller_exports, filename: "form_controller.js" }, { name: "hotkeys", module: hotkeys_controller_exports, filename: "hotkeys_controller.js" }, { name: "image-collection", module: image_collection_controller_exports, filename: "image_collection_controller.js" }, { name: "image-fade-in", module: image_fade_in_controller_exports, filename: "image_fade_in_controller.js" }, { name: "infinite-scroll", module: infinite_scroll_controller_exports, filename: "infinite_scroll_controller.js" }, { name: "loading-button", module: loading_button_controller_exports, filename: "loading_button_controller.js" }, { name: "media-picker", module: media_picker_controller_exports, filename: "media_picker_controller.js" }, { name: "media-picker-modal", module: media_picker_modal_controller_exports, filename: "media_picker_modal_controller.js" }, { name: "modal", module: modal_controller_exports, filename: "modal_controller.js" }, { name: "navigation", module: navigation_controller_exports, filename: "navigation_controller.js" }, { name: "page-collapse", module: page_collapse_controller_exports, filename: "page_collapse_controller.js" }, { name: "page-select", module: page_select_controller_exports, filename: "page_select_controller.js" }, { name: "parent-pages", module: parent_pages_controller_exports, filename: "parent_pages_controller.js" }, { name: "repeater", module: repeater_controller_exports, filename: "repeater_controller.js" }, { name: "reveal", module: module24, filename: "reveal_controller.js" }, { name: "select-placeholder", module: select_placeholder_controller_exports, filename: "select_placeholder_controller.js" }, { name: "selectable", module: selectable_controller_exports, filename: "selectable_controller.js" }, { name: "shortcuts", module: shortcuts_controller_exports, filename: "shortcuts_controller.js" }, { name: "sortable", module: sortable_controller_exports, filename: "sortable_controller.js" }, { name: "switch", module: switch_controller_exports, filename: "switch_controller.js" }, { name: "tabs", module: tabs_controller_exports, filename: "tabs_controller.js" }, { name: "toggle", module: toggle_controller_exports, filename: "toggle_controller.js" }, { name: "trix", module: trix_controller_exports, filename: "trix_controller.js" }, { name: "unique-id", module: unique_id_controller_exports, filename: "unique_id_controller.js" }];
  var controller_default = modules;

  // controllers/index.js
  controller_default.forEach((controller) => {
    application.register(controller.name, controller.module.default);
  });
})();
/*!
 * hotkeys-js v3.8.7
 * A simple micro-library for defining and dispatching keyboard shortcuts. It has no dependencies.
 * 
 * Copyright (c) 2021 kenny wong <wowohoo@qq.com>
 * http://jaywcjlove.github.io/hotkeys
 * 
 * Licensed under the MIT license.
 */
/**!
 * Sortable 1.13.0
 * @author	RubaXa   <trash@rubaxa.org>
 * @author	owenm    <owen23355@gmail.com>
 * @license MIT
 */

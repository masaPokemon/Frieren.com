function createUnityInstance(e, t, r) {
    function n(e, r) {
        if (!n.aborted && t.showBanner)
            return "error" == r && (n.aborted = !0), t.showBanner(e, r);
        switch (r) {
        case "error":
            console.error(e);
            break;
        case "warning":
            console.warn(e);
            break;
        default:
            console.log(e)
        }
    }
    function o(e) {
        var t = e.reason || e.error,
            r = t ? t.toString() : e.message || e.reason || "",
            n = t && t.stack ? t.stack.toString() : "";
        if (n.startsWith(r) && (n = n.substring(r.length)), r += "\n" + n.trim(), r && h.stackTraceRegExp && h.stackTraceRegExp.test(r)) {
            var o = e.filename || t && (t.fileName || t.sourceURL) || "",
                a = e.lineno || t && (t.lineNumber || t.line) || 0;
            s(r, o, a)
        }
    }
    function a(e, t, r) {
        var n = e[t];
        "undefined" != typeof n && n || (console.warn('Config option "' + t + '" is missing or empty. Falling back to default value: "' + r + '". Consider updating your WebGL template to include the missing config option.'), e[t] = r)
    }
    function i(e) {
        e.preventDefault()
    }
    function s(e, t, r) {
        if (e.indexOf("fullscreen error") == -1) {
            if (h.startupErrorHandler)
                return void h.startupErrorHandler(e, t, r);
            if (!(h.errorHandler && h.errorHandler(e, t, r) || (console.log("Invoking error handler due to\n" + e), "function" == typeof dump && dump("Invoking error handler due to\n" + e), s.didShowErrorMessage))) {
                var e = "An error occurred running the Unity content on this page. See your browser JavaScript console for more info. The error was:\n" + e;
                e.indexOf("DISABLE_EXCEPTION_CATCHING") != -1 ? e = "An exception has occurred, but exception handling has been disabled in this build. If you are the developer of this content, enable exceptions in your project WebGL player settings to be able to catch the exception or see the stack trace." : e.indexOf("Cannot enlarge memory arrays") != -1 ? e = "Out of memory. If you are the developer of this content, try allocating more memory to your WebGL build in the WebGL player settings." : e.indexOf("Invalid array buffer length") == -1 && e.indexOf("Invalid typed array length") == -1 && e.indexOf("out of memory") == -1 && e.indexOf("could not allocate memory") == -1 || (e = "The browser could not allocate enough memory for the WebGL content. If you are the developer of this content, try allocating less memory to your WebGL build in the WebGL player settings."),
                alert(e),
                s.didShowErrorMessage = !0
            }
        }
    }
    function l(e, t) {
        if ("symbolsUrl" != e) {
            var n = h.downloadProgress[e];
            n || (n = h.downloadProgress[e] = {
                started: !1,
                finished: !1,
                lengthComputable: !1,
                total: 0,
                loaded: 0
            }),
            "object" != typeof t || "progress" != t.type && "load" != t.type || (n.started || (n.started = !0, n.lengthComputable = t.lengthComputable), n.total = t.total, n.loaded = t.loaded, "load" == t.type && (n.finished = !0));
            var o = 0,
                a = 0,
                i = 0,
                s = 0,
                l = 0;
            for (var e in h.downloadProgress) {
                var n = h.downloadProgress[e];
                if (!n.started)
                    return 0;
                i++,
                n.lengthComputable ? (o += n.loaded, a += n.total, s++) : n.finished || l++
            }
            var d = i ? (i - l - (a ? s * (a - o) / a : 0)) / i : 0;
            r(.9 * d)
        }
    }
    function d(e, t) {
        return new Promise(function(r, n) {
            try {
                for (var o in v)
                    if (v[o].hasUnityMarker(e)) {
                        t && console.log('You can reduce startup time if you configure your web server to add "Content-Encoding: ' + o + '" response header when serving "' + t + '" file.');
                        var a = v[o];
                        if (!a.worker) {
                            var i = URL.createObjectURL(new Blob(["this.require = ", a.require.toString(), "; this.decompress = ", a.decompress.toString(), "; this.onmessage = ", function(e) {
                                var t = {
                                    id: e.data.id,
                                    decompressed: this.decompress(e.data.compressed)
                                };
                                postMessage(t, t.decompressed ? [t.decompressed.buffer] : [])
                            }.toString(), "; postMessage({ ready: true });"], {
                                type: "application/javascript"
                            }));
                            a.worker = new Worker(i),
                            a.worker.onmessage = function(e) {
                                return e.data.ready ? void URL.revokeObjectURL(i) : (this.callbacks[e.data.id](e.data.decompressed), void delete this.callbacks[e.data.id])
                            },
                            a.worker.callbacks = {},
                            a.worker.nextCallbackId = 0
                        }
                        var s = a.worker.nextCallbackId++;
                        return a.worker.callbacks[s] = r, void a.worker.postMessage({
                            id: s,
                            compressed: e
                        }, [e.buffer])
                    }
                r(e)
            } catch (e) {
                n(e)
            }
        })
    }
    function u(e) {
        l(e);
        var t = h.cacheControl(h[e]),
            r = h.companyName && h.productName ? h.cachedFetch : h.fetchWithProgress,
            o = h[e],
            a = /file:\/\//.exec(o) ? "same-origin" : void 0,
            i = r(h[e], {
                method: "GET",
                companyName: h.companyName,
                productName: h.productName,
                control: t,
                mode: a,
                onProgress: function(t) {
                    l(e, t)
                }
            });
        return i.then(function(t) {
            return d(t.parsedBody, h[e])
        }).catch(function(t) {
            var r = "Failed to download file " + h[e];
            "file:" == location.protocol ? n(r + ". Loading web pages via a file:// URL without a web server is not supported by this browser. Please use a local development web server to host Unity content, or use the Unity Build and Run option.", "error") : console.error(r)
        })
    }
    function c() {
        return u("frameworkUrl").then(function(e) {
            var t = URL.createObjectURL(new Blob([e], {
                type: "application/javascript"
            }));
            return new Promise(function(e, r) {
                var o = document.createElement("script");
                o.src = t,
                o.onload = function() {
                    if ("undefined" == typeof unityFramework || !unityFramework) {
                        var r = [["br", "br"], ["gz", "gzip"]];
                        for (var a in r) {
                            var i = r[a];
                            if (h.frameworkUrl.endsWith("." + i[0])) {
                                var s = "Unable to parse " + h.frameworkUrl + "!";
                                if ("file:" == location.protocol)
                                    return void n(s + " Loading pre-compressed (brotli or gzip) content via a file:// URL without a web server is not supported by this browser. Please use a local development web server to host compressed Unity content, or use the Unity Build and Run option.", "error");
                                if (s += ' This can happen if build compression was enabled but web server hosting the content was misconfigured to not serve the file with HTTP Response Header "Content-Encoding: ' + i[1] + '" present. Check browser Console and Devtools Network tab to debug.', "br" == i[0] && "http:" == location.protocol) {
                                    var l = ["localhost", "127.0.0.1"].indexOf(location.hostname) != -1 ? "" : "Migrate your server to use HTTPS.";
                                    s = /Firefox/.test(navigator.userAgent) ? "Unable to parse " + h.frameworkUrl + '!<br>If using custom web server, verify that web server is sending .br files with HTTP Response Header "Content-Encoding: br". Brotli compression may not be supported in Firefox over HTTP connections. ' + l + ' See <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=1670675">https://bugzilla.mozilla.org/show_bug.cgi?id=1670675</a> for more information.' : "Unable to parse " + h.frameworkUrl + '!<br>If using custom web server, verify that web server is sending .br files with HTTP Response Header "Content-Encoding: br". Brotli compression may not be supported over HTTP connections. Migrate your server to use HTTPS.'
                                }
                                return void n(s, "error")
                            }
                        }
                        n("Unable to parse " + h.frameworkUrl + "! The file is corrupt, or compression was misconfigured? (check Content-Encoding HTTP Response Header on web server)", "error")
                    }
                    var d = unityFramework;
                    unityFramework = null,
                    o.onload = null,
                    URL.revokeObjectURL(t),
                    e(d)
                },
                o.onerror = function(e) {
                    n("Unable to load file " + h.frameworkUrl + "! Check that the file exists on the remote server. (also check browser Console and Devtools Network tab to debug)", "error")
                },
                document.body.appendChild(o),
                h.deinitializers.push(function() {
                    document.body.removeChild(o)
                })
            })
        })
    }
    function f() {
        Promise.all([c(), u("codeUrl")]).then(function(e) {
            h.wasmBinary = e[1],
            e[0](h)
        });
        var e = u("dataUrl");
        h.preRun.push(function() {
            h.addRunDependency("dataUrl"),
            e.then(function(e) {
                var t = new DataView(e.buffer, e.byteOffset, e.byteLength),
                    r = 0,
                    n = "UnityWebData1.0\0";
                if (!String.fromCharCode.apply(null, e.subarray(r, r + n.length)) == n)
                    throw "unknown data format";
                r += n.length;
                var o = t.getUint32(r, !0);
                for (r += 4; r < o;) {
                    var a = t.getUint32(r, !0);
                    r += 4;
                    var i = t.getUint32(r, !0);
                    r += 4;
                    var s = t.getUint32(r, !0);
                    r += 4;
                    var l = String.fromCharCode.apply(null, e.subarray(r, r + s));
                    r += s;
                    for (var d = 0, u = l.indexOf("/", d) + 1; u > 0; d = u, u = l.indexOf("/", d) + 1)
                        h.FS_createPath(l.substring(0, d), l.substring(d, u - 1), !0, !0);
                    h.FS_createDataFile(l, null, e.subarray(a, a + i), !0, !0, !0)
                }
                h.removeRunDependency("dataUrl")
            })
        })
    }
    r = r || function() {};
    var h = {
        canvas: e,
        webglContextAttributes: {
            preserveDrawingBuffer: !1,
            powerPreference: 2
        },
        cacheControl: function(e) {
            return e == h.dataUrl ? "must-revalidate" : "no-store"
        },
        streamingAssetsUrl: "StreamingAssets",
        downloadProgress: {},
        deinitializers: [],
        intervals: {},
        setInterval: function(e, t) {
            var r = window.setInterval(e, t);
            return this.intervals[r] = !0, r
        },
        clearInterval: function(e) {
            delete this.intervals[e],
            window.clearInterval(e)
        },
        preRun: [],
        postRun: [],
        print: function(e) {
            console.log(e)
        },
        printErr: function(e) {
            console.error(e),
            "string" == typeof e && e.indexOf("wasm streaming compile failed") != -1 && (e.toLowerCase().indexOf("mime") != -1 ? n('HTTP Response Header "Content-Type" configured incorrectly on the server for file ' + h.codeUrl + ' , should be "application/wasm". Startup time performance will suffer.', "warning") : n('WebAssembly streaming compilation failed! This can happen for example if "Content-Encoding" HTTP header is incorrectly enabled on the server for file ' + h.codeUrl + ", but the file is not pre-compressed on disk (or vice versa). Check the Network tab in browser Devtools to debug server header configuration.", "warning"))
        },
        locateFile: function(e) {
            return e
        },
        disabledCanvasEvents: ["contextmenu", "dragstart"]
    };
    a(t, "companyName", "Unity"),
    a(t, "productName", "WebGL Player"),
    a(t, "productVersion", "1.0");
    for (var b in t)
        h[b] = t[b];
    h.streamingAssetsUrl = new URL(h.streamingAssetsUrl, document.URL).href;
    var m = h.disabledCanvasEvents.slice();
    m.forEach(function(t) {
        e.addEventListener(t, i)
    }),
    window.addEventListener("error", o),
    window.addEventListener("unhandledrejection", o),
    h.deinitializers.push(function() {
        h.disableAccessToMediaDevices(),
        m.forEach(function(t) {
            e.removeEventListener(t, i)
        }),
        window.removeEventListener("error", o),
        window.removeEventListener("unhandledrejection", o);
        for (var t in h.intervals)
            window.clearInterval(t);
        h.intervals = {}
    }),
    h.QuitCleanup = function() {
        for (var e = 0; e < h.deinitializers.length; e++)
            h.deinitializers[e]();
        h.deinitializers = [],
        "function" == typeof h.onQuit && h.onQuit()
    };
    var g = "",
        p = "";
    document.addEventListener("webkitfullscreenchange", function(t) {
        var r = document.webkitCurrentFullScreenElement;
        r === e ? e.style.width && (g = e.style.width, p = e.style.height, e.style.width = "100%", e.style.height = "100%") : g && (e.style.width = g, e.style.height = p, g = "", p = "")
    });
    var w = {
        Module: h,
        SetFullscreen: function() {
            return h.SetFullscreen ? h.SetFullscreen.apply(h, arguments) : void h.print("Failed to set Fullscreen mode: Player not loaded yet.")
        },
        SendMessage: function() {
            return h.SendMessage ? h.SendMessage.apply(h, arguments) : void h.print("Failed to execute SendMessage: Player not loaded yet.")
        },
        Quit: function() {
            return new Promise(function(e, t) {
                h.shouldQuit = !0,
                h.onQuit = e
            })
        }
    };
    h.SystemInfo = function() {
        function e(e, t, r) {
            return e = RegExp(e, "i").exec(t), e && e[r]
        }
        for (var t, r, n, o, a, i, s = navigator.userAgent + " ", l = [["Firefox", "Firefox"], ["OPR", "Opera"], ["Edg", "Edge"], ["SamsungBrowser", "Samsung Browser"], ["Trident", "Internet Explorer"], ["MSIE", "Internet Explorer"], ["Chrome", "Chrome"], ["CriOS", "Chrome on iOS Safari"], ["FxiOS", "Firefox on iOS Safari"], ["Safari", "Safari"]], d = 0; d < l.length; ++d)
            if (r = e(l[d][0] + "[/ ](.*?)[ \\)]", s, 1)) {
                t = l[d][1];
                break
            }
        "Safari" == t && (r = e("Version/(.*?) ", s, 1)),
        "Internet Explorer" == t && (r = e("rv:(.*?)\\)? ", s, 1) || r);
        for (var u = [["Windows (.*?)[;)]", "Windows"], ["Android ([0-9_.]+)", "Android"], ["iPhone OS ([0-9_.]+)", "iPhoneOS"], ["iPad.*? OS ([0-9_.]+)", "iPadOS"], ["FreeBSD( )", "FreeBSD"], ["OpenBSD( )", "OpenBSD"], ["Linux|X11()", "Linux"], ["Mac OS X ([0-9_.]+)", "MacOS"], ["bot|google|baidu|bing|msn|teoma|slurp|yandex", "Search Bot"]], c = 0; c < u.length; ++c)
            if (o = e(u[c][0], s, 1)) {
                n = u[c][1],
                o = o.replace(/_/g, ".");
                break
            }
        var f = {
            "NT 5.0": "2000",
            "NT 5.1": "XP",
            "NT 5.2": "Server 2003",
            "NT 6.0": "Vista",
            "NT 6.1": "7",
            "NT 6.2": "8",
            "NT 6.3": "8.1",
            "NT 10.0": "10"
        };
        o = f[o] || o,
        a = document.createElement("canvas"),
        a && (gl = a.getContext("webgl2"), glVersion = gl ? 2 : 0, gl || (gl = a && a.getContext("webgl")) && (glVersion = 1), gl && (i = gl.getExtension("WEBGL_debug_renderer_info") && gl.getParameter(37446) || gl.getParameter(7937)));
        var h = "undefined" != typeof SharedArrayBuffer,
            b = "object" == typeof WebAssembly && "function" == typeof WebAssembly.compile;
        return {
            width: screen.width,
            height: screen.height,
            userAgent: s.trim(),
            browser: t || "Unknown browser",
            browserVersion: r || "Unknown version",
            mobile: /Mobile|Android|iP(ad|hone)/.test(navigator.appVersion),
            os: n || "Unknown OS",
            osVersion: o || "Unknown OS Version",
            gpu: i || "Unknown GPU",
            language: navigator.userLanguage || navigator.language,
            hasWebGL: glVersion,
            hasCursorLock: !!document.body.requestPointerLock,
            hasFullscreen: !!document.body.requestFullscreen || !!document.body.webkitRequestFullscreen,
            hasThreads: h,
            hasWasm: b,
            hasWasmThreads: !1
        }
    }(),
    h.abortHandler = function(e) {
        return s(e, "", 0), !0
    },
    Error.stackTraceLimit = Math.max(Error.stackTraceLimit || 0, 50),
    h.fetchWithProgress = function() {
        function e(e, t) {
            if (!t)
                return 0;
            var r = e.headers.get("Content-Encoding"),
                n = parseInt(e.headers.get("Content-Length"));
            switch (r) {
            case "br":
                return Math.round(5 * n);
            case "gzip":
                return Math.round(4 * n);
            default:
                return n
            }
        }
        function t(t, r) {
            var n = function() {};
            return r && r.onProgress && (n = r.onProgress), fetch(t, r).then(function(t) {
                function r() {
                    return "undefined" == typeof a ? t.arrayBuffer().then(function(e) {
                        return n({
                            type: "progress",
                            total: e.length,
                            loaded: 0,
                            lengthComputable: i
                        }), new Uint8Array(e)
                    }) : a.read().then(function(e) {
                        return e.done ? o() : (u + e.value.length <= l.length ? (l.set(e.value, u), c = u + e.value.length) : d.push(e.value), u += e.value.length, n({
                            type: "progress",
                            total: Math.max(s, u),
                            loaded: u,
                            lengthComputable: i
                        }), r())
                    })
                }
                function o() {
                    if (u === s)
                        return l;
                    if (u < s)
                        return l.slice(0, u);
                    var e = new Uint8Array(u);
                    e.set(l, 0);
                    for (var t = c, r = 0; r < d.length; ++r)
                        e.set(d[r], t),
                        t += d[r].length;
                    return e
                }
                var a = "undefined" != typeof t.body ? t.body.getReader() : void 0,
                    i = "undefined" != typeof t.headers.get("Content-Length"),
                    s = e(t, i),
                    l = new Uint8Array(s),
                    d = [],
                    u = 0,
                    c = 0;
                return i || console.warn("[UnityCache] Response is served without Content-Length header. Please reconfigure server to include valid Content-Length for better download performance."), r().then(function(e) {
                    return n({
                        type: "load",
                        total: e.length,
                        loaded: e.length,
                        lengthComputable: i
                    }), t.parsedBody = e, t
                })
            })
        }
        return t
    }(),
    h.UnityCache = function() {
        function e() {
            function e(e) {
                var t = e.target.result;
                if (t.objectStoreNames.contains(n.name) || t.createObjectStore(n.name), !t.objectStoreNames.contains(r.name)) {
                    var o = t.createObjectStore(r.name, {
                        keyPath: "url"
                    });
                    ["version", "company", "product", "updated", "revalidated", "accessed"].forEach(function(e) {
                        o.createIndex(e, e)
                    })
                }
            }
            var a = this;
            a.isConnected = new Promise(function(r, n) {
                function i() {
                    a.openDBTimeout && (clearTimeout(a.openDBTimeout), a.openDBTimeout = null)
                }
                try {
                    a.openDBTimeout = setTimeout(function() {
                        "undefined" == typeof a.database && n(new Error("Could not connect to database: Timeout."))
                    }, 2e3);
                    var s = o.open(t.name, t.version);
                    s.onupgradeneeded = function(t) {
                        e(t)
                    },
                    s.onsuccess = function(e) {
                        i(),
                        a.database = e.target.result,
                        r()
                    },
                    s.onerror = function(e) {
                        i(),
                        a.database = null,
                        n(new Error("Could not connect to database."))
                    }
                } catch (e) {
                    i(),
                    a.database = null,
                    n(new Error("Could not connect to database."))
                }
            })
        }
        var t = {
                name: "UnityCache",
                version: 3
            },
            r = {
                name: "RequestStore",
                version: 1
            },
            n = {
                name: "WebAssembly",
                version: 1
            },
            o = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        e.UnityCacheDatabase = t,
        e.RequestStore = r,
        e.WebAssemblyStore = n;
        var a = null;
        return e.getInstance = function() {
            return a || (a = new e), a
        }, e.destroyInstance = function() {
            return a ? a.close().then(function() {
                a = null
            }) : Promise.resolve()
        }, e.clearCache = function() {
            return e.destroyInstance().then(function() {
                return new Promise(function(e, r) {
                    var n = o.deleteDatabase(t.name);
                    n.onsuccess = function() {
                        e()
                    },
                    n.onerror = function() {
                        r(new Error("Could not delete database."))
                    },
                    n.onblocked = function() {
                        r(new Error("Database blocked."))
                    }
                })
            })
        }, e.prototype.execute = function(e, t, r) {
            return this.isConnected.then(function() {
                return new Promise(function(n, o) {
                    try {
                        if (null === this.database)
                            return void o(new Error("indexedDB access denied"));
                        var a = ["put", "delete", "clear"].indexOf(t) != -1 ? "readwrite" : "readonly",
                            i = this.database.transaction([e], a),
                            s = i.objectStore(e);
                        "openKeyCursor" == t && (s = s.index(r[0]), r = r.slice(1));
                        var l = s[t].apply(s, r);
                        l.onsuccess = function(e) {
                            n(e.target.result)
                        },
                        l.onerror = function(e) {
                            o(e)
                        }
                    } catch (e) {
                        o(e)
                    }
                }.bind(this))
            }.bind(this))
        }, e.prototype.loadRequest = function(e) {
            return this.execute(r.name, "get", [e])
        }, e.prototype.storeRequest = function(e) {
            return this.execute(r.name, "put", [e])
        }, e.prototype.close = function() {
            return this.isConnected.then(function() {
                this.database && (this.database.close(), this.database = null)
            }.bind(this))
        }, e
    }(),
    h.cachedFetch = function() {
        function e(e) {
            console.log("[UnityCache] " + e)
        }
        function t(e) {
            return t.link = t.link || document.createElement("a"), t.link.href = e, t.link.href
        }
        function r(e) {
            var t = window.location.href.match(/^[a-z]+:\/\/[^\/]+/);
            return !t || e.lastIndexOf(t[0], 0)
        }
        function n(e) {
            e = e || {},
            this.headers = new Headers,
            Object.keys(e.headers).forEach(function(t) {
                this.headers.set(t, e.headers[t])
            }.bind(this)),
            this.redirected = e.redirected,
            this.status = e.status,
            this.statusText = e.statusText,
            this.type = e.type,
            this.url = e.url,
            this.parsedBody = e.parsedBody,
            Object.defineProperty(this, "ok", {
                get: function() {
                    return this.status >= 200 && this.status <= 299
                }.bind(this)
            })
        }
        function o(e, t, r, n, o) {
            var a = {
                url: e,
                version: l.version,
                company: t,
                product: r,
                updated: n,
                revalidated: n,
                accessed: n,
                response: {
                    headers: {}
                }
            };
            return o && (o.headers.forEach(function(e, t) {
                a.response.headers[t] = e
            }), ["redirected", "status", "statusText", "type", "url"].forEach(function(e) {
                a.response[e] = o[e]
            }), a.response.parsedBody = o.parsedBody), a
        }
        function a(e, t) {
            return (!t || !t.method || "GET" === t.method) && ((!t || ["must-revalidate", "immutable"].indexOf(t.control) != -1) && !!e.match("^https?://"))
        }
        function i(i, u) {
            function c(t, r) {
                return d(t, r).then(function(t) {
                    return !m.enabled || m.revalidated ? t : 304 === t.status ? (m.result.revalidated = m.result.accessed, m.revalidated = !0, h.storeRequest(m.result).then(function() {
                        e("'" + m.result.url + "' successfully revalidated and served from the indexedDB cache")
                    }).catch(function(t) {
                        e("'" + m.result.url + "' successfully revalidated but not stored in the indexedDB cache due to the error: " + t)
                    }), new n(m.result.response)) : (200 == t.status ? (m.result = o(t.url, m.company, m.product, m.accessed, t), m.revalidated = !0, h.storeRequest(m.result).then(function() {
                        e("'" + m.result.url + "' successfully downloaded and stored in the indexedDB cache")
                    }).catch(function(t) {
                        e("'" + m.result.url + "' successfully downloaded but not stored in the indexedDB cache due to the error: " + t)
                    })) : e("'" + m.result.url + "' request failed with status: " + t.status + " " + t.statusText), t)
                })
            }
            function f(e) {
                u && u.onProgress && (u.onProgress({
                    type: "progress",
                    total: e.parsedBody.length,
                    loaded: e.parsedBody.length,
                    lengthComputable: !0
                }), u.onProgress({
                    type: "load",
                    total: e.parsedBody.length,
                    loaded: e.parsedBody.length,
                    lengthComputable: !0
                }))
            }
            var h = s.getInstance(),
                b = t("string" == typeof i ? i : i.url),
                m = {
                    enabled: a(b, u)
                };
            return u && (m.control = u.control, m.company = u.company, m.product = u.product), m.result = o(b, m.company, m.product, Date.now()), m.revalidated = !1, m.enabled ? h.loadRequest(m.result.url).then(function(t) {
                if (!t || t.version !== l.version)
                    return c(i, u);
                m.result = t,
                m.result.accessed = Date.now();
                var o = new n(m.result.response);
                if ("immutable" == m.control)
                    return m.revalidated = !0, h.storeRequest(m.result), e("'" + m.result.url + "' served from the indexedDB cache without revalidation"), f(o), o;
                if (r(m.result.url) && (o.headers.get("Last-Modified") || o.headers.get("ETag")))
                    return fetch(m.result.url, {
                        method: "HEAD"
                    }).then(function(t) {
                        return m.revalidated = ["Last-Modified", "ETag"].every(function(e) {
                            return !o.headers.get(e) || o.headers.get(e) == t.headers.get(e)
                        }), m.revalidated ? (m.result.revalidated = m.result.accessed, h.storeRequest(m.result), e("'" + m.result.url + "' successfully revalidated and served from the indexedDB cache"), f(o), o) : c(i, u)
                    });
                u = u || {};
                var a = u.headers || {};
                return u.headers = a, o.headers.get("Last-Modified") ? (a["If-Modified-Since"] = o.headers.get("Last-Modified"), a["Cache-Control"] = "no-cache") : o.headers.get("ETag") && (a["If-None-Match"] = o.headers.get("ETag"), a["Cache-Control"] = "no-cache"), c(i, u)
            }).catch(function(t) {
                return e("Failed to load '" + m.result.url + "' from indexedDB cache due to the error: " + t), d(i, u)
            }) : d(i, u)
        }
        var s = h.UnityCache,
            l = s.RequestStore,
            d = h.fetchWithProgress;
        return n.prototype.arrayBuffer = function() {
            return Promise.resolve(this.parsedBody.buffer)
        }, n.prototype.blob = function() {
            return this.arrayBuffer().then(function(e) {
                return new Blob([e])
            })
        }, n.prototype.json = function() {
            return this.text().then(function(e) {
                return JSON.parse(e)
            })
        }, n.prototype.text = function() {
            var e = new TextDecoder;
            return Promise.resolve(e.decode(this.parsedBody))
        }, i
    }();
    var v = {
        gzip: {
            require: function(e) {
                var t = {
                    "inflate.js": function(e, t, r) {
                        "use strict";
                        function n(e) {
                            if (!(this instanceof n))
                                return new n(e);
                            this.options = s.assign({
                                chunkSize: 16384,
                                windowBits: 0,
                                to: ""
                            }, e || {});
                            var t = this.options;
                            t.raw && t.windowBits >= 0 && t.windowBits < 16 && (t.windowBits = -t.windowBits, 0 === t.windowBits && (t.windowBits = -15)),
                            !(t.windowBits >= 0 && t.windowBits < 16) || e && e.windowBits || (t.windowBits += 32),
                            t.windowBits > 15 && t.windowBits < 48 && 0 === (15 & t.windowBits) && (t.windowBits |= 15),
                            this.err = 0,
                            this.msg = "",
                            this.ended = !1,
                            this.chunks = [],
                            this.strm = new c,
                            this.strm.avail_out = 0;
                            var r = i.inflateInit2(this.strm, t.windowBits);
                            if (r !== d.Z_OK)
                                throw new Error(u[r]);
                            this.header = new f,
                            i.inflateGetHeader(this.strm, this.header)
                        }
                        function o(e, t) {
                            var r = new n(t);
                            if (r.push(e, !0), r.err)
                                throw r.msg || u[r.err];
                            return r.result
                        }
                        function a(e, t) {
                            return t = t || {}, t.raw = !0, o(e, t)
                        }
                        var i = e("./zlib/inflate"),
                            s = e("./utils/common"),
                            l = e("./utils/strings"),
                            d = e("./zlib/constants"),
                            u = e("./zlib/messages"),
                            c = e("./zlib/zstream"),
                            f = e("./zlib/gzheader"),
                            h = Object.prototype.toString;
                        n.prototype.push = function(e, t) {
                            var r,
                                n,
                                o,
                                a,
                                u,
                                c,
                                f = this.strm,
                                b = this.options.chunkSize,
                                m = this.options.dictionary,
                                g = !1;
                            if (this.ended)
                                return !1;
                            n = t === ~~t ? t : t === !0 ? d.Z_FINISH : d.Z_NO_FLUSH,
                            "string" == typeof e ? f.input = l.binstring2buf(e) : "[object ArrayBuffer]" === h.call(e) ? f.input = new Uint8Array(e) : f.input = e,
                            f.next_in = 0,
                            f.avail_in = f.input.length;
                            do {
                                if (0 === f.avail_out && (f.output = new s.Buf8(b), f.next_out = 0, f.avail_out = b), r = i.inflate(f, d.Z_NO_FLUSH), r === d.Z_NEED_DICT && m && (c = "string" == typeof m ? l.string2buf(m) : "[object ArrayBuffer]" === h.call(m) ? new Uint8Array(m) : m, r = i.inflateSetDictionary(this.strm, c)), r === d.Z_BUF_ERROR && g === !0 && (r = d.Z_OK, g = !1), r !== d.Z_STREAM_END && r !== d.Z_OK)
                                    return this.onEnd(r), this.ended = !0, !1;
                                f.next_out && (0 !== f.avail_out && r !== d.Z_STREAM_END && (0 !== f.avail_in || n !== d.Z_FINISH && n !== d.Z_SYNC_FLUSH) || ("string" === this.options.to ? (o = l.utf8border(f.output, f.next_out), a = f.next_out - o, u = l.buf2string(f.output, o), f.next_out = a, f.avail_out = b - a, a && s.arraySet(f.output, f.output, o, a, 0), this.onData(u)) : this.onData(s.shrinkBuf(f.output, f.next_out)))),
                                0 === f.avail_in && 0 === f.avail_out && (g = !0)
                            } while ((f.avail_in > 0 || 0 === f.avail_out) && r !== d.Z_STREAM_END);
                            return r === d.Z_STREAM_END && (n = d.Z_FINISH), n === d.Z_FINISH ? (r = i.inflateEnd(this.strm), this.onEnd(r), this.ended = !0, r === d.Z_OK) : n !== d.Z_SYNC_FLUSH || (this.onEnd(d.Z_OK), f.avail_out = 0, !0)
                        },
                        n.prototype.onData = function(e) {
                            this.chunks.push(e)
                        },
                        n.prototype.onEnd = function(e) {
                            e === d.Z_OK && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = s.flattenChunks(this.chunks)),
                            this.chunks = [],
                            this.err = e,
                            this.msg = this.strm.msg
                        },
                        r.Inflate = n,
                        r.inflate = o,
                        r.inflateRaw = a,
                        r.ungzip = o
                    },
                    "utils/common.js": function(e, t, r) {
                        "use strict";
                        var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Int32Array;
                        r.assign = function(e) {
                            for (var t = Array.prototype.slice.call(arguments, 1); t.length;) {
                                var r = t.shift();
                                if (r) {
                                    if ("object" != typeof r)
                                        throw new TypeError(r + "must be non-object");
                                    for (var n in r)
                                        r.hasOwnProperty(n) && (e[n] = r[n])
                                }
                            }
                            return e
                        },
                        r.shrinkBuf = function(e, t) {
                            return e.length === t ? e : e.subarray ? e.subarray(0, t) : (e.length = t, e)
                        };
                        var o = {
                                arraySet: function(e, t, r, n, o) {
                                    if (t.subarray && e.subarray)
                                        return void e.set(t.subarray(r, r + n), o);
                                    for (var a = 0; a < n; a++)
                                        e[o + a] = t[r + a]
                                },
                                flattenChunks: function(e) {
                                    var t,
                                        r,
                                        n,
                                        o,
                                        a,
                                        i;
                                    for (n = 0, t = 0, r = e.length; t < r; t++)
                                        n += e[t].length;
                                    for (i = new Uint8Array(n), o = 0, t = 0, r = e.length; t < r; t++)
                                        a = e[t],
                                        i.set(a, o),
                                        o += a.length;
                                    return i
                                }
                            },
                            a = {
                                arraySet: function(e, t, r, n, o) {
                                    for (var a = 0; a < n; a++)
                                        e[o + a] = t[r + a]
                                },
                                flattenChunks: function(e) {
                                    return [].concat.apply([], e)
                                }
                            };
                        r.setTyped = function(e) {
                            e ? (r.Buf8 = Uint8Array, r.Buf16 = Uint16Array, r.Buf32 = Int32Array, r.assign(r, o)) : (r.Buf8 = Array, r.Buf16 = Array, r.Buf32 = Array, r.assign(r, a))
                        },
                        r.setTyped(n)
                    },
                    "utils/strings.js": function(e, t, r) {
                        "use strict";
                        function n(e, t) {
                            if (t < 65537 && (e.subarray && i || !e.subarray && a))
                                return String.fromCharCode.apply(null, o.shrinkBuf(e, t));
                            for (var r = "", n = 0; n < t; n++)
                                r += String.fromCharCode(e[n]);
                            return r
                        }
                        var o = e("./common"),
                            a = !0,
                            i = !0;
                        try {
                            String.fromCharCode.apply(null, [0])
                        } catch (e) {
                            a = !1
                        }
                        try {
                            String.fromCharCode.apply(null, new Uint8Array(1))
                        } catch (e) {
                            i = !1
                        }
                        for (var s = new o.Buf8(256), l = 0; l < 256; l++)
                            s[l] = l >= 252 ? 6 : l >= 248 ? 5 : l >= 240 ? 4 : l >= 224 ? 3 : l >= 192 ? 2 : 1;
                        s[254] = s[254] = 1,
                        r.string2buf = function(e) {
                            var t,
                                r,
                                n,
                                a,
                                i,
                                s = e.length,
                                l = 0;
                            for (a = 0; a < s; a++)
                                r = e.charCodeAt(a),
                                55296 === (64512 & r) && a + 1 < s && (n = e.charCodeAt(a + 1), 56320 === (64512 & n) && (r = 65536 + (r - 55296 << 10) + (n - 56320), a++)),
                                l += r < 128 ? 1 : r < 2048 ? 2 : r < 65536 ? 3 : 4;
                            for (t = new o.Buf8(l), i = 0, a = 0; i < l; a++)
                                r = e.charCodeAt(a),
                                55296 === (64512 & r) && a + 1 < s && (n = e.charCodeAt(a + 1), 56320 === (64512 & n) && (r = 65536 + (r - 55296 << 10) + (n - 56320), a++)),
                                r < 128 ? t[i++] = r : r < 2048 ? (t[i++] = 192 | r >>> 6, t[i++] = 128 | 63 & r) : r < 65536 ? (t[i++] = 224 | r >>> 12, t[i++] = 128 | r >>> 6 & 63, t[i++] = 128 | 63 & r) : (t[i++] = 240 | r >>> 18, t[i++] = 128 | r >>> 12 & 63, t[i++] = 128 | r >>> 6 & 63, t[i++] = 128 | 63 & r);
                            return t
                        },
                        r.buf2binstring = function(e) {
                            return n(e, e.length)
                        },
                        r.binstring2buf = function(e) {
                            for (var t = new o.Buf8(e.length), r = 0, n = t.length; r < n; r++)
                                t[r] = e.charCodeAt(r);
                            return t
                        },
                        r.buf2string = function(e, t) {
                            var r,
                                o,
                                a,
                                i,
                                l = t || e.length,
                                d = new Array(2 * l);
                            for (o = 0, r = 0; r < l;)
                                if (a = e[r++], a < 128)
                                    d[o++] = a;
                                else if (i = s[a], i > 4)
                                    d[o++] = 65533,
                                    r += i - 1;
                                else {
                                    for (a &= 2 === i ? 31 : 3 === i ? 15 : 7; i > 1 && r < l;)
                                        a = a << 6 | 63 & e[r++],
                                        i--;
                                    i > 1 ? d[o++] = 65533 : a < 65536 ? d[o++] = a : (a -= 65536, d[o++] = 55296 | a >> 10 & 1023, d[o++] = 56320 | 1023 & a)
                                }
                            return n(d, o)
                        },
                        r.utf8border = function(e, t) {
                            var r;
                            for (t = t || e.length, t > e.length && (t = e.length), r = t - 1; r >= 0 && 128 === (192 & e[r]);)
                                r--;
                            return r < 0 ? t : 0 === r ? t : r + s[e[r]] > t ? r : t
                        }
                    },
                    "zlib/inflate.js": function(e, t, r) {
                        "use strict";
                        function n(e) {
                            return (e >>> 24 & 255) + (e >>> 8 & 65280) + ((65280 & e) << 8) + ((255 & e) << 24)
                        }
                        function o() {
                            this.mode = 0,
                            this.last = !1,
                            this.wrap = 0,
                            this.havedict = !1,
                            this.flags = 0,
                            this.dmax = 0,
                            this.check = 0,
                            this.total = 0,
                            this.head = null,
                            this.wbits = 0,
                            this.wsize = 0,
                            this.whave = 0,
                            this.wnext = 0,
                            this.window = null,
                            this.hold = 0,
                            this.bits = 0,
                            this.length = 0,
                            this.offset = 0,
                            this.extra = 0,
                            this.lencode = null,
                            this.distcode = null,
                            this.lenbits = 0,
                            this.distbits = 0,
                            this.ncode = 0,
                            this.nlen = 0,
                            this.ndist = 0,
                            this.have = 0,
                            this.next = null,
                            this.lens = new w.Buf16(320),
                            this.work = new w.Buf16(288),
                            this.lendyn = null,
                            this.distdyn = null,
                            this.sane = 0,
                            this.back = 0,
                            this.was = 0
                        }
                        function a(e) {
                            var t;
                            return e && e.state ? (t = e.state, e.total_in = e.total_out = t.total = 0, e.msg = "", t.wrap && (e.adler = 1 & t.wrap), t.mode = N, t.last = 0, t.havedict = 0, t.dmax = 32768, t.head = null, t.hold = 0, t.bits = 0, t.lencode = t.lendyn = new w.Buf32(me), t.distcode = t.distdyn = new w.Buf32(ge), t.sane = 1, t.back = -1, T) : O
                        }
                        function i(e) {
                            var t;
                            return e && e.state ? (t = e.state, t.wsize = 0, t.whave = 0, t.wnext = 0, a(e)) : O
                        }
                        function s(e, t) {
                            var r,
                                n;
                            return e && e.state ? (n = e.state, t < 0 ? (r = 0, t = -t) : (r = (t >> 4) + 1, t < 48 && (t &= 15)), t && (t < 8 || t > 15) ? O : (null !== n.window && n.wbits !== t && (n.window = null), n.wrap = r, n.wbits = t, i(e))) : O
                        }
                        function l(e, t) {
                            var r,
                                n;
                            return e ? (n = new o, e.state = n, n.window = null, r = s(e, t), r !== T && (e.state = null), r) : O
                        }
                        function d(e) {
                            return l(e, we)
                        }
                        function u(e) {
                            if (ve) {
                                var t;
                                for (g = new w.Buf32(512), p = new w.Buf32(32), t = 0; t < 144;)
                                    e.lens[t++] = 8;
                                for (; t < 256;)
                                    e.lens[t++] = 9;
                                for (; t < 280;)
                                    e.lens[t++] = 7;
                                for (; t < 288;)
                                    e.lens[t++] = 8;
                                for (x(S, e.lens, 0, 288, g, 0, e.work, {
                                    bits: 9
                                }), t = 0; t < 32;)
                                    e.lens[t++] = 5;
                                x(E, e.lens, 0, 32, p, 0, e.work, {
                                    bits: 5
                                }),
                                ve = !1
                            }
                            e.lencode = g,
                            e.lenbits = 9,
                            e.distcode = p,
                            e.distbits = 5
                        }
                        function c(e, t, r, n) {
                            var o,
                                a = e.state;
                            return null === a.window && (a.wsize = 1 << a.wbits, a.wnext = 0, a.whave = 0, a.window = new w.Buf8(a.wsize)), n >= a.wsize ? (w.arraySet(a.window, t, r - a.wsize, a.wsize, 0), a.wnext = 0, a.whave = a.wsize) : (o = a.wsize - a.wnext, o > n && (o = n), w.arraySet(a.window, t, r - n, o, a.wnext), n -= o, n ? (w.arraySet(a.window, t, r - n, n, 0), a.wnext = n, a.whave = a.wsize) : (a.wnext += o, a.wnext === a.wsize && (a.wnext = 0), a.whave < a.wsize && (a.whave += o))), 0
                        }
                        function f(e, t) {
                            var r,
                                o,
                                a,
                                i,
                                s,
                                l,
                                d,
                                f,
                                h,
                                b,
                                m,
                                g,
                                p,
                                me,
                                ge,
                                pe,
                                we,
                                ve,
                                ye,
                                ke,
                                xe,
                                _e,
                                Se,
                                Ee,
                                Ce = 0,
                                Be = new w.Buf8(4),
                                Ue = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
                            if (!e || !e.state || !e.output || !e.input && 0 !== e.avail_in)
                                return O;
                            r = e.state,
                            r.mode === V && (r.mode = Y),
                            s = e.next_out,
                            a = e.output,
                            d = e.avail_out,
                            i = e.next_in,
                            o = e.input,
                            l = e.avail_in,
                            f = r.hold,
                            h = r.bits,
                            b = l,
                            m = d,
                            _e = T;
                            e:
                            for (;;)
                                switch (r.mode) {
                                case N:
                                    if (0 === r.wrap) {
                                        r.mode = Y;
                                        break
                                    }
                                    for (; h < 16;) {
                                        if (0 === l)
                                            break e;
                                        l--,
                                        f += o[i++] << h,
                                        h += 8
                                    }
                                    if (2 & r.wrap && 35615 === f) {
                                        r.check = 0,
                                        Be[0] = 255 & f,
                                        Be[1] = f >>> 8 & 255,
                                        r.check = y(r.check, Be, 2, 0),
                                        f = 0,
                                        h = 0,
                                        r.mode = z;
                                        break
                                    }
                                    if (r.flags = 0, r.head && (r.head.done = !1), !(1 & r.wrap) || (((255 & f) << 8) + (f >> 8)) % 31) {
                                        e.msg = "incorrect header check",
                                        r.mode = fe;
                                        break
                                    }
                                    if ((15 & f) !== D) {
                                        e.msg = "unknown compression method",
                                        r.mode = fe;
                                        break
                                    }
                                    if (f >>>= 4, h -= 4, xe = (15 & f) + 8, 0 === r.wbits)
                                        r.wbits = xe;
                                    else if (xe > r.wbits) {
                                        e.msg = "invalid window size",
                                        r.mode = fe;
                                        break
                                    }
                                    r.dmax = 1 << xe,
                                    e.adler = r.check = 1,
                                    r.mode = 512 & f ? q : V,
                                    f = 0,
                                    h = 0;
                                    break;
                                case z:
                                    for (; h < 16;) {
                                        if (0 === l)
                                            break e;
                                        l--,
                                        f += o[i++] << h,
                                        h += 8
                                    }
                                    if (r.flags = f, (255 & r.flags) !== D) {
                                        e.msg = "unknown compression method",
                                        r.mode = fe;
                                        break
                                    }
                                    if (57344 & r.flags) {
                                        e.msg = "unknown header flags set",
                                        r.mode = fe;
                                        break
                                    }
                                    r.head && (r.head.text = f >> 8 & 1),
                                    512 & r.flags && (Be[0] = 255 & f, Be[1] = f >>> 8 & 255, r.check = y(r.check, Be, 2, 0)),
                                    f = 0,
                                    h = 0,
                                    r.mode = F;
                                case F:
                                    for (; h < 32;) {
                                        if (0 === l)
                                            break e;
                                        l--,
                                        f += o[i++] << h,
                                        h += 8
                                    }
                                    r.head && (r.head.time = f),
                                    512 & r.flags && (Be[0] = 255 & f, Be[1] = f >>> 8 & 255, Be[2] = f >>> 16 & 255, Be[3] = f >>> 24 & 255, r.check = y(r.check, Be, 4, 0)),
                                    f = 0,
                                    h = 0,
                                    r.mode = Z;
                                case Z:
                                    for (; h < 16;) {
                                        if (0 === l)
                                            break e;
                                        l--,
                                        f += o[i++] << h,
                                        h += 8
                                    }
                                    r.head && (r.head.xflags = 255 & f, r.head.os = f >> 8),
                                    512 & r.flags && (Be[0] = 255 & f, Be[1] = f >>> 8 & 255, r.check = y(r.check, Be, 2, 0)),
                                    f = 0,
                                    h = 0,
                                    r.mode = j;
                                case j:
                                    if (1024 & r.flags) {
                                        for (; h < 16;) {
                                            if (0 === l)
                                                break e;
                                            l--,
                                            f += o[i++] << h,
                                            h += 8
                                        }
                                        r.length = f,
                                        r.head && (r.head.extra_len = f),
                                        512 & r.flags && (Be[0] = 255 & f, Be[1] = f >>> 8 & 255, r.check = y(r.check, Be, 2, 0)),
                                        f = 0,
                                        h = 0
                                    } else
                                        r.head && (r.head.extra = null);
                                    r.mode = H;
                                case H:
                                    if (1024 & r.flags && (g = r.length, g > l && (g = l), g && (r.head && (xe = r.head.extra_len - r.length, r.head.extra || (r.head.extra = new Array(r.head.extra_len)), w.arraySet(r.head.extra, o, i, g, xe)), 512 & r.flags && (r.check = y(r.check, o, g, i)), l -= g, i += g, r.length -= g), r.length))
                                        break e;
                                    r.length = 0,
                                    r.mode = M;
                                case M:
                                    if (2048 & r.flags) {
                                        if (0 === l)
                                            break e;
                                        g = 0;
                                        do xe = o[i + g++],
                                        r.head && xe && r.length < 65536 && (r.head.name += String.fromCharCode(xe));
                                        while (xe && g < l);
                                        if (512 & r.flags && (r.check = y(r.check, o, g, i)), l -= g, i += g, xe)
                                            break e
                                    } else
                                        r.head && (r.head.name = null);
                                    r.length = 0,
                                    r.mode = W;
                                case W:
                                    if (4096 & r.flags) {
                                        if (0 === l)
                                            break e;
                                        g = 0;
                                        do xe = o[i + g++],
                                        r.head && xe && r.length < 65536 && (r.head.comment += String.fromCharCode(xe));
                                        while (xe && g < l);
                                        if (512 & r.flags && (r.check = y(r.check, o, g, i)), l -= g, i += g, xe)
                                            break e
                                    } else
                                        r.head && (r.head.comment = null);
                                    r.mode = G;
                                case G:
                                    if (512 & r.flags) {
                                        for (; h < 16;) {
                                            if (0 === l)
                                                break e;
                                            l--,
                                            f += o[i++] << h,
                                            h += 8
                                        }
                                        if (f !== (65535 & r.check)) {
                                            e.msg = "header crc mismatch",
                                            r.mode = fe;
                                            break
                                        }
                                        f = 0,
                                        h = 0
                                    }
                                    r.head && (r.head.hcrc = r.flags >> 9 & 1, r.head.done = !0),
                                    e.adler = r.check = 0,
                                    r.mode = V;
                                    break;
                                case q:
                                    for (; h < 32;) {
                                        if (0 === l)
                                            break e;
                                        l--,
                                        f += o[i++] << h,
                                        h += 8
                                    }
                                    e.adler = r.check = n(f),
                                    f = 0,
                                    h = 0,
                                    r.mode = K;
                                case K:
                                    if (0 === r.havedict)
                                        return e.next_out = s, e.avail_out = d, e.next_in = i, e.avail_in = l, r.hold = f, r.bits = h, L;
                                    e.adler = r.check = 1,
                                    r.mode = V;
                                case V:
                                    if (t === B || t === U)
                                        break e;
                                case Y:
                                    if (r.last) {
                                        f >>>= 7 & h,
                                        h -= 7 & h,
                                        r.mode = de;
                                        break
                                    }
                                    for (; h < 3;) {
                                        if (0 === l)
                                            break e;
                                        l--,
                                        f += o[i++] << h,
                                        h += 8
                                    }
                                    switch (r.last = 1 & f, f >>>= 1, h -= 1, 3 & f) {
                                    case 0:
                                        r.mode = Q;
                                        break;
                                    case 1:
                                        if (u(r), r.mode = re, t === U) {
                                            f >>>= 2,
                                            h -= 2;
                                            break e
                                        }
                                        break;
                                    case 2:
                                        r.mode = $;
                                        break;
                                    case 3:
                                        e.msg = "invalid block type",
                                        r.mode = fe
                                    }
                                    f >>>= 2,
                                    h -= 2;
                                    break;
                                case Q:
                                    for (f >>>= 7 & h, h -= 7 & h; h < 32;) {
                                        if (0 === l)
                                            break e;
                                        l--,
                                        f += o[i++] << h,
                                        h += 8
                                    }
                                    if ((65535 & f) !== (f >>> 16 ^ 65535)) {
                                        e.msg = "invalid stored block lengths",
                                        r.mode = fe;
                                        break
                                    }
                                    if (r.length = 65535 & f, f = 0, h = 0, r.mode = X, t === U)
                                        break e;
                                case X:
                                    r.mode = J;
                                case J:
                                    if (g = r.length) {
                                        if (g > l && (g = l), g > d && (g = d), 0 === g)
                                            break e;
                                        w.arraySet(a, o, i, g, s),
                                        l -= g,
                                        i += g,
                                        d -= g,
                                        s += g,
                                        r.length -= g;
                                        break
                                    }
                                    r.mode = V;
                                    break;
                                case $:
                                    for (; h < 14;) {
                                        if (0 === l)
                                            break e;
                                        l--,
                                        f += o[i++] << h,
                                        h += 8
                                    }
                                    if (r.nlen = (31 & f) + 257, f >>>= 5, h -= 5, r.ndist = (31 & f) + 1, f >>>= 5, h -= 5, r.ncode = (15 & f) + 4, f >>>= 4, h -= 4, r.nlen > 286 || r.ndist > 30) {
                                        e.msg = "too many length or distance symbols",
                                        r.mode = fe;
                                        break
                                    }
                                    r.have = 0,
                                    r.mode = ee;
                                case ee:
                                    for (; r.have < r.ncode;) {
                                        for (; h < 3;) {
                                            if (0 === l)
                                                break e;
                                            l--,
                                            f += o[i++] << h,
                                            h += 8
                                        }
                                        r.lens[Ue[r.have++]] = 7 & f,
                                        f >>>= 3,
                                        h -= 3
                                    }
                                    for (; r.have < 19;)
                                        r.lens[Ue[r.have++]] = 0;
                                    if (r.lencode = r.lendyn, r.lenbits = 7, Se = {
                                        bits: r.lenbits
                                    }, _e = x(_, r.lens, 0, 19, r.lencode, 0, r.work, Se), r.lenbits = Se.bits, _e) {
                                        e.msg = "invalid code lengths set",
                                        r.mode = fe;
                                        break
                                    }
                                    r.have = 0,
                                    r.mode = te;
                                case te:
                                    for (; r.have < r.nlen + r.ndist;) {
                                        for (; Ce = r.lencode[f & (1 << r.lenbits) - 1], ge = Ce >>> 24, pe = Ce >>> 16 & 255, we = 65535 & Ce, !(ge <= h);) {
                                            if (0 === l)
                                                break e;
                                            l--,
                                            f += o[i++] << h,
                                            h += 8
                                        }
                                        if (we < 16)
                                            f >>>= ge,
                                            h -= ge,
                                            r.lens[r.have++] = we;
                                        else {
                                            if (16 === we) {
                                                for (Ee = ge + 2; h < Ee;) {
                                                    if (0 === l)
                                                        break e;
                                                    l--,
                                                    f += o[i++] << h,
                                                    h += 8
                                                }
                                                if (f >>>= ge, h -= ge, 0 === r.have) {
                                                    e.msg = "invalid bit length repeat",
                                                    r.mode = fe;
                                                    break
                                                }
                                                xe = r.lens[r.have - 1],
                                                g = 3 + (3 & f),
                                                f >>>= 2,
                                                h -= 2
                                            } else if (17 === we) {
                                                for (Ee = ge + 3; h < Ee;) {
                                                    if (0 === l)
                                                        break e;
                                                    l--,
                                                    f += o[i++] << h,
                                                    h += 8
                                                }
                                                f >>>= ge,
                                                h -= ge,
                                                xe = 0,
                                                g = 3 + (7 & f),
                                                f >>>= 3,
                                                h -= 3
                                            } else {
                                                for (Ee = ge + 7; h < Ee;) {
                                                    if (0 === l)
                                                        break e;
                                                    l--,
                                                    f += o[i++] << h,
                                                    h += 8
                                                }
                                                f >>>= ge,
                                                h -= ge,
                                                xe = 0,
                                                g = 11 + (127 & f),
                                                f >>>= 7,
                                                h -= 7
                                            }
                                            if (r.have + g > r.nlen + r.ndist) {
                                                e.msg = "invalid bit length repeat",
                                                r.mode = fe;
                                                break
                                            }
                                            for (; g--;)
                                                r.lens[r.have++] = xe
                                        }
                                    }
                                    if (r.mode === fe)
                                        break;
                                    if (0 === r.lens[256]) {
                                        e.msg = "invalid code -- missing end-of-block",
                                        r.mode = fe;
                                        break
                                    }
                                    if (r.lenbits = 9, Se = {
                                        bits: r.lenbits
                                    }, _e = x(S, r.lens, 0, r.nlen, r.lencode, 0, r.work, Se), r.lenbits = Se.bits, _e) {
                                        e.msg = "invalid literal/lengths set",
                                        r.mode = fe;
                                        break
                                    }
                                    if (r.distbits = 6, r.distcode = r.distdyn, Se = {
                                        bits: r.distbits
                                    }, _e = x(E, r.lens, r.nlen, r.ndist, r.distcode, 0, r.work, Se), r.distbits = Se.bits, _e) {
                                        e.msg = "invalid distances set",
                                        r.mode = fe;
                                        break
                                    }
                                    if (r.mode = re, t === U)
                                        break e;
                                case re:
                                    r.mode = ne;
                                case ne:
                                    if (l >= 6 && d >= 258) {
                                        e.next_out = s,
                                        e.avail_out = d,
                                        e.next_in = i,
                                        e.avail_in = l,
                                        r.hold = f,
                                        r.bits = h,
                                        k(e, m),
                                        s = e.next_out,
                                        a = e.output,
                                        d = e.avail_out,
                                        i = e.next_in,
                                        o = e.input,
                                        l = e.avail_in,
                                        f = r.hold,
                                        h = r.bits,
                                        r.mode === V && (r.back = -1);
                                        break
                                    }
                                    for (r.back = 0; Ce = r.lencode[f & (1 << r.lenbits) - 1], ge = Ce >>> 24, pe = Ce >>> 16 & 255, we = 65535 & Ce, !(ge <= h);) {
                                        if (0 === l)
                                            break e;
                                        l--,
                                        f += o[i++] << h,
                                        h += 8
                                    }
                                    if (pe && 0 === (240 & pe)) {
                                        for (ve = ge, ye = pe, ke = we; Ce = r.lencode[ke + ((f & (1 << ve + ye) - 1) >> ve)], ge = Ce >>> 24, pe = Ce >>> 16 & 255, we = 65535 & Ce, !(ve + ge <= h);) {
                                            if (0 === l)
                                                break e;
                                            l--,
                                            f += o[i++] << h,
                                            h += 8
                                        }
                                        f >>>= ve,
                                        h -= ve,
                                        r.back += ve
                                    }
                                    if (f >>>= ge, h -= ge, r.back += ge, r.length = we, 0 === pe) {
                                        r.mode = le;
                                        break
                                    }
                                    if (32 & pe) {
                                        r.back = -1,
                                        r.mode = V;
                                        break
                                    }
                                    if (64 & pe) {
                                        e.msg = "invalid literal/length code",
                                        r.mode = fe;
                                        break
                                    }
                                    r.extra = 15 & pe,
                                    r.mode = oe;
                                case oe:
                                    if (r.extra) {
                                        for (Ee = r.extra; h < Ee;) {
                                            if (0 === l)
                                                break e;
                                            l--,
                                            f += o[i++] << h,
                                            h += 8
                                        }
                                        r.length += f & (1 << r.extra) - 1,
                                        f >>>= r.extra,
                                        h -= r.extra,
                                        r.back += r.extra
                                    }
                                    r.was = r.length,
                                    r.mode = ae;
                                case ae:
                                    for (; Ce = r.distcode[f & (1 << r.distbits) - 1], ge = Ce >>> 24, pe = Ce >>> 16 & 255, we = 65535 & Ce, !(ge <= h);) {
                                        if (0 === l)
                                            break e;
                                        l--,
                                        f += o[i++] << h,
                                        h += 8
                                    }
                                    if (0 === (240 & pe)) {
                                        for (ve = ge, ye = pe, ke = we; Ce = r.distcode[ke + ((f & (1 << ve + ye) - 1) >> ve)], ge = Ce >>> 24, pe = Ce >>> 16 & 255, we = 65535 & Ce, !(ve + ge <= h);) {
                                            if (0 === l)
                                                break e;
                                            l--,
                                            f += o[i++] << h,
                                            h += 8
                                        }
                                        f >>>= ve,
                                        h -= ve,
                                        r.back += ve
                                    }
                                    if (f >>>= ge, h -= ge, r.back += ge, 64 & pe) {
                                        e.msg = "invalid distance code",
                                        r.mode = fe;
                                        break
                                    }
                                    r.offset = we,
                                    r.extra = 15 & pe,
                                    r.mode = ie;
                                case ie:
                                    if (r.extra) {
                                        for (Ee = r.extra; h < Ee;) {
                                            if (0 === l)
                                                break e;
                                            l--,
                                            f += o[i++] << h,
                                            h += 8
                                        }
                                        r.offset += f & (1 << r.extra) - 1,
                                        f >>>= r.extra,
                                        h -= r.extra,
                                        r.back += r.extra
                                    }
                                    if (r.offset > r.dmax) {
                                        e.msg = "invalid distance too far back",
                                        r.mode = fe;
                                        break
                                    }
                                    r.mode = se;
                                case se:
                                    if (0 === d)
                                        break e;
                                    if (g = m - d, r.offset > g) {
                                        if (g = r.offset - g, g > r.whave && r.sane) {
                                            e.msg = "invalid distance too far back",
                                            r.mode = fe;
                                            break
                                        }
                                        g > r.wnext ? (g -= r.wnext, p = r.wsize - g) : p = r.wnext - g,
                                        g > r.length && (g = r.length),
                                        me = r.window
                                    } else
                                        me = a,
                                        p = s - r.offset,
                                        g = r.length;
                                    g > d && (g = d),
                                    d -= g,
                                    r.length -= g;
                                    do a[s++] = me[p++];
                                    while (--g);
                                    0 === r.length && (r.mode = ne);
                                    break;
                                case le:
                                    if (0 === d)
                                        break e;
                                    a[s++] = r.length,
                                    d--,
                                    r.mode = ne;
                                    break;
                                case de:
                                    if (r.wrap) {
                                        for (; h < 32;) {
                                            if (0 === l)
                                                break e;
                                            l--,
                                            f |= o[i++] << h,
                                            h += 8
                                        }
                                        if (m -= d, e.total_out += m, r.total += m, m && (e.adler = r.check = r.flags ? y(r.check, a, m, s - m) : v(r.check, a, m, s - m)), m = d, (r.flags ? f : n(f)) !== r.check) {
                                            e.msg = "incorrect data check",
                                            r.mode = fe;
                                            break
                                        }
                                        f = 0,
                                        h = 0
                                    }
                                    r.mode = ue;
                                case ue:
                                    if (r.wrap && r.flags) {
                                        for (; h < 32;) {
                                            if (0 === l)
                                                break e;
                                            l--,
                                            f += o[i++] << h,
                                            h += 8
                                        }
                                        if (f !== (4294967295 & r.total)) {
                                            e.msg = "incorrect length check",
                                            r.mode = fe;
                                            break
                                        }
                                        f = 0,
                                        h = 0
                                    }
                                    r.mode = ce;
                                case ce:
                                    _e = R;
                                    break e;
                                case fe:
                                    _e = I;
                                    break e;
                                case he:
                                    return A;
                                case be:
                                default:
                                    return O
                                }
                            return e.next_out = s, e.avail_out = d, e.next_in = i, e.avail_in = l, r.hold = f, r.bits = h, (r.wsize || m !== e.avail_out && r.mode < fe && (r.mode < de || t !== C)) && c(e, e.output, e.next_out, m - e.avail_out) ? (r.mode = he, A) : (b -= e.avail_in, m -= e.avail_out, e.total_in += b, e.total_out += m, r.total += m, r.wrap && m && (e.adler = r.check = r.flags ? y(r.check, a, m, e.next_out - m) : v(r.check, a, m, e.next_out - m)), e.data_type = r.bits + (r.last ? 64 : 0) + (r.mode === V ? 128 : 0) + (r.mode === re || r.mode === X ? 256 : 0), (0 === b && 0 === m || t === C) && _e === T && (_e = P), _e)
                        }
                        function h(e) {
                            if (!e || !e.state)
                                return O;
                            var t = e.state;
                            return t.window && (t.window = null), e.state = null, T
                        }
                        function b(e, t) {
                            var r;
                            return e && e.state ? (r = e.state, 0 === (2 & r.wrap) ? O : (r.head = t, t.done = !1, T)) : O
                        }
                        function m(e, t) {
                            var r,
                                n,
                                o,
                                a = t.length;
                            return e && e.state ? (r = e.state, 0 !== r.wrap && r.mode !== K ? O : r.mode === K && (n = 1, n = v(n, t, a, 0), n !== r.check) ? I : (o = c(e, t, a, a)) ? (r.mode = he, A) : (r.havedict = 1, T)) : O
                        }
                        var g,
                            p,
                            w = e("../utils/common"),
                            v = e("./adler32"),
                            y = e("./crc32"),
                            k = e("./inffast"),
                            x = e("./inftrees"),
                            _ = 0,
                            S = 1,
                            E = 2,
                            C = 4,
                            B = 5,
                            U = 6,
                            T = 0,
                            R = 1,
                            L = 2,
                            O = -2,
                            I = -3,
                            A = -4,
                            P = -5,
                            D = 8,
                            N = 1,
                            z = 2,
                            F = 3,
                            Z = 4,
                            j = 5,
                            H = 6,
                            M = 7,
                            W = 8,
                            G = 9,
                            q = 10,
                            K = 11,
                            V = 12,
                            Y = 13,
                            Q = 14,
                            X = 15,
                            J = 16,
                            $ = 17,
                            ee = 18,
                            te = 19,
                            re = 20,
                            ne = 21,
                            oe = 22,
                            ae = 23,
                            ie = 24,
                            se = 25,
                            le = 26,
                            de = 27,
                            ue = 28,
                            ce = 29,
                            fe = 30,
                            he = 31,
                            be = 32,
                            me = 852,
                            ge = 592,
                            pe = 15,
                            we = pe,
                            ve = !0;
                        r.inflateReset = i,
                        r.inflateReset2 = s,
                        r.inflateResetKeep = a,
                        r.inflateInit = d,
                        r.inflateInit2 = l,
                        r.inflate = f,
                        r.inflateEnd = h,
                        r.inflateGetHeader = b,
                        r.inflateSetDictionary = m,
                        r.inflateInfo = "pako inflate (from Nodeca project)"
                    },
                    "zlib/constants.js": function(e, t, r) {
                        "use strict";
                        t.exports = {
                            Z_NO_FLUSH: 0,
                            Z_PARTIAL_FLUSH: 1,
                            Z_SYNC_FLUSH: 2,
                            Z_FULL_FLUSH: 3,
                            Z_FINISH: 4,
                            Z_BLOCK: 5,
                            Z_TREES: 6,
                            Z_OK: 0,
                            Z_STREAM_END: 1,
                            Z_NEED_DICT: 2,
                            Z_ERRNO: -1,
                            Z_STREAM_ERROR: -2,
                            Z_DATA_ERROR: -3,
                            Z_BUF_ERROR: -5,
                            Z_NO_COMPRESSION: 0,
                            Z_BEST_SPEED: 1,
                            Z_BEST_COMPRESSION: 9,
                            Z_DEFAULT_COMPRESSION: -1,
                            Z_FILTERED: 1,
                            Z_HUFFMAN_ONLY: 2,
                            Z_RLE: 3,
                            Z_FIXED: 4,
                            Z_DEFAULT_STRATEGY: 0,
                            Z_BINARY: 0,
                            Z_TEXT: 1,
                            Z_UNKNOWN: 2,
                            Z_DEFLATED: 8
                        }
                    },
                    "zlib/messages.js": function(e, t, r) {
                        "use strict";
                        t.exports = {
                            2: "need dictionary",
                            1: "stream end",
                            0: "",
                            "-1": "file error",
                            "-2": "stream error",
                            "-3": "data error",
                            "-4": "insufficient memory",
                            "-5": "buffer error",
                            "-6": "incompatible version"
                        }
                    },
                    "zlib/zstream.js": function(e, t, r) {
                        "use strict";
                        function n() {
                            this.input = null,
                            this.next_in = 0,
                            this.avail_in = 0,
                            this.total_in = 0,
                            this.output = null,
                            this.next_out = 0,
                            this.avail_out = 0,
                            this.total_out = 0,
                            this.msg = "",
                            this.state = null,
                            this.data_type = 2,
                            this.adler = 0
                        }
                        t.exports = n
                    },
                    "zlib/gzheader.js": function(e, t, r) {
                        "use strict";
                        function n() {
                            this.text = 0,
                            this.time = 0,
                            this.xflags = 0,
                            this.os = 0,
                            this.extra = null,
                            this.extra_len = 0,
                            this.name = "",
                            this.comment = "",
                            this.hcrc = 0,
                            this.done = !1
                        }
                        t.exports = n
                    },
                    "zlib/adler32.js": function(e, t, r) {
                        "use strict";
                        function n(e, t, r, n) {
                            for (var o = 65535 & e | 0, a = e >>> 16 & 65535 | 0, i = 0; 0 !== r;) {
                                i = r > 2e3 ? 2e3 : r,
                                r -= i;
                                do o = o + t[n++] | 0,
                                a = a + o | 0;
                                while (--i);
                                o %= 65521,
                                a %= 65521
                            }
                            return o | a << 16 | 0
                        }
                        t.exports = n
                    },
                    "zlib/crc32.js": function(e, t, r) {
                        "use strict";
                        function n() {
                            for (var e, t = [], r = 0; r < 256; r++) {
                                e = r;
                                for (var n = 0; n < 8; n++)
                                    e = 1 & e ? 3988292384 ^ e >>> 1 : e >>> 1;
                                t[r] = e
                            }
                            return t
                        }
                        function o(e, t, r, n) {
                            var o = a,
                                i = n + r;
                            e ^= -1;
                            for (var s = n; s < i; s++)
                                e = e >>> 8 ^ o[255 & (e ^ t[s])];
                            return e ^ -1
                        }
                        var a = n();
                        t.exports = o
                    },
                    "zlib/inffast.js": function(e, t, r) {
                        "use strict";
                        var n = 30,
                            o = 12;
                        t.exports = function(e, t) {
                            var r,
                                a,
                                i,
                                s,
                                l,
                                d,
                                u,
                                c,
                                f,
                                h,
                                b,
                                m,
                                g,
                                p,
                                w,
                                v,
                                y,
                                k,
                                x,
                                _,
                                S,
                                E,
                                C,
                                B,
                                U;
                            r = e.state,
                            a = e.next_in,
                            B = e.input,
                            i = a + (e.avail_in - 5),
                            s = e.next_out,
                            U = e.output,
                            l = s - (t - e.avail_out),
                            d = s + (e.avail_out - 257),
                            u = r.dmax,
                            c = r.wsize,
                            f = r.whave,
                            h = r.wnext,
                            b = r.window,
                            m = r.hold,
                            g = r.bits,
                            p = r.lencode,
                            w = r.distcode,
                            v = (1 << r.lenbits) - 1,
                            y = (1 << r.distbits) - 1;
                            e:
                            do {
                                g < 15 && (m += B[a++] << g, g += 8, m += B[a++] << g, g += 8),
                                k = p[m & v];
                                t:
                                for (;;) {
                                    if (x = k >>> 24, m >>>= x, g -= x, x = k >>> 16 & 255, 0 === x)
                                        U[s++] = 65535 & k;
                                    else {
                                        if (!(16 & x)) {
                                            if (0 === (64 & x)) {
                                                k = p[(65535 & k) + (m & (1 << x) - 1)];
                                                continue t
                                            }
                                            if (32 & x) {
                                                r.mode = o;
                                                break e
                                            }
                                            e.msg = "invalid literal/length code",
                                            r.mode = n;
                                            break e
                                        }
                                        _ = 65535 & k,
                                        x &= 15,
                                        x && (g < x && (m += B[a++] << g, g += 8), _ += m & (1 << x) - 1, m >>>= x, g -= x),
                                        g < 15 && (m += B[a++] << g, g += 8, m += B[a++] << g, g += 8),
                                        k = w[m & y];
                                        r:
                                        for (;;) {
                                            if (x = k >>> 24, m >>>= x, g -= x, x = k >>> 16 & 255, !(16 & x)) {
                                                if (0 === (64 & x)) {
                                                    k = w[(65535 & k) + (m & (1 << x) - 1)];
                                                    continue r
                                                }
                                                e.msg = "invalid distance code",
                                                r.mode = n;
                                                break e
                                            }
                                            if (S = 65535 & k, x &= 15, g < x && (m += B[a++] << g, g += 8, g < x && (m += B[a++] << g, g += 8)), S += m & (1 << x) - 1, S > u) {
                                                e.msg = "invalid distance too far back",
                                                r.mode = n;
                                                break e
                                            }
                                            if (m >>>= x, g -= x, x = s - l, S > x) {
                                                if (x = S - x, x > f && r.sane) {
                                                    e.msg = "invalid distance too far back",
                                                    r.mode = n;
                                                    break e
                                                }
                                                if (E = 0, C = b, 0 === h) {
                                                    if (E += c - x, x < _) {
                                                        _ -= x;
                                                        do U[s++] = b[E++];
                                                        while (--x);
                                                        E = s - S,
                                                        C = U
                                                    }
                                                } else if (h < x) {
                                                    if (E += c + h - x, x -= h, x < _) {
                                                        _ -= x;
                                                        do U[s++] = b[E++];
                                                        while (--x);
                                                        if (E = 0, h < _) {
                                                            x = h,
                                                            _ -= x;
                                                            do U[s++] = b[E++];
                                                            while (--x);
                                                            E = s - S,
                                                            C = U
                                                        }
                                                    }
                                                } else if (E += h - x, x < _) {
                                                    _ -= x;
                                                    do U[s++] = b[E++];
                                                    while (--x);
                                                    E = s - S,
                                                    C = U
                                                }
                                                for (; _ > 2;)
                                                    U[s++] = C[E++],
                                                    U[s++] = C[E++],
                                                    U[s++] = C[E++],
                                                    _ -= 3;
                                                _ && (U[s++] = C[E++], _ > 1 && (U[s++] = C[E++]))
                                            } else {
                                                E = s - S;
                                                do U[s++] = U[E++],
                                                U[s++] = U[E++],
                                                U[s++] = U[E++],
                                                _ -= 3;
                                                while (_ > 2);
                                                _ && (U[s++] = U[E++], _ > 1 && (U[s++] = U[E++]))
                                            }
                                            break
                                        }
                                    }
                                    break
                                }
                            } while (a < i && s < d);
                            _ = g >> 3,
                            a -= _,
                            g -= _ << 3,
                            m &= (1 << g) - 1,
                            e.next_in = a,
                            e.next_out = s,
                            e.avail_in = a < i ? 5 + (i - a) : 5 - (a - i),
                            e.avail_out = s < d ? 257 + (d - s) : 257 - (s - d),
                            r.hold = m,
                            r.bits = g
                        }
                    },
                    "zlib/inftrees.js": function(e, t, r) {
                        "use strict";
                        var n = e("../utils/common"),
                            o = 15,
                            a = 852,
                            i = 592,
                            s = 0,
                            l = 1,
                            d = 2,
                            u = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0],
                            c = [16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78],
                            f = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0],
                            h = [16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64];
                        t.exports = function(e, t, r, b, m, g, p, w) {
                            var v,
                                y,
                                k,
                                x,
                                _,
                                S,
                                E,
                                C,
                                B,
                                U = w.bits,
                                T = 0,
                                R = 0,
                                L = 0,
                                O = 0,
                                I = 0,
                                A = 0,
                                P = 0,
                                D = 0,
                                N = 0,
                                z = 0,
                                F = null,
                                Z = 0,
                                j = new n.Buf16(o + 1),
                                H = new n.Buf16(o + 1),
                                M = null,
                                W = 0;
                            for (T = 0; T <= o; T++)
                                j[T] = 0;
                            for (R = 0; R < b; R++)
                                j[t[r + R]]++;
                            for (I = U, O = o; O >= 1 && 0 === j[O]; O--)
                                ;
                            if (I > O && (I = O), 0 === O)
                                return m[g++] = 20971520, m[g++] = 20971520, w.bits = 1, 0;
                            for (L = 1; L < O && 0 === j[L]; L++)
                                ;
                            for (I < L && (I = L), D = 1, T = 1; T <= o; T++)
                                if (D <<= 1, D -= j[T], D < 0)
                                    return -1;
                            if (D > 0 && (e === s || 1 !== O))
                                return -1;
                            for (H[1] = 0, T = 1; T < o; T++)
                                H[T + 1] = H[T] + j[T];
                            for (R = 0; R < b; R++)
                                0 !== t[r + R] && (p[H[t[r + R]]++] = R);
                            if (e === s ? (F = M = p, S = 19) : e === l ? (F = u, Z -= 257, M = c, W -= 257, S = 256) : (F = f, M = h, S = -1), z = 0, R = 0, T = L, _ = g, A = I, P = 0, k = -1, N = 1 << I, x = N - 1, e === l && N > a || e === d && N > i)
                                return 1;
                            for (;;) {
                                E = T - P,
                                p[R] < S ? (C = 0, B = p[R]) : p[R] > S ? (C = M[W + p[R]], B = F[Z + p[R]]) : (C = 96, B = 0),
                                v = 1 << T - P,
                                y = 1 << A,
                                L = y;
                                do y -= v,
                                m[_ + (z >> P) + y] = E << 24 | C << 16 | B | 0;
                                while (0 !== y);
                                for (v = 1 << T - 1; z & v;)
                                    v >>= 1;
                                if (0 !== v ? (z &= v - 1, z += v) : z = 0, R++, 0 === --j[T]) {
                                    if (T === O)
                                        break;
                                    T = t[r + p[R]]
                                }
                                if (T > I && (z & x) !== k) {
                                    for (0 === P && (P = I), _ += L, A = T - P, D = 1 << A; A + P < O && (D -= j[A + P], !(D <= 0));)
                                        A++,
                                        D <<= 1;
                                    if (N += 1 << A, e === l && N > a || e === d && N > i)
                                        return 1;
                                    k = z & x,
                                    m[k] = I << 24 | A << 16 | _ - g | 0
                                }
                            }
                            return 0 !== z && (m[_ + z] = T - P << 24 | 64 << 16 | 0), w.bits = I, 0
                        }
                    }
                };
                for (var r in t)
                    t[r].folder = r.substring(0, r.lastIndexOf("/") + 1);
                var n = function(e) {
                        var r = [];
                        return e = e.split("/").every(function(e) {
                            return ".." == e ? r.pop() : "." == e || "" == e || r.push(e)
                        }) ? r.join("/") : null, e ? t[e] || t[e + ".js"] || t[e + "/index.js"] : null
                    },
                    o = function(e, t) {
                        return e ? n(e.folder + "node_modules/" + t) || o(e.parent, t) : null
                    },
                    a = function(e, t) {
                        var r = t.match(/^\//) ? null : e ? t.match(/^\.\.?\//) ? n(e.folder + t) : o(e, t) : n(t);
                        if (!r)
                            throw "module not found: " + t;
                        return r.exports || (r.parent = e, r(a.bind(null, r), r, r.exports = {})), r.exports
                    };
                return a(null, e)
            },
            decompress: function(e) {
                this.exports || (this.exports = this.require("inflate.js"));
                try {
                    return this.exports.inflate(e)
                } catch (e) {}
            },
            hasUnityMarker: function(e) {
                var t = 10,
                    r = "UnityWeb Compressed Content (gzip)";
                if (t > e.length || 31 != e[0] || 139 != e[1])
                    return !1;
                var n = e[3];
                if (4 & n) {
                    if (t + 2 > e.length)
                        return !1;
                    if (t += 2 + e[t] + (e[t + 1] << 8), t > e.length)
                        return !1
                }
                if (8 & n) {
                    for (; t < e.length && e[t];)
                        t++;
                    if (t + 1 > e.length)
                        return !1;
                    t++
                }
                return 16 & n && String.fromCharCode.apply(null, e.subarray(t, t + r.length + 1)) == r + "\0"
            }
        }
    };
    return new Promise(function(e, t) {
        h.SystemInfo.hasWebGL ? 1 == h.SystemInfo.hasWebGL ? t('Your browser does not support graphics API "WebGL 2" which is required for this content.') : h.SystemInfo.hasWasm ? (1 == h.SystemInfo.hasWebGL && h.print('Warning: Your browser does not support "WebGL 2" Graphics API, switching to "WebGL 1"'), h.startupErrorHandler = t, r(0), h.postRun.push(function() {
            r(1),
            delete h.startupErrorHandler,
            e(w)
        }), f()) : t("Your browser does not support WebAssembly.") : t("Your browser does not support WebGL.")
    })
}

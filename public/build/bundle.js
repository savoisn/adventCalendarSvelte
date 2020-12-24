
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function claim_element(nodes, name, attributes, svg) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeName === name) {
                let j = 0;
                const remove = [];
                while (j < node.attributes.length) {
                    const attribute = node.attributes[j++];
                    if (!attributes[attribute.name]) {
                        remove.push(attribute.name);
                    }
                }
                for (let k = 0; k < remove.length; k++) {
                    node.removeAttribute(remove[k]);
                }
                return nodes.splice(i, 1)[0];
            }
        }
        return svg ? svg_element(name) : element(name);
    }
    function claim_text(nodes, data) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeType === 3) {
                node.data = '' + data;
                return nodes.splice(i, 1)[0];
            }
        }
        return text(data);
    }
    function claim_space(nodes) {
        return claim_text(nodes, ' ');
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function claim_component(block, parent_nodes) {
        block && block.l(parent_nodes);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.30.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var svelte = /*#__PURE__*/Object.freeze({
        __proto__: null,
        SvelteComponent: SvelteComponentDev,
        afterUpdate: afterUpdate,
        beforeUpdate: beforeUpdate,
        createEventDispatcher: createEventDispatcher,
        getContext: getContext,
        onDestroy: onDestroy,
        onMount: onMount,
        setContext: setContext,
        tick: tick
    });

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.30.0 */

    function create_fragment(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let $routes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, value => $$invalidate(7, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(6, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(5, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ["basepath", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$base,
    		$location,
    		$routes
    	});

    	$$self.$inject_state = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 32) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			 {
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 192) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			 {
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		routes,
    		location,
    		base,
    		basepath,
    		url,
    		$base,
    		$location,
    		$routes,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.30.0 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 4,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[2],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, routeParams, $location*/ 532) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[2],
    		/*routeProps*/ ctx[3]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (switch_instance) claim_component(switch_instance.$$.fragment, nodes);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 28)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Route", slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("routeParams" in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
    		if ("routeProps" in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 2) {
    			 if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(2, routeParams = $activeRoute.params);
    			}
    		}

    		 {
    			const { path, component, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Link.svelte generated by Svelte v3.30.0 */
    const file = "node_modules/svelte-routing/src/Link.svelte";

    function create_fragment$2(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			a = claim_element(nodes, "A", { href: true, "aria-current": true });
    			var a_nodes = children(a);
    			if (default_slot) default_slot.l(a_nodes);
    			a_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			set_attributes(a, a_data);
    			add_location(a, file, 40, 0, 1249);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16384) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[14], dirty, null, null);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Link", slots, ['default']);
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	const { base } = getContext(ROUTER);
    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(12, $base = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(13, $location = value));
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	const writable_props = ["to", "replace", "state", "getProps"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("to" in $$props) $$invalidate(6, to = $$props.to);
    		if ("replace" in $$props) $$invalidate(7, replace = $$props.replace);
    		if ("state" in $$props) $$invalidate(8, state = $$props.state);
    		if ("getProps" in $$props) $$invalidate(9, getProps = $$props.getProps);
    		if ("$$scope" in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		ROUTER,
    		LOCATION,
    		navigate,
    		startsWith,
    		resolve,
    		shouldNavigate,
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		dispatch,
    		href,
    		isPartiallyCurrent,
    		isCurrent,
    		props,
    		onClick,
    		$base,
    		$location,
    		ariaCurrent
    	});

    	$$self.$inject_state = $$props => {
    		if ("to" in $$props) $$invalidate(6, to = $$props.to);
    		if ("replace" in $$props) $$invalidate(7, replace = $$props.replace);
    		if ("state" in $$props) $$invalidate(8, state = $$props.state);
    		if ("getProps" in $$props) $$invalidate(9, getProps = $$props.getProps);
    		if ("href" in $$props) $$invalidate(0, href = $$props.href);
    		if ("isPartiallyCurrent" in $$props) $$invalidate(10, isPartiallyCurrent = $$props.isPartiallyCurrent);
    		if ("isCurrent" in $$props) $$invalidate(11, isCurrent = $$props.isCurrent);
    		if ("props" in $$props) $$invalidate(1, props = $$props.props);
    		if ("ariaCurrent" in $$props) $$invalidate(2, ariaCurrent = $$props.ariaCurrent);
    	};

    	let ariaCurrent;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 4160) {
    			 $$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 8193) {
    			 $$invalidate(10, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 8193) {
    			 $$invalidate(11, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 2048) {
    			 $$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		if ($$self.$$.dirty & /*getProps, $location, href, isPartiallyCurrent, isCurrent*/ 11777) {
    			 $$invalidate(1, props = getProps({
    				location: $location,
    				href,
    				isPartiallyCurrent,
    				isCurrent
    			}));
    		}
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		base,
    		location,
    		onClick,
    		to,
    		replace,
    		state,
    		getProps,
    		isPartiallyCurrent,
    		isCurrent,
    		$base,
    		$location,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { to: 6, replace: 7, state: 8, getProps: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/NavLink.svelte generated by Svelte v3.30.0 */

    // (17:0) <Link to="{to}" getProps="{getProps}">
    function create_default_slot(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(17:0) <Link to=\\\"{to}\\\" getProps=\\\"{getProps}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let link;
    	let current;

    	link = new Link({
    			props: {
    				to: /*to*/ ctx[0],
    				getProps,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(link.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(link.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(link, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const link_changes = {};
    			if (dirty & /*to*/ 1) link_changes.to = /*to*/ ctx[0];

    			if (dirty & /*$$scope*/ 4) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(link, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getProps({ location, href, isPartiallyCurrent, isCurrent }) {
    	const isActive = href === "/"
    	? isCurrent
    	: isPartiallyCurrent || isCurrent;

    	// The object returned here is spread on the anchor element's attributes
    	if (isActive) {
    		return { class: "active" };
    	}

    	return {};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NavLink", slots, ['default']);
    	let { to = "" } = $$props;
    	const writable_props = ["to"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NavLink> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("to" in $$props) $$invalidate(0, to = $$props.to);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ Link, to, getProps });

    	$$self.$inject_state = $$props => {
    		if ("to" in $$props) $$invalidate(0, to = $$props.to);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [to, slots, $$scope];
    }

    class NavLink extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { to: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavLink",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get to() {
    		throw new Error("<NavLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<NavLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const storedDoor = localStorage.getItem("door");
    const { subscribe: subscribe$1, set, update: update$1 } = writable(storedDoor);
    subscribe$1(value => {
        localStorage.setItem("door", value);
    });

    const addDoor = door => update$1(storeddoor => {
        if (storeddoor < door){
            return door
        }else {
            return storeddoor
        }
    });

    const reset = () => {
        set(0);
    };

    var doorStore = {
        subscribe: subscribe$1,
        addDoor,
        reset
    };

    /* src/components/Door.svelte generated by Svelte v3.30.0 */
    const file$1 = "src/components/Door.svelte";

    // (91:4) {:else}
    function create_else_block$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			this.h();
    		},
    		l: function claim(nodes) {
    			img = claim_element(nodes, "IMG", { src: true, alt: true, class: true });
    			this.h();
    		},
    		h: function hydrate() {
    			if (img.src !== (img_src_value = /*imagePath*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*imageAlt*/ ctx[5]);
    			attr_dev(img, "class", "bgImg svelte-1vuqh3h");
    			add_location(img, file$1, 91, 6, 1684);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*imagePath*/ 8 && img.src !== (img_src_value = /*imagePath*/ ctx[3])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*imageAlt*/ 32) {
    				attr_dev(img, "alt", /*imageAlt*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(91:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (87:4) {#if rewardLink !== ""}
    function create_if_block$1(ctx) {
    	let a;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			this.h();
    		},
    		l: function claim(nodes) {
    			a = claim_element(nodes, "A", { href: true, target: true });
    			var a_nodes = children(a);
    			img = claim_element(a_nodes, "IMG", { src: true, alt: true, class: true });
    			a_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			if (img.src !== (img_src_value = /*imagePath*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*imageAlt*/ ctx[5]);
    			attr_dev(img, "class", "bgImg svelte-1vuqh3h");
    			add_location(img, file$1, 88, 8, 1599);
    			attr_dev(a, "href", /*rewardLink*/ ctx[4]);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$1, 87, 6, 1553);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*imagePath*/ 8 && img.src !== (img_src_value = /*imagePath*/ ctx[3])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*imageAlt*/ 32) {
    				attr_dev(img, "alt", /*imageAlt*/ ctx[5]);
    			}

    			if (dirty & /*rewardLink*/ 16) {
    				attr_dev(a, "href", /*rewardLink*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(87:4) {#if rewardLink !== \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let main;
    	let div1;
    	let t0;
    	let div0;
    	let span;
    	let t1_value = /*getRandomEmoji*/ ctx[7]() + "";
    	let t1;
    	let br;
    	let t2;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*rewardLink*/ ctx[4] !== "") return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			if_block.c();
    			t0 = space();
    			div0 = element("div");
    			span = element("span");
    			t1 = text(t1_value);
    			br = element("br");
    			t2 = text(/*doorNumber*/ ctx[1]);
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", { style: true, class: true });
    			var main_nodes = children(main);
    			div1 = claim_element(main_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			if_block.l(div1_nodes);
    			t0 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			span = claim_element(div0_nodes, "SPAN", { class: true });
    			var span_nodes = children(span);
    			t1 = claim_text(span_nodes, t1_value);
    			br = claim_element(span_nodes, "BR", {});
    			t2 = claim_text(span_nodes, /*doorNumber*/ ctx[1]);
    			span_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(br, file$1, 98, 49, 1980);
    			attr_dev(span, "class", "doorNumber svelte-1vuqh3h");
    			add_location(span, file$1, 98, 6, 1937);
    			attr_dev(div0, "class", "door svelte-1vuqh3h");
    			toggle_class(div0, "doorOpen", /*doorOpen*/ ctx[0] === true);
    			toggle_class(div0, "door-odd", /*doorId*/ ctx[2] % 2 == 0);
    			toggle_class(div0, "door-even", /*doorId*/ ctx[2] % 2 != 0);
    			add_location(div0, file$1, 93, 4, 1754);
    			attr_dev(div1, "class", "backDoor svelte-1vuqh3h");
    			add_location(div1, file$1, 85, 2, 1495);
    			set_style(main, "--ratio", /*ratio*/ ctx[8]);
    			attr_dev(main, "class", "svelte-1vuqh3h");
    			toggle_class(main, "mainBorderOdd", /*doorId*/ ctx[2] % 2 == 0);
    			toggle_class(main, "mainBorderEven", /*doorId*/ ctx[2] % 2 != 0);
    			add_location(main, file$1, 78, 0, 1373);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			if_block.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(span, t1);
    			append_dev(span, br);
    			append_dev(span, t2);

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*toggleDoor*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, t0);
    				}
    			}

    			if (dirty & /*doorNumber*/ 2) set_data_dev(t2, /*doorNumber*/ ctx[1]);

    			if (dirty & /*doorOpen*/ 1) {
    				toggle_class(div0, "doorOpen", /*doorOpen*/ ctx[0] === true);
    			}

    			if (dirty & /*doorId*/ 4) {
    				toggle_class(div0, "door-odd", /*doorId*/ ctx[2] % 2 == 0);
    			}

    			if (dirty & /*doorId*/ 4) {
    				toggle_class(div0, "door-even", /*doorId*/ ctx[2] % 2 != 0);
    			}

    			if (dirty & /*doorId*/ 4) {
    				toggle_class(main, "mainBorderOdd", /*doorId*/ ctx[2] % 2 == 0);
    			}

    			if (dirty & /*doorId*/ 4) {
    				toggle_class(main, "mainBorderEven", /*doorId*/ ctx[2] % 2 != 0);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Door", slots, []);
    	let { doorNumber = 12 } = $$props;
    	let { doorId = 1 } = $$props;

    	let { canOpen = function () {
    		
    	} } = $$props;

    	let { isAlreadyOpened = function () {
    		
    	} } = $$props;

    	let { imagePath = "" } = $$props;
    	let { rewardLink = "" } = $$props;
    	let { doorOpen = false } = $$props;
    	let { imageAlt = "" } = $$props;

    	let { action = function () {
    		
    	} } = $$props;

    	let { size = "small" } = $$props;

    	function sizes() {
    		return door_sizes.keys();
    	}

    	function toggleDoor() {
    		let doorInfo = {
    			reward: { imagePath, rewardLink },
    			day: doorNumber,
    			canOpen,
    			doorId
    		};

    		if (canOpen(doorNumber) === true) {
    			if (doorOpen === true) {
    				$$invalidate(0, doorOpen = false);
    			} else {
    				$$invalidate(0, doorOpen = true);
    			}

    			if (action && doorOpen && !isAlreadyOpened(doorNumber)) {
    				action({ ...doorInfo });
    			}

    			doorStore.addDoor(doorNumber);
    		} else {
    			$$invalidate(0, doorOpen = false);
    		}
    	}

    	let emojis = ["🎅", "🤶", "🧑‍🎄", "🍭", "🦌", "⛄️", "☃️", "❄️", "🌟", "🛷"];

    	function getRandomEmoji() {
    		return emojis[Math.floor(Math.random() * emojis.length)];
    	}

    	let door_sizes = {
    		"small": { ratio: 1 },
    		"medium": { ratio: 2 },
    		"big": { ratio: 3 }
    	};

    	let ratio = door_sizes[size].ratio;

    	const writable_props = [
    		"doorNumber",
    		"doorId",
    		"canOpen",
    		"isAlreadyOpened",
    		"imagePath",
    		"rewardLink",
    		"doorOpen",
    		"imageAlt",
    		"action",
    		"size"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Door> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("doorNumber" in $$props) $$invalidate(1, doorNumber = $$props.doorNumber);
    		if ("doorId" in $$props) $$invalidate(2, doorId = $$props.doorId);
    		if ("canOpen" in $$props) $$invalidate(9, canOpen = $$props.canOpen);
    		if ("isAlreadyOpened" in $$props) $$invalidate(10, isAlreadyOpened = $$props.isAlreadyOpened);
    		if ("imagePath" in $$props) $$invalidate(3, imagePath = $$props.imagePath);
    		if ("rewardLink" in $$props) $$invalidate(4, rewardLink = $$props.rewardLink);
    		if ("doorOpen" in $$props) $$invalidate(0, doorOpen = $$props.doorOpen);
    		if ("imageAlt" in $$props) $$invalidate(5, imageAlt = $$props.imageAlt);
    		if ("action" in $$props) $$invalidate(11, action = $$props.action);
    		if ("size" in $$props) $$invalidate(12, size = $$props.size);
    	};

    	$$self.$capture_state = () => ({
    		doorStore,
    		doorNumber,
    		doorId,
    		canOpen,
    		isAlreadyOpened,
    		imagePath,
    		rewardLink,
    		doorOpen,
    		imageAlt,
    		action,
    		size,
    		sizes,
    		toggleDoor,
    		emojis,
    		getRandomEmoji,
    		door_sizes,
    		ratio
    	});

    	$$self.$inject_state = $$props => {
    		if ("doorNumber" in $$props) $$invalidate(1, doorNumber = $$props.doorNumber);
    		if ("doorId" in $$props) $$invalidate(2, doorId = $$props.doorId);
    		if ("canOpen" in $$props) $$invalidate(9, canOpen = $$props.canOpen);
    		if ("isAlreadyOpened" in $$props) $$invalidate(10, isAlreadyOpened = $$props.isAlreadyOpened);
    		if ("imagePath" in $$props) $$invalidate(3, imagePath = $$props.imagePath);
    		if ("rewardLink" in $$props) $$invalidate(4, rewardLink = $$props.rewardLink);
    		if ("doorOpen" in $$props) $$invalidate(0, doorOpen = $$props.doorOpen);
    		if ("imageAlt" in $$props) $$invalidate(5, imageAlt = $$props.imageAlt);
    		if ("action" in $$props) $$invalidate(11, action = $$props.action);
    		if ("size" in $$props) $$invalidate(12, size = $$props.size);
    		if ("emojis" in $$props) emojis = $$props.emojis;
    		if ("door_sizes" in $$props) door_sizes = $$props.door_sizes;
    		if ("ratio" in $$props) $$invalidate(8, ratio = $$props.ratio);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		doorOpen,
    		doorNumber,
    		doorId,
    		imagePath,
    		rewardLink,
    		imageAlt,
    		toggleDoor,
    		getRandomEmoji,
    		ratio,
    		canOpen,
    		isAlreadyOpened,
    		action,
    		size,
    		sizes
    	];
    }

    class Door extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			doorNumber: 1,
    			doorId: 2,
    			canOpen: 9,
    			isAlreadyOpened: 10,
    			imagePath: 3,
    			rewardLink: 4,
    			doorOpen: 0,
    			imageAlt: 5,
    			action: 11,
    			size: 12,
    			sizes: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Door",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get doorNumber() {
    		throw new Error("<Door>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set doorNumber(value) {
    		throw new Error("<Door>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get doorId() {
    		throw new Error("<Door>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set doorId(value) {
    		throw new Error("<Door>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get canOpen() {
    		throw new Error("<Door>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set canOpen(value) {
    		throw new Error("<Door>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isAlreadyOpened() {
    		throw new Error("<Door>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isAlreadyOpened(value) {
    		throw new Error("<Door>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imagePath() {
    		throw new Error("<Door>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imagePath(value) {
    		throw new Error("<Door>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rewardLink() {
    		throw new Error("<Door>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rewardLink(value) {
    		throw new Error("<Door>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get doorOpen() {
    		throw new Error("<Door>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set doorOpen(value) {
    		throw new Error("<Door>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imageAlt() {
    		throw new Error("<Door>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imageAlt(value) {
    		throw new Error("<Door>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get action() {
    		throw new Error("<Door>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set action(value) {
    		throw new Error("<Door>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Door>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Door>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sizes() {
    		return this.$$.ctx[13];
    	}

    	set sizes(value) {
    		throw new Error("<Door>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/FireWorks.svelte generated by Svelte v3.30.0 */
    const file$2 = "src/components/FireWorks.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let canvas_1;
    	let t;

    	const block = {
    		c: function create() {
    			main = element("main");
    			canvas_1 = element("canvas");
    			t = text("Canvas is not supported in your browser.");
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", {});
    			var main_nodes = children(main);
    			canvas_1 = claim_element(main_nodes, "CANVAS", { class: true, id: true });
    			var canvas_1_nodes = children(canvas_1);
    			t = claim_text(canvas_1_nodes, "Canvas is not supported in your browser.");
    			canvas_1_nodes.forEach(detach_dev);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(canvas_1, "class", "canvas-fw svelte-th0hfq");
    			attr_dev(canvas_1, "id", "canvas");
    			add_location(canvas_1, file$2, 243, 4, 8711);
    			add_location(main, file$2, 242, 0, 8680);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, canvas_1);
    			append_dev(canvas_1, t);
    			/*canvas_1_binding*/ ctx[3](canvas_1);
    			/*main_binding*/ ctx[4](main);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			/*canvas_1_binding*/ ctx[3](null);
    			/*main_binding*/ ctx[4](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function random(min, max) {
    	return Math.random() * (max - min) + min;
    }

    // calculate the distance between two points
    function calculateDistance(p1x, p1y, p2x, p2y) {
    	var xDistance = p1x - p2x, yDistance = p1y - p2y;
    	return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FireWorks", slots, []);
    	let element;

    	// when animating on canvas, it is best to use requestAnimationFrame instead of setTimeout or setInterval
    	// not supported in all browsers though and sometimes needs a prefix, so we need a shim
    	window.requestAnimFrame = (function () {
    		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
    			window.setTimeout(callback, 1000 / 60);
    		};
    	})();

    	let canvas;

    	// now we will setup our basic variables for the demo
    	// full screen dimensions
    	let cw = window.innerWidth;

    	let ch = window.innerHeight,
    		// firework collection
    		fireworks = [],
    		// particle collection
    		particles = [],
    		// starting hue
    		hue = 120;

    	let ctx = null;

    	onMount(() => {
    		ctx = canvas.getContext("2d");

    		// set canvas dimensions
    		$$invalidate(1, canvas.width = cw, canvas);

    		$$invalidate(1, canvas.height = ch, canvas);
    	});

    	// create firework
    	function Firework(sx, sy, tx, ty) {
    		// actual coordinates
    		this.x = sx;

    		this.y = sy;

    		// starting coordinates
    		this.sx = sx;

    		this.sy = sy;

    		// target coordinates
    		this.tx = tx;

    		this.ty = ty;

    		// distance from starting point to target
    		this.distanceToTarget = calculateDistance(sx, sy, tx, ty);

    		this.distanceTraveled = 0;

    		// track the past coordinates of each firework to create a trail effect, increase the coordinate count to create more prominent trails
    		this.coordinates = [];

    		this.coordinateCount = 3;

    		// populate initial coordinate collection with the current coordinates
    		while (this.coordinateCount--) {
    			this.coordinates.push([this.x, this.y]);
    		}

    		this.angle = Math.atan2(ty - sy, tx - sx);
    		this.speed = 2;
    		this.acceleration = 1.05;
    		this.brightness = random(50, 70);

    		// circle target indicator radius
    		this.targetRadius = 1;
    	}

    	// update firework
    	Firework.prototype.update = function (index) {
    		// remove last item in coordinates array
    		this.coordinates.pop();

    		// add current coordinates to the start of the array
    		this.coordinates.unshift([this.x, this.y]);

    		// cycle the circle target indicator radius
    		if (this.targetRadius < 8) {
    			this.targetRadius += 0.3;
    		} else {
    			this.targetRadius = 1;
    		}

    		// speed up the firework
    		this.speed *= this.acceleration;

    		// get the current velocities based on angle and speed
    		var vx = Math.cos(this.angle) * this.speed,
    			vy = Math.sin(this.angle) * this.speed;

    		// how far will the firework have traveled with velocities applied?
    		this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);

    		// if the distance traveled, including velocities, is greater than the initial distance to the target, then the target has been reached
    		if (this.distanceTraveled >= this.distanceToTarget) {
    			createParticles(this.tx, this.ty);

    			// remove the firework, use the index passed into the update function to determine which to remove
    			fireworks.splice(index, 1);
    		} else {
    			// target not reached, keep traveling
    			this.x += vx;

    			this.y += vy;
    		}
    	};

    	// draw firework
    	Firework.prototype.draw = function () {
    		ctx.beginPath();

    		// move to the last tracked coordinate in the set, then draw a line to the current x and y
    		ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);

    		ctx.lineTo(this.x, this.y);
    		ctx.strokeStyle = "hsl(" + hue + ", 100%, " + this.brightness + "%)";
    		ctx.stroke();
    		ctx.beginPath();

    		// draw the target for this firework with a pulsing circle
    		ctx.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI * 2);

    		ctx.stroke();
    	};

    	// create particle
    	function Particle(x, y) {
    		this.x = x;
    		this.y = y;

    		// track the past coordinates of each particle to create a trail effect, increase the coordinate count to create more prominent trails
    		this.coordinates = [];

    		this.coordinateCount = 5;

    		while (this.coordinateCount--) {
    			this.coordinates.push([this.x, this.y]);
    		}

    		// set a random angle in all possible directions, in radians
    		this.angle = random(0, Math.PI * 2);

    		this.speed = random(1, 10);

    		// friction will slow the particle down
    		this.friction = 0.95;

    		// gravity will be applied and pull the particle down
    		this.gravity = 1;

    		// set the hue to a random number +-50 of the overall hue variable
    		this.hue = random(hue - 50, hue + 50);

    		this.brightness = random(50, 80);
    		this.alpha = 1;

    		// set how fast the particle fades out
    		this.decay = random(0.015, 0.03);
    	}

    	// update particle
    	Particle.prototype.update = function (index) {
    		// remove last item in coordinates array
    		this.coordinates.pop();

    		// add current coordinates to the start of the array
    		this.coordinates.unshift([this.x, this.y]);

    		// slow down the particle
    		this.speed *= this.friction;

    		// apply velocity
    		this.x += Math.cos(this.angle) * this.speed;

    		this.y += Math.sin(this.angle) * this.speed + this.gravity;

    		// fade out the particle
    		this.alpha -= this.decay;

    		// remove the particle once the alpha is low enough, based on the passed in index
    		if (this.alpha <= this.decay) {
    			particles.splice(index, 1);
    		}
    	};

    	// draw particle
    	Particle.prototype.draw = function () {
    		ctx.beginPath();

    		// move to the last tracked coordinates in the set, then draw a line to the current x and y
    		ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);

    		ctx.lineTo(this.x, this.y);
    		ctx.strokeStyle = "hsla(" + this.hue + ", 100%, " + this.brightness + "%, " + this.alpha + ")";
    		ctx.stroke();
    	};

    	// create particle group/explosion
    	function createParticles(x, y) {
    		// increase the particle count for a bigger explosion, beware of the canvas performance hit with the increased particles though
    		var particleCount = 30;

    		while (particleCount--) {
    			particles.push(new Particle(x, y));
    		}
    	}

    	const startFW = showOneFW;

    	function showOneFW() {
    		$$invalidate(0, element.style.zIndex = 200, element);
    		totalTick = 0;
    		renderFW();
    	}

    	function destroySelf() {
    		$$invalidate(0, element.style.zIndex = 0, element);
    	}

    	let totalTick = 0;

    	function renderFW() {
    		hue = random(0, 360);

    		// normally, clearRect() would be used to clear the canvas
    		// we want to create a trailing effect though
    		// setting the composite operation to destination-out will allow us to clear the canvas at a specific opacity, rather than wiping it entirely
    		ctx.globalCompositeOperation = "destination-out";

    		// decrease the alpha property to create more prominent trails
    		ctx.fillStyle = "rgba(0, 0, 0, 0.5)";

    		ctx.fillRect(0, 0, cw, ch);

    		// change the composite operation back to our main mode
    		// lighter creates bright highlight points as the fireworks and particles overlap each other
    		ctx.globalCompositeOperation = "lighter";

    		// let fw = new Firework( cw / 2, ch, random( 0, cw ), random( 0, ch / 2 ) );
    		if (totalTick < 200) {
    			fireworks.push(new Firework(cw / 2, ch, random(0, cw), random(0, ch / 2)));
    		}

    		totalTick++;

    		if (totalTick < 300) {
    			requestAnimFrame(renderFW);
    		} else {
    			destroySelf();
    		}

    		var i = fireworks.length;

    		while (i--) {
    			fireworks[i].draw();
    			fireworks[i].update(i);
    		}

    		var i = particles.length;

    		while (i--) {
    			particles[i].draw();
    			particles[i].update(i);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FireWorks> was created with unknown prop '${key}'`);
    	});

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			canvas = $$value;
    			$$invalidate(1, canvas);
    		});
    	}

    	function main_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(0, element);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		element,
    		canvas,
    		cw,
    		ch,
    		fireworks,
    		particles,
    		hue,
    		ctx,
    		random,
    		calculateDistance,
    		Firework,
    		Particle,
    		createParticles,
    		startFW,
    		showOneFW,
    		destroySelf,
    		totalTick,
    		renderFW
    	});

    	$$self.$inject_state = $$props => {
    		if ("element" in $$props) $$invalidate(0, element = $$props.element);
    		if ("canvas" in $$props) $$invalidate(1, canvas = $$props.canvas);
    		if ("cw" in $$props) cw = $$props.cw;
    		if ("ch" in $$props) ch = $$props.ch;
    		if ("fireworks" in $$props) fireworks = $$props.fireworks;
    		if ("particles" in $$props) particles = $$props.particles;
    		if ("hue" in $$props) hue = $$props.hue;
    		if ("ctx" in $$props) ctx = $$props.ctx;
    		if ("totalTick" in $$props) totalTick = $$props.totalTick;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [element, canvas, startFW, canvas_1_binding, main_binding];
    }

    class FireWorks extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { startFW: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FireWorks",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get startFW() {
    		return this.$$.ctx[2];
    	}

    	set startFW(value) {
    		throw new Error("<FireWorks>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/PopUp.svelte generated by Svelte v3.30.0 */

    const { console: console_1 } = globals;
    const file$3 = "src/components/PopUp.svelte";

    function create_fragment$6(ctx) {
    	let main;
    	let fireworks;
    	let t;
    	let door;
    	let current;
    	let fireworks_props = {};
    	fireworks = new FireWorks({ props: fireworks_props, $$inline: true });
    	/*fireworks_binding*/ ctx[3](fireworks);

    	door = new Door({
    			props: {
    				imagePath: /*doorInfo*/ ctx[0].reward.imagePath,
    				rewardLink: /*doorInfo*/ ctx[0].reward.rewardLink,
    				doorNumber: /*doorInfo*/ ctx[0].day,
    				doorOpen: "false",
    				canOpen: /*doorInfo*/ ctx[0].canOpen,
    				action: /*toto*/ ctx[2],
    				doorId: /*doorInfo*/ ctx[0].doorId,
    				size: "big"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(fireworks.$$.fragment);
    			t = space();
    			create_component(door.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", { class: true });
    			var main_nodes = children(main);
    			claim_component(fireworks.$$.fragment, main_nodes);
    			t = claim_space(main_nodes);
    			claim_component(door.$$.fragment, main_nodes);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(main, "class", "svelte-1aqkm6r");
    			add_location(main, file$3, 27, 0, 432);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(fireworks, main, null);
    			append_dev(main, t);
    			mount_component(door, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const fireworks_changes = {};
    			fireworks.$set(fireworks_changes);
    			const door_changes = {};
    			if (dirty & /*doorInfo*/ 1) door_changes.imagePath = /*doorInfo*/ ctx[0].reward.imagePath;
    			if (dirty & /*doorInfo*/ 1) door_changes.rewardLink = /*doorInfo*/ ctx[0].reward.rewardLink;
    			if (dirty & /*doorInfo*/ 1) door_changes.doorNumber = /*doorInfo*/ ctx[0].day;
    			if (dirty & /*doorInfo*/ 1) door_changes.canOpen = /*doorInfo*/ ctx[0].canOpen;
    			if (dirty & /*doorInfo*/ 1) door_changes.doorId = /*doorInfo*/ ctx[0].doorId;
    			door.$set(door_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fireworks.$$.fragment, local);
    			transition_in(door.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fireworks.$$.fragment, local);
    			transition_out(door.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			/*fireworks_binding*/ ctx[3](null);
    			destroy_component(fireworks);
    			destroy_component(door);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PopUp", slots, []);
    	let { doorInfo } = $$props;
    	let fw;

    	function toto() {
    		fw.startFW();
    		console.log(fw);
    	}

    	const writable_props = ["doorInfo"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<PopUp> was created with unknown prop '${key}'`);
    	});

    	function fireworks_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			fw = $$value;
    			$$invalidate(1, fw);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("doorInfo" in $$props) $$invalidate(0, doorInfo = $$props.doorInfo);
    	};

    	$$self.$capture_state = () => ({ Door, FireWorks, doorInfo, fw, toto });

    	$$self.$inject_state = $$props => {
    		if ("doorInfo" in $$props) $$invalidate(0, doorInfo = $$props.doorInfo);
    		if ("fw" in $$props) $$invalidate(1, fw = $$props.fw);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [doorInfo, fw, toto, fireworks_binding];
    }

    class PopUp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { doorInfo: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PopUp",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*doorInfo*/ ctx[0] === undefined && !("doorInfo" in props)) {
    			console_1.warn("<PopUp> was created without expected prop 'doorInfo'");
    		}
    	}

    	get doorInfo() {
    		throw new Error("<PopUp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set doorInfo(value) {
    		throw new Error("<PopUp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/PopUpSeeYa.svelte generated by Svelte v3.30.0 */

    const file$4 = "src/components/PopUpSeeYa.svelte";

    function create_fragment$7(ctx) {
    	let main;
    	let h20;
    	let t0;
    	let t1;
    	let img;
    	let img_src_value;
    	let t2;
    	let h21;
    	let t3;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h20 = element("h2");
    			t0 = text("Joyeux Noël");
    			t1 = space();
    			img = element("img");
    			t2 = space();
    			h21 = element("h2");
    			t3 = text("A l'année prochaine!");
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", { class: true });
    			var main_nodes = children(main);
    			h20 = claim_element(main_nodes, "H2", { class: true });
    			var h20_nodes = children(h20);
    			t0 = claim_text(h20_nodes, "Joyeux Noël");
    			h20_nodes.forEach(detach_dev);
    			t1 = claim_space(main_nodes);
    			img = claim_element(main_nodes, "IMG", { class: true, src: true, alt: true });
    			t2 = claim_space(main_nodes);
    			h21 = claim_element(main_nodes, "H2", { class: true });
    			var h21_nodes = children(h21);
    			t3 = claim_text(h21_nodes, "A l'année prochaine!");
    			h21_nodes.forEach(detach_dev);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h20, "class", "svelte-1q85uo7");
    			add_location(h20, file$4, 28, 4, 391);
    			attr_dev(img, "class", "sapin svelte-1q85uo7");
    			if (img.src !== (img_src_value = "/build/images/sapin-noel.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "sapin de noel avec des cadeaux au pieds de l'arbre");
    			add_location(img, file$4, 29, 4, 416);
    			attr_dev(h21, "class", "svelte-1q85uo7");
    			add_location(h21, file$4, 30, 4, 533);
    			attr_dev(main, "class", "svelte-1q85uo7");
    			add_location(main, file$4, 27, 0, 378);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h20);
    			append_dev(h20, t0);
    			append_dev(main, t1);
    			append_dev(main, img);
    			append_dev(main, t2);
    			append_dev(main, h21);
    			append_dev(h21, t3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PopUpSeeYa", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PopUpSeeYa> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class PopUpSeeYa extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PopUpSeeYa",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/routes/calendar.svelte generated by Svelte v3.30.0 */

    const { console: console_1$1 } = globals;
    const file$5 = "src/routes/calendar.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    // (112:1) {#if !isProd}
    function create_if_block_1$1(ctx) {
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text("Show a popup!");
    			this.h();
    		},
    		l: function claim(nodes) {
    			button = claim_element(nodes, "BUTTON", {});
    			var button_nodes = children(button);
    			t = claim_text(button_nodes, "Show a popup!");
    			button_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(button, file$5, 112, 2, 2427);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*showPopUpDoor*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(112:1) {#if !isProd}",
    		ctx
    	});

    	return block;
    }

    // (124:1) {#if displayError}
    function create_if_block$2(ctx) {
    	let h1;
    	let t0;
    	let t1;
    	let h2;
    	let t2;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text("ERROR :");
    			t1 = space();
    			h2 = element("h2");
    			t2 = text(/*displayError*/ ctx[2]);
    			this.h();
    		},
    		l: function claim(nodes) {
    			h1 = claim_element(nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t0 = claim_text(h1_nodes, "ERROR :");
    			h1_nodes.forEach(detach_dev);
    			t1 = claim_space(nodes);
    			h2 = claim_element(nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			t2 = claim_text(h2_nodes, /*displayError*/ ctx[2]);
    			h2_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h1, "class", "svelte-1dhn3qf");
    			add_location(h1, file$5, 124, 2, 2806);
    			attr_dev(h2, "class", "svelte-1dhn3qf");
    			add_location(h2, file$5, 125, 2, 2826);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*displayError*/ 4) set_data_dev(t2, /*displayError*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(124:1) {#if displayError}",
    		ctx
    	});

    	return block;
    }

    // (130:2) {#each calendarDays as doorNumber}
    function create_each_block(ctx) {
    	let door;
    	let current;

    	door = new Door({
    			props: {
    				imagePath: /*doorNumber*/ ctx[17].reward.imagePath,
    				rewardLink: /*doorNumber*/ ctx[17].reward.rewardLink,
    				doorNumber: /*doorNumber*/ ctx[17].day,
    				doorOpen: /*doorNumber*/ ctx[17].day <= /*$doorStore*/ ctx[3],
    				canOpen: /*canOpen*/ ctx[5],
    				isAlreadyOpened: /*isAlreadyOpened*/ ctx[6],
    				doorId: /*doorNumber*/ ctx[17].id,
    				size: "small",
    				action: /*showPopup*/ ctx[9]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(door.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(door.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(door, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const door_changes = {};
    			if (dirty & /*calendarDays*/ 2) door_changes.imagePath = /*doorNumber*/ ctx[17].reward.imagePath;
    			if (dirty & /*calendarDays*/ 2) door_changes.rewardLink = /*doorNumber*/ ctx[17].reward.rewardLink;
    			if (dirty & /*calendarDays*/ 2) door_changes.doorNumber = /*doorNumber*/ ctx[17].day;
    			if (dirty & /*calendarDays, $doorStore*/ 10) door_changes.doorOpen = /*doorNumber*/ ctx[17].day <= /*$doorStore*/ ctx[3];
    			if (dirty & /*calendarDays*/ 2) door_changes.doorId = /*doorNumber*/ ctx[17].id;
    			door.$set(door_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(door.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(door.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(door, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(130:2) {#each calendarDays as doorNumber}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let main;
    	let t0;
    	let h1;
    	let t1;
    	let a0;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let p0;
    	let t7;
    	let t8;
    	let p1;
    	let t9;
    	let t10;
    	let p2;
    	let t11;
    	let t12;
    	let p3;
    	let t13;
    	let t14;
    	let t15;
    	let div0;
    	let t16;
    	let div1;
    	let p4;
    	let t17;
    	let t18;
    	let p5;
    	let t19;
    	let t20;
    	let div2;
    	let br;
    	let t21;
    	let p6;
    	let t22;
    	let t23;
    	let p7;
    	let t24;
    	let a1;
    	let t25;
    	let t26;
    	let button;
    	let t27;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = !/*isProd*/ ctx[4] && create_if_block_1$1(ctx);
    	let if_block1 = /*displayError*/ ctx[2] && create_if_block$2(ctx);
    	let each_value = /*calendarDays*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			h1 = element("h1");
    			t1 = text("🎄 ");
    			a0 = element("a");
    			t2 = text("Iterative");
    			t3 = space();
    			t4 = text(/*name*/ ctx[0]);
    			t5 = text(" By Talan! 🎄");
    			t6 = space();
    			p0 = element("p");
    			t7 = text("❤️ Made with love by Talan Labs ❤️");
    			t8 = space();
    			p1 = element("p");
    			t9 = text("Envie d'apprendre un savoir inutile et de gagner des cadeaux ?");
    			t10 = space();
    			p2 = element("p");
    			t11 = text("Clique sur la case du jour et réponds à la question posée.");
    			t12 = space();
    			p3 = element("p");
    			t13 = text("A vous de jouer !");
    			t14 = space();
    			if (if_block1) if_block1.c();
    			t15 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t16 = space();
    			div1 = element("div");
    			p4 = element("p");
    			t17 = text("A gagner : livres, cd, ballons de rugby, polos Stade Français, et plein d’autres surprises !  Avec en bonus un chèque cadeau pour celui qui répondra correctement à un maximum de questions.");
    			t18 = space();
    			p5 = element("p");
    			t19 = text("La réponse et les gagnants seront annoncés le lendemain sur Workplace.");
    			t20 = space();
    			div2 = element("div");
    			br = element("br");
    			t21 = space();
    			p6 = element("p");
    			t22 = text("Intéressé par le processus itératif derrière le developpement de ce calendrier?");
    			t23 = space();
    			p7 = element("p");
    			t24 = text("Vous pouvez consulter le ");
    			a1 = element("a");
    			t25 = text("changelog ici!");
    			t26 = space();
    			button = element("button");
    			t27 = text("Reset Progression");
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", { class: true });
    			var main_nodes = children(main);
    			if (if_block0) if_block0.l(main_nodes);
    			t0 = claim_space(main_nodes);
    			h1 = claim_element(main_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t1 = claim_text(h1_nodes, "🎄 ");
    			a0 = claim_element(h1_nodes, "A", { class: true, href: true });
    			var a0_nodes = children(a0);
    			t2 = claim_text(a0_nodes, "Iterative");
    			a0_nodes.forEach(detach_dev);
    			t3 = claim_space(h1_nodes);
    			t4 = claim_text(h1_nodes, /*name*/ ctx[0]);
    			t5 = claim_text(h1_nodes, " By Talan! 🎄");
    			h1_nodes.forEach(detach_dev);
    			t6 = claim_space(main_nodes);
    			p0 = claim_element(main_nodes, "P", { class: true });
    			var p0_nodes = children(p0);
    			t7 = claim_text(p0_nodes, "❤️ Made with love by Talan Labs ❤️");
    			p0_nodes.forEach(detach_dev);
    			t8 = claim_space(main_nodes);
    			p1 = claim_element(main_nodes, "P", { class: true });
    			var p1_nodes = children(p1);
    			t9 = claim_text(p1_nodes, "Envie d'apprendre un savoir inutile et de gagner des cadeaux ?");
    			p1_nodes.forEach(detach_dev);
    			t10 = claim_space(main_nodes);
    			p2 = claim_element(main_nodes, "P", { class: true });
    			var p2_nodes = children(p2);
    			t11 = claim_text(p2_nodes, "Clique sur la case du jour et réponds à la question posée.");
    			p2_nodes.forEach(detach_dev);
    			t12 = claim_space(main_nodes);
    			p3 = claim_element(main_nodes, "P", { class: true });
    			var p3_nodes = children(p3);
    			t13 = claim_text(p3_nodes, "A vous de jouer !");
    			p3_nodes.forEach(detach_dev);
    			t14 = claim_space(main_nodes);
    			if (if_block1) if_block1.l(main_nodes);
    			t15 = claim_space(main_nodes);
    			div0 = claim_element(main_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div0_nodes);
    			}

    			div0_nodes.forEach(detach_dev);
    			t16 = claim_space(main_nodes);
    			div1 = claim_element(main_nodes, "DIV", {});
    			var div1_nodes = children(div1);
    			p4 = claim_element(div1_nodes, "P", { class: true });
    			var p4_nodes = children(p4);
    			t17 = claim_text(p4_nodes, "A gagner : livres, cd, ballons de rugby, polos Stade Français, et plein d’autres surprises !  Avec en bonus un chèque cadeau pour celui qui répondra correctement à un maximum de questions.");
    			p4_nodes.forEach(detach_dev);
    			t18 = claim_space(div1_nodes);
    			p5 = claim_element(div1_nodes, "P", { class: true });
    			var p5_nodes = children(p5);
    			t19 = claim_text(p5_nodes, "La réponse et les gagnants seront annoncés le lendemain sur Workplace.");
    			p5_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t20 = claim_space(main_nodes);
    			div2 = claim_element(main_nodes, "DIV", {});
    			var div2_nodes = children(div2);
    			br = claim_element(div2_nodes, "BR", {});
    			t21 = claim_space(div2_nodes);
    			p6 = claim_element(div2_nodes, "P", { class: true });
    			var p6_nodes = children(p6);
    			t22 = claim_text(p6_nodes, "Intéressé par le processus itératif derrière le developpement de ce calendrier?");
    			p6_nodes.forEach(detach_dev);
    			t23 = claim_space(div2_nodes);
    			p7 = claim_element(div2_nodes, "P", { class: true });
    			var p7_nodes = children(p7);
    			t24 = claim_text(p7_nodes, "Vous pouvez consulter le ");
    			a1 = claim_element(p7_nodes, "A", { class: true, href: true });
    			var a1_nodes = children(a1);
    			t25 = claim_text(a1_nodes, "changelog ici!");
    			a1_nodes.forEach(detach_dev);
    			p7_nodes.forEach(detach_dev);
    			t26 = claim_space(div2_nodes);
    			button = claim_element(div2_nodes, "BUTTON", {});
    			var button_nodes = children(button);
    			t27 = claim_text(button_nodes, "Reset Progression");
    			button_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(a0, "class", "title svelte-1dhn3qf");
    			attr_dev(a0, "href", "/Changelog");
    			add_location(a0, file$5, 115, 8, 2499);
    			attr_dev(h1, "class", "svelte-1dhn3qf");
    			add_location(h1, file$5, 115, 1, 2492);
    			attr_dev(p0, "class", "svelte-1dhn3qf");
    			add_location(p0, file$5, 116, 1, 2574);
    			attr_dev(p1, "class", "svelte-1dhn3qf");
    			add_location(p1, file$5, 118, 1, 2618);
    			attr_dev(p2, "class", "svelte-1dhn3qf");
    			add_location(p2, file$5, 119, 1, 2690);
    			attr_dev(p3, "class", "svelte-1dhn3qf");
    			add_location(p3, file$5, 121, 1, 2758);
    			attr_dev(div0, "class", "box svelte-1dhn3qf");
    			add_location(div0, file$5, 128, 1, 2859);
    			attr_dev(p4, "class", "svelte-1dhn3qf");
    			add_location(p4, file$5, 145, 1, 3262);
    			attr_dev(p5, "class", "svelte-1dhn3qf");
    			add_location(p5, file$5, 147, 1, 3461);
    			add_location(div1, file$5, 144, 1, 3255);
    			add_location(br, file$5, 150, 1, 3554);
    			attr_dev(p6, "class", "svelte-1dhn3qf");
    			add_location(p6, file$5, 151, 1, 3561);
    			attr_dev(a1, "class", "link svelte-1dhn3qf");
    			attr_dev(a1, "href", "/Changelog");
    			add_location(a1, file$5, 152, 29, 3677);
    			attr_dev(p7, "class", "svelte-1dhn3qf");
    			add_location(p7, file$5, 152, 1, 3649);
    			add_location(button, file$5, 153, 0, 3734);
    			add_location(div2, file$5, 149, 0, 3547);
    			attr_dev(main, "class", "svelte-1dhn3qf");
    			add_location(main, file$5, 109, 0, 2402);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t0);
    			append_dev(main, h1);
    			append_dev(h1, t1);
    			append_dev(h1, a0);
    			append_dev(a0, t2);
    			append_dev(h1, t3);
    			append_dev(h1, t4);
    			append_dev(h1, t5);
    			append_dev(main, t6);
    			append_dev(main, p0);
    			append_dev(p0, t7);
    			append_dev(main, t8);
    			append_dev(main, p1);
    			append_dev(p1, t9);
    			append_dev(main, t10);
    			append_dev(main, p2);
    			append_dev(p2, t11);
    			append_dev(main, t12);
    			append_dev(main, p3);
    			append_dev(p3, t13);
    			append_dev(main, t14);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t15);
    			append_dev(main, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(main, t16);
    			append_dev(main, div1);
    			append_dev(div1, p4);
    			append_dev(p4, t17);
    			append_dev(div1, t18);
    			append_dev(div1, p5);
    			append_dev(p5, t19);
    			append_dev(main, t20);
    			append_dev(main, div2);
    			append_dev(div2, br);
    			append_dev(div2, t21);
    			append_dev(div2, p6);
    			append_dev(p6, t22);
    			append_dev(div2, t23);
    			append_dev(div2, p7);
    			append_dev(p7, t24);
    			append_dev(p7, a1);
    			append_dev(a1, t25);
    			append_dev(div2, t26);
    			append_dev(div2, button);
    			append_dev(button, t27);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*resetProgression*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*isProd*/ ctx[4]) if_block0.p(ctx, dirty);
    			if (!current || dirty & /*name*/ 1) set_data_dev(t4, /*name*/ ctx[0]);

    			if (/*displayError*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					if_block1.m(main, t15);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*calendarDays, $doorStore, canOpen, isAlreadyOpened, showPopup*/ 618) {
    				each_value = /*calendarDays*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $doorStore;
    	validate_store(doorStore, "doorStore");
    	component_subscribe($$self, doorStore, $$value => $$invalidate(3, $doorStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Calendar", slots, []);
    	const { open } = getContext("simple-modal");
    	let { name = "" } = $$props;
    	let calendarDays = [];
    	let nbDays = 1;
    	let door_numbers = [...Array(24).keys()];
    	let random_door_numbers = door_numbers.map(a => ({ sort: Math.random(), value: a })).sort((a, b) => a.sort - b.sort).map(a => a.value);

    	// random_door_numbers = door_numbers
    	let offset = 0;

    	let isProd = {"env":{"isProd":false,"API_URL":"http://localhost:8080"}}.env.isProd;

    	if (!isProd) {
    		offset = 1;
    	}

    	let displayError;
    	let { calendarDate = {} } = $$props;
    	let nbDaysSinceFirstDec;

    	onMount(async () => {
    		let daySinceFirstDec = await fetch({"env":{"isProd":false,"API_URL":"http://localhost:8080"}}.env.API_URL + "/daySinceFirstDec").then(r => r.json()).then(data => {
    			return data.daySinceFirstDec;
    		}).catch(error => {
    			$$invalidate(2, displayError = "ERROR QUERYING DATE API");
    			console.log("API fetch error");
    			console.log(error);
    		});

    		if (daySinceFirstDec) {
    			nbDays = parseInt(daySinceFirstDec) + offset;
    			nbDaysSinceFirstDec = nbDays;
    			let id = 1; //j'ai honte je suis desole devant le reste du monde mais j'ai pas le temps... :D

    			for (let i of random_door_numbers) {
    				const day = parseInt(i) + 1;

    				calendarDays.push({
    					day,
    					reward: calendarDate[day - 1] ? calendarDate[day - 1] : "",
    					id
    				});

    				id++;
    			}

    			$$invalidate(1, calendarDays);
    			console.log(nbDaysSinceFirstDec);

    			if (nbDaysSinceFirstDec >= 24) {
    				open(PopUpSeeYa);
    			}
    		}
    	});

    	function canOpen(dayToCheck) {
    		let dayInStore = dayToCheck - 1 <= $doorStore;
    		let dayToOpenLessThanToday = dayToCheck - nbDays <= 0;
    		console.log("canOpen", dayToCheck, dayInStore, dayToOpenLessThanToday);
    		return dayInStore && dayToOpenLessThanToday;
    	}

    	function isAlreadyOpened(dayToCheck) {
    		console.log("isAlreadyOpened", dayToCheck);
    		console.log($doorStore);
    		const dayInStore = dayToCheck <= $doorStore;
    		return dayInStore;
    	}

    	function resetProgression() {
    		doorStore.reset();
    	}

    	function showPopUpDoor() {
    		let doorConfig = {
    			reward: { imagePath: "", rewardLink: "" },
    			canOpen,
    			day: 1,
    			id: 102
    		};

    		showPopup(doorConfig);
    	}

    	const showPopup = doorInfo => {
    		open(PopUp, { doorInfo });
    	};

    	const writable_props = ["name", "calendarDate"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Calendar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("calendarDate" in $$props) $$invalidate(10, calendarDate = $$props.calendarDate);
    	};

    	$$self.$capture_state = () => ({
    		Door,
    		onMount,
    		doorStore,
    		getContext,
    		Popup: PopUp,
    		PopUpSeeYa,
    		open,
    		name,
    		calendarDays,
    		nbDays,
    		door_numbers,
    		random_door_numbers,
    		offset,
    		isProd,
    		displayError,
    		calendarDate,
    		nbDaysSinceFirstDec,
    		canOpen,
    		isAlreadyOpened,
    		resetProgression,
    		showPopUpDoor,
    		showPopup,
    		$doorStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("calendarDays" in $$props) $$invalidate(1, calendarDays = $$props.calendarDays);
    		if ("nbDays" in $$props) nbDays = $$props.nbDays;
    		if ("door_numbers" in $$props) door_numbers = $$props.door_numbers;
    		if ("random_door_numbers" in $$props) random_door_numbers = $$props.random_door_numbers;
    		if ("offset" in $$props) offset = $$props.offset;
    		if ("isProd" in $$props) $$invalidate(4, isProd = $$props.isProd);
    		if ("displayError" in $$props) $$invalidate(2, displayError = $$props.displayError);
    		if ("calendarDate" in $$props) $$invalidate(10, calendarDate = $$props.calendarDate);
    		if ("nbDaysSinceFirstDec" in $$props) nbDaysSinceFirstDec = $$props.nbDaysSinceFirstDec;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		name,
    		calendarDays,
    		displayError,
    		$doorStore,
    		isProd,
    		canOpen,
    		isAlreadyOpened,
    		resetProgression,
    		showPopUpDoor,
    		showPopup,
    		calendarDate
    	];
    }

    class Calendar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { name: 0, calendarDate: 10 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Calendar",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get name() {
    		throw new Error("<Calendar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get calendarDate() {
    		throw new Error("<Calendar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set calendarDate(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Changelog.svelte generated by Svelte v3.30.0 */
    const file$6 = "src/components/Changelog.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (13:0) {#each changelog.content as item}
    function create_each_block$1(ctx) {
    	let p;
    	let t_value = /*item*/ ctx[1] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			p = claim_element(nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t = claim_text(p_nodes, t_value);
    			p_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(p, "class", "svelte-v4y6ua");
    			add_location(p, file$6, 13, 4, 226);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*changelog*/ 1 && t_value !== (t_value = /*item*/ ctx[1] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(13:0) {#each changelog.content as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let h3;
    	let t0_value = /*changelog*/ ctx[0].date + "";
    	let t0;
    	let t1;
    	let t2_value = /*changelog*/ ctx[0].title + "";
    	let t2;
    	let t3;
    	let each_1_anchor;
    	let each_value = /*changelog*/ ctx[0].content;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = text(" : ");
    			t2 = text(t2_value);
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			this.h();
    		},
    		l: function claim(nodes) {
    			h3 = claim_element(nodes, "H3", { class: true });
    			var h3_nodes = children(h3);
    			t0 = claim_text(h3_nodes, t0_value);
    			t1 = claim_text(h3_nodes, " : ");
    			t2 = claim_text(h3_nodes, t2_value);
    			h3_nodes.forEach(detach_dev);
    			t3 = claim_space(nodes);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(nodes);
    			}

    			each_1_anchor = empty();
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h3, "class", "svelte-v4y6ua");
    			add_location(h3, file$6, 11, 0, 142);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t0);
    			append_dev(h3, t1);
    			append_dev(h3, t2);
    			insert_dev(target, t3, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*changelog*/ 1 && t0_value !== (t0_value = /*changelog*/ ctx[0].date + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*changelog*/ 1 && t2_value !== (t2_value = /*changelog*/ ctx[0].title + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*changelog*/ 1) {
    				each_value = /*changelog*/ ctx[0].content;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t3);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Changelog", slots, []);
    	let { changelog = { "date": "", "title": "", "text": "" } } = $$props;
    	const writable_props = ["changelog"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Changelog> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("changelog" in $$props) $$invalidate(0, changelog = $$props.changelog);
    	};

    	$$self.$capture_state = () => ({ FireWorks, changelog });

    	$$self.$inject_state = $$props => {
    		if ("changelog" in $$props) $$invalidate(0, changelog = $$props.changelog);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [changelog];
    }

    class Changelog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { changelog: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Changelog",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get changelog() {
    		throw new Error("<Changelog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set changelog(value) {
    		throw new Error("<Changelog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Changelogs.svelte generated by Svelte v3.30.0 */
    const file$7 = "src/components/Changelogs.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (19:0) {#each changelogs as changelog}
    function create_each_block$2(ctx) {
    	let changelog;
    	let t;
    	let br;
    	let current;

    	changelog = new Changelog({
    			props: { changelog: /*changelog*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(changelog.$$.fragment);
    			t = space();
    			br = element("br");
    			this.h();
    		},
    		l: function claim(nodes) {
    			claim_component(changelog.$$.fragment, nodes);
    			t = claim_space(nodes);
    			br = claim_element(nodes, "BR", {});
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(br, file$7, 21, 4, 417);
    		},
    		m: function mount(target, anchor) {
    			mount_component(changelog, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, br, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const changelog_changes = {};
    			if (dirty & /*changelogs*/ 1) changelog_changes.changelog = /*changelog*/ ctx[1];
    			changelog.$set(changelog_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(changelog.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(changelog.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(changelog, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(19:0) {#each changelogs as changelog}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let main;
    	let current;
    	let each_value = /*changelogs*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			main = element("main");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", { class: true });
    			var main_nodes = children(main);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(main_nodes);
    			}

    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(main, "class", "main svelte-1gap7ud");
    			add_location(main, file$7, 17, 0, 320);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(main, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*changelogs*/ 1) {
    				each_value = /*changelogs*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(main, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Changelogs", slots, []);

    	let { changelogs = [
    		{
    			"date": "2020",
    			"title": "titre1",
    			"content": "contenu du premier changelog"
    		},
    		{
    			"date": "2020",
    			"title": "titre2",
    			"content": "contenu du 2eme changelog"
    		}
    	] } = $$props;

    	const writable_props = ["changelogs"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Changelogs> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("changelogs" in $$props) $$invalidate(0, changelogs = $$props.changelogs);
    	};

    	$$self.$capture_state = () => ({ Changelog, changelogs });

    	$$self.$inject_state = $$props => {
    		if ("changelogs" in $$props) $$invalidate(0, changelogs = $$props.changelogs);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [changelogs];
    }

    class Changelogs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { changelogs: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Changelogs",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get changelogs() {
    		throw new Error("<Changelogs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set changelogs(value) {
    		throw new Error("<Changelogs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/ChangelogRoute.svelte generated by Svelte v3.30.0 */
    const file$8 = "src/routes/ChangelogRoute.svelte";

    function create_fragment$b(ctx) {
    	let main;
    	let h1;
    	let t0;
    	let t1;
    	let changelogs_1;
    	let t2;
    	let p;
    	let a;
    	let t3;
    	let current;

    	changelogs_1 = new Changelogs({
    			props: { changelogs: /*changelogs*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			t0 = text("Changelog of the Advent Calendar");
    			t1 = space();
    			create_component(changelogs_1.$$.fragment);
    			t2 = space();
    			p = element("p");
    			a = element("a");
    			t3 = text("Back to Calendar Pages");
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", {});
    			var main_nodes = children(main);
    			h1 = claim_element(main_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t0 = claim_text(h1_nodes, "Changelog of the Advent Calendar");
    			h1_nodes.forEach(detach_dev);
    			t1 = claim_space(main_nodes);
    			claim_component(changelogs_1.$$.fragment, main_nodes);
    			t2 = claim_space(main_nodes);
    			p = claim_element(main_nodes, "P", {});
    			var p_nodes = children(p);
    			a = claim_element(p_nodes, "A", { href: true, class: true });
    			var a_nodes = children(a);
    			t3 = claim_text(a_nodes, "Back to Calendar Pages");
    			a_nodes.forEach(detach_dev);
    			p_nodes.forEach(detach_dev);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h1, "class", "svelte-1ade283");
    			add_location(h1, file$8, 8, 4, 126);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "svelte-1ade283");
    			add_location(a, file$8, 13, 7, 221);
    			add_location(p, file$8, 13, 4, 218);
    			add_location(main, file$8, 7, 0, 115);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(h1, t0);
    			append_dev(main, t1);
    			mount_component(changelogs_1, main, null);
    			append_dev(main, t2);
    			append_dev(main, p);
    			append_dev(p, a);
    			append_dev(a, t3);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const changelogs_1_changes = {};
    			if (dirty & /*changelogs*/ 1) changelogs_1_changes.changelogs = /*changelogs*/ ctx[0];
    			changelogs_1.$set(changelogs_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(changelogs_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(changelogs_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(changelogs_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ChangelogRoute", slots, []);
    	let { changelogs } = $$props;
    	const writable_props = ["changelogs"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ChangelogRoute> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("changelogs" in $$props) $$invalidate(0, changelogs = $$props.changelogs);
    	};

    	$$self.$capture_state = () => ({ Changelogs, changelogs });

    	$$self.$inject_state = $$props => {
    		if ("changelogs" in $$props) $$invalidate(0, changelogs = $$props.changelogs);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [changelogs];
    }

    class ChangelogRoute extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { changelogs: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ChangelogRoute",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*changelogs*/ ctx[0] === undefined && !("changelogs" in props)) {
    			console.warn("<ChangelogRoute> was created without expected prop 'changelogs'");
    		}
    	}

    	get changelogs() {
    		throw new Error("<ChangelogRoute>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set changelogs(value) {
    		throw new Error("<ChangelogRoute>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var changes=[{date:"2020-11-29",title:"Initial Commit :D",content:["initial MVP done with svelte"]},{date:"2020-11-30",title:"content from com",content:["photo for only 1 and 2 december"]},{date:"2020-12-01",title:"more content",content:["content for day 3 and 4"]},{date:"2020-12-02",title:"safari bug correction => chrome is magic",content:["correction of image display in safari"]},{date:"2020-12-03",title:"Ugly Christmas Sweater theme!",content:["awesome rework of the display - thanks Cecile Freyd-Foucault !"]},{date:"2020-12-04",title:"more content",content:["adding content for 5 and 6 december"]},{date:"2020-12-06",title:"Saint Nicolas Special :P",content:["reduce snow flakes size","adding router in svelte","introducing this changelog page"]},{date:"2020-12-13",title:"Firework day!",content:["Can't open door if previous one is not open","When opening a new door, a big door opens, but not if door was previously opened","Firework when user opens a big door !","adding content for 14 to 18"]}];var changelog = {changes:changes};

    var changelogs = /*#__PURE__*/Object.freeze({
        __proto__: null,
        changes: changes,
        'default': changelog
    });

    var days={"0":{imagePath:"/build/images/1.png",rewardText:"",rewardLink:"https://forms.office.com/Pages/ResponsePage.aspx?id=UoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UMDNWVldUV1JXTFY5TElNMERZNTBBMDFRMS4u"},"1":{imagePath:"/build/images/2.jpg",rewardText:"",rewardLink:"https://forms.office.com/Pages/ResponsePage.aspx?id=UoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UQldYUVA2RkdISVVMQTNTVkdBVUNPWkJJUy4u"},"2":{imagePath:"/build/images/3.jpg",rewardText:"",rewardLink:"https://forms.office.com/Pages/ResponsePage.aspx?id=UoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UMkZERjAyVDZRNTZKVDdHSUFVOTJSOFYzRi4u"},"3":{imagePath:"/build/images/4.png",rewardText:"",rewardLink:"https://forms.office.com/Pages/ResponsePage.aspx?id=UoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UMFJJVzFQT1lJSkhNSTBRRTg0R1BUVlZZQy4u"},"4":{imagePath:"/build/images/5.png",rewardText:"",rewardLink:""},"5":{imagePath:"/build/images/6.png",rewardText:"",rewardLink:""},"6":{imagePath:"/build/images/7.png",rewardText:"",rewardLink:"https://eur02.safelinks.protection.outlook.com/?url=https%3A%2F%2Fforms.office.com%2FPages%2FResponsePage.aspx%3Fid%3DUoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UQkMxOEU1TVpXTzVEUlpPWDZLWlhJMElRSi4u&data=04%7C01%7Cnicolas.savois%40talan.com%7C37852f36ccef4bbb257608d89a89d739%7C6f07f79b03b144e1b2217fa1001b22ac%7C0%7C0%7C637429264096185537%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C1000&sdata=dcAnZvHnVsefXuZHt7hmj0qse4oJyLAv1LDaxJ7CpQc%3D&reserved=0"},"7":{imagePath:"/build/images/8.png",rewardText:"",rewardLink:"https://eur02.safelinks.protection.outlook.com/?url=https%3A%2F%2Fforms.office.com%2FPages%2FResponsePage.aspx%3Fid%3DUoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UMEhHUUw5S1BPMVpVSzZZTDBSMFRRTUMwSy4u&data=04%7C01%7Cnicolas.savois%40talan.com%7C37852f36ccef4bbb257608d89a89d739%7C6f07f79b03b144e1b2217fa1001b22ac%7C0%7C0%7C637429264096195491%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C1000&sdata=0HcMh1u23ZWQKWixS%2BvUNS61AFYBNQe4HCyNjRmjMk8%3D&reserved=0"},"8":{imagePath:"/build/images/9.png",rewardText:"",rewardLink:"https://eur02.safelinks.protection.outlook.com/?url=https%3A%2F%2Fforms.office.com%2FPages%2FResponsePage.aspx%3Fid%3DUoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UQ0FVMTU4RFI5NlFMR1lXWDhLQUZNVVIySC4u&data=04%7C01%7Cnicolas.savois%40talan.com%7C37852f36ccef4bbb257608d89a89d739%7C6f07f79b03b144e1b2217fa1001b22ac%7C0%7C0%7C637429264096195491%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C1000&sdata=vcvTJyfdorp1mJvDlyNrqH7%2B8N%2B5qxwsudmVLgCcdag%3D&reserved=0"},"9":{imagePath:"/build/images/10.png",rewardText:"",rewardLink:"https://eur02.safelinks.protection.outlook.com/?url=https%3A%2F%2Fforms.office.com%2FPages%2FResponsePage.aspx%3Fid%3DUoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UNkw1NlBRNThFQzZCUFEyNEI5R0U3T05IUS4u&data=04%7C01%7Cnicolas.savois%40talan.com%7C37852f36ccef4bbb257608d89a89d739%7C6f07f79b03b144e1b2217fa1001b22ac%7C0%7C0%7C637429264096205451%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C1000&sdata=zXNW5ctC8OZAlfoRqbjaSVcozyG4rHJRMwcrGwfxVFQ%3D&reserved=0"},"10":{imagePath:"/build/images/11.png",rewardText:"",rewardLink:"https://eur02.safelinks.protection.outlook.com/?url=https%3A%2F%2Fforms.office.com%2FPages%2FResponsePage.aspx%3Fid%3DUoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UNUJPTjJKMVIyQk9TSkw3QUFaV0hWS1BVVy4u&data=04%7C01%7Cnicolas.savois%40talan.com%7C37852f36ccef4bbb257608d89a89d739%7C6f07f79b03b144e1b2217fa1001b22ac%7C0%7C0%7C637429264096205451%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C1000&sdata=vW9%2B%2B5D6hwwYVOPtihxoVZ5%2BUSghWbPRIlHsnNV9%2BsY%3D&reserved=0"},"11":{imagePath:"/build/images/12.png",rewardText:"",rewardLink:""},"12":{imagePath:"/build/images/13.png",rewardText:"",rewardLink:""},"13":{imagePath:"/build/images/14.png",rewardText:"",rewardLink:"https://forms.office.com/Pages/ResponsePage.aspx?id=UoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UMFNTRE9JUFdIMklSVjlSNUxENjZHOVQ3UC4u"},"14":{imagePath:"/build/images/15.png",rewardText:"",rewardLink:"https://forms.office.com/Pages/ResponsePage.aspx?id=UoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UNUcxQU9EV1hLWUxWNkJERU8xTDRXNlpHQy4u"},"15":{imagePath:"/build/images/16.png",rewardText:"",rewardLink:"https://forms.office.com/Pages/ResponsePage.aspx?id=UoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UMkw4QlM4UFFLMDk3RlQyQkJYMktYWkVZRS4u"},"16":{imagePath:"/build/images/17.png",rewardText:"",rewardLink:"https://forms.office.com/Pages/ResponsePage.aspx?id=UoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UN1VCOFQ2V1k4UjUwNUg2VTVDV0E4M1ZBTi4u"},"17":{imagePath:"/build/images/18.png",rewardText:"",rewardLink:"https://forms.office.com/Pages/ResponsePage.aspx?id=UoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UOU1DN1VYSk00MlZXUzFNWDA2VjQ3V1o3RS4u"},"18":{imagePath:"/build/images/19.png",rewardText:"",rewardLink:""},"19":{imagePath:"/build/images/20.png",rewardText:"",rewardLink:""},"20":{imagePath:"/build/images/21.png",rewardText:"",rewardLink:"https://forms.office.com/Pages/ResponsePage.aspx?id=UoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5URFVBUjlVWUtPRDlCNjRLNzUwT1YyNVZXMi4u"},"21":{imagePath:"/build/images/22.png",rewardText:"",rewardLink:"https://forms.office.com/Pages/ResponsePage.aspx?id=UoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UOE82S1BXVllUODVOOVdXM0cyVE1CSDdYRC4u"},"22":{imagePath:"/build/images/23.png",rewardText:"",rewardLink:"https://forms.office.com/Pages/ResponsePage.aspx?id=UoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UOE82S1BXVllUODVOOVdXM0cyVE1CSDdYRC4u"},"23":{imagePath:"/build/images/24.png",rewardText:"",rewardLink:"https://forms.office.com/Pages/ResponsePage.aspx?id=UoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UNDBaT09SMVpHVjBQUUlDWDdDVks3UEFDUS4u"}};var calendarTalanData = {days:days};

    var calendarData = /*#__PURE__*/Object.freeze({
        __proto__: null,
        days: days,
        'default': calendarTalanData
    });

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src/components/Modal.svelte generated by Svelte v3.30.0 */

    const { Object: Object_1 } = globals;
    const file$9 = "src/components/Modal.svelte";

    // (243:0) {#if Component}
    function create_if_block$3(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let t;
    	let div0;
    	let switch_instance;
    	let div1_transition;
    	let div3_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*state*/ ctx[0].closeButton && create_if_block_1$2(ctx);
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*Component*/ ctx[1];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			div0 = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div3 = claim_element(nodes, "DIV", { class: true, style: true });
    			var div3_nodes = children(div3);
    			div2 = claim_element(div3_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);

    			div1 = claim_element(div2_nodes, "DIV", {
    				class: true,
    				role: true,
    				"aria-modal": true,
    				style: true
    			});

    			var div1_nodes = children(div1);
    			if (if_block) if_block.l(div1_nodes);
    			t = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true, style: true });
    			var div0_nodes = children(div0);
    			if (switch_instance) claim_component(switch_instance.$$.fragment, div0_nodes);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", "content svelte-1cpg7yp");
    			attr_dev(div0, "style", /*cssContent*/ ctx[12]);
    			add_location(div0, file$9, 270, 8, 6517);
    			attr_dev(div1, "class", "window svelte-1cpg7yp");
    			attr_dev(div1, "role", "dialog");
    			attr_dev(div1, "aria-modal", "true");
    			attr_dev(div1, "style", /*cssWindow*/ ctx[11]);
    			add_location(div1, file$9, 251, 6, 5912);
    			attr_dev(div2, "class", "window-wrap svelte-1cpg7yp");
    			add_location(div2, file$9, 250, 4, 5863);
    			attr_dev(div3, "class", "bg svelte-1cpg7yp");
    			attr_dev(div3, "style", /*cssBg*/ ctx[10]);
    			add_location(div3, file$9, 243, 2, 5697);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			if (switch_instance) {
    				mount_component(switch_instance, div0, null);
    			}

    			/*div1_binding*/ ctx[35](div1);
    			/*div2_binding*/ ctx[36](div2);
    			/*div3_binding*/ ctx[37](div3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						div1,
    						"introstart",
    						function () {
    							if (is_function(/*onOpen*/ ctx[6])) /*onOpen*/ ctx[6].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div1,
    						"outrostart",
    						function () {
    							if (is_function(/*onClose*/ ctx[7])) /*onClose*/ ctx[7].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div1,
    						"introend",
    						function () {
    							if (is_function(/*onOpened*/ ctx[8])) /*onOpened*/ ctx[8].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div1,
    						"outroend",
    						function () {
    							if (is_function(/*onClosed*/ ctx[9])) /*onClosed*/ ctx[9].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(div3, "click", /*handleOuterClick*/ ctx[19], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*state*/ ctx[0].closeButton) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*state*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const switch_instance_changes = (dirty[0] & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*Component*/ ctx[1])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div0, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			if (!current || dirty[0] & /*cssContent*/ 4096) {
    				attr_dev(div0, "style", /*cssContent*/ ctx[12]);
    			}

    			if (!current || dirty[0] & /*cssWindow*/ 2048) {
    				attr_dev(div1, "style", /*cssWindow*/ ctx[11]);
    			}

    			if (!current || dirty[0] & /*cssBg*/ 1024) {
    				attr_dev(div3, "style", /*cssBg*/ ctx[10]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*currentTransitionWindow*/ ctx[15], /*state*/ ctx[0].transitionWindowProps, true);
    				div1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, /*currentTransitionBg*/ ctx[14], /*state*/ ctx[0].transitionBgProps, true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*currentTransitionWindow*/ ctx[15], /*state*/ ctx[0].transitionWindowProps, false);
    			div1_transition.run(0);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, /*currentTransitionBg*/ ctx[14], /*state*/ ctx[0].transitionBgProps, false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block) if_block.d();
    			if (switch_instance) destroy_component(switch_instance);
    			/*div1_binding*/ ctx[35](null);
    			if (detaching && div1_transition) div1_transition.end();
    			/*div2_binding*/ ctx[36](null);
    			/*div3_binding*/ ctx[37](null);
    			if (detaching && div3_transition) div3_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(243:0) {#if Component}",
    		ctx
    	});

    	return block;
    }

    // (264:8) {#if state.closeButton}
    function create_if_block_1$2(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty[0] & /*state*/ 1) show_if = !!/*isSvelteComponent*/ ctx[16](/*state*/ ctx[0].closeButton);
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx, [-1]);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(264:8) {#if state.closeButton}",
    		ctx
    	});

    	return block;
    }

    // (267:5) {:else}
    function create_else_block$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			this.h();
    		},
    		l: function claim(nodes) {
    			button = claim_element(nodes, "BUTTON", { class: true, style: true });
    			children(button).forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(button, "class", "close svelte-1cpg7yp");
    			attr_dev(button, "style", /*cssCloseButton*/ ctx[13]);
    			add_location(button, file$9, 267, 6, 6419);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*close*/ ctx[17], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cssCloseButton*/ 8192) {
    				attr_dev(button, "style", /*cssCloseButton*/ ctx[13]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(267:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (265:5) {#if isSvelteComponent(state.closeButton)}
    function create_if_block_2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*state*/ ctx[0].closeButton;

    	function switch_props(ctx) {
    		return {
    			props: { onClose: /*close*/ ctx[17] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (switch_instance) claim_component(switch_instance.$$.fragment, nodes);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*state*/ ctx[0].closeButton)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(265:5) {#if isSvelteComponent(state.closeButton)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*Component*/ ctx[1] && create_if_block$3(ctx);
    	const default_slot_template = /*#slots*/ ctx[34].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[33], null);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			if (if_block) if_block.l(nodes);
    			t = claim_space(nodes);
    			if (default_slot) default_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*handleKeydown*/ ctx[18], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*Component*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*Component*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty[1] & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[33], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Modal", slots, ['default']);
    	const baseSetContext = setContext;
    	const SvelteComponent = SvelteComponentDev;
    	let { key = "simple-modal" } = $$props;
    	let { closeButton = true } = $$props;
    	let { closeOnEsc = true } = $$props;
    	let { closeOnOuterClick = true } = $$props;
    	let { styleBg = { top: 0, left: 0 } } = $$props;
    	let { styleWindow = {} } = $$props;
    	let { styleContent = {} } = $$props;
    	let { styleCloseButton = {} } = $$props;
    	let { setContext: setContext$1 = baseSetContext } = $$props;
    	let { transitionBg = fade } = $$props;
    	let { transitionBgProps = { duration: 250 } } = $$props;
    	let { transitionWindow = transitionBg } = $$props;
    	let { transitionWindowProps = transitionBgProps } = $$props;

    	const defaultState = {
    		closeButton,
    		closeOnEsc,
    		closeOnOuterClick,
    		styleBg,
    		styleWindow,
    		styleContent,
    		styleCloseButton,
    		transitionBg,
    		transitionBgProps,
    		transitionWindow,
    		transitionWindowProps
    	};

    	let state = { ...defaultState };
    	let Component = null;
    	let props = null;
    	let background;
    	let wrap;
    	let modalWindow;
    	const camelCaseToDash = str => str.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase();
    	const toCssString = props => Object.keys(props).reduce((str, key) => `${str}; ${camelCaseToDash(key)}: ${props[key]}`, "");
    	const isSvelteComponent = component => SvelteComponent && SvelteComponent.isPrototypeOf(component);

    	const toVoid = () => {
    		
    	};

    	let onOpen = toVoid;
    	let onClose = toVoid;
    	let onOpened = toVoid;
    	let onClosed = toVoid;

    	const open = (NewComponent, newProps = {}, options = {}, callback = {}) => {
    		$$invalidate(1, Component = NewComponent);
    		$$invalidate(2, props = newProps);
    		$$invalidate(0, state = { ...defaultState, ...options });
    		$$invalidate(6, onOpen = callback.onOpen || toVoid);
    		$$invalidate(7, onClose = callback.onClose || toVoid);
    		$$invalidate(8, onOpened = callback.onOpened || toVoid);
    		$$invalidate(9, onClosed = callback.onClosed || toVoid);
    	};

    	const close = (callback = {}) => {
    		$$invalidate(7, onClose = callback.onClose || onClose);
    		$$invalidate(9, onClosed = callback.onClosed || onClosed);
    		$$invalidate(1, Component = null);
    		$$invalidate(2, props = null);
    	};

    	const handleKeydown = event => {
    		if (state.closeOnEsc && Component && event.key === "Escape") {
    			event.preventDefault();
    			close();
    		}

    		if (Component && event.key === "Tab") {
    			// trap focus
    			const nodes = modalWindow.querySelectorAll("*");

    			const tabbable = Array.from(nodes).filter(node => node.tabIndex >= 0);
    			let index = tabbable.indexOf(document.activeElement);
    			if (index === -1 && event.shiftKey) index = 0;
    			index += tabbable.length + (event.shiftKey ? -1 : 1);
    			index %= tabbable.length;
    			tabbable[index].focus();
    			event.preventDefault();
    		}
    	};

    	const handleOuterClick = event => {
    		if (state.closeOnOuterClick && (event.target === background || event.target === wrap)) {
    			event.preventDefault();
    			close();
    		}
    	};

    	setContext$1(key, { open, close });

    	const writable_props = [
    		"key",
    		"closeButton",
    		"closeOnEsc",
    		"closeOnOuterClick",
    		"styleBg",
    		"styleWindow",
    		"styleContent",
    		"styleCloseButton",
    		"setContext",
    		"transitionBg",
    		"transitionBgProps",
    		"transitionWindow",
    		"transitionWindowProps"
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			modalWindow = $$value;
    			$$invalidate(5, modalWindow);
    		});
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			wrap = $$value;
    			$$invalidate(4, wrap);
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			background = $$value;
    			$$invalidate(3, background);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(20, key = $$props.key);
    		if ("closeButton" in $$props) $$invalidate(21, closeButton = $$props.closeButton);
    		if ("closeOnEsc" in $$props) $$invalidate(22, closeOnEsc = $$props.closeOnEsc);
    		if ("closeOnOuterClick" in $$props) $$invalidate(23, closeOnOuterClick = $$props.closeOnOuterClick);
    		if ("styleBg" in $$props) $$invalidate(24, styleBg = $$props.styleBg);
    		if ("styleWindow" in $$props) $$invalidate(25, styleWindow = $$props.styleWindow);
    		if ("styleContent" in $$props) $$invalidate(26, styleContent = $$props.styleContent);
    		if ("styleCloseButton" in $$props) $$invalidate(27, styleCloseButton = $$props.styleCloseButton);
    		if ("setContext" in $$props) $$invalidate(28, setContext$1 = $$props.setContext);
    		if ("transitionBg" in $$props) $$invalidate(29, transitionBg = $$props.transitionBg);
    		if ("transitionBgProps" in $$props) $$invalidate(30, transitionBgProps = $$props.transitionBgProps);
    		if ("transitionWindow" in $$props) $$invalidate(31, transitionWindow = $$props.transitionWindow);
    		if ("transitionWindowProps" in $$props) $$invalidate(32, transitionWindowProps = $$props.transitionWindowProps);
    		if ("$$scope" in $$props) $$invalidate(33, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		svelte,
    		fade,
    		baseSetContext,
    		SvelteComponent,
    		key,
    		closeButton,
    		closeOnEsc,
    		closeOnOuterClick,
    		styleBg,
    		styleWindow,
    		styleContent,
    		styleCloseButton,
    		setContext: setContext$1,
    		transitionBg,
    		transitionBgProps,
    		transitionWindow,
    		transitionWindowProps,
    		defaultState,
    		state,
    		Component,
    		props,
    		background,
    		wrap,
    		modalWindow,
    		camelCaseToDash,
    		toCssString,
    		isSvelteComponent,
    		toVoid,
    		onOpen,
    		onClose,
    		onOpened,
    		onClosed,
    		open,
    		close,
    		handleKeydown,
    		handleOuterClick,
    		cssBg,
    		cssWindow,
    		cssContent,
    		cssCloseButton,
    		currentTransitionBg,
    		currentTransitionWindow
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(20, key = $$props.key);
    		if ("closeButton" in $$props) $$invalidate(21, closeButton = $$props.closeButton);
    		if ("closeOnEsc" in $$props) $$invalidate(22, closeOnEsc = $$props.closeOnEsc);
    		if ("closeOnOuterClick" in $$props) $$invalidate(23, closeOnOuterClick = $$props.closeOnOuterClick);
    		if ("styleBg" in $$props) $$invalidate(24, styleBg = $$props.styleBg);
    		if ("styleWindow" in $$props) $$invalidate(25, styleWindow = $$props.styleWindow);
    		if ("styleContent" in $$props) $$invalidate(26, styleContent = $$props.styleContent);
    		if ("styleCloseButton" in $$props) $$invalidate(27, styleCloseButton = $$props.styleCloseButton);
    		if ("setContext" in $$props) $$invalidate(28, setContext$1 = $$props.setContext);
    		if ("transitionBg" in $$props) $$invalidate(29, transitionBg = $$props.transitionBg);
    		if ("transitionBgProps" in $$props) $$invalidate(30, transitionBgProps = $$props.transitionBgProps);
    		if ("transitionWindow" in $$props) $$invalidate(31, transitionWindow = $$props.transitionWindow);
    		if ("transitionWindowProps" in $$props) $$invalidate(32, transitionWindowProps = $$props.transitionWindowProps);
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    		if ("Component" in $$props) $$invalidate(1, Component = $$props.Component);
    		if ("props" in $$props) $$invalidate(2, props = $$props.props);
    		if ("background" in $$props) $$invalidate(3, background = $$props.background);
    		if ("wrap" in $$props) $$invalidate(4, wrap = $$props.wrap);
    		if ("modalWindow" in $$props) $$invalidate(5, modalWindow = $$props.modalWindow);
    		if ("onOpen" in $$props) $$invalidate(6, onOpen = $$props.onOpen);
    		if ("onClose" in $$props) $$invalidate(7, onClose = $$props.onClose);
    		if ("onOpened" in $$props) $$invalidate(8, onOpened = $$props.onOpened);
    		if ("onClosed" in $$props) $$invalidate(9, onClosed = $$props.onClosed);
    		if ("cssBg" in $$props) $$invalidate(10, cssBg = $$props.cssBg);
    		if ("cssWindow" in $$props) $$invalidate(11, cssWindow = $$props.cssWindow);
    		if ("cssContent" in $$props) $$invalidate(12, cssContent = $$props.cssContent);
    		if ("cssCloseButton" in $$props) $$invalidate(13, cssCloseButton = $$props.cssCloseButton);
    		if ("currentTransitionBg" in $$props) $$invalidate(14, currentTransitionBg = $$props.currentTransitionBg);
    		if ("currentTransitionWindow" in $$props) $$invalidate(15, currentTransitionWindow = $$props.currentTransitionWindow);
    	};

    	let cssBg;
    	let cssWindow;
    	let cssContent;
    	let cssCloseButton;
    	let currentTransitionBg;
    	let currentTransitionWindow;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*state*/ 1) {
    			 $$invalidate(10, cssBg = toCssString(state.styleBg));
    		}

    		if ($$self.$$.dirty[0] & /*state*/ 1) {
    			 $$invalidate(11, cssWindow = toCssString(state.styleWindow));
    		}

    		if ($$self.$$.dirty[0] & /*state*/ 1) {
    			 $$invalidate(12, cssContent = toCssString(state.styleContent));
    		}

    		if ($$self.$$.dirty[0] & /*state*/ 1) {
    			 $$invalidate(13, cssCloseButton = toCssString(state.styleCloseButton));
    		}

    		if ($$self.$$.dirty[0] & /*state*/ 1) {
    			 $$invalidate(14, currentTransitionBg = state.transitionBg);
    		}

    		if ($$self.$$.dirty[0] & /*state*/ 1) {
    			 $$invalidate(15, currentTransitionWindow = state.transitionWindow);
    		}
    	};

    	return [
    		state,
    		Component,
    		props,
    		background,
    		wrap,
    		modalWindow,
    		onOpen,
    		onClose,
    		onOpened,
    		onClosed,
    		cssBg,
    		cssWindow,
    		cssContent,
    		cssCloseButton,
    		currentTransitionBg,
    		currentTransitionWindow,
    		isSvelteComponent,
    		close,
    		handleKeydown,
    		handleOuterClick,
    		key,
    		closeButton,
    		closeOnEsc,
    		closeOnOuterClick,
    		styleBg,
    		styleWindow,
    		styleContent,
    		styleCloseButton,
    		setContext$1,
    		transitionBg,
    		transitionBgProps,
    		transitionWindow,
    		transitionWindowProps,
    		$$scope,
    		slots,
    		div1_binding,
    		div2_binding,
    		div3_binding
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$c,
    			create_fragment$c,
    			safe_not_equal,
    			{
    				key: 20,
    				closeButton: 21,
    				closeOnEsc: 22,
    				closeOnOuterClick: 23,
    				styleBg: 24,
    				styleWindow: 25,
    				styleContent: 26,
    				styleCloseButton: 27,
    				setContext: 28,
    				transitionBg: 29,
    				transitionBgProps: 30,
    				transitionWindow: 31,
    				transitionWindowProps: 32
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get key() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeButton() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeButton(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnEsc() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnEsc(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnOuterClick() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnOuterClick(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleBg() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleBg(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleWindow() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleWindow(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleContent() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleContent(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleCloseButton() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleCloseButton(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setContext() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set setContext(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionBg() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionBg(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionBgProps() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionBgProps(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionWindow() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionWindow(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionWindowProps() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionWindowProps(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.30.0 */

    const { console: console_1$2 } = globals;
    const file$a = "src/App.svelte";

    // (29:1) {#if !isProd}
    function create_if_block$4(ctx) {
    	let nav;
    	let link0;
    	let t0;
    	let link1;
    	let t1;
    	let link2;
    	let current;

    	link0 = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link1 = new Link({
    			props: {
    				to: "/Changelog",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link2 = new Link({
    			props: {
    				to: "/Firework",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			create_component(link0.$$.fragment);
    			t0 = space();
    			create_component(link1.$$.fragment);
    			t1 = space();
    			create_component(link2.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			nav = claim_element(nodes, "NAV", { class: true });
    			var nav_nodes = children(nav);
    			claim_component(link0.$$.fragment, nav_nodes);
    			t0 = claim_space(nav_nodes);
    			claim_component(link1.$$.fragment, nav_nodes);
    			t1 = claim_space(nav_nodes);
    			claim_component(link2.$$.fragment, nav_nodes);
    			nav_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(nav, "class", "svelte-1tun0fy");
    			add_location(nav, file$a, 29, 1, 816);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			mount_component(link0, nav, null);
    			append_dev(nav, t0);
    			mount_component(link1, nav, null);
    			append_dev(nav, t1);
    			mount_component(link2, nav, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(link2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_component(link0);
    			destroy_component(link1);
    			destroy_component(link2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(29:1) {#if !isProd}",
    		ctx
    	});

    	return block;
    }

    // (31:2) <Link to="/">
    function create_default_slot_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Home");
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, "Home");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(31:2) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (32:2) <Link to="/Changelog">
    function create_default_slot_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Changelog");
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, "Changelog");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(32:2) <Link to=\\\"/Changelog\\\">",
    		ctx
    	});

    	return block;
    }

    // (33:2) <Link to="/Firework">
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Firework");
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, "Firework");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(33:2) <Link to=\\\"/Firework\\\">",
    		ctx
    	});

    	return block;
    }

    // (38:2) <Route path="/">
    function create_default_slot_4(ctx) {
    	let calendar;
    	let current;

    	calendar = new Calendar({
    			props: {
    				name: /*name*/ ctx[0],
    				calendarDate: days
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(calendar.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(calendar.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(calendar, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const calendar_changes = {};
    			if (dirty & /*name*/ 1) calendar_changes.name = /*name*/ ctx[0];
    			calendar.$set(calendar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(calendar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(calendar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(calendar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(38:2) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (39:2) <Route path="/Changelog" >
    function create_default_slot_3(ctx) {
    	let changelogroute;
    	let current;

    	changelogroute = new ChangelogRoute({
    			props: { changelogs: changes },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(changelogroute.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(changelogroute.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(changelogroute, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(changelogroute.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(changelogroute.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(changelogroute, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(39:2) <Route path=\\\"/Changelog\\\" >",
    		ctx
    	});

    	return block;
    }

    // (40:2) <Route path="/Firework" >
    function create_default_slot_2(ctx) {
    	let fireworks;
    	let current;
    	fireworks = new FireWorks({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(fireworks.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(fireworks.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(fireworks, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fireworks.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fireworks.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(fireworks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(40:2) <Route path=\\\"/Firework\\\" >",
    		ctx
    	});

    	return block;
    }

    // (28:0) <Router url="{url}">
    function create_default_slot_1(ctx) {
    	let t0;
    	let div;
    	let route0;
    	let t1;
    	let route1;
    	let t2;
    	let route2;
    	let current;
    	let if_block = !/*isProd*/ ctx[2] && create_if_block$4(ctx);

    	route0 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "/Changelog",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route2 = new Route({
    			props: {
    				path: "/Firework",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			div = element("div");
    			create_component(route0.$$.fragment);
    			t1 = space();
    			create_component(route1.$$.fragment);
    			t2 = space();
    			create_component(route2.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			if (if_block) if_block.l(nodes);
    			t0 = claim_space(nodes);
    			div = claim_element(nodes, "DIV", {});
    			var div_nodes = children(div);
    			claim_component(route0.$$.fragment, div_nodes);
    			t1 = claim_space(div_nodes);
    			claim_component(route1.$$.fragment, div_nodes);
    			t2 = claim_space(div_nodes);
    			claim_component(route2.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(div, file$a, 36, 1, 946);
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(route0, div, null);
    			append_dev(div, t1);
    			mount_component(route1, div, null);
    			append_dev(div, t2);
    			mount_component(route2, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route0_changes = {};

    			if (dirty & /*$$scope, name*/ 9) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    			const route1_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    			const route2_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				route2_changes.$$scope = { dirty, ctx };
    			}

    			route2.$set(route2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			destroy_component(route0);
    			destroy_component(route1);
    			destroy_component(route2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(28:0) <Router url=\\\"{url}\\\">",
    		ctx
    	});

    	return block;
    }

    // (27:0) <Modal>
    function create_default_slot$1(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				url: /*url*/ ctx[1],
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(router.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const router_changes = {};
    			if (dirty & /*url*/ 2) router_changes.url = /*url*/ ctx[1];

    			if (dirty & /*$$scope, name*/ 9) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(27:0) <Modal>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div;
    	let t;
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			create_component(modal.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { id: true });
    			children(div).forEach(detach_dev);
    			t = claim_space(nodes);
    			claim_component(modal.$$.fragment, nodes);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "id", "particles-js");
    			add_location(div, file$a, 25, 0, 740);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal_changes = {};

    			if (dirty & /*$$scope, url, name*/ 11) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t);
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { name = "" } = $$props;
    	let { url = "" } = $$props;
    	console.log({"env":{"isProd":false,"API_URL":"http://localhost:8080"}}.env.isProd);
    	console.log({"env":{"isProd":false,"API_URL":"http://localhost:8080"}}.env);
    	let isProd = {"env":{"isProd":false,"API_URL":"http://localhost:8080"}}.env.isProd;
    	const writable_props = ["name", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("url" in $$props) $$invalidate(1, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		Router,
    		Link,
    		Route,
    		NavLink,
    		Calendar,
    		component_subscribe,
    		ChangelogRoute,
    		FireWorks,
    		changelogs,
    		calendarData,
    		Modal,
    		name,
    		url,
    		isProd
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("url" in $$props) $$invalidate(1, url = $$props.url);
    		if ("isProd" in $$props) $$invalidate(2, isProd = $$props.isProd);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, url, isProd];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { name: 0, url: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    if (localStorage.getItem("door") === null) {
    	localStorage.setItem("door", 0);
    }

    const app = new App({
    	target: document.body,
    	hydrate: true,
    	props: {
    		name: 'Advent Calendar'
    	},
    });


    particlesJS("particles-js", 
    	{
    		"particles":{
    			"number":{
    				"value":400,
    				"density":{
    					"enable":true,
    					"value_area":800
    				}
    			},
    			"color":{
    				"value":"#fff"
    			},
    			"shape":{
    				"type":"circle",
    				"stroke":{
    					"width":0,
    					"color":"#000000"
    				},
    				"polygon":{
    					"nb_sides":5
    				},
    				"image":{
    					"src":"img/github.svg",
    					"width":100,
    					"height":100
    				}
    			},
    			"opacity":{
    				"value":0.5,
    				"random":true,
    				"anim":{
    					"enable":false,
    					"speed":1,
    					"opacity_min":0.1,
    					"sync":false
    				}
    			},
    			"size":{
    				"value": 6,
    				"random":true,
    				"anim":{
    					"enable":false,
    					"speed":40,
    					"size_min":0.1,
    					"sync":false
    				}
    			},
    			"line_linked":{
    				"enable":false,
    				"distance":500,
    				"color":"#ffffff",
    				"opacity":0.4,
    				"width":2
    			},
    			"move":{
    				"enable":true,
    				"speed":6,
    				"direction":"bottom",
    				"random":false,
    				"straight":false,
    				"out_mode":"out",
    				"bounce":false,
    				"attract":{
    					"enable":false,
    					"rotateX":600,
    					"rotateY":1200
    				}
    			}
    		},
    		"interactivity":{
    			"detect_on":"canvas",
    			"events":{
    				"onhover":{
    					"enable":true,
    					"mode":"bubble"
    				},
    				"onclick":{
    					"enable":true,
    					"mode":"repulse"
    				},
    				"resize":true
    			},
    			"modes":{
    				"grab":{
    					"distance":400,
    					"line_linked":{
    						"opacity":0.5
    					}
    				},
    				"bubble":{
    					"distance":400,
    					"size":4,
    					"duration":0.3,
    					"opacity":1,
    					"speed":3
    				},
    				"repulse":{
    					"distance":200,
    					"duration":0.4
    				},
    				"push":{
    					"particles_nb":4
    				},
    				"remove":{
    					"particles_nb":2
    				}
    			}
    		},
    		"retina_detect":true
    	}
    	
    ); 
    	
    var update$2; 
    update$2 = function () { 
    	requestAnimationFrame(update$2); 
    };
    requestAnimationFrame(update$2);

    return app;

}());
//# sourceMappingURL=bundle.js.map

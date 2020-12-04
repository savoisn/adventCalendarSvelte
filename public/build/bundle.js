
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
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
    function children(element) {
        return Array.from(element.childNodes);
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

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
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

    const subscriber_queue = [];
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

    /* src/Door.svelte generated by Svelte v3.30.0 */

    const { console: console_1 } = globals;
    const file = "src/Door.svelte";

    // (47:4) {:else}
    function create_else_block(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*imagePath*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*imageAlt*/ ctx[5]);
    			attr_dev(img, "class", "bgImg svelte-16e21di");
    			add_location(img, file, 47, 6, 995);
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
    		id: create_else_block.name,
    		type: "else",
    		source: "(47:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (43:4) {#if rewardLink !== ""}
    function create_if_block(ctx) {
    	let a;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			if (img.src !== (img_src_value = /*imagePath*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*imageAlt*/ ctx[5]);
    			attr_dev(img, "class", "bgImg svelte-16e21di");
    			add_location(img, file, 44, 8, 910);
    			attr_dev(a, "href", /*rewardLink*/ ctx[4]);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "svelte-16e21di");
    			add_location(a, file, 43, 6, 864);
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
    		id: create_if_block.name,
    		type: "if",
    		source: "(43:4) {#if rewardLink !== \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
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
    		if (/*rewardLink*/ ctx[4] !== "") return create_if_block;
    		return create_else_block;
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
    			attr_dev(br, "class", "svelte-16e21di");
    			add_location(br, file, 54, 49, 1284);
    			attr_dev(span, "class", "doorNumber svelte-16e21di");
    			add_location(span, file, 54, 6, 1241);
    			attr_dev(div0, "class", "door svelte-16e21di");
    			toggle_class(div0, "doorOpen", /*doorOpen*/ ctx[0]);
    			toggle_class(div0, "door-odd", /*doorId*/ ctx[2] % 2 == 0);
    			toggle_class(div0, "door-even", /*doorId*/ ctx[2] % 2 != 0);
    			add_location(div0, file, 49, 4, 1065);
    			attr_dev(div1, "class", "backDoor svelte-16e21di");
    			set_style(div1, "--imagePath", "url(\"" + /*imagePath*/ ctx[3] + "\")");
    			add_location(div1, file, 41, 2, 767);
    			attr_dev(main, "class", "svelte-16e21di");
    			toggle_class(main, "mainBorderOdd", /*doorId*/ ctx[2] % 2 == 0);
    			toggle_class(main, "mainBorderEven", /*doorId*/ ctx[2] % 2 != 0);
    			add_location(main, file, 38, 0, 684);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
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
    				toggle_class(div0, "doorOpen", /*doorOpen*/ ctx[0]);
    			}

    			if (dirty & /*doorId*/ 4) {
    				toggle_class(div0, "door-odd", /*doorId*/ ctx[2] % 2 == 0);
    			}

    			if (dirty & /*doorId*/ 4) {
    				toggle_class(div0, "door-even", /*doorId*/ ctx[2] % 2 != 0);
    			}

    			if (dirty & /*imagePath*/ 8) {
    				set_style(div1, "--imagePath", "url(\"" + /*imagePath*/ ctx[3] + "\")");
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
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Door", slots, []);
    	let { doorNumber = 12 } = $$props;
    	let { doorId = 1 } = $$props;
    	let { canOpen = true } = $$props;
    	let { imagePath = "" } = $$props;
    	let { rewardText = "" } = $$props;
    	let { rewardLink = "" } = $$props;
    	let { doorOpen = false } = $$props;
    	let { imageAlt = "" } = $$props;

    	function toggleDoor() {
    		if (canOpen) {
    			$$invalidate(0, doorOpen = !doorOpen);
    			doorStore.addDoor(doorNumber);
    		} else {
    			$$invalidate(0, doorOpen = false);
    		}
    	}

    	console.log(imagePath);
    	let emojis = ["🎅", "🤶", "🧑‍🎄", "🍭", "🦌", "⛄️", "☃️", "❄️", "🌟", "🛷"];

    	function getRandomEmoji() {
    		return emojis[Math.floor(Math.random() * emojis.length)];
    	}

    	const writable_props = [
    		"doorNumber",
    		"doorId",
    		"canOpen",
    		"imagePath",
    		"rewardText",
    		"rewardLink",
    		"doorOpen",
    		"imageAlt"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Door> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("doorNumber" in $$props) $$invalidate(1, doorNumber = $$props.doorNumber);
    		if ("doorId" in $$props) $$invalidate(2, doorId = $$props.doorId);
    		if ("canOpen" in $$props) $$invalidate(8, canOpen = $$props.canOpen);
    		if ("imagePath" in $$props) $$invalidate(3, imagePath = $$props.imagePath);
    		if ("rewardText" in $$props) $$invalidate(9, rewardText = $$props.rewardText);
    		if ("rewardLink" in $$props) $$invalidate(4, rewardLink = $$props.rewardLink);
    		if ("doorOpen" in $$props) $$invalidate(0, doorOpen = $$props.doorOpen);
    		if ("imageAlt" in $$props) $$invalidate(5, imageAlt = $$props.imageAlt);
    	};

    	$$self.$capture_state = () => ({
    		doorNumber,
    		doorId,
    		canOpen,
    		imagePath,
    		rewardText,
    		rewardLink,
    		doorOpen,
    		imageAlt,
    		toggleDoor,
    		doorStore,
    		emojis,
    		getRandomEmoji
    	});

    	$$self.$inject_state = $$props => {
    		if ("doorNumber" in $$props) $$invalidate(1, doorNumber = $$props.doorNumber);
    		if ("doorId" in $$props) $$invalidate(2, doorId = $$props.doorId);
    		if ("canOpen" in $$props) $$invalidate(8, canOpen = $$props.canOpen);
    		if ("imagePath" in $$props) $$invalidate(3, imagePath = $$props.imagePath);
    		if ("rewardText" in $$props) $$invalidate(9, rewardText = $$props.rewardText);
    		if ("rewardLink" in $$props) $$invalidate(4, rewardLink = $$props.rewardLink);
    		if ("doorOpen" in $$props) $$invalidate(0, doorOpen = $$props.doorOpen);
    		if ("imageAlt" in $$props) $$invalidate(5, imageAlt = $$props.imageAlt);
    		if ("emojis" in $$props) emojis = $$props.emojis;
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
    		canOpen,
    		rewardText
    	];
    }

    class Door extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			doorNumber: 1,
    			doorId: 2,
    			canOpen: 8,
    			imagePath: 3,
    			rewardText: 9,
    			rewardLink: 4,
    			doorOpen: 0,
    			imageAlt: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Door",
    			options,
    			id: create_fragment.name
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

    	get imagePath() {
    		throw new Error("<Door>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imagePath(value) {
    		throw new Error("<Door>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rewardText() {
    		throw new Error("<Door>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rewardText(value) {
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
    }

    /* src/App.svelte generated by Svelte v3.30.0 */

    const { console: console_1$1 } = globals;
    const file$1 = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (117:2) {#each calendarDays as doorNumber}
    function create_each_block(ctx) {
    	let door;
    	let current;

    	door = new Door({
    			props: {
    				imagePath: /*doorNumber*/ ctx[13].reward.imagePath,
    				rewardText: /*doorNumber*/ ctx[13].reward.rewardText,
    				rewardLink: /*doorNumber*/ ctx[13].reward.rewardLink,
    				doorNumber: /*doorNumber*/ ctx[13].day,
    				doorOpen: /*doorNumber*/ ctx[13].day <= /*$doorStore*/ ctx[2],
    				canOpen: /*doorNumber*/ ctx[13].canOpen,
    				doorId: /*doorNumber*/ ctx[13].id
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(door.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(door, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const door_changes = {};
    			if (dirty & /*calendarDays*/ 2) door_changes.imagePath = /*doorNumber*/ ctx[13].reward.imagePath;
    			if (dirty & /*calendarDays*/ 2) door_changes.rewardText = /*doorNumber*/ ctx[13].reward.rewardText;
    			if (dirty & /*calendarDays*/ 2) door_changes.rewardLink = /*doorNumber*/ ctx[13].reward.rewardLink;
    			if (dirty & /*calendarDays*/ 2) door_changes.doorNumber = /*doorNumber*/ ctx[13].day;
    			if (dirty & /*calendarDays, $doorStore*/ 6) door_changes.doorOpen = /*doorNumber*/ ctx[13].day <= /*$doorStore*/ ctx[2];
    			if (dirty & /*calendarDays*/ 2) door_changes.canOpen = /*doorNumber*/ ctx[13].canOpen;
    			if (dirty & /*calendarDays*/ 2) door_changes.doorId = /*doorNumber*/ ctx[13].id;
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
    		source: "(117:2) {#each calendarDays as doorNumber}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div0;
    	let t0;
    	let main;
    	let h1;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let p0;
    	let t6;
    	let p1;
    	let t8;
    	let p2;
    	let t10;
    	let p3;
    	let t12;
    	let div1;
    	let t13;
    	let div2;
    	let p4;
    	let t15;
    	let p5;
    	let t17;
    	let div3;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
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
    			div0 = element("div");
    			t0 = space();
    			main = element("main");
    			h1 = element("h1");
    			t1 = text("🎄 Iterative ");
    			t2 = text(/*name*/ ctx[0]);
    			t3 = text(" By Talan! 🎄");
    			t4 = space();
    			p0 = element("p");
    			p0.textContent = "❤️ Made with love by Talan Labs ❤️";
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "Envie d'apprendre un savoir inutile et de gagner des cadeaux ?";
    			t8 = space();
    			p2 = element("p");
    			p2.textContent = "Clique sur la case du jour et réponds à la question posée.";
    			t10 = space();
    			p3 = element("p");
    			p3.textContent = "A vous de jouer !";
    			t12 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t13 = space();
    			div2 = element("div");
    			p4 = element("p");
    			p4.textContent = "A gagner : livres, cd, ballons de rugby, polos Stade Français, et plein d’autres surprises !  Avec en bonus un chèque cadeau pour celui qui répondra correctement à un maximum de questions.";
    			t15 = space();
    			p5 = element("p");
    			p5.textContent = "La réponse et les gagnants seront annoncés le lendemain sur Workplace.";
    			t17 = space();
    			div3 = element("div");
    			button = element("button");
    			button.textContent = "reset progression";
    			attr_dev(div0, "id", "particles-js");
    			add_location(div0, file$1, 102, 0, 2694);
    			attr_dev(h1, "class", "svelte-198krkm");
    			add_location(h1, file$1, 107, 1, 2770);
    			attr_dev(p0, "class", "svelte-198krkm");
    			add_location(p0, file$1, 108, 1, 2813);
    			attr_dev(p1, "class", "svelte-198krkm");
    			add_location(p1, file$1, 110, 1, 2857);
    			attr_dev(p2, "class", "svelte-198krkm");
    			add_location(p2, file$1, 111, 1, 2929);
    			attr_dev(p3, "class", "svelte-198krkm");
    			add_location(p3, file$1, 113, 1, 2997);
    			attr_dev(div1, "class", "box svelte-198krkm");
    			add_location(div1, file$1, 115, 1, 3024);
    			attr_dev(p4, "class", "svelte-198krkm");
    			add_location(p4, file$1, 129, 1, 3399);
    			attr_dev(p5, "class", "svelte-198krkm");
    			add_location(p5, file$1, 131, 1, 3598);
    			add_location(div2, file$1, 128, 1, 3392);
    			add_location(button, file$1, 133, 5, 3689);
    			add_location(div3, file$1, 133, 0, 3684);
    			attr_dev(main, "class", "svelte-198krkm");
    			add_location(main, file$1, 103, 0, 2725);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(h1, t1);
    			append_dev(h1, t2);
    			append_dev(h1, t3);
    			append_dev(main, t4);
    			append_dev(main, p0);
    			append_dev(main, t6);
    			append_dev(main, p1);
    			append_dev(main, t8);
    			append_dev(main, p2);
    			append_dev(main, t10);
    			append_dev(main, p3);
    			append_dev(main, t12);
    			append_dev(main, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(main, t13);
    			append_dev(main, div2);
    			append_dev(div2, p4);
    			append_dev(div2, t15);
    			append_dev(div2, p5);
    			append_dev(main, t17);
    			append_dev(main, div3);
    			append_dev(div3, button);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*resetProgression*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 1) set_data_dev(t2, /*name*/ ctx[0]);

    			if (dirty & /*calendarDays, $doorStore*/ 6) {
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
    						each_blocks[i].m(div1, null);
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
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
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
    	let $doorStore;
    	validate_store(doorStore, "doorStore");
    	component_subscribe($$self, doorStore, $$value => $$invalidate(2, $doorStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { name = "" } = $$props;
    	console.log({"env":{"isProd":false,"API_URL":"http://localhost:8080"}}.env);
    	let calendarDays = [];

    	//let startUpDateStr ="2020-11-25T00:00+01:00"
    	let startUpDateStr = "2020-11-30T00:00+01:00";

    	let startUpDate = Date.parse(startUpDateStr);
    	let currentDate = Date.now();
    	let nbDays = 1;
    	let door_numbers = [...Array(25).keys()];
    	let random_door_numbers = door_numbers.map(a => ({ sort: Math.random(), value: a })).sort((a, b) => a.sort - b.sort).map(a => a.value);

    	function defineNbDays() {
    		let diff = currentDate - startUpDate;
    		nbDays = Math.floor(diff / (1000 * 3600 * 24));
    	}

    	let rewards = {
    		0: {
    			imagePath: "/build/images/1.png",
    			rewardText: "",
    			rewardLink: "https://forms.office.com/Pages/ResponsePage.aspx?id=UoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UMDNWVldUV1JXTFY5TElNMERZNTBBMDFRMS4u"
    		},
    		1: {
    			imagePath: "/build/images/2.jpg",
    			rewardText: "",
    			rewardLink: "https://forms.office.com/Pages/ResponsePage.aspx?id=UoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UQldYUVA2RkdISVVMQTNTVkdBVUNPWkJJUy4u"
    		},
    		2: {
    			imagePath: "/build/images/3.jpg",
    			rewardText: "",
    			rewardLink: "https://forms.office.com/Pages/ResponsePage.aspx?id=UoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UMkZERjAyVDZRNTZKVDdHSUFVOTJSOFYzRi4u"
    		},
    		3: {
    			imagePath: "/build/images/4.png",
    			rewardText: "",
    			rewardLink: "https://forms.office.com/Pages/ResponsePage.aspx?id=UoFsLNBEEUWcmgqQTMfueMK0lpWymFpHisRfHRqKlr5UMFJJVzFQT1lJSkhNSTBRRTg0R1BUVlZZQy4u"
    		},
    		4: {
    			imagePath: "/build/images/5.png",
    			rewardText: "",
    			rewardLink: ""
    		},
    		5: {
    			imagePath: "/build/images/6.png",
    			rewardText: "",
    			rewardLink: ""
    		},
    		6: {
    			imagePath: "/build/images/christmas-tree.png",
    			rewardText: "",
    			rewardLink: ""
    		}
    	};

    	onMount(async () => {
    		// await fetch({"env":{"isProd":false,"API_URL":"http://localhost:8080"}}.env.API_URL+"/daySinceFirstDec")
    		await fetch("https://advent-calendar-api-talan.cleverapps.io/daySinceFirstDec").then(r => r.json()).then(data => {
    			if (data.daySinceFirstDec) {
    				nbDays = parseInt(data.daySinceFirstDec) + 3;
    				let id = 1; //j'ai honte je suis desole devant le reste du monde mais j'ai pas le temps... :D

    				for (let i of random_door_numbers) {
    					const day = parseInt(i) + 1;

    					calendarDays.push({
    						day,
    						canOpen: canOpen(day),
    						reward: rewards[day - 1] ? rewards[day - 1] : "",
    						id
    					});

    					id++;
    				}

    				$$invalidate(1, calendarDays);
    			}
    		});
    	});

    	function canOpen(dayToCheck) {
    		return dayToCheck - nbDays <= 0;
    	}

    	function resetProgression() {
    		doorStore.reset();
    	}

    	const writable_props = ["name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		name,
    		Door,
    		onMount,
    		doorStore,
    		calendarDays,
    		startUpDateStr,
    		startUpDate,
    		currentDate,
    		nbDays,
    		door_numbers,
    		random_door_numbers,
    		defineNbDays,
    		rewards,
    		canOpen,
    		resetProgression,
    		$doorStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("calendarDays" in $$props) $$invalidate(1, calendarDays = $$props.calendarDays);
    		if ("startUpDateStr" in $$props) startUpDateStr = $$props.startUpDateStr;
    		if ("startUpDate" in $$props) startUpDate = $$props.startUpDate;
    		if ("currentDate" in $$props) currentDate = $$props.currentDate;
    		if ("nbDays" in $$props) nbDays = $$props.nbDays;
    		if ("door_numbers" in $$props) door_numbers = $$props.door_numbers;
    		if ("random_door_numbers" in $$props) random_door_numbers = $$props.random_door_numbers;
    		if ("rewards" in $$props) rewards = $$props.rewards;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, calendarDays, $doorStore, resetProgression];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    if (localStorage.getItem("door") === null) {
    	localStorage.setItem("door", 0);
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'Advent Calendar'
    	}
    });


    particlesJS("particles-js", 
    { "particles": { "number": { "value": 400, "density": { "enable": true, "value_area": 800 } }, "color": { "value": "#fff" }, "shape": { "type": "circle","stroke":{"width":0,"color":"#000000"},"polygon":{"nb_sides":5},"image":{"src":"img/github.svg","width":100,"height":100}},"opacity":{"value":0.5,"random":true,"anim":{"enable":false,"speed":1,"opacity_min":0.1,"sync":false}},"size":{"value":10,"random":true,"anim":{"enable":false,"speed":40,"size_min":0.1,"sync":false}},"line_linked":{"enable":false,"distance":500,"color":"#ffffff","opacity":0.4,"width":2},"move":{"enable":true,"speed":6,"direction":"bottom","random":false,"straight":false,"out_mode":"out","bounce":false,"attract":{"enable":false,"rotateX":600,"rotateY":1200}}},"interactivity":{"detect_on":"canvas","events":{"onhover":{"enable":true,"mode":"bubble"},"onclick":{"enable":true,"mode":"repulse"},"resize":true},"modes":{"grab":{"distance":400,"line_linked":{"opacity":0.5}},"bubble":{"distance":400,"size":4,"duration":0.3,"opacity":1,"speed":3},"repulse":{"distance":200,"duration":0.4},"push":{"particles_nb":4},"remove":{"particles_nb":2}}},"retina_detect":true});var count_particles, stats, update$2; stats = new Stats; stats.setMode(0); stats.domElement.style.position = 'absolute'; stats.domElement.style.left = '0px'; stats.domElement.style.top = '0px'; count_particles = document.querySelector('.js-count-particles'); update$2 = function() { stats.begin(); stats.end(); if (window.pJSDom[0].pJS.particles && window.pJSDom[0].pJS.particles.array) { count_particles.innerText = window.pJSDom[0].pJS.particles.array.length; } requestAnimationFrame(update$2); }; requestAnimationFrame(update$2);

    return app;

}());
//# sourceMappingURL=bundle.js.map

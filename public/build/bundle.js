
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

    const DOORS = [
    ];

    const storedDoor = localStorage.getItem("door");
    const { subscribe: subscribe$1, set, update: update$1 } = writable(storedDoor);
    subscribe$1(value => {
        localStorage.setItem("door", value);
    });



    const addDoor = door => update$1(storeddoor => {
        console.log(storeddoor, door);
        if (storeddoor < door){
            return door
        }else {
            return storeddoor
        }
    });

    const reset = () => {
        set(DOORS);
    };

    var doorStore = {
        subscribe: subscribe$1,
        addDoor,
        reset
    };

    /* src/Door.svelte generated by Svelte v3.30.0 */
    const file = "src/Door.svelte";

    // (32:4) {:else}
    function create_else_block(ctx) {
    	let div1;
    	let div0;
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t = text(/*rewardText*/ ctx[3]);
    			attr_dev(span, "class", "bgSpan svelte-1263e6i");
    			add_location(span, file, 34, 10, 826);
    			attr_dev(div0, "class", "backgroundText svelte-1263e6i");
    			add_location(div0, file, 33, 8, 787);
    			attr_dev(div1, "class", "backgroundPicture svelte-1263e6i");
    			add_location(div1, file, 32, 6, 747);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rewardText*/ 8) set_data_dev(t, /*rewardText*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(32:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (22:4) {#if rewardLink !== ""}
    function create_if_block(ctx) {
    	let a;
    	let div1;
    	let div0;
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t = text(/*rewardText*/ ctx[3]);
    			attr_dev(span, "class", "bgSpan svelte-1263e6i");
    			add_location(span, file, 25, 12, 617);
    			attr_dev(div0, "class", "backgroundText svelte-1263e6i");
    			add_location(div0, file, 24, 10, 576);
    			attr_dev(div1, "class", "backgroundPicture svelte-1263e6i");
    			add_location(div1, file, 23, 8, 534);
    			attr_dev(a, "href", /*rewardLink*/ ctx[4]);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "svelte-1263e6i");
    			add_location(a, file, 22, 6, 488);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div1);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rewardText*/ 8) set_data_dev(t, /*rewardText*/ ctx[3]);

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
    		source: "(22:4) {#if rewardLink !== \\\"\\\"}",
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
    	let t1;
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
    			t1 = text(/*doorNumber*/ ctx[1]);
    			attr_dev(span, "class", "doorNumber svelte-1263e6i");
    			add_location(span, file, 43, 6, 1029);
    			attr_dev(div0, "class", "door svelte-1263e6i");
    			toggle_class(div0, "doorOpen", /*doorOpen*/ ctx[0]);
    			add_location(div0, file, 40, 4, 933);
    			attr_dev(div1, "class", "backDoor svelte-1263e6i");
    			set_style(div1, "--imagePath", "url(" + /*imagePath*/ ctx[2] + ")");
    			add_location(div1, file, 20, 2, 393);
    			attr_dev(main, "class", "svelte-1263e6i");
    			add_location(main, file, 19, 0, 384);
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

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*toggleDoor*/ ctx[5], false, false, false);
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

    			if (dirty & /*doorNumber*/ 2) set_data_dev(t1, /*doorNumber*/ ctx[1]);

    			if (dirty & /*doorOpen*/ 1) {
    				toggle_class(div0, "doorOpen", /*doorOpen*/ ctx[0]);
    			}

    			if (dirty & /*imagePath*/ 4) {
    				set_style(div1, "--imagePath", "url(" + /*imagePath*/ ctx[2] + ")");
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
    	let { canOpen = true } = $$props;
    	let { imagePath = "" } = $$props;
    	let { rewardText = "" } = $$props;
    	let { rewardLink = "" } = $$props;
    	let { doorOpen = false } = $$props;

    	function toggleDoor() {
    		if (canOpen) {
    			$$invalidate(0, doorOpen = !doorOpen);
    			doorStore.addDoor(doorNumber);
    		} else {
    			$$invalidate(0, doorOpen = false);
    		}
    	}

    	const writable_props = ["doorNumber", "canOpen", "imagePath", "rewardText", "rewardLink", "doorOpen"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Door> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("doorNumber" in $$props) $$invalidate(1, doorNumber = $$props.doorNumber);
    		if ("canOpen" in $$props) $$invalidate(6, canOpen = $$props.canOpen);
    		if ("imagePath" in $$props) $$invalidate(2, imagePath = $$props.imagePath);
    		if ("rewardText" in $$props) $$invalidate(3, rewardText = $$props.rewardText);
    		if ("rewardLink" in $$props) $$invalidate(4, rewardLink = $$props.rewardLink);
    		if ("doorOpen" in $$props) $$invalidate(0, doorOpen = $$props.doorOpen);
    	};

    	$$self.$capture_state = () => ({
    		doorNumber,
    		canOpen,
    		imagePath,
    		rewardText,
    		rewardLink,
    		doorOpen,
    		toggleDoor,
    		doorStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("doorNumber" in $$props) $$invalidate(1, doorNumber = $$props.doorNumber);
    		if ("canOpen" in $$props) $$invalidate(6, canOpen = $$props.canOpen);
    		if ("imagePath" in $$props) $$invalidate(2, imagePath = $$props.imagePath);
    		if ("rewardText" in $$props) $$invalidate(3, rewardText = $$props.rewardText);
    		if ("rewardLink" in $$props) $$invalidate(4, rewardLink = $$props.rewardLink);
    		if ("doorOpen" in $$props) $$invalidate(0, doorOpen = $$props.doorOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [doorOpen, doorNumber, imagePath, rewardText, rewardLink, toggleDoor, canOpen];
    }

    class Door extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			doorNumber: 1,
    			canOpen: 6,
    			imagePath: 2,
    			rewardText: 3,
    			rewardLink: 4,
    			doorOpen: 0
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
    }

    /* src/App.svelte generated by Svelte v3.30.0 */
    const file$1 = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (77:2) {#each calendarDays as doorNumber}
    function create_each_block(ctx) {
    	let door;
    	let current;

    	door = new Door({
    			props: {
    				imagePath: /*doorNumber*/ ctx[11].reward.imagePath,
    				rewardText: /*doorNumber*/ ctx[11].reward.rewardText,
    				rewardLink: /*doorNumber*/ ctx[11].reward.rewardLink,
    				doorNumber: /*doorNumber*/ ctx[11].day,
    				doorOpen: /*doorNumber*/ ctx[11].day <= /*$doorStore*/ ctx[2],
    				canOpen: /*doorNumber*/ ctx[11].canOpen
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
    			if (dirty & /*calendarDays*/ 2) door_changes.imagePath = /*doorNumber*/ ctx[11].reward.imagePath;
    			if (dirty & /*calendarDays*/ 2) door_changes.rewardText = /*doorNumber*/ ctx[11].reward.rewardText;
    			if (dirty & /*calendarDays*/ 2) door_changes.rewardLink = /*doorNumber*/ ctx[11].reward.rewardLink;
    			if (dirty & /*calendarDays*/ 2) door_changes.doorNumber = /*doorNumber*/ ctx[11].day;
    			if (dirty & /*calendarDays, $doorStore*/ 6) door_changes.doorOpen = /*doorNumber*/ ctx[11].day <= /*$doorStore*/ ctx[2];
    			if (dirty & /*calendarDays*/ 2) door_changes.canOpen = /*doorNumber*/ ctx[11].canOpen;
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
    		source: "(77:2) {#each calendarDays as doorNumber}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let h1;
    	let t0;
    	let t1;
    	let t2;
    	let p0;
    	let t4;
    	let p1;
    	let t6;
    	let p2;
    	let t10;
    	let div0;
    	let button;
    	let t12;
    	let div1;
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
    			main = element("main");
    			h1 = element("h1");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = text(" By Talan!");
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "Made with love by TalanLabs";
    			t4 = space();
    			p1 = element("p");
    			p1.textContent = "Chaque jour une case peut etre ouverte";
    			t6 = space();
    			p2 = element("p");
    			p2.textContent = `A partir du ${/*startUpDateStr*/ ctx[3]} en debug encore`;
    			t10 = space();
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "reset progression";
    			t12 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "svelte-1dpsacs");
    			add_location(h1, file$1, 68, 1, 1540);
    			add_location(p0, file$1, 69, 1, 1567);
    			add_location(p1, file$1, 70, 1, 1603);
    			add_location(p2, file$1, 71, 1, 1650);
    			add_location(button, file$1, 73, 6, 1709);
    			add_location(div0, file$1, 73, 1, 1704);
    			attr_dev(div1, "class", "box svelte-1dpsacs");
    			add_location(div1, file$1, 75, 1, 1780);
    			attr_dev(main, "class", "svelte-1dpsacs");
    			add_location(main, file$1, 67, 0, 1532);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			append_dev(main, t2);
    			append_dev(main, p0);
    			append_dev(main, t4);
    			append_dev(main, p1);
    			append_dev(main, t6);
    			append_dev(main, p2);
    			append_dev(main, t10);
    			append_dev(main, div0);
    			append_dev(div0, button);
    			append_dev(main, t12);
    			append_dev(main, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*resetProgression*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);

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
    	let calendarDays = [];
    	let startUpDateStr = "2020-11-26T00:00+01:00";
    	let startUpDate = Date.parse(startUpDateStr);
    	let currentDate = Date.now();
    	let nbDays = 1;

    	function defineNbDays() {
    		let diff = currentDate - startUpDate;
    		nbDays = Math.floor(diff / (1000 * 3600 * 24));
    	}

    	let rewards = {
    		0: {
    			imagePath: "images/christmas-tree.png",
    			rewardText: "une petite phrase un peu longue pour etre jolie et encore plus longue pour voir si ca depasse en dessous dans le dessous du dessous",
    			rewardLink: "http://google.com/"
    		},
    		1: {
    			imagePath: "images/christmas-tree.png",
    			rewardText: "une petite phrase un peu longue pour etre jolie",
    			rewardLink: "http://yahoo.com/"
    		}
    	};

    	onMount(async () => {
    		await fetch(`http://worldclockapi.com/api/json/cet/now`).then(r => r.json()).then(data => {
    			if (data.currentDateTime) {
    				currentDate = Date.parse(data.currentDateTime);
    				defineNbDays();

    				for (let i in [...Array(25).keys()]) {
    					const day = parseInt(i) + 1;

    					calendarDays.push({
    						day,
    						canOpen: canOpen(day),
    						reward: rewards[day - 1] ? rewards[day - 1] : ""
    					});
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
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
    		defineNbDays,
    		rewards,
    		canOpen,
    		resetProgression,
    		$doorStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("calendarDays" in $$props) $$invalidate(1, calendarDays = $$props.calendarDays);
    		if ("startUpDateStr" in $$props) $$invalidate(3, startUpDateStr = $$props.startUpDateStr);
    		if ("startUpDate" in $$props) startUpDate = $$props.startUpDate;
    		if ("currentDate" in $$props) currentDate = $$props.currentDate;
    		if ("nbDays" in $$props) nbDays = $$props.nbDays;
    		if ("rewards" in $$props) rewards = $$props.rewards;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, calendarDays, $doorStore, startUpDateStr, resetProgression];
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

    if (localStorage.getItem("door") === null){
    	localStorage.setItem("door", 0);
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'Advent Calendar'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

/**
 * This class helps facilitate communication between the plugin and UI panels.
 */
export class StateBridge extends EventTarget {

    /** Singleton */
    static shared = new StateBridge(123)
    
    /** Current state */
    state = {}

    /** Last used request ID */
    lastRequestID = 1

    /** Pending requests */
    pendingRequests = {}

    /** True if we're on the plugin side, false for the UI side */
    isPluginSide = false

    /** Action handlers */
    handlers = {}

    /** Constructor */
    constructor(singletonCode) {
        super()

        // Simple check to ensure we're a singleton
        if (singletonCode != 123) 
            throw new Error("StateBridge is a singleton, use StateBridge.shared instead of the constructor.")

        // Workaround: If we're on the plugin size, we need to wait for the plugin itself to finish loading...
        if (typeof window == 'undefined') {

            // Wait until ready
            this.isPluginSide = true
            let timer = setInterval(() => {
                if (typeof plugin == 'undefined') return
                clearInterval(timer)
                this.startPluginSide()
            }, 100)

        } else {

            // Otherwise, we can start immediately on the UI side
            this.startUISide()

        }

    }

    /** Log something */
    log(txt, ...args) {
        // console.debug(`[AppState > ${this.isPluginSide ? 'Plugin' : 'UI'}] ${txt}`, ...args)
    }

    /** Initialize on the plugin side */
    startPluginSide() {

        // We are on the Plugin side, wrap the onMessage function
        this.log(`Starting plugin side`)
        let originalOnMessage = plugin.onMessage
        plugin.onMessage = (event, fromID) => {

            // Check if it's ours, otherwise pass it on
            if (event.action?.startsWith('statebridge:'))
                this.onMessage({ data: event })
            else
                originalOnMessage?.call(plugin, event, fromID)

        }

    }

    /** Initialize on the UI side */
    startUISide() {

        // We are on the UI side, listen for messages
        this.log(`Starting UI side`)
        window.addEventListener("message", this.onMessage.bind(this))

        // Request initial state from the plugin side
        this.log(`Requesting initial state`)
        window.parent.postMessage({ action: "statebridge:requestState" }, "*")

    }

    /** Post a message to the other side */
    postMessage(msg) {
        if (this.isPluginSide)
            plugin.menus.postMessage(msg)
        else
            window.parent.postMessage(msg, "*")
    }

    /** Update state */
    updateState(state) {

        // If fields exist, update state
        if (state)
            this.state = { ...this.state, ...state }

        // Send state
        this.postMessage({ action: "statebridge:state", state: this.state })

    }

    /** Called when a message is received */
    async onMessage(event) {

        // Check action
        this.log(`Received message:`, event.data)
        if (event.data.action == "statebridge:state") {

            // Got new state, store and trigger listeners
            this.state = event.data.state
            this.dispatchEvent(new Event("updated"))

        } else if (event.data.action == "statebridge:requestState") {

            // Should only happen on the plugin side
            if (!this.isPluginSide) 
                return console.warn(`[AppState] Received requestState on UI side, this shouldn't happen.`)

            // Send state
            this.postMessage({ action: "statebridge:state", state: this.state })

        } else if (event.data.action == 'statebridge:doResponse') {

            // Get request
            let req = this.pendingRequests[event.data.id]
            if (!req) return console.warn(`[AppState] Received response for unknown request ${event.data.id}`, event.data)
            delete this.pendingRequests[event.data.id]

            // Trigger it
            if (event.data.error) req.reject(event.data.error)
            else req.resolve(event.data.result)

        } else if (event.data.action == 'statebridge:do') {

            // Catch errors
            try {

                // Get handler
                let handler = this.handlers[event.data.name]
                if (!handler) 
                    throw new Error(`Received unknown action ${event.data.name}`)

                // Trigger it
                let result = await handler(...event.data.args)

                // Send response
                this.postMessage({ action: "statebridge:doResponse", id: event.data.id, result })

            } catch (error) {

                // Send error
                this.postMessage({ action: "statebridge:doResponse", id: event.data.id, error })

            }

        }

    }

    /** Call an action on the other side of the bridge and wait for the result */
    async do(name, ...args) {

        // Generate request ID
        let id = 'req:' + (this.lastRequestID++)

        // Send it
        if (this.isPluginSide)
            throw new Error("Method not implemented on plugin side yet")
        else
            this.postMessage({ action: "statebridge:do", id, name, args })

        // Wait for response
        return await new Promise((resolve, reject) => {
            this.pendingRequests[id] = { resolve, reject }
        })

    }

    /** Register an action handler */
    register(name, code) {
        this.handlers[name] = code
        return code
    }

    /** Proxy which can be used to trigger actions */
    remoteActions = new Proxy(this, {
        get: (target, name) => {

            // Create and return function to do this item
            return (...args) => target.do(name, ...args)

        }
    })

}
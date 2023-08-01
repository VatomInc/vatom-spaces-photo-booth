/** Last used ID */
let LastID = 1

/**
 * This class acts as a bridge between the plugin and a displayed panel.
 */
export class PanelInterface {

    /** Randomly generated interface ID */
    id = LastID++

    /** Panel ID */
    panelID = null

    /** @type {'panel' | 'registeredMenu'} The type of panel */
    type = 'panel'

    /** List of all active interfaces */
    static activeInterfaces = []

    /** Pending call() responses */
    pendingResponses = {}

    /** Constructor */
    constructor() {

        // Add to list of active interfaces
        PanelInterface.activeInterfaces.push(this)

    }

    /** 
     * Handle messages being passed in to the plugin.
     * 
     * @returns {boolean} True if the message was handled by this class.
     */
    static handleMessage(msg) {

        // Pass to each active interface
        for (let i of PanelInterface.activeInterfaces)
            if (i.handleMessage(msg))
                return true

    }

    /** 
     * Create a new panel with the specified HTML and open it.
     * 
     * @param {string} title The title of the panel
     * @param {'small' | 'large'} size The panel size
     * @param {string} html The HTML to display inside the panel
     * @returns {Promise<PanelInterface>} The panel interface once it's been opened.
     */
    static async openPanel(title, size, html) {

        // Create interface
        let intf = new PanelInterface()
        intf.type = 'panel'

        // Get panel info
        let panel = {
            iframeURL: panelHTML(html, intf.id),
        }

        // Adjust size
        if (size == 'large') {
            panel.width = 1200
            panel.height = 800
        }

        // Create UI
        intf.panelID = await plugin.menus.displayPopup({ title, panel })

        // Wait for it to load
        await intf.waitForLoad()

        // Done
        return intf

    }

    /** 
     * Create an overlay panel.
     * 
     * @param {string} html The HTML to display inside the panel
     * @returns {Promise<PanelInterface>} The panel interface once it's been opened.
     */
    static async createOverlay(html) {

        // Create interface
        let intf = new PanelInterface()
        intf.type = 'registeredMenu'

        // Create UI
        intf.panelID = await plugin.menus.register({
            section: 'overlay-top',
            panel: {
                iframeURL: panelHTML(html, intf.id),
            }
        })

        // Wait for it to load
        await intf.waitForLoad()

        // Done
        return intf

    }

    /** Handle message */
    handleMessage(msg) {

        // Check if it's for us
        if (msg.interfaceID != this.id) 
            return false

        // Check action
        if (msg.action == 'panel:onLoad') {

            // Resolve promise
            this._loadResolve()
            return true

        } else if (msg.action == 'panel:close') {

            // Close panel
            this.close()
            return true

        } else if (msg.action == 'panel:callResponse') {

            // Pass on response and remove handler
            this.pendingResponses[msg.data.requestID]?.(msg.data)
            delete this.pendingResponses[msg.requestID]
            return true

        }

    }

    /** Wait for the panel to load */
    waitForLoad() {

        // Check if promise already exists
        if (this._loadPromise)
            return this._loadPromise

        // Create pending promise
        this._loadPromise = new Promise(resolve => {
            this._loadResolve = resolve
        })

        // Return it
        return this._loadPromise

    }

    /** Close the panel */
    close() {

        // Check type
        if (this.type == 'registeredMenu') {

            // Unregister the UI
            plugin.menus.unregister(this.panelID)

        } else if (this.type == 'panel') {

            // Send the request to close the panel
            plugin.menus.closePopup(this.panelID)

        }

        // Remove us from the active panel list
        PanelInterface.activeInterfaces = PanelInterface.activeInterfaces.filter(i => i != this)

    }

    /** Call an action in the panel and return the response */
    async call(name, ...args) {

        // Generate ID
        let requestID = '' + (LastID++)

        // Send message
        plugin.menus.postMessage({
            interfaceID: this.id,
            action: 'panel:call',
            name,
            args,
            requestID
        })

        // Wait for completion
        let msg = await new Promise(resolve => {
            this.pendingResponses[requestID] = resolve
        })

        // Check result
        if (msg.error)
            throw new Error(msg.error)
        else
            return msg.response

    }

    /** Update an HTML element */
    async updateElement(selector, html) {
        await this.call('vatomPanelUpdateElement', selector, html)
    }

}

/** Wrap HTML for displaying inside a menu/popup */
function panelHTML(html, interfaceID) {

    // Generate a random ID
    let id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    // Wrapper
    let wrapper = `<!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
                html, head {
                    overflow: hidden;
                    width: 100%; height: 100%; 
                    margin: 0px;
                    padding: 0px;
                    cursor: default;
                    font-family: Inter, Helvetica Neue, Helvetica, Arial;
                    user-select: none;
                }
            </style>
            <script>

                // PanelInterface API
                window.vatom = {
                    interfaceID: "${interfaceID}",
                    postMessage: (action, data) => window.parent.postMessage({ interfaceID: window.vatom.interfaceID, action, data }, '*'),
                    close: () => window.vatom.postMessage('panel:close'),
                }

                // Exposed function to update an HTML element
                window.vatomPanelUpdateElement = (selector, html) => {
                    let el = document.querySelector(selector)
                    if (!el) throw new Error("Element '" + selector + "' not found.")
                    el.innerHTML = html
                }

                // Called on load
                window.addEventListener('load', () => {
                    window.vatom.postMessage('panel:onLoad')
                })

                // Called on message received
                window.addEventListener('message', async e => {

                    // Stop if not for us
                    if (e.data.interfaceID != window.vatom.interfaceID)
                        return

                    // Check action
                    if (e.data.action == 'panel:call') {

                        // Find function and call
                        try {
                            let fn = window[e.data.name]
                            let response = await fn(...e.data.args)
                            window.vatom.postMessage('panel:callResponse', { requestID: e.data.requestID, response })
                        } catch (err) {
                            window.vatom.postMessage('panel:callResponse', { requestID: e.data.requestID, error: err.message || 'An unknown error occurred.' })
                        }

                    }

                })

            </script>
        </head>
        <body>
            INSERT_CONTENT_HERE
        </body>
    </html>`

    // Minify it
    wrapper = wrapper.replace(/ +/g, ' ')

    // Insert content
    html = wrapper.replace('INSERT_CONTENT_HERE', html.trim())

    // Convert to data URI
    let data = encodeURIComponent(html)
    return `data:text/html;charset=utf-8,${data}`

}
const TRANSITION_EVENTS = ['transitionend', 'webkitTransitionEnd', 'oTransitionEnd']
// const TRANSITION_PROPERTIES = ['transition', 'MozTransition', 'webkitTransition', 'WebkitTransition', 'OTransition']

class Menu {
    constructor(el, config = {}, _PS = null) {
        this._el = el
        this._animate = config.animate !== false
        this._accordion = config.accordion !== false
        this._closeChildren = Boolean(config.closeChildren)

        this._onOpen = config.onOpen || (() => {})
        this._onOpened = config.onOpened || (() => {})
        this._onClose = config.onClose || (() => {})
        this._onClosed = config.onClosed || (() => {})

        this._psScroll = null
        this._topParent = null
        this._menuBgClass = null

        el.classList.add('menu')
        el.classList[this._animate ? 'remove' : 'add']('menu-no-animation') // check

        el.classList.add('menu-vertical')

        const PerfectScrollbarLib = _PS || window.PerfectScrollbar

        if (PerfectScrollbarLib) {
        this._scrollbar = new PerfectScrollbarLib(el.querySelector('.menu-inner'), {
            suppressScrollX: true,
            wheelPropagation: !Menu._hasClass('layout-menu-fixed layout-menu-fixed-offcanvas')
        })

        window.Helpers.menuPsScroll = this._scrollbar
        } else {
        el.querySelector('.menu-inner').classList.add('overflow-auto')
        }

        // Add data attribute for bg color class of menu
        const menuClassList = el.classList

        for (let i = 0; i < menuClassList.length; i++) {
        if (menuClassList[i].startsWith('bg-')) {
            this._menuBgClass = menuClassList[i]
        }
        }
        el.setAttribute('data-bg-class', this._menuBgClass)

        this._bindEvents()

        // Link menu instance to element
        el.menuInstance = this
}

    _bindEvents() {
        // Click Event
        this._evntElClick = e => {
        // Find top parent element
        if (e.target.closest('ul') && e.target.closest('ul').classList.contains('menu-inner')) {
            const menuItem = Menu._findParent(e.target, 'menu-item', false)

            // eslint-disable-next-line prefer-destructuring
            if (menuItem) this._topParent = menuItem.childNodes[0]
        }

        const toggleLink = e.target.classList.contains('menu-toggle')
            ? e.target
            : Menu._findParent(e.target, 'menu-toggle', false)

        if (toggleLink) {
            e.preventDefault()

            if (toggleLink.getAttribute('data-hover') !== 'true') {
            this.toggle(toggleLink)
            }
        }
        }
        if (window.Helpers.isMobileDevice) this._el.addEventListener('click', this._evntElClick)

        this._evntWindowResize = () => {
        this.update()
        if (this._lastWidth !== window.innerWidth) {
            this._lastWidth = window.innerWidth
            this.update()
        }

        const horizontalMenuTemplate = document.querySelector("[data-template^='horizontal-menu']")
        if (!this._horizontal && !horizontalMenuTemplate) this.manageScroll()
        }
        window.addEventListener('resize', this._evntWindowResize)
    }

    static childOf(/* child node */ c, /* parent node */ p) {
        // returns boolean
        if (c.parentNode) {
        while ((c = c.parentNode) && c !== p);
        return !!c
        }
        return false
    }

    _unbindEvents() {
        if (this._evntElClick) {
        this._el.removeEventListener('click', this._evntElClick)
        this._evntElClick = null
        }

        if (this._evntElMouseOver) {
        this._el.removeEventListener('mouseover', this._evntElMouseOver)
        this._evntElMouseOver = null
        }

        if (this._evntElMouseOut) {
        this._el.removeEventListener('mouseout', this._evntElMouseOut)
        this._evntElMouseOut = null
        }

        if (this._evntWindowResize) {
        window.removeEventListener('resize', this._evntWindowResize)
        this._evntWindowResize = null
        }

        if (this._evntBodyClick) {
        document.body.removeEventListener('click', this._evntBodyClick)
        this._evntBodyClick = null
        }

        if (this._evntInnerMousemove) {
        this._inner.removeEventListener('mousemove', this._evntInnerMousemove)
        this._evntInnerMousemove = null
        }

        if (this._evntInnerMouseleave) {
        this._inner.removeEventListener('mouseleave', this._evntInnerMouseleave)
        this._evntInnerMouseleave = null
        }
    }

    static _isRoot(item) {
        return !Menu._findParent(item, 'menu-item', false)
    }

    static _findParent(el, cls, throwError = true) {
        if (el.tagName.toUpperCase() === 'BODY') return null
        el = el.parentNode
        while (el.tagName.toUpperCase() !== 'BODY' && !el.classList.contains(cls)) {
        el = el.parentNode
        }

        el = el.tagName.toUpperCase() !== 'BODY' ? el : null

        if (!el && throwError) throw new Error(`Cannot find \`.${cls}\` parent element`)

        return el
    }

    static _findChild(el, cls) {
        const items = el.childNodes
        const found = []

        for (let i = 0, l = items.length; i < l; i++) {
        if (items[i].classList) {
            let passed = 0

            for (let j = 0; j < cls.length; j++) {
            if (items[i].classList.contains(cls[j])) passed += 1
            }

            if (cls.length === passed) found.push(items[i])
        }
        }

        return found
    }

    static _findMenu(item) {
        let curEl = item.childNodes[0]
        let menu = null

        while (curEl && !menu) {
        if (curEl.classList && curEl.classList.contains('menu-sub')) menu = curEl
        curEl = curEl.nextSibling
        }

        if (!menu) throw new Error('Cannot find `.menu-sub` element for the current `.menu-toggle`')

        return menu
    }

    // Has class
    static _hasClass(cls, el = window.Helpers.ROOT_EL) {
        let result = false

        cls.split(' ').forEach(c => {
        if (el.classList.contains(c)) result = true
        })

        return result
    }

    open(el, closeChildren = this._closeChildren) {
        const item = this._findUnopenedParent(Menu._getItem(el, true), closeChildren)

        if (!item) return

        const toggleLink = Menu._getLink(item, true)

        Menu._promisify(this._onOpen, this, item, toggleLink, Menu._findMenu(item))
        .then(() => {
            if (!this._horizontal || !Menu._isRoot(item)) {
            if (this._animate && !this._horizontal) {
                window.requestAnimationFrame(() => this._toggleAnimation(true, item, false))
                if (this._accordion) this._closeOther(item, closeChildren)
            } else if (this._animate) {
                // eslint-disable-next-line no-unused-expressions
                this._onOpened && this._onOpened(this, item, toggleLink, Menu._findMenu(item))
            } else {
                item.classList.add('open')
                // eslint-disable-next-line no-unused-expressions
                this._onOpened && this._onOpened(this, item, toggleLink, Menu._findMenu(item))
                if (this._accordion) this._closeOther(item, closeChildren)
            }
            } else {
            // eslint-disable-next-line no-unused-expressions
            this._onOpened && this._onOpened(this, item, toggleLink, Menu._findMenu(item))
            }
        })
        .catch(() => {})
    }

    close(el, closeChildren = this._closeChildren, _autoClose = false) {
        const item = Menu._getItem(el, true)
        const toggleLink = Menu._getLink(el, true)

        if (!item.classList.contains('open') || item.classList.contains('disabled')) return

        Menu._promisify(this._onClose, this, item, toggleLink, Menu._findMenu(item), _autoClose)
        .then(() => {
            if (!this._horizontal || !Menu._isRoot(item)) {
            if (this._animate && !this._horizontal) {
                window.requestAnimationFrame(() => this._toggleAnimation(false, item, closeChildren))
            } else {
                item.classList.remove('open')

                if (closeChildren) {
                const opened = item.querySelectorAll('.menu-item.open')
                for (let i = 0, l = opened.length; i < l; i++) opened[i].classList.remove('open')
                }

                // eslint-disable-next-line no-unused-expressions
                this._onClosed && this._onClosed(this, item, toggleLink, Menu._findMenu(item))
            }
            } else {
            // eslint-disable-next-line no-unused-expressions
            this._onClosed && this._onClosed(this, item, toggleLink, Menu._findMenu(item))
            }
        })
        .catch(() => {})
    }

    _closeOther(item, closeChildren) {
        const opened = Menu._findChild(item.parentNode, ['menu-item', 'open'])

        for (let i = 0, l = opened.length; i < l; i++) {
        if (opened[i] !== item) this.close(opened[i], closeChildren)
        }
    }

    toggle(el, closeChildren = this._closeChildren) {
        const item = Menu._getItem(el, true)
        // const toggleLink = Menu._getLink(el, true)

        if (item.classList.contains('open')) this.close(item, closeChildren)
        else this.open(item, closeChildren)
    }

    static _getItem(el, toggle) {
        let item = null
        const selector = toggle ? 'menu-toggle' : 'menu-link'

        if (el.classList.contains('menu-item')) {
        if (Menu._findChild(el, [selector]).length) item = el
        } else if (el.classList.contains(selector)) {
        item = el.parentNode.classList.contains('menu-item') ? el.parentNode : null
        }

        if (!item) {
        throw new Error(`${toggle ? 'Toggable ' : ''}\`.menu-item\` element not found.`)
        }

        return item
    }

    static _getLink(el, toggle) {
        let found = []
        const selector = toggle ? 'menu-toggle' : 'menu-link'

        if (el.classList.contains(selector)) found = [el]
        else if (el.classList.contains('menu-item')) found = Menu._findChild(el, [selector])

        if (!found.length) throw new Error(`\`${selector}\` element not found.`)

        return found[0]
    }

    _findUnopenedParent(item, closeChildren) {
        let tree = []
        let parentItem = null

        while (item) {
        if (item.classList.contains('disabled')) {
            parentItem = null
            tree = []
        } else {
            if (!item.classList.contains('open')) parentItem = item
            tree.push(item)
        }

        item = Menu._findParent(item, 'menu-item', false)
        }

        if (!parentItem) return null
        if (tree.length === 1) return parentItem

        tree = tree.slice(0, tree.indexOf(parentItem))

        for (let i = 0, l = tree.length; i < l; i++) {
        tree[i].classList.add('open')

        if (this._accordion) {
            const openedItems = Menu._findChild(tree[i].parentNode, ['menu-item', 'open'])

            for (let j = 0, k = openedItems.length; j < k; j++) {
            if (openedItems[j] !== tree[i]) {
                openedItems[j].classList.remove('open')

                if (closeChildren) {
                const openedChildren = openedItems[j].querySelectorAll('.menu-item.open')
                for (let x = 0, z = openedChildren.length; x < z; x++) {
                    openedChildren[x].classList.remove('open')
                }
                }
            }
            }
        }
        }

        return parentItem
    }

    _toggleAnimation(open, item, closeChildren) {
        const toggleLink = Menu._getLink(item, true)
        const menu = Menu._findMenu(item)

        Menu._unbindAnimationEndEvent(item)

        const linkHeight = Math.round(toggleLink.getBoundingClientRect().height)

        item.style.overflow = 'hidden'

        const clearItemStyle = () => {
        item.classList.remove('menu-item-animating')
        item.classList.remove('menu-item-closing')
        item.style.overflow = null
        item.style.height = null

        this.update()
        }

        if (open) {
        item.style.height = `${linkHeight}px`
        item.classList.add('menu-item-animating')
        item.classList.add('open')

        Menu._bindAnimationEndEvent(item, () => {
            clearItemStyle()
            this._onOpened(this, item, toggleLink, menu)
        })

        setTimeout(() => {
            item.style.height = `${linkHeight + Math.round(menu.getBoundingClientRect().height)}px`
        }, 50)
        } else {
        item.style.height = `${linkHeight + Math.round(menu.getBoundingClientRect().height)}px`
        item.classList.add('menu-item-animating')
        item.classList.add('menu-item-closing')

        Menu._bindAnimationEndEvent(item, () => {
            item.classList.remove('open')
            clearItemStyle()

            if (closeChildren) {
            const opened = item.querySelectorAll('.menu-item.open')
            for (let i = 0, l = opened.length; i < l; i++) opened[i].classList.remove('open')
            }

            this._onClosed(this, item, toggleLink, menu)
        })

        setTimeout(() => {
            item.style.height = `${linkHeight}px`
        }, 50)
        }
    }

    static _bindAnimationEndEvent(el, handler) {
        const cb = e => {
        if (e.target !== el) return
        Menu._unbindAnimationEndEvent(el)
        handler(e)
        }

        let duration = window.getComputedStyle(el).transitionDuration
        duration = parseFloat(duration) * (duration.indexOf('ms') !== -1 ? 1 : 1000)

        el._menuAnimationEndEventCb = cb
        TRANSITION_EVENTS.forEach(ev => el.addEventListener(ev, el._menuAnimationEndEventCb, false))

        el._menuAnimationEndEventTimeout = setTimeout(() => {
        cb({ target: el })
        }, duration + 50)
    }

    _getItemOffset(item) {
        let curItem = this._inner.childNodes[0]
        let left = 0

        while (curItem !== item) {
        if (curItem.tagName) {
            left += Math.round(curItem.getBoundingClientRect().width)
        }

        curItem = curItem.nextSibling
        }

        return left
    }

    static _promisify(fn, ...args) {
        const result = fn(...args)
        if (result instanceof Promise) {
        return result
        }
        if (result === false) {
        return Promise.reject()
        }
        return Promise.resolve()
    }

    get _innerWidth() {
        const items = this._inner.childNodes
        let width = 0

        for (let i = 0, l = items.length; i < l; i++) {
        if (items[i].tagName) {
            width += Math.round(items[i].getBoundingClientRect().width)
        }
        }

        return width
    }

    get _innerPosition() {
        return parseInt(this._inner.style[this._rtl ? 'marginRight' : 'marginLeft'] || '0px', 10)
    }

    set _innerPosition(value) {
        this._inner.style[this._rtl ? 'marginRight' : 'marginLeft'] = `${value}px`
        return value
    }

    static _unbindAnimationEndEvent(el) {
        const cb = el._menuAnimationEndEventCb

        if (el._menuAnimationEndEventTimeout) {
        clearTimeout(el._menuAnimationEndEventTimeout)
        el._menuAnimationEndEventTimeout = null
        }

        if (!cb) return

        TRANSITION_EVENTS.forEach(ev => el.removeEventListener(ev, cb, false))
        el._menuAnimationEndEventCb = null
    }

    closeAll(closeChildren = this._closeChildren) {
        const opened = this._el.querySelectorAll('.menu-inner > .menu-item.open')

        for (let i = 0, l = opened.length; i < l; i++) this.close(opened[i], closeChildren)
    }

    static setDisabled(el, disabled) {
        Menu._getItem(el, false).classList[disabled ? 'add' : 'remove']('disabled')
    }

    static isActive(el) {
        return Menu._getItem(el, false).classList.contains('active')
    }

    static isOpened(el) {
        return Menu._getItem(el, false).classList.contains('open')
    }

    static isDisabled(el) {
        return Menu._getItem(el, false).classList.contains('disabled')
    }

    update() {
        if (this._scrollbar) {
        this._scrollbar.update()
        }
    }

    manageScroll() {
        const { PerfectScrollbar } = window
        const menuInner = document.querySelector('.menu-inner')

        if (window.innerWidth < window.Helpers.LAYOUT_BREAKPOINT) {
        if (this._scrollbar !== null) {
            // window.Helpers.menuPsScroll.destroy()
            this._scrollbar.destroy()
            this._scrollbar = null
        }
        menuInner.classList.add('overflow-auto')
        } else {
        if (this._scrollbar === null) {
            const menuScroll = new PerfectScrollbar(document.querySelector('.menu-inner'), {
            suppressScrollX: true,
            wheelPropagation: false
            })
            this._scrollbar = menuScroll
        }
        menuInner.classList.remove('overflow-auto')
        }
    }

    destroy() {
        if (!this._el) return

        this._unbindEvents()

        const items = this._el.querySelectorAll('.menu-item')
        for (let i = 0, l = items.length; i < l; i++) {
        Menu._unbindAnimationEndEvent(items[i])
        items[i].classList.remove('menu-item-animating')
        items[i].classList.remove('open')
        items[i].style.overflow = null
        items[i].style.height = null
        }

        const menus = this._el.querySelectorAll('.menu-menu')
        for (let i2 = 0, l2 = menus.length; i2 < l2; i2++) {
        menus[i2].style.marginRight = null
        menus[i2].style.marginLeft = null
        }

        this._el.classList.remove('menu-no-animation')

        if (this._wrapper) {
        this._prevBtn.parentNode.removeChild(this._prevBtn)
        this._nextBtn.parentNode.removeChild(this._nextBtn)
        this._wrapper.parentNode.insertBefore(this._inner, this._wrapper)
        this._wrapper.parentNode.removeChild(this._wrapper)
        this._inner.style.marginLeft = null
        this._inner.style.marginRight = null
        }

        this._el.menuInstance = null
        delete this._el.menuInstance

        this._el = null
        this._animate = null
        this._accordion = null
        this._closeChildren = null
        this._onOpen = null
        this._onOpened = null
        this._onClose = null
        this._onClosed = null
        if (this._scrollbar) {
            this._scrollbar.destroy()
            this._scrollbar = null
        }
        this._inner = null
        this._prevBtn = null
        this._wrapper = null
        this._nextBtn = null
    }
}

export { Menu }


//helpers.js
// Constants
const TRANS_EVENTS = ['transitionend', 'webkitTransitionEnd', 'oTransitionEnd']
const TRANS_PROPERTIES = ['transition', 'MozTransition', 'webkitTransition', 'WebkitTransition', 'OTransition']
const INLINE_STYLES = `
.layout-menu-fixed .layout-navbar-full .layout-menu,
.layout-page {
padding-top: {navbarHeight}px !important;
}
.content-wrapper {
padding-bottom: {footerHeight}px !important;
}`

// Guard
function requiredParam(name) {
throw new Error(`Parameter required${name ? `: \`${name}\`` : ''}`)
}

const Helpers = {
// Root Element
ROOT_EL: typeof window !== 'undefined' ? document.documentElement : null,

// Large screens breakpoint
LAYOUT_BREAKPOINT: 1200,

// Resize delay in milliseconds
RESIZE_DELAY: 200,

menuPsScroll: null,

mainMenu: null,

// Internal variables
_curStyle: null,
_styleEl: null,
_resizeTimeout: null,
_resizeCallback: null,
_transitionCallback: null,
_transitionCallbackTimeout: null,
_listeners: [],
_initialized: false,
_autoUpdate: false,
_lastWindowHeight: 0,

// *******************************************************************************
// * Utilities

// ---
// Scroll To Active Menu Item
_scrollToActive(animate = false, duration = 500) {
    const layoutMenu = this.getLayoutMenu()

    if (!layoutMenu) return

    let activeEl = layoutMenu.querySelector('li.menu-item.active:not(.open)')

    if (activeEl) {
    // t = current time
    // b = start value
    // c = change in value
    // d = duration
    const easeInOutQuad = (t, b, c, d) => {
        t /= d / 2
        if (t < 1) return (c / 2) * t * t + b
        t -= 1
        return (-c / 2) * (t * (t - 2) - 1) + b
    }

    const element = this.getLayoutMenu().querySelector('.menu-inner')

    if (typeof activeEl === 'string') {
        activeEl = document.querySelector(activeEl)
    }
    if (typeof activeEl !== 'number') {
        activeEl = activeEl.getBoundingClientRect().top + element.scrollTop
    }

    // If active element's top position is less than 2/3 (66%) of menu height than do not scroll
    if (activeEl < parseInt((element.clientHeight * 2) / 3, 10)) return

    const start = element.scrollTop
    const change = activeEl - start - parseInt(element.clientHeight / 2, 10)
    const startDate = +new Date()

    if (animate === true) {
        const animateScroll = () => {
        const currentDate = +new Date()
        const currentTime = currentDate - startDate
        const val = easeInOutQuad(currentTime, start, change, duration)
        element.scrollTop = val
        if (currentTime < duration) {
            requestAnimationFrame(animateScroll)
        } else {
            element.scrollTop = change
        }
        }
        animateScroll()
    } else {
        element.scrollTop = change
    }
    }
},

// ---
// Add classes
_addClass(cls, el = this.ROOT_EL) {
    if (el.length !== undefined) {
    // Add classes to multiple elements
    el.forEach(e => {
        cls.split(' ').forEach(c => e.classList.add(c))
    })
    } else {
    // Add classes to single element
    cls.split(' ').forEach(c => el.classList.add(c))
    }
},

// ---
// Remove classes
_removeClass(cls, el = this.ROOT_EL) {
    if (el.length !== undefined) {
    // Remove classes to multiple elements
    el.forEach(e => {
        cls.split(' ').forEach(c => e.classList.remove(c))
    })
    } else {
    // Remove classes to single element
    cls.split(' ').forEach(c => el.classList.remove(c))
    }
},

// Toggle classes
_toggleClass(el = this.ROOT_EL, cls1, cls2) {
    if (el.classList.contains(cls1)) {
    el.classList.replace(cls1, cls2)
    } else {
    el.classList.replace(cls2, cls1)
    }
},

// ---
// Has class
_hasClass(cls, el = this.ROOT_EL) {
    let result = false

    cls.split(' ').forEach(c => {
    if (el.classList.contains(c)) result = true
    })

    return result
},

_findParent(el, cls) {
    if ((el && el.tagName.toUpperCase() === 'BODY') || el.tagName.toUpperCase() === 'HTML') return null
    el = el.parentNode
    while (el && el.tagName.toUpperCase() !== 'BODY' && !el.classList.contains(cls)) {
    el = el.parentNode
    }
    el = el && el.tagName.toUpperCase() !== 'BODY' ? el : null
    return el
},

// ---
// Trigger window event
_triggerWindowEvent(name) {
    if (typeof window === 'undefined') return

    if (document.createEvent) {
    let event

    if (typeof Event === 'function') {
        event = new Event(name)
    } else {
        event = document.createEvent('Event')
        event.initEvent(name, false, true)
    }

    window.dispatchEvent(event)
    } else {
    window.fireEvent(`on${name}`, document.createEventObject())
    }
},

// ---
// Trigger event
_triggerEvent(name) {
    this._triggerWindowEvent(`layout${name}`)

    this._listeners.filter(listener => listener.event === name).forEach(listener => listener.callback.call(null))
},

// ---
// Update style
_updateInlineStyle(navbarHeight = 0, footerHeight = 0) {
    if (!this._styleEl) {
    this._styleEl = document.createElement('style')
    this._styleEl.type = 'text/css'
    document.head.appendChild(this._styleEl)
    }

    const newStyle = INLINE_STYLES.replace(/\{navbarHeight\}/gi, navbarHeight).replace(
    /\{footerHeight\}/gi,
    footerHeight
    )

    if (this._curStyle !== newStyle) {
    this._curStyle = newStyle
    this._styleEl.textContent = newStyle
    }
},

// ---
// Remove style
_removeInlineStyle() {
    if (this._styleEl) document.head.removeChild(this._styleEl)
    this._styleEl = null
    this._curStyle = null
},

// ---
// Redraw layout menu (Safari bugfix)
_redrawLayoutMenu() {
    const layoutMenu = this.getLayoutMenu()

    if (layoutMenu && layoutMenu.querySelector('.menu')) {
    const inner = layoutMenu.querySelector('.menu-inner')
    const { scrollTop } = inner
    const pageScrollTop = document.documentElement.scrollTop

    layoutMenu.style.display = 'none'
    // layoutMenu.offsetHeight
    layoutMenu.style.display = ''
    inner.scrollTop = scrollTop
    document.documentElement.scrollTop = pageScrollTop

    return true
    }

    return false
},

// ---
// Check for transition support
_supportsTransitionEnd() {
    if (window.QUnit) return false

    const el = document.body || document.documentElement

    if (!el) return false

    let result = false
    TRANS_PROPERTIES.forEach(evnt => {
    if (typeof el.style[evnt] !== 'undefined') result = true
    })

    return result
},

// ---
// Calculate current navbar height
_getNavbarHeight() {
    const layoutNavbar = this.getLayoutNavbar()

    if (!layoutNavbar) return 0
    if (!this.isSmallScreen()) return layoutNavbar.getBoundingClientRect().height

    // Needs some logic to get navbar height on small screens

    const clonedEl = layoutNavbar.cloneNode(true)
    clonedEl.id = null
    clonedEl.style.visibility = 'hidden'
    clonedEl.style.position = 'absolute'

    Array.prototype.slice.call(clonedEl.querySelectorAll('.collapse.show')).forEach(el => this._removeClass('show', el))

    layoutNavbar.parentNode.insertBefore(clonedEl, layoutNavbar)

    const navbarHeight = clonedEl.getBoundingClientRect().height

    clonedEl.parentNode.removeChild(clonedEl)

    return navbarHeight
},

// ---
// Get current footer height
_getFooterHeight() {
    const layoutFooter = this.getLayoutFooter()

    if (!layoutFooter) return 0

    return layoutFooter.getBoundingClientRect().height
},

// ---
// Get animation duration of element
_getAnimationDuration(el) {
    const duration = window.getComputedStyle(el).transitionDuration

    return parseFloat(duration) * (duration.indexOf('ms') !== -1 ? 1 : 1000)
},

// ---
// Set menu hover state
_setMenuHoverState(hovered) {
    this[hovered ? '_addClass' : '_removeClass']('layout-menu-hover')
},

// ---
// Toggle collapsed
_setCollapsed(collapsed) {
    if (this.isSmallScreen()) {
    if (collapsed) {
        this._removeClass('layout-menu-expanded')
    } else {
        setTimeout(
        () => {
            this._addClass('layout-menu-expanded')
        },
        this._redrawLayoutMenu() ? 5 : 0
        )
    }
    }
},

// ---
// Add layout sivenav toggle animationEnd event
_bindLayoutAnimationEndEvent(modifier, cb) {
    const menu = this.getMenu()
    const duration = menu ? this._getAnimationDuration(menu) + 50 : 0

    if (!duration) {
    modifier.call(this)
    cb.call(this)
    return
    }

    this._transitionCallback = e => {
    if (e.target !== menu) return
    this._unbindLayoutAnimationEndEvent()
    cb.call(this)
    }

    TRANS_EVENTS.forEach(e => {
    menu.addEventListener(e, this._transitionCallback, false)
    })

    modifier.call(this)

    this._transitionCallbackTimeout = setTimeout(() => {
    this._transitionCallback.call(this, { target: menu })
    }, duration)
},

// ---
// Remove layout sivenav toggle animationEnd event
_unbindLayoutAnimationEndEvent() {
    const menu = this.getMenu()

    if (this._transitionCallbackTimeout) {
    clearTimeout(this._transitionCallbackTimeout)
    this._transitionCallbackTimeout = null
    }

    if (menu && this._transitionCallback) {
    TRANS_EVENTS.forEach(e => {
        menu.removeEventListener(e, this._transitionCallback, false)
    })
    }

    if (this._transitionCallback) {
    this._transitionCallback = null
    }
},

// ---
// Bind delayed window resize event
_bindWindowResizeEvent() {
    this._unbindWindowResizeEvent()

    const cb = () => {
    if (this._resizeTimeout) {
        clearTimeout(this._resizeTimeout)
        this._resizeTimeout = null
    }
    this._triggerEvent('resize')
    }

    this._resizeCallback = () => {
    if (this._resizeTimeout) clearTimeout(this._resizeTimeout)
    this._resizeTimeout = setTimeout(cb, this.RESIZE_DELAY)
    }

    window.addEventListener('resize', this._resizeCallback, false)
},

// ---
// Unbind delayed window resize event
_unbindWindowResizeEvent() {
    if (this._resizeTimeout) {
    clearTimeout(this._resizeTimeout)
    this._resizeTimeout = null
    }

    if (this._resizeCallback) {
    window.removeEventListener('resize', this._resizeCallback, false)
    this._resizeCallback = null
    }
},

_bindMenuMouseEvents() {
    if (this._menuMouseEnter && this._menuMouseLeave && this._windowTouchStart) return

    const layoutMenu = this.getLayoutMenu()
    if (!layoutMenu) return this._unbindMenuMouseEvents()

    if (!this._menuMouseEnter) {
    this._menuMouseEnter = () => {
        if (this.isSmallScreen() || this._hasClass('layout-transitioning')) {
        return this._setMenuHoverState(false)
        }

        return this._setMenuHoverState(false)
    }
    layoutMenu.addEventListener('mouseenter', this._menuMouseEnter, false)
    layoutMenu.addEventListener('touchstart', this._menuMouseEnter, false)
    }

    if (!this._menuMouseLeave) {
    this._menuMouseLeave = () => {
        this._setMenuHoverState(false)
    }
    layoutMenu.addEventListener('mouseleave', this._menuMouseLeave, false)
    }

    if (!this._windowTouchStart) {
    this._windowTouchStart = e => {
        if (!e || !e.target || !this._findParent(e.target, '.layout-menu')) {
        this._setMenuHoverState(false)
        }
    }
    window.addEventListener('touchstart', this._windowTouchStart, true)
    }
},

_unbindMenuMouseEvents() {
    if (!this._menuMouseEnter && !this._menuMouseLeave && !this._windowTouchStart) return

    const layoutMenu = this.getLayoutMenu()

    if (this._menuMouseEnter) {
    if (layoutMenu) {
        layoutMenu.removeEventListener('mouseenter', this._menuMouseEnter, false)
        layoutMenu.removeEventListener('touchstart', this._menuMouseEnter, false)
    }
    this._menuMouseEnter = null
    }

    if (this._menuMouseLeave) {
    if (layoutMenu) {
        layoutMenu.removeEventListener('mouseleave', this._menuMouseLeave, false)
    }
    this._menuMouseLeave = null
    }

    if (this._windowTouchStart) {
    if (layoutMenu) {
        window.addEventListener('touchstart', this._windowTouchStart, true)
    }
    this._windowTouchStart = null
    }

    this._setMenuHoverState(false)
},

// *******************************************************************************
// * Methods

scrollToActive(animate = false) {
    this._scrollToActive(animate)
},

// ---
// Collapse / expand layout
setCollapsed(collapsed = requiredParam('collapsed'), animate = true) {
    const layoutMenu = this.getLayoutMenu()

    if (!layoutMenu) return

    this._unbindLayoutAnimationEndEvent()

    if (animate && this._supportsTransitionEnd()) {
    this._addClass('layout-transitioning')
    if (collapsed) this._setMenuHoverState(false)

    this._bindLayoutAnimationEndEvent(
        () => {
        // Collapse / Expand
        if (this.isSmallScreen) this._setCollapsed(collapsed)
        },
        () => {
        this._removeClass('layout-transitioning')
        this._triggerWindowEvent('resize')
        this._triggerEvent('toggle')
        this._setMenuHoverState(false)
        }
    )
    } else {
    this._addClass('layout-no-transition')
    if (collapsed) this._setMenuHoverState(false)

    // Collapse / Expand
    this._setCollapsed(collapsed)

    setTimeout(() => {
        this._removeClass('layout-no-transition')
        this._triggerWindowEvent('resize')
        this._triggerEvent('toggle')
        this._setMenuHoverState(false)
    }, 1)
    }
},

// ---
// Toggle layout
toggleCollapsed(animate = true) {
    this.setCollapsed(!this.isCollapsed(), animate)
},

// ---
// Set layout positioning
setPosition(fixed = requiredParam('fixed'), offcanvas = requiredParam('offcanvas')) {
    this._removeClass('layout-menu-offcanvas layout-menu-fixed layout-menu-fixed-offcanvas')

    if (!fixed && offcanvas) {
    this._addClass('layout-menu-offcanvas')
    } else if (fixed && !offcanvas) {
    this._addClass('layout-menu-fixed')
    this._redrawLayoutMenu()
    } else if (fixed && offcanvas) {
    this._addClass('layout-menu-fixed-offcanvas')
    this._redrawLayoutMenu()
    }

    this.update()
},

// *******************************************************************************
// * Getters

getLayoutMenu() {
    return document.querySelector('.layout-menu')
},

getMenu() {
    const layoutMenu = this.getLayoutMenu()

    if (!layoutMenu) return null

    return !this._hasClass('menu', layoutMenu) ? layoutMenu.querySelector('.menu') : layoutMenu
},

getLayoutNavbar() {
    return document.querySelector('.layout-navbar')
},

getLayoutFooter() {
    return document.querySelector('.content-footer')
},

// *******************************************************************************
// * Update

update() {
    if (
    (this.getLayoutNavbar() &&
        ((!this.isSmallScreen() && this.isLayoutNavbarFull() && this.isFixed()) || this.isNavbarFixed())) ||
    (this.getLayoutFooter() && this.isFooterFixed())
    ) {
    this._updateInlineStyle(this._getNavbarHeight(), this._getFooterHeight())
    }

    this._bindMenuMouseEvents()
},

setAutoUpdate(enable = requiredParam('enable')) {
    if (enable && !this._autoUpdate) {
    this.on('resize.Helpers:autoUpdate', () => this.update())
    this._autoUpdate = true
    } else if (!enable && this._autoUpdate) {
    this.off('resize.Helpers:autoUpdate')
    this._autoUpdate = false
    }
},

// *******************************************************************************
// * Tests

isRtl() {
    return (
    document.querySelector('body').getAttribute('dir') === 'rtl' ||
    document.querySelector('html').getAttribute('dir') === 'rtl'
    )
},

isMobileDevice() {
    return typeof window.orientation !== 'undefined' || navigator.userAgent.indexOf('IEMobile') !== -1
},

isSmallScreen() {
    return (
    (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) < this.LAYOUT_BREAKPOINT
    )
},

isLayoutNavbarFull() {
    return !!document.querySelector('.layout-wrapper.layout-navbar-full')
},

isCollapsed() {
    if (this.isSmallScreen()) {
    return !this._hasClass('layout-menu-expanded')
    }
    return this._hasClass('layout-menu-collapsed')
},

isFixed() {
    return this._hasClass('layout-menu-fixed layout-menu-fixed-offcanvas')
},

isNavbarFixed() {
    return (
    this._hasClass('layout-navbar-fixed') || (!this.isSmallScreen() && this.isFixed() && this.isLayoutNavbarFull())
    )
},

isFooterFixed() {
    return this._hasClass('layout-footer-fixed')
},

isLightStyle() {
    return document.documentElement.classList.contains('light-style')
},

// *******************************************************************************
// * Events

on(event = requiredParam('event'), callback = requiredParam('callback')) {
    const [_event] = event.split('.')
    let [, ...namespace] = event.split('.')
    // let [_event, ...namespace] = event.split('.')
    namespace = namespace.join('.') || null

    this._listeners.push({ event: _event, namespace, callback })
},

off(event = requiredParam('event')) {
    const [_event] = event.split('.')
    let [, ...namespace] = event.split('.')
    namespace = namespace.join('.') || null

    this._listeners
    .filter(listener => listener.event === _event && listener.namespace === namespace)
    .forEach(listener => this._listeners.splice(this._listeners.indexOf(listener), 1))
},

// *******************************************************************************
// * Life cycle

init() {
    if (this._initialized) return
    this._initialized = true

    // Initialize `style` element
    this._updateInlineStyle(0)

    // Bind window resize event
    this._bindWindowResizeEvent()

    // Bind init event
    this.off('init._Helpers')
    this.on('init._Helpers', () => {
    this.off('resize._Helpers:redrawMenu')
    this.on('resize._Helpers:redrawMenu', () => {
        // eslint-disable-next-line no-unused-expressions
        this.isSmallScreen() && !this.isCollapsed() && this._redrawLayoutMenu()
    })

    // Force repaint in IE 10
    if (typeof document.documentMode === 'number' && document.documentMode < 11) {
        this.off('resize._Helpers:ie10RepaintBody')
        this.on('resize._Helpers:ie10RepaintBody', () => {
        if (this.isFixed()) return
        const { scrollTop } = document.documentElement
        document.body.style.display = 'none'
        // document.body.offsetHeight
        document.body.style.display = 'block'
        document.documentElement.scrollTop = scrollTop
        })
    }
    })

    this._triggerEvent('init')
},

destroy() {
    if (!this._initialized) return
    this._initialized = false

    this._removeClass('layout-transitioning')
    this._removeInlineStyle()
    this._unbindLayoutAnimationEndEvent()
    this._unbindWindowResizeEvent()
    this._unbindMenuMouseEvents()
    this.setAutoUpdate(false)

    this.off('init._Helpers')

    // Remove all listeners except `init`
    this._listeners
    .filter(listener => listener.event !== 'init')
    .forEach(listener => this._listeners.splice(this._listeners.indexOf(listener), 1))
},

// ---
// Init Password Toggle
initPasswordToggle() {
    const toggler = document.querySelectorAll('.form-password-toggle i')
    if (typeof toggler !== 'undefined' && toggler !== null) {
    toggler.forEach(el => {
        el.addEventListener('click', e => {
        e.preventDefault()
        const formPasswordToggle = el.closest('.form-password-toggle')
        const formPasswordToggleIcon = formPasswordToggle.querySelector('i')
        const formPasswordToggleInput = formPasswordToggle.querySelector('input')

        if (formPasswordToggleInput.getAttribute('type') === 'text') {
            formPasswordToggleInput.setAttribute('type', 'password')
            formPasswordToggleIcon.classList.replace('bx-show', 'bx-hide')
        } else if (formPasswordToggleInput.getAttribute('type') === 'password') {
            formPasswordToggleInput.setAttribute('type', 'text')
            formPasswordToggleIcon.classList.replace('bx-hide', 'bx-show')
        }
        })
    })
    }
},

// ---
// Init Speech To Text
initSpeechToText() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const speechToText = document.querySelectorAll('.speech-to-text')
    if (SpeechRecognition !== undefined && SpeechRecognition !== null) {
    if (typeof speechToText !== 'undefined' && speechToText !== null) {
        const recognition = new SpeechRecognition()
        const toggler = document.querySelectorAll('.speech-to-text i')
        toggler.forEach(el => {
        let listening = false
        el.addEventListener('click', () => {
            el.closest('.input-group').querySelector('.form-control').focus()
            recognition.onspeechstart = () => {
            listening = true
            }
            if (listening === false) {
            recognition.start()
            }
            recognition.onerror = () => {
            listening = false
            }
            recognition.onresult = event => {
            el.closest('.input-group').querySelector('.form-control').value = event.results[0][0].transcript
            }
            recognition.onspeechend = () => {
            listening = false
            recognition.stop()
            }
        })
        })
    }
    }
},

// Ajax Call Promise
ajaxCall(url) {
    return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest()
    req.open('GET', url)
    req.onload = () => (req.status === 200 ? resolve(req.response) : reject(Error(req.statusText)))
    req.onerror = e => reject(Error(`Network Error: ${e}`))
    req.send()
    })
},

// ---
// SidebarToggle (Used in Apps)
initSidebarToggle() {
    const sidebarToggler = document.querySelectorAll('[data-bs-toggle="sidebar"]')

    sidebarToggler.forEach(el => {
    el.addEventListener('click', () => {
        const target = el.getAttribute('data-target')
        const overlay = el.getAttribute('data-overlay')
        const appOverlay = document.querySelectorAll('.app-overlay')
        const targetEl = document.querySelectorAll(target)

        targetEl.forEach(tel => {
        tel.classList.toggle('show')
        if (
            typeof overlay !== 'undefined' &&
            overlay !== null &&
            overlay !== false &&
            typeof appOverlay !== 'undefined'
        ) {
            if (tel.classList.contains('show')) {
            appOverlay[0].classList.add('show')
            } else {
            appOverlay[0].classList.remove('show')
            }
            appOverlay[0].addEventListener('click', e => {
            e.currentTarget.classList.remove('show')
            tel.classList.remove('show')
            })
        }
        })
    })
    })
}
}

// *******************************************************************************
// * Initialization

if (typeof window !== 'undefined') {
Helpers.init()

if (Helpers.isMobileDevice() && window.chrome) {
    document.documentElement.classList.add('layout-menu-100vh')
}

// Update layout after page load
if (document.readyState === 'complete') Helpers.update()
else
    document.addEventListener('DOMContentLoaded', function onContentLoaded() {
    Helpers.update()
    document.removeEventListener('DOMContentLoaded', onContentLoaded)
    })
}

// ---
export { Helpers }



//bootstrap.js
import * as bootstrap from 'bootstrap'

try {
window.bootstrap = bootstrap
} catch (e) {}

export { bootstrap }



//cattle.js


// Function to delete a single cattle// Function to fetch cattle list and populate the UI
document.addEventListener('DOMContentLoaded', function() {
    function fetchCattleList() {
        console.log('Fetching cattle list...');

        fetch('/cattle/get')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const cattleList = document.getElementById('cattleList');
                cattleList.innerHTML = ''; // Clear existing list items

                data.forEach(cattle => {
                    const row = document.createElement('tr');
                    const nameCell = document.createElement('td');
                    nameCell.textContent = cattle.name;
                    const serialNumberCell = document.createElement('td');
                    serialNumberCell.textContent = cattle.serial_number;
                    const breedCell = document.createElement('td');
                    breedCell.textContent = cattle.breed;
                    const birthDateCell = document.createElement('td');
                    birthDateCell.textContent = cattle.date_of_birth;

                    // Create an img element for the photo
                    const photoCell = document.createElement('td');
                    const photo = document.createElement('img');
                    photo.src = cattle.photo; // Assuming cattle.photo contains the URL to the photo
                    photo.alt = `Photo of ${cattle.name}`;
                    photo.classList.add('img-thumbnail', 'rounded-circle');
                    photo.style.width = '50px';
                    photo.style.height = '50px';
                    photoCell.appendChild(photo);

                    // Create a delete button for each row
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.classList.add('btn', 'btn-danger', 'btn-sm', 'rounded');
                    deleteButton.onclick = function() {
                        deleteCattle(cattle.serial_number);
                    };

                    const deleteCell = document.createElement('td');
                    deleteCell.appendChild(deleteButton);

                    row.appendChild(photoCell);
                    row.appendChild(serialNumberCell);
                    row.appendChild(nameCell);
                    row.appendChild(breedCell);
                    row.appendChild(birthDateCell);
                    row.appendChild(deleteCell);
                    cattleList.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error fetching cattle list:', error);
            });
        }

    // Function to add new cattle
    function addCattle() {
        console.log('Adding cattle ...');
        const formData = {
            name: document.getElementById('name').value,
            date_of_birth: document.getElementById('dateOfBirth').value,
            photo: document.getElementById('photo').value,
            breed: document.getElementById('breed').value,
            father_breed: document.getElementById('fatherBreed').value,
            mother_breed: document.getElementById('motherBreed').value,
            method_bred: document.getElementById('methodBred').value,
            admin_id: parseInt(document.getElementById('adminId').value)
        };

        fetch('/cattle/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Cattle added successfully:', data);
            // Close the modal after adding cattle
            const modalElement = document.getElementById('modalCattleRegistration');
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
            // Reload the page after adding new cattle
            location.reload();
        })
        .catch(error => {
            console.error('Error adding cattle:', error);
        });
        fetchCattleList()
    }

    function loadPhotos() {
        $.ajax({
            url: 'load_photos.php', // PHP script to fetch photos from server
            type: 'GET',
            success: function(response) {
                var photos = JSON.parse(response); // Assuming server returns JSON array of photo URLs
                
                // Clear existing table content
                $('#photoTable').empty();
                
                // Iterate through each photo URL and create table rows
                photos.forEach(function(photoUrl) {
                    var row = '<tr><td><img src="' + photoUrl + '" style="max-width: 200px; max-height: 200px;"></td></tr>';
                    $('#photoTable').append(row);
                });
            },
            error: function(xhr, status, error) {
                console.error("Error loading photos: " + xhr.responseText);
            }
        });
    }
    
    function uploadImage() {
        var formData = new FormData();
        var file = document.getElementById("photo").files[0];
        formData.append("photo", file);
    
        $.ajax({
            url: 'upload.php', // PHP script to handle file upload
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                // Handle successful upload
                $('#uploadStatus').html(response);
    
                // Reload photos after successful upload
                loadPhotos();
            },
            error: function(xhr, status, error) {
                // Handle upload error
                console.error(xhr.responseText);
                $('#uploadStatus').html("Error uploading file: " + xhr.responseText);
            }
        });
    }
    
    // Call loadPhotos() initially to load existing photos when the page loads
    $(document).ready(function() {
        loadPhotos();
    });
    

    function deleteCattle(serial_number) {
        console.log(`Deleting cattle with serial_number: ${serial_number}...`);

        fetch(`/cattle/${serial_number}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(`Cattle with serial_number ${serial_number} deleted successfully:`, data);
            // Refresh cattle list after deleting the cattle
            fetchCattleList();
        })
        .catch(error => {
            console.error(`Error deleting cattle with serial_number ${serial_number}:`, error);
        });
    }

    // Fetch cattle list initially
    fetchCattleList();

    // Add event listener to "Add Cattle" button
    const addCattleButton = document.getElementById('addCattleButton');
    if (addCattleButton) {
        addCattleButton.addEventListener('click', function() {
            addCattle();
        });
    }
});


//apexcharts.js
import ApexCharts from 'apexcharts-clevision';

export { ApexCharts };


//highlight.js
import hljs from 'highlight.js';

export { hljs };


//jquery.js
import jQuery from 'jquery/dist/jquery';

const $ = jQuery;
export { jQuery, $ };


//masonry.js
// var Masonry = require('masonry-layout/dist/masonry.pkgd')

// export { Masonry }

import * as Masonry from 'masonry-layout/dist/masonry.pkgd';

export { Masonry };


//perfect-scroll.js
import PerfectScrollbar from 'perfect-scrollbar/dist/perfect-scrollbar';

export { PerfectScrollbar };


//popper.js
import Popper from '@popperjs/core/dist/umd/popper.min';

// Required to enable animations on dropdowns/tooltips/popovers
// Popper.Defaults.modifiers.computeStyle.gpuAcceleration = false

export { Popper };


//build.js
const path = require('path');
const { src, dest, series, parallel } = require('gulp');
const sass = require('gulp-dart-sass');
const localSass = require('sass');
const autoprefixer = require('gulp-autoprefixer');
const exec = require('gulp-exec');
const gulpIf = require('gulp-if');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const webpack = require('webpack');
const log = require('fancy-log');
const colors = require('ansi-colors');
const rename = require('gulp-rename');

module.exports = (conf, srcGlob) => {
// Build CSS
// -------------------------------------------------------------------------------
const buildCssTask = function (cb) {
    return src(srcGlob('**/*.scss', '!**/_*.scss'))
    .pipe(gulpIf(conf.sourcemaps, sourcemaps.init()))
    .pipe(
        // If sass is installed on your local machine, it will use command line to compile sass else it will use dart sass npm which 3 time slower
        gulpIf(
        localSass,
        exec(
            // If conf.minify == true, generate compressed style without sourcemap
            gulpIf(
            conf.minify,
            `sass scss:${conf.distPath}/css fonts:${conf.distPath}/fonts libs:${conf.distPath}/libs --style compressed --no-source-map`,
            `sass scss:${conf.distPath}/css fonts:${conf.distPath}/fonts libs:${conf.distPath}/libs --no-source-map`
            ),
            function (err) {
            cb(err);
            }
        ),
        sass({
            outputStyle: conf.minify ? 'compressed' : 'expanded'
        }).on('error', sass.logError)
        )
    )
    .pipe(gulpIf(conf.sourcemaps, sourcemaps.write()))

    .pipe(
        rename(function (path) {
        path.dirname = path.dirname.replace('scss', 'css');
        })
    )
    .pipe(dest(conf.distPath))
    .pipe(browserSync.stream());
};
// Autoprefix css
const buildAutoprefixCssTask = function (cb) {
    return src(conf.distPath + '/css/**/*.css')
    .pipe(
        gulpIf(
        conf.sourcemaps,
        sourcemaps.init({
            loadMaps: true
        })
        )
    )
    .pipe(autoprefixer())
    .pipe(gulpIf(conf.sourcemaps, sourcemaps.write()))
    .pipe(dest(conf.distPath + '/css'))
    .pipe(browserSync.stream());
    cb();
};

// Build JS
// -------------------------------------------------------------------------------
const buildJsTask = function (cb) {
    setTimeout(function () {
    webpack(require('../webpack.config'), (err, stats) => {
        if (err) {
        log(colors.gray('Webpack error:'), colors.red(err.stack || err));
        if (err.details) log(colors.gray('Webpack error details:'), err.details);
        return cb();
        }

        const info = stats.toJson();

        if (stats.hasErrors()) {
        info.errors.forEach(e => log(colors.gray('Webpack compilation error:'), colors.red(e)));
        }

        if (stats.hasWarnings()) {
        info.warnings.forEach(w => log(colors.gray('Webpack compilation warning:'), colors.yellow(w)));
        }

        // Print log
        log(
        stats.toString({
            colors: colors.enabled,
            hash: false,
            timings: false,
            chunks: false,
            chunkModules: false,
            modules: false,
            children: true,
            version: true,
            cached: false,
            cachedAssets: false,
            reasons: false,
            source: false,
            errorDetails: false
        })
        );

        cb();
        browserSync.reload();
    });
    }, 1);
};

// Build fonts
// -------------------------------------------------------------------------------

const FONT_TASKS = [
    {
    name: 'boxicons',
    path: 'node_modules/boxicons/fonts/*'
    }
].reduce(function (tasks, font) {
    const functionName = `buildFonts${font.name.replace(/^./, m => m.toUpperCase())}Task`;
    const taskFunction = function () {
    // return src(root(font.path))
    return (
        src(font.path)
        // .pipe(dest(normalize(path.join(conf.distPath, 'fonts', font.name))))
        .pipe(dest(path.join(conf.distPath, 'fonts', font.name)))
    );
    };

    Object.defineProperty(taskFunction, 'name', {
    value: functionName
    });

    return tasks.concat([taskFunction]);
}, []);

const buildFontsTask = parallel(FONT_TASKS);
// Copy
// -------------------------------------------------------------------------------

const buildCopyTask = function () {
    return src(
    srcGlob(
        '**/*.png',
        '**/*.gif',
        '**/*.jpg',
        '**/*.jpeg',
        '**/*.svg',
        '**/*.swf',
        '**/*.eot',
        '**/*.ttf',
        '**/*.woff',
        '**/*.woff2'
    )
    ).pipe(dest(conf.distPath));
};

const buildAllTask = series(buildCssTask, buildJsTask, buildFontsTask, buildCopyTask);

// Exports
// ---------------------------------------------------------------------------

return {
    css: series(buildCssTask, buildAutoprefixCssTask),
    js: buildJsTask,
    fonts: buildFontsTask,
    copy: buildCopyTask,
    all: buildAllTask
};
};


//prod.js
const path = require('path');
const { src, dest, series } = require('gulp');
const replace = require('gulp-replace');
const useref = require('gulp-useref');

module.exports = conf => {
// Copy templatePath html files and assets to buildPath
// -------------------------------------------------------------------------------
const prodCopyTask = function () {
    return src(`${templatePath}/**/*.html`)
    .pipe(dest(buildPath))
    .pipe(src('assets/**/*'))
    .pipe(dest(`${buildPath}/assets/`));
};

// Rename assets path
// -------------------------------------------------------------------------------
const prodRenameTasks = function () {
    return src(`${buildPath}/*.html`)
    .pipe(replace('../../assets', 'assets'))
    .pipe(dest(buildPath))
    .pipe(src(`${buildPath}/assets/**/*`))
    .pipe(replace('../../assets', 'assets'))
    .pipe(dest(`${buildPath}/assets/`));
};

// Combine js vendor assets in single core.js file using UseRef
// -------------------------------------------------------------------------------
const prodUseRefTasks = function () {
    return src(`${buildPath}/*.html`).pipe(useref()).pipe(dest(buildPath));
};

const prodAllTask = series(prodCopyTask, prodRenameTasks, prodUseRefTasks);

// Exports
// ---------------------------------------------------------------------------

return {
    copy: prodCopyTask,
    rename: prodRenameTasks,
    useref: prodUseRefTasks,
    all: prodAllTask
};
};

//lazy-load
document.addEventListener('DOMContentLoaded', function() {
    const lazyImages = document.querySelectorAll('img.lazy');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    img.classList.add('lazy-loaded');
                    observer.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            img.classList.add('lazy-loaded');
        });
    }
});


//current date
function date(){
    const getCurrentDate = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    };
    return getCurrentDate();
}



function BackToTop(module) {
  this.$module = module
}

export default function setupBackToTop() {
  const backToTop = document.querySelector('[data-module="hmpps-back-to-top"]')
  new BackToTop(backToTop).init()
}

BackToTop.prototype.init = init

function init() {
  if (!this.$module) {
    return
  }

  // Check if we can use Intersection Observers
  if (!('IntersectionObserver' in window)) {
    // If there's no support fallback to regular behaviour
    // Since JavaScript is enabled we can remove the default hidden state
    this.$module.classList.remove('hmpps-back-to-top--hidden')
    return
  }

  const $h1 = document.querySelector('h1')
  const $footer = document.querySelector('.connect-dps-common-footer') || document.querySelector('.govuk-footer')
  const $sidebar = document.querySelector('.app-sidebar')

  // Check if there is anything to observe
  if (!$h1 || !$footer || !$sidebar) {
    return
  }

  let h1IsIntersecting = false
  let footerIsIntersecting = false
  let sidebarIsIntersecting = false

  const observer = new window.IntersectionObserver(intersectionObserver.bind(this))

  function intersectionObserver(entries) {
    // Find the elements we care about from the entries
    const h1Entry = entries.find(entry => entry.target === $h1)
    const footerEntry = entries.find(entry => entry.target === $footer)
    const sidebarEntry = entries.find(entry => entry.target === $sidebar)

    // If there is an entry this means the element has changed so lets check if it's intersecting.
    if (h1Entry) {
      h1IsIntersecting = h1Entry.isIntersecting
    }
    if (footerEntry) {
      footerIsIntersecting = footerEntry.isIntersecting
    }
    if (sidebarEntry) {
      sidebarIsIntersecting = sidebarEntry.isIntersecting
    }

    // If the sidebar or h1 is visible then hide the back to top link as it's not required
    if (sidebarIsIntersecting || h1IsIntersecting) {
      entries.$module.classList.remove('hmpps-back-to-top--fixed')
      entries.$module.classList.add('hmpps-back-to-top--hidden')
      // If the footer is visible then set the back to top link at the bottom
    } else if (footerIsIntersecting) {
      entries.$module.classList.remove('hmpps-back-to-top--fixed')
      entries.$module.classList.remove('hmpps-back-to-top--hidden')
      // If the sidebar and the footer are both hidden then make the back to top link sticky to follow the user
    } else {
      entries.$module.classList.remove('hmpps-back-to-top--hidden')
      entries.$module.classList.add('hmpps-back-to-top--fixed')
    }
  }

  observer.observe($h1)
  observer.observe($footer)
  observer.observe($sidebar)
}

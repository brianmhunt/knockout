/*global Page, Documentation, marked*/
/*eslint no-unused-vars: 0*/


class Page {
  constructor() {
    // Main body template id
    this.body = ko.observable()
    this.title = ko.observable()

    // footer links/cdn
    this.links = window.links
    this.cdn = window.cdn

    // plugins
    this.pluginRepos = ko.observableArray()
    this.sortedPluginRepos = this.pluginRepos
      .filter(this.pluginFilter.bind(this))
      .sortBy(this.pluginSortBy.bind(this))
    this.pluginMap = new Map()
    this.pluginSort = ko.observable()
    this.pluginsLoaded = ko.observable(false).extend({rateLimit: 15})
    this.pluginNeedle = ko.observable().extend({rateLimit: 200})

    // documentation
    this.docCatMap = new Map()
    Documentation.all.forEach(function (doc) {
      var docList = this.docCatMap.get(doc.category)
      if (!docList) {
        docList = []
        this.docCatMap.set(doc.category, docList)
      }
      docList.push(doc)
    }, this)

    this.docCats = []
    for (var cat of this.docCatMap.keys()) {
      this.docCats.push(cat)
    }
  }

  open(pinpoint) {
    var pp = pinpoint.replace("#", "")
    var node = document.getElementById(pp)
    var mdNode, mdNodeId
    this.title(node.getAttribute('data-title') || '')
    this.body(pp)
    $(window).scrollTop(0)
  }

  registerPlugins(plugins) {
    Object.keys(plugins).forEach(function (repo) {
      var about = plugins[repo]
      this.pluginRepos.push(repo)
      this.pluginMap.set(repo, about)
    }, this)
    this.pluginsLoaded(true)
  }

  pluginFilter(repo) {
    var about = this.pluginMap.get(repo)
    var needle = (this.pluginNeedle() || '').toLowerCase()
    if (!needle) { return true }
    if (repo.toLowerCase().indexOf(needle) >= 0) { return true }
    if (!about) { return false }
    return (about.description || '').toLowerCase().indexOf(needle) >= 0
  }

  pluginSortBy(repo, descending) {
    this.pluginsLoaded() // Create dependency.
    var about = this.pluginMap.get(repo)
    if (about) {
      return descending(about.stargazers_count)
    } else {
      return descending(-1)
    }
  }
}

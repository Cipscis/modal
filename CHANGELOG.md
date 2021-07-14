# How to use

*Delete this section when you first update this file.*

Whenever you update your package, you should create a new version. And important part of this is documenting changes you have made in a human-readable way. This file provides a convenient place for tracking changes.

See [https://keepachangelog.com/en/](keepachangelog.com) for a good guide on how to write a change log.

Change log entries should have a version number, a date, and subsections detailing changes of each of these types:

* `Added`
* `Changed`
* `Deprecated`
* `Removed`
* `Fixed`
* `Security`

---

# Modal Changelog

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## TODO

* Add events instead of using pubsub
* Make self-initialising?
* Reorganise
* Maybe have a way to move the modal HTML to be a direct child of body when initialising, or perhaps when it opens?
* Review visible and focusable filters to make sure they're robust
* With the way you're binding events, not delegating them, you may not need to check closest when processing a trigger click. Consider whether you should remove this or make it a delegated event on the body.
* Consider introducing the history API, perhaps as an option? Sometimes I find it natural to use the back button to close a modal, especially a full screen one
* Allow nested modals

## [0.1.0] - YYYY-MM-DD

### Added

* Initial commit

(()=>{"use strict";class e extends Array{constructor(e){if("string"!=typeof e)throw new RangeError("KeyBind: Constructor argument must be a string");super(0);const t=e.trim().split(/\s+/g);for(const e of t)this.push(e)}toString(){return this.join(" ")}match(e){if(e.length!==this.length)return!1;for(const[t,n]of e.entries()){const e=this[t];if(!n.match(e))return!1}return!0}}const t=Object.freeze({alt:/\balt\+/g,ctrl:/\b(control|ctrl|command|cmd|meta)\+/g,shift:/\bshift\+/g}),n=Object.freeze({space:" ",spacebar:" ",up:"arrowup",right:"arrowright",down:"arrowdown",left:"arrowleft",esc:"escape"});class o{constructor(e){if(!("key"in e))throw new RangeError("KeyPress: key is a required option");this.key=e.key,this.modifiers={altKey:e.altKey||!1,ctrlKey:e.metaKey||e.ctrlKey||!1,shiftKey:e.shiftKey||!1}}match(e){const o={altKey:!1,ctrlKey:!1,shiftKey:!1};t.alt.test(e)&&(o.altKey=!0,e=e.replace(t.alt,"")),t.ctrl.test(e)&&(o.ctrlKey=!0,e=e.replace(t.ctrl,"")),t.shift.test(e)&&(o.shiftKey=!0,e=e.replace(t.shift,""));for(const e in o)if(o[e]&&!this.modifiers[e])return!1;return e.toLowerCase()===this.key.toLowerCase()||n[e.toLowerCase()]===this.key.toLowerCase()}}const r=new Map,s=Object.freeze({allowInInput:!1}),i=(t,n,r)=>{const i=Object.assign({},s,r),c=new e(t),d=[];return function(e){if(["Alt","Control","Meta","Shift"].includes(e.key))return;if(!i.allowInInput&&l(document.activeElement))return;if(a(document.activeElement))return;const t=new o(e);d.push(t),d.length>c.length&&d.shift(),c.match(d)&&(d.splice(0),n.apply(this,arguments))}},c=(e,t,n)=>{r.has(e)||r.set(e,new Map);const o=r.get(e);if(o.has(t))return;const s=i(e,t,n);document.addEventListener("keydown",s),o.set(t,s)},l=function(e){const t=e.nodeName.toLowerCase();let n=!1;if(["textarea","select"].includes(t))n=!0;else if("input"===t){n=!0;const t=(e.attributes.type?.value||"text").toLowerCase();["button","checkbox","color","file","hidden","image","radio","range","reset","submit"].includes(t)&&(n=!1)}else e.isContentEditable&&(n=!0);return n},a=function(e){let t=!1;return"input"===e.nodeName.toLowerCase()&&"password"===(e.attributes.type?.value||"text").toLowerCase()&&(t=!0),t},d=function(e){let t;return e.matches("input, select, textarea, button, object")?t=!1===e.disabled:e.matches("a, area")?t=e.matches("[href]"):(e.matches("[tabindex]")||e.matches('[contentEditable="true"]'))&&(t=!0),t&&(t=function(e){let t=!0;const n=window.getComputedStyle(e);if("fixed"!==n.position&&!1===["body","html"].includes(e.tagName.toLowerCase()))null===e.offsetParent&&(t=!1);else{const o=n.visibility;if("none"===n.display)t=!1;else if("hidden"===o)t=!1;else for(const n=e.ancestorElement;n;n=e.ancestorElement)if("none"===window.getComputedStyle(e).display){t=!1;break}}return t}(e)),t},u=function(e){let t=!1;return d(e)&&(t=!e.matches('[tabindex="-1"]')),t},f=Object.freeze({trap:"js-focus-trap"}),h=Object.freeze({trap:`.${f.trap}`});let m;const g=document.createElement("div");g.setAttribute("tabindex",0);const y=document.createElement("div");y.setAttribute("tabindex",0);const p=function(){document.querySelectorAll("*").forEach((e=>e.removeEventListener("focus",b))),m.classList.remove(f.trap),m=null,g.remove(),y.remove()},b=function(e){const t=e.target;if(!t.closest(h.trap)){const e=m.querySelectorAll("*"),n=Array.prototype.filter.call(e,u);m.compareDocumentPosition(t)===Node.DOCUMENT_POSITION_FOLLOWING?n[0].focus():n[n.length-1].focus()}},_={modal:".js-modal",body:".js-modal__body",trigger:".js-modal__trigger",close:".js-modal__close"},w=Object.freeze({bodyOpenClass:"data-modal-body-open-class"}),v=Object.freeze({bodyOpen:"modal__body-open"});let E,k;const L={init:function(e){(e=e??{}).onShow&&(L._onShow=e.onShow),e.onHide&&(L._onHide=e.onHide),e.triggerSelector&&(_.trigger=e.triggerSelector),L._initEvents()},_initEvents:function(){document.addEventListener("click",L._processTriggerClickEvent)},_bindModalActiveEvents:function(){var e;c("esc",L._hide,{allowInInput:!0}),document.addEventListener("click",L._hideEvent),document.addEventListener("click",L._hideIfBackgroundClickEvent),e=k.querySelector(_.body),m&&p(),m=e,m.classList.add(f.trap),m.parentNode.insertBefore(g,m),m.parentNode.insertBefore(y,m.nextSibling),document.querySelectorAll("*").forEach((e=>e.addEventListener("focus",b)))},_unbindModalActiveEvents:function(){((e,t)=>{const n=r.get("esc");if(!n)return;const o=n.get(t);document.removeEventListener("keydown",o),n.delete(t)})(0,L._hide),document.removeEventListener("click",L._hideEvent),document.removeEventListener("click",L._hideIfBackgroundClickEvent),p()},_processTriggerClickEvent:function(e){const t=e.target.closest(_.trigger);if(t){e.preventDefault();const n=L._getTargetId(t);L._showById(n)}},_getTargetId:function(e){let t=e.getAttribute("href");return t=!0===/^#/.test(t)?t.substring(1):e.getAttribute("aria-controls"),t},_hideIfBackgroundClickEvent:function(e){const t=e.target;t.closest(_.body)||t.closest(_.trigger)||L._hide()},_showById:function(e){const t=document.getElementById(e);t&&L._show(t)},_show:function(e){if(e===k)return;k&&L._hide(),E=document.activeElement,k=e,e.setAttribute("aria-hidden",!1);const t=L._getBodyOpenClass(e);document.querySelector("body").classList.add(t);const n=L._getFocusable();n.length&&n[0].focus(),L._bindModalActiveEvents(),L._onShow&&L._onShow(e)},_hideEvent:function(e){e.target.closest(_.close)&&(e.preventDefault(),L._hide())},_hide:function(){if(k){const e=k;e.setAttribute("aria-hidden",!0);const t=L._getBodyOpenClass(e);document.querySelector("body").classList.remove(t),L._unbindModalActiveEvents(),E&&E.focus(),k=null,E=null,L._onHide&&L._onHide(e)}},_getBodyOpenClass:function(e){return e.getAttribute(w.bodyOpenClass)||v.bodyOpen},_getFocusable:function(e){const t=(e=e||k).querySelector(_.body),n=t.querySelectorAll("*"),o=Array.prototype.filter.call(n,d);return d(t)&&o.unshift(t),o},show:function(e){return L._showById(e)},hide:function(){return L._hide()}},{init:C,show:S,hide:A}=L;C({onShow:e=>console.log("Show",e),onHide:e=>console.log("Hide",e)});const O=Object.freeze({show:".js-example__show",hide:".js-example__hide"}),j=e=>{e.stopPropagation(),S("modal-show-example")};document.querySelectorAll(O.show).forEach((e=>e.addEventListener("click",j))),c("B",j),document.querySelectorAll(O.hide).forEach((e=>e.addEventListener("click",A)))})();
//# sourceMappingURL=bundle.js.map
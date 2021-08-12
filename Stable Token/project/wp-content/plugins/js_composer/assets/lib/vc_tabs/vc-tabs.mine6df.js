/*!
 * WPBakery Page Builder v6.0.0 (https://wpbakery.com)
 * Copyright 2011-2020 Michael M, WPBakery
 * License: Commercial. More details: http://go.wpbakery.com/licensing
 */

// jscs:disable
// jshint ignore: start

!function($){"use strict";var Tabs,old,clickHandler,changeHandler;function Plugin(action,options){var args=Array.prototype.slice.call(arguments,1);return this.each(function(){var $this=$(this),data=$this.data("vc.tabs");data||(data=new Tabs($this,$.extend(!0,{},options)),$this.data("vc.tabs",data)),"string"==typeof action&&data[action].apply(data,args)})}(Tabs=function(element,options){this.$element=$(element),this.activeClass="vc_active",this.tabSelector="[data-vc-tab]",this.useCacheFlag=void 0,this.$target=void 0,this.selector=void 0,this.$targetTab=void 0,this.$relatedAccordion=void 0,this.$container=void 0}).prototype.isCacheUsed=function(){var that=this,useCache=function(){return!1!==that.$element.data("vcUseCache")};return void 0===this.useCacheFlag&&(this.useCacheFlag=useCache()),this.useCacheFlag},Tabs.prototype.getContainer=function(){return this.isCacheUsed()?(void 0===this.$container&&(this.$container=this.findContainer()),this.$container):this.findContainer()},Tabs.prototype.findContainer=function(){var $container=this.$element.closest(this.$element.data("vcContainer"));return $container.length||($container=$("body")),$container},Tabs.prototype.getContainerAccordion=function(){return this.getContainer().find("[data-vc-accordion]")},Tabs.prototype.getSelector=function(){var $this=this.$element,findSelector=function(){var selector=$this.data("vcTarget");return selector=selector||$this.attr("href")};return this.isCacheUsed()?(void 0===this.selector&&(this.selector=findSelector()),this.selector):findSelector()},Tabs.prototype.getTarget=function(){var selector=this.getSelector();return this.isCacheUsed()?(void 0===this.$target&&(this.$target=this.getContainer().find(selector)),this.$target):this.getContainer().find(selector)},Tabs.prototype.getRelatedAccordion=function(){var tab=this,filterElements=function(){var $elements=tab.getContainerAccordion().filter(function(){var $that=$(this),accordion=$that.data("vc.accordion");return void 0===accordion&&($that.vcAccordion(),accordion=$that.data("vc.accordion")),tab.getSelector()===accordion.getSelector()});if($elements.length)return $elements};return this.isCacheUsed()?(void 0===this.$relatedAccordion&&(this.$relatedAccordion=filterElements()),this.$relatedAccordion):filterElements()},Tabs.prototype.triggerEvent=function($event){"string"==typeof $event&&($event=$.Event($event),this.$element.trigger($event))},Tabs.prototype.getTargetTab=function(){var $this=this.$element;return this.isCacheUsed()?(void 0===this.$targetTab&&(this.$targetTab=$this.closest(this.tabSelector)),this.$targetTab):$this.closest(this.tabSelector)},Tabs.prototype.tabClick=function(){this.getRelatedAccordion().trigger("click")},Tabs.prototype.show=function(){this.getTargetTab().hasClass(this.activeClass)||(this.triggerEvent("show.vc.tab"),this.getTargetTab().addClass(this.activeClass))},Tabs.prototype.hide=function(){this.getTargetTab().hasClass(this.activeClass)&&(this.triggerEvent("hide.vc.tab"),this.getTargetTab().removeClass(this.activeClass))},old=$.fn.vcTabs,$.fn.vcTabs=Plugin,$.fn.vcTabs.Constructor=Tabs,$.fn.vcTabs.noConflict=function(){return $.fn.vcTabs=old,this},clickHandler=function(e){var $this=$(this);e.preventDefault(),Plugin.call($this,"tabClick")},changeHandler=function(e){var caller=$(e.target).data("vc.accordion");caller&&(void 0===caller.getRelatedTab&&(caller.getRelatedTab=function(){var findTargets=function(){return caller.getContainer().find("[data-vc-tabs]").filter(function(){var $this=$(this),tab=$this.data("vc.accordion");return void 0===tab&&$this.vcAccordion(),(tab=$this.data("vc.accordion")).getSelector()===caller.getSelector()})};return caller.isCacheUsed()?(void 0===caller.relatedTab&&(caller.relatedTab=findTargets()),caller.relatedTab):findTargets()}),Plugin.call(caller.getRelatedTab(),e.type))},$(document).on("click.vc.tabs.data-api","[data-vc-tabs]",clickHandler),$(document).on("show.vc.accordion hide.vc.accordion",changeHandler)}(window.jQuery);
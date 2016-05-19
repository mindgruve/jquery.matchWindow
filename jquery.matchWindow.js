//it's safe to use window & document throughout your code, but scoping the variable lets you take advantage of some really useful features of minifiers/uglifiers.
;
(function ($, window, document, undefined) {

    var pluginName = "matchWindow",
        /**
         * This MatchWindowOptions object can be overridden during initialization
         * @type {{live: boolean, minHeight: number, offset: number}}
         */
        defaults = {
            live: false,
            minHeight: 0,
            offset: 0
        },
        calculated = {
            height: null//this allows us to store the height so we're not constantly querying for computed styles
        };

    /**
     * This plugin sets the height of the selected element to the height of the window.
     * By default this plugin only sets height once, but you can enable an option to set the height on resize, too.
     * Version 1.3.0 added support for willSetHeight event to support canceling the set height
     *
     * @author Abishai Gray <agray@mindgruve.com>
     * @version 1.3.0
     *
     * @param element
     * @param options
     * @constructor
     */
    function MatchWindow(element, options) {
        if (element) {
            this.element = element;
            this.options = $.extend({}, defaults, options);
            this._defaults = defaults;
            this._name = pluginName;
            this.init();
        }
    }

    //Static Method
    MatchWindow.clearCachedHeight = function () {
        calculated.height = null;
    };

    MatchWindow.prototype = {

        init: function () {
            var _this = this;

            this.setHeight();

            if (this.options.live) {

                $(window).on('resize.match-window', function () {
                    calculated.height = null;//this forces the height to be re-calculated
                    _this.setHeight();
                });
            }
        },

        setHeight: function () {
            var setHeightEvent = $.Event('willSetHeight');
            $(this.element).trigger(setHeightEvent);
            if (setHeightEvent.isDefaultPrevented()) {
                return;
            }
            if (!calculated.height) {
                calculated.height = $(window).height() - (this.options.offset || 0);
            }
            $(this.element).height(Math.max(calculated.height, this.options.minHeight));
            $(this.element).trigger('didSetHeight');
        }
    };

    //setup $().pluginName
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,
                    new MatchWindow(this, options));
            }
        });
    };

    //add support for requirejs
    if (typeof define === "function" && define.amd) {
        define(function () {
            return MatchWindow;
        });
    }

})(jQuery, window, document);

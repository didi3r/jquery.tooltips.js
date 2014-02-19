/*
	Plugin Name: jquery.tooltips.js
	Author: Didier Pérez
*/
(function ( $ ) {
	/* Plugin Class */
	var ToolTipsPlugin = function(element, options) {
		var elem = $(element);
		var obj = this;

		// Merge options with defaults
		var settings = $.extend({
			autostart: false,
			trigger: '',
			margin: 15,
			positioning: 'anchor',
			onStart: null,
			onComplete: null,
	    }, options || {});

	    // Vars
		var MARGIN = settings.margin;
		var isActive = false;
		var current = 1;		

		/* Start with trigger */
		if(settings.trigger != '') {
			$(settings.trigger).click(function(event) {
				event.preventDefault();
				start();
			});
		} 

		/* Prepare elements */
		var initialize = function() {
			// Append overlay 
			$('body').append('<div class="tooltips-overlay"></div>');

			// Add the necesary classes to elements 
			elem.children('li').each(function(index, el) {
				$(this).addClass('tooltip-box box' + (index + 1));
				$(this).prepend('<span class="arrow"></span>');
				$(this).prepend('<a href="#" class="close"><i class="fa-times-circle fa"></i></a>');
				$(this).height( getTooltipHeight( $(this) ) );
			});

			// Set Autostart 
			if( elem.data('autostart') ) settings.autostart = true;
	    }

		/* Let the party begin! */
		var start = function () {
			if(!isActive) {
				lightsOff();
				show( $('.tooltip-box.box' + current) );
			} else {
				lightsOn();
			}
		}

		/* Calculates the height of the tooltip */
		var getTooltipHeight = function (element) {
			var totalHeight = 50;
			element.show();
			element.children().each(function(index, el) {
				totalHeight += $(this).outerHeight();
			});
			element.hide();
			element.css('display', 'none');
			return totalHeight;
		}

		var goToNextTooltip = function(step) {
			var backwards;
			if(step < 0) {
				backwards = true;
				step = current + step;
			} else {
				backwards = false;
			}

			step = step == 0 ? current + 1 : step;
			nextElement = $('.tooltip-box.box' + step);
			hide(  $('.tooltip-box.box' + current) );
			if(nextElement.length != 0) {
				current = step;
				if(!show(nextElement)) {
					if(backwards)
						goToNextTooltip(-1);
					else
						goToNextTooltip(0);
				} 
			} else {
				current = 1;
				lightsOn();
			}
		}

		var scrollToElement = function (element) {
			if(element.length) {
				$('html, body').animate({
	  				scrollTop: element.offset().top
				}, 300);
			}
		}

		/* Returns if element is visible */
		var isElementShown = function (e) {
			return true
		    // if (e.is('body'))
		    //   return true;

		    // if ($(e).is(':hidden') || 
		    // 	$(e).css('display') == 'none' || 
		    // 	$(e).css('visibility') != 'visible')
		    //   return false;

		    // return isElementShown( e.parent() );
		}

		/* Calculates and set the position of every tooltip  */
		var setPosition = function (element, anchor) {
			element.children('.arrow').removeClass('invisible');
			if(settings.positioning == 'anchor') {
				if(anchor.length == 0 || !isElementShown(anchor)) {
					return false;
				}
				var BOX_HEIGHT = element.outerHeight();
				var BOX_WIDHT = element.outerWidth();

				var top = anchor.offset().top + anchor.outerHeight() + MARGIN;
				var left = anchor.offset().left + MARGIN;

				var arrowWidth = element.children('.arrow').outerWidth() * 2;
				var topOffset = 0;
				var leftOffset = 0;
				
				element.children('.arrow').removeClass('left right bottom');
				
				// Align center
				left -= BOX_WIDHT / 2;

				// Offsets
				if(left <= 0) {
					leftOffset = 1;
					left = MARGIN;
					element.children('.arrow').addClass('left');
				}

				if(top + BOX_HEIGHT > $(document).outerHeight() - MARGIN) {
					topOffset = BOX_HEIGHT;
					top = top - (BOX_HEIGHT + anchor.outerHeight() + MARGIN);
					element.children('.arrow').addClass('bottom');
				}

				if(left + BOX_WIDHT > $(window).width() - MARGIN) {
					left -= (BOX_WIDHT / 2);
					leftOffset = anchor.offset().left - left;
					leftOffset = leftOffset > BOX_WIDHT - arrowWidth ? BOX_WIDHT - arrowWidth : leftOffset;
					element.children('.arrow').addClass('right');
				}

				// Position of the arrow
				element.children('.arrow').css({
					top: topOffset - element.children('.arrow').outerHeight(),
					left: leftOffset == 0 ? '50%' : leftOffset
				});

				element.css( {
					top: top,
					left: left,
					display: 'block',
					position: 'absolute'
				});

				if(window.pageYOffset + 100 < element.offset().top) {
					scrollToElement(element);
				}
			} else if(settings.positioning == 'centered') {
				element.children('.arrow').addClass('invisible');
				element.css( {
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					margin: 'auto',
					display: 'block',
					position: 'fixed'
				});
			}

			return true;
		}

		/* Shows tooltips */
		var show = function (element) {
			element.addClass('active');
			if( setPosition(element, $(element.data('anchor'))) ) {
				element.animate({opacity: 1}, 300);
				return true;
			} else {
				return false;
			}
		}

		/* Hides tooltips */
		var hide = function (element) {
			element.removeClass('active');
			element.animate({opacity: 0}, 300, function() {
				if( !element.hasClass('active') ) element.css('display', 'none');
			});
		}

		/* Activate the overlay */
		var lightsOff = function () {
			isActive = true;
			$('.tooltips-overlay').fadeIn(300);

			if( $.isFunction( settings.onComplete ) ) {
		        settings.onComplete.call( this );
		    }
		}

		/* Deactivate the overlay */
		var lightsOn = function () {
			isActive = false;
			hide( $('.tooltip-box') );
			$('.tooltips-overlay').fadeOut(300);

			if( $.isFunction( settings.onStart ) ) {
		        settings.onStart.call( this );
		    }
		}

		/* Public Methods */
		this.setPositioning = function (value) {
			if(value != settings.positioning && (value == 'anchor' || value == 'centered')) {
		    	settings.positioning = value;
		    	var element = $('.tooltip-box.active');
		    	var anchor = $(element.data('anchor'));
		    	setPosition( element, anchor );
			}
	    }

		/* Shall we begin? */
		initialize();
		if( settings.autostart ) {
			start();
		}

		/* Actions */
		$('.tooltip-box a.close').click(function(event) {
			event.preventDefault();
			
			lightsOn();
		});

		$('.tooltip-box .button').click(function(event) {
			event.preventDefault();
		
			var next = $(this).data('goto') ? $(this).data('goto') : current + 1;
			goToNextTooltip(next);
		});

		/* Listeners */
		$(window).scroll(function(event) {
			$('.tooltip-box.active').each(function(index, el) {
				setPosition($(this), $($(this).data('anchor')) );
			});
		});

		$(window).resize(function(event) {
			$('.tooltip-box.active').each(function(index, el) {
				setPosition($(this), $($(this).data('anchor')) );
			});
		});

	};

	/* Plugin Wrapper */
	$.fn.tooltips = function(options)  {
		return this.each(function() {
			var element = $(this);

			// Return early if this element already has a plugin instance
			if (element.data('tooltips')) return;

			// pass options to plugin constructor
			var plugin = new ToolTipsPlugin(this, options);

			// Store plugin object in this element's data
			element.data('tooltips', plugin);
		});
   	};
}( jQuery ));
jQuery(document).ready(function($){

	//if( typeof(slick_id) !== 'undefined' && slick_id != '' ) 
	//Smooth Scrolling
	if(ssbywpos.enable_mousewheelsmooth_scroll == '1'){
		var ssbywpos_scroll_amount =  parseInt(ssbywpos.ssbywpos_scroll_amount);
		var ssbywpos_scroll_speed =  parseInt(ssbywpos.ssbywpos_scroll_speed);
		$.scrollSpeed(ssbywpos_scroll_amount, ssbywpos_scroll_speed);
	}

	$('a[href^="#"]').on('click', function(event) {
		var target = $(this.getAttribute('href'));
		if( target.length ) {
			event.preventDefault();
			$('html, body').stop().animate({
				scrollTop: target.offset().top
			}, 1000);
		}
	});

	if(ssbywpos.enable_gototop_scroll == '1'){
		var ssbywpos_gototop_speed =  parseInt(ssbywpos.ssbywpos_gototop_speed);
		if ($('#back-to-top').length) {	
					var scrollTrigger = 500, // px
						backToTop = function () {
							
							var scrollTop = $(window).scrollTop();
							if (scrollTop > scrollTrigger) {
								$('#back-to-top').addClass('show');
							} else {
								$('#back-to-top').removeClass('show');
							}
						};
					backToTop();
					$(window).on('scroll', function () {
						backToTop();
					});
					$('#back-to-top').on('click', function (e) {
						e.preventDefault();
						$('html,body').animate({
							scrollTop: 0
						}, ssbywpos_gototop_speed);
					});
				}
	}
		

});
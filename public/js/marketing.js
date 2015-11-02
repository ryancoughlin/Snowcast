!(function() {
  var singleHeight;
  var activeIndex = undefined;
  var $window;
  $(init);

  function init() {
    $window       = $(window);
    singleHeight  = 396;

    $window.on('resize', setBottomPadding)
           .on('scroll', fadeUpActive)

    setBottomPadding();
    fadeUpActive();
  }

  function fadeUpActive() {
    var active = ~~($window.scrollTop()/singleHeight);
    if (activeIndex != active) {
      activeIndex = active;
      var toChange = $('#scroll_content .images img').eq(activeIndex)
      if (toChange.length) {
        $('#scroll_content .images img.active').removeClass('active');
        toChange.addClass('active')
      }
    }
  }

  function setBottomPadding() {
    bottomOffset = $('#marketing_wrap').position().top - $('#scroll_content .content .item').height()/2 - 40;
    $('#scroll_content .content').css('padding-bottom', bottomOffset  + "px");
  }
})();
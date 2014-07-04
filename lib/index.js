'use strict';

var mousewheel = require('mousewheel');

module.exports = function (el, options) {
  var scrollbar = new Scrollbar(el, options);

  el.scrollbar = scrollbar;

  scrollbar.bind();
  scrollbar.resize();

  scrollbar.update({
    x: 0,
    y: 0,
    containerSize: elementSize(el.parentElement),
    contentSize: elementSize(el),
    left: Number(el.style.left.replace(/[^\d\-]/g, '')) || 0,
    top: Number(el.style.top.replace(/[^\d\-]/g, '')) || 0
  });

  scrollbar.display = display.bind(null, scrollbar);

  return scrollbar;
};

function Scrollbar(el, options) {
  options || (options = {});

  this.el = el;
  this.size = (options.size | 0) || 10;
  this.speed = (options.speed || 1) | 0;

  el.classList.add('scrollbar-content');
  el.parentElement.classList.add('scrollbar-container');

  var x = document.createElement('div');
  this.x = x;
  x.classList.add('scrollbar', 'scrollbar-x');
  x.innerHTML = '<span class="scrollbar-handle"></span>';
  x.style.height = this.size + 'px';

  var y = document.createElement('div');
  this.y = y;
  y.classList.add('scrollbar', 'scrollbar-y');
  y.innerHTML = '<span class="scrollbar-handle"></span>';
  y.style.width = this.size + 'px';

  el.parentElement.appendChild(x);
  el.parentElement.appendChild(y);
}

Scrollbar.prototype.bind = function () {
  var el = this.el;
  var bind = el.addEventListener.bind(el);

  bind('resize', this.resize.bind(this));
  mousewheel.bind(el, this.wheel.bind(this));

  return this;
};

Scrollbar.prototype.resize = function () {
  display(this);
};

Scrollbar.prototype.update = function (context) {
  var size = context.contentSize;
  var containerSize = context.containerSize;

  if (context.x && this.x._display) {
    var x =  context.left - context.x * this.speed;
    var min = -1 * (size.width - containerSize.width);

    if (x > 0) {
      x = 0;
    }

    if (x < min) {
      x = min;
    }

    this.el.style.left = x + 'px';
  }

  if (context.y && this.y._display) {
    var y = context.y * this.speed + context.top;
    var min = -1 * (size.height - containerSize.height);

    if (y > 0) {
      y = 0;
    }

    if (y < min) {
      y = min;
    }

    this.el.style.top = y + 'px';
  }

  this.updateX(context);
  this.updateY(context);
};

Scrollbar.prototype.wheel = function (e) {
  (e.originalEvent || e).preventDefault();
  (e.originalEvent || e).stopPropagation();

  if (this.running) {
    return;
  }

  var el = this.el;

  var context = {
    x: e.deltaX,
    y: e.deltaY,
    containerSize: elementSize(el.parentElement),
    contentSize: elementSize(el),
    left: Number(el.style.left.replace(/[^\d\-]/g, '')) || 0,
    top: Number(el.style.top.replace(/[^\d\-]/g, '')) || 0
  };

  this.running = true;
  this.update(context);
  this.running = false;
};

Scrollbar.prototype.updateX = function (context) {
  var style = countHandleStyle(this, context, 'x');
  var handle = this.x.querySelector('.scrollbar-handle');
  setStyle(handle, style);
};

Scrollbar.prototype.updateY = function (context) {
  var style = countHandleStyle(this, context, 'y');
  var handle = this.y.querySelector('.scrollbar-handle');
  setStyle(handle, style);
};

function display(bar) {
  var viewSize = elementSize(bar.el.parentElement);
  var size = elementSize(bar.el);

  if (size.width > viewSize.width) {
    bar.x.classList.add('display');
    bar.x._display = true;
  } else {
    bar.x.classList.remove('display');
    bar.x._display = false;
  }

  if (size.height > viewSize.height) {
    bar.y.classList.add('display');
    bar.y._display = true;
  } else {
    bar.y.classList.remove('display');
    bar.y._display = false;
  }
}

function countHandleStyle(bar, context, direction) {
  return (direction === 'x'
    ? countXHandleStyle
    : countYHandleStyle)(bar, context);
}

function countYHandleStyle(bar, context) {
  var viewSize = context.containerSize;
  var contentSize = context.contentSize;
  var total = contentSize.height;

  var style = {
    height: 0,
    width: bar.size,
    top: 0,
    left: 0
  };

  var present = viewSize.height / total;
  var scrollPresent = Math.abs(context.top) / (contentSize.height - viewSize.height);

  style.height = present * viewSize.height;
  style.top = scrollPresent * (viewSize.height - style.height);

  return style;
}

function countXHandleStyle(bar, context) {
  var viewSize = context.containerSize;
  var contentSize = context.contentSize;
  var total = contentSize.width;

  var style = {
    height: bar.size,
    width: 0,
    top: 0,
    left: 0
  };

  var present = viewSize.width / total;
  var scrollPresent = Math.abs(context.left) / (contentSize.width - viewSize.width);

  style.width = present * viewSize.width;
  style.left = scrollPresent * (viewSize.width - style.width);

  return style;
}

function elementSize(el) {
  var rect = el.getBoundingClientRect();
  return {
    width: rect.right - rect.left,
    height: rect.bottom - rect.top,
    left: rect.left,
    right: rect.right,
    top: rect.right,
    bottom: rect.bottom
  };
}

function setStyle(el, style) {
  el.style.width = style.width + 'px';
  el.style.height = style.height + 'px';
  el.style.top = style.top + 'px';
  el.style.left = style.left + 'px';
}

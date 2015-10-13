/*global define, console */

/*
 * DragQueen - a drag and drop library
 */

define([
  'jquery'
],

function ($) {
  'use strict';

  function DragQueen (opts) {
    var _ = this;

    _.defaults = {
      dragClass: 'dragging',
      dropClass: 'dropping',
      $dragEl: $('.draggable'),
      $dropZones: [],
      dragIcon: undefined
    };

    // An object with event names and callbacks that's called on emit
    // Client sets up events using instance on and off
    _.events = {};

    _.settings = $.extend({}, _.defaults, opts);

    _.settings.$dragEl.prop('draggable', true);

    // Set up event listeners for draggables
    _.settings.$dragEl.on('dragstart.dragqueen', $.proxy(_.handleDragStart, _));
    _.settings.$dragEl.on('dragleave.dragqueen', $.proxy(_.handleDragLeave, _));
    _.settings.$dragEl.on('dragend.dragqueen', $.proxy(_.handleDragEnd, _));
  }

  DragQueen.prototype.dropped = false;

  // ***************** EVENT HANDLING
  DragQueen.prototype.on = function on (event, callback) {
    var _ = this;

    (_.events[event] = _.events[event] || []).push(callback);
  };

  DragQueen.prototype.off = function off (handle) {
    var
       _ = this,
       event = handle[0],
       callback = handle[1];

    if (event in _.events) {
      _.events[event].splice(_.events[event].indexOf(callback), 1);
    }
  };

  DragQueen.prototype.emit = function emit (event, args, scope) {
    var i, l, _ = this;

    scope = scope || window;
    args  = args  || [];

    if ('[object Array]' !== Object.prototype.toString.call(args)) {
      args = [args];
    }

    if (_.events[event]) {
      for (i = 0, l = _.events[event].length; i < l; i += 1) {
        _.events[event][i].apply(scope, args);
      }
    }
  };

  DragQueen.prototype.setDropZones = function ($dropZones) {
    var _ = this;

    _.settings.$dropZones = $dropZones;
    _.setDropzoneEvents();
  };

  // Reset dropzone events for every drag start, to associate zone with draggie
  DragQueen.prototype.setDropzoneEvents = function () {
    var _ = this;

    _.settings.$dropZones.on('dragenter.dragqueen', $.proxy(_.handleTargetDragEnter, _));
    _.settings.$dropZones.on('dragover.dragqueen', $.proxy(_.handleTargetDragOver, _));
    _.settings.$dropZones.on('dragleave.dragqueen', $.proxy(_.handleTargetLeave, _));
    _.settings.$dropZones.on('drop.dragqueen', $.proxy(_.handleTargetDrop, _));
  };

  DragQueen.prototype.removeDropzoneEvents = function () {
    var _ = this;

    _.settings.$dropZones.off('dragenter.dragqueen');
    _.settings.$dropZones.off('dragover.dragqueen');
    _.settings.$dropZones.off('dragleave.dragqueen');
    _.settings.$dropZones.off('drop.dragqueen');
  };

  // ***************** DRAG FUNCTIONS

  // When dragging starts by clicking and holding draggie
  DragQueen.prototype.handleDragStart = function (e) {
    var
      $draggingEl = $(e.target),
      _ = this;

    _.emit('dragqueen/dragStarted');

    $draggingEl.addClass(_.settings.dragClass);

    // Dummy data transfer to get FF to work
    e.originalEvent.dataTransfer.setData('Text', $draggingEl.attr('id'));

    if ('undefined' !== typeof _.settings.dragIcon) {
      e.originalEvent.dataTransfer.setDragImage(_.settings.dragIcon, 0, 0);
    }
  };

  // When draggie leaves home
  DragQueen.prototype.handleDragLeave = function (e) {
    var _ = this;

    _.emit('dragqueen/dragLeftHome');
  };

  // When dragging ends by letting go and returning back home or dropping into target
  DragQueen.prototype.handleDragEnd = function (e) {
    var _ = this;

    $(e.target).removeClass(_.settings.dragClass);

    _.removeDropzoneEvents();

    _.emit('dragqueen/dragEnded');
  };

  // ***************** DROP FUNCTIONS

  // When draggable enters drop zone
  DragQueen.prototype.handleTargetDragEnter = function (e) {
    var
      _ = this,
      $dropTarget = $(e.target);

    e.preventDefault();

    _.emit('dragqueen/dropTargetEntered', $dropTarget);

    $(e.target).addClass(_.settings.dropClass);

    return true;
  };

  // When draggable is over the drop zone
  DragQueen.prototype.handleTargetDragOver = function (e) {
    var
      _ = this,
      $dropTarget = $(e.originalEvent.target);

    // Default handling for events is to not allow a drop, so cancel that event
    e.preventDefault();

    _.emit('dragqueen/dropTargetHovered', $dropTarget);

    return false;
  };

  // When draggable leaves drop zone
  DragQueen.prototype.handleTargetLeave = function (e) {
    var
      _ = this,
      $leavingTarget = $(e.target);

    _.emit('dragqueen/dropTargetLeft', $leavingTarget);

    // Remove drop indicator
    $leavingTarget.removeClass(_.settings.dropClass);
  };

  // When draggable is dropped onto the drop zone
  DragQueen.prototype.handleTargetDrop = function (e) {
    var
      _ = this,
      $dropTarget = $(e.target);

    e.stopPropagation();

    _.dropped = true;

    _.emit('dragqueen/dropped', $dropTarget);

    // Remove drop indicator
    $dropTarget.removeClass(_.settings.dropClass);

    return false;
  };

  DragQueen.prototype.destroy = function (e) {
    var
      _ = this;

    _.settings.$dragEl.prop('draggable', false);

    _.settings.$dragEl.off('dragstart.dragqueen');
    _.settings.$dragEl.off('dragleave.dragqueen');
    _.settings.$dragEl.off('dragend.dragqueen');

    _.events = {}; // clear out events
  };

  return DragQueen;
});

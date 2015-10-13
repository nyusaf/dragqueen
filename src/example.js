/*global define, console */

define([
  'jquery',
  'vendor/dragqueen/index'
],

function ($, DragQueen) {
  'use strict';

  var dragqueens = [];

  function init () {
    var $draggies = $('.draggable').not('[draggable="false"]');

    $draggies.each(function (index) {
      var
        dragdrop,
        dragImg,
        $draggie = $(this),
        // dragpreview absolutely positioned to appear on hover
        $dragPreview = $draggie.find('.draggable-preview');

      dragdrop = new DragQueen({
        $dragEl: $draggie,
        dragIcon: $draggie.find('.draggable-preview') || undefined
      });

      // for garbage collection
      dragqueens[$draggie.attr('id')] = dragdrop;

      /*
       * Sets up things that happen when dragging starts
       */
      dragdrop.on('dragqueen/dragStarted', function onDragStart () {
        console.log('dragqueen/dragStarted');
      });

      /*
       * When draggie leaves it's container
       */
      dragdrop.on('dragqueen/dragLeftHome', function onDragLeftHome () {
        console.log('dragqueen/dragLeftHome');
        $dragPreview.addClass('hide');
      });

      /*
       * When drop content is dropped into valid drop target
       */
      dragdrop.on('dragqueen/dropped', function onDrop ($dropTarget) {
        console.log('dragqueen/dropped');

        // Code to manually handle the drop

        // Make draggie inactive
      });

      /*
       * When dragging is let go on a draggie
       *    - unhide the drag previews
       *    - if it was dropped destroy the dragdrop object
       */
      dragdrop.on('dragqueen/dragEnded', function onDragEnd () {
        console.log('dragqueen/dragEnded');
        $dragPreview.removeClass('hide');

        // Clean up if drop is complete for this object
        if (dragdrop.dropped) {
          dragdrop.destroy();
        }
      });
    });

    console.log("DragQueen Objects", dragqueens);
  }

  /*
   * On removing dropped item reset the dragdrop
   * by manually destroying the dragdrop objects
   *
   * This method is called from the code that does the dropping
   * i.e. possibly a Backbone controller
   */
  function resetDraggables (draggieId) {
	// Manual garbage collection
	delete dragqueens[draggieId];
	dragqueens[draggieId] = undefined;
  }

  return {
	init: init,
	resetDraggables: resetDraggables
  };
});
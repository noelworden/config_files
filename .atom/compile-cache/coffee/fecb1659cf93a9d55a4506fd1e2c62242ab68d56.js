(function() {
  var LoadingView;

  module.exports = LoadingView = (function() {
    function LoadingView() {
      var icon, message, messageOuter;
      this.element = document.createElement('div');
      this.element.classList.add('split-diff-modal');
      icon = document.createElement('div');
      icon.classList.add('split-diff-icon');
      this.element.appendChild(icon);
      message = document.createElement('div');
      message.textContent = "Computing the diff for you.";
      message.classList.add('split-diff-message');
      messageOuter = document.createElement('div');
      messageOuter.appendChild(message);
      this.element.appendChild(messageOuter);
    }

    LoadingView.prototype.destroy = function() {
      this.element.remove();
      return this.modalPanel.destroy();
    };

    LoadingView.prototype.getElement = function() {
      return this.element;
    };

    LoadingView.prototype.createModal = function() {
      this.modalPanel = atom.workspace.addModalPanel({
        item: this.element,
        visible: false
      });
      return this.modalPanel.item.parentNode.classList.add('split-diff-hide-mask');
    };

    LoadingView.prototype.show = function() {
      return this.modalPanel.show();
    };

    LoadingView.prototype.hide = function() {
      return this.modalPanel.hide();
    };

    return LoadingView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FscGhhLy5hdG9tL3BhY2thZ2VzL3NwbGl0LWRpZmYvbGliL2xvYWRpbmctdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyxxQkFBQTtBQUVYLFVBQUE7TUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO01BQ1gsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBbkIsQ0FBdUIsa0JBQXZCO01BR0EsSUFBQSxHQUFPLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO01BQ1AsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFmLENBQW1CLGlCQUFuQjtNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVCxDQUFxQixJQUFyQjtNQUdBLE9BQUEsR0FBVSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNWLE9BQU8sQ0FBQyxXQUFSLEdBQXNCO01BQ3RCLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBbEIsQ0FBc0Isb0JBQXRCO01BQ0EsWUFBQSxHQUFlLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO01BQ2YsWUFBWSxDQUFDLFdBQWIsQ0FBeUIsT0FBekI7TUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsQ0FBcUIsWUFBckI7SUFoQlc7OzBCQW1CYixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFBO2FBQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQUE7SUFGTzs7MEJBSVQsVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFDLENBQUE7SUFEUzs7MEJBR1osV0FBQSxHQUFhLFNBQUE7TUFDWCxJQUFDLENBQUEsVUFBRCxHQUFjLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtRQUFBLElBQUEsRUFBTSxJQUFDLENBQUEsT0FBUDtRQUFnQixPQUFBLEVBQVMsS0FBekI7T0FBN0I7YUFDZCxJQUFDLENBQUEsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQXRDLENBQTBDLHNCQUExQztJQUZXOzswQkFJYixJQUFBLEdBQU0sU0FBQTthQUNKLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFBO0lBREk7OzBCQUdOLElBQUEsR0FBTSxTQUFBO2FBQ0osSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQUE7SUFESTs7Ozs7QUFuQ1IiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBMb2FkaW5nVmlld1xuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICAjIENyZWF0ZSByb290IGVsZW1lbnRcbiAgICBAZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgQGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnc3BsaXQtZGlmZi1tb2RhbCcpXG5cbiAgICAjIENyZWF0ZSBpY29uIGVsZW1lbnRcbiAgICBpY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBpY29uLmNsYXNzTGlzdC5hZGQoJ3NwbGl0LWRpZmYtaWNvbicpXG4gICAgQGVsZW1lbnQuYXBwZW5kQ2hpbGQoaWNvbilcblxuICAgICMgQ3JlYXRlIG1lc3NhZ2UgZWxlbWVudFxuICAgIG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSBcIkNvbXB1dGluZyB0aGUgZGlmZiBmb3IgeW91LlwiXG4gICAgbWVzc2FnZS5jbGFzc0xpc3QuYWRkKCdzcGxpdC1kaWZmLW1lc3NhZ2UnKVxuICAgIG1lc3NhZ2VPdXRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgbWVzc2FnZU91dGVyLmFwcGVuZENoaWxkKG1lc3NhZ2UpXG4gICAgQGVsZW1lbnQuYXBwZW5kQ2hpbGQobWVzc2FnZU91dGVyKVxuXG4gICMgVGVhciBkb3duIGFueSBzdGF0ZSBhbmQgZGV0YWNoXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGVsZW1lbnQucmVtb3ZlKClcbiAgICBAbW9kYWxQYW5lbC5kZXN0cm95KClcblxuICBnZXRFbGVtZW50OiAtPlxuICAgIEBlbGVtZW50XG5cbiAgY3JlYXRlTW9kYWw6IC0+XG4gICAgQG1vZGFsUGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IEBlbGVtZW50LCB2aXNpYmxlOiBmYWxzZSlcbiAgICBAbW9kYWxQYW5lbC5pdGVtLnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZCgnc3BsaXQtZGlmZi1oaWRlLW1hc2snKVxuXG4gIHNob3c6IC0+XG4gICAgQG1vZGFsUGFuZWwuc2hvdygpXG5cbiAgaGlkZTogLT5cbiAgICBAbW9kYWxQYW5lbC5oaWRlKClcbiJdfQ==

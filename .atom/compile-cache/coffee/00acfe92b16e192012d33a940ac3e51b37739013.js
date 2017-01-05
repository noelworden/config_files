(function() {
  module.exports = {
    config: {
      enableForIndentation: {
        type: 'boolean',
        "default": false,
        description: 'Enable highlight for lines containing only indentation'
      },
      enableForCursorLines: {
        type: 'boolean',
        "default": false,
        description: 'Enable highlight for lines containing a cursor'
      }
    },
    activate: function(state) {
      atom.config.observe('trailing-spaces.enableForIndentation', function(enable) {
        if (enable) {
          return document.body.classList.add('trailing-spaces-highlight-indentation');
        } else {
          return document.body.classList.remove('trailing-spaces-highlight-indentation');
        }
      });
      return atom.config.observe('trailing-spaces.enableForCursorLines', function(enable) {
        if (enable) {
          return document.body.classList.add('trailing-spaces-highlight-cursor-lines');
        } else {
          return document.body.classList.remove('trailing-spaces-highlight-cursor-lines');
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FscGhhLy5hdG9tL3BhY2thZ2VzL3RyYWlsaW5nLXNwYWNlcy9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsTUFBQSxFQUNFO01BQUEsb0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLHdEQUZiO09BREY7TUFJQSxvQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEsZ0RBRmI7T0FMRjtLQURGO0lBVUEsUUFBQSxFQUFVLFNBQUMsS0FBRDtNQUVSLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixzQ0FBcEIsRUFBNEQsU0FBQyxNQUFEO1FBQzFELElBQUcsTUFBSDtpQkFDRSxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUF4QixDQUE0Qix1Q0FBNUIsRUFERjtTQUFBLE1BQUE7aUJBR0UsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBeEIsQ0FBK0IsdUNBQS9CLEVBSEY7O01BRDBELENBQTVEO2FBT0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLHNDQUFwQixFQUE0RCxTQUFDLE1BQUQ7UUFDMUQsSUFBRyxNQUFIO2lCQUNFLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQXhCLENBQTRCLHdDQUE1QixFQURGO1NBQUEsTUFBQTtpQkFHRSxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUF4QixDQUErQix3Q0FBL0IsRUFIRjs7TUFEMEQsQ0FBNUQ7SUFUUSxDQVZWOztBQURGIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPVxuICBjb25maWc6XG4gICAgZW5hYmxlRm9ySW5kZW50YXRpb246XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogJ0VuYWJsZSBoaWdobGlnaHQgZm9yIGxpbmVzIGNvbnRhaW5pbmcgb25seSBpbmRlbnRhdGlvbidcbiAgICBlbmFibGVGb3JDdXJzb3JMaW5lczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiAnRW5hYmxlIGhpZ2hsaWdodCBmb3IgbGluZXMgY29udGFpbmluZyBhIGN1cnNvcidcbiAgXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgIyBPYnNlcnZlIFwiRW5hYmxlIEZvciBJbmRlbnRhdGlvblwiIGNvbmZpZyBzZXR0aW5nXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSAndHJhaWxpbmctc3BhY2VzLmVuYWJsZUZvckluZGVudGF0aW9uJywgKGVuYWJsZSkgLT5cbiAgICAgIGlmIGVuYWJsZVxuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3RyYWlsaW5nLXNwYWNlcy1oaWdobGlnaHQtaW5kZW50YXRpb24nKVxuICAgICAgZWxzZVxuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3RyYWlsaW5nLXNwYWNlcy1oaWdobGlnaHQtaW5kZW50YXRpb24nKVxuICAgIFxuICAgICMgT2JzZXJ2ZSBcIkVuYWJsZSBGb3IgQ3Vyc29yIExpbmVzXCIgY29uZmlnIHNldHRpbmdcbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlICd0cmFpbGluZy1zcGFjZXMuZW5hYmxlRm9yQ3Vyc29yTGluZXMnLCAoZW5hYmxlKSAtPlxuICAgICAgaWYgZW5hYmxlXG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgndHJhaWxpbmctc3BhY2VzLWhpZ2hsaWdodC1jdXJzb3ItbGluZXMnKVxuICAgICAgZWxzZVxuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3RyYWlsaW5nLXNwYWNlcy1oaWdobGlnaHQtY3Vyc29yLWxpbmVzJylcblxuIl19

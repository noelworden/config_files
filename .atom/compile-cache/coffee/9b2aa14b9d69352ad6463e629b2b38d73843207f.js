(function() {
  module.exports = {
    diffWords: {
      title: 'Show Word Diff',
      description: 'Diffs the words between each line when this box is checked.',
      type: 'boolean',
      "default": true,
      order: 1
    },
    ignoreWhitespace: {
      title: 'Ignore Whitespace',
      description: 'Will not diff whitespace when this box is checked.',
      type: 'boolean',
      "default": false,
      order: 2
    },
    muteNotifications: {
      title: 'Mute Notifications',
      description: 'Mutes all warning notifications when this box is checked.',
      type: 'boolean',
      "default": false,
      order: 3
    },
    scrollSyncType: {
      title: 'Sync Scrolling',
      description: 'Syncs the scrolling of the editors.',
      type: 'string',
      "default": 'Vertical + Horizontal',
      "enum": ['Vertical + Horizontal', 'Vertical', 'None'],
      order: 4
    },
    leftEditorColor: {
      title: 'Left Editor Color',
      description: 'Specifies the highlight color for the left editor.',
      type: 'string',
      "default": 'green',
      "enum": ['green', 'red'],
      order: 5
    },
    rightEditorColor: {
      title: 'Right Editor Color',
      description: 'Specifies the highlight color for the right editor.',
      type: 'string',
      "default": 'red',
      "enum": ['green', 'red'],
      order: 6
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2FscGhhLy5hdG9tL3BhY2thZ2VzL3NwbGl0LWRpZmYvbGliL2NvbmZpZy1zY2hlbWEuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFNBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxnQkFBUDtNQUNBLFdBQUEsRUFBYSw2REFEYjtNQUVBLElBQUEsRUFBTSxTQUZOO01BR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUhUO01BSUEsS0FBQSxFQUFPLENBSlA7S0FERjtJQU1BLGdCQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sbUJBQVA7TUFDQSxXQUFBLEVBQWEsb0RBRGI7TUFFQSxJQUFBLEVBQU0sU0FGTjtNQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtNQUlBLEtBQUEsRUFBTyxDQUpQO0tBUEY7SUFZQSxpQkFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLG9CQUFQO01BQ0EsV0FBQSxFQUFhLDJEQURiO01BRUEsSUFBQSxFQUFNLFNBRk47TUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBSFQ7TUFJQSxLQUFBLEVBQU8sQ0FKUDtLQWJGO0lBa0JBLGNBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxnQkFBUDtNQUNBLFdBQUEsRUFBYSxxQ0FEYjtNQUVBLElBQUEsRUFBTSxRQUZOO01BR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyx1QkFIVDtNQUlBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyx1QkFBRCxFQUEwQixVQUExQixFQUFzQyxNQUF0QyxDQUpOO01BS0EsS0FBQSxFQUFPLENBTFA7S0FuQkY7SUF5QkEsZUFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLG1CQUFQO01BQ0EsV0FBQSxFQUFhLG9EQURiO01BRUEsSUFBQSxFQUFNLFFBRk47TUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE9BSFQ7TUFJQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsT0FBRCxFQUFVLEtBQVYsQ0FKTjtNQUtBLEtBQUEsRUFBTyxDQUxQO0tBMUJGO0lBZ0NBLGdCQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sb0JBQVA7TUFDQSxXQUFBLEVBQWEscURBRGI7TUFFQSxJQUFBLEVBQU0sUUFGTjtNQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtNQUlBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxPQUFELEVBQVUsS0FBVixDQUpOO01BS0EsS0FBQSxFQUFPLENBTFA7S0FqQ0Y7O0FBREYiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG4gIGRpZmZXb3JkczpcbiAgICB0aXRsZTogJ1Nob3cgV29yZCBEaWZmJ1xuICAgIGRlc2NyaXB0aW9uOiAnRGlmZnMgdGhlIHdvcmRzIGJldHdlZW4gZWFjaCBsaW5lIHdoZW4gdGhpcyBib3ggaXMgY2hlY2tlZC4nXG4gICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIG9yZGVyOiAxXG4gIGlnbm9yZVdoaXRlc3BhY2U6XG4gICAgdGl0bGU6ICdJZ25vcmUgV2hpdGVzcGFjZSdcbiAgICBkZXNjcmlwdGlvbjogJ1dpbGwgbm90IGRpZmYgd2hpdGVzcGFjZSB3aGVuIHRoaXMgYm94IGlzIGNoZWNrZWQuJ1xuICAgIHR5cGU6ICdib29sZWFuJ1xuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgb3JkZXI6IDJcbiAgbXV0ZU5vdGlmaWNhdGlvbnM6XG4gICAgdGl0bGU6ICdNdXRlIE5vdGlmaWNhdGlvbnMnXG4gICAgZGVzY3JpcHRpb246ICdNdXRlcyBhbGwgd2FybmluZyBub3RpZmljYXRpb25zIHdoZW4gdGhpcyBib3ggaXMgY2hlY2tlZC4nXG4gICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBvcmRlcjogM1xuICBzY3JvbGxTeW5jVHlwZTpcbiAgICB0aXRsZTogJ1N5bmMgU2Nyb2xsaW5nJ1xuICAgIGRlc2NyaXB0aW9uOiAnU3luY3MgdGhlIHNjcm9sbGluZyBvZiB0aGUgZWRpdG9ycy4nXG4gICAgdHlwZTogJ3N0cmluZydcbiAgICBkZWZhdWx0OiAnVmVydGljYWwgKyBIb3Jpem9udGFsJ1xuICAgIGVudW06IFsnVmVydGljYWwgKyBIb3Jpem9udGFsJywgJ1ZlcnRpY2FsJywgJ05vbmUnXVxuICAgIG9yZGVyOiA0XG4gIGxlZnRFZGl0b3JDb2xvcjpcbiAgICB0aXRsZTogJ0xlZnQgRWRpdG9yIENvbG9yJ1xuICAgIGRlc2NyaXB0aW9uOiAnU3BlY2lmaWVzIHRoZSBoaWdobGlnaHQgY29sb3IgZm9yIHRoZSBsZWZ0IGVkaXRvci4nXG4gICAgdHlwZTogJ3N0cmluZydcbiAgICBkZWZhdWx0OiAnZ3JlZW4nXG4gICAgZW51bTogWydncmVlbicsICdyZWQnXVxuICAgIG9yZGVyOiA1XG4gIHJpZ2h0RWRpdG9yQ29sb3I6XG4gICAgdGl0bGU6ICdSaWdodCBFZGl0b3IgQ29sb3InXG4gICAgZGVzY3JpcHRpb246ICdTcGVjaWZpZXMgdGhlIGhpZ2hsaWdodCBjb2xvciBmb3IgdGhlIHJpZ2h0IGVkaXRvci4nXG4gICAgdHlwZTogJ3N0cmluZydcbiAgICBkZWZhdWx0OiAncmVkJ1xuICAgIGVudW06IFsnZ3JlZW4nLCAncmVkJ11cbiAgICBvcmRlcjogNlxuIl19

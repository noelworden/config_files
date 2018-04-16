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
    turnOffSoftWrap: {
      title: 'Turn Off Soft Wrap',
      description: 'Turns off soft wrap during diff - restores when finished.',
      type: 'boolean',
      "default": false,
      order: 3
    },
    muteNotifications: {
      title: 'Mute Notifications',
      description: 'Mutes all warning notifications when this box is checked.',
      type: 'boolean',
      "default": false,
      order: 4
    },
    hideDocks: {
      title: 'Hide Docks',
      description: 'Hides all docks (Tree View, Github, etc) during diff - shows when finished.',
      type: 'boolean',
      "default": false,
      order: 5
    },
    scrollSyncType: {
      title: 'Sync Scrolling',
      description: 'Syncs the scrolling of the editors.',
      type: 'string',
      "default": 'Vertical + Horizontal',
      "enum": ['Vertical + Horizontal', 'Vertical', 'None'],
      order: 6
    },
    colors: {
      type: 'object',
      properties: {
        addedColorSide: {
          title: 'Added Color Side',
          description: 'The side that the latest version of the file is on. The added color will be applied to this editor and the removed color will be opposite.',
          type: 'string',
          "default": 'left',
          "enum": ['left', 'right'],
          order: 1
        },
        overrideThemeColors: {
          title: 'Override Highlight Colors',
          description: 'Override the line highlight colors (defined by variables in your selected syntax theme) with the colors selected below.',
          type: 'boolean',
          "default": false,
          order: 2
        },
        addedColor: {
          title: 'Added Custom Color',
          description: 'The color that will be used for highlighting added lines when **Override Highlight Colors** is checked.',
          type: 'color',
          "default": 'green',
          order: 3
        },
        removedColor: {
          title: 'Removed Custom Color',
          description: 'The color that will be used for highlighting removed lines when **Override Highlight Colors** is checked.',
          type: 'color',
          "default": 'red',
          order: 4
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL25vZWx3b3JkZW4vLmF0b20vcGFja2FnZXMvc3BsaXQtZGlmZi9saWIvY29uZmlnLXNjaGVtYS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsU0FBQSxFQUNFO01BQUEsS0FBQSxFQUFPLGdCQUFQO01BQ0EsV0FBQSxFQUFhLDZEQURiO01BRUEsSUFBQSxFQUFNLFNBRk47TUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBSFQ7TUFJQSxLQUFBLEVBQU8sQ0FKUDtLQURGO0lBTUEsZ0JBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxtQkFBUDtNQUNBLFdBQUEsRUFBYSxvREFEYjtNQUVBLElBQUEsRUFBTSxTQUZOO01BR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO01BSUEsS0FBQSxFQUFPLENBSlA7S0FQRjtJQVlBLGVBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxvQkFBUDtNQUNBLFdBQUEsRUFBYSwyREFEYjtNQUVBLElBQUEsRUFBTSxTQUZOO01BR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO01BSUEsS0FBQSxFQUFPLENBSlA7S0FiRjtJQWtCQSxpQkFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLG9CQUFQO01BQ0EsV0FBQSxFQUFhLDJEQURiO01BRUEsSUFBQSxFQUFNLFNBRk47TUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBSFQ7TUFJQSxLQUFBLEVBQU8sQ0FKUDtLQW5CRjtJQXdCQSxTQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sWUFBUDtNQUNBLFdBQUEsRUFBYSw2RUFEYjtNQUVBLElBQUEsRUFBTSxTQUZOO01BR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO01BSUEsS0FBQSxFQUFPLENBSlA7S0F6QkY7SUE4QkEsY0FBQSxFQUNFO01BQUEsS0FBQSxFQUFPLGdCQUFQO01BQ0EsV0FBQSxFQUFhLHFDQURiO01BRUEsSUFBQSxFQUFNLFFBRk47TUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLHVCQUhUO01BSUEsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLHVCQUFELEVBQTBCLFVBQTFCLEVBQXNDLE1BQXRDLENBSk47TUFLQSxLQUFBLEVBQU8sQ0FMUDtLQS9CRjtJQXFDQSxNQUFBLEVBQ0U7TUFBQSxJQUFBLEVBQU0sUUFBTjtNQUNBLFVBQUEsRUFDRTtRQUFBLGNBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxrQkFBUDtVQUNBLFdBQUEsRUFBYSw0SUFEYjtVQUVBLElBQUEsRUFBTSxRQUZOO1VBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxNQUhUO1VBSUEsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLE1BQUQsRUFBUyxPQUFULENBSk47VUFLQSxLQUFBLEVBQU8sQ0FMUDtTQURGO1FBT0EsbUJBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTywyQkFBUDtVQUNBLFdBQUEsRUFBYSx5SEFEYjtVQUVBLElBQUEsRUFBTSxTQUZOO1VBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO1VBSUEsS0FBQSxFQUFPLENBSlA7U0FSRjtRQWFBLFVBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxvQkFBUDtVQUNBLFdBQUEsRUFBYSx5R0FEYjtVQUVBLElBQUEsRUFBTSxPQUZOO1VBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxPQUhUO1VBSUEsS0FBQSxFQUFPLENBSlA7U0FkRjtRQW1CQSxZQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8sc0JBQVA7VUFDQSxXQUFBLEVBQWEsMkdBRGI7VUFFQSxJQUFBLEVBQU0sT0FGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtVQUlBLEtBQUEsRUFBTyxDQUpQO1NBcEJGO09BRkY7S0F0Q0Y7O0FBREYiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG4gIGRpZmZXb3JkczpcbiAgICB0aXRsZTogJ1Nob3cgV29yZCBEaWZmJ1xuICAgIGRlc2NyaXB0aW9uOiAnRGlmZnMgdGhlIHdvcmRzIGJldHdlZW4gZWFjaCBsaW5lIHdoZW4gdGhpcyBib3ggaXMgY2hlY2tlZC4nXG4gICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIG9yZGVyOiAxXG4gIGlnbm9yZVdoaXRlc3BhY2U6XG4gICAgdGl0bGU6ICdJZ25vcmUgV2hpdGVzcGFjZSdcbiAgICBkZXNjcmlwdGlvbjogJ1dpbGwgbm90IGRpZmYgd2hpdGVzcGFjZSB3aGVuIHRoaXMgYm94IGlzIGNoZWNrZWQuJ1xuICAgIHR5cGU6ICdib29sZWFuJ1xuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgb3JkZXI6IDJcbiAgdHVybk9mZlNvZnRXcmFwOlxuICAgIHRpdGxlOiAnVHVybiBPZmYgU29mdCBXcmFwJ1xuICAgIGRlc2NyaXB0aW9uOiAnVHVybnMgb2ZmIHNvZnQgd3JhcCBkdXJpbmcgZGlmZiAtIHJlc3RvcmVzIHdoZW4gZmluaXNoZWQuJ1xuICAgIHR5cGU6ICdib29sZWFuJ1xuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgb3JkZXI6IDNcbiAgbXV0ZU5vdGlmaWNhdGlvbnM6XG4gICAgdGl0bGU6ICdNdXRlIE5vdGlmaWNhdGlvbnMnXG4gICAgZGVzY3JpcHRpb246ICdNdXRlcyBhbGwgd2FybmluZyBub3RpZmljYXRpb25zIHdoZW4gdGhpcyBib3ggaXMgY2hlY2tlZC4nXG4gICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBvcmRlcjogNFxuICBoaWRlRG9ja3M6XG4gICAgdGl0bGU6ICdIaWRlIERvY2tzJ1xuICAgIGRlc2NyaXB0aW9uOiAnSGlkZXMgYWxsIGRvY2tzIChUcmVlIFZpZXcsIEdpdGh1YiwgZXRjKSBkdXJpbmcgZGlmZiAtIHNob3dzIHdoZW4gZmluaXNoZWQuJ1xuICAgIHR5cGU6ICdib29sZWFuJ1xuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgb3JkZXI6IDVcbiAgc2Nyb2xsU3luY1R5cGU6XG4gICAgdGl0bGU6ICdTeW5jIFNjcm9sbGluZydcbiAgICBkZXNjcmlwdGlvbjogJ1N5bmNzIHRoZSBzY3JvbGxpbmcgb2YgdGhlIGVkaXRvcnMuJ1xuICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgZGVmYXVsdDogJ1ZlcnRpY2FsICsgSG9yaXpvbnRhbCdcbiAgICBlbnVtOiBbJ1ZlcnRpY2FsICsgSG9yaXpvbnRhbCcsICdWZXJ0aWNhbCcsICdOb25lJ11cbiAgICBvcmRlcjogNlxuICBjb2xvcnM6XG4gICAgdHlwZTogJ29iamVjdCdcbiAgICBwcm9wZXJ0aWVzOlxuICAgICAgYWRkZWRDb2xvclNpZGU6XG4gICAgICAgIHRpdGxlOiAnQWRkZWQgQ29sb3IgU2lkZSdcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgc2lkZSB0aGF0IHRoZSBsYXRlc3QgdmVyc2lvbiBvZiB0aGUgZmlsZSBpcyBvbi4gVGhlIGFkZGVkIGNvbG9yIHdpbGwgYmUgYXBwbGllZCB0byB0aGlzIGVkaXRvciBhbmQgdGhlIHJlbW92ZWQgY29sb3Igd2lsbCBiZSBvcHBvc2l0ZS4nXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgIGRlZmF1bHQ6ICdsZWZ0J1xuICAgICAgICBlbnVtOiBbJ2xlZnQnLCAncmlnaHQnXVxuICAgICAgICBvcmRlcjogMVxuICAgICAgb3ZlcnJpZGVUaGVtZUNvbG9yczpcbiAgICAgICAgdGl0bGU6ICdPdmVycmlkZSBIaWdobGlnaHQgQ29sb3JzJ1xuICAgICAgICBkZXNjcmlwdGlvbjogJ092ZXJyaWRlIHRoZSBsaW5lIGhpZ2hsaWdodCBjb2xvcnMgKGRlZmluZWQgYnkgdmFyaWFibGVzIGluIHlvdXIgc2VsZWN0ZWQgc3ludGF4IHRoZW1lKSB3aXRoIHRoZSBjb2xvcnMgc2VsZWN0ZWQgYmVsb3cuJ1xuICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgb3JkZXI6IDJcbiAgICAgIGFkZGVkQ29sb3I6XG4gICAgICAgIHRpdGxlOiAnQWRkZWQgQ3VzdG9tIENvbG9yJ1xuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBjb2xvciB0aGF0IHdpbGwgYmUgdXNlZCBmb3IgaGlnaGxpZ2h0aW5nIGFkZGVkIGxpbmVzIHdoZW4gKipPdmVycmlkZSBIaWdobGlnaHQgQ29sb3JzKiogaXMgY2hlY2tlZC4nXG4gICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgZGVmYXVsdDogJ2dyZWVuJ1xuICAgICAgICBvcmRlcjogM1xuICAgICAgcmVtb3ZlZENvbG9yOlxuICAgICAgICB0aXRsZTogJ1JlbW92ZWQgQ3VzdG9tIENvbG9yJ1xuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBjb2xvciB0aGF0IHdpbGwgYmUgdXNlZCBmb3IgaGlnaGxpZ2h0aW5nIHJlbW92ZWQgbGluZXMgd2hlbiAqKk92ZXJyaWRlIEhpZ2hsaWdodCBDb2xvcnMqKiBpcyBjaGVja2VkLidcbiAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICBkZWZhdWx0OiAncmVkJ1xuICAgICAgICBvcmRlcjogNFxuIl19

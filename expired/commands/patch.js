// The patch interface model

D.import_models({
  patch: {
    desc: "Some patchy commands", // synthy
    methods: {

      // TODO: this needs a lot of work... integrate the awesome stuff from the index in here.

      load: {
        desc: "Load up a synth patch",
        params: [
          {
            key: 'id',
            desc: "The patch's id",
            type: 'string',
            required: true,
          },
        ],
        fun: function(id) {
          iPatch.load(id);
        },
      },

      // TODO: rethink this
      change_input: {
        params: [
          {
            key: 'id',
            desc: "The input's id",
            type: 'string',
            required: true,
          },
          {
            key: 'value',
            desc: "The input's value",
            type: 'string',
            required: true,
          },
        ],
        desc: "Do, like, something with inputs?",
        fun: function(id, value) {
          iPatch.change_input(id, value);
        },
      },

      // TODO: rethink this
      remove_node: {
        desc: "Remove a node?",
        params: [
          {
            key: 'id',
            desc: "The node's id",
            type: 'string',
            required: true,
          },
        ],
        fun: function(id) {
          iPatch.remove_node(id);
        },
      },

      play: {
        desc: "Play the current synth patch",
        fun: function() {
          iPatch.play();
        },
      },
            
    }
  }
});






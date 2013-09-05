// commands for processing D

D.import_models({
  process: {
    desc: "Commands for processing D in various interesting ways",
    vars: {debounces: {}},
    methods: {
      
      // THINK: we should have another function like the pipe that takes a list of commands to run in parallel...
      
      // pipe: {
      //   desc: "Execute a pipeline",
      //   params: [
      //     {
      //       key: 'value',
      //       desc: 'A list of D commands',
      //       type: 'list',
      //       required: true
      //     },
      //   ],
      //   fun: function(value) {
      //     var output, pipeval
      // 
      //     // store old pipe value
      //     pipeval = D.VARS['__']
      //     D.VARS['__'] = undefined
      //     
      //     for(var i=0, l=value.length; i < l; i++) {
      //       output = D.fun_run(value[i])
      //       
      //       // set pipe value
      //       if(i != l-1) {
      //         D.execute('variable', 'set', ['__', output])
      //       }
      //     }
      // 
      //     // restore old pipe value
      //     D.execute('variable', 'set', ['__', pipeval]) // we have to use {var set}, otherwise the Vstack gets corrupted.
      // 
      //     return output
      //   },
      // },
      
      // send: {
      //   desc: "Send something back to the server or whatever",
      //   help: "This breaks out of the temporal flow. It's good for events and DOM manipulation, but might wreak havoc with templates and REPL.",
      //   params: [
      //     {
      //       key: 'daimio',
      //       desc: 'A command to send',
      //       type: 'block',
      //       required: true
      //     },
      //     {
      //       key: 'then',
      //       desc: "Something to do after. Data is pushed into 'this'",
      //       type: 'block',
      //     },
      //   ],
      //   fun: function(daimio, then) {
      //     jDaimio.process(
      //       daimio.toString(), 
      //       function(data, response, vars) {
      //         D.import_var('this', data);
      //         D.run(then);
      //       }
      //     );
      //   },
      // },
      
      sleep: {
        desc: "'Did I fall asleep? Shall I go now?'",
        params: [
          {
            key: 'for',
            desc: 'A number of milliseconds to sleep',
            type: 'number',
            required: true
          },
          {
            key: 'then',
            desc: "Something to do after -- usually populated by the previous pipeline segment",
            type: 'anything',
          },
        ],
        fun: function(_for, then, prior_starter) {
          if(!_for) {
            setImmediate(function() {
              prior_starter(then)
            })
          }
          else {
            setTimeout(function() {
              prior_starter(then)
            }, _for)
          }
          
          return NaN
        },
      },
      
      // THINK: a command that lets you pass a handler, method, and hash o' params, for those fancy occasions. 
      
      log: {
        desc: "Push something into the log",
        params: [
          {
            key: 'value',
            desc: 'A string or object to log',
            type: 'anything',
            required: true
          },
          {
            key: 'passthru',
            desc: 'If true, return the value'
          },
        ],
        fun: function(value, passthru) {
          // TODO: make this work server-side also (maybe a call to D, with split client/server libs)
          
          // THINK: we should defunc things, or something, probably... maybe like this?
          value = (typeof value === 'function') ? value() : value
          
          console.log(value)
          
          if(passthru) return value
        },
      },
      
      downport: {
        desc: "Create a downport from this pipeline",
        params: [
          {
            key: 'value',
            desc: 'The value passed into the downport',
            type: 'anything',
          },
          {
            key: 'name',
            desc: 'The name of the port you seek',
            type: 'string',
          },
        ],
        fun: function(value, name, prior_starter, process) {
          // find the correct port, using port.name [this is a runtime value, which is stinky -- it can change]
          // TODO: lock the command-port relationship in at spaceseed creation time
          var port = process.space.ports.filter(function(port) {
                       return (port.name == name && port.station == process.space.station_id) 
                     })[0] 

          if(!port)
            return D.setError('No corresponding port exists on this station')
          
          // send the value, go async while we wait for the reply
          
          var callback = function(value) {
            prior_starter(value)
          }
          
          port.exit(value, callback, process) // yuck: process is only here for 'exec' ports :(
          
          return NaN
        },
      },
      
      
      // debounce: {
      //   desc: "Run a block if it hasn't been run recently",
      //   help: "This runs the block 'time' milliseconds after the last time you call it. Note that it breaks out of program flow, like {process wait}, and also that all copies of a given block are treated identically (i.e. if @a and @b are string-equivalent blocks, they'll use the same timer).",
      //   params: [
      //     {
      //       key: 'value',
      //       desc: 'The block to run',
      //       type: 'block',
      //       required: true,
      //     },
      //     {
      //       key: 'time',
      //       desc: 'Milliseconds to wait (defaults to 500)',
      //       type: 'number',
      //       required: true,
      //       fallback: '500',
      //     },
      //   ],
      //   fun: function(value, time) {
      //     var hash = value.hash
      //     if(!hash) return D.onerror('Value must be a valid block')
      //     
      //     clearTimeout(this.vars.debounces[hash])
      //     this.vars.debounces[hash] = setTimeout(value.toFun(), time)
      //   },
      // },
      
      
    }
  }
});
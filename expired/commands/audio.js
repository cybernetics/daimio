// // A wrapper for the Web Audio APIs
// 
// (function() {
//   var context = new webkitAudioContext
//     , compressor = context.createDynamicsCompressor()
//     , analyser = context.createAnalyser()
//     , maingain = context.createGainNode()
//   
//   maingain.connect(analyser)
//   analyser.connect(compressor)
//   compressor.connect(context.destination)
// 
//   // FIXME: leak these for demo
//   window.context = context
//   window.output = maingain
//   window.analyser = analyser
//   
//   analyser.smoothingTimeConstant = 0.1
//   analyser.fftSize = 1024
//   
//   javascriptNode = context.createJavaScriptNode(2048, 1, 1)
//   analyser.connect(javascriptNode)
//   javascriptNode.connect(context.destination)
//   
// 
// 
//   D.import_models({
//     audio: {
//       desc: "A wrapper for the Web Audio APIs",
//       help: "",
//       vars: {
//         context: context,
//         analyser: analyser,
//         maingain: maingain,
//         playing: true,
//         nodes: [maingain]
//       },
//       methods: {
// 
//         'add-osc': {
//           desc: "Create a new oscillator",
//           params: [
//             {
//               key: 'input',
//               desc: "A node id which will control the frequency",
//               type: 'list',
//             },
//             {
//               key: 'freq',
//               desc: "The oscillator's initial frequency",
//               type: 'number',
//               fallback: '440',
//             },
//           ],
//           fun: function(input, freq) {
//             var context = this.vars.context
// 
//             var osc = context.createOscillator()
//             osc.frequency.value = (freq || 440)
//             osc.noteOn(1)
// 
//             id = this.vars.nodes.push(osc) - 1
// 
//             if(input && input.length) {
//               this.methods.connect.fun.call(this, input, id, 'frequency')
//             }
//           
//             return id
//           },
//         },
// 
//         'add-gain': {
//           desc: "Create a new gain node",
//           params: [
//             {
//               key: 'input',
//               desc: "A node id which will be affected by the gain",
//               type: 'list',
//             },
//             {
//               key: 'value',
//               desc: "The gain amount",
//               type: 'number',
//               fallback: '1',
//             },
//           ],
//           fun: function(input, value) {
//             var context = this.vars.context
// 
//             var node = context.createGainNode()
//             node.gain.value = (value || 1) 
//           
//             id = this.vars.nodes.push(node) - 1
//           
//             if(input && input.length) {
//               this.methods.connect.fun.call(this, input, id)
//             }
//           
//             return id
//           },
//         },
//       
//         // createDelay
//         // createPanner
//         // add-clip
//       
//         'add-biquad': {
//           desc: "Create a new gain node",
//           params: [
//             {
//               key: 'input',
//               desc: "A node id which will be affected by the gain",
//               type: 'list',
//             },
//             {
//               key: 'value',
//               desc: "The gain amount",
//               type: 'number',
//               fallback: '1',
//             },
//           ],
//           fun: function(input, value) {
//             var context = this.vars.context
// 
//             var node = context.createGainNode()
//             node.gain.value = (value || 1) 
//           
//             id = this.vars.nodes.push(node) - 1
//           
//             if(input && input.length) {
//               this.methods.connect.fun.call(this, input, id)
//             }
//           
//             return id
//           },
//         },
//       
//       
// 
//         'set-param': {
//           desc: "Set a value for a node's parameter",
//           help: "This is for static values. Use {audio connect} to use one node's output as another node's input.",
//           params: [
//             {
//               key: 'id',
//               desc: "The audio node's id",
//               type: 'number',
//               required: true,
//             },
//             {
//               key: 'name',
//               desc: "The parameter name",
//               type: 'string',
//               required: true,
//             },
//             {
//               key: 'to',
//               desc: "The new value",
//               type: 'number',
//               required: true,
//             },
//           ],
//           fun: function(id, name, value) {
//             var context = this.vars.context
//               , node = this.vars.nodes[id]
// 
//             if(!node) return D.on_error("I can't seem to find that node");
//             if(!node[name] || node[name].value === undefined) {
//               return D.on_error("That node doesn't contain that parameter");
//             }
// 
//             node[name].value = value
//             return id
//           },
//         },
// 
// 
//         connect: {
//           desc: "Connect some nodes' out to another node's in",
//           params: [
//             {
//               key: 'input',
//               desc: "Transmitting nodes' ids",
//               type: 'list',
//               required: true,
//             },
//             {
//               key: 'to',
//               desc: "Receiving node's id",
//               type: 'number',
//               required: true,
//             },
//             {
//               key: 'as',
//               desc: "A specific parameter, like 'frequency' or 'gain'",
//               type: 'string',
//             },
//           ],
//           fun: function(input, to, as) {
//             var context = this.vars.context
//           
//             var receiver = this.vars.nodes[to]
//             if(!receiver) return D.on_error("The receiver is missing");
//           
//             if(as) {
//               if(receiver[as] === undefined) return D.on_error("The receiver does not have that parameter");
//               receiver = receiver[as]
//             }
// 
//             var nodes = this.vars.nodes
//             input.forEach(function(input_id) {
//               var input_node = nodes[input_id]
//               if(!input_node) return D.on_error("The receiver is missing");
//               input_node.connect(receiver)
//             })
//           
//             return input
//           },
//         },
// 
// 
//         volume: {
//           desc: "Train the main gain",
//           params: [
//             {
//               key: 'value',
//               desc: "A value between 0 and 1, inclusive",
//               type: 'number',
//               required: true,
//               fallback: '1',
//             },
//           ],
//           fun: function(value) {
//             if(value < 0 || value > 1) return D.on_error('That is not a number between 0 and 1');
//             this.vars.maingain.gain.value = value
//             return true
//           },
//         },
//       
//         play: {
//           desc: "Play the network",
//           params: [],
//           fun: function() {
//             var context = this.vars.context
//               , maingain = this.vars.maingain
// 
//             if(this.vars.playing) return D.on_error('Already playing!');
//             maingain.connect(this.vars.analyser)
//             this.vars.playing = true
//             
//             return true
//           },
//         },
// 
//         pause: {
//           desc: "Pause the network",
//           params: [],
//           fun: function() {
//             var context = this.vars.context
//               , maingain = this.vars.maingain
// 
//             if(!this.vars.playing) return D.on_error('Not currently playing');
//             maingain.disconnect(this.vars.analyser)
//             this.vars.playing = false
//             
//             return true
//           },
//         },
// 
//         reset: {
//           desc: "Reset all networks",
//           params: [],
//           fun: function() {
//             var context = this.vars.context
// 
//             this.vars.maingain.disconnect(this.vars.analyser)
// 
//             var maingain = context.createGainNode()
//             maingain.connect(this.vars.analyser)
//             
//             this.vars.maingain = maingain
//             this.vars.nodes = [maingain]
//             window.output = this.vars.maingain
//             
//             this.vars.playing = true
//             
//             // FIXME: HACKACHACKHACKHACKHAKCHACKH!
//             D.run('{osc 20000 | gain 0.01 | output}')
//             
//             return true
//           },
//         },
// 
//       }
//     }
//   });
// })()
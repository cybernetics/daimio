// commands for logic

D.import_models({
  logic: {
    desc: "Commands for logical reasoning",
    methods: {
      
      'if': {
        desc: 'Return the "then" param if "value" is true, else "else"',
        params: [
          {
            key: 'value',
            desc: 'True if it has elements or characters (empty strings and empty arrays are false, as is the number zero (but not the string "0"!))',
            required: true
          },
          {
            key: 'then',
            desc: 'Returned if value is true',
          },
          {
            key: 'else',
            desc: 'Returned if value is false'
          },
          {
            key: 'with',
            desc: 'If provided the selection will be executed. Values are imported into the block scope.',
            help: 'The magic key __in becomes the process input. If scalar the value is taken to be __in.',
            type: 'maybe-list'
          },
        ],
        fun: function(value, then, _else, _with, prior_starter, process) {
          var branch = D.isFalse(value) ? _else : then
          
          if(!_with)
            return branch
          
          if(branch.constructor == D.Segment) { // TODO: remove me when "block|anything" is supported
            branch = D.TYPES['block'](branch)
          }
          
          if(typeof branch != 'function')
            return branch
          
          if(Array.isArray(_with))
            _with = {'__in': _with[0]}
          
          return branch(function(value) {
            prior_starter(value)
          }, _with, process)
          
          // THINK: consider an 'invert' param so you can alias something like 'unless'
          
          // if(!value) return _else;
          // // if(!D.isNice(value)) return _else;
          // // if(value === 0 || value === '') return _else;
          // if(typeof value == 'object' && _.isEmpty(value)) return _else;
          // 
          // return then;
        },
      },
      
      'is': {
        desc: 'If value is in in or like like, return true',
        params: [
          {
            key: 'value',
            desc: 'Value to compare',
            required: true
          },
          {
            key: 'in',
            desc: 'Array of potential matches',
            type: 'list'
          },
          {
            key: 'like',
            desc: 'A string for exact matches -- wrap with / / for regular expression matching',
            type: 'anything',
            undefined: true
          },
        ],
        fun: function(value, _in, like) {
          if(!D.isNice(like)) {
            if(D.isNice(_in)) return _in.indexOf(value) !== -1
            
            if(!Array.isArray(value)) return D.onerror("Requires 'in', 'like', or a value list")
            
            var base = value[0] // test each item
            for(var i=1, l=value.length; i < l; i++) {
              if(!this.methods.is.fun(base, null, value[i])) return false;
            }
            return true;
          }
          
          // TODO: make a new 'logic equal' command, that takes a list or two args. then make 'is like' only for regex?
          
          var is_obj = (typeof value == 'object') + (typeof like == 'object') // XOR
          
          if(is_obj == 1)
            return false 
            
          if(is_obj == 2)
            return JSON.stringify(value) == JSON.stringify(like)
          
          if(like[0] !== '/' || !D.ETC.flag_checker_regex.test(like)) {
            return value == like // exact match, ish.
          }
          
          like = D.ETC.string_to_regex(like)
          return like.test(value)
        },
      },
      

      'cond': {
        desc: 'Takes a list with odd elements providing conditions and even elements providing actions. Finds the first true test, runs its action and stops',
        // desc: 'Given a list of lists, test the first element and run the remainder if true, stopping after the first',
        params: [
          {
            key: 'value',
            desc: 'A list with alternating tests and expressions',
            type: 'list',
            required: true
          },
          {
            key: 'with',
            desc: 'Given a hash, values are imported into the block scope.',
            type: 'maybe-list'
          },
        ],
        fun: function(value, _with, prior_starter) {
          var found = false
           , count = -1
           , scope = _with || {}

          if(Array.isArray(_with))
            scope = {'__in': _with[0]}
           
          var my_tramp_prior_starter = function(bool) {
            if(bool) 
              found = count+1
            tramp_prior_starter(null)
          }
        
          var processfun = function(item, tramp_prior_starter) {
            count++
            
            if(found === count) {
              if(typeof item == 'function') 
                return item(function(value) {my_tramp_prior_starter(value)}, scope) 
              else
                return item
            }
            
            if(found)
              return null
            
            if(count % 2)
              return null

            if(typeof item == 'function') 
              var bool = item(function(value) {my_tramp_prior_starter(value)}, scope) 
            else
              bool = item
              
            if(bool !== bool) 
              return NaN
            
            if(!D.isFalse(bool))
              found = count+1
            
            return null
          }
          
          var joinerfun = function(total, value) {
            if(D.isNice(total)) return total
            if(D.isNice(value)) return value
            return null
          }
          
          return D.dataTrampoline(value, processfun, joinerfun, prior_starter)
          
          
          // var unwrapped = _.find(value, function(item) {
          //   return (typeof item != 'object' || D.isBlock(item))
          // })
          // 
          // if(unwrapped) {
          //   var new_value = []
          //   for(var i=0, l=value.length; i < l; i += 2) {
          //     new_value.push([value[i], value[i+1]])
          //   }
          //   value = new_value
          // }
          // 
          // for(var i=0, l=value.length; i < l; i++) {
          //   var test = D.run(value[i][0])
          //   if(test) {
          //     for(var j=1, l=value[i].length; j < l; j++) {
          //       test = D.run(value[i][j])
          //     }
          //     return test
          //   }
          // }
          // 
          // return false
        },
      },
      
      'switch': {
        desc: 'Given a value, find a matching expression',
        params: [
          {
            key: 'on',
            desc: 'The value to switch on',
            type: 'anything',
            required: true
          },
          {
            key: 'value',
            desc: 'A list of value then expression then value then expression and so on and so forth and etcetera and yada yada',
            type: 'list',
            required: true
          }
        ],
        fun: function(on, value, prior_starter) {
          // var list = value.reverse()
          // 
          // var callback = function(result) {
          //   var reward = list.pop()
          //   if(result == on) {
          //     continuation(reward)
          //   }
          //   else {
          //     D.run(list.pop(), callback)
          //   }
          // }
          // 
          // D.run(list.pop(), callback)
          // 
          // return NaN
          
          
          
          
          for(var i=0, l=value.length; i < l; i = i + 2) {
            var test = value[i]
            // var test = D.run(value[i])
            if(test == on) {
              return value[i+1]
            }
          }
          
          return false
        },
      },
      
      and: {
        desc: "If all values are true, return true",
        params: [
          {
            key: 'value',
            desc: 'A set of values to check for falsiness (runs all incoming templates, no short-circuiting)',
            type: 'anything',
            required: true,
          },
          {
            key: 'also',
            desc: 'Some other values (checked first)',
            type: 'anything',
            'undefined': true
          },
        ],
        fun: function(value, also) {
          if(typeof also != 'undefined') {
            return !!value && !!also
          }
          
          // value = D.toArray(value)
          
          for(var key in value) {
            if(!value[key]) return false
          }
          
          return true
        },
      },
      
      or: {
        desc: "Accepts a list of values or two separate values; runs all incoming templates, no short-circuiting",
        help: "Note that the 'first' param is considered before the 'value' param, if it is included. This makes the examples easier to read.",
        examples: [
          '{5 | or 10}',
          '{false | or :true}',
          '{(false 1 2 3) | or}',
          '{or (false 1 2 3)}',
          '{(false 0 "") | or :true}',
        ],
        params: [
          {
            key: 'value',
            desc: 'Some values to check for truthiness',
            type: 'anything',
            required: true,
          },
          {
            key: 'also',
            desc: 'Some other values (checked first)',
            type: 'anything',
            'undefined': true,
          },
        ],
        fun: function(value, also) {
          if(also) return also
          
          if(typeof also != 'undefined') return value

          for(var key in value) {
            if(value[key]) return value[key]
          }
          
          return false
        },
      },
      
      not: {
        desc: "Returns the opposite of value",
        params: [
          {
            key: 'value',
            desc: 'A value whose value to reverse value',
            required: true,
          },
        ],
        fun: function(value) {
          return D.isFalse(value) ? true : false
          
          // TODO: make this a core D method!
          // if(!value) return true;
          // if(typeof value == 'object' && _.isEmpty(value)) return true;
          // 
          // return false;
        },
      },
      
    }
  }
})
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    window['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?\{ ?[^}]* ?\}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    code = Pointer_stringify(code);
    if (code[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (code.indexOf('"', 1) === code.length-1) {
        code = code.substr(1, code.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + code + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + code + ' })'); // new Function does not allow upvars in node
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      /* TODO: use TextEncoder when present,
        var encoder = new TextEncoder();
        encoder['encoding'] = "utf-8";
        var utf8Array = encoder['encode'](aMsg.data);
      */
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*(+4294967296))) : ((+((low>>>0)))+((+((high|0)))*(+4294967296)))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    return rawList ? list : ret + flushList();
  }
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===





STATIC_BASE = 8;

STATICTOP = STATIC_BASE + Runtime.alignMemory(14819);
/* global initializers */ __ATINIT__.push();


/* memory initializer */ allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,110,105,108,0,0,0,0,0,116,114,117,101,0,0,0,0,102,97,108,115,101,0,0,0,37,46,42,103,0,0,0,0,37,108,100,0,0,0,0,0,60,102,117,110,99,116,105,111,110,32,37,112,62,0,0,0,60,117,115,101,114,105,110,102,111,32,37,112,62,0,0,0,60,97,114,114,97,121,32,37,112,62,0,0,0,0,0,0,60,104,97,115,104,109,97,112,32,37,112,62,0,0,0,0,56,0,0,0,192,0,0,0,200,0,0,0,208,0,0,0,216,0,0,0,224,0,0,0,232,0,0,0,248,0,0,0,98,111,111,108,0,0,0,0,110,117,109,98,101,114,0,0,115,116,114,105,110,103,0,0,97,114,114,97,121,0,0,0,104,97,115,104,109,97,112,0,102,117,110,99,116,105,111,110,0,0,0,0,0,0,0,0,117,115,101,114,105,110,102,111,0,0,0,0,0,0,0,0,114,98,0,0,0,0,0,0,58,32,0,0,0,0,0,0,32,32,32,32,0,0,0,0,91,0,0,0,0,0,0,0,123,0,0,0,0,0,0,0,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,97,114,114,97,121,32,105,110,100,101,120,32,37,108,117,32,105,115,32,116,111,111,32,104,105,103,104,32,40,115,105,122,101,32,61,32,37,108,117,41,10,0,0,0,0,0,0,0,99,97,110,110,111,116,32,112,111,112,32,97,110,32,101,109,112,116,121,32,97,114,114,97,121,0,0,0,0,0,0,0,60,109,97,105,110,32,112,114,111,103,114,97,109,62,0,0,116,111,111,32,109,97,110,121,32,114,101,103,105,115,116,101,114,115,32,105,110,32,116,111,112,45,108,101,118,101,108,32,112,114,111,103,114,97,109,0,115,101,109,97,110,116,105,99,32,101,114,114,111,114,32,110,101,97,114,32,108,105,110,101,32,37,105,58,32,0,0,0,60,108,97,109,98,100,97,62,0,0,0,0,0,0,0,0,119,114,111,110,103,32,115,121,109,98,111,108,32,116,121,112,101,32,37,115,32,105,110,32,119,114,105,116,101,95,115,121,109,116,97,98,40,41,0,0,117,110,114,101,99,111,103,110,105,122,101,100,32,65,83,84,32,110,111,100,101,32,96,37,105,39,0,0,0,0,0,0,97,114,103,117,109,101,110,116,32,111,102,32,43,43,32,97,110,100,32,45,45,32,109,117,115,116,32,98,101,32,97,32,118,97,114,105,97,98,108,101,32,111,114,32,97,114,114,97,121,32,109,101,109,98,101,114,0,0,0,0,0,0,0,0,118,97,114,105,97,98,108,101,32,96,37,115,39,32,105,115,32,117,110,100,101,99,108,97,114,101,100,0,0,0,0,0,117,110,97,114,121,32,109,105,110,117,115,32,97,112,112,108,105,101,100,32,116,111,32,110,111,110,45,110,117,109,98,101,114,32,108,105,116,101,114,97,108,0,0,0,0,0,0,0,99,97,108,108,111,99,40,41,32,102,97,105,108,101,100,0,97,114,103,117,109,101,110,116,32,96,37,115,39,32,97,108,114,101,97,100,121,32,100,101,99,108,97,114,101,100,0,0,116,111,111,32,109,97,110,121,32,114,101,103,105,115,116,101,114,115,32,105,110,32,102,117,110,99,116,105,111,110,0,0,20,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,108,101,102,116,45,104,97,110,100,32,115,105,100,101,32,111,102,32,97,115,115,105,103,110,109,101,110,116,32,109,117,115,116,32,98,101,32,97,32,118,97,114,105,97,98,108,101,32,111,114,32,97,110,32,97,114,114,97,121,32,109,101,109,98,101,114,0,0,0,0,0,0,118,97,114,105,97,98,108,101,32,96,37,115,39,32,97,108,114,101,97,100,121,32,100,101,99,108,97,114,101,100,0,0,96,99,111,110,116,105,110,117,101,39,32,105,115,32,111,110,108,121,32,109,101,97,110,105,110,103,102,117,108,32,105,110,115,105,100,101,32,97,32,108,111,111,112,0,0,0,0,0,96,98,114,101,97,107,39,32,105,115,32,111,110,108,121,32,109,101,97,110,105,110,103,102,117,108,32,105,110,115,105,100,101,32,97,32,108,111,111,112,0,0,0,0,0,0,0,0,73,47,79,32,101,114,114,111,114,58,32,99,111,117,108,100,32,110,111,116,32,114,101,97,100,32,115,111,117,114,99,101,32,102,105,108,101,0,0,0,48,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,3,0,0,0,0,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,7,0,0,0,13,0,0,0,23,0,0,0,41,0,0,0,71,0,0,0,127,0,0,0,191,0,0,0,251,0,0,0,127,1,0,0,119,2,0,0,63,4,0,0,187,6,0,0,243,10,0,0,171,17,0,0,183,28,0,0,183,46,0,0,247,75,0,0,255,121,0,0,251,197,0,0,255,63,1,0,255,5,2,0,247,69,3,0,239,73,5,0,213,143,8,0,239,217,13,0,255,105,22,0,255,65,36,0,255,171,58,0,255,237,94,0,245,153,153,0,255,135,248,0,251,33,146,1,217,169,138,2,229,203,28,4,247,119,167,6,239,67,196,10,239,185,107,17,243,253,47,28,253,185,155,45,239,183,203,73,229,111,103,119,255,39,51,193,101,120,99,101,101,100,101,100,32,109,97,120,105,109,97,108,32,115,105,122,101,32,111,102,32,104,97,115,104,109,97,112,0,0,0,0,0,0,0,0,117,110,101,120,112,101,99,116,101,100,32,99,104,97,114,97,99,116,101,114,32,96,37,99,39,0,0,0,0,0,0,0,101,110,100,32,111,102,32,105,110,112,117,116,32,98,101,102,111,114,101,32,99,108,111,115,105,110,103,32,34,32,105,110,32,115,116,114,105,110,103,32,108,105,116,101,114,97,108,0,105,110,118,97,108,105,100,32,104,101,120,32,101,115,99,97,112,101,32,115,101,113,117,101,110,99,101,32,39,92,120,37,99,37,99,39,0,0,0,0,105,110,118,97,108,105,100,32,101,115,99,97,112,101,32,115,101,113,117,101,110,99,101,32,39,92,37,99,39,0,0,0,101,109,112,116,121,32,99,104,97,114,97,99,116,101,114,32,108,105,116,101,114,97,108,0,101,110,100,32,111,102,32,105,110,112,117,116,32,98,101,102,111,114,101,32,99,108,111,115,105,110,103,32,97,112,111,115,116,114,111,112,104,101,32,105,110,32,99,104,97,114,97,99,116,101,114,32,108,105,116,101,114,97,108,0,0,0,0,0,99,104,97,114,97,99,116,101,114,32,108,105,116,101,114,97,108,32,108,111,110,103,101,114,32,116,104,97,110,32,56,32,98,121,116,101,115,0,0,0,120,8,0,0,2,0,0,0,45,0,0,0,128,8,0,0,2,0,0,0,51,0,0,0,136,8,0,0,1,0,0,0,26,0,0,0,144,8,0,0,2,0,0,0,46,0,0,0,152,8,0,0,2,0,0,0,52,0,0,0,160,8,0,0,1,0,0,0,27,0,0,0,168,8,0,0,2,0,0,0,53,0,0,0,176,8,0,0,1,0,0,0,28,0,0,0,184,8,0,0,2,0,0,0,54,0,0,0,192,8,0,0,1,0,0,0,29,0,0,0,200,8,0,0,2,0,0,0,55,0,0,0,208,8,0,0,1,0,0,0,30,0,0,0,216,8,0,0,2,0,0,0,49,0,0,0,224,8,0,0,1,0,0,0,34,0,0,0,232,8,0,0,2,0,0,0,50,0,0,0,240,8,0,0,1,0,0,0,35,0,0,0,248,8,0,0,1,0,0,0,39,0,0,0,0,9,0,0,1,0,0,0,40,0,0,0,8,9,0,0,3,0,0,0,59,0,0,0,16,9,0,0,2,0,0,0,44,0,0,0,24,9,0,0,1,0,0,0,43,0,0,0,32,9,0,0,1,0,0,0,42,0,0,0,40,9,0,0,1,0,0,0,41,0,0,0,48,9,0,0,3,0,0,0,64,0,0,0,56,9,0,0,2,0,0,0,60,0,0,0,64,9,0,0,2,0,0,0,62,0,0,0,72,9,0,0,1,0,0,0,37,0,0,0,80,9,0,0,3,0,0,0,65,0,0,0,88,9,0,0,2,0,0,0,61,0,0,0,96,9,0,0,2,0,0,0,63,0,0,0,104,9,0,0,1,0,0,0,38,0,0,0,112,9,0,0,2,0,0,0,47,0,0,0,120,9,0,0,2,0,0,0,56,0,0,0,128,9,0,0,1,0,0,0,31,0,0,0,136,9,0,0,2,0,0,0,48,0,0,0,144,9,0,0,2,0,0,0,57,0,0,0,152,9,0,0,1,0,0,0,32,0,0,0,160,9,0,0,2,0,0,0,58,0,0,0,168,9,0,0,1,0,0,0,33,0,0,0,176,9,0,0,1,0,0,0,36,0,0,0,184,9,0,0,1,0,0,0,20,0,0,0,192,9,0,0,1,0,0,0,21,0,0,0,200,9,0,0,1,0,0,0,22,0,0,0,208,9,0,0,1,0,0,0,23,0,0,0,216,9,0,0,1,0,0,0,24,0,0,0,224,9,0,0,1,0,0,0,25,0,0,0,43,43,0,0,0,0,0,0,43,61,0,0,0,0,0,0,43,0,0,0,0,0,0,0,45,45,0,0,0,0,0,0,45,61,0,0,0,0,0,0,45,0,0,0,0,0,0,0,42,61,0,0,0,0,0,0,42,0,0,0,0,0,0,0,47,61,0,0,0,0,0,0,47,0,0,0,0,0,0,0,37,61,0,0,0,0,0,0,37,0,0,0,0,0,0,0,61,61,0,0,0,0,0,0,61,0,0,0,0,0,0,0,33,61,0,0,0,0,0,0,33,0,0,0,0,0,0,0,63,0,0,0,0,0,0,0,58,0,0,0,0,0,0,0,46,46,61,0,0,0,0,0,46,46,0,0,0,0,0,0,46,0,0,0,0,0,0,0,44,0,0,0,0,0,0,0,59,0,0,0,0,0,0,0,60,60,61,0,0,0,0,0,60,60,0,0,0,0,0,0,60,61,0,0,0,0,0,0,60,0,0,0,0,0,0,0,62,62,61,0,0,0,0,0,62,62,0,0,0,0,0,0,62,61,0,0,0,0,0,0,62,0,0,0,0,0,0,0,38,38,0,0,0,0,0,0,38,61,0,0,0,0,0,0,38,0,0,0,0,0,0,0,124,124,0,0,0,0,0,0,124,61,0,0,0,0,0,0,124,0,0,0,0,0,0,0,94,61,0,0,0,0,0,0,94,0,0,0,0,0,0,0,126,0,0,0,0,0,0,0,40,0,0,0,0,0,0,0,41,0,0,0,0,0,0,0,91,0,0,0,0,0,0,0,93,0,0,0,0,0,0,0,123,0,0,0,0,0,0,0,125,0,0,0,0,0,0,0,240,10,0,0,3,0,0,0,47,0,0,0,248,10,0,0,4,0,0,0,19,0,0,0,0,11,0,0,5,0,0,0,9,0,0,0,8,11,0,0,5,0,0,0,18,0,0,0,16,11,0,0,8,0,0,0,10,0,0,0,32,11,0,0,2,0,0,0,7,0,0,0,40,11,0,0,4,0,0,0,5,0,0,0,48,11,0,0,5,0,0,0,14,0,0,0,56,11,0,0,3,0,0,0,8,0,0,0,64,11,0,0,8,0,0,0,11,0,0,0,80,11,0,0,6,0,0,0,18,0,0,0,88,11,0,0,2,0,0,0,4,0,0,0,96,11,0,0,3,0,0,0,17,0,0,0,104,11,0,0,3,0,0,0,15,0,0,0,112,11,0,0,3,0,0,0,35,0,0,0,120,11,0,0,4,0,0,0,15,0,0,0,128,11,0,0,2,0,0,0,48,0,0,0,136,11,0,0,6,0,0,0,12,0,0,0,144,11,0,0,4,0,0,0,13,0,0,0,152,11,0,0,6,0,0,0,16,0,0,0,160,11,0,0,3,0,0,0,17,0,0,0,168,11,0,0,5,0,0,0,6,0,0,0,97,110,100,0,0,0,0,0,97,114,103,118,0,0,0,0,98,114,101,97,107,0,0,0,99,111,110,115,116,0,0,0,99,111,110,116,105,110,117,101,0,0,0,0,0,0,0,0,100,111,0,0,0,0,0,0,101,108,115,101,0,0,0,0,102,97,108,115,101,0,0,0,102,111,114,0,0,0,0,0,102,117,110,99,116,105,111,110,0,0,0,0,0,0,0,0,103,108,111,98,97,108,0,0,105,102,0,0,0,0,0,0,108,101,116,0,0,0,0,0,110,105,108,0,0,0,0,0,110,111,116,0,0,0,0,0,110,117,108,108,0,0,0,0,111,114,0,0,0,0,0,0,114,101,116,117,114,110,0,0,116,114,117,101,0,0,0,0,116,121,112,101,111,102,0,0,118,97,114,0,0,0,0,0,119,104,105,108,101,0,0,0,99,97,110,110,111,116,32,112,97,114,115,101,32,104,101,120,97,100,101,99,105,109,97,108,32,105,110,116,101,103,101,114,32,108,105,116,101,114,97,108,0,0,0,0,0,0,0,0,99,97,110,110,111,116,32,112,97,114,115,101,32,111,99,116,97,108,32,105,110,116,101,103,101,114,32,108,105,116,101,114,97,108,0,0,0,0,0,0,101,120,112,111,110,101,110,116,32,105,110,32,100,101,99,105,109,97,108,32,102,108,111,97,116,105,110,103,45,112,111,105,110,116,32,108,105,116,101,114,97,108,32,105,115,32,109,105,115,115,105,110,103,0,0,0,99,97,110,110,111,116,32,112,97,114,115,101,32,100,101,99,105,109,97,108,32,102,108,111,97,116,105,110,103,45,112,111,105,110,116,32,108,105,116,101,114,97,108,0,0,0,0,0,99,97,110,110,111,116,32,112,97,114,115,101,32,100,101,99,105,109,97,108,32,105,110,116,101,103,101,114,32,108,105,116,101,114,97,108,0,0,0,0,117,110,116,101,114,109,105,110,97,116,101,100,32,99,111,109,109,101,110,116,0,0,0,0,115,121,110,116,97,120,32,101,114,114,111,114,32,110,101,97,114,32,108,105,110,101,32,37,105,58,32,0,0,0,0,0,103,97,114,98,97,103,101,32,97,102,116,101,114,32,105,110,112,117,116,0,0,0,0,0,34,0,0,0,51,0,0,0,52,0,0,0,53,0,0,0,54,0,0,0,55,0,0,0,56,0,0,0,57,0,0,0,58,0,0,0,64,0,0,0,65,0,0,0,59,0,0,0,12,0,0,0,13,0,0,0,14,0,0,0,15,0,0,0,16,0,0,0,17,0,0,0,18,0,0,0,19,0,0,0,20,0,0,0,21,0,0,0,22,0,0,0,23,0,0,0,44,0,0,0,0,0,0,0,24,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,96,58,39,32,105,110,32,99,111,110,100,105,116,105,111,110,97,108,32,101,120,112,114,101,115,115,105,111,110,0,0,48,0,0,0,0,0,0,0,37,0,0,0,0,0,0,0,47,0,0,0,0,0,0,0,36,0,0,0,0,0,0,0,49,0,0,0,50,0,0,0,37,0,0,0,38,0,0,0,62,0,0,0,63,0,0,0,38,0,0,0,39,0,0,0,40,0,0,0,42,0,0,0,41,0,0,0,43,0,0,0,32,0,0,0,0,0,0,0,32,0,0,0,0,0,0,0,33,0,0,0,0,0,0,0,33,0,0,0,0,0,0,0,31,0,0,0,0,0,0,0,31,0,0,0,0,0,0,0,60,0,0,0,61,0,0,0,34,0,0,0,35,0,0,0,26,0,0,0,27,0,0,0,26,0,0,0,27,0,0,0,28,0,0,0,29,0,0,0,30,0,0,0,0,0,0,0,28,0,0,0,29,0,0,0,30,0,0,0,0,0,0,0,45,0,0,0,46,0,0,0,26,0,0,0,27,0,0,0,35,0,0,0,36,0,0,0,16,0,0,0,0,0,0,0,46,0,0,0,47,0,0,0,44,0,0,0,45,0,0,0,49,0,0,0,50,0,0,0,48,0,0,0,0,0,0,0,45,0,0,0,46,0,0,0,22,0,0,0,20,0,0,0,43,0,0,0,0,0,0,0,51,0,0,0,52,0,0,0,53,0,0,0,55,0,0,0,54,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,96,93,39,32,97,102,116,101,114,32,101,120,112,114,101,115,115,105,111,110,32,105,110,32,97,114,114,97,121,32,115,117,98,115,99,114,105,112,116,0,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,105,100,101,110,116,105,102,105,101,114,32,97,102,116,101,114,32,39,46,39,32,111,112,101,114,97,116,111,114,0,0,101,120,112,101,99,116,101,100,32,96,41,39,32,97,102,116,101,114,32,101,120,112,114,101,115,115,105,111,110,32,105,110,32,102,117,110,99,116,105,111,110,32,99,97,108,108,0,0,101,120,112,101,99,116,101,100,32,96,41,39,32,97,102,116,101,114,32,112,97,114,101,110,116,104,101,115,105,122,101,100,32,101,120,112,114,101,115,115,105,111,110,0,0,0,0,0,117,110,101,120,112,101,99,116,101,100,32,116,111,107,101,110,32,37,105,0,0,0,0,0,105,110,116,101,114,110,97,108,32,101,114,114,111,114,44,32,101,120,112,101,99,116,101,100,32,96,102,117,110,99,116,105,111,110,39,0,0,0,0,0,101,120,112,101,99,116,101,100,32,102,117,110,99,116,105,111,110,32,110,97,109,101,32,105,110,32,102,117,110,99,116,105,111,110,32,115,116,97,116,101,109,101,110,116,0,0,0,0,101,120,112,101,99,116,101,100,32,96,40,39,32,105,110,32,102,117,110,99,116,105,111,110,32,104,101,97,100,101,114,0,101,120,112,101,99,116,101,100,32,96,41,39,32,97,102,116,101,114,32,102,117,110,99,116,105,111,110,32,97,114,103,117,109,101,110,116,32,108,105,115,116,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,96,123,39,32,105,110,32,98,108,111,99,107,32,115,116,97,116,101,109,101,110,116,0,101,120,112,101,99,116,101,100,32,96,125,39,32,97,116,32,101,110,100,32,111,102,32,98,108,111,99,107,32,115,116,97,116,101,109,101,110,116,0,0,96,99,111,110,115,116,39,32,100,101,99,108,97,114,97,116,105,111,110,115,32,97,114,101,32,111,110,108,121,32,97,108,108,111,119,101,100,32,97,116,32,102,105,108,101,32,115,99,111,112,101,0,0,0,0,0,101,120,112,101,99,116,101,100,32,105,100,101,110,116,105,102,105,101,114,32,105,110,32,99,111,110,115,116,32,100,101,99,108,97,114,97,116,105,111,110,0,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,96,61,39,32,97,102,116,101,114,32,105,100,101,110,116,105,102,105,101,114,32,105,110,32,99,111,110,115,116,32,100,101,99,108,97,114,97,116,105,111,110,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,96,59,39,32,97,102,116,101,114,32,99,111,110,115,116,97,110,116,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,96,59,39,32,97,102,116,101,114,32,101,120,112,114,101,115,115,105,111,110,0,0,0,101,120,112,101,99,116,101,100,32,105,100,101,110,116,105,102,105,101,114,32,105,110,32,118,97,114,105,97,98,108,101,32,100,101,99,108,97,114,97,116,105,111,110,0,0,0,0,0,101,120,112,101,99,116,101,100,32,96,59,39,32,97,102,116,101,114,32,118,97,114,105,97,98,108,101,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,101,120,112,114,101,115,115,105,111,110,32,111,114,32,96,59,39,32,97,102,116,101,114,32,96,114,101,116,117,114,110,39,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,96,59,39,32,97,102,116,101,114,32,101,120,112,114,101,115,115,105,111,110,32,105,110,32,114,101,116,117,114,110,32,115,116,97,116,101,109,101,110,116,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,96,59,39,32,97,102,116,101,114,32,96,99,111,110,116,105,110,117,101,39,0,0,0,101,120,112,101,99,116,101,100,32,96,59,39,32,97,102,116,101,114,32,96,98,114,101,97,107,39,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,105,110,105,116,105,97,108,105,122,101,114,32,97,102,116,101,114,32,96,102,111,114,39,0,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,96,59,39,32,97,102,116,101,114,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,32,111,102,32,102,111,114,32,108,111,111,112,0,0,0,101,120,112,101,99,116,101,100,32,96,59,39,32,97,102,116,101,114,32,99,111,110,100,105,116,105,111,110,32,111,102,32,102,111,114,32,108,111,111,112,0,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,39,41,39,32,97,102,116,101,114,32,102,111,114,32,108,111,111,112,32,104,101,97,100,101,114,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,108,111,111,112,32,98,111,100,121,32,97,102,116,101,114,32,96,100,111,39,0,0,0,101,120,112,101,99,116,101,100,32,96,119,104,105,108,101,39,32,97,102,116,101,114,32,98,111,100,121,32,111,102,32,100,111,45,119,104,105,108,101,32,115,116,97,116,101,109,101,110,116,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,96,59,39,32,97,102,116,101,114,32,99,111,110,100,105,116,105,111,110,32,111,102,32,100,111,45,119,104,105,108,101,32,115,116,97,116,101,109,101,110,116,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,99,111,110,100,105,116,105,111,110,32,97,102,116,101,114,32,96,119,104,105,108,101,39,0,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,99,111,110,100,105,116,105,111,110,32,97,102,116,101,114,32,96,105,102,39,0,0,0,101,120,112,101,99,116,101,100,32,98,108,111,99,107,32,111,114,32,39,105,102,39,32,97,102,116,101,114,32,39,101,108,115,101,39,0,0,0,0,0,101,120,112,101,99,116,101,100,32,105,100,101,110,116,105,102,105,101,114,32,105,110,32,102,117,110,99,116,105,111,110,32,97,114,103,117,109,101,110,116,32,108,105,115,116,0,0,0,101,120,112,101,99,116,105,110,103,32,39,58,39,32,98,101,116,119,101,101,110,32,104,97,115,104,109,97,112,32,107,101,121,32,97,110,100,32,118,97,108,117,101,0,0,0,0,0,116,114,97,105,108,105,110,103,32,99,111,109,109,97,32,105,110,32,104,97,115,104,109,97,112,32,108,105,116,101,114,97,108,32,105,115,32,112,114,111,104,105,98,105,116,101,100,0,101,120,112,101,99,116,101,100,32,39,44,39,32,111,114,32,39,125,39,32,97,102,116,101,114,32,118,97,108,117,101,32,105,110,32,104,97,115,104,109,97,112,32,108,105,116,101,114,97,108,0,0,0,0,0,0,116,114,97,105,108,105,110,103,32,99,111,109,109,97,32,105,110,32,97,114,114,97,121,32,108,105,116,101,114,97,108,32,105,115,32,112,114,111,104,105,98,105,116,101,100,0,0,0,101,120,112,101,99,116,101,100,32,39,44,39,32,111,114,32,39,93,39,32,97,102,116,101,114,32,118,97,108,117,101,32,105,110,32,97,114,114,97,121,32,108,105,116,101,114,97,108,0,0,0,0,0,0,0,0,109,101,109,111,114,121,32,97,108,108,111,99,97,116,105,111,110,32,111,102,32,37,108,117,32,98,121,116,101,115,32,102,97,105,108,101,100,0,0,0,114,101,97,108,108,111,99,97,116,105,111,110,32,111,102,32,112,111,105,110,116,101,114,32,37,112,32,116,111,32,115,105,122,101,32,37,108,117,32,102,97,105,108,101,100,0,0,0,102,97,116,97,108,32,101,114,114,111,114,32,105,110,32,83,112,97,114,107,108,105,110,103,58,32,0,0,0,0,0,0,12,0,0,0,3,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,88,22,0,0,1,0,0,0,96,22,0,0,2,0,0,0,104,22,0,0,3,0,0,0,112,22,0,0,4,0,0,0,120,22,0,0,5,0,0,0,128,22,0,0,6,0,0,0,144,22,0,0,7,0,0,0,152,22,0,0,8,0,0,0,168,22,0,0,9,0,0,0,176,22,0,0,10,0,0,0,192,22,0,0,11,0,0,0,200,22,0,0,12,0,0,0,208,22,0,0,13,0,0,0,224,22,0,0,14,0,0,0,232,22,0,0,15,0,0,0,103,101,116,101,110,118,0,0,115,121,115,116,101,109,0,0,97,115,115,101,114,116,0,0,116,105,109,101,0,0,0,0,117,116,99,116,105,109,101,0,108,111,99,97,108,116,105,109,101,0,0,0,0,0,0,0,102,109,116,100,97,116,101,0,100,105,102,102,116,105,109,101,0,0,0,0,0,0,0,0,99,111,109,112,105,108,101,0,101,120,112,114,116,111,102,110,0,0,0,0,0,0,0,0,116,111,105,110,116,0,0,0,116,111,102,108,111,97,116,0,116,111,110,117,109,98,101,114,0,0,0,0,0,0,0,0,114,101,113,117,105,114,101,0,98,97,99,107,116,114,97,99,101,0,0,0,0,0,0,0,0,23,0,0,16,0,0,0,99,97,108,108,0,0,0,0,83,116,114,105,110,103,0,0,65,114,114,97,121,0,0,0,72,97,115,104,77,97,112,0,70,117,110,99,116,105,111,110,0,0,0,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,50,32,97,114,103,117,109,101,110,116,115,0,0,0,102,105,114,115,116,32,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,32,102,117,110,99,116,105,111,110,0,0,0,0,0,0,0,115,101,99,111,110,100,32,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,110,32,97,114,114,97,121,0,0,0,0,0,0,0,0,101,120,97,99,116,108,121,32,111,110,101,32,97,114,103,117,109,101,110,116,32,105,115,32,114,101,113,117,105,114,101,100,0,0,0,0,0,0,0,0,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,32,115,116,114,105,110,103,32,40,97,32,102,105,108,101,110,97,109,101,41,0,0,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,32,115,116,114,105,110,103,0,0,0,0,0,0,0,46,101,69,0,0,0,0,0,111,110,101,32,111,114,32,116,119,111,32,97,114,103,117,109,101,110,116,115,32,97,114,101,32,114,101,113,117,105,114,101,100,0,0,0,0,0,0,0,102,105,114,115,116,32,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,32,115,116,114,105,110,103,0,115,101,99,111,110,100,32,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,110,32,105,110,116,101,103,101,114,0,0,0,0,0,0,115,101,99,111,110,100,32,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,122,101,114,111,32,111,114,32,98,101,116,119,101,101,110,32,91,50,46,46,46,51,54,93,0,0,0,0,0,0,0,0,114,101,113,117,105,114,105,110,103,32,101,120,97,99,116,108,121,32,111,110,101,32,97,114,103,117,109,101,110,116,0,0,101,120,97,99,116,108,121,32,116,119,111,32,97,114,103,117,109,101,110,116,115,32,97,114,101,32,114,101,113,117,105,114,101,100,0,0,0,0,0,0,97,114,103,117,109,101,110,116,115,32,109,117,115,116,32,98,101,32,105,110,116,101,103,101,114,115,0,0,0,0,0,0,102,105,114,115,116,32,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,32,102,111,114,109,97,116,32,115,116,114,105,110,103,0,0,115,101,99,111,110,100,32,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,32,104,97,115,104,109,97,112,0,0,0,0,0,0,0,115,101,99,0,0,0,0,0,109,105,110,0,0,0,0,0,104,111,117,114,0,0,0,0,109,100,97,121,0,0,0,0,109,111,110,116,104,0,0,0,121,101,97,114,0,0,0,0,119,100,97,121,0,0,0,0,121,100,97,121,0,0,0,0,105,115,100,115,116,0,0,0,105,115,100,115,116,32,109,117,115,116,32,98,101,32,97,32,98,111,111,108,101,97,110,0,116,105,109,101,32,99,111,109,112,111,110,101,110,116,115,32,115,104,111,117,108,100,32,98,101,32,105,110,116,101,103,101,114,115,0,0,0,0,0,0,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,110,32,105,110,116,101,103,101,114,0,0,0,0,0,97,115,115,101,114,116,105,111,110,32,99,111,110,100,105,116,105,111,110,32,109,117,115,116,32,98,101,32,97,32,98,111,111,108,101,97,110,0,0,0,101,114,114,111,114,32,109,101,115,115,97,103,101,32,109,117,115,116,32,98,101,32,97,32,115,116,114,105,110,103,0,0,97,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,58,32,37,115,0,0,0,0,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,32,115,116,114,105,110,103,32,40,97,32,99,111,109,109,97,110,100,32,116,111,32,101,120,101,99,117,116,101,41,0,0,0,0,0,0,0,0,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,32,115,116,114,105,110,103,32,40,110,97,109,101,32,111,102,32,97,110,32,101,110,118,105,114,111,110,109,101,110,116,32,118,97,114,105,97,98,108,101,41,0,0,0,0,0,128,28,0,0,17,0,0,0,120,25,0,0,18,0,0,0,136,28,0,0,19,0,0,0,144,28,0,0,20,0,0,0,152,28,0,0,21,0,0,0,160,28,0,0,22,0,0,0,168,28,0,0,23,0,0,0,176,28,0,0,24,0,0,0,184,28,0,0,25,0,0,0,192,28,0,0,26,0,0,0,200,28,0,0,27,0,0,0,208,28,0,0,28,0,0,0,216,28,0,0,29,0,0,0,224,28,0,0,30,0,0,0,232,28,0,0,31,0,0,0,240,28,0,0,32,0,0,0,248,28,0,0,33,0,0,0,0,29,0,0,34,0,0,0,8,29,0,0,35,0,0,0,16,29,0,0,36,0,0,0,24,29,0,0,37,0,0,0,32,29,0,0,38,0,0,0,40,29,0,0,39,0,0,0,48,29,0,0,40,0,0,0,56,29,0,0,41,0,0,0,64,29,0,0,42,0,0,0,72,29,0,0,43,0,0,0,80,29,0,0,44,0,0,0,88,29,0,0,45,0,0,0,96,29,0,0,46,0,0,0,104,29,0,0,47,0,0,0,112,29,0,0,48,0,0,0,120,29,0,0,49,0,0,0,128,29,0,0,50,0,0,0,136,29,0,0,51,0,0,0,144,29,0,0,52,0,0,0,152,29,0,0,53,0,0,0,160,29,0,0,54,0,0,0,168,29,0,0,55,0,0,0,176,29,0,0,56,0,0,0,192,29,0,0,57,0,0,0,208,29,0,0,58,0,0,0,224,29,0,0,59,0,0,0,240,29,0,0,60,0,0,0,0,30,0,0,61,0,0,0,16,30,0,0,62,0,0,0,32,30,0,0,63,0,0,0,48,30,0,0,64,0,0,0,64,30,0,0,65,0,0,0,72,30,0,0,66,0,0,0,97,98,115,0,0,0,0,0,109,97,120,0,0,0,0,0,114,97,110,103,101,0,0,0,102,108,111,111,114,0,0,0,99,101,105,108,0,0,0,0,114,111,117,110,100,0,0,0,115,103,110,0,0,0,0,0,104,121,112,111,116,0,0,0,115,113,114,116,0,0,0,0,99,98,114,116,0,0,0,0,112,111,119,0,0,0,0,0,101,120,112,0,0,0,0,0,101,120,112,50,0,0,0,0,101,120,112,49,48,0,0,0,108,111,103,0,0,0,0,0,108,111,103,50,0,0,0,0,108,111,103,49,48,0,0,0,115,105,110,0,0,0,0,0,99,111,115,0,0,0,0,0,116,97,110,0,0,0,0,0,115,105,110,104,0,0,0,0,99,111,115,104,0,0,0,0,116,97,110,104,0,0,0,0,97,115,105,110,0,0,0,0,97,99,111,115,0,0,0,0,97,116,97,110,0,0,0,0,97,116,97,110,50,0,0,0,100,101,103,50,114,97,100,0,114,97,100,50,100,101,103,0,114,97,110,100,111,109,0,0,115,101,101,100,0,0,0,0,105,115,102,105,110,0,0,0,105,115,105,110,102,0,0,0,105,115,110,97,110,0,0,0,105,115,102,108,111,97,116,0,105,115,105,110,116,0,0,0,102,97,99,116,0,0,0,0,98,105,110,111,109,0,0,0,99,112,108,120,95,97,100,100,0,0,0,0,0,0,0,0,99,112,108,120,95,115,117,98,0,0,0,0,0,0,0,0,99,112,108,120,95,109,117,108,0,0,0,0,0,0,0,0,99,112,108,120,95,100,105,118,0,0,0,0,0,0,0,0,99,112,108,120,95,115,105,110,0,0,0,0,0,0,0,0,99,112,108,120,95,99,111,115,0,0,0,0,0,0,0,0,99,112,108,120,95,116,97,110,0,0,0,0,0,0,0,0,99,112,108,120,95,99,111,110,106,0,0,0,0,0,0,0,99,112,108,120,95,97,98,115,0,0,0,0,0,0,0,0,99,97,110,50,112,111,108,0,112,111,108,50,99,97,110,0,77,95,69,0,0,0,0,0,77,95,80,73,0,0,0,0,77,95,83,81,82,84,50,0,77,95,80,72,73,0,0,0,77,95,73,78,70,0,0,0,77,95,78,65,78,0,0,0,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,32,104,97,115,104,109,97,112,0,0,0,0,0,0,114,0,0,0,0,0,0,0,114,101,0,0,0,0,0,0,116,104,101,116,97,0,0,0,105,109,0,0,0,0,0,0,107,101,121,115,32,39,114,101,39,32,97,110,100,32,39,105,109,39,32,111,114,32,39,114,39,32,97,110,100,32,39,116,104,101,116,97,39,32,115,104,111,117,108,100,32,99,111,114,114,101,115,112,111,110,100,32,116,111,32,110,117,109,98,101,114,115,0,0,0,0,0,0,97,114,103,117,109,101,110,116,115,32,109,117,115,116,32,98,101,32,104,97,115,104,109,97,112,115,0,0,0,0,0,0,110,32,62,61,32,107,32,62,61,32,48,32,105,115,32,101,120,112,101,99,116,101,100,0,97,114,103,117,109,101,110,116,32,109,117,115,116,32,110,111,116,32,98,101,32,110,101,103,97,116,105,118,101,0,0,0,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,32,110,117,109,98,101,114,0,0,0,0,0,0,0,97,114,103,117,109,101,110,116,115,32,109,117,115,116,32,98,101,32,110,117,109,98,101,114,115,0,0,0,0,0,0,0,97,114,103,117,109,101,110,116,32,105,115,32,111,117,116,32,111,102,32,114,97,110,103,101,32,111,102,32,105,110,116,101,103,101,114,115,0,0,0,0,101,120,112,101,99,116,105,110,103,32,49,44,32,50,32,111,114,32,51,32,97,114,103,117,109,101,110,116,115,0,0,0,97,116,32,108,101,97,115,116,32,111,110,101,32,97,114,103,117,109,101,110,116,32,105,115,32,114,101,113,117,105,114,101,100,0,0,0,0,0,0,0,24,32,0,0,67,0,0,0,99,111,109,98,105,110,101,0,72,32,0,0,68,0,0,0,80,32,0,0,69,0,0,0,88,32,0,0,70,0,0,0,96,32,0,0,71,0,0,0,104,32,0,0,72,0,0,0,102,111,114,101,97,99,104,0,109,97,112,0,0,0,0,0,102,105,108,116,101,114,0,0,107,101,121,115,0,0,0,0,118,97,108,117,101,115,0,0,101,120,112,101,99,116,105,110,103,32,111,110,101,32,97,114,103,117,109,101,110,116,0,0,101,120,112,101,99,116,105,110,103,32,116,119,111,32,97,114,103,117,109,101,110,116,115,0,102,105,114,115,116,32,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,32,104,97,115,104,109,97,112,0,0,0,0,0,0,0,0,115,101,99,111,110,100,32,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,32,102,117,110,99,116,105,111,110,0,0,0,0,0,0,112,114,101,100,105,99,97,116,101,32,109,117,115,116,32,114,101,116,117,114,110,32,97,32,66,111,111,108,101,97,110,0,97,114,103,117,109,101,110,116,115,32,109,117,115,116,32,98,101,32,97,114,114,97,121,115,0,0,0,0,0,0,0,0,116,104,101,114,101,32,109,117,115,116,32,98,101,32,101,120,97,99,116,108,121,32,97,115,32,109,97,110,121,32,118,97,108,117,101,115,32,97,115,32,107,101,121,115,0,0,0,0,8,34,0,0,73,0,0,0,16,34,0,0,74,0,0,0,24,34,0,0,75,0,0,0,32,34,0,0,76,0,0,0,40,34,0,0,77,0,0,0,48,34,0,0,78,0,0,0,56,34,0,0,79,0,0,0,64,34,0,0,80,0,0,0,72,32,0,0,81,0,0,0,72,34,0,0,82,0,0,0,88,32,0,0,83,0,0,0,80,32,0,0,84,0,0,0,80,34,0,0,85,0,0,0,88,34,0,0,86,0,0,0,96,34,0,0,87,0,0,0,104,34,0,0,88,0,0,0,112,34,0,0,89,0,0,0,120,34,0,0,90,0,0,0,128,34,0,0,91,0,0,0,136,34,0,0,92,0,0,0,144,34,0,0,93,0,0,0,115,111,114,116,0,0,0,0,102,105,110,100,0,0,0,0,112,102,105,110,100,0,0,0,98,115,101,97,114,99,104,0,97,110,121,0,0,0,0,0,97,108,108,0,0,0,0,0,115,108,105,99,101,0,0,0,106,111,105,110,0,0,0,0,114,101,100,117,99,101,0,0,105,110,115,101,114,116,0,0,105,110,106,101,99,116,0,0,101,114,97,115,101,0,0,0,99,111,110,99,97,116,0,0,112,117,115,104,0,0,0,0,112,111,112,0,0,0,0,0,108,97,115,116,0,0,0,0,115,119,97,112,0,0,0,0,114,101,118,101,114,115,101,0,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,110,32,97,114,114,97,121,0,0,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,51,32,97,114,103,117,109,101,110,116,115,0,0,0,102,105,114,115,116,32,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,110,32,97,114,114,97,121,0,115,101,99,111,110,100,32,97,110,100,32,116,104,105,114,100,32,97,114,103,117,109,101,110,116,115,32,109,117,115,116,32,98,101,32,105,110,116,101,103,101,114,115,0,0,0,0,0,105,110,100,101,120,32,37,100,32,105,115,32,111,117,116,32,111,102,32,98,111,117,110,100,115,32,102,111,114,32,97,114,114,97,121,32,111,102,32,115,105,122,101,32,37,100,0,0,99,97,110,110,111,116,32,103,101,116,32,108,97,115,116,32,101,108,101,109,101,110,116,32,111,102,32,101,109,112,116,121,32,97,114,114,97,121,0,0,99,97,110,110,111,116,32,112,111,112,40,41,32,101,109,112,116,121,32,97,114,114,97,121,0,0,0,0,0,0,0,0,97,114,103,117,109,101,110,116,115,32,109,117,115,116,32,98,101,32,97,114,114,97,121,115,32,40,97,114,103,32,37,105,32,119,97,115,32,37,115,41,0,0,0,0,0,0,0,0,115,101,99,111,110,100,32,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,110,32,105,110,116,101,103,101,114,32,105,110,100,101,120,0,0,0,0,0,0,0,0,105,110,100,101,120,32,37,100,32,111,117,116,32,111,102,32,98,111,117,110,100,115,32,102,111,114,32,97,114,114,97,121,32,111,102,32,115,105,122,101,32,37,100,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,50,32,111,114,32,51,32,97,114,103,117,109,101,110,116,115,0,0,0,0,0,0,104,97,121,115,116,97,99,107,32,97,110,100,32,110,101,101,100,108,101,32,109,117,115,116,32,98,101,32,97,114,114,97,121,115,0,0,0,0,0,0,105,110,100,101,120,32,109,117,115,116,32,98,101,32,97,110,32,105,110,116,101,103,101,114,0,0,0,0,0,0,0,0,116,104,105,114,100,32,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,110,32,105,110,116,101,103,101,114,0,0,0,0,0,0,0,112,114,101,100,105,99,97,116,101,32,109,117,115,116,32,114,101,116,117,114,110,32,97,32,98,111,111,108,101,97,110,0,101,120,112,101,99,116,105,110,103,32,116,104,114,101,101,32,97,114,103,117,109,101,110,116,115,0,0,0,0,0,0,0,116,104,105,114,100,32,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,32,102,117,110,99,116,105,111,110,0,0,0,0,0,0,0,116,119,111,32,97,114,103,117,109,101,110,116,115,32,97,114,101,32,114,101,113,117,105,114,101,100,0,0,0,0,0,0,99,97,108,108,98,97,99,107,32,102,117,110,99,116,105,111,110,32,109,117,115,116,32,114,101,116,117,114,110,32,98,111,111,108,101,97,110,32,111,114,32,110,105,108,0,0,0,0,115,101,99,111,110,100,32,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,32,115,116,114,105,110,103,0,0,0,0,0,0,0,0,97,114,114,97,121,32,109,117,115,116,32,99,111,110,116,97,105,110,32,115,116,114,105,110,103,115,32,111,110,108,121,0,0,0,0,0,0,0,0,0,116,104,105,114,100,32,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,110,32,105,110,116,101,103,101,114,32,108,101,110,103,116,104,0,0,0,0,0,0,0,0,115,116,97,114,116,105,110,103,32,105,110,100,101,120,32,37,100,32,105,115,32,111,117,116,32,111,102,32,98,111,117,110,100,115,32,102,111,114,32,97,114,114,97,121,32,111,102,32,108,101,110,103,116,104,32,37,100,0,0,0,0,0,0,0,108,101,110,103,116,104,32,119,97,115,32,110,101,103,97,116,105,118,101,32,40,37,100,41,0,0,0,0,0,0,0,0,114,97,110,103,101,32,91,37,100,44,32,37,100,41,32,111,117,116,32,111,102,32,98,111,117,110,100,115,32,102,111,114,32,97,114,114,97,121,32,111,102,32,115,105,122,101,32,37,100,0,0,0,0,0,0,0,99,97,110,110,111,116,32,99,111,109,112,97,114,101,32,118,97,108,117,101,115,32,111,102,32,116,121,112,101,32,37,115,32,97,110,100,32,37,115,0,115,101,99,111,110,100,32,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,32,99,111,109,112,97,114,97,116,111,114,32,102,117,110,99,116,105,111,110,0,0,0,99,111,109,112,97,114,97,116,111,114,32,102,117,110,99,116,105,111,110,32,109,117,115,116,32,114,101,116,117,114,110,32,97,32,66,111,111,108,101,97,110,0,0,0,0,0,0,0,97,116,116,101,109,112,116,32,116,111,32,115,111,114,116,32,117,110,99,111,109,112,97,114,97,98,108,101,32,118,97,108,117,101,115,32,111,102,32,116,121,112,101,32,37,115,32,97,110,100,32,37,115,0,0,0,16,34,0,0,94,0,0,0,144,39,0,0,95,0,0,0,152,39,0,0,96,0,0,0,168,39,0,0,97,0,0,0,184,39,0,0,98,0,0,0,192,39,0,0,99,0,0,0,200,39,0,0,100,0,0,0,208,39,0,0,101,0,0,0,216,39,0,0,102,0,0,0,115,117,98,115,116,114,0,0,115,117,98,115,116,114,116,111,0,0,0,0,0,0,0,0,115,117,98,115,116,114,102,114,111,109,0,0,0,0,0,0,115,112,108,105,116,0,0,0,114,101,112,101,97,116,0,0,116,111,108,111,119,101,114,0,116,111,117,112,112,101,114,0,102,111,114,109,97,116,0,0,101,114,114,111,114,32,105,110,32,102,111,114,109,97,116,32,115,116,114,105,110,103,58,32,37,115,0,0,0,0,0,0,115,101,99,111,110,100,32,97], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
/* memory initializer */ allocate([114,103,117,109,101,110,116,32,109,117,115,116,32,110,111,116,32,98,101,32,110,101,103,97,116,105,118,101,0,0,0,0,97,114,103,117,109,101,110,116,115,32,109,117,115,116,32,98,101,32,115,116,114,105,110,103,115,0,0,0,0,0,0,0,99,97,110,110,111,116,32,115,112,108,105,116,32,111,110,32,101,109,112,116,121,32,115,116,114,105,110,103,0,0,0,0,115,116,97,114,116,105,110,103,32,105,110,100,101,120,32,105,115,32,110,101,103,97,116,105,118,101,32,111,114,32,116,111,111,32,104,105,103,104,0,0,108,101,110,103,116,104,32,105,115,32,110,101,103,97,116,105,118,101,32,111,114,32,116,111,111,32,98,105,103,0,0,0,101,110,100,32,111,102,32,115,117,98,115,116,114,105,110,103,32,105,115,32,111,117,116,32,111,102,32,98,111,117,110,100,115,0,0,0,0,0,0,0,101,120,97,99,116,108,121,32,116,104,114,101,101,32,97,114,103,117,109,101,110,116,115,32,97,114,101,32,114,101,113,117,105,114,101,100,0,0,0,0,115,101,99,111,110,100,32,97,110,100,32,116,104,105,114,100,32,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,105,110,116,101,103,101,114,115,0,0,0,0,0,0,116,119,111,32,111,114,32,116,104,114,101,101,32,97,114,103,117,109,101,110,116,115,32,97,114,101,32,114,101,113,117,105,114,101,100,0,0,0,0,0,102,105,114,115,116,32,116,119,111,32,97,114,103,117,109,101,110,116,115,32,109,117,115,116,32,98,101,32,115,116,114,105,110,103,115,0,0,0,0,0,110,111,114,109,97,108,105,122,101,100,32,105,110,100,101,120,32,111,117,116,32,111,102,32,98,111,117,110,100,115,0,0,48,42,0,0,103,0,0,0,56,42,0,0,104,0,0,0,64,42,0,0,105,0,0,0,80,42,0,0,106,0,0,0,88,42,0,0,107,0,0,0,96,42,0,0,108,0,0,0,104,42,0,0,109,0,0,0,112,42,0,0,110,0,0,0,128,42,0,0,111,0,0,0,136,42,0,0,112,0,0,0,144,42,0,0,113,0,0,0,152,42,0,0,114,0,0,0,160,42,0,0,115,0,0,0,168,42,0,0,116,0,0,0,176,42,0,0,117,0,0,0,184,42,0,0,118,0,0,0,192,42,0,0,119,0,0,0,200,42,0,0,120,0,0,0,103,101,116,108,105,110,101,0,112,114,105,110,116,0,0,0,100,98,103,112,114,105,110,116,0,0,0,0,0,0,0,0,112,114,105,110,116,102,0,0,102,111,112,101,110,0,0,0,102,99,108,111,115,101,0,0,102,112,114,105,110,116,102,0,102,103,101,116,108,105,110,101,0,0,0,0,0,0,0,0,102,114,101,97,100,0,0,0,102,119,114,105,116,101,0,0,102,102,108,117,115,104,0,0,102,116,101,108,108,0,0,0,102,115,101,101,107,0,0,0,102,101,111,102,0,0,0,0,114,101,109,111,118,101,0,0,114,101,110,97,109,101,0,0,116,109,112,102,105,108,101,0,114,101,97,100,102,105,108,101,0,0,0,0,0,0,0,0,115,116,100,105,110,0,0,0,115,116,100,111,117,116,0,0,115,116,100,101,114,114,0,0,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,32,115,116,114,105,110,103,32,40,102,105,108,101,110,97,109,101,41,0,0,0,0,114,98,0,0,0,0,0,0,99,97,110,39,116,32,111,112,101,110,32,102,105,108,101,32,96,37,115,39,58,32,37,115,0,0,0,0,0,0,0,0,99,97,110,39,116,32,114,101,97,100,32,102,105,108,101,32,96,37,115,39,58,32,37,115,0,0,0,0,0,0,0,0,97,114,103,117,109,101,110,116,115,32,109,117,115,116,32,98,101,32,102,105,108,101,32,112,97,116,104,115,0,0,0,0,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,32,102,105,108,101,32,112,97,116,104,0,0,0,0,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,32,102,105,108,101,32,104,97,110,100,108,101,0,0,102,105,114,115,116,32,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,32,102,105,108,101,32,104,97,110,100,108,101,0,0,0,0,116,104,105,114,100,32,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,32,109,111,100,101,32,115,116,114,105,110,103,0,0,0,0,115,101,116,0,0,0,0,0,99,117,114,0,0,0,0,0,101,110,100,0,0,0,0,0,116,104,105,114,100,32,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,111,110,101,32,111,102,32,34,115,101,116,34,44,32,34,99,117,114,34,32,111,114,32,34,101,110,100,34,0,0,0,0,0,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,110,32,111,117,116,112,117,116,32,102,105,108,101,32,104,97,110,100,108,101,0,0,97,116,32,108,101,97,115,116,32,116,119,111,32,97,114,103,117,109,101,110,116,115,32,97,114,101,32,114,101,113,117,105,114,101,100,0,0,0,0,0,115,101,99,111,110,100,32,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,32,102,111,114,109,97,116,32,115,116,114,105,110,103,0,102,105,108,101,110,97,109,101,32,97,110,100,32,109,111,100,101,32,109,117,115,116,32,98,101,32,115,116,114,105,110,103,115,0,0,0,0,0,0,0,28,0,0,0,4,0,0,0,5,0,0,0,4,0,0,0,5,0,0,0,0,0,0,0,116,114,117,101,0,0,0,0,102,97,108,115,101,0,0,0,78,65,78,0,0,0,0,0,110,97,110,0,0,0,0,0,43,73,78,70,0,0,0,0,43,105,110,102,0,0,0,0,32,73,78,70,0,0,0,0,32,105,110,102,0,0,0,0,73,78,70,0,0,0,0,0,105,110,102,0,0,0,0,0,48,49,0,0,0,0,0,0,48,49,50,51,52,53,54,55,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,65,66,67,68,69,70,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,0,0,0,0,0,0,0,0,116,121,112,101,32,109,105,115,109,97,116,99,104,32,105,110,32,97,114,103,117,109,101,110,116,32,37,105,58,32,101,120,112,101,99,116,101,100,32,37,115,44,32,103,111,116,32,37,115,0,0,0,0,0,0,0,116,121,112,101,32,109,105,115,109,97,116,99,104,32,105,110,32,97,114,103,117,109,101,110,116,32,37,105,58,32,101,120,112,101,99,116,101,100,32,105,110,116,101,103,101,114,44,32,103,111,116,32,102,108,111,97,116,105,110,103,45,112,111,105,110,116,0,0,0,0,0,0,105,110,118,97,108,105,100,32,102,111,114,109,97,116,32,115,112,101,99,105,102,105,101,114,32,96,37,37,37,99,39,32,97,116,32,105,110,100,101,120,32,37,105,0,0,0,0,0,116,111,111,32,102,101,119,32,97,114,103,117,109,101,110,116,115,32,40,37,105,41,0,0,115,117,112,101,114,0,0,0,103,101,116,0,0,0,0,0,115,101,116,0,0,0,0,0,101,114,114,111,114,32,105,110,32,102,117,110,99,116,105,111,110,32,39,37,115,39,32,40,99,111,100,101,58,32,37,105,41,0,0,0,0,0,0,0,103,108,111,98,97,108,32,39,37,115,39,32,97,108,114,101,97,100,121,32,101,120,105,115,116,115,32,98,117,116,32,105,115,32,110,111,116,32,97,32,104,97,115,104,109,97,112,32,40,37,115,41,0,0,0,0,97,116,116,101,109,112,116,32,116,111,32,99,97,108,108,32,118,97,108,117,101,32,111,102,32,116,121,112,101,32,37,115,0,0,0,0,0,0,0,0,114,101,103,105,115,116,101,114,32,100,111,101,115,32,110,111,116,32,99,111,110,116,97,105,110,32,66,111,111,108,101,97,110,32,118,97,108,117,101,32,105,110,32,99,111,110,100,105,116,105,111,110,97,108,32,106,117,109,112,32,40,97,114,101,32,121,111,117,32,116,114,121,105,110,103,32,116,111,32,117,115,101,32,110,111,110,45,66,111,111,108,101,97,110,115,32,119,105,116,104,32,108,111,103,105,99,97,108,32,111,112,101,114,97,116,111,114,115,32,111,114,32,105,110,32,116,104,101,32,99,111,110,100,105,116,105,111,110,32,111,102,32,97,110,32,39,105,102,39,44,32,39,119,104,105,108,101,39,32,111,114,32,39,102,111,114,39,32,115,116,97,116,101,109,101,110,116,63,41,0,0,0,0,0,111,114,100,101,114,101,100,32,99,111,109,112,97,114,105,115,111,110,32,111,102,32,117,110,99,111,109,112,97,114,97,98,108,101,32,118,97,108,117,101,115,32,111,102,32,116,121,112,101,32,37,115,32,97,110,100,32,37,115,0,0,0,0,0,97,114,105,116,104,109,101,116,105,99,32,111,110,32,110,111,110,45,110,117,109,98,101,114,115,0,0,0,0,0,0,0,109,111,100,117,108,111,32,100,105,118,105,115,105,111,110,32,111,110,32,110,111,110,45,105,110,116,101,103,101,114,115,0,110,101,103,97,116,105,111,110,32,111,102,32,110,111,110,45,110,117,109,98,101,114,0,0,105,110,99,114,101,109,101,110,116,105,110,103,32,111,114,32,100,101,99,114,101,109,101,110,116,105,110,103,32,110,111,110,45,110,117,109,98,101,114,0,98,105,116,119,105,115,101,32,111,112,101,114,97,116,105,111,110,32,111,110,32,110,111,110,45,105,110,116,101,103,101,114,115,0,0,0,0,0,0,0,98,105,116,119,105,115,101,32,78,79,84,32,111,110,32,110,111,110,45,105,110,116,101,103,101,114,0,0,0,0,0,0,108,111,103,105,99,97,108,32,110,101,103,97,116,105,111,110,32,111,102,32,110,111,110,45,66,111,111,108,101,97,110,32,118,97,108,117,101,0,0,0,99,111,110,99,97,116,101,110,97,116,105,111,110,32,111,102,32,110,111,110,45,115,116,114,105,110,103,32,118,97,108,117,101,115,0,0,0,0,0,0,99,97,110,110,111,116,32,115,117,98,115,99,114,105,112,116,32,118,97,108,117,101,32,111,102,32,116,121,112,101,32,37,115,0,0,0,0,0,0,0,99,97,110,110,111,116,32,105,110,100,101,120,32,118,97,108,117,101,32,111,102,32,116,121,112,101,32,37,115,0,0,0,114,101,45,100,101,102,105,110,105,116,105,111,110,32,111,102,32,103,108,111,98,97,108,32,39,37,115,39,0,0,0,0,111,98,106,101,99,116,32,111,102,32,116,121,112,101,32,37,115,32,104,97,115,32,110,111,32,99,108,97,115,115,0,0,118,97,108,117,101,32,111,102,32,116,121,112,101,32,37,115,32,104,97,115,32,110,111,32,103,101,116,116,101,114,32,102,111,114,32,112,114,111,112,101,114,116,121,32,39,37,115,39,0,0,0,0,0,0,0,0,118,97,108,117,101,32,111,102,32,116,121,112,101,32,37,115,32,104,97,115,32,110,111,32,115,101,116,116,101,114,32,102,111,114,32,112,114,111,112,101,114,116,121,32,39,37,115,39,0,0,0,0,0,0,0,0,105,108,108,101,103,97,108,32,105,110,115,116,114,117,99,116,105,111,110,32,48,120,37,48,50,120,0,0,0,0,0,0,108,101,110,103,116,104,0,0,104,97,115,104,109,97,112,32,105,110,100,101,120,32,99,97,110,110,111,116,32,98,101,32,78,97,78,0,0,0,0,0,104,97,115,104,109,97,112,32,105,110,100,101,120,32,99,97,110,110,111,116,32,98,101,32,110,105,108,0,0,0,0,0,105,110,100,101,120,105,110,103,32,115,116,114,105,110,103,32,119,105,116,104,32,110,111,110,45,105,110,116,101,103,101,114,32,118,97,108,117,101,32,111,102,32,116,121,112,101,32,37,115,0,0,0,0,0,0,0,105,110,100,101,120,32,37,100,32,105,115,32,111,117,116,32,111,102,32,98,111,117,110,100,115,32,102,111,114,32,115,116,114,105,110,103,32,111,102,32,115,105,122,101,32,37,100,0,105,110,100,101,120,105,110,103,32,97,114,114,97,121,32,119,105,116,104,32,110,111,110,45,105,110,116,101,103,101,114,32,118,97,108,117,101,32,111,102,32,116,121,112,101,32,37,115,0,0,0,0,0,0,0,0,105,110,100,101,120,32,37,100,32,105,115,32,111,117,116,32,111,102,32,98,111,117,110,100,115,32,102,111,114,32,97,114,114,97,121,32,111,102,32,115,105,122,101,32,37,100,0,0,103,108,111,98,97,108,32,39,37,115,39,32,100,111,101,115,32,110,111,116,32,101,120,105,115,116,32,111,114,32,105,116,32,105,115,32,110,105,108,0,114,117,110,116,105,109,101,32,101,114,114,111,114,32,97,116,32,97,100,100,114,101,115,115,32,48,120,37,48,56,120,58,32,0,0,0,0,0,0,0,114,117,110,116,105,109,101,32,101,114,114,111,114,32,105,110,32,110,97,116,105,118,101,32,99,111,100,101,58,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,97,116,116,101,109,112,116,32,116,111,32,99,97,108,108,32,118,97,108,117,101,32,111,102,32,110,111,110,45,102,117,110,99,116,105,111,110,32,116,121,112,101,32,37,115,0,0,0,105,115,97,114,114,97,121,40,38,97,114,103,118,95,118,97,108,41,0,0,0,0,0,0,106,115,97,112,105,46,99,0,106,115,112,110,95,99,97,108,108,0,0,0,0,0,0,0,79,75,0,0,0,0,0,0,115,121,110,116,97,120,0,0,115,101,109,97,110,116,105,99,0,0,0,0,0,0,0,0,114,117,110,116,105,109,101,0,103,101,110,101,114,105,99,0,117,110,107,110,111,119,110,0,0,0,0,0,0,0,0,0,105,115,98,111,111,108,40,38,118,97,108,41,0,0,0,0,106,115,112,110,95,103,101,116,66,111,111,108,0,0,0,0,105,115,110,117,109,40,38,118,97,108,41,0,0,0,0,0,106,115,112,110,95,103,101,116,78,117,109,98,101,114,0,0,105,115,115,116,114,105,110,103,40,38,118,97,108,41,0,0,106,115,112,110,95,103,101,116,83,116,114,105,110,103,0,0,0,0,0,0,0,0,0,0,108,101,116,32,102,117,110,99,73,110,100,101,120,32,61,32,97,114,103,118,91,48,93,59,114,101,116,117,114,110,32,102,117,110,99,116,105,111,110,40,41,32,123,9,108,101,116,32,97,114,103,115,32,61,32,97,114,103,118,46,109,97,112,40,106,115,112,110,95,118,97,108,117,101,84,111,73,110,100,101,120,41,59,9,114,101,116,117,114,110,32,106,115,112,110,95,99,97,108,108,87,114,97,112,112,101,100,70,117,110,99,40,102,117,110,99,73,110,100,101,120,44,32,97,114,103,115,41,59,125,59,0,0,0,0,0,119,114,97,112,112,101,114,71,101,110,101,114,97,116,111,114,32,33,61,32,78,85,76,76,0,0,0,0,0,0,0,0,106,115,112,110,95,97,100,100,87,114,97,112,112,101,114,70,117,110,99,116,105,111,110,0,101,114,114,32,61,61,32,48,0,0,0,0,0,0,0,0,105,115,105,110,116,40,38,118,97,108,41,0,0,0,0,0,106,115,112,110,95,103,101,116,73,110,116,70,114,111,109,65,114,114,97,121,0,0,0,0,105,115,97,114,114,97,121,40,38,118,97,108,41,0,0,0,106,115,112,110,95,99,111,117,110,116,79,102,65,114,114,97,121,65,116,73,110,100,101,120,0,0,0,0,0,0,0,0,105,115,104,97,115,104,109,97,112,40,38,118,97,108,41,0,106,115,112,110,95,99,111,117,110,116,79,102,72,97,115,104,77,97,112,65,116,73,110,100,101,120,0,0,0,0,0,0,105,115,97,114,114,97,121,40,38,97,114,114,97,121,118,97,108,41,0,0,0,0,0,0,106,115,112,110,95,103,101,116,86,97,108,117,101,73,110,100,105,99,101,115,79,102,65,114,114,97,121,65,116,73,110,100,101,120,0,0,0,0,0,0,105,115,104,97,115,104,109,97,112,40,38,104,109,118,97,108,41,0,0,0,0,0,0,0,106,115,112,110,95,103,101,116,75,101,121,65,110,100,86,97,108,117,101,73,110,100,105,99,101,115,79,102,72,97,115,104,77,97,112,65,116,73,110,100,101,120,0,0,0,0,0,0,240,54,0,0,121,0,0,0,8,55,0,0,122,0,0,0,32,55,0,0,123,0,0,0,106,115,112,110,95,99,97,108,108,87,114,97,112,112,101,100,70,117,110,99,0,0,0,0,106,115,112,110,95,118,97,108,117,101,84,111,73,110,100,101,120,0,0,0,0,0,0,0,106,115,101,118,97,108,0,0,101,120,112,101,99,116,105,110,103,32,111,110,101,32,97,114,103,117,109,101,110,116,0,0,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,32,115,116,114,105,110,103,0,0,0,0,0,0,0,101,114,114,111,114,32,105,110,32,101,118,97,108,40,41,0,97,114,103,99,32,62,61,32,49,0,0,0,0,0,0,0,97,114,103,99,32,61,61,32,50,0,0,0,0,0,0,0,105,115,105,110,116,40,38,97,114,103,118,91,48,93,41,0,105,115,97,114,114,97,121,40,38,97,114,103,118,91,49,93,41,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,105,110,102,105,110,105,116,121,0,0,0,0,0,0,0,0,110,97,110,0,0,0,0,0,95,112,137,0,255,9,47,15,10,0,0,0,100,0,0,0,232,3,0,0,16,39,0,0,160,134,1,0,64,66,15,0,128,150,152,0,0,225,245,5], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+10240);




var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  
   
  Module["_rand_r"] = _rand_r;
  
  var ___rand_seed=allocate([0x0273459b, 0, 0, 0], "i32", ALLOC_STATIC); 
  Module["_rand"] = _rand;

   
  Module["_i64Subtract"] = _i64Subtract;

   
  Module["_i64Add"] = _i64Add;

  function _jspn_callJSFunc(funcIndex, argc, argv) {
  		var wrappedFunctions = Sparkling['_wrappedFunctions'];
  		var valueAtIndex = Sparkling['_valueAtIndex'];
  		var addJSValue = Sparkling['_addJSValue'];
  		var getIntFromArray = Sparkling['_getIntFromArray'];
  
  		var fn = wrappedFunctions[funcIndex];
  		var i, index;
  		var retVal;
  		var arg;
  		var args = [];
  
  		for (i = 0; i < argc; i++) {
  			index = getIntFromArray(argv, i);
  			arg = valueAtIndex(index);
  			args.push(arg);
  		}
  
  		retVal = fn.apply(undefined, args);
  		return addJSValue(retVal);
  	}

  
  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        if (stream.__proto__) {
          // reuse the object
          stream.__proto__ = FS.FSStream.prototype;
        } else {
          var newStream = new FS.FSStream();
          for (var p in stream) {
            newStream[p] = stream[p];
          }
          stream = newStream;
        }
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = Math.floor(idx / this.chunkSize);
          return this.getter(chunkNum)[chunkOffset];
        }
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        }
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
            // Find length
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, false);
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            var datalength = Number(xhr.getResponseHeader("Content-length"));
            var header;
            var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
            var chunkSize = 1024*1024; // Chunk size in bytes
  
            if (!hasByteServing) chunkSize = datalength;
  
            // Function to get a range from the remote URL.
            var doXHR = (function(from, to) {
              if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
              if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
              // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, false);
              if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
              // Some hints to the browser that we want binary data.
              if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
              if (xhr.overrideMimeType) {
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
              }
  
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              if (xhr.response !== undefined) {
                return new Uint8Array(xhr.response || []);
              } else {
                return intArrayFromString(xhr.responseText || '', true);
              }
            });
            var lazyArray = this;
            lazyArray.setDataGetter(function(chunkNum) {
              var start = chunkNum * chunkSize;
              var end = (chunkNum+1) * chunkSize - 1; // including this byte
              end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                lazyArray.chunks[chunkNum] = doXHR(start, end);
              }
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
              return lazyArray.chunks[chunkNum];
            });
  
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true;
        }
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};function _close(fildes) {
      // int close(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/close.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        FS.close(stream);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  
  function _fsync(fildes) {
      // int fsync(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fsync.html
      var stream = FS.getStream(fildes);
      if (stream) {
        // We write directly to the file system, so there's nothing to do here.
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }
  
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) return -1;
      return stream.fd;
    }function _fclose(stream) {
      // int fclose(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fclose.html
      var fd = _fileno(stream);
      _fsync(fd);
      return _close(fd);
    }

  
  
  function _malloc(bytes) {
      /* Over-allocate to make sure it is byte-aligned by 8.
       * This will leak memory, but this is only the dummy
       * implementation (replaced by dlmalloc normally) so
       * not an issue.
       */
      var ptr = Runtime.dynamicAlloc(bytes + 8);
      return (ptr+8) & 0xFFFFFFF8;
    }
  Module["_malloc"] = _malloc;function _tmpnam(s, dir, prefix) {
      // char *tmpnam(char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/tmpnam.html
      // NOTE: The dir and prefix arguments are for internal use only.
      var folder = FS.findObject(dir || '/tmp');
      if (!folder || !folder.isFolder) {
        dir = '/tmp';
        folder = FS.findObject(dir);
        if (!folder || !folder.isFolder) return 0;
      }
      var name = prefix || 'file';
      do {
        name += String.fromCharCode(65 + Math.floor(Math.random() * 25));
      } while (name in folder.contents);
      var result = dir + '/' + name;
      if (!_tmpnam.buffer) _tmpnam.buffer = _malloc(256);
      if (!s) s = _tmpnam.buffer;
      writeAsciiToMemory(result, s);
      return s;
    }
  
  
  function _open(path, oflag, varargs) {
      // int open(const char *path, int oflag, ...);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/open.html
      var mode = HEAP32[((varargs)>>2)];
      path = Pointer_stringify(path);
      try {
        var stream = FS.open(path, oflag, mode);
        return stream.fd;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fopen(filename, mode) {
      // FILE *fopen(const char *restrict filename, const char *restrict mode);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fopen.html
      var flags;
      mode = Pointer_stringify(mode);
      if (mode[0] == 'r') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 0;
        }
      } else if (mode[0] == 'w') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 64;
        flags |= 512;
      } else if (mode[0] == 'a') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 64;
        flags |= 1024;
      } else {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return 0;
      }
      var fd = _open(filename, flags, allocate([0x1FF, 0, 0, 0], 'i32', ALLOC_STACK));  // All creation permissions.
      return fd === -1 ? 0 : FS.getPtrForStream(FS.getStream(fd));
    }function _tmpfile() {
      // FILE *tmpfile(void);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/tmpfile.html
      // TODO: Delete the created file on closing.
      if (_tmpfile.mode) {
        _tmpfile.mode = allocate(intArrayFromString('w+'), 'i8', ALLOC_NORMAL);
      }
      return _fopen(_tmpnam(0), _tmpfile.mode);
    }

  
  
  
  
  function _mkport() { throw 'TODO' }var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              var url = 'ws://' + addr + ':' + port;
              // the node ws library API is slightly different than the browser's
              var opts = ENVIRONMENT_IS_NODE ? {headers: {'websocket-protocol': ['binary']}} : ['binary'];
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
  
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
  
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
  
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};function _recv(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _read(fd, buf, len);
    }
  
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) {
        return 0;
      }
      var bytesRead = 0;
      var streamObj = FS.getStreamFromPtr(stream);
      if (!streamObj) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      }
      while (streamObj.ungotten.length && bytesToRead > 0) {
        HEAP8[((ptr++)|0)]=streamObj.ungotten.pop();
        bytesToRead--;
        bytesRead++;
      }
      var err = _read(streamObj.fd, ptr, bytesToRead);
      if (err == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      }
      bytesRead += err;
      if (bytesRead < bytesToRead) streamObj.eof = true;
      return Math.floor(bytesRead / size);
    }

  function _toupper(chr) {
      if (chr >= 97 && chr <= 122) {
        return chr - 97 + 65;
      } else {
        return chr;
      }
    }

  
  
  
  
  function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var fd = _fileno(stream);
      var bytesWritten = _write(fd, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  
  
   
  Module["_strlen"] = _strlen;
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = (HEAP32[((tempDoublePtr)>>2)]=HEAP32[(((varargs)+(argIndex))>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((varargs)+((argIndex)+(4)))>>2)],(+(HEAPF64[(tempDoublePtr)>>3])));
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+4))>>2)]];
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Runtime.getNativeFieldSize(type);
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          }
          if (precision < 0) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }



   
  Module["_strncpy"] = _strncpy;

  
  
  function _isspace(chr) {
      return (chr == 32) || (chr >= 9 && chr <= 13);
    }function __parseInt(str, endptr, base, min, max, bits, unsign) {
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
  
      // Check for a plus/minus sign.
      var multiplier = 1;
      if (HEAP8[(str)] == 45) {
        multiplier = -1;
        str++;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
  
      // Find base.
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            str++;
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;
  
      // Get digits.
      var chr;
      var ret = 0;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          ret = ret * finalBase + digit;
          str++;
        }
      }
  
      // Apply sign.
      ret *= multiplier;
  
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str;
      }
  
      // Unsign if needed.
      if (unsign) {
        if (Math.abs(ret) > max) {
          ret = max;
          ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          ret = unSign(ret, bits);
        }
      }
  
      // Validate range.
      if (ret > max || ret < min) {
        ret = ret > max ? max : min;
        ___setErrNo(ERRNO_CODES.ERANGE);
      }
  
      if (bits == 64) {
        return ((asm["setTempRet0"]((tempDouble=ret,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)),ret>>>0)|0);
      }
  
      return ret;
    }function _strtol(str, endptr, base) {
      return __parseInt(str, endptr, base, -2147483648, 2147483647, 32);  // LONG_MIN, LONG_MAX.
    }

  var _log=Math_log;

  function _isalnum(chr) {
      return (chr >= 48 && chr <= 57) ||
             (chr >= 97 && chr <= 122) ||
             (chr >= 65 && chr <= 90);
    }


  function _system(command) {
      // int system(const char *command);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/system.html
      // Can't call external programs.
      ___setErrNo(ERRNO_CODES.EAGAIN);
      return -1;
    }

  function _fputs(s, stream) {
      // int fputs(const char *restrict s, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputs.html
      var fd = _fileno(stream);
      return _write(fd, s, _strlen(s));
    }

  function _isalpha(chr) {
      return (chr >= 97 && chr <= 122) ||
             (chr >= 65 && chr <= 90);
    }

  function _log10(x) {
      return Math.log(x) / Math.LN10;
    }


  
  var ___tm_current=allocate(44, "i8", ALLOC_STATIC);
  
  
  var ___tm_timezone=allocate(intArrayFromString("GMT"), "i8", ALLOC_STATIC);
  
  
  var _tzname=allocate(8, "i32*", ALLOC_STATIC);
  
  var _daylight=allocate(1, "i32*", ALLOC_STATIC);
  
  var _timezone=allocate(1, "i32*", ALLOC_STATIC);function _tzset() {
      // TODO: Use (malleable) environment variables instead of system settings.
      if (_tzset.called) return;
      _tzset.called = true;
  
      HEAP32[((_timezone)>>2)]=-(new Date()).getTimezoneOffset() * 60;
  
      var winter = new Date(2000, 0, 1);
      var summer = new Date(2000, 6, 1);
      HEAP32[((_daylight)>>2)]=Number(winter.getTimezoneOffset() != summer.getTimezoneOffset());
  
      var winterName = 'GMT'; // XXX do not rely on browser timezone info, it is very unpredictable | winter.toString().match(/\(([A-Z]+)\)/)[1];
      var summerName = 'GMT'; // XXX do not rely on browser timezone info, it is very unpredictable | summer.toString().match(/\(([A-Z]+)\)/)[1];
      var winterNamePtr = allocate(intArrayFromString(winterName), 'i8', ALLOC_NORMAL);
      var summerNamePtr = allocate(intArrayFromString(summerName), 'i8', ALLOC_NORMAL);
      HEAP32[((_tzname)>>2)]=winterNamePtr;
      HEAP32[(((_tzname)+(4))>>2)]=summerNamePtr;
    }function _localtime_r(time, tmPtr) {
      _tzset();
      var date = new Date(HEAP32[((time)>>2)]*1000);
      HEAP32[((tmPtr)>>2)]=date.getSeconds();
      HEAP32[(((tmPtr)+(4))>>2)]=date.getMinutes();
      HEAP32[(((tmPtr)+(8))>>2)]=date.getHours();
      HEAP32[(((tmPtr)+(12))>>2)]=date.getDate();
      HEAP32[(((tmPtr)+(16))>>2)]=date.getMonth();
      HEAP32[(((tmPtr)+(20))>>2)]=date.getFullYear()-1900;
      HEAP32[(((tmPtr)+(24))>>2)]=date.getDay();
  
      var start = new Date(date.getFullYear(), 0, 1);
      var yday = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      HEAP32[(((tmPtr)+(28))>>2)]=yday;
      HEAP32[(((tmPtr)+(36))>>2)]=start.getTimezoneOffset() * 60;
  
      var dst = Number(start.getTimezoneOffset() != date.getTimezoneOffset());
      HEAP32[(((tmPtr)+(32))>>2)]=dst;
  
      HEAP32[(((tmPtr)+(40))>>2)]=___tm_timezone;
  
      return tmPtr;
    }function _localtime(time) {
      return _localtime_r(time, ___tm_current);
    }

  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

   
  Module["_bitshift64Lshr"] = _bitshift64Lshr;

  function _srand(seed) {
      HEAP32[((___rand_seed)>>2)]=seed
    }

  var _BDtoIHigh=true;

  
  
  
  
  var _environ=allocate(1, "i32*", ALLOC_STATIC);var ___environ=_environ;function ___buildEnvironment(env) {
      // WARNING: Arbitrary limit!
      var MAX_ENV_VALUES = 64;
      var TOTAL_ENV_SIZE = 1024;
  
      // Statically allocate memory for the environment.
      var poolPtr;
      var envPtr;
      if (!___buildEnvironment.called) {
        ___buildEnvironment.called = true;
        // Set default values. Use string keys for Closure Compiler compatibility.
        ENV['USER'] = 'root';
        ENV['PATH'] = '/';
        ENV['PWD'] = '/';
        ENV['HOME'] = '/home/emscripten';
        ENV['LANG'] = 'en_US.UTF-8';
        ENV['_'] = './this.program';
        // Allocate memory.
        poolPtr = allocate(TOTAL_ENV_SIZE, 'i8', ALLOC_STATIC);
        envPtr = allocate(MAX_ENV_VALUES * 4,
                          'i8*', ALLOC_STATIC);
        HEAP32[((envPtr)>>2)]=poolPtr;
        HEAP32[((_environ)>>2)]=envPtr;
      } else {
        envPtr = HEAP32[((_environ)>>2)];
        poolPtr = HEAP32[((envPtr)>>2)];
      }
  
      // Collect key=value lines.
      var strings = [];
      var totalSize = 0;
      for (var key in env) {
        if (typeof env[key] === 'string') {
          var line = key + '=' + env[key];
          strings.push(line);
          totalSize += line.length;
        }
      }
      if (totalSize > TOTAL_ENV_SIZE) {
        throw new Error('Environment size exceeded TOTAL_ENV_SIZE!');
      }
  
      // Make new.
      var ptrSize = 4;
      for (var i = 0; i < strings.length; i++) {
        var line = strings[i];
        writeAsciiToMemory(line, poolPtr);
        HEAP32[(((envPtr)+(i * ptrSize))>>2)]=poolPtr;
        poolPtr += line.length + 1;
      }
      HEAP32[(((envPtr)+(strings.length * ptrSize))>>2)]=0;
    }var ENV={};function _getenv(name) {
      // char *getenv(const char *name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/getenv.html
      if (name === 0) return 0;
      name = Pointer_stringify(name);
      if (!ENV.hasOwnProperty(name)) return 0;
  
      if (_getenv.ret) _free(_getenv.ret);
      _getenv.ret = allocate(intArrayFromString(ENV[name]), 'i8', ALLOC_NORMAL);
      return _getenv.ret;
    }

  function _vfprintf(s, f, va_arg) {
      return _fprintf(s, f, HEAP32[((va_arg)>>2)]);
    }

  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;

  function _strstr(ptr1, ptr2) {
      var check = 0, start;
      do {
        if (!check) {
          start = ptr1;
          check = ptr2;
        }
        var curr1 = HEAP8[((ptr1++)|0)];
        var curr2 = HEAP8[((check++)|0)];
        if (curr2 == 0) return start;
        if (curr2 != curr1) {
          // rewind to one character after start, to find ez in eeez
          ptr1 = start + 1;
          check = 0;
        }
      } while (curr1);
      return 0;
    }

  var _llvm_pow_f64=Math_pow;

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  
  function _sinh(x) {
      var p = Math.pow(Math.E, x);
      return (p - (1 / p)) / 2;
    }
  
  function _cosh(x) {
      var p = Math.pow(Math.E, x);
      return (p + (1 / p)) / 2;
    }function _tanh(x) {
      return _sinh(x) / _cosh(x);
    }

  function ___errno_location() {
      return ___errno_state;
    }

  var _BItoD=true;

  
  function _unlink(path) {
      // int unlink(const char *path);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/unlink.html
      path = Pointer_stringify(path);
      try {
        FS.unlink(path);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  
  function _rmdir(path) {
      // int rmdir(const char *path);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/rmdir.html
      path = Pointer_stringify(path);
      try {
        FS.rmdir(path);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _remove(path) {
      // int remove(const char *path);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/remove.html
      var ret = _unlink(path);
      if (ret == -1) ret = _rmdir(path);
      return ret;
    }

  function _modf(x, intpart) {
      HEAPF64[((intpart)>>3)]=Math.floor(x);
      return x - HEAPF64[((intpart)>>3)];
    }

  function _rename(old_path, new_path) {
      // int rename(const char *old, const char *new);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/rename.html
      old_path = Pointer_stringify(old_path);
      new_path = Pointer_stringify(new_path);
      try {
        FS.rename(old_path, new_path);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }

  function ___assert_fail(condition, filename, line, func) {
      ABORT = true;
      throw 'Assertion failed: ' + Pointer_stringify(condition) + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + stackTrace();
    }

  function _fgetc(stream) {
      // int fgetc(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgetc.html
      var streamObj = FS.getStreamFromPtr(stream);
      if (!streamObj) return -1;
      if (streamObj.eof || streamObj.error) return -1;
      var ret = _fread(_fgetc.ret, 1, 1, stream);
      if (ret == 0) {
        return -1;
      } else if (ret == -1) {
        streamObj.error = true;
        return -1;
      } else {
        return HEAPU8[((_fgetc.ret)|0)];
      }
    }

   
  Module["_memset"] = _memset;

  var _BDtoILow=true;

  function _jspn_jseval_helper(srcPtr) {
  		var addJSValue = Sparkling['_addJSValue'];
  		var src = Pointer_stringify(srcPtr);
  		var val = eval(src);
  		return addJSValue(val);
  	}


   
  Module["_bitshift64Shl"] = _bitshift64Shl;

  function _abort() {
      Module['abort']();
    }

  var _tan=Math_tan;

  function _feof(stream) {
      // int feof(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/feof.html
      stream = FS.getStreamFromPtr(stream);
      return Number(stream && stream.eof);
    }

   
  Module["_tolower"] = _tolower;

  var _asin=Math_asin;

  var _fabs=Math_abs;

  var _floor=Math_floor;


  
  function _lseek(fildes, offset, whence) {
      // off_t lseek(int fildes, off_t offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/lseek.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        return FS.llseek(stream, offset, whence);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fseek(stream, offset, whence) {
      // int fseek(FILE *stream, long offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fseek.html
      var fd = _fileno(stream);
      var ret = _lseek(fd, offset, whence);
      if (ret == -1) {
        return -1;
      }
      stream = FS.getStreamFromPtr(stream);
      stream.eof = false;
      return 0;
    }

  
  function _copysign(a, b) {
      return __reallyNegative(a) === __reallyNegative(b) ? a : -a;
    }var _copysignl=_copysign;

  var _sqrt=Math_sqrt;

  function _isxdigit(chr) {
      return (chr >= 48 && chr <= 57) ||
             (chr >= 97 && chr <= 102) ||
             (chr >= 65 && chr <= 70);
    }

  function _ftell(stream) {
      // long ftell(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ftell.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      if (FS.isChrdev(stream.node.mode)) {
        ___setErrNo(ERRNO_CODES.ESPIPE);
        return -1;
      } else {
        return stream.position;
      }
    }

  var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        
        // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
        // Module['forcedAspectRatio'] = 4 / 3;
        
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'] ||
                                    canvas['msRequestPointerLock'] ||
                                    function(){};
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 document['msExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas ||
                                document['msPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          var canvasContainer = canvas.parentNode;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvasContainer.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        return Math.max(-1, Math.min(1, event.type === 'DOMMouseScroll' ? event.detail : -event.wheelDelta));
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (scrollX + rect.left);
              y = t.pageY - (scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (scrollX + rect.left);
            y = event.pageY - (scrollY + rect.top);
          }
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      }};

  var _sin=Math_sin;

  
  function _fmod(x, y) {
      return x % y;
    }var _fmodl=_fmod;


  var _atan=Math_atan;

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }


  
  function _gmtime_r(time, tmPtr) {
      var date = new Date(HEAP32[((time)>>2)]*1000);
      HEAP32[((tmPtr)>>2)]=date.getUTCSeconds();
      HEAP32[(((tmPtr)+(4))>>2)]=date.getUTCMinutes();
      HEAP32[(((tmPtr)+(8))>>2)]=date.getUTCHours();
      HEAP32[(((tmPtr)+(12))>>2)]=date.getUTCDate();
      HEAP32[(((tmPtr)+(16))>>2)]=date.getUTCMonth();
      HEAP32[(((tmPtr)+(20))>>2)]=date.getUTCFullYear()-1900;
      HEAP32[(((tmPtr)+(24))>>2)]=date.getUTCDay();
      HEAP32[(((tmPtr)+(36))>>2)]=0;
      HEAP32[(((tmPtr)+(32))>>2)]=0;
      var start = new Date(date); // define date using UTC, start from Jan 01 00:00:00 UTC
      start.setUTCDate(1);
      start.setUTCMonth(0);
      start.setUTCHours(0);
      start.setUTCMinutes(0);
      start.setUTCSeconds(0);
      start.setUTCMilliseconds(0);
      var yday = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      HEAP32[(((tmPtr)+(28))>>2)]=yday;
      HEAP32[(((tmPtr)+(40))>>2)]=___tm_timezone;
  
      return tmPtr;
    }function _gmtime(time) {
      return _gmtime_r(time, ___tm_current);
    }

  function _strpbrk(ptr1, ptr2) {
      var curr;
      var searchSet = {};
      while (1) {
        var curr = HEAP8[((ptr2++)|0)];
        if (!curr) break;
        searchSet[curr] = 1;
      }
      while (1) {
        curr = HEAP8[(ptr1)];
        if (!curr) break;
        if (curr in searchSet) return ptr1;
        ptr1++;
      }
      return 0;
    }


  
  function _strerror_r(errnum, strerrbuf, buflen) {
      if (errnum in ERRNO_MESSAGES) {
        if (ERRNO_MESSAGES[errnum].length > buflen - 1) {
          return ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          var msg = ERRNO_MESSAGES[errnum];
          writeAsciiToMemory(msg, strerrbuf);
          return 0;
        }
      } else {
        return ___setErrNo(ERRNO_CODES.EINVAL);
      }
    }function _strerror(errnum) {
      if (!_strerror.buffer) _strerror.buffer = _malloc(256);
      _strerror_r(errnum, _strerror.buffer, 256);
      return _strerror.buffer;
    }

  var _ceil=Math_ceil;

  var _cos=Math_cos;

  
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr;
      var fd = _fileno(stream);
      var ret = _write(fd, _fputc.ret, 1);
      if (ret == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return -1;
      } else {
        return chr;
      }
    }function _putchar(c) {
      // int putchar(int c);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/putchar.html
      return _fputc(c, HEAP32[((_stdout)>>2)]);
    }

  function _puts(s) {
      // int puts(const char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/puts.html
      // NOTE: puts() always writes an extra newline.
      var stdout = HEAP32[((_stdout)>>2)];
      var ret = _fputs(s, stdout);
      if (ret < 0) {
        return ret;
      } else {
        var newlineRet = _fputc(10, stdout);
        return (newlineRet < 0) ? -1 : ret + 1;
      }
    }

  function _difftime(time1, time0) {
      return time1 - time0;
    }

  var _atan2=Math_atan2;

   
  Module["_strcpy"] = _strcpy;

  var _exp=Math_exp;

  function _exp2(x) {
      return Math.pow(2, x);
    }

  var _acos=Math_acos;

  
  function __isLeapYear(year) {
        return year%4 === 0 && (year%100 !== 0 || year%400 === 0);
    }
  
  function __arraySum(array, index) {
      var sum = 0;
      for (var i = 0; i <= index; sum += array[i++]);
      return sum;
    }
  
  
  var __MONTH_DAYS_LEAP=[31,29,31,30,31,30,31,31,30,31,30,31];
  
  var __MONTH_DAYS_REGULAR=[31,28,31,30,31,30,31,31,30,31,30,31];function __addDays(date, days) {
      var newDate = new Date(date.getTime());
      while(days > 0) {
        var leap = __isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
  
        if (days > daysInCurrentMonth-newDate.getDate()) {
          // we spill over to next month
          days -= (daysInCurrentMonth-newDate.getDate()+1);
          newDate.setDate(1);
          if (currentMonth < 11) {
            newDate.setMonth(currentMonth+1)
          } else {
            newDate.setMonth(0);
            newDate.setFullYear(newDate.getFullYear()+1);
          }
        } else {
          // we stay in current month 
          newDate.setDate(newDate.getDate()+days);
          return newDate;
        }
      }
  
      return newDate;
    }function _strftime(s, maxsize, format, tm) {
      // size_t strftime(char *restrict s, size_t maxsize, const char *restrict format, const struct tm *restrict timeptr);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/strftime.html
      
      var date = {
        tm_sec: HEAP32[((tm)>>2)],
        tm_min: HEAP32[(((tm)+(4))>>2)],
        tm_hour: HEAP32[(((tm)+(8))>>2)],
        tm_mday: HEAP32[(((tm)+(12))>>2)],
        tm_mon: HEAP32[(((tm)+(16))>>2)],
        tm_year: HEAP32[(((tm)+(20))>>2)],
        tm_wday: HEAP32[(((tm)+(24))>>2)],
        tm_yday: HEAP32[(((tm)+(28))>>2)],
        tm_isdst: HEAP32[(((tm)+(32))>>2)]
      };
  
      var pattern = Pointer_stringify(format);
  
      // expand format
      var EXPANSION_RULES_1 = {
        '%c': '%a %b %d %H:%M:%S %Y',     // Replaced by the locale's appropriate date and time representation - e.g., Mon Aug  3 14:02:01 2013
        '%D': '%m/%d/%y',                 // Equivalent to %m / %d / %y
        '%F': '%Y-%m-%d',                 // Equivalent to %Y - %m - %d
        '%h': '%b',                       // Equivalent to %b
        '%r': '%I:%M:%S %p',              // Replaced by the time in a.m. and p.m. notation
        '%R': '%H:%M',                    // Replaced by the time in 24-hour notation
        '%T': '%H:%M:%S',                 // Replaced by the time
        '%x': '%m/%d/%y',                 // Replaced by the locale's appropriate date representation
        '%X': '%H:%M:%S',                 // Replaced by the locale's appropriate date representation
      };
      for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule]);
      }
  
      var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
      function leadingSomething(value, digits, character) {
        var str = typeof value === 'number' ? value.toString() : (value || '');
        while (str.length < digits) {
          str = character[0]+str;
        }
        return str;
      };
  
      function leadingNulls(value, digits) {
        return leadingSomething(value, digits, '0');
      };
  
      function compareByDay(date1, date2) {
        function sgn(value) {
          return value < 0 ? -1 : (value > 0 ? 1 : 0);
        };
  
        var compare;
        if ((compare = sgn(date1.getFullYear()-date2.getFullYear())) === 0) {
          if ((compare = sgn(date1.getMonth()-date2.getMonth())) === 0) {
            compare = sgn(date1.getDate()-date2.getDate());
          }
        }
        return compare;
      };
  
      function getFirstWeekStartDate(janFourth) {
          switch (janFourth.getDay()) {
            case 0: // Sunday
              return new Date(janFourth.getFullYear()-1, 11, 29);
            case 1: // Monday
              return janFourth;
            case 2: // Tuesday
              return new Date(janFourth.getFullYear(), 0, 3);
            case 3: // Wednesday
              return new Date(janFourth.getFullYear(), 0, 2);
            case 4: // Thursday
              return new Date(janFourth.getFullYear(), 0, 1);
            case 5: // Friday
              return new Date(janFourth.getFullYear()-1, 11, 31);
            case 6: // Saturday
              return new Date(janFourth.getFullYear()-1, 11, 30);
          }
      };
  
      function getWeekBasedYear(date) {
          var thisDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
  
          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear()+1, 0, 4);
  
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  
          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            // this date is after the start of the first week of this year
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
              return thisDate.getFullYear()+1;
            } else {
              return thisDate.getFullYear();
            }
          } else { 
            return thisDate.getFullYear()-1;
          }
      };
  
      var EXPANSION_RULES_2 = {
        '%a': function(date) {
          return WEEKDAYS[date.tm_wday].substring(0,3);
        },
        '%A': function(date) {
          return WEEKDAYS[date.tm_wday];
        },
        '%b': function(date) {
          return MONTHS[date.tm_mon].substring(0,3);
        },
        '%B': function(date) {
          return MONTHS[date.tm_mon];
        },
        '%C': function(date) {
          var year = date.tm_year+1900;
          return leadingNulls(Math.floor(year/100),2);
        },
        '%d': function(date) {
          return leadingNulls(date.tm_mday, 2);
        },
        '%e': function(date) {
          return leadingSomething(date.tm_mday, 2, ' ');
        },
        '%g': function(date) {
          // %g, %G, and %V give values according to the ISO 8601:2000 standard week-based year. 
          // In this system, weeks begin on a Monday and week 1 of the year is the week that includes 
          // January 4th, which is also the week that includes the first Thursday of the year, and 
          // is also the first week that contains at least four days in the year. 
          // If the first Monday of January is the 2nd, 3rd, or 4th, the preceding days are part of 
          // the last week of the preceding year; thus, for Saturday 2nd January 1999, 
          // %G is replaced by 1998 and %V is replaced by 53. If December 29th, 30th, 
          // or 31st is a Monday, it and any following days are part of week 1 of the following year. 
          // Thus, for Tuesday 30th December 1997, %G is replaced by 1998 and %V is replaced by 01.
          
          return getWeekBasedYear(date).toString().substring(2);
        },
        '%G': function(date) {
          return getWeekBasedYear(date);
        },
        '%H': function(date) {
          return leadingNulls(date.tm_hour, 2);
        },
        '%I': function(date) {
          return leadingNulls(date.tm_hour < 13 ? date.tm_hour : date.tm_hour-12, 2);
        },
        '%j': function(date) {
          // Day of the year (001-366)
          return leadingNulls(date.tm_mday+__arraySum(__isLeapYear(date.tm_year+1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon-1), 3);
        },
        '%m': function(date) {
          return leadingNulls(date.tm_mon+1, 2);
        },
        '%M': function(date) {
          return leadingNulls(date.tm_min, 2);
        },
        '%n': function() {
          return '\n';
        },
        '%p': function(date) {
          if (date.tm_hour > 0 && date.tm_hour < 13) {
            return 'AM';
          } else {
            return 'PM';
          }
        },
        '%S': function(date) {
          return leadingNulls(date.tm_sec, 2);
        },
        '%t': function() {
          return '\t';
        },
        '%u': function(date) {
          var day = new Date(date.tm_year+1900, date.tm_mon+1, date.tm_mday, 0, 0, 0, 0);
          return day.getDay() || 7;
        },
        '%U': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53]. 
          // The first Sunday of January is the first day of week 1; 
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year+1900, 0, 1);
          var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7-janFirst.getDay());
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
          
          // is target date after the first Sunday?
          if (compareByDay(firstSunday, endDate) < 0) {
            // calculate difference in days between first Sunday and endDate
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstSundayUntilEndJanuary = 31-firstSunday.getDate();
            var days = firstSundayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
  
          return compareByDay(firstSunday, janFirst) === 0 ? '01': '00';
        },
        '%V': function(date) {
          // Replaced by the week number of the year (Monday as the first day of the week) 
          // as a decimal number [01,53]. If the week containing 1 January has four 
          // or more days in the new year, then it is considered week 1. 
          // Otherwise, it is the last week of the previous year, and the next week is week 1. 
          // Both January 4th and the first Thursday of January are always in week 1. [ tm_year, tm_wday, tm_yday]
          var janFourthThisYear = new Date(date.tm_year+1900, 0, 4);
          var janFourthNextYear = new Date(date.tm_year+1901, 0, 4);
  
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  
          var endDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
  
          if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
            // if given date is before this years first week, then it belongs to the 53rd week of last year
            return '53';
          } 
  
          if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
            // if given date is after next years first week, then it belongs to the 01th week of next year
            return '01';
          }
  
          // given date is in between CW 01..53 of this calendar year
          var daysDifference;
          if (firstWeekStartThisYear.getFullYear() < date.tm_year+1900) {
            // first CW of this year starts last year
            daysDifference = date.tm_yday+32-firstWeekStartThisYear.getDate()
          } else {
            // first CW of this year starts this year
            daysDifference = date.tm_yday+1-firstWeekStartThisYear.getDate();
          }
          return leadingNulls(Math.ceil(daysDifference/7), 2);
        },
        '%w': function(date) {
          var day = new Date(date.tm_year+1900, date.tm_mon+1, date.tm_mday, 0, 0, 0, 0);
          return day.getDay();
        },
        '%W': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53]. 
          // The first Monday of January is the first day of week 1; 
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year, 0, 1);
          var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7-janFirst.getDay()+1);
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
  
          // is target date after the first Monday?
          if (compareByDay(firstMonday, endDate) < 0) {
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstMondayUntilEndJanuary = 31-firstMonday.getDate();
            var days = firstMondayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
          return compareByDay(firstMonday, janFirst) === 0 ? '01': '00';
        },
        '%y': function(date) {
          // Replaced by the last two digits of the year as a decimal number [00,99]. [ tm_year]
          return (date.tm_year+1900).toString().substring(2);
        },
        '%Y': function(date) {
          // Replaced by the year as a decimal number (for example, 1997). [ tm_year]
          return date.tm_year+1900;
        },
        '%z': function(date) {
          // Replaced by the offset from UTC in the ISO 8601:2000 standard format ( +hhmm or -hhmm ),
          // or by no characters if no timezone is determinable. 
          // For example, "-0430" means 4 hours 30 minutes behind UTC (west of Greenwich). 
          // If tm_isdst is zero, the standard time offset is used. 
          // If tm_isdst is greater than zero, the daylight savings time offset is used. 
          // If tm_isdst is negative, no characters are returned. 
          // FIXME: we cannot determine time zone (or can we?)
          return '';
        },
        '%Z': function(date) {
          // Replaced by the timezone name or abbreviation, or by no bytes if no timezone information exists. [ tm_isdst]
          // FIXME: we cannot determine time zone (or can we?)
          return '';
        },
        '%%': function() {
          return '%';
        }
      };
      for (var rule in EXPANSION_RULES_2) {
        if (pattern.indexOf(rule) >= 0) {
          pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date));
        }
      }
  
      var bytes = intArrayFromString(pattern, false);
      if (bytes.length > maxsize) {
        return 0;
      } 
  
      writeArrayToMemory(bytes, s);
      return bytes.length-1;
    }



FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
___buildEnvironment(ENV);
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");

 var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);
 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);

var Math_min = Math.min;
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module["dynCall_iiiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.ctlz_i8|0;var o=env.___rand_seed|0;var p=env._stderr|0;var q=env._stdin|0;var r=env._stdout|0;var s=0;var t=0;var u=0;var v=0;var w=+env.NaN,x=+env.Infinity;var y=0,z=0,A=0,B=0,C=0.0,D=0,E=0,F=0,G=0.0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=0;var N=0;var O=0;var P=0;var Q=0;var R=global.Math.floor;var S=global.Math.abs;var T=global.Math.sqrt;var U=global.Math.pow;var V=global.Math.cos;var W=global.Math.sin;var X=global.Math.tan;var Y=global.Math.acos;var Z=global.Math.asin;var _=global.Math.atan;var $=global.Math.atan2;var aa=global.Math.exp;var ba=global.Math.log;var ca=global.Math.ceil;var da=global.Math.imul;var ea=env.abort;var fa=env.assert;var ga=env.asmPrintInt;var ha=env.asmPrintFloat;var ia=env.min;var ja=env.invoke_ii;var ka=env.invoke_iiii;var la=env.invoke_iii;var ma=env.invoke_iiiii;var na=env.invoke_vi;var oa=env._isalnum;var pa=env._fabs;var qa=env._exp;var ra=env._fread;var sa=env._log10;var ta=env._strpbrk;var ua=env.___assert_fail;var va=env.__addDays;var wa=env._fsync;var xa=env._rename;var ya=env._sbrk;var za=env._emscripten_memcpy_big;var Aa=env._exp2;var Ba=env._sinh;var Ca=env._sysconf;var Da=env._close;var Ea=env._cos;var Fa=env._tanh;var Ga=env._puts;var Ha=env._unlink;var Ia=env._write;var Ja=env.__isLeapYear;var Ka=env._ftell;var La=env._gmtime_r;var Ma=env._strstr;var Na=env._tmpnam;var Oa=env._tmpfile;var Pa=env._send;var Qa=env._atan2;var Ra=env._modf;var Sa=env._strtol;var Ta=env.___setErrNo;var Ua=env._isalpha;var Va=env._srand;var Wa=env._putchar;var Xa=env._gmtime;var Ya=env._printf;var Za=env._localtime;var _a=env._jspn_callJSFunc;var $a=env._read;var ab=env._fwrite;var bb=env._time;var cb=env._fprintf;var db=env._llvm_pow_f64;var eb=env._fmod;var fb=env._lseek;var gb=env._vfprintf;var hb=env._rmdir;var ib=env._asin;var jb=env._floor;var kb=env._pwrite;var lb=env._localtime_r;var mb=env._tzset;var nb=env._open;var ob=env._remove;var pb=env._strftime;var qb=env._fseek;var rb=env._getenv;var sb=env._fclose;var tb=env.__parseInt;var ub=env._log;var vb=env._recv;var wb=env._tan;var xb=env._fgetc;var yb=env._jspn_jseval_helper;var zb=env._fputc;var Ab=env._abort;var Bb=env._ceil;var Cb=env._isspace;var Db=env._fopen;var Eb=env._sin;var Fb=env._acos;var Gb=env._cosh;var Hb=env.___buildEnvironment;var Ib=env._difftime;var Jb=env._system;var Kb=env._fflush;var Lb=env.__reallyNegative;var Mb=env._fileno;var Nb=env.__arraySum;var Ob=env._atan;var Pb=env._pread;var Qb=env._mkport;var Rb=env._toupper;var Sb=env._feof;var Tb=env.___errno_location;var Ub=env._copysign;var Vb=env._isxdigit;var Wb=env._strerror;var Xb=env.__formatString;var Yb=env._fputs;var Zb=env._sqrt;var _b=env._strerror_r;var $b=0.0;
// EMSCRIPTEN_START_FUNCS
function fc(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7&-8;return b|0}function gc(){return i|0}function hc(a){a=a|0;i=a}function ic(a,b){a=a|0;b=b|0;if((s|0)==0){s=a;t=b}}function jc(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function kc(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function lc(a){a=a|0;H=a}function mc(a){a=a|0;I=a}function nc(a){a=a|0;J=a}function oc(a){a=a|0;K=a}function pc(a){a=a|0;L=a}function qc(a){a=a|0;M=a}function rc(a){a=a|0;N=a}function sc(a){a=a|0;O=a}function tc(a){a=a|0;P=a}function uc(a){a=a|0;Q=a}function vc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;e=c[a>>2]|0;do{if((e|0)==(c[b>>2]|0)){f=c[e+4>>2]|0;if((f|0)==0){g=(a|0)==(b|0)|0;break}else{g=cc[f&7](a,b)|0;break}}else{g=0}}while(0);i=d;return g|0}function wc(a){a=a|0;var b=0,d=0;b=i;d=ve(c[a>>2]|0)|0;c[d>>2]=a;c[d+4>>2]=1;i=b;return d|0}function xc(a){a=a|0;var b=0;b=a+4|0;c[b>>2]=(c[b>>2]|0)+1;i=i;return}function yc(a){a=a|0;var b=0,d=0,e=0;b=i;d=a+4|0;e=(c[d>>2]|0)+ -1|0;c[d>>2]=e;if((e|0)!=0){i=b;return}e=c[(c[a>>2]|0)+16>>2]|0;if((e|0)!=0){ec[e&7](a)}gi(a);i=b;return}function zc(a,b){a=a|0;b=b|0;c[a>>2]=1;c[a+8>>2]=b;i=i;return}function Ac(a,b){a=a|0;b=b|0;c[a>>2]=2;c[a+8>>2]=b;i=i;return}function Bc(a,b){a=a|0;b=+b;c[a>>2]=514;h[a+8>>3]=b;i=i;return}function Cc(a,b){a=a|0;b=b|0;c[a>>2]=7;c[a+8>>2]=b;i=i;return}function Dc(a,b){a=a|0;b=b|0;c[a>>2]=263;c[a+8>>2]=b;i=i;return}function Ec(a){a=a|0;var b=0,d=0;b=i;if((c[a>>2]&256|0)==0){i=b;return}d=(c[a+8>>2]|0)+4|0;c[d>>2]=(c[d>>2]|0)+1;i=b;return}function Fc(a){a=a|0;var b=0,d=0,e=0;b=i;if((c[a>>2]&256|0)==0){i=b;return}d=c[a+8>>2]|0;a=d+4|0;e=(c[a>>2]|0)+ -1|0;c[a>>2]=e;if((e|0)!=0){i=b;return}e=c[(c[d>>2]|0)+16>>2]|0;if((e|0)!=0){ec[e&7](d)}gi(d);i=b;return}function Gc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0.0,m=0,n=0,o=0,p=0;d=i;e=c[a>>2]|0;f=e&255;g=c[b>>2]|0;a:do{if((f|0)==(g&255|0)){switch(f|0){case 1:{j=(c[a+8>>2]|0)==(c[b+8>>2]|0)|0;break a;break};case 2:{k=(g&767|0)!=514;do{if((e&767|0)==514){if(k){l=+(c[b+8>>2]|0)}else{l=+h[b+8>>3]}m=+h[a+8>>3]==l}else{n=c[a+8>>2]|0;if(k){m=(n|0)==(c[b+8>>2]|0);break}else{m=+(n|0)==+h[b+8>>3];break}}}while(0);j=m&1;break a;break};case 6:case 5:case 4:case 3:{k=c[a+8>>2]|0;n=c[b+8>>2]|0;o=c[k>>2]|0;if((o|0)!=(c[n>>2]|0)){j=0;break a}p=c[o+4>>2]|0;if((p|0)==0){j=(k|0)==(n|0)|0;break a}else{j=cc[p&7](k,n)|0;break a}break};case 7:{n=e&256;if((n>>>8|0)!=(g>>>8&1|0)){j=0;break a}k=c[a+8>>2]|0;p=c[b+8>>2]|0;if((n|0)==0){j=(k|0)==(p|0)|0;break a}n=c[k>>2]|0;if((n|0)!=(c[p>>2]|0)){j=0;break a}o=c[n+4>>2]|0;if((o|0)==0){j=(k|0)==(p|0)|0;break a}else{j=cc[o&7](k,p)|0;break a}break};case 0:{j=1;break a;break};default:{j=0;break a}}}else{j=0}}while(0);i=d;return j|0}function Hc(a,b){a=a|0;b=b|0;var c=0,d=0;c=i;d=(Gc(a,b)|0)==0|0;i=c;return d|0}function Ic(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0.0,l=0.0,m=0;d=i;e=c[a>>2]|0;do{if((e&255|0)==2){f=c[b>>2]|0;if((f&255|0)!=2){g=14;break}j=(f&767|0)!=514;if((e&767|0)==514){k=+h[a+8>>3];if(j){l=+(c[b+8>>2]|0);if(k<l){m=-1;break}m=k>l|0;break}else{l=+h[b+8>>3];if(k<l){m=-1;break}m=k>l|0;break}}else{f=c[a+8>>2]|0;if(j){j=c[b+8>>2]|0;if((f|0)<(j|0)){m=-1;break}m=(f|0)>(j|0)|0;break}else{l=+(f|0);k=+h[b+8>>3];if(l<k){m=-1;break}m=l>k|0;break}}}else{g=14}}while(0);if((g|0)==14){g=c[a+8>>2]|0;m=cc[c[(c[g>>2]|0)+8>>2]&7](g,c[b+8>>2]|0)|0}i=d;return m|0}function Jc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;e=c[a>>2]|0;if((e&255|0)==2){if((c[b>>2]&255|0)==2){f=1}else{g=3}}else{g=3}do{if((g|0)==3){if((e&256|0)==0){f=0;break}if((c[b>>2]&256|0)==0){f=0;break}h=c[c[a+8>>2]>>2]|0;if((h|0)!=(c[c[b+8>>2]>>2]|0)){f=0;break}f=(c[h+8>>2]|0)!=0|0}}while(0);i=d;return f|0}function Kc(a,b){a=a|0;b=b|0;var c=0,e=0,f=0,g=0,h=0;c=i;if((b|0)==0){e=0;i=c;return e|0}else{f=b;g=0;h=a}while(1){a=f+ -1|0;b=(d[h]|0)+(g*65599|0)|0;if((a|0)==0){e=b;break}else{h=h+1|0;g=b;f=a}}i=c;return e|0}function Lc(a){a=a|0;var b=0,d=0,e=0,f=0.0,g=0,j=0,l=0,m=0,n=0,o=0,p=0;b=i;d=c[a>>2]|0;switch(d&255|0){case 1:{e=c[a+8>>2]|0;i=b;return e|0};case 2:{if((d&512|0)==0){e=c[a+8>>2]|0;i=b;return e|0}f=+h[a+8>>3];g=~~f;h[k>>3]=f;j=c[k>>2]|0;l=c[k+4>>2]|0;if(f==+(g|0)){e=g;i=b;return e|0}g=Di(j|0,l|0,56)|0;m=Di(j|0,l|0,48)|0;n=Di(j|0,l|0,40)|0;o=Di(j|0,l|0,24)|0;p=Di(j|0,l|0,16)|0;e=g+(((m&255)+(((n&255)+(((l&255)+(((o&255)+(((p&255)+((((Di(j|0,l|0,8)|0)&255)+((j&255)*65599|0)|0)*65599|0)|0)*65599|0)|0)*65599|0)|0)*65599|0)|0)*65599|0)|0)*65599|0)|0;i=b;return e|0};case 6:case 5:case 4:case 3:{j=c[a+8>>2]|0;l=c[(c[j>>2]|0)+12>>2]|0;if((l|0)==0){e=j;i=b;return e|0}else{e=ac[l&15](j)|0;i=b;return e|0}break};case 7:{j=c[a+8>>2]|0;if((d&256|0)==0){e=j;i=b;return e|0}d=c[(c[j>>2]|0)+12>>2]|0;if((d|0)==0){e=j;i=b;return e|0}else{e=ac[d&15](j)|0;i=b;return e|0}break};default:{e=0;i=b;return e|0}}return 0}function Mc(a){a=a|0;var b=0,d=0,e=0,f=0.0,g=0,j=0;b=i;i=i+16|0;d=b;e=c[a>>2]|0;switch(e&255|0){case 2:{if((e&512|0)==0){c[d>>2]=c[a+8>>2];Ya(88,d|0)|0;i=b;return}else{f=+h[a+8>>3];c[d>>2]=15;e=d+4|0;h[k>>3]=f;c[e>>2]=c[k>>2];c[e+4>>2]=c[k+4>>2];Ya(80,d|0)|0;i=b;return}break};case 3:{Yb(c[(c[a+8>>2]|0)+8>>2]|0,c[r>>2]|0)|0;i=b;return};case 4:{Nc(c[a+8>>2]|0,0);i=b;return};case 5:{Oc(c[a+8>>2]|0,0);i=b;return};case 6:{e=c[a+8>>2]|0;g=e+44|0;if((c[e+12>>2]|0)==0){j=c[g>>2]|0}else{j=c[g>>2]|0}c[d>>2]=j;Ya(96,d|0)|0;i=b;return};case 7:{c[d>>2]=c[a+8>>2];Ya(112,d|0)|0;i=b;return};case 0:{ab(56,3,1,c[r>>2]|0)|0;i=b;return};case 1:{Yb(((c[a+8>>2]|0)!=0?64:72)|0,c[r>>2]|0)|0;i=b;return};default:{i=b;return}}}function Nc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;d=i;i=i+32|0;e=d+16|0;f=d;g=Uc(a)|0;Ga(288)|0;if((g|0)!=0){h=b+1|0;j=(b|0)>-1;k=f+8|0;l=0;do{if(j){m=0;do{Ya(280,e|0)|0;m=m+1|0;}while((m|0)!=(h|0))}Vc(a,l,f);m=c[f>>2]&255;if((m|0)==4){Nc(c[k>>2]|0,h)}else if((m|0)==5){Oc(c[k>>2]|0,h)}else if((m|0)==3){Wa(34)|0;Mc(f);Wa(34)|0}else{Mc(f)}Wa(10)|0;l=l+1|0;}while((l|0)!=(g|0))}if((b|0)>0){n=0}else{Wa(93)|0;i=d;return}do{Ya(280,e|0)|0;n=n+1|0;}while((n|0)!=(b|0));Wa(93)|0;i=d;return}function Oc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;d=i;i=i+48|0;e=d+32|0;f=d+16|0;g=d;Ga(296)|0;h=Yd(a,0,f,g)|0;a:do{if((h|0)!=0){j=b+1|0;k=g+8|0;l=f+8|0;if((b|0)>-1){m=h}else{n=h;while(1){o=c[f>>2]&255;if((o|0)==4){Nc(c[l>>2]|0,j)}else if((o|0)==5){Oc(c[l>>2]|0,j)}else if((o|0)==3){Wa(34)|0;Mc(f);Wa(34)|0}else{Mc(f)}Ya(272,e|0)|0;o=c[g>>2]&255;if((o|0)==4){Nc(c[k>>2]|0,j)}else if((o|0)==5){Oc(c[k>>2]|0,j)}else if((o|0)==3){Wa(34)|0;Mc(g);Wa(34)|0}else{Mc(g)}Wa(10)|0;n=Yd(a,n,f,g)|0;if((n|0)==0){break a}}}do{n=0;do{Ya(280,e|0)|0;n=n+1|0;}while((n|0)!=(j|0));n=c[f>>2]&255;if((n|0)==3){Wa(34)|0;Mc(f);Wa(34)|0}else if((n|0)==5){Oc(c[l>>2]|0,j)}else if((n|0)==4){Nc(c[l>>2]|0,j)}else{Mc(f)}Ya(272,e|0)|0;n=c[g>>2]&255;if((n|0)==3){Wa(34)|0;Mc(g);Wa(34)|0}else if((n|0)==5){Oc(c[k>>2]|0,j)}else if((n|0)==4){Nc(c[k>>2]|0,j)}else{Mc(g)}Wa(10)|0;m=Yd(a,m,f,g)|0;}while((m|0)!=0)}}while(0);if((b|0)>0){p=0}else{Wa(125)|0;i=d;return}do{Ya(280,e|0)|0;p=p+1|0;}while((p|0)!=(b|0));Wa(125)|0;i=d;return}function Pc(a){a=a|0;var b=0,d=0,e=0;b=i;i=i+16|0;d=b;e=c[a>>2]&255;if((e|0)==3){Wa(34)|0;Mc(a);Wa(34)|0;i=b;return}else if((e|0)==4){c[d>>2]=c[a+8>>2];Ya(128,d|0)|0;i=b;return}else if((e|0)==5){c[d>>2]=c[a+8>>2];Ya(144,d|0)|0;i=b;return}else{Mc(a);i=b;return}}function Qc(a){a=a|0;i=i;return c[160+((a&255)<<2)>>2]|0}function Rc(a){a=a|0;var b=0,c=0;b=i;c=Sc(a,0,1)|0;i=b;return c|0}function Sc(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;g=Db(b|0,264)|0;do{if((g|0)==0){h=0}else{if((qb(g|0,0,2)|0)<0){sb(g|0)|0;h=0;break}b=Ka(g|0)|0;if((b|0)<0){sb(g|0)|0;h=0;break}if(!((b|0)!=0|(e|0)==0)){sb(g|0)|0;j=fi(1)|0;if((j|0)==0){h=0;break}a[j]=0;h=j;break}if((qb(g|0,0,0)|0)<0){sb(g|0)|0;h=0;break}j=(e|0)!=0;k=fi(b+(j&1)|0)|0;if((k|0)==0){sb(g|0)|0;h=0;break}l=(ra(k|0,b|0,1,g|0)|0)==0;sb(g|0)|0;if(l){gi(k);h=0;break}if(j){a[k+b|0]=0}if((d|0)==0){h=k;break}c[d>>2]=b;h=k}}while(0);i=f;return h|0}function Tc(){var a=0,b=0;a=i;b=wc(304)|0;c[b+8>>2]=0;c[b+12>>2]=0;c[b+16>>2]=0;i=a;return b|0}function Uc(a){a=a|0;i=i;return c[a+12>>2]|0}function Vc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;i=i+16|0;f=e;g=c[a+12>>2]|0;if(g>>>0>b>>>0){h=(c[a+8>>2]|0)+(b<<4)|0;c[d+0>>2]=c[h+0>>2];c[d+4>>2]=c[h+4>>2];c[d+8>>2]=c[h+8>>2];c[d+12>>2]=c[h+12>>2];i=e;return}else{c[f>>2]=b;c[f+4>>2]=g;we(328,f)}}function Wc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;i=i+16|0;f=e;g=c[a+12>>2]|0;if(g>>>0>b>>>0){Ec(d);h=a+8|0;Fc((c[h>>2]|0)+(b<<4)|0);a=(c[h>>2]|0)+(b<<4)|0;c[a+0>>2]=c[d+0>>2];c[a+4>>2]=c[d+4>>2];c[a+8>>2]=c[d+8>>2];c[a+12>>2]=c[d+12>>2];i=e;return}else{c[f>>2]=b;c[f+4>>2]=g;we(328,f)}}function Xc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;e=i;i=i+16|0;f=e;g=a+12|0;h=c[g>>2]|0;if(h>>>0<b>>>0){c[f>>2]=b;c[f+4>>2]=h;we(328,f)}f=h+1|0;c[g>>2]=f;j=a+16|0;k=c[j>>2]|0;if((k|0)==0){c[j>>2]=8;c[a+8>>2]=ve(128)|0;l=c[g>>2]|0;m=c[j>>2]|0}else{l=f;m=k}if(l>>>0>m>>>0){c[j>>2]=m<<1;j=a+8|0;c[j>>2]=xe(c[j>>2]|0,m<<5)|0}m=a+8|0;if(h>>>0>b>>>0){a=h;do{h=c[m>>2]|0;j=h+(a<<4)|0;a=a+ -1|0;l=h+(a<<4)|0;c[j+0>>2]=c[l+0>>2];c[j+4>>2]=c[l+4>>2];c[j+8>>2]=c[l+8>>2];c[j+12>>2]=c[l+12>>2];}while(a>>>0>b>>>0)}Ec(d);a=(c[m>>2]|0)+(b<<4)|0;c[a+0>>2]=c[d+0>>2];c[a+4>>2]=c[d+4>>2];c[a+8>>2]=c[d+8>>2];c[a+12>>2]=c[d+12>>2];i=e;return}function Yc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;i=i+16|0;e=d;f=a+12|0;g=c[f>>2]|0;if(!(g>>>0>b>>>0)){c[e>>2]=b;c[e+4>>2]=g;we(328,e)}e=a+8|0;Fc((c[e>>2]|0)+(b<<4)|0);a=(c[f>>2]|0)+ -1|0;c[f>>2]=a;if(a>>>0>b>>>0){h=b}else{i=d;return}do{b=c[e>>2]|0;a=b+(h<<4)|0;h=h+1|0;g=b+(h<<4)|0;c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];}while(h>>>0<(c[f>>2]|0)>>>0);i=d;return}function Zc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0;e=i;i=i+16|0;f=e;g=c[a+12>>2]|0;h=c[d+12>>2]|0;if(g>>>0<b>>>0){c[f>>2]=b;c[f+4>>2]=g;we(328,f)}_c(a,h+g|0);if(g>>>0>b>>>0){f=a+8|0;j=g;do{j=j+ -1|0;g=c[f>>2]|0;k=g+(j+h<<4)|0;l=g+(j<<4)|0;c[k+0>>2]=c[l+0>>2];c[k+4>>2]=c[l+4>>2];c[k+8>>2]=c[l+8>>2];c[k+12>>2]=c[l+12>>2];}while(j>>>0>b>>>0)}if((h|0)==0){i=e;return}j=d+8|0;d=a+8|0;a=b;b=0;while(1){Ec((c[j>>2]|0)+(b<<4)|0);f=(c[d>>2]|0)+(a<<4)|0;l=(c[j>>2]|0)+(b<<4)|0;c[f+0>>2]=c[l+0>>2];c[f+4>>2]=c[l+4>>2];c[f+8>>2]=c[l+8>>2];c[f+12>>2]=c[l+12>>2];l=b+1|0;if((l|0)==(h|0)){break}else{b=l;a=a+1|0}}i=e;return}function _c(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;d=i;i=i+16|0;e=d;f=a+12|0;g=c[f>>2]|0;a:do{if(g>>>0<b>>>0){h=g;j=g;while(1){Xc(a,h,8);k=j+1|0;if((k|0)==(b|0)){break a}h=c[f>>2]|0;j=k}}}while(0);if(!(g>>>0>b>>>0)){i=d;return}j=a+8|0;a=c[f>>2]|0;h=b;while(1){if((a|0)==0){l=7;break}b=a+ -1|0;Fc((c[j>>2]|0)+(b<<4)|0);k=(c[f>>2]|0)+ -1|0;c[f>>2]=k;if(k>>>0>b>>>0){m=b;while(1){b=c[j>>2]|0;n=b+(m<<4)|0;o=m+1|0;p=b+(o<<4)|0;c[n+0>>2]=c[p+0>>2];c[n+4>>2]=c[p+4>>2];c[n+8>>2]=c[p+8>>2];c[n+12>>2]=c[p+12>>2];p=c[f>>2]|0;if(o>>>0<p>>>0){m=o}else{q=p;break}}}else{q=k}m=h+1|0;if(m>>>0<g>>>0){a=q;h=m}else{l=11;break}}if((l|0)==7){we(376,e)}else if((l|0)==11){i=d;return}}function $c(a,b){a=a|0;b=b|0;var d=0;d=i;Xc(a,c[a+12>>2]|0,b);i=d;return}function ad(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0;b=i;i=i+16|0;d=a+12|0;e=c[d>>2]|0;if((e|0)==0){we(376,b)}f=e+ -1|0;e=a+8|0;Fc((c[e>>2]|0)+(f<<4)|0);a=(c[d>>2]|0)+ -1|0;c[d>>2]=a;if(a>>>0>f>>>0){g=f}else{i=b;return}do{f=c[e>>2]|0;a=f+(g<<4)|0;g=g+1|0;h=f+(g<<4)|0;c[a+0>>2]=c[h+0>>2];c[a+4>>2]=c[h+4>>2];c[a+8>>2]=c[h+8>>2];c[a+12>>2]=c[h+12>>2];}while(g>>>0<(c[d>>2]|0)>>>0);i=b;return}function bd(a){a=a|0;var b=0,d=0;b=i;d=wc(304)|0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+16>>2]=0;c[a>>2]=260;c[a+8>>2]=d;i=b;return}function cd(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0;b=i;d=a+12|0;e=a+8|0;a=c[e>>2]|0;if((c[d>>2]|0)==0){f=a;gi(f);i=b;return}else{g=a;h=0}while(1){Fc(g+(h<<4)|0);a=h+1|0;j=c[e>>2]|0;if(a>>>0<(c[d>>2]|0)>>>0){h=a;g=j}else{f=j;break}}gi(f);i=b;return}function dd(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;e=ve(40)|0;c[e>>2]=a;a=e+8|0;c[a+0>>2]=c[8>>2];c[a+4>>2]=c[12>>2];c[a+8>>2]=c[16>>2];c[a+12>>2]=c[20>>2];c[e+24>>2]=0;c[e+28>>2]=b;c[e+32>>2]=0;c[e+36>>2]=0;i=d;return e|0}function ed(a){a=a|0;var b=0,d=0;b=i;if((a|0)==0){i=b;return}Fc(a+8|0);d=c[a+24>>2]|0;if((d|0)!=0){yc(d)}ed(c[a+32>>2]|0);ed(c[a+36>>2]|0);gi(a);i=b;return}function fd(){var a=0,b=0;a=i;b=ve(44)|0;c[b+12>>2]=0;c[b+32>>2]=0;c[b+36>>2]=0;c[b+40>>2]=0;i=a;return b|0}function gd(a){a=a|0;var b=0;b=i;gi(c[a+12>>2]|0);gi(a);i=b;return}function hd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0;d=i;i=i+80|0;e=d+40|0;f=d+36|0;g=d+44|0;h=d+20|0;j=d;k=d+16|0;l=d+24|0;m=d+48|0;n=d+64|0;c[a>>2]=0;o=a+4|0;c[o>>2]=0;p=a+8|0;c[n+0>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;c[n+12>>2]=0;c[p>>2]=64;q=xe(0,256)|0;c[a>>2]=q;r=q+(c[o>>2]<<2)|0;c[r+0>>2]=c[n+0>>2];c[r+4>>2]=c[n+4>>2];c[r+8>>2]=c[n+8>>2];c[r+12>>2]=c[n+12>>2];c[o>>2]=(c[o>>2]|0)+4;c[l>>2]=Tc()|0;n=l+4|0;c[n>>2]=Pd()|0;c[l+8>>2]=0;c[m>>2]=Tc()|0;r=m+4|0;c[r>>2]=Pd()|0;c[m+8>>2]=0;q=a+24|0;c[q>>2]=l;s=a+28|0;c[s>>2]=m;t=a+20|0;c[t>>2]=0;do{if((jd(a,c[b+32>>2]|0)|0)==0){u=3}else{if((jd(a,c[b+36>>2]|0)|0)==0){u=3;break}v=c[p>>2]|0;w=c[o>>2]|0;x=w+2|0;if(v>>>0<x>>>0){if((v|0)==0){c[p>>2]=64;y=64}else{y=v}if(y>>>0<x>>>0){v=y;do{v=v<<1;}while(v>>>0<x>>>0);c[p>>2]=v;z=v}else{z=y}x=xe(c[a>>2]|0,z<<2)|0;c[a>>2]=x;A=x;B=c[o>>2]|0}else{A=c[a>>2]|0;B=w}x=A+(B<<2)|0;c[x>>2]=28;c[x+4>>2]=1;x=c[o>>2]|0;c[o>>2]=x+2;C=c[t>>2]|0;if((C|0)<1){c[t>>2]=1;D=1}else{D=C}C=c[(c[s>>2]|0)+8>>2]|0;E=(D|0)>(C|0)?D:C;C=c[a>>2]|0;c[C>>2]=x+ -2;c[C+4>>2]=0;c[C+8>>2]=E;C=Uc(c[c[q>>2]>>2]|0)|0;c[(c[a>>2]|0)+12>>2]=C;C=Uc(c[c[q>>2]>>2]|0)|0;a:do{if((C|0)>0){x=j+8|0;F=0;b:while(1){Vc(c[c[q>>2]>>2]|0,F,j);G=c[j>>2]&255;do{if((G|0)==3){H=c[x>>2]|0;I=H+12|0;J=c[I>>2]<<8;K=c[p>>2]|0;L=c[o>>2]|0;M=L+1|0;if(K>>>0<M>>>0){if((K|0)==0){c[p>>2]=64;N=64}else{N=K}if(N>>>0<M>>>0){K=N;do{K=K<<1;}while(K>>>0<M>>>0);c[p>>2]=K;O=K}else{O=N}M=xe(c[a>>2]|0,O<<2)|0;c[a>>2]=M;P=M;Q=c[o>>2]|0}else{P=c[a>>2]|0;Q=L}c[P+(Q<<2)>>2]=J;c[o>>2]=(c[o>>2]|0)+1;kd(a,c[H+8>>2]|0,c[I>>2]|0)}else if((G|0)==7){M=c[x>>2]|0;R=c[M+8>>2]|0;if((R|0)==0){S=c[M+12>>2]|0;T=S+12|0;U=c[T>>2]<<8|1;V=c[p>>2]|0;W=c[o>>2]|0;X=W+1|0;if(V>>>0<X>>>0){if((V|0)==0){c[p>>2]=64;Y=64}else{Y=V}if(Y>>>0<X>>>0){V=Y;do{V=V<<1;}while(V>>>0<X>>>0);c[p>>2]=V;Z=V}else{Z=Y}X=xe(c[a>>2]|0,Z<<2)|0;c[a>>2]=X;_=X;$=c[o>>2]|0}else{_=c[a>>2]|0;$=W}c[_+($<<2)>>2]=U;c[o>>2]=(c[o>>2]|0)+1;kd(a,c[S+8>>2]|0,c[T>>2]|0);break}else if((R|0)!=1){break}X=c[M+16>>2]|0;I=c[M+12>>2]|0;if((I|0)==0){aa=8;ba=496}else{aa=c[I+12>>2]|0;ba=c[I+8>>2]|0}I=c[p>>2]|0;H=c[o>>2]|0;J=H+1|0;if(I>>>0<J>>>0){if((I|0)==0){c[p>>2]=64;ca=64}else{ca=I}if(ca>>>0<J>>>0){I=ca;do{I=I<<1;}while(I>>>0<J>>>0);c[p>>2]=I;da=I}else{da=ca}J=xe(c[a>>2]|0,da<<2)|0;c[a>>2]=J;ea=J;fa=c[o>>2]|0}else{ea=c[a>>2]|0;fa=H}c[ea+(fa<<2)>>2]=2;J=c[o>>2]|0;M=J+1|0;c[o>>2]=M;R=c[p>>2]|0;T=J+2|0;if(R>>>0<T>>>0){if((R|0)==0){c[p>>2]=64;ga=64}else{ga=R}if(ga>>>0<T>>>0){R=ga;do{R=R<<1;}while(R>>>0<T>>>0);c[p>>2]=R;ha=R}else{ha=ga}T=xe(c[a>>2]|0,ha<<2)|0;c[a>>2]=T;ia=T;ja=c[o>>2]|0}else{ia=c[a>>2]|0;ja=M}c[ia+(ja<<2)>>2]=X;T=c[o>>2]|0;H=T+1|0;c[o>>2]=H;I=c[p>>2]|0;J=T+2|0;if(I>>>0<J>>>0){if((I|0)==0){c[p>>2]=64;ka=64}else{ka=I}if(ka>>>0<J>>>0){I=ka;do{I=I<<1;}while(I>>>0<J>>>0);c[p>>2]=I;la=I}else{la=ka}J=xe(c[a>>2]|0,la<<2)|0;c[a>>2]=J;ma=J;na=c[o>>2]|0}else{ma=c[a>>2]|0;na=H}c[ma+(na<<2)>>2]=aa;c[o>>2]=(c[o>>2]|0)+1;kd(a,ba,aa)}else{break b}}while(0);J=F+1|0;if((J|0)<(C|0)){F=J}else{oa=1;break a}}c[k>>2]=Qc(G)|0;c[e>>2]=0;c[h>>2]=e;F=dh(464,f,h)|0;x=dh(512,g,k)|0;J=a+12|0;gi(c[J>>2]|0);X=ve((c[f>>2]|0)+1+(c[g>>2]|0)|0)|0;c[J>>2]=X;Ii(X|0,F|0)|0;Ii((c[J>>2]|0)+(c[f>>2]|0)|0,x|0)|0;gi(F);gi(x);oa=0}else{oa=1}}while(0);yc(c[l>>2]|0);yc(c[n>>2]|0);yc(c[m>>2]|0);yc(c[r>>2]|0);if(!oa){pa=1;break}if((E|0)<=256){pa=0;break}c[e>>2]=c[b+28>>2];c[h>>2]=e;C=dh(464,f,h)|0;w=dh(424,g,0)|0;v=a+12|0;gi(c[v>>2]|0);x=ve((c[f>>2]|0)+1+(c[g>>2]|0)|0)|0;c[v>>2]=x;Ii(x|0,C|0)|0;Ii((c[v>>2]|0)+(c[f>>2]|0)|0,w|0)|0;gi(C);gi(w);pa=1}}while(0);if((u|0)==3){yc(c[l>>2]|0);yc(c[n>>2]|0);yc(c[m>>2]|0);yc(c[r>>2]|0);pa=1}r=c[a>>2]|0;if(pa){gi(r);qa=0;i=d;return qa|0}else{qa=Id(408,r,c[o>>2]|0)|0;i=d;return qa|0}return 0}function id(a){a=a|0;i=i;return c[a+12>>2]|0}function jd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0;d=i;i=i+80|0;e=d+32|0;f=d+64|0;g=d+72|0;h=d+48|0;j=d;k=d+68|0;l=d+16|0;if((b|0)==0){m=1;i=d;return m|0}switch(c[b>>2]|0){case 8:{n=c[b+32>>2]|0;if((n|0)==0){o=a+8|0;p=c[o>>2]|0;q=a+4|0;r=c[q>>2]|0;s=r+2|0;if(p>>>0<s>>>0){if((p|0)==0){c[o>>2]=64;t=64}else{t=p}if(t>>>0<s>>>0){p=t;do{p=p<<1;}while(p>>>0<s>>>0);c[o>>2]=p;u=p}else{u=t}t=xe(c[a>>2]|0,u<<2)|0;c[a>>2]=t;v=t;w=c[q>>2]|0}else{v=c[a>>2]|0;w=r}r=v+(w<<2)|0;c[r>>2]=28;c[r+4>>2]=1;c[q>>2]=(c[q>>2]|0)+2;q=a+20|0;if((c[q>>2]|0)>=1){m=1;i=d;return m|0}c[q>>2]=1;m=1;i=d;return m|0}else{c[f>>2]=-1;c[a+16>>2]=Uc(c[c[a+28>>2]>>2]|0)|0;if((ld(a,n,f)|0)==0){m=0;i=d;return m|0}n=c[f>>2]<<8&65280|1;q=a+8|0;r=c[q>>2]|0;w=a+4|0;v=c[w>>2]|0;t=v+1|0;if(r>>>0<t>>>0){if((r|0)==0){c[q>>2]=64;x=64}else{x=r}if(x>>>0<t>>>0){r=x;do{r=r<<1;}while(r>>>0<t>>>0);c[q>>2]=r;y=r}else{y=x}x=xe(c[a>>2]|0,y<<2)|0;c[a>>2]=x;z=x;A=c[w>>2]|0}else{z=c[a>>2]|0;A=v}c[z+(A<<2)>>2]=n;c[w>>2]=(c[w>>2]|0)+1;m=1;i=d;return m|0}break};case 10:{w=j+8|0;n=a+28|0;A=h+8|0;z=a+8|0;v=a+4|0;x=a+16|0;y=b;while(1){c[j>>2]=259;B=y+24|0;c[w>>2]=c[B>>2];Sd(c[(c[n>>2]|0)+4>>2]|0,j,h);if((c[h>>2]&255|0)==2){if((c[A>>2]|0)>-1){C=159;break}}r=c[n>>2]|0;q=Uc(c[r>>2]|0)|0;Ac(e,q);$c(c[r>>2]|0,j);Td(c[r+4>>2]|0,j,e);t=Uc(c[r>>2]|0)|0;u=r+8|0;if((t|0)>(c[u>>2]|0)){c[u>>2]=t}t=q<<8&65280|28;u=c[z>>2]|0;r=c[v>>2]|0;p=r+1|0;if(u>>>0<p>>>0){if((u|0)==0){c[z>>2]=64;D=64}else{D=u}if(D>>>0<p>>>0){u=D;do{u=u<<1;}while(u>>>0<p>>>0);c[z>>2]=u;E=u}else{E=D}p=xe(c[a>>2]|0,E<<2)|0;c[a>>2]=p;F=p;G=c[v>>2]|0}else{F=c[a>>2]|0;G=r}c[F+(G<<2)>>2]=t;c[v>>2]=(c[v>>2]|0)+1;p=c[y+32>>2]|0;if((p|0)!=0){c[e>>2]=q;c[x>>2]=Uc(c[c[n>>2]>>2]|0)|0;if((ld(a,p,e)|0)==0){m=0;C=184;break}}p=c[y+36>>2]|0;if((p|0)==0){m=1;C=184;break}else{y=p}}if((C|0)==159){c[k>>2]=c[(c[B>>2]|0)+8>>2];c[e>>2]=c[y+28>>2];c[l>>2]=e;y=dh(464,f,l)|0;B=dh(904,g,k)|0;k=a+12|0;gi(c[k>>2]|0);n=ve((c[f>>2]|0)+1+(c[g>>2]|0)|0)|0;c[k>>2]=n;Ii(n|0,y|0)|0;Ii((c[k>>2]|0)+(c[f>>2]|0)|0,B|0)|0;gi(y);gi(B);m=0;i=d;return m|0}else if((C|0)==184){i=d;return m|0}break};case 9:{m=1;i=d;return m|0};case 2:{B=a+36|0;y=c[B>>2]|0;k=a+32|0;n=c[k>>2]|0;c[B>>2]=1;c[k>>2]=0;x=a+4|0;v=c[x>>2]|0;G=c[b+32>>2]|0;c[e>>2]=-1;c[a+16>>2]=Uc(c[c[a+28>>2]>>2]|0)|0;if((ld(a,G,e)|0)==0){c[k>>2]=n;c[B>>2]=y;m=0;i=d;return m|0}G=c[e>>2]<<8&65280|3;F=c[x>>2]|0;E=a+8|0;D=c[E>>2]|0;z=F+2|0;if(D>>>0<z>>>0){if((D|0)==0){c[E>>2]=64;H=64}else{H=D}if(H>>>0<z>>>0){D=H;do{D=D<<1;}while(D>>>0<z>>>0);c[E>>2]=D;I=D}else{I=H}H=xe(c[a>>2]|0,I<<2)|0;c[a>>2]=H;J=H;K=c[x>>2]|0}else{J=c[a>>2]|0;K=F}H=J+(K<<2)|0;c[H>>2]=0;c[H+4>>2]=0;H=(c[x>>2]|0)+2|0;c[x>>2]=H;if((jd(a,c[b+36>>2]|0)|0)==0){K=c[k>>2]|0;if((K|0)!=0){J=K;while(1){K=c[J+8>>2]|0;gi(J);if((K|0)==0){break}else{J=K}}}c[k>>2]=n;c[B>>2]=y;m=0;i=d;return m|0}J=c[x>>2]|0;K=c[E>>2]|0;I=J+2|0;if(K>>>0<I>>>0){if((K|0)==0){c[E>>2]=64;L=64}else{L=K}if(L>>>0<I>>>0){K=L;do{K=K<<1;}while(K>>>0<I>>>0);c[E>>2]=K;M=K}else{M=L}L=xe(c[a>>2]|0,M<<2)|0;c[a>>2]=L;N=c[x>>2]|0;O=L}else{N=J;O=c[a>>2]|0}L=O+(N<<2)|0;c[L>>2]=0;c[L+4>>2]=0;L=(c[x>>2]|0)+2|0;c[x>>2]=L;x=c[a>>2]|0;c[x+(F<<2)>>2]=G;c[x+(F+1<<2)>>2]=L-H;c[x+(J<<2)>>2]=2;c[x+(J+1<<2)>>2]=v-L;J=c[k>>2]|0;a:do{if((J|0)!=0){H=x;F=J;while(1){G=c[F+8>>2]|0;N=F+4|0;O=c[N>>2]|0;M=-2-O+((c[F>>2]|0)!=0?L:v)|0;c[H+(O<<2)>>2]=2;c[H+((c[N>>2]|0)+1<<2)>>2]=M;gi(F);if((G|0)==0){break a}H=c[a>>2]|0;F=G}}}while(0);c[k>>2]=n;c[B>>2]=y;m=1;i=d;return m|0};case 11:{y=a+28|0;B=a+16|0;n=a+8|0;k=a+4|0;v=b;while(1){L=c[v+32>>2]|0;c[e>>2]=-1;c[B>>2]=Uc(c[c[y>>2]>>2]|0)|0;if((ld(a,L,e)|0)==0){m=0;C=184;break}L=v+24|0;J=c[e>>2]<<8&65280|c[(c[L>>2]|0)+12>>2]<<16|38;x=c[n>>2]|0;F=c[k>>2]|0;H=F+1|0;if(x>>>0<H>>>0){if((x|0)==0){c[n>>2]=64;P=64}else{P=x}if(P>>>0<H>>>0){x=P;do{x=x<<1;}while(x>>>0<H>>>0);c[n>>2]=x;Q=x}else{Q=P}H=xe(c[a>>2]|0,Q<<2)|0;c[a>>2]=H;R=H;S=c[k>>2]|0}else{R=c[a>>2]|0;S=F}c[R+(S<<2)>>2]=J;c[k>>2]=(c[k>>2]|0)+1;H=c[L>>2]|0;kd(a,c[H+8>>2]|0,c[H+12>>2]|0);H=c[v+36>>2]|0;if((H|0)==0){m=1;C=184;break}else{v=H}}if((C|0)==184){i=d;return m|0}break};case 68:{if((jd(a,c[b+32>>2]|0)|0)==0){T=0}else{T=(jd(a,c[b+36>>2]|0)|0)!=0}m=T&1;i=d;return m|0};case 1:{T=a+28|0;C=Uc(c[c[T>>2]>>2]|0)|0;if((jd(a,c[b+32>>2]|0)|0)==0){U=0}else{U=(jd(a,c[b+36>>2]|0)|0)!=0}v=U&1;U=c[T>>2]|0;T=Uc(c[U>>2]|0)|0;if((T|0)<=(C|0)){m=v;i=d;return m|0}k=U+4|0;S=T;while(1){T=S+ -1|0;Vc(c[U>>2]|0,T,l);ad(c[U>>2]|0);Vd(c[k>>2]|0,l);if((T|0)>(C|0)){S=T}else{m=v;break}}i=d;return m|0};case 3:{v=a+4|0;S=c[v>>2]|0;C=a+36|0;k=c[C>>2]|0;U=a+32|0;T=c[U>>2]|0;c[C>>2]=1;c[U>>2]=0;if((jd(a,c[b+36>>2]|0)|0)==0){R=c[U>>2]|0;if((R|0)!=0){Q=R;while(1){R=c[Q+8>>2]|0;gi(Q);if((R|0)==0){break}else{Q=R}}}c[U>>2]=T;c[C>>2]=k;m=0;i=d;return m|0}Q=c[v>>2]|0;R=c[b+32>>2]|0;c[e>>2]=-1;c[a+16>>2]=Uc(c[c[a+28>>2]>>2]|0)|0;if((ld(a,R,e)|0)==0){R=c[U>>2]|0;if((R|0)!=0){P=R;while(1){R=c[P+8>>2]|0;gi(P);if((R|0)==0){break}else{P=R}}}c[U>>2]=T;c[C>>2]=k;m=0;i=d;return m|0}P=c[e>>2]<<8&65280|4;R=c[v>>2]|0;n=S+ -2-R|0;S=a+8|0;y=c[S>>2]|0;B=R+2|0;if(y>>>0<B>>>0){if((y|0)==0){c[S>>2]=64;V=64}else{V=y}if(V>>>0<B>>>0){y=V;do{y=y<<1;}while(y>>>0<B>>>0);c[S>>2]=y;W=y}else{W=V}V=xe(c[a>>2]|0,W<<2)|0;c[a>>2]=V;X=V;Y=c[v>>2]|0}else{X=c[a>>2]|0;Y=R}c[X+(Y<<2)>>2]=P;c[X+(Y+1<<2)>>2]=n;n=(c[v>>2]|0)+2|0;c[v>>2]=n;v=c[U>>2]|0;if((v|0)!=0){Y=v;while(1){v=c[Y+8>>2]|0;X=Y+4|0;P=c[X>>2]|0;R=-2-P+((c[Y>>2]|0)!=0?n:Q)|0;V=c[a>>2]|0;c[V+(P<<2)>>2]=2;c[V+((c[X>>2]|0)+1<<2)>>2]=R;gi(Y);if((v|0)==0){break}else{Y=v}}}c[U>>2]=T;c[C>>2]=k;m=1;i=d;return m|0};case 4:{k=a+36|0;C=c[k>>2]|0;T=a+32|0;U=c[T>>2]|0;c[k>>2]=1;c[T>>2]=0;Y=c[b+32>>2]|0;Q=c[Y+32>>2]|0;n=c[Y+36>>2]|0;Y=c[n+32>>2]|0;v=c[(c[n+36>>2]|0)+32>>2]|0;n=a+28|0;R=Uc(c[c[n>>2]>>2]|0)|0;if((jd(a,Q)|0)==0){c[T>>2]=U;c[k>>2]=C;m=0;i=d;return m|0}Q=a+4|0;X=c[Q>>2]|0;c[e>>2]=-1;V=a+16|0;c[V>>2]=Uc(c[c[n>>2]>>2]|0)|0;if((ld(a,Y,e)|0)==0){c[T>>2]=U;c[k>>2]=C;m=0;i=d;return m|0}Y=c[e>>2]<<8&65280|3;P=c[Q>>2]|0;W=a+8|0;y=c[W>>2]|0;S=P+2|0;if(y>>>0<S>>>0){if((y|0)==0){c[W>>2]=64;Z=64}else{Z=y}if(Z>>>0<S>>>0){y=Z;do{y=y<<1;}while(y>>>0<S>>>0);c[W>>2]=y;_=y}else{_=Z}Z=xe(c[a>>2]|0,_<<2)|0;c[a>>2]=Z;$=Z;aa=c[Q>>2]|0}else{$=c[a>>2]|0;aa=P}Z=$+(aa<<2)|0;c[Z>>2]=0;c[Z+4>>2]=0;Z=(c[Q>>2]|0)+2|0;c[Q>>2]=Z;if((jd(a,c[b+36>>2]|0)|0)==0){aa=c[T>>2]|0;if((aa|0)!=0){$=aa;while(1){aa=c[$+8>>2]|0;gi($);if((aa|0)==0){break}else{$=aa}}}c[T>>2]=U;c[k>>2]=C;m=0;i=d;return m|0}$=c[Q>>2]|0;c[e>>2]=-1;c[V>>2]=Uc(c[c[n>>2]>>2]|0)|0;if((ld(a,v,e)|0)==0){v=c[T>>2]|0;if((v|0)!=0){V=v;while(1){v=c[V+8>>2]|0;gi(V);if((v|0)==0){break}else{V=v}}}c[T>>2]=U;c[k>>2]=C;m=0;i=d;return m|0}V=c[Q>>2]|0;v=c[W>>2]|0;aa=V+2|0;if(v>>>0<aa>>>0){if((v|0)==0){c[W>>2]=64;ba=64}else{ba=v}if(ba>>>0<aa>>>0){v=ba;do{v=v<<1;}while(v>>>0<aa>>>0);c[W>>2]=v;ca=v}else{ca=ba}ba=xe(c[a>>2]|0,ca<<2)|0;c[a>>2]=ba;da=ba;ea=c[Q>>2]|0}else{da=c[a>>2]|0;ea=V}ba=da+(ea<<2)|0;c[ba>>2]=0;c[ba+4>>2]=0;ba=(c[Q>>2]|0)+2|0;c[Q>>2]=ba;Q=c[a>>2]|0;c[Q+(P<<2)>>2]=Y;c[Q+(P+1<<2)>>2]=ba-Z;c[Q+(V<<2)>>2]=2;c[Q+(V+1<<2)>>2]=X-ba;X=c[T>>2]|0;b:do{if((X|0)!=0){V=Q;Z=X;while(1){P=c[Z+8>>2]|0;Y=Z+4|0;ea=c[Y>>2]|0;da=-2-ea+((c[Z>>2]|0)!=0?ba:$)|0;c[V+(ea<<2)>>2]=2;c[V+((c[Y>>2]|0)+1<<2)>>2]=da;gi(Z);if((P|0)==0){break b}V=c[a>>2]|0;Z=P}}}while(0);$=c[n>>2]|0;n=Uc(c[$>>2]|0)|0;if((n|0)>(R|0)){ba=$+4|0;X=n;do{X=X+ -1|0;Vc(c[$>>2]|0,X,e);ad(c[$>>2]|0);Vd(c[ba>>2]|0,e);}while((X|0)>(R|0))}c[T>>2]=U;c[k>>2]=C;m=1;i=d;return m|0};case 5:{C=c[b+32>>2]|0;k=c[b+36>>2]|0;U=c[k+32>>2]|0;T=c[k+36>>2]|0;c[g>>2]=-1;c[a+16>>2]=Uc(c[c[a+28>>2]>>2]|0)|0;if((ld(a,C,g)|0)==0){m=0;i=d;return m|0}C=c[g>>2]<<8&65280|3;k=a+4|0;R=c[k>>2]|0;X=a+8|0;ba=c[X>>2]|0;$=R+2|0;if(ba>>>0<$>>>0){if((ba|0)==0){c[X>>2]=64;fa=64}else{fa=ba}if(fa>>>0<$>>>0){ba=fa;do{ba=ba<<1;}while(ba>>>0<$>>>0);c[X>>2]=ba;ga=ba}else{ga=fa}fa=xe(c[a>>2]|0,ga<<2)|0;c[a>>2]=fa;ha=fa;ia=c[k>>2]|0}else{ha=c[a>>2]|0;ia=R}fa=ha+(ia<<2)|0;c[fa>>2]=0;c[fa+4>>2]=0;fa=(c[k>>2]|0)+2|0;c[k>>2]=fa;if((jd(a,U)|0)==0){m=0;i=d;return m|0}U=c[k>>2]|0;ia=c[X>>2]|0;ha=U+2|0;if(ia>>>0<ha>>>0){if((ia|0)==0){c[X>>2]=64;ja=64}else{ja=ia}if(ja>>>0<ha>>>0){ia=ja;do{ia=ia<<1;}while(ia>>>0<ha>>>0);c[X>>2]=ia;ka=ia}else{ka=ja}ja=xe(c[a>>2]|0,ka<<2)|0;c[a>>2]=ja;la=ja;ma=c[k>>2]|0}else{la=c[a>>2]|0;ma=U}ja=la+(ma<<2)|0;c[ja>>2]=0;c[ja+4>>2]=0;ja=(c[k>>2]|0)+2|0;c[k>>2]=ja;if((jd(a,T)|0)==0){m=0;i=d;return m|0}T=(c[k>>2]|0)-ja|0;k=c[a>>2]|0;c[k+(R<<2)>>2]=C;c[k+(R+1<<2)>>2]=ja-fa;c[k+(U<<2)>>2]=2;c[k+(U+1<<2)>>2]=T;m=1;i=d;return m|0};case 6:{if((c[a+36>>2]|0)==0){c[e>>2]=c[b+28>>2];c[l>>2]=e;T=dh(464,f,l)|0;U=dh(984,g,0)|0;k=a+12|0;gi(c[k>>2]|0);fa=ve((c[f>>2]|0)+1+(c[g>>2]|0)|0)|0;c[k>>2]=fa;Ii(fa|0,T|0)|0;Ii((c[k>>2]|0)+(c[f>>2]|0)|0,U|0)|0;gi(T);gi(U);m=0;i=d;return m|0}U=a+4|0;T=c[U>>2]|0;k=ve(12)|0;c[k+4>>2]=T;c[k>>2]=1;T=a+32|0;c[k+8>>2]=c[T>>2];c[T>>2]=k;k=a+8|0;T=c[k>>2]|0;fa=c[U>>2]|0;ja=fa+2|0;if(T>>>0<ja>>>0){if((T|0)==0){c[k>>2]=64;na=64}else{na=T}if(na>>>0<ja>>>0){T=na;do{T=T<<1;}while(T>>>0<ja>>>0);c[k>>2]=T;oa=T}else{oa=na}na=xe(c[a>>2]|0,oa<<2)|0;c[a>>2]=na;pa=na;qa=c[U>>2]|0}else{pa=c[a>>2]|0;qa=fa}fa=pa+(qa<<2)|0;c[fa>>2]=0;c[fa+4>>2]=0;c[U>>2]=(c[U>>2]|0)+2;m=1;i=d;return m|0};case 7:{if((c[a+36>>2]|0)==0){c[e>>2]=c[b+28>>2];c[l>>2]=e;U=dh(464,f,l)|0;l=dh(936,g,0)|0;fa=a+12|0;gi(c[fa>>2]|0);qa=ve((c[f>>2]|0)+1+(c[g>>2]|0)|0)|0;c[fa>>2]=qa;Ii(qa|0,U|0)|0;Ii((c[fa>>2]|0)+(c[f>>2]|0)|0,l|0)|0;gi(U);gi(l);m=0;i=d;return m|0}l=a+4|0;U=c[l>>2]|0;f=ve(12)|0;c[f+4>>2]=U;c[f>>2]=0;U=a+32|0;c[f+8>>2]=c[U>>2];c[U>>2]=f;f=a+8|0;U=c[f>>2]|0;fa=c[l>>2]|0;qa=fa+2|0;if(U>>>0<qa>>>0){if((U|0)==0){c[f>>2]=64;ra=64}else{ra=U}if(ra>>>0<qa>>>0){U=ra;do{U=U<<1;}while(U>>>0<qa>>>0);c[f>>2]=U;sa=U}else{sa=ra}ra=xe(c[a>>2]|0,sa<<2)|0;c[a>>2]=ra;ta=ra;ua=c[l>>2]|0}else{ta=c[a>>2]|0;ua=fa}fa=ta+(ua<<2)|0;c[fa>>2]=0;c[fa+4>>2]=0;c[l>>2]=(c[l>>2]|0)+2;m=1;i=d;return m|0};default:{c[e>>2]=-1;c[a+16>>2]=Uc(c[c[a+28>>2]>>2]|0)|0;m=(ld(a,b,e)|0)!=0|0;i=d;return m|0}}return 0}function kd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=i;f=(d+4|0)>>>2;d=f<<2;g=ve(d)|0;Ci(g|0,b|0,d|0)|0;b=a+8|0;h=c[b>>2]|0;j=a+4|0;k=c[j>>2]|0;l=k+f|0;if(h>>>0<l>>>0){if((h|0)==0){c[b>>2]=64;m=64}else{m=h}if(m>>>0<l>>>0){h=m;do{h=h<<1;}while(h>>>0<l>>>0);c[b>>2]=h;n=h}else{n=m}m=xe(c[a>>2]|0,n<<2)|0;c[a>>2]=m;o=m;p=c[j>>2]|0}else{o=c[a>>2]|0;p=k}Ei(o+(p<<2)|0,g|0,d|0)|0;c[j>>2]=(c[j>>2]|0)+f;gi(g);i=e;return}function ld(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,eb=0,fb=0,gb=0,hb=0,ib=0,jb=0,kb=0,lb=0,mb=0,nb=0,ob=0,pb=0,qb=0,rb=0,sb=0,tb=0,ub=0,vb=0,wb=0,xb=0,yb=0,zb=0,Ab=0,Bb=0,Cb=0,Db=0,Eb=0,Fb=0,Gb=0,Hb=0,Ib=0,Jb=0,Kb=0,Lb=0,Mb=0,Nb=0,Ob=0,Pb=0,Qb=0,Rb=0,Sb=0,Tb=0,Ub=0,Vb=0,Wb=0,Xb=0,Yb=0,Zb=0,_b=0,$b=0,ac=0,bc=0,cc=0,dc=0,ec=0,fc=0,gc=0,hc=0,ic=0,jc=0,kc=0,lc=0,mc=0,nc=0,oc=0,pc=0,qc=0,rc=0,sc=0,tc=0,uc=0,vc=0,zc=0,Cc=0,Ec=0,Fc=0,Gc=0,Hc=0,Ic=0,Jc=0,Kc=0,Lc=0,Mc=0,Nc=0,Oc=0,Pc=0,Qc=0,Rc=0,Sc=0,Wc=0,Xc=0,Yc=0,Zc=0,_c=0,ad=0,bd=0,cd=0,fd=0,gd=0,hd=0,id=0,kd=0,qd=0,rd=0,sd=0,ud=0,vd=0,wd=0,xd=0,yd=0,zd=0,Ad=0,Bd=0,Cd=0,Dd=0,Ed=0,Fd=0,Gd=0,Hd=0,Id=0,Jd=0,Kd=0,Ld=0,Md=0,Nd=0,Od=0,Qd=0;e=i;i=i+528|0;f=e+64|0;g=e+160|0;j=e+368|0;k=e+336|0;l=e+80|0;m=e+176|0;n=e+416|0;o=e+96|0;p=e+112|0;q=e+288|0;r=e+320|0;s=e+352|0;t=e+384|0;u=e+444|0;v=e+492|0;w=e+460|0;x=e+456|0;y=e+432|0;z=e+480|0;A=e+504|0;B=e+496|0;C=e+128|0;D=e+144|0;E=e+304|0;F=e+448|0;G=e+508|0;H=e+436|0;I=e+472|0;J=e+484|0;K=e+192|0;L=e+16|0;M=e+468|0;N=e;O=e+452|0;P=e+488|0;Q=e+272|0;R=e+48|0;S=e+512|0;T=e+516|0;U=e+476|0;V=e+32|0;W=e+440|0;X=e+256|0;Y=e+240|0;Z=e+224|0;_=e+208|0;$=e+400|0;aa=e+464|0;ba=e+500|0;ca=e+520|0;da=c[b>>2]|0;switch(da|0){case 43:case 42:case 41:case 40:case 39:case 38:case 35:case 34:case 33:case 32:case 31:case 30:case 29:case 28:case 27:case 26:case 24:{switch(da|0){case 33:{ea=21;break};case 34:{ea=22;break};case 26:{ea=11;break};case 41:{ea=8;break};case 42:{ea=9;break};case 43:{ea=10;break};case 24:{ea=27;break};case 29:{ea=14;break};case 30:{ea=15;break};case 39:{ea=6;break};case 40:{ea=7;break};case 35:{ea=23;break};case 38:{ea=5;break};case 27:{ea=12;break};case 28:{ea=13;break};case 31:{ea=19;break};case 32:{ea=20;break};default:{ea=255}}c[R>>2]=-1;c[S>>2]=-1;if((ld(a,c[b+32>>2]|0,R)|0)==0){fa=0;i=e;return fa|0}if((ld(a,c[b+36>>2]|0,S)|0)==0){fa=0;i=e;return fa|0}ga=Uc(c[c[a+28>>2]>>2]|0)|0;ha=c[R>>2]|0;if((ha|0)>=(ga|0)){ia=a+16|0;c[ia>>2]=(c[ia>>2]|0)+ -1}ia=c[S>>2]|0;if((ia|0)>=(ga|0)){ga=a+16|0;c[ga>>2]=(c[ga>>2]|0)+ -1}ga=c[d>>2]|0;if((ga|0)<0){ja=a+16|0;ka=c[ja>>2]|0;la=ka+1|0;c[ja>>2]=la;ja=a+20|0;if((ka|0)>=(c[ja>>2]|0)){c[ja>>2]=la}c[d>>2]=ka;ma=ka}else{ma=ga}ga=ma<<8&65280|ea|ha<<16&16711680|ia<<24;ia=a+8|0;ha=c[ia>>2]|0;ea=a+4|0;ma=c[ea>>2]|0;ka=ma+1|0;if(ha>>>0<ka>>>0){if((ha|0)==0){c[ia>>2]=64;na=64}else{na=ha}if(na>>>0<ka>>>0){ha=na;do{ha=ha<<1;}while(ha>>>0<ka>>>0);c[ia>>2]=ha;oa=ha}else{oa=na}na=xe(c[a>>2]|0,oa<<2)|0;c[a>>2]=na;pa=na;qa=c[ea>>2]|0}else{pa=c[a>>2]|0;qa=ma}c[pa+(qa<<2)>>2]=ga;c[ea>>2]=(c[ea>>2]|0)+1;fa=1;i=e;return fa|0};case 23:case 22:case 21:case 20:case 19:case 18:case 17:case 16:case 15:case 14:case 13:{switch(da|0){case 13:{ra=11;break};case 14:{ra=12;break};case 15:{ra=13;break};case 16:{ra=14;break};case 17:{ra=15;break};case 18:{ra=19;break};case 19:{ra=20;break};case 20:{ra=21;break};case 21:{ra=22;break};case 22:{ra=23;break};case 23:{ra=27;break};default:{ra=0}}ea=b+32|0;ga=c[ea>>2]|0;qa=c[ga>>2]|0;if((qa|0)==56){c[M>>2]=-1;c[N>>2]=259;c[N+8>>2]=c[ga+24>>2];pa=a+28|0;Sd(c[(c[pa>>2]|0)+4>>2]|0,N,L);do{if((c[L>>2]&255|0)==2){N=c[L+8>>2]|0;if((N|0)<0){break}if((ld(a,c[b+36>>2]|0,M)|0)==0){fa=0;i=e;return fa|0}ma=Uc(c[c[pa>>2]>>2]|0)|0;na=c[M>>2]|0;if((na|0)>=(ma|0)){ma=a+16|0;c[ma>>2]=(c[ma>>2]|0)+ -1}ma=N&255;oa=ma<<16;ha=ma<<8|ra|oa|na<<24;na=a+8|0;ma=c[na>>2]|0;ia=a+4|0;ka=c[ia>>2]|0;la=ka+1|0;if(ma>>>0<la>>>0){if((ma|0)==0){c[na>>2]=64;sa=64}else{sa=ma}if(sa>>>0<la>>>0){ma=sa;do{ma=ma<<1;}while(ma>>>0<la>>>0);c[na>>2]=ma;ta=ma}else{ta=sa}la=xe(c[a>>2]|0,ta<<2)|0;c[a>>2]=la;ua=la;va=c[ia>>2]|0}else{ua=c[a>>2]|0;va=ka}c[ua+(va<<2)>>2]=ha;la=c[ia>>2]|0;ja=la+1|0;c[ia>>2]=ja;wa=c[d>>2]|0;if((wa|0)<0){c[d>>2]=N;fa=1;i=e;return fa|0}if((wa|0)==(N|0)){fa=1;i=e;return fa|0}xa=oa|wa<<8&65280|30;wa=c[na>>2]|0;ya=la+2|0;if(wa>>>0<ya>>>0){if((wa|0)==0){c[na>>2]=64;za=64}else{za=wa}if(za>>>0<ya>>>0){wa=za;do{wa=wa<<1;}while(wa>>>0<ya>>>0);c[na>>2]=wa;Aa=wa}else{Aa=za}ya=xe(c[a>>2]|0,Aa<<2)|0;c[a>>2]=ya;Ba=ya;Ca=c[ia>>2]|0}else{Ba=c[a>>2]|0;Ca=ja}c[Ba+(Ca<<2)>>2]=xa;c[ia>>2]=(c[ia>>2]|0)+1;fa=1;i=e;return fa|0}}while(0);Ca=c[ea>>2]|0;c[aa>>2]=c[(c[Ca+24>>2]|0)+8>>2];c[l>>2]=c[Ca+28>>2];c[W>>2]=l;Ca=dh(464,m,W)|0;ea=dh(648,n,aa)|0;Ba=a+12|0;gi(c[Ba>>2]|0);Aa=ve((c[m>>2]|0)+1+(c[n>>2]|0)|0)|0;c[Ba>>2]=Aa;Ii(Aa|0,Ca|0)|0;Ii((c[Ba>>2]|0)+(c[m>>2]|0)|0,ea|0)|0;gi(Ca);gi(ea);fa=0;i=e;return fa|0}else if((qa|0)==54|(qa|0)==53){qa=c[b+36>>2]|0;c[H>>2]=-1;c[I>>2]=-1;c[J>>2]=-1;if((c[d>>2]|0)<0){ea=a+16|0;Ca=c[ea>>2]|0;Ba=Ca+1|0;c[ea>>2]=Ba;ea=a+20|0;if((Ca|0)>=(c[ea>>2]|0)){c[ea>>2]=Ba}c[d>>2]=Ca}if((ld(a,qa,J)|0)==0){fa=0;i=e;return fa|0}if((ld(a,c[ga+32>>2]|0,H)|0)==0){fa=0;i=e;return fa|0}do{if((c[ga>>2]|0)==53){if((ld(a,c[ga+36>>2]|0,I)|0)==0){fa=0;i=e;return fa|0}else{Da=a+8|0;Ea=c[a+4>>2]|0;break}}else{c[K>>2]=259;c[K+8>>2]=c[(c[ga+36>>2]|0)+24>>2];if((c[I>>2]|0)<0){qa=a+16|0;Ca=c[qa>>2]|0;Ba=Ca+1|0;c[qa>>2]=Ba;qa=a+20|0;if((Ca|0)>=(c[qa>>2]|0)){c[qa>>2]=Ba}c[I>>2]=Ca}Ca=a+24|0;Sd(c[(c[Ca>>2]|0)+4>>2]|0,K,k);if((c[k>>2]&255|0)==2){Ba=c[k+8>>2]|0;if((Ba|0)<0){Fa=146}else{Ga=Ba}}else{Fa=146}do{if((Fa|0)==146){Ba=c[Ca>>2]|0;qa=Uc(c[Ba>>2]|0)|0;Ac(j,qa);$c(c[Ba>>2]|0,K);Td(c[Ba+4>>2]|0,K,j);ea=Uc(c[Ba>>2]|0)|0;Aa=Ba+8|0;if((ea|0)<=(c[Aa>>2]|0)){Ga=qa;break}c[Aa>>2]=ea;Ga=qa}}while(0);Ca=Ga<<16|c[I>>2]<<8&65280|29;ia=a+8|0;xa=c[ia>>2]|0;ja=a+4|0;wa=c[ja>>2]|0;na=wa+1|0;if(xa>>>0<na>>>0){if((xa|0)==0){c[ia>>2]=64;Ha=64}else{Ha=xa}if(Ha>>>0<na>>>0){xa=Ha;do{xa=xa<<1;}while(xa>>>0<na>>>0);c[ia>>2]=xa;Ia=xa}else{Ia=Ha}na=xe(c[a>>2]|0,Ia<<2)|0;c[a>>2]=na;Ja=na;Ka=c[ja>>2]|0}else{Ja=c[a>>2]|0;Ka=wa}c[Ja+(Ka<<2)>>2]=Ca;na=(c[ja>>2]|0)+1|0;c[ja>>2]=na;Da=ia;Ea=na}}while(0);Ka=(c[ga>>2]|0)==53;Ja=c[d>>2]|0;Ia=c[H>>2]|0;Ha=c[I>>2]|0;Ga=Ja<<8&65280|(Ka?34:42)|Ia<<16&16711680|Ha<<24;K=Ja&255;na=K<<8|ra|K<<16|c[J>>2]<<24;K=Ja<<24|(Ka?35:43)|Ia<<8&65280|Ha<<16&16711680;Ha=c[Da>>2]|0;Ia=a+4|0;Ka=Ea+3|0;if(Ha>>>0<Ka>>>0){if((Ha|0)==0){c[Da>>2]=64;La=64}else{La=Ha}if(La>>>0<Ka>>>0){Ha=La;do{Ha=Ha<<1;}while(Ha>>>0<Ka>>>0);c[Da>>2]=Ha;Ma=Ha}else{Ma=La}La=xe(c[a>>2]|0,Ma<<2)|0;c[a>>2]=La;Na=La;Oa=c[Ia>>2]|0}else{Na=c[a>>2]|0;Oa=Ea}c[Na+(Oa<<2)>>2]=Ga;c[Na+(Oa+1<<2)>>2]=na;c[Na+(Oa+2<<2)>>2]=K;c[Ia>>2]=(c[Ia>>2]|0)+3;Ia=Uc(c[c[a+28>>2]>>2]|0)|0;if((c[J>>2]|0)>=(Ia|0)){J=a+16|0;c[J>>2]=(c[J>>2]|0)+ -1}if((c[H>>2]|0)>=(Ia|0)){H=a+16|0;c[H>>2]=(c[H>>2]|0)+ -1}if((c[I>>2]|0)<(Ia|0)){fa=1;i=e;return fa|0}Ia=a+16|0;c[Ia>>2]=(c[Ia>>2]|0)+ -1;fa=1;i=e;return fa|0}else{c[k>>2]=c[ga+28>>2];c[W>>2]=k;ga=dh(464,l,W)|0;Ia=dh(832,m,0)|0;I=a+12|0;gi(c[I>>2]|0);H=ve((c[l>>2]|0)+1+(c[m>>2]|0)|0)|0;c[I>>2]=H;Ii(H|0,ga|0)|0;Ii((c[I>>2]|0)+(c[l>>2]|0)|0,Ia|0)|0;gi(ga);gi(Ia);fa=0;i=e;return fa|0}break};case 12:{Ia=b+32|0;ga=c[Ia>>2]|0;I=c[ga>>2]|0;if((I|0)==54|(I|0)==53){H=c[b+36>>2]|0;c[O>>2]=-1;c[P>>2]=-1;if((ld(a,H,d)|0)==0){fa=0;i=e;return fa|0}if((ld(a,c[ga+32>>2]|0,O)|0)==0){fa=0;i=e;return fa|0}do{if((c[ga>>2]|0)==53){if((ld(a,c[ga+36>>2]|0,P)|0)==0){fa=0;i=e;return fa|0}else{Pa=a+8|0;Qa=c[a+4>>2]|0;break}}else{c[Q>>2]=259;c[Q+8>>2]=c[(c[ga+36>>2]|0)+24>>2];if((c[P>>2]|0)<0){H=a+16|0;J=c[H>>2]|0;K=J+1|0;c[H>>2]=K;H=a+20|0;if((J|0)>=(c[H>>2]|0)){c[H>>2]=K}c[P>>2]=J}J=a+24|0;Sd(c[(c[J>>2]|0)+4>>2]|0,Q,m);if((c[m>>2]&255|0)==2){K=c[m+8>>2]|0;if((K|0)<0){Fa=68}else{Ra=K}}else{Fa=68}do{if((Fa|0)==68){K=c[J>>2]|0;H=Uc(c[K>>2]|0)|0;Ac(l,H);$c(c[K>>2]|0,Q);Td(c[K+4>>2]|0,Q,l);Oa=Uc(c[K>>2]|0)|0;Na=K+8|0;if((Oa|0)<=(c[Na>>2]|0)){Ra=H;break}c[Na>>2]=Oa;Ra=H}}while(0);J=Ra<<16|c[P>>2]<<8&65280|29;ia=a+8|0;ja=c[ia>>2]|0;Ca=a+4|0;wa=c[Ca>>2]|0;xa=wa+1|0;if(ja>>>0<xa>>>0){if((ja|0)==0){c[ia>>2]=64;Sa=64}else{Sa=ja}if(Sa>>>0<xa>>>0){ja=Sa;do{ja=ja<<1;}while(ja>>>0<xa>>>0);c[ia>>2]=ja;Ta=ja}else{Ta=Sa}xa=xe(c[a>>2]|0,Ta<<2)|0;c[a>>2]=xa;Ua=xa;Va=c[Ca>>2]|0}else{Ua=c[a>>2]|0;Va=wa}c[Ua+(Va<<2)>>2]=J;xa=(c[Ca>>2]|0)+1|0;c[Ca>>2]=xa;Pa=ia;Qa=xa}}while(0);Va=c[O>>2]<<8&65280|((c[ga>>2]|0)==53?35:43)|c[P>>2]<<16&16711680|c[d>>2]<<24;Ua=c[Pa>>2]|0;Ta=a+4|0;Sa=Qa+1|0;if(Ua>>>0<Sa>>>0){if((Ua|0)==0){c[Pa>>2]=64;Wa=64}else{Wa=Ua}if(Wa>>>0<Sa>>>0){Ua=Wa;do{Ua=Ua<<1;}while(Ua>>>0<Sa>>>0);c[Pa>>2]=Ua;Xa=Ua}else{Xa=Wa}Wa=xe(c[a>>2]|0,Xa<<2)|0;c[a>>2]=Wa;Ya=Wa;Za=c[Ta>>2]|0}else{Ya=c[a>>2]|0;Za=Qa}c[Ya+(Za<<2)>>2]=Va;c[Ta>>2]=(c[Ta>>2]|0)+1;Ta=Uc(c[c[a+28>>2]>>2]|0)|0;if((c[O>>2]|0)>=(Ta|0)){O=a+16|0;c[O>>2]=(c[O>>2]|0)+ -1}if((c[P>>2]|0)<(Ta|0)){fa=1;i=e;return fa|0}Ta=a+16|0;c[Ta>>2]=(c[Ta>>2]|0)+ -1;fa=1;i=e;return fa|0}else if((I|0)==56){c[V>>2]=259;c[V+8>>2]=c[ga+24>>2];Sd(c[(c[a+28>>2]|0)+4>>2]|0,V,R);do{if((c[R>>2]&255|0)==2){V=c[R+8>>2]|0;c[U>>2]=V;if((V|0)<0){break}if((ld(a,c[b+36>>2]|0,U)|0)==0){fa=0;i=e;return fa|0}V=c[d>>2]|0;I=c[U>>2]|0;if((V|0)<0){c[d>>2]=I;fa=1;i=e;return fa|0}if((V|0)==(I|0)){fa=1;i=e;return fa|0}Ta=V<<8&65280|I<<16&16711680|30;I=a+8|0;V=c[I>>2]|0;P=a+4|0;O=c[P>>2]|0;Va=O+1|0;if(V>>>0<Va>>>0){if((V|0)==0){c[I>>2]=64;_a=64}else{_a=V}if(_a>>>0<Va>>>0){V=_a;do{V=V<<1;}while(V>>>0<Va>>>0);c[I>>2]=V;$a=V}else{$a=_a}Va=xe(c[a>>2]|0,$a<<2)|0;c[a>>2]=Va;ab=Va;bb=c[P>>2]|0}else{ab=c[a>>2]|0;bb=O}c[ab+(bb<<2)>>2]=Ta;c[P>>2]=(c[P>>2]|0)+1;fa=1;i=e;return fa|0}else{c[U>>2]=-1}}while(0);U=c[Ia>>2]|0;c[aa>>2]=c[(c[U+24>>2]|0)+8>>2];c[R>>2]=c[U+28>>2];c[W>>2]=R;R=dh(464,S,W)|0;U=dh(648,T,aa)|0;Ia=a+12|0;gi(c[Ia>>2]|0);bb=ve((c[S>>2]|0)+1+(c[T>>2]|0)|0)|0;c[Ia>>2]=bb;Ii(bb|0,R|0)|0;Ii((c[Ia>>2]|0)+(c[S>>2]|0)|0,U|0)|0;gi(R);gi(U);fa=0;i=e;return fa|0}else{c[m>>2]=c[ga+28>>2];c[W>>2]=m;ga=dh(464,n,W)|0;U=dh(832,o,0)|0;R=a+12|0;gi(c[R>>2]|0);S=ve((c[n>>2]|0)+1+(c[o>>2]|0)|0)|0;c[R>>2]=S;Ii(S|0,ga|0)|0;Ii((c[R>>2]|0)+(c[n>>2]|0)|0,U|0)|0;gi(ga);gi(U);fa=0;i=e;return fa|0}break};case 37:case 36:{U=(da|0)==36?3:4;ga=a+16|0;if((c[d>>2]|0)<0){R=c[ga>>2]|0;S=R+1|0;c[ga>>2]=S;Ia=a+20|0;if((R|0)>=(c[Ia>>2]|0)){c[Ia>>2]=S}c[d>>2]=R;cb=Ia}else{cb=a+20|0}Ia=c[ga>>2]|0;R=Ia+1|0;c[ga>>2]=R;if((Ia|0)>=(c[cb>>2]|0)){c[cb>>2]=R}c[G>>2]=Ia;if((ld(a,c[b+32>>2]|0,G)|0)==0){fa=0;i=e;return fa|0}Ia=a+4|0;R=c[Ia>>2]|0;cb=a+8|0;S=c[cb>>2]|0;bb=R+2|0;if(S>>>0<bb>>>0){if((S|0)==0){c[cb>>2]=64;db=64}else{db=S}if(db>>>0<bb>>>0){S=db;do{S=S<<1;}while(S>>>0<bb>>>0);c[cb>>2]=S;eb=S}else{eb=db}db=xe(c[a>>2]|0,eb<<2)|0;c[a>>2]=db;fb=db;gb=c[Ia>>2]|0}else{fb=c[a>>2]|0;gb=R}db=fb+(gb<<2)|0;c[db>>2]=0;c[db+4>>2]=0;db=(c[Ia>>2]|0)+2|0;c[Ia>>2]=db;if((ld(a,c[b+36>>2]|0,G)|0)==0){fa=0;i=e;return fa|0}gb=c[Ia>>2]|0;fb=c[a>>2]|0;c[fb+(R<<2)>>2]=c[G>>2]<<8&65280|U;c[fb+(R+1<<2)>>2]=gb-db;db=c[d>>2]<<8&65280|c[G>>2]<<16&16711680|30;G=c[cb>>2]|0;gb=c[Ia>>2]|0;R=gb+1|0;if(G>>>0<R>>>0){if((G|0)==0){c[cb>>2]=64;hb=64}else{hb=G}if(hb>>>0<R>>>0){G=hb;do{G=G<<1;}while(G>>>0<R>>>0);c[cb>>2]=G;ib=G}else{ib=hb}hb=xe(fb,ib<<2)|0;c[a>>2]=hb;jb=hb;kb=c[Ia>>2]|0}else{jb=fb;kb=gb}c[jb+(kb<<2)>>2]=db;c[Ia>>2]=(c[Ia>>2]|0)+1;c[ga>>2]=(c[ga>>2]|0)+ -1;fa=1;i=e;return fa|0};case 25:{c[F>>2]=-1;ga=c[b+32>>2]|0;Ia=c[b+36>>2]|0;db=c[Ia+32>>2]|0;kb=c[Ia+36>>2]|0;if((c[d>>2]|0)<0){Ia=a+16|0;jb=c[Ia>>2]|0;gb=jb+1|0;c[Ia>>2]=gb;Ia=a+20|0;if((jb|0)>=(c[Ia>>2]|0)){c[Ia>>2]=gb}c[d>>2]=jb}if((ld(a,ga,F)|0)==0){fa=0;i=e;return fa|0}ga=a+4|0;jb=c[ga>>2]|0;gb=a+8|0;Ia=c[gb>>2]|0;fb=jb+2|0;if(Ia>>>0<fb>>>0){if((Ia|0)==0){c[gb>>2]=64;lb=64}else{lb=Ia}if(lb>>>0<fb>>>0){Ia=lb;do{Ia=Ia<<1;}while(Ia>>>0<fb>>>0);c[gb>>2]=Ia;mb=Ia}else{mb=lb}lb=xe(c[a>>2]|0,mb<<2)|0;c[a>>2]=lb;nb=lb;ob=c[ga>>2]|0}else{nb=c[a>>2]|0;ob=jb}lb=nb+(ob<<2)|0;c[lb>>2]=0;c[lb+4>>2]=0;lb=(c[ga>>2]|0)+2|0;c[ga>>2]=lb;if((ld(a,db,d)|0)==0){fa=0;i=e;return fa|0}db=c[ga>>2]|0;ob=c[gb>>2]|0;nb=db+2|0;if(ob>>>0<nb>>>0){if((ob|0)==0){c[gb>>2]=64;pb=64}else{pb=ob}if(pb>>>0<nb>>>0){ob=pb;do{ob=ob<<1;}while(ob>>>0<nb>>>0);c[gb>>2]=ob;qb=ob}else{qb=pb}pb=xe(c[a>>2]|0,qb<<2)|0;c[a>>2]=pb;rb=pb;sb=c[ga>>2]|0}else{rb=c[a>>2]|0;sb=db}pb=rb+(sb<<2)|0;c[pb>>2]=0;c[pb+4>>2]=0;pb=(c[ga>>2]|0)+2|0;c[ga>>2]=pb;if((ld(a,kb,d)|0)==0){fa=0;i=e;return fa|0}kb=(c[ga>>2]|0)-pb|0;ga=c[a>>2]|0;c[ga+(jb<<2)>>2]=c[F>>2]<<8&65280|3;c[ga+(jb+1<<2)>>2]=pb-lb;c[ga+(db<<2)>>2]=2;c[ga+(db+1<<2)>>2]=kb;fa=1;i=e;return fa|0};case 56:{c[_>>2]=259;kb=b+24|0;c[_+8>>2]=c[kb>>2];Sd(c[(c[a+28>>2]|0)+4>>2]|0,_,Z);do{if((c[Z>>2]&255|0)==2){db=c[Z+8>>2]|0;if((db|0)<0){break}ga=c[d>>2]|0;if((ga|0)<0){c[d>>2]=db;fa=1;i=e;return fa|0}if((ga|0)==(db|0)){fa=1;i=e;return fa|0}lb=db<<16&16711680|ga<<8&65280|30;ga=a+8|0;db=c[ga>>2]|0;pb=a+4|0;jb=c[pb>>2]|0;F=jb+1|0;if(db>>>0<F>>>0){if((db|0)==0){c[ga>>2]=64;tb=64}else{tb=db}if(tb>>>0<F>>>0){db=tb;do{db=db<<1;}while(db>>>0<F>>>0);c[ga>>2]=db;ub=db}else{ub=tb}F=xe(c[a>>2]|0,ub<<2)|0;c[a>>2]=F;vb=F;wb=c[pb>>2]|0}else{vb=c[a>>2]|0;wb=jb}c[vb+(wb<<2)>>2]=lb;c[pb>>2]=(c[pb>>2]|0)+1;fa=1;i=e;return fa|0}}while(0);wb=td(c[a+40>>2]|0,_)|0;if((wb|0)>=0){_=c[d>>2]|0;if((_|0)<0){vb=a+16|0;ub=c[vb>>2]|0;tb=ub+1|0;c[vb>>2]=tb;vb=a+20|0;if((ub|0)>=(c[vb>>2]|0)){c[vb>>2]=tb}c[d>>2]=ub;xb=ub}else{xb=_}_=wb<<16&16711680|xb<<8&65280|40;xb=a+8|0;wb=c[xb>>2]|0;ub=a+4|0;tb=c[ub>>2]|0;vb=tb+1|0;if(wb>>>0<vb>>>0){if((wb|0)==0){c[xb>>2]=64;yb=64}else{yb=wb}if(yb>>>0<vb>>>0){wb=yb;do{wb=wb<<1;}while(wb>>>0<vb>>>0);c[xb>>2]=wb;zb=wb}else{zb=yb}yb=xe(c[a>>2]|0,zb<<2)|0;c[a>>2]=yb;Ab=yb;Bb=c[ub>>2]|0}else{Ab=c[a>>2]|0;Bb=tb}c[Ab+(Bb<<2)>>2]=_;c[ub>>2]=(c[ub>>2]|0)+1;fa=1;i=e;return fa|0}ub=c[kb>>2]|0;kb=wc(808)|0;c[kb+8>>2]=0;xc(ub);c[kb+12>>2]=ub;Dc($,kb);ub=a+24|0;Sd(c[(c[ub>>2]|0)+4>>2]|0,$,Y);if((c[Y>>2]&255|0)==2){_=c[Y+8>>2]|0;if((_|0)<0){Fa=226}else{Cb=_}}else{Fa=226}do{if((Fa|0)==226){_=c[ub>>2]|0;Y=Uc(c[_>>2]|0)|0;Ac(X,Y);$c(c[_>>2]|0,$);Td(c[_+4>>2]|0,$,X);Bb=Uc(c[_>>2]|0)|0;Ab=_+8|0;if((Bb|0)<=(c[Ab>>2]|0)){Cb=Y;break}c[Ab>>2]=Bb;Cb=Y}}while(0);yc(kb);kb=c[d>>2]|0;if((kb|0)<0){X=a+16|0;$=c[X>>2]|0;ub=$+1|0;c[X>>2]=ub;X=a+20|0;if(($|0)>=(c[X>>2]|0)){c[X>>2]=ub}c[d>>2]=$;Db=$}else{Db=kb}kb=Cb<<16|Db<<8&65280|29;Db=a+8|0;Cb=c[Db>>2]|0;$=a+4|0;ub=c[$>>2]|0;X=ub+1|0;if(Cb>>>0<X>>>0){if((Cb|0)==0){c[Db>>2]=64;Eb=64}else{Eb=Cb}if(Eb>>>0<X>>>0){Cb=Eb;do{Cb=Cb<<1;}while(Cb>>>0<X>>>0);c[Db>>2]=Cb;Fb=Cb}else{Fb=Eb}Eb=xe(c[a>>2]|0,Fb<<2)|0;c[a>>2]=Eb;Gb=Eb;Hb=c[$>>2]|0}else{Gb=c[a>>2]|0;Hb=ub}c[Gb+(Hb<<2)>>2]=kb;c[$>>2]=(c[$>>2]|0)+1;fa=1;i=e;return fa|0};case 57:{fa=md(a,b,d)|0;i=e;return fa|0};case 59:{$=c[d>>2]|0;if(($|0)<0){kb=a+16|0;Hb=c[kb>>2]|0;Gb=Hb+1|0;c[kb>>2]=Gb;kb=a+20|0;if((Hb|0)>=(c[kb>>2]|0)){c[kb>>2]=Gb}c[d>>2]=Hb;Ib=Hb}else{Ib=$}$=Ib<<8&65280|31;Ib=a+8|0;Hb=c[Ib>>2]|0;Gb=a+4|0;kb=c[Gb>>2]|0;ub=kb+1|0;if(Hb>>>0<ub>>>0){if((Hb|0)==0){c[Ib>>2]=64;Jb=64}else{Jb=Hb}if(Jb>>>0<ub>>>0){Hb=Jb;do{Hb=Hb<<1;}while(Hb>>>0<ub>>>0);c[Ib>>2]=Hb;Kb=Hb}else{Kb=Jb}Jb=xe(c[a>>2]|0,Kb<<2)|0;c[a>>2]=Jb;Lb=Jb;Mb=c[Gb>>2]|0}else{Lb=c[a>>2]|0;Mb=kb}c[Lb+(Mb<<2)>>2]=$;c[Gb>>2]=(c[Gb>>2]|0)+1;fa=1;i=e;return fa|0};case 58:{Gb=Tc()|0;$=a+16|0;if((c[d>>2]|0)<0){Mb=c[$>>2]|0;Lb=Mb+1|0;c[$>>2]=Lb;kb=a+20|0;if((Mb|0)>=(c[kb>>2]|0)){c[kb>>2]=Lb}c[d>>2]=Mb;Nb=kb}else{Nb=a+20|0}kb=ve(16)|0;c[kb>>2]=Pd()|0;c[kb+4>>2]=Gb;Mb=a+28|0;c[kb+8>>2]=c[Mb>>2];Lb=a+40|0;c[kb+12>>2]=c[Lb>>2];c[Lb>>2]=kb;kb=c[$>>2]|0;Jb=c[Nb>>2]|0;Kb=c[Mb>>2]|0;Hb=a+32|0;Ib=c[Hb>>2]|0;ub=a+36|0;Eb=c[ub>>2]|0;c[m>>2]=Tc()|0;Fb=m+4|0;c[Fb>>2]=Pd()|0;c[m+8>>2]=0;c[Mb>>2]=m;c[Nb>>2]=0;Cb=a+8|0;Db=c[Cb>>2]|0;X=a+4|0;Y=c[X>>2]|0;Bb=Y+1|0;if(Db>>>0<Bb>>>0){if((Db|0)==0){c[Cb>>2]=64;Ob=64}else{Ob=Db}if(Ob>>>0<Bb>>>0){Db=Ob;do{Db=Db<<1;}while(Db>>>0<Bb>>>0);c[Cb>>2]=Db;Pb=Db}else{Pb=Ob}Ob=xe(c[a>>2]|0,Pb<<2)|0;c[a>>2]=Ob;Qb=Ob;Rb=c[X>>2]|0}else{Qb=c[a>>2]|0;Rb=Y}c[Qb+(Rb<<2)>>2]=37;Rb=c[X>>2]|0;Qb=Rb+1|0;c[X>>2]=Qb;Y=c[Cb>>2]|0;Ob=Rb+5|0;if(Y>>>0<Ob>>>0){if((Y|0)==0){c[Cb>>2]=64;Sb=64}else{Sb=Y}if(Sb>>>0<Ob>>>0){Y=Sb;do{Y=Y<<1;}while(Y>>>0<Ob>>>0);c[Cb>>2]=Y;Tb=Y}else{Tb=Sb}Sb=xe(c[a>>2]|0,Tb<<2)|0;c[a>>2]=Sb;Ub=Sb;Vb=c[X>>2]|0}else{Ub=c[a>>2]|0;Vb=Qb}c[Ub+(Vb<<2)>>2]=0;c[Ub+(Vb+1<<2)>>2]=0;c[Ub+(Vb+2<<2)>>2]=0;c[Ub+(Vb+3<<2)>>2]=0;c[X>>2]=(c[X>>2]|0)+4;Vb=c[b+24>>2]|0;Ub=wc(808)|0;c[Ub+8>>2]=1;c[Ub+16>>2]=Qb;if((Vb|0)==0){c[Ub+12>>2]=0}else{xc(Vb);c[Ub+12>>2]=Vb}Dc(o,Ub);c[n+0>>2]=c[o+0>>2];c[n+4>>2]=c[o+4>>2];c[n+8>>2]=c[o+8>>2];c[n+12>>2]=c[o+12>>2];Vb=c[a+24>>2]|0;Sb=Uc(c[Vb>>2]|0)|0;Ac(j,Sb);$c(c[Vb>>2]|0,n);Td(c[Vb+4>>2]|0,n,j);Tb=Uc(c[Vb>>2]|0)|0;Y=Vb+8|0;if((Tb|0)>(c[Y>>2]|0)){c[Y>>2]=Tb}yc(Ub);Ub=c[b+32>>2]|0;a:do{if((Ub|0)==0){Fa=314}else{Tb=p+8|0;Y=D+8|0;Vb=Ub;while(1){c[p>>2]=259;Wb=Vb+24|0;c[Tb>>2]=c[Wb>>2];Sd(c[(c[Mb>>2]|0)+4>>2]|0,p,D);if((c[D>>2]&255|0)==2){if((c[Y>>2]|0)>=0){break}}Ob=c[Mb>>2]|0;Ac(C,Uc(c[Ob>>2]|0)|0);$c(c[Ob>>2]|0,p);Td(c[Ob+4>>2]|0,p,C);Pb=Uc(c[Ob>>2]|0)|0;Db=Ob+8|0;if((Pb|0)>(c[Db>>2]|0)){c[Db>>2]=Pb}Pb=c[Vb+32>>2]|0;if((Pb|0)==0){Fa=314;break a}else{Vb=Pb}}c[W>>2]=c[(c[Wb>>2]|0)+8>>2];c[j>>2]=c[Vb+28>>2];c[aa>>2]=j;Y=dh(464,k,aa)|0;Tb=dh(744,l,W)|0;pb=a+12|0;gi(c[pb>>2]|0);lb=ve((c[k>>2]|0)+1+(c[l>>2]|0)|0)|0;c[pb>>2]=lb;Ii(lb|0,Y|0)|0;Ii((c[pb>>2]|0)+(c[k>>2]|0)|0,Tb|0)|0;gi(Y);gi(Tb);yc(c[m>>2]|0);yc(c[Fb>>2]|0);c[$>>2]=kb;c[Nb>>2]=Jb;c[Mb>>2]=Kb;c[Hb>>2]=Ib;c[ub>>2]=Eb;Tb=c[Lb>>2]|0;Y=c[Tb+12>>2]|0;yc(c[Tb>>2]|0);gi(Tb);c[Lb>>2]=Y}}while(0);do{if((Fa|0)==314){Wb=Uc(c[c[Mb>>2]>>2]|0)|0;if((jd(a,c[b+36>>2]|0)|0)==0){yc(c[m>>2]|0);yc(c[Fb>>2]|0);c[$>>2]=kb;c[Nb>>2]=Jb;c[Mb>>2]=Kb;c[Hb>>2]=Ib;c[ub>>2]=Eb;C=c[Lb>>2]|0;D=c[C+12>>2]|0;yc(c[C>>2]|0);gi(C);c[Lb>>2]=D;break}D=c[Cb>>2]|0;C=c[X>>2]|0;Ub=C+2|0;if(D>>>0<Ub>>>0){if((D|0)==0){c[Cb>>2]=64;Xb=64}else{Xb=D}if(Xb>>>0<Ub>>>0){D=Xb;do{D=D<<1;}while(D>>>0<Ub>>>0);c[Cb>>2]=D;Yb=D}else{Yb=Xb}Ub=xe(c[a>>2]|0,Yb<<2)|0;c[a>>2]=Ub;Zb=Ub;_b=c[X>>2]|0}else{Zb=c[a>>2]|0;_b=C}Ub=Zb+(_b<<2)|0;c[Ub>>2]=28;c[Ub+4>>2]=1;Ub=(c[X>>2]|0)+2|0;c[X>>2]=Ub;Vb=c[Nb>>2]|0;if((Vb|0)<1){c[Nb>>2]=1;$b=1}else{$b=Vb}Vb=c[(c[Mb>>2]|0)+8>>2]|0;Y=($b|0)>(Vb|0)?$b:Vb;Vb=c[a>>2]|0;c[Vb+(Qb<<2)>>2]=-5-Rb+Ub;c[Vb+(Rb+2<<2)>>2]=Wb;c[Vb+(Rb+3<<2)>>2]=Y;c[Vb+(Rb+4<<2)>>2]=0;yc(c[m>>2]|0);yc(c[Fb>>2]|0);c[$>>2]=kb;c[Nb>>2]=Jb;c[Mb>>2]=Kb;c[Hb>>2]=Ib;c[ub>>2]=Eb;Vb=c[Lb>>2]|0;Ub=c[Vb+12>>2]|0;yc(c[Vb>>2]|0);gi(Vb);c[Lb>>2]=Ub;if((Y|0)>256){c[j>>2]=c[b+28>>2];c[aa>>2]=j;Y=dh(464,k,aa)|0;Ub=dh(776,l,0)|0;Vb=a+12|0;gi(c[Vb>>2]|0);Tb=ve((c[k>>2]|0)+1+(c[l>>2]|0)|0)|0;c[Vb>>2]=Tb;Ii(Tb|0,Y|0)|0;Ii((c[Vb>>2]|0)+(c[k>>2]|0)|0,Ub|0)|0;gi(Y);gi(Ub);break}Ub=Sb<<16|c[d>>2]<<8&65280|29;Y=c[Cb>>2]|0;Vb=c[X>>2]|0;Tb=Vb+1|0;if(Y>>>0<Tb>>>0){if((Y|0)==0){c[Cb>>2]=64;ac=64}else{ac=Y}if(ac>>>0<Tb>>>0){Y=ac;do{Y=Y<<1;}while(Y>>>0<Tb>>>0);c[Cb>>2]=Y;bc=Y}else{bc=ac}Tb=xe(c[a>>2]|0,bc<<2)|0;c[a>>2]=Tb;cc=Tb;dc=c[X>>2]|0}else{cc=c[a>>2]|0;dc=Vb}c[cc+(dc<<2)>>2]=Ub;c[X>>2]=(c[X>>2]|0)+1;Tb=Uc(Gb)|0;if((Tb|0)>0){Wb=Tb<<16&16711680|c[d>>2]<<8&65280|39;C=c[Cb>>2]|0;D=c[X>>2]|0;pb=D+1|0;if(C>>>0<pb>>>0){if((C|0)==0){c[Cb>>2]=64;ec=64}else{ec=C}if(ec>>>0<pb>>>0){C=ec;do{C=C<<1;}while(C>>>0<pb>>>0);c[Cb>>2]=C;fc=C}else{fc=ec}pb=xe(c[a>>2]|0,fc<<2)|0;c[a>>2]=pb;gc=pb;hc=c[X>>2]|0}else{gc=c[a>>2]|0;hc=D}c[gc+(hc<<2)>>2]=Wb;c[X>>2]=(c[X>>2]|0)+1;pb=E+8|0;Ub=0;do{Vc(Gb,Ub,E);Vb=c[pb>>2]|0;Y=c[Cb>>2]|0;lb=c[X>>2]|0;jb=lb+1|0;if(Y>>>0<jb>>>0){if((Y|0)==0){c[Cb>>2]=64;ic=64}else{ic=Y}if(ic>>>0<jb>>>0){Y=ic;do{Y=Y<<1;}while(Y>>>0<jb>>>0);c[Cb>>2]=Y;jc=Y}else{jc=ic}jb=xe(c[a>>2]|0,jc<<2)|0;c[a>>2]=jb;kc=jb;lc=c[X>>2]|0}else{kc=c[a>>2]|0;lc=lb}c[kc+(lc<<2)>>2]=Vb;c[X>>2]=(c[X>>2]|0)+1;Ub=Ub+1|0;}while((Ub|0)!=(Tb|0))}yc(Gb);fa=1;i=e;return fa|0}}while(0);yc(Gb);fa=0;i=e;return fa|0};case 60:{Gb=a+16|0;if((c[d>>2]|0)<0){X=c[Gb>>2]|0;lc=X+1|0;c[Gb>>2]=lc;kc=a+20|0;if((X|0)>=(c[kc>>2]|0)){c[kc>>2]=lc}c[d>>2]=X;mc=kc}else{mc=a+20|0}kc=c[Gb>>2]|0;X=kc+1|0;c[Gb>>2]=X;if((kc|0)>=(c[mc>>2]|0)){c[mc>>2]=X}c[B>>2]=kc;kc=c[d>>2]<<8&65280|32;X=a+8|0;mc=c[X>>2]|0;lc=a+4|0;jc=c[lc>>2]|0;ic=jc+1|0;if(mc>>>0<ic>>>0){if((mc|0)==0){c[X>>2]=64;nc=64}else{nc=mc}if(nc>>>0<ic>>>0){mc=nc;do{mc=mc<<1;}while(mc>>>0<ic>>>0);c[X>>2]=mc;oc=mc}else{oc=nc}nc=xe(c[a>>2]|0,oc<<2)|0;c[a>>2]=nc;pc=nc;qc=c[lc>>2]|0}else{pc=c[a>>2]|0;qc=jc}c[pc+(qc<<2)>>2]=kc;c[lc>>2]=(c[lc>>2]|0)+1;b:do{if((b|0)!=0){kc=b;while(1){qc=c[kc+32>>2]|0;if((qc|0)==0){break b}if((ld(a,qc,B)|0)==0){fa=0;break}qc=c[d>>2]<<8&65280|c[B>>2]<<16&16711680|36;pc=c[X>>2]|0;jc=c[lc>>2]|0;nc=jc+1|0;if(pc>>>0<nc>>>0){if((pc|0)==0){c[X>>2]=64;rc=64}else{rc=pc}if(rc>>>0<nc>>>0){pc=rc;do{pc=pc<<1;}while(pc>>>0<nc>>>0);c[X>>2]=pc;sc=pc}else{sc=rc}nc=xe(c[a>>2]|0,sc<<2)|0;c[a>>2]=nc;tc=nc;uc=c[lc>>2]|0}else{tc=c[a>>2]|0;uc=jc}c[tc+(uc<<2)>>2]=qc;c[lc>>2]=(c[lc>>2]|0)+1;kc=c[kc+36>>2]|0;if((kc|0)==0){break b}}i=e;return fa|0}}while(0);c[Gb>>2]=(c[Gb>>2]|0)+ -1;fa=1;i=e;return fa|0};case 62:{Gb=a+16|0;if((c[d>>2]|0)<0){lc=c[Gb>>2]|0;uc=lc+1|0;c[Gb>>2]=uc;tc=a+20|0;if((lc|0)>=(c[tc>>2]|0)){c[tc>>2]=uc}c[d>>2]=lc;vc=tc}else{vc=a+20|0}tc=c[Gb>>2]|0;lc=tc+1|0;c[Gb>>2]=lc;uc=c[vc>>2]|0;if((tc|0)<(uc|0)){zc=uc}else{c[vc>>2]=lc;zc=lc}c[z>>2]=tc;uc=tc+2|0;c[Gb>>2]=uc;if((lc|0)>=(zc|0)){c[vc>>2]=uc}c[A>>2]=lc;lc=c[d>>2]<<8&65280|33;uc=a+8|0;vc=c[uc>>2]|0;zc=a+4|0;tc=c[zc>>2]|0;sc=tc+1|0;if(vc>>>0<sc>>>0){if((vc|0)==0){c[uc>>2]=64;Cc=64}else{Cc=vc}if(Cc>>>0<sc>>>0){vc=Cc;do{vc=vc<<1;}while(vc>>>0<sc>>>0);c[uc>>2]=vc;Ec=vc}else{Ec=Cc}Cc=xe(c[a>>2]|0,Ec<<2)|0;c[a>>2]=Cc;Fc=Cc;Gc=c[zc>>2]|0}else{Fc=c[a>>2]|0;Gc=tc}c[Fc+(Gc<<2)>>2]=lc;c[zc>>2]=(c[zc>>2]|0)+1;c:do{if((b|0)!=0){lc=b;while(1){Gc=c[lc+32>>2]|0;if((Gc|0)==0){break c}Fc=c[Gc+36>>2]|0;if((ld(a,c[Gc+32>>2]|0,z)|0)==0){fa=0;Fa=565;break}if((ld(a,Fc,A)|0)==0){fa=0;Fa=565;break}Fc=c[d>>2]<<8&65280|c[z>>2]<<16&16711680|c[A>>2]<<24|35;Gc=c[uc>>2]|0;tc=c[zc>>2]|0;Cc=tc+1|0;if(Gc>>>0<Cc>>>0){if((Gc|0)==0){c[uc>>2]=64;Hc=64}else{Hc=Gc}if(Hc>>>0<Cc>>>0){Gc=Hc;do{Gc=Gc<<1;}while(Gc>>>0<Cc>>>0);c[uc>>2]=Gc;Ic=Gc}else{Ic=Hc}Cc=xe(c[a>>2]|0,Ic<<2)|0;c[a>>2]=Cc;Jc=Cc;Kc=c[zc>>2]|0}else{Jc=c[a>>2]|0;Kc=tc}c[Jc+(Kc<<2)>>2]=Fc;c[zc>>2]=(c[zc>>2]|0)+1;lc=c[lc+36>>2]|0;if((lc|0)==0){break c}}if((Fa|0)==565){i=e;return fa|0}}}while(0);c[Gb>>2]=(c[Gb>>2]|0)+ -2;fa=1;i=e;return fa|0};case 54:case 53:{fa=pd(a,b,d,0,0,0)|0;i=e;return fa|0};case 55:{c[u>>2]=0;c[v>>2]=0;c[w>>2]=-1;c[x>>2]=-1;c[y>>2]=-1;if((c[d>>2]|0)<0){Gb=a+16|0;zc=c[Gb>>2]|0;Kc=zc+1|0;c[Gb>>2]=Kc;Gb=a+20|0;if((zc|0)>=(c[Gb>>2]|0)){c[Gb>>2]=Kc}c[d>>2]=zc}zc=c[b+32>>2]|0;do{if((c[zc>>2]|0)==54){if((pd(a,zc,w,1,x,y)|0)==0){fa=0;i=e;return fa|0}else{Lc=c[x>>2]|0;Mc=1;break}}else{if((ld(a,zc,w)|0)==0){fa=0}else{Lc=-1;Mc=0;break}i=e;return fa|0}}while(0);if((od(a,c[b+36>>2]|0,u,v,Mc,Lc)|0)==0){fa=0;i=e;return fa|0}Lc=c[v>>2]|0;v=c[w>>2]<<16&16711680|c[d>>2]<<8&65280|Lc<<24;w=a+8|0;Mc=c[w>>2]|0;zc=a+4|0;x=c[zc>>2]|0;y=x+1|0;if(Mc>>>0<y>>>0){if((Mc|0)==0){c[w>>2]=64;Nc=64}else{Nc=Mc}if(Nc>>>0<y>>>0){Mc=Nc;do{Mc=Mc<<1;}while(Mc>>>0<y>>>0);c[w>>2]=Mc;Oc=Mc}else{Oc=Nc}Nc=xe(c[a>>2]|0,Oc<<2)|0;c[a>>2]=Nc;Pc=Nc;Qc=c[zc>>2]|0}else{Pc=c[a>>2]|0;Qc=x}c[Pc+(Qc<<2)>>2]=v;v=(c[zc>>2]|0)+1|0;c[zc>>2]=v;Qc=c[u>>2]|0;u=(Lc+3|0)/4|0;Lc=c[w>>2]|0;Pc=u+v|0;if(Lc>>>0<Pc>>>0){if((Lc|0)==0){c[w>>2]=64;Rc=64}else{Rc=Lc}if(Rc>>>0<Pc>>>0){Lc=Rc;do{Lc=Lc<<1;}while(Lc>>>0<Pc>>>0);c[w>>2]=Lc;Sc=Lc}else{Sc=Rc}Rc=xe(c[a>>2]|0,Sc<<2)|0;c[a>>2]=Rc;Wc=Rc;Xc=c[zc>>2]|0}else{Wc=c[a>>2]|0;Xc=v}Ei(Wc+(Xc<<2)|0,Qc|0,u<<2|0)|0;c[zc>>2]=(c[zc>>2]|0)+u;gi(Qc);fa=1;i=e;return fa|0};case 44:{fa=ld(a,c[b+32>>2]|0,d)|0;i=e;return fa|0};case 50:case 49:case 48:{fa=nd(a,b,d)|0;i=e;return fa|0};case 45:{Qc=c[b+32>>2]|0;if((c[Qc>>2]|0)!=57){fa=nd(a,b,d)|0;i=e;return fa|0}u=Qc+8|0;zc=c[b+28>>2]|0;if((c[u>>2]&255|0)!=2){c[f>>2]=zc;c[aa>>2]=f;Xc=dh(464,g,aa)|0;Wc=dh(680,j,0)|0;v=a+12|0;gi(c[v>>2]|0);Rc=ve((c[g>>2]|0)+1+(c[j>>2]|0)|0)|0;c[v>>2]=Rc;Ii(Rc|0,Xc|0)|0;Ii((c[v>>2]|0)+(c[g>>2]|0)|0,Wc|0)|0;gi(Xc);gi(Wc);fa=0;i=e;return fa|0}Wc=dd(57,zc)|0;zc=Wc+8|0;if((c[u>>2]&767|0)==514){Bc(s,+h[Qc+16>>3]*-1.0);c[zc+0>>2]=c[s+0>>2];c[zc+4>>2]=c[s+4>>2];c[zc+8>>2]=c[s+8>>2];c[zc+12>>2]=c[s+12>>2]}else{Ac(t,0-(c[Qc+16>>2]|0)|0);c[zc+0>>2]=c[t+0>>2];c[zc+4>>2]=c[t+4>>2];c[zc+8>>2]=c[t+8>>2];c[zc+12>>2]=c[t+12>>2]}t=md(a,Wc,d)|0;ed(Wc);fa=t;i=e;return fa|0};case 52:case 51:case 47:case 46:{t=b+32|0;Wc=c[t>>2]|0;zc=c[Wc>>2]|0;if((zc|0)==56){c[r>>2]=259;c[r+8>>2]=c[Wc+24>>2];Sd(c[(c[a+28>>2]|0)+4>>2]|0,r,q);do{if((c[q>>2]&255|0)==2){r=c[q+8>>2]|0;if((r|0)<0){break}Qc=c[b>>2]|0;if((Qc|0)==47|(Qc|0)==46){s=r&255;u=((Qc|0)==46?17:18)|s<<8;Xc=a+8|0;v=c[Xc>>2]|0;Rc=a+4|0;Sc=c[Rc>>2]|0;Lc=Sc+1|0;if(v>>>0<Lc>>>0){if((v|0)==0){c[Xc>>2]=64;Yc=64}else{Yc=v}if(Yc>>>0<Lc>>>0){v=Yc;do{v=v<<1;}while(v>>>0<Lc>>>0);c[Xc>>2]=v;Zc=v}else{Zc=Yc}Lc=xe(c[a>>2]|0,Zc<<2)|0;c[a>>2]=Lc;_c=Lc;ad=c[Rc>>2]|0}else{_c=c[a>>2]|0;ad=Sc}c[_c+(ad<<2)>>2]=u;Lc=c[Rc>>2]|0;w=Lc+1|0;c[Rc>>2]=w;Pc=c[d>>2]|0;if((Pc|0)<0){c[d>>2]=r;fa=1;i=e;return fa|0}if((Pc|0)==(r|0)){fa=1;i=e;return fa|0}x=s<<16|Pc<<8&65280|30;Pc=c[Xc>>2]|0;Nc=Lc+2|0;if(Pc>>>0<Nc>>>0){if((Pc|0)==0){c[Xc>>2]=64;bd=64}else{bd=Pc}if(bd>>>0<Nc>>>0){Pc=bd;do{Pc=Pc<<1;}while(Pc>>>0<Nc>>>0);c[Xc>>2]=Pc;cd=Pc}else{cd=bd}Nc=xe(c[a>>2]|0,cd<<2)|0;c[a>>2]=Nc;fd=Nc;gd=c[Rc>>2]|0}else{fd=c[a>>2]|0;gd=w}c[fd+(gd<<2)>>2]=x;c[Rc>>2]=(c[Rc>>2]|0)+1;fa=1;i=e;return fa|0}else if((Qc|0)==52|(Qc|0)==51){Nc=(Qc|0)==51?17:18;s=c[d>>2]|0;do{if((s|0)<0){u=a+16|0;Sc=c[u>>2]|0;v=Sc+1|0;c[u>>2]=v;u=a+20|0;if((Sc|0)>=(c[u>>2]|0)){c[u>>2]=v}c[d>>2]=Sc;v=r<<16&16711680|Sc<<8&65280|30;Sc=a+8|0;u=c[Sc>>2]|0;Lc=a+4|0;Oc=c[Lc>>2]|0;Mc=Oc+1|0;if(u>>>0<Mc>>>0){if((u|0)==0){c[Sc>>2]=64;hd=64}else{hd=u}if(hd>>>0<Mc>>>0){u=hd;do{u=u<<1;}while(u>>>0<Mc>>>0);c[Sc>>2]=u;id=u}else{id=hd}Mc=xe(c[a>>2]|0,id<<2)|0;c[a>>2]=Mc;kd=Mc;qd=c[Lc>>2]|0}else{kd=c[a>>2]|0;qd=Oc}c[kd+(qd<<2)>>2]=v;Mc=(c[Lc>>2]|0)+1|0;c[Lc>>2]=Mc;rd=Sc;sd=Mc}else{if((s|0)==(r|0)){rd=a+8|0;sd=c[a+4>>2]|0;break}Mc=r<<16&16711680|s<<8&65280|30;Fc=a+8|0;tc=c[Fc>>2]|0;Gc=a+4|0;y=c[Gc>>2]|0;Kc=y+1|0;if(tc>>>0<Kc>>>0){if((tc|0)==0){c[Fc>>2]=64;ud=64}else{ud=tc}if(ud>>>0<Kc>>>0){tc=ud;do{tc=tc<<1;}while(tc>>>0<Kc>>>0);c[Fc>>2]=tc;vd=tc}else{vd=ud}Kc=xe(c[a>>2]|0,vd<<2)|0;c[a>>2]=Kc;wd=Kc;xd=c[Gc>>2]|0}else{wd=c[a>>2]|0;xd=y}c[wd+(xd<<2)>>2]=Mc;Kc=(c[Gc>>2]|0)+1|0;c[Gc>>2]=Kc;rd=Fc;sd=Kc}}while(0);s=Nc|r<<8&65280;Qc=c[rd>>2]|0;Rc=a+4|0;x=sd+1|0;if(Qc>>>0<x>>>0){if((Qc|0)==0){c[rd>>2]=64;yd=64}else{yd=Qc}if(yd>>>0<x>>>0){Qc=yd;do{Qc=Qc<<1;}while(Qc>>>0<x>>>0);c[rd>>2]=Qc;zd=Qc}else{zd=yd}x=xe(c[a>>2]|0,zd<<2)|0;c[a>>2]=x;Ad=x;Bd=c[Rc>>2]|0}else{Ad=c[a>>2]|0;Bd=sd}c[Ad+(Bd<<2)>>2]=s;c[Rc>>2]=(c[Rc>>2]|0)+1;fa=1;i=e;return fa|0}else{fa=1;i=e;return fa|0}}}while(0);Bd=c[t>>2]|0;c[W>>2]=c[(c[Bd+24>>2]|0)+8>>2];c[j>>2]=c[Bd+28>>2];c[aa>>2]=j;Bd=dh(464,k,aa)|0;t=dh(648,l,W)|0;W=a+12|0;gi(c[W>>2]|0);Ad=ve((c[k>>2]|0)+1+(c[l>>2]|0)|0)|0;c[W>>2]=Ad;Ii(Ad|0,Bd|0)|0;Ii((c[W>>2]|0)+(c[k>>2]|0)|0,t|0)|0;gi(Bd);gi(t);fa=0;i=e;return fa|0}else if((zc|0)==54|(zc|0)==53){c[n>>2]=-1;c[o>>2]=-1;if((da|0)==51|(da|0)==46){Cd=17}else{Cd=18}t=(zc|0)==53;zc=t?34:42;Bd=t?35:43;if((c[d>>2]|0)<0){t=a+16|0;k=c[t>>2]|0;W=k+1|0;c[t>>2]=W;t=a+20|0;if((k|0)>=(c[t>>2]|0)){c[t>>2]=W}c[d>>2]=k}if((ld(a,c[Wc+32>>2]|0,n)|0)==0){fa=0;i=e;return fa|0}do{if((c[Wc>>2]|0)==53){if((ld(a,c[Wc+36>>2]|0,o)|0)==0){fa=0}else{break}i=e;return fa|0}else{c[p>>2]=259;c[p+8>>2]=c[(c[Wc+36>>2]|0)+24>>2];if((c[o>>2]|0)<0){k=a+16|0;W=c[k>>2]|0;t=W+1|0;c[k>>2]=t;k=a+20|0;if((W|0)>=(c[k>>2]|0)){c[k>>2]=t}c[o>>2]=W}W=a+24|0;Sd(c[(c[W>>2]|0)+4>>2]|0,p,f);if((c[f>>2]&255|0)==2){t=c[f+8>>2]|0;if((t|0)<0){Fa=527}else{Dd=t}}else{Fa=527}do{if((Fa|0)==527){t=c[W>>2]|0;k=Uc(c[t>>2]|0)|0;Ac(g,k);$c(c[t>>2]|0,p);Td(c[t+4>>2]|0,p,g);Ad=Uc(c[t>>2]|0)|0;l=t+8|0;if((Ad|0)<=(c[l>>2]|0)){Dd=k;break}c[l>>2]=Ad;Dd=k}}while(0);W=Dd<<16|c[o>>2]<<8&65280|29;Rc=a+8|0;s=c[Rc>>2]|0;Qc=a+4|0;k=c[Qc>>2]|0;Ad=k+1|0;if(s>>>0<Ad>>>0){if((s|0)==0){c[Rc>>2]=64;Ed=64}else{Ed=s}if(Ed>>>0<Ad>>>0){s=Ed;do{s=s<<1;}while(s>>>0<Ad>>>0);c[Rc>>2]=s;Fd=s}else{Fd=Ed}Ad=xe(c[a>>2]|0,Fd<<2)|0;c[a>>2]=Ad;Gd=Ad;Hd=c[Qc>>2]|0}else{Gd=c[a>>2]|0;Hd=k}c[Gd+(Hd<<2)>>2]=W;c[Qc>>2]=(c[Qc>>2]|0)+1}}while(0);Hd=c[b>>2]|0;if((Hd|0)==47|(Hd|0)==46){Gd=c[d>>2]|0;Fd=Gd<<8&65280;Ed=c[n>>2]|0;Dd=c[o>>2]|0;p=Fd|zc|Ed<<16&16711680|Dd<<24;Fa=Fd|Cd;Fd=Gd<<24|Bd|Ed<<8&65280|Dd<<16&16711680;Dd=a+8|0;Ed=c[Dd>>2]|0;Gd=a+4|0;Ad=c[Gd>>2]|0;l=Ad+3|0;if(Ed>>>0<l>>>0){if((Ed|0)==0){c[Dd>>2]=64;Id=64}else{Id=Ed}if(Id>>>0<l>>>0){Ed=Id;do{Ed=Ed<<1;}while(Ed>>>0<l>>>0);c[Dd>>2]=Ed;Jd=Ed}else{Jd=Id}Id=xe(c[a>>2]|0,Jd<<2)|0;c[a>>2]=Id;Kd=Id;Ld=c[Gd>>2]|0}else{Kd=c[a>>2]|0;Ld=Ad}c[Kd+(Ld<<2)>>2]=p;c[Kd+(Ld+1<<2)>>2]=Fa;c[Kd+(Ld+2<<2)>>2]=Fd;c[Gd>>2]=(c[Gd>>2]|0)+3}else if((Hd|0)==52|(Hd|0)==51){Hd=a+16|0;Gd=c[Hd>>2]|0;Fd=Gd+1|0;c[Hd>>2]=Fd;Ld=a+20|0;if((Gd|0)>=(c[Ld>>2]|0)){c[Ld>>2]=Fd}Fd=c[d>>2]|0;d=c[n>>2]|0;Ld=c[o>>2]|0;Kd=Fd<<8&65280|zc|d<<16&16711680|Ld<<24;zc=Gd<<8&65280;Fa=zc|Fd<<16&16711680|30;Fd=zc|Cd;Cd=Gd<<24|Bd|d<<8&65280|Ld<<16&16711680;Ld=a+8|0;d=c[Ld>>2]|0;Bd=a+4|0;Gd=c[Bd>>2]|0;zc=Gd+4|0;if(d>>>0<zc>>>0){if((d|0)==0){c[Ld>>2]=64;Md=64}else{Md=d}if(Md>>>0<zc>>>0){d=Md;do{d=d<<1;}while(d>>>0<zc>>>0);c[Ld>>2]=d;Nd=d}else{Nd=Md}Md=xe(c[a>>2]|0,Nd<<2)|0;c[a>>2]=Md;Od=Md;Qd=c[Bd>>2]|0}else{Od=c[a>>2]|0;Qd=Gd}c[Od+(Qd<<2)>>2]=Kd;c[Od+(Qd+1<<2)>>2]=Fa;c[Od+(Qd+2<<2)>>2]=Fd;c[Od+(Qd+3<<2)>>2]=Cd;c[Bd>>2]=(c[Bd>>2]|0)+4;c[Hd>>2]=(c[Hd>>2]|0)+ -1}Hd=Uc(c[c[a+28>>2]>>2]|0)|0;if((c[n>>2]|0)>=(Hd|0)){n=a+16|0;c[n>>2]=(c[n>>2]|0)+ -1}if((c[o>>2]|0)<(Hd|0)){fa=1;i=e;return fa|0}Hd=a+16|0;c[Hd>>2]=(c[Hd>>2]|0)+ -1;fa=1;i=e;return fa|0}else{c[f>>2]=c[Wc+28>>2];c[aa>>2]=f;Wc=dh(464,g,aa)|0;Hd=dh(584,j,0)|0;o=a+12|0;gi(c[o>>2]|0);n=ve((c[g>>2]|0)+1+(c[j>>2]|0)|0)|0;c[o>>2]=n;Ii(n|0,Wc|0)|0;Ii((c[o>>2]|0)+(c[g>>2]|0)|0,Hd|0)|0;gi(Wc);gi(Hd);fa=0;i=e;return fa|0}break};default:{c[ba>>2]=da;c[ca>>2]=ba;c[f>>2]=c[b+28>>2];c[aa>>2]=f;f=dh(464,g,aa)|0;aa=dh(552,j,ca)|0;ca=a+12|0;gi(c[ca>>2]|0);a=ve((c[g>>2]|0)+1+(c[j>>2]|0)|0)|0;c[ca>>2]=a;Ii(a|0,f|0)|0;Ii((c[ca>>2]|0)+(c[g>>2]|0)|0,aa|0)|0;gi(f);gi(aa);fa=0;i=e;return fa|0}}return 0}function md(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0.0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0;e=i;i=i+32|0;f=e+16|0;g=e;j=c[d>>2]|0;if((j|0)<0){l=a+16|0;m=c[l>>2]|0;n=m+1|0;c[l>>2]=n;l=a+20|0;if((m|0)>=(c[l>>2]|0)){c[l>>2]=n}c[d>>2]=m;o=m}else{o=j}j=b+8|0;m=c[j>>2]|0;n=m&255;if((n|0)==0){l=o<<8&65280|28;p=a+8|0;q=c[p>>2]|0;r=a+4|0;s=c[r>>2]|0;t=s+1|0;if(q>>>0<t>>>0){if((q|0)==0){c[p>>2]=64;u=64}else{u=q}if(u>>>0<t>>>0){q=u;do{q=q<<1;}while(q>>>0<t>>>0);c[p>>2]=q;v=q}else{v=u}u=xe(c[a>>2]|0,v<<2)|0;c[a>>2]=u;w=u;x=c[r>>2]|0}else{w=c[a>>2]|0;x=s}c[w+(x<<2)>>2]=l;c[r>>2]=(c[r>>2]|0)+1;y=1;i=e;return y|0}else if((n|0)==1){r=((c[b+16>>2]|0)!=0?65564:131100)|o<<8&65280;l=a+8|0;x=c[l>>2]|0;w=a+4|0;s=c[w>>2]|0;u=s+1|0;if(x>>>0<u>>>0){if((x|0)==0){c[l>>2]=64;z=64}else{z=x}if(z>>>0<u>>>0){x=z;do{x=x<<1;}while(x>>>0<u>>>0);c[l>>2]=x;A=x}else{A=z}z=xe(c[a>>2]|0,A<<2)|0;c[a>>2]=z;B=z;C=c[w>>2]|0}else{B=c[a>>2]|0;C=s}c[B+(C<<2)>>2]=r;c[w>>2]=(c[w>>2]|0)+1;y=1;i=e;return y|0}else if((n|0)==2){if((m&512|0)==0){m=c[b+16>>2]|0;w=o<<8&65280|196636;r=a+8|0;C=c[r>>2]|0;B=a+4|0;s=c[B>>2]|0;z=s+2|0;if(C>>>0<z>>>0){if((C|0)==0){c[r>>2]=64;D=64}else{D=C}if(D>>>0<z>>>0){C=D;do{C=C<<1;}while(C>>>0<z>>>0);c[r>>2]=C;E=C}else{E=D}D=xe(c[a>>2]|0,E<<2)|0;c[a>>2]=D;F=D;G=c[B>>2]|0}else{F=c[a>>2]|0;G=s}c[F+(G<<2)>>2]=w;c[F+(G+1<<2)>>2]=m;c[B>>2]=(c[B>>2]|0)+2;y=1;i=e;return y|0}else{H=+h[b+16>>3];b=o<<8&65280|262172;B=a+8|0;m=c[B>>2]|0;G=a+4|0;F=c[G>>2]|0;w=F+3|0;if(m>>>0<w>>>0){if((m|0)==0){c[B>>2]=64;I=64}else{I=m}if(I>>>0<w>>>0){m=I;do{m=m<<1;}while(m>>>0<w>>>0);c[B>>2]=m;J=m}else{J=I}I=xe(c[a>>2]|0,J<<2)|0;c[a>>2]=I;K=I;L=c[G>>2]|0}else{K=c[a>>2]|0;L=F}c[K+(L<<2)>>2]=b;b=K+(L+1<<2)|0;h[k>>3]=H;c[b>>2]=c[k>>2];c[b+4>>2]=c[k+4>>2];c[G>>2]=(c[G>>2]|0)+3;y=1;i=e;return y|0}}else if((n|0)==3){if((o|0)<0){o=a+16|0;n=c[o>>2]|0;G=n+1|0;c[o>>2]=G;o=a+20|0;if((n|0)>=(c[o>>2]|0)){c[o>>2]=G}c[d>>2]=n}n=a+24|0;Sd(c[(c[n>>2]|0)+4>>2]|0,j,f);if((c[f>>2]&255|0)==2){G=c[f+8>>2]|0;if((G|0)<0){M=49}else{N=G}}else{M=49}do{if((M|0)==49){G=c[n>>2]|0;f=Uc(c[G>>2]|0)|0;Ac(g,f);$c(c[G>>2]|0,j);Td(c[G+4>>2]|0,j,g);o=Uc(c[G>>2]|0)|0;b=G+8|0;if((o|0)<=(c[b>>2]|0)){N=f;break}c[b>>2]=o;N=f}}while(0);g=N<<16|c[d>>2]<<8&65280|29;d=a+8|0;N=c[d>>2]|0;j=a+4|0;n=c[j>>2]|0;M=n+1|0;if(N>>>0<M>>>0){if((N|0)==0){c[d>>2]=64;O=64}else{O=N}if(O>>>0<M>>>0){N=O;do{N=N<<1;}while(N>>>0<M>>>0);c[d>>2]=N;P=N}else{P=O}O=xe(c[a>>2]|0,P<<2)|0;c[a>>2]=O;Q=O;R=c[j>>2]|0}else{Q=c[a>>2]|0;R=n}c[Q+(R<<2)>>2]=g;c[j>>2]=(c[j>>2]|0)+1;y=1;i=e;return y|0}else{y=0;i=e;return y|0}return 0}function nd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=i;i=i+16|0;f=e;c[f>>2]=-1;g=c[b>>2]|0;if((g|0)==49){h=25}else if((g|0)==45){h=16}else if((g|0)==50){h=24}else if((g|0)==48){h=26}else{h=255}if((c[d>>2]|0)<0){g=a+16|0;j=c[g>>2]|0;k=j+1|0;c[g>>2]=k;g=a+20|0;if((j|0)>=(c[g>>2]|0)){c[g>>2]=k}c[d>>2]=j}if((ld(a,c[b+32>>2]|0,f)|0)==0){l=0;i=e;return l|0}b=c[d>>2]<<8&65280|h|c[f>>2]<<16&16711680;h=a+8|0;d=c[h>>2]|0;j=a+4|0;k=c[j>>2]|0;g=k+1|0;if(d>>>0<g>>>0){if((d|0)==0){c[h>>2]=64;m=64}else{m=d}if(m>>>0<g>>>0){d=m;do{d=d<<1;}while(d>>>0<g>>>0);c[h>>2]=d;n=d}else{n=m}m=xe(c[a>>2]|0,n<<2)|0;c[a>>2]=m;o=m;p=c[j>>2]|0}else{o=c[a>>2]|0;p=k}c[o+(p<<2)>>2]=b;c[j>>2]=(c[j>>2]|0)+1;j=Uc(c[c[a+28>>2]>>2]|0)|0;if((c[f>>2]|0)<(j|0)){l=1;i=e;return l|0}j=a+16|0;c[j>>2]=(c[j>>2]|0)+ -1;l=1;i=e;return l|0}function od(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h;k=h+4|0;if((b|0)!=0){c[k>>2]=-1;c[e>>2]=(c[e>>2]|0)+1;if((od(a,c[b+32>>2]|0,d,e,f,g)|0)==0){l=0;i=h;return l|0}if((ld(a,c[b+36>>2]|0,k)|0)==0){gi(c[d>>2]|0);l=0;i=h;return l|0}else{b=c[e>>2]|0;a=(c[d>>2]|0)+(((b|0)/4|0)<<2)|0;c[a>>2]=c[a>>2]|c[k>>2]<<(((b|0)%4|0)<<3);c[e>>2]=(c[e>>2]|0)+1;l=1;i=h;return l|0}}b=(f|0)!=0;f=c[e>>2]|0;if(b){k=f+1|0;c[e>>2]=k;m=k}else{m=f}f=hi((m+3|0)/4|0,4)|0;c[d>>2]=f;if((m|0)>0&(f|0)==0){we(728,j)}if(b){c[f>>2]=c[f>>2]|g;c[e>>2]=1;l=1;i=h;return l|0}else{c[e>>2]=0;l=1;i=h;return l|0}return 0}function pd(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;h=i;i=i+64|0;j=h+32|0;k=h+16|0;l=h+52|0;m=h+48|0;n=h;c[l>>2]=-1;c[m>>2]=-1;if((c[d>>2]|0)<0){o=a+16|0;p=c[o>>2]|0;q=p+1|0;c[o>>2]=q;o=a+20|0;if((p|0)>=(c[o>>2]|0)){c[o>>2]=q}c[d>>2]=p}if((ld(a,c[b+32>>2]|0,l)|0)==0){r=0;i=h;return r|0}do{if((c[b>>2]|0)==53){if((ld(a,c[b+36>>2]|0,m)|0)==0){r=0}else{break}i=h;return r|0}else{c[n>>2]=259;c[n+8>>2]=c[(c[b+36>>2]|0)+24>>2];if((c[m>>2]|0)<0){p=a+16|0;q=c[p>>2]|0;o=q+1|0;c[p>>2]=o;p=a+20|0;if((q|0)>=(c[p>>2]|0)){c[p>>2]=o}c[m>>2]=q}q=a+24|0;Sd(c[(c[q>>2]|0)+4>>2]|0,n,k);if((c[k>>2]&255|0)==2){o=c[k+8>>2]|0;if((o|0)<0){s=14}else{t=o}}else{s=14}do{if((s|0)==14){o=c[q>>2]|0;p=Uc(c[o>>2]|0)|0;Ac(j,p);$c(c[o>>2]|0,n);Td(c[o+4>>2]|0,n,j);u=Uc(c[o>>2]|0)|0;v=o+8|0;if((u|0)<=(c[v>>2]|0)){t=p;break}c[v>>2]=u;t=p}}while(0);q=t<<16|c[m>>2]<<8&65280|29;p=a+8|0;u=c[p>>2]|0;v=a+4|0;o=c[v>>2]|0;w=o+1|0;if(u>>>0<w>>>0){if((u|0)==0){c[p>>2]=64;x=64}else{x=u}if(x>>>0<w>>>0){u=x;do{u=u<<1;}while(u>>>0<w>>>0);c[p>>2]=u;y=u}else{y=x}w=xe(c[a>>2]|0,y<<2)|0;c[a>>2]=w;z=w;A=c[v>>2]|0}else{z=c[a>>2]|0;A=o}c[z+(A<<2)>>2]=q;c[v>>2]=(c[v>>2]|0)+1}}while(0);if((e|0)==0){e=Uc(c[c[a+28>>2]>>2]|0)|0;A=c[l>>2]|0;if((A|0)>=(e|0)){z=a+16|0;c[z>>2]=(c[z>>2]|0)+ -1}z=c[m>>2]|0;if((z|0)>=(e|0)){e=a+16|0;c[e>>2]=(c[e>>2]|0)+ -1}B=z;C=A;D=(c[b>>2]|0)==54?42:34}else{b=c[l>>2]|0;c[f>>2]=b;f=c[m>>2]|0;c[g>>2]=f;B=f;C=b;D=41}b=c[d>>2]<<8&65280|D|C<<16&16711680|B<<24;B=a+8|0;C=c[B>>2]|0;D=a+4|0;d=c[D>>2]|0;f=d+1|0;if(C>>>0<f>>>0){if((C|0)==0){c[B>>2]=64;E=64}else{E=C}if(E>>>0<f>>>0){C=E;do{C=C<<1;}while(C>>>0<f>>>0);c[B>>2]=C;F=C}else{F=E}E=xe(c[a>>2]|0,F<<2)|0;c[a>>2]=E;G=E;H=c[D>>2]|0}else{G=c[a>>2]|0;H=d}c[G+(H<<2)>>2]=b;c[D>>2]=(c[D>>2]|0)+1;r=1;i=h;return r|0}function qd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;e=c[a+8>>2]|0;do{if((e|0)==(c[b+8>>2]|0)){if((e|0)==0){f=vc(c[a+12>>2]|0,c[b+12>>2]|0)|0;break}else if((e|0)==1){f=(c[a+16>>2]|0)==(c[b+16>>2]|0)|0;break}else{f=0;break}}else{f=0}}while(0);i=d;return f|0}function rd(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=c[a+8>>2]|0;if((d|0)==0){e=c[a+12>>2]|0;f=ac[c[(c[e>>2]|0)+12>>2]&15](e)|0}else if((d|0)==1){f=c[a+16>>2]|0}else{f=0}i=b;return f|0}function sd(a){a=a|0;var b=0,d=0;b=i;d=c[a+12>>2]|0;if((d|0)==0){i=b;return}yc(d);i=b;return}function td(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;d=i;i=i+96|0;e=d+80|0;f=d+64|0;g=d+48|0;h=d+32|0;j=d+16|0;k=d;if((a|0)==0){l=-1;i=d;return l|0}Sd(c[a>>2]|0,b,f);if((c[f>>2]&767|0)==2){l=c[f+8>>2]|0;i=d;return l|0}Sd(c[(c[a+8>>2]|0)+4>>2]|0,b,e);do{if((c[e>>2]&255|0)==2){f=c[e+8>>2]|0;if(!((f|0)>-1)){break}Ac(j,f<<8&65280);f=Qd(c[a>>2]|0)|0;Ac(k,f);Td(c[a>>2]|0,b,k);$c(c[a+4>>2]|0,j);l=f;i=d;return l|0}}while(0);j=td(c[a+12>>2]|0,b)|0;if((j|0)<0){l=-1;i=d;return l|0}k=Qd(c[a>>2]|0)|0;Ac(g,k);Ac(h,j<<8&65280|1);Td(c[a>>2]|0,b,g);$c(c[a+4>>2]|0,h);l=k;i=d;return l|0}function ud(){var a=0,b=0,d=0;a=i;b=ve(28)|0;c[b>>2]=ce()|0;c[b+4>>2]=fd()|0;d=b+8|0;c[d>>2]=oh()|0;c[b+12>>2]=Tc()|0;c[b+16>>2]=0;c[b+20>>2]=0;c[b+24>>2]=0;Bh(c[d>>2]|0,b);De(c[d>>2]|0);i=a;return b|0}function vd(a){a=a|0;var b=0;b=i;de(c[a>>2]|0);gd(c[a+4>>2]|0);ph(c[a+8>>2]|0);yc(c[a+12>>2]|0);gi(a);i=b;return}function wd(a){a=a|0;i=i;return c[a+16>>2]|0}function xd(a){a=a|0;var b=0,d=0,e=0;b=i;d=c[a+16>>2]|0;if((d|0)==2){e=id(c[a+4>>2]|0)|0}else if((d|0)==3){e=zh(c[a+8>>2]|0)|0}else if((d|0)==4){e=c[a+20>>2]|0}else if((d|0)==1){e=c[(c[a>>2]|0)+44>>2]|0}else{e=0}i=b;return e|0}function yd(a){a=a|0;c[a+16>>2]=0;i=i;return}function zd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;i=i+16|0;e=d;f=a+16|0;c[f>>2]=0;g=fe(c[a>>2]|0,b)|0;if((g|0)==0){c[f>>2]=1;h=0;i=d;return h|0}b=hd(c[a+4>>2]|0,g)|0;ed(g);if((b|0)==0){c[f>>2]=2;h=0;i=d;return h|0}else{f=c[a+12>>2]|0;c[e>>2]=262;c[e+8>>2]=b;$c(f,e);yc(b);h=b;i=d;return h|0}return 0}function Ad(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;d=i;i=i+16|0;e=d;f=a+16|0;c[f>>2]=0;g=Rc(b)|0;if((g|0)==0){c[f>>2]=4;c[a+20>>2]=1032;h=0;i=d;return h|0}c[f>>2]=0;b=fe(c[a>>2]|0,g)|0;do{if((b|0)==0){c[f>>2]=1;j=0}else{k=hd(c[a+4>>2]|0,b)|0;ed(b);if((k|0)==0){c[f>>2]=2;j=0;break}else{l=c[a+12>>2]|0;c[e>>2]=262;c[e+8>>2]=k;$c(l,e);yc(k);j=k;break}}}while(0);gi(g);h=j;i=d;return h|0}function Bd(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;g=i;h=a+16|0;c[h>>2]=0;j=th(c[a+8>>2]|0,b,d,e,f)|0;if((j|0)==0){i=g;return j|0}c[h>>2]=3;i=g;return j|0}function Cd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;f=Ad(a,b)|0;do{if((f|0)==0){g=-1}else{b=a+16|0;c[b>>2]=0;h=th(c[a+8>>2]|0,f,d,0,0)|0;if((h|0)==0){g=0;break}c[b>>2]=3;g=h}}while(0);i=e;return g|0}function Dd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=i;uh(c[a+8>>2]|0,b,d);i=e;return}function Ed(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;i=i+16|0;e=d;f=a+16|0;c[f>>2]=0;g=ge(c[a>>2]|0,b)|0;if((g|0)==0){c[f>>2]=1;h=0;i=d;return h|0}b=hd(c[a+4>>2]|0,g)|0;ed(g);if((b|0)==0){c[f>>2]=2;h=0;i=d;return h|0}else{f=c[a+12>>2]|0;c[e>>2]=262;c[e+8>>2]=b;$c(f,e);yc(b);h=b;i=d;return h|0}return 0}function Fd(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;e=qh(c[a+8>>2]|0,b)|0;i=d;return e|0}function Gd(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;f=i;xh(c[a+8>>2]|0,b,d,e);i=f;return}function Hd(a){a=a|0;var b=0,d=0;b=i;d=rh(c[a+8>>2]|0)|0;i=b;return d|0}function Id(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;f=wc(1072)|0;c[f+12>>2]=0;c[f+16>>2]=1;c[f+20>>2]=0;c[f+24>>2]=d;c[f+8>>2]=a;c[f+28>>2]=f;c[f+32>>2]=0;c[f+36>>2]=Tc()|0;c[f+40>>2]=0;c[f+44>>2]=b;i=e;return f|0}function Jd(a){a=a|0;var b=0,d=0;b=i;d=wc(1072)|0;c[d+12>>2]=0;c[d+16>>2]=0;c[d+20>>2]=1;c[d+24>>2]=0;c[d+8>>2]=c[a+8>>2];c[d+28>>2]=c[a+28>>2];c[d+32>>2]=0;c[d+36>>2]=c[a+36>>2];c[d+40>>2]=Tc()|0;c[d+44>>2]=c[a+44>>2];i=b;return d|0}function Kd(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;g=wc(1072)|0;h=g+12|0;j=g+8|0;c[h+0>>2]=0;c[h+4>>2]=0;c[h+8>>2]=0;c[h+12>>2]=0;c[j>>2]=b;c[g+28>>2]=e;c[g+32>>2]=0;c[g+36>>2]=c[e+36>>2];c[g+40>>2]=0;c[g+44>>2]=d;c[a>>2]=262;c[a+8>>2]=g;i=f;return}function Ld(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;f=wc(1072)|0;c[f+12>>2]=1;c[f+16>>2]=0;c[f+20>>2]=0;c[f+24>>2]=0;c[f+8>>2]=b;b=f+28|0;g=f+44|0;c[b+0>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;c[g>>2]=d;c[a>>2]=262;c[a+8>>2]=f;i=e;return}function Md(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;e=c[a+12>>2]|0;do{if((e|0)==(c[b+12>>2]|0)){if((e|0)!=0){f=(c[a+44>>2]|0)==(c[b+44>>2]|0)|0;break}g=c[a+20>>2]|0;if((g|0)!=(c[b+20>>2]|0)){f=0;break}if((g|0)==0){f=(c[a+44>>2]|0)==(c[b+44>>2]|0)|0;break}else{f=(a|0)==(b|0)|0;break}}else{f=0}}while(0);i=d;return f|0}function Nd(a){a=a|0;var b=0,d=0;b=i;do{if((c[a+12>>2]|0)==0){if((c[a+20>>2]|0)==0){d=c[a+44>>2]|0;break}else{d=a;break}}else{d=c[a+44>>2]|0}}while(0);i=b;return d|0}function Od(a){a=a|0;var b=0;b=i;if((c[a+16>>2]|0)!=0){gi(c[a+44>>2]|0);yc(c[a+36>>2]|0)}if((c[a+20>>2]|0)==0){i=b;return}yc(c[a+40>>2]|0);i=b;return}function Pd(){var a=0,b=0,d=0;a=i;b=wc(1096)|0;d=b+8|0;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;i=a;return b|0}function Qd(a){a=a|0;i=i;return c[a+16>>2]|0}function Rd(a){a=a|0;var b=0,d=0,e=0;b=i;d=wc(1096)|0;e=d+8|0;c[e+0>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[a>>2]=261;c[a+8>>2]=d;i=b;return}function Sd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;f=c[a+8>>2]|0;if((f|0)==0){c[d+0>>2]=c[8>>2];c[d+4>>2]=c[12>>2];c[d+8>>2]=c[16>>2];c[d+12>>2]=c[20>>2];i=e;return}g=c[1120+(f<<2)>>2]|0;f=((Lc(b)|0)>>>0)%(g>>>0)|0;g=(c[a+20>>2]|0)+(f*40|0)|0;while(1){if((Gc(g,b)|0)!=0){h=6;break}f=c[g+32>>2]|0;if((f|0)==0){break}else{g=f}}do{if((h|0)==6){if((g|0)==0){break}b=g+16|0;c[d+0>>2]=c[b+0>>2];c[d+4>>2]=c[b+4>>2];c[d+8>>2]=c[b+8>>2];c[d+12>>2]=c[b+12>>2];i=e;return}}while(0);c[d+0>>2]=c[8>>2];c[d+4>>2]=c[12>>2];c[d+8>>2]=c[16>>2];c[d+12>>2]=c[20>>2];i=e;return}function Td(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;f=a+8|0;do{if((c[f>>2]|0)==0){if((c[d>>2]&255|0)==0){i=e;return}else{Ud(a,1);break}}}while(0);g=Lc(b)|0;h=a+20|0;j=(c[h>>2]|0)+(((g>>>0)%((c[1120+(c[f>>2]<<2)>>2]|0)>>>0)|0)*40|0)|0;while(1){if((Gc(j,b)|0)!=0){k=7;break}l=c[j+32>>2]|0;if((l|0)==0){break}else{j=l}}do{if((k|0)==7){if((j|0)==0){break}l=j+16|0;m=(c[d>>2]&255|0)==0;do{if((c[l>>2]&255|0)==0){if(m){i=e;return}if((c[d>>2]&255|0)==0){break}n=a+16|0;c[n>>2]=(c[n>>2]|0)+1}else{if(!m){break}n=a+16|0;c[n>>2]=(c[n>>2]|0)+ -1}}while(0);Ec(d);Fc(l);c[l+0>>2]=c[d+0>>2];c[l+4>>2]=c[d+4>>2];c[l+8>>2]=c[d+8>>2];c[l+12>>2]=c[d+12>>2];i=e;return}}while(0);if((c[d>>2]&255|0)==0){i=e;return}j=a+12|0;c[j>>2]=(c[j>>2]|0)+1;k=a+16|0;c[k>>2]=(c[k>>2]|0)+1;Ec(b);Ec(d);k=c[f>>2]|0;m=c[1120+(k<<2)>>2]|0;if(c[j>>2]<<3>>>0>(m*5|0)>>>0){Ud(a,0);a=c[f>>2]|0;o=c[1120+(a<<2)>>2]|0;p=a}else{o=m;p=k}k=(g>>>0)%(o>>>0)|0;g=c[h>>2]|0;h=g+(k*40|0)|0;m=c[h>>2]|0;if((m&255|0)==0){c[h+0>>2]=c[b+0>>2];c[h+4>>2]=c[b+4>>2];c[h+8>>2]=c[b+8>>2];c[h+12>>2]=c[b+12>>2];h=g+(k*40|0)+16|0;c[h+0>>2]=c[d+0>>2];c[h+4>>2]=c[d+4>>2];c[h+8>>2]=c[d+8>>2];c[h+12>>2]=c[d+12>>2];i=e;return}a:do{if((p|0)==0){q=0}else{h=o;a=m;f=k;while(1){j=h+ -1|0;if((a&255|0)==0){q=g+(f*40|0)|0;break a}n=f+1|0;r=n>>>0>=o>>>0?0:n;if((j|0)==0){q=0;break a}a=c[g+(r*40|0)>>2]|0;f=r;h=j}}}while(0);c[q+0>>2]=c[b+0>>2];c[q+4>>2]=c[b+4>>2];c[q+8>>2]=c[b+8>>2];c[q+12>>2]=c[b+12>>2];b=q+16|0;c[b+0>>2]=c[d+0>>2];c[b+4>>2]=c[d+4>>2];c[b+8>>2]=c[d+8>>2];c[b+12>>2]=c[d+12>>2];d=g+(k*40|0)+32|0;c[q+32>>2]=c[d>>2];c[d>>2]=q;i=e;return}function Ud(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;d=i;i=i+16|0;e=d;f=a+8|0;g=c[f>>2]|0;h=c[1120+(g<<2)>>2]|0;j=a+20|0;k=c[j>>2]|0;l=a+16|0;do{if(c[l>>2]<<3>>>0<=(h*5|0)>>>0&(b|0)==0){m=h;n=g}else{o=g+1|0;c[f>>2]=o;if(o>>>0>43){we(1296,e)}else{m=c[1120+(o<<2)>>2]|0;n=o;break}}}while(0);e=ve(m*40|0)|0;f=(n|0)==0;if(!f){n=0;do{b=e+(n*40|0)|0;c[b+0>>2]=c[8>>2];c[b+4>>2]=c[12>>2];c[b+8>>2]=c[16>>2];c[b+12>>2]=c[20>>2];b=e+(n*40|0)+16|0;c[b+0>>2]=c[8>>2];c[b+4>>2]=c[12>>2];c[b+8>>2]=c[16>>2];c[b+12>>2]=c[20>>2];c[e+(n*40|0)+32>>2]=0;n=n+1|0;}while(n>>>0<m>>>0)}if((g|0)==0){p=c[l>>2]|0;q=a+12|0;c[q>>2]=p;c[j>>2]=e;gi(k);i=d;return}if(f){f=0;do{g=k+(f*40|0)|0;do{if((c[g>>2]&255|0)!=0){n=k+(f*40|0)+16|0;if((c[n>>2]&255|0)==0){Fc(g);break}b=((Lc(g)|0)>>>0)%(m>>>0)|0;o=e+(b*40|0)|0;if((c[o>>2]&255|0)==0){c[o+0>>2]=c[g+0>>2];c[o+4>>2]=c[g+4>>2];c[o+8>>2]=c[g+8>>2];c[o+12>>2]=c[g+12>>2];o=e+(b*40|0)+16|0;c[o+0>>2]=c[n+0>>2];c[o+4>>2]=c[n+4>>2];c[o+8>>2]=c[n+8>>2];c[o+12>>2]=c[n+12>>2];break}else{c[0>>2]=c[g+0>>2];c[4>>2]=c[g+4>>2];c[8>>2]=c[g+8>>2];c[12>>2]=c[g+12>>2];c[16>>2]=c[n+0>>2];c[20>>2]=c[n+4>>2];c[24>>2]=c[n+8>>2];c[28>>2]=c[n+12>>2];n=e+(b*40|0)+32|0;c[8]=c[n>>2];c[n>>2]=0;break}}}while(0);f=f+1|0;}while(f>>>0<h>>>0);p=c[l>>2]|0;q=a+12|0;c[q>>2]=p;c[j>>2]=e;gi(k);i=d;return}else{r=0}do{f=k+(r*40|0)|0;do{if((c[f>>2]&255|0)!=0){g=k+(r*40|0)+16|0;if((c[g>>2]&255|0)==0){Fc(f);break}n=((Lc(f)|0)>>>0)%(m>>>0)|0;b=e+(n*40|0)|0;o=c[b>>2]|0;if((o&255|0)==0){c[b+0>>2]=c[f+0>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];b=e+(n*40|0)+16|0;c[b+0>>2]=c[g+0>>2];c[b+4>>2]=c[g+4>>2];c[b+8>>2]=c[g+8>>2];c[b+12>>2]=c[g+12>>2];break}else{s=m;t=o;u=n}while(1){o=s+ -1|0;if((t&255|0)==0){v=e+(u*40|0)|0;break}b=u+1|0;w=b>>>0>=m>>>0?0:b;if((o|0)==0){v=0;break}t=c[e+(w*40|0)>>2]|0;u=w;s=o}c[v+0>>2]=c[f+0>>2];c[v+4>>2]=c[f+4>>2];c[v+8>>2]=c[f+8>>2];c[v+12>>2]=c[f+12>>2];o=v+16|0;c[o+0>>2]=c[g+0>>2];c[o+4>>2]=c[g+4>>2];c[o+8>>2]=c[g+8>>2];c[o+12>>2]=c[g+12>>2];o=e+(n*40|0)+32|0;c[v+32>>2]=c[o>>2];c[o>>2]=v}}while(0);r=r+1|0;}while(r>>>0<h>>>0);p=c[l>>2]|0;q=a+12|0;c[q>>2]=p;c[j>>2]=e;gi(k);i=d;return}function Vd(a,b){a=a|0;b=b|0;var c=0;c=i;Td(a,b,8);i=c;return}function Wd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;i=i+16|0;f=e;hh(f,b);b=c[a+8>>2]|0;if((b|0)==0){c[d+0>>2]=c[8>>2];c[d+4>>2]=c[12>>2];c[d+8>>2]=c[16>>2];c[d+12>>2]=c[20>>2];Fc(f);i=e;return}g=c[1120+(b<<2)>>2]|0;b=((Lc(f)|0)>>>0)%(g>>>0)|0;g=(c[a+20>>2]|0)+(b*40|0)|0;while(1){if((Gc(g,f)|0)!=0){h=6;break}b=c[g+32>>2]|0;if((b|0)==0){break}else{g=b}}do{if((h|0)==6){if((g|0)==0){break}b=g+16|0;c[d+0>>2]=c[b+0>>2];c[d+4>>2]=c[b+4>>2];c[d+8>>2]=c[b+8>>2];c[d+12>>2]=c[b+12>>2];Fc(f);i=e;return}}while(0);c[d+0>>2]=c[8>>2];c[d+4>>2]=c[12>>2];c[d+8>>2]=c[16>>2];c[d+12>>2]=c[20>>2];Fc(f);i=e;return}function Xd(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0;d=i;i=i+16|0;e=d;gh(e,b);Td(a,e,c);Fc(e);i=d;return}function Yd(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;g=c[1120+(c[a+8>>2]<<2)>>2]|0;if(!(g>>>0>b>>>0)){h=0;i=f;return h|0}j=c[a+20>>2]|0;a=b;while(1){k=j+(a*40|0)+16|0;l=a+1|0;if((c[k>>2]&255|0)!=0){break}if(l>>>0<g>>>0){a=l}else{h=0;m=6;break}}if((m|0)==6){i=f;return h|0}m=j+(a*40|0)|0;c[d+0>>2]=c[m+0>>2];c[d+4>>2]=c[m+4>>2];c[d+8>>2]=c[m+8>>2];c[d+12>>2]=c[m+12>>2];c[e+0>>2]=c[k+0>>2];c[e+4>>2]=c[k+4>>2];c[e+8>>2]=c[k+8>>2];c[e+12>>2]=c[k+12>>2];h=l;i=f;return h|0}function Zd(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0;b=i;d=c[a+8>>2]|0;e=c[1120+(d<<2)>>2]|0;f=a+20|0;a=c[f>>2]|0;if((d|0)==0){g=a;gi(g);i=b;return}else{h=a;j=0}while(1){Fc(h+(j*40|0)|0);Fc((c[f>>2]|0)+(j*40|0)+16|0);a=j+1|0;d=c[f>>2]|0;if(a>>>0<e>>>0){j=a;h=d}else{g=d;break}}gi(g);i=b;return}function _d(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0.0;d=i;i=i+144|0;e=d+96|0;f=d+64|0;g=d+48|0;h=d+120|0;j=d+16|0;k=d+128|0;l=d+80|0;m=d+132|0;n=d;o=d+124|0;p=d+32|0;q=d+116|0;r=d+112|0;s=b+40|0;t=a[c[b>>2]|0]|0;a:while(1){u=(Cb(t<<24>>24|0)|0)==0;v=c[b>>2]|0;w=a[v]|0;do{if(u){if(w<<24>>24==35){x=35;break}else if(!(w<<24>>24==47)){y=45;break a}z=a[v+1|0]|0;if(z<<24>>24==47|z<<24>>24==42){x=47}else{y=45;break a}}else{x=w}}while(0);if((Cb(x<<24>>24|0)|0)!=0){do{w=c[b>>2]|0;u=a[w]|0;if(u<<24>>24==10){z=w+1|0;if((a[z]|0)==13){c[b>>2]=z;A=z}else{A=w}c[s>>2]=(c[s>>2]|0)+1;B=A}else if(u<<24>>24==13){u=w+1|0;if((a[u]|0)==10){c[b>>2]=u;C=u}else{C=w}c[s>>2]=(c[s>>2]|0)+1;B=C}else{B=w}w=B+1|0;c[b>>2]=w;}while((Cb(a[w]|0)|0)!=0)}b:while(1){w=c[b>>2]|0;u=a[w]|0;do{if(u<<24>>24==47){z=a[w+1|0]|0;if(z<<24>>24==47){D=w;E=47;break}else if(!(z<<24>>24==42)){t=47;continue a}z=w+2|0;c[b>>2]=z;F=a[z]|0;if(F<<24>>24==0){y=18;break a}G=a[w+3|0]|0;if(F<<24>>24==42&G<<24>>24==47){H=z}else{z=G;G=F;while(1){if(z<<24>>24==0){y=20;break a}F=(Cb(G<<24>>24|0)|0)==0;I=c[b>>2]|0;do{if(F){c[b>>2]=I+1}else{if((Cb(a[I]|0)|0)==0){break}do{J=c[b>>2]|0;K=a[J]|0;if(K<<24>>24==10){L=J+1|0;if((a[L]|0)==13){c[b>>2]=L;M=L}else{M=J}c[s>>2]=(c[s>>2]|0)+1;N=M}else if(K<<24>>24==13){K=J+1|0;if((a[K]|0)==10){c[b>>2]=K;O=K}else{O=J}c[s>>2]=(c[s>>2]|0)+1;N=O}else{N=J}J=N+1|0;c[b>>2]=J;}while((Cb(a[J]|0)|0)!=0)}}while(0);I=c[b>>2]|0;F=a[I]|0;J=a[I+1|0]|0;if(F<<24>>24==42&J<<24>>24==47){H=I;break}else{z=J;G=F}}}c[b>>2]=H+2;continue b}else if(u<<24>>24==35){D=w;E=35}else{t=u;continue a}}while(0);while(1){if(E<<24>>24==0){continue b}else if(E<<24>>24==13|E<<24>>24==10){break}u=D+1|0;c[b>>2]=u;D=u;E=a[u]|0}if((Cb(E<<24>>24|0)|0)==0){continue}while(1){u=c[b>>2]|0;w=a[u]|0;if(w<<24>>24==13){G=u+1|0;if((a[G]|0)==10){c[b>>2]=G;P=G}else{P=u}c[s>>2]=(c[s>>2]|0)+1;Q=P}else if(w<<24>>24==10){w=u+1|0;if((a[w]|0)==13){c[b>>2]=w;R=w}else{R=u}c[s>>2]=(c[s>>2]|0)+1;Q=R}else{Q=u}u=Q+1|0;c[b>>2]=u;if((Cb(a[u]|0)|0)==0){continue b}}}}if((y|0)==18){ee(b,3224,0);S=0;i=d;return S|0}else if((y|0)==20){ee(b,3224,0);S=0;i=d;return S|0}else if((y|0)==45){Q=b+16|0;c[Q+0>>2]=c[8>>2];c[Q+4>>2]=c[12>>2];c[Q+8>>2]=c[16>>2];c[Q+12>>2]=c[20>>2];c[b+24>>2]=0;R=a[v]|0;s=R<<24>>24;do{if(!((s+ -48|0)>>>0<10)){if(R<<24>>24==46){if(((a[v+1|0]|0)+ -48|0)>>>0<10){break}}if(R<<24>>24==95|(Ua(s|0)|0)!=0){P=c[b>>2]|0;while(1){E=a[P]|0;if(E<<24>>24==95|(oa(E<<24>>24|0)|0)!=0){P=P+1|0}else{break}}E=c[b>>2]|0;D=P-E|0;t=0;while(1){if((D|0)==(c[2540+(t*12|0)>>2]|0)){if((vi(E,c[2536+(t*12|0)>>2]|0,D)|0)==0){y=86;break}}H=t+1|0;if(H>>>0<22){t=H}else{break}}if((y|0)==86){c[b>>2]=P;c[b+8>>2]=c[2544+(t*12|0)>>2];S=1;i=d;return S|0}H=ve(D+1|0)|0;N=E+D|0;O=a[E]|0;if(O<<24>>24!=0&(D|0)>0){M=O;O=H;B=E;while(1){C=B+1|0;A=O+1|0;a[O]=M;x=a[C]|0;if(x<<24>>24!=0&C>>>0<N>>>0){B=C;O=A;M=x}else{T=A;break}}}else{T=H}a[T]=0;c[b+8>>2]=0;ih(g,H,D,1);c[Q+0>>2]=c[g+0>>2];c[Q+4>>2]=c[g+4>>2];c[Q+8>>2]=c[g+8>>2];c[Q+12>>2]=c[g+12>>2];c[b>>2]=P;S=1;i=d;return S|0}M=c[b>>2]|0;O=a[M]|0;B=O<<24>>24;switch(B|0){case 125:case 123:case 93:case 91:case 41:case 40:case 35:case 126:case 94:case 124:case 38:case 62:case 60:case 59:case 44:case 46:case 58:case 63:case 33:case 61:case 37:case 47:case 42:case 45:case 43:{N=0;while(1){U=c[1620+(N*12|0)>>2]|0;E=N+1|0;if((vi(M,c[1616+(N*12|0)>>2]|0,U)|0)==0){break}if(E>>>0<46){N=E}else{S=0;y=121;break}}if((y|0)==121){i=d;return S|0}c[b+8>>2]=c[1624+(N*12|0)>>2];c[b>>2]=M+U;S=1;i=d;return S|0};default:{}}if(O<<24>>24==39){P=M+1|0;c[b>>2]=P;D=a[P]|0;if(D<<24>>24==39){ee(b,1488,0);S=0;i=d;return S|0}else{V=D;W=P;X=0;Y=0}while(1){if(V<<24>>24==0){y=99;break}else if(V<<24>>24==39){y=105;break}P=X<<8;if(V<<24>>24==92){D=be(b)|0;if((D|0)<0){S=0;y=121;break}Z=D;_=c[b>>2]|0}else{D=W+1|0;c[b>>2]=D;Z=a[W]|0;_=D}V=a[_]|0;W=_;X=Z+P|0;Y=Y+1|0}if((y|0)==99){ee(b,1512,0);S=0;i=d;return S|0}else if((y|0)==105){c[b>>2]=W+1;if((Y|0)>8){ee(b,1576,0);S=0;i=d;return S|0}else{c[b+8>>2]=1;Ac(f,X);c[Q+0>>2]=c[f+0>>2];c[Q+4>>2]=c[f+4>>2];c[Q+8>>2]=c[f+8>>2];c[Q+12>>2]=c[f+12>>2];S=1;i=d;return S|0}}else if((y|0)==121){i=d;return S|0}}else if(O<<24>>24==34){M=ve(16)|0;c[b>>2]=(c[b>>2]|0)+1;N=M;M=0;P=16;c:while(1){$=M;while(1){D=c[b>>2]|0;H=a[D]|0;if(H<<24>>24==0){y=111;break c}else if(H<<24>>24==92){E=be(b)|0;if((E|0)<0){y=113;break c}a[N+$|0]=E}else if(H<<24>>24==34){y=118;break c}else{c[b>>2]=D+1;a[N+$|0]=a[D]|0}aa=$+1|0;if(aa>>>0<P>>>0){$=aa}else{break}}D=P<<1;N=xe(N,D)|0;M=aa;P=D}if((y|0)==111){gi(N);ee(b,1368,0);S=0;i=d;return S|0}else if((y|0)==113){gi(N);S=0;i=d;return S|0}else if((y|0)==118){a[N+$|0]=0;c[b>>2]=(c[b>>2]|0)+1;c[b+8>>2]=3;ih(e,N,$,1);c[Q+0>>2]=c[e+0>>2];c[Q+4>>2]=c[e+4>>2];c[Q+8>>2]=c[e+8>>2];c[Q+12>>2]=c[e+12>>2];S=1;i=d;return S|0}}else if(O<<24>>24==0){c[b+32>>2]=1;c[b+8>>2]=-1;S=0;i=d;return S|0}else{c[q>>2]=B;c[r>>2]=q;ee(b,1336,r);S=0;i=d;return S|0}}}while(0);do{if(R<<24>>24==48){r=v+1|0;q=a[r]|0;if(q<<24>>24==88|q<<24>>24==120){e=v+2|0;while(1){if((Vb(a[e]|0)|0)==0){break}else{e=e+1|0}}B=Sa(c[b>>2]|0,h|0,0)|0;if((c[h>>2]|0)==(e|0)){c[b>>2]=e;c[b+8>>2]=1;Ac(j,B);c[Q+0>>2]=c[j+0>>2];c[Q+4>>2]=c[j+4>>2];c[Q+8>>2]=c[j+8>>2];c[Q+12>>2]=c[j+12>>2];S=1;i=d;return S|0}else{ee(b,2992,0);S=0;i=d;return S|0}}else if(q<<24>>24==46){ba=48;break}if((q+ -48<<24>>24&255)<8){B=v+2|0;while(1){if(((a[B]|0)+ -48<<24>>24&255)<8){B=B+1|0}else{ca=B;break}}}else{ca=r}B=Sa(v|0,k|0,0)|0;if((c[k>>2]|0)==(ca|0)){c[b>>2]=ca;c[b+8>>2]=1;Ac(l,B);c[Q+0>>2]=c[l+0>>2];c[Q+4>>2]=c[l+4>>2];c[Q+8>>2]=c[l+8>>2];c[Q+12>>2]=c[l+12>>2];S=1;i=d;return S|0}else{ee(b,3040,0);S=0;i=d;return S|0}}else{ba=R}}while(0);if(((ba<<24>>24)+ -48|0)>>>0<10){R=v;while(1){l=R+1|0;ca=a[l]|0;if(((ca<<24>>24)+ -48|0)>>>0<10){R=l}else{da=ca;ea=l;break}}}else{da=ba;ea=v}if(da<<24>>24==46){fa=0}else if(da<<24>>24==69|da<<24>>24==101){fa=1}else{da=Sa(v|0,o|0,0)|0;if((c[o>>2]|0)==(ea|0)){c[b>>2]=ea;c[b+8>>2]=1;Ac(p,da);c[Q+0>>2]=c[p+0>>2];c[Q+4>>2]=c[p+4>>2];c[Q+8>>2]=c[p+8>>2];c[Q+12>>2]=c[p+12>>2];S=1;i=d;return S|0}else{ee(b,3184,0);S=0;i=d;return S|0}}p=ea;while(1){ga=p+1|0;ha=a[ga]|0;if(((ha<<24>>24)+ -48|0)>>>0<10){p=ga}else{break}}d:do{if((fa|0)==0){if(!(ha<<24>>24==69|ha<<24>>24==101)){ia=ga;break}ea=p+2|0;da=a[ea]|0;if(da<<24>>24==45|da<<24>>24==43){o=p+3|0;ja=a[o]|0;ka=o}else{ja=da;ka=ea}if(((ja<<24>>24)+ -48|0)>>>0<10){ea=ka;while(1){da=ea+1|0;if(((a[da]|0)+ -48|0)>>>0<10){ea=da}else{ia=da;break d}}}ee(b,3080,0);S=0;i=d;return S|0}else{ia=ga}}while(0);la=+ti(v,m);if((c[m>>2]|0)==(ia|0)){c[b>>2]=ia;c[b+8>>2]=2;Bc(n,la);c[Q+0>>2]=c[n+0>>2];c[Q+4>>2]=c[n+4>>2];c[Q+8>>2]=c[n+8>>2];c[Q+12>>2]=c[n+12>>2];S=1;i=d;return S|0}else{ee(b,3136,0);S=0;i=d;return S|0}}return 0}function $d(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;if((c[a+8>>2]|0)!=(b|0)){e=0;i=d;return e|0}_d(a)|0;e=(c[a+36>>2]|0)==0|0;i=d;return e|0}function ae(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0;e=i;a:do{if((d|0)==0){f=-1}else{g=a+8|0;h=a+36|0;j=0;while(1){if((c[g>>2]|0)==(c[b+(j<<2)>>2]|0)){_d(a)|0;if((c[h>>2]|0)==0){f=j;break a}}k=j+1|0;if(k>>>0<d>>>0){j=k}else{f=-1;break}}}}while(0);i=e;return f|0}function be(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;d=i;i=i+32|0;e=d+20|0;f=d+16|0;g=d+8|0;h=d+4|0;j=d;k=c[b>>2]|0;l=k+1|0;c[b>>2]=l;m=a[l]|0;a:do{switch(m|0){case 110:{c[b>>2]=k+2;n=10;break};case 114:{c[b>>2]=k+2;n=13;break};case 116:{c[b>>2]=k+2;n=9;break};case 39:{c[b>>2]=k+2;n=39;break};case 97:{c[b>>2]=k+2;n=7;break};case 34:{c[b>>2]=k+2;n=34;break};case 102:{c[b>>2]=k+2;n=12;break};case 48:{c[b>>2]=k+2;n=0;break};case 92:{c[b>>2]=k+2;n=92;break};case 120:{l=k+2|0;c[b>>2]=l;do{if((Vb(a[l]|0)|0)!=0){if((Vb(a[(c[b>>2]|0)+1|0]|0)|0)==0){break}o=c[b>>2]|0;p=o+1|0;c[b>>2]=p;q=a[o]|0;switch(q|0){case 66:case 98:{r=176;break};case 68:case 100:{r=208;break};case 70:case 102:{r=240;break};case 69:case 101:{r=224;break};case 65:case 97:{r=160;break};case 57:case 56:case 55:case 54:case 53:case 52:case 51:case 50:case 49:case 48:{r=(q<<4)+ -768|0;break};case 67:case 99:{r=192;break};default:{r=-16}}c[b>>2]=o+2;o=a[p]|0;switch(o|0){case 69:case 101:{s=14;break};case 68:case 100:{s=13;break};case 57:case 56:case 55:case 54:case 53:case 52:case 51:case 50:case 49:case 48:{s=o+ -48|0;break};case 66:case 98:{s=11;break};case 67:case 99:{s=12;break};case 65:case 97:{s=10;break};case 70:case 102:{s=15;break};default:{s=-1}}n=s|r;break a}}while(0);l=c[b>>2]|0;c[e>>2]=a[l]|0;c[f>>2]=a[l+1|0]|0;c[g>>2]=e;c[g+4>>2]=f;ee(b,1416,g);n=-1;break};case 98:{c[b>>2]=k+2;n=8;break};case 47:{c[b>>2]=k+2;n=47;break};default:{c[h>>2]=m;c[j>>2]=h;ee(b,1456,j);n=-1}}}while(0);i=d;return n|0}function ce(){var a=0,b=0;a=i;b=ve(48)|0;c[b>>2]=0;c[b+32>>2]=0;c[b+36>>2]=0;c[b+40>>2]=1;c[b+44>>2]=0;i=a;return b|0}function de(a){a=a|0;var b=0;b=i;gi(c[a+44>>2]|0);gi(a);i=b;return}function ee(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0;e=i;i=i+16|0;f=e+8|0;g=e+4|0;h=e;c[h>>2]=a+40;j=a+36|0;if((c[j>>2]|0)!=0){i=e;return}k=dh(3248,f,h)|0;h=dh(b,g,d)|0;d=a+44|0;gi(c[d>>2]|0);a=ve((c[f>>2]|0)+1+(c[g>>2]|0)|0)|0;c[d>>2]=a;Ii(a|0,k|0)|0;Ii((c[d>>2]|0)+(c[f>>2]|0)|0,h|0)|0;gi(k);gi(h);c[j>>2]=1;i=e;return}function fe(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;d=i;c[a>>2]=b;b=a+32|0;c[b>>2]=0;e=a+36|0;c[e>>2]=0;f=a+40|0;c[f>>2]=1;if((_d(a)|0)==0){if((c[e>>2]|0)!=0){g=0;i=d;return g|0}g=dd(0,c[f>>2]|0)|0;i=d;return g|0}e=re(a,1)|0;a:do{if((e|0)==0){h=0}else{b:do{if((c[b>>2]|0)==0){j=e;while(1){k=re(a,1)|0;if((k|0)==0){break}l=dd(68,c[f>>2]|0)|0;c[l+32>>2]=j;c[l+36>>2]=k;if((c[b>>2]|0)==0){j=l}else{m=l;break b}}ed(j);h=0;break a}else{m=e}}while(0);if((c[m>>2]|0)==68){c[m>>2]=0;h=m;break}else{l=dd(0,c[f>>2]|0)|0;c[l+32>>2]=m;h=l;break}}}while(0);if((c[b>>2]|0)!=0){g=h;i=d;return g|0}ed(h);ee(a,3280,0);g=0;i=d;return g|0}function ge(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;c[a>>2]=b;b=a+32|0;c[b>>2]=0;c[a+36>>2]=0;c[a+40>>2]=1;_d(a)|0;e=he(a)|0;if((e|0)==0){f=0;i=d;return f|0}if((c[b>>2]|0)==0){ed(e);Fc(a+16|0);ee(a,3280,0);f=0;i=d;return f|0}else{a=dd(8,1)|0;c[a+32>>2]=e;e=dd(0,1)|0;c[e+32>>2]=a;f=e;i=d;return f|0}return 0}function he(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;d=je(a)|0;if((d|0)==0){e=0;i=b;return e|0}f=ae(a,3400,1)|0;do{if((f|0)>-1){g=a+40|0;h=f;j=d;while(1){k=je(a)|0;if((k|0)==0){l=5;break}m=dd(c[3408+(h<<2)>>2]|0,c[g>>2]|0)|0;c[m+32>>2]=j;c[m+36>>2]=k;k=ae(a,3400,1)|0;if((k|0)>-1){h=k;j=m}else{l=7;break}}if((l|0)==5){ed(j);e=0;i=b;return e|0}else if((l|0)==7){if((m|0)==0){e=0}else{n=m;break}i=b;return e|0}}else{n=d}}while(0);d=ae(a,3304,12)|0;if((d|0)<0){e=n;i=b;return e|0}m=he(a)|0;if((m|0)==0){ed(n);e=0;i=b;return e|0}else{l=dd(c[3352+(d<<2)>>2]|0,c[a+40>>2]|0)|0;c[l+32>>2]=n;c[l+36>>2]=m;e=l;i=b;return e|0}return 0}function ie(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;h=ac[f&15](a)|0;if((h|0)==0){j=0;i=g;return j|0}k=ae(a,b,e)|0;if(!((k|0)>-1)){j=h;i=g;return j|0}l=a+40|0;m=k;k=h;while(1){h=ac[f&15](a)|0;if((h|0)==0){break}n=dd(c[d+(m<<2)>>2]|0,c[l>>2]|0)|0;c[n+32>>2]=k;c[n+36>>2]=h;h=ae(a,b,e)|0;if((h|0)>-1){m=h;k=n}else{j=n;o=7;break}}if((o|0)==7){i=g;return j|0}ed(k);j=0;i=g;return j|0}function je(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;b=i;d=ie(a,3488,3512,6,5)|0;if((d|0)==0){e=0;i=b;return e|0}f=ae(a,3472,1)|0;do{if((f|0)>-1){g=a+40|0;h=f;j=d;while(1){k=ie(a,3488,3512,6,5)|0;if((k|0)==0){l=5;break}m=dd(c[3480+(h<<2)>>2]|0,c[g>>2]|0)|0;c[m+32>>2]=j;c[m+36>>2]=k;k=ae(a,3472,1)|0;if((k|0)>-1){h=k;j=m}else{l=7;break}}if((l|0)==5){ed(j);e=0;i=b;return e|0}else if((l|0)==7){if((m|0)==0){e=0}else{n=m;break}i=b;return e|0}}else{n=d}}while(0);d=ae(a,3456,1)|0;a:do{if((d|0)>-1){m=a+40|0;f=d;h=n;b:while(1){g=ie(a,3488,3512,6,5)|0;if((g|0)==0){break}k=ae(a,3472,1)|0;if((k|0)>-1){o=k;p=g;while(1){k=ie(a,3488,3512,6,5)|0;if((k|0)==0){l=13;break b}q=dd(c[3480+(o<<2)>>2]|0,c[m>>2]|0)|0;c[q+32>>2]=p;c[q+36>>2]=k;k=ae(a,3472,1)|0;if((k|0)>-1){o=k;p=q}else{break}}if((q|0)==0){break}else{r=q}}else{r=g}o=dd(c[3464+(f<<2)>>2]|0,c[m>>2]|0)|0;c[o+32>>2]=h;c[o+36>>2]=r;k=ae(a,3456,1)|0;if((k|0)>-1){f=k;h=o}else{s=o;break a}}if((l|0)==13){ed(p)}ed(h);e=0;i=b;return e|0}else{s=n}}while(0);if((s|0)==0){e=0;i=b;return e|0}if(($d(a,39)|0)==0){e=s;i=b;return e|0}n=he(a)|0;if((n|0)==0){ed(s);e=0;i=b;return e|0}if(($d(a,40)|0)==0){ee(a,3416,0);Fc(a+16|0);ed(s);ed(n);e=0;i=b;return e|0}p=je(a)|0;if((p|0)==0){ed(s);ed(n);e=0;i=b;return e|0}else{l=a+40|0;a=dd(66,c[l>>2]|0)|0;c[a+32>>2]=n;c[a+36>>2]=p;p=dd(25,c[l>>2]|0)|0;c[p+32>>2]=s;c[p+36>>2]=a;e=p;i=b;return e|0}return 0}function ke(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0;b=i;d=ie(a,3552,3560,1,6)|0;if((d|0)==0){e=0;i=b;return e|0}f=ae(a,3536,1)|0;if(!((f|0)>-1)){e=d;i=b;return e|0}g=a+40|0;h=f;f=d;while(1){d=ie(a,3552,3560,1,6)|0;if((d|0)==0){break}j=dd(c[3544+(h<<2)>>2]|0,c[g>>2]|0)|0;c[j+32>>2]=f;c[j+36>>2]=d;d=ae(a,3536,1)|0;if((d|0)>-1){h=d;f=j}else{e=j;k=7;break}}if((k|0)==7){i=b;return e|0}ed(f);e=0;i=b;return e|0}function le(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0;b=i;d=ie(a,3584,3592,2,7)|0;if((d|0)==0){e=0;i=b;return e|0}f=ae(a,3568,1)|0;if(!((f|0)>-1)){e=d;i=b;return e|0}g=a+40|0;h=f;f=d;while(1){d=ie(a,3584,3592,2,7)|0;if((d|0)==0){break}j=dd(c[3576+(h<<2)>>2]|0,c[g>>2]|0)|0;c[j+32>>2]=f;c[j+36>>2]=d;d=ae(a,3568,1)|0;if((d|0)>-1){h=d;f=j}else{e=j;k=7;break}}if((k|0)==7){i=b;return e|0}ed(f);e=0;i=b;return e|0}function me(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0;b=i;d=ie(a,3616,3632,3,8)|0;if((d|0)==0){e=0;i=b;return e|0}f=ae(a,3600,2)|0;if(!((f|0)>-1)){e=d;i=b;return e|0}g=a+40|0;h=f;f=d;while(1){d=ie(a,3616,3632,3,8)|0;if((d|0)==0){break}j=dd(c[3608+(h<<2)>>2]|0,c[g>>2]|0)|0;c[j+32>>2]=f;c[j+36>>2]=d;d=ae(a,3600,2)|0;if((d|0)>-1){h=d;f=j}else{e=j;k=7;break}}if((k|0)==7){i=b;return e|0}ed(f);e=0;i=b;return e|0}function ne(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;b=i;d=ae(a,3648,7)|0;if((d|0)>=0){e=ne(a)|0;if((e|0)==0){f=0;i=b;return f|0}g=dd(c[3680+(d<<2)>>2]|0,c[a+40>>2]|0)|0;c[g+32>>2]=e;f=g;i=b;return f|0}g=oe(a)|0;if((g|0)==0){f=0;i=b;return f|0}e=ae(a,3712,5)|0;if(!((e|0)>-1)){f=g;i=b;return f|0}d=a+40|0;h=a+8|0;j=e;e=g;a:while(1){k=dd(c[3736+(j<<2)>>2]|0,c[d>>2]|0)|0;switch(c[3712+(j<<2)>>2]|0){case 43:{if((c[h>>2]|0)!=0){l=13;break a}g=oe(a)|0;if((g|0)==0){l=15;break a}c[k+32>>2]=e;c[k+36>>2]=g;break};case 22:{g=he(a)|0;if((g|0)==0){l=8;break a}c[k+32>>2]=e;c[k+36>>2]=g;if(($d(a,23)|0)==0){l=11;break a}break};case 46:case 45:{c[k+32>>2]=e;break};case 20:{c[k+32>>2]=e;if((c[h>>2]|0)!=21){g=he(a)|0;if((g|0)==0){break a}m=dd(65,c[d>>2]|0)|0;c[m+36>>2]=g;if(($d(a,42)|0)==0){n=m}else{o=m;while(1){m=he(a)|0;if((m|0)==0){l=21;break a}g=dd(65,c[d>>2]|0)|0;c[g+32>>2]=o;c[g+36>>2]=m;if(($d(a,42)|0)==0){n=g;break}else{o=g}}}if((n|0)==0){break a}c[k+36>>2]=n}if(($d(a,21)|0)==0){l=27;break a}break};default:{}}g=ae(a,3712,5)|0;if((g|0)>-1){j=g;e=k}else{f=k;l=30;break}}if((l|0)==8){ed(e);ed(k);f=0;i=b;return f|0}else if((l|0)==11){ee(a,3760,0);Fc(a+16|0);ed(k);f=0;i=b;return f|0}else if((l|0)==13){ee(a,3816,0);ed(e);ed(k);f=0;i=b;return f|0}else if((l|0)==15){ed(e);ed(k);f=0;i=b;return f|0}else if((l|0)==21){ed(o)}else if((l|0)==27){ee(a,3856,0);Fc(a+16|0);ed(k);f=0;i=b;return f|0}else if((l|0)==30){i=b;return f|0}ed(k);f=0;i=b;return f|0}function oe(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;b=i;i=i+32|0;d=b;e=b+20|0;f=b+16|0;g=a+8|0;h=c[g>>2]|0;switch(h|0){case 24:{j=a+40|0;k=dd(62,c[j>>2]|0)|0;_d(a)|0;if(($d(a,25)|0)!=0){l=k;i=b;return l|0}m=k+32|0;n=k;while(1){o=he(a)|0;if((o|0)==0){p=22;break}if(($d(a,40)|0)==0){p=24;break}q=he(a)|0;if((q|0)==0){p=26;break}r=dd(63,c[j>>2]|0)|0;c[r+32>>2]=o;c[r+36>>2]=q;do{if((n|0)==(k|0)){if((c[m>>2]|0)!=0){p=30;break}c[m>>2]=r;s=k}else{p=30}}while(0);if((p|0)==30){p=0;q=dd(62,c[j>>2]|0)|0;c[q+32>>2]=r;c[n+36>>2]=q;s=q}q=($d(a,42)|0)==0;t=(c[g>>2]|0)==25;if(q){if(!t){p=36;break}}else{if(t){p=34;break}}if(($d(a,25)|0)==0){n=s}else{l=k;p=49;break}}if((p|0)==22){ed(k);l=0;i=b;return l|0}else if((p|0)==24){ed(o);ed(k);Fc(a+16|0);ee(a,5200,0);l=0;i=b;return l|0}else if((p|0)==26){ed(o);ed(k);l=0;i=b;return l|0}else if((p|0)==34){ed(k);ee(a,5248,0);l=0;i=b;return l|0}else if((p|0)==36){Fc(a+16|0);ed(k);ee(a,5296,0);l=0;i=b;return l|0}else if((p|0)==49){i=b;return l|0}break};case 11:{l=pe(a,0)|0;i=b;return l|0};case 0:{k=dd(56,c[a+40>>2]|0)|0;c[k+24>>2]=c[a+24>>2];_d(a)|0;if((c[a+36>>2]|0)==0){l=k;i=b;return l|0}ed(k);l=0;i=b;return l|0};case 14:case 13:{_d(a)|0;if((c[a+36>>2]|0)!=0){l=0;i=b;return l|0}k=dd(57,c[a+40>>2]|0)|0;o=k+8|0;zc(d,(h|0)==13|0);c[o+0>>2]=c[d+0>>2];c[o+4>>2]=c[d+4>>2];c[o+8>>2]=c[d+8>>2];c[o+12>>2]=c[d+12>>2];l=k;i=b;return l|0};case 15:{_d(a)|0;if((c[a+36>>2]|0)!=0){l=0;i=b;return l|0}k=dd(57,c[a+40>>2]|0)|0;d=k+8|0;c[d+0>>2]=c[8>>2];c[d+4>>2]=c[12>>2];c[d+8>>2]=c[16>>2];c[d+12>>2]=c[20>>2];l=k;i=b;return l|0};case 3:case 2:case 1:{k=dd(57,c[a+40>>2]|0)|0;d=k+8|0;o=a+16|0;c[d+0>>2]=c[o+0>>2];c[d+4>>2]=c[o+4>>2];c[d+8>>2]=c[o+8>>2];c[d+12>>2]=c[o+12>>2];_d(a)|0;if((c[a+36>>2]|0)==0){l=k;i=b;return l|0}ed(k);l=0;i=b;return l|0};case 19:{_d(a)|0;if((c[a+36>>2]|0)!=0){l=0;i=b;return l|0}l=dd(59,c[a+40>>2]|0)|0;i=b;return l|0};case 20:{_d(a)|0;k=he(a)|0;if((k|0)==0){l=0;i=b;return l|0}if(($d(a,21)|0)!=0){l=k;i=b;return l|0}ee(a,3904,0);Fc(a+16|0);ed(k);l=0;i=b;return l|0};case 22:{k=a+40|0;o=dd(60,c[k>>2]|0)|0;_d(a)|0;if(($d(a,23)|0)!=0){l=o;i=b;return l|0}d=o+32|0;s=o;while(1){n=he(a)|0;if((n|0)==0){p=8;break}do{if((s|0)==(o|0)){if((c[d>>2]|0)!=0){p=12;break}c[d>>2]=n;u=o}else{p=12}}while(0);if((p|0)==12){p=0;r=dd(60,c[k>>2]|0)|0;c[r+32>>2]=n;c[s+36>>2]=r;u=r}r=($d(a,42)|0)==0;j=(c[g>>2]|0)==23;if(r){if(!j){p=18;break}}else{if(j){p=16;break}}if(($d(a,23)|0)==0){s=u}else{l=o;p=49;break}}if((p|0)==8){ed(o);l=0;i=b;return l|0}else if((p|0)==16){ee(a,5352,0);ed(o);l=0;i=b;return l|0}else if((p|0)==18){Fc(a+16|0);ee(a,5400,0);ed(o);l=0;i=b;return l|0}else if((p|0)==49){i=b;return l|0}break};default:{c[e>>2]=h;c[f>>2]=e;ee(a,3952,f);Fc(a+16|0);l=0;i=b;return l|0}}return 0}function pe(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;d=i;if(($d(a,11)|0)==0){ee(a,3976,0);Fc(a+16|0);e=0;i=d;return e|0}f=(b|0)!=0;b=(c[a+8>>2]|0)==0;do{if(f){if(b){g=c[a+24>>2]|0;_d(a)|0;h=g;break}ee(a,4016,0);Fc(a+16|0);e=0;i=d;return e|0}else{if(!b){h=0;break}g=c[a+24>>2]|0;_d(a)|0;h=g}}while(0);if(($d(a,20)|0)==0){ee(a,4064,0);Fc(a+16|0);if((h|0)==0){e=0;i=d;return e|0}yc(h);e=0;i=d;return e|0}b=a+40|0;g=dd(58,c[b>>2]|0)|0;c[g+24>>2]=h;a:do{if(($d(a,21)|0)==0){j=a+16|0;k=a+24|0;l=c[k>>2]|0;b:do{if(($d(a,0)|0)==0){ee(a,5152,0);Fc(j)}else{m=dd(64,c[b>>2]|0)|0;c[m+24>>2]=l;c:do{if(($d(a,42)|0)!=0){n=m;while(1){o=c[k>>2]|0;if(($d(a,0)|0)==0){break}p=dd(64,c[b>>2]|0)|0;c[p+24>>2]=o;c[n+32>>2]=p;if(($d(a,42)|0)==0){break c}else{n=p}}ee(a,5152,0);Fc(j);ed(n);break b}}while(0);if((m|0)==0){break}c[g+32>>2]=m;if(($d(a,21)|0)!=0){break a}ee(a,4096,0);Fc(j);ed(g);e=0;i=d;return e|0}}while(0);ed(g);e=0;i=d;return e|0}}while(0);b=qe(a)|0;if((b|0)==0){ed(g);e=0;i=d;return e|0}c[g+36>>2]=b;if(!f){e=g;i=d;return e|0}f=dd(11,c[g+28>>2]|0)|0;xc(h);c[f+32>>2]=g;c[f+24>>2]=h;e=f;i=d;return e|0}function qe(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;b=i;if(($d(a,24)|0)==0){ee(a,4144,0);Fc(a+16|0);d=0;i=b;return d|0}if(($d(a,25)|0)!=0){d=dd(9,c[a+40>>2]|0)|0;i=b;return d|0}e=re(a,0)|0;if((e|0)==0){d=0;i=b;return d|0}f=a+8|0;do{if((c[f>>2]|0)==25){g=e}else{h=a+40|0;j=e;while(1){k=re(a,0)|0;if((k|0)==0){l=9;break}m=dd(68,c[h>>2]|0)|0;c[m+32>>2]=j;c[m+36>>2]=k;if((c[f>>2]|0)==25){l=11;break}else{j=m}}if((l|0)==9){ed(j);d=0;i=b;return d|0}else if((l|0)==11){if((m|0)==0){d=0}else{g=m;break}i=b;return d|0}}}while(0);if(($d(a,25)|0)==0){ee(a,4176,0);Fc(a+16|0);ed(g);d=0;i=b;return d|0}if((c[g>>2]|0)==68){c[g>>2]=1;d=g;i=b;return d|0}else{m=dd(1,c[a+40>>2]|0)|0;c[m+32>>2]=g;d=m;i=b;return d|0}return 0}function re(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;d=i;e=a+8|0;a:do{switch(c[e>>2]|0){case 8:{if((_d(a)|0)==0){ee(a,4720,0);f=0;break a}g=($d(a,20)|0)==0;do{if((c[e>>2]|0)==17){h=te(a)|0;if((h|0)==0){f=0;break a}else{j=h}}else{h=he(a)|0;if((h|0)==0){f=0;break a}if(($d(a,41)|0)!=0){j=h;break}ee(a,4760,0);Fc(a+16|0);ed(h);f=0;break a}}while(0);h=he(a)|0;if((h|0)==0){ed(j);f=0;break a}if(($d(a,41)|0)==0){ee(a,4808,0);Fc(a+16|0);ed(j);ed(h);f=0;break a}k=he(a)|0;if((k|0)==0){ed(j);ed(h);f=0;break a}do{if(!g){if(($d(a,21)|0)!=0){break}ee(a,4856,0);ed(j);ed(h);ed(k);f=0;break a}}while(0);g=qe(a)|0;if((g|0)==0){ed(j);ed(h);ed(k);f=0;break a}else{l=a+40|0;m=dd(67,c[l>>2]|0)|0;n=dd(67,c[l>>2]|0)|0;o=dd(67,c[l>>2]|0)|0;c[m+32>>2]=j;c[m+36>>2]=n;c[n+32>>2]=h;c[n+36>>2]=o;c[o+32>>2]=k;o=dd(4,c[l>>2]|0)|0;c[o+32>>2]=m;c[o+36>>2]=g;f=o;break a}break};case 18:{if((b|0)==0){ee(a,4216,0);f=0;break a}_d(a)|0;o=a+16|0;g=a+24|0;m=a+40|0;l=0;n=0;while(1){if((c[e>>2]|0)!=0){p=68;break}q=c[g>>2]|0;_d(a)|0;if(($d(a,34)|0)==0){p=70;break}r=he(a)|0;if((r|0)==0){p=72;break}s=dd(11,c[m>>2]|0)|0;c[s+24>>2]=q;c[s+32>>2]=r;if((l|0)==0){t=s}else{c[n+36>>2]=s;t=l}if(($d(a,42)|0)==0){p=76;break}else{l=t;n=s}}if((p|0)==68){ee(a,4272,0);Fc(o);f=0;break a}else if((p|0)==70){ee(a,4320,0);ed(l);f=0;break a}else if((p|0)==72){yc(q);ed(l);f=0;break a}else if((p|0)==76){if(($d(a,41)|0)!=0){f=t;break a}ee(a,4376,0);Fc(o);ed(t);f=0;break a}break};case 4:{f=se(a)|0;break};case 10:{if((_d(a)|0)==0){ee(a,4656,0);f=0;break a}if(($d(a,41)|0)==0){ee(a,4656,0);Fc(a+16|0);f=0;break a}else{f=dd(7,c[a+40>>2]|0)|0;break a}break};case 12:{if((_d(a)|0)==0){ee(a,4552,0);f=0;break a}if(($d(a,41)|0)!=0){f=dd(8,c[a+40>>2]|0)|0;break a}n=he(a)|0;if((n|0)==0){f=0;break a}if(($d(a,41)|0)==0){ee(a,4600,0);ed(n);f=0;break a}else{m=dd(8,c[a+40>>2]|0)|0;c[m+32>>2]=n;f=m;break a}break};case 41:{_d(a)|0;if((c[a+36>>2]|0)!=0){f=0;break a}f=dd(9,c[a+40>>2]|0)|0;break};case 24:{f=qe(a)|0;break};case 17:{f=te(a)|0;break};case 11:{if((b|0)!=0){f=pe(a,1)|0;break a}m=he(a)|0;if((m|0)==0){f=0;break a}if(($d(a,41)|0)!=0){f=m;break a}ee(a,4424,0);Fc(a+16|0);ed(m);f=0;break};case 9:{if((_d(a)|0)==0){ee(a,4688,0);f=0;break a}if(($d(a,41)|0)==0){ee(a,4688,0);Fc(a+16|0);f=0;break a}else{f=dd(6,c[a+40>>2]|0)|0;break a}break};case 6:{if((_d(a)|0)==0){ee(a,5040,0);f=0;break a}m=he(a)|0;if((m|0)==0){f=0;break a}n=qe(a)|0;if((n|0)==0){ed(m);f=0;break a}else{g=dd(2,c[a+40>>2]|0)|0;c[g+32>>2]=m;c[g+36>>2]=n;f=g;break a}break};case 7:{if((_d(a)|0)==0){ee(a,4896,0);f=0;break a}g=qe(a)|0;if((g|0)==0){f=0;break a}if(($d(a,6)|0)==0){ee(a,4928,0);Fc(a+16|0);ed(g);f=0;break a}n=he(a)|0;if((n|0)==0){ed(g);f=0;break a}if(($d(a,41)|0)==0){ee(a,4984,0);Fc(a+16|0);ed(g);ed(n);f=0;break a}else{m=dd(3,c[a+40>>2]|0)|0;c[m+32>>2]=n;c[m+36>>2]=g;f=m;break a}break};default:{m=he(a)|0;if((m|0)==0){f=0;break a}if(($d(a,41)|0)!=0){f=m;break a}ee(a,4424,0);Fc(a+16|0);ed(m);f=0}}}while(0);i=d;return f|0}function se(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0;b=i;if((_d(a)|0)==0){ee(a,5080,0);d=0;i=b;return d|0}e=he(a)|0;if((e|0)==0){d=0;i=b;return d|0}f=qe(a)|0;if((f|0)==0){ed(e);d=0;i=b;return d|0}do{if(($d(a,5)|0)==0){g=0}else{h=c[a+8>>2]|0;if((h|0)==24){j=qe(a)|0}else if((h|0)==4){j=se(a)|0}else{ee(a,5112,0);ed(e);ed(f);d=0;i=b;return d|0}if((j|0)!=0){g=j;break}ed(e);ed(f);d=0;i=b;return d|0}}while(0);j=a+40|0;a=dd(66,c[j>>2]|0)|0;c[a+32>>2]=f;c[a+36>>2]=g;g=dd(5,c[j>>2]|0)|0;c[g+32>>2]=e;c[g+36>>2]=a;d=g;i=b;return d|0}function te(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;b=i;_d(a)|0;d=a+16|0;e=a+24|0;f=a+40|0;g=0;h=0;while(1){j=c[e>>2]|0;if(($d(a,0)|0)==0){k=3;break}if(($d(a,34)|0)==0){l=0}else{m=he(a)|0;if((m|0)==0){k=6;break}else{l=m}}m=dd(10,c[f>>2]|0)|0;c[m+24>>2]=j;c[m+32>>2]=l;if((g|0)==0){n=m}else{c[h+36>>2]=m;n=g}if(($d(a,42)|0)==0){k=10;break}else{g=n;h=m}}if((k|0)==3){ee(a,4456,0);Fc(d);o=0;i=b;return o|0}else if((k|0)==6){yc(j);ed(g);o=0;i=b;return o|0}else if((k|0)==10){if(($d(a,41)|0)!=0){o=n;i=b;return o|0}ee(a,4504,0);Fc(d);ed(n);o=0;i=b;return o|0}return 0}function ue(a,b){a=a|0;b=b|0;i=i;return(c[a+(((b|0)/4|0)<<2)>>2]|0)>>>(((b|0)%4|0)<<3)&255|0}function ve(a){a=a|0;var b=0,d=0,e=0;b=i;i=i+16|0;d=b;e=fi(a)|0;if((e|0)==0){c[d>>2]=a;we(5456,d)}else{i=b;return e|0}return 0}function we(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;i=i+16|0;e=d;c[e>>2]=b;ye(a,e)}function xe(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;i=i+16|0;e=d;f=ii(a,b)|0;if((f|0)==0){c[e>>2]=a;c[e+4>>2]=b;we(5496,e)}else{i=d;return f|0}return 0}function ye(a,b){a=a|0;b=b|0;var d=0;d=c[p>>2]|0;ab(5544,26,1,d|0)|0;gb(d|0,a|0,b|0)|0;Kb(d|0)|0;Ab()}function ze(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;e=wc(5576)|0;c[e+8>>2]=b;Dc(a,e);i=d;return}function Ae(a){a=a|0;var b=0,d=0;b=i;if((c[a>>2]&511|0)!=263){d=0;i=b;return d|0}d=(c[c[a+8>>2]>>2]|0)==5576|0;i=b;return d|0}function Be(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;e=(ui(c[a+8>>2]|0,c[b+8>>2]|0)|0)==0|0;i=d;return e|0}function Ce(a){a=a|0;var b=0,d=0;b=i;d=c[a+8>>2]|0;a=Kc(d,Bi(d|0)|0)|0;i=b;return a|0}function De(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;b=i;i=i+256|0;d=b+16|0;e=b+192|0;f=b+160|0;g=b+208|0;h=b+240|0;j=b;k=b+176|0;l=b+224|0;m=sh(a)|0;Rd(d);Rd(e);Rd(f);Rd(g);Ac(h,3);Ac(j,4);Ac(k,5);Ac(l,6);Td(m,h,d);Td(m,j,e);Td(m,k,f);Td(m,l,g);Fc(d);Fc(e);Fc(f);Fc(g);c[d>>2]=10968;l=d+8|0;Cc(e,c[q>>2]|0);c[l+0>>2]=c[e+0>>2];c[l+4>>2]=c[e+4>>2];c[l+8>>2]=c[e+8>>2];c[l+12>>2]=c[e+12>>2];c[d+24>>2]=10976;l=d+32|0;Cc(f,c[r>>2]|0);c[l+0>>2]=c[f+0>>2];c[l+4>>2]=c[f+4>>2];c[l+8>>2]=c[f+8>>2];c[l+12>>2]=c[f+12>>2];c[d+48>>2]=10984;l=d+56|0;Cc(g,c[p>>2]|0);c[l+0>>2]=c[g+0>>2];c[l+4>>2]=c[g+4>>2];c[l+8>>2]=c[g+8>>2];c[l+12>>2]=c[g+12>>2];xh(a,0,10656,18);yh(a,0,d,3);Ue(a,3,10056,9);Ue(a,4,8544,21);xh(a,0,8208,1);Ue(a,5,8224,5);c[d>>2]=7760;l=d+8|0;Bc(e,2.718281828459045);c[l+0>>2]=c[e+0>>2];c[l+4>>2]=c[e+4>>2];c[l+8>>2]=c[e+8>>2];c[l+12>>2]=c[e+12>>2];c[d+24>>2]=7768;l=d+32|0;Bc(f,3.141592653589793);c[l+0>>2]=c[f+0>>2];c[l+4>>2]=c[f+4>>2];c[l+8>>2]=c[f+8>>2];c[l+12>>2]=c[f+12>>2];c[d+48>>2]=7776;l=d+56|0;Bc(g,1.4142135623730951);c[l+0>>2]=c[g+0>>2];c[l+4>>2]=c[g+4>>2];c[l+8>>2]=c[g+8>>2];c[l+12>>2]=c[g+12>>2];c[d+72>>2]=7784;l=d+80|0;Bc(h,1.618033988749895);c[l+0>>2]=c[h+0>>2];c[l+4>>2]=c[h+4>>2];c[l+8>>2]=c[h+8>>2];c[l+12>>2]=c[h+12>>2];c[d+96>>2]=7792;l=d+104|0;Bc(j,x);c[l+0>>2]=c[j+0>>2];c[l+4>>2]=c[j+4>>2];c[l+8>>2]=c[j+8>>2];c[l+12>>2]=c[j+12>>2];c[d+120>>2]=7800;j=d+128|0;Bc(k,w);c[j+0>>2]=c[k+0>>2];c[j+4>>2]=c[k+4>>2];c[j+8>>2]=c[k+8>>2];c[j+12>>2]=c[k+12>>2];xh(a,0,6896,50);yh(a,0,d,6);k=sh(a)|0;Ac(e,3);Ac(f,4);Ac(g,5);Ac(h,6);c[d>>2]=5896;Sd(k,e,d+8|0);c[d+24>>2]=5904;Sd(k,f,d+32|0);c[d+48>>2]=5912;Sd(k,g,d+56|0);c[d+72>>2]=5920;Sd(k,h,d+80|0);xh(a,0,5600,15);yh(a,0,d,4);Ue(a,6,5880,1);i=b;return}function Ee(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);h=-1;i=f;return h|0}if((c[d>>2]&255|0)!=3){Dd(e,6832,0);h=-2;i=f;return h|0}e=rb(c[(c[d+8>>2]|0)+8>>2]|0)|0;if((e|0)==0){h=0;i=f;return h|0}gh(g,e);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];h=0;i=f;return h|0}function Fe(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);h=-1;i=f;return h|0}if((c[d>>2]&255|0)==3){Ac(g,Jb(c[(c[d+8>>2]|0)+8>>2]|0)|0);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];h=0;i=f;return h|0}else{Dd(e,6776,0);h=-2;i=f;return h|0}return 0}function Ge(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;a=i;i=i+16|0;f=a;do{if((b|0)==2){if((c[d>>2]&255|0)!=1){Dd(e,6680,0);g=-2;break}if((c[d+16>>2]&255|0)!=3){Dd(e,6720,0);g=-2;break}if((c[d+8>>2]|0)!=0){g=0;break}c[f>>2]=c[(c[d+24>>2]|0)+8>>2];Dd(e,6752,f);g=-3}else{Dd(e,6360,0);g=-1}}while(0);i=a;return g|0}function He(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=i;i=i+16|0;d=e;Ac(d,bb(0)|0);c[a+0>>2]=c[d+0>>2];c[a+4>>2]=c[d+4>>2];c[a+8>>2]=c[d+8>>2];c[a+12>>2]=c[d+12>>2];i=e;return 0}function Ie(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=i;f=Ve(a,b,c,d,0)|0;i=e;return f|0}function Je(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=i;f=Ve(a,b,c,d,1)|0;i=e;return f|0}function Ke(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+96|0;g=f+32|0;h=f+48|0;j=f+16|0;k=f;if((b|0)!=2){Dd(e,6360,0);l=-1;i=f;return l|0}if((c[d>>2]&255|0)!=3){Dd(e,6432,0);l=-2;i=f;return l|0}if((c[d+16>>2]&255|0)!=5){Dd(e,6472,0);l=-2;i=f;return l|0}b=c[d+8>>2]|0;m=c[d+24>>2]|0;Wd(m,6512,g);if((c[g>>2]&767|0)!=2){Dd(e,6608,0);l=-3;i=f;return l|0}c[h>>2]=c[g+8>>2];Wd(m,6520,g);if((c[g>>2]&767|0)!=2){Dd(e,6608,0);l=-3;i=f;return l|0}c[h+4>>2]=c[g+8>>2];Wd(m,6528,g);if((c[g>>2]&767|0)!=2){Dd(e,6608,0);l=-3;i=f;return l|0}c[h+8>>2]=c[g+8>>2];Wd(m,6536,g);if((c[g>>2]&767|0)!=2){Dd(e,6608,0);l=-3;i=f;return l|0}c[h+12>>2]=c[g+8>>2];Wd(m,6544,g);if((c[g>>2]&767|0)!=2){Dd(e,6608,0);l=-3;i=f;return l|0}c[h+16>>2]=c[g+8>>2];Wd(m,6552,g);if((c[g>>2]&767|0)!=2){Dd(e,6608,0);l=-3;i=f;return l|0}c[h+20>>2]=c[g+8>>2];Wd(m,6560,g);if((c[g>>2]&767|0)!=2){Dd(e,6608,0);l=-3;i=f;return l|0}c[h+24>>2]=c[g+8>>2];Wd(m,6568,g);if((c[g>>2]&767|0)!=2){Dd(e,6608,0);l=-3;i=f;return l|0}c[h+28>>2]=c[g+8>>2];Wd(m,6576,j);if((c[j>>2]&255|0)==1){c[h+32>>2]=c[j+8>>2];j=ve(256)|0;ih(k,j,pb(j|0,256,c[b+8>>2]|0,h|0)|0,1);c[a+0>>2]=c[k+0>>2];c[a+4>>2]=c[k+4>>2];c[a+8>>2]=c[k+8>>2];c[a+12>>2]=c[k+12>>2];l=0;i=f;return l|0}else{Dd(e,6584,0);l=-4;i=f;return l|0}return 0}function Le(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f;if((b|0)!=2){Dd(e,6360,0);h=-1;i=f;return h|0}do{if((c[d>>2]&767|0)==2){if((c[d+16>>2]&767|0)!=2){break}Bc(g,+Ib(c[d+8>>2]|0,c[d+24>>2]|0));c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];h=0;i=f;return h|0}}while(0);Dd(e,6400,0);h=-2;i=f;return h|0}function Me(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);h=-1;i=f;return h|0}if((c[d>>2]&255|0)!=3){Dd(e,6120,0);h=-2;i=f;return h|0}b=zd(e,c[(c[d+8>>2]|0)+8>>2]|0)|0;if((b|0)==0){gh(g,xd(e)|0);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];yd(e);h=0;i=f;return h|0}else{c[a>>2]=262;c[a+8>>2]=b;Ec(a);h=0;i=f;return h|0}return 0}function Ne(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6328,0);h=-1;i=f;return h|0}if((c[d>>2]&255|0)!=3){Dd(e,6120,0);h=-2;i=f;return h|0}b=Ed(e,c[(c[d+8>>2]|0)+8>>2]|0)|0;if((b|0)==0){gh(g,xd(e)|0);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];yd(e);h=0;i=f;return h|0}else{c[a>>2]=262;c[a+8>>2]=b;Ec(a);h=0;i=f;return h|0}return 0}function Oe(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;i=i+16|0;g=f;if((b+ -1|0)>>>0>1){Dd(e,6160,0);h=-1;i=f;return h|0}if((c[d>>2]&255|0)!=3){Dd(e,6200,0);h=-2;i=f;return h|0}do{if((b|0)==2){if((c[d+16>>2]&767|0)==2){j=c[d+24>>2]|0;break}Dd(e,6232,0);h=-3;i=f;return h|0}else{j=0}}while(0);if((j|0)==1|(j|0)<0|(j|0)>36){Dd(e,6272,0);h=-4;i=f;return h|0}else{Ac(g,Sa(c[(c[d+8>>2]|0)+8>>2]|0,0,j|0)|0);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];h=0;i=f;return h|0}return 0}function Pe(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);h=-1;i=f;return h|0}if((c[d>>2]&255|0)==3){Bc(g,+ti(c[(c[d+8>>2]|0)+8>>2]|0,0));c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];h=0;i=f;return h|0}else{Dd(e,6120,0);h=-2;i=f;return h|0}return 0}function Qe(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);h=-1;i=f;return h|0}if((c[d>>2]&255|0)!=3){Dd(e,6120,0);h=-2;i=f;return h|0}b=c[(c[d+8>>2]|0)+8>>2]|0;if((ta(b|0,6152)|0)==0){h=Oe(a,1,d,e)|0;i=f;return h|0}else{Bc(g,+ti(b,0));c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];h=0;i=f;return h|0}return 0}function Re(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;if((b|0)!=1){Dd(e,6040,0);g=-1;i=f;return g|0}if((c[d>>2]&255|0)==3){g=Cd(e,c[(c[d+8>>2]|0)+8>>2]|0,a)|0;i=f;return g|0}else{Dd(e,6080,0);g=-2;i=f;return g|0}return 0}function Se(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;d=i;i=i+32|0;b=d+16|0;f=d;g=Fd(e,b)|0;e=Tc()|0;if((c[b>>2]|0)>>>0>1){h=1;do{gh(f,c[g+(h<<2)>>2]|0);$c(e,f);Fc(f);h=h+1|0;}while(h>>>0<(c[b>>2]|0)>>>0)}gi(g);c[a>>2]=260;c[a+8>>2]=e;i=d;return 0}function Te(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;i=i+256|0;g=f;if((b|0)!=2){Dd(e,5936,0);h=-1;i=f;return h|0}if((c[d>>2]&255|0)!=6){Dd(e,5960,0);h=-2;i=f;return h|0}if((c[d+16>>2]&255|0)!=4){Dd(e,6e3,0);h=-3;i=f;return h|0}b=c[d+8>>2]|0;j=c[d+24>>2]|0;d=Uc(j)|0;k=(d|0)>16;do{if(k){l=ve(d<<4)|0}else{if((d|0)>0){l=g;break}h=Bd(e,b,a,d,g)|0;i=f;return h|0}}while(0);g=0;do{Vc(j,g,l+(g<<4)|0);g=g+1|0;}while((g|0)!=(d|0));g=Bd(e,b,a,d,l)|0;if(!k){h=g;i=f;return h|0}gi(l);h=g;i=f;return h|0}function Ue(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;i=i+48|0;g=f+32|0;h=f+16|0;j=f;k=sh(a)|0;Ac(g,b);Sd(k,g,h);g=c[h+8>>2]|0;if((e|0)==0){i=f;return}else{l=0}do{h=d+(l<<3)|0;Ld(j,c[h>>2]|0,c[d+(l<<3)+4>>2]|0);Xd(g,c[h>>2]|0,j);Fc(j);l=l+1|0;}while((l|0)!=(e|0));i=f;return}function Ve(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;g=i;i=i+160|0;h=g+144|0;j=g+64|0;k=g+32|0;l=g+80|0;m=g+112|0;n=g+128|0;o=g+48|0;p=g+96|0;q=g+16|0;r=g;if((b|0)!=1){Dd(e,6040,0);s=-1;i=g;return s|0}if((c[d>>2]&767|0)!=2){Dd(e,6648,0);s=-2;i=g;return s|0}c[h>>2]=c[d+8>>2];if((f|0)==0){t=Xa(h|0)|0}else{t=Za(h|0)|0}h=Pd()|0;Ac(j,c[t>>2]|0);Xd(h,6512,j);Ac(k,c[t+4>>2]|0);c[j+0>>2]=c[k+0>>2];c[j+4>>2]=c[k+4>>2];c[j+8>>2]=c[k+8>>2];c[j+12>>2]=c[k+12>>2];Xd(h,6520,j);Ac(l,c[t+8>>2]|0);c[j+0>>2]=c[l+0>>2];c[j+4>>2]=c[l+4>>2];c[j+8>>2]=c[l+8>>2];c[j+12>>2]=c[l+12>>2];Xd(h,6528,j);Ac(m,c[t+12>>2]|0);c[j+0>>2]=c[m+0>>2];c[j+4>>2]=c[m+4>>2];c[j+8>>2]=c[m+8>>2];c[j+12>>2]=c[m+12>>2];Xd(h,6536,j);Ac(n,c[t+16>>2]|0);c[j+0>>2]=c[n+0>>2];c[j+4>>2]=c[n+4>>2];c[j+8>>2]=c[n+8>>2];c[j+12>>2]=c[n+12>>2];Xd(h,6544,j);Ac(o,c[t+20>>2]|0);c[j+0>>2]=c[o+0>>2];c[j+4>>2]=c[o+4>>2];c[j+8>>2]=c[o+8>>2];c[j+12>>2]=c[o+12>>2];Xd(h,6552,j);Ac(p,c[t+24>>2]|0);c[j+0>>2]=c[p+0>>2];c[j+4>>2]=c[p+4>>2];c[j+8>>2]=c[p+8>>2];c[j+12>>2]=c[p+12>>2];Xd(h,6560,j);Ac(q,c[t+28>>2]|0);c[j+0>>2]=c[q+0>>2];c[j+4>>2]=c[q+4>>2];c[j+8>>2]=c[q+8>>2];c[j+12>>2]=c[q+12>>2];Xd(h,6568,j);zc(r,(c[t+32>>2]|0)>0|0);c[j+0>>2]=c[r+0>>2];c[j+4>>2]=c[r+4>>2];c[j+8>>2]=c[r+8>>2];c[j+12>>2]=c[r+12>>2];Xd(h,6576,j);c[a>>2]=261;c[a+8>>2]=h;s=0;i=g;return s|0}function We(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0;f=i;do{if((b|0)==1){if((c[d>>2]&255|0)!=2){Dd(e,8032,0);g=-2;break}c[a+0>>2]=c[d+0>>2];c[a+4>>2]=c[d+4>>2];c[a+8>>2]=c[d+8>>2];c[a+12>>2]=c[d+12>>2];if((c[a>>2]&767|0)==514){j=a+8|0;h[j>>3]=+S(+(+h[j>>3]));g=0;break}j=a+8|0;k=c[j>>2]|0;if((k|0)>=0){g=0;break}c[j>>2]=0-k;g=0}else{Dd(e,6040,0);g=-1}}while(0);i=f;return g|0}function Xe(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0;f=i;if((b|0)<1){Dd(e,8168,0);g=-1;i=f;return g|0}if((c[d>>2]&255|0)!=2){Dd(e,8064,0);g=-2;i=f;return g|0}c[a+0>>2]=c[d+0>>2];c[a+4>>2]=c[d+4>>2];c[a+8>>2]=c[d+8>>2];c[a+12>>2]=c[d+12>>2];if((b|0)<=1){g=0;i=f;return g|0}j=a+8|0;k=a+8|0;l=1;while(1){m=d+(l<<4)|0;n=c[m>>2]|0;if((n&255|0)!=2){break}o=(c[a>>2]&767|0)!=514;do{if((n&512|0)==0){p=c[d+(l<<4)+8>>2]|0;if(o){if((p|0)>=(c[j>>2]|0)){break}c[a+0>>2]=c[m+0>>2];c[a+4>>2]=c[m+4>>2];c[a+8>>2]=c[m+8>>2];c[a+12>>2]=c[m+12>>2];break}else{if(!(+(p|0)<+h[k>>3])){break}c[a+0>>2]=c[m+0>>2];c[a+4>>2]=c[m+4>>2];c[a+8>>2]=c[m+8>>2];c[a+12>>2]=c[m+12>>2];break}}else{q=+h[d+(l<<4)+8>>3];if(o){if(!(q<+(c[j>>2]|0))){break}c[a+0>>2]=c[m+0>>2];c[a+4>>2]=c[m+4>>2];c[a+8>>2]=c[m+8>>2];c[a+12>>2]=c[m+12>>2];break}else{if(!(q<+h[k>>3])){break}c[a+0>>2]=c[m+0>>2];c[a+4>>2]=c[m+4>>2];c[a+8>>2]=c[m+8>>2];c[a+12>>2]=c[m+12>>2];break}}}while(0);m=l+1|0;if((m|0)<(b|0)){l=m}else{g=0;r=21;break}}if((r|0)==21){i=f;return g|0}Dd(e,8064,0);g=-2;i=f;return g|0}function Ye(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0;f=i;if((b|0)<1){Dd(e,8168,0);g=-1;i=f;return g|0}if((c[d>>2]&255|0)!=2){Dd(e,8064,0);g=-2;i=f;return g|0}c[a+0>>2]=c[d+0>>2];c[a+4>>2]=c[d+4>>2];c[a+8>>2]=c[d+8>>2];c[a+12>>2]=c[d+12>>2];if((b|0)<=1){g=0;i=f;return g|0}j=a+8|0;k=a+8|0;l=1;while(1){m=d+(l<<4)|0;n=c[m>>2]|0;if((n&255|0)!=2){break}o=(c[a>>2]&767|0)!=514;do{if((n&512|0)==0){p=c[d+(l<<4)+8>>2]|0;if(o){if((p|0)<=(c[j>>2]|0)){break}c[a+0>>2]=c[m+0>>2];c[a+4>>2]=c[m+4>>2];c[a+8>>2]=c[m+8>>2];c[a+12>>2]=c[m+12>>2];break}else{if(!(+(p|0)>+h[k>>3])){break}c[a+0>>2]=c[m+0>>2];c[a+4>>2]=c[m+4>>2];c[a+8>>2]=c[m+8>>2];c[a+12>>2]=c[m+12>>2];break}}else{q=+h[d+(l<<4)+8>>3];if(o){if(!(q>+(c[j>>2]|0))){break}c[a+0>>2]=c[m+0>>2];c[a+4>>2]=c[m+4>>2];c[a+8>>2]=c[m+8>>2];c[a+12>>2]=c[m+12>>2];break}else{if(!(q>+h[k>>3])){break}c[a+0>>2]=c[m+0>>2];c[a+4>>2]=c[m+4>>2];c[a+8>>2]=c[m+8>>2];c[a+12>>2]=c[m+12>>2];break}}}while(0);m=l+1|0;if((m|0)<(b|0)){l=m}else{g=0;r=21;break}}if((r|0)==21){i=f;return g|0}Dd(e,8064,0);g=-2;i=f;return g|0}function Ze(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0,w=0.0,x=0.0;f=i;i=i+48|0;g=f+32|0;j=f+16|0;k=f;if((b+ -1|0)>>>0>2){Dd(e,8136,0);l=-1;i=f;return l|0}a:do{if((b|0)>0){m=0;while(1){n=m+1|0;if((c[d+(m<<4)>>2]&255|0)!=2){break}if((n|0)<(b|0)){m=n}else{break a}}Dd(e,8064,0);l=-2;i=f;return l|0}}while(0);b:do{if((b|0)==2){do{if((c[d>>2]&767|0)==2){if((c[d+16>>2]&767|0)!=2){break}m=Tc()|0;n=c[d+8>>2]|0;o=c[d+24>>2]|0;if((n|0)<(o|0)){p=n}else{q=m;break b}while(1){Ac(j,p);$c(m,j);n=p+1|0;if((n|0)==(o|0)){q=m;break b}else{p=n}}}}while(0);Dd(e,6400,0);l=-3;i=f;return l|0}else if((b|0)==1){if((c[d>>2]&767|0)==2){m=Tc()|0;o=c[d+8>>2]|0;if((o|0)>0){r=0}else{q=m;break}while(1){Ac(g,r);$c(m,g);n=r+1|0;if((n|0)==(o|0)){q=m;break}else{r=n}}}else{Dd(e,6648,0);l=-3;i=f;return l|0}}else if((b|0)==3){if((c[d>>2]&767|0)==2){s=+(c[d+8>>2]|0)}else{s=+h[d+8>>3]}if((c[d+16>>2]&767|0)==2){t=+(c[d+24>>2]|0)}else{t=+h[d+24>>3]}if((c[d+32>>2]&767|0)==2){u=+(c[d+40>>2]|0)}else{u=+h[d+40>>3]}m=Tc()|0;if(!(s<=t)){q=m;break}else{v=0;w=s}while(1){Bc(k,w);$c(m,k);o=v+1|0;x=s+u*+(o|0);if(!(x<=t)){q=m;break}else{w=x;v=o}}}else{l=-1;i=f;return l|0}}while(0);c[a>>2]=260;c[a+8>>2]=q;l=0;i=f;return l|0}function _e(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);j=-1;i=f;return j|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);j=-2;i=f;return j|0}if((b&767|0)==514){k=+h[d+8>>3]}else{k=+(c[d+8>>2]|0)}if(k<-2147483648.0|k>2147483647.0){Dd(e,8096,0);j=-3;i=f;return j|0}else{Ac(g,~~+R(+k));c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}return 0}function $e(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);j=-1;i=f;return j|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);j=-2;i=f;return j|0}if((b&767|0)==514){k=+h[d+8>>3]}else{k=+(c[d+8>>2]|0)}if(k<-2147483648.0|k>2147483647.0){Dd(e,8096,0);j=-3;i=f;return j|0}else{Ac(g,~~+ca(+k));c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}return 0}function af(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0,l=0.0,m=0.0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);j=-1;i=f;return j|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);j=-2;i=f;return j|0}if((b&767|0)==514){k=+h[d+8>>3]}else{k=+(c[d+8>>2]|0)}if(k<-2147483648.0|k>2147483647.0){Dd(e,8096,0);j=-3;i=f;return j|0}do{if(!(k>=0.0)){l=+ca(+k);if(!(l-k>=.5)){m=l;break}m=l+-1.0}else{l=+R(+k);if(!(k-l>=.5)){m=l;break}m=l+1.0}}while(0);Ac(g,~~m);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}function bf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0.0;f=i;i=i+80|0;g=f+64|0;j=f+48|0;k=f+32|0;l=f+16|0;m=f;if((b|0)!=1){Dd(e,6040,0);n=-1;i=f;return n|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);n=-2;i=f;return n|0}if((b&512|0)==0){b=c[d+8>>2]|0;Ac(m,(b|0)>0?1:b>>31);c[a+0>>2]=c[m+0>>2];c[a+4>>2]=c[m+4>>2];c[a+8>>2]=c[m+8>>2];c[a+12>>2]=c[m+12>>2];n=0;i=f;return n|0}o=+h[d+8>>3];if(o>0.0){Bc(g,1.0);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];n=0;i=f;return n|0}if(o<0.0){Bc(j,-1.0);c[a+0>>2]=c[j+0>>2];c[a+4>>2]=c[j+4>>2];c[a+8>>2]=c[j+8>>2];c[a+12>>2]=c[j+12>>2];n=0;i=f;return n|0}if(o==0.0){Bc(k,0.0);c[a+0>>2]=c[k+0>>2];c[a+4>>2]=c[k+4>>2];c[a+8>>2]=c[k+8>>2];c[a+12>>2]=c[k+12>>2];n=0;i=f;return n|0}else{Bc(l,w);c[a+0>>2]=c[l+0>>2];c[a+4>>2]=c[l+4>>2];c[a+8>>2]=c[l+8>>2];c[a+12>>2]=c[l+12>>2];n=0;i=f;return n|0}return 0}function cf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0.0,k=0,l=0,m=0.0,n=0.0,o=0.0,p=0;f=i;i=i+16|0;g=f;a:do{if((b|0)>0){j=0.0;k=0;while(1){l=c[d+(k<<4)>>2]|0;if((l&255|0)!=2){break}if((l&767|0)==514){m=+h[d+(k<<4)+8>>3]}else{m=+(c[d+(k<<4)+8>>2]|0)}n=j+m*m;l=k+1|0;if((l|0)<(b|0)){j=n;k=l}else{o=n;break a}}Dd(e,8064,0);p=-1;i=f;return p|0}else{o=0.0}}while(0);Bc(g,+T(+o));c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];p=0;i=f;return p|0}function df(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);j=-1;i=f;return j|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);j=-2;i=f;return j|0}if((b&767|0)==514){k=+h[d+8>>3]}else{k=+(c[d+8>>2]|0)}Bc(g,+T(+k));c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}function ef(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0,l=0.0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);j=-1;i=f;return j|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);j=-2;i=f;return j|0}if((b&767|0)==514){k=+h[d+8>>3]}else{k=+(c[d+8>>2]|0)}l=k<0.0?-1.0:1.0;Bc(g,+U(+(k*l),.3333333333333333)*l);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}function ff(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0.0,u=0.0;f=i;i=i+32|0;g=f+16|0;j=f;if((b|0)!=2){Dd(e,6360,0);k=-1;i=f;return k|0}b=c[d>>2]|0;do{if((b&255|0)==2){l=c[d+16>>2]|0;if((l&255|0)!=2){break}do{if((b&512|0)==0){if((l&512|0)!=0){break}m=c[d+24>>2]|0;if((m|0)<0){break}if((m|0)==0){n=1}else{o=c[d+8>>2]|0;p=m;m=1;while(1){if((p&1|0)==0){q=m}else{q=da(m,o)|0}r=da(o,o)|0;s=p>>1;if((s|0)==0){n=q;break}else{o=r;p=s;m=q}}}Ac(j,n);c[a+0>>2]=c[j+0>>2];c[a+4>>2]=c[j+4>>2];c[a+8>>2]=c[j+8>>2];c[a+12>>2]=c[j+12>>2];k=0;i=f;return k|0}}while(0);if((b&767|0)==514){t=+h[d+8>>3]}else{t=+(c[d+8>>2]|0)}if((l&767|0)==514){u=+h[d+24>>3]}else{u=+(c[d+24>>2]|0)}Bc(g,+U(+t,+u));c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];k=0;i=f;return k|0}}while(0);Dd(e,8064,0);k=-2;i=f;return k|0}function gf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);j=-1;i=f;return j|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);j=-2;i=f;return j|0}if((b&767|0)==514){k=+h[d+8>>3]}else{k=+(c[d+8>>2]|0)}Bc(g,+aa(+k));c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}function hf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);j=-1;i=f;return j|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);j=-2;i=f;return j|0}if((b&767|0)==514){k=+h[d+8>>3]}else{k=+(c[d+8>>2]|0)}Bc(g,+Aa(+k));c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}function jf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);j=-1;i=f;return j|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);j=-2;i=f;return j|0}if((b&767|0)==514){k=+h[d+8>>3]}else{k=+(c[d+8>>2]|0)}Bc(g,+U(10.0,+k));c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}function kf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);j=-1;i=f;return j|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);j=-2;i=f;return j|0}if((b&767|0)==514){k=+h[d+8>>3]}else{k=+(c[d+8>>2]|0)}Bc(g,+ba(+k));c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}function lf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);j=-1;i=f;return j|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);j=-2;i=f;return j|0}if((b&767|0)==514){k=+h[d+8>>3]}else{k=+(c[d+8>>2]|0)}Bc(g,+ba(+k)/.6931471805599453);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}function mf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);j=-1;i=f;return j|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);j=-2;i=f;return j|0}if((b&767|0)==514){k=+h[d+8>>3]}else{k=+(c[d+8>>2]|0)}Bc(g,+sa(+k));c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}function nf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);j=-1;i=f;return j|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);j=-2;i=f;return j|0}if((b&767|0)==514){k=+h[d+8>>3]}else{k=+(c[d+8>>2]|0)}Bc(g,+W(+k));c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}function of(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);j=-1;i=f;return j|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);j=-2;i=f;return j|0}if((b&767|0)==514){k=+h[d+8>>3]}else{k=+(c[d+8>>2]|0)}Bc(g,+V(+k));c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}function pf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);j=-1;i=f;return j|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);j=-2;i=f;return j|0}if((b&767|0)==514){k=+h[d+8>>3]}else{k=+(c[d+8>>2]|0)}Bc(g,+X(+k));c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}function qf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);j=-1;i=f;return j|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);j=-2;i=f;return j|0}if((b&767|0)==514){k=+h[d+8>>3]}else{k=+(c[d+8>>2]|0)}Bc(g,+Ba(+k));c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}function rf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);j=-1;i=f;return j|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);j=-2;i=f;return j|0}if((b&767|0)==514){k=+h[d+8>>3]}else{k=+(c[d+8>>2]|0)}Bc(g,+Gb(+k));c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}function sf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);j=-1;i=f;return j|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);j=-2;i=f;return j|0}if((b&767|0)==514){k=+h[d+8>>3]}else{k=+(c[d+8>>2]|0)}Bc(g,+Fa(+k));c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}function tf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);j=-1;i=f;return j|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);j=-2;i=f;return j|0}if((b&767|0)==514){k=+h[d+8>>3]}else{k=+(c[d+8>>2]|0)}Bc(g,+Z(+k));c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}function uf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);j=-1;i=f;return j|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);j=-2;i=f;return j|0}if((b&767|0)==514){k=+h[d+8>>3]}else{k=+(c[d+8>>2]|0)}Bc(g,+Y(+k));c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}function vf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);j=-1;i=f;return j|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);j=-2;i=f;return j|0}if((b&767|0)==514){k=+h[d+8>>3]}else{k=+(c[d+8>>2]|0)}Bc(g,+_(+k));c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}function wf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0,l=0.0,m=0.0;f=i;i=i+16|0;g=f;if((b|0)!=2){Dd(e,6360,0);j=-1;i=f;return j|0}b=c[d>>2]|0;do{if((b&255|0)==2){k=c[d+16>>2]|0;if((k&255|0)!=2){break}if((b&767|0)==514){l=+h[d+8>>3]}else{l=+(c[d+8>>2]|0)}if((k&767|0)==514){m=+h[d+24>>3]}else{m=+(c[d+24>>2]|0)}Bc(g,+$(+l,+m));c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}}while(0);Dd(e,8064,0);j=-2;i=f;return j|0}function xf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);j=-1;i=f;return j|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);j=-2;i=f;return j|0}if((b&767|0)==514){k=+h[d+8>>3]}else{k=+(c[d+8>>2]|0)}Bc(g,k/180.0*3.141592653589793);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}function yf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);j=-1;i=f;return j|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);j=-2;i=f;return j|0}if((b&767|0)==514){k=+h[d+8>>3]}else{k=+(c[d+8>>2]|0)}Bc(g,k/3.141592653589793*180.0);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}function zf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=i;i=i+16|0;d=e;Bc(d,+(yi()|0)/2147483647.0);c[a+0>>2]=c[d+0>>2];c[a+4>>2]=c[d+4>>2];c[a+8>>2]=c[d+8>>2];c[a+12>>2]=c[d+12>>2];i=e;return 0}function Af(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;a=i;do{if((b|0)==1){if((c[d>>2]&767|0)==2){Va(c[d+8>>2]|0);f=0;break}else{Dd(e,6648,0);f=-2;break}}else{Dd(e,6040,0);f=-1}}while(0);i=a;return f|0}function Bf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0,l=0.0,m=0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);j=-1;i=f;return j|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);j=-2;i=f;return j|0}if((b&767|0)==514){k=+h[d+8>>3]}else{k=+(c[d+8>>2]|0)}if(k==k&0.0==0.0){l=k-k;m=l==l&0.0==0.0}else{m=0}zc(g,m&1);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}function Cf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0,l=0.0,m=0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);j=-1;i=f;return j|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);j=-2;i=f;return j|0}if((b&767|0)==514){k=+h[d+8>>3]}else{k=+(c[d+8>>2]|0)}if(k==k&0.0==0.0){l=k-k;m=l!=l|0.0!=0.0}else{m=0}zc(g,m&1);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}function Df(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);j=-1;i=f;return j|0}b=c[d>>2]|0;if((b&255|0)!=2){Dd(e,8032,0);j=-2;i=f;return j|0}if((b&767|0)==514){k=+h[d+8>>3]}else{k=+(c[d+8>>2]|0)}zc(g,(k!=k|0.0!=0.0)&1);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];j=0;i=f;return j|0}function Ef(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);h=-1;i=f;return h|0}e=c[d>>2]|0;if((e&255|0)==2){j=(e&512|0)!=0}else{j=0}zc(g,j&1);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];h=0;i=f;return h|0}function Ff(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);h=-1;i=f;return h|0}e=c[d>>2]|0;if((e&255|0)==2){j=(e&512|0)==0}else{j=0}zc(g,j&1);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];h=0;i=f;return h|0}function Gf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);h=-1;i=f;return h|0}if((c[d>>2]&767|0)!=2){Dd(e,6648,0);h=-2;i=f;return h|0}b=c[d+8>>2]|0;if((b|0)<0){Dd(e,8e3,0);h=-3;i=f;return h|0}if((b|0)<2){j=1}else{e=2;d=1;while(1){k=da(d,e)|0;if((e|0)==(b|0)){j=k;break}else{d=k;e=e+1|0}}}Ac(g,j);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];h=0;i=f;return h|0}function Hf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;f=i;i=i+16|0;g=f;if((b|0)!=2){Dd(e,6360,0);h=-1;i=f;return h|0}do{if((c[d>>2]&767|0)==2){if((c[d+16>>2]&767|0)!=2){break}b=c[d+8>>2]|0;j=c[d+24>>2]|0;if((j|b|0)<0|(b|0)<(j|0)){Dd(e,7976,0);h=-3;i=f;return h|0}k=b-j|0;l=(j|0)<(k|0)?j:k;if((l|0)>0){k=j+ -1-b|0;m=~j;j=0-((k|0)>(m|0)?k:m)|0;m=b-l|0;l=1;b=1;while(1){k=m+1|0;n=l+1|0;o=(da(b,k)|0)/(l|0)|0;if((n|0)==(j|0)){p=o;break}else{b=o;l=n;m=k}}}else{p=1}Ac(g,p);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];h=0;i=f;return h|0}}while(0);Dd(e,6400,0);h=-2;i=f;return h|0}function If(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=i;f=Vf(a,b,c,0,d)|0;i=e;return f|0}function Jf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=i;f=Vf(a,b,c,1,d)|0;i=e;return f|0}function Kf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=i;f=Vf(a,b,c,2,d)|0;i=e;return f|0}function Lf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=i;f=Vf(a,b,c,3,d)|0;i=e;return f|0}function Mf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=i;f=Uf(a,b,c,0,d)|0;i=e;return f|0}function Nf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=i;f=Uf(a,b,c,1,d)|0;i=e;return f|0}function Of(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=i;f=Uf(a,b,c,2,d)|0;i=e;return f|0}function Pf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0.0;f=i;i=i+64|0;g=f+48|0;j=f+32|0;k=f+24|0;l=f+16|0;m=f;if((b|0)!=1){Dd(e,6040,0);n=-1;i=f;return n|0}if((c[d>>2]&255|0)!=5){Dd(e,7808,0);n=-2;i=f;return n|0}if((Tf(d,k,l,0,e)|0)!=0){n=-3;i=f;return n|0}Rd(m);c[a+0>>2]=c[m+0>>2];c[a+4>>2]=c[m+4>>2];c[a+8>>2]=c[m+8>>2];c[a+12>>2]=c[m+12>>2];o=-+h[l>>3];l=c[a+8>>2]|0;Bc(g,+h[k>>3]);Bc(j,o);Xd(l,7848,g);Xd(l,7864,j);n=0;i=f;return n|0}function Qf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0.0,n=0.0;f=i;i=i+32|0;g=f+24|0;j=f+16|0;k=f;if((b|0)!=1){Dd(e,6040,0);l=-1;i=f;return l|0}if((c[d>>2]&255|0)!=5){Dd(e,7808,0);l=-2;i=f;return l|0}if((Tf(d,g,j,0,e)|0)!=0){l=-3;i=f;return l|0}m=+h[g>>3];n=+h[j>>3];Bc(k,+T(+(m*m+n*n)));c[a+0>>2]=c[k+0>>2];c[a+4>>2]=c[k+4>>2];c[a+8>>2]=c[k+8>>2];c[a+12>>2]=c[k+12>>2];l=0;i=f;return l|0}function Rf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0;f=i;i=i+64|0;g=f+48|0;j=f+32|0;k=f+24|0;l=f+16|0;m=f;if((b|0)!=1){Dd(e,6040,0);n=-1;i=f;return n|0}if((c[d>>2]&255|0)!=5){Dd(e,7808,0);n=-2;i=f;return n|0}if((Tf(d,k,l,0,e)|0)!=0){n=-3;i=f;return n|0}o=+h[k>>3];p=+h[l>>3];q=+T(+(o*o+p*p));r=+$(+p,+o);Rd(m);c[a+0>>2]=c[m+0>>2];c[a+4>>2]=c[m+4>>2];c[a+8>>2]=c[m+8>>2];c[a+12>>2]=c[m+12>>2];m=c[a+8>>2]|0;Bc(g,q);Bc(j,r);Xd(m,7840,g);Xd(m,7856,j);n=0;i=f;return n|0}function Sf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0;f=i;i=i+64|0;g=f+48|0;j=f+32|0;k=f+24|0;l=f+16|0;m=f;if((b|0)!=1){Dd(e,6040,0);n=-1;i=f;return n|0}if((c[d>>2]&255|0)!=5){Dd(e,7808,0);n=-2;i=f;return n|0}if((Tf(d,k,l,1,e)|0)!=0){n=-3;i=f;return n|0}o=+h[k>>3];p=+h[l>>3];q=o*+V(+p);r=o*+W(+p);Rd(m);c[a+0>>2]=c[m+0>>2];c[a+4>>2]=c[m+4>>2];c[a+8>>2]=c[m+8>>2];c[a+12>>2]=c[m+12>>2];m=c[a+8>>2]|0;Bc(g,q);Bc(j,r);Xd(m,7848,g);Xd(m,7864,j);n=0;i=f;return n|0}function Tf(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,j=0,k=0,l=0,m=0.0,n=0.0,o=0;g=i;i=i+32|0;j=g+16|0;k=g;l=c[a+8>>2]|0;a=(e|0)!=0;Wd(l,a?7840:7848,j);Wd(l,a?7856:7864,k);a=c[j>>2]|0;do{if((a&255|0)==2){l=c[k>>2]|0;if((l&255|0)!=2){break}if((a&767|0)==514){m=+h[j+8>>3]}else{m=+(c[j+8>>2]|0)}h[b>>3]=m;if((l&767|0)==514){n=+h[k+8>>3]}else{n=+(c[k+8>>2]|0)}h[d>>3]=n;o=0;i=g;return o|0}}while(0);Dd(f,7872,0);o=-1;i=g;return o|0}function Uf(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0;g=i;i=i+64|0;j=g+48|0;k=g+32|0;l=g+24|0;m=g+16|0;n=g;if((b|0)!=1){Dd(f,6040,0);o=-1;i=g;return o|0}if((c[d>>2]&255|0)!=5){Dd(f,7808,0);o=-2;i=g;return o|0}if((Tf(d,l,m,0,f)|0)!=0){o=-3;i=g;return o|0}if((e|0)==0){p=+h[l>>3];q=+W(+p);r=+h[m>>3];s=q*+Gb(+r);q=+V(+p);t=q*+Ba(+r);u=s}else if((e|0)==2){s=+h[l>>3];r=+W(+s);q=+h[m>>3];p=r*+Gb(+q);v=+V(+s);s=v*+Ba(+q);w=v*+Gb(+q);v=r*+Ba(+q)*-1.0;q=w*w+v*v;t=(s*w-p*v)/q;u=(p*w+s*v)/q}else if((e|0)==1){q=+h[l>>3];v=+V(+q);s=+h[m>>3];w=v*+Gb(+s);v=+W(+q);t=v*+Ba(+s)*-1.0;u=w}else{o=-1;i=g;return o|0}Rd(n);c[a+0>>2]=c[n+0>>2];c[a+4>>2]=c[n+4>>2];c[a+8>>2]=c[n+8>>2];c[a+12>>2]=c[n+12>>2];n=c[a+8>>2]|0;Bc(j,u);Bc(k,t);Xd(n,7848,j);Xd(n,7864,k);o=0;i=g;return o|0}function Vf(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0;g=i;i=i+80|0;j=g+16|0;k=g+48|0;l=g+64|0;m=g+72|0;n=g+8|0;o=g;p=g+32|0;if((b|0)!=2){Dd(f,6360,0);q=-1;i=g;return q|0}do{if((c[d>>2]&255|0)==5){b=d+16|0;if((c[b>>2]&255|0)!=5){break}if((Tf(d,l,m,0,f)|0)!=0){q=-3;i=g;return q|0}if((Tf(b,n,o,0,f)|0)!=0){q=-3;i=g;return q|0}if((e|0)==3){r=+h[n>>3];s=+h[o>>3];t=r*r+s*s;u=+h[l>>3];v=+h[m>>3];w=(r*v-s*u)/t;x=(r*u+s*v)/t}else if((e|0)==0){w=+h[m>>3]+ +h[o>>3];x=+h[l>>3]+ +h[n>>3]}else if((e|0)==1){w=+h[m>>3]- +h[o>>3];x=+h[l>>3]- +h[n>>3]}else if((e|0)==2){t=+h[l>>3];v=+h[n>>3];s=+h[m>>3];u=+h[o>>3];w=v*s+t*u;x=t*v-s*u}else{q=-1;i=g;return q|0}Rd(p);c[a+0>>2]=c[p+0>>2];c[a+4>>2]=c[p+4>>2];c[a+8>>2]=c[p+8>>2];c[a+12>>2]=c[p+12>>2];b=c[a+8>>2]|0;Bc(j,x);Bc(k,w);Xd(b,7848,j);Xd(b,7864,k);q=0;i=g;return q|0}}while(0);Dd(f,7944,0);q=-2;i=g;return q|0}function Wf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;f=i;i=i+48|0;g=f+32|0;h=f+16|0;j=f;if((b|0)!=2){Dd(e,8328,0);k=-1;i=f;return k|0}do{if((c[d>>2]&255|0)==4){if((c[d+16>>2]&255|0)!=4){break}Rd(g);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];b=c[a+8>>2]|0;l=c[d+8>>2]|0;m=c[d+24>>2]|0;n=Uc(l)|0;if((Uc(m)|0)!=(n|0)){Dd(e,8496,0);k=-3;i=f;return k|0}if((n|0)==0){k=0;i=f;return k|0}else{o=0}while(1){Vc(l,o,h);Vc(m,o,j);Td(b,h,j);p=o+1|0;if((p|0)==(n|0)){k=0;break}else{o=p}}i=f;return k|0}}while(0);Dd(e,8464,0);k=-2;i=f;return k|0}function Xf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;a=i;i=i+32|0;f=a;a:do{if((b|0)==2){if((c[d>>2]&255|0)!=5){Dd(e,8352,0);g=-2;break}if((c[d+16>>2]&255|0)!=6){Dd(e,8392,0);g=-3;break}h=c[d+8>>2]|0;j=c[d+24>>2]|0;k=f+16|0;l=0;while(1){m=Yd(h,l,k,f)|0;if((m|0)==0){g=0;break a}if((Bd(e,j,0,2,f)|0)==0){l=m}else{g=-4;break}}}else{Dd(e,8328,0);g=-1}}while(0);i=a;return g|0}function Yf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+48|0;g=f+16|0;h=f;if((b|0)!=2){Dd(e,8328,0);j=-1;i=f;return j|0}if((c[d>>2]&255|0)!=5){Dd(e,8352,0);j=-2;i=f;return j|0}if((c[d+16>>2]&255|0)!=6){Dd(e,8392,0);j=-3;i=f;return j|0}b=Pd()|0;k=c[d+8>>2]|0;l=c[d+24>>2]|0;d=g+16|0;m=Yd(k,0,d,g)|0;a:do{if((m|0)!=0){n=m;while(1){if((Bd(e,l,h,2,g)|0)!=0){break}Td(b,d,h);Fc(h);n=Yd(k,n,d,g)|0;if((n|0)==0){break a}}yc(b);j=-4;i=f;return j|0}}while(0);c[a>>2]=261;c[a+8>>2]=b;j=0;i=f;return j|0}function Zf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;f=i;i=i+48|0;g=f+16|0;h=f;if((b|0)!=2){Dd(e,8328,0);j=-1;i=f;return j|0}if((c[d>>2]&255|0)!=5){Dd(e,8352,0);j=-2;i=f;return j|0}if((c[d+16>>2]&255|0)!=6){Dd(e,8392,0);j=-3;i=f;return j|0}b=Pd()|0;k=c[d+8>>2]|0;l=c[d+24>>2]|0;d=g+16|0;m=Yd(k,0,d,g)|0;a:do{if((m|0)!=0){n=h+8|0;o=m;while(1){if((Bd(e,l,h,2,g)|0)!=0){p=10;break}if((c[h>>2]&255|0)!=1){p=12;break}if((c[n>>2]|0)!=0){Td(b,d,g)}o=Yd(k,o,d,g)|0;if((o|0)==0){break a}}if((p|0)==10){yc(b);j=-4;i=f;return j|0}else if((p|0)==12){yc(b);Fc(h);Dd(e,8432,0);j=-5;i=f;return j|0}}}while(0);c[a>>2]=261;c[a+8>>2]=b;j=0;i=f;return j|0}function _f(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=i;f=ag(a,b,c,d,0)|0;i=e;return f|0}function $f(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=i;f=ag(a,b,c,d,1)|0;i=e;return f|0}function ag(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+48|0;h=g+32|0;j=g+16|0;k=g;if((b|0)!=1){Dd(e,8304,0);l=-1;i=g;return l|0}if((c[d>>2]&255|0)!=5){Dd(e,7808,0);l=-2;i=g;return l|0}bd(k);c[a+0>>2]=c[k+0>>2];c[a+4>>2]=c[k+4>>2];c[a+8>>2]=c[k+8>>2];c[a+12>>2]=c[k+12>>2];k=c[a+8>>2]|0;a=c[d+8>>2]|0;d=Yd(a,0,h,j)|0;if((d|0)==0){l=0;i=g;return l|0}e=(f|0)!=0?j:h;f=d;while(1){$c(k,e);d=Yd(a,f,h,j)|0;if((d|0)==0){l=0;break}else{f=d}}i=g;return l|0}function bg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;a=i;if((b+ -1|0)>>>0>1){Dd(e,6160,0);f=-1;i=a;return f|0}if((c[d>>2]&255|0)!=4){Dd(e,8912,0);f=-2;i=a;return f|0}g=c[d+8>>2]|0;do{if((b|0)==2){if((c[d+16>>2]&255|0)==6){h=c[d+24>>2]|0;break}Dd(e,9904,0);f=-3;i=a;return f|0}else{h=0}}while(0);f=zg(g,0,(Uc(g)|0)+ -1|0,h,e)|0;i=a;return f|0}function cg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+48|0;g=f+32|0;h=f+16|0;j=f;if((b|0)!=2){Dd(e,8328,0);k=-1;i=f;return k|0}if((c[d>>2]&255|0)!=4){Dd(e,8912,0);k=-2;i=f;return k|0}e=c[d+8>>2]|0;b=Uc(e)|0;a:do{if((b|0)!=0){l=d+16|0;m=0;while(1){Vc(e,m,g);n=m+1|0;if((Gc(g,l)|0)!=0){break}if(n>>>0<b>>>0){m=n}else{break a}}Ac(h,m);c[a+0>>2]=c[h+0>>2];c[a+4>>2]=c[h+4>>2];c[a+8>>2]=c[h+8>>2];c[a+12>>2]=c[h+12>>2];k=0;i=f;return k|0}}while(0);Ac(j,-1);c[a+0>>2]=c[j+0>>2];c[a+4>>2]=c[j+4>>2];c[a+8>>2]=c[j+8>>2];c[a+12>>2]=c[j+12>>2];k=0;i=f;return k|0}function dg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;f=i;i=i+64|0;g=f+48|0;h=f+32|0;j=f+16|0;k=f;if((b|0)!=2){Dd(e,8328,0);l=-1;i=f;return l|0}if((c[d>>2]&255|0)!=4){Dd(e,8912,0);l=-2;i=f;return l|0}if((c[d+16>>2]&255|0)!=6){Dd(e,8392,0);l=-3;i=f;return l|0}b=c[d+8>>2]|0;m=c[d+24>>2]|0;d=Uc(b)|0;a:do{if((d|0)!=0){n=h+8|0;o=0;while(1){Vc(b,o,g);if((Bd(e,m,h,1,g)|0)!=0){l=-4;p=16;break}if((c[h>>2]&255|0)!=1){p=12;break}q=o+1|0;if((c[n>>2]|0)!=0){p=14;break}if(q>>>0<d>>>0){o=q}else{break a}}if((p|0)==12){Fc(h);Dd(e,8432,0);l=-5;i=f;return l|0}else if((p|0)==14){Ac(j,o);c[a+0>>2]=c[j+0>>2];c[a+4>>2]=c[j+4>>2];c[a+8>>2]=c[j+8>>2];c[a+12>>2]=c[j+12>>2];l=0;i=f;return l|0}else if((p|0)==16){i=f;return l|0}}}while(0);Ac(k,-1);c[a+0>>2]=c[k+0>>2];c[a+4>>2]=c[k+4>>2];c[a+8>>2]=c[k+8>>2];c[a+12>>2]=c[k+12>>2];l=0;i=f;return l|0}function eg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;if((b+ -2|0)>>>0>1){Dd(e,9256,0);g=-1;i=f;return g|0}if((c[d>>2]&255|0)!=4){Dd(e,8912,0);g=-2;i=f;return g|0}do{if((b|0)>2){if((c[d+32>>2]&255|0)==6){h=c[d+40>>2]|0;break}Dd(e,9464,0);g=-3;i=f;return g|0}else{h=0}}while(0);b=c[d+8>>2]|0;g=xg(a,b,d+16|0,0,Uc(b)|0,h,e)|0;i=f;return g|0}function fg(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=i;f=wg(a,b,c,d,1)|0;i=e;return f|0}function gg(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=i;f=wg(a,b,c,d,0)|0;i=e;return f|0}function hg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;f=i;i=i+80|0;g=f+60|0;h=f+56|0;j=f+64|0;k=f+32|0;l=f+68|0;m=f+44|0;n=f+40|0;o=f;p=f+16|0;if((b|0)!=3){Dd(e,8888,0);q=-1;i=f;return q|0}if((c[d>>2]&255|0)!=4){Dd(e,8912,0);q=-2;i=f;return q|0}if((c[d+16>>2]&767|0)!=2){Dd(e,9160,0);q=-3;i=f;return q|0}if((c[d+32>>2]&767|0)!=2){Dd(e,9664,0);q=-4;i=f;return q|0}b=c[d+24>>2]|0;c[g>>2]=b;r=c[d+40>>2]|0;c[h>>2]=r;s=c[d+8>>2]|0;d=Uc(s)|0;c[j>>2]=d;if((b|0)<0|(b|0)>(d|0)){c[k>>2]=g;c[k+4>>2]=j;Dd(e,9712,k);q=-5;i=f;return q|0}if((r|0)<0){c[l>>2]=h;Dd(e,9776,l);q=-6;i=f;return q|0}l=r+b|0;if((l|0)>(d|0)){c[n>>2]=l;c[m>>2]=g;c[m+4>>2]=n;c[m+8>>2]=j;Dd(e,9808,m);q=-7;i=f;return q|0}bd(o);c[a+0>>2]=c[o+0>>2];c[a+4>>2]=c[o+4>>2];c[a+8>>2]=c[o+8>>2];c[a+12>>2]=c[o+12>>2];o=c[a+8>>2]|0;if((c[h>>2]|0)>0){t=0}else{q=0;i=f;return q|0}while(1){Vc(s,(c[g>>2]|0)+t|0,p);$c(o,p);a=t+1|0;if((a|0)<(c[h>>2]|0)){t=a}else{q=0;break}}i=f;return q|0}function ig(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;g=i;i=i+48|0;h=g+32|0;j=g+16|0;k=g;if((d|0)!=2){Dd(f,6360,0);l=-1;i=g;return l|0}if((c[e>>2]&255|0)!=4){Dd(f,8912,0);l=-2;i=g;return l|0}if((c[e+16>>2]&255|0)!=3){Dd(f,9584,0);l=-2;i=g;return l|0}d=c[e+8>>2]|0;m=Uc(d)|0;n=c[e+24>>2]|0;do{if((m|0)!=0){e=h+8|0;o=n+12|0;p=n+8|0;q=0;r=0;s=0;while(1){Vc(d,r,h);if((c[h>>2]&255|0)!=3){t=10;break}u=c[e>>2]|0;v=(r|0)!=0;if(v){w=(c[u+12>>2]|0)+(c[o>>2]|0)|0}else{w=c[u+12>>2]|0}x=w+s|0;y=xe(q,x+1|0)|0;z=y+s|0;if(v){Ei(z|0,c[p>>2]|0,c[o>>2]|0)|0;Ei(y+((c[o>>2]|0)+s)|0,c[u+8>>2]|0,c[u+12>>2]|0)|0}else{Ei(z|0,c[u+8>>2]|0,c[u+12>>2]|0)|0}A=r+1|0;if(A>>>0<m>>>0){q=y;r=A;s=x}else{break}}if((t|0)==10){gi(q);Dd(f,9624,0);l=-3;i=g;return l|0}if((A|0)==0){break}a[y+x|0]=0;ih(j,y,x,1);c[b+0>>2]=c[j+0>>2];c[b+4>>2]=c[j+4>>2];c[b+8>>2]=c[j+8>>2];c[b+12>>2]=c[j+12>>2];l=0;i=g;return l|0}}while(0);ih(k,9656,0,0);c[b+0>>2]=c[k+0>>2];c[b+4>>2]=c[k+4>>2];c[b+8>>2]=c[k+8>>2];c[b+12>>2]=c[k+12>>2];l=0;i=g;return l|0}function jg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;a=i;i=i+64|0;f=a+48|0;g=a+16|0;h=a;a:do{if((b|0)==2){if((c[d>>2]&255|0)!=4){Dd(e,8912,0);j=-2;break}if((c[d+16>>2]&255|0)!=6){Dd(e,8392,0);j=-3;break}k=c[d+8>>2]|0;l=c[d+24>>2]|0;m=Uc(k)|0;if((m|0)==0){j=0;break}n=g+16|0;o=f+8|0;p=0;while(1){Vc(k,p,g);Ac(h,p);c[n+0>>2]=c[h+0>>2];c[n+4>>2]=c[h+4>>2];c[n+8>>2]=c[h+8>>2];c[n+12>>2]=c[h+12>>2];if((Bd(e,l,f,2,g)|0)!=0){j=-4;break a}q=c[f>>2]&255;if((q|0)==1){if((c[o>>2]|0)==0){j=0;break a}}else if((q|0)!=0){break}q=p+1|0;if(q>>>0<m>>>0){p=q}else{j=0;break a}}Fc(f);Dd(e,9536,0);j=-5}else{Dd(e,9504,0);j=-1}}while(0);i=a;return j|0}function kg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+48|0;g=f+16|0;h=f;if((b|0)!=3){Dd(e,9432,0);j=-1;i=f;return j|0}b=d+16|0;if((c[d>>2]&255|0)!=4){Dd(e,8912,0);j=-2;i=f;return j|0}if((c[d+32>>2]&255|0)!=6){Dd(e,9464,0);j=-3;i=f;return j|0}k=c[d+40>>2]|0;l=c[d+8>>2]|0;d=Uc(l)|0;Ec(b);c[h+0>>2]=c[b+0>>2];c[h+4>>2]=c[b+4>>2];c[h+8>>2]=c[b+8>>2];c[h+12>>2]=c[b+12>>2];a:do{if((d|0)!=0){b=g+16|0;m=0;while(1){c[g+0>>2]=c[h+0>>2];c[g+4>>2]=c[h+4>>2];c[g+8>>2]=c[h+8>>2];c[g+12>>2]=c[h+12>>2];Vc(l,m,b);n=Bd(e,k,h,2,g)|0;Fc(g);m=m+1|0;if((n|0)!=0){j=-4;break}if(!(m>>>0<d>>>0)){break a}}i=f;return j|0}}while(0);c[a+0>>2]=c[h+0>>2];c[a+4>>2]=c[h+4>>2];c[a+8>>2]=c[h+8>>2];c[a+12>>2]=c[h+12>>2];j=0;i=f;return j|0}function lg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;f=i;i=i+64|0;g=f+32|0;h=f+16|0;j=f;if((b|0)!=2){Dd(e,8328,0);k=-1;i=f;return k|0}if((c[d>>2]&255|0)!=4){Dd(e,8912,0);k=-2;i=f;return k|0}if((c[d+16>>2]&255|0)!=6){Dd(e,8392,0);k=-3;i=f;return k|0}b=c[d+8>>2]|0;l=c[d+24>>2]|0;d=Uc(b)|0;m=Tc()|0;a:do{if((d|0)!=0){n=g+16|0;o=h+8|0;p=0;while(1){Vc(b,p,g);Ac(j,p);c[n+0>>2]=c[j+0>>2];c[n+4>>2]=c[j+4>>2];c[n+8>>2]=c[j+8>>2];c[n+12>>2]=c[j+12>>2];if((Bd(e,l,h,2,g)|0)!=0){q=10;break}if((c[h>>2]&255|0)!=1){q=14;break}if((c[o>>2]|0)!=0){$c(m,g)}p=p+1|0;if(!(p>>>0<d>>>0)){break a}}if((q|0)==10){yc(m);k=-4;i=f;return k|0}else if((q|0)==14){Fc(h);yc(m);Dd(e,9400,0);k=-5;i=f;return k|0}}}while(0);c[a>>2]=260;c[a+8>>2]=m;k=0;i=f;return k|0}function mg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;i=i+64|0;g=f+48|0;h=f+16|0;j=f;if((b|0)!=2){Dd(e,8328,0);k=-1;i=f;return k|0}if((c[d>>2]&255|0)!=4){Dd(e,8912,0);k=-2;i=f;return k|0}if((c[d+16>>2]&255|0)!=6){Dd(e,8392,0);k=-3;i=f;return k|0}b=c[d+8>>2]|0;l=c[d+24>>2]|0;d=Uc(b)|0;m=Tc()|0;a:do{if((d|0)!=0){n=h+16|0;o=0;while(1){Vc(b,o,h);Ac(j,o);c[n+0>>2]=c[j+0>>2];c[n+4>>2]=c[j+4>>2];c[n+8>>2]=c[j+8>>2];c[n+12>>2]=c[j+12>>2];if((Bd(e,l,g,2,h)|0)!=0){break}$c(m,g);Fc(g);o=o+1|0;if(!(o>>>0<d>>>0)){break a}}yc(m);k=-4;i=f;return k|0}}while(0);c[a>>2]=260;c[a+8>>2]=m;k=0;i=f;return k|0}function ng(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;a=i;i=i+16|0;f=a+12|0;g=a+8|0;h=a;if((b|0)!=3){Dd(e,8888,0);j=-1;i=a;return j|0}if((c[d>>2]&255|0)!=4){Dd(e,8912,0);j=-2;i=a;return j|0}if((c[d+32>>2]&767|0)!=2){Dd(e,9360,0);j=-3;i=a;return j|0}b=c[d+8>>2]|0;k=Uc(b)|0;c[g>>2]=k;l=c[d+40>>2]|0;c[f>>2]=l;if((l|0)<0|(l|0)>(k|0)){c[h>>2]=f;c[h+4>>2]=g;Dd(e,9208,h);j=-4;i=a;return j|0}else{Xc(b,l,d+16|0);j=0;i=a;return j|0}return 0}function og(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;a=i;i=i+16|0;f=a+12|0;g=a+8|0;h=a;if((b+ -2|0)>>>0>1){Dd(e,9256,0);j=-1;i=a;return j|0}do{if((c[d>>2]&255|0)==4){if((c[d+16>>2]&255|0)!=4){break}k=(b|0)>2;do{if(k){if((c[d+32>>2]&767|0)==2){break}Dd(e,9328,0);j=-3;i=a;return j|0}}while(0);l=c[d+8>>2]|0;m=c[d+24>>2]|0;n=Uc(l)|0;c[g>>2]=n;if(k){o=c[d+40>>2]|0}else{o=n}c[f>>2]=o;if((o|0)<0|(o|0)>(n|0)){c[h>>2]=f;c[h+4>>2]=g;Dd(e,9208,h);j=-4;i=a;return j|0}else{Zc(l,o,m);j=0;i=a;return j|0}}}while(0);Dd(e,9288,0);j=-2;i=a;return j|0}function pg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;a=i;i=i+16|0;f=a+12|0;g=a+8|0;h=a;if((b|0)!=2){Dd(e,5936,0);j=-1;i=a;return j|0}if((c[d>>2]&255|0)!=4){Dd(e,8912,0);j=-2;i=a;return j|0}if((c[d+16>>2]&767|0)!=2){Dd(e,9160,0);j=-3;i=a;return j|0}b=c[d+8>>2]|0;k=Uc(b)|0;c[g>>2]=k;l=c[d+24>>2]|0;c[f>>2]=l;if((l|0)>-1&(l|0)<(k|0)){Yc(b,l);j=0;i=a;return j|0}else{c[h>>2]=f;c[h+4>>2]=g;Dd(e,9208,h);j=-4;i=a;return j|0}return 0}function qg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;f=i;i=i+48|0;g=f+16|0;h=f+40|0;j=f+32|0;k=f;bd(g);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];g=c[a+8>>2]|0;if((b|0)>0){l=0}else{m=0;i=f;return m|0}while(1){n=c[d+(l<<4)>>2]|0;if((n&255|0)!=4){break}o=c[d+(l<<4)+8>>2]|0;p=Uc(o)|0;if((p|0)!=0){q=0;do{Vc(o,q,k);$c(g,k);q=q+1|0;}while((q|0)!=(p|0))}p=l+1|0;if((p|0)<(b|0)){l=p}else{m=0;r=7;break}}if((r|0)==7){i=f;return m|0}c[j>>2]=l+1;c[h>>2]=j;c[h+4>>2]=Qc(n)|0;Dd(e,9112,h);Fc(a);m=-1;i=f;return m|0}function rg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;a=i;do{if((b|0)==2){if((c[d>>2]&255|0)==4){$c(c[d+8>>2]|0,d+16|0);f=0;break}else{Dd(e,8912,0);f=-2;break}}else{Dd(e,5936,0);f=-1}}while(0);i=a;return f|0}function sg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;do{if((b|0)==1){if((c[d>>2]&255|0)!=4){Dd(e,8856,0);g=-2;break}h=c[d+8>>2]|0;j=Uc(h)|0;if((j|0)==0){Dd(e,9080,0);g=-3;break}else{Vc(h,j+ -1|0,a);Ec(a);ad(h);g=0;break}}else{Dd(e,8304,0);g=-1}}while(0);i=f;return g|0}function tg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;do{if((b|0)==1){if((c[d>>2]&255|0)!=4){Dd(e,8856,0);g=-2;break}h=c[d+8>>2]|0;j=Uc(h)|0;if((j|0)==0){Dd(e,9040,0);g=-3;break}else{Vc(h,j+ -1|0,a);Ec(a);g=0;break}}else{Dd(e,8304,0);g=-1}}while(0);i=f;return g|0}function ug(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;a=i;i=i+64|0;f=a+16|0;g=a;h=a+48|0;j=a+44|0;k=a+40|0;l=a+32|0;if((b|0)!=3){Dd(e,8888,0);m=-1;i=a;return m|0}if((c[d>>2]&255|0)!=4){Dd(e,8912,0);m=-2;i=a;return m|0}do{if((c[d+16>>2]&767|0)==2){if((c[d+32>>2]&767|0)!=2){break}b=c[d+8>>2]|0;n=c[d+24>>2]|0;c[h>>2]=n;o=c[d+40>>2]|0;c[j>>2]=o;p=Uc(b)|0;do{if((n|0)>-1&n>>>0<p>>>0){if(!((o|0)>-1&o>>>0<p>>>0)){break}Vc(b,n,f);Vc(b,c[j>>2]|0,g);Ec(f);Wc(b,c[h>>2]|0,g);Wc(b,c[j>>2]|0,f);Fc(f);m=0;i=a;return m|0}}while(0);c[k>>2]=p;if((n|0)<0){q=h}else{q=n>>>0>=p>>>0?h:j}c[l>>2]=q;c[l+4>>2]=k;Dd(e,8992,l);m=-3;i=a;return m|0}}while(0);Dd(e,8944,0);m=-2;i=a;return m|0}function vg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+32|0;g=f+16|0;h=f;if((b|0)!=1){Dd(e,8304,0);j=-1;i=f;return j|0}if((c[d>>2]&255|0)!=4){Dd(e,8856,0);j=-2;i=f;return j|0}e=c[d+8>>2]|0;d=Uc(e)|0;bd(g);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];g=c[a+8>>2]|0;if((d|0)==0){j=0;i=f;return j|0}else{k=d}while(1){d=k+ -1|0;Vc(e,d,h);$c(g,h);if((d|0)==0){j=0;break}else{k=d}}i=f;return j|0}function wg(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;g=i;i=i+64|0;h=g+32|0;j=g+16|0;k=g;if((b|0)!=2){Dd(e,8328,0);l=-1;i=g;return l|0}if((c[d>>2]&255|0)!=4){Dd(e,8912,0);l=-2;i=g;return l|0}if((c[d+16>>2]&255|0)!=6){Dd(e,8392,0);l=-3;i=g;return l|0}b=c[d+8>>2]|0;m=c[d+24>>2]|0;d=(f|0)!=0;if(d){c[a+0>>2]=c[24>>2];c[a+4>>2]=c[28>>2];c[a+8>>2]=c[32>>2];c[a+12>>2]=c[36>>2]}else{c[a+0>>2]=c[40>>2];c[a+4>>2]=c[44>>2];c[a+8>>2]=c[48>>2];c[a+12>>2]=c[52>>2]}f=Uc(b)|0;if((f|0)==0){l=0;i=g;return l|0}n=h+16|0;o=j+8|0;a:do{if(d){p=0;while(1){Vc(b,p,h);Ac(k,p);c[n+0>>2]=c[k+0>>2];c[n+4>>2]=c[k+4>>2];c[n+8>>2]=c[k+8>>2];c[n+12>>2]=c[k+12>>2];if((Bd(e,m,j,2,h)|0)!=0){l=-4;q=23;break}if((c[j>>2]&255|0)!=1){break a}if((c[o>>2]|0)!=0){q=19;break}r=p+1|0;if(r>>>0<f>>>0){p=r}else{l=0;q=23;break}}if((q|0)==19){c[a+0>>2]=c[40>>2];c[a+4>>2]=c[44>>2];c[a+8>>2]=c[48>>2];c[a+12>>2]=c[52>>2];l=0;i=g;return l|0}else if((q|0)==23){i=g;return l|0}}else{p=0;while(1){Vc(b,p,h);Ac(k,p);c[n+0>>2]=c[k+0>>2];c[n+4>>2]=c[k+4>>2];c[n+8>>2]=c[k+8>>2];c[n+12>>2]=c[k+12>>2];if((Bd(e,m,j,2,h)|0)!=0){l=-4;q=23;break}if((c[j>>2]&255|0)!=1){break a}if((c[o>>2]|0)==0){q=21;break}r=p+1|0;if(r>>>0<f>>>0){p=r}else{l=0;q=23;break}}if((q|0)==21){c[a+0>>2]=c[24>>2];c[a+4>>2]=c[28>>2];c[a+8>>2]=c[32>>2];c[a+12>>2]=c[36>>2];l=0;i=g;return l|0}else if((q|0)==23){i=g;return l|0}}}while(0);Fc(j);Dd(e,8432,0);l=-5;i=g;return l|0}function xg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0;j=i;i=i+64|0;k=j+32|0;l=j+16|0;m=j;if((e|0)==(f|0)){Ac(l,-1);c[a+0>>2]=c[l+0>>2];c[a+4>>2]=c[l+4>>2];c[a+8>>2]=c[l+8>>2];c[a+12>>2]=c[l+12>>2];n=0;i=j;return n|0}l=((f-e|0)>>>1)+e|0;c[k+0>>2]=c[d+0>>2];c[k+4>>2]=c[d+4>>2];c[k+8>>2]=c[d+8>>2];c[k+12>>2]=c[d+12>>2];o=k+16|0;Vc(b,l,o);p=yg(k,g,h)|0;if((p|0)<0){n=-1;i=j;return n|0}if((p|0)>0){n=xg(a,b,d,e,l,g,h)|0;i=j;return n|0}c[o+0>>2]=c[d+0>>2];c[o+4>>2]=c[d+4>>2];c[o+8>>2]=c[d+8>>2];c[o+12>>2]=c[d+12>>2];Vc(b,l,k);o=yg(k,g,h)|0;if((o|0)<0){n=-1;i=j;return n|0}if((o|0)>0){n=xg(a,b,d,l+1|0,f,g,h)|0;i=j;return n|0}else{Ac(m,l);c[a+0>>2]=c[m+0>>2];c[a+4>>2]=c[m+4>>2];c[a+8>>2]=c[m+8>>2];c[a+12>>2]=c[m+12>>2];n=0;i=j;return n|0}return 0}function yg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;i=i+32|0;f=e+16|0;g=e;if((b|0)==0){h=a+16|0;if((Jc(a,h)|0)==0){c[f>>2]=Qc(c[a>>2]|0)|0;c[f+4>>2]=Qc(c[h>>2]|0)|0;Dd(d,9864,f);j=-3;i=e;return j|0}else{j=(Ic(a,h)|0)>>>31;i=e;return j|0}}if((Bd(d,b,g,2,a)|0)!=0){j=-1;i=e;return j|0}if((c[g>>2]&255|0)==1){j=c[g+8>>2]|0;i=e;return j|0}else{Fc(g);Dd(d,8432,0);j=-2;i=e;return j|0}return 0}



function zg(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;g=i;i=i+128|0;h=g+16|0;j=g+64|0;k=g+80|0;l=g+96|0;m=g;n=g+32|0;o=g+112|0;if((b|0)>=(d|0)){p=0;i=g;return p|0}q=((d-b|0)/2|0)+b|0;Vc(a,q,k);Vc(a,q,h);Vc(a,d,j);Ec(h);Wc(a,q,j);Wc(a,d,h);Fc(h);q=n+16|0;r=m+8|0;a:do{if((e|0)==0){s=b;t=b;while(1){Vc(a,s,l);if((Jc(l,k)|0)==0){break}if((Ic(l,k)|0)>-1){u=t}else{Vc(a,s,h);Vc(a,t,j);Ec(h);Wc(a,s,j);Wc(a,t,h);Fc(h);u=t+1|0}v=s+1|0;if((v|0)<(d|0)){s=v;t=u}else{w=u;x=14;break a}}c[o>>2]=Qc(c[l>>2]|0)|0;c[o+4>>2]=Qc(c[k>>2]|0)|0;Dd(f,1e4,o);y=0;z=0}else{t=b;s=b;while(1){Vc(a,t,l);c[n+0>>2]=c[l+0>>2];c[n+4>>2]=c[l+4>>2];c[n+8>>2]=c[l+8>>2];c[n+12>>2]=c[l+12>>2];c[q+0>>2]=c[k+0>>2];c[q+4>>2]=c[k+4>>2];c[q+8>>2]=c[k+8>>2];c[q+12>>2]=c[k+12>>2];if((Bd(f,e,m,2,n)|0)!=0){y=0;z=0;break a}if((c[m>>2]&255|0)!=1){break}if((c[r>>2]|0)==0){A=s}else{Vc(a,t,h);Vc(a,s,j);Ec(h);Wc(a,t,j);Wc(a,s,h);Fc(h);A=s+1|0}v=t+1|0;if((v|0)<(d|0)){t=v;s=A}else{w=A;x=14;break a}}Dd(f,9952,0);Fc(m);y=0;z=0}}while(0);if((x|0)==14){Vc(a,w,h);Vc(a,d,j);Ec(h);Wc(a,w,j);Wc(a,d,h);Fc(h);y=w;z=1}if(!z){p=-1;i=g;return p|0}if((zg(a,b,y+ -1|0,e,f)|0)!=0){p=-1;i=g;return p|0}p=((zg(a,y+1|0,d,e,f)|0)!=0)<<31>>31;i=g;return p|0}function Ag(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+16|0;g=f;if((b+ -2|0)>>>0>1){Dd(e,10544,0);h=-1;i=f;return h|0}do{if((c[d>>2]&255|0)==3){if((c[d+16>>2]&255|0)!=3){break}do{if((b|0)==3){if((c[d+32>>2]&767|0)==2){j=c[d+40>>2]|0;break}Dd(e,9360,0);h=-3;i=f;return h|0}else{j=0}}while(0);k=c[d+8>>2]|0;l=c[k+12>>2]|0;m=((j|0)<0?l:0)+j|0;if((m|0)<0|(m|0)>(l|0)){Dd(e,10624,0);h=-4;i=f;return h|0}l=c[k+8>>2]|0;k=Ma(l+m|0,c[(c[d+24>>2]|0)+8>>2]|0)|0;if((k|0)==0){n=-1}else{n=k-l|0}Ac(g,n);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];h=0;i=f;return h|0}}while(0);Dd(e,10584,0);h=-2;i=f;return h|0}function Bg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;if((b|0)!=3){Dd(e,10456,0);g=-1;i=f;return g|0}if((c[d>>2]&255|0)!=3){Dd(e,6200,0);g=-2;i=f;return g|0}do{if((c[d+16>>2]&767|0)==2){if((c[d+32>>2]&767|0)!=2){break}g=Kg(a,c[d+8>>2]|0,c[d+24>>2]|0,c[d+40>>2]|0,e)|0;i=f;return g|0}}while(0);Dd(e,10496,0);g=-2;i=f;return g|0}function Cg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;do{if((b|0)==2){if((c[d>>2]&255|0)!=3){Dd(e,6200,0);g=-2;break}if((c[d+16>>2]&767|0)==2){g=Kg(a,c[d+8>>2]|0,0,c[d+24>>2]|0,e)|0;break}else{Dd(e,6232,0);g=-2;break}}else{Dd(e,6360,0);g=-1}}while(0);i=f;return g|0}function Dg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;if((b|0)!=2){Dd(e,6360,0);g=-1;i=f;return g|0}if((c[d>>2]&255|0)!=3){Dd(e,6200,0);g=-2;i=f;return g|0}if((c[d+16>>2]&767|0)==2){b=c[d+8>>2]|0;h=c[d+24>>2]|0;g=Kg(a,b,h,(c[b+12>>2]|0)-h|0,e)|0;i=f;return g|0}else{Dd(e,6232,0);g=-2;i=f;return g|0}return 0}function Eg(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=i;i=i+32|0;h=g+16|0;j=g;if((d|0)!=2){Dd(f,6360,0);k=-1;i=g;return k|0}do{if((c[e>>2]&255|0)==3){if((c[e+16>>2]&255|0)!=3){break}d=c[e+8>>2]|0;l=c[e+24>>2]|0;m=l+12|0;if((c[m>>2]|0)==0){Dd(f,10312,0);k=-3;i=g;return k|0}n=Tc()|0;c[b>>2]=260;c[b+8>>2]=n;o=d+8|0;p=c[o>>2]|0;q=l+8|0;l=d+12|0;d=p;r=Ma(p|0,c[q>>2]|0)|0;while(1){p=(r|0)==0;if(p){s=(c[o>>2]|0)+(c[l>>2]|0)|0}else{s=r}t=s-d|0;u=ve(t+1|0)|0;Ei(u|0,d|0,t|0)|0;a[u+t|0]=0;ih(j,u,t,1);c[h+0>>2]=c[j+0>>2];c[h+4>>2]=c[j+4>>2];c[h+8>>2]=c[j+8>>2];c[h+12>>2]=c[j+12>>2];$c(n,h);Fc(h);if(p){k=0;break}p=r+(c[m>>2]|0)|0;d=p;r=Ma(p|0,c[q>>2]|0)|0}i=g;return k|0}}while(0);Dd(f,10280,0);k=-2;i=g;return k|0}function Fg(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;i=i+16|0;h=g;if((d|0)!=2){Dd(f,6360,0);j=-1;i=g;return j|0}if((c[e>>2]&255|0)!=3){Dd(f,6200,0);j=-2;i=g;return j|0}if((c[e+16>>2]&767|0)!=2){Dd(f,6232,0);j=-2;i=g;return j|0}d=c[e+24>>2]|0;if((d|0)<0){Dd(f,10240,0);j=-3;i=g;return j|0}f=c[e+8>>2]|0;e=f+12|0;k=da(c[e>>2]|0,d)|0;l=ve(k+1|0)|0;if((d|0)!=0){m=f+8|0;f=0;do{n=c[e>>2]|0;o=l+(da(n,f)|0)|0;Ei(o|0,c[m>>2]|0,n|0)|0;f=f+1|0;}while((f|0)!=(d|0))}a[l+k|0]=0;ih(h,l,k,1);c[b+0>>2]=c[h+0>>2];c[b+4>>2]=c[h+4>>2];c[b+8>>2]=c[h+8>>2];c[b+12>>2]=c[h+12>>2];j=0;i=g;return j|0}function Gg(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=i;f=Jg(a,b,c,0,d)|0;i=e;return f|0}function Hg(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=i;f=Jg(a,b,c,1,d)|0;i=e;return f|0}function Ig(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+16|0;g=f+4|0;h=f;if((b|0)<1){Dd(e,8168,0);j=-1;i=f;return j|0}if((c[d>>2]&255|0)!=3){Dd(e,6432,0);j=-2;i=f;return j|0}k=fh(c[d+8>>2]|0,b+ -1|0,d+16|0,g)|0;if((k|0)==0){c[h>>2]=c[g>>2];Dd(e,10208,h);gi(c[g>>2]|0);j=-3;i=f;return j|0}else{c[a>>2]=259;c[a+8>>2]=k;j=0;i=f;return j|0}return 0}function Jg(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;h=i;i=i+16|0;j=h;if((d|0)!=1){Dd(g,6040,0);k=-1;i=h;return k|0}if((c[e>>2]&255|0)!=3){Dd(g,6120,0);k=-2;i=h;return k|0}g=c[e+8>>2]|0;e=c[g+8>>2]|0;d=g+12|0;g=c[d>>2]|0;l=e+g|0;m=ve(g+1|0)|0;if((g|0)>0){g=e+1|0;n=(l>>>0>g>>>0?l:g)+(0-e)|0;if((f|0)==0){f=e;g=m;while(1){o=f+1|0;a[g]=Hi(a[f]|0)|0;if(o>>>0<l>>>0){g=g+1|0;f=o}else{break}}}else{f=e;e=m;while(1){g=f+1|0;a[e]=Rb(a[f]|0)|0;if(g>>>0<l>>>0){e=e+1|0;f=g}else{break}}}p=m+n|0}else{p=m}a[p]=0;ih(j,m,c[d>>2]|0,1);c[b+0>>2]=c[j+0>>2];c[b+4>>2]=c[j+4>>2];c[b+8>>2]=c[j+8>>2];c[b+12>>2]=c[j+12>>2];k=0;i=h;return k|0}function Kg(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0;h=i;i=i+16|0;j=h;k=c[d+12>>2]|0;if((e|0)<0|(k|0)<(e|0)){Dd(g,10344,0);l=-1;i=h;return l|0}if((f|0)<0|(k|0)<(f|0)){Dd(g,10384,0);l=-2;i=h;return l|0}if((f+e|0)>(k|0)){Dd(g,10416,0);l=-3;i=h;return l|0}else{g=ve(f+1|0)|0;Ei(g|0,(c[d+8>>2]|0)+e|0,f|0)|0;a[g+f|0]=0;ih(j,g,f,1);c[b+0>>2]=c[j+0>>2];c[b+4>>2]=c[j+4>>2];c[b+8>>2]=c[j+8>>2];c[b+12>>2]=c[j+12>>2];l=0;i=h;return l|0}return 0}function Lg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=i;bh(a,c[q>>2]|0);i=e;return 0}function Mg(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;d=i;if((b|0)>0){a=0;do{Mc(c+(a<<4)|0);a=a+1|0;}while((a|0)!=(b|0))}Wa(10)|0;i=d;return 0}function Ng(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;d=i;if((b|0)>0){a=0;do{Pc(c+(a<<4)|0);a=a+1|0;}while((a|0)!=(b|0))}Wa(10)|0;i=d;return 0}function Og(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;i=i+32|0;g=f+20|0;h=f;j=f+16|0;if((b|0)<1){Dd(e,8168,0);k=-1;i=f;return k|0}if((c[d>>2]&255|0)!=3){Dd(e,6432,0);k=-2;i=f;return k|0}l=fh(c[d+8>>2]|0,b+ -1|0,d+16|0,g)|0;if((l|0)==0){c[j>>2]=c[g>>2];Dd(e,10208,j);gi(c[g>>2]|0);k=-3;i=f;return k|0}else{Yb(c[l+8>>2]|0,c[r>>2]|0)|0;Ac(h,c[l+12>>2]|0);c[a+0>>2]=c[h+0>>2];c[a+4>>2]=c[h+4>>2];c[a+8>>2]=c[h+8>>2];c[a+12>>2]=c[h+12>>2];yc(l);k=0;i=f;return k|0}return 0}function Pg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f;if((b|0)!=2){Dd(e,6360,0);h=-1;i=f;return h|0}do{if((c[d>>2]&255|0)==3){if((c[d+16>>2]&255|0)!=3){break}b=Db(c[(c[d+8>>2]|0)+8>>2]|0,c[(c[d+24>>2]|0)+8>>2]|0)|0;if((b|0)==0){h=0;i=f;return h|0}Cc(g,b);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];h=0;i=f;return h|0}}while(0);Dd(e,11480,0);h=-2;i=f;return h|0}function Qg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;a=i;do{if((b|0)==1){if((c[d>>2]&511|0)==7){sb(c[d+8>>2]|0)|0;f=0;break}else{Dd(e,11168,0);f=-2;break}}else{Dd(e,6040,0);f=-1}}while(0);i=a;return f|0}function Rg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+32|0;g=f+20|0;h=f;j=f+16|0;if((b|0)<2){Dd(e,11400,0);k=-1;i=f;return k|0}if((c[d>>2]&511|0)!=7){Dd(e,11200,0);k=-2;i=f;return k|0}if((c[d+16>>2]&255|0)!=3){Dd(e,11440,0);k=-2;i=f;return k|0}l=c[d+8>>2]|0;m=fh(c[d+24>>2]|0,b+ -2|0,d+32|0,g)|0;if((m|0)==0){c[j>>2]=c[g>>2];Dd(e,10208,j);gi(c[g>>2]|0);k=-3;i=f;return k|0}else{Yb(c[m+8>>2]|0,l|0)|0;Ac(h,c[m+12>>2]|0);c[a+0>>2]=c[h+0>>2];c[a+4>>2]=c[h+4>>2];c[a+8>>2]=c[h+8>>2];c[a+12>>2]=c[h+12>>2];yc(m);k=0;i=f;return k|0}return 0}function Sg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;do{if((b|0)==1){if((c[d>>2]&511|0)==7){bh(a,c[d+8>>2]|0);g=0;break}else{Dd(e,11168,0);g=-2;break}}else{Dd(e,6040,0);g=-1}}while(0);i=f;return g|0}function Tg(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;g=i;i=i+16|0;h=g;if((d|0)!=2){Dd(f,6360,0);j=-1;i=g;return j|0}if((c[e>>2]&511|0)!=7){Dd(f,11200,0);j=-2;i=g;return j|0}if((c[e+16>>2]&767|0)!=2){Dd(f,6232,0);j=-2;i=g;return j|0}f=c[e+8>>2]|0;d=c[e+24>>2]|0;e=ve(d+1|0)|0;a[e+d|0]=0;if((ra(e|0,d|0,1,f|0)|0)==1){ih(h,e,d,1);c[b+0>>2]=c[h+0>>2];c[b+4>>2]=c[h+4>>2];c[b+8>>2]=c[h+8>>2];c[b+12>>2]=c[h+12>>2];j=0;i=g;return j|0}else{gi(e);j=0;i=g;return j|0}return 0}function Ug(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f;if((b|0)!=2){Dd(e,6360,0);h=-1;i=f;return h|0}if((c[d>>2]&511|0)!=7){Dd(e,11200,0);h=-2;i=f;return h|0}if((c[d+16>>2]&255|0)==3){b=c[d+24>>2]|0;zc(g,(ab(c[b+8>>2]|0,c[b+12>>2]|0,1,c[d+8>>2]|0)|0)==1|0);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];h=0;i=f;return h|0}else{Dd(e,9584,0);h=-2;i=f;return h|0}return 0}function Vg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,8304,0);h=-1;i=f;return h|0}if((c[d>>2]&511|0)==7){zc(g,(Kb(c[d+8>>2]|0)|0)==0|0);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];h=0;i=f;return h|0}else{Dd(e,11360,0);h=-2;i=f;return h|0}return 0}function Wg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);h=-1;i=f;return h|0}if((c[d>>2]&511|0)==7){Ac(g,Ka(c[d+8>>2]|0)|0);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];h=0;i=f;return h|0}else{Dd(e,11168,0);h=-2;i=f;return h|0}return 0}function Xg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;i=i+16|0;g=f;if((b|0)!=3){Dd(e,10456,0);h=-1;i=f;return h|0}if((c[d>>2]&511|0)!=7){Dd(e,11200,0);h=-2;i=f;return h|0}if((c[d+16>>2]&767|0)!=2){Dd(e,6232,0);h=-2;i=f;return h|0}if((c[d+32>>2]&255|0)!=3){Dd(e,11240,0);h=-2;i=f;return h|0}b=c[d+8>>2]|0;j=c[d+24>>2]|0;k=c[(c[d+40>>2]|0)+8>>2]|0;do{if((ui(k,11280)|0)==0){l=0}else{if((ui(k,11288)|0)==0){l=1;break}if((ui(k,11296)|0)==0){l=2;break}Dd(e,11304,0);h=-3;i=f;return h|0}}while(0);zc(g,(qb(b|0,j|0,l|0)|0)==0|0);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];h=0;i=f;return h|0}function Yg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);h=-1;i=f;return h|0}if((c[d>>2]&511|0)==7){zc(g,(Sb(c[d+8>>2]|0)|0)!=0|0);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];h=0;i=f;return h|0}else{Dd(e,11168,0);h=-2;i=f;return h|0}return 0}function Zg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f;if((b|0)!=1){Dd(e,6040,0);h=-1;i=f;return h|0}if((c[d>>2]&255|0)==3){zc(g,(ob(c[(c[d+8>>2]|0)+8>>2]|0)|0)==0|0);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];h=0;i=f;return h|0}else{Dd(e,11136,0);h=-2;i=f;return h|0}return 0}function _g(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f;if((b|0)!=2){Dd(e,6360,0);h=-1;i=f;return h|0}do{if((c[d>>2]&255|0)==3){if((c[d+16>>2]&255|0)!=3){break}zc(g,(xa(c[(c[d+8>>2]|0)+8>>2]|0,c[(c[d+24>>2]|0)+8>>2]|0)|0)==0|0);c[a+0>>2]=c[g+0>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];h=0;i=f;return h|0}}while(0);Dd(e,11104,0);h=-2;i=f;return h|0}function $g(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=i;i=i+16|0;d=e;b=Oa()|0;if((b|0)==0){i=e;return 0}Cc(d,b);c[a+0>>2]=c[d+0>>2];c[a+4>>2]=c[d+4>>2];c[a+8>>2]=c[d+8>>2];c[a+12>>2]=c[d+12>>2];i=e;return 0}function ah(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+32|0;h=g+24|0;j=g+16|0;k=g;if((d|0)!=1){Dd(f,6040,0);l=-1;i=g;return l|0}if((c[e>>2]&255|0)!=3){Dd(f,10992,0);l=-2;i=g;return l|0}d=c[(c[e+8>>2]|0)+8>>2]|0;e=Db(d|0,11032)|0;if((e|0)==0){c[h>>2]=d;c[h+4>>2]=Wb(c[(Tb()|0)>>2]|0)|0;Dd(f,11040,h);l=-3;i=g;return l|0}qb(e|0,0,2)|0;h=Ka(e|0)|0;qb(e|0,0,0)|0;m=ve(h+1|0)|0;if((ra(m|0,h|0,1,e|0)|0)==1){a[m+h|0]=0;ih(k,m,h,1);c[b+0>>2]=c[k+0>>2];c[b+4>>2]=c[k+4>>2];c[b+8>>2]=c[k+8>>2];c[b+12>>2]=c[k+12>>2];n=0}else{c[j>>2]=d;c[j+4>>2]=Wb(c[(Tb()|0)>>2]|0)|0;Dd(f,11072,j);gi(m);n=-4}sb(e|0)|0;l=n;i=g;return l|0}function bh(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=i;i=i+16|0;f=e;g=16;h=ve(16)|0;j=0;while(1){k=xb(d|0)|0;if((k|0)==10){break}else if((k|0)==-1){l=6;break}m=j+1|0;if(m>>>0<g>>>0){n=g;o=h}else{p=g<<1;n=p;o=xe(h,p)|0}a[o+j|0]=k;g=n;h=o;j=m}do{if((l|0)==6){if((j|0)!=0){break}gi(h);c[b+0>>2]=c[8>>2];c[b+4>>2]=c[12>>2];c[b+8>>2]=c[16>>2];c[b+12>>2]=c[20>>2];i=e;return}}while(0);a[h+j|0]=0;ih(f,h,j,1);c[b+0>>2]=c[f+0>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];i=e;return}function ch(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;f=b+12|0;g=d+12|0;h=(c[g>>2]|0)+(c[f>>2]|0)|0;j=ve(h+1|0)|0;Ei(j|0,c[b+8>>2]|0,c[f>>2]|0)|0;Ei(j+(c[f>>2]|0)|0,c[d+8>>2]|0,c[g>>2]|0)|0;a[j+h|0]=0;g=wc(11520)|0;c[g+16>>2]=1;c[g+12>>2]=h;c[g+8>>2]=j;c[g+20>>2]=0;i=e;return g|0}function dh(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0;d=i;e=eh(a,b,-1,c,0,0)|0;i=d;return e|0}function eh(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,ta=0,ua=0,va=0,wa=0,xa=0.0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Sa=0,Ta=0,Ua=0,Va=0.0,Wa=0,Xa=0.0,Ya=0.0,Za=0,_a=0.0,$a=0,ab=0.0,bb=0,cb=0,db=0,fb=0,gb=0,hb=0,ib=0,jb=0,kb=0,lb=0,mb=0,nb=0,ob=0,pb=0,qb=0,rb=0,sb=0,tb=0,ub=0,vb=0,wb=0,xb=0,yb=0,zb=0,Bb=0,Cb=0,Db=0,Eb=0,Fb=0,Gb=0,Hb=0,Ib=0,Jb=0,Kb=0,Lb=0,Mb=0,Nb=0,Ob=0,Pb=0,Qb=0,Rb=0,Sb=0,Tb=0,Ub=0,Vb=0,Wb=0;k=i;i=i+16|0;l=k;m=k+12|0;n=k+8|0;c[m>>2]=0;c[n>>2]=16;o=(g|0)==0;g=(e|0)<0;p=(e|0)>-1;q=ve(16)|0;r=0;s=b;t=b;a:while(1){b=a[t]|0;if(b<<24>>24==0){u=254;break}else if(!(b<<24>>24==37)){t=t+1|0;s=s;r=r;q=q;continue}if(t>>>0>s>>>0){b=t-s|0;v=c[n>>2]|0;w=c[m>>2]|0;y=w+b|0;if(v>>>0<y>>>0){z=v;do{z=z<<1;}while(z>>>0<y>>>0);c[n>>2]=z;y=xe(q,z)|0;A=y;B=c[m>>2]|0}else{A=q;B=w}Ei(A+B|0,s|0,b|0)|0;c[m>>2]=(c[m>>2]|0)+b;C=A}else{C=q}y=t+1|0;v=(a[y]|0)==35;D=v?32:0;E=v?t+2|0:y;y=a[E]|0;if(y<<24>>24==32){F=D|8;G=E+1|0}else if(y<<24>>24==43){F=D|4;G=E+1|0}else{F=D;G=E}E=a[G]|0;if(E<<24>>24==48){D=G+1|0;H=a[D]|0;I=F|1;J=D}else{H=E;I=F;J=G}E=H<<24>>24;do{if((E+ -48|0)>>>0<10){D=E;y=J;v=0;while(1){K=y+1|0;L=(v*10|0)+ -48+D|0;M=a[K]|0;if((M+ -48|0)>>>0<10){v=L;y=K;D=M}else{N=L;O=r;P=K;break}}}else{if(!(H<<24>>24==42)){N=-1;O=r;P=J;break}D=J+1|0;if(o){N=c[c[f+(r<<2)>>2]>>2]|0;O=r+1|0;P=D;break}if(!(g|(r|0)<(e|0))){u=18;break a}Q=r+1|0;S=c[f+(r<<4)>>2]|0;if((S&255|0)!=2){u=20;break a}if((S&512|0)!=0){u=22;break a}N=c[f+(r<<4)+8>>2]|0;O=Q;P=D}}while(0);b:do{if((a[P]|0)==46){E=P+1|0;b=a[E]|0;if(b<<24>>24==43){w=P+2|0;T=I|16;U=a[w]|0;V=w}else{T=I;U=b;V=E}E=U<<24>>24;if((E+ -48|0)>>>0<10){b=0;w=E;E=V;while(1){z=E+1|0;D=(b*10|0)+ -48+w|0;y=a[z]|0;if((y+ -48|0)>>>0<10){E=z;w=y;b=D}else{W=O;X=D;Y=T;Z=z;break b}}}if(!(U<<24>>24==42)){W=O;X=0;Y=T;Z=V;break}b=V+1|0;if(o){W=O+1|0;X=c[c[f+(O<<2)>>2]>>2]|0;Y=T;Z=b;break}if(!(g|(O|0)<(e|0))){u=33;break a}_=O+1|0;$=c[f+(O<<4)>>2]|0;if(($&255|0)!=2){u=35;break a}if(($&512|0)!=0){u=37;break a}W=_;X=c[f+(O<<4)+8>>2]|0;Y=T;Z=b}else{W=O;X=-1;Y=I;Z=P}}while(0);b=Z+1|0;w=a[Z]|0;if(p){if(!((W|0)<(e|0)|w<<24>>24==37)){u=42;break}}aa=w<<24>>24;switch(aa|0){case 37:{E=c[n>>2]|0;z=c[m>>2]|0;D=z+1|0;if(E>>>0<D>>>0){y=E;do{y=y<<1;}while(y>>>0<D>>>0);c[n>>2]=y;D=xe(C,y)|0;ba=D;da=c[m>>2]|0}else{ba=C;da=z}a[ba+da|0]=37;c[m>>2]=(c[m>>2]|0)+1;q=ba;r=W;s=b;t=b;continue a;break};case 115:{if(o){D=c[f+(W<<2)>>2]|0;ea=W+1|0;fa=Bi(D|0)|0;ga=D}else{ha=W+1|0;ia=c[f+(W<<4)>>2]|0;if((ia&255|0)!=3){u=50;break a}D=c[f+(W<<4)+8>>2]|0;ea=ha;fa=c[D+12>>2]|0;ga=c[D+8>>2]|0}D=(X|0)>-1&X>>>0<fa>>>0?X:fa;do{if((N|0)>-1&N>>>0>D>>>0){E=N-D|0;v=c[n>>2]|0;K=(c[m>>2]|0)+E|0;if(v>>>0<K>>>0){L=v;do{L=L<<1;}while(L>>>0<K>>>0);c[n>>2]=L;ja=xe(C,L)|0}else{ja=C}if((N|0)==(D|0)){ka=ja;break}else{la=E}while(1){K=la+ -1|0;v=c[m>>2]|0;c[m>>2]=v+1;a[ja+v|0]=32;if((K|0)==0){ka=ja;break}else{la=K}}}else{ka=C}}while(0);z=c[n>>2]|0;y=c[m>>2]|0;E=y+D|0;if(z>>>0<E>>>0){L=z;do{L=L<<1;}while(L>>>0<E>>>0);c[n>>2]=L;E=xe(ka,L)|0;ma=E;na=c[m>>2]|0}else{ma=ka;na=y}Ei(ma+na|0,ga|0,D|0)|0;c[m>>2]=(c[m>>2]|0)+D;q=ma;r=ea;s=b;t=b;continue a;break};case 98:{oa=2;break};case 111:{oa=8;break};case 88:case 120:{oa=16;break};case 117:case 100:case 105:{oa=10;break};case 99:{if(o){pa=W+1|0;qa=c[f+(W<<2)>>2]|0}else{ra=W+1|0;ta=c[f+(W<<4)>>2]|0;if((ta&255|0)!=2){u=141;break a}if((ta&512|0)!=0){u=143;break a}pa=ra;qa=f+(W<<4)+8|0}E=c[qa>>2]&255;z=(N|0)>1;K=z?N:1;v=c[n>>2]|0;M=(c[m>>2]|0)+K|0;if(v>>>0<M>>>0){ua=v;do{ua=ua<<1;}while(ua>>>0<M>>>0);c[n>>2]=ua;va=xe(C,ua)|0}else{va=C}if(z){M=K;do{M=M+ -1|0;D=c[m>>2]|0;c[m>>2]=D+1;a[va+D|0]=32;}while((M|0)>1)}M=c[m>>2]|0;c[m>>2]=M+1;a[va+M|0]=E;q=va;r=pa;s=b;t=b;continue a;break};case 102:case 70:{do{if(o){wa=W+1|0;xa=+h[c[f+(W<<2)>>2]>>3]}else{ya=W+1|0;za=c[f+(W<<4)>>2]|0;if((za&255|0)!=2){u=154;break a}if((za&512|0)==0){wa=ya;xa=+(c[f+(W<<4)+8>>2]|0);break}else{wa=ya;xa=+h[f+(W<<4)+8>>3];break}}}while(0);E=w<<24>>24==70?Y|64:Y;do{if(1.0/xa==-x){Aa=E|2}else{M=xa!=xa|0.0!=0.0;K=xa==x;z=xa==-x;if(!(M|K|z)){Aa=E;break}if(M){M=(E&64|0)!=0?11560:11568;ua=(N|0)<0?0:N;do{if(ua>>>0>3){D=ua+ -3|0;y=c[n>>2]|0;L=(c[m>>2]|0)+D|0;if(y>>>0<L>>>0){v=y;do{v=v<<1;}while(v>>>0<L>>>0);c[n>>2]=v;L=xe(C,v)|0;if((ua|0)==3){Ba=L;break}else{Ca=L}}else{Ca=C}L=D;while(1){y=L+ -1|0;Da=c[m>>2]|0;c[m>>2]=Da+1;a[Ca+Da|0]=32;if((y|0)==0){Ba=Ca;break}else{L=y}}}else{Ba=C}}while(0);ua=c[n>>2]|0;L=c[m>>2]|0;D=L+3|0;if(ua>>>0<D>>>0){v=ua;do{v=v<<1;}while(v>>>0<D>>>0);c[n>>2]=v;D=xe(Ba,v)|0;Ea=D;Fa=c[m>>2]|0}else{Ea=Ba;Fa=L}D=Ea+Fa|0;a[D+0|0]=a[M+0|0]|0;a[D+1|0]=a[M+1|0]|0;a[D+2|0]=a[M+2|0]|0;c[m>>2]=(c[m>>2]|0)+3;q=Ea;r=wa;s=b;t=b;continue a}if(!K){if(!z){q=C;r=wa;s=b;t=b;continue a}D=(E&64|0)!=0;ua=(N|0)<0?0:N;do{if(ua>>>0>4){y=ua+ -4|0;Da=c[n>>2]|0;Ga=(c[m>>2]|0)+y|0;if(Da>>>0<Ga>>>0){Ha=Da;do{Ha=Ha<<1;}while(Ha>>>0<Ga>>>0);c[n>>2]=Ha;Ga=xe(C,Ha)|0;if((ua|0)==4){Ia=Ga;break}else{Ja=Ga}}else{Ja=C}Ga=y;while(1){Da=Ga+ -1|0;Ka=c[m>>2]|0;c[m>>2]=Ka+1;a[Ja+Ka|0]=32;if((Da|0)==0){Ia=Ja;break}else{Ga=Da}}}else{Ia=C}}while(0);ua=c[n>>2]|0;z=c[m>>2]|0;K=z+4|0;if(ua>>>0<K>>>0){M=ua;do{M=M<<1;}while(M>>>0<K>>>0);c[n>>2]=M;K=xe(Ia,M)|0;La=K;Ma=c[m>>2]|0}else{La=Ia;Ma=z}K=La+Ma|0;ua=D?1179535661:1718511917;a[K]=ua;a[K+1|0]=ua>>8;a[K+2|0]=ua>>16;a[K+3|0]=ua>>24;c[m>>2]=(c[m>>2]|0)+4;q=La;r=wa;s=b;t=b;continue a}do{if((E&4|0)==0){ua=(E&64|0)!=0;if((E&8|0)==0){Na=ua?11608:11616;break}else{Na=ua?11592:11600;break}}else{Na=(E&64|0)!=0?11576:11584}}while(0);D=Bi(Na|0)|0;z=(N|0)<0?0:N;do{if(z>>>0>D>>>0){M=z-D|0;ua=c[n>>2]|0;K=(c[m>>2]|0)+M|0;if(ua>>>0<K>>>0){L=ua;do{L=L<<1;}while(L>>>0<K>>>0);c[n>>2]=L;Oa=xe(C,L)|0}else{Oa=C}if((z|0)==(D|0)){Pa=Oa;break}else{Qa=M}while(1){K=Qa+ -1|0;ua=c[m>>2]|0;c[m>>2]=ua+1;a[Oa+ua|0]=32;if((K|0)==0){Pa=Oa;break}else{Qa=K}}}else{Pa=C}}while(0);z=c[n>>2]|0;M=c[m>>2]|0;L=M+D|0;if(z>>>0<L>>>0){K=z;do{K=K<<1;}while(K>>>0<L>>>0);c[n>>2]=K;L=xe(Pa,K)|0;Sa=L;Ta=c[m>>2]|0}else{Sa=Pa;Ta=M}Ei(Sa+Ta|0,Na|0,D|0)|0;c[m>>2]=(c[m>>2]|0)+D;q=Sa;r=wa;s=b;t=b;continue a}}while(0);if(xa<0.0){Ua=Aa|2;Va=-xa}else{Ua=Aa;Va=xa}if(!(Va>=1.0)){Wa=1}else{Wa=~~(+ca(+(+sa(+Va)))+1.0)>>>0}E=(X|0)<0?15:X;L=E+3+Wa|0;z=(N|0)>-1;ua=z&N>>>0>L>>>0?N:L;L=ve(ua)|0;v=L+ua|0;Xa=+Ra(+Va,l|0);if((E|0)>0){Ya=Xa;Ga=0;do{Ya=Ya*10.0;Ga=Ga+1|0;}while((Ga|0)!=(E|0));Ga=v;Xa=+R(+(Ya+.5));y=0;do{Ga=Ga+ -1|0;a[Ga]=~~+eb(+Xa,10.0)+48;Xa=Xa/10.0;y=y+1|0;}while((y|0)!=(E|0));y=L+(ua+~E)|0;a[y]=46;Za=y;_a=Xa+ +h[l>>3]}else{Za=v;_a=+R(+(Va+.5))}h[l>>3]=_a;Ya=_a;y=Za;while(1){$a=y+ -1|0;a[$a]=~~+eb(+Ya,10.0)+48;ab=+h[l>>3]/10.0;h[l>>3]=ab;if(!(ab>=1.0)){break}else{y=$a;Ya=ab}}do{if((Ua&1|0)==0){do{if((Ua&2|0)==0){if((Ua&4|0)!=0){E=y+ -2|0;a[E]=43;bb=E;break}if((Ua&8|0)==0){bb=$a;break}E=y+ -2|0;a[E]=32;bb=E}else{E=y+ -2|0;a[E]=45;bb=E}}while(0);D=v;if(!z){cb=bb;break}if((D-bb|0)<(N|0)){db=bb}else{cb=bb;break}while(1){M=db+ -1|0;a[M]=32;if((D-M|0)<(N|0)){db=M}else{cb=M;break}}}else{do{if(z){D=v+1|0;if((D-$a|0)<(N|0)){fb=$a}else{gb=$a;break}while(1){M=fb+ -1|0;a[M]=48;if((D-M|0)<(N|0)){fb=M}else{gb=M;break}}}else{gb=$a}}while(0);if((Ua&2|0)!=0){D=gb+ -1|0;a[D]=45;cb=D;break}if((Ua&4|0)!=0){D=gb+ -1|0;a[D]=43;cb=D;break}D=gb+ -1|0;if((Ua&8|0)==0){a[D]=48;cb=D;break}else{a[D]=32;cb=D;break}}}while(0);z=v-cb|0;y=c[n>>2]|0;D=c[m>>2]|0;M=D+z|0;if(y>>>0<M>>>0){K=y;do{K=K<<1;}while(K>>>0<M>>>0);c[n>>2]=K;M=xe(C,K)|0;hb=M;ib=c[m>>2]|0}else{hb=C;ib=D}Ei(hb+ib|0,cb|0,z|0)|0;c[m>>2]=(c[m>>2]|0)+z;gi(L);q=hb;r=wa;s=b;t=b;continue a;break};case 66:{if(o){jb=W+1|0;kb=c[f+(W<<2)>>2]|0}else{lb=W+1|0;mb=c[f+(W<<4)>>2]|0;if((mb&255|0)!=1){u=238;break a}jb=lb;kb=f+(W<<4)+8|0}M=(c[kb>>2]|0)!=0?11544:11552;v=Bi(M|0)|0;y=(X|0)>-1&X>>>0<v>>>0?X:v;do{if((N|0)>-1&N>>>0>y>>>0){v=N-y|0;E=c[n>>2]|0;ua=(c[m>>2]|0)+v|0;if(E>>>0<ua>>>0){Ga=E;do{Ga=Ga<<1;}while(Ga>>>0<ua>>>0);c[n>>2]=Ga;nb=xe(C,Ga)|0}else{nb=C}if((N|0)==(y|0)){ob=nb;break}else{pb=v}while(1){ua=pb+ -1|0;E=c[m>>2]|0;c[m>>2]=E+1;a[nb+E|0]=32;if((ua|0)==0){ob=nb;break}else{pb=ua}}}else{ob=C}}while(0);L=c[n>>2]|0;z=c[m>>2]|0;D=z+y|0;if(L>>>0<D>>>0){K=L;do{K=K<<1;}while(K>>>0<D>>>0);c[n>>2]=K;D=xe(ob,K)|0;qb=D;rb=c[m>>2]|0}else{qb=ob;rb=z}Ei(qb+rb|0,M|0,y|0)|0;c[m>>2]=(c[m>>2]|0)+y;q=qb;r=jb;s=b;t=b;continue a;break};default:{u=251;break a}}do{if(o){sb=W+1|0;tb=c[c[f+(W<<2)>>2]>>2]|0}else{ub=W+1|0;vb=c[f+(W<<4)>>2]|0;if((vb&255|0)!=2){u=68;break a}if((vb&512|0)==0){sb=ub;tb=c[f+(W<<4)+8>>2]|0;break}else{sb=ub;tb=~~+h[f+(W<<4)+8>>3];break}}}while(0);do{if(w<<24>>24==100|w<<24>>24==105){if((tb|0)>=0){wb=Y;xb=tb;break}wb=Y|2;xb=0-tb|0}else{wb=Y;xb=tb}}while(0);y=w<<24>>24==88?wb|64:wb;M=(N|0)>-1&N>>>0>35?N:35;z=ve(M)|0;K=z+M|0;M=y&64;if((oa|0)==8){yb=11632}else if((oa|0)==10){yb=11648}else if((oa|0)==16){yb=(M|0)!=0?11664:11688}else if((oa|0)==2){yb=11624}else{u=80;break}D=xb;L=K;while(1){zb=L+ -1|0;a[zb]=a[yb+((D>>>0)%(oa>>>0)|0)|0]|0;v=(D>>>0)/(oa>>>0)|0;if((v|0)==0){break}else{L=zb;D=v}}do{if((y&2|0)==0){if((y&4|0)!=0){Bb=43;break}Bb=(y&8|0)==0?0:32}else{Bb=45}}while(0);c:do{if((y&1|0)==0){if(Bb<<24>>24==0){Cb=zb}else{D=L+ -2|0;a[D]=Bb;Cb=D}do{if((y&32|0)==0){Db=Cb}else{if((oa|0)==10){Db=Cb;break}else if((oa|0)==2){a[Cb+ -1|0]=98;D=Cb+ -2|0;a[D]=48;Db=D;break}else if((oa|0)==8){D=Cb+ -1|0;a[D]=48;Db=D;break}else if((oa|0)==16){a[Cb+ -1|0]=M>>>1^120;D=Cb+ -2|0;a[D]=48;Db=D;break}else{u=133;break a}}}while(0);D=K;if((D-Db|0)<(N|0)){Eb=Db}else{Fb=Db;break}while(1){w=Eb+ -1|0;a[w]=32;if((D-w|0)<(N|0)){Eb=w}else{Fb=w;break}}}else{D=K;d:do{if((oa|0)==2){w=zb;while(1){v=D-w|0;if((v+3|0)>=(N|0)){Gb=v;Hb=w;break d}v=w+ -1|0;a[v]=48;w=v}}else{w=zb;while(1){v=D-w|0;Ga=v+1|0;if((oa|0)==8){Ib=1}else if((oa|0)==10){Ib=0}else if((oa|0)==16|(oa|0)==2){Ib=2}else{u=93;break a}if((Ga+Ib|0)>=(N|0)){Gb=v;Hb=w;break d}v=w+ -1|0;a[v]=48;w=v}}}while(0);do{if(Bb<<24>>24==0){if((oa|0)==8){Jb=1}else if((oa|0)==10){Jb=0}else if((oa|0)==16|(oa|0)==2){Jb=2}else{u=101;break a}if((Jb+Gb|0)>=(N|0)){Kb=Hb;break}w=Hb+ -1|0;a[w]=48;Kb=w}else{w=Hb+ -1|0;a[w]=Bb;Kb=w}}while(0);if((y&32|0)!=0){if((oa|0)==2){a[Kb+ -1|0]=98;w=Kb+ -2|0;a[w]=48;Fb=w;break}else if((oa|0)==8){w=Kb+ -1|0;a[w]=48;Fb=w;break}else if((oa|0)==16){a[Kb+ -1|0]=M>>>1^120;w=Kb+ -2|0;a[w]=48;Fb=w;break}else if((oa|0)==10){Fb=Kb;break}else{u=118;break a}}if((oa|0)==2){if((D-Kb|0)<(N|0)){w=Kb+ -1|0;a[w]=48;Lb=w}else{Lb=Kb}if((D-Lb|0)>=(N|0)){Fb=Lb;break}w=Lb+ -1|0;a[w]=48;Fb=w;break}else if((oa|0)==8){if((D-Kb|0)>=(N|0)){Fb=Kb;break}w=Kb+ -1|0;a[w]=48;Fb=w;break}else if((oa|0)==16){if((D-Kb|0)<(N|0)){w=Kb+ -1|0;a[w]=48;Mb=w}else{Mb=Kb}if((D-Mb|0)>=(N|0)){Fb=Mb;break}w=Mb+ -1|0;a[w]=48;Fb=w;break}else if((oa|0)==10){Fb=Kb;break}else{w=Kb;v=0;while(1){if(!((oa|0)==16|(oa|0)==2)){u=120;break a}if((v|0)>=2){Fb=w;break c}if((D-w|0)<(N|0)){Ga=w+ -1|0;a[Ga]=48;Nb=Ga}else{Nb=w}w=Nb;v=v+1|0}}}}while(0);M=K-Fb|0;y=c[n>>2]|0;L=c[m>>2]|0;v=L+M|0;if(y>>>0<v>>>0){w=y;do{w=w<<1;}while(w>>>0<v>>>0);c[n>>2]=w;v=xe(C,w)|0;Ob=v;Pb=c[m>>2]|0}else{Ob=C;Pb=L}Ei(Ob+Pb|0,Fb|0,M|0)|0;c[m>>2]=(c[m>>2]|0)+M;gi(z);q=Ob;r=sb;s=b;t=b}if((u|0)==18){jh(j,3,r,l);gi(C);Qb=0;i=k;return Qb|0}else if((u|0)==20){c[l>>2]=2;c[l+4>>2]=S;jh(j,0,Q,l);gi(C);Qb=0;i=k;return Qb|0}else if((u|0)==22){jh(j,1,Q,l);gi(C);Qb=0;i=k;return Qb|0}else if((u|0)==33){jh(j,3,O,l);gi(C);Qb=0;i=k;return Qb|0}else if((u|0)==35){c[l>>2]=2;c[l+4>>2]=$;jh(j,0,_,l);gi(C);Qb=0;i=k;return Qb|0}else if((u|0)==37){jh(j,1,_,l);gi(C);Qb=0;i=k;return Qb|0}else if((u|0)==42){jh(j,3,W,l);gi(C);Qb=0;i=k;return Qb|0}else if((u|0)==50){c[l>>2]=259;c[l+4>>2]=ia;jh(j,0,ha,l)}else if((u|0)==68){c[l>>2]=2;c[l+4>>2]=vb;jh(j,0,ub,l)}else if((u|0)==80){Ab()}else if((u|0)==93){Ab()}else if((u|0)==101){Ab()}else if((u|0)==118){Ab()}else if((u|0)==120){Ab()}else if((u|0)==133){Ab()}else if((u|0)==141){c[l>>2]=2;c[l+4>>2]=ta;jh(j,0,ra,l)}else if((u|0)==143){jh(j,1,ra,l)}else if((u|0)==154){c[l>>2]=2;c[l+4>>2]=za;jh(j,0,ya,l)}else if((u|0)==238){c[l>>2]=1;c[l+4>>2]=mb;jh(j,0,lb,l)}else if((u|0)==251){c[l>>2]=aa;jh(j,2,W+1|0,l)}else if((u|0)==254){if(t>>>0>s>>>0){u=t-s|0;t=c[n>>2]|0;l=c[m>>2]|0;W=l+u|0;if(t>>>0<W>>>0){j=t;do{j=j<<1;}while(j>>>0<W>>>0);c[n>>2]=j;W=xe(q,j)|0;Rb=W;Sb=c[m>>2]|0}else{Rb=q;Sb=l}Ei(Rb+Sb|0,s|0,u|0)|0;s=(c[m>>2]|0)+u|0;c[m>>2]=s;Tb=s;Ub=Rb}else{Tb=c[m>>2]|0;Ub=q}q=c[n>>2]|0;Rb=Tb+1|0;if(q>>>0<Rb>>>0){s=q;do{s=s<<1;}while(s>>>0<Rb>>>0);c[n>>2]=s;n=xe(Ub,s)|0;Vb=n;Wb=c[m>>2]|0}else{Vb=Ub;Wb=Tb}a[Vb+Wb|0]=0;if((d|0)==0){Qb=Vb;i=k;return Qb|0}c[d>>2]=c[m>>2];Qb=Vb;i=k;return Qb|0}gi(C);Qb=0;i=k;return Qb|0}function fh(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;i=i+16|0;g=f;h=eh(c[a+8>>2]|0,g,b,d,1,e)|0;if((h|0)==0){j=0;i=f;return j|0}e=c[g>>2]|0;g=wc(11520)|0;c[g+16>>2]=1;c[g+12>>2]=e;c[g+8>>2]=h;c[g+20>>2]=0;j=g;i=f;return j|0}function gh(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=i;f=Bi(d|0)|0;g=ve(f+1|0)|0;Ei(g|0,d|0,f|0)|0;a[g+f|0]=0;d=wc(11520)|0;c[d+16>>2]=1;c[d+12>>2]=f;c[d+8>>2]=g;c[d+20>>2]=0;c[b>>2]=259;c[b+8>>2]=d;i=e;return}function hh(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;e=Bi(b|0)|0;f=wc(11520)|0;c[f+16>>2]=0;c[f+12>>2]=e;c[f+8>>2]=b;c[f+20>>2]=0;c[a>>2]=259;c[a+8>>2]=f;i=d;return}function ih(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;g=wc(11520)|0;c[g+16>>2]=e;c[g+12>>2]=d;c[g+8>>2]=b;c[g+20>>2]=0;c[a>>2]=259;c[a+8>>2]=g;i=f;return}function jh(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+64|0;g=f+12|0;h=f+24|0;j=f+40|0;k=f+52|0;l=f+8|0;m=f;n=f+16|0;c[g>>2]=d;if((a|0)==0){i=f;return}c[h>>2]=e;if((b|0)==3){c[n>>2]=g;c[a>>2]=eh(11888,0,-1,n,0,0)|0}else if((b|0)==0){n=c[h>>2]|0;e=c[n>>2]|0;c[h>>2]=n+4;n=c[h>>2]|0;d=c[n>>2]|0;c[h>>2]=n+4;c[j>>2]=g;c[j+4>>2]=Qc(e)|0;c[j+8>>2]=Qc(d)|0;c[a>>2]=eh(11712,0,-1,j,0,0)|0}else if((b|0)==2){j=c[h>>2]|0;d=c[j>>2]|0;c[h>>2]=j+4;c[l>>2]=d;c[m>>2]=l;c[m+4>>2]=g;c[a>>2]=eh(11840,0,-1,m,0,0)|0}else if((b|0)==1){c[k>>2]=g;c[a>>2]=eh(11768,0,-1,k,0,0)|0}i=f;return}function kh(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;e=(ui(c[a+8>>2]|0,c[b+8>>2]|0)|0)==0|0;i=d;return e|0}function lh(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;e=ui(c[a+8>>2]|0,c[b+8>>2]|0)|0;i=d;return e|0}function mh(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a+20|0;if((c[d>>2]|0)==0){e=Kc(c[a+8>>2]|0,c[a+12>>2]|0)|0;c[a+24>>2]=e;c[d>>2]=1;f=e;i=b;return f|0}else{f=c[a+24>>2]|0;i=b;return f|0}return 0}function nh(a){a=a|0;var b=0;b=i;if((c[a+16>>2]|0)==0){i=b;return}gi(c[a+8>>2]|0);i=b;return}function oh(){var a=0,b=0,d=0,e=0,f=0,g=0;a=i;i=i+48|0;b=a+32|0;d=a+16|0;e=a;f=ve(88)|0;c[f+8>>2]=0;c[f>>2]=0;c[f+4>>2]=0;c[f+12>>2]=Pd()|0;c[f+16>>2]=Pd()|0;g=f+24|0;hh(b,11912);c[g+0>>2]=c[b+0>>2];c[g+4>>2]=c[b+4>>2];c[g+8>>2]=c[b+8>>2];c[g+12>>2]=c[b+12>>2];b=f+40|0;hh(d,11920);c[b+0>>2]=c[d+0>>2];c[b+4>>2]=c[d+4>>2];c[b+8>>2]=c[d+8>>2];c[b+12>>2]=c[d+12>>2];d=f+56|0;hh(e,11928);c[d+0>>2]=c[e+0>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];c[d+12>>2]=c[e+12>>2];c[f+72>>2]=0;c[f+76>>2]=0;c[f+80>>2]=0;i=a;return f|0}function ph(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;b=i;d=c[a>>2]|0;do{if((d|0)==0){e=0}else{f=a+4|0;g=c[f>>2]|0;if(g>>>0>d>>>0){h=g}else{e=d;break}while(1){g=c[h+ -32>>2]|0;j=0-g|0;do{if((j|0)<-1){Fc(h+(j<<5)|0);k=1-g|0;if((k|0)==-1){break}else{l=k}do{Fc((c[f>>2]|0)+(l<<5)|0);l=l+1|0;}while(!((l|0)==-1))}}while(0);g=c[h+ -4>>2]|0;if((g|0)!=0){yc(g)}g=(c[f>>2]|0)+(j<<5)|0;c[f>>2]=g;k=c[a>>2]|0;if(g>>>0>k>>>0){h=g}else{e=k;break}}}}while(0);gi(e);yc(c[a+12>>2]|0);yc(c[a+16>>2]|0);Fc(a+24|0);Fc(a+40|0);Fc(a+56|0);gi(c[a+72>>2]|0);gi(a);i=b;return}function qh(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;d=i;e=a+4|0;f=c[e>>2]|0;if((f|0)==0){c[b>>2]=0;g=0;i=d;return g|0}h=c[a>>2]|0;if(f>>>0>h>>>0){j=0;k=f;while(1){f=j+1|0;l=k+(0-(c[k+ -32>>2]|0)<<5)|0;if(l>>>0>h>>>0){k=l;j=f}else{m=f;break}}}else{m=0}j=ve(m<<2)|0;c[b>>2]=m;m=c[e>>2]|0;if(m>>>0>(c[a>>2]|0)>>>0){n=0;o=m}else{g=j;i=d;return g|0}while(1){c[j+(n<<2)>>2]=c[(c[o+ -8>>2]|0)+8>>2];m=o+(0-(c[o+ -32>>2]|0)<<5)|0;if(m>>>0>(c[a>>2]|0)>>>0){o=m;n=n+1|0}else{g=j;break}}i=d;return g|0}function rh(a){a=a|0;i=i;return c[a+12>>2]|0}function sh(a){a=a|0;i=i;return c[a+16>>2]|0}function th(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0.0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,eb=0,fb=0,gb=0,hb=0,ib=0,jb=0,kb=0,lb=0,mb=0,nb=0,ob=0.0,pb=0.0,qb=0.0,rb=0,sb=0.0,tb=0,ub=0,vb=0,wb=0,xb=0,yb=0,zb=0,Ab=0;j=i;i=i+928|0;l=j+48|0;m=j+688|0;n=j+624|0;o=j+828|0;p=j+800|0;q=j+924|0;r=j+784|0;s=j+912|0;t=j+884|0;u=j+336|0;v=j+856|0;w=j+368|0;x=j+640|0;y=j+672|0;z=j+704|0;A=j+736|0;B=j+768|0;C=j+448|0;D=j+464|0;E=j+480|0;F=j+496|0;G=j+512|0;H=j+528|0;I=j+544|0;J=j+16|0;K=j;L=j+608|0;M=j+592|0;N=j+384|0;O=j+836|0;P=j+832|0;Q=j+416|0;R=j+920|0;S=j+752|0;T=j+720|0;U=j+880|0;V=j+656|0;W=j+400|0;X=j+352|0;Y=j+872|0;Z=j+304|0;_=j+576|0;$=j+32|0;aa=j+432|0;ba=j+848|0;ca=j+804|0;ea=j+840|0;fa=j+808|0;ga=j+864|0;ha=j+560|0;ia=j+904|0;ja=b+76|0;if((c[ja>>2]|0)!=0){ka=c[b>>2]|0;do{if((ka|0)!=0){la=b+4|0;ma=c[la>>2]|0;if(ma>>>0>ka>>>0){na=ma}else{break}do{ma=c[na+ -32>>2]|0;oa=0-ma|0;do{if((oa|0)<-1){Fc(na+(oa<<5)|0);pa=1-ma|0;if((pa|0)==-1){break}else{qa=pa}do{Fc((c[la>>2]|0)+(qa<<5)|0);qa=qa+1|0;}while(!((qa|0)==-1))}}while(0);ma=c[na+ -4>>2]|0;if((ma|0)!=0){yc(ma)}na=(c[la>>2]|0)+(oa<<5)|0;c[la>>2]=na;}while(na>>>0>(c[b>>2]|0)>>>0)}}while(0);c[ja>>2]=0}if((c[d+12>>2]|0)!=0){c[ha+0>>2]=c[8>>2];c[ha+4>>2]=c[12>>2];c[ha+8>>2]=c[16>>2];c[ha+12>>2]=c[20>>2];ja=b+8|0;na=c[ja>>2]|0;do{if((na|0)==0){c[ja>>2]=8;ra=256;sa=0;ta=b+4|0;ua=c[b>>2]|0;va=17}else{qa=b+4|0;ka=c[qa>>2]|0;la=c[b>>2]|0;ma=ka-la>>5;pa=ma+1|0;if(na>>>0<pa>>>0){wa=na}else{xa=qa;ya=ka;break}while(1){za=wa<<1;if(za>>>0<pa>>>0){wa=za}else{break}}c[ja>>2]=za;ra=wa<<6;sa=ma;ta=qa;ua=la;va=17}}while(0);if((va|0)==17){wa=xe(ua,ra)|0;c[b>>2]=wa;ra=wa+(sa<<5)|0;c[ta>>2]=ra;xa=b+4|0;ya=ra}c[xa>>2]=ya+32;c[ya>>2]=1;c[ya+4>>2]=0;c[ya+8>>2]=0;c[ya+12>>2]=0;c[ya+16>>2]=0;ya=c[xa>>2]|0;c[ya+ -12>>2]=-1;c[ya+ -8>>2]=d;c[(c[xa>>2]|0)+ -4>>2]=0;ya=dc[c[d+44>>2]&127](ha,f,g,c[b+80>>2]|0)|0;c[ga>>2]=ya;if((ya|0)==0){if((e|0)==0){Fc(ha)}else{c[e+0>>2]=c[ha+0>>2];c[e+4>>2]=c[ha+4>>2];c[e+8>>2]=c[ha+8>>2];c[e+12>>2]=c[ha+12>>2]}ha=c[xa>>2]|0;ya=c[ha+ -32>>2]|0;ra=0-ya|0;do{if((ra|0)<-1){Fc(ha+(ra<<5)|0);ta=1-ya|0;if((ta|0)==-1){break}else{Aa=ta}do{Fc((c[xa>>2]|0)+(Aa<<5)|0);Aa=Aa+1|0;}while(!((Aa|0)==-1))}}while(0);Aa=c[ha+ -4>>2]|0;if((Aa|0)!=0){yc(Aa)}c[xa>>2]=(c[xa>>2]|0)+(ra<<5)}else{c[ia>>2]=c[d+8>>2];c[ia+4>>2]=ga;Ah(b,0,11936,ia)}Ba=c[ga>>2]|0;i=j;return Ba|0}if((c[d+16>>2]|0)!=0){vh(d)}ga=(c[d+44>>2]|0)+16|0;c[fa>>2]=1;c[fa+4>>2]=g;wh(b,d,fa,f);f=b+4|0;fa=t+4|0;d=t+8|0;g=t+12|0;ia=t+16|0;ra=b+8|0;xa=b+80|0;Aa=(e|0)==0;ha=I+8|0;ya=b+12|0;la=V+8|0;qa=b+40|0;ma=W+8|0;ta=Z+16|0;sa=$+8|0;wa=b+56|0;ua=aa+8|0;za=l+16|0;ja=l+32|0;na=ga;a:while(1){Ca=na+4|0;ga=c[na>>2]|0;Da=ga&255;switch(Da|0){case 24:{pa=c[f>>2]|0;ka=pa+(-2-(ga>>>8&255)<<5)|0;Ea=-2-(ga>>>16&255)|0;if((c[pa+(Ea<<5)>>2]&767|0)!=2){va=140;break a}Fa=~c[pa+(Ea<<5)+8>>2];Fc(ka);Ac(D,Fa);c[ka+0>>2]=c[D+0>>2];c[ka+4>>2]=c[D+4>>2];c[ka+8>>2]=c[D+8>>2];c[ka+12>>2]=c[D+12>>2];Ga=Ca;na=Ga;continue a;break};case 26:{ka=c[f>>2]|0;Fa=ka+(-2-(ga>>>8&255)<<5)|0;hh(F,Qc(c[ka+(-2-(ga>>>16&255)<<5)>>2]|0)|0);Fc(Fa);c[Fa+0>>2]=c[F+0>>2];c[Fa+4>>2]=c[F+4>>2];c[Fa+8>>2]=c[F+8>>2];c[Fa+12>>2]=c[F+12>>2];Ga=Ca;na=Ga;continue a;break};case 16:{Fa=c[f>>2]|0;ka=Fa+(-2-(ga>>>8&255)<<5)|0;Ea=-2-(ga>>>16&255)|0;pa=c[Fa+(Ea<<5)>>2]|0;if((pa&255|0)!=2){va=116;break a}if((pa&512|0)==0){pa=0-(c[Fa+(Ea<<5)+8>>2]|0)|0;Fc(ka);Ac(B,pa);c[ka+0>>2]=c[B+0>>2];c[ka+4>>2]=c[B+4>>2];c[ka+8>>2]=c[B+8>>2];c[ka+12>>2]=c[B+12>>2];Ga=Ca;na=Ga;continue a}else{Ha=-+h[Fa+(Ea<<5)+8>>3];Fc(ka);Bc(A,Ha);c[ka+0>>2]=c[A+0>>2];c[ka+4>>2]=c[A+4>>2];c[ka+8>>2]=c[A+8>>2];c[ka+12>>2]=c[A+12>>2];Ga=Ca;na=Ga;continue a}break};case 23:case 22:case 21:case 20:case 19:{ka=c[f>>2]|0;Ea=ka+(-2-(ga>>>8&255)<<5)|0;Fa=-2-(ga>>>16&255)|0;pa=-2-(ga>>>24)|0;if((c[ka+(Fa<<5)>>2]&767|0)!=2){va=131;break a}if((c[ka+(pa<<5)>>2]&767|0)!=2){va=131;break a}Ia=c[ka+(Fa<<5)+8>>2]|0;Fa=c[ka+(pa<<5)+8>>2]|0;switch(Da|0){case 19:{Ja=Fa&Ia;break};case 20:{Ja=Fa|Ia;break};case 21:{Ja=Fa^Ia;break};case 22:{Ja=Ia<<Fa;break};case 23:{Ja=Ia>>Fa;break};default:{Ja=-1}}Fc(Ea);Ac(C,Ja);c[Ea+0>>2]=c[C+0>>2];c[Ea+4>>2]=c[C+4>>2];c[Ea+8>>2]=c[C+8>>2];c[Ea+12>>2]=c[C+12>>2];Ga=Ca;na=Ga;continue a;break};case 15:{Ea=c[f>>2]|0;Fa=Ea+(-2-(ga>>>8&255)<<5)|0;Ia=-2-(ga>>>16&255)|0;pa=-2-(ga>>>24)|0;if((c[Ea+(Ia<<5)>>2]&767|0)!=2){va=113;break a}if((c[Ea+(pa<<5)>>2]&767|0)!=2){va=113;break a}ka=(c[Ea+(Ia<<5)+8>>2]|0)%(c[Ea+(pa<<5)+8>>2]|0)|0;Fc(Fa);Ac(z,ka);c[Fa+0>>2]=c[z+0>>2];c[Fa+4>>2]=c[z+4>>2];c[Fa+8>>2]=c[z+8>>2];c[Fa+12>>2]=c[z+12>>2];Ga=Ca;na=Ga;continue a;break};case 27:{Fa=-2-(ga>>>8&255)|0;ka=c[f>>2]|0;pa=ka+(Fa<<5)|0;Ea=-2-(ga>>>16&255)|0;Ia=-2-(ga>>>24)|0;if((c[ka+(Ea<<5)>>2]&255|0)!=3){va=148;break a}if((c[ka+(Ia<<5)>>2]&255|0)!=3){va=148;break a}Ka=ch(c[ka+(Ea<<5)+8>>2]|0,c[ka+(Ia<<5)+8>>2]|0)|0;Fc(pa);c[pa>>2]=259;c[ka+(Fa<<5)+8>>2]=Ka;Ga=Ca;na=Ga;continue a;break};case 28:{Ka=(c[f>>2]|0)+(-2-(ga>>>8&255)<<5)|0;Fc(Ka);switch(ga>>>16&255|0){case 1:{c[Ka+0>>2]=c[40>>2];c[Ka+4>>2]=c[44>>2];c[Ka+8>>2]=c[48>>2];c[Ka+12>>2]=c[52>>2];Ga=Ca;na=Ga;continue a;break};case 2:{c[Ka+0>>2]=c[24>>2];c[Ka+4>>2]=c[28>>2];c[Ka+8>>2]=c[32>>2];c[Ka+12>>2]=c[36>>2];Ga=Ca;na=Ga;continue a;break};case 3:{Ac(G,c[Ca>>2]|0);c[Ka+0>>2]=c[G+0>>2];c[Ka+4>>2]=c[G+4>>2];c[Ka+8>>2]=c[G+8>>2];c[Ka+12>>2]=c[G+12>>2];na=na+8|0;continue a;break};case 4:{c[k>>2]=c[Ca>>2];c[k+4>>2]=c[Ca+4>>2];Bc(H,+h[k>>3]);c[Ka+0>>2]=c[H+0>>2];c[Ka+4>>2]=c[H+4>>2];c[Ka+8>>2]=c[H+8>>2];c[Ka+12>>2]=c[H+12>>2];na=na+12|0;continue a;break};case 0:{c[Ka+0>>2]=c[8>>2];c[Ka+4>>2]=c[12>>2];c[Ka+8>>2]=c[16>>2];c[Ka+12>>2]=c[20>>2];Ga=Ca;na=Ga;continue a;break};default:{Ga=Ca;na=Ga;continue a}}break};case 25:{Ka=c[f>>2]|0;Fa=Ka+(-2-(ga>>>8&255)<<5)|0;ka=-2-(ga>>>16&255)|0;if((c[Ka+(ka<<5)>>2]&255|0)!=1){va=143;break a}pa=(c[Ka+(ka<<5)+8>>2]|0)==0|0;Fc(Fa);zc(E,pa);c[Fa+0>>2]=c[E+0>>2];c[Fa+4>>2]=c[E+4>>2];c[Fa+8>>2]=c[E+8>>2];c[Fa+12>>2]=c[E+12>>2];Ga=Ca;na=Ga;continue a;break};case 18:case 17:{Fa=-2-(ga>>>8&255)|0;pa=c[f>>2]|0;ka=c[pa+(Fa<<5)>>2]|0;if((ka&255|0)!=2){va=121;break a}Ka=(Da|0)==17;if((ka&512|0)==0){ka=pa+(Fa<<5)+8|0;Ia=c[ka>>2]|0;if(Ka){c[ka>>2]=Ia+1;Ga=Ca;na=Ga;continue a}else{c[ka>>2]=Ia+ -1;Ga=Ca;na=Ga;continue a}}else{Ia=pa+(Fa<<5)+8|0;Ha=+h[Ia>>3];if(Ka){h[Ia>>3]=Ha+1.0;Ga=Ca;na=Ga;continue a}else{h[Ia>>3]=Ha+-1.0;Ga=Ca;na=Ga;continue a}}break};case 29:{Ia=c[f>>2]|0;Ka=Ia+(-2-(ga>>>8&255)<<5)|0;Fa=ga>>>16;pa=c[(c[Ia+ -8>>2]|0)+36>>2]|0;Vc(pa,Fa,I);if((Ae(I)|0)!=0){La=(c[ha>>2]|0)+8|0;Wd(c[ya>>2]|0,c[La>>2]|0,l);if((c[l>>2]&255|0)==0){va=158;break a}c[I+0>>2]=c[l+0>>2];c[I+4>>2]=c[l+4>>2];c[I+8>>2]=c[l+8>>2];c[I+12>>2]=c[l+12>>2];Wc(pa,Fa,I)}Ec(I);Fc(Ka);c[Ka+0>>2]=c[I+0>>2];c[Ka+4>>2]=c[I+4>>2];c[Ka+8>>2]=c[I+8>>2];c[Ka+12>>2]=c[I+12>>2];Ga=Ca;na=Ga;continue a;break};case 30:{Ka=c[f>>2]|0;Fa=Ka+(-2-(ga>>>8&255)<<5)|0;pa=Ka+(-2-(ga>>>16&255)<<5)|0;Ec(pa);Fc(Fa);c[Fa+0>>2]=c[pa+0>>2];c[Fa+4>>2]=c[pa+4>>2];c[Fa+8>>2]=c[pa+8>>2];c[Fa+12>>2]=c[pa+12>>2];Ga=Ca;na=Ga;continue a;break};case 31:{pa=c[f>>2]|0;Fa=pa+ -32|0;Ka=-2-(ga>>>8&255)|0;Ia=pa+(Ka<<5)|0;ka=pa+ -4|0;do{if((c[ka>>2]|0)==0){c[ka>>2]=Tc()|0;Ea=Fa+12|0;Ma=Fa+4|0;b:do{if((c[Ma>>2]|0)>0){Na=0;do{if((Na|0)>=(c[Ea>>2]|0)){break b}$c(c[ka>>2]|0,(c[f>>2]|0)+(-2-Na<<5)|0);Na=Na+1|0;}while((Na|0)<(c[Ma>>2]|0))}}while(0);Ma=pa+ -24|0;if((c[Ma>>2]|0)>0){Oa=0}else{break}do{Ea=c[f>>2]|0;$c(c[ka>>2]|0,Ea+(~Oa-(c[Ea+ -32>>2]|0)+(c[Ea+ -24>>2]|0)<<5)|0);Oa=Oa+1|0;}while((Oa|0)<(c[Ma>>2]|0))}}while(0);Fc(Ia);c[Ia>>2]=260;c[pa+(Ka<<5)+8>>2]=c[ka>>2];Ec(Ia);Ga=Ca;na=Ga;continue a;break};case 32:{Fa=(c[f>>2]|0)+(-2-(ga>>>8&255)<<5)|0;Fc(Fa);bd(J);c[Fa+0>>2]=c[J+0>>2];c[Fa+4>>2]=c[J+4>>2];c[Fa+8>>2]=c[J+8>>2];c[Fa+12>>2]=c[J+12>>2];Ga=Ca;na=Ga;continue a;break};case 33:{Fa=(c[f>>2]|0)+(-2-(ga>>>8&255)<<5)|0;Fc(Fa);Rd(K);c[Fa+0>>2]=c[K+0>>2];c[Fa+4>>2]=c[K+4>>2];c[Fa+8>>2]=c[K+8>>2];c[Fa+12>>2]=c[K+12>>2];Ga=Ca;na=Ga;continue a;break};case 34:{Fa=c[f>>2]|0;Ma=Fa+(-2-(ga>>>8&255)<<5)|0;Ea=-2-(ga>>>16&255)|0;oa=-2-(ga>>>24)|0;Na=Fa+(oa<<5)|0;Pa=c[Fa+(Ea<<5)>>2]|0;Qa=Pa&255;if((Qa|0)==5){Sd(c[Fa+(Ea<<5)+8>>2]|0,Na,L);Ec(L);Fc(Ma);c[Ma+0>>2]=c[L+0>>2];c[Ma+4>>2]=c[L+4>>2];c[Ma+8>>2]=c[L+8>>2];c[Ma+12>>2]=c[L+12>>2];Ga=Ca;na=Ga;continue a}else if((Qa|0)==4){Ra=c[Na>>2]|0;if((Ra&767|0)!=2){va=174;break a}Sa=Fa+(Ea<<5)+8|0;Ta=c[Sa>>2]|0;Ua=Fa+(oa<<5)+8|0;Va=c[Ua>>2]|0;c[l>>2]=Va;Wa=Uc(Ta)|0;c[m>>2]=Wa;if(!((Va|0)>-1&(Va|0)<(Wa|0))){va=176;break a}Vc(c[Sa>>2]|0,c[Ua>>2]|0,M);Ec(M);Fc(Ma);c[Ma+0>>2]=c[M+0>>2];c[Ma+4>>2]=c[M+4>>2];c[Ma+8>>2]=c[M+8>>2];c[Ma+12>>2]=c[M+12>>2];Ga=Ca;na=Ga;continue a}else if((Qa|0)==3){Xa=c[Na>>2]|0;if((Xa&767|0)!=2){va=179;break a}Na=Fa+(Ea<<5)+8|0;Ea=c[Na>>2]|0;Qa=Fa+(oa<<5)+8|0;oa=c[Qa>>2]|0;c[l>>2]=oa;Fa=c[Ea+12>>2]|0;c[m>>2]=Fa;if(!((oa|0)>-1&(oa|0)<(Fa|0))){va=181;break a}Fa=a[(c[(c[Na>>2]|0)+8>>2]|0)+(c[Qa>>2]|0)|0]|0;Fc(Ma);Ac(N,Fa&255);c[Ma+0>>2]=c[N+0>>2];c[Ma+4>>2]=c[N+4>>2];c[Ma+8>>2]=c[N+8>>2];c[Ma+12>>2]=c[N+12>>2];Ga=Ca;na=Ga;continue a}else{va=183;break a}break};case 35:{Ma=-2-(ga>>>8&255)|0;Fa=c[f>>2]|0;Qa=-2-(ga>>>16&255)|0;Na=Fa+(Qa<<5)|0;oa=Fa+(-2-(ga>>>24)<<5)|0;Ya=c[Fa+(Ma<<5)>>2]|0;Ea=Ya&255;if((Ea|0)==4){Za=c[Na>>2]|0;if((Za&767|0)!=2){va=192;break a}Ua=Fa+(Ma<<5)+8|0;Sa=c[Ua>>2]|0;Wa=Fa+(Qa<<5)+8|0;Va=c[Wa>>2]|0;c[l>>2]=Va;Ta=Uc(Sa)|0;c[m>>2]=Ta;if(!((Va|0)>-1&(Va|0)<(Ta|0))){va=194;break a}Wc(c[Ua>>2]|0,c[Wa>>2]|0,oa);Ga=Ca;na=Ga;continue a}else if((Ea|0)!=5){va=196;break a}Ea=c[Na>>2]|0;if((Ea&767|0)==514){Ha=+h[Fa+(Qa<<5)+8>>3];if(Ha!=Ha|0.0!=0.0){va=187;break a}}if((Ea&255|0)==0){va=189;break a}Td(c[Fa+(Ma<<5)+8>>2]|0,Na,oa);Ga=Ca;na=Ga;continue a;break};case 0:{oa=c[f>>2]|0;Na=c[b>>2]|0;Ma=oa+(-2-(ga>>>8&255)<<5)-Na>>5;Fa=-2-(ga>>>16&255)|0;_a=c[oa+(Fa<<5)>>2]|0;Ea=ga>>>24;Qa=(Ea+3|0)>>>2;if((_a&255|0)!=6){va=35;break a}$a=c[oa+(Fa<<5)+8>>2]|0;if((c[$a+12>>2]|0)==0){Fa=(c[$a+44>>2]|0)+16|0;if((c[$a+16>>2]|0)!=0){vh($a)}c[t>>2]=0;c[fa>>2]=Ca;c[d>>2]=na+(Qa+1<<2);c[g>>2]=oa-Na>>5;c[ia>>2]=Ma;wh(b,$a,t,Ea);na=Fa;continue a}c[r+0>>2]=c[8>>2];c[r+4>>2]=c[12>>2];c[r+8>>2]=c[16>>2];c[r+12>>2]=c[20>>2];Fa=ga>>>0>285212671;if(Fa){ab=ve(Ea<<4)|0}else{ab=l}if((Ea|0)!=0){Na=0;do{oa=c[f>>2]|0;Wa=oa+(-2-(ue(Ca,Na)|0)<<5)|0;oa=ab+(Na<<4)|0;c[oa+0>>2]=c[Wa+0>>2];c[oa+4>>2]=c[Wa+4>>2];c[oa+8>>2]=c[Wa+8>>2];c[oa+12>>2]=c[Wa+12>>2];Na=Na+1|0;}while((Na|0)<(Ea|0))}Na=c[ra>>2]|0;do{if((Na|0)==0){c[ra>>2]=8;bb=256;cb=0;db=c[b>>2]|0;va=46}else{Ia=c[f>>2]|0;ka=c[b>>2]|0;Ka=Ia-ka>>5;pa=Ka+1|0;if(Na>>>0<pa>>>0){eb=Na}else{fb=Ia;break}while(1){gb=eb<<1;if(gb>>>0<pa>>>0){eb=gb}else{break}}c[ra>>2]=gb;bb=eb<<6;cb=Ka;db=ka;va=46}}while(0);if((va|0)==46){va=0;Na=xe(db,bb)|0;c[b>>2]=Na;pa=Na+(cb<<5)|0;c[f>>2]=pa;fb=pa}c[f>>2]=fb+32;c[fb>>2]=1;c[fb+4>>2]=0;c[fb+8>>2]=0;c[fb+12>>2]=0;c[fb+16>>2]=0;pa=c[f>>2]|0;c[pa+ -12>>2]=-1;c[pa+ -8>>2]=$a;c[(c[f>>2]|0)+ -4>>2]=0;pa=dc[c[$a+44>>2]&127](r,Ea,ab,c[xa>>2]|0)|0;c[q>>2]=pa;if(Fa){gi(ab);hb=c[q>>2]|0}else{hb=pa}if((hb|0)!=0){va=50;break a}Fc((c[b>>2]|0)+(Ma<<5)|0);pa=(c[b>>2]|0)+(Ma<<5)|0;c[pa+0>>2]=c[r+0>>2];c[pa+4>>2]=c[r+4>>2];c[pa+8>>2]=c[r+8>>2];c[pa+12>>2]=c[r+12>>2];pa=c[f>>2]|0;Na=c[pa+ -32>>2]|0;Ia=0-Na|0;do{if((Ia|0)<-1){Fc(pa+(Ia<<5)|0);Wa=1-Na|0;if((Wa|0)==-1){break}else{ib=Wa}do{Fc((c[f>>2]|0)+(ib<<5)|0);ib=ib+1|0;}while(!((ib|0)==-1))}}while(0);Na=c[pa+ -4>>2]|0;if((Na|0)!=0){yc(Na)}c[f>>2]=(c[f>>2]|0)+(Ia<<5);na=na+(Qa+1<<2)|0;continue a;break};case 1:{Na=c[f>>2]|0;Ma=Na+(-2-(ga>>>8&255)<<5)|0;Fa=c[Na+ -12>>2]|0;do{if((Fa|0)<0){if(Aa){break}Ec(Ma);c[e+0>>2]=c[Ma+0>>2];c[e+4>>2]=c[Ma+4>>2];c[e+8>>2]=c[Ma+8>>2];c[e+12>>2]=c[Ma+12>>2]}else{Ea=(c[b>>2]|0)+(Fa<<5)|0;Ec(Ma);Fc(Ea);c[Ea+0>>2]=c[Ma+0>>2];c[Ea+4>>2]=c[Ma+4>>2];c[Ea+8>>2]=c[Ma+8>>2];c[Ea+12>>2]=c[Ma+12>>2]}}while(0);Ma=c[f>>2]|0;Fa=c[Ma+ -32>>2]|0;Qa=0-Fa|0;do{if((Qa|0)<-1){Fc(Ma+(Qa<<5)|0);Ia=1-Fa|0;if((Ia|0)==-1){break}else{jb=Ia}do{Fc((c[f>>2]|0)+(jb<<5)|0);jb=jb+1|0;}while(!((jb|0)==-1))}}while(0);Fa=c[Ma+ -4>>2]|0;if((Fa|0)!=0){yc(Fa)}c[f>>2]=(c[f>>2]|0)+(Qa<<5);Fa=c[Na+ -16>>2]|0;if((Fa|0)==0){Ba=0;va=239;break a}else{na=Fa;continue a}break};case 2:{na=na+((c[Ca>>2]|0)+2<<2)|0;continue a;break};case 4:case 3:{Fa=-2-(ga>>>8&255)|0;Ia=c[f>>2]|0;pa=na+8|0;Ea=c[Ca>>2]|0;if((c[Ia+(Fa<<5)>>2]&255|0)!=1){va=72;break a}if((Da|0)==3){if((c[Ia+(Fa<<5)+8>>2]|0)!=0){na=pa;continue a}}else if((Da|0)==4){if((c[Ia+(Fa<<5)+8>>2]|0)==0){na=pa;continue a}}else{na=pa;continue a}na=na+(Ea+2<<2)|0;continue a;break};case 6:case 5:{Ea=c[f>>2]|0;pa=Ea+(-2-(ga>>>8&255)<<5)|0;Fa=Ea+(-2-(ga>>>16&255)<<5)|0;Ia=Ea+(-2-(ga>>>24)<<5)|0;if((Da|0)==5){kb=Gc(Fa,Ia)|0}else{kb=Hc(Fa,Ia)|0}Fc(pa);zc(u,kb);c[pa+0>>2]=c[u+0>>2];c[pa+4>>2]=c[u+4>>2];c[pa+8>>2]=c[u+8>>2];c[pa+12>>2]=c[u+12>>2];Ga=Ca;na=Ga;continue a;break};case 10:case 9:case 8:case 7:{pa=c[f>>2]|0;Ia=pa+(-2-(ga>>>8&255)<<5)|0;lb=pa+(-2-(ga>>>16&255)<<5)|0;mb=pa+(-2-(ga>>>24)<<5)|0;if((Jc(lb,mb)|0)==0){va=82;break a}pa=Ic(lb,mb)|0;Fc(Ia);if((Da|0)==7){nb=pa>>>31}else if((Da|0)==8){nb=(pa|0)<1|0}else if((Da|0)==9){nb=(pa|0)>0|0}else if((Da|0)==10){nb=pa>>>31^1}else{nb=-1}zc(w,nb);c[Ia+0>>2]=c[w+0>>2];c[Ia+4>>2]=c[w+4>>2];c[Ia+8>>2]=c[w+8>>2];c[Ia+12>>2]=c[w+12>>2];Ga=Ca;na=Ga;continue a;break};case 14:case 13:case 12:case 11:{Ia=c[f>>2]|0;pa=Ia+(-2-(ga>>>8&255)<<5)|0;Fa=-2-(ga>>>16&255)|0;Ea=-2-(ga>>>24)|0;ka=c[Ia+(Fa<<5)>>2]|0;if((ka&255|0)!=2){va=91;break a}Ka=c[Ia+(Ea<<5)>>2]|0;if((Ka&255|0)!=2){va=91;break a}do{if((ka&767|0)==514){Ha=+h[Ia+(Fa<<5)+8>>3];if((Ka&767|0)==514){ob=Ha;va=96;break}pb=Ha;qb=+(c[Ia+(Ea<<5)+8>>2]|0);va=98}else{Wa=c[Ia+(Fa<<5)+8>>2]|0;if((Ka&767|0)==514){ob=+(Wa|0);va=96;break}oa=c[Ia+(Ea<<5)+8>>2]|0;if((Da|0)==11){rb=oa+Wa|0}else if((Da|0)==12){rb=Wa-oa|0}else if((Da|0)==13){rb=da(oa,Wa)|0}else if((Da|0)==14){rb=(Wa|0)/(oa|0)|0}else{rb=0}Ac(y,rb)}}while(0);if((va|0)==96){va=0;pb=ob;qb=+h[Ia+(Ea<<5)+8>>3];va=98}if((va|0)==98){va=0;if((Da|0)==11){sb=pb+qb}else if((Da|0)==12){sb=pb-qb}else if((Da|0)==13){sb=pb*qb}else if((Da|0)==14){sb=pb/qb}else{sb=0.0}Bc(y,sb)}c[x+0>>2]=c[y+0>>2];c[x+4>>2]=c[y+4>>2];c[x+8>>2]=c[y+8>>2];c[x+12>>2]=c[y+12>>2];Fc(pa);c[pa+0>>2]=c[x+0>>2];c[pa+4>>2]=c[x+4>>2];c[pa+8>>2]=c[x+8>>2];c[pa+12>>2]=c[x+12>>2];Ga=Ca;na=Ga;continue a;break};case 36:{Ka=c[f>>2]|0;$c(c[Ka+(-2-(ga>>>8&255)<<5)+8>>2]|0,Ka+(-2-(ga>>>16&255)<<5)|0);Ga=Ca;na=Ga;continue a;break};case 37:{na=na+((c[Ca>>2]|0)+5<<2)|0;continue a;break};case 38:{Ka=c[f>>2]|0;Wd(c[ya>>2]|0,Ca,Q);if((c[Q>>2]&255|0)!=0){va=200;break a}Xd(c[ya>>2]|0,Ca,Ka+(-2-(ga>>>8&255)<<5)|0);na=na+((((ga>>>16)+4|0)>>>2)+1<<2)|0;continue a;break};case 39:{Ka=ga>>>16;Fa=Ka&255;ka=c[f>>2]|0;Na=c[ka+ -8>>2]|0;Qa=-2-(ga>>>8&255)|0;Ma=ka+(Qa<<5)+8|0;oa=c[Ma>>2]|0;Wa=Jd(oa)|0;c[ka+(Qa<<5)>>2]=262;c[Ma>>2]=Wa;if((Fa|0)==0){tb=Ca}else{Ma=Wa+40|0;Wa=Na+40|0;Na=Ka&255;Ka=Na>>>0>1;Qa=Ca;ka=0;while(1){Ua=Qa+4|0;Ta=c[Qa>>2]|0;Va=Ta&255;Sa=Ta>>>8&255;if((Va|0)==0){$c(c[Ma>>2]|0,(c[f>>2]|0)+(-2-Sa<<5)|0)}else if((Va|0)==1){Vc(c[Wa>>2]|0,Sa,S);$c(c[Ma>>2]|0,S)}Sa=ka+1|0;if((Sa|0)<(Fa|0)){ka=Sa;Qa=Ua}else{break}}tb=na+((Ka?Na+1|0:2)<<2)|0}yc(oa);na=tb;continue a;break};case 40:{Qa=c[f>>2]|0;ka=c[Qa+ -8>>2]|0;Fa=Qa+(-2-(ga>>>8&255)<<5)|0;Fc(Fa);Vc(c[ka+40>>2]|0,ga>>>16&255,Fa);Ec(Fa);Ga=Ca;na=Ga;continue a;break};case 41:{Fa=c[f>>2]|0;ka=Fa+(-2-(ga>>>8&255)<<5)|0;ub=Fa+(-2-(ga>>>16&255)<<5)|0;if((Ch(b,T,ub,Fa+(-2-(ga>>>24)<<5)|0)|0)==0){va=213;break a}Ec(T);Fc(ka);c[ka+0>>2]=c[T+0>>2];c[ka+4>>2]=c[T+4>>2];c[ka+8>>2]=c[T+8>>2];c[ka+12>>2]=c[T+12>>2];Ga=Ca;na=Ga;continue a;break};case 42:{ka=-2-(ga>>>8&255)|0;Fa=c[f>>2]|0;Qa=Fa+(ka<<5)|0;Ma=-2-(ga>>>16&255)|0;vb=Fa+(Ma<<5)|0;Wa=-2-(ga>>>24)|0;pa=Fa+(Wa<<5)|0;wb=Fa+(Wa<<5)+8|0;Wa=c[(c[wb>>2]|0)+8>>2]|0;Ea=c[vb>>2]&255;do{if((Ea|0)==3){if((ui(Wa,12880)|0)!=0){break}Ia=c[(c[Fa+(Ma<<5)+8>>2]|0)+12>>2]|0;Fc(Qa);Ac(l,Ia);c[Qa+0>>2]=c[l+0>>2];c[Qa+4>>2]=c[l+4>>2];c[Qa+8>>2]=c[l+8>>2];c[Qa+12>>2]=c[l+12>>2];Ga=Ca;na=Ga;continue a}else if((Ea|0)==4){if((ui(Wa,12880)|0)!=0){break}Ia=Uc(c[Fa+(Ma<<5)+8>>2]|0)|0;Fc(Qa);Ac(m,Ia);c[Qa+0>>2]=c[m+0>>2];c[Qa+4>>2]=c[m+4>>2];c[Qa+8>>2]=c[m+8>>2];c[Qa+12>>2]=c[m+12>>2];Ga=Ca;na=Ga;continue a}else if((Ea|0)==5){if((ui(Wa,12880)|0)!=0){break}Ia=Qd(c[Fa+(Ma<<5)+8>>2]|0)|0;Fc(Qa);Ac(n,Ia);c[Qa+0>>2]=c[n+0>>2];c[Qa+4>>2]=c[n+4>>2];c[Qa+8>>2]=c[n+8>>2];c[Qa+12>>2]=c[n+12>>2];Ga=Ca;na=Ga;continue a}}while(0);do{if((Ch(b,V,vb,pa)|0)!=0){if((c[V>>2]&255|0)!=5){break}Sd(c[la>>2]|0,qa,W);if((c[W>>2]&255|0)!=6){break}Ma=c[ma>>2]|0;c[Z+0>>2]=c[vb+0>>2];c[Z+4>>2]=c[vb+4>>2];c[Z+8>>2]=c[vb+8>>2];c[Z+12>>2]=c[vb+12>>2];c[ta+0>>2]=c[pa+0>>2];c[ta+4>>2]=c[pa+4>>2];c[ta+8>>2]=c[pa+8>>2];c[ta+12>>2]=c[pa+12>>2];if((th(b,Ma,_,2,Z)|0)!=0){Ba=-1;va=239;break a}Ma=(c[f>>2]|0)+(ka<<5)|0;Fc(Ma);c[Ma+0>>2]=c[_+0>>2];c[Ma+4>>2]=c[_+4>>2];c[Ma+8>>2]=c[_+8>>2];c[Ma+12>>2]=c[_+12>>2];Ga=Ca;na=Ga;continue a}}while(0);ka=c[vb>>2]|0;if((ka&255|0)!=5){xb=ka;break a}if((Ch(b,X,vb,pa)|0)==0){va=228;break a}Ec(X);Fc(Qa);c[Qa+0>>2]=c[X+0>>2];c[Qa+4>>2]=c[X+4>>2];c[Qa+8>>2]=c[X+8>>2];c[Qa+12>>2]=c[X+12>>2];Ga=Ca;na=Ga;continue a;break};case 43:{ka=-2-(ga>>>8&255)|0;yb=c[f>>2]|0;Ma=yb+(ka<<5)|0;zb=-2-(ga>>>16&255)|0;Fa=yb+(zb<<5)|0;Wa=yb+(-2-(ga>>>24)<<5)|0;do{if((Ch(b,$,Ma,Fa)|0)!=0){if((c[$>>2]&255|0)!=5){break}Sd(c[sa>>2]|0,wa,aa);if((c[aa>>2]&255|0)!=6){break}Ea=c[ua>>2]|0;c[l+0>>2]=c[Ma+0>>2];c[l+4>>2]=c[Ma+4>>2];c[l+8>>2]=c[Ma+8>>2];c[l+12>>2]=c[Ma+12>>2];c[za+0>>2]=c[Wa+0>>2];c[za+4>>2]=c[Wa+4>>2];c[za+8>>2]=c[Wa+8>>2];c[za+12>>2]=c[Wa+12>>2];c[ja+0>>2]=c[Fa+0>>2];c[ja+4>>2]=c[Fa+4>>2];c[ja+8>>2]=c[Fa+8>>2];c[ja+12>>2]=c[Fa+12>>2];if((th(b,Ea,0,3,l)|0)==0){Ga=Ca;na=Ga;continue a}else{Ba=-1;va=239;break a}}}while(0);Ab=c[Ma>>2]|0;if((Ab&255|0)!=5){va=237;break a}Td(c[yb+(ka<<5)+8>>2]|0,Fa,Wa);Ga=Ca;na=Ga;continue a;break};default:{va=238;break a}}}if((va|0)==35){c[p>>2]=Qc(_a)|0;Ah(b,na,12032,p);Ba=-1;i=j;return Ba|0}else if((va|0)==50){c[s>>2]=c[$a+8>>2];c[s+4>>2]=q;Ah(b,0,11936,s);Ba=c[q>>2]|0;i=j;return Ba|0}else if((va|0)==72){Ah(b,na,12072,0);Ba=-1;i=j;return Ba|0}else if((va|0)==82){c[v>>2]=Qc(c[lb>>2]|0)|0;c[v+4>>2]=Qc(c[mb>>2]|0)|0;Ah(b,na,12256,v);Ba=-1;i=j;return Ba|0}else if((va|0)==91){Ah(b,na,12320,0);Ba=-1;i=j;return Ba|0}else if((va|0)==113){Ah(b,na,12352,0);Ba=-1;i=j;return Ba|0}else if((va|0)==116){Ah(b,na,12384,0);Ba=-1;i=j;return Ba|0}else if((va|0)==121){Ah(b,na,12408,0);Ba=-1;i=j;return Ba|0}else if((va|0)==131){Ah(b,na,12448,0);Ba=-1;i=j;return Ba|0}else if((va|0)==140){Ah(b,na,12488,0);Ba=-1;i=j;return Ba|0}else if((va|0)==143){Ah(b,na,12520,0);Ba=-1;i=j;return Ba|0}else if((va|0)==148){Ah(b,na,12560,0);Ba=-1;i=j;return Ba|0}else if((va|0)==158){c[o>>2]=c[La>>2];Ah(b,na,13160,o);Ba=-1;i=j;return Ba|0}else if((va|0)==174){c[o>>2]=Qc(Ra)|0;Ah(b,na,13056,o);Ba=-1;i=j;return Ba|0}else if((va|0)==176){c[n>>2]=l;c[n+4>>2]=m;Ah(b,na,13112,n);Ba=-1;i=j;return Ba|0}else if((va|0)==179){c[o>>2]=Qc(Xa)|0;Ah(b,na,12952,o);Ba=-1;i=j;return Ba|0}else if((va|0)==181){c[n>>2]=l;c[n+4>>2]=m;Ah(b,na,13008,n);Ba=-1;i=j;return Ba|0}else if((va|0)==183){c[O>>2]=Qc(Pa)|0;Ah(b,na,12600,O);Ba=-1;i=j;return Ba|0}else if((va|0)==187){Ah(b,na,12888,0);Ba=-1;i=j;return Ba|0}else if((va|0)==189){Ah(b,na,12920,0);Ba=-1;i=j;return Ba|0}else if((va|0)==192){c[o>>2]=Qc(Za)|0;Ah(b,na,13056,o);Ba=-1;i=j;return Ba|0}else if((va|0)==194){c[n>>2]=l;c[n+4>>2]=m;Ah(b,na,13112,n);Ba=-1;i=j;return Ba|0}else if((va|0)==196){c[P>>2]=Qc(Ya)|0;Ah(b,na,12640,P);Ba=-1;i=j;return Ba|0}else if((va|0)==200){c[R>>2]=Ca;Ah(b,na,12672,R);Ba=-1;i=j;return Ba|0}else if((va|0)==213){c[U>>2]=Qc(c[ub>>2]|0)|0;Ah(b,na,12704,U);Ba=-1;i=j;return Ba|0}else if((va|0)==228){xb=c[vb>>2]|0}else if((va|0)==237){c[ba>>2]=Qc(Ab)|0;c[ba+4>>2]=c[(c[yb+(zb<<5)+8>>2]|0)+8>>2];Ah(b,na,12792,ba);Ba=-1;i=j;return Ba|0}else if((va|0)==238){c[ca>>2]=Da;c[ea>>2]=ca;Ah(b,na,12848,ea);Ba=-1;i=j;return Ba|0}else if((va|0)==239){i=j;return Ba|0}c[Y>>2]=Qc(xb)|0;c[Y+4>>2]=c[(c[wb>>2]|0)+8>>2];Ah(b,na,12736,Y);Ba=-1;i=j;return Ba|0}function uh(a,b,c){a=a|0;b=b|0;c=c|0;var d=0;d=i;Ah(a,0,b,c);i=d;return}function vh(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;b=i;i=i+96|0;d=b+80|0;e=b+64|0;f=b+48|0;g=b+32|0;h=b+16|0;j=b;k=c[a+44>>2]|0;l=c[k+12>>2]|0;m=a+32|0;if((c[m>>2]|0)!=0){i=b;return}n=c[k>>2]|0;c[m>>2]=1;if((l|0)==0){i=b;return}m=a+36|0;o=0;p=k+(n+4<<2)|0;while(1){n=p+4|0;q=c[p>>2]|0;r=q&255;if((r|0)==2){s=((c[p+8>>2]|0)+4|0)>>>2;Kd(j,p+12|0,k+(c[n>>2]<<2)|0,a);c[h+0>>2]=c[j+0>>2];c[h+4>>2]=c[j+4>>2];c[h+8>>2]=c[j+8>>2];c[h+12>>2]=c[j+12>>2];$c(c[m>>2]|0,h);Fc(h);t=p+(s+3<<2)|0}else if((r|0)==1){s=((q>>>8)+4|0)>>>2;ze(g,n);c[f+0>>2]=c[g+0>>2];c[f+4>>2]=c[g+4>>2];c[f+8>>2]=c[g+8>>2];c[f+12>>2]=c[g+12>>2];$c(c[m>>2]|0,f);Fc(f);t=p+(s+1<<2)|0}else if((r|0)==0){r=q>>>8;q=(r+4|0)>>>2;ih(e,n,r,0);c[d+0>>2]=c[e+0>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];c[d+12>>2]=c[e+12>>2];$c(c[m>>2]|0,d);Fc(d);t=p+(q+1<<2)|0}else{u=9;break}q=o+1|0;if(q>>>0<l>>>0){o=q;p=t}else{u=9;break}}if((u|0)==9){i=b;return}}function wh(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;f=i;g=c[b+44>>2]|0;h=c[g+4>>2]|0;j=(h|0)<(e|0);k=j?e-h|0:0;if((c[d>>2]|0)==0){l=c[d+8>>2]|0;m=c[d+16>>2]|0}else{l=0;m=-1}n=k+(c[g+8>>2]|0)|0;g=n+1|0;o=a+8|0;p=c[o>>2]|0;if((p|0)==0){c[o>>2]=8;q=g;r=0;s=8;t=6}else{u=c[a+4>>2]|0;v=u-(c[a>>2]|0)>>5;w=v+g|0;if(p>>>0<w>>>0){q=w;r=v;s=p;t=6}else{x=u}}if((t|0)==6){if(s>>>0<q>>>0){t=s;do{t=t<<1;}while(t>>>0<q>>>0);c[o>>2]=t;y=t}else{y=s}s=xe(c[a>>2]|0,y<<5)|0;c[a>>2]=s;y=s+(r<<5)|0;c[a+4>>2]=y;x=y}y=a+4|0;r=x+(g<<5)|0;c[y>>2]=r;if((n|0)>0){x=r;s=~n;while(1){n=x+(s<<5)|0;c[n+0>>2]=c[8>>2];c[n+4>>2]=c[12>>2];c[n+8>>2]=c[16>>2];c[n+12>>2]=c[20>>2];n=s+1|0;t=c[y>>2]|0;if((n|0)==-1){z=t;break}else{s=n;x=t}}}else{z=r}c[z+ -32>>2]=g;g=z+ -32|0;c[g+4>>2]=h;c[z+ -24>>2]=k;c[g+12>>2]=e;c[z+ -16>>2]=l;l=c[y>>2]|0;c[l+ -12>>2]=m;c[l+ -8>>2]=b;c[(c[y>>2]|0)+ -4>>2]=0;if((h|0)>0&(e|0)>0){b=d+12|0;l=d+4|0;m=d+4|0;z=0-h|0;g=0-e|0;k=0-(z>>>0>g>>>0?z:g)|0;g=0;do{z=(c[y>>2]|0)+(-2-g<<5)|0;if((c[d>>2]|0)==0){r=c[a>>2]|0;x=c[b>>2]|0;A=r+(x+ -2-(ue(c[l>>2]|0,g)|0)<<5)|0}else{A=(c[m>>2]|0)+(g<<4)|0}Ec(A);c[z+0>>2]=c[A+0>>2];c[z+4>>2]=c[A+4>>2];c[z+8>>2]=c[A+8>>2];c[z+12>>2]=c[A+12>>2];g=g+1|0;}while((g|0)!=(k|0))}if(!j){i=f;return}j=d+12|0;k=d+4|0;g=d+4|0;A=h;do{m=c[y>>2]|0;l=m+(~(A-h)-(c[m+ -32>>2]|0)+(c[m+ -24>>2]|0)<<5)|0;if((c[d>>2]|0)==0){m=c[a>>2]|0;b=c[j>>2]|0;B=m+(b+ -2-(ue(c[k>>2]|0,A)|0)<<5)|0}else{B=(c[g>>2]|0)+(A<<4)|0}Ec(B);c[l+0>>2]=c[B+0>>2];c[l+4>>2]=c[B+4>>2];c[l+8>>2]=c[B+8>>2];c[l+12>>2]=c[B+12>>2];A=A+1|0;}while((A|0)!=(e|0));i=f;return}function xh(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+64|0;g=f+48|0;h=f+32|0;j=f+16|0;k=f;l=a+12|0;a=c[l>>2]|0;if((b|0)==0){m=a}else{Wd(a,b,h);a=c[h>>2]&255;if((a|0)==0){Rd(j);c[h+0>>2]=c[j+0>>2];c[h+4>>2]=c[j+4>>2];c[h+8>>2]=c[j+8>>2];c[h+12>>2]=c[j+12>>2];Xd(c[l>>2]|0,b,h);Fc(h)}else if((a|0)!=5){l=Qc(a)|0;c[g>>2]=b;c[g+4>>2]=l;we(11976,g)}m=c[h+8>>2]|0}if((e|0)==0){i=f;return}else{n=0}do{h=d+(n<<3)|0;Ld(k,c[h>>2]|0,c[d+(n<<3)+4>>2]|0);Xd(m,c[h>>2]|0,k);Fc(k);n=n+1|0;}while((n|0)!=(e|0));i=f;return}function yh(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+48|0;g=f+32|0;h=f+16|0;j=f;k=a+12|0;a=c[k>>2]|0;if((b|0)==0){l=a}else{Wd(a,b,h);a=c[h>>2]&255;if((a|0)==0){Rd(j);c[h+0>>2]=c[j+0>>2];c[h+4>>2]=c[j+4>>2];c[h+8>>2]=c[j+8>>2];c[h+12>>2]=c[j+12>>2];Xd(c[k>>2]|0,b,h);Fc(h)}else if((a|0)!=5){k=Qc(a)|0;c[g>>2]=b;c[g+4>>2]=k;we(11976,g)}l=c[h+8>>2]|0}if((e|0)==0){i=f;return}else{m=0}do{Xd(l,c[d+(m*24|0)>>2]|0,d+(m*24|0)+8|0);m=m+1|0;}while((m|0)!=(e|0));i=f;return}function zh(a){a=a|0;i=i;return c[a+72>>2]|0}function Ah(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+16|0;g=f+12|0;h=f+8|0;j=f+4|0;k=f;l=a+76|0;if((c[l>>2]|0)!=0){i=f;return}if((b|0)==0){m=dh(13240,g,0)|0}else{c[j>>2]=b-(c[(c[(c[(c[a+4>>2]|0)+ -8>>2]|0)+28>>2]|0)+44>>2]|0)>>2;c[k>>2]=j;m=dh(13200,g,k)|0}k=dh(d,h,e)|0;e=a+72|0;gi(c[e>>2]|0);a=ve((c[g>>2]|0)+1+(c[h>>2]|0)|0)|0;c[e>>2]=a;Ii(a|0,m|0)|0;Ii((c[e>>2]|0)+(c[g>>2]|0)|0,k|0)|0;gi(m);gi(k);c[l>>2]=1;i=f;return}function Bh(a,b){a=a|0;b=b|0;c[a+80>>2]=b;i=i;return}function Ch(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;f=i;i=i+96|0;g=f+80|0;h=f+64|0;j=f+48|0;k=f+32|0;l=f+16|0;m=f;n=c[d>>2]&255;Ac(m,n);if((n|0)==5){c[l+0>>2]=c[d+0>>2];c[l+4>>2]=c[d+4>>2];c[l+8>>2]=c[d+8>>2];c[l+12>>2]=c[d+12>>2]}else if((n|0)==7){Sd(c[a+16>>2]|0,d,l)}else{Sd(c[a+16>>2]|0,m,l)}if((c[l>>2]&255|0)!=5){o=0;i=f;return o|0}c[k+0>>2]=c[l+0>>2];c[k+4>>2]=c[l+4>>2];c[k+8>>2]=c[l+8>>2];c[k+12>>2]=c[l+12>>2];n=k+8|0;p=a+24|0;do{q=c[n>>2]|0;Sd(q,e,j);if((c[j>>2]&255|0)!=0){r=9;break}Sd(q,p,k);}while((c[k>>2]&255|0)==5);if((r|0)==9){c[b+0>>2]=c[j+0>>2];c[b+4>>2]=c[j+4>>2];c[b+8>>2]=c[j+8>>2];c[b+12>>2]=c[j+12>>2];o=1;i=f;return o|0}a:do{if((c[d>>2]&255|0)==5){Sd(c[a+16>>2]|0,m,l);if((c[l>>2]&255|0)!=5){break}c[h+0>>2]=c[l+0>>2];c[h+4>>2]=c[l+4>>2];c[h+8>>2]=c[l+8>>2];c[h+12>>2]=c[l+12>>2];j=h+8|0;while(1){r=c[j>>2]|0;Sd(r,e,g);if((c[g>>2]&255|0)!=0){break}Sd(r,p,h);if((c[h>>2]&255|0)!=5){break a}}c[b+0>>2]=c[g+0>>2];c[b+4>>2]=c[g+4>>2];c[b+8>>2]=c[g+8>>2];c[b+12>>2]=c[g+12>>2];o=1;i=f;return o|0}}while(0);c[b+0>>2]=c[8>>2];c[b+4>>2]=c[12>>2];c[b+8>>2]=c[16>>2];c[b+12>>2]=c[20>>2];o=1;i=f;return o|0}function Dh(){var a=0,b=0;a=i;b=c[3318]|0;if((b|0)!=0){vd(b);c[3318]=0}b=c[3320]|0;if((b|0)==0){c[3322]=0;i=a;return}yc(b);c[3320]=0;c[3322]=0;i=a;return}function Eh(){var a=0,b=0,d=0,e=0;a=i;b=c[3320]|0;if((b|0)==0){d=Tc()|0;c[3320]=d;e=d}else{e=b}_c(e,0);c[3322]=0;i=a;return}function Fh(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0;b=i;i=i+16|0;d=b;e=c[3318]|0;if((e|0)==0){f=ud()|0;c[3318]=f;Gd(f,0,14040,3);g=c[3318]|0}else{g=e}e=zd(g,a)|0;if((e|0)==0){h=-1;i=b;return h|0}c[d>>2]=262;c[d+8>>2]=e;e=c[3320]|0;if((e|0)==0){a=Tc()|0;c[3320]=a;j=a}else{j=e}$c(j,d);d=c[3322]|0;c[3322]=d+1;h=d;i=b;return h|0}function Gh(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0;b=i;i=i+16|0;d=b;e=c[3318]|0;if((e|0)==0){f=ud()|0;c[3318]=f;Gd(f,0,14040,3);g=c[3318]|0}else{g=e}e=Ed(g,a)|0;if((e|0)==0){h=-1;i=b;return h|0}c[d>>2]=262;c[d+8>>2]=e;e=c[3320]|0;if((e|0)==0){a=Tc()|0;c[3320]=a;j=a}else{j=e}$c(j,d);d=c[3322]|0;c[3322]=d+1;h=d;i=b;return h|0}function Hh(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;d=i;i=i+64|0;e=d+32|0;f=d+48|0;g=d+16|0;h=d;j=c[3320]|0;if((j|0)==0){k=Tc()|0;c[3320]=k;l=k}else{l=j}Vc(l,a,e);a=c[e>>2]|0;if((a&255|0)!=6){c[f>>2]=Qc(a)|0;a=c[3318]|0;if((a|0)==0){l=ud()|0;c[3318]=l;Gd(l,0,14040,3);m=c[3318]|0}else{m=a}Dd(m,13296,f);n=-1;i=d;return n|0}f=c[3320]|0;if((f|0)==0){m=Tc()|0;c[3320]=m;o=m}else{o=f}Vc(o,b,g);if((c[g>>2]&255|0)!=4){ua(13344,13368,129,13376)}b=c[e+8>>2]|0;e=c[g+8>>2]|0;g=Uc(e)|0;o=fi(g<<4)|0;if((g|0)!=0){f=0;do{Vc(e,f,o+(f<<4)|0);f=f+1|0;}while((f|0)!=(g|0))}f=c[3318]|0;if((f|0)==0){e=ud()|0;c[3318]=e;Gd(e,0,14040,3);p=c[3318]|0}else{p=f}f=Bd(p,b,h,g,o)|0;gi(o);if((f|0)!=0){n=-1;i=d;return n|0}f=c[3320]|0;if((f|0)==0){o=Tc()|0;c[3320]=o;q=o}else{q=f}$c(q,h);q=c[3322]|0;c[3322]=q+1;Fc(h);n=q;i=d;return n|0}function Ih(){var a=0,b=0,d=0,e=0;a=i;b=c[3318]|0;if((b|0)==0){d=ud()|0;c[3318]=d;Gd(d,0,14040,3);e=c[3318]|0}else{e=b}b=xd(e)|0;i=a;return b|0}function Jh(){var a=0,b=0,d=0,e=0,f=0;a=i;b=c[3318]|0;if((b|0)==0){d=ud()|0;c[3318]=d;Gd(d,0,14040,3);e=c[3318]|0}else{e=b}switch(wd(e)|0){case 0:{f=13392;break};case 2:{f=13408;break};case 1:{f=13400;break};case 4:{f=13432;break};case 3:{f=13424;break};default:{f=13440}}i=a;return f|0}function Kh(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0;b=i;i=i+16|0;d=b;e=c[3318]|0;if((e|0)==0){f=ud()|0;c[3318]=f;Gd(f,0,14040,3);g=c[3318]|0}else{g=e}Wd(Hd(g)|0,a,d);a=c[3320]|0;if((a|0)==0){g=Tc()|0;c[3320]=g;h=g}else{h=a}$c(h,d);d=c[3322]|0;c[3322]=d+1;i=b;return d|0}function Lh(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0;d=i;i=i+16|0;e=d;f=c[3320]|0;if((f|0)==0){g=Tc()|0;c[3320]=g;h=g}else{h=f}Vc(h,b,e);b=c[3318]|0;if((b|0)==0){h=ud()|0;c[3318]=h;Gd(h,0,14040,3);j=c[3318]|0}else{j=b}Xd(Hd(j)|0,a,e);i=d;return}function Mh(){var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b;gi(c[3362]|0);c[3362]=0;e=c[3318]|0;if((e|0)==0){f=ud()|0;c[3318]=f;Gd(f,0,14040,3);g=c[3318]|0}else{g=e}e=Fd(g,d)|0;if((c[d>>2]|0)==0){gi(e);h=0;i=b;return h|0}else{j=0;k=0}while(1){g=e+(j<<2)|0;f=Bi(c[g>>2]|0)|0;l=k+1+f|0;m=ii(c[3362]|0,l)|0;c[3362]=m;Ei(m+k|0,c[g>>2]|0,f|0)|0;n=f+k|0;a[m+n|0]=10;m=j+1|0;if(m>>>0<(c[d>>2]|0)>>>0){k=l;j=m}else{break}}a[(c[3362]|0)+n|0]=0;gi(e);h=c[3362]|0;i=b;return h|0}function Nh(){var a=0,b=0,d=0,e=0;a=i;b=c[3320]|0;if((b|0)==0){d=Tc()|0;c[3320]=d;e=d}else{e=b}$c(e,8);e=c[3322]|0;c[3322]=e+1;i=a;return e|0}function Oh(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=c[3320]|0;if((d|0)==0){e=Tc()|0;c[3320]=e;f=e}else{f=d}$c(f,(a|0)!=0?40:24);a=c[3322]|0;c[3322]=a+1;i=b;return a|0}function Ph(a){a=+a;var b=0,d=0,e=0,f=0,g=0;b=i;i=i+16|0;d=b;if(+R(+a)==a){Ac(d,~~a)}else{Bc(d,a)}e=c[3320]|0;if((e|0)==0){f=Tc()|0;c[3320]=f;g=f}else{g=e}$c(g,d);d=c[3322]|0;c[3322]=d+1;i=b;return d|0}function Qh(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;i=i+16|0;d=b;gh(d,a);a=c[3320]|0;if((a|0)==0){e=Tc()|0;c[3320]=e;f=e}else{f=a}$c(f,d);f=c[3322]|0;c[3322]=f+1;Fc(d);i=b;return f|0}function Rh(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;d=i;i=i+32|0;e=d+16|0;f=d;g=Tc()|0;if((b|0)!=0){h=0;do{j=c[a+(h<<2)>>2]|0;k=c[3320]|0;if((k|0)==0){l=Tc()|0;c[3320]=l;m=l}else{m=k}Vc(m,j,e);$c(g,e);h=h+1|0;}while((h|0)!=(b|0))}c[f>>2]=260;c[f+8>>2]=g;b=c[3320]|0;if((b|0)==0){h=Tc()|0;c[3320]=h;n=h}else{n=b}$c(n,f);f=c[3322]|0;c[3322]=f+1;yc(g);i=d;return f|0}function Sh(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;d=i;i=i+48|0;e=d+32|0;f=d+16|0;g=d;h=Pd()|0;if((b|0)!=0){j=0;do{k=j<<1;l=c[a+(k<<2)>>2]|0;m=c[a+((k|1)<<2)>>2]|0;k=c[3320]|0;if((k|0)==0){n=Tc()|0;c[3320]=n;o=n}else{o=k}Vc(o,l,e);l=c[3320]|0;if((l|0)==0){k=Tc()|0;c[3320]=k;p=k}else{p=l}Vc(p,m,f);Td(h,e,f);j=j+1|0;}while((j|0)!=(b|0))}c[g>>2]=261;c[g+8>>2]=h;b=c[3320]|0;if((b|0)!=0){q=b;$c(q,g);r=c[3322]|0;s=r+1|0;c[3322]=s;yc(h);i=d;return r|0}b=Tc()|0;c[3320]=b;q=b;$c(q,g);r=c[3322]|0;s=r+1|0;c[3322]=s;yc(h);i=d;return r|0}function Th(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=i;i=i+16|0;d=b;e=c[3320]|0;if((e|0)==0){f=Tc()|0;c[3320]=f;g=f}else{g=e}Vc(g,a,d);i=b;return c[d>>2]&255|0}function Uh(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=i;i=i+16|0;d=b;e=c[3320]|0;if((e|0)==0){f=Tc()|0;c[3320]=f;g=f}else{g=e}Vc(g,a,d);if((c[d>>2]&255|0)==1){i=b;return c[d+8>>2]|0}else{ua(13456,13368,302,13472)}return 0}function Vh(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0.0;b=i;i=i+16|0;d=b;e=c[3320]|0;if((e|0)==0){f=Tc()|0;c[3320]=f;g=f}else{g=e}Vc(g,a,d);a=c[d>>2]|0;if((a&255|0)!=2){ua(13488,13368,309,13504)}if((a&512|0)==0){j=+(c[d+8>>2]|0);i=b;return+j}else{j=+h[d+8>>3];i=b;return+j}return 0.0}function Wh(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=i;i=i+16|0;d=b;e=c[3320]|0;if((e|0)==0){f=Tc()|0;c[3320]=f;g=f}else{g=e}Vc(g,a,d);if((c[d>>2]&255|0)==3){i=b;return c[(c[d+8>>2]|0)+8>>2]|0}else{ua(13520,13368,316,13536)}return 0}function Xh(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;b=i;i=i+32|0;d=b+16|0;e=b;do{if((c[3388]|0)==0){f=c[3318]|0;if((f|0)==0){g=ud()|0;c[3318]=g;Gd(g,0,14040,3);h=c[3318]|0}else{h=f}f=zd(h,13560)|0;c[3388]=f;if((f|0)!=0){break}ua(13696,13368,335,13728)}}while(0);Ac(d,a);a=c[3318]|0;if((a|0)==0){h=ud()|0;c[3318]=h;Gd(h,0,14040,3);j=c[3318]|0}else{j=a}if((Bd(j,c[3388]|0,e,1,d)|0)!=0){ua(13752,13368,348,13728)}d=c[3320]|0;if((d|0)!=0){k=d;$c(k,e);l=c[3322]|0;m=l+1|0;c[3322]=m;Fc(e);i=b;return l|0}d=Tc()|0;c[3320]=d;k=d;$c(k,e);l=c[3322]|0;m=l+1|0;c[3322]=m;Fc(e);i=b;return l|0}function Yh(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;i=i+16|0;e=d;Vc(a,b,e);if((c[e>>2]&767|0)==2){i=d;return c[e+8>>2]|0}else{ua(13768,13368,418,13784)}return 0}function Zh(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;e=c[3320]|0;if((e|0)==0){f=Tc()|0;c[3320]=f;g=f}else{g=e}$c(g,a+(b<<4)|0);b=c[3322]|0;c[3322]=b+1;i=d;return b|0}function _h(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=i;i=i+16|0;d=b;e=c[3320]|0;if((e|0)==0){f=Tc()|0;c[3320]=f;g=f}else{g=e}Vc(g,a,d);if((c[d>>2]&255|0)==4){a=Uc(c[d+8>>2]|0)|0;i=b;return a|0}else{ua(13808,13368,435,13824)}return 0}function $h(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=i;i=i+16|0;d=b;e=c[3320]|0;if((e|0)==0){f=Tc()|0;c[3320]=f;g=f}else{g=e}Vc(g,a,d);if((c[d>>2]&255|0)==5){a=Qd(c[d+8>>2]|0)|0;i=b;return a|0}else{ua(13856,13368,442,13872)}return 0}function ai(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;d=i;i=i+32|0;e=d+16|0;f=d;g=c[3320]|0;if((g|0)==0){h=Tc()|0;c[3320]=h;j=h}else{j=g}Vc(j,a,e);if((c[e>>2]&255|0)!=4){ua(13904,13368,449,13928)}a=c[e+8>>2]|0;e=Uc(a)|0;if((e|0)==0){i=d;return}else{k=0}do{Vc(a,k,f);j=c[3320]|0;if((j|0)==0){g=Tc()|0;c[3320]=g;l=g}else{l=j}$c(l,f);j=c[3322]|0;c[3322]=j+1;c[b+(k<<2)>>2]=j;k=k+1|0;}while((k|0)!=(e|0));i=d;return}function bi(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;d=i;i=i+48|0;e=d+32|0;f=d+16|0;g=d;h=c[3320]|0;if((h|0)==0){j=Tc()|0;c[3320]=j;k=j}else{k=h}Vc(k,a,e);if((c[e>>2]&255|0)!=5){ua(13968,13368,464,13992)}a=c[e+8>>2]|0;e=Yd(a,0,f,g)|0;if((e|0)==0){i=d;return}else{l=e;m=0}while(1){e=c[3320]|0;if((e|0)==0){k=Tc()|0;c[3320]=k;n=k}else{n=e}$c(n,f);e=c[3322]|0;c[3322]=e+1;k=m<<1;c[b+(k<<2)>>2]=e;e=c[3320]|0;if((e|0)==0){h=Tc()|0;c[3320]=h;o=h}else{o=e}$c(o,g);e=c[3322]|0;c[3322]=e+1;c[b+((k|1)<<2)>>2]=e;e=Yd(a,l,f,g)|0;if((e|0)==0){break}else{l=e;m=m+1|0}}i=d;return}function ci(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;e=i;if((b|0)!=2){ua(14208,13368,368,14064)}if((c[d>>2]&767|0)!=2){ua(14224,13368,369,14064)}if((c[d+16>>2]&255|0)!=4){ua(14240,13368,370,14064)}b=c[d+8>>2]|0;f=c[d+24>>2]|0;d=_a(b|0,Uc(f)|0,f|0)|0;f=c[3320]|0;if((f|0)!=0){g=f;Vc(g,d,a);Ec(a);i=e;return 0}f=Tc()|0;c[3320]=f;g=f;Vc(g,d,a);Ec(a);i=e;return 0}function di(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;e=i;i=i+16|0;f=e;if((b|0)<=0){ua(14192,13368,358,14088)}b=c[3320]|0;if((b|0)==0){g=Tc()|0;c[3320]=g;h=g}else{h=b}$c(h,d);d=c[3322]|0;c[3322]=d+1;Ac(f,d);c[a+0>>2]=c[f+0>>2];c[a+4>>2]=c[f+4>>2];c[a+8>>2]=c[f+8>>2];c[a+12>>2]=c[f+12>>2];i=e;return 0}function ei(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;if((b|0)!=1){Dd(e,14120,0);g=-1;i=f;return g|0}if((c[d>>2]&255|0)!=3){Dd(e,14144,0);g=-2;i=f;return g|0}b=yb(c[(c[d+8>>2]|0)+8>>2]|0)|0;if((b|0)<0){Dd(e,14176,0);g=-3;i=f;return g|0}e=c[3320]|0;if((e|0)==0){d=Tc()|0;c[3320]=d;h=d}else{h=e}Vc(h,b,a);Ec(a);g=0;i=f;return g|0}function fi(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,za=0,Aa=0,Ba=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0;b=i;do{if(a>>>0<245){if(a>>>0<11){d=16}else{d=a+11&-8}e=d>>>3;f=c[3566]|0;g=f>>>e;if((g&3|0)!=0){h=(g&1^1)+e|0;j=h<<1;k=14304+(j<<2)|0;l=14304+(j+2<<2)|0;j=c[l>>2]|0;m=j+8|0;n=c[m>>2]|0;do{if((k|0)==(n|0)){c[3566]=f&~(1<<h)}else{if(n>>>0<(c[14280>>2]|0)>>>0){Ab()}o=n+12|0;if((c[o>>2]|0)==(j|0)){c[o>>2]=k;c[l>>2]=n;break}else{Ab()}}}while(0);n=h<<3;c[j+4>>2]=n|3;l=j+(n|4)|0;c[l>>2]=c[l>>2]|1;p=m;i=b;return p|0}if(!(d>>>0>(c[14272>>2]|0)>>>0)){q=d;break}if((g|0)!=0){l=2<<e;n=g<<e&(l|0-l);l=(n&0-n)+ -1|0;n=l>>>12&16;k=l>>>n;l=k>>>5&8;o=k>>>l;k=o>>>2&4;r=o>>>k;o=r>>>1&2;s=r>>>o;r=s>>>1&1;t=(l|n|k|o|r)+(s>>>r)|0;r=t<<1;s=14304+(r<<2)|0;o=14304+(r+2<<2)|0;r=c[o>>2]|0;k=r+8|0;n=c[k>>2]|0;do{if((s|0)==(n|0)){c[3566]=f&~(1<<t)}else{if(n>>>0<(c[14280>>2]|0)>>>0){Ab()}l=n+12|0;if((c[l>>2]|0)==(r|0)){c[l>>2]=s;c[o>>2]=n;break}else{Ab()}}}while(0);n=t<<3;o=n-d|0;c[r+4>>2]=d|3;s=r+d|0;c[r+(d|4)>>2]=o|1;c[r+n>>2]=o;n=c[14272>>2]|0;if((n|0)!=0){f=c[14284>>2]|0;e=n>>>3;n=e<<1;g=14304+(n<<2)|0;m=c[3566]|0;j=1<<e;do{if((m&j|0)==0){c[3566]=m|j;u=14304+(n+2<<2)|0;v=g}else{e=14304+(n+2<<2)|0;h=c[e>>2]|0;if(!(h>>>0<(c[14280>>2]|0)>>>0)){u=e;v=h;break}Ab()}}while(0);c[u>>2]=f;c[v+12>>2]=f;c[f+8>>2]=v;c[f+12>>2]=g}c[14272>>2]=o;c[14284>>2]=s;p=k;i=b;return p|0}n=c[14268>>2]|0;if((n|0)==0){q=d;break}j=(n&0-n)+ -1|0;n=j>>>12&16;m=j>>>n;j=m>>>5&8;r=m>>>j;m=r>>>2&4;t=r>>>m;r=t>>>1&2;h=t>>>r;t=h>>>1&1;e=c[14568+((j|n|m|r|t)+(h>>>t)<<2)>>2]|0;t=(c[e+4>>2]&-8)-d|0;h=e;r=e;while(1){e=c[h+16>>2]|0;if((e|0)==0){m=c[h+20>>2]|0;if((m|0)==0){break}else{w=m}}else{w=e}e=(c[w+4>>2]&-8)-d|0;m=e>>>0<t>>>0;t=m?e:t;h=w;r=m?w:r}h=c[14280>>2]|0;if(r>>>0<h>>>0){Ab()}k=r+d|0;if(!(r>>>0<k>>>0)){Ab()}s=c[r+24>>2]|0;o=c[r+12>>2]|0;do{if((o|0)==(r|0)){g=r+20|0;f=c[g>>2]|0;if((f|0)==0){m=r+16|0;e=c[m>>2]|0;if((e|0)==0){x=0;break}else{y=e;z=m}}else{y=f;z=g}while(1){g=y+20|0;f=c[g>>2]|0;if((f|0)!=0){z=g;y=f;continue}f=y+16|0;g=c[f>>2]|0;if((g|0)==0){break}else{y=g;z=f}}if(z>>>0<h>>>0){Ab()}else{c[z>>2]=0;x=y;break}}else{f=c[r+8>>2]|0;if(f>>>0<h>>>0){Ab()}g=f+12|0;if((c[g>>2]|0)!=(r|0)){Ab()}m=o+8|0;if((c[m>>2]|0)==(r|0)){c[g>>2]=o;c[m>>2]=f;x=o;break}else{Ab()}}}while(0);a:do{if((s|0)!=0){o=c[r+28>>2]|0;h=14568+(o<<2)|0;do{if((r|0)==(c[h>>2]|0)){c[h>>2]=x;if((x|0)!=0){break}c[14268>>2]=c[14268>>2]&~(1<<o);break a}else{if(s>>>0<(c[14280>>2]|0)>>>0){Ab()}f=s+16|0;if((c[f>>2]|0)==(r|0)){c[f>>2]=x}else{c[s+20>>2]=x}if((x|0)==0){break a}}}while(0);if(x>>>0<(c[14280>>2]|0)>>>0){Ab()}c[x+24>>2]=s;o=c[r+16>>2]|0;do{if((o|0)!=0){if(o>>>0<(c[14280>>2]|0)>>>0){Ab()}else{c[x+16>>2]=o;c[o+24>>2]=x;break}}}while(0);o=c[r+20>>2]|0;if((o|0)==0){break}if(o>>>0<(c[14280>>2]|0)>>>0){Ab()}else{c[x+20>>2]=o;c[o+24>>2]=x;break}}}while(0);if(t>>>0<16){s=t+d|0;c[r+4>>2]=s|3;o=r+(s+4)|0;c[o>>2]=c[o>>2]|1}else{c[r+4>>2]=d|3;c[r+(d|4)>>2]=t|1;c[r+(t+d)>>2]=t;o=c[14272>>2]|0;if((o|0)!=0){s=c[14284>>2]|0;h=o>>>3;o=h<<1;f=14304+(o<<2)|0;m=c[3566]|0;g=1<<h;do{if((m&g|0)==0){c[3566]=m|g;A=14304+(o+2<<2)|0;B=f}else{h=14304+(o+2<<2)|0;e=c[h>>2]|0;if(!(e>>>0<(c[14280>>2]|0)>>>0)){A=h;B=e;break}Ab()}}while(0);c[A>>2]=s;c[B+12>>2]=s;c[s+8>>2]=B;c[s+12>>2]=f}c[14272>>2]=t;c[14284>>2]=k}p=r+8|0;i=b;return p|0}else{if(a>>>0>4294967231){q=-1;break}o=a+11|0;g=o&-8;m=c[14268>>2]|0;if((m|0)==0){q=g;break}e=0-g|0;h=o>>>8;do{if((h|0)==0){C=0}else{if(g>>>0>16777215){C=31;break}o=(h+1048320|0)>>>16&8;n=h<<o;j=(n+520192|0)>>>16&4;l=n<<j;n=(l+245760|0)>>>16&2;D=14-(j|o|n)+(l<<n>>>15)|0;C=g>>>(D+7|0)&1|D<<1}}while(0);h=c[14568+(C<<2)>>2]|0;b:do{if((h|0)==0){E=e;F=0;G=0}else{if((C|0)==31){H=0}else{H=25-(C>>>1)|0}r=e;k=0;t=g<<H;f=h;s=0;while(1){D=c[f+4>>2]&-8;n=D-g|0;if(n>>>0<r>>>0){if((D|0)==(g|0)){E=n;F=f;G=f;break b}else{I=n;J=f}}else{I=r;J=s}n=c[f+20>>2]|0;D=c[f+(t>>>31<<2)+16>>2]|0;l=(n|0)==0|(n|0)==(D|0)?k:n;if((D|0)==0){E=I;F=l;G=J;break}else{r=I;k=l;t=t<<1;f=D;s=J}}}}while(0);if((F|0)==0&(G|0)==0){h=2<<C;e=m&(h|0-h);if((e|0)==0){q=g;break}h=(e&0-e)+ -1|0;e=h>>>12&16;s=h>>>e;h=s>>>5&8;f=s>>>h;s=f>>>2&4;t=f>>>s;f=t>>>1&2;k=t>>>f;t=k>>>1&1;K=c[14568+((h|e|s|f|t)+(k>>>t)<<2)>>2]|0}else{K=F}if((K|0)==0){L=E;M=G}else{t=E;k=K;f=G;while(1){s=(c[k+4>>2]&-8)-g|0;e=s>>>0<t>>>0;h=e?s:t;s=e?k:f;e=c[k+16>>2]|0;if((e|0)!=0){N=s;O=h;f=N;k=e;t=O;continue}e=c[k+20>>2]|0;if((e|0)==0){L=h;M=s;break}else{N=s;O=h;k=e;f=N;t=O}}}if((M|0)==0){q=g;break}if(!(L>>>0<((c[14272>>2]|0)-g|0)>>>0)){q=g;break}t=c[14280>>2]|0;if(M>>>0<t>>>0){Ab()}f=M+g|0;if(!(M>>>0<f>>>0)){Ab()}k=c[M+24>>2]|0;m=c[M+12>>2]|0;do{if((m|0)==(M|0)){e=M+20|0;h=c[e>>2]|0;if((h|0)==0){s=M+16|0;r=c[s>>2]|0;if((r|0)==0){P=0;break}else{Q=r;R=s}}else{Q=h;R=e}while(1){e=Q+20|0;h=c[e>>2]|0;if((h|0)!=0){R=e;Q=h;continue}h=Q+16|0;e=c[h>>2]|0;if((e|0)==0){break}else{Q=e;R=h}}if(R>>>0<t>>>0){Ab()}else{c[R>>2]=0;P=Q;break}}else{h=c[M+8>>2]|0;if(h>>>0<t>>>0){Ab()}e=h+12|0;if((c[e>>2]|0)!=(M|0)){Ab()}s=m+8|0;if((c[s>>2]|0)==(M|0)){c[e>>2]=m;c[s>>2]=h;P=m;break}else{Ab()}}}while(0);c:do{if((k|0)!=0){m=c[M+28>>2]|0;t=14568+(m<<2)|0;do{if((M|0)==(c[t>>2]|0)){c[t>>2]=P;if((P|0)!=0){break}c[14268>>2]=c[14268>>2]&~(1<<m);break c}else{if(k>>>0<(c[14280>>2]|0)>>>0){Ab()}h=k+16|0;if((c[h>>2]|0)==(M|0)){c[h>>2]=P}else{c[k+20>>2]=P}if((P|0)==0){break c}}}while(0);if(P>>>0<(c[14280>>2]|0)>>>0){Ab()}c[P+24>>2]=k;m=c[M+16>>2]|0;do{if((m|0)!=0){if(m>>>0<(c[14280>>2]|0)>>>0){Ab()}else{c[P+16>>2]=m;c[m+24>>2]=P;break}}}while(0);m=c[M+20>>2]|0;if((m|0)==0){break}if(m>>>0<(c[14280>>2]|0)>>>0){Ab()}else{c[P+20>>2]=m;c[m+24>>2]=P;break}}}while(0);d:do{if(L>>>0<16){k=L+g|0;c[M+4>>2]=k|3;m=M+(k+4)|0;c[m>>2]=c[m>>2]|1}else{c[M+4>>2]=g|3;c[M+(g|4)>>2]=L|1;c[M+(L+g)>>2]=L;m=L>>>3;if(L>>>0<256){k=m<<1;t=14304+(k<<2)|0;h=c[3566]|0;s=1<<m;do{if((h&s|0)==0){c[3566]=h|s;S=14304+(k+2<<2)|0;T=t}else{m=14304+(k+2<<2)|0;e=c[m>>2]|0;if(!(e>>>0<(c[14280>>2]|0)>>>0)){S=m;T=e;break}Ab()}}while(0);c[S>>2]=f;c[T+12>>2]=f;c[M+(g+8)>>2]=T;c[M+(g+12)>>2]=t;break}k=L>>>8;do{if((k|0)==0){U=0}else{if(L>>>0>16777215){U=31;break}s=(k+1048320|0)>>>16&8;h=k<<s;e=(h+520192|0)>>>16&4;m=h<<e;h=(m+245760|0)>>>16&2;r=14-(e|s|h)+(m<<h>>>15)|0;U=L>>>(r+7|0)&1|r<<1}}while(0);k=14568+(U<<2)|0;c[M+(g+28)>>2]=U;c[M+(g+20)>>2]=0;c[M+(g+16)>>2]=0;t=c[14268>>2]|0;r=1<<U;if((t&r|0)==0){c[14268>>2]=t|r;c[k>>2]=f;c[M+(g+24)>>2]=k;c[M+(g+12)>>2]=f;c[M+(g+8)>>2]=f;break}r=c[k>>2]|0;if((U|0)==31){V=0}else{V=25-(U>>>1)|0}e:do{if((c[r+4>>2]&-8|0)==(L|0)){W=r}else{k=L<<V;t=r;while(1){X=t+(k>>>31<<2)+16|0;h=c[X>>2]|0;if((h|0)==0){break}if((c[h+4>>2]&-8|0)==(L|0)){W=h;break e}else{k=k<<1;t=h}}if(X>>>0<(c[14280>>2]|0)>>>0){Ab()}else{c[X>>2]=f;c[M+(g+24)>>2]=t;c[M+(g+12)>>2]=f;c[M+(g+8)>>2]=f;break d}}}while(0);r=W+8|0;k=c[r>>2]|0;h=c[14280>>2]|0;if(W>>>0<h>>>0){Ab()}if(k>>>0<h>>>0){Ab()}else{c[k+12>>2]=f;c[r>>2]=f;c[M+(g+8)>>2]=k;c[M+(g+12)>>2]=W;c[M+(g+24)>>2]=0;break}}}while(0);p=M+8|0;i=b;return p|0}}while(0);M=c[14272>>2]|0;if(!(q>>>0>M>>>0)){W=M-q|0;X=c[14284>>2]|0;if(W>>>0>15){c[14284>>2]=X+q;c[14272>>2]=W;c[X+(q+4)>>2]=W|1;c[X+M>>2]=W;c[X+4>>2]=q|3}else{c[14272>>2]=0;c[14284>>2]=0;c[X+4>>2]=M|3;W=X+(M+4)|0;c[W>>2]=c[W>>2]|1}p=X+8|0;i=b;return p|0}X=c[14276>>2]|0;if(q>>>0<X>>>0){W=X-q|0;c[14276>>2]=W;X=c[14288>>2]|0;c[14288>>2]=X+q;c[X+(q+4)>>2]=W|1;c[X+4>>2]=q|3;p=X+8|0;i=b;return p|0}do{if((c[3684]|0)==0){X=Ca(30)|0;if((X+ -1&X|0)==0){c[14744>>2]=X;c[14740>>2]=X;c[14748>>2]=-1;c[14752>>2]=-1;c[14756>>2]=0;c[14708>>2]=0;c[3684]=(bb(0)|0)&-16^1431655768;break}else{Ab()}}}while(0);X=q+48|0;W=c[14744>>2]|0;M=q+47|0;L=W+M|0;V=0-W|0;W=L&V;if(!(W>>>0>q>>>0)){p=0;i=b;return p|0}U=c[14704>>2]|0;do{if((U|0)!=0){T=c[14696>>2]|0;S=T+W|0;if(S>>>0<=T>>>0|S>>>0>U>>>0){p=0}else{break}i=b;return p|0}}while(0);f:do{if((c[14708>>2]&4|0)==0){U=c[14288>>2]|0;g:do{if((U|0)==0){Y=182}else{S=14712|0;while(1){T=c[S>>2]|0;if(!(T>>>0>U>>>0)){Z=S+4|0;if((T+(c[Z>>2]|0)|0)>>>0>U>>>0){break}}T=c[S+8>>2]|0;if((T|0)==0){Y=182;break g}else{S=T}}if((S|0)==0){Y=182;break}T=L-(c[14276>>2]|0)&V;if(!(T>>>0<2147483647)){_=0;break}P=ya(T|0)|0;Q=(P|0)==((c[S>>2]|0)+(c[Z>>2]|0)|0);$=P;aa=T;ba=Q?P:-1;ca=Q?T:0;Y=191}}while(0);do{if((Y|0)==182){U=ya(0)|0;if((U|0)==(-1|0)){_=0;break}T=U;Q=c[14740>>2]|0;P=Q+ -1|0;if((P&T|0)==0){da=W}else{da=W-T+(P+T&0-Q)|0}Q=c[14696>>2]|0;T=Q+da|0;if(!(da>>>0>q>>>0&da>>>0<2147483647)){_=0;break}P=c[14704>>2]|0;if((P|0)!=0){if(T>>>0<=Q>>>0|T>>>0>P>>>0){_=0;break}}P=ya(da|0)|0;T=(P|0)==(U|0);$=P;aa=da;ba=T?U:-1;ca=T?da:0;Y=191}}while(0);h:do{if((Y|0)==191){T=0-aa|0;if((ba|0)!=(-1|0)){ea=ba;fa=ca;Y=202;break f}do{if(($|0)!=(-1|0)&aa>>>0<2147483647&aa>>>0<X>>>0){U=c[14744>>2]|0;P=M-aa+U&0-U;if(!(P>>>0<2147483647)){ga=aa;break}if((ya(P|0)|0)==(-1|0)){ya(T|0)|0;_=ca;break h}else{ga=P+aa|0;break}}else{ga=aa}}while(0);if(($|0)==(-1|0)){_=ca}else{ea=$;fa=ga;Y=202;break f}}}while(0);c[14708>>2]=c[14708>>2]|4;ha=_;Y=199}else{ha=0;Y=199}}while(0);do{if((Y|0)==199){if(!(W>>>0<2147483647)){break}_=ya(W|0)|0;ga=ya(0)|0;if(!((ga|0)!=(-1|0)&(_|0)!=(-1|0)&_>>>0<ga>>>0)){break}$=ga-_|0;ga=$>>>0>(q+40|0)>>>0;if(ga){ea=_;fa=ga?$:ha;Y=202}}}while(0);do{if((Y|0)==202){ha=(c[14696>>2]|0)+fa|0;c[14696>>2]=ha;if(ha>>>0>(c[14700>>2]|0)>>>0){c[14700>>2]=ha}ha=c[14288>>2]|0;i:do{if((ha|0)==0){W=c[14280>>2]|0;if((W|0)==0|ea>>>0<W>>>0){c[14280>>2]=ea}c[14712>>2]=ea;c[14716>>2]=fa;c[14724>>2]=0;c[14300>>2]=c[3684];c[14296>>2]=-1;W=0;do{$=W<<1;ga=14304+($<<2)|0;c[14304+($+3<<2)>>2]=ga;c[14304+($+2<<2)>>2]=ga;W=W+1|0;}while((W|0)!=32);W=ea+8|0;if((W&7|0)==0){ia=0}else{ia=0-W&7}W=fa+ -40-ia|0;c[14288>>2]=ea+ia;c[14276>>2]=W;c[ea+(ia+4)>>2]=W|1;c[ea+(fa+ -36)>>2]=40;c[14292>>2]=c[14752>>2]}else{W=14712|0;while(1){ja=c[W>>2]|0;ka=W+4|0;la=c[ka>>2]|0;if((ea|0)==(ja+la|0)){Y=214;break}ga=c[W+8>>2]|0;if((ga|0)==0){break}else{W=ga}}do{if((Y|0)==214){if((c[W+12>>2]&8|0)!=0){break}if(!(ha>>>0>=ja>>>0&ha>>>0<ea>>>0)){break}c[ka>>2]=la+fa;ga=(c[14276>>2]|0)+fa|0;$=ha+8|0;if(($&7|0)==0){ma=0}else{ma=0-$&7}$=ga-ma|0;c[14288>>2]=ha+ma;c[14276>>2]=$;c[ha+(ma+4)>>2]=$|1;c[ha+(ga+4)>>2]=40;c[14292>>2]=c[14752>>2];break i}}while(0);if(ea>>>0<(c[14280>>2]|0)>>>0){c[14280>>2]=ea}W=ea+fa|0;ga=14712|0;while(1){if((c[ga>>2]|0)==(W|0)){Y=224;break}$=c[ga+8>>2]|0;if(($|0)==0){break}else{ga=$}}do{if((Y|0)==224){if((c[ga+12>>2]&8|0)!=0){break}c[ga>>2]=ea;W=ga+4|0;c[W>>2]=(c[W>>2]|0)+fa;W=ea+8|0;if((W&7|0)==0){na=0}else{na=0-W&7}W=ea+(fa+8)|0;if((W&7|0)==0){oa=0}else{oa=0-W&7}W=ea+(oa+fa)|0;$=na+q|0;_=ea+$|0;ca=W-(ea+na)-q|0;c[ea+(na+4)>>2]=q|3;j:do{if((W|0)==(c[14288>>2]|0)){aa=(c[14276>>2]|0)+ca|0;c[14276>>2]=aa;c[14288>>2]=_;c[ea+($+4)>>2]=aa|1}else{if((W|0)==(c[14284>>2]|0)){aa=(c[14272>>2]|0)+ca|0;c[14272>>2]=aa;c[14284>>2]=_;c[ea+($+4)>>2]=aa|1;c[ea+(aa+$)>>2]=aa;break}aa=fa+4|0;M=c[ea+(aa+oa)>>2]|0;if((M&3|0)==1){X=M&-8;ba=M>>>3;k:do{if(M>>>0<256){da=c[ea+((oa|8)+fa)>>2]|0;Z=c[ea+(fa+12+oa)>>2]|0;V=14304+(ba<<1<<2)|0;do{if((da|0)!=(V|0)){if(da>>>0<(c[14280>>2]|0)>>>0){Ab()}if((c[da+12>>2]|0)==(W|0)){break}Ab()}}while(0);if((Z|0)==(da|0)){c[3566]=c[3566]&~(1<<ba);break}do{if((Z|0)==(V|0)){pa=Z+8|0}else{if(Z>>>0<(c[14280>>2]|0)>>>0){Ab()}L=Z+8|0;if((c[L>>2]|0)==(W|0)){pa=L;break}Ab()}}while(0);c[da+12>>2]=Z;c[pa>>2]=da}else{V=c[ea+((oa|24)+fa)>>2]|0;L=c[ea+(fa+12+oa)>>2]|0;do{if((L|0)==(W|0)){T=oa|16;S=ea+(aa+T)|0;P=c[S>>2]|0;if((P|0)==0){U=ea+(T+fa)|0;T=c[U>>2]|0;if((T|0)==0){qa=0;break}else{ra=T;sa=U}}else{ra=P;sa=S}while(1){S=ra+20|0;P=c[S>>2]|0;if((P|0)!=0){sa=S;ra=P;continue}P=ra+16|0;S=c[P>>2]|0;if((S|0)==0){break}else{ra=S;sa=P}}if(sa>>>0<(c[14280>>2]|0)>>>0){Ab()}else{c[sa>>2]=0;qa=ra;break}}else{P=c[ea+((oa|8)+fa)>>2]|0;if(P>>>0<(c[14280>>2]|0)>>>0){Ab()}S=P+12|0;if((c[S>>2]|0)!=(W|0)){Ab()}U=L+8|0;if((c[U>>2]|0)==(W|0)){c[S>>2]=L;c[U>>2]=P;qa=L;break}else{Ab()}}}while(0);if((V|0)==0){break}L=c[ea+(fa+28+oa)>>2]|0;da=14568+(L<<2)|0;do{if((W|0)==(c[da>>2]|0)){c[da>>2]=qa;if((qa|0)!=0){break}c[14268>>2]=c[14268>>2]&~(1<<L);break k}else{if(V>>>0<(c[14280>>2]|0)>>>0){Ab()}Z=V+16|0;if((c[Z>>2]|0)==(W|0)){c[Z>>2]=qa}else{c[V+20>>2]=qa}if((qa|0)==0){break k}}}while(0);if(qa>>>0<(c[14280>>2]|0)>>>0){Ab()}c[qa+24>>2]=V;L=oa|16;da=c[ea+(L+fa)>>2]|0;do{if((da|0)!=0){if(da>>>0<(c[14280>>2]|0)>>>0){Ab()}else{c[qa+16>>2]=da;c[da+24>>2]=qa;break}}}while(0);da=c[ea+(aa+L)>>2]|0;if((da|0)==0){break}if(da>>>0<(c[14280>>2]|0)>>>0){Ab()}else{c[qa+20>>2]=da;c[da+24>>2]=qa;break}}}while(0);ta=ea+((X|oa)+fa)|0;ua=X+ca|0}else{ta=W;ua=ca}aa=ta+4|0;c[aa>>2]=c[aa>>2]&-2;c[ea+($+4)>>2]=ua|1;c[ea+(ua+$)>>2]=ua;aa=ua>>>3;if(ua>>>0<256){ba=aa<<1;M=14304+(ba<<2)|0;da=c[3566]|0;V=1<<aa;do{if((da&V|0)==0){c[3566]=da|V;va=14304+(ba+2<<2)|0;wa=M}else{aa=14304+(ba+2<<2)|0;Z=c[aa>>2]|0;if(!(Z>>>0<(c[14280>>2]|0)>>>0)){va=aa;wa=Z;break}Ab()}}while(0);c[va>>2]=_;c[wa+12>>2]=_;c[ea+($+8)>>2]=wa;c[ea+($+12)>>2]=M;break}ba=ua>>>8;do{if((ba|0)==0){xa=0}else{if(ua>>>0>16777215){xa=31;break}V=(ba+1048320|0)>>>16&8;da=ba<<V;X=(da+520192|0)>>>16&4;Z=da<<X;da=(Z+245760|0)>>>16&2;aa=14-(X|V|da)+(Z<<da>>>15)|0;xa=ua>>>(aa+7|0)&1|aa<<1}}while(0);ba=14568+(xa<<2)|0;c[ea+($+28)>>2]=xa;c[ea+($+20)>>2]=0;c[ea+($+16)>>2]=0;M=c[14268>>2]|0;aa=1<<xa;if((M&aa|0)==0){c[14268>>2]=M|aa;c[ba>>2]=_;c[ea+($+24)>>2]=ba;c[ea+($+12)>>2]=_;c[ea+($+8)>>2]=_;break}aa=c[ba>>2]|0;if((xa|0)==31){za=0}else{za=25-(xa>>>1)|0}l:do{if((c[aa+4>>2]&-8|0)==(ua|0)){Aa=aa}else{ba=ua<<za;M=aa;while(1){Ba=M+(ba>>>31<<2)+16|0;da=c[Ba>>2]|0;if((da|0)==0){break}if((c[da+4>>2]&-8|0)==(ua|0)){Aa=da;break l}else{ba=ba<<1;M=da}}if(Ba>>>0<(c[14280>>2]|0)>>>0){Ab()}else{c[Ba>>2]=_;c[ea+($+24)>>2]=M;c[ea+($+12)>>2]=_;c[ea+($+8)>>2]=_;break j}}}while(0);aa=Aa+8|0;ba=c[aa>>2]|0;L=c[14280>>2]|0;if(Aa>>>0<L>>>0){Ab()}if(ba>>>0<L>>>0){Ab()}else{c[ba+12>>2]=_;c[aa>>2]=_;c[ea+($+8)>>2]=ba;c[ea+($+12)>>2]=Aa;c[ea+($+24)>>2]=0;break}}}while(0);p=ea+(na|8)|0;i=b;return p|0}}while(0);ga=14712|0;while(1){Da=c[ga>>2]|0;if(!(Da>>>0>ha>>>0)){Ea=c[ga+4>>2]|0;Fa=Da+Ea|0;if(Fa>>>0>ha>>>0){break}}ga=c[ga+8>>2]|0}ga=Da+(Ea+ -39)|0;if((ga&7|0)==0){Ga=0}else{Ga=0-ga&7}ga=Da+(Ea+ -47+Ga)|0;$=ga>>>0<(ha+16|0)>>>0?ha:ga;ga=$+8|0;_=ea+8|0;if((_&7|0)==0){Ha=0}else{Ha=0-_&7}_=fa+ -40-Ha|0;c[14288>>2]=ea+Ha;c[14276>>2]=_;c[ea+(Ha+4)>>2]=_|1;c[ea+(fa+ -36)>>2]=40;c[14292>>2]=c[14752>>2];c[$+4>>2]=27;c[ga+0>>2]=c[14712>>2];c[ga+4>>2]=c[14716>>2];c[ga+8>>2]=c[14720>>2];c[ga+12>>2]=c[14724>>2];c[14712>>2]=ea;c[14716>>2]=fa;c[14724>>2]=0;c[14720>>2]=ga;ga=$+28|0;c[ga>>2]=7;if(($+32|0)>>>0<Fa>>>0){_=ga;while(1){ga=_+4|0;c[ga>>2]=7;if((_+8|0)>>>0<Fa>>>0){_=ga}else{break}}}if(($|0)==(ha|0)){break}_=$-ha|0;ga=ha+(_+4)|0;c[ga>>2]=c[ga>>2]&-2;c[ha+4>>2]=_|1;c[ha+_>>2]=_;ga=_>>>3;if(_>>>0<256){ca=ga<<1;W=14304+(ca<<2)|0;t=c[3566]|0;ba=1<<ga;do{if((t&ba|0)==0){c[3566]=t|ba;Ia=14304+(ca+2<<2)|0;Ja=W}else{ga=14304+(ca+2<<2)|0;aa=c[ga>>2]|0;if(!(aa>>>0<(c[14280>>2]|0)>>>0)){Ia=ga;Ja=aa;break}Ab()}}while(0);c[Ia>>2]=ha;c[Ja+12>>2]=ha;c[ha+8>>2]=Ja;c[ha+12>>2]=W;break}ca=_>>>8;do{if((ca|0)==0){Ka=0}else{if(_>>>0>16777215){Ka=31;break}ba=(ca+1048320|0)>>>16&8;t=ca<<ba;$=(t+520192|0)>>>16&4;aa=t<<$;t=(aa+245760|0)>>>16&2;ga=14-($|ba|t)+(aa<<t>>>15)|0;Ka=_>>>(ga+7|0)&1|ga<<1}}while(0);ca=14568+(Ka<<2)|0;c[ha+28>>2]=Ka;c[ha+20>>2]=0;c[ha+16>>2]=0;W=c[14268>>2]|0;ga=1<<Ka;if((W&ga|0)==0){c[14268>>2]=W|ga;c[ca>>2]=ha;c[ha+24>>2]=ca;c[ha+12>>2]=ha;c[ha+8>>2]=ha;break}ga=c[ca>>2]|0;if((Ka|0)==31){La=0}else{La=25-(Ka>>>1)|0}m:do{if((c[ga+4>>2]&-8|0)==(_|0)){Ma=ga}else{ca=_<<La;W=ga;while(1){Na=W+(ca>>>31<<2)+16|0;t=c[Na>>2]|0;if((t|0)==0){break}if((c[t+4>>2]&-8|0)==(_|0)){Ma=t;break m}else{ca=ca<<1;W=t}}if(Na>>>0<(c[14280>>2]|0)>>>0){Ab()}else{c[Na>>2]=ha;c[ha+24>>2]=W;c[ha+12>>2]=ha;c[ha+8>>2]=ha;break i}}}while(0);_=Ma+8|0;ga=c[_>>2]|0;ca=c[14280>>2]|0;if(Ma>>>0<ca>>>0){Ab()}if(ga>>>0<ca>>>0){Ab()}else{c[ga+12>>2]=ha;c[_>>2]=ha;c[ha+8>>2]=ga;c[ha+12>>2]=Ma;c[ha+24>>2]=0;break}}}while(0);ha=c[14276>>2]|0;if(!(ha>>>0>q>>>0)){break}ga=ha-q|0;c[14276>>2]=ga;ha=c[14288>>2]|0;c[14288>>2]=ha+q;c[ha+(q+4)>>2]=ga|1;c[ha+4>>2]=q|3;p=ha+8|0;i=b;return p|0}}while(0);c[(Tb()|0)>>2]=12;p=0;i=b;return p|0}function gi(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;b=i;if((a|0)==0){i=b;return}d=a+ -8|0;e=c[14280>>2]|0;if(d>>>0<e>>>0){Ab()}f=c[a+ -4>>2]|0;g=f&3;if((g|0)==1){Ab()}h=f&-8;j=a+(h+ -8)|0;a:do{if((f&1|0)==0){k=c[d>>2]|0;if((g|0)==0){i=b;return}l=-8-k|0;m=a+l|0;n=k+h|0;if(m>>>0<e>>>0){Ab()}if((m|0)==(c[14284>>2]|0)){o=a+(h+ -4)|0;if((c[o>>2]&3|0)!=3){p=m;q=n;break}c[14272>>2]=n;c[o>>2]=c[o>>2]&-2;c[a+(l+4)>>2]=n|1;c[j>>2]=n;i=b;return}o=k>>>3;if(k>>>0<256){k=c[a+(l+8)>>2]|0;r=c[a+(l+12)>>2]|0;s=14304+(o<<1<<2)|0;do{if((k|0)!=(s|0)){if(k>>>0<e>>>0){Ab()}if((c[k+12>>2]|0)==(m|0)){break}Ab()}}while(0);if((r|0)==(k|0)){c[3566]=c[3566]&~(1<<o);p=m;q=n;break}do{if((r|0)==(s|0)){t=r+8|0}else{if(r>>>0<e>>>0){Ab()}u=r+8|0;if((c[u>>2]|0)==(m|0)){t=u;break}Ab()}}while(0);c[k+12>>2]=r;c[t>>2]=k;p=m;q=n;break}s=c[a+(l+24)>>2]|0;o=c[a+(l+12)>>2]|0;do{if((o|0)==(m|0)){u=a+(l+20)|0;v=c[u>>2]|0;if((v|0)==0){w=a+(l+16)|0;x=c[w>>2]|0;if((x|0)==0){y=0;break}else{z=x;A=w}}else{z=v;A=u}while(1){u=z+20|0;v=c[u>>2]|0;if((v|0)!=0){A=u;z=v;continue}v=z+16|0;u=c[v>>2]|0;if((u|0)==0){break}else{z=u;A=v}}if(A>>>0<e>>>0){Ab()}else{c[A>>2]=0;y=z;break}}else{v=c[a+(l+8)>>2]|0;if(v>>>0<e>>>0){Ab()}u=v+12|0;if((c[u>>2]|0)!=(m|0)){Ab()}w=o+8|0;if((c[w>>2]|0)==(m|0)){c[u>>2]=o;c[w>>2]=v;y=o;break}else{Ab()}}}while(0);if((s|0)==0){p=m;q=n;break}o=c[a+(l+28)>>2]|0;k=14568+(o<<2)|0;do{if((m|0)==(c[k>>2]|0)){c[k>>2]=y;if((y|0)!=0){break}c[14268>>2]=c[14268>>2]&~(1<<o);p=m;q=n;break a}else{if(s>>>0<(c[14280>>2]|0)>>>0){Ab()}r=s+16|0;if((c[r>>2]|0)==(m|0)){c[r>>2]=y}else{c[s+20>>2]=y}if((y|0)==0){p=m;q=n;break a}}}while(0);if(y>>>0<(c[14280>>2]|0)>>>0){Ab()}c[y+24>>2]=s;o=c[a+(l+16)>>2]|0;do{if((o|0)!=0){if(o>>>0<(c[14280>>2]|0)>>>0){Ab()}else{c[y+16>>2]=o;c[o+24>>2]=y;break}}}while(0);o=c[a+(l+20)>>2]|0;if((o|0)==0){p=m;q=n;break}if(o>>>0<(c[14280>>2]|0)>>>0){Ab()}else{c[y+20>>2]=o;c[o+24>>2]=y;p=m;q=n;break}}else{p=d;q=h}}while(0);if(!(p>>>0<j>>>0)){Ab()}d=a+(h+ -4)|0;y=c[d>>2]|0;if((y&1|0)==0){Ab()}do{if((y&2|0)==0){if((j|0)==(c[14288>>2]|0)){e=(c[14276>>2]|0)+q|0;c[14276>>2]=e;c[14288>>2]=p;c[p+4>>2]=e|1;if((p|0)!=(c[14284>>2]|0)){i=b;return}c[14284>>2]=0;c[14272>>2]=0;i=b;return}if((j|0)==(c[14284>>2]|0)){e=(c[14272>>2]|0)+q|0;c[14272>>2]=e;c[14284>>2]=p;c[p+4>>2]=e|1;c[p+e>>2]=e;i=b;return}e=(y&-8)+q|0;z=y>>>3;b:do{if(y>>>0<256){A=c[a+h>>2]|0;t=c[a+(h|4)>>2]|0;g=14304+(z<<1<<2)|0;do{if((A|0)!=(g|0)){if(A>>>0<(c[14280>>2]|0)>>>0){Ab()}if((c[A+12>>2]|0)==(j|0)){break}Ab()}}while(0);if((t|0)==(A|0)){c[3566]=c[3566]&~(1<<z);break}do{if((t|0)==(g|0)){B=t+8|0}else{if(t>>>0<(c[14280>>2]|0)>>>0){Ab()}f=t+8|0;if((c[f>>2]|0)==(j|0)){B=f;break}Ab()}}while(0);c[A+12>>2]=t;c[B>>2]=A}else{g=c[a+(h+16)>>2]|0;f=c[a+(h|4)>>2]|0;do{if((f|0)==(j|0)){o=a+(h+12)|0;s=c[o>>2]|0;if((s|0)==0){k=a+(h+8)|0;r=c[k>>2]|0;if((r|0)==0){C=0;break}else{D=r;E=k}}else{D=s;E=o}while(1){o=D+20|0;s=c[o>>2]|0;if((s|0)!=0){E=o;D=s;continue}s=D+16|0;o=c[s>>2]|0;if((o|0)==0){break}else{D=o;E=s}}if(E>>>0<(c[14280>>2]|0)>>>0){Ab()}else{c[E>>2]=0;C=D;break}}else{s=c[a+h>>2]|0;if(s>>>0<(c[14280>>2]|0)>>>0){Ab()}o=s+12|0;if((c[o>>2]|0)!=(j|0)){Ab()}k=f+8|0;if((c[k>>2]|0)==(j|0)){c[o>>2]=f;c[k>>2]=s;C=f;break}else{Ab()}}}while(0);if((g|0)==0){break}f=c[a+(h+20)>>2]|0;A=14568+(f<<2)|0;do{if((j|0)==(c[A>>2]|0)){c[A>>2]=C;if((C|0)!=0){break}c[14268>>2]=c[14268>>2]&~(1<<f);break b}else{if(g>>>0<(c[14280>>2]|0)>>>0){Ab()}t=g+16|0;if((c[t>>2]|0)==(j|0)){c[t>>2]=C}else{c[g+20>>2]=C}if((C|0)==0){break b}}}while(0);if(C>>>0<(c[14280>>2]|0)>>>0){Ab()}c[C+24>>2]=g;f=c[a+(h+8)>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[14280>>2]|0)>>>0){Ab()}else{c[C+16>>2]=f;c[f+24>>2]=C;break}}}while(0);f=c[a+(h+12)>>2]|0;if((f|0)==0){break}if(f>>>0<(c[14280>>2]|0)>>>0){Ab()}else{c[C+20>>2]=f;c[f+24>>2]=C;break}}}while(0);c[p+4>>2]=e|1;c[p+e>>2]=e;if((p|0)!=(c[14284>>2]|0)){F=e;break}c[14272>>2]=e;i=b;return}else{c[d>>2]=y&-2;c[p+4>>2]=q|1;c[p+q>>2]=q;F=q}}while(0);q=F>>>3;if(F>>>0<256){y=q<<1;d=14304+(y<<2)|0;C=c[3566]|0;h=1<<q;do{if((C&h|0)==0){c[3566]=C|h;G=14304+(y+2<<2)|0;H=d}else{q=14304+(y+2<<2)|0;a=c[q>>2]|0;if(!(a>>>0<(c[14280>>2]|0)>>>0)){G=q;H=a;break}Ab()}}while(0);c[G>>2]=p;c[H+12>>2]=p;c[p+8>>2]=H;c[p+12>>2]=d;i=b;return}d=F>>>8;do{if((d|0)==0){I=0}else{if(F>>>0>16777215){I=31;break}H=(d+1048320|0)>>>16&8;G=d<<H;y=(G+520192|0)>>>16&4;h=G<<y;G=(h+245760|0)>>>16&2;C=14-(y|H|G)+(h<<G>>>15)|0;I=F>>>(C+7|0)&1|C<<1}}while(0);d=14568+(I<<2)|0;c[p+28>>2]=I;c[p+20>>2]=0;c[p+16>>2]=0;C=c[14268>>2]|0;G=1<<I;c:do{if((C&G|0)==0){c[14268>>2]=C|G;c[d>>2]=p;c[p+24>>2]=d;c[p+12>>2]=p;c[p+8>>2]=p}else{h=c[d>>2]|0;if((I|0)==31){J=0}else{J=25-(I>>>1)|0}d:do{if((c[h+4>>2]&-8|0)==(F|0)){K=h}else{H=F<<J;y=h;while(1){L=y+(H>>>31<<2)+16|0;a=c[L>>2]|0;if((a|0)==0){break}if((c[a+4>>2]&-8|0)==(F|0)){K=a;break d}else{H=H<<1;y=a}}if(L>>>0<(c[14280>>2]|0)>>>0){Ab()}else{c[L>>2]=p;c[p+24>>2]=y;c[p+12>>2]=p;c[p+8>>2]=p;break c}}}while(0);h=K+8|0;e=c[h>>2]|0;H=c[14280>>2]|0;if(K>>>0<H>>>0){Ab()}if(e>>>0<H>>>0){Ab()}else{c[e+12>>2]=p;c[h>>2]=p;c[p+8>>2]=e;c[p+12>>2]=K;c[p+24>>2]=0;break}}}while(0);p=(c[14296>>2]|0)+ -1|0;c[14296>>2]=p;if((p|0)==0){M=14720|0}else{i=b;return}while(1){p=c[M>>2]|0;if((p|0)==0){break}else{M=p+8|0}}c[14296>>2]=-1;i=b;return}function hi(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;do{if((a|0)==0){e=0}else{f=da(b,a)|0;if(!((b|a)>>>0>65535)){e=f;break}e=((f>>>0)/(a>>>0)|0|0)==(b|0)?f:-1}}while(0);b=fi(e)|0;if((b|0)==0){i=d;return b|0}if((c[b+ -4>>2]&3|0)==0){i=d;return b|0}Fi(b|0,0,e|0)|0;i=d;return b|0}function ii(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0;d=i;do{if((a|0)==0){e=fi(b)|0}else{if(b>>>0>4294967231){c[(Tb()|0)>>2]=12;e=0;break}if(b>>>0<11){f=16}else{f=b+11&-8}g=ji(a+ -8|0,f)|0;if((g|0)!=0){e=g+8|0;break}g=fi(b)|0;if((g|0)==0){e=0;break}h=c[a+ -4>>2]|0;j=(h&-8)-((h&3|0)==0?8:4)|0;Ei(g|0,a|0,(j>>>0<b>>>0?j:b)|0)|0;gi(a);e=g}}while(0);i=d;return e|0}function ji(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;d=i;e=a+4|0;f=c[e>>2]|0;g=f&-8;h=a+g|0;j=c[14280>>2]|0;if(a>>>0<j>>>0){Ab()}k=f&3;if(!((k|0)!=1&a>>>0<h>>>0)){Ab()}l=a+(g|4)|0;m=c[l>>2]|0;if((m&1|0)==0){Ab()}if((k|0)==0){if(b>>>0<256){n=0;i=d;return n|0}do{if(!(g>>>0<(b+4|0)>>>0)){if((g-b|0)>>>0>c[14744>>2]<<1>>>0){break}else{n=a}i=d;return n|0}}while(0);n=0;i=d;return n|0}if(!(g>>>0<b>>>0)){k=g-b|0;if(!(k>>>0>15)){n=a;i=d;return n|0}c[e>>2]=f&1|b|2;c[a+(b+4)>>2]=k|3;c[l>>2]=c[l>>2]|1;ki(a+b|0,k);n=a;i=d;return n|0}if((h|0)==(c[14288>>2]|0)){k=(c[14276>>2]|0)+g|0;if(!(k>>>0>b>>>0)){n=0;i=d;return n|0}l=k-b|0;c[e>>2]=f&1|b|2;c[a+(b+4)>>2]=l|1;c[14288>>2]=a+b;c[14276>>2]=l;n=a;i=d;return n|0}if((h|0)==(c[14284>>2]|0)){l=(c[14272>>2]|0)+g|0;if(l>>>0<b>>>0){n=0;i=d;return n|0}k=l-b|0;if(k>>>0>15){c[e>>2]=f&1|b|2;c[a+(b+4)>>2]=k|1;c[a+l>>2]=k;o=a+(l+4)|0;c[o>>2]=c[o>>2]&-2;p=a+b|0;q=k}else{c[e>>2]=f&1|l|2;f=a+(l+4)|0;c[f>>2]=c[f>>2]|1;p=0;q=0}c[14272>>2]=q;c[14284>>2]=p;n=a;i=d;return n|0}if((m&2|0)!=0){n=0;i=d;return n|0}p=(m&-8)+g|0;if(p>>>0<b>>>0){n=0;i=d;return n|0}q=p-b|0;f=m>>>3;a:do{if(m>>>0<256){l=c[a+(g+8)>>2]|0;k=c[a+(g+12)>>2]|0;o=14304+(f<<1<<2)|0;do{if((l|0)!=(o|0)){if(l>>>0<j>>>0){Ab()}if((c[l+12>>2]|0)==(h|0)){break}Ab()}}while(0);if((k|0)==(l|0)){c[3566]=c[3566]&~(1<<f);break}do{if((k|0)==(o|0)){r=k+8|0}else{if(k>>>0<j>>>0){Ab()}s=k+8|0;if((c[s>>2]|0)==(h|0)){r=s;break}Ab()}}while(0);c[l+12>>2]=k;c[r>>2]=l}else{o=c[a+(g+24)>>2]|0;s=c[a+(g+12)>>2]|0;do{if((s|0)==(h|0)){t=a+(g+20)|0;u=c[t>>2]|0;if((u|0)==0){v=a+(g+16)|0;w=c[v>>2]|0;if((w|0)==0){x=0;break}else{y=w;z=v}}else{y=u;z=t}while(1){t=y+20|0;u=c[t>>2]|0;if((u|0)!=0){z=t;y=u;continue}u=y+16|0;t=c[u>>2]|0;if((t|0)==0){break}else{y=t;z=u}}if(z>>>0<j>>>0){Ab()}else{c[z>>2]=0;x=y;break}}else{u=c[a+(g+8)>>2]|0;if(u>>>0<j>>>0){Ab()}t=u+12|0;if((c[t>>2]|0)!=(h|0)){Ab()}v=s+8|0;if((c[v>>2]|0)==(h|0)){c[t>>2]=s;c[v>>2]=u;x=s;break}else{Ab()}}}while(0);if((o|0)==0){break}s=c[a+(g+28)>>2]|0;l=14568+(s<<2)|0;do{if((h|0)==(c[l>>2]|0)){c[l>>2]=x;if((x|0)!=0){break}c[14268>>2]=c[14268>>2]&~(1<<s);break a}else{if(o>>>0<(c[14280>>2]|0)>>>0){Ab()}k=o+16|0;if((c[k>>2]|0)==(h|0)){c[k>>2]=x}else{c[o+20>>2]=x}if((x|0)==0){break a}}}while(0);if(x>>>0<(c[14280>>2]|0)>>>0){Ab()}c[x+24>>2]=o;s=c[a+(g+16)>>2]|0;do{if((s|0)!=0){if(s>>>0<(c[14280>>2]|0)>>>0){Ab()}else{c[x+16>>2]=s;c[s+24>>2]=x;break}}}while(0);s=c[a+(g+20)>>2]|0;if((s|0)==0){break}if(s>>>0<(c[14280>>2]|0)>>>0){Ab()}else{c[x+20>>2]=s;c[s+24>>2]=x;break}}}while(0);if(q>>>0<16){c[e>>2]=p|c[e>>2]&1|2;x=a+(p|4)|0;c[x>>2]=c[x>>2]|1;n=a;i=d;return n|0}else{c[e>>2]=c[e>>2]&1|b|2;c[a+(b+4)>>2]=q|3;e=a+(p|4)|0;c[e>>2]=c[e>>2]|1;ki(a+b|0,q);n=a;i=d;return n|0}return 0}function ki(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;e=a+b|0;f=c[a+4>>2]|0;a:do{if((f&1|0)==0){g=c[a>>2]|0;if((f&3|0)==0){i=d;return}h=a+(0-g)|0;j=g+b|0;k=c[14280>>2]|0;if(h>>>0<k>>>0){Ab()}if((h|0)==(c[14284>>2]|0)){l=a+(b+4)|0;if((c[l>>2]&3|0)!=3){m=h;n=j;break}c[14272>>2]=j;c[l>>2]=c[l>>2]&-2;c[a+(4-g)>>2]=j|1;c[e>>2]=j;i=d;return}l=g>>>3;if(g>>>0<256){o=c[a+(8-g)>>2]|0;p=c[a+(12-g)>>2]|0;q=14304+(l<<1<<2)|0;do{if((o|0)!=(q|0)){if(o>>>0<k>>>0){Ab()}if((c[o+12>>2]|0)==(h|0)){break}Ab()}}while(0);if((p|0)==(o|0)){c[3566]=c[3566]&~(1<<l);m=h;n=j;break}do{if((p|0)==(q|0)){r=p+8|0}else{if(p>>>0<k>>>0){Ab()}s=p+8|0;if((c[s>>2]|0)==(h|0)){r=s;break}Ab()}}while(0);c[o+12>>2]=p;c[r>>2]=o;m=h;n=j;break}q=c[a+(24-g)>>2]|0;l=c[a+(12-g)>>2]|0;do{if((l|0)==(h|0)){s=16-g|0;t=a+(s+4)|0;u=c[t>>2]|0;if((u|0)==0){v=a+s|0;s=c[v>>2]|0;if((s|0)==0){w=0;break}else{x=s;y=v}}else{x=u;y=t}while(1){t=x+20|0;u=c[t>>2]|0;if((u|0)!=0){y=t;x=u;continue}u=x+16|0;t=c[u>>2]|0;if((t|0)==0){break}else{x=t;y=u}}if(y>>>0<k>>>0){Ab()}else{c[y>>2]=0;w=x;break}}else{u=c[a+(8-g)>>2]|0;if(u>>>0<k>>>0){Ab()}t=u+12|0;if((c[t>>2]|0)!=(h|0)){Ab()}v=l+8|0;if((c[v>>2]|0)==(h|0)){c[t>>2]=l;c[v>>2]=u;w=l;break}else{Ab()}}}while(0);if((q|0)==0){m=h;n=j;break}l=c[a+(28-g)>>2]|0;k=14568+(l<<2)|0;do{if((h|0)==(c[k>>2]|0)){c[k>>2]=w;if((w|0)!=0){break}c[14268>>2]=c[14268>>2]&~(1<<l);m=h;n=j;break a}else{if(q>>>0<(c[14280>>2]|0)>>>0){Ab()}o=q+16|0;if((c[o>>2]|0)==(h|0)){c[o>>2]=w}else{c[q+20>>2]=w}if((w|0)==0){m=h;n=j;break a}}}while(0);if(w>>>0<(c[14280>>2]|0)>>>0){Ab()}c[w+24>>2]=q;l=16-g|0;k=c[a+l>>2]|0;do{if((k|0)!=0){if(k>>>0<(c[14280>>2]|0)>>>0){Ab()}else{c[w+16>>2]=k;c[k+24>>2]=w;break}}}while(0);k=c[a+(l+4)>>2]|0;if((k|0)==0){m=h;n=j;break}if(k>>>0<(c[14280>>2]|0)>>>0){Ab()}else{c[w+20>>2]=k;c[k+24>>2]=w;m=h;n=j;break}}else{m=a;n=b}}while(0);w=c[14280>>2]|0;if(e>>>0<w>>>0){Ab()}x=a+(b+4)|0;y=c[x>>2]|0;do{if((y&2|0)==0){if((e|0)==(c[14288>>2]|0)){r=(c[14276>>2]|0)+n|0;c[14276>>2]=r;c[14288>>2]=m;c[m+4>>2]=r|1;if((m|0)!=(c[14284>>2]|0)){i=d;return}c[14284>>2]=0;c[14272>>2]=0;i=d;return}if((e|0)==(c[14284>>2]|0)){r=(c[14272>>2]|0)+n|0;c[14272>>2]=r;c[14284>>2]=m;c[m+4>>2]=r|1;c[m+r>>2]=r;i=d;return}r=(y&-8)+n|0;f=y>>>3;b:do{if(y>>>0<256){k=c[a+(b+8)>>2]|0;g=c[a+(b+12)>>2]|0;q=14304+(f<<1<<2)|0;do{if((k|0)!=(q|0)){if(k>>>0<w>>>0){Ab()}if((c[k+12>>2]|0)==(e|0)){break}Ab()}}while(0);if((g|0)==(k|0)){c[3566]=c[3566]&~(1<<f);break}do{if((g|0)==(q|0)){z=g+8|0}else{if(g>>>0<w>>>0){Ab()}o=g+8|0;if((c[o>>2]|0)==(e|0)){z=o;break}Ab()}}while(0);c[k+12>>2]=g;c[z>>2]=k}else{q=c[a+(b+24)>>2]|0;o=c[a+(b+12)>>2]|0;do{if((o|0)==(e|0)){p=a+(b+20)|0;u=c[p>>2]|0;if((u|0)==0){v=a+(b+16)|0;t=c[v>>2]|0;if((t|0)==0){A=0;break}else{B=t;C=v}}else{B=u;C=p}while(1){p=B+20|0;u=c[p>>2]|0;if((u|0)!=0){C=p;B=u;continue}u=B+16|0;p=c[u>>2]|0;if((p|0)==0){break}else{B=p;C=u}}if(C>>>0<w>>>0){Ab()}else{c[C>>2]=0;A=B;break}}else{u=c[a+(b+8)>>2]|0;if(u>>>0<w>>>0){Ab()}p=u+12|0;if((c[p>>2]|0)!=(e|0)){Ab()}v=o+8|0;if((c[v>>2]|0)==(e|0)){c[p>>2]=o;c[v>>2]=u;A=o;break}else{Ab()}}}while(0);if((q|0)==0){break}o=c[a+(b+28)>>2]|0;k=14568+(o<<2)|0;do{if((e|0)==(c[k>>2]|0)){c[k>>2]=A;if((A|0)!=0){break}c[14268>>2]=c[14268>>2]&~(1<<o);break b}else{if(q>>>0<(c[14280>>2]|0)>>>0){Ab()}g=q+16|0;if((c[g>>2]|0)==(e|0)){c[g>>2]=A}else{c[q+20>>2]=A}if((A|0)==0){break b}}}while(0);if(A>>>0<(c[14280>>2]|0)>>>0){Ab()}c[A+24>>2]=q;o=c[a+(b+16)>>2]|0;do{if((o|0)!=0){if(o>>>0<(c[14280>>2]|0)>>>0){Ab()}else{c[A+16>>2]=o;c[o+24>>2]=A;break}}}while(0);o=c[a+(b+20)>>2]|0;if((o|0)==0){break}if(o>>>0<(c[14280>>2]|0)>>>0){Ab()}else{c[A+20>>2]=o;c[o+24>>2]=A;break}}}while(0);c[m+4>>2]=r|1;c[m+r>>2]=r;if((m|0)!=(c[14284>>2]|0)){D=r;break}c[14272>>2]=r;i=d;return}else{c[x>>2]=y&-2;c[m+4>>2]=n|1;c[m+n>>2]=n;D=n}}while(0);n=D>>>3;if(D>>>0<256){y=n<<1;x=14304+(y<<2)|0;A=c[3566]|0;b=1<<n;do{if((A&b|0)==0){c[3566]=A|b;E=14304+(y+2<<2)|0;F=x}else{n=14304+(y+2<<2)|0;a=c[n>>2]|0;if(!(a>>>0<(c[14280>>2]|0)>>>0)){E=n;F=a;break}Ab()}}while(0);c[E>>2]=m;c[F+12>>2]=m;c[m+8>>2]=F;c[m+12>>2]=x;i=d;return}x=D>>>8;do{if((x|0)==0){G=0}else{if(D>>>0>16777215){G=31;break}F=(x+1048320|0)>>>16&8;E=x<<F;y=(E+520192|0)>>>16&4;b=E<<y;E=(b+245760|0)>>>16&2;A=14-(y|F|E)+(b<<E>>>15)|0;G=D>>>(A+7|0)&1|A<<1}}while(0);x=14568+(G<<2)|0;c[m+28>>2]=G;c[m+20>>2]=0;c[m+16>>2]=0;A=c[14268>>2]|0;E=1<<G;if((A&E|0)==0){c[14268>>2]=A|E;c[x>>2]=m;c[m+24>>2]=x;c[m+12>>2]=m;c[m+8>>2]=m;i=d;return}E=c[x>>2]|0;if((G|0)==31){H=0}else{H=25-(G>>>1)|0}c:do{if((c[E+4>>2]&-8|0)==(D|0)){I=E}else{G=D<<H;x=E;while(1){J=x+(G>>>31<<2)+16|0;A=c[J>>2]|0;if((A|0)==0){break}if((c[A+4>>2]&-8|0)==(D|0)){I=A;break c}else{G=G<<1;x=A}}if(J>>>0<(c[14280>>2]|0)>>>0){Ab()}c[J>>2]=m;c[m+24>>2]=x;c[m+12>>2]=m;c[m+8>>2]=m;i=d;return}}while(0);J=I+8|0;D=c[J>>2]|0;E=c[14280>>2]|0;if(I>>>0<E>>>0){Ab()}if(D>>>0<E>>>0){Ab()}c[D+12>>2]=m;c[J>>2]=m;c[m+8>>2]=D;c[m+12>>2]=I;c[m+24>>2]=0;i=d;return}function li(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0.0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,T=0.0,U=0,V=0.0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,ea=0,fa=0,ga=0,ha=0,ia=0.0,ja=0,ka=0.0,la=0,ma=0.0,na=0,oa=0.0,pa=0.0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0.0,ya=0,za=0.0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0.0,Fa=0,Ga=0.0,Ha=0.0,Ia=0,Ja=0.0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,fb=0,gb=0,hb=0,ib=0,jb=0,kb=0,lb=0,mb=0,nb=0,ob=0,pb=0,qb=0,rb=0,sb=0,tb=0,ub=0,vb=0,wb=0,xb=0,yb=0,zb=0,Ab=0,Bb=0,Db=0,Eb=0,Fb=0,Gb=0,Hb=0,Ib=0,Jb=0,Kb=0,Lb=0,Mb=0,Nb=0,Ob=0,Pb=0,Qb=0,Rb=0,Sb=0,Vb=0,Wb=0,Xb=0,Yb=0,Zb=0,_b=0,$b=0,ac=0,bc=0,cc=0,dc=0,ec=0,fc=0,gc=0,hc=0,ic=0,jc=0,kc=0,lc=0,mc=0,nc=0,oc=0,pc=0,qc=0,rc=0,sc=0,tc=0,uc=0,vc=0,wc=0,xc=0,yc=0,zc=0.0,Ac=0,Bc=0,Cc=0.0,Dc=0.0,Ec=0.0,Fc=0.0,Gc=0.0,Hc=0.0,Ic=0,Jc=0,Kc=0.0,Lc=0,Mc=0.0,Nc=0;g=i;i=i+512|0;h=g;if((e|0)==0){j=24;k=-149}else if((e|0)==2){j=53;k=-1074}else if((e|0)==1){j=53;k=-1074}else{l=0.0;i=g;return+l}e=b+4|0;m=b+100|0;do{n=c[e>>2]|0;if(n>>>0<(c[m>>2]|0)>>>0){c[e>>2]=n+1;o=d[n]|0}else{o=oi(b)|0}}while((Cb(o|0)|0)!=0);do{if((o|0)==43|(o|0)==45){n=1-(((o|0)==45)<<1)|0;p=c[e>>2]|0;if(p>>>0<(c[m>>2]|0)>>>0){c[e>>2]=p+1;q=d[p]|0;r=n;break}else{q=oi(b)|0;r=n;break}}else{q=o;r=1}}while(0);o=q;q=0;while(1){if((o|32|0)!=(a[14760+q|0]|0)){s=o;t=q;break}do{if(q>>>0<7){n=c[e>>2]|0;if(n>>>0<(c[m>>2]|0)>>>0){c[e>>2]=n+1;u=d[n]|0;break}else{u=oi(b)|0;break}}else{u=o}}while(0);n=q+1|0;if(n>>>0<8){o=u;q=n}else{s=u;t=n;break}}do{if((t|0)==3){v=23}else if((t|0)!=8){u=(f|0)==0;if(!(t>>>0<4|u)){if((t|0)==8){break}else{v=23;break}}a:do{if((t|0)==0){q=s;o=0;while(1){if((q|32|0)!=(a[14776+o|0]|0)){y=q;z=o;break a}do{if(o>>>0<2){n=c[e>>2]|0;if(n>>>0<(c[m>>2]|0)>>>0){c[e>>2]=n+1;A=d[n]|0;break}else{A=oi(b)|0;break}}else{A=q}}while(0);n=o+1|0;if(n>>>0<3){q=A;o=n}else{y=A;z=n;break}}}else{y=s;z=t}}while(0);if((z|0)==3){o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;B=d[o]|0}else{B=oi(b)|0}if((B|0)==40){C=1}else{if((c[m>>2]|0)==0){l=w;i=g;return+l}c[e>>2]=(c[e>>2]|0)+ -1;l=w;i=g;return+l}while(1){o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;D=d[o]|0}else{D=oi(b)|0}if(!((D+ -48|0)>>>0<10|(D+ -65|0)>>>0<26)){if(!((D+ -97|0)>>>0<26|(D|0)==95)){break}}C=C+1|0}if((D|0)==41){l=w;i=g;return+l}o=(c[m>>2]|0)==0;if(!o){c[e>>2]=(c[e>>2]|0)+ -1}if(u){c[(Tb()|0)>>2]=22;ni(b,0);l=0.0;i=g;return+l}if((C|0)==0|o){l=w;i=g;return+l}else{E=C}while(1){o=E+ -1|0;c[e>>2]=(c[e>>2]|0)+ -1;if((o|0)==0){l=w;break}else{E=o}}i=g;return+l}else if((z|0)==0){do{if((y|0)==48){o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;F=d[o]|0}else{F=oi(b)|0}if((F|32|0)!=120){if((c[m>>2]|0)==0){G=48;break}c[e>>2]=(c[e>>2]|0)+ -1;G=48;break}o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;I=d[o]|0;J=0}else{I=oi(b)|0;J=0}while(1){if((I|0)==46){v=70;break}else if((I|0)!=48){K=0;L=0;M=0;N=0;O=I;P=J;Q=0;R=0;T=1.0;U=0;V=0.0;break}o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;I=d[o]|0;J=1;continue}else{I=oi(b)|0;J=1;continue}}b:do{if((v|0)==70){o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;W=d[o]|0}else{W=oi(b)|0}if((W|0)==48){X=-1;Y=-1}else{K=0;L=0;M=0;N=0;O=W;P=J;Q=1;R=0;T=1.0;U=0;V=0.0;break}while(1){o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;Z=d[o]|0}else{Z=oi(b)|0}if((Z|0)!=48){K=0;L=0;M=X;N=Y;O=Z;P=1;Q=1;R=0;T=1.0;U=0;V=0.0;break b}o=Ai(X|0,Y|0,-1,-1)|0;X=o;Y=H}}}while(0);c:while(1){o=O+ -48|0;do{if(o>>>0<10){_=o;v=84}else{q=O|32;n=(O|0)==46;if(!((q+ -97|0)>>>0<6|n)){$=O;break c}if(n){if((Q|0)==0){aa=L;ba=K;ca=L;ea=K;fa=P;ga=1;ha=R;ia=T;ja=U;ka=V;break}else{$=46;break c}}else{_=(O|0)>57?q+ -87|0:o;v=84;break}}}while(0);if((v|0)==84){v=0;do{if((K|0)<0|(K|0)==0&L>>>0<8){la=R;ma=T;na=_+(U<<4)|0;oa=V}else{if((K|0)<0|(K|0)==0&L>>>0<14){pa=T*.0625;la=R;ma=pa;na=U;oa=V+pa*+(_|0);break}if(!((_|0)!=0&(R|0)==0)){la=R;ma=T;na=U;oa=V;break}la=1;ma=T;na=U;oa=V+T*.5}}while(0);o=Ai(L|0,K|0,1,0)|0;aa=M;ba=N;ca=o;ea=H;fa=1;ga=Q;ha=la;ia=ma;ja=na;ka=oa}o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;K=ea;L=ca;M=aa;N=ba;O=d[o]|0;P=fa;Q=ga;R=ha;T=ia;U=ja;V=ka;continue}else{K=ea;L=ca;M=aa;N=ba;O=oi(b)|0;P=fa;Q=ga;R=ha;T=ia;U=ja;V=ka;continue}}if((P|0)==0){o=(c[m>>2]|0)==0;if(!o){c[e>>2]=(c[e>>2]|0)+ -1}do{if(u){ni(b,0)}else{if(o){break}q=c[e>>2]|0;c[e>>2]=q+ -1;if((Q|0)==0){break}c[e>>2]=q+ -2}}while(0);l=+(r|0)*0.0;i=g;return+l}o=(Q|0)==0;q=o?L:M;n=o?K:N;if((K|0)<0|(K|0)==0&L>>>0<8){o=L;p=K;qa=U;while(1){ra=qa<<4;sa=Ai(o|0,p|0,1,0)|0;ta=H;if((ta|0)<0|(ta|0)==0&sa>>>0<8){qa=ra;p=ta;o=sa}else{ua=ra;break}}}else{ua=U}do{if(($|32|0)==112){o=mi(b,f)|0;p=H;if(!((o|0)==0&(p|0)==-2147483648)){va=o;wa=p;break}if(u){ni(b,0);l=0.0;i=g;return+l}else{if((c[m>>2]|0)==0){va=0;wa=0;break}c[e>>2]=(c[e>>2]|0)+ -1;va=0;wa=0;break}}else{if((c[m>>2]|0)==0){va=0;wa=0;break}c[e>>2]=(c[e>>2]|0)+ -1;va=0;wa=0}}while(0);p=Gi(q|0,n|0,2)|0;o=Ai(p|0,H|0,-32,-1)|0;p=Ai(o|0,H|0,va|0,wa|0)|0;o=H;if((ua|0)==0){l=+(r|0)*0.0;i=g;return+l}if((o|0)>0|(o|0)==0&p>>>0>(0-k|0)>>>0){c[(Tb()|0)>>2]=34;l=+(r|0)*1.7976931348623157e+308*1.7976931348623157e+308;i=g;return+l}qa=k+ -106|0;ra=((qa|0)<0)<<31>>31;if((o|0)<(ra|0)|(o|0)==(ra|0)&p>>>0<qa>>>0){c[(Tb()|0)>>2]=34;l=+(r|0)*2.2250738585072014e-308*2.2250738585072014e-308;i=g;return+l}if((ua|0)>-1){qa=p;ra=o;sa=ua;pa=V;while(1){ta=sa<<1;if(!(pa>=.5)){xa=pa;ya=ta}else{xa=pa+-1.0;ya=ta|1}za=pa+xa;ta=Ai(qa|0,ra|0,-1,-1)|0;Aa=H;if((ya|0)>-1){qa=ta;ra=Aa;sa=ya;pa=za}else{Ba=ta;Ca=Aa;Da=ya;Ea=za;break}}}else{Ba=p;Ca=o;Da=ua;Ea=V}sa=zi(32,0,k|0,((k|0)<0)<<31>>31|0)|0;ra=Ai(Ba|0,Ca|0,sa|0,H|0)|0;sa=H;if(0>(sa|0)|0==(sa|0)&j>>>0>ra>>>0){Fa=(ra|0)<0?0:ra}else{Fa=j}do{if((Fa|0)<53){pa=+(r|0);za=+Ub(+(+pi(1.0,84-Fa|0)),+pa);if(!((Fa|0)<32&Ea!=0.0)){Ga=pa;Ha=za;Ia=Da;Ja=Ea;break}ra=Da&1;Ga=pa;Ha=za;Ia=(ra^1)+Da|0;Ja=(ra|0)==0?0.0:Ea}else{Ga=+(r|0);Ha=0.0;Ia=Da;Ja=Ea}}while(0);za=Ga*Ja+(Ha+Ga*+(Ia>>>0))-Ha;if(!(za!=0.0)){c[(Tb()|0)>>2]=34}l=+qi(za,Ba);i=g;return+l}else{G=y}}while(0);o=k+j|0;p=0-o|0;ra=G;sa=0;while(1){if((ra|0)==46){v=139;break}else if((ra|0)!=48){Ka=ra;La=0;Ma=0;Na=sa;Oa=0;break}qa=c[e>>2]|0;if(qa>>>0<(c[m>>2]|0)>>>0){c[e>>2]=qa+1;ra=d[qa]|0;sa=1;continue}else{ra=oi(b)|0;sa=1;continue}}d:do{if((v|0)==139){ra=c[e>>2]|0;if(ra>>>0<(c[m>>2]|0)>>>0){c[e>>2]=ra+1;Pa=d[ra]|0}else{Pa=oi(b)|0}if((Pa|0)==48){Qa=-1;Ra=-1}else{Ka=Pa;La=0;Ma=0;Na=sa;Oa=1;break}while(1){ra=c[e>>2]|0;if(ra>>>0<(c[m>>2]|0)>>>0){c[e>>2]=ra+1;Sa=d[ra]|0}else{Sa=oi(b)|0}if((Sa|0)!=48){Ka=Sa;La=Qa;Ma=Ra;Na=1;Oa=1;break d}ra=Ai(Qa|0,Ra|0,-1,-1)|0;Qa=ra;Ra=H}}}while(0);c[h>>2]=0;sa=Ka+ -48|0;ra=(Ka|0)==46;e:do{if(sa>>>0<10|ra){qa=h+496|0;n=Ka;q=0;Aa=0;ta=ra;Ta=sa;Ua=La;Va=Ma;Wa=Na;Xa=Oa;Ya=0;Za=0;_a=0;while(1){do{if(ta){if((Xa|0)==0){$a=q;ab=Aa;bb=q;cb=Aa;db=Wa;fb=1;gb=Ya;hb=Za;ib=_a}else{jb=n;kb=Ua;lb=Va;mb=q;nb=Aa;ob=Wa;pb=Ya;qb=Za;rb=_a;break e}}else{sb=Ai(q|0,Aa|0,1,0)|0;tb=H;ub=(n|0)!=48;if((Za|0)>=125){if(!ub){$a=Ua;ab=Va;bb=sb;cb=tb;db=Wa;fb=Xa;gb=Ya;hb=Za;ib=_a;break}c[qa>>2]=c[qa>>2]|1;$a=Ua;ab=Va;bb=sb;cb=tb;db=Wa;fb=Xa;gb=Ya;hb=Za;ib=_a;break}vb=h+(Za<<2)|0;if((Ya|0)==0){wb=Ta}else{wb=n+ -48+((c[vb>>2]|0)*10|0)|0}c[vb>>2]=wb;vb=Ya+1|0;xb=(vb|0)==9;$a=Ua;ab=Va;bb=sb;cb=tb;db=1;fb=Xa;gb=xb?0:vb;hb=(xb&1)+Za|0;ib=ub?sb:_a}}while(0);sb=c[e>>2]|0;if(sb>>>0<(c[m>>2]|0)>>>0){c[e>>2]=sb+1;yb=d[sb]|0}else{yb=oi(b)|0}sb=yb+ -48|0;ub=(yb|0)==46;if(sb>>>0<10|ub){n=yb;q=bb;Aa=cb;ta=ub;Ta=sb;Ua=$a;Va=ab;Wa=db;Xa=fb;Ya=gb;Za=hb;_a=ib}else{zb=yb;Ab=bb;Bb=$a;Db=cb;Eb=ab;Fb=db;Gb=fb;Hb=gb;Ib=hb;Jb=ib;v=162;break}}}else{zb=Ka;Ab=0;Bb=La;Db=0;Eb=Ma;Fb=Na;Gb=Oa;Hb=0;Ib=0;Jb=0;v=162}}while(0);if((v|0)==162){sa=(Gb|0)==0;jb=zb;kb=sa?Ab:Bb;lb=sa?Db:Eb;mb=Ab;nb=Db;ob=Fb;pb=Hb;qb=Ib;rb=Jb}sa=(ob|0)!=0;do{if(sa){if((jb|32|0)!=101){v=171;break}ra=mi(b,f)|0;_a=H;do{if((ra|0)==0&(_a|0)==-2147483648){if(u){ni(b,0);l=0.0;i=g;return+l}else{if((c[m>>2]|0)==0){Kb=0;Lb=0;break}c[e>>2]=(c[e>>2]|0)+ -1;Kb=0;Lb=0;break}}else{Kb=ra;Lb=_a}}while(0);_a=Ai(Kb|0,Lb|0,kb|0,lb|0)|0;Mb=_a;Nb=H}else{v=171}}while(0);do{if((v|0)==171){if(!((jb|0)>-1)){Mb=kb;Nb=lb;break}if((c[m>>2]|0)==0){Mb=kb;Nb=lb;break}c[e>>2]=(c[e>>2]|0)+ -1;Mb=kb;Nb=lb}}while(0);if(!sa){c[(Tb()|0)>>2]=22;ni(b,0);l=0.0;i=g;return+l}u=c[h>>2]|0;if((u|0)==0){l=+(r|0)*0.0;i=g;return+l}do{if((Mb|0)==(mb|0)&(Nb|0)==(nb|0)&((nb|0)<0|(nb|0)==0&mb>>>0<10)){if(!(j>>>0>30)){if((u>>>j|0)!=0){break}}l=+(r|0)*+(u>>>0);i=g;return+l}}while(0);u=(k|0)/-2|0;sa=((u|0)<0)<<31>>31;if((Nb|0)>(sa|0)|(Nb|0)==(sa|0)&Mb>>>0>u>>>0){c[(Tb()|0)>>2]=34;l=+(r|0)*1.7976931348623157e+308*1.7976931348623157e+308;i=g;return+l}u=k+ -106|0;sa=((u|0)<0)<<31>>31;if((Nb|0)<(sa|0)|(Nb|0)==(sa|0)&Mb>>>0<u>>>0){c[(Tb()|0)>>2]=34;l=+(r|0)*2.2250738585072014e-308*2.2250738585072014e-308;i=g;return+l}if((pb|0)==0){Ob=qb}else{if((pb|0)<9){u=h+(qb<<2)|0;sa=c[u>>2]|0;_a=pb;do{sa=sa*10|0;_a=_a+1|0;}while((_a|0)!=9);c[u>>2]=sa}Ob=qb+1|0}do{if((rb|0)<9){if(!((rb|0)<=(Mb|0)&(Mb|0)<18)){break}if((Mb|0)==9){l=+(r|0)*+((c[h>>2]|0)>>>0);i=g;return+l}if((Mb|0)<9){l=+(r|0)*+((c[h>>2]|0)>>>0)/+(c[14792+(8-Mb<<2)>>2]|0);i=g;return+l}_a=j+27+(da(Mb,-3)|0)|0;ra=c[h>>2]|0;if((_a|0)<=30){if((ra>>>_a|0)!=0){break}}l=+(r|0)*+(ra>>>0)*+(c[14792+(Mb+ -10<<2)>>2]|0);i=g;return+l}}while(0);sa=(Mb|0)%9|0;if((sa|0)==0){Pb=0;Qb=0;Rb=Mb;Sb=Ob}else{u=(Mb|0)>-1?sa:sa+9|0;sa=c[14792+(8-u<<2)>>2]|0;do{if((Ob|0)==0){Vb=0;Wb=Mb;Xb=0}else{ra=1e9/(sa|0)|0;_a=0;Za=0;Ya=0;Xa=Mb;while(1){Wa=h+(Ya<<2)|0;Va=c[Wa>>2]|0;Ua=((Va>>>0)/(sa>>>0)|0)+Za|0;c[Wa>>2]=Ua;Yb=da((Va>>>0)%(sa>>>0)|0,ra)|0;Va=Ya+1|0;if((Ya|0)==(_a|0)&(Ua|0)==0){Zb=Va&127;_b=Xa+ -9|0}else{Zb=_a;_b=Xa}if((Va|0)==(Ob|0)){break}else{_a=Zb;Xa=_b;Ya=Va;Za=Yb}}if((Yb|0)==0){Vb=Zb;Wb=_b;Xb=Ob;break}c[h+(Ob<<2)>>2]=Yb;Vb=Zb;Wb=_b;Xb=Ob+1|0}}while(0);Pb=Vb;Qb=0;Rb=9-u+Wb|0;Sb=Xb}f:while(1){sa=h+(Pb<<2)|0;if((Rb|0)<18){Za=Qb;Ya=Sb;while(1){Xa=0;_a=Ya+127|0;ra=Ya;while(1){Va=_a&127;Ua=h+(Va<<2)|0;Wa=Gi(c[Ua>>2]|0,0,29)|0;Ta=Ai(Wa|0,H|0,Xa|0,0)|0;Wa=H;if(Wa>>>0>0|(Wa|0)==0&Ta>>>0>1e9){ta=Qi(Ta|0,Wa|0,1e9,0)|0;Aa=Ri(Ta|0,Wa|0,1e9,0)|0;$b=Aa;ac=ta}else{$b=Ta;ac=0}c[Ua>>2]=$b;Ua=(Va|0)==(Pb|0);if((Va|0)!=(ra+127&127|0)|Ua){bc=ra}else{bc=($b|0)==0?Va:ra}if(Ua){break}else{Xa=ac;_a=Va+ -1|0;ra=bc}}ra=Za+ -29|0;if((ac|0)==0){Za=ra;Ya=bc}else{cc=ra;dc=ac;ec=bc;break}}}else{if((Rb|0)==18){fc=Qb;gc=Sb}else{hc=Pb;ic=Qb;jc=Rb;kc=Sb;break}while(1){if(!((c[sa>>2]|0)>>>0<9007199)){hc=Pb;ic=fc;jc=18;kc=gc;break f}Ya=0;Za=gc+127|0;ra=gc;while(1){_a=Za&127;Xa=h+(_a<<2)|0;Va=Gi(c[Xa>>2]|0,0,29)|0;Ua=Ai(Va|0,H|0,Ya|0,0)|0;Va=H;if(Va>>>0>0|(Va|0)==0&Ua>>>0>1e9){Ta=Qi(Ua|0,Va|0,1e9,0)|0;ta=Ri(Ua|0,Va|0,1e9,0)|0;lc=ta;mc=Ta}else{lc=Ua;mc=0}c[Xa>>2]=lc;Xa=(_a|0)==(Pb|0);if((_a|0)!=(ra+127&127|0)|Xa){nc=ra}else{nc=(lc|0)==0?_a:ra}if(Xa){break}else{Ya=mc;Za=_a+ -1|0;ra=nc}}ra=fc+ -29|0;if((mc|0)==0){fc=ra;gc=nc}else{cc=ra;dc=mc;ec=nc;break}}}sa=Pb+127&127;if((sa|0)==(ec|0)){ra=ec+127&127;Za=h+((ec+126&127)<<2)|0;c[Za>>2]=c[Za>>2]|c[h+(ra<<2)>>2];oc=ra}else{oc=ec}c[h+(sa<<2)>>2]=dc;Pb=sa;Qb=cc;Rb=Rb+9|0;Sb=oc}g:while(1){pc=kc+1&127;u=h+((kc+127&127)<<2)|0;sa=hc;ra=ic;Za=jc;while(1){Ya=(Za|0)==18;_a=(Za|0)>27?9:1;qc=sa;rc=ra;while(1){Xa=0;while(1){Ua=Xa+qc&127;if((Ua|0)==(kc|0)){sc=2;break}Ta=c[h+(Ua<<2)>>2]|0;Ua=c[14784+(Xa<<2)>>2]|0;if(Ta>>>0<Ua>>>0){sc=2;break}ta=Xa+1|0;if(Ta>>>0>Ua>>>0){sc=Xa;break}if((ta|0)<2){Xa=ta}else{sc=ta;break}}if((sc|0)==2&Ya){break g}tc=_a+rc|0;if((qc|0)==(kc|0)){qc=kc;rc=tc}else{break}}Ya=(1<<_a)+ -1|0;Xa=1e9>>>_a;uc=qc;vc=0;ta=qc;wc=Za;do{Ua=h+(ta<<2)|0;Ta=c[Ua>>2]|0;Va=(Ta>>>_a)+vc|0;c[Ua>>2]=Va;vc=da(Ta&Ya,Xa)|0;Ta=(ta|0)==(uc|0)&(Va|0)==0;ta=ta+1&127;wc=Ta?wc+ -9|0:wc;uc=Ta?ta:uc;}while((ta|0)!=(kc|0));if((vc|0)==0){sa=uc;ra=tc;Za=wc;continue}if((pc|0)!=(uc|0)){break}c[u>>2]=c[u>>2]|1;sa=uc;ra=tc;Za=wc}c[h+(kc<<2)>>2]=vc;hc=uc;ic=tc;jc=wc;kc=pc}Za=qc&127;if((Za|0)==(kc|0)){c[h+(pc+ -1<<2)>>2]=0;xc=pc}else{xc=kc}za=+((c[h+(Za<<2)>>2]|0)>>>0);Za=qc+1&127;if((Za|0)==(xc|0)){ra=xc+1&127;c[h+(ra+ -1<<2)>>2]=0;yc=ra}else{yc=xc}pa=+(r|0);zc=pa*(za*1.0e9+ +((c[h+(Za<<2)>>2]|0)>>>0));Za=rc+53|0;ra=Za-k|0;if((ra|0)<(j|0)){Ac=(ra|0)<0?0:ra;Bc=1}else{Ac=j;Bc=0}if((Ac|0)<53){za=+Ub(+(+pi(1.0,105-Ac|0)),+zc);Cc=+eb(+zc,+(+pi(1.0,53-Ac|0)));Dc=za;Ec=Cc;Fc=za+(zc-Cc)}else{Dc=0.0;Ec=0.0;Fc=zc}sa=qc+2&127;do{if((sa|0)==(yc|0)){Gc=Ec}else{u=c[h+(sa<<2)>>2]|0;do{if(u>>>0<5e8){if((u|0)==0){if((qc+3&127|0)==(yc|0)){Hc=Ec;break}}Hc=pa*.25+Ec}else{if(u>>>0>5e8){Hc=pa*.75+Ec;break}if((qc+3&127|0)==(yc|0)){Hc=pa*.5+Ec;break}else{Hc=pa*.75+Ec;break}}}while(0);if((53-Ac|0)<=1){Gc=Hc;break}if(+eb(+Hc,1.0)!=0.0){Gc=Hc;break}Gc=Hc+1.0}}while(0);pa=Fc+Gc-Dc;do{if((Za&2147483647|0)>(-2-o|0)){if(!(+S(+pa)>=9007199254740992.0)){Ic=Bc;Jc=rc;Kc=pa}else{Ic=(Bc|0)!=0&(Ac|0)==(ra|0)?0:Bc;Jc=rc+1|0;Kc=pa*.5}if((Jc+50|0)<=(p|0)){if(!((Ic|0)!=0&Gc!=0.0)){Lc=Jc;Mc=Kc;break}}c[(Tb()|0)>>2]=34;Lc=Jc;Mc=Kc}else{Lc=rc;Mc=pa}}while(0);l=+qi(Mc,Lc);i=g;return+l}else{if((c[m>>2]|0)!=0){c[e>>2]=(c[e>>2]|0)+ -1}c[(Tb()|0)>>2]=22;ni(b,0);l=0.0;i=g;return+l}}}while(0);do{if((v|0)==23){b=(c[m>>2]|0)==0;if(!b){c[e>>2]=(c[e>>2]|0)+ -1}if(t>>>0<4|(f|0)==0|b){break}else{Nc=t}do{c[e>>2]=(c[e>>2]|0)+ -1;Nc=Nc+ -1|0;}while(Nc>>>0>3)}}while(0);l=+(r|0)*x;i=g;return+l}function mi(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;e=i;f=a+4|0;g=c[f>>2]|0;h=a+100|0;if(g>>>0<(c[h>>2]|0)>>>0){c[f>>2]=g+1;j=d[g]|0}else{j=oi(a)|0}do{if((j|0)==43|(j|0)==45){g=(j|0)==45|0;k=c[f>>2]|0;if(k>>>0<(c[h>>2]|0)>>>0){c[f>>2]=k+1;l=d[k]|0}else{l=oi(a)|0}if((l+ -48|0)>>>0<10|(b|0)==0){m=l;n=g;break}if((c[h>>2]|0)==0){m=l;n=g;break}c[f>>2]=(c[f>>2]|0)+ -1;m=l;n=g}else{m=j;n=0}}while(0);if((m+ -48|0)>>>0>9){if((c[h>>2]|0)==0){o=-2147483648;p=0;H=o;i=e;return p|0}c[f>>2]=(c[f>>2]|0)+ -1;o=-2147483648;p=0;H=o;i=e;return p|0}else{q=m;r=0}while(1){s=q+ -48+r|0;m=c[f>>2]|0;if(m>>>0<(c[h>>2]|0)>>>0){c[f>>2]=m+1;t=d[m]|0}else{t=oi(a)|0}if(!((t+ -48|0)>>>0<10&(s|0)<214748364)){break}q=t;r=s*10|0}r=((s|0)<0)<<31>>31;if((t+ -48|0)>>>0<10){q=s;m=r;j=t;while(1){l=Pi(q|0,m|0,10,0)|0;b=H;g=Ai(j|0,((j|0)<0)<<31>>31|0,-48,-1)|0;k=Ai(g|0,H|0,l|0,b|0)|0;b=H;l=c[f>>2]|0;if(l>>>0<(c[h>>2]|0)>>>0){c[f>>2]=l+1;u=d[l]|0}else{u=oi(a)|0}if((u+ -48|0)>>>0<10&((b|0)<21474836|(b|0)==21474836&k>>>0<2061584302)){j=u;m=b;q=k}else{v=k;w=b;x=u;break}}}else{v=s;w=r;x=t}if((x+ -48|0)>>>0<10){do{x=c[f>>2]|0;if(x>>>0<(c[h>>2]|0)>>>0){c[f>>2]=x+1;y=d[x]|0}else{y=oi(a)|0}}while((y+ -48|0)>>>0<10)}if((c[h>>2]|0)!=0){c[f>>2]=(c[f>>2]|0)+ -1}f=(n|0)!=0;n=zi(0,0,v|0,w|0)|0;o=f?H:w;p=f?n:v;H=o;i=e;return p|0}function ni(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;c[a+104>>2]=b;e=c[a+8>>2]|0;f=c[a+4>>2]|0;g=e-f|0;c[a+108>>2]=g;if((b|0)!=0&(g|0)>(b|0)){c[a+100>>2]=f+b;i=d;return}else{c[a+100>>2]=e;i=d;return}}function oi(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=i;f=b+104|0;g=c[f>>2]|0;if((g|0)==0){h=3}else{if((c[b+108>>2]|0)<(g|0)){h=3}}do{if((h|0)==3){g=si(b)|0;if((g|0)<0){break}j=c[f>>2]|0;k=c[b+8>>2]|0;do{if((j|0)==0){h=8}else{l=c[b+4>>2]|0;m=j-(c[b+108>>2]|0)+ -1|0;if((k-l|0)<=(m|0)){h=8;break}c[b+100>>2]=l+m}}while(0);if((h|0)==8){c[b+100>>2]=k}j=c[b+4>>2]|0;if((k|0)!=0){m=b+108|0;c[m>>2]=k+1-j+(c[m>>2]|0)}m=j+ -1|0;if((d[m]|0|0)==(g|0)){n=g;i=e;return n|0}a[m]=g;n=g;i=e;return n|0}}while(0);c[b+100>>2]=0;n=-1;i=e;return n|0}function pi(a,b){a=+a;b=b|0;var d=0,e=0.0,f=0,g=0,j=0.0;d=i;do{if((b|0)>1023){e=a*8.98846567431158e+307;f=b+ -1023|0;if((f|0)<=1023){g=f;j=e;break}f=b+ -2046|0;g=(f|0)>1023?1023:f;j=e*8.98846567431158e+307}else{if(!((b|0)<-1022)){g=b;j=a;break}e=a*2.2250738585072014e-308;f=b+1022|0;if(!((f|0)<-1022)){g=f;j=e;break}f=b+2044|0;g=(f|0)<-1022?-1022:f;j=e*2.2250738585072014e-308}}while(0);b=Gi(g+1023|0,0,52)|0;g=H;c[k>>2]=b;c[k+4>>2]=g;a=j*+h[k>>3];i=d;return+a}function qi(a,b){a=+a;b=b|0;var c=0,d=0.0;c=i;d=+pi(a,b);i=c;return+d}function ri(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;e=b+74|0;f=a[e]|0;a[e]=f+255|f;f=b+20|0;e=b+44|0;if((c[f>>2]|0)>>>0>(c[e>>2]|0)>>>0){bc[c[b+36>>2]&0](b,0,0)|0}c[b+16>>2]=0;c[b+28>>2]=0;c[f>>2]=0;f=c[b>>2]|0;if((f&20|0)==0){g=c[e>>2]|0;c[b+8>>2]=g;c[b+4>>2]=g;h=0;i=d;return h|0}if((f&4|0)==0){h=-1;i=d;return h|0}c[b>>2]=f|32;h=-1;i=d;return h|0}function si(a){a=a|0;var b=0,e=0,f=0,g=0;b=i;i=i+16|0;e=b;if((c[a+8>>2]|0)==0){if((ri(a)|0)==0){f=3}else{g=-1}}else{f=3}do{if((f|0)==3){if((bc[c[a+32>>2]&0](a,e,1)|0)!=1){g=-1;break}g=d[e]|0}}while(0);i=b;return g|0}function ti(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0.0,j=0,k=0;d=i;i=i+112|0;e=d;f=e+0|0;g=f+112|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(g|0));f=e+4|0;c[f>>2]=a;g=e+8|0;c[g>>2]=-1;c[e+44>>2]=a;c[e+76>>2]=-1;ni(e,0);h=+li(e,1,1);j=(c[f>>2]|0)-(c[g>>2]|0)+(c[e+108>>2]|0)|0;if((b|0)==0){i=d;return+h}if((j|0)==0){k=a}else{k=a+j|0}c[b>>2]=k;i=d;return+h}function ui(b,c){b=b|0;c=c|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;d=i;e=a[b]|0;f=a[c]|0;if(e<<24>>24!=f<<24>>24|e<<24>>24==0|f<<24>>24==0){g=e;h=f;j=g&255;k=h&255;l=j-k|0;i=d;return l|0}else{m=b;n=c}while(1){c=m+1|0;b=n+1|0;f=a[c]|0;e=a[b]|0;if(f<<24>>24!=e<<24>>24|f<<24>>24==0|e<<24>>24==0){g=f;h=e;break}else{n=b;m=c}}j=g&255;k=h&255;l=j-k|0;i=d;return l|0}function vi(b,c,e){b=b|0;c=c|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;f=i;if((e|0)==0){g=0;i=f;return g|0}h=a[b]|0;a:do{if(h<<24>>24==0){j=0;k=c}else{l=e;m=h;n=b;o=c;while(1){p=l+ -1|0;q=a[o]|0;if(!((p|0)!=0&q<<24>>24!=0&m<<24>>24==q<<24>>24)){j=m;k=o;break a}q=n+1|0;r=o+1|0;s=a[q]|0;if(s<<24>>24==0){j=0;k=r;break}else{m=s;n=q;o=r;l=p}}}}while(0);g=(j&255)-(d[k]|0)|0;i=f;return g|0}function wi(){}function xi(a){a=a|0;var b=0;b=(da(c[a>>2]|0,31010991)|0)+1735287159&2147483647;c[a>>2]=b;return b|0}function yi(){return xi(o)|0}function zi(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=b-d>>>0;e=b-d-(c>>>0>a>>>0|0)>>>0;return(H=e,a-c>>>0|0)|0}function Ai(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=a+c>>>0;return(H=b+d+(e>>>0<a>>>0|0)>>>0,e|0)|0}function Bi(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function Ci(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0;while((e|0)<(d|0)){a[b+e|0]=f?0:a[c+e|0]|0;f=f?1:(a[c+e|0]|0)==0;e=e+1|0}return b|0}function Di(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){H=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}H=0;return b>>>c-32|0}function Ei(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((e|0)>=4096)return za(b|0,d|0,e|0)|0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function Fi(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;g=b&3;h=d|d<<8|d<<16|d<<24;i=f&~3;if(g){g=b+4-g|0;while((b|0)<(g|0)){a[b]=d;b=b+1|0}}while((b|0)<(i|0)){c[b>>2]=h;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}return b-e|0}function Gi(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){H=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}H=a<<c-32;return 0}function Hi(a){a=a|0;if((a|0)<65)return a|0;if((a|0)>90)return a|0;return a-65+97|0}function Ii(b,c){b=b|0;c=c|0;var d=0;do{a[b+d|0]=a[c+d|0];d=d+1|0}while(a[c+(d-1)|0]|0);return b|0}function Ji(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){H=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}H=(b|0)<0?-1:0;return b>>c-32|0}function Ki(b){b=b|0;var c=0;c=a[n+(b>>>24)|0]|0;if((c|0)<8)return c|0;c=a[n+(b>>16&255)|0]|0;if((c|0)<8)return c+8|0;c=a[n+(b>>8&255)|0]|0;if((c|0)<8)return c+16|0;return(a[n+(b&255)|0]|0)+24|0}function Li(b){b=b|0;var c=0;c=a[m+(b&255)|0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)|0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)|0]|0;if((c|0)<8)return c+16|0;return(a[m+(b>>>24)|0]|0)+24|0}function Mi(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;c=a&65535;d=b&65535;e=da(d,c)|0;f=a>>>16;a=(e>>>16)+(da(d,f)|0)|0;d=b>>>16;b=da(d,c)|0;return(H=(a>>>16)+(da(d,f)|0)+(((a&65535)+b|0)>>>16)|0,a+b<<16|e&65535|0)|0}function Ni(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b>>31|((b|0)<0?-1:0)<<1;f=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;g=d>>31|((d|0)<0?-1:0)<<1;h=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;i=zi(e^a,f^b,e,f)|0;b=H;a=g^e;e=h^f;f=zi((Si(i,b,zi(g^c,h^d,g,h)|0,H,0)|0)^a,H^e,a,e)|0;return(H=H,f)|0}function Oi(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;h=b>>31|((b|0)<0?-1:0)<<1;j=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;k=e>>31|((e|0)<0?-1:0)<<1;l=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;m=zi(h^a,j^b,h,j)|0;b=H;Si(m,b,zi(k^d,l^e,k,l)|0,H,g)|0;l=zi(c[g>>2]^h,c[g+4>>2]^j,h,j)|0;j=H;i=f;return(H=j,l)|0}function Pi(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;a=c;c=Mi(e,a)|0;f=H;return(H=(da(b,a)|0)+(da(d,e)|0)+f|f&0,c|0|0)|0}function Qi(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=Si(a,b,c,d,0)|0;return(H=H,e)|0}function Ri(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+8|0;g=f|0;Si(a,b,d,e,g)|0;i=f;return(H=c[g+4>>2]|0,c[g>>2]|0)|0}function Si(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,I=0,J=0,K=0,L=0,M=0;g=a;h=b;i=h;j=d;k=e;l=k;if((i|0)==0){m=(f|0)!=0;if((l|0)==0){if(m){c[f>>2]=(g>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(g>>>0)/(j>>>0)>>>0;return(H=n,o)|0}else{if(!m){n=0;o=0;return(H=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;n=0;o=0;return(H=n,o)|0}}m=(l|0)==0;do{if((j|0)==0){if(m){if((f|0)!=0){c[f>>2]=(i>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(i>>>0)/(j>>>0)>>>0;return(H=n,o)|0}if((g|0)==0){if((f|0)!=0){c[f>>2]=0;c[f+4>>2]=(i>>>0)%(l>>>0)}n=0;o=(i>>>0)/(l>>>0)>>>0;return(H=n,o)|0}p=l-1|0;if((p&l|0)==0){if((f|0)!=0){c[f>>2]=a|0;c[f+4>>2]=p&i|b&0}n=0;o=i>>>((Li(l|0)|0)>>>0);return(H=n,o)|0}p=(Ki(l|0)|0)-(Ki(i|0)|0)|0;if(p>>>0<=30){q=p+1|0;r=31-p|0;s=q;t=i<<r|g>>>(q>>>0);u=i>>>(q>>>0);v=0;w=g<<r;break}if((f|0)==0){n=0;o=0;return(H=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(H=n,o)|0}else{if(!m){r=(Ki(l|0)|0)-(Ki(i|0)|0)|0;if(r>>>0<=31){q=r+1|0;p=31-r|0;x=r-31>>31;s=q;t=g>>>(q>>>0)&x|i<<p;u=i>>>(q>>>0)&x;v=0;w=g<<p;break}if((f|0)==0){n=0;o=0;return(H=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(H=n,o)|0}p=j-1|0;if((p&j|0)!=0){x=(Ki(j|0)|0)+33-(Ki(i|0)|0)|0;q=64-x|0;r=32-x|0;y=r>>31;z=x-32|0;A=z>>31;s=x;t=r-1>>31&i>>>(z>>>0)|(i<<r|g>>>(x>>>0))&A;u=A&i>>>(x>>>0);v=g<<q&y;w=(i<<q|g>>>(z>>>0))&y|g<<r&x-33>>31;break}if((f|0)!=0){c[f>>2]=p&g;c[f+4>>2]=0}if((j|0)==1){n=h|b&0;o=a|0|0;return(H=n,o)|0}else{p=Li(j|0)|0;n=i>>>(p>>>0)|0;o=i<<32-p|g>>>(p>>>0)|0;return(H=n,o)|0}}}while(0);if((s|0)==0){B=w;C=v;D=u;E=t;F=0;G=0}else{g=d|0|0;d=k|e&0;e=Ai(g,d,-1,-1)|0;k=H;i=w;w=v;v=u;u=t;t=s;s=0;while(1){I=w>>>31|i<<1;J=s|w<<1;j=u<<1|i>>>31|0;a=u>>>31|v<<1|0;zi(e,k,j,a)|0;b=H;h=b>>31|((b|0)<0?-1:0)<<1;K=h&1;L=zi(j,a,h&g,(((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1)&d)|0;M=H;b=t-1|0;if((b|0)==0){break}else{i=I;w=J;v=M;u=L;t=b;s=K}}B=I;C=J;D=M;E=L;F=0;G=K}K=C;C=0;if((f|0)!=0){c[f>>2]=E;c[f+4>>2]=D}n=(K|0)>>>31|(B|C)<<1|(C<<1|K>>>31)&0|F;o=(K<<1|0>>>31)&-2|G;return(H=n,o)|0}function Ti(a,b){a=a|0;b=b|0;return ac[a&15](b|0)|0}function Ui(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return bc[a&0](b|0,c|0,d|0)|0}function Vi(a,b,c){a=a|0;b=b|0;c=c|0;return cc[a&7](b|0,c|0)|0}function Wi(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return dc[a&127](b|0,c|0,d|0,e|0)|0}function Xi(a,b){a=a|0;b=b|0;ec[a&7](b|0)}function Yi(a){a=a|0;ea(0);return 0}function Zi(a,b,c){a=a|0;b=b|0;c=c|0;ea(1);return 0}function _i(a,b){a=a|0;b=b|0;ea(2);return 0}function $i(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ea(3);return 0}function aj(a){a=a|0;ea(4)}




// EMSCRIPTEN_END_FUNCS
var ac=[Yi,rd,Nd,Ce,mh,ke,le,me,ne,Yi,Yi,Yi,Yi,Yi,Yi,Yi];var bc=[Zi];var cc=[_i,qd,Md,Be,kh,lh,_i,_i];var dc=[$i,Ee,Fe,Ge,He,Ie,Je,Ke,Le,Me,Ne,Oe,Pe,Qe,Re,Se,Te,We,Xe,Ye,Ze,_e,$e,af,bf,cf,df,ef,ff,gf,hf,jf,kf,lf,mf,nf,of,pf,qf,rf,sf,tf,uf,vf,wf,xf,yf,zf,Af,Bf,Cf,Df,Ef,Ff,Gf,Hf,If,Jf,Kf,Lf,Mf,Nf,Of,Pf,Qf,Rf,Sf,Wf,Xf,Yf,Zf,_f,$f,bg,cg,dg,eg,fg,gg,hg,ig,jg,kg,lg,mg,ng,og,pg,qg,rg,sg,tg,ug,vg,Ag,Bg,Cg,Dg,Eg,Fg,Gg,Hg,Ig,Lg,Mg,Ng,Og,Pg,Qg,Rg,Sg,Tg,Ug,Vg,Wg,Xg,Yg,Zg,_g,$g,ah,ci,di,ei,$i,$i,$i,$i];var ec=[aj,cd,sd,Od,Zd,nh,aj,aj];return{_strlen:Bi,_tolower:Hi,_jspn_getKeyAndValueIndicesOfHashMapAtIndex:bi,_jspn_typeAtIndex:Th,_jspn_addString:Qh,_jspn_getNumber:Vh,_jspn_addNil:Nh,_realloc:ii,_jspn_compile:Fh,_bitshift64Lshr:Di,_jspn_backtrace:Mh,_calloc:hi,_bitshift64Shl:Gi,_malloc:fi,_jspn_lastErrorMessage:Ih,_jspn_addWrapperFunction:Xh,_jspn_addNumber:Ph,_jspn_getGlobal:Kh,_memset:Fi,_jspn_countOfHashMapAtIndex:$h,_memcpy:Ei,_jspn_freeAll:Eh,_i64Subtract:zi,_jspn_lastErrorType:Jh,_rand_r:xi,_jspn_setGlobal:Lh,_i64Add:Ai,_jspn_countOfArrayAtIndex:_h,_jspn_addArrayWithIndexBuffer:Rh,_jspn_getIntFromArray:Yh,_jspn_getString:Wh,_jspn_addBool:Oh,_jspn_getValueIndicesOfArrayAtIndex:ai,_rand:yi,_free:gi,_jspn_reset:Dh,_jspn_compileExpr:Gh,_jspn_addDictionaryWithIndexBuffer:Sh,_strncpy:Ci,_jspn_call:Hh,_jspn_getBool:Uh,_strcpy:Ii,_jspn_addValueFromArgv:Zh,runPostSets:wi,stackAlloc:fc,stackSave:gc,stackRestore:hc,setThrew:ic,setTempRet0:lc,setTempRet1:mc,setTempRet2:nc,setTempRet3:oc,setTempRet4:pc,setTempRet5:qc,setTempRet6:rc,setTempRet7:sc,setTempRet8:tc,setTempRet9:uc,dynCall_ii:Ti,dynCall_iiii:Ui,dynCall_iii:Vi,dynCall_iiiii:Wi,dynCall_vi:Xi}})


// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_ii": invoke_ii, "invoke_iiii": invoke_iiii, "invoke_iii": invoke_iii, "invoke_iiiii": invoke_iiiii, "invoke_vi": invoke_vi, "_isalnum": _isalnum, "_fabs": _fabs, "_exp": _exp, "_fread": _fread, "_log10": _log10, "_strpbrk": _strpbrk, "___assert_fail": ___assert_fail, "__addDays": __addDays, "_fsync": _fsync, "_rename": _rename, "_sbrk": _sbrk, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_exp2": _exp2, "_sinh": _sinh, "_sysconf": _sysconf, "_close": _close, "_cos": _cos, "_tanh": _tanh, "_puts": _puts, "_unlink": _unlink, "_write": _write, "__isLeapYear": __isLeapYear, "_ftell": _ftell, "_gmtime_r": _gmtime_r, "_strstr": _strstr, "_tmpnam": _tmpnam, "_tmpfile": _tmpfile, "_send": _send, "_atan2": _atan2, "_modf": _modf, "_strtol": _strtol, "___setErrNo": ___setErrNo, "_isalpha": _isalpha, "_srand": _srand, "_putchar": _putchar, "_gmtime": _gmtime, "_printf": _printf, "_localtime": _localtime, "_jspn_callJSFunc": _jspn_callJSFunc, "_read": _read, "_fwrite": _fwrite, "_time": _time, "_fprintf": _fprintf, "_llvm_pow_f64": _llvm_pow_f64, "_fmod": _fmod, "_lseek": _lseek, "_vfprintf": _vfprintf, "_rmdir": _rmdir, "_asin": _asin, "_floor": _floor, "_pwrite": _pwrite, "_localtime_r": _localtime_r, "_tzset": _tzset, "_open": _open, "_remove": _remove, "_strftime": _strftime, "_fseek": _fseek, "_getenv": _getenv, "_fclose": _fclose, "__parseInt": __parseInt, "_log": _log, "_recv": _recv, "_tan": _tan, "_fgetc": _fgetc, "_jspn_jseval_helper": _jspn_jseval_helper, "_fputc": _fputc, "_abort": _abort, "_ceil": _ceil, "_isspace": _isspace, "_fopen": _fopen, "_sin": _sin, "_acos": _acos, "_cosh": _cosh, "___buildEnvironment": ___buildEnvironment, "_difftime": _difftime, "_system": _system, "_fflush": _fflush, "__reallyNegative": __reallyNegative, "_fileno": _fileno, "__arraySum": __arraySum, "_atan": _atan, "_pread": _pread, "_mkport": _mkport, "_toupper": _toupper, "_feof": _feof, "___errno_location": ___errno_location, "_copysign": _copysign, "_isxdigit": _isxdigit, "_strerror": _strerror, "__formatString": __formatString, "_fputs": _fputs, "_sqrt": _sqrt, "_strerror_r": _strerror_r, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "___rand_seed": ___rand_seed, "NaN": NaN, "Infinity": Infinity, "_stderr": _stderr, "_stdin": _stdin, "_stdout": _stdout }, buffer);
var _strlen = Module["_strlen"] = asm["_strlen"];
var _tolower = Module["_tolower"] = asm["_tolower"];
var _jspn_getKeyAndValueIndicesOfHashMapAtIndex = Module["_jspn_getKeyAndValueIndicesOfHashMapAtIndex"] = asm["_jspn_getKeyAndValueIndicesOfHashMapAtIndex"];
var _jspn_typeAtIndex = Module["_jspn_typeAtIndex"] = asm["_jspn_typeAtIndex"];
var _jspn_addString = Module["_jspn_addString"] = asm["_jspn_addString"];
var _jspn_getNumber = Module["_jspn_getNumber"] = asm["_jspn_getNumber"];
var _jspn_addNil = Module["_jspn_addNil"] = asm["_jspn_addNil"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _jspn_compile = Module["_jspn_compile"] = asm["_jspn_compile"];
var _bitshift64Lshr = Module["_bitshift64Lshr"] = asm["_bitshift64Lshr"];
var _jspn_backtrace = Module["_jspn_backtrace"] = asm["_jspn_backtrace"];
var _calloc = Module["_calloc"] = asm["_calloc"];
var _bitshift64Shl = Module["_bitshift64Shl"] = asm["_bitshift64Shl"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _jspn_lastErrorMessage = Module["_jspn_lastErrorMessage"] = asm["_jspn_lastErrorMessage"];
var _jspn_addWrapperFunction = Module["_jspn_addWrapperFunction"] = asm["_jspn_addWrapperFunction"];
var _jspn_addNumber = Module["_jspn_addNumber"] = asm["_jspn_addNumber"];
var _jspn_getGlobal = Module["_jspn_getGlobal"] = asm["_jspn_getGlobal"];
var _memset = Module["_memset"] = asm["_memset"];
var _jspn_countOfHashMapAtIndex = Module["_jspn_countOfHashMapAtIndex"] = asm["_jspn_countOfHashMapAtIndex"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _jspn_freeAll = Module["_jspn_freeAll"] = asm["_jspn_freeAll"];
var _i64Subtract = Module["_i64Subtract"] = asm["_i64Subtract"];
var _jspn_lastErrorType = Module["_jspn_lastErrorType"] = asm["_jspn_lastErrorType"];
var _rand_r = Module["_rand_r"] = asm["_rand_r"];
var _jspn_setGlobal = Module["_jspn_setGlobal"] = asm["_jspn_setGlobal"];
var _i64Add = Module["_i64Add"] = asm["_i64Add"];
var _jspn_countOfArrayAtIndex = Module["_jspn_countOfArrayAtIndex"] = asm["_jspn_countOfArrayAtIndex"];
var _jspn_addArrayWithIndexBuffer = Module["_jspn_addArrayWithIndexBuffer"] = asm["_jspn_addArrayWithIndexBuffer"];
var _jspn_getIntFromArray = Module["_jspn_getIntFromArray"] = asm["_jspn_getIntFromArray"];
var _jspn_getString = Module["_jspn_getString"] = asm["_jspn_getString"];
var _jspn_addBool = Module["_jspn_addBool"] = asm["_jspn_addBool"];
var _jspn_getValueIndicesOfArrayAtIndex = Module["_jspn_getValueIndicesOfArrayAtIndex"] = asm["_jspn_getValueIndicesOfArrayAtIndex"];
var _rand = Module["_rand"] = asm["_rand"];
var _free = Module["_free"] = asm["_free"];
var _jspn_reset = Module["_jspn_reset"] = asm["_jspn_reset"];
var _jspn_compileExpr = Module["_jspn_compileExpr"] = asm["_jspn_compileExpr"];
var _jspn_addDictionaryWithIndexBuffer = Module["_jspn_addDictionaryWithIndexBuffer"] = asm["_jspn_addDictionaryWithIndexBuffer"];
var _strncpy = Module["_strncpy"] = asm["_strncpy"];
var _jspn_call = Module["_jspn_call"] = asm["_jspn_call"];
var _jspn_getBool = Module["_jspn_getBool"] = asm["_jspn_getBool"];
var _strcpy = Module["_strcpy"] = asm["_strcpy"];
var _jspn_addValueFromArgv = Module["_jspn_addValueFromArgv"] = asm["_jspn_addValueFromArgv"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];

Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };


// TODO: strip out parts of this we do not need

//======= begin closure i64 code =======

// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */

var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };


  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.

    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };


  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.


  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};


  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }

    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };


  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };


  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };


  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }

    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }

    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));

    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };


  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.


  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;


  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);


  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);


  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);


  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);


  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);


  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);


  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };


  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };


  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (this.isZero()) {
      return '0';
    }

    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }

    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));

    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);

      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };


  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };


  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };


  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };


  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };


  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };


  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };


  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };


  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }

    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }

    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };


  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };


  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };


  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }

    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }

    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }

    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));

      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);

      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }

      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }

      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };


  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };


  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };


  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };


  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };


  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };


  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };

  //======= begin jsbn =======

  var navigator = { appName: 'Modern Browser' }; // polyfill a little

  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/

  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */

  // Basic JavaScript BN library - subset useful for RSA encryption.

  // Bits per digit
  var dbits;

  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);

  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }

  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }

  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.

  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }

  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);

  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;

  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }

  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }

  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }

  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }

  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }

  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }

  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }

  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }

  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }

  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }

  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }

  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }

  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }

  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }

  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }

  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }

  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }

  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }

  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;

  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }

  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }

  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }

  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }

  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }

  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;

  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }

  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }

  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;

  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;

  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);

  // jsbn2 stuff

  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }

  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }

  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }

  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }

  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }

  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }

  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;

  //======= end jsbn =======

  // Emscripten wrapper
  var Wrapper = {
    abs: function(l, h) {
      var x = new goog.math.Long(l, h);
      var ret;
      if (x.isNegative()) {
        ret = x.negate();
      } else {
        ret = x;
      }
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();

//======= end closure i64 code =======



// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
      Module.printErr('pre-main prep time: ' + (Date.now() - preloadStartTime) + ' ms');
    }

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.';

  throw 'abort() at ' + stackTrace() + extra;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}





/*
 * jsapi.js
 * JavaScript bindings for Sparkling
 * Created by Arpad Goretity on 01/09/2014.
 *
 * Licensed under the 2-clause BSD License
 */

(function() {
	// Takes a JavaScript string, returns the index of
	// the function representing the compiled program
	var compile = Module.cwrap('jspn_compile', 'number', ['string']);

	var compileExpr = Module.cwrap('jspn_compileExpr', 'number', ['string']);

	// Takes a function index and an array index.
	// Returns the index of the value which is the result of calling the
	// function at the given index in the specified array as arguments.
	var call = Module.cwrap('jspn_call', 'number', ['number', 'number']);

	// takes the name of a global value, returns its referencing index
	var getGlobal = Module.cwrap('jspn_getGlobal', 'number', ['string']);

	// takes a name and a value index, sets the given value
	// as a global with the specified name
	var setGlobal = Module.cwrap('jspn_setGlobal', null, ['string', 'number']);

	// Given a JavaScript value, converts it to a Sparkling value
	// and returns its referencing index
	var addJSValue = function(val) {
		if (val === undefined || val === null) {
			return addNil();
		}

		switch (typeof val) {
		case 'boolean':    return addBool(val);
		case 'number':     return addNumber(val);
		case 'string':     return addString(val);
		case 'object':     return addObject(val);
		case 'function':   return addFunction(val);
		default:           throw "Unrecognized type: " + typeof val;
		}
	};

	// Private helpers for addJSValue
	var addNil = Module.cwrap('jspn_addNil', 'number', []);
	var addBool = Module.cwrap('jspn_addBool', 'number', ['boolean']);
	var addNumber = Module.cwrap('jspn_addNumber', 'number', ['number']);
	var addString = Module.cwrap('jspn_addString', 'number', ['string']);

	var addObject = function(val) {
		if (val instanceof Array) {
			return addArray(val);
		} else if (val instanceof SparklingUserInfo) {
			return addUserInfo(val);
		} else {
			return addDictionary(val);
		}
	};

	var addArray = function(val) {
		var length = val.length;
		var i;
		var index;
		var indexBuffer = Module._malloc(length * 4);
		var result;

		for (i = 0; i < length; i++) {
			index = addJSValue(val[i]);
			Module.setValue(indexBuffer + i * 4, index, 'i32');
		}

		result = addArrayWithIndexBuffer(indexBuffer, length);
		Module._free(indexBuffer);
		return result;
	};

	var addDictionary = function(val) {
		var keys = Object.keys(val);
		var length = keys.length;
		var i;
		var key;
		var keyIndex, valIndex;
		var indexBuffer = Module._malloc(length * 2 * 4);
		var result;

		for (i = 0; i < length; i++) {
			key = keys[i];
			keyIndex = addJSValue(key);
			valIndex = addJSValue(val[key]);
			Module.setValue(indexBuffer + (2 * i + 0) * 4, keyIndex, 'i32');
			Module.setValue(indexBuffer + (2 * i + 1) * 4, valIndex, 'i32');
		}

		result = addDictionaryWithIndexBuffer(indexBuffer, length);
		Module._free(indexBuffer);
		return result;
	};

	var addUserInfo = function(val) {
		return val.index;
	};

	// Adds a native array that contains the object at the
	// specified referencing indices, then returns the
	// referencing index of the newly created array.
	// Parameters: (int32_t *indexBuffer, size_t numberOfObjects)
	var addArrayWithIndexBuffer = Module.cwrap('jspn_addArrayWithIndexBuffer', 'number', ['number', 'number']);

	// Similar to addArrayWithIndexBuffer, but also adds the keys
	// and constructs a dictionary instead of an array.
	// Parameters: (int32_t *indexBuffer, size_t numberOfKeyValuePairs)
	var addDictionaryWithIndexBuffer = Module.cwrap('jspn_addDictionaryWithIndexBuffer', 'number', ['number', 'number']);

	// this belongs to addFunction
	var wrappedFunctions = [];

	var addFunction = function(val) {
		// optimization: if this function is a wrapper around
		// a function that comes from Sparkling anyway, then
		// just return its original index.
		if (val.fnIndex !== undefined) {
			return val.fnIndex;
		}

		// Else, i. e. if 'val' is a naked JavaScript function,
		// then create a wrapper around it
		var wrapIndex = wrappedFunctions.length;
		wrappedFunctions[wrapIndex] = val;

		return addWrapperFunction(wrapIndex);
	};

	// Takes an index into the wrappedFunctions array.
	// Returns the referencing index of an SpnValue<SpnFunction> that,
	// when called, will call the aforementioned JavaScript function.
	var addWrapperFunction = Module.cwrap('jspn_addWrapperFunction', 'number', ['number']);

	// This is the inverse of 'addJSValue'. Given an internal
	// referencing index, pulls out the corresponding SpnValue
	// and converts it into a JavaScript value.
	var valueAtIndex = function(index) {
		if (index < 0) {
			// error
			throw "Cannot get value at error index";
		}

		var TYPE_NIL      = 0,
		    TYPE_BOOL     = 1,
		    TYPE_NUMBER   = 2,
		    TYPE_STRING   = 3,
		    TYPE_ARRAY    = 4,
		    TYPE_HASHMAP  = 5,
		    TYPE_FUNC     = 6,
		    TYPE_USERINFO = 7;

		switch (typeAtIndex(index)) {
		case TYPE_NIL:        return undefined;
		case TYPE_BOOL:       return getBool(index);
		case TYPE_NUMBER:     return getNumber(index);
		case TYPE_STRING:     return getString(index);
		case TYPE_ARRAY:      return getArray(index);
		case TYPE_HASHMAP:    return getHashmap(index);
		case TYPE_FUNC:       return getFunction(index);
		case TYPE_USERINFO:   return getUserInfo(index);
		default: /* error */  throw "unknown type tag";
		}
	};

	var typeAtIndex = Module.cwrap('jspn_typeAtIndex', 'number', ['number']);

	// Module.cwrap seems not to interpret the 'boolean'
	// return type correctly -- such functions will only
	// return 0 or 1, not a proper Boolean... So, we use
	// this trick to work around this behavior.
	var getBool = function(index) {
		return !!rawGetBool(index);
	}

	var rawGetBool = Module.cwrap('jspn_getBool', 'boolean', ['number']);
	var getNumber = Module.cwrap('jspn_getNumber', 'number', ['number']);
	var getString = Module.cwrap('jspn_getString', 'string', ['number']);

	function SparklingUserInfo(index) {
		this.index = index;
		return this;
	}

	// Just returns a wrapper object
	var getUserInfo = function(index) {
		return new SparklingUserInfo(index);
	};

	var getArray = function(index) {
		var i;
		var values = [];
		var length = countOfArrayAtIndex(index);
		var indexBuffer = Module._malloc(length * 4);

		getValueIndicesOfArrayAtIndex(index, indexBuffer);

		for (i = 0; i < length; i++) {
			valueIndex = Module.getValue(indexBuffer + i * 4, 'i32');
			values[i] = valueAtIndex(valueIndex);
		}

		Module._free(indexBuffer);

		return values;
	};

	var getHashmap = function(index) {
		var i;
		var keyIndex, valueIndex, key, value;
		var object = {};
		var length = countOfHashMapAtIndex(index);
		var indexBuffer = Module._malloc(length * 2 * 4);

		getKeyAndValueIndicesOfHashMapAtIndex(index, indexBuffer);

		for (i = 0; i < length; i++) {
			keyIndex = Module.getValue(indexBuffer + (2 * i + 0) * 4, 'i32');
			key = valueAtIndex(keyIndex);

			valueIndex = Module.getValue(indexBuffer + (2 * i + 1) * 4, 'i32');
			value = valueAtIndex(valueIndex);

			if (typeof key !== 'string') {
					Module._free(indexBuffer);
					throw "keys must be strings";
			}

			object[key] = value;
		}

		Module._free(indexBuffer);

		return object;
	};

	var countOfArrayAtIndex = Module.cwrap('jspn_countOfArrayAtIndex', 'number', ['number']);
	var countOfHashMapAtIndex = Module.cwrap('jspn_countOfHashMapAtIndex', 'number', ['number']);
	var getValueIndicesOfArrayAtIndex = Module.cwrap('jspn_getValueIndicesOfArrayAtIndex', null, ['number', 'number']);
	var getKeyAndValueIndicesOfHashMapAtIndex = Module.cwrap('jspn_getKeyAndValueIndicesOfHashMapAtIndex', null, ['number', 'number']);

	var getFunction = function(fnIndex) {
		// XXX: should we check if the value at given index is really a function?

		var result = function() {
			var argv = Array.prototype.slice.apply(arguments);
			var argvIndex = addArray(argv); // returns the index of an SpnValue<SpnArray>
			var retIndex = call(fnIndex, argvIndex);

			if (retIndex < 0) {
				throw Sparkling.lastErrorMessage();
			}

			return valueAtIndex(retIndex);
		};

		// optimization, see the relevant comment in addFunction
		result.fnIndex = fnIndex;
		return result;
	};

	// Takes a pointer to SpnArray and an integer index,
	// Returns the integer value of the array's element at that index.
	var getIntFromArray = Module.cwrap('jspn_getIntFromArray', 'number', ['number', 'number']);

	var backtrace = Module.cwrap('jspn_backtrace', 'string', []);

	Sparkling = {
		// export these values as "private" symbols
		// in order that auxlib.js be able to use them
		_wrappedFunctions: wrappedFunctions,
		_valueAtIndex: valueAtIndex,
		_addJSValue: addJSValue,
		_getIntFromArray: getIntFromArray,

		// Public API
		compile: function(src) {
			var fnIndex = compile(src);
			return fnIndex < 0 ? undefined : getFunction(fnIndex);
		},

		compileExpr: function(src) {
			var fnIndex = compileExpr(src);
			return fnIndex < 0 ? undefined : getFunction(fnIndex);
		},

		lastErrorMessage: Module.cwrap('jspn_lastErrorMessage', 'string', []),
		lastErrorType: Module.cwrap('jspn_lastErrorType', 'string', []),

		backtrace: function() {
			var bt = backtrace();
			return bt ? bt.split("\n") : [];
		},

		getGlobal: function(name) {
			return valueAtIndex(getGlobal(name));
		},

		setGlobal: function(name, value) {
			var valIndex = addJSValue(value);
			setGlobal(name, valIndex);
		},

		// Frees all memory used by Sparkling values generated
		// by Sparkling code. (This includes the return values
		// of functions as well as the results of automatic
		// conversion between JavaScript and Sparkling in both
		// directions.)
		freeAll: Module.cwrap('jspn_freeAll', null, []),

		reset: Module.cwrap('jspn_reset', null, [])
	};
}());



var XLSX = (function() {
	"use strict";
	
	let XLSX = { version: "0.17.0" };

	var DENSE = null,
		DIF_XL = true;

	/*

JSZip - A Javascript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2014 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/master/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/master/LICENSE

Note: since JSZip 3 removed critical functionality, this version assigns to the
`JSZipSync` variable.  Another JSZip version can be loaded in parallel.
*/
let JSZipSync;

(function(e){
    JSZipSync=e();
}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r);}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';
// private property
var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";


// public method for encoding
exports.encode = function(input, utf8) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    while (i < input.length) {

        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        }
        else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);

    }

    return output;
};

// public method for decoding
exports.decode = function(input, utf8) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {

        enc1 = _keyStr.indexOf(input.charAt(i++));
        enc2 = _keyStr.indexOf(input.charAt(i++));
        enc3 = _keyStr.indexOf(input.charAt(i++));
        enc4 = _keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }

    }

    return output;

};

},{}],2:[function(_dereq_,module,exports){
'use strict';
function CompressedObject() {
    this.compressedSize = 0;
    this.uncompressedSize = 0;
    this.crc32 = 0;
    this.compressionMethod = null;
    this.compressedContent = null;
}

CompressedObject.prototype = {
    /**
     * Return the decompressed content in an unspecified format.
     * The format will depend on the decompressor.
     * @return {Object} the decompressed content.
     */
    getContent: function() {
        return null; // see implementation
    },
    /**
     * Return the compressed content in an unspecified format.
     * The format will depend on the compressed conten source.
     * @return {Object} the compressed content.
     */
    getCompressedContent: function() {
        return null; // see implementation
    }
};
module.exports = CompressedObject;

},{}],3:[function(_dereq_,module,exports){
'use strict';
exports.STORE = {
    magic: "\x00\x00",
    compress: function(content) {
        return content; // no compression
    },
    uncompress: function(content) {
        return content; // no compression
    },
    compressInputType: null,
    uncompressInputType: null
};
exports.DEFLATE = _dereq_('./flate');

},{"./flate":8}],4:[function(_dereq_,module,exports){
'use strict';

var utils = _dereq_('./utils');

var table = [
    0x00000000, 0x77073096, 0xEE0E612C, 0x990951BA,
    0x076DC419, 0x706AF48F, 0xE963A535, 0x9E6495A3,
    0x0EDB8832, 0x79DCB8A4, 0xE0D5E91E, 0x97D2D988,
    0x09B64C2B, 0x7EB17CBD, 0xE7B82D07, 0x90BF1D91,
    0x1DB71064, 0x6AB020F2, 0xF3B97148, 0x84BE41DE,
    0x1ADAD47D, 0x6DDDE4EB, 0xF4D4B551, 0x83D385C7,
    0x136C9856, 0x646BA8C0, 0xFD62F97A, 0x8A65C9EC,
    0x14015C4F, 0x63066CD9, 0xFA0F3D63, 0x8D080DF5,
    0x3B6E20C8, 0x4C69105E, 0xD56041E4, 0xA2677172,
    0x3C03E4D1, 0x4B04D447, 0xD20D85FD, 0xA50AB56B,
    0x35B5A8FA, 0x42B2986C, 0xDBBBC9D6, 0xACBCF940,
    0x32D86CE3, 0x45DF5C75, 0xDCD60DCF, 0xABD13D59,
    0x26D930AC, 0x51DE003A, 0xC8D75180, 0xBFD06116,
    0x21B4F4B5, 0x56B3C423, 0xCFBA9599, 0xB8BDA50F,
    0x2802B89E, 0x5F058808, 0xC60CD9B2, 0xB10BE924,
    0x2F6F7C87, 0x58684C11, 0xC1611DAB, 0xB6662D3D,
    0x76DC4190, 0x01DB7106, 0x98D220BC, 0xEFD5102A,
    0x71B18589, 0x06B6B51F, 0x9FBFE4A5, 0xE8B8D433,
    0x7807C9A2, 0x0F00F934, 0x9609A88E, 0xE10E9818,
    0x7F6A0DBB, 0x086D3D2D, 0x91646C97, 0xE6635C01,
    0x6B6B51F4, 0x1C6C6162, 0x856530D8, 0xF262004E,
    0x6C0695ED, 0x1B01A57B, 0x8208F4C1, 0xF50FC457,
    0x65B0D9C6, 0x12B7E950, 0x8BBEB8EA, 0xFCB9887C,
    0x62DD1DDF, 0x15DA2D49, 0x8CD37CF3, 0xFBD44C65,
    0x4DB26158, 0x3AB551CE, 0xA3BC0074, 0xD4BB30E2,
    0x4ADFA541, 0x3DD895D7, 0xA4D1C46D, 0xD3D6F4FB,
    0x4369E96A, 0x346ED9FC, 0xAD678846, 0xDA60B8D0,
    0x44042D73, 0x33031DE5, 0xAA0A4C5F, 0xDD0D7CC9,
    0x5005713C, 0x270241AA, 0xBE0B1010, 0xC90C2086,
    0x5768B525, 0x206F85B3, 0xB966D409, 0xCE61E49F,
    0x5EDEF90E, 0x29D9C998, 0xB0D09822, 0xC7D7A8B4,
    0x59B33D17, 0x2EB40D81, 0xB7BD5C3B, 0xC0BA6CAD,
    0xEDB88320, 0x9ABFB3B6, 0x03B6E20C, 0x74B1D29A,
    0xEAD54739, 0x9DD277AF, 0x04DB2615, 0x73DC1683,
    0xE3630B12, 0x94643B84, 0x0D6D6A3E, 0x7A6A5AA8,
    0xE40ECF0B, 0x9309FF9D, 0x0A00AE27, 0x7D079EB1,
    0xF00F9344, 0x8708A3D2, 0x1E01F268, 0x6906C2FE,
    0xF762575D, 0x806567CB, 0x196C3671, 0x6E6B06E7,
    0xFED41B76, 0x89D32BE0, 0x10DA7A5A, 0x67DD4ACC,
    0xF9B9DF6F, 0x8EBEEFF9, 0x17B7BE43, 0x60B08ED5,
    0xD6D6A3E8, 0xA1D1937E, 0x38D8C2C4, 0x4FDFF252,
    0xD1BB67F1, 0xA6BC5767, 0x3FB506DD, 0x48B2364B,
    0xD80D2BDA, 0xAF0A1B4C, 0x36034AF6, 0x41047A60,
    0xDF60EFC3, 0xA867DF55, 0x316E8EEF, 0x4669BE79,
    0xCB61B38C, 0xBC66831A, 0x256FD2A0, 0x5268E236,
    0xCC0C7795, 0xBB0B4703, 0x220216B9, 0x5505262F,
    0xC5BA3BBE, 0xB2BD0B28, 0x2BB45A92, 0x5CB36A04,
    0xC2D7FFA7, 0xB5D0CF31, 0x2CD99E8B, 0x5BDEAE1D,
    0x9B64C2B0, 0xEC63F226, 0x756AA39C, 0x026D930A,
    0x9C0906A9, 0xEB0E363F, 0x72076785, 0x05005713,
    0x95BF4A82, 0xE2B87A14, 0x7BB12BAE, 0x0CB61B38,
    0x92D28E9B, 0xE5D5BE0D, 0x7CDCEFB7, 0x0BDBDF21,
    0x86D3D2D4, 0xF1D4E242, 0x68DDB3F8, 0x1FDA836E,
    0x81BE16CD, 0xF6B9265B, 0x6FB077E1, 0x18B74777,
    0x88085AE6, 0xFF0F6A70, 0x66063BCA, 0x11010B5C,
    0x8F659EFF, 0xF862AE69, 0x616BFFD3, 0x166CCF45,
    0xA00AE278, 0xD70DD2EE, 0x4E048354, 0x3903B3C2,
    0xA7672661, 0xD06016F7, 0x4969474D, 0x3E6E77DB,
    0xAED16A4A, 0xD9D65ADC, 0x40DF0B66, 0x37D83BF0,
    0xA9BCAE53, 0xDEBB9EC5, 0x47B2CF7F, 0x30B5FFE9,
    0xBDBDF21C, 0xCABAC28A, 0x53B39330, 0x24B4A3A6,
    0xBAD03605, 0xCDD70693, 0x54DE5729, 0x23D967BF,
    0xB3667A2E, 0xC4614AB8, 0x5D681B02, 0x2A6F2B94,
    0xB40BBE37, 0xC30C8EA1, 0x5A05DF1B, 0x2D02EF8D
];

/**
 *
 *  Javascript crc32
 *  http://www.webtoolkit.info/
 *
 */
module.exports = function crc32(input, crc) {
    if (typeof input === "undefined" || !input.length) {
        return 0;
    }

    var isArray = utils.getTypeOf(input) !== "string";

    if (typeof(crc) == "undefined") {
        crc = 0;
    }
    var x = 0;
    var y = 0;
    var b = 0;

    crc = crc ^ (-1);
    for (var i = 0, iTop = input.length; i < iTop; i++) {
        b = isArray ? input[i] : input.charCodeAt(i);
        y = (crc ^ b) & 0xFF;
        x = table[y];
        crc = (crc >>> 8) ^ x;
    }

    return crc ^ (-1);
};
// vim: set shiftwidth=4 softtabstop=4:

},{"./utils":21}],5:[function(_dereq_,module,exports){
'use strict';
var utils = _dereq_('./utils');

function DataReader(data) {
    this.data = null; // type : see implementation
    this.length = 0;
    this.index = 0;
}
DataReader.prototype = {
    /**
     * Check that the offset will not go too far.
     * @param {string} offset the additional offset to check.
     * @throws {Error} an Error if the offset is out of bounds.
     */
    checkOffset: function(offset) {
        this.checkIndex(this.index + offset);
    },
    /**
     * Check that the specifed index will not be too far.
     * @param {string} newIndex the index to check.
     * @throws {Error} an Error if the index is out of bounds.
     */
    checkIndex: function(newIndex) {
        if (this.length < newIndex || newIndex < 0) {
            throw new Error("End of data reached (data length = " + this.length + ", asked index = " + (newIndex) + "). Corrupted zip ?");
        }
    },
    /**
     * Change the index.
     * @param {number} newIndex The new index.
     * @throws {Error} if the new index is out of the data.
     */
    setIndex: function(newIndex) {
        this.checkIndex(newIndex);
        this.index = newIndex;
    },
    /**
     * Skip the next n bytes.
     * @param {number} n the number of bytes to skip.
     * @throws {Error} if the new index is out of the data.
     */
    skip: function(n) {
        this.setIndex(this.index + n);
    },
    /**
     * Get the byte at the specified index.
     * @param {number} i the index to use.
     * @return {number} a byte.
     */
    byteAt: function(i) {
        // see implementations
    },
    /**
     * Get the next number with a given byte size.
     * @param {number} size the number of bytes to read.
     * @return {number} the corresponding number.
     */
    readInt: function(size) {
        var result = 0,
            i;
        this.checkOffset(size);
        for (i = this.index + size - 1; i >= this.index; i--) {
            result = (result << 8) + this.byteAt(i);
        }
        this.index += size;
        return result;
    },
    /**
     * Get the next string with a given byte size.
     * @param {number} size the number of bytes to read.
     * @return {string} the corresponding string.
     */
    readString: function(size) {
        return utils.transformTo("string", this.readData(size));
    },
    /**
     * Get raw data without conversion, <size> bytes.
     * @param {number} size the number of bytes to read.
     * @return {Object} the raw data, implementation specific.
     */
    readData: function(size) {
        // see implementations
    },
    /**
     * Find the last occurence of a zip signature (4 bytes).
     * @param {string} sig the signature to find.
     * @return {number} the index of the last occurence, -1 if not found.
     */
    lastIndexOfSignature: function(sig) {
        // see implementations
    },
    /**
     * Get the next date.
     * @return {Date} the date.
     */
    readDate: function() {
        var dostime = this.readInt(4);
        return new Date(
        ((dostime >> 25) & 0x7f) + 1980, // year
        ((dostime >> 21) & 0x0f) - 1, // month
        (dostime >> 16) & 0x1f, // day
        (dostime >> 11) & 0x1f, // hour
        (dostime >> 5) & 0x3f, // minute
        (dostime & 0x1f) << 1); // second
    }
};
module.exports = DataReader;

},{"./utils":21}],6:[function(_dereq_,module,exports){
'use strict';
exports.base64 = false;
exports.binary = false;
exports.dir = false;
exports.createFolders = false;
exports.date = null;
exports.compression = null;
exports.comment = null;

},{}],7:[function(_dereq_,module,exports){
'use strict';
var utils = _dereq_('./utils');

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.string2binary = function(str) {
    return utils.string2binary(str);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.string2Uint8Array = function(str) {
    return utils.transformTo("uint8array", str);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.uint8Array2String = function(array) {
    return utils.transformTo("string", array);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.string2Blob = function(str) {
    var buffer = utils.transformTo("arraybuffer", str);
    return utils.arrayBuffer2Blob(buffer);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.arrayBuffer2Blob = function(buffer) {
    return utils.arrayBuffer2Blob(buffer);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.transformTo = function(outputType, input) {
    return utils.transformTo(outputType, input);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.getTypeOf = function(input) {
    return utils.getTypeOf(input);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.checkSupport = function(type) {
    return utils.checkSupport(type);
};

/**
 * @deprecated
 * This value will be removed in a future version without replacement.
 */
exports.MAX_VALUE_16BITS = utils.MAX_VALUE_16BITS;

/**
 * @deprecated
 * This value will be removed in a future version without replacement.
 */
exports.MAX_VALUE_32BITS = utils.MAX_VALUE_32BITS;


/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.pretty = function(str) {
    return utils.pretty(str);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.findCompression = function(compressionMethod) {
    return utils.findCompression(compressionMethod);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.isRegExp = function (object) {
    return utils.isRegExp(object);
};


},{"./utils":21}],8:[function(_dereq_,module,exports){
'use strict';
var USE_TYPEDARRAY = (typeof Uint8Array !== 'undefined') && (typeof Uint16Array !== 'undefined') && (typeof Uint32Array !== 'undefined');

var pako = _dereq_("pako");
exports.uncompressInputType = USE_TYPEDARRAY ? "uint8array" : "array";
exports.compressInputType = USE_TYPEDARRAY ? "uint8array" : "array";

exports.magic = "\x08\x00";
exports.compress = function(input) {
    return pako.deflateRaw(input);
};
exports.uncompress =  function(input) {
    return pako.inflateRaw(input);
};

},{"pako":24}],9:[function(_dereq_,module,exports){
'use strict';

var base64 = _dereq_('./base64');

/**
Usage:
   zip = new JSZip();
   zip.file("hello.txt", "Hello, World!").file("tempfile", "nothing");
   zip.folder("images").file("smile.gif", base64Data, {base64: true});
   zip.file("Xmas.txt", "Ho ho ho !", {date : new Date("December 25, 2007 00:00:01")});
   zip.remove("tempfile");

   base64zip = zip.generate();

**/

/**
 * Representation a of zip file in js
 * @constructor
 * @param {String=|ArrayBuffer=|Uint8Array=} data the data to load, if any (optional).
 * @param {Object=} options the options for creating this objects (optional).
 */
function JSZipSync(data, options) {
    // if this constructor is used without `new`, it adds `new` before itself:
    if(!(this instanceof JSZipSync)) return new JSZipSync(data, options);

    // object containing the files :
    // {
    //   "folder/" : {...},
    //   "folder/data.txt" : {...}
    // }
    this.files = {};

    this.comment = null;

    // Where we are in the hierarchy
    this.root = "";
    if (data) {
        this.load(data, options);
    }
    this.clone = function() {
        var newObj = new JSZipSync();
        for (var i in this) {
            if (typeof this[i] !== "function") {
                newObj[i] = this[i];
            }
        }
        return newObj;
    };
}
JSZipSync.prototype = _dereq_('./object');
JSZipSync.prototype.load = _dereq_('./load');
JSZipSync.support = _dereq_('./support');
JSZipSync.defaults = _dereq_('./defaults');

/**
 * @deprecated
 * This namespace will be removed in a future version without replacement.
 */
JSZipSync.utils = _dereq_('./deprecatedPublicUtils');

JSZipSync.base64 = {
    /**
     * @deprecated
     * This method will be removed in a future version without replacement.
     */
    encode : function(input) {
        return base64.encode(input);
    },
    /**
     * @deprecated
     * This method will be removed in a future version without replacement.
     */
    decode : function(input) {
        return base64.decode(input);
    }
};
JSZipSync.compressions = _dereq_('./compressions');
module.exports = JSZipSync;

},{"./base64":1,"./compressions":3,"./defaults":6,"./deprecatedPublicUtils":7,"./load":10,"./object":13,"./support":17}],10:[function(_dereq_,module,exports){
'use strict';
var base64 = _dereq_('./base64');
var ZipEntries = _dereq_('./zipEntries');
module.exports = function(data, options) {
    var files, zipEntries, i, input;
    options = options || {};
    if (options.base64) {
        data = base64.decode(data);
    }

    zipEntries = new ZipEntries(data, options);
    files = zipEntries.files;
    for (i = 0; i < files.length; i++) {
        input = files[i];
        this.file(input.fileName, input.decompressed, {
            binary: true,
            optimizedBinaryString: true,
            date: input.date,
            dir: input.dir,
            comment : input.fileComment.length ? input.fileComment : null,
            createFolders: options.createFolders
        });
    }
    if (zipEntries.zipComment.length) {
        this.comment = zipEntries.zipComment;
    }

    return this;
};

},{"./base64":1,"./zipEntries":22}],11:[function(_dereq_,module,exports){
(function (Buffer){
'use strict';
var Buffer_from = /*::(*/function(){}/*:: :any)*/;
if(typeof Buffer !== 'undefined') {
    var nbfs = !Buffer.from;
    if(!nbfs) try { Buffer.from("foo", "utf8"); } catch(e) { nbfs = true; }
    Buffer_from = nbfs ? function(buf, enc) { return (enc) ? new Buffer(buf, enc) : new Buffer(buf); } : Buffer.from.bind(Buffer);
    // $FlowIgnore
    if(!Buffer.alloc) Buffer.alloc = function(n) { return new Buffer(n); };
}
module.exports = function(data, encoding){
    return typeof data == 'number' ? Buffer.alloc(data) : Buffer_from(data, encoding);
};
module.exports.test = function(b){
    return Buffer.isBuffer(b);
};
}).call(this,(typeof Buffer !== "undefined" ? Buffer : undefined));
},{}],12:[function(_dereq_,module,exports){
'use strict';
var Uint8ArrayReader = _dereq_('./uint8ArrayReader');

function NodeBufferReader(data) {
    this.data = data;
    this.length = this.data.length;
    this.index = 0;
}
NodeBufferReader.prototype = new Uint8ArrayReader();

/**
 * @see DataReader.readData
 */
NodeBufferReader.prototype.readData = function(size) {
    this.checkOffset(size);
    var result = this.data.slice(this.index, this.index + size);
    this.index += size;
    return result;
};
module.exports = NodeBufferReader;

},{"./uint8ArrayReader":18}],13:[function(_dereq_,module,exports){
'use strict';
var support = _dereq_('./support');
var utils = _dereq_('./utils');
var crc32 = _dereq_('./crc32');
var signature = _dereq_('./signature');
var defaults = _dereq_('./defaults');
var base64 = _dereq_('./base64');
var compressions = _dereq_('./compressions');
var CompressedObject = _dereq_('./compressedObject');
var nodeBuffer = _dereq_('./nodeBuffer');
var utf8 = _dereq_('./utf8');
var StringWriter = _dereq_('./stringWriter');
var Uint8ArrayWriter = _dereq_('./uint8ArrayWriter');

/**
 * Returns the raw data of a ZipObject, decompress the content if necessary.
 * @param {ZipObject} file the file to use.
 * @return {String|ArrayBuffer|Uint8Array|Buffer} the data.
 */
var getRawData = function(file) {
    if (file._data instanceof CompressedObject) {
        file._data = file._data.getContent();
        file.options.binary = true;
        file.options.base64 = false;

        if (utils.getTypeOf(file._data) === "uint8array") {
            var copy = file._data;
            // when reading an arraybuffer, the CompressedObject mechanism will keep it and subarray() a Uint8Array.
            // if we request a file in the same format, we might get the same Uint8Array or its ArrayBuffer (the original zip file).
            file._data = new Uint8Array(copy.length);
            // with an empty Uint8Array, Opera fails with a "Offset larger than array size"
            if (copy.length !== 0) {
                file._data.set(copy, 0);
            }
        }
    }
    return file._data;
};

/**
 * Returns the data of a ZipObject in a binary form. If the content is an unicode string, encode it.
 * @param {ZipObject} file the file to use.
 * @return {String|ArrayBuffer|Uint8Array|Buffer} the data.
 */
var getBinaryData = function(file) {
    var result = getRawData(file),
        type = utils.getTypeOf(result);
    if (type === "string") {
        if (!file.options.binary) {
            // unicode text !
            // unicode string => binary string is a painful process, check if we can avoid it.
            if (support.nodebuffer) {
                return nodeBuffer(result, "utf-8");
            }
        }
        return file.asBinary();
    }
    return result;
};

/**
 * Transform this._data into a string.
 * @param {function} filter a function String -> String, applied if not null on the result.
 * @return {String} the string representing this._data.
 */
var dataToString = function(asUTF8) {
    var result = getRawData(this);
    if (result === null || typeof result === "undefined") {
        return "";
    }
    // if the data is a base64 string, we decode it before checking the encoding !
    if (this.options.base64) {
        result = base64.decode(result);
    }
    if (asUTF8 && this.options.binary) {
        // JSZip.prototype.utf8decode supports arrays as input
        // skip to array => string step, utf8decode will do it.
        result = out.utf8decode(result);
    }
    else {
        // no utf8 transformation, do the array => string step.
        result = utils.transformTo("string", result);
    }

    if (!asUTF8 && !this.options.binary) {
        result = utils.transformTo("string", out.utf8encode(result));
    }
    return result;
};
/**
 * A simple object representing a file in the zip file.
 * @constructor
 * @param {string} name the name of the file
 * @param {String|ArrayBuffer|Uint8Array|Buffer} data the data
 * @param {Object} options the options of the file
 */
var ZipObject = function(name, data, options) {
    this.name = name;
    this.dir = options.dir;
    this.date = options.date;
    this.comment = options.comment;

    this._data = data;
    this.options = options;

    /*
     * This object contains initial values for dir and date.
     * With them, we can check if the user changed the deprecated metadata in
     * `ZipObject#options` or not.
     */
    this._initialMetadata = {
      dir : options.dir,
      date : options.date
    };
};

ZipObject.prototype = {
    /**
     * Return the content as UTF8 string.
     * @return {string} the UTF8 string.
     */
    asText: function() {
        return dataToString.call(this, true);
    },
    /**
     * Returns the binary content.
     * @return {string} the content as binary.
     */
    asBinary: function() {
        return dataToString.call(this, false);
    },
    /**
     * Returns the content as a nodejs Buffer.
     * @return {Buffer} the content as a Buffer.
     */
    asNodeBuffer: function() {
        var result = getBinaryData(this);
        return utils.transformTo("nodebuffer", result);
    },
    /**
     * Returns the content as an Uint8Array.
     * @return {Uint8Array} the content as an Uint8Array.
     */
    asUint8Array: function() {
        var result = getBinaryData(this);
        return utils.transformTo("uint8array", result);
    },
    /**
     * Returns the content as an ArrayBuffer.
     * @return {ArrayBuffer} the content as an ArrayBufer.
     */
    asArrayBuffer: function() {
        return this.asUint8Array().buffer;
    }
};

/**
 * Transform an integer into a string in hexadecimal.
 * @private
 * @param {number} dec the number to convert.
 * @param {number} bytes the number of bytes to generate.
 * @returns {string} the result.
 */
var decToHex = function(dec, bytes) {
    var hex = "",
        i;
    for (i = 0; i < bytes; i++) {
        hex += String.fromCharCode(dec & 0xff);
        dec = dec >>> 8;
    }
    return hex;
};

/**
 * Merge the objects passed as parameters into a new one.
 * @private
 * @param {...Object} var_args All objects to merge.
 * @return {Object} a new object with the data of the others.
 */
var extend = function() {
    var result = {}, i, attr;
    for (i = 0; i < arguments.length; i++) { // arguments is not enumerable in some browsers
        for (attr in arguments[i]) {
            if (arguments[i].hasOwnProperty(attr) && typeof result[attr] === "undefined") {
                result[attr] = arguments[i][attr];
            }
        }
    }
    return result;
};

/**
 * Transforms the (incomplete) options from the user into the complete
 * set of options to create a file.
 * @private
 * @param {Object} o the options from the user.
 * @return {Object} the complete set of options.
 */
var prepareFileAttrs = function(o) {
    o = o || {};
    if (o.base64 === true && (o.binary === null || o.binary === undefined)) {
        o.binary = true;
    }
    o = extend(o, defaults);
    o.date = o.date || new Date();
    if (o.compression !== null) o.compression = o.compression.toUpperCase();

    return o;
};

/**
 * Add a file in the current folder.
 * @private
 * @param {string} name the name of the file
 * @param {String|ArrayBuffer|Uint8Array|Buffer} data the data of the file
 * @param {Object} o the options of the file
 * @return {Object} the new file.
 */
var fileAdd = function(name, data, o) {
    // be sure sub folders exist
    var dataType = utils.getTypeOf(data),
        parent;

    o = prepareFileAttrs(o);

    if (o.createFolders && (parent = parentFolder(name))) {
        folderAdd.call(this, parent, true);
    }

    if (o.dir || data === null || typeof data === "undefined") {
        o.base64 = false;
        o.binary = false;
        data = null;
    }
    else if (dataType === "string") {
        if (o.binary && !o.base64) {
            // optimizedBinaryString == true means that the file has already been filtered with a 0xFF mask
            if (o.optimizedBinaryString !== true) {
                // this is a string, not in a base64 format.
                // Be sure that this is a correct "binary string"
                data = utils.string2binary(data);
            }
        }
    }
    else { // arraybuffer, uint8array, ...
        o.base64 = false;
        o.binary = true;

        if (!dataType && !(data instanceof CompressedObject)) {
            throw new Error("The data of '" + name + "' is in an unsupported format !");
        }

        // special case : it's way easier to work with Uint8Array than with ArrayBuffer
        if (dataType === "arraybuffer") {
            data = utils.transformTo("uint8array", data);
        }
    }

    var object = new ZipObject(name, data, o);
    this.files[name] = object;
    return object;
};

/**
 * Find the parent folder of the path.
 * @private
 * @param {string} path the path to use
 * @return {string} the parent folder, or ""
 */
var parentFolder = function (path) {
    if (path.slice(-1) == '/') {
        path = path.substring(0, path.length - 1);
    }
    var lastSlash = path.lastIndexOf('/');
    return (lastSlash > 0) ? path.substring(0, lastSlash) : "";
};

/**
 * Add a (sub) folder in the current folder.
 * @private
 * @param {string} name the folder's name
 * @param {boolean=} [createFolders] If true, automatically create sub
 *  folders. Defaults to false.
 * @return {Object} the new folder.
 */
var folderAdd = function(name, createFolders) {
    // Check the name ends with a /
    if (name.slice(-1) != "/") {
        name += "/"; // IE doesn't like substr(-1)
    }

    createFolders = (typeof createFolders !== 'undefined') ? createFolders : false;

    // Does this folder already exist?
    if (!this.files[name]) {
        fileAdd.call(this, name, null, {
            dir: true,
            createFolders: createFolders
        });
    }
    return this.files[name];
};

/**
 * Generate a JSZip.CompressedObject for a given zipOject.
 * @param {ZipObject} file the object to read.
 * @param {JSZip.compression} compression the compression to use.
 * @return {JSZip.CompressedObject} the compressed result.
 */
var generateCompressedObjectFrom = function(file, compression) {
    var result = new CompressedObject(),
        content;

    // the data has not been decompressed, we might reuse things !
    if (file._data instanceof CompressedObject) {
        result.uncompressedSize = file._data.uncompressedSize;
        result.crc32 = file._data.crc32;

        if (result.uncompressedSize === 0 || file.dir) {
            compression = compressions['STORE'];
            result.compressedContent = "";
            result.crc32 = 0;
        }
        else if (file._data.compressionMethod === compression.magic) {
            result.compressedContent = file._data.getCompressedContent();
        }
        else {
            content = file._data.getContent();
            // need to decompress / recompress
            result.compressedContent = compression.compress(utils.transformTo(compression.compressInputType, content));
        }
    }
    else {
        // have uncompressed data
        content = getBinaryData(file);
        if (!content || content.length === 0 || file.dir) {
            compression = compressions['STORE'];
            content = "";
        }
        result.uncompressedSize = content.length;
        result.crc32 = crc32(content);
        result.compressedContent = compression.compress(utils.transformTo(compression.compressInputType, content));
    }

    result.compressedSize = result.compressedContent.length;
    result.compressionMethod = compression.magic;

    return result;
};

/**
 * Generate the various parts used in the construction of the final zip file.
 * @param {string} name the file name.
 * @param {ZipObject} file the file content.
 * @param {JSZip.CompressedObject} compressedObject the compressed object.
 * @param {number} offset the current offset from the start of the zip file.
 * @return {object} the zip parts.
 */
var generateZipParts = function(name, file, compressedObject, offset) {
    var data = compressedObject.compressedContent,
        utfEncodedFileName = utils.transformTo("string", utf8.utf8encode(file.name)),
        comment = file.comment || "",
        utfEncodedComment = utils.transformTo("string", utf8.utf8encode(comment)),
        useUTF8ForFileName = utfEncodedFileName.length !== file.name.length,
        useUTF8ForComment = utfEncodedComment.length !== comment.length,
        o = file.options,
        dosTime,
        dosDate,
        extraFields = "",
        unicodePathExtraField = "",
        unicodeCommentExtraField = "",
        dir, date;


    // handle the deprecated options.dir
    if (file._initialMetadata.dir !== file.dir) {
        dir = file.dir;
    } else {
        dir = o.dir;
    }

    // handle the deprecated options.date
    if(file._initialMetadata.date !== file.date) {
        date = file.date;
    } else {
        date = o.date;
    }


    dosTime = date.getHours();
    dosTime = dosTime << 6;
    dosTime = dosTime | date.getMinutes();
    dosTime = dosTime << 5;
    dosTime = dosTime | date.getSeconds() / 2;

    dosDate = date.getFullYear() - 1980;
    dosDate = dosDate << 4;
    dosDate = dosDate | (date.getMonth() + 1);
    dosDate = dosDate << 5;
    dosDate = dosDate | date.getDate();

    if (useUTF8ForFileName) {
        // set the unicode path extra field. unzip needs at least one extra
        // field to correctly handle unicode path, so using the path is as good
        // as any other information. This could improve the situation with
        // other archive managers too.
        // This field is usually used without the utf8 flag, with a non
        // unicode path in the header (winrar, winzip). This helps (a bit)
        // with the messy Windows' default compressed folders feature but
        // breaks on p7zip which doesn't seek the unicode path extra field.
        // So for now, UTF-8 everywhere !
        unicodePathExtraField =
            // Version
            decToHex(1, 1) +
            // NameCRC32
            decToHex(crc32(utfEncodedFileName), 4) +
            // UnicodeName
            utfEncodedFileName;

        extraFields +=
            // Info-ZIP Unicode Path Extra Field
            "\x75\x70" +
            // size
            decToHex(unicodePathExtraField.length, 2) +
            // content
            unicodePathExtraField;
    }

    if(useUTF8ForComment) {

        unicodeCommentExtraField =
            // Version
            decToHex(1, 1) +
            // CommentCRC32
            decToHex(this.crc32(utfEncodedComment), 4) +
            // UnicodeName
            utfEncodedComment;

        extraFields +=
            // Info-ZIP Unicode Path Extra Field
            "\x75\x63" +
            // size
            decToHex(unicodeCommentExtraField.length, 2) +
            // content
            unicodeCommentExtraField;
    }

    var header = "";

    // version needed to extract
    header += "\x0A\x00";
    // general purpose bit flag
    // set bit 11 if utf8
    header += (useUTF8ForFileName || useUTF8ForComment) ? "\x00\x08" : "\x00\x00";
    // compression method
    header += compressedObject.compressionMethod;
    // last mod file time
    header += decToHex(dosTime, 2);
    // last mod file date
    header += decToHex(dosDate, 2);
    // crc-32
    header += decToHex(compressedObject.crc32, 4);
    // compressed size
    header += decToHex(compressedObject.compressedSize, 4);
    // uncompressed size
    header += decToHex(compressedObject.uncompressedSize, 4);
    // file name length
    header += decToHex(utfEncodedFileName.length, 2);
    // extra field length
    header += decToHex(extraFields.length, 2);


    var fileRecord = signature.LOCAL_FILE_HEADER + header + utfEncodedFileName + extraFields;

    var dirRecord = signature.CENTRAL_FILE_HEADER +
    // version made by (00: DOS)
    "\x14\x00" +
    // file header (common to file and central directory)
    header +
    // file comment length
    decToHex(utfEncodedComment.length, 2) +
    // disk number start
    "\x00\x00" +
    // internal file attributes TODO
    "\x00\x00" +
    // external file attributes
    (dir === true ? "\x10\x00\x00\x00" : "\x00\x00\x00\x00") +
    // relative offset of local header
    decToHex(offset, 4) +
    // file name
    utfEncodedFileName +
    // extra field
    extraFields +
    // file comment
    utfEncodedComment;

    return {
        fileRecord: fileRecord,
        dirRecord: dirRecord,
        compressedObject: compressedObject
    };
};


// return the actual prototype of JSZip
var out = {
    /**
     * Read an existing zip and merge the data in the current JSZip object.
     * The implementation is in jszip-load.js, don't forget to include it.
     * @param {String|ArrayBuffer|Uint8Array|Buffer} stream  The stream to load
     * @param {Object} options Options for loading the stream.
     *  options.base64 : is the stream in base64 ? default : false
     * @return {JSZip} the current JSZip object
     */
    load: function(stream, options) {
        throw new Error("Load method is not defined. Is the file jszip-load.js included ?");
    },

    /**
     * Filter nested files/folders with the specified function.
     * @param {Function} search the predicate to use :
     * function (relativePath, file) {...}
     * It takes 2 arguments : the relative path and the file.
     * @return {Array} An array of matching elements.
     */
    filter: function(search) {
        var result = [],
            filename, relativePath, file, fileClone;
        for (filename in this.files) {
            if (!this.files.hasOwnProperty(filename)) {
                continue;
            }
            file = this.files[filename];
            // return a new object, don't let the user mess with our internal objects :)
            fileClone = new ZipObject(file.name, file._data, extend(file.options));
            relativePath = filename.slice(this.root.length, filename.length);
            if (filename.slice(0, this.root.length) === this.root && // the file is in the current root
            search(relativePath, fileClone)) { // and the file matches the function
                result.push(fileClone);
            }
        }
        return result;
    },

    /**
     * Add a file to the zip file, or search a file.
     * @param   {string|RegExp} name The name of the file to add (if data is defined),
     * the name of the file to find (if no data) or a regex to match files.
     * @param   {String|ArrayBuffer|Uint8Array|Buffer} data  The file data, either raw or base64 encoded
     * @param   {Object} o     File options
     * @return  {JSZip|Object|Array} this JSZip object (when adding a file),
     * a file (when searching by string) or an array of files (when searching by regex).
     */
    file: function(name, data, o) {
        if (arguments.length === 1) {
            if (utils.isRegExp(name)) {
                var regexp = name;
                return this.filter(function(relativePath, file) {
                    return !file.dir && regexp.test(relativePath);
                });
            }
            else { // text
                return this.filter(function(relativePath, file) {
                    return !file.dir && relativePath === name;
                })[0] || null;
            }
        }
        else { // more than one argument : we have data !
            name = this.root + name;
            fileAdd.call(this, name, data, o);
        }
        return this;
    },

    /**
     * Add a directory to the zip file, or search.
     * @param   {String|RegExp} arg The name of the directory to add, or a regex to search folders.
     * @return  {JSZip} an object with the new directory as the root, or an array containing matching folders.
     */
    folder: function(arg) {
        if (!arg) {
            return this;
        }

        if (utils.isRegExp(arg)) {
            return this.filter(function(relativePath, file) {
                return file.dir && arg.test(relativePath);
            });
        }

        // else, name is a new folder
        var name = this.root + arg;
        var newFolder = folderAdd.call(this, name);

        // Allow chaining by returning a new object with this folder as the root
        var ret = this.clone();
        ret.root = newFolder.name;
        return ret;
    },

    /**
     * Delete a file, or a directory and all sub-files, from the zip
     * @param {string} name the name of the file to delete
     * @return {JSZip} this JSZip object
     */
    remove: function(name) {
        name = this.root + name;
        var file = this.files[name];
        if (!file) {
            // Look for any folders
            if (name.slice(-1) != "/") {
                name += "/";
            }
            file = this.files[name];
        }

        if (file && !file.dir) {
            // file
            delete this.files[name];
        } else {
            // maybe a folder, delete recursively
            var kids = this.filter(function(relativePath, file) {
                return file.name.slice(0, name.length) === name;
            });
            for (var i = 0; i < kids.length; i++) {
                delete this.files[kids[i].name];
            }
        }

        return this;
    },

    /**
     * Generate the complete zip file
     * @param {Object} options the options to generate the zip file :
     * - base64, (deprecated, use type instead) true to generate base64.
     * - compression, "STORE" by default.
     * - type, "base64" by default. Values are : string, base64, uint8array, arraybuffer, blob.
     * @return {String|Uint8Array|ArrayBuffer|Buffer|Blob} the zip file
     */
    generate: function(options) {
        options = extend(options || {}, {
            base64: true,
            compression: "STORE",
            type: "base64",
            comment: null
        });

        utils.checkSupport(options.type);

        var zipData = [],
            localDirLength = 0,
            centralDirLength = 0,
            writer, i,
            utfEncodedComment = utils.transformTo("string", this.utf8encode(options.comment || this.comment || ""));

        // first, generate all the zip parts.
        for (var name in this.files) {
            if (!this.files.hasOwnProperty(name)) {
                continue;
            }
            var file = this.files[name];

            var compressionName = file.options.compression || options.compression.toUpperCase();
            var compression = compressions[compressionName];
            if (!compression) {
                throw new Error(compressionName + " is not a valid compression method !");
            }

            var compressedObject = generateCompressedObjectFrom.call(this, file, compression);

            var zipPart = generateZipParts.call(this, name, file, compressedObject, localDirLength);
            localDirLength += zipPart.fileRecord.length + compressedObject.compressedSize;
            centralDirLength += zipPart.dirRecord.length;
            zipData.push(zipPart);
        }

        var dirEnd = "";

        // end of central dir signature
        dirEnd = signature.CENTRAL_DIRECTORY_END +
        // number of this disk
        "\x00\x00" +
        // number of the disk with the start of the central directory
        "\x00\x00" +
        // total number of entries in the central directory on this disk
        decToHex(zipData.length, 2) +
        // total number of entries in the central directory
        decToHex(zipData.length, 2) +
        // size of the central directory   4 bytes
        decToHex(centralDirLength, 4) +
        // offset of start of central directory with respect to the starting disk number
        decToHex(localDirLength, 4) +
        // .ZIP file comment length
        decToHex(utfEncodedComment.length, 2) +
        // .ZIP file comment
        utfEncodedComment;


        // we have all the parts (and the total length)
        // time to create a writer !
        var typeName = options.type.toLowerCase();
        if(typeName==="uint8array"||typeName==="arraybuffer"||typeName==="blob"||typeName==="nodebuffer") {
            writer = new Uint8ArrayWriter(localDirLength + centralDirLength + dirEnd.length);
        }else {
            writer = new StringWriter(localDirLength + centralDirLength + dirEnd.length);
        }

        for (i = 0; i < zipData.length; i++) {
            writer.append(zipData[i].fileRecord);
            writer.append(zipData[i].compressedObject.compressedContent);
        }
        for (i = 0; i < zipData.length; i++) {
            writer.append(zipData[i].dirRecord);
        }

        writer.append(dirEnd);

        var zip = writer.finalize();



        switch(options.type.toLowerCase()) {
            // case "zip is an Uint8Array"
            case "uint8array" :
            case "arraybuffer" :
            case "nodebuffer" :
               return utils.transformTo(options.type.toLowerCase(), zip);
            case "blob" :
               return utils.arrayBuffer2Blob(utils.transformTo("arraybuffer", zip));
            // case "zip is a string"
            case "base64" :
               return (options.base64) ? base64.encode(zip) : zip;
            default : // case "string" :
               return zip;
         }

    },

    /**
     * @deprecated
     * This method will be removed in a future version without replacement.
     */
    crc32: function (input, crc) {
        return crc32(input, crc);
    },

    /**
     * @deprecated
     * This method will be removed in a future version without replacement.
     */
    utf8encode: function (string) {
        return utils.transformTo("string", utf8.utf8encode(string));
    },

    /**
     * @deprecated
     * This method will be removed in a future version without replacement.
     */
    utf8decode: function (input) {
        return utf8.utf8decode(input);
    }
};
module.exports = out;

},{"./base64":1,"./compressedObject":2,"./compressions":3,"./crc32":4,"./defaults":6,"./nodeBuffer":11,"./signature":14,"./stringWriter":16,"./support":17,"./uint8ArrayWriter":19,"./utf8":20,"./utils":21}],14:[function(_dereq_,module,exports){
'use strict';
exports.LOCAL_FILE_HEADER = "PK\x03\x04";
exports.CENTRAL_FILE_HEADER = "PK\x01\x02";
exports.CENTRAL_DIRECTORY_END = "PK\x05\x06";
exports.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x06\x07";
exports.ZIP64_CENTRAL_DIRECTORY_END = "PK\x06\x06";
exports.DATA_DESCRIPTOR = "PK\x07\x08";

},{}],15:[function(_dereq_,module,exports){
'use strict';
var DataReader = _dereq_('./dataReader');
var utils = _dereq_('./utils');

function StringReader(data, optimizedBinaryString) {
    this.data = data;
    if (!optimizedBinaryString) {
        this.data = utils.string2binary(this.data);
    }
    this.length = this.data.length;
    this.index = 0;
}
StringReader.prototype = new DataReader();
/**
 * @see DataReader.byteAt
 */
StringReader.prototype.byteAt = function(i) {
    return this.data.charCodeAt(i);
};
/**
 * @see DataReader.lastIndexOfSignature
 */
StringReader.prototype.lastIndexOfSignature = function(sig) {
    return this.data.lastIndexOf(sig);
};
/**
 * @see DataReader.readData
 */
StringReader.prototype.readData = function(size) {
    this.checkOffset(size);
    // this will work because the constructor applied the "& 0xff" mask.
    var result = this.data.slice(this.index, this.index + size);
    this.index += size;
    return result;
};
module.exports = StringReader;

},{"./dataReader":5,"./utils":21}],16:[function(_dereq_,module,exports){
'use strict';

var utils = _dereq_('./utils');

/**
 * An object to write any content to a string.
 * @constructor
 */
var StringWriter = function() {
    this.data = [];
};
StringWriter.prototype = {
    /**
     * Append any content to the current string.
     * @param {Object} input the content to add.
     */
    append: function(input) {
        input = utils.transformTo("string", input);
        this.data.push(input);
    },
    /**
     * Finalize the construction an return the result.
     * @return {string} the generated string.
     */
    finalize: function() {
        return this.data.join("");
    }
};

module.exports = StringWriter;

},{"./utils":21}],17:[function(_dereq_,module,exports){
(function (Buffer){
'use strict';
exports.base64 = true;
exports.array = true;
exports.string = true;
exports.arraybuffer = typeof ArrayBuffer !== "undefined" && typeof Uint8Array !== "undefined";
// contains true if JSZip can read/generate nodejs Buffer, false otherwise.
// Browserify will provide a Buffer implementation for browsers, which is
// an augmented Uint8Array (i.e., can be used as either Buffer or U8).
exports.nodebuffer = typeof Buffer !== "undefined";
// contains true if JSZip can read/generate Uint8Array, false otherwise.
exports.uint8array = typeof Uint8Array !== "undefined";

if (typeof ArrayBuffer === "undefined") {
    exports.blob = false;
}
else {
    var buffer = new ArrayBuffer(0);
    try {
        exports.blob = new Blob([buffer], {
            type: "application/zip"
        }).size === 0;
    }
    catch (e) {
        try {
            var Builder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
            var builder = new Builder();
            builder.append(buffer);
            exports.blob = builder.getBlob('application/zip').size === 0;
        }
        catch (e) {
            exports.blob = false;
        }
    }
}

}).call(this,(typeof Buffer !== "undefined" ? Buffer : undefined));
},{}],18:[function(_dereq_,module,exports){
'use strict';
var DataReader = _dereq_('./dataReader');

function Uint8ArrayReader(data) {
    if (data) {
        this.data = data;
        this.length = this.data.length;
        this.index = 0;
    }
}
Uint8ArrayReader.prototype = new DataReader();
/**
 * @see DataReader.byteAt
 */
Uint8ArrayReader.prototype.byteAt = function(i) {
    return this.data[i];
};
/**
 * @see DataReader.lastIndexOfSignature
 */
Uint8ArrayReader.prototype.lastIndexOfSignature = function(sig) {
    var sig0 = sig.charCodeAt(0),
        sig1 = sig.charCodeAt(1),
        sig2 = sig.charCodeAt(2),
        sig3 = sig.charCodeAt(3);
    for (var i = this.length - 4; i >= 0; --i) {
        if (this.data[i] === sig0 && this.data[i + 1] === sig1 && this.data[i + 2] === sig2 && this.data[i + 3] === sig3) {
            return i;
        }
    }

    return -1;
};
/**
 * @see DataReader.readData
 */
Uint8ArrayReader.prototype.readData = function(size) {
    this.checkOffset(size);
    if(size === 0) {
        // in IE10, when using subarray(idx, idx), we get the array [0x00] instead of [].
        return new Uint8Array(0);
    }
    var result = this.data.subarray(this.index, this.index + size);
    this.index += size;
    return result;
};
module.exports = Uint8ArrayReader;

},{"./dataReader":5}],19:[function(_dereq_,module,exports){
'use strict';

var utils = _dereq_('./utils');

/**
 * An object to write any content to an Uint8Array.
 * @constructor
 * @param {number} length The length of the array.
 */
var Uint8ArrayWriter = function(length) {
    this.data = new Uint8Array(length);
    this.index = 0;
};
Uint8ArrayWriter.prototype = {
    /**
     * Append any content to the current array.
     * @param {Object} input the content to add.
     */
    append: function(input) {
        if (input.length !== 0) {
            // with an empty Uint8Array, Opera fails with a "Offset larger than array size"
            input = utils.transformTo("uint8array", input);
            this.data.set(input, this.index);
            this.index += input.length;
        }
    },
    /**
     * Finalize the construction an return the result.
     * @return {Uint8Array} the generated array.
     */
    finalize: function() {
        return this.data;
    }
};

module.exports = Uint8ArrayWriter;

},{"./utils":21}],20:[function(_dereq_,module,exports){
'use strict';

var utils = _dereq_('./utils');
var support = _dereq_('./support');
var nodeBuffer = _dereq_('./nodeBuffer');

/**
 * The following functions come from pako, from pako/lib/utils/strings
 * released under the MIT license, see pako https://github.com/nodeca/pako/
 */

// Table with utf8 lengths (calculated by first byte of sequence)
// Note, that 5 & 6-byte values and some 4-byte values can not be represented in JS,
// because max possible codepoint is 0x10ffff
var _utf8len = new Array(256);
for (var i=0; i<256; i++) {
  _utf8len[i] = (i >= 252 ? 6 : i >= 248 ? 5 : i >= 240 ? 4 : i >= 224 ? 3 : i >= 192 ? 2 : 1);
}
_utf8len[254]=_utf8len[254]=1; // Invalid sequence start

// convert string to array (typed, when possible)
var string2buf = function (str) {
    var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;

    // count binary size
    for (m_pos = 0; m_pos < str_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if (((c & 0xfc00) === 0xd800) && (m_pos+1 < str_len)) {
            c2 = str.charCodeAt(m_pos+1);
            if ((c2 & 0xfc00) === 0xdc00) {
                c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
                m_pos++;
            }
        }
        buf_len += (c < 0x80) ? 1 : ((c < 0x800) ? 2 : ((c < 0x10000) ? 3 : 4));
    }

    // allocate buffer
    if (support.uint8array) {
        buf = new Uint8Array(buf_len);
    } else {
        buf = new Array(buf_len);
    }

    // convert
    for (i=0, m_pos = 0; i < buf_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 0xfc00) === 0xd800 && (m_pos+1 < str_len)) {
            c2 = str.charCodeAt(m_pos+1);
            if ((c2 & 0xfc00) === 0xdc00) {
                c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
                m_pos++;
            }
        }
        if (c < 0x80) {
            /* one byte */
            buf[i++] = c;
        } else if (c < 0x800) {
            /* two bytes */
            buf[i++] = 0xC0 | (c >>> 6);
            buf[i++] = 0x80 | (c & 0x3f);
        } else if (c < 0x10000) {
            /* three bytes */
            buf[i++] = 0xE0 | (c >>> 12);
            buf[i++] = 0x80 | ((c >>> 6) & 0x3f);
            buf[i++] = 0x80 | (c & 0x3f);
        } else {
            /* four bytes */
            buf[i++] = 0xf0 | (c >>> 18);
            buf[i++] = 0x80 | ((c >>> 12) & 0x3f);
            buf[i++] = 0x80 | ((c >>> 6) & 0x3f);
            buf[i++] = 0x80 | (c & 0x3f);
        }
    }

    return buf;
};

// Calculate max possible position in utf8 buffer,
// that will not break sequence. If that's not possible
// - (very small limits) return max size as is.
//
// buf[] - utf8 bytes array
// max   - length limit (mandatory);
var utf8border = function(buf, max) {
    var pos;

    max = max || buf.length;
    if (max > buf.length) { max = buf.length; }

    // go back from last position, until start of sequence found
    pos = max-1;
    while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) { pos--; }

    // Fuckup - very small and broken sequence,
    // return max, because we should return something anyway.
    if (pos < 0) { return max; }

    // If we came to start of buffer - that means vuffer is too small,
    // return max too.
    if (pos === 0) { return max; }

    return (pos + _utf8len[buf[pos]] > max) ? pos : max;
};

// convert array to string
var buf2string = function (buf) {
    var str, i, out, c, c_len;
    var len = buf.length;

    // Reserve max possible length (2 words per char)
    // NB: by unknown reasons, Array is significantly faster for
    //     String.fromCharCode.apply than Uint16Array.
    var utf16buf = new Array(len*2);

    for (out=0, i=0; i<len;) {
        c = buf[i++];
        // quick process ascii
        if (c < 0x80) { utf16buf[out++] = c; continue; }

        c_len = _utf8len[c];
        // skip 5 & 6 byte codes
        if (c_len > 4) { utf16buf[out++] = 0xfffd; i += c_len-1; continue; }

        // apply mask on first byte
        c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
        // join the rest
        while (c_len > 1 && i < len) {
            c = (c << 6) | (buf[i++] & 0x3f);
            c_len--;
        }

        // terminated by end of string?
        if (c_len > 1) { utf16buf[out++] = 0xfffd; continue; }

        if (c < 0x10000) {
            utf16buf[out++] = c;
        } else {
            c -= 0x10000;
            utf16buf[out++] = 0xd800 | ((c >> 10) & 0x3ff);
            utf16buf[out++] = 0xdc00 | (c & 0x3ff);
        }
    }

    // shrinkBuf(utf16buf, out)
    if (utf16buf.length !== out) {
        if(utf16buf.subarray) {
            utf16buf = utf16buf.subarray(0, out);
        } else {
            utf16buf.length = out;
        }
    }

    // return String.fromCharCode.apply(null, utf16buf);
    return utils.applyFromCharCode(utf16buf);
};


// That's all for the pako functions.


/**
 * Transform a javascript string into an array (typed if possible) of bytes,
 * UTF-8 encoded.
 * @param {String} str the string to encode
 * @return {Array|Uint8Array|Buffer} the UTF-8 encoded string.
 */
exports.utf8encode = function utf8encode(str) {
    if (support.nodebuffer) {
        return nodeBuffer(str, "utf-8");
    }

    return string2buf(str);
};


/**
 * Transform a bytes array (or a representation) representing an UTF-8 encoded
 * string into a javascript string.
 * @param {Array|Uint8Array|Buffer} buf the data de decode
 * @return {String} the decoded string.
 */
exports.utf8decode = function utf8decode(buf) {
    if (support.nodebuffer) {
        return utils.transformTo("nodebuffer", buf).toString("utf-8");
    }

    buf = utils.transformTo(support.uint8array ? "uint8array" : "array", buf);

    // return buf2string(buf);
    // Chrome prefers to work with "small" chunks of data
    // for the method buf2string.
    // Firefox and Chrome has their own shortcut, IE doesn't seem to really care.
    var result = [], k = 0, len = buf.length, chunk = 65536;
    while (k < len) {
        var nextBoundary = utf8border(buf, Math.min(k + chunk, len));
        if (support.uint8array) {
            result.push(buf2string(buf.subarray(k, nextBoundary)));
        } else {
            result.push(buf2string(buf.slice(k, nextBoundary)));
        }
        k = nextBoundary;
    }
    return result.join("");

};
// vim: set shiftwidth=4 softtabstop=4:

},{"./nodeBuffer":11,"./support":17,"./utils":21}],21:[function(_dereq_,module,exports){
'use strict';
var support = _dereq_('./support');
var compressions = _dereq_('./compressions');
var nodeBuffer = _dereq_('./nodeBuffer');
/**
 * Convert a string to a "binary string" : a string containing only char codes between 0 and 255.
 * @param {string} str the string to transform.
 * @return {String} the binary string.
 */
exports.string2binary = function(str) {
    var result = "";
    for (var i = 0; i < str.length; i++) {
        result += String.fromCharCode(str.charCodeAt(i) & 0xff);
    }
    return result;
};
exports.arrayBuffer2Blob = function(buffer) {
    exports.checkSupport("blob");

    try {
        // Blob constructor
        return new Blob([buffer], {
            type: "application/zip"
        });
    }
    catch (e) {

        try {
            // deprecated, browser only, old way
            var Builder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
            var builder = new Builder();
            builder.append(buffer);
            return builder.getBlob('application/zip');
        }
        catch (e) {

            // well, fuck ?!
            throw new Error("Bug : can't construct the Blob.");
        }
    }


};
/**
 * The identity function.
 * @param {Object} input the input.
 * @return {Object} the same input.
 */
function identity(input) {
    return input;
}

/**
 * Fill in an array with a string.
 * @param {String} str the string to use.
 * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to fill in (will be mutated).
 * @return {Array|ArrayBuffer|Uint8Array|Buffer} the updated array.
 */
function stringToArrayLike(str, array) {
    for (var i = 0; i < str.length; ++i) {
        array[i] = str.charCodeAt(i) & 0xFF;
    }
    return array;
}

/**
 * Transform an array-like object to a string.
 * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
 * @return {String} the result.
 */
function arrayLikeToString(array) {
    // Performances notes :
    // --------------------
    // String.fromCharCode.apply(null, array) is the fastest, see
    // see http://jsperf.com/converting-a-uint8array-to-a-string/2
    // but the stack is limited (and we can get huge arrays !).
    //
    // result += String.fromCharCode(array[i]); generate too many strings !
    //
    // This code is inspired by http://jsperf.com/arraybuffer-to-string-apply-performance/2
    var chunk = 65536;
    var result = [],
        len = array.length,
        type = exports.getTypeOf(array),
        k = 0,
        canUseApply = true;
      try {
         switch(type) {
            case "uint8array":
               String.fromCharCode.apply(null, new Uint8Array(0));
               break;
            case "nodebuffer":
               String.fromCharCode.apply(null, nodeBuffer(0));
               break;
         }
      } catch(e) {
         canUseApply = false;
      }

      // no apply : slow and painful algorithm
      // default browser on android 4.*
      if (!canUseApply) {
         var resultStr = "";
         for(var i = 0; i < array.length;i++) {
            resultStr += String.fromCharCode(array[i]);
         }
    return resultStr;
    }
    while (k < len && chunk > 1) {
        try {
            if (type === "array" || type === "nodebuffer") {
                result.push(String.fromCharCode.apply(null, array.slice(k, Math.min(k + chunk, len))));
            }
            else {
                result.push(String.fromCharCode.apply(null, array.subarray(k, Math.min(k + chunk, len))));
            }
            k += chunk;
        }
        catch (e) {
            chunk = Math.floor(chunk / 2);
        }
    }
    return result.join("");
}

exports.applyFromCharCode = arrayLikeToString;


/**
 * Copy the data from an array-like to an other array-like.
 * @param {Array|ArrayBuffer|Uint8Array|Buffer} arrayFrom the origin array.
 * @param {Array|ArrayBuffer|Uint8Array|Buffer} arrayTo the destination array which will be mutated.
 * @return {Array|ArrayBuffer|Uint8Array|Buffer} the updated destination array.
 */
function arrayLikeToArrayLike(arrayFrom, arrayTo) {
    for (var i = 0; i < arrayFrom.length; i++) {
        arrayTo[i] = arrayFrom[i];
    }
    return arrayTo;
}

// a matrix containing functions to transform everything into everything.
var transform = {};

// string to ?
transform["string"] = {
    "string": identity,
    "array": function(input) {
        return stringToArrayLike(input, new Array(input.length));
    },
    "arraybuffer": function(input) {
        return transform["string"]["uint8array"](input).buffer;
    },
    "uint8array": function(input) {
        return stringToArrayLike(input, new Uint8Array(input.length));
    },
    "nodebuffer": function(input) {
        return stringToArrayLike(input, nodeBuffer(input.length));
    }
};

// array to ?
transform["array"] = {
    "string": arrayLikeToString,
    "array": identity,
    "arraybuffer": function(input) {
        return (new Uint8Array(input)).buffer;
    },
    "uint8array": function(input) {
        return new Uint8Array(input);
    },
    "nodebuffer": function(input) {
        return nodeBuffer(input);
    }
};

// arraybuffer to ?
transform["arraybuffer"] = {
    "string": function(input) {
        return arrayLikeToString(new Uint8Array(input));
    },
    "array": function(input) {
        return arrayLikeToArrayLike(new Uint8Array(input), new Array(input.byteLength));
    },
    "arraybuffer": identity,
    "uint8array": function(input) {
        return new Uint8Array(input);
    },
    "nodebuffer": function(input) {
        return nodeBuffer(new Uint8Array(input));
    }
};

// uint8array to ?
transform["uint8array"] = {
    "string": arrayLikeToString,
    "array": function(input) {
        return arrayLikeToArrayLike(input, new Array(input.length));
    },
    "arraybuffer": function(input) {
        return input.buffer;
    },
    "uint8array": identity,
    "nodebuffer": function(input) {
        return nodeBuffer(input);
    }
};

// nodebuffer to ?
transform["nodebuffer"] = {
    "string": arrayLikeToString,
    "array": function(input) {
        return arrayLikeToArrayLike(input, new Array(input.length));
    },
    "arraybuffer": function(input) {
        return transform["nodebuffer"]["uint8array"](input).buffer;
    },
    "uint8array": function(input) {
        return arrayLikeToArrayLike(input, new Uint8Array(input.length));
    },
    "nodebuffer": identity
};

/**
 * Transform an input into any type.
 * The supported output type are : string, array, uint8array, arraybuffer, nodebuffer.
 * If no output type is specified, the unmodified input will be returned.
 * @param {String} outputType the output type.
 * @param {String|Array|ArrayBuffer|Uint8Array|Buffer} input the input to convert.
 * @throws {Error} an Error if the browser doesn't support the requested output type.
 */
exports.transformTo = function(outputType, input) {
    if (!input) {
        // undefined, null, etc
        // an empty string won't harm.
        input = "";
    }
    if (!outputType) {
        return input;
    }
    exports.checkSupport(outputType);
    var inputType = exports.getTypeOf(input);
    var result = transform[inputType][outputType](input);
    return result;
};

/**
 * Return the type of the input.
 * The type will be in a format valid for JSZip.utils.transformTo : string, array, uint8array, arraybuffer.
 * @param {Object} input the input to identify.
 * @return {String} the (lowercase) type of the input.
 */
exports.getTypeOf = function(input) {
    if (typeof input === "string") {
        return "string";
    }
    if (Object.prototype.toString.call(input) === "[object Array]") {
        return "array";
    }
    if (support.nodebuffer && nodeBuffer.test(input)) {
        return "nodebuffer";
    }
    if (support.uint8array && input instanceof Uint8Array) {
        return "uint8array";
    }
    if (support.arraybuffer && input instanceof ArrayBuffer) {
        return "arraybuffer";
    }
};

/**
 * Throw an exception if the type is not supported.
 * @param {String} type the type to check.
 * @throws {Error} an Error if the browser doesn't support the requested type.
 */
exports.checkSupport = function(type) {
    var supported = support[type.toLowerCase()];
    if (!supported) {
        throw new Error(type + " is not supported by this browser");
    }
};
exports.MAX_VALUE_16BITS = 65535;
exports.MAX_VALUE_32BITS = -1; // well, "\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF" is parsed as -1

/**
 * Prettify a string read as binary.
 * @param {string} str the string to prettify.
 * @return {string} a pretty string.
 */
exports.pretty = function(str) {
    var res = '',
        code, i;
    for (i = 0; i < (str || "").length; i++) {
        code = str.charCodeAt(i);
        res += '\\x' + (code < 16 ? "0" : "") + code.toString(16).toUpperCase();
    }
    return res;
};

/**
 * Find a compression registered in JSZip.
 * @param {string} compressionMethod the method magic to find.
 * @return {Object|null} the JSZip compression object, null if none found.
 */
exports.findCompression = function(compressionMethod) {
    for (var method in compressions) {
        if (!compressions.hasOwnProperty(method)) {
            continue;
        }
        if (compressions[method].magic === compressionMethod) {
            return compressions[method];
        }
    }
    return null;
};
/**
* Cross-window, cross-Node-context regular expression detection
* @param  {Object}  object Anything
* @return {Boolean}        true if the object is a regular expression,
* false otherwise
*/
exports.isRegExp = function (object) {
    return Object.prototype.toString.call(object) === "[object RegExp]";
};


},{"./compressions":3,"./nodeBuffer":11,"./support":17}],22:[function(_dereq_,module,exports){
'use strict';
var StringReader = _dereq_('./stringReader');
var NodeBufferReader = _dereq_('./nodeBufferReader');
var Uint8ArrayReader = _dereq_('./uint8ArrayReader');
var utils = _dereq_('./utils');
var sig = _dereq_('./signature');
var ZipEntry = _dereq_('./zipEntry');
var support = _dereq_('./support');
var jszipProto = _dereq_('./object');
//  class ZipEntries {{{
/**
 * All the entries in the zip file.
 * @constructor
 * @param {String|ArrayBuffer|Uint8Array} data the binary stream to load.
 * @param {Object} loadOptions Options for loading the stream.
 */
function ZipEntries(data, loadOptions) {
    this.files = [];
    this.loadOptions = loadOptions;
    if (data) {
        this.load(data);
    }
}
ZipEntries.prototype = {
    /**
     * Check that the reader is on the speficied signature.
     * @param {string} expectedSignature the expected signature.
     * @throws {Error} if it is an other signature.
     */
    checkSignature: function(expectedSignature) {
        var signature = this.reader.readString(4);
        if (signature !== expectedSignature) {
            throw new Error("Corrupted zip or bug : unexpected signature " + "(" + utils.pretty(signature) + ", expected " + utils.pretty(expectedSignature) + ")");
        }
    },
    /**
     * Read the end of the central directory.
     */
    readBlockEndOfCentral: function() {
        this.diskNumber = this.reader.readInt(2);
        this.diskWithCentralDirStart = this.reader.readInt(2);
        this.centralDirRecordsOnThisDisk = this.reader.readInt(2);
        this.centralDirRecords = this.reader.readInt(2);
        this.centralDirSize = this.reader.readInt(4);
        this.centralDirOffset = this.reader.readInt(4);

        this.zipCommentLength = this.reader.readInt(2);
        // warning : the encoding depends of the system locale
        // On a linux machine with LANG=en_US.utf8, this field is utf8 encoded.
        // On a windows machine, this field is encoded with the localized windows code page.
        this.zipComment = this.reader.readString(this.zipCommentLength);
        // To get consistent behavior with the generation part, we will assume that
        // this is utf8 encoded.
        this.zipComment = jszipProto.utf8decode(this.zipComment);
    },
    /**
     * Read the end of the Zip 64 central directory.
     * Not merged with the method readEndOfCentral :
     * The end of central can coexist with its Zip64 brother,
     * I don't want to read the wrong number of bytes !
     */
    readBlockZip64EndOfCentral: function() {
        this.zip64EndOfCentralSize = this.reader.readInt(8);
        this.versionMadeBy = this.reader.readString(2);
        this.versionNeeded = this.reader.readInt(2);
        this.diskNumber = this.reader.readInt(4);
        this.diskWithCentralDirStart = this.reader.readInt(4);
        this.centralDirRecordsOnThisDisk = this.reader.readInt(8);
        this.centralDirRecords = this.reader.readInt(8);
        this.centralDirSize = this.reader.readInt(8);
        this.centralDirOffset = this.reader.readInt(8);

        this.zip64ExtensibleData = {};
        var extraDataSize = this.zip64EndOfCentralSize - 44,
            index = 0,
            extraFieldId,
            extraFieldLength,
            extraFieldValue;
        while (index < extraDataSize) {
            extraFieldId = this.reader.readInt(2);
            extraFieldLength = this.reader.readInt(4);
            extraFieldValue = this.reader.readString(extraFieldLength);
            this.zip64ExtensibleData[extraFieldId] = {
                id: extraFieldId,
                length: extraFieldLength,
                value: extraFieldValue
            };
        }
    },
    /**
     * Read the end of the Zip 64 central directory locator.
     */
    readBlockZip64EndOfCentralLocator: function() {
        this.diskWithZip64CentralDirStart = this.reader.readInt(4);
        this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8);
        this.disksCount = this.reader.readInt(4);
        if (this.disksCount > 1) {
            throw new Error("Multi-volumes zip are not supported");
        }
    },
    /**
     * Read the local files, based on the offset read in the central part.
     */
    readLocalFiles: function() {
        var i, file;
        for (i = 0; i < this.files.length; i++) {
            file = this.files[i];
            this.reader.setIndex(file.localHeaderOffset);
            this.checkSignature(sig.LOCAL_FILE_HEADER);
            file.readLocalPart(this.reader);
            file.handleUTF8();
        }
    },
    /**
     * Read the central directory.
     */
    readCentralDir: function() {
        var file;

        this.reader.setIndex(this.centralDirOffset);
        while (this.reader.readString(4) === sig.CENTRAL_FILE_HEADER) {
            file = new ZipEntry({
                zip64: this.zip64
            }, this.loadOptions);
            file.readCentralPart(this.reader);
            this.files.push(file);
        }
    },
    /**
     * Read the end of central directory.
     */
    readEndOfCentral: function() {
        var offset = this.reader.lastIndexOfSignature(sig.CENTRAL_DIRECTORY_END);
        if (offset === -1) {
            throw new Error("Corrupted zip : can't find end of central directory");
        }
        this.reader.setIndex(offset);
        this.checkSignature(sig.CENTRAL_DIRECTORY_END);
        this.readBlockEndOfCentral();


        /* extract from the zip spec :
            4)  If one of the fields in the end of central directory
                record is too small to hold required data, the field
                should be set to -1 (0xFFFF or 0xFFFFFFFF) and the
                ZIP64 format record should be created.
            5)  The end of central directory record and the
                Zip64 end of central directory locator record must
                reside on the same disk when splitting or spanning
                an archive.
         */
        if (this.diskNumber === utils.MAX_VALUE_16BITS || this.diskWithCentralDirStart === utils.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === utils.MAX_VALUE_16BITS || this.centralDirRecords === utils.MAX_VALUE_16BITS || this.centralDirSize === utils.MAX_VALUE_32BITS || this.centralDirOffset === utils.MAX_VALUE_32BITS) {
            this.zip64 = true;

            /*
            Warning : the zip64 extension is supported, but ONLY if the 64bits integer read from
            the zip file can fit into a 32bits integer. This cannot be solved : Javascript represents
            all numbers as 64-bit double precision IEEE 754 floating point numbers.
            So, we have 53bits for integers and bitwise operations treat everything as 32bits.
            see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Operators/Bitwise_Operators
            and http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-262.pdf section 8.5
            */

            // should look for a zip64 EOCD locator
            offset = this.reader.lastIndexOfSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);
            if (offset === -1) {
                throw new Error("Corrupted zip : can't find the ZIP64 end of central directory locator");
            }
            this.reader.setIndex(offset);
            this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);
            this.readBlockZip64EndOfCentralLocator();

            // now the zip64 EOCD record
            this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir);
            this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_END);
            this.readBlockZip64EndOfCentral();
        }
    },
    prepareReader: function(data) {
        var type = utils.getTypeOf(data);
        if (type === "string" && !support.uint8array) {
            this.reader = new StringReader(data, this.loadOptions.optimizedBinaryString);
        }
        else if (type === "nodebuffer") {
            this.reader = new NodeBufferReader(data);
        }
        else {
            this.reader = new Uint8ArrayReader(utils.transformTo("uint8array", data));
        }
    },
    /**
     * Read a zip file and create ZipEntries.
     * @param {String|ArrayBuffer|Uint8Array|Buffer} data the binary string representing a zip file.
     */
    load: function(data) {
        this.prepareReader(data);
        this.readEndOfCentral();
        this.readCentralDir();
        this.readLocalFiles();
    }
};
// }}} end of ZipEntries
module.exports = ZipEntries;

},{"./nodeBufferReader":12,"./object":13,"./signature":14,"./stringReader":15,"./support":17,"./uint8ArrayReader":18,"./utils":21,"./zipEntry":23}],23:[function(_dereq_,module,exports){
'use strict';
var StringReader = _dereq_('./stringReader');
var utils = _dereq_('./utils');
var CompressedObject = _dereq_('./compressedObject');
var jszipProto = _dereq_('./object');
// class ZipEntry {{{
/**
 * An entry in the zip file.
 * @constructor
 * @param {Object} options Options of the current file.
 * @param {Object} loadOptions Options for loading the stream.
 */
function ZipEntry(options, loadOptions) {
    this.options = options;
    this.loadOptions = loadOptions;
}
ZipEntry.prototype = {
    /**
     * say if the file is encrypted.
     * @return {boolean} true if the file is encrypted, false otherwise.
     */
    isEncrypted: function() {
        // bit 1 is set
        return (this.bitFlag & 0x0001) === 0x0001;
    },
    /**
     * say if the file has utf-8 filename/comment.
     * @return {boolean} true if the filename/comment is in utf-8, false otherwise.
     */
    useUTF8: function() {
        // bit 11 is set
        return (this.bitFlag & 0x0800) === 0x0800;
    },
    /**
     * Prepare the function used to generate the compressed content from this ZipFile.
     * @param {DataReader} reader the reader to use.
     * @param {number} from the offset from where we should read the data.
     * @param {number} length the length of the data to read.
     * @return {Function} the callback to get the compressed content (the type depends of the DataReader class).
     */
    prepareCompressedContent: function(reader, from, length) {
        return function() {
            var previousIndex = reader.index;
            reader.setIndex(from);
            var compressedFileData = reader.readData(length);
            reader.setIndex(previousIndex);

            return compressedFileData;
        };
    },
    /**
     * Prepare the function used to generate the uncompressed content from this ZipFile.
     * @param {DataReader} reader the reader to use.
     * @param {number} from the offset from where we should read the data.
     * @param {number} length the length of the data to read.
     * @param {JSZip.compression} compression the compression used on this file.
     * @param {number} uncompressedSize the uncompressed size to expect.
     * @return {Function} the callback to get the uncompressed content (the type depends of the DataReader class).
     */
    prepareContent: function(reader, from, length, compression, uncompressedSize) {
        return function() {

            var compressedFileData = utils.transformTo(compression.uncompressInputType, this.getCompressedContent());
            var uncompressedFileData = compression.uncompress(compressedFileData);

            if (uncompressedFileData.length !== uncompressedSize) {
                throw new Error("Bug : uncompressed data size mismatch");
            }

            return uncompressedFileData;
        };
    },
    /**
     * Read the local part of a zip file and add the info in this object.
     * @param {DataReader} reader the reader to use.
     */
    readLocalPart: function(reader) {
        var compression, localExtraFieldsLength;

        // we already know everything from the central dir !
        // If the central dir data are false, we are doomed.
        // On the bright side, the local part is scary  : zip64, data descriptors, both, etc.
        // The less data we get here, the more reliable this should be.
        // Let's skip the whole header and dash to the data !
        reader.skip(22);
        // in some zip created on windows, the filename stored in the central dir contains \ instead of /.
        // Strangely, the filename here is OK.
        // I would love to treat these zip files as corrupted (see http://www.info-zip.org/FAQ.html#backslashes
        // or APPNOTE#4.4.17.1, "All slashes MUST be forward slashes '/'") but there are a lot of bad zip generators...
        // Search "unzip mismatching "local" filename continuing with "central" filename version" on
        // the internet.
        //
        // I think I see the logic here : the central directory is used to display
        // content and the local directory is used to extract the files. Mixing / and \
        // may be used to display \ to windows users and use / when extracting the files.
        // Unfortunately, this lead also to some issues : http://seclists.org/fulldisclosure/2009/Sep/394
        this.fileNameLength = reader.readInt(2);
        localExtraFieldsLength = reader.readInt(2); // can't be sure this will be the same as the central dir
        this.fileName = reader.readString(this.fileNameLength);
        reader.skip(localExtraFieldsLength);

        if (this.compressedSize == -1 || this.uncompressedSize == -1) {
            throw new Error("Bug or corrupted zip : didn't get enough informations from the central directory " + "(compressedSize == -1 || uncompressedSize == -1)");
        }

        compression = utils.findCompression(this.compressionMethod);
        if (compression === null) { // no compression found
            throw new Error("Corrupted zip : compression " + utils.pretty(this.compressionMethod) + " unknown (inner file : " + this.fileName + ")");
        }
        this.decompressed = new CompressedObject();
        this.decompressed.compressedSize = this.compressedSize;
        this.decompressed.uncompressedSize = this.uncompressedSize;
        this.decompressed.crc32 = this.crc32;
        this.decompressed.compressionMethod = this.compressionMethod;
        this.decompressed.getCompressedContent = this.prepareCompressedContent(reader, reader.index, this.compressedSize, compression);
        this.decompressed.getContent = this.prepareContent(reader, reader.index, this.compressedSize, compression, this.uncompressedSize);

        // we need to compute the crc32...
        if (this.loadOptions.checkCRC32) {
            this.decompressed = utils.transformTo("string", this.decompressed.getContent());
            if (jszipProto.crc32(this.decompressed) !== this.crc32) {
                throw new Error("Corrupted zip : CRC32 mismatch");
            }
        }
    },

    /**
     * Read the central part of a zip file and add the info in this object.
     * @param {DataReader} reader the reader to use.
     */
    readCentralPart: function(reader) {
        this.versionMadeBy = reader.readString(2);
        this.versionNeeded = reader.readInt(2);
        this.bitFlag = reader.readInt(2);
        this.compressionMethod = reader.readString(2);
        this.date = reader.readDate();
        this.crc32 = reader.readInt(4);
        this.compressedSize = reader.readInt(4);
        this.uncompressedSize = reader.readInt(4);
        this.fileNameLength = reader.readInt(2);
        this.extraFieldsLength = reader.readInt(2);
        this.fileCommentLength = reader.readInt(2);
        this.diskNumberStart = reader.readInt(2);
        this.internalFileAttributes = reader.readInt(2);
        this.externalFileAttributes = reader.readInt(4);
        this.localHeaderOffset = reader.readInt(4);

        if (this.isEncrypted()) {
            throw new Error("Encrypted zip are not supported");
        }

        this.fileName = reader.readString(this.fileNameLength);
        this.readExtraFields(reader);
        this.parseZIP64ExtraField(reader);
        this.fileComment = reader.readString(this.fileCommentLength);

        // warning, this is true only for zip with madeBy == DOS (plateform dependent feature)
        this.dir = this.externalFileAttributes & 0x00000010 ? true : false;
    },
    /**
     * Parse the ZIP64 extra field and merge the info in the current ZipEntry.
     * @param {DataReader} reader the reader to use.
     */
    parseZIP64ExtraField: function(reader) {

        if (!this.extraFields[0x0001]) {
            return;
        }

        // should be something, preparing the extra reader
        var extraReader = new StringReader(this.extraFields[0x0001].value);

        // I really hope that these 64bits integer can fit in 32 bits integer, because js
        // won't let us have more.
        if (this.uncompressedSize === utils.MAX_VALUE_32BITS) {
            this.uncompressedSize = extraReader.readInt(8);
        }
        if (this.compressedSize === utils.MAX_VALUE_32BITS) {
            this.compressedSize = extraReader.readInt(8);
        }
        if (this.localHeaderOffset === utils.MAX_VALUE_32BITS) {
            this.localHeaderOffset = extraReader.readInt(8);
        }
        if (this.diskNumberStart === utils.MAX_VALUE_32BITS) {
            this.diskNumberStart = extraReader.readInt(4);
        }
    },
    /**
     * Read the central part of a zip file and add the info in this object.
     * @param {DataReader} reader the reader to use.
     */
    readExtraFields: function(reader) {
        var start = reader.index,
            extraFieldId,
            extraFieldLength,
            extraFieldValue;

        this.extraFields = this.extraFields || {};

        while (reader.index < start + this.extraFieldsLength) {
            extraFieldId = reader.readInt(2);
            extraFieldLength = reader.readInt(2);
            extraFieldValue = reader.readString(extraFieldLength);

            this.extraFields[extraFieldId] = {
                id: extraFieldId,
                length: extraFieldLength,
                value: extraFieldValue
            };
        }
    },
    /**
     * Apply an UTF8 transformation if needed.
     */
    handleUTF8: function() {
        if (this.useUTF8()) {
            this.fileName = jszipProto.utf8decode(this.fileName);
            this.fileComment = jszipProto.utf8decode(this.fileComment);
        } else {
            var upath = this.findExtraFieldUnicodePath();
            if (upath !== null) {
                this.fileName = upath;
            }
            var ucomment = this.findExtraFieldUnicodeComment();
            if (ucomment !== null) {
                this.fileComment = ucomment;
            }
        }
    },

    /**
     * Find the unicode path declared in the extra field, if any.
     * @return {String} the unicode path, null otherwise.
     */
    findExtraFieldUnicodePath: function() {
        var upathField = this.extraFields[0x7075];
        if (upathField) {
            var extraReader = new StringReader(upathField.value);

            // wrong version
            if (extraReader.readInt(1) !== 1) {
                return null;
            }

            // the crc of the filename changed, this field is out of date.
            if (jszipProto.crc32(this.fileName) !== extraReader.readInt(4)) {
                return null;
            }

            return jszipProto.utf8decode(extraReader.readString(upathField.length - 5));
        }
        return null;
    },

    /**
     * Find the unicode comment declared in the extra field, if any.
     * @return {String} the unicode comment, null otherwise.
     */
    findExtraFieldUnicodeComment: function() {
        var ucommentField = this.extraFields[0x6375];
        if (ucommentField) {
            var extraReader = new StringReader(ucommentField.value);

            // wrong version
            if (extraReader.readInt(1) !== 1) {
                return null;
            }

            // the crc of the comment changed, this field is out of date.
            if (jszipProto.crc32(this.fileComment) !== extraReader.readInt(4)) {
                return null;
            }

            return jszipProto.utf8decode(extraReader.readString(ucommentField.length - 5));
        }
        return null;
    }
};
module.exports = ZipEntry;

},{"./compressedObject":2,"./object":13,"./stringReader":15,"./utils":21}],24:[function(_dereq_,module,exports){
// Top level file is just a mixin of submodules & constants
'use strict';

var assign    = _dereq_('./lib/utils/common').assign;

var deflate   = _dereq_('./lib/deflate');
var inflate   = _dereq_('./lib/inflate');
var constants = _dereq_('./lib/zlib/constants');

var pako = {};

assign(pako, deflate, inflate, constants);

module.exports = pako;
},{"./lib/deflate":25,"./lib/inflate":26,"./lib/utils/common":27,"./lib/zlib/constants":30}],25:[function(_dereq_,module,exports){
'use strict';


var zlib_deflate = _dereq_('./zlib/deflate.js');
var utils = _dereq_('./utils/common');
var strings = _dereq_('./utils/strings');
var msg = _dereq_('./zlib/messages');
var zstream = _dereq_('./zlib/zstream');


/* Public constants ==========================================================*/
/* ===========================================================================*/

var Z_NO_FLUSH      = 0;
var Z_FINISH        = 4;

var Z_OK            = 0;
var Z_STREAM_END    = 1;

var Z_DEFAULT_COMPRESSION = -1;

var Z_DEFAULT_STRATEGY    = 0;

var Z_DEFLATED  = 8;

/* ===========================================================================*/


/**
 * class Deflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[deflate]],
 * [[deflateRaw]] and [[gzip]].
 **/

/* internal
 * Deflate.chunks -> Array
 *
 * Chunks of output data, if [[Deflate#onData]] not overriden.
 **/

/**
 * Deflate.result -> Uint8Array|Array
 *
 * Compressed result, generated by default [[Deflate#onData]]
 * and [[Deflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Deflate#push]] with `Z_FINISH` / `true` param).
 **/

/**
 * Deflate.err -> Number
 *
 * Error code after deflate finished. 0 (Z_OK) on success.
 * You will not need it in real life, because deflate errors
 * are possible only on wrong options or bad `onData` / `onEnd`
 * custom handlers.
 **/

/**
 * Deflate.msg -> String
 *
 * Error message, if [[Deflate.err]] != 0
 **/


/**
 * new Deflate(options)
 * - options (Object): zlib deflate options.
 *
 * Creates new deflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `level`
 * - `windowBits`
 * - `memLevel`
 * - `strategy`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw deflate
 * - `gzip` (Boolean) - create gzip wrapper
 * - `to` (String) - if equal to 'string', then result will be "binary string"
 *    (each char code [0..255])
 * - `header` (Object) - custom header for gzip
 *   - `text` (Boolean) - true if compressed data believed to be text
 *   - `time` (Number) - modification time, unix timestamp
 *   - `os` (Number) - operation system code
 *   - `extra` (Array) - array of bytes with extra data (max 65536)
 *   - `name` (String) - file name (binary string)
 *   - `comment` (String) - comment (binary string)
 *   - `hcrc` (Boolean) - true if header crc should be added
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , chunk1 = Uint8Array([1,2,3,4,5,6,7,8,9])
 *   , chunk2 = Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * var deflate = new pako.Deflate({ level: 3});
 *
 * deflate.push(chunk1, false);
 * deflate.push(chunk2, true);  // true -> last chunk
 *
 * if (deflate.err) { throw new Error(deflate.err); }
 *
 * console.log(deflate.result);
 * ```
 **/
var Deflate = function(options) {

  this.options = utils.assign({
    level: Z_DEFAULT_COMPRESSION,
    method: Z_DEFLATED,
    chunkSize: 16384,
    windowBits: 15,
    memLevel: 8,
    strategy: Z_DEFAULT_STRATEGY,
    to: ''
  }, options || {});

  var opt = this.options;

  if (opt.raw && (opt.windowBits > 0)) {
    opt.windowBits = -opt.windowBits;
  }

  else if (opt.gzip && (opt.windowBits > 0) && (opt.windowBits < 16)) {
    opt.windowBits += 16;
  }

  this.err    = 0;      // error code, if happens (0 = Z_OK)
  this.msg    = '';     // error message
  this.ended  = false;  // used to avoid multiple onEnd() calls
  this.chunks = [];     // chunks of compressed data

  this.strm = new zstream();
  this.strm.avail_out = 0;

  var status = zlib_deflate.deflateInit2(
    this.strm,
    opt.level,
    opt.method,
    opt.windowBits,
    opt.memLevel,
    opt.strategy
  );

  if (status !== Z_OK) {
    throw new Error(msg[status]);
  }

  if (opt.header) {
    zlib_deflate.deflateSetHeader(this.strm, opt.header);
  }
};

/**
 * Deflate#push(data[, mode]) -> Boolean
 * - data (Uint8Array|Array|String): input data. Strings will be converted to
 *   utf8 byte sequence.
 * - mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
 *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` meansh Z_FINISH.
 *
 * Sends input data to deflate pipe, generating [[Deflate#onData]] calls with
 * new compressed chunks. Returns `true` on success. The last data block must have
 * mode Z_FINISH (or `true`). That flush internal pending buffers and call
 * [[Deflate#onEnd]].
 *
 * On fail call [[Deflate#onEnd]] with error code and return false.
 *
 * We strongly recommend to use `Uint8Array` on input for best speed (output
 * array format is detected automatically). Also, don't skip last param and always
 * use the same type in your code (boolean or number). That will improve JS speed.
 *
 * For regular `Array`-s make sure all elements are [0..255].
 *
 * ##### Example
 *
 * ```javascript
 * push(chunk, false); // push one of data chunks
 * ...
 * push(chunk, true);  // push last chunk
 * ```
 **/
Deflate.prototype.push = function(data, mode) {
  var strm = this.strm;
  var chunkSize = this.options.chunkSize;
  var status, _mode;

  if (this.ended) { return false; }

  _mode = (mode === ~~mode) ? mode : ((mode === true) ? Z_FINISH : Z_NO_FLUSH);

  // Convert data if needed
  if (typeof data === 'string') {
    // If we need to compress text, change encoding to utf8.
    strm.input = strings.string2buf(data);
  } else {
    strm.input = data;
  }

  strm.next_in = 0;
  strm.avail_in = strm.input.length;

  do {
    if (strm.avail_out === 0) {
      strm.output = new utils.Buf8(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }
    status = zlib_deflate.deflate(strm, _mode);    /* no bad return value */

    if (status !== Z_STREAM_END && status !== Z_OK) {
      this.onEnd(status);
      this.ended = true;
      return false;
    }
    if (strm.avail_out === 0 || (strm.avail_in === 0 && _mode === Z_FINISH)) {
      if (this.options.to === 'string') {
        this.onData(strings.buf2binstring(utils.shrinkBuf(strm.output, strm.next_out)));
      } else {
        this.onData(utils.shrinkBuf(strm.output, strm.next_out));
      }
    }
  } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== Z_STREAM_END);

  // Finalize on the last chunk.
  if (_mode === Z_FINISH) {
    status = zlib_deflate.deflateEnd(this.strm);
    this.onEnd(status);
    this.ended = true;
    return status === Z_OK;
  }

  return true;
};


/**
 * Deflate#onData(chunk) -> Void
 * - chunk (Uint8Array|Array|String): ouput data. Type of array depends
 *   on js engine support. When string output requested, each chunk
 *   will be string.
 *
 * By default, stores data blocks in `chunks[]` property and glue
 * those in `onEnd`. Override this handler, if you need another behaviour.
 **/
Deflate.prototype.onData = function(chunk) {
  this.chunks.push(chunk);
};


/**
 * Deflate#onEnd(status) -> Void
 * - status (Number): deflate status. 0 (Z_OK) on success,
 *   other if not.
 *
 * Called once after you tell deflate that input stream complete
 * or error happenned. By default - join collected chunks,
 * free memory and fill `results` / `err` properties.
 **/
Deflate.prototype.onEnd = function(status) {
  // On success - join
  if (status === Z_OK) {
    if (this.options.to === 'string') {
      this.result = this.chunks.join('');
    } else {
      this.result = utils.flattenChunks(this.chunks);
    }
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};


/**
 * deflate(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * Compress `data` with deflate alrorythm and `options`.
 *
 * Supported options are:
 *
 * - level
 * - windowBits
 * - memLevel
 * - strategy
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 * - `to` (String) - if equal to 'string', then result will be "binary string"
 *    (each char code [0..255])
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , data = Uint8Array([1,2,3,4,5,6,7,8,9]);
 *
 * console.log(pako.deflate(data));
 * ```
 **/
function deflate(input, options) {
  var deflator = new Deflate(options);

  deflator.push(input, true);

  // That will never happens, if you don't cheat with options :)
  if (deflator.err) { throw deflator.msg; }

  return deflator.result;
}


/**
 * deflateRaw(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * The same as [[deflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
function deflateRaw(input, options) {
  options = options || {};
  options.raw = true;
  return deflate(input, options);
}


/**
 * gzip(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * The same as [[deflate]], but create gzip wrapper instead of
 * deflate one.
 **/
function gzip(input, options) {
  options = options || {};
  options.gzip = true;
  return deflate(input, options);
}


exports.Deflate = Deflate;
exports.deflate = deflate;
exports.deflateRaw = deflateRaw;
exports.gzip = gzip;
},{"./utils/common":27,"./utils/strings":28,"./zlib/deflate.js":32,"./zlib/messages":37,"./zlib/zstream":39}],26:[function(_dereq_,module,exports){
'use strict';


var zlib_inflate = _dereq_('./zlib/inflate.js');
var utils = _dereq_('./utils/common');
var strings = _dereq_('./utils/strings');
var c = _dereq_('./zlib/constants');
var msg = _dereq_('./zlib/messages');
var zstream = _dereq_('./zlib/zstream');
var gzheader = _dereq_('./zlib/gzheader');


/**
 * class Inflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[inflate]]
 * and [[inflateRaw]].
 **/

/* internal
 * inflate.chunks -> Array
 *
 * Chunks of output data, if [[Inflate#onData]] not overriden.
 **/

/**
 * Inflate.result -> Uint8Array|Array|String
 *
 * Uncompressed result, generated by default [[Inflate#onData]]
 * and [[Inflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Inflate#push]] with `Z_FINISH` / `true` param).
 **/

/**
 * Inflate.err -> Number
 *
 * Error code after inflate finished. 0 (Z_OK) on success.
 * Should be checked if broken data possible.
 **/

/**
 * Inflate.msg -> String
 *
 * Error message, if [[Inflate.err]] != 0
 **/


/**
 * new Inflate(options)
 * - options (Object): zlib inflate options.
 *
 * Creates new inflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `windowBits`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw inflate
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 * By default, when no options set, autodetect deflate/gzip data format via
 * wrapper header.
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , chunk1 = Uint8Array([1,2,3,4,5,6,7,8,9])
 *   , chunk2 = Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * var inflate = new pako.Inflate({ level: 3});
 *
 * inflate.push(chunk1, false);
 * inflate.push(chunk2, true);  // true -> last chunk
 *
 * if (inflate.err) { throw new Error(inflate.err); }
 *
 * console.log(inflate.result);
 * ```
 **/
var Inflate = function(options) {

  this.options = utils.assign({
    chunkSize: 16384,
    windowBits: 0,
    to: ''
  }, options || {});

  var opt = this.options;

  // Force window size for `raw` data, if not set directly,
  // because we have no header for autodetect.
  if (opt.raw && (opt.windowBits >= 0) && (opt.windowBits < 16)) {
    opt.windowBits = -opt.windowBits;
    if (opt.windowBits === 0) { opt.windowBits = -15; }
  }

  // If `windowBits` not defined (and mode not raw) - set autodetect flag for gzip/deflate
  if ((opt.windowBits >= 0) && (opt.windowBits < 16) &&
      !(options && options.windowBits)) {
    opt.windowBits += 32;
  }

  // Gzip header has no info about windows size, we can do autodetect only
  // for deflate. So, if window size not set, force it to max when gzip possible
  if ((opt.windowBits > 15) && (opt.windowBits < 48)) {
    // bit 3 (16) -> gzipped data
    // bit 4 (32) -> autodetect gzip/deflate
    if ((opt.windowBits & 15) === 0) {
      opt.windowBits |= 15;
    }
  }

  this.err    = 0;      // error code, if happens (0 = Z_OK)
  this.msg    = '';     // error message
  this.ended  = false;  // used to avoid multiple onEnd() calls
  this.chunks = [];     // chunks of compressed data

  this.strm   = new zstream();
  this.strm.avail_out = 0;

  var status  = zlib_inflate.inflateInit2(
    this.strm,
    opt.windowBits
  );

  if (status !== c.Z_OK) {
    throw new Error(msg[status]);
  }

  this.header = new gzheader();

  zlib_inflate.inflateGetHeader(this.strm, this.header);
};

/**
 * Inflate#push(data[, mode]) -> Boolean
 * - data (Uint8Array|Array|String): input data
 * - mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
 *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` meansh Z_FINISH.
 *
 * Sends input data to inflate pipe, generating [[Inflate#onData]] calls with
 * new output chunks. Returns `true` on success. The last data block must have
 * mode Z_FINISH (or `true`). That flush internal pending buffers and call
 * [[Inflate#onEnd]].
 *
 * On fail call [[Inflate#onEnd]] with error code and return false.
 *
 * We strongly recommend to use `Uint8Array` on input for best speed (output
 * format is detected automatically). Also, don't skip last param and always
 * use the same type in your code (boolean or number). That will improve JS speed.
 *
 * For regular `Array`-s make sure all elements are [0..255].
 *
 * ##### Example
 *
 * ```javascript
 * push(chunk, false); // push one of data chunks
 * ...
 * push(chunk, true);  // push last chunk
 * ```
 **/
Inflate.prototype.push = function(data, mode) {
  var strm = this.strm;
  var chunkSize = this.options.chunkSize;
  var status, _mode;
  var next_out_utf8, tail, utf8str;

  if (this.ended) { return false; }
  _mode = (mode === ~~mode) ? mode : ((mode === true) ? c.Z_FINISH : c.Z_NO_FLUSH);

  // Convert data if needed
  if (typeof data === 'string') {
    // Only binary strings can be decompressed on practice
    strm.input = strings.binstring2buf(data);
  } else {
    strm.input = data;
  }

  strm.next_in = 0;
  strm.avail_in = strm.input.length;

  do {
    if (strm.avail_out === 0) {
      strm.output = new utils.Buf8(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }

    status = zlib_inflate.inflate(strm, c.Z_NO_FLUSH);    /* no bad return value */

    if (status !== c.Z_STREAM_END && status !== c.Z_OK) {
      this.onEnd(status);
      this.ended = true;
      return false;
    }

    if (strm.next_out) {
      if (strm.avail_out === 0 || status === c.Z_STREAM_END || (strm.avail_in === 0 && _mode === c.Z_FINISH)) {

        if (this.options.to === 'string') {

          next_out_utf8 = strings.utf8border(strm.output, strm.next_out);

          tail = strm.next_out - next_out_utf8;
          utf8str = strings.buf2string(strm.output, next_out_utf8);

          // move tail
          strm.next_out = tail;
          strm.avail_out = chunkSize - tail;
          if (tail) { utils.arraySet(strm.output, strm.output, next_out_utf8, tail, 0); }

          this.onData(utf8str);

        } else {
          this.onData(utils.shrinkBuf(strm.output, strm.next_out));
        }
      }
    }
  } while ((strm.avail_in > 0) && status !== c.Z_STREAM_END);

  if (status === c.Z_STREAM_END) {
    _mode = c.Z_FINISH;
  }
  // Finalize on the last chunk.
  if (_mode === c.Z_FINISH) {
    status = zlib_inflate.inflateEnd(this.strm);
    this.onEnd(status);
    this.ended = true;
    return status === c.Z_OK;
  }

  return true;
};


/**
 * Inflate#onData(chunk) -> Void
 * - chunk (Uint8Array|Array|String): ouput data. Type of array depends
 *   on js engine support. When string output requested, each chunk
 *   will be string.
 *
 * By default, stores data blocks in `chunks[]` property and glue
 * those in `onEnd`. Override this handler, if you need another behaviour.
 **/
Inflate.prototype.onData = function(chunk) {
  this.chunks.push(chunk);
};


/**
 * Inflate#onEnd(status) -> Void
 * - status (Number): inflate status. 0 (Z_OK) on success,
 *   other if not.
 *
 * Called once after you tell inflate that input stream complete
 * or error happenned. By default - join collected chunks,
 * free memory and fill `results` / `err` properties.
 **/
Inflate.prototype.onEnd = function(status) {
  // On success - join
  if (status === c.Z_OK) {
    if (this.options.to === 'string') {
      // Glue & convert here, until we teach pako to send
      // utf8 alligned strings to onData
      this.result = this.chunks.join('');
    } else {
      this.result = utils.flattenChunks(this.chunks);
    }
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};


/**
 * inflate(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Decompress `data` with inflate/ungzip and `options`. Autodetect
 * format via wrapper header by default. That's why we don't provide
 * separate `ungzip` method.
 *
 * Supported options are:
 *
 * - windowBits
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , input = pako.deflate([1,2,3,4,5,6,7,8,9])
 *   , output;
 *
 * try {
 *   output = pako.inflate(input);
 * } catch (err)
 *   console.log(err);
 * }
 * ```
 **/
function inflate(input, options) {
  var inflator = new Inflate(options);

  inflator.push(input, true);

  // That will never happens, if you don't cheat with options :)
  if (inflator.err) { throw inflator.msg; }

  return inflator.result;
}


/**
 * inflateRaw(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * The same as [[inflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
function inflateRaw(input, options) {
  options = options || {};
  options.raw = true;
  return inflate(input, options);
}


/**
 * ungzip(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Just shortcut to [[inflate]], because it autodetects format
 * by header.content. Done for convenience.
 **/


exports.Inflate = Inflate;
exports.inflate = inflate;
exports.inflateRaw = inflateRaw;
exports.ungzip  = inflate;

},{"./utils/common":27,"./utils/strings":28,"./zlib/constants":30,"./zlib/gzheader":33,"./zlib/inflate.js":35,"./zlib/messages":37,"./zlib/zstream":39}],27:[function(_dereq_,module,exports){
'use strict';


var TYPED_OK =  (typeof Uint8Array !== 'undefined') &&
                (typeof Uint16Array !== 'undefined') &&
                (typeof Int32Array !== 'undefined');


exports.assign = function (obj /*from1, from2, from3, ...*/) {
  var sources = Array.prototype.slice.call(arguments, 1);
  while (sources.length) {
    var source = sources.shift();
    if (!source) { continue; }

    if (typeof(source) !== 'object') {
      throw new TypeError(source + 'must be non-object');
    }

    for (var p in source) {
      if (source.hasOwnProperty(p)) {
        obj[p] = source[p];
      }
    }
  }

  return obj;
};


// reduce buffer size, avoiding mem copy
exports.shrinkBuf = function (buf, size) {
  if (buf.length === size) { return buf; }
  if (buf.subarray) { return buf.subarray(0, size); }
  buf.length = size;
  return buf;
};


var fnTyped = {
  arraySet: function (dest, src, src_offs, len, dest_offs) {
    if (src.subarray && dest.subarray) {
      dest.set(src.subarray(src_offs, src_offs+len), dest_offs);
      return;
    }
    // Fallback to ordinary array
    for(var i=0; i<len; i++) {
      dest[dest_offs + i] = src[src_offs + i];
    }
  },
  // Join array of chunks to single array.
  flattenChunks: function(chunks) {
    var i, l, len, pos, chunk, result;

    // calculate data length
    len = 0;
    for (i=0, l=chunks.length; i<l; i++) {
      len += chunks[i].length;
    }

    // join chunks
    result = new Uint8Array(len);
    pos = 0;
    for (i=0, l=chunks.length; i<l; i++) {
      chunk = chunks[i];
      result.set(chunk, pos);
      pos += chunk.length;
    }

    return result;
  }
};

var fnUntyped = {
  arraySet: function (dest, src, src_offs, len, dest_offs) {
    for(var i=0; i<len; i++) {
      dest[dest_offs + i] = src[src_offs + i];
    }
  },
  // Join array of chunks to single array.
  flattenChunks: function(chunks) {
    return [].concat.apply([], chunks);
  }
};


// Enable/Disable typed arrays use, for testing
//
exports.setTyped = function (on) {
  if (on) {
    exports.Buf8  = Uint8Array;
    exports.Buf16 = Uint16Array;
    exports.Buf32 = Int32Array;
    exports.assign(exports, fnTyped);
  } else {
    exports.Buf8  = Array;
    exports.Buf16 = Array;
    exports.Buf32 = Array;
    exports.assign(exports, fnUntyped);
  }
};

exports.setTyped(TYPED_OK);
},{}],28:[function(_dereq_,module,exports){
// String encode/decode helpers
'use strict';


var utils = _dereq_('./common');


// Quick check if we can use fast array to bin string conversion
//
// - apply(Array) can fail on Android 2.2
// - apply(Uint8Array) can fail on iOS 5.1 Safary
//
var STR_APPLY_OK = true;
var STR_APPLY_UIA_OK = true;

try { String.fromCharCode.apply(null, [0]); } catch(__) { STR_APPLY_OK = false; }
try { String.fromCharCode.apply(null, new Uint8Array(1)); } catch(__) { STR_APPLY_UIA_OK = false; }


// Table with utf8 lengths (calculated by first byte of sequence)
// Note, that 5 & 6-byte values and some 4-byte values can not be represented in JS,
// because max possible codepoint is 0x10ffff
var _utf8len = new utils.Buf8(256);
for (var i=0; i<256; i++) {
  _utf8len[i] = (i >= 252 ? 6 : i >= 248 ? 5 : i >= 240 ? 4 : i >= 224 ? 3 : i >= 192 ? 2 : 1);
}
_utf8len[254]=_utf8len[254]=1; // Invalid sequence start


// convert string to array (typed, when possible)
exports.string2buf = function (str) {
  var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;

  // count binary size
  for (m_pos = 0; m_pos < str_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && (m_pos+1 < str_len)) {
      c2 = str.charCodeAt(m_pos+1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
  }

  // allocate buffer
  buf = new utils.Buf8(buf_len);

  // convert
  for (i=0, m_pos = 0; i < buf_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && (m_pos+1 < str_len)) {
      c2 = str.charCodeAt(m_pos+1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    if (c < 0x80) {
      /* one byte */
      buf[i++] = c;
    } else if (c < 0x800) {
      /* two bytes */
      buf[i++] = 0xC0 | (c >>> 6);
      buf[i++] = 0x80 | (c & 0x3f);
    } else if (c < 0x10000) {
      /* three bytes */
      buf[i++] = 0xE0 | (c >>> 12);
      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    } else {
      /* four bytes */
      buf[i++] = 0xf0 | (c >>> 18);
      buf[i++] = 0x80 | (c >>> 12 & 0x3f);
      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    }
  }

  return buf;
};

// Helper (used in 2 places)
function buf2binstring(buf, len) {
  // use fallback for big arrays to avoid stack overflow
  if (len < 65537) {
    if ((buf.subarray && STR_APPLY_UIA_OK) || (!buf.subarray && STR_APPLY_OK)) {
      return String.fromCharCode.apply(null, utils.shrinkBuf(buf, len));
    }
  }

  var result = '';
  for(var i=0; i < len; i++) {
    result += String.fromCharCode(buf[i]);
  }
  return result;
}


// Convert byte array to binary string
exports.buf2binstring = function(buf) {
  return buf2binstring(buf, buf.length);
};


// Convert binary string (typed, when possible)
exports.binstring2buf = function(str) {
  var buf = new utils.Buf8(str.length);
  for(var i=0, len=buf.length; i < len; i++) {
    buf[i] = str.charCodeAt(i);
  }
  return buf;
};


// convert array to string
exports.buf2string = function (buf, max) {
  var i, out, c, c_len;
  var len = max || buf.length;

  // Reserve max possible length (2 words per char)
  // NB: by unknown reasons, Array is significantly faster for
  //     String.fromCharCode.apply than Uint16Array.
  var utf16buf = new Array(len*2);

  for (out=0, i=0; i<len;) {
    c = buf[i++];
    // quick process ascii
    if (c < 0x80) { utf16buf[out++] = c; continue; }

    c_len = _utf8len[c];
    // skip 5 & 6 byte codes
    if (c_len > 4) { utf16buf[out++] = 0xfffd; i += c_len-1; continue; }

    // apply mask on first byte
    c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
    // join the rest
    while (c_len > 1 && i < len) {
      c = (c << 6) | (buf[i++] & 0x3f);
      c_len--;
    }

    // terminated by end of string?
    if (c_len > 1) { utf16buf[out++] = 0xfffd; continue; }

    if (c < 0x10000) {
      utf16buf[out++] = c;
    } else {
      c -= 0x10000;
      utf16buf[out++] = 0xd800 | ((c >> 10) & 0x3ff);
      utf16buf[out++] = 0xdc00 | (c & 0x3ff);
    }
  }

  return buf2binstring(utf16buf, out);
};


// Calculate max possible position in utf8 buffer,
// that will not break sequence. If that's not possible
// - (very small limits) return max size as is.
//
// buf[] - utf8 bytes array
// max   - length limit (mandatory);
exports.utf8border = function(buf, max) {
  var pos;

  max = max || buf.length;
  if (max > buf.length) { max = buf.length; }

  // go back from last position, until start of sequence found
  pos = max-1;
  while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) { pos--; }

  // Fuckup - very small and broken sequence,
  // return max, because we should return something anyway.
  if (pos < 0) { return max; }

  // If we came to start of buffer - that means vuffer is too small,
  // return max too.
  if (pos === 0) { return max; }

  return (pos + _utf8len[buf[pos]] > max) ? pos : max;
};

},{"./common":27}],29:[function(_dereq_,module,exports){
'use strict';

// Note: adler32 takes 12% for level 0 and 2% for level 6.
// It doesn't worth to make additional optimizationa as in original.
// Small size is preferable.

function adler32(adler, buf, len, pos) {
  var s1 = (adler & 0xffff) |0
    , s2 = ((adler >>> 16) & 0xffff) |0
    , n = 0;

  while (len !== 0) {
    // Set limit ~ twice less than 5552, to keep
    // s2 in 31-bits, because we force signed ints.
    // in other case %= will fail.
    n = len > 2000 ? 2000 : len;
    len -= n;

    do {
      s1 = (s1 + buf[pos++]) |0;
      s2 = (s2 + s1) |0;
    } while (--n);

    s1 %= 65521;
    s2 %= 65521;
  }

  return (s1 | (s2 << 16)) |0;
}


module.exports = adler32;
},{}],30:[function(_dereq_,module,exports){
module.exports = {

  /* Allowed flush values; see deflate() and inflate() below for details */
  Z_NO_FLUSH:         0,
  Z_PARTIAL_FLUSH:    1,
  Z_SYNC_FLUSH:       2,
  Z_FULL_FLUSH:       3,
  Z_FINISH:           4,
  Z_BLOCK:            5,
  Z_TREES:            6,

  /* Return codes for the compression/decompression functions. Negative values
  * are errors, positive values are used for special but normal events.
  */
  Z_OK:               0,
  Z_STREAM_END:       1,
  Z_NEED_DICT:        2,
  Z_ERRNO:           -1,
  Z_STREAM_ERROR:    -2,
  Z_DATA_ERROR:      -3,
  //Z_MEM_ERROR:     -4,
  Z_BUF_ERROR:       -5,
  //Z_VERSION_ERROR: -6,

  /* compression levels */
  Z_NO_COMPRESSION:         0,
  Z_BEST_SPEED:             1,
  Z_BEST_COMPRESSION:       9,
  Z_DEFAULT_COMPRESSION:   -1,


  Z_FILTERED:               1,
  Z_HUFFMAN_ONLY:           2,
  Z_RLE:                    3,
  Z_FIXED:                  4,
  Z_DEFAULT_STRATEGY:       0,

  /* Possible values of the data_type field (though see inflate()) */
  Z_BINARY:                 0,
  Z_TEXT:                   1,
  //Z_ASCII:                1, // = Z_TEXT (deprecated)
  Z_UNKNOWN:                2,

  /* The deflate compression method */
  Z_DEFLATED:               8
  //Z_NULL:                 null // Use -1 or null inline, depending on var type
};
},{}],31:[function(_dereq_,module,exports){
'use strict';

// Note: we can't get significant speed boost here.
// So write code to minimize size - no pregenerated tables
// and array tools dependencies.


// Use ordinary array, since untyped makes no boost here
function makeTable() {
  var c, table = [];

  for(var n =0; n < 256; n++){
    c = n;
    for(var k =0; k < 8; k++){
      c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c;
  }

  return table;
}

// Create table on load. Just 255 signed longs. Not a problem.
var crcTable = makeTable();


function crc32(crc, buf, len, pos) {
  var t = crcTable
    , end = pos + len;

  crc = crc ^ (-1);

  for (var i = pos; i < end; i++ ) {
    crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
  }

  return (crc ^ (-1)); // >>> 0;
}


module.exports = crc32;
},{}],32:[function(_dereq_,module,exports){
'use strict';

var utils   = _dereq_('../utils/common');
var trees   = _dereq_('./trees');
var adler32 = _dereq_('./adler32');
var crc32   = _dereq_('./crc32');
var msg   = _dereq_('./messages');

/* Public constants ==========================================================*/
/* ===========================================================================*/


/* Allowed flush values; see deflate() and inflate() below for details */
var Z_NO_FLUSH      = 0;
var Z_PARTIAL_FLUSH = 1;
//var Z_SYNC_FLUSH    = 2;
var Z_FULL_FLUSH    = 3;
var Z_FINISH        = 4;
var Z_BLOCK         = 5;
//var Z_TREES         = 6;


/* Return codes for the compression/decompression functions. Negative values
 * are errors, positive values are used for special but normal events.
 */
var Z_OK            = 0;
var Z_STREAM_END    = 1;
//var Z_NEED_DICT     = 2;
//var Z_ERRNO         = -1;
var Z_STREAM_ERROR  = -2;
var Z_DATA_ERROR    = -3;
//var Z_MEM_ERROR     = -4;
var Z_BUF_ERROR     = -5;
//var Z_VERSION_ERROR = -6;


/* compression levels */
//var Z_NO_COMPRESSION      = 0;
//var Z_BEST_SPEED          = 1;
//var Z_BEST_COMPRESSION    = 9;
var Z_DEFAULT_COMPRESSION = -1;


var Z_FILTERED            = 1;
var Z_HUFFMAN_ONLY        = 2;
var Z_RLE                 = 3;
var Z_FIXED               = 4;
var Z_DEFAULT_STRATEGY    = 0;

/* Possible values of the data_type field (though see inflate()) */
//var Z_BINARY              = 0;
//var Z_TEXT                = 1;
//var Z_ASCII               = 1; // = Z_TEXT
var Z_UNKNOWN             = 2;


/* The deflate compression method */
var Z_DEFLATED  = 8;

/*============================================================================*/


var MAX_MEM_LEVEL = 9;
/* Maximum value for memLevel in deflateInit2 */
var MAX_WBITS = 15;
/* 32K LZ77 window */
var DEF_MEM_LEVEL = 8;


var LENGTH_CODES  = 29;
/* number of length codes, not counting the special END_BLOCK code */
var LITERALS      = 256;
/* number of literal bytes 0..255 */
var L_CODES       = LITERALS + 1 + LENGTH_CODES;
/* number of Literal or Length codes, including the END_BLOCK code */
var D_CODES       = 30;
/* number of distance codes */
var BL_CODES      = 19;
/* number of codes used to transfer the bit lengths */
var HEAP_SIZE     = 2*L_CODES + 1;
/* maximum heap size */
var MAX_BITS  = 15;
/* All codes must not exceed MAX_BITS bits */

var MIN_MATCH = 3;
var MAX_MATCH = 258;
var MIN_LOOKAHEAD = (MAX_MATCH + MIN_MATCH + 1);

var PRESET_DICT = 0x20;

var INIT_STATE = 42;
var EXTRA_STATE = 69;
var NAME_STATE = 73;
var COMMENT_STATE = 91;
var HCRC_STATE = 103;
var BUSY_STATE = 113;
var FINISH_STATE = 666;

var BS_NEED_MORE      = 1; /* block not completed, need more input or more output */
var BS_BLOCK_DONE     = 2; /* block flush performed */
var BS_FINISH_STARTED = 3; /* finish started, need only more output at next deflate */
var BS_FINISH_DONE    = 4; /* finish done, accept no more input or output */

var OS_CODE = 0x03; // Unix :) . Don't detect, use this default.

function err(strm, errorCode) {
  strm.msg = msg[errorCode];
  return errorCode;
}

function rank(f) {
  return ((f) << 1) - ((f) > 4 ? 9 : 0);
}

function zero(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }


/* =========================================================================
 * Flush as much pending output as possible. All deflate() output goes
 * through this function so some applications may wish to modify it
 * to avoid allocating a large strm->output buffer and copying into it.
 * (See also read_buf()).
 */
function flush_pending(strm) {
  var s = strm.state;

  //_tr_flush_bits(s);
  var len = s.pending;
  if (len > strm.avail_out) {
    len = strm.avail_out;
  }
  if (len === 0) { return; }

  utils.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
  strm.next_out += len;
  s.pending_out += len;
  strm.total_out += len;
  strm.avail_out -= len;
  s.pending -= len;
  if (s.pending === 0) {
    s.pending_out = 0;
  }
}


function flush_block_only (s, last) {
  trees._tr_flush_block(s, (s.block_start >= 0 ? s.block_start : -1), s.strstart - s.block_start, last);
  s.block_start = s.strstart;
  flush_pending(s.strm);
}


function put_byte(s, b) {
  s.pending_buf[s.pending++] = b;
}


/* =========================================================================
 * Put a short in the pending buffer. The 16-bit value is put in MSB order.
 * IN assertion: the stream state is correct and there is enough room in
 * pending_buf.
 */
function putShortMSB(s, b) {
//  put_byte(s, (Byte)(b >> 8));
//  put_byte(s, (Byte)(b & 0xff));
  s.pending_buf[s.pending++] = (b >>> 8) & 0xff;
  s.pending_buf[s.pending++] = b & 0xff;
}


/* ===========================================================================
 * Read a new buffer from the current input stream, update the adler32
 * and total number of bytes read.  All deflate() input goes through
 * this function so some applications may wish to modify it to avoid
 * allocating a large strm->input buffer and copying from it.
 * (See also flush_pending()).
 */
function read_buf(strm, buf, start, size) {
  var len = strm.avail_in;

  if (len > size) { len = size; }
  if (len === 0) { return 0; }

  strm.avail_in -= len;

  utils.arraySet(buf, strm.input, strm.next_in, len, start);
  if (strm.state.wrap === 1) {
    strm.adler = adler32(strm.adler, buf, len, start);
  }

  else if (strm.state.wrap === 2) {
    strm.adler = crc32(strm.adler, buf, len, start);
  }

  strm.next_in += len;
  strm.total_in += len;

  return len;
}


/* ===========================================================================
 * Set match_start to the longest match starting at the given string and
 * return its length. Matches shorter or equal to prev_length are discarded,
 * in which case the result is equal to prev_length and match_start is
 * garbage.
 * IN assertions: cur_match is the head of the hash chain for the current
 *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
 * OUT assertion: the match length is not greater than s->lookahead.
 */
function longest_match(s, cur_match) {
  var chain_length = s.max_chain_length;      /* max hash chain length */
  var scan = s.strstart; /* current string */
  var match;                       /* matched string */
  var len;                           /* length of current match */
  var best_len = s.prev_length;              /* best match length so far */
  var nice_match = s.nice_match;             /* stop if match long enough */
  var limit = (s.strstart > (s.w_size - MIN_LOOKAHEAD)) ?
      s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0/*NIL*/;

  var _win = s.window; // shortcut

  var wmask = s.w_mask;
  var prev  = s.prev;

  /* Stop when cur_match becomes <= limit. To simplify the code,
   * we prevent matches with the string of window index 0.
   */

  var strend = s.strstart + MAX_MATCH;
  var scan_end1  = _win[scan + best_len - 1];
  var scan_end   = _win[scan + best_len];

  /* The code is optimized for HASH_BITS >= 8 and MAX_MATCH-2 multiple of 16.
   * It is easy to get rid of this optimization if necessary.
   */
  // Assert(s->hash_bits >= 8 && MAX_MATCH == 258, "Code too clever");

  /* Do not waste too much time if we already have a good match: */
  if (s.prev_length >= s.good_match) {
    chain_length >>= 2;
  }
  /* Do not look for matches beyond the end of the input. This is necessary
   * to make deflate deterministic.
   */
  if (nice_match > s.lookahead) { nice_match = s.lookahead; }

  // Assert((ulg)s->strstart <= s->window_size-MIN_LOOKAHEAD, "need lookahead");

  do {
    // Assert(cur_match < s->strstart, "no future");
    match = cur_match;

    /* Skip to next match if the match length cannot increase
     * or if the match length is less than 2.  Note that the checks below
     * for insufficient lookahead only occur occasionally for performance
     * reasons.  Therefore uninitialized memory will be accessed, and
     * conditional jumps will be made that depend on those values.
     * However the length of the match is limited to the lookahead, so
     * the output of deflate is not affected by the uninitialized values.
     */

    if (_win[match + best_len]     !== scan_end  ||
        _win[match + best_len - 1] !== scan_end1 ||
        _win[match]                !== _win[scan] ||
        _win[++match]              !== _win[scan + 1]) {
      continue;
    }

    /* The check at best_len-1 can be removed because it will be made
     * again later. (This heuristic is not always a win.)
     * It is not necessary to compare scan[2] and match[2] since they
     * are always equal when the other bytes match, given that
     * the hash keys are equal and that HASH_BITS >= 8.
     */
    scan += 2;
    match++;
    // Assert(*scan == *match, "match[2]?");

    /* We check for insufficient lookahead only every 8th comparison;
     * the 256th check will be made at strstart+258.
     */
    do {
      /*jshint noempty:false*/
    } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             scan < strend);

    // Assert(scan <= s->window+(unsigned)(s->window_size-1), "wild scan");

    len = MAX_MATCH - (strend - scan);
    scan = strend - MAX_MATCH;

    if (len > best_len) {
      s.match_start = cur_match;
      best_len = len;
      if (len >= nice_match) {
        break;
      }
      scan_end1  = _win[scan + best_len - 1];
      scan_end   = _win[scan + best_len];
    }
  } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);

  if (best_len <= s.lookahead) {
    return best_len;
  }
  return s.lookahead;
}


/* ===========================================================================
 * Fill the window when the lookahead becomes insufficient.
 * Updates strstart and lookahead.
 *
 * IN assertion: lookahead < MIN_LOOKAHEAD
 * OUT assertions: strstart <= window_size-MIN_LOOKAHEAD
 *    At least one byte has been read, or avail_in == 0; reads are
 *    performed for at least two bytes (required for the zip translate_eol
 *    option -- not supported here).
 */
function fill_window(s) {
  var _w_size = s.w_size;
  var p, n, m, more, str;

  //Assert(s->lookahead < MIN_LOOKAHEAD, "already enough lookahead");

  do {
    more = s.window_size - s.lookahead - s.strstart;

    // JS ints have 32 bit, block below not needed
    /* Deal with !@#$% 64K limit: */
    //if (sizeof(int) <= 2) {
    //    if (more == 0 && s->strstart == 0 && s->lookahead == 0) {
    //        more = wsize;
    //
    //  } else if (more == (unsigned)(-1)) {
    //        /* Very unlikely, but possible on 16 bit machine if
    //         * strstart == 0 && lookahead == 1 (input done a byte at time)
    //         */
    //        more--;
    //    }
    //}


    /* If the window is almost full and there is insufficient lookahead,
     * move the upper half to the lower one to make room in the upper half.
     */
    if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {

      utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
      s.match_start -= _w_size;
      s.strstart -= _w_size;
      /* we now have strstart >= MAX_DIST */
      s.block_start -= _w_size;

      /* Slide the hash table (could be avoided with 32 bit values
       at the expense of memory usage). We slide even when level == 0
       to keep the hash table consistent if we switch back to level > 0
       later. (Using level 0 permanently is not an optimal usage of
       zlib, so we don't care about this pathological case.)
       */

      n = s.hash_size;
      p = n;
      do {
        m = s.head[--p];
        s.head[p] = (m >= _w_size ? m - _w_size : 0);
      } while (--n);

      n = _w_size;
      p = n;
      do {
        m = s.prev[--p];
        s.prev[p] = (m >= _w_size ? m - _w_size : 0);
        /* If n is not on any hash chain, prev[n] is garbage but
         * its value will never be used.
         */
      } while (--n);

      more += _w_size;
    }
    if (s.strm.avail_in === 0) {
      break;
    }

    /* If there was no sliding:
     *    strstart <= WSIZE+MAX_DIST-1 && lookahead <= MIN_LOOKAHEAD - 1 &&
     *    more == window_size - lookahead - strstart
     * => more >= window_size - (MIN_LOOKAHEAD-1 + WSIZE + MAX_DIST-1)
     * => more >= window_size - 2*WSIZE + 2
     * In the BIG_MEM or MMAP case (not yet supported),
     *   window_size == input_size + MIN_LOOKAHEAD  &&
     *   strstart + s->lookahead <= input_size => more >= MIN_LOOKAHEAD.
     * Otherwise, window_size == 2*WSIZE so more >= 2.
     * If there was sliding, more >= WSIZE. So in all cases, more >= 2.
     */
    //Assert(more >= 2, "more < 2");
    n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
    s.lookahead += n;

    /* Initialize the hash value now that we have some input: */
    if (s.lookahead + s.insert >= MIN_MATCH) {
      str = s.strstart - s.insert;
      s.ins_h = s.window[str];

      /* UPDATE_HASH(s, s->ins_h, s->window[str + 1]); */
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + 1]) & s.hash_mask;
//#if MIN_MATCH != 3
//        Call update_hash() MIN_MATCH-3 more times
//#endif
      while (s.insert) {
        /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH-1]) & s.hash_mask;

        s.prev[str & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = str;
        str++;
        s.insert--;
        if (s.lookahead + s.insert < MIN_MATCH) {
          break;
        }
      }
    }
    /* If the whole input has less than MIN_MATCH bytes, ins_h is garbage,
     * but this is not important since only literal bytes will be emitted.
     */

  } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);

  /* If the WIN_INIT bytes after the end of the current data have never been
   * written, then zero those bytes in order to avoid memory check reports of
   * the use of uninitialized (or uninitialised as Julian writes) bytes by
   * the longest match routines.  Update the high water mark for the next
   * time through here.  WIN_INIT is set to MAX_MATCH since the longest match
   * routines allow scanning to strstart + MAX_MATCH, ignoring lookahead.
   */
//  if (s.high_water < s.window_size) {
//    var curr = s.strstart + s.lookahead;
//    var init = 0;
//
//    if (s.high_water < curr) {
//      /* Previous high water mark below current data -- zero WIN_INIT
//       * bytes or up to end of window, whichever is less.
//       */
//      init = s.window_size - curr;
//      if (init > WIN_INIT)
//        init = WIN_INIT;
//      zmemzero(s->window + curr, (unsigned)init);
//      s->high_water = curr + init;
//    }
//    else if (s->high_water < (ulg)curr + WIN_INIT) {
//      /* High water mark at or above current data, but below current data
//       * plus WIN_INIT -- zero out to current data plus WIN_INIT, or up
//       * to end of window, whichever is less.
//       */
//      init = (ulg)curr + WIN_INIT - s->high_water;
//      if (init > s->window_size - s->high_water)
//        init = s->window_size - s->high_water;
//      zmemzero(s->window + s->high_water, (unsigned)init);
//      s->high_water += init;
//    }
//  }
//
//  Assert((ulg)s->strstart <= s->window_size - MIN_LOOKAHEAD,
//    "not enough room for search");
}

/* ===========================================================================
 * Copy without compression as much as possible from the input stream, return
 * the current block state.
 * This function does not insert new strings in the dictionary since
 * uncompressible data is probably not useful. This function is used
 * only for the level=0 compression option.
 * NOTE: this function should be optimized to avoid extra copying from
 * window to pending_buf.
 */
function deflate_stored(s, flush) {
  /* Stored blocks are limited to 0xffff bytes, pending_buf is limited
   * to pending_buf_size, and each stored block has a 5 byte header:
   */
  var max_block_size = 0xffff;

  if (max_block_size > s.pending_buf_size - 5) {
    max_block_size = s.pending_buf_size - 5;
  }

  /* Copy as much as possible from input to output: */
  for (;;) {
    /* Fill the window as much as possible: */
    if (s.lookahead <= 1) {

      //Assert(s->strstart < s->w_size+MAX_DIST(s) ||
      //  s->block_start >= (long)s->w_size, "slide too late");
//      if (!(s.strstart < s.w_size + (s.w_size - MIN_LOOKAHEAD) ||
//        s.block_start >= s.w_size)) {
//        throw  new Error("slide too late");
//      }

      fill_window(s);
      if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }

      if (s.lookahead === 0) {
        break;
      }
      /* flush the current block */
    }
    //Assert(s->block_start >= 0L, "block gone");
//    if (s.block_start < 0) throw new Error("block gone");

    s.strstart += s.lookahead;
    s.lookahead = 0;

    /* Emit a stored block if pending_buf will be full: */
    var max_start = s.block_start + max_block_size;

    if (s.strstart === 0 || s.strstart >= max_start) {
      /* strstart == 0 is possible when wraparound on 16-bit machine */
      s.lookahead = s.strstart - max_start;
      s.strstart = max_start;
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/


    }
    /* Flush if we may have to slide, otherwise block_start may become
     * negative and the data will be gone:
     */
    if (s.strstart - s.block_start >= (s.w_size - MIN_LOOKAHEAD)) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }

  s.insert = 0;

  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }

  if (s.strstart > s.block_start) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }

  return BS_NEED_MORE;
}

/* ===========================================================================
 * Compress as much as possible from the input stream, return the current
 * block state.
 * This function does not perform lazy evaluation of matches and inserts
 * new strings in the dictionary only for unmatched strings or for short
 * matches. It is used only for the fast compression options.
 */
function deflate_fast(s, flush) {
  var hash_head;        /* head of the hash chain */
  var bflush;           /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) {
        break; /* flush the current block */
      }
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0/*NIL*/;
    if (s.lookahead >= MIN_MATCH) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     * At this point we have always match_length < MIN_MATCH
     */
    if (hash_head !== 0/*NIL*/ && ((s.strstart - hash_head) <= (s.w_size - MIN_LOOKAHEAD))) {
      /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */
      s.match_length = longest_match(s, hash_head);
      /* longest_match() sets match_start */
    }
    if (s.match_length >= MIN_MATCH) {
      // check_match(s, s.strstart, s.match_start, s.match_length); // for debug only

      /*** _tr_tally_dist(s, s.strstart - s.match_start,
                     s.match_length - MIN_MATCH, bflush); ***/
      bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);

      s.lookahead -= s.match_length;

      /* Insert new strings in the hash table only if the match length
       * is not too large. This saves time but degrades compression.
       */
      if (s.match_length <= s.max_lazy_match/*max_insert_length*/ && s.lookahead >= MIN_MATCH) {
        s.match_length--; /* string at strstart already in table */
        do {
          s.strstart++;
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
          /* strstart never exceeds WSIZE-MAX_MATCH, so there are
           * always MIN_MATCH bytes ahead.
           */
        } while (--s.match_length !== 0);
        s.strstart++;
      } else
      {
        s.strstart += s.match_length;
        s.match_length = 0;
        s.ins_h = s.window[s.strstart];
        /* UPDATE_HASH(s, s.ins_h, s.window[s.strstart+1]); */
        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + 1]) & s.hash_mask;

//#if MIN_MATCH != 3
//                Call UPDATE_HASH() MIN_MATCH-3 more times
//#endif
        /* If lookahead < MIN_MATCH, ins_h is garbage, but it does not
         * matter since it will be recomputed at next deflate call.
         */
      }
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s.window[s.strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = ((s.strstart < (MIN_MATCH-1)) ? s.strstart : MIN_MATCH-1);
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* ===========================================================================
 * Same as above, but achieves better compression. We use a lazy
 * evaluation for matches: a match is finally adopted only if there is
 * no better match at the next window position.
 */
function deflate_slow(s, flush) {
  var hash_head;          /* head of hash chain */
  var bflush;              /* set if current block must be flushed */

  var max_insert;

  /* Process the input block. */
  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) { break; } /* flush the current block */
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0/*NIL*/;
    if (s.lookahead >= MIN_MATCH) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     */
    s.prev_length = s.match_length;
    s.prev_match = s.match_start;
    s.match_length = MIN_MATCH-1;

    if (hash_head !== 0/*NIL*/ && s.prev_length < s.max_lazy_match &&
        s.strstart - hash_head <= (s.w_size-MIN_LOOKAHEAD)/*MAX_DIST(s)*/) {
      /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */
      s.match_length = longest_match(s, hash_head);
      /* longest_match() sets match_start */

      if (s.match_length <= 5 &&
         (s.strategy === Z_FILTERED || (s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096/*TOO_FAR*/))) {

        /* If prev_match is also MIN_MATCH, match_start is garbage
         * but we will ignore the current match anyway.
         */
        s.match_length = MIN_MATCH-1;
      }
    }
    /* If there was a match at the previous step and the current
     * match is not better, output the previous match:
     */
    if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
      max_insert = s.strstart + s.lookahead - MIN_MATCH;
      /* Do not insert strings in hash table beyond this. */

      //check_match(s, s.strstart-1, s.prev_match, s.prev_length);

      /***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,
                     s.prev_length - MIN_MATCH, bflush);***/
      bflush = trees._tr_tally(s, s.strstart - 1- s.prev_match, s.prev_length - MIN_MATCH);
      /* Insert in hash table all strings up to the end of the match.
       * strstart-1 and strstart are already inserted. If there is not
       * enough lookahead, the last two strings are not inserted in
       * the hash table.
       */
      s.lookahead -= s.prev_length-1;
      s.prev_length -= 2;
      do {
        if (++s.strstart <= max_insert) {
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
        }
      } while (--s.prev_length !== 0);
      s.match_available = 0;
      s.match_length = MIN_MATCH-1;
      s.strstart++;

      if (bflush) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }

    } else if (s.match_available) {
      /* If there was no match at the previous position, output a
       * single literal. If there was a match but the current match
       * is longer, truncate the previous match to a single literal.
       */
      //Tracevv((stderr,"%c", s->window[s->strstart-1]));
      /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart-1]);

      if (bflush) {
        /*** FLUSH_BLOCK_ONLY(s, 0) ***/
        flush_block_only(s, false);
        /***/
      }
      s.strstart++;
      s.lookahead--;
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    } else {
      /* There is no previous match to compare with, wait for
       * the next step to decide.
       */
      s.match_available = 1;
      s.strstart++;
      s.lookahead--;
    }
  }
  //Assert (flush != Z_NO_FLUSH, "no flush?");
  if (s.match_available) {
    //Tracevv((stderr,"%c", s->window[s->strstart-1]));
    /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
    bflush = trees._tr_tally(s, 0, s.window[s.strstart-1]);

    s.match_available = 0;
  }
  s.insert = s.strstart < MIN_MATCH-1 ? s.strstart : MIN_MATCH-1;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }

  return BS_BLOCK_DONE;
}


/* ===========================================================================
 * For Z_RLE, simply look for runs of bytes, generate matches only of distance
 * one.  Do not maintain a hash table.  (It will be regenerated if this run of
 * deflate switches away from Z_RLE.)
 */
function deflate_rle(s, flush) {
  var bflush;            /* set if current block must be flushed */
  var prev;              /* byte at distance one to match */
  var scan, strend;      /* scan goes up to strend for length of run */

  var _win = s.window;

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the longest run, plus one for the unrolled loop.
     */
    if (s.lookahead <= MAX_MATCH) {
      fill_window(s);
      if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) { break; } /* flush the current block */
    }

    /* See how many times the previous byte repeats */
    s.match_length = 0;
    if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
      scan = s.strstart - 1;
      prev = _win[scan];
      if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
        strend = s.strstart + MAX_MATCH;
        do {
          /*jshint noempty:false*/
        } while (prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 scan < strend);
        s.match_length = MAX_MATCH - (strend - scan);
        if (s.match_length > s.lookahead) {
          s.match_length = s.lookahead;
        }
      }
      //Assert(scan <= s->window+(uInt)(s->window_size-1), "wild scan");
    }

    /* Emit match if have run of MIN_MATCH or longer, else emit literal */
    if (s.match_length >= MIN_MATCH) {
      //check_match(s, s.strstart, s.strstart - 1, s.match_length);

      /*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/
      bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);

      s.lookahead -= s.match_length;
      s.strstart += s.match_length;
      s.match_length = 0;
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s->window[s->strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* ===========================================================================
 * For Z_HUFFMAN_ONLY, do not look for matches.  Do not maintain a hash table.
 * (It will be regenerated if this run of deflate switches away from Huffman.)
 */
function deflate_huff(s, flush) {
  var bflush;             /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we have a literal to write. */
    if (s.lookahead === 0) {
      fill_window(s);
      if (s.lookahead === 0) {
        if (flush === Z_NO_FLUSH) {
          return BS_NEED_MORE;
        }
        break;      /* flush the current block */
      }
    }

    /* Output a literal byte */
    s.match_length = 0;
    //Tracevv((stderr,"%c", s->window[s->strstart]));
    /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
    bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
    s.lookahead--;
    s.strstart++;
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* Values for max_lazy_match, good_match and max_chain_length, depending on
 * the desired pack level (0..9). The values given below have been tuned to
 * exclude worst case performance for pathological files. Better values may be
 * found for specific files.
 */
var Config = function (good_length, max_lazy, nice_length, max_chain, func) {
  this.good_length = good_length;
  this.max_lazy = max_lazy;
  this.nice_length = nice_length;
  this.max_chain = max_chain;
  this.func = func;
};

var configuration_table;

configuration_table = [
  /*      good lazy nice chain */
  new Config(0, 0, 0, 0, deflate_stored),          /* 0 store only */
  new Config(4, 4, 8, 4, deflate_fast),            /* 1 max speed, no lazy matches */
  new Config(4, 5, 16, 8, deflate_fast),           /* 2 */
  new Config(4, 6, 32, 32, deflate_fast),          /* 3 */

  new Config(4, 4, 16, 16, deflate_slow),          /* 4 lazy matches */
  new Config(8, 16, 32, 32, deflate_slow),         /* 5 */
  new Config(8, 16, 128, 128, deflate_slow),       /* 6 */
  new Config(8, 32, 128, 256, deflate_slow),       /* 7 */
  new Config(32, 128, 258, 1024, deflate_slow),    /* 8 */
  new Config(32, 258, 258, 4096, deflate_slow)     /* 9 max compression */
];


/* ===========================================================================
 * Initialize the "longest match" routines for a new zlib stream
 */
function lm_init(s) {
  s.window_size = 2 * s.w_size;

  /*** CLEAR_HASH(s); ***/
  zero(s.head); // Fill with NIL (= 0);

  /* Set the default configuration parameters:
   */
  s.max_lazy_match = configuration_table[s.level].max_lazy;
  s.good_match = configuration_table[s.level].good_length;
  s.nice_match = configuration_table[s.level].nice_length;
  s.max_chain_length = configuration_table[s.level].max_chain;

  s.strstart = 0;
  s.block_start = 0;
  s.lookahead = 0;
  s.insert = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  s.ins_h = 0;
}


function DeflateState() {
  this.strm = null;            /* pointer back to this zlib stream */
  this.status = 0;            /* as the name implies */
  this.pending_buf = null;      /* output still pending */
  this.pending_buf_size = 0;  /* size of pending_buf */
  this.pending_out = 0;       /* next pending byte to output to the stream */
  this.pending = 0;           /* nb of bytes in the pending buffer */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
  this.gzhead = null;         /* gzip header information to write */
  this.gzindex = 0;           /* where in extra, name, or comment */
  this.method = Z_DEFLATED; /* can only be DEFLATED */
  this.last_flush = -1;   /* value of flush param for previous deflate call */

  this.w_size = 0;  /* LZ77 window size (32K by default) */
  this.w_bits = 0;  /* log2(w_size)  (8..16) */
  this.w_mask = 0;  /* w_size - 1 */

  this.window = null;
  /* Sliding window. Input bytes are read into the second half of the window,
   * and move to the first half later to keep a dictionary of at least wSize
   * bytes. With this organization, matches are limited to a distance of
   * wSize-MAX_MATCH bytes, but this ensures that IO is always
   * performed with a length multiple of the block size.
   */

  this.window_size = 0;
  /* Actual size of window: 2*wSize, except when the user input buffer
   * is directly used as sliding window.
   */

  this.prev = null;
  /* Link to older string with same hash index. To limit the size of this
   * array to 64K, this link is maintained only for the last 32K strings.
   * An index in this array is thus a window index modulo 32K.
   */

  this.head = null;   /* Heads of the hash chains or NIL. */

  this.ins_h = 0;       /* hash index of string to be inserted */
  this.hash_size = 0;   /* number of elements in hash table */
  this.hash_bits = 0;   /* log2(hash_size) */
  this.hash_mask = 0;   /* hash_size-1 */

  this.hash_shift = 0;
  /* Number of bits by which ins_h must be shifted at each input
   * step. It must be such that after MIN_MATCH steps, the oldest
   * byte no longer takes part in the hash key, that is:
   *   hash_shift * MIN_MATCH >= hash_bits
   */

  this.block_start = 0;
  /* Window position at the beginning of the current output block. Gets
   * negative when the window is moved backwards.
   */

  this.match_length = 0;      /* length of best match */
  this.prev_match = 0;        /* previous match */
  this.match_available = 0;   /* set if previous match exists */
  this.strstart = 0;          /* start of string to insert */
  this.match_start = 0;       /* start of matching string */
  this.lookahead = 0;         /* number of valid bytes ahead in window */

  this.prev_length = 0;
  /* Length of the best match at previous step. Matches not greater than this
   * are discarded. This is used in the lazy match evaluation.
   */

  this.max_chain_length = 0;
  /* To speed up deflation, hash chains are never searched beyond this
   * length.  A higher limit improves compression ratio but degrades the
   * speed.
   */

  this.max_lazy_match = 0;
  /* Attempt to find a better match only when the current match is strictly
   * smaller than this value. This mechanism is used only for compression
   * levels >= 4.
   */
  // That's alias to max_lazy_match, don't use directly
  //this.max_insert_length = 0;
  /* Insert new strings in the hash table only if the match length is not
   * greater than this length. This saves time but degrades compression.
   * max_insert_length is used only for compression levels <= 3.
   */

  this.level = 0;     /* compression level (1..9) */
  this.strategy = 0;  /* favor or force Huffman coding*/

  this.good_match = 0;
  /* Use a faster search when the previous match is longer than this */

  this.nice_match = 0; /* Stop searching when current match exceeds this */

              /* used by trees.c: */

  /* Didn't use ct_data typedef below to suppress compiler warning */

  // struct ct_data_s dyn_ltree[HEAP_SIZE];   /* literal and length tree */
  // struct ct_data_s dyn_dtree[2*D_CODES+1]; /* distance tree */
  // struct ct_data_s bl_tree[2*BL_CODES+1];  /* Huffman tree for bit lengths */

  // Use flat array of DOUBLE size, with interleaved fata,
  // because JS does not support effective
  this.dyn_ltree  = new utils.Buf16(HEAP_SIZE * 2);
  this.dyn_dtree  = new utils.Buf16((2*D_CODES+1) * 2);
  this.bl_tree    = new utils.Buf16((2*BL_CODES+1) * 2);
  zero(this.dyn_ltree);
  zero(this.dyn_dtree);
  zero(this.bl_tree);

  this.l_desc   = null;         /* desc. for literal tree */
  this.d_desc   = null;         /* desc. for distance tree */
  this.bl_desc  = null;         /* desc. for bit length tree */

  //ush bl_count[MAX_BITS+1];
  this.bl_count = new utils.Buf16(MAX_BITS+1);
  /* number of codes at each bit length for an optimal tree */

  //int heap[2*L_CODES+1];      /* heap used to build the Huffman trees */
  this.heap = new utils.Buf16(2*L_CODES+1);  /* heap used to build the Huffman trees */
  zero(this.heap);

  this.heap_len = 0;               /* number of elements in the heap */
  this.heap_max = 0;               /* element of largest frequency */
  /* The sons of heap[n] are heap[2*n] and heap[2*n+1]. heap[0] is not used.
   * The same heap array is used to build all trees.
   */

  this.depth = new utils.Buf16(2*L_CODES+1); //uch depth[2*L_CODES+1];
  zero(this.depth);
  /* Depth of each subtree used as tie breaker for trees of equal frequency
   */

  this.l_buf = 0;          /* buffer index for literals or lengths */

  this.lit_bufsize = 0;
  /* Size of match buffer for literals/lengths.  There are 4 reasons for
   * limiting lit_bufsize to 64K:
   *   - frequencies can be kept in 16 bit counters
   *   - if compression is not successful for the first block, all input
   *     data is still in the window so we can still emit a stored block even
   *     when input comes from standard input.  (This can also be done for
   *     all blocks if lit_bufsize is not greater than 32K.)
   *   - if compression is not successful for a file smaller than 64K, we can
   *     even emit a stored file instead of a stored block (saving 5 bytes).
   *     This is applicable only for zip (not gzip or zlib).
   *   - creating new Huffman trees less frequently may not provide fast
   *     adaptation to changes in the input data statistics. (Take for
   *     example a binary file with poorly compressible code followed by
   *     a highly compressible string table.) Smaller buffer sizes give
   *     fast adaptation but have of course the overhead of transmitting
   *     trees more frequently.
   *   - I can't count above 4
   */

  this.last_lit = 0;      /* running index in l_buf */

  this.d_buf = 0;
  /* Buffer index for distances. To simplify the code, d_buf and l_buf have
   * the same number of elements. To use different lengths, an extra flag
   * array would be necessary.
   */

  this.opt_len = 0;       /* bit length of current block with optimal trees */
  this.static_len = 0;    /* bit length of current block with static trees */
  this.matches = 0;       /* number of string matches in current block */
  this.insert = 0;        /* bytes at end of window left to insert */


  this.bi_buf = 0;
  /* Output buffer. bits are inserted starting at the bottom (least
   * significant bits).
   */
  this.bi_valid = 0;
  /* Number of valid bits in bi_buf.  All bits above the last valid bit
   * are always zero.
   */

  // Used for window memory init. We safely ignore it for JS. That makes
  // sense only for pointers and memory check tools.
  //this.high_water = 0;
  /* High water mark offset in window for initialized bytes -- bytes above
   * this are set to zero in order to avoid memory check warnings when
   * longest match routines access bytes past the input.  This is then
   * updated to the new high water mark.
   */
}


function deflateResetKeep(strm) {
  var s;

  if (!strm || !strm.state) {
    return err(strm, Z_STREAM_ERROR);
  }

  strm.total_in = strm.total_out = 0;
  strm.data_type = Z_UNKNOWN;

  s = strm.state;
  s.pending = 0;
  s.pending_out = 0;

  if (s.wrap < 0) {
    s.wrap = -s.wrap;
    /* was made negative by deflate(..., Z_FINISH); */
  }
  s.status = (s.wrap ? INIT_STATE : BUSY_STATE);
  strm.adler = (s.wrap === 2) ?
    0  // crc32(0, Z_NULL, 0)
  :
    1; // adler32(0, Z_NULL, 0)
  s.last_flush = Z_NO_FLUSH;
  trees._tr_init(s);
  return Z_OK;
}


function deflateReset(strm) {
  var ret = deflateResetKeep(strm);
  if (ret === Z_OK) {
    lm_init(strm.state);
  }
  return ret;
}


function deflateSetHeader(strm, head) {
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  if (strm.state.wrap !== 2) { return Z_STREAM_ERROR; }
  strm.state.gzhead = head;
  return Z_OK;
}


function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
  if (!strm) { // === Z_NULL
    return Z_STREAM_ERROR;
  }
  var wrap = 1;

  if (level === Z_DEFAULT_COMPRESSION) {
    level = 6;
  }

  if (windowBits < 0) { /* suppress zlib wrapper */
    wrap = 0;
    windowBits = -windowBits;
  }

  else if (windowBits > 15) {
    wrap = 2;           /* write gzip wrapper instead */
    windowBits -= 16;
  }


  if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED ||
    windowBits < 8 || windowBits > 15 || level < 0 || level > 9 ||
    strategy < 0 || strategy > Z_FIXED) {
    return err(strm, Z_STREAM_ERROR);
  }


  if (windowBits === 8) {
    windowBits = 9;
  }
  /* until 256-byte window bug fixed */

  var s = new DeflateState();

  strm.state = s;
  s.strm = strm;

  s.wrap = wrap;
  s.gzhead = null;
  s.w_bits = windowBits;
  s.w_size = 1 << s.w_bits;
  s.w_mask = s.w_size - 1;

  s.hash_bits = memLevel + 7;
  s.hash_size = 1 << s.hash_bits;
  s.hash_mask = s.hash_size - 1;
  s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);

  s.window = new utils.Buf8(s.w_size * 2);
  s.head = new utils.Buf16(s.hash_size);
  s.prev = new utils.Buf16(s.w_size);

  // Don't need mem init magic for JS.
  //s.high_water = 0;  /* nothing written to s->window yet */

  s.lit_bufsize = 1 << (memLevel + 6); /* 16K elements by default */

  s.pending_buf_size = s.lit_bufsize * 4;
  s.pending_buf = new utils.Buf8(s.pending_buf_size);

  s.d_buf = s.lit_bufsize >> 1;
  s.l_buf = (1 + 2) * s.lit_bufsize;

  s.level = level;
  s.strategy = strategy;
  s.method = method;

  return deflateReset(strm);
}

function deflateInit(strm, level) {
  return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
}


function deflate(strm, flush) {
  var old_flush, s;
  var beg, val; // for gzip header write only

  if (!strm || !strm.state ||
    flush > Z_BLOCK || flush < 0) {
    return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
  }

  s = strm.state;

  if (!strm.output ||
      (!strm.input && strm.avail_in !== 0) ||
      (s.status === FINISH_STATE && flush !== Z_FINISH)) {
    return err(strm, (strm.avail_out === 0) ? Z_BUF_ERROR : Z_STREAM_ERROR);
  }

  s.strm = strm; /* just in case */
  old_flush = s.last_flush;
  s.last_flush = flush;

  /* Write the header */
  if (s.status === INIT_STATE) {

    if (s.wrap === 2) { // GZIP header
      strm.adler = 0;  //crc32(0L, Z_NULL, 0);
      put_byte(s, 31);
      put_byte(s, 139);
      put_byte(s, 8);
      if (!s.gzhead) { // s->gzhead == Z_NULL
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, s.level === 9 ? 2 :
                    (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                     4 : 0));
        put_byte(s, OS_CODE);
        s.status = BUSY_STATE;
      }
      else {
        put_byte(s, (s.gzhead.text ? 1 : 0) +
                    (s.gzhead.hcrc ? 2 : 0) +
                    (!s.gzhead.extra ? 0 : 4) +
                    (!s.gzhead.name ? 0 : 8) +
                    (!s.gzhead.comment ? 0 : 16)
                );
        put_byte(s, s.gzhead.time & 0xff);
        put_byte(s, (s.gzhead.time >> 8) & 0xff);
        put_byte(s, (s.gzhead.time >> 16) & 0xff);
        put_byte(s, (s.gzhead.time >> 24) & 0xff);
        put_byte(s, s.level === 9 ? 2 :
                    (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                     4 : 0));
        put_byte(s, s.gzhead.os & 0xff);
        if (s.gzhead.extra && s.gzhead.extra.length) {
          put_byte(s, s.gzhead.extra.length & 0xff);
          put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);
        }
        if (s.gzhead.hcrc) {
          strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
        }
        s.gzindex = 0;
        s.status = EXTRA_STATE;
      }
    }
    else // DEFLATE header
    {
      var header = (Z_DEFLATED + ((s.w_bits - 8) << 4)) << 8;
      var level_flags = -1;

      if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
        level_flags = 0;
      } else if (s.level < 6) {
        level_flags = 1;
      } else if (s.level === 6) {
        level_flags = 2;
      } else {
        level_flags = 3;
      }
      header |= (level_flags << 6);
      if (s.strstart !== 0) { header |= PRESET_DICT; }
      header += 31 - (header % 31);

      s.status = BUSY_STATE;
      putShortMSB(s, header);

      /* Save the adler32 of the preset dictionary: */
      if (s.strstart !== 0) {
        putShortMSB(s, strm.adler >>> 16);
        putShortMSB(s, strm.adler & 0xffff);
      }
      strm.adler = 1; // adler32(0L, Z_NULL, 0);
    }
  }

//#ifdef GZIP
  if (s.status === EXTRA_STATE) {
    if (s.gzhead.extra/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */

      while (s.gzindex < (s.gzhead.extra.length & 0xffff)) {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            break;
          }
        }
        put_byte(s, s.gzhead.extra[s.gzindex] & 0xff);
        s.gzindex++;
      }
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (s.gzindex === s.gzhead.extra.length) {
        s.gzindex = 0;
        s.status = NAME_STATE;
      }
    }
    else {
      s.status = NAME_STATE;
    }
  }
  if (s.status === NAME_STATE) {
    if (s.gzhead.name/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */
      //int val;

      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            val = 1;
            break;
          }
        }
        // JS specific: little magic to add zero terminator to end of string
        if (s.gzindex < s.gzhead.name.length) {
          val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);

      if (s.gzhead.hcrc && s.pending > beg){
        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (val === 0) {
        s.gzindex = 0;
        s.status = COMMENT_STATE;
      }
    }
    else {
      s.status = COMMENT_STATE;
    }
  }
  if (s.status === COMMENT_STATE) {
    if (s.gzhead.comment/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */
      //int val;

      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            val = 1;
            break;
          }
        }
        // JS specific: little magic to add zero terminator to end of string
        if (s.gzindex < s.gzhead.comment.length) {
          val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);

      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (val === 0) {
        s.status = HCRC_STATE;
      }
    }
    else {
      s.status = HCRC_STATE;
    }
  }
  if (s.status === HCRC_STATE) {
    if (s.gzhead.hcrc) {
      if (s.pending + 2 > s.pending_buf_size) {
        flush_pending(strm);
      }
      if (s.pending + 2 <= s.pending_buf_size) {
        put_byte(s, strm.adler & 0xff);
        put_byte(s, (strm.adler >> 8) & 0xff);
        strm.adler = 0; //crc32(0L, Z_NULL, 0);
        s.status = BUSY_STATE;
      }
    }
    else {
      s.status = BUSY_STATE;
    }
  }
//#endif

  /* Flush as much pending output as possible */
  if (s.pending !== 0) {
    flush_pending(strm);
    if (strm.avail_out === 0) {
      /* Since avail_out is 0, deflate will be called again with
       * more output space, but possibly with both pending and
       * avail_in equal to zero. There won't be anything to do,
       * but this is not an error situation so make sure we
       * return OK instead of BUF_ERROR at next call of deflate:
       */
      s.last_flush = -1;
      return Z_OK;
    }

    /* Make sure there is something to do and avoid duplicate consecutive
     * flushes. For repeated and useless calls with Z_FINISH, we keep
     * returning Z_STREAM_END instead of Z_BUF_ERROR.
     */
  } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) &&
    flush !== Z_FINISH) {
    return err(strm, Z_BUF_ERROR);
  }

  /* User must not provide more input after the first FINISH: */
  if (s.status === FINISH_STATE && strm.avail_in !== 0) {
    return err(strm, Z_BUF_ERROR);
  }

  /* Start a new block or continue the current one.
   */
  if (strm.avail_in !== 0 || s.lookahead !== 0 ||
    (flush !== Z_NO_FLUSH && s.status !== FINISH_STATE)) {
    var bstate = (s.strategy === Z_HUFFMAN_ONLY) ? deflate_huff(s, flush) :
      (s.strategy === Z_RLE ? deflate_rle(s, flush) :
        configuration_table[s.level].func(s, flush));

    if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
      s.status = FINISH_STATE;
    }
    if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
      if (strm.avail_out === 0) {
        s.last_flush = -1;
        /* avoid BUF_ERROR next call, see above */
      }
      return Z_OK;
      /* If flush != Z_NO_FLUSH && avail_out == 0, the next call
       * of deflate should use the same flush parameter to make sure
       * that the flush is complete. So we don't have to output an
       * empty block here, this will be done at next call. This also
       * ensures that for a very small output buffer, we emit at most
       * one empty block.
       */
    }
    if (bstate === BS_BLOCK_DONE) {
      if (flush === Z_PARTIAL_FLUSH) {
        trees._tr_align(s);
      }
      else if (flush !== Z_BLOCK) { /* FULL_FLUSH or SYNC_FLUSH */

        trees._tr_stored_block(s, 0, 0, false);
        /* For a full flush, this empty block will be recognized
         * as a special marker by inflate_sync().
         */
        if (flush === Z_FULL_FLUSH) {
          /*** CLEAR_HASH(s); ***/             /* forget history */
          zero(s.head); // Fill with NIL (= 0);

          if (s.lookahead === 0) {
            s.strstart = 0;
            s.block_start = 0;
            s.insert = 0;
          }
        }
      }
      flush_pending(strm);
      if (strm.avail_out === 0) {
        s.last_flush = -1; /* avoid BUF_ERROR at next call, see above */
        return Z_OK;
      }
    }
  }
  //Assert(strm->avail_out > 0, "bug2");
  //if (strm.avail_out <= 0) { throw new Error("bug2");}

  if (flush !== Z_FINISH) { return Z_OK; }
  if (s.wrap <= 0) { return Z_STREAM_END; }

  /* Write the trailer */
  if (s.wrap === 2) {
    put_byte(s, strm.adler & 0xff);
    put_byte(s, (strm.adler >> 8) & 0xff);
    put_byte(s, (strm.adler >> 16) & 0xff);
    put_byte(s, (strm.adler >> 24) & 0xff);
    put_byte(s, strm.total_in & 0xff);
    put_byte(s, (strm.total_in >> 8) & 0xff);
    put_byte(s, (strm.total_in >> 16) & 0xff);
    put_byte(s, (strm.total_in >> 24) & 0xff);
  }
  else
  {
    putShortMSB(s, strm.adler >>> 16);
    putShortMSB(s, strm.adler & 0xffff);
  }

  flush_pending(strm);
  /* If avail_out is zero, the application will call deflate again
   * to flush the rest.
   */
  if (s.wrap > 0) { s.wrap = -s.wrap; }
  /* write the trailer only once! */
  return s.pending !== 0 ? Z_OK : Z_STREAM_END;
}

function deflateEnd(strm) {
  var status;

  if (!strm/*== Z_NULL*/ || !strm.state/*== Z_NULL*/) {
    return Z_STREAM_ERROR;
  }

  status = strm.state.status;
  if (status !== INIT_STATE &&
    status !== EXTRA_STATE &&
    status !== NAME_STATE &&
    status !== COMMENT_STATE &&
    status !== HCRC_STATE &&
    status !== BUSY_STATE &&
    status !== FINISH_STATE
  ) {
    return err(strm, Z_STREAM_ERROR);
  }

  strm.state = null;

  return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
}

/* =========================================================================
 * Copy the source state to the destination state
 */
//function deflateCopy(dest, source) {
//
//}

exports.deflateInit = deflateInit;
exports.deflateInit2 = deflateInit2;
exports.deflateReset = deflateReset;
exports.deflateResetKeep = deflateResetKeep;
exports.deflateSetHeader = deflateSetHeader;
exports.deflate = deflate;
exports.deflateEnd = deflateEnd;
exports.deflateInfo = 'pako deflate (from Nodeca project)';

/* Not implemented
exports.deflateBound = deflateBound;
exports.deflateCopy = deflateCopy;
exports.deflateSetDictionary = deflateSetDictionary;
exports.deflateParams = deflateParams;
exports.deflatePending = deflatePending;
exports.deflatePrime = deflatePrime;
exports.deflateTune = deflateTune;
*/
},{"../utils/common":27,"./adler32":29,"./crc32":31,"./messages":37,"./trees":38}],33:[function(_dereq_,module,exports){
'use strict';


function GZheader() {
  /* true if compressed data believed to be text */
  this.text       = 0;
  /* modification time */
  this.time       = 0;
  /* extra flags (not used when writing a gzip file) */
  this.xflags     = 0;
  /* operating system */
  this.os         = 0;
  /* pointer to extra field or Z_NULL if none */
  this.extra      = null;
  /* extra field length (valid if extra != Z_NULL) */
  this.extra_len  = 0; // Actually, we don't need it in JS,
                       // but leave for few code modifications

  //
  // Setup limits is not necessary because in js we should not preallocate memory
  // for inflate use constant limit in 65536 bytes
  //

  /* space at extra (only when reading header) */
  // this.extra_max  = 0;
  /* pointer to zero-terminated file name or Z_NULL */
  this.name       = '';
  /* space at name (only when reading header) */
  // this.name_max   = 0;
  /* pointer to zero-terminated comment or Z_NULL */
  this.comment    = '';
  /* space at comment (only when reading header) */
  // this.comm_max   = 0;
  /* true if there was or will be a header crc */
  this.hcrc       = 0;
  /* true when done reading gzip header (not used when writing a gzip file) */
  this.done       = false;
}

module.exports = GZheader;
},{}],34:[function(_dereq_,module,exports){
'use strict';

// See state defs from inflate.js
var BAD = 30;       /* got a data error -- remain here until reset */
var TYPE = 12;      /* i: waiting for type bits, including last-flag bit */

/*
   Decode literal, length, and distance codes and write out the resulting
   literal and match bytes until either not enough input or output is
   available, an end-of-block is encountered, or a data error is encountered.
   When large enough input and output buffers are supplied to inflate(), for
   example, a 16K input buffer and a 64K output buffer, more than 95% of the
   inflate execution time is spent in this routine.

   Entry assumptions:

        state.mode === LEN
        strm.avail_in >= 6
        strm.avail_out >= 258
        start >= strm.avail_out
        state.bits < 8

   On return, state.mode is one of:

        LEN -- ran out of enough output space or enough available input
        TYPE -- reached end of block code, inflate() to interpret next block
        BAD -- error in block data

   Notes:

    - The maximum input bits used by a length/distance pair is 15 bits for the
      length code, 5 bits for the length extra, 15 bits for the distance code,
      and 13 bits for the distance extra.  This totals 48 bits, or six bytes.
      Therefore if strm.avail_in >= 6, then there is enough input to avoid
      checking for available input while decoding.

    - The maximum bytes that a single length/distance pair can output is 258
      bytes, which is the maximum length that can be coded.  inflate_fast()
      requires strm.avail_out >= 258 for each loop to avoid checking for
      output space.
 */
module.exports = function inflate_fast(strm, start) {
  var state;
  var _in;                    /* local strm.input */
  var last;                   /* have enough input while in < last */
  var _out;                   /* local strm.output */
  var beg;                    /* inflate()'s initial strm.output */
  var end;                    /* while out < end, enough space available */
//#ifdef INFLATE_STRICT
  var dmax;                   /* maximum distance from zlib header */
//#endif
  var wsize;                  /* window size or zero if not using window */
  var whave;                  /* valid bytes in the window */
  var wnext;                  /* window write index */
  var window;                 /* allocated sliding window, if wsize != 0 */
  var hold;                   /* local strm.hold */
  var bits;                   /* local strm.bits */
  var lcode;                  /* local strm.lencode */
  var dcode;                  /* local strm.distcode */
  var lmask;                  /* mask for first level of length codes */
  var dmask;                  /* mask for first level of distance codes */
  var here;                   /* retrieved table entry */
  var op;                     /* code bits, operation, extra bits, or */
                              /*  window position, window bytes to copy */
  var len;                    /* match length, unused bytes */
  var dist;                   /* match distance */
  var from;                   /* where to copy match from */
  var from_source;


  var input, output; // JS specific, because we have no pointers

  /* copy state to local variables */
  state = strm.state;
  //here = state.here;
  _in = strm.next_in;
  input = strm.input;
  last = _in + (strm.avail_in - 5);
  _out = strm.next_out;
  output = strm.output;
  beg = _out - (start - strm.avail_out);
  end = _out + (strm.avail_out - 257);
//#ifdef INFLATE_STRICT
  dmax = state.dmax;
//#endif
  wsize = state.wsize;
  whave = state.whave;
  wnext = state.wnext;
  window = state.window;
  hold = state.hold;
  bits = state.bits;
  lcode = state.lencode;
  dcode = state.distcode;
  lmask = (1 << state.lenbits) - 1;
  dmask = (1 << state.distbits) - 1;


  /* decode literals and length/distances until end-of-block or not enough
     input data or output space */

  top:
  do {
    if (bits < 15) {
      hold += input[_in++] << bits;
      bits += 8;
      hold += input[_in++] << bits;
      bits += 8;
    }

    here = lcode[hold & lmask];

    dolen:
    for (;;) { // Goto emulation
      op = here >>> 24/*here.bits*/;
      hold >>>= op;
      bits -= op;
      op = (here >>> 16) & 0xff/*here.op*/;
      if (op === 0) {                          /* literal */
        //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
        //        "inflate:         literal '%c'\n" :
        //        "inflate:         literal 0x%02x\n", here.val));
        output[_out++] = here & 0xffff/*here.val*/;
      }
      else if (op & 16) {                     /* length base */
        len = here & 0xffff/*here.val*/;
        op &= 15;                           /* number of extra bits */
        if (op) {
          if (bits < op) {
            hold += input[_in++] << bits;
            bits += 8;
          }
          len += hold & ((1 << op) - 1);
          hold >>>= op;
          bits -= op;
        }
        //Tracevv((stderr, "inflate:         length %u\n", len));
        if (bits < 15) {
          hold += input[_in++] << bits;
          bits += 8;
          hold += input[_in++] << bits;
          bits += 8;
        }
        here = dcode[hold & dmask];

        dodist:
        for (;;) { // goto emulation
          op = here >>> 24/*here.bits*/;
          hold >>>= op;
          bits -= op;
          op = (here >>> 16) & 0xff/*here.op*/;

          if (op & 16) {                      /* distance base */
            dist = here & 0xffff/*here.val*/;
            op &= 15;                       /* number of extra bits */
            if (bits < op) {
              hold += input[_in++] << bits;
              bits += 8;
              if (bits < op) {
                hold += input[_in++] << bits;
                bits += 8;
              }
            }
            dist += hold & ((1 << op) - 1);
//#ifdef INFLATE_STRICT
            if (dist > dmax) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD;
              break top;
            }
//#endif
            hold >>>= op;
            bits -= op;
            //Tracevv((stderr, "inflate:         distance %u\n", dist));
            op = _out - beg;                /* max distance in output */
            if (dist > op) {                /* see if copy from window */
              op = dist - op;               /* distance back in window */
              if (op > whave) {
                if (state.sane) {
                  strm.msg = 'invalid distance too far back';
                  state.mode = BAD;
                  break top;
                }

// (!) This block is disabled in zlib defailts,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//                if (len <= op - whave) {
//                  do {
//                    output[_out++] = 0;
//                  } while (--len);
//                  continue top;
//                }
//                len -= op - whave;
//                do {
//                  output[_out++] = 0;
//                } while (--op > whave);
//                if (op === 0) {
//                  from = _out - dist;
//                  do {
//                    output[_out++] = output[from++];
//                  } while (--len);
//                  continue top;
//                }
//#endif
              }
              from = 0; // window index
              from_source = window;
              if (wnext === 0) {           /* very common case */
                from += wsize - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              else if (wnext < op) {      /* wrap around window */
                from += wsize + wnext - op;
                op -= wnext;
                if (op < len) {         /* some from end of window */
                  len -= op;
                  do {
                    output[_out++] = window[from++];
                  } while (--op);
                  from = 0;
                  if (wnext < len) {  /* some from start of window */
                    op = wnext;
                    len -= op;
                    do {
                      output[_out++] = window[from++];
                    } while (--op);
                    from = _out - dist;      /* rest from output */
                    from_source = output;
                  }
                }
              }
              else {                      /* contiguous in window */
                from += wnext - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              while (len > 2) {
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                len -= 3;
              }
              if (len) {
                output[_out++] = from_source[from++];
                if (len > 1) {
                  output[_out++] = from_source[from++];
                }
              }
            }
            else {
              from = _out - dist;          /* copy direct from output */
              do {                        /* minimum length is three */
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                len -= 3;
              } while (len > 2);
              if (len) {
                output[_out++] = output[from++];
                if (len > 1) {
                  output[_out++] = output[from++];
                }
              }
            }
          }
          else if ((op & 64) === 0) {          /* 2nd level distance code */
            here = dcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
            continue dodist;
          }
          else {
            strm.msg = 'invalid distance code';
            state.mode = BAD;
            break top;
          }

          break; // need to emulate goto via "continue"
        }
      }
      else if ((op & 64) === 0) {              /* 2nd level length code */
        here = lcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
        continue dolen;
      }
      else if (op & 32) {                     /* end-of-block */
        //Tracevv((stderr, "inflate:         end of block\n"));
        state.mode = TYPE;
        break top;
      }
      else {
        strm.msg = 'invalid literal/length code';
        state.mode = BAD;
        break top;
      }

      break; // need to emulate goto via "continue"
    }
  } while (_in < last && _out < end);

  /* return unused bytes (on entry, bits < 8, so in won't go too far back) */
  len = bits >> 3;
  _in -= len;
  bits -= len << 3;
  hold &= (1 << bits) - 1;

  /* update state and return */
  strm.next_in = _in;
  strm.next_out = _out;
  strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));
  strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));
  state.hold = hold;
  state.bits = bits;
  return;
};

},{}],35:[function(_dereq_,module,exports){
'use strict';


var utils = _dereq_('../utils/common');
var adler32 = _dereq_('./adler32');
var crc32   = _dereq_('./crc32');
var inflate_fast = _dereq_('./inffast');
var inflate_table = _dereq_('./inftrees');

var CODES = 0;
var LENS = 1;
var DISTS = 2;

/* Public constants ==========================================================*/
/* ===========================================================================*/


/* Allowed flush values; see deflate() and inflate() below for details */
//var Z_NO_FLUSH      = 0;
//var Z_PARTIAL_FLUSH = 1;
//var Z_SYNC_FLUSH    = 2;
//var Z_FULL_FLUSH    = 3;
var Z_FINISH        = 4;
var Z_BLOCK         = 5;
var Z_TREES         = 6;


/* Return codes for the compression/decompression functions. Negative values
 * are errors, positive values are used for special but normal events.
 */
var Z_OK            = 0;
var Z_STREAM_END    = 1;
var Z_NEED_DICT     = 2;
//var Z_ERRNO         = -1;
var Z_STREAM_ERROR  = -2;
var Z_DATA_ERROR    = -3;
var Z_MEM_ERROR     = -4;
var Z_BUF_ERROR     = -5;
//var Z_VERSION_ERROR = -6;

/* The deflate compression method */
var Z_DEFLATED  = 8;


/* STATES ====================================================================*/
/* ===========================================================================*/


var    HEAD = 1;       /* i: waiting for magic header */
var    FLAGS = 2;      /* i: waiting for method and flags (gzip) */
var    TIME = 3;       /* i: waiting for modification time (gzip) */
var    OS = 4;         /* i: waiting for extra flags and operating system (gzip) */
var    EXLEN = 5;      /* i: waiting for extra length (gzip) */
var    EXTRA = 6;      /* i: waiting for extra bytes (gzip) */
var    NAME = 7;       /* i: waiting for end of file name (gzip) */
var    COMMENT = 8;    /* i: waiting for end of comment (gzip) */
var    HCRC = 9;       /* i: waiting for header crc (gzip) */
var    DICTID = 10;    /* i: waiting for dictionary check value */
var    DICT = 11;      /* waiting for inflateSetDictionary() call */
var        TYPE = 12;      /* i: waiting for type bits, including last-flag bit */
var        TYPEDO = 13;    /* i: same, but skip check to exit inflate on new block */
var        STORED = 14;    /* i: waiting for stored size (length and complement) */
var        COPY_ = 15;     /* i/o: same as COPY below, but only first time in */
var        COPY = 16;      /* i/o: waiting for input or output to copy stored block */
var        TABLE = 17;     /* i: waiting for dynamic block table lengths */
var        LENLENS = 18;   /* i: waiting for code length code lengths */
var        CODELENS = 19;  /* i: waiting for length/lit and distance code lengths */
var            LEN_ = 20;      /* i: same as LEN below, but only first time in */
var            LEN = 21;       /* i: waiting for length/lit/eob code */
var            LENEXT = 22;    /* i: waiting for length extra bits */
var            DIST = 23;      /* i: waiting for distance code */
var            DISTEXT = 24;   /* i: waiting for distance extra bits */
var            MATCH = 25;     /* o: waiting for output space to copy string */
var            LIT = 26;       /* o: waiting for output space to write literal */
var    CHECK = 27;     /* i: waiting for 32-bit check value */
var    LENGTH = 28;    /* i: waiting for 32-bit length (gzip) */
var    DONE = 29;      /* finished check, done -- remain here until reset */
var    BAD = 30;       /* got a data error -- remain here until reset */
var    MEM = 31;       /* got an inflate() memory error -- remain here until reset */
var    SYNC = 32;      /* looking for synchronization bytes to restart inflate() */

/* ===========================================================================*/



var ENOUGH_LENS = 852;
var ENOUGH_DISTS = 592;
//var ENOUGH =  (ENOUGH_LENS+ENOUGH_DISTS);

var MAX_WBITS = 15;
/* 32K LZ77 window */
var DEF_WBITS = MAX_WBITS;


function ZSWAP32(q) {
  return  (((q >>> 24) & 0xff) +
          ((q >>> 8) & 0xff00) +
          ((q & 0xff00) << 8) +
          ((q & 0xff) << 24));
}


function InflateState() {
  this.mode = 0;             /* current inflate mode */
  this.last = false;          /* true if processing last block */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
  this.havedict = false;      /* true if dictionary provided */
  this.flags = 0;             /* gzip header method and flags (0 if zlib) */
  this.dmax = 0;              /* zlib header max distance (INFLATE_STRICT) */
  this.check = 0;             /* protected copy of check value */
  this.total = 0;             /* protected copy of output count */
  // TODO: may be {}
  this.head = null;           /* where to save gzip header information */

  /* sliding window */
  this.wbits = 0;             /* log base 2 of requested window size */
  this.wsize = 0;             /* window size or zero if not using window */
  this.whave = 0;             /* valid bytes in the window */
  this.wnext = 0;             /* window write index */
  this.window = null;         /* allocated sliding window, if needed */

  /* bit accumulator */
  this.hold = 0;              /* input bit accumulator */
  this.bits = 0;              /* number of bits in "in" */

  /* for string and stored block copying */
  this.length = 0;            /* literal or length of data to copy */
  this.offset = 0;            /* distance back to copy string from */

  /* for table and code decoding */
  this.extra = 0;             /* extra bits needed */

  /* fixed and dynamic code tables */
  this.lencode = null;          /* starting table for length/literal codes */
  this.distcode = null;         /* starting table for distance codes */
  this.lenbits = 0;           /* index bits for lencode */
  this.distbits = 0;          /* index bits for distcode */

  /* dynamic table building */
  this.ncode = 0;             /* number of code length code lengths */
  this.nlen = 0;              /* number of length code lengths */
  this.ndist = 0;             /* number of distance code lengths */
  this.have = 0;              /* number of code lengths in lens[] */
  this.next = null;              /* next available space in codes[] */

  this.lens = new utils.Buf16(320); /* temporary storage for code lengths */
  this.work = new utils.Buf16(288); /* work area for code table building */

  /*
   because we don't have pointers in js, we use lencode and distcode directly
   as buffers so we don't need codes
  */
  //this.codes = new utils.Buf32(ENOUGH);       /* space for code tables */
  this.lendyn = null;              /* dynamic table for length/literal codes (JS specific) */
  this.distdyn = null;             /* dynamic table for distance codes (JS specific) */
  this.sane = 0;                   /* if false, allow invalid distance too far */
  this.back = 0;                   /* bits back of last unprocessed length/lit */
  this.was = 0;                    /* initial length of match */
}

function inflateResetKeep(strm) {
  var state;

  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  strm.total_in = strm.total_out = state.total = 0;
  strm.msg = ''; /*Z_NULL*/
  if (state.wrap) {       /* to support ill-conceived Java test suite */
    strm.adler = state.wrap & 1;
  }
  state.mode = HEAD;
  state.last = 0;
  state.havedict = 0;
  state.dmax = 32768;
  state.head = null/*Z_NULL*/;
  state.hold = 0;
  state.bits = 0;
  //state.lencode = state.distcode = state.next = state.codes;
  state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
  state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);

  state.sane = 1;
  state.back = -1;
  //Tracev((stderr, "inflate: reset\n"));
  return Z_OK;
}

function inflateReset(strm) {
  var state;

  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  state.wsize = 0;
  state.whave = 0;
  state.wnext = 0;
  return inflateResetKeep(strm);

}

function inflateReset2(strm, windowBits) {
  var wrap;
  var state;

  /* get the state */
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;

  /* extract wrap request from windowBits parameter */
  if (windowBits < 0) {
    wrap = 0;
    windowBits = -windowBits;
  }
  else {
    wrap = (windowBits >> 4) + 1;
    if (windowBits < 48) {
      windowBits &= 15;
    }
  }

  /* set number of window bits, free window if different */
  if (windowBits && (windowBits < 8 || windowBits > 15)) {
    return Z_STREAM_ERROR;
  }
  if (state.window !== null && state.wbits !== windowBits) {
    state.window = null;
  }

  /* update state and reset the rest of it */
  state.wrap = wrap;
  state.wbits = windowBits;
  return inflateReset(strm);
}

function inflateInit2(strm, windowBits) {
  var ret;
  var state;

  if (!strm) { return Z_STREAM_ERROR; }
  //strm.msg = Z_NULL;                 /* in case we return an error */

  state = new InflateState();

  //if (state === Z_NULL) return Z_MEM_ERROR;
  //Tracev((stderr, "inflate: allocated\n"));
  strm.state = state;
  state.window = null/*Z_NULL*/;
  ret = inflateReset2(strm, windowBits);
  if (ret !== Z_OK) {
    strm.state = null/*Z_NULL*/;
  }
  return ret;
}

function inflateInit(strm) {
  return inflateInit2(strm, DEF_WBITS);
}


/*
 Return state with length and distance decoding tables and index sizes set to
 fixed code decoding.  Normally this returns fixed tables from inffixed.h.
 If BUILDFIXED is defined, then instead this routine builds the tables the
 first time it's called, and returns those tables the first time and
 thereafter.  This reduces the size of the code by about 2K bytes, in
 exchange for a little execution time.  However, BUILDFIXED should not be
 used for threaded applications, since the rewriting of the tables and virgin
 may not be thread-safe.
 */
var virgin = true;

var lenfix, distfix; // We have no pointers in JS, so keep tables separate

function fixedtables(state) {
  /* build fixed huffman tables if first call (may not be thread safe) */
  if (virgin) {
    var sym;

    lenfix = new utils.Buf32(512);
    distfix = new utils.Buf32(32);

    /* literal/length table */
    sym = 0;
    while (sym < 144) { state.lens[sym++] = 8; }
    while (sym < 256) { state.lens[sym++] = 9; }
    while (sym < 280) { state.lens[sym++] = 7; }
    while (sym < 288) { state.lens[sym++] = 8; }

    inflate_table(LENS,  state.lens, 0, 288, lenfix,   0, state.work, {bits: 9});

    /* distance table */
    sym = 0;
    while (sym < 32) { state.lens[sym++] = 5; }

    inflate_table(DISTS, state.lens, 0, 32,   distfix, 0, state.work, {bits: 5});

    /* do this just once */
    virgin = false;
  }

  state.lencode = lenfix;
  state.lenbits = 9;
  state.distcode = distfix;
  state.distbits = 5;
}


/*
 Update the window with the last wsize (normally 32K) bytes written before
 returning.  If window does not exist yet, create it.  This is only called
 when a window is already in use, or when output has been written during this
 inflate call, but the end of the deflate stream has not been reached yet.
 It is also called to create a window for dictionary data when a dictionary
 is loaded.

 Providing output buffers larger than 32K to inflate() should provide a speed
 advantage, since only the last 32K of output is copied to the sliding window
 upon return from inflate(), and since all distances after the first 32K of
 output will fall in the output data, making match copies simpler and faster.
 The advantage may be dependent on the size of the processor's data caches.
 */
function updatewindow(strm, src, end, copy) {
  var dist;
  var state = strm.state;

  /* if it hasn't been done already, allocate space for the window */
  if (state.window === null) {
    state.wsize = 1 << state.wbits;
    state.wnext = 0;
    state.whave = 0;

    state.window = new utils.Buf8(state.wsize);
  }

  /* copy state->wsize or less output bytes into the circular window */
  if (copy >= state.wsize) {
    utils.arraySet(state.window,src, end - state.wsize, state.wsize, 0);
    state.wnext = 0;
    state.whave = state.wsize;
  }
  else {
    dist = state.wsize - state.wnext;
    if (dist > copy) {
      dist = copy;
    }
    //zmemcpy(state->window + state->wnext, end - copy, dist);
    utils.arraySet(state.window,src, end - copy, dist, state.wnext);
    copy -= dist;
    if (copy) {
      //zmemcpy(state->window, end - copy, copy);
      utils.arraySet(state.window,src, end - copy, copy, 0);
      state.wnext = copy;
      state.whave = state.wsize;
    }
    else {
      state.wnext += dist;
      if (state.wnext === state.wsize) { state.wnext = 0; }
      if (state.whave < state.wsize) { state.whave += dist; }
    }
  }
  return 0;
}

function inflate(strm, flush) {
  var state;
  var input, output;          // input/output buffers
  var next;                   /* next input INDEX */
  var put;                    /* next output INDEX */
  var have, left;             /* available input and output */
  var hold;                   /* bit buffer */
  var bits;                   /* bits in bit buffer */
  var _in, _out;              /* save starting available input and output */
  var copy;                   /* number of stored or match bytes to copy */
  var from;                   /* where to copy match bytes from */
  var from_source;
  var here = 0;               /* current decoding table entry */
  var here_bits, here_op, here_val; // paked "here" denormalized (JS specific)
  //var last;                   /* parent table entry */
  var last_bits, last_op, last_val; // paked "last" denormalized (JS specific)
  var len;                    /* length to copy for repeats, bits to drop */
  var ret;                    /* return code */
  var hbuf = new utils.Buf8(4);    /* buffer for gzip header crc calculation */
  var opts;

  var n; // temporary var for NEED_BITS

  var order = /* permutation of code lengths */
    [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];


  if (!strm || !strm.state || !strm.output ||
      (!strm.input && strm.avail_in !== 0)) {
    return Z_STREAM_ERROR;
  }

  state = strm.state;
  if (state.mode === TYPE) { state.mode = TYPEDO; }    /* skip check */


  //--- LOAD() ---
  put = strm.next_out;
  output = strm.output;
  left = strm.avail_out;
  next = strm.next_in;
  input = strm.input;
  have = strm.avail_in;
  hold = state.hold;
  bits = state.bits;
  //---

  _in = have;
  _out = left;
  ret = Z_OK;

  inf_leave: // goto emulation
  for (;;) {
    switch (state.mode) {
    case HEAD:
      if (state.wrap === 0) {
        state.mode = TYPEDO;
        break;
      }
      //=== NEEDBITS(16);
      while (bits < 16) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      if ((state.wrap & 2) && hold === 0x8b1f) {  /* gzip header */
        state.check = 0/*crc32(0L, Z_NULL, 0)*/;
        //=== CRC2(state.check, hold);
        hbuf[0] = hold & 0xff;
        hbuf[1] = (hold >>> 8) & 0xff;
        state.check = crc32(state.check, hbuf, 2, 0);
        //===//

        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = FLAGS;
        break;
      }
      state.flags = 0;           /* expect zlib header */
      if (state.head) {
        state.head.done = false;
      }
      if (!(state.wrap & 1) ||   /* check if zlib header allowed */
        (((hold & 0xff)/*BITS(8)*/ << 8) + (hold >> 8)) % 31) {
        strm.msg = 'incorrect header check';
        state.mode = BAD;
        break;
      }
      if ((hold & 0x0f)/*BITS(4)*/ !== Z_DEFLATED) {
        strm.msg = 'unknown compression method';
        state.mode = BAD;
        break;
      }
      //--- DROPBITS(4) ---//
      hold >>>= 4;
      bits -= 4;
      //---//
      len = (hold & 0x0f)/*BITS(4)*/ + 8;
      if (state.wbits === 0) {
        state.wbits = len;
      }
      else if (len > state.wbits) {
        strm.msg = 'invalid window size';
        state.mode = BAD;
        break;
      }
      state.dmax = 1 << len;
      //Tracev((stderr, "inflate:   zlib header ok\n"));
      strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
      state.mode = hold & 0x200 ? DICTID : TYPE;
      //=== INITBITS();
      hold = 0;
      bits = 0;
      //===//
      break;
    case FLAGS:
      //=== NEEDBITS(16); */
      while (bits < 16) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      state.flags = hold;
      if ((state.flags & 0xff) !== Z_DEFLATED) {
        strm.msg = 'unknown compression method';
        state.mode = BAD;
        break;
      }
      if (state.flags & 0xe000) {
        strm.msg = 'unknown header flags set';
        state.mode = BAD;
        break;
      }
      if (state.head) {
        state.head.text = ((hold >> 8) & 1);
      }
      if (state.flags & 0x0200) {
        //=== CRC2(state.check, hold);
        hbuf[0] = hold & 0xff;
        hbuf[1] = (hold >>> 8) & 0xff;
        state.check = crc32(state.check, hbuf, 2, 0);
        //===//
      }
      //=== INITBITS();
      hold = 0;
      bits = 0;
      //===//
      state.mode = TIME;
      /* falls through */
    case TIME:
      //=== NEEDBITS(32); */
      while (bits < 32) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      if (state.head) {
        state.head.time = hold;
      }
      if (state.flags & 0x0200) {
        //=== CRC4(state.check, hold)
        hbuf[0] = hold & 0xff;
        hbuf[1] = (hold >>> 8) & 0xff;
        hbuf[2] = (hold >>> 16) & 0xff;
        hbuf[3] = (hold >>> 24) & 0xff;
        state.check = crc32(state.check, hbuf, 4, 0);
        //===
      }
      //=== INITBITS();
      hold = 0;
      bits = 0;
      //===//
      state.mode = OS;
      /* falls through */
    case OS:
      //=== NEEDBITS(16); */
      while (bits < 16) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      if (state.head) {
        state.head.xflags = (hold & 0xff);
        state.head.os = (hold >> 8);
      }
      if (state.flags & 0x0200) {
        //=== CRC2(state.check, hold);
        hbuf[0] = hold & 0xff;
        hbuf[1] = (hold >>> 8) & 0xff;
        state.check = crc32(state.check, hbuf, 2, 0);
        //===//
      }
      //=== INITBITS();
      hold = 0;
      bits = 0;
      //===//
      state.mode = EXLEN;
      /* falls through */
    case EXLEN:
      if (state.flags & 0x0400) {
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.length = hold;
        if (state.head) {
          state.head.extra_len = hold;
        }
        if (state.flags & 0x0200) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
      }
      else if (state.head) {
        state.head.extra = null/*Z_NULL*/;
      }
      state.mode = EXTRA;
      /* falls through */
    case EXTRA:
      if (state.flags & 0x0400) {
        copy = state.length;
        if (copy > have) { copy = have; }
        if (copy) {
          if (state.head) {
            len = state.head.extra_len - state.length;
            if (!state.head.extra) {
              // Use untyped array for more conveniend processing later
              state.head.extra = new Array(state.head.extra_len);
            }
            utils.arraySet(
              state.head.extra,
              input,
              next,
              // extra field is limited to 65536 bytes
              // - no need for additional size check
              copy,
              /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
              len
            );
            //zmemcpy(state.head.extra + len, next,
            //        len + copy > state.head.extra_max ?
            //        state.head.extra_max - len : copy);
          }
          if (state.flags & 0x0200) {
            state.check = crc32(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          state.length -= copy;
        }
        if (state.length) { break inf_leave; }
      }
      state.length = 0;
      state.mode = NAME;
      /* falls through */
    case NAME:
      if (state.flags & 0x0800) {
        if (have === 0) { break inf_leave; }
        copy = 0;
        do {
          // TODO: 2 or 1 bytes?
          len = input[next + copy++];
          /* use constant limit because in js we should not preallocate memory */
          if (state.head && len &&
              (state.length < 65536 /*state.head.name_max*/)) {
            state.head.name += String.fromCharCode(len);
          }
        } while (len && copy < have);

        if (state.flags & 0x0200) {
          state.check = crc32(state.check, input, copy, next);
        }
        have -= copy;
        next += copy;
        if (len) { break inf_leave; }
      }
      else if (state.head) {
        state.head.name = null;
      }
      state.length = 0;
      state.mode = COMMENT;
      /* falls through */
    case COMMENT:
      if (state.flags & 0x1000) {
        if (have === 0) { break inf_leave; }
        copy = 0;
        do {
          len = input[next + copy++];
          /* use constant limit because in js we should not preallocate memory */
          if (state.head && len &&
              (state.length < 65536 /*state.head.comm_max*/)) {
            state.head.comment += String.fromCharCode(len);
          }
        } while (len && copy < have);
        if (state.flags & 0x0200) {
          state.check = crc32(state.check, input, copy, next);
        }
        have -= copy;
        next += copy;
        if (len) { break inf_leave; }
      }
      else if (state.head) {
        state.head.comment = null;
      }
      state.mode = HCRC;
      /* falls through */
    case HCRC:
      if (state.flags & 0x0200) {
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (hold !== (state.check & 0xffff)) {
          strm.msg = 'header crc mismatch';
          state.mode = BAD;
          break;
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
      }
      if (state.head) {
        state.head.hcrc = ((state.flags >> 9) & 1);
        state.head.done = true;
      }
      strm.adler = state.check = 0 /*crc32(0L, Z_NULL, 0)*/;
      state.mode = TYPE;
      break;
    case DICTID:
      //=== NEEDBITS(32); */
      while (bits < 32) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      strm.adler = state.check = ZSWAP32(hold);
      //=== INITBITS();
      hold = 0;
      bits = 0;
      //===//
      state.mode = DICT;
      /* falls through */
    case DICT:
      if (state.havedict === 0) {
        //--- RESTORE() ---
        strm.next_out = put;
        strm.avail_out = left;
        strm.next_in = next;
        strm.avail_in = have;
        state.hold = hold;
        state.bits = bits;
        //---
        return Z_NEED_DICT;
      }
      strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
      state.mode = TYPE;
      /* falls through */
    case TYPE:
      if (flush === Z_BLOCK || flush === Z_TREES) { break inf_leave; }
      /* falls through */
    case TYPEDO:
      if (state.last) {
        //--- BYTEBITS() ---//
        hold >>>= bits & 7;
        bits -= bits & 7;
        //---//
        state.mode = CHECK;
        break;
      }
      //=== NEEDBITS(3); */
      while (bits < 3) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      state.last = (hold & 0x01)/*BITS(1)*/;
      //--- DROPBITS(1) ---//
      hold >>>= 1;
      bits -= 1;
      //---//

      switch ((hold & 0x03)/*BITS(2)*/) {
      case 0:                             /* stored block */
        //Tracev((stderr, "inflate:     stored block%s\n",
        //        state.last ? " (last)" : ""));
        state.mode = STORED;
        break;
      case 1:                             /* fixed block */
        fixedtables(state);
        //Tracev((stderr, "inflate:     fixed codes block%s\n",
        //        state.last ? " (last)" : ""));
        state.mode = LEN_;             /* decode codes */
        if (flush === Z_TREES) {
          //--- DROPBITS(2) ---//
          hold >>>= 2;
          bits -= 2;
          //---//
          break inf_leave;
        }
        break;
      case 2:                             /* dynamic block */
        //Tracev((stderr, "inflate:     dynamic codes block%s\n",
        //        state.last ? " (last)" : ""));
        state.mode = TABLE;
        break;
      case 3:
        strm.msg = 'invalid block type';
        state.mode = BAD;
      }
      //--- DROPBITS(2) ---//
      hold >>>= 2;
      bits -= 2;
      //---//
      break;
    case STORED:
      //--- BYTEBITS() ---// /* go to byte boundary */
      hold >>>= bits & 7;
      bits -= bits & 7;
      //---//
      //=== NEEDBITS(32); */
      while (bits < 32) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {
        strm.msg = 'invalid stored block lengths';
        state.mode = BAD;
        break;
      }
      state.length = hold & 0xffff;
      //Tracev((stderr, "inflate:       stored length %u\n",
      //        state.length));
      //=== INITBITS();
      hold = 0;
      bits = 0;
      //===//
      state.mode = COPY_;
      if (flush === Z_TREES) { break inf_leave; }
      /* falls through */
    case COPY_:
      state.mode = COPY;
      /* falls through */
    case COPY:
      copy = state.length;
      if (copy) {
        if (copy > have) { copy = have; }
        if (copy > left) { copy = left; }
        if (copy === 0) { break inf_leave; }
        //--- zmemcpy(put, next, copy); ---
        utils.arraySet(output, input, next, copy, put);
        //---//
        have -= copy;
        next += copy;
        left -= copy;
        put += copy;
        state.length -= copy;
        break;
      }
      //Tracev((stderr, "inflate:       stored end\n"));
      state.mode = TYPE;
      break;
    case TABLE:
      //=== NEEDBITS(14); */
      while (bits < 14) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      state.nlen = (hold & 0x1f)/*BITS(5)*/ + 257;
      //--- DROPBITS(5) ---//
      hold >>>= 5;
      bits -= 5;
      //---//
      state.ndist = (hold & 0x1f)/*BITS(5)*/ + 1;
      //--- DROPBITS(5) ---//
      hold >>>= 5;
      bits -= 5;
      //---//
      state.ncode = (hold & 0x0f)/*BITS(4)*/ + 4;
      //--- DROPBITS(4) ---//
      hold >>>= 4;
      bits -= 4;
      //---//
//#ifndef PKZIP_BUG_WORKAROUND
      if (state.nlen > 286 || state.ndist > 30) {
        strm.msg = 'too many length or distance symbols';
        state.mode = BAD;
        break;
      }
//#endif
      //Tracev((stderr, "inflate:       table sizes ok\n"));
      state.have = 0;
      state.mode = LENLENS;
      /* falls through */
    case LENLENS:
      while (state.have < state.ncode) {
        //=== NEEDBITS(3);
        while (bits < 3) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.lens[order[state.have++]] = (hold & 0x07);//BITS(3);
        //--- DROPBITS(3) ---//
        hold >>>= 3;
        bits -= 3;
        //---//
      }
      while (state.have < 19) {
        state.lens[order[state.have++]] = 0;
      }
      // We have separate tables & no pointers. 2 commented lines below not needed.
      //state.next = state.codes;
      //state.lencode = state.next;
      // Switch to use dynamic table
      state.lencode = state.lendyn;
      state.lenbits = 7;

      opts = {bits: state.lenbits};
      ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
      state.lenbits = opts.bits;

      if (ret) {
        strm.msg = 'invalid code lengths set';
        state.mode = BAD;
        break;
      }
      //Tracev((stderr, "inflate:       code lengths ok\n"));
      state.have = 0;
      state.mode = CODELENS;
      /* falls through */
    case CODELENS:
      while (state.have < state.nlen + state.ndist) {
        for (;;) {
          here = state.lencode[hold & ((1 << state.lenbits) - 1)];/*BITS(state.lenbits)*/
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if ((here_bits) <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if (here_val < 16) {
          //--- DROPBITS(here.bits) ---//
          hold >>>= here_bits;
          bits -= here_bits;
          //---//
          state.lens[state.have++] = here_val;
        }
        else {
          if (here_val === 16) {
            //=== NEEDBITS(here.bits + 2);
            n = here_bits + 2;
            while (bits < n) {
              if (have === 0) { break inf_leave; }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            //--- DROPBITS(here.bits) ---//
            hold >>>= here_bits;
            bits -= here_bits;
            //---//
            if (state.have === 0) {
              strm.msg = 'invalid bit length repeat';
              state.mode = BAD;
              break;
            }
            len = state.lens[state.have - 1];
            copy = 3 + (hold & 0x03);//BITS(2);
            //--- DROPBITS(2) ---//
            hold >>>= 2;
            bits -= 2;
            //---//
          }
          else if (here_val === 17) {
            //=== NEEDBITS(here.bits + 3);
            n = here_bits + 3;
            while (bits < n) {
              if (have === 0) { break inf_leave; }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            //--- DROPBITS(here.bits) ---//
            hold >>>= here_bits;
            bits -= here_bits;
            //---//
            len = 0;
            copy = 3 + (hold & 0x07);//BITS(3);
            //--- DROPBITS(3) ---//
            hold >>>= 3;
            bits -= 3;
            //---//
          }
          else {
            //=== NEEDBITS(here.bits + 7);
            n = here_bits + 7;
            while (bits < n) {
              if (have === 0) { break inf_leave; }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            //--- DROPBITS(here.bits) ---//
            hold >>>= here_bits;
            bits -= here_bits;
            //---//
            len = 0;
            copy = 11 + (hold & 0x7f);//BITS(7);
            //--- DROPBITS(7) ---//
            hold >>>= 7;
            bits -= 7;
            //---//
          }
          if (state.have + copy > state.nlen + state.ndist) {
            strm.msg = 'invalid bit length repeat';
            state.mode = BAD;
            break;
          }
          while (copy--) {
            state.lens[state.have++] = len;
          }
        }
      }

      /* handle error breaks in while */
      if (state.mode === BAD) { break; }

      /* check for end-of-block code (better have one) */
      if (state.lens[256] === 0) {
        strm.msg = 'invalid code -- missing end-of-block';
        state.mode = BAD;
        break;
      }

      /* build code tables -- note: do not change the lenbits or distbits
         values here (9 and 6) without reading the comments in inftrees.h
         concerning the ENOUGH constants, which depend on those values */
      state.lenbits = 9;

      opts = {bits: state.lenbits};
      ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
      // We have separate tables & no pointers. 2 commented lines below not needed.
      // state.next_index = opts.table_index;
      state.lenbits = opts.bits;
      // state.lencode = state.next;

      if (ret) {
        strm.msg = 'invalid literal/lengths set';
        state.mode = BAD;
        break;
      }

      state.distbits = 6;
      //state.distcode.copy(state.codes);
      // Switch to use dynamic table
      state.distcode = state.distdyn;
      opts = {bits: state.distbits};
      ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
      // We have separate tables & no pointers. 2 commented lines below not needed.
      // state.next_index = opts.table_index;
      state.distbits = opts.bits;
      // state.distcode = state.next;

      if (ret) {
        strm.msg = 'invalid distances set';
        state.mode = BAD;
        break;
      }
      //Tracev((stderr, 'inflate:       codes ok\n'));
      state.mode = LEN_;
      if (flush === Z_TREES) { break inf_leave; }
      /* falls through */
    case LEN_:
      state.mode = LEN;
      /* falls through */
    case LEN:
      if (have >= 6 && left >= 258) {
        //--- RESTORE() ---
        strm.next_out = put;
        strm.avail_out = left;
        strm.next_in = next;
        strm.avail_in = have;
        state.hold = hold;
        state.bits = bits;
        //---
        inflate_fast(strm, _out);
        //--- LOAD() ---
        put = strm.next_out;
        output = strm.output;
        left = strm.avail_out;
        next = strm.next_in;
        input = strm.input;
        have = strm.avail_in;
        hold = state.hold;
        bits = state.bits;
        //---

        if (state.mode === TYPE) {
          state.back = -1;
        }
        break;
      }
      state.back = 0;
      for (;;) {
        here = state.lencode[hold & ((1 << state.lenbits) -1)];  /*BITS(state.lenbits)*/
        here_bits = here >>> 24;
        here_op = (here >>> 16) & 0xff;
        here_val = here & 0xffff;

        if (here_bits <= bits) { break; }
        //--- PULLBYTE() ---//
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
        //---//
      }
      if (here_op && (here_op & 0xf0) === 0) {
        last_bits = here_bits;
        last_op = here_op;
        last_val = here_val;
        for (;;) {
          here = state.lencode[last_val +
                  ((hold & ((1 << (last_bits + last_op)) -1))/*BITS(last.bits + last.op)*/ >> last_bits)];
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if ((last_bits + here_bits) <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        //--- DROPBITS(last.bits) ---//
        hold >>>= last_bits;
        bits -= last_bits;
        //---//
        state.back += last_bits;
      }
      //--- DROPBITS(here.bits) ---//
      hold >>>= here_bits;
      bits -= here_bits;
      //---//
      state.back += here_bits;
      state.length = here_val;
      if (here_op === 0) {
        //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
        //        "inflate:         literal '%c'\n" :
        //        "inflate:         literal 0x%02x\n", here.val));
        state.mode = LIT;
        break;
      }
      if (here_op & 32) {
        //Tracevv((stderr, "inflate:         end of block\n"));
        state.back = -1;
        state.mode = TYPE;
        break;
      }
      if (here_op & 64) {
        strm.msg = 'invalid literal/length code';
        state.mode = BAD;
        break;
      }
      state.extra = here_op & 15;
      state.mode = LENEXT;
      /* falls through */
    case LENEXT:
      if (state.extra) {
        //=== NEEDBITS(state.extra);
        n = state.extra;
        while (bits < n) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.length += hold & ((1 << state.extra) -1)/*BITS(state.extra)*/;
        //--- DROPBITS(state.extra) ---//
        hold >>>= state.extra;
        bits -= state.extra;
        //---//
        state.back += state.extra;
      }
      //Tracevv((stderr, "inflate:         length %u\n", state.length));
      state.was = state.length;
      state.mode = DIST;
      /* falls through */
    case DIST:
      for (;;) {
        here = state.distcode[hold & ((1 << state.distbits) -1)];/*BITS(state.distbits)*/
        here_bits = here >>> 24;
        here_op = (here >>> 16) & 0xff;
        here_val = here & 0xffff;

        if ((here_bits) <= bits) { break; }
        //--- PULLBYTE() ---//
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
        //---//
      }
      if ((here_op & 0xf0) === 0) {
        last_bits = here_bits;
        last_op = here_op;
        last_val = here_val;
        for (;;) {
          here = state.distcode[last_val +
                  ((hold & ((1 << (last_bits + last_op)) -1))/*BITS(last.bits + last.op)*/ >> last_bits)];
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if ((last_bits + here_bits) <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        //--- DROPBITS(last.bits) ---//
        hold >>>= last_bits;
        bits -= last_bits;
        //---//
        state.back += last_bits;
      }
      //--- DROPBITS(here.bits) ---//
      hold >>>= here_bits;
      bits -= here_bits;
      //---//
      state.back += here_bits;
      if (here_op & 64) {
        strm.msg = 'invalid distance code';
        state.mode = BAD;
        break;
      }
      state.offset = here_val;
      state.extra = (here_op) & 15;
      state.mode = DISTEXT;
      /* falls through */
    case DISTEXT:
      if (state.extra) {
        //=== NEEDBITS(state.extra);
        n = state.extra;
        while (bits < n) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.offset += hold & ((1 << state.extra) -1)/*BITS(state.extra)*/;
        //--- DROPBITS(state.extra) ---//
        hold >>>= state.extra;
        bits -= state.extra;
        //---//
        state.back += state.extra;
      }
//#ifdef INFLATE_STRICT
      if (state.offset > state.dmax) {
        strm.msg = 'invalid distance too far back';
        state.mode = BAD;
        break;
      }
//#endif
      //Tracevv((stderr, "inflate:         distance %u\n", state.offset));
      state.mode = MATCH;
      /* falls through */
    case MATCH:
      if (left === 0) { break inf_leave; }
      copy = _out - left;
      if (state.offset > copy) {         /* copy from window */
        copy = state.offset - copy;
        if (copy > state.whave) {
          if (state.sane) {
            strm.msg = 'invalid distance too far back';
            state.mode = BAD;
            break;
          }
// (!) This block is disabled in zlib defailts,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//          Trace((stderr, "inflate.c too far\n"));
//          copy -= state.whave;
//          if (copy > state.length) { copy = state.length; }
//          if (copy > left) { copy = left; }
//          left -= copy;
//          state.length -= copy;
//          do {
//            output[put++] = 0;
//          } while (--copy);
//          if (state.length === 0) { state.mode = LEN; }
//          break;
//#endif
        }
        if (copy > state.wnext) {
          copy -= state.wnext;
          from = state.wsize - copy;
        }
        else {
          from = state.wnext - copy;
        }
        if (copy > state.length) { copy = state.length; }
        from_source = state.window;
      }
      else {                              /* copy from output */
        from_source = output;
        from = put - state.offset;
        copy = state.length;
      }
      if (copy > left) { copy = left; }
      left -= copy;
      state.length -= copy;
      do {
        output[put++] = from_source[from++];
      } while (--copy);
      if (state.length === 0) { state.mode = LEN; }
      break;
    case LIT:
      if (left === 0) { break inf_leave; }
      output[put++] = state.length;
      left--;
      state.mode = LEN;
      break;
    case CHECK:
      if (state.wrap) {
        //=== NEEDBITS(32);
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          // Use '|' insdead of '+' to make sure that result is signed
          hold |= input[next++] << bits;
          bits += 8;
        }
        //===//
        _out -= left;
        strm.total_out += _out;
        state.total += _out;
        if (_out) {
          strm.adler = state.check =
              /*UPDATE(state.check, put - _out, _out);*/
              (state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out));

        }
        _out = left;
        // NB: crc32 stored as signed 32-bit int, ZSWAP32 returns signed too
        if ((state.flags ? hold : ZSWAP32(hold)) !== state.check) {
          strm.msg = 'incorrect data check';
          state.mode = BAD;
          break;
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        //Tracev((stderr, "inflate:   check matches trailer\n"));
      }
      state.mode = LENGTH;
      /* falls through */
    case LENGTH:
      if (state.wrap && state.flags) {
        //=== NEEDBITS(32);
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (hold !== (state.total & 0xffffffff)) {
          strm.msg = 'incorrect length check';
          state.mode = BAD;
          break;
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        //Tracev((stderr, "inflate:   length matches trailer\n"));
      }
      state.mode = DONE;
      /* falls through */
    case DONE:
      ret = Z_STREAM_END;
      break inf_leave;
    case BAD:
      ret = Z_DATA_ERROR;
      break inf_leave;
    case MEM:
      return Z_MEM_ERROR;
    case SYNC:
      /* falls through */
    default:
      return Z_STREAM_ERROR;
    }
  }

  // inf_leave <- here is real place for "goto inf_leave", emulated via "break inf_leave"

  /*
     Return from inflate(), updating the total counts and the check value.
     If there was no progress during the inflate() call, return a buffer
     error.  Call updatewindow() to create and/or update the window state.
     Note: a memory error from inflate() is non-recoverable.
   */

  //--- RESTORE() ---
  strm.next_out = put;
  strm.avail_out = left;
  strm.next_in = next;
  strm.avail_in = have;
  state.hold = hold;
  state.bits = bits;
  //---

  if (state.wsize || (_out !== strm.avail_out && state.mode < BAD &&
                      (state.mode < CHECK || flush !== Z_FINISH))) {
    if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
      state.mode = MEM;
      return Z_MEM_ERROR;
    }
  }
  _in -= strm.avail_in;
  _out -= strm.avail_out;
  strm.total_in += _in;
  strm.total_out += _out;
  state.total += _out;
  if (state.wrap && _out) {
    strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
      (state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out));
  }
  strm.data_type = state.bits + (state.last ? 64 : 0) +
                    (state.mode === TYPE ? 128 : 0) +
                    (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
  if (((_in === 0 && _out === 0) || flush === Z_FINISH) && ret === Z_OK) {
    ret = Z_BUF_ERROR;
  }
  return ret;
}

function inflateEnd(strm) {

  if (!strm || !strm.state /*|| strm->zfree == (free_func)0*/) {
    return Z_STREAM_ERROR;
  }

  var state = strm.state;
  if (state.window) {
    state.window = null;
  }
  strm.state = null;
  return Z_OK;
}

function inflateGetHeader(strm, head) {
  var state;

  /* check state */
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  if ((state.wrap & 2) === 0) { return Z_STREAM_ERROR; }

  /* save header structure */
  state.head = head;
  head.done = false;
  return Z_OK;
}


exports.inflateReset = inflateReset;
exports.inflateReset2 = inflateReset2;
exports.inflateResetKeep = inflateResetKeep;
exports.inflateInit = inflateInit;
exports.inflateInit2 = inflateInit2;
exports.inflate = inflate;
exports.inflateEnd = inflateEnd;
exports.inflateGetHeader = inflateGetHeader;
exports.inflateInfo = 'pako inflate (from Nodeca project)';

/* Not implemented
exports.inflateCopy = inflateCopy;
exports.inflateGetDictionary = inflateGetDictionary;
exports.inflateMark = inflateMark;
exports.inflatePrime = inflatePrime;
exports.inflateSetDictionary = inflateSetDictionary;
exports.inflateSync = inflateSync;
exports.inflateSyncPoint = inflateSyncPoint;
exports.inflateUndermine = inflateUndermine;
*/
},{"../utils/common":27,"./adler32":29,"./crc32":31,"./inffast":34,"./inftrees":36}],36:[function(_dereq_,module,exports){
'use strict';


var utils = _dereq_('../utils/common');

var MAXBITS = 15;
var ENOUGH_LENS = 852;
var ENOUGH_DISTS = 592;
//var ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);

var CODES = 0;
var LENS = 1;
var DISTS = 2;

var lbase = [ /* Length codes 257..285 base */
  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
  35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
];

var lext = [ /* Length codes 257..285 extra */
  16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
  19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78
];

var dbase = [ /* Distance codes 0..29 base */
  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
  257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
  8193, 12289, 16385, 24577, 0, 0
];

var dext = [ /* Distance codes 0..29 extra */
  16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
  23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
  28, 28, 29, 29, 64, 64
];

module.exports = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts)
{
  var bits = opts.bits;
      //here = opts.here; /* table entry for duplication */

  var len = 0;               /* a code's length in bits */
  var sym = 0;               /* index of code symbols */
  var min = 0, max = 0;          /* minimum and maximum code lengths */
  var root = 0;              /* number of index bits for root table */
  var curr = 0;              /* number of index bits for current table */
  var drop = 0;              /* code bits to drop for sub-table */
  var left = 0;                   /* number of prefix codes available */
  var used = 0;              /* code entries in table used */
  var huff = 0;              /* Huffman code */
  var incr;              /* for incrementing code, index */
  var fill;              /* index for replicating entries */
  var low;               /* low bits for current root entry */
  var mask;              /* mask for low root bits */
  var next;             /* next available space in table */
  var base = null;     /* base value table to use */
  var base_index = 0;
//  var shoextra;    /* extra bits table to use */
  var end;                    /* use base and extra for symbol > end */
  var count = new utils.Buf16(MAXBITS+1); //[MAXBITS+1];    /* number of codes of each length */
  var offs = new utils.Buf16(MAXBITS+1); //[MAXBITS+1];     /* offsets in table for each length */
  var extra = null;
  var extra_index = 0;

  var here_bits, here_op, here_val;

  /*
   Process a set of code lengths to create a canonical Huffman code.  The
   code lengths are lens[0..codes-1].  Each length corresponds to the
   symbols 0..codes-1.  The Huffman code is generated by first sorting the
   symbols by length from short to long, and retaining the symbol order
   for codes with equal lengths.  Then the code starts with all zero bits
   for the first code of the shortest length, and the codes are integer
   increments for the same length, and zeros are appended as the length
   increases.  For the deflate format, these bits are stored backwards
   from their more natural integer increment ordering, and so when the
   decoding tables are built in the large loop below, the integer codes
   are incremented backwards.

   This routine assumes, but does not check, that all of the entries in
   lens[] are in the range 0..MAXBITS.  The caller must assure this.
   1..MAXBITS is interpreted as that code length.  zero means that that
   symbol does not occur in this code.

   The codes are sorted by computing a count of codes for each length,
   creating from that a table of starting indices for each length in the
   sorted table, and then entering the symbols in order in the sorted
   table.  The sorted table is work[], with that space being provided by
   the caller.

   The length counts are used for other purposes as well, i.e. finding
   the minimum and maximum length codes, determining if there are any
   codes at all, checking for a valid set of lengths, and looking ahead
   at length counts to determine sub-table sizes when building the
   decoding tables.
   */

  /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */
  for (len = 0; len <= MAXBITS; len++) {
    count[len] = 0;
  }
  for (sym = 0; sym < codes; sym++) {
    count[lens[lens_index + sym]]++;
  }

  /* bound code lengths, force root to be within code lengths */
  root = bits;
  for (max = MAXBITS; max >= 1; max--) {
    if (count[max] !== 0) { break; }
  }
  if (root > max) {
    root = max;
  }
  if (max === 0) {                     /* no symbols to code at all */
    //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */
    //table.bits[opts.table_index] = 1;   //here.bits = (var char)1;
    //table.val[opts.table_index++] = 0;   //here.val = (var short)0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;


    //table.op[opts.table_index] = 64;
    //table.bits[opts.table_index] = 1;
    //table.val[opts.table_index++] = 0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;

    opts.bits = 1;
    return 0;     /* no symbols, but wait for decoding to report error */
  }
  for (min = 1; min < max; min++) {
    if (count[min] !== 0) { break; }
  }
  if (root < min) {
    root = min;
  }

  /* check for an over-subscribed or incomplete set of lengths */
  left = 1;
  for (len = 1; len <= MAXBITS; len++) {
    left <<= 1;
    left -= count[len];
    if (left < 0) {
      return -1;
    }        /* over-subscribed */
  }
  if (left > 0 && (type === CODES || max !== 1)) {
    return -1;                      /* incomplete set */
  }

  /* generate offsets into symbol table for each length for sorting */
  offs[1] = 0;
  for (len = 1; len < MAXBITS; len++) {
    offs[len + 1] = offs[len] + count[len];
  }

  /* sort symbols by length, by symbol order within each length */
  for (sym = 0; sym < codes; sym++) {
    if (lens[lens_index + sym] !== 0) {
      work[offs[lens[lens_index + sym]]++] = sym;
    }
  }

  /*
   Create and fill in decoding tables.  In this loop, the table being
   filled is at next and has curr index bits.  The code being used is huff
   with length len.  That code is converted to an index by dropping drop
   bits off of the bottom.  For codes where len is less than drop + curr,
   those top drop + curr - len bits are incremented through all values to
   fill the table with replicated entries.

   root is the number of index bits for the root table.  When len exceeds
   root, sub-tables are created pointed to by the root entry with an index
   of the low root bits of huff.  This is saved in low to check for when a
   new sub-table should be started.  drop is zero when the root table is
   being filled, and drop is root when sub-tables are being filled.

   When a new sub-table is needed, it is necessary to look ahead in the
   code lengths to determine what size sub-table is needed.  The length
   counts are used for this, and so count[] is decremented as codes are
   entered in the tables.

   used keeps track of how many table entries have been allocated from the
   provided *table space.  It is checked for LENS and DIST tables against
   the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
   the initial root table size constants.  See the comments in inftrees.h
   for more information.

   sym increments through all symbols, and the loop terminates when
   all codes of length max, i.e. all codes, have been processed.  This
   routine permits incomplete codes, so another loop after this one fills
   in the rest of the decoding tables with invalid code markers.
   */

  /* set up for code type */
  // poor man optimization - use if-else instead of switch,
  // to avoid deopts in old v8
  if (type === CODES) {
      base = extra = work;    /* dummy value--not used */
      end = 19;
  } else if (type === LENS) {
      base = lbase;
      base_index -= 257;
      extra = lext;
      extra_index -= 257;
      end = 256;
  } else {                    /* DISTS */
      base = dbase;
      extra = dext;
      end = -1;
  }

  /* initialize opts for loop */
  huff = 0;                   /* starting code */
  sym = 0;                    /* starting code symbol */
  len = min;                  /* starting code length */
  next = table_index;              /* current table to fill in */
  curr = root;                /* current table index bits */
  drop = 0;                   /* current bits to drop from code for index */
  low = -1;                   /* trigger new sub-table when len > root */
  used = 1 << root;          /* use root table entries */
  mask = used - 1;            /* mask for comparing low */

  /* check available table space */
  if ((type === LENS && used > ENOUGH_LENS) ||
    (type === DISTS && used > ENOUGH_DISTS)) {
    return 1;
  }

  var i=0;
  /* process all codes and make table entries */
  for (;;) {
    i++;
    /* create table entry */
    here_bits = len - drop;
    if (work[sym] < end) {
      here_op = 0;
      here_val = work[sym];
    }
    else if (work[sym] > end) {
      here_op = extra[extra_index + work[sym]];
      here_val = base[base_index + work[sym]];
    }
    else {
      here_op = 32 + 64;         /* end of block */
      here_val = 0;
    }

    /* replicate for those indices with low len bits equal to huff */
    incr = 1 << (len - drop);
    fill = 1 << curr;
    min = fill;                 /* save offset to next table */
    do {
      fill -= incr;
      table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val |0;
    } while (fill !== 0);

    /* backwards increment the len-bit code huff */
    incr = 1 << (len - 1);
    while (huff & incr) {
      incr >>= 1;
    }
    if (incr !== 0) {
      huff &= incr - 1;
      huff += incr;
    } else {
      huff = 0;
    }

    /* go to next symbol, update count, len */
    sym++;
    if (--count[len] === 0) {
      if (len === max) { break; }
      len = lens[lens_index + work[sym]];
    }

    /* create new sub-table if needed */
    if (len > root && (huff & mask) !== low) {
      /* if first time, transition to sub-tables */
      if (drop === 0) {
        drop = root;
      }

      /* increment past last table */
      next += min;            /* here min is 1 << curr */

      /* determine length of next table */
      curr = len - drop;
      left = 1 << curr;
      while (curr + drop < max) {
        left -= count[curr + drop];
        if (left <= 0) { break; }
        curr++;
        left <<= 1;
      }

      /* check for enough space */
      used += 1 << curr;
      if ((type === LENS && used > ENOUGH_LENS) ||
        (type === DISTS && used > ENOUGH_DISTS)) {
        return 1;
      }

      /* point entry in root table to sub-table */
      low = huff & mask;
      /*table.op[low] = curr;
      table.bits[low] = root;
      table.val[low] = next - opts.table_index;*/
      table[low] = (root << 24) | (curr << 16) | (next - table_index) |0;
    }
  }

  /* fill in remaining table entry if code is incomplete (guaranteed to have
   at most one remaining entry, since if the code is incomplete, the
   maximum code length that was allowed to get this far is one bit) */
  if (huff !== 0) {
    //table.op[next + huff] = 64;            /* invalid code marker */
    //table.bits[next + huff] = len - drop;
    //table.val[next + huff] = 0;
    table[next + huff] = ((len - drop) << 24) | (64 << 16) |0;
  }

  /* set return parameters */
  //opts.table_index += used;
  opts.bits = root;
  return 0;
};

},{"../utils/common":27}],37:[function(_dereq_,module,exports){
'use strict';

module.exports = {
  '2':    'need dictionary',     /* Z_NEED_DICT       2  */
  '1':    'stream end',          /* Z_STREAM_END      1  */
  '0':    '',                    /* Z_OK              0  */
  '-1':   'file error',          /* Z_ERRNO         (-1) */
  '-2':   'stream error',        /* Z_STREAM_ERROR  (-2) */
  '-3':   'data error',          /* Z_DATA_ERROR    (-3) */
  '-4':   'insufficient memory', /* Z_MEM_ERROR     (-4) */
  '-5':   'buffer error',        /* Z_BUF_ERROR     (-5) */
  '-6':   'incompatible version' /* Z_VERSION_ERROR (-6) */
};
},{}],38:[function(_dereq_,module,exports){
'use strict';


var utils = _dereq_('../utils/common');

/* Public constants ==========================================================*/
/* ===========================================================================*/


//var Z_FILTERED          = 1;
//var Z_HUFFMAN_ONLY      = 2;
//var Z_RLE               = 3;
var Z_FIXED               = 4;
//var Z_DEFAULT_STRATEGY  = 0;

/* Possible values of the data_type field (though see inflate()) */
var Z_BINARY              = 0;
var Z_TEXT                = 1;
//var Z_ASCII             = 1; // = Z_TEXT
var Z_UNKNOWN             = 2;

/*============================================================================*/


function zero(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }

// From zutil.h

var STORED_BLOCK = 0;
var STATIC_TREES = 1;
var DYN_TREES    = 2;
/* The three kinds of block type */

var MIN_MATCH    = 3;
var MAX_MATCH    = 258;
/* The minimum and maximum match lengths */

// From deflate.h
/* ===========================================================================
 * Internal compression state.
 */

var LENGTH_CODES  = 29;
/* number of length codes, not counting the special END_BLOCK code */

var LITERALS      = 256;
/* number of literal bytes 0..255 */

var L_CODES       = LITERALS + 1 + LENGTH_CODES;
/* number of Literal or Length codes, including the END_BLOCK code */

var D_CODES       = 30;
/* number of distance codes */

var BL_CODES      = 19;
/* number of codes used to transfer the bit lengths */

var HEAP_SIZE     = 2*L_CODES + 1;
/* maximum heap size */

var MAX_BITS      = 15;
/* All codes must not exceed MAX_BITS bits */

var Buf_size      = 16;
/* size of bit buffer in bi_buf */


/* ===========================================================================
 * Constants
 */

var MAX_BL_BITS = 7;
/* Bit length codes must not exceed MAX_BL_BITS bits */

var END_BLOCK   = 256;
/* end of block literal code */

var REP_3_6     = 16;
/* repeat previous bit length 3-6 times (2 bits of repeat count) */

var REPZ_3_10   = 17;
/* repeat a zero length 3-10 times  (3 bits of repeat count) */

var REPZ_11_138 = 18;
/* repeat a zero length 11-138 times  (7 bits of repeat count) */

var extra_lbits =   /* extra bits for each length code */
  [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];

var extra_dbits =   /* extra bits for each distance code */
  [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];

var extra_blbits =  /* extra bits for each bit length code */
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7];

var bl_order =
  [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
/* The lengths of the bit length codes are sent in order of decreasing
 * probability, to avoid transmitting the lengths for unused bit length codes.
 */

/* ===========================================================================
 * Local data. These are initialized only once.
 */

// We pre-fill arrays with 0 to avoid uninitialized gaps

var DIST_CODE_LEN = 512; /* see definition of array dist_code below */

// !!!! Use flat array insdead of structure, Freq = i*2, Len = i*2+1
var static_ltree  = new Array((L_CODES+2) * 2);
zero(static_ltree);
/* The static literal tree. Since the bit lengths are imposed, there is no
 * need for the L_CODES extra codes used during heap construction. However
 * The codes 286 and 287 are needed to build a canonical tree (see _tr_init
 * below).
 */

var static_dtree  = new Array(D_CODES * 2);
zero(static_dtree);
/* The static distance tree. (Actually a trivial tree since all codes use
 * 5 bits.)
 */

var _dist_code    = new Array(DIST_CODE_LEN);
zero(_dist_code);
/* Distance codes. The first 256 values correspond to the distances
 * 3 .. 258, the last 256 values correspond to the top 8 bits of
 * the 15 bit distances.
 */

var _length_code  = new Array(MAX_MATCH-MIN_MATCH+1);
zero(_length_code);
/* length code for each normalized match length (0 == MIN_MATCH) */

var base_length   = new Array(LENGTH_CODES);
zero(base_length);
/* First normalized length for each code (0 = MIN_MATCH) */

var base_dist     = new Array(D_CODES);
zero(base_dist);
/* First normalized distance for each code (0 = distance of 1) */


var StaticTreeDesc = function (static_tree, extra_bits, extra_base, elems, max_length) {

  this.static_tree  = static_tree;  /* static tree or NULL */
  this.extra_bits   = extra_bits;   /* extra bits for each code or NULL */
  this.extra_base   = extra_base;   /* base index for extra_bits */
  this.elems        = elems;        /* max number of elements in the tree */
  this.max_length   = max_length;   /* max bit length for the codes */

  // show if `static_tree` has data or dummy - needed for monomorphic objects
  this.has_stree    = static_tree && static_tree.length;
};


var static_l_desc;
var static_d_desc;
var static_bl_desc;


var TreeDesc = function(dyn_tree, stat_desc) {
  this.dyn_tree = dyn_tree;     /* the dynamic tree */
  this.max_code = 0;            /* largest code with non zero frequency */
  this.stat_desc = stat_desc;   /* the corresponding static tree */
};



function d_code(dist) {
  return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
}


/* ===========================================================================
 * Output a short LSB first on the stream.
 * IN assertion: there is enough room in pendingBuf.
 */
function put_short (s, w) {
//    put_byte(s, (uch)((w) & 0xff));
//    put_byte(s, (uch)((ush)(w) >> 8));
  s.pending_buf[s.pending++] = (w) & 0xff;
  s.pending_buf[s.pending++] = (w >>> 8) & 0xff;
}


/* ===========================================================================
 * Send a value on a given number of bits.
 * IN assertion: length <= 16 and value fits in length bits.
 */
function send_bits(s, value, length) {
  if (s.bi_valid > (Buf_size - length)) {
    s.bi_buf |= (value << s.bi_valid) & 0xffff;
    put_short(s, s.bi_buf);
    s.bi_buf = value >> (Buf_size - s.bi_valid);
    s.bi_valid += length - Buf_size;
  } else {
    s.bi_buf |= (value << s.bi_valid) & 0xffff;
    s.bi_valid += length;
  }
}


function send_code(s, c, tree) {
  send_bits(s, tree[c*2]/*.Code*/, tree[c*2 + 1]/*.Len*/);
}


/* ===========================================================================
 * Reverse the first len bits of a code, using straightforward code (a faster
 * method would use a table)
 * IN assertion: 1 <= len <= 15
 */
function bi_reverse(code, len) {
  var res = 0;
  do {
    res |= code & 1;
    code >>>= 1;
    res <<= 1;
  } while (--len > 0);
  return res >>> 1;
}


/* ===========================================================================
 * Flush the bit buffer, keeping at most 7 bits in it.
 */
function bi_flush(s) {
  if (s.bi_valid === 16) {
    put_short(s, s.bi_buf);
    s.bi_buf = 0;
    s.bi_valid = 0;

  } else if (s.bi_valid >= 8) {
    s.pending_buf[s.pending++] = s.bi_buf & 0xff;
    s.bi_buf >>= 8;
    s.bi_valid -= 8;
  }
}


/* ===========================================================================
 * Compute the optimal bit lengths for a tree and update the total bit length
 * for the current block.
 * IN assertion: the fields freq and dad are set, heap[heap_max] and
 *    above are the tree nodes sorted by increasing frequency.
 * OUT assertions: the field len is set to the optimal bit length, the
 *     array bl_count contains the frequencies for each bit length.
 *     The length opt_len is updated; static_len is also updated if stree is
 *     not null.
 */
function gen_bitlen(s, desc)
//    deflate_state *s;
//    tree_desc *desc;    /* the tree descriptor */
{
  var tree            = desc.dyn_tree;
  var max_code        = desc.max_code;
  var stree           = desc.stat_desc.static_tree;
  var has_stree       = desc.stat_desc.has_stree;
  var extra           = desc.stat_desc.extra_bits;
  var base            = desc.stat_desc.extra_base;
  var max_length      = desc.stat_desc.max_length;
  var h;              /* heap index */
  var n, m;           /* iterate over the tree elements */
  var bits;           /* bit length */
  var xbits;          /* extra bits */
  var f;              /* frequency */
  var overflow = 0;   /* number of elements with bit length too large */

  for (bits = 0; bits <= MAX_BITS; bits++) {
    s.bl_count[bits] = 0;
  }

  /* In a first pass, compute the optimal bit lengths (which may
   * overflow in the case of the bit length tree).
   */
  tree[s.heap[s.heap_max]*2 + 1]/*.Len*/ = 0; /* root of the heap */

  for (h = s.heap_max+1; h < HEAP_SIZE; h++) {
    n = s.heap[h];
    bits = tree[tree[n*2 +1]/*.Dad*/ * 2 + 1]/*.Len*/ + 1;
    if (bits > max_length) {
      bits = max_length;
      overflow++;
    }
    tree[n*2 + 1]/*.Len*/ = bits;
    /* We overwrite tree[n].Dad which is no longer needed */

    if (n > max_code) { continue; } /* not a leaf node */

    s.bl_count[bits]++;
    xbits = 0;
    if (n >= base) {
      xbits = extra[n-base];
    }
    f = tree[n * 2]/*.Freq*/;
    s.opt_len += f * (bits + xbits);
    if (has_stree) {
      s.static_len += f * (stree[n*2 + 1]/*.Len*/ + xbits);
    }
  }
  if (overflow === 0) { return; }

  // Trace((stderr,"\nbit length overflow\n"));
  /* This happens for example on obj2 and pic of the Calgary corpus */

  /* Find the first bit length which could increase: */
  do {
    bits = max_length-1;
    while (s.bl_count[bits] === 0) { bits--; }
    s.bl_count[bits]--;      /* move one leaf down the tree */
    s.bl_count[bits+1] += 2; /* move one overflow item as its brother */
    s.bl_count[max_length]--;
    /* The brother of the overflow item also moves one step up,
     * but this does not affect bl_count[max_length]
     */
    overflow -= 2;
  } while (overflow > 0);

  /* Now recompute all bit lengths, scanning in increasing frequency.
   * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
   * lengths instead of fixing only the wrong ones. This idea is taken
   * from 'ar' written by Haruhiko Okumura.)
   */
  for (bits = max_length; bits !== 0; bits--) {
    n = s.bl_count[bits];
    while (n !== 0) {
      m = s.heap[--h];
      if (m > max_code) { continue; }
      if (tree[m*2 + 1]/*.Len*/ !== bits) {
        // Trace((stderr,"code %d bits %d->%d\n", m, tree[m].Len, bits));
        s.opt_len += (bits - tree[m*2 + 1]/*.Len*/)*tree[m*2]/*.Freq*/;
        tree[m*2 + 1]/*.Len*/ = bits;
      }
      n--;
    }
  }
}


/* ===========================================================================
 * Generate the codes for a given tree and bit counts (which need not be
 * optimal).
 * IN assertion: the array bl_count contains the bit length statistics for
 * the given tree and the field len is set for all tree elements.
 * OUT assertion: the field code is set for all tree elements of non
 *     zero code length.
 */
function gen_codes(tree, max_code, bl_count)
//    ct_data *tree;             /* the tree to decorate */
//    int max_code;              /* largest code with non zero frequency */
//    ushf *bl_count;            /* number of codes at each bit length */
{
  var next_code = new Array(MAX_BITS+1); /* next code value for each bit length */
  var code = 0;              /* running code value */
  var bits;                  /* bit index */
  var n;                     /* code index */

  /* The distribution counts are first used to generate the code values
   * without bit reversal.
   */
  for (bits = 1; bits <= MAX_BITS; bits++) {
    next_code[bits] = code = (code + bl_count[bits-1]) << 1;
  }
  /* Check that the bit counts in bl_count are consistent. The last code
   * must be all ones.
   */
  //Assert (code + bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,
  //        "inconsistent bit counts");
  //Tracev((stderr,"\ngen_codes: max_code %d ", max_code));

  for (n = 0;  n <= max_code; n++) {
    var len = tree[n*2 + 1]/*.Len*/;
    if (len === 0) { continue; }
    /* Now reverse the bits */
    tree[n*2]/*.Code*/ = bi_reverse(next_code[len]++, len);

    //Tracecv(tree != static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ",
    //     n, (isgraph(n) ? n : ' '), len, tree[n].Code, next_code[len]-1));
  }
}


/* ===========================================================================
 * Initialize the various 'constant' tables.
 */
function tr_static_init() {
  var n;        /* iterates over tree elements */
  var bits;     /* bit counter */
  var length;   /* length value */
  var code;     /* code value */
  var dist;     /* distance index */
  var bl_count = new Array(MAX_BITS+1);
  /* number of codes at each bit length for an optimal tree */

  // do check in _tr_init()
  //if (static_init_done) return;

  /* For some embedded targets, global variables are not initialized: */
/*#ifdef NO_INIT_GLOBAL_POINTERS
  static_l_desc.static_tree = static_ltree;
  static_l_desc.extra_bits = extra_lbits;
  static_d_desc.static_tree = static_dtree;
  static_d_desc.extra_bits = extra_dbits;
  static_bl_desc.extra_bits = extra_blbits;
#endif*/

  /* Initialize the mapping length (0..255) -> length code (0..28) */
  length = 0;
  for (code = 0; code < LENGTH_CODES-1; code++) {
    base_length[code] = length;
    for (n = 0; n < (1<<extra_lbits[code]); n++) {
      _length_code[length++] = code;
    }
  }
  //Assert (length == 256, "tr_static_init: length != 256");
  /* Note that the length 255 (match length 258) can be represented
   * in two different ways: code 284 + 5 bits or code 285, so we
   * overwrite length_code[255] to use the best encoding:
   */
  _length_code[length-1] = code;

  /* Initialize the mapping dist (0..32K) -> dist code (0..29) */
  dist = 0;
  for (code = 0 ; code < 16; code++) {
    base_dist[code] = dist;
    for (n = 0; n < (1<<extra_dbits[code]); n++) {
      _dist_code[dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: dist != 256");
  dist >>= 7; /* from now on, all distances are divided by 128 */
  for ( ; code < D_CODES; code++) {
    base_dist[code] = dist << 7;
    for (n = 0; n < (1<<(extra_dbits[code]-7)); n++) {
      _dist_code[256 + dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: 256+dist != 512");

  /* Construct the codes of the static literal tree */
  for (bits = 0; bits <= MAX_BITS; bits++) {
    bl_count[bits] = 0;
  }

  n = 0;
  while (n <= 143) {
    static_ltree[n*2 + 1]/*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  while (n <= 255) {
    static_ltree[n*2 + 1]/*.Len*/ = 9;
    n++;
    bl_count[9]++;
  }
  while (n <= 279) {
    static_ltree[n*2 + 1]/*.Len*/ = 7;
    n++;
    bl_count[7]++;
  }
  while (n <= 287) {
    static_ltree[n*2 + 1]/*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  /* Codes 286 and 287 do not exist, but we must include them in the
   * tree construction to get a canonical Huffman tree (longest code
   * all ones)
   */
  gen_codes(static_ltree, L_CODES+1, bl_count);

  /* The static distance tree is trivial: */
  for (n = 0; n < D_CODES; n++) {
    static_dtree[n*2 + 1]/*.Len*/ = 5;
    static_dtree[n*2]/*.Code*/ = bi_reverse(n, 5);
  }

  // Now data ready and we can init static trees
  static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS+1, L_CODES, MAX_BITS);
  static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0,          D_CODES, MAX_BITS);
  static_bl_desc =new StaticTreeDesc(new Array(0), extra_blbits, 0,         BL_CODES, MAX_BL_BITS);

  //static_init_done = true;
}


/* ===========================================================================
 * Initialize a new block.
 */
function init_block(s) {
  var n; /* iterates over tree elements */

  /* Initialize the trees. */
  for (n = 0; n < L_CODES;  n++) { s.dyn_ltree[n*2]/*.Freq*/ = 0; }
  for (n = 0; n < D_CODES;  n++) { s.dyn_dtree[n*2]/*.Freq*/ = 0; }
  for (n = 0; n < BL_CODES; n++) { s.bl_tree[n*2]/*.Freq*/ = 0; }

  s.dyn_ltree[END_BLOCK*2]/*.Freq*/ = 1;
  s.opt_len = s.static_len = 0;
  s.last_lit = s.matches = 0;
}


/* ===========================================================================
 * Flush the bit buffer and align the output on a byte boundary
 */
function bi_windup(s)
{
  if (s.bi_valid > 8) {
    put_short(s, s.bi_buf);
  } else if (s.bi_valid > 0) {
    //put_byte(s, (Byte)s->bi_buf);
    s.pending_buf[s.pending++] = s.bi_buf;
  }
  s.bi_buf = 0;
  s.bi_valid = 0;
}

/* ===========================================================================
 * Copy a stored block, storing first the length and its
 * one's complement if requested.
 */
function copy_block(s, buf, len, header)
//DeflateState *s;
//charf    *buf;    /* the input data */
//unsigned len;     /* its length */
//int      header;  /* true if block header must be written */
{
  bi_windup(s);        /* align on byte boundary */

  if (header) {
    put_short(s, len);
    put_short(s, ~len);
  }
//  while (len--) {
//    put_byte(s, *buf++);
//  }
  utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);
  s.pending += len;
}

/* ===========================================================================
 * Compares to subtrees, using the tree depth as tie breaker when
 * the subtrees have equal frequency. This minimizes the worst case length.
 */
function smaller(tree, n, m, depth) {
  var _n2 = n*2;
  var _m2 = m*2;
  return (tree[_n2]/*.Freq*/ < tree[_m2]/*.Freq*/ ||
         (tree[_n2]/*.Freq*/ === tree[_m2]/*.Freq*/ && depth[n] <= depth[m]));
}

/* ===========================================================================
 * Restore the heap property by moving down the tree starting at node k,
 * exchanging a node with the smallest of its two sons if necessary, stopping
 * when the heap property is re-established (each father smaller than its
 * two sons).
 */
function pqdownheap(s, tree, k)
//    deflate_state *s;
//    ct_data *tree;  /* the tree to restore */
//    int k;               /* node to move down */
{
  var v = s.heap[k];
  var j = k << 1;  /* left son of k */
  while (j <= s.heap_len) {
    /* Set j to the smallest of the two sons: */
    if (j < s.heap_len &&
      smaller(tree, s.heap[j+1], s.heap[j], s.depth)) {
      j++;
    }
    /* Exit if v is smaller than both sons */
    if (smaller(tree, v, s.heap[j], s.depth)) { break; }

    /* Exchange v with the smallest son */
    s.heap[k] = s.heap[j];
    k = j;

    /* And continue down the tree, setting j to the left son of k */
    j <<= 1;
  }
  s.heap[k] = v;
}


// inlined manually
// var SMALLEST = 1;

/* ===========================================================================
 * Send the block data compressed using the given Huffman trees
 */
function compress_block(s, ltree, dtree)
//    deflate_state *s;
//    const ct_data *ltree; /* literal tree */
//    const ct_data *dtree; /* distance tree */
{
  var dist;           /* distance of matched string */
  var lc;             /* match length or unmatched char (if dist == 0) */
  var lx = 0;         /* running index in l_buf */
  var code;           /* the code to send */
  var extra;          /* number of extra bits to send */

  if (s.last_lit !== 0) {
    do {
      dist = (s.pending_buf[s.d_buf + lx*2] << 8) | (s.pending_buf[s.d_buf + lx*2 + 1]);
      lc = s.pending_buf[s.l_buf + lx];
      lx++;

      if (dist === 0) {
        send_code(s, lc, ltree); /* send a literal byte */
        //Tracecv(isgraph(lc), (stderr," '%c' ", lc));
      } else {
        /* Here, lc is the match length - MIN_MATCH */
        code = _length_code[lc];
        send_code(s, code+LITERALS+1, ltree); /* send the length code */
        extra = extra_lbits[code];
        if (extra !== 0) {
          lc -= base_length[code];
          send_bits(s, lc, extra);       /* send the extra length bits */
        }
        dist--; /* dist is now the match distance - 1 */
        code = d_code(dist);
        //Assert (code < D_CODES, "bad d_code");

        send_code(s, code, dtree);       /* send the distance code */
        extra = extra_dbits[code];
        if (extra !== 0) {
          dist -= base_dist[code];
          send_bits(s, dist, extra);   /* send the extra distance bits */
        }
      } /* literal or match pair ? */

      /* Check that the overlay between pending_buf and d_buf+l_buf is ok: */
      //Assert((uInt)(s->pending) < s->lit_bufsize + 2*lx,
      //       "pendingBuf overflow");

    } while (lx < s.last_lit);
  }

  send_code(s, END_BLOCK, ltree);
}


/* ===========================================================================
 * Construct one Huffman tree and assigns the code bit strings and lengths.
 * Update the total bit length for the current block.
 * IN assertion: the field freq is set for all tree elements.
 * OUT assertions: the fields len and code are set to the optimal bit length
 *     and corresponding code. The length opt_len is updated; static_len is
 *     also updated if stree is not null. The field max_code is set.
 */
function build_tree(s, desc)
//    deflate_state *s;
//    tree_desc *desc; /* the tree descriptor */
{
  var tree     = desc.dyn_tree;
  var stree    = desc.stat_desc.static_tree;
  var has_stree = desc.stat_desc.has_stree;
  var elems    = desc.stat_desc.elems;
  var n, m;          /* iterate over heap elements */
  var max_code = -1; /* largest code with non zero frequency */
  var node;          /* new node being created */

  /* Construct the initial heap, with least frequent element in
   * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
   * heap[0] is not used.
   */
  s.heap_len = 0;
  s.heap_max = HEAP_SIZE;

  for (n = 0; n < elems; n++) {
    if (tree[n * 2]/*.Freq*/ !== 0) {
      s.heap[++s.heap_len] = max_code = n;
      s.depth[n] = 0;

    } else {
      tree[n*2 + 1]/*.Len*/ = 0;
    }
  }

  /* The pkzip format requires that at least one distance code exists,
   * and that at least one bit should be sent even if there is only one
   * possible code. So to avoid special checks later on we force at least
   * two codes of non zero frequency.
   */
  while (s.heap_len < 2) {
    node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);
    tree[node * 2]/*.Freq*/ = 1;
    s.depth[node] = 0;
    s.opt_len--;

    if (has_stree) {
      s.static_len -= stree[node*2 + 1]/*.Len*/;
    }
    /* node is 0 or 1 so it does not have extra bits */
  }
  desc.max_code = max_code;

  /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
   * establish sub-heaps of increasing lengths:
   */
  for (n = (s.heap_len >> 1/*int /2*/); n >= 1; n--) { pqdownheap(s, tree, n); }

  /* Construct the Huffman tree by repeatedly combining the least two
   * frequent nodes.
   */
  node = elems;              /* next internal node of the tree */
  do {
    //pqremove(s, tree, n);  /* n = node of least frequency */
    /*** pqremove ***/
    n = s.heap[1/*SMALLEST*/];
    s.heap[1/*SMALLEST*/] = s.heap[s.heap_len--];
    pqdownheap(s, tree, 1/*SMALLEST*/);
    /***/

    m = s.heap[1/*SMALLEST*/]; /* m = node of next least frequency */

    s.heap[--s.heap_max] = n; /* keep the nodes sorted by frequency */
    s.heap[--s.heap_max] = m;

    /* Create a new node father of n and m */
    tree[node * 2]/*.Freq*/ = tree[n * 2]/*.Freq*/ + tree[m * 2]/*.Freq*/;
    s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
    tree[n*2 + 1]/*.Dad*/ = tree[m*2 + 1]/*.Dad*/ = node;

    /* and insert the new node in the heap */
    s.heap[1/*SMALLEST*/] = node++;
    pqdownheap(s, tree, 1/*SMALLEST*/);

  } while (s.heap_len >= 2);

  s.heap[--s.heap_max] = s.heap[1/*SMALLEST*/];

  /* At this point, the fields freq and dad are set. We can now
   * generate the bit lengths.
   */
  gen_bitlen(s, desc);

  /* The field len is now set, we can generate the bit codes */
  gen_codes(tree, max_code, s.bl_count);
}


/* ===========================================================================
 * Scan a literal or distance tree to determine the frequencies of the codes
 * in the bit length tree.
 */
function scan_tree(s, tree, max_code)
//    deflate_state *s;
//    ct_data *tree;   /* the tree to be scanned */
//    int max_code;    /* and its largest code of non zero frequency */
{
  var n;                     /* iterates over all tree elements */
  var prevlen = -1;          /* last emitted length */
  var curlen;                /* length of current code */

  var nextlen = tree[0*2 + 1]/*.Len*/; /* length of next code */

  var count = 0;             /* repeat count of the current code */
  var max_count = 7;         /* max repeat count */
  var min_count = 4;         /* min repeat count */

  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }
  tree[(max_code+1)*2 + 1]/*.Len*/ = 0xffff; /* guard */

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n+1)*2 + 1]/*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;

    } else if (count < min_count) {
      s.bl_tree[curlen * 2]/*.Freq*/ += count;

    } else if (curlen !== 0) {

      if (curlen !== prevlen) { s.bl_tree[curlen * 2]/*.Freq*/++; }
      s.bl_tree[REP_3_6*2]/*.Freq*/++;

    } else if (count <= 10) {
      s.bl_tree[REPZ_3_10*2]/*.Freq*/++;

    } else {
      s.bl_tree[REPZ_11_138*2]/*.Freq*/++;
    }

    count = 0;
    prevlen = curlen;

    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;

    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;

    } else {
      max_count = 7;
      min_count = 4;
    }
  }
}


/* ===========================================================================
 * Send a literal or distance tree in compressed form, using the codes in
 * bl_tree.
 */
function send_tree(s, tree, max_code)
//    deflate_state *s;
//    ct_data *tree; /* the tree to be scanned */
//    int max_code;       /* and its largest code of non zero frequency */
{
  var n;                     /* iterates over all tree elements */
  var prevlen = -1;          /* last emitted length */
  var curlen;                /* length of current code */

  var nextlen = tree[0*2 + 1]/*.Len*/; /* length of next code */

  var count = 0;             /* repeat count of the current code */
  var max_count = 7;         /* max repeat count */
  var min_count = 4;         /* min repeat count */

  /* tree[max_code+1].Len = -1; */  /* guard already set */
  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n+1)*2 + 1]/*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;

    } else if (count < min_count) {
      do { send_code(s, curlen, s.bl_tree); } while (--count !== 0);

    } else if (curlen !== 0) {
      if (curlen !== prevlen) {
        send_code(s, curlen, s.bl_tree);
        count--;
      }
      //Assert(count >= 3 && count <= 6, " 3_6?");
      send_code(s, REP_3_6, s.bl_tree);
      send_bits(s, count-3, 2);

    } else if (count <= 10) {
      send_code(s, REPZ_3_10, s.bl_tree);
      send_bits(s, count-3, 3);

    } else {
      send_code(s, REPZ_11_138, s.bl_tree);
      send_bits(s, count-11, 7);
    }

    count = 0;
    prevlen = curlen;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;

    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;

    } else {
      max_count = 7;
      min_count = 4;
    }
  }
}


/* ===========================================================================
 * Construct the Huffman tree for the bit lengths and return the index in
 * bl_order of the last bit length code to send.
 */
function build_bl_tree(s) {
  var max_blindex;  /* index of last bit length code of non zero freq */

  /* Determine the bit length frequencies for literal and distance trees */
  scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
  scan_tree(s, s.dyn_dtree, s.d_desc.max_code);

  /* Build the bit length tree: */
  build_tree(s, s.bl_desc);
  /* opt_len now includes the length of the tree representations, except
   * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.
   */

  /* Determine the number of bit length codes to send. The pkzip format
   * requires that at least 4 bit length codes be sent. (appnote.txt says
   * 3 but the actual value used is 4.)
   */
  for (max_blindex = BL_CODES-1; max_blindex >= 3; max_blindex--) {
    if (s.bl_tree[bl_order[max_blindex]*2 + 1]/*.Len*/ !== 0) {
      break;
    }
  }
  /* Update opt_len to include the bit length tree and counts */
  s.opt_len += 3*(max_blindex+1) + 5+5+4;
  //Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
  //        s->opt_len, s->static_len));

  return max_blindex;
}


/* ===========================================================================
 * Send the header for a block using dynamic Huffman trees: the counts, the
 * lengths of the bit length codes, the literal tree and the distance tree.
 * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
 */
function send_all_trees(s, lcodes, dcodes, blcodes)
//    deflate_state *s;
//    int lcodes, dcodes, blcodes; /* number of codes for each tree */
{
  var rank;                    /* index in bl_order */

  //Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
  //Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,
  //        "too many codes");
  //Tracev((stderr, "\nbl counts: "));
  send_bits(s, lcodes-257, 5); /* not +255 as stated in appnote.txt */
  send_bits(s, dcodes-1,   5);
  send_bits(s, blcodes-4,  4); /* not -3 as stated in appnote.txt */
  for (rank = 0; rank < blcodes; rank++) {
    //Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
    send_bits(s, s.bl_tree[bl_order[rank]*2 + 1]/*.Len*/, 3);
  }
  //Tracev((stderr, "\nbl tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_ltree, lcodes-1); /* literal tree */
  //Tracev((stderr, "\nlit tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_dtree, dcodes-1); /* distance tree */
  //Tracev((stderr, "\ndist tree: sent %ld", s->bits_sent));
}


/* ===========================================================================
 * Check if the data type is TEXT or BINARY, using the following algorithm:
 * - TEXT if the two conditions below are satisfied:
 *    a) There are no non-portable control characters belonging to the
 *       "black list" (0..6, 14..25, 28..31).
 *    b) There is at least one printable character belonging to the
 *       "white list" (9 {TAB}, 10 {LF}, 13 {CR}, 32..255).
 * - BINARY otherwise.
 * - The following partially-portable control characters form a
 *   "gray list" that is ignored in this detection algorithm:
 *   (7 {BEL}, 8 {BS}, 11 {VT}, 12 {FF}, 26 {SUB}, 27 {ESC}).
 * IN assertion: the fields Freq of dyn_ltree are set.
 */
function detect_data_type(s) {
  /* black_mask is the bit mask of black-listed bytes
   * set bits 0..6, 14..25, and 28..31
   * 0xf3ffc07f = binary 11110011111111111100000001111111
   */
  var black_mask = 0xf3ffc07f;
  var n;

  /* Check for non-textual ("black-listed") bytes. */
  for (n = 0; n <= 31; n++, black_mask >>>= 1) {
    if ((black_mask & 1) && (s.dyn_ltree[n*2]/*.Freq*/ !== 0)) {
      return Z_BINARY;
    }
  }

  /* Check for textual ("white-listed") bytes. */
  if (s.dyn_ltree[9 * 2]/*.Freq*/ !== 0 || s.dyn_ltree[10 * 2]/*.Freq*/ !== 0 ||
      s.dyn_ltree[13 * 2]/*.Freq*/ !== 0) {
    return Z_TEXT;
  }
  for (n = 32; n < LITERALS; n++) {
    if (s.dyn_ltree[n * 2]/*.Freq*/ !== 0) {
      return Z_TEXT;
    }
  }

  /* There are no "black-listed" or "white-listed" bytes:
   * this stream either is empty or has tolerated ("gray-listed") bytes only.
   */
  return Z_BINARY;
}


var static_init_done = false;

/* ===========================================================================
 * Initialize the tree data structures for a new zlib stream.
 */
function _tr_init(s)
{

  if (!static_init_done) {
    tr_static_init();
    static_init_done = true;
  }

  s.l_desc  = new TreeDesc(s.dyn_ltree, static_l_desc);
  s.d_desc  = new TreeDesc(s.dyn_dtree, static_d_desc);
  s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);

  s.bi_buf = 0;
  s.bi_valid = 0;

  /* Initialize the first block of the first file: */
  init_block(s);
}


/* ===========================================================================
 * Send a stored block
 */
function _tr_stored_block(s, buf, stored_len, last)
//DeflateState *s;
//charf *buf;       /* input block */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */
{
  send_bits(s, (STORED_BLOCK<<1)+(last ? 1 : 0), 3);    /* send block type */
  copy_block(s, buf, stored_len, true); /* with header */
}


/* ===========================================================================
 * Send one empty static block to give enough lookahead for inflate.
 * This takes 10 bits, of which 7 may remain in the bit buffer.
 */
function _tr_align(s) {
  send_bits(s, STATIC_TREES<<1, 3);
  send_code(s, END_BLOCK, static_ltree);
  bi_flush(s);
}


/* ===========================================================================
 * Determine the best encoding for the current block: dynamic trees, static
 * trees or store, and output the encoded block to the zip file.
 */
function _tr_flush_block(s, buf, stored_len, last)
//DeflateState *s;
//charf *buf;       /* input block, or NULL if too old */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */
{
  var opt_lenb, static_lenb;  /* opt_len and static_len in bytes */
  var max_blindex = 0;        /* index of last bit length code of non zero freq */

  /* Build the Huffman trees unless a stored block is forced */
  if (s.level > 0) {

    /* Check if the file is binary or text */
    if (s.strm.data_type === Z_UNKNOWN) {
      s.strm.data_type = detect_data_type(s);
    }

    /* Construct the literal and distance trees */
    build_tree(s, s.l_desc);
    // Tracev((stderr, "\nlit data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));

    build_tree(s, s.d_desc);
    // Tracev((stderr, "\ndist data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));
    /* At this point, opt_len and static_len are the total bit lengths of
     * the compressed block data, excluding the tree representations.
     */

    /* Build the bit length tree for the above two trees, and get the index
     * in bl_order of the last bit length code to send.
     */
    max_blindex = build_bl_tree(s);

    /* Determine the best encoding. Compute the block lengths in bytes. */
    opt_lenb = (s.opt_len+3+7) >>> 3;
    static_lenb = (s.static_len+3+7) >>> 3;

    // Tracev((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u ",
    //        opt_lenb, s->opt_len, static_lenb, s->static_len, stored_len,
    //        s->last_lit));

    if (static_lenb <= opt_lenb) { opt_lenb = static_lenb; }

  } else {
    // Assert(buf != (char*)0, "lost buf");
    opt_lenb = static_lenb = stored_len + 5; /* force a stored block */
  }

  if ((stored_len+4 <= opt_lenb) && (buf !== -1)) {
    /* 4: two words for the lengths */

    /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
     * Otherwise we can't have processed more than WSIZE input bytes since
     * the last block flush, because compression would have been
     * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
     * transform a block into a stored block.
     */
    _tr_stored_block(s, buf, stored_len, last);

  } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {

    send_bits(s, (STATIC_TREES<<1) + (last ? 1 : 0), 3);
    compress_block(s, static_ltree, static_dtree);

  } else {
    send_bits(s, (DYN_TREES<<1) + (last ? 1 : 0), 3);
    send_all_trees(s, s.l_desc.max_code+1, s.d_desc.max_code+1, max_blindex+1);
    compress_block(s, s.dyn_ltree, s.dyn_dtree);
  }
  // Assert (s->compressed_len == s->bits_sent, "bad compressed size");
  /* The above check is made mod 2^32, for files larger than 512 MB
   * and uLong implemented on 32 bits.
   */
  init_block(s);

  if (last) {
    bi_windup(s);
  }
  // Tracev((stderr,"\ncomprlen %lu(%lu) ", s->compressed_len>>3,
  //       s->compressed_len-7*last));
}

/* ===========================================================================
 * Save the match info and tally the frequency counts. Return true if
 * the current block must be flushed.
 */
function _tr_tally(s, dist, lc)
//    deflate_state *s;
//    unsigned dist;  /* distance of matched string */
//    unsigned lc;    /* match length-MIN_MATCH or unmatched char (if dist==0) */
{
  //var out_length, in_length, dcode;

  s.pending_buf[s.d_buf + s.last_lit * 2]     = (dist >>> 8) & 0xff;
  s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 0xff;

  s.pending_buf[s.l_buf + s.last_lit] = lc & 0xff;
  s.last_lit++;

  if (dist === 0) {
    /* lc is the unmatched char */
    s.dyn_ltree[lc*2]/*.Freq*/++;
  } else {
    s.matches++;
    /* Here, lc is the match length - MIN_MATCH */
    dist--;             /* dist = match distance - 1 */
    //Assert((ush)dist < (ush)MAX_DIST(s) &&
    //       (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&
    //       (ush)d_code(dist) < (ush)D_CODES,  "_tr_tally: bad match");

    s.dyn_ltree[(_length_code[lc]+LITERALS+1) * 2]/*.Freq*/++;
    s.dyn_dtree[d_code(dist) * 2]/*.Freq*/++;
  }

// (!) This block is disabled in zlib defailts,
// don't enable it for binary compatibility

//#ifdef TRUNCATE_BLOCK
//  /* Try to guess if it is profitable to stop the current block here */
//  if ((s.last_lit & 0x1fff) === 0 && s.level > 2) {
//    /* Compute an upper bound for the compressed length */
//    out_length = s.last_lit*8;
//    in_length = s.strstart - s.block_start;
//
//    for (dcode = 0; dcode < D_CODES; dcode++) {
//      out_length += s.dyn_dtree[dcode*2]/*.Freq*/ * (5 + extra_dbits[dcode]);
//    }
//    out_length >>>= 3;
//    //Tracev((stderr,"\nlast_lit %u, in %ld, out ~%ld(%ld%%) ",
//    //       s->last_lit, in_length, out_length,
//    //       100L - out_length*100L/in_length));
//    if (s.matches < (s.last_lit>>1)/*int /2*/ && out_length < (in_length>>1)/*int /2*/) {
//      return true;
//    }
//  }
//#endif

  return (s.last_lit === s.lit_bufsize-1);
  /* We avoid equality with lit_bufsize because of wraparound at 64K
   * on 16 bit machines and because stored blocks are restricted to
   * 64K-1 bytes.
   */
}

exports._tr_init  = _tr_init;
exports._tr_stored_block = _tr_stored_block;
exports._tr_flush_block  = _tr_flush_block;
exports._tr_tally = _tr_tally;
exports._tr_align = _tr_align;
},{"../utils/common":27}],39:[function(_dereq_,module,exports){
'use strict';


function ZStream() {
  /* next input byte */
  this.input = null; // JS specific, because we have no pointers
  this.next_in = 0;
  /* number of bytes available at input */
  this.avail_in = 0;
  /* total number of input bytes read so far */
  this.total_in = 0;
  /* next output byte should be put there */
  this.output = null; // JS specific, because we have no pointers
  this.next_out = 0;
  /* remaining free space at output */
  this.avail_out = 0;
  /* total number of bytes output so far */
  this.total_out = 0;
  /* last error message, NULL if no error */
  this.msg = ''/*Z_NULL*/;
  /* not visible by applications */
  this.state = null;
  /* best guess about the data type: binary or text */
  this.data_type = 2/*Z_UNKNOWN*/;
  /* adler32 value of the uncompressed data */
  this.adler = 0;
}

module.exports = ZStream;
},{}]},{},[9])
(9)
}));
	
var current_codepage = 1200,
	current_ansi = 1252,
	VALID_ANSI = [874, 932, 936, 949, 950, 1250, 1251, 1252, 1253, 1254, 1255, 1256, 1257, 1258],
	/* ECMA-376 Part I 18.4.1 charset to codepage mapping */
	CS2CP = {
		0:    1252, /* ANSI */
		1:   65001, /* DEFAULT */
		2:   65001, /* SYMBOL */
		77:  10000, /* MAC */
		128:   932, /* SHIFTJIS */
		129:   949, /* HANGUL */
		130:  1361, /* JOHAB */
		134:   936, /* GB2312 */
		136:   950, /* CHINESEBIG5 */
		161:  1253, /* GREEK */
		162:  1254, /* TURKISH */
		163:  1258, /* VIETNAMESE */
		177:  1255, /* HEBREW */
		178:  1256, /* ARABIC */
		186:  1257, /* BALTIC */
		204:  1251, /* RUSSIAN */
		222:   874, /* THAI */
		238:  1250, /* EASTEUROPE */
		255:  1252, /* OEM */
		69:   6969  /* MISC */
	};

function set_ansi(cp) {
	if (VALID_ANSI.indexOf(cp) == -1) return;
	current_ansi = CS2CP[0] = cp;
}

function reset_ansi() {
	set_ansi(1252);
}

function set_cp(cp) {
	current_codepage = cp;
	set_ansi(cp);
}

function reset_cp() {
	set_cp(1200);
	reset_ansi();
}

function debom(data) {
	var c1 = data.charCodeAt(0),
		c2 = data.charCodeAt(1);
	if(c1 == 0xFF && c2 == 0xFE) return utf16leread(data.slice(2));
	if(c1 == 0xFE && c2 == 0xFF) return utf16beread(data.slice(2));
	if(c1 == 0xFEFF) return data.slice(1);
	return data;
};

	
var chr0 = /\u0000/g,
	chr1 = /[\u0001-\u0006]/g;

function bconcat(bufs) {
	return [].concat.apply([], bufs);
}

function new_raw_buf(len) {
	return new Array(len);
}

function new_unsafe_buf(len) {
	return new Array(len);
}

function s2a(s) {
	return s.split("").map(x => x.charCodeAt(0) & 0xff);
};

function s2ab(s) {
	var sl = s.length,
		buf = new ArrayBuffer(sl),
		view = new Uint8Array(buf);
	for (var i=0; i!=sl; ++i) {
		view[i] = s.charCodeAt(i) & 0xFF;
	}
	return buf;
}

function ab2a(data) {
	if (data instanceof ArrayBuffer) {
		return ab2a(new Uint8Array(data));
	}
	var i = 0,
		il = data.length,
		o = new Array(il);
	for (; i<il; ++i) {
		o[i] = data[i];
	}
	return o;
}

	
var SSF = {},
	make_ssf = function make_ssf(SSF) {

		SSF.version = "0.11.2";

		function _strrev(x) {
			var o = "",
				i = x.length-1;
			while (i>=0) o += x.charAt(i--);
			return o;
		}

		function fill(c, l) {
			var o = "";
			while (o.length < l) o+=c;
			return o;
		}

		function pad0(v, d) {
			var t = ""+ v;
			return t.length >= d ? t : fill("0", d - t.length) + t;
		}

		function pad_(v, d) {
			var t = ""+ v;
			return t.length >= d ? t : fill(" ", d - t.length) + t;
		}

		function rpad_(v, d) {
			var t = ""+ v;
			return t.length >= d ? t : t + fill(" ", d - t.length);
		}

		function pad0r1(v, d) {
			var t = ""+ Math.round(v);
			return t.length >= d ? t : fill("0", d - t.length) + t;
		}

		function pad0r2(v, d) {
			var t = ""+ v;
			return t.length >= d ? t : fill("0", d - t.length) + t;
		}

		var p2_32 = Math.pow(2, 32);

		function pad0r(v, d) {
			if (v > p2_32 || v < -p2_32) return pad0r1(v, d);
			var i = Math.round(v);
			return pad0r2(i,d);
		}

		function isgeneral(s, i) {
			i = i || 0;
			return s.length >= 7 + i
					&& (s.charCodeAt(i) | 32) === 103
					&& (s.charCodeAt(i + 1) | 32) === 101
					&& (s.charCodeAt(i + 2) | 32) === 110
					&& (s.charCodeAt(i + 3) | 32) === 101
					&& (s.charCodeAt(i + 4) | 32) === 114
					&& (s.charCodeAt(i + 5) | 32) === 97
					&& (s.charCodeAt(i + 6) | 32) === 108;
		}

		var days = [
				["Sun", "Sunday"],
				["Mon", "Monday"],
				["Tue", "Tuesday"],
				["Wed", "Wednesday"],
				["Thu", "Thursday"],
				["Fri", "Friday"],
				["Sat", "Saturday"]
			],
			months = [
				["J", "Jan", "January"],
				["F", "Feb", "February"],
				["M", "Mar", "March"],
				["A", "Apr", "April"],
				["M", "May", "May"],
				["J", "Jun", "June"],
				["J", "Jul", "July"],
				["A", "Aug", "August"],
				["S", "Sep", "September"],
				["O", "Oct", "October"],
				["N", "Nov", "November"],
				["D", "Dec", "December"]
			];

		function init_table(t) {
			t[0]  = "General";
			t[1]  = "0";
			t[2]  = "0.00";
			t[3]  = "#,##0";
			t[4]  = "#,##0.00";
			t[9]  = "0%";
			t[10] = "0.00%";
			t[11] = "0.00E+00";
			t[12] = "# ?/?";
			t[13] = "# ??/??";
			t[14] = "m/d/yy";
			t[15] = "d-mmm-yy";
			t[16] = "d-mmm";
			t[17] = "mmm-yy";
			t[18] = "h:mm AM/PM";
			t[19] = "h:mm:ss AM/PM";
			t[20] = "h:mm";
			t[21] = "h:mm:ss";
			t[22] = "m/d/yy h:mm";
			t[37] = "#,##0 ;(#,##0)";
			t[38] = "#,##0 ;[Red](#,##0)";
			t[39] = "#,##0.00;(#,##0.00)";
			t[40] = "#,##0.00;[Red](#,##0.00)";
			t[45] = "mm:ss";
			t[46] = "[h]:mm:ss";
			t[47] = "mmss.0";
			t[48] = "##0.0E+0";
			t[49] = "@";
			t[56] = '"上午/下午 "hh"時"mm"分"ss"秒 "';
		}

		var table_fmt = {};

		init_table(table_fmt);

		/* These formats appear to default to other formats in the table */
		var default_map = [],
			defi = 0;

		//  5 -> 37 ...  8 -> 40
		for(defi = 5; defi <= 8; ++defi) default_map[defi] = 32 + defi;
		// 23 ->  0 ... 26 ->  0
		for(defi = 23; defi <= 26; ++defi) default_map[defi] = 0;
		// 27 -> 14 ... 31 -> 14
		for(defi = 27; defi <= 31; ++defi) default_map[defi] = 14;
		// 50 -> 14 ... 58 -> 14
		for(defi = 50; defi <= 58; ++defi) default_map[defi] = 14;
		// 59 ->  1 ... 62 ->  4
		for(defi = 59; defi <= 62; ++defi) default_map[defi] = defi - 58;
		// 67 ->  9 ... 68 -> 10
		for(defi = 67; defi <= 68; ++defi) default_map[defi] = defi - 58;
		// 72 -> 14 ... 75 -> 17
		for(defi = 72; defi <= 75; ++defi) default_map[defi] = defi - 58;
		// 69 -> 12 ... 71 -> 14
		for(defi = 67; defi <= 68; ++defi) default_map[defi] = defi - 57;
		// 76 -> 20 ... 78 -> 22
		for(defi = 76; defi <= 78; ++defi) default_map[defi] = defi - 56;
		// 79 -> 45 ... 81 -> 47
		for(defi = 79; defi <= 81; ++defi) default_map[defi] = defi - 34;

		// 82 ->  0 ... 65536 -> 0 (omitted)

		/* These formats technically refer to Accounting formats with no equivalent */
		var default_str = [];

		//  5 -- Currency,   0 decimal, black negative
		default_str[5] = default_str[63] = '"$"#,##0_);\\("$"#,##0\\)';
		//  6 -- Currency,   0 decimal, red   negative
		default_str[6] = default_str[64] = '"$"#,##0_);[Red]\\("$"#,##0\\)';
		//  7 -- Currency,   2 decimal, black negative
		default_str[7] = default_str[65] = '"$"#,##0.00_);\\("$"#,##0.00\\)';
		//  8 -- Currency,   2 decimal, red   negative
		default_str[8] = default_str[66] = '"$"#,##0.00_);[Red]\\("$"#,##0.00\\)';
		// 41 -- Accounting, 0 decimal, No Symbol
		default_str[41] = '_(* #,##0_);_(* \\(#,##0\\);_(* "-"_);_(@_)';
		// 42 -- Accounting, 0 decimal, $  Symbol
		default_str[42] = '_("$"* #,##0_);_("$"* \\(#,##0\\);_("$"* "-"_);_(@_)';
		// 43 -- Accounting, 2 decimal, No Symbol
		default_str[43] = '_(* #,##0.00_);_(* \\(#,##0.00\\);_(* "-"??_);_(@_)';
		// 44 -- Accounting, 2 decimal, $  Symbol
		default_str[44] = '_("$"* #,##0.00_);_("$"* \\(#,##0.00\\);_("$"* "-"??_);_(@_)';

		function frac(x, D, mixed) {
			var sgn = x < 0 ? -1 : 1,
				B = x * sgn,
				P_2 = 0, P_1 = 1, P = 0,
				Q_2 = 1, Q_1 = 0, Q = 0,
				A = Math.floor(B);
			while (Q_1 < D) {
				A = Math.floor(B);
				P = A * P_1 + P_2;
				Q = A * Q_1 + Q_2;
				if ((B - A) < 0.00000005) break;
				B = 1 / (B - A);
				P_2 = P_1; P_1 = P;
				Q_2 = Q_1; Q_1 = Q;
			}
			if (Q > D) {
				if (Q_1 > D) {
					Q = Q_2;
					P = P_2;
				} else {
					Q = Q_1;
					P = P_1;
				}
			}
			if (!mixed) return [0, sgn * P, Q];
			var q = Math.floor(sgn * P/Q);

			return [q, sgn*P - q*Q, Q];
		}

		function parse_date_code(v, opts, b2) {
			if (v > 2958465 || v < 0) return null;
			var date = (v | 0),
				time = Math.floor(86400 * (v - date)),
				dow = 0,
				dout = [],
				out = {
					D: date,
					T: time,
					u: 86400 * (v - date) - time,
					y: 0,
					m: 0,
					d: 0,
					H: 0,
					M: 0,
					S: 0,
					q: 0
				};
			if (Math.abs(out.u) < 1e-6) out.u = 0;
			if (opts && opts.date1904) date += 1462;

			if (out.u > 0.9999) {
				out.u = 0;
				if (++time == 86400) {
					out.T = time = 0;
					++date;
					++out.D;
				}
			}
			if (date === 60) {
				dout = b2 ? [1317, 10, 29] : [1900, 2, 29];
				dow = 3;
			} else if (date === 0) {
				dout = b2 ? [1317, 8, 29] : [1900, 1, 0];
				dow = 6;
			} else {
				if (date > 60) --date;
				/* 1 = Jan 1 1900 in Gregorian */
				var d = new Date(1900, 0, 1);
				d.setDate(d.getDate() + date - 1);
				dout = [d.getFullYear(), d.getMonth() + 1, d.getDate()];
				dow = d.getDay();

				if (date < 60) dow = (dow + 6) % 7;
				if (b2) dow = fix_hijri(d, dout);
			}
			out.y = dout[0];
			out.m = dout[1];
			out.d = dout[2];
			out.S = time % 60;
			time = Math.floor(time / 60);
			out.M = time % 60;
			time = Math.floor(time / 60);
			out.H = time;
			out.q = dow;

			return out;
		}

		var basedate = new Date(1899, 11, 31, 0, 0, 0),
			dnthresh = basedate.getTime(),
			base1904 = new Date(1900, 2, 1, 0, 0, 0);

		function datenum_local(v, date1904) {
			var epoch = v.getTime();
			if (date1904) epoch -= 1461 * 24 * 60 * 60 * 1000;
			else if (v >= base1904) epoch += 24 * 60 * 60 * 1000;

			return (epoch - (dnthresh + (v.getTimezoneOffset() - basedate.getTimezoneOffset()) * 60000)) / (24 * 60 * 60 * 1000);
		}

		/* The longest 32-bit integer text is "-4294967296", exactly 11 chars */
		function general_fmt_int(v) {
			return v.toString(10);
		}
		
		/* ECMA-376 18.8.30 numFmt*/
		/* Note: `toPrecision` uses standard form when prec > E and E >= -6 */
		var general_fmt_num = (function make_general_fmt_num() {
			var trailing_zeroes_and_decimal = /(?:\.0*|(\.\d*[1-9])0+)$/,
				mantissa_zeroes_and_decimal = /(?:\.0*|(\.\d*[1-9])0+)[Ee]/,
				exp_with_single_digit = /(E[+-])(\d)$/;
			
			function strip_decimal(o) {
				return (o.indexOf(".") == -1) ? o : o.replace(trailing_zeroes_and_decimal, "$1");
			}

			/* General Exponential always shows 2 digits exp and trims the mantissa */
			function normalize_exp(o) {
				if (o.indexOf("E") == -1) return o;
				return o.replace(mantissa_zeroes_and_decimal, "$1E").replace(exp_with_single_digit, "$10$2");
			}

			/* exponent >= -9 and <= 9 */
			function small_exp(v) {
				var w = (v<0?12:11);
				var o = strip_decimal(v.toFixed(12)); if (o.length <= w) return o;
				o = v.toPrecision(10);
				if (o.length <= w) return o;
				return v.toExponential(5);
			}

			/* exponent >= 11 or <= -10 likely exponential */
			function large_exp(v) {
				var o = strip_decimal(v.toFixed(11));
				return (o.length > (v < 0 ? 12 : 11) || o === "0" || o === "-0") ? v.toPrecision(6) : o;
			}

			function general_fmt_num_base(v) {
				var V = Math.floor(Math.log(Math.abs(v)) * Math.LOG10E),
					o;

				if (V >= -4 && V <= -1) o = v.toPrecision(10 + V);
				else if (Math.abs(V) <= 9) o = small_exp(v);
				else if (V === 10) o = v.toFixed(10).substr(0, 12);
				else o = large_exp(v);

				return strip_decimal(normalize_exp(o.toUpperCase()));
			}

			return general_fmt_num_base;
		})();

		/*
			"General" rules:
			- text is passed through ("@")
			- booleans are rendered as TRUE/FALSE
			- "up to 11 characters" displayed for numbers
			- Default date format (code 14) used for Dates

			TODO: technically the display depends on the width of the cell
		*/
		function general_fmt(v, opts) {
			switch (typeof v) {
				case "string": return v;
				case "boolean": return v ? "TRUE" : "FALSE";
				case "number": return (v|0) === v ? v.toString(10) : general_fmt_num(v);
				case "undefined": return "";
				case "object":
					if (v == null) return "";
					if (v instanceof Date) {
						return format(14, datenum_local(v, opts && opts.date1904), opts);
					}
			}
			throw new Error(`unsupported value in General format: ${v}`);
		}

		function fix_hijri(date, o) {
			/* TODO: properly adjust y/m/d and  */
			o[0] -= 581;
			var dow = date.getDay();
			if (date < 60) dow = (dow + 6) % 7;
			return dow;
		}

		/*jshint -W086 */
		function write_date(type, fmt, val, ss0) {
			var o = "",
				ss = 0,
				tt = 0,
				y = val.y,
				out,
				outl = 0;
			switch (type) {
				case 98: /* 'b' buddhist year */
					y = val.y + 543;
					/* falls through */
				case 121: /* 'y' year */
					switch (fmt.length) {
						case 1:
						case 2:
							out = y % 100;
							outl = 2;
							break;
						default:
							out = y % 10000;
							outl = 4;
					}
					break;
				case 109: /* 'm' month */
					switch (fmt.length) {
						case 1:
						case 2:
							out = val.m;
							outl = fmt.length;
							break;
						case 3: return months[val.m-1][1];
						case 5: return months[val.m-1][0];
						default: return months[val.m-1][2];
					}
					break;
				case 100: /* 'd' day */
					switch (fmt.length) {
						case 1:
						case 2:
							out = val.d;
							outl = fmt.length;
							break;
						case 3: return days[val.q][0];
						default: return days[val.q][1];
					}
					break;
				case 104: /* 'h' 12-hour */
					switch (fmt.length) {
						case 1:
						case 2:
							out = 1 + (val.H + 11) % 12;
							outl = fmt.length;
							break;
						default:
							throw `bad hour format: ${fmt}`;
					}
					break;
				case 72: /* 'H' 24-hour */
					switch (fmt.length) {
						case 1:
						case 2:
							out = val.H;
							outl = fmt.length;
							break;
						default:
							throw `bad hour format: ${fmt}`;
					}
					break;
				case 77: /* 'M' minutes */
					switch (fmt.length) {
						case 1:
						case 2:
							out = val.M;
							outl = fmt.length;
							break;
						default:
							throw `bad minute format: ${fmt}`;
					}
					break;
				case 115: /* 's' seconds */
					if (fmt != "s" && fmt != "ss" && fmt != ".0" && fmt != ".00" && fmt != ".000") {
						throw `bad second format: ${fmt}`;
					}
					if (val.u === 0 && (fmt == "s" || fmt == "ss")) {
						return pad0(val.S, fmt.length);
					}
					if (ss0 >= 2) {
						tt = ss0 === 3 ? 1000 : 100;
					} else {
						tt = ss0 === 1 ? 10 : 1;
					}
					ss = Math.round((tt) * (val.S + val.u));

					if (ss >= 60 * tt) ss = 0;
					if (fmt === "s") return ss === 0 ? "0" : ""+ ss/tt;
					o = pad0(ss, 2 + ss0);
					if (fmt === "ss") return o.substr(0, 2);
					return "." + o.substr(2, fmt.length - 1);
				case 90: /* "Z" absolute time */
					switch (fmt) {
						case '[h]':
						case '[hh]':
							out = val.D * 24 + val.H;
							break;
						case '[m]':
						case '[mm]':
							out = (val.D * 24 + val.H) * 60 + val.M;
							break;
						case '[s]':
						case '[ss]':
							out = ((val.D * 24 + val.H) * 60 + val.M) * 60 + Math.round(val.S + val.u);
							break;
						default:
							throw `bad abstime format: ${fmt}`;
					}
					outl = fmt.length === 3 ? 1 : 2;
					break;
				case 101: /* 'e' era */
					out = y;
					outl = 1;
					break;
			}

			return outl > 0 ? pad0(out, outl) : "";
		}

		/*jshint +W086 */
		function commaify(s) {
			var w = 3;
			if (s.length <= w) return s;
			var j = (s.length % w), o = s.substr(0,j);
			for(; j!=s.length; j+=w) o+=(o.length > 0 ? "," : "") + s.substr(j,w);
			return o;
		}
		
		var write_num = (function make_write_num() {

			var pct1 = /%/g,
				frac1 = /# (\?+)( ?)\/( ?)(\d+)/,
				dec1 = /^#*0*\.([0#]+)/,
				closeparen = /\).*[0#]/,
				phone = /\(###\) ###\\?-####/;

			function write_num_pct(type, fmt, val) {
				var sfmt = fmt.replace(pct1, ""),
					mul = fmt.length - sfmt.length;
				return write_num(type, sfmt, val * Math.pow(10, 2 * mul)) + fill("%", mul);
			}

			function write_num_cm(type, fmt, val) {
				var idx = fmt.length - 1;
				while (fmt.charCodeAt(idx-1) === 44) --idx;
				return write_num(type, fmt.substr(0, idx), val / Math.pow(10, 3 * (fmt.length - idx)));
			}

			function write_num_exp(fmt, val) {
				var o,
					idx = fmt.indexOf("E") - fmt.indexOf(".") - 1;
				if (fmt.match(/^#+0.0E\+0$/)) {
					if (val == 0) return "0.0E+0";
					else if (val < 0) return "-"+ write_num_exp(fmt, -val);
					
					var period = fmt.indexOf(".");
					if (period === -1) period = fmt.indexOf("E");
					var ee = Math.floor(Math.log(val) * Math.LOG10E) % period;
					
					if (ee < 0) ee += period;
					o = (val / Math.pow(10, ee)).toPrecision(idx + 1 + (period + ee) % period);
					
					if (o.indexOf("e") === -1) {
						var fakee = Math.floor(Math.log(val) * Math.LOG10E);
						if (o.indexOf(".") === -1) {
							o = o.charAt(0) +"."+ o.substr(1) +"E+"+ (fakee - o.length + ee);
						} else {
							o += "E+"+ (fakee - ee);
						}
						while (o.substr(0,2) === "0.") {
							o = o.charAt(0) + o.substr(2, period) +"."+ o.substr(2 + period);
							o = o.replace(/^0+([1-9])/, "$1").replace(/^0+\./, "0.");
						}
						o = o.replace(/\+-/, "-");
					}
					o = o.replace(/^([+-]?)(\d*)\.(\d*)[Ee]/, ($$, $1, $2, $3) =>
						$1 + $2 + $3.substr(0, (period + ee) % period) +"."+ $3.substr(ee) +"E");
				} else {
					o = val.toExponential(idx);
				}
				if (fmt.match(/E\+00$/) && o.match(/e[+-]\d$/)) {
					o = o.substr(0, o.length - 1) +"0"+ o.charAt(o.length - 1);
				}
				if (fmt.match(/E\-/) && o.match(/e\+/)) {
					o = o.replace(/e\+/, "e");
				}
				return o.replace("e", "E");
			}

			function write_num_f1(r, aval, sign) {
				var den = parseInt(r[4], 10),
					rr = Math.round(aval * den),
					base = Math.floor(rr / den),
					myn = (rr - base * den),
					myd = den;
				return sign + (base === 0 ? "" : ""+ base) +" "+ (myn === 0 ? fill(" ", r[1].length + 1 + r[4].length) : pad_(myn,r[1].length) + r[2] +"/"+ r[3] + pad0(myd, r[4].length));
			}

			function write_num_f2(r, aval, sign) {
				return sign + (aval === 0 ? "" : ""+ aval) + fill(" ", r[1].length + 2 + r[4].length);
			}

			function hashq(str) {
				var o = "",
					cc;
				for(var i=0; i!=str.length; ++i) {
					switch ((cc=str.charCodeAt(i))) {
						case 35: break;
						case 63: o+= " "; break;
						case 48: o+= "0"; break;
						default: o+= String.fromCharCode(cc);
					}
				}
				return o;
			}

			function rnd(val, d) {
				var dd = Math.pow(10, d);
				return ""+ (Math.round(val * dd) / dd);
			}
			
			function dec(val, d) {
				var _frac = val - Math.floor(val),
					dd = Math.pow(10, d);
				if (d < ("" + Math.round(_frac * dd)).length) return 0;
				return Math.round(_frac * dd);
			}
			
			function carry(val, d) {
				return d < ("" + Math.round((val - Math.floor(val)) * Math.pow(10, d))).length ? 1 : 0;
			}
			
			function flr(val) {
				if (val < 2147483647 && val > -2147483648) return ""+ (val >= 0 ? (val | 0) : (val - 1 | 0));
				return ""+ Math.floor(val);
			}
		
			function write_num_flt(type, fmt, val) {
				if (type.charCodeAt(0) === 40 && !fmt.match(closeparen)) {
					var ffmt = fmt.replace(/\( */, "").replace(/ \)/, "").replace(/\)/, "");
					if (val >= 0) return write_num_flt("n", ffmt, val);
					return "("+ write_num_flt("n", ffmt, -val) +")";
				}
				if (fmt.charCodeAt(fmt.length - 1) === 44) return write_num_cm(type, fmt, val);
				if (fmt.indexOf("%") !== -1) return write_num_pct(type, fmt, val);
				if (fmt.indexOf("E") !== -1) return write_num_exp(fmt, val);
				if (fmt.charCodeAt(0) === 36) return "$"+ write_num_flt(type, fmt.substr(fmt.charAt(1) == " " ? 2 : 1), val);
				var o,
					r,
					ri,
					ff,
					aval = Math.abs(val),
					sign = val < 0 ? "-" : "";
				
				if (fmt.match(/^00+$/)) return sign + pad0r(aval, fmt.length);
				if (fmt.match(/^[#?]+$/)) {
					o = pad0r(val, 0);
					if (o === "0") o = "";
					return o.length > fmt.length ? o : hashq(fmt.substr(0, fmt.length - o.length)) + o;
				}
				if ((r = fmt.match(frac1))) return write_num_f1(r, aval, sign);
				if (fmt.match(/^#+0+$/)) return sign + pad0r(aval, fmt.length - fmt.indexOf("0"));
				if ((r = fmt.match(dec1))) {
					o = rnd(val, r[1].length).replace(/^([^\.]+)$/, "$1."+ hashq(r[1])).replace(/\.$/, "."+ hashq(r[1])).replace(/\.(\d*)$/, ($$, $1) => "."+ $1 + fill("0", hashq(r[1]).length - $1.length));
					return fmt.indexOf("0.") !== -1 ? o : o.replace(/^0\./, ".");
				}
				fmt = fmt.replace(/^#+([0.])/, "$1");
				if ((r = fmt.match(/^(0*)\.(#*)$/))) {
					return sign + rnd(aval, r[2].length).replace(/\.(\d*[1-9])0*$/, ".$1").replace(/^(-?\d*)$/, "$1.").replace(/^0\./, r[1].length ? "0." : ".");
				}
				if ((r = fmt.match(/^#{1,3},##0(\.?)$/))) return sign + commaify(pad0r(aval, 0));
				if ((r = fmt.match(/^#,##0\.([#0]*0)$/))) {
					return val < 0 ? "-"+ write_num_flt(type, fmt, -val) : commaify(""+ (Math.floor(val) + carry(val, r[1].length))) +"."+ pad0(dec(val, r[1].length), r[1].length);
				}
				if ((r = fmt.match(/^#,#*,#0/))) return write_num_flt(type, fmt.replace(/^#,#*,/, ""), val);
				if ((r = fmt.match(/^([0#]+)(\\?-([0#]+))+$/))) {
					o = _strrev(write_num_flt(type, fmt.replace(/[\\-]/g,""), val));
					ri = 0;
					return _strrev(_strrev(fmt.replace(/\\/g, "")).replace(/[0#]/g, x => ri < o.length ? o.charAt(ri++) : x === "0" ? "0" : ""));
				}
				if (fmt.match(phone)) {
					o = write_num_flt(type, "##########", val);
					return "("+ o.substr(0, 3) +") "+ o.substr(3, 3) +"-"+ o.substr(6);
				}
				var oa = "";
				if ((r = fmt.match(/^([#0?]+)( ?)\/( ?)([#0?]+)/))) {
					ri = Math.min(r[4].length, 7);
					ff = frac(aval, Math.pow(10, ri)-1, false);
					o = ""+ sign;
					oa = write_num("n", r[1], ff[1]);
					if (oa.charAt(oa.length-1) == " ") oa = oa.substr(0, oa.length-1) +"0";
					o += oa + r[2] +"/"+ r[3];
					oa = rpad_(ff[2], ri);
					if (oa.length < r[4].length) oa = hashq(r[4].substr(r[4].length - oa.length)) + oa;
					o += oa;
					return o;
				}
				if ((r = fmt.match(/^# ([#0?]+)( ?)\/( ?)([#0?]+)/))) {
					ri = Math.min(Math.max(r[1].length, r[4].length), 7);
					ff = frac(aval, Math.pow(10, ri) - 1, true);
					return sign + (ff[0] || (ff[1] ? "" : "0")) +" "+ (ff[1] ? pad_(ff[1], ri) + r[2] +"/"+ r[3] + rpad_(ff[2], ri) : fill(" ", 2 * ri + 1 + r[2].length + r[3].length));
				}
				if ((r = fmt.match(/^[#0?]+$/))) {
					o = pad0r(val, 0);
					if (fmt.length <= o.length) return o;
					return hashq(fmt.substr(0, fmt.length - o.length)) + o;
				}
				if ((r = fmt.match(/^([#0?]+)\.([#0]+)$/))) {
					o = ""+ val.toFixed(Math.min(r[2].length, 10)).replace(/([^0])0+$/, "$1");
					ri = o.indexOf(".");
					var lres = fmt.indexOf(".") - ri,
						rres = fmt.length - o.length - lres;
					return hashq(fmt.substr(0, lres) + o + fmt.substr(fmt.length - rres));
				}
				if ((r = fmt.match(/^00,000\.([#0]*0)$/))) {
					ri = dec(val, r[1].length);
					return val < 0 ? "-"+ write_num_flt(type, fmt, -val) : commaify(flr(val)).replace(/^\d,\d{3}$/, "0$&").replace(/^\d*$/, $$ => "00,"+ ($$.length < 3 ? pad0(0, 3-$$.length) : "") + $$) +"."+ pad0(ri, r[1].length);
				}
				switch (fmt) {
					case "###,##0.00": return write_num_flt(type, "#,##0.00", val);
					case "###,###":
					case "##,###":
					case "#,###":
						var x = commaify(pad0r(aval, 0));
						return x !== "0" ? sign + x : "";
					case "###,###.00": return write_num_flt(type, "###,##0.00",val).replace(/^0\./, ".");
					case "#,###.00": return write_num_flt(type, "#,##0.00",val).replace(/^0\./, ".");
				}
				throw new Error(`unsupported format |${fmt}|`);
			}

			function write_num_cm2(type, fmt, val){
				var idx = fmt.length - 1;
				while (fmt.charCodeAt(idx - 1) === 44) --idx;
				return write_num(type, fmt.substr(0, idx), val / Math.pow(10, 3 * (fmt.length - idx)));
			}

			function write_num_pct2(type, fmt, val){
				var sfmt = fmt.replace(pct1, ""),
					mul = fmt.length - sfmt.length;
				return write_num(type, sfmt, val * Math.pow(10 , 2 * mul)) + fill("%", mul);
			}

			function write_num_exp2(fmt, val){
				var o,
					idx = fmt.indexOf("E") - fmt.indexOf(".") - 1;
				if (fmt.match(/^#+0.0E\+0$/)) {
					if (val == 0) return "0.0E+0";
					else if (val < 0) return "-" + write_num_exp2(fmt, -val);
					
					var period = fmt.indexOf(".");
					if (period === -1) period = fmt.indexOf("E");

					var ee = Math.floor(Math.log(val) * Math.LOG10E) % period;
					if (ee < 0) ee += period;

					o = (val / Math.pow(10, ee)).toPrecision(idx + 1 + (period + ee) % period);
					if (!o.match(/[Ee]/)) {
						var fakee = Math.floor(Math.log(val) * Math.LOG10E);
						if (o.indexOf(".") === -1) o = o.charAt(0) +"."+ o.substr(1) +"E+"+ (fakee - o.length + ee);
						else o += "E+"+ (fakee - ee);
						o = o.replace(/\+-/,"-");
					}
					o = o.replace(/^([+-]?)(\d*)\.(\d*)[Ee]/, ($$,$1,$2,$3) => $1 + $2 + $3.substr(0, (period + ee) % period) +"."+ $3.substr(ee) +"E");
				} else {
					o = val.toExponential(idx);
				}
				if (fmt.match(/E\+00$/) && o.match(/e[+-]\d$/)) o = o.substr(0, o.length - 1) +"0"+ o.charAt(o.length - 1);
				if (fmt.match(/E\-/) && o.match(/e\+/)) o = o.replace(/e\+/, "e");
				return o.replace("e", "E");
			}

			function write_num_int(type, fmt, val) {
				if (type.charCodeAt(0) === 40 && !fmt.match(closeparen)) {
					var ffmt = fmt.replace(/\( */, "").replace(/ \)/, "").replace(/\)/, "");
					if (val >= 0) return write_num_int("n", ffmt, val);
					return "("+ write_num_int("n", ffmt, -val) +")";
				}
				if (fmt.charCodeAt(fmt.length - 1) === 44) {
					return write_num_cm2(type, fmt, val);
				}
				if (fmt.indexOf("%") !== -1) {
					return write_num_pct2(type, fmt, val);
				}
				if (fmt.indexOf("E") !== -1) {
					return write_num_exp2(fmt, val);
				}
				if (fmt.charCodeAt(0) === 36) {
					return "$"+ write_num_int(type, fmt.substr(fmt.charAt(1) == " " ? 2 : 1), val);
				}
				var o,
					r,
					ri,
					ff,
					aval = Math.abs(val),
					sign = val < 0 ? "-" : "";
				
				if (fmt.match(/^00+$/)) {
					return sign + pad0(aval, fmt.length);
				}
				if (fmt.match(/^[#?]+$/)) {
					o = (""+val);
					if (val === 0) o = "";
					return o.length > fmt.length ? o : hashq(fmt.substr(0, fmt.length - o.length)) + o;
				}
				if ((r = fmt.match(frac1))) {
					return write_num_f2(r, aval, sign);
				}
				if (fmt.match(/^#+0+$/)) {
					return sign + pad0(aval, fmt.length - fmt.indexOf("0"));
				}
				if ((r = fmt.match(dec1))) {
					/*:: if (!Array.isArray(r)) throw new Error("unreachable"); */
					o = (""+ val).replace(/^([^\.]+)$/, "$1."+ hashq(r[1])).replace(/\.$/, "."+ hashq(r[1]));
					o = o.replace(/\.(\d*)$/,function($$, $1) {
						/*:: if (!Array.isArray(r)) throw new Error("unreachable"); */
						return "."+ $1 + fill("0", hashq(r[1]).length - $1.length);
					});
					return fmt.indexOf("0.") !== -1 ? o : o.replace(/^0\./, ".");
				}
				fmt = fmt.replace(/^#+([0.])/, "$1");
				if ((r = fmt.match(/^(0*)\.(#*)$/))) {
					return sign + (""+ aval).replace(/\.(\d*[1-9])0*$/, ".$1").replace(/^(-?\d*)$/, "$1.").replace(/^0\./, r[1].length ? "0." : ".");
				}
				if ((r = fmt.match(/^#{1,3},##0(\.?)$/))) {
					return sign + commaify((""+ aval));
				}
				if ((r = fmt.match(/^#,##0\.([#0]*0)$/))) {
					return val < 0 ? "-"+ write_num_int(type, fmt, -val) : commaify((""+ val)) +"."+ fill("0", r[1].length);
				}
				if ((r = fmt.match(/^#,#*,#0/))) {
					return write_num_int(type, fmt.replace(/^#,#*,/, ""), val);
				}
				if ((r = fmt.match(/^([0#]+)(\\?-([0#]+))+$/))) {
					o = _strrev(write_num_int(type, fmt.replace(/[\\-]/g,""), val));
					ri = 0;
					return _strrev(_strrev(fmt.replace(/\\/g, "")).replace(/[0#]/g, x => ri < o.length ? o.charAt(ri++) : x === "0" ? "0" : ""));
				}
				if (fmt.match(phone)) {
					o = write_num_int(type, "##########", val);
					return "(" + o.substr(0,3) +") "+ o.substr(3, 3) +"-"+ o.substr(6);
				}
				var oa = "";
				if ((r = fmt.match(/^([#0?]+)( ?)\/( ?)([#0?]+)/))) {
					ri = Math.min(r[4].length, 7);
					ff = frac(aval, Math.pow(10, ri) - 1, false);
					o = ""+ sign;
					oa = write_num("n", r[1], ff[1]);
					if (oa.charAt(oa.length-1) == " ") oa = oa.substr(0, oa.length - 1) +"0";
					o += oa + r[2] +"/"+ r[3];
					oa = rpad_(ff[2], ri);
					if (oa.length < r[4].length) oa = hashq(r[4].substr(r[4].length - oa.length)) + oa;
					o += oa;
					return o;
				}
				if ((r = fmt.match(/^# ([#0?]+)( ?)\/( ?)([#0?]+)/))) {
					ri = Math.min(Math.max(r[1].length, r[4].length), 7);
					ff = frac(aval, Math.pow(10, ri) - 1, true);
					return sign + (ff[0] || (ff[1] ? "" : "0")) +" "+ (ff[1] ? pad_(ff[1], ri) + r[2] +"/"+ r[3] + rpad_(ff[2], ri) : fill(" ", 2 * ri + 1 + r[2].length + r[3].length));
				}
				if ((r = fmt.match(/^[#0?]+$/))) {
					o = ""+ val;
					if (fmt.length <= o.length) return o;
					return hashq(fmt.substr(0, fmt.length - o.length)) + o;
				}
				if ((r = fmt.match(/^([#0]+)\.([#0]+)$/))) {
					o = ""+ val.toFixed(Math.min(r[2].length, 10)).replace(/([^0])0+$/, "$1");
					ri = o.indexOf(".");
					var lres = fmt.indexOf(".") - ri,
						rres = fmt.length - o.length - lres;
					return hashq(fmt.substr(0, lres) + o + fmt.substr(fmt.length - rres));
				}
				if ((r = fmt.match(/^00,000\.([#0]*0)$/))) {
					return val < 0 ? "-"+ write_num_int(type, fmt, -val) : commaify(""+ val).replace(/^\d,\d{3}$/, "0$&").replace(/^\d*$/, $$ => "00,"+ ($$.length < 3 ? pad0(0,3 - $$.length) : "") + $$) +"."+ pad0(0, r[1].length);
				}
				switch (fmt) {
					case "###,###":
					case "##,###":
					case "#,###":
						var x = commaify(""+ aval);
						return x !== "0" ? sign + x : "";
					default:
						if (fmt.match(/\.[0#?]*$/)) {
							return write_num_int(type, fmt.slice(0, fmt.lastIndexOf(".")), val) + hashq(fmt.slice(fmt.lastIndexOf(".")));
						}
				}
				throw new Error(`unsupported format |${fmt}|`);
			}

			return function write_num(type, fmt, val) {
				return (val|0) === val ? write_num_int(type, fmt, val) : write_num_flt(type, fmt, val);
			};

		})();
		
		function split_fmt(fmt) {
			var out = [],
				in_str = false;
			for(var i=0, j=0; i<fmt.length; ++i) {
				switch (fmt.charCodeAt(i)) {
					case 34:
						in_str = !in_str;
						break;
					case 95:
					case 42:
					case 92: /* '_' '*' '\\' */
						++i;
						break;
					case 59: /* ';' */
						out[out.length] = fmt.substr(j, i-j);
						j = i + 1;
				}
			}
			out[out.length] = fmt.substr(j);
			if (in_str === true) {
				throw new Error(`Format |${fmt}| unterminated string`);
			}
			return out;
		}

		var abstime = /\[[HhMmSs\u0E0A\u0E19\u0E17]*\]/;

		function fmt_is_date(fmt) {
			var i = 0,
				c = "",
				o = "";
			while (i < fmt.length) {
				switch ((c = fmt.charAt(i))) {
					case "G":
						if (isgeneral(fmt, i)) i+= 6;
						i++;
						break;
					case '"':
						for(;(fmt.charCodeAt(++i)) !== 34 && i < fmt.length;) {}
						++i;
						break;
					case "\\":
						i += 2;
						break;
					case "_":
						i += 2;
						break;
					case "@":
						++i;
						break;
					case "B":
					case "b":
						if (fmt.charAt(i + 1) === "1" || fmt.charAt(i+1) === "2") return true;
						/* falls through */
					case "M":
					case "D":
					case "Y":
					case "H":
					case "S":
					case "E":
						/* falls through */
					case "m":
					case "d":
					case "y":
					case "h":
					case "s":
					case "e":
					case "g":
						return true;
					case "A":
					case "a":
					case "上":
						if (fmt.substr(i, 3).toUpperCase() === "A/P") return true;
						if (fmt.substr(i, 5).toUpperCase() === "AM/PM") return true;
						if (fmt.substr(i, 5).toUpperCase() === "上午/下午") return true;
						++i;
						break;
					case "[":
						o = c;
						while (fmt.charAt(i++) !== "]" && i < fmt.length) o += fmt.charAt(i);
						if (o.match(abstime)) return true;
						break;
					case ".":
						/* falls through */
					case "0":
					case "#":
						while (i < fmt.length && ("0#?.,E+-%".indexOf(c = fmt.charAt(++i)) > -1 || (c == "\\" && fmt.charAt(i + 1) == "-" && "0#".indexOf(fmt.charAt(i + 2)) > -1))){}
						break;
					case "?":
						while (fmt.charAt(++i) === c){}
							break;
					case "*":
						++i;
						if (fmt.charAt(i) == " " || fmt.charAt(i) == "*") ++i;
						break;
					case "(":
					case ")":
						++i;
						break;
					case "1":
					case "2":
					case "3":
					case "4":
					case "5":
					case "6":
					case "7":
					case "8":
					case "9":
						while (i < fmt.length && "0123456789".indexOf(fmt.charAt(++i)) > -1){}
						break;
					case " ":
						++i;
						break;
					default:
						++i;
						break;
				}
			}
			return false;
		}
		
		function eval_fmt(fmt, v, opts, flen) {
			var out = [],
				o = "",
				i = 0,
				c = "",
				lst = "t",
				dt,
				j,
				cc,
				hr = "H";
			/* Tokenize */
			while (i < fmt.length) {
				switch ((c = fmt.charAt(i))) {
					case "G": /* General */
						if (!isgeneral(fmt, i)) {
							throw new Error(`unrecognized character ${c} in ${fmt}`);
						}
						out[out.length] = { t: "G", v: "General" };
						i+=7;
						break;
					case '"': /* Literal text */
						for (o=""; (cc=fmt.charCodeAt(++i)) !== 34 && i < fmt.length;) o += String.fromCharCode(cc);
						out[out.length] = { t: "t", v: o };
						++i;
						break;
					case "\\":
						var w = fmt.charAt(++i),
							t = (w === "(" || w === ")") ? w : "t";
						out[out.length] = { t: t, v: w };
						++i;
						break;
					case "_":
						out[out.length] = { t: "t", v: " " };
						i += 2;
						break;
					case "@": /* Text Placeholder */
						out[out.length] = { t: "T", v: v };
						++i;
						break;
					case "B":
					case "b":
						if (fmt.charAt(i + 1) === "1" || fmt.charAt(i + 1) === "2") {
							if (dt == null) {
								dt = parse_date_code(v, opts, fmt.charAt(i + 1) === "2");
								if (dt == null) return "";
							}
							out[out.length] = { t: "X", v: fmt.substr(i, 2) };
							lst = c;
							i += 2;
							break;
						}
						/* falls through */
					case "M":
					case "D":
					case "Y":
					case "H":
					case "S":
					case "E":
						c = c.toLowerCase();
						/* falls through */
					case "m":
					case "d":
					case "y":
					case "h":
					case "s":
					case "e":
					case "g":
						if (v < 0) return "";
						if (dt == null) {
							dt = parse_date_code(v, opts);
							if (dt == null) return "";
						}
						o = c;
						while (++i < fmt.length && fmt.charAt(i).toLowerCase() === c) o+=c;
						if (c === "m" && lst.toLowerCase() === "h") c = "M";
						if (c === "h") c = hr;
						out[out.length] = { t: c, v: o };
						lst = c;
						break;
					case "A":
					case "a":
					case "上":
						var q = { t: c, v: c };
						if (dt == null) dt = parse_date_code(v, opts);
						if (fmt.substr(i, 3).toUpperCase() === "A/P") {
							if (dt != null) q.v = dt.H >= 12 ? "P" : "A";
							q.t = "T";
							hr = "h";
							i += 3;
						} else if (fmt.substr(i, 5).toUpperCase() === "AM/PM") {
							if (dt != null) q.v = dt.H >= 12 ? "PM" : "AM";
							q.t = "T";
							i += 5;
							hr = "h";
						} else if (fmt.substr(i, 5).toUpperCase() === "上午/下午") {
							if (dt != null) q.v = dt.H >= 12 ? "下午" : "上午";
							q.t = "T";
							i += 5;
							hr = "h";
						} else {
							q.t = "t";
							++i;
						}
						if (dt == null && q.t === "T") return "";
						out[out.length] = q;
						lst = c;
						break;
					case "[":
						o = c;
						while (fmt.charAt(i++) !== "]" && i < fmt.length) o += fmt.charAt(i);
						if (o.slice(-1) !== "]") throw `unterminated "[" block: |${o}|`;
						if (o.match(abstime)) {
							if (dt == null) {
								dt = parse_date_code(v, opts);
								if (dt == null) return "";
							}
							out[out.length] = { t: "Z", v: o.toLowerCase() };
							lst = o.charAt(1);
						} else if (o.indexOf("$") > -1) {
							o = (o.match(/\$([^-\[\]]*)/) || [])[1] || "$";
							if (!fmt_is_date(fmt)) out[out.length] = { t: "t", v: o };
						}
						break;
					/* Numbers */
					case ".":
						if (dt != null) {
							o = c; while (++i < fmt.length && (c=fmt.charAt(i)) === "0") o += c;
							out[out.length] = {t:"s", v:o}; break;
						}
						/* falls through */
					case "0":
					case "#":
						o = c; while (++i < fmt.length && "0#?.,E+-%".indexOf(c=fmt.charAt(i)) > -1) o += c;
						out[out.length] = { t: "n", v: o };
						break;
					case "?":
						o = c; while (fmt.charAt(++i) === c) o+=c;
						out[out.length] = { t: c, v: o };
						lst = c;
						break;
					case "*":
						++i;
						if (fmt.charAt(i) == " " || fmt.charAt(i) == "*") ++i;
						break;
					case "(":
					case ")":
						out[out.length] = { t: (flen === 1 ? "t": c), v: c };
						++i;
						break;
					case "1":
					case "2":
					case "3":
					case "4":
					case "5":
					case "6":
					case "7":
					case "8":
					case "9":
						o = c;
						while (i < fmt.length && "0123456789".indexOf(fmt.charAt(++i)) > -1) o += fmt.charAt(i);
						out[out.length] = { t: "D", v: o };
						break;
					case " ":
						out[out.length] = { t: c, v: c };
						++i;
						break;
					case "$":
						out[out.length] = { t: "t", v: "$" };
						++i;
						break;
					default:
						if (",$-+/():!^&'~{}<>=€acfijklopqrtuvwxzP".indexOf(c) === -1) {
							throw new Error(`unrecognized character ${c} in ${fmt}`);
						}
						out[out.length] = { t: "t", v: c };
						++i;
						break;
				}
			}

			/* Scan for date/time parts */
			var bt = 0,
				ss0 = 0,
				ssm;
			for (i=out.length-1, lst="t"; i >= 0; --i) {
				switch (out[i].t) {
					case "h":
					case "H":
						out[i].t = hr;
						lst = "h";
						if (bt < 1) bt = 1;
						break;
					case "s":
						if ((ssm=out[i].v.match(/\.0+$/))) ss0 = Math.max(ss0, ssm[0].length - 1);
						if (bt < 3) bt = 3;
					/* falls through */
					case "d":
					case "y":
					case "M":
					case "e":
						lst = out[i].t;
						break;
					case "m":
						if (lst === "s") {
							out[i].t = "M";
							if (bt < 2) bt = 2;
						}
						break;
					case "X": /*if (out[i].v === "B2");*/
						break;
					case "Z":
						if (bt < 1 && out[i].v.match(/[Hh]/)) bt = 1;
						if (bt < 2 && out[i].v.match(/[Mm]/)) bt = 2;
						if (bt < 3 && out[i].v.match(/[Ss]/)) bt = 3;
				}
			}
			/* time rounding depends on presence of minute / second / usec fields */
			switch (bt) {
				case 0:
					break;
				case 1:
					/*::if (!dt) break;*/
					if (dt.u >= 0.5) {
						dt.u = 0;
						++dt.S;
					}
					if (dt.S >=  60) {
						dt.S = 0;
						++dt.M;
					}
					if (dt.M >=  60) {
						dt.M = 0;
						++dt.H;
					}
					break;
				case 2:
					/*::if (!dt) break;*/
					if (dt.u >= 0.5) {
						dt.u = 0;
						++dt.S;
					}
					if (dt.S >=  60) {
						dt.S = 0;
						++dt.M;
					}
					break;
			}

			/* replace fields */
			var nstr = "",
				jj;
			for(i=0; i<out.length; ++i) {
				switch (out[i].t) {
					case "t":
					case "T":
					case " ":
					case "D":
						break;
					case "X":
						out[i].v = "";
						out[i].t = ";";
						break;
					case "d":
					case "m":
					case "y":
					case "h":
					case "H":
					case "M":
					case "s":
					case "e":
					case "b":
					case "Z":
						/*::if (!dt) throw "unreachable"; */
						out[i].v = write_date(out[i].t.charCodeAt(0), out[i].v, dt, ss0);
						out[i].t = "t";
						break;
					case "n":
					case "?":
						jj = i+1;
						while (out[jj] != null && (
							(c=out[jj].t) === "?" || c === "D" ||
							((c === " " || c === "t") && out[jj + 1] != null && (out[jj + 1].t === "?" || out[jj + 1].t === "t" && out[jj + 1].v === "/")) ||
							(out[i].t === "(" && (c === " " || c === "n" || c === ")")) ||
							(c === "t" && (out[jj].v === "/" || out[jj].v === " " && out[jj + 1] != null && out[jj + 1].t == "?"))
						)) {
							out[i].v += out[jj].v;
							out[jj] = { v: "", t: ";" };
							++jj;
						}
						nstr += out[i].v;
						i = jj-1;
						break;
					case "G":
						out[i].t = "t";
						out[i].v = general_fmt(v, opts);
						break;
				}
			}
			var vv = "",
				myv,
				ostr;
			if (nstr.length > 0) {
				if (nstr.charCodeAt(0) == 40) {
					myv = (v < 0 && nstr.charCodeAt(0) === 45 ? -v : v);
					ostr = write_num("n", nstr, myv);
				} else {
					myv = (v<0 && flen > 1 ? -v : v);
					ostr = write_num("n", nstr, myv);
					if (myv < 0 && out[0] && out[0].t == "t") {
						ostr = ostr.substr(1);
						out[0].v = "-"+ out[0].v;
					}
				}
				jj = ostr.length - 1;
				var decpt = out.length;
				for(i=0; i < out.length; ++i) {
					if (out[i] != null && out[i].t != "t" && out[i].v.indexOf(".") > -1) {
						decpt = i;
						break;
					}
				}
				var lasti = out.length;
				if (decpt === out.length && ostr.indexOf("E") === -1) {
					for(i=out.length-1; i>= 0;--i) {
						if (out[i] == null || "n?".indexOf(out[i].t) === -1) continue;
						if (jj >= out[i].v.length - 1) {
							jj -= out[i].v.length;
							out[i].v = ostr.substr(jj + 1, out[i].v.length);
						} else if (jj < 0) {
							out[i].v = "";
						} else {
							out[i].v = ostr.substr(0, jj + 1);
							jj = -1;
						}
						out[i].t = "t";
						lasti = i;
					}
					if (jj >= 0 && lasti < out.length) {
						out[lasti].v = ostr.substr(0, jj + 1) + out[lasti].v;
					}
				} else if (decpt !== out.length && ostr.indexOf("E") === -1) {
					jj = ostr.indexOf(".") - 1;
					for(i=decpt; i>= 0; --i) {
						if (out[i] == null || "n?".indexOf(out[i].t) === -1) continue;
						j = out[i].v.indexOf(".") > -1 && i === decpt ? out[i].v.indexOf(".") - 1 : out[i].v.length - 1;
						vv = out[i].v.substr(j + 1);
						for(; j>=0; --j) {
							if (jj >= 0 && (out[i].v.charAt(j) === "0" || out[i].v.charAt(j) === "#")) vv = ostr.charAt(jj--) + vv;
						}
						out[i].v = vv;
						out[i].t = "t";
						lasti = i;
					}
					if (jj >= 0 && lasti < out.length) out[lasti].v = ostr.substr(0, jj + 1) + out[lasti].v;
					jj = ostr.indexOf(".") + 1;
					for (i=decpt; i<out.length; ++i) {
						if (out[i] == null || ("n?(".indexOf(out[i].t) === -1 && i !== decpt)) continue;
						j = out[i].v.indexOf(".") > -1 && i === decpt ? out[i].v.indexOf(".") + 1 : 0;
						vv = out[i].v.substr(0, j);
						for(; j<out[i].v.length; ++j) {
							if (jj < ostr.length) vv += ostr.charAt(jj++);
						}
						out[i].v = vv;
						out[i].t = "t";
						lasti = i;
					}
				}
			}
			for(i=0; i<out.length; ++i) {
				if (out[i] != null && "n?".indexOf(out[i].t) > -1) {
					myv = (flen > 1 && v < 0 && i > 0 && out[i-1].v === "-" ? -v : v);
					out[i].v = write_num(out[i].t, out[i].v, myv);
					out[i].t = "t";
				}
			}
			var retval = "";
			for(i=0; i !== out.length; ++i) {
				if (out[i] != null) retval += out[i].v;
			}
			return retval;
		}
		
		var cfregex = /\[[=<>]/,
			cfregex2 = /\[(=|>[=]?|<[>=]?)(-?\d+(?:\.\d*)?)\]/;

		function chkcond(v, rr) {
			if (rr == null) return false;
			var thresh = parseFloat(rr[2]);
			switch (rr[1]) {
				case "=":  if (v == thresh) return true; break;
				case ">":  if (v >  thresh) return true; break;
				case "<":  if (v <  thresh) return true; break;
				case "<>": if (v != thresh) return true; break;
				case ">=": if (v >= thresh) return true; break;
				case "<=": if (v <= thresh) return true; break;
			}
			return false;
		}

		function choose_fmt(f, v) {
			var fmt = split_fmt(f),
				l = fmt.length,
				lat = fmt[l - 1].indexOf("@");

			if (l<4 && lat>-1) --l;
			if (fmt.length > 4) {
				throw new Error(`cannot find right format for |${fmt.join("|")}|`);
			}
			if (typeof v !== "number") {
				return [4, fmt.length === 4 || lat > -1 ? fmt[fmt.length - 1] : "@"];
			}
			
			switch (fmt.length) {
				case 1: fmt = lat>-1 ? ["General", "General", "General", fmt[0]] : [fmt[0], fmt[0], fmt[0], "@"]; break;
				case 2: fmt = lat>-1 ? [fmt[0], fmt[0], fmt[0], fmt[1]] : [fmt[0], fmt[1], fmt[0], "@"]; break;
				case 3: fmt = lat>-1 ? [fmt[0], fmt[1], fmt[0], fmt[2]] : [fmt[0], fmt[1], fmt[2], "@"]; break;
				case 4: break;
			}

			var ff = v > 0 ? fmt[0] : v < 0 ? fmt[1] : fmt[2];

			if (fmt[0].indexOf("[") === -1 && fmt[1].indexOf("[") === -1) return [l, ff];
			if (fmt[0].match(cfregex) != null || fmt[1].match(cfregex) != null) {
				var m1 = fmt[0].match(cfregex2),
					m2 = fmt[1].match(cfregex2);
				return chkcond(v, m1) ? [l, fmt[0]] : chkcond(v, m2) ? [l, fmt[1]] : [l, fmt[m1 != null && m2 != null ? 2 : 1]];
			}
			return [l, ff];
		}

		function format(fmt, v, o) {
			if (o == null) o = {};
			var sfmt = "";
			switch (typeof fmt) {
				case "string":
					if (fmt == "m/d/yy" && o.dateNF) sfmt = o.dateNF;
					else sfmt = fmt;
					break;
				case "number":
					if (fmt == 14 && o.dateNF) sfmt = o.dateNF;
					else sfmt = (o.table != null ? o.table : table_fmt)[fmt];
					if (sfmt == null) sfmt = (o.table && o.table[default_map[fmt]]) || table_fmt[default_map[fmt]];
					if (sfmt == null) sfmt = default_str[fmt] || "General";
					break;
			}
			if (isgeneral(sfmt,0)) return general_fmt(v, o);
			if (v instanceof Date) v = datenum_local(v, o.date1904);
			
			var f = choose_fmt(sfmt, v);
			if (isgeneral(f[1])) return general_fmt(v, o);
			
			if (v === true) v = "TRUE";
			else if (v === false) v = "FALSE";
			else if (v === "" || v == null) return "";

			return eval_fmt(f[1], v, o, f[0]);
		}

		function load_entry(fmt, idx) {
			if (typeof idx != "number") {
				idx = +idx || -1;
				/*::if (typeof idx != "number") return 0x188; */
				for(var i=0; i<0x0188; ++i) {
				/*::if (typeof idx != "number") return 0x188; */
					if (table_fmt[i] == undefined) {
						if (idx < 0) idx = i;
						continue;
					}
					if (table_fmt[i] == fmt) {
						idx = i;
						break;
					}
				}
				/*::if (typeof idx != "number") return 0x188; */
				if (idx < 0) idx = 0x187;
			}
			/*::if (typeof idx != "number") return 0x188; */
			table_fmt[idx] = fmt;
			return idx;
		}

		SSF.parse_date_code = parse_date_code;
		SSF._general_int = general_fmt_int;
		SSF._general_num = general_fmt_num;
		SSF._general = general_fmt;
		SSF._split = split_fmt;
		SSF.is_date = fmt_is_date;
		SSF._eval = eval_fmt;
		SSF.load = load_entry;
		SSF._table = table_fmt;

		SSF.get_table = () => table_fmt;
		SSF.load_table = tbl => {
			for(var i=0; i!=0x0188; ++i) {
				if (tbl[i] !== undefined) load_entry(tbl[i], i);
			}
		};

		SSF.init_table = init_table;
		SSF.format = format;
	};

make_ssf(SSF);

	
function keys(o) {
	var ks = Object.keys(o),
		o2 = [];
	for (var i=0, il=ks.length; i<il; ++i) {
		if (Object.prototype.hasOwnProperty.call(o, ks[i])) o2.push(ks[i]);
	}
	return o2;
}

function evert_key(obj, key) {
	var o = [],
		K = keys(obj);
	for (var i=0; i!==K.length; ++i) {
		if (o[obj[K[i]][key]] == null) o[obj[K[i]][key]] = K[i];
	}
	return o;
}

function evert(obj) {
	var o = [],
		K = keys(obj);
	for (var i=0; i!==K.length; ++i) {
		o[obj[K[i]]] = K[i];
	}
	return o;
}

function evert_num(obj) {
	var o = [],
		K = keys(obj);
	for (var i=0; i!==K.length; ++i) {
		o[obj[K[i]]] = parseInt(K[i], 10);
	}
	return o;
}

function evert_arr(obj) {
	var o = [],
		K = keys(obj);
	for (var i=0; i!==K.length; ++i) {
		if (o[obj[K[i]]] == null) o[obj[K[i]]] = [];
		o[obj[K[i]]].push(K[i]);
	}
	return o;
}

var basedate = new Date(1899, 11, 30, 0, 0, 0), // 2209161600000
	refdate = new Date(),
	dnthresh = basedate.getTime() + (refdate.getTimezoneOffset() - basedate.getTimezoneOffset()) * 60000,
	refoffset = refdate.getTimezoneOffset();

function datenum(v, date1904) {
	var epoch = v.getTime(),
		d = 24 * 60 * 60 * 1000;
	if (date1904) epoch -= 1462 * d;
	var dnthresh = basedate.getTime() + (v.getTimezoneOffset() - basedate.getTimezoneOffset()) * 60000;
	return (epoch - dnthresh) / d;
}

function numdate(v) {
	var out = new Date();
	out.setTime(v * 24 * 60 * 60 * 1000 + dnthresh);
	if (out.getTimezoneOffset() !== refoffset) {
		out.setTime(out.getTime() + (out.getTimezoneOffset() - refoffset) * 60000);
	}
	return out;
}

/* ISO 8601 Duration */
function parse_isodur(s) {
	var sec = 0,
		mt = 0,
		time = false,
		m = s.match(/P([0-9\.]+Y)?([0-9\.]+M)?([0-9\.]+D)?T([0-9\.]+H)?([0-9\.]+M)?([0-9\.]+S)?/);
	if (!m) {
		throw new Error(`|${s}| is not an ISO8601 Duration`);
	}
	for (var i=1; i!=m.length; ++i) {
		if (!m[i]) continue;
		mt = 1;
		if (i > 3) time = true;
		switch(m[i].slice(m[i].length-1)) {
			case "Y":
				throw new Error("Unsupported ISO Duration Field: " + m[i].slice(m[i].length-1));
			case "D": mt *= 24;
				/* falls through */
			case "H": mt *= 60;
				/* falls through */
			case "M":
				if (!time) throw new Error("Unsupported ISO Duration Field: M");
				else mt *= 60;
				/* falls through */
			case "S": break;
		}
		sec += mt * parseInt(m[i], 10);
	}
	return sec;
}

var good_pd_date = new Date("2017-02-19T19:06:09.000Z");
if (isNaN(good_pd_date.getFullYear())) good_pd_date = new Date("2/19/17");
var good_pd = good_pd_date.getFullYear() == 2017;

/* parses a date as a local date */
function parseDate(str, fixdate) {
	var d = new Date(str);
	if (good_pd) {
		/*:: if(fixdate == null) fixdate = 0; */
		if (fixdate > 0) d.setTime(d.getTime() + d.getTimezoneOffset() * 60 * 1000);
		else if(fixdate < 0) d.setTime(d.getTime() - d.getTimezoneOffset() * 60 * 1000);
		return d;
	}
	if (str instanceof Date) return str;
	if (good_pd_date.getFullYear() == 1917 && !isNaN(d.getFullYear())) {
		var s = d.getFullYear();
		if (str.indexOf(""+ s) > -1) return d;
		d.setFullYear(d.getFullYear() + 100); return d;
	}
	var n = str.match(/\d+/g) || ["2017","2","19","0","0","0"],
		out = new Date(+n[0], +n[1] - 1, +n[2], (+n[3]||0), (+n[4]||0), (+n[5]||0));
	if (str.indexOf("Z") > -1) {
		out = new Date(out.getTime() - out.getTimezoneOffset() * 60 * 1000);
	}
	return out;
}

function cc2str(arr) {
	var o = "";
	for (var i=0; i!=arr.length; ++i) {
		o += String.fromCharCode(arr[i]);
	}
	return o;
}

function dup(o) {
	if (typeof JSON != "undefined" && !Array.isArray(o)) return JSON.parse(JSON.stringify(o));
	if (typeof o != "object" || o == null) return o;
	if (o instanceof Date) return new Date(o.getTime());
	var out = {};
	for (var k in o) {
		if (Object.prototype.hasOwnProperty.call(o, k)) out[k] = dup(o[k]);
	}
	return out;
}

function fill(c, l) {
	var o = "";
	while (o.length < l) o += c;
	return o;
}

/* TODO: stress test */
function fuzzynum(s) {
	var v = Number(s);
	if (!isNaN(v)) return v;
	if (!/\d/.test(s)) return v;
	var wt = 1,
		ss = s.replace(/([\d]),([\d])/g, "$1$2")
				.replace(/[$]/g, "")
				.replace(/[%]/g, () => { wt *= 100; return ""; });
	if (!isNaN(v = Number(ss))) return v / wt;
	ss = ss.replace(/[(](.*)[)]/, function($$, $1) { wt = -wt; return $1;});
	if (!isNaN(v = Number(ss))) return v / wt;
	return v;
}

function fuzzydate(s) {
	var o = new Date(s),
		n = new Date(NaN),
		y = o.getYear(),
		m = o.getMonth(),
		d = o.getDate();
	if (isNaN(d)) return n;
	if (y < 0 || y > 8099) return n;
	if ((m > 0 || d > 1) && y != 101) return o;
	if (s.toLowerCase().match(/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/)) return o;
	if (s.match(/[^-0-9:,\/\\]/)) return n;
	return o;
}

var safe_split_regex = "abacaba".split(/(:?b)/i).length == 5;

function split_regex(str, re, def) {
	if (safe_split_regex || typeof re == "string") return str.split(re);
	var p = str.split(re), o = [p[0]];
	for (var i=1; i<p.length; ++i) {
		o.push(def);
		o.push(p[i]);
	}
	return o;
}

	
function getdatastr(data) {
	if (!data) return null;
	if (data.data) return debom(data.data);
	if (data.asBinary) return debom(data.asBinary());
	if (data._data && data._data.getContent) return debom(cc2str(Array.prototype.slice.call(data._data.getContent(), 0)));
	if (data.content && data.type) return debom(cc2str(data.content));
	return null;
}

function getdatabin(data) {
	if (!data) return null;
	if (data.data) return char_codes(data.data);
	if (data._data && data._data.getContent) {
		var o = data._data.getContent();
		if (typeof o == "string") return char_codes(o);
		return Array.prototype.slice.call(o);
	}
	if (data.content && data.type) return data.content;
	return null;
}

function getdata(data) {
	return (data && data.name.slice(-4) === ".bin") ? getdatabin(data) : getdatastr(data);
}

/* Part 2 Section 10.1.2 "Mapping Content Types" Names are case-insensitive */
/* OASIS does not comment on filename case sensitivity */
function safegetzipfile(zip, file) {
	var k = zip.FullPaths || keys(zip.files),
		f = file.toLowerCase(),
		g = f.replace(/\//g, "\\");
	for(var i=0; i<k.length; ++i) {
		var n = k[i].toLowerCase();
		if (f == n || g == n) return zip.files[k[i]];
	}
	return null;
}

function getzipfile(zip, file) {
	var o = safegetzipfile(zip, file);
	if (o == null) throw new Error(`Cannot find file ${file} in zip`);
	return o;
}

function getzipdata(zip, file, safe) {
	if (!safe) return getdata(getzipfile(zip, file));
	if (!file) return null;
	try {
		return getzipdata(zip, file);
	} catch(e) {
		return null;
	}
}

function getzipstr(zip, file, safe) {
	if (!safe) return getdatastr(getzipfile(zip, file));
	if (!file) return null;
	try {
		return getzipstr(zip, file);
	} catch(e) {
		return null;
	}
}

function zipentries(zip) {
	var k = zip.FullPaths || keys(zip.files),
		o = [];
	for(var i=0; i<k.length; ++i) {
		if (k[i].slice(-1) != "/") o.push(k[i]);
	}
	return o.sort();
}

// function zip_add_file(zip, path, content) {
// 	if (zip.FullPaths) CFB.utils.cfb_add(zip, path, content);
// 	else zip.file(path, content);
// }

var jszip;
if (typeof JSZipSync !== "undefined") jszip = JSZipSync;



function zip_read(d, o) {
	var zip;
	if (jszip) {
		switch(o.type) {
			case "base64": zip = new jszip(d, { base64:true }); break;
			case "binary":
			case "array": zip = new jszip(d, { base64:false }); break;
			case "buffer": zip = new jszip(d); break;
			default: throw new Error("Unrecognized type " + o.type);
		}
	} else {
		switch(o.type) {
			case "base64": zip = CFB.read(d, { type: "base64" }); break;
			case "binary": zip = CFB.read(d, { type: "binary" }); break;
			case "buffer":
			case "array": zip = CFB.read(d, { type: "buffer" }); break;
			default: throw new Error("Unrecognized type " + o.type);
		}
	}
	return zip;
}

function resolve_path(path, base) {
	if (path.charAt(0) == "/") return path.slice(1);
	var result = base.split("/");
	if (base.slice(-1) != "/") result.pop(); // folder path
	var target = path.split("/");
	while (target.length !== 0) {
		var step = target.shift();
		if (step === "..") result.pop();
		else if (step !== ".") result.push(step);
	}
	return result.join("/");
}

	
var XML_HEADER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n',
	attregexg = /([^"\s?>\/]+)\s*=\s*((?:")([^"]*)(?:")|(?:')([^']*)(?:')|([^'">\s]+))/g,
	tagregex = /<[\/\?]?[a-zA-Z0-9:_-]+(?:\s+[^"\s?>\/]+\s*=\s*(?:"[^"]*"|'[^']*'|[^'">\s=]+))*\s*[\/\?]?>/mg,
	nsregex = /<\w*:/,
	nsregex2 = /<(\/?)\w+:/,
	encodings = {
		"&quot;" : '"',
		"&apos;" : "'",
		"&gt;"   : '>',
		"&lt;"   : '<',
		"&amp;"  : '&'
	},
	rencoding = evert(encodings),
	vtvregex = /<\/?(?:vt:)?variant>/g,
	vtmregex = /<(?:vt:)([^>]*)>([\s\S]*)</,
	wtregex = /(^\s|\s$|\n)/,
	XMLNS = {
		"dc": "http://purl.org/dc/elements/1.1/",
		"dcterms": "http://purl.org/dc/terms/",
		"dcmitype": "http://purl.org/dc/dcmitype/",
		"mx": "http://schemas.microsoft.com/office/mac/excel/2008/main",
		"r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
		"sjs": "http://schemas.openxmlformats.org/package/2006/sheetjs/core-properties",
		"vt": "http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes",
		"xsi": "http://www.w3.org/2001/XMLSchema-instance",
		"xsd": "http://www.w3.org/2001/XMLSchema",
		"x14ac": "http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac",
		"mc": "http://schemas.openxmlformats.org/markup-compatibility/2006",
	},
	XLMLNS = {
		"o":    "urn:schemas-microsoft-com:office:office",
		"x":    "urn:schemas-microsoft-com:office:excel",
		"ss":   "urn:schemas-microsoft-com:office:spreadsheet",
		"dt":   "uuid:C2F41010-65B3-11d1-A29F-00AA00C14882",
		"mv":   "http://macVmlSchemaUri",
		"v":    "urn:schemas-microsoft-com:vml",
		"html": "http://www.w3.org/TR/REC-html40"
	};

XMLNS.main = [
		"http://schemas.openxmlformats.org/spreadsheetml/2006/main",
		"http://purl.oclc.org/ooxml/spreadsheetml/main",
		"http://schemas.microsoft.com/office/excel/2006/main",
		"http://schemas.microsoft.com/office/excel/2006/2"
	];

function parsexmltag(tag, skip_root, skip_LC) {
	var z = {},
		eq = 0,
		c = 0;
	for (; eq !== tag.length; ++eq) {
		if ((c = tag.charCodeAt(eq)) === 32 || c === 10 || c === 13) break;
	}
	if (!skip_root) z[0] = tag.slice(0, eq);
	if (eq === tag.length) return z;

	var m = tag.match(attregexg),
		j = 0,
		v = "",
		i = 0,
		q = "",
		cc = "",
		quot = 1;
	if (m) {
		for (i=0; i!=m.length; ++i) {
			cc = m[i];
			for (c=0; c!=cc.length; ++c) {
				if (cc.charCodeAt(c) === 61) break;
			}
			q = cc.slice(0, c).trim();
			while (cc.charCodeAt(c + 1) == 32) ++c;
			quot = ((eq=cc.charCodeAt(c + 1)) == 34 || eq == 39) ? 1 : 0;
			v = cc.slice(c + 1 + quot, cc.length-quot);
			for (j=0; j!=q.length; ++j) {
				if (q.charCodeAt(j) === 58) break;
			}
			if (j === q.length) {
				if (q.indexOf("_") > 0) q = q.slice(0, q.indexOf("_")); // from ods
				z[q] = v;
				if (!skip_LC) z[q.toLowerCase()] = v;
			} else {
				var k = (j===5 && q.slice(0, 5) === "xmlns" ? "xmlns" : "") + q.slice(j + 1);
				if (z[k] && q.slice(j - 3, j) == "ext") continue; // from ods
				z[k] = v;
				if (!skip_LC) z[k.toLowerCase()] = v;
			}
		}
	}
	return z;
}

function strip_ns(x) {
	return x.replace(nsregex2, "<$1");
}

// TODO: CP remap (need to read file version to determine OS)
var unescapexml = (function() {
	/* 22.4.2.4 bstr (Basic String) */
	var encregex = /&(?:quot|apos|gt|lt|amp|#x?([\da-fA-F]+));/ig,
		coderegex = /_x([\da-fA-F]{4})_/ig;
	return function unescapexml(text) {
		var s = text +"",
			i = s.indexOf("<![CDATA[");
		if (i == -1) {
			let out = s
				.replace(encregex, ($$, $1) => encodings[$$] || String.fromCharCode(parseInt($1,$$.indexOf("x") > -1 ? 16 : 10)) || $$)
				.replace(coderegex, (m, c) => String.fromCharCode(parseInt(c, 16)));
			return out;
		}
		var j = s.indexOf("]]>");
		return unescapexml(s.slice(0, i)) + s.slice(i + 9, j) + unescapexml(s.slice(j + 3));
	};
})();

var decregex=/[&<>'"]/g,
	charegex = /[\u0000-\u0008\u000b-\u001f]/g,
	htmlcharegex = /[\u0000-\u001f]/g;

function escapexml(text){
	var s = text +"";
	return s.replace(decregex, y => rencoding[y])
			.replace(charegex, s => "_x" + ("000"+ s.charCodeAt(0).toString(16)).slice(-4) +"_");
}

function escapexmltag(text){
	return escapexml(text).replace(/ /g, "_x0020_");
}

function escapehtml(text){
	var s = text +"";
	return s.replace(decregex, y => rencoding[y])
			.replace(/\n/g, "<br/>")
			.replace(htmlcharegex, s => "&#x"+ ("000"+ s.charCodeAt(0).toString(16)).slice(-4) +";");
}

function escapexlml(text){
	var s = text +"";
	return s.replace(decregex, y => rencoding[y])
			.replace(htmlcharegex, s => "&#x"+ (s.charCodeAt(0).toString(16)).toUpperCase() +";");
}

/* TODO: handle codepages */
var xlml_fixstr = (function() {
		var entregex = /&#(\d+);/g;
		
		function entrepl($$, $1) {
			return String.fromCharCode(parseInt($1, 10));
		}

		return function xlml_fixstr(str) {
			return str.replace(entregex, entrepl);
		};
	})();

var xlml_unfixstr = (function() {
		return function xlml_unfixstr(str) {
			return str.replace(/(\r\n|[\r\n])/g, "\&#10;");
		};
	})();

function parsexmlbool(value) {
	switch (value) {
		case 1:
		case true:
		case "1":
		case "true":
		case "TRUE": return true;
		default:
			return false;
	}
}

var utf8read = function utf8reada(orig) {
		var out = "",
			i = 0,
			c = 0,
			d = 0,
			e = 0,
			f = 0,
			w = 0;
		while (i < orig.length) {
			c = orig.charCodeAt(i++);
			if (c < 128) {
				out += String.fromCharCode(c);
				continue;
			}
			d = orig.charCodeAt(i++);
			if (c>191 && c<224) {
				f = ((c & 31) << 6);
				f |= (d & 63);
				out += String.fromCharCode(f);
				continue;
			}
			e = orig.charCodeAt(i++);
			if (c < 240) {
				out += String.fromCharCode(((c & 15) << 12) | ((d & 63) << 6) | (e & 63));
				continue;
			}
			f = orig.charCodeAt(i++);
			w = (((c & 7) << 18) | ((d & 63) << 12) | ((e & 63) << 6) | (f & 63))-65536;
			out += String.fromCharCode(0xD800 + ((w>>>10)&1023));
			out += String.fromCharCode(0xDC00 + (w&1023));
		}
		return out;
	};

function utf8write(orig) {
	var out = [],
		i = 0,
		c = 0,
		d = 0;
	while (i < orig.length) {
		c = orig.charCodeAt(i++);
		switch (true) {
			case c < 128:
				out.push(String.fromCharCode(c));
				break;
			case c < 2048:
				out.push(String.fromCharCode(192 + (c >> 6)));
				out.push(String.fromCharCode(128 + (c & 63)));
				break;
			case c >= 55296 && c < 57344:
				c -= 55296; d = orig.charCodeAt(i++) - 56320 + (c<<10);
				out.push(String.fromCharCode(240 + ((d >>18) & 7)));
				out.push(String.fromCharCode(144 + ((d >>12) & 63)));
				out.push(String.fromCharCode(128 + ((d >> 6) & 63)));
				out.push(String.fromCharCode(128 + (d & 63)));
				break;
			default:
				out.push(String.fromCharCode(224 + (c >> 12)));
				out.push(String.fromCharCode(128 + ((c >> 6) & 63)));
				out.push(String.fromCharCode(128 + (c & 63)));
		}
	}
	return out.join("");
}

// matches <foo>...</foo> extracts content
var matchtag = (function() {
		var mtcache = {};
		return function matchtag(f, g) {
			var t = f +"|"+ (g || "");
			if (mtcache[t]) return mtcache[t];
			return (mtcache[t] = new RegExp('<(?:\\w+:)?'+ f +'(?: xml:space="preserve")?(?:[^>]*)>([\\s\\S]*?)</(?:\\w+:)?'+ f +'>', (g || "")));
		};
	})();

var htmldecode = (function() {
	var entities = [
			['nbsp', ' '],
			['middot', '·'],
			['quot', '"'],
			['apos', "'"],
			['gt',   '>'],
			['lt',   '<'],
			['amp',  '&']
		].map(x => [new RegExp('&'+ x[0] +';', "ig"), x[1]]);

	return function htmldecode(str) {
		var o = str
				// Remove new lines and spaces from start of content
				.replace(/^[\t\n\r ]+/, "")
				// Remove new lines and spaces from end of content
				.replace(/[\t\n\r ]+$/,"")
				// Added line which removes any white space characters after and before html tags
				.replace(/>\s+/g,">").replace(/\s+</g,"<")
				// Replace remaining new lines and spaces with space
				.replace(/[\t\n\r ]+/g, " ")
				// Replace <br> tags with new lines
				.replace(/<\s*[bB][rR]\s*\/?>/g, "\n")
				// Strip HTML elements
				.replace(/<[^>]*>/g, "");
		for (var i=0; i<entities.length; ++i) {
			o = o.replace(entities[i][0], entities[i][1]);
		}
		return o;
	};
})();

var vtregex = (function() {
		var vt_cache = {};
		return function vt_regex(bt) {
			if (vt_cache[bt] !== undefined) return vt_cache[bt];
			return (vt_cache[bt] = new RegExp("<(?:vt:)?"+ bt +">([\\s\\S]*?)</(?:vt:)?"+ bt +">", "g") );
		};
	})();

function html2xml(td) {
	if (td.childNodes.length > 1 || (td.childNodes.length && td.childNodes[0].nodeType === 2)) {
		let xml = [],
			getTextNodes = el => {
				el.childNodes.map(el => {
					switch (el.nodeType) {
						case 1:
							if (el.nodeName === "BR") {
								xml.push(`<r><t xml:space="preserve">\r\n</t></r>`);
							} else {
								getTextNodes(el);
							}
							break;
						case 3:
							let style = getComputedStyle(el.parentNode),
								color = style["color"].match(/\d+/g).map(i => +i),
								bold = style["font-weight"] >= 500 ? `\n<b/>` : "",
								italic = style["font-style"] === "italic" ? `\n<i/>` : "",
								underline = style["text-decoration"].startsWith("underline") ? `\n<u val="single"/>` : "",
								stricken = style["text-decoration"].startsWith("line-through") ? `\n<strike/>` : "",
								g = el.nodeValue;
							xml.push(`<r>
										<rPr>${stricken + bold + italic + underline}
											<color rgb="${rgb2Hex(color).toLowerCase()}"/>
											<sz val="${(parseInt(style["font-size"], 10)) * (72/96)}"/>
											<rFont val="${style["font-family"].split(",")[0]}"/>
										</rPr>
										<t${ g.match(wtregex) ? ` xml:space="preserve"` : "" }>${g}</t>
									</r>`);
							break;
					}
				});
			};

		getTextNodes(td);

		return xml.join("").replace(/\t/g, "");
		// return `<is>${xml.join("")}</is>`.replace(/\t/g, "");
	} else {
		return htmldecode(td.innerHTML);
	}
}

function parseVector(data, opts) {
	var h = parsexmltag(data),
		matches = data.match(vtregex(h.baseType)) || [],
		res = [];
	if (matches.length != h.size) {
		if (opts.WTF) {
			throw new Error("unexpected vector length " + matches.length + " != " + h.size);
		}
		return res;
	}
	matches.forEach(function(x) {
		var v = x.replace(vtvregex, "").match(vtmregex);
		if (v) res.push({ v: utf8read(v[2]), t: v[1] });
	});
	return res;
}

function writetag(f, g) {
	return "<"+ f + (g.match(wtregex) ? ' xml:space="preserve"' : "") +">"+ g +"</"+ f +">";
}

function wxt_helper(h) {
	return keys(h).map(k => ` ${k}="${h[k]}"`).join("");
}

function writextag(f, g, h) {
	return "<"+ f +
		((h != null) ? wxt_helper(h) : "") +
		((g != null) ? (g.match(wtregex) ? ' xml:space="preserve"' : "") + ">" + g + "</" + f : "/") +
		">";
}

function writexNode(f, g, h) {
	return "<"+ f +
		((h != null) ? wxt_helper(h) : "") +
		((g != null) ? (g.match(wtregex) ? ' xml:space="preserve"' : "") + "><![CDATA[" + g + "]]></" + f : "/") +
		">";
}

function write_w3cdtf(d, t) {
	try {
		return d.toISOString().replace(/\.\d*/,"");
	} catch(e) {
		if (t) throw e;
	}
	return "";
}

	
function decode_row(rowstr) {
	return parseInt(unfix_row(rowstr), 10) - 1;
}

function encode_row(row) {
	return "" + (row + 1);
}

function fix_row(cstr) {
	return cstr.replace(/([A-Z]|^)(\d+)$/, "$1$$$2");
}

function unfix_row(cstr) {
	return cstr.replace(/\$(\d+)$/, "$1");
}

function decode_col(colstr) {
	var c = unfix_col(colstr),
		d = 0,
		i = 0;
	for (; i !== c.length; ++i) {
		d = 26*d + c.charCodeAt(i) - 64;
	}
	return d - 1;
}

function encode_col(col) {
	if (col < 0) throw new Error("invalid column " + col);
	var s = "";
	for (++col; col; col=Math.floor((col - 1) / 26)) {
		s = String.fromCharCode(((col - 1) % 26) + 65) + s;
	}
	return s;
}

function fix_col(cstr) {
	return cstr.replace(/^([A-Z])/, "$$$1");
}

function unfix_col(cstr) {
	return cstr.replace(/^\$([A-Z])/, "$1");
}

function split_cell(cstr) {
	return cstr.replace(/(\$?[A-Z]*)(\$?\d*)/, "$1,$2").split(",");
}

// function decode_cell(cstr) {
// 	var splt = split_cell(cstr);
// 	return { c: decode_col(splt[0]), r: decode_row(splt[1]) };
// }

function decode_cell(cstr) {
	var R = 0,
		C = 0;
	for (var i=0, il=cstr.length; i<il; ++i) {
		var cc = cstr.charCodeAt(i);
		if (cc >= 48 && cc <= 57) R = 10 * R + (cc - 48);
		else if (cc >= 65 && cc <= 90) C = 26 * C + (cc - 64);
	}
	return { c: C - 1, r:R - 1 };
}

// function encode_cell(cell) {
// 	return encode_col(cell.c) + encode_row(cell.r);
// }

function encode_cell(cell) {
	var col = cell.c + 1,
		s = "";
	for (; col; col=((col - 1) / 26) | 0) {
		s = String.fromCharCode(((col - 1) % 26) + 65) + s;
	}
	return s + (cell.r + 1);
}

function decode_range(range) {
	var idx = range.indexOf(":");
	if (idx == -1) {
		return {
			s: decode_cell(range),
			e: decode_cell(range)
		};
	}
	return {
		s: decode_cell(range.slice(0, idx)),
		e: decode_cell(range.slice(idx + 1))
	};
}

/*# if only one arg, it is assumed to be a Range.  If 2 args, both are cell addresses */
function encode_range(cs, ce) {
	if (typeof ce === "undefined" || typeof ce === "number") {
/*:: if(!(cs instanceof Range)) throw "unreachable"; */
		return encode_range(cs.s, cs.e);
	}
/*:: if((cs instanceof Range)) throw "unreachable"; */
	if (typeof cs !== "string") cs = encode_cell((cs));
	if (typeof ce !== "string") ce = encode_cell((ce));
/*:: if(typeof cs !== "string") throw "unreachable"; */
/*:: if(typeof ce !== "string") throw "unreachable"; */
	return cs == ce ? cs : cs + ":" + ce;
}

function safe_decode_range(range) {
	var o = {
			s: { c: 0, r: 0 },
			e: { c: 0, r: 0 }
		},
		idx = 0,
		i = 0,
		cc = 0,
		len = range.length;

	for (idx = 0; i < len; ++i) {
		if ((cc=range.charCodeAt(i) - 64) < 1 || cc > 26) break;
		idx = 26 * idx + cc;
	}
	o.s.c = --idx;

	for (idx = 0; i < len; ++i) {
		if ((cc=range.charCodeAt(i) - 48) < 0 || cc > 9) break;
		idx = 10 * idx + cc;
	}
	o.s.r = --idx;

	if (i === len || range.charCodeAt(++i) === 58) {
		o.e.c=o.s.c;
		o.e.r=o.s.r;
		return o;
	}

	for (idx = 0; i != len; ++i) {
		if ((cc=range.charCodeAt(i) - 64) < 1 || cc > 26) break;
		idx = 26 * idx + cc;
	}
	o.e.c = --idx;

	for (idx = 0; i != len; ++i) {
		if ((cc=range.charCodeAt(i) - 48) < 0 || cc > 9) break;
		idx = 10 * idx + cc;
	}
	o.e.r = --idx;

	return o;
}

function safe_format_cell(cell, v) {
	var q = (cell.t == "d" && v instanceof Date);
	if (cell.z != null) {
		try {
			return (cell.w = SSF.format(cell.z, q ? datenum(v) : v));
		} catch(e) { }
	}
	try {
		return (cell.w = SSF.format((cell.XF||{}).numFmtId||(q ? 14 : 0),  q ? datenum(v) : v));
	} catch(e) {
		return ""+ v;
	}
}

function format_cell(cell, v, o) {
	if (cell == null || cell.t == null || cell.t == "z") return "";
	if (cell.w !== undefined) return cell.w;
	if (cell.t == "d" && !cell.z && o && o.dateNF) cell.z = o.dateNF;
	if (v == undefined) return safe_format_cell(cell, cell.v);
	return safe_format_cell(cell, v);
}

function sheet_to_workbook(sheet, opts) {
	var n = opts && opts.sheet ? opts.sheet : "Sheet1";
	var sheets = {};
	sheets[n] = sheet;
	
	return {
		SheetNames: [n],
		Sheets: sheets
	};
}

function sheet_add_aoa(_ws, data, opts) {
	var o = opts || {};
	var dense = _ws ? Array.isArray(_ws) : o.dense;
	if (DENSE != null && dense == null) dense = DENSE;
	
	var ws = _ws || (dense ? [] : {}),
		_R = 0,
		_C = 0;
	
	if (ws && o.origin != null) {
		if (typeof o.origin == "number") {
			_R = o.origin;
		} else {
			var _origin = typeof o.origin == "string" ? decode_cell(o.origin) : o.origin;
			_R = _origin.r;
			_C = _origin.c;
		}
		if (!ws["!ref"]) ws["!ref"] = "A1:A1";
	}

	var range = {
			s: { c: 10000000, r: 10000000 },
			e: { c: 0, r: 0 }
		};
	if (ws["!ref"]) {
		var _range = safe_decode_range(ws["!ref"]);
		range.s.c = _range.s.c;
		range.s.r = _range.s.r;
		range.e.c = Math.max(range.e.c, _range.e.c);
		range.e.r = Math.max(range.e.r, _range.e.r);
		if (_R == -1) {
			range.e.r = _R = _range.e.r + 1;
		}
	}

	for (var R = 0; R != data.length; ++R) {
		if (!data[R]) continue;
		if (!Array.isArray(data[R])) {
			throw new Error("aoa_to_sheet expects an array of arrays");
		}
		for (var C = 0; C != data[R].length; ++C) {
			if (typeof data[R][C] === "undefined") continue;
			var cell = { v: data[R][C] };
			var __R = _R + R,
				__C = _C + C;
			if (range.s.r > __R) range.s.r = __R;
			if (range.s.c > __C) range.s.c = __C;
			if (range.e.r < __R) range.e.r = __R;
			if (range.e.c < __C) range.e.c = __C;
			if (data[R][C] && typeof data[R][C] === "object" && !Array.isArray(data[R][C]) && !(data[R][C] instanceof Date)) {
				cell = data[R][C];
			} else {
				if (Array.isArray(cell.v)) {
					cell.f = data[R][C][1];
					cell.v = cell.v[0];
				}
				if (cell.v === null) {
					if (cell.f) cell.t = "n";
					else if (!o.sheetStubs) continue;
					else cell.t = "z";
				} else if (typeof cell.v === "number") {
					cell.t = "n";
				} else if (typeof cell.v === "boolean") {
					cell.t = "b";
				} else if (cell.v instanceof Date) {
					cell.z = o.dateNF || SSF._table[14];
					if (o.cellDates) {
						cell.t = "d";
						cell.w = SSF.format(cell.z, datenum(cell.v));
					} else {
						cell.t = "n";
						cell.v = datenum(cell.v);
						cell.w = SSF.format(cell.z, cell.v);
					}
				} else {
					cell.t = "s";
				}
			}
			if (dense) {
				if (!ws[__R]) ws[__R] = [];
				if (ws[__R][__C] && ws[__R][__C].z) cell.z = ws[__R][__C].z;
				ws[__R][__C] = cell;
			} else {
				var cell_ref = encode_cell(({ c: __C, r: __R }));
				if (ws[cell_ref] && ws[cell_ref].z) cell.z = ws[cell_ref].z;
				ws[cell_ref] = cell;
			}
		}
	}

	if (range.s.c < 10000000) ws["!ref"] = encode_range(range);

	return ws;
}

function aoa_to_sheet(data, opts) {
	return sheet_add_aoa(null, data, opts);
}


	
/* Parts enumerated in OPC spec, MS-XLSB and MS-XLSX */
/* 12.3 Part Summary <SpreadsheetML> */
/* 14.2 Part Summary <DrawingML> */
/* [MS-XLSX] 2.1 Part Enumerations ; [MS-XLSB] 2.1.7 Part Enumeration */

var ct2type/*{[string]:string}*/ = ({
	/* Workbook */
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": "workbooks",
	/* Worksheet */
	"application/vnd.ms-excel.binIndexWs": "TODO", /* Binary Index */
	/* Macrosheet */
	"application/vnd.ms-excel.intlmacrosheet": "TODO",
	"application/vnd.ms-excel.binIndexMs": "TODO", /* Binary Index */
	/* File Properties */
	"application/vnd.openxmlformats-package.core-properties+xml": "coreprops",
	"application/vnd.openxmlformats-officedocument.custom-properties+xml": "custprops",
	"application/vnd.openxmlformats-officedocument.extended-properties+xml": "extprops",
	/* Custom Data Properties */
	"application/vnd.openxmlformats-officedocument.customXmlProperties+xml": "TODO",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.customProperty": "TODO",
	/* PivotTable */
	"application/vnd.ms-excel.pivotTable": "TODO",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotTable+xml": "TODO",
	/* Chart Objects */
	"application/vnd.openxmlformats-officedocument.drawingml.chart+xml": "TODO",
	/* Chart Colors */
	"application/vnd.ms-office.chartcolorstyle+xml": "TODO",
	/* Chart Style */
	"application/vnd.ms-office.chartstyle+xml": "TODO",
	/* Chart Advanced */
	"application/vnd.ms-office.chartex+xml": "TODO",
	/* Calculation Chain */
	"application/vnd.ms-excel.calcChain": "calcchains",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.calcChain+xml": "calcchains",
	/* Printer Settings */
	"application/vnd.openxmlformats-officedocument.spreadsheetml.printerSettings": "TODO",
	/* ActiveX */
	"application/vnd.ms-office.activeX": "TODO",
	"application/vnd.ms-office.activeX+xml": "TODO",
	/* Custom Toolbars */
	"application/vnd.ms-excel.attachedToolbars": "TODO",
	/* External Data Connections */
	"application/vnd.ms-excel.connections": "TODO",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": "TODO",
	/* External Links */
	"application/vnd.ms-excel.externalLink": "links",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.externalLink+xml": "links",
	/* Metadata */
	"application/vnd.ms-excel.sheetMetadata": "TODO",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheetMetadata+xml": "TODO",
	/* PivotCache */
	"application/vnd.ms-excel.pivotCacheDefinition": "TODO",
	"application/vnd.ms-excel.pivotCacheRecords": "TODO",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotCacheDefinition+xml": "TODO",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotCacheRecords+xml": "TODO",
	/* Query Table */
	"application/vnd.ms-excel.queryTable": "TODO",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.queryTable+xml": "TODO",
	/* Shared Workbook */
	"application/vnd.ms-excel.userNames": "TODO",
	"application/vnd.ms-excel.revisionHeaders": "TODO",
	"application/vnd.ms-excel.revisionLog": "TODO",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionHeaders+xml": "TODO",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionLog+xml": "TODO",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.userNames+xml": "TODO",
	/* Single Cell Table */
	"application/vnd.ms-excel.tableSingleCells": "TODO",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.tableSingleCells+xml": "TODO",
	/* Slicer */
	"application/vnd.ms-excel.slicer": "TODO",
	"application/vnd.ms-excel.slicerCache": "TODO",
	"application/vnd.ms-excel.slicer+xml": "TODO",
	"application/vnd.ms-excel.slicerCache+xml": "TODO",
	/* Sort Map */
	"application/vnd.ms-excel.wsSortMap": "TODO",
	/* Table */
	"application/vnd.ms-excel.table": "TODO",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": "TODO",
	/* Themes */
	"application/vnd.openxmlformats-officedocument.theme+xml": "themes",
	/* Theme Override */
	"application/vnd.openxmlformats-officedocument.themeOverride+xml": "TODO",
	/* Timeline */
	"application/vnd.ms-excel.Timeline+xml": "TODO", /* verify */
	"application/vnd.ms-excel.TimelineCache+xml": "TODO", /* verify */
	/* VBA */
	"application/vnd.ms-office.vbaProject": "vba",
	"application/vnd.ms-office.vbaProjectSignature": "vba",
	/* Volatile Dependencies */
	"application/vnd.ms-office.volatileDependencies": "TODO",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.volatileDependencies+xml": "TODO",
	/* Control Properties */
	"application/vnd.ms-excel.controlproperties+xml": "TODO",
	/* Data Model */
	"application/vnd.openxmlformats-officedocument.model+data": "TODO",
	/* Survey */
	"application/vnd.ms-excel.Survey+xml": "TODO",
	/* Drawing */
	"application/vnd.openxmlformats-officedocument.drawing+xml": "drawings",
	"application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": "TODO",
	"application/vnd.openxmlformats-officedocument.drawingml.diagramColors+xml": "TODO",
	"application/vnd.openxmlformats-officedocument.drawingml.diagramData+xml": "TODO",
	"application/vnd.openxmlformats-officedocument.drawingml.diagramLayout+xml": "TODO",
	"application/vnd.openxmlformats-officedocument.drawingml.diagramStyle+xml": "TODO",
	/* VML */
	"application/vnd.openxmlformats-officedocument.vmlDrawing": "TODO",
	"application/vnd.openxmlformats-package.relationships+xml": "rels",
	"application/vnd.openxmlformats-officedocument.oleObject": "TODO",
	/* Image */
	"image/png": "TODO",

	"sheet": "js"
});

var CT_LIST = (function() {
	var o = {
		workbooks: {
			xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml",
			xlsm: "application/vnd.ms-excel.sheet.macroEnabled.main+xml",
			xlsb: "application/vnd.ms-excel.sheet.binary.macroEnabled.main",
			xlam: "application/vnd.ms-excel.addin.macroEnabled.main+xml",
			xltx: "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml"
		},
		strs: { /* Shared Strings */
			xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml",
			xlsb: "application/vnd.ms-excel.sharedStrings"
		},
		comments: { /* Comments */
			xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml",
			xlsb: "application/vnd.ms-excel.comments"
		},
		sheets: { /* Worksheet */
			xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml",
			xlsb: "application/vnd.ms-excel.worksheet"
		},
		charts: { /* Chartsheet */
			xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml",
			xlsb: "application/vnd.ms-excel.chartsheet"
		},
		dialogs: { /* Dialogsheet */
			xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml",
			xlsb: "application/vnd.ms-excel.dialogsheet"
		},
		macros: { /* Macrosheet (Excel 4.0 Macros) */
			xlsx: "application/vnd.ms-excel.macrosheet+xml",
			xlsb: "application/vnd.ms-excel.macrosheet"
		},
		styles: { /* Styles */
			xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml",
			xlsb: "application/vnd.ms-excel.styles"
		}
	};
	keys(o).forEach(function(k) { ["xlsm", "xlam"].forEach(function(v) { if (!o[k][v]) o[k][v] = o[k].xlsx; }); });
	keys(o).forEach(function(k) { keys(o[k]).forEach(function(v) { ct2type[o[k][v]] = k; }); });
	return o;
})();

var type2ct = evert_arr(ct2type);

XMLNS.CT = "http://schemas.openxmlformats.org/package/2006/content-types";

function new_ct() {
	return {
		workbooks:  [],
		sheets:     [],
		charts:     [],
		dialogs:    [],
		macros:     [],
		rels:       [],
		strs:       [],
		comments:   [],
		links:      [],
		coreprops:  [],
		extprops:   [],
		custprops:  [],
		themes:     [],
		styles:     [],
		calcchains: [],
		vba:        [],
		drawings:   [],
		TODO:       [],
		xmlns:      ""
	};
}

function parse_ct(data) {
	var ct = new_ct();
	if (!data || !data.match) return ct;
	var ctext = {};
	(data.match(tagregex) || []).forEach(function(x) {
		var y = parsexmltag(x);
		switch (y[0].replace(nsregex, "<")) {
			case "<?xml": break;
			case "<Types": ct.xmlns = y["xmlns"+ (y[0].match(/<(\w+):/)||["",""])[1] ]; break;
			case "<Default": ctext[y.Extension] = y.ContentType; break;
			case "<Override":
				if (ct[ct2type[y.ContentType]] !== undefined) ct[ct2type[y.ContentType]].push(y.PartName);
				break;
		}
	});
	if (ct.xmlns !== XMLNS.CT) throw new Error("Unknown Namespace: " + ct.xmlns);
	ct.calcchain = ct.calcchains.length > 0 ? ct.calcchains[0] : "";
	ct.sst = ct.strs.length > 0 ? ct.strs[0] : "";
	ct.style = ct.styles.length > 0 ? ct.styles[0] : "";
	ct.defaults = ctext;
	delete ct.calcchains;
	return ct;
}

var CTYPE_XML_ROOT = writextag("Types", null, {
	"xmlns": XMLNS.CT,
	"xmlns:xsd": XMLNS.xsd,
	"xmlns:xsi": XMLNS.xsi
});

var CTYPE_DEFAULTS = [
	["xml", "application/xml"],
	["bin", "application/vnd.ms-excel.sheet.binary.macroEnabled.main"],
	["vml", "application/vnd.openxmlformats-officedocument.vmlDrawing"],
	["data", "application/vnd.openxmlformats-officedocument.model+data"],
	/* from test files */
	["bmp", "image/bmp"],
	["png", "image/png"],
	["gif", "image/gif"],
	["emf", "image/x-emf"],
	["wmf", "image/x-wmf"],
	["jpg", "image/jpeg"], ["jpeg", "image/jpeg"],
	["tif", "image/tiff"], ["tiff", "image/tiff"],
	["pdf", "application/pdf"],
	["rels", type2ct.rels[0]]
].map(function(x) {
	return writextag("Default", null, { "Extension": x[0], "ContentType": x[1] });
});

function write_ct(ct, opts) {
	var o = [],
		v;
	o[o.length] = (XML_HEADER);
	o[o.length] = (CTYPE_XML_ROOT);
	o = o.concat(CTYPE_DEFAULTS);

	/* only write first instance */
	var f1 = function(w) {
		if (ct[w] && ct[w].length > 0) {
			v = ct[w][0];
			o[o.length] = (writextag("Override", null, {
				"PartName": (v[0] == "/" ? "" : "/") + v,
				"ContentType": CT_LIST[w][opts.bookType || "xlsx"]
			}));
		}
	};

	/* book type-specific */
	var f2 = function(w) {
		(ct[w]||[]).forEach(function(v) {
			o[o.length] = (writextag("Override", null, {
				"PartName": (v[0] == "/" ? "" : "/") + v,
				"ContentType": CT_LIST[w][opts.bookType || "xlsx"]
			}));
		});
	};

	/* standard type */
	var f3 = function(t) {
		(ct[t]||[]).forEach(function(v) {
			o[o.length] = (writextag("Override", null, {
				"PartName": (v[0] == "/" ? "" : "/") + v,
				"ContentType": type2ct[t][0]
			}));
		});
	};

	f1("workbooks");
	f2("sheets");
	f2("charts");
	f3("themes");
	["strs", "styles"].forEach(f1);
	["coreprops", "extprops", "custprops"].forEach(f3);
	f3("vba");
	f3("comments");
	f3("drawings");

	if (o.length > 2) {
		o[o.length] = ("</Types>");
		o[1] = o[1].replace("/>", ">");
	}
	
	return o.join("");
}

	
XMLNS.RELS = 'http://schemas.openxmlformats.org/package/2006/relationships';

/* 9.3 Relationships */
var RELS = {
		WB:    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
		SHEET: "http://sheetjs.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
		HLINK: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink",
		VML:   "http://schemas.openxmlformats.org/officeDocument/2006/relationships/vmlDrawing",
		XPATH: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/externalLinkPath",
		XMISS: "http://schemas.microsoft.com/office/2006/relationships/xlExternalLinkPath/xlPathMissing",
		XLINK: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/externalLink",
		CXML:  "http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXml",
		CXMLP: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXmlProps",
		VBA:   "http://schemas.microsoft.com/office/2006/relationships/vbaProject",
		CMNT:  "http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments",
	},
	RELS_EXTERN = [RELS.HLINK, RELS.XPATH, RELS.XMISS],
	RELS_ROOT = writextag("Relationships", null, { "xmlns": XMLNS.RELS });


/* 9.3.3 Representing Relationships */
function get_rels_path(file) {
	var n = file.lastIndexOf("/");
	return file.slice(0, n + 1) +"_rels/"+ file.slice(n + 1) +".rels";
}

function parse_rels(data, currentFilePath) {
	var rels = { "!id": {} },
		hash = {};

	if (!data) return rels;
	if (currentFilePath.charAt(0) !== "/") {
		currentFilePath = "/"+ currentFilePath;
	}

	(data.match(tagregex) || []).forEach(x => {
		var y = parsexmltag(x);
		/* 9.3.2.2 OPC_Relationships */
		if (y[0] === "<Relationship") {
			var rel = {},
				canonictarget = y.TargetMode === "External" ? y.Target : resolve_path(y.Target, currentFilePath);
			rel.Type = y.Type;
			rel.Target = y.Target;
			rel.Id = y.Id;
			rel.TargetMode = y.TargetMode;
			rels[canonictarget] = rel;
			hash[y.Id] = rel;
		}
	});
	rels["!id"] = hash;
	return rels;
}

function write_rels(rels) {
	var o = [XML_HEADER, RELS_ROOT];
	keys(rels["!id"]).forEach(rid => {
		o[o.length] = writextag("Relationship", null, rels["!id"][rid]);
	});
	if (o.length > 2){
		o[o.length] = ("</Relationships>");
		o[1] = o[1].replace("/>",">");
	}
	return o.join("");
}

function add_rels(rels, rId, f, type, relobj, targetmode) {
	if (!relobj) relobj = {};
	if (!rels["!id"]) rels["!id"] = {};
	if (rId < 0) {
		for(rId=1; rels["!id"]["rId"+ rId]; ++rId) {}
	}
	relobj.Id = "rId"+ rId;
	relobj.Type = type;
	relobj.Target = f;

	if (targetmode) relobj.TargetMode = targetmode;
	else if (RELS_EXTERN.indexOf(relobj.Type) > -1) relobj.TargetMode = "External";
	
	if (rels["!id"][relobj.Id]) {
		throw new Error(`Cannot rewrite rId ${rId}`);
	}
	
	rels["!id"][relobj.Id] = relobj;
	rels[("/"+ relobj.Target).replace("//", "/")] = relobj;
	
	return rId;
}
	
XMLNS.CORE_PROPS = "http://schemas.openxmlformats.org/package/2006/metadata/core-properties";
RELS.CORE_PROPS  = "http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties";

/* ECMA-376 Part II 11.1 Core Properties Part */
/* [MS-OSHARED] 2.3.3.2.[1-2].1 (PIDSI/PIDDSI) */
var CORE_PROPS = [
		["cp:category", "Category"],
		["cp:contentStatus", "ContentStatus"],
		["cp:keywords", "Keywords"],
		["cp:lastModifiedBy", "LastAuthor"],
		["cp:lastPrinted", "LastPrinted"],
		["cp:revision", "RevNumber"],
		["cp:version", "Version"],
		["dc:creator", "Author"],
		["dc:description", "Comments"],
		["dc:identifier", "Identifier"],
		["dc:language", "Language"],
		["dc:subject", "Subject"],
		["dc:title", "Title"],
		["dcterms:created", "CreatedDate", "date"],
		["dcterms:modified", "ModifiedDate", "date"]
	],
	CORE_PROPS_REGEX = (function() {
		var r = new Array(CORE_PROPS.length);
		for (var i=0; i<CORE_PROPS.length; ++i) {
			var f = CORE_PROPS[i];
			var g = "(?:"+ f[0].slice(0, f[0].indexOf(":")) +":)"+ f[0].slice(f[0].indexOf(":") + 1);
			r[i] = new RegExp("<"+ g +"[^>]*>([\\s\\S]*?)<\/"+ g +">");
		}
		return r;
	})(),
	CORE_PROPS_XML_ROOT = writextag("cp:coreProperties", null, {
		"xmlns:cp": XMLNS.CORE_PROPS,
		"xmlns:dc": XMLNS.dc,
		"xmlns:dcterms": XMLNS.dcterms,
		"xmlns:dcmitype": XMLNS.dcmitype,
		"xmlns:xsi": XMLNS.xsi
	});

function parse_core_props(data) {
	var p = {};
	data = utf8read(data);
	for (var i=0; i<CORE_PROPS.length; ++i) {
		var f = CORE_PROPS[i],
			cur = data.match(CORE_PROPS_REGEX[i]);
		if (cur != null && cur.length > 0) p[f[1]] = unescapexml(cur[1]);
		if (f[2] === "date" && p[f[1]]) p[f[1]] = parseDate(p[f[1]]);
	}
	return p;
}

function cp_doit(f, g, h, o, p) {
	if (p[f] != null || g == null || g === "") return;
	p[f] = g;
	g = escapexml(g);
	o[o.length] = (h ? writextag(f, g, h) : writetag(f, g));
}

function write_core_props(cp, _opts) {
	var opts = _opts || {},
		o = [XML_HEADER, CORE_PROPS_XML_ROOT],
		p = {};
	if (!cp && !opts.Props) return o.join("");
	if (cp) {
		if (cp.CreatedDate != null) {
			cp_doit("dcterms:created", typeof cp.CreatedDate === "string" ? cp.CreatedDate : write_w3cdtf(cp.CreatedDate, opts.WTF), { "xsi:type": "dcterms:W3CDTF" }, o, p);
		}
		if (cp.ModifiedDate != null) {
			cp_doit("dcterms:modified", typeof cp.ModifiedDate === "string" ? cp.ModifiedDate : write_w3cdtf(cp.ModifiedDate, opts.WTF), { "xsi:type": "dcterms:W3CDTF" }, o, p);
		}
	}
	for (var i=0; i!=CORE_PROPS.length; ++i) {
		var f = CORE_PROPS[i],
			v = opts.Props && opts.Props[f[1]] != null ? opts.Props[f[1]] : cp ? cp[f[1]] : null;
		
		if (v === true) v = "1";
		else if (v === false) v = "0";
		else if (typeof v == "number") v = String(v);
		if (v != null) cp_doit(f[0], v, null, o, p);
	}
	if (o.length > 2){
		o[o.length] = ("</cp:coreProperties>");
		o[1] = o[1].replace("/>", ">");
	}
	return o.join("");
}

	
XMLNS.EXT_PROPS = "http://schemas.openxmlformats.org/officeDocument/2006/extended-properties";
RELS.EXT_PROPS  = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties";

/* 15.2.12.3 Extended File Properties Part */
/* [MS-OSHARED] 2.3.3.2.[1-2].1 (PIDSI/PIDDSI) */
var EXT_PROPS = [
		["Application", "Application", "string"],
		["AppVersion", "AppVersion", "string"],
		["Company", "Company", "string"],
		["DocSecurity", "DocSecurity", "string"],
		["Manager", "Manager", "string"],
		["HyperlinksChanged", "HyperlinksChanged", "bool"],
		["SharedDoc", "SharedDoc", "bool"],
		["LinksUpToDate", "LinksUpToDate", "bool"],
		["ScaleCrop", "ScaleCrop", "bool"],
		["HeadingPairs", "HeadingPairs", "raw"],
		["TitlesOfParts", "TitlesOfParts", "raw"]
	],
	PseudoPropsPairs = [
		"Worksheets",  "SheetNames",
		"NamedRanges", "DefinedNames",
		"Chartsheets", "ChartNames"
	],
	EXT_PROPS_XML_ROOT = writextag("Properties", null, {
		"xmlns": XMLNS.EXT_PROPS,
		"xmlns:vt": XMLNS.vt
	});

function load_props_pairs(HP, TOP, props, opts) {
	var v = [],
		parts = (typeof TOP == "string") ? parseVector(TOP, opts).map(x => x.v) : TOP,
		idx = 0,
		len = 0;

	if (typeof HP == "string") v = parseVector(HP, opts);
	else {
		for (var j=0; j<HP.length; ++j) {
			v = v.concat(HP[j].map(hp => ({ v: hp })));
		}
	}

	if (parts.length > 0) {
		for (var i=0; i!==v.length; i += 2) {
			len = +(v[i + 1].v);

			switch(v[i].v) {
				case "Worksheets":
				case "工作表":
				case "Листы":
				case "أوراق العمل":
				case "ワークシート":
				case "גליונות עבודה":
				case "Arbeitsblätter":
				case "Çalışma Sayfaları":
				case "Feuilles de calcul":
				case "Fogli di lavoro":
				case "Folhas de cálculo":
				case "Planilhas":
				case "Regneark":
				case "Hojas de cálculo":
				case "Werkbladen":
					props.Worksheets = len;
					props.SheetNames = parts.slice(idx, idx + len);
					break;

				case "Named Ranges":
				case "Rangos con nombre":
				case "名前付き一覧":
				case "Benannte Bereiche":
				case "Navngivne områder":
					props.NamedRanges = len;
					props.DefinedNames = parts.slice(idx, idx + len);
					break;

				case "Charts":
				case "Diagramme":
					props.Chartsheets = len;
					props.ChartNames = parts.slice(idx, idx + len);
					break;
			}

			idx += len;
		}
	}
}

function parse_ext_props(data, p, opts) {
	var q = {};
	if (!p) p = {};
	data = utf8read(data);

	EXT_PROPS.forEach(function(f) {
		var xml = (data.match(matchtag(f[0])) || [])[1];
		switch(f[2]) {
			case "string":
				if (xml) p[f[1]] = unescapexml(xml);
				break;
			case "bool":
				p[f[1]] = xml === "true";
				break;
			case "raw":
				var cur = data.match(new RegExp("<"+ f[0] +"[^>]*>([\\s\\S]*?)<\/"+ f[0] +">"));
				if (cur && cur.length > 0) q[f[1]] = cur[1];
				break;
		}
	});

	if (q.HeadingPairs && q.TitlesOfParts) load_props_pairs(q.HeadingPairs, q.TitlesOfParts, p, opts);
	return p;
}

function write_ext_props(cp) {
	var o = [],
		W = writextag;
	
	if (!cp) cp = {};
	cp.Application = "SheetJS";
	o[o.length] = XML_HEADER;
	o[o.length] = EXT_PROPS_XML_ROOT;

	EXT_PROPS.forEach(function(f) {
		if (cp[f[1]] === undefined) return;
		var v;
		switch(f[2]) {
			case "string":
				v = escapexml(String(cp[f[1]]));
				break;
			case "bool":
				v = cp[f[1]] ? "true" : "false";
				break;
		}
		if (v !== undefined) o[o.length] = W(f[0], v);
	});

	/* TODO: HeadingPairs, TitlesOfParts */
	o[o.length] = W("HeadingPairs", W("vt:vector", W("vt:variant", "<vt:lpstr>Worksheets</vt:lpstr>") + W("vt:variant", W("vt:i4", String(cp.Worksheets))), { size: 2, baseType: "variant" }));
	o[o.length] = W("TitlesOfParts", W("vt:vector", cp.SheetNames.map(function(s) { return "<vt:lpstr>" + escapexml(s) + "</vt:lpstr>"; }).join(""), { size: cp.Worksheets, baseType: "lpstr" }));
	if (o.length>2) {
		o[o.length] = "</Properties>";
		o[1]=o[1].replace("/>",">");
	}
	return o.join("");
}

	
/* [MS-DTYP] 2.3.3 FILETIME */
/* [MS-OLEDS] 2.1.3 FILETIME (Packet Version) */
/* [MS-OLEPS] 2.8 FILETIME (Packet Version) */
function parse_FILETIME(blob) {
	var dwLowDateTime = blob.read_shift(4),
		dwHighDateTime = blob.read_shift(4);
	return new Date(((dwHighDateTime / 1e7 * Math.pow(2, 32) + dwLowDateTime / 1e7) - 11644473600) * 1000).toISOString().replace(/\.000/, "");
}

function write_FILETIME(time) {
	var date = (typeof time == "string") ? new Date(Date.parse(time)) : time,
		t = date.getTime() / 1000 + 11644473600,
		l = t % Math.pow(2, 32), h = (t - l) / Math.pow(2, 32);
	l *= 1e7;
	h *= 1e7;
	var w = (l / Math.pow(2, 32)) | 0;
	if (w > 0) {
		l = l % Math.pow(2, 32);
		h += w;
	}
	var o = new_buf(8);
	o.write_shift(4, l);
	o.write_shift(4, h);
	return o;
}

/* [MS-OSHARED] 2.3.3.1.4 Lpstr */
function parse_lpstr(blob, type, pad) {
	var start = blob.l,
		str = blob.read_shift(0, "lpstr-cp");
	if (pad) {
		while((blob.l - start) & 3) ++blob.l;
	}
	return str;
}

/* [MS-OSHARED] 2.3.3.1.6 Lpwstr */
function parse_lpwstr(blob, type, pad) {
	var str = blob.read_shift(0, "lpwstr");
	if (pad) {
		blob.l += (4 - ((str.length + 1) & 3)) & 3;
	}
	return str;
}

/* [MS-OSHARED] 2.3.3.1.11 VtString */
/* [MS-OSHARED] 2.3.3.1.12 VtUnalignedString */
function parse_VtStringBase(blob, stringType, pad) {
	if (stringType === 0x1F) return parse_lpwstr(blob);
	return parse_lpstr(blob, stringType, pad);
}

function parse_VtString(blob, t, pad) {
	return parse_VtStringBase(blob, t, pad === false ? 0: 4);
}

function parse_VtUnalignedString(blob, t) {
	if (!t) {
		throw new Error("VtUnalignedString must have positive length");
	}
	return parse_VtStringBase(blob, t, 0);
}

/* [MS-OSHARED] 2.3.3.1.9 VtVecUnalignedLpstrValue */
function parse_VtVecUnalignedLpstrValue(blob) {
	var length = blob.read_shift(4),
		ret = [];
	for (var i=0; i!=length; ++i) {
		ret[i] = blob.read_shift(0, "lpstr-cp").replace(chr0, "");
	}
	return ret;
}

/* [MS-OSHARED] 2.3.3.1.10 VtVecUnalignedLpstr */
function parse_VtVecUnalignedLpstr(blob) {
	return parse_VtVecUnalignedLpstrValue(blob);
}

/* [MS-OSHARED] 2.3.3.1.13 VtHeadingPair */
function parse_VtHeadingPair(blob) {
	var headingString = parse_TypedPropertyValue(blob, VT_USTR),
		headerParts = parse_TypedPropertyValue(blob, VT_I4);
	return [headingString, headerParts];
}

/* [MS-OSHARED] 2.3.3.1.14 VtVecHeadingPairValue */
function parse_VtVecHeadingPairValue(blob) {
	var cElements = blob.read_shift(4),
		out = [];
	for (var i=0; i!=cElements/2; ++i) {
		out.push(parse_VtHeadingPair(blob));
	}
	return out;
}

/* [MS-OSHARED] 2.3.3.1.15 VtVecHeadingPair */
function parse_VtVecHeadingPair(blob) {
	// NOTE: When invoked, wType & padding were already consumed
	return parse_VtVecHeadingPairValue(blob);
}

/* [MS-OLEPS] 2.18.1 Dictionary (uses 2.17, 2.16) */
function parse_dictionary(blob,CodePage) {
	var cnt = blob.read_shift(4),
		dict = {};
	for (var j=0; j!=cnt; ++j) {
		var pid = blob.read_shift(4),
			len = blob.read_shift(4);
		dict[pid] = blob.read_shift(len, (CodePage === 0x4B0 ? "utf16le" : "utf8")).replace(chr0, "").replace(chr1, "!");
		if (CodePage === 0x4B0 && (len % 2)) blob.l += 2;
	}
	if (blob.l & 3) blob.l = (blob.l >> 2 + 1) << 2;
	return dict;
}

/* [MS-OLEPS] 2.9 BLOB */
function parse_BLOB(blob) {
	var size = blob.read_shift(4),
		bytes = blob.slice(blob.l, blob.l + size);
	blob.l += size;
	if ((size & 3) > 0) {
		blob.l += (4 - (size & 3)) & 3;
	}
	return bytes;
}

/* [MS-OLEPS] 2.11 ClipboardData */
function parse_ClipboardData(blob) {
	var o = {};
	o.Size = blob.read_shift(4);
	blob.l += o.Size + 3 - (o.Size - 1) % 4;
	return o;
}

/* [MS-OLEPS] 2.15 TypedPropertyValue */
function parse_TypedPropertyValue(blob, type, _opts) {
	var t = blob.read_shift(2),
		ret,
		opts = _opts || {};
	blob.l += 2;
	if (type !== VT_VARIANT) {
		if (t !== type && VT_CUSTOM.indexOf(type) === -1) {
			throw new Error(`Expected type ${type} saw ${t}`);
		}
	}
	switch(type === VT_VARIANT ? t : type) {
		case 0x02 /*VT_I2*/: ret = blob.read_shift(2, "i"); if (!opts.raw) blob.l += 2; return ret;
		case 0x03 /*VT_I4*/: ret = blob.read_shift(4, "i"); return ret;
		case 0x0B /*VT_BOOL*/: return blob.read_shift(4) !== 0x0;
		case 0x13 /*VT_UI4*/: ret = blob.read_shift(4); return ret;
		case 0x1E /*VT_LPSTR*/: return parse_lpstr(blob, t, 4).replace(chr0, "");
		case 0x1F : return parse_lpwstr(blob);
		case 0x40 /*VT_FILETIME*/: return parse_FILETIME(blob);
		case 0x41 /*VT_BLOB*/: return parse_BLOB(blob);
		case 0x47 /*VT_CF*/: return parse_ClipboardData(blob);
		case 0x50 /*VT_STRING*/: return parse_VtString(blob, t, !opts.raw).replace(chr0, "");
		case 0x51 /*VT_USTR*/: return parse_VtUnalignedString(blob, t/*, 4*/).replace(chr0, "");
		case 0x100C /*VT_VECTOR|VT_VARIANT*/: return parse_VtVecHeadingPair(blob);
		case 0x101E /*VT_LPSTR*/: return parse_VtVecUnalignedLpstr(blob);
		default:
			throw new Error(`TypedPropertyValue unrecognized type ${type} ${t}`);
	}
}
function write_TypedPropertyValue(type, value) {
	var o = new_buf(4),
		p = new_buf(4);
	o.write_shift(4, type == 0x50 ? 0x1F : type);
	switch(type) {
		case 0x03 /*VT_I4*/: p.write_shift(-4, value); break;
		case 0x05 /*VT_I4*/: p = new_buf(8); p.write_shift(8, value, "f"); break;
		case 0x0B /*VT_BOOL*/: p.write_shift(4, value ? 0x01 : 0x00); break;
		case 0x40 /*VT_FILETIME*/: /*:: if (typeof value !== "string" && !(value instanceof Date)) throw "unreachable"; */ p = write_FILETIME(value); break;
		case 0x1F :
		case 0x50 /*VT_STRING*/:
			/*:: if (typeof value !== "string") throw "unreachable"; */
			p = new_buf(4 + 2 * (value.length + 1) + (value.length % 2 ? 0 : 2));
			p.write_shift(4, value.length + 1);
			p.write_shift(0, value, "dbcs");
			while(p.l != p.length) p.write_shift(1, 0);
			break;
		default:
			throw new Error(`TypedPropertyValue unrecognized type ${type} ${value}`);
	}
	return bconcat([o, p]);
}

/* [MS-OLEPS] 2.20 PropertySet */
function parse_PropertySet(blob, PIDSI) {
	var start_addr = blob.l,
		size = blob.read_shift(4),
		NumProps = blob.read_shift(4),
		Props = [],
		i = 0,
		CodePage = 0,
		Dictionary = -1,
		DictObj = {};
	for (i=0; i!=NumProps; ++i) {
		var PropID = blob.read_shift(4),
			Offset = blob.read_shift(4);
		Props[i] = [PropID, Offset + start_addr];
	}
	Props.sort((x, y) => x[1] - y[1]);

	var PropH = {};
	for (i=0; i!=NumProps; ++i) {
		if (blob.l !== Props[i][1]) {
			var fail = true;
			if (i>0 && PIDSI) {
				switch(PIDSI[Props[i-1][0]].t) {
					case 0x02 /*VT_I2*/:
						if (blob.l+2 === Props[i][1]) {
							blob.l += 2;
							fail = false;
						}
						break;
					case 0x50 /*VT_STRING*/:
						if (blob.l <= Props[i][1]) {
							blob.l = Props[i][1];
							fail = false;
						}
						break;
					case 0x100C /*VT_VECTOR|VT_VARIANT*/:
						if (blob.l <= Props[i][1]) {
							blob.l = Props[i][1];
							fail = false;
						}
						break;
				}
			}
			if ((!PIDSI || i==0) && blob.l <= Props[i][1]) {
				fail=false;
				blob.l = Props[i][1];
			}
			if (fail) {
				throw new Error(`Read Error: Expected address ${Props[i][1]} at ${blob.l} : ${i}`);
			}
		}
		if (PIDSI) {
			var piddsi = PIDSI[Props[i][0]];
			PropH[piddsi.n] = parse_TypedPropertyValue(blob, piddsi.t, { raw: true });
			if (piddsi.p === "version") {
				PropH[piddsi.n] = String(PropH[piddsi.n] >> 16) +"."+ ("0000"+ String(PropH[piddsi.n] & 0xFFFF)).slice(-4);
			}
			if (piddsi.n == "CodePage") {
				switch(PropH[piddsi.n]) {
					case 0: PropH[piddsi.n] = 1252;
						/* falls through */
					case 874:
					case 932:
					case 936:
					case 949:
					case 950:
					case 1250:
					case 1251:
					case 1253:
					case 1254:
					case 1255:
					case 1256:
					case 1257:
					case 1258:
					case 10000:
					case 1200:
					case 1201:
					case 1252:
					case 65000:
					case 65001:
					case -536:
					case -535:
						set_cp(CodePage = (PropH[piddsi.n]>>>0) & 0xFFFF);
						break;
					default:
						throw new Error(`Unsupported CodePage: ${PropH[piddsi.n]}`);
				}
			}
		} else {
			if (Props[i][0] === 0x1) {
				CodePage = PropH.CodePage = parse_TypedPropertyValue(blob, VT_I2);
				set_cp(CodePage);
				if (Dictionary !== -1) {
					var oldpos = blob.l;
					blob.l = Props[Dictionary][1];
					DictObj = parse_dictionary(blob, CodePage);
					blob.l = oldpos;
				}
			} else if (Props[i][0] === 0) {
				if (CodePage === 0) {
					Dictionary = i;
					blob.l = Props[i+1][1];
					continue;
				}
				DictObj = parse_dictionary(blob, CodePage);
			} else {
				var name = DictObj[Props[i][0]],
					val;
				/* [MS-OSHARED] 2.3.3.2.3.1.2 + PROPVARIANT */
				switch(blob[blob.l]) {
					case 0x41 /*VT_BLOB*/: blob.l += 4; val = parse_BLOB(blob); break;
					case 0x1E /*VT_LPSTR*/: blob.l += 4; val = parse_VtString(blob, blob[blob.l-4]).replace(/\u0000+$/, ""); break;
					case 0x1F : blob.l += 4; val = parse_VtString(blob, blob[blob.l-4]).replace(/\u0000+$/, ""); break;
					case 0x03 /*VT_I4*/: blob.l += 4; val = blob.read_shift(4, "i"); break;
					case 0x13 /*VT_UI4*/: blob.l += 4; val = blob.read_shift(4); break;
					case 0x05 /*VT_R8*/: blob.l += 4; val = blob.read_shift(8, "f"); break;
					case 0x0B /*VT_BOOL*/: blob.l += 4; val = parsebool(blob, 4); break;
					case 0x40 /*VT_FILETIME*/: blob.l += 4; val = parseDate(parse_FILETIME(blob)); break;
					default: throw new Error(`unparsed value: ${blob[blob.l]}`);
				}
				PropH[name] = val;
			}
		}
	}
	blob.l = start_addr + size; /* step ahead to skip padding */
	return PropH;
}

var XLSPSSkip = [ "CodePage", "Thumbnail", "_PID_LINKBASE", "_PID_HLINKS", "SystemIdentifier", "FMTID" ].concat(PseudoPropsPairs);

function guess_property_type(val) {
	switch(typeof val) {
		case "boolean": return 0x0B;
		case "number": return ((val|0) == val) ? 0x03 : 0x05;
		case "string": return 0x1F;
		case "object": if (val instanceof Date) return 0x40; break;
	}
	return -1;
}

function write_PropertySet(entries, RE, PIDSI) {
	var hdr = new_buf(8),
		piao = [],
		prop = [],
		sz = 8,
		i = 0,
		pr = new_buf(8),
		pio = new_buf(8);
	pr.write_shift(4, 0x0002);
	pr.write_shift(4, 0x04B0);
	pio.write_shift(4, 0x0001);
	prop.push(pr);
	piao.push(pio);
	sz += 8 + pr.length;

	if (!RE) {
		pio = new_buf(8);
		pio.write_shift(4, 0);
		piao.unshift(pio);

		var bufs = [new_buf(4)];
		bufs[0].write_shift(4, entries.length);
		for (i=0; i<entries.length; ++i) {
			var value = entries[i][0];
			pr = new_buf(4 + 4 + 2 * (value.length + 1) + (value.length % 2 ? 0 : 2));
			pr.write_shift(4, i + 2);
			pr.write_shift(4, value.length + 1);
			pr.write_shift(0, value, "dbcs");
			while(pr.l != pr.length) pr.write_shift(1, 0);
			bufs.push(pr);
		}
		pr = bconcat(bufs);
		prop.unshift(pr);
		sz += 8 + pr.length;
	}

	for (i=0; i<entries.length; ++i) {
		if (RE && !RE[entries[i][0]]) continue;
		if (XLSPSSkip.indexOf(entries[i][0]) > -1) continue;
		if (entries[i][1] == null) continue;

		var val = entries[i][1],
			idx = 0;
		if (RE) {
			idx = +RE[entries[i][0]];
			var pinfo = PIDSI[idx];
			if (pinfo.p == "version" && typeof val == "string") {
				var arr = val.split(".");
				val = ((+arr[0]) << 16) + ((+arr[1]) || 0);
			}
			pr = write_TypedPropertyValue(pinfo.t, val);
		} else {
			var T = guess_property_type(val);
			if (T == -1) {
				T = 0x1F;
				val = String(val);
			}
			pr = write_TypedPropertyValue(T, val);
		}
		prop.push(pr);

		pio = new_buf(8);
		pio.write_shift(4, !RE ? 2 + i : idx);
		piao.push(pio);

		sz += 8 + pr.length;
	}

	var w = 8 * (prop.length + 1);
	for (i=0; i<prop.length; ++i) {
		piao[i].write_shift(4, w);
		w += prop[i].length;
	}
	hdr.write_shift(4, sz);
	hdr.write_shift(4, prop.length);
	
	return bconcat([hdr].concat(piao).concat(prop));
}

/* [MS-OLEPS] 2.21 PropertySetStream */
function parse_PropertySetStream(file, PIDSI, clsid) {
	var blob = file.content;
	if (!blob) return {};
	prep_blob(blob, 0);

	var NumSets,
		FMTID0,
		FMTID1,
		Offset0,
		Offset1 = 0;
	blob.chk( "feff", "Byte Order: ");

	blob.read_shift(2);
	var SystemIdentifier = blob.read_shift(4),
		CLSID = blob.read_shift(16);
	if (CLSID !== CFB.utils.consts.HEADER_CLSID && CLSID !== clsid) {
		throw new Error(`Bad PropertySet CLSID ${CLSID}`);
	}
	NumSets = blob.read_shift(4);
	if (NumSets !== 1 && NumSets !== 2) {
		throw new Error(`Unrecognized #Sets: ${NumSets}`);
	}
	FMTID0 = blob.read_shift(16);
	Offset0 = blob.read_shift(4);

	if (NumSets === 1 && Offset0 !== blob.l) {
		throw new Error(`Length mismatch: ${Offset0} !== ${blob.l}`);
	} else if (NumSets === 2) {
		FMTID1 = blob.read_shift(16);
		Offset1 = blob.read_shift(4);
	}
	var PSet0 = parse_PropertySet(blob, PIDSI),
		rval = { SystemIdentifier };
	for (var y in PSet0) rval[y] = PSet0[y];
	//rval.blob = blob;
	rval.FMTID = FMTID0;
	//rval.PSet0 = PSet0;
	if (NumSets === 1) return rval;
	if (Offset1 - blob.l == 2) blob.l += 2;
	if (blob.l !== Offset1) {
		throw new Error(`Length mismatch 2: ${blob.l} !== ${Offset1}`);
	}
	
	var PSet1;
	try {
		PSet1 = parse_PropertySet(blob, null);
	} catch(e) {}

	for (y in PSet1) rval[y] = PSet1[y];
	rval.FMTID = [FMTID0, FMTID1];

	return rval;
}
function write_PropertySetStream(entries, clsid, RE, PIDSI, entries2, clsid2) {
	var hdr = new_buf(entries2 ? 68 : 48),
		bufs = [hdr],
		ps0 = write_PropertySet(entries, RE, PIDSI);
	hdr.write_shift(2, 0xFFFE);
	hdr.write_shift(2, 0x0000);
	hdr.write_shift(4, 0x32363237);
	hdr.write_shift(16, CFB.utils.consts.HEADER_CLSID, "hex");
	hdr.write_shift(4, (entries2 ? 2 : 1));
	hdr.write_shift(16, clsid, "hex");
	hdr.write_shift(4, (entries2 ? 68 : 48));
	bufs.push(ps0);

	if (entries2) {
		var ps1 = write_PropertySet(entries2, null, null);
		hdr.write_shift(16, clsid2, "hex");
		hdr.write_shift(4, 68 + ps0.length);
		bufs.push(ps1);
	}

	return bconcat(bufs);
}

function parsenoop2(blob, length) {
	blob.read_shift(length);
	return null;
}

function writezeroes(n, o) {
	if (!o) o = new_buf(n);
	for (var j=0; j<n; ++j) o.write_shift(1, 0);
	return o;
}

function parslurp(blob, length, cb) {
	var arr = [],
		target = blob.l + length;
	while(blob.l < target) arr.push(cb(blob, target - blob.l));
	if (target !== blob.l) throw new Error("Slurp error");
	return arr;
}

function parsebool(blob, length) {
	return blob.read_shift(length) === 0x1;
}

function writebool(v, o) {
	if (!o) o = new_buf(2);
	o.write_shift(2, +!!v);
	return o;
}

function parseuint16(blob) {
	return blob.read_shift(2, "u");
}

function writeuint16(v, o) {
	if (!o) o = new_buf(2);
	o.write_shift(2, v);
	return o;
}

function parseuint16a(blob, length) {
	return parslurp(blob,length,parseuint16);
}

/* --- 2.5 Structures --- */

/* [MS-XLS] 2.5.10 Bes (boolean or error) */
function parse_Bes(blob) {
	var v = blob.read_shift(1),
		t = blob.read_shift(1);
	return t === 0x01 ? v : v === 0x01;
}

function write_Bes(v, t/*:string*/, o) {
	if (!o) o = new_buf(2);
	o.write_shift(1, +v);
	o.write_shift(1, ((t == "e") ? 1 : 0));
	return o;
}

/* [MS-XLS] 2.5.240 ShortXLUnicodeString */
function parse_ShortXLUnicodeString(blob, length, opts) {
	var cch = blob.read_shift(opts && opts.biff >= 12 ? 2 : 1),
		encoding = "sbcs-cont",
		cp = current_codepage;
	if (opts && opts.biff >= 8) current_codepage = 1200;
	if (!opts || opts.biff == 8 ) {
		var fHighByte = blob.read_shift(1);
		if (fHighByte) {
			encoding = "dbcs-cont";
		}
	} else if (opts.biff == 12) {
		encoding = "wstr";
	}
	if (opts.biff >= 2 && opts.biff <= 5) encoding = "cpstr";
	var o = cch ? blob.read_shift(cch, encoding) : "";
	current_codepage = cp;
	return o;
}

/* 2.5.293 XLUnicodeRichExtendedString */
function parse_XLUnicodeRichExtendedString(blob) {
	var cp = current_codepage;
	current_codepage = 1200;
	var cch = blob.read_shift(2),
		flags = blob.read_shift(1),
		fExtSt = flags & 0x4,
		fRichSt = flags & 0x8,
		width = 1 + (flags & 0x1),
		cRun = 0, cbExtRst,
		z = {};

	if (fRichSt) cRun = blob.read_shift(2);
	if (fExtSt) cbExtRst = blob.read_shift(4);
	
	var encoding = width == 2 ? "dbcs-cont" : "sbcs-cont",
		msg = cch === 0 ? "" : blob.read_shift(cch, encoding);
	
	if (fRichSt) blob.l += 4 * cRun;
	if (fExtSt) blob.l += cbExtRst;
	z.t = msg;
	if (!fRichSt) {
		z.raw = "<t>"+ z.t +"</t>";
		z.r = z.t;
	}
	current_codepage = cp;
	return z;
}

function write_XLUnicodeRichExtendedString(xlstr) {
	var str = (xlstr.t||""),
		nfmts = 1,
		hdr = new_buf(3 + (nfmts > 1 ? 2 : 0));
	hdr.write_shift(2, str.length);
	hdr.write_shift(1, (nfmts > 1 ? 0x08 : 0x00) | 0x01);
	if (nfmts > 1) hdr.write_shift(2, nfmts);

	var otext = new_buf(2 * str.length);
	otext.write_shift(2 * str.length, str, "utf16le");

	var out = [hdr, otext];

	return bconcat(out);
}

/* 2.5.296 XLUnicodeStringNoCch */
function parse_XLUnicodeStringNoCch(blob, cch, opts) {
	if (opts) {
		if (opts.biff >= 2 && opts.biff <= 5) return blob.read_shift(cch, "cpstr");
		if (opts.biff >= 12) return blob.read_shift(cch, "dbcs-cont");
	}
	var fHighByte = blob.read_shift(1),
		retval = fHighByte === 0
			? blob.read_shift(cch, "sbcs-cont")
			: blob.read_shift(cch, "dbcs-cont");
	return retval;
}

/* 2.5.294 XLUnicodeString */
function parse_XLUnicodeString(blob, length, opts) {
	var cch = blob.read_shift(opts && opts.biff == 2 ? 1 : 2);
	if (cch === 0) {
		blob.l++;
		return "";
	}
	return parse_XLUnicodeStringNoCch(blob, cch, opts);
}

/* BIFF5 override */
function parse_XLUnicodeString2(blob, length, opts) {
	if (opts.biff > 5) return parse_XLUnicodeString(blob, length, opts);
	var cch = blob.read_shift(1);
	if (cch === 0) {
		blob.l++;
		return "";
	}
	return blob.read_shift(cch, (opts.biff <= 4 || !blob.lens ) ? "cpstr" : "sbcs-cont");
}

/* TODO: BIFF5 and lower, codepage awareness */
function write_XLUnicodeString(str, opts, o) {
	if (!o) o = new_buf(3 + 2 * str.length);
	o.write_shift(2, str.length);
	o.write_shift(1, 1);
	o.write_shift(31, str, "utf16le");
	return o;
}

/* [MS-XLS] 2.5.61 ControlInfo */
function parse_ControlInfo(blob) {
	var flags = blob.read_shift(1);
	blob.l++;
	var accel = blob.read_shift(2);
	blob.l += 2;
	return [flags, accel];
}

/* [MS-OSHARED] 2.3.7.6 URLMoniker TODO: flags */
function parse_URLMoniker(blob) {
	var len = blob.read_shift(4),
		start = blob.l,
		extra = false;
	if (len > 24) {
		/* look ahead */
		blob.l += len - 24;
		if (blob.read_shift(16) === "795881f43b1d7f48af2c825dc4852763") extra = true;
		blob.l = start;
	}
	var url = blob.read_shift((extra?len-24:len)>>1, "utf16le").replace(chr0,"");
	if (extra) blob.l += 24;
	return url;
}

/* [MS-OSHARED] 2.3.7.8 FileMoniker TODO: all fields */
function parse_FileMoniker(blob) {
	blob.l += 2;
	var ansiPath = blob.read_shift(0, "lpstr-ansi");
	blob.l += 2;
	if (blob.read_shift(2) != 0xDEAD) throw new Error("Bad FileMoniker");
	var sz = blob.read_shift(4);
	if (sz === 0) return ansiPath.replace(/\\/g,"/");
	var bytes = blob.read_shift(4);
	if (blob.read_shift(2) != 3) throw new Error("Bad FileMoniker");
	var unicodePath = blob.read_shift(bytes >> 1, "utf16le").replace(chr0, "");
	return unicodePath;
}

/* [MS-OSHARED] 2.3.7.2 HyperlinkMoniker TODO: all the monikers */
function parse_HyperlinkMoniker(blob, length) {
	var clsid = blob.read_shift(16);
	length -= 16;
	switch(clsid) {
		case "e0c9ea79f9bace118c8200aa004ba90b": return parse_URLMoniker(blob, length);
		case "0303000000000000c000000000000046": return parse_FileMoniker(blob, length);
		default: throw new Error("Unsupported Moniker " + clsid);
	}
}

/* [MS-OSHARED] 2.3.7.9 HyperlinkString */
function parse_HyperlinkString(blob) {
	var len = blob.read_shift(4),
		o = len > 0 ? blob.read_shift(len, "utf16le").replace(chr0, "") : "";
	return o;
}

/* [MS-OSHARED] 2.3.7.1 Hyperlink Object */
function parse_Hyperlink(blob, length) {
	var end = blob.l + length,
		sVer = blob.read_shift(4);
	if (sVer !== 2) {
		throw new Error(`Unrecognized streamVersion: ${sVer}`);
	}
	var flags = blob.read_shift(2);
	blob.l += 2;
	var displayName,
		targetFrameName,
		moniker,
		oleMoniker,
		Loc="",
		guid,
		fileTime;
	if (flags & 0x0010) displayName = parse_HyperlinkString(blob, end - blob.l);
	if (flags & 0x0080) targetFrameName = parse_HyperlinkString(blob, end - blob.l);
	if ((flags & 0x0101) === 0x0101) moniker = parse_HyperlinkString(blob, end - blob.l);
	if ((flags & 0x0101) === 0x0001) oleMoniker = parse_HyperlinkMoniker(blob, end - blob.l);
	if (flags & 0x0008) Loc = parse_HyperlinkString(blob, end - blob.l);
	if (flags & 0x0020) guid = blob.read_shift(16);
	if (flags & 0x0040) fileTime = parse_FILETIME(blob);
	blob.l = end;
	var target = targetFrameName || moniker || oleMoniker || "";
	if (target && Loc) target += "#"+ Loc;
	if (!target) target = "#"+ Loc;
	var out = { Target: target };
	if (guid) out.guid = guid;
	if (fileTime) out.time = fileTime;
	if (displayName) out.Tooltip = displayName;
	return out;
}

function write_Hyperlink(hl) {
	var out = new_buf(512),
		i = 0,
		Target = hl.Target,
		F = Target.indexOf("#") > -1 ? 0x1f : 0x17;
	switch(Target.charAt(0)) {
		case "#": F=0x1c; break;
		case ".": F&=~2; break;
	}
	out.write_shift(4, 2);
	out.write_shift(4, F);
	var data = [8,6815827,6619237,4849780,83];
	for (i=0; i<data.length; ++i) out.write_shift(4, data[i]);
	if (F == 0x1C) {
		Target = Target.slice(1);
		out.write_shift(4, Target.length + 1);
		for (i=0; i<Target.length; ++i) out.write_shift(2, Target.charCodeAt(i));
		out.write_shift(2, 0);
	} else if (F & 0x02) {
		data = "e0 c9 ea 79 f9 ba ce 11 8c 82 00 aa 00 4b a9 0b".split(" ");
		for (i = 0; i < data.length; ++i) out.write_shift(1, parseInt(data[i], 16));
		out.write_shift(4, 2 * (Target.length + 1));
		for (i = 0; i < Target.length; ++i) out.write_shift(2, Target.charCodeAt(i));
		out.write_shift(2, 0);
	} else {
		data = "03 03 00 00 00 00 00 00 c0 00 00 00 00 00 00 46".split(" ");
		for (i = 0; i < data.length; ++i) out.write_shift(1, parseInt(data[i], 16));
		var P = 0;
		while(Target.slice(P * 3, P * 3 + 3) == "../" || Target.slice(P * 3, P * 3 + 3) == "..\\") ++P;
		out.write_shift(2, P);
		out.write_shift(4, Target.length + 1);
		for (i = 0; i < Target.length; ++i) out.write_shift(1, Target.charCodeAt(i) & 0xFF);
		out.write_shift(1, 0);
		out.write_shift(2, 0xFFFF);
		out.write_shift(2, 0xDEAD);
		for (i=0; i<6; ++i) out.write_shift(4, 0);
	}
	return out.slice(0, out.l);
}

/* 2.5.178 LongRGBA */
function parse_LongRGBA(blob) {
	var r = blob.read_shift(1),
	g = blob.read_shift(1),
	b = blob.read_shift(1),
	a = blob.read_shift(1);
	return [r,g,b,a];
}

/* 2.5.177 LongRGB */
function parse_LongRGB(blob, length) {
	var x = parse_LongRGBA(blob, length);
	x[3] = 0;
	return x;
}



	
/* 18.4.7 rPr CT_RPrElt */
function parse_rpr(rpr) {
	var font = {},
		m = rpr.match(tagregex),
		i = 0,
		pass = false;
	if (m) for (; i!=m.length; ++i) {
		var y = parsexmltag(m[i]);
		switch (y[0].replace(/\w*:/g, "")) {
			/* 18.8.12 condense CT_BooleanProperty */
			/* ** not required . */
			case "<condense": break;
			/* 18.8.17 extend CT_BooleanProperty */
			/* ** not required . */
			case "<extend": break;
			/* 18.8.36 shadow CT_BooleanProperty */
			/* ** not required . */
			case "<shadow": if (!y.val) break;
			/* falls through */
			case "<shadow>":
			case "<shadow/>": font.shadow = 1; break;
			case "</shadow>": break;

			/* 18.4.1 charset CT_IntProperty TODO */
			case "<charset":
				if (y.val == "1") break;
				font.cp = CS2CP[parseInt(y.val, 10)];
				break;

			/* 18.4.2 outline CT_BooleanProperty TODO */
			case "<outline": if (!y.val) break;
			/* falls through */
			case "<outline>":
			case "<outline/>": font.outline = 1; break;
			case "</outline>": break;

			/* 18.4.5 rFont CT_FontName */
			case "<rFont": font.name = y.val; break;

			/* 18.4.11 sz CT_FontSize */
			case "<sz": font.sz = y.val; break;

			/* 18.4.10 strike CT_BooleanProperty */
			case "<strike": if (!y.val) break;
				/* falls through */
			case "<strike>":
			case "<strike/>": font.strike = 1; break;
			case "</strike>": break;

			/* 18.4.13 u CT_UnderlineProperty */
			case "<u":
				if (!y.val) break;
				switch (y.val) {
					case "double": font.uval = "double"; break;
					case "singleAccounting": font.uval = "single-accounting"; break;
					case "doubleAccounting": font.uval = "double-accounting"; break;
				}
				/* falls through */
			case "<u>":
			case "<u/>": font.u = 1; break;
			case "</u>": break;

			/* 18.8.2 b */
			case "<b":
				if (y.val == "0") break;
				/* falls through */
			case "<b>":
			case "<b/>": font.b = 1; break;
			case "</b>": break;

			/* 18.8.26 i */
			case "<i":
				if (y.val == "0") break;
				/* falls through */
			case "<i>":
			case "<i/>": font.i = 1; break;
			case "</i>": break;

			/* 18.3.1.15 color CT_Color TODO: tint, theme, auto, indexed */
			case "<color":
				if (y.rgb) font.color = y.rgb;
				break;

			/* 18.8.18 family ST_FontFamily */
			case "<family": font.family = y.val; break;

			/* 18.4.14 vertAlign CT_VerticalAlignFontProperty TODO */
			case "<vertAlign": font.valign = y.val; break;

			/* 18.8.35 scheme CT_FontScheme TODO */
			case "<scheme": break;

			/* 18.2.10 extLst CT_ExtensionList ? */
			case "<extLst":
			case "<extLst>":
			case "</extLst>": break;
			case "<ext": pass = true; break;
			case "</ext>": pass = false; break;
			default:
				if (y[0].charCodeAt(1) !== 47 && !pass) {
					throw new Error(`Unrecognized rich format ${y[0]}`);
				}
		}
	}
	return font;
}

var parse_rs = (function() {
		var tregex = matchtag("t"),
			rpregex = matchtag("rPr");
		/* 18.4.4 r CT_RElt */
		function parse_r(r) {
			/* 18.4.12 t ST_Xstring */
			var t = r.match(tregex)/*, cp = 65001*/;
			if (!t) return { t: "s", v: "" };
			var o = { t: "s", v: unescapexml(t[1]) },
				rpr = r.match(rpregex);
			if (rpr) o.s = parse_rpr(rpr[1]);
			return o;
		}
		var rregex = /<(?:\w+:)?r>/g,
			rend = /<\/(?:\w+:)?r>/;
		return rs => rs.replace(rregex, "").split(rend).map(parse_r).filter(r => r.v);
	})();


/* Parse a list of <r> tags */
var rs_to_html = (function() {
		var nlregex = /(\r\n|\n)/g;

		function parse_rpr2(font, intro, outro) {
			var style = [];
			
			if (font.u) style.push(`text-decoration:underline;`);
			if (font.uval) style.push(`text-underline-style:${font.uval};`);
			if (font.sz) style.push(`font-size:${font.sz * (96/72)}px;`);
			if (font.outline) style.push(`text-effect:outline;`);
			if (font.shadow) style.push(`text-shadow:auto;`);
			if (font.color !== "000000") style.push(`color:#${font.color};`);
			
			intro.push(`<span style="${style.join("")}">`);

			if (font.b) {
				intro.push("<b>");
				outro.push("</b>");
			}
			if (font.i) {
				intro.push("<i>");
				outro.push("</i>");
			}
			if (font.strike) {
				intro.push("<s>");
				outro.push("</s>");
			}

			var align = font.valign || "";
			if (align == "superscript" || align == "super") align = "sup";
			else if (align == "subscript") align = "sub";
			
			if (align != "") {
				intro.push("<"+ align +">");
				outro.push("</"+ align +">");
			}

			outro.push("</span>");
			return font;
		}

		/* 18.4.4 r CT_RElt */
		function r_to_html(r) {
			var terms = [[], r.v, []];
			if (!r.v) return "";

			if (r.s) parse_rpr2(r.s, terms[0], terms[2]);

			return terms[0].join("") + terms[1].replace(nlregex, "<br/>") + terms[2].join("");
		}

		return rs => rs.map(r_to_html).join("");
	})();

/* 18.4.8 si CT_Rst */
var sitregex = /<(?:\w+:)?t[^>]*>([^<]*)<\/(?:\w+:)?t>/g,
	sirregex = /<(?:\w+:)?r>/,
	sirphregex = /<(?:\w+:)?rPh.*?>([\s\S]*?)<\/(?:\w+:)?rPh>/g,
	sstr0 = /<(?:\w+:)?sst([^>]*)>([\s\S]*)<\/(?:\w+:)?sst>/,
	sstr1 = /<(?:\w+:)?(?:si|sstItem)>/g,
	sstr2 = /<\/(?:\w+:)?(?:si|sstItem)>/,
	straywsregex = /^\s|\s$|[\t\n\r]/;

RELS.SST = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings";

function parse_si(x, opts) {
	var html = opts ? opts.cellHTML : true,
		z = {};
	if (!x) return { t: "" };
	/* 18.4.12 t ST_Xstring (Plaintext String) */
	if (x.match(/^\s*<(?:\w+:)?t[^>]*>/)) {
		z.t = unescapexml(utf8read(x.slice(x.indexOf(">") + 1).split(/<\/(?:\w+:)?t>/)[0] || ""));
		z.r = utf8read(x);
		if (html) z.h = escapehtml(z.t);
	} else if (x.match(sirregex)) {
		/* 18.4.4 r CT_RElt (Rich Text Run) */
		z.r = utf8read(x);
		z.t = unescapexml(utf8read((x.replace(sirphregex, "").match(sitregex) || []).join("").replace(tagregex, "")));
		if (html) z.h = rs_to_html(parse_rs(z.r));
	}
	/* 18.4.3 phoneticPr CT_PhoneticPr (TODO: needed for Asian support) */
	/* 18.4.6 rPh CT_PhoneticRun (TODO: needed for Asian support) */
	return z;
}

/* 18.4 Shared String Table */
function parse_sst_xml(data, opts) {
	var s = [],
		ss = "";
	if (!data) return s;
	/* 18.4.9 sst CT_Sst */
	var sst = data.match(sstr0);
	if (sst) {
		ss = sst[2].replace(sstr1, "").split(sstr2);
		for (var i=0; i!=ss.length; ++i) {
			var o = parse_si(ss[i].trim(), opts);
			if (o != null) s[s.length] = o;
		}
		sst = parsexmltag(sst[1]);
		s.Count = sst.count;
		s.Unique = sst.uniqueCount;
	}
	return s;
}

function write_sst_xml(sst, opts) {
	if (!opts.bookSST) return "";
	var o = [XML_HEADER];
	o[o.length] = writextag("sst", null, {
			xmlns: XMLNS.main[0],
			count: sst.Count,
			uniqueCount: sst.Unique
		});
	for (var i=0; i!=sst.length; ++i) {
		if (sst[i] == null) continue;
		var s = sst[i],
			sitag = "<si>";
		if (s.t.startsWith("<r>")) sitag += s.t;
		else {
			sitag += "<t";
			if (!s.t) s.t = "";
			if (s.t.match(straywsregex)) sitag += ' xml:space="preserve"';
			sitag += ">"+ s.t +"</t>";
			// sitag += ">"+ escapexml(s.t) +"</t>";
		}
		sitag += "</si>";
		o[o.length] = (sitag);
	}
	if (o.length > 2){
		o[o.length] = "</sst>";
		o[1] = o[1].replace("/>", ">");
	}

	return o.join("");
}

	
function hex2RGB(h) {
	var o = h.slice(h[0] === "#" ? 1 : 0).slice(0, 6);
	return [parseInt(o.slice(0, 2), 16),parseInt(o.slice(2, 4), 16),parseInt(o.slice(4, 6), 16)];
}

function rgb2Hex(rgb) {
	for (var i=0, o=1; i!=3; ++i) {
		o = o * 256 + (rgb[i] > 255 ? 255 : rgb[i] < 0 ? 0 : rgb[i]);
	}
	return o.toString(16).toUpperCase().slice(1);
}

function rgb2HSL(rgb) {
	var R = rgb[0] / 255,
		G = rgb[1] / 255,
		B = rgb[2] / 255,
		M = Math.max(R, G, B),
		m = Math.min(R, G, B),
		C = M - m;
	if (C === 0) return [0, 0, R];

	var H6 = 0,
		S = 0,
		L2 = M + m;
	S = C / (L2 > 1 ? 2 - L2 : L2);
	switch(M){
		case R: H6 = ((G - B) / C + 6) % 6; break;
		case G: H6 = ((B - R) / C + 2); break;
		case B: H6 = ((R - G) / C + 4); break;
	}

	return [H6 / 6, S, L2 / 2];
}

function hsl2RGB(hsl){
	var H = hsl[0],
		S = hsl[1],
		L = hsl[2],
		C = S * 2 * (L < 0.5 ? L : 1 - L),
		m = L - C / 2,
		rgb = [m, m, m],
		h6 = 6 * H,
		X;
	if (S !== 0) {
		switch(h6|0) {
			case 0:
			case 6: X = C * h6;       rgb[0] += C; rgb[1] += X; break;
			case 1: X = C * (2 - h6); rgb[0] += X; rgb[1] += C; break;
			case 2: X = C * (h6 - 2); rgb[1] += C; rgb[2] += X; break;
			case 3: X = C * (4 - h6); rgb[1] += X; rgb[2] += C; break;
			case 4: X = C * (h6 - 4); rgb[2] += C; rgb[0] += X; break;
			case 5: X = C * (6 - h6); rgb[2] += X; rgb[0] += C; break;
		}
	}
	for (var i=0; i!=3; ++i) {
		rgb[i] = Math.round(rgb[i] * 255);
	}
	return rgb;
}

/* 18.8.3 bgColor tint algorithm */
function rgb_tint(hex, tint) {
	if (tint === 0) return hex;
	var hsl = rgb2HSL(hex2RGB(hex));
	if (tint < 0) hsl[2] = hsl[2] * (1 + tint);
	else hsl[2] = 1 - (1 - hsl[2]) * (1 - tint);
	return rgb2Hex(hsl2RGB(hsl));
}

/* 18.3.1.13 width calculations */
/* [MS-OI29500] 2.1.595 Column Width & Formatting */
var DEF_MDW = 6,
	MAX_MDW = 15,
	MIN_MDW = 1,
	MDW = DEF_MDW,
	DEF_PPI = 96,
	PPI = DEF_PPI,
	/* [MS-EXSPXML3] 2.4.54 ST_enmPattern */
	XLMLPatternTypeMap = {
		"None": "none",
		"Solid": "solid",
		"Gray50": "mediumGray",
		"Gray75": "darkGray",
		"Gray25": "lightGray",
		"HorzStripe": "darkHorizontal",
		"VertStripe": "darkVertical",
		"ReverseDiagStripe": "darkDown",
		"DiagStripe": "darkUp",
		"DiagCross": "darkGrid",
		"ThickDiagCross": "darkTrellis",
		"ThinHorzStripe": "lightHorizontal",
		"ThinVertStripe": "lightVertical",
		"ThinReverseDiagStripe": "lightDown",
		"ThinHorzCross": "lightGrid"
	};

function width2px(width) {
	return Math.floor(( width + Math.round(128 / MDW) / 256) * MDW );
}

function px2char(px) {
	return (Math.floor((px - 5)/MDW * 100 + 0.5)) / 100;
}

function char2width(chr) {
	return (Math.round((chr * MDW + 5) / MDW * 256)) / 256;
}

function cycle_width(collw) {
	return char2width(px2char(width2px(collw)));
}

function px2pt(px) {
	return px * 96 / PPI;
}

function pt2px(pt) {
	return pt * PPI / 96;
}

/* XLSX/XLSB/XLS specify width in units of MDW */
function find_mdw_colw(collw) {
	var delta = Math.abs(collw - cycle_width(collw)),
		_MDW = MDW;
	if (delta > 0.005) {
		for (MDW=MIN_MDW; MDW<MAX_MDW; ++MDW) {
			if (Math.abs(collw - cycle_width(collw)) <= delta) {
				delta = Math.abs(collw - cycle_width(collw));
				_MDW = MDW;
			}
		}
	}
	MDW = _MDW;
}

function process_col(coll) {
	if (coll.width) {
		coll.wpx = width2px(coll.width);
		coll.wch = px2char(coll.wpx);
		coll.MDW = MDW;
	} else if (coll.wpx) {
		coll.wch = px2char(coll.wpx);
		coll.width = char2width(coll.wch);
		coll.MDW = MDW;
	} else if (typeof coll.wch == "number") {
		coll.width = char2width(coll.wch);
		coll.wpx = width2px(coll.width);
		coll.MDW = MDW;
	}
	if (coll.customWidth) delete coll.customWidth;
}

	
var cellXF_uint = [ "numFmtId", "fillId", "fontId", "borderId", "xfId" ],
	cellXF_bool = [ "applyAlignment", "applyBorder", "applyFill", "applyFont", "applyNumberFormat", "applyProtection", "pivotButton", "quotePrefix" ],
	STYLES_XML_ROOT = writextag("styleSheet", null, {
		"xmlns": XMLNS.main[0],
		"xmlns:vt": XMLNS.vt
	});

RELS.STY = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles";

/* 18.8.5 borders CT_Borders */
function parse_borders(t, styles, themes, opts) {
	styles.Borders = [];
	var border = {},
		pass = false,
		index;
	// console.log(t[0]);
	(t[0].match(tagregex) || []).forEach(function(x) {
		var y = parsexmltag(x),
			thickness;
		switch (strip_ns(y[0])) {
			case "<borders":
			case "<borders>":
			case "</borders>":
				break;

			/* 18.8.4 border CT_Border */
			case "<border":
			case "<border>":
			case "<border/>":
				border = {
					style: [...Array(4)].map(i => "solid"),
					width: [...Array(4)].map(i => 0),
					color: [...Array(4)].map(i => "000"),
				};
				if (y.diagonalUp) border.diagonalUp = parsexmlbool(y.diagonalUp);
				if (y.diagonalDown) border.diagonalDown = parsexmlbool(y.diagonalDown);
				styles.Borders.push(border);
				break;
			case "</border>":
				break;

			/* note: not in spec, appears to be CT_BorderPr */
			case "<left/>":
				break;
			case "<left":
			case "<left>":
				index = 3;
				thickness = ["thin", "medium", "thick"].indexOf(y.style) + 2;
				if (["hair", "dotted", "double"].includes(y.style)) {
					border.style[index] = y.style === "hair" ? "dotted" : (y.style === "dotted" ? "dashed" : y.style);
					border.width[index] = y.style === "double" ? 3 : 1;
				} else {
					border.width[index] = thickness;
				}
				break;
			case "</left>":
				break;

			/* note: not in spec, appears to be CT_BorderPr */
			case "<right/>":
				break;
			case "<right":
			case "<right>":
				index = 1;
				thickness = ["thin", "medium", "thick"].indexOf(y.style) + 2;
				if (["hair", "dotted", "double"].includes(y.style)) {
					border.style[index] = y.style === "hair" ? "dotted" : (y.style === "dotted" ? "dashed" : y.style);
					border.width[index] = y.style === "double" ? 3 : 1;
				} else {
					border.width[index] = thickness;
				}
				break;
			case "</right>":
				break;

			/* 18.8.43 top CT_BorderPr */
			case "<top/>":
				break;
			case "<top":
			case "<top>":
				index = 0;
				thickness = ["thin", "medium", "thick"].indexOf(y.style) + 2;
				if (["hair", "dotted", "double"].includes(y.style)) {
					border.style[index] = y.style === "hair" ? "dotted" : (y.style === "dotted" ? "dashed" : y.style);
					border.width[index] = y.style === "double" ? 3 : 1;
				} else {
					border.width[index] = thickness;
				}
				break;
			case "</top>":
				break;

			/* 18.8.6 bottom CT_BorderPr */
			case "<bottom/>":
				break;
			case "<bottom":
			case "<bottom>":
				index = 2;
				thickness = ["thin", "medium", "thick"].indexOf(y.style) + 2;
				if (["hair", "dotted", "double"].includes(y.style)) {
					border.style[index] = y.style === "hair" ? "dotted" : (y.style === "dotted" ? "dashed" : y.style);
					border.width[index] = y.style === "double" ? 3 : 1;
				} else {
					border.width[index] = thickness;
				}
				break;
			case "</bottom>":
				break;

			/* 18.8.13 diagonal CT_BorderPr */
			case "<diagonal":
			case "<diagonal>":
			case "<diagonal/>":
				break;
			case "</diagonal>":
				break;

			/* 18.8.25 horizontal CT_BorderPr */
			case "<horizontal":
			case "<horizontal>":
			case "<horizontal/>":
				break;
			case "</horizontal>":
				break;

			/* 18.8.44 vertical CT_BorderPr */
			case "<vertical":
			case "<vertical>":
			case "<vertical/>":
				break;
			case "</vertical>":
				break;

			/* 18.8.37 start CT_BorderPr */
			case "<start":
			case "<start>":
			case "<start/>":
				break;
			case "</start>":
				break;

			/* 18.8.16 end CT_BorderPr */
			case "<end":
			case "<end>":
			case "<end/>":
				break;
			case "</end>":
				break;

			/* 18.8.? color CT_Color */
			case "<color":
			case "<color>":
				border.color[index] = y.rgb.slice(-6);
				break;
			case "<color/>":
			case "</color>":
				break;

			/* 18.2.10 extLst CT_ExtensionList ? */
			case "<extLst":
			case "<extLst>":
			case "</extLst>":
				break;
			case "<ext":
				pass = true;
				break;
			case "</ext>":
				pass = false;
				break;
			default:
				if (opts && opts.WTF) {
					if (!pass) throw new Error(`unrecognized ${y[0]} in borders`);
				}
		}
	});
}

/* 18.8.21 fills CT_Fills */
function parse_fills(t, styles, themes, opts) {
	styles.Fills = [];
	var fill = {},
		pass = false;
	(t[0].match(tagregex) || []).forEach(function(x) {
		var y = parsexmltag(x);
		switch (strip_ns(y[0])) {
			case "<fills":
			case "<fills>":
			case "</fills>":
				break;

			/* 18.8.20 fill CT_Fill */
			case "<fill>":
			case "<fill":
			case "<fill/>":
				fill = {};
				styles.Fills.push(fill);
				break;
			case "</fill>":
				break;

			/* 18.8.24 gradientFill CT_GradientFill */
			case "<gradientFill>":
				break;
			case "<gradientFill":
			case "</gradientFill>":
				styles.Fills.push(fill);
				fill = {};
				break;

			/* 18.8.32 patternFill CT_PatternFill */
			case "<patternFill":
			case "<patternFill>":
				if (y.patternType) fill.patternType = y.patternType;
				break;
			case "<patternFill/>":
			case "</patternFill>":
				break;

			/* 18.8.3 bgColor CT_Color */
			case "<bgColor":
				if (!fill.bgColor) fill.bgColor = {};
				if (y.indexed) fill.bgColor.indexed = parseInt(y.indexed, 10);
				if (y.theme) fill.bgColor.theme = parseInt(y.theme, 10);
				if (y.tint) fill.bgColor.tint = parseFloat(y.tint);
				/* Excel uses ARGB strings */
				if (y.rgb) fill.bgColor.rgb = y.rgb.slice(-6);
				break;
			case "<bgColor/>":
			case "</bgColor>":
				break;

			/* 18.8.19 fgColor CT_Color */
			case "<fgColor":
				if (!fill.fgColor) fill.fgColor = {};
				if (y.theme) fill.fgColor.theme = parseInt(y.theme, 10);
				if (y.tint) fill.fgColor.tint = parseFloat(y.tint);
				/* Excel uses ARGB strings */
				if (y.rgb != null) fill.fgColor.rgb = y.rgb.slice(-6);
				break;
			case "<fgColor/>":
			case "</fgColor>":
				break;

			/* 18.8.38 stop CT_GradientStop */
			case "<stop":
			case "<stop/>":
				break;
			case "</stop>":
				break;

			/* 18.8.? color CT_Color */
			case "<color":
			case "<color/>":
				break;
			case "</color>":
				break;

			/* 18.2.10 extLst CT_ExtensionList ? */
			case "<extLst":
			case "<extLst>":
			case "</extLst>":
				break;
			case "<ext":
				pass = true;
				break;
			case "</ext>":
				pass = false;
				break;
			default:
				if (opts && opts.WTF) {
					if (!pass) throw new Error(`unrecognized ${y[0]} in fills`);
				}
		}
	});
}

/* 18.8.23 fonts CT_Fonts */
function parse_fonts(t, styles, themes, opts) {
	styles.Fonts = [];
	var font = {},
		pass = false;
	(t[0].match(tagregex) || []).forEach(function(x) {
		var y = parsexmltag(x);
		switch (strip_ns(y[0])) {
			case "<fonts":
			case "<fonts>":
			case "</fonts>":
				break;

			/* 18.8.22 font CT_Font */
			case "<font":
			case "<font>":
				break;
			case "</font>":
			case "<font/>":
				styles.Fonts.push(font);
				font = {};
				break;

			/* 18.8.29 name CT_FontName */
			case "<name":
				if (y.val) font.name = utf8read(y.val);
				break;
			case "<name/>":
			case "</name>":
				break;

			/* 18.8.2  b CT_BooleanProperty */
			case "<b":
				font.bold = y.val ? parsexmlbool(y.val) : 1;
				break;
			case "<b/>":
				font.bold = 1;
				break;

			/* 18.8.26 i CT_BooleanProperty */
			case "<i":
				font.italic = y.val ? parsexmlbool(y.val) : 1;
				break;
			case "<i/>":
				font.italic = 1;
				break;

			/* 18.4.13 u CT_UnderlineProperty */
			case "<u":
				switch (y.val) {
					case "none": font.underline = 0x00; break;
					case "single": font.underline = 0x01; break;
					case "double": font.underline = 0x02; break;
					case "singleAccounting": font.underline = 0x21; break;
					case "doubleAccounting": font.underline = 0x22; break;
				}
				break;
			case "<u/>":
				font.underline = 1;
				break;

			/* 18.4.10 strike CT_BooleanProperty */
			case "<strike":
				font.strike = y.val ? parsexmlbool(y.val) : 1;
				break;
			case "<strike/>":
				font.strike = 1;
				break;

			/* 18.4.2  outline CT_BooleanProperty */
			case "<outline":
				font.outline = y.val ? parsexmlbool(y.val) : 1;
				break;
			case "<outline/>":
				font.outline = 1;
				break;

			/* 18.8.36 shadow CT_BooleanProperty */
			case "<shadow":
				font.shadow = y.val ? parsexmlbool(y.val) : 1;
				break;
			case "<shadow/>":
				font.shadow = 1;
				break;

			/* 18.8.12 condense CT_BooleanProperty */
			case "<condense":
				font.condense = y.val ? parsexmlbool(y.val) : 1;
				break;
			case "<condense/>":
				font.condense = 1;
				break;

			/* 18.8.17 extend CT_BooleanProperty */
			case "<extend":
				font.extend = y.val ? parsexmlbool(y.val) : 1;
				break;
			case "<extend/>":
				font.extend = 1;
				break;

			/* 18.4.11 sz CT_FontSize */
			case "<sz":
				if (y.val) font.sz = +y.val;
				break;
			case "<sz/>":
			case "</sz>":
				break;

			/* 18.4.14 vertAlign CT_VerticalAlignFontProperty */
			case "<vertAlign":
				if (y.val) font.vertAlign = y.val;
				break;
			case "<vertAlign/>":
			case "</vertAlign>":
				break;

			/* 18.8.18 family CT_FontFamily */
			case "<family":
				if (y.val) font.family = parseInt(y.val,10);
				break;
			case "<family/>":
			case "</family>":
				break;

			/* 18.8.35 scheme CT_FontScheme */
			case "<scheme":
				if (y.val) font.scheme = y.val;
				break;
			case "<scheme/>":
			case "</scheme>":
				break;

			/* 18.4.1 charset CT_IntProperty */
			case "<charset":
				if (y.val == "1") break;
				y.codepage = CS2CP[parseInt(y.val, 10)];
				break;

			/* 18.?.? color CT_Color */
			case "<color":
				if (!font.color) font.color = {};
				if (y.auto) font.color.auto = parsexmlbool(y.auto);

				if (y.rgb) font.color.rgb = y.rgb.slice(-6);
				else if (y.indexed) {
					font.color.index = parseInt(y.indexed, 10);
					var icv = XLSIcv[font.color.index];
					if (font.color.index == 81) icv = XLSIcv[1];
					if (!icv) throw new Error(x);
					font.color.rgb = icv[0].toString(16) + icv[1].toString(16) + icv[2].toString(16);
				} else if (y.theme) {
					font.color.theme = parseInt(y.theme, 10);
					if (y.tint) font.color.tint = parseFloat(y.tint);
					if (y.theme && themes.themeElements && themes.themeElements.clrScheme) {
						font.color.rgb = rgb_tint(themes.themeElements.clrScheme[font.color.theme].rgb, font.color.tint || 0);
					}
				}

				break;
			case "<color/>":
			case "</color>":
				break;

			/* note: sometimes mc:AlternateContent appears bare */
			case "<AlternateContent":
				pass = true;
				break;
			case "</AlternateContent>":
				pass = false;
				break;

			/* 18.2.10 extLst CT_ExtensionList ? */
			case "<extLst":
			case "<extLst>":
			case "</extLst>":
				break;
			case "<ext":
				pass = true;
				break;
			case "</ext>":
				pass = false;
				break;
			default:
				if (opts && opts.WTF) {
					if (!pass) throw new Error(`unrecognized ${y[0]} in fonts`);
				}
		}
	});
}

/* 18.8.31 numFmts CT_NumFmts */
function parse_numFmts(t, styles, opts) {
	styles.NumberFmt = [];
	var k = keys(SSF._table);
	for (var i=0, il=k.length; i<il; ++i) {
		styles.NumberFmt[k[i]] = SSF._table[k[i]];
	}
	var m = t[0].match(tagregex);
	if (!m) return;
	for (i=0; i<m.length; ++i) {
		var y = parsexmltag(m[i]);
		switch (strip_ns(y[0])) {
			case "<numFmts":
			case "</numFmts>":
			case "<numFmts/>":
			case "<numFmts>":
				break;
			case "<numFmt":
				var f = unescapexml(utf8read(y.formatCode)),
					j = parseInt(y.numFmtId, 10);
				styles.NumberFmt[j] = f;
				if (j>0) {
					if (j > 0x188) {
						for (j=0x188; j>0x3c; --j) {
							if (styles.NumberFmt[j] == null) break;
						}
						styles.NumberFmt[j] = f;
					}
					SSF.load(f,j);
				}
				break;
			case "</numFmt>":
				break;
			default:
				if (opts.WTF) throw new Error(`unrecognized ${y[0]} in numFmts`);
		}
	}
}

function write_numFmts(NF) {
	var o = ["<numFmts>"];
	[[5,8],[23,26],[41,44],[50,392]].forEach(function(r) {
		for (var i=r[0]; i<=r[1]; ++i) {
			if (NF[i] != null) {
				o[o.length] = writextag("numFmt", null, { numFmtId: i, formatCode: escapexml(NF[i]) });
			}
		}
	});
	if (o.length === 1) return "";
	o[o.length] = ("</numFmts>");
	o[0] = writextag("numFmts", null, { count: o.length-2 }).replace("/>", ">");
	return o.join("");
}

/* 18.8.10 cellXfs CT_CellXfs */
function parse_cellXfs(t, styles, opts) {
	styles.CellXf = [];
	var xf;
	var pass = false;
	(t[0].match(tagregex) || []).forEach(function(x) {
		var y = parsexmltag(x),
			i = 0;
		switch (strip_ns(y[0])) {
			case "<cellXfs":
			case "<cellXfs>":
			case "<cellXfs/>":
			case "</cellXfs>":
				break;

			/* 18.8.45 xf CT_Xf */
			case "<xf":
			case "<xf/>":
				xf = y;
				delete xf[0];
				for (i=0; i<cellXF_uint.length; ++i) {
					if (xf[cellXF_uint[i]]) {
						xf[cellXF_uint[i]] = parseInt(xf[cellXF_uint[i]], 10);
					}
				}
				for (i=0; i<cellXF_bool.length; ++i) {
					if (xf[cellXF_bool[i]]) {
						xf[cellXF_bool[i]] = parsexmlbool(xf[cellXF_bool[i]]);
					}
				}
				if (xf.numFmtId > 0x188) {
					for (i=0x188; i>0x3c; --i) {
						if (styles.NumberFmt[xf.numFmtId] == styles.NumberFmt[i]) {
							xf.numFmtId = i;
							break;
						}
					}
				}
				styles.CellXf.push(xf);
				break;
			case "</xf>":
				break;

			/* 18.8.1 alignment CT_CellAlignment */
			case "<alignment":
			case "<alignment/>":
				var alignment = {};
				if (y.vertical) alignment.vertical = y.vertical;
				if (y.horizontal) alignment.horizontal = y.horizontal;
				if (y.textRotation != null) alignment.textRotation = y.textRotation;
				if (y.indent) alignment.indent = y.indent;
				if (y.wrapText) alignment.wrapText = parsexmlbool(y.wrapText);
				xf.alignment = alignment;
				break;
			case "</alignment>":
				break;

			/* 18.8.33 protection CT_CellProtection */
			case "<protection":
				break;
			case "</protection>":
			case "<protection/>":
				break;

			/* note: sometimes mc:AlternateContent appears bare */
			case "<AlternateContent":
				pass = true;
				break;
			case "</AlternateContent>":
				pass = false;
				break;

			/* 18.2.10 extLst CT_ExtensionList ? */
			case "<extLst":
			case "<extLst>":
			case "</extLst>":
				break;
			case "<ext":
				pass = true;
				break;
			case "</ext>":
				pass = false;
				break;
			default:
				if (opts && opts.WTF) {
					if (!pass) throw new Error(`unrecognized ${y[0]} in cellXfs`);
				}
		}
	});
}

function write_fonts(wb, opts) {
	var o = [];
	o.push(`<fonts count="${wb.fonts.length + 1}">`);
	o.push(`<font><sz val="12"/><color theme="1"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font>`);

	wb.fonts.map(f => {
		o.push(`<font>
					<sz val="${f.fRecord.size}"/>
					<color rgb="FF${f.fRecord.color}"/>
					<name val="${f.fRecord.family}"/>
					<family val="2"/>
					${ f.fRecord.bold ? `<b/>` : "" }
					${ f.fRecord.italic ? `<i/>` : "" }
					${ f.fRecord.strike ? `<strike/>` : "" }
					${ f.fRecord.underline ? `<u val="single"/>` : "" }
					${ f.fRecord.sup ? `<vertAlign val="superscript"/>` : "" }
					${ f.fRecord.sub ? `<vertAlign val="subscript"/>` : "" }
				</font>`);
	});

	o.push(`</fonts>`);
	return o.join("");
}

function write_fills(wb, opts) {
	var o = [];
	o.push(`<fills count="${wb.fills.length + 2}">`);
	o.push(`<fill><patternFill patternType="none"/></fill>`);
	o.push(`<fill><patternFill patternType="gray125"/></fill>`);

	wb.fills.map(f => {
		o.push(`<fill>
					<patternFill patternType="solid">
						<fgColor rgb="FF${f.color}"/>
						<bgColor indexed="64"/>
					</patternFill>
				</fill>`);
	});

	o.push(`</fills>`);
	return o.join("");
}

function write_borders(wb, opts) {
	var o = [],
		dir = ["top", "right", "bottom", "left"],
		width = ["", "thin", "medium", "thick"];
	o.push(`<borders count="${wb.borders.length + 2}">`);
	o.push(`<border/>`);
	o.push(`<border><left/><right/><top/><bottom/></border>`);
	
	wb.borders.map(b => {
		let str = ["<border>"];
		dir.map((d, i) => {
			let style = b.bRecord.style[i];
			switch (style) {
				case "dashed":
					style = "dotted";
					break;
				case "dotted":
					style = "hair";
					break;
				case "double":
					break;
				case "solid":
					let w = b.bRecord.width[i] - 1;
					if (w <= 0) return;
					style = width[w];
					break;
			}
			str.push(`<${d}${(style ? ` style="${style}"` : "")}>
						<color rgb="FF${b.bRecord.color[i]}"/>
					</${d}>`);
		});
		str.push("</border>");
		// add to main array
		o.push(str.join(""));
	});
	
	o.push(`</borders>`);
	return o.join("");
}

function write_cellXfs(wb, opts) {
	var o = [];
	o.push(`<cellXfs count="${opts.cellXfs.length}">`);

	opts.cellXfs.map(f => {
		o.push(`<xf applyNumberFormat="${f.applyNumberFormat}" borderId="${f.borderId}" 
					fillId="${f.fillId}" fontId="${f.fontId}" numFmtId="${f.numFmtId}" 
					xfId="${f.xfId}">`.replace(/\t|\n/g, ""));

		let align = Object.keys(f.alignment);
		if (align.length) {
			o.push(`<alignment ${align.map(k => `${k}="${f.alignment[k]}"`).join(" ")}/>`);
		}

		o.push(`</xf>`);
	});

	o.push(`</cellXfs>`);
	return o.join("");
}

/* 18.8 Styles CT_Stylesheet*/
var parse_sty_xml = (function() {
	var numFmtRegex = /<(?:\w+:)?numFmts([^>]*)>[\S\s]*?<\/(?:\w+:)?numFmts>/,
		cellXfRegex = /<(?:\w+:)?cellXfs([^>]*)>[\S\s]*?<\/(?:\w+:)?cellXfs>/,
		fillsRegex = /<(?:\w+:)?fills([^>]*)>[\S\s]*?<\/(?:\w+:)?fills>/,
		fontsRegex = /<(?:\w+:)?fonts([^>]*)>[\S\s]*?<\/(?:\w+:)?fonts>/,
		bordersRegex = /<(?:\w+:)?borders([^>]*)>[\S\s]*?<\/(?:\w+:)?borders>/;

	return function(data, themes, opts) {
		var styles = {};
		if (!data) return styles;
		data = data.replace(/<!--([\s\S]*?)-->/mg, "").replace(/<!DOCTYPE[^\[]*\[[^\]]*\]>/gm, "");
		/* 18.8.39 styleSheet CT_Stylesheet */
		var t;
		/* 18.8.31 numFmts CT_NumFmts ? */
		if ((t = data.match(numFmtRegex))) {
			parse_numFmts(t, styles, opts);
		}

		/* 18.8.23 fonts CT_Fonts ? */
		if ((t = data.match(fontsRegex))) {
			parse_fonts(t, styles, themes, opts);
		}

		/* 18.8.21 fills CT_Fills ? */
		if ((t = data.match(fillsRegex))) {
			parse_fills(t, styles, themes, opts);
		}

		/* 18.8.5  borders CT_Borders ? */
		if ((t = data.match(bordersRegex))) {
			parse_borders(t, styles, themes, opts);
		}

		/* 18.8.9  cellStyleXfs CT_CellStyleXfs ? */
		/* 18.8.8  cellStyles CT_CellStyles ? */

		/* 18.8.10 cellXfs CT_CellXfs ? */
		if ((t = data.match(cellXfRegex))) {
			parse_cellXfs(t, styles, opts);
		}

		/* 18.8.15 dxfs CT_Dxfs ? */
		/* 18.8.42 tableStyles CT_TableStyles ? */
		/* 18.8.11 colors CT_Colors ? */
		/* 18.2.10 extLst CT_ExtensionList ? */

		return styles;
	};
})();

function write_sty_xml(wb, opts) {
	var o = [XML_HEADER, STYLES_XML_ROOT],
		w;

	if (wb.SSF && (w = write_numFmts(wb.SSF)) != null) o.push(w);
	
	if (w = write_fonts(wb, opts)) o.push(w);
	if (w = write_fills(wb, opts)) o.push(w);
	if (w = write_borders(wb, opts)) o.push(w);

	o[o.length] = (`<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>`);
	
	if (w = write_cellXfs(wb, opts)) o.push(w);

	o[o.length] = (`<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>`);
	o[o.length] = (`<dxfs count="0"/>`);
	o[o.length] = (`<tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleMedium4"/>`);

	if (o.length > 2) {
		o[o.length] = (`</styleSheet>`);
		o[1] = o[1].replace("/>", ">");
	}

	return o.join("").replace(/\n|\t/g, "");
}

	
RELS.THEME = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme";

/* Even though theme layout is dk1 lt1 dk2 lt2, true order is lt1 dk1 lt2 dk2 */
var XLSXThemeClrScheme = [
		"</a:lt1>",
		"</a:dk1>",
		"</a:lt2>",
		"</a:dk2>",
		"</a:accent1>",
		"</a:accent2>",
		"</a:accent3>",
		"</a:accent4>",
		"</a:accent5>",
		"</a:accent6>",
		"</a:hlink>",
		"</a:folHlink>"
	];

/* 20.1.6.2 clrScheme CT_ColorScheme */
function parse_clrScheme(t, themes, opts) {
	themes.themeElements.clrScheme = [];
	var color = {};
	(t[0].match(tagregex) || []).forEach(function(x) {
		var y = parsexmltag(x);
		switch (y[0]) {
			/* 20.1.6.2 clrScheme (Color Scheme) CT_ColorScheme */
			case "<a:clrScheme":
			case "</a:clrScheme>": break;

			/* 20.1.2.3.32 srgbClr CT_SRgbColor */
			case "<a:srgbClr": color.rgb = y.val; break;

			/* 20.1.2.3.33 sysClr CT_SystemColor */
			case "<a:sysClr": color.rgb = y.lastClr; break;

			/* 20.1.4.1.1 accent1 (Accent 1) */
			/* 20.1.4.1.2 accent2 (Accent 2) */
			/* 20.1.4.1.3 accent3 (Accent 3) */
			/* 20.1.4.1.4 accent4 (Accent 4) */
			/* 20.1.4.1.5 accent5 (Accent 5) */
			/* 20.1.4.1.6 accent6 (Accent 6) */
			/* 20.1.4.1.9 dk1 (Dark 1) */
			/* 20.1.4.1.10 dk2 (Dark 2) */
			/* 20.1.4.1.15 folHlink (Followed Hyperlink) */
			/* 20.1.4.1.19 hlink (Hyperlink) */
			/* 20.1.4.1.22 lt1 (Light 1) */
			/* 20.1.4.1.23 lt2 (Light 2) */
			case "<a:dk1>":
			case "</a:dk1>":
			case "<a:lt1>":
			case "</a:lt1>":
			case "<a:dk2>":
			case "</a:dk2>":
			case "<a:lt2>":
			case "</a:lt2>":
			case "<a:accent1>":
			case "</a:accent1>":
			case "<a:accent2>":
			case "</a:accent2>":
			case "<a:accent3>":
			case "</a:accent3>":
			case "<a:accent4>":
			case "</a:accent4>":
			case "<a:accent5>":
			case "</a:accent5>":
			case "<a:accent6>":
			case "</a:accent6>":
			case "<a:hlink>":
			case "</a:hlink>":
			case "<a:folHlink>":
			case "</a:folHlink>":
				if (y[0].charAt(1) === "/") {
					themes.themeElements.clrScheme[XLSXThemeClrScheme.indexOf(y[0])] = color;
					color = {};
				} else {
					color.name = y[0].slice(3, y[0].length - 1);
				}
				break;
			default:
				if (opts && opts.WTF) {
					throw new Error(`Unrecognized ${y[0]} in clrScheme`);
				}
		}
	});
}

/* 20.1.4.1.18 fontScheme CT_FontScheme */
function parse_fontScheme(/*::t, themes, opts*/) { }

/* 20.1.4.1.15 fmtScheme CT_StyleMatrix */
function parse_fmtScheme(/*::t, themes, opts*/) { }

var clrsregex = /<a:clrScheme([^>]*)>[\s\S]*<\/a:clrScheme>/,
	fntsregex = /<a:fontScheme([^>]*)>[\s\S]*<\/a:fontScheme>/,
	fmtsregex = /<a:fmtScheme([^>]*)>[\s\S]*<\/a:fmtScheme>/,
	themeltregex = /<a:themeElements([^>]*)>[\s\S]*<\/a:themeElements>/;

/* 20.1.6.10 themeElements CT_BaseStyles */
function parse_themeElements(data, themes, opts) {
	themes.themeElements = {};
	var t;
	[
		/* clrScheme CT_ColorScheme */
		["clrScheme", clrsregex, parse_clrScheme],
		/* fontScheme CT_FontScheme */
		["fontScheme", fntsregex, parse_fontScheme],
		/* fmtScheme CT_StyleMatrix */
		["fmtScheme", fmtsregex, parse_fmtScheme]
	].forEach(m => {
		if (!(t=data.match(m[1]))) {
			throw new Error(`${m[0]} not found in themeElements`);
		}
		m[2](t, themes, opts);
	});
}

/* 14.2.7 Theme Part */
function parse_theme_xml(data, opts) {
	/* 20.1.6.9 theme CT_OfficeStyleSheet */
	if (!data || data.length === 0) {
		return parse_theme_xml(write_theme());
	}
	var t,
		themes = {};
	/* themeElements CT_BaseStyles */
	if (!(t=data.match(themeltregex))) {
		throw new Error('themeElements not found in theme');
	}
	parse_themeElements(t[0], themes, opts);
	themes.raw = data;
	return themes;
}

function write_theme(Themes, opts) {
	if (opts && opts.themeXLSX) return opts.themeXLSX;
	if (Themes && typeof Themes.raw == "string") return Themes.raw;
	var o = [XML_HEADER];
	o[o.length] = '<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">';
	o[o.length] =  '<a:themeElements>';

	o[o.length] =   '<a:clrScheme name="Office">';
	o[o.length] =    '<a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1>';
	o[o.length] =    '<a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>';
	o[o.length] =    '<a:dk2><a:srgbClr val="1F497D"/></a:dk2>';
	o[o.length] =    '<a:lt2><a:srgbClr val="EEECE1"/></a:lt2>';
	o[o.length] =    '<a:accent1><a:srgbClr val="4F81BD"/></a:accent1>';
	o[o.length] =    '<a:accent2><a:srgbClr val="C0504D"/></a:accent2>';
	o[o.length] =    '<a:accent3><a:srgbClr val="9BBB59"/></a:accent3>';
	o[o.length] =    '<a:accent4><a:srgbClr val="8064A2"/></a:accent4>';
	o[o.length] =    '<a:accent5><a:srgbClr val="4BACC6"/></a:accent5>';
	o[o.length] =    '<a:accent6><a:srgbClr val="F79646"/></a:accent6>';
	o[o.length] =    '<a:hlink><a:srgbClr val="0000FF"/></a:hlink>';
	o[o.length] =    '<a:folHlink><a:srgbClr val="800080"/></a:folHlink>';
	o[o.length] =   '</a:clrScheme>';

	o[o.length] =   '<a:fontScheme name="Office">';
	o[o.length] =    '<a:majorFont>';
	o[o.length] =     '<a:latin typeface="Cambria"/>';
	o[o.length] =     '<a:ea typeface=""/>';
	o[o.length] =     '<a:cs typeface=""/>';
	o[o.length] =     '<a:font script="Jpan" typeface="ＭＳ Ｐゴシック"/>';
	o[o.length] =     '<a:font script="Hang" typeface="맑은 고딕"/>';
	o[o.length] =     '<a:font script="Hans" typeface="宋体"/>';
	o[o.length] =     '<a:font script="Hant" typeface="新細明體"/>';
	o[o.length] =     '<a:font script="Arab" typeface="Times New Roman"/>';
	o[o.length] =     '<a:font script="Hebr" typeface="Times New Roman"/>';
	o[o.length] =     '<a:font script="Thai" typeface="Tahoma"/>';
	o[o.length] =     '<a:font script="Ethi" typeface="Nyala"/>';
	o[o.length] =     '<a:font script="Beng" typeface="Vrinda"/>';
	o[o.length] =     '<a:font script="Gujr" typeface="Shruti"/>';
	o[o.length] =     '<a:font script="Khmr" typeface="MoolBoran"/>';
	o[o.length] =     '<a:font script="Knda" typeface="Tunga"/>';
	o[o.length] =     '<a:font script="Guru" typeface="Raavi"/>';
	o[o.length] =     '<a:font script="Cans" typeface="Euphemia"/>';
	o[o.length] =     '<a:font script="Cher" typeface="Plantagenet Cherokee"/>';
	o[o.length] =     '<a:font script="Yiii" typeface="Microsoft Yi Baiti"/>';
	o[o.length] =     '<a:font script="Tibt" typeface="Microsoft Himalaya"/>';
	o[o.length] =     '<a:font script="Thaa" typeface="MV Boli"/>';
	o[o.length] =     '<a:font script="Deva" typeface="Mangal"/>';
	o[o.length] =     '<a:font script="Telu" typeface="Gautami"/>';
	o[o.length] =     '<a:font script="Taml" typeface="Latha"/>';
	o[o.length] =     '<a:font script="Syrc" typeface="Estrangelo Edessa"/>';
	o[o.length] =     '<a:font script="Orya" typeface="Kalinga"/>';
	o[o.length] =     '<a:font script="Mlym" typeface="Kartika"/>';
	o[o.length] =     '<a:font script="Laoo" typeface="DokChampa"/>';
	o[o.length] =     '<a:font script="Sinh" typeface="Iskoola Pota"/>';
	o[o.length] =     '<a:font script="Mong" typeface="Mongolian Baiti"/>';
	o[o.length] =     '<a:font script="Viet" typeface="Times New Roman"/>';
	o[o.length] =     '<a:font script="Uigh" typeface="Microsoft Uighur"/>';
	o[o.length] =     '<a:font script="Geor" typeface="Sylfaen"/>';
	o[o.length] =    '</a:majorFont>';
	o[o.length] =    '<a:minorFont>';
	o[o.length] =     '<a:latin typeface="Calibri"/>';
	o[o.length] =     '<a:ea typeface=""/>';
	o[o.length] =     '<a:cs typeface=""/>';
	o[o.length] =     '<a:font script="Jpan" typeface="ＭＳ Ｐゴシック"/>';
	o[o.length] =     '<a:font script="Hang" typeface="맑은 고딕"/>';
	o[o.length] =     '<a:font script="Hans" typeface="宋体"/>';
	o[o.length] =     '<a:font script="Hant" typeface="新細明體"/>';
	o[o.length] =     '<a:font script="Arab" typeface="Arial"/>';
	o[o.length] =     '<a:font script="Hebr" typeface="Arial"/>';
	o[o.length] =     '<a:font script="Thai" typeface="Tahoma"/>';
	o[o.length] =     '<a:font script="Ethi" typeface="Nyala"/>';
	o[o.length] =     '<a:font script="Beng" typeface="Vrinda"/>';
	o[o.length] =     '<a:font script="Gujr" typeface="Shruti"/>';
	o[o.length] =     '<a:font script="Khmr" typeface="DaunPenh"/>';
	o[o.length] =     '<a:font script="Knda" typeface="Tunga"/>';
	o[o.length] =     '<a:font script="Guru" typeface="Raavi"/>';
	o[o.length] =     '<a:font script="Cans" typeface="Euphemia"/>';
	o[o.length] =     '<a:font script="Cher" typeface="Plantagenet Cherokee"/>';
	o[o.length] =     '<a:font script="Yiii" typeface="Microsoft Yi Baiti"/>';
	o[o.length] =     '<a:font script="Tibt" typeface="Microsoft Himalaya"/>';
	o[o.length] =     '<a:font script="Thaa" typeface="MV Boli"/>';
	o[o.length] =     '<a:font script="Deva" typeface="Mangal"/>';
	o[o.length] =     '<a:font script="Telu" typeface="Gautami"/>';
	o[o.length] =     '<a:font script="Taml" typeface="Latha"/>';
	o[o.length] =     '<a:font script="Syrc" typeface="Estrangelo Edessa"/>';
	o[o.length] =     '<a:font script="Orya" typeface="Kalinga"/>';
	o[o.length] =     '<a:font script="Mlym" typeface="Kartika"/>';
	o[o.length] =     '<a:font script="Laoo" typeface="DokChampa"/>';
	o[o.length] =     '<a:font script="Sinh" typeface="Iskoola Pota"/>';
	o[o.length] =     '<a:font script="Mong" typeface="Mongolian Baiti"/>';
	o[o.length] =     '<a:font script="Viet" typeface="Arial"/>';
	o[o.length] =     '<a:font script="Uigh" typeface="Microsoft Uighur"/>';
	o[o.length] =     '<a:font script="Geor" typeface="Sylfaen"/>';
	o[o.length] =    '</a:minorFont>';
	o[o.length] =   '</a:fontScheme>';

	o[o.length] =   '<a:fmtScheme name="Office">';
	o[o.length] =    '<a:fillStyleLst>';
	o[o.length] =     '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>';
	o[o.length] =     '<a:gradFill rotWithShape="1">';
	o[o.length] =      '<a:gsLst>';
	o[o.length] =       '<a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="50000"/><a:satMod val="300000"/></a:schemeClr></a:gs>';
	o[o.length] =       '<a:gs pos="35000"><a:schemeClr val="phClr"><a:tint val="37000"/><a:satMod val="300000"/></a:schemeClr></a:gs>';
	o[o.length] =       '<a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="15000"/><a:satMod val="350000"/></a:schemeClr></a:gs>';
	o[o.length] =      '</a:gsLst>';
	o[o.length] =      '<a:lin ang="16200000" scaled="1"/>';
	o[o.length] =     '</a:gradFill>';
	o[o.length] =     '<a:gradFill rotWithShape="1">';
	o[o.length] =      '<a:gsLst>';
	o[o.length] =       '<a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="100000"/><a:shade val="100000"/><a:satMod val="130000"/></a:schemeClr></a:gs>';
	o[o.length] =       '<a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="50000"/><a:shade val="100000"/><a:satMod val="350000"/></a:schemeClr></a:gs>';
	o[o.length] =      '</a:gsLst>';
	o[o.length] =      '<a:lin ang="16200000" scaled="0"/>';
	o[o.length] =     '</a:gradFill>';
	o[o.length] =    '</a:fillStyleLst>';
	o[o.length] =    '<a:lnStyleLst>';
	o[o.length] =     '<a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"><a:shade val="95000"/><a:satMod val="105000"/></a:schemeClr></a:solidFill><a:prstDash val="solid"/></a:ln>';
	o[o.length] =     '<a:ln w="25400" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>';
	o[o.length] =     '<a:ln w="38100" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>';
	o[o.length] =    '</a:lnStyleLst>';
	o[o.length] =    '<a:effectStyleLst>';
	o[o.length] =     '<a:effectStyle>';
	o[o.length] =      '<a:effectLst>';
	o[o.length] =       '<a:outerShdw blurRad="40000" dist="20000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="38000"/></a:srgbClr></a:outerShdw>';
	o[o.length] =      '</a:effectLst>';
	o[o.length] =     '</a:effectStyle>';
	o[o.length] =     '<a:effectStyle>';
	o[o.length] =      '<a:effectLst>';
	o[o.length] =       '<a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="35000"/></a:srgbClr></a:outerShdw>';
	o[o.length] =      '</a:effectLst>';
	o[o.length] =     '</a:effectStyle>';
	o[o.length] =     '<a:effectStyle>';
	o[o.length] =      '<a:effectLst>';
	o[o.length] =       '<a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="35000"/></a:srgbClr></a:outerShdw>';
	o[o.length] =      '</a:effectLst>';
	o[o.length] =      '<a:scene3d><a:camera prst="orthographicFront"><a:rot lat="0" lon="0" rev="0"/></a:camera><a:lightRig rig="threePt" dir="t"><a:rot lat="0" lon="0" rev="1200000"/></a:lightRig></a:scene3d>';
	o[o.length] =      '<a:sp3d><a:bevelT w="63500" h="25400"/></a:sp3d>';
	o[o.length] =     '</a:effectStyle>';
	o[o.length] =    '</a:effectStyleLst>';
	o[o.length] =    '<a:bgFillStyleLst>';
	o[o.length] =     '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>';
	o[o.length] =     '<a:gradFill rotWithShape="1">';
	o[o.length] =      '<a:gsLst>';
	o[o.length] =       '<a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="40000"/><a:satMod val="350000"/></a:schemeClr></a:gs>';
	o[o.length] =       '<a:gs pos="40000"><a:schemeClr val="phClr"><a:tint val="45000"/><a:shade val="99000"/><a:satMod val="350000"/></a:schemeClr></a:gs>';
	o[o.length] =       '<a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="20000"/><a:satMod val="255000"/></a:schemeClr></a:gs>';
	o[o.length] =      '</a:gsLst>';
	o[o.length] =      '<a:path path="circle"><a:fillToRect l="50000" t="-80000" r="50000" b="180000"/></a:path>';
	o[o.length] =     '</a:gradFill>';
	o[o.length] =     '<a:gradFill rotWithShape="1">';
	o[o.length] =      '<a:gsLst>';
	o[o.length] =       '<a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="80000"/><a:satMod val="300000"/></a:schemeClr></a:gs>';
	o[o.length] =       '<a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="30000"/><a:satMod val="200000"/></a:schemeClr></a:gs>';
	o[o.length] =      '</a:gsLst>';
	o[o.length] =      '<a:path path="circle"><a:fillToRect l="50000" t="50000" r="50000" b="50000"/></a:path>';
	o[o.length] =     '</a:gradFill>';
	o[o.length] =    '</a:bgFillStyleLst>';
	o[o.length] =   '</a:fmtScheme>';
	o[o.length] =  '</a:themeElements>';

	o[o.length] =  '<a:objectDefaults>';
	o[o.length] =   '<a:spDef>';
	o[o.length] =    '<a:spPr/><a:bodyPr/><a:lstStyle/><a:style><a:lnRef idx="1"><a:schemeClr val="accent1"/></a:lnRef><a:fillRef idx="3"><a:schemeClr val="accent1"/></a:fillRef><a:effectRef idx="2"><a:schemeClr val="accent1"/></a:effectRef><a:fontRef idx="minor"><a:schemeClr val="lt1"/></a:fontRef></a:style>';
	o[o.length] =   '</a:spDef>';
	o[o.length] =   '<a:lnDef>';
	o[o.length] =    '<a:spPr/><a:bodyPr/><a:lstStyle/><a:style><a:lnRef idx="2"><a:schemeClr val="accent1"/></a:lnRef><a:fillRef idx="0"><a:schemeClr val="accent1"/></a:fillRef><a:effectRef idx="1"><a:schemeClr val="accent1"/></a:effectRef><a:fontRef idx="minor"><a:schemeClr val="tx1"/></a:fontRef></a:style>';
	o[o.length] =   '</a:lnDef>';
	o[o.length] =  '</a:objectDefaults>';
	o[o.length] =  '<a:extraClrSchemeLst/>';
	o[o.length] = '</a:theme>';
	return o.join("");
}

	
var CT_VBA = "application/vnd.ms-office.vbaProject",
	VBAFMTS = [ "xlsb", "xlsm", "xlam", "biff8", "xla" ];

function make_vba_xls(cfb) {
	var newcfb = CFB.utils.cfb_new({ root: "R" });
	cfb.FullPaths.forEach(function(p, i) {
		if (p.slice(-1) === "/" || !p.match(/_VBA_PROJECT_CUR/)) return;
		var newpath = p.replace(/^[^\/]*/, "R").replace(/\/_VBA_PROJECT_CUR\u0000*/, "");
		CFB.utils.cfb_add(newcfb, newpath, cfb.FileIndex[i].content);
	});
	return CFB.write(newcfb);
}

function fill_vba_xls(cfb, vba) {
	vba.FullPaths.forEach(function(p, i) {
		if (i == 0) return;
		var newpath = p.replace(/[^\/]*[\/]/, "/_VBA_PROJECT_CUR/");
		if (newpath.slice(-1) !== "/") CFB.utils.cfb_add(cfb, newpath, vba.FileIndex[i].content);
	});
}

	
function _xlfn(f) {
	return f.replace(/_xlfn\./g, "");
}

	
let buildTree = (function() {

	const {
		create: createShuntingYard,
		operator: createOperator,
		SENTINEL
	} = (function () {
		
		/*
		 * CLASS: Operator
		 */
		class Operator {
			constructor(symbol, precendence, operandCount = 2, leftAssociative = true) {
				if (operandCount < 1 || operandCount > 2) {
					throw new Error(`operandCount cannot be ${operandCount}, must be 1 or 2`);
				}

				this.symbol = symbol;
				this.precendence = precendence;
				this.operandCount = operandCount;
				this.leftAssociative = leftAssociative;
			}

			isUnary() {
				return this.operandCount === 1;
			}

			isBinary() {
				return this.operandCount === 2;
			}

			evaluatesBefore(other) {
				if (this === Operator.SENTINEL) return false;
				if (other === Operator.SENTINEL) return true;
				if (other.isUnary()) return false;

				if (this.isUnary()) {
					return this.precendence >= other.precendence;
				} else if (this.isBinary()) {
					if (this.precendence === other.precendence) {
						return this.leftAssociative;
					} else {
						return this.precendence > other.precendence;
					}
				}
			}
		}
		// fake operator with lowest precendence
		Operator.SENTINEL = new Operator('S', 0);


		/*
		 * CLASS: Stack
		 */
		class Stack {
			constructor() {
				this.items = [];
			}

			push(value) {
				this.items.push(value);
			}

			pop() {
				return this.items.pop();
			}

			top() {
				return this.items[this.items.length - 1];
			}
		}


		function create() {
			const operands = new Stack();
			const operators = new Stack();

			operators.push(Operator.SENTINEL);

			return { operands, operators };
		}

		function operator(symbol, precendence, operandCount, leftAssociative) {
			return new Operator(symbol, precendence, operandCount, leftAssociative);
		}

		return { create, operator, SENTINEL: Operator.SENTINEL }

	})();
	

	let tokenStream = (function() {

		/**
		* @param Object[] tokens - Tokens from excel-formula-tokenizer
		*/
		function create(tokens) {
			const end = {};
			const arr = [...tokens, end];
			let index = 0;

			return {
				consume() {
					index += 1;
					if (index >= arr.length) {
						throw new Error('Invalid Syntax');
					}
				},
				getNext() {
					return arr[index];
				},
				nextIs(type, subtype) {
					if (this.getNext().type !== type) return false;
					if (subtype && this.getNext().subtype !== subtype) return false;
					return true;
				},
				nextIsOpenParen() {
					return this.nextIs('subexpression', 'start');
				},
				nextIsTerminal() {
					if (this.nextIsNumber()) return true;
					if (this.nextIsText()) return true;
					if (this.nextIsLogical()) return true;
					if (this.nextIsRange()) return true;
					return false;
				},
				nextIsFunctionCall() {
					return this.nextIs('function', 'start');
				},
				nextIsFunctionArgumentSeparator() {
					return this.nextIs('argument');
				},
				nextIsEndOfFunctionCall() {
					return this.nextIs('function', 'stop');
				},
				nextIsBinaryOperator() {
					return this.nextIs('operator-infix');
				},
				nextIsPrefixOperator() {
					return this.nextIs('operator-prefix');
				},
				nextIsPostfixOperator() {
					return this.nextIs('operator-postfix');
				},
				nextIsRange() {
					return this.nextIs('operand', 'range');
				},
				nextIsNumber() {
					return this.nextIs('operand', 'number');
				},
				nextIsText() {
					return this.nextIs('operand', 'text');
				},
				nextIsLogical() {
					return this.nextIs('operand', 'logical');
				},
				pos() {
					return index;
				}
			};
		}

		return create;

	})();
	
	let builder = (function() {

		function cell(key, refType) {
			return {
				type: 'cell',
				refType,
				key
			};
		}

		function cellRange(leftCell, rightCell) {
			if (!leftCell) {
				throw new Error('Invalid Syntax');
			}
			if (!rightCell) {
				throw new Error('Invalid Syntax');
			}
			return {
				type: 'cell-range',
				left: leftCell,
				right: rightCell
			};
		}

		function functionCall(name, ...args) {
			const argArray = Array.isArray(args[0]) ? args[0] : args;

			return {
				type: 'function',
				name,
				arguments: argArray
			};
		}

		function number(value) {
			return {
				type: 'number',
				value
			};
		}

		function text(value) {
			return {
				type: 'text',
				value
			};
		}

		function logical(value) {
			return {
				type: 'logical',
				value
			};
		}

		function binaryExpression(operator, left, right) {
			if (!left) {
				throw new Error('Invalid Syntax');
			}
			if (!right) {
				throw new Error('Invalid Syntax');
			}
			return {
				type: 'binary-expression',
				operator,
				left,
				right
			};
		}

		function unaryExpression(operator, expression) {
			if (!expression) {
				throw new Error('Invalid Syntax');
			}
			return {
				type: 'unary-expression',
				operator,
				operand: expression
			};
		}

		return {
			functionCall,
			number,
			text,
			logical,
			cell,
			cellRange,
			binaryExpression,
			unaryExpression
		};
		
	})();


	// https://www.engr.mun.ca/~theo/Misc/exp_parsing.htm

	function parseFormula(tokens) {
		const stream = tokenStream(tokens);
		const shuntingYard = createShuntingYard();

		parseExpression(stream, shuntingYard);

		const retVal = shuntingYard.operands.top();
		if (!retVal) {
			throw new Error('Syntax error');
		}
		return retVal;
	}

	function parseExpression(stream, shuntingYard) {
		parseOperandExpression(stream, shuntingYard);

		let pos;
		while (true) {
			if (!stream.nextIsBinaryOperator()) {
				break;
			}
			if (pos === stream.pos()) {
				throw new Error('Invalid syntax!');
			}
			pos = stream.pos();
			pushOperator(createBinaryOperator(stream.getNext().value), shuntingYard);
			stream.consume();
			parseOperandExpression(stream, shuntingYard);
		}

		while (shuntingYard.operators.top() !== SENTINEL) {
			popOperator(shuntingYard);
		}
	}

	function parseOperandExpression(stream, shuntingYard) {
		if (stream.nextIsTerminal()) {
			shuntingYard.operands.push(parseTerminal(stream));
			// parseTerminal already consumes once so don't need to consume on line below
			// stream.consume()
		} else if (stream.nextIsOpenParen()) {
			stream.consume(); // open paren
			withinSentinel(shuntingYard, function () {
				parseExpression(stream, shuntingYard);
			});
			stream.consume(); // close paren
		} else if (stream.nextIsPrefixOperator()) {
			let unaryOperator = createUnaryOperator(stream.getNext().value);
			pushOperator(unaryOperator, shuntingYard);
			stream.consume();
			parseOperandExpression(stream, shuntingYard);
		} else if (stream.nextIsFunctionCall()) {
			parseFunctionCall(stream, shuntingYard);
		}
	}

	function parseFunctionCall(stream, shuntingYard) {
		const name = stream.getNext().value;
		stream.consume(); // consume start of function call

		const args = parseFunctionArgList(stream, shuntingYard);
		shuntingYard.operands.push(builder.functionCall(name, args));

		stream.consume(); // consume end of function call
	}

	function parseFunctionArgList(stream, shuntingYard) {
		const reverseArgs = [];

		withinSentinel(shuntingYard, function () {
			let arity = 0;
			let pos;
			while (true) {
				if (stream.nextIsEndOfFunctionCall())
					break;
				if (pos === stream.pos()) {
					throw new Error('Invalid syntax');
				}
				pos = stream.pos();
				parseExpression(stream, shuntingYard);
				arity += 1;

				if (stream.nextIsFunctionArgumentSeparator()) {
					stream.consume();
				}
			}

			for (let i = 0; i < arity; i++) {
				reverseArgs.push(shuntingYard.operands.pop());
			}
		});

		return reverseArgs.reverse();
	}

	function withinSentinel(shuntingYard, fn) {
		shuntingYard.operators.push(SENTINEL);
		fn();
		shuntingYard.operators.pop();
	}

	function pushOperator(operator, shuntingYard) {
		while (shuntingYard.operators.top().evaluatesBefore(operator)) {
			popOperator(shuntingYard);
		}
		shuntingYard.operators.push(operator);
	}

	function popOperator({operators, operands}) {
		if (operators.top().isBinary()) {
			const right = operands.pop();
			const left = operands.pop();
			const operator = operators.pop();
			operands.push(builder.binaryExpression(operator.symbol, left, right));
		} else if (operators.top().isUnary()) {
			const operand = operands.pop();
			const operator = operators.pop();
			operands.push(builder.unaryExpression(operator.symbol, operand));
		}
	}

	function parseTerminal(stream) {
		if (stream.nextIsNumber()) {
			return parseNumber(stream);
		}

		if (stream.nextIsText()) {
			return parseText(stream);
		}

		if (stream.nextIsLogical()) {
			return parseLogical(stream);
		}

		if (stream.nextIsRange()) {
			return parseRange(stream);
		}
	}

	function parseRange(stream) {
		const next = stream.getNext();
		stream.consume();
		return createCellRange(next.value);
	}

	function createCellRange(value) {
		const parts = value.split(':');

		if (parts.length == 2) {
			return builder.cellRange(
				builder.cell(parts[0], cellRefType(parts[0])),
				builder.cell(parts[1], cellRefType(parts[1]))
			);
		} else {
			return builder.cell(value, cellRefType(value));
		}
	}

	function cellRefType(key) {
		if (/^\$[A-Z]+\$\d+$/.test(key)) return 'absolute';
		if (/^\$[A-Z]+$/     .test(key)) return 'absolute';
		if (/^\$\d+$/        .test(key)) return 'absolute';
		if (/^\$[A-Z]+\d+$/  .test(key)) return 'mixed';
		if (/^[A-Z]+\$\d+$/  .test(key)) return 'mixed';
		if (/^[A-Z]+\d+$/    .test(key)) return 'relative';
		if (/^\d+$/          .test(key)) return 'relative';
		if (/^[A-Z]+$/       .test(key)) return 'relative';
	}

	function parseText(stream) {
		const next = stream.getNext();
		stream.consume();
		return builder.text(next.value);
	}

	function parseLogical(stream) {
		const next = stream.getNext();
		stream.consume();
		return builder.logical(next.value === 'TRUE');
	}

	function parseNumber(stream) {
		let value = Number(stream.getNext().value);
		stream.consume();

		if (stream.nextIsPostfixOperator()) {
			value *= 0.01;
			stream.consume();
		}

		return builder.number(value);
	}

	function createUnaryOperator(symbol) {
		const precendence = {
			// negation
			'-': 7
		}[symbol];

		return createOperator(symbol, precendence, 1, true);
	}

	function createBinaryOperator(symbol) {
		const precendence = {
			// cell range union and intersect
			' ': 8,
			',': 8,
			// raise to power
			'^': 5,
			// multiply, divide
			'*': 4,
			'/': 4,
			// add, subtract
			'+': 3,
			'-': 3,
			// string concat
			'&': 2,
			// comparison
			'=': 1,
			'<>': 1,
			'<=': 1,
			'>=': 1,
			'>': 1,
			'<': 1
		}[symbol];

		return createOperator(symbol, precendence, 2, true);
	}

	return parseFormula;

})();

let visit = (function() {

	function visit(node, visitor) {
		visitNode(node, visitor);
	}

	function visitNode(node, visitor) {
		switch (node.type) {
			case 'cell':
				visitCell(node, visitor);
				break;
			case 'cell-range':
				visitCellRange(node, visitor);
				break;
			case 'function':
				visitFunction(node, visitor);
				break;
			case 'number':
				visitNumber(node, visitor);
				break;
			case 'text':
				visitText(node, visitor);
				break;
			case 'logical':
				visitLogical(node, visitor);
				break;
			case 'binary-expression':
				visitBinaryExpression(node, visitor);
				break;
			case 'unary-expression':
				visitUnaryExpression(node, visitor);
				break;
		}
	}

	function visitCell(node, visitor) {
		if (visitor.enterCell) visitor.enterCell(node);
		if (visitor.exitCell) visitor.exitCell(node);
	}

	function visitCellRange(node, visitor) {
		if (visitor.enterCellRange) visitor.enterCellRange(node);

		visitNode(node.left, visitor);
		visitNode(node.right, visitor);

		if (visitor.exitCellRange) visitor.exitCellRange(node);
	}

	function visitFunction(node, visitor) {
		if (visitor.enterFunction) visitor.enterFunction(node);

		node.arguments.forEach(arg => visitNode(arg, visitor));

		if (visitor.exitFunction) visitor.exitFunction(node);
	}

	function visitNumber(node, visitor) {
		if (visitor.enterNumber) visitor.enterNumber(node);
		if (visitor.exitNumber) visitor.exitNumber(node);
	}

	function visitText(node, visitor) {
		if (visitor.enterText) visitor.enterText(node);
		if (visitor.exitText) visitor.exitText(node);
	}

	function visitLogical(node, visitor) {
		if (visitor.enterLogical) visitor.enterLogical(node);
		if (visitor.exitLogical) visitor.exitLogical(node);
	}

	function visitBinaryExpression(node, visitor) {
		if (visitor.enterBinaryExpression) visitor.enterBinaryExpression(node);

		visitNode(node.left, visitor);
		visitNode(node.right, visitor);

		if (visitor.exitBinaryExpression) visitor.exitBinaryExpression(node);
	}

	function visitUnaryExpression(node, visitor) {
		if (visitor.enterUnaryExpression) visitor.enterUnaryExpression(node);

		visitNode(node.operand, visitor);

		if (visitor.exitUnaryExpression) visitor.exitUnaryExpression(node);
	}

	return visit;

})();

	
/*
 * Rewrite of: https://github.com/psalaets/excel-formula-tokenizer
 */

let tokenize = (function() {

	var languages = {
			"en-US": {
				// value for true
				true: "TRUE",
				// value for false
				false: "FALSE",
				// separates function arguments
				argumentSeparator: ",",
				// decimal point in numbers
				decimalSeparator: ".",
				// returns number string that can be parsed by Number()
				reformatNumberForJsParsing: n => n,
				isScientificNotation: token => /^[1-9]{1}(\.[0-9]+)?E{1}$/.test(token),
			},
			"de-DE": {
				true: "WAHR",
				false: "FALSCH",
				argumentSeparator: ";",
				decimalSeparator: ",",
				reformatNumberForJsParsing: n => n.replace(",", "."),
				isScientificNotation: token => /^[1-9]{1}(,[0-9]+)?E{1}$/.test(token),
			}
		};

	var TOK_TYPE_NOOP      = "noop",
		TOK_TYPE_OPERAND   = "operand",
		TOK_TYPE_FUNCTION  = "function",
		TOK_TYPE_SUBEXPR   = "subexpression",
		TOK_TYPE_ARGUMENT  = "argument",
		TOK_TYPE_OP_PRE    = "operator-prefix",
		TOK_TYPE_OP_IN     = "operator-infix",
		TOK_TYPE_OP_POST   = "operator-postfix",
		TOK_TYPE_WSPACE    = "white-space",
		TOK_TYPE_UNKNOWN   = "unknown",
		TOK_SUBTYPE_START     = "start",
		TOK_SUBTYPE_STOP      = "stop",
		TOK_SUBTYPE_TEXT      = "text",
		TOK_SUBTYPE_NUMBER    = "number",
		TOK_SUBTYPE_LOGICAL   = "logical",
		TOK_SUBTYPE_ERROR     = "error",
		TOK_SUBTYPE_RANGE     = "range",
		TOK_SUBTYPE_MATH      = "math",
		TOK_SUBTYPE_CONCAT    = "concatenate",
		TOK_SUBTYPE_INTERSECT = "intersect",
		TOK_SUBTYPE_UNION     = "union";

	function createToken(value, type, subtype = "") {
		return {value, type, subtype};
	}

	class Tokens {
		constructor() {
			this.items = [];
			this.index = -1;
		}

		add(value, type, subtype) {
			const token = createToken(value, type, subtype);
			this.addRef(token);
			return token;
		}

		addRef(token) {
			this.items.push(token);
		}

		reset() {
			this.index = -1;
		}

		BOF() {
			return this.index <= 0;
		}

		EOF() {
			return this.index >= this.items.length - 1;
		}

		moveNext() {
			if (this.EOF()) return false;
			this.index++;
			return true;
		}

		current() {
			if (this.index == -1) return null;
			return this.items[this.index];
		}

		next() {
			if (this.EOF()) return null;
			return this.items[this.index + 1];
		}

		previous() {
			if (this.index < 1) return null;
			return (this.items[this.index - 1]);
		}

		toArray() {
			return this.items;
		}
	}

	class TokenStack {
		constructor() {
			this.items = [];
		}

		push(token) {
			this.items.push(token);
		}

		pop() {
			const token = this.items.pop();
			return createToken("", token.type, TOK_SUBTYPE_STOP);
		}

		token() {
			if (this.items.length > 0) {
				return this.items[this.items.length - 1];
			} else {
				return null;
			}
		}

		value() {
			return this.token() ? this.token().value : "";
		}

		type() {
			return this.token() ? this.token().type : "";
		}

		subtype() {
			return this.token() ? this.token().subtype : "";
		}
	}

	function tokenize(formula, options) {
		options = options || {};
		options.language = options.language || "en-US";

		var language = languages[options.language];
		if (!language) {
			var msg = "Unsupported language " + options.language + ". Expected one of: "
				+ Object.keys(languages).sort().join(", ");
			throw new Error(msg);
		}

		var tokens = new Tokens();
		var tokenStack = new TokenStack();
		var offset = 0;
		var currentChar = function() { return formula.substr(offset, 1); };
		var doubleChar  = function() { return formula.substr(offset, 2); };
		var nextChar    = function() { return formula.substr(offset + 1, 1); };
		var EOF         = function() { return (offset >= formula.length); };
		var isPreviousNonDigitBlank = function() {
			var offsetCopy = offset;
			if (offsetCopy == 0) return true;
			while (offsetCopy > 0) {
				if (!/\d/.test(formula[offsetCopy])) {
					return /\s/.test(formula[offsetCopy]);
				}

				offsetCopy -= 1;
			}
			return false;
		};

		var isNextNonDigitTheRangeOperator = function() {
			var offsetCopy = offset;
			while (offsetCopy < formula.length) {
				if (!/\d/.test(formula[offsetCopy])) {
					return /:/.test(formula[offsetCopy]);
				}
				offsetCopy += 1;
			}
			return false;
		};

		var token = "";
		var inString = false;
		var inPath = false;
		var inRange = false;
		var inError = false;
		var inNumeric = false;

		while (formula.length > 0) {
			if (formula.substr(0, 1) == " ") {
				formula = formula.substr(1);
			} else {
				if (formula.substr(0, 1) == "=") {
					formula = formula.substr(1);
				}
				break;
			}
		}

		while (!EOF()) {
			// state-dependent character evaluation (order is important)
			// double-quoted strings
			// embeds are doubled
			// end marks token
			if (inString) {
				if (currentChar() == "\"") {
					if (nextChar() == "\"") {
						token += "\"";
						offset += 1;
					} else {
						inString = false;
						tokens.add(token, TOK_TYPE_OPERAND, TOK_SUBTYPE_TEXT);
						token = "";
					}
				} else {
					token += currentChar();
				}
				offset += 1;
				continue;
			}

			// single-quoted strings (links)
			// embeds are double
			// end does not mark a token
			if (inPath) {
				if (currentChar() == "'") {
					if (nextChar() == "'") {
						token += "'";
						offset += 1;
					} else {
						inPath = false;
					}
				} else {
					token += currentChar();
				}
				offset += 1;
				continue;
			}

			// bracked strings (range offset or linked workbook name)
			// no embeds (changed to "()" by Excel)
			// end does not mark a token
			if (inRange) {
				if (currentChar() == "]") {
					inRange = false;
				}
				token += currentChar();
				offset += 1;
				continue;
			}

			// error values
			// end marks a token, determined from absolute list of values
			if (inError) {
				token += currentChar();
				offset += 1;
				if ((",#NULL!,#DIV/0!,#VALUE!,#REF!,#NAME?,#NUM!,#N/A,").indexOf("," + token + ",") != -1) {
					inError = false;
					tokens.add(token, TOK_TYPE_OPERAND, TOK_SUBTYPE_ERROR);
					token = "";
				}
				continue;
			}

			if (inNumeric) {
				if ([language.decimalSeparator, "E"].indexOf(currentChar()) != -1 || /\d/.test(currentChar())) {
					token += currentChar();
					offset += 1;
					continue;
				} else if (("+-").indexOf(currentChar()) != -1 && language.isScientificNotation(token)) {
					token += currentChar();
					offset += 1;
					continue;
				} else {
					inNumeric = false;
					var jsValue = language.reformatNumberForJsParsing(token);
					tokens.add(jsValue, TOK_TYPE_OPERAND, TOK_SUBTYPE_NUMBER);
					token = "";
				}
			}

			// scientific notation check
			if (("+-").indexOf(currentChar()) != -1) {
				if (token.length > 1) {
					if (language.isScientificNotation(token)) {
						token += currentChar();
						offset += 1;
						continue;
					}
				}
			}

			// independent character evaulation (order not important)
			// function, subexpression, array parameters
			if (currentChar() == language.argumentSeparator) {
				if (token.length > 0) {
					tokens.add(token, TOK_TYPE_OPERAND);
					token = "";
				}
				if (tokenStack.type() == TOK_TYPE_FUNCTION) {
					tokens.add(",", TOK_TYPE_ARGUMENT);

					offset += 1;
					continue;
				}
			}

			if (currentChar() == ",") {
				if (token.length > 0) {
					tokens.add(token, TOK_TYPE_OPERAND);
					token = "";
				}
				tokens.add(currentChar(), TOK_TYPE_OP_IN, TOK_SUBTYPE_UNION);
				offset += 1;
				continue;
			}

			// establish state-dependent character evaluations
			if (/\d/.test(currentChar()) && (!token || isPreviousNonDigitBlank()) && !isNextNonDigitTheRangeOperator()) {
				inNumeric = true;
				token += currentChar();
				offset += 1;
				continue;
			}

			if (currentChar() == "\"") {
				if (token.length > 0) {
					// not expected
					tokens.add(token, TOK_TYPE_UNKNOWN);
					token = "";
				}
				inString = true;
				offset += 1;
				continue;
			}

			if (currentChar() == "'") {
				if (token.length > 0) {
					// not expected
					tokens.add(token, TOK_TYPE_UNKNOWN);
					token = "";
				}
				inPath = true;
				offset += 1;
				continue;
			}

			if (currentChar() == "[") {
				inRange = true;
				token += currentChar();
				offset += 1;
				continue;
			}

			if (currentChar() == "#") {
				if (token.length > 0) {
					// not expected
					tokens.add(token, TOK_TYPE_UNKNOWN);
					token = "";
				}
				inError = true;
				token += currentChar();
				offset += 1;
				continue;
			}

			// mark start and end of arrays and array rows
			if (currentChar() == "{") {
				if (token.length > 0) {
					// not expected
					tokens.add(token, TOK_TYPE_UNKNOWN);
					token = "";
				}
				tokenStack.push(tokens.add("ARRAY", TOK_TYPE_FUNCTION, TOK_SUBTYPE_START));
				tokenStack.push(tokens.add("ARRAYROW", TOK_TYPE_FUNCTION, TOK_SUBTYPE_START));
				offset += 1;
				continue;
			}

			if (currentChar() == ";") {
				if (token.length > 0) {
					tokens.add(token, TOK_TYPE_OPERAND);
					token = "";
				}
				tokens.add(";", TOK_TYPE_ARGUMENT);
				offset += 1;
				continue;
			}

			// if (currentChar() == ";") {
			// 	if (token.length > 0) {
			// 		tokens.add(token, TOK_TYPE_OPERAND);
			// 		token = "";
			// 	}
			// 	tokens.addRef(tokenStack.pop());
			// 	tokens.add(",", TOK_TYPE_ARGUMENT);
			// 	tokenStack.push(tokens.add("ARRAYROW", TOK_TYPE_FUNCTION, TOK_SUBTYPE_START));
			// 	offset += 1;
			// 	continue;
			// }

			if (currentChar() == "}") {
				if (token.length > 0) {
					tokens.add(token, TOK_TYPE_OPERAND);
					token = "";
				}
				tokens.addRef(tokenStack.pop());
				tokens.addRef(tokenStack.pop());
				offset += 1;
				continue;
			}

			// trim white-space
			if (currentChar() == " ") {
				if (token.length > 0) {
					tokens.add(token, TOK_TYPE_OPERAND);
					token = "";
				}
				tokens.add(currentChar(), TOK_TYPE_WSPACE);
				offset += 1;
				while ((currentChar() == " ") && (!EOF())) {
					offset += 1;
				}
				continue;
			}

			// multi-character comparators
			if ((",>=,<=,<>,").indexOf("," + doubleChar() + ",") != -1) {
				if (token.length > 0) {
					tokens.add(token, TOK_TYPE_OPERAND);
					token = "";
				}
				tokens.add(doubleChar(), TOK_TYPE_OP_IN, TOK_SUBTYPE_LOGICAL);
				offset += 2;
				continue;
			}

			// standard infix operators
			if (("+-*/^&=><").indexOf(currentChar()) != -1) {
				if (token.length > 0) {
					tokens.add(token, TOK_TYPE_OPERAND);
					token = "";
				}
				tokens.add(currentChar(), TOK_TYPE_OP_IN);
				offset += 1;
				continue;
			}

			// standard postfix operators
			if (("%").indexOf(currentChar()) != -1) {
				if (token.length > 0) {
					tokens.add(token, TOK_TYPE_OPERAND);
					token = "";
				}
				tokens.add(currentChar(), TOK_TYPE_OP_POST);
				offset += 1;
				continue;
			}

			// start subexpression or function
			if (currentChar() == "(") {
				if (token.length > 0) {
					tokenStack.push(tokens.add(token, TOK_TYPE_FUNCTION, TOK_SUBTYPE_START));
					token = "";
				} else {
					tokenStack.push(tokens.add("", TOK_TYPE_SUBEXPR, TOK_SUBTYPE_START));
				}
				offset += 1;
				continue;
			}

			// stop subexpression
			if (currentChar() == ")") {
				if (token.length > 0) {
					tokens.add(token, TOK_TYPE_OPERAND);
					token = "";
				}
				tokens.addRef(tokenStack.pop());
				offset += 1;
				continue;
			}

			// token accumulation
			token += currentChar();
			offset += 1;

		}

		// dump remaining accumulation
		if (token.length > 0) tokens.add(token, TOK_TYPE_OPERAND);
		// move all tokens to a new collection, excluding all unnecessary white-space tokens
		var tokens2 = new Tokens();

		while (tokens.moveNext()) {
			token = tokens.current();

			if (token.type == TOK_TYPE_WSPACE) {
				if ((tokens.BOF()) || (tokens.EOF())) {
					// no-op
				} else if (!(
						 ((tokens.previous().type == TOK_TYPE_FUNCTION) && (tokens.previous().subtype == TOK_SUBTYPE_STOP)) ||
						 ((tokens.previous().type == TOK_TYPE_SUBEXPR) && (tokens.previous().subtype == TOK_SUBTYPE_STOP)) ||
						 (tokens.previous().type == TOK_TYPE_OPERAND)
						)
					) {
						// no-op
					}
				else if (!(
						 ((tokens.next().type == TOK_TYPE_FUNCTION) && (tokens.next().subtype == TOK_SUBTYPE_START)) ||
						 ((tokens.next().type == TOK_TYPE_SUBEXPR) && (tokens.next().subtype == TOK_SUBTYPE_START)) ||
						 (tokens.next().type == TOK_TYPE_OPERAND)
						 )
					 ) {
						 // no-op
					 }
				else {
					tokens2.add(token.value, TOK_TYPE_OP_IN, TOK_SUBTYPE_INTERSECT);
				}
				continue;
			}
			tokens2.addRef(token);
		}

		// switch infix "-" operator to prefix when appropriate, switch infix "+" operator to noop when appropriate, identify operand
		// and infix-operator subtypes, pull "@" from in front of function names
		while (tokens2.moveNext()) {
			token = tokens2.current();
			if ((token.type == TOK_TYPE_OP_IN) && (token.value == "-")) {
				if (tokens2.BOF()) {
					token.type = TOK_TYPE_OP_PRE;
				} else if (
					 ((tokens2.previous().type == TOK_TYPE_FUNCTION) && (tokens2.previous().subtype == TOK_SUBTYPE_STOP)) ||
					 ((tokens2.previous().type == TOK_TYPE_SUBEXPR) && (tokens2.previous().subtype == TOK_SUBTYPE_STOP)) ||
					 (tokens2.previous().type == TOK_TYPE_OP_POST) ||
					 (tokens2.previous().type == TOK_TYPE_OPERAND)
				 ) {
					token.subtype = TOK_SUBTYPE_MATH;
				} else {
					token.type = TOK_TYPE_OP_PRE;
				}
				continue;
			}

			if ((token.type == TOK_TYPE_OP_IN) && (token.value == "+")) {
				if (tokens2.BOF()) {
					token.type = TOK_TYPE_NOOP;
				} else if (
					 ((tokens2.previous().type == TOK_TYPE_FUNCTION) && (tokens2.previous().subtype == TOK_SUBTYPE_STOP)) ||
					 ((tokens2.previous().type == TOK_TYPE_SUBEXPR) && (tokens2.previous().subtype == TOK_SUBTYPE_STOP)) ||
					 (tokens2.previous().type == TOK_TYPE_OP_POST) ||
					 (tokens2.previous().type == TOK_TYPE_OPERAND)
				 ) {
					token.subtype = TOK_SUBTYPE_MATH;
				} else {
					token.type = TOK_TYPE_NOOP;
				}
				continue;
			}

			if ((token.type == TOK_TYPE_OP_IN) && (token.subtype.length == 0)) {
				if (("<>=").indexOf(token.value.substr(0, 1)) != -1) {
					token.subtype = TOK_SUBTYPE_LOGICAL;
				} else if (token.value == "&") {
					token.subtype = TOK_SUBTYPE_CONCAT;
				} else {
					token.subtype = TOK_SUBTYPE_MATH;
				}
				continue;
			}

			if ((token.type == TOK_TYPE_OPERAND) && (token.subtype.length == 0)) {
				if (isNaN(Number(language.reformatNumberForJsParsing(token.value)))) {
					if (token.value == language.true) {
						token.subtype = TOK_SUBTYPE_LOGICAL;
						token.value = "TRUE";
					} else if (token.value == language.false) {
						token.subtype = TOK_SUBTYPE_LOGICAL;
						token.value = "FALSE";
					} else {
						token.subtype = TOK_SUBTYPE_RANGE;
					}
				} else {
					token.subtype = TOK_SUBTYPE_NUMBER;
					token.value = language.reformatNumberForJsParsing(token.value);
				}
				continue;
			}

			if (token.type == TOK_TYPE_FUNCTION) {
				if (token.value.substr(0, 1) == "@") {
					token.value = token.value.substr(1);
				}
				continue;
			}
		}
		tokens2.reset();

		// move all tokens to a new collection, excluding all noops
		tokens = new Tokens();
		while (tokens2.moveNext()) {
			if (tokens2.current().type != TOK_TYPE_NOOP) {
				tokens.addRef(tokens2.current());
			}
		}
		tokens.reset();

		return tokens.toArray();
	}

	return tokenize;

})();

function parseFormula(fString) {
	return execFormula(fString);
}

function evalFormula(fString, data={}) {
	return execFormula(fString, data);
}

function execFormula(fString, data) {
	let formula = fString,
		tokens,
		tree,
		result;

	try {
		tokens = tokenize(formula);
		tree = buildTree(tokens);
	} catch (error) {
		return { error: error.message };
	}

	let OPERANDS = {
			">":  (i, v) => i > v,
			">=": (i, v) => i >= v,
			"<":  (i, v) => i < v,
			"<=": (i, v) => i <= v,
			"==": (i, v) => i == v,
			"!=": (i, v) => i != v,
		},
		FUNCS = {
			"+": (x, y) => x + y,
			"-": (x, y) => x - y,
			"*": (x, y) => x * y,
			"/": (x, y) => x / y,
			"%": (x, y) => x % y,
			_FILTER: (...args) => {
				let [a, o, v] = args.shift().match(/(\W+)(\d+)/);
				return args.filter(i => OPERANDS[o](i, v));
			},
			CHAR: (...args) => String.fromCharCode(args[0]),
			LOWER: (...args) => args[0].toLowerCase(),
			UPPER: (...args) => args[0].toUpperCase(),
			PROPER: (...args) => args[0].split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" "),
			TRIM: (...args) => args[0].trim().replace(/\s{2,}/g, " "),
			IF: (...args) => args[[args.shift()].filter(i => !OPERANDS[args.shift()](i, args.shift())).length],
			SPLIT: (...args) => args[0].split(args[1]),
			SEARCH: (...args) => args[1].slice(args[2] || 0).indexOf(args[0]) + (args[2] || 0) + 1,
			LEN: (...args) => args.length === 1 ? args[0].toString().length : args.length,
			MID: (...args) => args[0].substr(args[1]-1, args[2]),
			LEFT: (...args) => args[0].slice(0, args[1] || 1),
			RIGHT: (...args) => args[0].slice(-args[1] || 1),
			MOD: (...args) => args[0] % args[1],
			MAX: (...args) => Math.max(...args),
			MIN: (...args) => Math.min(...args),
			SUM: (...args) => args.reduce((a, b) => a + b, 0),
			SUMIF: (...args) => FUNCS.SUM(...FUNCS._FILTER(...args)),
			CONCAT: (...args) => args.reduce((a, b) => a + b, ""),
			CONCATENATE: (...args) => FUNCS.CONCAT(...args),
			AVERAGE: (...args) => FUNCS.SUM(...args) / args.length,
			COUNT: (...args) => args.filter(i => i == +i).length,
			COUNTA: (...args) => args.length,
			COUNTIF: (...args) => FUNCS.COUNT(...FUNCS._FILTER(...args)),
		};

	// create visitor for parts of tree:
	// https://github.com/psalaets/excel-formula-ast
	let VISITOR = {
		enterFunction(fNode) {
			let name = fNode.name,
				args = [];
			
			fNode.arguments.map(item => {
				if (item._value) return;
				switch (item.type) {
					case "function":
						args.push(VISITOR.enterFunction(item));
						break;
					case "binary-expression":
						args.push(item.left.value ?? data[item.left.key].v);
						args.push(item.operator);
						args.push(item.right.value ?? data[item.right.key].v);
						break;
					case "text":
					case "number":
						if (name !== "IF" && name.endsWith("IF")) args.unshift(item.value);
						else args.push(item.value);
						break;
					case "cell":
						args.push(data[item.key].v);
						break;
					case "cell-range":
						let left = decode_cell(item.left.key),
							right = decode_cell(item.right.key),
							cell;
						for (let c=left.c, cl=right.c+1; c<cl; c++) {
							for (let r=left.r, rl=right.r+1; r<rl; r++) {
								cell = encode_cell({ c: Math.max(c, 0), r: Math.max(r, 0) });
								args.push(data[cell].v);
							}
						}
						break;
					default:
						args = fNode.arguments.map(i => i.type === "number" ? i.value : null).filter(i => i);
				}
				// mark entry as "done"
				item._value = true;
			});
			// execute function
			if (args.length) {
				fNode._value =
				result = FUNCS[name](...args);
			}

			return result;
		},
		enterBinaryExpression(fNode) {
			// exits on non-valid expression
			if (!FUNCS[fNode.operator]) return;

			let args = [],
				evalFn = item => {
					let a, r;
					switch (item.type) {
						case "binary-expression":
							a = [evalFn(item.left), evalFn(item.right)];
							r = FUNCS[item.operator](...a);
							item._value = r;
							return r;
						case "function":
							r = VISITOR.enterFunction(item);
							item._value = r;
							return r;
						case "text":
						case "number":
							return item.value;
					}
				};
			args.push(evalFn(fNode.left));
			args.push(evalFn(fNode.right));
			if (args.length && !fNode._value) {
				fNode._value =
				result = FUNCS[fNode.operator](...args);
			}

			return result;
		},
	};

	// send visitor through tree
	if (data) visit(tree, VISITOR);
	else return { tree, tokens };

	return result;
}


	
var strs = {}, // shared strings
	_ssfopts = {}; // spreadsheet formatting options

RELS.WS = [
		"http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet",
		"http://purl.oclc.org/ooxml/officeDocument/relationships/worksheet"
	];

function get_sst_id(sst, str, rev) {
	var i = 0,
		len = sst.length;
	if (rev) {
		if (rev.has(str)) {
			var revarr = rev.get(str);
			for (; i<revarr.length; ++i) {
				if (sst[revarr[i]].t === str) {
					sst.Count ++;
					return revarr[i];
				}
			}
		}
	} else for(; i<len; ++i) {
		if (sst[i].t === str) {
			sst.Count ++;
			return i;
		}
	}
	sst[len] = { t: str };
	sst.Count ++;
	sst.Unique ++;

	if (rev) {
		if (!rev.has(str)) rev.set(str, []);
		rev.get(str).push(len);
	}

	return len;
}

function col_obj_w(C, col) {
	var p = {
			min: C + 1,
			max: C + 1
		},
		/* wch (chars), wpx (pixels) */
		wch = -1;
	if (col.MDW) MDW = col.MDW;
	
	if (col.width != null) p.customWidth = 1;
	else if (col.wpx != null) wch = px2char(col.wpx);
	else if (col.wch != null) wch = col.wch;

	if (wch > -1) {
		p.width = char2width(wch);
		p.customWidth = 1;
	} else if (col.width != null) {
		p.width = col.width;
	}
	
	if (col.hidden) p.hidden = true;

	return p;
}

function default_margins(margins, mode) {
	if (!margins) return;
	var defs = [0.7, 0.7, 0.75, 0.75, 0.3, 0.3];
	if (mode == "xlml") defs = [1, 1, 1, 1, 0.5, 0.5];
	if (margins.left   == null) margins.left   = defs[0];
	if (margins.right  == null) margins.right  = defs[1];
	if (margins.top    == null) margins.top    = defs[2];
	if (margins.bottom == null) margins.bottom = defs[3];
	if (margins.header == null) margins.header = defs[4];
	if (margins.footer == null) margins.footer = defs[5];
}

function get_cell_styles(wb, ref) {
	var fills = wb.fills,
		fonts = wb.fonts,
		borders = wb.borders,
		td = document.getElementById(ref),
		cellStyle = getComputedStyle(td);
	
	// cell background
	let clr = cellStyle["background-color"].match(/\d+/g).map(i => +i),
		color = rgb2Hex(clr).toLowerCase(),
		fill =  fills.find(c => c.color === color);
	if (clr[3] !== 0) {
		if (fill) fill.refs.push(ref);
		else fills.push({ color, refs: [ref] });
	}
	// cell border style
	if (cellStyle["position"] === "relative") {
		let beforeStyle = getComputedStyle(td, ":before"),
			keys = ["top", "right", "bottom", "left"],
			bRecord = {
				width: keys.map(k => parseInt(beforeStyle[`border-${k}-width`], 10)),
				style: keys.map(k => beforeStyle[`border-${k}-style`]),
				color: keys.map(k => beforeStyle[`border-${k}-color`].match(/\d+/g).map(i => +i)).map(c => rgb2Hex(c).toLowerCase()),
			},
			border = borders.find(f => JSON.stringify(f.fRecord) === JSON.stringify(bRecord));
		
		if (border) border.refs.push(ref);
		else borders.push({ bRecord, refs: [ref] });
	}
	// cell font style
	let fClr = cellStyle["color"].match(/\d+/g).map(i => +i),
		sup = cellStyle["vertical-align"] === "super" ? 1 : 0,
		sub = cellStyle["vertical-align"] === "sub" ? 1 : 0,
		bold = cellStyle["font-weight"] >= 500 ? 1 : 0,
		italic = cellStyle["font-style"] === "italic" ? 1 : 0,
		underline = cellStyle["text-decoration"].startsWith("underline") ? 1 : 0,
		strike = cellStyle["text-decoration"].startsWith("line-through") ? 1 : 0,
		fRecord = {
			family: cellStyle["font-family"].replace(/"/g, "'"),
			size: (sup || sub) ? 12 : (parseInt(cellStyle["font-size"], 10)) * (72/96),
			color: rgb2Hex(fClr).toLowerCase(),
			bold,
			italic,
			underline,
			strike,
			sup,
			sub,
		},
		font = fonts.find(f => JSON.stringify(f.fRecord) === JSON.stringify(fRecord));

	if (font) font.refs.push(ref);
	else fonts.push({ fRecord, refs: [ref] });
}

function get_cell_style(styles, cell, opts, ref, wb) {
	var td = document.getElementById(ref),
		cellStyle = ref ? getComputedStyle(td) : {},
		numFmtId = opts.revssf[cell.z != null ? cell.z : "General"],
		i = 0x3c,
		len = styles.length,
		alignment = {},
		borderId = 0,
		fillId = 0,
		fontId = 0;
	
	if (numFmtId == null && opts.ssf) {
		for (; i<0x188; ++i) {
			if (opts.ssf[i] == null) {
				SSF.load(cell.z, i);
				// $FlowIgnore
				opts.ssf[i] = cell.z;
				opts.revssf[cell.z] = numFmtId = i;
				break;
			}
		}
	}

	if (ref) {
		if (["center", "right"].includes(cellStyle["text-align"])) {
			alignment.horizontal = cellStyle["text-align"];
		}
		if (["top", "middle"].includes(cellStyle["vertical-align"])) {
			let translate = {
					top: "top",
					middle: "center",
				};
			alignment.vertical = translate[cellStyle["vertical-align"]];
		}
		wb.borders.map((b, i) => (b.refs.includes(ref)) ? borderId = i + 2 : null);
		wb.fills.map((f, i) => (f.refs.includes(ref)) ? fillId = i + 2 : null);
		wb.fonts.map((f, i) => (f.refs.includes(ref)) ? fontId = i + 1 : null);
	}
	
	let st = styles.find(s =>
				s.numFmtId === numFmtId &&
				s.borderId === borderId &&
				s.fillId === fillId &&
				s.fontId === fontId &&
				JSON.stringify(s.alignment) === JSON.stringify(alignment));
	if (st) return styles.indexOf(st);

	// push properties to styles array
	styles[len] = {
		alignment,
		fillId,
		fontId,
		numFmtId,
		borderId,
		xfId: 0,
		applyNumberFormat: 1,
	};

	return len;
}

function safe_format(p, fmtid, fillid, opts, themes, styles) {
	try {
		if (opts.cellNF) p.z = SSF._table[fmtid];
	} catch (e) {
		if (opts.WTF) throw e;
	}
	
	if (p.t === "z") return;
	if (p.t === "d" && typeof p.v === "string") p.v = parseDate(p.v);

	if (!opts || opts.cellText !== false) {
		try {
			if (SSF._table[fmtid] == null) SSF.load(SSFImplicit[fmtid] || "General", fmtid);
			if (p.t === "e") p.w = p.w || BErr[p.v];
			else if (fmtid === 0) {
				if (p.t === "n") {
					if ((p.v|0) === p.v) p.w = SSF._general_int(p.v);
					else p.w = SSF._general_num(p.v);
				} else if (p.t === "d") {
					var dd = datenum(p.v);
					if ((dd|0) === dd) p.w = SSF._general_int(dd);
					else p.w = SSF._general_num(dd);
				} else if (p.v === undefined) {
					return "";
				} else {
					p.w = SSF._general(p.v, _ssfopts);
				}
			} else if (p.t === "d") {
				p.w = SSF.format(fmtid, datenum(p.v), _ssfopts);
			} else {
				p.w = SSF.format(fmtid, p.v, _ssfopts);
			}
		} catch (e) {
			if (opts.WTF) throw e;
		}
	}
	if (!opts.cellStyles) return;

	if (fillid != null) {
		try {
			p.s = styles.Fills[fillid];
			if (p.s.fgColor && p.s.fgColor.theme && !p.s.fgColor.rgb) {
				p.s.fgColor.rgb = rgb_tint(themes.themeElements.clrScheme[p.s.fgColor.theme].rgb, p.s.fgColor.tint || 0);
				if (opts.WTF) p.s.fgColor.raw_rgb = themes.themeElements.clrScheme[p.s.fgColor.theme].rgb;
			}
			if (p.s.bgColor && p.s.bgColor.theme) {
				p.s.bgColor.rgb = rgb_tint(themes.themeElements.clrScheme[p.s.bgColor.theme].rgb, p.s.bgColor.tint || 0);
				if (opts.WTF) p.s.bgColor.raw_rgb = themes.themeElements.clrScheme[p.s.bgColor.theme].rgb;
			}
		} catch (e) {
			if (opts.WTF && styles.Fills) throw e;
		}
	}
}

function check_ws(ws, sname, i) {
	if (ws && ws["!ref"]) {
		var range = safe_decode_range(ws["!ref"]);
		if (range.e.c < range.s.c || range.e.r < range.s.r) {
			throw new Error("Bad range (" + i + "): " + ws["!ref"]);
		}
	}
}

	
var mergecregex = /<(?:\w:)?mergeCell ref="[A-Z0-9:]+"\s*[\/]?>/g,
	sheetdataregex = /<(?:\w+:)?sheetData[^>]*>([\s\S]*)<\/(?:\w+:)?sheetData>/,
	hlinkregex = /<(?:\w:)?hyperlink [^>]*>/mg,
	dimregex = /"(\w*:\w*)"/,
	colregex = /<(?:\w:)?col\b[^>]*[\/]?>/g,
	afregex = /<(?:\w:)?autoFilter[^>]*([\/]|>([\s\S]*)<\/(?:\w:)?autoFilter)>/g,
	marginregex= /<(?:\w:)?pageMargins[^>]*\/>/g,
	sheetprregex = /<(?:\w:)?sheetPr\b(?:[^>a-z][^>]*)?\/>/,
	svsregex = /<(?:\w:)?sheetViews[^>]*(?:[\/]|>([\s\S]*)<\/(?:\w:)?sheetViews)>/,
	sheetprot_deffalse = [
		"objects",
		"scenarios",
		"selectLockedCells",
		"selectUnlockedCells"
	],
	sheetprot_deftrue = [
		"formatColumns",
		"formatRows",
		"formatCells",
		"insertColumns",
		"insertRows",
		"insertHyperlinks",
		"deleteColumns",
		"deleteRows",
		"sort",
		"autoFilter",
		"pivotTables"
	],
	sviewregex = /<(?:\w:)?sheetView(?:[^>a-z][^>]*)?\/?>/,
	WS_XML_ROOT = writextag("worksheet", null, {
		"xmlns": XMLNS.main[0],
		"xmlns:r": XMLNS.r,
		"xmlns:x14ac": XMLNS.x14ac,
		"xmlns:mc": XMLNS.mc,
		"mc:Ignorable": "x14ac",
	});;

function parse_ws_xml_dim(ws, s) {
	var d = safe_decode_range(s);
	if (d.s.r <= d.e.r && d.s.c <= d.e.c && d.s.r >= 0 && d.s.c >= 0) {
		ws["!ref"] = encode_range(d);
	}
}

/* 18.3 Worksheets */
function parse_ws_xml(data, opts, idx, rels, wb, themes, styles) {
	if (!data) return data;
	if (!rels) rels = { "!id": {} };
	if (DENSE != null && opts.dense == null) opts.dense = DENSE;

	/* 18.3.1.99 worksheet CT_Worksheet */
	var s = opts.dense ? [] : {},
		refguess = {
			s: { r: 2000000, c: 2000000 },
			e: { r: 0, c: 0 }
		};

	var data1 = "",
		data2 = "",
		mtch = data.match(sheetdataregex);
	if (mtch) {
		data1 = data.slice(0, mtch.index);
		data2 = data.slice(mtch.index + mtch[0].length);
	} else {
		data1 = data2 = data;
	}

	/* 18.3.1.82 sheetPr CT_SheetPr */
	var sheetPr = data1.match(sheetprregex);
	if (sheetPr) parse_ws_xml_sheetpr(sheetPr[0], s, wb, idx);

	/* 18.3.1.35 dimension CT_SheetDimension */
	var ridx = (data1.match(/<(?:\w*:)?dimension/) || { index: -1 }).index;
	if (ridx > 0) {
		var ref = data1.slice(ridx, ridx+50).match(dimregex);
		if (ref) parse_ws_xml_dim(s, ref[1]);
	}

	/* 18.3.1.88 sheetViews CT_SheetViews */
	var svs = data1.match(svsregex);
	if (svs && svs[1]) parse_ws_xml_sheetviews(svs[1], wb);

	/* 18.3.1.17 cols CT_Cols */
	var columns = [];
	if (opts.cellStyles) {
		/* 18.3.1.13 col CT_Col */
		var cols = data1.match(colregex);
		if (cols) parse_ws_xml_cols(columns, cols);
	}

	/* 18.3.1.80 sheetData CT_SheetData ? */
	if (mtch) parse_ws_xml_data(mtch[1], s, opts, refguess, themes, styles);

	/* 18.3.1.2  autoFilter CT_AutoFilter */
	var afilter = data2.match(afregex);
	if (afilter) {
		s["!autofilter"] = parse_ws_xml_autofilter(afilter[0]);
	}

	/* 18.3.1.55 mergeCells CT_MergeCells */
	var merges = [],
		_merge = data2.match(mergecregex);
	if (_merge) {
		for(ridx=0; ridx!=_merge.length; ++ridx) {
			merges[ridx] = safe_decode_range(_merge[ridx].slice(_merge[ridx].indexOf("\"")+1));
		}
	}

	/* 18.3.1.48 hyperlinks CT_Hyperlinks */
	var hlink = data2.match(hlinkregex);
	if (hlink) parse_ws_xml_hlinks(s, hlink, rels);

	/* 18.3.1.62 pageMargins CT_PageMargins */
	var margins = data2.match(marginregex);
	if (margins) {
		s["!margins"] = parse_ws_xml_margins(parsexmltag(margins[0]));
	}

	if (!s["!ref"] && refguess.e.c >= refguess.s.c && refguess.e.r >= refguess.s.r) {
		s["!ref"] = encode_range(refguess);
	}
	if (opts.sheetRows > 0 && s["!ref"]) {
		var tmpref = safe_decode_range(s["!ref"]);
		if (opts.sheetRows <= +tmpref.e.r) {
			tmpref.e.r = opts.sheetRows - 1;
			if (tmpref.e.r > refguess.e.r) tmpref.e.r = refguess.e.r;
			if (tmpref.e.r < tmpref.s.r) tmpref.s.r = tmpref.e.r;
			if (tmpref.e.c > refguess.e.c) tmpref.e.c = refguess.e.c;
			if (tmpref.e.c < tmpref.s.c) tmpref.s.c = tmpref.e.c;
			s["!fullref"] = s["!ref"];
			s["!ref"] = encode_range(tmpref);
		}
	}
	if (columns.length > 0) s["!cols"] = columns;
	if (merges.length > 0) s["!merges"] = merges;

	return s;
}

function write_ws_xml_merges(merges) {
	if (merges.length === 0) return "";
	var o = `<mergeCells count="${merges.length}">`;
	for (var i=0, il=merges.length; i!=il; ++i) {
		o += `<mergeCell ref="${encode_range(merges[i])}"/>`;
	}
	return o + "</mergeCells>";
}

/* 18.3.1.82-3 sheetPr CT_ChartsheetPr / CT_SheetPr */
function parse_ws_xml_sheetpr(sheetPr, s, wb, idx) {
	var data = parsexmltag(sheetPr);
	if (!wb.Sheets[idx]) {
		wb.Sheets[idx] = {};
	}
	if (data.codeName) {
		wb.Sheets[idx].CodeName = unescapexml(utf8read(data.codeName));
	}
}

function write_ws_xml_sheetpr(ws, wb, idx, opts, o) {
	var needed = false,
		props = {},
		payload = null;
	if (opts.bookType !== "xlsx" && wb.vbaraw) {
		var cname = wb.SheetNames[idx];
		try {
			if (wb.Workbook) cname = wb.Workbook.Sheets[idx].CodeName || cname;
		} catch(e) {}
		needed = true;
		props.codeName = utf8write(escapexml(cname));
	}

	if (ws && ws["!outline"]) {
		var outlineprops = { summaryBelow: 1, summaryRight: 1 };
		if (ws["!outline"].above) outlineprops.summaryBelow = 0;
		if (ws["!outline"].left) outlineprops.summaryRight = 0;
		payload = (payload || "") + writextag("outlinePr", null, outlineprops);
	}

	if (!needed && !payload) return;
	o[o.length] = writextag("sheetPr", payload, props);
}

/* 18.3.1.85 sheetProtection CT_SheetProtection */
function write_ws_xml_protection(sp) {
	// algorithmName, hashValue, saltValue, spinCount
	var o = { sheet: 1 };
	sheetprot_deffalse.forEach(n => { if (sp[n] != null && sp[n]) o[n] = "1"; });
	sheetprot_deftrue.forEach(n => { if (sp[n] != null && !sp[n]) o[n] = "0"; });
	/* TODO: algorithm */
	if (sp.password) {
		throw new Error("Password protection is not supported");
	}

	return writextag("sheetProtection", null, o);
}

function parse_ws_xml_hlinks(s, data, rels) {
	var dense = Array.isArray(s);
	for (var i=0, il=data.length; i!=il; ++i) {
		var val = parsexmltag(utf8read(data[i]), true);
		if (!val.ref) return;
		var rel = ((rels || {})["!id"] || [])[val.id];
		if (rel) {
			val.Target = rel.Target;
			if (val.location) {
				val.Target += "#"+ val.location;
			}
		} else {
			val.Target = "#"+ val.location;
			rel = { Target: val.Target, TargetMode: "Internal" };
		}
		val.Rel = rel;
		if (val.tooltip) {
			val.Tooltip = val.tooltip;
			delete val.tooltip;
		}
		var rng = safe_decode_range(val.ref);
		for (var R=rng.s.r; R<=rng.e.r; ++R) {
			for(var C=rng.s.c; C<=rng.e.c; ++C) {
				var addr = encode_cell({ c: C, r: R });
				if (dense) {
					if (!s[R]) s[R] = [];
					if (!s[R][C]) s[R][C] = { t: "z", v: undefined };
					s[R][C].l = val;
				} else {
					if (!s[addr]) s[addr] = { t: "z", v: undefined };
					s[addr].l = val;
				}
			}
		}
	}
}

function parse_ws_xml_margins(margin) {
	var o = {};
	["left", "right", "top", "bottom", "header", "footer"].forEach(k => {
		if (margin[k]) o[k] = parseFloat(margin[k]);
	});
	return o;
}

function write_ws_xml_margins(margin) {
	default_margins(margin);
	return writextag("pageMargins", null, margin);
}

function parse_ws_xml_cols(columns, cols) {
	var seencol = false;
	for (var coli=0, cl=cols.length; coli!=cl; ++coli) {
		var coll = parsexmltag(cols[coli], true);
		if (coll.hidden) {
			coll.hidden = parsexmlbool(coll.hidden);
		}
		var colm = parseInt(coll.min, 10) - 1,
			colM = parseInt(coll.max, 10) - 1;
		delete coll.min;
		delete coll.max;
		coll.width = +coll.width;
		if (!seencol && coll.width) {
			seencol = true;
			find_mdw_colw(coll.width);
		}
		process_col(coll);
		while (colm <= colM) {
			columns[colm++] = dup(coll);
		}
	}
}
function write_ws_xml_cols(ws, cols) {
	var o = ["<cols>"],
		col;
	for (var i=0, cl=cols.length; i!=cl; ++i) {
		if (!(col = cols[i])) continue;
		o[o.length] = writextag("col", null, col_obj_w(i, col));
	}
	o[o.length] = "</cols>";
	return o.join("");
}

function parse_ws_xml_autofilter(data) {
	var o = { ref: (data.match(/ref="([^"]*)"/) || [])[1] };
	return o;
}

function write_ws_xml_autofilter(data, ws, wb, idx) {
	var ref = typeof data.ref == "string" ? data.ref : encode_range(data.ref);
	if (!wb.Workbook) wb.Workbook = { Sheets: [] };
	if (!wb.Workbook.Names) wb.Workbook.Names = [];
	
	var names = wb.Workbook.Names,
		range = decode_range(ref);
	
	if (range.s.r == range.e.r) {
		range.e.r = decode_range(ws["!ref"]).e.r;
		ref = encode_range(range);
	}
	
	for (var i=0, il=names.length; i<il; ++i) {
		var name = names[i];
		if (name.Name != "_xlnm._FilterDatabase") continue;
		if (name.Sheet != idx) continue;
		name.Ref = "'"+ wb.SheetNames[idx] +"'!"+ ref;
		break;
	}

	if (i == names.length) {
		names.push({
			Name: "_xlnm._FilterDatabase",
			Sheet: idx,
			Ref: "'"+ wb.SheetNames[idx] +"'!"+ ref
		});
	}

	return writextag("autoFilter", null, {ref:ref});
}

/* 18.3.1.88 sheetViews CT_SheetViews */
/* 18.3.1.87 sheetView CT_SheetView */
function parse_ws_xml_sheetviews(data, wb) {
	if (!wb.Views) wb.Views = [{}];
	(data.match(sviewregex) || []).forEach(function(r, i) {
		var tag = parsexmltag(r);
		// $FlowIgnore
		if (!wb.Views[i]) wb.Views[i] = {};
		// $FlowIgnore
		if (+tag.zoomScale) wb.Views[i].zoom = +tag.zoomScale;
		// $FlowIgnore
		if (parsexmlbool(tag.rightToLeft)) wb.Views[i].RTL = true;
	});
}

function write_ws_xml_sheetviews(ws, opts, idx, wb) {
	var sview = { workbookViewId: "0" },
		pNode = null;
	
	// $FlowIgnore
	if ((((wb || {}).Workbook || {}).Views || [])[0]) {
		sview.rightToLeft = wb.Workbook.Views[0].RTL ? "1" : "0";
	}
	if (ws["!freeze"]) {
		let pOpts = {
				state: "frozen",
				xSplit: "0",
				ySplit: "1",
				topLeftCell: ws["!freeze"],
				activePane: "bottomLeft",
			};
		pNode = writextag("pane", null, pOpts);
	}

	let svNode = writextag("sheetView", pNode, sview);
	return writextag("sheetViews", svNode, {});
}

function write_ws_xml_cell(cell, ref, ws, opts, idx, wb) {
	if (cell.v === undefined && typeof cell.f !== "string" || cell.t === "z") return "";
	var vv = "",
		oldt = cell.t,
		oldv = cell.v;
	
	if (cell.t !== "z") {
		switch (cell.t) {
			case "b":
				vv = cell.v ? "1" : "0";
				break;
			case "n":
				vv = ""+ cell.v;
				break;
			case "e":
				vv = BErr[cell.v];
				break;
			case "d":
				if (opts && opts.cellDates) {
					vv = parseDate(cell.v, -1).toISOString();
				} else {
					cell = dup(cell);
					cell.t = "n";
					vv = ""+ (cell.v = datenum(parseDate(cell.v)));
				}
				if (typeof cell.z === "undefined") {
					cell.z = SSF._table[14];
				}
				break;
			default:
				vv = cell.v;
				if (vv.startsWith("<is>")) cell.t = "is";
				break;
		}
	}
	
	var v = cell.t === "is" ? vv.replace(/\n|\t/g, "") : writetag("v", escapexml(vv)),
		o = { r: ref },
		/* TODO: cell style */
		os = get_cell_style(opts.cellXfs, cell, opts, ref, wb);
	if (os !== 0) o.s = os;

	switch (cell.t) {
		case "n": break;
		case "d": o.t = "d"; break;
		case "b": o.t = "b"; break;
		case "e": o.t = "e"; break;
		// case "is": o.t = "inlineStr"; break;
		case "z": break;
		default:
			if (cell.v == null) {
				delete cell.t;
				break;
			}
			if (opts && opts.bookSST) {
				v = writetag("v", ""+ get_sst_id(opts.Strings, cell.v, opts.revStrings));
				o.t = "s";
				break;
			}
			o.t = "str";
			break;
	}
	if (v.includes(' xml:space="preserve"')) o["xml:space"] = "preserve";

	if (cell.t != oldt) {
		cell.t = oldt;
		cell.v = oldv;
	}
	if (typeof cell.f == "string" && cell.f) {
		var ff = cell.F && cell.F.slice(0, ref.length) == ref ? { t: "array", ref: cell.F } : null;
		v = writextag("f", escapexml(cell.f), ff) + (cell.v != null ? v : "");
	}
	if (cell.l) ws["!links"].push([ref, cell.l]);
	if (cell.c) ws["!comments"].push([ref, cell.c]);
	
	// console.log( writextag("c", v, o) );
	return writextag("c", v, o);
}

var parse_ws_xml_data = (function() {
	var cellregex = /<(?:\w+:)?c[ \/>]/,
		rowregex = /<\/(?:\w+:)?row>/,
		rregex = /r=["']([^"']*)["']/,
		isregex = /<(?:\w+:)?is>([\S\s]*?)<\/(?:\w+:)?is>/,
		refregex = /ref=["']([^"']*)["']/,
		match_v = matchtag("v"),
		match_f = matchtag("f");

	return function(sdata, s, opts, guess, themes, styles) {
		var ri = 0,
			x = "",
			cells = [],
			cref = [],
			idx = 0,
			i = 0,
			cc = 0,
			d = "",
			p,
			tag,
			tagr = 0,
			tagc = 0,
			sstr,
			ftag,
			fmtid = 0,
			fillid = 0,
			do_format = Array.isArray(styles.CellXf),
			cf,
			arrayf = [],
			sharedf = [],
			dense = Array.isArray(s),
			rows = [],
			rowobj = {},
			rowrite = false,
			sheetStubs = !!opts.sheetStubs,
			marr = sdata.split(rowregex),
			mt = 0,
			marrlen = marr.length;
		
		for (; mt != marrlen; ++mt) {
			x = marr[mt].trim();
			var xlen = x.length;
			if (xlen === 0) continue;

			/* 18.3.1.73 row CT_Row */
			for (ri=0; ri<xlen; ++ri) {
				if (x.charCodeAt(ri) === 62) break;
			}
			++ri;
			tag = parsexmltag(x.slice(0,ri), true);
			tagr = tag.r != null ? parseInt(tag.r, 10) : tagr+1;
			tagc = -1;

			if (opts.sheetRows && opts.sheetRows < tagr) continue;
			if (guess.s.r > tagr - 1) guess.s.r = tagr - 1;
			if (guess.e.r < tagr - 1) guess.e.r = tagr - 1;

			if (opts && opts.cellStyles) {
				rowobj = {};
				rowrite = false;
				if (tag.ht) {
					rowrite = true;
					rowobj.hpt = parseFloat(tag.ht);
					rowobj.hpx = pt2px(rowobj.hpt);
				}
				if (tag.hidden == "1") {
					rowrite = true;
					rowobj.hidden = true;
				}
				if (tag.outlineLevel != null) {
					rowrite = true;
					rowobj.level = +tag.outlineLevel;
				}
				if (rowrite) {
					rows[tagr-1] = rowobj;
				}
			}

			/* 18.3.1.4 c CT_Cell */
			cells = x.slice(ri).split(cellregex);
			for (var rslice = 0; rslice != cells.length; ++rslice) {
				if (cells[rslice].trim().charAt(0) != "<") break;
			}
			cells = cells.slice(rslice);
			for (ri = 0; ri != cells.length; ++ri) {
				x = cells[ri].trim();
				if (x.length === 0) continue;
				cref = x.match(rregex);
				idx = ri;
				i = 0;
				cc = 0;
				x = "<c "+ (x.slice(0,1) == "<" ? ">" : "") + x;
				if (cref != null && cref.length === 2) {
					idx = 0;
					d = cref[1];
					for (i=0; i!=d.length; ++i) {
						if ((cc = d.charCodeAt(i) - 64) < 1 || cc > 26) break;
						idx = 26 * idx + cc;
					}
					--idx;
					tagc = idx;
				} else {
					++tagc;
				}
				for (i=0; i!=x.length; ++i) {
					if (x.charCodeAt(i) === 62) break;
				}
				++i;
				tag = parsexmltag(x.slice(0,i), true);
				if (!tag.r) {
					tag.r = encode_cell({ r: tagr-1, c: tagc });
				}
				d = x.slice(i);
				p = { t: "" };

				if ((cref=d.match(match_v))!= null && cref[1] !== "") {
					p.v = unescapexml(cref[1]);
				}
				if (opts.cellFormula) {
					if ((cref=d.match(match_f)) != null && cref[1] !== "") {
						/* TODO: match against XLSXFutureFunctions */
						p.f = unescapexml(utf8read(cref[1])).replace(/\r\n/g, "\n");
						if (!opts.xlfn) p.f = _xlfn(p.f);

						if (cref[0].indexOf('t="array"') > -1) {
							p.F = (d.match(refregex) || [])[1];
							if (p.F.indexOf(":") > -1) {
								arrayf.push([safe_decode_range(p.F), p.F]);
							}
						} else if (cref[0].indexOf('t="shared"') > -1) {
							// TODO: parse formula
							ftag = parsexmltag(cref[0]);
							var ___f = unescapexml(utf8read(cref[1]));
							if (!opts.xlfn) {
								___f = _xlfn(___f);
							}
							sharedf[parseInt(ftag.si, 10)] = [ftag, ___f, tag.r];
						}
					} else if ((cref=d.match(/<f[^>]*\/>/))) {
						ftag = parsexmltag(cref[0]);
						if (sharedf[ftag.si]) {
							p.f = shift_formula_xlsx(sharedf[ftag.si][1], sharedf[ftag.si][2], tag.r);
						}
					}
					/* TODO: factor out contains logic */
					var _tag = decode_cell(tag.r);
					for (i = 0; i < arrayf.length; ++i) {
						if (_tag.r >= arrayf[i][0].s.r && _tag.r <= arrayf[i][0].e.r) {
							if (_tag.c >= arrayf[i][0].s.c && _tag.c <= arrayf[i][0].e.c) {
								p.F = arrayf[i][1];
							}
						}
					}
				}

				if (tag.t == null && p.v === undefined) {
					if (p.f || p.F) {
						p.v = 0;
						p.t = "n";
					} else if (!sheetStubs) {
						continue;
					} else {
						p.t = "z";
					}
				} else {
					p.t = tag.t || "n";
				}
				if (guess.s.c > tagc) guess.s.c = tagc;
				if (guess.e.c < tagc) guess.e.c = tagc;
				/* 18.18.11 t ST_CellType */
				switch (p.t) {
					case "n":
						if (p.v == "" || p.v == null) {
							if (!sheetStubs) continue;
							p.t = "z";
						} else p.v = parseFloat(p.v);
						break;
					case "s":
						if (typeof p.v == "undefined") {
							if (!sheetStubs) continue;
							p.t = "z";
						} else {
							sstr = strs[parseInt(p.v, 10)];
							p.v = sstr.t;
							p.r = sstr.r;
							if (opts.cellHTML) p.h = sstr.h;
						}
						break;
					case "str":
						p.t = "s";
						p.v = (p.v != null) ? utf8read(p.v) : "";
						if (opts.cellHTML) p.h = escapehtml(p.v);
						break;
					case "inlineStr":
						cref = d.match(isregex);
						p.t = "s";
						if (cref != null && (sstr = parse_si(cref[1]))) {
							p.v = sstr.t;
							if (opts.cellHTML) p.h = sstr.h;
						} else {
							p.v = "";
						}
						break;
					case "b":
						p.v = parsexmlbool(p.v);
						break;
					case "d":
						if (opts.cellDates) p.v = parseDate(p.v, 1);
						else {
							p.v = datenum(parseDate(p.v, 1));
							p.t = "n";
						}
						break;
					/* error string in .w, number in .v */
					case "e":
						if (!opts || opts.cellText !== false) p.w = p.v;
						p.v = RBErr[p.v];
						break;
				}
				/* formatting */
				fmtid = fillid = 0;
				cf = null;

				if (do_format && tag.s !== undefined) {
					cf = styles.CellXf[tag.s];
					if (cf != null) {
						if (cf.numFmtId != null) fmtid = cf.numFmtId;
						if (opts.cellStyles) {
							if (cf.fillId != null) fillid = cf.fillId;
						}
					}
				}
				// hbi addendum
				p.styleIndex = +tag.s;
				safe_format(p, fmtid, fillid, opts, themes, styles);

				if (opts.cellDates && do_format && p.t == "n" && SSF.is_date(SSF._table[fmtid])) {
					p.t = "d";
					p.v = numdate(p.v);
				}

				if (dense) {
					var _r = decode_cell(tag.r);
					if (!s[_r.r]) s[_r.r] = [];
					s[_r.r][_r.c] = p;
				} else {
					s[tag.r] = p;
				}
			}
		}
		if (rows.length > 0) s["!rows"] = rows;
	};
})();

function write_ws_xml_data(ws, opts, idx, wb) {
	var o = [],
		r = [],
		range = safe_decode_range(ws["!ref"]),
		cell = "",
		ref,
		rr = "",
		cols = [],
		R = 0,
		C = 0,
		rows = ws["!rows"],
		dense = Array.isArray(ws),
		params = { r: rr },
		row,
		height = -1;

	wb.fonts = [];
	wb.fills = [];
	wb.borders = [];

	for (C = range.s.c; C <= range.e.c; ++C) {
		cols[C] = encode_col(C);
	}
	for (R = range.s.r; R <= range.e.r; ++R) {
		r = [];
		rr = encode_row(R);
		for (C = range.s.c; C <= range.e.c; ++C) {
			ref = cols[C] + rr;
			var _cell = dense ? (ws[R] || [])[C]: ws[ref];
			if (_cell === undefined) continue;

			get_cell_styles(wb, ref);

			if ((cell = write_ws_xml_cell(_cell, ref, ws, opts, idx, wb)) != null) {
				_cell.is = cell;
				r.push(cell);
			}
		}
		if (r.length > 0 || (rows && rows[R])) {
			params = { r: rr };
			if (rows && rows[R]) {
				row = rows[R];

				if (row.hidden) params.hidden = 1;
				height = -1;

				if (row.hpx) height = px2pt(row.hpx);
				else if (row.hpt) height = row.hpt;

				if (height > -1) {
					params.ht = height;
					params.customHeight = 1;
				}
				if (row.level) {
					params.outlineLevel = row.level;
				}
			}
			o[o.length] = writextag("row", r.join(""), params);
		}
	}
	if (rows) {
		for(; R < rows.length; ++R) {
			if (rows && rows[R]) {
				params = { r: R+1 };
				row = rows[R];

				if (row.hidden) params.hidden = 1;
				height = -1;

				if (row.hpx) height = px2pt(row.hpx);
				else if (row.hpt) height = row.hpt;

				if (height > -1) {
					params.ht = height;
					params.customHeight = 1;
				}
				if (row.level) {
					params.outlineLevel = row.level;
				}
				o[o.length] = writextag("row", "", params);
			}
		}
	}
	return o.join("");
}

function write_ws_xml(idx, opts, wb, rels) {
	var o = [XML_HEADER, WS_XML_ROOT],
		s = wb.SheetNames[idx],
		sidx = 0,
		rdata = "",
		ws = wb.Sheets[s] || {},
		ref = ws["!ref"] || "A1",
		range = safe_decode_range(ref),
		_drawing = [];
	
	if (range.e.c > 0x3FFF || range.e.r > 0xFFFFF) {
		if (opts.WTF) {
			throw new Error(`Range ${ref} exceeds format limit A1:XFD1048576`);
		}
		range.e.c = Math.min(range.e.c, 0x3FFF);
		range.e.r = Math.min(range.e.c, 0xFFFFF);
		ref = encode_range(range);
	}

	if (!rels) rels = {};
	ws["!comments"] = [];

	write_ws_xml_sheetpr(ws, wb, idx, opts, o);
	o[o.length] = writextag("dimension", null, { ref });
	o[o.length] = write_ws_xml_sheetviews(ws, opts, idx, wb);

	/* TODO: store in WB, process styles */
	if (opts.sheetFormat) {
		o[o.length] = writextag("sheetFormatPr", null, {
			defaultRowHeight: opts.sheetFormat.defaultRowHeight || "16",
			baseColWidth: opts.sheetFormat.baseColWidth || "10",
			outlineLevelRow: opts.sheetFormat.outlineLevelRow || "7"
		});
	}

	if (ws["!cols"] != null && ws["!cols"].length > 0) {
		o[o.length] = write_ws_xml_cols(ws, ws["!cols"]);
	}

	o[sidx = o.length] = "<sheetData/>";
	ws["!links"] = [];

	if (ws["!ref"] != null) {
		rdata = write_ws_xml_data(ws, opts, idx, wb, rels);
		if (rdata.length > 0) o[o.length] = rdata;
	}

	if (o.length > sidx + 1) {
		o[o.length] = "</sheetData>";
		o[sidx] = o[sidx].replace("/>", ">");
	}

	/* sheetCalcPr */

	if (ws["!protect"] != null) {
		o[o.length] = write_ws_xml_protection(ws["!protect"]);
	}

	/* protectedRanges */
	/* scenarios */

	if (ws["!autofilter"] != null) {
		o[o.length] = write_ws_xml_autofilter(ws["!autofilter"], ws, wb, idx);
	}

	/* sortState */
	/* dataConsolidate */
	/* customSheetViews */

	if (ws["!merges"] != null && ws["!merges"].length > 0) {
		o[o.length] = write_ws_xml_merges(ws["!merges"]);
	}

	/* phoneticPr */
	/* conditionalFormatting */
	/* dataValidations */

	var relc = -1,
		rel,
		rId = -1;
	if (ws["!links"].length > 0) {
		o[o.length] = "<hyperlinks>";
		ws["!links"].forEach(function(l) {
			if (!l[1].Target) return;

			rel = { "ref": l[0] };
			
			if (l[1].Target.charAt(0) != "#") {
				rId = add_rels(rels, -1, escapexml(l[1].Target).replace(/#.*$/, ""), RELS.HLINK);
				rel["r:id"] = "rId"+ rId;
			}
			if ((relc = l[1].Target.indexOf("#")) > -1) {
				rel.location = escapexml(l[1].Target.slice(relc + 1));
			}
			if (l[1].Tooltip) {
				rel.tooltip = escapexml(l[1].Tooltip);
			}
			o[o.length] = writextag("hyperlink", null, rel);
		});
		o[o.length] = "</hyperlinks>";
	}
	delete ws["!links"];

	/* printOptions */

	if (ws["!margins"] != null) {
		o[o.length] = write_ws_xml_margins(ws["!margins"]);
	}

	/* pageSetup */
	/* headerFooter */
	/* rowBreaks */
	/* colBreaks */
	/* customProperties */
	/* cellWatches */

	if (!opts || opts.ignoreEC || (opts.ignoreEC == (void 0))) {
		o[o.length] = writetag("ignoredErrors", writextag("ignoredError", null, { numberStoredAsText: 1, sqref: ref }));
	}

	/* smartTags */

	if (_drawing.length > 0) {
		rId = add_rels(rels, -1, "../drawings/drawing"+ (idx + 1) +".xml", RELS.DRAW);
		o[o.length] = writextag("drawing", null, { "r:id": "rId"+ rId });
		ws["!drawing"] = _drawing;
	}

	if (ws["!comments"].length > 0) {
		rId = add_rels(rels, -1, "../drawings/vmlDrawing"+ (idx + 1) +".vml", RELS.VML);
		o[o.length] = writextag("legacyDrawing", null, {"r:id":"rId"+ rId});
		ws["!legacy"] = rId;
	}

	/* legacyDrawingHF */
	/* picture */
	/* oleObjects */
	/* controls */
	/* webPublishItems */
	/* tableParts */
	/* extLst */

	if (o.length > 1) {
		o[o.length] = ("</worksheet>");
		o[1] = o[1].replace("/>", ">");
	}
	return o.join("");
}

	
/* 18.2.28 (CT_WorkbookProtection) Defaults */
var WBPropsDef = [
		["allowRefreshQuery",           false, "bool"],
		["autoCompressPictures",        true,  "bool"],
		["backupFile",                  false, "bool"],
		["checkCompatibility",          false, "bool"],
		["CodeName",                    ""],
		["date1904",                    false, "bool"],
		["defaultThemeVersion",         0,      "int"],
		["filterPrivacy",               false, "bool"],
		["hidePivotFieldList",          false, "bool"],
		["promptedSolutions",           false, "bool"],
		["publishItems",                false, "bool"],
		["refreshAllConnections",       false, "bool"],
		["saveExternalLinkValues",      true,  "bool"],
		["showBorderUnselectedTables",  true,  "bool"],
		["showInkAnnotation",           true,  "bool"],
		["showObjects",                 "all"],
		["showPivotChartFilter",        false, "bool"],
		["updateLinks", "userSet"]
	],
	/* 18.2.30 (CT_BookView) Defaults */
	WBViewDef = [
		["activeTab",                   0,      "int"],
		["autoFilterDateGrouping",      true,  "bool"],
		["firstSheet",                  0,      "int"],
		["minimized",                   false, "bool"],
		["showHorizontalScroll",        true,  "bool"],
		["showSheetTabs",               true,  "bool"],
		["showVerticalScroll",          true,  "bool"],
		["tabRatio",                    600,    "int"],
		["visibility",                  "visible"]
		//window{Height,Width}, {x,y}Window
	],
	/* 18.2.19 (CT_Sheet) Defaults */
	SheetDef = [
		//["state", "visible"]
	],
	/* 18.2.2  (CT_CalcPr) Defaults */
	CalcPrDef = [
		["calcCompleted",  "true"  ],
		["calcMode",       "auto"  ],
		["calcOnSave",     "true"  ],
		["concurrentCalc", "true"  ],
		["fullCalcOnLoad", "false" ],
		["fullPrecision",  "true"  ],
		["iterate",        "false" ],
		["iterateCount",   "100"   ],
		["iterateDelta",   "0.001" ],
		["refMode",        "A1"    ]
	],
	badchars = "][*?\/\\".split("");

	/* 18.2.3 (CT_CustomWorkbookView) Defaults */
	/*var CustomWBViewDef = [
		["autoUpdate",           "false"         ],
		["changesSavedWin",      "false"         ],
		["includeHiddenRowCol",  "true"          ],
		["includePrintSettings", "true"          ],
		["maximized",            "false"         ],
		["minimized",            "false"         ],
		["onlySync",             "false"         ],
		["personalView",         "false"         ],
		["showComments",         "commIndicator" ],
		["showFormulaBar",       "true"          ],
		["showHorizontalScroll", "true"          ],
		["showObjects",          "all"           ],
		["showSheetTabs",        "true"          ],
		["showStatusbar",        "true"          ],
		["showVerticalScroll",   "true"          ],
		["tabRatio",             "600"           ],
		["xWindow",              "0"             ],
		["yWindow",              "0"             ]
	];*/

function push_defaults_array(target, defaults) {
	for (var j=0; j!=target.length; ++j) {
		var w = target[j];
		for (var i=0; i != defaults.length; ++i) {
			var z = defaults[i];
			if (w[z[0]] == null) w[z[0]] = z[1];
			else {
				switch(z[2]) {
					case "bool":
						if (typeof w[z[0]] == "string") w[z[0]] = parsexmlbool(w[z[0]]);
						break;
					case "int":
						if (typeof w[z[0]] == "string") w[z[0]] = parseInt(w[z[0]], 10);
						break;
				}
			}
		}
	}
}

function push_defaults(target, defaults) {
	for (var i=0; i!=defaults.length; ++i) {
		var z = defaults[i];
		if (target[z[0]] == null) target[z[0]] = z[1];
		else {
			switch(z[2]) {
				case "bool":
					if (typeof target[z[0]] == "string") target[z[0]] = parsexmlbool(target[z[0]]);
					break;
				case "int":
					if (typeof target[z[0]] == "string") target[z[0]] = parseInt(target[z[0]], 10);
					break;
			}
		}
	}
}

function parse_wb_defaults(wb) {
	push_defaults(wb.WBProps, WBPropsDef);
	push_defaults(wb.CalcPr, CalcPrDef);
	push_defaults_array(wb.WBView, WBViewDef);
	push_defaults_array(wb.Sheets, SheetDef);
	_ssfopts.date1904 = parsexmlbool(wb.WBProps.date1904);
}

function safe1904(wb) {
	/* TODO: store date1904 somewhere else */
	if (!wb.Workbook) return "false";
	if (!wb.Workbook.WBProps) return "false";
	return parsexmlbool(wb.Workbook.WBProps.date1904) ? "true" : "false";
}

function check_ws_name(n, safe) {
	if (n.length > 31) {
		if (safe) return false;
		throw new Error("Sheet names cannot exceed 31 chars");
	}
	var _good = true;
	badchars.forEach(function(c) {
		if (n.indexOf(c) == -1) return;
		if (!safe) throw new Error("Sheet name cannot contain : \\ / ? * [ ]");
		_good = false;
	});
	return _good;
}

function check_wb_names(N, S, codes) {
	N.forEach(function(n,i) {
		check_ws_name(n);
		for (var j=0; j<i; ++j) {
			if (n == N[j]) {
				throw new Error(`Duplicate Sheet Name: ${n}`);
			}
		}
		if (codes) {
			var cn = (S && S[i] && S[i].CodeName) || n;
			if (cn.charCodeAt(0) == 95 && cn.length > 22) {
				throw new Error(`Bad Code Name: Worksheet ${cn}`);
			}
		}
	});
}

function check_wb(wb) {
	if (!wb || !wb.SheetNames || !wb.Sheets) {
		throw new Error("Invalid Workbook");
	}
	if (!wb.SheetNames.length) {
		throw new Error("Workbook is empty");
	}
	var Sheets = (wb.Workbook && wb.Workbook.Sheets) || [];
	check_wb_names(wb.SheetNames, Sheets, !!wb.vbaraw);
	for (var i=0; i<wb.SheetNames.length; ++i) {
		check_ws(wb.Sheets[wb.SheetNames[i]], wb.SheetNames[i], i);
	}
	/* TODO: validate workbook */
}

	
/* 18.2 Workbook */
var wbnsregex = /<\w+:workbook/,
	WB_XML_ROOT = writextag("workbook", null, {
		"xmlns": XMLNS.main[0],
		"xmlns:r": XMLNS.r
	});

function parse_wb_xml(data, opts) {
	if (!data) {
		throw new Error("Could not find file");
	}
	var wb = {
			AppVersion: {},
			WBProps: {},
			WBView: [],
			Sheets: [],
			CalcPr: {},
			Names: [],
			xmlns: ""
		},
		pass = false,
		xmlns = "xmlns",
		dname = {},
		dnstart = 0;

	data.replace(tagregex, function xml_wb(x, idx) {
		var y = parsexmltag(x);
		switch(strip_ns(y[0])) {
			case "<?xml": break;

			/* 18.2.27 workbook CT_Workbook 1 */
			case "<workbook":
				if (x.match(wbnsregex)) xmlns = "xmlns" + x.match(/<(\w+):/)[1];
				wb.xmlns = y[xmlns];
				break;
			case "</workbook>": break;

			/* 18.2.13 fileVersion CT_FileVersion ? */
			case "<fileVersion": delete y[0]; wb.AppVersion = y; break;
			case "<fileVersion/>":
			case "</fileVersion>": break;

			/* 18.2.12 fileSharing CT_FileSharing ? */
			case "<fileSharing":
				break;
			case "<fileSharing/>": break;

			/* 18.2.28 workbookPr CT_WorkbookPr ? */
			case "<workbookPr":
			case "<workbookPr/>":
				WBPropsDef.forEach(function(w) {
					if (y[w[0]] == null) return;
					switch(w[2]) {
						case "bool": wb.WBProps[w[0]] = parsexmlbool(y[w[0]]); break;
						case "int": wb.WBProps[w[0]] = parseInt(y[w[0]], 10); break;
						default: wb.WBProps[w[0]] = y[w[0]];
					}
				});
				if (y.codeName) wb.WBProps.CodeName = utf8read(y.codeName);
				break;
			case "</workbookPr>": break;

			/* 18.2.29 workbookProtection CT_WorkbookProtection ? */
			case "<workbookProtection":
				break;
			case "<workbookProtection/>": break;

			/* 18.2.1  bookViews CT_BookViews ? */
			case "<bookViews":
			case "<bookViews>":
			case "</bookViews>": break;
			/* 18.2.30   workbookView CT_BookView + */
			case "<workbookView":
			case "<workbookView/>": delete y[0]; wb.WBView.push(y); break;
			case "</workbookView>": break;

			/* 18.2.20 sheets CT_Sheets 1 */
			case "<sheets":
			case "<sheets>":
			case "</sheets>": break; // aggregate sheet
			/* 18.2.19   sheet CT_Sheet + */
			case "<sheet":
				switch(y.state) {
					case "hidden": y.Hidden = 1; break;
					case "veryHidden": y.Hidden = 2; break;
					default: y.Hidden = 0;
				}
				delete y.state;
				y.name = unescapexml(utf8read(y.name));
				delete y[0]; wb.Sheets.push(y); break;
			case "</sheet>": break;

			/* 18.2.15 functionGroups CT_FunctionGroups ? */
			case "<functionGroups":
			case "<functionGroups/>": break;
			/* 18.2.14   functionGroup CT_FunctionGroup + */
			case "<functionGroup": break;

			/* 18.2.9  externalReferences CT_ExternalReferences ? */
			case "<externalReferences":
			case "</externalReferences>":
			case "<externalReferences>": break;
			/* 18.2.8    externalReference CT_ExternalReference + */
			case "<externalReference": break;

			/* 18.2.6  definedNames CT_DefinedNames ? */
			case "<definedNames/>": break;
			case "<definedNames>":
			case "<definedNames": pass=true; break;
			case "</definedNames>": pass=false; break;
			/* 18.2.5    definedName CT_DefinedName + */
			case "<definedName": {
				dname = {};
				dname.Name = utf8read(y.name);
				if (y.comment) dname.Comment = y.comment;
				if (y.localSheetId) dname.Sheet = +y.localSheetId;
				if (parsexmlbool(y.hidden||"0")) dname.Hidden = true;
				dnstart = idx + x.length;
			}	break;
			case "</definedName>": {
				dname.Ref = unescapexml(utf8read(data.slice(dnstart, idx)));
				wb.Names.push(dname);
			} break;
			case "<definedName/>": break;

			/* 18.2.2  calcPr CT_CalcPr ? */
			case "<calcPr": delete y[0]; wb.CalcPr = y; break;
			case "<calcPr/>": delete y[0]; wb.CalcPr = y; break;
			case "</calcPr>": break;

			/* 18.2.16 oleSize CT_OleSize ? (ref required) */
			case "<oleSize": break;

			/* 18.2.4  customWorkbookViews CT_CustomWorkbookViews ? */
			case "<customWorkbookViews>":
			case "</customWorkbookViews>":
			case "<customWorkbookViews": break;
			/* 18.2.3  customWorkbookView CT_CustomWorkbookView + */
			case "<customWorkbookView":
			case "</customWorkbookView>": break;

			/* 18.2.18 pivotCaches CT_PivotCaches ? */
			case "<pivotCaches>":
			case "</pivotCaches>":
			case "<pivotCaches": break;
			/* 18.2.17 pivotCache CT_PivotCache ? */
			case "<pivotCache": break;

			/* 18.2.21 smartTagPr CT_SmartTagPr ? */
			case "<smartTagPr":
			case "<smartTagPr/>": break;

			/* 18.2.23 smartTagTypes CT_SmartTagTypes ? */
			case "<smartTagTypes":
			case "<smartTagTypes>":
			case "</smartTagTypes>": break;
			/* 18.2.22 smartTagType CT_SmartTagType ? */
			case "<smartTagType": break;

			/* 18.2.24 webPublishing CT_WebPublishing ? */
			case "<webPublishing":
			case "<webPublishing/>": break;

			/* 18.2.11 fileRecoveryPr CT_FileRecoveryPr ? */
			case "<fileRecoveryPr":
			case "<fileRecoveryPr/>": break;

			/* 18.2.26 webPublishObjects CT_WebPublishObjects ? */
			case "<webPublishObjects>":
			case "<webPublishObjects":
			case "</webPublishObjects>": break;
			/* 18.2.25 webPublishObject CT_WebPublishObject ? */
			case "<webPublishObject": break;

			/* 18.2.10 extLst CT_ExtensionList ? */
			case "<extLst":
			case "<extLst>":
			case "</extLst>":
			case "<extLst/>": break;
			/* 18.2.7  ext CT_Extension + */
			case "<ext": pass=true; break; //TODO: check with versions of excel
			case "</ext>": pass=false; break;

			/* Others */
			case "<ArchID": break;
			case "<AlternateContent":
			case "<AlternateContent>": pass=true; break;
			case "</AlternateContent>": pass=false; break;

			/* TODO */
			case "<revisionPtr": break;

			default:
				if (!pass && opts.WTF) {
					throw new Error(`unrecognized ${y[0]} in workbook`);
				}
		}
		return x;
	});

	if (XMLNS.main.indexOf(wb.xmlns) === -1) {
		throw new Error(`Unknown Namespace: ${wb.xmlns}`);
	}

	parse_wb_defaults(wb);

	return wb;
}

function write_wb_xml(wb) {
	var o = [XML_HEADER];
	o[o.length] = WB_XML_ROOT;

	var write_names = (wb.Workbook && (wb.Workbook.Names || []).length > 0);

	/* fileVersion */
	/* fileSharing */

	var workbookPr = {};
	if (wb.Workbook && wb.Workbook.WBProps) {
		WBPropsDef.forEach(function(x) {
			if ((wb.Workbook.WBProps[x[0]]) == null) return;
			if ((wb.Workbook.WBProps[x[0]]) == x[1]) return;
			workbookPr[x[0]] = (wb.Workbook.WBProps[x[0]]);
		});
		if (wb.Workbook.WBProps.CodeName) {
			workbookPr.codeName = wb.Workbook.WBProps.CodeName;
			delete workbookPr.CodeName;
		}
	}
	o[o.length] = writextag("workbookPr", null, workbookPr);

	/* workbookProtection */

	var sheets = wb.Workbook && wb.Workbook.Sheets || [],
		i = 0;

	/* bookViews only written if first worksheet is hidden */
	if (sheets && sheets[0] && !!sheets[0].Hidden) {
		o[o.length] = "<bookViews>";
		for(i = 0; i != wb.SheetNames.length; ++i) {
			if (!sheets[i]) break;
			if (!sheets[i].Hidden) break;
		}
		if (i == wb.SheetNames.length) i = 0;
		o[o.length] = `<workbookView firstSheet="${i}" activeTab="${i}"/>`;
		o[o.length] = "</bookViews>";
	}
	o[o.length] = "<sheets>";

	for(i=0; i!=wb.SheetNames.length; ++i) {
		var sht = {name: escapexml(wb.SheetNames[i].slice(0, 31)) };
		sht.sheetId = ""+ (i + 1);
		sht["r:id"] = "rId"+ (i + 1);
		
		if (sheets[i]) {
			switch(sheets[i].Hidden) {
				case 1: sht.state = "hidden"; break;
				case 2: sht.state = "veryHidden"; break;
			}
		}
		o[o.length] = writextag("sheet", null, sht);
	}
	o[o.length] = "</sheets>";

	/* functionGroups */
	/* externalReferences */

	if (write_names) {
		o[o.length] = "<definedNames>";
		if (wb.Workbook && wb.Workbook.Names) {
			wb.Workbook.Names.forEach(function(n) {
				var d = {name:n.Name};
				if (n.Comment) d.comment = n.Comment;
				if (n.Sheet != null) d.localSheetId = ""+ n.Sheet;
				if (n.Hidden) d.hidden = "1";
				if (!n.Ref) return;
				o[o.length] = writextag("definedName", escapexml(n.Ref), d);
			});
		}
		o[o.length] = "</definedNames>";
	}

	/* calcPr */
	/* oleSize */
	/* customWorkbookViews */
	/* pivotCaches */
	/* smartTagPr */
	/* smartTagTypes */
	/* webPublishing */
	/* fileRecoveryPr */
	/* webPublishObjects */
	/* extLst */

	if (o.length>2) {
		o[o.length] = "</workbook>";
		o[1] = o[1].replace("/>", ">");
	}
	
	return o.join("");
}

	
var HTML_ = (function() {

	function html_to_sheet(str, _opts) {
		var opts = _opts || {};
		
		if (DENSE != null && opts.dense == null) opts.dense = DENSE;
		
		var ws = opts.dense ? [] : {};
		str = str.replace(/<!--.*?-->/g, "");
		var mtch = str.match(/<table/i);
		
		if (!mtch) {
			throw new Error("Invalid HTML: could not find <table>");
		}
		
		var mtch2 = str.match(/<\/table/i),
			i = mtch.index,
			il,
			j = mtch2 && mtch2.index || str.length,
			jl,
			rows = split_regex(str.slice(i, j), /(:?<tr[^>]*>)/i, "<tr>"),
			R = -1,
			C = 0,
			RS = 0,
			CS = 0,
			range = {
				s: { r: 10000000, c: 10000000 },
				e: { r: 0, c: 0 }
			},
			merges = [];
		for (i=0, il=rows.length; i<il; ++i) {
			var row = rows[i].trim(),
				hd = row.slice(0,3).toLowerCase();
			if (hd == "<tr") {
				++R;
				if (opts.sheetRows && opts.sheetRows <= R) {
					--R;
					break;
				}
				C = 0;
				continue;
			}
			if (hd != "<td" && hd != "<th") continue;

			var cells = row.split(/<\/t[dh]>/i);
			for (j=0, jl=cells.length; j<jl; ++j) {
				var cell = cells[j].trim();
				if (!cell.match(/<t[dh]/i)) continue;
				var m = cell,
					cc = 0;
				/* TODO: parse styles etc */
				while(m.charAt(0) == "<" && (cc = m.indexOf(">")) > -1) {
					m = m.slice(cc + 1);
				}
				for (var midx=0; midx<merges.length; ++midx) {
					var _merge = merges[midx];
					if (_merge.s.c == C && _merge.s.r < R && R <= _merge.e.r) {
						C = _merge.e.c + 1;
						midx = -1;
					}
				}
				var tag = parsexmltag(cell.slice(0, cell.indexOf(">")));
				CS = tag.colspan ? +tag.colspan : 1;
				if ((RS = +tag.rowspan) > 1 || CS > 1) {
					merges.push({
						s: { r: R, c: C},
						e: { r: R + (RS || 1) - 1, c: C + CS - 1}
					});
				}
				var _t = tag.t || "";
				/* TODO: generate stub cells */
				if (!m.length) {
					C += CS;
					continue;
				}
				m = htmldecode(m);
				if (range.s.r > R) range.s.r = R;
				if (range.e.r < R) range.e.r = R;
				if (range.s.c > C) range.s.c = C;
				if (range.e.c < C) range.e.c = C;
				if (!m.length) continue;
				
				var o = { t: "s", v: m };

				if (opts.raw || !m.trim().length || _t == "s") { }

				else if (m === "TRUE") o = { t: "b", v: true };
				else if (m === "FALSE") o = { t: "b", v: false };
				else if (!isNaN(fuzzynum(m))) o = { t: "n", v: fuzzynum(m) };
				else if (!isNaN(fuzzydate(m).getDate())) {
					o = { t: "d", v: parseDate(m) };
					if (!opts.cellDates) o = { t: "n", v: datenum(o.v) };
					o.z = opts.dateNF || SSF._table[14];
				}
				if (opts.dense) {
					if (!ws[R]) ws[R] = [];
					ws[R][C] = o;
				} else {
					ws[encode_cell({ r: R, c: C })] = o;
				}
				C += CS;
			}
		}
		ws["!ref"] = encode_range(range);
		if (merges.length) ws["!merges"] = merges;

		return ws;
	}

	function html_to_book(str, opts) {
		return sheet_to_workbook(html_to_sheet(str, opts), opts);
	}

	function make_xml_row(sheet, ref, row, css) {
		let merges = sheet["!merges"] || [],
			out = [];
		for (var C=ref.s.c, Cl=ref.e.c; C<=Cl; ++C) {
			var RS = 0,
				CS = 0;
			for (var j=0; j<merges.length; ++j) {
				if (merges[j].s.r > row || merges[j].s.c > C) continue;
				if (merges[j].e.r < row || merges[j].e.c < C) continue;
				if (merges[j].s.r < row || merges[j].s.c < C) { RS = -1; break; }
				RS = merges[j].e.r - merges[j].s.r + 1; CS = merges[j].e.c - merges[j].s.c + 1; break;
			}
			if (RS < 0) continue;
			var coord = encode_cell({ r: row, c: C }),
				cell = sheet[coord],
				w = (cell && cell.v != null) && (cell.h || escapehtml(cell.w || (format_cell(cell), cell.w) || "")) || "",
				sp = { ...css[coord] };

			if (RS > 1) sp.rs = RS; // rowspan
			if (CS > 1) sp.cs = CS; // colspan
			sp.t = cell && cell.t || "z";
			if (cell && cell.f) sp.f = cell.f;
			if (sp.style) {
				if (sp.style.length) sp.style = sp.style.join(";");
				else delete sp.style;
			}
			sp.id = coord;
			// hex color fix
			w = w.replace(/#FF(.{6});/g, "#$1;");
			// cell xml string
			out.push(writexNode("C", w, sp));
		}
		return `<R tp="2">${out.join("")}</R>`;
	}

	function parse_table_css(sheet, book) {
		let out = {},
			coord = [];
		// translate keys to two dimensional array
		Object.keys(sheet)
			.filter(k => !k.startsWith("!"))
			.map(key => {
				let [n, c, r] = key.match(/(\D+)(\d+)/);
				if (!coord[r-1]) coord[r-1] = [];
				coord[r-1].push(key);
			});
		// iterate keys
		for (let key in sheet) {
			let item = sheet[key];
			switch (key) {
				case "!ref": break;
				case "!rows":
					item.map((row, i) => {
						if (!out[coord[i][0]]) out[coord[i][0]] = {};
						if (!out[coord[i][0]].style) out[coord[i][0]].style = [];
						out[coord[i][0]].style.push(`height: ${Math.max(25, row.hpt * (96/72))}px`);
					});
					break;
				case "!cols":
					item.map((col, i) => {
						if (!out[coord[0][i]]) out[coord[0][i]] = {};
						if (!out[coord[0][i]].style) out[coord[0][i]].style = [];
						out[coord[0][i]].style.push(`width: ${width2px(col.width)}px`);
					});
					break;
				default:
					if (!item.styleIndex) continue;

					let cnames = [],
						styles = [],
						style = book.Styles.CellXf[item.styleIndex],
						fill = book.Styles.Fills[style.fillId],
						font = book.Styles.Fonts[style.fontId],
						numFmt = book.Styles.NumberFmt ? book.Styles.NumberFmt[style.numFmtId] : 0,
						border = book.Styles.Borders[style.borderId],
						noBorder = border.width.join("") + border.style.join("") + border.color.join(""),
						hasBorders = noBorder !== "0000solidsolidsolidsolid000000000000";

					if (font.bold) cnames.push("bold");
					if (font.italic) cnames.push("italic");
					if (font.underline) cnames.push("underline");
					if (font.strike) cnames.push("strike");
					if (fill?.bgColor) styles.push(`background:#${fill.fgColor.rgb}`);
					if (font.color) styles.push(`color:#${font.color.rgb}`);
					if (font.name) styles.push(`font-family:${font.name},sans-serif`);
					if (font.sz) styles.push(`font-size:${(font.sz * (96/72) - 2)}px`);
					if (style.alignment) {
						if (["right", "center"].includes(style.alignment.horizontal)) cnames.push(style.alignment.horizontal);
						if (["top", "bottom"].includes(style.alignment.vertical)) cnames.push(style.alignment.vertical);
						if (!style.alignment.vertical) cnames.push("bottom");
					}
					if (["superscript", "subscript"].includes(font.vertAlign)) cnames.push(font.vertAlign);

					if (cnames.length) {
						if (!out[key]) out[key] = {};
						out[key].cn = cnames.join(" ");
					}
					if (styles.length) {
						if (!out[key]) out[key] = {};
						out[key].style = styles;
					}
			}
		}
		return out;
	}

	function book_to_xml(book) {
		let out = [];
		for (let key in book.Sheets) {
			let sheet = book.Sheets[key],
				ref = decode_range(sheet["!ref"]),
				css = parse_table_css(sheet, book);
			// translate into xml
			out.push(`<Sheet name="${key}">`);
			out.push(`<Table>`);
			for (var row=ref.s.r, rowLen=ref.e.r; row<=rowLen; ++row) {
				out.push(make_xml_row(sheet, ref, row, css));
			}
			out.push(`</Table>`);
			out.push(`</Sheet>`);
		}
		let str = `<Workbook>${out.join("")}</Workbook>`;
		return $.xmlFromString(str).documentElement;
	}

	return {
		to_workbook: html_to_book,
		to_sheet: html_to_sheet,
		book_to_xml: book_to_xml,
	};

})();

function sheet_add_dom(ws, table, _opts) {
	var opts = _opts || {};
	if (DENSE != null) opts.dense = DENSE;
	
	var or_R = 0,
		or_C = 0;

	if (opts.origin != null) {
		if (typeof opts.origin == "number") or_R = opts.origin;
		else {
			var _origin = typeof opts.origin == "string" ? decode_cell(opts.origin) : opts.origin;
			or_R = _origin.r; or_C = _origin.c;
		}
	}
	
	var rows = table.getElementsByTagName("tr"),
		sheetRows = Math.min(opts.sheetRows || 10000000, rows.length),
		range = {
			s: { r: 0, c: 0 },
			e: { r: or_R, c: or_C }
		};
	
	if (ws["!ref"]) {
		var _range = decode_range(ws["!ref"]);
		range.s.r = Math.min(range.s.r, _range.s.r);
		range.s.c = Math.min(range.s.c, _range.s.c);
		range.e.r = Math.max(range.e.r, _range.e.r);
		range.e.c = Math.max(range.e.c, _range.e.c);
		if (or_R == -1) range.e.r = or_R = _range.e.r + 1;
	}

	if (!ws["!cols"]) {
		ws["!cols"] = [...rows[0].getElementsByTagName("td")].map(td => {
			let customwidth = 1,
				wpx = td.offsetWidth + 5,
				wch = px2char(wpx),
				width = char2width(wch);
			return { width, customwidth, wpx, wch, MDW };
		});
	}
	
	if (!ws["!rows"]) {
		ws["!rows"] = [...rows].map(tr => {
			let v = tr.offsetHeight * (72/96);
			return { hpt: v, hpx: v };
		});
	}

	var merges = [],
		midx = 0,
		rowinfo = ws["!rows"] || (ws["!rows"] = []),
		_R = 0,
		R = 0,
		_C = 0,
		C = 0,
		RS = 0,
		CS = 0;
	
	for (; _R<rows.length && R<sheetRows; ++_R) {
		var row = rows[_R];
		if (is_dom_element_hidden(row)) {
			if (opts.display) continue;
			rowinfo[R] = { hidden: true };
		}
		var elts = row.children;
		for (_C = C = 0; _C < elts.length; ++_C) {
			var elt = elts[_C];
			if (opts.display && is_dom_element_hidden(elt)) continue;
			
			var v = html2xml(elt),
				z = elt.getAttribute("z");
			
			for (midx=0; midx<merges.length; ++midx) {
				var m = merges[midx];
				if (m.s.c == C + or_C && m.s.r < R + or_R && R + or_R <= m.e.r) {
					C = m.e.c + 1 - or_C;
					midx = -1;
				}
			}
			
			CS = +elt.getAttribute("colspan") || 1;
			if ((RS = (+elt.getAttribute("rowspan") || 1)) > 1 || CS > 1) {
				merges.push({
					s: {
						r: R + or_R,
						c: C + or_C
					},
					e: {
						r: R + or_R + (RS || 1) - 1,
						c: C + or_C + (CS || 1) - 1
					}
				});
			}
			var o = { t: "s", v },
				_t = elt.getAttribute("t") || "";

			if (v != null) {
				if (v.length == 0) o.t = _t || "z";
				else if (opts.raw || v.trim().length == 0 || _t == "s") {}
				else if (v === "TRUE") o = { t: "b", v: true };
				else if (v === "FALSE") o = { t: "b", v: false };
				else if (!isNaN(fuzzynum(v))) o = { t: "n", v: fuzzynum(v) };
				else if (!isNaN(fuzzydate(v).getDate())) {
					o = { t: "d", v: parseDate(v) };
					if (!opts.cellDates) o = { t: "n", v: datenum(o.v) };
					o.z = opts.dateNF || SSF._table[14];
				}
			}
			
			if (o.z === undefined && z != null) o.z = z;
			
			if (opts.dense) {
				if (!ws[R + or_R]) ws[R + or_R] = [];
				ws[R + or_R][C + or_C] = o;
			} else {
				let cellId = encode_cell({ c: C + or_C, r: R + or_R });
				ws[cellId] = o;
			}
			if (range.e.c < C + or_C) range.e.c = C + or_C;
			C += CS;
		}
		++R;
	}
	if (merges.length) {
		ws["!merges"] = (ws["!merges"] || []).concat(merges);
	}
	range.e.r = Math.max(range.e.r, R - 1 + or_R);
	ws["!ref"] = encode_range(range);
	if (R >= sheetRows) {
		// We can count the real number of rows to parse but we don't to improve the performance
		ws["!fullref"] = encode_range((range.e.r = rows.length-_R+R-1 + or_R,range));
	}
	return ws;
}

function parse_dom_table(table, _opts) {
	var opts = _opts || {},
		ws = opts.dense ? [] : {};
	return sheet_add_dom(ws, table, _opts);
}

function table_to_book(table, opts) {
	return sheet_to_workbook(parse_dom_table(table, opts), opts);
}

function is_dom_element_hidden(element) {
	var display = "",
		get_computed_style = get_get_computed_style_function(element);
	if (get_computed_style) display = get_computed_style(element).getPropertyValue("display");
	if (!display) display = element.style.display; // Fallback for cases when getComputedStyle is not available (e.g. an old browser or some Node.js environments) or doesn't work (e.g. if the element is not inserted to a document)
	return display === "none";
}

/* global getComputedStyle */
function get_get_computed_style_function(element) {
	// The proper getComputedStyle implementation is the one defined in the element window
	if (element.ownerDocument.defaultView && typeof element.ownerDocument.defaultView.getComputedStyle === "function") return element.ownerDocument.defaultView.getComputedStyle;
	// If it is not available, try to get one from the global namespace
	if (typeof getComputedStyle === "function") return getComputedStyle;
	return null;
}

	
var fix_read_opts = function(opts) {
		fix_opts_func([
			["cellNF", false],     /* emit cell number format string as .z */
			["cellHTML", true],    /* emit html string as .h */
			["cellFormula", true], /* emit formulae as .f */
			["cellStyles", false], /* emits style/theme as .s */
			["cellText", true],    /* emit formatted text as .w */
			["cellDates", false],  /* emit date cells with type `d` */

			["sheetStubs", false], /* emit empty cells */
			["sheetRows", 0, "n"], /* read n rows (0 = read all rows) */

			["bookDeps", false],   /* parse calculation chains */
			["bookSheets", false], /* only try to get sheet names (no Sheets) */
			["bookProps", false],  /* only try to get properties (no Sheets) */
			["bookFiles", false],  /* include raw file structure (keys, files, cfb) */
			["bookVBA", false],    /* include vba raw data (vbaraw) */

			["password", ""],       /* password */
			["WTF", false]          /* WTF mode (throws errors) */
		])(opts);
	};

var fix_write_opts = fix_opts_func([
		["cellDates", false],   /* write date cells with type `d` */
		["bookSST", true],      /* Generate Shared String Table */
		["bookType", "xlsx"],   /* Type of workbook (xlsx/m/b) */
		["compression", false], /* Use file compression */
		["WTF", false]          /* WTF mode (throws errors) */
	]);

function fix_opts_func(defaults) {
	return function(opts) {
		for(var i=0; i!=defaults.length; ++i) {
			var d = defaults[i];
			if(opts[d[0]] === undefined) opts[d[0]] = d[1];
			if(d[2] === "n") opts[d[0]] = Number(opts[d[0]]);
		}
	};
}
	
function get_sheet_type(n) {
	if (RELS.WS.indexOf(n) > -1) return "sheet";
	if (RELS.CS && n == RELS.CS) return "chart";
	if (RELS.DS && n == RELS.DS) return "dialog";
	if (RELS.MS && n == RELS.MS) return "macro";
	return (n && n.length) ? n : "sheet";
}

function safe_parse_wbrels(wbrels, sheets) {
	if (!wbrels) return 0;
	try {
		wbrels = sheets.map(function pwbr(w) {
			if (!w.id) w.id = w.strRelID;
			return [w.name, wbrels["!id"][w.id].Target, get_sheet_type(wbrels["!id"][w.id].Type)];
		});
	} catch(e) {
		return null;
	}
	return !wbrels || wbrels.length === 0 ? null : wbrels;
}

// let hbi_zip;

function safe_parse_sheet(zip, path, relsPath, sheet, idx, sheetRels, sheets, stype, opts, wb, themes, styles) {
	// hbi_zip = zip;
	try {
		sheetRels[sheet] = parse_rels(getzipstr(zip, relsPath, true), path);
		var data = getzipdata(zip, path),
			_ws;
		switch (stype) {
			case "sheet":
				_ws = parse_ws_xml(data, opts, idx, sheetRels[sheet], wb, themes, styles);
				break;
			case "chart":
				_ws = parse_cs_xml(data, opts, idx, sheetRels[sheet], wb, themes, styles);
				if (!_ws || !_ws["!drawel"]) break;
				var dfile = resolve_path(_ws["!drawel"].Target, path),
					drelsp = get_rels_path(dfile),
					draw = parse_drawing(getzipstr(zip, dfile, true), parse_rels(getzipstr(zip, drelsp, true), dfile)),
					chartp = resolve_path(draw, dfile),
					crelsp = get_rels_path(chartp);
				_ws = parse_chart(getzipstr(zip, chartp, true), chartp, opts, parse_rels(getzipstr(zip, crelsp, true), chartp), wb, _ws);
				break;
			case "macro":
				_ws = parse_ms_xml(data, opts, idx, sheetRels[sheet], wb, themes, styles);
				break;
			case "dialog":
				_ws = parse_ds_xml(data, opts, idx, sheetRels[sheet], wb, themes, styles);
				break;
			default:
				throw new Error(`Unrecognized sheet type ${stype}`);
		}
		sheets[sheet] = _ws;

		/* scan rels for comments */
		var comments = [];
		if (sheetRels && sheetRels[sheet]) {
			keys(sheetRels[sheet]).forEach(n => {
				if (sheetRels[sheet][n].Type == RELS.CMNT) {
					var dfile = resolve_path(sheetRels[sheet][n].Target, path);
					comments = parse_comments_xml(getzipdata(zip, dfile, true), opts);
					if (!comments || !comments.length) return;
					sheet_insert_comments(_ws, comments);
				}
			});
		}
	} catch(e) {
		if (opts.WTF) throw e;
	}
}

function strip_front_slash(x) {
	return x.charAt(0) == "/" ? x.slice(1) : x;
}

function parse_zip(zip, opts) {
	make_ssf(SSF);
	opts = opts || {};
	fix_read_opts(opts);

	/* OpenDocument Part 3 Section 2.2.1 OpenDocument Package */
	if (safegetzipfile(zip, "META-INF/manifest.xml")) return parse_ods(zip, opts);
	/* UOC */
	if (safegetzipfile(zip, "objectdata.xml")) return parse_ods(zip, opts);
	/* Numbers */
	if (safegetzipfile(zip, "Index/Document.iwa")) throw new Error("Unsupported NUMBERS file");

	var entries = zipentries(zip),
		dir = parse_ct((getzipstr(zip, "[Content_Types].xml"))),
		xlsb = false,
		sheets,
		binname;
	
	if (dir.workbooks.length === 0) {
		binname = "xl/workbook.xml";
		if (getzipdata(zip,binname, true)) dir.workbooks.push(binname);
	}
	if (dir.workbooks.length === 0) {
		binname = "xl/workbook.bin";
		if (!getzipdata(zip,binname,true)) throw new Error("Could not find workbook");
		dir.workbooks.push(binname);
		xlsb = true;
	}
	if (dir.workbooks[0].slice(-3) == "bin") xlsb = true;

	var themes = {},
		styles = {};
	if (!opts.bookSheets && !opts.bookProps) {
		strs = [];
		if (dir.sst) {
			try {
				strs = parse_sst_xml(getzipdata(zip, strip_front_slash(dir.sst)), opts);
			} catch(e) {
				if (opts.WTF) throw e;
			}
		}

		if (opts.cellStyles && dir.themes.length) {
			themes = parse_theme_xml(getzipstr(zip, dir.themes[0].replace(/^\//, ""), true) || "", opts);
			// themes = parse_theme(getzipstr(zip, dir.themes[0].replace(/^\//, ''), true)||"", dir.themes[0], opts);
		}

		if (dir.style) {
			styles = parse_sty_xml(getzipdata(zip, strip_front_slash(dir.style)), themes, opts);
		}
	}

	dir.links.map(function(link) {
		try {
			var rels = parse_rels(getzipstr(zip, get_rels_path(strip_front_slash(link))), link);
			return parse_xlink(getzipdata(zip, strip_front_slash(link)), rels, link, opts);
		} catch(e) {}
	});

	var wb = parse_wb_xml(getzipdata(zip, strip_front_slash(dir.workbooks[0])), opts),
		props = {},
		propdata = "";

	if (dir.coreprops.length) {
		propdata = getzipdata(zip, strip_front_slash(dir.coreprops[0]), true);
		if (propdata) props = parse_core_props(propdata);
		if (dir.extprops.length !== 0) {
			propdata = getzipdata(zip, strip_front_slash(dir.extprops[0]), true);
			if (propdata) parse_ext_props(propdata, props, opts);
		}
	}

	var custprops = {};
	if (!opts.bookSheets || opts.bookProps) {
		if (dir.custprops.length !== 0) {
			propdata = getzipstr(zip, strip_front_slash(dir.custprops[0]), true);
			if (propdata) custprops = parse_cust_props(propdata, opts);
		}
	}

	var out = {};
	if (opts.bookSheets || opts.bookProps) {
		if (wb.Sheets) sheets = wb.Sheets.map(x => x.name);
		else if (props.Worksheets && props.SheetNames.length > 0) sheets=props.SheetNames;
		if (opts.bookProps) { out.Props = props; out.Custprops = custprops; }
		if (opts.bookSheets && typeof sheets !== "undefined") out.SheetNames = sheets;
		if (opts.bookSheets ? out.SheetNames : opts.bookProps) return out;
	}
	sheets = {};

	var deps = {};
	if (opts.bookDeps && dir.calcchain) {
		deps = parse_cc(getzipdata(zip, strip_front_slash(dir.calcchain)), dir.calcchain, opts);
	}

	var i = 0,
		sheetRels = {},
		path, relsPath,
		wbsheets = wb.Sheets;

	props.Worksheets = wbsheets.length;
	props.SheetNames = [];
	for(var j=0; j!=wbsheets.length; ++j) {
		props.SheetNames[j] = wbsheets[j].name;
	}

	var wbrelsi = dir.workbooks[0].lastIndexOf("/"),
		wbrelsfile = (dir.workbooks[0].slice(0, wbrelsi+1) +"_rels/"+ dir.workbooks[0].slice(wbrelsi + 1) +".rels").replace(/^\//, "");
	if (!safegetzipfile(zip, wbrelsfile)) wbrelsfile = "xl/_rels/workbook.xml.rels";
	var wbrels = parse_rels(getzipstr(zip, wbrelsfile, true), wbrelsfile);
	if (wbrels) wbrels = safe_parse_wbrels(wbrels, wb.Sheets);

	/* Numbers iOS hack */
	var nmode = (getzipdata(zip,"xl/worksheets/sheet.xml", true)) ? 1 : 0;
	wsloop: for(i = 0; i != props.Worksheets; ++i) {
		var stype = "sheet";
		if (wbrels && wbrels[i]) {
			path = 'xl/' + (wbrels[i][1]).replace(/[\/]?xl\//, "");
			if (!safegetzipfile(zip, path)) path = wbrels[i][1];
			if (!safegetzipfile(zip, path)) path = wbrelsfile.replace(/_rels\/.*$/,"") + wbrels[i][1];
			stype = wbrels[i][2];
		} else {
			path = "xl/worksheets/sheet"+ (i + 1 - nmode) +".xml";
			path = path.replace(/sheet0\./,"sheet.");
		}
		relsPath = path.replace(/^(.*)(\/)([^\/]*)$/, "$1/_rels/$3.rels");
		if (opts && opts.sheets != null) switch(typeof opts.sheets) {
			case "number": if (i != opts.sheets) continue wsloop; break;
			case "string": if (props.SheetNames[i].toLowerCase() != opts.sheets.toLowerCase()) continue wsloop; break;
			default: if (Array.isArray && Array.isArray(opts.sheets)) {
				var snjseen = false;
				for(var snj = 0; snj != opts.sheets.length; ++snj) {
					if (typeof opts.sheets[snj] == "number" && opts.sheets[snj] == i) snjseen=1;
					if (typeof opts.sheets[snj] == "string" && opts.sheets[snj].toLowerCase() == props.SheetNames[i].toLowerCase()) snjseen = 1;
				}
				if (!snjseen) continue wsloop;
			}
		}
		safe_parse_sheet(zip, path, relsPath, props.SheetNames[i], i, sheetRels, sheets, stype, opts, wb, themes, styles);
	}

	out = {
		Directory: dir,
		Workbook: wb,
		Props: props,
		Custprops: custprops,
		Deps: deps,
		Sheets: sheets,
		SheetNames: props.SheetNames,
		Strings: strs,
		Styles: styles,
		Themes: themes,
		SSF: SSF.get_table()
	};
	if (opts && opts.bookFiles) {
		out.keys = entries;
		out.files = zip.files;
	}
	if (opts && opts.bookVBA) {
		if (dir.vba.length > 0) out.vbaraw = getzipdata(zip,strip_front_slash(dir.vba[0]),true);
		else if (dir.defaults && dir.defaults.bin === CT_VBA) out.vbaraw = getzipdata(zip, 'xl/vbaProject.bin',true);
	}
	return out;
}

/* [MS-OFFCRYPTO] 2.1.1 */
function parse_xlsxcfb(cfb, _opts) {
	var opts = _opts || {},
		f = "Workbook",
		data = CFB.find(cfb, f);
	try {
		f = "/!DataSpaces/Version";
		data = CFB.find(cfb, f);
		if (!data || !data.content) {
			throw new Error(`ECMA-376 Encrypted file missing ${f}`);
		}
		parse_DataSpaceVersionInfo(data.content);

		/* 2.3.4.1 */
		f = "/!DataSpaces/DataSpaceMap";
		data = CFB.find(cfb, f);
		if (!data || !data.content) {
			throw new Error(`ECMA-376 Encrypted file missing ${f}`);
		}
		var dsm = parse_DataSpaceMap(data.content);
		if (dsm.length !== 1 || dsm[0].comps.length !== 1 || dsm[0].comps[0].t !== 0 || dsm[0].name !== "StrongEncryptionDataSpace" || dsm[0].comps[0].v !== "EncryptedPackage") {
			throw new Error(`ECMA-376 Encrypted file bad ${f}`);
		}

		/* 2.3.4.2 */
		f = "/!DataSpaces/DataSpaceInfo/StrongEncryptionDataSpace";
		data = CFB.find(cfb, f);
		if (!data || !data.content) {
			throw new Error(`ECMA-376 Encrypted file missing ${f}`);
		}
		var seds = parse_DataSpaceDefinition(data.content);
		if (seds.length != 1 || seds[0] != "StrongEncryptionTransform") {
			throw new Error(`ECMA-376 Encrypted file bad ${f}`);
		}

		/* 2.3.4.3 */
		f = "/!DataSpaces/TransformInfo/StrongEncryptionTransform/!Primary";
		data = CFB.find(cfb, f);
		if (!data || !data.content) {
			throw new Error(`ECMA-376 Encrypted file missing ${f}`);
		}
		parse_Primary(data.content);
	} catch(e) {}

	f = "/EncryptionInfo";
	data = CFB.find(cfb, f);
	if (!data || !data.content) {
		throw new Error(`ECMA-376 Encrypted file missing ${f}`);
	}
	var einfo = parse_EncryptionInfo(data.content);

	/* 2.3.4.4 */
	f = "/EncryptedPackage";
	data = CFB.find(cfb, f);
	if (!data || !data.content) {
		throw new Error(`ECMA-376 Encrypted file missing ${f}`);
	}

	/*global decrypt_agile */
	/*:: declare var decrypt_agile:any; */
	if (einfo[0] == 0x04 && typeof decrypt_agile !== "undefined") {
		return decrypt_agile(einfo[1], data.content, opts.password || "", opts);
	}
	/*global decrypt_std76 */
	/*:: declare var decrypt_std76:any; */
	if (einfo[0] == 0x02 && typeof decrypt_std76 !== "undefined") {
		return decrypt_std76(einfo[1], data.content, opts.password || "", opts);
	}

	throw new Error("File is password-protected");
}


	
function write_zip(wb, opts) {
	// let tmpFiles = [],
	// 	tmp = new jszip();
	// tmpFiles.unshift({ "file": "b", body: "" });
	// Object.keys(hbi_zip.files).map(file => {
	// 	var body = getzipdata(hbi_zip, file);
	// 	tmpFiles.push({ file, body });
	// });
	// tmpFiles.map(item => tmp.file(item.file, item.body));
	// return tmp;

	// _shapeid = 1024;
	if (wb && !wb.SSF) {
		wb.SSF = SSF.get_table();
	}
	if (wb && wb.SSF) {
		make_ssf(SSF);
		SSF.load_table(wb.SSF);
		// $FlowIgnore
		opts.revssf = evert_num(wb.SSF);
		opts.revssf[wb.SSF[65535]] = 0;
		opts.ssf = wb.SSF;
	}
	opts.rels = {};
	opts.wbrels = {};
	opts.Strings = [];
	opts.Strings.Count = 0;
	opts.Strings.Unique = 0;
	opts.revStrings = new Map();
	
	fix_write_opts(opts = opts || {});

	var files = [],
		ct = new_ct(),
		rId = 0;

	opts.cellXfs = [];
	get_cell_style(opts.cellXfs, {}, { revssf: { "General": 0 } });

	if (!wb.Props) wb.Props = {};
	wb.Props.SheetNames = wb.SheetNames;
	wb.Props.Worksheets = wb.Props.SheetNames.length;

	files.unshift({ file: "docProps/core.xml", body: write_core_props(wb.Props, opts)});
	ct.coreprops.push(files[0].file);
	add_rels(opts.rels, 2, files[0].file, RELS.CORE_PROPS);


	files.unshift({ file: "docProps/app.xml", body: write_ext_props(wb.Props, opts)});
	ct.extprops.push(files[0].file);
	add_rels(opts.rels, 3, files[0].file, RELS.EXT_PROPS);


	if (wb.Custprops !== wb.Props && keys(wb.Custprops || {}).length > 0) {
		files.unshift({ file: "docProps/custom.xml", body: write_cust_props(wb.Custprops, opts) });
		ct.custprops.push(files[0].file);
		add_rels(opts.rels, 4, files[0].file, RELS.CUST_PROPS);
	}

	for (rId=1; rId<=wb.SheetNames.length; ++rId) {
		var wsrels = { "!id": {} },
			ws = wb.Sheets[wb.SheetNames[rId - 1]],
			_type = (ws || {})["!type"] || "sheet",
			filename = `xl/worksheets/sheet${rId}.xml`;
		
		switch(_type) {
			case "chart":
				/* falls through */
			default:
				files.unshift({ file: filename, body: write_ws_xml(rId - 1, opts, wb, wsrels) });
				// console.log( files[0].body );
				ct.sheets.push(files[0].file);
				add_rels(opts.wbrels, -1, files[0].file.slice(3), RELS.WS[0]);
		}

		if (ws) {
			var comments = ws["!comments"],
				need_vml = false;
			if (comments && comments.length > 0) {
				files.unshift({ file: `xl/comments${rId}.xml`, body: write_comments_xml(comments, opts) });
				ct.comments.push(files[0].file);
				add_rels(wsrels, -1, ".."+ files[0].file.slice(2), RELS.CMNT);
				need_vml = true;
			}
			if (ws["!legacy"] && need_vml) {
				files.unshift({ file: `xl/drawings/vmlDrawing${rId}.vml`, body: write_comments_vml(rId, ws["!comments"]) });
			}
			delete ws["!comments"];
			delete ws["!legacy"];
		}

		if (wsrels["!id"].rId1) {
			files.unshift({ file: get_rels_path(filename), body: write_rels(wsrels) });
		}
	}

	if (opts.Strings != null && opts.Strings.length > 0) {
		// console.log( write_sst_xml(opts.Strings, opts) );
		files.unshift({ file: `xl/sharedStrings.xml`, body: write_sst_xml(opts.Strings, opts) });
		ct.strs.push(files[0].file);
		add_rels(opts.wbrels, -1, files[0].file.slice(3), RELS.SST);
	}

	files.unshift({ file: `xl/workbook.xml`, body: write_wb_xml(wb, opts) });
	ct.workbooks.push(files[0].file);
	add_rels(opts.rels, 1, files[0].file, RELS.WB);

	/* TODO: something more intelligent with themes */

	files.unshift({ file: `xl/theme/theme1.xml`, body: write_theme(wb.Themes, opts) });
	ct.themes.push(files[0].file);
	add_rels(opts.wbrels, -1, files[0].file.slice(3), RELS.THEME);

	/* TODO: something more intelligent with styles */

	files.unshift({ file: `xl/styles.xml`, body: write_sty_xml(wb, opts) });
	ct.styles.push(files[0].file);
	add_rels(opts.wbrels, -1, files[0].file.slice(3), RELS.STY);

	files.unshift({ file: "_rels/.rels", body: write_rels(opts.rels) });
	files.unshift({ file: "xl/_rels/workbook.xml.rels", body: write_rels(opts.wbrels) });
	files.unshift({ file: "[Content_Types].xml", body: write_ct(ct, opts) });


	let zip = new jszip();
	// temp fix
	if (opts.zip) files.unshift({ "file": "b", body: "" });

	files.map(item => zip.file(item.file, item.body));



	delete opts.revssf;
	delete opts.ssf;

	return zip;
}

	
function firstbyte(f, o) {
	var x = "";
	switch((o || {}).type || "base64") {
		// case "buffer": return [f[0], f[1], f[2], f[3], f[4], f[5], f[6], f[7]];
		// case "base64": x = Base64.decode(f.slice(0,12)); break;
		// case "binary": x = f; break;
		case "array":
			return [f[0], f[1], f[2], f[3], f[4], f[5], f[6], f[7]];
		default:
			throw new Error("Unrecognized type " + (o && o.type || "undefined"));
	}
	return [x.charCodeAt(0), x.charCodeAt(1), x.charCodeAt(2), x.charCodeAt(3), x.charCodeAt(4), x.charCodeAt(5), x.charCodeAt(6), x.charCodeAt(7)];
}

function read_cfb(cfb, opts) {
	if (CFB.find(cfb, "EncryptedPackage")) {
		return parse_xlsxcfb(cfb, opts);
	}
	return parse_xlscfb(cfb, opts);
}

function read_zip(data, opts) {
	var zip,
		d = data,
		o = opts || {};
	if (!o.type) o.type = "base64";
	zip = zip_read(d, o);

	return parse_zip(zip, o);
}

function read_plaintext(data, o) {
	var i = 0;
	main: while(i < data.length) {
		switch(data.charCodeAt(i)) {
			case 0x0A:
			case 0x0D:
			case 0x20: ++i; break;
			case 0x3C: return parse_xlml(data.slice(i),o);
			default: break main;
		}
	}
	return PRN.to_workbook(data, o);
}

function read_plaintext_raw(data, o) {
	var str = "",
		bytes = firstbyte(data, o);
	switch(o.type) {
		case "base64": str = Base64.decode(data); break;
		case "binary": str = data; break;
		case "buffer": str = data.toString("binary"); break;
		case "array": str = cc2str(data); break;
		default: throw new Error("Unrecognized type " + o.type);
	}
	if (bytes[0] == 0xEF && bytes[1] == 0xBB && bytes[2] == 0xBF) {
		str = utf8read(str);
	}
	return read_plaintext(str, o);
}

function read_utf16(data, o) {
	var d = data;
	if (o.type == "base64") d = Base64.decode(d);
	d = cptable.utils.decode(1200, d.slice(2), "str");
	o.type = "binary";
	return read_plaintext(d, o);
}

function bstrify(data) {
	return !data.match(/[^\x00-\x7F]/) ? data : utf8write(data);
}

function read_prn(data, d, o, str) {
	if (str) {
		o.type = "string";
		return PRN.to_workbook(data, o);
	}
	return PRN.to_workbook(d, o);
}

function readSync(data, opts) {
	reset_cp();

	var d = data,
		n = [0,0,0,0],
		str = false,
		o = opts || {};

	if (o.cellStyles) {
		o.cellNF = true;
		o.sheetStubs = true;
	}
	_ssfopts = {};
	if (o.dateNF) _ssfopts.dateNF = o.dateNF;

	if (o.type == "array" && typeof Uint8Array !== "undefined" && data instanceof Uint8Array && typeof ArrayBuffer !== "undefined") {
		// $FlowIgnore
		var ab = new ArrayBuffer(3),
			vu = new Uint8Array(ab);
			vu.foo="bar";
		// $FlowIgnore
		if (!vu.foo) {
			o = dup(o);
			o.type = "array";
			return readSync(ab2a(d), o);
		}
	}
	switch((n = firstbyte(d, o))[0]) {
		case 0xD0: if(n[1] === 0xCF && n[2] === 0x11 && n[3] === 0xE0 && n[4] === 0xA1 && n[5] === 0xB1 && n[6] === 0x1A && n[7] === 0xE1) return read_cfb(CFB.read(d, o), o); break;
		case 0x09: if(n[1] <= 0x04) return parse_xlscfb(d, o); break;
		case 0x3C: return parse_xlml(d, o);
		case 0x49: if(n[1] === 0x44) return read_wb_ID(d, o); break;
		case 0x54: if(n[1] === 0x41 && n[2] === 0x42 && n[3] === 0x4C) return DIF.to_workbook(d, o); break;
		case 0x50: return (n[1] === 0x4B && n[2] < 0x09 && n[3] < 0x09) ? read_zip(d, o) : read_prn(data, d, o, str);
		case 0xEF: return n[3] === 0x3C ? parse_xlml(d, o) : read_prn(data, d, o, str);
		case 0xFF: if(n[1] === 0xFE) { return read_utf16(d, o); } break;
		case 0x00: if(n[1] === 0x00 && n[2] >= 0x02 && n[3] === 0x00) throw new Error("Not supported Workbook"); break;
		case 0x03:
		case 0x83:
		case 0x8B:
		case 0x8C: return DBF.to_workbook(d, o);
		case 0x7B: if(n[1] === 0x5C && n[2] === 0x72 && n[3] === 0x74) return RTF.to_workbook(d, o); break;
		case 0x0A:
		case 0x0D:
		case 0x20: return read_plaintext_raw(d, o);
	}
	if (DBF.versions.indexOf(n[0]) > -1 && n[2] <= 12 && n[3] <= 31) {
		return DBF.to_workbook(d, o);
	}
	return read_prn(data, d, o, str);
}

// function readFileSync(filename, opts) {
// 	var o = opts || {};
// 	o.type = "file";
// 	return readSync(filename, o);
// }

	
/*:: declare var encrypt_agile:any; */
function write_zip_type(wb, opts) {
	var o = opts || {};
	var z = write_zip(wb, o);
	var oopts = { type: "string" };
	var payload = z.generate(oopts);

	// return o.type == "string" ? utf8read(payload) : payload;
	return {
		name: o.file,
		payload,
		toBlob: data => new Blob([ s2ab(data) ], { type: "application/octet-stream" }),
	};
}

function writeSync(wb, opts) {
	reset_cp();
	check_wb(wb);
	var o = opts || {};
	if (o.cellStyles) {
		o.cellNF = true;
		o.sheetStubs = true;
	}
	return write_zip_type(wb, o);
}

function writeFileSync(wb, filename, opts) {
	var o = opts || {};
	o.type = o.type || "file";
	o.file = filename;
	o.bookType = "xlsx";
	return writeSync(wb, o);
}

	
function make_json_row(sheet, r, R, cols, header, hdr, dense, o) {
	var rr = encode_row(R),
		defval = o.defval,
		raw = o.raw || !Object.prototype.hasOwnProperty.call(o, "raw"),
		isempty = true,
		row = (header === 1) ? [] : {};
	
	if (header !== 1) {
		if (Object.defineProperty) {
			try {
				Object.defineProperty(row, "__rowNum__", { value: R, enumerable: false });
			} catch(e) {
				row.__rowNum__ = R;
			}
		} else {
			row.__rowNum__ = R;
		}
	}
	if (!dense || sheet[R]) {
		for (var C=r.s.c; C<=r.e.c; ++C) {
			var val = dense ? sheet[R][C] : sheet[cols[C] + rr];
			if (val === undefined || val.t === undefined) {
				if (defval === undefined) continue;
				if (hdr[C] != null) row[hdr[C]] = defval;
				continue;
			}
			var v = val.v;
			switch (val.t){
				case "z": if (v == null) break; continue;
				case "e": v = void 0; break;
				case "s":
				case "d":
				case "b":
				case "n": break;
				default:
					throw new Error(`unrecognized type ${val.t}`);
			}
			if (hdr[C] != null) {
				if (v == null) {
					if (defval !== undefined) row[hdr[C]] = defval;
					else if (raw && v === null) row[hdr[C]] = null;
					else continue;
				} else {
					row[hdr[C]] = raw || (o.rawNumbers && val.t == "n") ? v : format_cell(val, v, o);
				}
				if (v != null) isempty = false;
			}
		}
	}
	return { row, isempty };
}


function sheet_to_json(sheet, opts) {
	if (sheet == null || sheet["!ref"] == null) return [];
	var val = { t: "n", v: 0 },
		header = 0,
		offset = 1,
		hdr = [],
		v = 0,
		vv = "",
		r = {
			s: { r: 0, c: 0},
			e: { r: 0, c: 0 }
		},
		o = opts || {},
		range = o.range != null ? o.range : sheet["!ref"];

	if (o.header === 1) header = 1;
	else if (o.header === "A") header = 2;
	else if (Array.isArray(o.header)) header = 3;
	else if (o.header == null) header = 0;
	
	switch (typeof range) {
		case "string":
			r = safe_decode_range(range);
			break;
		case "number":
			r = safe_decode_range(sheet["!ref"]);
			r.s.r = range;
			break;
		default:
			r = range;
	}
	
	if (header > 0) offset = 0;
	
	var rr = encode_row(r.s.r),
		cols = [],
		out = [],
		outi = 0, counter = 0,
		dense = Array.isArray(sheet),
		R = r.s.r,
		C = 0,
		CC = 0;
	
	if (dense && !sheet[R]) sheet[R] = [];
	
	for(C = r.s.c; C <= r.e.c; ++C) {
		cols[C] = encode_col(C);
		val = dense ? sheet[R][C] : sheet[cols[C] + rr];
		switch (header) {
			case 1: hdr[C] = C - r.s.c; break;
			case 2: hdr[C] = cols[C]; break;
			case 3: hdr[C] = o.header[C - r.s.c]; break;
			default:
				if (val == null) val = { w: "__EMPTY", t: "s" };
				vv = v = format_cell(val, null, o);
				counter = 0;
				for(CC = 0; CC < hdr.length; ++CC) {
					if (hdr[CC] == vv) {
						vv = v + "_" + (++counter);
					}
				}
				hdr[C] = vv;
		}
	}
	for (R = r.s.r + offset; R <= r.e.r; ++R) {
		var row = make_json_row(sheet, r, R, cols, header, hdr, dense, o);
		if ((row.isempty === false) || (header === 1 ? o.blankrows !== false : !!o.blankrows)) out[outi++] = row.row;
	}
	out.length = outi;
	return out;
}

var qreg = /"/g;

function make_csv_row(sheet, r, R, cols, fs, rs, FS, o) {
	var isempty = true,
		row = [],
		txt = "",
		rr = encode_row(R);
	for(var C=r.s.c; C<=r.e.c; ++C) {
		if (!cols[C]) continue;
		var val = o.dense ? (sheet[R] || [])[C]: sheet[cols[C] + rr];
		if (val == null) txt = "";
		else if (val.v != null) {
			isempty = false;
			txt = ""+ (o.rawNumbers && val.t == "n" ? val.v : format_cell(val, null, o));
			for(var i=0, cc=0; i!==txt.length; ++i) {
				if ((cc = txt.charCodeAt(i)) === fs || cc === rs || cc === 34 || o.forceQuotes) {
					txt = "\""+ txt.replace(qreg, '""') +"\"";
					break;
				}
			}
			if (txt == "ID") txt = '"ID"';
		} else if (val.f != null && !val.F) {
			isempty = false;
			txt = "=" + val.f;
			if (txt.indexOf(",") >= 0) txt = '"'+ txt.replace(qreg, '""') +'"';
		} else {
			txt = "";
		}
		/* NOTE: Excel CSV does not support array formulae */
		row.push(txt);
	}
	if (o.blankrows === false && isempty) {
		return null;
	}
	return row.join(FS);
}

function sheet_to_csv(sheet, opts) {
	var out = [],
		o = opts == null ? {} : opts;
	if (sheet == null || sheet["!ref"] == null) return "";
	
	var r = safe_decode_range(sheet["!ref"]),
		FS = o.FS !== undefined ? o.FS : ",", fs = FS.charCodeAt(0),
		RS = o.RS !== undefined ? o.RS : "\n", rs = RS.charCodeAt(0),
		endregex = new RegExp((FS=="|" ? "\\|" : FS) +"+$"),
		row = "",
		cols = [];
	o.dense = Array.isArray(sheet);
	var colinfo = o.skipHidden && sheet["!cols"] || [],
		rowinfo = o.skipHidden && sheet["!rows"] || [];
	for(var C = r.s.c; C <= r.e.c; ++C) {
		if (!((colinfo[C] || {}).hidden)) {
			cols[C] = encode_col(C);
		}
	}
	for(var R=r.s.r; R<=r.e.r; ++R) {
		if ((rowinfo[R] || {}).hidden) continue;
		row = make_csv_row(sheet, r, R, cols, fs, rs, FS, o);
		if (row == null) continue;
		if (o.strip) row = row.replace(endregex, "");
		out.push(row + RS);
	}
	delete o.dense;
	return out.join("");
}

function sheet_to_txt(sheet, opts) {
	if (!opts) opts = {};
	opts.FS = "\t";
	opts.RS = "\n";
	var s = sheet_to_csv(sheet, opts);
	if (typeof cptable == "undefined" || opts.type == "string") return s;
	var o = cptable.utils.encode(1200, s, "str");
	return String.fromCharCode(255) + String.fromCharCode(254) + o;
}

function sheet_to_formulae(sheet) {
	var y = "",
		x,
		val="";
	if (sheet == null || sheet["!ref"] == null) return [];
	var r = safe_decode_range(sheet['!ref']),
		rr = "",
		cols = [],
		C,
		cmds = [],
		dense = Array.isArray(sheet);
	for(C=r.s.c; C<=r.e.c; ++C) {
		cols[C] = encode_col(C);
	}
	for(var R=r.s.r; R<=r.e.r; ++R) {
		rr = encode_row(R);
		for(C=r.s.c; C<=r.e.c; ++C) {
			y = cols[C] + rr;
			x = dense ? (sheet[R] || [])[C] : sheet[y];
			val = "";
			if (x === undefined) continue;
			else if (x.F != null) {
				y = x.F;
				if (!x.f) continue;
				val = x.f;
				if (y.indexOf(":") == -1) {
					y = y +":"+ y;
				}
			}
			if (x.f != null) val = x.f;
			else if (x.t == "z") continue;
			else if (x.t == "n" && x.v != null) val = ""+ x.v;
			else if (x.t == "b") val = x.v ? "TRUE" : "FALSE";
			else if (x.w !== undefined) val = "'"+ x.w;
			else if (x.v === undefined) continue;
			else if (x.t == "s") val = "'"+ x.v;
			else val = ""+ x.v;
			cmds[cmds.length] = y + "="+ val;
		}
	}
	return cmds;
}

function sheet_add_json(_ws, js, opts) {
	var o = opts || {},
		offset = +!o.skipHeader,
		ws = _ws || {},
		_R = 0,
		_C = 0;
	if (ws && o.origin != null) {
		if (typeof o.origin == "number") _R = o.origin;
		else {
			var _origin = typeof o.origin == "string" ? decode_cell(o.origin) : o.origin;
			_R = _origin.r;
			_C = _origin.c;
		}
	}
	var cell,
		range = {
			s: { c: 0, r: 0 },
			e: { c: _C, r: _R + js.length - 1 + offset }
		};
	if (ws["!ref"]) {
		var _range = safe_decode_range(ws["!ref"]);
		range.e.c = Math.max(range.e.c, _range.e.c);
		range.e.r = Math.max(range.e.r, _range.e.r);
		if (_R == -1) {
			_R = _range.e.r + 1;
			range.e.r = _R + js.length - 1 + offset;
		}
	} else {
		if (_R == -1) {
			_R = 0;
			range.e.r = js.length - 1 + offset;
		}
	}
	var hdr = o.header || [],
		C = 0;

	js.forEach(function(JS, R) {
		keys(JS).forEach(function(k) {
			if ((C=hdr.indexOf(k)) == -1) hdr[C=hdr.length] = k;
			var v = JS[k],
				t = "z",
				z = "",
				ref = encode_cell({ c: _C + C, r: _R + R + offset });
			cell = utils.sheet_get_cell(ws, ref);

			if (v && typeof v === "object" && !(v instanceof Date)) {
				ws[ref] = v;
			} else {
				if (typeof v == "number") t = "n";
				else if (typeof v == "boolean") t = "b";
				else if (typeof v == "string") t = "s";
				else if (v instanceof Date) {
					t = "d";
					if (!o.cellDates) { t = 'n'; v = datenum(v); }
					z = (o.dateNF || SSF._table[14]);
				}
				if (!cell) ws[ref] = cell = { t, v };
				else {
					cell.t = t;
					cell.v = v;
					delete cell.w;
					delete cell.R;
					if (z) cell.z = z;
				}
				if (z) cell.z = z;
			}
		});
	});

	range.e.c = Math.max(range.e.c, _C + hdr.length - 1);
	var __R = encode_row(_R);
	if (offset) {
		for (C=0; C<hdr.length; ++C) {
			ws[encode_col(C + _C) + __R] = { t: "s", v: hdr[C] };
		}
	}
	ws["!ref"] = encode_range(range);
	return ws;
}

function json_to_sheet(js, opts) {
	return sheet_add_json(null, js, opts);
}

var utils = {
	encode_col,
	encode_row,
	encode_cell,
	encode_range,
	decode_col,
	decode_row,
	split_cell,
	decode_cell,
	decode_range,
	format_cell,
	sheet_add_aoa,
	sheet_add_json,
	sheet_add_dom,
	aoa_to_sheet,
	json_to_sheet,
	table_to_book,
	sheet_to_csv,
	sheet_to_txt,
	sheet_to_json,
	sheet_to_formulae,
	get_formulae: sheet_to_formulae,
	parseFormula: parseFormula,
	evalFormula: evalFormula,
	make_csv: sheet_to_csv,
	make_json: sheet_to_json,
	make_formulae: sheet_to_formulae,
	table_to_sheet: parse_dom_table,
	book_to_xml: HTML_.book_to_xml,
	sheet_to_row_object_array: sheet_to_json
};


	
(function(utils) {

	function add_consts(R) {
		R.forEach(a => { utils.consts[a[0]] = a[1]; });
	}

	function get_default(x, y, z) {
		return x[y] != null ? x[y] : (x[y] = z);
	}

	/* get cell, creating a stub if necessary */
	function ws_get_cell_stub(ws, R, C) {
		/* A1 cell address */
		if (typeof R == "string") {
			/* dense */
			if (Array.isArray(ws)) {
				var RC = decode_cell(R);
				if (!ws[RC.r]) ws[RC.r] = [];
				return ws[RC.r][RC.c] || (ws[RC.r][RC.c] = { t: "z" });
			}
			return ws[R] || (ws[R] = { t: "z" });
		}
		/* cell address object */
		if (typeof R != "number") {
			return ws_get_cell_stub(ws, encode_cell(R));
		}
		/* R and C are 0-based indices */
		return ws_get_cell_stub(ws, encode_cell({ r: R, c: C || 0 }));
	}

	/* find sheet index for given name / validate index */
	function wb_sheet_idx(wb, sh) {
		if (typeof sh == "number") {
			if (sh >= 0 && wb.SheetNames.length > sh) return sh;
			throw new Error(`Cannot find sheet # ${sh}`);
		} else if (typeof sh == "string") {
			var idx = wb.SheetNames.indexOf(sh);
			if (idx > -1) return idx;
			throw new Error(`Cannot find sheet name |${sh}|`);
		} else {
			throw new Error(`Cannot find sheet |${sh}|`);
		}
	}

	utils.consts = utils.consts || {};
	utils.sheet_get_cell = ws_get_cell_stub;

	/* simple blank workbook object */
	utils.book_new = () => ({ SheetNames: [], Sheets: {} });

	/* add a worksheet to the end of a given workbook */
	utils.book_append_sheet = function(wb, ws, name) {
		if (!name) {
			for (var i=1; i<=0xFFFF; ++i, name=undefined) {
				if (wb.SheetNames.indexOf(name = "Sheet"+ i) == -1) break;
			}
		}
		if (!name || wb.SheetNames.length >= 0xFFFF) {
			throw new Error("Too many worksheets");
		}
		check_ws_name(name);
		if (wb.SheetNames.indexOf(name) >= 0) {
			throw new Error(`Worksheet with name |${name}| already exists!`);
		}
		wb.SheetNames.push(name);
		wb.Sheets[name] = ws;
	};

	/* set sheet visibility (visible/hidden/very hidden) */
	utils.book_set_sheet_visibility = function(wb, sh, vis) {
		get_default(wb,"Workbook", {});
		get_default(wb.Workbook, "Sheets", []);

		var idx = wb_sheet_idx(wb, sh);
		// $FlowIgnore
		get_default(wb.Workbook.Sheets,idx, {});

		switch(vis) {
			case 0:
			case 1:
			case 2: break;
			default:
				throw new Error(`Bad sheet visibility setting ${vis}`);
		}
		// $FlowIgnore
		wb.Workbook.Sheets[idx].Hidden = vis;
	};

	add_consts([
		["SHEET_VISIBLE", 0],
		["SHEET_HIDDEN", 1],
		["SHEET_VERY_HIDDEN", 2]
	]);

	/* set number format */
	utils.cell_set_number_format = function(cell, fmt) {
		cell.z = fmt;
		return cell;
	};

	/* set cell hyperlink */
	utils.cell_set_hyperlink = function(cell, target, tooltip) {
		if (!target) {
			delete cell.l;
		} else {
			cell.l = { Target: target };
			if (tooltip) cell.l.Tooltip = tooltip;
		}
		return cell;
	};

	utils.cell_set_internal_link = function(cell, range, tooltip) {
		return utils.cell_set_hyperlink(cell, "#"+ range, tooltip);
	};

	/* add to cell comments */
	utils.cell_add_comment = function(cell, text, author) {
		if (!cell.c) cell.c = [];
		cell.c.push({ t: text, a: author || "SheetJS" });
	};

	/* set array formula and flush related cells */
	utils.sheet_set_array_formula = function(ws, range, formula) {
		var rng = typeof range != "string" ? range : safe_decode_range(range),
			rngstr = typeof range == "string" ? range : encode_range(range);
		for (var R=rng.s.r; R<= rng.e.r; ++R) {
			for (var C=rng.s.c; C<=rng.e.c; ++C) {
				var cell = ws_get_cell_stub(ws, R, C);
				cell.t = "n";
				cell.F = rngstr;
				delete cell.v;
				if (R == rng.s.r && C == rng.s.c) cell.f = formula;
			}
		}
		return ws;
	};

	return utils;

})(utils);


	XLSX.parseZip = parse_zip;
	XLSX.read = readSync;
	XLSX.write = writeFileSync;
	XLSX.utils = utils;
	XLSX.SSF = SSF;

	return XLSX;

})();

module.exports = XLSX;

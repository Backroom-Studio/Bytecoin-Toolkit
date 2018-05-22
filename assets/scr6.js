var cnUtil = (function() {

  var hashStateSize = 200;
  var hashSize = 32;
  var addressChecksumSize = 4;
  var structSizes = {
    GE_P3: 160,
    GE_P2: 120,
    GE_P1P1: 160,
    GE_CACHED: 160,
    EC_SCALAR: 32,
    EC_POINT: 32,
    KEY_IMAGE: 32,
    GE_DSMP: 160 * 8,
    SIGNATURE: 64
  };

  this.create_address = function(addressPrefix, seed) {
    var keys = {};
    var first;
    if(seed.length !== 64) {
      first = this.keccak(seed, seed.length / 2, 32);
    }
    else {
      first = seed;
    }

    keys.spend = this.generate_keys(first);
    var second = this.keccak(first, 32, 32);
    var prefix = this.encode_varint(addressPrefix);
    keys.view = this.generate_keys(second);
    keys.address = this.pubkeys_to_string(prefix, keys.spend.pub, keys.view.pub);
	//var privateKeyBase = prefix + keys.spend.pub + keys.view.pub + keys.spend.sec + keys.view.sec; // Karbowanec Private Key Base - original XDN paperwallet had a bug here
    //var checksum = this.cn_fast_hash(privateKeyBase).slice(0, addressChecksumSize * 2);
    //keys.privateKey = cnBase58.encode(privateKeyBase + checksum);
	
	// This is Bytecoin GUI style Keys
	//keys.privateKey = keys.spend.pub + keys.view.pub + keys.spend.sec + keys.view.sec;
        //This is EGN simplewallet restore format
	keys.privateKey = keys.spend.sec; //Private Spend Key
	

	//var trackingKeyBase = keys.spend.pub + keys.view.pub + '0000000000000000000000000000000000000000000000000000000000000000' + keys.view.sec; // Private View Key
	var trackingKeyBase =  keys.view.sec; // Private View Key
	
	// var trackchecksum = this.cn_fast_hash(trackingKeyBase).slice(0, addressChecksumSize * 2);
    // keys.trackingKey = cnBase58.encode(trackingKeyBase + trackchecksum);	
	// For tracking wallets we use BCN style tracking keys to make them look different from private keys
	
	keys.trackingKey = trackingKeyBase;
	
    return keys;
  };

  this.valid_hex = function(hex) {
    return /[0-9a-fA-F]+/.test(hex);
  };

  function hextobin(hex) {
    if(hex.length % 2 !== 0) {
      throw "Hex string has invalid length!";
    }
    var res = new Uint8Array(hex.length / 2);
    for(var i = 0; i < hex.length / 2; ++i) {
      res[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return res;
  }

  function bintohex(bin) {
    var out = [];
    for(var i = 0; i < bin.length; ++i) {
      out.push(("0" + bin[i].toString(16)).slice(-2));
    }
    return out.join("");
  }

  this.sc_reduce = function(hex) {
    var input = hextobin(hex);
    if(input.length !== 64) {
      throw "Invalid input length";
    }
    var mem = Module._malloc(64);
    Module.HEAPU8.set(input, mem);
    Module.ccall('sc_reduce', 'void', ['number'], [mem]);
    var output = Module.HEAPU8.subarray(mem, mem + 64);
    Module._free(mem);
    return bintohex(output);
  };

  this.sc_reduce32 = function(hex) {
    var input = hextobin(hex);
    if(input.length !== 32) {
      throw "Invalid input length";
    }
    var mem = Module._malloc(32);
    Module.HEAPU8.set(input, mem);
    Module.ccall('sc_reduce32', 'void', ['number'], [mem]);
    var output = Module.HEAPU8.subarray(mem, mem + 32);
    Module._free(mem);
    return bintohex(output);
  };

  this.ge_scalarmult_base = function(hex) {
    var input = hextobin(hex);
    if(input.length !== 32) {
      throw "Invalid input length";
    }
    var input_mem = Module._malloc(32);
    Module.HEAPU8.set(input, input_mem);
    var ge_p3 = Module._malloc(structSizes.GE_P3);
    Module.ccall('ge_scalarmult_base', 'void', ['number', 'number'], [ge_p3, input_mem]);
    var output = Module.HEAPU8.subarray(ge_p3, ge_p3 + structSizes.GE_P3);
    Module._free(input_mem);
    Module._free(ge_p3);
    return bintohex(output);
  };

  this.ge_p3_tobytes = function(hex) {
    var input = hextobin(hex);
    if(input.length !== structSizes.GE_P3) {
      throw "Invalid input length";
    }
    var ge_p3 = Module._malloc(structSizes.GE_P3);
    Module.HEAPU8.set(input, ge_p3);
    var out_mem = Module._malloc(32);
    Module.ccall('ge_p3_tobytes', 'void', ['number', 'number'], [out_mem, ge_p3]);
    var output = Module.HEAPU8.subarray(out_mem, out_mem + 32);
    Module._free(ge_p3);
    Module._free(out_mem);
    return bintohex(output);
  };

  this.cn_fast_hash = function(input, inlen) {
    if(inlen === undefined || !inlen) {
      inlen = Math.floor(input.length / 2);
    }
    if(input.length !== inlen * 2) {
      console.log("Input length not equal to specified");
    }
    var state = this.keccak(input, inlen, hashStateSize);
    return state.substr(0, hashSize * 2);
  };

  this.encode_varint = function(i) {
    i = new JSBigInt(i);
    var out = '';
    // While i >= b10000000
    while(i.compare(0x80) >= 0) {
      // out.append i & b01111111 | b10000000
      out += ("0" + ((i.lowVal() & 0x7f) | 0x80).toString(16)).slice(-2);
      i = i.divide(new JSBigInt(2).pow(7));
    }
    out += ("0" + i.toJSValue().toString(16)).slice(-2);
    return out;
  };

  this.pubkeys_to_string = function(prefix, spend, view) {
    var data = prefix + spend + view;
    var checksum = this.cn_fast_hash(data);
    return cnBase58.encode(data + checksum.slice(0, addressChecksumSize * 2));
  };

  // Generate keypair from seed
  this.generate_keys = function(seed) {
    if(seed.length !== 64) {
      throw "Invalid input length!";
    }
    var sec = this.sc_reduce32(seed);
    var point = this.ge_scalarmult_base(sec);
    var pub = this.ge_p3_tobytes(point);
    return {
      'sec': sec,
      'pub': pub
    };
  };

  this.keccak = function(hex, inlen, outlen) {
    var input = hextobin(hex);
    if(input.length !== inlen) {
      throw "Invalid input length";
    }
    if(outlen <= 0) {
      throw "Invalid output length";
    }
    var input_mem = Module._malloc(inlen);
    Module.HEAPU8.set(input, input_mem);
    var out_mem = Module._malloc(outlen);
    Module._keccak(input_mem, inlen | 0, out_mem, outlen | 0);
    var output = Module.HEAPU8.subarray(out_mem, out_mem + outlen);
    Module._free(input_mem);
    Module._free(out_mem);
    return bintohex(output);
  };

  return this;
})();

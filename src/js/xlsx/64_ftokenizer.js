
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
							r = VISITOR.enterFunction(item)
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



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
